#!/usr/bin/env python3
"""Prepare source candidates and validated, explicitly approximate critical pairs."""
import argparse
import csv
import hashlib
import html
import json
import math
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
    parser.add_argument('--alignment', type=Path, default=ROOT / 'docs' / 'reference-comparisons.json')
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
    # Supplemental critical views are separate from the fixed-interval sample.
    # Never derive an unreviewed frame's location from elapsed video time.
    critical = []
    alignment_path = args.alignment.resolve()
    if alignment_path.is_file():
        try:
            doc = json.loads(alignment_path.read_text(encoding='utf-8'))
            if doc.get('version') != 1 or not isinstance(doc.get('critical_pairs'), list):
                raise ValueError('Unsupported critical-pair manifest')
            build = ROOT / 'site' / 'build-manifest.json'
            if hashlib.sha256(build.read_bytes()).hexdigest() != doc.get('build_manifest_sha256'):
                raise ValueError('Critical-pair build hash is stale')
            seen = set()
            for pair in doc['critical_pairs']:
                number = int(pair['expanded_frame'])
                if number in seen or number not in by_number:
                    raise ValueError(f'Duplicate or unknown critical frame {number}')
                seen.add(number)
                row = by_number[number]
                reference = (REFS / row['canonical_path']).resolve()
                capture = (ROOT / pair['capture']).resolve()
                if REFS.resolve() not in reference.parents or not reference.is_file() or hashlib.sha256(reference.read_bytes()).hexdigest() != row['sha256'] or pair['reference_sha256'] != row['sha256']:
                    raise ValueError(f'Critical reference {number} does not match its source hash')
                if ROOT.resolve() not in capture.parents or REFS.resolve() in capture.parents or not capture.is_file() or hashlib.sha256(capture.read_bytes()).hexdigest() != pair['capture_sha256']:
                    raise ValueError(f'Critical capture {number} is missing or changed')
                signature = capture.read_bytes()[:8]
                if not (signature == b'\x89PNG\r\n\x1a\n' or signature.startswith(b'\xff\xd8\xff')):
                    raise ValueError(f'Critical capture {number} is not a PNG or JPEG image')
                if pair.get('direction') not in (-1, 1) or not isinstance(pair.get('chainage_m'), (int, float)) or not math.isfinite(pair['chainage_m']) or not isinstance(pair.get('lane'), (int, float)) or not math.isfinite(pair['lane']) or not isinstance(pair.get('uncertainty'), str) or not pair['uncertainty'].strip() or not isinstance(pair.get('review'), str) or not pair['review'].strip():
                    raise ValueError(f'Critical pair {number} lacks pose, uncertainty or actual review')
                critical.append({**pair, 'reference': row['canonical_path'], 'relative_seconds': int(row['seconds_after_first_supplied_frame']),
                                 'alignment': 'approximate', 'review_status': 'reviewed', 'sampled': number in {e['frame'] for e in entries}})
        except (ValueError, KeyError, OSError, TypeError, json.JSONDecodeError) as error:
            errors.append(f'Invalid critical-pair manifest: {error}')
            critical = []
    for pair in critical:
        for entry in entries:
            if entry['frame'] == pair['expanded_frame']:
                entry.update(alignment='approximate', game_capture=pair['capture'], review='reviewed')
    out.mkdir(parents=True, exist_ok=True)
    hashed_inputs = [REFS / 'frame-index-expanded.csv', REFS / 'frame-alignment.csv', Path(__file__).resolve()]
    if alignment_path.is_file():
        hashed_inputs.append(alignment_path)
    source_hashes = {str(path.relative_to(ROOT) if ROOT in path.parents else path): hashlib.sha256(path.read_bytes()).hexdigest() for path in hashed_inputs}
    mapped = sum(entry['alignment'] != 'unmapped' for entry in entries)
    captured = sum(entry['game_capture'] is not None for entry in entries)
    reviewed = sum(entry['review'] == 'reviewed' for entry in entries)
    report = {'status': 'incomplete', 'interval_seconds': args.interval, 'source_hashes': source_hashes,
              'candidate_count': len(entries), 'mapped_count': mapped, 'captured_count': captured,
              'reviewed_count': reviewed, 'unmapped_count': len(entries)-mapped, 'errors': errors,
              'critical_pair_count': len(critical), 'critical_pairs': critical,
              'limitations': ['Most fixed-interval candidates remain unmapped and unreviewed.', 'Critical pairs are approximate evidence, not complete alignment, continuous-drive streaming or route acceptance.'],
              'candidates': entries}
    (out / 'report.json').write_text(json.dumps(report, indent=2) + '\n', encoding='utf-8')
    cards = []
    for entry in entries:
        target = os.path.relpath(REFS / entry['reference'], out)
        url = html.escape(target, quote=True)
        cards.append(f'<figure><a href="{url}"><img loading="lazy" src="{url}" alt="Reference frame {entry["frame"]}"></a><figcaption>Frame {entry["frame"]}, {entry["relative_seconds"]} s: {entry["alignment"]}, {entry["review"]}</figcaption></figure>')
    pairs = []
    for pair in critical:
        ref = html.escape(os.path.relpath(REFS / pair['reference'], out), quote=True)
        game = html.escape(os.path.relpath(ROOT / pair['capture'], out), quote=True)
        pairs.append(f'<figure><a href="{ref}"><img loading="lazy" src="{ref}" alt="Reference frame {pair["expanded_frame"]}"></a><a href="{game}"><img loading="lazy" src="{game}" alt="Approximate game view"></a><figcaption>Frame {pair["expanded_frame"]}: {html.escape(pair["uncertainty"])}. {html.escape(pair["review"])}</figcaption></figure>')
    page = '<!doctype html><html lang="en"><meta charset="utf-8"><title>Route reference candidates</title><style>body{font:16px sans-serif}main{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:1em}figure{margin:0}img{width:100%}</style><h1>Sampled reference candidates</h1>' + f'<p>{mapped} of {len(entries)} fixed-interval samples have approximate matches and {reviewed} were reviewed; critical pairs appear below.</p><main>' + ''.join(cards) + '</main><h2>Approximate critical pairs</h2><main>' + ''.join(pairs) + '</main></html>'
    (out / 'index.html').write_text(page, encoding='utf-8')
    print(f'INCOMPLETE: {len(entries)} sampled candidates, {mapped} mapped, {reviewed} reviewed; {len(critical)} critical pairs; {len(errors)} source errors. Report: {out / "report.json"}')
    return 1

if __name__ == '__main__':
    raise SystemExit(main())
