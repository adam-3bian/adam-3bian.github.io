#!/usr/bin/env python3
"""Audit Phase 2 against a native build of b213559, without plugin metadata.

Migration Python: audit_phase02.py BEFORE_SITE SITE PROJECT_SITE
The project site is the directory mounted at /cheri-preview. Writes only phase-02-evidence.
"""
import hashlib
import json
import re
import subprocess
import sys
from collections import Counter
from pathlib import Path
from urllib.parse import unquote, urlsplit

import yaml
from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parents[2]
OUT = Path(__file__).with_name('phase-02-evidence')
BASELINE = 'b2135595fe3064cc5811a05c3f6867205d056b49'
BEFORE, SITE, PROJECT = map(lambda p: Path(p).resolve(), sys.argv[1:])
sys.path.insert(0, str(ROOT / 'scripts'))
from convert_batch import signature


def digest(data):
    return hashlib.sha256(data).hexdigest()


def parse(path):
    return BeautifulSoup(path.read_bytes(), 'html.parser')


def output(folder, route):
    p = folder / route.lstrip('/')
    return p / 'index.html' if route.endswith('/') else p


def prune_section(heading):
    nodes = []
    for n in heading.next_siblings:
        if getattr(n, 'name', None) == 'h2':
            break
        nodes.append(n)
    for n in [heading] + nodes:
        n.extract()


def links(folder, soups, prefix=''):
    anchors = {p: {n['id'] for n in s.select('[id]')} for p, s in soups.items()}
    errors, count, css_count, components = [], 0, 0, 0
    styles, visited = set(), set()

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

    for p, soup in soups.items():
        for n in soup.select('a[href],img[src],script[src],link[href]'):
            url = n.get('href', n.get('src'))
            target, fragment = resolve(url, p)
            if target is None:
                continue
            count += 1
            component = 'card' in n.get('class', []) or 'card-image' in n.get('class', [])
            components += component
            reason = ('missing target' if not target.is_file() else 'missing anchor'
                      if fragment and target.suffix == '.html' and fragment not in anchors.get(target, set()) else None)
            if reason:
                errors.append({'page': str(p.relative_to(folder)), 'url': url, 'reason': reason, 'component': component})
            if n.name == 'link' and 'stylesheet' in n.get('rel', []) and target.is_file():
                styles.add(target)
    while styles:
        p = styles.pop()
        if p in visited:
            continue
        visited.add(p)
        for url in re.findall(r'url\(\s*["\']?([^\)"\']+)', p.read_text()):
            target, _ = resolve(url, p)
            if target is None:
                continue
            css_count += 1
            if not target.is_file():
                errors.append({'page': str(p.relative_to(folder)), 'url': url, 'reason': 'CSS dependency', 'component': True})
            elif target.suffix == '.css':
                styles.add(target)
    return {'html_pages': len(soups), 'local_references': count, 'component_references': components,
            'css_dependencies': css_count, 'errors': errors}


manifest = json.loads((ROOT / 'reports/codex-phases/phase-00-evidence/content-manifest.json').read_text())
source_mapping = json.loads((OUT / 'onward-mapping.json').read_text())
root_html = {p: parse(p) for p in sorted(SITE.rglob('*.html'))}
records, section_checks, failures = [], [], []
source_images = {}
for row in manifest:
    original_bytes = subprocess.check_output(['git', 'show', BASELINE + ':' + row['path']], cwd=ROOT)
    current_bytes = (ROOT / row['path']).read_bytes()
    old_front, old_body = original_bytes.split(b'---', 2)[1:]
    new_front, new_body = current_bytes.split(b'---', 2)[1:]
    old_meta, new_meta = yaml.safe_load(old_front), yaml.safe_load(new_front)
    comparable_meta = {k: v for k, v in new_meta.items() if k not in ('where-next', 'related-pages')}
    before = parse(output(BEFORE, row['route']))
    after = root_html[output(SITE, row['route'])]
    source_images[row['route']] = {n['src'] for n in before.select('[data-source-body] img[src]')}
    # Work with independent DOM copies so the full output/link audit remains untouched.
    b = BeautifulSoup(str(before.select_one('[data-source-body]')), 'html.parser')
    a = BeautifulSoup(str(after.select_one('[data-source-body]')), 'html.parser')
    # Source onward navigation is verified field-by-field below. Only the explicit
    # Where next description omission is allowed; ordinary editorial content is exact.
    for h in list(b.select('.where-next-title, .related-pages-title')):
        prune_section(h)
    synthetic = b.select_one('.hero #hero-title')
    source_h1 = b.select_one('article.content h1')
    removed_synthetic = bool(synthetic and source_h1)
    source_h1_id = source_h1.get('id') if source_h1 else None
    if removed_synthetic:
        synthetic.decompose()
        if source_h1_id is None:
            a.select_one('h1').attrs.pop('id', None)  # only the newly supplied page-title anchor
    promoted_chapters = b.select('h1')[1:]
    for h in promoted_chapters:
        h.name = 'h2'
    before_sig, after_sig = signature(b), signature(a)
    changed_signature_fields = [k for k in before_sig if before_sig[k] != after_sig[k]]
    if changed_signature_fields:
        failures.append({'path': row['path'], 'fields': changed_signature_fields,
                         'before': {k: before_sig[k] for k in changed_signature_fields},
                         'after': {k: after_sig[k] for k in changed_signature_fields}})
    old_ids = {n['id'] for n in before.select('[id]')}
    new_ids = [n['id'] for n in after.select('[id]')]
    relations_before = {n.get('data-relationship'): [a['href'] for a in n.select('a.card')] for n in before.select('[data-relationship]')}
    relations_after = {n.get('data-relationship'): [a['href'] for a in n.select('a.card')] for n in after.select('[data-relationship]')}
    record = {'path': row['path'], 'route': row['route'], 'body_sha256': digest(new_body),
              'markdown_body_unchanged': old_body == new_body, 'prior_metadata_unchanged': old_meta == comparable_meta,
              'new_metadata': [k for k in new_meta if k not in old_meta],
              'editorial_signature_unchanged': not changed_signature_fields,
              'synthetic_h1_removed': removed_synthetic, 'chapter_h1s_now_h2': len(promoted_chapters),
              'h1_count': len(after.select('main h1')), 'missing_ids': sorted(old_ids - set(new_ids)),
              'duplicate_ids': [key for key, count in Counter(new_ids).items() if count > 1],
              'relationships_and_order_preserved': relations_before == relations_after,
              'canonical_correct': after.select_one('link[rel=canonical]')['href'] == row['canonical_url'],
              'directory_cards': len(after.select('[data-collection-index] a.card')),
              'directory_images': len(after.select('[data-collection-index] .card-image'))}
    records.append(record)

for mapping in source_mapping:
    soup = root_html[output(SITE, mapping['route'])]
    for source in mapping['sections']:
        kind = source['component']
        section = soup.select_one('[data-source-component="' + kind + '"]')
        assert section, (mapping['path'], kind)
        cards = section.select('a.card')
        assert len(cards) == len(source['items'])
        title_by_route = {r['route']: r['title'] for r in manifest}
        for item, card in zip(source['items'], cards):
            title = item.get('title', title_by_route.get(item['url']))
            description = card.select_one('.card-description')
            action = card.select_one('.card-action')
            for decoration in action.select('[aria-hidden=true]'):
                decoration.decompose()
            section_checks.append({'path': mapping['path'], 'component': kind, 'url': item['url'],
                                   'correct': card['href'] == item['url'] and card.h3.get_text() == title
                                   and action.get_text(' ', strip=True) == item.get('action', 'Continue' if kind == 'where-next' else 'Explore')
                                   and (not section.select('p') if kind == 'where-next' else description.get_text() == item['description']),
                                   'single_full_width': not section.select('ul') and len(cards) == 1 if kind == 'where-next' else None})

image_checks = []
for p, soup in root_html.items():
    for card in soup.select('main a.card:has(.card-image)'):
        image = card.select_one('.card-image')
        image_checks.append({'page': str(p.relative_to(SITE)), 'url': card['href'], 'image': image['src'],
                             'source_backed': image['src'] in source_images.get(card['href'], set())})
asset_baseline = json.loads((ROOT / 'reports/codex-phases/phase-00-evidence/assets.json').read_text())
assets_unchanged = all(digest((ROOT / r['path']).read_bytes()) == r['sha256'] for r in asset_baseline['files'])
original_assets = all((ROOT / r['path']).read_bytes() == (SITE / r['path']).read_bytes() == (PROJECT / r['path']).read_bytes()
                      for r in asset_baseline['source_checks'])
root_links = links(SITE, root_html)
project_html = {p: parse(p) for p in sorted(PROJECT.rglob('*.html'))}
project_links = links(PROJECT, project_html, '/cheri-preview')
report = {'baseline': BASELINE, 'records': records, 'onward_items': section_checks,
          'card_images': image_checks, 'assets_unchanged': assets_unchanged, 'asset_files': len(asset_baseline['files']),
          'original_assets_match_both_builds': original_assets, 'original_asset_mappings': len(asset_baseline['source_checks']),
          'root_links': root_links, 'project_links': project_links,
          'signature_failures': failures, 'limits': ['Where next descriptions are deliberately omitted from rendering per Phase 2; verbatim originals remain in unchanged Markdown and onward-mapping.json.',
                                                   'Generated card media and source onward navigation are validated separately from the unchanged editorial signature.',
                                                   'Existing relationship order is preserved here; source-order repair belongs to Phase 4.']}
(OUT / 'audit.json').write_text(json.dumps(report, indent=2, ensure_ascii=False) + '\n')
summary = {'records': len(records), 'body_hashes_preserved': sum(r['markdown_body_unchanged'] for r in records),
           'signature_passes': sum(r['editorial_signature_unchanged'] for r in records),
           'single_h1_pages': sum(r['h1_count'] == 1 for r in records),
           'removed_synthetic_h1s': sum(r['synthetic_h1_removed'] for r in records),
           'chapter_h1s_now_h2': sum(r['chapter_h1s_now_h2'] for r in records),
           'onward_items': len(section_checks), 'source_backed_card_images': sum(r['source_backed'] for r in image_checks),
           'root_link_errors': len(root_links['errors']), 'project_link_errors': len(project_links['errors']),
           'project_component_errors': sum(r['component'] for r in project_links['errors']),
           'fidelity_failures': [{'path': r['path'], 'fields': r['fields']} for r in failures]}
print(json.dumps(summary, indent=2))
assert all(r['markdown_body_unchanged'] and r['prior_metadata_unchanged'] and r['editorial_signature_unchanged']
           and r['h1_count'] == 1 and not r['missing_ids'] and not r['duplicate_ids']
           and r['relationships_and_order_preserved'] and r['canonical_correct'] for r in records)
assert all(r['correct'] and r['single_full_width'] is not False for r in section_checks)
assert all(r['source_backed'] for r in image_checks) and image_checks
assert assets_unchanged and original_assets
assert len(root_links['errors']) == 1 and root_links['errors'][0]['url'] == '/search/'
assert not [r for r in project_links['errors'] if r['component']]
