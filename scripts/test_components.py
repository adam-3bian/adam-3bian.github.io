#!/usr/bin/env python3
"""Measure shared component geometry; audit mode records the same pre-change views."""
import json
import os
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
URL = os.environ.get('SITE_URL', 'http://127.0.0.1:4200/').rstrip('/') + '/'
OUT = Path(os.environ.get('REPORT_ROOT', ROOT / 'reports/components/after'))
AUDIT = os.environ.get('AUDIT_ONLY') == '1'
OUT.mkdir(parents=True, exist_ok=True)
ROUTES = {
    'home': '', 'discover': 'discover/', 'adopt': 'adopt/', 'build': 'build/',
    'alliance': 'alliance/', 'news-category': 'news-and-events/',
    'members': 'alliance/leadership/members/?view=list',
    'member': 'organisations/codasip/', 'speakers': 'people/?view=grid',
    'speaker': 'people/alastair-beresford/',
    'news': 'news-and-events/news-and-analysis/latest-news/',
    'article': 'news/ai-doesnt-need-a-kill-switch-it-needs-boundaries/',
    'events': 'news-and-events/events-and-archive/upcoming-events/',
    'event': 'events/cheritech26/', 'product': 'products/sonata/',
    'repository': 'repositories/cheribsd/', 'papers': 'papers/',
    'guide': 'guides/choose-a-platform/', 'group': 'groups/cheri-zephyr/',
    'glossary': 'discover/resources/glossary/',
    'contact': 'alliance/membership/contact/',
    'newsletter': 'news-and-events/news-and-analysis/subscribe-newsletter/',
}
results = []
with sync_playwright() as p:
    browser = p.chromium.launch(executable_path=os.environ.get('CHROMIUM_EXECUTABLE'), args=['--no-sandbox'])
    page = browser.new_page(reduced_motion='reduce')
    for width in [320, 375, 390, 430, 768, 1024, 1440, 1920]:
        page.set_viewport_size({'width': width, 'height': 900})
        for name, route in ROUTES.items():
            assert page.goto(URL + route).status == 200, route
            page.evaluate('document.fonts.ready')
            data = page.evaluate('''() => {
              const box = e => {const r=e.getBoundingClientRect(),s=getComputedStyle(e);return {
                x:r.x,y:r.y,width:r.width,height:r.height,right:r.right,bottom:r.bottom,
                padding:s.padding,margin:s.margin,display:s.display,gap:s.gap,radius:s.borderTopLeftRadius,contentX:r.x+parseFloat(s.paddingLeft)+parseFloat(s.borderLeftWidth),contentWidth:r.width-parseFloat(s.paddingLeft)-parseFloat(s.paddingRight)-parseFloat(s.borderLeftWidth)-parseFloat(s.borderRightWidth)};};
              const one=s=>{const e=document.querySelector(s);return e?box(e):null;};
              return {overflow:document.documentElement.scrollWidth>innerWidth+1,
                main:one('main'),header:one('.site-header'),newsletter:one('.site-call-to-action'),
                slider:one('.slider'),surface:one('.page-surface'),hero:one('.hero,.page-heading'),subscription:one('.promotional-panel'),footer:one('.footer-surface'),breadcrumbBand:one('.breadcrumb-band'),headingCopy:one('.page-heading .heading-copy'),heading:one('.page-heading'),breadcrumbs:one('.breadcrumbs'),body:one('.record-body'),aside:one('.detail-aside'),
                article:one('.reading-content'),lead:one('.article-lead'),
                category:one('.category-links'),cards:[...document.querySelectorAll('.catalog-card')].slice(0,8).map(e=>({
                  ...box(e),copy:box(e.querySelector('.catalog-copy')),title:box(e.querySelector('h2,h3')),
                  logo:e.querySelector('.media-organisations')?box(e.querySelector('.media-organisations')):null,
                  footer:e.querySelector('.catalog-footer')?box(e.querySelector('.catalog-footer')):null})),
                sections:[...document.querySelectorAll('main > article,main > section')].map(box)};
            }''')
            results.append({'width': width, 'route': name, 'geometry': data})
            if not AUDIT:
                assert not data['overflow'], (width, name, 'page overflow')
                assert page.locator('a a,a button,button a').count() == 0, (width, name, 'nested controls')
                assert page.locator('h1').count() == 1
                assert abs(data['subscription']['y'] - data['main']['bottom'] - 16) < 1, (width, name, 'subscription panel gap')
                assert abs(data['footer']['y'] - data['subscription']['bottom'] - 16) < 1, (width, name, 'footer panel gap')
                for region in ['hero', 'surface', 'subscription', 'footer']:
                    assert abs(data[region]['x'] - data['main']['contentX']) < 1, (width, name, region, 'shared left bound')
                    assert abs(data[region]['width'] - data['main']['contentWidth']) < 1, (width, name, region, 'shared width')
                assert data['surface']['radius'] == '32px'
                if data['slider']:
                    assert data['slider']['x'] >= data['surface']['contentX'] - 1
                    assert data['slider']['right'] <= data['surface']['contentX'] + data['surface']['contentWidth'] + 1
                    assert data['slider']['y'] > data['surface']['y'] and data['slider']['bottom'] < data['surface']['bottom']
                if data['breadcrumbBand']:
                    assert data['breadcrumbBand']['x'] == 0 and data['breadcrumbBand']['width'] == width
                    assert page.locator('main .breadcrumbs').count() == 0
                band_bottom = data['breadcrumbBand']['bottom'] if data['breadcrumbBand'] else data['header']['bottom']
                assert abs(data['hero']['y'] - band_bottom - 16) < 1, (width, name, 'hero gap', data['hero']['y'], band_bottom)
                assert abs(data['surface']['y'] - data['hero']['bottom'] - 16) < 1, (width, name, 'content gap')
                if data['body'] and data['aside'] and width < 1024:
                    assert abs(data['body']['width'] - data['surface']['contentWidth']) < 1
                    assert data['aside']['bottom'] <= data['body']['y'] + 1
                if name == 'article':
                    for element in ['headingCopy', 'lead']:
                        assert abs(data[element]['x'] - data['article']['x']) < 1, (width, name, element, 'left alignment')
                        assert abs(data[element]['width'] - data['article']['width']) < 1
                if name == 'members':
                    for card in data['cards']:
                        if not card['logo']:
                            continue
                        assert card['copy']['display'] != 'contents'
                        if width < 480:
                            assert card['title']['y'] >= card['logo']['bottom'] + 11
                        else:
                            assert card['title']['x'] >= card['logo']['right'] + 11
                        assert card['title']['right'] <= card['right'] - 15
                        if width < 768 and card['footer']:
                            assert card['footer']['y'] >= card['title']['bottom'] - 1
                        assert card['padding'] == '24px', (width, name, card)
                if data['category']:
                    assert page.locator('.category-links').evaluate_all("ns=>ns.every(e=>{const s=getComputedStyle(e);return s.padding==='0px'&&s.margin==='0px'&&s.listStyleType==='none'})")
                    assert page.locator('.category-links:not([role=list])').count() == 0
                    columns = page.locator('.category-sections').evaluate("e=>{const s=getComputedStyle(e);return {actual:s.gridTemplateColumns.split(' ').length,configured:Number(s.getPropertyValue('--category-columns'))}}")
                    assert columns['actual'] == (1 if width < 768 else 2 if width < 1024 else columns['configured']), (width, name, columns)
                for action in page.locator('.detail-aside .resource-panel a').all():
                    assert 'button' in action.get_attribute('class').split()
                    assert action.evaluate("e=>e.getBoundingClientRect().height>=48")
                    action.focus()
                    assert action.evaluate("e=>getComputedStyle(e).outlineStyle!=='none'")
                    action.evaluate('e=>e.blur()')
                if name in ['contact', 'newsletter']:
                    form = page.locator('.form-panel form')
                    assert form.count() == 1 and form.locator('input:not([type=hidden])').count() > 0
                    assert page.locator('.form-panel a[href*="cheri-alliance.org"],.form-panel a[href*="kit.com"]').count() == 0
                    # The intentional unconfigured mode has no submission path, even without JS.
                    assert form.locator('button[type=submit][disabled][hidden]').count() == 1
                    assert form.locator('button[type=button]:visible').count() == 1
                    assert form.get_attribute('action') is None
            if width in [390, 768, 1440] and name in ['home', 'members', 'article', 'event', 'build', 'contact']:
                page.evaluate("document.querySelectorAll('img').forEach(i=>i.loading='eager')")
                page.evaluate("async()=>{await Promise.all([...document.images].map(i=>i.decode().catch(()=>{})))}")
                page.screenshot(path=str(OUT / f'{width}-{name}.png'), full_page=True)
                page.screenshot(path=str(OUT / f'{width}-{name}-top.png'))
                if name == 'members':
                    page.locator('.catalog-item').first.screenshot(path=str(OUT / f'{width}-member-card.png'))
    browser.close()
(OUT / 'geometry.json').write_text(json.dumps(results, indent=2) + '\n')
print(f'{"Before audit" if AUDIT else "Component acceptance"}: {len(results)} responsive views; screenshots and measured geometry in {OUT}')
