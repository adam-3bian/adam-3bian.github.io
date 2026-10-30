"""Validate generated pages using only Python's standard library."""
from collections import Counter
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit, unquote
import argparse
import json
import re

class Page(HTMLParser):
    def __init__(self, path):
        super().__init__(convert_charrefs=True)
        self.path = path
        self.ids = []
        self.links = []
        self.images = []
        self.headings = []
        self.labels = set()
        self.inputs = []
        self.references = []
        self.main_count = 0
        self.template_depth = 0
        self.title = False
        self.description = False
        self.canonical = False
        self.feed(path.read_text())

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == 'template': self.template_depth += 1
        if self.template_depth: return
        if attrs.get('id'): self.ids.append(attrs['id'])
        for key in ['aria-labelledby', 'aria-describedby', 'aria-controls']:
            if attrs.get(key): self.references.extend(attrs[key].split())
        if tag == 'a' and attrs.get('href'): self.links.append(attrs['href'])
        if tag in ['script', 'img'] and attrs.get('src'): self.links.append(attrs['src'])
        if tag == 'img': self.images.append(attrs)
        if re.fullmatch('h[1-6]', tag): self.headings.append(int(tag[1]))
        if tag == 'main': self.main_count += 1
        if tag == 'title': self.title = True
        if tag == 'meta' and attrs.get('name') == 'description': self.description = bool(attrs.get('content'))
        if tag == 'link':
            if attrs.get('rel') == 'stylesheet': self.links.append(attrs['href'])
            if attrs.get('rel') == 'canonical': self.canonical = attrs.get('href', '').startswith('https://')
        if tag == 'label' and attrs.get('for'): self.labels.add(attrs['for'])
        if tag in ['input', 'textarea', 'select'] and attrs.get('type') != 'hidden': self.inputs.append(attrs)

    def handle_endtag(self, tag):
        if tag == 'template': self.template_depth -= 1


def check(root, baseurl='', php=False):
    pages = {path.resolve(): Page(path) for path in root.rglob('*.html') if 'forms' not in path.relative_to(root).parts}
    failures = []
    expected = ['/', '/about/', '/cooperative/', '/repairs/', '/rent/', '/allocations/', '/apply/', '/fire-gas-safety/', '/key-issues/', '/documents/', '/contact/', '/form-information/', '/404.html']
    for route in expected:
        target = root / route.strip('/')
        if target.is_dir(): target /= 'index.html'
        if not target.exists(): failures.append('Missing original route: ' + route)
    for path, page in pages.items():
        name = str(path.relative_to(root.resolve()))
        if page.main_count != 1 or page.headings.count(1) != 1: failures.append(name + ': expected one main and h1')
        if not all([page.title, page.description, page.canonical]): failures.append(name + ': missing SEO metadata')
        duplicates = [key for key, count in Counter(page.ids).items() if count > 1]
        if duplicates: failures.append(name + ': duplicate IDs ' + str(duplicates))
        for previous, level in zip(page.headings, page.headings[1:]):
            if level > previous + 1: failures.append(name + ': skipped heading level')
        for reference in page.references:
            if reference not in page.ids: failures.append(name + ': missing ARIA target ' + reference)
        for field in page.inputs:
            if field.get('id') not in page.labels: failures.append(name + ': unlabelled control ' + field.get('name', ''))
        for image in page.images:
            if 'alt' not in image: failures.append(name + ': image without alt')
        for link in page.links:
            url = urlsplit(link)
            if url.scheme or url.netloc: continue
            route = unquote(url.path)
            if baseurl and route.startswith('/'):
                if not route.startswith(baseurl + '/'):
                    failures.append(name + ': link misses baseurl ' + link)
                    continue
                route = route[len(baseurl):]
            target = (root / route.lstrip('/')) if route.startswith('/') else (path.parent / route if route else path)
            if target.is_dir(): target /= 'index.html'
            if not target.exists(): failures.append(name + ': broken link ' + link)
            elif url.fragment and target.resolve() in pages and unquote(url.fragment) not in pages[target.resolve()].ids:
                failures.append(name + ': broken anchor ' + link)
    for path in root.rglob('*'):
        relative = path.relative_to(root)
        if path.name.startswith('.env') or 'form-runtime' in relative.parts:
            failures.append('Private configuration/runtime in public build: ' + str(path))
        if php and relative.parts[0] == 'forms': continue
        if path.suffix in ['.php', '.rb', '.scss'] or path.name in ['composer.json', 'config.php']:
            failures.append('Private/source file in public build: ' + str(path))
    if php:
        for name in ['index.php', 'app.php', 'config.php', 'vendor/autoload.php', 'schema.json']:
            if not (root / 'forms' / name).is_file(): failures.append('Missing portable handler file: ' + name)
        schema_path = root / 'forms/schema.json'
        if schema_path.is_file():
            schema = json.loads(schema_path.read_text())
            if set(schema) != {'contact', 'application'}: failures.append('Missing generated form definitions')
            for route, name in [('contact', 'contact'), ('apply', 'application')]:
                expected_action = f'action="{baseurl}/forms/index.php?form={name}"'
                if expected_action not in (root / route / 'index.html').read_text():
                    failures.append('Incorrect portable form endpoint: ' + route)
    elif (root / 'forms').exists():
        failures.append('Form service included in the GitHub Pages build')
    if failures:
        raise SystemExit('\n'.join(failures))
    mode = 'portable PHP handler included' if php else 'static Pages output without PHP'
    print(f'PASS: {len(pages)} pages; routes, links, labels, headings, ARIA, metadata and secret exclusion; {mode}.')

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('root', nargs='?', default='_site')
    parser.add_argument('baseurl', nargs='?', default='')
    parser.add_argument('--php', action='store_true', help='Check the portable PHP profile')
    args = parser.parse_args()
    check(Path(args.root), args.baseurl, args.php)
