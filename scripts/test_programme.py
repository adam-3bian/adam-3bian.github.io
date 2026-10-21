#!/usr/bin/env python3
"""Review native event timelines and 1/2/3/4/7-day progressive tab navigation."""
import json
import os
import re
from pathlib import Path
from urllib.parse import urlsplit
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
URL = os.environ.get('SITE_URL', 'http://127.0.0.1:4200/').rstrip('/') + '/'
PREFIX = urlsplit(URL).path.rstrip('/')
OUT = Path(os.environ.get('REPORT_ROOT', ROOT / 'reports/programme'))
OUT.mkdir(parents=True, exist_ok=True)
FIXTURES = json.loads(Path(os.environ['PROGRAMME_FIXTURES']).read_text())
AXE = Path(os.environ['AXE_PATH'])
results = []
audits = 0

with sync_playwright() as p:
    browser = p.chromium.launch(executable_path=os.environ.get('CHROMIUM_EXECUTABLE'), args=['--no-sandbox'])
    context = browser.new_context(reduced_motion='reduce')
    def fixture(route):
        count = int(urlsplit(route.request.url).path.rstrip('/').split('/')[-1])
        route.fulfill(content_type='text/html', body=FIXTURES[f'{PREFIX}:{count}'])
    fixture_pattern = re.compile(r'/__programme-fixtures/[0-9]+/$')
    context.route(fixture_pattern, fixture)
    page = context.new_page()
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    for width in [320,390,768,1024,1440,1920]:
        page.set_viewport_size({'width':width,'height':1000})
        for count in [1,2,3,4,7]:
            address = URL + f'__programme-fixtures/{count}/'
            assert page.goto(address).status == 200
            page.evaluate('document.fonts.ready')
            tabs = page.get_by_role('tab')
            assert tabs.count() == (count if count > 1 else 0)
            assert page.locator('[data-programme-day]:visible').count() == 1
            assert not page.evaluate('document.documentElement.scrollWidth > innerWidth + 1'), (width,count)
            for index in range(count):
                if count > 1:
                    tabs.nth(index).click()
                    assert tabs.nth(index).get_attribute('aria-selected') == 'true'
                    assert page.locator('[data-programme-day]:visible').get_attribute('id') == tabs.nth(index).get_attribute('aria-controls')
                assert page.locator('[data-programme-day]:visible').count() == 1
                geometry = page.locator('[data-programme-day]:visible .programme-sessions').evaluate('''e=>{
                  const rail=e.getBoundingClientRect().x+parseFloat(getComputedStyle(e,'::before').left)+1;
                  const entries=[...e.querySelectorAll('.programme-entry')].filter(n=>getComputedStyle(n,'::before').content!=='none');
                  const dots=entries.map(n=>{const r=n.getBoundingClientRect(),s=getComputedStyle(n,'::before');return r.x+parseFloat(s.left)+parseFloat(s.width)/2+parseFloat(s.borderLeftWidth);});
                  const bounds=[...e.querySelectorAll('.programme-clock')].map(n=>({right:n.getBoundingClientRect().right,rail}));
                  const details=[...e.querySelectorAll('.programme-session-details')].filter(n=>n.textContent.trim()).map(n=>(getComputedStyle(n).display==='contents'?n.firstElementChild:n).getBoundingClientRect().x);
                  const markerY=[...e.querySelectorAll('.programme-entry')].map(n=>{
                    const m=n.matches('[data-session-type="break"], [data-session-type="networking"]')?n.querySelector('.programme-session-header'):n;
                    const s=getComputedStyle(m,'::before');return m.getBoundingClientRect().top+parseFloat(s.top)+parseFloat(s.height)/2+parseFloat(s.borderTopWidth);
                  });
                  const r=e.getBoundingClientRect(),s=getComputedStyle(e,'::before');
                  const ends={first:markerY[0],last:markerY.at(-1),top:r.top+parseFloat(s.top),bottom:r.bottom-parseFloat(s.bottom)};
                  const bands=[...e.querySelectorAll('[data-session-type="break"] > .programme-session-header, [data-session-type="networking"] > .programme-session-header')].map(n=>{
                    const b=n.getBoundingClientRect(),p=getComputedStyle(n,'::after');return {content:p.content,top:b.top+parseFloat(p.top),bottom:b.bottom-parseFloat(p.bottom),expectedTop:Math.max(b.top,ends.first),expectedBottom:Math.min(b.bottom,ends.last)};
                  });
                  return {rail,dots,bounds,details,ends,bands,markers:markerY.length,entries:entries.length,rows:e.querySelectorAll('.programme-session').length,line:s.content};
                }''')
                assert all(abs(dot-geometry['rail']) < 1 for dot in geometry['dots']), (width,count,index,geometry)
                assert all(item['right'] < item['rail']-2 for item in geometry['bounds']), (width,count,index,'times overlap rail',geometry)
                assert all(left > geometry['rail']+10 for left in geometry['details']), (width,count,index,'session details must follow the text column',geometry)
                if count >= 4 and index == 1:
                    assert geometry['rows'] == 0 and geometry['line'] == 'none', 'Empty days must not show a phantom timeline'
                if geometry['markers'] > 1:
                    ends=geometry['ends']
                    assert abs(ends['first']-ends['top'])<1 and abs(ends['last']-ends['bottom'])<1, (width,count,index,'Rail must stop at the first and last markers',geometry)
                    assert all(b['content']!='none' and abs(b['top']-b['expectedTop'])<1 and abs(b['bottom']-b['expectedBottom'])<1 for b in geometry['bands']), (width,count,index,'Rail must continue through green bands',geometry)
                else:
                    assert geometry['line']=='none', 'Empty or single-entry days must not show a stray rail'
            resources=page.locator('[data-programme-day]:visible .programme-entry:has(.programme-resources)').first
            if resources.count():
                copy=resources.locator('.programme-talk-copy, .programme-session-header').first.bounding_box()
                actions=resources.locator('.programme-resources').bounding_box()
                if width>=1024:
                    assert actions['x']>=copy['x']+copy['width'] and abs(actions['y']-copy['y'])<1, (width,'Resources should sit beside the talk')
                else:
                    assert actions['y']>=copy['y']+copy['height'], (width,'Resources must stack below the talk on mobile')
                boxes=resources.locator('.programme-resources li').evaluate_all('nodes=>nodes.map(n=>{const r=n.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width};})')
                if len(boxes)>1 and boxes[1]['x']>boxes[0]['x']:
                    assert abs(boxes[1]['y']-boxes[0]['y'])<1, 'Adjacent resource buttons must align'
            if count > 1:
                tabs.last.press('ArrowRight')
                assert tabs.first.get_attribute('aria-selected') == 'true'
                tabs.first.press('ArrowLeft')
                assert tabs.last.get_attribute('aria-selected') == 'true'
                tabs.last.press('Home')
                assert tabs.first.get_attribute('aria-selected') == 'true'
                tabs.first.press('End')
                assert tabs.last.get_attribute('aria-selected') == 'true'
                assert tabs.last.evaluate('e=>getComputedStyle(e).outlineStyle') != 'none'
                target = page.locator('[data-programme-day]').last.locator('.programme-entry[id]').first.get_attribute('id')
                page.goto(address + '#' + target)
                assert page.locator('#' + target).is_visible()
                assert page.get_by_role('tab').last.get_attribute('aria-selected') == 'true'
            if width in [390,1440] and count in [4,7]:
                page.add_script_tag(path=str(AXE))
                violations = page.evaluate("async()=>(await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']}})).violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)}))")
                assert not violations, (width,count,violations)
                audits += 1
            page.emulate_media(media='print')
            assert page.locator('[data-programme-day]:visible').count() == count
            assert page.locator('.programme-date').evaluate_all("nodes=>nodes.every(n=>getComputedStyle(n).position==='static')")
            page.emulate_media(media='screen')
            assert page.locator('[data-programme-day]:visible').count() == 1
            results.append({'width':width,'days':count,'navigation':'passed','timeline_geometry':'passed','print':'passed'})
    for count in [4,7]:
        plain_context = browser.new_context(java_script_enabled=False,viewport={'width':390,'height':844})
        plain_context.route(fixture_pattern, fixture)
        plain = plain_context.new_page()
        plain.goto(URL + f'__programme-fixtures/{count}/')
        assert plain.locator('[data-programme-day]:visible').count() == count
        assert plain.locator('[data-programme-tab]').count() == count
        plain_context.close()

    page.set_viewport_size({'width':390,'height':1000})
    page.goto(URL + '__programme-fixtures/4/')
    page.evaluate("document.documentElement.style.fontSize='200%'")
    assert not page.evaluate('document.documentElement.scrollWidth > innerWidth + 1'), 'Enlarged programme text must reflow'
    for width in [390,1440]:
        page.set_viewport_size({'width':width,'height':1000})
        page.goto(URL + 'events/cheritech26/')
        page.evaluate('document.fonts.ready')
        assert page.locator('section[aria-labelledby="speakers-title"],section[aria-labelledby="guest-speakers-title"]').count() == 0
        assert page.locator('.programme-speakers a').count() > 0
        assert page.locator('#speakers-title').count() == 1, 'Existing speaker fragments remain available'
        assert page.locator('.programme-content').evaluate('e=>Math.abs(e.getBoundingClientRect().width-document.querySelector(".record-body").closest(".page-surface").getBoundingClientRect().width+2*parseFloat(getComputedStyle(document.querySelector(".page-surface")).paddingLeft)+2)<1'), 'The programme fills the content canvas'
        page.locator('.event-programme').screenshot(path=str(OUT/f'{width}-cheritech26.png'))
        page.goto(URL + '__programme-fixtures/4/')
        page.locator('.event-programme').screenshot(path=str(OUT/f'{width}-four-days.png'))
        page.goto(URL + 'events/cheritech25/')
        talk=page.locator('.programme-entry:has(.programme-resources):visible').first
        heading=talk.locator('.programme-session-header').bounding_box()
        actions=talk.locator('.programme-resources').bounding_box()
        if width>=1024:
            assert actions['x']>=heading['x']+heading['width'] and abs(actions['y']-heading['y'])<1, 'Existing standalone talk actions must align beside their heading'
        else:
            assert actions['y']>=heading['y']+heading['height'], 'Existing standalone talk actions must stack on mobile'
        assert page.locator('.programme-resources a[href$=".pdf"]').count()>0 and page.locator('.programme-resources a[href*="youtu"]').count()>0, 'Existing talk PDFs and videos must remain available'
        talk.screenshot(path=str(OUT/f'{width}-cheritech25-resources.png'))
    assert not errors, errors
    browser.close()

(OUT/'verification.json').write_text(json.dumps({'responsive_views':results,'accessibility_audits':audits,'no_javascript_days':[4,7],'enlarged_text':'passed','javascript_errors':errors},indent=2)+'\n')
print(f'Programme: {len(results)} responsive views, {audits} accessibility audits, 1/2/3/4/7-day navigation, stable rails, print, 200% text and no-JavaScript fallback passed.')
