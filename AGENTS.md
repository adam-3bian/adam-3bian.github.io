# CHERI Alliance — authoritative repository agent instructions

**Entry point:** `AGENTS.md` governs how agents work in this repository. For a full template/content implementation, execute `TRANSFORMATION_PROMPT.md`. For a single requested edit, follow its narrower scope; do not run the full transformation unasked.

## Instruction precedence and boundaries

1. The user's current explicit request and safety constraints determine the task.
2. `TRANSFORMATION_PROMPT.md` defines the complete website transformation and its acceptance criteria, **only when that transformation has been requested**.
3. The uploaded `cheri-alliance-starter-kit-simplified-authoring (3).zip` (Jekyll root `basic-site/`) is the design, component, interaction and authoring-method reference. Read its `SPECIFICATION.md`, `README.md`, `markup-examples.md`, `VERIFICATION.md` and actual layouts, includes, Sass, JS and assets. `docs/THEME.md` describes integration into this repository.
4. This repository's actual editorial source files, original assets, URLs, relationships and provenance are the content authority. `docs/AUTHORING.md` and `MIGRATION_SPEC.md` give the content-fidelity contract.
5. `docs/VALIDATION.md` and the current build scripts define reproducible checks. `PROGRESS.md` and `reports/` describe **historical measured evidence**, not permission to assume a fresh check passed.

Old prompt filenames are non-operative compatibility pointers. They do not override this hierarchy. `CHERI_HIERARCHICAL_SITEMAP.md` and `CHERI_SITE_INVENTORY.json` are provisional inventories, not proof of total external-source coverage.

## Non-negotiable preservation

- Keep all existing source-backed Markdown bodies **complete and in reading order**; never replace an article with an excerpt, fabricate copy or silently drop a record. Preserve original links, citations, headings/anchors, tables, images, downloads, author/order metadata, source versions and entity relationships.
- Keep editorial content as minimal YAML front matter plus native Kramdown Markdown, without HTML/Liquid presentation wrappers. Preserve source-verifiable role flags and references; derive reverse relationships in code.
- Use the ZIP's real layouts, includes, colour/opacity settings, Poppins typography, honeycomb background, responsive controls, native components and scripts. Site builds use GitHub Pages' native Jekyll/Liquid pipeline: no custom Ruby plugins or repository-owned Actions workflow. Do not copy its demonstration articles, people, sample records or placeholder artwork to production, or restore WordPress/source-site theming.
- Keep native ZIP cards/forms, source-backed member logos and portraits, collection directories, news/events ordering, author links, source redirects, canonical pages, disconnected forms, 404 and native GitHub Pages branch publishing. Do not add site search or custom directory filters, because they are not in the starter ZIP. Add only documented minimal theme adapters.
- Treat incomplete external archives or missing PDFs honestly. A full catalogue record is not a locally acquired full paper; a verified name-only record is not a license to invent a biography.
- Preserve user changes. Never force-push, merge, deploy, change DNS, publish private data, or submit forms without authorization.

## Work pattern

1. Record the baseline commit and inspect the relevant existing files, `docs/THEME.md`, `docs/AUTHORING.md` and the ZIP; audit before reimplementing features.
2. Inventory the affected content, assets, routes and components; make the smallest change that meets the request.
3. Run the appropriate native `bundle exec jekyll build` and manual content/link/relationship/template/browser checks from `docs/DEPLOYMENT.md`; legacy custom-plugin scripts are historical and may not apply. Do **not** claim unrun checks passed.
4. Update `PROGRESS.md`/reports with measured implementation changes, preserving historical evidence. Report remaining exceptions explicitly.
5. Use a reviewable branch/PR when requested. A successful local build is not a live deployment.

**Scope separation:** A theme task or an instruction-reset task never implicitly authorizes re-scraping `cheri-alliance.org` or `cheri-alliance.github.io`. New external acquisition requires a separate explicit request and recorded source/provenance evidence.
