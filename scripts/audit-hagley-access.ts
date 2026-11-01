import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import * as THREE from 'three';
import {RouteGeometry,Polyline} from '../src/core/geometry';
import {Terrain} from '../src/world/surfaces';
import {buildTile} from '../src/world/build';
import type {Feature,RouteData,WorldTile} from '../src/core/types';

// Targeted source/actual-mesh evidence; a detected conflict remains an open failure.
const files=['scripts/audit-hagley-access.ts','src/core/geometry.ts','src/core/pose.ts','src/world/build.ts','src/world/platforms.ts','src/world/surfaces.ts','src/render/assets.ts','src/render/batch.ts','src/render/trackwork.ts','public/data/route.json','public/data/adjacent-services.json','public/data/road-surfaces.json','public/data/land-surfaces.json','public/data/terrain.bin','public/data/tiles/-10_-1.json','references/frames/kidderminster2dorridge0133.jpg'];
const hashes=Object.fromEntries(files.map(f=>[f,createHash('sha256').update(readFileSync(f)).digest('hex')]));
const data=JSON.parse(readFileSync('public/data/route.json','utf8')) as RouteData;
data.surfaceRoads=JSON.parse(readFileSync('public/data/road-surfaces.json','utf8')).roads;data.surfaceWater=JSON.parse(readFileSync('public/data/land-surfaces.json','utf8')).water;
data.adjacentServices=JSON.parse(readFileSync('public/data/adjacent-services.json','utf8')).services;
const route=new RouteGeometry(data),bytes=readFileSync('public/data/terrain.bin'),terrain=new Terrain(data.terrain,new Uint16Array(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength)));
const tile=JSON.parse(readFileSync('public/data/tiles/-10_-1.json','utf8')) as WorldTile,result=buildTile(tile,route,terrain);
const id='way/240115500/0',road=result.roads.find(r=>r.id===id);if(!road)throw new Error('Hagley source footway missing from its owner tile');
const source=(data.surfaceRoads as Feature[]).filter(f=>[id,'way/240115501/0','way/240115499/0'].includes(f.id));
const ends=(f:Feature)=>[f.points![0],f.points![f.points!.length-1]];const f=source.find(r=>r.id===id)!;
const connections=source.filter(r=>r.id!==id).map(r=>({stepId:r.id,endpointDistance:Math.min(...ends(f).flatMap(a=>ends(r).map(b=>Math.hypot(a[0]-b[0],a[2]-b[2]))))}));
const color=new THREE.Color(0xb5b3a5),vertices:number[]=[];
for(let i=0;i<result.mesh.index.length;i+=3){const ids=[result.mesh.index[i],result.mesh.index[i+1],result.mesh.index[i+2]],v=ids[0]*3;if(Math.abs(result.mesh.color[v]-color.r)<1e-6&&Math.abs(result.mesh.color[v+1]-color.g)<1e-6&&Math.abs(result.mesh.color[v+2]-color.b)<1e-6&&result.mesh.normal[v+1]>.7)for(const n of ids)vertices.push(...result.mesh.position.slice(n*3,n*3+3));}
const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));const pavement=new THREE.Mesh(geo,new THREE.MeshBasicMaterial({side:THREE.DoubleSide}));const path=new Polyline(road.points);
const hits=[{lane:0,s:8153.023450976055},{lane:4.2,s:8153.0321156760365}].map(({lane,s})=>{
 const pose=route.lanePose(s,lane),near=path.nearest(pose.position[0],pose.position[2]),expected=path.sample(near.s).position[1];
 const ray=new THREE.Raycaster(new THREE.Vector3(pose.position[0],pose.position[1]+.6,pose.position[2]),new THREE.Vector3(0,-1,0),0,1.2);
 const hit=ray.intersectObject(pavement).find(h=>Math.abs(h.point.y-expected)<.08);
 return{lane,chainage:s,railPosition:pose.position,pathDistance:near.distance,pathWidth:road.width,sourceProfileY:expected,actualPavementY:hit?.point.y??null,triangleIndex:hit?.faceIndex??null,differenceFromRail:hit?hit.point.y-pose.position[1]:null};
});
const conflict=hits.some(h=>h.actualPavementY!==null&&h.pathDistance<road.width/2);
const report={generatedAt:new Date().toISOString(),sourceHashes:hashes,id:'HAG-PATH-001',sourceWay:id,sourceMode:road.mode,connections,hits,conflict,scope:'Ray hits on actual emitted pavement-coloured triangles within the source path footprint and profile at two identified running-lane positions. Baked triangles lack individual source IDs; ownership is supported by position/profile/colour, not encoded face provenance. Frame 0133 is visual evidence, not a surveyed or precisely aligned view. This does not validate a bridge or stairs.',status:conflict?'OPEN: source path is emitted at rail level; reconcile supported layered access':'No matching pavement triangle found; further investigation required, not an acceptance pass'};
writeFileSync('docs/reports/hagley-access-diagnostic.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));if(conflict)process.exitCode=1;
