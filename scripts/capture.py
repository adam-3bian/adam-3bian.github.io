#!/usr/bin/env python3
"""Restartable, read-only public discovery. Never submit forms or mark pages verified."""
import argparse, csv, hashlib, json, time, signal, re, heapq
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urljoin, urlsplit, urlunsplit, parse_qsl, urlencode
from urllib.request import Request, urlopen
from urllib.error import HTTPError
from urllib.robotparser import RobotFileParser
from concurrent.futures import ThreadPoolExecutor
from bs4 import BeautifulSoup
import xml.etree.ElementTree as ET
from state import save_capture

ROOT = Path(__file__).resolve().parents[1]
HOSTS = ('cheri-alliance.org', 'cheri-alliance.github.io')
UA = 'Mozilla/5.0 (compatible; CHERI-Public-Migration/0.1)'
STAMP = lambda: datetime.now(timezone.utc).isoformat()
STOP = False
def stop_capture(*_):
    global STOP
    STOP = True
def checkpoint(host, records):
    path=ROOT/'reports'/('checkpoint-'+host+'.json')
    temp=path.with_suffix('.tmp')
    temp.write_text(json.dumps(list(records.values()),indent=2)+'\n')
    temp.replace(path)


def checkpoint_is_newer(path, previous):
    # Conversion writes change index mtime without changing its acquisition baseline.
    baseline=datetime.fromisoformat(previous['run_at']).timestamp() if previous.get('run_at') else 0
    return path.exists() and path.stat().st_mtime>baseline

def normalize(url):
    p = urlsplit(url)
    if p.scheme not in ('http', 'https') or p.hostname not in HOSTS: return None
    # Remove known tracking only; retain semantically significant parameters.
    query = urlencode([(k,v) for k,v in parse_qsl(p.query,keep_blank_values=True) if not k.startswith('utm_') and k not in ('fbclid','gclid')])
    return urlunsplit(('https', p.hostname, p.path or '/', query, ''))


def kind(url):
    p=urlsplit(url)
    if any(x in p.path for x in ('/wp-admin', '/wp-login', '/xmlrpc.php')):return 'excluded'
    # Captured page/member-resource and REST-index 401s; do not infer other namespace access.
    if p.hostname=='cheri-alliance.org' and (p.path.rstrip('/')=='/wp-json' or p.path.startswith(('/wp-json/wp/v2/pages/','/wp-json/wp/v2/member/'))):return 'restricted-api'
    suffix=Path(p.path).suffix.lower()
    if suffix and suffix not in ('.html','.htm','.php','.xml'):return 'asset'
    query=dict(parse_qsl(p.query,keep_blank_values=True))
    if query and not set(query)<= {'page','paged','p','cat','tag','year','monthnum','m','author','s'}:return 'excluded'
    return 'page'


def request(url):
    with urlopen(Request(url, headers={'User-Agent': UA}), timeout=30) as r:
        body=r.read(25*1024*1024+1)
        if len(body)>25*1024*1024: raise ValueError('Response exceeds 25 MiB capture limit; not saved truncated')
        return r.status, r.url, r.headers.get('Content-Type',''), body


def write_csv(path, rows, fields):
    with path.open('w', newline='') as f:
        w=csv.DictWriter(f,fields,extrasaction='ignore'); w.writeheader(); w.writerows(rows)


def run_site(host, records, limit, deadline):
    directory=ROOT/'sources'/host; directory.mkdir(parents=True,exist_ok=True)
    robot=RobotFileParser(); robot.set_url(f'https://{host}/robots.txt')
    robots_ok=False; extra_delay=0
    try:
        _,_,_,body=request(robot.url); (directory/'robots.txt').write_bytes(body)
        robot.parse(body.decode(errors='replace').splitlines()); robots_ok=True
        # Conservatively honor this site's crawl-delay even before User-agent.
        values=re.findall(r'^Crawl-delay:\s*(\d+)',body.decode(errors='replace'),re.M|re.I)
        extra_delay=max([int(v) for v in values] or [0])
    except HTTPError as e:
        if e.code==404: robot.parse([]); robots_ok=True
        else: print(host,'robots failed',e,flush=True)
    except Exception as e: print(host,'robots failed',e,flush=True)
    if not robots_ok:
        return records, {'host':host,'reason':'robots.txt access unresolved; crawl not attempted','converged':False}
    def priority(u):
        row=records[u]
        return (0 if row.get('snapshot_path') else 3 if '/wp-json/' in urlsplit(u).path else 2 if urlsplit(u).query else 1, u)
    queue=[priority(u) for u in records];heapq.heapify(queue);attempts=0
    def discover(url, parent, evidence):
        u=normalize(url)
        if not u or urlsplit(u).hostname!=host: return
        if u not in records:
            records[u]={'url':u,'source_site':host,'parent_url':None,'discovered_from':parent,'discovery_method':evidence,
                        'fetch_status':'discovered','conversion_status':'unprocessed','verification_status':'unverified'}
            heapq.heappush(queue,priority(u))
    for path in ['/sitemap.xml','/sitemap_index.xml','/wp-sitemap.xml']:
        discover(f'https://{host}{path}',None,'sitemap_probe')
    for u in robot.site_maps() or []: discover(u,robot.url,'robots_sitemap')
    pos=0; last_checkpoint=-1
    while queue and not STOP and time.monotonic()<deadline:
        if attempts != last_checkpoint and attempts % 25 == 0:
            checkpoint(host,records); last_checkpoint=attempts
        _,url=heapq.heappop(queue);pos+=1; row=records[url]
        category=kind(url);row['content_type']=category
        if category!='page':
            if category=='restricted-api':
                if row.get('fetch_status')!='failed':row.update(fetch_status='excluded-with-reason',reason_if_unresolved='WordPress REST family returned HTTP 401; using public HTML instead of authenticated endpoints')
            elif category=='excluded':row.update(fetch_status='excluded-with-reason',reason_if_unresolved='Authentication/admin or unsupported query route excluded from public crawl')
            else:
                if row.get('fetch_status')=='excluded-with-reason' and 'unsupported query' in row.get('reason_if_unresolved',''):row.update(fetch_status='discovered',reason_if_unresolved='Versioned public asset; acquisition pending')
                row.setdefault('reason_if_unresolved','Asset acquisition pending')
            continue
        if row.get('snapshot_path') and (ROOT/row['snapshot_path']).exists():
            body=(ROOT/row['snapshot_path']).read_bytes(); final=row.get('final_url',url); ct=row.get('http_content_type','')
            if hashlib.sha256(body).hexdigest()!=row['sha256']: raise ValueError(f'Capture checksum mismatch: {url}')
        else:
            if row.get('fetch_status')=='failed' or row.get('declared_alias_target'): continue
            if not robot.can_fetch(UA,url):
                row.update(fetch_status='excluded-with-reason',reason_if_unresolved='Disallowed by robots.txt');continue
            if attempts>=limit:
                row['reason_if_unresolved']='Not fetched: bounded response request budget exhausted'
                continue
            time.sleep(max(0.35,extra_delay,robot.crawl_delay(UA) or 0));attempts+=1
            try:
                code,final,ct,body=request(url)
                snapshot=directory/(hashlib.sha256(url.encode()).hexdigest()+('.xml' if 'xml' in ct else '.html'))
                snapshot.write_bytes(body)
                row.update(http_status=code,final_url=final,http_content_type=ct,snapshot_path=str(snapshot.relative_to(ROOT)),
                           sha256=hashlib.sha256(body).hexdigest(),retrieved_at=STAMP(),fetch_status='fetched',reason_if_unresolved='Conversion and rendered validation pending')
            except Exception as e:
                row.update(fetch_status='failed',http_status=getattr(e,'code',None),reason_if_unresolved=f'{type(e).__name__}: {e}',retrieved_at=STAMP());continue
        if 'xml' in ct or urlsplit(url).path.endswith('.xml'):
            try:
                tree=ET.fromstring(body)
                for item in tree.iter():
                    if item.tag.split('}')[-1]=='loc' and item.text: discover(item.text,url,'xml_sitemap')
                    if item.tag.split('}')[-1] in ('link','guid') and item.text and item.text.strip().startswith(('https://','http://')):discover(item.text.strip(),url,'public_feed')
                    if item.tag.split('}')[-1]=='link' and item.get('href'):discover(item.get('href'),url,'public_feed')
                row['content_type']='sitemap' if tree.tag.split('}')[-1] in ('sitemapindex','urlset') else 'feed'
            except ET.ParseError: row['reason_if_unresolved']='Invalid XML response'
            continue
        if 'html' not in ct:
            row['content_type']='asset'; continue
        soup=BeautifulSoup(body,'html.parser')
        row['title']=soup.title.get_text(' ',strip=True) if soup.title else ''
        canonical=soup.select_one('link[rel="canonical"]')
        row['canonical_url']=urljoin(final,canonical.get('href')) if canonical and canonical.get('href') else final
        for declaration in soup.select('link[rel=shortlink][href]'):
            alias=normalize(urljoin(final,declaration['href']))
            if alias and urlsplit(alias).hostname==host:
                discover(alias,url,'source_declared_shortlink')
                if not records[alias].get('snapshot_path'):
                    records[alias].update(fetch_status='excluded-with-reason',declared_alias_target=row['canonical_url'],alias_evidence_path=row['snapshot_path'],reason_if_unresolved='Source-declared shortlink alias; own HTTP response not fetched; canonical source retained separately')
        # Link parent is discovery provenance, never asserted to be navigation hierarchy.
        for element in soup.select('a[href], img[src], link[href], source[src], iframe[src], video[src], audio[src]'):
            value=element.get('href') or element.get('src')
            discover(urljoin(final,value),url,'html_link' if element.name=='a' else 'html_asset')
        for element in soup.select('[data-src],[data-original]'):
            discover(urljoin(final,element.get('data-src') or element.get('data-original')),url,'lazy_asset')
        css_text='\n'.join(e.get('style','') for e in soup.select('[style]'))+'\n'+'\n'.join(e.get_text() for e in soup.select('style'))
        for reference in re.findall(r'url\(\s*[\"\']?([^\)\"\']+)',css_text):discover(urljoin(final,reference.strip()),url,'css_background')
        for element in soup.select('[srcset]'):
            for candidate in element['srcset'].split(','): discover(urljoin(final,candidate.strip().split()[0]),url,'srcset')
        if attempts and attempts%25==0 and category=='page': print(host,'requests',attempts,'discovered',len(records),flush=True)
    checkpoint(host,records)
    pending=[r for r in records.values() if r.get('fetch_status')=='discovered' and kind(r['url'])=='page' and not r.get('declared_alias_target')]
    return records, {'host':host,'requests_this_run':attempts,'queue_remaining':len(pending),'public_html_queue_remaining':sum('/wp-json/' not in urlsplit(r['url']).path for r in pending),'queue_records_remaining':len(queue),'converged':not pending and not queue,
                     'limitation':'Static HTML/link/XML discovery only; JavaScript, exports, external assets and query routes require follow-up'}


def main():
    parser=argparse.ArgumentParser();parser.add_argument('--limit-per-site',type=int,default=250);parser.add_argument('--time-budget',type=int,default=600);args=parser.parse_args()
    signal.signal(signal.SIGTERM,stop_capture);signal.signal(signal.SIGINT,stop_capture)
    deadline=time.monotonic()+args.time_budget
    index=ROOT/'reports'/'capture-index.json'
    previous=json.loads(index.read_text()) if index.exists() else {'records':[]}
    by_host={host:{} for host in HOSTS}
    for row in previous['records']: by_host[row['source_site']][row['url']]=row
    for host in HOSTS:
        path=ROOT/'reports'/('checkpoint-'+host+'.json')
        if checkpoint_is_newer(path,previous):
            for row in json.loads(path.read_text()):by_host[host][row['url']]=row
    for host in HOSTS:
        records=by_host[host]
        for source in list(records.values()):
            target=normalize(source.get('final_url',''))
            if source.get('snapshot_path') and target and target!=source['url']:
                destination=records.setdefault(target,{'url':target,'source_site':host,'parent_url':None,'discovery_method':'http_redirect','discovered_from':source['url'],'conversion_status':'unprocessed','verification_status':'unverified'})
                if not destination.get('snapshot_path'):
                    for key in ['snapshot_path','sha256','http_status','http_content_type','final_url','retrieved_at','title','canonical_url']:destination[key]=source.get(key)
                    destination.update(fetch_status='fetched',capture_requested_url=source['url'],reason_if_unresolved='Actual HTTP redirect target response reused; conversion pending')
        for source in list(records.values()):
            if not source.get('snapshot_path') or 'html' not in source.get('http_content_type',''):continue
            soup=BeautifulSoup((ROOT/source['snapshot_path']).read_bytes(),'html.parser')
            for declaration in soup.select('link[rel=shortlink][href]'):
                alias=normalize(urljoin(source.get('final_url',source['url']),declaration['href']))
                target=normalize(source.get('canonical_url') or source.get('final_url') or source['url'])
                if alias and target and alias in records and not records[alias].get('snapshot_path'):
                    records[alias].update(fetch_status='excluded-with-reason',declared_alias_target=target,alias_evidence_path=source['snapshot_path'],reason_if_unresolved='Source-declared shortlink alias; own HTTP response not fetched; canonical source retained separately')
    seed=json.loads((ROOT/'CHERI_SITE_INVENTORY.json').read_text())
    for item in seed['pages']:
        u=normalize(item['url']);host=urlsplit(u).hostname
        by_host[host].setdefault(u,{'url':u,'source_site':host,'title':item['title'],'provisional_section':item['section'],
                                   'discovery_method':'provisional_inventory','parent_url':None,'fetch_status':'discovered',
                                   'conversion_status':'unprocessed','verification_status':'unverified'})
    with ThreadPoolExecutor(max_workers=2) as pool:
        futures=[pool.submit(run_site,h,by_host[h],args.limit_per_site,deadline) for h in HOSTS]
        results=[f.result() for f in futures]
    rows=sorted([r for records,_ in results for r in records.values()],key=lambda r:r['url'])
    run={'run_at':STAMP(),'sites':[summary for _,summary in results]}
    history=previous.get('runs',[{'run_at':previous.get('run_at'),'sites':previous.get('sites',[])}] if previous.get('run_at') else [])
    data={**run,'complete':False,'runs':history+[run],'records':rows}
    data=save_capture(data);rows=data['records']
    write_csv(ROOT/'reports'/'url-inventory.csv',rows,['source_site','url','canonical_url','title','parent_url','discovered_from','discovery_method','content_type','http_status','fetch_status','conversion_status','verification_status','local_path','reason_if_unresolved'])
    write_csv(ROOT/'reports'/'source-manifest.csv',[r for r in rows if r.get('snapshot_path')],['source_site','url','final_url','capture_requested_url','snapshot_path','retrieved_at','sha256','http_status','http_content_type'])
    (ROOT/'sitemap.json').write_text(json.dumps(rows,indent=2)+'\n')
    print(json.dumps({'sites':data['sites'],'records':len(rows),'fetched':sum(r['fetch_status']=='fetched' for r in rows),'failed':sum(r['fetch_status']=='failed' for r in rows)},indent=2))

if __name__=='__main__': main()
