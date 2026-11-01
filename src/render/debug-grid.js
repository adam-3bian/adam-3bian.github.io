/** Developer-only grid and world inspector; no normal game-view changes. */
import * as THREE from 'three';
import {GRID,anchor,cell,position} from '../world/grid.js';
import {Terrain} from '../world/surfaces.js';

export function createGridInspector(view,route,terrainBytes){
 const terrain=new Terrain(route.data.terrain,new Uint16Array(terrainBytes)),size=GRID.cellSize;let overlay;
 const hide=()=>{if(!overlay)return;view.scene.remove(overlay);overlay.geometry.dispose();overlay.material.dispose();overlay=undefined;};
 const show=(x,z,radius=6)=>{
  hide();radius=Math.max(1,Math.min(20,Math.round(radius)));const cx=Math.floor(x/size),cz=Math.floor(z/size),vertices=[];
  const add=(a,b)=>{vertices.push(a[0],terrain.raw(a[0],a[1])+.35,a[1],b[0],terrain.raw(b[0],b[1])+.35,b[1]);};
  for(let i=-radius;i<=radius+1;i++)for(let j=-radius;j<=radius;j++){
   const gx=(cx+i)*size,gz=(cz+j)*size;for(let k=0;k<2;k++){add([gx,gz+k*size/2],[gx,gz+(k+1)*size/2]);add([(cx+j+k/2)*size,(cz+i)*size],[(cx+j+(k+1)/2)*size,(cz+i)*size]);}
  }
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));
  overlay=new THREE.LineSegments(geometry,new THREE.LineBasicMaterial({color:0x00dcff,depthTest:false,transparent:true,opacity:.8}));overlay.renderOrder=10000;overlay.name='developer-grid';view.scene.add(overlay);return {cell:{x:cx,z:cz},radius};
 };
 const inspect=(x,z)=>{
  const y=terrain.raw(x,z),a=anchor([x,y,z]),c=cell(a),key=`${c.x},${c.z}`,near=route.project(x,z,100),rail=route.sample(near.s).position;
  const pieces=(route.data.gridPieces||[]).filter(p=>p.cells?.includes(key)).map(p=>({id:p.id,template:p.template,ports:p.ports,minLevel:p.minLevel,maxLevel:p.maxLevel}));
  const minX=c.x*size,maxX=minX+size,minZ=c.z*size,maxZ=minZ+size;
  const roads=(route.data.surfaceRoads||[]).filter(r=>r.bounds&&r.bounds[0]<=maxX&&r.bounds[2]>=minX&&r.bounds[1]<=maxZ&&r.bounds[3]>=minZ).map(r=>({id:r.id,template:r.template,mode:r.mode,connectionNodes:r.connectionNodes,portVectors:r.portVectors}));
  return {world:[x,y,z],anchor:a,cell:c,anchorPosition:position(a),terrainHeight:y,nearestRail:{distance:near.distance,position:rail,terrainDifference:y-rail[1]},pieces,roads};
 };
 return {show,hide,inspect};
}
