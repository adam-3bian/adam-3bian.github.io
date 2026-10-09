#!/usr/bin/env python3
"""Check that original and local pages actually load Poppins with verified TLS."""
import json,os,threading
from functools import partial
from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
class Quiet(SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
server=ThreadingHTTPServer(('127.0.0.1',0),partial(Quiet,directory=str(ROOT/'_site')))
threading.Thread(target=server.serve_forever,daemon=True).start();results=[]
try:
 index={r['url']:r for r in json.loads((ROOT/'reports/capture-index.json').read_text())['records']}
 with sync_playwright() as p:
  options={'executable_path':'/usr/bin/chromium','headless':True,'args':['--no-sandbox']}
  if os.environ.get('HTTPS_PROXY'):options['proxy']={'server':os.environ['HTTPS_PROXY'],'bypass':'127.0.0.1,localhost'}
  browser=p.chromium.launch(**options)
  for url in json.loads((ROOT/'scripts/batch-003.json').read_text()):
   evidence={}
   for name,target in [('source',url),('local',f'http://127.0.0.1:{server.server_port}'+index[url]['local_route'])]:
    page=browser.new_page(viewport={'width':1440,'height':1000});page.goto(target,wait_until='networkidle');page.evaluate('document.fonts.ready')
    evidence[name]=page.evaluate('''() => ({faces:[...document.fonts].filter(f=>f.family.includes('Poppins')).map(f=>({family:f.family,weight:f.weight,status:f.status})),heading:(()=>{const s=getComputedStyle(document.querySelector('main h1'));return {family:s.fontFamily,size:s.fontSize,weight:s.fontWeight,line_height:s.lineHeight}})()})''')
    evidence[name]['loaded_weights']=sorted({f['weight'] for f in evidence[name]['faces'] if f['status']=='loaded'})
    assert evidence[name]['heading']['weight'] in evidence[name]['loaded_weights'],'Heading font face did not load'
    page.close()
   assert evidence['source']['heading']==evidence['local']['heading'],'Heading typography mismatch'
   assert evidence['source']['loaded_weights']==evidence['local']['loaded_weights'],'Used font weights differ'
   results.append({'url':url,'status':'passed',**evidence})
  browser.close()
 (ROOT/'reports/typography-validation.json').write_text(json.dumps(results,indent=2)+'\n');print(f'PASS: actual Poppins font faces and heading typography match for {len(results)} pages.')
finally:server.shutdown();server.server_close()
