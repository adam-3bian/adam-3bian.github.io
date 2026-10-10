#!/usr/bin/env python3
"""Phase 1 preservation/asset evidence, independent of removed plugin metadata.

Run with migration Python: audit_phase01.py BEFORE_SITE SITE PROJECT_SITE
PROJECT_SITE is the directory mounted at /cheri-preview. No source is edited.
"""
import hashlib
import json
import re
import sys
import zipfile
from pathlib import Path
from urllib.parse import unquote, urlsplit

from bs4 import BeautifulSoup
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
OUT = Path(__file__).with_name('phase-01-evidence')
BASE = Path(__file__).with_name('phase-00-evidence')
BEFORE, SITE, PROJECT = map(lambda s: Path(s).resolve(), sys.argv[1:])
sys.path.insert(0, str(ROOT / 'scripts'))
from convert_batch import signature


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def load(name):
    return json.loads((BASE / name).read_text())


def output(folder, route):
    path = folder / route.lstrip('/')
    return path / 'index.html' if not route or route.endswith('/') else path


def parse(path):
    return BeautifulSoup(path.read_bytes(), 'html5lib')


def check_links(folder, prefix=''):
    htmls = {p: parse(p) for p in sorted(folder.rglob('*.html'))}
    anchors = {p: {n['id'] for n in s.select('[id]')} for p, s in htmls.items()}
    errors, checks, theme_checks = [], 0, 0
    styles = set()

    def resolve(url, origin):
        u = urlsplit(url)
        if u.scheme or u.netloc:
            return None, None
        path = unquote(u.path)
        if path.startswith('/'):
            if prefix:
                if not (path == prefix or path.startswith(prefix + '/')):
                    return folder / 'MISSING_DEPLOYMENT_PREFIX', None
                path = path[len(prefix):] or '/'
            target = folder / path.lstrip('/')
        else:
            target = origin.parent / path if path else origin
        target = target.resolve()
        if target.is_dir():
            target /= 'index.html'
        return target, unquote(u.fragment)

    for p, soup in htmls.items():
        for n in soup.select('a[href], img[src], script[src], link[href]'):
            url = n.get('href', n.get('src'))
            target, fragment = resolve(url, p)
            if target is None:
                continue
            checks += 1
            theme_asset = (n.name in ('img', 'script', 'link')
                           and not n.find_parent(attrs={'data-source-body': True}))
            theme_checks += int(theme_asset)
            reason = ('missing local target' if not target.is_file() else
                      'missing local anchor' if fragment and target.suffix == '.html'
                      and fragment not in anchors.get(target, set()) else None)
            if reason:
                errors.append({'path': str(p.relative_to(folder)), 'url': url,
                               'reason': reason, 'theme_asset': theme_asset})
            if n.name == 'link' and 'stylesheet' in n.get('rel', []) and target.is_file():
                styles.add(target)
    visited, css_checks = set(), 0
    while styles:
        p = styles.pop()
        if p in visited:
            continue
        visited.add(p)
        for url in re.findall(r'url\(\s*["\']?([^\)"\']+)', p.read_text()):
            target, _ = resolve(url, p)
            if target is None:
                continue
            css_checks += 1
            if not target.is_file():
                errors.append({'path': str(p.relative_to(folder)), 'url': url,
                               'reason': 'missing CSS dependency', 'theme_asset': True})
            elif target.suffix == '.css':
                styles.add(target)
    return {'html_pages': len(htmls), 'local_references': checks, 'theme_asset_references': theme_checks,
            'css_dependencies': css_checks, 'errors': errors}


manifest = load('content-manifest.json')
content = []
for row in manifest:
    before = parse(output(BEFORE, row['route']))
    after = parse(output(SITE, row['route']))
    # Compare all main content, including derived relationships and source text.
    before_sig = signature(BeautifulSoup(str(before.select_one('main')), 'html5lib'))
    after_sig = signature(BeautifulSoup(str(after.select_one('main')), 'html5lib'))
    content.append({'path': row['path'], 'route': row['route'],
                    'source_hash_unchanged': sha(ROOT / row['path']) == row['sha256'],
                    'rendered_signature_unchanged': before_sig == after_sig,
                    'canonical_correct': after.select_one('link[rel=canonical]')['href'] == row['canonical_url'],
                    'intros_before': len(before.select('.page-hero-summary')),
                    'intros_after': len(after.select('.page-hero-summary')),
                    'all_intros_use_lede': all('lede' in p.get('class', []) for p in after.select('.page-hero-summary'))})

assets = [{'path': row['path'], 'unchanged': sha(ROOT / row['path']) == row['sha256']}
          for row in load('assets.json')['files']]
source_assets = [{'url': row['url'], 'path': row['path'],
                  'built_bytes_match': sha(ROOT / row['path']) == sha(SITE / row['path']) == sha(PROJECT / row['path'])}
                 for row in load('assets.json')['source_checks']]
archive = ROOT / 'docs/references/cheri-alliance-starter-kit-simplified-authoring.zip'
with zipfile.ZipFile(archive) as z:
    assert z.testzip() is None
    comparisons = []
    for row in load('theme-inventory.json')['comparisons']:
        comparisons.append({'path': row['path'], 'identical_to_zip':
                            (ROOT / row['path']).read_bytes() == z.read('basic-site/' + row['path'])})
    settings = z.read('basic-site/_sass/settings.scss').decode()
    settings = re.sub(r'(?m)^\$font-stylesheet: [^\n]+$', '$font-stylesheet: "../shared/fonts/poppins-local.css";', settings)
    settings_match = settings == (ROOT / '_sass/settings.scss').read_text()
    favicon_match = z.read('basic-site/favicon.ico') == (ROOT / 'favicon.ico').read_bytes()

tiles = []
for path in sorted((ROOT / 'assets/images/background').glob('*.webp')):
    im = Image.open(path).convert('RGBA')
    alpha = im.getchannel('A')
    rows = [alpha.crop((0, y, im.width, y + 1)).getextrema()[1] for y in range(im.height)]
    tiles.append({'path': str(path.relative_to(ROOT)), 'dimensions': list(im.size),
                  'lossless_vp8l': b'VP8L' in path.read_bytes()[:32],
                  'even_height': im.height % 2 == 0,
                  'transparent_gap_rows': sum(a == 0 for a in rows),
                  'alternating_1px_rows': all(rows[i] == 0 for i in range(1, len(rows), 2))
                  and all(rows[i] > 0 for i in range(0, len(rows), 2))})

root_links = check_links(SITE)
project_links = check_links(PROJECT, '/cheri-preview')
report = {'zip_sha256': sha(archive), 'settings_match_except_local_font_url': settings_match,
          'favicon_matches_zip': favicon_match, 'zip_comparisons': comparisons, 'background_tiles': tiles,
          'content': content, 'assets': assets, 'original_asset_mappings': source_assets,
          'root_links': root_links, 'project_links': project_links,
          'limits': ['Signatures compare Phase 1 before/after, not a new external-source acquisition audit.',
                     'Known root /search/ link and project-prefix source-body links remain reported, not waived as passes.']}
OUT.mkdir(exist_ok=True)
(OUT / 'audit.json').write_text(json.dumps(report, indent=2) + '\n')
summary = {'editorial_records': len(content), 'adapted_introductions': sum(r['intros_after'] for r in content),
           'preserved_assets': len(assets), 'original_asset_mappings': len(source_assets),
           'exact_zip_files': sum(r['identical_to_zip'] for r in comparisons),
           'root_link_errors': len(root_links['errors']), 'project_link_errors': len(project_links['errors']),
           'project_theme_asset_errors': sum(r['theme_asset'] for r in project_links['errors']),
           'background_tiles': tiles}
print(json.dumps(summary, indent=2))
assert settings_match and favicon_match
assert all(r['identical_to_zip'] for r in comparisons
           if r['path'].startswith(('assets/', '_sass/'))
           and r['path'] not in ('_sass/settings.scss', '_sass/_site.scss'))
assert all(r['source_hash_unchanged'] and r['rendered_signature_unchanged'] and r['canonical_correct']
           and r['intros_before'] == r['intros_after'] and r['all_intros_use_lede'] for r in content)
assert all(r['unchanged'] for r in assets)
assert all(r['built_bytes_match'] for r in source_assets)
assert all(r['lossless_vp8l'] and r['even_height'] and r['alternating_1px_rows'] for r in tiles)
assert not [r for r in project_links['errors'] if r['theme_asset']]
assert len(root_links['errors']) == 1 and root_links['errors'][0]['url'] == '/search/'
