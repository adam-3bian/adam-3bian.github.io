#!/usr/bin/env python3
"""Browser checks and review screenshots for the shared catalogue and reading views."""
import json, os
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
URL = os.environ.get('SITE_URL', 'http://127.0.0.1:4200/').rstrip('/') + '/'
OUT = Path(os.environ.get('REPORT_ROOT', ROOT / 'reports/browser'))
OUT.mkdir(parents=True, exist_ok=True)
AXE = Path(os.environ.get('AXE_PATH', '/workspace/work/browser-tools/node_modules/axe-core/axe.min.js'))
routes = ['', 'discover/resources/glossary/', 'people/', 'organisations/', 'news/', 'events/', 'papers/', 'hardware/', 'software/', 'groups/', 'guides/', 'policies/', 'reports/', 'build/platforms/cheri-products/', 'people/mike-eftimakis/', 'people/a-theodore-markettos/', 'policies/code-of-conduct/', 'events/cheritech26/', 'papers/it-is-time-to-standardize-principles-and-practices-for-software-memory-safety/', 'news/ai-doesnt-need-a-kill-switch-it-needs-boundaries/', 'discover/understand/how-does-cheri-work/']
results = []

def ready(page):
    page.evaluate('document.fonts.ready')
    page.evaluate('''async () => { await Promise.all([...document.images].filter(i => { const r = i.getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight; }).map(i => i.decode().catch(() => {}))); }''')

with sync_playwright() as p:
    options = {'headless': True, 'args': ['--no-sandbox']}
    if os.environ.get('CHROMIUM_EXECUTABLE'): options['executable_path'] = os.environ['CHROMIUM_EXECUTABLE']
    browser = p.chromium.launch(**options)
    context = browser.new_context(viewport={'width': 1440, 'height': 1000})
    page = context.new_page()
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    page.goto(URL + 'people/')
    assert page.locator('[data-catalog]').get_attribute('data-view') == 'list'
    assert page.locator('[data-catalog-list] > li').count() == 111
    assert page.locator('[data-date-option]').count() == 0, 'Unknown person dates must not inherit build time'
    page.locator('[data-search-input]').fill('David Chisnall')
    assert page.locator('[data-catalog-list] > li:visible').count() == 1
    assert 'David Chisnall' in page.locator('[data-catalog-list] > li:visible').inner_text()
    page.get_by_role('button', name='Grid', exact=True).focus()
    page.keyboard.press('Space')
    assert page.locator('[data-catalog]').get_attribute('data-view') == 'grid'
    assert page.locator('[data-search-input]').input_value() == 'David Chisnall'
    assert page.locator('[data-catalog-list]').count() == 1
    assert page.locator('[data-catalog-list] > li').count() == 111
    page.reload()
    assert page.locator('[data-catalog]').get_attribute('data-view') == 'grid'
    assert page.locator('[data-search-input]').input_value() == 'David Chisnall'
    page.locator('[data-search-input]').fill('no possible matching record 938475')
    assert page.locator('[data-empty-state]').is_visible()
    page.get_by_role('button', name='Clear search and filters').click()
    assert page.locator('[data-catalog-list] > li:visible').count() == 111
    page.locator('[data-sort-input]').select_option('title-desc')
    assert page.locator('[data-catalog-list]').evaluate("list => { const names = [...list.querySelectorAll('h2')].map(x=>x.textContent); const c = new Intl.Collator(document.documentElement.lang,{sensitivity:'base',numeric:true}); return names.every((name,i) => !i || c.compare(names[i-1],name) >= 0); }")
    page.locator('[data-search-input]').fill('Fohrenbach')
    assert page.locator('[data-catalog-list] > li:visible').count() == 1
    page.locator('[data-search-input]').fill('')
    if page.locator('[data-filter-control]').is_visible():
        option = page.locator('[data-filter-input] option').nth(1).get_attribute('value')
        page.locator('[data-filter-input]').select_option(option)
        count = page.locator('[data-catalog-list] > li:visible').count()
        page.get_by_role('button', name='List', exact=True).click()
        assert page.locator('[data-catalog-list] > li:visible').count() == count
        assert page.locator('[data-filter-input]').input_value() == option
    page.goto(URL + 'alliance/leadership/governing-board/')
    assert page.locator('[data-catalog-list] > li').count() == 9
    assert page.locator('[data-catalog-list] > li h2').first.inner_text() == 'Mike Eftimakis'
    page.goto(URL + 'papers/?sort=date-desc')
    years = page.locator('[data-catalog-list] > li').evaluate_all('nodes => nodes.map(n => Number(n.dataset.date))')
    assert years == sorted(years, reverse=True)
    page.goto(URL + 'build/platforms/cheri-products/')
    assert page.locator('[data-catalog-list] > li').count() == 23
    page.locator('[data-filter-input]').select_option('Processor designs, chips, and boards')
    assert page.locator('[data-catalog-list] > li:visible').count() == 8
    page.goto(URL + 'people/a-theodore-markettos/')
    assert page.locator('.detail-aside').count() == 0, 'Sparse records must not reserve an empty sidebar'
    results.append({'interactions': 'passed: search, filtering, keyboard view toggle, persistence, reset, registry order, sparse records'})

    for width, height, device in [(1440, 1000, 'desktop'), (390, 844, 'mobile')]:
        page.set_viewport_size({'width': width, 'height': height})
        for route in routes:
            response = page.goto(URL + route)
            assert response.status == 200, route
            assert 'Poppins' in page.locator('h1').evaluate('(e) => getComputedStyle(e).fontFamily'), f'Stylesheet did not load: {route}'
            assert page.locator('h1').count() == 1, route
            assert not page.evaluate('document.documentElement.scrollWidth > innerWidth + 1'), f'{device}: horizontal overflow: {route}'
            ready(page)
            if AXE.exists():
                page.add_script_tag(path=str(AXE))
                violations = page.evaluate("async () => (await axe.run(document, {runOnly: {type:'tag', values:['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']}})).violations.map(v => ({id:v.id, impact:v.impact, nodes:v.nodes.map(n=>n.target)}))")
                results.append({'device': device, 'route': route, 'violations': violations})
            else: raise RuntimeError('Set AXE_PATH to the installed axe-core/axe.min.js')
        shots = [('home', ''), ('people-list', 'people/?view=list'), ('people-grid', 'people/?view=grid'), ('person', 'people/mike-eftimakis/'), ('policy', 'policies/code-of-conduct/'), ('news', 'news/ai-doesnt-need-a-kill-switch-it-needs-boundaries/'), ('page', 'discover/understand/how-does-cheri-work/')]
        for name, route in shots:
            page.goto(URL + route); ready(page)
            page.screenshot(path=str(OUT / f'{device}-{name}.png'))
    nojs = browser.new_context(java_script_enabled=False, viewport={'width':390,'height':844})
    plain = nojs.new_page();plain.goto(URL + 'people/')
    assert plain.locator('[data-catalog-list] > li:visible').count() == 111
    assert not plain.locator('[data-catalog-controls]').is_visible()
    plain.goto(URL + 'policies/code-of-conduct/')
    assert plain.get_by_role('link', name='Download official PDF').count() == 1
    results.append({'without_javascript': 'passed: records and document resources remain usable'})
    browser.close()
    assert not errors, errors

(OUT / 'results.json').write_text(json.dumps(results, indent=2) + '\n')
failures = [result for result in results if result.get('violations')]
print(json.dumps({'audited_views': len([r for r in results if 'route' in r]), 'accessibility_failures': failures, 'screenshots': len(list(OUT.glob('*.png')))}, indent=2))
assert not failures, 'Accessibility violations: see results.json'
