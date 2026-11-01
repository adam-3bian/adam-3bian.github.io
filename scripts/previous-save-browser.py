import asyncio,hashlib,json,os,subprocess
from pathlib import Path
from playwright.async_api import async_playwright

async def read_save(page):
 return await page.evaluate('''async()=>{const db=await new Promise((ok,bad)=>{const r=indexedDB.open('snow-hill-lines',1);r.onsuccess=()=>ok(r.result);r.onerror=()=>bad(r.error)});const s=await new Promise((ok,bad)=>{const r=db.transaction('journeys','readonly').objectStore('journeys').get('active');r.onsuccess=()=>ok(r.result);r.onerror=()=>bad(r.error)});db.close();return s;}''')
async def ready(page):
 await page.wait_for_function('document.getElementById("begin") && (!document.getElementById("begin").disabled || !document.getElementById("error").hidden)',timeout=180000)
 if await page.locator('#error').is_visible():raise RuntimeError(await page.locator('#error-text').inner_text())
async def main():
 previous=subprocess.check_output(['git','rev-parse',os.environ.get('RAILWAY_PREVIOUS_COMMIT','9c5dd1a')],text=True).strip()
 expected=subprocess.check_output(['git','show',f'{previous}:site/build-manifest.json'])
 previous_manifest=Path('work/previous-site/site/build-manifest.json').read_bytes()
 if hashlib.sha256(previous_manifest).digest()!=hashlib.sha256(expected).digest():raise RuntimeError('Extracted previous site does not match the selected commit')
 link=Path('work/migration-root/current');out={'method':'Real previous committed production build creates save; current production build served at same static origin; headless SwiftShader','previousCommit':previous,'previousManifestSHA256':hashlib.sha256(previous_manifest).hexdigest(),'currentManifestSHA256':hashlib.sha256(Path('site/build-manifest.json').read_bytes()).hexdigest(),'scriptSHA256':hashlib.sha256(Path('scripts/previous-save-browser.py').read_bytes()).hexdigest(),'checks':{},'errors':[]}
 link.unlink(missing_ok=True);link.symlink_to('../previous-site/site')
 async with async_playwright() as p:
  browser=await p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage','--disable-gpu-watchdog','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
  out['browser']=browser.version;page=await browser.new_page(viewport={'width':800,'height':600})
  await page.route('**/*',lambda route:route.continue_() if route.request.url.startswith('http://127.0.0.1:4175/') else route.abort())
  page.on('pageerror',lambda e:out['errors'].append(str(e)))
  try:
   await page.goto('http://127.0.0.1:4175/current/?old',wait_until='domcontentloaded');await ready(page)
   await page.click('#settings-open');await page.select_option('#quality','low');await page.click('[data-close="settings"]')
   await page.click('#begin');await page.wait_for_function('!document.getElementById("hud").hidden',timeout=180000)
   await page.click('#save');await page.wait_for_function('document.getElementById("notice").textContent.includes("Journey saved")',timeout=30000)
   old=await read_save(page);assert old and old.get('roadTraffic') and isinstance(old['roadTraffic'].get('cars'),list)
   assert old['roadTraffic'].get('version')==2 or isinstance(old['roadTraffic'].get('roads'),list)
   out['checks']['realPreviousSave']={'worldHash':old['worldHash'],'trafficStateVersion':old['roadTraffic'].get('version',1),'storedRoads':len(old['roadTraffic']['roads']) if 'roads' in old['roadTraffic'] else None,'cars':len(old['roadTraffic']['cars'])};print('PREVIOUS',out['checks']['realPreviousSave'],flush=True)
   link.unlink();link.symlink_to('../../site')
   await page.goto('http://127.0.0.1:4175/current/?current',wait_until='domcontentloaded');await ready(page)
   await page.locator('#resume-save').wait_for(state='visible',timeout=30000);await page.click('#resume-save');await page.wait_for_function('!document.getElementById("error").hidden',timeout=30000)
   text=await page.locator('#error-text').inner_text();saved=await read_save(page)
   out['checks']['rejectedWithMessage']=text;out['checks']['previousSavePreserved']=saved==old
   assert 'another route version' in text and saved==old and not out['errors'];out['passed']=True
  except Exception as e:
   out['errors'].append(repr(e));out['passed']=False;print('ERROR',repr(e),flush=True)
  await browser.close()
 Path('docs/reports/previous-save-browser.json').write_text(json.dumps(out,indent=2)+'\n');print(json.dumps(out,indent=2),flush=True)
 if not out['passed']:raise SystemExit(1)
asyncio.run(main())
