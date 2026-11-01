import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { routeResourceUrl } from '../src/core/resource-url.js';
import { fileHash, sourceFingerprint, worldIdentity } from '../scripts/world-version.js';
test('route resources stay inside a static site at the root or in a nested folder', () => {
    assert.equal(routeResourceUrl('data/route.json', 'https://example.org/'), 'https://example.org/data/route.json');
    assert.equal(routeResourceUrl('/data/terrain.bin', 'https://example.org/railway/site/'), 'https://example.org/railway/site/data/terrain.bin');
    assert.equal(routeResourceUrl('data/tiles/-10_-1.json', 'https://example.org/railway/index.html'), 'https://example.org/railway/data/tiles/-10_-1.json');
    for (const path of ['https://example.org/data/x', 'data/../secrets', 'data/x?other=1', 'data//x'])
        assert.throws(() => routeResourceUrl(path, 'https://example.org/site/'));
});
test('existing saves keep their world identity only while hosting-only sources and data match', () => {
    const baseline = JSON.parse(readFileSync('scripts/world-version-baseline.json', 'utf8'));
    const matches = sourceFingerprint() === baseline.sourceFingerprint && fileHash(process.cwd(), 'vite.config.js') === baseline.configHash && fileHash(process.cwd(), 'scripts/world-version.js') === baseline.policyHash;
    assert.equal(worldIdentity() === baseline.legacyWorldHash, matches);
    for (const path of ['src/core/simulation.js', 'src/render/renderer.js', 'public/data/route.json', 'vite.config.js', 'scripts/world-version.js']) {
        const modified = Buffer.concat([readFileSync(path), Buffer.from('\n')]);
        assert.notEqual(worldIdentity(process.cwd(), new Map([[path, modified]])), baseline.legacyWorldHash, `${path} must invalidate legacy compatibility`);
    }
});
