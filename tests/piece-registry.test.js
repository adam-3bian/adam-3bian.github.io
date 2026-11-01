import test from 'node:test';
import assert from 'node:assert/strict';
import {RAIL_PIECES,ROAD_PIECES,instantiatePiece,piecePath,matchingPorts,occupiedQuarters} from '../src/world/piece-registry.js';
import {PieceGraph} from '../src/world/piece-graph.js';
import {encodeGrid,decodeGrid,position} from '../src/world/grid.js';

test('all reference IDs construct continuous, deterministic grid pieces in four rotations and both directions',()=>{
 assert.deepEqual(RAIL_PIECES.map(p=>p.id),Array.from({length:44},(_,i)=>i));
 assert.deepEqual(ROAD_PIECES.map(p=>p.id),Array.from({length:10},(_,i)=>i));
 for(const [mode,defs] of [['rail',RAIL_PIECES],['road',ROAD_PIECES]])for(const d of defs)for(let rotation=0;rotation<4;rotation++){
  const opts={id:`${mode}-${d.id}`,mode,referenceId:d.id,origin:[-24,65.25,31],rotation,nodes:['a','b']},p=instantiatePiece(opts),back=instantiatePiece({...opts,reverse:true});
  assert.ok(p.anchors.length>=5);assert.ok(piecePath(p).length>1);assert.ok(p.occupancy.length);assert.deepEqual(back.anchors,[...p.anchors].reverse());
  assert.deepEqual(back.ports.map(q=>q.node),['b','a']);
  for(const [a,b] of [[p.ports[0],back.ports[1]],[p.ports[1],back.ports[0]]]){assert.deepEqual(a.anchor,b.anchor);assert.ok(Math.hypot(...a.vector.map((v,i)=>v-b.vector[i]))<1e-9);}
  assert.deepEqual(decodeGrid(encodeGrid(p)),p);assert.deepEqual(instantiatePiece(opts),p);
 }
});
test('half and quarter pieces retain the same canonical curved path and one-sided pieces are separate',()=>{
 const opts={id:'full',mode:'rail',referenceId:4,origin:[0,10,0]},full=instantiatePiece(opts),half=instantiatePiece({...opts,id:'half',range:[0,.5]}),quarter=instantiatePiece({...opts,id:'quarter',range:[0,.25]}),path=piecePath(full);
 const near=(a,b)=>Math.hypot(...a.map((n,i)=>n-b[i]));
 assert.ok(near(position(half.anchors.at(-1)),path.sample(path.length/2).position)<.1);
 assert.ok(near(position(quarter.anchors.at(-1)),path.sample(path.length/4).position)<.1);
 const left=instantiatePiece({id:'left',referenceId:26}),right=instantiatePiece({id:'right',referenceId:27});assert.equal(position(right.anchors[0])[2]-position(left.anchors[0])[2],4);assert.equal(left.range[1],1);
 assert.throws(()=>instantiatePiece({id:'bad',referenceId:0,range:[.5,.25]}));
});
test('gradients, diagonals and flexible radii preserve smooth endpoints',()=>{
 const up=instantiatePiece({id:'up',referenceId:14}),down=instantiatePiece({id:'down',referenceId:15});assert.equal(position(up.anchors.at(-1))[1],1);assert.equal(position(down.anchors.at(-1))[1],-1);
 const diagonal=piecePath(instantiatePiece({id:'diagonal',referenceId:1})).sample(0);assert.ok(Math.abs(diagonal.tangent[0]-diagonal.tangent[2])<1e-8);
 const p=instantiatePiece({id:'wide',referenceId:8,radiusMetres:300}),q=piecePath(p),a=q.sample(0),b=q.sample(.01),z=q.sample(q.length-.01),end=q.sample(q.length);
 assert.ok(Math.abs(a.yaw-b.yaw)<.001);assert.ok(Math.abs(z.yaw-end.yaw)<.001);assert.ok(q.length>400);
});
test('wide roads occupy the intermediate quarter-cells across their full width',()=>{
 const cells=occupiedQuarters([[1,0,0],[15,0,0]],15),masks=new Map(cells.map(([x,z,mask])=>[`${x},${z}`,mask]));
 assert.equal(masks.get('0,-1'),15);assert.equal(masks.get('0,0'),15);
});
test('points require a selected route, and a grade-separated crossing is not a connection',()=>{
 const stem=instantiatePiece({id:'stem',referenceId:0,nodes:['west','toe']}),main=instantiatePiece({id:'main',referenceId:0,origin:[16,0,0],nodes:['toe','east']}),branch=instantiatePiece({id:'branch',referenceId:4,origin:[16,0,0],nodes:['toe','branch-end']}),upper=instantiatePiece({id:'upper',referenceId:0,origin:[16,8,-8],rotation:1,nodes:['upper-a','upper-b']}),graph=new PieceGraph([stem,main,branch,upper]);
 const s=piecePath(stem).length-1;assert.equal(graph.travel('stem',s,4).stopped,true);
 graph.setSwitch('rail','toe',['stem','branch']);const routed=graph.travel('stem',s,4);assert.equal(routed.piece,'branch');assert.equal(routed.stopped,false);assert.ok(routed.pose.position[0]>16);
 const saved=JSON.parse(JSON.stringify({pieces:encodeGrid([stem,main,branch,upper]),state:graph.snapshot()})),restored=new PieceGraph(decodeGrid(saved.pieces));restored.restore(saved.state);assert.deepEqual(restored.travel('stem',s,4),routed);
 assert.throws(()=>restored.restore({version:1,switches:[['rail/toe',['stem','upper']]]}));assert.deepEqual(restored.travel('stem',s,4),routed);
 graph.setSwitch('rail','toe',['stem','main']);assert.equal(graph.travel('stem',s,4).piece,'main');assert.throws(()=>graph.setSwitch('rail','toe',['stem','upper']));
 assert.equal(graph.next('upper',1),undefined);
});
