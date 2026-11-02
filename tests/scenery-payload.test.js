import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {decodeGrid} from '../src/world/grid.js';
import {RouteGeometry} from '../src/core/geometry.js';
import {Terrain} from '../src/world/surfaces.js';
import {deriveTrackwork} from '../src/render/trackwork.js';
import {sceneryWorkerData} from '../src/render/renderer.js';
import {buildTile} from '../src/world/build.js';

test('the smaller worker payload reconstructs the same Kidderminster geometry',()=>{
 const data=decodeGrid(JSON.parse(readFileSync('public/data/grid/world.json')).route),fullRoute=new RouteGeometry(data);
 data.trackwork=deriveTrackwork(fullRoute).switches;
 const payload=sceneryWorkerData(data),workerRoute=new RouteGeometry(payload),tile=decodeGrid(JSON.parse(readFileSync('public/data/grid/tiles/-17_3.json'))),terrain=new Terrain(data.terrain,new Uint16Array(Uint8Array.from(readFileSync('public/data/grid/terrain.bin')).buffer));
 assert.ok(data.gridPieces.length);assert.equal(payload.gridPieces,undefined);assert.ok(data.surfaceRoads[0].occupancy);assert.equal(payload.surfaceRoads[0].occupancy,undefined);
 const signature=result=>{const hash=createHash('sha256');for(const value of Object.values(result.mesh))if(ArrayBuffer.isView(value))hash.update(Buffer.from(value.buffer,value.byteOffset,value.byteLength));return hash.digest('hex');};
 const original=buildTile(tile,fullRoute,terrain),expected=signature(original),actual=buildTile(tile,workerRoute,terrain);
 assert.equal(signature(actual),expected);assert.deepEqual(actual.checks,original.checks);
});
