#!/usr/bin/env python3
"""Exercise complete user flows, including project paths and disconnected forms."""
import json
from pathlib import Path
from playwright.sync_api import sync_playwright, expect
from site_server import ROOT, SITE, serving, metadata

results = []
folder = ROOT / 'reports/browser-theme'
folder.mkdir(exist_ok=True)
records = json.loads((SITE / 'search-index.json').read_text())
with serving() as (_, base), sync_playwright() as playwright:
    browser = playwright.chromium.launch(executable_path='/usr/bin/chromium', headless=True, args=['--no-sandbox'])
    page = browser.new_page(viewport={'width': 1440, 'height': 1000})
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))

    page.goto(base + '/search/?q=Morello&type=hardware')
    expect(page.locator('[data-search-results] li').first).to_be_visible()
    expect(page.locator('[data-search-results] .meta').first).to_have_text('hardware')
    expect(page.locator('[data-search-results] a').filter(has_text='Morello')).to_have_count(1)
    page.locator('[data-search-results] a').filter(has_text='Morello').click()
    expect(page).to_have_url(base + '/hardware/morello/')
    results.append('Search deep link, content filter and result navigation')

    page.goto(base + '/search/?q=Watson&type=papers')
    expect(page.locator('[data-search-results] li').first).to_be_visible()
    assert page.locator('[data-search-results] .meta').all_text_contents() == ['papers'] * page.locator('[data-search-results] li').count()
    page.locator('#site-query').fill('<img src=x onerror=alert(1)>')
    expect(page.locator('[data-search-status]')).to_contain_text('No results')
    expect(page.locator('[data-search-results] img')).to_have_count(0)
    page.locator('#site-query').fill('zzzz-no-such-published-phrase')
    expect(page.locator('[data-search-status]')).to_contain_text('No results')
    results.append('Contributor body search and safe empty results')

    failure_page = browser.new_page()
    failure_page.route('**/search-index.json', lambda route: route.abort('failed'))
    failure_page.goto(base + '/search/?q=Morello')
    expect(failure_page.locator('[data-search-status]')).to_contain_text('temporarily unavailable')
    failure_page.unroute('**/search-index.json')
    failure_page.locator('button[type=submit]').click()
    expect(failure_page.locator('[data-search-results] li').first).to_be_visible()
    results.append('Search recovers after a failed index request')
    failure_page.close()

    page.goto(base + '/people/')
    page.locator('#directory-filter').select_option('speaker')
    expect(page.locator('[data-directory-item]:visible')).to_have_count(60)
    page.locator('#directory-filter').select_option('author')
    author_count = sum(entry['type'] == 'people' and 'author' in entry['roles'] for entry in records)
    expect(page.locator('[data-directory-item]:visible')).to_have_count(author_count)
    page.locator('#directory-query').fill('Anthony Fox')
    expect(page.locator('[data-directory-item]:visible')).to_have_count(1)
    page.locator('[data-directory-item]:visible a').click()
    expect(page.locator('[data-relationship=papers] a').first).to_be_visible()
    results.append('People role filters link minimal author records to papers')

    page.goto(base + '/news/beyond-software-patching/')
    page.locator('[data-relationship=authors] a.card').filter(has_text='Jim Wallace').click()
    expect(page).to_have_url(base + '/people/jim-wallace/')
    page.locator('[data-relationship=news] a.card').filter(has_text='Beyond Software Patching').click()
    expect(page).to_have_url(base + '/news/beyond-software-patching/')
    page.goto(base + '/people/')
    page.locator('#directory-filter').select_option('author')
    page.locator('#directory-query').fill('Jim Wallace')
    expect(page.locator('[data-directory-item]:visible')).to_have_count(1)
    page.goto(base + '/people/adam-finney/')
    expect(page.locator('[data-relationship=news]')).to_be_visible()
    assert all('-original/' not in url for url in page.locator('[data-relationship=news] a.card').evaluate_all('(links)=>links.map(link=>link.href)'))
    results.append('News author links, reverse article navigation and author filtering')

    page.goto(base + '/organisations/')
    page.locator('#directory-filter').select_option('member')
    expect(page.locator('[data-directory-item]:visible')).to_have_count(52)
    page.locator('#directory-query').fill('Codasip')
    expect(page.locator('[data-directory-item]:visible')).to_have_count(1)
    page.locator('#directory-query').fill('no-matching-organisation')
    expect(page.locator('[data-directory-empty]')).to_be_visible()
    expect(page.locator('[data-directory-count]')).to_have_text('0 of 69 shown')
    page.locator('#directory-query').fill('')
    expect(page.locator('[data-directory-empty]')).not_to_be_visible()
    expect(page.locator('[data-directory-item]:visible')).to_have_count(52)
    results.append('Organisation membership, keyword filtering and reset')

    page.goto(base + '/events/')
    for status in ['upcoming', 'past']:
        page.locator('#directory-filter').select_option(status)
        visible = page.locator('[data-directory-item]:visible')
        assert visible.count() > 0
        assert visible.evaluate_all('(items)=>items.every(item=>item.dataset.status===' + json.dumps(status) + ')')
    results.append('Event date filters')

    for path, field in [('/alliance/membership/contact/', '#enquiry-email'), ('/news-and-events/news-and-analysis/subscribe-newsletter/', '#newsletter-email')]:
        page.goto(base + path, wait_until='networkidle')
        attempted_requests = []
        def on_request(request):
            attempted_requests.append({'url': request.url, 'method': request.method})
        page.on('request', on_request)
        page.locator(field).fill('preview-validation@example.invalid')
        expect(page.locator('[data-unconnected-form] [type=submit]')).to_be_disabled()
        page.locator(field).press('Enter')
        # Also exercise an explicit submit event; site.js must prevent it.
        assert page.locator('[data-unconnected-form]').evaluate("form=>!form.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}))")
        page.wait_for_timeout(200)
        assert page.url == base + path
        assert not any(request['method'] != 'GET' or 'preview-validation' in request['url'] for request in attempted_requests)
        page.remove_listener('request', on_request)
    results.append('Both disconnected forms block submission and keep entered data local')

    page.goto(base + '/')
    toggle = page.locator('#primary-navigation > ul > li .submenu-toggle').first
    toggle.focus()
    toggle.press('ArrowDown')
    expect(toggle).to_have_attribute('aria-expanded', 'true')
    page.keyboard.press('Escape')
    expect(toggle).to_have_attribute('aria-expanded', 'false')
    expect(toggle).to_be_focused()
    results.append('Keyboard navigation opens menus and restores focus on Escape')

    for path, name in [('/', 'website-home'), ('/people/robert-watson/', 'website-profile'), ('/alliance/leadership/members/', 'website-members'), ('/alliance/membership/contact/', 'website-contact')]:
        page.goto(base + path, wait_until='networkidle')
        for width, height in [(1440, 1000), (1024, 768), (768, 1024), (390, 844)]:
            page.set_viewport_size({'width': width, 'height': height})
            assert page.evaluate('document.documentElement.scrollWidth <= window.innerWidth'), (path, width)
            if width in [1440, 390]:
                page.screenshot(path=str(folder / f'{name}-{width}.png'))
        assert page.evaluate("[...document.fonts].some(face=>face.family.includes('Poppins') && face.status==='loaded')")
    results.append('Four key page layouts fit desktop, tablet and mobile widths with local Poppins')

    page.goto(base + '/')
    page.set_viewport_size({'width': 390, 'height': 844})
    hamburger = page.locator('#hamburger')
    hamburger.click()
    expect(hamburger).to_have_attribute('aria-expanded', 'true')
    page.keyboard.press('Escape')
    expect(hamburger).to_have_attribute('aria-expanded', 'false')
    expect(hamburger).to_be_focused()
    results.append('Mobile navigation closes with Escape')

    context = browser.new_context(java_script_enabled=False)
    fallback = context.new_page()
    fallback.goto(base + '/people/')
    expect(fallback.locator('[data-directory-item]:visible')).to_have_count(sum(entry['type'] == 'people' for entry in records))
    expect(fallback.locator('[data-directory-controls]')).not_to_be_visible()
    fallback.goto(base + '/search/')
    expect(fallback.locator('noscript p')).to_contain_text('browse')
    fallback.goto(base + '/alliance/membership/contact/')
    expect(fallback.locator('[type=submit]')).to_be_disabled()
    fallback.locator('#enquiry-email').fill('no-js-validation@example.invalid')
    fallback.locator('#enquiry-email').press('Enter')
    expect(fallback).to_have_url(base + '/alliance/membership/contact/')
    results.append('Directories, search fallback and disabled forms remain usable without JavaScript')
    context.close()
    assert not errors, errors
    page.close()
    browser.close()

(ROOT / 'reports/website-browser-validation.json').write_text(json.dumps({'status': 'passed', 'baseurl': metadata()['baseurl'], 'flows': results, 'javascript_errors': errors}, indent=2) + '\n')
print(f'PASS: {len(results)} website browser flows.')
