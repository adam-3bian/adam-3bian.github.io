/** Pair captures with supported reference anchors, without auto-approval. */
import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const anchors={KID:27,BKD:90,HAG:133,SBJ:178,LYE:229,CRA:247,OHL:272,ROW:287,LGG:null,SGB:345,THW:361,JEQ:397,BSW:423,BMO:443,BBS:null,SMA:487,TYS:null,ACG:null,OLT:513,SOL:541,WMR:null,DDG:null};
const read=p=>JSON.parse(readFileSync(resolve(root,p),'utf8'));
const sha=p=>createHash('sha256').update(readFileSync(resolve(root,p))).digest('hex');
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const run=read('docs/reports/reconstruction-browser.json'),locations=read('references/location-index.json');
const notesPath='docs/station-review-notes.json',notesDoc=existsSync(resolve(root,notesPath))?read(notesPath):{};
const notes=notesDoc.manifestSHA256===run.manifestSHA256&&run.captures.every(c=>notesDoc.captureSHA256?.[c.file]===c.sha256)?notesDoc.reviews||{}:{};
if(sha('site/build-manifest.json')!==run.manifestSHA256)throw Error('Capture build is stale; rerun current-build capture before reviewing');
if(run.captures.some(c=>sha(c.file)!==c.sha256))throw Error('Capture bytes changed; recapture/review instead of inheriting notes');
const rows=[],cards=[];
for(const s of locations.stations){
 const views=run.captures.filter(c=>c.station===s.id),number=anchors[s.id],ref=number?`references/frames/kidderminster2dorridge${String(number).padStart(4,'0')}.jpg`:null;
 const named=number?locations.records.find(r=>r.original_frame===number)?.named_path:null,note=notes[s.id]||null;
 const row={id:s.id,name:s.name,reference:ref,named_reference:named?'references/'+named:null,reference_sha256:ref?sha(ref):null,map:s.map,map_focus:s.map_focus,views,alignment:ref?'approximate station anchor only; source pose, camera and date unknown':'no securely assigned station photograph',review_status:!ref?'source gap':!note?'unreviewed':'reviewed with unresolved differences',review:note,acceptance:'not accepted'};rows.push(row);
 const images=(ref?`<a href="../${esc(ref)}"><img src="../${esc(ref)}"></a>`:'<p>No securely assigned station photograph</p>')+views.map(c=>`<a href="../${esc(c.file)}"><img src="../${esc(c.file)}"></a>`).join('');
 cards.push(`<article><h2>${esc(s.name)}</h2><div>${images}</div><p>${esc(row.alignment)}</p><p>${esc(note||row.review_status)}</p></article>`);
}
const report={version:1,scriptSHA256:sha('scripts/build-station-review.js'),notesSHA256:existsSync(resolve(root,notesPath))?sha(notesPath):null,captureReportSHA256:sha('docs/reports/reconstruction-browser.json'),scope:'Station views and source anchors; image poses are approximate and no station is automatically accepted.',manifestSHA256:run.manifestSHA256,source_hashes:run.sourceHashes,station_count:rows.length,captured_views:rows.reduce((n,s)=>n+s.views.length,0),stations_with_supported_photo:rows.filter(s=>s.reference).length,stations_with_model_view_review:rows.filter(s=>s.review).length,stations_with_photographic_review:rows.filter(s=>s.review&&s.reference).length,accepted:0,stations:rows};
writeFileSync(resolve(root,'docs/station-review.json'),JSON.stringify(report,null,2)+'\n');
writeFileSync(resolve(root,'docs/station-review.html'),`<!doctype html><html lang="en"><meta charset="utf-8"><title>Station reference review</title><style>body{font:16px sans-serif;margin:2rem}article{border-bottom:1px solid #aaa;padding-bottom:2rem}article>div{display:flex;gap:1rem;flex-wrap:wrap}img{width:320px;max-width:100%}</style><h1>Station reference review — incomplete</h1><p>Reference and game views remain separate from acceptance.</p>${cards.join('')}</html>`);
console.log(JSON.stringify({station_count:report.station_count,reviewed:report.stations_with_photographic_review,accepted:0}));
