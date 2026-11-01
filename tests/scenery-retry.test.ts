import test from 'node:test';
import assert from 'node:assert/strict';
import {RailwayRenderer} from '../src/render/renderer';

test('failed tile jobs clear their request and retry while stationary, then stop with an identified error', () => {
  const previous=(globalThis as any).window;
  const scheduled:Array<()=>void>=[];
  (globalThis as any).window={setTimeout:(fn:()=>void)=>{scheduled.push(fn);return scheduled.length;}};
  try {
    const errors:Error[]=[];
    let refreshes=0;
    const renderer:any={requested:new Set(['tile-1']),tileRetries:new Map(),failures:[],disposed:false,
      onError:(error:Error)=>errors.push(error),updateTiles:(force:boolean)=>{assert.equal(force,true);refreshes++;}};
    renderer.tileFailed=(RailwayRenderer.prototype as any).tileFailed;
    const onWorker=(RailwayRenderer.prototype as any).onWorker;
    onWorker.call(renderer,{type:'error',id:'tile-1',message:'temporary failure'});
    assert.equal(renderer.requested.has('tile-1'),false);
    assert.equal(renderer.tileRetries.get('tile-1').attempts,1);
    assert.equal(errors.length,0);
    assert.equal(scheduled.length,1);
    scheduled.shift()!();
    assert.equal(refreshes,1);
    for(let i=0;i<3;i++)onWorker.call(renderer,{type:'error',id:'tile-1',message:'temporary failure'});
    assert.equal(errors.length,1);
    assert.match(errors[0].message,/tile-1.*4 attempts.*temporary failure/);
    assert.equal(renderer.tileRetries.get('tile-1').attempts,4);
    renderer.disposed=true;
    for(const callback of scheduled)callback();
    assert.equal(refreshes,1);
  } finally {
    if(previous===undefined)delete (globalThis as any).window;else (globalThis as any).window=previous;
  }
});

test('worker packets without geometry enter the same retry path',()=>{
  const calls:Array<[string,string]>=[];
  const renderer:any={tileFailed:(id:string,reason:string)=>calls.push([id,reason])};
  (RailwayRenderer.prototype as any).onWorker.call(renderer,{type:'tile',id:'tile-2'});
  assert.deepEqual(calls,[['tile-2','Worker returned no geometry']]);
});
