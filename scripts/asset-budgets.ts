import * as THREE from 'three';
import {createHash} from 'node:crypto';
import {mkdirSync,readFileSync,writeFileSync} from 'node:fs';
import {AssetFactory} from '../src/render/assets';

const factory=new AssetFactory();
function count(object:THREE.Object3D){let triangles=0,meshes=0;object.traverse(node=>{if(!(node as THREE.Mesh).isMesh)return;const geometry=(node as THREE.Mesh).geometry;meshes++;triangles+=(geometry.index?.count??geometry.getAttribute('position').count)/3;});return{meshes,triangles};}
type Probe={family:string;target:number;config:Record<string,unknown>;object:THREE.Group};
const probes:Probe[]=[];
const add=(family:string,target:number,config:Record<string,unknown>,object:THREE.Group)=>probes.push({family,target,config,object});
const house={id:'budget-house',width:8,depth:7,height:6};
add('ordinary-house',1500,house,factory.building(house));
add('tree',500,{id:'budget-tree'},factory.tree({id:'budget-tree'}));
for(const kind of ['car','taxi','van','bus','lorry']){const config={id:`budget-${kind}`,kind};add(`road/${kind}`,2500,config,factory.roadVehicle(config));}
for(const [kind,cars] of [['172',3],['168',4],['139',1],['metro',3],['emu',4],['heritage',3]] as const){const config={id:`budget-${kind}`,kind,cars};add(`rail/${kind}`,12000,config,factory.train(config));}
const results=probes.map(({family,target,config,object})=>{const cars=object.userData.cars as THREE.Group[]|undefined,perCar=cars?.map(count);return{family,config,targetTrianglesPerUnit:target,...count(object),perCar,withinTarget:perCar?perCar.every(c=>c.triangles<=target):count(object).triangles<=target};});
const paths=['scripts/asset-budgets.ts','src/render/assets.ts'];
const report={generatedAt:new Date().toISOString(),method:'Direct factory LOD0 probes. Rail limits apply to one external car. These probes do not certify every source building or parameter variant, LOD transitions, GPU performance or draw-call targets.',sourceHashes:Object.fromEntries(paths.map(p=>[p,createHash('sha256').update(readFileSync(p)).digest('hex')])),probes:results};
mkdirSync('docs/reports',{recursive:true});writeFileSync('docs/reports/asset-budgets.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(results.map(({family,triangles,perCar,withinTarget})=>({family,triangles,perCar,withinTarget}))));
if(results.some(p=>!p.withinTarget))process.exitCode=1;
