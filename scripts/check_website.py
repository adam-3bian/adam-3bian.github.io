#!/usr/bin/env python3
"""Validate the published website independently of retained source versions."""
import json
import re
import os
from datetime import datetime, date
from zoneinfo import ZoneInfo
from urllib.error import HTTPError
from urllib.parse import urlsplit, unquote
from urllib.request import urlopen
from xml.etree import ElementTree
from bs4 import BeautifulSoup
from site_model import ROOT, collections, document
from site_server import SITE, metadata, serving

config = metadata()
prefix = config['baseurl'].rstrip('/')
checks = []

def check(name, condition, detail=None):
    checks.append({'check': name, 'status': 'passed' if condition else 'failed', 'detail': detail})
    assert condition, (name, detail)

def local_target(url):
    path = unquote(urlsplit(url).path)
    assert not prefix or path == prefix or path.startswith(prefix + '/'), url
    path = path[len(prefix):] if prefix else path
    target = SITE / path.lstrip('/')
    if target.is_dir():
        target /= 'index.html'
    assert target.resolve().is_relative_to(SITE.resolve()), url
    return target

def page(path):
    return BeautifulSoup(local_target(prefix + path).read_bytes(), 'html5lib')

groups = collections()
index = json.loads((SITE / 'search-index.json').read_text())
urls = [entry['url'] for entry in index]
check('search routes are unique, titled and present', len(urls) == len(set(urls)) and all(entry['title'] and local_target(entry['url']).is_file() for entry in index), len(index))
check('search omits archived editions and error pages', not any('/reference/source-versions/' in url or url.endswith('/404.html') for url in urls))
for entry in index:
    html = BeautifulSoup(local_target(entry['url']).read_bytes(), 'html5lib')
    canonical = html.select_one('link[rel=canonical]')
    check('canonical: ' + entry['url'], canonical and canonical['href'] == config['url'] + entry['url'])
    body = html.select_one('[data-source-body]')
    for code in body.select('pre'):
        code.decompose()
    normalize = lambda value: re.sub(r'\s+', ' ', value).strip()
    check('search includes complete readable body: ' + entry['url'], normalize(entry['text']) == normalize(body.get_text(' ', strip=True)))

expected = {
    '/people/': len(groups['people']), '/organisations/': len(groups['organisations']),
    '/alliance/leadership/members/': sum(item['meta'].get('member') is True for item in groups['organisations'].values()),
    '/news-and-events/people-and-opportunities/speakers/': sum(item['meta'].get('speaker') is True for item in groups['people'].values()),
    '/news/': sum(item['meta'].get('alternate') is not True for item in groups['news'].values()),
    '/events/': len(groups['events']), '/papers/': len(groups['papers']),
    '/hardware/': len(groups['hardware']), '/software/': len(groups['software'])
}
for path, count in expected.items():
    check('directory inventory: ' + path, len(page(path).select('[data-directory-item]')) == count, count)

today = date.fromisoformat(os.environ.get('CHERI_TODAY', datetime.now(ZoneInfo('Europe/London')).date().isoformat()))
upcoming = []
past = []
for item in groups['events'].values():
    body = document(item['path'])[1]
    published = re.search(r'^Date\n: (.+)$', body, re.M)
    assert published, item['path']
    dates = re.search(r'(\d{1,2})(?:\s+(?:to|[-–])\s+(\d{1,2}))?\s+([A-Za-z]+)\s+(\d{4})', published[1])
    assert dates, published[1]
    end = datetime.strptime(f'{dates[2] or dates[1]} {dates[3]} {dates[4]}', '%d %B %Y').date()
    (past if end < today else upcoming).append(item['meta']['title'])
for status, titles in [('upcoming', upcoming), ('past', past)]:
    path = '/news-and-events/events-and-archive/' + status + '-events/'
    cards = page(path).select('[data-directory-item]')
    check('events reflect published dates: ' + status, {card.select_one('h2').get_text(strip=True) for card in cards} == set(titles), {'as_of': str(today), 'events': len(titles)})
    check('event status: ' + status, all(card['data-status'] == status for card in cards))

for edition in json.loads((ROOT / 'reports/website-editions.json').read_text()):
    meta, original = document(edition['original_markdown'])
    published_meta, published = document(edition['path'])
    check('source edition excluded from indexing: ' + edition['path'], meta.get('alternate') is True)
    if not edition['listing']:
        for before, after in edition['edits']:
            assert before in original, (edition['path'], before)
            original = original.replace(before, after)
        check('published changes match explicit editorial record: ' + edition['path'], original == published)
    else:
        intro = re.split(r'!\[', original, maxsplit=1)[0].rstrip()
        check('directory retains complete source introduction: ' + edition['path'], published.strip() == intro)
        check('directory uses canonical collection: ' + edition['path'], published_meta['listing'] == edition['listing'])

for path in ['/alliance/membership/contact/', '/news-and-events/news-and-analysis/subscribe-newsletter/']:
    form = page(path).select_one('form[data-unconnected-form]')
    check('preview form has no submission endpoint: ' + path, form and not form.get('action') and not form.get('method'))
    check('preview form cannot submit: ' + path, all(button.has_attr('disabled') for button in form.select('[type=submit]')) and bool(form.select('[type=submit]')))
    check('preview form is explained: ' + path, 'preview' in form.get_text().lower() and bool(form.select('a[href^="https://"]')))
    check('form controls are labelled: ' + path, all(form.select_one(f'label[for="{control.get("id")}"]') for control in form.select('input,select,textarea')))

check('people have reverse paper links', bool(page('/people/anthony-fox/').select('[data-relationship=papers] a[href]')))
check('profiles interlink organisations, papers and events', all(page('/people/robert-watson/').select(f'[data-relationship={kind}] a[href]') for kind in ['organization', 'papers', 'events']))
check('only governing board uses _data', {path.name for path in (ROOT / '_data').iterdir()} == {'governing-board.yml'})
locations = {node.text for node in ElementTree.parse(SITE / 'sitemap.xml').findall('.//{http://www.sitemaps.org/schemas/sitemap/0.9}loc')}
check('sitemap matches public routes', locations == {config['url'] + url for url in urls})
check('robots references deployed sitemap', 'Sitemap: ' + config['url'] + prefix + '/sitemap.xml' in (SITE / 'robots.txt').read_text())
check('static Pages artifact ready', (SITE / '.nojekyll').is_file())
with serving() as (_, base):
    try:
        urlopen(base + '/missing-page-for-validation/')
        check('missing route returns 404', False)
    except HTTPError as error:
        html = BeautifulSoup(error.read(), 'html5lib')
        check('missing route returns branded 404', error.code == 404 and html.select_one('main h1') and html.select_one('main a[href="' + prefix + '/search/"]'))
    for short, target in {'members': '/alliance/leadership/members/', 'speakers': '/news-and-events/people-and-opportunities/speakers/', 'contact': '/alliance/membership/contact/', 'subscribe': '/news-and-events/news-and-analysis/subscribe-newsletter/', 'alliance/build': '/build/'}.items():
        html = BeautifulSoup(urlopen(base + '/' + short + '/').read(), 'html5lib')
        check('compatibility redirect: ' + short, html.select_one('meta[http-equiv=refresh]')['content'] == '0;url=' + prefix + target and html.select_one('a')['href'] == prefix + target)

report = {'status': 'passed', 'baseurl': prefix, 'search_records': len(index), 'directory_counts': expected, 'events_as_of': str(today), 'upcoming_events': len(upcoming), 'past_events': len(past), 'checks': checks}
(ROOT / 'reports/website-validation.json').write_text(json.dumps(report, indent=2) + '\n')
print(f'PASS: {len(checks)} website checks; {len(index)} searchable pages; {len(upcoming)} upcoming and {len(past)} past events.')
