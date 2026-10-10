#!/usr/bin/env python3
"""Recheck immutable source captures against full canonical Markdown bodies."""
import hashlib,json,subprocess
from bs4 import BeautifulSoup
from capture import ROOT
from convert_batch import clean_main,signature
from site_model import document,canonical_signature
rows=json.loads((ROOT/'reports/capture-index.json').read_text())['records']
routes=json.loads((ROOT/'reports/route-map.json').read_text());checks=[]
for r in rows:
    if r.get('conversion_status')!='converted':continue
    raw=(ROOT/r['snapshot_path']).read_bytes()
    assert hashlib.sha256(raw).hexdigest()==r['sha256'],r['url']
    main,selector=clean_main(BeautifulSoup(raw,'html5lib'),r.get('final_url',r['url']))
    source=json.loads(json.dumps(signature(main)))
    saved=ROOT/'reports/validation'/hashlib.sha256(r['url'].encode()).hexdigest()[:16]/'source-signature.json'
    assert source==json.loads(saved.read_text()),('Source evidence mismatch',r['url'])
    body=document(r['local_path'])[1]
    rendered=subprocess.run([str(ROOT/'scripts/ruby.sh'),str(ROOT/'scripts/render.rb')],input=body,text=True,capture_output=True,check=True).stdout
    actual=json.loads(json.dumps(signature(BeautifulSoup(rendered,'html5lib'),r.get('asset_mapping'))))
    assert actual==canonical_signature(source,routes),('Markdown source mismatch',r['url'])
    checks.append({'source_url':r['url'],'path':r['local_path'],'source_sha256':r['sha256'],'selector':selector,'checks':{key:True for key in source},'status':'passed'})
(ROOT/'reports/final-source-content.json').write_text(json.dumps(checks,indent=2)+'\n')
print(f'PASS: {len(checks)} source URL mappings match their checksum-verified complete original bodies, with only declared canonical links rewritten.')
