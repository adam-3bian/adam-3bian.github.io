import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {RouteGeometry,Polyline} from '../src/core/geometry';
import {RailwaySimulation} from '../src/core/simulation';
import {Terrain,SurfaceField,engineerRoad} from '../src/world/surfaces';
import type {RouteData} from '../src/core/types';
import {endpointContext} from '../src/world/build';
const data=JSON.parse(readFileSync('public/data/route.json','utf8')) as RouteData;
const route=new RouteGeometry(data);const idle={a:false,d:false,horn:false};
function isolated(){const sim=new RailwaySimulation(route);sim.ai=[];sim.paused=false;return sim;}
test('the full geographic route has 22 ordered controls and continuous physical distance',()=>{
  assert.equal(route.stations.length,22);assert.equal(route.stations[0].id,'KID');assert.equal(route.stations.at(-1)!.id,'DDG');assert.ok(route.length>47000&&route.length<49000);
  for(let i=1;i<route.stations.length;i++)assert.ok(route.stations[i].s>route.stations[i-1].s);
  for(let s=0;s<route.length;s+=47){const p=route.sample(s);assert.ok(p.position.every(Number.isFinite));const next=route.sample(s+.1);assert.ok(Math.hypot(...next.position.map((v,i)=>v-p.position[i]))<.11);}
});
test('off-route consist ends follow the same mapped context rails used by the terrain worker',()=>{
  const r=new RouteGeometry(data),contexts=endpointContext(r);r.setEndpointContext(contexts);
  for(const c of contexts){const end=Boolean(c.metadata?.atEnd),lane=Number(c.metadata?.lane),s=end?r.length+70:-70;const pose=r.lanePose(s,lane),expected=c.path.sample(70);assert.ok(Math.hypot(...pose.position.map((x,i)=>x-expected.position[i]))<.001);assert.ok(Math.abs(r.laneDistance(s,r.travel(s,70.3,lane),lane)-70.3)<.001);const join=r.lanePose(end?r.length+.001:-.001,lane),tip=r.lanePose(end?r.length:0,lane);assert.ok(Math.hypot(...join.position.map((x,i)=>x-tip.position[i]))<.002);}
});
test('A/D change a combined controller and do not directly set speed',()=>{
  const sim=isolated();const before=sim.player.speed;sim.update(1/60,{a:true,d:false,horn:false});assert.ok(sim.player.controller>-1&&sim.player.controller<0);assert.ok(sim.player.speed<before+.05);
  for(let i=0;i<7*60;i++)sim.update(1/60,{a:true,d:false,horn:false});assert.equal(sim.player.controller,1);assert.ok(sim.player.speed>1);
  const speed=sim.player.speed;for(let i=0;i<10*60;i++)sim.update(1/60,{a:false,d:true,horn:false});assert.equal(sim.player.controller,-1);assert.ok(sim.player.speed<speed);
});
test('controller ramp is frame independent and simultaneous commands hold their value',()=>{
  const a=isolated(),b=isolated();for(let i=0;i<120;i++)a.update(1/60,{a:true,d:false,horn:false});for(let i=0;i<60;i++)b.update(1/30,{a:true,d:false,horn:false});assert.ok(Math.abs(a.player.controller-b.player.controller)<1e-10);
  const c=a.player.controller;a.update(.1,{a:true,d:true,horn:false});assert.equal(a.player.controller,c);
});
test('AWS missed acknowledgement demands braking and power cannot override it',()=>{
  const sim=isolated();sim.player.s=5000;sim.player.speed=12;sim.player.controller=1;sim.aws.pending=true;sim.aws.deadline=sim.clock+.1;
  sim.update(.2,{a:true,d:false,horn:false});assert.equal(sim.aws.brake,true);const speed=sim.player.speed;sim.acknowledge();assert.equal(sim.aws.brake,true);sim.update(.2,{a:true,d:false,horn:false});assert.ok(sim.player.speed<speed);
  sim.player.speed=0;sim.acknowledge();assert.equal(sim.aws.brake,false);
});
test('a safety brake also cuts traction instead of braking against a powered engine',()=>{const powered=isolated(),braked=isolated();for(const sim of [powered,braked]){sim.player.s=12000;sim.player.speed=15;sim.aws.brake=true;}powered.player.controller=1;braked.player.controller=-1;powered.update(.1,idle);braked.update(.1,idle);assert.ok(Math.abs(powered.player.speed-braked.player.speed)<1e-9);});
test('Q is a rising-edge acknowledgement and cannot clear TPWS',()=>{
  const sim=isolated();sim.aws.pending=true;sim.acknowledge();assert.equal(sim.aws.pending,false);assert.equal(sim.aws.acknowledged,1);sim.acknowledge();assert.equal(sim.aws.acknowledged,1);
  sim.triggerTPWS('test');sim.acknowledge();assert.equal(sim.tpws.active,true);assert.equal(sim.resetTPWS(),false);sim.player.speed=0;sim.tpws.stoppedAt=sim.clock-6;assert.equal(sim.resetTPWS(),true);assert.equal(sim.player.controller,-1);
});
test('block occupation covers the entire rear, not just the front or camera',()=>{
  const sim=isolated();sim.player.s=1000;sim.player.length=100;sim.player.lane=0;assert.equal(sim.occupied(910,920,0,'other'),true);assert.equal(sim.occupied(910,920,4.2,'other'),false);assert.equal(sim.occupied(790,800,0,'other'),false);
});
test('signals respond to occupied, clear and unproved routes',()=>{
  const sim=isolated();const signal=sim.signals.find(s=>s.direction===1&&s.s>8000)!;const next=sim.signals.find(s=>s.direction===1&&s.s>signal.s)!;
  sim.player.s=signal.s-300;const lead={...sim.player,id:'lead',s:(signal.s+next.s)/2,lane:signal.lane};sim.ai=[lead];assert.equal(sim.aspect(signal),'red');sim.ai=[];assert.notEqual(sim.aspect(signal),'red');
  sim.points.push({id:'test-point',s:signal.s+25,state:'moving',target:'reverse',blend:.4,lockedBy:null});assert.equal(sim.aspect(signal),'red');
});
test('point changes reject whole-consist occupation and approach locking',()=>{
  const sim=isolated(),point=sim.points.find(p=>p.s>5000)!;sim.player.s=point.s+20;sim.player.direction=1;sim.player.length=69;assert.equal(sim.requestPoint(point.id,'reverse'),false);
  sim.player.s=point.s-1500;sim.player.speed=0;point.lockedBy=null;assert.equal(sim.requestPoint(point.id,'reverse'),true);for(let i=0;i<180;i++)sim.update(1/60,idle);assert.equal(point.state,'reverse');assert.equal(point.blend,1);
});
test('successive trains keep a level crossing closed until both rears clear',()=>{
  const sim=isolated(),c=sim.crossings[0];sim.player.s=c.s-50;sim.player.speed=0;sim.player.controller=-1;for(let i=0;i<500;i++)sim.update(.02,idle);assert.equal(c.state,'closed');
  sim.player.s=c.s+200;const opposing={...sim.player,id:'opposing',s:c.s+60,direction:-1 as const,lane:4.2};sim.ai=[opposing];for(let i=0;i<100;i++)sim.update(.02,idle);assert.equal(c.state,'closed');sim.ai=[];sim.player.s=c.s+500;for(let i=0;i<500;i++)sim.update(.02,idle);assert.equal(c.state,'open');assert.equal(c.blend,0);
});
test('reversing preserves the physical track and requires an authorised standstill',()=>{
  const sim=isolated(),lane=sim.player.lane;sim.player.speed=3;assert.equal(sim.setDirection(-1),false);sim.player.speed=0;const before=sim.interval(sim.player);assert.equal(sim.setDirection(-1),true);assert.equal(sim.player.lane,lane);const after=sim.interval(sim.player);for(let i=0;i<2;i++)assert.ok(Math.abs(before[i]-after[i])<.001);assert.ok(sim.player.reverseAuthority);assert.equal(sim.setDirection(1),true);for(let i=0;i<2;i++)assert.ok(Math.abs(before[i]-sim.interval(sim.player)[i])<.001);
  sim.player.s=10000;assert.equal(sim.setDirection(-1),false);
});

test('every point in a protected block is checked and adjacent-lane settings stay independent',()=>{
  const sim=isolated(),signal=sim.signals.find(s=>s.direction===1&&s.s>8000)!,next=sim.signals.find(s=>s.direction===1&&s.s>signal.s)!;sim.points=[];sim.crossings=[];
  sim.points.push({id:'proved-first',s:signal.s+10,lane:signal.lane,state:'normal',target:'normal',blend:0,lockedBy:null},{id:'unproved-second',s:Math.min(signal.s+30,next.s-5),lane:signal.lane,state:'moving',target:'reverse',blend:.4,lockedBy:null});assert.equal(sim.aspect(signal),'red');sim.points[1].lane=0;assert.notEqual(sim.aspect(signal),'red');
});
test('save/restore preserves protection, points, crossing and train occupation',()=>{
  const sim=isolated();sim.player.s=12000;sim.triggerTPWS('saved demand');sim.crossings[0].blend=.6;sim.crossings[0].state='closing';sim.points[0].blend=.4;sim.points[0].state='moving';const save=sim.snapshot();const restored=new RailwaySimulation(route);restored.restore(save);assert.deepEqual(restored.snapshot(),save);assert.equal(restored.paused,true);assert.throws(()=>restored.restore({...save,version:99} as any));assert.throws(()=>restored.restore({...save,worldHash:'another-terrain-contract'}));
});
test('transport formations own ground independently of camera and tile order',()=>{
  const meta={url:'',width:8,height:8,origin:[-100,100] as [number,number],step:100,offset:26,scale:.01,nodata:0};const pixels=new Uint16Array(64).fill(20000);const terrain=new Terrain(meta,pixels);
  const fake={...data,points:[[0,100,0],[0,100,-1000]],stations:[],structures:[],tunnels:[],chainages:[0,1000]} as RouteData;const r=new RouteGeometry(fake);const field=new SurfaceField(r,terrain,[]);assert.ok(field.ground(0,-100)<99.5);assert.ok(field.ground(4.2,-100)<99.5);assert.ok(terrain.raw(0,-100)>200);
});
test('road surfaces and road support use the same engineered profile',()=>{
  const fake={...data,points:[[0,100,0],[0,100,-1000]],stations:[],structures:[],tunnels:[],chainages:[0,1000]} as RouteData;const r=new RouteGeometry(fake);const road=engineerRoad({id:'test-road',kind:'residential',width:6,points:[[-100,100,-200],[0,100,-200],[100,100,-200]]},r)!;assert.equal(road.mode,'under');assert.ok(road.points[1][1]<95);
  const terrain=new Terrain({url:'',width:4,height:4,origin:[-200,-400],step:200,offset:26,scale:.01,nodata:0},new Uint16Array(16).fill(7401));const f=new SurfaceField(r,terrain,[road]);assert.ok(f.ground(0,-200)<road.points[1][1]);
});
test('curve interpolation remains continuous through both travel directions',()=>{
  const p=new Polyline([[0,0,0],[5,1,-10],[12,2,-20]]);for(let s=0;s<p.length;s+=.2){const a=p.sample(s),b=p.sample(s+.01);assert.ok(Math.hypot(...a.position.map((v,i)=>v-b.position[i]))<.011);}
});
test('TPWS receiver times its physical overspeed loop pair with swept passages',()=>{
  const sim=isolated();const sig=sim.signals.find(s=>s.direction===1&&s.s>8000)!;sim.points.push({id:'red-route',s:sig.s+25,state:'moving',target:'reverse',blend:.4,lockedBy:null});sim.player.s=sig.s-76;sim.player.speed=22;sim.player.controller=1;sim.update(.4,idle);assert.equal(sim.tpws.active,true);assert.match(sim.tpws.reason,/overspeed/);
  const adjacent=isolated();adjacent.player.s=sig.s-76;adjacent.player.lane=sig.lane===0?4.2:0;adjacent.player.speed=22;adjacent.player.controller=1;adjacent.update(.4,idle);assert.equal(adjacent.tpws.active,false);
});
test('crossing-protecting signals stay restrictive before the approach is occupied',()=>{
  const sim=isolated(),c=sim.crossings[0];const sig=sim.signals.filter(s=>s.direction===1&&s.s<c.s).at(-1)!;sim.player.s=sig.s-500;assert.equal(c.state,'open');assert.equal(sim.aspect(sig),'red');
});
test('TPWS train-stop pair detects swept receiver timing and rejects wrong direction',()=>{
  const sim=isolated(),sig=sim.signals.find(s=>s.direction===1&&s.s>8000)!;sim.points.push({id:'red-route',s:sig.s+25,state:'moving',target:'reverse',blend:.5,lockedBy:null});sim.player.s=route.travel(sig.s,-3,sig.lane);sim.player.speed=15;sim.player.controller=1;sim.update(.4,idle);assert.equal(sim.stats.spads,1);assert.match(sim.tpws.reason,/train-stop/);
  const wrong=isolated();wrong.player.lane=sig.lane;wrong.player.direction=-1;wrong.player.s=route.travel(sig.s,3,sig.lane);wrong.player.speed=15;wrong.player.controller=1;wrong.update(.4,idle);assert.equal(wrong.tpws.active,false);assert.equal(wrong.stats.spads,0);
});
test('passing the end of the dataset does not count as a station stop or journey completion',()=>{
  const sim=isolated();sim.player.s=route.length-3;sim.player.speed=20;sim.player.controller=1;sim.player.nextStop=route.stations.length-1;sim.update(.5,idle);assert.equal(sim.player.arrived,false);assert.equal(sim.paused,true);assert.ok(!sim.calls.includes('DDG'));
});
test('level-crossing road datum joins the rail and crossing panels without an extra 20mm step',()=>{const fake={...data,points:Array.from({length:11},(_,i)=>[0,100,-i*100] as [number,number,number]),stations:[{id:'BKD',name:'Blakedown',s:500,position:[0,100,-500],length:150,platformCount:2}],structures:[],tunnels:[],chainages:Array.from({length:11},(_,i)=>i*100)} as RouteData;const r=new RouteGeometry(fake),road=engineerRoad({id:'crossing-profile',kind:'residential',width:6,points:[[-100,97,-500],[0,99,-500],[100,97,-500]]},r)!;assert.equal(road.mode,'crossing');assert.ok(Math.abs(road.path.sample(road.crossingS!).position[1]-r.sample(road.routeS!).position[1])<.001);});
