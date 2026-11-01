import * as THREE from 'three';
import { Polyline, RouteGeometry, clamp, mix, gaugeRight, sectionUp } from '../core/geometry.js';
import { Batch, packetGeometry } from './batch.js';
export const UK_TRACK_GAUGE = 1.435, RAIL_HEAD_WIDTH = .075, RAIL_CENTRE_OFFSET = (UK_TRACK_GAUGE + RAIL_HEAD_WIDTH) / 2;
const horizontal = (a, b) => Math.hypot(a[0] - b[0], a[2] - b[2]);
const unit = (a, b) => { const d = Math.hypot(b[0] - a[0], b[2] - a[2]) || 1; return [(b[0] - a[0]) / d, 0, (b[2] - a[2]) / d]; };
const dot = (a, b) => a[0] * b[0] + a[2] * b[2];
const orient = (edge, node) => edge.from === node ? edge.points : edge.points.slice().reverse();
const fade = (x) => { const t = clamp(x, 0, 1); return t * t * (3 - 2 * t); };
const normalize = (value) => { const length = Math.hypot(...value) || 1; return value.map(x => x / length); };
const facingFrame = (pose, direction) => ({ gaugeRight: gaugeRight(pose).map(x => x * direction), unitUp: sectionUp(pose) });
const orthogonalUp = (up, right) => { const along = up.reduce((n, x, j) => n + x * right[j], 0); return normalize(up.map((x, j) => x - along * right[j])); };
function interpolatedFrame(path, frames, s) {
    const i = path.segment(clamp(s, 0, path.length));
    const t = clamp((s - path.lengths[i]) / (path.lengths[i + 1] - path.lengths[i] || 1), 0, 1), a = frames[i], b = frames[i + 1];
    const right = normalize(a.gaugeRight.map((x, j) => mix(x, b.gaugeRight[j], t)));
    return { gaugeRight: right, unitUp: orthogonalUp(a.unitUp.map((x, j) => mix(x, b.unitUp[j], t)), right) };
}
function framedPosition(path, frames, s, offset, depth = 0) {
    const pose = path.sample(s), frame = interpolatedFrame(path, frames, s);
    return pose.position.map((x, j) => x + frame.gaugeRight[j] * offset - frame.unitUp[j] * depth);
}
/** A gauge offset in the switch's facing direction, with the same cant datum as runtime rails. */
export function switchRailPosition(definition, which, s, offset) {
    return framedPosition(new Polyline(which === 'normal' ? definition.normalPath : definition.branchPath), which === 'normal' ? definition.normalFrames : definition.branchFrames, s, offset);
}
function switchFormationSections(definition) {
    const normal = new Polyline(definition.normalPath), branch = new Polyline(definition.branchPath), toe = normal.lengths[definition.toeIndex];
    return normal.points.map((_, i) => {
        const s = normal.lengths[i], n = normal.sample(s), r = branch.sample(Math.max(0, s - toe)), frame = interpolatedFrame(normal, definition.normalFrames, s), separation = r.position.reduce((sum, x, j) => sum + (x - n.position[j]) * frame.gaugeRight[j], 0), left = Math.min(0, separation) - 1.63, right = Math.max(0, separation) + 1.63;
        return { topLeft: framedPosition(normal, definition.normalFrames, s, left, .29), topRight: framedPosition(normal, definition.normalFrames, s, right, .29), bottomLeft: framedPosition(normal, definition.normalFrames, s, left - .35, .64), bottomRight: framedPosition(normal, definition.normalFrames, s, right + .35, .64) };
    });
}
/** Recover only simple, physically connectable source-node switches. No station-anchor inventions. */
export function deriveTrackwork(route) {
    const network = route.data.network;
    if (!network?.nodes || !network.edges)
        return { switches: [], gaps: ['No source-node rail graph was supplied.'] };
    const edges = new Map(network.edges.map(e => [e.id, e])), nodes = new Map(network.nodes.map(n => [n.id, n]));
    const switches = [], gaps = [];
    const candidates = network.nodes.filter(n => n.edges.length === 3).sort((a, b) => a.id.localeCompare(b.id));
    for (const node of candidates) {
        const sourceEdges = node.edges.map(id => edges.get(id)).filter((e) => !!e && e.points.length >= 2);
        if (sourceEdges.length !== 3)
            continue;
        const projected = route.project(node.position[0], node.position[2], 100);
        if (!Number.isFinite(projected.s) || projected.distance > 30)
            continue;
        let lane = 0, s = projected.s, distance = projected.distance;
        if (route.opposingPath) {
            const opposite = route.opposingPath.nearest(node.position[0], node.position[2]);
            if (opposite.distance < distance) {
                lane = 4.2;
                s = route.travel(0, opposite.s, 4.2);
                distance = opposite.distance;
            }
        }
        if (distance > 1.8) {
            gaps.push(`${node.id}: mapped junction is ${distance.toFixed(2)} m from the modelled running paths; retained as source graph, not an invented operating switch.`);
            continue;
        }
        const paths = sourceEdges.map(e => orient(e, node.id));
        const vectors = paths.map(points => { const path = new Polyline(points); return unit(points[0], path.sample(Math.min(8, path.length)).position); });
        let pair = [0, 1], parallel = -Infinity;
        for (const ab of [[0, 1], [0, 2], [1, 2]]) {
            const score = dot(vectors[ab[0]], vectors[ab[1]]);
            if (score > parallel) {
                parallel = score;
                pair = ab;
            }
        }
        const stemIndex = [0, 1, 2].find(i => !pair.includes(i));
        if (parallel < .65 || pair.some(i => dot(vectors[i], vectors[stemIndex]) > -.65)) {
            gaps.push(`${node.id}: graph branch is not a supported simple turnout geometry.`);
            continue;
        }
        const pose = route.lanePose(s, lane), direction = dot(vectors[pair[0]], pose.tangent) > 0 ? 1 : -1;
        // Choose the branch that actually continues this modelled running line.
        const score = (index) => { const p = new Polyline(paths[index]); let total = 0; for (const d of [6, 12, 20]) {
            const q = p.sample(Math.min(d, p.length)).position;
            const guess = route.travel(s, direction * Math.min(d, p.length), lane);
            total += horizontal(q, route.lanePose(guess, lane).position);
        } return total; };
        const normalIndex = score(pair[0]) <= score(pair[1]) ? pair[0] : pair[1], reverseIndex = pair.find(i => i !== normalIndex);
        if (score(normalIndex) > 9) {
            gaps.push(`${node.id}: neither outgoing edge continues the modelled running line closely enough for a proved normal route.`);
            continue;
        }
        // Follow only degree-two continuation. Never jump across another switch or a plan intersection.
        const branchEdges = [sourceEdges[reverseIndex]];
        let branch = paths[reverseIndex].map(p => [...p]), endNode = sourceEdges[reverseIndex].from === node.id ? sourceEdges[reverseIndex].to : sourceEdges[reverseIndex].from;
        let branchLength = new Polyline(branch).length;
        const visited = new Set([sourceEdges[reverseIndex].id]);
        while (branchLength < 42) {
            const nextNode = nodes.get(endNode);
            if (!nextNode || nextNode.edges.length !== 2)
                break;
            const nextId = nextNode.edges.find(id => !visited.has(id));
            const next = nextId && edges.get(nextId);
            if (!next)
                break;
            visited.add(next.id);
            const pts = orient(next, endNode);
            if (horizontal(branch.at(-1), pts[0]) > .1)
                break;
            branch.push(...pts.slice(1));
            branchEdges.push(next);
            endNode = next.from === endNode ? next.to : next.from;
            branchLength = new Polyline(branch).length;
        }
        if (branchLength < 18) {
            gaps.push(`${node.id}: reverse edge ends at another unresolved junction before a complete switch can fit.`);
            continue;
        }
        const rawPath = new Polyline(branch), branchMetres = Math.min(52, rawPath.length);
        const rawEndpoint = rawPath.sample(branchMetres).position;
        const toe = route.lanePose(s, lane).position, delta = toe.map((n, i) => n - branch[0][i]);
        const modelledBranch = [];
        for (let d = 0; d < branchMetres; d += 1) {
            const q = rawPath.sample(d).position, t = 1 - fade(d / Math.min(20, branchMetres));
            modelledBranch.push(q.map((v, i) => v + delta[i] * t));
        }
        modelledBranch.push(rawEndpoint);
        const finalNormal = route.lanePose(route.travel(s, direction * branchMetres, lane), lane).position;
        const lateral = dot(unit(toe, finalNormal), pose.tangent) * direction;
        if (lateral < .5)
            continue;
        const relative = rawEndpoint.map((v, i) => v - finalNormal[i]);
        const side = relative[0] * pose.right[0] + relative[2] * pose.right[2];
        if (Math.abs(side) < RAIL_CENTRE_OFFSET * 2) {
            gaps.push(`${node.id}: mapped routes do not separate enough to build a complete frog before their next junction.`);
            continue;
        }
        const hand = side * direction > 0 ? 1 : -1;
        const stemMetres = 14, normalPath = [], normalFrames = [], stem = [];
        for (let d = -stemMetres; d <= branchMetres; d += 1) {
            const q = route.lanePose(route.travel(s, direction * d, lane), lane);
            normalPath.push(q.position);
            normalFrames.push(facingFrame(q, direction));
            if (d < 0)
                stem.push(q.position);
        }
        if (horizontal(normalPath.at(-1), finalNormal) > .01) {
            normalPath.push(finalNormal);
            normalFrames.push(facingFrame(route.lanePose(route.travel(s, direction * branchMetres, lane), lane), direction));
        }
        const fittedBranch = new Polyline(modelledBranch), toeFrame = facingFrame(pose, direction);
        const branchFrames = modelledBranch.map((_, i) => { const d = Math.min(i, branchMetres), q = d >= 20 ? rawPath.sample(d) : fittedBranch.sample(fittedBranch.lengths[i]), t = fade(d / 20), right = gaugeRight(q), up = sectionUp(q), fittedRight = normalize(toeFrame.gaugeRight.map((x, j) => mix(x, right[j], t))); return { gaugeRight: fittedRight, unitUp: orthogonalUp(toeFrame.unitUp.map((x, j) => mix(x, up[j], t)), fittedRight) }; });
        const reversePath = [...stem, ...modelledBranch], toeIndex = stem.length;
        let frogIndex = -1;
        for (let i = 1; i < modelledBranch.length; i++) {
            const normal = route.lanePose(route.travel(s, direction * Math.min(i, branchMetres), lane), lane), axis = gaugeRight(normal);
            const q = modelledBranch[i];
            const offset = q.reduce((n, x, j) => n + (x - normal.position[j]) * axis[j], 0);
            if (Math.abs(offset) >= RAIL_CENTRE_OFFSET * 2) {
                frogIndex = i;
                break;
            }
        }
        if (frogIndex < 5) {
            gaps.push(`${node.id}: unresolved or excessively tight crossing geometry; reverse route is not fabricated.`);
            continue;
        }
        const startS = route.travel(s, -direction * stemMetres, lane), endS = route.travel(s, direction * branchMetres, lane);
        if (switches.some(p => p.lane === lane && Math.max(p.startS, Math.min(startS, endS)) < Math.min(p.endS, Math.max(startS, endS)))) {
            gaps.push(`${node.id}: overlaps a neighbouring simple-switch envelope; compound trackwork requires authoring.`);
            continue;
        }
        const definition = { id: `SW-${node.id}`, s, lane, sourceNode: node.id, direction,
            normalEdgeIds: [sourceEdges[stemIndex].id, sourceEdges[normalIndex].id], reverseEdgeIds: [sourceEdges[stemIndex].id, sourceEdges[reverseIndex].id], branchEdgeIds: branchEdges.map(e => e.id), sourceWayIds: [...new Set([...sourceEdges, ...branchEdges].flatMap(e => e.sourceWayIds || []))],
            normalPath, normalFrames, reversePath, branchPath: modelledBranch, branchFrames, formationSections: [], startS: Math.min(startS, endS), endS: Math.max(startS, endS), toeIndex, hand, frogIndex,
            sourcePosition: node.position, position: toe, sourceFitAdjustment: Math.hypot(...delta), sourceEndpoint: rawEndpoint, supportPaths: [normalPath, modelledBranch], gauge: UK_TRACK_GAUGE, replaceRunningRailWithinSpan: true,
            source: 'Retained source-node graph in the supplied rail SVG; normal path shares the runtime rail alignment; reverse rejoins its actual mapped edge.',
            confidence: 'Source connectivity retained; blade, frog, bearer dimensions and exact operational permissions are simulator authoring, not surveyed switch/interlocking proof.' };
        definition.formationSections = switchFormationSections(definition);
        switches.push(definition);
    }
    switches.sort((a, b) => a.s - b.s || a.lane - b.lane);
    if (switches.length && switches[0].s > route.length * .5)
        gaps.unshift('The retained node graph supplies eastern junctions only. Western switch topology is not replaced by fictional station-anchor points.');
    if (!switches.length)
        gaps.push('No source junction satisfied all simple-turnout connectivity and runtime alignment checks.');
    return { switches, gaps };
}
const railMaterial = new THREE.MeshStandardMaterial({ color: 0xa3aaa5, roughness: .55, metalness: .35, flatShading: true });
const sleeperMaterial = new THREE.MeshStandardMaterial({ color: 0x655d50, roughness: 1, flatShading: true });
const ballastMaterial = new THREE.MeshStandardMaterial({ color: 0x8b887c, roughness: 1, flatShading: true });
const motorMaterial = new THREE.MeshStandardMaterial({ color: 0x68766c, roughness: .9, flatShading: true });
const unitBox = new THREE.BoxGeometry(1, 1, 1);
const v = (p) => new THREE.Vector3(...p);
function railPiece(group, path, frames, start, end, offset, width, height, drop = 0) {
    const positions = [];
    for (const s of [start, end])
        for (const depth of [drop, drop + height])
            for (const side of [-1, 1])
                positions.push(...framedPosition(path, frames, s, offset + side * width / 2, depth));
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setIndex([0, 5, 4, 0, 1, 5, 2, 7, 3, 2, 6, 7, 0, 6, 2, 0, 4, 6, 1, 7, 5, 1, 3, 7, 0, 3, 1, 0, 2, 3, 4, 7, 6, 4, 5, 7]);
    geometry.computeVertexNormals();
    const mesh = new THREE.Mesh(geometry, railMaterial);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);
    return mesh;
}
function railProfile(group, path, frames, start, end, offset) {
    railPiece(group, path, frames, start, end, offset, RAIL_HEAD_WIDTH, .045);
    railPiece(group, path, frames, start, end, offset, .025, .07, .045);
    railPiece(group, path, frames, start, end, offset, .14, .025, .115);
}
function switchBed(group, sections) {
    const positions = [], indices = [];
    for (let i = 1; i < sections.length; i++) {
        const a = sections[i - 1], b = sections[i], base = positions.length / 3;
        for (const p of [a.topLeft, a.topRight, a.bottomLeft, a.bottomRight, b.topLeft, b.topRight, b.bottomLeft, b.bottomRight])
            positions.push(...p);
        indices.push(...[0, 5, 4, 0, 1, 5, 2, 7, 3, 2, 6, 7, 0, 6, 2, 0, 4, 6, 1, 7, 5, 1, 3, 7, 0, 3, 1, 0, 2, 3, 4, 7, 6, 4, 5, 7].map(n => n + base));
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    const mesh = new THREE.Mesh(geometry, ballastMaterial);
    mesh.receiveShadow = true;
    group.add(mesh);
}
function rails(group, points, frames, options = {}) {
    const path = new Polyline(points);
    for (const side of [-1, 1])
        for (let s = 0; s < path.length; s += 1) {
            let spans = [[s, Math.min(s + 1, path.length)]];
            for (const gap of options.gaps ?? [])
                if (gap.side === side) {
                    const { start: lo, end: hi } = gap;
                    spans = spans.flatMap(([a, b]) => b <= lo || a >= hi ? [[a, b]] : [[a, Math.min(b, lo)], [Math.max(a, hi), b]].filter(([x, y]) => y - x > .001));
                }
            for (const [start, end] of spans) {
                railProfile(group, path, frames, start, end, side * RAIL_CENTRE_OFFSET);
            }
        }
}
function bladeGeometry(path, frames, toe, side) {
    const positions = [], rights = [], weights = [], indices = [];
    for (let j = 0; j <= 8; j++) {
        const t = j / 8, s = toe + .1 + t * 7, w = mix(.008, .04, t), centre = framedPosition(path, frames, s, 0), unitOffset = framedPosition(path, frames, s, 1), right = unitOffset.map((n, i) => n - centre[i]);
        for (const [x, depth] of [[-w / 2, 0], [w / 2, 0], [-w / 2, .14], [w / 2, .14]]) {
            const offset = side * RAIL_CENTRE_OFFSET + x, p = framedPosition(path, frames, s, offset, depth);
            positions.push(...p);
            rights.push(...right);
            weights.push(1 - t);
        }
    }
    for (let j = 0; j < 8; j++) {
        const a = j * 4, b = a + 4;
        indices.push(a, a + 1, b + 1, a, b + 1, b, a + 2, b + 2, b + 3, a + 2, b + 3, a + 3, a, b, b + 2, a, b + 2, a + 2, a + 1, a + 3, b + 3, a + 1, b + 3, b + 1);
    }
    indices.push(0, 2, 3, 0, 3, 1, 32, 33, 35, 32, 35, 34);
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    const mesh = new THREE.Mesh(geometry, railMaterial);
    mesh.userData.basePositions = new Float32Array(positions);
    mesh.userData.rights = new Float32Array(rights);
    mesh.userData.weights = new Float32Array(weights);
    mesh.userData.side = side;
    mesh.castShadow = true;
    return mesh;
}
/** Geometry is already in canonical world coordinates. Replace base running rails in definition.startS/endS. */
export function makeSwitch(definition, options = {}) {
    const group = new THREE.Group();
    group.name = definition.id;
    const normal = new Polyline(definition.normalPath), branch = new Polyline(definition.branchPath), toe = normal.lengths[Math.min(definition.toeIndex, normal.points.length - 1)];
    const frog = branch.lengths[Math.min(definition.frogIndex, branch.points.length - 1)];
    const f = branch.sample(frog), fNormal = normal.nearest(f.position[0], f.position[2]), fs = fNormal.s;
    if (options.includeBallast !== false)
        switchBed(group, definition.formationSections);
    rails(group, definition.normalPath, definition.normalFrames, { gaps: [{ start: toe, end: toe + 7.1, side: definition.hand }, { start: fs - .35, end: fs + .35, side: definition.hand }] });
    rails(group, definition.branchPath, definition.branchFrames, { gaps: [{ start: 0, end: 7.1, side: -definition.hand }, { start: frog - .35, end: frog + .35, side: -definition.hand }] });
    // Long bearers span both connected routes, with support at the same rail-bed datum.
    for (let d = -12; d < branch.length; d += .72) {
        const n = normal.sample(toe + d), r = branch.sample(Math.max(0, d)), low = Math.min(0, (r.position[0] - n.position[0]) * n.right[0] + (r.position[2] - n.position[2]) * n.right[2]) - .98, high = Math.max(0, (r.position[0] - n.position[0]) * n.right[0] + (r.position[2] - n.position[2]) * n.right[2]) + .98;
        const frame = interpolatedFrame(normal, definition.normalFrames, toe + d), right = v(frame.gaugeRight), up = v(frame.unitUp), tangent = up.clone().cross(right).normalize(), bearer = new THREE.Mesh(unitBox, sleeperMaterial);
        bearer.position.fromArray(framedPosition(normal, definition.normalFrames, toe + d, (low + high) / 2, .215));
        bearer.scale.set(.24, .15, high - low);
        bearer.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(tangent, up, right));
        bearer.castShadow = true;
        bearer.receiveShadow = true;
        group.add(bearer);
    }
    // Each fixed heel joins its actual closure rail. The straight blade closes for
    // normal, while the curved blade closes for reverse; the opposite toe opens.
    const straightBlade = bladeGeometry(normal, definition.normalFrames, toe, definition.hand), curvedBlade = bladeGeometry(branch, definition.branchFrames, 0, -definition.hand);
    straightBlade.userData.closesFor = 'normal';
    curvedBlade.userData.closesFor = 'reverse';
    for (const blade of [straightBlade, curvedBlade]) {
        blade.name = `${definition.id}:blade:${blade.userData.closesFor}`;
        blade.userData.id = blade.name;
    }
    const blades = [straightBlade, curvedBlade];
    // Frog nose and wing/check rails are fitted where the connected branch crosses the running rail.
    railProfile(group, normal, definition.normalFrames, fs - .65, fs + .9, definition.hand * RAIL_CENTRE_OFFSET);
    railProfile(group, normal, definition.normalFrames, fs - 1.6, fs + 1.6, -definition.hand * (RAIL_CENTRE_OFFSET - .16));
    railProfile(group, branch, definition.branchFrames, Math.max(0, frog - 1.7), Math.min(branch.length, frog + 1.7), -definition.hand * RAIL_CENTRE_OFFSET);
    const motorPose = normal.sample(toe + 4, -definition.hand * 1.75), motor = new THREE.Mesh(unitBox, motorMaterial);
    motor.position.fromArray(motorPose.position);
    motor.position.y -= .1;
    motor.scale.set(.65, .32, .9);
    motor.rotation.y = motorPose.yaw;
    group.add(motor);
    // Static components become one draw. Only the two hinged blade geometries remain dynamic.
    const batch = new Batch();
    batch.add(group);
    const staticGeometry = packetGeometry(batch.packet());
    group.clear();
    const staticMesh = new THREE.Mesh(staticGeometry, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .8, metalness: .2, flatShading: true }));
    staticMesh.name = `${definition.id}:fixed`;
    staticMesh.userData.id = staticMesh.name;
    staticMesh.castShadow = true;
    staticMesh.receiveShadow = true;
    group.add(staticMesh, ...blades);
    Object.assign(group.userData, { id: definition.id, family: 'source-connected-turnout', sourceNode: definition.sourceNode, normalEdgeIds: definition.normalEdgeIds, reverseEdgeIds: definition.reverseEdgeIds, source: definition.source, confidence: definition.confidence, gauge: UK_TRACK_GAUGE, railHeadWidth: RAIL_HEAD_WIDTH, railCentreSpacing: RAIL_CENTRE_OFFSET * 2, blades, hand: definition.hand, definition, supportPaths: definition.supportPaths, replaceRunningRailWithinSpan: true });
    group.updateMatrixWorld(true);
    const bounds = new THREE.Box3().setFromObject(group);
    group.userData.bounds = { min: bounds.min.toArray(), max: bounds.max.toArray() };
    setSwitchBlend(group, 0);
    return group;
}
export function setSwitchBlend(group, blend) {
    const t = clamp(blend, 0, 1), blades = group.userData.blades;
    if (!blades)
        return;
    for (const blade of blades) {
        const side = blade.userData.side, closed = blade.userData.closesFor === 'normal' ? 1 - t : t;
        const base = blade.userData.basePositions, rights = blade.userData.rights, weights = blade.userData.weights, position = blade.geometry.getAttribute('position');
        for (let i = 0; i < position.count; i++) {
            const shift = -side * (.044 + (1 - closed) * .18) * weights[i];
            position.setXYZ(i, base[i * 3] + rights[i * 3] * shift, base[i * 3 + 1] + rights[i * 3 + 1] * shift, base[i * 3 + 2] + rights[i * 3 + 2] * shift);
        }
        position.needsUpdate = true;
        blade.geometry.computeVertexNormals();
        blade.geometry.computeBoundingSphere();
    }
    group.userData.blend = t;
    group.userData.proved = t === 0 ? 'normal' : t === 1 ? 'reverse' : 'moving';
    group.userData.selectedSourceEdges = t === 0 ? group.userData.normalEdgeIds : t === 1 ? group.userData.reverseEdgeIds : null;
}
