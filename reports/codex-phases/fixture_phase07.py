#!/usr/bin/env python3
"""Exercise the actual native URL include outside the repository content tree."""
import json
from pathlib import Path
import shutil
import subprocess
from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parents[2]
OUT = Path(__file__).with_name('phase-07-evidence')
fixture = Path('/tmp/cheri-phase7-url-fixture')
(fixture / '_includes').mkdir(parents=True, exist_ok=True)
shutil.copyfile(ROOT / '_includes/content-urls.html', fixture / '_includes/content-urls.html')
(fixture / '_config.yml').write_text("baseurl: /cheri-preview\n")
sample = '''<a id="root" href="/news/?q=a&amp;x=b#news">News</a>
<a id="prefixed" href="/cheri-preview/news/">News</a>
<a id="prefix-query" href="/cheri-preview?q=yes">Home</a>
<a id="prefix-fragment" href="/cheri-preview#title">Home</a>
<a id="similar-prefix" href="/cheri-preview-other/">Other path</a>
<a id="relative" href="../news/">Relative</a>
<a id="fragment" href="#title">Fragment</a>
<a id="external" href="https://example.com/news/">External</a>
<a id="protocol" href="//example.com/news/">Protocol relative</a>
<a id="mail" href="mailto:example@example.com">Email</a>
<a id="single" href='/papers/'>Single quote</a>
<img id="image" src="/assets/example.png" alt='Literal href="/leave-this/"'>
<video id="media" poster="/assets/poster.png"><source id="source" src="/assets/movie.mp4"></video>
<p>Literal href="/leave-this/"</p>
<pre><code>&lt;a href="/leave-this/"&gt;Example&lt;/a&gt;</code></pre>
'''
(fixture / 'index.html').write_text('---\nlayout: null\n---\n{% capture example %}' + sample + '{% endcapture %}{% include content-urls.html content=example %}')
expected = {'root': '/cheri-preview/news/?q=a&x=b#news', 'prefixed': '/cheri-preview/news/',
    'prefix-query': '/cheri-preview?q=yes', 'prefix-fragment': '/cheri-preview#title',
    'similar-prefix': '/cheri-preview/cheri-preview-other/', 'relative': '../news/', 'fragment': '#title',
    'external': 'https://example.com/news/', 'protocol': '//example.com/news/', 'mail': 'mailto:example@example.com',
    'single': '/cheri-preview/papers/', 'image': '/cheri-preview/assets/example.png',
    'media': '/cheri-preview/assets/poster.png', 'source': '/cheri-preview/assets/movie.mp4'}
checks = []
for prefix in ['/cheri-preview', '']:
    target = fixture.with_name(fixture.name + ('-project' if prefix else '-root'))
    result = subprocess.run(['sh', '/workspace/cheri-native-bundle.sh', 'exec', 'jekyll', 'build', '--safe',
        '--source', str(fixture), '--destination', str(target), '--baseurl', prefix], cwd=ROOT, text=True, capture_output=True, check=True)
    soup = BeautifulSoup((target / 'index.html').read_text(), 'html.parser')
    original = BeautifulSoup(sample, 'html.parser')
    for id, value in expected.items():
        node = soup.find(id=id)
        attribute = 'src' if id in ['image', 'source'] else 'poster' if id == 'media' else 'href'
        wanted = value if prefix else original.find(id=id)[attribute]
        checks.append({'prefix': prefix, 'id': id, 'correct': node[attribute] == wanted})
    checks.append({'prefix': prefix, 'case': 'escaped code, prose and alt untouched',
        'correct': soup.pre.get_text() == original.pre.get_text() and soup.p.get_text() == original.p.get_text() and soup.img['alt'] == original.img['alt']})
(OUT / 'url-fixture.json').write_text(json.dumps(checks, indent=2) + '\n')
assert all(r['correct'] for r in checks)
print(f'{len(checks)} native root/prefix URL and content fixture checks pass.')
