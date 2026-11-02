import * as THREE from 'three';
import { RouteGeometry, Polyline, CurvePath, clamp, hash, random, gaugeRight, sectionUp } from '../core/geometry.js';
import { Terrain, SurfaceField, engineerSurfaceRoad } from './surfaces.js';
import { roadSiteDefinitions } from './road-sites.js';
import { solveAccessSites, accessSourceIds, accessDefinitions, ACCESS_RULES } from './access-sites.js';
import { Batch } from '../render/batch.js';
import { AssetFactory, geometricText } from '../render/assets.js';
import { makeLandmark, makeRailCivil } from '../render/landmarks.js';
import { benchYaw } from './orientation.js';
import { classifyBuilding } from './buildings.js';
import { resolveAsset } from './asset-registry.js';
import { mappedPlatforms, insidePlatform, platformContains, platformEdgeDistance, derivedPlatformEdgeDistance, platformAnchor, refinePlatformTriangle, platformSurfaceY } from './platforms.js';
const palette = { grass: new THREE.Color(0x7e8f66), earth: new THREE.Color(0x8c8065), ballast: new THREE.Color(0x8b887c),
    rail: new THREE.Color(0xa2aaa5), sleeper: new THREE.Color(0x635a4d), asphalt: new THREE.Color(0x686c68),
    pavement: new THREE.Color(0xb5b3a5), white: new THREE.Color(0xdddcd0), brick: new THREE.Color(0x9d6b55),
    tunnel: new THREE.Color(0x77736b), water: new THREE.Color(0x6d8e95) };
const sharedBox = new THREE.BoxGeometry(1, 1, 1);
const sharedMaterials = new Map();
function material(color) { let m = sharedMaterials.get(color); if (!m) {
    m = new THREE.MeshStandardMaterial({ color, flatShading: true, roughness: .9 });
    sharedMaterials.set(color, m);
} return m; }
const p = (x, y, z) => [x, y, z];
function quad(batch, a, b, c, d, color) { batch.triangle(a, b, c, color); batch.triangle(a, c, d, color); }
function topQuad(batch, a, b, c, d, color) {
    const normalY = (b[2] - a[2]) * (c[0] - a[0]) - (b[0] - a[0]) * (c[2] - a[2]);
    if (normalY < 0)
        quad(batch, a, d, c, b, color);
    else
        quad(batch, a, b, c, d, color);
}
function topTriangle(batch, a, b, c, color) { const y = (b[2] - a[2]) * (c[0] - a[0]) - (b[0] - a[0]) * (c[2] - a[2]); if (y < 0)
    batch.triangle(a, c, b, color);
else
    batch.triangle(a, b, c, color); }
function inside(x, z, b) { return x >= b[0] && z >= b[1] && x < b[2] && z < b[3]; }
function box(batch, x, y, z, w, h, d, color, yaw = 0, bank = 0) {
    if (w <= 0 || h <= 0 || d <= 0)
        return;
    const m = new THREE.Mesh(sharedBox, material(color));
    m.position.set(x, y, z);
    m.scale.set(w, h, d);
    m.rotation.set(0, yaw, bank, 'YXZ');
    batch.add(m);
}
function trackBox(batch, pose, upOffset, w, h, d, color, id) {
    const right = gaugeRight(pose), up = sectionUp(pose), forward = new THREE.Vector3(...pose.tangent).normalize().negate(), m = new THREE.Mesh(sharedBox, material(color));
    m.position.fromArray(pose.position.map((x, i) => x + up[i] * upOffset));
    m.scale.set(w, h, d);
    m.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(new THREE.Vector3(...right), new THREE.Vector3(...up), forward));
    m.userData.family = 'running-sleeper';
    m.userData.id = id;
    batch.add(m);
    return m;
}
function ballastSection(pose, base, others = []) {
    const right = gaugeRight(pose), up = sectionUp(pose), origin = pose.position.map((x, i) => x - up[i] * .29);
    let left = -2.3, rightEdge = 2.3;
    for (const other of others) {
        const dx = other[0] - pose.position[0], dz = other[2] - pose.position[2], distance = Math.hypot(dx, dz);
        if (distance < 2.75 || distance > 5 || Math.abs(other[1] - pose.position[1]) > .6)
            continue;
        const nx = dx / distance, nz = dz / distance, dot = right[0] * nx + right[2] * nz;
        if (Math.abs(dot) < .65)
            continue;
        const allowed = (distance / 2 - .025 - (origin[0] - pose.position[0]) * nx - (origin[2] - pose.position[2]) * nz) / dot;
        if (dot > 0)
            rightEdge = Math.min(rightEdge, allowed);
        else
            left = Math.max(left, allowed);
    }
    const point = (offset) => origin.map((v, i) => v + right[i] * offset), points = [point(left), point(Math.max(left, -1.4)), point(Math.min(rightEdge, 1.4)), point(rightEdge)];
    for (const i of [0, 3])
        points[i][1] = base(points[i][0], points[i][2]);
    return points;
}
function ballastSpan(batch, a, b, color, emitTop) {
    for (let i = 0; i < 3; i++)
        if (emitTop) {
            emitTop(a[i], b[i], b[i + 1]);
            emitTop(a[i], b[i + 1], a[i + 1]);
        }
        else
            topQuad(batch, a[i], b[i], b[i + 1], a[i + 1], color);
    quad(batch, a[0], a[3], a[2], a[1], color);
    quad(batch, b[0], b[1], b[2], b[3], color);
    quad(batch, a[0], b[0], b[3], a[3], color);
}
function followingSolid(batch, polygons, bottom, top, color) {
    const lift = (p, h) => [p[0], p[1] + h, p[2]];
    for (const original of polygons) {
        const area = original.reduce((n, p, i) => { const q = original[(i + 1) % original.length]; return n + p[0] * q[2] - q[0] * p[2]; }, 0), poly = area < 0 ? original : [...original].reverse();
        for (let i = 1; i < poly.length - 1; i++) {
            topTriangle(batch, lift(poly[0], top), lift(poly[i], top), lift(poly[i + 1], top), color);
            const a = lift(poly[0], bottom), b = lift(poly[i], bottom), c = lift(poly[i + 1], bottom);
            batch.triangle(a, c, b, color);
        }
        for (let i = 0; i < poly.length; i++) {
            const a = poly[i], b = poly[(i + 1) % poly.length];
            quad(batch, lift(a, bottom), lift(b, bottom), lift(b, top), lift(a, top), color);
        }
    }
}
function segmentDistance(x, z, a, b) { const dx = b[0] - a[0], dz = b[2] - a[2], t = clamp(((x - a[0]) * dx + (z - a[2]) * dz) / (dx * dx + dz * dz || 1), 0, 1); return { distance: Math.hypot(x - a[0] - t * dx, z - a[2] - t * dz), t }; }
function pointInPolygon(x, z, fp) { let yes = false; for (let i = 0, j = fp.length - 1; i < fp.length; j = i++) {
    const a = fp[i], b = fp[j];
    if (((a[1] > z) !== (b[1] > z)) && (x < (b[0] - a[0]) * (z - a[1]) / (b[1] - a[1]) + a[0]))
        yes = !yes;
} return yes; }
function polygonsOverlap(a, b) {
    if (a.some(q => pointInPolygon(q[0], q[1], b)) || b.some(q => pointInPolygon(q[0], q[1], a)))
        return true;
    for (let i = 0; i < a.length; i++)
        for (let j = 0; j < b.length; j++) {
            const p = a[i], q = a[(i + 1) % a.length], r = b[j], s = b[(j + 1) % b.length], ux = q[0] - p[0], uz = q[1] - p[1], vx = s[0] - r[0], vz = s[1] - r[1], den = ux * vz - uz * vx;
            if (Math.abs(den) < 1e-9)
                continue;
            const t = ((r[0] - p[0]) * vz - (r[1] - p[1]) * vx) / den, v = ((r[0] - p[0]) * uz - (r[1] - p[1]) * ux) / den;
            if (t >= 0 && t <= 1 && v >= 0 && v <= 1)
                return true;
        }
    return false;
}
class CookedSoil {
    buckets = new Map();
    add(a, b, c) {
        const t = [[Math.fround(a[0]),Math.fround(a[1]),Math.fround(a[2])],[Math.fround(b[0]),Math.fround(b[1]),Math.fround(b[2])],[Math.fround(c[0]),Math.fround(c[1]),Math.fround(c[2])]];
        const x0=Math.floor(Math.min(t[0][0],t[1][0],t[2][0])/20),x1=Math.floor(Math.max(t[0][0],t[1][0],t[2][0])/20),z0=Math.floor(Math.min(t[0][2],t[1][2],t[2][2])/20),z1=Math.floor(Math.max(t[0][2],t[1][2],t[2][2])/20);
        for (let x = x0; x <= x1; x++)
            for (let z = z0; z <= z1; z++) {
                const key = `${x},${z}`, list = this.buckets.get(key) || [];
                list.push(t);
                this.buckets.set(key, list);
            }
    }
    triangleHeight(t, x, z) {
        const [a, b, c] = t, den = (b[2] - c[2]) * (a[0] - c[0]) + (c[0] - b[0]) * (a[2] - c[2]);
        if (Math.abs(den) < 1e-9)
            return;
        const u = ((b[2] - c[2]) * (x - c[0]) + (c[0] - b[0]) * (z - c[2])) / den, v = ((c[2] - a[2]) * (x - c[0]) + (a[0] - c[0]) * (z - c[2])) / den, w = 1 - u - v;
        if (u >= -1e-7 && v >= -1e-7 && w >= -1e-7)
            return u * a[1] + v * b[1] + w * c[1];
    }
    height(x, z) { let y = -Infinity; for (const t of this.buckets.get(`${Math.floor(x / 20)},${Math.floor(z / 20)}`) || []) {
        const h = this.triangleHeight(t, x, z);
        if (h !== undefined)
            y = Math.max(y, h);
    } return Number.isFinite(y) ? y : undefined; }
    conform(fp) {
        const x0 = Math.min(...fp.map(q => q[0])), x1 = Math.max(...fp.map(q => q[0])), z0 = Math.min(...fp.map(q => q[1])), z1 = Math.max(...fp.map(q => q[1])), seen = new Set(), out = [], winding = fp.reduce((n, p, i) => { const q = fp[(i + 1) % fp.length]; return n + p[0] * q[1] - q[0] * p[1]; }, 0) > 0 ? 1 : -1;
        for (let x = Math.floor(x0 / 20); x <= Math.floor(x1 / 20); x++)
            for (let z = Math.floor(z0 / 20); z <= Math.floor(z1 / 20); z++)
                for (const tri of this.buckets.get(`${x},${z}`) || []) {
                    if (seen.has(tri))
                        continue;
                    seen.add(tri);
                    if (Math.max(...tri.map(q => q[0])) < x0 || Math.min(...tri.map(q => q[0])) > x1 || Math.max(...tri.map(q => q[2])) < z0 || Math.min(...tri.map(q => q[2])) > z1)
                        continue;
                    let p = tri;
                    for (let i = 0; i < fp.length && p.length >= 3; i++) {
                        const a = fp[i], b = fp[(i + 1) % fp.length];
                        p = clipVolumePolygon(p, q => ((b[0] - a[0]) * (q[2] - a[1]) - (b[1] - a[1]) * (q[0] - a[0])) * winding, true);
                    }
                    if (p.length >= 3 && polygonArea(p) > 1e-8)
                        out.push(p);
                }
        return out;
    }
    footprintRange(fp) {
        const samples = fp.map(q => this.height(q[0], q[1]));
        if (samples.some(y => y === undefined))
            return;
        const heights = samples, seen = new Set();
        const x0 = Math.floor(Math.min(...fp.map(q => q[0])) / 20), x1 = Math.floor(Math.max(...fp.map(q => q[0])) / 20), z0 = Math.floor(Math.min(...fp.map(q => q[1])) / 20), z1 = Math.floor(Math.max(...fp.map(q => q[1])) / 20);
        for (let x = x0; x <= x1; x++)
            for (let z = z0; z <= z1; z++)
                for (const tri of this.buckets.get(`${x},${z}`) || []) {
                    if (seen.has(tri))
                        continue;
                    seen.add(tri);
                    for (const q of tri)
                        if (pointInPolygon(q[0], q[2], fp))
                            heights.push(q[1]);
                    for (const q of fp) {
                        const y = this.triangleHeight(tri, q[0], q[1]);
                        if (y !== undefined)
                            heights.push(y);
                    }
                    for (let i = 0; i < fp.length; i++)
                        for (let j = 0; j < 3; j++) {
                            const a = fp[i], b = fp[(i + 1) % fp.length], c = tri[j], d = tri[(j + 1) % 3], ux = b[0] - a[0], uz = b[1] - a[1], vx = d[0] - c[0], vz = d[2] - c[2], den = ux * vz - uz * vx;
                            if (Math.abs(den) < 1e-9)
                                continue;
                            const t = ((c[0] - a[0]) * vz - (c[2] - a[1]) * vx) / den, v = ((c[0] - a[0]) * uz - (c[2] - a[1]) * ux) / den;
                            if (t >= 0 && t <= 1 && v >= 0 && v <= 1)
                                heights.push(c[1] + v * (d[1] - c[1]));
                        }
                }
        return { low: Math.min(...heights), high: Math.max(...heights) };
    }
}
const polygonArea = (p) => Math.abs(p.reduce((n, a, i) => { const b = p[(i + 1) % p.length]; return n + a[0] * b[2] - b[0] * a[2]; }, 0)) / 2;
function clipVolumePolygon(subject, distance, inside) {
    const out = [];
    for (let i = 0; i < subject.length; i++) {
        const p = subject[i], q = subject[(i + 1) % subject.length], dp = distance(p), dq = distance(q), pin = inside ? dp >= -1e-9 : dp <= 1e-9, qin = inside ? dq >= -1e-9 : dq <= 1e-9;
        if (pin)
            out.push(p);
        if (pin !== qin) {
            const t = dp / (dp - dq);
            out.push(p.map((v, j) => v + (q[j] - v) * t));
        }
    }
    return out;
}
/** Split a building footprint into convex pieces so a tunnel can pass below
 * its foundation without removing the building or the surrounding support.
 * The caller supplies short, overlapping convex bore footprints and roof
 * heights in world coordinates. */
export function tunnelFoundationFragments(footprint, low, top, cutters) {
    if (!cutters.length) return undefined;
    const points=footprint.filter((p,i)=>!i||Math.hypot(p[0]-footprint[i-1][0],p[1]-footprint[i-1][1])>.001);
    if(points.length>3&&Math.hypot(points[0][0]-points.at(-1)[0],points[0][1]-points.at(-1)[1])<.001)points.pop();
    const faces=THREE.ShapeUtils.triangulateShape(points.map(p=>new THREE.Vector2(p[0],-p[1])),[]);
    let fragments=faces.map(face=>({points:face.map(i=>[points[i][0],0,points[i][1]]),floor:low})),changed=false;
    for(const cut of cutters){
        const cutter=cut.polygon.map(p=>[p[0],0,p[1]]),winding=cutter.reduce((sum,p,i)=>{const q=cutter[(i+1)%cutter.length];return sum+p[0]*q[2]-q[0]*p[2];},0)>0?1:-1,next=[];
        for(const fragment of fragments){
            if(cut.roof<=fragment.floor+.001||!polygonsOverlap(fragment.points.map(p=>[p[0],p[2]]),cut.polygon)){next.push(fragment);continue;}
            let remaining=fragment.points;
            for(let i=0;i<cutter.length&&remaining.length>=3;i++){
                const p=cutter[i],q=cutter[(i+1)%cutter.length],side=v=>((q[0]-p[0])*(v[2]-p[2])-(q[2]-p[2])*(v[0]-p[0]))*winding;
                const outside=clipVolumePolygon(remaining,side,false);
                if(outside.length>=3&&polygonArea(outside)>1e-7)next.push({points:outside,floor:fragment.floor});
                remaining=clipVolumePolygon(remaining,side,true);
            }
            if(remaining.length>=3&&polygonArea(remaining)>1e-7){next.push({points:remaining,floor:Math.min(top,cut.roof)});changed=true;}
        }
        fragments=next;
    }
    return changed?fragments:undefined;
}
/** Only source-switch formations own ties with ordinary upper ballast tops.
 * Faces below the ordinary bed stay occluded; sidewalls and lower support stay. */
class SourceBedOwnership {
    buckets = new Map();
    cuts = 0;
    removedArea = 0;
    add(points) {
        const p = points.map(v => v.map(Math.fround)), [a, b, c] = p, dx = b[0] - a[0], dz = b[2] - a[2], ex = c[0] - a[0], ez = c[2] - a[2], det = dx * ez - ex * dz;
        if (Math.abs(det) < 1e-8)
            return;
        const aa = ((b[1] - a[1]) * ez - (c[1] - a[1]) * dz) / det, bb = (dx * (c[1] - a[1]) - ex * (b[1] - a[1])) / det, tri = { points: p, a: aa, b: bb, c: a[1] - aa * a[0] - bb * a[2] };
        for (let x = Math.floor(Math.min(...p.map(q => q[0])) / 20); x <= Math.floor(Math.max(...p.map(q => q[0])) / 20); x++)
            for (let z = Math.floor(Math.min(...p.map(q => q[2])) / 20); z <= Math.floor(Math.max(...p.map(q => q[2])) / 20); z++) {
                const key = `${x},${z}`, list = this.buckets.get(key) || [];
                list.push(tri);
                this.buckets.set(key, list);
            }
    }
    nearby(points) { const found = new Set(); for (let x = Math.floor(Math.min(...points.map(q => q[0])) / 20); x <= Math.floor(Math.max(...points.map(q => q[0])) / 20); x++)
        for (let z = Math.floor(Math.min(...points.map(q => q[2])) / 20); z <= Math.floor(Math.max(...points.map(q => q[2])) / 20); z++)
            for (const t of this.buckets.get(`${x},${z}`) || [])
                found.add(t); return found; }
    emit(batch, a, b, c, color) {
        const original = [a, b, c], dx = b[0] - a[0], dz = b[2] - a[2], ex = c[0] - a[0], ez = c[2] - a[2], det = dx * ez - ex * dz;
        if (Math.abs(det) < 1e-8)
            return;
        const aa = ((b[1] - a[1]) * ez - (c[1] - a[1]) * dz) / det, bb = (dx * (c[1] - a[1]) - ex * (b[1] - a[1])) / det, cc = a[1] - aa * a[0] - bb * a[2];
        let pieces = [original];
        for (const source of this.nearby(original)) {
            const cutter = clipVolumePolygon(source.points, p => (source.a - aa) * p[0] + (source.b - bb) * p[2] + source.c - cc + .001, true);
            if (cutter.length < 3 || polygonArea(cutter) < 1e-7)
                continue;
            const winding = cutter.reduce((n, p, i) => { const q = cutter[(i + 1) % cutter.length]; return n + p[0] * q[2] - q[0] * p[2]; }, 0) > 0 ? 1 : -1;
            pieces = pieces.flatMap(piece => {
                const out = [];
                let remaining = piece;
                for (let i = 0; i < cutter.length && remaining.length >= 3; i++) {
                    const p = cutter[i], q = cutter[(i + 1) % cutter.length], side = (v) => ((q[0] - p[0]) * (v[2] - p[2]) - (q[2] - p[2]) * (v[0] - p[0])) * winding;
                    const outside = clipVolumePolygon(remaining, side, false);
                    if (outside.length >= 3 && polygonArea(outside) > 1e-7)
                        out.push(outside);
                    remaining = clipVolumePolygon(remaining, side, true);
                }
                return out;
            });
            if (!pieces.length)
                break;
        }
        const area = polygonArea(original) - pieces.reduce((n, p) => n + polygonArea(p), 0);
        if (area > 1e-6) {
            this.cuts++;
            this.removedArea += area;
        }
        for (const piece of pieces)
            for (let i = 1; i < piece.length - 1; i++)
                topTriangle(batch, piece[0], piece[i], piece[i + 1], color);
    }
    embedding(point, up) { let overlap = false, embed = 0; for (const t of this.nearby([point])) {
        const denominator = up[1] - t.a * up[0] - t.b * up[2];
        if (Math.abs(denominator) < .05)
            continue;
        const depth = (t.a * point[0] + t.b * point[2] + t.c - point[1]) / denominator, q = point.map((v, i) => v + up[i] * depth);
        if (!pointInPolygon(q[0], q[2], t.points.map(v => [v[0], v[2]])))
            continue;
        overlap = true;
        embed = Math.max(embed, depth);
    } return { overlap, embed }; }
}
function roadPoint(road, s, offset, lift = 0) {
    const pose = road.path.sample(s);
    return [pose.position[0] + pose.right[0] * offset, pose.position[1] + lift, pose.position[2] + pose.right[2] * offset];
}
function roadBridgeOpening(road) {
    if (road.mode !== 'over' || road.crossingS === undefined)
        return;
    const half = Math.max(4, road.spanHalfLength ?? 15);
    return [road.crossingS - half, road.crossingS + half];
}
function roadSpanCuts(road) {
    const opening = roadBridgeOpening(road), edges = opening ? opening.filter(s => s > 0 && s < road.path.length) : [];
    return [...new Set([...road.path.lengths, ...Array.from({ length: Math.ceil(road.path.length / 6) }, (_, i) => Math.min(i * 6, road.path.length)), ...edges, road.path.length])].sort((a, b) => a - b);
}
function roadSubgradeY(road, s) {
    // A smoothed cross-section can project onto a neighbouring source segment at
    // a hairpin. Cover the full cross-section and one2.5m terrain-cell diagonal;
    // the minimum piecewise profile is a shared, conservative road-bed envelope.
    const radius = 2.5 * Math.SQRT2 + road.width / 2, start = clamp(s - radius, 0, road.path.length), end = clamp(s + radius, 0, road.path.length);
    const height = (v) => { const i = road.path.segment(v), t = (v - road.path.lengths[i]) / (road.path.lengths[i + 1] - road.path.lengths[i] || 1); return road.points[i][1] + t * (road.points[i + 1][1] - road.points[i][1]); };
    let y = Math.min(height(start), height(end));
    for (let i = road.path.segment(start) + 1; i < road.points.length && road.path.lengths[i] < end; i++)
        y = Math.min(y, road.points[i][1]);
    return y - .28;
}
const contextCache = new WeakMap();
/** Non-playable endpoint context follows connected mapped rails; its grade is
 * an explicitly inferred continuation of the engineered running profile. */
export function endpointContext(route) {
    const cached = contextCache.get(route);
    if (cached)
        return cached;
    const segments = [], nodes = new Map();
    const key = (q) => `${q[0].toFixed(2)},${q[2].toFixed(2)}`;
    for (const tr of route.data.tracks)
        for (let i = 1; i < (tr.points?.length || 0); i++) {
            const seg = { a: tr.points[i - 1], b: tr.points[i], id: tr.id, index: i };
            segments.push(seg);
            for (const q of [seg.a, seg.b]) {
                const k = key(q), list = nodes.get(k) || [];
                list.push(seg);
                nodes.set(k, list);
            }
        }
    const result = [];
    for (const atEnd of [false, true])
        for (const lane of [0, 4.2]) {
            const sign = atEnd ? 1 : -1, pose = route.lanePose(atEnd ? route.length : 0, lane), out = pose.tangent.map(v => v * sign);
            let best;
            for (const segment of segments) {
                const hit = segmentDistance(pose.position[0], pose.position[2], segment.a, segment.b);
                if (hit.distance > 4.5)
                    continue;
                const dx = segment.b[0] - segment.a[0], dz = segment.b[2] - segment.a[2], len = Math.hypot(dx, dz), dot = (dx * out[0] + dz * out[2]) / (len || 1), direction = dot > 0 ? 1 : -1;
                if (Math.abs(dot) < .82 || (direction > 0 ? 1 - hit.t : hit.t) * len < .05)
                    continue;
                const score = hit.distance + (1 - Math.abs(dot)) * 2;
                if (!best || score < best.score)
                    best = { segment, t: hit.t, direction, score };
            }
            if (!best)
                continue;
            let current = best.segment, direction = best.direction;
            const first = current.a.map((v, i) => v + (current.b[i] - v) * best.t), raw = [first, direction > 0 ? current.b : current.a], visited = new Set([current]), sources = new Set([current.id]);
            let length = Math.hypot(raw[1][0] - raw[0][0], raw[1][2] - raw[0][2]);
            while (length < 180) {
                const end = raw.at(-1), before = raw.at(-2), dx = end[0] - before[0], dz = end[2] - before[2], len = Math.hypot(dx, dz) || 1, way = /^way\/\d+/.exec(current.id)?.[0];
                const candidates = (nodes.get(key(end)) || []).filter(s => !visited.has(s)).map(segment => {
                    const target = key(segment.a) === key(end) ? segment.b : segment.a, tx = target[0] - end[0], tz = target[2] - end[2], d = Math.hypot(tx, tz), dot = (tx * dx + tz * dz) / (d * len || 1);
                    return { segment, target, d, dot, same: way !== undefined && segment.id.startsWith(`${way}/`) };
                }).filter(c => c.d > .05 && c.dot > .75).sort((a, b) => Number(b.same) - Number(a.same) || b.dot - a.dot || a.segment.id.localeCompare(b.segment.id));
                if (!candidates.length)
                    break;
                const next = candidates[0];
                // Never invent a branch choice at an unresolved fork of equally plausible ways.
                if (candidates[1] && !next.same && next.dot - candidates[1].dot < .02)
                    break;
                raw.push(next.target);
                length += next.d;
                current = next.segment;
                visited.add(current);
                sources.add(current.id);
            }
            if (length < 20)
                continue;
            const rawPath = new Polyline(raw), extent = Math.min(180, rawPath.length), fit = Math.min(25, extent), join = rawPath.sample(fit), points = [];
            const append = (d) => {
                const q = rawPath.sample(d).position, t = clamp(d / fit, 0, 1), h00 = 2 * t * t * t - 3 * t * t + 1, h10 = t * t * t - 2 * t * t + t, h01 = -2 * t * t * t + 3 * t * t, h11 = t * t * t - t * t;
                const x = d < fit ? h00 * pose.position[0] + h10 * fit * out[0] + h01 * join.position[0] + h11 * fit * join.tangent[0] : q[0];
                const z = d < fit ? h00 * pose.position[2] + h10 * fit * out[2] + h01 * join.position[2] + h11 * fit * join.tangent[2] : q[2];
                points.push([x, pose.position[1] + pose.grade * sign * d, z]);
            };
            for (let d = 0; d < extent; d += 2)
                append(d);
            append(extent);
            result.push({ id: `context/${atEnd ? 'DDG' : 'KID'}/${lane}`, points, path: new Polyline(points), overhead: false, source: 'Connected mapped source rail segments; engineered endpoint grade continued', metadata: { contextOnly: true, playable: false, lane, atEnd, extent, sourceIds: [...sources], sourceFitDistance: best.score, endpointRight: pose.right.map(v => v * sign), endpointBank: pose.bank * sign } });
        }
    contextCache.set(route, result);
    return result;
}
/** World coordinates and surface ownership stay identical across independent tile builds. */
export function buildTile(tile, route, terrain, progress) {
    progress?.(0);
    const batch = new Batch(), factory = new AssetFactory(), bounds = tile.bounds ?? [0, 0, 1000, 1000];
    const minS = route.project((bounds[0] + bounds[2]) / 2, (bounds[1] + bounds[3]) / 2, 1500).s;
    const troughOffset = (s) => route.laneOffset(s, 4.2) / 2 - (Math.abs(route.laneOffset(s, 4.2)) + 5.6) / 2 - .35;
    const supportBounds = [...bounds], crossingFootprints = [];
    for (const b of tile.buildings) {
        const fp = b.footprint;
        if (!fp?.length)
            continue;
        const x = fp.reduce((s, q) => s + q[0], 0) / fp.length, z = fp.reduce((s, q) => s + q[1], 0) / fp.length;
        if (route.project(x, z, 600).distance > 570 || fp.every(q => inside(q[0], q[1], bounds)))
            continue;
        crossingFootprints.push(fp);
        for (const q of fp) {
            supportBounds[0] = Math.min(supportBounds[0], q[0] - 80);
            supportBounds[1] = Math.min(supportBounds[1], q[1] - 80);
            supportBounds[2] = Math.max(supportBounds[2], q[0] + 80);
            supportBounds[3] = Math.max(supportBounds[3], q[1] + 80);
        }
    }
    for (let s = Math.max(0, Math.floor((minS - 1800) / 8) * 8); s < Math.min(route.length, minS + 1800); s += 8) {
        const q = route.sample(s);
        if (!inside(q.position[0], q.position[2], bounds))
            continue;
        const footprint = [];
        for (let ss = Math.max(0, s - 4); ss <= Math.min(route.length, s + 4); ss += 1) {
            const p = route.sample(ss, troughOffset(ss)).position;
            for (const dx of [-.5, .5])
                for (const dz of [-.5, .5])
                    footprint.push([p[0] + dx, p[2] + dz]);
        }
        if (!footprint.length || footprint.every(q => inside(q[0], q[1], bounds)))
            continue;
        crossingFootprints.push(footprint);
        for (const q of footprint) {
            supportBounds[0] = Math.min(supportBounds[0], q[0] - 80);
            supportBounds[1] = Math.min(supportBounds[1], q[1] - 80);
            supportBounds[2] = Math.max(supportBounds[2], q[0] + 80);
            supportBounds[3] = Math.max(supportBounds[3], q[1] + 80);
        }
    }
    const pedestrianPaths = [];
    const runningLanes = [0, 4.2];
    const centre = (s) => route.laneOffset(s, 4.2) / 2;
    const formationWidth = (s) => Math.abs(route.laneOffset(s, 4.2)) + 5.6;
    const switchDefs = (route.data.trackwork || []).filter(s => Number.isFinite(s.startS) && Number.isFinite(s.endS));
    const switchSupports = switchDefs.flatMap(s => (s.supportPaths || []).filter(path => path.length > 1).map((points, index) => ({ id: `${s.id}/support/${index}`, points, path: new Polyline(points), metadata: { renderStatic: false, switchSupport: true } })));
    const switchUndersides = new CookedSoil(), sourceBedOwnership = new SourceBedOwnership();
    for (const def of switchDefs) {
        const sections = def.formationSections;
        if (!sections || sections.length < 2)
            continue;
        const vertices = sections.flatMap(s => [s.topLeft, s.topRight, s.bottomLeft, s.bottomRight]);
        if (Math.max(...vertices.map(p => p[0])) < supportBounds[0] - 40 || Math.min(...vertices.map(p => p[0])) > supportBounds[2] + 40 || Math.max(...vertices.map(p => p[2])) < supportBounds[1] - 40 || Math.min(...vertices.map(p => p[2])) > supportBounds[3] + 40)
            continue;
        for (let i = 1; i < sections.length; i++) {
            const a = sections[i - 1], b = sections[i];
            for (const t of [[a.topLeft, a.topRight, b.topRight], [a.topLeft, b.topRight, b.topLeft], [a.topLeft, b.topLeft, b.bottomLeft], [a.topLeft, b.bottomLeft, a.bottomLeft], [a.topRight, a.bottomRight, b.bottomRight], [a.topRight, b.bottomRight, b.topRight]])
                sourceBedOwnership.add(t);
        }
        const expanded = sections.map(s => { const dx = s.bottomRight[0] - s.bottomLeft[0], dy = s.bottomRight[1] - s.bottomLeft[1], dz = s.bottomRight[2] - s.bottomLeft[2], n = Math.hypot(dx, dy, dz) || 1; return { left: s.bottomLeft.map((v, i) => v - [dx, dy, dz][i] / n * 3.6), right: s.bottomRight.map((v, i) => v + [dx, dy, dz][i] / n * 3.6) }; });
        const extend = (at, next) => { const a = expanded[at], b = expanded[next], delta = a.left.map((v, i) => (v + a.right[i] - b.left[i] - b.right[i]) / 2), n = Math.hypot(...delta) || 1; return { left: a.left.map((v, i) => v + delta[i] / n * 3.6), right: a.right.map((v, i) => v + delta[i] / n * 3.6) }; };
        const profile = [extend(0, 1), ...expanded, extend(expanded.length - 1, expanded.length - 2)];
        for (let i = 1; i < profile.length; i++) {
            const a = profile[i - 1], b = profile[i];
            switchUndersides.add(a.left, a.right, b.right);
            switchUndersides.add(a.left, b.right, b.left);
        }
    }
    const contexts = endpointContext(route);
    route.setEndpointContext(contexts);
    const auxiliaries = [...((route.data.adjacentServices || []).filter(s => s.points?.length > 1)).map(s => ({ ...s, path: new CurvePath(s.points) })), ...contexts, ...switchSupports].filter(service => { const ps = service.points; return ps.some(p => p[0] >= bounds[0] - 250 && p[0] <= bounds[2] + 250 && p[2] >= bounds[1] - 250 && p[2] <= bounds[3] + 250) || ps.some((p, i) => i > 0 && Math.min(p[0], ps[i - 1][0]) <= bounds[2] + 250 && Math.max(p[0], ps[i - 1][0]) >= bounds[0] - 250 && Math.min(p[2], ps[i - 1][2]) <= bounds[3] + 250 && Math.max(p[2], ps[i - 1][2]) >= bounds[1] - 250); });
    for (const service of auxiliaries) if (service.metadata?.tunnel) service.portalEnds = [service.path.sample(0),service.path.sample(service.path.length)];
    const auxBuckets = new Map();
    for (const service of auxiliaries)
        for (let i = 1; i < service.path.points.length; i++) {
            const a = service.path.points[i - 1], b = service.path.points[i];
            for (let x = Math.floor((Math.min(a[0], b[0]) - 10) / 50); x <= Math.floor((Math.max(a[0], b[0]) + 10) / 50); x++)
                for (let z = Math.floor((Math.min(a[2], b[2]) - 10) / 50); z <= Math.floor((Math.max(a[2], b[2]) + 10) / 50); z++) {
                    const key = `${x},${z}`, list = auxBuckets.get(key) || [];
                    list.push({ service, index: i - 1 });
                    auxBuckets.set(key, list);
                }
        }
    const auxNear = (x, z, radius = 0) => {
        const hits = [], seen = new Set();
        for (let bx = Math.floor((x - radius) / 50); bx <= Math.floor((x + radius) / 50); bx++)
            for (let bz = Math.floor((z - radius) / 50); bz <= Math.floor((z + radius) / 50); bz++)
                for (const e of auxBuckets.get(`${bx},${bz}`) || []) {
                    const key = `${e.service.id}/${e.index}`;
                    if (!seen.has(key)) {
                        seen.add(key);
                        hits.push(e);
                    }
                }
        return hits;
    };
    const supportFeatures = (route.data.surfaceRoads || []).filter(f => {
        const b = f.bounds;
        return b ? b[0] < supportBounds[2] + 100 && b[2] > supportBounds[0] - 100 && b[1] < supportBounds[3] + 100 && b[3] > supportBounds[1] - 100 : true;
    });
    const rawRoads = new Map([...tile.roads, ...supportFeatures].map(f => [f.id, f]));
    for (const site of accessDefinitions) {
        const ids = [site.deck, ...site.stairs];
        if (ids.some(id => rawRoads.has(id)) && !ids.every(id => rawRoads.has(id)))
            throw new Error(`${site.id}: JOIN-01 incomplete layered access source assembly`);
    }
    const supportRoads = [...rawRoads.values()].filter(f => !accessSourceIds.has(f.id)).sort((a, b) => a.id.localeCompare(b.id)).map(f => engineerSurfaceRoad(f, route, terrain)).filter((r) => !!r);
    const ownedRoadIds = new Set(tile.roads.map(r => r.id)), roads = supportRoads.filter(r => ownedRoadIds.has(r.id));
    const sourceStructures = route.data.structures.filter(s => s.position && inside(s.position[0], s.position[2], bounds));
    const field = new SurfaceField(route, terrain, supportRoads), placements = [], attachmentDecks = [];
    const rememberDeck = (group, id) => { const deck = new CookedSoil(); let count = 0; group.updateMatrixWorld(true); group.traverse(node => { if (!node.isMesh)
        return; const mesh = node, mat = (Array.isArray(mesh.material) ? mesh.material[0] : mesh.material), color = mat.color?.getHex(); if (color !== 0x686b67 && color !== 0x8b887c)
        return; const pos = mesh.geometry.getAttribute('position'), index = mesh.geometry.index; if (!pos)
        return; for (let i = 0; i < (index?.count ?? pos.count); i += 3) {
        const v = [0, 1, 2].map(k => new THREE.Vector3().fromBufferAttribute(pos, index ? index.getX(i + k) : i + k).applyMatrix4(mesh.matrixWorld)), normal = v[1].clone().sub(v[0]).cross(v[2].clone().sub(v[0])).normalize();
        if (normal.y > .8) {
            deck.add(v[0].toArray(), v[1].toArray(), v[2].toArray());
            count++;
        }
    } }); if (count)
        attachmentDecks.push({ id, field: deck }); };
    for (const def of switchDefs) {
        if (!def.formationSections?.length)
            continue;
        const pose = route.lanePose((def.startS + def.endS) / 2, def.lane);
        if (inside(pose.position[0], pose.position[2], bounds))
            placements.push({ id: `${def.id}/formation-support`, family: 'source-switch-formation-support', position: pose.position, role: 'source switch owns near-coplanar ordinary upper ballast', topOwnershipTolerance: .001, maximumSleeperBallastEmbed: .075, sleeperThickness: .15, minimumSleeperTopExposure: .075, supportGeometry: 'full formationSections underside envelope', confidence: 'engineered formation and limited packed-ballast embed; not surveyed site levels' });
    }
    const allPlatforms = mappedPlatforms(route), localPlatforms = allPlatforms.filter(p => p.bounds[0] < supportBounds[2] + 50 && p.bounds[2] > supportBounds[0] - 50 && p.bounds[1] < supportBounds[3] + 50 && p.bounds[3] > supportBounds[1] - 50);
    const lowerOpenings = route.data.structures.flatMap(s => (s.underRoutes || [])).filter(o => o.points.length > 1).map(o => ({ ...o, path: new Polyline(o.points) }));
    const waterSources = new Map((Array.isArray(route.data.surfaceWater) ? route.data.surfaceWater : (tile.land || []).filter(f => f.kind === 'water')).filter(f => f.footprint?.length).map(f => [f.id, f]));
    const water = [...waterSources.values()].filter(f => { const b = f.bounds || [Math.min(...f.footprint.map(q => q[0])), Math.min(...f.footprint.map(q => q[1])), Math.max(...f.footprint.map(q => q[0])), Math.max(...f.footprint.map(q => q[1]))]; return b[0] < supportBounds[2] + 50 && b[2] > supportBounds[0] - 50 && b[1] < supportBounds[3] + 50 && b[3] > supportBounds[1] - 50; }).map(f => ({ id: f.id, footprint: f.footprint, level: Number(f.y) || terrain.raw(f.footprint[0][0], f.footprint[0][1]), owned: (tile.land || []).some(q => q.id === f.id) }));
    const checks = { roads: 0, buildings: 0, retainingFoundations: 0, trees: 0, railSamples: 0, rejectedBuildings: 0, uncoveredBuildingSupports: 0, engineeredCrossings: 0, sourceCivils: 0, civilDuplicatesAvoided: 0, mappedPlatforms: 0, platformFurniture: 0, terrainTriangles: 0, supportHaloTriangles: 0, triangleCount: 0, supportFailures: 0, switchRailSegmentsSuppressed: 0, switchSleepersSuppressed: 0, endpointContextPaths: contexts.length, sourceBedTopTrianglesClipped: 0, sourceBedTopAreaRemoved: 0, sourceBedSleeperCornersCovered: 0, sourceBedMaximumSleeperEmbed: 0, sourceBedSleeperEmbedLimit: .075, sourceBedSleeperEmbedFailures: 0 };
    const roadLookup = (x, z, radius = 5) => {
        const result = [], seen = new Set();
        for (let xx = Math.floor((x - radius) / 25); xx <= Math.floor((x + radius) / 25); xx++)
            for (let zz = Math.floor((z - radius) / 25); zz <= Math.floor((z + radius) / 25); zz++)
                for (const entry of field.roadBuckets.get(`${xx},${zz}`) || []) {
                    const key = `${entry.road.id}/${entry.i}`;
                    if (!seen.has(key)) {
                        seen.add(key);
                        result.push(entry);
                    }
                }
        return result;
    };
    // A point can query the exact subgrade envelope from one bucket. This
    // avoids allocating and deduplicating a neighbourhood for every vertex.
    const subgradeBuckets = new Map();
    for(const road of supportRoads)for(let i=0;i<road.points.length-1;i++){
        const a=road.points[i],b=road.points[i+1],pad=road.width/2+3.6;
        for(let x=Math.floor((Math.min(a[0],b[0])-pad)/25);x<=Math.floor((Math.max(a[0],b[0])+pad)/25);x++)
            for(let z=Math.floor((Math.min(a[2],b[2])-pad)/25);z<=Math.floor((Math.max(a[2],b[2])+pad)/25);z++){
                const key=`${x},${z}`,entries=subgradeBuckets.get(key)||[];entries.push({road,i});subgradeBuckets.set(key,entries);
            }
    }
    const metroBores = (route.data.civils || []).filter(c=>c.metadata?.mode==='tram' && c.metadata?.tunnel).map(c=>{
        const path=new CurvePath(c.points),radius=(Number(c.metadata.boreRadius)||2.3)+.5,ps=c.points;
        return {path,radius,start:path.sample(0),end:path.sample(path.length),bounds:[Math.min(...ps.map(p=>p[0]))-radius,Math.min(...ps.map(p=>p[2]))-radius,Math.max(...ps.map(p=>p[0]))+radius,Math.max(...ps.map(p=>p[2]))+radius]};
    });
    // The same coordinate always gets the same engineered sample. The extra margin
    // ensures a triangle spanning a transport edge cannot rise through its surface.
    const surfaceCache = new Map();
    let ground = (x, z) => {
        const key = `${x.toFixed(3)},${z.toFixed(3)}`;
        const cached = surfaceCache.get(key);
        if (cached !== undefined)
            return cached;
        const near = route.project(x, z, 100);
        let y = field.ground(x, z, near);
        for (const { service, index } of auxBuckets.get(`${Math.floor(x/50)},${Math.floor(z/50)}`) || []) {
            const a = service.path.points[index], b = service.path.points[index + 1], hit = segmentDistance(x, z, a, b);
            if (hit.distance > 8)
                continue;
            if (service.metadata?.bridge)
                continue;
            if (service.metadata?.tunnel) {
                const [start,end]=service.portalEnds, along=p=>(x-p.position[0])*p.tangent[0]+(z-p.position[2])*p.tangent[2];
                if (along(start)<-.05 || along(end)>.05) continue;
                y = Math.max(y, a[1] + hit.t * (b[1] - a[1]) + 6.5);
                continue;
            }
            const target = a[1] + hit.t * (b[1] - a[1]) - .54, weight = 1 - clamp((hit.distance - 3.4) / 4.6, 0, 1);
            y += (target - y) * weight;
        }
        for (const platform of localPlatforms) {
            if (x < platform.bounds[0] - 4 || x > platform.bounds[2] + 4 || z < platform.bounds[1] - 4 || z > platform.bounds[3] + 4)
                continue;
            if (insidePlatform(x, z, platform.footprint) || platformEdgeDistance(x, z, platform.footprint) < 3.7)
                y = Math.min(y, platform.top(x, z) - .30);
        }
        for (const opening of lowerOpenings) {
            const a = opening.points[0], b = opening.points[opening.points.length - 1];
            if (x < Math.min(a[0], b[0]) - opening.width - 5 || x > Math.max(a[0], b[0]) + opening.width + 5 || z < Math.min(a[2], b[2]) - opening.width - 5 || z > Math.max(a[2], b[2]) + opening.width + 5)
                continue;
            const hit = opening.path.nearest(x, z);
            if (hit.distance < opening.width / 2 + 3.6)
                y = Math.min(y, opening.path.sample(hit.s).position[1] - .3);
        }
        for (const w of water)
            if (pointInPolygon(x, z, w.footprint))
                y = Math.min(y, w.level - .65);
        const validMain = Number.isFinite(near.distance) && near.distance < Math.abs(route.laneOffset(near.s, 4.2)) + 35;
        const tunnel = validMain ? route.tunnelAt(near.s) : undefined, bridge = validMain ? route.bridgeAt(near.s) : undefined;
        const corridorDistance = Math.abs(near.side - centre(near.s)), halfFormation = formationWidth(near.s) / 2;
        if (tunnel && corridorDistance < halfFormation + 10) {
            const start = route.sourceS(tunnel.start), end = route.sourceS(tunnel.end), roofHalfWidth = Math.max((Number(tunnel.width) || 9) / 2 + .8, halfFormation + .2);
            const portalBlend = corridorDistance <= roofHalfWidth ? 1 : clamp(Math.min(near.s - start, end - near.s) / 12, 0, 1);
            const sideBlend = 1 - clamp((corridorDistance - roofHalfWidth) / 11, 0, 1), cover = route.sample(near.s).position[1] + 7.2;
            y += Math.max(0, cover - y) * portalBlend * sideBlend;
        }
        if (validMain && corridorDistance < halfFormation + 4.6 && !tunnel && !bridge)
            y = Math.min(y, route.sample(near.s).position[1] - .56);
        if (validMain && corridorDistance < halfFormation + 10 && route.stations.some(st => Math.abs(st.s - near.s) < st.length / 2 + 14) && !tunnel && !bridge)
            y = Math.min(y, route.sample(near.s).position[1] - .56);
        if (bridge && corridorDistance < halfFormation + 4) {
            const rise = Math.min(1, Math.min(near.s - route.sourceS(bridge.start), route.sourceS(bridge.end) - near.s) / 12);
            y = Math.min(y, route.sample(near.s).position[1] - .56 - 6.5 * Math.max(0, rise));
        }
        const switchSupport = switchUndersides.height(x, z);
        if (switchSupport !== undefined && !tunnel && !water.some(w => pointInPolygon(x, z, w.footprint)) && !lowerOpenings.some(o => o.path.nearest(x, z).distance < o.width / 2 + 3.6))
            y = switchSupport;
        for (const { road, i } of subgradeBuckets.get(`${Math.floor(x/25)},${Math.floor(z/25)}`) || []) {
            if(road.mode==='tunnel')continue;
            const a = road.points[i], b = road.points[i + 1], hit = segmentDistance(x, z, a, b);
            if (hit.distance > road.width / 2 + 3.6)
                continue;
            const s = road.path.lengths[i] + hit.t * (road.path.lengths[i + 1] - road.path.lengths[i]);
            // Elevated decks do not fill the valley underneath. Existing ground may
            // still need cutting back where an approach or abutment rises above it.
            y = Math.min(y, roadSubgradeY(road, s));
        }
        // Surface streets cannot cut the roof into the running envelope of an
        // explicit bore. The portal clipping below still leaves its mouth open.
        if (tunnel && corridorDistance <= Math.max((Number(tunnel.width) || 9) / 2 + .8, halfFormation + .2))
            y = Math.max(y, route.sample(near.s).position[1] + 7.2);
        // Preserve the separate Metro bore roof after mainline station and road
        // grading. Otherwise a nearby cutting can slope through the portal.
        for(const bore of metroBores){
            if(x<bore.bounds[0]||x>bore.bounds[2]||z<bore.bounds[1]||z>bore.bounds[3])continue;
            const along=p=>(x-p.position[0])*p.tangent[0]+(z-p.position[2])*p.tangent[2];
            if(along(bore.start)<0||along(bore.end)>0)continue;
            const hit=bore.path.nearest(x,z);if(hit.distance<bore.radius)y=Math.max(y,bore.path.sample(hit.s).position[1]+7.2);
        }
        surfaceCache.set(key, y);
        return y;
    };
    const walkSurface = (x, z) => Math.max(ground(x, z), ...localPlatforms.filter(q => platformContains(q, x, z)).map(q => platformSurfaceY(q, x, z)));
    const runningClear = (x, z, radius = 0) => {
        if (auxNear(x, z, 1.55 + radius).some(e => segmentDistance(x, z, e.service.path.points[e.index], e.service.path.points[e.index + 1]).distance < 1.55 + radius))
            return false;
        const near = route.project(x, z, 100);
        if (!Number.isFinite(near.distance))
            return true;
        return [0, 4.2].every(lane => { const q = route.lanePose(near.s, lane).position; return Math.hypot(x - q[0], z - q[2]) > 1.55 + radius; });
    };
    // Split only a support which actually enters an occupied rail-height band.
    // This keeps safe parts of the mapped abutment and leaves an open train
    // envelope, including where a road bridge runs obliquely alongside track.
    const protectBridgeSupports = (bridge,id,seamStart=false,seamEnd=false) => {
        bridge.updateMatrixWorld(true);let removed=0;
        const intersects=(child,x,width)=>{
            const centre=new THREE.Vector3(x,child.position.y,child.position.z).applyMatrix4(bridge.matrixWorld),radius=Math.hypot(width,child.scale.z)/2+1.8,low=centre.y-child.scale.y/2,high=centre.y+child.scale.y/2;
            const near=route.project(centre.x,centre.z,radius+30);
            if(Number.isFinite(near.distance)&&near.distance<radius+Math.abs(route.laneOffset(near.s,4.2))+5)for(let s=Math.max(0,near.s-radius-5);s<=Math.min(route.length,near.s+radius+5);s+=2)for(const lane of [0,4.2]){
                const q=route.lanePose(s,lane).position;if(low<q[1]+4.8&&high>q[1]-.5&&Math.hypot(centre.x-q[0],centre.z-q[2])<radius)return true;
            }
            for(const {service,index} of auxNear(centre.x,centre.z,radius)){const a=service.path.points[index],b=service.path.points[index+1],hit=segmentDistance(centre.x,centre.z,a,b),y=a[1]+(b[1]-a[1])*hit.t;if(hit.distance<radius&&low<y+4.8&&high>y-.5)return true;}
            return false;
        };
        for(const child of [...bridge.children]){
            if(child.userData.bridgeSupport&&((seamStart&&child.userData.bridgeEnd===1)||(seamEnd&&child.userData.bridgeEnd===-1))){bridge.remove(child);continue;}
            if(!child.userData.bridgeSupport||!intersects(child,child.position.x,child.scale.x))continue;
            bridge.remove(child);const count=Math.max(1,Math.ceil(child.scale.x/.75)),width=child.scale.x/count;
            for(let i=0;i<count;i++){const x=child.position.x-child.scale.x/2+width*(i+.5);if(intersects(child,x,width)){removed++;continue;}const section=child.clone();section.position.x=x;section.scale.x=width;bridge.add(section);}
        }
        if(removed)placements.push({id:`${id}/clearance-adjustment`,family:'clearance-adjusted-bridge-support',position:bridge.position.toArray(),removedSections:removed,confidence:'modelled opening; support arrangement requires site review'});
    };
    const cells = [];
    const refine = (x, z, size, depth, owner, emit) => {
        const cx = x + size / 2, cz = z + size / 2, diag = size * .71, near = route.project(cx, cz, diag + 70);
        const trackClose = near.distance < diag + 27;
        let roadClose = false;
        if (depth < 4 && !trackClose)
            for (const { road, i } of roadLookup(cx, cz, diag + 10))
                if (segmentDistance(cx, cz, road.points[i], road.points[i + 1]).distance < diag + road.width / 2 + 7) {
                    roadClose = true;
                    break;
                }
        const platformClose = localPlatforms.some(p => p.bounds[0] < x + size + 4 && p.bounds[2] > x - 4 && p.bounds[1] < z + size + 4 && p.bounds[3] > z - 4);
        const auxClose = auxNear(cx, cz, diag + 8).some(e => segmentDistance(cx, cz, e.service.path.points[e.index], e.service.path.points[e.index + 1]).distance < diag + 10);
        const seamClose = x <= owner[0] + .001 || z <= owner[1] + .001 || x + size >= owner[2] - .001 || z + size >= owner[3] - .001;
        if ((trackClose || platformClose || auxClose || roadClose || seamClose) && depth < 4) {
            const s = size / 2;
            refine(x, z, s, depth + 1, owner, emit);
            refine(x + s, z, s, depth + 1, owner, emit);
            refine(x, z + s, s, depth + 1, owner, emit);
            refine(x + s, z + s, s, depth + 1, owner, emit);
        }
        else
            cells.push({ x, z, size, emit });
    };
    const cell = 40;
    for (let z = bounds[1]; z < bounds[3] - .01; z += cell) {
        progress?.(.03 + .17 * (z - bounds[1]) / Math.max(1, bounds[3] - bounds[1]));
        for (let x = bounds[0]; x < bounds[2] - .01; x += cell)
            refine(x, z, Math.min(cell, bounds[2] - x, bounds[3] - z), 0, bounds, true);
    }
    progress?.(.2);
    const registered = route.data.tiles.some(t => t.id === tile.id), tileBounds = new Map(route.data.tiles.map(t => [`${Math.floor(t.bounds[0] / 1000)},${Math.floor(t.bounds[1] / 1000)}`, t.bounds])), haloRoots = new Set(), anchor = registered ? [0, 0] : [bounds[0], bounds[1]];
    for (const fp of crossingFootprints) {
        const x0 = anchor[0] + Math.floor((Math.min(...fp.map(q => q[0])) - anchor[0]) / cell) * cell - cell, x1 = Math.max(...fp.map(q => q[0])) + cell, z0 = anchor[1] + Math.floor((Math.min(...fp.map(q => q[1])) - anchor[1]) / cell) * cell - cell, z1 = Math.max(...fp.map(q => q[1])) + cell;
        for (let z = z0; z < z1; z += cell)
            for (let x = x0; x < x1; x += cell) {
                if (inside(x + cell / 2, z + cell / 2, bounds))
                    continue;
                const key = `${x},${z}`;
                if (haloRoots.has(key))
                    continue;
                haloRoots.add(key);
                let owner = tileBounds.get(`${Math.floor((x + cell / 2) / 1000)},${Math.floor((z + cell / 2) / 1000)}`);
                if (!registered) {
                    const w = bounds[2] - bounds[0], h = bounds[3] - bounds[1], xx = bounds[0] + Math.floor((x + cell / 2 - bounds[0]) / w) * w, zz = bounds[1] + Math.floor((z + cell / 2 - bounds[1]) / h) * h;
                    owner = [xx, zz, xx + w, zz + h];
                }
                if (owner)
                    refine(x, z, cell, 0, owner, false);
            }
    }
    const horizontal = new Map(), vertical = new Map();
    const edge = (x, z) => { let h = horizontal.get(z); if (!h)
        horizontal.set(z, h = new Set()); h.add(x); let v = vertical.get(x); if (!v)
        vertical.set(x, v = new Set()); v.add(z); };
    for (const c of cells) {
        edge(c.x, c.z);
        edge(c.x + c.size, c.z);
        edge(c.x, c.z + c.size);
        edge(c.x + c.size, c.z + c.size);
    }
    const hs = new Map([...horizontal].map(([k, v]) => [k, [...v].sort((a, b) => a - b)])), vs = new Map([...vertical].map(([k, v]) => [k, [...v].sort((a, b) => a - b)]));
    const soil = new CookedSoil();
    const portalPlanes = [
        ...(route.data.tunnels || []).flatMap(t => [[route.sourceS(t.start), 1], [route.sourceS(t.end), -1]].map(([s, direction]) => ({ s, direction, pose: route.sample(s, centre(s)), halfWidth: Math.max((t.width ?? 9) / 2 + .8, formationWidth(s) / 2 + .2) }))),
        ...(route.data.civils || []).filter(c=>c.metadata?.mode==='tram' && c.metadata?.tunnel).flatMap(c=>{const path=new CurvePath(c.points),halfWidth=(Number(c.metadata.boreRadius)||2.3)+.8;return [{direction:1,pose:path.sample(0),halfWidth},{direction:-1,pose:path.sample(path.length),halfWidth}];}),
    ].filter(p => p.pose.position[0] >= supportBounds[0] - p.halfWidth - 5 && p.pose.position[0] <= supportBounds[2] + p.halfWidth + 5 && p.pose.position[2] >= supportBounds[1] - p.halfWidth - 5 && p.pose.position[2] <= supportBounds[3] + p.halfWidth + 5);
    const terrainTriangle = (a, b, c, color, emit) => {
        let polygons = [[a, b, c]];
        for (const portal of portalPlanes) {
            const { pose, direction } = portal, signed = (v) => ((v[0] - pose.position[0]) * pose.tangent[0] + (v[2] - pose.position[2]) * pose.tangent[2]) * direction;
            if (![a, b, c].some(v => Math.hypot(v[0] - pose.position[0], v[2] - pose.position[2]) < portal.halfWidth + 5))
                continue;
            polygons = polygons.flatMap(poly => {
                const distances = poly.map(signed);
                if (Math.min(...distances) >= 0 || Math.max(...distances) <= 0)
                    return [poly];
                const clip = (subject, distance, keepInside) => {
                    const out = [];
                    for (let i = 0; i < subject.length; i++) {
                        const p = subject[i], q = subject[(i + 1) % subject.length], dp = distance(p), dq = distance(q), pin = keepInside ? dp >= 0 : dp <= 0, qin = keepInside ? dq >= 0 : dq <= 0;
                        if (pin)
                            out.push([...p]);
                        if (pin !== qin) {
                            const t = dp / (dp - dq);
                            out.push(p.map((v, j) => v + (q[j] - v) * t));
                        }
                    }
                    return out;
                };
                const lateral = (v) => (v[0] - pose.position[0]) * pose.right[0] + (v[2] - pose.position[2]) * pose.right[2], rightBound = (v) => portal.halfWidth - lateral(v), leftBound = (v) => portal.halfWidth + lateral(v);
                const outsideRight = clip(poly, rightBound, false), leftRegion = clip(poly, rightBound, true), outsideLeft = clip(leftRegion, leftBound, false), band = clip(leftRegion, leftBound, true);
                const roof = clip(band, signed, true), cutting = clip(band, signed, false);
                for (const q of roof) {
                    const along = (q[0] - pose.position[0]) * pose.tangent[0] + (q[2] - pose.position[2]) * pose.tangent[2];
                    q[1] = Math.max(q[1], pose.position[1] + pose.grade * along + 7.2);
                }
                for (const q of cutting)
                    if (Math.abs(signed(q)) < 1e-5)
                        q[1] = ground(q[0] - pose.tangent[0] * direction * .05, q[2] - pose.tangent[2] * direction * .05);
                return [outsideRight, outsideLeft, roof, cutting].filter(p => p.length >= 3);
            });
        }
        for (const poly of polygons)
            for (let i = 1; i < poly.length - 1; i++) {
                const u = poly[0], v = poly[i], w = poly[i + 1];
                if (Math.abs((v[0] - u[0]) * (w[2] - u[2]) - (w[0] - u[0]) * (v[2] - u[2])) < 1e-8)
                    continue;
                soil.add(u, v, w);
                if (emit) {
                    topTriangle(batch, u, v, w, color);
                    checks.terrainTriangles++;
                }
                else
                    checks.supportHaloTriangles++;
            }
    };
    for (let cellIndex=0;cellIndex<cells.length;cellIndex++) {
        const c=cells[cellIndex];
        if ((cellIndex & 1023) === 0) progress?.(.25 + .45 * cellIndex / Math.max(1,cells.length));
        const x1 = c.x + c.size, z1 = c.z + c.size, cx = (c.x + x1) / 2, cz = (c.z + z1) / 2;
        const cy = ground(cx, cz);
        const boundary = [];
        for (const x of hs.get(c.z) || [])
            if (x >= c.x && x <= x1)
                boundary.push([x, c.z]);
        for (const z of vs.get(x1) || [])
            if (z > c.z && z <= z1)
                boundary.push([x1, z]);
        for (const x of [...(hs.get(z1) || [])].reverse())
            if (x >= c.x && x < x1)
                boundary.push([x, z1]);
        for (const z of [...(vs.get(c.x) || [])].reverse())
            if (z > c.z && z < z1)
                boundary.push([c.x, z]);
        const rng = random(hash(`${Math.floor(cx / 20)},${Math.floor(cz / 20)}`));
        const color = palette.grass.clone().multiplyScalar(.91 + rng() * .13);
        for (let i = 0; i < boundary.length; i++) {
            const a = boundary[i], b = boundary[(i + 1) % boundary.length];
            const u = p(cx, cy, cz), v = p(b[0], ground(b[0], b[1]), b[1]), w = p(a[0], ground(a[0], a[1]), a[1]);
            terrainTriangle(u, v, w, color, c.emit);
        }
    }
    progress?.(.7);
    const analyticGround = ground;
    ground = (x, z) => soil.height(x, z) ?? analyticGround(x, z);
    const accessFloor = (point, stationId) => {
        const mapped = allPlatforms.find(p => p.station === stationId && platformContains(p, point[0], point[2]));
        if (mapped)
            return platformSurfaceY(mapped, point[0], point[2]);
        const station = route.stations.find(s => s.id === stationId), near = route.project(point[0], point[2], 100), opposite = route.laneOffset(near.s, 4.2), outer = near.side < Math.min(0, opposite) ? Math.min(0, opposite) - near.side : near.side - Math.max(0, opposite);
        if (!station || Math.abs(near.s - station.s) > station.length / 2 || outer < 1.7 || outer > 5.8)
            throw new Error(`${stationId}: SUPPORT-01 stair landing is outside the platform`);
        const lane = near.side < Math.min(0, opposite) ? (opposite < 0 ? 4.2 : 0) : (opposite < 0 ? 0 : 4.2);
        return route.lanePose(near.s, lane).position[1] + .915;
    };
    const accessSites = solveAccessSites(route, [...rawRoads.values()], accessFloor);
    const accessBeam = (a, b, width, color) => { const av = new THREE.Vector3(...a), bv = new THREE.Vector3(...b), m = new THREE.Mesh(sharedBox, material(color)); m.position.copy(av).add(bv).multiplyScalar(.5); m.scale.set(width, av.distanceTo(bv), width); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), bv.sub(av).normalize()); batch.add(m); };
    for (const site of accessSites) {
        const path = new Polyline(site.deck), mid = path.sample(path.length / 2).position;
        if (!inside(mid[0], mid[2], bounds))
            continue;
        const at = (s, offset, up = 0) => { const q = path.sample(s, offset).position; return [q[0], q[1] + up, q[2]]; }, purple = 0x514054, cream = 0xc7bba2;
        for (let s = 0; s < path.length; s += 1) {
            const e = Math.min(path.length, s + 1), a = at(s, -site.width / 2), b = at(s, site.width / 2), c = at(e, site.width / 2), d = at(e, -site.width / 2);
            followingSolid(batch, [[a, b, c, d]], -ACCESS_RULES.deckThickness, 0, new THREE.Color(purple));
            for (const side of [-1, 1]) {
                accessBeam(at(s, side * site.width / 2, .15), at(e, side * site.width / 2, .15), .08, purple);
                accessBeam(at(s, side * site.width / 2, 1.05), at(e, side * site.width / 2, 1.05), .08, purple);
                accessBeam(at(s, side * site.width / 2, .15), at(e, side * site.width / 2, 1.05), .045, cream);
                accessBeam(at(s, side * site.width / 2, 1.05), at(e, side * site.width / 2, .15), .045, cream);
            }
            if (site.covered) {
                for (const side of [-1, 1])
                    topQuad(batch, at(s, side * (site.width / 2 + .2), 2.0), at(e, side * (site.width / 2 + .2), 2.0), at(e, 0, 2.4), at(s, 0, 2.4), new THREE.Color(0x505350));
            }
        }
        for (const s of [0, path.length])
            for (const side of [-1, 1]) {
                const q = at(s, side * (site.width / 2 - .15)), floor = accessFloor(q, site.station), soil = ground(q[0], q[2]);
                box(batch, q[0], (soil + floor) / 2, q[2], .55, Math.max(.05, floor - soil), .55, 0x918c7d);
                box(batch, q[0], (floor + q[1] - .30) / 2, q[2], .24, q[1] - .30 - floor, .24, purple);
            }
        for (let s = 0; s <= path.length; s += 2)
            for (const side of [-1, 1])
                accessBeam(at(s, side * site.width / 2, 0), at(s, side * site.width / 2, 2), .08, purple);
        for (const stair of site.stairs) {
            const dx = stair.bottom[0] - stair.top[0], dz = stair.bottom[2] - stair.top[2], length = Math.hypot(dx, dz), right = [-dz / length, dx / length], yaw = Math.atan2(-dx, -dz);
            for (let i = 0; i < stair.steps; i++) {
                const t = (i + .5) / stair.steps, x = stair.top[0] + dx * t, z = stair.top[2] + dz * t, top = stair.top[1] - i * stair.riser, floor = accessFloor([x, 0, z], site.station);
                box(batch, x, (floor + top) / 2, z, stair.width, Math.max(.02, top - floor), stair.going + .002, purple, yaw);
            }
            for (const side of [-1, 1]) {
                const a = [stair.top[0] + right[0] * side * stair.width / 2, stair.top[1] + 1.05, stair.top[2] + right[1] * side * stair.width / 2], b = [stair.bottom[0] + right[0] * side * stair.width / 2, stair.bottom[1] + 1.05, stair.bottom[2] + right[1] * side * stair.width / 2];
                accessBeam(a, b, .065, cream);
                for (let i = 0; i <= stair.steps; i += Math.max(1, Math.floor(stair.steps / 6))) {
                    const t = i / stair.steps, q = [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t - 1.05, a[2] + (b[2] - a[2]) * t];
                    accessBeam(q, [q[0], q[1] + 1.05, q[2]], .06, cream);
                }
            }
        }
        placements.push({ id: site.id, family: 'layered-access', position: mid, sourceIds: site.sourceIds, reference: site.reference, confidence: site.confidence, ruleVersion: ACCESS_RULES.version, deck: site.deck, stairs: site.stairs, supportOwner: `station/${site.station}/platforms`, covered: site.covered });
    }
    // Mainline construction uses the very same curvilinear poses as the simulator.
    const ribbon = (sa, sb, offset, width, top, thickness, color, lane, closed = false) => {
        const oa = typeof offset === 'number' ? offset : offset(sa), ob = typeof offset === 'number' ? offset : offset(sb), wa = typeof width === 'number' ? width : width(sa), wb = typeof width === 'number' ? width : width(sb);
        const a = lane === undefined ? route.sample(sa, oa - wa / 2).position : route.railPosition(sa, lane, oa - wa / 2), b = lane === undefined ? route.sample(sa, oa + wa / 2).position : route.railPosition(sa, lane, oa + wa / 2), c = lane === undefined ? route.sample(sb, ob + wb / 2).position : route.railPosition(sb, lane, ob + wb / 2), d = lane === undefined ? route.sample(sb, ob - wb / 2).position : route.railPosition(sb, lane, ob - wb / 2);
        const upA = lane === undefined ? [0, 1, 0] : sectionUp(route.lanePose(sa, lane)), upB = lane === undefined ? [0, 1, 0] : sectionUp(route.lanePose(sb, lane));
        const lift = (v, y, end = false) => v.map((value, i) => value + (end ? upB : upA)[i] * y);
        topQuad(batch, lift(a, top), lift(d, top, true), lift(c, top, true), lift(b, top), color);
        if (thickness) {
            quad(batch, lift(a, top), lift(d, top, true), lift(d, top - thickness, true), lift(a, top - thickness), color.clone().multiplyScalar(.82));
            quad(batch, lift(b, top - thickness), lift(c, top - thickness, true), lift(c, top, true), lift(b, top), color.clone().multiplyScalar(.75));
        }
        if (closed)
            quad(batch, lift(a, top - thickness), lift(d, top - thickness, true), lift(c, top - thickness, true), lift(b, top - thickness), color);
    };
    const formationSurface = new CookedSoil();
    for (let i = 0; i < route.points.length - 1; i++) {
        const pa = route.points[i], pb = route.points[i + 1], x = (pa[0] + pb[0]) / 2, z = (pa[2] + pb[2]) / 2;
        if (x < bounds[0] - 40 || x > bounds[2] + 40 || z < bounds[1] - 40 || z > bounds[3] + 40)
            continue;
        const sa = route.lengths[i], sb = route.lengths[i + 1], at = (s, o) => { const q = route.sample(s, o).position; return [q[0], q[1] - .54, q[2]]; }, a = at(sa, centre(sa) - formationWidth(sa) / 2), b = at(sa, centre(sa) + formationWidth(sa) / 2), c = at(sb, centre(sb) + formationWidth(sb) / 2), d = at(sb, centre(sb) - formationWidth(sb) / 2);
        formationSurface.add(a, b, c);
        formationSurface.add(a, c, d);
    }
    for (let i = 0; i < route.points.length - 1; i++) {
        const a = route.points[i], b = route.points[i + 1];
        if (!inside((a[0] + b[0]) / 2, (a[2] + b[2]) / 2, bounds))
            continue;
        const sa = route.lengths[i], sb = route.lengths[i + 1];
        ribbon(sa, sb, centre, formationWidth, -.54, .16, palette.ballast.clone().multiplyScalar(.88), undefined, true);
        for (const lane of runningLanes) {
            let spans = [[sa, sb]];
            for (const sw of switchDefs.filter(sw => sw.lane === lane && sw.endS > sa && sw.startS < sb))
                spans = spans.flatMap(([a, b]) => sw.endS <= a || sw.startS >= b ? [[a, b]] : [[a, Math.min(b, sw.startS)], [Math.max(a, sw.endS), b]].filter(([a, b]) => b - a > 1e-6));
            if (spans.length !== 1 || spans[0][0] !== sa || spans[0][1] !== sb)
                checks.switchRailSegmentsSuppressed++;
            for (const [a, b] of spans) {
                const section = (s) => ballastSection(route.lanePose(s, lane), (x, z) => formationSurface.height(x, z) ?? route.sample(s).position[1] - .54, [route.lanePose(s, lane === 0 ? 4.2 : 0).position]);
                for (let s = a; s < b; s += 2)
                    ballastSpan(batch, section(s), section(Math.min(b, s + 2)), palette.ballast, (a, b, c) => sourceBedOwnership.emit(batch, a, b, c, palette.ballast));
                for (const rail of [-.755, .755])
                    for (const [width, top, thickness] of [[.075, 0, .045], [.025, -.045, .07], [.14, -.115, .025]])
                        ribbon(a, b, rail, width, top, thickness, palette.rail, lane, true);
            }
        }
        checks.railSamples++;
    }
    for (let s = Math.max(0, Math.floor((minS - 1800) / .68) * .68); s < Math.min(route.length, minS + 1800); s += .68) {
        const pose = route.sample(s);
        if (!inside(pose.position[0], pose.position[2], bounds))
            continue;
        for (const lane of runningLanes) {
            if (switchDefs.some(sw => sw.lane === lane && s >= sw.startS - .12 && s <= sw.endS + .12)) {
                checks.switchSleepersSuppressed++;
                continue;
            }
            const q = route.lanePose(s, lane), sleeper = trackBox(batch, q, -.215, 2.65, .15, .24, 0x675f50, `sleeper/${lane}/${s.toFixed(3)}`), up = sectionUp(q);
            sleeper.userData.maximumPermittedBallastEmbed = .075;
            let embed = 0;
            for (const x of [-.5, .5])
                for (const z of [-.5, .5]) {
                    const corner = new THREE.Vector3(x, -.5, z).applyMatrix4(sleeper.matrixWorld).toArray(), measure = sourceBedOwnership.embedding(corner, up);
                    if (measure.overlap) {
                        checks.sourceBedSleeperCornersCovered++;
                        embed = Math.max(embed, measure.embed);
                        checks.sourceBedMaximumSleeperEmbed = Math.max(checks.sourceBedMaximumSleeperEmbed, measure.embed);
                        if (measure.embed > .075)
                            checks.sourceBedSleeperEmbedFailures++;
                    }
                }
            sleeper.userData.maximumMeasuredSourceBallastEmbed = embed;
        }
    }
    for (let roadIndex=0;roadIndex<roads.length;roadIndex++) {
        const road=roads[roadIndex];
        if ((roadIndex & 31) === 0) progress?.(.76 + .1 * roadIndex / Math.max(1,roads.length));
        const foot = ['footway', 'path', 'steps', 'cycleway', 'pedestrian', 'corridor'].includes(road.kind), color = foot ? palette.pavement : palette.asphalt;
        const cuts = roadSpanCuts(road), opening = roadBridgeOpening(road);
        for (let i = 0; i < cuts.length - 1; i++) {
            const s = cuts[i], e = cuts[i + 1], mid = road.path.sample((s + e) / 2).position;
            if (e - s < 1e-6 || !inside(mid[0], mid[2], bounds))
                continue;
            const crown = road.mode === 'crossing' || road.mode === 'pedestrian-crossing' ? -.005 : .035, openSpan = !!opening && (s + e) / 2 > opening[0] && (s + e) / 2 < opening[1];
            const a = roadPoint(road, s, -road.width / 2), b = roadPoint(road, s, 0, crown), c = roadPoint(road, e, 0, crown), d = roadPoint(road, e, -road.width / 2);
            const aa = roadPoint(road, s, road.width / 2), dd = roadPoint(road, e, road.width / 2);
            topQuad(batch, a, d, c, b, color);
            topQuad(batch, b, c, dd, aa, color);
            for (const side of [-1, 1]) {
                const u = roadPoint(road, s, side * road.width / 2), v = roadPoint(road, e, side * road.width / 2);
                const underU = p(u[0], Math.min(u[1] - .25, ground(u[0], u[2])), u[2]), underV = p(v[0], Math.min(v[1] - .25, ground(v[0], v[2])), v[2]);
                // The structural deck owns the open span; an earth wall here would
                // seal the railway opening. Approaches retain their soil-facing walls.
                if (!openSpan)
                    quad(batch, u, v, underV, underU, palette.earth);
                if (!foot && road.width < 12) {
                    const outerU = roadPoint(road, s, side * (road.width / 2 + 1.15), .10), outerV = roadPoint(road, e, side * (road.width / 2 + 1.15), .10);
                    topQuad(batch, p(u[0], u[1] + .10, u[2]), p(v[0], v[1] + .10, v[2]), outerV, outerU, palette.pavement);
                    if (!openSpan)
                        quad(batch, outerU, outerV, p(outerV[0], ground(outerV[0], outerV[2]), outerV[2]), p(outerU[0], ground(outerU[0], outerU[2]), outerU[2]), palette.earth);
                }
            }
            if (!foot && road.width >= 4.5 && Math.floor(s / 6) % 2 === 0 && road.mode !== 'crossing') {
                const aa = roadPoint(road, s, -.06, .055), bb = roadPoint(road, s, .06, .055), cc = roadPoint(road, Math.min(s + 2.8, e), .06, .055), dd = roadPoint(road, Math.min(s + 2.8, e), -.06, .055);
                topQuad(batch, aa, dd, cc, bb, palette.white);
            }
        }
        const declaredRoadSite = roadSiteDefinitions.find(d => d.id === road.sourceStructure && d.form === 'masonry-arch');
        if (road.mode === 'over' && road.crossingS !== undefined && opening && opening[1]>0 && opening[0]<road.path.length && (!declaredRoadSite||road.structureOwner!==false)) {
            if (foot) {
                // Use the actual walkway extent. A generic 30 m road bridge can put
                // an end abutment across a railway when a short access spur joins it.
                const opening = roadBridgeOpening(road), start = Math.max(0, opening[0]), end = Math.min(road.path.length, opening[1]);
                for (let s = start; s < end; s += 4) {
                    const e = Math.min(end, s + 4), q = road.path.sample((s + e) / 2);
                    box(batch, q.position[0], q.position[1] - .16, q.position[2], road.width + .3, .3, e - s + .02, 0x7e8883, q.yaw);
                    for (const side of [-1, 1]) {
                        const v = road.path.sample((s + e) / 2, side * (road.width / 2 + .1));
                        box(batch, v.position[0], v.position[1] + .6, v.position[2], .07, 1.2, e - s, 0x5c7069, q.yaw);
                    }
                }
                for (const s of [start, end]) {
                    if(s===0&&road.connectionNodes?.[0]?.startsWith('seam/')||s===road.path.length&&road.connectionNodes?.[1]?.startsWith('seam/'))continue;
                    const q = road.path.sample(s), bottom = ground(q.position[0], q.position[2]);
                    if (runningClear(q.position[0], q.position[2], road.width / 2 + .5) && q.position[1] - .3 > bottom)
                        box(batch, q.position[0], (bottom + q.position[1] - .3) / 2, q.position[2], road.width + .3, q.position[1] - .3 - bottom, .45, 0x718078, q.yaw);
                }
                placements.push({ id: `${road.id}/deck`, family: 'source-footbridge', position: road.path.sample(road.crossingS).position, confidence: 'source walkway extent; inferred deck profile' });
                checks.engineeredCrossings++;
                continue;
            }
            // The source span can be split at road junctions or tile edges. Do
            // not extrapolate its deck and abutments past the mapped road piece.
            const opening=roadBridgeOpening(road),spanStart=Math.max(0,opening[0]),spanEnd=Math.min(road.path.length,opening[1]);
            const pose = road.path.sample((spanStart+spanEnd)/2), buried = route.tunnelAt(road.routeS ?? 0), civil = route.data.structures.find(s => s.id === road.sourceStructure);
            const upperSupports = (civil?.underRoutes || []).flatMap(s => s.points.map(q => q[1]));
            const nearRail=route.project(pose.position[0],pose.position[2],80),crossesRail=nearRail.distance<Math.abs(route.laneOffset(nearRail.s,4.2))+14;
            const below = buried ? Math.min(pose.position[1] - .9, ground(pose.position[0], pose.position[2]), ...(upperSupports.length ? upperSupports : [Infinity])) : crossesRail?route.sample(nearRail.s).position[1]-.6:Math.min(pose.position[1]-.9,ground(pose.position[0],pose.position[2]));
            if (declaredRoadSite) {
                const railPose = route.sample(road.routeS, centre(road.routeS)), hit = road.path.nearest(railPose.position[0], railPose.position[2]), centrePose = road.path.sample(hit.s), u = centrePose.tangent[0] * railPose.right[0] + centrePose.tangent[2] * railPose.right[2], v = -(centrePose.tangent[0] * railPose.tangent[0] + centrePose.tangent[2] * railPose.tangent[2]), base = railPose.position[1] - .54;
                const bridge = factory.masonryArch({ id: road.sourceStructure, spring: declaredRoadSite.archSpring, rise: declaredRoadSite.archRise, confidence: declaredRoadSite.confidence, opening: Math.abs(route.laneOffset(road.routeS, 4.2)) + 4.4, height: centrePose.position[1] - base, depth: (road.width + 2.4) / Math.max(.35, Math.abs(u)), shear: v / u });
                bridge.position.set(centrePose.position[0], base, centrePose.position[2]);
                bridge.rotation.y = railPose.yaw;
                bridge.updateMatrixWorld(true);
                for (const anchor of bridge.userData.supportAnchors) {
                    const q = new THREE.Vector3(...anchor).applyMatrix4(bridge.matrixWorld), bottom = ground(q.x, q.z) - .12;
                    if (bottom < q.y)
                        box(batch, q.x, (bottom + q.y) / 2, q.z, .9, q.y - bottom + .03, .9, 0x918c7d, railPose.yaw);
                }
                batch.add(bridge);
                placements.push({ id: declaredRoadSite.id, family: 'road-bridge', position: centrePose.position, supportY: base, sourceIds: [road.id], reference: declaredRoadSite.reference, confidence: declaredRoadSite.confidence });
                checks.engineeredCrossings++;
                continue;
            }
            const bridge = factory.bridge({ id: `${road.id}/deck`, type: 'road', width: road.width + 2.4, length: Math.max(2, spanEnd-spanStart), height: pose.position[1] - below });
            bridge.position.set(pose.position[0], below, pose.position[2]);
            bridge.rotation.y = pose.yaw;
            protectBridgeSupports(bridge,road.id,spanStart===0&&road.connectionNodes?.[0]?.startsWith('seam/'),spanEnd===road.path.length&&road.connectionNodes?.[1]?.startsWith('seam/'));
            rememberDeck(bridge, `${road.id}/deck`);
            batch.add(bridge);
            placements.push({ id: `${road.id}/deck`, family: 'road-bridge', position: pose.position, supportY: below });
            checks.engineeredCrossings++;
        }
        else if (road.mode === 'under' && road.routeS !== undefined && road.structureOwner!==false) {
            const pose = route.sample(road.routeS, centre(road.routeS)), roadY = road.path.sample(road.crossingS ?? 0).position[1];
            const bridge = factory.bridge({ id: `${road.id}/rail-deck`, type: 'rail', width: formationWidth(road.routeS), length: road.width + 7, height: pose.position[1] - .35 - roadY });
            bridge.position.set(pose.position[0], roadY, pose.position[2]);
            bridge.rotation.y = pose.yaw;
            rememberDeck(bridge, `${road.id}/rail-deck`);
            batch.add(bridge);
            placements.push({ id: `${road.id}/rail-deck`, family: 'rail-bridge', position: pose.position, supportY: roadY });
            checks.engineeredCrossings++;
        }
        else if(road.mode==='tunnel'&&road.structureOwner!==false){const pose=road.path.sample(road.path.length/2),tunnel=factory.tunnel({id:`${road.id}/bore`,width:road.width+1,height:5.5,length:road.path.length});tunnel.position.fromArray(pose.position);tunnel.rotation.y=pose.yaw;batch.add(tunnel);placements.push({id:`${road.id}/bore`,family:'road-tunnel',position:pose.position,confidence:'mapped tunnel; modelled portal and level'});}
        checks.roads++;
    }
    for(const junction of route.data.roadJunctions||[]){const [x,y,z]=junction.position;if(!inside(x,z,bounds)||!runningClear(x,z,junction.radius+1))continue;const center=p(x,y+.045,z),radius=junction.radius,color=palette.asphalt;
      for(let i=0;i<16;i++){const a=i*Math.PI/8,b=(i+1)*Math.PI/8,ax=x+Math.cos(a)*radius,az=z+Math.sin(a)*radius,bx=x+Math.cos(b)*radius,bz=z+Math.sin(b)*radius;topTriangle(batch,center,p(ax,ground(ax,az)+.23,az),p(bx,ground(bx,bz)+.23,bz),color);}
      placements.push({id:junction.id,family:'road-junction',position:junction.position,template:junction.template,ports:junction.ports});
    }
    for (const civil of sourceStructures) {
        if (!['railBridge', 'roadBridge', 'footbridge'].includes(civil.type))
            continue;
        const [x, , z] = civil.position, near = route.project(x, z, 300), sourceIds = civil.sourceWayIds || [];
        const sameKind = civil.type === 'railBridge' ? 'rail-bridge' : civil.type === 'roadBridge' ? 'road-bridge' : 'source-footbridge';
        const represented = placements.find(v => v.family === sameKind && Math.hypot(v.position[0] - x, v.position[2] - z) < 20);
        if (represented) {
            represented.sourceIds = [...(represented.sourceIds || []), civil.id];
            checks.civilDuplicatesAvoided++;
            checks.sourceCivils++;
            continue;
        }
        const pointA = civil.points?.[0], pointB = civil.points?.[civil.points.length - 1];
        const yaw = pointA && pointB ? Math.atan2(-(pointB[0] - pointA[0]), -(pointB[2] - pointA[2])) : Number(civil.angle) || 0;
        const length = Math.max(5, civil.length ?? (pointA && pointB ? Math.hypot(pointB[0] - pointA[0], pointB[2] - pointA[2]) : 18)), width = clamp(civil.width ?? (civil.type === 'footbridge' ? 2.2 : 8), 1.8, 22);
        const railY = route.sample(near.s, near.side).position[1];
        const bindsMainRail = civil.type === 'railBridge' && near.distance < 30 && (!route.tunnelAt(near.s) || Math.abs(civil.position[1] - railY) < 3.5);
        let deck = bindsMainRail ? railY - .35 : civil.position[1];
        if (civil.type !== 'railBridge' && near.distance < 25)
            deck = Math.max(deck, railY + 6.3);
        if (civil.type === 'footbridge') {
            const g = new THREE.Group(), right = [Math.cos(yaw), -Math.sin(yaw)], forward = [-Math.sin(yaw), -Math.cos(yaw)];
            const world = (xx, zz) => [x + right[0] * xx - forward[0] * zz, z + right[1] * xx - forward[1] * zz];
            box(batch, x, deck - .18, z, width, .36, length, 0x7e8883, yaw);
            for (const side of [-1, 1]) {
                const q = world(side * (width / 2 - .06), 0);
                box(batch, q[0], deck + .66, q[1], .10, 1.3, length, 0x5c7069, yaw);
            }
            for (const end of [-1, 1]) {
                const endLocal = end * (length / 2 - .5), landing = world(0, endLocal), floor = walkSurface(landing[0], landing[1]);
                for (const side of [-1, 1]) {
                    const q = world(side * (width / 2 - .22), endLocal), bottom = ground(q[0], q[1]) - .1;
                    box(batch, q[0], (bottom + deck - .36) / 2, q[1], .28, Math.max(.12, deck - .36 - bottom), .32, 0x718078, yaw);
                }
                const rise = Math.max(.25, deck - floor), steps = Math.max(3, Math.ceil(rise / .19)), run = steps * .29;
                for (let i = 0; i < steps; i++) {
                    const zz = end * (length / 2 + (i + .5) * .29), q = world(0, zz), support = ground(q[0], q[1]), top = deck - (i + 1) * rise / steps;
                    if (top > support)
                        box(batch, q[0], (support + top) / 2, q[1], width, top - support, .295, 0x8c9389, yaw);
                }
                const far = world(0, end * (length / 2 + run + .75)), landingY = walkSurface(far[0], far[1]);
                box(batch, far[0], landingY + .04, far[1], width + .5, .08, 1.5, 0xaaa99c, yaw);
                for (const side of [-1, 1]) {
                    const a = world(side * width / 2, end * length / 2), b = world(side * width / 2, end * (length / 2 + run)), v1 = new THREE.Vector3(a[0], deck + 1, a[1]), v2 = new THREE.Vector3(b[0], landingY + 1, b[1]);
                    const rail = new THREE.Mesh(sharedBox, material(0x5c7069));
                    rail.position.copy(v1).add(v2).multiplyScalar(.5);
                    rail.scale.set(.07, v1.distanceTo(v2), .07);
                    rail.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), v2.clone().sub(v1).normalize());
                    batch.add(rail);
                }
            }
            void g;
            void sourceIds;
        }
        else {
            const supports = civil.supports || [];
            const levels = supports.map(q => ground(q[0], q[2]));
            for (const opening of civil.underRoutes || [])
                levels.push(...opening.points.map(q => q[1]));
            const base = Math.min(ground(x, z), ...(levels.length ? levels : [deck - 1]));
            const bridge = factory.bridge({ id: civil.id, type: civil.type === 'railBridge' ? 'rail' : 'road', width, length, height: Math.max(.9, deck - base) });
            bridge.position.set(x, Math.min(base, deck - .9), z);
            bridge.rotation.y = yaw;
            rememberDeck(bridge, civil.id);
            batch.add(bridge);
            for (const opening of civil.underRoutes || []) {
                if (opening.points.length < 2 || roads.some(r => r.id.startsWith(opening.id)))
                    continue;
                const path = new Polyline(opening.points), pose = path.sample(path.length / 2);
                box(batch, pose.position[0], pose.position[1] - .1, pose.position[2], opening.width, .2, path.length, 0x686c68, pose.yaw);
            }
        }
        placements.push({ id: civil.id, family: sameKind, position: [x, deck, z], supportY: ground(x, z), source: civil.source, confidence: civil.confidence });
        checks.sourceCivils++;
    }
    for (const platform of allPlatforms) {
        if (!inside(...platform.centre, bounds))
            continue;
        for (const tri of platform.triangles)
            refinePlatformTriangle(tri, (a, b, c) => topTriangle(batch, p(a[0], platform.top(...a), a[1]), p(b[0], platform.top(...b), b[1]), p(c[0], platform.top(...c), c[1]), new THREE.Color(0x666c67)));
        for (const boundary of platform.boundaries) {
            const { a, b } = boundary, len = Math.hypot(b[0] - a[0], b[1] - a[1]), segments = Math.max(1, Math.ceil(len / 6)), nx = (b[1] - a[1]) / len, nz = -(b[0] - a[0]) / len;
            const inward = boundary.inward, outward = nx * -inward[0] + nz * -inward[1] > 0 ? 1 : -1;
            for (let i = 0; i < segments; i++) {
                const at = (t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t], u = at(i / segments), v = at((i + 1) / segments);
                const ut = p(u[0], platform.top(...u), u[1]), vt = p(v[0], platform.top(...v), v[1]), ub = p(u[0], platform.station === 'SGB' && platform.railSource === 'mainline rail-relative' ? platform.top(...u) - .45 : ground(...u) - .08, u[1]), vb = p(v[0], platform.station === 'SGB' && platform.railSource === 'mainline rail-relative' ? platform.top(...v) - .45 : ground(...v) - .08, v[1]);
                if (outward > 0)
                    quad(batch, ut, vt, vb, ub, palette.pavement);
                else
                    quad(batch, vt, ut, ub, vb, palette.pavement);
                if (boundary.railEdge) {
                    for (const [offset, width, lift, color] of [[.17, .34, .016, palette.pavement], [.46, .10, .027, new THREE.Color(0xe8ce55)], [.70, .24, .021, new THREE.Color(0xbab399)]]) {
                        const aa = [u[0] + inward[0] * (offset - width / 2), u[1] + inward[1] * (offset - width / 2)], bb = [u[0] + inward[0] * (offset + width / 2), u[1] + inward[1] * (offset + width / 2)], cc = [v[0] + inward[0] * (offset + width / 2), v[1] + inward[1] * (offset + width / 2)], dd = [v[0] + inward[0] * (offset - width / 2), v[1] + inward[1] * (offset - width / 2)];
                        const mid = [(aa[0] + bb[0] + cc[0] + dd[0]) / 4, (aa[1] + bb[1] + cc[1] + dd[1]) / 4];
                        if (!platformContains(platform, ...mid))
                            continue;
                        topQuad(batch, p(aa[0], platform.top(...aa) + lift, aa[1]), p(bb[0], platform.top(...bb) + lift, bb[1]), p(cc[0], platform.top(...cc) + lift, cc[1]), p(dd[0], platform.top(...dd) + lift, dd[1]), color);
                    }
                }
            }
        }
        placements.push({ id: platform.id, family: 'mapped-platform', position: [platform.centre[0], platform.top(...platform.centre), platform.centre[1]], supportY: ground(...platform.centre), station: platform.station, railSource: platform.railSource, footprint: platform.footprint, rawSourcePreserved: true, sourceOutlinePreserved: platform.clearanceAdjustmentArea < .001, derivedClearanceAdjustmentArea: platform.clearanceAdjustmentArea });
        checks.mappedPlatforms++;
    }
    const composeMappedStation = (station, platforms) => {
        const occupied = [], historic = ['BMO', 'DDG', 'HAG', 'KDT', 'BEW', 'NWH', 'ARL', 'HIG', 'HLD', 'EAR', 'BRG'].includes(station.id), stationPose = route.sample(station.s);
        for (const platform of platforms) {
            const span = platform.footprint.map(q => (q[0] - platform.centre[0]) * platform.axis[0] + (q[1] - platform.centre[1]) * platform.axis[1]), lo = Math.min(...span), hi = Math.max(...span), yaw = Math.atan2(-platform.axis[1], platform.axis[0]), forwardYaw = Math.atan2(-platform.axis[0], -platform.axis[1]);
            let waitingRoom;
            if (historic) {
                const desired = [platform.centre[0] + platform.axis[0] * (lo + 22), platform.centre[1] + platform.axis[1] * (lo + 22)], anchor = platformAnchor(platform, desired, 1.4), right = [-platform.axis[1], platform.axis[0]];
                if (anchor) {
                    const corners = [];
                    for (const x of [-1.2, 1.2])
                        for (const z of [-2.5, 2.5])
                            corners.push([anchor[0] + right[0] * x + platform.axis[0] * z, anchor[1] + right[1] * x + platform.axis[1] * z]);
                    if (corners.every(q => platformContains(platform, ...q) && runningClear(...q, .2))) {
                        const level = Math.max(...corners.map(q => platformSurfaceY(platform, ...q))), low = Math.min(...corners.map(q => platformSurfaceY(platform, ...q))), building = factory.building({ id: `${platform.id}/waiting-room`, width: 2.4, depth: 5, height: 2.8, style: 'historic', seed: hash(platform.id) });
                        building.position.set(anchor[0], level, anchor[1]);
                        building.rotation.y = forwardYaw;
                        batch.add(building);
                        box(batch, anchor[0], (low + level) / 2 - .02, anchor[1], 2.4, Math.max(.06, level - low + .04), 5, 0x918c7d, forwardYaw);
                        waitingRoom = anchor;
                        occupied.push(anchor);
                        placements.push({ id: `${platform.id}/waiting-room`, family: 'platform-waiting-room', position: [anchor[0], level, anchor[1]], supportY: platformSurfaceY(platform, ...anchor), supportPosition: [anchor[0], platformSurfaceY(platform, ...anchor), anchor[1]], floorY: level, supportRelation: 'rendered levelling plinth', platformId: platform.id, footprint: platform.footprint });
                    }
                }
            }
            const place = (kind, desired, radius) => {
                const point = platformAnchor(platform, desired, radius);
                if (!point || !runningClear(...point, radius) || occupied.some(q => Math.hypot(q[0] - point[0], q[1] - point[1]) < 2.5))
                    return;
                const id = `${station.id}/${platform.id}/${kind}/${hash(`${desired[0].toFixed(2)},${desired[1].toFixed(2)}`)}`, y = platformSurfaceY(platform, ...point), asset = factory.furniture(kind, { id, confidence: 'inferred facility/person location on mapped platform' });
                asset.position.set(point[0], y, point[1]);
                asset.rotation.y = yaw;
                if (kind === 'bench') {
                    const id = platform.railSource.startsWith('adjacent:') ? platform.railSource.slice(9) : '', service = auxiliaries.find(s => s.id === id);
                    let rail;
                    if (service) {
                        const n = service.path.nearest(...point);
                        rail = service.path.sample(n.s).position;
                    }
                    else {
                        const n = route.project(...point, 150), candidates = [route.lanePose(n.s, 0).position, route.lanePose(n.s, 4.2).position];
                        rail = candidates.sort((a, b) => Math.hypot(a[0] - point[0], a[2] - point[1]) - Math.hypot(b[0] - point[0], b[2] - point[1]))[0];
                    }
                    asset.rotation.y = benchYaw(platform.axis, point, [rail[0], rail[2]]);
                }
                let walking = false;
                if ((kind === 'person' || kind === 'staff') && hash(id) % 3 === 0) {
                    const goal = platformAnchor(platform, [point[0] + platform.axis[0] * 5, point[1] + platform.axis[1] * 5], radius);
                    if (goal && Math.hypot(goal[0] - point[0], goal[1] - point[1]) > 2) {
                        const points = [];
                        let valid = true;
                        for (let i = 0; i <= 12; i++) {
                            const x = point[0] + (goal[0] - point[0]) * i / 12, z = point[1] + (goal[1] - point[1]) * i / 12;
                            if (!platformContains(platform, x, z) || derivedPlatformEdgeDistance(platform, x, z) < radius || !runningClear(x, z, radius)) {
                                valid = false;
                                break;
                            }
                            points.push([x, platformSurfaceY(platform, x, z), z]);
                        }
                        if (valid) {
                            pedestrianPaths.push({ id, platformId: platform.id, points, role: kind === 'staff' ? 'staff' : 'passenger', speed: kind === 'staff' ? .8 : .65 });
                            walking = true;
                        }
                    }
                }
                if (!walking)
                    batch.add(asset);
                occupied.push(point);
                placements.push({ id, family: `platform-${kind}`, position: [point[0], y, point[1]], supportY: y, platformId: platform.id, footprint: platform.footprint, clearanceRadius: radius, inferred: true, walking });
                checks.platformFurniture++;
                return point;
            };
            let canopyCount = 0;
            for (let t = lo + 10; t < hi - 8; t += 20) {
                const desired = [platform.centre[0] + platform.axis[0] * t, platform.centre[1] + platform.axis[1] * t];
                if (Math.round(t / 20) % 2 === 0)
                    place(hash(`${platform.id}/${Math.round(t)}`) % 7 === 0 ? 'staff' : 'person', [desired[0] + platform.axis[0] * 5, desired[1] + platform.axis[1] * 5], .35);
                if (Math.abs(t) > 35) {
                    place('lamp', desired, .35);
                    if (Math.round(t / 20) % 2 === 0)
                        place('bench', [desired[0] + platform.axis[0] * 3, desired[1] + platform.axis[1] * 3], 1.05);
                    continue;
                }
                const anchor = platformAnchor(platform, desired, 1.1);
                if (!anchor || !runningClear(...anchor, 1.1))
                    continue;
                if (waitingRoom && Math.hypot(anchor[0] - waitingRoom[0], anchor[1] - waitingRoom[1]) < 8)
                    continue;
                const width = clamp(derivedPlatformEdgeDistance(platform, ...anchor) * 2 - .4, 1.8, 4.2), halfL = 3.5, right = [-platform.axis[1], platform.axis[0]];
                const corners = [];
                for (const sx of [-1, 1])
                    for (const sz of [-1, 1])
                        corners.push([anchor[0] + right[0] * sx * (width / 2 - .35) + platform.axis[0] * sz * halfL, anchor[1] + right[1] * sx * (width / 2 - .35) + platform.axis[1] * sz * halfL]);
                if (!corners.every(q => platformContains(platform, ...q) && derivedPlatformEdgeDistance(platform, ...q) > .2 && runningClear(...q, .2)))
                    continue;
                const roofY = platformSurfaceY(platform, ...anchor) + 3.3;
                box(batch, anchor[0], roofY, anchor[1], width, .20, 8, historic ? 0x5d5352 : 0x66736d, forwardYaw);
                box(batch, anchor[0], roofY - .12, anchor[1], width, .06, 8, 0xc3c1ad, forwardYaw);
                for (const q of corners) {
                    const base = platformSurfaceY(platform, ...q);
                    box(batch, q[0], (base + roofY - .1) / 2, q[1], .1, roofY - .1 - base, .1, historic ? 0x635776 : 0x64776c);
                    placements.push({ id: `${platform.id}/canopy/${canopyCount}/${q[0].toFixed(3)},${q[1].toFixed(3)}`, family: 'platform-canopy-support', position: [q[0], base, q[1]], supportY: base, platformId: platform.id, clearanceRadius: .15, footprint: platform.footprint });
                }
                box(batch, anchor[0], roofY - .20, anchor[1], .35, .06, 1.3, 0xe3dfc8, forwardYaw);
                canopyCount++;
            }
            const nameAnchor = platformAnchor(platform, platform.centre, .4);
            if (nameAnchor && runningClear(...nameAnchor, .4)) {
                const w = Math.min(5.8, Math.max(2.5, station.name.length * .16)), y = platformSurfaceY(platform, ...nameAnchor), posts = [-.42, .42].map(t => [nameAnchor[0] + platform.axis[0] * w * t, nameAnchor[1] + platform.axis[1] * w * t]);
                if (posts.every(q => platformContains(platform, ...q) && derivedPlatformEdgeDistance(platform, ...q) > .2 && runningClear(...q, .2))) {
                    box(batch, nameAnchor[0], y + 1.85, nameAnchor[1], w, .6, .1, historic ? 0x635776 : 0x3b6652, yaw);
                    for (const q of posts) {
                        const base = platformSurfaceY(platform, ...q);
                        box(batch, q[0], (base + y + 1.85) / 2, q[1], .06, y + 1.85 - base, .06, 0x6d7771);
                    }
                    for (const side of [-1, 1]) {
                        const text = geometricText(station.name, Math.min(.24, w / (station.name.length * .92)), 0xe9e8dc);
                        text.position.set(nameAnchor[0] + Math.sin(yaw) * side * .06, y + 1.70, nameAnchor[1] + Math.cos(yaw) * side * .06);
                        text.rotation.y = yaw + (side < 0 ? Math.PI : 0);
                        batch.add(text);
                    }
                }
            }
        }
        if (station.id === 'BSW') {
            const all = platforms.flatMap(p => p.footprint), near = all.map(p => route.project(...p, 350)), minS = Math.min(...near.map(n => n.s)), maxS = Math.max(...near.map(n => n.s)), minSide = Math.min(...near.map(n => n.side)), maxSide = Math.max(...near.map(n => n.side));
            const q = route.sample((minS + maxS) / 2, (minSide + maxSide) / 2);
            box(batch, q.position[0], q.position[1] + 8.3, q.position[2], maxSide - minSide + 6, 1.2, maxS - minS + 8, 0x777e79, q.yaw);
        }
        placements.push({ id: station.id, family: 'station', position: stationPose.position, supportY: stationPose.position[1], layout: 'mapped platform footprints', platformIds: platforms.map(p => p.id) });
    };
    for (const station of [...route.stations, ...(route.data.extraStations || [])]) {
        const extra = Boolean(route.data.extraStations?.some(s => s.id === station.id));
        const pose = extra ? { ...route.sample(0), position: station.position } : route.sample(station.s, centre(station.s));
        if (!inside(pose.position[0], pose.position[2], bounds))
            continue;
        const mapped = allPlatforms.filter(p => p.station === station.id && p.triangles.length);
        if (mapped.length) {
            composeMappedStation(station, mapped);
            continue;
        }
        if (extra)
            continue;
        const mappedAccess = accessSites.some(a => a.station === station.id) || route.data.structures.some(s => s.type === 'footbridge' && Math.hypot(s.position[0] - pose.position[0], s.position[2] - pose.position[2]) < station.length * .65 && route.project(s.position[0], s.position[2]).distance < 25);
        const spacing = Math.abs(route.laneOffset(station.s, 4.2)), group = factory.station({ ...station, seed: hash(station.id), footbridge: !mappedAccess, trackSpacing: spacing, ...(accessSites.some(a => a.station === station.id) ? { canopyLength: 50, canopyCentre: 10 } : {}) });
        for (const child of [...group.children]) {
            const platform = child.userData.trackPlatform;
            if (platform) {
                group.remove(child);
                const lane = platform.x < 0 ? (route.laneOffset(station.s, 4.2) < 0 ? 4.2 : 0) : (route.laneOffset(station.s, 4.2) < 0 ? 0 : 4.2), edge = platform.x < 0 ? platform.x + platform.width / 2 : platform.x - platform.width / 2;
                const topPoint = (s, offset, lift = 0) => { const side = platform.x < 0 ? -1 : 1, physical = route.laneOffset(s, lane) + side * (Math.abs(offset) - spacing / 2), q = route.sample(s, physical).position; return [q[0], route.lanePose(s, lane).position[1] + .915 + lift, q[2]]; };
                const start = station.s - platform.length / 2, end = station.s + platform.length / 2;
                for (let s = start; s < end; s += 6) {
                    const e = Math.min(end, s + 6), a = topPoint(s, platform.x - platform.width / 2), b = topPoint(s, platform.x + platform.width / 2), c = topPoint(e, platform.x + platform.width / 2), d = topPoint(e, platform.x - platform.width / 2);
                    topQuad(batch, a, d, c, b, new THREE.Color(0x666c67));
                    for (const pair of [[a, d], [b, c]]) {
                        const [u, v] = pair;
                        quad(batch, u, v, p(v[0], ground(v[0], v[2]) - .08, v[2]), p(u[0], ground(u[0], u[2]) - .08, u[2]), platform.heritage ? palette.brick : palette.pavement);
                    }
                    const inward = platform.x < 0 ? -1 : 1;
                    for (const [off, w, lift, color] of [[0, .34, .02, palette.pavement], [inward * .46, .10, .026, new THREE.Color(0xe8ce55)], [inward * .7, .24, .021, new THREE.Color(0xbab399)]]) {
                        const x = edge + off;
                        topQuad(batch, topPoint(s, x - w / 2, lift), topPoint(e, x - w / 2, lift), topPoint(e, x + w / 2, lift), topPoint(s, x + w / 2, lift), color);
                    }
                }
                for (const ss of [start, end]) {
                    const a = topPoint(ss, platform.x - platform.width / 2), b = topPoint(ss, platform.x + platform.width / 2);
                    quad(batch, a, b, p(b[0], ground(b[0], b[2]) - .08, b[2]), p(a[0], ground(a[0], a[2]) - .08, a[2]), platform.heritage ? palette.brick : palette.pavement);
                }
                for (const [ss, sign] of [[start, -1], [end, 1]]) {
                    const a = topPoint(ss, platform.x - platform.width / 2), b = topPoint(ss, platform.x + platform.width / 2), q1 = topPoint(ss + sign * 6, platform.x - platform.width / 2), q2 = topPoint(ss + sign * 6, platform.x + platform.width / 2);
                    const c = p(q2[0], ground(q2[0], q2[2]) + .025, q2[2]), d = p(q1[0], ground(q1[0], q1[2]) + .025, q1[2]);
                    topQuad(batch, a, d, c, b, palette.pavement);
                }
                continue;
            }
            // Long canopy strips must follow the same curved platform as the
            // rails and posts; a single straight chord can cross a running line.
            if (child.userData.followPlatform) {
                const local = child.position.clone(), length = child.scale.z, count = Math.max(1, Math.ceil(length / 4)), segment = length / count;
                for (let i = 0; i < count; i++) {
                    const z = local.z - length / 2 + (i + .5) * segment, s = station.s - z, q = route.sample(s, centre(s) + local.x), part = child.clone();
                    part.position.set(q.position[0], q.position[1] + local.y, q.position[2]);
                    part.scale.z = segment + .025;
                    part.quaternion.premultiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), q.yaw));
                    batch.add(part);
                }
                group.remove(child);
                continue;
            }
            // Furniture/support centres follow local rail levels; building groups stay
            // upright on a complete plinth instead of bending their wall geometry.
            const local = child.position.clone(), q = route.sample(station.s - local.z, centre(station.s - local.z) + local.x);
            child.position.set(q.position[0], q.position[1] + local.y, q.position[2]);
            const worldYaw = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), q.yaw);
            child.quaternion.premultiply(worldYaw);
            if (child.userData.family === 'building') {
                const bb = child.userData.bounds, w = bb.max[0] - bb.min[0], d = bb.max[2] - bb.min[2];
                const corners = [[-w / 2, -d / 2], [w / 2, -d / 2], [-w / 2, d / 2], [w / 2, d / 2]].map(([x, z]) => [child.position.x + Math.cos(q.yaw) * x + Math.sin(q.yaw) * z, child.position.z - Math.sin(q.yaw) * x + Math.cos(q.yaw) * z]);
                const bottom = Math.min(...corners.map(v => ground(v[0], v[1]))) - .08, top = child.position.y;
                box(batch, child.position.x, (bottom + top) / 2, child.position.z, w, top - bottom, d, 0x918c7d, q.yaw);
            }
            // Children now contain absolute world positions; bake individually.
            group.remove(child);
            batch.add(child);
        }
        placements.push({ id: station.id, family: 'station', position: pose.position, supportY: pose.position[1] });
    }
    // Continuous curved tunnel lining. Only the actual portals get thick end rings.
    for (const tunnel of route.data.tunnels || []) {
        const start = route.sourceS(tunnel.start), end = route.sourceS(tunnel.end), radius = (tunnel.width ?? 9) / 2, cy = (tunnel.clearHeight ?? 5.8) - radius;
        for (let s = start; s < end; s += 8) {
            const e = Math.min(end, s + 8), pose = route.sample((s + e) / 2, centre((s + e) / 2));
            if (!inside(pose.position[0], pose.position[2], bounds))
                continue;
            const ringPoint = (ss, theta, outer) => { const r = radius + (outer ? .55 : 0), q = route.sample(ss, centre(ss) + Math.cos(theta) * r); return [q.position[0], q.position[1] + cy + Math.sin(theta) * r, q.position[2]]; };
            for (let i = 0; i < 10; i++) {
                const a = i * Math.PI / 10, b = (i + 1) * Math.PI / 10;
                quad(batch, ringPoint(s, b, false), ringPoint(e, b, false), ringPoint(e, a, false), ringPoint(s, a, false), palette.tunnel);
                quad(batch, ringPoint(s, a, true), ringPoint(e, a, true), ringPoint(e, b, true), ringPoint(s, b, true), palette.earth);
                if (s === start)
                    quad(batch, ringPoint(s, a, false), ringPoint(s, b, false), ringPoint(s, b, true), ringPoint(s, a, true), palette.brick);
                if (e === end)
                    quad(batch, ringPoint(e, a, false), ringPoint(e, a, true), ringPoint(e, b, true), ringPoint(e, b, false), palette.brick);
            }
            for (const side of [-1, 1]) {
                const a = route.sample(s, centre(s) + side * radius).position, b = route.sample(e, centre(e) + side * radius).position;
                if (side < 0)
                    quad(batch, p(a[0], a[1] - .55, a[2]), p(b[0], b[1] - .55, b[2]), p(b[0], b[1] + cy, b[2]), p(a[0], a[1] + cy, a[2]), palette.tunnel);
                else
                    quad(batch, p(a[0], a[1] + cy, a[2]), p(b[0], b[1] + cy, b[2]), p(b[0], b[1] - .55, b[2]), p(a[0], a[1] - .55, a[2]), palette.tunnel);
            }
        }
        for (const ss of [start, end]) {
            const pose = route.sample(ss, centre(ss));
            if (!inside(pose.position[0], pose.position[2], bounds))
                continue;
            const collar = factory.tunnel({ id: `${tunnel.id}/portal/${ss}`, width: tunnel.width ?? 9, height: tunnel.clearHeight ?? 5.8, length: 1.8 });
            collar.position.set(...pose.position);
            collar.rotation.y = pose.yaw;
            batch.add(collar);
            placements.push({ id: `${tunnel.id}/portal/${ss}`, family: 'tunnel-portal', position: pose.position, supportY: ground(pose.position[0], pose.position[2]) });
        }
    }
    for (const service of auxiliaries) {
        if (service.metadata?.renderStatic === false)
            continue;
        const path = service.path;
        if (!service.metadata?.sharedCivil && !(route.data.civils || []).some(c => c.id === service.id) && (service.metadata?.bridge || service.metadata?.tunnel) && inside(path.sample(path.length / 2).position[0], path.sample(path.length / 2).position[2], bounds)) {
            const civil = makeRailCivil(service, ground);
            batch.add(civil);
            placements.push({ id: service.id + '/civil', family: service.metadata.tunnel ? 'tunnel' : 'rail-bridge', position: path.sample(path.length / 2).position, source: service.source });
        }
        const frame = (ss) => {
            const q = path.sample(ss), t = clamp(ss / 25, 0, 1), right = service.metadata?.endpointRight;
            if (right) {
                const x = right[0] * (1 - t) + q.right[0] * t, z = right[2] * (1 - t) + q.right[2] * t, len = Math.hypot(x, z) || 1;
                q.right = [x / len, 0, z / len];
                q.bank = Number(service.metadata.endpointBank) * (1 - t) + q.bank * t;
            }
            return q;
        };
        const baseSurface = new CookedSoil(), baseCuts = [-1, ...path.lengths, path.length + 1];
        for (let i = 1; i < baseCuts.length; i++) {
            const a = path.sample(baseCuts[i - 1], -3).position, b = path.sample(baseCuts[i - 1], 3).position, c = path.sample(baseCuts[i], 3).position, d = path.sample(baseCuts[i], -3).position;
            for (const q of [a, b, c, d])
                q[1] -= .54;
            baseSurface.add(a, b, c);
            baseSurface.add(a, c, d);
        }
        const bedSection = (s) => {
            const q = frame(s), neighbours = [], nearest = new Map(), near = route.project(q.position[0], q.position[2], 30);
            if (Number.isFinite(near.distance))
                for (const lane of runningLanes)
                    neighbours.push(route.lanePose(near.s, lane).position);
            for (const entry of auxNear(q.position[0], q.position[2], 5)) {
                if (entry.service.id === service.id || entry.service.metadata?.renderStatic === false)
                    continue;
                const a = entry.service.path.points[entry.index], b = entry.service.path.points[entry.index + 1], hit = segmentDistance(q.position[0], q.position[2], a, b), old = nearest.get(entry.service.id);
                if (!old || hit.distance < old.distance)
                    nearest.set(entry.service.id, { distance: hit.distance, point: a.map((v, j) => v + (b[j] - v) * hit.t) });
            }
            for (const other of nearest.values())
                neighbours.push(other.point);
            return ballastSection(q, (x, z) => baseSurface.height(x, z) ?? q.position[1] - .54, neighbours);
        };
        const strip = (s, e, offset, width, top, depth, color, closed = false) => {
            const get = (ss, o, y) => { const q = frame(ss), right = gaugeRight(q), up = closed ? sectionUp(q) : [0, 1, 0]; return q.position.map((v, i) => v + right[i] * o + up[i] * y); };
            const a = get(s, offset - width / 2, top), b = get(s, offset + width / 2, top), c = get(e, offset + width / 2, top), d = get(e, offset - width / 2, top);
            topQuad(batch, a, b, c, d, color);
            if (depth) {
                const aa = get(s, offset - width / 2, top - depth), bb = get(s, offset + width / 2, top - depth), cc = get(e, offset + width / 2, top - depth), dd = get(e, offset - width / 2, top - depth);
                quad(batch, a, d, dd, aa, color);
                quad(batch, bb, cc, c, b, color);
            }
            if (closed)
                quad(batch, get(s, offset - width / 2, top - depth), get(e, offset - width / 2, top - depth), get(e, offset + width / 2, top - depth), get(s, offset + width / 2, top - depth), color);
        };
        for (let s = 0; s < path.length; s += 4) {
            const e = Math.min(path.length, s + 4), pose = path.sample((s + e) / 2);
            if (!inside(pose.position[0], pose.position[2], bounds))
                continue;
            for (let ss = s; ss < e; ss += 2)
                ballastSpan(batch, bedSection(ss), bedSection(Math.min(e, ss + 2)), palette.ballast);
            for (const rail of [-.755, .755])
                for (const [width, top, depth] of [[.075, 0, .045], [.025, -.045, .07], [.14, -.115, .025]])
                    strip(s, e, rail, width, top, depth, palette.rail, true);
            for (let index = Math.ceil((s - 1e-8) / .68); index * .68 < e - 1e-8; index++) {
                const sleeper = index * .68, q = frame(sleeper);
                if (service.metadata?.contextOnly && sleeper < .13)
                    continue;
                trackBox(batch, q, -.215, 2.65, .15, .24, 0x675f50, `${service.id}/sleeper/${index}`);
            }
            if (service.overhead && !service.metadata?.tunnel) {
                const a = path.sample(s).position, b = path.sample(e).position;
                for (const rise of [5.5, 5.9]) {
                    const u = new THREE.Vector3(a[0], a[1] + rise, a[2]), v = new THREE.Vector3(b[0], b[1] + rise, b[2]), wire = new THREE.Mesh(sharedBox, material(0x4c5554));
                    wire.position.copy(u).add(v).multiplyScalar(.5);
                    wire.scale.set(.027, u.distanceTo(v), .027);
                    wire.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), v.clone().sub(u).normalize());
                    batch.add(wire);
                }
                box(batch, pose.position[0], pose.position[1] + 5.7, pose.position[2], .018, .4, .018, 0x4c5554);
                if (Math.round(s) % 40 === 0) {
                    const offset = [3.1, -3.1, 5.8, -5.8].find(o => { const p = path.sample(s, o).position; return runningClear(p[0], p[2], .3); });
                    if (offset === undefined)
                        continue;
                    const q = path.sample(s, offset), base = ground(q.position[0], q.position[2]), top = q.position[1] + 5.9;
                    box(batch, q.position[0], (base + top) / 2, q.position[2], .13, top - base, .13, 0x717d78);
                    const arm = path.sample(s, offset / 2);
                    box(batch, arm.position[0], arm.position[1] + 5.65, arm.position[2], Math.abs(offset) + .3, .10, .10, 0x6b7670, arm.yaw);
                }
            }
        }
        if (service.metadata?.contextOnly && inside(path.points[0][0], path.points[0][2], bounds))
            placements.push({ id: service.id, family: 'non-playable-source-track-context', position: path.points[0], supportY: ground(path.points[0][0], path.points[0][2]), ...service.metadata, source: service.source });
        if (service.metadata?.crossingUnderMain) {
            const s = route.sourceS(Number(service.metadata.mainlineS)), pose = route.sample(s, centre(s));
            if (inside(pose.position[0], pose.position[2], bounds)) {
                const width = formationWidth(s), span = 24;
                box(batch, pose.position[0], pose.position[1] - .75, pose.position[2], width, .40, span, 0x9a9e93, pose.yaw);
                for (const side of [-1, 1]) {
                    const q = route.sample(s + side * (span / 2 - .65), centre(s + side * (span / 2 - .65))), bottom = ground(q.position[0], q.position[2]);
                    box(batch, q.position[0], (bottom + pose.position[1] - .95) / 2, q.position[2], width, Math.max(.2, pose.position[1] - .95 - bottom), 1.3, 0x9a9e93, q.yaw);
                    const parapet = route.sample(s, centre(s) + side * (width / 2 - .12));
                    box(batch, parapet.position[0], pose.position[1] + .2, parapet.position[2], .24, .9, span, 0x8c9a90, pose.yaw);
                }
                placements.push({ id: `${service.id}/upper-bridge`, family: 'adjacent-network-bridge', position: pose.position, supportY: ground(pose.position[0], pose.position[2]), source: service.source, confidence: 'source crossing geometry; clearance-based engineered deck' });
            }
        }
    }
    for(const stop of route.data.bufferStops||[]){
        const q=stop.position;if(!inside(q[0],q[2],bounds))continue;
        const asset=resolveAsset(stop.asset);if(!asset||asset.generator!=='furniture')continue;
        const buffer=factory.furniture(asset.kind,{id:stop.id});buffer.position.set(...q);buffer.rotation.y=stop.yaw;batch.add(buffer);
        for(const side of [-.755,.755])box(batch,q[0]+Math.cos(stop.yaw)*side,q[1]-.07,q[2]-Math.sin(stop.yaw)*side,.14,.14,.025,0xa2aaa5,stop.yaw);
        placements.push({id:stop.id,family:'mapped-buffer-stop',position:q,asset:stop.asset,track:stop.track,node:stop.node,source:stop.source,confidence:stop.confidence});
    }
    const troughReject = (s, rule, owner) => { const q = route.sample(s, troughOffset(s)); placements.push({ id: `trough/${s.toFixed(3)}`, family: 'unsupported-source-attachment', assetFamily: 'cable-trough', position: q.position, rule, supportOwner: owner ?? null, confidence: 'inferred cable route; no unsupported span or posts generated' }); };
    const troughPoint = (s, offset) => { const point = route.sample(s, troughOffset(s)).position, a = route.sample(Math.max(0, s - .05), troughOffset(Math.max(0, s - .05))).position, b = route.sample(Math.min(route.length, s + .05), troughOffset(Math.min(route.length, s + .05))).position, dx = b[0] - a[0], dz = b[2] - a[2], length = Math.hypot(dx, dz) || 1; return [point[0] - dz / length * offset, point[2] + dx / length * offset]; };
    const emitTrough = (s) => {
        const start = Math.max(0, s - 3.975), end = Math.min(route.length, s + 3.975), id = `trough/${s.toFixed(3)}`;
        if ((route.data.tunnels || []).some(t => start < route.sourceS(t.end) + .5 && end > route.sourceS(t.start) - .5)) {
            troughReject(s, 'tunnel/portal span requires an authored lining bracket or duct owner');
            return;
        }
        const pieces = [];
        for (let a = start; a < end - 1e-6; a += .8) {
            const b = Math.min(end, a + .8), footprint = [troughPoint(a, -.20), troughPoint(a, .20), troughPoint(b, .20), troughPoint(b, -.20)], lidFootprint = [troughPoint(a + .012, -.21), troughPoint(a + .012, .21), troughPoint(Math.max(a + .012, b - .012), .21), troughPoint(Math.max(a + .012, b - .012), -.21)], area = Math.abs(footprint.reduce((n, p, i) => { const q = footprint[(i + 1) % footprint.length]; return n + p[0] * q[1] - q[0] * p[1]; }, 0)) / 2, centre = troughPoint((a + b) / 2, 0), railY = route.sample((a + b) / 2).position[1];
            if (localPlatforms.some(p => polygonsOverlap(footprint, p.footprint))) {
                troughReject(s, 'mapped platform requires an authored service attachment');
                return;
            }
            let owner = `ground/${Math.floor(centre[0] / 1000)}_${Math.floor(centre[1] / 1000)}`, support = soil;
            for (const deck of attachmentDecks) {
                const patch = deck.field.conform(footprint), covered = patch.reduce((n, p) => n + polygonArea(p), 0), y = deck.field.height(...centre);
                if (y !== undefined && y > railY - 1.2 && y < railY + .5 && covered >= area - .0003) {
                    owner = deck.id;
                    support = deck.field;
                    break;
                }
            }
            if (support === soil) {
                const roadGap = roadLookup(centre[0], centre[1], 6).some(({ road, i }) => { const hit = segmentDistance(centre[0], centre[1], road.points[i], road.points[i + 1]); if (hit.distance > road.width / 2 + 1.5)
                    return false; const y = road.points[i][1] + hit.t * (road.points[i + 1][1] - road.points[i][1]); return y < railY + 1.0; });
                const opening = lowerOpenings.some(o => o.path.nearest(...centre).distance < o.width / 2 + 1.1), waterGap = water.some(w => polygonsOverlap(footprint, w.footprint));
                if (roadGap || opening || waterGap) {
                    troughReject(s, 'road/water/underpass opening has no confirmed full-width deck or bracket owner');
                    return;
                }
                const bridgeGap = route.data.structures.some(c => { if (c.type !== 'railBridge' || !c.points?.length)
                    return false; const path = new Polyline(c.points), near = path.nearest(...centre); return near.distance < (Number(c.width) || 8) / 2 + 1 && near.s > -.1 && near.s < path.length + .1 && Math.abs(c.position[1] - railY) < 2; });
                if (bridgeGap) {
                    troughReject(s, 'rail-bridge span has no confirmed full-width trough support owner');
                    return;
                }
            }
            const body = support.conform(footprint), lid = support.conform(lidFootprint), lidArea = Math.abs(lidFootprint.reduce((n, p, i) => { const q = lidFootprint[(i + 1) % lidFootprint.length]; return n + p[0] * q[1] - q[0] * p[1]; }, 0)) / 2;
            if (body.reduce((n, p) => n + polygonArea(p), 0) < area - .0003 || lid.reduce((n, p) => n + polygonArea(p), 0) < lidArea - .0003) {
                troughReject(s, 'complete cooked support footprint is unavailable', owner);
                return;
            }
            const heights = footprint.map(p => support.height(p[0], p[1]));
            if (heights.some(y => y === undefined)) {
                troughReject(s, 'support boundary is unresolved', owner);
                return;
            }
            const span = Math.hypot(footprint[0][0] - footprint[3][0], footprint[0][1] - footprint[3][1]), longitudinal = Math.max(Math.abs(heights[0] - heights[3]), Math.abs(heights[1] - heights[2])) / Math.max(.01, span), crossfall = Math.max(Math.abs(heights[0] - heights[1]), Math.abs(heights[3] - heights[2])) / .4;
            if (longitudinal > .12 || crossfall > .15) {
                troughReject(s, 'support slope exceeds12% longitudinal/15% crossfall; attachment requires authoring', owner);
                return;
            }
            pieces.push({ body, lid, owner });
        }
        if (!pieces.length)
            return;
        const owners = new Set(pieces.map(p => p.owner.startsWith('ground/') ? 'cooked-ground' : p.owner));
        if (owners.size > 1) {
            troughReject(s, 'support-owner transition needs an authored joint or bracket');
            return;
        }
        for (const piece of pieces) {
            followingSolid(batch, piece.body, 0, .14, new THREE.Color(0x96998f));
            followingSolid(batch, piece.lid, .14, .18, new THREE.Color(0xb9bcb1));
        }
        const q = troughPoint(s, 0), owner = [...owners][0], provider = owner === 'cooked-ground' ? soil : attachmentDecks.find(d => d.id === owner).field, y = provider.height(q[0], q[1]) ?? route.sample(s).position[1] - .56;
        placements.push({ id, family: 'cable-trough', position: [q[0], y, q[1]], supportOwner: owner, supportOwners: [...new Set(pieces.map(p => p.owner))], supportKind: owner === 'cooked-ground' ? 'ground' : 'bridge-deck', sectionLength: .8, bodyHeight: .14, lidThickness: .04, confidence: 'inferred placement; complete conforming body/lids with no unsupported span' });
    };
    // Route-side boundaries and services share endpoint ground/formation samples.
    // Road gaps and station access are preserved rather than fenced across.
    for (let s = Math.max(0, Math.floor((minS - 1800) / 8) * 8); s < Math.min(route.length, minS + 1800); s += 8) {
        const trackPose = route.sample(s);
        if (!inside(trackPose.position[0], trackPose.position[2], bounds))
            continue;
        if (route.tunnelAt(s)) {
            troughReject(s, 'tunnel span requires an authored lining bracket or duct owner');
            continue;
        }
        const nearStation = route.stations.some(st => Math.abs(st.s - s) < st.length / 2 + 16);
        for (const side of [-1, 1]) {
            if (nearStation)
                continue;
            const offset = centre(s) + side * (formationWidth(s) / 2 + 3.5), a = route.sample(s, offset).position, b = route.sample(s + 8, centre(s + 8) + side * (formationWidth(s + 8) / 2 + 3.5)).position;
            if (!runningClear(a[0], a[2], .15) || !runningClear(b[0], b[2], .15))
                continue;
            if (roadLookup(a[0], a[2], 4).some(({ road, i }) => segmentDistance(a[0], a[2], road.points[i], road.points[i + 1]).distance < road.width / 2 + 3))
                continue;
            const ya = ground(a[0], a[2]), yb = ground(b[0], b[2]);
            box(batch, a[0], ya + .85, a[2], .075, 1.7, .075, 0x66766a);
            for (const rise of [.35, 1.0, 1.58]) {
                const p1 = new THREE.Vector3(a[0], ya + rise, a[2]), p2 = new THREE.Vector3(b[0], yb + rise, b[2]), rail = new THREE.Mesh(sharedBox, material(0x728374));
                rail.position.copy(p1).add(p2).multiplyScalar(.5);
                rail.scale.set(.04, p1.distanceTo(p2), .04);
                rail.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), p2.clone().sub(p1).normalize());
                batch.add(rail);
            }
        }
        const troughPose = route.sample(s, troughOffset(s));
        if (runningClear(troughPose.position[0], troughPose.position[2], .25))
            emitTrough(s);
        else
            troughReject(s, 'running-line clearance requires an authored alternative route');
        if (Math.round(s) % 248 === 0) {
            const q = route.sample(s, 12), y = ground(q.position[0], q.position[2]);
            if (runningClear(q.position[0], q.position[2], .8) && !roadLookup(q.position[0], q.position[2], 3).some(({ road, i }) => segmentDistance(q.position[0], q.position[2], road.points[i], road.points[i + 1]).distance < road.width / 2 + 2)) {
                const cabinet = factory.furniture('cabinet', { id: `cabinet/${Math.round(s)}` });
                cabinet.position.set(q.position[0], y, q.position[2]);
                cabinet.rotation.y = q.yaw;
                batch.add(cabinet);
                placements.push({ id: `cabinet/${Math.round(s)}`, family: 'cabinet', position: [q.position[0], y, q.position[2]], supportY: y });
            }
        }
    }
    for (const w of water.filter(w => w.owned)) {
        const shape = new THREE.Shape();
        shape.moveTo(w.footprint[0][0], -w.footprint[0][1]);
        for (const q of w.footprint.slice(1))
            shape.lineTo(q[0], -q[1]);
        shape.closePath();
        const geo = new THREE.ShapeGeometry(shape);
        geo.rotateX(-Math.PI / 2);
        const m = new THREE.Mesh(geo, material(0x6d8e95));
        m.position.y = w.level;
        batch.add(m);
        geo.dispose();
    }
    progress?.(.9);
    const footprints = [];
    for (let buildingIndex=0;buildingIndex<tile.buildings.length;buildingIndex++) {
        const building=tile.buildings[buildingIndex];
        if ((buildingIndex & 15) === 0) progress?.(.9 + .08 * buildingIndex / Math.max(1,tile.buildings.length));
        if ([...(route.data.landmarks || []), ...(route.data.civils || [])].some(a => typeof a.source === 'string' && a.source.endsWith('/' + building.id.replace(/^way\//, ''))))
            continue;
        const fp = building.footprint;
        if (!fp || fp.length < 3)
            continue;
        const cx = fp.reduce((s, q) => s + q[0], 0) / fp.length, cz = fp.reduce((s, q) => s + q[1], 0) / fp.length, near = route.project(cx, cz, 600);
        if (near.distance > 570)
            continue;
        const relief = soil.footprintRange(fp);
        if (!relief) {
            checks.rejectedBuildings++;
            checks.uncoveredBuildingSupports++;
            continue;
        }
        const appearance = classifyBuilding(building), base = relief.high + .02, low = relief.low, height = appearance.wallHeight;
        const overlapsLevel = y => base < y + 5 && base + height + appearance.roofRise > y - .6;
        const railInFootprint = [0, 4.2].some(lane => { const q = route.lanePose(near.s, lane).position; return overlapsLevel(q[1]) && (pointInPolygon(q[0], q[2], fp) || fp.some(p=>Math.hypot(p[0]-q[0],p[1]-q[2])<2.05)); });
        const auxiliaryConflict = fp.some(q => auxNear(q[0],q[1],4).some(e=>{const a=e.service.path.points[e.index],b=e.service.path.points[e.index+1],hit=segmentDistance(q[0],q[1],a,b);return hit.distance<3&&overlapsLevel(a[1]+(b[1]-a[1])*hit.t);}));
        if(railInFootprint||auxiliaryConflict){checks.rejectedBuildings++;continue;}
        const radius=Math.min(150,Math.max(...fp.map(q=>Math.hypot(q[0]-cx,q[1]-cz)))+2),roadConflict=roadLookup(cx,cz,radius).some(({road,i})=>{
            if(!['motorway','trunk','primary','secondary','tertiary','unclassified','residential','living_street'].includes(road.kind))return false;
            const a=road.points[i],b=road.points[i+1],dx=b[0]-a[0],dz=b[2]-a[2],n=Math.max(1,Math.ceil(Math.hypot(dx,dz)/3));
            for(let j=0;j<=n;j++){const t=j/n,x=a[0]+dx*t,z=a[2]+dz*t,y=a[1]+(b[1]-a[1])*t;if(y>=base-.2&&y<base+height&&pointInPolygon(x,z,fp))return true;}return false;
        });
        if(roadConflict){checks.rejectedBuildings++;continue;}
        let foundationStyle = 'level plinth', foundationDetail = {};
        if (base - low > 5) {
            let perimeter = 0, exposedArea = 0, maxExposure = 0;
            for (let i = 0; i < fp.length; i++) {
                const a = fp[i], b = fp[(i + 1) % fp.length], len = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.max(1, Math.ceil(len));
                perimeter += len;
                for (let k = 0; k < n; k++) {
                    const t = (k + .5) / n, y = soil.height(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t);
                    if (y !== undefined) {
                        const h = Math.max(0, base - y);
                        exposedArea += h * len / n;
                        maxExposure = Math.max(maxExposure, h);
                    }
                }
            }
            const blockedRoads = [], bb = [Math.min(...fp.map(q => q[0])), Math.min(...fp.map(q => q[1])), Math.max(...fp.map(q => q[0])), Math.max(...fp.map(q => q[1]))];
            for (const road of supportRoads) {
                if (!road.points.some(q => q[0] >= bb[0] - road.width - 15 && q[0] <= bb[2] + road.width + 15 && q[2] >= bb[1] - road.width - 15 && q[2] <= bb[3] + road.width + 15))
                    continue;
                let lo = Infinity, hi = -Infinity;
                const cuts = roadSpanCuts(road);
                for (let j = 0; j < cuts.length - 1; j++) {
                    const s = cuts[j], e = cuts[j + 1], a = roadPoint(road, s, -road.width / 2), b = roadPoint(road, s, road.width / 2), c = roadPoint(road, e, road.width / 2), d = roadPoint(road, e, -road.width / 2), u = roadPoint(road, s, 0, .035), v = roadPoint(road, e, 0, .035), triangles = [[a, d, v], [a, v, u], [u, v, c], [u, c, b]];
                    if (triangles.some(t => polygonsOverlap(fp, t.map(q => [q[0], q[2]])))) {
                        lo = Math.min(lo, a[1], b[1], c[1], d[1], u[1], v[1]);
                        hi = Math.max(hi, a[1], b[1], c[1], d[1], u[1], v[1]);
                    }
                }
                if (lo < base + .1 && hi > low - .2)
                    blockedRoads.push({ id: road.id, kind: road.kind, minY: lo, maxY: hi });
            }
            const buried = 1 - exposedArea / (perimeter * (base - low)), limit = Math.min(7.5, height * .9, Math.min(bb[2] - bb[0], bb[3] - bb[1]) * .5);
            foundationDetail = { maximumExposedWallHeightBound: base - low, sampledMaximumExposedWallHeight: maxExposure, buriedWallFraction: buried, maximumSupportHeight: limit, planDimensions: [bb[2] - bb[0], bb[3] - bb[1]] };
            if (base - low > limit || buried < .5 || blockedRoads.length) {
                checks.rejectedBuildings++;
                placements.push({ id: building.id, sourceId: building.sourceId ?? building.id, family: 'rejected-building', position: [cx, base, cz], reason: blockedRoads.length ? 'mapped access intersects foundation volume; source levels and passage openings require authoring' : 'retaining foundation exceeds bounded height/dimension/burial limits', foundationRelief: base - low, foundationLow: low, bodyHeight: height, footprint: fp, ...foundationDetail, blockedRoads });
                continue;
            }
            foundationStyle = 'bounded retaining basement';
            checks.retainingFoundations++;
        }
        const seed = hash(building.id), r = random(seed), color = [0x9c6b56, 0xa27d61, 0xbaa58a, 0x877465, 0xb5ada0][seed % 5];
        const shape = new THREE.Shape();
        shape.moveTo(fp[0][0], -fp[0][1]);
        for (const q of fp.slice(1))
            shape.lineTo(q[0], -q[1]);
        shape.closePath();
        const geo = new THREE.ExtrudeGeometry(shape, { depth: height, bevelEnabled: false, steps: 1 });
        geo.rotateX(-Math.PI / 2);
        const body = new THREE.Mesh(geo, material(color));
        body.position.y = base;
        batch.add(body);
        geo.dispose();
        const boreCuts=[];
        for(const tunnel of route.data.tunnels || []){
            const start=route.sourceS(tunnel.start),end=route.sourceS(tunnel.end),from=Math.max(start,near.s-radius-10),to=Math.min(end,near.s+radius+10);
            if(from>=to||near.distance>radius+(tunnel.width||9))continue;
            for(let s=from;s<to;s+=6){
                const a=Math.max(start,s-1),b=Math.min(end,s+7),half=Math.max((Number(tunnel.width)||9)/2+.8,Math.abs(route.laneOffset((a+b)/2,4.2))/2+2.8);
                const leftA=route.sample(a,centre(a)-half).position,rightA=route.sample(a,centre(a)+half).position,leftB=route.sample(b,centre(b)-half).position,rightB=route.sample(b,centre(b)+half).position;
                const polygon=[leftA,rightA,rightB,leftB].map(p=>[p[0],p[2]]),roof=Math.max(leftA[1],rightA[1],leftB[1],rightB[1])+(Number(tunnel.clearHeight)||5.8)+.65;
                if(roof>low-.08&&polygonsOverlap(fp,polygon))boreCuts.push({polygon,roof});
            }
        }
        const relieved=tunnelFoundationFragments(fp,low-.08,base,boreCuts);
        if(relieved){
            for(const fragment of relieved)if(fragment.floor<base-.001)followingSolid(batch,[fragment.points],fragment.floor,base,material(0x8e887c).color);
            foundationStyle='tunnel-relieved plinth';foundationDetail={...foundationDetail,tunnelClearancePieces:boreCuts.length,foundationOriginalLow:low};
        }else{
            const foot = new THREE.ExtrudeGeometry(shape, { depth: base - low + .08, bevelEnabled: false, steps: 1 });
            foot.rotateX(-Math.PI / 2);
            const plinth = new THREE.Mesh(foot, material(0x8e887c));
            plinth.position.y = low - .08;
            batch.add(plinth);
            foot.dispose();
        }
        const corners=fp.filter((q,i)=>i===0||Math.hypot(q[0]-fp[i-1][0],q[1]-fp[i-1][1])>.01);if(corners.length>3&&Math.hypot(corners[0][0]-corners.at(-1)[0],corners[0][1]-corners.at(-1)[1])<.01)corners.pop();
        if(appearance.pitched&&corners.length===4){
            const edge=i=>Math.hypot(corners[i][0]-corners[(i+1)%4][0],corners[i][1]-corners[(i+1)%4][1]);
            const start=edge(0)<=edge(1)?0:1,[a,b,c,d]=Array.from({length:4},(_,i)=>corners[(start+i)%4]);
            const ridgeA=p((a[0]+b[0])/2,base+height+appearance.roofRise,(a[1]+b[1])/2),ridgeB=p((c[0]+d[0])/2,base+height+appearance.roofRise,(c[1]+d[1])/2),roof=new THREE.Color(0x64645d);
            topQuad(batch,p(b[0],base+height,b[1]),p(c[0],base+height,c[1]),ridgeB,ridgeA,roof);topQuad(batch,p(d[0],base+height,d[1]),p(a[0],base+height,a[1]),ridgeA,ridgeB,roof);
            topTriangle(batch,p(a[0],base+height,a[1]),p(b[0],base+height,b[1]),ridgeA,new THREE.Color(color));topTriangle(batch,p(c[0],base+height,c[1]),p(d[0],base+height,d[1]),ridgeB,new THREE.Color(color));
        }else if (appearance.pitched && fp.length <= 6) {
            const apex = p(cx, base + height + Math.min(2.3, Math.sqrt(Math.abs(fp.reduce((a, q, i) => a + q[0] * fp[(i + 1) % fp.length][1] - fp[(i + 1) % fp.length][0] * q[1], 0))) * .12), cz);
            for (let i = 0; i < fp.length; i++) {
                const a = fp[i], b = fp[(i + 1) % fp.length];
                topTriangle(batch, p(a[0], base + height, a[1]), apex, p(b[0], base + height, b[1]), new THREE.Color(0x64645d));
            }
        }
        else {
            const roof = new THREE.ShapeGeometry(shape);
            roof.rotateX(-Math.PI / 2);
            const m = new THREE.Mesh(roof, material(0x646a65));
            m.position.y = base + height + .03;
            batch.add(m);
            roof.dispose();
        }
        if (near.distance < 170) {
            const floors = Math.min(8, appearance.levels);
            let budget = 28;
            for (let i = 0; i < fp.length && budget > 0; i++) {
                const a = fp[i], b = fp[(i + 1) % fp.length], len = Math.hypot(b[0] - a[0], b[1] - a[1]);
                if (len < 2)
                    continue;
                const count = Math.min(8, Math.floor(len / 2.8)), yaw = Math.atan2(b[1] - a[1], b[0] - a[0]);
                for (let k = 0; k < count && budget > 0; k++)
                    for (let f = 0; f < floors && budget > 0; f++) {
                        const t = (k + .5) / count;
                        box(batch, a[0] + (b[0] - a[0]) * t, base + 1.40 + f * 2.7, a[1] + (b[1] - a[1]) * t, 1.1, 1.15, .07, 0x435965, -yaw);
                        budget--;
                    }
            }
            if(appearance.residential){const edges=fp.map((a,i)=>({a,b:fp[(i+1)%fp.length],length:Math.hypot(fp[(i+1)%fp.length][0]-a[0],fp[(i+1)%fp.length][1]-a[1])})).sort((a,b)=>b.length-a.length),e=edges[0];if(e.length>3){const count=appearance.form==='terrace'?Math.max(1,Math.min(8,Math.round(e.length/6))):appearance.form==='semi'?2:1,yaw=-Math.atan2(e.b[1]-e.a[1],e.b[0]-e.a[0]);for(let i=0;i<count;i++){const t=(i+.25)/count;box(batch,e.a[0]+(e.b[0]-e.a[0])*t,base+1,e.a[1]+(e.b[1]-e.a[1])*t,.85,2,.1,0x4b5147,yaw);}}}
            void r;
        }
        footprints.push(fp);
        placements.push({ id: building.id, sourceId: building.sourceId ?? building.id, family: 'building', form:appearance.form,storeys:appearance.levels, position: [cx, base, cz], supportY: base, foundationStyle, foundationRelief: base - low, foundationLow: low, foundationSupport: 'actual owner and canonical neighbour cooked soil', ...foundationDetail });
        checks.buildings++;
    }
    const rand = random(hash(tile.id));
    for (let i = 0; i < 480; i++) {
        const x = bounds[0] + rand() * (bounds[2] - bounds[0]), z = bounds[1] + rand() * (bounds[3] - bounds[1]), near = route.project(x, z, 600);
        if (near.distance > 500 || !runningClear(x, z, 4) || auxNear(x, z, 5).some(e => segmentDistance(x, z, e.service.path.points[e.index], e.service.path.points[e.index + 1]).distance < 6))
            continue;
        if (route.stations.some(st => Math.abs(st.s - near.s) < st.length / 2 + 15 && near.distance < 25))
            continue;
        if (roadLookup(x, z, 3).some(({ road, i }) => segmentDistance(x, z, road.points[i], road.points[i + 1]).distance < road.width / 2 + 3.2))
            continue;
        if (footprints.some(fp => pointInPolygon(x, z, fp)) || water.some(w => pointInPolygon(x, z, w.footprint)) || localPlatforms.some(p => insidePlatform(x, z, p.footprint)))
            continue;
        const h = 5 + rand() * 6, tree = factory.tree({ id: `tree/${tile.id}/${i}`, height: h, seed: hash(tile.id) + i });
        const y = ground(x, z);
        tree.position.set(x, y, z);
        batch.add(tree);
        checks.trees++;
    }
    // Selected mapped adjacent tracks retain geographic placement instead of being
    // mirrored with travel direction. Their elevations remain explicitly inferred.
    for (const track of route.data.tracks) {
        if (!track.points || track.points.length < 2)
            continue;
        for (let i = 1; i < track.points.length; i++) {
            const a = track.points[i - 1], b = track.points[i], x = (a[0] + b[0]) / 2, z = (a[2] + b[2]) / 2;
            if (!inside(x, z, bounds))
                continue;
            const near = route.project(x, z, 180);
            if (near.distance > 140 || !runningClear(x, z, 1) || auxNear(x, z, 4).some(e => segmentDistance(x, z, e.service.path.points[e.index], e.service.path.points[e.index + 1]).distance < 3))
                continue;
            const path = new Polyline([a, b]), pose = path.sample(path.length / 2);
            const right = gaugeRight(pose), up = sectionUp(pose), tangent = new THREE.Vector3(...pose.tangent).normalize(), basis = new THREE.Matrix4().makeBasis(new THREE.Vector3(...right), new THREE.Vector3(...up), tangent.negate()), head = Math.max(ground(x, z) + .3, pose.position[1]);
            const bed = new THREE.Mesh(sharedBox, material(0x898577));
            bed.position.set(x - up[0] * .29, head - up[1] * .29, z - up[2] * .29);
            bed.scale.set(2.6, .30, path.length);
            bed.quaternion.setFromRotationMatrix(basis);
            batch.add(bed);
            for (const side of [-1, 1])
                for (const [width, top, depth] of [[.075, 0, .045], [.025, -.045, .07], [.14, -.115, .025]]) {
                    const rail = new THREE.Mesh(sharedBox, material(0x9ca29c));
                    rail.position.set(x + right[0] * side * .755 + up[0] * (top - depth / 2), head + right[1] * side * .755 + up[1] * (top - depth / 2), z + right[2] * side * .755 + up[2] * (top - depth / 2));
                    rail.scale.set(width, depth, path.length);
                    rail.quaternion.setFromRotationMatrix(basis);
                    batch.add(rail);
                }
        }
    }
    for (const civil of (route.data.civils || [])) {
        const path = new CurvePath(civil.points), p = path.sample(path.length / 2).position;
        if (inside(p[0], p[2], bounds)) {
            batch.add(makeRailCivil(civil, ground));
            placements.push({ id: civil.id + '/civil', family: civil.metadata?.tunnel ? 'tunnel' : 'rail-bridge', position: p });
        }
    }
    for (const asset of (route.data.landmarks || [])) {
        if (!inside(asset.position[0], asset.position[2], bounds))
            continue;
        batch.add(makeLandmark(asset));
        placements.push({ id: asset.id, family: asset.family, position: asset.position, source: asset.source, confidence: asset.confidence });
    }
    checks.sourceBedTopTrianglesClipped = sourceBedOwnership.cuts;
    checks.sourceBedTopAreaRemoved = sourceBedOwnership.removedArea;
    progress?.(.99);
    const mesh = batch.packet();
    checks.triangleCount = mesh.index.length / 3;
    return { mesh, roads: roads.map(({ id, kind, width, points, mode, crossingS, routeS }) => ({ id, kind, width, points, mode, crossingS, routeS })), placements, pedestrianPaths, checks };
}
