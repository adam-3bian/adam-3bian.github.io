#!/usr/bin/env python3
"""Inventory the live Liquid graph, including nested calls and layout inheritance.

Counts are source call sites, not the number of loop iterations at runtime.
Archived migration fixtures, scripts and built output are not template callers.
"""
import argparse
import collections
import json
import re
from pathlib import Path
import yaml

ROOT = Path(__file__).resolve().parents[1]
CONTENT = ['pages', '_posts', '_events', '_people', '_organisations', '_papers',
           '_products', '_repositories', '_groups', '_guides', '_policies', '_redirects', '_glossary']


def inventory():
    files = [p for folder in ['_includes', '_layouts', *CONTENT]
             for p in (ROOT / folder).rglob('*') if p.suffix in {'.html', '.md'}]
    files += [ROOT / '_config.yml']
    calls = collections.defaultdict(list)
    graph = collections.defaultdict(set)
    dynamic = []
    resolved_dynamic = []
    for path in sorted(files):
        text = path.read_text()
        name = path.relative_to(ROOT).as_posix()
        # Preserve line numbers while ignoring literal Liquid examples/comments.
        text = re.sub(r'{%-?\s*(raw|comment)\s*-?%}.*?{%-?\s*end\1\s*-?%}',
                      lambda m: '\n' * m[0].count('\n'), text, flags=re.S)
        for match in re.finditer(r'{%-?\s*include\s+([^\s%]+)', text):
            target = match[1].strip('"\'')
            loc = f'{name}:{text[:match.start()].count(chr(10)) + 1}'
            if '{{' in target or not target.endswith('.html'):
                dynamic.append({'caller': loc, 'expression': target})
                continue
            target = '_includes/' + target
            calls[target].append(loc)
            graph[name].add(target)
        if name == '_config.yml':
            config = yaml.safe_load(text)
            layouts = [(d.get('values', {}).get('layout'), f'{name}:defaults[{i}]')
                       for i, d in enumerate(config.get('defaults', []))]
            # The supported Pages plugin injects this layout at runtime, even
            # though redirect records deliberately declare layout: null.
            if 'jekyll-redirect-from' in config.get('plugins', []):
                layouts.append(('redirect', '_config.yml:plugins[jekyll-redirect-from]'))
                resolved_dynamic.append({'owner': 'jekyll-redirect-from',
                                         'target': '_layouts/redirect.html',
                                         'generated_records': len(list((ROOT / '_redirects').glob('*.md')))})
        elif text.startswith('---\n'):
            data = yaml.safe_load(text.split('---', 2)[1]) or {}
            layouts = [(data.get('layout'), f'{name}:front-matter')]
        else:
            layouts = []
        for layout, loc in layouts:
            if layout:
                target = '_layouts/' + str(layout) + '.html'
                calls[target].append(loc)
                graph[name].add(target)
    roots = {p.relative_to(ROOT).as_posix() for p in files
             if p.parts[len(ROOT.parts)] not in {'_includes', '_layouts'}}
    reachable = set(roots)
    pending = list(roots)
    while pending:
        for target in graph[pending.pop()] - reachable:
            reachable.add(target)
            pending.append(target)
    rows = []
    for folder in ['_includes', '_layouts']:
        for path in sorted((ROOT / folder).rglob('*.html')):
            name = path.relative_to(ROOT).as_posix()
            text = path.read_text()
            body = re.sub(r'^---\n.*?\n---\n', '', text, flags=re.S).strip()
            rows.append({'file': name, 'call_sites': len(calls[name]),
                         'callers': calls[name], 'reachable': name in reachable,
                         'lines': len(text.splitlines()), 'thin_wrapper': body == '{{ content }}',
                         'dependencies': sorted(graph[name])})
    missing = sorted(target for targets in graph.values() for target in targets
                     if not (ROOT / target).is_file())
    return {'counts': {folder: sum(r['file'].startswith(folder + '/') for r in rows)
                       for folder in ['_includes', '_layouts']},
            'single_use_includes': sum(r['file'].startswith('_includes/') and r['call_sites'] == 1 for r in rows),
            'dynamic_references': dynamic, 'resolved_dynamic_references': resolved_dynamic,
            'missing_references': missing, 'templates': rows}


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', type=Path)
    args = parser.parse_args()
    result = inventory()
    if args.output:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(json.dumps(result, indent=2) + '\n')
    print(json.dumps({k: v for k, v in result.items() if k != 'templates'}, indent=2))
    if result['missing_references'] or result['dynamic_references']:
        raise SystemExit('Unresolved template references require review')
