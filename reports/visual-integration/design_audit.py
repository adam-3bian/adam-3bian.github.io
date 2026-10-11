#!/usr/bin/env python3
"""Design authority and search absence: BUILT_SITE. No network or build plugins."""
from pathlib import Path
import hashlib,json,sys,zipfile
from bs4 import BeautifulSoup
import yaml
ROOT=Path(__file__).resolve().parents[2];OUT=Path(__file__).with_name('evidence');SITE=Path(sys.argv[1])
sha=lambda b:hashlib.sha256(b).hexdigest()
config=yaml.safe_load((ROOT/'_config.yml').read_text());checks=[]
with zipfile.ZipFile(ROOT/'docs/references/cheri-alliance-starter-kit-simplified-authoring.zip') as z:
    for name in z.namelist():
        path=name.removeprefix('basic-site/')
        if path.startswith(('_sass/','assets/js/','assets/images/background/','assets/images/brand/')) or path=='favicon.ico':
            p=ROOT/path
            if not p.is_file():continue
            original=z.read(name);actual=p.read_bytes()
            if path=='_sass/settings.scss':
                import re
                original=re.sub(rb'\$font-stylesheet: "[^"]+";',b'$font-stylesheet: "../shared/fonts/poppins-local.css";',original)
            if path=='_sass/_site.scss':original+=b'\n@import "site-features";\n'
            checks.append({'path':path,'zip_sha256':sha(z.read(name)),'current_sha256':sha(actual),'matches_with_documented_adapter':actual==original})
    for path in ['_includes/slider.html','_sass/_slider.scss','assets/js/slider.js']:
        assert (ROOT/path).read_bytes()==z.read('basic-site/'+path),path
assert all(r['matches_with_documented_adapter'] for r in checks),[r for r in checks if not r['matches_with_documented_adapter']]
search=[];components=[];talks=[]
for p in SITE.rglob('*.html'):
    soup=BeautifulSoup(p.read_text(),'html.parser')
    if soup.select('input[type=search],[role=search],#search-results,a[href="/search/"],script[src*=searcher],script[src*=elasticlunr]'):
        search.append(str(p.relative_to(SITE)))
    for group in soup.select('[data-section-cards]'):
        components.append({'page':str(p.relative_to(SITE)),'headings':[n.get_text(' ',strip=True) for n in group.select(':scope > section > h2')],
                           'destinations':[a['href'] for a in group.select('a[href]')]})
    for group in soup.select('[data-source-talks]'):
        talks.append({'page':str(p.relative_to(SITE)),'cards':len(group.select(':scope > li')),'titles':[h.get_text() for h in group.select('h3')]})
assert not search
assert not (SITE/'search').exists() and not list(SITE.glob('search-index*'))
excluded=[p for p in config['exclude'] if p.startswith('assets/shared/source-assets/')]
assert len(excluded)==3 and all((ROOT/p).is_file() and not (SITE/p).exists() for p in excluded)
assert len(components)==7 and len(talks)==59 and sum(r['cards'] for r in talks)==85
assert config['url']=='https://adam-3bian.github.io' and config['baseurl']==''
assert not (ROOT/'_plugins').exists() and not list((ROOT/'.github/workflows').glob('*'))
result={'zip_sha256':sha((ROOT/'docs/references/cheri-alliance-starter-kit-simplified-authoring.zip').read_bytes()),
        'design_files':checks,'section_grids':components,'talk_cards':talks,'active_search':search,'unpublished_search_sources':excluded,
        'native_pages':True,'root_url':config['url'],'baseurl':config['baseurl']}
(OUT/'design-audit.json').write_text(json.dumps(result,indent=2)+'\n')
print(f'{len(checks)} ZIP design/asset/script comparisons; {len(components)} section grids; 85 talks on 59 profiles; no search UI/index/scripts; native Pages architecture pass.')
