import { readFileSync, writeFileSync, mkdirSync, readdirSync, unlinkSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { encodeGrid, decodeGrid, GRID, piece, connections, position } from '../src/world/grid.js';
import { RouteGeometry, Polyline } from '../src/core/geometry.js';
import { Terrain } from '../src/world/surfaces.js';
import { regularizeHeights } from '../src/world/terrain-grid.js';
import {compileLandscape,PIECE_CATALOG,osmWorldPosition} from './osm-landscape.js';
import {RAIL_PIECES,ROAD_PIECES,occupiedQuarters} from '../src/world/piece-registry.js';
const read = (path) => JSON.parse(readFileSync(path, 'utf8'));
const manifest = read('references/location-reference-manifest.json');
if (manifest.era !== 2026)
    throw new Error('Consult and update the location manifest before changing the model era.');
const source = read('public/data/reconstruction.json'), route = read('public/data/route.json');
const sourceGeometry = new RouteGeometry(route);
for (const mapped of source.mainTunnels) {
    const t = route.tunnels.find(t => t.id === mapped.id);
    if (!t)
        continue;
    const extents = mapped.points.map((p) => sourceGeometry.project(p[0], p[2], 100).s);
    t.start = Math.min(...extents);
    t.end = Math.max(...extents);
    t.s = (t.start + t.end) / 2;
    t.points = [sourceGeometry.sample(t.start).position, sourceGeometry.sample(t.end).position];
    t.position = sourceGeometry.sample(t.s).position;
    t.sourceWayIds = mapped.sourceWayIds;
    t.confidence = '2026 mapped heavy-rail portals; absolute profile inferred';
}
// Retain the mapped urban portals, but replace the old multi-gradient bore with
// the documented approximately 1:45 inclination. The datum is still inferred.
const tunnel = route.tunnels.find(t => t.id === 'snow-hill-tunnel');
if (tunnel) {
    const chainages = route.chainages, original = route.points.map(p => p[1]), endY = original[chainages.findIndex(s => s >= tunnel.end)], startY = endY + (tunnel.end - tunnel.start) / 45;
    const begin = tunnel.start - 350, beginIndex = chainages.findIndex(s => s >= begin), beginY = original[beginIndex], beginGrade = (original[beginIndex + 1] - original[beginIndex - 1]) / (chainages[beginIndex + 1] - chainages[beginIndex - 1]);
    for (let i = 0; i < route.points.length; i++) {
        const s = chainages[i];
        let y = original[i];
        if (s >= tunnel.start && s <= tunnel.end)
            y = endY + (tunnel.end - s) / 45;
        else if (s > begin && s < tunnel.start) {
            const t = (s - begin) / 350, t2 = t * t, t3 = t2 * t;
            y = (2 * t3 - 3 * t2 + 1) * beginY + (t3 - 2 * t2 + t) * 350 * beginGrade + (-2 * t3 + 3 * t2) * startY + (t3 - t2) * 350 * (-1 / 45);
        }
        const delta = y - original[i];
        route.points[i][1] = y;
        route.opposingTrack.points[i][1] += delta;
    }
    tunnel.profileRule = 'mapped portal extent; approximately 1:45 bore; inferred absolute datum with smooth northern transition';
    tunnel.confidence = '2026 mapped extent about 584 m differs from historical 596-yard description; absolute rail levels inferred';
}
let geometry = new RouteGeometry(route);
// Move existing operational crossings only when two OSM-tagged nodes identify
// the same road crossing. Keep the old placement for reversible review.
const mappedCrossings = [
    { id: 'blakedown-crossing', archive: 'bkd', nodes: [1951184815, 1951184816], way: 24441396 },
    { id: 'cradley-crossing', archive: 'cra', nodes: [529903940, 3041392193], way: 52127510 },
    { id: 'langley-crossing', archive: 'lgg', nodes: [2500432257, 310426038], way: 137652673 },
    { id: 'bentley-heath-crossing', archive: 'bentley', nodes: [304916001, 1228462952], way: 27802023 },
];
for (const mapped of mappedCrossings) {
    const crossing = route.crossings.find(c => c.id === mapped.id);
    const archived = read(`references/geography/crossing-nodes-${mapped.archive}.osm.json`).elements;
    const nodes = mapped.nodes.map(id => archived.find(n => n.id === id && n.tags?.railway === 'level_crossing'));
    if (!crossing || nodes.some(n => !n)) throw new Error(`Missing mapped level crossing evidence: ${mapped.id}`);
    const positions = nodes.map(n => osmWorldPosition(n.lon,n.lat));
    const [x,z] = [0,1].map(i => positions.reduce((sum,p) => sum + p[i],0)/positions.length);
    const hit = geometry.project(x,z,150);
    if (hit.distance > 10) throw new Error(`Mapped crossing does not meet the railway: ${mapped.id}`);
    const i = geometry.segment(hit.s), fraction = (hit.s - geometry.lengths[i]) / (geometry.lengths[i+1] - geometry.lengths[i] || 1);
    crossing.legacyPosition = crossing.position;
    crossing.legacyChainage = crossing.s;
    crossing.s = route.chainages[i] + fraction * (route.chainages[i+1] - route.chainages[i]);
    crossing.position = geometry.sample(hit.s).position;
    crossing.sourceNodeIds = mapped.nodes;
    crossing.source = `https://www.openstreetmap.org/way/${mapped.way}`;
    crossing.sourceDate = '2026-11-01';
    crossing.confidence = 'two OSM-tagged railway crossing nodes on the road; rail height inferred';
}
// Fingerprints include the operational crossing locations.
geometry = new RouteGeometry(route);
// A Buffer may use a pooled backing store: always make an exact independent copy.
const terrainBytes = readFileSync('public/data/terrain.bin'), terrain = new Terrain(route.terrain, new Uint16Array(Uint8Array.from(terrainBytes).buffer));
const svr = new Polyline(source.kidderminsterHeritage.points);
route.era = manifest.era;
route.referenceManifest = 'references/location-reference-manifest.json';
route.extraStations = source.stations;
route.platforms = [...route.platforms.filter(p => !['KID', 'SGB', 'JEQ', 'THW'].includes(p.station)), ...source.platforms];
const existingServices = read('public/data/adjacent-services.json').services;
// The older service controls contain the two mapped Metro tracks through The
// Hawthorns. The later urban extract does not cover those ways; retain them.
const hawthornsMetro = existingServices.filter(s => s.id.startsWith('hawthorns-metro')).map(s => ({ ...s, metadata: { ...s.metadata, mode: 'tram', region: 'metro', renderStatic: true } }));
route.adjacentServices = [...existingServices.filter(s => !s.id.startsWith('hawthorns-metro')).map(s => ({ ...s, metadata: { ...s.metadata, renderStatic: s.id === 'stourbridge-town-shuttle' } })), ...hawthornsMetro, ...source.tracks];
// The imported open platform edges were expanded toward a Metro way over a
// kilometre away. Bind each to its nearest restored track and expand outwards.
for (const platform of route.platforms.filter(p => p.station === 'THW' && p.mode === 'tram')) {
    const edge = platform.footprint.slice(0, platform.footprint.length / 2);
    const x = edge.reduce((sum,p)=>sum+p[0],0)/edge.length, z = edge.reduce((sum,p)=>sum+p[1],0)/edge.length;
    const candidates = hawthornsMetro.map(service => { const path = new Polyline(service.points), hit = path.nearest(x,z); return {service,path,hit}; }).sort((a,b)=>a.hit.distance-b.hit.distance);
    const best = candidates[0];
    if (!best || best.hit.distance > 10) throw new Error(`No nearby Hawthorns Metro track for ${platform.id}`);
    const track = best.path.sample(best.hit.s).position, dx = x-track[0], dz = z-track[2], length = Math.hypot(dx,dz) || 1;
    platform.legacyBinding = platform.binding;
    platform.legacyFootprint = platform.footprint;
    platform.binding = best.service.id;
    platform.footprint = [...edge, ...edge.slice().reverse().map(p=>[p[0]+dx/length*2.6,p[1]+dz/length*2.6])];
    platform.confidence = 'mapped platform edge; inferred outward width and nearest mapped Metro track; height inferred';
}
// A stop is placed only where an explicitly mapped buffer node is also a
// degree-one endpoint of a rendered source track. No connection is invented.
const mappedBuffers=new Set(['kid','tys'].flatMap(id=>read(`references/geography/buffer-stops-${id}.osm.json`).elements.map(n=>String(n.id))));
const degree=new Map();for(const edge of source.topology)for(const node of [edge.from,edge.to])degree.set(node,(degree.get(node)||0)+1);
route.bufferStops=[];const seenBuffers=new Set();
for(const track of source.tracks){if(!track.metadata?.renderStatic)continue;const nodes=track.metadata.sourceNodeIds||[],path=new Polyline(track.points);
    for(const end of [0,1]){const node=nodes[end?nodes.length-1:0];if(!mappedBuffers.has(node)||degree.get(node)!==1||seenBuffers.has(node))continue;
        const q=path.sample(end?path.length:0);route.bufferStops.push({id:`buffer/osm/${node}`,asset:'regional/buffer-stop',position:q.position,yaw:q.yaw+(end?0:Math.PI),track:track.id,node,source:`https://www.openstreetmap.org/node/${node}`,sourceDate:'2026-11-01',confidence:'mapped buffer node and source-track endpoint; model height inferred'});seenBuffers.add(node);
    }
}
const roadOverrides = new Map(source.access.map((a) => [a.id, a]));
const originalRoads = read('public/data/road-surfaces.json').roads;
// These mapped footpaths join opposite Metro platform edges at Jewellery
// Quarter. Their old ground-height estimate built earth walls through the tram
// tracks; use the adjacent tram formation as their inferred walking level.
const metroPaths = source.tracks.filter(t => t.metadata?.mode === 'tram' && t.metadata?.renderStatic).map(t => ({ track:t, path:new Polyline(t.points) }));
for (const id of ['way/1208250339/0','way/1208250340/0']) {
    const road = originalRoads.find(r=>r.id===id);
    if (!road) throw new Error(`Missing mapped Jewellery Quarter platform connection: ${id}`);
    const points=road.points.map(p=>{
        const nearest=metroPaths.map(m=>({...m,hit:m.path.nearest(p[0],p[2])})).sort((a,b)=>a.hit.distance-b.hit.distance)[0];
        if (!nearest || nearest.hit.distance>10) throw new Error(`No adjacent Metro track for ${id}`);
        return [p[0],nearest.path.sample(nearest.hit.s).position[1],p[2]];
    });
    roadOverrides.set(id,{...road,points,legacyPoints:road.points,mode:'pedestrian-crossing',profileResolved:true,elevationMode:'level',confidence:'mapped footpath joins Metro platform edges; walking level inferred from adjacent tram tracks'});
}
const canalBridge = originalRoads.find((r) => r.id === 'way/22320759/0');
if (canalBridge) {
    const y = Math.max(canalBridge.points[0][1], canalBridge.points.at(-1)[1]);
    roadOverrides.set(canalBridge.id, { ...canalBridge, points: canalBridge.points.map((p) => [p[0], y, p[2]]), elevationMode: 'over', confidence: 'historic Galton canal bridge; mapped plan, deck datum inferred from abutments', source: manifest.sources['galton-bridge'].url });
}
route.surfaceRoads = originalRoads.map((r) => roadOverrides.has(r.id) ? { ...r, ...roadOverrides.get(r.id) } : r);
route.surfaceWater = [...read('public/data/land-surfaces.json').water, ...source.water];
route.landmarks = source.landmarks;
const restoredMetroEdges = [];
for (const service of hawthornsMetro) for (let i=0;i<service.points.length-1;i+=8) {
    const end=Math.min(service.points.length-1,i+8),from=`${service.id}/${i}`,to=`${service.id}/${end}`;
    restoredMetroEdges.push({id:`context/${service.id}/${i}`,from,to,points:service.points.slice(i,end+1),mode:'tram',region:'metro',sourceWayIds:service.metadata.sourceWayIds,confidence:'retained sampled OSM service path; connections to other source ways not inferred'});
}
route.railwayGraph = { edges: [...source.topology,...restoredMetroEdges], scope: '2026 source-node connectivity and retained Metro service paths, distinct rail/tram graphs; physical topology is not movement authority' };
const pieces = route.railwayGraph.edges.map((e) => piece(e.id, e.points, [e.from, e.to], e.mode));
for (const [lane, points] of [['up', route.points], ['down', route.opposingTrack.points]])
    for (let i = 0; i < points.length - 1; i += 8) {
        const end = Math.min(points.length - 1, i + 8);
        pieces.push(piece(`running/${lane}/${i}`, points.slice(i, end + 1), [`running/${lane}/${i}`, `running/${lane}/${end}`]));
    }
connections(pieces);
route.gridPieces = pieces;
route.kidderminsterHeritage = source.kidderminsterHeritage;
const galton = geometry.stations.find(s => s.id === 'SGB');
route.bridges = [{ id: 'galton-upper', start: galton.s - 75, end: galton.s + 25 }];
route.civils = [{ id: 'galton-upper', points: Array.from({ length: 26 }, (_, i) => geometry.sample(galton.s - 75 + i * 4, geometry.laneOffset(galton.s, 4.2) / 2).position), metadata: { bridge: true, name: 'Galton upper railway', width: 10, clearSpan: true } }];
for (const c of source.civils) {
    const levels = c.points.map((p) => terrain.raw(p[0], p[2])).sort((a, b) => a - b), deck = levels[Math.floor(levels.length / 2)] + c.height;
    route.civils.push({ ...c, points: c.points.map((p) => [p[0], deck, p[2]]) });
}
// Adjacent tram ways through the same Hockley tunnel share an opening. Keeping
// two overlapping single-track walls would place masonry inside both vehicles.
for (const pair of [['osm/31545005','osm/171828711'],['osm/18108427','osm/171828639']]) {
    const [left,right]=pair.map(id=>route.adjacentServices.find(t=>t.id===id));
    if (!left || !right) throw new Error(`Missing mapped Metro tunnel tracks: ${pair.join(', ')}`);
    const a=new Polyline(left.points),b=new Polyline(right.points),count=Math.max(2,Math.ceil(a.length/4)),points=[],separations=[];
    for(let i=0;i<=count;i++){
        const p=a.sample(a.length*i/count).position,near=b.nearest(p[0],p[2]),q=b.sample(near.s).position;
        if(near.distance>8)throw new Error(`Metro tunnel tracks diverge: ${pair.join(', ')}`);
        points.push(p.map((v,j)=>(v+q[j])/2));separations.push(near.distance);
    }
    const id=`civil/hockley/${pair[0].slice(4)}`;
    left.metadata.sharedCivil=id;right.metadata.sharedCivil=id;
    route.civils.push({id,points,metadata:{tunnel:true,mode:'tram',boreRadius:Math.max(...separations)/2+2.5},sourceWayIds:pair.map(v=>v.slice(4)),source:'https://www.openstreetmap.org/way/'+pair[0].slice(4),confidence:'paired mapped tram alignments; single shared opening and height inferred'});
}
// Fixed, explicit station compositions replace incidental nearest-line ownership.
route.stationCompositions = manifest.locations.map((s) => ({ id: s.id, rule: s.composition, platformIds: route.platforms.filter(p => p.station === s.id).map(p => p.id) }));
route.generation = { version: 1, seedPolicy: 'FNV-1a stable entity/tile IDs; independent of tile load order', regionalKit: ['engineering-brick', 'retaining-wall', 'bridge-girder', 'portal', 'gwr-furniture', 'metro-equipment', 'industrial-shed', 'terrace', 'vegetation'], landmarkVersion: 1 };
const assets = route.landmarks;
const add = (id, family, station, sOffset, side, options) => { const st = geometry.stations.find(s => s.id === station); const q = geometry.sample(st.s + sOffset, side); assets.push({ id, family, position: q.position, angle: q.yaw, source: manifest.locations.find((s) => s.id === station).sourceIds, confidence: 'site composition; dimensions inferred', ...options }); };
add('landmark/moor-street-frontage', 'gwr-frontage', 'BMO', 0, -34, { width: 52, depth: 12, height: 8, name: 'BIRMINGHAM MOOR STREET' });
add('landmark/snow-hill', 'snow-hill', 'BSW', -30, -42, { width: 16, depth: 140, height: 17 });
const kdt = source.stations.find((s) => s.id === 'KDT');
// Signal heads are protective scenery until dispatch over the exchange is implemented.
for (const tr of source.tracks.filter((t) => t.metadata.region === 'kidderminster' && t.metadata.service === 'crossover')) {
    const p = tr.points[0];
    assets.push({ id: tr.id + '/protecting-signal', family: 'exchange-signal', position: [p[0] + 2.5, p[1] - .4, p[2]], angle: 0, width: 1, depth: 1, height: 5, aspect: 'red', source: ['svr-connection'], confidence: 'protective model signal; exact signal siting not surveyed' });
}
for(const asset of assets)asset.asset=`landmark/${asset.family}`;
// Extend the sampled terrain instead of clamping the whole SVR to the old map's
// western edge. Existing Environment Agency cells are copied without resampling.
// Outside that coverage this is a declared valley model, constrained to railway
// levels, with explicit bridge/tunnel exceptions and deterministic rolling sides.
const old = route.terrain, step = GRID.cellSize, origin = [Math.floor((old.origin[0] - 2000) / step) * step, Math.floor(old.origin[1] / step) * step];
const width = Math.ceil((old.origin[0] + (old.width - 1) * old.step - origin[0]) / step) + 1, height = Math.ceil((old.origin[1] + (old.height - 1) * old.step - origin[1]) / step) + 1;
const gridOffset = -100, raw = new Float32Array(width * height), aux = source.tracks.map((t) => ({ t, path: new Polyline(t.points) }));
const samples = [];
for (let s = 0; s < svr.length; s += 40)
    samples.push(svr.sample(s).position);
const buckets = new Map();
for (const p of samples) {
    const key = `${Math.floor(p[0] / 500)},${Math.floor(p[2] / 500)}`, v = buckets.get(key) || [];
    v.push(p);
    buckets.set(key, v);
}
function nearSVR(x, z) { let d = Infinity, p; const bx = Math.floor(x / 500), bz = Math.floor(z / 500); for (let dx = -3; dx <= 3; dx++)
    for (let dz = -3; dz <= 3; dz++)
        for (const q of buckets.get(`${bx + dx},${bz + dz}`) || []) {
            const n = Math.hypot(x - q[0], z - q[2]);
            if (n < d) {
                d = n;
                p = q;
            }
        } return { d, p }; }
for (let j = 0; j < height; j++)
    for (let i = 0; i < width; i++) {
        const x = origin[0] + i * step, z = origin[1] + j * step;
        let y;
        if (x >= old.origin[0])
            y = terrain.raw(x, z);
        else {
            const n = nearSVR(x, z);
            y = n.p ? n.p[1] - 1 + Math.min(70, n.d * .09) + 4 * Math.sin(x / 480) * Math.sin(z / 620) : 75 + 18 * Math.sin(x / 2100) * Math.cos(z / 1700);
            const t = Math.min(1, Math.max(0, (old.origin[0] - x) / 400)), blend = t * t * (3 - 2 * t), edge = terrain.raw(old.origin[0], z);
            y = edge + (y - edge) * blend;
        }
        raw[j * width + i] = y;
    }
const smoothGround = regularizeHeights(raw, width, height, step * .3), formed = smoothGround.slice();
// A bridge is an overlay. Only reshape ground where it would intersect the deck;
// a broad, smooth shoulder replaces the former hard 3-by-3-cell excavation.
for (const { t, path } of aux) {
    if (!t.metadata.bridge && !t.metadata.tunnel)
        continue;
    for (let s = 0; s <= path.length; s += step / 2) {
        const p = path.sample(s).position, radius = 64, ix = Math.round((p[0] - origin[0]) / step), iz = Math.round((p[2] - origin[1]) / step), cells = Math.ceil(radius / step);
        for (let dz = -cells; dz <= cells; dz++)
            for (let dx = -cells; dx <= cells; dx++) {
                const i = ix + dx, j = iz + dz;
                if (i < 0 || j < 0 || i >= width || j >= height)
                    continue;
                const x = origin[0] + i * step, z = origin[1] + j * step, d = Math.hypot(x - p[0], z - p[2]);
                if (d >= radius)
                    continue;
                const n = j * width + i, u = Math.min(1, d / radius), weight = 1 - u * u * (3 - 2 * u), base = smoothGround[n], target = p[1] + (t.metadata.tunnel ? 7 : -1.5);
                const candidate = base + (target - base) * weight;
                if (t.metadata.tunnel)
                    formed[n] = Math.max(formed[n], candidate);
                else
                    formed[n] = Math.min(formed[n], candidate);
            }
    }
}
const pixels = new Uint16Array(width * height);
for (let i = 0; i < pixels.length; i++)
    pixels[i] = Math.max(1, Math.min(65535, Math.round((formed[i] - gridOffset) / GRID.heightStep) + 1));
route.terrain = { ...old, url: 'data/grid/terrain.bin', origin, width, height, step, offset: gridOffset, scale: GRID.heightStep, source: 'EA ground resampled to shared 16 m cells, slope-limited for visual consistency; western margin inferred', meaning: 'Model ODN metres; elevations and bridge ground transitions are not surveyed', maxBaseGrade: .3 };
const tiles = new Map();
for (const t of route.tiles) {
    const tile = read(`public/${t.url}`);
    tile.roads = tile.roads.map((r) => roadOverrides.has(r.id) ? { ...r, ...roadOverrides.get(r.id) } : r);
    tiles.set(t.id, tile);
}
for (const p of samples)
    for (let dx = -1; dx <= 1; dx++)
        for (let dz = -1; dz <= 1; dz++) {
            const x = Math.floor(p[0] / 1000) + dx, z = Math.floor(p[2] / 1000) + dz, id = `${x}_${z}`;
            if (!tiles.has(id))
                tiles.set(id, { id, bounds: [x * 1000, z * 1000, (x + 1) * 1000, (z + 1) * 1000], roads: [], buildings: [], land: [], tracks: [] });
        }
for (const water of source.water) {
    const p = water.footprint[0], tile = tiles.get(`${Math.floor(p[0] / 1000)}_${Math.floor(p[1] / 1000)}`);
    if (tile)
        (tile.land ??= []).push(water);
}
const landscape=compileLandscape(geometry,new Terrain(route.terrain,pixels),route.surfaceRoads,tiles);
route.roadJunctions=landscape.junctions;
route.construction={version:2,catalog:PIECE_CATALOG,referenceCatalog:{version:1,rail:RAIL_PIECES,road:ROAD_PIECES,interpretation:'Project-scale parametric families; imported source alignments retain flexible geometry.'},terrainLayer:{cellSize:step,heightStep:GRID.heightStep},overlayLayers:['transport','bridges','tunnels','buildings','furniture','vegetation'],source:landscape.sources,statistics:landscape.stats,gradeAdjustments:landscape.gradeAdjustments,gradeExceptions:landscape.gradeExceptions};
const mappedTracks=new Map(source.tracks.map(t=>[t.id,t]));
for(const p of pieces){
    const mode=p.ports[0].mode==='tram'?'tram':'rail',delta=Math.abs(p.anchors.at(-1)[1]-p.anchors[0][1]);
    const match=/^running\/(?:up|down)\/(\d+)$/.exec(p.id),index=match?Number(match[1]):-1;
    const mid=index>=0?(geometry.lengths[index]+geometry.lengths[Math.min(index+8,geometry.lengths.length-1)])/2:0;
    const mapped=mappedTracks.get(p.id.replace(/\/\d+$/,''))?.metadata;
    const structure=(index>=0&&geometry.tunnelAt(mid))||mapped?.tunnel?'tunnel':(index>=0&&geometry.bridgeAt(mid))||mapped?.bridge?'bridge':null;
    p.template=`${mode}/${structure||(p.kind==='curve'?'curve':delta>13&&mode==='rail'?'gradient':'straight')}`;
    p.occupancy=occupiedQuarters(p.anchors.map(position),1.8);
    p.assets={bed:'existing/rail-bed',sleepers:'existing/sleepers',rails:'existing/rails'};
}
const railNodes=new Map();
for(const p of pieces)for(const [endpoint,port] of p.ports.entries()){
    const key=`${port.mode}/${port.node}`,entry=railNodes.get(key)||{id:key,template:`${port.mode==='tram'?'tram':'rail'}/turnout`,position:position(port.anchor),ports:[]};
    entry.ports.push({piece:p.id,endpoint,vector:port.vector});railNodes.set(key,entry);
}
route.railJunctions=[...railNodes.values()].filter(node=>node.ports.length>=3);
const gridDir = 'public/data/grid';
mkdirSync(`${gridDir}/tiles`, { recursive: true });
for (const name of readdirSync(`${gridDir}/tiles`))
    if (name.endsWith('.json') && !tiles.has(name.slice(0, -5)))
        unlinkSync(`${gridDir}/tiles/${name}`);
const digest = (b) => createHash('sha256').update(b).digest('hex');
const tileManifest = [];
for (const tile of [...tiles.values()].sort((a, b) => a.id.localeCompare(b.id))) {
    const encoded = JSON.stringify(encodeGrid(tile)), url = `data/grid/tiles/${tile.id}.json`;
    writeFileSync(`public/${url}`, encoded);
    tileManifest.push({ id: tile.id, url, sha256: digest(encoded) });
}
route.tiles = [...tiles.values()].map(t => ({ id: t.id, url: `data/grid/tiles/${t.id}.json`, bounds: t.bounds }));
const encoded = encodeGrid(route), terrainBuffer = Buffer.from(pixels.buffer), revision = digest(JSON.stringify({ grid: GRID, route: encoded, tiles: tileManifest, terrain: digest(terrainBuffer) }));
writeFileSync(`${gridDir}/terrain.bin`, terrainBuffer);
writeFileSync(`${gridDir}/world.json`, JSON.stringify({ schema: 1, grid: GRID, revision, era: 2026, route: encoded, tiles: tileManifest, terrainSHA256: digest(terrainBuffer) }));
console.log(`Grid world ${revision.slice(0, 12)}: ${tiles.size} tiles, ${pieces.length} rail pieces, ${landscape.roads.length} road pieces, ${landscape.junctions.length} junctions, ${assets.length} landmarks.`);
console.log('OSM landscape:',JSON.stringify(landscape.stats));
