import * as webgl from 'three';
import * as prior from 'three/webgpu';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {cpSync,mkdirSync,mkdtempSync,readFileSync,readdirSync,rmSync,writeFileSync} from 'node:fs';
import {dirname,join,relative,resolve,sep} from 'node:path';
import {pathToFileURL} from 'node:url';

const previousCommit='8ce5aadc29faadd77b505c0f13a4ea6192899276';
const originalAudit=JSON.parse(readFileSync('docs/reports/geometry.json','utf8')) as {sourceSnapshot:{hashes:Record<string,string>}};
const sha=(value:string|Uint8Array)=>createHash('sha256').update(value).digest('hex');
const importOnly=new Set(['src/render/assets.ts','src/render/batch.ts','src/render/trackwork.ts','src/world/build.ts','src/world/platforms.ts','scripts/audit-geometry.ts']);
const changes=[];
for(const [path,expected] of Object.entries(originalAudit.sourceSnapshot.hashes)){
  const current=readFileSync(path),actual=sha(current);if(actual===expected)continue;
  if(!importOnly.has(path))throw new Error(`An audited input changed beyond the Three.js import: ${path}`);
  const text=current.toString('utf8'),normalized=text.replace("from 'three'","from 'three/webgpu'");
  if(normalized===text||sha(normalized)!==expected)throw new Error(`The audited source changed beyond its Three.js import: ${path}`);
  changes.push({path,previousSHA256:expected,currentSHA256:actual,normalizedSHA256:sha(normalized)});
}
if(changes.length!==importOnly.size)throw new Error(`Expected ${importOnly.size} import-only audit inputs, found ${changes.length}.`);
const generatorPaths=[...importOnly].filter(p=>p.startsWith('src/'));
const symbols=new Set(generatorPaths.flatMap(path=>[...readFileSync(path,'utf8').matchAll(/THREE\.([A-Za-z_]\w*)/g)].map(match=>match[1])));
const different=[...symbols].filter(name=>(webgl as any)[name] !== (prior as any)[name]);
if(different.length)throw new Error(`Three.js exports are not identical: ${different.join(', ')}`);
const priorWorker=execFileSync('git',['ls-tree','-r','--name-only',previousCommit,'--','site/assets'],{encoding:'utf8'}).split('\n').find(path=>/\/world\.worker-[^/]+\.js$/.test(path));
const currentWorker=readdirSync('site/assets').find(name=>/^world\.worker-.*\.js$/.test(name));
if(!priorWorker||!currentWorker)throw new Error('Could not find both generated worker bundles.');
const previousWorkerHash=sha(execFileSync('git',['show',`${previousCommit}:${priorWorker}`])),currentWorkerHash=sha(readFileSync(`site/assets/${currentWorker}`));
if(previousWorkerHash!==currentWorkerHash)throw new Error('The generated scenery worker changed after the renderer conversion.');

mkdirSync('work',{recursive:true});const scratch=mkdtempSync(resolve('work/webgl-geometry-'));
const paths=(dir:string):string[]=>readdirSync(dir,{withFileTypes:true}).flatMap(e=>{const path=join(dir,e.name);return e.isDirectory()?paths(path):e.isFile()&&e.name.endsWith('.ts')?[path]:[];});
const arrayHash=(value:Float32Array|Uint32Array)=>sha(new Uint8Array(value.buffer,value.byteOffset,value.byteLength));
try{
  cpSync('src',join(scratch,'src'),{recursive:true});
  for(const path of paths(resolve('src'))){const name=relative(process.cwd(),path).split(sep).join('/');const old=execFileSync('git',['show',`${previousCommit}:${name}`]);const dest=join(scratch,name);mkdirSync(dirname(dest),{recursive:true});writeFileSync(dest,old);}
  async function engine(root:string){
    const load=(path:string)=>import(pathToFileURL(resolve(root,'src',path)).href);
    const [geo,surface,world,track]=await Promise.all([load('core/geometry.ts'),load('world/surfaces.ts'),load('world/build.ts'),load('render/trackwork.ts')]);
    const data=JSON.parse(readFileSync('public/data/route.json','utf8'));
    data.adjacentServices=JSON.parse(readFileSync('public/data/adjacent-services.json','utf8')).services;
    data.surfaceRoads=JSON.parse(readFileSync('public/data/road-surfaces.json','utf8')).roads;
    data.surfaceWater=JSON.parse(readFileSync('public/data/land-surfaces.json','utf8')).water;
    const route=new geo.RouteGeometry(data);route.setEndpointContext(world.endpointContext(route));data.trackwork=track.deriveTrackwork(route).switches;
    const bytes=readFileSync('public/data/terrain.bin');const terrain=new surface.Terrain(data.terrain,new Uint16Array(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength)));
    return {data,route,terrain,build:world.buildTile};
  }
  const before=await engine(scratch),after=await engine(process.cwd()),probes=[];
  for(const id of ['-17_3','-4_-6','6_-8','14_0']){
    const tile=JSON.parse(readFileSync(`public/data/tiles/${id}.json`,'utf8'));
    function sample(e:typeof before){const built=e.build(tile,e.route,e.terrain);return{position:arrayHash(built.mesh.position),normal:arrayHash(built.mesh.normal),color:arrayHash(built.mesh.color),index:arrayHash(built.mesh.index),metadata:sha(JSON.stringify({roads:built.roads,placements:built.placements,pedestrianPaths:built.pedestrianPaths,checks:built.checks})),vertices:built.mesh.position.length/3,triangles:built.mesh.index.length/3};}
    const old=sample(before);(globalThis as unknown as {gc?:()=>void}).gc?.();const current=sample(after);(globalThis as unknown as {gc?:()=>void}).gc?.();
    if(JSON.stringify(old)!==JSON.stringify(current))throw new Error(`Generated tile differs after the renderer conversion: ${id}`);
    probes.push({id,matched:true,...current});console.log(`Matched ${id}: ${current.vertices} vertices, ${current.triangles} triangles`);
  }
  const report={generatedAt:new Date().toISOString(),previousCommit,method:'All original full-audit inputs are unchanged except import-only Three.js entry changes; every Three symbol used by those generators is the identical shared core export. The packaged scenery worker is byte-identical. Four actual tiles were built with both revisions and their vertex, normal, colour, index and placement metadata hashes compared.',scope:'The original 121-tile CPU audit is not rerun by this comparison. Actual WebGL presentation, continuous intersections, human recognition and hardware performance need separate validation.',auditReportSHA256:sha(readFileSync('docs/reports/geometry.json')),harnessSHA256:sha(readFileSync('scripts/audit-webgl-equivalence.ts')),threeVersion:JSON.parse(readFileSync('node_modules/three/package.json','utf8')).version,worker:{previous:priorWorker,current:`site/assets/${currentWorker}`,previousSHA256:previousWorkerHash,currentSHA256:currentWorkerHash},threeSymbols:[...symbols].sort(),importOnlyChanges:changes,tileProbes:probes,allMatched:true};
  mkdirSync('docs/reports',{recursive:true});writeFileSync('docs/reports/webgl-geometry-equivalence.json',JSON.stringify(report,null,2)+'\n');
}finally{rmSync(scratch,{recursive:true,force:true});}
