"""A previous image judgement must not silently approve another build/image."""
import hashlib
import json
import shutil
import subprocess
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


class StationReviewEvidence(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.root = Path(self.temp.name)
        for directory in ['scripts', 'site', 'docs/reports', 'docs/captures', 'references/frames']:
            (self.root / directory).mkdir(parents=True)
        shutil.copyfile(ROOT / 'scripts/build-station-review.py', self.root / 'scripts/build-station-review.py')
        self.capture = 'docs/captures/kid.png'
        (self.root / self.capture).write_bytes(b'captured-game-image')
        (self.root / 'references/frames/kidderminster2dorridge0027.jpg').write_bytes(b'original-source-image')
        (self.root / 'site/build-manifest.json').write_text('{}')
        self.build = hashlib.sha256(b'{}').hexdigest()
        self.capture_hash = hashlib.sha256(b'captured-game-image').hexdigest()
        self.write('docs/reports/reconstruction-browser.json', {
            'manifestSHA256': self.build, 'sourceHashes': {},
            'captures': [{'station': 'KID', 'direction': 1, 'file': self.capture, 'sha256': self.capture_hash}]})
        self.write('references/location-index.json', {
            'records': [], 'stations': [{'id': 'KID', 'name': 'Kidderminster', 'map': 'map.svg', 'map_focus': []}]})
        self.notes = {'manifestSHA256': self.build, 'captureSHA256': {self.capture: self.capture_hash},
                      'reviews': {'KID': 'Inspected; canopy and access remain inaccurate.'}}
        self.write('docs/station-review-notes.json', self.notes)

    def tearDown(self):
        self.temp.cleanup()

    def write(self, path, data):
        (self.root / path).write_text(json.dumps(data))

    def run_review(self):
        return subprocess.run(['python', 'scripts/build-station-review.py'], cwd=self.root, capture_output=True, text=True)

    def test_matching_build_and_images_retain_actual_review(self):
        result = self.run_review()
        self.assertEqual(result.returncode, 0, result.stderr)
        report = json.loads((self.root / 'docs/station-review.json').read_text())
        self.assertEqual(report['stations_with_photographic_review'], 1)
        self.assertEqual(report['accepted'], 0)

    def test_notes_from_another_build_are_not_inherited(self):
        self.notes['manifestSHA256'] = 'another-build'
        self.write('docs/station-review-notes.json', self.notes)
        result = self.run_review()
        self.assertEqual(result.returncode, 0, result.stderr)
        report = json.loads((self.root / 'docs/station-review.json').read_text())
        self.assertEqual(report['stations_with_photographic_review'], 0)
        self.assertEqual(report['stations'][0]['review_status'], 'unreviewed')

    def test_changed_image_bytes_fail_instead_of_reusing_review(self):
        (self.root / self.capture).write_bytes(b'a-different-scene')
        result = self.run_review()
        self.assertNotEqual(result.returncode, 0)
        self.assertIn('Capture bytes changed', result.stderr)
        self.assertFalse((self.root / 'docs/station-review.json').exists())


if __name__ == '__main__':
    unittest.main()
