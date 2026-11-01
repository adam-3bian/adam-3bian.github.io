import asyncio,json,time,os,hashlib
from pathlib import Path
from playwright.async_api import async_playwright
# Run after npm run build:qa and serving work/qa-dist on localhost:4174.
# Linux software-GPU reproducibility: DISPLAY=:99 RAILWAY_SOFTWARE_GPU=1 python scripts/browser-qa.py
ROOT=Path('.')
REPORT=ROOT/'docs/reports/webgl-browser.json'
CAP=ROOT/'docs/captures/webgl'
CAP.mkdir(parents=True,exist_ok=True)
async def main():
 report={'browser':'Recorded below by Playwright','adapter':'SwiftShader software WebGL 2; not RTX 3060 performance evidence' if os.environ.get('RAILWAY_SOFTWARE_GPU')=='1' else 'WebGL 2; this script does not establish RTX 3060 performance acceptance','viewport':[1440,900],'captures':[],'checks':{},'buildHashes':{str(f):hashlib.sha256(f.read_bytes()).hexdigest() for f in Path('work/qa-dist/assets').glob('*')},'servedDataHashes':{str(f):hashlib.sha256(f.read_bytes()).hexdigest() for f in Path('work/qa-dist/data').rglob('*') if f.is_file()},'sourceHashes':{str(f):hashlib.sha256(f.read_bytes()).hexdigest() for f in Path('src').rglob('*') if f.is_file()},'errors':[],'consoleErrors':[],'expectedConsoleErrors':[],'startedUTC':time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime())}
 def persist():REPORT.write_text(json.dumps(report,indent=2)+'\n')
 async with async_playwright() as p:
  launch_args=['--disable-dev-shm-usage']
  if os.environ.get('RAILWAY_SOFTWARE_GPU')=='1':launch_args+=['--no-sandbox','--disable-gpu-watchdog','--use-angle=swiftshader','--enable-unsafe-swiftshader']
  browser=await p.chromium.launch(executable_path=os.environ.get('RAILWAY_CHROMIUM','/usr/bin/chromium'),headless=False,args=launch_args)
  report['browser']=browser.version;report['launchArgs']=launch_args
  page=await browser.new_page(viewport={'width':1440,'height':900},device_scale_factor=1)
  await page.add_init_script('Object.defineProperty(Navigator.prototype,"gpu",{get:()=>undefined,configurable:true})')
  page.on('pageerror',lambda e:(report['errors'].append(str(e)),print('PAGEERROR',str(e),flush=True)))
  page.on('console',lambda m:(report['expectedConsoleErrors'] if report.get('contextLossInjection') and 'Graphics context lost' in m.text else report['consoleErrors']).append(m.text[:1000]) if m.type=='error' else None)
  try:
   await page.goto(os.environ.get('RAILWAY_BASE_URL','http://localhost:4174/'),wait_until='domcontentloaded')
   await page.wait_for_function('window.__railway && !document.getElementById("begin").disabled || !document.getElementById("error").hidden',timeout=120000)
   if await page.locator('#error').is_visible():raise RuntimeError(await page.locator('#error-text').inner_text())
   report['checks']['nativeWebGL']=await page.evaluate('__railway.stats()');print('READY',report['checks']['nativeWebGL'],flush=True)
   await page.screenshot(path=str(CAP/'journey-menu.png'),timeout=30000)
   await page.click('#begin');await page.wait_for_function('!document.getElementById("hud").hidden',timeout=120000)
   await page.evaluate('__railway.sim.paused=true')
   report['checks']['framePixels']=await page.evaluate('''()=>{const r=__railway;r.render();const gl=r.view.renderer.getContext(),w=gl.drawingBufferWidth,h=gl.drawingBufferHeight,pixels=[];gl.finish();for(const [x,y] of [[.2,.2],[.5,.2],[.8,.2],[.2,.5],[.5,.5],[.8,.5],[.2,.8],[.5,.8],[.8,.8]]){const p=new Uint8Array(4);gl.readPixels(Math.floor((w-1)*x),Math.floor((h-1)*y),1,1,gl.RGBA,gl.UNSIGNED_BYTE,p);pixels.push([...p]);}return{width:w,height:h,pixels,uniqueColors:new Set(pixels.map(p=>p.slice(0,3).join(','))).size,glError:gl.getError(),drawCalls:r.stats().drawCalls,noWebGPU:!navigator.gpu};}''')
   # DOM keyboard events go through production handlers; advance only the fixed clock for repeatability on a slow software GPU.
   await page.evaluate('__railway.sim.paused=false');await page.keyboard.down('a');await page.evaluate('__railway.advance(7,true)');await page.keyboard.up('a');await page.evaluate('__railway.sim.paused=true')
   report['checks']['A']=await page.evaluate('({controller:__railway.sim.player.controller,speed:__railway.sim.player.speed,input:__railway.input.a})')
   await page.evaluate('__railway.sim.paused=false');await page.keyboard.down('d');await page.evaluate('__railway.advance(10,true)');await page.keyboard.up('d');await page.evaluate('__railway.sim.paused=true')
   report['checks']['D']=await page.evaluate('({controller:__railway.sim.player.controller,speed:__railway.sim.player.speed,input:__railway.input.d})')
   acknowledgements=await page.evaluate('__railway.sim.aws.acknowledged')
   await page.evaluate('__railway.sim.paused=false;__railway.sim.aws.pending=true;__railway.sim.aws.deadline=__railway.sim.clock+30');await page.keyboard.press('q');report['checks']['Q']=await page.evaluate('count=>!__railway.sim.aws.pending && __railway.sim.aws.acknowledged===count+1',acknowledgements);await page.keyboard.down('Space');report['checks']['SpaceHeld']=await page.evaluate('__railway.input.horn');await page.keyboard.up('Space');report['checks']['SpaceReleased']=await page.evaluate('!__railway.input.horn')
   before=await page.evaluate('JSON.stringify(__railway.sim.player)');await page.keyboard.press('t');after=await page.evaluate('JSON.stringify(__railway.sim.player)');report['checks']['TUnassigned']=before==after
   await page.evaluate('window.dispatchEvent(new Event("blur"))');report['checks']['focusLossPause']=await page.evaluate('__railway.sim.paused && !__railway.input.a && !__railway.input.d && !__railway.input.horn')
   report['checks']['saveStored']=await page.evaluate('async()=>await __railway.save(false) && (await __railway.storage.get())?.version===2')
   report['checks']['largeSave']=await page.evaluate('''async()=>{const original=await __railway.storage.get();const fixture=structuredClone(original);fixture.roadTraffic={quotaProbe:'x'.repeat(6*1024*1024)};try{await __railway.storage.put(fixture);const read=await __railway.storage.get();return read.roadTraffic.quotaProbe.length===6*1024*1024&&read.player.s===original.player.s;}finally{await __railway.storage.put(original);}}''')
   await page.evaluate('__railway.sim.start(1,0);__railway.sim.paused=false')
   before=await page.evaluate('__railway.sim.interval(__railway.sim.player)');await page.keyboard.press('s');after=await page.evaluate('__railway.sim.interval(__railway.sim.player)');report['checks']['SReverse']={'direction':await page.evaluate('__railway.sim.player.direction'),'samePhysicalInterval':max(abs(before[i]-after[i]) for i in range(2))<.01};await page.keyboard.press('w');report['checks']['WForward']=await page.evaluate('__railway.sim.player.direction===1');await page.evaluate('__railway.sim.paused=true')
   await page.evaluate('__railway.view.setQuality("low");document.getElementById("pause-panel").hidden=true')
   stations=await page.evaluate('__railway.route.stations.map(s=>s.id)')
   if os.environ.get('RAILWAY_STATIONS'):stations=[sid for sid in stations if sid in os.environ['RAILWAY_STATIONS'].split(',')]
   report['stationCoverage']=stations;report['captureScope']='all22stations bothdirections' if len(stations)==22 else 'targeted regression subset'
   for direction in [1,-1]:
    for sid in stations if direction==1 else reversed(stations):
     print('STATION',sid,direction,flush=True)
     await page.evaluate('({sid,direction})=>{__railway.startAt(sid,direction);__railway.sim.paused=true;document.getElementById("pause-panel").hidden=true}',{'sid':sid,'direction':direction})
     await page.evaluate('__railway.view.preparePosition()')
     await page.wait_for_timeout(300)
     await page.evaluate('__railway.render();__railway.view.finishFrame()')
     file=f'{sid.lower()}-{"towards-dorridge" if direction==1 else "towards-kidderminster"}.png'
     await page.screenshot(path=str(CAP/file),timeout=30000)
     report['captures'].append({'station':sid,'direction':direction,'file':str(CAP/file),'quality':'Light (software GPU)','position':await page.evaluate('__railway.route.lanePose(__railway.sim.player.s,__railway.sim.player.lane).position'),'stats':await page.evaluate('__railway.stats()')})
     persist()
   # Actual UI save/reload/continue at a tunnel fixture, retaining a safety brake.
   await page.evaluate('''()=>{const r=__railway, t=r.route.data.tunnels[0];r.startAt('OHL',-1);r.sim.player.nextStop=r.route.stations.findIndex(s=>s.id==='OHL');r.sim.player.s=r.route.sourceS((t.start+t.end)/2);r.sim.player.speed=0;r.sim.player.controller=-1;r.sim.tpws={active:true,reason:'QA saved brake fixture',stoppedAt:r.sim.clock-6,ossEntries:{},tssEntries:{}};r.sim.paused=true;return r.save(false);}''')
   saved=await page.evaluate('__railway.storage.get()')
   await page.reload(wait_until='domcontentloaded');await page.wait_for_function('window.__railway && !document.getElementById("begin").disabled',timeout=120000)
   await page.click('#resume-save');await page.wait_for_function('!document.getElementById("hud").hidden',timeout=120000);await page.evaluate('__railway.sim.paused=true;__railway.view.setQuality("low")')
   report['checks']['UIReloadContinue']={'samePosition':abs(await page.evaluate('__railway.sim.player.s')-saved['player']['s'])<.01,'TPWSretained':await page.evaluate('__railway.sim.tpws.active && __railway.sim.tpws.reason==="QA saved brake fixture"'),'trafficRestored':await page.evaluate('__railway.view.roadTraffic.cars.size')>0}
   await page.evaluate('__railway.render();__railway.view.finishFrame()');await page.screenshot(path=str(CAP/'old-hill-tunnel-front.png'),timeout=30000)
   await page.set_viewport_size({'width':1920,'height':1080});await page.evaluate('__railway.view.renderer.setPixelRatio(1);__railway.view.renderer.setSize(1920,1080);document.getElementById("hud").hidden=true')
   # Front-view switch settings from the same leading-cab fixture, not a free camera.
   await page.evaluate('''()=>{const r=__railway,d=r.sim.trackwork.switches.find(s=>s.lane===4.2&&s.direction===1);r.sim.player.s=r.route.travel(d.s,-30,d.lane);r.sim.player.lane=d.lane;r.sim.player.direction=1;r.sim.tpws.active=false;r.sim.paused=true;r.sim.points.find(p=>p.id===d.id).blend=0;r.sim.points.find(p=>p.id===d.id).state='normal';window.qaSwitchId=d.id;}''')
   await page.evaluate('__railway.view.preparePosition()');await page.evaluate('__railway.render();__railway.view.finishFrame()');await page.screenshot(path=str(CAP/'point-normal-front.png'),timeout=30000)
   await page.evaluate('const p=__railway.sim.points.find(p=>p.id===window.qaSwitchId);p.blend=1;p.state="reverse";p.target="reverse";__railway.render();__railway.view.finishFrame()');await page.screenshot(path=str(CAP/'point-reverse-front.png'),timeout=30000)
   report['checks']['pointCaptures']={'id':await page.evaluate('window.qaSwitchId'),'distanceBeforeToeMetres':30,'viewport':[1920,1080],'pixelRatio':1,'manualReadabilityReview':'pending','fixture':'Same production front camera, stationary; direct proved states are QA fixtures, not granted movement authorities.'}
   await page.set_viewport_size({'width':390,'height':844});await page.evaluate('document.getElementById("menu").hidden=false;document.getElementById("hud").hidden=true')
   await page.screenshot(path=str(CAP/'mobile-journey-menu.png'),timeout=30000);report['checks']['mobileOverflow']=await page.evaluate('document.documentElement.scrollWidth>innerWidth')
   # Recovery: trigger the browser's real WebGL context-loss event.
   report['contextLossInjection']=True
   await page.evaluate('''async()=>{__railway.sim.paused=false;await __railway.save(false);const ext=__railway.view.renderer.getContext().getExtension('WEBGL_lose_context');if(!ext)throw Error('WEBGL_lose_context is unavailable');ext.loseContext();}''')
   await page.wait_for_function('!document.getElementById("error").hidden',timeout=15000)
   report['checks']['contextLoss']={'paused':await page.evaluate('__railway.sim.paused'),'message':await page.locator('#error-text').inner_text(),'savePresent':await page.evaluate('__railway.storage.get().then(s=>!!s)')}
  except Exception as e:
   print('FAILED',str(e),flush=True);report['errors'].append(str(e))
   try:await page.screenshot(path='test-results/browser-qa-failure.png',timeout=15000)
   except:pass
  c=report['checks'];report['assertions']={'nativeBackend':c.get('nativeWebGL',{}).get('backend')=='WebGL2','renderedFrame':c.get('framePixels',{}).get('uniqueColors',0)>=2 and c.get('framePixels',{}).get('glError')==0 and c.get('framePixels',{}).get('drawCalls',0)>0 and c.get('framePixels',{}).get('noWebGPU') is True,'controllerA':c.get('A',{}).get('controller',0)>.99,'controllerD':c.get('D',{}).get('controller',0)<-.99,'AWS':c.get('Q') is True,'hornPressRelease':c.get('SpaceHeld') is True and c.get('SpaceReleased') is True,'TUnassigned':c.get('TUnassigned') is True,'focusLoss':c.get('focusLossPause') is True,'reversePhysicalConsist':c.get('SReverse',{}).get('direction')==-1 and c.get('SReverse',{}).get('samePhysicalInterval') is True,'forward':c.get('WForward') is True,'saveStored':c.get('saveStored') is True,'largeSave':c.get('largeSave') is True,'saveReload':all(c.get('UIReloadContinue',{}).get(k) is True for k in ['samePosition','TPWSretained','trafficRestored']),'mobileNoOverflow':c.get('mobileOverflow') is False,'contextLossRecovery':c.get('contextLoss',{}).get('paused') is True and c.get('contextLoss',{}).get('savePresent') is True,'requestedStationCaptures':bool(report.get('stationCoverage')) and len(report['captures'])==len(report['stationCoverage'])*2}
  report['finishedUTC']=time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime());persist();await browser.close()
  if report['errors'] or report['consoleErrors'] or not all(report['assertions'].values()):raise SystemExit(1)
asyncio.run(main())
