#!/usr/bin/env python3
"""Reflect retained asset responses in the source inventory, with request provenance."""
import hashlib,json
from urllib.parse import urlsplit
from capture import ROOT,HOSTS,write_csv
from state import save_capture
path=ROOT/'reports/capture-index.json';data=json.loads(path.read_text());rows={r['url']:r for r in data['records']};assets=json.loads((ROOT/'reports/asset-index.json').read_text());synced=0
for url,a in assets.items():
 host=urlsplit(url).hostname
 if host not in HOSTS:continue
 if a.get('download_status')=='failed':
  row=rows.setdefault(url,{'url':url,'source_site':host,'parent_url':None,'discovery_method':'attempted_asset_request','conversion_status':'unprocessed','verification_status':'unverified'})
  row['asset_download_status']='failed'
  if not row.get('snapshot_path'):row.update(fetch_status='failed',content_type='asset',http_status=a.get('http_status'),retrieved_at=a.get('retrieved_at'),reason_if_unresolved='Asset acquisition failed: '+a.get('reason_if_unresolved','Unknown failure'))
  continue
 if a.get('download_status')!='downloaded':continue
 body=ROOT/a['local_path'];assert hashlib.sha256(body.read_bytes()).hexdigest()==a['sha256']
 row=rows.setdefault(url,{'url':url,'source_site':host,'parent_url':None,'discovery_method':'retained_asset_response','conversion_status':'unprocessed','verification_status':'unverified'})
 if not row.get('snapshot_path'):
  row.update(snapshot_path=a['local_path'],sha256=a['sha256'],http_status=a.get('http_status',200),http_content_type=a.get('content_type',''),final_url=a.get('final_url',url),retrieved_at=a['retrieved_at'],capture_requested_url=a.get('capture_requested_url',url))
 row.update(fetch_status='fetched',content_type='asset',asset_local_path=a['local_path'],asset_download_status='downloaded')
 if row.get('conversion_status')!='converted':row['reason_if_unresolved']='Original asset bytes retained; integrity checked; content-page conversion is not applicable'
 synced+=1
data['records']=sorted(rows.values(),key=lambda r:r['url']);data=save_capture(data)
write_csv(ROOT/'reports/source-manifest.csv',[r for r in data['records'] if r.get('snapshot_path')],['source_site','url','final_url','capture_requested_url','snapshot_path','retrieved_at','sha256','http_status','http_content_type'])
write_csv(ROOT/'reports/url-inventory.csv',data['records'],['source_site','url','canonical_url','title','parent_url','discovered_from','discovery_method','content_type','http_status','fetch_status','conversion_status','verification_status','local_path','asset_local_path','reason_if_unresolved'])
print(f'{synced} same-origin asset responses reconciled with source inventory; original capture paths retained when already present.')
