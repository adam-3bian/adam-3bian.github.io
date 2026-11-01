import test from 'node:test';
import assert from 'node:assert/strict';
import {RailwayRenderer} from '../src/render/renderer';

test('failed tile jobs clear their request and retry while stationary, then stop with an identified error', () => {
  const previous=(globalThis as any).window;
  const scheduled:Array<()=>void>=[];
  (globalThis as any).window={setTimeout:(fn:()=>void)=>{scheduled.push(fn);return scheduled.length;},clearTimeout:()=>{}};
  try {
    const errors:Error[]=[];
    let refreshes=0;
    const renderer:any={requested:new Set(['tile-1']),requestTokens:new Map([['tile-1',1]]),requestTimers:new Map(),requestAborts:new Map(),tileRetries:new Map(),failures:[],disposed:false,
      onError:(error:Error)=>errors.push(error),updateTiles:(force:boolean)=>{assert.equal(force,true);refreshes++;}};
    renderer.tileFailed=(RailwayRenderer.prototype as any).tileFailed;
    renderer.clearRequest=(RailwayRenderer.prototype as any).clearRequest;
    const onWorker=(RailwayRenderer.prototype as any).onWorker;
    onWorker.call(renderer,{type:'error',id:'tile-1',token:1,message:'temporary failure'});
    assert.equal(renderer.requested.has('tile-1'),false);
    assert.equal(renderer.tileRetries.get('tile-1').attempts,1);
    assert.equal(errors.length,0);
    assert.equal(scheduled.length,1);
    scheduled.shift()!();
    assert.equal(refreshes,2);
    for(let i=0;i<3;i++){renderer.requestTokens.set('tile-1',i+2);renderer.requested.add('tile-1');onWorker.call(renderer,{type:'error',id:'tile-1',token:i+2,message:'temporary failure'});}
    assert.equal(errors.length,1);
    assert.match(errors[0].message,/tile-1.*4 attempts.*temporary failure/);
    assert.equal(renderer.tileRetries.get('tile-1').attempts,4);
    renderer.disposed=true;
    for(const callback of scheduled)callback();
    assert.equal(refreshes,4);
  } finally {
    if(previous===undefined)delete (globalThis as any).window;else (globalThis as any).window=previous;
  }
});

test('worker packets without geometry enter the same retry path',()=>{
  const calls:Array<[string,string]>=[];
  const renderer:any={requestTokens:new Map([['tile-2',2]]),tileFailed:(id:string,reason:string)=>calls.push([id,reason])};
  (RailwayRenderer.prototype as any).onWorker.call(renderer,{type:'tile',id:'tile-2',token:2});
  assert.deepEqual(calls,[['tile-2','Worker returned no geometry']]);
});

test('malformed geometry enters retry rather than attaching a broken tile',()=>{
  const calls:Array<[string,string]>=[];
  const renderer:any={requestTokens:new Map([['tile-3',3]]),tileFailed:(id:string,reason:string)=>calls.push([id,reason])};
  (RailwayRenderer.prototype as any).onWorker.call(renderer,{type:'tile',id:'tile-3',token:3,mesh:{position:new Float32Array([0,0,0])}});
  assert.deepEqual(calls,[['tile-3','Worker returned malformed geometry']]);
});

test('stale and unsolicited worker results cannot replace a current tile or fail its request',()=>{
  const calls:string[]=[];const renderer:any={requestTokens:new Map([['tile-1',8]]),tileFailed:()=>calls.push('failed')};
  const onWorker=(RailwayRenderer.prototype as any).onWorker;
  onWorker.call(renderer,{type:'error',id:'tile-1',token:7,message:'late'});
  onWorker.call(renderer,{type:'tile',id:'tile-1',token:7});
  onWorker.call(renderer,{type:'tile',id:'unknown',token:8});
  onWorker.call(renderer,{type:'tile',token:8});
  assert.deepEqual(calls,[]);assert.equal(renderer.requestTokens.get('tile-1'),8);
});

test('a crashed worker is replaced and its outstanding job is failed before reinitialisation',()=>{
  const calls:string[]=[];const replacement={};const renderer:any={ready:true,worker:{terminate:()=>calls.push('terminate')},requested:new Set(['tile-1']),workerFailures:0,terrainSource:new ArrayBuffer(2),
    tileFailed:(id:string,reason:string)=>calls.push(`${id}: ${reason}`),createWorker:()=>{calls.push('create');return replacement;},initialiseWorker:()=>calls.push('initialise'),failures:[]};
  (RailwayRenderer.prototype as any).restartWorker.call(renderer,'worker crashed');
  assert.equal(renderer.ready,false);assert.equal(renderer.worker,replacement);
  assert.deepEqual(calls,['terminate','tile-1: worker crashed','create','initialise']);
});

test('a stalled fetch is aborted and enters bounded retry without train movement',async()=>{
  const oldWindow=(globalThis as any).window,oldDocument=(globalThis as any).document,oldFetch=globalThis.fetch;
  const timers:{fn:()=>void;ms:number}[]=[];
  (globalThis as any).window={setTimeout:(fn:()=>void,ms:number)=>{timers.push({fn,ms});return timers.length;},clearTimeout:()=>{}};
  (globalThis as any).document={baseURI:'http://localhost/'};
  (globalThis as any).fetch=(_url:string,options:{signal:AbortSignal})=>new Promise((_resolve,reject)=>options.signal.addEventListener('abort',()=>reject(new Error('fetch timed out'))));
  try{
    let refreshes=0;const renderer:any={ready:true,sim:{player:{s:0}},route:{sample:()=>({position:[0,0,0]})},quality:'low',data:{tiles:[{id:'stall',url:'data/stall.json',bounds:[-1,-1,1,1]}]},
      loaded:new Map(),requested:new Set(),requestTokens:new Map(),requestTimers:new Map(),requestAborts:new Map(),nextRequestToken:0,tileRetries:new Map(),failures:[],disposed:false,
      evictInactiveTiles:()=>{},updateTiles:()=>{refreshes++;}};
    renderer.clearRequest=(RailwayRenderer.prototype as any).clearRequest;renderer.tileFailed=(RailwayRenderer.prototype as any).tileFailed;
    const pending=(RailwayRenderer.prototype as any).updateTiles.call(renderer,true);assert.equal(renderer.requested.has('stall'),true);
    timers.find(t=>t.ms===30000)!.fn();await pending;
    assert.equal(renderer.requested.has('stall'),false);assert.equal(renderer.tileRetries.get('stall').attempts,1);assert.ok(refreshes>0);
  }finally{if(oldWindow===undefined)delete (globalThis as any).window;else (globalThis as any).window=oldWindow;if(oldDocument===undefined)delete (globalThis as any).document;else (globalThis as any).document=oldDocument;globalThis.fetch=oldFetch;}
});

test('a stalled tile build restarts the worker and ignores its later token',async()=>{
  const oldWindow=(globalThis as any).window,oldDocument=(globalThis as any).document,oldFetch=globalThis.fetch;
  const timers:{fn:()=>void;ms:number}[]=[];(globalThis as any).window={setTimeout:(fn:()=>void,ms:number)=>{timers.push({fn,ms});return timers.length;},clearTimeout:()=>{}};
  (globalThis as any).document={baseURI:'http://localhost/'};(globalThis as any).fetch=async()=>({ok:true,json:async()=>({id:'stalled-build'})});
  try{
    const sent:any[]=[],restarts:string[]=[];const renderer:any={ready:true,sim:{player:{s:0}},route:{sample:()=>({position:[0,0,0]})},quality:'low',data:{tiles:[{id:'stalled-build',url:'data/stall.json',bounds:[-1,-1,1,1]}]},
      loaded:new Map(),requested:new Set(),requestTokens:new Map(),requestTimers:new Map(),requestAborts:new Map(),nextRequestToken:0,tileRetries:new Map(),worker:{postMessage:(m:any)=>sent.push(m)},evictInactiveTiles:()=>{},restartWorker:(reason:string)=>restarts.push(reason)};
    await (RailwayRenderer.prototype as any).updateTiles.call(renderer,true);assert.equal(sent.length,1);assert.equal(sent[0].token,1);
    timers.find(t=>t.ms===90000)!.fn();assert.match(restarts[0],/stalled-build.*timed out/);
    renderer.requestTokens.set('stalled-build',2);timers.find(t=>t.ms===90000)!.fn();assert.equal(restarts.length,1,'an obsolete timer must not restart a new request');
  }finally{if(oldWindow===undefined)delete (globalThis as any).window;else (globalThis as any).window=oldWindow;if(oldDocument===undefined)delete (globalThis as any).document;else (globalThis as any).document=oldDocument;globalThis.fetch=oldFetch;}
});
