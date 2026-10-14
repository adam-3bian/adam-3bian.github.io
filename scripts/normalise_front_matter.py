#!/usr/bin/env python3
"""One-time, idempotent migration to the minimal authoring contract."""
import argparse
import re
from pathlib import Path
from urllib.parse import urlsplit

import yaml

ROOT = Path(__file__).resolve().parent.parent
LABELS = {
    'cheribuild': 'Build tools (cheribuild)',
    'cheribsd': 'CheriBSD source',
    'cheribsd-ports': 'CheriBSD ports',
    'cheriot-rtos': 'CHERIoT RTOS source',
    'cheriot-sail': 'CHERIoT Sail model',
    'cheriot-ibex': 'CHERIoT Ibex source',
    'CHERI-zephyr': 'CHERI Zephyr source',
    'qemu': 'CHERI QEMU source',
    'linux': 'CHERI Linux source',
    'cheri-rust': 'CHERIoT Rust source',
    'CHERI-seL4': 'CHERI seL4 source',
    'CHERI-Microkit': 'CHERI Microkit source',
    'RepoMgmtWG': 'Repository management working group',
}

def clean(value):
    if isinstance(value, dict):
        return {key: cleaned for key, child in value.items()
                if (cleaned := clean(child)) is not None and cleaned != [] and cleaned != {}}
    if isinstance(value, list):
        return [clean(child) for child in value]
    return value

def migrate(fields, body=''):
    fields = dict(fields)
    if 'repository_urls' in fields:
        repositories = []
        links = dict((url, label) for label, url in re.findall(r'\[([^\]]+)\]\((https?://[^\s)]+)\)', body))
        for url in fields.pop('repository_urls') or []:
            parts = urlsplit(url).path.strip('/').split('/')
            name = parts[-1]
            label = LABELS.get(name) or links.get(url) or '/'.join(parts[-2:])
            if name == 'gdb':
                label = 'CHERI Alliance GDB source' if parts[0] == 'CHERI-Alliance' else 'CHERI GDB source'
            if name == 'rust':
                label = 'Rust CHERI toolchain'
            repositories.append({'label': label, 'url': url})
        fields['repositories'] = repositories
    if 'author' in fields:
        author = fields.pop('author')
        if author:
            fields['authors'] = [author]
    if str(fields.get('image_url', '')).endswith('/placeholder.svg'):
        fields.pop('image_url')
    if fields.get('title') == 'CheriBSD' and fields.get('website_url'):
        fields['website_label'] = 'Get started with CheriBSD'
    if fields.get('title') == 'Sonata' and fields.get('website_url'):
        fields['website_label'] = 'Read Sonata documentation'
    return clean(fields)

def update(path):
    original = path.read_text()
    match = re.match(r'\A---\n(.*?)\n---(.*)\Z', original, re.S)
    if not match:
        return False
    fields = migrate(yaml.safe_load(match[1]), match[2])
    body = match[2]
    # Remove only stand-alone lists whose destinations now render centrally.
    central = {value for key, value in fields.items() if key.endswith('_url') and isinstance(value, str)}
    central.update(repository['url'] for repository in fields.get('repositories', []))
    section = re.search(r'\n## Project links\n(.*?)(?=\n## |\Z)', body, re.S)
    if section:
        content = section[1].strip()
        lines = content.splitlines()
        links = re.findall(r'^- \[[^\]]+\]\(([^)]+)\)$', content, re.M)
        if lines and len(links) == len(lines) and set(links) <= central:
            body = body[:section.start()] + body[section.end():]
    result = '---\n' + yaml.safe_dump(fields, sort_keys=False, allow_unicode=True, width=1000) + '---' + body
    if result == original:
        return False
    if ARGS.write:
        path.write_text(result)
    return True

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--write', action='store_true', help='Write the migration (otherwise report candidates)')
    ARGS = parser.parse_args()
    files = list(ROOT.glob('_*/*.md')) + list((ROOT / 'pages').rglob('*.md'))
    changed = sum(update(path) for path in files)
    reference = ROOT / 'FRONT_MATTER.MD'
    source = reference.read_text()
    def example(match):
        fields = yaml.safe_load(match[1])
        if not isinstance(fields, dict):
            return match[0]
        return '```yaml\n' + yaml.safe_dump(migrate(fields), sort_keys=False, allow_unicode=True, width=1000) + '```'
    result = re.sub(r'```yaml\n(.*?)\n```', example, source, flags=re.S)
    if ARGS.write:
        reference.write_text(result)
    print(f'{changed} source files {"migrated" if ARGS.write else "would change"}; front matter examples normalised.')
