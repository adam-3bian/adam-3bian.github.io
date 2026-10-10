#!/usr/bin/env python3
"""Create an isolated native person-layout fixture; never edits production records.

Migration Python: fixture_phase03.py NEW_TARGET
Then build TARGET/source into TARGET/site/cheri-preview using the native bundle.
"""
import re
import shutil
import sys
from pathlib import Path
import yaml

ROOT = Path(__file__).resolve().parents[2]
target = Path(sys.argv[1]).resolve()
target.mkdir(parents=True, exist_ok=False)
source = target / 'source'
source.mkdir()
for name in ['_includes', '_layouts', '_sass', 'assets', '_data']:
    shutil.copytree(ROOT / name, source / name)
shutil.copyfile(ROOT / 'favicon.ico', source / 'favicon.ico')
config = yaml.safe_load((ROOT / '_config.yml').read_text())
config['baseurl'] = '/cheri-preview'
(source / '_config.yml').write_text(yaml.safe_dump(config, sort_keys=False))
(source / '_people').mkdir()
raw_people = []
for id in ['robert-watson', 'mike-eftimakis', 'allison-randal', 'anthony-fox']:
    _, front, body = (ROOT / '_people' / (id + '.md')).read_text().split('---', 2)
    meta = yaml.safe_load(front)
    if id in ['mike-eftimakis', 'allison-randal']:
        portrait = re.search(r'!\[([^]]*)\]\(([^)]+)\)', body)
        meta['thumbnail'] = {'src': portrait[2], 'alt': '', 'fit': 'contain', 'position': 'right'}
        if id == 'allison-randal':
            # Exercise the native metadata-only path without publishing edited text.
            body = re.sub(r'!\[[^]]*\]\([^)]+\)\{:[^}]+\}\n\{:[^}]+\}\n', '', body)
        raw_people.append({**meta, 'url': '/people/' + id + '/', 'content': body})
    (source / '_people' / (id + '.md')).write_text('---\n' + yaml.safe_dump(meta, sort_keys=False) + '---' + body)
(source / '_data' / 'phase03-fixture.yml').write_text(yaml.safe_dump(raw_people, sort_keys=False))
(source / '_layouts' / 'phase03-fixture.html').write_text('''---
layout: page
---
{{ content }}
<section id="converted-people">
{% assign board_people = site.people | where_exp: 'p', 'p.thumbnail != nil' %}
{% include listing.html items=board_people kind='people' context='governing-board' compact=false columns=2 %}
</section>
<section id="raw-people">
{% include listing.html items=site.data.phase03-fixture kind='people' context='governing-board' compact=false columns=2 %}
</section>
''')
(source / 'index.md').write_text('''---
title: People component verification
layout: phase03-fixture
---
# People component verification
''')
print(source)
