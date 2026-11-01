import csv,hashlib,json,unittest
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
class ReferenceLocationTest(unittest.TestCase):
 def test_all_named_records_preserve_bytes_and_original_sequence_correspondence(self):
  refs=ROOT/'references';index=json.loads((refs/'location-index.json').read_text())
  with (refs/'frame-index.csv').open() as source:originals={int(r['frame_number']):r for r in csv.DictReader(source)}
  self.assertEqual(len(index['records']),3000);self.assertEqual(len({r['expanded_frame'] for r in index['records']}),3000);exact=0
  for r in index['records']:
   named=(refs/r['named_path']).resolve();canonical=(refs/r['canonical_path']).resolve()
   self.assertIn((refs/'by-location').resolve(),named.parents);self.assertEqual(hashlib.sha256(named.read_bytes()).hexdigest(),r['sha256']);self.assertEqual(hashlib.sha256(canonical.read_bytes()).hexdigest(),r['sha256'])
   if r['original_frame'] is not None:
    exact+=1;self.assertEqual(r['expanded_frame'],5*r['original_frame']-2);self.assertEqual(originals[r['original_frame']]['sha256'],r['sha256'])
   self.assertEqual(r['precise_route_mapping'],'unmapped')
  self.assertEqual(exact,584);self.assertEqual(len(index['stations']),22);self.assertTrue(any(s['source_gap'] for s in index['stations']))
 def test_original_uploaded_inventory_is_unchanged(self):
  refs=ROOT/'references';inventory=json.loads((refs/'inventory.json').read_text())['files'];self.assertEqual(len(inventory),2995)
  for record in inventory:self.assertEqual(hashlib.sha256((refs/record['path']).read_bytes()).hexdigest(),record['sha256'],record['path'])
if __name__=='__main__':unittest.main()
