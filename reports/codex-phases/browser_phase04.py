#!/usr/bin/env python3
"""Phase 4 Chromium checks: SITE REFERENCE_SITE PROJECT_PARENT FIXTURE_PARENT.

External requests blocked. Reference output uses application local Poppins.
"""
import json
import sys
import threading
from contextlib import contextmanager
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from playwright.sync_api import sync_playwright

OUT = Path(__file__).with_name('phase-04-evidence')
WIDTHS = [375,768,1024,1440]
PAST = '/news-and-events/events-and-archive/past-events/'
UPCOMING = '/news-and-events/events-and-archive/upcoming-events/'
BLOSSOMS = '/events/cheri-blossoms-conference-2026/'
ARTICLE = '/news/one-bug-is-all-it-takes/'
PAPER = '/papers/cheri-concentrate-practical-compressed-capabilities/'
ROUTES = ['/', '/news/', '/news-and-events/news-and-analysis/latest-news/', '/events/', PAST, UPCOMING,
          BLOSSOMS, '/events/cheritech25/', '/events/cheritech26/', '/events/webinar-cheri-cra-compliance/',
          ARTICLE, '/news/beyond-software-patching/', PAPER, '/people/robert-watson/', '/people/anthony-fox/', '/people/brooks-davis/']

@contextmanager
def serve(folder):
    class Quiet(SimpleHTTPRequestHandler):
        def log_message(self, *_):
            pass
    server = ThreadingHTTPServer(('127.0.0.1', 0), partial(Quiet, directory=folder))
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    try:
        yield 'http://127.0.0.1:' + str(server.server_port)
    finally:
        server.shutdown()
        server.server_close()
        thread.join()

def ready(page, url):
    response = page.goto(url, wait_until='networkidle')
    page.locator('img[loading=lazy]').evaluate_all('imgs=>imgs.forEach(i=>i.loading="eager")')
    page.wait_for_function('[...document.images].every(i=>i.complete)')
    page.evaluate('Promise.all([400,500,600].map(w=>document.fonts.load(w+" 16px Poppins")))')
    page.evaluate('document.fonts.ready')
    return response.status

def states(page):
    card = page.locator('.cards a.card').first
    properties = ['backgroundColor', 'color', 'outlineColor', 'outlineStyle', 'outlineWidth', 'outlineOffset']
    def style():
        return card.evaluate('(n,ps)=>Object.fromEntries(ps.map(p=>[p,getComputedStyle(n)[p]]))', properties)
    page.mouse.move(0, 0)
    page.locator('body').click(position={'x': 1, 'y': 1})
    normal = style()
    card.hover()
    hover = style()
    page.mouse.move(0, 0)
    page.keyboard.press('Tab')
    card.focus()
    focus = style()
    return {'normal': normal, 'hover': hover, 'focus': focus,
            'keyboard_focus_visible': card.evaluate('n=>n.matches(":focus-visible")')}


OBSERVE = '''() => ({width:innerWidth,scroll_width:document.documentElement.scrollWidth,h1:document.querySelectorAll('main h1').length,
 images:[...document.images].filter(i=>i.getAttribute('src')).map(i=>{
  let n=i,faded=[];while(n){if(parseFloat(getComputedStyle(n).opacity)<1)faded.push(n.tagName+'.'+n.className);n=n.parentElement;}
  return {src:i.getAttribute('src'),decoded:i.complete&&i.naturalWidth>0,faded};
 }),
 frames:[...document.querySelectorAll('.card-media')].map(n=>{
  const r=n.getBoundingClientRect(),i=n.querySelector('img').getBoundingClientRect();
  return {landscape:n.classList.contains('card-media-landscape'),width:r.width,height:r.height,image_width:i.width,image_height:i.height};
 }),
 relationship_counts:Object.fromEntries([...document.querySelectorAll('[data-relationship]')].map(n=>[n.dataset.relationship,n.querySelectorAll('a.card').length])),
 card_images_not_zoomed:![...document.querySelectorAll('.card-image')].some(i=>i.closest('[data-image-overlay]')),
})'''
STYLE = '''selectors => Object.fromEntries(Object.entries(selectors).map(([selector,props])=>{
 const n=document.querySelector(selector),s=n?getComputedStyle(n):null;
 return [selector,s?Object.fromEntries(props.map(p=>[p,s[p]])):null];
}))'''
CARD_STYLE = {'.cards':['gap','gridTemplateColumns'],'.cards .card':['padding','backgroundColor','color','opacity'],
 '.cards .card :is(h2,h3)':['fontFamily','fontSize','fontWeight','lineHeight','letterSpacing'],
 '.card-media':['aspectRatio','marginBottom'],'.card-image':['objectFit','opacity'],'.card .meta':['fontSize','lineHeight','fontWeight']}
observations,project,comparisons,flows,fixtures=[],[],[],[],[]
with serve(sys.argv[1]) as site, serve(sys.argv[2]) as reference, serve(sys.argv[3]) as prefixed, serve(sys.argv[4]) as fixture_origin, sync_playwright() as p:
    browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
    context=browser.new_context()
    context.route('**/*',lambda r:r.continue_() if r.request.url.startswith(('http://127.0.0.1:','data:')) else r.abort())
    page=context.new_page();errors=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    for route in ROUTES:
        errors.clear();status=ready(page,site+route)
        for width in WIDTHS:
            page.set_viewport_size({'width':width,'height':1000})
            observations.append({'route':route,'status':status,**page.evaluate(OBSERVE),'js_errors':list(errors)})
            if route in ['/news/',UPCOMING,ARTICLE] and width in [375,1440]:
                page.screenshot(path=str(OUT/(route.strip('/').split('/')[-1]+'-'+str(width)+'.png')))
            if route==BLOSSOMS and width in [375,1440]:
                page.locator('[data-relationship=speakers] li').first.screenshot(path=str(OUT/('speaker-card-'+str(width)+'.png')))
    for route in ['/news/','/events/']:
        for width in WIDTHS:
            page.set_viewport_size({'width':width,'height':1000})
            ready(page,site+route);actual=page.evaluate(STYLE,CARD_STYLE);actual_states=states(page)
            ready(page,reference+route);expected=page.evaluate(STYLE,CARD_STYLE);expected_states=states(page)
            comparisons.append({'route':route,'width':width,'actual':actual,'reference':expected,
                                'differences':[k for k in CARD_STYLE if actual[k]!=expected[k]],'states_match':actual_states==expected_states})
    # Retained source-body URLs still have known prefix failures; verify new generated
    # components independently rather than treating those historical gaps as a pass.
    for route in ['/news/',UPCOMING,BLOSSOMS,ARTICLE]:
        status=ready(page,prefixed+'/cheri-preview'+route)
        for width in WIDTHS:
            page.set_viewport_size({'width':width,'height':1000})
            r=page.evaluate(OBSERVE)
            r['component_images']=page.locator('.card-image,.brand img').evaluate_all('imgs=>imgs.map(i=>({src:i.getAttribute("src"),decoded:i.complete&&i.naturalWidth>0}))')
            project.append({'route':route,'status':status,**r})
    for route,selector in [(ARTICLE,'[data-relationship=authors] a.card'),(BLOSSOMS,'[data-relationship=speakers] a.card'),
                           (PAPER,'[data-relationship=authors] a.card'),(UPCOMING,'[data-collection-index] a.card'),
                           ('/people/robert-watson/','[data-relationship=events] a.card'),('/people/brooks-davis/','[data-relationship=news] a.card')]:
        ready(page,site+route);card=page.locator(selector).first;target=card.get_attribute('href')
        page.keyboard.press('Tab');card.focus();visible=card.evaluate('n=>n.matches(":focus-visible")')
        page.keyboard.press('Enter');page.wait_for_url('**'+target)
        flows.append({'flow':'keyboard '+route,'target':target,'focus_visible':visible,'canonical_destination':page.url.endswith(target),'one_h1':page.locator('main h1').count()==1})

    # Inclusive end-date boundaries, no invented classification/date for an unknown
    # event, and a genuine empty upcoming directory after the last published event.
    date_rows=json.loads((OUT/'source-metadata.json').read_text())
    ends={'/events/'+Path(r['path']).stem+'/':r['added'].get('end-date',r['added']['date'])[:10] for r in date_rows if r['path'].startswith('_events/')}
    for width in WIDTHS:
        page.set_viewport_size({'width':width,'height':1000})
        ready(page,fixture_origin+'/cheri-preview/')
        boundary=page.locator('section[data-as-of]').evaluate_all('nodes=>nodes.map(n=>({day:n.dataset.asOf,status:n.dataset.status,urls:[...n.querySelectorAll("a.card")].map(a=>a.getAttribute("href").replace("/cheri-preview",""))}))')
        for row in boundary:
            row['correct']=set(row['urls'])=={url for url,end in ends.items() if (end<row['day'])==(row['status']=='past')}
        details=page.evaluate('''() => ({
          news_urls:[...document.querySelectorAll('#fixture-news a.card')].map(a=>a.getAttribute('href').replace('/cheri-preview','')),
          undated_news_has_no_time:!document.querySelector('#fixture-news a[href*="beyond-software"] time'),
          undated_event_visible:document.querySelectorAll('#undated-event a.card').length===1,
          undated_event_has_no_time:!document.querySelector('#undated-event time'),
          unknown_unclassified:document.querySelectorAll('[data-unknown-status] a.card').length===0,
          fits_viewport:document.documentElement.scrollWidth<=innerWidth
        })''')
        details['news_order_correct']=details.pop('news_urls')==['/news/a-new-etsi-standard-could-rewrite-the-memory-safety-debate/','/news/one-bug-is-all-it-takes/','/news/beyond-software-patching/']
        ready(page,fixture_origin+'/cheri-preview/empty-upcoming/')
        details['empty_upcoming']=page.locator('[data-collection-index] a.card').count()==0 and page.locator('[data-collection-index]').inner_text().strip()=='No upcoming events are currently listed.'
        fixtures.append({'width':width,'boundaries':boundary,**details})

    static_context=browser.new_context(java_script_enabled=False)
    static_context.route('**/*',lambda r:r.continue_() if r.request.url.startswith('http://127.0.0.1:') else r.abort())
    static=static_context.new_page()
    for width in [375,1440]:
        static.set_viewport_size({'width':width,'height':1000})
        for route,selector,count in [('/news/','[data-collection-index] a.card',47),(UPCOMING,'[data-collection-index] a.card',2),
                                     (BLOSSOMS,'[data-relationship=speakers] a.card',39),(ARTICLE,'[data-relationship=authors] a.card',1),
                                     (PAPER,'[data-relationship=authors] a.card',15)]:
            status=ready(static,site+route);r=static.evaluate(OBSERVE)
            flows.append({'flow':'no JavaScript '+route,'width':width,'http_ok':status==200,'count_correct':static.locator(selector).count()==count,
                          'fits_viewport':r['scroll_width']<=width,'images_decoded':all(i['decoded'] and not i['faded'] for i in r['images'])})
    browser.close()
report={'observations':observations,'project':project,'comparisons':comparisons,'flows':flows,'fixtures':fixtures,
        'limits':['Representative Chromium coverage; no hosted deployment or other browsers tested.',
                  'Project source-body media failures remain separately recorded; generated component assets are checked.',
                  'Fixture-only date overrides/unknown input are never published. External requests blocked; no forms submitted.']}
(OUT/'browser.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps({'observations':len(observations),'project_observations':len(project),'comparisons':comparisons,'flows':flows,
                  'fixture_errors':[r for r in fixtures if any(v is False for v in r.values()) or any(not b['correct'] for b in r['boundaries'])]},indent=2))
assert all(r['status']==200 and r['h1']==1 and r['scroll_width']<=r['width'] and not r.get('js_errors') and r['card_images_not_zoomed'] for r in observations+project)
assert all(i['decoded'] and not i['faded'] for r in observations for i in r['images'])
assert all(i['decoded'] and i['src'].startswith('/cheri-preview/') for r in project for i in r['component_images'])
assert all(abs(i['width']/i['height']-(16/9 if i['landscape'] else 1))<0.01 and abs(i['width']-i['image_width'])<1 and abs(i['height']-i['image_height'])<1 for r in observations for i in r['frames'])
assert all(not r['differences'] and r['states_match'] for r in comparisons)
assert all(v for r in flows+fixtures for k,v in r.items() if isinstance(v,bool))
assert all(b['correct'] for r in fixtures for b in r['boundaries'])
