#!/usr/bin/env python3
"""Audit rendered associations against source records, and all local link targets.

Optional external HTTP checks are reported separately: remote outages, rate
limits and bot restrictions must not make an otherwise valid Pages build fail.
"""
import argparse
import collections
import concurrent.futures
import json
import http.client
import re
import threading
import urllib.error
import urllib.request
from pathlib import Path
from urllib.parse import quote, unquote, urljoin, urlsplit, urlunsplit

from lxml import html
from check_spec import TYPES, ROOT, load, validate_source


def associations(records, kind, record):
    """Compute expected destinations independently of the Liquid templates."""
    slug = record['slug']
    expected = {}

    def entries(collection):
        return [data for _, data, _ in records[collection].values()]

    def add(section, items):
        expected[section] = [item['permalink'] for item in items]

    def resolve(collection, refs):
        return [records[collection][ref][1] for ref in dict.fromkeys(refs)]

    def references(data, group, field, key):
        return [ref[key] for ref in data.get(group, {}).get(field, []) if ref.get(key)]

    next_items = []
    if kind == 'posts':
        items = [item for item in entries('posts') if item['slug'] != slug
                 and item.get('sitemap') is not False
                 and item['post']['category'] == record['post']['category']]
        next_items = sorted(items, key=lambda item: item['date'], reverse=True)[:3]
    if kind == 'people':
        add('groups-title', [item for item in entries('groups') if slug in references(item, 'working_group', 'leads', 'person')])
        add('events-title', [item for item in entries('events') if slug in references(item, 'event', 'speakers', 'person')])
        add('papers-title', [item for item in entries('papers') if slug in references(item, 'publication', 'authors', 'person')])
        add('posts-title', [item for item in entries('posts') if item.get('sitemap') is not False and slug in references(item, 'post', 'authors', 'person')])
    if kind == 'organisations':
        add('people-title', [item for item in entries('people') if slug in references(item, 'person', 'organisations', 'organisation')])
        add('events-title', [item for item in entries('events') if slug in references(item, 'event', 'organisers', 'organisation') + references(item, 'event', 'partners', 'organisation')])
        add('products-title', [item for item in entries('products') if item['product'].get('manufacturer') == slug])
        add('repositories-title', [item for item in entries('repositories') if slug in references(item, 'repository', 'maintainers', 'organisation')])
        add('groups-title', [item for item in entries('groups') if item['working_group'].get('coordinator') == slug])
        add('policies-title', [item for item in entries('policies') if item['policy'].get('owner') == slug])
    if kind == 'events':
        series = record['event'].get('series')
        add('series-title', [item for item in entries('events') if series and item['event'].get('series') == series and item['slug'] != slug])
        add('organisers-title', resolve('organisations', references(record, 'event', 'organisers', 'organisation') + references(record, 'event', 'partners', 'organisation')))
    if kind == 'products':
        manufacturer = record['product'].get('manufacturer')
        add('manufacturer-title', resolve('organisations', [manufacturer] if manufacturer else []))
        add('repositories-title', resolve('repositories', references(record, 'product', 'repositories', 'repository')))
        add('guides-title', [item for item in entries('guides') if item['guide'].get('primary_product') == slug])
    if kind == 'repositories':
        add('products-title', [item for item in entries('products') if slug in references(item, 'product', 'repositories', 'repository')])
        add('maintainers-title', resolve('organisations', references(record, 'repository', 'maintainers', 'organisation')))
    for family, group, key, section in [('groups', 'working_group', 'coordinator', 'coordinator-title'), ('policies', 'policy', 'owner', 'owner-title')]:
        if kind == family:
            ref = record[group].get(key)
            add(section, resolve('organisations', [ref] if ref else []))
    related = {item['permalink']: item for item in next_items}
    for ref in record.get('related', []):
        collection = TYPES[ref['type']]
        if record.get('listing', {}).get('collection') != collection:
            target = records[collection][ref['slug']][1]
            related[target['permalink']] = target
    add('related-title', related.values() if record['permalink'] != '/' else [])
    return expected


def fact_links(record, records):
    expected = []
    for group, field, collection in [('guide', 'primary_product', 'products'), ('product', 'manufacturer', 'organisations'), ('working_group', 'coordinator', 'organisations'), ('policy', 'owner', 'organisations')]:
        ref = record.get(group, {}).get(field)
        if ref:
            expected.append(records[collection][ref][1]['permalink'])
    for group, field in [('person', 'organisations'), ('event', 'organisers'), ('event', 'partners'), ('repository', 'maintainers')]:
        expected.extend(records['organisations'][ref['organisation']][1]['permalink'] for ref in record.get(group, {}).get(field, []))
    expected.extend(records['people'][ref['person']][1]['permalink'] for ref in record.get('working_group', {}).get('leads', []) if ref.get('person'))
    credits = record.get('event', {}).get('speakers', [])
    programme_people = {ref['person'] for ref in credits if ref.get('session') and ref.get('person')}
    expected.extend(records['people'][ref['person']][1]['permalink'] for ref in credits
                    if ref.get('person') and not ref.get('session') and ref['person'] not in programme_people)
    return expected


def audit(site, baseurl, records, redirects):
    pages = {}
    for path in site.rglob('*.html'):
        route = '/' + path.relative_to(site).as_posix()
        route = route.removesuffix('index.html') if route.endswith('index.html') else route
        pages[route] = html.fromstring(path.read_text())
    ids = {route: set(tree.xpath('//@id')) for route, tree in pages.items()}
    errors = []
    counts = collections.Counter(pages=len(pages))
    external = collections.defaultdict(set)
    list_routes = load((ROOT / '_data/breadcrumbs.yml').read_text())
    organisation_names = load((ROOT / '_data/organisation_names.yml').read_text())
    listing_pages = {data['permalink']: data for _, data, _ in records['pages'].values() if data.get('listing')}

    def organisation_link(label):
        key = re.sub(r'[^\w]+', '-', label.strip().lower()).strip('-')
        slug = organisation_names.get(key, key)
        for _, org, _ in records['organisations'].values():
            if org['slug'] == slug or org['title'] == label.strip():
                return [org['permalink']]
        for separator in [' / ', ', ']:
            if separator in label:
                return [url for part in label.split(separator) for url in organisation_link(part)]
        return []

    def local(url):
        return (url[len(baseurl):] or '/') if baseurl and (url == baseurl or url.startswith(baseurl + '/')) else url

    def page_route(url):
        return url.removesuffix('index.html') if url.endswith('index.html') else url

    for route, tree in pages.items():
        breadcrumb_links = [local(url) for url in tree.xpath('//nav[@aria-label="Breadcrumb"]//a/@href')]
        if '/404.html' in breadcrumb_links or route in breadcrumb_links or len(breadcrumb_links) != len(set(breadcrumb_links)):
            errors.append(f'{route}: breadcrumb has an invalid, duplicate or self ancestor: {breadcrumb_links}')
        for node in tree.xpath('//main//text()[not(ancestor::a or ancestor::code or ancestor::pre or ancestor::script or ancestor::style)]'):
            if re.search(r'(?i)\b(?:https?://|www\.)\S+', str(node)):
                errors.append(f'{route}: plain URL must use a Markdown link or angle-bracket autolink: {str(node).strip()}')
        for link in tree.xpath('//main//a[@href]'):
            destination = urlsplit(link.get('href'))
            if destination.scheme.lower() in ('http', 'https', '') and destination.netloc and destination.netloc.lower() != 'adam-3bian.github.io':
                counts['external_links_checked'] += 1
                if link.get('target') != '_blank' or not {'noopener', 'noreferrer'} <= set(link.get('rel', '').split()):
                    errors.append(f'{route}: external link lacks rel/target attributes: {link.get("href")}')
                attributes = list(link.attrib)
                if 'rel' in attributes and 'target' in attributes and attributes.index('rel') > attributes.index('target'):
                    errors.append(f'{route}: rel must precede target: {link.get("href")}')
        for raw in tree.xpath('//body//a/@href | //img/@src | //source/@src | //script/@src | //link[@rel="stylesheet" or @rel="icon"]/@href | //form/@action | //use/@href'):
            parts = urlsplit(raw)
            if parts.scheme in ('http', 'https') and parts.netloc != 'adam-3bian.github.io':
                external[raw].add(route)
                continue
            if parts.scheme not in ('', 'http', 'https') or parts.netloc and parts.netloc != 'adam-3bian.github.io':
                continue
            if not parts.path and not parts.fragment:
                errors.append(f'{route}: empty destination {raw!r}')
                continue
            target = urlsplit(urljoin('https://adam-3bian.github.io' + baseurl + route, raw))
            path = unquote(target.path)
            if baseurl and path != baseurl and not path.startswith(baseurl + '/'):
                errors.append(f'{route}: escaped deployment prefix: {raw}')
                continue
            path = local(path) or '/'
            file = site / path.lstrip('/')
            if file.is_dir():
                file /= 'index.html'
            counts['local_targets'] += 1
            if not file.is_file():
                errors.append(f'{route}: missing target: {raw}')
                continue
            if parts.fragment and path not in redirects:
                counts['fragment_targets'] += 1
                if page_route(path) in ids and unquote(parts.fragment) not in ids[page_route(path)]:
                    errors.append(f'{route}: missing fragment: {raw}')
            elif parts.fragment and path in redirects:
                counts['fragment_targets'] += 1
                if unquote(parts.fragment) not in ids.get(page_route(redirects[path]), set()):
                    errors.append(f'{route}: missing redirected fragment: {raw}')
    for kind, entries in records.items():
        for source, record, _ in entries.values():
            route = record['permalink']
            tree = pages.get(page_route(route))
            if tree is None:
                errors.append(f'{route}: record page missing')
                continue
            counts['records'] += 1
            if kind in list_routes:
                trail = [local(url) for url in tree.xpath('//nav[@aria-label="Breadcrumb"]//a/@href')]
                membership = record.get('organisation', {}).get('membership', {})
                expected_list = list_routes[kind]
                if kind == 'organisations' and membership.get('is_member') and membership.get('status') == 'active':
                    expected_list = '/alliance/leadership/members/'
                if kind == 'papers' and record['publication']['type'] != 'academic_paper':
                    expected_list = '/discover/resources/reports-and-white-papers/'
                if not trail or trail[-1] != expected_list or len(trail) != len(set(trail)) or route in trail:
                    errors.append(f'{route}: breadcrumb must return to {expected_list} without duplicate/self links: {trail}')
                if listing_pages.get(expected_list, {}).get('listing', {}).get('collection') != kind:
                    errors.append(f'{route}: breadcrumb does not lead to a list of {kind}')
                counts['collection_breadcrumbs'] += 1
            expected = associations(records, kind, record)
            if expected['related-title']:
                next_sections = tree.xpath('//main//section[@aria-labelledby="related-title"]')
                if len(next_sections) != 1 or next_sections[0].xpath('string(h2)') != 'Where Next?' or next_sections[0].xpath('.//img'):
                    errors.append(f'{route}: Where Next? must be one text-only related section')
            actual_sections = tree.xpath('//main//section[@data-relationship]')
            actual_ids = [section.get('aria-labelledby') for section in actual_sections]
            if len(actual_ids) != len(set(actual_ids)):
                errors.append(f'{route}: duplicate relationship sections')
            for section in actual_sections:
                section_id = section.get('aria-labelledby')
                if section_id not in expected and not (route == '/' and section_id in ['home-news-title', 'home-events-title']):
                    errors.append(f'{route}: unexpected relationship section {section_id}')
            for section, destinations in expected.items():
                counts['relationship_sections'] += 1
                actual = [local(url) for url in tree.xpath(f'//main//section[@aria-labelledby="{section}"]//a/@href')]
                if collections.Counter(actual) != collections.Counter(destinations):
                    errors.append(f'{route}: {section}: expected {destinations}, found {actual}')
                counts['relationship_links'] += len(actual)
            actual = [local(url) for url in tree.xpath('//main//dl[contains(concat(" ",normalize-space(@class)," ")," record-facts ")]//a/@href')]
            if collections.Counter(actual) != collections.Counter(fact_links(record, records)):
                errors.append(f'{route}: fact links do not match source references: {actual}')
            counts['fact_links'] += len(actual)
            credits = record.get('post', record.get('publication', {})).get('authors', [])
            authors = [records['people'][ref['person']][1]['permalink'] for ref in credits if ref.get('person')]
            actual = [local(url) for url in tree.xpath('//main//*[contains(concat(" ",normalize-space(@class)," ")," author ")]/a/@href')]
            if actual != authors:
                errors.append(f'{route}: author links/order do not match source credits')
            counts['author_links'] += len(actual)
            def scoped_resources(data, scope):
                return [ref['url'] for ref in data.get('resources', [])
                        if ref.get('session_id') == scope or ref.get('presentation_id') == scope]

            resources = [ref['url'] for ref in record.get('resources', [])
                         if not ref.get('session_id') and not ref.get('presentation_id')]
            if record.get('event', {}).get('registration', {}).get('url'):
                resources.append(record['event']['registration']['url'])
            if record.get('organisation', {}).get('website'):
                resources.append(record['organisation']['website'])
            resources.extend(ref['url'] for ref in record.get('person', {}).get('links', []))
            actual = [local(url) for url in tree.xpath('//main//div[contains(concat(" ",normalize-space(@class)," ")," resource-panel ") and not(contains(concat(" ",normalize-space(@class)," ")," programme-resources "))]//a/@href')]
            if collections.Counter(actual) != collections.Counter(resources):
                errors.append(f'{route}: resource links do not match record resources')
            counts['resource_links'] += len(actual)

            raw_event = load(source.read_text().split('---', 2)[1]).get('event', {})
            for day_index, day in enumerate(record.get('event', {}).get('schedule', [])):
                for session_index, session in enumerate(day['sessions']):
                    raw_session = raw_event['schedule'][day_index]['sessions'][session_index]
                    raw_items = [raw_session] + raw_session.get('presentations', [])
                    for item_index, item in enumerate([session] + session.get('presentations', [])):
                        scope = item['id']
                        speakers = [records['people'][ref['person']][1]['permalink'] for ref in record['event'].get('speakers', []) if ref.get('session') == scope]
                        containers = f'(//main//*[@id="{scope}"] | //main//*[@id="{scope}"]/div[@class="programme-session-details" or @class="programme-talk-copy"])'
                        credit_links = [local(url) for url in tree.xpath(containers+'/*[@class="programme-speakers"]/a/@href')]
                        actual = [url for url in credit_links if not url.startswith('/organisations/')]
                        if collections.Counter(actual) != collections.Counter(speakers):
                            errors.append(f'{route}: programme speaker links do not match {scope}')
                        counts['programme_credits'] += len(actual)
                        raw_item = raw_items[item_index]
                        labels = [ref['affiliation'] for ref in raw_item.get('speakers', []) if ref.get('affiliation')]
                        if raw_item.get('affiliation'):
                            labels.append(raw_item['affiliation'])
                        expected_orgs = [url for label in labels for url in organisation_link(label)]
                        actual_orgs = [url for url in credit_links if url.startswith('/organisations/')]
                        if collections.Counter(actual_orgs) != collections.Counter(expected_orgs):
                            errors.append(f'{route}: programme organisation links do not match {scope}: {actual_orgs}')
                        counts['programme_organisations'] += len(actual_orgs)
                        actual = [local(url) for url in tree.xpath(containers+'/div[contains(concat(" ",normalize-space(@class)," ")," programme-resources ")]//a/@href')]
                        if collections.Counter(actual) != collections.Counter(scoped_resources(record, scope)):
                            errors.append(f'{route}: programme resources do not match {scope}')
                        counts['programme_resources'] += len(actual)

            if kind == 'people':
                talks = []
                for _, event, _ in records['events'].values():
                    scopes = {ref.get('session') for ref in event['event'].get('speakers', []) if ref['person'] == record['slug']}
                    for day in event['event'].get('schedule', []):
                        for session in day['sessions']:
                            for item in [session] + session.get('presentations', []):
                                if item['id'] in scopes:
                                    talks.append(tuple(sorted([event['permalink'] + '#' + item['id']] + scoped_resources(event, item['id']))))
                actual = [tuple(sorted(local(url) for url in card.xpath('.//a/@href'))) for card in tree.xpath('//main//article[@data-talk-id]')]
                if collections.Counter(actual) != collections.Counter(talks):
                    errors.append(f'{route}: talk cards/resources do not match credited programme items')
                counts['person_talks'] += len(actual)
    counts['external_urls'] = len(external)
    return dict(counts), errors, external


def external_checks(urls):
    locks = {urlsplit(url).netloc: threading.Semaphore(2) for url in urls}

    def check(url):
        parts = urlsplit(url)
        request_url = urlunsplit(parts._replace(path=quote(parts.path, safe="/%:@!$&'()*+,;=-._~"), query=quote(parts.query, safe="%=&/?@!$'()*+,;:-._~"), fragment=''))
        result = {'url': url, 'sources': sorted(urls[url])}
        with locks[urlsplit(url).netloc]:
            for method in ['HEAD', 'GET']:
                request = urllib.request.Request(request_url, method=method, headers={'User-Agent': 'Mozilla/5.0 (compatible; CHERI-link-check/1.0)'})
                try:
                    with urllib.request.urlopen(request, timeout=10) as response:
                        result.update(status=response.status, final_url=response.url, outcome='reachable')
                    break
                except urllib.error.HTTPError as exc:
                    result.update(status=exc.code, final_url=exc.url, outcome='broken' if exc.code in [404, 410] else 'unverified')
                except (OSError, ValueError, http.client.HTTPException) as exc:
                    result.update(outcome='unverified', error=str(exc))
                    break
        return result

    with concurrent.futures.ThreadPoolExecutor(max_workers=16) as pool:
        return sorted(pool.map(check, urls), key=lambda row: row['url'])


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--site', type=Path, required=True)
    parser.add_argument('--baseurl', default='')
    parser.add_argument('--report', type=Path, required=True)
    parser.add_argument('--external', action='store_true')
    args = parser.parse_args()
    errors, warnings = [], []
    records, _, redirects, _ = validate_source(errors, warnings)
    if errors:
        raise SystemExit('\n'.join(errors))
    counts, errors, external = audit(args.site, args.baseurl.rstrip('/'), records, redirects)
    report = {'counts': counts, 'errors': errors}
    if args.external:
        report['external'] = external_checks(external)
        report['external_summary'] = dict(collections.Counter(row['outcome'] for row in report['external']))
    args.report.parent.mkdir(parents=True, exist_ok=True)
    args.report.write_text(json.dumps(report, indent=2, ensure_ascii=False) + '\n')
    print(f'Linked content: {counts}; {len(errors)} errors; {args.report}')
    if args.external:
        print('External HTTP checks:', report['external_summary'])
    return bool(errors)


if __name__ == '__main__':
    raise SystemExit(main())
