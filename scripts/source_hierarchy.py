#!/usr/bin/env python3
"""Retain explicit breadcrumbs; assign parents only when source supplies a URL."""
import json
from urllib.parse import urljoin
from bs4 import BeautifulSoup
from capture import ROOT,normalize
from state import update_conversion
index=json.loads((ROOT/'reports/capture-index.json').read_text());changes={};evidence=[]
for row in index['records']:
 if not row.get('snapshot_path') or 'html' not in row.get('http_content_type',''):continue
 soup=BeautifulSoup((ROOT/row['snapshot_path']).read_bytes(),'html.parser')
 breadcrumb=soup.select_one('nav.breadcrumbs,nav[aria-label="Breadcrumb"],nav[aria-label="breadcrumb"]')
 if breadcrumb is None:continue
 items=breadcrumb.select('li')
 labels=[el.get_text(' ',strip=True) for el in items]
 links=[normalize(urljoin(row.get('final_url',row['url']),el['href'])) for el in breadcrumb.select('a[href]')]
 links=[u for u in links if u and u!=row['url'] and u!=row.get('canonical_url')]
 change={'expected_sha256':row['sha256'],'source_breadcrumb':labels,'hierarchy_evidence_path':row['snapshot_path']}
 if links:change.update(parent_url=links[-1],hierarchy_method='explicit_breadcrumb_link')
 else:change.update(hierarchy_method='breadcrumb_labels_without_parent_url')
 changes[row['url']]=change;evidence.append({'url':row['url'],'labels':labels,'parent_url':change.get('parent_url'),'evidence_path':row['snapshot_path'],'method':change['hierarchy_method']})
update_conversion(changes)
(ROOT/'reports/hierarchy-evidence.json').write_text(json.dumps(evidence,indent=2)+'\n')
print(f'{len(evidence)} explicit breadcrumb records; {sum(bool(e["parent_url"]) for e in evidence)} source-linked parent URLs. Unlinked labels are not guessed as URLs.')
