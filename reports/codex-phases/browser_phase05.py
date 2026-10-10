#!/usr/bin/env python3
"""Phase 5 browser checks: SITE REFERENCE_SITE PROJECT_PARENT."""
import ast
import json
import sys
import threading
from contextlib import contextmanager
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from playwright.sync_api import sync_playwright
OUT=Path(__file__).with_name('phase-05-evidence')
tree=ast.parse(Path(__file__).with_name('browser_phase04.py').read_text())
exec(compile(ast.Module(body=[n for n in tree.body if isinstance(n,ast.FunctionDef) and n.name in ['serve','ready','states'] or isinstance(n,ast.Assign) and any(isinstance(t,ast.Name) and t.id in ['OBSERVE','STYLE','CARD_STYLE'] for t in n.targets)],type_ignores=[]),'<browser helpers>','exec'))
ROUTES=['/organisations/','/alliance/leadership/members/','/organisations/codasip/','/organisations/dsit/','/papers/','/papers/cheri-concentrate-practical-compressed-capabilities/',
 '/hardware/','/hardware/sonata/','/software/','/software/cheribsd/','/policies/','/policies/privacy/','/guides/','/guides/choose-a-platform/','/groups/','/groups/cheri-qemu/',
 '/alliance/leadership/working-groups/','/build/software-ecosystem/','/news-and-events/events-and-archive/cheri-blossoms/','/events/cheritech26/',
 '/reference/source-versions/members/','/reference/source-versions/latest-news/','/discover/','/adopt/','/build/','/alliance/','/news-and-events/']
observations=[];comparisons=[];flows=[];project=[]
with serve(sys.argv[1]) as site,serve(sys.argv[2]) as reference,serve(sys.argv[3]) as preview,sync_playwright() as p:
 browser=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 ctx=browser.new_context();ctx.route('**/*',lambda r:r.continue_() if r.request.url.startswith(('http://127.0.0.1:','data:')) else r.abort())
 page=ctx.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 for route in ROUTES:
  errors.clear();status=ready(page,site+route)
  for width in [375,768,1024,1440]:
   page.set_viewport_size({'width':width,'height':1000});observations.append({'route':route,'status':status,**page.evaluate(OBSERVE),'js_errors':list(errors)})
   if route in ['/alliance/leadership/working-groups/','/alliance/leadership/members/','/build/'] and width in [375,1440]:page.screenshot(path=str(OUT/(route.strip('/').split('/')[-1]+'-'+str(width)+'.png')))
 for width in [375,768,1024,1440]:
  page.set_viewport_size({'width':width,'height':1000})
  props={k:v for k,v in CARD_STYLE.items() if k!='.card .meta'}
  ready(page,site+'/alliance/leadership/members/');actual=page.evaluate(STYLE,props);actual_states=states(page)
  ready(page,reference+'/members/');expected=page.evaluate(STYLE,props);expected_states=states(page)
  comparisons.append({'width':width,'actual':actual,'reference':expected,'same':actual==expected and actual_states==expected_states})
 for route in ['/alliance/leadership/members/','/groups/','/build/software-ecosystem/','/events/cheritech26/','/build/']:
  ready(page,site+route);card=page.locator('main .cards a.card').first;href=card.get_attribute('href');page.keyboard.press('Tab');card.focus();visible=card.evaluate('n=>n.matches(":focus-visible")');card.press('Enter');page.wait_for_url(site+href)
  flows.append({'route':route,'target':href,'keyboard_focus':visible,'navigated':page.url==site+href})
 for route in ['/alliance/leadership/members/','/organisations/codasip/','/build/software-ecosystem/','/events/cheritech26/','/build/']:
  ready(page,preview+'/cheri-preview'+route)
  for width in [375,768,1024,1440]:
   page.set_viewport_size({'width':width,'height':1000})
   imgs=page.locator('.card-image,.image-square').evaluate_all('ns=>ns.map(n=>({src:n.getAttribute("src"),decoded:n.naturalWidth>0}))')
   project.append({'route':route,'width':width,'images':imgs,'correct':all(n['decoded'] and n['src'].startswith('/cheri-preview/') for n in imgs)})
 nojs=browser.new_context(java_script_enabled=False)
 for route in ['/alliance/leadership/working-groups/','/alliance/leadership/members/','/build/software-ecosystem/','/build/']:
  q=nojs.new_page();q.goto(site+route);cards=q.locator('main .cards a.card');flows.append({'route':route,'javascript':False,'cards':cards.count(),'visible':cards.first.is_visible()});q.close()
 browser.close()
result={'observations':observations,'zip_comparisons':comparisons,'keyboard_and_nojs':flows,'project':project}
(OUT/'browser.json').write_text(json.dumps(result,indent=2)+'\n')
assert all(o['status']==200 and o['h1']==1 and o['scroll_width']<=o['width'] and not o['js_errors'] and all(i['decoded'] and not i['faded'] for i in o['images']) for o in observations)
assert all(c['same'] for c in comparisons)
assert all(c['correct'] for c in project)
assert all(f.get('keyboard_focus',True) and f.get('navigated',True) and f.get('visible',True) for f in flows)
print(f'{len(observations)} responsive views, {len(comparisons)} ZIP comparisons, {len(flows)} keyboard/no-JS flows, {len(project)} prefix views pass')
