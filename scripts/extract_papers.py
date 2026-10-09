#!/usr/bin/env python3
"""Extract real, independently described papers; never invent abstracts or affiliations."""
import hashlib,json,re,sys,subprocess,unicodedata
from pathlib import Path
import yaml
from bs4 import BeautifulSoup
from capture import ROOT,write_csv
from convert_batch import Converter,signature,clean_main
url='https://cheri-alliance.github.io/discover/resources/academic-papers/'
row=next(r for r in json.loads((ROOT/'reports/capture-index.json').read_text())['records'] if r['url']==url)
raw=(ROOT/row['snapshot_path']).read_bytes();assert hashlib.sha256(raw).hexdigest()==row['sha256']
main,_=clean_main(BeautifulSoup(raw,'html.parser'),row.get('final_url',url))
assets=json.loads((ROOT/'reports/asset-index.json').read_text());records={};checks=[]
folder=ROOT/'_papers';folder.mkdir(exist_ok=True)
for number,item in enumerate(main.select('li.resource-list__item'),1):
 heading=item.select_one('h3 a[href]');assert heading,'Paper lacks explicit source title/link'
 title=heading.get_text(' ',strip=True);publication=heading['href']
 slug=re.sub(r'[^a-z0-9]+','-',unicodedata.normalize('NFKD',title).encode('ascii','ignore').decode().lower()).strip('-')[:85].rstrip('-')+'-'+hashlib.sha256(publication.encode()).hexdigest()[:8]
 fragment=BeautifulSoup(str(item),'html.parser');fragment.li.name='section';original=signature(fragment);mapping={}
 for link in fragment.select('a[href]'):
  a=assets.get(link['href'])
  if a and a.get('download_status')=='downloaded':
   original_url=link['href'];link['href']='/'+a['local_path'];mapping[link['href']]=original_url
 md=Converter(heading_style='ATX',bullets='-',escape_misc=True,autolinks=False).convert_soup(fragment).strip()
 rendered=subprocess.run([str(ROOT/'scripts/ruby.sh'),str(ROOT/'scripts/render.rb')],input=md,text=True,capture_output=True,check=True).stdout
 actual=signature(BeautifulSoup(rendered,'html.parser'),mapping);assert original==actual,title
 path=folder/(slug+'.md');route='/papers/'+slug+'/'
 front={'title':title,'layout':'source','permalink':route,'source_url':publication}
 path.write_text('---\n'+yaml.safe_dump(front,sort_keys=False,allow_unicode=True)+'---\n\n'+md+'\n')
 records[slug]={'title':title,'publication_url':publication,'source_catalogue':url,'source_selector':f'li.resource-list__item:nth-of-type({number})','source_snapshot':row['snapshot_path'],'source_sha256':row['sha256'],'local_path':str(path.relative_to(ROOT)),'local_route':route,'asset_mapping':mapping}
 checks.append({'slug':slug,'source_url':url,'publication_url':publication,'local_path':str(path.relative_to(ROOT)),'local_route':route,'source_signature':original,'asset_mapping':mapping,'status':'passed','scope':'Complete published catalogue entry; publication PDF retained when available; external article body not substituted or invented'})
(ROOT/'_data/papers.yml').write_text(yaml.safe_dump(records,sort_keys=False,allow_unicode=True))
(ROOT/'reports/paper-validation.json').write_text(json.dumps(checks,indent=2,ensure_ascii=False)+'\n')
print(f'{len(checks)} complete source-backed paper entries validated and saved.')
