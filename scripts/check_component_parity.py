#!/usr/bin/env python3
"""Compare all rendered routes, text, links, images and fragment IDs across the refactor.

The user explicitly requested replacing external form CTAs with on-page fields.
Only the form panel is excluded; editorial guidance outside it stays protected.
"""
import argparse
import collections
import hashlib
import json
from pathlib import Path
from lxml import html


def snapshot(folder, baseurl=''):
    pages = {}
    for path in folder.rglob('*.html'):
        tree = html.fromstring(path.read_text())
        for node in tree.xpath('//script|//style|//svg|//*[contains(concat(" ",normalize-space(@class)," ")," form-panel ")]'):
            node.drop_tree()
        main = tree.find('.//main')
        scope = main if main is not None else tree
        def local(url):
            return url[len(baseurl):] if baseurl and url.startswith(baseurl + '/') else url
        fields = {
            'text': ' '.join(scope.text_content().split()),
            'links': dict(collections.Counter(local(u) for u in scope.xpath('.//a/@href'))),
            'images': sorted(local(u) for u in scope.xpath('.//img/@src')),
            'ids': sorted(scope.xpath('.//@id')),
        }
        pages[path.relative_to(folder).as_posix()] = {
            key: hashlib.sha256(json.dumps(value, sort_keys=True, ensure_ascii=False).encode()).hexdigest()
            for key, value in fields.items()}
    return pages


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('before', type=Path)
    parser.add_argument('after', type=Path)
    parser.add_argument('--report', type=Path, required=True)
    parser.add_argument('--write-baseline', type=Path)
    parser.add_argument('--baseurl', default='')
    args = parser.parse_args()
    before = json.loads(args.before.read_text()) if args.before.is_file() else snapshot(args.before)
    after = snapshot(args.after, args.baseurl.rstrip('/'))
    if args.write_baseline:
        args.write_baseline.parent.mkdir(parents=True, exist_ok=True)
        args.write_baseline.write_text(json.dumps(before, indent=2, sort_keys=True) + '\n')
    errors = []
    if set(before) != set(after):
        errors.append({'routes_removed': sorted(set(before) - set(after)), 'routes_added': sorted(set(after) - set(before))})
    for route in before.keys() & after.keys():
        for field in before[route]:
            if before[route][field] != after[route][field]:
                errors.append({'route': route, 'field': field, 'before': before[route][field], 'after': after[route][field]})
    args.report.parent.mkdir(parents=True, exist_ok=True)
    args.report.write_text(json.dumps({'routes': len(before), 'errors': errors}, indent=2) + '\n')
    print(f'Component content parity: {len(before)} routes, {len(errors)} differences; {args.report}')
    if errors:
        raise SystemExit(1)
