#!/usr/bin/env python3
"""Acquire inventoried assets with retained provenance, deduplication and validation."""
import argparse,csv,hashlib,io,json,re,signal,time
from pathlib import Path
from urllib.parse import urlsplit
from urllib.robotparser import RobotFileParser
from urllib.error import HTTPError
import xml.etree.ElementTree as ET
from PIL import Image
import yaml
from capture import ROOT,request,STAMP,UA

STOP=False
def stop(*_):
 global STOP;STOP=True

def owner(url,refs):
 paper_path=ROOT/'_data/papers.yml'
 if paper_path.exists():
  for slug,paper in yaml.safe_load(paper_path.read_text()).items():
   if paper.get('publication_url')==url:return 'papers',slug,'Explicit publication link on the source paper catalogue entry'
 path=urlsplit(url).path
 match=re.search(r'/assets/images/(?:content|thumbnails)/(people|news|events|members|products|shared)/([^/]+?)(?:/|\.[A-Za-z0-9]+$)',path)
 if match:
  group,slug=match.groups();group={'members':'organisations'}.get(group,group)
  return group,slug,'Original asset path names owner; page references retained'
 if '/shared/' in path or len(refs)>1:return 'shared','source-assets','Referenced by multiple source pages or source shared directory'
 if refs:
  referring=urlsplit(refs[0]).path.strip('/').replace('/','--') or 'index'
  return 'pages',referring,'Referenced source page; final entity ownership not inferred'
 return 'shared','source-assets','Source asset; ownership needs review'

def main():
 p=argparse.ArgumentParser();p.add_argument('--host',default='cheri-alliance.github.io');p.add_argument('--limit',type=int,default=1000);p.add_argument('--time-budget',type=int,default=600);args=p.parse_args()
 signal.signal(signal.SIGTERM,stop);signal.signal(signal.SIGINT,stop)
 source=list(csv.DictReader((ROOT/'reports/asset-manifest.csv').open()))
 path=ROOT/'reports/asset-index.json';assets=json.loads(path.read_text()) if path.exists() else {}
 robot=RobotFileParser();robot.set_url('https://'+args.host+'/robots.txt');delay=.35
 try:
  _,_,_,body=request(robot.url);robot.parse(body.decode(errors='replace').splitlines())
  delay=max([.35,robot.crawl_delay(UA) or 0]+[float(v) for v in re.findall(r'^Crawl-delay:\s*(\d+)',body.decode(errors='replace'),re.M|re.I)])
 except HTTPError as e:
  if e.code!=404:raise
  robot.parse([])
 checksum_paths={a['sha256']:a['local_path'] for a in assets.values() if a.get('download_status')=='downloaded'}
 attempts=0;deadline=time.monotonic()+args.time_budget
 def save():
  temporary=path.with_suffix('.tmp');temporary.write_text(json.dumps(assets,indent=2)+'\n');temporary.replace(path)
 queue=sorted((r for r in source if urlsplit(r['source_url']).hostname==args.host),key=lambda r:('/content/' not in r['source_url'],r['source_url']))
 for row in queue:
  if STOP or time.monotonic()>deadline or attempts>=args.limit:break
  url=row['source_url'];old=assets.get(url)
  if old and old.get('download_status')=='downloaded':
   assert hashlib.sha256((ROOT/old['local_path']).read_bytes()).hexdigest()==old['sha256'],url;continue
  if old and old.get('download_status')=='failed':continue
  refs=[v.strip() for v in row.get('referencing_urls','').split(' | ') if v.strip()]
  group,slug,evidence=owner(url,refs)
  a={'source_url':url,'referencing_urls':refs,'owning_entity':group+'/'+slug,'ownership_evidence':evidence,
     'image_role':'unclassified','verification_status':'unverified'};assets[url]=a
  if not robot.can_fetch(UA,url):a.update(download_status='excluded-with-reason',reason_if_unresolved='Disallowed by robots.txt');continue
  time.sleep(delay);attempts+=1
  try:
   code,final,ct,body=request(url);suffix=Path(urlsplit(url).path).suffix.lower();dimensions=''
   if suffix in {'.png','.jpg','.jpeg','.webp','.gif','.ico','.bmp'}:
    with Image.open(io.BytesIO(body)) as im:im.verify()
    with Image.open(io.BytesIO(body)) as im:dimensions=f'{im.width}x{im.height}'
   elif suffix=='.pdf':
    if not body.startswith(b'%PDF-'):raise ValueError('Expected PDF, received different response')
   elif suffix=='.svg':
    if ET.fromstring(body).tag.split('}')[-1]!='svg':raise ValueError('Expected SVG root')
   elif 'html' in ct:raise ValueError('Asset URL returned HTML; not retaining as a valid binary')
   checksum=hashlib.sha256(body).hexdigest();filename=Path(urlsplit(url).path).name or 'asset'
   filename=re.sub(r'[^A-Za-z0-9._-]','-',filename)
   target=ROOT/'assets'/group/slug/(hashlib.sha256(url.encode()).hexdigest()[:12]+'-'+filename)
   if checksum in checksum_paths:target=ROOT/checksum_paths[checksum]
   else:
    target.parent.mkdir(parents=True,exist_ok=True)
    if target.exists() and hashlib.sha256(target.read_bytes()).hexdigest()!=checksum:raise ValueError('Existing file conflict')
    target.write_bytes(body);checksum_paths[checksum]=str(target.relative_to(ROOT))
   a.update(local_path=str(target.relative_to(ROOT)),sha256=checksum,http_status=code,final_url=final,content_type=ct,
            retrieved_at=STAMP(),original_dimensions=dimensions,download_status='downloaded',verification_status='integrity-checked')
  except Exception as e:a.update(download_status='failed',reason_if_unresolved=f'{type(e).__name__}: {e}',http_status=getattr(e,'code',None),retrieved_at=STAMP())
  save()
  if attempts%25==0:print(args.host,'asset requests',attempts,flush=True)
 save();summary={'run_at':STAMP(),'host':args.host,'requests':attempts,'inventoried_for_host':len(queue),
  'downloaded_for_host':sum(a.get('download_status')=='downloaded' and urlsplit(u).hostname==args.host for u,a in assets.items()),
  'failed_for_host':sum(a.get('download_status')=='failed' and urlsplit(u).hostname==args.host for u,a in assets.items())}
 report=ROOT/'reports'/('asset-crawl-'+args.host+'.json');report.write_text(json.dumps(summary,indent=2)+'\n');print(json.dumps(summary),flush=True)
if __name__=='__main__':main()
