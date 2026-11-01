import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import * as THREE from 'three';
import { RouteGeometry, Polyline, clamp, gaugeRight, sectionUp } from '../src/core/geometry.js';
import { Terrain } from '../src/world/surfaces.js';
import { buildTile, endpointContext } from '../src/world/build.js';
import { mappedPlatforms, platformContains, derivedPlatformEdgeDistance } from '../src/world/platforms.js';
import { AssetFactory } from '../src/render/assets.js';
import { Batch } from '../src/render/batch.js';
import { deriveTrackwork, makeSwitch } from '../src/render/trackwork.js';
const reportArg = process.argv.indexOf('--report');
const reportPath = reportArg >= 0 ? process.argv[reportArg + 1] : 'docs/reports/geometry.json';
const sha = (s) => createHash('sha256').update(s).digest('hex');
const files = ['scripts/audit-geometry.js', 'scripts/build_route.py', 'src/world/build.js', 'src/world/access-sites.js', 'src/world/road-sites.js', 'src/world/site-definitions.json', 'src/world/platforms.js', 'src/world/surfaces.js', 'src/core/geometry.js', 'src/core/pose.js', 'src/render/assets.js', 'src/render/batch.js', 'src/render/trackwork.js', 'public/data/route.json', 'public/data/adjacent-services.json', 'public/data/road-surfaces.json', 'public/data/land-surfaces.json', 'public/data/building-access-evidence.json', 'public/data/building-access-evidence.geojson', 'public/data/terrain.bin'];
const baselinePath = 'docs/reports/baseline-building-ids.json';
const buildingBaseline = existsSync(baselinePath) ? JSON.parse(readFileSync(baselinePath, 'utf8')) : undefined;
if (buildingBaseline)
    files.push(baselinePath);
const hashes = () => Object.fromEntries(files.map(f => [f, sha(readFileSync(f))]));
const data = JSON.parse(readFileSync('public/data/route.json', 'utf8'));
files.push(...data.tiles.map(t => 'public/' + t.url));
const initialHashes = hashes();
data.adjacentServices = JSON.parse(readFileSync('public/data/adjacent-services.json', 'utf8')).services;
data.surfaceRoads = JSON.parse(readFileSync('public/data/road-surfaces.json', 'utf8')).roads;
data.surfaceWater = JSON.parse(readFileSync('public/data/land-surfaces.json', 'utf8')).water;
const route = new RouteGeometry(data), bytes = readFileSync('public/data/terrain.bin');
route.setEndpointContext(endpointContext(route));
const sourceTrackwork = deriveTrackwork(route);
data.trackwork = sourceTrackwork.switches;
const terrain = new Terrain(data.terrain, new Uint16Array(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength)));
const originalPlatforms = JSON.stringify(data.platforms);
const platforms = mappedPlatforms(route);
const started = performance.now();
const materialIds = new Set(), textureViolations = [];
const familyCounts = {};
let captured = [], bodies = new Map(), foundations = new Map(), supportPlinths = [];
const bodyColors = new Set([0x9c6b56, 0xa27d61, 0xbaa58a, 0x877465, 0xb5ada0]);
const keyBounds = (b) => [b.min[0], b.min[2], b.max[0], b.max[2]].map(n => n.toFixed(2)).join('/');
function scanMaterial(material) {
    if (materialIds.has(material.uuid))
        return;
    materialIds.add(material.uuid);
    for (const [property, value] of Object.entries(material))
        if (value && typeof value === 'object' && value.isTexture)
            textureViolations.push({ material: material.type, property });
}
const prototype = AssetFactory.prototype;
for (const method of ['station', 'building', 'tree', 'signal', 'turnout', 'bridge', 'masonryArch', 'tunnel', 'roadVehicle', 'train', 'crossing', 'furniture']) {
    const original = prototype[method];
    prototype[method] = function (...args) {
        const object = original.apply(this, args);
        const config = (method === 'furniture' ? args[1] : args[0]) || {};
        captured.push({ method, object, config });
        familyCounts[method] = (familyCounts[method] || 0) + 1;
        return object;
    };
}
const add = Batch.prototype.add;
Batch.prototype.add = function (object) {
    object.updateMatrixWorld(true);
    object.traverse(node => {
        if (!node.isMesh)
            return;
        const mesh = node;
        for (const material of Array.isArray(mesh.material) ? mesh.material : [mesh.material])
            scanMaterial(material);
        const topMaterial = (Array.isArray(mesh.material) ? mesh.material[0] : mesh.material);
        if (topMaterial.color?.getHex() === 0x918c7d) {
            mesh.geometry.computeBoundingBox();
            const b = mesh.geometry.boundingBox.clone().applyMatrix4(mesh.matrixWorld);
            supportPlinths.push({ min: b.min.toArray(), max: b.max.toArray() });
        }
        if (mesh.geometry.type === 'ExtrudeGeometry') {
            const material = (Array.isArray(mesh.material) ? mesh.material[0] : mesh.material);
            const color = material.color?.getHex();
            if (color === 0x8e887c || bodyColors.has(color)) {
                mesh.geometry.computeBoundingBox();
                const b = mesh.geometry.boundingBox.clone().applyMatrix4(mesh.matrixWorld);
                const bounds = { min: b.min.toArray(), max: b.max.toArray() };
                (color === 0x8e887c ? foundations : bodies).set(keyBounds(bounds), bounds);
            }
        }
    });
    return add.call(this, object);
};
const dynamicGeneratorProbes = [];
function probeDynamic(family, object) {
    let meshes = 0, vertices = 0, nonFinite = 0, invalidIndices = 0;
    object.traverse(node => {
        if (!node.isMesh)
            return;
        const mesh = node;
        meshes++;
        for (const material of Array.isArray(mesh.material) ? mesh.material : [mesh.material])
            scanMaterial(material);
        const position = mesh.geometry.getAttribute('position');
        if (!position)
            return;
        vertices += position.count;
        for (const value of position.array)
            if (!Number.isFinite(value))
                nonFinite++;
        const index = mesh.geometry.index;
        if (index)
            for (const value of index.array)
                if (value >= position.count)
                    invalidIndices++;
    });
    dynamicGeneratorProbes.push({ family, meshes, vertices, nonFinite, invalidIndices });
}
const dynamicFactory = new AssetFactory();
for (const kind of ['172', '168', '139', 'metro', 'emu', 'heritage'])
    probeDynamic(`train/${kind}`, dynamicFactory.train({ id: `audit-probe/${kind}`, kind }));
for (const kind of ['car', 'van', 'taxi', 'bus', 'lorry'])
    probeDynamic(`road-vehicle/${kind}`, dynamicFactory.roadVehicle({ id: `audit-probe/${kind}`, kind }));
for (const aspects of [3, 4])
    probeDynamic(`signal/${aspects}`, dynamicFactory.signal({ id: `audit-probe/signal-${aspects}`, aspects }));
probeDynamic('crossing', dynamicFactory.crossing({ id: 'audit-probe/crossing' }));
for (const kind of ['aws', 'tpws', 'person', 'staff', 'trafficlight'])
    probeDynamic(kind, dynamicFactory.furniture(kind, { id: `audit-probe/${kind}` }));
class TriangleField {
    cell;
    buckets = new Map();
    triangles = [];
    constructor(cell = 10) {
        this.cell = cell;
    }
    add(t) {
        const x0 = Math.min(...t.map(p => p[0])), x1 = Math.max(...t.map(p => p[0])), z0 = Math.min(...t.map(p => p[2])), z1 = Math.max(...t.map(p => p[2]));
        this.triangles.push(t);
        for (let x = Math.floor(x0 / this.cell); x <= Math.floor(x1 / this.cell); x++)
            for (let z = Math.floor(z0 / this.cell); z <= Math.floor(z1 / this.cell); z++) {
                const key = `${x},${z}`, a = this.buckets.get(key) || [];
                a.push(t);
                this.buckets.set(key, a);
            }
    }
    height(x, z, maxY = Infinity, minY = -Infinity) {
        let value = -Infinity;
        for (const [a, b, c] of this.buckets.get(`${Math.floor(x / this.cell)},${Math.floor(z / this.cell)}`) || []) {
            const den = (b[2] - c[2]) * (a[0] - c[0]) + (c[0] - b[0]) * (a[2] - c[2]);
            if (Math.abs(den) < 1e-10)
                continue;
            const u = ((b[2] - c[2]) * (x - c[0]) + (c[0] - b[0]) * (z - c[2])) / den, v = ((c[2] - a[2]) * (x - c[0]) + (a[0] - c[0]) * (z - c[2])) / den, w = 1 - u - v;
            // World positions are baked to float32. A 2mm geometric edge allowance
            // covers that quantization at distant coordinates; it is below the 10mm
            // contact threshold and cannot bridge missing road/terrain strips.
            const denAbs = Math.abs(den), tu = .002 * Math.hypot(b[0] - c[0], b[2] - c[2]) / denAbs, tv = .002 * Math.hypot(c[0] - a[0], c[2] - a[2]) / denAbs, tw = .002 * Math.hypot(a[0] - b[0], a[2] - b[2]) / denAbs;
            if (u >= -tu && v >= -tv && w >= -tw) {
                const y = u * a[1] + v * b[1] + w * c[1];
                if (y <= maxY + .002 && y >= minY - .002)
                    value = Math.max(value, y);
            }
        }
        return Number.isFinite(value) ? value : undefined;
    }
    nearby(x, z, radius) { const seen = new Set(); for (let a = Math.floor((x - radius) / this.cell); a <= Math.floor((x + radius) / this.cell); a++)
        for (let b = Math.floor((z - radius) / this.cell); b <= Math.floor((z + radius) / this.cell); b++)
            for (const t of this.buckets.get(`${a},${b}`) || [])
                seen.add(t); return seen; }
}
const platformMesh = new TriangleField(10);
const operativeSwitchBallast = new TriangleField(10);
const platformSupportQueries = [];
const failures = [];
const examples = {};
const example = (kind, value) => { (examples[kind] ||= []); if (examples[kind].length < 12)
    examples[kind].push(value); };
const sums = { vertices: 0, triangles: 0, terrainTriangles: 0, degenerateTriangles: 0, nonFiniteValues: 0, invalidIndices: 0, downwardTerrainNormals: 0, roadSamples: 0, roadAboveGroundFailures: 0, roadSurfaceTriangleSamples: 0, roadSurfaceIntrusions: 0, roadSurfaceMissingSamples: 0, roadSurfaceMaximumIntrusion: 0, railSamples: 0, ballastAboveGroundFailures: 0, treeAnchors: 0, treeNoSoilHit: 0, treeGapOver10mm: 0, treeGapOver100mm: 0, treeMaxGap: 0, treeMaxBurial: 0, sourceBuildings: 0, buildingFootprintSamples: 0, buildingNoSoilHit: 0, buildingNoSoilOutsideOwner: 0, buildingNoSoilInsideOwner: 0, buildingNeighborQueries: 0, buildingNeighborResolved: 0, buildingNeighborTargetNotBuilt: 0, buildingNeighborTargetOutsideWorld: 0, buildingUnassociatedBodies: 0, buildingFloorIntrusions: 0, buildingFoundationGaps: 0, buildingMaximumFoundationGap: 0, buildingMaximumFloorIntrusion: 0, uncoveredBuildingSupports: 0, platformAnchors: 0, platformContainmentFailures: 0, platformSupportHeightFailures: 0, platformNoCookedTopHit: 0, platformMaximumHeightError: 0, platformLevellingPlinthQueries: 0, platformPlinthVolumeFailures: 0 };
const roadCases = new Map();
const platformCases = [];
const ballastProbeGroups = new Map(), deferredBallastChecks = [];
const ballastCoverage = { attempted: 0, measured: 0, missingTop: 0, missingSoil: 0, neighborQueries: 0, neighborResolved: 0, neighborNotSelected: 0, rawFlatThresholdWarnings: 0, maximumIntrusion: 0, operativeSwitchModels: 0, operativeSwitchTopTriangles: 0 };
function inspectBallast(query, y) {
    if (y > query.railY - .285)
        ballastCoverage.rawFlatThresholdWarnings++;
    if (query.actualTop === undefined)
        return;
    ballastCoverage.measured++;
    const excess = y - query.actualTop;
    if (excess > .01) {
        sums.ballastAboveGroundFailures++;
        ballastCoverage.maximumIntrusion = Math.max(ballastCoverage.maximumIntrusion, excess);
        example('terrainAboveBallast', { tile: query.tile, soilTile: query.target, s: query.s, lane: query.lane, offset: query.offset, position: query.point, actualTop: query.actualTop, terrainY: y, excess });
    }
}
const gaugeReport = { nominalInnerFaceGauge: 1.435, railHeadWidth: 0.075, tolerance: 0.005, attempted: 0, measured: 0, missing: 0, ambiguous: 0, excludedSourceSwitchSamples: 0, failures: 0, minimum: Infinity, maximum: -Infinity, maximumError: 0, maximumFrameNormError: 0, maximumFrameDot: 0, examples: [], scope: 'Actual baked running rail-head top cross-sections at source segment midpoints; source switch spans excluded for dedicated trackwork checks; no survey certificate' };
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const subtract = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
function measureGauge(field, s, lane, tile) {
    if (sourceTrackwork.switches.some(sw => sw.lane === lane && s >= sw.startS - 2 && s <= sw.endS + 2)) {
        gaugeReport.excludedSourceSwitchSamples++;
        return;
    }
    gaugeReport.attempted++;
    const pose = route.lanePose(s, lane), centre = pose.position, rawRight = subtract(route.railPosition(s, lane, 1), route.railPosition(s, lane, 0)), rn = Math.hypot(...rawRight), tn = Math.hypot(...pose.tangent), right = rawRight.map(v => v / rn), tangent = pose.tangent.map(v => v / tn);
    const up = [right[1] * tangent[2] - right[2] * tangent[1], right[2] * tangent[0] - right[0] * tangent[2], right[0] * tangent[1] - right[1] * tangent[0]];
    gaugeReport.maximumFrameNormError = Math.max(gaugeReport.maximumFrameNormError, Math.abs(rn - 1));
    gaugeReport.maximumFrameDot = Math.max(gaugeReport.maximumFrameDot, Math.abs(dot(right, tangent)));
    const intervals = [];
    for (const triangle of field.nearby(centre[0], centre[2], 2)) {
        const ds = triangle.map(v => dot(subtract(v, centre), tangent));
        if (Math.min(...ds) > .0001 || Math.max(...ds) < -.0001)
            continue;
        const points = [];
        for (let i = 0; i < 3; i++) {
            const a = triangle[i], b = triangle[(i + 1) % 3], da = ds[i], db = ds[(i + 1) % 3];
            if (Math.abs(da) < 1e-7)
                points.push(a);
            if (da * db < 0) {
                const u = da / (da - db);
                points.push(a.map((v, j) => v + (b[j] - v) * u));
            }
        }
        if (points.length < 2 || points.some(p => Math.abs(dot(subtract(p, centre), up)) > .06))
            continue;
        const xs = points.map(v => dot(subtract(v, centre), right)), lo = Math.min(...xs), hi = Math.max(...xs);
        if (hi - lo > .00001)
            intervals.push({ lo, hi });
    }
    const merged = [];
    for (const section of intervals.sort((a, b) => a.lo - b.lo)) {
        const last = merged.at(-1);
        if (last && section.lo <= last.hi + .003)
            last.hi = Math.max(last.hi, section.hi);
        else
            merged.push({ ...section });
    }
    const heads = (sign) => merged.filter(v => v.hi - v.lo > .055 && v.hi - v.lo < .095 && Math.abs((v.hi + v.lo) / 2 - sign * .755) < .12).sort((a, b) => Math.abs((a.hi + a.lo) / 2 - sign * .755) - Math.abs((b.hi + b.lo) / 2 - sign * .755));
    const left = heads(-1), rightHead = heads(1);
    if (!left.length || !rightHead.length) {
        gaugeReport.missing++;
        if (gaugeReport.examples.length < 12)
            gaugeReport.examples.push({ tile, s, lane, kind: 'missing head pair', sections: merged });
        return;
    }
    if (left.length > 1 || rightHead.length > 1)
        gaugeReport.ambiguous++;
    const gauge = rightHead[0].lo - left[0].hi, error = Math.abs(gauge - 1.435);
    gaugeReport.measured++;
    gaugeReport.minimum = Math.min(gaugeReport.minimum, gauge);
    gaugeReport.maximum = Math.max(gaugeReport.maximum, gauge);
    gaugeReport.maximumError = Math.max(gaugeReport.maximumError, error);
    if (error > .005) {
        gaugeReport.failures++;
        if (gaugeReport.examples.length < 12)
            gaugeReport.examples.push({ tile, s, lane, gauge, error, kind: 'rendered inner-face gauge' });
    }
}
const edges = new Map();
const tileReports = [];
const inventory = [];
const inventoryIds = new Map();
const stationCoverage = new Map(route.stations.map(s => [s.id, { id: s.id, name: s.name, covered: false, tileIds: [], instancesWithin180m: 0, families: {} }]));
function recordInstance(tile, instance) {
    const id = String(instance.id), family = String(instance.family), position = instance.position;
    inventory.push({ ...instance, tile, manifestId: `${tile}/${family}/${id}` });
    const locations = inventoryIds.get(id) || [];
    locations.push(tile);
    inventoryIds.set(id, locations);
    if (position?.length === 3)
        for (const station of route.stations)
            if (Math.hypot(position[0] - station.position[0], position[2] - station.position[2]) <= 180) {
                const coverage = stationCoverage.get(station.id);
                coverage.instancesWithin180m++;
                coverage.families[family] = (coverage.families[family] || 0) + 1;
            }
}
const floorColor = new THREE.Color(0x666c67);
const asphaltColor = new THREE.Color(0x686c68), pavementColor = new THREE.Color(0xb5b3a5);
const runningRailColor = new THREE.Color(0xa2aaa5);
const ballastTopColor = new THREE.Color(0x8b887c);
// Switch ballast is a renderer-owned assembly, omitted from the replaced tile
// spans. Inspect its actual baked vertex-colour geometry as used by renderer.
for (const definition of sourceTrackwork.switches) {
    const group = makeSwitch(definition);
    group.updateMatrixWorld(true);
    ballastCoverage.operativeSwitchModels++;
    group.traverse(node => {
        if (!node.isMesh)
            return;
        const mesh = node, g = mesh.geometry, pa = g.getAttribute('position'), ca = g.getAttribute('color'), na = g.getAttribute('normal');
        for (const material of Array.isArray(mesh.material) ? mesh.material : [mesh.material])
            scanMaterial(material);
        if (!pa || !ca || !na)
            return;
        const material = (Array.isArray(mesh.material) ? mesh.material[0] : mesh.material), mc = material.color || new THREE.Color(0xffffff), normalMatrix = new THREE.Matrix3().getNormalMatrix(mesh.matrixWorld), count = g.index?.count ?? pa.count;
        for (let i = 0; i < count; i += 3) {
            const ids = [0, 1, 2].map(j => g.index ? g.index.getX(i + j) : i + j), first = ids[0];
            if (Math.abs(ca.getX(first) * mc.r - ballastTopColor.r) > 1e-6 || Math.abs(ca.getY(first) * mc.g - ballastTopColor.g) > 1e-6 || Math.abs(ca.getZ(first) * mc.b - ballastTopColor.b) > 1e-6 || new THREE.Vector3().fromBufferAttribute(na, first).applyMatrix3(normalMatrix).normalize().y < .5)
                continue;
            const triangle = ids.map(id => new THREE.Vector3().fromBufferAttribute(pa, id).applyMatrix4(mesh.matrixWorld).toArray());
            operativeSwitchBallast.add(triangle);
            ballastCoverage.operativeSwitchTopTriangles++;
        }
    });
}
function vertex(result, index) { const n = index * 3; return [result.mesh.position[n], result.mesh.position[n + 1], result.mesh.position[n + 2]]; }
function nearColor(result, index, color) { const n = index * 3; return Math.abs(result.mesh.color[n] - color.r) < 1e-6 && Math.abs(result.mesh.color[n + 1] - color.g) < 1e-6 && Math.abs(result.mesh.color[n + 2] - color.b) < 1e-6; }
function contains(x, z, fp) { let yes = false; for (let i = 0, j = fp.length - 1; i < fp.length; j = i++) {
    const a = fp[i], b = fp[j];
    if ((a[1] > z) !== (b[1] > z) && x < (b[0] - a[0]) * (z - a[1]) / (b[1] - a[1]) + a[0])
        yes = !yes;
} return yes; }
function footprintSamples(fp) {
    const samples = fp.map(p => [p[0], p[1]]);
    for (let i = 0; i < fp.length; i++) {
        const a = fp[i], b = fp[(i + 1) % fp.length];
        samples.push([(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]);
    }
    const cx = fp.reduce((n, p) => n + p[0], 0) / fp.length, cz = fp.reduce((n, p) => n + p[1], 0) / fp.length;
    if (contains(cx, cz, fp))
        samples.push([cx, cz]);
    const x0 = Math.min(...fp.map(p => p[0])), z0 = Math.min(...fp.map(p => p[1])), w = Math.max(...fp.map(p => p[0])) - x0, d = Math.max(...fp.map(p => p[1])) - z0;
    for (const u of [.25, .5, .75])
        for (const v of [.25, .5, .75]) {
            const x = x0 + u * w, z = z0 + v * d;
            if (contains(x, z, fp))
                samples.push([x, z]);
        }
    return samples;
}
const coordinateKey = (x, z) => `${x},${z}`;
const coordinateOwner = (x, z) => `${Math.floor(x / 1000)}_${Math.floor(z / 1000)}`;
const neighborLocations = new Map(), neighborSoil = new Map();
const sourceTileIds = new Set(data.tiles.map(t => t.id));
const deferredBuildingChecks = [];
const buildingFailureCases = [];
function inspectBuilding(query, y) {
    const gap = query.bottom - y, intrusion = y - query.floor;
    if (gap > .01 || intrusion > .01)
        buildingFailureCases.push({ ...query, terrainY: y, gap, intrusion });
    if (gap > .01) {
        sums.buildingFoundationGaps++;
        sums.buildingMaximumFoundationGap = Math.max(sums.buildingMaximumFoundationGap, gap);
        example('buildingFoundationGap', { tile: query.tile, soilTile: query.target, id: query.id, gap, x: query.x, z: query.z, hasRenderedPlinth: query.plinth });
    }
    if (intrusion > .01) {
        sums.buildingFloorIntrusions++;
        sums.buildingMaximumFloorIntrusion = Math.max(sums.buildingMaximumFloorIntrusion, intrusion);
        example('buildingFloorIntrusion', { tile: query.tile, soilTile: query.target, id: query.id, intrusion, x: query.x, z: query.z });
    }
}
// Precompute only the cross-owner coordinates. Each target tile's actual soil
// mesh fills a tiny point cache while it is already being built. This verifies
// whole-footprint samples without retaining millions of terrain triangles.
for (const entry of data.tiles) {
    const tile = JSON.parse(readFileSync('public/' + entry.url, 'utf8')), b = entry.bounds;
    for (const building of tile.buildings)
        for (const [x, z] of footprintSamples(building.footprint || [])) {
            if (x >= b[0] && x <= b[2] && z >= b[1] && z <= b[3])
                continue;
            const id = coordinateOwner(x, z), locations = neighborLocations.get(id) || new Map();
            locations.set(coordinateKey(x, z), [x, z]);
            neighborLocations.set(id, locations);
        }
}
for (let i = 0; i < route.points.length - 1; i++) {
    const a = route.points[i], b = route.points[i + 1], s = (route.lengths[i] + route.lengths[i + 1]) / 2;
    if (route.tunnelAt(s))
        continue;
    const tile = coordinateOwner((a[0] + b[0]) / 2, (a[2] + b[2]) / 2), list = ballastProbeGroups.get(tile) || [];
    for (const lane of [0, 4.2]) {
        const pose = route.lanePose(s, lane), right = gaugeRight(pose), up = sectionUp(pose);
        for (const offset of [-1.2, 0, 1.2]) {
            const point = pose.position.map((v, j) => v + right[j] * offset - up[j] * .29), target = coordinateOwner(point[0], point[2]);
            list.push({ tile, target, s, lane, offset, point, railY: pose.position[1] });
            const locations = neighborLocations.get(target) || new Map();
            locations.set(coordinateKey(point[0], point[2]), [point[0], point[2]]);
            neighborLocations.set(target, locations);
        }
    }
    ballastProbeGroups.set(tile, list);
}
const stationTiles = new Set();
for (const station of route.stations)
    for (const tile of data.tiles) {
        const p = station.position, b = tile.bounds;
        if (Math.hypot(Math.max(b[0] - p[0], 0, p[0] - b[2]), Math.max(b[1] - p[2], 0, p[2] - b[3])) < 180)
            stationTiles.add(tile.id);
    }
const limitArg = process.argv.indexOf('--limit'), limit = limitArg >= 0 ? Number(process.argv[limitArg + 1]) : Infinity;
const tileArg = process.argv.indexOf('--tiles'), explicitTiles = tileArg >= 0 ? new Set(process.argv[tileArg + 1].split(',')) : undefined;
const selected = [...data.tiles].sort((a, b) => Number(stationTiles.has(b.id)) - Number(stationTiles.has(a.id)) || a.id.localeCompare(b.id)).filter(t => (!explicitTiles || explicitTiles.has(t.id)) && (!process.argv.includes('--station-only') || stationTiles.has(t.id))).slice(0, limit);
console.log(`Auditing ${selected.length}/${data.tiles.length} tiles; ${stationTiles.size} tiles cover all 22 station regions.`);
for (let tileIndex = 0; tileIndex < selected.length; tileIndex++) {
    const entry = selected[tileIndex], tile = JSON.parse(readFileSync('public/' + entry.url, 'utf8'));
    captured = [];
    bodies = new Map();
    foundations = new Map();
    supportPlinths = [];
    const before = { ...sums }, begin = performance.now();
    let result;
    try {
        result = buildTile(tile, route, terrain);
    }
    catch (error) {
        const message = error instanceof Error ? error.stack || error.message : String(error);
        failures.push({ kind: 'tile-build-crash', id: entry.id, detail: message });
        tileReports.push({ id: entry.id, stationRegion: stationTiles.has(entry.id), buildError: message, buildSeconds: (performance.now() - begin) / 1000 });
        console.error(`${tileIndex + 1}/${selected.length} ${entry.id}: BUILD FAILED ${message}`);
        continue;
    }
    sums.uncoveredBuildingSupports += result.checks.uncoveredBuildingSupports || 0;
    const field = new TriangleField(10), roadMesh = new TriangleField(10), railHeads = new TriangleField(10), ballastMesh = new TriangleField(10);
    const edgeSet = { bounds: entry.bounds, left: [], right: [], top: [], bottom: [] };
    for (const placement of result.placements)
        recordInstance(entry.id, placement);
    for (const station of route.stations) {
        const b = entry.bounds, p = station.position, coverage = stationCoverage.get(station.id);
        if (Math.hypot(Math.max(b[0] - p[0], 0, p[0] - b[2]), Math.max(b[1] - p[2], 0, p[2] - b[3])) < 180)
            coverage.tileIds.push(entry.id);
        if (p[0] >= b[0] && p[0] <= b[2] && p[2] >= b[1] && p[2] <= b[3])
            coverage.covered = true;
    }
    const count = result.mesh.position.length / 3;
    let nonFinite = 0;
    for (const array of [result.mesh.position, result.mesh.normal, result.mesh.color])
        for (const value of array)
            if (!Number.isFinite(value))
                nonFinite++;
    let invalid = 0;
    for (const index of result.mesh.index)
        if (index >= count)
            invalid++;
    sums.nonFiniteValues += nonFinite;
    sums.invalidIndices += invalid;
    sums.vertices += count;
    sums.triangles += result.mesh.index.length / 3;
    sums.terrainTriangles += result.checks.terrainTriangles;
    if (nonFinite || invalid)
        failures.push({ kind: 'invalid-mesh', id: entry.id, detail: `${nonFinite} nonfinite values; ${invalid} invalid indices` });
    for (let i = 0; i < result.mesh.index.length; i += 3) {
        const ia = result.mesh.index[i], ib = result.mesh.index[i + 1], ic = result.mesh.index[i + 2], t = [vertex(result, ia), vertex(result, ib), vertex(result, ic)];
        const ux = t[1][0] - t[0][0], uy = t[1][1] - t[0][1], uz = t[1][2] - t[0][2], vx = t[2][0] - t[0][0], vy = t[2][1] - t[0][1], vz = t[2][2] - t[0][2];
        if (Math.hypot(uy * vz - uz * vy, uz * vx - ux * vz, ux * vy - uy * vx) < 1e-8)
            sums.degenerateTriangles++;
        if (i < result.checks.terrainTriangles * 3) {
            field.add(t);
            if (result.mesh.normal[ia * 3 + 1] <= 0)
                sums.downwardTerrainNormals++;
            for (const [a, b] of [[t[0], t[1]], [t[1], t[2]], [t[2], t[0]]]) {
                const [x0, z0, x1, z1] = entry.bounds;
                for (const [name, axis, at, along] of [['left', 0, x0, 2], ['right', 0, x1, 2], ['top', 2, z0, 0], ['bottom', 2, z1, 0]]) {
                    if (Math.abs(a[axis] - at) < .003 && Math.abs(b[axis] - at) < .003 && Math.abs(a[along] - b[along]) > .001)
                        edgeSet[name].push({ a: a[along], b: b[along], ya: a[1], yb: b[1] });
                }
            }
        }
        else {
            if (nearColor(result, ia, floorColor) && result.mesh.normal[ia * 3 + 1] > .65)
                platformMesh.add(t);
            if ((nearColor(result, ia, asphaltColor) || nearColor(result, ia, pavementColor)) && result.mesh.normal[ia * 3 + 1] > .65)
                roadMesh.add(t);
            if (nearColor(result, ia, runningRailColor) && result.mesh.normal[ia * 3 + 1] > .5)
                railHeads.add(t);
            if (nearColor(result, ia, ballastTopColor) && result.mesh.normal[ia * 3 + 1] > .5)
                ballastMesh.add(t);
        }
    }
    edges.set(entry.id, edgeSet);
    for (const [key, [x, z]] of neighborLocations.get(entry.id) || []) {
        const y = field.height(x, z);
        if (y !== undefined)
            neighborSoil.set(key, y);
    }
    // Material scan uses actual baked objects, not the factory's textureCount tag.
    for (const capture of captured) {
        if (capture.method !== 'tree' || !String(capture.object.userData.id || '').startsWith('tree/'))
            continue;
        capture.object.updateMatrixWorld(true);
        recordInstance(entry.id, { id: capture.object.userData.id, family: 'tree', position: capture.object.position.toArray(), supportAnchors: capture.object.userData.supportAnchors, seed: capture.config.seed, height: capture.config.height, generator: capture.object.userData.generator, source: capture.object.userData.source, confidence: capture.object.userData.confidence });
        for (const anchor of (capture.object.userData.supportAnchors || [[0, 0, 0]])) {
            const q = new THREE.Vector3(...anchor).applyMatrix4(capture.object.matrixWorld), y = field.height(q.x, q.z);
            sums.treeAnchors++;
            if (y === undefined) {
                sums.treeNoSoilHit++;
                example('treeNoSoilHit', { tile: entry.id, id: capture.object.userData.id, position: q.toArray() });
                continue;
            }
            const gap = q.y - y;
            sums.treeMaxGap = Math.max(sums.treeMaxGap, gap);
            sums.treeMaxBurial = Math.max(sums.treeMaxBurial, -gap);
            if (gap > .01) {
                sums.treeGapOver10mm++;
                example('treeSupportGap', { tile: entry.id, id: capture.object.userData.id, gap, position: q.toArray() });
            }
            if (gap > .1)
                sums.treeGapOver100mm++;
        }
    }
    const sourceBuildings = new Map(tile.buildings.map(b => [b.id, b]));
    for (const placement of result.placements) {
        if (placement.platformId && placement.family.startsWith('platform-'))
            platformSupportQueries.push({ id: placement.id, platform: String(placement.platformId), tile: entry.id, family: placement.family, point: placement.supportPosition ?? placement.position, root: placement.position, radius: Number(placement.clearanceRadius) || 0, relation: placement.supportRelation, plinths: supportPlinths });
        if (placement.family !== 'building')
            continue;
        const source = sourceBuildings.get(placement.id);
        const fp = source?.footprint;
        if (!fp?.length)
            continue;
        sums.sourceBuildings++;
        const bounds = { min: [Math.min(...fp.map(p => p[0])), 0, Math.min(...fp.map(p => p[1]))], max: [Math.max(...fp.map(p => p[0])), 0, Math.max(...fp.map(p => p[1]))] };
        const body = bodies.get(keyBounds(bounds)), foot = foundations.get(keyBounds(bounds));
        if (!body) {
            sums.buildingUnassociatedBodies++;
            example('buildingBodyNotAssociated', { tile: entry.id, id: placement.id });
            continue;
        }
        for (const [x, z] of footprintSamples(fp)) {
            const query = { tile: entry.id, target: entry.id, id: placement.id, x, z, bottom: foot?.min[1] ?? body.min[1], floor: body.min[1], plinth: !!foot };
            const y = field.height(x, z);
            sums.buildingFootprintSamples++;
            if (y === undefined) {
                if (x < entry.bounds[0] || x > entry.bounds[2] || z < entry.bounds[1] || z > entry.bounds[3]) {
                    query.target = coordinateOwner(x, z);
                    deferredBuildingChecks.push(query);
                    sums.buildingNeighborQueries++;
                }
                else {
                    sums.buildingNoSoilHit++;
                    sums.buildingNoSoilInsideOwner++;
                    example('buildingNoSoilInsideOwner', { tile: entry.id, id: placement.id, x, z });
                }
                continue;
            }
            inspectBuilding(query, y);
        }
    }
    // Keep path warnings, then compare to the actual emitted, same-level road top.
    // A higher stacked deck cannot clear a lower path: matching is restricted to
    // expected crown/profile +/-100mm. Missing matches remain uncertified.
    for (const road of result.roads) {
        const source = tile.roads.find(f => f.id === road.id);
        const roadCase = { tile: entry.id, id: road.id, kind: road.kind, mode: road.mode, pathHeightWarnings: 0, cookedSurfaceIntrusions: 0, missingCookedTop: 0, maximumExcess: 0, gradeRelations: source?.gradeRelations ?? null, nearTunnel: undefined, worst: undefined };
        const path = new Polyline(road.points), step = Math.max(4, path.length / 80);
        for (let s = 0; s <= path.length; s += step) {
            const q = path.sample(s);
            if (q.position[0] < entry.bounds[0] || q.position[0] > entry.bounds[2] || q.position[2] < entry.bounds[1] || q.position[2] > entry.bounds[3])
                continue;
            for (const side of [-.45, 0, .45]) {
                const x = q.position[0] + q.right[0] * road.width * side, z = q.position[2] + q.right[2] * road.width * side, y = field.height(x, z);
                if (y === undefined)
                    continue;
                sums.roadSamples++;
                const crown = road.mode === 'crossing' ? -.005 : .035, expected = q.position[1] + crown * (1 - Math.abs(side) * 2), actual = roadMesh.height(x, z, expected + .1, expected - .1);
                if (y > q.position[1] + .015) {
                    sums.roadAboveGroundFailures++;
                    roadCase.pathHeightWarnings++;
                    example('terrainAboveRoadPath', { tile: entry.id, id: road.id, kind: road.kind, mode: road.mode, s, excess: y - q.position[1] });
                }
                if (actual === undefined) {
                    sums.roadSurfaceMissingSamples++;
                    roadCase.missingCookedTop++;
                    continue;
                }
                sums.roadSurfaceTriangleSamples++;
                const excess = y - actual;
                if (excess > .015) {
                    sums.roadSurfaceIntrusions++;
                    roadCase.cookedSurfaceIntrusions++;
                    sums.roadSurfaceMaximumIntrusion = Math.max(sums.roadSurfaceMaximumIntrusion, excess);
                    if (excess > roadCase.maximumExcess) {
                        roadCase.maximumExcess = excess;
                        roadCase.worst = { s, side, position: [x, y, z], roadTop: actual, expectedProfile: expected };
                        const n = route.project(x, z, 100);
                        roadCase.nearTunnel = Number.isFinite(n.distance) ? route.tunnelAt(n.s)?.id : undefined;
                    }
                    example('terrainAboveCookedRoad', { tile: entry.id, id: road.id, kind: road.kind, mode: road.mode, s, excess });
                }
            }
        }
        if (roadCase.pathHeightWarnings || roadCase.cookedSurfaceIntrusions || roadCase.missingCookedTop)
            roadCases.set(`${entry.id}/${road.id}`, roadCase);
    }
    for (const query of ballastProbeGroups.get(entry.id) || []) {
        const [x, expected, z] = query.point;
        ballastCoverage.attempted++;
        sums.railSamples++;
        const localTop = ballastMesh.height(x, z, expected + .1, expected - .1), switchTop = operativeSwitchBallast.height(x, z, expected + .1, expected - .1);
        query.actualTop = localTop === undefined ? switchTop : switchTop === undefined ? localTop : Math.max(localTop, switchTop);
        if (query.actualTop === undefined) {
            ballastCoverage.missingTop++;
            example('ballastTopMissing', { tile: entry.id, s: query.s, lane: query.lane, offset: query.offset, position: query.point });
        }
        const y = field.height(x, z);
        if (y === undefined) {
            deferredBallastChecks.push(query);
            ballastCoverage.neighborQueries++;
        }
        else
            inspectBallast(query, y);
    }
    for (let i = 0; i < route.points.length - 1; i++) {
        const a = route.points[i], b = route.points[i + 1], x = (a[0] + b[0]) / 2, z = (a[2] + b[2]) / 2;
        if (x < entry.bounds[0] || x >= entry.bounds[2] || z < entry.bounds[1] || z >= entry.bounds[3])
            continue;
        const s = (route.lengths[i] + route.lengths[i + 1]) / 2;
        for (const lane of [0, 4.2])
            measureGauge(railHeads, s, lane, entry.id);
    }
    const contact = Object.fromEntries(['roadAboveGroundFailures', 'roadSurfaceIntrusions', 'roadSurfaceMissingSamples', 'ballastAboveGroundFailures', 'treeGapOver10mm', 'treeNoSoilHit', 'buildingFloorIntrusions', 'buildingFoundationGaps', 'buildingNoSoilHit', 'buildingNoSoilInsideOwner', 'buildingNoSoilOutsideOwner', 'buildingUnassociatedBodies'].map(k => [k, sums[k] - before[k]]));
    tileReports.push({ id: entry.id, stationRegion: stationTiles.has(entry.id), vertices: count, triangles: result.mesh.index.length / 3, terrainTriangles: result.checks.terrainTriangles, supportHaloTriangles: result.checks.supportHaloTriangles || 0, uncoveredBuildingSupports: result.checks.uncoveredBuildingSupports || 0, placements: result.placements.length, bodyAssociations: bodies.size, renderedPlinths: foundations.size, buildSeconds: (performance.now() - begin) / 1000, nonFinite, invalid, contact });
    console.log(`${tileIndex + 1}/${selected.length} ${entry.id}: ${Math.round((performance.now() - begin) / 100) / 10}s, ${Math.round(count / 1000)}k vertices`);
    globalThis.gc?.();
}
for (const query of deferredBuildingChecks) {
    const y = neighborSoil.get(coordinateKey(query.x, query.z)), owner = tileReports.find(t => t.id === query.tile);
    if (y === undefined) {
        sums.buildingNoSoilHit++;
        sums.buildingNoSoilOutsideOwner++;
        if (!sourceTileIds.has(query.target))
            sums.buildingNeighborTargetOutsideWorld++;
        else if (!selected.some(t => t.id === query.target))
            sums.buildingNeighborTargetNotBuilt++;
        if (owner) {
            owner.contact.buildingNoSoilHit++;
            owner.contact.buildingNoSoilOutsideOwner++;
        }
        example('buildingNeighborSoilMissing', { ...query, reason: !sourceTileIds.has(query.target) ? 'outside generated world' : !selected.some(t => t.id === query.target) ? 'neighbor not selected in this calibration' : 'actual emitted neighbor terrain has no hit' });
        continue;
    }
    sums.buildingNeighborResolved++;
    const beforeGap = sums.buildingFoundationGaps, beforeIntrusion = sums.buildingFloorIntrusions;
    inspectBuilding(query, y);
    if (owner) {
        owner.contact.buildingFoundationGaps += sums.buildingFoundationGaps - beforeGap;
        owner.contact.buildingFloorIntrusions += sums.buildingFloorIntrusions - beforeIntrusion;
    }
}
for (const query of deferredBallastChecks) {
    const y = neighborSoil.get(coordinateKey(query.point[0], query.point[2]));
    if (y === undefined) {
        ballastCoverage.missingSoil++;
        if (!selected.some(t => t.id === query.target))
            ballastCoverage.neighborNotSelected++;
        example('ballastSoilMissing', { tile: query.tile, soilTile: query.target, s: query.s, lane: query.lane, position: query.point });
        continue;
    }
    ballastCoverage.neighborResolved++;
    const previous = sums.ballastAboveGroundFailures;
    inspectBallast(query, y);
    const owner = tileReports.find(t => t.id === query.tile);
    if (owner)
        owner.contact.ballastAboveGroundFailures += sums.ballastAboveGroundFailures - previous;
}
for (const query of platformSupportQueries) {
    const platform = platforms.find(p => p.id === query.platform);
    sums.platformAnchors++;
    if (!platform || !platformContains(platform, query.point[0], query.point[2]) || derivedPlatformEdgeDistance(platform, query.point[0], query.point[2]) < query.radius - .01) {
        sums.platformContainmentFailures++;
        example('platformAnchorOutside', { id: query.id, platform: query.platform });
    }
    const actual = platformMesh.height(query.point[0], query.point[2], query.point[1] + .15);
    if (actual === undefined) {
        sums.platformNoCookedTopHit++;
        example('platformTopMissing', { id: query.id, platform: query.platform });
        continue;
    }
    const error = Math.abs(query.point[1] - actual);
    sums.platformMaximumHeightError = Math.max(sums.platformMaximumHeightError, error);
    if (error > .01) {
        sums.platformSupportHeightFailures++;
        example('platformAnchorHeight', { id: query.id, error });
    }
    let plinthVerified;
    if (query.relation === 'rendered levelling plinth') {
        sums.platformLevellingPlinthQueries++;
        plinthVerified = query.plinths.some(b => query.point[0] >= b.min[0] - .002 && query.point[0] <= b.max[0] + .002 && query.point[2] >= b.min[2] - .002 && query.point[2] <= b.max[2] + .002 && b.min[1] <= query.point[1] + .01 && b.max[1] >= query.root[1] - .01);
        if (!plinthVerified) {
            sums.platformPlinthVolumeFailures++;
            example('platformPlinthVolumeMissing', { id: query.id, tile: query.tile });
        }
    }
    if (error > .01 || query.relation)
        platformCases.push({ id: query.id, platform: query.platform, tile: query.tile, family: query.family, supportRelation: query.relation ?? 'direct platform root', supportPoint: query.point, root: query.root, error, plinthVerified });
}
const platformClearances = [];
for (const direction of [1, -1])
    for (const lane of [0, 4.2]) {
        let samples = 0, intrusions = 0, minimum = Infinity;
        const seen = [];
        for (const platform of platforms) {
            const near = platform.footprint.map(p => route.project(p[0], p[1], 350)).filter(p => Number.isFinite(p.distance));
            if (!near.length)
                continue;
            const lo = Math.max(0, Math.min(...near.map(p => p.s)) - 3), hi = Math.min(route.length, Math.max(...near.map(p => p.s)) + 3);
            for (let u = 0; u <= hi - lo; u += 1) {
                const s = direction > 0 ? lo + u : hi - u, q = route.lanePose(s, lane), x = q.position[0], z = q.position[2];
                if (Math.abs(platform.top(x, z) - (q.position[1] + .915)) > 1.8)
                    continue;
                const d = derivedPlatformEdgeDistance(platform, x, z);
                if (d > 5)
                    continue;
                samples++;
                minimum = Math.min(minimum, d);
                if (platformContains(platform, x, z) || d < 1.54) {
                    intrusions++;
                    if (seen.length < 8)
                        seen.push({ platform: platform.id, s, d });
                }
            }
        }
        platformClearances.push({ direction, lane, samples, intrusions, minimum: Number.isFinite(minimum) ? minimum : 0, examples: seen });
    }
const seamReport = { pairs: 0, sharedVertexSamples: 0, interpolatedSamples: 0, maximumSharedDelta: 0, maximumInterpolatedDelta: 0, over10mm: 0, over100mm: 0, examples: [], failedPairs: [] };
function edgeHeight(es, s) { for (const e of es)
    if (s >= Math.min(e.a, e.b) - .002 && s <= Math.max(e.a, e.b) + .002) {
        const t = clamp((s - e.a) / (e.b - e.a), 0, 1);
        return e.ya + (e.yb - e.ya) * t;
    } return undefined; }
for (const [id, a] of edges)
    for (const [otherId, b] of edges) {
        if (id >= otherId)
            continue;
        let aa, bb;
        if (Math.abs(a.bounds[2] - b.bounds[0]) < .001 && a.bounds[1] === b.bounds[1]) {
            aa = a.right;
            bb = b.left;
        }
        else if (Math.abs(b.bounds[2] - a.bounds[0]) < .001 && a.bounds[1] === b.bounds[1]) {
            aa = a.left;
            bb = b.right;
        }
        else if (Math.abs(a.bounds[3] - b.bounds[1]) < .001 && a.bounds[0] === b.bounds[0]) {
            aa = a.bottom;
            bb = b.top;
        }
        else if (Math.abs(b.bounds[3] - a.bounds[1]) < .001 && a.bounds[0] === b.bounds[0]) {
            aa = a.top;
            bb = b.bottom;
        }
        if (!aa || !bb)
            continue;
        seamReport.pairs++;
        const av = new Map(aa.flatMap(e => [[e.a, e.ya], [e.b, e.yb]])), bv = new Map(bb.flatMap(e => [[e.a, e.ya], [e.b, e.yb]]));
        for (const [s, y] of av)
            if (bv.has(s)) {
                seamReport.sharedVertexSamples++;
                seamReport.maximumSharedDelta = Math.max(seamReport.maximumSharedDelta, Math.abs(y - bv.get(s)));
            }
        const coords = [...new Set([...av.keys(), ...bv.keys()])].sort((a, b) => a - b), samples = [...coords, ...coords.slice(1).map((n, i) => (n + coords[i]) / 2)];
        let maximumDelta = 0, over10mm = 0, worstAt = 0;
        for (const s of samples) {
            const ay = edgeHeight(aa, s), by = edgeHeight(bb, s);
            if (ay === undefined || by === undefined)
                continue;
            const delta = Math.abs(ay - by);
            seamReport.interpolatedSamples++;
            seamReport.maximumInterpolatedDelta = Math.max(seamReport.maximumInterpolatedDelta, delta);
            if (delta > maximumDelta) {
                maximumDelta = delta;
                worstAt = s;
            }
            if (delta > .01) {
                seamReport.over10mm++;
                over10mm++;
            }
            if (delta > .1)
                seamReport.over100mm++;
            if (delta > .1 && seamReport.examples.length < 12)
                seamReport.examples.push({ tiles: [id, otherId], at: s, delta });
        }
        if (over10mm)
            seamReport.failedPairs.push({ tiles: [id, otherId], maximumDelta, over10mm, worstAt });
    }
const finalHashes = hashes(), changedSources = Object.keys(initialHashes).filter(f => initialHashes[f] !== finalHashes[f]);
const sourceSnapshot = { gitCommit: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(), hashes: initialHashes, changedDuringAudit: changedSources };
const successfulTiles = tileReports.filter(t => !t.buildError).length;
for (const probe of dynamicGeneratorProbes)
    if (probe.nonFinite || probe.invalidIndices)
        failures.push({ kind: 'dynamic-generator-invalid', id: probe.family, detail: `${probe.nonFinite} nonfinite values; ${probe.invalidIndices} invalid indices` });
const duplicateIds = [...inventoryIds].filter(([, locations]) => locations.length > 1).map(([id, tiles]) => ({ id, tiles }));
const selectedIds = new Set(selected.map(t => t.id)), renderedBuildingIds = new Set(inventory.filter(p => p.family === 'building').map(p => String(p.id)));
const baselineBuildings = (buildingBaseline?.buildings || []).filter(p => selectedIds.has(p.tile)), baselineBuildingIds = new Set(baselineBuildings.map(p => p.id));
const expectedCohort = (buildingBaseline?.boundaryRegressionCohort || []).filter(p => selectedIds.has(p.tile));
const buildingRetention = { baseline: buildingBaseline ? baselinePath : null, baselineBuildingsInSelected: baselineBuildings.length, renderedBuildingsInSelected: renderedBuildingIds.size, regressionCohortExpected: expectedCohort.length, regressionCohortRetained: expectedCohort.filter(p => renderedBuildingIds.has(p.id)).length, missingRegressionCohort: expectedCohort.filter(p => !renderedBuildingIds.has(p.id)), droppedBaselineBuildings: baselineBuildings.filter(p => !renderedBuildingIds.has(p.id)), addedBuildingIds: [...renderedBuildingIds].filter(id => !baselineBuildingIds.has(id)).sort(), note: 'Every omission is disclosed. Previously failing regression assets must remain present; other changed retention requires review and cannot be called a full source-instance completeness pass.' };
const rejectedSourceInstances = inventory.filter(p => p.family === 'rejected-building');
const unsupportedSourceAttachments = inventory.filter(p => p.family === 'unsupported-source-attachment');
const rejectionRegister = 'docs/reports/authored-source-rejections.json';
const sourceInstanceFidelity = { status: rejectedSourceInstances.length || unsupportedSourceAttachments.length ? 'unaccepted' : 'not certified by this geometry audit', scope: 'Detailed source/site fidelity is separate from physically consistent rendered geometry and regression retention.', rejectedInstances: rejectedSourceInstances, unsupportedSourceAttachments, register: existsSync(rejectionRegister) ? { path: rejectionRegister, sha256: sha(readFileSync(rejectionRegister)) } : null, sourceEvidence: ['public/data/building-access-evidence.json', 'public/data/building-access-evidence.geojson'], requiredReview: 'Reconcile layered roads, access openings and structural levels before accepting these source instances; author typed support for flagged cable attachments. Do not clear fidelity by rejecting or dropping geometry.' };
inventory.sort((a, b) => String(a.manifestId).localeCompare(String(b.manifestId)));
mkdirSync('docs/reports', { recursive: true });
const inventoryPath = reportPath === 'docs/reports/geometry.json' ? 'docs/reports/placed-assets.json' : reportPath.replace(/\.json$/, '-placed-assets.json');
const manifest = { version: 1, sourceSnapshot, scope: 'Every buildTile.placements record, supplemented by actual baked procedural tree roots. Terrain, road/track ribbon components and dynamic renderer assets are outside this inventory; component metadata remains in their generators.', instances: inventory, duplicateSourceInstanceIds: duplicateIds, identity: 'manifestId combines tile, family and emitted ID; multipart source buildings retain their sourceId and use deterministic footprint-hash part IDs' };
const manifestText = JSON.stringify(manifest) + '\n';
writeFileSync(inventoryPath, manifestText);
const affectedTiles = {
    roadSurfaceIntrusions: tileReports.filter(t => t.contact?.roadSurfaceIntrusions).map(t => t.id),
    rawRoadPathHeightWarnings: tileReports.filter(t => t.contact?.roadAboveGroundFailures).map(t => t.id),
    missingSameLevelRoadSurface: tileReports.filter(t => t.contact?.roadSurfaceMissingSamples).map(t => t.id),
    ballastIntrusions: tileReports.filter(t => t.contact?.ballastAboveGroundFailures).map(t => t.id),
    treeSupport: tileReports.filter(t => t.contact?.treeGapOver10mm || t.contact?.treeNoSoilHit).map(t => t.id),
    buildingSupport: tileReports.filter(t => t.contact?.buildingFloorIntrusions || t.contact?.buildingFoundationGaps).map(t => t.id),
    buildingUncertified: tileReports.filter(t => t.contact?.buildingNoSoilHit || t.contact?.buildingUnassociatedBodies).map(t => t.id),
    seams: [...new Set(seamReport.failedPairs.flatMap(p => p.tiles))].sort(),
};
const criteria = [
    { id: 'finite-mesh-materials', status: failures.length || textureViolations.length ? 'fail' : 'sampled pass', coverage: 'All generated vertex/index buffers, actual baked materials and listed representative dynamic generators' },
    { id: 'terrain-road-surface', status: sums.roadSurfaceIntrusions ? 'fail' : sums.roadSurfaceMissingSamples ? 'uncertified' : 'sampled pass', coverage: 'Actual same-level asphalt/footway triangles at finite path/width samples; raw path-height warnings are diagnostic only' },
    { id: 'terrain-ballast', status: sums.ballastAboveGroundFailures ? 'fail' : ballastCoverage.missingTop || ballastCoverage.missingSoil ? 'uncertified' : 'sampled pass', coverage: 'Both running paths at source segment midpoints outside bores; actual same-level baked canted-bed tops matched within100mm, with actual neighbor soil for cross-owner points.' },
    { id: 'tree-soil-contact', status: sums.treeGapOver10mm ? 'fail' : sums.treeNoSoilHit ? 'uncertified' : 'sampled pass', coverage: 'Actual transformed procedural tree root anchors against emitted terrain triangles' },
    { id: 'building-soil-contact', status: sums.buildingFloorIntrusions || sums.buildingFoundationGaps || sums.buildingNoSoilHit > sums.buildingNeighborTargetNotBuilt ? 'fail' : sums.buildingNoSoilHit || sums.buildingUnassociatedBodies ? 'uncertified' : 'sampled pass', coverage: 'Rendered body/plinth bounds versus whole-footprint finite samples, using actual neighbor terrain for cross-owner points. Missing real-world tiles or emitted soil hits fail; omitted calibration neighbors remain uncertified.' },
    { id: 'platform-support', status: sums.platformContainmentFailures || sums.platformSupportHeightFailures || sums.platformPlinthVolumeFailures ? 'fail' : sums.platformNoCookedTopHit ? 'uncertified' : 'sampled pass', coverage: 'Emitted top triangles, declared support point, actual levelling-plinth bounds where used' },
    { id: 'platform-running-clearance', status: platformClearances.some(p => p.intrusions) ? 'fail' : 'sampled pass', coverage: 'Both physical paths and travel directions at 1m intervals; 1.55m half-width with10mm numerical allowance, not a complete stock swept-volume test' },
    { id: 'terrain-tile-seams', status: seamReport.over10mm ? 'fail' : 'sampled pass', coverage: 'Repeated boundary vertices plus all union endpoints/midpoints on built neighbor edges' },
    { id: 'instance-identities', status: duplicateIds.length ? 'fail' : 'sampled pass', coverage: 'Every emitted buildTile placement plus procedural tree root in the persisted inventory' },
    { id: 'boundary-regression-retention', status: buildingRetention.missingRegressionCohort.length || sums.uncoveredBuildingSupports ? 'fail' : buildingBaseline ? 'sampled pass' : 'uncertified', coverage: 'All previously failing boundary buildings must remain rendered; every other baseline omission is disclosed. Actual uncovered-support rejection counters are also checked.' },
    { id: 'rendered-inner-face-gauge', status: gaugeReport.failures || gaugeReport.maximumFrameNormError > 1e-5 || gaugeReport.maximumFrameDot > 1e-5 ? 'fail' : !gaugeReport.measured || gaugeReport.missing || gaugeReport.ambiguous ? 'uncertified' : 'sampled pass', coverage: gaugeReport.scope },
];
const mandatoryFailed = criteria.filter(c => c.status === 'fail').map(c => c.id);
const result = {
    generatedAt: new Date().toISOString(),
    method: 'CPU buildTile cooked geometry audit; emitted terrain triangles and actual derived platform/road top meshes, not initialized support-failure counters',
    coverage: { tilesAttempted: selected.length, tilesBuilt: successfulTiles, totalSourceTiles: data.tiles.length, allTilesBuilt: successfulTiles === data.tiles.length, stationRegions: [...stationCoverage.values()], platformSourceCount: data.platforms.length, derivedPlatformCount: platforms.length, mappedPlatformIdsEmitted: inventory.filter(p => p.family === 'mapped-platform').map(p => p.id), platformTopTrianglesMeasured: platformMesh.triangles.length, derivedSourceSwitchesAttached: sourceTrackwork.switches.length, precomputedNeighborSoilLocations: [...neighborLocations.values()].reduce((n, p) => n + p.size, 0), neighborSoilLocationsMeasured: neighborSoil.size },
    sourceSnapshot, hardFailures: failures, criteria, mandatoryGeometryFailures: mandatoryFailed, measurements: sums,
    thresholds: { supportGap: 0.01, majorSupportGap: 0.1, platformHalfWidth: 1.55, platformNumericalAllowance: 0.01, platformSamplingStep: 1, railSamplingStep: 8, roadSamplingStep: 'max(4m,path length/80)', actualRoadHeightMatchWindow: 0.1, triangleEdgeQuantizationAllowance: 0.002 },
    materialAudit: { uniqueActualMaterials: materialIds.size, prohibitedSceneTextureInputs: textureViolations, scope: 'Actual Batch.add materials and representative dynamic train/vehicle/signal/crossing/AWS/TPWS/person generator meshes; rendering buffers and UI text excluded' },
    dynamicGeneratorProbes, platformClearances, platformSupportCases: platformCases, terrainSeams: seamReport, ballastCoverage, renderedInnerFaceGauge: { ...gaugeReport, minimum: Number.isFinite(gaugeReport.minimum) ? gaugeReport.minimum : null, maximum: Number.isFinite(gaugeReport.maximum) ? gaugeReport.maximum : null }, roadCases: [...roadCases.values()], buildingFailureCases, buildingRetention, sourceInstanceFidelity, affectedTiles, factoryCalls: familyCounts,
    placedAssetInventory: { path: inventoryPath, sha256: sha(manifestText), instances: inventory.length, duplicateSourceInstanceIds: duplicateIds.length, scope: manifest.scope },
    sourcePlatformsUnchanged: JSON.stringify(data.platforms) === originalPlatforms, examples, tiles: tileReports, wallSeconds: (performance.now() - started) / 1000,
    unverified: ['Independent real-world control-point/height survey', 'Continuous swept-volume intersections against every asset; samples are finite', 'All bridge/tunnel/culvert interior volumes and supports', 'Any unresolved cross-owner building sample or missing same-level road-top sample is disclosed; it is not a passed contact check', 'GPU/frame-time/streaming stall acceptance and two-hour browser soak', 'Three local human recognition reviews', 'A global 10mm contact certificate: measured discrepancies are reported, not suppressed'],
    status: changedSources.length ? 'source files changed during audit; rerun final snapshot' : mandatoryFailed.length ? 'MANDATORY GEOMETRY FAILURES REMAIN; see criteria and affectedTiles' : 'No sampled mandatory failure; uncertified coverage and independent acceptance gates remain explicit',
};
writeFileSync(reportPath, JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify({ report: reportPath, tiles: selected.length, wallSeconds: result.wallSeconds, measurements: sums, seams: seamReport, platformClearanceFailures: platformClearances.reduce((n, x) => n + x.intrusions, 0), changedSources }, null, 2));
if (textureViolations.length || failures.length || mandatoryFailed.length || changedSources.length)
    process.exitCode = 1;
