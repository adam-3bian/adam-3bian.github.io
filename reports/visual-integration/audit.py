#!/usr/bin/env python3
"""Native visual-integration audit: BEFORE_SITE SITE PROJECT_SITE. No network or old report writes."""
import ast
from collections import Counter, defaultdict
import hashlib
import json
from pathlib import Path
import re
import subprocess
import sys
from urllib.parse import unquote, urlsplit
import xml.etree.ElementTree as ET
import zipfile

from bs4 import BeautifulSoup, Tag
import yaml

ROOT = Path(__file__).resolve().parents[2]
OUT = Path(__file__).with_name('evidence')
BEFORE, SITE, PROJECT = [Path(p).resolve() for p in sys.argv[1:]]
sys.path.insert(0, str(ROOT / 'scripts'))
from convert_batch import signature
from site_model import canonical_signature, document, without_baseurl

# Import only pure functions, never another phase's evidence writer.
for script, names in [('audit_phase04.py', ['links', 'parse', 'output', 'relationships', 'references', 'section_nodes']),
                      ('audit_phase05.py', ['fragments'])]:
    tree = ast.parse((ROOT / 'reports/codex-phases' / script).read_text())
    exec(compile(ast.Module(body=[n for n in tree.body if isinstance(n, ast.FunctionDef) and n.name in names], type_ignores=[]), script, 'exec'))


def digest(data):
    return hashlib.sha256(data).hexdigest()


def save(name, value):
    (OUT / (name + '.json')).write_text(json.dumps(value, indent=2, ensure_ascii=False) + '\n')


def sig(soup, mappings=None):
    return json.loads(json.dumps(signature(soup, mappings)))


def norm(soup):
    return ' '.join(soup.stripped_strings)


inventory = json.loads((OUT / 'input-inventory.json').read_text())
records = inventory['records']
config = yaml.safe_load((ROOT / '_config.yml').read_text())
routes = json.loads((ROOT / 'reports/route-map.json').read_text())
current = {r['path']: document(r['path']) for r in records}
# One native Kramdown process, with precisely the site's rendering settings.
ruby = """require 'json'; require 'kramdown'
puts JSON.generate(JSON.parse(STDIN.read).transform_values { |body|
 Kramdown::Document.new(body, input: 'Kramdown', auto_ids: false,
 smart_quotes: %w[apos apos quot quot], typographic_symbols:
 {hellip: '...', mdash: '---', ndash: '--', laquo: '<<', raquo: '>>'}).to_html })"""
rendered = json.loads(subprocess.run(['sh', '/workspace/cheri-native-bundle.sh', 'exec', 'ruby', '-e', ruby],
    input=json.dumps({p: body for p, (meta, body) in current.items()}), text=True, capture_output=True, check=True).stdout)
root = {p: parse(p) for p in SITE.rglob('*.html')}
project = {p: parse(p) for p in PROJECT.rglob('*.html')}
failures = []
presentation_metadata = json.loads((OUT / 'presentation-metadata.json').read_text())

# Historical source signatures are available; raw capture availability is measured
# independently. Do not pretend saved signatures are freshly checksum-read HTML.
historical = []
captures = json.loads((ROOT / 'reports/capture-index.json').read_text())['records']
for r in captures:
    if r.get('conversion_status') != 'converted':
        continue
    p = ROOT / 'reports/validation' / digest(r['url'].encode())[:16] / 'source-signature.json'
    expected = canonical_signature(json.loads(p.read_text()), routes)
    actual = sig(BeautifulSoup(rendered[r['local_path']], 'html.parser'), r.get('asset_mapping'))
    raw = ROOT / r['snapshot_path']
    checks = {key: actual[key] == expected[key] for key in expected}
    historical.append({'source_url': r['url'], 'path': r['local_path'], 'signature_file': str(p.relative_to(ROOT)),
        'signature_sha256': digest(p.read_bytes()), 'recorded_capture_sha256': r['sha256'],
        'raw_capture_available': raw.is_file(), 'raw_checksum': digest(raw.read_bytes()) == r['sha256'] if raw.is_file() else None,
        'checks': checks})
    if not all(checks.values()):
        failures.append({'historical': r['url'], 'checks': checks})
save('historical-source-audit', historical)

papers = []
for r in json.loads((ROOT / 'reports/paper-validation.json').read_text()):
    actual = sig(BeautifulSoup(rendered[r['local_path']], 'html.parser'), r.get('asset_mapping'))
    checks = {k: v == actual[k] for k, v in canonical_signature(r['source_signature'], routes).items()}
    papers.append({'path': r['local_path'], 'publication_url': r['publication_url'], 'checks': checks,
                   'scope': 'Complete catalogue entry; no acquired external full paper is claimed.'})
    if not all(checks.values()):
        failures.append({'paper': r['local_path'], 'checks': checks})

derived = json.loads((ROOT / 'reports/derived-content.json').read_text())
for r in derived:
    meta, body = current[r['path']]
    evidence_path = r.get('evidence', 'reports/validation/' + digest(r['source_url'].encode())[:16] + '/source-signature.json')
    evidence = json.loads((ROOT / evidence_path).read_text())
    labels = [r['source_label']] if 'source_label' in r else r['source_names']
    r['checks'] = {'name_only': body.strip() == '# ' + meta['title'],
                   'source_label_present': all(label in evidence['text'] for label in labels)}
    if not all(r['checks'].values()):
        failures.append({'derived': r['path'], 'checks': r['checks']})

editions = json.loads((ROOT / 'reports/website-editions.json').read_text())
for r in editions:
    meta, original = current[r['original_markdown']]
    published_meta, published = current[r['path']]
    for before, after in r['edits']:
        original = original.replace(before, after)
    if r['listing']:
        original = re.split(r'!\[', original, maxsplit=1)[0].rstrip()
    r['checks'] = {'retained_alternate': meta.get('alternate') is True,
                   'declared_edits_only': original.strip() == published.strip()}
    if not all(r['checks'].values()):
        failures.append({'edition': r['path'], 'checks': r['checks']})
save('derived-and-edition-audit', {'papers': papers, 'name_only': derived, 'editions': editions})

# Check the complete Markdown -> actual page transformation. Every presentation
# exclusion has an independent comparison below; prose is never excerpt-compared.
onward_map = {r['path']: r for r in json.loads((ROOT / 'reports/codex-phases/phase-02-evidence/onward-mapping.json').read_text())}
title_by_route = {r['route']: current[r['path']][0]['title'] for r in records}
source_cards, onward, body_checks = [], [], []
coverage = defaultdict(list)
for r in historical:
    coverage[r['path']].append('captured-source-signature')
for kind, rows in [('paper-catalogue', papers), ('verified-name-only', derived), ('declared-website-edition', editions)]:
    for r in rows:
        coverage[r['path']].append(kind)

for row in records:
    path, route = row['path'], row['route']
    meta, body = current[path]
    soup = root[output(SITE, route)]
    b = BeautifulSoup(rendered[path], 'html.parser')
    a = BeautifulSoup(str(soup.select_one('[data-source-body]')), 'html.parser')
    source_ids = {n['id'] for n in b.select('[id]')}
    for n in a.select('.slider, [aria-hidden=true]'):
        n.decompose()
    if not b.select_one('.source-breadcrumbs'):
        for n in a.select('.breadcrumbs'):
            n.decompose()
    # Each source navigation block maps to explicit, previously documented fields.
    for h in list(b.select('.where-next-title, .related-pages-title')):
        for n in section_nodes(h):
            n.extract()
    if path in onward_map:
        for mapping in onward_map[path]['sections']:
            kind = mapping['component']
            component = BeautifulSoup(str(soup.select_one('[data-source-component="' + kind + '"]')), 'html.parser')
            for n in component.select('[aria-hidden=true]'):
                n.decompose()
            cards = component.select('a.card')
            checks = {'count': len(cards) == len(mapping['items'])}
            for item, card in zip(mapping['items'], cards):
                title = item.get('title', title_by_route.get(item['url']))
                checks[item['url']] = (card['href'] == item['url'] and card.h3.get_text() == title
                    and card.select_one('.card-action').get_text(' ', strip=True) == item.get('action', 'Continue' if kind == 'where-next' else 'Explore')
                    and (not component.select('p') if kind == 'where-next' else card.select_one('.card-description').get_text() == item['description']))
            onward.append({'path': path, 'kind': kind, 'checks': checks})

    originals = fragments(b)
    cards = a.select('[data-source-cards] a.card, [data-relationship=speakers] a.card, [data-people-list] a.card') if originals else []
    assert len(originals) == len(cards), (path, len(originals), len(cards))
    for nodes, card in zip(originals, cards):
        original = BeautifulSoup(''.join(map(str, nodes)), 'html.parser')
        urls = {n['href'] for n in original.select('a[href]')}
        portrait_reuse = bool(card.find_parent(attrs={'data-relationship': 'speakers'}) or card.find_parent(attrs={'data-people-list': True}))
        expected_images = [(n['src'], n.get('alt', '')) for n in original.select('img')]
        original_images = expected_images
        if portrait_reuse:
            portrait = root[output(SITE, card['href'])].select_one('[data-source-body] img')
            expected_images = [(portrait['src'], portrait.get('alt', ''))]
        checks = {'full_text_order': norm(original) == norm(card), 'destination': urls == {card['href']},
                  'headings': [(n.name, n.get_text(), n.get('id')) for n in original.select('h2,h3,h4')] == [(n.name, n.get_text(), n.get('id')) for n in card.select('h2,h3,h4')],
                  'images': expected_images == [(n['src'], n.get('alt', '')) for n in card.select('img')]}
        source_cards.append({'path': path, 'url': card['href'], 'checks': checks,
            'canonical_portrait_reuse': portrait_reuse, 'original_images': original_images, 'rendered_images': expected_images})
        for n in nodes:
            n.extract()
        card.decompose()
    for n in a.select('[data-source-cards], [data-relationship=speakers] ul.cards, .index-list'):
        n.decompose()
    # Native hero supplies an H1 only when absent in source; chapter H1s become H2.
    if not b.h1:
        a.h1.decompose()
    else:
        for h in b.select('h1')[1:]:
            h.name = 'h2'
        if not b.h1.get('id'):
            a.h1.attrs.pop('id', None)
    # Native cards add one heading for each retained talk-title paragraph.
    # Compare every title/date/location/link against Markdown after undoing only
    # these presentation wrappers, never omitting a talk or its content.
    for talk_list in a.select('[data-source-talks]'):
        for card in talk_list.select(':scope > li > article'):
            card.h3.name = 'p'
            card.unwrap()
        for item in talk_list.select(':scope > li'):
            item.unwrap()
        talk_list.unwrap()
    bs, actual = sig(b), sig(a)
    differences = {k: {'expected': bs[k], 'actual': actual[k]} for k in bs if bs[k] != actual[k]}
    new_ids = [n['id'] for n in soup.select('[id]')]
    old_bytes = (ROOT / path).read_bytes()
    old_body = old_bytes.split(b'---', 2)[2]
    projected = without_baseurl(BeautifulSoup(str(project[output(PROJECT, route)].select_one('[data-source-body]')), 'html.parser'), '/cheri-preview')
    checks = {'source_signature': not differences,
        'body_unchanged': digest(old_body) == row['body_sha256'],
        'metadata_only_declared_presentation': meta == {**row['metadata'], **presentation_metadata.get(path, {})},
        'anchors_preserved': source_ids <= set(new_ids), 'ids_unique': len(new_ids) == len(set(new_ids)),
        'one_h1': len(soup.select('main h1')) == 1,
        'canonical': soup.select_one('link[rel=canonical]')['href'] == config['url'] + route,
        'project_prose': sig(projected) == sig(BeautifulSoup(str(soup.select_one('[data-source-body]')), 'html.parser'))}
    body_checks.append({'path': path, 'route': route, 'coverage': sorted(set(coverage[path])) or ['repository-authored-index-or-system-page'],
        'checks': checks, 'body_sha256': digest(old_body), 'alternate': bool(meta.get('alternate')),
        'source_counts': {k: len(v) for k, v in sig(BeautifulSoup(rendered[path], 'html.parser')).items()},
        'source_ids': sorted(source_ids)})
    if not all(checks.values()):
        failures.append({'path': path, 'checks': checks, 'differences': differences, 'missing_ids': sorted(source_ids - set(new_ids))})
for r in source_cards + onward:
    if not all(r['checks'].values()):
        failures.append(r)
save('rendered-content-audit', {'records': body_checks, 'source_cards': source_cards, 'source_navigation': onward})
save('fidelity-failures', failures)
print('Historical mappings:', len(historical), 'papers:', len(papers), 'name-only:', len(derived), 'editions:', len(editions), flush=True)
print('Rendered records:', len(body_checks), 'source cards:', len(source_cards), 'navigation:', len(onward), 'failures:', len(failures), flush=True)


def full_links(folder, soups, prefix=''):
    """Include canonical/refresh targets and media attributes beyond the old audit."""
    result = links(folder, soups, prefix)
    extra, external, attributes = 0, Counter(), Counter()
    anchors = {p: {n['id'] for n in s.select('[id]')} for p, s in soups.items()}
    own_host = urlsplit(config['url']).netloc

    def check(value, origin):
        nonlocal extra
        u = urlsplit(value)
        if u.netloc and u.netloc != own_host or u.scheme and u.scheme not in ['http', 'https']:
            external[value] += 1
            return
        extra += 1
        path = unquote(u.path)
        if path.startswith('/'):
            if prefix and not (path == prefix or path.startswith(prefix + '/')):
                result['errors'].append({'page': str(origin.relative_to(folder)), 'url': value, 'reason': 'missing deployment prefix'})
                return
            path = path[len(prefix):] if prefix else path
            target = folder / path.lstrip('/')
        else:
            target = origin.parent / path if path else origin
        if target.is_dir():
            target /= 'index.html'
        target = target.resolve()
        reason = 'outside build' if not target.is_relative_to(folder) else 'missing target' if not target.is_file() else (
            'missing anchor' if u.fragment and target.suffix == '.html' and unquote(u.fragment) not in anchors.get(target, set()) else None)
        if reason:
            result['errors'].append({'page': str(origin.relative_to(folder)), 'url': value, 'reason': reason})

    for p, s in soups.items():
        for n in s.select('a[href],img[src],script[src],link[href]'):
            value = n.get('href', n.get('src'))
            if urlsplit(value).netloc == own_host:
                check(value, p)
            elif urlsplit(value).netloc:
                external[value] += 1
        for n in s.select('source[src],video[src],video[poster],audio[src],iframe[src],object[data],form[action],area[href],input[src],img[srcset],source[srcset],meta[http-equiv]'):
            for attr in ['src', 'poster', 'data', 'action', 'href', 'srcset']:
                if not n.has_attr(attr):
                    continue
                attributes[attr] += 1
                # Current input has no data-URL srcsets; don't split a data payload.
                values = [n[attr]] if attr != 'srcset' else [v.strip().split()[0] for v in n[attr].split(',')]
                for value in values:
                    check(value, p)
            if n.name == 'meta' and n.get('http-equiv', '').lower() == 'refresh':
                attributes['refresh'] += 1
                check(n['content'].split('url=', 1)[1], p)
    result.update({'additional_local_references': extra, 'extra_attributes': dict(attributes),
                   'external_urls_not_requested': dict(sorted(external.items()))})
    return result


root_links = full_links(SITE, root)
project_links = full_links(PROJECT, project, '/cheri-preview')
save('root-links', root_links)
save('project-links', project_links)
assert not root_links['errors'] and not project_links['errors'], 'See link reports'

# Every public record, original mapped route and former-path redirect is accounted
# for; a real page always wins over an alias occupying the same output filename.
mapped_routes = []
for source, target in routes.items():
    u = urlsplit(target)
    target_path = output(SITE, u.path)
    okay = target_path.is_file() and (not u.fragment or root[target_path].find(id=unquote(u.fragment)) is not None)
    mapped_routes.append({'source': source, 'target': target, 'correct': okay})
assert all(r['correct'] for r in mapped_routes)
redirects = []
for p, s in root.items():
    refresh = s.select_one('meta[http-equiv=refresh]')
    if not refresh:
        continue
    target = refresh['content'].split('url=', 1)[1]
    destination = output(SITE, target)
    projected = project[PROJECT / p.relative_to(SITE)]
    checks = {'target_exists': destination.is_file(), 'direct_to_content': not root[destination].select_one('meta[http-equiv=refresh]'),
        'fallback': s.a['href'] == target, 'canonical': s.select_one('link[rel=canonical]')['href'] == config['url'] + target,
        'noindex': 'noindex' in s.select_one('meta[name=robots]')['content'],
        'project_target': projected.select_one('meta[http-equiv=refresh]')['content'] == '0;url=/cheri-preview' + target,
        'project_fallback': projected.a['href'] == '/cheri-preview' + target}
    redirects.append({'output': str(p.relative_to(SITE)), 'target': target, 'checks': checks})
assert all(all(r['checks'].values()) for r in redirects)
existing_redirects = sorted((ROOT / 'pages/native-redirects').glob('*.html'))
for p in existing_redirects:
    old = subprocess.check_output(['git', 'show', inventory['baseline'] + ':' + str(p.relative_to(ROOT))], cwd=ROOT).decode()
    prior_meta = yaml.safe_load(old.split('---', 2)[1])
    current_meta = yaml.safe_load(p.read_text().split('---', 2)[1])
    assert current_meta['permalink'] == prior_meta['permalink']
    assert old == p.read_text()
former_paths = json.loads((ROOT / 'reports/codex-phases/phase-07-evidence/redirect-provenance.json').read_text())
assert all(output(SITE, r['route']).is_file() for r in former_paths['added'])
occupied_exceptions = []
for r in former_paths['occupied_paths']:
    canonical = root[SITE / r['output']].select_one('link[rel=canonical]')['href']
    differing = [m for m in r['mappings'] if canonical != config['url'] + m['target']]
    if differing:
        occupied_exceptions.append({**r, 'retained_canonical': canonical, 'differing_mappings': differing,
                                   'decision': 'Retain the existing real page; alternate source output remains available at its mapped route.'})
expected_sitemap = {config['url'] + r['route'] for r in records if not r['metadata'].get('alternate') and r['route'] != '/404.html'}
locations = [n.text for n in ET.parse(SITE / 'sitemap.xml').findall('.//{http://www.sitemaps.org/schemas/sitemap/0.9}loc')]
prefix_locations = [n.text for n in ET.parse(PROJECT / 'sitemap.xml').findall('.//{http://www.sitemaps.org/schemas/sitemap/0.9}loc')]
assert len(locations) == len(set(locations)) and set(locations) == expected_sitemap
assert set(prefix_locations) == {v.replace(config['url'], config['url'] + '/cheri-preview', 1) for v in expected_sitemap}
assert {n.text for n in ET.parse(BEFORE / 'sitemap.xml').findall('.//{http://www.sitemaps.org/schemas/sitemap/0.9}loc')} == set(locations)
save('route-audit', {'source_mappings': mapped_routes, 'redirects': redirects, 'occupied_path_exceptions': occupied_exceptions,
                    'sitemap_count': len(locations), 'sitemap_exact': True,
                    'collection_counts': dict(Counter(r['path'].split('/')[0] for r in records)),
                    'html_outputs': len(root), 'project_html_outputs': len(project)})

entities = {c: {Path(r['path']).stem: r for r in records if r['path'].startswith('_' + c + '/')} for c in config['collections']}
edges, reverse = [], []
for r in records:
    for field, collection in [('authors', 'people'), ('speakers', 'people'), ('organization', 'organisations')]:
        ids = references(r['metadata'].get(field))
        actual = relationships(root[output(SITE, r['route'])]).get(field, [])
        assert len(ids) == len(set(ids)) and all(id in entities[collection] for id in ids)
        assert actual == ['/' + collection + '/' + id + '/' for id in ids], (r['path'], field, actual, ids)
        edges.extend({'path': r['path'], 'field': field, 'id': id} for id in ids)
for id, r in entities['people'].items():
    actual = relationships(root[output(SITE, r['route'])])
    for collection, field in [('news', 'authors'), ('events', 'speakers'), ('papers', 'authors')]:
        expected = [v['route'] for v in entities[collection].values() if not v['metadata'].get('alternate') and id in references(v['metadata'].get(field))]
        assert sorted(actual.get(collection, [])) == sorted(expected), (id, collection)
        reverse.append({'person': id, 'collection': collection, 'targets': actual.get(collection, [])})
board = yaml.safe_load((ROOT / '_data/governing-board.yml').read_text())
assert len(board) == len(set(board)) and all(id in entities['people'] for id in board)
save('relationship-audit', {'forward': edges, 'reverse': reverse, 'board': board, 'missing_ids': []})

asset_rows = json.loads((ROOT / 'reports/asset-index.json').read_text())
assets = []
for url, r in asset_rows.items():
    if r.get('download_status') != 'downloaded':
        continue
    p = ROOT / r['local_path']
    excluded = r['local_path'] in config['exclude']
    checks = {name: (not pth.exists() if excluded and name != 'source' else
                    pth.is_file() and digest(pth.read_bytes()) == r['sha256']) for name, pth in
              [('source', p), ('root', SITE / r['local_path']), ('project', PROJECT / r['local_path'])]}
    assets.append({'source_url': url, 'path': r['local_path'], 'sha256': r['sha256'], 'published': not excluded, 'checks': checks})
assert all(all(r['checks'].values()) for r in assets)
from PIL import Image
decoded = []
for path in sorted({r['path'] for r in assets}):
    p = ROOT / path
    if p.suffix.lower() in ['.jpg', '.jpeg', '.png', '.webp', '.gif']:
        with Image.open(p) as im:
            im.load()
            decoded.append({'path': path, 'format': im.format, 'dimensions': list(im.size)})
    elif p.suffix == '.svg':
        ET.fromstring(p.read_bytes())
        decoded.append({'path': path, 'format': 'SVG'})
    elif p.suffix.lower() == '.pdf':
        assert p.read_bytes().startswith(b'%PDF-')
        decoded.append({'path': path, 'format': 'PDF header plus recorded SHA-256'})
frozen_checks = {p: digest((ROOT / p).read_bytes()) == sha for p, sha in inventory['other_inputs'].items() if p != 'assets/js/slider.js'}
assert all(frozen_checks.values())
with zipfile.ZipFile(ROOT / 'docs/references/cheri-alliance-starter-kit-simplified-authoring.zip') as z:
    slider = {p: (ROOT / p).read_bytes() == z.read('basic-site/' + p) for p in ['_includes/slider.html', '_sass/_slider.scss', 'assets/js/slider.js']}
assert all(slider.values())
save('asset-audit', {'source_assets': assets, 'decoded': decoded, 'frozen_inputs_unchanged': frozen_checks, 'slider_zip_exact': slider})

unprocessed = [r for r in captures if r.get('conversion_status') != 'converted']
save('exceptions', {
    'raw_captures': {'indexed_html_capture_records': sum(bool(r.get('snapshot_path')) and r.get('content_type') == 'page' for r in captures),
        'available_html_captures': sum(bool(r.get('snapshot_path')) and r.get('content_type') == 'page' and (ROOT / r['snapshot_path']).is_file() for r in captures),
        'indexed_asset_snapshot_files_available': sum(bool(r.get('snapshot_path')) and r.get('content_type') == 'asset' and (ROOT / r['snapshot_path']).is_file() for r in captures),
        'converted_mappings_without_raw_capture': sum(not r['raw_capture_available'] for r in historical),
        'scope': 'Saved source signatures and catalogue evidence checked; raw capture checksums cannot be freshly verified.'},
    'unprocessed_discovery_records': {'count': len(unprocessed), 'fetch_statuses': dict(Counter(r.get('fetch_status') for r in unprocessed)),
        'scope': 'Discovery URLs are not a count of missing articles. External archive completeness is unverified; no new scrape performed.'},
    'asset_records_without_download': {u: r for u, r in asset_rows.items() if r.get('download_status') != 'downloaded'},
    'documented_same_entity_image_repairs': json.loads((ROOT / 'reports/source-image-repairs.json').read_text()),
    'external_papers': json.loads((ROOT / 'reports/paper-download-status.json').read_text()),
    'former_path_collision': occupied_exceptions,
    'canonical_portrait_substitutions': sum(r['canonical_portrait_reuse'] for r in source_cards),
    'where_next_descriptions_omitted_by_explicit_design': sum(r['kind'] == 'where-next' for r in onward),
    'redirect_fragment_fallback': 'With JavaScript, static redirect enhancement retains query and fragment. Without JavaScript, meta refresh reaches the destination but cannot dynamically transfer them.',
    'remote_links': 'External URLs retained and enumerated, not newly fetched. No live deployment or cross-domain redirect was tested.'})
summary = {'baseline': inventory['baseline'], 'records': len(records), 'historical_mappings': len(historical),
    'historical_unique_bodies': len({r['path'] for r in historical}), 'papers': len(papers), 'name_only': len(derived),
    'website_editions': len(editions), 'coverage': dict(Counter(r['coverage'][0] for r in body_checks)),
    'alternates': sum(r['alternate'] for r in body_checks), 'source_cards': len(source_cards), 'source_navigation': len(onward),
    'forward_edges': len(edges), 'reverse_edges': sum(len(r['targets']) for r in reverse),
    'original_asset_mappings': len(assets), 'unique_original_assets': len({r['path'] for r in assets}),
    'decoded_images_or_pdf_headers': len(decoded), 'html_outputs': len(root),
    'redirects': len(redirects), 'compatibility_redirects': len(former_paths['added']), 'sitemap': len(locations),
    'root_local_references': root_links['local_references'] + root_links['additional_local_references'],
    'project_local_references': project_links['local_references'] + project_links['additional_local_references'],
    'root_link_errors': len(root_links['errors']), 'project_link_errors': len(project_links['errors']),
    'fidelity_failures': len(failures), 'slider_exact_zip_files': slider}
save('summary', summary)
print(json.dumps(summary, indent=2))
assert not failures, 'See fidelity-failures.json'
