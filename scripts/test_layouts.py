#!/usr/bin/env python3
"""Check the site container, homepage-only dark palette and navigation disclosures."""
import json
import os
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
URL = os.environ.get('SITE_URL', 'http://127.0.0.1:4200/').rstrip('/') + '/'
OUT = Path(os.environ.get('REPORT_ROOT', ROOT / 'reports/layout-fixes/after'))
OUT.mkdir(parents=True, exist_ok=True)
ROUTES = {
    'home': '',
    'page': 'discover/understand/how-does-cheri-work/',
    'news': 'news/ai-doesnt-need-a-kill-switch-it-needs-boundaries/',
    'directory': 'people/?view=list',
    'detail': 'people/mike-eftimakis/',
}
results = []


def ready(page):
    page.evaluate('document.fonts.ready')
    page.evaluate('''async () => {
      await Promise.all([...document.images].filter(i => {
        const r = i.getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight;
      }).map(i => i.decode().catch(() => {})));
    }''')


with sync_playwright() as p:
    options = {'headless': True, 'args': ['--no-sandbox']}
    if os.environ.get('CHROMIUM_EXECUTABLE'):
        options['executable_path'] = os.environ['CHROMIUM_EXECUTABLE']
    browser = p.chromium.launch(**options)
    context = browser.new_context(color_scheme='dark')
    # A preference left by the removed toggle must not affect any route.
    context.add_init_script("if (!localStorage.getItem('cheri-theme')) localStorage.setItem('cheri-theme', 'light')")
    page = context.new_page()
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    for width in [320, 390, 768, 999, 1000, 1280, 1600, 1920]:
        page.set_viewport_size({'width': width, 'height': 1000 if width >= 1000 else 844})
        for name, route in ROUTES.items():
            response = page.goto(URL + route)
            assert response.status == 200, route
            ready(page)
            data = page.evaluate('''() => {
              const box = s => { const e = document.querySelector(s), r = e.getBoundingClientRect(), c = getComputedStyle(e);
                return {left:r.left, right:r.right, width:r.width, paddingLeft:parseFloat(c.paddingLeft), paddingRight:parseFloat(c.paddingRight)}; };
              const watermark = getComputedStyle(document.body, '::before');
              return {viewport:document.documentElement.clientWidth, overflow:document.documentElement.scrollWidth > innerWidth + 1,
                theme:document.body.dataset.theme, header:box('.site-header'), headerInner:box('.site-header-inner'),
                footer:box('.site-footer'), footerInner:box('.site-footer > .site-container'), main:box('main'),
                content:box('main .content'), watermark:{display:watermark.display, opacity:watermark.opacity, image:watermark.backgroundImage}};
            }''')
            assert not data['overflow'], (width, name, data)
            for surface in ['header', 'footer']:
                assert abs(data[surface]['left']) < 1 and abs(data[surface]['right'] - data['viewport']) < 1, (width, name, surface, data)
                inner = data[surface + 'Inner']
                assert abs(inner['left'] + inner['paddingLeft'] - data['main']['left'] - data['main']['paddingLeft']) < 1, (width, name, surface, data)
                assert abs(inner['width'] - data['main']['width']) < 1, (width, name, surface, data)
            if name in ['page', 'news']:
                available = data['main']['width'] - data['main']['paddingLeft'] - data['main']['paddingRight']
                assert abs(data['content']['width'] - available) < 1, (width, name, data)
                assert abs(data['content']['left'] - data['main']['left'] - data['main']['paddingLeft']) < 1, (width, name, data)
            assert data['theme'] == ('dark' if name == 'home' else 'light'), (name, data)
            assert page.locator('[data-theme-toggle], .theme-toggle').count() == 0
            if name == 'home':
                page.evaluate("localStorage.setItem('cheri-theme', 'dark')")
            assert data['watermark']['display'] != 'none' and float(data['watermark']['opacity']) > .1
            suffix = 'dark' if name == 'home' else 'light'
            assert f'hexagons-{suffix}.webp' in data['watermark']['image']
            image_url = data['watermark']['image'].split('"')[1]
            assert page.request.get(image_url).status == 200, image_url
            assert page.locator('.brand img').evaluate('(img) => img.complete && img.naturalWidth > 0')
            assert page.locator('h1').count() == 1
            if name == 'home':
                assert page.locator('h1').inner_text().splitlines() == ['Software runs our world.', 'It deserves stronger security foundations.', 'Enabled by CHERI.']
                assert page.locator('.hero-intro .lede').count() == 2
                assert page.locator('[data-section-cards]').count() == 2
                assert page.locator('[data-section-cards] > section').count() == 5
                assert page.locator('.slider .slide').count() == 2
                assert '<br>' not in page.locator('h1').inner_text()
                frame = page.locator('.hero').evaluate('''e=>{const s=getComputedStyle(e),slider=getComputedStyle(document.querySelector('.slide-link'));return {
                  top:s.borderTopLeftRadius,bottom:s.borderBottomLeftRadius,border:s.borderBottomWidth,
                  left:s.borderLeftWidth,right:s.borderRightWidth,colour:s.borderBottomColor,sliderColour:slider.borderColor}}''')
                assert frame['top'] == '0px' and frame['bottom'] == '0px' and frame['left'] == '0px' and frame['right'] == '0px', (width,frame)
                assert frame['border'] == '1px', (width,frame)
                assert page.locator('.slide-link').evaluate_all("ns=>ns.every(e=>getComputedStyle(e).borderTopWidth==='0px')"), 'Feature cards are borderless'
            results.append({'width': width, 'route': name, 'layout': data})
            if width in [390, 1600]:
                device = 'mobile' if width == 390 else 'desktop'
                # Load lazy editorial images before taking full-page evidence.
                page.evaluate("document.querySelectorAll('img[loading=lazy]').forEach(i=>i.loading='eager')")
                page.evaluate('''async()=>{await Promise.race([Promise.all([...document.images].map(i=>i.decode().catch(()=>{}))), new Promise(resolve=>setTimeout(resolve,5000))])}''')
                page.screenshot(path=str(OUT / f'{device}-{name}.png'), full_page=True)
                if name == 'home':
                    page.screenshot(path=str(OUT / f'{device}-home-top.png'))
            # Triangles, expanded state and keyboard focus stay in sync at every size.
            page.mouse.move(0, 800)
            hamburger = page.locator('#hamburger')
            if hamburger.is_visible():
                hamburger.focus(); page.keyboard.press('Enter')
                assert hamburger.get_attribute('aria-expanded') == 'true'
            trigger = page.locator('#primary-navigation > ul > li > .submenu-toggle').first
            indicator = trigger.locator('.menu-indicator')
            assert indicator.get_attribute('aria-hidden') == 'true'
            assert indicator.inner_text() == '▼'
            trigger.focus(); page.keyboard.press('Enter')
            assert trigger.get_attribute('aria-expanded') == 'true' and indicator.inner_text() == '▲'
            menu = page.locator('#' + trigger.get_attribute('aria-controls'))
            assert menu.is_visible()
            assert not page.evaluate('document.documentElement.scrollWidth > innerWidth + 1'), f'Open navigation overflows at {width}px on {name}'
            if width == 390:
                group = menu.locator('.menu-group-toggle').first
                group.focus(); page.keyboard.press('Space')
                assert group.get_attribute('aria-expanded') == 'true'
                assert group.locator('.menu-indicator').inner_text() == '▲'
                page.keyboard.press('Escape')
                assert group.get_attribute('aria-expanded') == 'false'
            trigger.focus(); page.keyboard.press('Escape')
            assert trigger.get_attribute('aria-expanded') == 'false' and indicator.inner_text() == '▼'
            assert trigger.evaluate('(e) => document.activeElement === e')
            assert trigger.evaluate('(e) => getComputedStyle(e).outlineStyle') != 'none'
    # Home links, grouped content and correct page themes also work without scripts.
    plain_context = browser.new_context(java_script_enabled=False, color_scheme='light', viewport={'width':390,'height':844})
    plain = plain_context.new_page()
    plain.goto(URL)
    assert plain.locator('body').get_attribute('data-theme') == 'dark'
    assert plain.locator('[data-section-cards] > section').count() == 5
    plain.goto(URL + ROUTES['news'])
    assert plain.locator('body').get_attribute('data-theme') == 'light'
    assert plain.locator('main .content').is_visible()
    assert not errors, errors
    browser.close()

(OUT / 'results.json').write_text(json.dumps(results, indent=2) + '\n')
print(json.dumps({'layout_checks':len(results), 'viewport_widths':[320,390,768,999,1000,1280,1600,1920], 'screenshots':len(list(OUT.glob('*.png'))), 'navigation':'passed: Unicode indicators, keyboard expansion, Escape, visible focus', 'themes':'homepage only; ignores stored preference and OS theme'}))
