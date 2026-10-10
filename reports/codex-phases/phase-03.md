# Phase 3 — Canonical People, Speakers and Governing Board

Verified **10 October 2026**, in `adam-3bian/adam-3bian.github.io` on `codex/phased-site-transformation`. **Phase 3 only.**

## Baseline and delivery

- Starting commit: **`71969d69c2ed90aec6ba6291f80dd4d658c5c110`**. Read Phase 2 before implementation, fetched the working branch and confirmed it was current. Reviewed Phase 0, `AGENTS.md`, `TRANSFORMATION_PROMPT.md`, `docs/CODEX_PHASES.md`, relevant runbooks, actual people records and ZIP layouts/specifications.
- Ending implementation/evidence commit: **recorded after committing**. A following documentation-only commit records that SHA; resolve the final delivery SHA with `git log -1 --format=%H -- reports/codex-phases/phase-03.md`.
- Remote `main` observed at **`7f3839872c8fea6a709b99d241880de0f3915c42`**. No changes, merge, push, deployment or publishing-setting changes to `main`.
- Authoritative ZIP integrity passes; SHA-256 remains **`9f097aeace78c13e2f169fdc378f58b64b119993ac031b011ae7a618c7a7325a`**. Its sample records remain outside production.

Reused the previously verified cloud-onboarding native bundle without changing dependencies, manifests or environment configuration: Ruby 3.3.8, github-pages 232, Jekyll 3.10.0, Kramdown 2.4.0 and Liquid 4.0.4.

## Implemented

**One people collection and named list layout.** Governing Board, Speakers and `/people/` now select `_layouts/people.html`, which calls the universal `listing.html` renderer. The board resolves the existing nine `_data/governing-board.yml` IDs in exact registry order. Speakers selects only the 60 unchanged `speaker: true` records, alphabetically. The complete directory lists all 112 people alphabetically. Each card links the existing `/people/:id/` route; there is no second speaker/board collection, copied biography or manual runtime board-card renderer. The older `site-features` directory adapter skips pages owned by `people`, preventing duplicate lists.

**Board source preservation.** The genuine introduction, explanatory paragraphs, Current board anchor and closing paragraph stay in their original positions. The original nine presentation fragments remain byte-for-byte in Markdown as provenance, explicitly marked by `listing.source-fragments: true`. The layout replaces that block with canonical cards at render time. Each card preserves its published affiliation, role and View profile action by reading the existing canonical person's definition list; no duplicate role metadata was introduced. Speakers retains the ZIP's compact image/title-only cards.

All **nine board card images now use the canonical profile portrait**, matching the person's detail page. The previous board-specific images remain in the unchanged Markdown and original asset files. This is an explicit presentation substitution, not a claim that those nine former images still appear on the board. [The audit mapping](phase-03-evidence/audit.json) records every old/new image, name, role, affiliation and destination.

**Shared person details.** All 112 records continue to inherit the native `person` layout. It reuses each existing first source portrait in place with the ZIP's square-image class, preserving original alt text, alignment, captions, body order and surrounding content. The same genuine image is used on every person card. An explicit native `thumbnail` overrides the primary portrait on both surfaces without duplicating it; the metadata-only path remains supported. All **63 original portraits** are reused; the **49 name-only records** remain unchanged and image-free. No fabricated biography, affiliation, role or asset was added.

Existing derived reverse sections remain intact: **22 canonical news-author edges, 97 event-speaker edges, 174 paper-author edges and 67 organisation affiliations**, checked for all 112 profiles against stored IDs. Alternate news remains excluded. All nine board profiles retain their board backlinks. Forward source-order repair remains Phase 4 work.

Runtime changes: `_layouts/{people,person}.html`, `_includes/{listing,site-features}.html`, and front matter only on the board, Speakers and People directory pages. All `_people` files, registry IDs, collection configuration, Sass, JavaScript, assets and dependency manifests are unchanged. Documentation/evidence: `docs/{AUTHORING,THEME}.md`, `PROGRESS.md`, this report, three phase verification helpers and `phase-03-evidence/`.

## Verification

| Check | Fresh result |
| --- | --- |
| Native root and safe `/cheri-preview` builds | Pass; **481 HTML outputs** each, including five existing redirects. |
| ZIP reference and isolated person fixture builds | Pass; genuine records/media only in the fixture; ZIP samples confined to the separate reference output. |
| Existing regression suite | **30 tests pass**. |
| Native Markdown/front-matter audit | **476 files pass**; tracked historical validator report restored afterwards. |
| Editorial source preservation | All **476 Markdown bodies unchanged**; all **112 people files byte-identical**. Only three directory layout/selection front-matter changes. |
| Rendered editorial fidelity | **476/476 signatures pass**, with the board's nine replaced cards independently checked and new directory lists excluded from the prose comparison. All other full text, headings, links, images/alts, tables, definitions and code remain exact. |
| Headings, anchors, canonicals | All 476 pages have one H1; no lost baseline anchors or duplicate IDs; canonical routes unchanged. |
| Directory membership/order/media | Board **9 cards / 9 portraits**, Speakers **60 / 60**, People **112 / 63**. Each has exactly one directory; every ID and canonical destination resolves. |
| People and relationships | All 112 profiles preserve genuine bodies/portraits and have correct derived reverse target sets; every rendered relationship sequence remains unchanged across all 476 outputs. |
| Original media | **415 tracked asset/favicon files unchanged**; all **430 original asset mappings** match bytes in both builds. |
| Production browser coverage | **14 routes × four widths = 56 observations** at 375, 768, 1024 and 1440px; no horizontal overflow, broken/faded foreground images, duplicate H1 or JavaScript error. |
| Project-prefix browser coverage | **Five routes × four widths = 20 observations**; generated people cards, portraits and shared assets resolve. |
| Actual ZIP style comparisons | **Eight comparisons pass**: people card/grid styles and normal/hover/keyboard-focus states, plus square detail portrait dimensions, fit, position and float behavior at all four widths. |
| Keyboard, overlay, no JavaScript | Board card and reverse news/event/paper navigation; original-image enlargement, Escape and focus return; all three directories plus portrait/name-only details without JavaScript at 375/1440px pass. |
| Explicit-thumbnail fixture | All four widths pass raw/converted canonical board-fact equivalence, empty alt, containment/right positioning, one portrait with existing body media and one with metadata-only media. |
| Full local root link audit | **59,673 references**, seven CSS/font dependencies; **one pre-existing error**, `/search/` on the 404 page. Full-site links are not yet all valid. |
| Full project-prefix link audit | **2,000 existing source-URL failures**, down from 2,081; **zero failures among 2,853 generated card/image references**. Full project-prefix compatibility remains incomplete. |
| Git whitespace check | `git diff --check` passes. |

Evidence: [audit.json](phase-03-evidence/audit.json), [browser.json](phase-03-evidence/browser.json), [deferred relationship order](phase-03-evidence/deferred-relationship-order.json), and build/unit/Markdown logs in [phase-03-evidence](phase-03-evidence/). Desktop/mobile board, person and name-only screenshots were inspected; see [board](phase-03-evidence/governing-board-1440.png), [board card](phase-03-evidence/board-card-1440.png), [person](phase-03-evidence/robert-watson-1440.png) and [name-only mobile](phase-03-evidence/anthony-fox-375.png).

## Reproduction

Build the starting commit separately into `/tmp/cheri-phase3-before`, then run from the working repository:

```sh
bundle exec jekyll build --destination /tmp/cheri-phase3-site
bundle exec jekyll build --safe --baseurl /cheri-preview --destination /tmp/cheri-phase3-project/cheri-preview
bundle exec jekyll build --source /tmp/cheri-phase3-reference/basic-site --destination /tmp/cheri-phase3-reference-site
python -m unittest discover -s tests -v
bundle exec ruby scripts/check_markdown.rb
python reports/codex-phases/fixture_phase03.py /tmp/cheri-phase3-fixture
bundle exec jekyll build --source /tmp/cheri-phase3-fixture/source --destination /tmp/cheri-phase3-fixture/site/cheri-preview
python reports/codex-phases/audit_phase03.py /tmp/cheri-phase3-before /tmp/cheri-phase3-site /tmp/cheri-phase3-project/cheri-preview
python3 reports/codex-phases/browser_phase03.py /tmp/cheri-phase3-site /tmp/cheri-phase3-reference-site /tmp/cheri-phase3-project /tmp/cheri-phase3-fixture/site
git diff --check
```

In this environment, `sh /workspace/cheri-native-bundle.sh` substitutes for `bundle`; migration Python is `/workspace/cheri-migration-venv/bin/python`, while system Python provides Playwright/Chromium. The fixture requires a new target directory. Extract the retained ZIP for the reference build; copy application `assets/shared/fonts` into that separate output and replace only its compiled CSS Google Fonts URL with `../shared/fonts/poppins-local.css`. Preserve the tracked Markdown-validator report when running its script. Phase 3 helpers write only Phase 3 evidence, not earlier reports.

## Remaining work and handoff

**Phase 3's exit gate passes.** Board, speaker and person appearances resolve one canonical record per person. No Phase 3 ID, relationship, portrait or content-preservation issue remains unresolved.

- **Phase 4:** the same **16 forward-order mismatches** remain (15 paper author lists and CHERI Blossoms 2026 speakers). Event chronology/filtering and fallback dates on undated news/events are unchanged. Reverse target sets are correct; that does not claim forward order or dates are repaired.
- **Phases 5–6:** other canonical directory integration, remaining legacy source presentation blocks, homepage slider, footer groups and five social destinations remain pending.
- **Phase 7:** repair `/search/` and remaining root-relative source URLs; perform immutable historical-source comparisons. Phase 3 compares to the latest Phase 2 content, not a fresh external acquisition.
- **Phase 8:** legacy validators still expect removed plugin metadata or older theme/search behavior. They were not reported as passing here; current evidence uses native builds and independent output checks.

Browser evidence covers representative Chromium pages plus the isolated fixture, not every page or browser. No live deployment, external availability audit, new scraping, PDF acquisition, form submission or production setting change occurred.
