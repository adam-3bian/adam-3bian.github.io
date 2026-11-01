import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {GRID,anchor,cell,decodeGrid,encodeGrid,connections,occupancy} from '../src/world/grid';
import {CurvePath,RouteGeometry} from '../src/core/geometry';
import {mappedPlatforms} from '../src/world/platforms';
import {RailwaySimulation} from '../src/core/simulation';
import type {RouteData} from '../src/core/types';
import {Terrain,engineerSurfaceRoad} from '../src/world/surfaces';

const document=JSON.parse(readFileSync('public/data/grid/world.json','utf8'));
const load=()=>decodeGrid<RouteData>(document.route);
test('grid addresses retain negative cells, sub-cell position and fine height ticks',()=>{
  assert.deepEqual(cell(anchor([-.01,58.625,-16.01])),{x:-1,z:-2,zLevel:1876});
  assert.throws(()=>decodeGrid({$grid:[0,NaN,0]}));
  assert.throws(()=>encodeGrid({position:[0,Infinity,0]}));
  const r=load();assert.deepEqual(encodeGrid(r),document.route);
  assert.equal(document.grid.heightStep,1/32);
});
test('smooth railway follows every anchor with continuous heading and pitch at cell seams',()=>{
  const path=new CurvePath([[0,10,0],[15.75,10.125,3],[32,10.25,12],[48,10.375,26],[64,10.5,48]]);
  for(let i=1;i<path.points.length-1;i++){
    const s=path.lengths[i],a=path.sample(s-1e-5),b=path.sample(s+1e-5);
    assert.ok(Math.abs(a.yaw-b.yaw)<1e-5);assert.ok(Math.abs(a.pitch-b.pitch)<1e-5);
    assert.deepEqual(path.sample(s).position,path.points[i]);
  }
  assert.ok(path.sample(path.lengths[1]+4).position[2]>3);
  const uphill=new CurvePath([[0,0,0],[10,.03125,0],[20,.03125,0],[30,.0625,0]]);
  for(let s=0;s<uphill.length;s+=.1)assert.ok(uphill.sample(s).grade>=-1e-10);
});
test('all emitted tiles and terrain belong to the authoritative revision',()=>{
  const sha=(bytes:Uint8Array)=>createHash('sha256').update(bytes).digest('hex');
  assert.equal(sha(readFileSync('public/data/grid/terrain.bin')),document.terrainSHA256);
  for(const tile of document.tiles){const bytes=readFileSync(`public/${tile.url}`);assert.equal(sha(bytes),tile.sha256);assert.equal(decodeGrid<any>(JSON.parse(bytes.toString())).id,tile.id);}
});
test('Kidderminster separates NR platforms from Town and connects the heritage graph to the exchange',()=>{
  const r=load(),platforms=r.platforms as any[],edges=(r.railwayGraph as any).edges as any[];
  assert.equal(platforms.filter(p=>p.station==='KID').length,2);
  assert.equal(platforms.find(p=>p.id==='way/40432996').station,'KDT');
  const neighbours=new Map<string,string[]>();for(const e of edges){for(const[a,b]of[[e.from,e.to],[e.to,e.from]]){const list=neighbours.get(a)||[];list.push(b);neighbours.set(a,list);}}
  const start=edges.find(e=>e.sourceWayIds.includes('4016362')).from,seen=new Set([start]),queue=[start];
  while(queue.length)for(const n of neighbours.get(queue.pop()!)||[])if(!seen.has(n)){seen.add(n);queue.push(n);}
  assert.ok(edges.some(e=>e.region==='kidderminster'&&seen.has(e.from)),'source node continuity to Network Rail exchange');
  assert.equal(r.svr,undefined);assert.deepEqual((r.extraStations as any[]).map(s=>s.id),['KDT']);
  assert.ok(edges.filter(e=>e.region==='svr').length>100);
});
test('Galton platforms occupy two levels and rail/tram share no connectivity',()=>{
  const r=load(),route=new RouteGeometry(r),p=mappedPlatforms(route).filter(p=>p.station==='SGB');assert.equal(p.length,4);
  const heights=p.map(p=>p.top(...p.centre)).sort((a,b)=>a-b);assert.ok(heights[2]-heights[1]>5.5);
  const pieces=r.gridPieces as any[];const nodes=connections(pieces),stacks=occupancy(pieces);
  assert.ok([...stacks.values()].some(stack=>stack.length>1));
  for(const [id,ports]of nodes)assert.ok(ports.every(p=>p.mode===id.split('/')[0]));
  for(const station of['JEQ','THW']){
    const platforms=(r.platforms as any[]).filter(p=>p.station===station);assert.equal(platforms.filter(p=>p.mode==='tram').length,2);assert.equal(platforms.filter(p=>p.mode==='rail').length,2);
    for(const platform of platforms.filter(p=>p.mode==='rail'))assert.equal(platform.binding,'mainline');
  }
});
test('Kidderminster heritage stays scenery, retaining the departure gradient and nearby civil spans',()=>{
  const master=load(),heritage=master.kidderminsterHeritage as any,route=new CurvePath(heritage.points);
  assert.equal(heritage.sceneryOnly,true);assert.ok(route.length>1500&&route.length<=2400);
  assert.ok(Math.abs(route.sample(700).grade+1/112)<.002);
  const tracks=master.adjacentServices as any[];
  assert.ok(tracks.some(t=>t.metadata?.name==='Falling Sands Viaduct'&&t.metadata.bridge));
  assert.ok(!tracks.some(t=>t.metadata?.name==='Bewdley Tunnel'));
  assert.ok(tracks.filter(t=>t.metadata?.region==='tyseley').length>30);
  const sim=new RailwaySimulation(new RouteGeometry(master)),saved=JSON.parse(JSON.stringify(sim.snapshot()));
  const again=new RailwaySimulation(new RouteGeometry(load()));again.restore(saved);assert.deepEqual(again.snapshot(),sim.snapshot());
});
test('crossing walkways respect rail levels and the urban tunnel keeps its documented grade',()=>{
  const r=load(),route=new RouteGeometry(r),terrain=new Terrain(r.terrain,new Uint16Array(Uint8Array.from(readFileSync('public/data/grid/terrain.bin')).buffer));
  const roads=r.surfaceRoads as any[];
  const cycle=engineerSurfaceRoad(roads.find(r=>r.id==='way/135883943/0'),route,terrain)!;
  assert.equal(cycle.mode,'under');assert.ok(route.sample(cycle.routeS!).position[1]-cycle.path.sample(cycle.crossingS!).position[1]>5.7);
  const access=engineerSurfaceRoad(roads.find(r=>r.id==='way/1386987078/0'),route,terrain)!;
  assert.equal(access.mode,'over');assert.ok(access.width<2.3);
  const tunnel=(r.tunnels as any[]).find(t=>t.id==='snow-hill-tunnel');
  for(let s=tunnel.start+30;s<tunnel.end-30;s+=40)assert.ok(Math.abs(route.sample(route.sourceS(s)).grade+1/45)<.003);
  assert.ok((r.civils as any[]).some(c=>c.metadata.name==='Duddeston Viaduct'&&c.metadata.unused));
});
