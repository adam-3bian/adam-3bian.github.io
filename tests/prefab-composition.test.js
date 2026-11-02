import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {GRID,position} from '../src/world/grid.js';
import {GridWorld} from '../src/world/grid-world.js';
import {ConstructionTerrain} from '../src/world/terrain-grid.js';
import {resolveComposition,verticalProfile} from '../src/world/prefab-composition.js';
import {composePrefabChunk} from '../src/render/prefab-assets.js';
import {matchingPorts} from '../src/world/piece-registry.js';
import {PieceGraph} from '../src/world/piece-graph.js';
import {buildTile} from '../src/world/build.js';
const read=p=>JSON.parse(readFileSync(p)),manifest=read('public/data/grid/scenes/kidderminster/world.json'),catalogue=read(`public/${manifest.catalogue.url}`),enums=read(`public/${manifest.enums.url}`);
const original=manifest.tiles.map(t=>read(`public/${t.url}`)),copy=()=>structuredClone(original);
const resolve=chunks=>resolveComposition(chunks,catalogue,enums);
const reindex=chunks=>{const w=resolveComposition(chunks,catalogue,enums,{validateIndex:false});for(const c of chunks){for(const i of c.instances)i.occupancy=w.instances.get(i.id).cells;for(const t of c.terrain)t.instances=[...(w.occupancy.get(`${t.x},${t.z}`)||[])].sort();}return chunks;};
const packets=chunks=>chunks.map(c=>composePrefabChunk(c,catalogue,enums,chunks));
const hash=packet=>{const h=createHash('sha256');for(const [key,v] of Object.entries(packet.mesh))h.update(key).update(new Uint8Array(v.buffer));return h.digest('hex');};
const instance=(cs,id)=>cs.flatMap(c=>c.instances).find(i=>i.id===id);

test('JSON scene composes through the existing tile builder and reconstructs identically in either chunk order',()=>{
 const cs=copy(),before=packets(cs),restored=packets(JSON.parse(JSON.stringify(cs)).reverse()).reverse();
 assert.deepEqual(before.map(hash),restored.map(hash));
 const workerPacket=buildTile({...cs[0],compositionSchema:1,catalogue,enums,context:cs});assert.equal(hash(workerPacket),hash(before[0]));
 assert.equal(before.flatMap(p=>p.placements).length,24);assert.equal(resolve(cs).terrain.cells.size,192);
 assert.equal(before.flatMap(p=>p.placements).filter(p=>p.id==='warehouse-1').length,1);
 const w=resolve(cs);assert.ok(w.instances.get('warehouse-1').cells.some(c=>w.terrain.cells.get(c).x>=-1010));
 assert.equal(w.paths.get('rail-curve').length,80*Math.PI/2);
 assert.ok(before.every(p=>p.mesh.position.every(Number.isFinite)));
});
test('a JSON corner edit changes both actual mesh vertices and the shared support query',()=>{
 const cs=copy(),before=packets(cs),target=cs[1].terrain.at(-1),x=target.x,z=target.z,old=resolve(cs).terrain.raw(x*16,z*16);
 for(const c of cs.flatMap(c=>c.terrain)){
  const corners=[[c.x,c.z],[c.x+1,c.z],[c.x+1,c.z+1],[c.x,c.z+1]],heights=c.cornerTicks.map(v=>c.baseHeightTicks+v);
  corners.forEach((p,i)=>{if(p[0]===x&&p[1]===z)heights[i]+=2;});c.baseHeightTicks=Math.min(...heights);c.cornerTicks=heights.map(v=>v-c.baseHeightTicks);c.slopeShape=c.cornerTicks.some(Boolean)?'CUSTOM_CORNER_HEIGHTS':'FLAT';
 }
 assert.equal(resolve(cs).terrain.raw(x*16,z*16),old+2*GRID.heightStep);assert.notEqual(hash(packets(cs)[1]),hash(before[1]));
});
test('swapping a prefab changes the rendered model; moving its JSON anchor changes the actual mesh',()=>{
 const cs=copy(),before=packets(cs)[0];instance(cs,'house-1').prefabId='building/uk/brick-cottage';assert.notEqual(hash(packets(cs)[0]),hash(before));
 const originalPacket=packets(cs)[0];instance(cs,'house-1').anchor[0]+=400;reindex(cs);const moved=packets(cs)[0];
 assert.notEqual(hash(moved),hash(originalPacket));assert.equal(moved.placements.find(p=>p.id==='house-1').position[0]-originalPacket.placements.find(p=>p.id==='house-1').position[0],4);
});
test('quarter rotation changes geometry and ports, while source-connected full sections snap exactly',()=>{
 const w=resolve(copy()),a=w.paths.get('rail-0').item.ports[1],b=w.paths.get('rail-1').item.ports[0];assert.ok(matchingPorts(a,b,1-1e-12));
 const cs=copy();for(const c of cs)c.instances=c.instances.filter(i=>i.id==='rail-0');for(const c of cs)c.crossings=[];
 reindex(cs);const before=packets(cs)[0];const rail=instance(cs,'rail-0');rail.rotation=1;reindex(cs);const after=resolve(cs).paths.get('rail-0');
 assert.notEqual(hash(before),hash(packets(cs)[0]));assert.deepEqual(position(after.item.ports[1].anchor),[position(rail.anchor)[0],58.5,position(rail.anchor)[2]+16]);
});
test('road junction routes require explicit switch selection; the elevated crossing is disconnected',()=>{
 const w=resolve(copy()),graph=new PieceGraph(w.pieces),rail=w.paths.get('rail-2').item,road=w.paths.get('bridge-road-1').item;
 for(const [id,path] of w.paths)for(let s=0;s<path.length;s+=.7)assert.deepEqual(graph.pieces.get(id).path.sample(s).position,path.sample(s).position);
 assert.ok(rail.ports.every(a=>road.ports.every(b=>!matchingPorts(a,b))));assert.equal(graph.next('rail-2',1).piece,'rail-3');
 const arm='junction-1/arm/0';assert.equal(graph.travel(arm,7,4).stopped,true);graph.setSwitch('road','junction-1/centre',[arm,'junction-1/arm/1']);
 assert.equal(graph.travel(arm,7,4).piece,'junction-1/arm/1');
});
test('malformed terrain, unimplemented shapes, missing assets, duplicate owners and floating supports fail closed',()=>{
 for(const [change,pattern] of [
  [cs=>cs[0].terrain.pop(),/terrain coverage/],
  [cs=>cs[0].terrain[0].cornerTicks[1]++,/shared corner/],
  [cs=>cs[0].terrain[0].slopeShape='RETAINED_STEP',/slope shape/],
  [cs=>instance(cs,'house-1').prefabId='building/missing',/missing prefab/],
  [cs=>cs[1].instances.push(structuredClone(instance(cs,'warehouse-1'))),/duplicate canonical/],
  [cs=>instance(cs,'house-1').foundation.bottomTicks+=32,/foundation/],
  [cs=>instance(cs,'tree-0').anchor[1]+=1,/root/],
  [cs=>instance(cs,'bridge-1').supports[0].bottomTicks+=1,/bearing/],
  [cs=>cs[0].crossings[0].minimumClearance=8,/clearance/],
  [cs=>instance(cs,'rail-1').nodes[0]='grade-middle',/inconsistent node/],
 ]) {const cs=copy();change(cs);assert.throws(()=>resolve(cs),pattern);}
});
test('continuous profile validation detects hidden interior peaks and disallows half slopes or mislabelled grades',()=>{
 const cap={maximum:.025,transitionPerTile:1};
 assert.throws(()=>verticalProfile({state:'FULL_TILE_UPHILL',riseTicks:10,startGrade:0,endGrade:0},16,cap,'peak'),/interior gradient/);
 assert.throws(()=>verticalProfile({state:'FULL_TILE_DOWNHILL',riseTicks:-1,startGrade:0,endGrade:0},8,cap,'half'),/complete construction/);
 assert.throws(()=>verticalProfile({state:'LEVEL',riseTicks:0,startGrade:.01,endGrade:-.01},16,cap,'hump'),/grade ownership/);
 assert.throws(()=>verticalProfile({state:'FULL_TILE_UPHILL',riseTicks:4,startGrade:0,endGrade:0},16,{maximum:.025,transitionPerTile:.005},'jerk'),/transition/);
 for(const p of resolve(copy()).paths.values())for(let s=0;s<=p.length;s+=.1)assert.ok(Math.abs(p.sample(s).grade)<=.025);
});
test('terrain support interpolation is the same piecewise plane as the rendered triangles',()=>{
 const c={x:-1,z:-1,baseHeightTicks:32,cornerTicks:[0,2,6,3]},t=new ConstructionTerrain([c]);
 assert.equal(t.raw(-12,-4),1+(0.25*(6-3)+0.75*3)/32);assert.equal(t.raw(0,0),38/32);
 assert.throws(()=>t.raw(1,1),/missing support/);
});
test('the same chunk loader verifies hashes, reports missing files, retries and restores a full offline snapshot',async()=>{
 const previous=globalThis.fetch;let failures=1,requests=0;
 globalThis.fetch=async url=>{requests++;const path=new URL(url).pathname.replace('/nested/','public/');if(path.endsWith('kid-east.json')&&failures-->0)return new Response('',{status:503});try{return new Response(readFileSync(path));}catch{return new Response('',{status:404});}};
 try{
  const w=await GridWorld.loadComposition('http://local/nested/');await assert.rejects(w.tile('kid-west'),/HTTP 503/);assert.equal(w.pending.size,0);
  const c=await w.tile('kid-west');const actual=buildTile(c);const saved=await w.snapshot();assert.equal(Object.keys(saved.tiles).length,2);
  globalThis.fetch=async()=>{throw Error('network forbidden')};const restored=await GridWorld.loadComposition('http://local/nested/',structuredClone(saved));assert.equal(hash(buildTile(await restored.tile('kid-west'))),hash(actual));assert.ok(requests>=6);
 }finally{globalThis.fetch=previous;}
});
test('the legacy importer refuses an implicit overwrite of the authoritative world',()=>{
 const before=createHash('sha256').update(readFileSync('public/data/grid/world.json')).digest('hex'),r=spawnSync(process.execPath,['scripts/build-grid-world.js'],{encoding:'utf8'});
 assert.notEqual(r.status,0);assert.match(r.stderr,/requires --output/);assert.equal(createHash('sha256').update(readFileSync('public/data/grid/world.json')).digest('hex'),before);
});
