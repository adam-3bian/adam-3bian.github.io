import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import * as THREE from 'three';
import {RouteGeometry} from '../src/core/geometry';
import {Terrain,engineerSurfaceRoad} from '../src/world/surfaces';
import {buildTile} from '../src/world/build';
import type {RouteData,Feature,WorldTile} from '../src/core/types';

test('Hagley source paths become a supported complete access site and Brake Lane remains an open arch over the railway',()=>{
 const d=JSON.parse(readFileSync('public/data/route.json','utf8')) as RouteData;d.surfaceRoads=JSON.parse(readFileSync('public/data/road-surfaces.json','utf8')).roads;d.surfaceWater=JSON.parse(readFileSync('public/data/land-surfaces.json','utf8')).water;
 const route=new RouteGeometry(d),bytes=readFileSync('public/data/terrain.bin'),terrain=new Terrain(d.terrain,new Uint16Array(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength)));
 const tile=JSON.parse(readFileSync('public/data/tiles/-10_-1.json','utf8')) as WorldTile,result=buildTile(tile,route,terrain),site=result.placements.find(p=>p.id==='hagley-covered-footbridge');assert.ok(site);
 assert.deepEqual(site.sourceIds,['way/240115500/0','way/240115501/0','way/240115499/0']);assert.equal(result.roads.some(r=>(site.sourceIds as string[]).includes(r.id)),false);
 for(const stair of site.stairs as any[]){assert.ok(stair.going>=.25-1e-8);assert.ok(stair.riser<=.19+.001);assert.ok(stair.riser>0);assert.equal(stair.top[1],(site.deck as number[][])[0][1]);}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(result.mesh.position,3));g.setIndex(new THREE.BufferAttribute(result.mesh.index,1));const mesh=new THREE.Mesh(g,new THREE.MeshBasicMaterial({side:THREE.DoubleSide}));
 for(const centre of[8153,8181])for(let s=centre-3;s<=centre+3;s+=.5)for(const lane of[0,4.2])for(const lateral of[-1.405,0,1.405]){const pose=route.lanePose(s,lane),q=pose.position.map((v,i)=>v+pose.right[i]*lateral);const hits=new THREE.Raycaster(new THREE.Vector3(q[0],q[1]+.2,q[2]),new THREE.Vector3(0,1,0),0,3.85).intersectObject(mesh);assert.equal(hits.length,0,`site blocks train body at ${s}/${lane}`);}
 const roads=d.surfaceRoads as Feature[],model=roads.filter(f=>['way/150242118/0','way/184620647/0','way/157158203/0'].includes(f.id)).map(f=>engineerSurfaceRoad(f,route,terrain)!);
 const left=model.find(r=>r.id==='way/150242118/0')!,span=model.find(r=>r.id==='way/184620647/0')!,right=model.find(r=>r.id==='way/157158203/0')!;
 assert.equal(span.mode,'over');assert.deepEqual(left.points.at(-1),span.points[0]);assert.deepEqual(span.points.at(-1),right.points[0]);assert.ok(result.placements.some(p=>p.id==='hagley-brake-lane'));
});
