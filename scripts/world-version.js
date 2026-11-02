import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
const read = (root, path, overrides) => overrides?.get(path) ?? readFileSync(join(root, path));
export const fileHash = (root, path, overrides) => createHash('sha256').update(read(root, path, overrides)).digest('hex');
function sourceFiles(root) {
    const found = [];
    function visit(dir) { for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const path = join(dir, entry.name);
        if (entry.isDirectory())
            visit(path);
        else if (entry.isFile() && /\.(js|json)$/.test(entry.name))
            found.push(relative(root, path).split(sep).join('/'));
    } }
    visit(join(root, 'src'));
    return found.sort();
}
function dataFiles(root) { return ['public/data/route.json', 'public/data/terrain.bin', 'public/data/adjacent-services.json', 'public/data/road-surfaces.json', 'public/data/land-surfaces.json', ...readdirSync(join(root, 'public/data/tiles')).sort().map(name => `public/data/tiles/${name}`)]; }
function gridFiles(root) { const files = []; function visit(dir) { if (!existsSync(dir))
    return; for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory())
        visit(p);
    else
        files.push(relative(root, p).split(sep).join('/'));
} } visit(join(root, 'public/data/grid')); return files.sort(); }
function hashFiles(root, paths, overrides) { const hash = createHash('sha256'); for (const path of paths)
    hash.update(path).update('\0').update(read(root, path, overrides)); return hash.digest('hex'); }
export function sourceFingerprint(root = process.cwd(), overrides) { return hashFiles(root, [...sourceFiles(root), ...dataFiles(root)], overrides); }
/** Preserve the previous world identity only for this exact hosting-only source/data snapshot.
 * Any later source, data, config or policy change disables the compatibility exception. */
export function worldIdentity(root = process.cwd(), overrides) {
    const baselineFile = join(root, 'scripts/world-version-baseline.json');
    if (existsSync(baselineFile)) {
        const baseline = JSON.parse(readFileSync(baselineFile, 'utf8'));
        if (/^[0-9a-f]{64}$/.test(baseline.legacyWorldHash) && baseline.sourceFingerprint === sourceFingerprint(root, overrides) && baseline.configHash === fileHash(root, 'vite.config.js', overrides) && baseline.policyHash === fileHash(root, 'scripts/world-version.js', overrides))
            return baseline.legacyWorldHash;
    }
    const physical = ['vite.config.js', 'scripts/world-version.js', 'src/core/geometry.js', 'src/core/simulation.js', 'src/core/pose.js', 'src/core/resource-url.js', 'src/core/save.js', 'src/world/build.js', 'src/world/access-sites.js', 'src/world/road-sites.js', 'src/world/site-definitions.json', 'src/world/platforms.js', 'src/world/surfaces.js', 'src/world/traffic.js', 'src/world/orientation.js', 'src/world/buildings.js', 'src/world/terrain-grid.js', 'src/world/asset-registry.js', 'src/world/piece-registry.js', 'src/world/piece-graph.js', 'src/render/assets.js', 'src/render/trackwork.js', 'src/render/batch.js', 'src/render/renderer.js', 'src/world/grid.js', 'src/world/grid-world.js', 'src/render/landmarks.js', ...dataFiles(root), ...gridFiles(root)];
    return hashFiles(root, [...new Set([...physical, ...sourceFiles(root)])], overrides);
}
