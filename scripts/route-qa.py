#!/usr/bin/env python3
"""Prepare reference candidates; incomplete until route alignment and review exist."""
import argparse
import csv
import hashlib
import html
import json
import os
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
REFS = ROOT / 'references'

def read_csv(path):
    with path.open(newline='', encoding='utf-8') as source:
        return list(csv.DictReader(source))

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--interval', type=int, choices=(5, 10), default=5)
    parser.add_argument('--out', type=Path, default=ROOT / 'work' / 'route-qa')
    args = parser.parse_args()
    out = args.out.resolve()
    if out == REFS.resolve() or REFS.resolve() in out.parents:
        parser.error('Output must not be inside references/')
    expanded = read_csv(REFS / 'frame-index-expanded.csv')
    alignment = read_csv(REFS / 'frame-alignment.csv')
    by_number = {int(row['frame_number']): row for row in expanded}
    errors = []
    if len(expanded) != 3000 or len(by_number) != 3000:
        errors.append('Expanded index must contain 3000 distinct frame numbers')
    if len(alignment) != 584:
        errors.append('Alignment index must contain 584 original frames')
    for row in alignment:
        original = int(row['original_frame_number'])
        number = int(row['expanded_frame_number'])
        match = by_number.get(number)
        original_path = (REFS / row['original_path']).resolve()
        original_valid = REFS.resolve() in original_path.parents and original_path.is_file()
        original_hash = hashlib.sha256(original_path.read_bytes()).hexdigest() if original_valid else None
        if (number != 5 * original - 2 or not match or match['sha256'] != row['sha256']
                or original_hash != row['sha256']
                or int(row['original_relative_seconds']) != (original - 17) * 5
                or int(row['expanded_relative_seconds']) != number - 1):
            errors.append(f'Invalid frame alignment: original {original}, expanded {number}')
    entries = []
    for row in expanded:
        seconds = int(row['seconds_after_first_supplied_frame'])
        if seconds % args.interval:
            continue
        path = (REFS / row['canonical_path']).resolve()
        digest = None
        if REFS.resolve() not in path.parents or not path.is_file():
            errors.append(f'Missing or invalid reference: {row["canonical_path"]}')
        else:
            digest = hashlib.sha256(path.read_bytes()).hexdigest()
            if digest != row['sha256']:
                errors.append(f'Checksum mismatch: {row["canonical_path"]}')
        entries.append({'frame': int(row['frame_number']), 'relative_seconds': seconds,
                        'reference': row['canonical_path'], 'sha256': digest,
                        'classification': 'unclassified', 'alignment': 'unmapped',
                        'game_capture': None, 'review': 'unreviewed'})
    out.mkdir(parents=True, exist_ok=True)
    hashed_inputs = [REFS / 'frame-index-expanded.csv', REFS / 'frame-alignment.csv', Path(__file__).resolve()]
    source_hashes = {str(path.relative_to(ROOT)): hashlib.sha256(path.read_bytes()).hexdigest() for path in hashed_inputs}
    report = {'status': 'incomplete', 'interval_seconds': args.interval, 'source_hashes': source_hashes,
              'candidate_count': len(entries), 'mapped_count': 0, 'captured_count': 0,
              'reviewed_count': 0, 'unmapped_count': len(entries), 'errors': errors,
              'limitations': ['No route alignment, game captures, visual comparisons or streaming checks have been performed.'],
              'candidates': entries}
    (out / 'report.json').write_text(json.dumps(report, indent=2) + '\n', encoding='utf-8')
    cards = []
    for entry in entries:
        target = os.path.relpath(REFS / entry['reference'], out)
        url = html.escape(target, quote=True)
        cards.append(f'<figure><a href="{url}"><img loading="lazy" src="{url}" alt="Reference frame {entry["frame"]}"></a><figcaption>Frame {entry["frame"]}, {entry["relative_seconds"]} s: unmapped, unreviewed</figcaption></figure>')
    page = '<!doctype html><html lang="en"><meta charset="utf-8"><title>Route reference candidates</title><style>body{font:16px sans-serif}main{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:1em}figure{margin:0}img{width:100%}</style><h1>Unmapped reference candidates</h1><p>No game comparisons have been performed.</p><main>' + ''.join(cards) + '</main></html>'
    (out / 'index.html').write_text(page, encoding='utf-8')
    print(f'INCOMPLETE: {len(entries)} candidates, 0 mapped, 0 reviewed; {len(errors)} source errors. Report: {out / "report.json"}')
    return 1

if __name__ == '__main__':
    raise SystemExit(main())
