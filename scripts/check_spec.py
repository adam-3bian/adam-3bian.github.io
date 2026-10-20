#!/usr/bin/env python3
"""Validate v5.3 source contracts and complete published-route/asset parity."""
from pathlib import Path
from urllib.parse import urlsplit,unquote
import argparse,collections,csv,datetime,hashlib,json,posixpath,re,sys,zoneinfo
import yaml
from lxml import html
ROOT=Path(__file__).resolve().parents[1];DOC=ROOT/'docs/migrations/v5.3'
FAMILIES={'posts':('posts','post','post'),'events':('events','event','event'),'people':('speakers','speaker','person'),'organisations':('members','member','organisation'),'papers':('papers','paper','publication'),'products':('products','product','product'),'repositories':('repositories','repository','repository'),'groups':('working-groups','working-group','working_group'),'guides':('guides','guide','guide'),'policies':('policies','policy','policy')}
GROUPS={v[2]:k for k,v in FAMILIES.items()};TYPES={**GROUPS,'paper':'papers','page':'pages'}
SCHEMA={
'post':{'category','authors','tags'},'event':{'format','series','organisers','partners','timezone','time_bounds','location','registration','speakers','schedule'},
'person':{'roles','organisations','governance','location','links'},'organisation':{'type','sector','website','membership'},'publication':{'year','venue','type','citation','doi','authors'},
'product':{'type','architecture','manufacturer','maturity','availability','repositories'},'repository':{'type','architectures','maturity','maintainers'},
'working_group':{'type','status','coordinator','focus_areas'},'guide':{'topic','level','estimated_minutes','series','sequence','primary_product','prerequisites'},'policy':{'type','version','dates','owner','status'}}
TOP={'layout','title','summary','permalink','slug','navigation','image','resources','forms','related','date','end_date','sitemap','canonical_url','listing','landing'}|set(SCHEMA)
class UniqueLoader(yaml.SafeLoader): pass
def mapping(loader,node,deep=False):
 result={}
 for key,value in node.value:
  key=loader.construct_object(key,deep=deep)
  if key in result:raise ValueError('Duplicate YAML key: '+str(key))
  result[key]=loader.construct_object(value,deep=deep)
 return result
UniqueLoader.add_constructor(yaml.resolver.BaseResolver.DEFAULT_MAPPING_TAG,mapping)
def load(text):return yaml.load(text,Loader=UniqueLoader)
def document(path):
 parts=path.read_text().split('---',2)
 if len(parts)!=3 or parts[0].strip():raise ValueError(str(path)+': missing front matter')
 return load(parts[1]),parts[2].strip()
def unknown(value,allowed,label,errors):
 if not isinstance(value,dict):errors.append(label+': expected object');return
 if set(value)-set(allowed):errors.append(label+': unknown fields '+str(sorted(set(value)-set(allowed))))
def iso(value):
 return isinstance(value,str) and bool(re.fullmatch(r'\d{4}-\d{2}-\d{2}',value)) and datetime.date.fromisoformat(value)
def clock(value):return isinstance(value,str) and bool(re.fullmatch(r'(?:[01]\d|2[0-3]):[0-5]\d',value))
def valid_url(value):
 if not isinstance(value,str) or not value or re.search(r'[<>\s]',value):return False
 p=urlsplit(value)
 return (p.scheme in ['http','https'] and bool(p.netloc)) or (value.startswith('/') and not value.startswith('//'))
def validate_schedule(data,label,errors,warnings):
 ev=data['event'];unknown(ev.get('location',{}),{'venue','city','country','online_url'},label+'.location',errors)
 if ev.get('registration'):
  unknown(ev['registration'],{'url','label'},label+'.registration',errors)
  if not valid_url(ev['registration'].get('url')):errors.append(label+': invalid registration URL')
 zone=ev.get('timezone','Europe/London')
 cached=load((ROOT/'_data/time_zones.yml').read_text()).get(zone,[])
 if not cached:errors.append(label+': timezone offset cache missing; run scripts/generate_time_zones.py')
 elif data['date'][:4]<'2020' or data.get('end_date',data['date'])[:4]>='2051':errors.append(label+': event outside timezone cache; extend generated range')
 try:zoneinfo.ZoneInfo(zone)
 except Exception:errors.append(label+': invalid IANA timezone');return
 bounds=ev.get('time_bounds')
 if bounds:
  unknown(bounds,{'start','end'},label+'.time_bounds',errors)
  if set(bounds)!={'start','end'} or not all(clock(v) for v in bounds.values()):errors.append(label+': time_bounds requires a start/end pair')
  elif data.get('end_date',data['date'])==data['date'] and bounds['start']>=bounds['end']:errors.append(label+': invalid whole-event bounds')
 days=ev.get('schedule',[]);dates=[d['date'] for d in days];ids=set();timed=[]
 if dates!=sorted(set(dates)):errors.append(label+': schedule dates must be unique/ordered')
 for day in days:
  unknown(day,{'date','label','sessions'},label+'.day',errors)
  if not iso(day['date']) or not data['date']<=day['date']<=data.get('end_date',data['date']):errors.append(label+': programme date outside event')
  for s in day['sessions']:
   unknown(s,{'id','type','title','start','end','track','room','description','presentations'},label+'.session',errors)
   if s.get('type') not in ['introduction','session','keynote','talk','panel','break','networking','closing','workshop','tutorial']:errors.append(label+': invalid session type')
   for item in [s]+s.get('presentations',[]):
    if item is not s:unknown(item,{'id','title','description','start','end'},label+'.presentation',errors)
    identifier=item.get('id','')
    if not re.fullmatch(r'[a-z0-9]+(?:-[a-z0-9]+)*',identifier) or identifier in ids:errors.append(label+': duplicate/invalid programme ID '+identifier)
    ids.add(identifier)
    if not item.get('title'):errors.append(label+': programme title missing')
    for field in ['start','end']:
     if field in item and not clock(item[field]):errors.append(label+': invalid programme time '+str(item[field]))
     elif field in item:
      local=datetime.datetime.fromisoformat(day['date']+'T'+item[field]);tz=zoneinfo.ZoneInfo(zone);aware=local.replace(tzinfo=tz)
      if aware.astimezone(datetime.timezone.utc).astimezone(tz).replace(tzinfo=None)!=local:errors.append(label+': nonexistent local clock time')
      if aware.utcoffset()!=local.replace(tzinfo=tz,fold=1).utcoffset():errors.append(label+': ambiguous local clock time')
    if item.get('start') and item.get('end'):
     if item['start']>=item['end']:errors.append(label+': programme start must precede end')
     if item is s:timed.append((day['date'],s.get('track','main'),s['start'],s['end'],identifier))
     elif s.get('start') and s.get('end') and not(s['start']<=item['start']<item['end']<=s['end']):errors.append(label+': presentation outside parent slot')
    elif item.get('start') or item.get('end'):warnings.append(label+': source supplies partial timing for '+identifier)
 for i,a in enumerate(timed):
  for b in timed[i+1:]:
   if a[:2]==b[:2] and a[2]<b[3] and b[2]<a[3]:errors.append(label+': same-track overlap '+a[4]+' / '+b[4])
 for speaker in ev.get('speakers',[]):
  unknown(speaker,{'person','role','session'},label+'.speakers',errors)
  if speaker.get('role') not in ['speaker','moderator','chair','panellist','host','presenter','organiser']:errors.append(label+': unknown speaker role')
  if speaker.get('session') and speaker['session'] not in ids:errors.append(label+': unresolved speaker session')
 for res in data.get('resources',[]):
  if res.get('session_id') and res.get('presentation_id'):errors.append(label+': resource has two programme scopes')
  if (res.get('session_id') or res.get('presentation_id')) and (res.get('session_id') or res.get('presentation_id')) not in ids:errors.append(label+': resource scope unresolved')
 return ids

def validate_forms(forms,errors):
 for key,f in forms.items():
  label='forms.'+key;unknown(f,{'id','title','description','privacy_url','submission','fields'},label,errors)
  if not re.fullmatch(r'[A-Za-z][A-Za-z0-9_-]*',f.get('id','')):errors.append(label+': invalid ID')
  sub=f.get('submission',{});unknown(sub,{'mode','url','label','method','verified','success_message','error_message','security'},label+'.submission',errors)
  if sub.get('mode') not in ['external','post','disabled']:errors.append(label+': invalid mode')
  if sub.get('mode') in ['external','post'] and (not sub.get('label') or not valid_url(sub.get('url'))):errors.append(label+': missing real submission target/label')
  if sub.get('mode')=='post' and (not sub.get('verified') or sub.get('method','post')!='post' or not sub.get('success_message') or not sub.get('error_message') or not sub.get('security') or not f.get('privacy_url')):errors.append(label+': POST requires verified backend, responses, security and privacy')
  names=set()
  for field in f.get('fields',[]):
   unknown(field,{'name','type','label','required','width','placeholder','help','autocomplete','options','rows','min_length','max_length','pattern','default'},label+'.field',errors)
   if not field.get('name') or field['name'] in names:errors.append(label+': duplicate/missing wire name')
   names.add(field.get('name'))
   if field.get('type') not in ['text','email','tel','textarea','select','checkbox','radio','hidden']:errors.append(label+': unsupported input type')
   if field.get('type')!='hidden' and not field.get('label'):errors.append(label+': field lacks label')
   if field.get('width','full') not in ['full','half']:errors.append(label+': invalid field width')
   if 'required' in field and not isinstance(field['required'],bool):errors.append(label+': required must be boolean')
   for bound in ['rows','min_length','max_length']:
    if bound in field and (not isinstance(field[bound],int) or field[bound]<(1 if bound=='rows' else 0)):errors.append(label+': invalid '+bound)
   if field.get('min_length',0)>field.get('max_length',10**9):errors.append(label+': reversed length bounds')
   options=field.get('options',[])
   for o in options:unknown(o,{'value','label'},label+'.option',errors)
   if field.get('type') in ['radio','select'] and (not options or len({o.get('value') for o in options})!=len(options) or not all('value' in o and o.get('label') for o in options)):errors.append(label+': missing/duplicate options')

def validate_source(errors,warnings):
 config=load((ROOT/'_config.yml').read_text());taxonomy=load((ROOT/'_data/taxonomy.yml').read_text());forms=load((ROOT/'_data/forms.yml').read_text())
 validate_forms(forms,errors)
 if not {'contact','newsletter'}<=set(forms):errors.append('Required published forms missing')
 if set(config['collections'])!=set(FAMILIES)-{'posts'}|{'redirects','glossary'}:errors.append('Incorrect collection configuration')
 if not config['kramdown']['auto_ids'] or 'jekyll-redirect-from' not in config.get('plugins',[]):errors.append('Missing safe-build anchors/redirect plugin')
 if 'footer' in config['navigation']:errors.append('Duplicated global footer destinations')
 for legacy in ['_news','_hardware','_software','_reports']:
  if list((ROOT/legacy).glob('*.md')):errors.append('Legacy collection still live '+legacy)
 for legacy in ['relationships','talks','governing-board']:
  if (ROOT/('_data/'+legacy+'.yml')).exists():errors.append('Legacy relationship registry '+legacy)
 nav={cat['title']:{sub['title'] for sub in cat.get('subcategories',[])} for cat in config['navigation']['header'] if cat.get('subcategories')}
 footer={c['title'] for c in load((ROOT/'_data/footer_categories.yml').read_text())}
 records={};routes={};redirects={}
 for kind in list(FAMILIES)+['pages','redirects']:
  entries={};records[kind]=entries
  for p in sorted((ROOT/('pages' if kind=='pages' else '_'+kind)).rglob('*.md')):
   d,body=document(p);label=str(p.relative_to(ROOT));url=d.get('permalink')
   if not url or not url.startswith('/'):errors.append(label+': explicit public permalink required');continue
   if url in routes:errors.append(label+': duplicate route '+url)
   routes[url]=(p,d)
   if kind=='redirects':
    unknown(d,{'permalink','redirect_to','sitemap'},label,errors)
    if body:errors.append(label+': redirect body must be empty')
    redirects[url]=d.get('redirect_to');continue
   unknown(d,TOP,label,errors);slug=d.get('slug');entries[slug]=(p,d,body)
   if not d.get('title') or (not d.get('summary') and not d.get('listing')):errors.append(label+': title/summary missing')
   for part in ['navigation','image','listing','landing']:
    if part in d:unknown(d[part],{'navigation':{'header','footer'},'image':{'src','alt','fit','width','height','position'},'listing':{'collection','filter','sort'},'landing':{'content_group','card_style','navigation','heading','sections','slider'}}[part],label+'.'+part,errors)
   h=d.get('navigation',{}).get('header',{});unknown(h,{'category','subcategory'},label+'.header',errors)
   if h.get('category') not in nav or (h.get('subcategory') not in nav.get(h.get('category'),set()) and d.get('landing',{}).get('navigation')!='category'):errors.append(label+': invalid navigation hierarchy')
   f=d.get('navigation',{}).get('footer')
   if f is not None:
    unknown(f,{'category'},label+'.footer',errors)
    if f.get('category') not in footer:errors.append(label+': invalid footer category')
   if kind=='pages':
    parts=p.relative_to(ROOT/'pages').parts
    if len(parts) not in [3,4] and label not in ['pages/index.md','pages/discover/index.md','pages/adopt/index.md','pages/build/index.md','pages/alliance/index.md','pages/news-and-events/index.md']:errors.append(label+': invalid ordinary-page source location')
   else:
    group=FAMILIES[kind][2]
    if set(SCHEMA)&set(d)!={group} or d.get('layout')!='details/'+FAMILIES[kind][1]:errors.append(label+': incorrect semantic group/layout')
    else:unknown(d[group],SCHEMA[group],label+'.'+group,errors)
    for field,values in taxonomy.get(group,{}).items():
     if field in d.get(group,{}):
      actual=d[group][field] if isinstance(d[group][field],list) else [d[group][field]]
      if not set(actual)<=set(values):errors.append(label+': unknown '+group+'.'+field+' value')
    required={'posts':['category'],'events':['format'],'papers':['year'],'products':['type'],'repositories':['type'],'groups':['type'],'guides':['topic'],'policies':['type']}.get(kind,[])
    if any(not d.get(group,{}).get(key) for key in required):errors.append(label+': required semantic value missing')
   if kind in ['posts','events'] and not (iso(d.get('date')) if kind=='events' else isinstance(d.get('date'),str) and datetime.datetime.fromisoformat(d['date'])):errors.append(label+': quoted ISO date required')
   if kind=='posts' and not p.name.startswith(str(d.get('date'))[:10]+'-'):errors.append(label+': dated post filename mismatch')
   if d.get('end_date') and (not iso(d['end_date']) or d['end_date']<d['date']):errors.append(label+': invalid end_date')
   if d.get('image'):
    if not d['image'].get('src') or not d['image'].get('alt'):errors.append(label+': image lacks meaningful source/alt')
    if d['image'].get('fit','cover') not in ['cover','contain']:errors.append(label+': invalid image fit')
   if len(d.get('forms',[]))!=len(set(d.get('forms',[]))) or any(key not in forms for key in d.get('forms',[])):errors.append(label+': unresolved/duplicate form keys')
   for res in d.get('resources',[]):
    unknown(res,{'type','label','url','session_id','presentation_id'},label+'.resource',errors)
    if res.get('type') not in ['website','documentation','repository','download','pdf','slides','video','publication','recording','external'] or not res.get('label') or not valid_url(res.get('url')):errors.append(label+': invalid resource '+str(res))
    if kind!='events' and (res.get('session_id') or res.get('presentation_id')):errors.append(label+': programme scope only allowed on events')
   if kind=='repositories' and not any(r['type']=='repository' for r in d.get('resources',[])):errors.append(label+': repository has no verified source link')
   if body and not body.startswith('## '):errors.append(label+': body must start with H2')
   in_code=False
   for line in body.splitlines():
    if line.lstrip().startswith('~~~'):in_code=not in_code;continue
    if in_code:continue
    if re.match(r'^#\s|^#{4,}\s',line):errors.append(label+': authored heading must be H2/H3')
    if re.search(r'<(?:div|img|table|script|iframe|h[1-6])\b',line,re.I):errors.append(label+': raw layout HTML')
    if '{:' in line and not ('.image-' in line and ('![' in line or line.strip().startswith('{:'))):errors.append(label+': arbitrary body attributes')
    if re.search(r'{%\s*(?!raw\b|endraw\b)\w+',line) and '{% raw %}' not in line:errors.append(label+': executable Liquid in body')
   if kind=='events':validate_schedule(d,label,errors,warnings)
 # Every foreign key belongs to its authoritative owner.
 def ref(kind,slug,label):
  if slug not in records[kind]:errors.append(label+': unresolved '+kind+' reference '+str(slug))
 for kind,entries in records.items():
  for slug,(p,d,body) in entries.items():
   label=str(p.relative_to(ROOT))
   for group in ['post','publication']:
    for author in d.get(group,{}).get('authors',[]):
     unknown(author,{'person','name','role'},label+'.authors',errors)
     if bool(author.get('person'))==bool(author.get('name')):errors.append(label+': exactly one author identity required')
     if author.get('person'):ref('people',author['person'],label)
   for a in d.get('person',{}).get('organisations',[]):
    unknown(a,{'organisation','relationship','positions'},label+'.affiliation',errors);ref('organisations',a.get('organisation'),label)
    if a.get('relationship') not in ['employment','research','consultancy','governance','other']:errors.append(label+': invalid affiliation relationship')
    if not a.get('positions'):warnings.append(label+': source affiliation has no verified position/title/date: '+a['organisation'])
    for pos in a.get('positions',[]):
     unknown(pos,{'title','status','start_date','end_date'},label+'.position',errors)
     if not pos.get('title') or pos.get('status') not in ['current','past']:errors.append(label+': invalid position')
     if any(not iso(pos[key]) for key in ['start_date','end_date'] if key in pos):errors.append(label+': invalid position date')
   for a in d.get('event',{}).get('speakers',[]):ref('people',a.get('person'),label)
   for field in ['organisers','partners']:
    for a in d.get('event',{}).get(field,[]):
     unknown(a,{'organisation','role'},label+'.'+field,errors);ref('organisations',a.get('organisation'),label)
   for a in d.get('product',{}).get('repositories',[]):
    unknown(a,{'repository','compatibility'},label+'.repositories',errors);ref('repositories',a.get('repository'),label)
    if a.get('compatibility') not in ['supported','experimental','planned','unsupported','unknown']:errors.append(label+': invalid compatibility')
   for a in d.get('repository',{}).get('maintainers',[]):
    unknown(a,{'organisation','role'},label+'.maintainers',errors);ref('organisations',a.get('organisation'),label)
   for group,field,target in [('product','manufacturer','organisations'),('working_group','coordinator','organisations'),('guide','primary_product','products'),('policy','owner','organisations')]:
    if d.get(group,{}).get(field):ref(target,d[group][field],label)
   for a in d.get('related',[]):
    unknown(a,{'type','slug','relation'},label+'.related',errors)
    if a.get('type') not in TYPES:errors.append(label+': unknown related type')
    else:ref(TYPES[a['type']],a.get('slug'),label)
   membership=d.get('organisation',{}).get('membership')
   if membership:
    unknown(membership,{'is_member','status','tier','founding_member'},label+'.membership',errors)
    if membership.get('status') not in ['active','past','inactive','pending','unknown']:errors.append(label+': invalid membership status')
    if membership.get('status')=='unknown':warnings.append(label+': membership status unknown; excluded from current_members')
   for nested,allowed in [(d.get('person',{}).get('governance'),{'board_order','board_role'}),(d.get('policy',{}).get('dates'),{'effective','reviewed'})]:
    if nested:unknown(nested,allowed,label,errors)
 for source,target in redirects.items():
  if source==target or target in redirects:errors.append('Redirect self-reference/chain '+source)
  if urlsplit(target or '').path not in routes:errors.append('Redirect target missing '+str(target))
 # Source-to-source association parity and curated order are permanent regression checks.
 migration=list(csv.DictReader((DOC/'records.csv').open()));by_old={r['old_source']:r for r in migration}
 baseline=json.loads((DOC/'baseline.json').read_text());relationship_rows=[];relationship_positions=collections.Counter()
 for old in baseline['relationships']:
  migrated=by_old[old['source']];fm=document(ROOT/migrated['new_source'])[0]
  if old['relation']=='authors':refs=[a.get('person') for a in fm.get('post',fm.get('publication',{})).get('authors',[])]
  elif old['relation']=='speakers':refs=[a.get('person') for a in fm.get('event',{}).get('speakers',[])]
  elif old['relation']=='organization':refs=[a.get('organisation') for a in fm.get('person',{}).get('organisations',[])] if fm.get('person') else [a['slug'] for a in fm.get('related',[]) if a['type']=='organisation']
  else:refs=[]
  ok=old['target'] in refs
  position_key=(old['source'],old['relation']);old_index=relationship_positions[position_key];relationship_positions[position_key]+=1
  new_index=refs.index(old['target']) if ok else None
  relationship_rows.append({**old,'old_index':old_index,'new_source':migrated['new_source'],'new_index':new_index,'preserved':ok})
  if old['relation']=='authors' and old_index!=new_index:errors.append('Author order changed '+str(old))
  if not ok:errors.append('Lost relationship '+str(old))
 board=sorted([(d['person']['governance']['board_order'],s) for s,(p,d,b) in records['people'].items() if d.get('person',{}).get('governance',{}).get('board_order')])
 if [s for n,s in board]!=baseline['board']:errors.append('Governing board roster/order changed')
 for old in baseline['talks']:
  matches=[d for p,d,b in records['events'].values() if any(s['id']=='talk-'+old['id'] for day in d['event'].get('schedule',[]) for s in day['sessions'])]
  if len(matches)!=1:errors.append('Lost/duplicated legacy talk '+old['id']);continue
  event=matches[0]
  for person in old.get('speakers',[]):
   if not any(s['person']==person and s.get('session')=='talk-'+old['id'] for s in event['event'].get('speakers',[])):errors.append('Talk speaker lost '+old['id'])
  for link in old['links']:
   if not any(res['url']==link['url'] and res.get('session_id')=='talk-'+old['id'] for res in event.get('resources',[])):errors.append('Talk media lost '+old['id'])
 snapshot=json.loads((DOC/'source-snapshot.json').read_text())
 original={r['path']:r['data'] for entries in snapshot.values() for r in entries}
 for r in migration:
  if not (ROOT/r['new_source']).is_file():errors.append('Lost source record '+r['old_source']);continue
  fm=document(ROOT/r['new_source'])[0];old=original[r['old_source']]
  if r['old_source'].startswith('_people/') and bool(old.get('speaker'))!=('speaker' in fm['person'].get('roles',[])):errors.append('Speaker eligibility changed '+r['old_source'])
  if r['old_source'].startswith('_organisations/') and bool(old.get('member'))!=bool(fm['organisation'].get('membership',{}).get('is_member')):errors.append('Membership flag changed '+r['old_source'])
 for url,info in baseline['assets'].items():
  p=ROOT/url.lstrip('/')
  if p.suffix.lower() in ['.png','.jpg','.jpeg','.webp','.gif','.svg','.pdf','.ttf','.woff','.woff2'] and (not p.is_file() or hashlib.sha256(p.read_bytes()).hexdigest()!=info['sha256']):errors.append('Changed/lost original binary '+url)
 for name in ['header','footer','breadcrumbs','form-from-data','form-fields','newsletter-cta','related-content']:
  if not (ROOT/('_includes/'+name+'.html')).is_file():errors.append('Missing shared component '+name)
 for list_name,detail_name,group in FAMILIES.values():
  if not (ROOT/('_layouts/lists/'+list_name+'.html')).exists() or not (ROOT/('_layouts/details/'+detail_name+'.html')).exists():errors.append('Missing layout family '+group)
 return records,routes,redirects,relationship_rows

def rendered(site,baseurl,routes,redirects,errors):
 pages={};fragments=[];binary=[];before=json.loads((DOC/'baseline.json').read_text());route_map={r['old_url']:r['new_url'] for r in csv.DictReader((DOC/'routes.csv').open())}
 for p in site.rglob('*.html'):
  url='/'+p.relative_to(site).as_posix();url=url.removesuffix('index.html') if url.endswith('index.html') else url
  tree=html.fromstring(p.read_text());pages[url]=tree;ids=tree.xpath('//@id')
  if len(ids)!=len(set(ids)):errors.append(url+': duplicate IDs '+str([x for x,n in collections.Counter(ids).items() if n>1]))
  if url in redirects:
   if tree.xpath('//main|//header|//footer|//h1'):errors.append(url+': redirect contains site chrome')
   target=tree.xpath('//link[@rel="canonical"]/@href')
   expected='https://adam-3bian.github.io'+baseurl+redirects[url]
   if target!=[expected]:errors.append(url+': redirect canonical mismatch '+str(target))
   if tree.xpath('//body//a/@href')!=[baseurl+redirects[url]]:errors.append(url+': redirect fallback must stay on this deployment')
  elif url in routes and len(tree.xpath('//h1'))!=1:errors.append(url+': exactly one H1 required')
  for tag,attr in [('a','href'),('img','src'),('source','src'),('form','action')]:
   for raw in tree.xpath('//'+tag+'/@'+attr):
    parts=urlsplit(raw)
    if parts.scheme or parts.netloc or not parts.path and not parts.fragment:continue
    path=unquote(parts.path) or baseurl+url
    if not path.startswith('/'):path=posixpath.normpath(posixpath.join(posixpath.dirname(baseurl+url),path))
    if baseurl and not path.startswith(baseurl+'/') and path!=baseurl:errors.append(url+': URL escaped deployment prefix '+raw);continue
    path=path[len(baseurl):] or '/'
    f=site/path.lstrip('/');f=f/'index.html' if path.endswith('/') else f
    if not f.is_file():errors.append(url+': missing local target '+raw)
 for url,tree in pages.items():
  for raw in tree.xpath('//main//a/@href'):
   part=urlsplit(raw)
   if part.scheme or part.netloc or not part.fragment:continue
   path=unquote(part.path) or baseurl+url
   if not path.startswith('/'):path=posixpath.normpath(posixpath.join(posixpath.dirname(baseurl+url),path))
   if baseurl and path.startswith(baseurl):path=path[len(baseurl):] or '/'
   path=redirects.get(path,path);target=pages.get(path)
   if target is not None and unquote(part.fragment) not in target.xpath('//@id'):errors.append(url+': missing fragment '+raw)
 for url,old in before['routes'].items():
  final=route_map[url]
  if url not in pages:errors.append('Lost published URL '+url)
  target=pages.get(final)
  for identifier in old['ids']:
   ok=target is not None and identifier in target.xpath('//@id')
   fragments.append({'old_url':url,'old_fragment':identifier,'new_url':final,'preserved':ok})
   if not ok:errors.append('Lost historical fragment '+url+'#'+identifier)
 for url,info in before['assets'].items():
  if Path(url).suffix.lower() not in ['.png','.jpg','.jpeg','.webp','.gif','.svg','.pdf','.ttf','.woff','.woff2']:continue
  p=site/url.lstrip('/');ok=p.is_file() and hashlib.sha256(p.read_bytes()).hexdigest()==info['sha256'];binary.append({'old_path':url,'sha256':info['sha256'],'preserved':ok})
  if not ok:errors.append('Lost rendered binary '+url)
 return fragments,binary,len(pages)

def main():
 ap=argparse.ArgumentParser();ap.add_argument('--site',type=Path);ap.add_argument('--baseurl',default='');ap.add_argument('--report',type=Path);ap.add_argument('--audit',action='store_true');args=ap.parse_args();errors=[];warnings=[]
 try:
  records,routes,redirects,relationships=validate_source(errors,warnings)
  fragments=[];binary=[];page_count=0
  if args.site:fragments,binary,page_count=rendered(args.site,args.baseurl,routes,redirects,errors)
 except Exception as exc:raise
 if args.audit:
  for name,rows in [('relationships.csv',relationships),('fragments.csv',fragments),('published-assets.csv',binary)]:
   if rows:
    with (DOC/name).open('w',newline='') as f:w=csv.DictWriter(f,fieldnames=list(rows[0]),lineterminator="\n");w.writeheader();w.writerows(rows)
 report={'schema':'5.3','records':{k:len(v) for k,v in records.items()},'routes':len(routes),'redirects':len(redirects),'rendered_pages':page_count,'preserved_relationships':len(relationships),'preserved_fragments':len(fragments),'preserved_assets':len(binary),'warnings':sorted(set(warnings)),'errors':sorted(set(errors))}
 if args.report:args.report.parent.mkdir(parents=True,exist_ok=True);args.report.write_text(json.dumps(report,indent=2)+'\n')
 print(json.dumps({k:v for k,v in report.items() if k!='warnings'},indent=2));print(str(len(report['warnings']))+' documented source-data warnings')
 return bool(errors)
if __name__=='__main__':sys.exit(main())
