import asyncio,hashlib,json,time
from pathlib import Path
from playwright.async_api import async_playwright

async def main():
 result={'adapter':'headless Chromium SwiftShader software WebGL2; not hardware performance evidence','checks':{},'errors':[], 'sourceHashes':{str(f):hashlib.sha256(f.read_bytes()).hexdigest() for f in [Path('scripts/traffic-browser-qa.py'),Path('src/core/simulation.js'),Path('src/world/traffic.js'),Path('src/world/surfaces.js'),Path('src/render/renderer.js'),Path('src/world/world.worker.js'),Path('src/main.js')]}, 'qaAssetHashes':{str(f):hashlib.sha256(f.read_bytes()).hexdigest() for f in Path('work/qa-dist/assets').glob('*') if f.is_file()}, 'productionManifestSHA256':hashlib.sha256(Path('site/build-manifest.json').read_bytes()).hexdigest()}
 async with async_playwright() as p:
  browser=await p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage','--disable-gpu-watchdog','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
  result['browser']=browser.version
  page=await browser.new_page(viewport={'width':800,'height':600})
  page.on('pageerror',lambda e:result['errors'].append(str(e)))
  try:
   await page.goto('http://127.0.0.1:4174/',wait_until='domcontentloaded')
   await page.wait_for_function('window.__railway && !document.getElementById("begin").disabled || !document.getElementById("error").hidden',timeout=180000)
   if await page.locator('#error').is_visible():raise RuntimeError(await page.locator('#error-text').inner_text())
   result['checks']['ready']=await page.evaluate('''()=>({stats:__railway.stats(),roads:__railway.sim.roadTraffic.roads.size,cars:__railway.sim.roadTraffic.cars.size})''');print('READY',result['checks']['ready'],flush=True)
   result['checks']['workerBeforeCrash']=await page.evaluate('''()=>{const r=__railway;r.sim.paused=true;window.oldWorker=r.view.worker;window.beforeRecovery={tiles:r.view.tileCount,state:JSON.stringify(r.sim.roadTraffic.snapshotState())};r.view.worker.dispatchEvent(new ErrorEvent('error',{message:'QA injected worker crash'}));return {tiles:window.beforeRecovery.tiles,replaced:r.view.worker!==window.oldWorker};}''')
   await page.wait_for_function('window.__railway.view.worker!==window.oldWorker && window.__railway.view.ready && window.__railway.view.tileCount>window.beforeRecovery.tiles',timeout=180000)
   result['checks']['workerRecovered']=await page.evaluate('''()=>({tiles:__railway.view.tileCount,trafficUnchanged:JSON.stringify(__railway.sim.roadTraffic.snapshotState())===window.beforeRecovery.state})''');print('WORKER RECOVERED',result['checks']['workerRecovered'],flush=True)
   await page.click('#begin');await page.wait_for_function('!document.getElementById("hud").hidden',timeout=180000)
   result['checks']['noRenderTrafficAdvance']=await page.evaluate('''()=>{const r=__railway;r.sim.paused=true;const cars=[...r.sim.roadTraffic.cars.values()];const before=new Map(cars.map(c=>[c.id,{road:c.road,s:c.s}]));r.advance(2,true);let changed=0;for(const c of cars){const b=before.get(c.id);if(c.road!==b.road||Math.abs(c.s-b.s)>.01)changed++;}return {changed,roads:r.sim.roadTraffic.roads.size,cars:cars.length};}''');print('ADVANCE',result['checks']['noRenderTrafficAdvance'],flush=True)
   result['checks']['saved']=await page.evaluate('''async()=>{const r=__railway;if(!await r.save(false))throw Error('save failed');const s=await r.storage.get();return {worldHash:s.worldHash,cars:s.roadTraffic.cars.length,version:s.roadTraffic.version,staticRoadsIncluded:'roads' in s.roadTraffic,clock:s.clock,first:s.roadTraffic.cars[0]};}''')
   await page.reload(wait_until='domcontentloaded');await page.wait_for_function('window.__railway && !document.getElementById("begin").disabled',timeout=180000);await page.locator('#resume-save').wait_for(state='visible',timeout=30000)
   await page.click('#resume-save');await page.wait_for_function('!document.getElementById("hud").hidden',timeout=180000);await page.evaluate('__railway.sim.paused=true')
   result['checks']['resumed']=await page.evaluate('''()=>({cars:__railway.sim.roadTraffic.cars.size,clock:__railway.sim.clock,first:[...__railway.sim.roadTraffic.cars.values()][0]})''');print('RESUMED',result['checks']['resumed']['cars'],flush=True)
   result['checks']['oldSaveRejection']=await page.evaluate('''()=>{const s=structuredClone(__railway.sim.snapshot());s.worldHash='old-world';try{__railway.sim.restore(s);return 'accepted';}catch(e){return e.message;}}''')
   await page.evaluate('__railway.render();__railway.view.finishFrame()');await page.screenshot(path='work/current-browser-front.png',timeout=120000)
   c=result['checks'];assert c['workerBeforeCrash']['replaced'] and c['workerRecovered']['trafficUnchanged'];assert c['ready']['stats']['backend']=='WebGL2';assert c['ready']['roads']>5000 and c['ready']['cars']>0;assert c['noRenderTrafficAdvance']['changed']>0;assert c['saved']['version']==2 and not c['saved']['staticRoadsIncluded'];assert c['resumed']['cars']==c['saved']['cars'];assert abs(c['resumed']['clock']-c['saved']['clock'])<1;assert 'another route version' in c['oldSaveRejection'];assert not result['errors']
   result['passed']=True
  except Exception as e:
   result['passed']=False;result['errors'].append(str(e));print('ERROR',repr(e),flush=True)
  await browser.close()
 Path('docs/reports/traffic-browser.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result,indent=2),flush=True)
 if not result['passed']:raise SystemExit(1)
asyncio.run(main())
