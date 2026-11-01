"""Static QA front views and resize checks; pose fixtures are not a continuous drive."""
import asyncio,json,hashlib,time
from pathlib import Path
from playwright.async_api import async_playwright
ROOT=Path('.');CAP=ROOT/'docs/captures/reconstruction';CAP.mkdir(parents=True,exist_ok=True)
async def main():
 report={'scriptSHA256':hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),'scope':'Headless Chromium SwiftShader; front-camera QA fixtures, not hardware performance, exact photographic alignment or a continuous-drive/soak test','sourceHashes':{str(p):hashlib.sha256(p.read_bytes()).hexdigest() for p in Path('src').rglob('*') if p.is_file()},'manifestSHA256':hashlib.sha256(Path('site/build-manifest.json').read_bytes()).hexdigest(),'checks':{},'captures':[],'errors':[]}
 def persist():Path('docs/reports/reconstruction-browser.json').write_text(json.dumps(report,indent=2)+'\n')
 async with async_playwright() as p:
  b=await p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage','--disable-gpu-watchdog','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
  report['browser']=b.version;page=await b.new_page(viewport={'width':640,'height':360});page.set_default_timeout(120000)
  page.on('pageerror',lambda e:report['errors'].append(str(e)))
  try:
   await page.goto('http://127.0.0.1:4174/',wait_until='domcontentloaded')
   await page.wait_for_function('window.__railway && !document.getElementById("begin").disabled || !document.getElementById("error").hidden',timeout=180000)
   if await page.locator('#error').is_visible():raise RuntimeError(await page.locator('#error-text').inner_text())
   report['checks']['noTopbar']=await page.evaluate('!document.querySelector(".topbar") && !document.getElementById("journey-title")')
   await page.evaluate('__railway.sim.paused=true;__railway.view.setQuality("low")')
   sizes=[]
   for w,h in [(800,600),(1280,720),(390,844),(640,360)]:
    await page.set_viewport_size({'width':w,'height':h})
    for scale in [.5,.75,1]:
     await page.evaluate('s=>__railway.view.setRenderScale(s)',scale)
     await page.wait_for_timeout(100)
     state=await page.evaluate('''()=>{const r=__railway,c=document.getElementById('viewport'),g=r.view.renderer.getContext();r.render();return{w:c.clientWidth,h:c.clientHeight,bw:g.drawingBufferWidth,bh:g.drawingBufferHeight,aspect:r.view.camera.aspect,error:g.getError(),lost:g.isContextLost()};}''')
     assert state['bw']==int(state['w']*scale) and state['bh']==int(state['h']*scale) and not state['lost'] and state['error']==0;assert abs(state['aspect']-state['w']/state['h'])<1e-6;sizes.append({**state,'scale':scale})
   # Resize the container independently, including hide/show without a window event.
   for css in ['width:640px;height:360px','width:0;height:0','width:720px;height:400px','']:
    await page.evaluate('s=>document.getElementById("viewport").style.cssText=s',css);await page.wait_for_timeout(150)
    if 'width:0' not in css:
     await page.wait_for_function('''()=>{const c=document.getElementById('viewport'),g=__railway.view.renderer.getContext();return g.drawingBufferWidth===c.clientWidth&&g.drawingBufferHeight===c.clientHeight;}''')
    assert await page.evaluate('!__railway.view.renderer.getContext().isContextLost()')
   report['checks']['resize']=sizes;report['checks']['containerHideShow']=True;persist();print('RESIZE PASSED',flush=True)
   await page.evaluate('__railway.view.setRenderScale(.5)')
   stations=await page.evaluate('__railway.route.stations.map(s=>({id:s.id,s:s.s}))')
   for station in stations:
    for direction in [1,-1]:
     sid=station['id'];print('CAPTURE',sid,direction,flush=True)
     await page.evaluate('''({sid,direction})=>{const r=__railway;r.startAt(sid,direction);const station=r.route.stations.find(s=>s.id===sid);r.sim.player.s=r.route.travel(station.s,-direction*60,r.sim.player.lane);r.sim.paused=true;document.getElementById('hud').hidden=true;document.getElementById('pause-panel').hidden=true;}''',{'sid':sid,'direction':direction})
     await page.evaluate('__railway.view.preparePosition()')
     await page.evaluate('__railway.render();__railway.view.finishFrame()')
     path=CAP/f'{sid.lower()}-{"forward" if direction==1 else "reverse"}.png';await page.screenshot(path=str(path),timeout=120000)
     state=await page.evaluate('''()=>{const r=__railway,p=r.route.lanePose(r.sim.player.s,r.sim.player.lane).position;return{s:r.sim.player.s,lane:r.sim.player.lane,direction:r.sim.player.direction,trackPosition:p,cameraPosition:r.view.camera.position.toArray(),fieldOfView:r.view.camera.fov,worldHash:r.route.data.worldHash,loadedTileIds:[...r.view.loaded.keys()],pendingTileIds:[...r.view.requested],stats:r.stats()};}''')
     report['captures'].append({'station':sid,'direction':direction,'file':str(path),'sha256':hashlib.sha256(path.read_bytes()).hexdigest(),'viewport':[640,360],'renderScale':.5,'quality':'low','state':state,'photoComparison':'unreviewed'});persist()
   report['checks']['allStationViews']=len(report['captures'])==44
  except Exception as e:report['errors'].append(str(e));print('ERROR',str(e),flush=True)
  persist();await b.close()
 if report['errors'] or not report['checks'].get('allStationViews'):raise SystemExit(1)
asyncio.run(main())
