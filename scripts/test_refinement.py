#!/usr/bin/env python3
"""Exercise the requested directories, media frames, sparse facts and reference layout."""
import json
import os
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
URL = os.environ.get('SITE_URL', 'http://127.0.0.1:4200/').rstrip('/') + '/'
OUT = Path(os.environ.get('REPORT_ROOT', ROOT / 'reports/refinement/after'))
OUT.mkdir(parents=True, exist_ok=True)
AXE = Path(os.environ.get('AXE_PATH', '/workspace/work/browser-tools/node_modules/axe-core/axe.min.js'))
ROUTES = {
    'hub':'news-and-events/', 'members':'alliance/leadership/members/?view=list',
    'members-grid':'alliance/leadership/members/?view=grid',
    'speakers':'news-and-events/people-and-opportunities/speakers/',
    'company':'organisations/axiomise-ltd/', 'person':'people/adam-finney/',
    'glossary':'discover/resources/glossary/', 'hardware':'hardware/cheriot/',
    'article':'news/ai-doesnt-need-a-kill-switch-it-needs-boundaries/'
}
results = []


def ready(page):
    page.evaluate('document.fonts.ready')
    page.evaluate('''async()=>await Promise.race([Promise.all([...document.images].filter(i=>{
      const r=i.getBoundingClientRect();return r.width>0&&r.top<innerHeight&&r.bottom>0;
    }).map(i=>i.decode().catch(()=>{}))),new Promise(r=>setTimeout(r,3000))])''')


with sync_playwright() as p:
    browser = p.chromium.launch(headless=True, executable_path=os.environ.get('CHROMIUM_EXECUTABLE'), args=['--no-sandbox'])
    errors = []
    for width, height in [(320,844),(390,844),(768,1000),(1000,1000),(1440,1000)]:
        for name, route in ROUTES.items():
            context = browser.new_context(viewport={'width':width,'height':height}, reduced_motion='reduce')
            page = context.new_page()
            page.on('pageerror', lambda error: errors.append(str(error)))
            assert page.goto(URL + route).status == 200
            ready(page)
            assert not page.evaluate('document.documentElement.scrollWidth > innerWidth + 1'), (width,name)
            assert page.locator('.catalog-summary').count() == 0, (width,name,'card excerpt returned')
            assert 'At a glance' not in page.locator('main').inner_text()
            assert page.locator('a a, a button, a input').count() == 0
            media = page.locator('.media-people, .image-kind-people, .media-organisations, .image-kind-organisations').evaluate_all('''nodes=>nodes.map(n=>{
              const r=n.getBoundingClientRect(),img=n.querySelector('img');return {
                kind:n.className,w:r.width,h:r.height,fit:getComputedStyle(img).objectFit
              }})''')
            for frame in media:
                if 'people' in frame['kind']:
                    assert abs(frame['w']-frame['h']) < 1, (width,name,frame)
                else:
                    assert frame['w'] > frame['h'] and frame['fit']=='contain', (width,name,frame)
            if name == 'members-grid':
                assert len({(round(f['w']),round(f['h'])) for f in media}) == 1, (width,media)
            if name in ['person','company','hardware']:
                assert page.locator('.detail-aside').count() == 0, (width,name,'unnecessary sidebar')
                assert page.locator('.inline-facts').count() == 1
                if name == 'person' and width < 768:
                    boxes=page.locator('.record-portrait, .page-summary').evaluate_all('nodes=>nodes.map(n=>{const r=n.getBoundingClientRect();return {top:r.top,bottom:r.bottom}})')
                    summary, image = boxes
                    assert summary['top'] >= image['bottom']-1, (width,'portrait overlaps summary',boxes)
            first_y = None
            if name == 'members':
                first_y = page.locator('[data-catalog-list] > li').first.bounding_box()['y']
                if width == 1440: assert first_y < 600, first_y
                if width == 390: assert first_y < 737, first_y
                assert page.locator('[data-catalog-list] > li').count() == 52
            if name == 'glossary':
                first_y = page.locator('[data-glossary-entry] dd').first.bounding_box()['y']
                if width == 390: assert first_y < 665, first_y
                assert page.locator('[data-glossary-entry]').count() == 46
            if name in ['company','person']:
                assert page.locator('.page-summary').is_visible(), 'Original introduction must remain on details'
            violations = None
            if width in [390,768,1440]:
                page.add_script_tag(path=str(AXE))
                violations = page.evaluate("async()=>(await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']}})).violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)}))")
                assert not violations, (width,name,violations)
                device = {390:'mobile',768:'tablet',1440:'desktop'}[width]
                page.screenshot(path=str(OUT / f'{device}-{name}.png'))
            results.append({'width':width,'route':name,'media':media,'first_content_y':first_y,'violations':violations})
            context.close()

    context = browser.new_context(viewport={'width':390,'height':844})
    page = context.new_page()
    page.goto(URL + ROUTES['glossary'] + '#glossary-term-pointer')
    page.evaluate("location.hash='#glossary-term-bounds'")
    page.wait_for_function("document.activeElement.id==='glossary-term-bounds'")
    page.get_by_role('searchbox',name='Find a term').fill('revocation')
    page.go_back()
    page.wait_for_function("document.activeElement.id==='glossary-term-pointer'")
    assert page.get_by_role('searchbox',name='Find a term').input_value() == ''
    page.go_forward()
    page.wait_for_function("document.activeElement.id==='glossary-term-bounds'")
    # Notes remain paired with products when users filter, and their links are native.
    page.goto(URL + 'build/platforms/cheri-products/')
    assert page.locator('.catalog-annotation a').count() >= 8
    page.locator('[data-filter-input]').select_option('Processor designs, chips, and boards')
    assert page.locator('[data-catalog-list] > li:visible').count() == 8
    assert page.locator('.catalog-annotation:visible').count() == 8
    assert page.locator('a a').count() == 0
    # The 1440 physical-pixel, 200% zoom equivalent has a 720 CSS-pixel viewport.
    zoom = browser.new_context(viewport={'width':720,'height':500},device_scale_factor=2)
    zoom_page = zoom.new_page()
    for route in [ROUTES['person'],ROUTES['members'],ROUTES['glossary'],ROUTES['article']]:
        zoom_page.goto(URL+route)
        assert not zoom_page.evaluate('document.documentElement.scrollWidth>innerWidth+1'), route
        assert zoom_page.locator('#hamburger').is_visible()
    assert not errors, errors
    browser.close()

(OUT/'results.json').write_text(json.dumps(results,indent=2)+'\n')
print(json.dumps({'responsive_views':len(results),'axe_views':sum(r['violations'] is not None for r in results),'screenshots':len(list(OUT.glob('*.png'))),'history':'passed','product_notes':'passed','zoom_equivalent':'720 CSS px at 2x pixel ratio'},indent=2))
