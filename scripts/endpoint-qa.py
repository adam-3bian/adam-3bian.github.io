"""Native front-camera regression for an AI front leaving the dataset before its rear.

Requires the QA build on localhost:4174 and a headed Chromium display.
DISPLAY=:99 RAILWAY_SOFTWARE_GPU=1 python scripts/endpoint-qa.py
"""
import asyncio,hashlib,json,os,time
from pathlib import Path
from playwright.async_api import async_playwright

async def main():
 report={'method':'WebGL 2, production leading-camera poses; paused Class 168 four-car endpoint fixtures. No free camera or movement authority is granted. This checks visibility, not portal geography or a two-hour soak.',
  'sourceHashes':{str(p):hashlib.sha256(p.read_bytes()).hexdigest() for p in Path('src').rglob('*') if p.is_file()},
  'harnessSHA256':hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),
  'buildHashes':{str(p):hashlib.sha256(p.read_bytes()).hexdigest() for p in Path('work/qa-dist/assets').glob('*')},'checks':[],'errors':[],'consoleErrors':[],'expectedConsoleErrors':[]}
 async with async_playwright() as p:
  args=['--no-sandbox','--disable-dev-shm-usage']
  if os.environ.get('RAILWAY_SOFTWARE_GPU')=='1':args+=['--disable-gpu-watchdog','--use-angle=swiftshader','--enable-unsafe-swiftshader']
  browser=await p.chromium.launch(executable_path=os.environ.get('RAILWAY_CHROMIUM','/usr/bin/chromium'),headless=False,args=args)
  report['browser']=browser.version;report['launchArgs']=args
  page=await browser.new_page(viewport={'width':1440,'height':900},device_scale_factor=1)
  await page.add_init_script('Object.defineProperty(Navigator.prototype,"gpu",{get:()=>undefined,configurable:true})')
  page.on('pageerror',lambda e:report['errors'].append(str(e)))
  page.on('console',lambda m:(report['expectedConsoleErrors'] if report.get('contextLossInjection') and 'Graphics context lost' in m.text else report['consoleErrors']).append(m.text[:1000]) if m.type=='error' else None)
  try:
   await page.goto(os.environ.get('RAILWAY_BASE_URL','http://localhost:4174/'),wait_until='domcontentloaded')
   await page.wait_for_function('window.__railway && !document.getElementById("begin").disabled || !document.getElementById("error").hidden',timeout=120000)
   if await page.locator('#error').is_visible():raise RuntimeError(await page.locator('#error-text').inner_text())
   await page.evaluate('__railway.view.setQuality("low")')
   for terminal,direction in [('KID',-1),('DDG',1)]:
    print('ENDPOINT',terminal,flush=True)
    await page.evaluate('''({terminal,direction})=>{
      const r=__railway;r.startAt(terminal,direction);r.sim.paused=true;
      r.sim.player.s=direction===1?r.route.length-120:120;r.sim.player.lane=direction===1?4.2:0;
      for(const train of r.sim.ai)train.portalWaitUntil=r.sim.clock+600;
      const train={...r.sim.ai[0],id:'endpoint-rear-'+terminal,kind:'168',cars:4,length:93.95,s:direction===1?r.route.length+5:-5,lane:r.sim.player.lane,direction,speed:0,portalWaitUntil:undefined};
      r.sim.ai.push(train);window.endpointFixtureId=train.id;document.getElementById('pause-panel').hidden=true;
    }''',{'terminal':terminal,'direction':direction})
    await page.evaluate('__railway.view.preparePosition()');await page.evaluate('__railway.render();__railway.view.finishFrame()')
    check=await page.evaluate('''()=>{
      const r=__railway,t=r.sim.ai.find(t=>t.id===window.endpointFixtureId),model=r.view.scene.children.find(o=>o.userData.id===t.id),interval=r.sim.interval(t);
      return{id:t.id,frontS:t.s,interval,routeLength:r.route.length,frontBeyondDataset:t.s<0||t.s>r.route.length,rearStillInside:t.direction===1?interval[0]<r.route.length:interval[1]>0,visible:model?.visible===true,cars:model?.userData.cars?.length??0,backend:r.stats().backend};
    }''')
    directory=Path('docs/captures/webgl');directory.mkdir(parents=True,exist_ok=True);file=str(directory/f'{terminal.lower()}-endpoint-rear-front.png');await page.screenshot(path=file,timeout=30000);check['capture']=file
    await page.evaluate('''async()=>{const r=__railway,t=r.sim.ai.find(t=>t.id===window.endpointFixtureId);t.s=t.direction===1?r.route.length+t.length+1:-t.length-1;r.render();await r.view.finishFrame();}''')
    check['fullyClearHidden']=await page.evaluate('__railway.view.scene.children.find(o=>o.userData.id===window.endpointFixtureId)?.visible===false')
    await page.evaluate('''async()=>{const r=__railway;r.sim.ai.find(t=>t.id===window.endpointFixtureId).portalWaitUntil=r.sim.clock+600;r.render();await r.view.finishFrame();}''')
    check['waitingPortalHidden']=await page.evaluate('__railway.view.scene.children.find(o=>o.userData.id===window.endpointFixtureId)?.visible===false')
    report['checks'].append(check);print(json.dumps(check),flush=True)
   # No manual save of this marker: recovery must persist the new state itself.
   report['contextLossInjection']=True
   await page.evaluate('''()=>{const r=__railway;r.sim.clock=40000.25;r.sim.player.controller=-.73;r.sim.aws.brake=true;r.sim.aws.lastSignal='endpoint-context-loss-fixture';r.sim.paused=false;const ext=r.view.renderer.getContext().getExtension('WEBGL_lose_context');if(!ext)throw Error('WEBGL_lose_context is unavailable');ext.loseContext();}''')
   await page.wait_for_function('!document.getElementById("error").hidden && /Your paused journey was saved|Saving failed/.test(document.getElementById("error-text").textContent)',timeout=20000)
   report['contextLoss']=await page.evaluate('''async()=>{const r=__railway,s=await r.storage.get();return{paused:r.sim.paused,message:document.getElementById('error-text').textContent,savedClock:s?.clock,newStateSaved:s?.clock>=40000.25&&s.player.controller===-.73&&s.aws.brake===true&&s.aws.lastSignal==='endpoint-context-loss-fixture'};}''')
  except Exception as e:report['errors'].append(str(e))
  await browser.close()
 report['generatedAt']=time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime())
 report['passed']=len(report['checks'])==2 and not report['errors'] and not report['consoleErrors'] and report.get('contextLoss',{}).get('paused') is True and report.get('contextLoss',{}).get('newStateSaved') is True and all(c['frontBeyondDataset'] and c['rearStillInside'] and c['visible'] and c['fullyClearHidden'] and c['waitingPortalHidden'] and c['cars']==4 and c['backend']=='WebGL2' for c in report['checks'])
 Path('docs/reports/webgl-endpoint-browser.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report,indent=2),flush=True)
 if not report['passed']:raise SystemExit(1)
asyncio.run(main())
