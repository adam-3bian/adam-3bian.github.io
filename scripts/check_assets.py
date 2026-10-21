#!/usr/bin/env python3
"""Validate asset ownership, primary image contracts and local media references."""
import argparse
import collections
import json
from pathlib import Path
import re
from urllib.parse import unquote, urlsplit

from PIL import Image
from check_spec import ROOT, document


def check(site=None):
    errors = []
    counts = collections.Counter()
    manifest = json.loads((ROOT / 'docs/assets/migration.json').read_text())['assets']
    obsolete = {row['source'] for row in manifest
                if row.get('target') != row['source'] and row['source'].startswith('/assets/')}
    allowed = {'images', 'pdf', 'zip', 'fonts', 'text', 'video', 'audio', 'css', 'js'}
    def check_css(file, directory):
        for raw in re.findall(r'url\([\'"]?([^\)\'"\s]+)', file.read_text()):
            if raw.startswith(('data:', 'http:', 'https:', '#')):
                continue
            target = (directory / raw.lstrip('/')) if raw.startswith('/') else file.parent / raw
            if not target.is_file():
                errors.append(f'{file}: missing CSS asset {raw}')
    for file in (ROOT / 'assets').rglob('*'):
        if not file.is_file():
            continue
        relative = file.relative_to(ROOT / 'assets')
        counts['files'] += 1
        if relative.parts[0] not in allowed:
            errors.append(f'{file}: unexplained media-type directory')
        if file.name == '.DS_Store' or not re.fullmatch(r'[a-z0-9][a-z0-9.-]*', file.name):
            errors.append(f'{file}: filename must use lowercase kebab-case')
        if file.suffix == '.pdf' and not file.read_bytes().startswith(b'%PDF-'):
            errors.append(f'{file}: invalid PDF signature')
        if file.suffix in {'.webp', '.png', '.jpg', '.jpeg', '.ico', '.gif'}:
            try:
                with Image.open(file) as image:
                    image.verify()
            except (OSError, ValueError) as exc:
                errors.append(f'{file}: unreadable image: {exc}')
        if file.suffix == '.css':
            check_css(file, ROOT)
        if site and file.suffix != '.scss' and not (site / file.relative_to(ROOT)).is_file():
            errors.append(f'{file}: missing from the built site')
    for family, kind, ratio, fit in [('people', 'people', (1, 1), 'cover'),
                                     ('organisations', 'organisation', (3, 1), 'contain'),
                                     ('events', 'events', (16, 9), 'cover'),
                                     ('posts', 'posts', (16, 9), 'cover')]:
        for path in (ROOT / ('_' + family)).glob('*.md'):
            data, _ = document(path)
            media = data.get('image')
            if not media:
                continue
            expected = f'/assets/images/{kind}/{path.stem}.webp'
            if media['src'] != expected or media.get('fit') != fit:
                errors.append(f'{path}: expected {expected}, fit={fit}')
            file = ROOT / media['src'].lstrip('/')
            try:
                with Image.open(file) as image:
                    image.load()
                    if image.format != 'WEBP' or image.width * ratio[1] != image.height * ratio[0]:
                        errors.append(f'{path}: wrong image format or aspect ratio')
                    if (media.get('width'), media.get('height')) != image.size:
                        errors.append(f'{path}: image dimensions disagree with frontmatter')
                    if kind == 'organisation' and ('A' not in image.getbands() or image.getchannel('A').getextrema()[0] != 0):
                        errors.append(f'{path}: organisation logo lacks transparent padding')
            except (OSError, ValueError) as exc:
                errors.append(f'{path}: cannot read image: {exc}')
            counts[family + '_primary_images'] += 1
    # Scan active sources, including CSS and JavaScript. Historical migration
    # snapshots remain evidence of the previous paths, not live references.
    roots = [ROOT / name for name in ['pages', '_includes', '_layouts', '_sass', '_data']]
    roots += [p for p in ROOT.glob('_*') if p.is_dir() and p.name not in {'_site', '_includes', '_layouts', '_sass', '_data'}]
    files = {p for folder in roots for p in folder.rglob('*')
             if p.is_file() and p.suffix in {'.md', '.html', '.yml', '.scss', '.css', '.js'}}
    files |= {ROOT / '_config.yml'}
    files |= {p for p in (ROOT / 'assets').rglob('*') if p.suffix in {'.css', '.scss', '.js'}}
    for folder in roots:
        for path in folder.rglob('*'):
            if path.is_file() and path.suffix.lower() in {'.png', '.jpg', '.jpeg', '.webp', '.svg', '.pdf', '.zip', '.mp4', '.mp3', '.heic'}:
                errors.append(f'{path}: content media belongs under assets/')
    asset_pattern = re.compile(r'/assets/[^\s\)\]\}\'"<>;]+')
    remote_pattern = re.compile(r'https?://(?:www\.)?cheri-alliance\.org/[^\s<>\)\]\}"\']+')
    for path in files:
        text = path.read_text()
        for raw in asset_pattern.findall(text):
            url = unquote(urlsplit(raw).path)
            counts['local_references'] += 1
            target = ROOT / url.lstrip('/')
            # main.css is generated by Jekyll from main.scss.
            if url == '/assets/css/main.css' and (ROOT / 'assets/css/main.scss').is_file():
                continue
            if url in obsolete or not target.is_file():
                errors.append(f'{path}: obsolete or missing asset {raw}')
        for raw in remote_pattern.findall(text):
            if '/wp-content/' in raw or re.search(r'\.(pdf|png|jpe?g|webp|svg|zip|mp4|mp3)(?:[?#]|$)', raw, re.I):
                errors.append(f'{path}: media is still hosted remotely: {raw}')
    for row in manifest:
        if row.get('error'):
            errors.append(f"Download failed: {row['source']}: {row['error']}")
        if row.get('target') and not (ROOT / row['target'].lstrip('/')).is_file():
            errors.append(f"Migration target missing: {row['target']}")
        if row['operation'] == 'download':
            counts['downloaded_assets'] += 1
    if site:
        for file in (site / 'assets').rglob('*.css'):
            check_css(file, site)
    result = {'counts': dict(counts), 'errors': sorted(set(errors))}
    return result


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--site', type=Path)
    parser.add_argument('--report', type=Path)
    args = parser.parse_args()
    result = check(args.site)
    if args.report:
        args.report.parent.mkdir(parents=True, exist_ok=True)
        args.report.write_text(json.dumps(result, indent=2) + '\n')
    print(json.dumps(result, indent=2))
    raise SystemExit(bool(result['errors']))
