#!/usr/bin/env python3
"""Independent glossary wording, ordering, term-link and anchor regression checks."""
import argparse,json
from pathlib import Path
from lxml import html
from check_spec import ROOT,document

def check(site=None,baseurl=''):
 baseline=json.loads((ROOT/'scripts/fixtures/refinement-baseline.json').read_text())
 actual=[]
 for path in sorted((ROOT/'_glossary').glob('*.md')):
  fm,body=document(path)
  assert set(fm)<={'title','anchor','link'},path
  actual.append({'title':fm['title'],'anchor':fm['anchor'],'link':fm.get('link'),'definition':body.strip()})
 assert actual==baseline['glossary'],'Glossary wording/order/anchors/destinations changed'
 if site:
  tree=html.parse(str(site/'discover/resources/glossary/index.html'));entries=tree.xpath('//*[@data-glossary-entry]')
  assert len(entries)==len(actual)
  for term,entry in zip(actual,entries):
   assert ' '.join(entry.xpath('./dd')[0].text_content().split())==' '.join(term['definition'].split()),term['title']
   assert entry.xpath('./dt')[0].get('id')==term['anchor']
   assert entry.xpath('./dt/dfn/a/@href')==([baseurl+term['link']] if term['link'] else []),term['title']
 print(json.dumps({'preserved_glossary_terms':len(actual),'rendered':bool(site)}))
if __name__=='__main__':
 p=argparse.ArgumentParser();p.add_argument('--site',type=Path);p.add_argument('--baseurl',default='');a=p.parse_args();check(a.site,a.baseurl.rstrip('/'))
