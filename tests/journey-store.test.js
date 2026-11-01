import test from 'node:test';
import assert from 'node:assert/strict';
import {indexedDB} from 'fake-indexeddb';
import {JourneyStore} from '../src/core/save.js';

test('saving a different world preserves the previous journey and its complete world',async()=>{
 const oldIndexedDB=globalThis.indexedDB;globalThis.indexedDB=indexedDB;
 const store=new JourneyStore(`journey-fixture-${Date.now()}-${Math.random()}`),old={worldHash:'old-revision',position:123},current={worldHash:'new-revision',position:456},oldWorld={tiles:{old:'old tile'},document:{revision:'old'}},newWorld={tiles:{current:'new tile'},document:{revision:'new'}};
 try{
  await store.put(old,oldWorld);await store.put(current,newWorld);
  assert.deepEqual(await store.get(),current);assert.deepEqual(await store.getWorld('old-revision'),oldWorld);assert.deepEqual(await store.getWorld('new-revision'),newWorld);
  const backups=await store.getBackups();assert.equal(backups.length,1);assert.deepEqual(backups[0].snapshot,old);
  await store.put({...current,position:789});assert.equal((await store.getBackups()).length,1);assert.equal((await store.get()).position,789);
 }finally{globalThis.indexedDB=oldIndexedDB;}
});

test('a failed world save leaves the existing journey and world intact',async()=>{
 const oldIndexedDB=globalThis.indexedDB;globalThis.indexedDB=indexedDB;const store=new JourneyStore(`journey-failure-${Date.now()}-${Math.random()}`),old={worldHash:'old',position:25};
 try{await store.put(old,{marker:'old-world'});await assert.rejects(store.put({worldHash:'new'},{notCloneable:()=>{}}));assert.deepEqual(await store.get(),old);assert.deepEqual(await store.getWorld('old'),{marker:'old-world'});assert.deepEqual(await store.getBackups(),[]);}
 finally{globalThis.indexedDB=oldIndexedDB;}
});
