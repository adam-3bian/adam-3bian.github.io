#!/usr/bin/env node
/** Fetch explicit OSM buffer-stop nodes in the existing Kidderminster/Tyseley
 * scenery areas. OSM data © OpenStreetMap contributors, ODbL. */
import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {XMLParser} from 'fast-xml-parser';
import proj4 from 'proj4';
proj4.defs('EPSG:27700','+proj=tmerc +lat_0=49 +lon_0=-2 +k=0.9996012717 +x_0=400000 +y_0=-100000 +ellps=airy +towgs84=446.448,-125.157,542.060,0.1502,0.2470,0.8421,-20.4894 +units=m +no_defs');
const stations=JSON.parse(readFileSync('public/data/route.json','utf8')).stations.filter(s=>['KID','TYS'].includes(s.id));
const parser=new XMLParser({ignoreAttributes:false,attributeNamePrefix:'',parseAttributeValue:false,isArray:n=>['node','tag'].includes(n)}),array=v=>Array.isArray(v)?v:v?[v]:[];
for(const s of stations){
 const path=`references/geography/buffer-stops-${s.id.toLowerCase()}.osm.json`;if(existsSync(path))continue;
 const p=s.position,sw=proj4('EPSG:27700','EPSG:4326',[p[0]+400000-650,280000-p[2]-650]),ne=proj4('EPSG:27700','EPSG:4326',[p[0]+400000+650,280000-p[2]+650]),bbox=[...sw,...ne].map(n=>n.toFixed(7)).join(','),url=`https://api.openstreetmap.org/api/0.6/map?bbox=${bbox}`;
 const result=spawnSync('curl',['--silent','--show-error','--fail','--max-time','45','-A','SnowHillLines/1.0 railway simulation OSM research',url],{encoding:'utf8',maxBuffer:100*1024*1024});if(result.status!==0)throw Error(`${s.id}: ${result.stderr}`);
 const osm=parser.parse(result.stdout).osm,elements=array(osm.node).map(e=>({type:'node',id:Number(e.id),lat:Number(e.lat),lon:Number(e.lon),tags:Object.fromEntries(array(e.tag).map(t=>[t.k,t.v]))})).filter(e=>e.tags.railway==='buffer_stop');
 writeFileSync(path,JSON.stringify({source:url,osm3s:{timestamp_osm_base:new Date().toISOString(),copyright:'© OpenStreetMap contributors, ODbL'},elements}));console.log(s.id,elements.length);
}
