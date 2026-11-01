import test from 'node:test';
import assert from 'node:assert/strict';
import { ViewportSizing } from '../src/render/viewport.js';
test('resize follows container, coalesces events, preserves valid buffers at zero size and disposes listeners', () => {
    const previous = { window: globalThis.window, ResizeObserver: globalThis.ResizeObserver, requestAnimationFrame: globalThis.requestAnimationFrame, cancelAnimationFrame: globalThis.cancelAnimationFrame };
    const events = new Map();
    let observerCallback = () => { }, disconnected = false, queued = () => { };
    Object.assign(globalThis, { window: { addEventListener: (k, f) => events.set(k, f), removeEventListener: (k) => events.delete(k) }, ResizeObserver: class {
            constructor(cb) { observerCallback = cb; }
            observe() { }
            disconnect() { disconnected = true; }
        }, requestAnimationFrame: (cb) => { queued = cb; return 1; }, cancelAnimationFrame: () => { } });
    try {
        const sizes = [], container = { clientWidth: 800, clientHeight: 600 }, camera = { aspect: 0, updateProjectionMatrix() { } };
        const v = new ViewportSizing(container, { setDrawingBufferSize: (...a) => sizes.push(a) }, camera, 4096);
        assert.deepEqual(sizes.at(-1), [800, 600, .5]);
        v.setScale(.25);
        assert.deepEqual(sizes.at(-1), [800, 600, .25]);
        v.setScale(1);
        assert.deepEqual(sizes.at(-1), [800, 600, 1]);
        Object.assign(container, { clientWidth: 0, clientHeight: 0 });
        observerCallback();
        events.get('resize')();
        queued();
        assert.equal(sizes.length, 3);
        assert.ok(Number.isFinite(camera.aspect));
        Object.assign(container, { clientWidth: 1200, clientHeight: 700 });
        observerCallback();
        queued();
        assert.deepEqual(sizes.at(-1), [1200, 700, 1]);
        assert.equal(camera.aspect, 1200 / 700);
        Object.assign(container, { clientWidth: 20000, clientHeight: 10000 });
        v.resize();
        const [w, h, r] = sizes.at(-1);
        assert.ok(w * r <= 4096 && h * r <= 4096);
        assert.ok(w * h * r * r <= 16777216);
        v.dispose();
        assert.equal(events.size, 0);
        assert.equal(disconnected, true);
    }
    finally {
        Object.assign(globalThis, previous);
    }
});
