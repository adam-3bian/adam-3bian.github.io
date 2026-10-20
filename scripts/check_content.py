#!/usr/bin/env python3
"""Validate structured content and the rendered graph without Jekyll plugins."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit, unquote
import argparse, collections, json, re, sys, posixpath
import yaml

ROOT = Path(__file__).resolve().parents[1]

def document(path):
    text = path.read_text()
    match = re.match(r'^---\s*\n(.*?)\n---\s*\n?', text, re.S)
    if not match: raise ValueError(f'{path}: missing YAML front matter')
    return yaml.safe_load(match[1]) or {}, text[match.end():]

class HTML(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.ids = []; self.links = set(); self.main = False; self.h1s = 0
    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == 'main': self.main = True
        if attrs.get('id'): self.ids.append(attrs['id'])
        if tag == 'h1': self.h1s += 1
        if self.main:
            for key in ('href', 'src'):
                if attrs.get(key): self.links.add(attrs[key])
    def handle_endtag(self, tag):
        if tag == 'main': self.main = False

def route_of(path):
    name = path.as_posix()
    return '/' + (name.removesuffix('index.html') if name.endswith('index.html') else name)

def target_file(url, current, baseurl):
    parts = urlsplit(url)
    if parts.scheme or parts.netloc: return None
    target = parts.path or current
    if not target.startswith('/'): target = posixpath.normpath(posixpath.join(posixpath.dirname(current), target))
    if baseurl and (target == baseurl or target.startswith(baseurl + '/')): target = target[len(baseurl):] or '/'
    target = unquote(target).lstrip('/')
    if not target or target.endswith('/'): target += 'index.html'
    return target, unquote(parts.fragment), parts.fragment

def validate_source(errors):
    config = yaml.safe_load((ROOT / '_config.yml').read_text())
    schema = yaml.safe_load((ROOT / '_data/catalog.yml').read_text())
    baseline = json.loads((ROOT / 'scripts/fixtures/collection-baseline.json').read_text())
    records = {}
    for collection in config['collections']:
        assert collection in schema, f'Missing schema for {collection}'
        records[collection] = {p.stem: document(p)[0] for p in (ROOT / ('_' + collection)).glob('*.md')}
    for path, old in baseline.items():
        file = ROOT / path
        if not file.exists(): errors.append(f'Removed original record: {path}'); continue
        fm, body = document(file)
        for key in ('authors', 'speakers', 'organization'):
            if key in old:
                expected = old[key] if isinstance(old[key], list) else [old[key]]
                if fm.get(key) != expected: errors.append(f'{path}: changed ordered {key} references')
    for collection, entries in records.items():
        for slug, fm in entries.items():
            label = f'_{collection}/{slug}.md'
            if not fm.get('title'): errors.append(f'{label}: missing title')
            for field, target in [('authors', 'people'), ('speakers', 'people'), ('organization', 'organisations')]:
                value = fm.get(field, [])
                if not isinstance(value, list): errors.append(f'{label}: {field} must be an array'); continue
                for ref in value:
                    if ref not in records[target]: errors.append(f'{label}: unresolved {field}: {ref}')
            for value in [fm.get('version'), fm.get('certification', {}).get('programme_version')]:
                if value is not None and not isinstance(value, str): errors.append(f'{label}: quote version strings')
            for field in ('start_date', 'end_date'):
                if field in fm and not re.fullmatch(r'\d{4}-\d\d-\d\d', str(fm[field])): errors.append(f'{label}: invalid {field}')
            if fm.get('end_date') and fm['end_date'] < fm['start_date']: errors.append(f'{label}: negative event range')
            if sum(bool(link.get('primary')) for link in fm.get('links', [])) > 1: errors.append(f'{label}: multiple primary links')
            for link in fm.get('links', []):
                if not all(link.get(key) for key in ('label', 'url', 'kind')): errors.append(f'{label}: incomplete resource link')
    talks = yaml.safe_load((ROOT / '_data/talks.yml').read_text())
    if len({talk['id'] for talk in talks}) != len(talks): errors.append('Duplicate talk identifiers')
    for talk in talks:
        for ref in talk['speakers']:
            if ref not in records['people']: errors.append(f'Talk {talk["id"]}: missing speaker {ref}')
        if talk.get('event') and talk['event'] not in records['events']: errors.append(f'Talk {talk["id"]}: missing event')
    # Ensure typed dates and versions carry the original precision.
    policy = records['policies']['intellectual-property-policy']
    if policy['version'] != '1.01' or policy['document_date'] != '2024-08': errors.append('IP policy lost version/date precision')
    counts = {key: len(value) for key, value in records.items()}
    return {'collections': counts, 'original_records': len(baseline), 'talks': len(talks)}

def validate_site(site, baseurl, errors):
    baseline = json.loads((ROOT / 'scripts/fixtures/site-baseline.json').read_text())
    pages = {}
    for path in site.rglob('*.html'):
        scan = HTML(); scan.feed(path.read_text())
        pages[path.relative_to(site).as_posix()] = scan
        if 'Liquid Exception' in path.read_text() or 'Liquid error:' in path.read_text(): errors.append(f'{path}: Liquid rendering error')
    missing_routes = set(baseline) - set(pages)
    for route in sorted(missing_routes): errors.append(f'Removed output route: {route}')
    for relative, old in baseline.items():
        scan = pages.get(relative)
        if not scan: continue
        for anchor in set(old['ids']) - set(scan.ids): errors.append(f'{relative}: removed anchor #{anchor}')
    # Compare broken destinations against the original main snapshot.
    old_broken = set()
    for relative, old in baseline.items():
        for link in old['links']:
            target = target_file(link, route_of(Path(relative)), '')
            if not target: continue
            dest, fragment, raw_fragment = target
            if dest not in baseline and not (site / dest).exists(): old_broken.add((relative, link))
            elif fragment and dest in baseline and fragment not in baseline[dest]['ids'] and raw_fragment not in baseline[dest]['ids']: old_broken.add((relative, link))
    current_broken = []
    for relative, scan in pages.items():
        if not scan.ids and not scan.links: continue  # Static redirect documents.
        duplicates = [value for value, count in collections.Counter(scan.ids).items() if count > 1]
        if duplicates: errors.append(f'{relative}: duplicate IDs: {duplicates[:5]}')
        if scan.h1s > 1: errors.append(f'{relative}: {scan.h1s} H1s')
        for link in scan.links:
            target = target_file(link, baseurl + route_of(Path(relative)), baseurl)
            if not target: continue
            dest, fragment, raw_fragment = target
            broken = not (site / dest).exists()
            if not broken and fragment and dest in pages: broken = fragment not in pages[dest].ids and raw_fragment not in pages[dest].ids
            if broken:
                normalised = link[len(baseurl):] if baseurl and link.startswith(baseurl + '/') else link
                if (relative, normalised) not in old_broken: current_broken.append((relative, normalised))
            if baseurl and link.startswith('/') and not link.startswith('//') and not (link == baseurl or link.startswith(baseurl + '/')): errors.append(f'{relative}: URL escapes baseurl: {link}')
    errors.extend(f'{relative}: new broken link {link}' for relative, link in current_broken)
    return {'rendered_pages': len(pages), 'preserved_routes': len(baseline), 'baseline_broken_references': len(old_broken), 'inherited_broken_links': [{'page': page, 'url': url} for page, url in sorted(old_broken)], 'new_broken_references': len(current_broken)}

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--site', type=Path)
    parser.add_argument('--baseurl', default='')
    parser.add_argument('--report', type=Path, default=ROOT / 'reports/content-audit.json')
    args = parser.parse_args(); errors = []
    result = validate_source(errors)
    if args.site: result.update(validate_site(args.site, args.baseurl.rstrip('/'), errors))
    result['errors'] = errors
    args.report.parent.mkdir(parents=True, exist_ok=True)
    args.report.write_text(json.dumps(result, indent=2) + '\n')
    print(json.dumps(result, indent=2))
    return bool(errors)

if __name__ == '__main__': sys.exit(main())
