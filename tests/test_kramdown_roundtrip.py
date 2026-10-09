import sys,subprocess,unittest
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'scripts'))
from bs4 import BeautifulSoup
from convert_batch import Converter,signature
ROOT=Path(__file__).resolve().parents[1]
class KramdownRoundtripTests(unittest.TestCase):
 def check_roundtrip(self,html,**options):
  source=BeautifulSoup(html,'html5lib')
  markdown=Converter(heading_style='ATX',bullets='-',escape_misc=False,**options).convert_soup(source)
  rendered=subprocess.run([str(ROOT/'scripts/ruby.sh'),str(ROOT/'scripts/render.rb')],input=markdown,text=True,capture_output=True,check=True).stdout
  self.assertEqual(signature(source),signature(BeautifulSoup(rendered,'html.parser')))
 def test_talk_separator_does_not_create_table(self):
  self.check_roundtrip('<p>CHERI Adoption study | CHERI Blossoms 2026</p>')
 def test_headerless_table_does_not_gain_empty_header(self):
  self.check_roundtrip('<table><tr><td>Role</td><td>Evidence</td></tr><tr><td>Guide</td><td>Source text</td></tr></table>')
 def test_inline_punctuation_and_nested_list_paragraph_survive(self):
  self.check_roundtrip('<ol><li><p>Communications of the ACM, <em>68(2)</em>, 2025.</p></li></ol>')
 def test_inline_image_does_not_swallow_published_download_text(self):
  self.check_roundtrip('<p><img src="icon.svg" alt="PDF"> Download the <a href="paper.pdf">complete paper</a>.</img></p>',image_classes={'icon.svg':'image-left'},inline_images={'icon.svg':True})
 def test_pipe_in_linked_list_item_stays_text(self):
  self.check_roundtrip('<ul><li><a href="video">CHERI talk | Conference 2026</a></li></ul>')
 def test_definitions_and_numeric_heading_anchor_use_markdown(self):
  self.check_roundtrip('<h2 id="3">Third section</h2><dl><dt>Role</dt><dd>Researcher</dd></dl>')
 def test_literal_html_and_liquid_in_code_are_preserved(self):
  self.check_roundtrip('<pre><code>  &lt;div&gt;{{ value }}&lt;/div&gt;\n  {% example %}\n</code></pre>')
 def test_linked_card_retains_each_label_and_destination(self):
  self.check_roundtrip('<a href="/profile/"><h3>Person</h3><p>Full description.</p><span>Read this page</span></a>')
 def test_nonbreaking_space_before_emphasis_is_not_lost(self):
  self.check_roundtrip('<p>Leaders from<strong>\u00a0NCSC</strong>, and researchers.</p>')
 def test_table_image_and_literal_pipe_are_preserved(self):
  self.check_roundtrip('<table><tr><td><img src="logo.svg" alt="Logo"></td><td>Choice A | Choice B</td></tr></table>',image_classes={'logo.svg':'image-full'})
if __name__=='__main__':unittest.main()
