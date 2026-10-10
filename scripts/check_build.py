#!/usr/bin/env python3
"""Exercise final built routes over HTTP and compare against captured main bodies."""
import json, threading, urllib.request
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from functools import partial
from pathlib import Path
from bs4 import BeautifulSoup
from capture import ROOT, write_csv
from convert_batch import signature
from site_model import canonical_signature,without_baseurl
from site_server import SiteHandler,SITE,metadata

server=ThreadingHTTPServer(('127.0.0.1',0),SiteHandler)
threading.Thread(target=server.serve_forever,daemon=True).start()
base=f'http://127.0.0.1:{server.server_port}'+metadata()['baseurl'].rstrip('/')
try:
    rows=[]
    routes=json.loads((ROOT/'reports/route-map.json').read_text()) if (ROOT/'reports/route-map.json').exists() else {}
    asset_index=json.loads((ROOT/'reports/asset-index.json').read_text()) if (ROOT/'reports/asset-index.json').exists() else {}
    for asset in asset_index.values():
        if asset.get('download_status')!='downloaded':continue
        with urllib.request.urlopen(base+'/'+asset['local_path']) as response:
            assert response.status==200
            assert __import__('hashlib').sha256(response.read()).hexdigest()==asset['sha256'],'Served asset bytes changed'
    font_status=json.loads((ROOT/'reports/font-status.json').read_text())
    for derived in font_status['derived_files']:
        path,checksum=derived['path'],derived['sha256']
        with urllib.request.urlopen(base+'/'+path) as response:
            assert __import__('hashlib').sha256(response.read()).hexdigest()==checksum,'Derived font CSS changed'
    index=json.loads((ROOT/'reports/capture-index.json').read_text())
    for row in index['records']:
        if row.get('conversion_status')!='converted':continue
        url=row['url']
        evidence=ROOT/'reports/validation'/__import__('hashlib').sha256(url.encode()).hexdigest()[:16]
        expected=canonical_signature(json.loads((evidence/'source-signature.json').read_text()),routes)
        with urllib.request.urlopen(base+row['local_route']) as response:
            built=without_baseurl(BeautifulSoup(response.read(),'html.parser'),metadata()['baseurl'])
            assert response.status==200
            actual=json.loads(json.dumps(signature(built.select_one('[data-source-body]') or built.select_one('main'),row.get('asset_mapping'))))
            assert expected==actual,url
        rows.append({'url':url,'local_route':row['local_route'],'http_status':200,'built_content_checks':'passed'})
    paper_path=ROOT/'reports/paper-validation.json'
    if paper_path.exists():
        papers=json.loads(paper_path.read_text())
        for paper in papers:
            with urllib.request.urlopen(base+paper['local_route']) as response:
                built=without_baseurl(BeautifulSoup(response.read(),'html.parser'),metadata()['baseurl'])
                actual=json.loads(json.dumps(signature(built.select_one('[data-source-body]') or built.select_one('main'),paper.get('asset_mapping'))))
                assert actual==canonical_signature(paper['source_signature'],routes),paper['slug']
        print(f'PASS: {len(papers)} paper entry routes match complete source catalogue entries.')
    write_csv(ROOT/'reports/build-validation.csv',rows,list(rows[0]))
    print(f'PASS: {len(rows)} source URL mappings on {len(set(r["local_route"] for r in rows))} distinct routes served HTTP 200 and match captured main content; {sum(a.get('download_status')=='downloaded' for a in asset_index.values())} asset responses match original checksums.')
finally:
    server.shutdown();server.server_close()
