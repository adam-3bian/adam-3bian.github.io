import { RouteGeometry } from '../core/geometry.js';
import { Terrain } from './surfaces.js';
import { buildTile } from './build.js';
let route, terrain;
const scope = globalThis;
scope.onmessage = (event) => {
    const message = event.data;
    try {
        if (message.type === 'init') {
            const data = message.route;
            route = new RouteGeometry(data);
            const buffer = message.terrain;
            terrain = new Terrain(data.terrain, new Uint16Array(buffer));
            scope.postMessage({ type: 'ready' });
            return;
        }
        if (message.type === 'build') {
            if ((!route || !terrain) && message.tile.compositionSchema !== 1)
                throw new Error('World worker has not been initialised.');
            const tile = message.tile;
            let last = -1, lastAt = 0;
            const result = buildTile(tile, route, terrain, fraction => {
                const now = performance.now();
                if (fraction <= last || (fraction < .99 && fraction - last < .02 && now - lastAt < 500)) return;
                last = fraction; lastAt = now;
                scope.postMessage({ type: 'progress', id: tile.id, token: message.token, fraction });
            });
            scope.postMessage({ type: 'tile', id: tile.id, token: message.token, ...result }, [result.mesh.position.buffer, result.mesh.normal.buffer, result.mesh.color.buffer, result.mesh.index.buffer]);
        }
    }
    catch (error) {
        scope.postMessage({ type: 'error', id: message.tile?.id, token: message.token, message: error instanceof Error ? error.message : String(error) });
    }
};
