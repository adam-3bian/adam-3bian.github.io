#!/usr/bin/env python3
"""Localize already-captured binary responses without new network requests."""
import hashlib,io,json,zipfile
from pathlib import Path
from urllib.parse import urlsplit
from capture import ROOT
index=json.loads((ROOT/'reports/capture-index.json').read_text())
path=ROOT/'reports/asset-index.json';assets=json.loads(path.read_text());hashes={a['sha256']:a['local_path'] for a in assets.values() if a.get('download_status')=='downloaded'};imported=[]
for row in index['records']:
 ct=row.get('http_content_type','')
 if not row.get('snapshot_path') or not any(t in ct for t in ('application/pdf','application/zip')):continue
 body=(ROOT/row['snapshot_path']).read_bytes();checksum=hashlib.sha256(body).hexdigest();assert checksum==row['sha256']
 suffix='.pdf' if 'pdf' in ct else '.zip'
 if suffix=='.pdf':assert body.startswith(b'%PDF-')
 else:
  with zipfile.ZipFile(io.BytesIO(body)) as archive:
   assert archive.testzip() is None,'Corrupt public ZIP'
 final=row.get('final_url',row['url']);filename=Path(urlsplit(final).path).name
 if not filename.endswith(suffix):filename=(Path(urlsplit(row['url']).path.rstrip('/')).name or 'download')+suffix
 slug=Path(urlsplit(row['url']).path.rstrip('/')).name or 'download';target=ROOT/'assets/resources'/slug/filename
 if checksum in hashes:target=ROOT/hashes[checksum]
 else:
  target.parent.mkdir(parents=True,exist_ok=True)
  if target.exists():assert hashlib.sha256(target.read_bytes()).hexdigest()==checksum,'Conflicting cached asset'
  else:target.write_bytes(body)
  hashes[checksum]=str(target.relative_to(ROOT))
 for url in set([row['url'],final]):
  old=assets.get(url,{})
  assets[url]={**old,'source_url':url,'local_path':str(target.relative_to(ROOT)),'owning_entity':'resources/'+slug,'referencing_urls':sorted(set(old.get('referencing_urls',[])+[row['url']])), 'download_status':'downloaded','verification_status':'integrity-checked','sha256':checksum,'http_status':row['http_status'],'content_type':ct,'retrieved_at':row['retrieved_at'],'snapshot_path':row['snapshot_path'],'capture_requested_url':row.get('capture_requested_url',row['url']),'final_url':final,'acquisition_method':'reuse-captured-public-binary-response','image_role':'download'}
 imported.append({'requested_url':row['url'],'final_url':final,'local_path':str(target.relative_to(ROOT)),'sha256':checksum})
temporary=path.with_suffix('.tmp');temporary.write_text(json.dumps(assets,indent=2)+'\n');temporary.replace(path)
(ROOT/'reports/cached-assets-import.json').write_text(json.dumps(imported,indent=2)+'\n')
print(f'Localized {len(imported)} captured downloads; no new network requests.')
