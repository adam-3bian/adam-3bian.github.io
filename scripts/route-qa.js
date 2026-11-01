/** Build a reference gallery without claiming that unmapped images were reviewed. */
import {readFileSync,writeFileSync,existsSync,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {resolve,relative,dirname,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import {readCsv} from './reference-csv.js';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..'),refs=resolve(root,'references');
const options={interval:'5',out:resolve(root,'work/route-qa'),alignment:resolve(root,'docs/reference-comparisons.json')};
for(let i=2;i<process.argv.length;i++){const key=process.argv[i].replace(/^--/,'');if(!(key in options)||!process.argv[i+1])throw Error(`Unknown or incomplete option ${process.argv[i]}`);options[key]=process.argv[++i];}
const interval=Number(options.interval),out=resolve(options.out),alignmentPath=resolve(options.alignment);
if(![5,10].includes(interval)||out===refs||out.startsWith(refs+sep))throw Error('Interval must be 5 or 10 and output must be outside references/');
const sha=p=>createHash('sha256').update(readFileSync(p)).digest('hex'),inside=(base,p)=>p.startsWith(base+sep);
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const csv=p=>readCsv(readFileSync(resolve(refs,p),'utf8'));
const expanded=csv('frame-index-expanded.csv'),alignments=csv('frame-alignment.csv'),byNumber=new Map(expanded.map(r=>[Number(r.frame_number),r])),errors=[];
if(expanded.length!==3000||byNumber.size!==3000)errors.push('Expanded index must contain 3000 distinct frame numbers');
if(alignments.length!==584)errors.push('Alignment index must contain 584 original frames');
for(const row of alignments){
 const original=Number(row.original_frame_number),number=Number(row.expanded_frame_number),match=byNumber.get(number),path=resolve(refs,row.original_path);
 if(number!==5*original-2||!match||match.sha256!==row.sha256||!inside(refs,path)||!existsSync(path)||sha(path)!==row.sha256||Number(row.original_relative_seconds)!==(original-17)*5||Number(row.expanded_relative_seconds)!==number-1)errors.push(`Invalid frame alignment: original ${original}, expanded ${number}`);
}
const entries=[];
for(const row of expanded){
 const seconds=Number(row.seconds_after_first_supplied_frame);if(seconds%interval)continue;
 const path=resolve(refs,row.canonical_path);let digest=null;if(!inside(refs,path)||!existsSync(path))errors.push(`Missing or invalid reference: ${row.canonical_path}`);else{digest=sha(path);if(digest!==row.sha256)errors.push(`Checksum mismatch: ${row.canonical_path}`);}
 entries.push({frame:Number(row.frame_number),relative_seconds:seconds,reference:row.canonical_path,sha256:digest,classification:'unclassified',alignment:'unmapped',game_capture:null,review:'unreviewed'});
}
let critical=[];
if(existsSync(alignmentPath))try{
 const doc=JSON.parse(readFileSync(alignmentPath));if(doc.version!==1||!Array.isArray(doc.critical_pairs))throw Error('Unsupported critical-pair manifest');
 if(sha(resolve(root,'site/build-manifest.json'))!==doc.build_manifest_sha256)throw Error('Critical-pair build hash is stale');
 const seen=new Set();
 for(const pair of doc.critical_pairs){
  const number=Number(pair.expanded_frame),row=byNumber.get(number);if(seen.has(number)||!row)throw Error(`Duplicate or unknown critical frame ${number}`);seen.add(number);
  const reference=resolve(refs,row.canonical_path),capture=resolve(root,pair.capture);
  if(!inside(refs,reference)||!existsSync(reference)||sha(reference)!==row.sha256||pair.reference_sha256!==row.sha256)throw Error(`Critical reference ${number} does not match its source hash`);
  if(!inside(root,capture)||inside(refs,capture)||!existsSync(capture)||sha(capture)!==pair.capture_sha256)throw Error(`Critical capture ${number} is missing or changed`);
  const signature=readFileSync(capture).subarray(0,8);if(!signature.equals(Buffer.from([137,80,78,71,13,10,26,10]))&&!signature.subarray(0,3).equals(Buffer.from([255,216,255])))throw Error(`Critical capture ${number} is not a PNG or JPEG image`);
  if(![-1,1].includes(pair.direction)||!Number.isFinite(pair.chainage_m)||!Number.isFinite(pair.lane)||typeof pair.uncertainty!=='string'||!pair.uncertainty.trim()||typeof pair.review!=='string'||!pair.review.trim())throw Error(`Critical pair ${number} lacks pose, uncertainty or actual review`);
  critical.push({...pair,reference:row.canonical_path,relative_seconds:Number(row.seconds_after_first_supplied_frame),alignment:'approximate',review_status:'reviewed',sampled:entries.some(e=>e.frame===number)});
 }
}catch(error){errors.push(`Invalid critical-pair manifest: ${error.message}`);critical=[];}
for(const pair of critical){const entry=entries.find(e=>e.frame===pair.expanded_frame);if(entry)Object.assign(entry,{alignment:'approximate',game_capture:pair.capture,review:'reviewed'});}
mkdirSync(out,{recursive:true});const inputs=[resolve(refs,'frame-index-expanded.csv'),resolve(refs,'frame-alignment.csv'),fileURLToPath(import.meta.url)];if(existsSync(alignmentPath))inputs.push(alignmentPath);
const mapped=entries.filter(e=>e.alignment!=='unmapped').length,captured=entries.filter(e=>e.game_capture).length,reviewed=entries.filter(e=>e.review==='reviewed').length;
const report={status:'incomplete',interval_seconds:interval,source_hashes:Object.fromEntries(inputs.map(p=>[inside(root,p)?relative(root,p):p,sha(p)])),candidate_count:entries.length,mapped_count:mapped,captured_count:captured,reviewed_count:reviewed,unmapped_count:entries.length-mapped,errors,critical_pair_count:critical.length,critical_pairs:critical,limitations:['Most fixed-interval candidates remain unmapped and unreviewed.','Critical pairs are approximate evidence, not complete alignment, continuous-drive streaming or route acceptance.'],candidates:entries};
writeFileSync(resolve(out,'report.json'),JSON.stringify(report,null,2)+'\n');
const cards=entries.map(e=>{const url=esc(relative(out,resolve(refs,e.reference)));return `<figure><a href="${url}"><img loading="lazy" src="${url}" alt="Reference frame ${e.frame}"></a><figcaption>Frame ${e.frame}, ${e.relative_seconds} s: ${e.alignment}, ${e.review}</figcaption></figure>`;}).join('');
const pairs=critical.map(p=>{const ref=esc(relative(out,resolve(refs,p.reference))),game=esc(relative(out,resolve(root,p.capture)));return `<figure><a href="${ref}"><img loading="lazy" src="${ref}" alt="Reference frame ${p.expanded_frame}"></a><a href="${game}"><img loading="lazy" src="${game}" alt="Approximate game view"></a><figcaption>Frame ${p.expanded_frame}: ${esc(p.uncertainty)}. ${esc(p.review)}</figcaption></figure>`;}).join('');
writeFileSync(resolve(out,'index.html'),`<!doctype html><html lang="en"><meta charset="utf-8"><title>Route reference candidates</title><style>body{font:16px sans-serif}main{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:1em}figure{margin:0}img{width:100%}</style><h1>Sampled reference candidates</h1><p>${mapped} of ${entries.length} fixed-interval samples have approximate matches and ${reviewed} were reviewed; critical pairs appear below.</p><main>${cards}</main><h2>Approximate critical pairs</h2><main>${pairs}</main></html>`);
console.log(`INCOMPLETE: ${entries.length} sampled candidates, ${mapped} mapped, ${reviewed} reviewed; ${critical.length} critical pairs; ${errors.length} source errors.`);process.exitCode=1;
