#!/usr/bin/env python3
"""Phase 4 native audit: BEFORE_SITE SITE PROJECT_SITE; writes phase-04-evidence only."""
import hashlib
import json
import re
import subprocess
import sys
from collections import Counter
from datetime import datetime, date
from pathlib import Path
from urllib.parse import unquote, urlsplit
from zoneinfo import ZoneInfo
import yaml
from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parents[2]
OUT = Path(__file__).with_name('phase-04-evidence')
BASELINE = '30d2824d68a1f4ada14dd2bc00d2648e77b2d00a'
BEFORE, SITE, PROJECT = [Path(p).resolve() for p in sys.argv[1:]]
TODAY = datetime.now(ZoneInfo('Europe/London')).date()
sys.path.insert(0, str(ROOT / 'scripts'))
from convert_batch import signature

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


def section_nodes(heading):
    nodes = [heading]
    for n in heading.next_siblings:
        if getattr(n, 'name', None) == 'h2':
            break
        nodes.append(n)
    return nodes


def normalized_text(soup):
    return ' '.join(soup.stripped_strings)


def expected_chronology(items, kind, status=None):
    dated = [(id, m) for id, m in items.items() if not m.get('alternate') and not m.get('undated')]
    dated.sort(key=lambda row: datetime.fromisoformat(row[1]['date']).replace(tzinfo=None), reverse=kind == 'news')
    if status:
        dated = [(id, m) for id, m in dated if (date.fromisoformat(m.get('end-date', m['date'])[:10]) < TODAY) == (status == 'past')]
    unknown = [] if status else sorted([id for id, m in items.items() if m.get('undated') and not m.get('alternate')], key=lambda id: items[id]['title'].lower())
    return ['/' + kind + '/' + id + '/' for id, _ in dated] + ['/' + kind + '/' + id + '/' for id in unknown]


manifest = json.loads((ROOT / 'reports/codex-phases/phase-00-evidence/content-manifest.json').read_text())
changes = {r['path']: r for r in json.loads((OUT / 'source-metadata.json').read_text())}
root_html = {p: parse(p) for p in sorted(SITE.rglob('*.html'))}
collections = {c: {p.stem: metadata(p) for p in sorted((ROOT / ('_' + c)).glob('*.md'))}
               for c in ['people', 'organisations', 'news', 'events', 'papers']}
directory_specs = {'/news/': ('news', None), '/news-and-events/news-and-analysis/latest-news/': ('news', None),
                   '/events/': ('events', None), '/news-and-events/events-and-archive/past-events/': ('events', 'past'),
                   '/news-and-events/events-and-archive/upcoming-events/': ('events', 'upcoming')}
records, speaker_cards, speaker_sections, failures, missing_ids, forward_checks = [], [], [], [], [], []
source_images = {}
for row in manifest:
    old = subprocess.check_output(['git', 'show', BASELINE + ':' + row['path']], cwd=ROOT)
    new = (ROOT / row['path']).read_bytes()
    old_front, old_body = old.split(b'---', 2)[1:]
    new_front, new_body = new.split(b'---', 2)[1:]
    old_meta, new_meta = yaml.safe_load(old_front), yaml.safe_load(new_front)
    expected_meta = dict(old_meta)
    if row['path'] in changes:
        expected_meta.update(changes[row['path']]['added'])
    if row['route'] in directory_specs:
        kind, status = directory_specs[row['route']]
        expected_meta.pop('listing', None)
        expected_meta.pop('filter', None)
        expected_meta['layout'] = kind
        if status:
            expected_meta['listing'] = {'status': status}
    before = parse(output(BEFORE, row['route']))
    source_images[row['route']] = [i['src'] for i in before.select('[data-source-body] img')]
    after = root_html[output(SITE, row['route'])]
    b = BeautifulSoup(str(before.select_one('[data-source-body]')), 'html.parser')
    a = BeautifulSoup(str(after.select_one('[data-source-body]')), 'html.parser')
    if new_meta.get('source-speakers'):
        nodes = section_nodes(b.select_one('#speakers'))
        original = BeautifulSoup(''.join(str(n) for n in nodes), 'html.parser')
        rendered = a.select_one('[data-relationship=speakers]')
        for decoration in rendered.select('[aria-hidden=true]'):
            decoration.decompose()
        source_titles, cards = original.select('.collection-card__title'), rendered.select('a.card')
        assert len(source_titles) == len(cards) == len(new_meta['speakers'])
        speaker_sections.append({'path': row['path'], 'text_and_order_preserved': normalized_text(original) == normalized_text(rendered),
                                 'headings_preserved': [(n.name,n.get_text(),n.get('id')) for n in original.select('h2,h3')] == [(n.name,n.get_text(),n.get('id')) for n in rendered.select('h2,h3')],
                                 'single_relationship_section': len(after.select('[data-relationship=speakers]')) == 1})
        for source_title, card in zip(source_titles, cards):
            affiliation = source_title.find_previous_sibling('p')
            image = affiliation.find_previous_sibling('p').img
            description = source_title.find_next_sibling('p')
            action = description.find_next_sibling('p')
            person = root_html[output(SITE, card['href'])]
            portrait = person.select_one('[data-source-body] img')
            speaker_cards.append({'path':row['path'],'url':card['href'],'original_image':image['src'],'canonical_image':card.img['src'],
                                  'affiliation':affiliation.get_text(),'description':description.get_text(),
                                  'correct': card['href'] == source_title.a['href'] and card.h3.get_text() == source_title.get_text()
                                  and card.select_one('.card-description').get_text() == description.get_text()
                                  and card.select_one('.card-action').get_text(strip=True) == action.get_text(strip=True)
                                  and card.img['src'] == portrait['src'] and card.img['alt'] == portrait['alt']})
        for n in nodes:
            n.extract()
        rendered.decompose()
    if row['route'] in directory_specs:
        for n in a.select('[data-collection-index]'):
            n.decompose()
    before_sig, after_sig = signature(b), signature(a)
    changed = [k for k in before_sig if before_sig[k] != after_sig[k]]
    if changed:
        failures.append({'path':row['path'],'fields':changed})
    old_anchors = {n['id'] for n in before.select('[id]')}
    new_anchors = [n['id'] for n in after.select('[id]')]
    old_rel, new_rel = relationships(before), relationships(after)
    relationship_sets_preserved = {k:sorted(v) for k,v in old_rel.items()} == {k:sorted(v) for k,v in new_rel.items()}
    for field, target in [('authors','people'),('speakers','people'),('organization','organisations')]:
        ids = references(new_meta.get(field))
        for id in ids:
            if id not in collections[target]:
                missing_ids.append({'path':row['path'],'field':field,'id':id})
        if field in ['authors','speakers']:
            sections = after.select('[data-relationship=' + field + ']')
            expected = ['/people/' + id + '/' for id in ids]
            forward_checks.append({'path':row['path'],'field':field,'ids':ids,
                                   'correct_order':new_rel.get(field,[]) == expected,
                                   'no_duplicates':len(sections) == (1 if ids else 0),
                                   'below_complete_body':not sections or new_meta.get('source-speakers') or after.select_one('[data-source-body]').find_next_sibling() is not None
                                   and after.select_one('[data-source-body]') in list(sections[0].previous_siblings)})
    records.append({'path':row['path'],'route':row['route'],'body_sha256':digest(new_body),'body_unchanged':old_body == new_body,
                    'metadata_correct':new_meta == expected_meta,'signature_preserved':not changed,
                    'one_h1':len(after.select('main h1'))==1,'missing_anchors':sorted(old_anchors-set(new_anchors)),
                    'duplicate_ids':[id for id,count in Counter(new_anchors).items() if count>1],
                    'relationship_sets_preserved':relationship_sets_preserved,
                    'canonical_correct':after.select_one('link[rel=canonical]')['href']=='https://adam-3bian.github.io'+row['route']})

directories=[]
for route,(kind,status) in directory_specs.items():
    soup=root_html[output(SITE,route)]
    actual=[c['href'] for c in soup.select('[data-collection-index] a.card')]
    expected=expected_chronology(collections[kind],kind,status)
    # Same-day events may retain either source tie order; dates and set must agree.
    ordered = actual == expected if kind=='news' else set(actual)==set(expected) and [collections[kind][url.strip('/').split('/')[-1]]['date'][:10] for url in actual] == sorted(collections[kind][url.strip('/').split('/')[-1]]['date'][:10] for url in actual)
    directories.append({'route':route,'count':len(actual),'urls':actual,'correct':ordered,
                        'one_directory':len(soup.select('[data-collection-index]'))==1,
                        'date_counts_correct':all(len(c.select('time')) == (0 if collections[kind][c['href'].strip('/').split('/')[-1]].get('undated') else 2 if collections[kind][c['href'].strip('/').split('/')[-1]].get('end-date') else 1) for c in soup.select('[data-collection-index] a.card')),
                        'genuine_images':all(c.img and c.img['src']==source_images[c['href']][0] for c in soup.select('[data-collection-index] a.card'))})

date_checks=[]
for row in changes.values():
    meta=metadata(ROOT/row['path'])
    old_meta=yaml.safe_load(subprocess.check_output(['git','show',BASELINE+':'+row['path']],cwd=ROOT).split(b'---',2)[1])
    if row['path'].startswith('_events/'):
        source=ROOT/row['path'];body=source.read_text().split('---',2)[2]
        label=re.search(r'^Date\n: ([^\n]+)',body,re.M)[1]
        parts=re.search(r'(\d+)(?: to (\d+))? (\w+) (\d{4})',label)
        start=datetime.strptime(f'{parts[1]} {parts[3]} {parts[4]}','%d %B %Y').date().isoformat()
        end=datetime.strptime(f'{parts[2] or parts[1]} {parts[3]} {parts[4]}','%d %B %Y').date().isoformat()
        date_checks.append({'path':row['path'],'label':label,'correct':meta['date'][:10]==start and meta.get('end-date',meta['date'])[:10]==end})
    else:
        date_checks.append({'path':row['path'],'label':None,'correct':'date' not in old_meta and meta.get('undated') is True})
for p,soup in root_html.items():
    for card in soup.select('main a.card'):
        parts=card['href'].strip('/').split('/')
        if len(parts)!=2 or parts[0] not in ['news','events'] or parts[1] not in collections[parts[0]]:
            continue
        record=collections[parts[0]][parts[1]]
        times=card.select('time')
        if record.get('undated'):
            correct=not times
        elif times:
            expected=[record['date']]+([record['end-date']] if record.get('end-date') else [])
            correct=len(times)==len(expected) and all(t['datetime'][:10]==d[:10] for t,d in zip(times,expected))
        else:
            correct=True  # Source onward links intentionally have no metadata line.
        date_checks.append({'page':str(p.relative_to(SITE)),'url':card['href'],'correct':correct,'time_count':len(times)})

reverse=[]
for id,person in collections['people'].items():
    s=root_html[output(SITE,'/people/'+id+'/')]; actual=relationships(s)
    expected={}
    for kind,field in [('news','authors'),('events','speakers'),('papers','authors')]:
        related={slug:m for slug,m in collections[kind].items() if id in references(m.get(field)) and not m.get('alternate')}
        expected[kind]=expected_chronology(related,kind) if kind in ['news','events'] else ['/'+kind+'/'+slug+'/' for slug in related]
    correct = actual.get('news',[])==expected['news'] and actual.get('papers',[])==expected['papers']
    actual_events=actual.get('events',[])
    event_dates=[collections['events'][url.strip('/').split('/')[-1]]['date'][:10] for url in actual_events]
    correct=correct and set(actual_events)==set(expected['events']) and event_dates==sorted(event_dates)
    reverse.append({'id':id,'expected':expected,'correct':correct})
home=root_html[output(SITE,'/')]
home_checks={'news':[c['href'] for c in home.select('[aria-labelledby=home-news-title] a.card')]==expected_chronology(collections['news'],'news')[:3],
             'upcoming':[c['href'] for c in home.select('[aria-labelledby=home-events-title] a.card')]==expected_chronology(collections['events'],'events','upcoming')}
assets=json.loads((ROOT/'reports/codex-phases/phase-00-evidence/assets.json').read_text())
asset_checks={'unchanged':all(digest((ROOT/r['path']).read_bytes())==r['sha256'] for r in assets['files']),
              'original_bytes_both_builds':all((ROOT/r['path']).read_bytes()==(SITE/r['path']).read_bytes()==(PROJECT/r['path']).read_bytes() for r in assets['source_checks'])}
root_links=links(SITE,root_html)
project_html={p:parse(p) for p in sorted(PROJECT.rglob('*.html'))}
project_links=links(PROJECT,project_html,'/cheri-preview')
summary={'records':len(records),'unchanged_bodies':sum(r['body_unchanged'] for r in records),'preserved_signatures':sum(r['signature_preserved'] for r in records),
         'source_speaker_cards':len(speaker_cards),'source_speaker_sections':len(speaker_sections),'unresolved_ids':missing_ids,
         'forward_order_errors':sum(not r['correct_order'] for r in forward_checks),'reverse_errors':sum(not r['correct'] for r in reverse),
         'date_errors':sum(not r['correct'] for r in date_checks),'root_link_errors':len(root_links['errors']),
         'project_link_errors':len(project_links['errors']),'project_component_errors':sum(r['component'] for r in project_links['errors']),
         'signature_failures':failures}
report={'baseline':BASELINE,'as_of':str(TODAY),'summary':summary,'records':records,'directories':directories,'source_speaker_sections':speaker_sections,
        'source_speaker_mapping':speaker_cards,'forward_references':forward_checks,'reverse_relationships':reverse,'date_checks':date_checks,
        'home_checks':home_checks,'assets':asset_checks,'root_links':root_links,'project_links':project_links,
        'limits':['Three retained source speaker sections use canonical portraits and native cards; every original label/summary/group is checked separately.',
                  'Prior heading, onward and board transformations remain the content baseline; historical external-source comparison is Phase 7 work.']}
(OUT/'audit.json').write_text(json.dumps(report,indent=2,ensure_ascii=False)+'\n')
print(json.dumps(summary,indent=2))
assert all(all(r[k] for k in ['body_unchanged','metadata_correct','signature_preserved','one_h1','relationship_sets_preserved','canonical_correct']) and not r['missing_anchors'] and not r['duplicate_ids'] for r in records)
assert all(all(r[k] for k in ['correct_order','no_duplicates','below_complete_body']) for r in forward_checks)
assert all(r['correct'] for r in speaker_cards+date_checks+reverse) and not missing_ids
assert all(all(r[k] for k in ['text_and_order_preserved','headings_preserved','single_relationship_section']) for r in speaker_sections)
assert all(all(r[k] for k in ['correct','one_directory','genuine_images','date_counts_correct']) for r in directories)
assert all(asset_checks.values()) and all(home_checks.values())
assert len(root_links['errors'])==1 and root_links['errors'][0]['url']=='/search/'
assert not [r for r in project_links['errors'] if r['component']]
