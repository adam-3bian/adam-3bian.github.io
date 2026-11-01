import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { RouteGeometry } from '../src/core/geometry.js';
import { RailwaySimulation } from '../src/core/simulation.js';
import { Terrain } from '../src/world/surfaces.js';
// A diagnostic, not the required accepted timetable/swept-collision scenario.
const files = ['scripts/diagnose-mixed-traffic.js', 'src/core/simulation.js', 'src/core/geometry.js', 'src/world/traffic.js', 'src/world/surfaces.js', 'public/data/route.json', 'public/data/road-surfaces.json', 'public/data/terrain.bin'];
const hashes = Object.fromEntries(files.map(f => [f, createHash('sha256').update(readFileSync(f)).digest('hex')]));
const data = JSON.parse(readFileSync('public/data/route.json', 'utf8')), features = JSON.parse(readFileSync('public/data/road-surfaces.json', 'utf8')).roads;
const bytes = readFileSync('public/data/terrain.bin'), terrain = new Terrain(data.terrain, new Uint16Array(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength)));
const sim = new RailwaySimulation(new RouteGeometry(data));
sim.configureRoadNetwork(features, terrain);
sim.start(1, 0);
sim.player.controller = -1;
sim.paused = false;
const roadCount = sim.roadTraffic.roads.size, carCount = sim.roadTraffic.cars.size, closed = new Set(), overlaps = new Map(), stationary = new Map();
let nonFinite = 0, maxStationary = 0;
const started = performance.now();
for (let tick = 0; tick < 72000 && !sim.paused; tick++) {
    sim.update(.05, { a: false, d: false, horn: false });
    if (tick % 20 !== 19)
        continue;
    for (const c of sim.crossings)
        if (c.state === 'closed')
            closed.add(c.id);
    const lanes = new Map();
    for (const car of sim.roadTraffic.cars.values()) {
        if (!Number.isFinite(car.s) || !Number.isFinite(car.speed) || car.position.some(v => !Number.isFinite(v)))
            nonFinite++;
        const stop = car.speed < .01 ? (stationary.get(car.id) || 0) + 1 : 0;
        stationary.set(car.id, stop);
        maxStationary = Math.max(maxStationary, stop);
        if (car.transition)
            continue;
        const key = `${car.road}/${car.direction}`, list = lanes.get(key) || [];
        list.push(car);
        lanes.set(key, list);
    }
    for (const list of lanes.values()) {
        list.sort((a, b) => a.s - b.s);
        for (let i = 1; i < list.length; i++) {
            const a = list[i - 1], b = list[i], gap = b.s - a.s - (a.length + b.length) / 2;
            if (gap < -.05) {
                const key = [a.id, b.id].sort().join('/');
                const old = overlaps.get(key);
                if (!old || gap < old.minimumGap)
                    overlaps.set(key, { road: a.road, cars: [a.id, b.id], minimumGap: gap });
            }
        }
    }
    if (tick % 6000 === 5999)
        console.log(`Mixed traffic: ${Math.round(sim.elapsed)} / 3600 s; ${overlaps.size} same-lane overlap pairs so far`);
}
const graph = sim.roadTraffic;
let unconnectedRoadEndpoints = 0;
for (const road of sim.roadTraffic.roads.values())
    for (const point of [road.points[0], road.points[road.points.length - 1]])
        if (!(graph.nodes.get(graph.key(point)) || []).some((n) => n.id !== road.id))
            unconnectedRoadEndpoints++;
const longStopped = [...sim.roadTraffic.cars.values()].filter(car => (stationary.get(car.id) || 0) >= 300).map(car => { const road = sim.roadTraffic.roads.get(car.road); const endpoint = road.points[car.direction === 1 ? road.points.length - 1 : 0], nodes = (graph.nodes.get(graph.key(endpoint)) || []).filter((n) => n.id !== road.id); return { id: car.id, road: car.road, direction: car.direction, stoppedSeconds: stationary.get(car.id), distanceToEnd: car.direction === 1 ? road.path.length - car.s : car.s, connectedEndChoices: nodes.length }; });
const result = { generatedAt: new Date().toISOString(), sourceHashes: hashes, scope: '20 Hz accelerated CPU diagnostic, full generated motor-road graph and modelled AI rail services with stationary player. Same-lane longitudinal samples are not swept vehicle collision tests. No browser, geometry, authored timetable, all junction/crossing interactions or gridlock certification. Five-minute stops are investigation candidates; this model has no explicit parked/completed-trip classification.', roadCount, carCount, roadEndpoints: roadCount * 2, unconnectedRoadEndpoints, simulatedSeconds: sim.elapsed, wallSeconds: (performance.now() - started) / 1000, railStats: sim.stats, crossingsObservedClosed: [...closed], nonFiniteSamples: nonFinite, sameLaneOverlapPairCount: overlaps.size, sameLaneOverlapExamples: [...overlaps.values()].slice(0, 50), longestContinuousStoppedSeconds: maxStationary, vehiclesStoppedAtLeastFiveMinutes: longStopped.length, longStoppedVehicles: longStopped, status: 'diagnostic only; mandatory mixed-traffic acceptance remains open' };
writeFileSync('docs/reports/mixed-traffic-diagnostic.json', JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify(result, null, 2));
if (sim.elapsed < 3599.9 || sim.stats.collisions || sim.stats.aiSpads || sim.stats.spads || nonFinite || overlaps.size || longStopped.length)
    process.exitCode = 1;
