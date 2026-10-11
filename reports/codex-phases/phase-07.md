# Phase 7 — complete content and URL accounting

Date: 11 October 2026. Branch: `codex/phased-site-transformation`.

- Starting commit: `810c764c6f570ef821fa15a85b867e37ca3d7b7b`, fetched from the working branch before work.
- Implementation commit: recorded after committing the verified changes.
- Exit gate: passed for the available repository content and routes, with the explicit exceptions below.

The Phase 6 report and repository instructions were read first. This phase audits current content against retained historical evidence and actual native output, repairs proven URL gaps, and addresses the user's explicit slider complaint. The existing cloud setup and native GitHub Pages bundle were reused; no dependency or environment configuration change was needed.

## Changes

**Original slider restored.** Phase 6 introduced a playback button and paused on focus anywhere in the carousel. Those deviations are removed: `_includes/slider.html`, `assets/js/slider.js` and `_sass/_slider.scss` now match the supplied ZIP byte-for-byte. The genuine two-slide data and full homepage prose remain unchanged. The original script pauses for keyboard focus on the active slide link, hidden documents and reduced motion; persistent dot focus permits playback. Reference screenshots use a separate build of the ZIP with the same real slide data and local Poppins, without changing its components.

**Literal content URLs work under a project prefix.** `_includes/content-urls.html`, called after source-card conversion in `_layouts/default.html`, applies a nonempty deployment prefix to rendered URL attributes. It reads quoted attribute values independently, preserving escaped code, literal examples, alt/title text, external/protocol-relative links and existing prefixes. All editorial metadata stays unchanged. The only Markdown-body edit replaces the obsolete `/search/` link on the repository-authored 404 page with existing homepage, news and Discover destinations.

**Known former routes restored.** The historical `reports/route-map.json` identifies 261 unoccupied former output paths with existing, unambiguous destinations. Small HTML records under `pages/native-redirects/compat/` now preserve them, using `_layouts/redirect.html`. The five existing redirects keep their original paths and destinations and use the same layout. Every redirect has a static refresh, canonical URL and visible fallback; a small inline enhancement retains incoming query strings and fragments. No redirect points to another redirect. `_data/anchor-aliases.yml` additionally preserves the two former event fragments documented in `reports/source-link-repairs.json`, beside their actual headings.

**No speculative editorial replacement.** Source articles, captions, tables, citations, dates, code, assets and relationship IDs remain intact. Missing raw captures and unacquired full papers are reported below. No external acquisition was performed.

## Frozen input and source-to-output accounting

[Input inventory](phase-07-evidence/input-inventory.json) freezes all 476 editorial records, full-file/body hashes, metadata and routes, plus 798 asset/provenance inputs. The ZIP SHA-256 is `9f097aeace78c13e2f169fdc378f58b64b119993ac031b011ae7a618c7a7325a`. Every frozen auxiliary input except the deliberately restored slider script is unchanged.

| Record class | Markdown files | Evidence and fresh comparison |
| --- | ---: | --- |
| Captured source bodies | 371 | 376 source URL mappings match saved immutable signatures after the declared canonical link/asset mappings. |
| Paper catalogue entries | 15 | Complete original catalogue signatures, citations, descriptions and publication links match. |
| Verified name-only entities | 65 | 49 people and 16 organisations retain only their source-backed name; provenance labels verified. |
| Declared website editions | 9 | Exact documented edits or directory introductions match; complete originals remain in reference versions. |
| Repository-authored indexes/system pages | 16 | Every current body maps to its actual native output; includes the repaired 404. |
| **Total** | **476** | **Complete measured account; no unexplained content difference.** |

The collections contain 112 people, 69 organisations, 56 news records, 10 events, 15 papers, 16 groups, 10 guides, 6 hardware records, 10 software records and 11 policies, plus 161 pages. Nineteen alternates comprise nine original news versions, one policy version and nine reference editions. All remain output routes and are excluded from the canonical sitemap.

All 476 current Markdown bodies are independently rendered through native Kramdown and compared with the actual site. Checks cover reading-order text, headings/IDs, paragraphs, lists, tables, definitions, links, images/alts and code. The same content also matches the project build after removing only its deployment prefix. The 293 source cards and 242 source navigation sections are compared separately, including every copied word, action and destination. This explicitly accounts for the previously approved presentation changes: 77 board/speaker cards reuse canonical portraits; 133 Where next descriptions remain in source but are intentionally omitted from display; chapter H1s become H2 without losing wording or IDs. These are documented transformations, not silently ignored mismatches.

There are 366 valid forward entity references: 202 authors, 97 speakers and 67 organisation affiliations. All 112 people have the expected reverse news/event/paper links, totaling 293 edges; the nine board IDs resolve in registry order. No unresolved entity ID was found.

## Route and asset results

The native builds emit 742 HTML files: 476 editorial pages and 266 redirects. All 482 historical route-map destinations resolve locally, and the 456 canonical sitemap destinations remain the same as the starting build. Redirects and alternates stay out of the sitemap; the 404 remains `noindex` with working local links.

The complete root and project scans each check 60,613 local references, including canonical and refresh destinations, plus seven CSS/font dependencies: zero missing files, anchors or prefixes. The graph includes header/footer links, collection details, slider CTAs, body media and downloads. The 578 distinct external URLs are enumerated but were not newly fetched.

All 430 acquired original-asset mappings match their recorded SHA-256 in source, root output and project output: 396 distinct files. Image decoding covers 346 raster images and one SVG; 17 local PDFs pass their recorded hashes and PDF-header checks. Remaining fonts, source CSS/JavaScript and the original logo ZIP are hash-verified. Full external publication PDFs are a separate, still-unacquired source set.

## Validation and evidence

The recorded native runtime is Ruby 3.3.8, github-pages 232, Jekyll 3.10.0, Liquid 4.0.4 and Kramdown 2.4.0. The prepared bundle is invoked through `/workspace/cheri-native-bundle.sh`; the migration Python environment supplies the HTML/YAML audit libraries.

- Native root build and `--safe --baseurl /cheri-preview` build: logs in [phase-07-evidence](phase-07-evidence/).
- `/workspace/cheri-migration-venv/bin/python -m unittest discover -s tests -v`: 30 tests pass.
- Native `bundle exec ruby scripts/check_markdown.rb`: 476 files pass; the historical report file was restored after checking.
- `fixture_phase07.py`: 30 native root/project URL fixture checks pass, including quoted alt text, escaped code, prefix boundaries, query strings and fragments.
- `audit_phase07.py BEFORE_SITE SITE PROJECT_SITE`: all historical signatures, full output, relationship, route, sitemap and original-asset checks pass; zero fidelity or local-link failures. See [summary](phase-07-evidence/summary.json) and [audit log](phase-07-evidence/audit.log).
- `browser_phase07.py SITE REFERENCE_SITE PROJECT_PARENT`: 56 responsive root/project views, four ZIP slider style/dimension comparisons, 11 carousel checks, 16 redirect/anchor checks, six no-JavaScript checks and two keyboard slider CTAs pass. Widths: 375, 768, 1024 and 1440px. No overflow, missing/faded images or page-script errors were found in the sampled pages. [Browser evidence](phase-07-evidence/browser.json) records each observation.
- Inspected the desktop/mobile application and ZIP slider screenshots using identical real slide data: [desktop application](phase-07-evidence/slider-1440.png), [desktop ZIP](phase-07-evidence/zip-slider-1440.png), [mobile application](phase-07-evidence/slider-375.png), [mobile ZIP](phase-07-evidence/zip-slider-375.png). This verifies the slider component, not pixel identity of every whole page.
- `git diff --check`: passes.

[Historical audit](phase-07-evidence/historical-source-audit.json), [complete rendered-content mapping](phase-07-evidence/rendered-content-audit.json), [route audit](phase-07-evidence/route-audit.json), [redirect provenance](phase-07-evidence/redirect-provenance.json), [asset audit](phase-07-evidence/asset-audit.json), [relationship audit](phase-07-evidence/relationship-audit.json), and [exceptions](phase-07-evidence/exceptions.json) provide the per-record evidence. Older phase reports and provenance files remain intact.

## Concrete limits and Phase 8 handoff

1. None of the 691 indexed HTML capture files is present in this workspace, including all 376 converted mappings. Saved immutable source signatures and 15 paper catalogue signatures are available and freshly compared; raw HTML checksums cannot be freshly verified. The 388 available indexed asset snapshot files are not HTML captures.
2. The discovery inventory still has 2,925 unprocessed records, including aliases/assets/exclusions; that is not a count of missing articles. There are 315 indexed but unconverted HTML mappings. No claim of exhaustive external website coverage is made. Fifteen paper records remain complete catalogue entries, not acquired full external papers.
3. Three historical source-image 404s continue to use their documented same-entity originals. The asset index's `linux-roadmap/toc.html` entry is a page reference, not a missing substitute image/download.
4. `/CHERI-seL4-Exercises/exercises/buffer-overflow-global/` and its `index.html` spelling occupy the same static file. The existing real guide wins; the separately captured HTML version remains at `/reference/CHERI-seL4-Exercises/exercises/buffer-overflow-global/index.html`. No redirect overwrites either body.
5. Without JavaScript, static redirects reach their destination but cannot dynamically transfer incoming query strings or fragments. JavaScript-enabled transfer is checked separately. Hidden-tab slider handling uses a controlled `document.hidden`/`visibilitychange` simulation, not a real background-tab lifecycle test.
6. External availability and the live deployment were not checked. Phase 8 still needs its requested integration review and modernization of legacy plugin/search/filter-dependent validators. Keep the restored original slider behavior; previous Phase 6 Pause/Play assertions describe superseded behavior.

Runtime files changed: the slider include/script, default layout, URL include, shared redirect layout, five existing redirect records, 261 compatibility records, two fragment aliases and the 404 recovery sentence. Documentation/evidence changes: authoring/theme/deployment/validation guidance, `PROGRESS.md`, this report and the three Phase 7 helpers/evidence directory. No main-branch modification, merge, Pages-setting change, PR or deployment was performed.
