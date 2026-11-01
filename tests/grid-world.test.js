import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { GRID, anchor, cell, decodeGrid, encodeGrid, connections, occupancy } from '../src/world/grid.js';
import { CurvePath, Polyline, RouteGeometry } from '../src/core/geometry.js';
import { mappedPlatforms } from '../src/world/platforms.js';
import { RailwaySimulation } from '../src/core/simulation.js';
import { Terrain, engineerSurfaceRoad } from '../src/world/surfaces.js';
const document = JSON.parse(readFileSync('public/data/grid/world.json', 'utf8'));
const load = () => decodeGrid(document.route);
test('grid addresses retain negative cells, sub-cell position and fine height ticks', () => {
    assert.deepEqual(cell(anchor([-.01, 58.625, -16.01])), { x: -1, z: -2, zLevel: 1876 });
    assert.throws(() => decodeGrid({ $grid: [0, NaN, 0] }));
    assert.throws(() => encodeGrid({ position: [0, Infinity, 0] }));
    const r = load();
    assert.deepEqual(encodeGrid(r), document.route);
    assert.equal(document.grid.heightStep, 1 / 32);
});
test('smooth railway follows every anchor with continuous heading and pitch at cell seams', () => {
    const path = new CurvePath([[0, 10, 0], [15.75, 10.125, 3], [32, 10.25, 12], [48, 10.375, 26], [64, 10.5, 48]]);
    for (let i = 1; i < path.points.length - 1; i++) {
        const s = path.lengths[i], a = path.sample(s - 1e-5), b = path.sample(s + 1e-5);
        assert.ok(Math.abs(a.yaw - b.yaw) < 1e-5);
        assert.ok(Math.abs(a.pitch - b.pitch) < 1e-5);
        assert.deepEqual(path.sample(s).position, path.points[i]);
    }
    assert.ok(path.sample(path.lengths[1] + 4).position[2] > 3);
    const uphill = new CurvePath([[0, 0, 0], [10, .03125, 0], [20, .03125, 0], [30, .0625, 0]]);
    for (let s = 0; s < uphill.length; s += .1)
        assert.ok(uphill.sample(s).grade >= -1e-10);
});
test('all emitted tiles and terrain belong to the authoritative revision', () => {
    const sha = (bytes) => createHash('sha256').update(bytes).digest('hex');
    assert.equal(sha(readFileSync('public/data/grid/terrain.bin')), document.terrainSHA256);
    for (const tile of document.tiles) {
        const bytes = readFileSync(`public/${tile.url}`);
        assert.equal(sha(bytes), tile.sha256);
        assert.equal(decodeGrid(JSON.parse(bytes.toString())).id, tile.id);
    }
});
test('Kidderminster separates NR platforms from Town and connects the heritage graph to the exchange', () => {
    const r = load(), platforms = r.platforms, edges = r.railwayGraph.edges;
    assert.equal(platforms.filter(p => p.station === 'KID').length, 2);
    assert.equal(platforms.find(p => p.id === 'way/40432996').station, 'KDT');
    const neighbours = new Map();
    for (const e of edges) {
        for (const [a, b] of [[e.from, e.to], [e.to, e.from]]) {
            const list = neighbours.get(a) || [];
            list.push(b);
            neighbours.set(a, list);
        }
    }
    const start = edges.find(e => e.sourceWayIds.includes('4016362')).from, seen = new Set([start]), queue = [start];
    while (queue.length)
        for (const n of neighbours.get(queue.pop()) || [])
            if (!seen.has(n)) {
                seen.add(n);
                queue.push(n);
            }
    assert.ok(edges.some(e => e.region === 'kidderminster' && seen.has(e.from)), 'source node continuity to Network Rail exchange');
    assert.equal(r.svr, undefined);
    assert.deepEqual(r.extraStations.map(s => s.id), ['KDT']);
    assert.ok(edges.filter(e => e.region === 'svr').length > 100);
});
test('Galton platforms occupy two levels and rail/tram share no connectivity', () => {
    const r = load(), route = new RouteGeometry(r), p = mappedPlatforms(route).filter(p => p.station === 'SGB');
    assert.equal(p.length, 4);
    const heights = p.map(p => p.top(...p.centre)).sort((a, b) => a - b);
    assert.ok(heights[2] - heights[1] > 5.5);
    const pieces = r.gridPieces;
    const nodes = connections(pieces), stacks = occupancy(pieces);
    assert.ok([...stacks.values()].some(stack => stack.length > 1));
    for (const [id, ports] of nodes)
        assert.ok(ports.every(p => p.mode === id.split('/')[0]));
    for (const station of ['JEQ', 'THW']) {
        const platforms = r.platforms.filter(p => p.station === station);
        assert.equal(platforms.filter(p => p.mode === 'tram').length, 2);
        assert.equal(platforms.filter(p => p.mode === 'rail').length, 2);
        for (const platform of platforms.filter(p => p.mode === 'rail'))
            assert.equal(platform.binding, 'mainline');
    }
});
test('The Hawthorns retains two local Metro paths and binds each tram platform to its own track',()=>{
    const data=load(),route=new RouteGeometry(data),station=route.stations.find(s=>s.id==='THW');
    const services=data.adjacentServices.filter(s=>s.id.startsWith('hawthorns-metro'));
    assert.equal(services.length,2);
    for(const service of services){
        assert.equal(service.metadata.mode,'tram');assert.equal(service.metadata.renderStatic,true);
        const path=new Polyline(service.points),near=path.nearest(station.position[0],station.position[2]),p=path.sample(near.s).position,rail=route.sample(route.project(p[0],p[2]).s).position;
        assert.ok(near.distance<25);assert.ok(Math.abs(p[1]-rail[1])<2);
        const edges=data.railwayGraph.edges.filter(e=>e.id.startsWith(`context/${service.id}/`));assert.ok(edges.length>10);assert.ok(edges.every(e=>e.mode==='tram'));
        for(let i=1;i<edges.length;i++)assert.equal(edges[i-1].to,edges[i].from);
    }
    const platforms=data.platforms.filter(p=>p.station==='THW'&&p.mode==='tram');
    assert.deepEqual(platforms.map(p=>p.binding).sort(),services.map(s=>s.id).sort());
    const rendered=mappedPlatforms(route).filter(p=>p.station==='THW');
    for(const p of platforms){
        assert.ok(p.legacyBinding&&p.legacyFootprint);const service=services.find(s=>s.id===p.binding),model=rendered.find(m=>m.id===p.id),path=new Polyline(service.points),near=path.nearest(...model.centre),rail=path.sample(near.s).position;
        assert.ok(near.distance>1.5&&near.distance<10);assert.ok(Math.abs(model.top(...model.centre)-rail[1]-.3)<.1);
    }
});
test('Jewellery Quarter platform paths and paired tunnel openings respect Metro levels',()=>{
    const data=load(),tracks=data.adjacentServices.filter(s=>s.metadata?.mode==='tram'&&s.metadata?.renderStatic).map(s=>({id:s.id,path:new Polyline(s.points)}));
    for(const source of ['way/1208250339/0','way/1208250340/0']){
        const roads=data.surfaceRoads.filter(r=>r.id===source||r.id.startsWith(`${source}/`));assert.ok(roads.length);
        for(const road of roads){assert.equal(road.mode,'pedestrian-crossing');assert.ok(road.legacyPoints?.length);
            for(const point of [road.points[0],road.points.at(-1)]){const nearest=tracks.map(t=>({path:t.path,hit:t.path.nearest(point[0],point[2])})).sort((a,b)=>a.hit.distance-b.hit.distance)[0];assert.ok(nearest.hit.distance<10);assert.ok(Math.abs(point[1]-nearest.path.sample(nearest.hit.s).position[1])<.3);}
        }
    }
    for(const ids of [['osm/31545005','osm/171828711'],['osm/18108427','osm/171828639']]){
        const pair=ids.map(id=>data.adjacentServices.find(s=>s.id===id)),civil=data.civils.find(c=>c.id===pair[0].metadata.sharedCivil);
        assert.ok(civil?.metadata.tunnel);assert.equal(civil.id,pair[1].metadata.sharedCivil);assert.ok(civil.metadata.boreRadius>3.5);
    }
});
test('Kidderminster heritage stays scenery, retaining the departure gradient and nearby civil spans', () => {
    const master = load(), heritage = master.kidderminsterHeritage, route = new CurvePath(heritage.points);
    assert.equal(heritage.sceneryOnly, true);
    assert.ok(route.length > 1500 && route.length <= 2400);
    assert.ok(Math.abs(route.sample(700).grade + 1 / 112) < .002);
    const tracks = master.adjacentServices;
    assert.ok(tracks.some(t => t.metadata?.name === 'Falling Sands Viaduct' && t.metadata.bridge));
    assert.ok(!tracks.some(t => t.metadata?.name === 'Bewdley Tunnel'));
    assert.ok(tracks.filter(t => t.metadata?.region === 'tyseley').length > 30);
    const sim = new RailwaySimulation(new RouteGeometry(master)), saved = JSON.parse(JSON.stringify(sim.snapshot()));
    const again = new RailwaySimulation(new RouteGeometry(load()));
    again.restore(saved);
    assert.deepEqual(again.snapshot(), sim.snapshot());
});
test('crossing walkways respect rail levels and the urban tunnel keeps its documented grade', () => {
    const r = load(), route = new RouteGeometry(r), terrain = new Terrain(r.terrain, new Uint16Array(Uint8Array.from(readFileSync('public/data/grid/terrain.bin')).buffer));
    const roads = r.surfaceRoads;
    const cycle = engineerSurfaceRoad(roads.find(r => r.id.startsWith('way/135883943/0') && r.mode==='under'), route, terrain);
    assert.equal(cycle.mode, 'under');
    assert.ok(route.sample(cycle.routeS).position[1] - cycle.path.sample(cycle.crossingS).position[1] > 5.7);
    const access = engineerSurfaceRoad(roads.find(r => r.id === 'way/1386987078/0'), route, terrain);
    assert.equal(access.mode, 'over');
    assert.ok(access.width < 2.3);
    const tunnel = r.tunnels.find(t => t.id === 'snow-hill-tunnel');
    for (let s = tunnel.start + 30; s < tunnel.end - 30; s += 40)
        assert.ok(Math.abs(route.sample(route.sourceS(s)).grade + 1 / 45) < .003);
    assert.ok(r.civils.some(c => c.metadata.name === 'Duddeston Viaduct' && c.metadata.unused));
});

test('Comberton Hill uses a connected bridge piece over Kidderminster station',()=>{
  const data=load(),route=new RouteGeometry(data),roads=data.surfaceRoads;
  const bridge=roads.find(r=>r.id==='way/40433000/0');assert.ok(bridge);assert.equal(bridge.template,'road/bridge');assert.equal(bridge.mode,'over');
  const span=new CurvePath(bridge.points),mid=span.sample(span.length/2).position,near=route.project(mid[0],mid[2],100);assert.ok(mid[1]-route.sample(near.s).position[1]>5.5);
  for(const id of ['way/506995957/0','way/40432999/0']){const approaches=roads.filter(r=>r.id.startsWith(id));assert.ok(approaches.length);const ends=approaches.flatMap(a=>[a.points[0],a.points.at(-1)]),bridges=[bridge.points[0],bridge.points.at(-1)];assert.ok(ends.some(a=>bridges.some(b=>Math.hypot(...a.map((n,i)=>n-b[i]))<.05)));}
  assert.equal(data.terrain.step,GRID.cellSize);assert.ok(data.construction.catalog.some(c=>c.id==='road/junction'));assert.ok(data.roadJunctions.length>100);
  assert.ok(roads.some(r=>r.id.startsWith('osm-road/')&&r.connectionNodes?.length===2));
  assert.ok(roads.every(r=>r.occupancy?.length&&r.asset==='existing/road-surface'&&r.maxLevel>r.minLevel));
  assert.ok(data.gridPieces.every(p=>p.occupancy?.length&&p.assets?.rails==='existing/rails'));
  assert.ok(data.gridPieces.some(p=>p.template==='rail/bridge'));
  assert.ok(data.gridPieces.some(p=>p.template==='rail/tunnel'));
  assert.ok(data.railJunctions.some(p=>p.template==='rail/turnout'&&p.ports.length>=3));
  assert.equal(data.construction.referenceCatalog.rail.length,44);assert.equal(data.construction.referenceCatalog.road.length,10);
  assert.ok(data.bufferStops.some(stop=>stop.track==='osm/4016362'&&stop.node==='318130543'));
  assert.ok(data.landmarks.every(asset=>asset.asset===`landmark/${asset.family}`));
  assert.ok(roads.some(r=>r.sourceAliases?.includes('way/117557344/0/piece/1')),'a collapsed duplicate retains its source ID');
  const degree=new Map();for(const edge of data.railwayGraph.edges)for(const node of [edge.from,edge.to])degree.set(node,(degree.get(node)||0)+1);
  assert.ok(data.bufferStops.length>10);for(const stop of data.bufferStops){assert.equal(degree.get(stop.node),1);const track=data.adjacentServices.find(t=>t.id===stop.track),end=track.metadata.sourceNodeIds[0]===stop.node?track.points[0]:track.points.at(-1);assert.ok(Math.hypot(...end.map((v,i)=>v-stop.position[i]))<.04);assert.equal(stop.asset,'regional/buffer-stop');}
  const approach=roads.find(r=>r.id==='way/10063626/0/piece/2'),a=approach.points[0],b=approach.points.at(-1);assert.ok(Math.abs(b[1]-a[1])/Math.hypot(b[0]-a[0],b[2]-a[2])<.2,'the mapped Andover Street approach no longer drops abruptly');
});

test('each shared road port has one grid position even across tile boundaries',()=>{
 const nodes=new Map();
 for(const road of load().surfaceRoads)for(const end of [0,1]){
  const id=road.connectionNodes?.[end];if(!id)continue;
  const point=road.points[end?road.points.length-1:0],first=nodes.get(id);
  if(first)assert.ok(Math.hypot(...point.map((v,i)=>v-first[i]))<.05,`${id}: disconnected road anchors`);
  else nodes.set(id,point);
 }
});

test('mapped road crossings coincide with their operational gates and retain the old positions',()=>{
 const data=load(),route=new RouteGeometry(data);
 for(const [id,roadId,nodes] of [
  ['blakedown-crossing','way/24441396/0/piece/0',[1951184815,1951184816]],
  ['cradley-crossing','way/52127510/0/piece/8',[529903940,3041392193]],
  ['langley-crossing','way/137652673/0/piece/1',[2500432257,310426038]],
  ['bentley-heath-crossing','way/27802023/0',[304916001,1228462952]],
 ]){
  const gate=data.crossings.find(c=>c.id===id),road=data.surfaceRoads.find(r=>r.id===roadId);
  assert.ok(gate&&road,`${id} and its road must exist`);
  assert.deepEqual(gate.sourceNodeIds,nodes);assert.ok(Number.isFinite(gate.legacyChainage)&&gate.legacyPosition.length===3);
  assert.equal(road.mode,'crossing',`${roadId} must be at rail level`);
  assert.ok(Math.abs(road.routeS-route.sourceS(gate.s))<10,`${id} must control its mapped road`);
 }
 const bentley=data.crossings.find(c=>c.id==='bentley-heath-crossing');
 assert.ok(Math.abs(bentley.legacyChainage-bentley.s)>200);
 const path=data.surfaceRoads.find(r=>r.id==='way/1419362323/0/piece/1');
 assert.equal(path.mode,'ground','a path ending beside the railway is not a level crossing or underpass');
});
