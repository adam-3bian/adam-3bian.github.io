#!/usr/bin/env python3
"""Read-only Phase 0 inventory; write new evidence without overwriting history.

Run from the repository root with the migration Python dependencies installed:
  python reports/codex-phases/audit_phase00.py /absolute/path/to/fresh/site
This is an audit helper, not a Jekyll plugin or a production build step.
"""
import collections
import hashlib
import json
import re
import subprocess
import sys
import zipfile
from datetime import date, datetime
from pathlib import Path
from urllib.parse import unquote, urlsplit

import yaml
from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parents[2]
SITE = Path(sys.argv[1]).resolve()
OUT = Path(__file__).resolve().parent / 'phase-00-evidence'
OUT.mkdir(exist_ok=True)
sys.path.insert(0, str(ROOT / 'scripts'))
from convert_batch import signature
from site_model import canonical_signature

def load(path):
    return json.loads((ROOT / path).read_text())

def digest(data):
    return hashlib.sha256(data).hexdigest()

def write(name, value):
    (OUT / name).write_text(json.dumps(value, indent=2, ensure_ascii=False, default=str) + '\n')

def front(path):
    text = (ROOT / path).read_text()
    match = re.match(r'\A---\s*\n(.*?)\n---\s*\n(.*)\Z', text, re.S)
    return (yaml.safe_load(match[1]) or {}, match[2]) if match else ({}, text)

def refs(value):
    return value if isinstance(value, list) else [value] if value else []

def output_path(route):
    route = unquote(urlsplit(route).path).lstrip('/')
    return SITE / route / 'index.html' if not route or route.endswith('/') else SITE / route

def resolve(url, origin):
    parsed = urlsplit(url)
    if parsed.scheme or parsed.netloc:
        return None, None
    path = unquote(parsed.path)
    target = (SITE / path.lstrip('/')) if path.startswith('/') else (origin.parent / path if path else origin)
    target = target.resolve()
    if not target.is_relative_to(SITE):
        return None, None
    if target.is_dir():
        target /= 'index.html'
    elif not target.suffix and (target / 'index.html').is_file():
        target /= 'index.html'
    return target, unquote(parsed.fragment)

tracked = subprocess.check_output(['git', 'ls-files', '-z'], cwd=ROOT).decode().split('\0')
tracked = [p for p in tracked if p]
commit = subprocess.check_output(['git', 'rev-parse', 'HEAD'], cwd=ROOT).decode().strip()
config = yaml.safe_load((ROOT / '_config.yml').read_text())
captures = [r for r in load('reports/capture-index.json')['records'] if r.get('conversion_status') == 'converted']
by_path = collections.defaultdict(list)
for row in captures:
    by_path[row['local_path']].append(row)
derived = {r['path']: r for r in load('reports/derived-content.json')}
editions = {r['path']: r for r in load('reports/website-editions.json')}
groups = list(config['collections'])
editorial = [p for p in tracked if p.endswith('.md') and p.split('/')[0] in ['pages'] + ['_' + g for g in groups]]
htmls = {p: BeautifulSoup(p.read_bytes(), 'html5lib') for p in sorted(SITE.rglob('*.html'))}
all_anchors = {p: {x['id'] for x in s.select('[id]')} for p, s in htmls.items()}
manifest = []
for path in editorial:
    meta, body = front(path)
    group = path.split('/')[0].removeprefix('_')
    route = meta.get('permalink') or config['collections'][group]['permalink'].replace(':name', Path(path).stem)
    values = {}
    for default in config['defaults']:
        scope = default.get('scope', {})
        if (not scope.get('type') or scope['type'] == group) and (not scope.get('path') or scope['path'] == path):
            values.update(default['values'])
    values.update(meta)
    selected = values.get('layout')
    chain = []
    while selected and selected not in chain:
        chain.append(selected)
        layout_path = '_layouts/' + selected + '.html'
        if not (ROOT / layout_path).exists():
            break
        selected = front(layout_path)[0].get('layout')
    classification = ('preserved alternate source version' if meta.get('alternate') else
                      'paper catalogue entry' if group == 'papers' else
                      'source-backed name-only record' if path in derived else
                      'published edition' if path in editions else
                      'complete captured source page' if path in by_path else
                      'repository-authored hub/index/utility')
    output = output_path(route)
    soup = htmls.get(output)
    assets = sorted(set(re.findall(r'(?:\]\(|src=["\'])(/assets/[^)"\'\s]+)', body)))
    relationships = {k: refs(meta.get(k)) for k in ['organization', 'authors', 'speakers'] if meta.get(k)}
    manifest.append({'path': path, 'commit': commit, 'sha256': digest((ROOT / path).read_bytes()),
                     'body_sha256': digest(body.encode()), 'collection': group, 'id': Path(path).stem,
                     'title': meta.get('title'), 'classification': classification,
                     'alternate': meta.get('alternate', False), 'route': route,
                     'canonical_url': config['url'] + route, 'layout_chain': chain,
                     'metadata': meta, 'relationships': relationships, 'assets': assets,
                     'source_urls': [r['url'] for r in by_path[path]],
                     'output_exists': output.is_file(),
                     'output_h1_count': len(soup.select('main h1')) if soup else None,
                     'output_card_count': len(soup.select('main a.card')) if soup else None,
                     'source_card_labels': len(re.findall(r'collection-card__|source-card-label', body)),
                     'missing_assets': [a for a in assets if not (ROOT / a.lstrip('/')).is_file()]})
write('content-manifest.json', manifest)

known = {g: {r['id'] for r in manifest if r['collection'] == g} for g in groups}
proofs = load('reports/relationship-evidence.json')
proof_index = {(p['path'], p['field'], str(p['value'])) for p in proofs}
relationships = []
for record in manifest:
    for field, values in record['relationships'].items():
        for index, target in enumerate(values):
            group = 'organisations' if field == 'organization' else 'people'
            relationships.append({'path': record['path'], 'field': field, 'index': index, 'target': target,
                                  'resolves': target in known[group],
                                  'has_source_evidence': (record['path'], field, str(target)) in proof_index})
board = yaml.safe_load((ROOT / '_data/governing-board.yml').read_text())
write('relationships.json', {'references': relationships, 'board': [{'id': x, 'resolves': x in known['people']} for x in board],
                             'proof_count': len(proofs)})

asset_index = load('reports/asset-index.json')
assets = []
for path in tracked:
    if path.startswith('assets/') or path == 'favicon.ico':
        data = (ROOT / path).read_bytes()
        assets.append({'path': path, 'sha256': digest(data), 'bytes': len(data),
                       'sources': [url for url, r in asset_index.items() if r.get('local_path') == path]})
original_checks = []
for url, row in asset_index.items():
    if row.get('download_status') == 'downloaded':
        file = ROOT / row['local_path']
        original_checks.append({'url': url, 'path': row['local_path'],
                                'source_sha256_matches': file.is_file() and digest(file.read_bytes()) == row['sha256'],
                                'built_sha256_matches': (SITE / row['local_path']).is_file() and digest((SITE / row['local_path']).read_bytes()) == row['sha256']})
write('assets.json', {'files': assets, 'source_checks': original_checks,
                      'unacquired': [r for r in asset_index.values() if r.get('download_status') != 'downloaded']})

archive = ROOT / 'docs/references/cheri-alliance-starter-kit-simplified-authoring.zip'
comparisons = []
with zipfile.ZipFile(archive) as z:
    assert z.testzip() is None
    for item in load('reports/template-integration.json')['imported_files']:
        path = item['path']
        original = z.read('basic-site/' + path)
        current = (ROOT / path).read_bytes()
        comparisons.append({'path': path, 'zip_sha256': digest(original), 'current_sha256': digest(current),
                            'identical': original == current, 'historical_status': item['status']})
components = []
for path in tracked:
    if path.startswith(('_layouts/', '_includes/', '_sass/', 'assets/js/')):
        data = (ROOT / path).read_text()
        components.append({'path': path, 'sha256': digest(data.encode()),
                           'includes': re.findall(r'{%-?\s*include\s+([^\s%]+)', data),
                           'direct_layout_users': [r['path'] for r in manifest if path == '_layouts/' + r['layout_chain'][0] + '.html'] if path.startswith('_layouts/') else []})
write('theme-inventory.json', {'zip_sha256': digest(archive.read_bytes()), 'comparisons': comparisons, 'components': components,
                              'navigation': config['navigation'], 'data_files': [p for p in tracked if p.startswith('_data/')]})

errors = []
checks = 0
stylesheets = set()
redirects = []
rendered = []
for file, soup in htmls.items():
    for node in soup.select('a[href], img[src], script[src], link[href]'):
        url = node.get('href', node.get('src'))
        target, fragment = resolve(url, file)
        if target is None:
            continue
        checks += 1
        if node.name == 'link' and 'stylesheet' in node.get('rel', []) and target.is_file():
            stylesheets.add(target)
        reason = 'missing local target' if not target.is_file() else 'missing local anchor' if fragment and target.suffix == '.html' and fragment not in all_anchors.get(target, set()) else None
        if reason:
            errors.append({'path': str(file.relative_to(SITE)), 'url': url, 'reason': reason})
    refresh = soup.select_one('meta[http-equiv="refresh"]')
    if refresh:
        redirects.append({'path': str(file.relative_to(SITE)), 'refresh': refresh.get('content'),
                          'canonical': soup.select_one('link[rel="canonical"]')['href']})
    ids = [x['id'] for x in soup.select('[id]')]
    rendered.append({'path': str(file.relative_to(SITE)), 'h1_count': len(soup.select('main h1')),
                     'duplicate_ids': [x for x, count in collections.Counter(ids).items() if count > 1],
                     'missing_aria_labels': [{'tag': n.name, 'id': name} for n in soup.select('[aria-labelledby]') for name in n['aria-labelledby'].split() if name not in ids],
                     'has_slider': bool(soup.select('.slider')), 'has_where_next': bool(soup.select('#where-next')),
                     'has_related_pages': bool(soup.select('#related-pages')),
                     'directory_cards': [a['href'] for a in soup.select('[data-collection-index] a.card')],
                     'directory_images': len(soup.select('[data-collection-index] .card img')),
                     'relationships': {s['data-relationship']: [a['href'] for a in s.select('a.card')] for s in soup.select('[data-relationship]')},
                     'canonical': soup.select_one('link[rel="canonical"]')['href'] if soup.select_one('link[rel="canonical"]') else None})
css_checks = 0
visited = set()
while stylesheets:
    file = stylesheets.pop()
    if file in visited:
        continue
    visited.add(file)
    text = file.read_text()
    for url in re.findall(r'url\(\s*["\']?([^\)"\']+)', text) + re.findall(r'@import\s+["\']([^"\']+)', text):
        target, _ = resolve(url.strip(), file)
        if target is None:
            continue
        css_checks += 1
        if not target.is_file():
            errors.append({'path': str(file.relative_to(SITE)), 'url': url, 'reason': 'missing stylesheet dependency'})
        elif target.suffix == '.css':
            stylesheets.add(target)
write('links.json', {'html_files': len(htmls), 'local_references': checks, 'stylesheet_references': css_checks, 'errors': errors})
write('rendered-pages.json', rendered)
order_checks = []
for record in manifest:
    soup = htmls.get(output_path(record['route']))
    if not soup:
        continue
    for field, ids in record['relationships'].items():
        group = 'organisations' if field == 'organization' else 'people'
        expected = ['/' + group + '/' + identifier + '/' for identifier in ids]
        actual = [a['href'] for a in soup.select('[data-relationship="' + field + '"] a.card')]
        if expected != actual:
            order_checks.append({'path': record['path'], 'field': field, 'expected': expected,
                                 'actual': actual, 'same_set': set(expected) == set(actual)})
write('relationship-order.json', order_checks)
reverse_checks = []
for record in manifest:
    if record['collection'] not in ('people', 'organisations'):
        continue
    soup = htmls.get(output_path(record['route']))
    targets = [('events', 'speakers'), ('papers', 'authors'), ('news', 'authors')] if record['collection'] == 'people' else [('people', 'organization')]
    for group, field in targets:
        expected = [r['route'] for r in manifest if r['collection'] == group and not r['alternate'] and record['id'] in r['relationships'].get(field, [])]
        actual = [a['href'] for a in soup.select('[data-relationship="' + group + '"] a.card')]
        if sorted(actual) != sorted(expected):
            reverse_checks.append({'path': record['path'], 'field': group, 'expected': expected, 'actual': actual})
write('reverse-relationship-errors.json', reverse_checks)
route_map = load('reports/route-map.json')
write('routes.json', {'redirects': redirects, 'mapped_routes': [{'route': r, 'exists': output_path(r).is_file()} for r in sorted(set(route_map.values()))],
                      'duplicate_editorial_routes': {r: [m['path'] for m in manifest if m['route'] == r] for r, c in collections.Counter(m['route'] for m in manifest).items() if c > 1},
                      'source_aliases': load('reports/source-route-aliases.json')})

fidelity = []
for row in captures + load('reports/paper-validation.json'):
    route = row['local_route']
    soup = htmls.get(output_path(route))
    source = row.get('source_signature')
    if source is None:
        source = load('reports/validation/' + digest(row['url'].encode())[:16] + '/source-signature.json')
    expected = canonical_signature(source, route_map)
    if soup and (soup.select_one('[data-source-body]') or soup.select_one('main')):
        actual = json.loads(json.dumps(signature(soup.select_one('[data-source-body]') or soup.select_one('main'), row.get('asset_mapping'))))
        changed = [key for key in expected if expected[key] != actual[key]]
        diagnostic = False
        if changed:
            copied = BeautifulSoup(str(soup.select_one('[data-source-body]') or soup.select_one('main')), 'html5lib')
            heading = copied.select_one('.hero h1#hero-title')
            if heading:
                heading.decompose()
                diagnostic = json.loads(json.dumps(signature(copied, row.get('asset_mapping')))) == expected
        fidelity.append({'path': row['local_path'], 'route': route, 'source_url': row.get('url'),
                         'changed_signature_fields': changed, 'status': 'failed' if changed else 'passed',
                         'diagnostic_extra_synthetic_heading_only': diagnostic,
                         'expected_text_sha256': digest(expected['text'].encode()), 'actual_text_sha256': digest(actual['text'].encode())})
    else:
        fidelity.append({'path': row['local_path'], 'route': route, 'status': 'missing output'})
write('historical-body-comparison.json', fidelity)

event_dates = []
for record in manifest:
    if record['collection'] == 'events':
        label = re.search(r'^Date\n: (.+)$', front(record['path'])[1], re.M)[1]
        parts = re.search(r'(\d{1,2})(?:\s+(?:to|[-–])\s+(\d{1,2}))?\s+([A-Za-z]+)\s+(\d{4})', label)
        end = datetime.strptime(f'{parts[2] or parts[1]} {parts[3]} {parts[4]}', '%d %B %Y').date()
        event_dates.append({'id': record['id'], 'date_label': label, 'last_day': str(end),
                            'status_at_2026_10_10': 'past' if end < date(2026, 10, 10) else 'upcoming'})
date_fallbacks = []
for kind in ('news', 'events'):
    soup = htmls[output_path('/' + kind + '/')]
    for record in manifest:
        if record['collection'] != kind or record['alternate'] or record['metadata'].get('date'):
            continue
        card = soup.select_one('a.card[href="' + record['route'] + '"]')
        date_fallbacks.append({'path': record['path'], 'displayed_date': card.select_one('time').get_text() if card and card.select_one('time') else None})
canonical_errors = []
for record in manifest:
    soup = htmls.get(output_path(record['route']))
    tag = soup.select_one('link[rel="canonical"]') if soup else None
    if not tag or tag['href'] != record['canonical_url']:
        canonical_errors.append({'path': record['path'], 'expected': record['canonical_url'], 'actual': tag['href'] if tag else None})
write('content-details.json', {'events': event_dates, 'directories': [r for r in rendered if r['directory_cards']],
      'canonical_errors': canonical_errors, 'unsourced_displayed_dates': date_fallbacks,
      'news_with_authors': sum(bool(r['relationships'].get('authors')) for r in manifest if r['collection'] == 'news'),
      'canonical_news_with_authors': sum(bool(r['relationships'].get('authors')) for r in manifest if r['collection'] == 'news' and not r['alternate']),
      'news_with_dates': sum(bool(r['metadata'].get('date')) for r in manifest if r['collection'] == 'news'),
      'people_with_body_images': sum(bool(r['assets']) for r in manifest if r['collection'] == 'people'),
      'members_with_body_images': sum(bool(r['assets']) for r in manifest if r['collection'] == 'organisations' and r['metadata'].get('member')),
      'named_duplicates': {k: v for k, v in collections.Counter(r['title'] for r in manifest if r['collection'] == 'people').items() if v > 1},
      'native_rendered_components': {'sliders': sum(r['has_slider'] for r in rendered), 'where_next': sum(r['has_where_next'] for r in rendered), 'related_pages': sum(r['has_related_pages'] for r in rendered)},
      'source_component_classes': {c: sum(c in front(r['path'])[1] for r in manifest) for c in ['collection-card__', 'where-next-title', 'related-pages-title', 'source-card-label']}})

summary = {'starting_commit': commit, 'site_directory': str(SITE), 'editorial_records': len(manifest),
           'collections': dict(collections.Counter(r['collection'] for r in manifest)),
           'classifications': dict(collections.Counter(r['classification'] for r in manifest)),
           'layouts': dict(collections.Counter(r['layout_chain'][0] for r in manifest)),
           'alternate_records': sum(r['alternate'] for r in manifest),
           'member_flags': sum(r['metadata'].get('member') is True for r in manifest),
           'speaker_flags': sum(r['metadata'].get('speaker') is True for r in manifest),
           'relationship_edges': dict(collections.Counter(r['field'] for r in relationships)),
           'unresolved_relationships': [r for r in relationships if not r['resolves']],
           'relationships_without_evidence': [r for r in relationships if not r['has_source_evidence']],
           'zip_files_identical': sum(x['identical'] for x in comparisons), 'zip_files_compared': len(comparisons),
           'asset_files': len(assets), 'asset_bytes': sum(r['bytes'] for r in assets),
           'asset_extensions': dict(collections.Counter(Path(a['path']).suffix for a in assets)),
           'original_asset_mappings': len(original_checks), 'failed_asset_mappings': [r for r in original_checks if not r['source_sha256_matches'] or not r['built_sha256_matches']],
           'html_files': len(htmls), 'local_link_errors': len(errors),
           'fidelity': dict(collections.Counter(r['status'] for r in fidelity)),
           'multiple_h1_pages': sum(r['output_h1_count'] != 1 for r in manifest),
           'records_with_parent': sum(bool(r['metadata'].get('parent')) for r in manifest),
           'records_with_slider': sum(bool(r['metadata'].get('slider')) for r in manifest),
           'records_with_where_next': sum(bool(r['metadata'].get('where-next')) for r in manifest),
           'records_with_related_pages': sum(bool(r['metadata'].get('related-pages')) for r in manifest),
           'records_with_thumbnail': sum(bool(r['metadata'].get('thumbnail')) for r in manifest),
           'directory_records': [{'path': r['path'], 'listing': r['metadata']['listing']} for r in manifest if r['metadata'].get('listing')]}
write('summary.json', summary)
print(json.dumps(summary, indent=2))
