import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import * as THREE from 'three';
import {decodeGrid} from '../src/world/grid.js';
import {RouteGeometry} from '../src/core/geometry.js';
import {Terrain} from '../src/world/surfaces.js';
import {buildTile,endpointContext,tunnelFoundationFragments} from '../src/world/build.js';
import {deriveTrackwork} from '../src/render/trackwork.js';

test('a tunnel opening preserves the rest of a building foundation',()=>{
 const footprint=[[-5,-5],[5,-5],[5,5],[-5,5]],cut={polygon:[[-1,-8],[1,-8],[1,8],[-1,8]],roof:4},parts=tunnelFoundationFragments(footprint,0,10,[cut]);
 const area=points=>Math.abs(points.reduce((sum,p,i)=>{const q=points[(i+1)%points.length];return sum+p[0]*q[2]-q[0]*p[2];},0))/2;
 assert.ok(parts);assert.equal(parts.reduce((sum,p)=>sum+area(p.points),0),100);
 assert.equal(parts.filter(p=>p.floor===4).reduce((sum,p)=>sum+area(p.points),0),20);
 assert.equal(parts.filter(p=>p.floor===0).reduce((sum,p)=>sum+area(p.points),0),80);
 assert.equal(tunnelFoundationFragments(footprint,0,10,[]),undefined);
});
test('Great Western Arcade foundations leave the Snow Hill tunnel clear',()=>{
 const document=JSON.parse(readFileSync('public/data/grid/world.json')),data=decodeGrid(document.route),route=new RouteGeometry(data);
 route.setEndpointContext(endpointContext(route));data.trackwork=deriveTrackwork(route).switches;
 const terrain=new Terrain(data.terrain,new Uint16Array(Uint8Array.from(readFileSync('public/data/grid/terrain.bin')).buffer)),tile=decodeGrid(JSON.parse(readFileSync('public/data/grid/tiles/7_-8.json'))),built=buildTile(tile,route,terrain);
 for(const id of ['way/24712366','way/144379352'])assert.equal(built.placements.find(p=>p.id===id)?.foundationStyle,'tunnel-relieved plinth');
 const st=route.stations.find(s=>s.id==='BSW'),positions=built.mesh.position,indices=built.mesh.index,ray=new THREE.Ray(),a=new THREE.Vector3(),b=new THREE.Vector3(),c=new THREE.Vector3(),hit=new THREE.Vector3(),direction=new THREE.Vector3();
 for(const offsetS of [216,236])for(const lane of [0,4.2])for(const side of [-.9,0,.9]){
  const point=s=>{const p=route.lanePose(s,lane);return new THREE.Vector3(p.position[0]+p.right[0]*side,p.position[1]+3.9,p.position[2]+p.right[2]*side);};
  const start=point(st.s+offsetS),end=point(st.s+offsetS+4),length=direction.copy(end).sub(start).length();ray.origin.copy(start);ray.direction.copy(direction).normalize();
  for(let i=0;i<indices.length;i+=3){
   a.fromArray(positions,indices[i]*3);b.fromArray(positions,indices[i+1]*3);c.fromArray(positions,indices[i+2]*3);
   if(Math.max(a.x,b.x,c.x)<Math.min(start.x,end.x)||Math.min(a.x,b.x,c.x)>Math.max(start.x,end.x)||Math.max(a.z,b.z,c.z)<Math.min(start.z,end.z)||Math.min(a.z,b.z,c.z)>Math.max(start.z,end.z)||Math.max(a.y,b.y,c.y)<Math.min(start.y,end.y)||Math.min(a.y,b.y,c.y)>Math.max(start.y,end.y))continue;
   assert.ok(!ray.intersectTriangle(a,b,c,false,hit)||hit.distanceTo(start)>length+.001,`Tunnel obstruction at ${offsetS}, lane ${lane}, offset ${side}`);
  }
 }
});
