# Phase 2 — Universal cards and shared content components

Verified **10 October 2026 (UTC)** in `adam-3bian/adam-3bian.github.io`, branch `codex/phased-site-transformation`. **Phase 2 only.** The request's final reference to implementing Phase 1 was treated as a typo following the explicit instruction to continue with Phase 2.

## Baseline and delivery

- Starting commit: **`b2135595fe3064cc5811a05c3f6867205d056b49`**. Read the Phase 1 report, fetched the working branch, and confirmed it was current before changing files.
- Ending implementation/evidence commit: recorded by the following report-finalisation commit. Resolve the final delivery SHA with `git log -1 --format=%H -- reports/codex-phases/phase-02.md`; a commit cannot embed its own hash.
- `main` observed at **`7f3839872c8fea6a709b99d241880de0f3915c42`**. No changes, push, merge, deployment, Pages-setting changes or PR publication to `main`.

Read `AGENTS.md`, `TRANSFORMATION_PROMPT.md`, `docs/CODEX_PHASES.md`, the Phase 0/1 findings and relevant theme/authoring/validation guidance. Inspected the actual retained ZIP and built it separately. ZIP integrity passes; SHA-256 remains **`9f097aeace78c13e2f169fdc378f58b64b119993ac031b011ae7a618c7a7325a`**. Its documents and examples are design references, not authority to import sample content or expand scope.

## Implemented

**One card renderer.** `_includes/listing.html` now renders collection records, relationship lists, YAML links, Related pages grids and single Where next CTAs. Existing named list/index templates and relationship includes all reuse it. The ZIP's `.cards`, `.card`, `.card-media`, `.card-image`, `.card-action`, `.columns-2/3/4` and CTA styles remain authoritative. Every card is a single real anchor, supports keyboard navigation and preserves explicit `target`/`rel`, with safe new-tab attributes and project-prefix handling.

Authentic thumbnail resolution now handles both Markdown and Jekyll's converted HTML. Explicit metadata wins; otherwise the record's first local source image is reused. A missing image produces no fake portrait or empty frame. People/member cards default to the ZIP's compact image/title presentation, with square frames and contained logos; news/event frames are 16:9. Dates are limited to chronological card types, avoiding Jekyll fallback build dates on generic people, organisation, paper and topic cards. Source event chronology and undated-news handling remain Phase 4 work.

Fresh directory outputs contain **63 images for 112 people**, **52 images for 52 members**, and **47 images for 47 canonical news articles**. Across the site, **780 card-image occurrences** are verified against images already belonging to their linked source records. People still lacking a genuine portrait stay image-free.

**Real onward data.** Added only `where-next` / `related-pages` front matter to **137 existing records**, based on their actual retained navigation blocks. All **133 Where next sections** now render exactly one full-width card, with title/action and no descriptive paragraph. All **109 Related content sections** use the same renderer for **227 cards**, retaining every original description and action label. Titles resolve from real destination records unless preserving a differing source label requires an explicit override. The **360 destinations** comprise 356 internal routes and four genuine source external URLs; no destination was invented.

The original Markdown bodies remain byte-for-byte intact. The layout replaces their marked onward-navigation fragments at render time, so there is no duplicated raw section alongside the new component. **The 133 Where next descriptions are intentionally omitted from display**, as explicitly required by Phase 2; their complete original wording remains in source and [onward-mapping.json](phase-02-evidence/onward-mapping.json). This is a declared navigation-presentation change, not a claim that those descriptions still appear. Ordinary article paragraphs, Related content descriptions, assets and relationships are preserved.

**Shared heading and introduction path.** The default layout now feeds the existing hero/page-heading includes instead of maintaining duplicate heading markup. It reuses the original first H1 and opening paragraph, preserves preambles/fragment IDs, and retains the former synthetic hero anchor where needed. **140 duplicate synthetic H1s were removed**. In the CHERI-seL4 and Linux-roadmap printed archives, **27 + 3 additional H1 chapter headings become H2**, retaining all words, order and anchors. All **476 editorial outputs now have exactly one H1**. Existing source dates/bylines remain in the complete bodies; the heading adapter does not invent an additional metadata line.

**Image behavior.** Removed the extra `.content .cards img { height: auto; ... }` rule that overrode the ZIP's framed-image height inside articles. Added only a shared spacing rule for preserved card descriptions. Original body-image alignment, natural proportions, containment/cropping classes, captions, image dialog and table scripts remain intact. All original theme tokens, brand/background assets, fonts and JavaScript bytes are unchanged.

Runtime changes: `_includes/{listing,related-pages,where-next,hero,page-heading}.html`, `_layouts/default.html`, `_sass/_site-features.scss`, and the 137 front-matter additions listed in `onward-mapping.json`. Documentation changes: `docs/THEME.md`, `docs/AUTHORING.md`, `PROGRESS.md`, this report and its verification helpers/evidence. No new content record, placeholder asset, Ruby plugin, dependency change, repository workflow or publishing configuration was introduced.

## Verification

Native runtime: Ruby 3.3.8, github-pages 232, Jekyll 3.10.0, Kramdown 2.4.0 and Liquid 4.0.4, using the unchanged Phase 0 lock in the retained private bundle. Existing onboarding instructions and dependencies were sufficient; no new cloud configuration or publication was needed.

| Check | Measured result |
| --- | --- |
| Native root and safe `/cheri-preview` builds | Pass; **481 HTML outputs** each, including the five existing redirects. |
| Actual ZIP reference build | Pass. Reference output alone uses the application's local Poppins for offline visual comparison. |
| Existing regression suite | **30 tests pass**. |
| Native Markdown/front-matter audit | **476 files pass**; original historical validator report restored afterwards. |
| Editorial source preservation | **476/476 Markdown bodies unchanged**, with all prior metadata unchanged. Only the 137 onward metadata additions differ. |
| Rendered editorial fidelity | **476/476 signatures pass** after separately accounting for the declared heading changes and source navigation components. Full text/order, paragraphs, lists, tables, links, images/alts, definitions and code are checked; no unexplained omission. |
| Headings, anchors, canonical URLs | One H1 per editorial page; no lost baseline IDs or duplicate IDs; all 476 root canonical URLs correct. |
| Relationships | All rendered relationship target sequences remain identical to baseline. This preserves membership and existing order; it does not claim Phase 4's source-order repairs are complete. |
| Genuine media | **415 tracked asset/favicon files unchanged**; all **430 original asset mappings** match bytes in root and prefixed builds. All **780 card-image occurrences** belong to the linked source records. |
| Onward components | All 360 titles/destinations/actions match the source mapping; 133 single CTAs without descriptions; 227 Related content descriptions preserved. |
| Production browser checks | **17 routes × four widths = 68 observations**, all HTTP 200, one H1, no viewport overflow, no broken/faded images or JavaScript errors. **1,600 foreground-image observations** decode successfully with opaque image/ancestor chains. |
| ZIP computed-style comparisons | All **eight light/dark × width comparisons** pass shared typography, colours, spacing and generic-card normal/hover/keyboard-focus states. |
| Isolated native component fixture | Pass at **375, 768, 1024 and 1440px**: 2/3/4 desktop columns collapsing to one, square/landscape frames, full-frame images, long unbroken titles, image-free records, Markdown/HTML thumbnail equivalence, explicit contain/position/empty alt, inferred titles, safe external link attributes and one description-free CTA. |
| Keyboard and no-JavaScript checks | Menu/submenu/Escape; card Enter navigation; left/right/full image enlargement, captions, Escape/focus restoration; `no-zoom`; no-JS real cards/links/media and mobile content all pass. |
| All local root links | **59,673 references**, seven CSS/font dependencies; **one existing failure**, `/search/` on the 404 page. Full link validation is not a pass. |
| All project-prefix links | **2,081 remaining source-URL failures**, down from Phase 1's 3,149. **Zero errors among 2,835 generated card/asset references**; seven CSS/font dependencies resolve. Full prefixed-site URL compatibility remains incomplete. |

Evidence: [audit.json](phase-02-evidence/audit.json), [browser.json](phase-02-evidence/browser.json), [source onward mapping](phase-02-evidence/onward-mapping.json), and build/unit/Markdown logs in [phase-02-evidence](phase-02-evidence/). Sampled production screenshots were inspected: [Where next](phase-02-evidence/where-next-1440.png), [Related content](phase-02-evidence/related-pages-1440.png), [members](phase-02-evidence/members-1440.png), plus mobile/desktop component captures. The fixture is generated outside the checkout with genuine existing records/media; none of its test labels or pages is published.

The editorial signature check compares before/after core content while testing each replaced navigation item separately. It does not weaken historical source signatures or pretend the expressly omitted Where next descriptions remain rendered. The 391 historical external-source/catalogue comparisons are Phase 7 work and were not rerun here.

## Commands and reproduction

After building the starting commit into `/tmp/cheri-phase2-before`, run from the repository root with the native bundle and migration Python dependencies:

```sh
bundle exec jekyll build --destination /tmp/cheri-phase2-site
bundle exec jekyll build --safe --baseurl /cheri-preview --destination /tmp/cheri-phase2-project/cheri-preview
bundle exec jekyll build --source /tmp/cheri-phase2-reference/basic-site --destination /tmp/cheri-phase2-reference-site
python -m unittest discover -s tests -v
bundle exec ruby scripts/check_markdown.rb
python reports/codex-phases/fixture_phase02.py /tmp/cheri-phase2-fixture-final
bundle exec jekyll build --source /tmp/cheri-phase2-fixture-final/source --destination /tmp/cheri-phase2-fixture-final/site/cheri-preview
python reports/codex-phases/audit_phase02.py /tmp/cheri-phase2-before /tmp/cheri-phase2-site /tmp/cheri-phase2-project/cheri-preview
python3 reports/codex-phases/browser_phase02.py /tmp/cheri-phase2-before /tmp/cheri-phase2-site /tmp/cheri-phase2-reference-site /tmp/cheri-phase2-project /tmp/cheri-phase2-fixture-final/site
git diff --check
```

Here `sh /workspace/cheri-native-bundle.sh` substitutes for `bundle`, and migration Python is `/workspace/cheri-migration-venv/bin/python`; system Python provides Playwright with `/usr/bin/chromium`. As in Phase 1, copy local fonts into the separate ZIP output and replace only that output's Google Fonts URL before browser comparison. Preserve the tracked Markdown-validator report when running its script. These phase helpers write their own evidence; do not overwrite historical evidence in a later phase. The fixture generator requires a new temporary target directory.

## Remaining work and handoff

**Phase 2's shared-component exit gate passes.** Later phases can reuse this renderer and its tested media/link behavior.

- **Phase 3:** Activate the ordered board registry and named people-list layouts; finish square portrait/detail integration. The board's original source portrait/list fragments are retained for that phase.
- **Phases 4–5:** Preserve source author/speaker ordering (the same 16 baseline mismatches remain), repair event chronology and fallback dates on undated chronological records, select the canonical collection layouts, and finish collection-specific source directory fragments. The 18 records with `collection-card__` source fragments are unchanged editorial evidence, not a second runtime card renderer. No new handwritten card markup was added to Markdown.
- **Phase 6:** Homepage slider data, footer/social configuration and remaining entry-point integration are unchanged. No production slider was available to test.
- **Phase 7:** Repair `/search/` and the remaining root-relative source-body/breadcrumb URLs in prefixed deployments; rerun full immutable-source comparisons with the explicit navigation/heading transformation evidence. No external scrape or PDF acquisition occurred.
- **Phase 8:** Modernise legacy validators that expect removed plugin metadata, search/filter functionality or old exact template hashes. They were not rerun or reported as passing here.

Browser verification uses representative Chromium coverage, plus the isolated component fixture; it is not every page, Firefox/WebKit or hosted Pages testing. Original image ratios are retained where forced cropping would be inappropriate. Four genuine external onward URLs are preserved from source, without claiming a fresh external availability audit. Forms remain disconnected and were not submitted. No live deployment was performed.
