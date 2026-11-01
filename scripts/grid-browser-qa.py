"""Fixed front-view fixtures and complete world save/reload. No public deployment."""
import asyncio,json,hashlib,time
from pathlib import Path
from playwright.async_api import async_playwright
CAP=Path('docs/captures/grid-world');CAP.mkdir(parents=True,exist_ok=True)
REPORT=Path('docs/reports/grid-world-browser.json')
async def main():
 report={'scope':'Headless Chromium/SwiftShader front views; source review still required for exact appearance and inferred levels','checks':{},'captures':[],'errors':[]}
 def persist():REPORT.write_text(json.dumps(report,indent=2)+'\n')
 async with async_playwright() as p:
  b=await p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage','--disable-gpu-watchdog','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
  page=await b.new_page(viewport={'width':960,'height':600});page.set_default_timeout(180000);page.on('pageerror',lambda e:report['errors'].append(str(e)))
  try:
   await page.goto('http://127.0.0.1:4175/',wait_until='domcontentloaded')
   await page.wait_for_function('window.__railway && !document.getElementById("begin").disabled || !document.getElementById("error").hidden',timeout=180000)
   if await page.locator('#error').is_visible():raise RuntimeError(await page.locator('#error-text').inner_text())
   await page.evaluate('__railway.stopAnimation();__railway.sim.paused=true;__railway.view.setQuality("low")')
   report['checks']['noSVRJourney']=await page.evaluate('!document.getElementById("railway-line") && !__railway.route.stations.some(s=>s.id==="BRG")')
   for sid,direction in [('KID',1),('KID',-1),('SGB',1),('SGB',-1),('THW',1),('JEQ',1),('BSW',1),('BMO',1),('BMO',-1),('TYS',1),('SBJ',1)]:
    print('CAPTURE',sid,direction,flush=True)
    await page.evaluate('''({sid,direction})=>{const r=__railway;r.startAt(sid,direction);const st=r.route.stations.find(s=>s.id===sid);r.sim.player.s=st.s-direction*60;r.sim.paused=true;document.getElementById('hud').hidden=true;document.getElementById('pause-panel').hidden=true;}''',{'sid':sid,'direction':direction})
    await page.evaluate('__railway.view.preparePosition()')
    await page.wait_for_function('__railway.view.requested.size===0',timeout=240000)
    await page.evaluate('__railway.view.firstFrame=true;__railway.render();__railway.view.finishFrame()')
    path=CAP/f'{sid.lower()}-{direction}.png';await page.screenshot(path=str(path))
    state=await page.evaluate('({camera:__railway.view.camera.position.toArray(),s:__railway.sim.player.s,stats:__railway.stats(),worldHash:__railway.route.data.worldHash,revision:__railway.world.document.revision})')
    report['captures'].append({'station':sid,'direction':direction,'path':str(path),'sha256':hashlib.sha256(path.read_bytes()).hexdigest(),'state':state});persist()
    if direction==1 and sid in ['KID','SGB','THW','JEQ','BMO','TYS']:
     # Diagnostic context only: this does not add or change a game camera mode.
     state=await page.evaluate('''sid=>{const r=__railway,st=r.route.stations.find(s=>s.id===sid),q=r.route.sample(st.s-130,150),target=r.route.sample(st.s,-20),v=r.view;v.camera.position.set(q.position[0],q.position[1]+95,q.position[2]);v.camera.up.set(0,1,0);v.camera.lookAt(...target.position);v.ambient.intensity=2.7;v.renderer.toneMappingExposure=1.1;v.renderer.render(v.scene,v.camera);v.finishFrame();return {camera:v.camera.position.toArray(),target:target.position,worldHash:r.route.data.worldHash,revision:r.world.document.revision};}''',sid)
     path=CAP/f'{sid.lower()}-context.png';await page.screenshot(path=str(path))
     report['captures'].append({'station':sid,'mode':'comparison context','path':str(path),'sha256':hashlib.sha256(path.read_bytes()).hexdigest(),'state':state});persist()
   print('SAVE WORLD',flush=True)
   await page.evaluate('__railway.startAt("KID",1);__railway.sim.paused=true')
   assert await page.evaluate('__railway.save(false)')
   before=await page.evaluate('''async()=>{const r=__railway,w=await r.storage.getWorld(r.route.data.worldHash);return {s:r.sim.player.s,revision:w.document.revision,tileCount:Object.keys(w.tiles).length,terrainBytes:w.terrain.byteLength,expected:r.world.document.tiles.length};}''')
   assert before['tileCount']==before['expected']
   # Block every world-data request: only the saved authoritative document,
   # terrain and complete tile set may reconstruct the reloaded scene.
   await page.route('**/data/**',lambda route:route.abort())
   await page.reload(wait_until='domcontentloaded')
   await page.wait_for_function('window.__railway && !document.getElementById("begin").disabled',timeout=180000)
   await page.evaluate('document.getElementById("resume-save").click()')
   await page.wait_for_function('document.getElementById("menu").hidden')
   await page.evaluate('__railway.stopAnimation();__railway.sim.paused=true;__railway.render();__railway.view.finishFrame()')
   after=await page.evaluate('({s:__railway.sim.player.s,revision:__railway.world.document.revision,stats:__railway.stats()})')
   assert before['revision']==after['revision'] and abs(before['s']-after['s'])<.01
   report['checks']['completeWorldOfflineReload']={'before':before,'after':after}
   report['checks']['webglErrors']=await page.evaluate('__railway.view.renderer.getContext().getError()');assert report['checks']['webglErrors']==0
   print('OFFLINE RELOAD PASSED',flush=True)
  except Exception as e:report['errors'].append(str(e));print('ERROR',str(e),flush=True)
  persist();await b.close()
 if report['errors'] or not report['checks'].get('completeWorldOfflineReload'):raise SystemExit(1)
asyncio.run(main())
