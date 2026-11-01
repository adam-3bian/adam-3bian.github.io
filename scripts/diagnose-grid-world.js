import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {decodeGrid} from '../src/world/grid.js';
import {Terrain} from '../src/world/surfaces.js';
import {inspectGridWorld} from '../src/world/diagnostics.js';
const document=JSON.parse(readFileSync('public/data/grid/world.json')),route=decodeGrid(document.route),bytes=Uint8Array.from(readFileSync('public/data/grid/terrain.bin'));
const terrain=new Terrain(route.terrain,new Uint16Array(bytes.buffer)),result=inspectGridWorld(route,(x,z)=>terrain.raw(x,z));
result.revision=document.revision;mkdirSync('docs/reports',{recursive:true});writeFileSync('docs/reports/grid-diagnostics.json',JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({revision:result.revision,totals:result.totals,errors:result.errors.length},null,2));if(result.errors.length)process.exitCode=1;
