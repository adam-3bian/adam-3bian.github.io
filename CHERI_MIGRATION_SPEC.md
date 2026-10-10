# CHERI Alliance — consolidated lossless migration specification

> **Current website direction:** Preserve the content already acquired and use the uploaded simplified-authoring starter theme directly. Read `AGENTS.md` and `docs/THEME.md` first. This document governs explicitly requested acquisition and content fidelity. Its source-layout/image-position guidance does not require recreating the original website's theme, and it does not authorize starting another crawl during a theme task.

## Task and sources

Create a complete, verifiable Jekyll/Kramdown migration of **both**:

- https://cheri-alliance.org/
- https://cheri-alliance.github.io/

Treat these as **two distinct source websites**. Discover their complete publicly accessible contents, retain the provenance of each original URL, and combine only genuinely equivalent entities or pages. Do not assume the two sites are identical or that one supersedes the other. Preserve conflicting historical/source versions separately when they differ. Do not invent material to fill gaps or replace existing placeholder text with invented content.

**Non-negotiable: full source fidelity.** Every in-scope original page must be captured, converted into an actual complete Markdown body (or other faithful source-backed representation when a Markdown body is inappropriate), and individually verified. A navigational inventory or merely creating files does not count as a completed scrape.

## 1. Discover the complete site hierarchy

Use all available sources: original site source or exports, WordPress XML and APIs where authorised, XML sitemaps, rendered desktop/mobile navigation, footers, internal links, paginated archives, tags/categories, directories, RSS, and site-specific routes. Recursively follow all in-scope links until discovery converges. Record redirects, canonical URLs, source site, source URL, title, type, parent/breadcrumb hierarchy, HTTP status, retrieval state, and migration state.

Cover, at minimum: homepage, about, governance and board; membership and member profiles; people and speakers; working groups; events (past, future, sessions and agendas); news archives and **every full article**; papers and bibliography; technologies, products and platforms; projects, standards, specifications; guides, tutorials and FAQs; videos, presentations and recordings; downloads and forms; press assets; certification and policies. Include utility pages and genuinely distinct archive pagination. Avoid duplicate URLs due to tracking parameters or alternate slashes.

Use `CHERI_HIERARCHICAL_SITEMAP.md` and `CHERI_SITE_INVENTORY.json` only as a **provisional starting inventory**, never as exhaustive proof. Continue finding individual member/person/article pages and URLs missing from navigation. Retain evidence of failed URLs.

## 2. Preserve the *entire* published content

Retrieve and preserve the actual page HTML, including content rendered by JavaScript or exposed through tabs, accordions and other interactive elements. Preserve text verbatim and in original reading order: headings, paragraphs, lists, nested lists, quotations, complete tables, captions, dates, authors, affiliations, links and their text, footnotes, media references, and original form labels/options/instructions. Preserve meaningful site-wide text through shared Jekyll includes/layouts and verify it separately.

**Never:** summarise, paraphrase, rewrite, compress, truncate, substitute an archive excerpt for a full article, insert a placeholder, remove source sentences because they repeat metadata, silently omit an inaccessible item, or generate generic replacement text. If the **source itself** contains placeholder copy, preserve that exact source evidence and flag `suspected_source_placeholder` in the validation report (not necessarily front matter). Distinguish original sites' differing versions and time-sensitive information.

## 3. Content collections and simple relationships

Use **only genuinely populated collections**; do not create fictional records just to fill a schema. Prefer these Jekyll collections and companion asset directories:

| Source-backed content | Jekyll collection | Asset directory |
|---|---|---|
| Events, optionally sessions | `_events/` | `assets/events/<slug>/` |
| Working groups | `_groups/` | `assets/groups/<slug>/` |
| Member/partner organisations | `_organisations/` | `assets/organisations/<slug>/` |
| News and complete articles | `_news/` | `assets/news/<slug>/` |
| Speakers, board members, researchers | `_people/` | `assets/people/<slug>/` |
| Academic papers and bibliography | `_papers/` | `assets/papers/<slug>/` |
| Products | `_products/` | `assets/products/<slug>/` |
| Hardware/software platforms | `_platforms/` | `assets/platforms/<slug>/` |
| Projects, initiatives, repositories | `_projects/` | `assets/projects/<slug>/` |
| Standards and technical specifications | `_standards/` | `assets/standards/<slug>/` |
| Guides, tutorials, training | `_guides/` | `assets/guides/<slug>/` |
| Videos, presentations, recordings | `_media/` | `assets/media/<slug>/` |
| Case studies | `_case_studies/` | `assets/case-studies/<slug>/` |
| Legal, governance, privacy policies | `_policies/` | `assets/policies/<slug>/` |
| Certification programmes | `_certifications/` | `assets/certifications/<slug>/` |
| Distinct resources/downloads | `_resources/` | `assets/resources/<slug>/` |
| Source-backed form definitions | `_data/forms.yml` or `forms/` | `assets/forms/<slug>/` |
| Site-wide assets | n/a | `assets/shared/` |
| Non-entity standalone pages | `pages/` | `assets/pages/<slug>/` |

Do not split a document into multiple entity records unless the source genuinely contains independently reusable entities. A paper's downloadable PDF belongs to its paper; conference slides may belong to the event or session, with references instead of duplicate binary files. Treat forms as structured labels, fields and endpoints only where evidenced; never simulate a working submit backend merely from Markdown. Never submit scraped forms.

Model source-verified relationships with short stable slug references:
- person → organisation (`organization: codasip`) when a real affiliation is established
- event → people (`speakers: [example-person]`)
- group → people (`leads: [example-person]`)
- article/paper → people or organisation only when editorially meaningful and verified
- organisation → membership (`member: true` only if verified)
- session → event and speaker, if event sessions are consistently structured in source

Create **one canonical entity per real person/organisation**, with original pages/sources recorded as evidence. Never infer current employment from an old event biography, or infer a relationship merely from co-appearance. Use minimal source-backed `_data` records rather than fabricated profile pages when a named entity has no own page or biography.

## 4. Front matter must stay minimal

Use YAML only for actual identification, content routing, display and relations. A typical person requires only:

```yaml
---
title: Example Person
organization: example-organisation
---
```

An event with sourced speakers:

```yaml
---
title: Example Event
speakers: [example-person]
---
```

These are schema examples, not real CHERI data. Avoid nulls, empty arrays, nested YAML, repeated name/title/organisation strings, duplicate slug IDs, invented descriptions and fields for hypothetical future needs. Store a canonical `source_url` in front matter **only when needed for source traceability**; otherwise capture full multi-source provenance in `reports/source-manifest.csv`. Do not sacrifice faithful page-body text to avoid duplication with YAML.

## 5. Content-aligned local assets

**Organise assets by the entity or page they belong to, not only by extension.** For example:

```text
_events/cheri-conference.md
_people/example-speaker.md
_organisations/example-member.md
_papers/example-paper.md
assets/events/cheri-conference/hero.webp
assets/events/cheri-conference/schedule.pdf
assets/people/example-speaker/headshot.jpg
assets/organisations/example-member/logo.svg
assets/papers/example-paper/paper.pdf
assets/shared/branding/cheri-alliance-logo.svg
```

Retain original asset quality, format and meaningful filenames where possible. Use deterministic collision-safe filenames. Store one physical copy of a shared asset, reference it from all owners and track each use. Build `reports/asset-manifest.csv`: original source URL, local path, owning entity/page, referencing URLs, image role, original dimensions, optional SHA-256 checksum, download and verification status. Maintain all original download links and internal cross-references. Do not replace original artwork or diagrams with stock/generated images.

For inline images, reproduce position using Kramdown Inline Attribute Lists:

```markdown
![Original alt text](/assets/people/example-speaker/headshot.jpg){: .image-left }
![Original alt text](/assets/events/example-event/speaker-photo.jpg){: .image-right }
![Original alt text](/assets/events/example-event/banner.webp){: .image-full }
```

For acquisition evidence, classify images from the **rendered original layout**, not from image dimensions alone. For the published site, apply the starter theme to those semantic image roles. Preserve actual source reading order, captions, hyperlinks, galleries, diagrams, hero images and meaningful backgrounds. Add responsive CSS for `.image-left`, `.image-right`, `.image-full`, and float clearing; maintain image aspect ratios. Preserve historical source-layout evidence, but validate the current site’s presentation against the starter theme. Content fidelity and theme fidelity are separate tests.

## 5A. Original source and website hierarchy

Treat the original WordPress export, `wp-content/uploads`, the GitHub Pages source repository (where available), recursive public URL discovery, and rendered DOM/HTML captures as complementary sources of evidence. Do not assume that a sitemap, GitHub repository source, or a `wget` mirror alone provides full coverage. Record the acquisition method and any relevant source date for each page. **If the live pages change during the migration**, capture a consistent snapshot or explicitly disclose the changed baseline.

Produce a final **hierarchical `sitemap.md`** with an entry for every eligible canonical page, nested beneath its real navigation, section or breadcrumb parent, including direct links to its original URL and local Markdown file. Also produce a machine-readable `sitemap.json` whose entries expose `source_site`, `url`, `canonical_url`, `parent_url`, `content_type`, `local_path`, `fetch_status`, `conversion_status`, `verification_status` and `reason_if_unresolved`. Preserve redirects and source-only archive indexes separately. Do not force artificial hierarchies when the source gives no parent; record how the hierarchy was inferred.

When comparing the websites, distinguish **same entity**, **same content**, and **different versions**. Relate equivalent people/organisations across sites via shared entity slugs where evidence supports it, while retaining every distinct published page body and its original URL as a separate source-backed item when contents differ.

## 6. Verify completeness page-by-page and asset-by-asset

Capture snapshots of original HTML and (where needed) rendered DOM/screenshots before conversion. Render output via Kramdown. For each source page, compare all meaningful text in DOM order with the rendered migrated text; normalise whitespace only where non-semantic. Verify headings, paragraph counts/text, lists, table cells, links, image inventory, image layout, attachments, footnotes, labels and captions. Record *exact* missing, additional or reordered text. Shared site-wide elements may be validated separately if recreated through a common layout.

Validate 100% of source-to-destination mappings, internally linked routes and entity references; record duplicate slugs, missing binaries and failures. Maintain `reports/url-inventory.csv`, `reports/source-manifest.csv`, `reports/asset-manifest.csv`, `reports/entity-manifest.csv`, `reports/content-validation.csv`, and `reports/missing-content.md`. Every source URL gets an explicit status: `discovered`, `fetched`, `extracted`, `converted`, `verified`, `failed`, or `excluded-with-reason`.

A page is `verified` **only** when extraction and comparison actually pass. Do not mark the project 100% complete merely because all *currently discovered* links have been processed: exhaust discovery from sitemaps, archives, directories, source exports and links first. Explicitly disclose limits, sources blocked by access, impossible-to-recover assets or forms, and unresolved differences.

## 7. Execution and deliverables

Execute: (1) discover and inventory both origins; (2) retrieve snapshots and assets; (3) build canonical entities and relationships; (4) convert all pages to complete Kramdown; (5) verify each original page and each referenced asset; (6) remediate every discrepancy possible; (7) deliver Jekyll project, original source evidence and reports.

Keep `MIGRATION_SPEC.md`, a persistent `PROGRESS.md`, and a machine-readable inventory in the project. They are the durable authority if chat history is compacted. Never claim background processing or that unfinished pages are ready. This project is not complete unless every in-scope original item has been verified or documented as a known exception.