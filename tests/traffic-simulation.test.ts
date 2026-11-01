import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {RouteGeometry} from '../src/core/geometry';
import {RailwaySimulation} from '../src/core/simulation';
import {Terrain} from '../src/world/surfaces';
import {buildTile} from '../src/world/build';
import {RoadTraffic,isMotorRoad,type RoadCar,type TrafficRoad} from '../src/world/traffic';
import type {RouteData,Feature} from '../src/core/types';

const data=JSON.parse(readFileSync('public/data/route.json','utf8')) as RouteData;
const road:TrafficRoad={id:'test-road',kind:'residential',width:6,points:[[0,100,0],[0,100,-400]]};
const input={a:false,d:false,horn:false};
function configured(){
  const sim=new RailwaySimulation(new RouteGeometry(data));sim.ai=[];sim.crossings=[];sim.paused=false;
  sim.roadTraffic.addRoads([road]);sim.roadTraffic.cars.clear();
  const car:RoadCar={id:'fixture-car',road:road.id,s:100,direction:1,speed:4,kind:'car',length:4.5,position:[-1.38,100,-100],yaw:0};
  sim.roadTraffic.cars.set(car.id,car);return sim;
}

test('simulation advances road traffic without a renderer and pauses it with the simulation',()=>{
  const sim=configured(),car=sim.roadTraffic.cars.get('fixture-car')!;
  for(let i=0;i<60;i++)sim.update(1/60,input);
  assert.ok(car.s>104,'car advanced using only simulation ticks');
  const s=car.s;sim.paused=true;for(let i=0;i<60;i++)sim.update(1/60,input);assert.equal(car.s,s);
});

test('save/restore preserves the traffic substep and deterministic continuation',()=>{
  const sim=configured();for(let i=0;i<16;i++)sim.update(1/60,input);
  const saved=sim.snapshot();assert.ok(saved.roadAccumulator!>0&&saved.roadAccumulator!<.05);
  const resumed=new RailwaySimulation(new RouteGeometry(data));resumed.roadTraffic.addRoads([road]);resumed.restore(saved);resumed.paused=false;
  for(let i=0;i<240;i++){sim.update(1/60,input);resumed.update(1/60,input);}
  assert.deepEqual(resumed.snapshot(),sim.snapshot());
});

test('motor traffic graph excludes waterways and non-motor routes',()=>{
  const traffic=new RoadTraffic();const roads:TrafficRoad[]=[road,
    {...road,id:'water',kind:'water'},{...road,id:'path',kind:'footway'},
    {...road,id:'railway-corridor',kind:'corridor'},{...road,id:'closed',kind:'construction'}];
  traffic.configure(roads);assert.deepEqual([...traffic.roads.keys()],['test-road']);
});

test('complete road graph and its simulation are independent of input tile order',()=>{
  const roads:Feature[]=Array.from({length:50},(_,i)=>({id:`road-${String(i).padStart(2,'0')}`,kind:'residential',width:6,points:[[i*20,100,0],[i*20,100,-200]]}));
  const terrainMeta={url:'',width:2,height:2,origin:[-500,-500] as [number,number],step:2000,offset:0,scale:.01,nodata:0};
  const terrain=new Terrain(terrainMeta,new Uint16Array(4).fill(10001));
  const a=new RailwaySimulation(new RouteGeometry(data)),b=new RailwaySimulation(new RouteGeometry(data));
  a.configureRoadNetwork(roads,terrain);b.configureRoadNetwork([...roads].reverse(),terrain);
  a.ai=[];b.ai=[];a.paused=false;b.paused=false;
  assert.deepEqual(a.roadTraffic.snapshot(),b.roadTraffic.snapshot());
  for(let i=0;i<120;i++){a.update(1/60,input);b.update(1/60,input);}
  assert.deepEqual(a.roadTraffic.snapshot(),b.roadTraffic.snapshot());
});

test('an incompatible road save fails before changing the live journey',()=>{
  const sim=configured(),before=sim.snapshot(),broken=structuredClone(before);
  (broken.roadTraffic as any).cars[0].road='missing-road';broken.clock+=100;
  assert.throws(()=>sim.restore(broken),/current road network/);
  assert.deepEqual(sim.snapshot(),before);
});

test('compact traffic saves preserve an active junction transition and reservation',()=>{
  const roads:TrafficRoad[]=[{...road,id:'first',points:[[0,100,0],[0,100,-200]]},{...road,id:'turn',points:[[0,100,-200],[150,100,-200]]}];
  const a=new RoadTraffic();a.configure(roads);a.cars.clear();a.cars.set('turning',{id:'turning',road:'first',s:187,direction:1,speed:4,kind:'car',length:4.5,position:[-1.38,100,-187],yaw:0});
  let time=0;for(let i=0;i<100&&!a.cars.get('turning')?.transition;i++){time+=.05;a.update(.05,time,[]);}
  assert.ok(a.cars.get('turning')?.transition,'fixture must save during an actual junction turn');
  const saved=JSON.parse(JSON.stringify(a.snapshotState()));assert.ok(saved.reservations.length>0);
  const b=new RoadTraffic();b.configure(roads);b.restoreState(saved);assert.deepEqual(b.snapshotState(),saved);
  for(let i=0;i<100;i++){time+=.05;a.update(.05,time,[]);b.update(.05,time,[]);}
  assert.deepEqual(b.snapshotState(),a.snapshotState());
});

test('simulation roads use the same engineered source-bridge profile as emitted tile roads',()=>{
  const world=structuredClone(data);world.surfaceRoads=JSON.parse(readFileSync('public/data/road-surfaces.json','utf8')).roads;
  world.surfaceWater=JSON.parse(readFileSync('public/data/land-surfaces.json','utf8')).water;
  const route=new RouteGeometry(world),bytes=readFileSync('public/data/terrain.bin');
  const terrain=new Terrain(world.terrain,new Uint16Array(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength)));
  const sim=new RailwaySimulation(route);sim.configureRoadNetwork(world.surfaceRoads as Feature[],terrain);
  const tile=JSON.parse(readFileSync('public/data/tiles/16_4.json','utf8')),result=buildTile(tile,route,terrain);
  const id='way/24417636/0',rendered=result.roads.find(r=>r.id===id),operated=sim.roadTraffic.roads.get(id);
  assert.ok(rendered&&operated,'source road appears in both systems');
  assert.equal(rendered.mode,'over');assert.equal(operated.mode,rendered.mode);
  assert.deepEqual(operated.points,rendered.points);assert.equal(operated.routeS,rendered.routeS);
  assert.equal(operated.crossingS,rendered.crossingS);
  const roads=result.roads.filter(isMotorRoad);assert.ok(roads.length>10);
  for(const road of roads){const model=sim.roadTraffic.roads.get(road.id);assert.ok(model,`${road.id} missing from simulation`);assert.deepEqual(model.points,road.points);assert.equal(model.mode,road.mode);assert.equal(model.routeS,road.routeS);assert.equal(model.crossingS,road.crossingS);}
});

test('simulation-owned road traffic clears a committed car before closing a crossing',()=>{
  const sim=new RailwaySimulation(new RouteGeometry(data));sim.ai=[];sim.paused=false;sim.player.s=950;sim.player.controller=-1;
  sim.crossings=[{id:'gate',s:1000,state:'open',blend:0,timer:0,held:false}];
  const crossingRoad:TrafficRoad={...road,id:'crossing-road',mode:'crossing',crossingS:200,routeS:1000};
  sim.roadTraffic.configure([crossingRoad]);sim.roadTraffic.cars.clear();
  const car:RoadCar={id:'car',road:crossingRoad.id,s:180,direction:1,speed:9,kind:'car',length:4.5,position:[-1.38,100,-180],yaw:0};
  sim.roadTraffic.cars.set(car.id,car);let warned=false;
  for(let i=0;i<400;i++){
    sim.update(.05,input);const gate=sim.crossings[0];if(gate.state==='warning')warned=true;
    if(gate.state==='closing'||gate.state==='closed')assert.equal(sim.roadTraffic.crossingClear(gate.s),true);
  }
  assert.equal(warned,true);assert.equal(sim.crossings[0].state,'closed');assert.ok(car.s>230);
});

test('attaching a scenery tile cannot add or change simulation road traffic',async()=>{
  const THREE=await import('three'),{RailwayRenderer}=await import('../src/render/renderer');
  const sim=configured(),before=sim.roadTraffic.snapshotState();
  const renderer:any={scene:new THREE.Scene(),loaded:new Map(),requested:new Set(['fixture']),requestTokens:new Map([['fixture',1]]),tileRetries:new Map(),walkers:new Map(),tileCount:0,triangles:0,placements:0,roadTraffic:sim.roadTraffic,evictInactiveTiles:()=>{},clearRequest:()=>{},updateTiles:()=>{}};
  const position=new Float32Array([0,0,0,1,0,0,0,0,1]);
  (RailwayRenderer.prototype as any).onWorker.call(renderer,{type:'tile',id:'fixture',token:1,mesh:{position,normal:new Float32Array([0,1,0,0,1,0,0,1,0]),color:new Float32Array(9).fill(1),index:new Uint32Array([0,1,2])},roads:[{...road,id:'unexpected-tile-road'}]});
  assert.equal(renderer.loaded.has('fixture'),true);
  assert.deepEqual(sim.roadTraffic.snapshotState(),before);
  assert.equal(sim.roadTraffic.roads.has('unexpected-tile-road'),false);
});
