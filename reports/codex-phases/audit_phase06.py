#!/usr/bin/env python3
"""Phase 6 native source/shell audit: BEFORE SITE PROJECT."""
import ast
import hashlib
import json
import re
import subprocess
import sys
from pathlib import Path
from urllib.parse import unquote,urlsplit
import xml.etree.ElementTree as ET
import yaml
from bs4 import BeautifulSoup
ROOT=Path(__file__).resolve().parents[2];OUT=Path(__file__).with_name('phase-06-evidence')
BASELINE='f968fad0257c0b4fc5b71299aefb3b300480abeb'
BEFORE,SITE,PROJECT=[Path(p).resolve() for p in sys.argv[1:]]
sys.path.insert(0,str(ROOT/'scripts'))
from convert_batch import signature
old=ast.parse(Path(__file__).with_name('audit_phase04.py').read_text())
exec(compile(ast.Module(body=[n for n in old.body if isinstance(n,ast.FunctionDef) and n.name in ['links','parse','output','relationships']],type_ignores=[]),'<audit helpers>','exec'))
def digest(b):return hashlib.sha256(b).hexdigest()
manifest=json.loads((ROOT/'reports/codex-phases/phase-00-evidence/content-manifest.json').read_text())
config=yaml.safe_load((ROOT/'_config.yml').read_text());root={p:parse(p) for p in SITE.rglob('*.html')}
records=[];shell=[]
for row in manifest:
 path=row['path'];old=subprocess.check_output(['git','show',BASELINE+':'+path],cwd=ROOT);new=(ROOT/path).read_bytes();before=parse(output(BEFORE,row['route']));after=root[output(SITE,row['route'])]
 b=BeautifulSoup(str(before.select_one('[data-source-body]')),'html.parser');a=BeautifulSoup(str(after.select_one('[data-source-body]')),'html.parser')
 for n in a.select('.slider'):n.decompose()
 ids=[n['id'] for n in after.select('[id]')]
 checks={'body_unchanged':old.split(b'---',2)[2]==new.split(b'---',2)[2], 'record_unchanged_except_home':old==new or path=='pages/index.md', 'prose_signature':signature(b)==signature(a), 'relationships':relationships(before)==relationships(after), 'one_h1':len(after.select('main h1'))==1,'ids_unique':len(ids)==len(set(ids)),'anchors_retained':{n['id'] for n in before.select('[id]')}<=set(ids),'canonical':after.select_one('link[rel=canonical]')['href']=='https://adam-3bian.github.io'+row['route']}
 records.append({'path':path,**checks})
 primary=after.select('#primary-navigation > ul > li > button');groups=after.select('.footer-navigation > ul > li > .menu-group-title');social=after.select('.footer-social a')
 shell.append({'route':row['route'],'header':[n.get_text(strip=True) for n in primary]==['Discover CHERI','Adopt','Build','CHERI Alliance','News & Events'],'footer':[n.get_text(strip=True) for n in groups]==['Updates','CHERI Alliance','Legal'],'social':[n['href'] for n in social]==[n['url'] for n in config['navigation']['social']],'icons':all(n.img and n.img.get('alt') and n.img['src']==m['image']['src'] and n['target']=='_blank' and set(n.get('rel',[]))=={'noopener','noreferrer'} for n,m in zip(social,config['navigation']['social']))})
home=root[output(SITE,'/')];slides=home.select('.slide');spec=yaml.safe_load((ROOT/'pages/index.md').read_text().split('---',2)[1])['slider'];provenance=json.loads((OUT/'slide-provenance.json').read_text())
assert len(slides)==len(spec['slides'])==2 and home.body['data-theme']=='dark'
assert home.select_one('.hero')['class']==['hero','hero-large']
assert [n.get('class') for n in home.select_one('[data-source-body]').find_all(recursive=False) if n.name in ['section','article']]==[['hero','hero-large'],['slider'],['content']]
slide_checks=[]
for n,s,e in zip(slides,spec['slides'],provenance):
 source=(ROOT/e['source']).read_bytes()
 slide_checks.append({'url':s['url'],'correct':s['text'] in source.decode() and digest(source)==e['source_sha256'] and n.select_one('a.slide-link')['href']==s['url'] and n.h2.get_text()==s['title'] and n.select_one('.slide-copy p').get_text()==s['text'] and n.img['src']==s['image']['src'] and n.img['alt']==s['image']['alt'] and 'placeholders' not in n.img['src'] and output(SITE,s['url']).is_file()})
assert spec['autoplay'] and spec['interval']==5000 and len(home.select('.slider-dot'))==2
assert not slides[0].has_attr('hidden') and all(n.has_attr('hidden') and n.has_attr('inert') for n in slides[1:])
forms=[]
for name,route in [('contact','/alliance/membership/contact/'),('newsletter','/news-and-events/news-and-analysis/subscribe-newsletter/')]:
 s=root[output(SITE,route)];panel=s.select_one('.form-panel');data=yaml.safe_load((ROOT/'_data/forms.yml').read_text())[name]
 forms.append({'route':route,'correct':len(s.select('.form-panel'))==1 and not panel.select('form,[type=submit]') and panel.select_one('button').has_attr('disabled') and data['demo'] in panel.get_text() and data['external_url'] in [n['href'] for n in panel.select('a')] and all(panel.find('label',attrs={'for':n['id']}) for n in panel.select('input,select,textarea'))})
assets=[]
for p in subprocess.check_output(['git','ls-tree','-r','--name-only',BASELINE,'assets','favicon.ico'],cwd=ROOT).decode().splitlines():
 old=subprocess.check_output(['git','show',BASELINE+':'+p],cwd=ROOT);new=(ROOT/p).read_bytes();same=old==new
 output_ok=(SITE/p.replace('.scss','.css')).is_file() and (PROJECT/p.replace('.scss','.css')).is_file() if p.endswith('.scss') else new==(SITE/p).read_bytes()==(PROJECT/p).read_bytes()
 assets.append({'path':p,'unchanged':same,'correct':(same or p=='assets/js/slider.js') and output_ok})
icons=[]
for name in ['slack','linkedin','mastodon','github','youtube']:
 p=ROOT/'assets/images/social'/f'{name}.svg';svg=ET.fromstring(p.read_text());icons.append({'name':name,'sha256':digest(p.read_bytes()),'correct':svg.attrib['width']==svg.attrib['height']=='24' and svg.attrib['fill']=='#f5f7f5' and svg.attrib['viewBox']=='0 0 16 16' and (SITE/p.relative_to(ROOT)).read_bytes()==p.read_bytes()})
root_links=links(SITE,root);prefix_links=links(PROJECT,{p:parse(p) for p in PROJECT.rglob('*.html')},'/cheri-preview')
result={'baseline':BASELINE,'records':records,'shell':shell,'slides':slide_checks,'forms':forms,'assets':assets,'icons':icons,'root_links':root_links,'project_links':prefix_links,'html_outputs':len(root),'sitemap_unchanged':(BEFORE/'sitemap.xml').read_bytes()==(SITE/'sitemap.xml').read_bytes()}
(OUT/'audit.json').write_text(json.dumps(result,indent=2)+'\n')
assert all(all(v for k,v in r.items() if k!='path') for r in records)
assert all(all(v for k,v in r.items() if k!='route') for r in shell)
assert all(r['correct'] for r in slide_checks+forms+assets+icons)
assert result['sitemap_unchanged'] and not any(e['component'] for e in root_links['errors']+prefix_links['errors'])
print(f"{len(records)} sources/prose/relationships, {len(shell)} shells, {len(slide_checks)} slides, {len(forms)} forms, {len(icons)} icons pass")
print(f"Root references: {root_links['local_references']}; root errors: {len(root_links['errors'])}; prefix errors: {len(prefix_links['errors'])}")
