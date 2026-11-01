import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import * as THREE from 'three';
import {decodeGrid} from '../src/world/grid.js';
import {CurvePath,RouteGeometry} from '../src/core/geometry.js';
import {Terrain} from '../src/world/surfaces.js';
import {buildTile,endpointContext} from '../src/world/build.js';
import {deriveTrackwork} from '../src/render/trackwork.js';

test('both Jewellery Quarter Metro tracks clear the terrain and the shared tunnel mouth',()=>{
 const data=decodeGrid(JSON.parse(readFileSync('public/data/grid/world.json')).route),route=new RouteGeometry(data),terrain=new Terrain(data.terrain,new Uint16Array(Uint8Array.from(readFileSync('public/data/grid/terrain.bin')).buffer));
 route.setEndpointContext(endpointContext(route));data.trackwork=deriveTrackwork(route).switches;
 const result=buildTile(decodeGrid(JSON.parse(readFileSync('public/data/grid/tiles/6_-8.json'))),route,terrain),mesh=result.mesh,triangles=[];
 for(let i=0;i<mesh.index.length;i+=3){const ids=[mesh.index[i],mesh.index[i+1],mesh.index[i+2]],xs=ids.map(n=>mesh.position[n*3]),ys=ids.map(n=>mesh.position[n*3+1]),zs=ids.map(n=>mesh.position[n*3+2]);if(Math.max(...xs)<6014||Math.min(...xs)>6037||Math.max(...zs)<-7980||Math.min(...zs)>-7957||Math.max(...ys)<119||Math.min(...ys)>124)continue;for(const n of ids)triangles.push(mesh.position[n*3],mesh.position[n*3+1],mesh.position[n*3+2]);}
 const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(triangles,3));const object=new THREE.Mesh(geometry,new THREE.MeshBasicMaterial({side:THREE.DoubleSide}));
 for(const id of ['osm/31545005','osm/171828711']){
  const path=new CurvePath(data.adjacentServices.find(s=>s.id===id).points),start=id==='osm/31545005'?0:path.length-12,end=id==='osm/31545005'?12:path.length-2;
  for(let s=start;s<=end;s+=2)for(const offset of [-.9,0,.9])for(const height of [1.2,2.45,3.9]){
   const a=path.sample(s),b=path.sample(s+2),from=new THREE.Vector3(a.position[0]+a.right[0]*offset,a.position[1]+height,a.position[2]+a.right[2]*offset),to=new THREE.Vector3(b.position[0]+b.right[0]*offset,b.position[1]+height,b.position[2]+b.right[2]*offset),ray=new THREE.Raycaster(from,to.clone().sub(from).normalize(),0,from.distanceTo(to));
   assert.equal(ray.intersectObject(object).length,0,`${id} tunnel obstruction at ${s}, offset ${offset}, height ${height}`);
  }
 }
 geometry.dispose();object.material.dispose();
});
