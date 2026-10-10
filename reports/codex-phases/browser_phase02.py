#!/usr/bin/env python3
"""Four-width Phase 2 component evidence; external requests and form submissions blocked.

python3 browser_phase02.py BEFORE_SITE SITE REFERENCE_SITE PROJECT_PARENT FIXTURE_PARENT
REFERENCE_SITE must use the same local Poppins faces in its compiled output.
PROJECT_PARENT serves the prefixed build at /cheri-preview/.
"""
import json
import sys
import threading
from contextlib import contextmanager
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

from playwright.sync_api import sync_playwright

OUT = Path(__file__).with_name('phase-02-evidence')
WIDTHS = [375, 768, 1024, 1440]
ROUTES = ['/', '/alliance/leadership/governing-board/', '/alliance/leadership/members/',
          '/news-and-events/people-and-opportunities/speakers/', '/people/robert-watson/',
          '/people/anthony-fox/', '/organisations/codasip/', '/news/one-bug-is-all-it-takes/',
          '/news/beyond-software-patching/', '/events/cheri-blossoms-conference-2026/',
          '/papers/cheri-concentrate-practical-compressed-capabilities/',
          '/build/platforms/platform-comparison/', '/alliance/membership/contact/',
          '/news-and-events/news-and-analysis/subscribe-newsletter/', '/people/', '/news/',
          '/discover/why-cheri/vulnerabilities-in-everyday-technology/']
SELECTORS = {
    'body': ['fontFamily', 'fontSize', 'fontWeight', 'lineHeight', 'color', 'backgroundColor', 'opacity'],
    'body::before': ['opacity', 'backgroundRepeat', 'backgroundSize', 'backgroundPosition', 'maskImage'],
    'header': ['backgroundColor', 'paddingLeft', 'paddingRight', 'opacity'],
    '.brand img': ['maxWidth', 'height', 'opacity'],
    'main': ['backgroundColor', 'maxWidth', 'paddingLeft', 'paddingRight', 'opacity'],
    '.hero': ['backgroundColor', 'paddingLeft', 'paddingRight', 'paddingTop', 'paddingBottom', 'opacity'],
    '.hero h1': ['fontFamily', 'fontSize', 'fontWeight', 'lineHeight', 'letterSpacing', 'color'],
    '.hero-intro > p': ['fontSize', 'fontWeight', 'lineHeight', 'color', 'maxWidth', 'marginTop'],
    '.cards .card': ['backgroundColor', 'paddingLeft', 'paddingRight', 'opacity', 'boxShadow', 'borderTopWidth'],
    '.cards .card h3, .cards .card h2': ['fontSize', 'fontWeight', 'lineHeight', 'letterSpacing'],
    '.card-action': ['fontWeight'],
    'footer': ['backgroundColor', 'color', 'opacity'],
}
STYLES = '''selectors => Object.fromEntries(Object.entries(selectors).map(([selector, properties]) => {
 const pseudo = selector.endsWith('::before') ? '::before' : null;
 const node = document.querySelector(selector.replace('::before',''));
 if (!node) return [selector, null];
 const s = getComputedStyle(node, pseudo);
 return [selector, Object.fromEntries(properties.map(p => [p,s[p]]))];
}))'''
OBSERVE = r'''() => ({width: innerWidth, scroll_width: document.documentElement.scrollWidth,
 theme: document.body.dataset.theme, logo: document.querySelector('.brand img').getAttribute('src'),
 background: getComputedStyle(document.body, '::before').backgroundImage.replace(/http:\/\/127.0.0.1:\d+/g,''),
 font_faces: [...document.fonts].filter(f=>f.family.includes('Poppins')).map(f=>({weight:f.weight,status:f.status})),
 intro: [...document.querySelectorAll('.hero-intro > p')].map(n=>({text:n.textContent,
   size:getComputedStyle(n).fontSize, line_height:getComputedStyle(n).lineHeight})),
 images: [...document.images].filter(i=>i.getAttribute('src')).map(i=>{
   let n=i, faded=[]; while(n) { if(parseFloat(getComputedStyle(n).opacity)<1) faded.push(n.tagName+'.'+n.className); n=n.parentElement; }
   return {src:i.getAttribute('src'), decoded:i.complete && i.naturalWidth>0, faded_ancestors:faded};
 }),
 overflow_links: [...document.querySelectorAll('main a')].filter(n=>n.getBoundingClientRect().right>innerWidth)
    .map(n=>({text:n.textContent,url:n.getAttribute('href'),right:n.getBoundingClientRect().right})),
})'''


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


observations, baselines, comparisons, flows, project, fixture_checks = [], [], [], [], [], []
with serve(sys.argv[1]) as before, serve(sys.argv[2]) as site, serve(sys.argv[3]) as reference, \
        serve(sys.argv[4]) as project_origin, serve(sys.argv[5]) as fixture_origin, sync_playwright() as p:
    browser = p.chromium.launch(executable_path='/usr/bin/chromium', headless=True, args=['--no-sandbox'])
    context = browser.new_context()
    context.route('**/*', lambda r: r.continue_() if r.request.url.startswith(('http://127.0.0.1:', 'data:')) else r.abort())
    page = context.new_page()
    errors = []
    page.on('pageerror', lambda e: errors.append(str(e)))
    for route in ROUTES:
        errors.clear()
        page.set_viewport_size({'width': 1440, 'height': 1000})
        status = ready(page, site + route)
        for width in WIDTHS:
            page.set_viewport_size({'width': width, 'height': 1000})
            observations.append({'route': route, 'status': status, **page.evaluate(OBSERVE), 'js_errors': list(errors)})
            if (route, width) in [('/', 1440), ('/', 375), ('/news/one-bug-is-all-it-takes/', 375)]:
                page.screenshot(path=str(OUT / (('home' if route == '/' else 'article') + '-' + str(width) + '.png')))
    for route in ['/', '/news/one-bug-is-all-it-takes/']:
        status = ready(page, before + route)
        for width in WIDTHS:
            page.set_viewport_size({'width': width, 'height': 1000})
            baselines.append({'route': route, 'status': status, **page.evaluate(OBSERVE)})

    for theme, actual_route, reference_route in [('dark', '/', '/'), ('light', '/news/one-bug-is-all-it-takes/', '/discover/')]:
        for width in WIDTHS:
            page.set_viewport_size({'width': width, 'height': 1000})
            ready(page, site + actual_route)
            actual = page.evaluate(STYLES, SELECTORS)
            actual_states = states(page)
            ready(page, reference + reference_route)
            expected = page.evaluate(STYLES, SELECTORS)
            expected_states = states(page)
            comparisons.append({'theme': theme, 'width': width, 'actual_route': actual_route,
                                'reference_route': reference_route, 'actual': actual, 'reference': expected,
                                'different_selectors': [s for s in SELECTORS if actual[s] != expected[s]],
                                'actual_card_states': actual_states, 'reference_card_states': expected_states})

    # Test shared theme requests under a real mount; original body URLs are reported separately by the static audit.
    failed_requests = []
    page.on('response', lambda r: failed_requests.append({'url': url_path(r.url), 'status': r.status}) if r.status >= 400 else None)
    def url_path(url):
        return '/' + url.split('/', 3)[-1]
    for route in ['/', '/news/one-bug-is-all-it-takes/']:
        for width in WIDTHS:
            failed_requests.clear()
            page.set_viewport_size({'width': width, 'height': 1000})
            status = ready(page, project_origin + '/cheri-preview' + route)
            project.append({'route': route, 'status': status, **page.evaluate(OBSERVE),
                            'failed_requests': list(failed_requests), 'styles': page.evaluate(STYLES, SELECTORS)})

    page.set_viewport_size({'width': 375, 'height': 900})
    ready(page, site + '/')
    hamburger = page.locator('#hamburger')
    hamburger.focus()
    page.keyboard.press('Enter')
    opened = hamburger.get_attribute('aria-expanded') == 'true'
    toggle = page.locator('header .submenu-toggle').first
    toggle.focus()
    page.keyboard.press('Enter')
    submenu = toggle.get_attribute('aria-expanded') == 'true'
    page.keyboard.press('Escape')
    flows.append({'flow': 'keyboard menu', 'menu_opened': opened, 'submenu_opened': submenu,
                  'submenu_closed_on_escape': toggle.get_attribute('aria-expanded') == 'false'})
    ready(page, site + '/people/robert-watson/')
    trigger = page.locator('a[data-image-overlay]').first
    trigger.click()
    opened = page.locator('#image-dialog').evaluate('n=>n.open')
    dialog_opacity = page.locator('#image-dialog img').evaluate('''i=>{let n=i;while(n){if(getComputedStyle(n).opacity!=='1')return false;n=n.parentElement;}return true;}''')
    page.keyboard.press('Escape')
    flows.append({'flow': 'image overlay', 'opened': opened, 'image_and_ancestors_opaque': dialog_opacity,
                  'closed_on_escape': not page.locator('#image-dialog').evaluate('n=>n.open'),
                  'focus_returned': trigger.evaluate('n=>document.activeElement===n')})
    nojs = browser.new_context(java_script_enabled=False, viewport={'width': 375, 'height': 900})
    nojs.route('**/*', lambda r: r.continue_() if r.request.url.startswith(('http://127.0.0.1:', 'data:')) else r.abort())
    static = nojs.new_page()
    for route in ['/', '/news/one-bug-is-all-it-takes/']:
        status = static.goto(site + route, wait_until='networkidle').status
        flows.append({'flow': 'no JavaScript', 'route': route, 'status': status,
                      'visible_main': static.locator('main').is_visible(),
                      'fits_viewport': static.locator('html').evaluate('n=>n.scrollWidth<=innerWidth')})
    fixture_url = fixture_origin + '/cheri-preview/component-check/'
    for width in WIDTHS:
        page.set_viewport_size({'width': width, 'height': 1000})
        status = ready(page, fixture_url)
        result = page.evaluate(r'''() => {
          const grids = [2,3,4].map(n=>{
            const grid=document.querySelector('#columns-'+n+' .cards');
            return {requested:n, actual:getComputedStyle(grid).gridTemplateColumns.split(' ').length};
          });
          const framed=[...document.querySelectorAll('.card-media')].map(n=>{
            const r=n.getBoundingClientRect(), i=n.querySelector('img'), ir=i.getBoundingClientRect();
            return {expected:n.classList.contains('card-media-landscape')?16/9:1,
                    actual:r.width/r.height, image_fills_frame:Math.abs(ir.width-r.width)<1 && Math.abs(ir.height-r.height)<1,
                    fit:getComputedStyle(i).objectFit};
          });
          const images=id=>[...document.querySelectorAll(id+' .card-image')].map(i=>i.getAttribute('src')).sort();
          const absent=[...document.querySelectorAll('#columns-3 a.card')].find(a=>a.getAttribute('href').includes('anthony-fox'));
          const explicit=document.querySelector('#edge-cards a[href*="one-bug-is-all-it-takes"] .card-image');
          const external=document.querySelector('#edge-cards a[target="_blank"]');
          const gallery=[...document.querySelectorAll('#image-cases a[data-image-overlay]')].map(a=>{
             const img=a.querySelector('img'), r=img.getBoundingClientRect();
             return {alignment:a.className, float:getComputedStyle(a).cssFloat,
                     width:r.width, height:r.height, natural_ratio:img.naturalWidth/img.naturalHeight,
                     image_ratio:r.width/r.height, fit:getComputedStyle(img).objectFit,
                     opacity:getComputedStyle(img).opacity};
          });
          return {fits_viewport:document.documentElement.scrollWidth<=innerWidth, grids, framed,
                  raw_and_converted_images_match:JSON.stringify(images('#raw-cards'))===JSON.stringify(images('#columns-3')),
                  name_only_has_no_fake_media:!absent.querySelector('.card-media,img'),
                  no_zoom_unwrapped:!document.querySelector('img.no-zoom').closest('a'),
                  explicit_contain_and_position:getComputedStyle(explicit).objectFit==='contain' && getComputedStyle(explicit).objectPosition==='100% 50%',
                  explicit_empty_alt_preserved:document.querySelector('#edge-cards a[href*="codasip"] img').getAttribute('alt')==='',
                  external_attributes:external.relList.contains('nofollow') && external.relList.contains('noopener') && external.relList.contains('noreferrer'),
                  where_next_count:document.querySelectorAll('section[aria-labelledby="where-next"] a.card').length,
                  where_next_has_no_description:!document.querySelector('section[aria-labelledby="where-next"] p'),
                  where_next_inferred_title:document.querySelector('section[aria-labelledby="where-next"] h3').textContent==='Robert Watson',
                  related_inferred_titles:[...document.querySelectorAll('section[aria-labelledby="related-pages"] h3')].map(n=>n.textContent),
                  card_images_do_not_zoom:![...document.querySelectorAll('.card-image')].some(i=>i.closest('[data-image-overlay]')),
                  gallery};
        }''')
        result.update({'width':width,'status':status})
        fixture_checks.append(result)
        if width in (375,1440):
            page.screenshot(path=str(OUT / ('components-' + str(width) + '.png')))
    for alignment in ['image-left','image-right','image-full']:
        trigger=page.locator('#image-cases a.'+alignment).first
        expected_caption=trigger.locator('img').get_attribute('data-caption')
        trigger.focus()
        page.keyboard.press('Enter')
        opened=page.locator('#image-dialog').evaluate('n=>n.open')
        caption=page.locator('#image-dialog-caption').inner_text()
        page.keyboard.press('Escape')
        flows.append({'flow':'fixture image '+alignment,'opened':opened,
                      'caption_preserved':caption==expected_caption,
                      'closed_on_escape':not page.locator('#image-dialog').evaluate('n=>n.open'),
                      'focus_returned':trigger.evaluate('n=>document.activeElement===n')})
    ready(page,fixture_url)
    card=page.locator('#columns-3 a.card').filter(has=page.locator('img')).first
    destination=card.get_attribute('href')
    card.focus()
    page.keyboard.press('Enter')
    page.wait_for_url('**'+destination)
    flows.append({'flow':'keyboard card navigation','followed_record':page.url.endswith(destination)})
    static.goto(fixture_url,wait_until='networkidle')
    flows.append({'flow':'no JavaScript component fixture','cards_visible':static.locator('#columns-3 a.card').count()==5,
                  'images_visible':static.locator('#columns-3 .card-image').count()==3,
                  'external_rel_preserved':static.locator('#edge-cards a[target="_blank"]').get_attribute('rel')=='nofollow noopener noreferrer'})
    browser.close()

report = {'observations': observations, 'baseline': baselines, 'comparisons': comparisons, 'project': project, 'flows': flows, 'fixture_checks': fixture_checks,
          'limits': ['17 representative routes, Chromium only; no claim of all-page or cross-browser coverage.',
                     'Source-body project asset failures remain recorded; shared theme requests checked separately.',
                     'No production slider exists yet. Source-body project-prefix URLs remain Phase 7 work.',
                     'External requests blocked; no forms submitted. Reference output alone uses local Poppins.']}
(OUT / 'browser.json').write_text(json.dumps(report, indent=2) + '\n')
print(json.dumps({'observations': len(observations),
                  'overflow': [r['route'] for r in observations if r['scroll_width'] > r['width']],
                  'comparisons': [{'theme': r['theme'], 'width': r['width'], 'differences': r['different_selectors'],
                                   'card_states_match': r['actual_card_states'] == r['reference_card_states']} for r in comparisons],
                  'project_failed_requests': [r['failed_requests'] for r in project], 'flows': flows, 'fixture_checks': fixture_checks}, indent=2))
assert all(r['status'] == 200 and r['scroll_width'] <= r['width'] and not r['js_errors'] for r in observations)
assert all(i['decoded'] and not i['faded_ancestors'] for r in observations for i in r['images'])
assert all(r['theme'] == ('dark' if r['route'] == '/' else 'light') for r in observations)
assert all({'400', '500', '600'} <= {f['weight'] for f in r['font_faces'] if f['status'] == 'loaded'} for r in observations + project)
assert all(not r['different_selectors'] and r['actual_card_states'] == r['reference_card_states'] for r in comparisons)
assert all(r['status'] == 200 and r['logo'].startswith('/cheri-preview/') and '/cheri-preview/assets/' in r['background'] for r in project)
assert all(v for r in flows for k, v in r.items() if isinstance(v, bool))

assert all(r['status']==200 and r['fits_viewport'] and r['raw_and_converted_images_match']
           and r['name_only_has_no_fake_media'] and r['no_zoom_unwrapped'] and r['explicit_contain_and_position']
           and r['explicit_empty_alt_preserved'] and r['external_attributes'] and r['where_next_count']==1 and r['where_next_has_no_description']
           and r['where_next_inferred_title'] and r['related_inferred_titles']==['Robert Watson','Anthony Fox']
           and r['card_images_do_not_zoom'] for r in fixture_checks)
assert all(g['actual']==(g['requested'] if r['width']>=768 else 1) for r in fixture_checks for g in r['grids'])
assert all(abs(f['expected']-f['actual'])<0.01 and f['image_fills_frame'] for r in fixture_checks for f in r['framed'])
assert all(abs(g['natural_ratio']-g['image_ratio'])<0.01 and g['opacity']=='1' for r in fixture_checks for g in r['gallery'])
