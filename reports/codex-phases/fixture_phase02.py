#!/usr/bin/env python3
"""Create an isolated native-Jekyll fixture using actual repository components/media.

Migration Python: fixture_phase02.py /tmp/cheri-phase2-fixture
Build the generated source separately. Nothing is added to the published site.
"""
import json
import re
import shutil
import sys
from pathlib import Path
import yaml

ROOT = Path(__file__).resolve().parents[2]
TARGET = Path(sys.argv[1]).resolve() / 'source'
TARGET.mkdir(parents=True, exist_ok=False)
for folder in ['_includes', '_layouts', '_sass', '_data']:
    shutil.copytree(ROOT / folder, TARGET / folder)
# Genuine immutable files, including exact fonts/brand/background assets.
shutil.copytree(ROOT / 'assets', TARGET / 'assets')
shutil.copyfile(ROOT / 'favicon.ico', TARGET / 'favicon.ico')
config = yaml.safe_load((ROOT / '_config.yml').read_text())
config['baseurl'] = '/cheri-preview'
(TARGET / '_config.yml').write_text(yaml.safe_dump(config, sort_keys=False))
paths = ['_people/robert-watson.md', '_people/anthony-fox.md', '_organisations/codasip.md',
         '_news/one-bug-is-all-it-takes.md', '_papers/cheri-concentrate-practical-compressed-capabilities.md']
raw_cards = []
for path in paths:
    text = (ROOT / path).read_text()
    _, front, body = text.split('---', 2)
    meta = yaml.safe_load(front)
    collection = path.split('/')[0][1:]
    url = config['collections'][collection]['permalink'].replace(':name', Path(path).stem)
    raw_cards.append({'title': meta['title'], 'url': url, 'collection': collection, 'content': body})
    (TARGET / path).parent.mkdir(exist_ok=True)
    (TARGET / path).write_text(text)
portrait = re.search(r'!\[([^\]]*)\]\((/assets/[^)]+)\)', raw_cards[0]['content'])
photo = re.search(r'!\[([^\]]*)\]\((/assets/[^)]+)\)', raw_cards[3]['content'])
logo = re.search(r'!\[([^\]]*)\]\((/assets/[^)]+)\)', raw_cards[2]['content'])
fields = {'title': 'Component verification', 'permalink': '/component-check/', 'layout': 'component-check',
          'hero': False, 'raw-cards': raw_cards,
          'edge-cards': [
              {'url': raw_cards[0]['url'], 'title': 'LongUnbrokenTitle' * 12},
              {'url': raw_cards[3]['url'], 'title': raw_cards[3]['title'],
               'thumbnail': {'src': photo[2], 'alt': photo[1], 'fit': 'contain', 'position': 'right'}},
              {'url': 'https://github.com/CHERI-Alliance', 'title': 'CHERI Alliance on GitHub', 'target': '_blank', 'rel': 'nofollow'},
              {'url': raw_cards[2]['url'], 'thumbnail': {'src': logo[2], 'alt': ''}}],
          'where-next': {'url': raw_cards[0]['url'], 'description': 'This description must never render in Where next.',
                         'image': {'src': portrait[2], 'alt': portrait[1], 'fit': 'contain'}},
          'related-pages': [{'url': c['url']} for c in raw_cards[:2]]}
(TARGET / 'component-check.md').write_text('---\n' + yaml.safe_dump(fields, sort_keys=False, width=10000) + '---\n\n# Component verification\n\nExisting components and authentic images, tested outside the published source.\n')
layout = '''---
layout: default
---
{{ content }}
{% assign all_pages = site.html_pages | concat: site.documents %}
{% assign check_cards = site.people | concat: site.organisations | concat: site.news | concat: site.papers %}
<section id="raw-cards"><h2>Markdown-stage records</h2>
{% include listing.html items=page.raw-cards columns=3 label='Markdown records' %}</section>
<section id="columns-2"><h2>Two columns</h2>
{% include listing.html items=check_cards columns=2 label='Two columns' %}</section>
<section id="columns-3"><h2>Three columns</h2>
{% include listing.html items=check_cards columns=3 label='Three columns' %}</section>
<section id="columns-4"><h2>Four columns</h2>
{% include listing.html items=check_cards columns=4 label='Four columns' %}</section>
<section id="edge-cards"><h2>Long titles and explicit link/image settings</h2>
{% include listing.html items=page.edge-cards resolve=true columns=3 label='Edge cases' %}</section>
<section id="image-cases"><h2>Image alignment and captions</h2>
<p><img class="image-left" src="{{ 'PHOTO' | relative_url }}" alt="PHOTO_ALT" data-caption="Original image in a left-aligned frame"></p>
<p>Left image and surrounding text.</p>
<h3>Right image</h3>
<p><img class="image-right image-contain image-crop-right" src="{{ 'PHOTO' | relative_url }}" alt="PHOTO_ALT" data-caption="Original image in a right-aligned frame"></p>
<p>Right image and surrounding text.</p>
<h3>Full image</h3>
<p><img class="image-full" src="{{ 'PHOTO' | relative_url }}" alt="PHOTO_ALT" data-caption="Original image in a full-width frame"></p>
<p class="image-caption">The source image remains at its natural aspect ratio.</p>
<h3>Opt out of enlargement</h3>
<p><img class="image-left no-zoom" src="{{ 'PHOTO' | relative_url }}" alt="PHOTO_ALT"></p>
</section>
'''
layout = layout.replace('PHOTO_ALT', photo[1]).replace('PHOTO', photo[2])
(TARGET / '_layouts/component-check.html').write_text(layout)
print(json.dumps({'source': str(TARGET), 'genuine_records': paths, 'gallery_image': photo[2]}, indent=2))
