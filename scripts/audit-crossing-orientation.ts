import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import * as THREE from 'three';
import {AssetFactory,setCrossingState} from '../src/render/assets';

// Synthetic perpendicular site only: the route's actual road binding is not yet known.
const sourcePaths=['scripts/audit-crossing-orientation.ts','src/render/assets.ts'],sourceHashes=Object.fromEntries(sourcePaths.map(p=>[p,createHash('sha256').update(readFileSync(p)).digest('hex')]));
const group=new AssetFactory().crossing({id:'fixture/perpendicular',width:7,tracks:2,trackSpacing:4.2});setCrossingState(group,1,0);group.updateMatrixWorld(true);
const roadDirection=new THREE.Vector3(1,0,0),barriers=(group.userData.barriers as {pivot:THREE.Group}[]).map(({pivot},i)=>{
  const stripes=pivot.children.filter(c=>c.position.x>0).sort((a,b)=>a.position.x-b.position.x),a=new THREE.Vector3(),b=new THREE.Vector3();stripes[0].getWorldPosition(a);stripes[stripes.length-1].getWorldPosition(b);const axis=b.sub(a).setY(0).normalize(),roadParallel=Math.abs(axis.dot(roadDirection));
  return{index:i,closedAxis:axis.toArray(),absoluteDotWithRoadDirection:roadParallel,passesAcrossRoad:roadParallel<.1};
});
const heads=(group.userData.warningLights as THREE.Mesh[]).map((lens,i)=>{const q=new THREE.Quaternion();lens.getWorldQuaternion(q);const normal=new THREE.Vector3(0,1,0).applyQuaternion(q).setY(0).normalize(),facing=Math.abs(normal.dot(roadDirection));return{index:i,axis:normal.toArray(),absoluteDotWithRoadDirection:facing,facesRoadApproach:facing>.9};});
const failed=barriers.some(b=>!b.passesAcrossRoad)||heads.some(h=>!h.facesRoadApproach);
const report={generatedAt:new Date().toISOString(),sourceHashes,fixture:'Perpendicular two-track crossing, track local Z, hypothetical road local X, fully closed barriers. This is a factory geometry test, not a measurement or surveyed binding of a real crossing.',barriers,heads,failed,status:failed?'OPEN: shared factory barrier/head axes do not fit this perpendicular road fixture':'Fixture passed; real crossing sites still require source-bound geometry and swept-state checks'};
writeFileSync('docs/reports/crossing-axis-diagnostic.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));if(failed)process.exitCode=1;
