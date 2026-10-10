#!/usr/bin/env python3
"""Create isolated native chronology checks from genuine records: NEW_TARGET.

No fixture page, date override or deliberately missing date is published in the repo.
Build TARGET/source into TARGET/site/cheri-preview with the native bundle.
"""
import shutil
import sys
from pathlib import Path
import yaml

ROOT = Path(__file__).resolve().parents[2]
target = Path(sys.argv[1]).resolve()
target.mkdir(parents=True, exist_ok=False)
source = target / 'source'
source.mkdir()
for name in ['_includes', '_layouts', '_sass', 'assets', '_data', '_events']:
    shutil.copytree(ROOT / name, source / name)
shutil.copyfile(ROOT / 'favicon.ico', source / 'favicon.ico')
config = yaml.safe_load((ROOT / '_config.yml').read_text())
config.update({'baseurl':'/cheri-preview','time':'2027-04-24 00:30:00 +0100'})
for collection in config['collections'].values():
    collection['output'] = False
(source / '_config.yml').write_text(yaml.safe_dump(config, sort_keys=False))
(source / '_news').mkdir()
for id in ['one-bug-is-all-it-takes','a-new-etsi-standard-could-rewrite-the-memory-safety-debate',
           'beyond-software-patching','cheriot-1-0-specification-released-original']:
    shutil.copyfile(ROOT / '_news' / (id+'.md'), source / '_news' / (id+'.md'))
# Deliberately omit a date only in this isolated input to prove no build-date fallback.
_,front,body=(ROOT/'_events/webinar-cheri-cra-compliance.md').read_text().split('---',2)
unknown=yaml.safe_load(front)
unknown.pop('date')
unknown.update({'undated':True,'url':'/events/webinar-cheri-cra-compliance/','content':body})
(source/'_data/undated-event-fixture.yml').write_text(yaml.safe_dump([unknown],sort_keys=False))
(source/'_layouts/phase04-fixture.html').write_text('''---
layout: page
---
{{ content }}
{% for day in page.test_days %}
  {% for status in page.test_statuses %}
    {% include chronological-items.html items=site.events kind='events' status=status as_of=day %}
    <section data-as-of="{{ day }}" data-status="{{ status }}">
      {% include listing.html items=chronological_items kind='events' columns=3 %}
    </section>
  {% endfor %}
{% endfor %}
{% include chronological-items.html items=site.news kind='news' %}
<section id="fixture-news">{% include listing.html items=chronological_items kind='news' %}</section>
{% include chronological-items.html items=site.data.undated-event-fixture kind='events' %}
<section id="undated-event">{% include listing.html items=chronological_items kind='events' %}</section>
{% for status in page.test_statuses %}
  {% include chronological-items.html items=site.data.undated-event-fixture kind='events' status=status %}
  <section data-unknown-status="{{ status }}">{% include listing.html items=chronological_items kind='events' %}</section>
{% endfor %}
''')
days=['2026-03-25','2026-03-26','2026-03-28','2026-09-09','2026-09-10','2026-10-10',
      '2026-11-12','2026-11-13','2026-11-14','2027-04-23','2027-04-24']
front={'title':'Chronology verification','layout':'phase04-fixture','test_days':days,'test_statuses':['past','upcoming']}
(source/'index.md').write_text('---\n'+yaml.safe_dump(front,sort_keys=False)+'---\n\n# Chronology verification\n')
s=(ROOT/'pages/news-and-events/events-and-archive/upcoming-events.md').read_text()
s=s.replace('permalink: /news-and-events/events-and-archive/upcoming-events/','permalink: /empty-upcoming/')
(source/'empty-upcoming.md').write_text(s)
print(source)
