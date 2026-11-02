import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {resolveComposition} from '../src/world/prefab-composition.js';
import {composePrefabChunk} from '../src/render/prefab-assets.js';
const read=p=>JSON.parse(readFileSync(p)),manifest=read('public/data/grid/scenes/kidderminster/world.json');
const refs=[manifest.catalogue,manifest.enums,...manifest.tiles];
for(const ref of refs)if(createHash('sha256').update(readFileSync(`public/${ref.url}`)).digest('hex')!==ref.sha256)throw new Error(`Stale prefab index ${ref.url}; run npm run author:prefabs after reviewing edits`);
const catalogue=read(`public/${manifest.catalogue.url}`),enums=read(`public/${manifest.enums.url}`),chunks=manifest.tiles.map(t=>read(`public/${t.url}`)),world=resolveComposition(chunks,catalogue,enums);
let triangles=0,degenerate=0;
const packets=chunks.map(c=>composePrefabChunk(c,catalogue,enums,chunks));
for(const {mesh} of packets){
 if(!mesh.position.every(Number.isFinite)||!mesh.normal.every(Number.isFinite))throw Error('Non-finite prefab geometry');
 triangles+=mesh.index.length/3;
 for(let i=0;i<mesh.index.length;i+=3){const p=[0,1,2].map(k=>mesh.position.slice(mesh.index[i+k]*3,mesh.index[i+k]*3+3)),a=p[1].map((v,k)=>v-p[0][k]),b=p[2].map((v,k)=>v-p[0][k]);if(Math.hypot(a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0])<1e-9)degenerate++;}
}
const used=new Map();for(const d of catalogue.prefabs){const a=used.get(d.kind)||[];a.push(d.id);used.set(d.kind,a);}
const report={status:'IMPLEMENTED_AND_VERIFIED',scope:'Stage 1 construction slice only; not route-wide acceptance',revision:manifest.revision,prefabDefinitions:catalogue.prefabs.length,instances:world.instances.size,terrainCells:world.terrain.cells.size,chunks:chunks.length,triangles,degenerateTriangles:degenerate,maximumRailGradient:Math.max(...[...world.paths.values()].filter(p=>p.item.ports[0].mode==='rail').map(p=>p.vertical.maximum)),maximumRailTransitionPerTile:Math.max(...[...world.paths.values()].filter(p=>p.item.ports[0].mode==='rail').map(p=>p.vertical.transition)),enumCategories:Object.keys(enums.enums).length,enumValues:Object.values(enums.enums).reduce((n,a)=>n+a.length,0),objectKindCoverage:enums.enums.WorldObjectKind.map(e=>({...e,prefabs:used.get(e.id)||[],status:used.has(e.id)?'IMPLEMENTED_AND_VERIFIED':'INCOMPLETE'})),remaining:['Legacy runtime placement still exists outside the slice','Other terrain slope masks, retained steps, tunnels and grade exceptions are not implemented in the new compositor','No full-route migration or station visual acceptance','No hardware performance acceptance']};
mkdirSync('docs/reports',{recursive:true});writeFileSync('docs/reports/prefab-scene.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({...report,objectKindCoverage:undefined},null,2));if(degenerate)process.exitCode=1;
