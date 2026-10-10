#!/usr/bin/env python3
"""Baseline browser observations; no production files or external services edited.

python3 reports/codex-phases/browser_phase00.py SITE REFERENCE_SITE
Requires Playwright and Chromium. Screenshots are optional local evidence in /tmp.
"""
import json
import sys
import threading
from contextlib import contextmanager
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from playwright.sync_api import sync_playwright

OUT = Path(__file__).resolve().parent / 'phase-00-evidence'

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

routes = ['/', '/alliance/leadership/governing-board/', '/alliance/leadership/members/',
          '/news-and-events/people-and-opportunities/speakers/', '/people/robert-watson/',
          '/people/anthony-fox/', '/organisations/codasip/', '/news/one-bug-is-all-it-takes/',
          '/news/beyond-software-patching/', '/events/cheri-blossoms-conference-2026/',
          '/papers/cheri-concentrate-practical-compressed-capabilities/',
          '/build/platforms/platform-comparison/', '/alliance/membership/contact/',
          '/news-and-events/news-and-analysis/subscribe-newsletter/']
widths = [375, 768, 1024, 1440]
selectors = {'body': ['fontFamily', 'fontSize', 'lineHeight', 'color', 'backgroundColor'],
             'body::before': ['opacity', 'backgroundRepeat', 'backgroundSize'],
             'header': ['backgroundColor', 'paddingLeft', 'paddingRight'],
             '.brand img': ['maxWidth', 'height'],
             'main': ['backgroundColor', 'maxWidth', 'paddingLeft', 'paddingRight'],
             '.hero': ['backgroundColor', 'paddingLeft', 'paddingRight', 'paddingTop', 'paddingBottom'],
             '.hero h1': ['fontFamily', 'fontSize', 'fontWeight', 'lineHeight', 'letterSpacing', 'color'],
             '.hero-intro > p': ['fontSize', 'lineHeight', 'color'],
             '.card': ['backgroundColor', 'paddingLeft', 'paddingRight'],
             'footer': ['backgroundColor', 'color']}
styles_js = '''selectors => Object.fromEntries(Object.entries(selectors).map(([selector, properties]) => {
 const pseudo = selector.endsWith('::before') ? '::before' : null;
 const node = document.querySelector(selector.replace('::before',''));
 if (!node) return [selector, null];
 const s = getComputedStyle(node, pseudo);
 return [selector, Object.fromEntries(properties.map(p => [p,s[p]]))];
}))'''
results = []
comparisons = []
flows = []
with serve(sys.argv[1]) as site, serve(sys.argv[2]) as reference, sync_playwright() as p:
    browser = p.chromium.launch(executable_path='/usr/bin/chromium', headless=True, args=['--no-sandbox'])
    context = browser.new_context()
    context.route('**/*', lambda route: route.continue_() if route.request.url.startswith(('http://127.0.0.1:', 'data:')) else route.abort())
    page = context.new_page()
    errors = []
    page.on('pageerror', lambda e: errors.append(str(e)))
    for route in routes:
        page.set_viewport_size({'width': 1440, 'height': 1000})
        errors.clear()
        response = page.goto(site + route, wait_until='networkidle')
        page.locator('img[loading=lazy]').evaluate_all('imgs=>imgs.forEach(i=>i.loading="eager")')
        page.wait_for_function('[...document.images].every(i=>i.complete)')
        page.evaluate('document.fonts.ready')
        for width in widths:
            page.set_viewport_size({'width': width, 'height': 1000})
            page.wait_for_timeout(80)
            result = page.evaluate('''() => {
              const faded = [...document.images].filter(i => {
                let n=i; while(n) { if(parseFloat(getComputedStyle(n).opacity)<1) return true; n=n.parentElement; } return false;
              }).map(i=>i.getAttribute('src'));
              return {overflow: document.documentElement.scrollWidth>innerWidth,
                h1_count: document.querySelectorAll('main h1').length,
                body_theme: document.body.dataset.theme,
                broken_images: [...document.images].filter(i=>i.naturalWidth===0).map(i=>i.getAttribute('src')),
                faded_images: faded, poppins_loaded: [...document.fonts].some(f=>f.family.includes('Poppins') && f.status==='loaded'),
                square_portraits: document.querySelectorAll('main img.image-square').length,
                native_where_next: document.querySelectorAll('#where-next').length,
                native_sliders: document.querySelectorAll('.slider').length,
                active_form_elements: document.querySelectorAll('form[action],button[type=submit]:not([disabled])').length
              };
            }''')
            results.append({'route': route, 'width': width, 'http_status': response.status, **result, 'javascript_errors': list(errors)})
        if route in ['/', '/people/robert-watson/', '/alliance/leadership/governing-board/']:
            page.screenshot(path='/tmp/phase00-' + (route.strip('/').replace('/', '-') or 'home') + '.png')

    for theme, actual_route, expected_route in [('dark', '/', '/'), ('light', '/news/beyond-software-patching/', '/discover/')]:
        for width in widths:
            page.set_viewport_size({'width': width, 'height': 1000})
            page.goto(site + actual_route, wait_until='networkidle')
            actual = page.evaluate(styles_js, selectors)
            page.goto(reference + expected_route, wait_until='networkidle')
            expected = page.evaluate(styles_js, selectors)
            comparisons.append({'theme': theme, 'width': width, 'actual': actual, 'reference': expected,
                                'different_selectors': [s for s in selectors if actual[s] != expected[s]]})

    page.set_viewport_size({'width': 375, 'height': 900})
    page.goto(site + '/', wait_until='networkidle')
    hamburger = page.locator('#hamburger')
    hamburger.focus(); page.keyboard.press('Enter')
    opened = hamburger.get_attribute('aria-expanded') == 'true'
    toggle = page.locator('header .submenu-toggle').first
    toggle.focus(); page.keyboard.press('Enter')
    submenu = toggle.get_attribute('aria-expanded') == 'true'
    page.keyboard.press('Escape')
    flows.append({'flow': 'keyboard mobile navigation', 'menu_opened': opened, 'submenu_opened': submenu,
                  'submenu_closed_on_escape': toggle.get_attribute('aria-expanded') == 'false'})

    page.goto(site + '/people/robert-watson/', wait_until='networkidle')
    trigger = page.locator('a[data-image-overlay]').first
    trigger.click()
    opened = page.locator('#image-dialog').evaluate('(n)=>n.open')
    page.keyboard.press('Escape')
    flows.append({'flow': 'image dialog', 'opened': opened,
                  'closed_on_escape': not page.locator('#image-dialog').evaluate('(n)=>n.open'),
                  'focus_returned': trigger.evaluate('(n)=>document.activeElement===n')})
    nojs = browser.new_context(java_script_enabled=False)
    nojs.route('**/*', lambda route: route.continue_() if route.request.url.startswith(('http://127.0.0.1:', 'data:')) else route.abort())
    static = nojs.new_page()
    for route in ['/people/', '/alliance/leadership/members/', '/alliance/membership/contact/', '/news-and-events/news-and-analysis/subscribe-newsletter/']:
        response = static.goto(site + route, wait_until='networkidle')
        flows.append({'flow': 'no JavaScript', 'route': route, 'http_status': response.status,
                      'visible_main': static.locator('main').is_visible(),
                      'cards': static.locator('[data-collection-index] a.card').count(),
                      'submitting_forms': static.locator('form[action],button[type=submit]:not([disabled])').count()})
    browser.close()

report = {'observations': results, 'style_comparisons': comparisons, 'flows': flows,
          'limits': ['14 representative routes, not every page.', 'Production slider has no data: autoplay/reduced-motion/hidden-tab behavior untestable.',
                     'No form submitted. External browser requests blocked.', 'ZIP reference output uses the same local Poppins; original archive remains unchanged.']}
(OUT / 'browser.json').write_text(json.dumps(report, indent=2) + '\n')
print(json.dumps({'observations': len(results), 'overflow': [r for r in results if r['overflow']],
                  'broken_image_observations': sum(bool(r['broken_images']) for r in results),
                  'faded_image_observations': sum(bool(r['faded_images']) for r in results),
                  'comparisons': [{'theme': r['theme'], 'width': r['width'], 'different_selectors': r['different_selectors']} for r in comparisons],
                  'flows': flows}, indent=2))
