import type {RouteData,WorldTile} from '../core/types';
import {routeResourceUrl} from '../core/resource-url';
import {decodeGrid,GRID} from './grid';

export interface GridWorldDocument {schema:1;grid:typeof GRID;revision:string;era:number;route:unknown;tiles:{id:string;url:string;sha256:string}[];terrainSHA256:string;}
export interface SavedWorld {document:GridWorldDocument;tiles:Record<string,unknown>;terrain:ArrayBuffer;}
export async function sha256(bytes:ArrayBuffer){return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),v=>v.toString(16).padStart(2,'0')).join('');}
export class GridWorld {
  readonly route:RouteData;
  private tiles=new Map<string,unknown>();private pending=new Map<string,Promise<WorldTile>>();
  constructor(readonly document:GridWorldDocument,readonly terrain:ArrayBuffer,readonly baseURI:string,saved?:SavedWorld){
    if(document.schema!==1||JSON.stringify(document.grid)!==JSON.stringify(GRID))throw new Error('Unsupported grid world format.');
    this.route=decodeGrid<RouteData>(document.route);this.route.gridRevision=document.revision;
    if(saved)for(const [id,tile]of Object.entries(saved.tiles))this.tiles.set(id,tile);
  }
  static async load(baseURI:string,saved?:SavedWorld){
    if(saved)return new GridWorld(saved.document,saved.terrain,baseURI,saved);
    const r=await fetch(routeResourceUrl('data/grid/world.json',baseURI));if(!r.ok)throw new Error('The railway grid world could not be loaded.');
    const document=await r.json() as GridWorldDocument,route=decodeGrid<RouteData>(document.route);
    const response=await fetch(routeResourceUrl(route.terrain.url,baseURI));if(!response.ok)throw new Error('The world height grid could not be loaded.');
    const terrain=await response.arrayBuffer();if(await sha256(terrain)!==document.terrainSHA256)throw new Error('The world height grid belongs to another revision.');
    return new GridWorld(document,terrain,baseURI);
  }
  async tile(id:string):Promise<WorldTile>{
    if(this.tiles.has(id))return decodeGrid<WorldTile>(this.tiles.get(id));
    const pending=this.pending.get(id);if(pending)return pending;
    const task=(async()=>{const tile=this.document.tiles.find(t=>t.id===id);if(!tile)throw new Error(`Unknown world tile ${id}`);
      const r=await fetch(routeResourceUrl(tile.url,this.baseURI),{signal:AbortSignal.timeout(30000)});if(!r.ok)throw new Error(`World tile ${id}: HTTP ${r.status}`);
      const bytes=await r.arrayBuffer();if(await sha256(bytes)!==tile.sha256)throw new Error(`World tile ${id} belongs to another revision`);
      const encoded=JSON.parse(new TextDecoder().decode(bytes));const decoded=decodeGrid<WorldTile>(encoded);if(decoded.id!==id)throw new Error(`World tile ${id} has an invalid owner`);this.tiles.set(id,encoded);return decoded;})();
    this.pending.set(id,task);try{return await task;}finally{this.pending.delete(id);}
  }
  /** Capture every tile before atomically saving a journey and its world. */
  async snapshot():Promise<SavedWorld>{const todo=[...this.document.tiles];await Promise.all(Array.from({length:4},async()=>{while(todo.length)await this.tile(todo.pop()!.id);}));return {document:this.document,tiles:Object.fromEntries(this.tiles),terrain:this.terrain};}
}

