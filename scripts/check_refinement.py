#!/usr/bin/env python3
"""Check the independent pre-migration glossary and redirect contract."""
import argparse
import json
from pathlib import Path
from check_content import ROOT, document
from lxml import html
import yaml


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
    talk_count = None
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
        talks = yaml.safe_load((ROOT / '_data/talks.yml').read_text())
        seen = set()
        for collection in ['people', 'events']:
            for filename in (site / collection).glob('*/index.html'):
                slug = filename.parent.name
                expected_talks = [t for t in talks if (slug in t.get('speakers', []) if collection == 'people' else t.get('event') == slug)]
                rendered = html.parse(str(filename)).xpath('//*[@data-talk-id]')
                assert [node.get('data-talk-id') for node in rendered] == [t['id'] for t in expected_talks], filename
                for talk, node in zip(expected_talks, rendered):
                    seen.add(talk['id'])
                    assert node.xpath('.//h3/text()') == [talk['title']], talk['id']
                    assert node.xpath('.//time/@datetime') == [talk['date']], talk['id']
                    destinations = [link['url'] for link in talk.get('links', [])]
                    if talk.get('event'):
                        destinations.append('/events/' + talk['event'] + '/')
                    destinations = [baseurl + u if u.startswith('/') else u for u in destinations]
                    single = len(set(destinations)) == 1
                    assert sorted(node.xpath('.//a/@href')) == sorted(set(destinations) if single else destinations), talk['id']
                    assert bool(node.xpath('./a')) == single, talk['id']
                    assert not node.xpath('.//a//a | .//a//button'), talk['id']
                    visible = ' '.join(node.text_content().split())
                    for value in [talk.get('event_title', ''), talk.get('location', '')] + [l['label'] for l in talk.get('links', [])]:
                        assert ' '.join(value.split()) in visible, (talk['id'], value)
        assert seen == {t['id'] for t in talks}, 'A canonical talk stopped rendering'
        talk_count = len(seen)
    print(json.dumps({'glossary_terms':len(actual), 'preserved_term_links':sum(bool(t['link']) for t in actual), 'redirects':len(redirects), 'rendered_talks':talk_count, 'rendered':bool(site)}))


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--site', type=Path)
    parser.add_argument('--baseurl', default='')
    args = parser.parse_args()
    check(args.site, args.baseurl.rstrip('/'))
