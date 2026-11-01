import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import * as THREE from 'three';
import {decodeGrid} from '../src/world/grid.js';
import {RouteGeometry} from '../src/core/geometry.js';
import {Terrain} from '../src/world/surfaces.js';
import {buildTile,endpointContext} from '../src/world/build.js';
import {deriveTrackwork} from '../src/render/trackwork.js';

test('the Cradley Heath canopy follows its curved platform clear of both tracks',()=>{
 const data=decodeGrid(JSON.parse(readFileSync('public/data/grid/world.json')).route),route=new RouteGeometry(data),terrain=new Terrain(data.terrain,new Uint16Array(Uint8Array.from(readFileSync('public/data/grid/terrain.bin')).buffer));
 route.setEndpointContext(endpointContext(route));data.trackwork=deriveTrackwork(route).switches;
 const tile=decodeGrid(JSON.parse(readFileSync('public/data/grid/tiles/-7_-6.json'))),result=buildTile(tile,route,terrain),mesh=result.mesh,triangles=[];
 for(let i=0;i<mesh.index.length;i+=3){const ids=[mesh.index[i],mesh.index[i+1],mesh.index[i+2]],xs=ids.map(n=>mesh.position[n*3]),ys=ids.map(n=>mesh.position[n*3+1]),zs=ids.map(n=>mesh.position[n*3+2]);if(Math.max(...xs)<-6033||Math.min(...xs)>-6010||Math.max(...zs)<-5743||Math.min(...zs)>-5714||Math.max(...ys)<98||Math.min(...ys)>100)continue;for(const n of ids)triangles.push(mesh.position[n*3],mesh.position[n*3+1],mesh.position[n*3+2]);}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(triangles,3));const object=new THREE.Mesh(g,new THREE.MeshBasicMaterial({side:THREE.DoubleSide}));
 for(let s=15376;s<=15392;s+=2)for(const lane of [0,4.2])for(const offset of [-.9,0,.9]){
  const a=route.lanePose(s,lane),b=route.lanePose(s+2,lane),start=new THREE.Vector3(a.position[0]+a.right[0]*offset,a.position[1]+3.9,a.position[2]+a.right[2]*offset),end=new THREE.Vector3(b.position[0]+b.right[0]*offset,b.position[1]+3.9,b.position[2]+b.right[2]*offset),ray=new THREE.Raycaster(start,end.clone().sub(start).normalize(),0,start.distanceTo(end));
  assert.equal(ray.intersectObject(object).length,0,`canopy obstruction at ${s}, lane ${lane}, offset ${offset}`);
 }
 g.dispose();object.material.dispose();
});
