#!/usr/bin/env python3
"""Extract the actual ZIP and prepare an independent, offline-capable reference.

Usage: python prepare_reference.py /tmp/cheri-reference
Build /tmp/cheri-reference/basic-site with the supported native Jekyll bundle.
Only font loading and a separate real-content slider fixture are adapted.
"""
import hashlib,json,re,shutil,sys,zipfile
from pathlib import Path
import yaml
ROOT=Path(__file__).resolve().parents[2]
folder=Path(sys.argv[1]);source=folder/'basic-site'
archive=ROOT/'docs/references/cheri-alliance-starter-kit-simplified-authoring.zip'
with zipfile.ZipFile(archive) as z:z.extractall(folder)
settings=source/'_sass/settings.scss'
text,count=re.subn(r'\$font-stylesheet: "[^"]+";', '$font-stylesheet: "../shared/fonts/poppins-local.css";',settings.read_text())
assert count==1;settings.write_text(text)
shutil.copytree(ROOT/'assets/shared/fonts',source/'assets/shared/fonts',dirs_exist_ok=True)
meta=yaml.safe_load((ROOT/'pages/index.md').read_text().split('---',2)[1])
meta.update(layout='default',theme='dark',permalink='/real-slider/',parent=False)
meta['hero']={'size':'large','title':meta['title']}
for field in ['sections','where-next','related-pages']:meta.pop(field,None)
body='Enabled by CHERI.\n\n<div class="cards columns-3">\n<section class="card content"><h2>Protect your organisation</h2><p>For governments, insurers, banks, telcos, Cloud Service Providers (CSPs) and other technology users.</p></section>\n</div>\n'
(source/'real-slider.md').write_text('---\n'+yaml.safe_dump(meta,sort_keys=False)+'---\n'+body)
(source/'light-hub.md').write_text('---\ntitle: Discover CHERI\nparent: false\npermalink: /light-hub/\n---\n')
for slide in meta['slider']['slides']:
    path=slide['image']['src'].lstrip('/');destination=source/path;destination.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(ROOT/path,destination)
manifest={'archive_sha256':hashlib.sha256(archive.read_bytes()).hexdigest(),'reference_source':str(source),
          'adaptations':['Local copies of the same Poppins faces','Separate real-slider fixture with authentic slide data/images','Light hub fixture without breadcrumbs, matching the real hub hierarchy'],
          'fixture_sha256':hashlib.sha256((source/'real-slider.md').read_bytes()).hexdigest()}
(Path(__file__).with_name('evidence')/'reference-inputs.json').write_text(json.dumps(manifest,indent=2)+'\n')
print(source)
