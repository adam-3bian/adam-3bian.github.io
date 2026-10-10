# Phase 0 — Inventory, baseline and gap analysis

Audit date: **10 October 2026 (Europe/London)**. Phase 0 only; no editorial-body edits or theme refactor.

## Baseline and delivery

- Repository: `adam-3bian/adam-3bian.github.io`.
- Working branch: `codex/phased-site-transformation`.
- Starting implementation commit: **`db809a9908f86aa57d7992fb596f52ea10836f09`**.
- Ending audit evidence commit: **`61f77b4031d15c95bf4ab41d95cbd295eb00892b`**. Application/content inputs remain unchanged from the starting implementation commit; this phase adds audit documentation and evidence only.
- A following documentation-only finalisation records that audit SHA, preserves the reference prompt's CRLF bytes with a scoped Git attribute, and trims trailing spaces in the captured build logs. A commit cannot embed its own SHA; resolve the final delivery commit with `git log -1 --format=%H -- reports/codex-phases/phase-00.md`. Its full SHA is also reported to the user.
- Remote `main` observed before work: `7f3839872c8fea6a709b99d241880de0f3915c42`. No checkout, push, merge or deployment to `main` is part of this task.

Read `AGENTS.md`, `TRANSFORMATION_PROMPT.md`, `docs/CODEX_PHASES.md`, the theme/authoring/validation/deployment/fidelity runbooks and historical reports. Inspected the actual ZIP's specification, README, source notes, changes, verification, authoring examples, configuration, layouts, includes, Sass, scripts and assets. The current repository uses native Pages, with no `_plugins/` files or repository-owned Actions workflow. Earlier plugin-based reports are historical.

The ZIP **is available** and is now committed as a reference under [docs/references](../../docs/references/README.md), together with the supplied detailed master prompt. ZIP SHA-256: `9f097aeace78c13e2f169fdc378f58b64b119993ac031b011ae7a618c7a7325a`; archive integrity passes. Reference documents are inputs, not authority to expand Phase 0. `docs/` is already excluded from publication.

Pre-existing local reference-addition work was preserved before switching branches in stash `8535a476f09517eec03f780956c5ae4af00ac32a` (on local branch `work`). It remains recoverable. This phase retains the same ZIP under the already excluded documentation directory rather than changing `_config.yml`.

## Frozen inventory

[content-manifest.json](phase-00-evidence/content-manifest.json) maps every editorial path to its starting commit, full-file/body SHA-256, classification, canonical URL, inherited layout chain, relationships, local assets and measured output. All **476** records produce output at unique expected routes. No canonical metadata mismatches were found.

| Source | Records | Selected detail layout |
| --- | ---: | --- |
| `_people` | 112 | `person` |
| `_organisations` | 69 | `member` |
| `_news` | 56 | `post` |
| `_events` | 10 | `event` |
| `_papers` | 15 | `page` |
| `_groups` | 16 | `page` |
| `_guides` | 10 | `page` |
| `_hardware` | 6 | `page` |
| `_software` | 10 | `page` |
| `_policies` | 11 | `page` |
| `pages/` Markdown | 161 | `page` |
| **Total** | **476** | |

Mutually exclusive classifications: **352 complete captured source pages; 19 preserved alternate versions; 65 source-backed name-only records (49 people, 16 organisations); 15 paper catalogue entries; nine published editions; 16 repository-authored hubs/indexes/utilities**. The nine published editions retain separate original source versions. A catalogue entry is not an acquired full paper. Name-only records have no invented biography or image.

Additional output sources: five HTML redirects in `pages/native-redirects/`, plus root `sitemap.xml` and `robots.txt`. The build has **481 HTML pages** (476 editorial outputs + five redirects). All **372 unique local targets** in the historical 482-entry source URL mapping exist. There are **456 sitemap entries**, excluding 19 alternate records and the 404 page. No duplicate editorial routes, rendered duplicate IDs or unresolved `aria-labelledby` IDs were found. Search was deliberately removed; its historical 456 search-document count is not a current feature.

### Relationships and canonical entities

- One `_people` collection, **112 unique IDs/titles**, **60 verified speaker flags**, **nine ordered board IDs**. No `_speakers` or separate board-people collection.
- One `_organisations` collection, **69 records**, **52 verified member flags**. No duplicate `_members` collection.
- **366 forward reference edges**: 67 organisation affiliations, 97 event speakers, 202 authors (papers and news). Every target resolves and has an entry in the retained relationship evidence. All nine board IDs resolve.
- **28 news records have authors**, including **22 canonical articles** and six alternates. Canonical news lists contain **47 articles**; alternate news is excluded. All news remains in `_news`, not `_posts`.
- Rendered forward relation target sets and derived reverse relation sets match the stored references. **Order fails in 16 lists**: all 15 paper author lists and the CHERI Blossoms 2026 speaker list. `_includes/relationships.html` iterates `site.people` instead of each record's ordered IDs. No IDs need inventing or duplication to repair this.
- The board registry is valid, but the board page still renders its nine source portraits/links from its Markdown body, with **zero generic person cards**. Speakers correctly select 60 records, but use `page` plus `site-features`, not the required `people` list layout.

Evidence: [relationships](phase-00-evidence/relationships.json), [order mismatches](phase-00-evidence/relationship-order.json), [reverse relationship errors](phase-00-evidence/reverse-relationship-errors.json), [directory/date details](phase-00-evidence/content-details.json).

### Authentic media

There are **415 tracked asset/favicon files, 87,022,109 bytes**, including 349 PNG/WebP/JPG files, seven SVGs, 17 PDFs, one original downloadable ZIP, four TTF fonts, the ICO, scripts/styles and icon licence. **430 acquired source URL mappings resolve to 396 unique local files**; all source and fresh-build SHA-256 checks pass. These counts include shared/source CSS and scripts, not only photographs.

Original asset evidence retains three historical 404 responses (already documented same-entity repairs) and one HTML page-reference entry; these are not newly missing local assets. External full-paper PDFs and the uncaptured external archive remain outside this task. No network acquisition was performed.

Real body media exists for **63 people and all 52 member organisations**, yet all 15 generated directory outputs have **zero card images**. `_includes/listing.html` searches Markdown syntax in `item.content`; at page-render time these documents have already become HTML. Other rendering positions can therefore yield different thumbnail results. No record has `thumbnail` metadata. Resolve media consistently in the native data/template pipeline; do not add placeholders.

## Component and design coverage

[theme-inventory.json](phase-00-evidence/theme-inventory.json) inventories **15 layouts, 20 includes, 17 Sass files, four active JS sources**, include dependencies, layout users, navigation data and exact ZIP comparisons. Of the 56 historically imported files, **46 are byte-identical to the ZIP and ten differ**. The historical claim of 48 identical files no longer holds: header/footer now read `site.navigation` directly. The ten differences are settings, Sass entry point, default/person layouts, breadcrumbs, hero, page-heading, listing, header and footer. Differences need review as adapters, not blanket replacement.

Already correct:

- Original logos, favicon, honeycomb SVG/WebPs, shared token values and four interaction scripts are retained. The settings difference is the existing local Poppins URL. Backgrounds remain native-scale repeats; no foreground opacity rule was found beyond the unrelated disabled-form-button treatment.
- Home renders dark with the white logo and large hero; sampled ordinary pages are light. Poppins loads locally. Shared palette, body/header/card/footer surfaces, watermark opacity and main geometry match the reference in sampled computed-style comparisons.
- Generic `.cards`, `.card`, `.card-media`, `.card-image`, `.card-action` and column utilities are present. Collection and relationship includes use that system; usable image-free cards render.
- Native image overlay, table enhancement, menu and slider code is present. Contact/newsletter use shared field markup, disabled buttons and real external service links; no submission endpoint is active.

Measured integration gaps:

- None of the editorial records use `parent`, `thumbnail`, `slider`, `where-next` or `related-pages` front matter; configuration provides no equivalent component data. There are **zero native sliders, Where next cards or Related pages grids** in all 481 HTML outputs, despite existing includes.
- **133 records retain `where-next-title`, 109 retain `related-pages-title`, 18 retain `collection-card__` classes**. Those are source Markdown fragments, not activated ZIP components. On the homepage, the old Where next description remains in the body. Preserve source text/evidence while mapping the real destinations to the requested components in later phases.
- No editorial directory currently selects the named `people`, `members`, `events`, `news`, `list` or `index` layouts. The dormant members/news layouts still select `site.members`/`site.posts`, which do not hold this repository's data. Merely changing a front-matter layout would silently empty those lists or duplicate `site-features` output.
- The default layout implements its own heading/intro branch instead of calling the ZIP heading includes. **140 pages have more than one H1** (138 have two; the retained print archives have 29 and five). **87 of 391 immutable source/catalogue signature comparisons fail on text/headings only**; every such failure is explained by one extra synthetic `#hero-title` heading. Original paragraphs, lists, definitions, code, links, tables and images match. These remain failed full-signature gates, not silently normalised passes. The failures cover 84 unique routes and all 15 paper entries.
- Home's intro is 16px/24px instead of the ZIP's 20px/30px at desktop. The sampled light news article has no extracted intro or breadcrumbs; its top hero padding is 64px versus 16px on the reference page with breadcrumbs (48px versus 16px on mobile). This is composition/data coverage, not a reason to change matching theme tokens. No claim of overall visual parity is made.
- Native directories correctly render 112 people, 69 organisations, 52 members, 60 speakers, 47 canonical news, 15 papers, ten events, 16 groups, ten guides, six hardware, ten software and ten canonical policies. Their layout/data and image gaps remain.
- Event filters are ignored and events sort by title. Both Past and Upcoming lists, and the homepage Upcoming section, include all ten events. At the audit date, source dates identify **eight past and two upcoming** events.
- All ten events and three undated canonical news articles display **10 October 2026** on cards through Jekyll's fallback document dates, not source publication/event dates. The undated articles are `beyond-software-patching`, `cheri-tag-bit-transport-overlay-standard-version-0-9-released`, and `cheri-zephyr-v0-4-0-release`. Preserve truly unknown dates; derive events from their genuine date definitions.

### Navigation, footer and explicit master-prompt conflicts

The header has the required five categories: **Discover CHERI; Adopt; Build; CHERI Alliance; News & Events**. Its current submenu data and all footer/social destinations are captured in the theme inventory; local destinations resolve. A read-only request to `https://cheri-alliance.github.io/` returned a proxy **403 CONNECT rejection**, so current live submenu parity is **not verified**. No missing labels were invented.

The footer currently has **four groups**: Updates, CHERI Alliance, Legal, **Explore**. The user master prompt requires exactly the first three. Only **LinkedIn** is configured; the prompt requires **Slack, LinkedIn, Mastodon, GitHub and YouTube**. The supplied reference gives all five explicit destination URLs; three ZIP SVGs exist (Slack/LinkedIn/Mastodon), while matching licensed GitHub/YouTube icons remain to be supplied in Phase 6.

Other explicit conflicts are the non-generated board list, dormant named list layouts, hardcoded source card fragments, missing single full-width native Where next, missing homepage slider, non-square detail portrait treatment, reordered author/speaker cards and fabricated fallback dates. Foreground opacity **passes the sampled browser check**; it is not an evidenced defect requiring a blanket style rewrite.

## Fresh validation and limits

| Check actually executed | Result |
| --- | --- |
| Native `bundle exec jekyll build --destination /tmp/cheri-phase0-native-site` | **PASS**, 62.034s; github-pages 232 / Jekyll 3.10.0 / Liquid 4.0.4 / Kramdown 2.4.0 / Ruby 3.3.8. |
| Original ZIP reference build using the same Pages bundle | **PASS**, 10.736s. Only the reference output's Google Fonts import was replaced with the same local Poppins for browser comparison. |
| `scripts/ruby.sh scripts/check_markdown.rb` | **PASS**, all 476 editorial Markdown files, native Kramdown, valid image classes/local assets, no prohibited CMS classes. Uses prepared Kramdown 2.5.1; native build uses 2.4.0. |
| Migration Python `-m unittest discover -s tests -v` | **PASS**, 30 tests in 2.873s; converter/acquisition-state unit tests, not full site acceptance. |
| Current source/output original assets | **PASS**, 430 mapped source checksums and built bytes. |
| Native route/anchor/style scan | **FAIL**, one broken `/search/` link on `404.html`; 59,769 local references across 481 HTML pages plus seven stylesheet dependencies checked. |
| Historical body/catalogue comparisons | **304 pass, 87 fail** on extra heading/text only; diagnosis above. 376 captured source URL mappings plus 15 catalogue entries. |
| Current relation target/evidence presence, board IDs, reverse sets | **PASS**; ordered forward list rendering **fails in 16 cases**. |
| Existing `scripts/check_entities.py` | **FAIL** at its final assertion that `_data` contains only `governing-board.yml`; native implementation also has `forms.yml`. No historical report was overwritten. |
| Existing `check_build.py`, `check_site_links.py`, `check_website.py` | **CANNOT COMPLETE**: exit 1 because removed plugin output `site-build.json` is missing. Website validator also still expects removed search/filter outputs. Fresh independent native audits above ran without inventing that metadata. |
| Existing `check_theme.py` | **FAIL** at the historical byte-equality assertion for `_includes/header.html`; current header uses the native config adapter. Fresh per-file comparisons retained separately. |
| Browser: 14 routes × 375/768/1024/1440px | **56 observations**: all HTTP 200, local Poppins loaded, zero broken images, zero faded foreground images/ancestors, zero JS errors; **one overflow** on `/news/one-bug-is-all-it-takes/` at 375px. |
| Keyboard mobile menu/submenu/Escape; image dialog/Escape/focus return | **PASS** on tested routes. |
| No-JavaScript people/members/contact/newsletter | **PASS** for visible content, 112/52 directory links and non-submitting forms. |
| Eight computed-style comparisons: light/dark × four widths | Matching shared styles; **intro/composition differences recorded**. Not overall page-parity acceptance. |

Browser routes include home, board, members, speakers, full and name-only people, organisation, two news articles, event, paper, platform table, contact and newsletter. See [browser.json](phase-00-evidence/browser.json). Slider autoplay, reduced-motion and hidden-tab behaviour cannot be exercised on the production output because no slider is instantiated. No external links/services were submitted to or exhaustively checked. No project-baseurl build, exhaustive keyboard/screen-reader audit, fresh external capture or live deployment validation is claimed. Root-site canonical URLs are correct.

Retained 1440px viewport captures: [home](phase-00-evidence/home-1440.png) and [board](phase-00-evidence/board-1440.png). The board capture shows the source portrait occupying full content width instead of a generated person card; these are baseline observations, not redesigned pages.

The supplied ZIP's sample records/placeholders were not copied into editorial production content. Retained source text includes `TBD include registration iframe` in the archived newsletter and a genuine engineering `TODO` in the Linux roadmap; these must be classified as source quotations, not disguised or replaced with invented copy.

Historical documentation conflicts to reconcile in Phase 8 include 477 files/482 outputs, 48 exact ZIP files, active search/filter descriptions, `_data` having only one file, plugin-generated date/role output, old project baseurl/custom deployment instructions and earlier “all checks pass” claims. Their evidence was preserved rather than overwritten by this audit.

## Prioritised checklist for Phases 1–8

Phases still run in the requested sequence. **P0** means content/relationship correctness or missing required functionality; **P1** means presentation/accessibility; **P2** means consolidation/documentation. All items below are future implementation work.

### Phase 1 — Theme primitives and images

- [ ] **P1:** Preserve the verified ZIP palette, original logos/favicon/honeycomb and local Poppins; do not replace correct shared files. Review the ten documented differences individually.
- [ ] **P1:** Resolve evidenced intro typography/composition adapters while preserving every paragraph. Do not change token values to compensate for absent breadcrumbs/intro data. Coordinate shared heading work with Phase 2.
- [ ] **P1:** Investigate the 375px article overflow, and retain opaque images/ancestors. Recheck the four required widths. Keep natural asset bytes/ratios; square portrait presentation belongs with Phase 3 data integration.

### Phase 2 — Universal cards and shared components

- [ ] **P0:** Make authentic thumbnail resolution work after document Markdown conversion. Current directories have zero images despite genuine media; keep a clean no-image case.
- [ ] **P0:** Map existing Where next/Related content destinations to the native single-card/multi-card components, preserving all source body/evidence content and forbidding a Where next description. Native includes currently have zero production users.
- [ ] **P1:** Establish one heading/intro rendering path; prevent synthetic duplicate H1s and preserve source fragment IDs, complete text, print-archive chapter content and reading order.
- [ ] **P1/P2:** Consolidate generic cards/layout adapters rather than maintaining source card fragments or separate listing paths. Preserve the currently passing keyboard overlay/Escape and scrolling-table behaviour.

### Phase 3 — People, speakers and board

- [ ] **P0:** Render the nine ordered board IDs via the people-list/card system; preserve genuine board prose and provenance of replaced presentation fragments.
- [ ] **P1:** Put the verified 60-speaker selection through the same people-list path without accidentally listing all 112 people twice. Reuse the 63 available genuine portraits; leave 49 name-only people without invented biographies/images.
- [ ] **P1:** Ensure shared person detail uses a square source portrait and retains reverse news/event/paper/organisation links and established `/people/:id/` URLs. No canonical duplicates are currently evidenced.

### Phase 4 — News, events and ordered relationships

- [ ] **P0:** Iterate explicit author/speaker ID arrays in their stored order. Recheck all 15 paper author lists and the 39-speaker Blossoms 2026 list; retain already resolving forward/reverse memberships.
- [ ] **P0:** Restore date-aware events and past/upcoming selection from actual published definitions: eight past/two upcoming at this baseline. Eliminate title-only ordering and fallback build dates.
- [ ] **P0:** Suppress unverified fallback dates for the three genuinely undated canonical news records; preserve all known dates. Keep `_news` and exclude alternate duplicates.
- [ ] **P1:** Keep the 22 canonical bylined news articles' Authors cards below their complete bodies, with source images where available; use source event dates/locations in landscape cards.

### Phase 5 — Organisations and other directories

- [ ] **P0/P1:** Adapt dormant `members` to `site.organisations` and `news` to `site.news` before selecting named layouts. Avoid duplicate lists from the current `site-features` path.
- [ ] **P1:** Keep the 52-member predicate, authentic logos/affiliations and all other collection counts; use the shared cards and suitable list/detail layouts throughout.
- [ ] **P2:** Introduce source-backed parent relationships where justified to activate the currently unused `index` layout, preserving real hub text and canonical paths. Do not manufacture hierarchy or full-paper content.

### Phase 6 — Homepage, navigation, footer, socials, forms

- [ ] **P0:** Instantiate the ZIP slider with genuine existing content/media and real destinations; none exists now. Preserve the complete home body and dark hero. Exercise five-second autoplay, focus/visibility pause, reduced motion and no-JS first slide.
- [ ] **P0:** Remove the extra Explore footer group; configure the five explicit social destinations from the master prompt and add appropriately licensed matching GitHub/YouTube SVGs.
- [ ] **P1:** Reconcile live submenu labels/destinations when a read-only online check is available; preserve the five verified top-level categories and keyboard/mobile behaviour.
- [ ] **P1:** Keep forms visibly non-submitting and real service links; remove residual unused filter messaging if still present. Verify home single Where next after Phase 2.

### Phase 7 — Body fidelity, routes and redirects

- [ ] **P0:** Re-run all 391 source/catalogue comparisons after heading repairs; report exact exceptions for print archives without truncating content or weakening signatures.
- [ ] **P0:** Repair the 404 page's stale `/search/` link without reinstating the removed search feature. Keep the five existing static redirects and validate all canonical/fragment/source-alias targets.
- [ ] **P1:** Recheck all 476 source/output mappings, 430 original asset mappings, canonical metadata, sitemap and robots. Test project-baseurl behaviour separately if required, without changing the root production configuration.
- [ ] **P1:** Keep original source placeholders and unacquired external content explicitly classified. No new crawl or external PDF acquisition is authorised.

### Phase 8 — Integration, validation and handoff

- [ ] **P0:** Replace/adapt validators tied to deleted `site-build.json`, search/filter generators and the one-file `_data` assertion. Do not reintroduce unsupported Ruby plugins or a custom deployment workflow to make old tests pass.
- [ ] **P1:** Re-run native build, content/assets/links/relationships, table/overlay/menu/slider/disabled-form/no-JS checks and four-width ZIP comparisons after all phases. Resolve the recorded mobile overflow and all measured failures.
- [ ] **P2:** Update theme hashes/adapters and authoring/deployment docs to the actual native implementation. Keep this Phase 0 evidence and earlier reports as dated baselines.
- [ ] **P0:** Deliver a reviewable branch with exact passing/failing/blocked checks. No automatic PR, merge, `main` push, DNS/Pages change or deployment.

## Reproduction and changed files

The runtime was installed outside the repository. The existing cloud runtime had Jekyll 4.3.4, so a separate bundle was prepared using an exact copy of the repository Gemfile and the ZIP lockfile. Missing Ruby development headers were installed into the private workspace runtime; all package/TLS checks remained enabled. The resolved 98-gem lock is preserved as [runtime-Gemfile.lock](phase-00-evidence/runtime-Gemfile.lock). No application dependency manifest/lock or setup script was changed. A preliminary Jekyll 4 build is not the reported native baseline.

With Ruby/Bundler available, reproduce the native audit without changing the application's Gemfile:

```sh
mkdir -p /tmp/cheri-phase0-bundle
cp Gemfile /tmp/cheri-phase0-bundle/Gemfile
cp reports/codex-phases/phase-00-evidence/runtime-Gemfile.lock /tmp/cheri-phase0-bundle/Gemfile.lock
export BUNDLE_GEMFILE=/tmp/cheri-phase0-bundle/Gemfile
bundle install
bundle exec jekyll build --destination /tmp/cheri-phase0-native-site
python reports/codex-phases/audit_phase00.py /tmp/cheri-phase0-native-site
python -m unittest discover -s tests -v
```

Use the migration Python environment for the audit/unit commands (`PyYAML`, BeautifulSoup/html5lib and the existing converter dependencies); browser helper uses Playwright plus `/usr/bin/chromium`. To reproduce browser comparisons, extract the retained ZIP into a separate temporary directory, build `basic-site/` with the same bundle, copy `assets/shared/fonts` into that reference output, and replace only its Google Fonts CSS import with `../shared/fonts/poppins-local.css`. Then run:

```sh
python3 reports/codex-phases/browser_phase00.py /tmp/cheri-phase0-native-site /tmp/cheri-phase0-reference-site
```

Actual build output, unit output, legacy failures and independent audit results are in [phase-00-evidence/](phase-00-evidence/). Legacy validators' report files were preserved when running the checks. Audit helpers write only this phase's evidence; they are not production plugins or build steps.

Changed paths are limited to `PROGRESS.md`, a reference link in `docs/THEME.md`, `docs/references/` (original inputs and provenance), and `reports/codex-phases/` (this report, read-only audit helpers and generated evidence). Existing editorial Markdown, configuration, runtime templates/scripts/styles, authentic assets, historical reports and publishing configuration remain unchanged.
