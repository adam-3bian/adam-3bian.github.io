#!/usr/bin/env python3
"""Compare declared browser-backed pages with the built site; retain visual evidence."""
import argparse,hashlib,json,os,re,threading
from pathlib import Path
from functools import partial
from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
from urllib.parse import urlsplit
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
parser=argparse.ArgumentParser();parser.add_argument('batch',nargs='?',default=str(ROOT/'scripts/browser-crawl-004.json'));args=parser.parse_args()
class QuietHandler(SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
server=ThreadingHTTPServer(('127.0.0.1',0),partial(QuietHandler,directory=str(ROOT/'_site')))
threading.Thread(target=server.serve_forever,daemon=True).start();checks=[]
normalize=lambda text:re.sub(r'\s+',' ',text).strip()
try:
 with sync_playwright() as p:
  options={'executable_path':'/usr/bin/chromium','headless':True,'args':['--no-sandbox']}
  if os.environ.get('HTTPS_PROXY'):options['proxy']={'server':os.environ['HTTPS_PROXY'],'bypass':'127.0.0.1,localhost'}
  browser=p.chromium.launch(**options)
  index=json.loads((ROOT/'reports/capture-index.json').read_text())
  for url in json.loads(Path(args.batch).read_text()):
   record=next(r for r in index['records'] if r['url']==url)
   folder=ROOT/'reports/browser'/hashlib.sha256(url.encode()).hexdigest()[:16]
   original=json.loads((folder/'source-layout.json').read_text())
   page=browser.new_page(user_agent='Mozilla/5.0',viewport={'width':1440,'height':1000})
   page.goto(f'http://127.0.0.1:{server.server_port}'+record['local_route'],wait_until='networkidle')
   page.screenshot(path=str(folder/'local-desktop.png'),full_page=True)
   info=page.evaluate('''() => ({main_text:document.querySelector('main').innerText,images:[...document.querySelectorAll('main img')].map(e=>{let r=e.getBoundingClientRect();return {url:e.currentSrc||e.src,rect:{x:r.x,y:r.y,width:r.width,height:r.height},natural_width:e.naturalWidth,natural_height:e.naturalHeight}}),header_text:[...document.querySelectorAll('header')].map(e=>e.innerText),copyright_text:[...document.querySelectorAll('.copyright-bar')].map(e=>e.innerText),footer_text:[...document.querySelectorAll('footer')].map(e=>e.innerText)})''')
   info['url']=url;info['checks']={'visible_main_text':normalize(info['main_text'])==normalize(original['main_text']),
    'header_text':list(map(normalize,info['header_text']))==list(map(normalize,original['header_text'])),
    'footer_text':list(map(normalize,info['footer_text']))==list(map(normalize,original['footer_text']))}
   image_checks=[]
   for source_image,local_image in zip(original['images'],info['images']):
    actual_url=record['asset_mapping'].get(urlsplit(local_image['url']).path)
    delta={k:round(local_image['rect'][k]-source_image['rect'][k],3) for k in ('x','y','width','height')}
    image_checks.append({'source_url':source_image['url'],'mapped_url_correct':actual_url==source_image['url'],
      'loaded':local_image['natural_width']==source_image['natural_width'] and local_image['natural_height']==source_image['natural_height'],'geometry_delta_px':delta})
   info['checks']['copyright_text']=list(map(normalize,info['copyright_text']))==list(map(normalize,original['copyright_text']))
   info['image_checks']=image_checks
   info['checks']['image_count']=len(info['images'])==len(original['images'])
   info['checks']['image_integrity']=all(i['mapped_url_correct'] and i['loaded'] for i in image_checks)
   info['checks']['desktop_image_geometry']=all(abs(v)<=2 for i in image_checks for v in i['geometry_delta_px'].values())
   (folder/'local-layout.json').write_text(json.dumps(info,indent=2,ensure_ascii=False)+'\n')
   page.set_viewport_size({'width':390,'height':844});page.screenshot(path=str(folder/'local-mobile.png'),full_page=True)
   page.close();checks.append({'url':url,'checks':info['checks'],'evidence_path':str(folder.relative_to(ROOT))})
   print(url,info['checks'],flush=True)
  browser.close()
 (ROOT/'reports/browser-validation.json').write_text(json.dumps(checks,indent=2)+'\n')
finally:server.shutdown();server.server_close()
if any(not all(r['checks'].values()) for r in checks):raise SystemExit(1)
