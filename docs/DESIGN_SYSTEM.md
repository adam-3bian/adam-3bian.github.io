# Shared design rules

The CHERI catalogue uses a common container, type system and component vocabulary. Content is authored in Markdown; presentation belongs in layouts, includes, Sass and progressive enhancements.

## Canvas, identity and typography

The site container is 1264px including 20px mobile and 32px desktop gutters, giving a 1200px content area on wide screens. Header/footer surfaces span the viewport; their inner content aligns with the main canvas. News, ordinary pages and collection details use the available width. A collection article fills the content container when it has no aside, or fills its allocated left column when facts and resources occupy the right.

Only `/` uses the dark palette and the original homepage composition. Its Poppins text treatment is retained. Other pages are light, with Poppins headings and a system sans-serif for body copy, controls and supporting facts. There is no theme toggle, stored theme preference or automatic system-theme selection.

Use solid reading surfaces, quiet borders and restrained brand accents. The original honeycomb remains visible in page gutters and the newsletter band. Do not apply translucency to reading surfaces or put a raised wrapper around every article. Common corner radii are 8px; utility controls and media frames may use 4–8px. Navigation hover/focus states provide emphasis without giving passive panels an interactive appearance.

Use the spacing tokens in `settings.scss`. Close spacing joins related facts; record spacing supports scanning; section spacing separates topics. Directory headers and toolbars are compact. Breadcrumb list items have their own compact rhythm instead of inheriting full menu-row heights.

## Cards, panels and annotations

| Component | Contract |
| --- | --- |
| Destination/record card | One native `a.catalog-card.navigation-card`, with a real destination and consistent hover/focus treatment. Title, image, useful facts and action cue; no descriptive excerpt. |
| Compact List | Horizontal rows, quiet separators and dedicated action alignment on wide screens. Long titles wrap and rows grow as required. |
| Grid | Responsive bordered cards with consistent padding, image frames and action positions. The same records and DOM serve both views. |
| Editorial panel | A passive container with independent links. No pointer cursor or whole-panel hover effect. Full authored text remains available. |
| Unlinked product | A passive content panel with its factual description and any authored links. Do not invent a destination. |
| Context/resource annotation | Unique authored descriptions appear outside clickable cards as semantic resource notes. Embedded product notes stay in the same list item as their card so filtering keeps them together. |

Do not nest interactive controls or use stretched-link overlays, `onclick` containers or duplicated hidden card sets. Preserve all existing destinations and actions. Summaries remain canonical detail introductions and searchable data even when cards do not display them.

`card.html` supplies shared record cards. `listing-notes.html` preserves annotations that differ from the destination's existing introduction/body. `section-cards.html` arranges complete authored multi-link sections; these remain editorial panels. Homepage slides retain their authored promotional content.

## Image geometry

People use square 1:1 frames with modest corners: 56–64px in list rows, 104px in grids, 176px in desktop detail headers and 80px on mobile. Portraits use `cover` and retain any existing crop-position setting. Mobile portrait headers use a grid so the introduction starts below the image rather than overlapping it.

Organisation marks use an opaque landscape frame, centred with `contain` and internal padding. List frames are 120×60px on desktop and 88×44px on mobile. Grid frames have the same 256px maximum width and 112px height across logos. Detail frames are 260×130px on desktop and 192×96px on mobile. Square marks remain centred in these landscape frames. Intrinsic image dimensions do not determine frame widths.

Hardware diagrams and product artwork use `contain`; editorial images retain their useful proportions. Missing images do not produce placeholders or empty media columns. Keep image source paths, alt text and useful intrinsic dimensions in front matter; frame dimensions belong in CSS.

## Detail facts and resources

There is no visible generic “At a glance” heading. One or two short facts form an inline semantic definition list near the title/summary. Up to three resource actions can appear alongside these introductory facts. No facts means no empty wrapper.

More than two facts, a long fact/array, or more than three resource actions use the common side region on wide screens. It appears naturally above the body on mobile. This choice is derived from structured values, not per-record display switches or rendered HTML. The existing `facts-title` target remains available where facts exist. Certification facts retain their actual labels, dates and programme/product version distinctions.

Do not impose a reading-length `max-width` on `.record-body` or reserve an empty metadata column. CHERIBSD, for example, has one short structured fact and uses the full container with that fact inline. X730 has substantial technical and certification facts in the existing right-hand aside. At mobile widths, both the aside and article fill the container. Keep tables, code and diagrams responsive within the article; any specialist reading-width constraint belongs on the relevant content block.

Resource actions have at least 44px height. Facts and resources use quiet borders and spacing; they do not suggest whole-panel interaction. Related records follow the main body.

## Glossary and progressive enhancement

The output-disabled `_glossary` collection contains one Markdown file per term. Front matter has `title`, a stable `anchor`, and an optional existing destination in `link`. The definition, examples and inline links belong in the body. Numbered filenames retain the editorial order; letters, counts and search data are derived. The glossary page owns its introductory Markdown. There is no HTML-splitting glossary parser or second authoring registry.

Terms sit directly above their definitions, with a nearby permalink and a quiet letter rail. Entries remain open. The alphabet is a single scrolling strip on narrow screens; all letters are accessible by touch or keyboard. Search matches terms and definitions, reports the result count and offers clear/reset controls. Hash navigation clears a conflicting filter and reveals the target, including browser back/forward and repeated same-hash links. Without JavaScript, all definitions, links and the alphabet remain available.

Keep Unicode `▼`/`▲` menu indicators decorative and synchronised with expanded states. Preserve visible focus, 44px controls, no-JavaScript content and reduced-motion behaviour. Overflowing tables and code examples gain keyboard focus through the shared content enhancement; their text remains intact.

## Verification

Run `check_content.py`, `check_refinement.py`, `test_event_status.rb`, `test_catalog.py`, `test_layouts.py`, `test_presentation.py` and `test_refinement.py` against safe-mode root and baseurl builds as appropriate. The refinement fixtures are preservation evidence, not an authoring source. Update them deliberately for reviewed editorial changes. See [the refinement review](REFINEMENT_REVIEW.md) for measured outcomes and matching screenshots.
