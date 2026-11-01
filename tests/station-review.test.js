import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,writeFileSync,readFileSync,copyFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
const hash=s=>createHash('sha256').update(s).digest('hex');
function fixture(){
 const root=mkdtempSync(join(tmpdir(),'railway-review-'));
 for(const dir of ['scripts','site','docs/reports','docs/captures','references/frames'])mkdirSync(join(root,dir),{recursive:true});
 copyFileSync('scripts/build-station-review.js',join(root,'scripts/build-station-review.js'));writeFileSync(join(root,'package.json'),'{"type":"module"}');
 const write=(p,v)=>writeFileSync(join(root,p),JSON.stringify(v));
 const capture='docs/captures/kid.png',captureBytes='captured-game-image',build=hash('{}'),captureHash=hash(captureBytes);
 writeFileSync(join(root,capture),captureBytes);writeFileSync(join(root,'references/frames/kidderminster2dorridge0027.jpg'),'original-source-image');writeFileSync(join(root,'site/build-manifest.json'),'{}');
 write('docs/reports/reconstruction-browser.json',{manifestSHA256:build,sourceHashes:{},captures:[{station:'KID',direction:1,file:capture,sha256:captureHash}]});
 write('references/location-index.json',{records:[],stations:[{id:'KID',name:'Kidderminster',map:'map.svg',map_focus:[]}]});
 const notes={manifestSHA256:build,captureSHA256:{[capture]:captureHash},reviews:{KID:'Inspected; canopy and access remain inaccurate.'}};write('docs/station-review-notes.json',notes);
 return{root,notes,write,capture,run:()=>spawnSync(process.execPath,['scripts/build-station-review.js'],{cwd:root,encoding:'utf8'})};
}
test('station reviews apply only to the exact build and image bytes',()=>{
 const f=fixture();try{
  assert.equal(f.run().status,0);let report=JSON.parse(readFileSync(join(f.root,'docs/station-review.json')));assert.equal(report.stations_with_photographic_review,1);assert.equal(report.accepted,0);
  f.notes.manifestSHA256='another-build';f.write('docs/station-review-notes.json',f.notes);assert.equal(f.run().status,0);report=JSON.parse(readFileSync(join(f.root,'docs/station-review.json')));assert.equal(report.stations[0].review_status,'unreviewed');
  writeFileSync(join(f.root,f.capture),'changed');const result=f.run();assert.notEqual(result.status,0);assert.match(result.stderr,/Capture bytes changed/);
 }finally{rmSync(f.root,{recursive:true,force:true});}
});
