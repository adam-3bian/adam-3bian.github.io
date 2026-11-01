#!/usr/bin/env node
/** Fetch dated OSM station-area extracts. Normal builds use archived snapshots.
 * Data © OpenStreetMap contributors, ODbL. */
import {readFileSync,writeFileSync,existsSync,mkdirSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {XMLParser} from 'fast-xml-parser';
import proj4 from 'proj4';
proj4.defs('EPSG:27700','+proj=tmerc +lat_0=49 +lon_0=-2 +k=0.9996012717 +x_0=400000 +y_0=-100000 +ellps=airy +towgs84=446.448,-125.157,542.060,0.1502,0.2470,0.8421,-20.4894 +units=m +no_defs');
const route=JSON.parse(readFileSync('public/data/route.json','utf8')),out='references/geography';mkdirSync(out,{recursive:true});
const parser=new XMLParser({ignoreAttributes:false,attributeNamePrefix:'',parseAttributeValue:false,isArray:n=>['node','way','nd','tag'].includes(n)});
for(const station of route.stations.slice(8)){
 const path=`${out}/landscape-station-${station.id.toLowerCase()}.osm.json`;if(existsSync(path))continue;
 const p=station.position,sw=proj4('EPSG:27700','EPSG:4326',[p[0]+400000-650,280000-p[2]-650]),ne=proj4('EPSG:27700','EPSG:4326',[p[0]+400000+650,280000-p[2]+650]);
 const bbox=[sw[0],sw[1],ne[0],ne[1]].map(n=>n.toFixed(7)).join(','),url=`https://api.openstreetmap.org/api/0.6/map?bbox=${bbox}`;
 const res=spawnSync('curl',['--silent','--show-error','--fail','--max-time','45','-A','SnowHillLines/1.0 railway simulation OSM research',url],{encoding:'utf8',maxBuffer:100*1024*1024});
 if(res.status!==0){console.error(station.id,'unavailable:',res.stderr.trim());continue;}
 try{
  const osm=parser.parse(res.stdout).osm,asArray=v=>Array.isArray(v)?v:v?[v]:[],tags=e=>Object.fromEntries(asArray(e.tag).map(t=>[t.k,t.v]));
  const nodes=asArray(osm.node).map(e=>({type:'node',id:Number(e.id),lat:Number(e.lat),lon:Number(e.lon)}));
  const ways=asArray(osm.way).map(e=>({type:'way',id:Number(e.id),nodes:asArray(e.nd).map(n=>Number(n.ref)),tags:tags(e)})).filter(e=>e.tags.highway||e.tags.building);
  if(!nodes.length||!ways.length)throw new Error('No road/building data returned');
  writeFileSync(path,JSON.stringify({source:url,osm3s:{timestamp_osm_base:new Date().toISOString(),copyright:'© OpenStreetMap contributors, ODbL'},elements:[...nodes,...ways]}));
  console.log(station.id,nodes.length,ways.length);
 }catch(error){console.error(station.id,error.message);}
}
