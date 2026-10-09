import hashlib, tempfile, time, unittest, sys
from pathlib import Path
from unittest.mock import patch
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'scripts'))
import capture

class CaptureResumeTests(unittest.TestCase):
    def fixture(self,root,corrupted=False):
        (root/'reports').mkdir()
        snapshot=root/'sources/cheri-alliance.github.io/page.html';snapshot.parent.mkdir(parents=True)
        body=b'<html><title>Source evidence</title><a href="/next/">Next page</a></html>'
        snapshot.write_bytes(body+b'changed' if corrupted else body)
        url='https://cheri-alliance.github.io/'
        return {url:{'url':url,'source_site':'cheri-alliance.github.io','snapshot_path':str(snapshot.relative_to(root)),
                     'sha256':hashlib.sha256(body).hexdigest(),'http_content_type':'text/html','fetch_status':'fetched',
                     'conversion_status':'converted'}}
    def robots(self,url):
        self.assertEqual(url,'https://cheri-alliance.github.io/robots.txt')
        return 200,url,'text/plain',b'User-agent: *\nDisallow: /next/\nDisallow: /sitemap\nDisallow: /wp-sitemap'
    def test_resume_uses_evidence_and_preserves_conversion(self):
        with tempfile.TemporaryDirectory() as directory:
            root=Path(directory);records=self.fixture(root)
            with patch.object(capture,'ROOT',root),patch.object(capture,'request',self.robots):
                rows,summary=capture.run_site('cheri-alliance.github.io',records,1,time.monotonic()+5)
            self.assertEqual(summary['requests_this_run'],0)
            self.assertEqual(rows['https://cheri-alliance.github.io/']['conversion_status'],'converted')
            self.assertIn('https://cheri-alliance.github.io/next/',rows)
            self.assertTrue((root/'reports/checkpoint-cheri-alliance.github.io.json').exists())
    def test_tampered_evidence_prevents_resume(self):
        with tempfile.TemporaryDirectory() as directory:
            root=Path(directory);records=self.fixture(root,corrupted=True)
            with patch.object(capture,'ROOT',root),patch.object(capture,'request',self.robots):
                with self.assertRaisesRegex(ValueError,'checksum mismatch'):
                    capture.run_site('cheri-alliance.github.io',records,1,time.monotonic()+5)

if __name__=='__main__':unittest.main()

class PublicScopeTests(unittest.TestCase):
    def test_page_pagination_is_public_but_admin_is_excluded(self):
        self.assertEqual(capture.kind('https://cheri-alliance.org/news/?paged=2'),'page')
        self.assertEqual(capture.kind('https://cheri-alliance.org/wp-admin/'),'excluded')
    def test_versioned_images_remain_assets(self):
        self.assertEqual(capture.kind('https://cheri-alliance.org/photo.png?ver=2'),'asset')
    def test_known_api_failure_does_not_exclude_other_namespaces(self):
        self.assertEqual(capture.kind('https://cheri-alliance.org/wp-json/wp/v2/pages/10'),'restricted-api')
        self.assertEqual(capture.kind('https://cheri-alliance.org/wp-json/example/v1/public'),'page')

class DiscoveryPriorityTests(unittest.TestCase):
    fixture=CaptureResumeTests.fixture
    def test_cached_links_are_discovered_before_api_requests(self):
        with tempfile.TemporaryDirectory() as directory:
            root=Path(directory);records=self.fixture(root)
            api='https://cheri-alliance.github.io/wp-json/example/v1/public'
            records[api]={'url':api,'source_site':'cheri-alliance.github.io','fetch_status':'discovered'}
            requests=[]
            def fetch(url):
                if url.endswith('/robots.txt'):return 200,url,'text/plain',b'User-agent: *\nDisallow: /sitemap\nDisallow: /wp-sitemap'
                requests.append(url)
                return 200,url,'text/html',b'<main>Complete public page</main>'
            with patch.object(capture,'ROOT',root),patch.object(capture,'request',fetch),patch.object(capture.time,'sleep'):
                capture.run_site('cheri-alliance.github.io',records,1,time.monotonic()+5)
            self.assertEqual(requests,['https://cheri-alliance.github.io/next/'])

class CheckpointBaselineTests(unittest.TestCase):
    def test_conversion_file_mtime_does_not_hide_a_newer_capture(self):
        with tempfile.TemporaryDirectory() as directory:
            path=Path(directory)/'checkpoint.json';path.write_text('[]')
            self.assertTrue(capture.checkpoint_is_newer(path,{'run_at':'2020-01-01T00:00:00+00:00'}))
            self.assertFalse(capture.checkpoint_is_newer(path,{'run_at':'2099-01-01T00:00:00+00:00'}))

class MetadataReplayTests(unittest.TestCase):
    fixture=CaptureResumeTests.fixture
    def test_zero_budget_discovers_cached_links_without_claiming_capture(self):
        with tempfile.TemporaryDirectory() as directory:
            root=Path(directory);records=self.fixture(root)
            def robots(url):
                self.assertTrue(url.endswith('/robots.txt'))
                return 200,url,'text/plain',b'User-agent: *\nDisallow: /sitemap\nDisallow: /wp-sitemap'
            with patch.object(capture,'ROOT',root),patch.object(capture,'request',robots):
                rows,summary=capture.run_site('cheri-alliance.github.io',records,0,time.monotonic()+5)
            self.assertEqual(rows['https://cheri-alliance.github.io/next/']['fetch_status'],'discovered')
            self.assertFalse(summary['converged'])
            self.assertEqual(summary['public_html_queue_remaining'],1)
    def test_source_shortlink_is_excluded_with_positive_evidence(self):
        with tempfile.TemporaryDirectory() as directory:
            root=Path(directory);records=self.fixture(root);row=next(iter(records.values()));path=root/row['snapshot_path']
            body=path.read_bytes().replace(b'<title>',b'<link rel="shortlink" href="/?p=123"><title>')
            path.write_bytes(body);row['sha256']=hashlib.sha256(body).hexdigest()
            with patch.object(capture,'ROOT',root),patch.object(capture,'request',CaptureResumeTests.robots.__get__(self)):
                rows,summary=capture.run_site('cheri-alliance.github.io',records,0,time.monotonic()+5)
            alias=rows['https://cheri-alliance.github.io/?p=123']
            self.assertEqual(alias['declared_alias_target'],'https://cheri-alliance.github.io/')
            self.assertEqual(alias['fetch_status'],'excluded-with-reason')
            self.assertNotIn('snapshot_path',alias)
