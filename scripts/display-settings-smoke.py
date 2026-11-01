"""Test the packaged static site and optional previous WebGL site on one origin.

DISPLAY=:99 RAILWAY_SOFTWARE_GPU=1 RAILWAY_PREVIOUS_SITE=work/pre-display-site \
  python scripts/display-settings-smoke.py
Only Python's static server is used to host the game. Playwright is a test dependency.
"""
import asyncio, hashlib, json, os, shutil, tempfile, threading, time, traceback
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlsplit
from playwright.async_api import async_playwright

ROOT=Path.cwd(); WORK=ROOT/'work'; WORK.mkdir(exist_ok=True)
SITE=ROOT/'site'; OLD=os.environ.get('RAILWAY_PREVIOUS_SITE')
sha=lambda p:hashlib.sha256(Path(p).read_bytes()).hexdigest()
report={'method':'Production website on a plain Python static server; browser WebGL 2 with WebGPU unavailable. No Node or npm server. Dimensions measure the actual WebGL drawing buffer, not frame-rate performance.',
 'sourceHashes':{str(p):sha(p) for p in [Path('src/main.js'),Path('src/style.css'),Path('src/render/renderer.js'),Path('app.html'),Path('index.html'),Path('scripts/world-version-baseline.json'),Path(__file__)]},
 'siteHashes':{str(p):sha(p) for p in SITE.rglob('*') if p.is_file()},'checks':{},'dimensions':{},'errors':[],'externalRequests':[]}

class Quiet(SimpleHTTPRequestHandler):
 def log_message(self,*args):pass

async def ready(page):
 await page.wait_for_function('document.getElementById("begin") && (!document.getElementById("begin").disabled || !document.getElementById("error").hidden)',timeout=180000)
 if await page.locator('#error').is_visible():raise RuntimeError(await page.locator('#error-text').inner_text())

async def saved_journey(page):
 return await page.evaluate('''async()=>{const db=await new Promise((ok,fail)=>{const r=indexedDB.open('snow-hill-lines',1);r.onsuccess=()=>ok(r.result);r.onerror=()=>fail(r.error)});const s=await new Promise((ok,fail)=>{const r=db.transaction('journeys','readonly').objectStore('journeys').get('active');r.onsuccess=()=>ok(r.result);r.onerror=()=>fail(r.error)});db.close();return s}''')

async def dimensions(page):
 return await page.evaluate('''()=>{const c=document.querySelector('#viewport canvas'),g=c.getContext('webgl2'),r=c.getBoundingClientRect();return{cssWidth:r.width,cssHeight:r.height,bufferWidth:g.drawingBufferWidth,bufferHeight:g.drawingBufferHeight,version:g.getParameter(g.VERSION),error:g.getError(),noWebGPU:!navigator.gpu}}''')

def matches(d,scale):
 return abs(d['bufferWidth']-int(d['cssWidth']*scale))<=1 and abs(d['bufferHeight']-int(d['cssHeight']*scale))<=1 and d['error']==0 and d['noWebGPU'] and 'WebGL 2' in d['version']

async def main():
 with tempfile.TemporaryDirectory(prefix='display-test-',dir=WORK) as temporary:
  host=Path(temporary);shutil.copytree(SITE,host/'new')
  if OLD:shutil.copytree(OLD,host/'old')
  server=ThreadingHTTPServer(('127.0.0.1',0),partial(Quiet,directory=str(host)))
  threading.Thread(target=server.serve_forever,daemon=True).start();origin=f'http://127.0.0.1:{server.server_port}'
  try:
   async with async_playwright() as p:
    args=['--no-sandbox','--disable-dev-shm-usage']
    if os.environ.get('RAILWAY_SOFTWARE_GPU')=='1':args+=['--disable-gpu-watchdog','--use-angle=swiftshader','--enable-unsafe-swiftshader']
    browser=await p.chromium.launch(executable_path=os.environ.get('RAILWAY_CHROMIUM','/usr/bin/chromium'),headless=False,args=args)
    report['browser']=browser.version;report['launchArgs']=args
    context=await browser.new_context(viewport={'width':800,'height':600},device_scale_factor=1)
    await context.add_init_script('Object.defineProperty(Navigator.prototype,"gpu",{get:()=>undefined,configurable:true})')
    async def intercept(route):
     u=urlsplit(route.request.url)
     if u.hostname=='127.0.0.1' and u.port==server.server_port:await route.continue_()
     else:report['externalRequests'].append(route.request.url);await route.abort()
    await context.route('**/*',intercept)
    page=await context.new_page()
    page.on('pageerror',lambda e:report['errors'].append(str(e)))
    page.on('console',lambda m:report['errors'].append(m.text[:1000]) if m.type=='error' else None)
    old=None
    if OLD:
     print('PREVIOUS SAVE',flush=True);await page.goto(origin+'/old/',wait_until='domcontentloaded');await ready(page)
     await page.click('#settings-open');await page.select_option('#quality','low');await page.click('[data-close="settings"]')
     await page.click('#begin');await page.wait_for_function('!document.getElementById("hud").hidden',timeout=150000)
     await page.click('#pause')
     for _ in range(120):
      old=await saved_journey(page)
      if old:break
      await asyncio.sleep(.25)
     if not old:raise RuntimeError('The previous site did not save its journey')
     report['checks']['previousSaveCreated']=True;report['previousWorldHash']=old['worldHash']
    print('NEW SETTINGS',flush=True);await page.goto(origin+'/new/',wait_until='domcontentloaded');await ready(page)
    report['checks']['simpleMenu']=await page.locator('#menu h1').inner_text()=='Railway demo' and await page.locator('.scene-caption').count()==0
    report['checks']['noProductionQAAPI']=await page.evaluate('typeof window.__railway === "undefined"')
    report['dimensions']['default50']=await dimensions(page);report['checks']['default50']=matches(report['dimensions']['default50'],.5)
    directory=Path('docs/captures/display-settings');directory.mkdir(parents=True,exist_ok=True)
    await page.screenshot(path=str(directory/'menu.png'),timeout=30000)
    await page.click('#settings-open');await page.select_option('#render-scale','1');report['dimensions']['100']=await dimensions(page)
    report['checks']['scale100']=matches(report['dimensions']['100'],1)
    await page.select_option('#quality','low');report['dimensions']['100Light']=await dimensions(page)
    report['checks']['qualityDoesNotChangeResolution']=matches(report['dimensions']['100Light'],1)
    await page.select_option('#render-scale','0.75');report['dimensions']['75']=await dimensions(page);report['checks']['scale75']=matches(report['dimensions']['75'],.75)
    await page.screenshot(path=str(directory/'settings.png'),timeout=30000)
    await page.reload(wait_until='domcontentloaded');await ready(page);await page.click('#settings-open')
    report['dimensions']['afterReload']=await dimensions(page)
    report['checks']['preferencesPersist']=await page.locator('#render-scale').input_value()=='0.75' and await page.locator('#quality').input_value()=='low' and matches(report['dimensions']['afterReload'],.75)
    await page.select_option('#render-scale','0.5');await page.click('[data-close="settings"]')
    if old:
     await page.locator('#resume-save').wait_for(state='visible',timeout=30000);await page.click('#resume-save')
    else:await page.click('#begin')
    await page.wait_for_function('!document.getElementById("hud").hidden || !document.getElementById("error").hidden',timeout=150000)
    if await page.locator('#error').is_visible():raise RuntimeError(await page.locator('#error-text').inner_text())
    await page.click('#pause')
    if old:
     new=None
     for _ in range(120):
      new=await saved_journey(page)
      if new and new['clock']>old['clock']:break
      await asyncio.sleep(.25)
     report['checks']['previousSaveContinued']=bool(new) and new['worldHash']==old['worldHash'] and abs(new['player']['s']-old['player']['s'])<.1 and new['player']['controller']==old['player']['controller']
    await page.click('#settings-paused');await page.select_option('#render-scale','0.75');report['dimensions']['paused75']=await dimensions(page)
    report['checks']['settingsFromPause']=matches(report['dimensions']['paused75'],.75)
    await page.select_option('#render-scale','0.5');await page.set_viewport_size({'width':640,'height':480});report['dimensions']['resized50']=await dimensions(page)
    report['checks']['resizeKeepsScale']=matches(report['dimensions']['resized50'],.5)
    await page.set_viewport_size({'width':390,'height':844});report['checks']['mobileNoHorizontalOverflow']=await page.evaluate('document.documentElement.scrollWidth<=innerWidth')
    await page.click('[data-close="settings"]');await page.click('#continue');report['checks']['resumed']=await page.locator('#hud').is_visible() and not await page.locator('#pause-panel').is_visible()
    await context.close();await browser.close()
  except Exception:report['errors'].append(traceback.format_exc());print(report['errors'][-1],flush=True)
  finally:server.shutdown();server.server_close()
 report['generatedAt']=time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime())
 required=['simpleMenu','noProductionQAAPI','default50','scale100','qualityDoesNotChangeResolution','scale75','preferencesPersist','settingsFromPause','resizeKeepsScale','mobileNoHorizontalOverflow','resumed']
 if OLD:required+=['previousSaveCreated','previousSaveContinued']
 report['passed']=not report['errors'] and not report['externalRequests'] and all(report['checks'].get(k) is True for k in required)
 Path('docs/reports/display-settings-browser.json').write_text(json.dumps(report,indent=2)+'\n');print('DISPLAY SETTINGS RESULT',report['passed'],flush=True)
 if not report['passed']:raise SystemExit(1)
asyncio.run(main())
