#!/usr/bin/env python3
"""Compare index/footer navigation rows with the real mega-menu contract."""
import json
import os
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
URL = os.environ.get('SITE_URL', 'http://127.0.0.1:4200/').rstrip('/') + '/'
OUT = Path(os.environ.get('REPORT_ROOT', ROOT / 'reports/menu-rows'))
OUT.mkdir(parents=True, exist_ok=True)
AXE = Path(os.environ['AXE_PATH'])
STYLE = '''e=>{const s=getComputedStyle(e),r=e.getBoundingClientRect();return {
  font:s.fontFamily,size:s.fontSize,weight:s.fontWeight,line:s.lineHeight,
  radius:s.borderRadius,padding:s.padding,shadow:s.boxShadow,border:s.borderTopWidth,
  background:s.backgroundColor,colour:s.color,decoration:s.textDecorationLine,
  width:r.width,height:r.height,parentWidth:e.parentElement.getBoundingClientRect().width,
  outline:s.outlineStyle,minimum:s.minHeight};}'''
CONTRACT = ['font','size','weight','line','radius','shadow','border','minimum']
results = []
audits = 0
with sync_playwright() as p:
    browser = p.chromium.launch(executable_path=os.environ.get('CHROMIUM_EXECUTABLE'), args=['--no-sandbox'])
    page = browser.new_page(viewport={'width':1440,'height':1000}, reduced_motion='reduce')
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    page.goto(URL + 'news-and-events/')
    page.locator('.site-header nav > ul > li.has-megamenu > button').filter(has_text='News & Events').click()
    reference = page.locator('.megamenu a:visible').first
    normal = reference.evaluate(STYLE)
    reference.hover()
    highlight = reference.evaluate(STYLE)
    for width in [320,390,768,1024,1440,1920]:
        page.set_viewport_size({'width':width,'height':1000})
        for route in ['', 'news-and-events/', 'alliance/', 'adopt/', 'build/', 'discover/']:
            assert page.goto(URL + route).status == 200
            page.evaluate('document.fonts.ready')
            assert not page.evaluate('document.documentElement.scrollWidth > innerWidth+1'), (width,route,'overflow')
            assert page.locator('.category-links .card, .category-links .button').count()==0
            for scope in ['.category-links', '.footer-navigation']:
                rows = page.locator(scope + ' a')
                if not rows.count():
                    continue
                assert rows.evaluate_all('ns=>ns.every(n=>n.matches(".menu-link"))')
                for row in rows.all():
                    data = row.evaluate(STYLE)
                    assert all(data[key]==normal[key] for key in CONTRACT), (width,route,scope,'Shared menu typography and shape',normal,data)
                    assert abs(data['width']-data['parentWidth'])<1 and data['height']>=float(normal['minimum'].removesuffix('px')), (width,route,scope,data)
                row = rows.first
                page.mouse.move(0,0)
                rest = row.evaluate(STYLE)
                row.hover()
                hover = row.evaluate(STYLE)
                expected = ('rgb(16, 52, 69)' if route=='' else 'rgb(16, 70, 91)') if scope=='.footer-navigation' else highlight['background']
                assert hover['background']==expected and hover['shadow']=='none' and hover['decoration']=='none', (width,route,scope,hover)
                assert hover['colour']==rest['colour'], (width,route,scope,'Keep the existing palette')
                row.focus()
                focused = row.evaluate(STYLE)
                assert focused['background']==expected and focused['outline']!='none' and focused['decoration']=='none'
                if width>=1024:
                    assert rest['padding']==normal['padding'], (scope,rest,normal)
                row.evaluate('e=>e.blur()')
                page.mouse.move(0,0)
            if width in [390,1440] and route=='news-and-events/':
                for selector,name in [('.category-sections','index'),('.footer-surface','footer')]:
                    region = page.locator(selector)
                    region.locator('a').first.hover()
                    region.screenshot(path=str(OUT / f'{width}-{name}-hover.png'))
                page.add_script_tag(path=str(AXE))
                violations = page.evaluate("async()=>(await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']}})).violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)}))")
                assert not violations, (width,route,violations)
                audits += 1
            results.append({'width':width,'route':route,'menu_rows':'passed'})
    page.set_viewport_size({'width':390,'height':1000})
    page.goto(URL+'news-and-events/')
    page.evaluate("document.documentElement.style.fontSize='200%'")
    assert not page.evaluate('document.documentElement.scrollWidth>innerWidth+1'), 'Menu rows must wrap at 200% text'
    assert not errors, errors
    browser.close()
(OUT/'verification.json').write_text(json.dumps({'views':results,'accessibility_audits':audits,'enlarged_text':'passed','javascript_errors':errors},indent=2)+'\n')
print(f'Menu rows: {len(results)} responsive views, {audits} accessibility audits, matching mega-menu typography, full-width hover/focus and 200% text passed.')
