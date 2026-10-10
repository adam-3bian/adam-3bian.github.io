#!/usr/bin/env python3
"""Check every rendered local route, asset and in-page anchor."""
import json,re
from urllib.parse import urlsplit,unquote
from bs4 import BeautifulSoup
from capture import ROOT
from site_server import SITE,metadata
site=SITE;files=list(site.rglob('*.html'));errors=[];checks=0;anchors={};stylesheets=set()
baseurl=metadata()['baseurl'].rstrip('/')
def resolve(url,origin):
    parsed=urlsplit(url)
    if parsed.scheme or parsed.netloc:return None,None
    path=unquote(parsed.path)
    if path.startswith('/'):
        if baseurl:
            if path==baseurl or path.startswith(baseurl+'/'):path=path[len(baseurl):] or '/'
            else:return site/'MISSING_DEPLOYMENT_PREFIX',None
        target=site/path.lstrip('/')
    elif path:target=origin.parent/path
    else:target=origin
    target=target.resolve()
    if not target.is_relative_to(site.resolve()):return None,None
    if target.is_dir():target=target/'index.html'
    elif not target.suffix and (target/'index.html').is_file():target=target/'index.html'
    return target,unquote(parsed.fragment)
for file in files:
    soup=BeautifulSoup(file.read_bytes(),'html5lib');anchors[file.resolve()]={t['id'] for t in soup.select('[id]')}
for file in files:
    soup=BeautifulSoup(file.read_bytes(),'html5lib')
    for element in soup.select('a[href],img[src],script[src],link[href]'):
        url=element.get('href',element.get('src'))
        target,fragment=resolve(url,file)
        if target is None:continue
        if element.name=='link' and 'stylesheet' in element.get('rel',[]) and target.is_file():stylesheets.add(target)
        checks+=1
        if not target.is_file():errors.append({'path':str(file.relative_to(site)),'url':url,'reason':'missing local target'})
        elif fragment and target.suffix=='.html' and fragment not in anchors.get(target,set()):
            errors.append({'path':str(file.relative_to(site)),'url':url,'reason':'missing local anchor'})
visited=set();css_checks=0
while stylesheets:
    file=stylesheets.pop()
    if file in visited:continue
    visited.add(file)
    css=file.read_text()
    references=re.findall(r'url\(\s*[\"\']?([^\)\"\']+)',css)+re.findall(r'@import\s+[\"\']([^\"\']+)',css)
    for url in references:
        target,_=resolve(url.strip(),file)
        if target is None:continue
        css_checks+=1
        if not target.is_file():errors.append({'path':str(file.relative_to(site)),'url':url,'reason':'missing stylesheet dependency'})
        elif target.suffix=='.css':stylesheets.add(target)
report={'html_files':len(files),'local_references':checks,'active_stylesheets':len(visited),'stylesheet_references':css_checks,'errors':errors,'status':'failed' if errors else 'passed'}
(ROOT/'reports/site-link-validation.json').write_text(json.dumps(report,indent=2)+'\n')
print(f'{len(files)} HTML pages; {checks} local references; {css_checks} stylesheet dependencies; {len(errors)} errors.')
if errors:raise SystemExit(1)
