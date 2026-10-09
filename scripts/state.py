"""Atomic crawl state updates that preserve concurrent conversion work."""
import fcntl,json,os
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
CONVERSION_FIELDS=('asset_mapping','local_path','local_route','conversion_status','verification_status','main_content_checks','reason_if_unresolved','source_breadcrumb','parent_url','hierarchy_evidence_path','hierarchy_method')
def write(path,data):
 temp=path.with_name(path.name+'.'+str(os.getpid())+'.tmp');temp.write_text(json.dumps(data,indent=2)+'\n');temp.replace(path)
def save_capture(data,root=ROOT):
 path=root/'reports/capture-index.json'
 with (root/'reports/capture-index.lock').open('a') as lock:
  fcntl.flock(lock,fcntl.LOCK_EX)
  current=json.loads(path.read_text()) if path.exists() else {'records':[]}
  existing={r['url']:r for r in current['records']}
  for row in data['records']:
   old=existing.get(row['url'],{})
   if old.get('conversion_status')=='converted' and row.get('sha256')==old.get('sha256'):
    row.update({k:old[k] for k in CONVERSION_FIELDS if k in old})
  write(path,data)
 return data

def update_conversion(changes,root=ROOT):
 path=root/'reports/capture-index.json'
 with (root/'reports/capture-index.lock').open('a') as lock:
  fcntl.flock(lock,fcntl.LOCK_EX)
  current=json.loads(path.read_text());rows={r['url']:r for r in current['records']}
  for url,update in changes.items():
   if rows[url].get('sha256')!=update['expected_sha256']:raise ValueError('Source changed during conversion: '+url)
   rows[url].update({k:v for k,v in update.items() if k!='expected_sha256'})
  current['records']=list(rows.values());write(path,current)
 return current
