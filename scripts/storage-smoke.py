"""Exercise the real persistence module without starting a graphics device.
Run from repository root with npm dependencies, Playwright and the QA static server on :4174.
"""
import asyncio,hashlib,json,os,subprocess,time
from pathlib import Path
from playwright.async_api import async_playwright
fixture=Path('work/qa-dist/__storage-fixture');fixture.mkdir(parents=True,exist_ok=True)
(fixture/'index.html').write_text('<!doctype html><html lang="en"><meta charset="utf-8"><title>Journey storage fixture</title><body>Journey persistence test</body></html>')
subprocess.run(['node_modules/.bin/esbuild','src/core/save.ts','--format=esm','--target=es2022','--outfile='+str(fixture/'save.js')],check=True)
subprocess.run(['node','--import','tsx','--input-type=module','-e',"import {readFileSync,writeFileSync} from 'node:fs';import {RouteGeometry} from './src/core/geometry.ts';import {RailwaySimulation} from './src/core/simulation.ts';const route=new RouteGeometry(JSON.parse(readFileSync('public/data/route.json','utf8'))),sim=new RailwaySimulation(route);sim.player.s=12345;sim.player.controller=-.6;sim.aws.brake=true;sim.crossings[0].state='closing';sim.crossings[0].blend=.4;writeFileSync('work/qa-dist/__storage-fixture/snapshot.json',JSON.stringify(sim.snapshot()));"],check=True)
async def main():
 report={'method':'Real JourneyStore module compiled in isolation; Chromium IndexedDB; graphics device not requested','sourceHash':hashlib.sha256(Path('src/core/save.ts').read_bytes()).hexdigest(),'checks':{},'errors':[]}
 async with async_playwright() as p:
  browser=await p.chromium.launch(executable_path=os.environ.get('RAILWAY_CHROMIUM','/usr/bin/chromium'),headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
  report['browser']=browser.version;page=await browser.new_page()
  try:
   await page.goto(os.environ.get('RAILWAY_BASE_URL','http://localhost:4174')+'/__storage-fixture/')
   report['checks']['write']=await page.evaluate('''async()=>{const {JourneyStore}=await import('./save.js');window.fixtureStore=new JourneyStore('journey-quota-fixture');const s=await (await fetch('./snapshot.json')).json();s.roadTraffic={quotaProbe:'x'.repeat(6*1024*1024)};window.originalFixture=s;let quotaRejected=false;try{localStorage.setItem('quota-probe',s.roadTraffic.quotaProbe)}catch(e){quotaRejected=e.name==='QuotaExceededError'}localStorage.removeItem('quota-probe');await fixtureStore.put(s);const read=await fixtureStore.get();return{indexedDBRoundTrip:JSON.stringify(s)===JSON.stringify(read),payloadBytes:read.roadTraffic.quotaProbe.length,localStorageRejectedSamePayload:quotaRejected};}''')
   await page.reload()
   report['checks']['reload']=await page.evaluate('''async()=>{const {JourneyStore}=await import('./save.js'),store=new JourneyStore('journey-quota-fixture'),s=await store.get();return{payloadRetained:s.roadTraffic.quotaProbe.length===6*1024*1024,positionRetained:s.player.s===12345,controllerRetained:s.player.controller===-.6,brakeRetained:s.aws.brake===true,crossingRetained:s.crossings[0].state==='closing'&&s.crossings[0].blend===.4};}''')
   report['checks']['legacyMigration']=await page.evaluate('''async()=>{const {JourneyStore}=await import('./save.js'),s=await(await fetch('./snapshot.json')).json();localStorage.setItem('fixture-legacy',JSON.stringify(s));const store=new JourneyStore('journey-legacy-fixture','fixture-legacy'),read=await store.get();return JSON.stringify(s)===JSON.stringify(read)&&localStorage.getItem('fixture-legacy')===null;}''')
  except Exception as e:report['errors'].append(str(e))
  await browser.close()
 report['generatedAt']=time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime());Path('docs/reports/storage-browser.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report,indent=2))
 if report['errors'] or not report['checks'].get('write',{}).get('indexedDBRoundTrip') or not all(report['checks'].get('reload',{}).values()) or report['checks'].get('legacyMigration') is not True:raise SystemExit(1)
asyncio.run(main())
