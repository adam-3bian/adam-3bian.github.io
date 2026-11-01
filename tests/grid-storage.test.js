import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {GRID,encodeGrid} from '../src/world/grid.js';
import {GridWorld} from '../src/world/grid-world.js';
test('complete world saves retain compact verified tiles and decode them only on demand',async()=>{
 const encoded=encodeGrid({id:'0_0',position:[16.12,40.25,-3.5]}),text=JSON.stringify(encoded),sha=createHash('sha256').update(text).digest('hex');
 const document={schema:1,grid:GRID,revision:'fixture',route:{terrain:{url:'terrain.bin'}},tiles:[{id:'0_0',url:'data/grid/0_0.json',sha256:sha}]},original=globalThis.fetch;
 let requests=0;globalThis.fetch=async()=>{requests++;await new Promise(resolve=>setTimeout(resolve,5));return new Response(text);};
 try{
  const world=new GridWorld(document,new ArrayBuffer(4),'https://example.test/'),[first,second]=await Promise.all([world.tile('0_0'),world.tile('0_0')]);
  assert.deepEqual(first,second);assert.deepEqual(first.position,[16.12,40.25,-3.5]);assert.equal(requests,1);
  const saved=await world.snapshot();assert.equal(typeof saved.tiles['0_0'],'string');assert.equal(saved.tiles['0_0'],text);
  const restored=new GridWorld(document,saved.terrain,'https://example.test/',saved);assert.deepEqual(await restored.tile('0_0'),first);assert.equal(requests,1);
  const previous=new GridWorld(document,saved.terrain,'https://example.test/',{tiles:{'0_0':encoded}});assert.deepEqual(await previous.tile('0_0'),first);
 }finally{globalThis.fetch=original;}
});
