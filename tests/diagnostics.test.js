import test from 'node:test';
import assert from 'node:assert/strict';
import {instantiatePiece} from '../src/world/piece-registry.js';
import {inspectGridWorld} from '../src/world/diagnostics.js';
test('diagnostics distinguish separated crossings from a mismatched shared node',()=>{
 const a=instantiatePiece({id:'a',referenceId:0,nodes:['west','east']}),b=instantiatePiece({id:'b',referenceId:0,origin:[8,8,-8],rotation:1,nodes:['up-south','up-north']}),base={gridPieces:[a,b],surfaceRoads:[]};
 let r=inspectGridWorld(base);assert.equal(r.errors.length,0);assert.equal(r.totals.unconnected,4);
 const bad=instantiatePiece({id:'bad',referenceId:0,origin:[16,2,0],nodes:['east','other']});r=inspectGridWorld({...base,gridPieces:[a,b,bad]});assert.ok(r.errors.some(e=>e.reason==='shared node has mismatched anchors'));
 r=inspectGridWorld({...base,landmarks:[{id:'missing',asset:'landmark/unknown'}]});assert.ok(r.errors.some(e=>e.reason==='unrecognised asset landmark/unknown'));
});
test('diagnostics flag unusually tight rail curves and unmatched level crossings',()=>{
 const curve=instantiatePiece({id:'tight',referenceId:2}),road={id:'cross',points:[[0,0,0],[10,0,0]],mode:'crossing',routeS:100,connectionNodes:['a','b']};
 const result=inspectGridWorld({gridPieces:[curve],surfaceRoads:[road],crossings:[]});assert.ok(result.totals.radius>0);assert.equal(result.totals.crossing,1);
});
