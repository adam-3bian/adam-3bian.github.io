#!/usr/bin/env python3
"""Phase 6 Chromium checks: SITE REFERENCE_SITE PROJECT_PARENT."""
import ast
import json
import sys
import threading
import time
from contextlib import contextmanager
from functools import partial
from http.server import SimpleHTTPRequestHandler,ThreadingHTTPServer
from pathlib import Path
from playwright.sync_api import sync_playwright
OUT=Path(__file__).with_name('phase-06-evidence')
tree=ast.parse(Path(__file__).with_name('browser_phase04.py').read_text())
exec(compile(ast.Module(body=[n for n in tree.body if isinstance(n,ast.FunctionDef) and n.name in ['serve','ready'] or isinstance(n,ast.Assign) and any(isinstance(t,ast.Name) and t.id in ['OBSERVE','STYLE'] for t in n.targets)],type_ignores=[]),'<browser helpers>','exec'))
CONTACT='/alliance/membership/contact/';NEWSLETTER='/news-and-events/news-and-analysis/subscribe-newsletter/'
observations=[];comparisons=[];menus=[];forms=[];sliders=[];fallbacks=[];project=[];keyboard=[]
STYLE_PROPS={'.slider':['marginTop'],'.hero':['backgroundColor','padding','color'],'.hero h1':['fontFamily','fontWeight','fontSize','lineHeight'],'.slide-link':['padding','gap','gridTemplateColumns','backgroundColor','color'],'.slide-copy h2':['fontFamily','fontWeight','fontSize','lineHeight'],'.slide-media':['aspectRatio'],'.slide-image':['objectFit','opacity'],'.slider-dot':['minWidth','minHeight','color'],'footer':['padding','backgroundColor','color'],'.footer-social .social-icon':['width','height','objectFit'],'.site-call-to-action':['backgroundColor','padding']}
def selected(page):return page.locator('.slider-dot[aria-current=true]').get_attribute('data-slide')
def outside(page):page.locator('main').focus()
def wait_cycle(page):page.wait_for_timeout(5200)
with serve(sys.argv[1]) as site,serve(sys.argv[2]) as ref,serve(sys.argv[3]) as prefix,sync_playwright() as p:
 browser=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 ctx=browser.new_context(reduced_motion='reduce');ctx.route('**/*',lambda r:r.continue_() if r.request.url.startswith(('http://127.0.0.1:','data:')) else r.abort())
 page=ctx.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 for route in ['/',CONTACT,NEWSLETTER,'/events/cheritech26/','/news/a-new-etsi-standard-could-rewrite-the-memory-safety-debate/','/alliance/leadership/members/']:
  ready(page,site+route)
  for width in [375,768,1024,1440]:
   page.set_viewport_size({'width':width,'height':1000});observations.append({'route':route,**page.evaluate(OBSERVE),'js_errors':list(errors)})
   if route=='/' and width in [375,1440]:
    page.evaluate('window.scrollTo(0,0)');page.screenshot(path=str(OUT/f'home-{width}.png'));page.locator('.slider').screenshot(path=str(OUT/f'slider-{width}.png'));page.locator('footer').screenshot(path=str(OUT/f'footer-{width}.png'))
   if route==CONTACT and width in [375,1440]:page.locator('.form-panel').screenshot(path=str(OUT/f'contact-{width}.png'))
 for width in [375,768,1024,1440]:
  page.set_viewport_size({'width':width,'height':1000});ready(page,site+'/');actual=page.evaluate(STYLE,STYLE_PROPS)
  ready(page,ref+'/');expected=page.evaluate(STYLE,STYLE_PROPS)
  comparisons.append({'width':width,'actual':actual,'reference':expected,'same':actual==expected})
 # Hidden slides reserve the maximum caption height at each breakpoint.
 for width in [375,768,1024,1440]:
  page.set_viewport_size({'width':width,'height':1000});ready(page,site+'/');heights=[]
  for index in [0,1]:
   page.locator('.slider-dot').nth(index).click();heights.append(page.locator('.slider-track').bounding_box()['height'])
  sliders.append({'case':'stable slide height','width':width,'heights':heights,'correct':abs(heights[0]-heights[1])<1})
 # All five menus, including nested mobile disclosure and Escape focus restoration.
 for width in [375,768,1024,1440]:
  page.set_viewport_size({'width':width,'height':1000});ready(page,site+'/')
  mobile=page.locator('#hamburger').is_visible()
  for i in range(5):
   if mobile and page.locator('#hamburger').get_attribute('aria-expanded')!='true':page.locator('#hamburger').click()
   toggle=page.locator('#primary-navigation > ul > li > button').nth(i);page.keyboard.press('Tab');toggle.focus();toggle.press('ArrowDown')
   menu=page.locator('#'+toggle.get_attribute('aria-controls'));assert menu.is_visible()
   if mobile:
    group=menu.locator('.menu-group-toggle').first;group.focus();group.press('ArrowDown')
   link=menu.locator('a:visible').first;link.focus();focused=link.evaluate('n=>n.matches(":focus-visible")');target=link.get_attribute('href')
   overflow=page.evaluate('document.documentElement.scrollWidth>innerWidth')
   page.keyboard.press('Escape')
   if mobile:page.keyboard.press('Escape')
   restored=toggle.evaluate('n=>n===document.activeElement')
   menus.append({'width':width,'category':toggle.inner_text(),'mobile':mobile,'target':target,'focus':focused,'escape_restored':restored,'overflow':overflow,'closed':toggle.get_attribute('aria-expanded')=='false'})
  if mobile:
   page.keyboard.press('Escape');assert page.locator('#hamburger').get_attribute('aria-expanded')=='false'
 # Local form controls work but there is no submission surface or network request.
 for route in [CONTACT,NEWSLETTER]:
  ready(page,site+route);requests=[];on_request=lambda r:requests.append({'method':r.method,'url':r.url});page.on('request',on_request)
  fields=page.locator('.form-panel input,.form-panel textarea,.form-panel select');labels=[]
  for field in fields.all():
   labels.append(page.locator('label[for="'+field.get_attribute('id')+'"]').count()==1)
   tag=field.evaluate('n=>n.tagName')
   if tag=='SELECT':field.select_option(index=1)
   else:field.fill('preview@example.invalid' if field.get_attribute('type')=='email' else 'Local preview check')
   field.focus();field.press('Enter')
  page.wait_for_timeout(200);page.remove_listener('request',on_request)
  forms.append({'route':route,'fields':fields.count(),'labels':all(labels),'disabled':page.locator('.form-panel button').is_disabled(),'forms':page.locator('.form-panel form').count(),'requests_after_typing':requests,'same_page':page.url==site+route})
 # Carousel under actual wall-clock timing, not a mocked timer.
 page.emulate_media(reduced_motion='no-preference');ready(page,site+'/')
 page.evaluate('''() => { window.slideChanges=[];window.started=performance.now();let index=document.querySelector('.slider-dot[aria-current]').dataset.slide;
 new MutationObserver(()=>{const n=document.querySelector('.slider-dot[aria-current]').dataset.slide;if(n!==index){window.slideChanges.push({index:n,elapsed:performance.now()-window.started});index=n;}}).observe(document.querySelector('.slider'),{subtree:true,attributes:true,attributeFilter:['aria-current']}); }''')
 initial=selected(page);page.wait_for_timeout(3500);early=selected(page);page.wait_for_timeout(1700);advanced=selected(page)
 changes=page.evaluate('window.slideChanges');sliders.append({'case':'five-second autoplay','initial':initial,'before_five_seconds':early,'after_five_seconds':advanced,'changes':changes,'correct':initial==early and advanced!=initial and len(changes)==1 and 3500<changes[0]['elapsed']<5200})
 link=page.locator('.slide:not([hidden]) a');link.focus();value=selected(page);wait_cycle(page);sliders.append({'case':'link focus pauses','correct':selected(page)==value})
 dot=page.locator('.slider-dot').first;dot.focus();value=selected(page);wait_cycle(page);sliders.append({'case':'dot focus pauses','correct':selected(page)==value})
 dot.press('Enter');assert selected(page)=='0';outside(page);wait_cycle(page);sliders.append({'case':'focus leaves, autoplay resumes','correct':selected(page)=='1'})
 # A deterministic document visibility event exercises the native hidden-tab guard.
 page.evaluate("Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'))")
 value=selected(page);wait_cycle(page);sliders.append({'case':'visibilitychange hidden simulation pauses','correct':selected(page)==value})
 page.evaluate("delete document.hidden;document.dispatchEvent(new Event('visibilitychange'))");wait_cycle(page);sliders.append({'case':'visibility restored resumes','correct':selected(page)!=value})
 playback=page.locator('[data-slider-toggle]');playback.click();outside(page);value=selected(page);wait_cycle(page);sliders.append({'case':'explicit Pause persists outside carousel','correct':selected(page)==value and playback.inner_text()=='Play slides'})
 playback.click();outside(page);wait_cycle(page);sliders.append({'case':'explicit Play resumes','correct':selected(page)!=value})
 page.emulate_media(reduced_motion='reduce');value=selected(page);wait_cycle(page);sliders.append({'case':'reduced motion stops automatic rotation','correct':selected(page)==value and playback.is_disabled()})
 other='0' if value=='1' else '1';page.locator('[data-slide="'+other+'"]').click();sliders.append({'case':'reduced motion allows manual dots','correct':selected(page)==other})
 hidden=page.locator('.slide[hidden]');sliders.append({'case':'inactive slides inert and inaccessible','correct':hidden.count()==1 and hidden.get_attribute('inert') is not None and hidden.get_attribute('aria-hidden')=='true' and not hidden.is_visible()})
 for i in [0,1]:
  ready(page,site+'/');page.locator('.slider-dot').nth(i).click();link=page.locator('.slide:not([hidden]) a');target=link.get_attribute('href');page.keyboard.press('Tab');link.focus();focus=link.evaluate('n=>n.matches(":focus-visible")');link.press('Enter');page.wait_for_url(site+target);keyboard.append({'slide':i,'target':target,'focus':focus,'navigated':page.url==site+target})
 ready(page,site+'/');subscribe=page.locator('.site-call-to-action a');subscribe.focus();subscribe.press('Enter');page.wait_for_url(site+NEWSLETTER);keyboard.append({'subscribe':True,'navigated':page.url==site+NEWSLETTER})
 for route in ['/',CONTACT,NEWSLETTER]:
  for width in [375,768,1024,1440]:
   page.set_viewport_size({'width':width,'height':1000});ready(page,prefix+'/cheri-preview'+route)
   imgs=page.locator('.slide-image,.social-icon').evaluate_all('ns=>ns.map(n=>({src:n.getAttribute("src"),decoded:n.naturalWidth>0}))')
   urls=page.locator('.slider a,.site-call-to-action a,header a,.footer-navigation a').evaluate_all('ns=>ns.map(n=>n.getAttribute("href"))')
   project.append({'route':route,'width':width,'images':imgs,'correct':all(n['decoded'] and n['src'].startswith('/cheri-preview/') for n in imgs) and all(u.startswith('/cheri-preview/') for u in urls)})
 nojs=browser.new_context(java_script_enabled=False)
 for route in ['/',CONTACT,NEWSLETTER]:
  for width in [375,1440]:
   q=nojs.new_page();q.set_viewport_size({'width':width,'height':1000});q.goto(site+route);first=q.locator('.slide').first
   checks={'navigation_visible':all(n.is_visible() for n in q.locator('#primary-navigation a').all()),'overflow':q.evaluate('document.documentElement.scrollWidth>innerWidth')}
   if route=='/':checks.update(first_slide_visible=first.is_visible(),other_slide_hidden=not q.locator('.slide').nth(1).is_visible(),controls_hidden=not q.locator('.slider-controls').is_visible());q.locator('.slide-link').first.click();q.wait_for_url(site+'/events/cheritech26/');checks['cta_navigates']=True
   else:checks.update(disabled=q.locator('.form-panel button').is_disabled(),no_form=q.locator('.form-panel form').count()==0)
   fallbacks.append({'route':route,'width':width,**checks});q.close()
 browser.close()
result={'observations':observations,'zip_comparisons':comparisons,'navigation':menus,'forms':forms,'slider':sliders,'keyboard':keyboard,'project':project,'nojs':fallbacks}
(OUT/'browser.json').write_text(json.dumps(result,indent=2)+'\n')
assert all(o['h1']==1 and o['scroll_width']<=o['width'] and not o['js_errors'] and all(i['decoded'] and not i['faded'] for i in o['images']) for o in observations)
assert all(c['same'] for c in comparisons)
assert all(m['focus'] and m['escape_restored'] and not m['overflow'] and m['closed'] for m in menus)
assert all(f['labels'] and f['disabled'] and f['forms']==0 and not f['requests_after_typing'] and f['same_page'] for f in forms)
assert all(c['correct'] for c in sliders+project)
assert all(c['navigated'] and c.get('focus',True) for c in keyboard)
assert all(all(v for k,v in f.items() if k not in ['route','width','overflow']) and not f['overflow'] for f in fallbacks)
print(f'{len(observations)} responsive views, {len(comparisons)} ZIP comparisons, {len(menus)} menu flows, {len(sliders)} carousel checks, two forms, {len(fallbacks)} no-JS views, {len(project)} prefix views pass')
