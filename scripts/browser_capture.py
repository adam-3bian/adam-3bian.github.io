#!/usr/bin/env python3
"""Capture rendered public evidence with verified TLS; do not submit forms."""
import argparse,hashlib,json,os,time,shutil,re
from pathlib import Path
from datetime import datetime,timezone
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
p=argparse.ArgumentParser();p.add_argument('batch');args=p.parse_args()
urls=json.loads(Path(args.batch).read_text());summaries=[]
with sync_playwright() as playwright:
 settings={'executable_path':'/usr/bin/chromium','headless':True,'args':['--no-sandbox']}
 if os.environ.get('HTTPS_PROXY'):settings['proxy']={'server':os.environ['HTTPS_PROXY']}
 browser=playwright.chromium.launch(**settings)
 for url in urls:
  folder=ROOT/'reports/browser'/hashlib.sha256(url.encode()).hexdigest()[:16];folder.mkdir(parents=True,exist_ok=True)
  previous=folder/'source-layout.json'
  if previous.exists():
   old=json.loads(previous.read_text());version=re.sub(r'[^0-9A-Za-z._-]','-',old.get('retrieved_at',str(time.time())))
   history=folder/'history'/version;history.mkdir(parents=True,exist_ok=True)
   for existing in folder.iterdir():
    if existing.is_file():
     target=history/existing.name
     if not target.exists():shutil.copy2(existing,target)
  page=browser.new_page(user_agent='Mozilla/5.0',viewport={'width':1440,'height':1000})
  failed=[]
  page.on('requestfailed',lambda request:failed.append({'url':request.url,'error':request.failure}))
  page.route('**/*',lambda route:route.continue_() if route.request.method in ('GET','HEAD') else route.abort())
  try:
   response=page.goto(url,wait_until='networkidle',timeout=45000)
   assert response and response.status==200,f'HTTP {response.status if response else "unknown"}'
   page.locator('main').wait_for()
   page.screenshot(path=str(folder/'source-desktop.png'),full_page=True)
   (folder/'rendered-dom.html').write_text(page.content())
   info=page.evaluate('''() => {
    const main=document.querySelector('main');const rect=e=>{let r=e.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height}};
    return {main_text:main.innerText,main_rect:rect(main),images:[...main.querySelectorAll('img')].map(e=>({url:e.currentSrc||e.src,alt:e.alt,rect:rect(e),natural_width:e.naturalWidth,natural_height:e.naturalHeight,style:{float:getComputedStyle(e).float,display:getComputedStyle(e).display},parent:rect(e.parentElement),parent_classes:[...e.parentElement.classList],body_rect:rect(main.querySelector('.entity-body,.collection-detail__body')||main)})),header_text:[...document.querySelectorAll('header')].map(e=>e.innerText),copyright_text:[...document.querySelectorAll('.copyright-bar')].map(e=>e.innerText),footer_text:[...document.querySelectorAll('footer')].map(e=>e.innerText)};
   }''')
   info.update(url=url,final_url=page.url,retrieved_at=datetime.now(timezone.utc).isoformat(),http_status=response.status,viewport={'width':1440,'height':1000},failed_requests=failed)
   (folder/'source-layout.json').write_text(json.dumps(info,indent=2,ensure_ascii=False)+'\n')
   summaries.append({'url':url,'status':'captured','evidence_path':str(folder.relative_to(ROOT)),'failed_resource_count':len(failed)})
   page.set_viewport_size({'width':390,'height':844});page.screenshot(path=str(folder/'source-mobile.png'),full_page=True)
   print(url,'captured','failed resources',len(failed),flush=True)
  except Exception as e:
   summaries.append({'url':url,'status':'failed','reason':str(e)});print(url,'failed',str(e)[:250],flush=True)
  finally:page.close()
 browser.close()
path=ROOT/'reports/browser/index.json';previous=json.loads(path.read_text()) if path.exists() else []
merged={r['url']:r for r in previous};merged.update({r['url']:r for r in summaries});path.write_text(json.dumps(list(merged.values()),indent=2)+'\n')
if any(r['status']=='failed' for r in summaries):raise SystemExit(1)
