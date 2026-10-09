#!/usr/bin/env python3
"""Acquire original public font resources and derive CSS with local URLs."""
import hashlib,json,re
from pathlib import Path
from capture import ROOT,request,STAMP
url='https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap'
folder=ROOT/'assets/shared/fonts';folder.mkdir(parents=True,exist_ok=True)
code,final,ct,body=request(url);original=folder/'poppins.css';original.write_bytes(body)
assets={url:{'source_url':url,'local_path':str(original.relative_to(ROOT)),'owning_entity':'shared/fonts','referencing_urls':['https://cheri-alliance.github.io/'],'download_status':'downloaded','verification_status':'integrity-checked','sha256':hashlib.sha256(body).hexdigest(),'http_status':code,'content_type':ct,'retrieved_at':STAMP(),'image_role':'stylesheet'}}
css=body.decode();replacements={};by_hash={}
for font_url in sorted(set(re.findall(r'url\((?:[\"\']?)(https://fonts\.gstatic\.com/[^)\"\']+)',css))):
 status,final,ct,data=request(font_url)
 assert data[:4] in (b'\x00\x01\x00\x00',b'OTTO',b'wOFF',b'wOF2'),'Invalid font signature'
 checksum=hashlib.sha256(data).hexdigest();target=folder/(checksum[:12]+'-'+font_url.rsplit('/',1)[-1])
 target=by_hash.get(checksum,target);target.write_bytes(data);by_hash[checksum]=target
 replacements[font_url]='/'+str(target.relative_to(ROOT))
 assets[font_url]={'source_url':font_url,'local_path':str(target.relative_to(ROOT)),'owning_entity':'shared/fonts','referencing_urls':[url],'download_status':'downloaded','verification_status':'integrity-checked','sha256':checksum,'http_status':status,'content_type':ct,'retrieved_at':STAMP(),'image_role':'font'}
for remote,local in replacements.items():css=css.replace(remote,local)
(folder/'poppins-local.css').write_text(css)
source=ROOT/'assets/shared/source-github.css';derived=ROOT/'assets/shared/source-github-local.css'
assert url in source.read_text(),'Source stylesheet changed its font import'
derived.write_text(source.read_text().replace(url,'/assets/shared/fonts/poppins-local.css'))
(ROOT/'reports/font-index.json').write_text(json.dumps(assets,indent=2)+'\n')
(ROOT/'reports/font-status.json').write_text(json.dumps({'checked_at':STAMP(),'status':'available-and-localized','font_css_http_status':code,'font_resources':len(replacements),'derived_files':[{ 'path':str(p.relative_to(ROOT)),'sha256':hashlib.sha256(p.read_bytes()).hexdigest()} for p in [folder/'poppins-local.css',derived]],'limitation':'Source font resources fetched using explicit Mozilla/5.0 migration User-Agent; compare actual browser typography separately.'},indent=2)+'\n')
index_path=ROOT/'reports/asset-index.json';index=json.loads(index_path.read_text()) if index_path.exists() else {};index.update(assets);temporary=index_path.with_suffix('.tmp');temporary.write_text(json.dumps(index,indent=2)+'\n');temporary.replace(index_path)
print('Font CSS and',len(replacements),'font resources captured and localized.')
