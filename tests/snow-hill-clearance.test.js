import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import * as THREE from 'three';
import {decodeGrid} from '../src/world/grid.js';
import {RouteGeometry} from '../src/core/geometry.js';
import {Terrain} from '../src/world/surfaces.js';
import {buildTile,endpointContext} from '../src/world/build.js';
import {deriveTrackwork} from '../src/render/trackwork.js';

test('Snow Hill bridge supports leave the actual running envelope clear',()=>{
 const d=decodeGrid(JSON.parse(readFileSync('public/data/grid/world.json')).route),route=new RouteGeometry(d),terrain=new Terrain(d.terrain,new Uint16Array(Uint8Array.from(readFileSync('public/data/grid/terrain.bin')).buffer));
 route.setEndpointContext(endpointContext(route));d.trackwork=deriveTrackwork(route).switches;
 const tile=decodeGrid(JSON.parse(readFileSync('public/data/grid/tiles/6_-8.json'))),result=buildTile(tile,route,terrain),mesh=result.mesh,triangles=[];
 assert.ok(result.placements.some(p=>p.id==='way/29998250/0/clearance-adjustment'&&p.removedSections>0));
 // Restrict the real cooked triangles to the previously obstructed envelope.
 for(let i=0;i<mesh.index.length;i+=3){const ids=[mesh.index[i],mesh.index[i+1],mesh.index[i+2]],xs=ids.map(n=>mesh.position[n*3]),ys=ids.map(n=>mesh.position[n*3+1]),zs=ids.map(n=>mesh.position[n*3+2]);if(Math.max(...xs)<6944||Math.min(...xs)>6962||Math.max(...zs)<-7266||Math.min(...zs)>-7245||Math.max(...ys)<132.5||Math.min(...ys)>137)continue;for(const n of ids)triangles.push(mesh.position[n*3],mesh.position[n*3+1],mesh.position[n*3+2]);}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(triangles,3));const object=new THREE.Mesh(g,new THREE.MeshBasicMaterial({side:THREE.DoubleSide}));
 for(let s=30684;s<=30696;s+=2)for(const offset of [-.9,0,.9])for(const height of [1.2,2.45,3.9]){
  const a=route.lanePose(s,0),b=route.lanePose(s+2,0),start=new THREE.Vector3(a.position[0]+a.right[0]*offset,a.position[1]+height,a.position[2]+a.right[2]*offset),end=new THREE.Vector3(b.position[0]+b.right[0]*offset,b.position[1]+height,b.position[2]+b.right[2]*offset),ray=new THREE.Raycaster(start,end.clone().sub(start).normalize(),0,start.distanceTo(end));
  assert.equal(ray.intersectObject(object).length,0,`bridge obstruction at ${s}, offset ${offset}, height ${height}`);
 }
 g.dispose();object.material.dispose();
 const earth=[];
 for(let i=0;i<mesh.index.length;i+=3){const ids=[mesh.index[i],mesh.index[i+1],mesh.index[i+2]],xs=ids.map(n=>mesh.position[n*3]),ys=ids.map(n=>mesh.position[n*3+1]),zs=ids.map(n=>mesh.position[n*3+2]);if(Math.max(...xs)<6987||Math.min(...xs)>7003||Math.max(...zs)<-7232||Math.min(...zs)>-7215||Math.max(...ys)<131||Math.min(...ys)>136)continue;for(const n of ids)earth.push(mesh.position[n*3],mesh.position[n*3+1],mesh.position[n*3+2]);}
 const eg=new THREE.BufferGeometry();eg.setAttribute('position',new THREE.Float32BufferAttribute(earth,3));const eo=new THREE.Mesh(eg,new THREE.MeshBasicMaterial({side:THREE.DoubleSide}));
 for(let s=30734;s<=30740;s+=2)for(const offset of [-.9,0,.9])for(const height of [1.2,2.45,3.9]){
  const a=route.lanePose(s,4.2),b=route.lanePose(s+2,4.2),start=new THREE.Vector3(a.position[0]+a.right[0]*offset,a.position[1]+height,a.position[2]+a.right[2]*offset),end=new THREE.Vector3(b.position[0]+b.right[0]*offset,b.position[1]+height,b.position[2]+b.right[2]*offset),ray=new THREE.Raycaster(start,end.clone().sub(start).normalize(),0,start.distanceTo(end));
  assert.equal(ray.intersectObject(eo).length,0,`road support obstruction at ${s}, offset ${offset}, height ${height}`);
 }
 eg.dispose();eo.material.dispose();
});
