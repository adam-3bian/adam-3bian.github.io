#!/usr/bin/env python3
"""Phase 3 Chromium checks: SITE REFERENCE_SITE PROJECT_PARENT FIXTURE_PARENT.

Reference output uses local Poppins. External requests blocked; no form submissions.
"""
import json
import sys
import threading
from contextlib import contextmanager
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlsplit
from playwright.sync_api import sync_playwright

OUT = Path(__file__).with_name('phase-03-evidence')
WIDTHS = [375, 768, 1024, 1440]
BOARD = '/alliance/leadership/governing-board/'
SPEAKERS = '/news-and-events/people-and-opportunities/speakers/'
PEOPLE = ['mike-eftimakis', 'andrew-lindsay', 'david-chisnall', 'sam-cater', 'adam-finney',
          'simon-moore', 'alex-richardson', 'allison-randal', 'paul-waller', 'robert-watson', 'anthony-fox']
ROUTES = [BOARD, SPEAKERS, '/people/'] + ['/people/' + id + '/' for id in PEOPLE]

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


OBSERVE = '''() => ({width: innerWidth, scroll_width: document.documentElement.scrollWidth,
 h1: document.querySelectorAll('main h1').length,
 images: [...document.images].filter(i=>i.getAttribute('src')).map(i=>{
   let n=i, faded=[]; while(n) { if(parseFloat(getComputedStyle(n).opacity)<1) faded.push(n.tagName+'.'+n.className); n=n.parentElement; }
   return {src:i.getAttribute('src'),decoded:i.complete && i.naturalWidth>0,faded};
 }),
 portraits: [...document.querySelectorAll('article.content img.image-square')].map(i=>{
   const r=i.getBoundingClientRect();return {src:i.getAttribute('src'),width:r.width,height:r.height,fit:getComputedStyle(i).objectFit};
 }),
 frames: [...document.querySelectorAll('[data-people-list] .card-media')].map(n=>{
   const r=n.getBoundingClientRect(),i=n.querySelector('img').getBoundingClientRect();
   return {width:r.width,height:r.height,image_width:i.width,image_height:i.height};
 }),
 directory_count:document.querySelectorAll('[data-people-list]').length,
 card_images_not_zoomed:![...document.querySelectorAll('.card-image')].some(i=>i.closest('[data-image-overlay]')),
 no_fallback_dates:!document.querySelector('[data-people-list] time'),
})'''
STYLE = '''selectors => Object.fromEntries(Object.entries(selectors).map(([selector,props])=>{
 const n=document.querySelector(selector),s=n ? getComputedStyle(n) : null;
 return [selector,s ? Object.fromEntries(props.map(p=>[p,s[p]])) : null];
}))'''
CARD_STYLE = {'.cards': ['gap','gridTemplateColumns'], '.cards .card': ['padding','backgroundColor','color'],
              '.cards .card :is(h2,h3)': ['fontFamily','fontSize','fontWeight','lineHeight','letterSpacing'],
              '.card-media': ['aspectRatio','marginBottom'], '.card-image': ['objectFit','opacity']}
PORTRAIT_STYLE = {'.content img.image-square': ['aspectRatio','width','height','objectFit','objectPosition','opacity'],
                  '.content .image-left': ['float','width','maxWidth','margin']}

observations, comparisons, project, flows, fixture = [], [], [], [], []
with serve(sys.argv[1]) as site, serve(sys.argv[2]) as reference, serve(sys.argv[3]) as prefixed, serve(sys.argv[4]) as fixture_origin, sync_playwright() as p:
    browser = p.chromium.launch(executable_path='/usr/bin/chromium', headless=True, args=['--no-sandbox'])
    context = browser.new_context()
    context.route('**/*', lambda r: r.continue_() if r.request.url.startswith(('http://127.0.0.1:', 'data:')) else r.abort())
    page = context.new_page()
    errors = []
    page.on('pageerror', lambda e: errors.append(str(e)))
    for route in ROUTES:
        errors.clear()
        status = ready(page, site + route)
        for width in WIDTHS:
            page.set_viewport_size({'width': width, 'height': 1000})
            observations.append({'route': route, 'status': status, **page.evaluate(OBSERVE), 'js_errors': list(errors)})
            if route in [BOARD, SPEAKERS, '/people/robert-watson/', '/people/anthony-fox/'] and width in [375,1440]:
                page.screenshot(path=str(OUT / (route.strip('/').split('/')[-1] + '-' + str(width) + '.png')))
                if route == BOARD:
                    page.locator('[data-people-list] li').first.screenshot(path=str(OUT / ('board-card-' + str(width) + '.png')))
    for kind, route, reference_route, selectors in [('cards', SPEAKERS, '/speakers/', CARD_STYLE),
                                                  ('portrait', '/people/robert-watson/', '/speakers/sample-speaker-a/', PORTRAIT_STYLE)]:
        for width in WIDTHS:
            page.set_viewport_size({'width':width,'height':1000})
            ready(page, site + route)
            actual = page.evaluate(STYLE, selectors)
            actual_states = states(page) if kind == 'cards' else None
            ready(page, reference + reference_route)
            expected = page.evaluate(STYLE, selectors)
            reference_states = states(page) if kind == 'cards' else None
            comparisons.append({'kind':kind,'width':width,'actual':actual,'reference':expected,
                                'differences':[k for k in selectors if actual[k] != expected[k]],
                                'card_states_match':actual_states == reference_states})
    for route in [BOARD, SPEAKERS, '/people/', '/people/robert-watson/', '/people/anthony-fox/']:
        status = ready(page, prefixed + '/cheri-preview' + route)
        for width in WIDTHS:
            page.set_viewport_size({'width':width,'height':1000})
            project.append({'route':route,'status':status,**page.evaluate(OBSERVE)})

    ready(page, site + BOARD)
    first_card = page.locator('[data-people-list] a.card').first
    target = first_card.get_attribute('href')
    page.keyboard.press('Tab')
    first_card.focus()
    visible = first_card.evaluate('n=>n.matches(":focus-visible")')
    page.keyboard.press('Enter')
    page.wait_for_url('**' + target)
    flows.append({'flow':'board card keyboard navigation','focus_visible':visible,'canonical_profile':page.url.endswith('/people/mike-eftimakis/')})
    trigger = page.locator('article.content a.image-left').first
    portrait_src = trigger.locator('img').get_attribute('src')
    trigger.focus()
    page.keyboard.press('Enter')
    opened = page.locator('#image-dialog').evaluate('n=>n.open')
    original_image = urlsplit(page.locator('#image-dialog img').get_attribute('src')).path == portrait_src
    page.keyboard.press('Escape')
    flows.append({'flow':'square source portrait overlay','opened':opened,'original_image':original_image,
                  'escape_closes':not page.locator('#image-dialog').evaluate('n=>n.open'),
                  'focus_returns':trigger.evaluate('n=>document.activeElement===n')})
    for relation, id in [('news','adam-finney'),('events','robert-watson'),('papers','anthony-fox')]:
        ready(page, site + '/people/' + id + '/')
        card = page.locator('[data-relationship=' + relation + '] a.card').first
        destination = card.get_attribute('href')
        card.focus()
        page.keyboard.press('Enter')
        page.wait_for_url('**' + destination)
        flows.append({'flow':'reverse ' + relation + ' keyboard navigation','destination_matches':page.url.endswith(destination),
                      'has_one_heading':page.locator('main h1').count()==1})

    for width in WIDTHS:
        page.set_viewport_size({'width':width,'height':1000})
        ready(page, fixture_origin + '/cheri-preview/')
        result = page.evaluate('''() => {
          const entries=id=>Object.fromEntries([...document.querySelectorAll(id+' a.card')].map(c=>[c.getAttribute('href'),
            {text:c.textContent.replace(/\\s+/g,' ').trim(),src:c.querySelector('img').getAttribute('src')}]));
          const raw=entries('#raw-people'),converted=entries('#converted-people');
          return {raw_and_converted_facts_match:Object.keys(raw).length===2 && Object.keys(raw).every(k=>JSON.stringify(raw[k])===JSON.stringify(converted[k])),
            explicit_card_attributes:[...document.querySelectorAll('.card-image')].every(i=>i.alt==='' && i.classList.contains('image-contain') && i.classList.contains('image-crop-right'))};
        }''')
        result['width'] = width
        for id in ['mike-eftimakis','allison-randal']:
            ready(page, fixture_origin + '/cheri-preview/people/' + id + '/')
            result[id] = page.evaluate('''() => {
              const images=[...document.querySelectorAll('[data-source-body] img')],i=images[0],r=i.getBoundingClientRect(),s=getComputedStyle(i);
              return images.length===1 && i.alt==='' && s.objectFit==='contain' && s.objectPosition==='100% 50%'
                && i.classList.contains('image-square') && Math.abs(r.width-r.height)<1
                && document.documentElement.scrollWidth<=innerWidth && i.complete && i.naturalWidth>0;
            }''')
        fixture.append(result)

    static_context = browser.new_context(java_script_enabled=False)
    static_context.route('**/*', lambda r: r.continue_() if r.request.url.startswith('http://127.0.0.1:') else r.abort())
    static = static_context.new_page()
    for width in [375,1440]:
        static.set_viewport_size({'width':width,'height':1000})
        for route, count in [(BOARD,9),(SPEAKERS,60),('/people/',112),('/people/robert-watson/',0),('/people/anthony-fox/',0)]:
            status = ready(static, site + route)
            observed = static.evaluate(OBSERVE)
            flows.append({'flow':'no JavaScript '+route,'width':width,'http_ok':status==200,
                          'card_count_correct':static.locator('[data-people-list] a.card').count()==count,
                          'fits_viewport':observed['scroll_width']<=width,
                          'square_portraits':all(abs(i['width']-i['height'])<1 for i in observed['portraits']),
                          'images_decoded':all(i['decoded'] and not i['faded'] for i in observed['images'])})
    browser.close()

report = {'observations':observations,'comparisons':comparisons,'project':project,'flows':flows,'fixture':fixture,
          'limits':['Representative Chromium coverage; all 112 profiles separately validated by the static audit.',
                    'External requests blocked; no hosted deployment, external availability or other browsers tested.',
                    'Reference demo records exist only in the isolated ZIP build, not application content.']}
(OUT / 'browser.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps({'observations':len(observations),'project_observations':len(project),
                  'comparison_differences':[{'kind':r['kind'],'width':r['width'],'differences':r['differences']} for r in comparisons],
                  'flows':flows},indent=2))
assert all(r['status']==200 and r['h1']==1 and r['scroll_width']<=r['width'] and not r.get('js_errors')
           and r['card_images_not_zoomed'] and r['no_fallback_dates'] for r in observations + project)
assert all(i['decoded'] and not i['faded'] for r in observations + project for i in r['images'])
assert all(abs(i['width']-i['height'])<1 for r in observations + project for i in r['portraits']+r['frames'])
assert all(abs(i['width']-i['image_width'])<1 and abs(i['height']-i['image_height'])<1 for r in observations + project for i in r['frames'])
assert all(not r['differences'] and r['card_states_match'] for r in comparisons)
assert all(v for r in flows for k,v in r.items() if isinstance(v,bool))
assert all(v for r in fixture for k,v in r.items() if isinstance(v,bool))
