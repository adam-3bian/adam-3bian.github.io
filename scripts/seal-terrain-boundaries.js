import fs from 'node:fs';
import * as THREE from 'three';
import {position} from '../src/world/grid.js';

// Explicit authoring operation. Shared edge heights are stored in JSON; the
// browser does not reconcile neighbouring chunks or choose terrain heights.
if(!process.argv.includes('--adopt'))throw Error('Use --adopt to author canonical terrain boundary heights');
const manifest=JSON.parse(fs.readFileSync('public/data/grid/authored-world.json')),edges=new Map();
function vertices(d,visit){
 const parent=new THREE.Matrix4(),local=new THREE.Matrix4(),matrix=new THREE.Matrix4(),v=new THREE.Vector3();
 for(const i of d.instances){const def=d.prefabs[i.prefabId];if(def.kind!=='TERRAIN')continue;const p=position(i.anchor);parent.fromArray(i.transform);parent.elements[12]+=p[0];parent.elements[13]+=p[1];parent.elements[14]+=p[2];
  for(const part of def.parts){matrix.copy(parent).multiply(local.fromArray(part.matrix));const g=d.geometries[part.geometry];for(let n=0;n<g.position.length;n+=3){v.fromArray(g.position,n).multiplyScalar(g.positionScale).applyMatrix4(matrix);if(Math.min(Math.abs(v.x-d.bounds[0]),Math.abs(v.x-d.bounds[2]),Math.abs(v.z-d.bounds[1]),Math.abs(v.z-d.bounds[3]))<=.001)visit(`${v.x.toFixed(2)},${v.z.toFixed(2)}`,Math.round(v.y*32));}}
 }
}
for(const t of manifest.tiles){const d=JSON.parse(fs.readFileSync(`world-source/chunks/${t.id}.json`));if(d.terrainBoundaryVersion)throw Error(`Already authored ${t.id}`);vertices(d,(key,ticks)=>{const old=edges.get(key);if(old){old.chunks.add(t.id);old.min=Math.min(old.min,ticks);old.max=Math.max(old.max,ticks);}else edges.set(key,{min:ticks,max:ticks,chunks:new Set([t.id])});});}
let corrected=0,shared=0;for(const v of edges.values())if(v.chunks.size>1){shared++;if(v.min!==v.max)corrected++;}
for(const t of manifest.tiles){const path=`world-source/chunks/${t.id}.json`,d=JSON.parse(fs.readFileSync(path));d.terrainBoundaryHeights={};vertices(d,key=>{const edge=edges.get(key);d.terrainBoundaryHeights[key]=edge.min;});d.terrainBoundaryVersion=1;fs.writeFileSync(path,JSON.stringify(d)+'\n');}
const report={schema:1,sharedVertices:shared,correctedVertices:corrected,rule:'Canonical lower integer tick at coincident stored boundary vertices; no runtime terrain solver',maximumAdjustmentTicks:[...edges.values()].reduce((n,e)=>Math.max(n,e.max-e.min),0)};fs.writeFileSync('validation/authored/terrain-boundaries.json',JSON.stringify(report,null,2)+'\n');console.log(report);
