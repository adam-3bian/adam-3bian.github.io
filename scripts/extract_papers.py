#!/usr/bin/env python3
"""Extract real, independently described papers; never invent abstracts or affiliations."""
import hashlib,json,re,sys,subprocess,unicodedata
from pathlib import Path
import yaml
from bs4 import BeautifulSoup
from capture import ROOT,write_csv
from convert_batch import Converter,signature,clean_main
from site_model import document,canonical_url,canonical_signature,named_authors
class FlowList(list):pass
class Dumper(yaml.SafeDumper):pass
Dumper.add_representer(FlowList,lambda d,value:d.represent_sequence('tag:yaml.org,2002:seq',value,flow_style=True))
url='https://cheri-alliance.github.io/discover/resources/academic-papers/'
row=next(r for r in json.loads((ROOT/'reports/capture-index.json').read_text())['records'] if r['url']==url)
raw=(ROOT/row['snapshot_path']).read_bytes();assert hashlib.sha256(raw).hexdigest()==row['sha256']
main,_=clean_main(BeautifulSoup(raw,'html5lib'),row.get('final_url',url))
assets=json.loads((ROOT/'reports/asset-index.json').read_text());records={};checks=[]
registry_path=ROOT/'reports/paper-sources.json'
previous=json.loads(registry_path.read_text()) if registry_path.exists() else {}
by_publication={paper['publication_url']:paper for paper in previous.values()}
routes=json.loads((ROOT/'reports/route-map.json').read_text()) if (ROOT/'reports/route-map.json').exists() else {}
folder=ROOT/'_papers';folder.mkdir(exist_ok=True)
for number,item in enumerate(main.select('li.resource-list__item'),1):
 heading=item.select_one('h3 a[href]');assert heading,'Paper lacks explicit source title/link'
 title=heading.get_text(' ',strip=True);publication=heading['href']
 prior=by_publication.get(publication)
 slug=Path(prior['local_path']).stem if prior else re.sub(r'[^a-z0-9]+','-',unicodedata.normalize('NFKD',title).encode('ascii','ignore').decode().lower()).strip('-')[:85].rstrip('-')
 path=folder/(slug+'.md');route='/papers/'+slug+'/'
 if not prior and path.exists():raise ValueError('Distinct publication needs an explicit canonical filename: '+slug)
 fragment=BeautifulSoup(str(item),'html.parser');fragment.li.name='section';original=signature(fragment);mapping={}
 for link in fragment.select('a[href]'):
  a=assets.get(link['href'])
  if a and a.get('download_status')=='downloaded':
   original_url=link['href'];link['href']='/'+a['local_path'];mapping[link['href']]=original_url
 md=Converter(heading_style='ATX',bullets='-',escape_misc=True,autolinks=False).convert_soup(fragment).strip()
 md=re.sub(r'(\]\()([^\n)]+)(\))',lambda m:m[1]+canonical_url(m[2],routes)+m[3],md)
 rendered=subprocess.run([str(ROOT/'scripts/ruby.sh'),str(ROOT/'scripts/render.rb')],input=md,text=True,capture_output=True,check=True).stdout
 actual=json.loads(json.dumps(signature(BeautifulSoup(rendered,'html.parser'),mapping)));assert canonical_signature(original,routes)==actual,title
 front=document(str(path.relative_to(ROOT)))[0] if prior else {'title':title}
 for key in ('layout','source_url','permalink','slug'):front.pop(key,None)
 if isinstance(front.get('authors'),list):front['authors']=FlowList(front['authors'])
 path.write_text('---\n'+yaml.dump(front,Dumper=Dumper,sort_keys=False,allow_unicode=True,width=110)+'---\n\n'+md+'\n')
 records[slug]={'title':title,'publication_url':publication,'source_catalogue':url,'source_selector':f'li.resource-list__item:nth-of-type({number})','source_snapshot':row['snapshot_path'],'source_sha256':row['sha256'],'local_path':str(path.relative_to(ROOT)),'local_route':route,'asset_mapping':mapping}
 citation=next(p for p in original['paragraphs'] if re.search(r'\. (ACM|IEEE|Communications)',p))
 checks.append({'slug':slug,'source_url':url,'publication_url':publication,'local_path':str(path.relative_to(ROOT)),'local_route':route,'source_signature':original,'named_authors':named_authors(citation),'unnamed_contributors_retained':'and others' in citation,'asset_mapping':mapping,'status':'passed','scope':'Complete published catalogue entry; publication PDF retained when available; external article body not substituted or invented'})
registry_path.write_text(json.dumps(records,indent=2,ensure_ascii=False)+'\n')
(ROOT/'reports/paper-validation.json').write_text(json.dumps(checks,indent=2,ensure_ascii=False)+'\n')
print(f'{len(checks)} complete source-backed paper entries validated and saved.')
