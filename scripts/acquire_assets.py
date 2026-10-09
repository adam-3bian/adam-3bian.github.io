#!/usr/bin/env python3
"""Acquire original page-owned assets. Preserve bytes; never generate substitutes."""
import argparse,hashlib,json,re,time
from pathlib import Path
from urllib.parse import urlsplit
from PIL import Image
from bs4 import BeautifulSoup
from capture import ROOT,request,HOSTS,STAMP
from convert_batch import clean_main
p=argparse.ArgumentParser();p.add_argument('batch');args=p.parse_args()
urls=json.loads(Path(args.batch).read_text());index=json.loads((ROOT/'reports/capture-index.json').read_text())
path=ROOT/'reports/asset-index.json';assets=json.loads(path.read_text()) if path.exists() else {}
by_checksum={a['sha256']:a for a in assets.values() if a.get('download_status')=='downloaded'}
for url in urls:
 row=next(r for r in index['records'] if r['url']==url)
 soup=BeautifulSoup((ROOT/row['snapshot_path']).read_bytes(),'html.parser');main,_=clean_main(soup,row['final_url'])
 layout_path=ROOT/'reports/browser'/hashlib.sha256(url.encode()).hexdigest()[:16]/'source-layout.json'
 layout=json.loads(layout_path.read_text())
 slug=urlsplit(url).path.strip('/').split('/')[-1];is_person=urlsplit(url).path.startswith('/people/')
 candidates=[(img['src'],'people' if is_person else 'news',slug,'image-left' if is_person else 'image-full') for img in main.select('img[src]')]
 for a in main.select('a[href]'):
  if re.search(r'\.pdf(\?|$)',a['href'],re.I):
   if 'CHERI Blossoms 2026' not in main.get_text():raise ValueError('PDF ownership needs source evidence')
   candidates.append((a['href'],'events','cheri-blossoms-2026',None))
 for asset_url,kind,owner,image_class in candidates:
  if asset_url in assets and assets[asset_url].get('download_status')=='downloaded':
   a=assets[asset_url];assert hashlib.sha256((ROOT/a['local_path']).read_bytes()).hexdigest()==a['sha256']
   a['referencing_urls']=sorted(set(a.get('referencing_urls',[])+[url]));continue
  a={'source_url':asset_url,'owning_entity':kind+'/'+owner,'referencing_urls':[url],'download_status':'pending','verification_status':'unverified'}
  assets[asset_url]=a
  try:
   if urlsplit(asset_url).hostname not in HOSTS:raise ValueError('External destination requires separate access/scope check')
   if urlsplit(asset_url).hostname=='cheri-alliance.org':time.sleep(10)
   status,final,content_type,body=request(asset_url)
   checksum=hashlib.sha256(body).hexdigest()
   if image_class:
    import io
    with Image.open(io.BytesIO(body)) as im:
     im.verify()
    with Image.open(io.BytesIO(body)) as im:dimensions=f'{im.width}x{im.height}'
    original=next(i for i in layout['images'] if i['url']==asset_url)
    assert dimensions==f'{original["natural_width"]}x{original["natural_height"]}','Browser/decoded image dimension mismatch'
   else:
    assert body.startswith(b'%PDF-'),'Download is not PDF';dimensions=''
   filename=Path(urlsplit(asset_url).path).name
   target=ROOT/'assets'/kind/owner/(hashlib.sha256(asset_url.encode()).hexdigest()[:10]+'-'+filename)
   target.parent.mkdir(parents=True,exist_ok=True)
   if checksum in by_checksum:target=ROOT/by_checksum[checksum]['local_path']
   else:
    if target.exists() and hashlib.sha256(target.read_bytes()).hexdigest()!=checksum:raise ValueError('Existing asset conflict; refusing overwrite')
    target.write_bytes(body)
   a.update(local_path=str(target.relative_to(ROOT)),sha256=checksum,http_status=status,final_url=final,content_type=content_type,
            retrieved_at=STAMP(),original_dimensions=dimensions,download_status='downloaded',verification_status='integrity-checked',
            image_role=image_class or 'download',layout_evidence=str(layout_path.relative_to(ROOT)) if image_class else '',
            ownership_evidence=url+' — '+('Source profile image' if is_person and image_class else 'Source article image' if image_class else 'CHERI Adoption study | CHERI Blossoms 2026'))
   by_checksum[checksum]=a;print(asset_url,'downloaded',len(body),'bytes',flush=True)
  except Exception as e:a.update(download_status='failed',reason_if_unresolved=str(e));print(asset_url,'failed',str(e),flush=True)
  path.write_text(json.dumps(assets,indent=2)+'\n')
path.write_text(json.dumps(assets,indent=2)+'\n')
if any(a['download_status']=='failed' for a in assets.values()):raise SystemExit(1)
