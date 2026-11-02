import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import * as THREE from 'three';
import { AssetFactory, setCrossingState } from '../src/render/assets.js';
import {decodeGrid, position} from '../src/world/grid.js';
import {Polyline} from '../src/core/geometry.js';
const sourcePaths = ['scripts/audit-crossing-orientation.js', 'src/render/assets.js', 'world-source/operations.json'], sourceHashes = Object.fromEntries(sourcePaths.map(p => [p, createHash('sha256').update(readFileSync(p)).digest('hex')]));
const group = new AssetFactory().crossing({ id: 'fixture/perpendicular', width: 7, tracks: 2, trackSpacing: 4.2 });
setCrossingState(group, 1, 0);
group.updateMatrixWorld(true);
const roadDirection = new THREE.Vector3(1, 0, 0), barriers = group.userData.barriers.map(({ pivot }, i) => {
    const stripes = pivot.children.filter(c => c.position.x > 0).sort((a, b) => a.position.x - b.position.x), a = new THREE.Vector3(), b = new THREE.Vector3();
    stripes[0].getWorldPosition(a);
    stripes[stripes.length - 1].getWorldPosition(b);
    const axis = b.sub(a).setY(0).normalize(), roadParallel = Math.abs(axis.dot(roadDirection));
    return { index: i, closedAxis: axis.toArray(), absoluteDotWithRoadDirection: roadParallel, passesAcrossRoad: roadParallel < .1 };
});
const heads = group.userData.warningLights.map((lens, i) => { const q = new THREE.Quaternion(); lens.getWorldQuaternion(q); const normal = new THREE.Vector3(0, 1, 0).applyQuaternion(q).setY(0).normalize(), facing = Math.abs(normal.dot(roadDirection)); return { index: i, axis: normal.toArray(), absoluteDotWithRoadDirection: facing, facesRoadApproach: facing > .9 }; });
const data = decodeGrid(JSON.parse(readFileSync('world-source/operations.json')));
const authoredSites = data.authoredInfrastructure.models.filter(m=>m.kind==='crossing').map(entry=>{
    const source = data.crossings.find(c=>c.id===entry.id);
    const road = data.authoredRoadNetwork.filter(r=>r.mode==='crossing'&&Number.isFinite(r.crossingS)&&Math.abs(r.routeS-source.s)<60).sort((a,b)=>Math.abs(a.routeS-source.s)-Math.abs(b.routeS-source.s))[0];
    if(!road) return {id:entry.id,status:'INCOMPLETE',reason:'No stored operating road crosses the source chainage'};
    const direction = new THREE.Vector3(...new Polyline(road.points).sample(road.crossingS).tangent).setY(0).normalize();
    const model = new AssetFactory().crossing(entry.config);
    model.position.fromArray(position(entry.anchor).map((v,i)=>v+entry.residual[i]));model.quaternion.fromArray(entry.quaternion);
    setCrossingState(model,1,0);model.updateMatrixWorld(true);
    const armDots = model.userData.barriers.map(({pivot})=>{
        const stripes=pivot.children.filter(c=>c.position.x>0).sort((a,b)=>a.position.x-b.position.x);
        const a=new THREE.Vector3(),b=new THREE.Vector3();stripes[0].getWorldPosition(a);stripes.at(-1).getWorldPosition(b);
        return Math.abs(b.sub(a).setY(0).normalize().dot(direction));
    });
    const headDots=model.userData.warningLights.map(lens=>{const q=new THREE.Quaternion();lens.getWorldQuaternion(q);return Math.abs(new THREE.Vector3(0,1,0).applyQuaternion(q).setY(0).normalize().dot(direction));});
    return {id:entry.id,road:road.id,source:source.source,roadShear:entry.config.roadShear,closedArmDotWithRoad:armDots,headDotWithRoad:headDots,status:armDots.every(d=>d<.02)&&headDots.every(d=>d>.98)?'IMPLEMENTED_AND_VERIFIED':'INCOMPLETE'};
});
const failed = barriers.some(b => !b.passesAcrossRoad) || heads.some(h => !h.facesRoadApproach)||authoredSites.some(s=>s.status!=='IMPLEMENTED_AND_VERIFIED');
const report = { generatedAt: new Date().toISOString(), sourceHashes, fixture: 'Perpendicular two-track crossing, track local Z, road local X, fully closed barriers.', scope:'Factory and all four stored operating crossings, including Blakedown: lowered arms across the actual stored road tangent and warning heads facing its approaches. This verifies orientation, not surveyed dimensions or a full swept-volume clearance certificate.', barriers, heads, authoredSites, failed, status: failed ? 'INCOMPLETE' : 'IMPLEMENTED_AND_VERIFIED' };
writeFileSync('docs/reports/crossing-axis-diagnostic.json', JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report, null, 2));
if (failed)
    process.exitCode = 1;
