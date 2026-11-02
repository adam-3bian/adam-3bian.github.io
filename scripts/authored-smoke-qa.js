import {preview} from 'vite';
import {chromium} from 'playwright-core';
import fs from 'node:fs';

// A fast functional regression after source repairs. This is deliberately
// separate from the 1080p measurements and the 44 station-approach captures.
const out = 'work/authoring/final-smoke';
fs.mkdirSync(out, {recursive: true});
const expectedRevision = JSON.parse(fs.readFileSync('public/data/grid/authored-world.json')).revision;
const report = {schema: 1, scope: 'Final repaired revision: five streamed locations, driving, offline save and production entry', expectedRevision, quality: 'low', viewport: [1280, 720], renderScale: .5, performanceBenchmark: false, errors: [], visits: []};
const qa = await preview({build: {outDir: 'work/qa-dist'}, preview: {host: '127.0.0.1', port: 4191, strictPort: true}});
const production = await preview({build: {outDir: 'site'}, preview: {host: '127.0.0.1', port: 4192, strictPort: true}});
let browser;
const waitReady = async page => {
    await page.waitForFunction('document.getElementById("loading").hidden && !document.getElementById("begin").disabled || !document.getElementById("error").hidden');
    if (await page.locator('#error').isVisible()) throw Error(await page.locator('#error-text').innerText());
};
try {
    browser = await chromium.launch({executablePath: '/usr/bin/chromium', headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage', '--use-angle=swiftshader', '--enable-unsafe-swiftshader']});
    report.browser = browser.version();
    const context = await browser.newContext({viewport: {width: 1280, height: 720}});
    await context.addInitScript(() => localStorage.setItem('railway-demo-preferences-v1', JSON.stringify({quality: 'low', renderScale: '.5', volume: 0})));
    const page = await context.newPage();
    page.setDefaultTimeout(240000);
    page.on('pageerror', error => report.errors.push(String(error)));
    await page.goto('http://127.0.0.1:4191/');
    await waitReady(page);
    report.initial = await page.evaluate(() => {
        const r = __railway; r.stopAnimation(); r.sim.paused = true;
        const gl = r.view.renderer.getContext(), extension = gl.getExtension('WEBGL_debug_renderer_info');
        return {revision: r.world.document.revision, resolution: [gl.drawingBufferWidth, gl.drawingBufferHeight], gpu: gl.getParameter(extension.UNMASKED_RENDERER_WEBGL), models: r.world.route.authoredInfrastructure.models.length, signals: r.sim.signals.length, switches: r.sim.trackwork.switches.length};
    });
    if (report.initial.revision !== expectedRevision) throw Error('QA build is stale');
    for (const id of ['KID', 'OHL', 'BSW', 'TYS', 'DDG']) {
        const visit = await page.evaluate(async id => {
            const r = __railway;
            if (!r.route.stations.some(s => s.id === id)) throw Error(`Unknown station ${id}`);
            r.startAt(id, 1); r.sim.paused = true; await r.view.preparePosition();
            r.view.firstFrame = true; r.render(); await r.view.finishFrame();
            return {id, loaded: r.view.loaded.size, essentialReady: r.view.essentialReady(), webglError: r.view.renderer.getContext().getError(), triangles: r.view.renderer.info.render.triangles, drawCalls: r.view.renderer.info.render.calls};
        }, id);
        if (!visit.essentialReady || visit.webglError) throw Error(`Scenery failed at ${id}`);
        report.visits.push(visit);
        await page.screenshot({path: `${out}/${id}-final.jpg`, type: 'jpeg', quality: 78});
        console.log(JSON.stringify(visit));
    }
    report.driving = await page.evaluate(async () => {
        const r = __railway; r.startAt('KID', 1); r.sim.paused = true; await r.view.preparePosition();
        const before = r.sim.player.s; r.input.a = true; r.advance(20, true); r.input.a = false; r.render(); await r.view.finishFrame();
        return {before, after: r.sim.player.s, speed: r.sim.player.speed, essentialReady: r.view.essentialReady()};
    });
    if (report.driving.after <= report.driving.before || !report.driving.essentialReady) throw Error('Driving regression');
    report.saved = await page.evaluate(async () => {
        const r = __railway, snapshot = r.sim.snapshot(), world = await r.world.snapshot();
        await r.storage.put(snapshot, world);
        return {s: snapshot.player.s, revision: world.document.revision, chunks: Object.keys(world.tiles).length};
    });
    await page.route('**/data/**', route => route.abort());
    await page.reload(); await waitReady(page);
    await page.evaluate('__railway.stopAnimation(); __railway.sim.paused = true');
    await page.locator('#resume-save').click();
    await page.waitForFunction('document.getElementById("menu").hidden');
    report.resumed = await page.evaluate(() => ({s: __railway.sim.player.s, revision: __railway.world.document.revision, chunks: __railway.world.document.tiles.length}));
    if (report.saved.s !== report.resumed.s || report.resumed.revision !== expectedRevision || report.saved.chunks !== 133) throw Error('Final offline snapshot changed');
    await page.close();
    const release = await context.newPage();
    release.setDefaultTimeout(240000);
    release.on('pageerror', error => report.errors.push(String(error)));
    await release.goto('http://127.0.0.1:4192/'); await waitReady(release);
    report.production = await release.evaluate(() => ({qaApiAbsent: !window.__railway, beginEnabled: !document.getElementById('begin').disabled}));
    let newJourneyReloads = 0;
    release.on('framenavigated', frame => { if (frame === release.mainFrame()) newJourneyReloads++; });
    await release.locator('#begin').click();
    await release.waitForFunction('document.getElementById("menu")?.hidden');
    report.production.started = true;
    report.production.newJourneyReloads = newJourneyReloads;
    await release.screenshot({path: `${out}/production-final.jpg`, type: 'jpeg', quality: 78});
    if (!report.production.qaApiAbsent || newJourneyReloads || report.errors.length) throw Error('Production entry regression');
    report.status = 'IMPLEMENTED_AND_VERIFIED';
} catch (error) {
    report.status = 'FAILED'; report.errors.push(String(error.stack || error)); process.exitCode = 1;
} finally {
    await browser?.close();
    await Promise.all([qa, production].map(server => new Promise(resolve => server.httpServer.close(resolve))));
    fs.writeFileSync(`${out}/report.json`, JSON.stringify(report, null, 2) + '\n');
    console.log(JSON.stringify({status: report.status, errors: report.errors}));
}
