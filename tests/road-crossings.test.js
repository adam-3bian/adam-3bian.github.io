import test from 'node:test';
import assert from 'node:assert/strict';
import {RouteGeometry} from '../src/core/geometry.js';
import {engineerRoad} from '../src/world/surfaces.js';

test('a road must span a running track before proximity can produce a level crossing',()=>{
 const route=new RouteGeometry({points:[[0,10,-50],[0,10,0],[0,10,50]],stations:[],structures:[],crossings:[{id:'mapped',s:50}],tunnels:[]});
 const crossing=engineerRoad({id:'across',points:[[-10,10,0],[0,10,0],[10,10,0]]},route);
 const approach=engineerRoad({id:'approach',kind:'path',points:[[-20,10,0],[-5,10,0]]},route);
 assert.equal(crossing.mode,'crossing');
 assert.equal(approach.mode,'ground');
});
