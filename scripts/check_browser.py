#!/usr/bin/env python3
"""Exercise the adopted starter theme, graph links, images and responsive menu."""
import json,os,re,threading
from pathlib import Path
from functools import partial
from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
class Quiet(SimpleHTTPRequestHandler):
    def log_message(self,*args):pass
server=ThreadingHTTPServer(('127.0.0.1',0),partial(Quiet,directory=str(ROOT/'_site')))
threading.Thread(target=server.serve_forever,daemon=True).start()
base=f'http://127.0.0.1:{server.server_port}'
paths=['/','/alliance/leadership/members/','/alliance/leadership/governing-board/',
       '/organisations/codasip/','/organisations/pa-consulting/','/organisations/hildebrand/',
       '/organisations/dsit/','/people/robert-watson/','/people/ben-laurie/',
       '/events/cheri-blossoms-conference-2026/','/news/beyond-software-patching/',
       '/news/you-just-missed-the-cheritech25-conference-but-wait-you-can-still-attend-the-virtual-replay/',
       '/papers/it-is-time-to-standardize-principles-and-practices-for-software-memory-safety/',
       '/hardware/','/software/']
folder=ROOT/'reports/browser-theme';folder.mkdir(exist_ok=True)
results=[];normalize=lambda text:re.sub(r'\s+',' ',text).strip()
expected={row['local_route']:json.loads((ROOT/'reports/validation'/__import__('hashlib').sha256(row['url'].encode()).hexdigest()[:16]/'source-signature.json').read_text())['text'] for row in json.loads((ROOT/'reports/capture-index.json').read_text())['records'] if row.get('conversion_status')=='converted'}
expected.update({r['local_route']:r['source_signature']['text'] for r in json.loads((ROOT/'reports/paper-validation.json').read_text())})
try:
    with sync_playwright() as p:
        browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
        for path in paths:
            page=browser.new_page(viewport={'width':1440,'height':1000})
            errors=[];page.on('pageerror',lambda error:errors.append(str(error)))
            response=page.goto(base+path,wait_until='networkidle')
            page.locator('main img[loading=lazy]').evaluate_all("images => images.forEach(image => image.loading='eager')")
            page.wait_for_function("[...document.querySelectorAll('main img')].every(image=>image.complete)")
            body=page.locator('[data-source-body]').inner_text()
            checks={'http_200':response.status==200,'javascript':not errors,
                    'body_text':normalize(body)==normalize(expected[path]) if path in expected else True,
                    'images_decode':page.evaluate("[...document.querySelectorAll('main img')].every(image=>image.naturalWidth>0 && image.naturalHeight>0)"),
                    'poppins_loaded':page.evaluate("[...document.fonts].some(face=>face.family.includes('Poppins') && face.status==='loaded')"),
                    'desktop_overflow':page.evaluate('document.documentElement.scrollWidth<=window.innerWidth')}
            name=path.strip('/').replace('/','--') or 'home'
            if path in ['/','/people/robert-watson/','/organisations/codasip/','/papers/it-is-time-to-standardize-principles-and-practices-for-software-memory-safety/']:
                page.screenshot(path=str(folder/(name+'-desktop.png')),full_page=True)
            page.set_viewport_size({'width':390,'height':844})
            page.wait_for_timeout(100)
            checks['mobile_overflow']=page.evaluate('document.documentElement.scrollWidth<=window.innerWidth')
            hamburger=page.locator('#hamburger');hamburger.click()
            checks['mobile_menu']=hamburger.get_attribute('aria-expanded')=='true'
            page.locator('header .submenu-toggle').first.click()
            checks['mobile_submenu']=page.locator('header .submenu-toggle').first.get_attribute('aria-expanded')=='true'
            if path in ['/','/people/robert-watson/']:page.screenshot(path=str(folder/(name+'-mobile.png')),full_page=True)
            result={'route':path,'checks':checks,'javascript_errors':errors};results.append(result);print(path,checks,flush=True)
            page.close()
        browser.close()
finally:server.shutdown();server.server_close()
(ROOT/'reports/browser-validation.json').write_text(json.dumps({'theme':'uploaded simplified-authoring starter','scope':'Visible source body, original asset decoding, Poppins, responsive layout and navigation; source pixel geometry is superseded by the requested new theme','pages':results},indent=2)+'\n')
if any(not all(r['checks'].values()) for r in results):raise SystemExit(1)
print(f'PASS: {len(results)} desktop/mobile template scenarios.')
