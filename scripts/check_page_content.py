#!/usr/bin/env python3
"""Check all built pages, metadata, canonical aliases and numbered clauses.

Uses only Python's standard library. Run after the content validator and build;
an optional second argument supplies the build's baseurl (e.g. /preview).
"""
import json
from html.parser import HTMLParser
from pathlib import Path
import re
import sys
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]
SITE = Path(sys.argv[1] if len(sys.argv) > 1 else ROOT / '_site').resolve()
BASEURL = '/' + sys.argv[2].strip('/') if len(sys.argv) > 2 else ''
VOID = set('area base br col embed hr img input link meta param source track wbr'.split())


class Node:
    def __init__(self, tag='', attrs=(), parent=None):
        self.tag, self.attrs, self.parent = tag, dict(attrs), parent
        self.children, self.parts = [], []

    def text(self):
        return ''.join(p.text() if isinstance(p, Node) else p for p in self.parts).strip()

    def has_class(self, name):
        return name in self.attrs.get('class', '').split()

    def ancestor(self, predicate):
        node = self.parent
        while node:
            if predicate(node):
                return node
            node = node.parent


class Document(HTMLParser):
    def __init__(self, text):
        super().__init__(convert_charrefs=True)
        self.root = Node()
        self.current = self.root
        self.nodes = []
        self.feed(text)

    def handle_starttag(self, tag, attrs):
        node = Node(tag, attrs, self.current)
        self.current.children.append(node)
        self.current.parts.append(node)
        self.nodes.append(node)
        if tag not in VOID:
            self.current = node

    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)
        if tag not in VOID:
            self.handle_endtag(tag)

    def handle_endtag(self, tag):
        node = self.current
        while node.parent:
            if node.tag == tag:
                self.current = node.parent
                return
            node = node.parent

    def handle_data(self, text):
        self.current.parts.append(text)


errors = []
documents = {p: Document(p.read_text()) for p in SITE.rglob('*.html')}
ids = {p: {n.attrs['id'] for n in doc.nodes if 'id' in n.attrs} for p, doc in documents.items()}
stats = {'html_files': len(documents), 'local_links': 0, 'local_images': 0,
         'metadata_panels': 0, 'legal_clauses': 0, 'redirects': 0}


def target_file(path):
    local = unquote(path)
    if BASEURL:
        if not local.startswith(BASEURL + '/'):
            raise ValueError('Missing baseurl: ' + local)
        local = local[len(BASEURL):]
    target = (SITE / local.lstrip('/')).resolve()
    if not target.is_relative_to(SITE):
        raise ValueError('Target escapes build: ' + local)
    return target / 'index.html' if target.is_dir() else target


for file, doc in documents.items():
    route = '/' + str(file.relative_to(SITE))
    for node in doc.nodes:
        if node.has_class('metadata'):
            stats['metadata_panels'] += 1
            if not node.text():
                errors.append(f'{route}: empty metadata panel')
            if node.text() == 'Placeholder image':
                errors.append(f'{route}: placeholder-only panel')
        if node.tag == 'a' and node.text() == 'Placeholder image':
            errors.append(f'{route}: useless placeholder resource link')
        if node.has_class('clause-number'):
            stats['legal_clauses'] += 1
            parent_list = node.ancestor(lambda n: n.tag in ('ol', 'ul'))
            if not parent_list or parent_list.tag != 'ol':
                errors.append(f'{route}: legal clause outside ordered list')
        if node.has_class('front-matter-json'):
            try:
                json.loads(node.text())
            except ValueError:
                errors.append(f'{route}: malformed front matter inspector JSON')
        for attribute in ('aria-controls',):
            for identifier in node.attrs.get(attribute, '').split():
                if identifier not in ids[file]:
                    errors.append(f'{route}: missing controlled element {identifier}')
        if node.tag not in ('a', 'img'):
            continue
        value = node.attrs.get('href' if node.tag == 'a' else 'src', '')
        parsed = urlsplit(value)
        if parsed.netloc or parsed.scheme:
            continue
        if not value:
            errors.append(f'{route}: empty {node.tag} target')
            continue
        try:
            target = target_file(parsed.path) if parsed.path.startswith('/') else (file if not parsed.path else (file.parent / unquote(parsed.path)).resolve())
            if target.is_dir():
                target = target / 'index.html'
            if not target.is_file():
                errors.append(f'{route}: missing local target {value}')
            elif parsed.fragment and node.tag == 'a' and target.suffix == '.html' and unquote(parsed.fragment) not in ids.get(target, set()):
                errors.append(f'{route}: missing anchor {value}')
            stats['local_links' if node.tag == 'a' else 'local_images'] += 1
            if node.tag == 'img' and not node.attrs.get('alt', '').strip():
                errors.append(f'{route}: empty image description {value}')
        except ValueError as exc:
            errors.append(f'{route}: {exc}')

report = json.loads((ROOT / 'reports/preflight.json').read_text())
for record in report['records']:
    file = target_file(BASEURL + record['url'])
    doc = documents.get(file)
    if not doc:
        errors.append('Missing record: ' + record['url'])
        continue
    target = record.get('alias_target') or record['url']
    canonical = [n.attrs.get('href', '') for n in doc.nodes if n.tag == 'link' and n.attrs.get('rel') == 'canonical']
    if len(canonical) != 1 or urlsplit(canonical[0]).path != BASEURL + target:
        errors.append('Incorrect canonical URL: ' + record['url'])
    refresh = [n.attrs.get('content', '') for n in doc.nodes if n.tag == 'meta' and n.attrs.get('http-equiv') == 'refresh']
    if refresh:
        stats['redirects'] += 1
        if not record.get('alias_target') or refresh != ['0; url=' + BASEURL + target]:
            errors.append('Incorrect redirect: ' + record['url'])
        if not any(n.tag == 'a' and n.attrs.get('href') == BASEURL + target for n in doc.nodes):
            errors.append('Redirect without ordinary fallback link: ' + record['url'])

expected = ['1.1', '1.1.1', '1.1.2', '2.1'] + [f'2.1.{i}' for i in range(1, 6)] + ['3.1'] + [f'3.1.{i}' for i in range(1, 7)] + ['3.2'] + [f'3.2.{i}' for i in range(1, 9)] + ['3.3', '4.1', '4.2']
competition = documents[target_file(BASEURL + '/policies/competition-law-statement/')]
numbers = [n.text() for n in competition.nodes if n.has_class('clause-number')]
if numbers != expected:
    errors.append('Competition-law clause identifiers changed or disappeared')

result = {**stats, 'baseurl': BASEURL, 'errors': sorted(set(errors))}
(ROOT / 'reports/page-content.json').write_text(json.dumps(result, indent=2) + '\n')
print(json.dumps(result))
sys.exit(bool(errors))
