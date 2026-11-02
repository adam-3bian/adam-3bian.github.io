import * as THREE from 'three';
import { AssetFactory, setSignalAspect, setCrossingState } from './assets.js';
import { packetGeometry } from './batch.js';
import { RouteGeometry, Polyline, CurvePath, clamp } from '../core/geometry.js';
import { trackBasis, roadBasis } from '../core/pose.js';
import { routeResourceUrl } from '../core/resource-url.js';
import { makeSwitch, setSwitchBlend } from './trackwork.js';
import { ViewportSizing } from './viewport.js';
import { crossingShear } from '../world/orientation.js';
/** Send only the information needed to compose scenery to the worker. The
 * authoritative grid/graph and source metadata stay in the main world. */
export function sceneryWorkerData(data) {
    const {network,gridPieces,railwayGraph,railJunctions,construction,kidderminsterHeritage,stationCompositions,generation,...world}=data;
    void network;void gridPieces;void railwayGraph;void railJunctions;void construction;void kidderminsterHeritage;void stationCompositions;void generation;
    world.surfaceRoads=(data.surfaceRoads||[]).map(road=>{const {occupancy,portVectors,minLevel,maxLevel,asset,sourceAliases,legacyPoints,sourceTags,...sceneRoad}=road;return sceneRoad;});
    return world;
}
export class RailwayRenderer {
    container;
    data;
    route;
    sim;
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(62, 1, .2, 2400);
    factory = new AssetFactory();
    get roadTraffic() { return this.sim.roadTraffic; }
    loopFootGeometry = new THREE.BoxGeometry(.18, .25, .18);
    loopFootMaterial = new THREE.MeshStandardMaterial({ color: 0x525b54, roughness: .95 });
    renderer;
    viewport;
    worker;
    ready = false;
    loaded = new Map();
    requested = new Set();
    tileRetries = new Map();
    requestTokens = new Map();
    requestTimers = new Map();
    requestAborts = new Map();
    tileProgress = new Map();
    initialisationTimer;
    nextRequestToken = 0;
    terrainSource;
    workerFailures = 0;
    disposed = false;
    adjacent = [];
    walkers = new Map();
    signalModels = new Map();
    pointModels = new Map();
    crossingModels = new Map();
    trainModels = new Map();
    carModels = new Map();
    fog = new THREE.Fog(0xcdd6cc, 450, 1700);
    sun = new THREE.DirectionalLight(0xffedcf, 3);
    ambient = new THREE.HemisphereLight(0xd6e5ec, 0x79865b, 2.7);
    gpuInfo = 'WebGL 2';
    tileCount = 0;
    triangles = 0;
    placements = 0;
    failures = [];
    frameTimes = [];
    onProgress;
    onError;
    tileSource;
    contextLost = (event) => { event.preventDefault(); if (this.disposed)
        return; const error = new Error('Graphics context lost. Reload to reconnect graphics.'); this.failures.push(error.message); this.sim.paused = true; this.onError?.(error); };
    quality = 'balanced';
    lastS = -Infinity;
    previousCamera = new THREE.Vector3();
    firstFrame = true;
    warmFrames = 0;
    constructor(container, data, route, sim) {
        this.container = container;
        this.data = data;
        this.route = route;
        this.sim = sim;
        const canvas = document.createElement('canvas');
        let context = null;
        try {
            context = canvas.getContext('webgl2', { antialias: true, alpha: false, powerPreference: 'high-performance' });
        }
        catch { /* Report a consistent unsupported-device message below. */ }
        if (!context)
            throw new Error('WebGL 2 is unavailable. Enable hardware acceleration or use a current browser with WebGL 2 support.');
        this.renderer = new THREE.WebGLRenderer({ canvas, context, antialias: true, alpha: false, powerPreference: 'high-performance' });
        canvas.addEventListener('webglcontextlost', this.contextLost);
        this.gpuInfo = String(context.getParameter(context.RENDERER) || 'WebGL 2');
        this.renderer.setPixelRatio(.5);
        this.renderer.setClearColor(0xcdd6cc);
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.0;
        this.renderer.shadowMap.enabled = true;
        this.scene.background = new THREE.Color(0xcdd6cc);
        this.scene.fog = this.fog;
        this.scene.add(this.ambient, this.sun);
        this.sun.position.set(-140, 250, -80);
        this.sun.castShadow = true;
        this.sun.shadow.mapSize.set(1024, 1024);
        Object.assign(this.sun.shadow.camera, { left: -95, right: 95, top: 95, bottom: -95, near: 1, far: 650 });
        this.sun.shadow.bias = -.0005;
        this.sun.shadow.normalBias = .12;
        this.sun.shadow.camera.updateProjectionMatrix();
        this.scene.add(this.sun.target);
        this.container.appendChild(this.renderer.domElement);
        this.renderer.domElement.setAttribute('aria-label', 'View from the front of the train');
        this.worker = this.createWorker();
        this.viewport = new ViewportSizing(this.container, this.renderer, this.camera, Number(context.getParameter(context.MAX_RENDERBUFFER_SIZE)) || 8192);
    }
    async init(terrain) {
        if (this.renderer.getContext().isContextLost())
            throw new Error('The WebGL 2 context was lost. Reload to reconnect graphics.');
        let services = this.data.adjacentServices;
        if (!services) {
            const response = await fetch(routeResourceUrl('data/adjacent-services.json', document.baseURI));
            if (response.ok)
                services = (await response.json()).services;
        }
        this.data.adjacentServices = services || [];
        for (const service of services || []) {
            if (service.metadata?.sceneryOnly)
                continue;
            const kind = service.kind === 'shuttle' ? '139' : service.kind === 'tram' ? 'metro' : service.kind === 'heritage' ? 'heritage' : 'emu';
            const model = this.factory.train({ id: service.id, kind, cars: service.cars });
            this.scene.add(model);
            this.adjacent.push({ data: service, path: new CurvePath(service.points), model });
        }
        this.terrainSource = terrain;
        this.initialiseWorker();
        this.makeInfrastructure();
    }
    createWorker() {
        const worker = new Worker(new URL('../world/world.worker.js', import.meta.url), { type: 'module' });
        worker.onmessage = e => { if (worker === this.worker && !this.disposed)
            this.onWorker(e.data); };
        worker.onerror = e => { e.preventDefault(); if (worker === this.worker && !this.disposed)
            this.restartWorker(e.message || 'World worker failed'); };
        return worker;
    }
    initialiseWorker() { if (!this.terrainSource)
        return;
        if (this.initialisationTimer !== undefined) window.clearTimeout(this.initialisationTimer);
        const worker=this.worker,terrain=this.terrainSource.slice(0);
        this.initialisationTimer=window.setTimeout(()=>{if(this.worker===worker&&!this.ready)this.restartWorker('Scenery worker initialisation timed out');},90000);
        worker.postMessage({ type: 'init', route: sceneryWorkerData(this.data), terrain }, [terrain]); }
    restartWorker(reason) {
        this.ready = false;
        if (this.initialisationTimer !== undefined) window.clearTimeout(this.initialisationTimer);
        this.initialisationTimer = undefined;
        this.worker.terminate();
        for (const id of [...this.requested])
            this.tileFailed(id, reason);
        if (++this.workerFailures >= 4 || !this.terrainSource) {
            const error = `Scenery worker could not recover: ${reason}. Reload and try again.`;
            this.failures.push(error);
            this.onError?.(new Error(error));
            return;
        }
        this.worker = this.createWorker();
        this.initialiseWorker();
    }
    clearRequest(id) {
        const timer = this.requestTimers.get(id);
        if (timer !== undefined)
            window.clearTimeout(timer);
        this.requestTimers.delete(id);
        this.requestAborts.get(id)?.abort();
        this.requestAborts.delete(id);
        this.requestTokens.delete(id);
        this.requested.delete(id);
        this.tileProgress.delete(id);
    }
    refreshTileTimeout(id, token) {
        const old=this.requestTimers.get(id);if(old!==undefined)window.clearTimeout(old);
        const timer=window.setTimeout(()=>{if(this.requestTokens.get(id)===token)this.restartWorker(`Tile ${id} generation timed out because it stopped responding`);},90000);
        this.requestTimers.set(id,timer);
    }
    onWorker(message) {
        if (message.type === 'ready') {
            if (this.initialisationTimer !== undefined) window.clearTimeout(this.initialisationTimer);
            this.initialisationTimer = undefined;
            this.ready = true;
            this.updateTiles(true);
            return;
        }
        if (message.type === 'tile' && typeof message.id !== 'string')
            return;
        if (message.id && (!this.requestTokens.has(message.id) || message.token !== this.requestTokens.get(message.id)))
            return;
        if (message.type === 'progress' && typeof message.id === 'string' && Number.isFinite(message.fraction)) {
            const fraction=clamp(message.fraction,0,1),previous=this.tileProgress.get(message.id) ?? 0;
            if(fraction>previous){this.tileProgress.set(message.id,fraction);this.refreshTileTimeout(message.id,message.token);this.onProgress?.();}
            return;
        }
        if (message.type === 'error') {
            const error = message.error || message.message || 'World generation failed.';
            if (message.id)
                this.tileFailed(message.id, error);
            else
                this.restartWorker(error);
            return;
        }
        if (message.type !== 'tile')
            return;
        const packet = message.mesh || message.result?.mesh;
        if (!packet) {
            if (message.id)
                this.tileFailed(message.id, 'Worker returned no geometry');
            return;
        }
        if (!(packet.position instanceof Float32Array) || !(packet.normal instanceof Float32Array) || !(packet.color instanceof Float32Array) || !(packet.index instanceof Uint32Array) || !packet.position.length || packet.position.length % 3 !== 0 || packet.normal.length !== packet.position.length || packet.color.length !== packet.position.length || !packet.index.length || packet.index.length % 3 !== 0) {
            if (message.id)
                this.tileFailed(message.id, 'Worker returned malformed geometry');
            return;
        }
        let geometry;
        try {
            geometry = packetGeometry(packet);
        }
        catch (error) {
            if (message.id)
                this.tileFailed(message.id, `Invalid geometry: ${error instanceof Error ? error.message : String(error)}`);
            return;
        }
        this.clearRequest(message.id);
        this.workerFailures = 0;
        this.tileRetries.delete(message.id);
        const material = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .94, metalness: 0, side: THREE.DoubleSide, flatShading: true });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.receiveShadow = true;
        mesh.castShadow = true;
        mesh.name = `tile:${message.id}`;
        this.scene.add(mesh);
        this.loaded.set(message.id, { mesh, used: performance.now(), walkers: [] });
        this.tileCount = this.loaded.size;
        this.triangles += packet.index.length / 3;
        this.placements += (message.placements || []).length;
        for (const walker of message.pedestrianPaths || []) {
            this.loaded.get(message.id).walkers.push(walker.id);
            const existing = this.walkers.get(walker.id);
            if (existing) {
                existing.tiles.add(message.id);
                continue;
            }
            const model = this.factory.furniture('person', { id: walker.id, color: walker.role === 'staff' ? 0xd0a34c : 0x61738a });
            this.scene.add(model);
            this.walkers.set(walker.id, { path: new Polyline(walker.points), model, speed: walker.speed || .7, phase: hashId(walker.id) % 20, tiles: new Set([message.id]) });
        }
        this.evictInactiveTiles();
        this.onProgress?.();
        this.updateTiles(true);
    }
    tileFailed(id, reason) {
        this.clearRequest(id);
        const attempts = (this.tileRetries.get(id)?.attempts ?? 0) + 1;
        const next = performance.now() + Math.min(4000, 250 * 2 ** (attempts - 1));
        this.tileRetries.set(id, { attempts, next, reason });
        if (attempts >= 4) {
            const error = `Scenery tile ${id} failed after ${attempts} attempts: ${reason}`;
            this.failures.push(error);
            this.onError?.(new Error(error));
            return;
        }
        window.setTimeout(() => { if (!this.disposed)
            this.updateTiles(true); }, Math.max(1, Math.ceil(next - performance.now()) + 1));
        this.updateTiles(true);
    }
    setQuality(quality) { this.quality = quality; this.renderer.shadowMap.enabled = quality !== 'low'; this.updateTiles(true); }
    setRenderScale(scale) { this.viewport.setScale(scale); }
    discardRoadModel(model) {
        this.scene.remove(model);
        // Vehicle bodies use shared geometry and materials. Only the optional
        // taxi lettering has geometry owned by an individual vehicle.
        model.traverse(node => { if (node.userData.geometricLettering) node.geometry.dispose(); });
    }
    resetTraffic() { for (const model of this.carModels.values())
        this.discardRoadModel(model); this.carModels.clear(); }
    preparationTileIds() { const p = this.route.lanePose(this.sim.player.s, this.sim.player.lane).position; return this.data.tiles.filter(t => Math.hypot(Math.max(t.bounds[0] - p[0], 0, p[0] - t.bounds[2]), Math.max(t.bounds[1] - p[2], 0, p[2] - t.bounds[3])) < 250).map(t => t.id); }
    preparationProgress() { const needed=this.preparationTileIds(); return { loaded: needed.filter(id => this.loaded.has(id)).length, total: needed.length, progress: needed.reduce((sum,id)=>sum+(this.loaded.has(id)?1:this.tileProgress.get(id)||0),0), failed: needed.find(id => !this.loaded.has(id) && (this.tileRetries.get(id)?.attempts ?? 0) >= 4) }; }
    cancelObsoleteTile() {
        if(!this.ready)return;
        const needed=new Set(this.preparationTileIds()),obsolete=[...this.requested].filter(id=>!needed.has(id));
        if(!obsolete.length)return;
        const building=obsolete.some(id=>this.requestTimers.has(id));
        for(const id of obsolete)this.clearRequest(id);
        if(building){this.ready=false;this.worker.terminate();this.worker=this.createWorker();this.initialiseWorker();}
    }
    async preparePosition(progress) { this.cancelObsoleteTile?.(); this.updateTiles(true); await new Promise((resolve, reject) => { let lastChange = performance.now(), lastProgress = -1; const check = () => { const state = this.preparationProgress(), amount=state.progress ?? state.loaded; if(amount!==lastProgress){lastProgress=amount;lastChange=performance.now();} progress?.(state.loaded, state.total, amount); if (state.total > 0 && state.loaded === state.total)
        resolve();
    else if (state.failed)
        reject(new Error(`Scenery tile ${state.failed} failed: ${this.tileRetries.get(state.failed)?.reason || 'world generation failed'}`));
    else if (performance.now() - lastChange > 90000)
        reject(new Error('The departure scenery could not be prepared. Reload and try again.'));
    else
        setTimeout(check, 150); }; check(); }); }
    place(group, s, offset = 0, reverse = false) { const pose = this.route.sample(s, offset); group.position.fromArray(pose.position); group.rotation.set(pose.pitch, pose.yaw + (reverse ? Math.PI : 0), -pose.bank); this.scene.add(group); }
    placeOnLane(group, s, lane, side = 0, dy = 0, reverse = false) { const p = this.route.lanePose(s, lane); group.position.set(p.position[0] + p.right[0] * side, p.position[1] + dy, p.position[2] + p.right[2] * side); group.rotation.y = p.yaw + (reverse ? Math.PI : 0); this.scene.add(group); }
    placeRailDevice(group, s, lane, dy, direction) { const pose = this.route.lanePose(s, lane), axes = trackBasis(pose, direction); group.position.set(...pose.position).addScaledVector(new THREE.Vector3(...axes.up), dy); orient(group, axes); this.scene.add(group); }
    makeInfrastructure() {
        for (const signal of this.sim.signals) {
            const group = this.factory.signal({ id: signal.id, aspect: 'red', aspects: signal.aspects });
            this.placeOnLane(group, signal.s, signal.lane, -signal.direction * 2.1, -.4, signal.direction === -1);
            this.signalModels.set(signal.id, group);
            for (const d of [200, 74, 70, 1.2, 0]) {
                const device = this.factory.furniture(d === 200 ? 'aws' : 'tpws', { id: `${signal.id}/${d === 200 ? 'aws' : 'tpws-' + d}`, source: signal.source });
                if (d !== 200) {
                    const anchors = [];
                    for (const x of [-.5, .5])
                        for (const z of [-.42, .42]) {
                            const foot = new THREE.Mesh(this.loopFootGeometry, this.loopFootMaterial);
                            foot.position.set(x, -.12, z);
                            foot.userData.componentId = `${device.userData.id}/bed-mount/${x}/${z}`;
                            foot.castShadow = true;
                            foot.receiveShadow = true;
                            device.add(foot);
                            anchors.push([x, -.245, z]);
                        }
                    device.userData.supportAnchors = anchors;
                    device.userData.parentSupport = 'rail-bed';
                    device.userData.intentionalIntersections = 'Footings extend 45 mm into nominal ballast, allowing for local grade.';
                    device.updateMatrixWorld(true);
                    const bounds = new THREE.Box3().setFromObject(device);
                    device.userData.bounds = { min: bounds.min.toArray(), max: bounds.max.toArray() };
                }
                const s = this.route.travel(signal.s, -signal.direction * d, signal.lane);
                this.placeRailDevice(device, s, signal.lane, d === 200 ? -.22 : -.09, signal.direction);
            }
        }
        for (const point of this.sim.trackwork.switches) {
            const group = makeSwitch(point);
            this.scene.add(group);
            this.pointModels.set(point.id, group);
        }
        for (const crossing of this.sim.crossings) {
            const spacing = Math.abs(this.route.laneOffset(crossing.s, 4.2)), track = this.route.sample(crossing.s);
            const road = [...this.sim.roadTraffic.roads.values()].filter(r => r.mode === 'crossing' && r.routeS !== undefined && r.crossingS !== undefined && Math.abs(r.routeS - crossing.s) < 60).sort((a, b) => Math.abs(a.routeS - crossing.s) - Math.abs(b.routeS - crossing.s))[0];
            const roadPose = road?.path.sample(road.crossingS);
            const group = this.factory.crossing({ id: crossing.id, width: road?.width ?? 7, tracks: 2, trackSpacing: spacing, roadShear: roadPose ? crossingShear(track, roadPose.tangent) : 0 });
            this.place(group, crossing.s, this.route.laneOffset(crossing.s, 4.2) / 2);
            this.crossingModels.set(crossing.id, group);
        }
    }
    async updateTiles(force = false) {
        if (!this.ready)
            return;
        const s = this.sim.player.s;
        if (!force && Math.abs(s - this.lastS) < 100)
            return;
        this.lastS = s;
        const pos = this.route.sample(s).position;
        const radius = this.quality === 'high' ? 1750 : this.quality === 'low' ? 900 : 1300;
        const now = performance.now();
        const tiles = this.data.tiles.map(tile => { const b = tile.bounds; const d = Math.hypot(Math.max(b[0] - pos[0], 0, pos[0] - b[2]), Math.max(b[1] - pos[2], 0, pos[2] - b[3])); return { tile, d }; }).filter(x => x.d < radius).sort((a, b) => a.d - b.d);
        const ids = new Set(tiles.map(x => x.tile.id));
        for (const { tile } of tiles) {
            const loaded = this.loaded.get(tile.id);
            if (loaded) {
                loaded.used = now;
                continue;
            }
            if (this.requested.size)
                break;
            const retry = this.tileRetries.get(tile.id);
            if (retry && (retry.attempts >= 4 || now < retry.next))
                continue;
            const token = ++this.nextRequestToken, abort = new AbortController();
            this.requested.add(tile.id);
            this.requestTokens.set(tile.id, token);
            this.requestAborts.set(tile.id, abort);
            const fetchTimer = window.setTimeout(() => abort.abort(), 30000);
            try {
                let data;
                if (this.tileSource)
                    data = await this.tileSource(tile.id);
                else {
                    const r = await fetch(routeResourceUrl(tile.url, document.baseURI), { signal: abort.signal });
                    if (!r.ok)
                        throw new Error(`Could not load route tile ${tile.id} (HTTP ${r.status})`);
                    data = await r.json();
                }
                if (this.requestTokens.get(tile.id) !== token)
                    return;
                this.requestAborts.delete(tile.id);
                this.refreshTileTimeout(tile.id,token);
                this.worker.postMessage({ type: 'build', tile: data, token });
            }
            catch (e) {
                if (this.requestTokens.get(tile.id) === token)
                    this.tileFailed(tile.id, e instanceof Error ? e.message : String(e));
            }
            finally {
                window.clearTimeout(fetchTimer);
            }
            break;
        }
        this.evictInactiveTiles(ids);
    }
    evictInactiveTiles(active) { const maximum=this.quality==='low'?12:this.quality==='high'?25:18, target=maximum-3; if (this.loaded.size > maximum) {
        if (!active) {
            const p = this.route.lanePose(this.sim.player.s, this.sim.player.lane).position, r = this.quality === 'high' ? 1750 : this.quality === 'low' ? 900 : 1300;
            active = new Set(this.data.tiles.filter(t => Math.hypot(Math.max(t.bounds[0] - p[0], 0, p[0] - t.bounds[2]), Math.max(t.bounds[1] - p[2], 0, p[2] - t.bounds[3])) < r).map(t => t.id));
        }
        for (const [id, tile] of [...this.loaded].sort((a, b) => a[1].used - b[1].used)) {
            if (this.loaded.size <= target)
                break;
            if (active.has(id))
                continue;
            this.triangles -= tile.mesh.geometry.index.count / 3;
            this.scene.remove(tile.mesh);
            tile.mesh.geometry.dispose();
            tile.mesh.material.dispose();
            for (const walkerId of tile.walkers || []) {
                const walker = this.walkers?.get(walkerId);
                if (!walker) continue;
                walker.tiles.delete(id);
                if (!walker.tiles.size) { this.scene.remove(walker.model); this.walkers.delete(walkerId); }
            }
            this.loaded.delete(id);
            this.requested.delete(id);
        }
    } this.tileCount = this.loaded.size; }
    draw(dt) {
        const t = performance.now();
        this.updateTiles();
        const player = this.sim.player;
        const pose = this.route.lanePose(player.s, player.lane);
        const dir = player.direction;
        const axes = trackBasis(pose, dir);
        const pos = new THREE.Vector3(...pose.position).addScaledVector(new THREE.Vector3(...axes.up), 2.45);
        const targetPose = this.route.lanePose(this.route.travel(player.s, dir * 38, player.lane), player.lane);
        const target = new THREE.Vector3(...targetPose.position);
        target.addScaledVector(new THREE.Vector3(...trackBasis(targetPose, dir).up), 2.25);
        if (this.firstFrame || this.previousCamera.distanceTo(pos) > 30) {
            this.camera.position.copy(pos);
            this.firstFrame = false;
        }
        else
            this.camera.position.lerp(pos, 1 - Math.exp(-dt * 18));
        this.previousCamera.copy(pos);
        this.camera.up.fromArray(axes.up);
        this.camera.lookAt(target);
        const tunnel = this.route.tunnelAt(player.s);
        const exposure = tunnel ? .78 : 1.1;
        this.renderer.toneMappingExposure += (exposure - this.renderer.toneMappingExposure) * Math.min(1, dt * 2);
        this.ambient.intensity = tunnel ? 1.1 : 2.7;
        this.sun.position.copy(pos).add(new THREE.Vector3(-140, 250, -80));
        this.sun.target.position.copy(pos);
        this.sun.target.updateMatrixWorld();
        for (const signal of this.sim.signals) {
            const model = this.signalModels.get(signal.id);
            model.visible = Math.abs(signal.s - player.s) < 1900;
            if (model.visible)
                setSignalAspect(model, this.sim.aspect(signal).replace('double-yellow', 'doubleYellow'));
        }
        for (const point of this.sim.points) {
            const g = this.pointModels.get(point.id);
            if (!g)
                continue;
            g.visible = Math.abs(point.s - player.s) < 1500;
            if (g.visible && g.userData.blend !== point.blend)
                setSwitchBlend(g, point.blend);
        }
        for (const crossing of this.sim.crossings) {
            const g = this.crossingModels.get(crossing.id);
            g.visible = Math.abs(crossing.s - player.s) < 1500;
            if (g.visible)
                setCrossingState(g, crossing.blend, this.sim.clock, crossing.state !== 'open');
        }
        // Keep all cars visible until the complete consist leaves the dataset.
        for (const train of this.sim.ai) {
            let g = this.trainModels.get(train.id);
            const [occupiedStart, occupiedEnd] = this.sim.interval(train);
            if (train.portalWaitUntil !== undefined || occupiedEnd < 0 || occupiedStart > this.route.length || Math.abs(train.s - player.s) > 1800) {
                if (g)
                    g.visible = false;
                continue;
            }
            if (!g) {
                g = this.factory.train({ id: train.id, kind: train.kind, cars: train.cars });
                this.trainModels.set(train.id, g);
                this.scene.add(g);
            }
            g.visible = true;
            const cars = g.userData.cars;
            if (cars) {
                g.position.set(0, 0, 0);
                g.rotation.set(0, 0, 0);
                const length = Number(g.userData.carLength) || 23, gap = Number(g.userData.couplerGap) || .65;
                cars.forEach((car, i) => { const centre = this.route.travel(train.s, -train.direction * (length / 2 + i * (length + gap)), train.lane); const front = this.route.lanePose(this.route.travel(centre, train.direction * length * .29, train.lane), train.lane), rear = this.route.lanePose(this.route.travel(centre, -train.direction * length * .29, train.lane), train.lane); const delta = front.position.map((x, j) => x - rear.position[j]); car.position.set((front.position[0] + rear.position[0]) / 2, (front.position[1] + rear.position[1]) / 2, (front.position[2] + rear.position[2]) / 2); orient(car, trackBasis(this.route.lanePose(centre, train.lane), train.direction, delta)); });
            }
            else {
                const p = this.route.lanePose(train.s, train.lane);
                g.position.fromArray(p.position);
                orient(g, trackBasis(p, train.direction));
            }
        }
        for (const service of this.adjacent) {
            const { data, path, model } = service;
            const length = Number(model.userData.totalLength) || 70;
            const duration = Number(data.cycleSeconds) || 240;
            const phase = (this.sim.clock % duration) / duration;
            const outbound = data.metadata?.static ? true : phase < .5;
            const progress = clamp((outbound ? phase : 1 - phase) * 2 * 1.2 - .1, 0, 1);
            const centreS = data.metadata?.static ? path.length * .55 : mixNumber(length / 2, path.length - length / 2, progress), s = centreS;
            const centre = path.sample(s).position;
            model.visible = Math.hypot(centre[0] - pos.x, centre[2] - pos.z) < 1600;
            if (!model.visible)
                continue;
            const direction = outbound ? 1 : -1;
            setEndLights(model, direction, !!data.metadata?.static);
            const cars = model.userData.cars;
            cars?.forEach((car, i) => { const c = path.sample(centreS + length / 2 - (Number(model.userData.firstCarCentreDistance) + i * (Number(model.userData.carLength) + .65))); car.position.fromArray(c.position); orient(car, trackBasis(c, 1)); });
        }
        for (const walker of this.walkers.values()) {
            const phase = ((this.sim.clock + walker.phase) * walker.speed) % (walker.path.length * 2), forward = phase <= walker.path.length, s = forward ? phase : walker.path.length * 2 - phase, p = walker.path.sample(s);
            walker.model.visible = Math.hypot(p.position[0] - pos.x, p.position[2] - pos.z) < 350;
            if (walker.model.visible) {
                walker.model.position.fromArray(p.position);
                walker.model.rotation.y = p.yaw + (forward ? 0 : Math.PI);
            }
        }
        this.updateRoadVehicles(pos);
        this.renderer.render(this.scene, this.camera);
        const elapsed = performance.now() - t;
        if (this.warmFrames++ > 60) {
            this.frameTimes.push(elapsed);
            if (this.frameTimes.length > 600)
                this.frameTimes.shift();
        }
    }
    updateRoadVehicles(pos) {
        for (const car of this.roadTraffic.cars.values()) {
            let g = this.carModels.get(car.id);
            const d = Math.hypot(car.position[0] - pos.x, car.position[2] - pos.z);
            if (d > 950) {
                if (g) {
                    if (d > 1600) { this.discardRoadModel(g); this.carModels.delete(car.id); }
                    else g.visible = false;
                }
                continue;
            }
            if (!g) {
                g = this.factory.roadVehicle({ kind: car.kind, id: car.id, seed: hashId(car.id), color: [0xe9e4d5, 0x536b75, 0x9b624e, 0x555d54][hashId(car.id) % 4] });
                this.carModels.set(car.id, g);
                this.scene.add(g);
            }
            g.visible = true;
            g.position.fromArray(car.position);
            orient(g, roadBasis(car.yaw, car.pitch || 0, car.bank || 0));
        }
    }
    /** Explicit GPU synchronization for capture/diagnostics, not used by the normal render loop. */
    async finishFrame() { this.renderer.getContext().finish(); }
    stats() { return { backend: this.renderer.getContext().isContextLost() ? 'unavailable' : 'WebGL2', adapter: this.gpuInfo, tiles: this.tileCount, triangles: this.triangles, placements: this.placements, gpuErrors: this.failures, drawCalls: this.renderer.info.render.calls, memory: this.renderer.info.memory }; }
    dispose() { this.disposed = true; if(this.initialisationTimer!==undefined)window.clearTimeout(this.initialisationTimer); this.viewport.dispose(); for (const id of [...this.requested])
        this.clearRequest(id); this.renderer.domElement.removeEventListener('webglcontextlost', this.contextLost); this.worker.terminate(); this.renderer.dispose(); }
}
function mixNumber(a, b, t) { return a + (b - a) * t; }
function hashId(s) { let h = 0; for (const c of s)
    h = Math.imul(h, 31) + c.charCodeAt(0); return h >>> 0; }
const poseMatrix = new THREE.Matrix4(), poseRight = new THREE.Vector3(), poseUp = new THREE.Vector3(), poseBack = new THREE.Vector3();
function orient(object, axes) { poseMatrix.makeBasis(poseRight.fromArray(axes.right), poseUp.fromArray(axes.up), poseBack.fromArray(axes.forward).negate()); object.quaternion.setFromRotationMatrix(poseMatrix); }
function setEndLights(model, direction, parked = false) { if (model.userData.lightDirection === direction && model.userData.parkedLights === parked)
    return; for (const [side, lights] of [[1, model.userData.frontLights], [-1, model.userData.rearLights]]) {
    for (const light of lights || []) {
        if (!light.userData.ownLampMaterial) {
            light.material = light.material.clone();
            light.userData.ownLampMaterial = true;
        }
        light.visible = !parked;
        const material = light.material, color = side === direction ? 0xf6efc9 : 0xe95b4b;
        material.color.setHex(color);
        material.emissive.setHex(color);
    }
} model.userData.lightDirection = direction; model.userData.parkedLights = parked; }
