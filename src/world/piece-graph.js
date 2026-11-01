/** Explicit source-port connectivity for constructed infrastructure pieces.
 * Crossings only connect when they share a node, mode and 3D anchor. */
import {connections} from './grid.js';
import {matchingPorts,piecePath} from './piece-registry.js';

export class PieceGraph {
 constructor(pieces){
  this.pieces=new Map();this.nodes=new Map();this.switches=new Map();
  connections(pieces); // Reject incompatible 3D anchors with the same node ID.
  for(const item of pieces){
   if(this.pieces.has(item.id))throw new Error(`Duplicate piece ${item.id}`);
   this.pieces.set(item.id,{item,path:piecePath(item)});
   item.ports.forEach((port,end)=>{const key=`${port.mode}/${port.node}`,entries=this.nodes.get(key)||[];entries.push({piece:item.id,end,port});this.nodes.set(key,entries);});
  }
 }
 /** A multi-way junction has no route until a specific pair is selected. */
 setSwitch(mode,node,pair){
  const key=`${mode}/${node}`,entries=this.nodes.get(key)||[];
  if(entries.length<3||!Array.isArray(pair)||pair.length!==2||pair[0]===pair[1]||pair.some(id=>!entries.some(e=>e.piece===id)))throw new Error(`Invalid switch route ${key}`);
  this.switches.set(key,[...pair]);
 }
 snapshot(){return {version:1,switches:[...this.switches].sort(([a],[b])=>a.localeCompare(b)).map(([key,pair])=>[key,[...pair]])};}
 restore(saved){
  if(saved?.version!==1||!Array.isArray(saved.switches))throw new Error('Invalid piece-graph state');
  const replacement=new Map();
  for(const entry of saved.switches){
   if(!Array.isArray(entry)||entry.length!==2||typeof entry[0]!=='string'||replacement.has(entry[0]))throw new Error('Invalid piece-graph state');
   const [key,pair]=entry,entries=this.nodes.get(key)||[];
   if(entries.length<3||!Array.isArray(pair)||pair.length!==2||pair[0]===pair[1]||pair.some(id=>!entries.some(e=>e.piece===id)))throw new Error(`Invalid switch route ${key}`);
   replacement.set(key,[...pair]);
  }
  this.switches=replacement;
 }
 next(id,end){
  const current=this.pieces.get(id);if(!current||![0,1].includes(end))throw new Error('Unknown piece or port');
  const port=current.item.ports[end],key=`${port.mode}/${port.node}`,entries=this.nodes.get(key)||[];
  if(entries.length<2)return undefined;
  const route=this.switches.get(key);if(entries.length>2&&(!route||!route.includes(id)))return undefined;
  const candidates=entries.filter(e=>e.piece!==id&&(!route||route.includes(e.piece))&&matchingPorts(port,e.port,.95));
  return candidates.length===1?candidates[0]:undefined;
 }
 /** Traverse the same stored path used to compose a piece; stop at dead ends or
  * unselected switches. This does not change the existing signalling system. */
 travel(id,s,distance,direction=1){
  if(!Number.isFinite(distance)||distance<0||![-1,1].includes(direction))throw new Error('Invalid movement');
  let entry=this.pieces.get(id);if(!entry||!Number.isFinite(s)||s<0||s>entry.path.length)throw new Error('Invalid starting position');
  let remaining=distance,moved=0,steps=0;
  while(remaining>1e-8&&steps++<10000){
   const available=direction>0?entry.path.length-s:s,step=Math.min(remaining,available);s+=step*direction;remaining-=step;moved+=step;
   if(remaining<=1e-8)break;
   const next=this.next(id,direction>0?1:0);if(!next)break;
   id=next.piece;entry=this.pieces.get(id);direction=next.end===0?1:-1;s=direction===1?0:entry.path.length;
  }
  const pose=entry.path.sample(s);return {piece:id,s,direction,moved,remaining,stopped:remaining>1e-8,pose};
 }
}
