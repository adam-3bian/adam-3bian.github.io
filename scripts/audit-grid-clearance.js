/** Sweep a model train envelope through actual cooked grid-world triangles.
 * Diagnostic sample spacing is 4 m, with nine longitudinal probes per track.
 * This is a regression check, not a surveyed loading-gauge certificate. */
import { readFileSync, writeFileSync } from 'node:fs';
import * as THREE from 'three';
import { decodeGrid } from '../src/world/grid.js';
import { RouteGeometry, CurvePath } from '../src/core/geometry.js';
import { Terrain } from '../src/world/surfaces.js';
import { buildTile, endpointContext } from '../src/world/build.js';
import { deriveTrackwork } from '../src/render/trackwork.js';
const document = JSON.parse(readFileSync('public/data/grid/world.json', 'utf8')), data = decodeGrid(document.route), route = new RouteGeometry(data);
const terrain = new Terrain(data.terrain, new Uint16Array(Uint8Array.from(readFileSync('public/data/grid/terrain.bin')).buffer));
route.setEndpointContext(endpointContext(route));
data.trackwork = deriveTrackwork(route).switches;
const stations = route.stations.filter(s => ['KID', 'BKD', 'HAG', 'SBJ', 'CRA', 'LGG', 'SGB', 'THW', 'JEQ', 'BSW', 'BMO', 'TYS', 'DDG'].includes(s.id));
const probes = [];
const stationRadius=Number(process.env.RAILWAY_CLEARANCE_RADIUS ?? 180);
if(!Number.isFinite(stationRadius)||stationRadius<=0)throw new Error('Clearance radius must be a positive number');
const sites = [...stations.map(st=>({id:st.id,s:st.s,radius:stationRadius})),...data.crossings.map(c=>({id:`crossing/${c.id}`,s:route.sourceS(c.s),radius:30}))];
for (const st of sites)
    for (let s = Math.max(0, st.s - st.radius); s < Math.min(route.length - 4, st.s + st.radius); s += 4)
        for (const lane of [0, 4.2])
            for (const offset of [-.9, 0, .9])
                for (const height of [1.2, 2.45, 3.9]) {
                    const point = (ss) => { const p = route.lanePose(ss, lane); return [p.position[0] + p.right[0] * offset, p.position[1] + height, p.position[2] + p.right[2] * offset]; };
                    probes.push({ site: st.id, lane: String(lane), s, a: point(s), b: point(s + 4) });
                }
const galton = stations.find(s => s.id === 'SGB');
for (const service of data.adjacentServices.filter(s => s.metadata?.region === 'galton')) {
    const path = new CurvePath(service.points);
    for (let s = 0; s < path.length - 4; s += 4) {
        const p = path.sample(s).position;
        if (Math.hypot(p[0] - galton.position[0], p[2] - galton.position[2]) > 90)
            continue;
        for (const h of [1.2, 2.45, 3.9]) {
            const a = path.sample(s).position, b = path.sample(s + 4).position;
            probes.push({ site: 'SGB/lower', lane: service.id, s, a: [a[0], a[1] + h, a[2]], b: [b[0], b[1] + h, b[2]] });
        }
    }
}
// Metro paths are independent of the mainline and need their own clearance
// samples at the two rail/Metro interchanges.
for (const station of stations.filter(s=>['THW','JEQ'].includes(s.id)))
    for (const service of data.adjacentServices.filter(s=>s.metadata?.mode==='tram' && s.metadata?.renderStatic)) {
        const path=new CurvePath(service.points);
        for(let s=0;s<path.length-4;s+=4){
            const a=path.sample(s),b=path.sample(s+4);
            if(Math.hypot(a.position[0]-station.position[0],a.position[2]-station.position[2])>120)continue;
            for(const offset of [-.9,0,.9])for(const height of [1.2,2.45,3.9])
                probes.push({site:`${station.id}/metro`,lane:service.id,s,a:[a.position[0]+a.right[0]*offset,a.position[1]+height,a.position[2]+a.right[2]*offset],b:[b.position[0]+b.right[0]*offset,b.position[1]+height,b.position[2]+b.right[2]*offset]});
        }
    }
const filter = process.argv[2]?.split(',');
const failures = [], reports = [];
const ray = new THREE.Ray(), v0 = new THREE.Vector3(), v1 = new THREE.Vector3(), v2 = new THREE.Vector3(), hit = new THREE.Vector3(), dir = new THREE.Vector3();
for (const entry of data.tiles) {
    const b = entry.bounds, local = probes.filter(p => (!filter || filter.includes(p.site.split('/')[0])) && Math.max(p.a[0], p.b[0]) >= b[0] && Math.min(p.a[0], p.b[0]) <= b[2] && Math.max(p.a[2], p.b[2]) >= b[1] && Math.min(p.a[2], p.b[2]) <= b[3]);
    if (!local.length)
        continue;
    const begin = performance.now(), result = buildTile(decodeGrid(JSON.parse(readFileSync('public/' + entry.url, 'utf8'))), route, terrain), mesh = result.mesh;
    if (!mesh.position.every(Number.isFinite))
        throw new Error(entry.id + ': non-finite vertex');
    const buckets = new Map(), size = 10;
    for (let i = 0; i < mesh.index.length; i += 3) {
        const ids = [mesh.index[i], mesh.index[i + 1], mesh.index[i + 2]], xs = ids.map(n => mesh.position[n * 3]), zs = ids.map(n => mesh.position[n * 3 + 2]);
        const minX = Math.floor(Math.min(...xs) / size), maxX = Math.floor(Math.max(...xs) / size), minZ = Math.floor(Math.min(...zs) / size), maxZ = Math.floor(Math.max(...zs) / size);
        for (let x = minX; x <= maxX; x++)
            for (let z = minZ; z <= maxZ; z++) {
                const key = x + ',' + z, list = buckets.get(key) || [];
                list.push(i);
                buckets.set(key, list);
            }
    }
    let count = 0;
    for (const p of local) {
        ray.origin.fromArray(p.a);
        dir.fromArray(p.b).sub(ray.origin);
        const length = dir.length();
        ray.direction.copy(dir).normalize();
        const candidates = new Set();
        for (let x = Math.floor(Math.min(p.a[0], p.b[0]) / size); x <= Math.floor(Math.max(p.a[0], p.b[0]) / size); x++)
            for (let z = Math.floor(Math.min(p.a[2], p.b[2]) / size); z <= Math.floor(Math.max(p.a[2], p.b[2]) / size); z++)
                for (const n of buckets.get(x + ',' + z) || [])
                    candidates.add(n);
        for (const n of candidates) {
            const ids = [mesh.index[n], mesh.index[n + 1], mesh.index[n + 2]];
            v0.fromArray(mesh.position, ids[0] * 3);
            v1.fromArray(mesh.position, ids[1] * 3);
            v2.fromArray(mesh.position, ids[2] * 3);
            if (Math.max(v0.y, v1.y, v2.y) < Math.min(p.a[1], p.b[1]) || Math.min(v0.y, v1.y, v2.y) > Math.max(p.a[1], p.b[1]))
                continue;
            if (ray.intersectTriangle(v0, v1, v2, false, hit) && hit.distanceTo(ray.origin) <= length + .001) {
                count++;
                if (failures.length < 150)
                    failures.push({ tile: entry.id, site: p.site, lane: p.lane, s: p.s, position: hit.toArray(), color: new THREE.Color(mesh.color[ids[0] * 3], mesh.color[ids[0] * 3 + 1], mesh.color[ids[0] * 3 + 2]).getHexString() });
                break;
            }
        }
    }
    const report = { tile: entry.id, probes: local.length, triangles: mesh.index.length / 3, failures: count, seconds: (performance.now() - begin) / 1000 };
    reports.push(report);
    console.log(JSON.stringify(report));
}
const output = { revision: document.revision, scope: 'Actual cooked static geometry; 4 m longitudinal sweeps at heights 1.2, 2.45 and 3.9 m, offsets -0.9/0/0.9 m; source topology and clearance assumptions are not survey', filter: filter || 'all', stationRadius, reports, failures, totalFailures: reports.reduce((s, r) => s + r.failures, 0) };
writeFileSync(process.env.RAILWAY_CLEARANCE_REPORT || 'docs/reports/grid-clearance.json', JSON.stringify(output, null, 2) + '\n');
if (output.totalFailures)
    process.exitCode = 1;
