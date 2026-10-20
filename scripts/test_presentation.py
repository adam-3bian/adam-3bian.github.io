#!/usr/bin/env python3
"""Review glossary content/interaction and navigation-card versus panel contracts."""
import json
import os
import re
from pathlib import Path
from playwright.sync_api import sync_playwright
from check_content import document

ROOT = Path(__file__).resolve().parents[1]
URL = os.environ.get('SITE_URL', 'http://127.0.0.1:4200/').rstrip('/') + '/'
OUT = Path(os.environ.get('REPORT_ROOT', ROOT / 'reports/polish/after'))
OUT.mkdir(parents=True, exist_ok=True)
AXE = Path(os.environ.get('AXE_PATH', '/workspace/work/browser-tools/node_modules/axe-core/axe.min.js'))
GLOSSARY = 'discover/resources/glossary/'
baseline = json.loads((ROOT / 'scripts/fixtures/refinement-baseline.json').read_text())
expected = [(term['title'], ' '.join(term['definition'].split())) for term in baseline['glossary']]
letters = baseline['letters']
routes = {'home':'', 'glossary':GLOSSARY, 'page':'discover/understand/how-does-cheri-work/', 'news':'news/ai-doesnt-need-a-kill-switch-it-needs-boundaries/', 'list':'people/?view=list', 'grid':'people/?view=grid', 'person':'people/mike-eftimakis/', 'talk-single':'people/john-goodacre/', 'talk-empty':'people/mike-halsall/', 'sparse':'people/a-theodore-markettos/', 'paper':'papers/it-is-time-to-standardize-principles-and-practices-for-software-memory-safety/', 'landing':'build/'}
results = []

def ready(page):
    page.evaluate('document.fonts.ready')
    page.evaluate('''async()=>{await Promise.all([...document.images].filter(i=>{const r=i.getBoundingClientRect();return r.top<innerHeight&&r.bottom>0}).map(i=>i.decode().catch(()=>{})))}''')

def text_contrast(node):
    """Measure the actual text/background pairing, including hover/selected states."""
    ratio = node.evaluate('''e=>{
      const rgb=s=>(s.match(/[\\d.]+/g)||[]).map(Number);
      const luminance=c=>c.slice(0,3).map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4})
        .reduce((sum,v,i)=>sum+v*[.2126,.7152,.0722][i],0);
      const fg=rgb(getComputedStyle(e).color);let parent=e,bg;
      while(parent){bg=rgb(getComputedStyle(parent).backgroundColor);if(bg.length===3||bg[3]===1)break;parent=parent.parentElement;}
      const a=luminance(fg),b=luminance(parent?bg:[255,255,255]);return (Math.max(a,b)+.05)/(Math.min(a,b)+.05);
    }''')
    assert ratio >= 4.5, (node.inner_text(), 'text contrast', ratio)
    return round(ratio, 2)

with sync_playwright() as p:
    options = {'headless':True, 'args':['--no-sandbox']}
    if os.environ.get('CHROMIUM_EXECUTABLE'): options['executable_path'] = os.environ['CHROMIUM_EXECUTABLE']
    browser = p.chromium.launch(**options)
    page = browser.new_page(viewport={'width':1440,'height':1000}, reduced_motion='reduce')
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    page.goto(URL + GLOSSARY)
    entries = page.locator('[data-glossary-entry]')
    assert entries.count() == len(expected)
    actual = entries.evaluate_all("nodes=>nodes.map(n=>[n.querySelector('dfn').textContent.trim(),n.querySelector('dd').textContent.trim().replace(/\\s+/g,' ')])")
    assert actual == [list(x) for x in expected], 'Glossary terms/definitions changed'
    assert page.locator('.glossary-index a').all_text_contents() == letters
    assert page.locator('.glossary-entry dt[id]').evaluate_all('nodes=>new Set(nodes.map(n=>n.id)).size') == len(expected)
    assert page.locator('.glossary-entry dfn a').count() == sum(bool(term['link']) for term in baseline['glossary']), 'Existing term destinations must remain links'
    search = page.get_by_role('searchbox', name='Find a term')
    search.fill('révocation')
    assert page.locator('[data-glossary-entry]:visible').count() == 1
    assert page.locator('[data-glossary-entry]:visible dfn').inner_text() == 'Revocation'
    search.fill('calling conventions')
    assert page.locator('[data-glossary-entry]:visible dfn').all_text_contents() == ['ABI'], 'Search must include definitions'
    search.fill('capability provenance')
    assert page.locator('[data-glossary-entry]:visible dfn').all_text_contents() == ['Capability provenance']
    search.fill('no match 0192837465')
    assert page.locator('[data-glossary-empty]').is_visible()
    assert page.locator('[data-glossary-count]').inner_text() == f'0 terms of {len(expected)}'
    page.get_by_role('button', name='Clear search', exact=True).click()
    assert page.locator('[data-glossary-entry]:visible').count() == len(expected)
    assert search.evaluate('(e)=>document.activeElement===e')
    search.fill('register')
    page.evaluate("location.hash = '#glossary-term-pointer'")
    target = page.locator('#glossary-term-pointer')
    target.wait_for(state='visible')
    page.wait_for_function("document.activeElement.id === 'glossary-term-pointer'")
    assert search.input_value() == ''
    assert target.evaluate('(e)=>e.getBoundingClientRect().top >= 0 && e.getBoundingClientRect().top < innerHeight')
    search.fill('revocation')
    page.locator('.glossary-index a').filter(has_text=re.compile('^C$')).click()
    assert search.input_value() == ''
    assert page.locator('[data-glossary-entry]:visible').count() == len(expected)
    assert page.locator('#glossary-c').is_visible()
    page.goto(URL + GLOSSARY + '#glossary-term-bounds')
    assert page.locator('#glossary-term-bounds').is_visible()
    page.get_by_role('link', name='Link to Bounds', exact=True).focus()
    page.keyboard.press('Enter')
    assert page.locator('#glossary-term-bounds').evaluate('(e)=>getComputedStyle(e).outlineStyle') != 'none'
    results.append({'glossary':'passed: all source definitions, order, links, unique term anchors, accent/definition/multiple-word search, empty/reset, filtered deep links and alphabet navigation','terms':len(expected),'letters':len(letters)})

    for device,width,height in [('desktop',1440,1000),('mobile',390,844)]:
        page.set_viewport_size({'width':width,'height':height})
        for name,route in routes.items():
            page.goto(URL + route);ready(page)
            assert page.locator('h1').count() == 1
            assert page.locator('[data-view-button], .glossary-permalink, .glossary-index a').evaluate_all('nodes=>nodes.every(n=>n.getBoundingClientRect().height >= 44)'), (device,name,'small control target')
            assert not page.evaluate('document.documentElement.scrollWidth > innerWidth + 1'), (device,name)
            assert 'Poppins' in page.locator('h1').evaluate('(e)=>getComputedStyle(e).fontFamily')
            assert page.locator('a a, a button, a input').count() == 0, (device,name,'nested interactive content')
            assert page.locator('main .card:not(a), a.content-panel').count() == 0, (device,name,'ambiguous card contract')
            assert page.locator('main .card, main a.catalog-card').evaluate_all("nodes=>nodes.every(n=>!!n.getAttribute('href') && !n.hasAttribute('onclick'))")
            if name == 'home':
                ratios = {selector:text_contrast(page.locator(selector).first) for selector in
                          ['.hero-opening','.hero-support','.hero-signoff','.action-card','.site-call-to-action .card-action']}
                page.locator('.action-card').hover()
                ratios['join-hover'] = text_contrast(page.locator('.action-card'))
                results.append({'device':device,'home_text_contrast':ratios})
            if name == 'list':
                selected = page.locator('.view-switch button[aria-pressed="true"]').first
                unselected = page.locator('.view-switch button[aria-pressed="false"]').first
                ratios = {'selected':text_contrast(selected),'unselected':text_contrast(unselected)}
                unselected.hover();ratios['unselected-hover']=text_contrast(unselected)
                selected.hover();ratios['selected-hover']=text_contrast(selected)
                selected.focus()
                assert selected.evaluate('e=>getComputedStyle(e).outlineStyle') != 'none'
                results.append({'device':device,'view_control_contrast':ratios})
            surfaces = page.locator('main, .site-header, .site-footer, .hero, .content-panel, .catalog-card, .facts-panel, .detail-aside .resource-panel, .site-call-to-action .card')
            assert surfaces.evaluate_all("nodes=>nodes.every(n=>!/^rgba\\(.+, (?:0|0?\\.\\d+)\\)$/.test(getComputedStyle(n).backgroundColor))"), (device,name,'translucent surface')
            panels = page.locator('section.content-panel, .talk-card.content-panel')
            if panels.count():
                panel = panels.first
                before = panel.evaluate('(e)=>({bg:getComputedStyle(e).backgroundColor,shadow:getComputedStyle(e).boxShadow,cursor:getComputedStyle(e).cursor})')
                panel.hover(position={'x':5,'y':5})
                after = panel.evaluate('(e)=>({bg:getComputedStyle(e).backgroundColor,shadow:getComputedStyle(e).boxShadow,cursor:getComputedStyle(e).cursor})')
                assert before == after and after['cursor'] != 'pointer', (device,name,'passive panel suggests whole-card interaction')
            if name == 'person':
                assert page.locator('.talk-card.content-panel').count() == 6
                actions = page.locator('.talk-actions .resource-link')
                assert actions.count() == 11
                assert actions.evaluate_all('nodes=>nodes.every(n=>n.getBoundingClientRect().height>=44)')
                actions.first.focus()
                assert actions.first.evaluate('e=>getComputedStyle(e).outlineStyle') != 'none'
                normal = text_contrast(actions.first)
                actions.first.hover()
                results.append({'device':device,'talk_action_contrast':{'normal':normal,'hover':text_contrast(actions.first)}})
                page.locator('#cheri-talks').evaluate("e=>e.scrollIntoView({block:'start'})")
                page.screenshot(path=str(OUT / f'{device}-talks.png'))
            if name == 'talk-single':
                assert page.locator('[data-talk-id="8327eaddbe5e"] > a.navigation-card').count() == 1
            if name == 'talk-empty':
                empty = page.locator('[data-talk-id="0be58c12b274"]')
                assert empty.locator('article.content-panel').count() == 1
                assert empty.locator('a, .talk-actions').count() == 0
            nav = page.locator('main a.catalog-card, main a.card').first
            if nav.count():
                page.keyboard.press('Tab');nav.focus()
                assert nav.evaluate('(e)=>getComputedStyle(e).outlineStyle') != 'none'
                assert nav.evaluate('(e)=>getComputedStyle(e).transitionDuration') == '0s', 'Reduced motion must disable navigation-card transitions'
                page.locator('h1').click(position={'x':2,'y':2})
            page.mouse.move(0,0);page.evaluate('scrollTo(0,0)')
            page.screenshot(path=str(OUT / f'{device}-{name}.png'))
            results.append({'device':device,'route':name,'card_contracts':'passed','opaque_surfaces':'passed'})
            if name == 'home':
                page.locator('[data-section-cards]').first.evaluate("e=>e.scrollIntoView({block:'start'})")
                page.screenshot(path=str(OUT / f'{device}-panels.png'))
    page.goto(URL);ready(page)
    active = page.locator('.slide:not([hidden])').get_attribute('id')
    page.wait_for_timeout(5200)
    assert page.locator('.slide:not([hidden])').get_attribute('id') == active, 'Reduced motion must suppress carousel autoplay'
    page.locator('[data-slide="1"]').focus();page.keyboard.press('Space')
    assert page.locator('.slide:not([hidden])').get_attribute('id') == 'slide-2'
    results.append({'reduced_motion':'passed: card transitions disabled, carousel autoplay suppressed, manual slide selection available'})
    page.set_viewport_size({'width':768,'height':1000});page.goto(URL+GLOSSARY);ready(page)
    page.add_script_tag(path=str(AXE))
    violations=page.evaluate("async()=> (await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']}})).violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)}))")
    results.append({'tablet_glossary_violations':violations})
    assert not violations, violations
    page.screenshot(path=str(OUT / 'tablet-glossary.png'))

    plain_context=browser.new_context(java_script_enabled=False,viewport={'width':390,'height':844})
    plain=plain_context.new_page();plain.goto(URL+GLOSSARY+'#glossary-term-pointer')
    assert plain.locator('[data-glossary-entry]:visible').count() == len(expected)
    assert not plain.locator('[data-glossary-controls]').is_visible()
    assert plain.locator('#glossary-term-pointer').is_visible()
    assert plain.locator('.glossary-index a').count() == len(letters)
    results.append({'without_javascript':'passed: all glossary definitions, original term links, alphabet index and direct term links'})
    assert not errors, errors
    browser.close()

(OUT/'results.json').write_text(json.dumps(results,indent=2)+'\n')
print(json.dumps({'reviewed_views':len(routes)*2+1,'glossary_terms':len(expected),'glossary_letters':len(letters),'tablet_accessibility_violations':violations,'screenshots':len(list(OUT.glob('*.png')))},indent=2))
