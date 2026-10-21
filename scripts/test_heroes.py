#!/usr/bin/env python3
"""Review shared heroes, responsive titles and pointer/keyboard design states."""
import json
import os
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
URL = os.environ.get('SITE_URL', 'http://127.0.0.1:4200/').rstrip('/') + '/'
OUT = Path(os.environ.get('REPORT_ROOT', ROOT / 'reports/heroes'))
AXE = Path(os.environ.get('AXE_PATH', '/workspace/work/browser-tools/node_modules/axe-core/axe.min.js'))
OUT.mkdir(parents=True, exist_ok=True)
ROUTES = {
    'person': 'people/adam-finney/',
    'person-long': 'people/a-theodore-markettos/',
    'member': 'organisations/bt-group/',
    'event': 'events/webinar-cheri-cra-compliance/',
    'programme': 'events/cheri-blossoms-conference-2026/',
    'news': 'news/ai-doesnt-need-a-kill-switch-it-needs-boundaries/',
    'directory': 'alliance/leadership/members/',
    'guide': 'guides/build-your-first-application/',
    'product': 'products/sonata/',
    'product-morello': 'products/morello/',
    'repository': 'repositories/cheribsd/',
    'paper': 'papers/it-is-time-to-standardize-principles-and-practices-for-software-memory-safety/',
    'group': 'groups/cheri-for-sel4/',
    'policy': 'policies/code-of-conduct/',
    'glossary': 'discover/resources/glossary/',
    'contact': 'alliance/membership/contact/',
}
GEOMETRY = '''e=>{
  const box=n=>{const r=n.getBoundingClientRect();return {x:r.x,y:r.y,right:r.right,bottom:r.bottom,width:r.width,height:r.height,centre:r.y+r.height/2};};
  const copy=e.querySelector('.heading-copy'),portrait=e.querySelector('.record-portrait'),title=e.querySelector('h1'),s=getComputedStyle(e);
  return {hero:box(e),copy:box(copy),title:box(title),portrait:portrait?box(portrait):null,
    background:s.backgroundColor,padding:s.padding,radius:s.borderRadius,type:getComputedStyle(title).fontSize,
    clipped:getComputedStyle(title).overflow==='hidden'||getComputedStyle(title).textOverflow==='ellipsis'};
}'''
STATE = '''e=>{const s=getComputedStyle(e);return {background:s.backgroundColor,color:s.color,shadow:s.boxShadow,decoration:s.textDecorationLine};}'''
results = []

with sync_playwright() as p:
    browser = p.chromium.launch(executable_path=os.environ.get('CHROMIUM_EXECUTABLE'), args=['--no-sandbox'])
    page = browser.new_page(reduced_motion='reduce')
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    for width in [320, 390, 768, 1024, 1440, 1920]:
        page.set_viewport_size({'width': width, 'height': 1000})
        title_size = None
        for name, route in ROUTES.items():
            assert page.goto(URL + route).status == 200, route
            page.evaluate('document.fonts.ready')
            hero = page.locator('.page-heading')
            data = hero.evaluate(GEOMETRY)
            h, c, t, image = [data[k] for k in ['hero', 'copy', 'title', 'portrait']]
            assert not page.evaluate('document.documentElement.scrollWidth > innerWidth + 1'), (width, name, 'overflow')
            assert page.locator('h1').count() == 1 and not data['clipped'], (width, name, 'title')
            assert t['x'] >= h['x'] and t['right'] <= h['right'] + 1, (width, name, 'title bounds')
            assert t['y'] >= h['y'] and t['bottom'] <= h['bottom'], (width, name, 'title bounds')
            assert data['background'] == 'rgb(21, 43, 59)' and data['radius'] == '10px', (width, name, data)
            assert data['padding'] == ('32px' if width >= 768 else '16px'), (width, name, data)
            title_size = title_size or data['type']
            assert data['type'] == title_size, (width, name, 'shared title scale')
            if width >= 768 or image is None or name == 'person':
                assert abs(c['centre'] - h['centre']) < 1, (width, name, 'vertically centred heading', data)
            if image:
                assert image['right'] <= h['right'] and image['bottom'] <= h['bottom'], (width, name, 'image bounds')
                if width >= 768 or name == 'person':
                    assert abs(image['centre'] - c['centre']) < 1, (width, name, 'image and heading alignment', data)
                    assert c['right'] + 15 <= image['x'], (width, name, 'copy overlaps image', data)
            if name in ['person', 'person-long', 'member', 'news']:
                assert hero.locator('.page-summary').count() == 0, (name, 'duplicated summary')
            if name in ['event', 'directory', 'guide']:
                assert hero.locator('.page-summary').count() == 1, (name, 'existing introduction')
            if name == 'person':
                assert page.locator('.record-facts dt').all_text_contents() == ['Governance Role', 'Affiliation']
                assert page.locator('.record-facts dd').first.inner_text() == 'Community representative', 'Authored role stays unchanged'
            if name == 'directory':
                assert page.locator('label[for="catalog-search"]').inner_text() == 'Search Organisations'
                assert page.locator('label[for="catalog-sort"]').inner_text() == 'Sort By'
            if name.startswith('product'):
                media = hero.locator('.record-portrait').evaluate('''e=>{const i=e.querySelector('img'),f=e.getBoundingClientRect(),r=i.getBoundingClientRect();return {frame:[f.width,f.height],image:[r.width,r.height],ratio:i.naturalWidth/i.naturalHeight};}''')
                assert media['frame'] == media['image'], (width, name, 'added padding around product image', media)
                assert abs(media['image'][0] / media['image'][1] - media['ratio']) < .01, (width, name, 'product image proportions', media)
            if width in [390, 1440]:
                if name in ['person', 'member', 'event', 'news', 'directory', 'guide']:
                    page.evaluate('''async()=>{await Promise.all([...document.querySelectorAll('.page-heading img')].map(i=>i.decode()))}''')
                    hero.screenshot(path=str(OUT / f'{width}-{name}.png'))
                page.add_script_tag(path=str(AXE))
                violations = page.evaluate("async()=>(await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']}})).violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)}))")
                assert not violations, (width, name, violations)
            results.append({'width': width, 'route': name, 'geometry': data})

    # Enlarged text must wrap within the frame, without colliding with media.
    page.set_viewport_size({'width': 390, 'height': 1000})
    for name in ['person', 'member', 'event', 'news', 'guide', 'paper']:
        page.goto(URL + ROUTES[name])
        page.evaluate("document.documentElement.style.fontSize='200%'")
        data = page.locator('.page-heading').evaluate(GEOMETRY)
        assert data['title']['right'] <= data['hero']['right'] + 1, (name, 'enlarged title', data)
        assert not page.evaluate('document.documentElement.scrollWidth > innerWidth + 1'), (name, '200% text overflow')
        results.append({'text_scale': '200%', 'route': name, 'geometry': data})

    page.set_viewport_size({'width': 1440, 'height': 1000})
    states = []
    for route, selector in [
        ('', 'a.slide-link'), ('people/', 'a.catalog-card'), ('build/', 'a.card'),
        ('people/adam-finney/', '.record-facts a'),
        ('news/ai-doesnt-need-a-kill-switch-it-needs-boundaries/', '.record-body a, .reading-content p a'),
        ('people/', '.view-switch button'),
        ('discover/resources/glossary/', '.glossary-index a'),
        ('discover/resources/glossary/', '.glossary-permalink'),
        ('events/cheri-blossoms-conference-2026/', '.programme-days a'),
        ('alliance/membership/contact/', '.form-panel .button'),
        ('policies/code-of-conduct/', '.detail-aside .button'),
        ('', '.navigation-contact .button'),
        ('', '.site-call-to-action .button'),
        ('alliance/membership/contact/', '.form-panel .meta a'),
        ('news/ai-doesnt-need-a-kill-switch-it-needs-boundaries/', '.article-byline a'),
    ]:
        page.goto(URL + route)
        node = page.locator(selector).first
        page.mouse.move(0, 0)
        normal = node.evaluate(STATE)
        track = page.locator('.slider-track') if selector == 'a.slide-link' else None
        track_normal = track.evaluate(STATE) if track else None
        node.hover()
        hover = node.evaluate(STATE)
        track_hover = track.evaluate(STATE) if track else None
        page.mouse.move(0, 0)
        page.keyboard.press('Tab')
        node.focus()
        assert node.evaluate('e=>e.matches(":focus-visible")'), (route, selector, 'keyboard focus')
        focus = node.evaluate(STATE)
        assert focus == hover, (route, selector, 'pointer/keyboard states differ', hover, focus)
        assert node.evaluate('e=>getComputedStyle(e).outlineStyle') != 'none'
        if '.button' in selector:
            assert hover['color'] == normal['background'] and hover['background'] == normal['color'], (route, selector, 'button colours must invert', normal, hover)
        if selector in ['.record-facts a', '.record-body a, .reading-content p a', '.form-panel .meta a']:
            assert hover['color'] == 'rgb(180, 35, 24)', (route, selector, 'plain light-surface links turn red', hover)
        if selector == '.article-byline a':
            assert hover['color'] == 'rgb(225, 244, 252)', 'Dark-surface links retain a light hover colour'
        if track:
            assert normal['shadow'] == hover['shadow'] == focus['shadow'] == 'none', 'The slider has one elevated surface'
            assert track_hover == track.evaluate(STATE) and track_hover != track_normal, 'Slider elevation follows pointer and keyboard focus'
        states.append({'route': route, 'selector': selector, 'normal': normal, 'hover': hover, 'focus': focus})
    assert not errors, errors
    browser.close()

(OUT / 'verification.json').write_text(json.dumps({'views': results, 'states': states, 'accessibility_audits': len(ROUTES) * 2}, indent=2) + '\n')
print(f'Heroes: {len(ROUTES) * 6} responsive views, six enlarged-text views, {len(ROUTES) * 2} accessibility audits and {len(states)} pointer/keyboard comparisons passed.')
