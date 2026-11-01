import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { RouteGeometry, clamp, mps } from '../src/core/geometry.js';
import { RailwaySimulation } from '../src/core/simulation.js';
import { endpointContext } from '../src/world/build.js';
import { decodeGrid } from '../src/world/grid.js';
import { createHash } from 'node:crypto';
const world=JSON.parse(readFileSync('public/data/grid/world.json','utf8'));
const route = new RouteGeometry(decodeGrid(world.route));
route.setEndpointContext(endpointContext(route));
function drive(sim) {
    const p = sim.player;
    let target = mps(route.limit(p.s) - 4), distance = sim.distanceToStop();
    if (sim.targetStation())
        target = Math.min(target, Math.sqrt(Math.max(0, 2 * .45 * (distance - .4))));
    const signal = sim.nextSignal();
    if (signal) {
        const aspect = sim.aspect(signal);
        if (aspect === 'red')
            target = Math.min(target, Math.sqrt(Math.max(0, 2 * .4 * ((signal.s - p.s) * p.direction - 15))));
        else if (aspect === 'yellow')
            target = Math.min(target, mps(30));
    }
    if (sim.aws.pending)
        sim.acknowledge();
    const desired = clamp((target - p.speed) * 1.0, -.8, .75), drag = .012 + .0002 * p.speed * p.speed + route.lanePose(p.s, p.lane).grade * 9.81 * p.direction;
    const traction = Math.min(.95, 6.7 / Math.max(5, p.speed));
    p.controller = desired + drag >= 0 ? clamp((desired + drag) / traction, 0, 1) : -clamp(-(desired + drag) / .95, 0, 1);
    if (p.doors)
        p.controller = -1;
}
const results = [];
for (const direction of [1, -1]) {
    const sim = new RailwaySimulation(route);
    sim.start(direction);
    sim.paused = false;
    let ticks = 0;
    const started = performance.now();
    while (!sim.player.arrived && ticks < 108000) {
        drive(sim);
        sim.update(.1, { a: false, d: false, horn: false });
        ticks++;
        if (sim.paused)
            break;
    }
    const expected = (direction === 1 ? route.stations.slice(1) : route.stations.slice(0, -1).reverse()).map(s => s.id);
    const result = { name: direction === 1 ? 'Kidderminster to Dorridge' : 'Dorridge to Kidderminster', complete: sim.player.arrived, validStopOrder: JSON.stringify(sim.calls) === JSON.stringify(expected), clock: sim.clockText(), seconds: ticks / 10, stationsCalled: sim.calls, expectedStops: 21, stats: sim.stats, wallSeconds: (performance.now() - started) / 1000, lastEvents: sim.events.slice(-6), method: 'Deterministic automated driver on the rail simulation and representative rail infrastructure, with no configured motor-road graph; not mixed-traffic, human recognition or GPU performance acceptance.' };
    results.push(result);
    console.log(JSON.stringify(result));
}
const soak = new RailwaySimulation(route);
soak.start(1);
soak.player.s = 1000;
soak.player.controller = -1;
soak.paused = false;
const start = performance.now();
for (let i = 0; i < 72000; i++) {
    soak.update(.1, { a: false, d: false, horn: false });
    if (soak.paused)
        break;
}
results.push({ name: 'Two-hour dispatcher/occupation soak', simulatedSeconds: soak.elapsed, stats: soak.stats, wallSeconds: (performance.now() - start) / 1000, eventCount: soak.events.length, method: 'Accelerated CPU rail simulation without a configured motor-road graph; not mixed-traffic or a two-hour browser/GPU soak.' });
const sourceHashes = Object.fromEntries(['scripts/validate-world.js', 'src/core/geometry.js', 'src/core/simulation.js', 'src/render/trackwork.js', 'src/world/build.js', 'src/world/grid.js', 'public/data/grid/world.json'].map(path => [path, createHash('sha256').update(readFileSync(path)).digest('hex')]));
mkdirSync('docs/reports', { recursive: true });
writeFileSync('docs/reports/simulation.json', JSON.stringify({ generatedAt: new Date().toISOString(), sourceHashes, worldRevision:world.revision, routeLength: route.length, results }, null, 2) + '\n');
const failed = results.some(r => r.complete === false || r.validStopOrder === false || r.simulatedSeconds < 7199.9 || r.stats.collisions > 0 || r.stats.aiSpads > 0 || r.stats.spads > 0);
if (failed)
    process.exitCode = 1;
