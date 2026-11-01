import type {V3} from '../core/types';

/** Metres remain the rendering unit. Integer addresses are the storage authority.
 * A 16 m construction cell has centimetre sub-anchors; height ticks are 1/32 m.
 * Negative coordinates use floor division, never truncation toward zero. */
export const GRID = Object.freeze({cellSize:16,subdivisions:1600,heightStep:1/32,version:1});
export type GridAnchor = [number,number,number]; // east cm, height ticks, south cm
export const anchor = (p:V3):GridAnchor => [Math.round(p[0]*100),Math.round(p[1]/GRID.heightStep),Math.round(p[2]*100)];
export const position = (p:GridAnchor):V3 => [p[0]/100,p[1]*GRID.heightStep,p[2]/100];
export function cell(p:GridAnchor){return {x:Math.floor(p[0]/GRID.subdivisions),z:Math.floor(p[2]/GRID.subdivisions),zLevel:p[1]};}
const vectors = new Set(['position','sourcePosition','centre','endpointRight']);
const paths = new Set(['points','footprint','supports','supportAnchors']);

/** Tagged coordinates prevent confusing a dimension, direction or chainage with
 * a position. Unknown metadata is retained, including source dates and IDs. */
export function encodeGrid(value:any,key=''):any {
  if(Array.isArray(value)){
    if(vectors.has(key)&&key!=='endpointRight'&&value.length===3&&value.every(Number.isFinite))return {$grid:anchor(value as V3)};
    if(key==='sourcePosition'&&value.length===2&&value.every(Number.isFinite))return {$plan:value.map(v=>Math.round(v*100))};
    if(paths.has(key))return value.map(v=>Array.isArray(v)&&v.every(Number.isFinite)?v.length===3?{$grid:anchor(v as V3)}:v.length===2?{$plan:v.map(n=>Math.round(n*100))}:encodeGrid(v):encodeGrid(v));
    return value.map(v=>encodeGrid(v));
  }
  if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).map(([k,v])=>[k,encodeGrid(v,k)]));
  if(typeof value==='number'&&!Number.isFinite(value))throw new Error('GRID-01: non-finite world value');
  return value;
}
export function decodeGrid<T>(value:any):T {
  if(Array.isArray(value))return value.map(v=>decodeGrid(v)) as T;
  if(value&&typeof value==='object'){
    if('$grid' in value){if(!Array.isArray(value.$grid)||value.$grid.length!==3||!value.$grid.every(Number.isSafeInteger))throw new Error('GRID-01: invalid anchor');return position(value.$grid) as T;}
    if('$plan' in value){if(!Array.isArray(value.$plan)||value.$plan.length!==2||!value.$plan.every(Number.isSafeInteger))throw new Error('GRID-01: invalid plan anchor');return value.$plan.map((n:number)=>n/100) as T;}
    return Object.fromEntries(Object.entries(value).map(([k,v])=>[k,decodeGrid(v)])) as T;
  }
  return value as T;
}

export interface GridPort {node:string;anchor:GridAnchor;vector:V3;mode:'rail'|'tram';}
export interface GridPiece {id:string;kind:'straight'|'curve'|'turnout-leg';anchors:GridAnchor[];ports:GridPort[];minLevel:number;maxLevel:number;cells:string[];}
/** Occupancy is a stack: crossing in plan does not create connectivity. */
export function piece(id:string,points:V3[],nodes:[string,string],mode:'rail'|'tram'='rail'):GridPiece {
  if(points.length<2)throw new Error(`${id}: a track piece requires two anchors`);
  const anchors=points.map(anchor),cells=new Set<string>();
  for(let i=1;i<points.length;i++){
    const a=points[i-1],b=points[i],steps=Math.max(1,Math.ceil(Math.hypot(b[0]-a[0],b[2]-a[2])/4));
    for(let j=0;j<=steps;j++){const c=cell(anchor(a.map((v,k)=>v+(b[k]-v)*j/steps) as V3));cells.add(`${c.x},${c.z}`);}
  }
  const vector=(a:V3,b:V3):V3=>{const d=b.map((v,i)=>v-a[i]) as V3,n=Math.hypot(...d)||1;return d.map(v=>v/n) as V3;};
  return {id,kind:points.length===2?'straight':'curve',anchors,ports:[{node:nodes[0],anchor:anchors[0],vector:vector(points[0],points[1]),mode},{node:nodes[1],anchor:anchors.at(-1)!,vector:vector(points.at(-1)!,points.at(-2)!),mode}],minLevel:Math.min(...anchors.map(a=>a[1])),maxLevel:Math.max(...anchors.map(a=>a[1]))+192,cells:[...cells].sort()};
}
export function occupancy(pieces:GridPiece[]){const cells=new Map<string,GridPiece[]>();for(const p of pieces)for(const c of p.cells){const stack=cells.get(c)||[];stack.push(p);cells.set(c,stack);}for(const stack of cells.values())stack.sort((a,b)=>a.minLevel-b.minLevel||a.id.localeCompare(b.id));return cells;}
export function connections(pieces:GridPiece[]){const nodes=new Map<string,GridPort[]>();for(const p of pieces)for(const port of p.ports){const key=`${port.mode}/${port.node}`,list=nodes.get(key)||[];if(list.some(q=>q.anchor.some((v,i)=>v!==port.anchor[i])))throw new Error(`${p.id}: JOIN-01 inconsistent node ${port.node}`);list.push(port);nodes.set(key,list);}return nodes;}
