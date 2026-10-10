# CHERI content and authoring progress

## Native GitHub Pages conversion — 10 October 2026

Direct commit `0033782e982284241b63c23377c2927c1e525f38` removes the repository-owned GitHub Actions workflow and five custom Ruby plugins. Native Liquid collections, search-index/sitemap/robots, relationships, directory rendering, content heading/breadcrumb presentation and explicit compatibility redirects replace those generators. The `github-pages` Gemfile and empty baseurl publish as the `adam-3bian.github.io` **user-site root**. Original editorial Markdown and assets were not edited.

GitHub's managed Pages run [38026622317](https://github.com/adam-3bian/adam-3bian.github.io/actions/runs/38026622317) completed with **successful Jekyll build and deployment**. A native build is now established, but desktop/mobile ZIP comparison, content equivalence, search/directory/relationship behavior, link/asset audit and browser flows **were not rerun**. The historical checks listed below were conducted under the earlier custom workflow; do not infer that they all passed on the new pipeline. See `docs/VALIDATION.md` for next verification steps.


## Current website

The uploaded simplified-authoring starter supplies the theme, styles and navigation controls. Its demonstration content and placeholder images were not imported. Existing collections and full source bodies remain in use. The complete site uses the starter’s heroes and flowing profile layouts and adds generated linked directories, full-body search, working section hubs, dated event lists, canonical URLs, sitemap, a branded 404 and disconnected contact/newsletter forms. The latest configuration uses native GitHub Pages branch-source publishing; see the dated conversion note above and docs/DEPLOYMENT.md.

477 editorial Markdown files: 371 distinct complete source-page bodies, 15 full published paper catalogue entries, 65 minimal source-named people/organisation records, and 26 published editions, section hubs, directory/search/error pages. 9 original source bodies are retained as alternate reference versions while their primary routes use the declared published editions.

- `_events/`: 10 files.
- `_groups/`: 16 files.
- `_guides/`: 10 files.
- `_hardware/`: 6 files.
- `_news/`: 56 files.
- `_organisations/`: 69 files.
- `_papers/`: 15 files.
- `_people/`: 112 files.
- `_policies/`: 11 files.
- `_software/`: 10 files.
- `pages/`: 162 files.

Only `_data/governing-board.yml` remains: nine short people references. Organisation and paper metadata lives in its Markdown records; acquisition/provenance metadata moved to reports. `member: true` and `speaker: true` select directories; `organization`, `speakers` and `authors` link records by filename. Reverse event/publication/news/organisation links are generated. No biographies, current affiliations or unnamed contributors were invented.

Canonical filenames and URLs omit source hosts. Distinct alternate source versions are retained with `-original` filenames and `alternate: true`. HTML-file technical references use `/reference/` to prevent collisions with directory indexes. The menu retains the primary site's five headings and published groups, with hardware/software/paper indexes and original-site Morello return information added.

## Final checks

- Markdown-only audit: 477 passed.
- Complete captured source bodies: 376 URL mappings passed; checks include text order, heading IDs, paragraphs, lists, table cells, definitions, links, code and original image references.
- Live source recheck: 371 distinct pages passed; 0 changed; 0 failed. Individual acquisition timestamps are in `reports/live-source-validation.json`.
- HTTP builds: 376 source mappings on 371 routes, plus 15 catalogue-entry routes, passed.
- Local links: 61404 references across 482 rendered pages, plus 7 active CSS/font dependencies; 0 missing targets/anchors.
- Published website: 1164 checks passed; 456 searchable pages, event chronology, directory counts, exact edition changes, disabled forms, canonical/sitemap routes, compatibility redirects and HTTP 404.
- Browser user flows: 12 passed for search recovery, contributor search, role filters, keyboard navigation, responsive layouts, disconnected forms and JavaScript-free fallbacks.
- Build: the prepared runtime passes at the configured project path. Earlier domain-root and exact locked Bundler validation remains historical evidence; those were not rerun for this presentation change. Public domains are unchanged.
- Relationships, roles, citation names and board references: `reports/entity-validation.json`.
- Regression tests: 30 passed.
- Browser: 15 desktop/mobile template scenarios passed visible source text, decoded original images, Poppins loading, overflow, menu and submenu checks. The requested starter theme supersedes earlier source pixel geometry checks.
- Original assets: 430 acquired URL mappings; checksums verified over HTTP.

Three source image 404s were repaired using original assets published for the same organisation/event; two source fragment typos now target actual published headings. These deliberate URL corrections are separate from content comparisons: `reports/source-image-repairs.json`, `reports/source-link-repairs.json`. Proven legacy profile/topic links resolve locally through `reports/source-route-aliases.json`. Complete originals retain their source labels and body text. Published edition changes are explicit in website-editions.json and do not overwrite original source bodies.

## Direct ZIP theme replacement (10 October 2026)

The earlier partial integration retained source-theme overrides and did not match the requested presentation. The ZIP’s actual layouts, includes, Sass modules, branded/background assets and scripts were imported directly: 48 files remain byte-identical to the ZIP, with eight documented adapters for local fonts, intact source headings/anchors, directory metadata and existing functional sections. Native heroes apply to ordinary pages; original opacity/watermark settings and flowing profile layouts are restored. `_website.scss` and `_migration-content.scss` were removed.

All 477 existing editorial files remain byte-for-byte unchanged. The goals in `AGENTS.md`, `START_PROMPT.md`, `MIGRATION_SPEC.md`, the legacy acquisition prompt/spec and the prompt-pack README now clearly distinguish content fidelity from theme presentation. Theme changes do not start a new scrape. `docs/THEME.md` records the visual authority and supported adapters.

The site was compared with a separate build of the ZIP at desktop and mobile widths in light and dark modes. Computed palette, watermark, typography, hero spacing, card surfaces and footer styles match. Full content signatures, 430 asset checksums, local links, author relationships, 30 regression tests, 15 desktop/mobile scenarios and 12 user flows pass. `scripts/check_theme.py` checks ZIP file integrity and active theme components in CI; its optional `--reference-site` mode performs the rendered comparison. Evidence is in `reports/template-integration.json` and `reports/theme-validation.json`.

These are local working-tree changes. They have not been committed, pushed or deployed through GitHub Pages. Cloud-environment publication and site deployment are different operations.

## Earlier news authors and partial template alignment (10 October 2026)

The supplied `cheri-alliance-starter-kit-simplified-authoring (3).zip` was compared with the existing theme. Its stylesheet modules, brand assets and scripts were already integrated. Shared breadcrumb, page-heading and homepage hero includes now follow its layout structure while preserving source Markdown bodies. Existing navigation, search, directory filters, source-backed profile details and disconnected forms remain functional. Template demonstration content was not imported.

28 news records now reference explicit bylined authors (22 canonical articles and six retained original versions). Existing people were reused; Benjamin Fletcher, Jim Wallace and Mihai Ordean have name-only records. The Andrew Lindsay and Mihai Ordean canonical articles use explicit bylines from their separately retained original versions, with that provenance recorded rather than silently merging bodies. News links to authors, profiles list canonical news newest first, and the people Author filter includes paper and news authors. Mentioned or interviewed people without an authorship byline were not assigned as authors.

342 CMS class occurrences were removed from 80 documents, including Elementor, WordPress captions, TablePress, widget classes and conversion-only `source-div-text`. Text, heading IDs, tables, links, image references, captions and semantic alignment classes passed before/after rendered signature comparison. The converter prevents CMS classes returning; the Markdown validator rejects them. Original download URLs and real fragment anchors remain intact. Cleanup evidence is in `reports/content-presentation-cleanup.json`; attribution evidence remains in `reports/relationship-evidence.json` and `reports/derived-content.json`.

## Coverage and remaining limits

All 353 captured primary-site HTML mappings are converted. 23 original WordPress mappings are converted, including Hildebrand and three original-only articles. 315 retained HTML mappings remain unconverted, including original archives, aliases and differing source versions. Migration-wide exhaustive discovery is not claimed.

Paper entries contain complete catalogue citations, descriptions and original publication links. Full external PDFs remain unacquired; no full-paper migration is claimed. The literal source webinar-link placeholder remains in its original source version; the published edition preserves its wording without an invented destination. Unsupported external source routes remain documented; preview forms are disconnected and published service links stay external. No forms were submitted.

Sources retain individual timestamps; oversized original archives remain unread. Static frontier exhaustion does not prove complete JavaScript/query/export coverage. 3301 URL records are inventoried; 81 historical acquisition failures remain recorded. The original ten-second crawl delay is honored.

## Authoring and evidence

- Authoring schema: `docs/AUTHORING.md`; setup/build/check commands: `README_MIGRATION.md`.
- Preview hosting and domain-path configuration: `docs/DEPLOYMENT.md`.
- Published editions and site checks: `reports/website-editions.json`, `reports/website-validation.json`, `reports/website-browser-validation.json`.
- Editorial requirements: `MIGRATION_SPEC.md`.
- Capture provenance: `reports/capture-index.json`, `reports/source-manifest.csv`, `sitemap.json`.
- Current source comparisons: `reports/final-source-content.json`, `reports/live-source-validation.json`.
- Published immutable comparison signatures: `reports/validation/*/source-signature.json`.
- Relationship provenance: `reports/relationship-evidence.json`, `reports/derived-content.json`, `reports/author-name-matches.json`.
- Canonical mappings: `reports/route-map.json`; asset ownership/checksums: `reports/asset-index.json`.
- Browser/template, local-link and format checks: `reports/browser-validation.json`, `reports/site-link-validation.json`, `reports/markdown-format-validation.json`.

Raw source HTML, screenshots, logs and runtime files stay local and are ignored by Git. Build, link and relationship checks work from the published repository; raw-source rechecks require locally retained captures.
