import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,writeFileSync,readFileSync,rmSync} from 'node:fs';
import {resolve,relative,join} from 'node:path';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {readCsv} from '../scripts/reference-csv.js';
const root=process.cwd(),sha=p=>createHash('sha256').update(readFileSync(p)).digest('hex');
const run=(interval,out,alignment)=>spawnSync(process.execPath,['scripts/route-qa.js','--interval',String(interval),'--out',out,'--alignment',alignment],{cwd:root,encoding:'utf8'});
test('sampling never claims unperformed photographic reviews',()=>{
 mkdirSync('work',{recursive:true});const dir=mkdtempSync(resolve('work/route-qa-'));
 try{for(const [interval,count] of [[5,600],[10,300]]){const out=join(dir,String(interval)),result=run(interval,out,join(dir,'missing.json'));assert.equal(result.status,1,result.stderr);const r=JSON.parse(readFileSync(join(out,'report.json')));assert.equal(r.status,'incomplete');assert.equal(r.candidate_count,count);assert.equal(r.unmapped_count,count);assert.equal(r.mapped_count,0);assert.equal(r.reviewed_count,0);assert.deepEqual(r.errors,[]);assert.ok(r.candidates.every(c=>c.alignment==='unmapped'&&c.review==='unreviewed'));assert.match(readFileSync(join(out,'index.html'),'utf8'),/Sampled reference candidates/);}}
 finally{rmSync(dir,{recursive:true,force:true});}
});
test('a critical comparison requires a matching build, reference and image',()=>{
 mkdirSync('work',{recursive:true});const dir=mkdtempSync(resolve('work/route-qa-'));
 try{
  const capture=join(dir,'capture.png'),bytes=Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),Buffer.from('fixture-capture')]);writeFileSync(capture,bytes);
  const first=readCsv(readFileSync('references/frame-index-expanded.csv','utf8'))[0],manifest={version:1,build_manifest_sha256:sha('site/build-manifest.json'),critical_pairs:[{expanded_frame:1,reference_sha256:first.sha256,capture:relative(root,capture),capture_sha256:sha(capture),chainage_m:123,lane:4.2,direction:1,uncertainty:'fixture only',review:'fixture review'}]},alignment=join(dir,'alignment.json'),out=join(dir,'out');
  writeFileSync(alignment,JSON.stringify(manifest));assert.equal(run(5,out,alignment).status,1);let report=JSON.parse(readFileSync(join(out,'report.json')));assert.deepEqual([report.mapped_count,report.captured_count,report.reviewed_count,report.critical_pair_count],[1,1,1,1]);assert.match(readFileSync(join(out,'index.html'),'utf8'),/fixture review/);
  writeFileSync(capture,'changed');run(5,out,alignment);report=JSON.parse(readFileSync(join(out,'report.json')));assert.equal(report.mapped_count,0);assert.ok(report.errors.some(e=>e.includes('capture')));
  writeFileSync(capture,bytes);manifest.build_manifest_sha256='0'.repeat(64);writeFileSync(alignment,JSON.stringify(manifest));run(5,out,alignment);report=JSON.parse(readFileSync(join(out,'report.json')));assert.equal(report.critical_pair_count,0);assert.ok(report.errors.some(e=>e.includes('build hash')));
 }finally{rmSync(dir,{recursive:true,force:true});}
});
