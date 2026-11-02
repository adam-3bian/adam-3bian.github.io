import { defineConfig } from 'vite';
import { resolve } from 'node:path';
import { readFileSync, writeFileSync } from 'node:fs';
import { worldIdentity } from './scripts/world-version.js';
/** The repository root and the portable site folder both serve the same build. */
function railwayEntries() {
    let writeRootEntry = false;
    return {
        name: 'railway-static-entries',
        enforce: 'post',
        configResolved(config) { writeRootEntry = config.command === 'build' && resolve(config.root, config.build.outDir) === resolve(config.root, 'site'); },
        configureServer(server) {
            // The checked-in root index is the static release; Vite's dev server uses the source entry.
            server.middlewares.use((request, _response, next) => {
                if (request.url && /^\/(?:index\.html)?(?:\?.*)?$/.test(request.url))
                    request.url = request.url.replace(/^\/(?:index\.html)?(?=\?|$)/, '/app.html');
                next();
            });
        },
        generateBundle(_options, bundle) {
            const html = bundle['app.html'];
            if (!html || html.type !== 'asset' || typeof html.source !== 'string')
                throw new Error('The app HTML entry was not generated.');
            delete bundle['app.html'];
            html.fileName = 'index.html';
            bundle['index.html'] = html;
        },
        writeBundle(_options, bundle) {
            if (!writeRootEntry)
                return;
            const html = bundle['index.html'];
            if (!html || html.type !== 'asset' || typeof html.source !== 'string' || !html.source.includes('<head>'))
                throw new Error('The static root entry could not be generated.');
            writeFileSync(resolve('index.html'), html.source.replace('<head>', '<head>\n    <base href="./site/">'));
        },
    };
}
export default defineConfig({
    base: './',
    build: { rollupOptions: { input: resolve('app.html') } },
    plugins: [railwayEntries()],
    define: { __RAILWAY_WORLD_HASH__: JSON.stringify(worldIdentity()), __RAILWAY_WORLD_REVISION__: JSON.stringify(JSON.parse(readFileSync(resolve('public/data/grid/world.json'), 'utf8')).revision) },
});
