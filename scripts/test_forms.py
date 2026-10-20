#!/usr/bin/env python3
"""Unconfigured forms stay local on mouse/Enter use, with and without JavaScript."""
import json
import os
from pathlib import Path
from playwright.sync_api import sync_playwright

URL = os.environ.get('SITE_URL', 'http://127.0.0.1:4200/').rstrip('/') + '/'
OUT = Path(os.environ.get('REPORT_ROOT', 'reports/forms'))
OUT.mkdir(parents=True, exist_ok=True)
results = []
with sync_playwright() as p:
    browser = p.chromium.launch(executable_path=os.environ.get('CHROMIUM_EXECUTABLE'), args=['--no-sandbox'])
    for javascript in [True, False]:
        context = browser.new_context(java_script_enabled=javascript, viewport={'width': 390, 'height': 900})
        for route, count in [('alliance/membership/contact/', 5),
                             ('news-and-events/news-and-analysis/subscribe-newsletter/', 1)]:
            page = context.new_page()
            assert page.goto(URL + route).status == 200
            requests = []
            page.on('request', lambda request: requests.append(request.url)
                    if request.is_navigation_request() or request.method != 'GET' else None)
            form = page.locator('form[data-local-form]')
            assert form.locator('input,select,textarea').count() == count
            email = form.locator('input[type=email]')
            email.fill('form-test@example.invalid')
            form.locator('button[type=button]').click()
            page.wait_for_timeout(100)
            email.press('Enter')
            page.wait_for_timeout(100)
            assert page.url == URL + route and requests == [], (javascript, route, requests, page.url)
            assert email.input_value() == 'form-test@example.invalid'
            assert form.locator('[role=status],[role=alert]').count() == 0
            results.append({'javascript': javascript, 'route': route, 'network_submissions': 0, 'navigation': False})
            page.close()
        context.close()
    browser.close()
(OUT / 'results.json').write_text(json.dumps(results, indent=2) + '\n')
print('Local forms: four mouse/Enter checks, JS on/off, no submission, query-string data, navigation or false success; passed.')
