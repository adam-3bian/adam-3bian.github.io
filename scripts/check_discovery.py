#!/usr/bin/env python3
"""Audit canonical/public discovery and static metadata; no remote requests."""
import json
import os
from collections import defaultdict
from html.parser import HTMLParser
from pathlib import Path
import sys
from urllib.parse import unquote, urlsplit
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
SITE = Path(sys.argv[1] if len(sys.argv) > 1 else ROOT / '_site').resolve()
BASE = '/' + sys.argv[2].strip('/') if len(sys.argv) > 2 else ''
source = json.loads((ROOT / 'reports/preflight.json').read_text())
public_urls = set(json.loads((ROOT / 'reports/public-records.json').read_text()))
public = [r for r in source['records'] if r['url'] in public_urls]

class Head(HTMLParser):
    def __init__(self, text):
        super().__init__(convert_charrefs=True)
        self.meta, self.canonical, self.title, self.structured = {}, [], '', []
        self.mode, self.payload = '', ''
        self.feed(text)
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == 'meta' and (a.get('name') or a.get('property')):
            key = a.get('name') or a['property']
            assert key not in self.meta, f'Duplicate metadata: {key}'
            self.meta[key] = a.get('content', '')
        if tag == 'link' and a.get('rel') == 'canonical': self.canonical.append(a.get('href'))
        if tag == 'title': self.mode, self.payload = 'title', ''
        if tag == 'script' and a.get('type') == 'application/ld+json': self.mode, self.payload = 'structured', ''
    def handle_data(self, data):
        if self.mode: self.payload += data
    def handle_endtag(self, tag):
        if tag == 'title' and self.mode == 'title': self.title, self.mode = self.payload, ''
        if tag == 'script' and self.mode == 'structured': self.structured.append(json.loads(self.payload)); self.mode = ''

def file_for(route):
    path = SITE / route.lstrip('/')
    return path / 'index.html' if path.is_dir() else path

home = Head((SITE / 'index.html').read_text())
origin = home.canonical[0].removesuffix(BASE + '/')
expected = {origin + BASE + r['url'] for r in public}
xml = ET.parse(SITE / 'sitemap.xml')
actual = [n.text for n in xml.findall('.//{http://www.sitemaps.org/schemas/sitemap/0.9}loc')]
assert len(actual) == len(set(actual)), 'Duplicate sitemap entries'
assert set(actual) == expected, {'missing': sorted(expected - set(actual)), 'extra': sorted(set(actual) - expected)}
robots = (SITE / 'robots.txt').read_text()
assert f'Sitemap: {origin}{BASE}/sitemap.xml' in robots
assert f'Disallow: {BASE}/checks/' in robots
assert '{{' not in robots and '{%' not in robots
metadata = 0
names = defaultdict(list)
for record in source['records']:
    head = Head(file_for(record['url']).read_text())
    assert head.title.strip() and len(head.canonical) == 1, record['url']
    assert head.canonical == [origin + BASE + (record.get('alias_target') or record['url'])], record['url']
    description = head.meta.get('description', '')
    assert description.strip() and len(description) <= 160 and '<p>' not in description, record['url']
    for key in ('og:title', 'og:description', 'og:url', 'og:type', 'og:site_name', 'twitter:card', 'twitter:title', 'twitter:description'):
        assert head.meta.get(key), (record['url'], key)
    assert head.meta['og:url'] == head.canonical[0]
    image_path = unquote(urlsplit(head.meta['og:image']).path)
    assert image_path.startswith(BASE + '/assets/') and 'placeholder.svg' not in image_path
    assert (SITE / image_path[len(BASE):].lstrip('/')).is_file()
    if record not in public:
        assert head.meta.get('robots') == 'noindex,follow', record['url']
    else:
        names[head.title].append(record['url'])
    for structured in head.structured:
        assert structured['@context'] == 'https://schema.org'
        if structured['@type'] == 'Event':
            p = record['properties']
            assert structured['name'] == record['title']
            assert structured['startDate'] == (p.get('start_datetime') or p.get('start_date'))
            assert structured.get('endDate') == (p.get('end_datetime') or p.get('end_date'))
            assert structured.get('location') == p.get('location')
        if structured['@type'] == 'Organization':
            assert structured['name'] == record['title']
            assert structured['url'] == (record['properties'].get('website_url') or origin + BASE + record['url'])
    metadata += 1
assert len(home.title) < 65, 'Homepage browser title should be concise'
assert Head((SITE / 'checks/index.html').read_text()).meta.get('robots') == 'noindex,follow'
result = {'baseurl': BASE, 'sitemap_urls': len(actual), 'metadata_pages': metadata, 'duplicate_titles': {title: routes for title, routes in names.items() if len(routes) > 1}}
assert not result['duplicate_titles'], result['duplicate_titles']
folder = Path(os.environ.get('REPORT_ROOT', ROOT / 'reports')) / 'discovery-tests'
folder.mkdir(parents=True, exist_ok=True)
(folder / ('preview.json' if BASE else 'root.json')).write_text(json.dumps(result, indent=2) + '\n')
print(json.dumps(result))
