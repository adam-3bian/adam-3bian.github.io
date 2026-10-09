import sys, unittest
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'scripts'))
from bs4 import BeautifulSoup
from convert_batch import signature

class FidelityRegressionTests(unittest.TestCase):
    def test_lost_article_paragraph_is_detected(self):
        source=signature(BeautifulSoup('<p>Opening excerpt.</p><p>Full article evidence.</p>','html.parser'))
        truncated=signature(BeautifulSoup('<p>Opening excerpt.</p>','html.parser'))
        self.assertNotEqual(source['text'],truncated['text'])
        self.assertNotEqual(source['paragraphs'],truncated['paragraphs'])
    def test_changed_link_destination_is_detected(self):
        source=signature(BeautifulSoup('<a href="https://example.org/paper.pdf">Paper</a>','html.parser'))
        changed=signature(BeautifulSoup('<a href="https://example.org/excerpt">Paper</a>','html.parser'))
        self.assertEqual(source['text'],changed['text'])
        self.assertNotEqual(source['links'],changed['links'])
    def test_reordered_cells_are_detected(self):
        source=signature(BeautifulSoup('<table><tr><td>First</td><td>Second</td></tr></table>','html.parser'))
        reordered=signature(BeautifulSoup('<table><tr><td>Second</td><td>First</td></tr></table>','html.parser'))
        self.assertNotEqual(source['tables'],reordered['tables'])

if __name__=='__main__':unittest.main()
