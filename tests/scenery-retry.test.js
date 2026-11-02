import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { AssetFactory } from '../src/render/assets.js';
import { RailwayRenderer } from '../src/render/renderer.js';
test('light scenery discards only inactive tiles when its cache reaches the limit',()=>{
    const loaded=new Map(),disposed=[],removed=[];
    for(let i=0;i<13;i++){const id=`tile-${i}`,mesh={geometry:{index:{count:3},dispose:()=>disposed.push(`${id}/geometry`)},material:{dispose:()=>disposed.push(`${id}/material`)}};loaded.set(id,{mesh,used:i});}
    const renderer={quality:'low',loaded,requested:new Set(),triangles:13,scene:{remove:mesh=>removed.push(mesh)}};
    RailwayRenderer.prototype.evictInactiveTiles.call(renderer,new Set(['tile-0','tile-1']));
    assert.equal(loaded.size,9);assert.ok(loaded.has('tile-0')&&loaded.has('tile-1'));assert.equal(removed.length,4);assert.equal(disposed.length,8);assert.equal(renderer.triangles,9);
});
test('evicted scenery removes pedestrians only after their final owning tile is gone',()=>{
    const loaded=new Map(),removed=[];
    for(let i=0;i<13;i++){const mesh={geometry:{index:{count:3},dispose(){}},material:{dispose(){}}};loaded.set(`tile-${i}`,{mesh,used:i,walkers:i===2?['shared','orphan']:[]});}
    const shared={model:{id:'shared'},tiles:new Set(['tile-0','tile-2'])},orphan={model:{id:'orphan'},tiles:new Set(['tile-2'])};
    const renderer={quality:'low',loaded,requested:new Set(),triangles:13,walkers:new Map([['shared',shared],['orphan',orphan]]),scene:{remove:mesh=>removed.push(mesh)}};
    RailwayRenderer.prototype.evictInactiveTiles.call(renderer,new Set(['tile-0','tile-1']));
    assert.equal(renderer.walkers.has('orphan'),false);assert.equal(renderer.walkers.get('shared'),shared);assert.deepEqual([...shared.tiles],['tile-0']);assert.ok(removed.includes(orphan.model));assert.ok(!removed.includes(shared.model));
});
test('distant vehicle models are released and recreated without disposing shared meshes',()=>{
    const car={id:'taxi-1',kind:'taxi',position:[0,0,0],yaw:0},scene=new THREE.Scene();
    const renderer={roadTraffic:{cars:new Map([[car.id,car]])},carModels:new Map(),scene,factory:new AssetFactory(),discardRoadModel:RailwayRenderer.prototype.discardRoadModel};
    const update=RailwayRenderer.prototype.updateRoadVehicles;
    update.call(renderer,new THREE.Vector3(0,0,0));const model=renderer.carModels.get(car.id),lettering=model.children.find(child=>child.userData.geometricLettering),shared=model.children.find(child=>!child.userData.geometricLettering);let lettersDisposed=0,sharedDisposed=0;
    lettering.geometry.addEventListener('dispose',()=>lettersDisposed++);shared.geometry.addEventListener('dispose',()=>sharedDisposed++);
    update.call(renderer,new THREE.Vector3(1000,0,0));assert.equal(model.visible,false);assert.equal(renderer.carModels.get(car.id),model);
    update.call(renderer,new THREE.Vector3(1700,0,0));assert.equal(renderer.carModels.size,0);assert.equal(model.parent,null);assert.equal(lettersDisposed,1);assert.equal(sharedDisposed,0);
    update.call(renderer,new THREE.Vector3(0,0,0));assert.equal(renderer.carModels.size,1);assert.notEqual(renderer.carModels.get(car.id),model);
});
test('departure loading reports a failed required tile without waiting for the timeout',async()=>{
    const renderer={updateTiles:()=>{},preparationProgress:()=>({loaded:0,total:1,failed:'required'}),tileRetries:new Map([['required',{attempts:4,reason:'incomplete access assembly'}]])};
    await assert.rejects(RailwayRenderer.prototype.preparePosition.call(renderer),/required.*incomplete access assembly/);
});
test('a slow scenery build keeps loading while its progress advances',async()=>{
    const oldTimer=globalThis.setTimeout,oldPerformance=Object.getOwnPropertyDescriptor(globalThis,'performance'),pending=[];let now=0;
    globalThis.setTimeout=fn=>{pending.push(fn);return pending.length;};Object.defineProperty(globalThis,'performance',{configurable:true,value:{now:()=>now}});
    try{
        const state={loaded:0,total:1,progress:0},renderer={updateTiles:()=>{},preparationProgress:()=>({...state}),tileRetries:new Map()};
        const result=RailwayRenderer.prototype.preparePosition.call(renderer);
        for(const progress of [.25,.5,.75]){now+=89000;state.progress=progress;pending.shift()();}
        now+=89000;state.progress=1;state.loaded=1;pending.shift()();await result;
    }finally{globalThis.setTimeout=oldTimer;if(oldPerformance)Object.defineProperty(globalThis,'performance',oldPerformance);else delete globalThis.performance;}
});
test('a scenery worker that never initialises is restarted, and a ready worker clears its watchdog',()=>{
    const previous=globalThis.window,timers=new Map(),restarts=[];let next=0;
    globalThis.window={setTimeout:(fn,ms)=>{const id=++next;timers.set(id,{fn,ms});return id;},clearTimeout:id=>timers.delete(id)};
    try{
        const worker={postMessage:()=>{}},renderer={worker,ready:false,terrainSource:new ArrayBuffer(2),data:{surfaceRoads:[]},restartWorker:reason=>restarts.push(reason),updateTiles:()=>{}};
        RailwayRenderer.prototype.initialiseWorker.call(renderer);const stalled=timers.get(renderer.initialisationTimer);assert.equal(stalled.ms,90000);stalled.fn();assert.match(restarts[0],/initialisation timed out/);
        RailwayRenderer.prototype.initialiseWorker.call(renderer);const readyTimer=renderer.initialisationTimer;
        RailwayRenderer.prototype.onWorker.call(renderer,{type:'ready'});assert.equal(renderer.ready,true);assert.equal(timers.has(readyTimer),false);assert.equal(renderer.initialisationTimer,undefined);
        stalled.fn();assert.equal(restarts.length,1);
    }finally{if(previous===undefined)delete globalThis.window;else globalThis.window=previous;}
});
test('failed tile jobs clear their request and retry while stationary, then stop with an identified error', () => {
    const previous = globalThis.window;
    const scheduled = [];
    globalThis.window = { setTimeout: (fn) => { scheduled.push(fn); return scheduled.length; }, clearTimeout: () => { } };
    try {
        const errors = [];
        let refreshes = 0;
        const renderer = { requested: new Set(['tile-1']), requestTokens: new Map([['tile-1', 1]]), requestTimers: new Map(), requestAborts: new Map(), tileProgress: new Map(), tileRetries: new Map(), failures: [], disposed: false,
            onError: (error) => errors.push(error), updateTiles: (force) => { assert.equal(force, true); refreshes++; } };
        renderer.tileFailed = RailwayRenderer.prototype.tileFailed;
        renderer.clearRequest = RailwayRenderer.prototype.clearRequest;
        const onWorker = RailwayRenderer.prototype.onWorker;
        onWorker.call(renderer, { type: 'error', id: 'tile-1', token: 1, message: 'temporary failure' });
        assert.equal(renderer.requested.has('tile-1'), false);
        assert.equal(renderer.tileRetries.get('tile-1').attempts, 1);
        assert.equal(errors.length, 0);
        assert.equal(scheduled.length, 1);
        scheduled.shift()();
        assert.equal(refreshes, 2);
        for (let i = 0; i < 3; i++) {
            renderer.requestTokens.set('tile-1', i + 2);
            renderer.requested.add('tile-1');
            onWorker.call(renderer, { type: 'error', id: 'tile-1', token: i + 2, message: 'temporary failure' });
        }
        assert.equal(errors.length, 1);
        assert.match(errors[0].message, /tile-1.*4 attempts.*temporary failure/);
        assert.equal(renderer.tileRetries.get('tile-1').attempts, 4);
        renderer.disposed = true;
        for (const callback of scheduled)
            callback();
        assert.equal(refreshes, 4);
    }
    finally {
        if (previous === undefined)
            delete globalThis.window;
        else
            globalThis.window = previous;
    }
});
test('worker packets without geometry enter the same retry path', () => {
    const calls = [];
    const renderer = { requestTokens: new Map([['tile-2', 2]]), tileFailed: (id, reason) => calls.push([id, reason]) };
    RailwayRenderer.prototype.onWorker.call(renderer, { type: 'tile', id: 'tile-2', token: 2 });
    assert.deepEqual(calls, [['tile-2', 'Worker returned no geometry']]);
});
test('current worker progress refreshes its deadline and stale progress is ignored',()=>{
    const previous=globalThis.window,timers=new Map();let next=0,updates=0;
    globalThis.window={setTimeout:(fn,ms)=>{const id=++next;timers.set(id,{fn,ms});return id;},clearTimeout:id=>timers.delete(id)};
    try{
        const renderer={requestTokens:new Map([['tile',4]]),requestTimers:new Map(),tileProgress:new Map(),onProgress:()=>updates++,restartWorker:()=>{throw Error('unexpected restart')}};
        renderer.refreshTileTimeout=RailwayRenderer.prototype.refreshTileTimeout;
        const receive=RailwayRenderer.prototype.onWorker;
        receive.call(renderer,{type:'progress',id:'tile',token:3,fraction:.9});
        assert.equal(updates,0);assert.equal(timers.size,0);
        receive.call(renderer,{type:'progress',id:'tile',token:4,fraction:.25});
        const first=renderer.requestTimers.get('tile');assert.equal(renderer.tileProgress.get('tile'),.25);assert.equal(updates,1);
        receive.call(renderer,{type:'progress',id:'tile',token:4,fraction:.5});
        assert.equal(renderer.tileProgress.get('tile'),.5);assert.equal(updates,2);assert.equal(timers.size,1);assert.notEqual(renderer.requestTimers.get('tile'),first);
    }finally{if(previous===undefined)delete globalThis.window;else globalThis.window=previous;}
});
test('a new departure cancels an obsolete tile without counting it as a worker failure',()=>{
    const previous=globalThis.window,calls=[];globalThis.window={clearTimeout:()=>{}};
    try{
        const renderer={ready:true,workerFailures:2,requested:new Set(['old']),requestTokens:new Map([['old',7]]),requestTimers:new Map([['old',1]]),requestAborts:new Map(),tileProgress:new Map([['old',.4]]),preparationTileIds:()=>['new'],worker:{terminate:()=>calls.push('terminate')},createWorker:()=>({replacement:true}),initialiseWorker:()=>calls.push('initialise')};
        renderer.clearRequest=RailwayRenderer.prototype.clearRequest;
        RailwayRenderer.prototype.cancelObsoleteTile.call(renderer);
        assert.equal(renderer.ready,false);assert.equal(renderer.workerFailures,2);assert.deepEqual([...renderer.requested],[]);assert.equal(renderer.requestTokens.has('old'),false);assert.equal(renderer.tileProgress.has('old'),false);assert.deepEqual(calls,['terminate','initialise']);
    }finally{if(previous===undefined)delete globalThis.window;else globalThis.window=previous;}
});
test('malformed geometry enters retry rather than attaching a broken tile', () => {
    const calls = [];
    const renderer = { requestTokens: new Map([['tile-3', 3]]), tileFailed: (id, reason) => calls.push([id, reason]) };
    RailwayRenderer.prototype.onWorker.call(renderer, { type: 'tile', id: 'tile-3', token: 3, mesh: { position: new Float32Array([0, 0, 0]) } });
    assert.deepEqual(calls, [['tile-3', 'Worker returned malformed geometry']]);
});
test('stale and unsolicited worker results cannot replace a current tile or fail its request', () => {
    const calls = [];
    const renderer = { requestTokens: new Map([['tile-1', 8]]), tileFailed: () => calls.push('failed') };
    const onWorker = RailwayRenderer.prototype.onWorker;
    onWorker.call(renderer, { type: 'error', id: 'tile-1', token: 7, message: 'late' });
    onWorker.call(renderer, { type: 'tile', id: 'tile-1', token: 7 });
    onWorker.call(renderer, { type: 'tile', id: 'unknown', token: 8 });
    onWorker.call(renderer, { type: 'tile', token: 8 });
    assert.deepEqual(calls, []);
    assert.equal(renderer.requestTokens.get('tile-1'), 8);
});
test('a crashed worker is replaced and its outstanding job is failed before reinitialisation', () => {
    const calls = [];
    const replacement = {};
    const renderer = { ready: true, worker: { terminate: () => calls.push('terminate') }, requested: new Set(['tile-1']), workerFailures: 0, terrainSource: new ArrayBuffer(2),
        tileFailed: (id, reason) => calls.push(`${id}: ${reason}`), createWorker: () => { calls.push('create'); return replacement; }, initialiseWorker: () => calls.push('initialise'), failures: [] };
    RailwayRenderer.prototype.restartWorker.call(renderer, 'worker crashed');
    assert.equal(renderer.ready, false);
    assert.equal(renderer.worker, replacement);
    assert.deepEqual(calls, ['terminate', 'tile-1: worker crashed', 'create', 'initialise']);
});
test('a stalled fetch is aborted and enters bounded retry without train movement', async () => {
    const oldWindow = globalThis.window, oldDocument = globalThis.document, oldFetch = globalThis.fetch;
    const timers = [];
    globalThis.window = { setTimeout: (fn, ms) => { timers.push({ fn, ms }); return timers.length; }, clearTimeout: () => { } };
    globalThis.document = { baseURI: 'http://localhost/' };
    globalThis.fetch = (_url, options) => new Promise((_resolve, reject) => options.signal.addEventListener('abort', () => reject(new Error('fetch timed out'))));
    try {
        let refreshes = 0;
        const renderer = { ready: true, sim: { player: { s: 0 } }, route: { sample: () => ({ position: [0, 0, 0] }) }, quality: 'low', data: { tiles: [{ id: 'stall', url: 'data/stall.json', bounds: [-1, -1, 1, 1] }] },
            loaded: new Map(), requested: new Set(), requestTokens: new Map(), requestTimers: new Map(), requestAborts: new Map(), tileProgress: new Map(), nextRequestToken: 0, tileRetries: new Map(), failures: [], disposed: false,
            evictInactiveTiles: () => { }, updateTiles: () => { refreshes++; } };
        renderer.clearRequest = RailwayRenderer.prototype.clearRequest;
        renderer.tileFailed = RailwayRenderer.prototype.tileFailed;
        renderer.refreshTileTimeout = RailwayRenderer.prototype.refreshTileTimeout;
        const pending = RailwayRenderer.prototype.updateTiles.call(renderer, true);
        assert.equal(renderer.requested.has('stall'), true);
        timers.find(t => t.ms === 30000).fn();
        await pending;
        assert.equal(renderer.requested.has('stall'), false);
        assert.equal(renderer.tileRetries.get('stall').attempts, 1);
        assert.ok(refreshes > 0);
    }
    finally {
        if (oldWindow === undefined)
            delete globalThis.window;
        else
            globalThis.window = oldWindow;
        if (oldDocument === undefined)
            delete globalThis.document;
        else
            globalThis.document = oldDocument;
        globalThis.fetch = oldFetch;
    }
});
test('a stalled tile build restarts the worker and ignores its later token', async () => {
    const oldWindow = globalThis.window, oldDocument = globalThis.document, oldFetch = globalThis.fetch;
    const timers = [];
    globalThis.window = { setTimeout: (fn, ms) => { timers.push({ fn, ms }); return timers.length; }, clearTimeout: () => { } };
    globalThis.document = { baseURI: 'http://localhost/' };
    globalThis.fetch = async () => ({ ok: true, json: async () => ({ id: 'stalled-build' }) });
    try {
        const sent = [], restarts = [];
        const renderer = { ready: true, sim: { player: { s: 0 } }, route: { sample: () => ({ position: [0, 0, 0] }) }, quality: 'low', data: { tiles: [{ id: 'stalled-build', url: 'data/stall.json', bounds: [-1, -1, 1, 1] }] },
            loaded: new Map(), requested: new Set(), requestTokens: new Map(), requestTimers: new Map(), requestAborts: new Map(), tileProgress: new Map(), nextRequestToken: 0, tileRetries: new Map(), worker: { postMessage: (m) => sent.push(m) }, evictInactiveTiles: () => { }, restartWorker: (reason) => restarts.push(reason) };
        renderer.refreshTileTimeout = RailwayRenderer.prototype.refreshTileTimeout;
        await RailwayRenderer.prototype.updateTiles.call(renderer, true);
        assert.equal(sent.length, 1);
        assert.equal(sent[0].token, 1);
        timers.find(t => t.ms === 90000).fn();
        assert.match(restarts[0], /stalled-build.*timed out/);
        renderer.requestTokens.set('stalled-build', 2);
        timers.find(t => t.ms === 90000).fn();
        assert.equal(restarts.length, 1, 'an obsolete timer must not restart a new request');
    }
    finally {
        if (oldWindow === undefined)
            delete globalThis.window;
        else
            globalThis.window = oldWindow;
        if (oldDocument === undefined)
            delete globalThis.document;
        else
            globalThis.document = oldDocument;
        globalThis.fetch = oldFetch;
    }
});
