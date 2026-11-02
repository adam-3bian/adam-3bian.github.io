import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {indexedDB} from 'fake-indexeddb';
import {canUseSavedWorld,mayUsePreviousWorld,reconcileSavedJourney} from '../src/core/save-compatibility.js';
import {JourneyStore} from '../src/core/save.js';
import {decodeGrid} from '../src/world/grid.js';
import {RouteGeometry} from '../src/core/geometry.js';
import {RailwaySimulation} from '../src/core/simulation.js';
import {Terrain} from '../src/world/surfaces.js';

const oldHash='75d16f9946ad6043c5ec6828e460c6db9f589513f7da46f6ad9d4396806fcc30',oldRevision='a972112cc7694560042b4ee0f85b3fd92ecf55613803f17b5207fc876e086ec4',newHash='new-build';
test('the previous compatible world resumes and the original save remains backed up',async()=>{
 const doc=JSON.parse(readFileSync('public/data/grid/world.json')),data=decodeGrid(doc.route),route=new RouteGeometry(data),terrainBytes=Uint8Array.from(readFileSync('public/data/grid/terrain.bin')).buffer,terrain=new Terrain(data.terrain,new Uint16Array(terrainBytes));
 data.worldHash=oldHash;const old=new RailwaySimulation(route);old.configureRoadNetwork(data.surfaceRoads,terrain);old.player.s=1234;const snapshot=old.snapshot();
 const oldDocument={...doc,revision:oldRevision},world={document:oldDocument,terrain:terrainBytes,tiles:{}};assert.equal(canUseSavedWorld(snapshot,world),true);assert.equal(mayUsePreviousWorld(snapshot),true);
 const upgraded=reconcileSavedJourney(snapshot,oldDocument,route.fingerprint,newHash);assert.equal(snapshot.worldHash,oldHash);assert.equal(upgraded.worldHash,newHash);
 data.worldHash=newHash;const next=new RailwaySimulation(route);next.configureRoadNetwork(data.surfaceRoads,terrain);next.restore(upgraded);assert.equal(next.player.s,1234);assert.equal(next.roadTraffic.cars.size,old.roadTraffic.cars.size);
 const before=globalThis.indexedDB;globalThis.indexedDB=indexedDB;
 try{
  const store=new JourneyStore(`compatible-${Date.now()}-${Math.random()}`);await store.put(snapshot,world);await store.put({...upgraded,marker:'old journey'},world);
  assert.equal((await store.get()).worldHash,newHash);assert.equal((await store.getBackups())[0].snapshot.worldHash,oldHash);assert.equal((await store.getWorld(oldHash)).document.revision,oldRevision);assert.equal((await store.getWorld(newHash)).document.revision,oldRevision);
  const freshWorld={...world,document:{...oldDocument,revision:'fresh'}};await store.put({...upgraded,marker:'new journey'},freshWorld);
  const key=`backup/${newHash}/${oldRevision}`,backups=await store.getBackups();
  assert.equal((await store.get()).marker,'new journey');assert.equal(backups.find(item=>item.key===key).snapshot.marker,'old journey');assert.equal((await store.getWorld(key)).document.revision,oldRevision);assert.equal((await store.getWorld(newHash)).document.revision,'fresh');
 }
 finally{globalThis.indexedDB=before;}
});
test('unknown or changed layouts cannot be silently migrated',()=>{
 const doc={...JSON.parse(readFileSync('public/data/grid/world.json')),revision:oldRevision},old={version:2,worldHash:oldHash,routeFingerprint:'same'};
 assert.equal(mayUsePreviousWorld({...old,worldHash:'unknown'}),false);
 assert.equal(canUseSavedWorld(old,{document:{...doc,revision:'changed'},terrain:new ArrayBuffer(1),tiles:{}}),false);
 assert.throws(()=>reconcileSavedJourney(old,{...doc,revision:'changed'},'same',newHash),/different railway layout/);
 assert.throws(()=>reconcileSavedJourney(old,doc,'different',newHash),/different railway layout/);
 assert.throws(()=>reconcileSavedJourney({...old,worldHash:'unknown'},doc,'same',newHash),/different railway layout/);
});
