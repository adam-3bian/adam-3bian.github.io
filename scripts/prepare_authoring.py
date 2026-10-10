#!/usr/bin/env python3
"""Prepare collection-based authoring from complete captured content and source evidence.

Provenance belongs in reports. Navigation belongs in site configuration.
Source text remains verbatim; only declared internal link destinations change.
"""
import hashlib, html, json, re, unicodedata
from collections import defaultdict
from pathlib import Path
from urllib.parse import urlsplit, urlunsplit
import yaml
from bs4 import BeautifulSoup
from capture import ROOT, write_csv
from convert_batch import clean_main
from site_model import named_authors

class FlowList(list): pass
class Dumper(yaml.SafeDumper): pass
Dumper.add_representer(FlowList, lambda d, value: d.represent_sequence('tag:yaml.org,2002:seq', value, flow_style=True))
def save_json(path, value):
    (ROOT/path).write_text(json.dumps(value, indent=2, ensure_ascii=False)+'\n')
def load_document(path):
    text=(ROOT/path).read_text(); _, front, body=text.split('---', 2)
    return yaml.safe_load(front),body.lstrip('\n')
def save_document(path, meta, body):
    for key in ('organization','speakers','authors','leads'):
        if isinstance(meta.get(key),list):meta[key]=FlowList(meta[key])
    p=ROOT/path;p.parent.mkdir(parents=True,exist_ok=True)
    p.write_text('---\n'+yaml.dump(meta,Dumper=Dumper,sort_keys=False,allow_unicode=True,width=110)+'---\n\n'+body.rstrip()+'\n')
def slug(name):
    return re.sub(r'[^a-z0-9]+','-',unicodedata.normalize('NFKD',name).encode('ascii','ignore').decode().lower()).strip('-')
def norm(name):
    return re.sub(r'[^a-z0-9]','',unicodedata.normalize('NFKD',name).encode('ascii','ignore').decode().lower())
def source_dom(row):
    raw=(ROOT/row['snapshot_path']).read_bytes()
    assert hashlib.sha256(raw).hexdigest()==row['sha256'],row['url']
    return clean_main(BeautifulSoup(raw,'html5lib'),row.get('final_url',row['url']))[0]
def source_signature(row):
    p='reports/validation/'+hashlib.sha256(row['url'].encode()).hexdigest()[:16]+'/source-signature.json'
    return p,json.loads((ROOT/p).read_text())
def author_key(name):
    words=re.findall(r'[\w-]+',name.casefold())
    first={'alexander':'alex'}.get(words[0],words[0])
    return first,words[-1]

previous_routes=json.loads((ROOT/'reports/route-map.json').read_text()) if (ROOT/'reports/route-map.json').exists() else {}
index=json.loads((ROOT/'reports/capture-index.json').read_text())
rows=[r for r in index['records'] if r.get('conversion_status')=='converted']
by_url={r['url']:r for r in rows};docs={};moves={};proofs=[];derived=[]
old_paper_registry=ROOT/'_data/papers.yml'
if old_paper_registry.exists():
    paper_sources=yaml.safe_load(old_paper_registry.read_text())
else:paper_sources=json.loads((ROOT/'reports/paper-sources.json').read_text())
board_old=yaml.safe_load((ROOT/'_data/governing-board.yml').read_text())
board=[entry['person'] if isinstance(entry,dict) else entry for entry in board_old]
# A real organisation can use its complete existing About page as its canonical profile.
about='https://cheri-alliance.github.io/alliance/about-and-governance/about-the-cheri-alliance/'
primary_names={Path(r['local_path']).name.split('--')[-1] for r in rows if r['source_site']=='cheri-alliance.github.io'}
for row in rows:
    old=row['local_path']
    if old in moves:
        row['local_path']=moves[old];continue
    fm,body=load_document(old);parts=Path(old).parts;collection=parts[0] if parts[0].startswith('_') else None
    relative=urlsplit(row['url']).path.strip('/') or 'index'
    is_original=row['source_site']=='cheri-alliance.org'
    if row['url']==about:collection='_organisations';name='cheri-alliance'
    elif collection:name=Path(old).stem.split('--')[-1]
    else:name=relative
    if collection:
        if is_original and name+'.md' in primary_names and not old.startswith('_organisations/'):
            name+='-original';fm['alternate']=True
        path=collection+'/'+name+'.md'
        route=('/organisations/' if collection=='_organisations' else '/'+collection[1:]+'/')+name+'/'
    else:
        relative=('reference/'+relative) if relative.endswith('.html') else relative
        relative=('history/'+relative) if is_original and relative in {urlsplit(r['url']).path.strip('/') for r in rows if r['source_site']=='cheri-alliance.github.io'} else relative
        path='pages/'+relative+'.md'
        route='/' if relative=='index' else '/'+relative+('' if relative.endswith('.html') else '/')
    fm.pop('layout',None);fm.pop('permalink',None)
    if collection is None:fm['permalink']=route
    if row['url']==about:
        fm['title']='CHERI Alliance'
    if 'members' in fm and row['url'].rstrip('/').endswith('/alliance/leadership/governing-board'):fm.pop('members')
    if path in docs and docs[path]['body']!=body:raise ValueError('Distinct content route collision: '+path)
    docs[path]={'meta':fm,'body':body,'row':row,'slug':Path(path).stem}
    moves[old]=path;row['local_path']=path;row['local_route']=route
for row in rows:
    # URL aliases sharing one body use that body's route.
    row['local_route']=docs[row['local_path']]['row']['local_route']
# Paper registries contain acquisition metadata, not editorial data.
new_paper_sources={};paper_checks=json.loads((ROOT/'reports/paper-validation.json').read_text())
authors_by_paper={};all_author_names=[]
for old_id,paper in paper_sources.items():
    old=paper['local_path'];fm,body=load_document(old)
    paper_id=re.sub(r'-[0-9a-f]{8}$','',Path(old).stem)
    path='_papers/'+paper_id+'.md'
    assert path not in docs,path
    fm.pop('layout',None);fm.pop('permalink',None);fm.pop('source_url',None)
    docs[path]={'meta':fm,'body':body,'slug':paper_id,'row':None}
    moves[old]=path
    route='/papers/'+paper_id+'/'
    paper.update(local_path=path,local_route=route)
    new_paper_sources[paper_id]=paper
    matching=next(check for check in paper_checks if check['publication_url']==paper['publication_url'])
    matching.update(slug=paper_id,local_path=path,local_route=route)
    citation=next(p for p in matching['source_signature']['paragraphs'] if re.search(r'\. (ACM|IEEE|Communications)',p))
    names=named_authors(citation)
    authors_by_paper[paper_id]=names;all_author_names.extend(names)
    matching['named_authors']=names
    matching['unnamed_contributors_retained']='and others' in citation
save_json('reports/paper-validation.json',paper_checks)
save_json('reports/paper-sources.json',new_paper_sources)
# Index real organisation profiles by their published titles. No membership is inferred for named affiliates.
org_docs={d['slug']:d for p,d in docs.items() if p.startswith('_organisations/')}
org_alias={norm(d['meta']['title']):s for s,d in org_docs.items()}
for s,d in org_docs.items():
    if d['row'] and re.match(r'^/(?:members|member)/',urlsplit(d['row']['url']).path):
        d['meta']['member']=True
        proofs.append({'path':'_organisations/'+s+'.md','field':'member','value':True,'source_url':d['row']['url'],'evidence':'Published member profile'})
# Source spelling variants refer to the explicitly named member organisation; proofs retain both spellings.
org_alias.update({norm(name):target for name,target in {
 'Axiomise':'axiomise-ltd','BT':'bt-group','National Cyber Security Centre':'ncsc',
 'University of Manchester':'the-university-of-manchester','Kent University':'university-of-kent',
 'RPTU Kaiserslautern-Landau':'rptu',
}.items()})
people={d['slug']:d for p,d in docs.items() if p.startswith('_people/')}
for person_id,person in list(people.items()):
    row=person['row'];ev,s=source_signature(row);definitions=s['definitions']
    label=next((definitions[i+1][1] for i,v in enumerate(definitions[:-1]) if v==['dt','Organisation']),None)
    if not label:continue
    # Corporate legal suffixes are part of one name, not a second organisation.
    names=[label] if norm(label) in org_alias or re.search(r',\s*(LLC|Inc\.?|Ltd\.?)$',label) else label.split(', ')
    references=[]
    for name in names:
        key=norm(name);org_id=org_alias.get(key)
        if org_id is None:
            org_id=slug(name);assert org_id not in org_docs,org_id
            path='_organisations/'+org_id+'.md'
            record={'meta':{'title':name},'body':'# '+name+'\n','slug':org_id,'row':None}
            docs[path]=record;org_docs[org_id]=record;org_alias[key]=org_id
            derived.append({'path':path,'title':name,'type':'organisation-name','source_url':row['url'],'evidence':ev,'source_label':label})
        references.append(org_id)
        proofs.append({'path':'_people/'+person_id+'.md','field':'organization','value':org_id,'source_url':row['url'],'evidence':ev,'published_label':label,'published_name':name,'target_title':org_docs[org_id]['meta']['title']})
    person['meta']['organization']=references[0] if len(references)==1 else references
speaker_url='https://cheri-alliance.github.io/news-and-events/people-and-opportunities/speakers/'
speaker_dom=source_dom(by_url[speaker_url])
profile_to_slug={r['url'].rstrip('/'):docs[r['local_path']]['slug'] for r in rows if r['local_path'].startswith('_people/')}
confirmed_speakers=set()
for anchor in speaker_dom.select('a[href]'):
    person_id=profile_to_slug.get(anchor['href'].rstrip('/'))
    if person_id:
        confirmed_speakers.add(person_id)
        proofs.append({'path':'_people/'+person_id+'.md','field':'speaker','value':True,'source_url':speaker_url,'evidence':'Explicit profile link in source speaker directory'})
for path,event in list(docs.items()):
    if not path.startswith('_events/'):continue
    main=source_dom(event['row']);explicit=main.select_one('.entity-speakers')
    links=(explicit or main).select('a[href]');refs=[]
    for anchor in links:
        person_id=profile_to_slug.get(anchor['href'].rstrip('/'))
        if person_id and person_id not in refs:
            refs.append(person_id);confirmed_speakers.add(person_id)
            proofs.append({'path':path,'field':'speakers','value':person_id,'source_url':event['row']['url'],'evidence':'Explicit speaker profile link in published event body','profile_url':anchor['href']})
    if refs:event['meta']['speakers']=refs
for person_id in confirmed_speakers:people[person_id]['meta']['speaker']=True
# Name variants use a unique matching first/surname, consistent middle names or initials.
# Robert Norton and Robert Norton-Wright remain distinct without proof of a name change.
name_groups=defaultdict(list)
for name in all_author_names:
    if name not in name_groups[author_key(name)]:name_groups[author_key(name)].append(name)
profile_groups=defaultdict(list)
for person_id,person in people.items():profile_groups[author_key(person['meta']['title'])].append(person_id)
author_ids={};author_proofs=[]
for key,names in name_groups.items():
    candidates=profile_groups[key]
    assert len(candidates)<=1,('Ambiguous author/profile match',key,candidates)
    if candidates:person_id=candidates[0]
    else:
        name=max(names,key=lambda n:sum(len(w) for w in re.findall(r'\w+',n)))
        person_id=slug(name);assert person_id not in people,person_id
        person={'meta':{'title':name},'body':'# '+name+'\n','slug':person_id,'row':None}
        docs['_people/'+person_id+'.md']=person;people[person_id]=person
        derived.append({'path':'_people/'+person_id+'.md','title':name,'type':'paper-author','source_url':paper_checks[0]['source_url'],'source_names':names,'papers':[]})
    for name in names:
        author_ids[name]=person_id
        author_proofs.append({'published_name':name,'person':person_id,'profile_title':people[person_id]['meta']['title'],
                              'method':'Unique source name match; middle names/initials and Alex/Alexander variants retained in citations'})
for paper_id,names in authors_by_paper.items():
    ids=list(dict.fromkeys(author_ids[name] for name in names));paper_path='_papers/'+paper_id+'.md'
    docs[paper_path]['meta']['authors']=ids
    for name in names:
        person_id=author_ids[name]
        proofs.append({'path':paper_path,'field':'authors','value':person_id,'published_name':name,
                       'source_url':new_paper_sources[paper_id]['source_catalogue'],'publication_url':new_paper_sources[paper_id]['publication_url'],
                       'evidence':'reports/paper-validation.json'})
        person=people[person_id]
        if person['row'] is None:
            proof=next(p for p in derived if p['path']=='_people/'+person_id+'.md')
            if paper_id not in proof['papers']:proof['papers'].append(paper_id)
# Stable canonical routes include source-declared aliases and query shortlinks when their captured final URL resolves.
routes={}
for row in rows:
    for u in (row['url'],row.get('final_url'),row.get('canonical_url')):
        if u:routes[u]=row['local_route']
for row in index['records']:
    if row.get('final_url') in routes:routes[row['url']]=routes[row['final_url']]
route_changes={old:routes[url] for url,old in previous_routes.items() if url in routes and old!=routes[url]}
def local_url(value):
    value=html.unescape(value);u=urlsplit(value)
    if not u.scheme and u.path in route_changes:return route_changes[u.path]+('#'+u.fragment if u.fragment else '')
    target=routes.get(urlunsplit((u.scheme,u.netloc,u.path,u.query,'')))
    if target is None and u.hostname in ('cheri-alliance.org','cheri-alliance.github.io'):
        target=routes.get(urlunsplit((u.scheme,u.netloc,u.path.rstrip('/')+'/',u.query,'')))
    return target+('#'+u.fragment if u.fragment else '') if target else value
for path,document in docs.items():
    document['body']=re.sub(r'(\]\()([^\n)]+)(\))',lambda m:m[1]+local_url(m[2])+m[3],document['body'])
    save_document(path,document['meta'],document['body'])
for old,new in moves.items():
    if old!=new and (ROOT/old).exists():(ROOT/old).unlink()
# Keep only a minimal governing-board array. All names, URLs and evidence remain in reports.
(ROOT/'_data/governing-board.yml').write_text(yaml.safe_dump(board,sort_keys=False))
for file in ('organisations.yml','papers.yml'):(ROOT/'_data'/file).unlink(missing_ok=True)
save_json('reports/capture-index.json',index)
save_json('reports/route-map.json',routes)
save_json('reports/relationship-evidence.json',proofs)
save_json('reports/derived-content.json',derived)
save_json('reports/author-name-matches.json',author_proofs)
save_json('reports/content-moves.json',moves)
# Reuse the live source's exact menu headings and links; add useful original-site material locally.
header=BeautifulSoup((ROOT/'_includes/github-header.html').read_text(),'html5lib')
nav=[]
for item in header.select('.nav-item'):
    button=item.select_one('button.nav-link')
    if not button:continue
    groups=[]
    for section in item.select('.subcategory'):
        heading=section.select_one('h2');links=[]
        if heading.select_one('a[href]'):
            a=heading.select_one('a[href]');links.append({'title':a.get_text(' ',strip=True),'url':local_url(a['href'])})
        links += [{'title':a.get_text(' ',strip=True),'url':local_url(a['href'])} for a in section.select('li a[href]')]
        groups.append({'title':heading.get_text(' ',strip=True),'links':links})
    nav.append({'title':button.get_text(' ',strip=True),'type':'megamenu','columns':len(groups),'subcategories':groups})
# Original-only content is surfaced through the matching directories, not a second competing menu.
for category in nav:
    for group in category['subcategories']:
        if group['title']=='Platforms':
            group['links']+=[{'title':'Hardware','url':'/hardware/'}]
            morello=by_url.get('https://cheri-alliance.org/morello-return/')
            if morello:group['links']+=[{'title':docs[morello['local_path']]['meta']['title'],'url':morello['local_route']}]
        if group['title']=='Software Ecosystem':group['links']+=[{'title':'All software','url':'/software/'}]
        if group['title']=='Resources':group['links']+=[{'title':'Papers and authors','url':'/papers/'}]
footer_dom=BeautifulSoup((ROOT/'_includes/github-footer.html').read_text(),'html5lib')
footer=[]
for section in footer_dom.select('footer section'):
    footer.append({'title':section.h2.get_text(' ',strip=True),'links':[{'title':a.get_text(' ',strip=True),'url':local_url(a['href'])} for a in section.select('a[href]')]})
config=yaml.safe_load((ROOT/'_config.yml').read_text())
config.update(title='CHERI Alliance',description='CHERI Alliance: hardware-enforced memory safety, secure software and the CHERI community.',lang='en-GB',url='',baseurl='')
for name,value in config['collections'].items():value['permalink']=('/organisations/:name/' if name=='organisations' else '/'+name+'/:name/')
config['defaults']=[{'scope':{'path':''},'values':{'layout':'page','render_with_liquid':False,'theme':'light'}}]
config['sass']={'sass_dir':'_sass','style':'compressed'}
config['logo']={'light':'/assets/images/brand/logo-blue.svg','dark':'/assets/images/brand/logo-white.svg','width':326,'height':112}
config['navigation']={'header':nav,'footer':footer}
config['exclude']=list(dict.fromkeys(config['exclude']+['docs','Gemfile','Gemfile.lock']))
(ROOT/'_config.yml').write_text(yaml.safe_dump(config,sort_keys=False,allow_unicode=True,width=110))
# Useful collection indexes are generated from documents, not maintained in _data.
for name,title in [('hardware','Hardware'),('software','Software'),('papers','Papers')]:
    path='pages/'+name+'.md'
    save_document(path,{'title':title,'permalink':'/'+name+'/','listing':name},'# '+title+'\n')
print(f'Prepared {len(docs)} content records, {len(derived)} minimal source-backed records and {len(proofs)} proven relationships. Only governing-board.yml remains in _data.')
