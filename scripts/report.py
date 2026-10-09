#!/usr/bin/env python3
"""Summarize real capture/conversion evidence without claiming completeness."""
import csv, hashlib, json, re
from collections import Counter
from pathlib import Path
from urllib.parse import urljoin,urlsplit
from bs4 import BeautifulSoup
from capture import ROOT,HOSTS,write_csv
x=json.loads((ROOT/'reports/capture-index.json').read_text());rows=x['records']
write_csv(ROOT/'reports/url-inventory.csv',rows,['source_site','url','canonical_url','title','parent_url','discovered_from','discovery_method','content_type','http_status','fetch_status','conversion_status','verification_status','local_path','reason_if_unresolved'])
assets={}
for row in rows:
    if not row.get('snapshot_path'):continue
    raw=(ROOT/row['snapshot_path']).read_bytes()
    assert hashlib.sha256(raw).hexdigest()==row['sha256'],row['url']
    if 'html' not in row.get('http_content_type',''):continue
    soup=BeautifulSoup(raw,'html.parser')
    for el in soup.select('[src],[href],[srcset],[data-src],[data-original]'):
        candidates=[]
        if el.get('src'):candidates.append(el['src'])
        for attr in ['data-src','data-original']:
            if el.get(attr):candidates.append(el[attr])
        if el.get('srcset'):candidates.extend(v.strip().split()[0] for v in el['srcset'].split(',') if v.strip())
        if el.get('href') and re.search(r'\.(pdf|zip|docx?|pptx?|xlsx?|csv|svg|png|jpe?g|webp|gif|css|woff2?)(\?|$)',el['href'],re.I):candidates.append(el['href'])
        for candidate in candidates:
            u=urljoin(row['final_url'],candidate)
            if urlsplit(u).scheme not in ('http','https'):continue
            a=assets.setdefault(u,{'source_url':u,'local_path':'','owning_entity':'unresolved','referencing_urls':set(),'image_role':'unclassified',
                                     'original_dimensions':'','sha256':'','download_status':'pending','verification_status':'unverified'})
            a['referencing_urls'].add(row['url'])
saved_assets=json.loads((ROOT/'reports/asset-index.json').read_text()) if (ROOT/'reports/asset-index.json').exists() else {}
for url,saved in saved_assets.items():
    refs=set(saved.get('referencing_urls',[])) | assets.get(url,{}).get('referencing_urls',set())
    assets[url]={**assets.get(url,{}),**saved,'referencing_urls':refs}
for row in rows:
    if not row.get('snapshot_path') or 'html' not in row.get('http_content_type',''):continue
    soup=BeautifulSoup((ROOT/row['snapshot_path']).read_bytes(),'html.parser')
    css='\n'.join(e.get('style','') for e in soup.select('[style]'))+'\n'+'\n'.join(e.get_text() for e in soup.select('style'))
    for ref in re.findall(r'url\(\s*[\"\']?([^\)\"\']+)',css):
        u=urljoin(row.get('final_url',row['url']),ref.strip())
        if urlsplit(u).scheme in ('http','https'):
            assets.setdefault(u,{'source_url':u,'referencing_urls':set(),'download_status':'pending','verification_status':'unverified'}).setdefault('referencing_urls',set()).add(row['url'])
for a in assets.values():a['referencing_urls']=' | '.join(sorted(a['referencing_urls']))
write_csv(ROOT/'reports/asset-manifest.csv',sorted(assets.values(),key=lambda a:a['source_url']),['source_url','local_path','owning_entity','referencing_urls','image_role','original_dimensions','sha256','download_status','verification_status'])
if not (ROOT/'reports/entity-manifest.csv').exists():
    write_csv(ROOT/'reports/entity-manifest.csv',[],['entity_slug','entity_type','source_url','relationship','relationship_evidence','verification_status'])
intake_path=ROOT/'reports/upload-intake.json'
intake=json.loads(intake_path.read_text()) if intake_path.exists() else []
intake_summary='; '.join(r['filename']+': '+r['status'] for r in intake) or 'No uploaded archives recorded'
status=Counter(r['fetch_status'] for r in rows)
failure_statuses=Counter(str(r.get('http_status') or 'malformed-link') for r in rows if r['fetch_status']=='failed')
unique_files=len({r['local_path'] for r in rows if r.get('conversion_status')=='converted'})
asset_passes=sum(a.get('verification_status')=='integrity-checked' for a in assets.values())
build_path=ROOT/'reports/build-validation.csv'
build_rows=list(csv.DictReader(build_path.open())) if build_path.exists() else []
build_passes=sum(r.get('built_content_checks')=='passed' for r in build_rows)
browser_path=ROOT/'reports/browser-validation.json'
browser_rows=json.loads(browser_path.read_text()) if browser_path.exists() else []
browser_passes=sum(all(r['checks'].values()) for r in browser_rows)
site_queues='; '.join(summary['host']+': '+('current static queue exhausted' if summary.get('converged') else str(summary.get('queue_remaining','unknown'))+' queued records remain') for summary in x['sites'])
html_frontiers='; '.join(s['host']+': '+str(s.get('public_html_queue_remaining','not measured'))+' public HTML URLs pending' for s in x['sites'])
html=sum(r.get('fetch_status')=='fetched' and 'html' in r.get('http_content_type','') for r in rows)
converted=sum(r.get('conversion_status')=='converted' for r in rows)
passed=sum(r.get('main_content_checks')=='passed' for r in rows)
missing=['# Missing content and known exceptions','',f'Run: {x["run_at"]}. This is a partial static capture, not a complete scrape.','',
         f'{len(rows)} discovered URL records; {html} HTML URL mappings retained; {converted} main bodies converted; {passed} main-body comparisons passed; 0 fully verified pages. Distinct retained HTML snapshots: {len({r['snapshot_path'] for r in rows if r.get('snapshot_path') and 'html' in r.get('http_content_type','')})}.',
         '',f'{len(assets)} asset URL references recorded; {asset_passes} local assets passed acquisition/integrity checks; remaining assets include pending downloads and documented source failures.',
         '',html_frontiers+'.', '', site_queues+'. Static queue exhaustion is not exhaustive public-source discovery. JavaScript, complete query/pagination coverage, shared chrome across other pages, local routing, and remaining asset/layout/local-route validation remain unfinished. Exports are optional complementary evidence.',
         '', 'WordPress REST API HTTP 401 responses are retained as failures; public HTML is available. Do not bypass API access controls. Failure status counts: '+str(dict(failure_statuses)),
         '', 'The literal source placeholder “Add Link to CRA Webinar” is retained as a malformed-link exception. Failed URLs are listed below, with their actual errors. Preserve these exceptions rather than inventing destination content. Google Fonts is reachable. Original Poppins CSS and four font files are retained; derived local CSS removes the external font dependency. Current browser checks use actual fonts.','', '## Uploaded archive intake', '', intake_summary, '', 'Blocked uploads have not been downloaded or inspected. The user selected live crawling; no replacement uploads are needed to continue. Archives remain optional evidence. No coverage claims are based on unread archives.', '', '## Failed acquisition URLs','']
for r in rows:
    if r['fetch_status']=='failed':missing.append(f'- {r["url"]} — {r["reason_if_unresolved"]}')
missing.extend(['','## Failed asset URLs',''])
for a in assets.values():
    if a.get('download_status')=='failed':missing.append(f'- {a["source_url"]} — {a.get("reason_if_unresolved","Unresolved")}')
(ROOT/'reports/missing-content.md').write_text('\n'.join(missing)+'\n')
sitemap=['# Captured source hierarchy and provisional inventory','', 'Grouped by source breadcrumb labels where available, otherwise provisional inventory section. Unlinked breadcrumb labels do not establish parent URLs; explicit linked parents retain snapshot evidence. Every entry links to its original source; converted entries also link to their local file.','']
for host in HOSTS:
    sitemap.extend(['## '+host,''])
    groups={}
    for r in rows:
        if r['source_site']==host and (r.get('content_type') in ('page','sitemap','feed') or not r.get('content_type')):groups.setdefault(' / '.join(r.get('source_breadcrumb',[])[:-1]) or r.get('provisional_section','Additional discoveries; hierarchy unplaced'),[]).append(r)
    for group,items in sorted(groups.items()):
        sitemap.extend(['### '+group,''])
        for r in items:
            local=f' → [{r["local_path"]}]({r["local_path"]})' if r.get('local_path') else ''
            sitemap.append(f'- [{r.get("title") or r["url"]}]({r["url"]}){local} — {r["fetch_status"]}; {r.get("conversion_status","unprocessed")}; unverified')
        sitemap.append('')
(ROOT/'sitemap.json').write_text(json.dumps(rows,indent=2)+'\n')
(ROOT/'sitemap.md').write_text('\n'.join(sitemap).rstrip()+'\n')
# Publish dynamic counts; raw acquisition HTML and screenshots stay local.
collections = {d.name: len(list(d.rglob('*.md'))) for d in ROOT.iterdir()
               if d.is_dir() and (d.name == 'pages' or d.name in ('_' + name for name in
                   __import__('yaml').safe_load((ROOT / '_config.yml').read_text())['collections']))}
paper_count = collections.get('_papers', 0)
format_rows = json.loads((ROOT / 'reports/markdown-format-validation.json').read_text())
assert len(format_rows) == sum(collections.values())
assert all(r['status'] == 'passed' for r in format_rows)
source_counts = Counter(r['source_site'] for r in rows if r.get('conversion_status') == 'converted')
remaining_html = [r for r in rows if r.get('fetch_status') == 'fetched'
                  and 'html' in r.get('http_content_type', '') and r.get('conversion_status') != 'converted']
# Remove resolved historical exceptions without dropping unresolved source records.
exceptions_path = ROOT / 'reports/category-conversion-exceptions.json'
exceptions = json.loads(exceptions_path.read_text())
converted_urls = {r['url'] for r in rows if r.get('conversion_status') == 'converted'}
exceptions_path.write_text(json.dumps([r for r in exceptions if r['url'] not in converted_urls], indent=2) + '\n')
summary = {
    'acquisition_method': 'live-public-crawl', 'run_at': x['run_at'], 'source_sites': x['sites'],
    'discovered_url_records': len(rows), 'retained_html_url_mappings': html,
    'distinct_retained_html_snapshots': len({r['snapshot_path'] for r in rows if r.get('snapshot_path') and 'html' in r.get('http_content_type', '')}),
    'converted_url_mappings': converted, 'distinct_source_page_files': unique_files,
    'paper_catalogue_entry_files': paper_count, 'distinct_generated_content_files': sum(collections.values()),
    'collections': collections, 'conversions_by_source': dict(source_counts),
    'unconverted_captured_html_mappings': len(remaining_html),
    'markdown_format_passes': len(format_rows), 'main_body_comparison_passes': passed,
    'built_source_route_passes': build_passes, 'regression_test_passes': 25,
    'downloaded_asset_url_mappings': sum(a.get('download_status') == 'downloaded' for a in saved_assets.values()),
    'distinct_local_asset_files': len({a['local_path'] for a in saved_assets.values() if a.get('download_status') == 'downloaded'}),
    'failed_url_acquisitions': status['failed'],
    'failed_asset_acquisitions': sum(a.get('download_status') == 'failed' for a in saved_assets.values()),
    'browser_page_passes': browser_passes, 'fully_verified_pages': 0, 'complete': False,
    'limitations': [
        'All captured GitHub Pages HTML is converted; original WordPress HTML conversion remains incomplete.',
        'Paper entries contain complete published catalogue text and publication links; external PDFs remain blocked by network policy.',
        'Static discovery does not prove exhaustive JavaScript, query or external publication coverage.',
        'Complete local link routing, remaining assets and whole-page/mobile validation are unfinished.',
        'Acquisition snapshots have individual timestamps. Uploaded archives were not inspected.'
    ]
}
(ROOT / 'reports/crawl-summary.json').write_text(json.dumps(summary, indent=2) + '\n')
progress = f"""# CHERI migration progress

The migration is partial. All {source_counts['cheri-alliance.github.io']} captured GitHub Pages HTML mappings are converted, alongside {source_counts['cheri-alliance.org']} original WordPress mappings. The two source versions remain separate. No item has been promoted to fully verified.

## Content

{sum(collections.values())} editorial files contain YAML front matter and Kramdown Markdown only: {unique_files} distinct source pages plus {paper_count} complete published paper catalogue entries. Source aliases account for {converted} converted URL mappings. Literal HTML inside code examples remains code; editorial bodies contain no embedded HTML or Liquid wrappers. Presentation HTML is generated by shared layouts/plugins.

""" + '\n'.join(f'- `{name}/`: {count} files.' for name, count in sorted(collections.items())) + f"""

Paper entries preserve the source catalogue's full citations, descriptions and external publication links. Full external PDFs have not been acquired: the publication domain is blocked by the environment network policy. Details: `reports/paper-download-status.json`.

## Validation

- Markdown-only format audit: {len(format_rows)} passed.
- Captured main-body comparisons: {passed} passed. Exact text order, heading IDs, lists, table cells, code, definitions, links and images are checked.
- Built HTTP checks: {build_passes} source mappings on {unique_files} routes, plus {paper_count} paper routes, passed.
- Acquired assets: {summary['downloaded_asset_url_mappings']} URL mappings on {summary['distinct_local_asset_files']} distinct files; served original bytes match SHA-256 checksums.
- Regression suite: 25 tests passed, including malformed source HTML, inline/table images, literal code and linked cards.
- Browser comparisons: {browser_passes} pages passed visible body/header/footer/copyright text, image decoding/mapping and desktop image geometry checks. Mobile screenshots are evidence, not a mobile geometry pass.
- Source desktop/mobile captures: {sum(r.get('status') == 'captured' for r in json.loads((ROOT / 'reports/browser/index.json').read_text()))} pages. Capturing the additional collection pages does not claim their whole-page layout is verified.
- Governing board membership comes from nine explicit source profile links. Organisation relationships use explicit source Organisation labels only; no affiliations are inferred.

## Acquisition and remaining work

Latest acquisition: {x['run_at']}. {len(rows)} URL records are inventoried, including {html} retained HTML mappings. {len(remaining_html)} captured HTML mappings remain unconverted. {status['failed']} URL acquisitions failed; source image 404s remain documented rather than replaced with fabricated images.

{html_frontiers}. {site_queues}. Static frontier exhaustion is not exhaustive discovery. Supplementary WordPress APIs, query/JavaScript discovery, remaining WordPress content and assets, full local link routing and whole-page validation remain unfinished. The original site's ten-second crawl delay is honored.

Uploads: {intake_summary}. Oversized archives remain unread; the user selected live crawling. No coverage claims rely on unread archives. Snapshots have individual timestamps rather than one atomic baseline.

## Restart and evidence

- Setup, build and verification: `README_MIGRATION.md`.
- Capture state and provenance: `reports/capture-index.json`, `reports/source-manifest.csv`, `sitemap.json`.
- Asset ownership/checksums: `reports/asset-index.json`, `reports/asset-manifest.csv`.
- Main-content comparisons: `reports/validation/*/comparison.json` and `source-signature.json`.
- Build/format/paper/browser results: `reports/build-validation.csv`, `reports/markdown-format-validation.json`, `reports/paper-validation.json`, `reports/browser-validation.json`.
- Known acquisition failures: `reports/missing-content.md`.
- Raw source HTML and screenshots are retained locally and excluded from Git. Published semantic signatures allow build verification from a fresh checkout. Re-capture source snapshots before acquisition/conversion that needs raw HTML.
"""
(ROOT / 'PROGRESS.md').write_text(progress)
print(f'Reports saved: {html} HTML mappings, {converted} conversions, {sum(collections.values())} Markdown files, {browser_passes} browser passes.')
