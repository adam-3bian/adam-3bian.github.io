"""Exercise the checked-in website using only Python's static HTTP server.

Install requirements-qa.txt to run the browser test. The website itself needs
neither Python nor npm on a static host. Optionally set RAILWAY_LEGACY_QA to a
previous QA build to test continuing an existing save on the same origin.
"""
import asyncio,hashlib,json,os,shutil,tempfile,threading,time,traceback
from functools import partial
from http.server import SimpleHTTPRequestHandler,ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlsplit
from playwright.async_api import async_playwright

ROOT=Path.cwd();SITE=ROOT/'site';WORK=ROOT/'work';WORK.mkdir(exist_ok=True)
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
report={'method':'Production files copied to plain Python static HTTP servers; headed Chromium WebGPU. No Vite, Node or npm server. Network access outside the two local origins is blocked.',
 'sourceHashes':{str(p):sha(p) for p in [Path('app.html'),Path('index.html'),Path('vite.config.ts'),Path('package.json'),Path('src/main.ts'),Path('src/render/renderer.ts'),Path('src/core/resource-url.ts'),Path('src/style.css'),Path('scripts/world-version.ts'),Path('scripts/world-version-baseline.json'),Path('scripts/site-manifest.mjs'),Path(__file__)]},
 'siteHashes':{str(p.relative_to(ROOT)):sha(p) for p in SITE.rglob('*') if p.is_file()},'checks':{},'scenarios':{},'errors':[],'externalRequests':[]}

class QuietHandler(SimpleHTTPRequestHandler):
 def log_message(self,*_args):pass

def start_server(directory):
 server=ThreadingHTTPServer(('127.0.0.1',0),partial(QuietHandler,directory=str(directory)))
 thread=threading.Thread(target=server.serve_forever,daemon=True);thread.start()
 return server,f'http://127.0.0.1:{server.server_port}'

async def ready(page,qa=False):
 await page.wait_for_function('document.getElementById("begin") && (!document.getElementById("begin").disabled || !document.getElementById("error").hidden)',timeout=180000)
 if await page.locator('#error').is_visible():raise RuntimeError(await page.locator('#error-text').inner_text())
 if qa and not await page.evaluate('typeof window.__railway !== "undefined"'):raise RuntimeError('Legacy QA fixture API is missing')

async def select_light(page):
 await page.click('#settings-open');await page.select_option('#quality','low');await page.click('[data-close="settings"]')

async def saved_journey(page):
 return await page.evaluate('''async()=>{const db=await new Promise((resolve,reject)=>{const r=indexedDB.open('snow-hill-lines',1);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)});const saved=await new Promise((resolve,reject)=>{const r=db.transaction('journeys','readonly').objectStore('journeys').get('active');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)});db.close();return saved;}''')

async def main():
 source=ROOT/'public/data';packaged=SITE/'data'
 originals={str(p.relative_to(source)):sha(p) for p in source.rglob('*') if p.is_file()}
 copies={str(p.relative_to(packaged)):sha(p) for p in packaged.rglob('*') if p.is_file()}
 report['checks']['packagedDataMatchesSource']=originals==copies
 report['checks']['rootEntryMatchesSite']=Path('index.html').read_text()==(SITE/'index.html').read_text().replace('<head>','<head>\n    <base href="./site/">')
 report['checks']['packagedDataFiles']=len(copies)
 manifest=json.loads((SITE/'build-manifest.json').read_text())
 report['checks']['packagedManifestMatches']=manifest['rootIndex']==sha(Path('index.html')) and manifest['siteFiles']=={path:hash for path,hash in report['siteHashes'].items() if path!='site/build-manifest.json'} and all(Path(path).is_file() and sha(Path(path))==hash for path,hash in manifest['inputs'].items())
 route=json.loads((packaged/'route.json').read_text())
 references=[route['terrain']['url'],*[tile['url'] for tile in route['tiles']],'data/adjacent-services.json','data/road-surfaces.json','data/land-surfaces.json']
 report['checks']['allReferencedDataPresent']=all((SITE/path.lstrip('/')).is_file() for path in references)
 baseline=json.loads(Path('scripts/world-version-baseline.json').read_text())
 compiled=next((SITE/'assets').glob('app-*.js')).read_text()
 report['checks']['priorWorldIdentityPreserved']=baseline['legacyWorldHash'] in compiled
 legacy_path=os.environ.get('RAILWAY_LEGACY_QA')
 report['legacyFixture']='previous QA build supplied' if legacy_path else 'not supplied; prior-save browser check skipped'
 with tempfile.TemporaryDirectory(prefix='static-host-',dir=WORK) as temporary:
  root=Path(temporary)/'host';root.mkdir()
  if legacy_path:shutil.copytree(legacy_path,root,dirs_exist_ok=True)
  shutil.copytree(SITE,root/'nested'/'railway')
  (root/'wrapper').mkdir();shutil.copy2('index.html',root/'wrapper'/'index.html');shutil.copytree(SITE,root/'wrapper'/'site')
  server,origin=start_server(root);standalone_server,standalone_origin=start_server(SITE)
  try:
   async with async_playwright() as p:
    args=['--no-sandbox','--enable-unsafe-webgpu','--disable-dev-shm-usage']
    if os.environ.get('RAILWAY_SOFTWARE_GPU')=='1':args+=['--disable-gpu-watchdog','--use-angle=swiftshader','--enable-features=Vulkan','--use-vulkan=swiftshader','--disable-vulkan-surface']
    browser=await p.chromium.launch(executable_path=os.environ.get('RAILWAY_CHROMIUM','/usr/bin/chromium'),headless=False,args=args)
    report['browser']=browser.version;report['launchArgs']=args
    context=await browser.new_context(viewport={'width':1440,'height':900},device_scale_factor=1)
    active={'name':'setup'}
    async def route_request(route):
     url=route.request.url;parsed=urlsplit(url)
     if parsed.hostname=='127.0.0.1' and parsed.port in [server.server_port,standalone_server.server_port]:await route.continue_()
     else:
      if active['name']!='legacy':report['externalRequests'].append({'scenario':active['name'],'url':url})
      await route.abort()
    await context.route('**/*',route_request)

    def observe(page,name):
     state={'requests':[],'httpErrors':[],'consoleErrors':[],'pageErrors':[],'workers':[],'closing':False}
     report['scenarios'][name]=state
     page.on('request',lambda request:state['requests'].append(request.url))
     page.on('response',lambda response:state['httpErrors'].append({'url':response.url,'status':response.status}) if response.status>=400 else None)
     page.on('pageerror',lambda error:state['pageErrors'].append(str(error)) if not state['closing'] else None)
     page.on('console',lambda message:state['consoleErrors'].append(message.text[:1000]) if message.type=='error' and not state['closing'] and name!='legacy' else None)
     page.on('worker',lambda worker:state['workers'].append(worker.url))
     return state

    old=None
    if legacy_path:
     active['name']='legacy';page=await context.new_page();state=observe(page,'legacy')
     print('LEGACY SAVE',flush=True);await page.goto(origin+'/',wait_until='domcontentloaded');await ready(page,qa=True)
     await page.evaluate('__railway.view.setQuality("low")');await page.click('#begin');await page.wait_for_function('!document.getElementById("hud").hidden',timeout=150000)
     old=await page.evaluate('''async()=>{const r=__railway;r.sim.paused=true;r.sim.clock=30000;r.sim.player.s=1000;r.sim.player.speed=0;r.sim.player.controller=-.63;r.sim.aws.brake=true;r.sim.aws.lastSignal='pre-static-save-fixture';if(!await r.save(false))throw Error('Legacy save failed');const s=await r.storage.get();return{worldHash:s.worldHash,s:s.player.s,controller:s.player.controller,brake:s.aws.brake,marker:s.aws.lastSignal,roads:s.roadTraffic.roads.length,cars:s.roadTraffic.cars.length};}''')
     report['checks']['legacySaveWritten']=old['worldHash']==baseline['legacyWorldHash'] and old['brake'] and old['marker']=='pre-static-save-fixture'
     report['legacySave']=old;state['closing']=True;await page.close()

    async def exercise(name,url,prefix,restore=False,drive=False):
     active['name']=name;page=await context.new_page();state=observe(page,name)
     print('STATIC SITE',name,url,flush=True);await page.goto(url,wait_until='domcontentloaded');await ready(page);await select_light(page)
     state['baseURI']=await page.evaluate('document.baseURI');state['webgpuReady']='WEBGPU READY' in await page.locator('#gpu-state').inner_text()
     state['noQAAPI']=await page.evaluate('typeof window.__railway === "undefined"');state['hasNavigatorGPU']=await page.evaluate('!!navigator.gpu')
     if restore:
      await page.locator('#resume-save').wait_for(state='visible',timeout=30000);await page.click('#resume-save')
     else:await page.click('#begin')
     await page.wait_for_function('!document.getElementById("hud").hidden || !document.getElementById("error").hidden',timeout=150000)
     if await page.locator('#error').is_visible():raise RuntimeError(await page.locator('#error-text').inner_text())
     state['hudVisible']=await page.locator('#hud').is_visible();state['canvasPresent']=await page.locator('#viewport canvas').count()==1
     if restore:
      await page.wait_for_function('document.getElementById("controller-state").textContent.includes("Safety brake")',timeout=30000)
      await page.keyboard.press('q');await page.wait_for_function('!document.getElementById("controller-state").textContent.includes("Safety brake")',timeout=30000)
      await page.click('#pause');saved=None
      for _ in range(80):
       saved=await saved_journey(page)
       if saved and not saved['aws']['brake'] and saved['aws']['lastSignal']=='pre-static-save-fixture':break
       await asyncio.sleep(.25)
      if not saved:raise RuntimeError('Continued journey was not saved')
      state['legacyRestore']={'sameWorldHash':saved['worldHash']==old['worldHash'],'sameTrainPosition':abs(saved['player']['s']-old['s'])<.05,'sameController':abs(saved['player']['controller']-old['controller'])<.0001,'acknowledgementSaved':saved['aws']['brake'] is False,'sameAWSMarker':saved['aws']['lastSignal']==old['marker'],'roadsRetained':len(saved['roadTraffic']['roads'])>=old['roads'],'carsRetained':len(saved['roadTraffic']['cars'])>=old['cars']}
     if drive:
      before=await page.locator('#controller-state').inner_text();await page.keyboard.down('a')
      try:await page.wait_for_function('before=>document.getElementById("controller-state").textContent!==before',arg=before,timeout=30000)
      finally:await page.keyboard.up('a')
      state['keyboardPowerChangesController']=await page.locator('#controller-state').inner_text()!=before
     await page.evaluate('document.fonts.ready');await page.screenshot(path=str(WORK/f'static-{name}.png'),timeout=30000)
     paths=[urlsplit(url).path for url in state['requests'] if url.startswith(prefix)]
     state['localDataLoaded']=all(any(path.endswith('/'+item) for path in paths) for item in ['data/route.json','data/terrain.bin','data/road-surfaces.json','data/land-surfaces.json','data/adjacent-services.json']) and any('/data/tiles/' in path for path in paths)
     state['localFontsLoaded']=any(path.endswith('.woff2') for path in paths)
     state['moduleWorkerLoaded']=any(url.startswith(prefix) and 'world.worker-' in url for url in state['workers'])
     state['resourcesWithinSite']=all(request_url.startswith(prefix) or request_url==url for request_url in state['requests'] if request_url.startswith(origin) or request_url.startswith(standalone_origin))
     state['passed']=all(state[k] for k in ['webgpuReady','noQAAPI','hasNavigatorGPU','hudVisible','canvasPresent','localDataLoaded','localFontsLoaded','moduleWorkerLoaded','resourcesWithinSite']) and not state['httpErrors'] and not state['pageErrors'] and not state['consoleErrors']
     if restore:state['passed']=state['passed'] and all(state['legacyRestore'].values())
     if drive:state['passed']=state['passed'] and state['keyboardPowerChangesController']
     state['closing']=True;await page.close()
     print(name,'PASS' if state['passed'] else 'FAIL',flush=True)

    await exercise('nested',origin+'/nested/railway/',origin+'/nested/railway/',restore=old is not None)
    await exercise('repository-root',origin+'/wrapper/',origin+'/wrapper/site/')
    await exercise('standalone-root',standalone_origin+'/',standalone_origin+'/',drive=True)
    await context.close()

    unsupported=await browser.new_context(viewport={'width':1000,'height':700});await unsupported.add_init_script('Object.defineProperty(Navigator.prototype,"gpu",{get:()=>undefined,configurable:true})')
    page=await unsupported.new_page();await page.goto(standalone_origin+'/',wait_until='domcontentloaded');await page.wait_for_function('document.getElementById("error") && !document.getElementById("error").hidden',timeout=30000)
    report['checks']['unsupportedDeviceMessage']='WebGPU' in await page.locator('#error-text').inner_text();await unsupported.close();await browser.close()
  except Exception:report['errors'].append(traceback.format_exc());print(report['errors'][-1],flush=True)
  finally:server.shutdown();standalone_server.shutdown();server.server_close();standalone_server.server_close()
 report['generatedAt']=time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime())
 report['passed']=not report['errors'] and not report['externalRequests'] and all(report['checks'].get(k) is True for k in ['packagedDataMatchesSource','rootEntryMatchesSite','packagedManifestMatches','allReferencedDataPresent','priorWorldIdentityPreserved','unsupportedDeviceMessage']) and all(report['scenarios'].get(k,{}).get('passed') is True for k in ['nested','repository-root','standalone-root']) and (not legacy_path or report['checks'].get('legacySaveWritten') is True)
 Path('docs/reports/static-site.json').write_text(json.dumps(report,indent=2)+'\n');print('STATIC SITE RESULT',report['passed'],flush=True)
 if not report['passed']:raise SystemExit(1)
asyncio.run(main())
