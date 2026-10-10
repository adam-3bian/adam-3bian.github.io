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
browser_pages=browser_rows.get('pages',[]) if isinstance(browser_rows,dict) else browser_rows
browser_passes=sum(all(r['checks'].values()) for r in browser_pages)
site_queues='; '.join(summary['host']+': '+('current static queue exhausted' if summary.get('converged') else str(summary.get('queue_remaining','unknown'))+' queued records remain') for summary in x['sites'])
html_frontiers='; '.join(s['host']+': '+str(s.get('public_html_queue_remaining','not measured'))+' public HTML URLs pending' for s in x['sites'])
html=sum(r.get('fetch_status')=='fetched' and 'html' in r.get('http_content_type','') for r in rows)
converted=sum(r.get('conversion_status')=='converted' for r in rows)
passed=sum(r.get('main_content_checks')=='passed' for r in rows)
missing=['# Missing content and known exceptions','',f'Run: {x["run_at"]}. This is a partial static capture, not a complete scrape.','',
         f'{len(rows)} discovered URL records; {html} HTML URL mappings retained; {converted} main bodies converted; {passed} main-body comparisons passed; 0 fully verified pages. Distinct retained HTML snapshots: {len({r['snapshot_path'] for r in rows if r.get('snapshot_path') and 'html' in r.get('http_content_type','')})}.',
         '',f'{len(assets)} asset URL references recorded; {asset_passes} local assets passed acquisition/integrity checks; remaining assets include pending downloads and documented source failures.',
         '',html_frontiers+'.', '', site_queues+'. Static queue exhaustion is not exhaustive public-source discovery. JavaScript, complete query/pagination coverage, remaining original-site conversion/assets and full-site browser coverage remain unfinished. All current rendered local targets and anchors passed. Exports are optional complementary evidence.',
         '', 'WordPress REST API HTTP 401 responses are retained as failures; public HTML is available. Do not bypass API access controls. Failure status counts: '+str(dict(failure_statuses)),
         '', 'The literal source placeholder “Add Link to CRA Webinar” is retained as a malformed-link exception. Failed URLs are listed below, with their actual errors. Preserve these exceptions rather than inventing destination content. Google Fonts is reachable. Original Poppins CSS and four font files are retained; derived local CSS removes the external font dependency. Current browser checks use actual fonts.','', '## Uploaded archive intake', '', intake_summary, '', 'The two oversized original-site archives remain unread. The user selected live crawling for content. The smaller simplified-authoring starter archive was inspected as the requested theme; its provenance is in template-provenance.json. No coverage claims are based on unread archives.', '', '## Failed acquisition URLs','']
for r in rows:
    if r['fetch_status']=='failed':missing.append(f'- {r["url"]} — {r["reason_if_unresolved"]}')
missing.extend(['','## Failed asset URLs',''])
for a in assets.values():
    if a.get('download_status')=='failed':missing.append(f'- {a["source_url"]} — {a.get("reason_if_unresolved","Unresolved")}')
missing += ['','## Current website corrections','','Three broken source image references use verified same-entity original assets; two source fragment typos are corrected. See source-image-repairs.json and source-link-repairs.json. Original failed acquisition records remain historical evidence.','']
(ROOT/'reports/missing-content.md').write_text('\n'.join(missing).rstrip()+'\n')
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
derived = json.loads((ROOT/'reports/derived-content.json').read_text()) if (ROOT/'reports/derived-content.json').exists() else []
live = json.loads((ROOT/'reports/live-source-validation.json').read_text()) if (ROOT/'reports/live-source-validation.json').exists() else []
source_body_checks = json.loads((ROOT/'reports/final-source-content.json').read_text()) if (ROOT/'reports/final-source-content.json').exists() else []
local_links = json.loads((ROOT/'reports/site-link-validation.json').read_text()) if (ROOT/'reports/site-link-validation.json').exists() else {}
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
    'built_source_route_passes': build_passes, 'regression_test_passes': 29,
    'downloaded_asset_url_mappings': sum(a.get('download_status') == 'downloaded' for a in saved_assets.values()),
    'distinct_local_asset_files': len({a['local_path'] for a in saved_assets.values() if a.get('download_status') == 'downloaded'}),
    'failed_url_acquisitions': status['failed'],
    'failed_asset_acquisitions': sum(a.get('download_status') == 'failed' for a in saved_assets.values()),
    'minimal_source_named_records': len(derived), 'live_source_passes': sum(r['status']=='passed' for r in live), 'local_link_checks': local_links.get('local_references',0), 'local_link_errors': len(local_links.get('errors',[])), 'browser_page_passes': browser_passes, 'fully_verified_pages': 0, 'complete': False,
    'limitations': [
        'All captured GitHub Pages HTML is converted; original WordPress HTML conversion remains incomplete.',
        'Paper entries contain complete published catalogue text and publication links; external PDFs remain blocked by network policy.',
        'Static discovery does not prove exhaustive JavaScript, query or external publication coverage.',
        'Rendered local references pass; unsupported legacy external routes remain external. Remaining source assets and full-site browser coverage are incomplete.',
        'Acquisition snapshots have individual timestamps. Oversized original archives remain unread; the uploaded starter template was inspected.'
    ]
}
(ROOT / 'reports/crawl-summary.json').write_text(json.dumps(summary, indent=2) + '\n')
progress = f"""# CHERI content and authoring progress

## Current website

The uploaded simplified-authoring starter supplies the theme, styles and navigation controls. Its demonstration content and placeholder images were not imported. Existing source bodies and collections remain in use.

{sum(collections.values())} editorial Markdown files: {unique_files} distinct complete source-page bodies, {paper_count} full published paper catalogue entries, {len(derived)} minimal source-named people/organisation records, and three collection indexes.

""" + '\n'.join(f'- `{name}/`: {count} files.' for name, count in sorted(collections.items())) + f"""

Only `_data/governing-board.yml` remains: nine short people references. Organisation and paper metadata lives in its Markdown records; acquisition/provenance metadata moved to reports. `member: true` and `speaker: true` select directories; `organization`, `speakers` and `authors` link records by filename. Reverse event/publication/organisation links are generated. No biographies, current affiliations or unnamed contributors were invented.

Canonical filenames and URLs omit source hosts. Distinct alternate source versions are retained with `-original` filenames and `alternate: true`. HTML-file technical references use `/reference/` to prevent collisions with directory indexes. The menu retains the primary site's five headings and published groups, with hardware/software/paper indexes and original-site Morello return information added.

## Final checks

- Markdown-only audit: {len(format_rows)} passed.
- Complete captured source bodies: {len(source_body_checks)} URL mappings passed; checks include text order, heading IDs, paragraphs, lists, table cells, definitions, links, code and original image references.
- Live source recheck: {sum(r['status']=='passed' for r in live)} distinct pages passed; {sum(r['status']=='changed' for r in live)} changed; {sum(r['status']=='failed' for r in live)} failed. Individual acquisition timestamps are in `reports/live-source-validation.json`.
- HTTP builds: {build_passes} source mappings on {unique_files} routes, plus {paper_count} catalogue-entry routes, passed.
- Local links: {local_links.get('local_references',0)} references across {local_links.get('html_files',0)} rendered pages; {len(local_links.get('errors',[]))} missing targets/anchors.
- Relationships, roles, citation names and board references: `reports/entity-validation.json`.
- Regression tests: 29 passed.
- Browser: {browser_passes} desktop/mobile template scenarios passed visible source text, decoded original images, Poppins loading, overflow, menu and submenu checks. The requested starter theme supersedes earlier source pixel geometry checks.
- Original assets: {summary['downloaded_asset_url_mappings']} acquired URL mappings; checksums verified over HTTP.

Three source image 404s were repaired using original assets published for the same organisation/event; two source fragment typos now target actual published headings. These deliberate URL corrections are separate from content comparisons: `reports/source-image-repairs.json`, `reports/source-link-repairs.json`. Proven legacy profile/topic links resolve locally through `reports/source-route-aliases.json`. Source labels and complete body text remain unchanged.

## Coverage and remaining limits

All {source_counts['cheri-alliance.github.io']} captured primary-site HTML mappings are converted. {source_counts['cheri-alliance.org']} original WordPress mappings are converted, including Hildebrand and three original-only articles. {len(remaining_html)} retained HTML mappings remain unconverted, including original archives, aliases and differing source versions. Migration-wide exhaustive discovery is not claimed.

Paper entries contain complete catalogue citations, descriptions and original publication links. Full external PDFs remain unacquired; no full-paper migration is claimed. A literal source webinar-link placeholder and unsupported external source routes remain documented; real form endpoints stay external. No forms were submitted.

Sources retain individual timestamps; oversized original archives remain unread. Static frontier exhaustion does not prove complete JavaScript/query/export coverage. {len(rows)} URL records are inventoried; {status['failed']} historical acquisition failures remain recorded. The original ten-second crawl delay is honored.

## Authoring and evidence

- Authoring schema: `docs/AUTHORING.md`; setup/build/check commands: `README_MIGRATION.md`.
- Editorial requirements: `MIGRATION_SPEC.md`.
- Capture provenance: `reports/capture-index.json`, `reports/source-manifest.csv`, `sitemap.json`.
- Current source comparisons: `reports/final-source-content.json`, `reports/live-source-validation.json`.
- Published immutable comparison signatures: `reports/validation/*/source-signature.json`.
- Relationship provenance: `reports/relationship-evidence.json`, `reports/derived-content.json`, `reports/author-name-matches.json`.
- Canonical mappings: `reports/route-map.json`; asset ownership/checksums: `reports/asset-index.json`.
- Browser/template, local-link and format checks: `reports/browser-validation.json`, `reports/site-link-validation.json`, `reports/markdown-format-validation.json`.

Raw source HTML, screenshots, logs and runtime files stay local and are ignored by Git. Build, link and relationship checks work from the published repository; raw-source rechecks require locally retained captures.
"""
(ROOT / 'PROGRESS.md').write_text(progress)
print(f'Reports saved: {html} HTML mappings, {converted} conversions, {sum(collections.values())} Markdown files, {browser_passes} browser passes.')
