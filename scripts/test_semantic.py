#!/usr/bin/env python3
"""Browser acceptance for all ten semantic families and migration-specific behaviour."""
import json,os
from pathlib import Path
from urllib.parse import urlsplit,parse_qs
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
URL=os.environ.get('SITE_URL','http://127.0.0.1:4200/').rstrip('/')+'/'
OUT=Path(os.environ.get('REPORT_ROOT',ROOT/'reports/semantic'));OUT.mkdir(parents=True,exist_ok=True)
AXE=Path(os.environ['AXE_PATH'])
ROUTES=['news/','events/','people/','organisations/','papers/','products/','repositories/','groups/','guides/','policies/',
'news/a-new-etsi-standard-could-rewrite-the-memory-safety-debate/','events/cheritech26/','people/domagoj-stolfa/','organisations/cheri-alliance/','papers/cheriot-complete-memory-safety-for-embedded-devices/','products/sonata/','repositories/cheribsd/','groups/marketing/','guides/install-a-toolchain/','policies/code-of-conduct/']
results=[]
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path=os.environ.get('CHROMIUM_EXECUTABLE'),args=['--no-sandbox'])
 page=browser.new_page(viewport={'width':1440,'height':1000},reduced_motion='reduce');errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 for width in [390,768,1440]:
  page.set_viewport_size({'width':width,'height':1000})
  for route in ROUTES:
   assert page.goto(URL+route).status==200
   page.evaluate('document.fonts.ready')
   assert page.locator('h1').count()==1
   assert not page.evaluate('document.documentElement.scrollWidth>innerWidth+1'),(width,route)
   assert 'Poppins' in page.locator('body').evaluate('e=>getComputedStyle(e).fontFamily')
   assert page.locator('a a,a button').count()==0
   if route.startswith('news/') and route!='news/':assert page.locator('.article-byline .author-role').count()==0
   if route=='events/cheritech26/':
    tabs=page.get_by_role('tab');assert tabs.count()==2
    assert page.locator('.programme-day:visible').count()==1
    assert tabs.first.get_attribute('aria-selected')=='true'
    assert page.locator('.programme-clock').all_text_contents()==['13:05','13:20','13:40','14:00']
    tabs.last.click();assert page.locator('.programme-session:visible').count()==6
    tabs.last.press('ArrowRight');assert tabs.first.get_attribute('aria-selected')=='true'
    tabs.first.press('End');assert tabs.last.get_attribute('aria-selected')=='true'
    tabs.last.press('Home');assert tabs.first.get_attribute('aria-selected')=='true'
    scroll=page.evaluate('scrollY');tabs.first.press('Space');assert page.evaluate('scrollY')==scroll
    page.emulate_media(media='print');assert page.locator('.programme-day:visible').count()==2
    assert page.locator('.programme-date').first.evaluate('e=>getComputedStyle(e).position')=='static'
    page.emulate_media(media='screen');assert page.locator('.programme-day:visible').count()==1
   for img in page.locator('.media-posts,.media-events').all():
    box=img.bounding_box();assert abs(box['width']/box['height']-16/9)<.02,(width,route,box)
   for img in page.locator('.media-people').all():
    box=img.bounding_box();assert abs(box['width']-box['height'])<1,(width,route,box)
    assert img.locator('img').evaluate('e=>getComputedStyle(e).objectFit')=='cover'
   for img in page.locator('.media-organisations').all():
    box=img.bounding_box();assert abs(box['width']/box['height']-3)<.02,(width,route,box)
    assert img.locator('img').evaluate('e=>getComputedStyle(e).objectFit')=='contain'
   for selector,ratio,fit in [('.image-kind-people',1,'cover'),('.image-kind-organisations',3,'contain'),('.image-kind-events',16/9,'contain'),('.article-lead',16/9,'contain')]:
    for frame in page.locator(selector).all():
     box=frame.locator('img').bounding_box();assert abs(box['width']/box['height']-ratio)<.02,(width,route,selector,box)
     assert frame.locator('img').evaluate('e=>getComputedStyle(e).objectFit')==fit
     assert frame.locator('img').evaluate('async e=>{await e.decode();return e.naturalWidth>0}')
   if width in [390,1440]:
    page.add_script_tag(path=str(AXE));violations=page.evaluate("async()=>(await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']}})).violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)}))")
    assert not violations,(width,route,violations)
   results.append({'width':width,'route':route})
 page.goto(URL+'people/domagoj-stolfa/')
 assert page.locator('.record-facts').inner_text().count('Researcher (current)')==2
 assert page.locator('.record-facts a').all_text_contents()==['Capabilities Limited','University of Cambridge']
 for employer in ['capabilities-limited','university-of-cambridge']:
  page.goto(URL+'organisations/'+employer+'/');assert page.locator('[data-relationship="people"] a[href$="/people/domagoj-stolfa/"]').count()==1
 for route,count in [('people/',111),('organisations/',69),('news-and-events/people-and-opportunities/speakers/',60),('alliance/leadership/members/',51),('alliance/leadership/governing-board/',9)]:
  page.goto(URL+route);assert page.locator('[data-catalog-list]>li').count()==count,(route,count)
 page.goto(URL+'organisations/cheri-alliance/');assert page.locator('.record-facts').count()==0 # unknown membership is not presented as active
 page.goto(URL+'people/a-theodore-markettos/');assert page.locator('.record-status,.record-portrait,.detail-aside').count()==0
 page.goto(URL+'adopt/assurance-and-adoption/cheri-enabled-products/')
 assert page.locator('a[href$="/adopt/assurance-and-adoption/x730-certification/"]').count()>=1
 assert page.locator('[data-catalog-list]').count()==0,'Certification overview must not imply all products are certified'
 for route,count in [('alliance/membership/contact/',5),('news-and-events/news-and-analysis/subscribe-newsletter/',1)]:
  page.goto(URL+route);assert page.locator('.form-panel').count()==1
  form=page.locator('form[data-local-form]');assert form.count()==1
  assert form.locator('input,select,textarea').count()==count
  assert form.get_attribute('action') is None and form.locator('button[type=submit][disabled][hidden]').count()==1
  assert page.locator('.form-panel a.button').count()==0
 for old,new,fragment in [('hardware/sonata/','products/sonata/','typical-workflow'),('software/cheribsd/','repositories/cheribsd/','page-title'),('cheriot-1-0-specification-released/','news/cheriot-1-0-specification-released/','page-title')]:
  page.goto(URL+old+'?migration_check=kept#'+fragment);page.wait_for_url(URL+new+'?migration_check=kept#'+fragment)
  assert parse_qs(urlsplit(page.url).query)=={'migration_check':['kept']};assert page.locator('[id="'+fragment+'"]').count()==1
 # Direct links reveal their day, including existing speaker-profile talk links.
 programme=URL+'events/cheritech26/'
 target='presentation-cheri-zephyr-and-compartmentalisation-of-userspace-threads-79e1a6'
 page.goto(programme+'#'+target)
 assert page.locator('#'+target).count()==1
 assert page.locator('#'+target).evaluate("e=>e.closest('[data-programme-day]').id")=='programme-day-2026-11-13'
 generated=page.locator('#'+target).evaluate('e=>e.nextElementSibling.id')
 assert page.locator('#'+generated).is_visible()
 assert page.get_by_role('tab').last.get_attribute('aria-selected')=='true'
 page.goto(programme+'#'+generated)
 assert page.locator('#'+generated).is_visible()
 assert page.get_by_role('tab').last.get_attribute('aria-selected')=='true'
 page.evaluate("location.hash='programme-day-2026-11-12'")
 page.wait_for_function("document.querySelector('[data-programme-tab]').getAttribute('aria-selected')==='true'")
 page.goto(programme+'#%not-escaped');assert page.locator('.programme-day:visible').count()==1
 # Single-day events need no tabs; all multi-day content survives a failed script.
 page.goto(URL+'events/cheri-blossoms-conference-2025/')
 assert page.get_by_role('tab').count()==0 and page.locator('.programme-session:visible').count()==33
 page.goto(URL+'events/cheri-blossoms-conference-2027/')
 assert page.get_by_role('tab').count()==3
 page.get_by_role('tab').last.click();assert page.locator('.programme-day:visible').count()==1
 failed=browser.new_context(viewport={'width':390,'height':844})
 failed.route('**/assets/js/programme.js',lambda route:route.abort())
 fallback=failed.new_page();fallback.goto(programme)
 assert fallback.locator('.programme-session:visible').count()==17
 assert fallback.get_by_role('tab').count()==0
 failed.close()
 # Whole programme remains native content without scripting.
 nojs=browser.new_context(java_script_enabled=False,viewport={'width':390,'height':844});plain=nojs.new_page();plain.goto(URL+'events/cheritech26/')
 assert plain.locator('.programme-day:visible').count()==2
 assert plain.locator('.programme-session:visible').count()==17
 assert plain.locator('.programme-presentation:visible').count()>10
 for route,count in [('alliance/membership/contact/',5),('news-and-events/news-and-analysis/subscribe-newsletter/',1)]:
  plain.goto(URL+route);assert plain.locator('.form-panel form').is_visible()
  assert plain.locator('.form-panel input,.form-panel textarea,.form-panel select').count()==count
  original=plain.url;plain.locator('.form-panel input[type=email]').fill('test@example.invalid')
  plain.locator('.form-panel input[type=email]').press('Enter');plain.wait_for_timeout(100);assert plain.url==original
 assert not errors,errors
 browser.close()
(OUT/'results.json').write_text(json.dumps({'responsive_views':results,'axe_views':40,'inverse_affiliations':'passed','filters':'passed','certification':'passed','local_forms':'passed','redirect_query_and_fragment':'passed','native_programme':'passed','javascript_errors':errors},indent=2)+'\n')
print('Semantic acceptance: 60 responsive views, 40 axe audits, concurrent affiliations/inverse views, all filters, certification classification, local forms, redirects and no-JavaScript programme passed.')
