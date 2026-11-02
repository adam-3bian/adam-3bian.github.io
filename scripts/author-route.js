/** Explicit one-time authoring command. Never called by build or page loading. */
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {gzipSync} from 'node:zlib';
import {fork} from 'node:child_process';
import {recordScene} from './scene-authoring.js';
import {buildTile,endpointContext} from '../src/world/build.js';
import {composeAuthoredChunk} from '../src/world/authored-world.js';
import {decodeGrid,GRID} from '../src/world/grid.js';
import {RouteGeometry} from '../src/core/geometry.js';
import {Terrain} from '../src/world/surfaces.js';
import {deriveTrackwork} from '../src/render/trackwork.js';
const source='world-source/chunks',cache='public/data/grid/authored',reportDir='validation/authored',hash=b=>createHash('sha256').update(b).digest('hex');
const manifest=JSON.parse(fs.readFileSync('public/data/grid/world.json'));
const argv=process.argv.slice(2),worker=argv.indexOf('--partition');
if(worker<0&&!argv.includes('--author-all'))throw Error('Explicit --author-all required. Normal builds never regenerate geographic placements.');
if(worker<0&&fs.existsSync('public/data/grid/authored-world.json'))throw Error('Refusing to replace an adopted authored world, including with --resume. Edit world-source JSON and run cache:world; migration resumes are only allowed before a manifest has been adopted.');
for(const dir of [source,cache,reportDir])fs.mkdirSync(dir,{recursive:true});
if(worker>=0){
 const part=Number(argv[worker+1]),count=Number(argv[worker+2]),data=decodeGrid(manifest.route),route=new RouteGeometry(data);route.setEndpointContext(endpointContext(route));data.trackwork=deriveTrackwork(route).switches;
 const terrain=new Terrain(data.terrain,new Uint16Array(Uint8Array.from(fs.readFileSync('public/data/grid/terrain.bin')).buffer));
 for(const [index,descriptor] of manifest.tiles.entries()){
  if(index%count!==part)continue;
  const path=`${source}/${descriptor.id}.json`,reportPath=`${reportDir}/${descriptor.id}.json`;
  if(fs.existsSync(path)){if(!argv.includes('--resume'))throw Error(`Refusing to overwrite authored source ${path}`);if(fs.existsSync(reportPath))continue;throw Error(`Incomplete authoring output ${path}; inspect before replacing`);}
  const tile=decodeGrid(JSON.parse(fs.readFileSync(`public/${descriptor.url}`))),start=performance.now(),{document,original}=recordScene(tile,()=>buildTile(tile,route,terrain)),authoredAt=performance.now(),packet=composeAuthoredChunk(document),composedAt=performance.now();
  const encoded=Buffer.from(JSON.stringify(document)+'\n'),compressed=gzipSync(encoded,{level:9});
  if(encoded.length>95e6)throw Error(`Chunk ${tile.id} exceeds source-file budget; split before publishing`);
  fs.writeFileSync(path,encoded);fs.writeFileSync(`${cache}/${tile.id}.json.gz.bin`,compressed);
  const report={id:tile.id,bounds:tile.bounds,source:path,url:`data/grid/authored/${tile.id}.json.gz.bin`,codec:'gzip-json',sha256:hash(compressed),contentSHA256:hash(encoded),bytes:compressed.length,sourceBytes:encoded.length,authorMs:authoredAt-start,composeMs:composedAt-authoredAt,instances:document.instances.length,prefabs:Object.keys(document.prefabs).length,geometries:Object.keys(document.geometries).length,characters:document.characters.length,triangles:packet.mesh.index.length/3,originalTriangles:original.mesh.index.length/3,degenerateRemoved:document.checks.degenerateTrianglesRemoved,exceptions:document.exceptions.length,exceptionReasons:Object.fromEntries([...new Set(document.exceptions.map(e=>e.reason||e.family))].map(reason=>[reason,document.exceptions.filter(e=>(e.reason||e.family)===reason).length]))};
  fs.writeFileSync(reportPath,JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({id:tile.id,instances:report.instances,sourceMB:Math.round(encoded.length/1e6),cacheMB:Math.round(compressed.length/1e6),seconds:Math.round((performance.now()-start)/1000)}));
  global.gc?.();
 }
}else{
 await Promise.all([0,1].map(part=>new Promise((resolve,reject)=>{const child=fork(new URL(import.meta.url),['--partition',String(part),'2',...argv.includes('--resume')?['--resume']:[]],{execArgv:['--expose-gc','--max-old-space-size=2200']});child.on('error',reject);child.on('exit',code=>code===0?resolve():reject(Error(`Authoring partition ${part} exited ${code}`)));})));
 const reports=manifest.tiles.map(t=>JSON.parse(fs.readFileSync(`${reportDir}/${t.id}.json`))),tiles=reports.map(({id,bounds,url,codec,sha256,contentSHA256,bytes})=>({id,bounds,url,codec,sha256,contentSHA256,bytes}));
 fs.mkdirSync('world-source',{recursive:true});const operations=Buffer.from(JSON.stringify(manifest.route)+'\n'),packed=gzipSync(operations,{level:9});fs.writeFileSync('world-source/operations.json',operations);fs.writeFileSync('public/data/grid/authored/operations.json.gz.bin',packed);
 const doc={schema:1,grid:GRID,authoredWorld:2,revision:hash(Buffer.from(JSON.stringify(tiles))),routeData:{url:'data/grid/authored/operations.json.gz.bin',codec:'gzip-json',sha256:hash(packed),contentSHA256:hash(operations)},terrain:manifest.route.terrain,terrainSHA256:manifest.terrainSHA256,tiles,provenance:{sourceRevision:manifest.revision,method:'Explicit offline conversion, source records and exceptions retained in each editable JSON chunk',sourceDirectory:'world-source/chunks',cachePolicy:'Hash-verified gzip of authoritative JSON; never generates placements'}};
 fs.writeFileSync('public/data/grid/authored-world.json',JSON.stringify(doc,null,2)+'\n');
 const sum=key=>reports.reduce((n,r)=>n+r[key],0);fs.writeFileSync(`${reportDir}/migration.json`,JSON.stringify({schema:1,status:'IMPLEMENTED_UNVERIFIED',chunks:tiles.length,instances:sum('instances'),characters:sum('characters'),sourceBytes:sum('sourceBytes'),cacheBytes:sum('bytes'),triangles:sum('triangles'),degenerateRemoved:sum('degenerateRemoved'),exceptions:sum('exceptions'),sourceRevision:manifest.revision,revision:doc.revision,remaining:'Full-route geometry, station recognition and performance acceptance must be checked separately'},null,2)+'\n');
 console.log(`Authored ${tiles.length} chunks. Source JSON ${Math.round(sum('sourceBytes')/1e6)} MB; runtime cache ${Math.round(sum('bytes')/1e6)} MB.`);
}
