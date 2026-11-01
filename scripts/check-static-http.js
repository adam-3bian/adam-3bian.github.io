/** Fetch and hash every packaged file over HTTP at root and nested paths. */
import {createServer} from 'node:http';
import {createReadStream,existsSync,readFileSync,statSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const site=resolve('site'),manifestBytes=readFileSync(resolve(site,'build-manifest.json')),manifest=JSON.parse(manifestBytes),sha=b=>createHash('sha256').update(b).digest('hex');
const server=createServer((req,res)=>{let path=decodeURIComponent(new URL(req.url,'http://localhost').pathname);if(path.startsWith('/nested/railway/'))path=path.slice('/nested/railway'.length);const file=resolve(site,'.'+path);if(!file.startsWith(site+'/')||!existsSync(file)||!statSync(file).isFile()){res.writeHead(404);res.end();return;}res.writeHead(200,{'Content-Length':statSync(file).size});createReadStream(file).pipe(res);});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const origin=`http://127.0.0.1:${server.address().port}`,results={};
try{
 for(const [label,prefix] of [['root','/'],['nested/railway','/nested/railway/']]){
  const todo=Object.entries(manifest.siteFiles),failures=[];let checked=0;
  await Promise.all(Array.from({length:4},async()=>{while(todo.length){const [path,expected]=todo.pop();try{const url=origin+prefix+path.replace(/^site\//,'').split('/').map(encodeURIComponent).join('/'),response=await fetch(url,{signal:AbortSignal.timeout(30000)});if(!response.ok)throw Error(`HTTP ${response.status}`);if(sha(Buffer.from(await response.arrayBuffer()))!==expected)throw Error('hash mismatch');}catch(error){failures.push({path,reason:String(error.message||error)});}checked++;}}));
  results[label]={checked,failures};
 }
}finally{await new Promise(resolve=>server.close(resolve));}
const report={generatedUTC:new Date().toISOString(),manifestSHA256:sha(manifestBytes),scriptSHA256:sha(readFileSync(fileURLToPath(import.meta.url))),scope:'HTTP retrieval and hashes only; browser isolation is checked separately.',results};writeFileSync('docs/reports/static-http-js.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));if(Object.values(results).some(r=>r.failures.length))process.exitCode=1;
