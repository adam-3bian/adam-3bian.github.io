import { routeResourceUrl } from '../core/resource-url.js';
import { decodeGrid, GRID } from './grid.js';
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
    constructor(document, terrain, baseURI, saved) {
        this.document = document;
        this.terrain = terrain;
        this.baseURI = baseURI;
        if (document.schema !== 1 || JSON.stringify(document.grid) !== JSON.stringify(GRID))
            throw new Error('Unsupported grid world format.');
        this.route = decodeGrid(document.route);
        this.route.gridRevision = document.revision;
        if (saved)
            for (const [id, tile] of Object.entries(saved.tiles))
                this.tiles.set(id, tile);
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
        const r = await fetch(routeResourceUrl('data/grid/world.json', baseURI));
        if (!r.ok)
            throw new Error('The railway grid world could not be loaded.');
        const document = JSON.parse(new TextDecoder().decode(await readResponse(r, 'world', progress)));
        const response = await fetch(routeResourceUrl(document.route.terrain.url, baseURI));
        if (!response.ok)
            throw new Error('The world height grid could not be loaded.');
        const terrain = await readResponse(response, 'terrain', progress);
        if (await sha256(terrain) !== document.terrainSHA256)
            throw new Error('The world height grid belongs to another revision.');
        return new GridWorld(document, terrain, baseURI);
    }
    /** Keep archived tiles as their checked JSON bytes until they are needed for a scene. */
    async encodedTile(id) {
        if (this.tiles.has(id))
            return this.tiles.get(id);
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
            if (await sha256(bytes) !== tile.sha256)
                throw new Error(`World tile ${id} belongs to another revision`);
            const encoded = new TextDecoder().decode(bytes);
            if (JSON.parse(encoded).id !== id)
                throw new Error(`World tile ${id} has an invalid owner`);
            this.tiles.set(id, encoded);
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
    async snapshot() { const todo = [...this.document.tiles]; await Promise.all(Array.from({ length: 4 }, async () => { while (todo.length)
        await this.encodedTile(todo.pop().id); })); return { document: this.document, tiles: Object.fromEntries(this.tiles), terrain: this.terrain, ...(this.document.composition===1?{catalogue:this.catalogue,enums:this.enums}:{}) }; }
}
