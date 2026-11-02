import { GRID, anchor, position, connections, piece } from './grid.js';
import { referencePiece, instantiatePiece, matchingPorts, occupiedQuarters, constructionPath } from './piece-registry.js';
import { ConstructionTerrain } from './terrain-grid.js';

const fail = (id, message) => { throw new Error(`PREFAB ${id}: ${message}`); };
const unit = v => { const n = Math.hypot(...v); return v.map(x => x / n); };
export function enumHas(enums, category, value) { return enums.enums[category]?.some(e => e.id === value); }
export function transform(instance, p) {
    const [x, y, z] = position(instance.anchor), r = instance.rotation;
    const [dx, dz] = [[p[0], p[2]], [-p[2], p[0]], [-p[0], -p[2]], [p[2], -p[0]]][r];
    return [x + dx, y + p[1], z + dz];
}

/** Analytic cubic grade: check interior extrema as well as endpoint grades.
 * Heights are ticks at boundaries; smooth geometry between them is not re-quantised. */
export function verticalProfile(profile, length, limits, id) {
    if (!profile || !Number.isSafeInteger(profile.riseTicks) || ![profile.startGrade, profile.endGrade].every(Number.isFinite)) fail(id, 'invalid full-section profile');
    const rise = profile.riseTicks * GRID.heightStep, a = length * (profile.startGrade + profile.endGrade) - 2 * rise,
        b = 3 * rise - length * (2 * profile.startGrade + profile.endGrade), c = length * profile.startGrade;
    const height = t => ((a * t + b) * t + c) * t;
    const grade = t => (3 * a * t * t + 2 * b * t + c) / length;
    const candidates = [0, 1], peak = a ? -b / (3 * a) : -1;
    if (peak > 0 && peak < 1) candidates.push(peak);
    const grades = candidates.map(grade), maximum = Math.max(...grades.map(Math.abs));
    const transition = Math.max(Math.abs(2 * b), Math.abs(6 * a + 2 * b)) * GRID.cellSize / (length * length);
    const state = rise > 0 ? 'FULL_TILE_UPHILL' : rise < 0 ? 'FULL_TILE_DOWNHILL' : 'LEVEL';
    if (profile.state !== state || (state === 'LEVEL' && maximum > 1e-10)) fail(id, 'grade ownership disagrees with profile');
    if (rise && length < GRID.cellSize - 1e-8) fail(id, 'a slope requires a complete construction section');
    if (rise > 0 && Math.min(...grades) < -1e-10 || rise < 0 && Math.max(...grades) > 1e-10) fail(id, 'profile reverses grade inside section');
    if (maximum > limits.maximum + 1e-9) fail(id, `interior gradient ${maximum} exceeds ${limits.maximum}`);
    if (transition > limits.transitionPerTile + 1e-9) fail(id, `vertical transition ${transition} exceeds ${limits.transitionPerTile}`);
    return { height, grade, maximum, transition, state };
}

function pathFor(instance, def, catalogue) {
    const g = def.geometry, ref = referencePiece(g.mode, g.referenceId);
    if (!['straight', 'arc'].includes(ref.family)) fail(instance.id, 'reference family has no construction profile adapter yet');
    const radius = g.radiusMetres ?? ref.radiusTiles * GRID.cellSize, curved = ref.family === 'arc';
    const length = curved ? radius * Math.PI / 2 : GRID.cellSize;
    const limits = catalogue.gradeLimits[def.infrastructureClass];
    if (!limits) fail(instance.id, 'missing infrastructure gradient class');
    const vertical = verticalProfile(instance.profile, length, limits, instance.id);
    // Keep reference IDs, exact centimetre/tick anchors and existing port semantics.
    const item = instantiatePiece({ id: instance.id, mode: g.mode, referenceId: g.referenceId, origin: position(instance.anchor), rotation: instance.rotation, radiusMetres: g.radiusMetres, grade: 0, nodes: instance.nodes });
    item.constructionProfile = {...instance.profile, origin:instance.anchor, rotation:instance.rotation, radiusMetres:g.radiusMetres};
    const {sample} = constructionPath(item);
    const endpoints = [sample(0), sample(length)];
    item.ports = endpoints.map((q, i) => ({ node: instance.nodes[i], mode: g.mode, anchor: anchor(q.position), vector: unit(q.tangent).map(v => v * (i ? -1 : 1)) }));
    const count = Math.ceil(length / 2);
    item.anchors = Array.from({ length: count + 1 }, (_, i) => anchor(sample(i * length / count).position));
    item.minLevel = Math.min(item.ports[0].anchor[1], item.ports[1].anchor[1]);
    item.maxLevel = Math.max(item.ports[0].anchor[1], item.ports[1].anchor[1]) + Math.ceil(def.clearance.height / GRID.heightStep);
    return { length, sample, vertical, item };
}

export function resolveCatalogue(catalogue, enums) {
    if (catalogue.schema !== 1 || enums.schema !== 1) fail('catalogue', 'unsupported schema');
    const definitions = new Map();
    for (const def of catalogue.prefabs) {
        if (!def.id || definitions.has(def.id)) fail(def.id, 'duplicate/missing definition');
        for (const [category, value] of [['WorldObjectKind', def.kind], ['PlacementRule', def.placementRule]])
            if (!enumHas(enums, category, value)) fail(def.id, `unknown ${category} ${value}`);
        if (!def.dimensions?.every(n => Number.isFinite(n) && n > 0) || def.dimensions.length !== 3 || !def.footprint?.length || !def.orientations?.length || !def.support || !def.clearance || !def.lod || !def.asset)
            fail(def.id, 'incomplete definition');
        definitions.set(def.id, def);
    }
    return definitions;
}

/** One instance owns its geometry; terrain cells only index its occupied area. */
export function resolveComposition(chunks, catalogue, enums, {validateIndex=true}={}) {
    const definitions = resolveCatalogue(catalogue, enums), instances = new Map(), owners = new Map(), chunkIds = new Set();
    for (const chunk of chunks) {
        if (chunk.schema !== 1 || !chunk.id || chunkIds.has(chunk.id)) fail(chunk.id, 'invalid/duplicate chunk');
        if (!Array.isArray(chunk.bounds) || chunk.bounds.length!==4 || !chunk.bounds.every(Number.isFinite) || chunk.bounds[2]<=chunk.bounds[0] || chunk.bounds[3]<=chunk.bounds[1]) fail(chunk.id,'invalid chunk bounds');
        if(chunk.bounds.some(n=>!Number.isInteger(n/GRID.cellSize)) || chunk.terrain.length!==(chunk.bounds[2]-chunk.bounds[0])*(chunk.bounds[3]-chunk.bounds[1])/(GRID.cellSize**2)) fail(chunk.id,'incomplete construction terrain coverage');
        for(const c of chunk.terrain) if(c.x*GRID.cellSize<chunk.bounds[0] || (c.x+1)*GRID.cellSize>chunk.bounds[2] || c.z*GRID.cellSize<chunk.bounds[1] || (c.z+1)*GRID.cellSize>chunk.bounds[3]) fail(chunk.id,'terrain outside owner chunk');
        chunkIds.add(chunk.id);
        for (const i of chunk.instances) {
            if (instances.has(i.id)) fail(i.id, 'duplicate canonical instance');
            const def = definitions.get(i.prefabId);
            if (!def) fail(i.id, `missing prefab ${i.prefabId}`);
            if (!Array.isArray(i.anchor) || i.anchor.length !== 3 || !i.anchor.every(Number.isSafeInteger) || !def.orientations.includes(i.rotation)) fail(i.id, 'invalid anchor or orientation');
            const p=position(i.anchor);if(p[0]<chunk.bounds[0] || p[0]>=chunk.bounds[2] || p[2]<chunk.bounds[1] || p[2]>=chunk.bounds[3]) fail(i.id,'anchor is outside canonical owner chunk');
            if (!i.source?.confidence || !enumHas(enums, 'SourceConfidence', i.source.confidence)) fail(i.id, 'missing provenance');
            if (Object.keys(i.variant || {}).some(k => !def.variants?.[k]?.includes(i.variant[k]))) fail(i.id, 'unsupported variant');
            instances.set(i.id, { instance: i, definition: def }); owners.set(i.id, chunk.id);
        }
    }
    const cells = chunks.flatMap(c => c.terrain), terrain = new ConstructionTerrain(cells), occupancy = new Map(), paths = new Map();
    for (const c of cells) {
        if (definitions.get(c.prefabId)?.geometry.type !== 'terrain') fail(`${c.x},${c.z}`, 'missing terrain prefab');
        if (!['GRASS','GRAVEL'].includes(c.material)) fail(`${c.x},${c.z}`, 'terrain material has no renderer yet');
        for (const [category, value] of [['TerrainMaterial', c.material], ['LandCoverType', c.landCover], ['EarthworkType', c.earthwork], ['TerrainSlopeShape', c.slopeShape]])
            if (!enumHas(enums, category, value)) fail(`${c.x},${c.z}`, `unknown ${category}`);
        if (!['FLAT', 'CUSTOM_CORNER_HEIGHTS'].includes(c.slopeShape) || c.slopeShape === 'FLAT' && c.cornerTicks.some(Boolean)) fail(`${c.x},${c.z}`, 'unsupported or inconsistent slope shape');
        if (c.waterLevelTicks !== null) fail(`${c.x},${c.z}`, 'water requires an implemented water prefab');
    }
    for (const [id, entry] of instances) {
        const { instance: i, definition: d } = entry;
        if (d.geometry.type === 'transport') {
            if (!Array.isArray(i.nodes) || i.nodes.length !== 2 || i.nodes.some(n => typeof n !== 'string' || !n)) fail(id, 'two named ports required');
            entry.path = pathFor(i, d, catalogue); paths.set(id, entry.path);
        }
        const fp = d.footprint.map(([x, z]) => transform(i, [x, 0, z]));
        entry.footprint = fp;
        const count = entry.path ? Math.ceil(entry.path.length) : 0;
        const samples = entry.path ? Array.from({ length: count + 1 }, (_, n) => entry.path.sample(n * entry.path.length / count).position) : null;
        if (d.geometry.type === 'junction') {
            if (i.nodes?.length !== d.ports.length) fail(id, 'junction needs named ports');
            entry.junctionPieces = d.ports.map((port, n) => piece(`${id}/arm/${n}`, [transform(i, port.position), transform(i, [0,0,0])], [i.nodes[n], `${id}/centre`], 'road'));
        }
        // Quarter-cell corridor occupancy is shared with the existing piece registry.
        const occupied = samples ? occupiedQuarters(samples, d.clearance.halfWidth).map(([x,z]) => `${x},${z}`) : [];
        if (!samples) {
            const minX = Math.floor(Math.min(...fp.map(p => p[0])) / GRID.cellSize), maxX = Math.ceil(Math.max(...fp.map(p => p[0])) / GRID.cellSize) - 1;
            const minZ = Math.floor(Math.min(...fp.map(p => p[2])) / GRID.cellSize), maxZ = Math.ceil(Math.max(...fp.map(p => p[2])) / GRID.cellSize) - 1;
            for (let x = minX; x <= maxX; x++) for (let z = minZ; z <= maxZ; z++) occupied.push(`${x},${z}`);
        }
        entry.cells = [...new Set(occupied)].sort();
        if (validateIndex && JSON.stringify(entry.cells) !== JSON.stringify(i.occupancy)) fail(id, 'stored occupancy does not match swept footprint');
        for (const key of entry.cells) {
            if (!terrain.cells.has(key)) fail(id, `missing occupied terrain cell ${key}`);
            const stack = occupancy.get(key) || []; stack.push(id); occupancy.set(key, stack);
        }
        if (i.support?.instanceId) continue; // Resolve inter-instance supports after all paths exist.
        const y = position(i.anchor)[1];
        if (d.placementRule === 'LEVEL_FOUNDATION_REQUIRED') {
            if (i.foundation?.type !== 'LEVEL_SLAB' || !Number.isSafeInteger(i.foundation.bottomTicks)) fail(id, 'explicit slab required');
            const low = i.foundation.bottomTicks * GRID.heightStep;
            const probes = [...fp, position(i.anchor)];
            // Sample every terrain corner under the slab, plus footprint edges on a 1 m lattice.
            for (const key of entry.cells) for (const p of terrain.vertices(terrain.cells.get(key)))
                if (p[0] >= Math.min(...fp.map(p=>p[0])) && p[0] <= Math.max(...fp.map(p=>p[0])) && p[2] >= Math.min(...fp.map(p=>p[2])) && p[2] <= Math.max(...fp.map(p=>p[2]))) probes.push(p);
            for (let n=0;n<fp.length;n++) { const a=fp[n],b=fp[(n+1)%fp.length],count=Math.ceil(Math.hypot(b[0]-a[0],b[2]-a[2])); for(let j=0;j<=count;j++) probes.push(a.map((v,k)=>v+(b[k]-v)*j/count)); }
            if (low >= y || probes.some(p => terrain.raw(p[0], p[2]) < low - 1e-8 || terrain.raw(p[0], p[2]) > y + 1e-8) || y-low>d.support.maximumDepth) fail(id, 'foundation floats, is buried, or exceeds support depth');
        } else if (d.placementRule === 'FOLLOWS_GROUND') {
            if (Math.abs(y - terrain.raw(...[position(i.anchor)[0], position(i.anchor)[2]])) > 1e-8) fail(id, 'root does not meet terrain');
        } else if (d.geometry.type === 'bridge') {
            if (!Array.isArray(i.supports) || i.supports.length !== d.geometry.bearings.length) fail(id, 'bridge bearings missing');
            d.geometry.bearings.forEach((local, n) => { const p = transform(i, local), s = i.supports[n]; if (!Number.isSafeInteger(s.bottomTicks) || Math.abs(s.bottomTicks*GRID.heightStep-terrain.raw(p[0],p[2]))>1e-8 || s.bottomTicks*GRID.heightStep >= y-d.geometry.deckDepth) fail(id, 'unsupported bridge bearing'); });
        } else if (d.geometry.type === 'platform') {
            // Resolved below, after transport paths are available.
        } else if (samples) {
            for (const p of samples) {
                const depth = p[1] - terrain.raw(p[0], p[2]);
                if (depth < d.support.minimumDepth - 1e-8 || depth > d.support.maximumDepth + 1e-8) fail(id, 'transport formation lacks ground support');
            }
        } else if (d.placementRule === 'NEAR_LEVEL_PREFERRED' && fp.some(p => p[1] < terrain.raw(p[0],p[2]) || p[1] - terrain.raw(p[0],p[2]) > d.support.maximumDepth)) fail(id, 'junction support invalid');
    }
    for (const [id, { instance: i, definition: d, path }] of instances) if (i.support?.instanceId) {
        const support = instances.get(i.support.instanceId);
        if (!support || support.definition.geometry.type !== 'bridge' || i.support.surface !== 'BRIDGE_DECK' || !path) fail(id, 'invalid support relationship');
        const sy = position(support.instance.anchor)[1], fp = support.footprint;
        for (let s = 0; s <= path.length; s += .5) {
            const p = path.sample(s).position;
            if (Math.abs(p[1]-sy)>1e-8 || p[0] < Math.min(...fp.map(p=>p[0])) || p[0] > Math.max(...fp.map(p=>p[0])) || p[2] < Math.min(...fp.map(p=>p[2])) || p[2] > Math.max(...fp.map(p=>p[2]))) fail(id, 'path leaves its supporting bridge');
        }
        void d;
    }
    for (const c of cells) if (validateIndex && JSON.stringify([...(c.instances || [])].sort()) !== JSON.stringify((occupancy.get(`${c.x},${c.z}`) || []).sort())) fail(`${c.x},${c.z}`, 'tile references disagree with canonical occupancy');
    for (const [id, entry] of instances) if (entry.definition.geometry.type === 'platform') {
        const path = paths.get(entry.instance.track);
        if (!path || path.item.ports[0].mode !== 'rail' || Math.abs(path.length - entry.definition.dimensions[0]) > .001) fail(id, 'platform needs a matching rail section');
        const q = path.sample(0), expected = q.position.map((v,k)=>v+q.right[k]*entry.definition.geometry.trackOffset);
        if (anchor(expected).some((v,k)=>v!==entry.instance.anchor[k]) || entry.instance.rotation !== instances.get(entry.instance.track).instance.rotation) fail(id, 'platform binding/boarding offset mismatch');
    }
    const items = [...paths.values()].map(p => p.item).concat([...instances.values()].flatMap(e=>e.junctionPieces || [])); connections(items);
    const nodes = new Map();
    for (const item of items) for (const port of item.ports) { const key = `${port.mode}/${port.node}`, list = nodes.get(key) || []; list.push(port); nodes.set(key, list); }
    for (const [key, ports] of nodes) if (ports.length === 2 && !matchingPorts(ports[0], ports[1], 1-1e-9)) fail(key, 'port heading/grade mismatch');
    // Explicit crossing checks use the actual profile and underside, never plan connectivity.
    for (const chunk of chunks) for (const crossing of chunk.crossings || []) {
        const lower = paths.get(crossing.lower), upper = instances.get(crossing.upper);
        if (!lower || upper?.definition.geometry.type !== 'bridge') fail(chunk.id, 'invalid crossing references');
        const p = lower.sample(crossing.distance).position, fp = upper.footprint;
        if (p[0]<Math.min(...fp.map(p=>p[0])) || p[0]>Math.max(...fp.map(p=>p[0])) || p[2]<Math.min(...fp.map(p=>p[2])) || p[2]>Math.max(...fp.map(p=>p[2]))) fail(chunk.id, 'crossing does not overlap');
        const clearance = position(upper.instance.anchor)[1] - upper.definition.geometry.deckDepth - p[1];
        if (clearance < crossing.minimumClearance) fail(chunk.id, 'bridge clearance violated');
    }
    return { definitions, instances, owners, terrain, occupancy, paths, pieces: items };
}
