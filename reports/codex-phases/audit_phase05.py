#!/usr/bin/env python3
"""Phase 5 preservation and directory audit: BEFORE SITE PROJECT."""
import ast
import hashlib
import json
import re
import subprocess
import sys
from collections import Counter
from pathlib import Path
from urllib.parse import unquote, urlsplit
import yaml
from bs4 import BeautifulSoup, Tag
ROOT=Path(__file__).resolve().parents[2]
OUT=Path(__file__).with_name('phase-05-evidence')
BASELINE='f000ccde5c526ba573a23dcf1cc5524f469dc92c'
BEFORE,SITE,PROJECT=map(lambda p:Path(p).resolve(),sys.argv[1:])
sys.path.insert(0,str(ROOT/'scripts'))
from convert_batch import signature
# Reuse only pure audit functions; never execute another phase's report writer.
old=ast.parse(Path(__file__).with_name('audit_phase04.py').read_text())
exec(compile(ast.Module(body=[n for n in old.body if isinstance(n,ast.FunctionDef) and n.name in ['links','parse','output','relationships','metadata']],type_ignores=[]),'<audit helpers>','exec'))
def digest(b):return hashlib.sha256(b).hexdigest()
def norm(n):return ' '.join(n.stripped_strings)
def fragments(s):
 result=[]
 for title in s.select('.collection-card__title'):
  nodes=[title];n=title.previous_sibling
  while n:
   if isinstance(n,Tag) and ('collection-card__link' in n.get('class',[]) or not ('collection-card__' in ' '.join(n.get('class',[])) or (n.name=='p' and n.img))):break
   nodes.insert(0,n);n=n.previous_sibling
  n=title.next_sibling
  while n:
   nodes.append(n)
   if isinstance(n,Tag) and 'collection-card__link' in n.get('class',[]):break
   n=n.next_sibling
  result.append(nodes)
 return result
manifest=json.loads((ROOT/'reports/codex-phases/phase-00-evidence/content-manifest.json').read_text())
root={p:parse(p) for p in SITE.rglob('*.html')}
records=[];cards=[];failures=[]
for row in manifest:
 path=row['path'];old=subprocess.check_output(['git','show',BASELINE+':'+path],cwd=ROOT);new=(ROOT/path).read_bytes()
 before=parse(output(BEFORE,row['route']));after=root[output(SITE,row['route'])]
 b=BeautifulSoup(str(before.select_one('[data-source-body]')),'html.parser');a=BeautifulSoup(str(after.select_one('[data-source-body]')),'html.parser')
 originals=fragments(b);rendered=a.select('[data-source-cards] a.card')
 assert len(originals)==len(rendered),(path,len(originals),len(rendered))
 for nodes,card in zip(originals,rendered):
  source=BeautifulSoup(''.join(map(str,nodes)),'html.parser')
  urls=set(n['href'] for n in source.select('a[href]'))
  checks={'text_order':norm(source)==norm(card),'headings':[(n.name,n.get_text(),n.get('id')) for n in source.select('h2,h3,h4')]==[(n.name,n.get_text(),n.get('id')) for n in card.select('h2,h3,h4')],
   'images':[(n['src'],n.get('alt')) for n in source.select('img')]==[(n['src'],n.get('alt')) for n in card.select('img')],
   'destination':urls=={card['href']},'single_link':not card.select('a')}
  cards.append({'path':path,'url':card['href'],**checks})
  for n in nodes:n.extract()
 for n in a.select('[data-source-cards]'):n.decompose()
 # New directory cards and parent breadcrumbs are generated navigation, not prose.
 for s in [a,b]:
  for n in s.select('.index-list,.breadcrumbs'):n.decompose()
 ids=[n['id'] for n in after.select('[id]')];old_ids={n['id'] for n in before.select('[id]')}
 checks={'body_unchanged':old.split(b'---',2)[2]==new.split(b'---',2)[2],
  'prose_signature':signature(b)==signature(a),'relationships':relationships(before)==relationships(after),
  'one_h1':len(after.select('main h1'))==1,'anchors_preserved':not old_ids-set(ids),'unique_ids':len(ids)==len(set(ids)),
  'canonical':after.select_one('link[rel=canonical]')['href']=='https://adam-3bian.github.io'+row['route']}
 records.append({'path':path,'route':row['route'],**checks})
 if not all(checks.values()):failures.append({'path':path,**checks})
collections={c:{p.stem:metadata(p) for p in (ROOT/('_'+c)).glob('*.md')} for c in yaml.safe_load((ROOT/'_config.yml').read_text())['collections']}
directories=[]
for c in ['organisations','papers','hardware','software','groups','guides','policies','members']:
 selected=collections['organisations' if c=='members' else c]
 selected={id:m for id,m in selected.items() if not m.get('alternate') and not m.get('redirect_to') and (c!='members' or m.get('member'))}
 route='/alliance/leadership/members/' if c=='members' else '/'+c+'/'
 expected=['/'+('organisations' if c=='members' else c)+'/'+id+'/' for id in sorted(selected,key=lambda id:selected[id]['title'].lower())]
 s=root[output(SITE,route)];actual=[n['href'] for n in s.select('[data-collection-index] a.card')]
 directories.append({'route':route,'count':len(actual),'expected':len(expected),'correct':actual==expected})
founders=[id for id in collections['organisations'] if '<dd>Founding member</dd>' in output(SITE,'/organisations/'+id+'/').read_text()]
member_soup=root[output(SITE,'/alliance/leadership/members/')]
founder_cards=[n['href'] for n in member_soup.select('[data-collection-index] a.card') if n.select_one('.meta')]
assert set(founder_cards)=={'/organisations/'+id+'/' for id in founders}
hubs=[]
config=yaml.safe_load((ROOT/'_config.yml').read_text())
for name in ['discover','adopt','build','alliance','news-and-events']:
 route='/'+name+'/';expected=[]
 for row in manifest:
  m=metadata(ROOT/row['path']);parent=m.get('parent')
  for d in config['defaults']:
   scope=d['scope'];path=scope.get('path','')
   if path and row['path'].startswith(path+'/') and 'parent' in d['values'] and not m.get('parent'):parent=d['values']['parent']
  if parent==route and not m.get('alternate'):expected.append((m['title'],row['route']))
 expected=[r for title,r in sorted(expected,key=lambda v:v[0].lower())]
 actual=[n['href'] for n in root[output(SITE,route)].select('.index-list a.card')]
 titles={r['route']:metadata(ROOT/r['path'])['title'].lower() for r in manifest}
 hubs.append({'route':route,'count':len(actual),'correct':sorted(actual)==sorted(expected) and [titles[r] for r in actual]==sorted(titles[r] for r in actual),'expected':expected,'actual':actual})
assets=[]
for p in subprocess.check_output(['git','ls-tree','-r','--name-only',BASELINE,'assets','favicon.ico'],cwd=ROOT).decode().splitlines():
 old=subprocess.check_output(['git','show',BASELINE+':'+p],cwd=ROOT)
 unchanged=digest(old)==digest((ROOT/p).read_bytes())
 if p.endswith('.scss'):
  assets.append({'path':p,'compiled':True,'correct':unchanged and (SITE/p.replace('.scss','.css')).is_file() and (PROJECT/p.replace('.scss','.css')).is_file()})
 else:
  assets.append({'path':p,'correct':unchanged and digest(old)==digest((SITE/p).read_bytes())==digest((PROJECT/p).read_bytes())})
root_links=links(SITE,root);project_links=links(PROJECT,{p:parse(p) for p in PROJECT.rglob('*.html')},'/cheri-preview')
summary={'records':len(records),'source_cards':len(cards),'original_assets':len(assets),'founding_members':len(founder_cards),'directories':directories,'hubs':hubs,'failures':failures}
result={**summary,'records':records,'source_cards':cards,'assets':assets,'root_links':root_links,'project_links':project_links}
OUT.mkdir(exist_ok=True);(OUT/'audit.json').write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps(summary,indent=2));print('root link errors',len(root_links['errors']),'project link errors',len(project_links['errors']))
assert not failures and all(all(v for k,v in c.items() if k not in ['path','url']) for c in cards)
assert all(d['correct'] for d in directories+hubs+assets)
assert not any(e['component'] for e in root_links['errors']+project_links['errors'])
