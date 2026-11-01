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
                result = subprocess.run([sys.executable, str(ROOT / 'scripts/route-qa.py'), '--interval', str(interval), '--out', tmp], cwd=ROOT, capture_output=True, text=True)
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
                self.assertIn('No game comparisons have been performed', (Path(tmp) / 'index.html').read_text())

if __name__ == '__main__':
    unittest.main()
