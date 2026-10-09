#!/usr/bin/env python3
"""Assign image roles from retained rendered geometry and media-block structure."""
import hashlib,json
from urllib.parse import urljoin
from bs4 import BeautifulSoup
from capture import ROOT
path=ROOT/'reports/layout-decisions.json';decisions=json.loads(path.read_text()) if path.exists() else {};unresolved=[]
for row in json.loads((ROOT/'reports/browser/index.json').read_text()):
 if row['status']!='captured':continue
 folder=ROOT/row['evidence_path'];info=json.loads((folder/'source-layout.json').read_text());dom=BeautifulSoup((folder/'rendered-dom.html').read_text(),'html.parser');page={}
 for im in info['images']:
  r=im['rect'];body=im['body_rect'];classes=im['parent_classes'];role=None;rationale=None;inline=False
  if im['style']['float'] in {'left','right'}:role='image-'+im['style']['float'];rationale='Source computed CSS float'
  elif any(c.startswith('entity-media--') for c in classes) and r['x']+r['width']<=body['x']+3:role='image-left';rationale='Rendered entity media sidebar is to the left of the entity body'
  elif 'collection-detail__lead-image' in classes:role='image-full';rationale='Rendered article hero occupies its own full content media block'
  else:
   node=next((n for n in dom.select('main img[src]') if urljoin(info['final_url'],n['src'])==im['url']),None)
   if node and not node.parent.get_text(strip=True) and node.parent.name in {'figure','a','p','div','td','th'}:
    role='image-full';rationale='Rendered non-floating image occupies a separate media block; retain intrinsic size with max-width rather than stretching'
   elif node and node.parent.name in {'p','li','h1','h2','h3','h4','h5','h6'} and im['style']['display']=='inline':
    inline=True;role='image-left' if r['x']+r['width']/2<=im['parent']['x']+im['parent']['width']/2 else 'image-right';rationale='Rendered inline image is on the '+role.split('-')[1]+' side of its text container; image-inline preserves original inline flow rather than floating'
  if role:page[im['url']]={'class':role,'rationale':rationale,'evidence_path':str((folder/'source-layout.json').relative_to(ROOT)),'geometry':r,'inline':inline}
  else:unresolved.append({'url':info['url'],'asset_url':im['url'],'parent_classes':classes,'geometry':r,'inline':inline})
 decisions[info['url']]=page
path.write_text(json.dumps(decisions,indent=2)+'\n');(ROOT/'reports/layout-unresolved.json').write_text(json.dumps(unresolved,indent=2)+'\n');print(f'{len(decisions)} rendered pages classified; {len(unresolved)} image roles unresolved.')
