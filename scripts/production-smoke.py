# Ordinary production smoke/unsupported-device fixture. Linux SwiftShader capture; requires a display/Xvfb.
import asyncio,json,hashlib,time,os
from pathlib import Path
from playwright.async_api import async_playwright
async def main():
 report={'method':'Ordinary production build, headed Chromium with SwiftShader; no QA fixture API','buildHashes':{str(p):hashlib.sha256(p.read_bytes()).hexdigest() for p in Path('dist/assets').glob('*')},'checks':{},'errors':[]}
 async with async_playwright() as p:
  browser=await p.chromium.launch(executable_path=os.environ.get('RAILWAY_CHROMIUM','/usr/bin/chromium'),headless=False,args=['--no-sandbox','--disable-gpu-watchdog','--enable-unsafe-webgpu','--use-angle=swiftshader','--enable-features=Vulkan','--use-vulkan=swiftshader','--disable-vulkan-surface','--disable-dev-shm-usage'])
  report['browser']=browser.version
  page=await browser.new_page(viewport={'width':1440,'height':900},device_scale_factor=1)
  page.on('pageerror',lambda e:report['errors'].append(str(e)))
  try:
   await page.goto(os.environ.get('RAILWAY_BASE_URL','http://localhost:4173/'),wait_until='domcontentloaded')
   await page.wait_for_function('!document.getElementById("begin").disabled || !document.getElementById("error").hidden',timeout=120000)
   if await page.locator('#error').is_visible():raise RuntimeError(await page.locator('#error-text').inner_text())
   report['checks']['ready']=True;report['checks']['noQAAPI']=await page.evaluate('typeof window.__railway === "undefined"')
   await page.screenshot(path='docs/captures/production-menu.png',timeout=30000)
   await page.click('#begin');await page.wait_for_function('!document.getElementById("hud").hidden',timeout=120000)
   await page.screenshot(path='docs/captures/production-front.png',timeout=30000)
   report['checks']['frontHUDVisible']=await page.locator('#hud').is_visible();report['checks']['canvasRendered']=await page.locator('#viewport canvas').count()==1
   await page.click('#pause');report['checks']['pauseVisible']=await page.locator('#pause-panel').is_visible()
  except Exception as e:report['errors'].append(str(e))
  await browser.close()
  # Verify the deliberate unsupported-device branch in its own isolated context.
  browser=await p.chromium.launch(executable_path=os.environ.get('RAILWAY_CHROMIUM','/usr/bin/chromium'),headless=False,args=['--no-sandbox','--disable-dev-shm-usage'])
  page=await browser.new_page(viewport={'width':1000,'height':700});await page.add_init_script('Object.defineProperty(Navigator.prototype,"gpu",{get:()=>undefined,configurable:true})')
  try:
   await page.goto(os.environ.get('RAILWAY_BASE_URL','http://localhost:4173/'),wait_until='domcontentloaded');await page.wait_for_function('!document.getElementById("error").hidden',timeout=30000)
   report['checks']['unsupportedMessage']=await page.locator('#error-text').inner_text();report['checks']['unsupportedClear']='WebGPU' in report['checks']['unsupportedMessage'];await page.screenshot(path='docs/captures/webgpu-unavailable.png',timeout=20000)
  except Exception as e:report['errors'].append(str(e))
  await browser.close()
 report['generatedAt']=time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime());Path('docs/reports/production-browser.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report,indent=2))
 if report['errors'] or not all(report['checks'].get(k) for k in ['ready','noQAAPI','frontHUDVisible','canvasRendered','pauseVisible','unsupportedClear']):raise SystemExit(1)
asyncio.run(main())
