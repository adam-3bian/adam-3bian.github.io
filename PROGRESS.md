# CHERI content and authoring progress

## Current website

The uploaded simplified-authoring starter supplies the theme, styles and navigation controls. Its demonstration content and placeholder images were not imported. Existing collections and full source bodies remain in use. The complete site adds responsive heroes/profile layouts, generated linked directories, full-body search, working section hubs, dated event lists, canonical URLs, sitemap, a branded 404 and disconnected contact/newsletter forms. A locked GitHub Actions build deploys the preview artifact; hosting activation is a separate repository setting documented in docs/DEPLOYMENT.md.

474 editorial Markdown files: 371 distinct complete source-page bodies, 15 full published paper catalogue entries, 62 minimal source-named people/organisation records, and 26 published editions, section hubs, directory/search/error pages. 9 original source bodies are retained as alternate reference versions while their primary routes use the declared published editions.

- `_events/`: 10 files.
- `_groups/`: 16 files.
- `_guides/`: 10 files.
- `_hardware/`: 6 files.
- `_news/`: 56 files.
- `_organisations/`: 69 files.
- `_papers/`: 15 files.
- `_people/`: 109 files.
- `_policies/`: 11 files.
- `_software/`: 10 files.
- `pages/`: 162 files.

Only `_data/governing-board.yml` remains: nine short people references. Organisation and paper metadata lives in its Markdown records; acquisition/provenance metadata moved to reports. `member: true` and `speaker: true` select directories; `organization`, `speakers` and `authors` link records by filename. Reverse event/publication/organisation links are generated. No biographies, current affiliations or unnamed contributors were invented.

Canonical filenames and URLs omit source hosts. Distinct alternate source versions are retained with `-original` filenames and `alternate: true`. HTML-file technical references use `/reference/` to prevent collisions with directory indexes. The menu retains the primary site's five headings and published groups, with hardware/software/paper indexes and original-site Morello return information added.

## Final checks

- Markdown-only audit: 474 passed.
- Complete captured source bodies: 376 URL mappings passed; checks include text order, heading IDs, paragraphs, lists, table cells, definitions, links, code and original image references.
- Live source recheck: 371 distinct pages passed; 0 changed; 0 failed. Individual acquisition timestamps are in `reports/live-source-validation.json`.
- HTTP builds: 376 source mappings on 371 routes, plus 15 catalogue-entry routes, passed.
- Local links: 61428 references across 479 rendered pages, plus 7 active CSS/font dependencies; 0 missing targets/anchors.
- Published website: 964 checks passed; 453 searchable pages, event chronology, directory counts, exact edition changes, disabled forms, canonical/sitemap routes, compatibility redirects and HTTP 404.
- Browser user flows: 11 passed for search recovery, contributor search, role filters, keyboard navigation, responsive layouts, disconnected forms and JavaScript-free fallbacks.
- Build: both the prepared runtime and the exact locked Bundler dependencies pass. Project-path and domain-root compatibility are validated; public domains are unchanged.
- Relationships, roles, citation names and board references: `reports/entity-validation.json`.
- Regression tests: 29 passed.
- Browser: 15 desktop/mobile template scenarios passed visible source text, decoded original images, Poppins loading, overflow, menu and submenu checks. The requested starter theme supersedes earlier source pixel geometry checks.
- Original assets: 430 acquired URL mappings; checksums verified over HTTP.

Three source image 404s were repaired using original assets published for the same organisation/event; two source fragment typos now target actual published headings. These deliberate URL corrections are separate from content comparisons: `reports/source-image-repairs.json`, `reports/source-link-repairs.json`. Proven legacy profile/topic links resolve locally through `reports/source-route-aliases.json`. Complete originals retain their source labels and body text. Published edition changes are explicit in website-editions.json and do not overwrite original source bodies.

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
