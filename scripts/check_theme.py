#!/usr/bin/env python3
"""Check imported ZIP files and optionally compare rendering to a ZIP build."""
import argparse
import hashlib
import json
import threading
from contextlib import contextmanager
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from site_server import ROOT, SITE, serving

parser = argparse.ArgumentParser()
parser.add_argument('--reference-site', type=Path, help='Built original starter directory; use local Poppins for comparison')
args = parser.parse_args()
manifest = json.loads((ROOT / 'reports/template-integration.json').read_text())
checks = []
for item in manifest['imported_files']:
    if item['status'] == 'unchanged':
        assert hashlib.sha256((ROOT / item['path']).read_bytes()).hexdigest() == item['zip_sha256'], item['path']
        checks.append({'check': 'exact ZIP file: ' + item['path'], 'status': 'passed'})
assert 'migration-content' not in (ROOT / '_sass/_site.scss').read_text()
assert '@import "website"' not in (ROOT / '_sass/_site.scss').read_text()
checks.append({'check': 'source-theme override styles are retired', 'status': 'passed'})
for route in ['', 'organisations/codasip', 'people/robert-watson', 'news/beyond-software-patching']:
    html = (SITE / route / 'index.html').read_text()
    assert 'class="hero' in html, route
    assert 'profile-layout' not in html, route
    assert '/assets/css/main.css' in html, route
    checks.append({'check': 'native theme active: /' + route, 'status': 'passed'})

@contextmanager
def reference_server(folder):
    class Quiet(SimpleHTTPRequestHandler):
        def log_message(self, *_args):
            pass
    server = ThreadingHTTPServer(('127.0.0.1', 0), partial(Quiet, directory=str(folder)))
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    try:
        yield 'http://127.0.0.1:' + str(server.server_port)
    finally:
        server.shutdown()
        server.server_close()
        thread.join()

if args.reference_site:
    from playwright.sync_api import sync_playwright
    selectors = {
        'body': ['fontFamily', 'fontSize', 'lineHeight', 'color', 'backgroundColor'],
        'body::before': ['opacity', 'backgroundRepeat', 'backgroundSize'],
        'header': ['backgroundColor', 'paddingLeft', 'paddingRight'],
        '.brand img': ['maxWidth', 'height'],
        'main': ['backgroundColor', 'maxWidth', 'paddingLeft', 'paddingRight'],
        '.hero': ['backgroundColor', 'paddingLeft', 'paddingRight', 'paddingTop', 'paddingBottom'],
        '.hero h1': ['fontFamily', 'fontSize', 'fontWeight', 'lineHeight', 'letterSpacing', 'color'],
        '.hero .lede': ['fontSize', 'lineHeight', 'color'],
        '.card': ['backgroundColor', 'paddingLeft', 'paddingRight'],
        'footer': ['backgroundColor', 'color'],
    }
    def styles(page):
        return page.evaluate('''(selectors) => Object.fromEntries(Object.entries(selectors).map(([selector, properties]) => {
          const pseudo = selector.endsWith('::before') ? '::before' : null;
          const node = document.querySelector(selector.replace('::before', ''));
          if (!node) throw new Error('Missing theme component: ' + selector);
          const style = getComputedStyle(node, pseudo);
          return [selector, Object.fromEntries(properties.map(property => [property, style[property]]))];
        }))''', selectors)
    folder = ROOT / 'reports/browser-theme'
    folder.mkdir(exist_ok=True)
    with serving() as (_, site), reference_server(args.reference_site) as reference, sync_playwright() as playwright:
        browser = playwright.chromium.launch(executable_path='/usr/bin/chromium', headless=True, args=['--no-sandbox'])
        actual = browser.new_page()
        expected = browser.new_page()
        for theme, actual_route, reference_route in [('dark', '/', '/'), ('light', '/news/you-just-missed-the-cheritech25-conference-but-wait-you-can-still-attend-the-virtual-replay/', '/discover/')]:
            for width, height in [(1440, 1000), (390, 844)]:
                for page, base, route in [(actual, site, actual_route), (expected, reference, reference_route)]:
                    page.set_viewport_size({'width': width, 'height': height})
                    response = page.goto(base + route, wait_until='networkidle')
                    assert response.status == 200, route
                    page.evaluate('document.fonts.ready')
                actual_styles, expected_styles = styles(actual), styles(expected)
                differences = {selector: {'actual': values, 'zip': expected_styles[selector]} for selector, values in actual_styles.items() if values != expected_styles[selector]}
                assert not differences, (theme, width, differences)
                checks.append({'check': f'{theme} theme matches ZIP at {width}px', 'status': 'passed', 'computed_styles': actual_styles})
                for page, name in [(actual, 'site'), (expected, 'zip')]:
                    page.screenshot(path=str(folder / f'theme-{theme}-{width}-{name}.png'))
        browser.close()
    report = {'status': 'passed', 'reference_archive_sha256': manifest['archive_sha256'], 'checks': checks}
    (ROOT / 'reports/theme-validation.json').write_text(json.dumps(report, indent=2) + '\n')
print('PASS:', len(checks), 'theme checks' + (' including desktop/mobile comparison with the ZIP build' if args.reference_site else ''))
