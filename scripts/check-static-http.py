#!/usr/bin/env python3
"""Check every static-site manifest entry over HTTP at root and nested paths."""
import hashlib
import json
import tempfile
import threading
from datetime import datetime, timezone
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import quote
from urllib.request import urlopen

ROOT = Path(__file__).resolve().parents[1]
SITE = ROOT / 'site'
MANIFEST = SITE / 'build-manifest.json'
REPORT = ROOT / 'docs/reports/static-http-acceptance.json'

class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass

def main():
    manifest_bytes = MANIFEST.read_bytes()
    manifest = json.loads(manifest_bytes)
    results = {}
    (ROOT / 'work').mkdir(exist_ok=True)
    with tempfile.TemporaryDirectory(dir=ROOT / 'work') as temp:
        base = Path(temp)
        (base / 'nested').mkdir()
        (base / 'nested' / 'railway').symlink_to(SITE, target_is_directory=True)
        for label, directory, prefix in (('root', SITE, ''), ('nested/railway', base, 'nested/railway/')):
            server = ThreadingHTTPServer(('127.0.0.1', 0), partial(QuietHandler, directory=str(directory)))
            threading.Thread(target=server.serve_forever, daemon=True).start()
            failures = []
            try:
                for path, expected in manifest['siteFiles'].items():
                    try:
                        url = f'http://127.0.0.1:{server.server_port}/' + prefix + quote(path.removeprefix('site/'))
                        with urlopen(url, timeout=30) as response:
                            digest = hashlib.sha256(response.read()).hexdigest()
                        if digest != expected:
                            failures.append({'path': path, 'reason': 'hash mismatch'})
                    except Exception as error:
                        failures.append({'path': path, 'reason': str(error)})
                results[label] = {'checked': len(manifest['siteFiles']), 'failures': failures}
            finally:
                server.shutdown()
                server.server_close()
    report = {'generatedUTC': datetime.now(timezone.utc).isoformat(),
              'manifestSHA256': hashlib.sha256(manifest_bytes).hexdigest(),
              'scriptSHA256': hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),
              'scope': 'HTTP retrieval and hashes only; not a browser or external-request isolation test',
              'results': results}
    REPORT.write_text(json.dumps(report, indent=2) + '\n')
    print(json.dumps(report, indent=2))
    return int(any(item['failures'] for item in results.values()))

if __name__ == '__main__':
    raise SystemExit(main())
