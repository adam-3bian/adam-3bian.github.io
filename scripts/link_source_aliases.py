#!/usr/bin/env python3
"""Point known legacy topic/profile links at their canonical local counterparts."""
import html,json,re
from pathlib import Path
from urllib.parse import urlsplit
import yaml
from capture import ROOT
from site_model import canonical_url
routes=json.loads((ROOT/'reports/route-map.json').read_text());config=yaml.safe_load((ROOT/'_config.yml').read_text());aliases={}
def add(source,target,reason):
    assert target.startswith('/')
    aliases[source]={'target':target,'evidence':reason}
gh='https://cheri-alliance.github.io';wp='https://cheri-alliance.org'
# Published member profiles use one canonical organisation identity across the sources.
for file in (ROOT/'_organisations').glob('*.md'):
    meta=yaml.safe_load(file.read_text().split('---',2)[1])
    if meta.get('member') is True:
        add(wp+'/member/'+file.stem+'/', '/organisations/'+file.stem+'/', 'Same named member organisation and canonical profile')
for old,target in [('bt','bt-group'),('university-of-birmingham-centre-for-cyber-security-and-privacy','university-of-birmingham')]:
    add(wp+'/member/'+old+'/', '/organisations/'+target+'/', 'Published member name variant of the same institution')
    add(gh+'/members/'+old+'/', '/organisations/'+target+'/', 'Legacy profile slug of the same published institution')
for source,target in {
 gh+'/alliance/about-and-governance/working-groups/':'/alliance/leadership/working-groups/',
 gh+'/adopt/business-case/lifecycle-benefits-and-roi/':'/adopt/business-case/return-on-security-investment/',
 gh+'/discover/why-cheri/faqs/':'/discover/understand/faq/',
 gh+'/discover/why-cheri/faq':'/discover/understand/faq/',
 gh+'/discover/why-cheri/cheri-and-existing-software/':'/discover/understand/cheri-and-existing-software/',
 gh+'/discover/why-memory-safety/approaches-to-memory-safety/':'/discover/why-cheri/approaches-to-memory-safety/',
 gh+'/alliance/legal-and-policies/trademark-and-brand-use/':'/policies/trademark-policy/',
 gh+'/events/cheri-tech-conference-2025/':'/events/cheritech25/',
 gh+'/events/cheri-blossoms-conference-2026-intro-to-cheri-and-cheriot/':'/events/cheri-blossoms-tutorial-2026/',
 wp+'/contact/':'/alliance/membership/contact/',
 wp+'/members/':'/alliance/leadership/members/',
 wp+'/cheri-enabled/':'/adopt/assurance-and-adoption/about-cheri-enabled/',
 wp+'/discover-cheri/cheri-products/morello/':'/hardware/morello/',
 wp+'/discover-cheri/cheri-products/':'/build/platforms/cheri-products/',
 wp+'/legal-and-policies/trademark-policy/':'/policies/trademark-policy/',
}.items():add(source,target,'Legacy spelling/section of the same published topic or event; use its existing canonical page')
for file in (ROOT/'_groups').glob('*.md'):
    for base in [gh+'/alliance/about-and-governance/working-groups/',wp+'/who-we-are/working-groups/']:
        add(base+file.stem+'/', '/groups/'+file.stem+'/', 'Same named working group')
observed=set()
for evidence in (ROOT/'reports/validation').glob('*/source-signature.json'):
    observed.update(url for url,label in json.loads(evidence.read_text())['links'])
aliases={source:proof for source,proof in aliases.items() if source in observed}
for source,proof in aliases.items():routes[source]=proof['target']
files=list((ROOT/'pages').rglob('*.md'))
for name in config['collections']:files+=list((ROOT/('_'+name)).glob('*.md'))
changed=0
for file in files:
    text=file.read_text();updated=re.sub(r'(\]\()([^\n)]+)(\))',lambda m:m[1]+canonical_url(m[2],routes)+m[3],text)
    if text!=updated:file.write_text(updated);changed+=1
(ROOT/'reports/route-map.json').write_text(json.dumps(routes,indent=2)+'\n')
(ROOT/'reports/source-route-aliases.json').write_text(json.dumps(aliases,indent=2)+'\n')
print(f'{len(aliases)} published profile/topic aliases resolved; {changed} Markdown files now use canonical local links.')
