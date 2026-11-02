import {test} from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import {decodeGrid,position} from '../src/world/grid.js';import {RouteGeometry} from '../src/core/geometry.js';import {RailwaySimulation} from '../src/core/simulation.js';import {endpointContext} from '../src/world/build.js';
test('authored signals and switches retain the legacy operating contract without deriving new placements',()=>{
 const data=decodeGrid(JSON.parse(fs.readFileSync('world-source/operations.json'))),route=new RouteGeometry(data);route.setEndpointContext(data.authoredEndpointContext);const authored=new RailwaySimulation(route),saved=structuredClone(data.authoredInfrastructure);delete data.authoredInfrastructure;const oldRoute=new RouteGeometry(data);oldRoute.setEndpointContext(endpointContext(oldRoute));const legacy=new RailwaySimulation(oldRoute);
 assert.deepEqual(authored.signals,legacy.signals);assert.deepEqual(authored.trackwork,legacy.trackwork);assert.equal(saved.models.length,664);assert.equal(new Set(saved.models.map(m=>m.id)).size,saved.models.length);
 for(const signal of authored.signals){const m=saved.models.find(m=>m.id===signal.id),p=route.lanePose(signal.s,signal.lane),expected=p.position.map((v,i)=>v+p.right[i]*(-signal.direction*2.1)-(i===1?.4:0)),actual=position(m.anchor).map((v,i)=>v+m.residual[i]);assert.ok(Math.hypot(...actual.map((v,i)=>v-expected[i]))<1e-9);}
 // A supplied operating model is authoritative even if the source graph is absent.
 route.data.authoredInfrastructure=saved;route.data.network=undefined;const again=new RailwaySimulation(route);assert.equal(again.trackwork.switches.length,32);again.signals[0].s++;assert.notEqual(again.signals[0].s,saved.signals[0].s);
});
