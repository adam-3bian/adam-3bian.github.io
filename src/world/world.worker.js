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
            if (!route || !terrain)
                throw new Error('World worker has not been initialised.');
            const tile = message.tile, result = buildTile(tile, route, terrain);
            scope.postMessage({ type: 'tile', id: tile.id, token: message.token, ...result }, [result.mesh.position.buffer, result.mesh.normal.buffer, result.mesh.color.buffer, result.mesh.index.buffer]);
        }
    }
    catch (error) {
        scope.postMessage({ type: 'error', id: message.tile?.id, token: message.token, message: error instanceof Error ? error.message : String(error) });
    }
};
