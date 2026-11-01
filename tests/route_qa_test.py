import csv
import hashlib
import json
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]

class RouteQATest(unittest.TestCase):
    def test_sampling_never_claims_unperformed_reviews(self):
        for interval, count in ((5, 600), (10, 300)):
            with self.subTest(interval=interval), tempfile.TemporaryDirectory() as tmp:
                result = subprocess.run([sys.executable, str(ROOT / 'scripts/route-qa.py'), '--interval', str(interval), '--out', tmp, '--alignment', str(Path(tmp) / 'missing.json')], cwd=ROOT, capture_output=True, text=True)
                self.assertEqual(result.returncode, 1, result.stderr)
                report = json.loads((Path(tmp) / 'report.json').read_text())
                self.assertEqual(report['status'], 'incomplete')
                self.assertEqual(report['candidate_count'], count)
                self.assertEqual(report['unmapped_count'], count)
                self.assertEqual(report['mapped_count'], 0)
                self.assertEqual(report['captured_count'], 0)
                self.assertEqual(report['reviewed_count'], 0)
                self.assertEqual(report['errors'], [])
                self.assertTrue(all(x['alignment'] == 'unmapped' and x['review'] == 'unreviewed' for x in report['candidates']))
                self.assertIn('Sampled reference candidates', (Path(tmp) / 'index.html').read_text())

    def test_critical_pair_is_linked_only_with_valid_source_build_and_capture(self):
        (ROOT / 'work').mkdir(exist_ok=True)
        with tempfile.TemporaryDirectory(dir=ROOT / 'work') as tmp:
            tmp = Path(tmp)
            capture = tmp / 'capture.png'
            capture.write_bytes(b'\x89PNG\r\n\x1a\nfixture-capture')
            with (ROOT / 'references/frame-index-expanded.csv').open(newline='', encoding='utf-8') as source:
                first = next(csv.DictReader(source))
            digest = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()
            manifest = {'version': 1, 'build_manifest_sha256': digest(ROOT / 'site/build-manifest.json'), 'critical_pairs': [{
                'expanded_frame': 1, 'reference_sha256': first['sha256'], 'capture': str(capture.relative_to(ROOT)),
                'capture_sha256': digest(capture), 'chainage_m': 123, 'lane': 4.2, 'direction': 1,
                'uncertainty': 'fixture only', 'review': 'fixture review'}]}
            alignment = tmp / 'alignment.json';alignment.write_text(json.dumps(manifest))
            cmd = [sys.executable, str(ROOT / 'scripts/route-qa.py'), '--interval', '5', '--out', str(tmp / 'out'), '--alignment', str(alignment)]
            self.assertEqual(subprocess.run(cmd, cwd=ROOT, capture_output=True).returncode, 1)
            report = json.loads((tmp / 'out/report.json').read_text())
            self.assertEqual((report['mapped_count'], report['captured_count'], report['reviewed_count'], report['critical_pair_count']), (1, 1, 1, 1))
            self.assertEqual(report['unmapped_count'], 599)
            self.assertEqual(report['status'], 'incomplete')
            self.assertIn('fixture review', (tmp / 'out/index.html').read_text())
            capture.write_bytes(b'changed')
            self.assertEqual(subprocess.run(cmd, cwd=ROOT, capture_output=True).returncode, 1)
            report = json.loads((tmp / 'out/report.json').read_text())
            self.assertEqual((report['mapped_count'], report['critical_pair_count']), (0, 0))
            self.assertTrue(any('capture' in error for error in report['errors']))
            capture.write_bytes(b'\x89PNG\r\n\x1a\nfixture-capture')
            manifest['build_manifest_sha256'] = '0' * 64
            alignment.write_text(json.dumps(manifest))
            self.assertEqual(subprocess.run(cmd, cwd=ROOT, capture_output=True).returncode, 1)
            report = json.loads((tmp / 'out/report.json').read_text())
            self.assertEqual((report['mapped_count'], report['critical_pair_count']), (0, 0))
            self.assertTrue(any('build hash' in error for error in report['errors']))

if __name__ == '__main__':
    unittest.main()
