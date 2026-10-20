# Implementation prompt for SOL 6.1

Act as an experienced web designer and front-end engineer. Refine the existing CHERI Alliance Jekyll site into a distinctive, economical technical catalogue and reference site.

**Work directly on the latest `design/catalogue-polish` branch of `adam-3bian/adam-3bian.github.io`. Commit and push the completed work to that same branch. Do not create another design branch or replace this work with the earlier collections-redesign branch.** Preserve unrelated working changes. Fetch and establish the actual current head before editing; the accompanying audit inspected `7273a61`, but do not reset later work to that commit.

This is an implementation task. Complete the templates, styles, necessary authoring migrations, checks, screenshots and documentation. Use `docs/CATALOGUE_REFINEMENT_AUDIT.md` as evidence and context; verify assumptions against the current branch.

## 1. Preserve content and the established design principles

Preserve all authored wording, factual information, metadata meaning, record relationships, author order, resource destinations, images and other assets, URLs, redirects, meaningful anchors, citations, legal notices and authoritative-document notices. Moving content between Markdown bodies and front matter is permitted when it improves authoring. Rewriting, shortening, summarising, inventing or deleting authored content to fit a design is not permitted.

The requested removal of descriptions from cards is a presentation change. Keep canonical summaries and complete descriptions available on their appropriate pages. Before removing a card-only description from the display, determine whether it contains unique authored prose. Retain such prose in a suitable visible editorial area or its appropriate destination page, with a documented mapping; retaining it only in an invisible search attribute is insufficient. Do not alter existing truncated source text by inventing its missing continuation.

Small interface labels may change where they improve usability. “At a glance”, generated action cues and other template chrome are not authored record content. Preserve any meaningful existing anchor attached to a component whose presentation changes.

Retain:

- The existing CHERI identity, assets and honeycomb motif, with opaque reading surfaces.
- The homepage's original composition and dark appearance. All other pages remain light; no theme toggle or automatic theme switching.
- Full-viewport header/footer backgrounds and inner content aligned with the shared site container.
- The full available site content width for ordinary pages and news. Do not reinstate a narrow article-level wrapper.
- A shared collection-detail structure with optional media, facts, resources and related records; sparse records must not reserve empty regions.
- List/Grid controls, search, filters, sorting, state persistence and progressive enhancement.
- Correct alphabetical/chronological ordering and the governing-board registry order.
- Native links, clear focus, keyboard-operable menus and decorative Unicode `▼`/`▲` indicators synchronised with `aria-expanded`.

## 2. Audit and choose a precise visual direction

Review these paths at desktop, tablet and mobile widths, alongside the homepage, a sparse person record, a dense publication and a policy:

- `/news-and-events/`
- `/alliance/leadership/members/`
- `/news-and-events/people-and-opportunities/speakers/`
- `/organisations/axiomise-ltd/`
- `/people/adam-finney/`
- `/discover/resources/glossary/`
- `/hardware/cheriot/`
- `/news/ai-doesnt-need-a-kill-switch-it-needs-boundaries/`

Compare the checked-out render with the live site if accessible, and record which commit each represents. If the live deployment cannot be identified or reached, report the limitation rather than treating a local render as live evidence.

Use the visual direction of a carefully typeset engineering reference: strong headings, restrained brand accents, precise alignments, confident use of existing imagery and useful information close to the top. Make the site recognisable through these choices and the existing honeycomb, rather than adding ornamental effects.

Define a small shared system before changing individual pages:

- Keep the brand heading face. Establish clearer contrast between display headings, body copy, labels and metadata. Evaluate a readable system sans-serif for body text and controls alongside the existing Poppins headings; use one consistent choice and test technical notation, long titles and citations.
- Use dark, high-contrast primary text, quiet secondary text and the existing brand accents for links, active states and selected structural details.
- Give the reading canvas, navigation cards, utility controls and editorial panels distinct roles. Avoid applying the same pale rounded box to each.
- Use an explicit spacing scale, for example 4/8/12/16/24/32/48px. Assign spacing by relationship: close within a unit, moderate between records, larger between sections.
- Prefer borders and alignment for compact directories. Reserve shadows and stronger surfaces for elements whose emphasis warrants them.
- Keep text surfaces opaque. Use the honeycomb in gutters and appropriate decorative areas without letting it compete with prose or logos.

Produce a brief component specification and apply it through shared Sass, layouts and includes. Consolidate conflicting rules in their owning components; avoid another layer of page-specific overrides. Preserve the homepage's composition while using compatible shared refinements.

## 3. Make navigation and record cards description-free

Adopt a site-wide default for shared destination and record cards: **title, useful factual metadata, optional image and a clear destination cue; no descriptive paragraph or biography excerpt.** Apply it to both List and Grid, collection directories, hub navigation and related-record cards.

Examples:

- Members: organisation name, centred logo and existing membership facts.
- Speakers/People: name, square portrait where available, existing affiliation and relevant role.
- News: title, publication date and existing relevant byline information.
- Events: title, dates, location/format and existing generated timing status.
- Hardware/software: title and a small number of existing technical/classification facts.
- Navigation hubs: destination title and a restrained consistent action cue.

Do not remove authored paragraphs from ordinary editorial panels or main page bodies under this rule. Audit promotional/slider components individually so unique copy remains visible and the homepage composition survives.

Implement the default once in the shared component. Do not add `show_description: false` to dozens of files. Keep existing summaries available to detail layouts, metadata and search. Search should continue to match relevant descriptive content even though cards no longer display it.

Use compact horizontal rows in List and balanced responsive cards in Grid. Preserve full wrapping for titles, useful metadata and image-free records. Remove leftover summary margins, empty summary slots and minimum heights. Typically aim for roughly 80–110px desktop list rows with a short title and one metadata line, allowing content to grow naturally. Long names and multiple affiliations take precedence over rigid heights.

Maintain two interaction contracts:

- A single-destination navigation card is one semantic anchor. The whole card has a consistent hover/focus treatment and native browser link behaviour.
- A block with several independent links or controls is a passive panel with explicit actions. It has no pointer cursor or whole-panel hover affordance.

Do not nest links/buttons, use stretched overlapping links, invent destinations, or turn containers into JavaScript-only links. Keep all existing actions. Avoid making each action look like a primary button.

## 4. Give images the right geometry

Separate the image element's intrinsic dimensions from its presentation frame. Infer the normal treatment from the collection/component; do not introduce per-record aspect-ratio or frame-size fields.

**People:** use a 1:1 square frame in listings, related cards and details, with modest corners rather than circular avatars. Use `object-fit: cover` for portraits while preserving faces and existing crop-position overrides. Suggested starting sizes are 56–72px in list rows, 96–128px in compact grid cards and 160–192px in desktop detail headers. On mobile, keep a useful portrait without forcing the title into an unnecessarily narrow column.

**Organisations:** centre the complete logo horizontally and vertically inside a consistent opaque rectangular frame, approximately 2:1 where appropriate. Use `object-fit: contain`, internal breathing room and explicit frame sizing. Do not crop or stretch the mark. Start with approximately 240–280px wide detail frames; on mobile allow a readable 160–220px landscape frame in normal flow if placing it beside the title would shrink it excessively. Fit all dimensions to the available container.

Member grid logo frames must share the same geometry regardless of the original logo dimensions. Fix the current interaction between flex direction, `flex-basis`, image intrinsic size and missing width. Axiomise, BT and a very long university name should all look intentionally composed. Square marks remain centred within the shared rectangular logo frame.

**Technical diagrams/product images:** contain the complete diagram and preserve useful proportions. Do not apply the portrait crop to hardware or architecture imagery. Editorial images retain their authored placement and proportions.

Do not render decorative placeholders or reserve a media column when an image is absent. Keep alt text and source assets intact.

## 5. Replace “At a glance” with useful metadata placement

Remove the generic visible “At a glance” heading from shared details. Keep every underlying factual value and useful relationship.

Use a semantic definition list styled according to the amount of information:

- No facts: no empty wrapper.
- One or two short facts: a compact inline or wrapping metadata group near the title/summary, with no detached sidebar solely for them.
- Substantial facts/resources: a compact, clearly labelled region beside the body on wide screens and in natural order above it on mobile. Use specific headings such as “Resources” or “Certification” only when warranted by the actual contents.

Derive this choice from structured fields and the shared collection schema, not from parsing rendered HTML or adding page-specific switches. Use judgement where a fact is long or a dense certification record requires its own treatment; a raw row count must not break such records.

For CHERIoT, keep `Record type: Platform overview` as quiet inline metadata and release the 285px sidebar currently reserved for it. For Axiomise, membership facts and the existing primary website link should be close to the introduction without separate oversized boxes. Keep the primary resource action clear. Preserve certification scope, programme/product version distinctions, precise dates and event timezone offsets.

Collection prose may retain a readable measure, but an unnecessary sidebar must not dictate the layout. Related content follows the main content consistently.

## 6. Rebuild the glossary as a maintained reference

Replace the current HTML-splitting adapter with structured Markdown records. Do not merely restyle the existing parser.

Use an **output-disabled `glossary` collection**. Each term is an independent `.md` source record whose full definition appears below front matter. Render all terms on the existing glossary route; do not create 46 unwanted detail routes.

Use this minimal record shape:

```markdown
---
title: ABI
anchor: glossary-term-abi
---

Application Binary Interface. The conventions that let compiled code, libraries, and an operating system agree on data layouts, calling conventions, registers, and binary formats.
```

For a term that already links to another page, add only the existing destination:

```yaml
title: Bounds
anchor: glossary-term-bounds
link: /build/technology/cheri-capabilities/capabilities/
```

Its unchanged definition still belongs in the Markdown body. `link` is optional and distinct from the record's own permalink/anchor; do not repurpose Jekyll's reserved `url` property. Do not invent links for currently unlinked terms.

Use filenames such as `_glossary/010-abi.md`, with ordering prefixes to preserve the current editorial order. Keep the public `anchor` explicit and independent of filename/title changes. Derive letter groups from titles; generate the alphabet, term count and search text from the records. Do not also store `letter`, `order`, `summary`, `definition`, `search_text` or a duplicate terms list. If an exceptional existing group needs explicit handling, document it rather than adding unused fields to every record.

Keep the glossary page itself as Markdown, containing its existing introduction and authored headings in the body. Use the shared glossary layout to render the records and controls. Preserve all 46 current definitions, 20 existing term destinations, 16 letter groups, their order, examples and inline links. Retain `directory-cheri-glossary`, all `glossary-a`-style group IDs and all existing `glossary-term-…` IDs. Add explicit aliases only if an existing anchor genuinely requires one.

Design the page as a continuous reference list:

- Use one compact introduction and a cohesive search/index area. Retain authored heading text without giving every heading another large block of padding.
- Put each term directly above its definition, with a subtle permalink beside the term. Avoid the current wide separation between term, far-right `#` and definition.
- On wide screens a narrow letter-marker rail is acceptable; do not restore several disconnected reading tracks. Use modest separators between entries/groups, not a card per definition.
- Keep long definitions comfortably readable and preserve paragraphs, lists, examples and links. Let rows grow naturally.
- Compact the A–Z index while keeping its targets usable; show only existing letters. Do not let search, reset, count and index become several oversized stacked panels on mobile.
- Keep all definitions visible by default. Retain search across terms and definitions, result count, empty/reset states, browser Find, keyboard access and working no-JavaScript content.
- Following any existing letter or term hash must reveal the target even if search currently hides it. Test initial deep links, same-hash clicks and browser back/forward. Scroll/focus must not obscure the target.

Do not put prose definitions in YAML block scalars or maintain the glossary in both front matter and a body copy. Render Markdown safely with standard Jekyll/Liquid facilities that work in safe mode; no custom plugin dependency.

## 7. Keep the Markdown model small

All authored content pages, news records, collection records and redirect page sources should use `.md`. Main prose belongs below the front-matter delimiter; meaningful attributes and relationships belong in front matter.

Keep `_layouts` and `_includes` as HTML/Liquid templates, `_config.yml` and genuine shared registries as YAML, and scripts/styles/assets in their proper formats. “All pages are Markdown” does not mean renaming templates or copying shared configuration into every page.

The audited branch already has 472 Markdown content documents. The other 266 HTML page sources are redirect stubs. Convert those to Markdown with the same redirect layout, destinations and explicit output permalinks; test every output route and avoid extension-derived URL changes.

Reuse existing fields. A normal record needs `title` and only the factual/routing/media/resource fields it actually uses. Keep existing summary wording where it serves the detail introduction. Do not require a newly written summary for every page or name-only person.

Apply defaults through the existing configuration and shared components. Do not introduce author-maintained fields for card descriptions, image shape, density, colour, spacing, column counts or facts visibility. Keep existing image source/alt text and useful intrinsic dimensions; presentation dimensions belong in CSS.

Audit fields before removing them. For example, `has_talks` appears unused in the current presentation, and many `organization_label` values repeat a referenced organisation name, but some labels preserve different wording. Remove a redundant field only when all consumers have been checked and its information is provably preserved or derived. Record such changes in the migration map. Do not use schema minimisation to discard real facts, display credits, aliases or relationships.

Avoid introducing parallel registries or a general-purpose page-builder schema. Glossary term records are the specific new collection justified by independent definitions. Keep existing canonical sources for talks, products, members, speakers and related records.

## 8. Rebalance padding, margins and reading layouts

Treat efficient use of whitespace as purposeful spacing within the full available container, not simply increasing empty areas.

Inspect shared wrappers and computed styles. Correct the accumulating breadcrumb, eyebrow, title, summary, heading, toolbar and result-count spacing. Retain authored headings and paragraphs; shorten their surrounding structure rather than their wording.

Baseline examples to improve, not rigid pixel requirements:

- Members' first result starts around 705px down at 1440×1000 and 867px down at 390×844.
- The glossary's first term starts around 782px down on mobile, with its definition below the fold.
- The news article's mobile breadcrumb uses 96px because `.breadcrumbs li` retains a 44px minimum height from `_sass/_site-features.scss`.

Move useful content materially higher through reduced structural overhead, without shrinking body text or touch controls to achieve a screenshot target. A practical aim is at least a 15–20% reduction in the measured top-to-first-result/definition distance on the representative directories and glossary where content length allows it. Explain any exception.

The named news article already uses the correct shared content width: approximately 1200px at a 1440px viewport and 350px at 390px. Preserve this alignment. Keep its title, byline, author credit, summary, main text and images in simple document flow. Resolve inherited breadcrumb spacing and tune heading/paragraph rhythm. Avoid sidebars, large facts cards or raised wrappers around news and ordinary pages.

Do not enforce fixed card heights, oversized heroes, large minimum page-header heights or extra empty columns. Retain table/timetable/code overflow handling and complete editorial images.

## 9. Validate preservation and the design

Before migration, record the starting commit, collection counts, redirect mappings, source assets, internal links, meaningful anchors, references and authored text. Create an explicit old-location → new-location map for prose/metadata that moves.

Compare semantic content after the migration rather than relying solely on byte-for-byte file hashes: the glossary is intentionally moving into separate Markdown files. Preserve exact authored wording and link destinations, allowing rendering whitespace/HTML entity normalisation. Verify that removed card excerpts still have appropriate visible homes when they contain unique text.

Existing catalogue record counts must remain stable. Document the additional 46 output-disabled glossary records separately; they must not inflate directory results or create new public routes. Redirect conversion must leave its output route/destination map unchanged. Preserve image assets and do not introduce broken references. Report inherited broken references separately instead of inventing replacement links.

Build in safe mode at both `/` and a non-empty baseurl such as `/preview`:

```sh
bundle exec jekyll build --safe --destination dist
bundle exec jekyll build --safe --baseurl /preview --destination dist-baseurl/preview
```

Use the repository's available runtime setup if needed and report the actual commands/tool versions. Run the existing content checks, event tests, catalogue tests, layout tests and presentation tests at the appropriate deployment URLs. Adapt checks tied to the former glossary source format so they validate preservation against the migration baseline, not against expectations generated only from the new implementation. Do not weaken semantic/accessibility assertions just to make tests pass.

Review desktop, tablet and mobile at 320, 390, 768, around the navigation breakpoint, and 1440px. Check long titles, absent images, portrait crops, very wide/square logos, sparse records, dense metadata, many authors and complex definitions.

Verify both card views, all existing actions, search/filter/sort/view persistence, keyboard/focus/hover states, target sizes, contrast, menu triangles/states, reduced motion, no-JavaScript operation, glossary anchors/filter interaction and browser history. Check 200% zoom, document overflow and image loading. Automated accessibility checks supplement visual review; they do not establish that spacing or typography is successful.

Provide matching before/after screenshots for all eight named pages on desktop and mobile, plus representative tablet glossary/directory views and a homepage regression comparison. Include List and Grid. Explain which shared rules produce the improvement, and record first-content positions and image-frame dimensions for the main problem pages.

Update the authoring guide and shared component rules with minimal examples, glossary authoring, image treatment, description-free cards, sparse facts and the distinction between navigation cards and passive panels. Remove documentation that describes the retired glossary parser or superseded display rules.

## 10. Publish to the agreed branch and report honestly

Commit and push the implementation, validation updates, documentation and review evidence to **`design/catalogue-polish`**. Do not merge to `main` or publish from a different design branch as a shortcut.

Inspect the actual GitHub Pages configuration and deployment workflows. The audited workflow triggers push validation only for `main` and gates its upload/deploy steps to `main`; a push to `catalogue-polish` alone therefore does not prove a live deployment. Establish whether another configured publication path serves this branch.

Use the authorised publication route for `design/catalogue-polish`, reconciling its workflow where necessary, and verify the deployed commit and URL. Keep publication sourced from this branch; check that scheduled or manual runs cannot overwrite the agreed result with another branch. If repository settings, credentials or deployment protection block publication, still complete and push the reviewable work, then state exactly what is blocked and the required final action. Do not report the live site as updated merely because Git accepted the push.

Finish with the commit, branch, actual publication URL/status, concise design decisions, migration/preservation results, checks that actually ran, remaining limitations and links to the before/after evidence.
