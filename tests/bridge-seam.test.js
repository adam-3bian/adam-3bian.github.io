import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import * as THREE from 'three';
import {decodeGrid} from '../src/world/grid.js';
import {RouteGeometry} from '../src/core/geometry.js';
import {Terrain} from '../src/world/surfaces.js';
import {buildTile,endpointContext} from '../src/world/build.js';
import {deriveTrackwork} from '../src/render/trackwork.js';

test('Tyseley road bridge has no abutment at the tile seam through the railway',()=>{
 const d=decodeGrid(JSON.parse(readFileSync('public/data/grid/world.json')).route),pieces=d.surfaceRoads.filter(r=>r.id.startsWith('way/8068165/0/tile/'));
 assert.equal(pieces.length,2);assert.equal(pieces[0].connectionNodes[1],pieces[1].connectionNodes[0]);assert.match(pieces[0].connectionNodes[1],/^seam\//);
 const route=new RouteGeometry(d),terrain=new Terrain(d.terrain,new Uint16Array(Uint8Array.from(readFileSync('public/data/grid/terrain.bin')).buffer));route.setEndpointContext(endpointContext(route));d.trackwork=deriveTrackwork(route).switches;
 const tile=decodeGrid(JSON.parse(readFileSync('public/data/grid/tiles/11_-5.json'))),result=buildTile(tile,route,terrain),mesh=result.mesh,triangles=[];
 assert.ok(result.placements.some(p=>p.id==='way/8068165/0/tile/1/deck'&&p.family==='road-bridge'));
 for(let i=0;i<mesh.index.length;i+=3){const ids=[mesh.index[i],mesh.index[i+1],mesh.index[i+2]],xs=ids.map(n=>mesh.position[n*3]),ys=ids.map(n=>mesh.position[n*3+1]),zs=ids.map(n=>mesh.position[n*3+2]);if(Math.max(...xs)<11074||Math.min(...xs)>11094||Math.max(...zs)<-4010||Math.min(...zs)>-3994||Math.max(...ys)<121.5||Math.min(...ys)>127)continue;for(const n of ids)triangles.push(mesh.position[n*3],mesh.position[n*3+1],mesh.position[n*3+2]);}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(triangles,3));const object=new THREE.Mesh(g,new THREE.MeshBasicMaterial({side:THREE.DoubleSide}));
 for(let s=35976;s<=35990;s+=2)for(const offset of [-.9,0,.9])for(const height of [1.2,2.45,3.9]){
  const a=route.lanePose(s,4.2),b=route.lanePose(s+2,4.2),start=new THREE.Vector3(a.position[0]+a.right[0]*offset,a.position[1]+height,a.position[2]+a.right[2]*offset),end=new THREE.Vector3(b.position[0]+b.right[0]*offset,b.position[1]+height,b.position[2]+b.right[2]*offset),ray=new THREE.Raycaster(start,end.clone().sub(start).normalize(),0,start.distanceTo(end));
  assert.equal(ray.intersectObject(object).length,0,`bridge seam obstruction at ${s}, offset ${offset}, height ${height}`);
 }
 g.dispose();object.material.dispose();
});
