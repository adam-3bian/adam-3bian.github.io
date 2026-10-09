#!/usr/bin/env python3
"""Audit declared entity relationships against published source signatures."""
import hashlib, json
from pathlib import Path
from urllib.parse import urlsplit
import yaml
from capture import ROOT, write_csv

records = [r for r in json.loads((ROOT/'reports/capture-index.json').read_text())['records']
           if r.get('conversion_status') == 'converted']
by_url = {r['url']: r for r in records}
organisations = yaml.safe_load((ROOT/'_data/organisations.yml').read_text())
def frontmatter(path):
    return yaml.safe_load((ROOT/path).read_text().split('---', 2)[1])
def evidence(url):
    path = 'reports/validation/' + hashlib.sha256(url.encode()).hexdigest()[:16] + '/source-signature.json'
    return path, json.loads((ROOT/path).read_text())

manifest, checks = [], []
seen = set()
for record in records:
    path = record['local_path']
    if path in seen: continue
    seen.add(path)
    meta = frontmatter(path)
    ev, source = evidence(record['url'])
    collection = Path(path).parts[0]
    relationship = ''
    if meta.get('organization'):
        org = organisations[meta['organization']]
        definitions = source['definitions']
        assert any(definitions[i] == ['dt', 'Organisation'] and definitions[i+1] == ['dd', org['title']]
                   for i in range(len(definitions)-1)), path
        relationship = 'organization: ' + meta['organization']
        checks.append({'path': path, 'relationship': relationship, 'evidence': ev, 'status': 'passed'})
    manifest.append({'entity_slug': Path(path).stem, 'entity_type': collection.lstrip('_'),
                     'source_url': record['url'], 'relationship': relationship,
                     'relationship_evidence': ev, 'verification_status': 'source-backed'})
for slug, org in organisations.items():
    if not org.get('source_url'): continue
    r = by_url[org['source_url']]
    assert r['local_path'].startswith('_organisations/')
    assert frontmatter(r['local_path'])['title'] == org['title']
board = yaml.safe_load((ROOT/'_data/governing-board.yml').read_text())
board_record = by_url[board[0]['source_url']]
assert frontmatter(board_record['local_path'])['members'] == [m['person'] for m in board]
for member in board:
    ev, source = evidence(member['source_url'])
    assert [member['profile_url'], member['name']] in source['links']
    profile = by_url[member['profile_url']]
    assert profile['local_path'].startswith('_people/')
    assert frontmatter(profile['local_path'])['title'] == member['name']
    assert urlsplit(member['profile_url']).path.strip('/').split('/')[-1] == member['person']
    checks.append({'path': board_record['local_path'], 'relationship': 'member: '+member['person'],
                   'evidence': ev, 'profile_path': profile['local_path'], 'status': 'passed'})
papers = yaml.safe_load((ROOT/'_data/papers.yml').read_text())
for slug, paper in papers.items():
    meta = frontmatter(paper['local_path'])
    assert meta['source_url'] == paper['publication_url']
    manifest.append({'entity_slug': slug, 'entity_type': 'papers', 'source_url': paper['source_catalogue'],
                     'relationship': 'publication: '+paper['publication_url'],
                     'relationship_evidence': 'reports/paper-validation.json', 'verification_status': 'source-backed'})
write_csv(ROOT/'reports/entity-manifest.csv', manifest,
          ['entity_slug','entity_type','source_url','relationship','relationship_evidence','verification_status'])
(ROOT/'reports/entity-validation.json').write_text(json.dumps(checks,indent=2)+'\n')
print(f'PASS: {len(seen)} source entities, {len(papers)} paper records, {len(organisations)-1} organisation profiles and {len(checks)} explicit relationships.')
