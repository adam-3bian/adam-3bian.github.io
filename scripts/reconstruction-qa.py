#!/usr/bin/env python3
"""One entry point for reconstruction evidence; open acceptance gates return 1."""
import argparse
import hashlib
import http.server
import json
import subprocess
import threading
from datetime import datetime, timezone
from functools import partial
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--capture', action='store_true', help='Rebuild static/QA sites and recapture all 44 station views; requires Playwright/Chromium')
    parser.add_argument('--geometry', action='store_true', help='Rerun the full CPU mesh audit (about 20 minutes)')
    args = parser.parse_args()
    if subprocess.check_output(['git', 'branch', '--show-current'], cwd=ROOT, text=True).strip() != 'railway':
        raise SystemExit('Run this workflow exclusively on the railway branch')
    checks = []
    output = ROOT / 'docs/reports/reconstruction-qa.json'
    provenance = {'generatedUTC': datetime.now(timezone.utc).isoformat(),
                  'scriptSHA256': hashlib.sha256(Path(__file__).read_bytes()).hexdigest()}

    def checkpoint(status):
        output.write_text(json.dumps({**provenance, 'status': status, 'commands': checks,
                                      'accepted': False}, indent=2) + '\n')

    # A failed/interrupted rerun must not leave an older successful-looking file.
    checkpoint('running; acceptance not established')

    def run(command, allowed=(0,)):
        print('RUN', ' '.join(command), flush=True)
        result = subprocess.run(command, cwd=ROOT)
        checks.append({'command': command, 'exit_code': result.returncode})
        checkpoint('running; acceptance not established')
        if result.returncode not in allowed:
            checkpoint('failed command; acceptance not established')
            raise RuntimeError('Failed: ' + ' '.join(command))

    def read(path):
        return json.loads((ROOT / path).read_text())

    def sha(path):
        return hashlib.sha256((ROOT / path).read_bytes()).hexdigest()

    if args.capture:
        run(['npm', 'run', 'build:site'])
        run(['npm', 'run', 'build:qa'])
        handler = partial(http.server.SimpleHTTPRequestHandler, directory=str(ROOT / 'work/qa-dist'))
        with http.server.ThreadingHTTPServer(('127.0.0.1', 4174), handler) as server:
            thread = threading.Thread(target=server.serve_forever, daemon=True)
            thread.start()
            try:
                run(['python', 'scripts/reconstruction-browser-qa.py'])
            finally:
                server.shutdown()
                thread.join()
    if args.geometry:
        run(['npm', 'run', 'audit:geometry'])
    run(['npm', 'run', 'verify:site'])
    run(['python', '-m', 'unittest', 'discover', '-s', 'tests', '-p', '*_test.py'])
    run(['python', 'scripts/audit-source-maps.py'])
    run(['python', 'scripts/audit-source-sites.py'])
    run(['node', 'scripts/build-station-review.js'])
    run(['python', 'scripts/build-site-register.py'])
    # An incomplete comparison is an expected open gate, never a success.
    run(['node', 'scripts/route-qa.js', '--interval', '5', '--out', 'docs/reports/reference-comparison'], allowed=(0, 1))
    manifest = sha('site/build-manifest.json')
    geometry = read('docs/reports/geometry.json')
    browser = read('docs/reports/reconstruction-browser.json')
    photo = read('docs/reports/reference-comparison/report.json')
    station = read('docs/station-review.json')
    stale = []
    for label, hashes in [('geometry', geometry['sourceSnapshot']['hashes']), ('browser', browser['sourceHashes'])]:
        for path, expected in hashes.items():
            if not (ROOT / path).is_file() or sha(path) != expected:
                stale.append({'report': label, 'path': path})
    for capture in browser['captures']:
        if sha(capture['file']) != capture['sha256']:
            stale.append({'report': 'browser capture', 'path': capture['file']})
    if browser['manifestSHA256'] != manifest:
        stale.append({'report': 'browser', 'path': 'site/build-manifest.json'})
    open_gates = [
        'Reference matching: 600 regular five-second frames remain unmapped/unreviewed; supplementary station anchors are approximate.',
        'Six stations lack securely assigned photos. No station/civil site has complete geometric and photographic acceptance.',
        'Visible obstruction candidates at ROW/SGB/SMA/BMO/WMR/DDG and generic station architecture/surroundings need source-owned reconstruction.',
        'Crossing road bindings/component orientation, complete layered rules, full support/volume/LOD coverage and source semantic classes remain incomplete.',
        'Road graph/trip lifecycle still produces long stops; source-exact trackwork, signalling and remaining assets/operations are incomplete.',
        'Continuous-drive readiness/error/revisit checks, two-hour browser/GPU soak, 1080p point readability, RTX 3060 benchmark and three local reviews remain open.'
    ]
    report = {**provenance, 'status': 'incomplete', 'scope': 'Commands executed here plus hash verification of separately recorded current-build geometry/browser evidence. This does not perform image judgement or close the complete game brief.',
              'manifestSHA256': manifest, 'commands': checks, 'stale_evidence': stale,
              'reference_source_errors': photo['errors'],
              'reused_evidence': {'geometry_tiles': geometry['coverage']['tilesBuilt'],
                                  'geometry_hard_failures': geometry['hardFailures'],
                                  'geometry_mandatory_failures': geometry['mandatoryGeometryFailures'],
                                  'browser_views': len(browser['captures']), 'browser_errors': browser['errors'],
                                  'station_photo_reviews': station['stations_with_photographic_review'],
                                  'regular_photo_reviews': photo['reviewed_count'], 'supplementary_pairs': photo['critical_pair_count']},
              'open_gates': open_gates, 'accepted': False}
    (ROOT / 'docs/reports/reconstruction-qa.json').write_text(json.dumps(report, indent=2) + '\n')
    print(json.dumps(report, indent=2))
    return 1


if __name__ == '__main__':
    raise SystemExit(main())
