#!/usr/bin/env python3
"""Phase 7 Chromium: SITE REFERENCE_SITE PROJECT_PARENT. External requests blocked."""
import ast
from contextlib import contextmanager
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import json
from pathlib import Path
import sys
import threading
from playwright.sync_api import sync_playwright

OUT = Path(__file__).with_name('evidence')
from browser_support import serve, ready, OBSERVE, STYLE
PROPS = {'.slider': ['marginTop'], '.slide-link': ['padding', 'gap', 'gridTemplateColumns', 'backgroundColor', 'color'],
    '.slide-copy h2': ['fontFamily', 'fontWeight', 'fontSize', 'lineHeight'], '.slide-media': ['aspectRatio'],
    '.slide-image': ['objectFit', 'opacity'], '.slider-controls': ['display', 'marginTop', 'gap'],
    '.slider-dot': ['minWidth', 'minHeight', 'color']}
views, parity, carousel, redirects, fallbacks, keyboard = [], [], [], [], [], []


def selected(page):
    return page.locator('.slider-dot[aria-current=true]').get_attribute('data-slide')


with serve(sys.argv[1]) as site, serve(sys.argv[2]) as reference, serve(sys.argv[3]) as project, sync_playwright() as p:
    browser = p.chromium.launch(executable_path='/usr/bin/chromium', args=['--no-sandbox'])
    ctx = browser.new_context(reduced_motion='reduce')
    ctx.route('**/*', lambda r: r.continue_() if r.request.url.startswith(('http://127.0.0.1:', 'data:')) else r.abort())
    page = ctx.new_page()
    errors = []
    page.on('pageerror', lambda e: errors.append(str(e)))
    for origin, prefix in [(site, ''), (project, '/cheri-preview')]:
        for route in ['/', '/404.html', '/events/cheri-blossoms-conference-2026/', '/news/one-bug-is-all-it-takes/',
                      '/people/robert-watson/', '/reference/CHERI-seL4-Exercises/print.html', '/reference/linux-roadmap/print.html']:
            status = ready(page, origin + prefix + route)
            for width in [375, 768, 1024, 1440]:
                page.set_viewport_size({'width': width, 'height': 1000})
                views.append({'route': prefix + route, 'status': status, **page.evaluate(OBSERVE), 'js_errors': list(errors)})
    for width in [375, 768, 1024, 1440]:
        page.set_viewport_size({'width': width, 'height': 1000})
        ready(page, site + '/')
        actual = page.evaluate(STYLE, PROPS)
        dimensions = page.locator('.slider').bounding_box()
        page.locator('.slider').screenshot(path=str(OUT / f'slider-{width}.png'))
        heights = []
        for i in [0, 1]:
            page.locator('.slider-dot').nth(i).click()
            heights.append(page.locator('.slider-track').bounding_box()['height'])
        carousel.append({'case': 'stable height', 'width': width, 'heights': heights, 'correct': abs(heights[0] - heights[1]) < 1})
        ready(page, reference + '/real-slider/')
        expected = page.evaluate(STYLE, PROPS)
        reference_dimensions = page.locator('.slider').bounding_box()
        page.locator('.slider').screenshot(path=str(OUT / f'zip-slider-{width}.png'))
        parity.append({'width': width, 'actual': actual, 'reference': expected, 'correct': actual == expected,
            'size_equal': all(abs(dimensions[k] - reference_dimensions[k]) < 1 for k in ['width', 'height'])})
    page.emulate_media(reduced_motion='no-preference')
    ready(page, site + '/')
    value = selected(page); page.wait_for_timeout(5200)
    carousel.append({'case': 'five-second autoplay', 'correct': selected(page) != value})
    page.locator('.slider-dot').nth(1).click(); value = selected(page); page.wait_for_timeout(5200)
    carousel.append({'case': 'original persistent-dot playback', 'correct': selected(page) != value})
    page.keyboard.press('Tab'); page.locator('.slide:not([hidden]) a').focus()
    visible = page.locator('.slide:not([hidden]) a').evaluate('n=>n.matches(":focus-visible")')
    value = selected(page); page.wait_for_timeout(5200)
    carousel.append({'case': 'keyboard slide focus pauses', 'correct': visible and selected(page) == value})
    page.locator('main').focus(); page.wait_for_timeout(5200)
    carousel.append({'case': 'focus departure resumes', 'correct': selected(page) != value})
    page.evaluate("Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'))")
    value = selected(page); page.wait_for_timeout(5200)
    carousel.append({'case': 'hidden-document simulation pauses', 'correct': selected(page) == value})
    page.evaluate("delete document.hidden;document.dispatchEvent(new Event('visibilitychange'))"); page.wait_for_timeout(5200)
    carousel.append({'case': 'visibility restored resumes', 'correct': selected(page) != value})
    page.emulate_media(reduced_motion='reduce'); value = selected(page); page.wait_for_timeout(5200)
    carousel.append({'case': 'reduced motion stops autoplay', 'correct': selected(page) == value})
    for i in [0, 1]:
        ready(page, site + '/'); page.locator('.slider-dot').nth(i).click()
        link = page.locator('.slide:not([hidden]) a'); target = link.get_attribute('href')
        page.keyboard.press('Tab'); link.focus(); link.press('Enter'); page.wait_for_url(site + target)
        keyboard.append({'slide': i, 'target': target, 'correct': page.url == site + target})
    examples = json.loads((Path(__file__).parents[1] / 'codex-phases/phase-07-evidence/redirect-provenance.json').read_text())['added']
    samples = [next(r for r in examples if r['route'].startswith(start)) for start in
               ['/members/', '/member/', '/build/developers/', '/who-we-are/working-groups/', '/CHERI-seL4-Exercises/']]
    for origin, prefix in [(site, ''), (project, '/cheri-preview')]:
        for r in samples:
            page.goto(origin + prefix + r['route']); page.wait_for_url(origin + prefix + r['target'])
            redirects.append({'route': prefix + r['route'], 'target': prefix + r['target'], 'correct': page.url == origin + prefix + r['target']})
        old = '/members/codasip/?from=bookmark#page-hero-title'
        target = '/organisations/codasip/?from=bookmark#page-hero-title'
        page.goto(origin + prefix + old); page.wait_for_url(origin + prefix + target)
        redirects.append({'route': prefix + old, 'target': prefix + target, 'correct': page.url == origin + prefix + target})
        for route, old, target in [('/events/cheri-blossoms-conference-2026/', 'recordings-slides', 'recordings--slides'),
                                   ('/events/cybersecurity-by-design-conference-2024/', 'talks', 'talks--slides')]:
            ready(page, origin + prefix + route + '#' + old)
            redirects.append({'route': prefix + route + '#' + old, 'correct': page.locator('#' + old).count() == page.locator('#' + target).count() == 1})
    nojs = browser.new_context(java_script_enabled=False)
    nojs.route('**/*', lambda r: r.continue_() if r.request.url.startswith(('http://127.0.0.1:', 'data:')) else r.abort())
    static = nojs.new_page()
    for origin, prefix in [(site, ''), (project, '/cheri-preview')]:
        for width in [375, 1440]:
            static.set_viewport_size({'width': width, 'height': 1000}); static.goto(origin + prefix + '/')
            fallbacks.append({'prefix': prefix, 'width': width, 'correct': static.locator('.slide').first.is_visible()
                and not static.locator('.slide').nth(1).is_visible() and not static.locator('.slider-controls').is_visible()
                and static.locator('.slide').first.locator('a').get_attribute('href') == prefix + '/events/cheritech26/'})
        r = samples[0]; static.goto(origin + prefix + r['route']); static.wait_for_url(origin + prefix + r['target'])
        fallbacks.append({'prefix': prefix, 'case': 'static redirect without JavaScript', 'correct': static.url == origin + prefix + r['target']})
    nojs.close(); ctx.close(); browser.close()
result = {'views': views, 'slider_parity': parity, 'carousel': carousel, 'redirects': redirects, 'no_javascript': fallbacks, 'keyboard_ctas': keyboard}
(OUT / 'carousel-and-redirect-browser.json').write_text(json.dumps(result, indent=2) + '\n')
assert all(r['status'] == 200 and r['h1'] == 1 and r['scroll_width'] <= r['width'] + 1 and not r['js_errors']
           and all(i['decoded'] and not i['faded'] for i in r['images']) for r in views), 'See browser view evidence'
assert all(r['correct'] for r in parity + carousel + redirects + fallbacks + keyboard)
assert all(r['size_equal'] for r in parity)
print(f'{len(views)} responsive root/project views, {len(parity)} ZIP slider comparisons, {len(carousel)} carousel checks, '
      f'{len(redirects)} redirect/anchor checks, {len(fallbacks)} no-JS checks and {len(keyboard)} slider CTAs pass.')
