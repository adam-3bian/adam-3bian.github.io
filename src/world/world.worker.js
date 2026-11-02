import { RouteGeometry } from '../core/geometry.js';
import { Terrain } from './surfaces.js';
import { buildTile } from './build.js';
import {decodeAuthoredBytes} from './authored-codec.js';
let route, terrain;
const scope = globalThis;
scope.onmessage = async (event) => {
    const message = event.data;
    try {
        if (message.type === 'init') {
            if(message.authored){scope.postMessage({type:'ready'});return;}
            const data = message.route;
            route = new RouteGeometry(data);
            const buffer = message.terrain;
            terrain = new Terrain(data.terrain, new Uint16Array(buffer));
            scope.postMessage({ type: 'ready' });
            return;
        }
        if (message.type === 'build') {
            if ((!route || !terrain) && message.tile.compositionSchema !== 1 && !['AUTHORED_PREFABS','AUTHORED_GZIP'].includes(message.tile.composition))
                throw new Error('World worker has not been initialised.');
            let tile = message.tile;
            if(tile.composition==='AUTHORED_GZIP'){
                scope.postMessage({type:'progress',id:tile.id,token:message.token,fraction:.02,stage:'DECODING'});
                tile=await decodeAuthoredBytes(tile.bytes,tile.contentSHA256);
                if(tile.id!==message.tile.id)throw new Error('Authored chunk owner mismatch');
                scope.postMessage({type:'progress',id:tile.id,token:message.token,fraction:.1,stage:'DECODED'});
            }
            let last = -1, lastAt = 0;
            const result = buildTile(tile, route, terrain, fraction => {
                const now = performance.now();
                if (fraction <= last || (fraction < .99 && fraction - last < .02 && now - lastAt < 500)) return;
                last = fraction; lastAt = now;
                scope.postMessage({ type: 'progress', id: tile.id, token: message.token, fraction:.1+fraction*.75 });
            });
            scope.postMessage({type:'progress',id:tile.id,token:message.token,fraction:.9,stage:'COMPOSED'});
            scope.postMessage({ type: 'tile', id: tile.id, token: message.token, ...result }, [result.mesh.position.buffer, result.mesh.normal.buffer, result.mesh.color.buffer, result.mesh.index.buffer,...result.lodIndex?[result.lodIndex.buffer]:[]]);
        }
    }
    catch (error) {
        scope.postMessage({ type: 'error', id: message.tile?.id, token: message.token, message: error instanceof Error ? error.message : String(error) });
    }
};
