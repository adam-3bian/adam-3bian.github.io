import json,sys,tempfile,unittest
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'scripts'))
from state import save_capture,update_conversion
class StateTests(unittest.TestCase):
 def fixture(self,root,rows):
  (root/'reports').mkdir();(root/'reports/capture-index.json').write_text(json.dumps({'records':rows}))
 def test_finished_conversion_survives_old_crawl_state(self):
  with tempfile.TemporaryDirectory() as d:
   root=Path(d);self.fixture(root,[{'url':'a','sha256':'same','conversion_status':'converted','local_path':'a.md'}])
   result=save_capture({'records':[{'url':'a','sha256':'same','conversion_status':'unprocessed'},{'url':'b','sha256':'new'}]},root)
   self.assertEqual(result['records'][0]['local_path'],'a.md');self.assertEqual(len(result['records']),2)
 def test_new_discovery_survives_conversion_commit(self):
  with tempfile.TemporaryDirectory() as d:
   root=Path(d);self.fixture(root,[{'url':'a','sha256':'same'},{'url':'b','sha256':'new'}])
   result=update_conversion({'a':{'expected_sha256':'same','conversion_status':'converted'}},root)
   self.assertEqual(len(result['records']),2)
 def test_changed_source_rejects_old_validation(self):
  with tempfile.TemporaryDirectory() as d:
   root=Path(d);self.fixture(root,[{'url':'a','sha256':'new'}])
   with self.assertRaisesRegex(ValueError,'Source changed'):
    update_conversion({'a':{'expected_sha256':'old','conversion_status':'converted'}},root)
