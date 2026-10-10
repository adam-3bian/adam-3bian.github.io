#!/usr/bin/env python3
"""Repair broken source references using original assets of the same evidenced entity."""
import hashlib,io,json,time
from pathlib import Path
from PIL import Image
from capture import ROOT,request,STAMP
index_path=ROOT/'reports/asset-index.json';assets=json.loads(index_path.read_text())
capture_path=ROOT/'reports/capture-index.json';capture=json.loads(capture_path.read_text())
pa_source='https://cheri-alliance.org/wp-content/uploads/2026/09/Pa-logo-1024x908.png'
if pa_source not in assets or assets[pa_source].get('download_status')!='downloaded':
    time.sleep(10)
    status,final,content_type,data=request(pa_source)
    with Image.open(io.BytesIO(data)) as image:image.verify()
    checksum=hashlib.sha256(data).hexdigest()
    target='assets/organisations/pa-consulting/'+checksum[:12]+'-logo.png'
    p=ROOT/target;p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes(data)
    with Image.open(io.BytesIO(data)) as image:dimensions=f'{image.width}x{image.height}'
    assets[pa_source]={'source_url':pa_source,'local_path':target,'sha256':checksum,'owning_entity':'organisations/pa-consulting',
       'referencing_urls':['https://cheri-alliance.org/member/pa-consulting/'],'download_status':'downloaded','verification_status':'integrity-checked',
       'original_dimensions':dimensions,'http_status':status,'content_type':content_type,'retrieved_at':STAMP(),
       'ownership_evidence':'Published PA Consulting member profile labels this original asset PA Consulting logo'}
pa_path='/'+assets[pa_source]['local_path']
event_path='/assets/events/cheritech25/0e6d3180c4d1-cheritech25.webp'
event_asset=next(a for a in assets.values() if a.get('local_path')==event_path.lstrip('/'))
repairs={
 'https://cheri-alliance.github.io/assets/images/content/members/pa-consulting/logo.png':(pa_path,pa_source,'Same PA Consulting member organisation; original WordPress profile explicitly labels this asset PA Consulting logo'),
 'https://cheri-alliance.github.io/assets/images/thumbnails/members/pa-consulting.webp':(pa_path,pa_source,'Same PA Consulting member organisation; original source logo is reused without another binary copy'),
 'https://cheri-alliance.github.io/assets/images/content/events/cheri-tech-conference-2025/hero.png':(event_path,event_asset['source_url'],"Article is about the CHERITech25 Conference; reuse the original image published on that event's own page")}
changes=json.loads((ROOT/'reports/source-image-repairs.json').read_text()) if (ROOT/'reports/source-image-repairs.json').exists() else []
for row in capture['records']:
    if row.get('conversion_status')!='converted':continue
    path=ROOT/row['local_path'];text=path.read_text()
    for broken,(local,real,evidence) in repairs.items():
        if '('+broken+')' not in text:continue
        assert assets[broken].get('http_status')==404,broken
        text=text.replace('('+broken+')','('+local+')')
        row.setdefault('asset_mapping',{})[local]=broken
        assets[real]['referencing_urls']=sorted(set(assets[real].get('referencing_urls',[])+[row['url']]))
        changes.append({'path':row['local_path'],'source_url':row['url'],'broken_reference':broken,'source_http_status':404,
                        'replacement_original_url':real,'local_path':local.lstrip('/'),'evidence':evidence,'status':'repaired-from-same-entity-source'})
    path.write_text(text)
index_path.write_text(json.dumps(assets,indent=2)+'\n');capture_path.write_text(json.dumps(capture,indent=2)+'\n')
(ROOT/'reports/source-image-repairs.json').write_text(json.dumps(changes,indent=2)+'\n')
print(f'Repaired {len(changes)} source image references using verified original same-entity assets. Original 404 acquisitions remain documented.')
