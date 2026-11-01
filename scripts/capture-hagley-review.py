import asyncio,json
from pathlib import Path
from playwright.async_api import async_playwright
async def main():
 async with async_playwright() as p:
  b=await p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-gpu-watchdog','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
  page=await b.new_page(viewport={'width':1280,'height':720})
  await page.goto('http://localhost:4174/',wait_until='domcontentloaded')
  await page.wait_for_function('window.__railway && !document.getElementById("begin").disabled',timeout=180000)
  await page.evaluate('__railway.startAt("HAG",1);__railway.sim.paused=true;__railway.view.setQuality("low");document.getElementById("hud").hidden=true')
  for offset in [-100,-70,-40,10]:
   await page.evaluate('offset=>{const r=__railway;const st=r.route.stations.find(s=>s.id==="HAG");r.sim.player.s=r.route.travel(st.s,offset,r.sim.player.lane);}',offset)
   await page.evaluate('__railway.view.preparePosition()')
   await page.evaluate('__railway.render();__railway.view.finishFrame()')
   await page.screenshot(path=f'work/hagley-approach-{abs(offset)}.png',timeout=90000)
   print('CAPTURE',offset,await page.evaluate('JSON.stringify({s:__railway.sim.player.s,position:__railway.route.lanePose(__railway.sim.player.s,__railway.sim.player.lane).position,stats:__railway.stats()})'),flush=True)
  await b.close()
asyncio.run(main())
