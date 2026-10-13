#!/usr/bin/env python3
"""Check every built collection record using only Python's standard library."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urljoin, urlsplit
import argparse
import json

class Document(HTMLParser):
    def __init__(self, text):
        super().__init__(convert_charrefs=True)
        self.links, self.images, self.ids = [], [], set()
        self.collection = None
        self.missing_reference = False
        self.feed(text)

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if 'id' in attrs:
            self.ids.add(attrs['id'])
        if tag == 'article':
            self.collection = attrs.get('data-collection')
        if tag == 'a' and 'href' in attrs:
            self.links.append(attrs['href'])
        if tag == 'img' and 'src' in attrs:
            self.images.append(attrs['src'])
        if 'data-missing-reference' in attrs:
            self.missing_reference = True

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('destination', nargs='?', default='_site')
    parser.add_argument('--baseurl', default='')
    args = parser.parse_args()
    root = Path(__file__).resolve().parents[1]
    destination = (root / args.destination).resolve()
    baseurl = args.baseurl.rstrip('/')
    cache = {file.resolve(): Document(file.read_text()) for file in destination.rglob('*.html')}
    errors = []
    records = links = images = 0
    for file, document in cache.items():
        if not document.collection or document.collection == 'pages':
            continue
        records += 1
        route = '/' + str(file.relative_to(destination)).removesuffix('index.html')
        if document.missing_reference:
            errors.append(f'Missing reference in {route}')
        for kind, urls in [('link', document.links), ('image', document.images)]:
            for url in urls:
                resolved = urlsplit(urljoin('https://collection-check.invalid' + baseurl + route, url))
                if resolved.netloc != 'collection-check.invalid':
                    continue
                path = unquote(resolved.path)
                if baseurl and not (path == baseurl or path.startswith(baseurl + '/')):
                    errors.append(f'Link escapes baseurl: {route} -> {url}')
                    continue
                target = (destination / path.removeprefix(baseurl).lstrip('/')).resolve()
                if not target.is_relative_to(destination):
                    errors.append(f'Link escapes build: {route} -> {url}')
                    continue
                if target.is_dir():
                    target /= 'index.html'
                if kind == 'link': links += 1
                else: images += 1
                if not target.is_file():
                    errors.append(f'Missing {kind} target: {route} -> {url}')
                elif resolved.fragment and target in cache and unquote(resolved.fragment) not in cache[target].ids:
                    errors.append(f'Missing anchor: {route} -> {url}')
    if not records:
        errors.append('No collection records found in the build')
    report = dict(collection_records=records, local_links=links, local_images=images,
                  baseurl=baseurl, errors=sorted(set(errors)))
    (root / 'reports/collection-links.json').write_text(json.dumps(report, indent=2) + '\n')
    print(json.dumps(report))
    return bool(errors)

if __name__ == '__main__':
    raise SystemExit(main())
