#!/usr/bin/env python3
"""Check the independent pre-migration glossary and redirect contract."""
import argparse
import json
from pathlib import Path
from check_content import ROOT, document
from lxml import html


def check(site=None, baseurl=''):
    baseline = json.loads((ROOT / 'scripts/fixtures/refinement-baseline.json').read_text())
    actual = []
    for path in sorted((ROOT / '_glossary').glob('*.md')):
        fm, body = document(path)
        assert set(fm) <= {'title', 'anchor', 'link'}, f'Unnecessary glossary fields: {path}'
        actual.append({'title': fm['title'], 'anchor': fm['anchor'], 'link': fm.get('link'), 'definition': body.strip()})
    assert actual == baseline['glossary'], 'Glossary wording, order, anchors or destinations changed'
    redirects = {}
    for path in (ROOT / 'pages/native-redirects').rglob('*.md'):
        fm, body = document(path)
        assert fm['layout'] == 'redirect' and not body.strip(), path
        redirects[fm['permalink']] = fm['redirect']
    assert redirects == baseline['redirects'], 'Redirect route/destination map changed'
    assert not list((ROOT / 'pages').rglob('*.html')), 'Page sources should be Markdown'
    if site:
        tree = html.parse(str(site / 'discover/resources/glossary/index.html'))
        entries = tree.xpath('//*[@data-glossary-entry]')
        assert len(entries) == len(actual)
        for term, entry in zip(baseline['glossary'], entries):
            definition = ' '.join(entry.xpath('./dd')[0].text_content().split())
            assert definition == ' '.join(term['definition'].split()), term['title']
            assert entry.xpath('./dt')[0].get('id') == term['anchor']
            links = entry.xpath('./dt/dfn/a/@href')
            assert links == ([baseurl + term['link']] if term['link'] else []), term['title']
            assert not (site / 'glossary' / term['anchor'] / 'index.html').exists()
        for route, target in redirects.items():
            filename = route.lstrip('/') + ('index.html' if route.endswith('/') else '')
            redirect = html.parse(str(site / filename))
            assert redirect.xpath('//meta[@http-equiv="refresh"]/@content') == ['0;url=' + baseurl + target], route
            assert redirect.xpath('//body//a/@href') == [baseurl + target], route
    print(json.dumps({'glossary_terms':len(actual), 'preserved_term_links':sum(bool(t['link']) for t in actual), 'redirects':len(redirects), 'rendered':bool(site)}))


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--site', type=Path)
    parser.add_argument('--baseurl', default='')
    args = parser.parse_args()
    check(args.site, args.baseurl.rstrip('/'))
