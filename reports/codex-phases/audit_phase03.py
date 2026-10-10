#!/usr/bin/env python3
"""Phase 3 native-build audit: BEFORE_SITE SITE PROJECT_SITE (mounted at /cheri-preview).

Only writes phase-03-evidence. Link scanner retained from Phase 2; source signatures
use the existing converter's semantic comparison, not output-plugin metadata.
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
OUT = Path(__file__).with_name('phase-03-evidence')
BASELINE = '71969d69c2ed90aec6ba6291f80dd4d658c5c110'
BEFORE, SITE, PROJECT = [Path(p).resolve() for p in sys.argv[1:]]
sys.path.insert(0, str(ROOT / 'scripts'))
from convert_batch import signature
BOARD = '/alliance/leadership/governing-board/'
SPEAKERS = '/news-and-events/people-and-opportunities/speakers/'

def digest(data):
    return hashlib.sha256(data).hexdigest()

def parse(path):
    return BeautifulSoup(path.read_bytes(), 'html.parser')

def output(folder, route):
    p = folder / route.lstrip('/')
    return p / 'index.html' if route.endswith('/') else p

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


def metadata(path):
    return yaml.safe_load(path.read_bytes().split(b'---', 2)[1])


def references(value):
    return value if isinstance(value, list) else [value] if value else []


def relationships(soup):
    return {n['data-relationship']: [a['href'] for a in n.select('a.card')]
            for n in soup.select('[data-relationship]')}


manifest = json.loads((ROOT / 'reports/codex-phases/phase-00-evidence/content-manifest.json').read_text())
root_html = {p: parse(p) for p in sorted(SITE.rglob('*.html'))}
people = {p.stem: metadata(p) for p in sorted((ROOT / '_people').glob('*.md'))}
registry = yaml.safe_load((ROOT / '_data/governing-board.yml').read_text())
assert len(registry) == len(set(registry)) == 9 and all(id in people for id in registry)
assert len(people) == len({p['title'] for p in people.values()}) == 112
assert not (ROOT / '_speakers').exists() and not (ROOT / '_boardpeople').exists()
records, failures, board_mapping, person_checks = [], [], [], []
for row in manifest:
    old = subprocess.check_output(['git', 'show', BASELINE + ':' + row['path']], cwd=ROOT)
    current = (ROOT / row['path']).read_bytes()
    old_front, old_body = old.split(b'---', 2)[1:]
    new_front, new_body = current.split(b'---', 2)[1:]
    old_meta, new_meta = yaml.safe_load(old_front), yaml.safe_load(new_front)
    is_directory = row['route'] in [BOARD, SPEAKERS, '/people/']
    meta_correct = ({k: v for k, v in old_meta.items() if k not in ('layout', 'listing')} ==
                    {k: v for k, v in new_meta.items() if k not in ('layout', 'listing')}) if is_directory else old_meta == new_meta
    before = parse(output(BEFORE, row['route']))
    after = root_html[output(SITE, row['route'])]
    b = BeautifulSoup(str(before.select_one('[data-source-body]')), 'html.parser')
    a = BeautifulSoup(str(after.select_one('[data-source-body]')), 'html.parser')
    if row['route'] == BOARD:
        # Verify each replaced card independently before removing its presentation
        # from the prose signature. Its exact source bytes remain in Markdown.
        old_titles = b.select('.collection-card__title')
        cards = a.select('[data-people-list] a.card')
        assert len(old_titles) == len(cards) == 9
        for id, title, card in zip(registry, old_titles, cards):
            affiliation = title.find_previous_sibling('p')
            old_image = affiliation.find_previous_sibling('p').img
            role = title.find_next_sibling('p')
            action = role.find_next_sibling('p')
            canonical = root_html[output(SITE, '/people/' + id + '/')]
            portrait = canonical.select_one('[data-source-body] img')
            expected_text = [affiliation.get_text(strip=True), title.get_text(strip=True),
                             role.get_text(strip=True), action.get_text(strip=True)]
            for decoration in card.select('[aria-hidden=true]'):
                decoration.decompose()
            actual_text = list(card.stripped_strings)
            mapping = {'id': id, 'url': card['href'], 'original_image': old_image['src'],
                       'canonical_portrait': portrait['src'], 'preserved_text': expected_text,
                       'correct': actual_text == expected_text and card['href'] == title.a['href'] == '/people/' + id + '/'
                       and card.img['src'] == portrait['src'] and card.img['alt'] == portrait['alt']}
            board_mapping.append(mapping)
        start = old_titles[0].find_previous_sibling('p').find_previous_sibling('p')
        end = old_titles[-1].find_next_sibling('p').find_next_sibling('p')
        nodes = [start]
        for n in start.next_siblings:
            nodes.append(n)
            if n is end:
                break
        for n in nodes:
            n.extract()
    if is_directory:
        for n in a.select('[data-people-list]'):
            n.decompose()
    before_sig, after_sig = signature(b), signature(a)
    changed = [k for k in before_sig if before_sig[k] != after_sig[k]]
    if changed:
        failures.append({'path': row['path'], 'fields': changed})
    old_ids = {n['id'] for n in before.select('[id]')}
    new_ids = [n['id'] for n in after.select('[id]')]
    record = {'path': row['path'], 'route': row['route'], 'body_sha256': digest(new_body),
              'body_unchanged': old_body == new_body, 'metadata_correct': meta_correct,
              'signature_preserved': not changed, 'missing_ids': sorted(old_ids - set(new_ids)),
              'duplicate_ids': [id for id, count in Counter(new_ids).items() if count > 1],
              'single_h1': len(after.select('main h1')) == 1,
              'canonical_correct': after.select_one('link[rel=canonical]')['href'] == 'https://adam-3bian.github.io' + row['route'],
              'relationships_preserved': relationships(before) == relationships(after)}
    records.append(record)

directories = []
for route, expected in [(BOARD, registry), (SPEAKERS, sorted([id for id, p in people.items() if p.get('speaker') is True], key=lambda id: people[id]['title'].lower())),
                        ('/people/', sorted(people, key=lambda id: people[id]['title'].lower()))]:
    s = root_html[output(SITE, route)]
    cards = s.select('[data-people-list] a.card')
    directories.append({'route': route, 'count': len(cards), 'images': sum(c.img is not None for c in cards),
                        'ids': [c['href'].strip('/').split('/')[-1] for c in cards],
                        'selection_and_order_correct': [c['href'] for c in cards] == ['/people/' + id + '/' for id in expected],
                        'one_directory': len(s.select('[data-collection-index]')) == 1,
                        'native_cards': all(c.parent.name == 'li' and 'cards' in c.parent.parent.get('class', []) for c in cards),
                        'no_legacy_cards': not s.select('[class*=collection-card__]')})

collections = {c: {p.stem: metadata(p) for p in sorted((ROOT / ('_' + c)).glob('*.md'))} for c in ['news', 'events', 'papers', 'organisations']}
card_images_by_route = {}
for soup in root_html.values():
    for card in soup.select('main a.card:has(img)'):
        card_images_by_route.setdefault(card['href'], []).append(card.img['src'])
for id, meta in people.items():
    route = '/people/' + id + '/'
    s = root_html[output(SITE, route)]
    before = parse(output(BEFORE, route))
    portraits = s.select('[data-source-body] img')
    original = before.select('[data-source-body] img')
    expected_relations = {}
    for collection, key in [('news', 'authors'), ('events', 'speakers'), ('papers', 'authors')]:
        expected_relations[collection] = sorted('/' + collection + '/' + slug + '/' for slug, record in collections[collection].items()
                                                if id in references(record.get(key)) and not record.get('alternate'))
    expected_relations['organization'] = sorted('/organisations/' + org + '/' for org in references(meta.get('organization')))
    actual_relations = relationships(s)
    name_only = not original
    card_images = card_images_by_route.get(route, [])
    person_checks.append({'id': id, 'name_only': name_only, 'portraits': len(portraits),
                          'source_bytes_unchanged': subprocess.check_output(['git', 'show', BASELINE + ':_people/' + id + '.md'], cwd=ROOT) == (ROOT / '_people' / (id + '.md')).read_bytes(),
                          'genuine_square_portrait': len(portraits) == len(original) and all(i['src'] == o['src'] and i['alt'] == o['alt'] and 'image-square' in i.get('class', []) for i, o in zip(portraits, original)),
                          'listing_detail_image_match': all(src == portraits[0]['src'] for src in card_images) if portraits else not card_images,
                          'no_invented_profile': not name_only or not s.select('[data-source-body] img, [data-source-body] h2, [data-source-body] dl'),
                          'reverse_relations_correct': all(sorted(actual_relations.get(k, [])) == v for k, v in expected_relations.items()),
                          'related_counts': {k: len(v) for k, v in expected_relations.items()},
                          'board_backlink_correct': bool(s.select('[data-relationship=governing-board]')) == (id in registry)})

assets = json.loads((ROOT / 'reports/codex-phases/phase-00-evidence/assets.json').read_text())
asset_checks = {'tracked_assets_unchanged': all(digest((ROOT / r['path']).read_bytes()) == r['sha256'] for r in assets['files']),
                'asset_count': len(assets['files']), 'original_mapping_count': len(assets['source_checks']),
                'original_assets_match_both_builds': all((ROOT / r['path']).read_bytes() == (SITE / r['path']).read_bytes() == (PROJECT / r['path']).read_bytes() for r in assets['source_checks'])}
project_html = {p: parse(p) for p in sorted(PROJECT.rglob('*.html'))}
root_links = links(SITE, root_html)
project_links = links(PROJECT, project_html, '/cheri-preview')
summary = {'records': len(records), 'unchanged_bodies': sum(r['body_unchanged'] for r in records),
           'preserved_signatures': sum(r['signature_preserved'] for r in records), 'people': len(people),
           'speakers': sum(p.get('speaker') is True for p in people.values()), 'board': len(registry),
           'genuine_portraits': sum(p['portraits'] for p in person_checks), 'name_only': sum(p['name_only'] for p in person_checks),
           'root_link_errors': len(root_links['errors']), 'project_link_errors': len(project_links['errors']),
           'project_card_errors': sum(r['component'] for r in project_links['errors']), 'signature_failures': failures}
report = {'baseline': BASELINE, 'summary': summary, 'records': records, 'directories': directories,
          'board_source_mapping': board_mapping, 'people': person_checks, 'assets': asset_checks,
          'root_links': root_links, 'project_links': project_links,
          'limits': ['Board source images are retained in Markdown/assets, but cards use canonical profile portraits; text, order and destinations checked independently.',
                     'Phase 2 onward/heading transformations are the baseline; all unaffected prose signatures and relationship sequences remain exact.',
                     'Existing source-order/date and source-body project URL issues remain assigned to later phases.']}
(OUT / 'audit.json').write_text(json.dumps(report, indent=2, ensure_ascii=False) + '\n')
print(json.dumps(summary, indent=2))
assert all(all(r[k] for k in ['body_unchanged', 'metadata_correct', 'signature_preserved', 'single_h1', 'canonical_correct', 'relationships_preserved']) and not r['missing_ids'] and not r['duplicate_ids'] for r in records)
assert all(m['correct'] for m in board_mapping)
assert all(all(d[k] for k in ['selection_and_order_correct', 'one_directory', 'native_cards', 'no_legacy_cards']) for d in directories)
assert all(all(p[k] for k in ['source_bytes_unchanged', 'genuine_square_portrait', 'listing_detail_image_match', 'no_invented_profile', 'reverse_relations_correct', 'board_backlink_correct']) for p in person_checks)
assert all(asset_checks[k] for k in ['tracked_assets_unchanged', 'original_assets_match_both_builds'])
assert len(root_links['errors']) == 1 and root_links['errors'][0]['url'] == '/search/'
assert not [r for r in project_links['errors'] if r['component']]

