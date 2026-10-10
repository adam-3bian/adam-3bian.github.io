# CHERI Alliance website — agent instructions

**Current goal:** Retain the existing content and use the uploaded `cheri-alliance-starter-kit-simplified-authoring (3).zip` theme directly. The archive is the presentation reference; [docs/THEME.md](docs/THEME.md) records its integration. The two original websites remain content/provenance sources, not visual design targets.

## Priorities

1. Follow the user's current request. A theme task does not imply another scrape, content rewrite or inventory expansion.
2. Preserve full existing article/page bodies, links, original assets, real relationships and distinct source versions. Never substitute excerpts or template sample content.
3. Use the ZIP's layouts, includes, Sass settings, components and scripts. Adapt existing data to that theme. Keep template differences explicit; do not restore source-site wrappers, sidebar/profile designs, colours, opacity overrides or WordPress styling.
4. Apply `CHERI_MIGRATION_SPEC.md` to acquisition and content-fidelity work only. Its original image-position/visual requirements do not override this theme direction. Keep semantic image classes and original aspect ratios, but let the starter control their presentation.

## Content and evidence

- Editorial files remain YAML front matter and Kramdown Markdown. Do not add HTML or Liquid wrappers to them.
- Do not invent content, biographies, affiliations or authorship. Use source-backed `organization`, `speakers` and `authors` references; derive reverse links.
- Retain provenance, original downloads and asset bytes. Distinct differing source versions remain separate; alternate versions do not duplicate public author/news lists.
- Keep `.elementor-*`, `.wp-*`, widget and TablePress styling out of editorial Markdown. Preserve legitimate source URLs and fragment anchors.
- Never submit forms or access private submission/subscriber data. Existing preview forms remain disconnected.
- Preserve pre-existing user changes. Cloud tasks are isolated: use the existing checkout, without creating a worktree unless explicitly requested.

## Workflow

For theme/development tasks, inspect `docs/THEME.md`, `docs/AUTHORING.md`, the relevant theme files and existing content first. Build with the documented runtime and run relevant content, link, relationship and browser checks. Compare representative desktop/mobile rendering with the ZIP theme itself, not with the original WordPress website. Update `PROGRESS.md` and reports with measured results.

Only when new acquisition is explicitly requested, use `CHERI_MIGRATION_SPEC.md`, inventories and source snapshots to expand discovery and process a verifiable batch. Do not announce complete migration coverage from partial captures.

Changes in this checkout are local until committed/pushed and deployed by the Pages workflow. Do not claim the public site changed from a successful local build; deployment needs separate authorization.
