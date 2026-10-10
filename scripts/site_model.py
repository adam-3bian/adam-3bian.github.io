"""Small shared helpers for canonical links and minimal collection metadata."""
import html,json,re
from pathlib import Path
from urllib.parse import urlsplit,urlunsplit
import yaml
ROOT=Path(__file__).resolve().parents[1]
def named_authors(citation):
    """Read named contributors before the source catalogue's publisher clause."""
    names=re.split(r'\.\s+(?:ACM|IEEE|Communications)',citation,maxsplit=1)
    if len(names)!=2:raise ValueError('Unknown citation format needs a source author audit: '+citation)
    names=re.sub(r',?\s+and others$','',names[0])
    return [re.sub(r'^and\s+','',name.strip()) for name in re.split(r',\s*|\s+and\s+',names) if name.strip()]

def document(path):
    text=(ROOT/path).read_text();_,front,body=text.split('---',2)
    return yaml.safe_load(front),body.lstrip('\n')
def canonical_url(value,routes):
    value=html.unescape(value)
    if value in routes:return routes[value]
    u=urlsplit(value)
    if not u.scheme:return value
    target=routes.get(urlunsplit((u.scheme,u.netloc,u.path,u.query,'')))
    if target is None and u.hostname in ('cheri-alliance.org','cheri-alliance.github.io'):
        target=routes.get(urlunsplit((u.scheme,u.netloc,u.path.rstrip('/')+'/',u.query,'')))
    return target+('#'+u.fragment if u.fragment else '') if target else value

def canonical_signature(source,routes):
    output=json.loads(json.dumps(source));links=[]
    for url,label in output['links']:
        url=canonical_url(url,routes)
        if links and links[-1][0]==url:links[-1][1]=re.sub(r'\s+',' ',links[-1][1]+' '+label).strip()
        else:links.append([url,label])
    output['links']=links
    return output

def collections():
    names=yaml.safe_load((ROOT/'_config.yml').read_text())['collections']
    return {name:{p.stem:{'path':str(p.relative_to(ROOT)),'meta':document(str(p.relative_to(ROOT)))[0]}
                  for p in (ROOT/('_'+name)).glob('*.md')} for name in names}
