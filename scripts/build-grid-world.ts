import {readFileSync,writeFileSync,mkdirSync,readdirSync,unlinkSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {encodeGrid,decodeGrid,GRID,piece,connections} from '../src/world/grid';
import {RouteGeometry,Polyline} from '../src/core/geometry';
import type {RouteData,V3,WorldTile} from '../src/core/types';
import {Terrain} from '../src/world/surfaces';

const read=(path:string)=>JSON.parse(readFileSync(path,'utf8'));
const manifest=read('references/location-reference-manifest.json');
if(manifest.era!==2026)throw new Error('Consult and update the location manifest before changing the model era.');
const source=read('public/data/reconstruction.json'),route=read('public/data/route.json') as RouteData;
const sourceGeometry=new RouteGeometry(route);
for(const mapped of source.mainTunnels){const t=(route.tunnels as any[]).find(t=>t.id===mapped.id);if(!t)continue;const extents=mapped.points.map((p:V3)=>sourceGeometry.project(p[0],p[2],100).s);t.start=Math.min(...extents);t.end=Math.max(...extents);t.s=(t.start+t.end)/2;t.points=[sourceGeometry.sample(t.start).position,sourceGeometry.sample(t.end).position];t.position=sourceGeometry.sample(t.s).position;t.sourceWayIds=mapped.sourceWayIds;t.confidence='2026 mapped heavy-rail portals; absolute profile inferred';}
// Retain the mapped urban portals, but replace the old multi-gradient bore with
// the documented approximately 1:45 inclination. The datum is still inferred.
const tunnel=(route.tunnels as any[]).find(t=>t.id==='snow-hill-tunnel');
if(tunnel){
 const chainages=route.chainages as number[],original=route.points.map(p=>p[1]),endY=original[chainages.findIndex(s=>s>=tunnel.end)],startY=endY+(tunnel.end-tunnel.start)/45;
 const begin=tunnel.start-350,beginIndex=chainages.findIndex(s=>s>=begin),beginY=original[beginIndex],beginGrade=(original[beginIndex+1]-original[beginIndex-1])/(chainages[beginIndex+1]-chainages[beginIndex-1]);
 for(let i=0;i<route.points.length;i++){const s=chainages[i];let y=original[i];
   if(s>=tunnel.start&&s<=tunnel.end)y=endY+(tunnel.end-s)/45;
   else if(s>begin&&s<tunnel.start){const t=(s-begin)/350,t2=t*t,t3=t2*t;y=(2*t3-3*t2+1)*beginY+(t3-2*t2+t)*350*beginGrade+(-2*t3+3*t2)*startY+(t3-t2)*350*(-1/45);}
   const delta=y-original[i];route.points[i][1]=y;(route.opposingTrack as any).points[i][1]+=delta;
 }
 tunnel.profileRule='mapped portal extent; approximately 1:45 bore; inferred absolute datum with smooth northern transition';
 tunnel.confidence='2026 mapped extent about 584 m differs from historical 596-yard description; absolute rail levels inferred';
}
const geometry=new RouteGeometry(route);
// A Buffer may use a pooled backing store: always make an exact independent copy.
const terrainBytes=readFileSync('public/data/terrain.bin'),terrain=new Terrain(route.terrain,new Uint16Array(Uint8Array.from(terrainBytes).buffer));
const svr=new Polyline(source.kidderminsterHeritage.points);
route.era=manifest.era;route.referenceManifest='references/location-reference-manifest.json';
route.extraStations=source.stations;
route.platforms=[...(route.platforms as any[]).filter(p=>!['KID','SGB','JEQ','THW'].includes(p.station)),...source.platforms];
const existingServices=read('public/data/adjacent-services.json').services;
route.adjacentServices=[...existingServices.filter((s:any)=>!s.id.startsWith('hawthorns-metro')) .map((s:any)=>({...s,metadata:{...s.metadata,renderStatic:s.id==='stourbridge-town-shuttle'}})),...source.tracks];
const roadOverrides=new Map<string,any>(source.access.map((a:any)=>[a.id,a]));
const originalRoads=read('public/data/road-surfaces.json').roads;
const canalBridge=originalRoads.find((r:any)=>r.id==='way/22320759/0');
if(canalBridge){const y=Math.max(canalBridge.points[0][1],canalBridge.points.at(-1)[1]);roadOverrides.set(canalBridge.id,{...canalBridge,points:canalBridge.points.map((p:V3)=>[p[0],y,p[2]]),elevationMode:'over',confidence:'historic Galton canal bridge; mapped plan, deck datum inferred from abutments',source:manifest.sources['galton-bridge'].url});}
route.surfaceRoads=originalRoads.map((r:any)=>roadOverrides.has(r.id)?{...r,...roadOverrides.get(r.id)}:r);
route.surfaceWater=[...read('public/data/land-surfaces.json').water,...source.water];
route.landmarks=source.landmarks;
route.railwayGraph={edges:source.topology,scope:'2026 source-node connectivity, distinct rail/tram graphs; physical topology is not movement authority'};
const pieces=source.topology.map((e:any)=>piece(e.id,e.points,[e.from,e.to],e.mode));
for(const [lane,points]of [['up',route.points],['down',(route.opposingTrack as any).points]] as [string,V3[]][])
  for(let i=0;i<points.length-1;i+=8){const end=Math.min(points.length-1,i+8);pieces.push(piece(`running/${lane}/${i}`,points.slice(i,end+1),[`running/${lane}/${i}`,`running/${lane}/${end}`]));}
connections(pieces);route.gridPieces=pieces;
route.kidderminsterHeritage=source.kidderminsterHeritage;
const galton=geometry.stations.find(s=>s.id==='SGB')!;
route.bridges=[{id:'galton-upper',start:galton.s-75,end:galton.s+25}];
route.civils=[{id:'galton-upper',points:Array.from({length:26},(_,i)=>geometry.sample(galton.s-75+i*4,geometry.laneOffset(galton.s,4.2)/2).position),metadata:{bridge:true,name:'Galton upper railway',width:10,clearSpan:true}}];
for(const c of source.civils){const levels=c.points.map((p:V3)=>terrain.raw(p[0],p[2])).sort((a:number,b:number)=>a-b),deck=levels[Math.floor(levels.length/2)]+c.height;(route.civils as any[]).push({...c,points:c.points.map((p:V3)=>[p[0],deck,p[2]])});}
// Fixed, explicit station compositions replace incidental nearest-line ownership.
route.stationCompositions=manifest.locations.map((s:any)=>({id:s.id,rule:s.composition,platformIds:(route.platforms as any[]).filter(p=>p.station===s.id).map(p=>p.id)}));
route.generation={version:1,seedPolicy:'FNV-1a stable entity/tile IDs; independent of tile load order',regionalKit:['engineering-brick','retaining-wall','bridge-girder','portal','gwr-furniture','metro-equipment','industrial-shed','terrace','vegetation'],landmarkVersion:1};

const assets=route.landmarks as any[];
const add=(id:string,family:string,station:string,sOffset:number,side:number,options:Record<string,unknown>)=>{const st=geometry.stations.find(s=>s.id===station)!;const q=geometry.sample(st.s+sOffset,side);assets.push({id,family,position:q.position,angle:q.yaw,source:manifest.locations.find((s:any)=>s.id===station).sourceIds,confidence:'site composition; dimensions inferred',...options});};
add('landmark/moor-street-frontage','gwr-frontage','BMO',0,-34,{width:52,depth:12,height:8,name:'BIRMINGHAM MOOR STREET'});
add('landmark/snow-hill','snow-hill','BSW',-30,-42,{width:16,depth:140,height:17});
const kdt=source.stations.find((s:any)=>s.id==='KDT');
// Signal heads are protective scenery until dispatch over the exchange is implemented.
for(const tr of source.tracks.filter((t:any)=>t.metadata.region==='kidderminster'&&t.metadata.service==='crossover')){const p=tr.points[0] as V3;assets.push({id:tr.id+'/protecting-signal',family:'exchange-signal',position:[p[0]+2.5,p[1]-.4,p[2]],angle:0,width:1,depth:1,height:5,aspect:'red',source:['svr-connection'],confidence:'protective model signal; exact signal siting not surveyed'});}

// Extend the sampled terrain instead of clamping the whole SVR to the old map's
// western edge. Existing Environment Agency cells are copied without resampling.
// Outside that coverage this is a declared valley model, constrained to railway
// levels, with explicit bridge/tunnel exceptions and deterministic rolling sides.
const old=route.terrain,origin:[number,number]=[old.origin[0]-2000,old.origin[1]],width=old.width+100,height=old.height;
const gridOffset=-100;
const pixels=new Uint16Array(width*height),aux=source.tracks.map((t:any)=>({t,path:new Polyline(t.points)}));
const samples:V3[]=[];for(let s=0;s<svr.length;s+=40)samples.push(svr.sample(s).position);
const buckets=new Map<string,V3[]>();for(const p of samples){const key=`${Math.floor(p[0]/500)},${Math.floor(p[2]/500)}`,v=buckets.get(key)||[];v.push(p);buckets.set(key,v);}
function nearSVR(x:number,z:number){let d=Infinity,p:V3|undefined;const bx=Math.floor(x/500),bz=Math.floor(z/500);for(let dx=-3;dx<=3;dx++)for(let dz=-3;dz<=3;dz++)for(const q of buckets.get(`${bx+dx},${bz+dz}`)||[]){const n=Math.hypot(x-q[0],z-q[2]);if(n<d){d=n;p=q;}}return {d,p};}
for(let j=0;j<height;j++)for(let i=0;i<width;i++){
 const x=origin[0]+i*old.step,z=origin[1]+j*old.step;let y:number;
 if(i>=100)y=terrain.raw(x,z);
 else {const n=nearSVR(x,z);y=n.p?n.p[1]-1+Math.min(70,n.d*.09)+4*Math.sin(x/480)*Math.sin(z/620):75+18*Math.sin(x/2100)*Math.cos(z/1700);
   const t=Math.min(1,Math.max(0,(old.origin[0]-x)/400)),blend=t*t*(3-2*t),edge=terrain.raw(old.origin[0],z);y=edge+(y-edge)*blend;
 }
 pixels[j*width+i]=Math.max(1,Math.min(65535,Math.round((y-gridOffset)/GRID.heightStep)+1));
}
// Civil spans have their own ground envelope. No filled embankment inside a
// bridge; a tunnel retains cover above a continuous bore.
for(const {t,path} of aux){if(!t.metadata.bridge&&!t.metadata.tunnel)continue;for(let s=0;s<=path.length;s+=10){const p=path.sample(s).position,ix=Math.round((p[0]-origin[0])/old.step),iz=Math.round((p[2]-origin[1])/old.step);for(let dz=-1;dz<=1;dz++)for(let dx=-1;dx<=1;dx++){const i=ix+dx,j=iz+dz;if(i<0||j<0||i>=width||j>=height)continue;const index=j*width+i,existing=gridOffset+(pixels[index]-1)*GRID.heightStep,target=p[1]+(t.metadata.tunnel?9:t.metadata.name==='Falling Sands Viaduct'?-19.5:-7);const y=t.metadata.tunnel?Math.max(existing,target):Math.min(existing,target);pixels[index]=Math.round((y-gridOffset)/GRID.heightStep)+1;}}}
route.terrain={...old,url:'data/grid/terrain.bin',origin,width,height,offset:gridOffset,scale:GRID.heightStep,source:'Existing EA grid; Kidderminster scenery margin: gradient-constrained model',meaning:'ODN model metres; extension terrain is inferred, not surveyed'};

const tiles=new Map<string,WorldTile>();for(const t of route.tiles){const tile=read(`public/${t.url}`);tile.roads=tile.roads.map((r:any)=>roadOverrides.has(r.id)?{...r,...roadOverrides.get(r.id)}:r);tiles.set(t.id,tile);}
for(const p of samples)for(let dx=-1;dx<=1;dx++)for(let dz=-1;dz<=1;dz++){const x=Math.floor(p[0]/1000)+dx,z=Math.floor(p[2]/1000)+dz,id=`${x}_${z}`;if(!tiles.has(id))tiles.set(id,{id,bounds:[x*1000,z*1000,(x+1)*1000,(z+1)*1000],roads:[],buildings:[],land:[],tracks:[]});}
for(const water of source.water){const p=water.footprint[0],tile=tiles.get(`${Math.floor(p[0]/1000)}_${Math.floor(p[1]/1000)}`);if(tile)(tile.land??=[]).push(water);}
const gridDir='public/data/grid';mkdirSync(`${gridDir}/tiles`,{recursive:true});
for(const name of readdirSync(`${gridDir}/tiles`))if(name.endsWith('.json')&&!tiles.has(name.slice(0,-5)))unlinkSync(`${gridDir}/tiles/${name}`);
const digest=(b:string|Uint8Array)=>createHash('sha256').update(b).digest('hex');
const tileManifest=[];
for(const tile of [...tiles.values()].sort((a,b)=>a.id.localeCompare(b.id))){const encoded=JSON.stringify(encodeGrid(tile)),url=`data/grid/tiles/${tile.id}.json`;writeFileSync(`public/${url}`,encoded);tileManifest.push({id:tile.id,url,sha256:digest(encoded)});}
route.tiles=[...tiles.values()].map(t=>({id:t.id,url:`data/grid/tiles/${t.id}.json`,bounds:t.bounds!}));
const encoded=encodeGrid(route),terrainBuffer=Buffer.from(pixels.buffer),revision=digest(JSON.stringify({grid:GRID,route:encoded,tiles:tileManifest,terrain:digest(terrainBuffer)}));
writeFileSync(`${gridDir}/terrain.bin`,terrainBuffer);
writeFileSync(`${gridDir}/world.json`,JSON.stringify({schema:1,grid:GRID,revision,era:2026,route:encoded,tiles:tileManifest,terrainSHA256:digest(terrainBuffer)}));
console.log(`Grid world ${revision.slice(0,12)}: ${tiles.size} tiles, ${pieces.length} source-connected pieces, ${assets.length} landmark instances.`);
