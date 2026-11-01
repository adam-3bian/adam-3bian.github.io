import {createHash} from 'node:crypto';
import {readFileSync,readdirSync,writeFileSync} from 'node:fs';
import {join,sep} from 'node:path';

const digest=path=>createHash('sha256').update(readFileSync(path)).digest('hex');
function files(root){const result=[];function visit(dir){for(const entry of readdirSync(dir,{withFileTypes:true})){const path=join(dir,entry.name);if(entry.isDirectory())visit(path);else if(entry.isFile())result.push(path.split(sep).join('/'));else throw new Error(`Unexpected non-file in ${path}`);}}visit(root);return result.sort();}
function hashes(paths){return Object.fromEntries(paths.map(path=>[path,digest(path)]));}
function snapshot(){
  const html=readFileSync('site/index.html','utf8');
  if(!html.includes('<head>')||readFileSync('index.html','utf8')!==html.replace('<head>','<head>\n    <base href="./site/">'))throw new Error('The repository-root entry does not match the site entry.');
  const inputs=['app.html','vite.config.ts','package.json','package-lock.json','scripts/world-version.ts','scripts/world-version-baseline.json','scripts/site-manifest.mjs',...files('src'),...files('public')].sort();
  return {schema:1,method:'SHA-256 of static build inputs and output files; the manifest excludes itself.',inputs:hashes(inputs),rootIndex:digest('index.html'),siteFiles:hashes(files('site').filter(path=>path!=='site/build-manifest.json'))};
}
const actual=snapshot(),manifest='site/build-manifest.json';
if(process.argv[2]==='--write'){
  writeFileSync(manifest,JSON.stringify(actual,null,2)+'\n');console.log(`Recorded ${Object.keys(actual.inputs).length} inputs and ${Object.keys(actual.siteFiles).length} static files.`);
}else if(process.argv[2]==='--check'){
  const expected=JSON.parse(readFileSync(manifest,'utf8'));
  if(JSON.stringify(actual)!==JSON.stringify(expected)){
    for(const group of ['inputs','siteFiles']){const keys=new Set([...Object.keys(actual[group]),...Object.keys(expected[group]||{})]);const changed=[...keys].filter(key=>actual[group][key]!==expected[group]?.[key]);if(changed.length)console.error(`${group} changed: ${changed.slice(0,12).join(', ')}${changed.length>12?' …':''}`);}
    if(actual.rootIndex!==expected.rootIndex)console.error('Root index changed.');
    console.error('The checked-in static site is stale or incomplete. Rebuild it with npm run build:site.');process.exitCode=1;
  }else console.log(`Static site matches ${Object.keys(actual.inputs).length} build inputs and ${Object.keys(actual.siteFiles).length} output files.`);
}else throw new Error('Use --write or --check.');
