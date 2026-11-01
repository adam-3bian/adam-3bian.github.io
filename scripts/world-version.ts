import {createHash} from 'node:crypto';
import {existsSync,readFileSync,readdirSync} from 'node:fs';
import {join,relative,sep} from 'node:path';

type Overrides=ReadonlyMap<string,Uint8Array>;
type Baseline={legacyWorldHash:string;sourceFingerprint:string;configHash:string;policyHash:string};
const read=(root:string,path:string,overrides?:Overrides)=>overrides?.get(path)??readFileSync(join(root,path));
export const fileHash=(root:string,path:string,overrides?:Overrides)=>createHash('sha256').update(read(root,path,overrides)).digest('hex');

function sourceFiles(root:string):string[]{
  const found:string[]=[];
  function visit(dir:string){for(const entry of readdirSync(dir,{withFileTypes:true})){const path=join(dir,entry.name);if(entry.isDirectory())visit(path);else if(entry.isFile()&&entry.name.endsWith('.ts'))found.push(relative(root,path).split(sep).join('/'));}}
  visit(join(root,'src'));return found.sort();
}
function dataFiles(root:string):string[]{return ['public/data/route.json','public/data/terrain.bin','public/data/adjacent-services.json','public/data/road-surfaces.json','public/data/land-surfaces.json',...readdirSync(join(root,'public/data/tiles')).sort().map(name=>`public/data/tiles/${name}`)];}
function hashFiles(root:string,paths:string[],overrides?:Overrides){const hash=createHash('sha256');for(const path of paths)hash.update(path).update('\0').update(read(root,path,overrides));return hash.digest('hex');}
export function sourceFingerprint(root=process.cwd(),overrides?:Overrides){return hashFiles(root,[...sourceFiles(root),...dataFiles(root)],overrides);}

/** Preserve the previous world identity only for this exact hosting-only source/data snapshot.
 * Any later source, data, config or policy change disables the compatibility exception. */
export function worldIdentity(root=process.cwd(),overrides?:Overrides):string {
  const baselineFile=join(root,'scripts/world-version-baseline.json');
  if(existsSync(baselineFile)){
    const baseline=JSON.parse(readFileSync(baselineFile,'utf8')) as Baseline;
    if(/^[0-9a-f]{64}$/.test(baseline.legacyWorldHash)&&baseline.sourceFingerprint===sourceFingerprint(root,overrides)&&baseline.configHash===fileHash(root,'vite.config.ts',overrides)&&baseline.policyHash===fileHash(root,'scripts/world-version.ts',overrides))return baseline.legacyWorldHash;
  }
  const physical=['vite.config.ts','scripts/world-version.ts','src/core/geometry.ts','src/core/simulation.ts','src/core/pose.ts','src/core/resource-url.ts','src/world/build.ts','src/world/platforms.ts','src/world/surfaces.ts','src/world/traffic.ts','src/render/assets.ts','src/render/trackwork.ts','src/render/batch.ts','src/render/renderer.ts',...dataFiles(root)];
  return hashFiles(root,physical,overrides);
}
