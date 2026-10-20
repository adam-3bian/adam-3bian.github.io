# Catalogue refinement audit — 20 October 2026

This is analysis and an implementation brief, not another completed redesign. The companion [SOL 6.1 prompt](CATALOGUE_REFINEMENT_PROMPT.md) specifies the next work on **`design/catalogue-polish`**.

## Evidence and limits

The local branch and remote `design/catalogue-polish` both pointed to `7273a61366a36d04c13721fec0953571fe10cc84` when inspected. A fresh Jekyll safe-mode build of that commit succeeded. I captured 20 route/device combinations: the homepage and all eight requested pages, plus Members in Grid view, at 1440×1000 and 390×844. Screenshots and browser measurements describe this local build.

The public URLs could not be fetched: the execution environment returned a proxy denial, and the web browsing service also reported them inaccessible. Consequently, this audit does **not** establish what commit is currently deployed at `adam-3bian.github.io`, or confirm that its pixels match the branch. Implementation must establish that separately.

The content checker passed: 738 rendered pages, 732 preserved baseline routes, 305 original collection records plus five reports, 84 talks, no new broken references. Fifteen previously documented broken references remain. None of the 20 captured views had document-level horizontal overflow. These are baseline checks, not validation of the proposed changes; the full accessibility suite and a new baseurl build were not rerun for this documentation task.

## What is causing the weak hierarchy

The site has a sound shared container, readable colours and consistent links. Its visual weakness is that too many objects receive similar emphasis: rounded pale panels, boxed controls, small metadata, repeated explanatory copy and generic action labels. The result feels like a component inventory rather than a deliberately composed technical reference.

Poppins is used for headings, long prose, controls and metadata. That unifies the site, but its geometric forms and similar treatment across roles make everything feel equally soft. Stronger typographic contrast, precise image proportions, fewer enclosing boxes and more disciplined spacing would give the content greater authority. Additional shadows and effects would not address these causes.

The honeycomb is visible and the reading canvas is opaque. These already work; preserve them. The homepage's dark composition also remains a useful source of identity. The next pass should refine the catalogue around that identity, not replace it.

## Findings and required changes

| Area | Evidence in this branch | Required response |
| --- | --- | --- |
| Navigation and directory cards | `_includes/card.html` always renders `card_summary`, falling back to the destination's summary. Members renders 51 summaries across 52 records; Speakers shows biographies beneath names and affiliation. News and Events inherits descriptions from child pages. | Omit descriptive excerpts from navigation/record cards by default across List, Grid, hubs and related records. Keep titles, useful facts, images and a consistent destination cue. Preserve summaries at their source and on appropriate detail pages. Audit unique card-only prose before changing its presentation. |
| Directory density | The first Members list card starts at y≈705px on desktop and y≈867px on mobile. A desktop row is about 146px high. The header, introduction, separator, subsection, toolbar and count accumulate before any result. | Reduce repeated container padding and independent vertical gaps. Make the toolbar an integrated utility row. Keep all authored introductions; remove only redundant generated chrome. Set a denser shared card rhythm. |
| News and Events hub | A pale title container is followed by a second large pale panel holding five links, then a separate grid. Blank and descriptive cards inherit the same dimensions. | Use a simple title, a compact treatment of the existing authored link list, and tighter destination cards. Preserve every label, heading, link and destination. |
| People imagery | Adam Finney's detail portrait is already 176×176px, but listing portraits are circular. | Use square 1:1 portrait frames consistently, with modest corners, sensible crops and context-specific sizes. The change is consistency, not indiscriminate enlargement. |
| Organisation imagery | Axiomise's source logo is 600×200px. It sits in a 176×176px detail frame and a 68×68px mobile frame, making the mark small. In the Members grid, the first five logo-frame widths measure roughly 252, 96, 200, 75 and 147px despite a common 96px height. | Introduce a consistent landscape logo frame, centre marks with `contain`, and explicitly size both dimensions. The grid's flex direction changes the meaning of `flex-basis`; fix the underlying sizing rule rather than adding organisation-specific widths. |
| Sparse facts | CHERIoT has one displayed fact, `Record type: Platform overview`, yet `_includes/facts.html` creates an “At a glance” box and `_layouts/detail.html` reserves a 285px sidebar with a wide column gap. | Remove the generic heading. Present one or two facts inline near the title. Use a side facts/resources region only when its contents warrant the space. Retain the actual metadata. |
| Glossary presentation | The desktop layout separates letters, terms, permalink symbols and definitions into distant tracks. On mobile, a title, authored subheading, introduction, search label, search row, count and three-line alphabet precede the first entry at y≈782px. | Build a compact reference header and index, followed by a continuous list. Put each term immediately above its definition, with its permalink close to the term. Keep letters as quiet group markers. Preserve all content while reducing structural overhead. |
| Glossary authoring | `_layouts/glossary.html` splits rendered `<h3>`, `<h4>` and `<p>` fragments to reconstruct records. There are 46 definitions, 16 letter groups and 20 original linked terms. | Replace parsing with an output-disabled Jekyll collection of Markdown term files. Definition prose stays below front matter. Render the index and semantic definition list from these records. |
| News and ordinary-page width | The named news article already has a 1200px content area at 1440px and a 350px area at 390px, correctly aligned with the shared container. | Preserve these widths. Improve rhythm and typography without reintroducing narrow article wrappers or increasing blank space. |
| Mobile breadcrumbs | The article breadcrumb is 96px tall because it wraps into two rows of 44px items plus the gap. `_sass/_site-features.scss` retains `.breadcrumbs li { min-height: $control-height; }`, even though later rules reduce the links' padding. | Consolidate the breadcrumb rules and remove the unnecessary list-item floor. Maintain usable link targets and spacing; a breadcrumb text item does not need a full menu-row container. |

Representative captures: [Members](screenshots/catalogue-refinement-audit/desktop-members.png), [Members grid](screenshots/catalogue-refinement-audit/desktop-members-grid.png), [hub](screenshots/catalogue-refinement-audit/desktop-hub.png), [organisation desktop](screenshots/catalogue-refinement-audit/desktop-company.png), [organisation mobile](screenshots/catalogue-refinement-audit/mobile-company.png), [CHERIoT](screenshots/catalogue-refinement-audit/desktop-hardware.png), [glossary desktop](screenshots/catalogue-refinement-audit/desktop-glossary.png), [glossary mobile](screenshots/catalogue-refinement-audit/mobile-glossary.png), [news desktop](screenshots/catalogue-refinement-audit/desktop-article.png), [news mobile](screenshots/catalogue-refinement-audit/mobile-article.png).

## Minimal authoring model

The branch has 472 Markdown content documents with front matter. All 266 remaining HTML page sources outside layouts/includes/assets are redirect stubs using the shared redirect layout. Converting those stubs to `.md` can satisfy the all-pages-as-Markdown rule without converting Liquid templates into Markdown or changing any route.

Use existing common fields: `title`, an existing `summary` where useful on details, `thumbnail`, `links`, routing attributes and the factual attributes belonging to each collection. Put design defaults in shared templates, Sass and existing collection configuration. Do not add per-record switches for summary visibility, image ratios, card density, facts layout, padding or colour.

For glossary records, use only `title`, a stable `anchor`, and an optional `link` containing the term's existing destination. The body contains the exact definition, including any examples and inline links. `anchor` protects public deep links independently of future filenames or title changes. Use numbered filenames to preserve the current editorial order, derive letters from titles, and generate the count/index/search data. No summary, definition field, letter field or second term registry is needed.

Existing fields also deserve a cautious usage audit. `has_talks` occurs in 60 records but has no current layout/include consumer. Of 64 organisation labels alongside references, 57 exactly match the resolved organisation name and seven preserve different wording. These are candidates for simplification only after checking all consumers and preserving their information. Do not mechanically remove the seven differing labels or reinterpret factual fields as decorative settings.

## Recommended implementation sequence

1. Record the actual starting commit, deployment configuration and preservation baseline. Capture the same representative pages.
2. Establish shared type, spacing, surface and image rules. Prototype one directory, one organisation, CHERIoT and the glossary before applying the rules throughout the site.
3. Make cards description-free, fix portrait/logo proportions and make sparse facts inline. Resolve shared CSS conflicts, including breadcrumbs.
4. Move the glossary into minimal Markdown records; replace its parser and restyle its reference layout. Convert redirect sources to Markdown with unchanged output routes.
5. Apply the same rules to remaining directories, related records and landing sections, retaining all unique authored prose and actions.
6. Verify semantic content, routes, anchors, assets and relationships; run root/baseurl builds and interaction/accessibility checks; compare screenshots and first-content positions.
7. Commit and push implementation to `design/catalogue-polish`, then verify the configured publication process and report its actual result.

The tracked `.github/workflows/pages.yml` currently triggers push builds only for `main`; upload/deploy jobs are also gated to `main`. Pushing this feature branch is therefore not evidence that the live site changed. Check the repository's actual Pages settings and workflows before promising publication. The prompt explicitly requires work to remain on `design/catalogue-polish` and publication status to be reported separately.
