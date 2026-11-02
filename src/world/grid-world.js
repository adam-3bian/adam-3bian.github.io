import { routeResourceUrl } from '../core/resource-url.js';
import { decodeGrid, GRID } from './grid.js';
import {decodeAuthoredBytes} from './authored-codec.js';
export async function sha256(bytes) { return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', bytes)), v => v.toString(16).padStart(2, '0')).join(''); }
async function readResponse(response, stage, progress) {
    const size = Number(response.headers.get('content-length')), encoding = response.headers.get('content-encoding');
    const total = Number.isFinite(size) && size > 0 && (!encoding || encoding === 'identity') ? size : undefined;
    if (!response.body || !progress) {
        const data = await response.arrayBuffer();
        progress?.({ stage, loaded: data.byteLength, total });
        return data;
    }
    const reader = response.body.getReader(), chunks = [];
    let loaded = 0;
    progress({ stage, loaded, total });
    while (true) {
        const result = await reader.read();
        if (result.done)
            break;
        chunks.push(result.value);
        loaded += result.value.byteLength;
        progress({ stage, loaded, total });
    }
    const data = new Uint8Array(loaded);
    let offset = 0;
    for (const chunk of chunks) {
        data.set(chunk, offset);
        offset += chunk.byteLength;
    }
    return data.buffer;
}
export class GridWorld {
    document;
    terrain;
    baseURI;
    route;
    tiles = new Map();
    pending = new Map();
    catalogue;
    enums;
    savedTiles;
    constructor(document, terrain, baseURI, saved) {
        this.document = document;
        this.terrain = terrain;
        this.baseURI = baseURI;
        if (document.schema !== 1 || JSON.stringify(document.grid) !== JSON.stringify(GRID))
            throw new Error('Unsupported grid world format.');
        this.route = decodeGrid(document.route);
        if(document.authoredWorld){this.route.authoredWorld=document.authoredWorld;this.route.tiles=document.tiles;this.route.ambientZones=document.ambientZones||[];}
        this.route.gridRevision = document.revision;
        this.savedTiles=saved?.tiles;
        if (saved)
            for (const [id, tile] of Object.entries(saved.tiles))
                this.cacheTile(id, tile);
        this.catalogue = saved?.catalogue;
        this.enums = saved?.enums;
    }
    /** Small construction scene using the same chunk cache, integrity checks and snapshots.
     * Separate from the legacy route until its migration gates pass. */
    static async loadComposition(baseURI, saved, progress) {
        if (saved) {
            if (!saved.catalogue || !saved.enums || saved.document.composition !== 1) throw new Error('Incomplete saved prefab world');
            return new GridWorld(saved.document, saved.terrain, baseURI, saved);
        }
        const read = async (url, expected) => {
            const response = await fetch(routeResourceUrl(url, baseURI), {signal: AbortSignal.timeout(30000)});
            if (!response.ok) throw new Error(`Prefab world ${url}: HTTP ${response.status}. Restore the required JSON file.`);
            const bytes = await readResponse(response, 'prefabs', progress);
            if (expected && await sha256(bytes) !== expected) throw new Error(`Prefab world ${url}: revision mismatch`);
            try { return JSON.parse(new TextDecoder().decode(bytes)); } catch { throw new Error(`Prefab world ${url}: invalid JSON`); }
        };
        const document = await read('data/grid/scenes/kidderminster/world.json');
        if (document.composition !== 1) throw new Error('Unsupported prefab world');
        const world = new GridWorld(document, new ArrayBuffer(0), baseURI);
        [world.catalogue, world.enums] = await Promise.all([read(document.catalogue.url, document.catalogue.sha256),read(document.enums.url, document.enums.sha256)]);
        return world;
    }
    static async load(baseURI, saved, progress) {
        if (saved) {
            progress?.({ stage: 'saved', loaded: 1, total: 1 });
            return new GridWorld(saved.document, saved.terrain, baseURI, saved);
        }
        const r = await fetch(routeResourceUrl('data/grid/authored-world.json', baseURI),{signal:AbortSignal.timeout(30000)});
        if (!r.ok)
            throw new Error('The railway grid world could not be loaded.');
        const document = JSON.parse(new TextDecoder().decode(await readResponse(r, 'world', progress)));
        if(document.routeData){
            const response=await fetch(routeResourceUrl(document.routeData.url,baseURI),{signal:AbortSignal.timeout(30000)});
            if(!response.ok)throw Error(`Operational world data: HTTP ${response.status}`);
            const bytes=await readResponse(response,'operations',progress);
            const hash=await sha256(bytes);if(hash!==document.routeData.sha256&&hash!==document.routeData.contentSHA256)throw Error('Operational world data belongs to another revision');
            document.route=await GridWorld.decodeJSON(bytes,document.routeData.contentSHA256);
        }
        const response = await fetch(routeResourceUrl(document.route.terrain.url, baseURI));
        if (!response.ok)
            throw new Error('The world height grid could not be loaded.');
        const terrain = await readResponse(response, 'terrain', progress);
        if (await sha256(terrain) !== document.terrainSHA256)
            throw new Error('The world height grid belongs to another revision.');
        return new GridWorld(document, terrain, baseURI);
    }
    static async decodeJSON(bytes,hash){
        if(typeof Worker==='undefined')return decodeAuthoredBytes(bytes,hash);
        const worker=new Worker(new URL('./data.worker.js',import.meta.url),{type:'module'});
        try{return await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('Operational world decoding timed out')),90000);worker.onmessage=({data})=>{clearTimeout(timer);data.error?reject(Error(data.error)):resolve(data.value);};worker.onerror=e=>{clearTimeout(timer);reject(Error(e.message));};worker.postMessage({bytes,hash},[bytes]);});}
        finally{worker.terminate();}
    }
    cacheTile(id,value){
        this.tiles.delete(id);this.tiles.set(id,value);
        const size=v=>typeof v==='string'?v.length*2:v.byteLength||JSON.stringify(v).length*2;
        let bytes=[...this.tiles.values()].reduce((n,v)=>n+size(v),0);
        for(const [key,tile] of this.tiles){if(bytes<=96*1024*1024||this.tiles.size===1)break;bytes-=size(tile);this.tiles.delete(key);}
    }
    /** Keep archived tiles as their checked JSON bytes until they are needed for a scene. */
    async encodedTile(id) {
        if (this.tiles.has(id)) {
            const value=this.tiles.get(id);this.cacheTile(id,value);return value;
        }
        if(this.savedTiles?.[id]!==undefined){const value=this.savedTiles[id];this.cacheTile(id,value);return value;}
        const pending = this.pending.get(id);
        if (pending)
            return pending;
        const task = (async () => {
            const tile = this.document.tiles.find(t => t.id === id);
            if (!tile)
                throw new Error(`Unknown world tile ${id}`);
            const r = await fetch(routeResourceUrl(tile.url, this.baseURI), { signal: AbortSignal.timeout(30000) });
            if (!r.ok)
                throw new Error(`World tile ${id}: HTTP ${r.status}`);
            const bytes = await r.arrayBuffer();
            const hash=await sha256(bytes);
            if (hash !== tile.sha256 && !(tile.codec==='gzip-json'&&hash===tile.contentSHA256))
                throw new Error(`World tile ${id} belongs to another revision`);
            if (tile.codec === 'gzip-json') {
                this.cacheTile(id, bytes);
                return bytes;
            }
            const encoded = new TextDecoder().decode(bytes);
            if (JSON.parse(encoded).id !== id)
                throw new Error(`World tile ${id} has an invalid owner`);
            this.cacheTile(id, encoded);
            return encoded;
        })();
        this.pending.set(id, task);
        try {
            return await task;
        }
        finally {
            this.pending.delete(id);
        }
    }
    async tile(id) {
        const encoded = await this.encodedTile(id);
        const descriptor=this.document.tiles.find(t=>t.id===id);
        if(descriptor?.codec==='gzip-json'){
            if(!(encoded instanceof ArrayBuffer))throw new Error(`Invalid saved authored chunk ${id}`);
            return {id,composition:'AUTHORED_GZIP',bytes:encoded.slice(0),contentSHA256:descriptor.contentSHA256};
        }
        const tile = decodeGrid(typeof encoded === 'string' ? JSON.parse(encoded) : encoded);
        if (this.document.composition === 1) {
            const context = await Promise.all([id, ...(this.document.tiles.find(t=>t.id===id).dependencies || [])].map(async key=>{
                const value=await this.encodedTile(key); return typeof value==='string'?JSON.parse(value):value;
            }));
            return {...tile,compositionSchema:1,catalogue:this.catalogue,enums:this.enums,context};
        }
        return tile;
    }
    /** Capture every tile before atomically saving a journey and its world. */
    async snapshot() { const todo = [...this.document.tiles],tiles=new Map(); await Promise.all(Array.from({ length: 4 }, async () => { while (todo.length){
        const id=todo.pop().id;tiles.set(id,await this.encodedTile(id));} })); return { document: this.document, tiles: Object.fromEntries(tiles), terrain: this.terrain, ...(this.document.composition===1?{catalogue:this.catalogue,enums:this.enums}:{}) }; }
}
