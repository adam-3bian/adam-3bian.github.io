import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import * as THREE from 'three/webgpu';
import {RouteGeometry,Polyline,clamp,sectionUp} from '../src/core/geometry';
import {deriveTrackwork,makeSwitch,setSwitchBlend,switchRailPosition} from '../src/render/trackwork';
import type {V3} from '../src/core/types';
const route=new RouteGeometry(JSON.parse(readFileSync('public/data/route.json','utf8')));
const derived=deriveTrackwork(route);
function nearestVertex(positions:THREE.BufferAttribute|THREE.InterleavedBufferAttribute,target:V3){let distance=Infinity,point:V3=[Infinity,Infinity,Infinity];for(let i=0;i<positions.count;i++){const x=positions.getX(i),y=positions.getY(i),z=positions.getZ(i),delta=Math.hypot(x-target[0],y-target[1],z-target[2]);if(delta<distance){distance=delta;point=[x,y,z];}}return{distance,point};}
test('operating switch assets come from connected source-node routes, not synthetic station anchors',()=>{
  assert.ok(derived.switches.length>10);assert.ok(derived.gaps.some(g=>g.includes('Western')));
  const network=route.data.network as any,nodeIds=new Set(network.nodes.map((n:any)=>n.id)),edgeIds=new Set(network.edges.map((e:any)=>e.id));
  for(const d of derived.switches){assert.ok(nodeIds.has(d.sourceNode));for(const id of [...d.normalEdgeIds,...d.reverseEdgeIds,...d.branchEdgeIds])assert.ok(edgeIds.has(id));assert.equal(d.normalEdgeIds[0],d.reverseEdgeIds[0]);assert.notEqual(d.normalEdgeIds[1],d.reverseEdgeIds[1]);}
});
test('reverse routes end exactly on their recorded source edge and normals attach to runtime running rails',()=>{
  const edges=new Map<string,any>((route.data.network as any).edges.map((e:any)=>[e.id,e]));
  for(const d of derived.switches){
    const point=d.branchPath.at(-1)!;let best=Infinity;
    for(const id of d.branchEdgeIds){const points=edges.get(id).points as V3[];for(let i=1;i<points.length;i++){const a=points[i-1],b=points[i],delta=b.map((v,j)=>v-a[j]);const len=delta.reduce((s,v)=>s+v*v,0);const t=clamp(point.reduce((s,v,j)=>s+(v-a[j])*delta[j],0)/(len||1),0,1);const distance=Math.hypot(...point.map((v,j)=>v-a[j]-t*delta[j]));best=Math.min(best,distance);}}
    assert.ok(best<.001,`${d.id} reverse endpoint is ${best}m off its mapped edge`);
    const firstS=d.direction===1?d.startS:d.endS,lastS=d.direction===1?d.endS:d.startS;
    assert.ok(Math.hypot(...d.normalPath[0].map((v,i)=>v-route.lanePose(firstS,d.lane).position[i]))<.001);
    assert.ok(Math.hypot(...d.normalPath.at(-1)!.map((v,i)=>v-route.lanePose(lastS,d.lane).position[i]))<.001);
    assert.deepEqual(d.reversePath[d.toeIndex],d.position);
  }
});
test('switch inside faces retain physical 1.435m gauge and 1.510m head centres in 3D',()=>{
  for(const d of derived.switches){for(const which of ['normal','branch'] as const){const path=new Polyline(which==='normal'?d.normalPath:d.branchPath);for(let s=0;s<path.length;s+=3.7){const a=switchRailPosition(d,which,s,-.7175),b=switchRailPosition(d,which,s,.7175),ca=switchRailPosition(d,which,s,-.755),cb=switchRailPosition(d,which,s,.755);assert.ok(Math.abs(Math.hypot(...a.map((x,i)=>x-b[i]))-1.435)<1e-7);assert.ok(Math.abs(Math.hypot(...ca.map((x,i)=>x-cb[i]))-1.510)<1e-7);}}
    for(const frame of [...d.normalFrames,...d.branchFrames]){assert.ok(Math.abs(Math.hypot(...frame.gaugeRight)-1)<1e-12);assert.ok(Math.abs(Math.hypot(...frame.unitUp)-1)<1e-12);assert.ok(Math.abs(frame.gaugeRight.reduce((n,x,j)=>n+x*frame.unitUp[j],0))<1e-12);}
    const group=makeSwitch(d,{includeBallast:false});assert.equal(group.children.length,3);group.traverse(o=>{if(!(o as THREE.Mesh).isMesh)return;const mesh=o as THREE.Mesh,positions=mesh.geometry.getAttribute('position');for(let i=0;i<positions.array.length;i++)assert.ok(Number.isFinite(positions.array[i]));const material=mesh.material as THREE.MeshStandardMaterial;assert.equal(material.map,null);});
    const box=new THREE.Box3().setFromObject(group);assert.ok(!box.isEmpty());assert.ok(box.max.y-box.min.y<5,`${d.id}: unbounded rail profile`);
    for(const blade of group.userData.blades as THREE.Mesh[]){const straight=blade.userData.closesFor==='normal',path=new Polyline(straight?d.normalPath:d.branchPath),toe=straight?path.lengths[d.toeIndex]:0,heel=switchRailPosition(d,straight?'normal':'branch',toe+7.1,blade.userData.side*.755),position=blade.geometry.getAttribute('position');const centre=[0,1,2].map(i=>(position.array[32*3+i]+position.array[33*3+i])/2);assert.ok(Math.hypot(...centre.map((x,i)=>x-heel[i]))<.003,`${d.id}: blade heel detached from its closure rail`);if(straight){const up=sectionUp(route.lanePose(route.travel(d.s,d.direction*7.1,d.lane),d.lane)),bottom=[0,1,2].map(i=>(position.array[34*3+i]+position.array[35*3+i])/2);assert.ok(Math.hypot(...centre.map((x,i)=>x-bottom[i]-up[i]*.14))<.004,`${d.id}: blade depth must follow sectionUp`);}}
    for(let i=0;i<d.formationSections.length;i++){const section=d.formationSections[i],up=d.normalFrames[i].unitUp,centre=d.normalPath[i];for(const [corners,depth] of [[[section.topLeft,section.topRight],.29],[[section.bottomLeft,section.bottomRight],.64]] as [V3[],number][]){for(const corner of corners)assert.ok(Math.abs(corner.reduce((sum,x,j)=>sum+(x-centre[j])*up[j],0)+depth)<1e-8,`${d.id}: canted bed must support the complete bearer envelope`);}}
  }
});
test('rendered head joins and full profile-depth corners match runtime canted section at both endpoints',()=>{
  let maximumBank=0;
  for(const d of derived.switches){const path=new Polyline(d.normalPath),group=makeSwitch(d,{includeBallast:false}),positions=(group.children[0] as THREE.Mesh).geometry.getAttribute('position');
    for(const end of [0,1]){const s=end?(d.direction===1?d.endS:d.startS):(d.direction===1?d.startS:d.endS),arc=end?path.length:0;maximumBank=Math.max(maximumBank,Math.abs(route.lanePose(s,d.lane).bank));
      const insideFaces:V3[]=[],headCentres:V3[]=[];
      for(const side of [-1,1]){const corners:V3[]=[];for(const corner of [-1,1]){const offset=side*.755+corner*.0375,target=route.railPosition(s,d.lane,offset*d.direction),fitted=switchRailPosition(d,'normal',arc,offset);assert.ok(Math.hypot(...fitted.map((n,i)=>n-target[i]))<1e-7);
        const nearest=nearestVertex(positions,target);assert.ok(nearest.distance<=.01,`${d.id} endpoint ${end}, rail ${side}: rendered head misses runtime rail by ${nearest.distance}m`);corners.push(nearest.point);
      }insideFaces.push(corners[side===-1?1:0]);headCentres.push(corners[0].map((x,j)=>(x+corners[1][j])/2) as V3);
      }
      assert.ok(Math.abs(Math.hypot(...insideFaces[0].map((x,j)=>x-insideFaces[1][j]))-1.435)<.006,`${d.id}: actual 3D inside-face gauge`);
      assert.ok(Math.abs(Math.hypot(...headCentres[0].map((x,j)=>x-headCentres[1][j]))-1.510)<.006,`${d.id}: actual 3D head centre spacing`);
      const up=sectionUp(route.lanePose(s,d.lane));
      for(const [width,top,bottom] of [[.075,0,.045],[.025,.045,.115],[.14,.115,.14]])for(const side of [-1,1])for(const corner of [-1,1])for(const depth of [top,bottom]){const rail=route.railPosition(s,d.lane,(side*.755+corner*width/2)*d.direction),target=rail.map((x,j)=>x-up[j]*depth) as V3,nearest=nearestVertex(positions,target);assert.ok(nearest.distance<=.004,`${d.id} endpoint ${end}: profile ${width}m at depth ${depth}m misses orthonormal section by ${nearest.distance}m`);}
    }
  }
  assert.ok(maximumBank>.005,'fixture must exercise nonzero cant rather than only level track');
});
test('blade proof, physical gaps and hinge positions are independent between switches',()=>{
  const d=derived.switches[0],a=makeSwitch(d),b=makeSwitch(d);const bladeA=(a.userData.blades as THREE.Mesh[])[0],bladeB=(b.userData.blades as THREE.Mesh[])[0];const before=Array.from(bladeB.geometry.getAttribute('position').array);
  const closed=Array.from(bladeA.geometry.getAttribute('position').array);setSwitchBlend(a,1);const open=Array.from(bladeA.geometry.getAttribute('position').array);assert.ok(Math.hypot(open[0]-closed[0],open[2]-closed[2])>.15);assert.deepEqual(Array.from(bladeB.geometry.getAttribute('position').array),before);
  const fixed=(a.children[0] as THREE.Mesh).geometry.getAttribute('position');for(let i=0;i<d.formationSections.length;i+=4)for(const corner of Object.values(d.formationSections[i]))assert.ok(nearestVertex(fixed,corner).distance<.004,'full switch ballast envelope must be rendered');
  // Last ring is the fixed blade heel; the toe moves without detaching the heel.
  assert.deepEqual(open.slice(-12),closed.slice(-12));assert.equal(a.userData.proved,'reverse');assert.deepEqual(a.userData.selectedSourceEdges,d.reverseEdgeIds);setSwitchBlend(a,.4);assert.equal(a.userData.proved,'moving');assert.equal(a.userData.selectedSourceEdges,null);setSwitchBlend(a,0);assert.equal(a.userData.proved,'normal');assert.deepEqual(a.userData.selectedSourceEdges,d.normalEdgeIds);
});
