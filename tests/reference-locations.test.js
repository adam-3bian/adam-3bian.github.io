import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {resolve,sep} from 'node:path';
import {readCsv} from '../scripts/reference-csv.js';
const hash=p=>createHash('sha256').update(readFileSync(p)).digest('hex');
test('named location records retain original source bytes and sequence identity',()=>{
 const refs=resolve('references'),index=JSON.parse(readFileSync(resolve(refs,'location-index.json'))),originals=new Map(readCsv(readFileSync(resolve(refs,'frame-index.csv'),'utf8')).map(r=>[Number(r.frame_number),r]));
 assert.equal(index.records.length,3000);assert.equal(new Set(index.records.map(r=>r.expanded_frame)).size,3000);let exact=0;
 for(const r of index.records){const named=resolve(refs,r.named_path),canonical=resolve(refs,r.canonical_path);assert.ok(named.startsWith(resolve(refs,'by-location')+sep));assert.equal(hash(named),r.sha256);assert.equal(hash(canonical),r.sha256);if(r.original_frame!==null){exact++;assert.equal(r.expanded_frame,5*r.original_frame-2);assert.equal(originals.get(r.original_frame).sha256,r.sha256);}assert.equal(r.precise_route_mapping,'unmapped');}
 assert.equal(exact,584);assert.equal(index.stations.length,22);assert.ok(index.stations.some(s=>s.source_gap));
});
test('uploaded reference inventory retains its checksums',()=>{
 const refs=resolve('references'),inventory=JSON.parse(readFileSync(resolve(refs,'inventory.json'))).files;assert.equal(inventory.length,2995);
 for(const r of inventory)assert.equal(hash(resolve(refs,r.path)),r.sha256,r.path);
});
