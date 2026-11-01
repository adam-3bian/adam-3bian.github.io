import test from 'node:test';
import assert from 'node:assert/strict';
import {resolveRoadGrades} from '../src/world/road-grades.js';
const road=(id,points,nodes,extra={})=>({id,points,connectionNodes:nodes,mode:'ground',kind:'residential',width:5,...extra});
test('a connected road approach absorbs a fixed bridge height without a sudden drop',()=>{
 const approach=road('approach',[[0,0,0],[10,5,0]],['a','b']),bridge=road('bridge',[[10,5,0],[20,5,0]],['b','c'],{mode:'over'}),before=JSON.stringify(bridge.points);
 const stats=resolveRoadGrades([approach,bridge]);assert.equal(JSON.stringify(bridge.points),before);assert.equal(approach.points.at(-1)[1],bridge.points[0][1]);assert.ok(Math.abs(approach.points[1][1]-approach.points[0][1])/10<=.18001);assert.ok(stats.adjustedNodes>0);assert.equal(stats.unresolvedGroundGrades,0);
});
test('incompatible fixed levels are flagged, and source plan geometry stays intact',()=>{
 const low=road('low',[[-5,0,0],[0,0,0]],['x','a'],{mode:'under'}),steep=road('steep',[[0,0,0],[5,3,0],[10,7,0]],['a','b']),high=road('high',[[10,7,0],[15,7,0]],['b','y'],{mode:'over'}),plan=steep.points.map(p=>[p[0],p[2]]);
 const stats=resolveRoadGrades([low,steep,high]);assert.equal(stats.unresolvedGroundGrades,1);assert.equal(stats.exceptions[0].id,'steep');assert.equal(steep.points[0][1],0);assert.equal(steep.points.at(-1)[1],7);assert.deepEqual(steep.points.map(p=>[p[0],p[2]]),plan);
});
