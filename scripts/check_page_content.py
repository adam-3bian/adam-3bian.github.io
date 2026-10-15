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
         'metadata_panels': 0, 'resource_navigations': 0, 'legal_clauses': 0, 'redirects': 0,
         'directories': 0, 'cards': 0, 'body_property_lists': 0, 'index_pages': 0, 'index_links': 0,
         'footers': 0, 'related_link_lists': 0}
footer_navigation = json.loads((ROOT / 'reports/footer-navigation.json').read_text())


def expected_links(links):
    return [{'title': link['title'], 'url': BASEURL + link['url'] if link['url'].startswith('/') else link['url']} for link in links]


def actual_links(doc, within):
    return [{'title': node.text(), 'url': node.attrs.get('href')} for node in doc.nodes
            if node.tag == 'a' and node.ancestor(lambda a: a is within)]


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
    mains = [n for n in doc.nodes if n.tag == 'main']
    if len(mains) != 1 or len([n for n in doc.nodes if n.tag == 'h1' and n.ancestor(lambda a: a in mains)]) != 1:
        errors.append(f'{route}: expected one main landmark and primary heading')
    footers = [n for n in doc.nodes if n.has_class('site-footer')]
    if len(footers) != 1 or footers[0].tag != 'footer':
        errors.append(f'{route}: missing shared semantic footer')
    else:
        footer = footers[0]
        stats['footers'] += 1
        group_lists = [n for n in doc.nodes if n.has_class('footer-groups') and n.ancestor(lambda a: a is footer)]
        if len(group_lists) != 1 or group_lists[0].tag != 'ul':
            errors.append(f'{route}: footer lacks column list semantics')
        else:
            groups = group_lists[0].children
            labels = [n.text() for n in doc.nodes if n.has_class('footer-group-label') and n.ancestor(lambda a: a is footer)]
            if len(groups) != len(footer_navigation['groups']) or labels != [g['title'] for g in footer_navigation['groups']]:
                errors.append(f'{route}: footer groups differ from navigation configuration')
            for group, expected in zip(groups, footer_navigation['groups']):
                if group.tag != 'li' or [n.tag for n in group.children] != ['strong', 'ul'] or actual_links(doc, group) != expected_links(expected['links']):
                    errors.append(f'{route}: footer links differ from navigation configuration')
        utilities = [n for n in doc.nodes if n.has_class('footer-utilities') and n.ancestor(lambda a: a is footer)]
        if len(utilities) != 1 or utilities[0].tag != 'nav' or actual_links(doc, utilities[0]) != expected_links(footer_navigation['utilities']):
            errors.append(f'{route}: footer utility links missing or incorrect')
        if any(n.tag in ('div', 'span', 'details', 'summary') and n.ancestor(lambda a: a is footer) for n in doc.nodes):
            errors.append(f'{route}: unnecessary wrapper or hidden footer links')
    listings = [n for n in doc.nodes if n.has_class('listing')]
    if len(listings) > 1:
        errors.append(f'{route}: repeated collection directory')
    for listing in listings:
        stats['directories'] += 1
        cards = [n for n in doc.nodes if n.has_class('card') and n.ancestor(lambda a: a is listing)]
        targets = [n.attrs.get('href') for n in cards]
        if len(targets) != len(set(targets)):
            errors.append(f'{route}: repeated card destination')
        for card in cards:
            stats['cards'] += 1
            if card.tag != 'a' or card.parent.tag != 'li' or not card.parent.parent.has_class('cards'):
                errors.append(f'{route}: card lacks native link/list semantics')
            if len([n for n in doc.nodes if n.tag in ('h3', 'h4') and n.ancestor(lambda a: a is card)]) != 1:
                errors.append(f'{route}: card lacks a single title')
    for card_list in [n for n in doc.nodes if n.has_class('cards')]:
        if card_list.tag != 'ul' or any(n.tag != 'li' for n in card_list.children):
            errors.append(f'{route}: card directory lacks list semantics')
    for node in doc.nodes:
        if node.has_class('card'):
            if node.tag != 'a' or not node.attrs.get('href') or any(n.tag in ('a', 'button', 'input', 'select', 'textarea', 'details') and n.ancestor(lambda a: a is node) for n in doc.nodes):
                errors.append(f'{route}: card is not a single native link')
        if node.has_class('link-grid'):
            stats['related_link_lists'] += 1
            if node.tag != 'ul' or node.attrs.get('role') != 'list' or any(n.tag != 'li' or len(n.children) != 1 or n.children[0].tag != 'a' for n in node.children):
                errors.append(f'{route}: related links have extra labels or lack native list/link semantics')
        if node.tag == 'li' and node.parent.tag not in ('ul', 'ol', 'menu'):
            errors.append(f'{route}: list item without a parent list')
        if node.has_class('metadata'):
            stats['metadata_panels'] += 1
            if not node.text():
                errors.append(f'{route}: empty metadata panel')
            if node.text() == 'Placeholder image':
                errors.append(f'{route}: placeholder-only panel')
            lists = [n for n in node.children if n.tag == 'dl']
            if len(lists) != 1 or not lists[0].children:
                errors.append(f'{route}: metadata without facts')
            elif any(n.tag != ('dt' if i % 2 == 0 else 'dd') or not n.text() for i, n in enumerate(lists[0].children)) or len(lists[0].children) % 2:
                errors.append(f'{route}: unpaired metadata terms and values')
        if node.has_class('record-properties'):
            stats['body_property_lists'] += 1
            if node.tag != 'dl' or not node.children or len(node.children) % 2 or any(n.tag != ('dt' if i % 2 == 0 else 'dd') or not n.text() for i, n in enumerate(node.children)):
                errors.append(f'{route}: unpaired body properties')
        if node.has_class('resource-links'):
            stats['resource_navigations'] += 1
            if node.tag != 'nav' or not node.attrs.get('aria-label') or not node.text():
                errors.append(f'{route}: empty or unlabelled resource navigation')
            lists = [n for n in node.children if n.tag == 'ul']
            if len(lists) != 1 or not lists[0].children or any(n.tag != 'li' for n in lists[0].children):
                errors.append(f'{route}: resource links lack list semantics')
        if node.tag in ('div', 'span') and node.ancestor(lambda n: n.has_class('metadata') or n.has_class('resource-links') or n.has_class('breadcrumb') or n.has_class('record-intro') or n.has_class('onward') or n.has_class('listing')):
            errors.append(f'{route}: unnecessary wrapper in shared record layout')
        if node.tag == 'a' and node.text() in ('Placeholder image', 'Original image'):
            errors.append(f'{route}: unnecessary image resource link')
        if node.tag == 'a' and node.ancestor(lambda n: n.has_class('resource-links')) and not node.text():
            errors.append(f'{route}: resource link without a label')
        if node.has_class('clause-number'):
            stats['legal_clauses'] += 1
            parent_list = node.ancestor(lambda n: n.tag in ('ol', 'ul'))
            if not parent_list or parent_list.tag != 'ol':
                errors.append(f'{route}: legal clause outside ordered list')
        if node.has_class('front-matter-json'):
            if file != target_file(BASEURL + '/checks/'):
                errors.append(f'{route}: raw authoring properties on a public record')
            try:
                json.loads(node.text())
            except ValueError:
                errors.append(f'{route}: malformed front matter inspector JSON')
        for attribute in ('aria-controls', 'aria-labelledby'):
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
audit = documents[target_file(BASEURL + '/checks/')]
audit_rows = [n for n in audit.nodes if 'data-audit-row' in n.attrs]
if len(audit_rows) != report['record_count']:
    errors.append('Audit record count differs from current preflight')
if len([n for n in audit.nodes if n.has_class('front-matter-json')]) != report['record_count']:
    errors.append('Audit omits authoring properties')
if len([n for n in audit.nodes if n.has_class('card')]) != report['collection_count']:
    errors.append('Audit collection coverage omits a collection')
if any(n.attrs.get('data-primary-image') != str(n.attrs.get('data-image-status') == 'provided').lower() for n in audit_rows):
    errors.append('Audit treats a placeholder as a provided source image')
for collection, route in [('case-studies', '/case-studies/'), ('reports', '/reports/')]:
    directory = documents[target_file(BASEURL + route)]
    targets = [n.attrs.get('data-record-url') for n in directory.nodes if n.has_class('card')]
    expected = [r['url'] for r in report['records'] if r['collection'] == collection and not r['alternate']]
    if sorted(targets) != sorted(expected):
        errors.append('Incomplete collection directory: ' + route)
certified_route = '/adopt/assurance-and-adoption/cheri-enabled-products/'
certified_directory = documents.get(target_file(BASEURL + certified_route))
certified_targets = [n.attrs.get('data-record-url') for n in certified_directory.nodes if n.has_class('card')] if certified_directory else []
expected_certified = [r['url'] for r in report['records'] if r['collection'] == 'hardware' and r.get('properties', {}).get('certification') == 'cheri-enabled' and not r['alternate']]
if not expected_certified or sorted(certified_targets) != sorted(expected_certified):
    errors.append('Certified products directory does not match hardware certification properties')
index_pages = json.loads((ROOT / 'reports/index-navigation.json').read_text())
for route, expected_index in index_pages.items():
    doc = documents.get(target_file(BASEURL + route))
    indexes = [n for n in doc.nodes if n.has_class('index-page')] if doc else []
    if len(indexes) != 1:
        errors.append('Missing standard index layout: ' + route)
        continue
    index = indexes[0]
    stats['index_pages'] += 1
    is_home = route == '/'
    intro = next((n for n in doc.nodes if n.has_class('hero-copy')), None) if is_home else next((n for n in index.children if n.tag == 'hgroup'), None)
    expected_title = expected_index['home']['title'] if is_home else expected_index['title']
    expected_summary = expected_index.get('landing', {}).get('description', expected_index['summary'])
    intro_values = [n.text() for n in intro.children if n.tag == 'h1' or n.has_class('hero-definition')] if is_home and intro else [n.text() for n in intro.children] if intro else []
    if not intro or intro_values != [expected_title, expected_summary]:
        errors.append('Index title or introduction differs from its source: ' + route)
    nav = next((n for n in index.children if n.has_class('index-navigation')), None)
    links = [n for n in doc.nodes if n.tag == 'a' and n.ancestor(lambda a: a is nav)] if nav else []
    actual = [{'title': n.text(), 'url': n.attrs.get('href')} for n in links]
    expected = [{'title': link['title'], 'url': BASEURL + link['url'] if link['url'].startswith('/') else link['url']} for link in expected_index['links']]
    if actual != expected:
        errors.append('Index page labels, destinations or order differ from the mega-menu: ' + route)
    labels = [n.text() for n in doc.nodes if n.has_class('index-group-label')]
    if labels != [group['title'] for group in expected_index['groups']]:
        errors.append('Index groups differ from the mega-menu: ' + route)
    if is_home:
        actions = [n.attrs.get('href') for n in doc.nodes if n.tag == 'a' and n.ancestor(lambda a: a.has_class('action-links')) and n.ancestor(lambda a: a.has_class('home-hero'))]
        if actions != [BASEURL + expected_index['home'][key]['url'] for key in ('primary', 'secondary')]:
            errors.append('Homepage actions differ from their approved routes')
        if len([n for n in doc.nodes if n.tag == 'h1' and n.ancestor(lambda a: a is index)]) != 1:
            errors.append('Homepage needs one primary heading')
        if not any(n.has_class('home-purpose') and n.text() == expected_index['title'] for n in doc.nodes):
            errors.append('Original homepage introduction is missing')
    else:
        for css_class, key in [('recommended-routes', 'introductory_routes'), ('featured-resources', 'featured_routes')]:
            actual_routes = [n.attrs.get('href') for n in doc.nodes if n.tag == 'a' and n.ancestor(lambda a: a.has_class(css_class))]
            if actual_routes != [BASEURL + r for r in expected_index['landing'][key]]:
                errors.append('Landing-page recommendations differ from their sources: ' + route)
        if len([n for n in doc.nodes if n.tag == 'h1' and n.ancestor(lambda a: a is index)]) != 1:
            errors.append('Landing page needs one primary heading: ' + route)
    stats['index_links'] += len(links)
for record in report['records']:
    file = target_file(BASEURL + record['url'])
    doc = documents.get(file)
    if not doc:
        errors.append('Missing record: ' + record['url'])
        continue
    source = (ROOT / record['file']).read_text()
    expected_properties = source.count('{: .record-properties }')
    if sum(n.has_class('record-properties') for n in doc.nodes) != expected_properties:
        errors.append('Body property markup did not render: ' + record['url'])
    if record['collection'] == 'events':
        content = next((n for n in doc.nodes if n.has_class('article-content')), None)
        if content and re.search(r'\bStatus: (Past|Upcoming)\b', content.text()):
            errors.append('Hardcoded event status: ' + record['url'])
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

# Directory targets must match the existing canonical records, not copied prose.
groups_route = '/working-groups/'
groups_doc = documents[target_file(BASEURL + groups_route)]
group_targets = [n.attrs.get('data-record-url') for n in groups_doc.nodes if n.has_class('card')]
expected_groups = [r['url'] for r in report['records'] if r['collection'] == 'working-groups' and not r['alternate']]
if sorted(group_targets) != sorted(expected_groups):
    errors.append('Working Groups directory omits or repeats canonical groups')
board_route = '/alliance/leadership/governing-board/'
board_doc = documents[target_file(BASEURL + board_route)]
board_targets = [n.attrs.get('data-record-url') for n in board_doc.nodes if n.has_class('card')]
board_slugs = re.findall(r'^- (.+)$', (ROOT / '_data/governing-board.yml').read_text(), re.M)
if board_targets != ['/people/' + slug + '/' for slug in board_slugs]:
    errors.append('Governing Board directory differs from the ordered roster')
for doc in (groups_doc, board_doc):
    if any(n.has_class('image-gallery') for n in doc.nodes):
        errors.append('Hand-maintained portraits or group lists remain beside generated cards')
    if any(n.tag == 'img' and '/placeholder.svg' in n.attrs.get('src', '') and n.ancestor(lambda a: a.has_class('card')) for n in doc.nodes):
        errors.append('Placeholder image in a directory card')
org_doc = documents[target_file(BASEURL + '/organisations/3bian/')]
if any(n.tag == 'a' and n.text() == 'Source' for n in org_doc.nodes):
    errors.append('3bian still displays an import-source label')

expected = ['1.1', '1.1.1', '1.1.2', '2.1'] + [f'2.1.{i}' for i in range(1, 6)] + ['3.1'] + [f'3.1.{i}' for i in range(1, 7)] + ['3.2'] + [f'3.2.{i}' for i in range(1, 9)] + ['3.3', '4.1', '4.2']
competition = documents[target_file(BASEURL + '/policies/competition-law-statement/')]
numbers = [n.text() for n in competition.nodes if n.has_class('clause-number')]
if numbers != expected:
    errors.append('Competition-law clause identifiers changed or disappeared')

result = {**stats, 'baseurl': BASEURL, 'errors': sorted(set(errors))}
(ROOT / 'reports/page-content.json').write_text(json.dumps(result, indent=2) + '\n')
print(json.dumps(result))
sys.exit(bool(errors))
