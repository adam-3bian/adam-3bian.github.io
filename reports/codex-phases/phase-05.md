# Phase 5 — Organisations and all other directories

Verified **10 October 2026 (Europe/London)** on `codex/phased-site-transformation`.

## Baseline and delivery

Starting commit: **`f000ccde5c526ba573a23dcf1cc5524f469dc92c`**. Read Phase 4, fetched the working branch and confirmed it was current. Reviewed repository instructions and the actual retained ZIP's specification, authoring examples and list/detail components. The user requested Phases 5 and 6 together; this report covers Phase 5. The ending implementation commit is recorded in the following phase's delivery update.

Reused the cloud-onboarding native github-pages 232 / Jekyll 3.10.0 environment. No dependency, setup-draft or deployment changes. ZIP SHA-256 remains `9f097aeace78c13e2f169fdc378f58b64b119993ac031b011ae7a618c7a7325a`.

## Implementation

- Activated `members` against canonical `_organisations`, selecting exactly **52 verified members**. The **69-organisation** directory remains inclusive of source-named nonmembers. All genuine logos remain linked; organisation details now reuse their existing primary logo in place with a contained square frame. **21 founding members** display the designation from their existing Status definitions. Name-only records stay name-only.
- Activated the native generic `list` layout with grouped `listing.collection` for organisations, papers, hardware, software, policies, guides and groups. Full introductions precede cards. Removed the redundant string-listing adapter and obsolete filter-empty message from `site-features`.
- Five section hubs now use `index`, deriving **91 child links** through parent references/defaults: Discover 28, Adopt 19, Build 18, Alliance 14 and News & Events 12. Their original curated prose/link lists remain before the derived cards. Parent references also provide breadcrumbs where source breadcrumbs are absent. Both existing pages titled Working Groups retain their distinct URLs; alphabetical ordering does not prescribe their tie order.
- All **216 remaining source-card entries** now share `listing.html`'s native card shell, at their original positions. A minimal block adapter preserves every image/alt, label, status/date/location, heading, summary, action and curated order. This covers working groups, software, event series, related-event entries, the job opportunity and five retained source-version directories. Those historical directories retain their captured membership/content rather than being overwritten by current feeds. No copied demonstration data or one-off card HTML was added to editorial Markdown.
- All **476 source bodies**, source links/downloads, relationship targets and original assets remain intact. Paper records stay catalogue records with genuine publication links; no full PDF acquisition or invented profile text is implied.

Runtime changes: `_config.yml`, `_includes/{listing,site-features,source-card-groups}.html`, `_layouts/{default,index,list,member,members}.html`; front matter only on 16 index/hub pages. Documentation: `docs/{AUTHORING,THEME}.md`, `PROGRESS.md`, this report and evidence/helpers. No Sass, JavaScript, original images, collection definitions or publishing workflow changes.

## Fresh verification

| Check | Result |
| --- | --- |
| Native root and safe `/cheri-preview` builds | Pass, **481 HTML outputs** each. |
| Actual ZIP reference build | Pass, with application-local Poppins copied only into temporary reference output. |
| Existing regressions and native Markdown audit | **30 tests pass; 476 Markdown records pass.** Historical validator output restored. |
| Editorial and rendered preservation | **476 body hashes and prose signatures pass**. All 216 converted fragments independently match text/order, headings, destination and original image/alt. |
| Canonicals, anchors and relationships | All 476 routes/canonicals retained, one H1 each, no duplicate/lost IDs; relationship target arrays unchanged. |
| Directory membership/order | 69 organisations, 52 members, 15 papers, six hardware, ten software, 16 groups, ten guides and ten canonical policies. The alternate policy remains available at its existing route. All five parent-derived hubs match real records. |
| Original assets | **415 tracked asset/favicon sources unchanged**; static assets byte-match both outputs, SCSS has its compiled output. |
| Browser | **27 routes × four widths = 108 views** at 375/768/1024/1440px: no overflow/JS errors, images decode and remain opaque. Includes every collection and representative details, genuine/name-only organisations and archived directories. |
| ZIP style comparison | Four member-card/grid/typography/hover/focus comparisons pass. |
| Keyboard and no-JS | Five keyboard card navigations and four no-JS directory views pass. |
| Project browser | 20 views pass for generated card and primary-logo images. |
| Full root links | **59,815 local references**, one existing `/search/` error on 404. |
| Full project-prefix links | **1,406 retained source URL errors**, zero errors among **3,329 generated card/image references**. |
| Whitespace | `git diff --check` passes. |

Evidence: [audit.json](phase-05-evidence/audit.json), [browser.json](phase-05-evidence/browser.json), build/unit/Markdown logs and inspected screenshots in [phase-05-evidence](phase-05-evidence/).

Reproduce with a separate Phase 4 baseline build, then:

```sh
bundle exec jekyll build --destination /tmp/cheri-phase5-site
bundle exec jekyll build --safe --baseurl /cheri-preview --destination /tmp/cheri-phase5-project/cheri-preview
python -m unittest discover -s tests -v
bundle exec ruby scripts/check_markdown.rb
python reports/codex-phases/audit_phase05.py /tmp/cheri-phase5-before /tmp/cheri-phase5-site /tmp/cheri-phase5-project/cheri-preview
python3 reports/codex-phases/browser_phase05.py /tmp/cheri-phase5-site /tmp/cheri-phase56-reference-site /tmp/cheri-phase5-project
```

Here `sh /workspace/cheri-native-bundle.sh` substitutes for `bundle`; migration Python is `/workspace/cheri-migration-venv/bin/python`, system Python provides Chromium/Playwright. Extract/build the tracked ZIP separately for reference styles; copy local fonts and replace only the reference compiled CSS Google Fonts URL as described in Phase 4. Preserve the historical Markdown validation JSON when rerunning its script.

## Exceptions and handoff

Phase 5's directory exit gate passes. Root `/search/` and historical project-prefix body links remain Phase 7 work; full-site link validation is not entirely passing. Source-card dates/status labels are captured editorial evidence, unlike the separately derived chronological indexes. Original truncated source excerpts remain original excerpts. Browser coverage is representative Chromium, not a hosted deployment or every browser. Legacy plugin/search validators still require Phase 8 modernization.

Phase 6 follows in this user-authorized task. No external editorial acquisition, PDF download, form submission, main modification, merge or deployment occurred.
