# CHERI Alliance migration — agent instructions

**Mission:** Reproduce all eligible public content from `https://cheri-alliance.org/` and `https://cheri-alliance.github.io/` in complete, verifiable Jekyll/Kramdown Markdown. These are two separately versioned sources. Follow `CHERI_MIGRATION_SPEC.md` for full requirements.

## Non-negotiable

- **No invented content and no abbreviated content.** Preserve every original page's body faithfully. Never replace a full article with its excerpt, a fabricated description or an empty placeholder.
- **Do not confuse discovered with verified.** The supplied sitemap and inventory are provisional. Check source exports and recursively discover every eligible public page, archive entry and download.
- **Retain provenance.** Keep source URL, source snapshot, extraction status and validation evidence. Do not silently merge differing source pages.
- **Minimal front matter; real relationships only.** Reuse source-backed people, organisations, working groups, events, news, papers, products, platforms, guides, media, projects, policies and other actual entities. Never infer affiliations from proximity.
- **Assets follow content ownership.** E.g. `assets/people/<slug>/`, `assets/events/<slug>/`, `assets/papers/<slug>/`; use one physical copy per shared asset and reference it elsewhere. Preserve original images, captions and download files.
- **Use Kramdown images.** `{: .image-left }`, `{: .image-right }`, `{: .image-full }` based on rendered original positioning, not guesswork.
- **Validate every item.** Render converted pages and compare meaningful source text, links, tables, images and downloadable files. Status `verified` requires passing evidence; inaccessible pages stay `failed` or `unresolved` with reasons.
- **Keep the work restartable.** Update `PROGRESS.md` and inventory/report files after each batch. Do not rely on conversation context to remember what has or has not been completed.
- **Never access private form submissions.** Do not submit forms or harvest personal subscriber data. Archive public labels/instructions only.

## Workflow

1. Read `CHERI_MIGRATION_SPEC.md`, the two provisional inventory files, and any uploaded source exports; establish an inventory plus scope/exclusions.
2. Expand discovery until stable; create a hierarchical sitemap and source snapshots. Clearly distinguish inaccessible or unverified items.
3. Build local asset manifests and verified entity relationships; convert entire pages to Markdown.
4. Run automated text/structure/assets/links validation page by page, and visual spot checks of image alignment.
5. Repair discrepancies; report verified pages and exceptions, with counts and URLs.

Keep `PROGRESS.md` and `reports/*` current; complete one independently verifiable batch at a time. Never announce 100% completion from an incomplete crawl. Do not weaken these rules to fit a context window, tool limitation, or output length.