# Catalogue refinement review

This pass implements the agreed refinement on `design/catalogue-polish`, starting at `616b0c1`. The temporary prompt, audit and their standalone screenshot directory have been removed. Shared authoring and component documentation remains in [AUTHORING.md](AUTHORING.md) and [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md).

## Design decisions

Navigation cards now show a title, useful facts, optional imagery and an action cue. They omit descriptive excerpts in both List and Grid. Compact list rows use separators; grid cards keep consistent frames, padding and actions. Canonical summaries remain detail introductions and searchable text. Unique resource annotations remain visible outside clickable cards; product annotations stay paired with their records during filtering. Unlinked products remain passive content panels with their full descriptions.

The light pages use system sans-serif prose and controls alongside Poppins headings. The homepage retains Poppins, its dark palette and original composition. Opaque surfaces, a restrained blue accent and fewer pale enclosing panels give headings, navigation and reading content different levels of emphasis. The original honeycomb and full-width header/footer surfaces remain.

People use square portraits. Organisation logos are centred and contained in landscape frames with explicit sizing, rather than inheriting inconsistent widths from their intrinsic proportions. Axiomise's detail frame is now 260×130px on desktop and 192×96px on mobile; the former sizes were 176×176px and 68×68px. Member grid frames share a 256px maximum width and 112px height. Hardware diagrams retain their complete image proportions.

The generic “At a glance” caption and sparse fact boxes are gone. One or two short facts appear near the introduction in a semantic definition list. Dense records retain the shared facts/resources region. The CHERIoT page no longer reserves a sidebar for “Record type: Platform overview”. Primary resource actions remain available and have at least 44px height.

The glossary renders structured Markdown records directly. Terms sit above their definitions with nearby permalinks and a quiet letter rail. Search/count controls are compact and the narrow-screen alphabet scrolls horizontally. Definitions stay open, with no per-term cards or accordions. Existing anchors work through search, repeated links and browser history. No HTML-heading parser remains.

## Measured space use

Matching captures use 1440×1000 and 390×844 viewports, loaded fonts and the same authored content. Positions are measured from the viewport top before scrolling.

| Measurement | Before | After | Change |
| --- | ---: | ---: | ---: |
| First Members card, desktop | 705px | 590px | 16% higher |
| First Members card, mobile | 867px | 737px | 15% higher |
| First glossary definition, desktop | 632px | 517px | 18% higher |
| First glossary definition, mobile | 832px | 596px | 28% higher |
| Short Members list row, desktop | 146px | 93px | 36% shorter |

The named news article retains the full shared content width: 1200px at a 1440px viewport and 350px at 390px. Its compact breadcrumbs no longer reserve two 44px menu rows. Authored summaries, headings, bylines, credits, paragraphs and images remain in natural flow.

## Preservation and authoring

- All 310 existing collection records remain: 305 original records and five reports. Ordered relationships, citations, versions, date precision, certification scope and factual content are retained.
- All 46 glossary definitions moved unchanged into `_glossary/*.md`, retaining 20 existing term destinations, 16 letter groups and their editorial order. Each file has only `title`, stable `anchor` and an optional existing `link`; the definition is its Markdown body. The collection is output-disabled and creates no new detail routes.
- All 266 redirect source files are now Markdown. Their front matter, output permalinks and redirect destinations are identical to the previous HTML stubs.
- Of 902 protected source/data/media files, 838 remain byte-for-byte unchanged. The glossary page's definitions intentionally moved into separate files. The other 63 changed files are People records whose bodies are unchanged; only 116 unused or exactly derivable metadata fields were removed. Different organisation labels remain intact.
- All 396 descriptions identified as distinct in the annotation audit remain rendered, and their embedded destinations remain links. Canonical summaries were retained at their sources and on details.
- Both outputs retain 738 HTML pages, all 732 baseline routes and all 2,974 originally recorded anchors. The newer term permalinks are also covered by the independent glossary fixture. There are no duplicate IDs or newly broken references. The 15 inherited broken references remain documented in [VALIDATION.md](VALIDATION.md).

The migration fixture records the pre-change glossary and redirect map independently of the new templates. It is validation evidence, not a second source used to render the site. The normal authoring sources remain Markdown and the existing shared registries.

## Checks performed

Both safe-mode builds passed:

```sh
bundle exec jekyll build --safe --destination dist
bundle exec jekyll build --safe --baseurl /preview --destination dist-baseurl/preview
```

The local runtime used `/workspace/cheri-native-bundle.sh`: Ruby 3.3.8, Jekyll 3.10.0 / GitHub Pages 232, system Chromium 151, Playwright and axe-core 4.10.3. Python dependencies, including lxml for rendered preservation checks, are declared in `requirements-dev.txt`.

The following checks ran against the appropriate root and `/preview` outputs:

- `check_content.py`: collection references, dates/versions, preserved routes/anchors, assets and internal links.
- `check_refinement.py`: exact glossary wording/order/anchors/destinations and all redirect outputs.
- `test_event_status.rb`: event timing boundaries, cancellation and postponement.
- `test_catalog.py`: search, filters, sorting, keyboard view controls, state persistence, sparse records, board order, no-JavaScript resources and 42 accessibility views per deployment.
- `test_layouts.py`: 40 responsive checks per deployment, full-width surfaces, content alignment, homepage-only dark styling, honeycomb paths and Unicode menu behaviour.
- `test_presentation.py`: glossary search/hash behaviour, unchanged definitions, card/panel contracts, opaque surfaces, reduced motion, no-JavaScript content and a tablet accessibility audit per deployment.
- `test_refinement.py`: 45 responsive views per deployment across the named pages, including portrait/logo geometry, sparse facts, first-content positions, glossary browser history, product annotations/filtering and 27 additional accessibility audits per deployment.

Together, the suites report **140 axe audits without WCAG A/AA violations** and **170 responsive layout checks** across the container and refinement suites. Review widths include 320, 390, 768, 999, 1000, 1280, 1440, 1600 and 1920px. The zoom-equivalent check uses a 720 CSS-pixel viewport at 2× pixel ratio, matching a 1440 physical-pixel viewport at 200%; it is not a claim of manual browser-UI zoom testing. Overflowing code examples now gain keyboard focus and a visible outline through the shared content enhancement.

Python/JavaScript syntax and Git whitespace checks passed. Representative screenshots were reviewed for hierarchy, whitespace, image crops and missing content; automated accessibility checks do not replace a full assistive-technology audit.

[Matching before/after screenshots](screenshots/catalogue-refinement/README.md) cover all eight named pages, both Members views and the homepage on desktop/mobile, with additional tablet views. Generated JSON reports and complete screenshot sets live under `reports/refinement/`, excluded from the public site and uploaded by CI.

## Publication

The repository already uses GitHub's automatic Pages branch build for `design/catalogue-polish`; the preceding commit's successful Pages run confirmed this route. The validation workflow now also runs on pushes to this branch. Implementation is pushed to the same branch, without merging into main or changing Pages settings.

The execution environment blocks direct access to `adam-3bian.github.io`, so the live site cannot be visually inspected here. Publication is verified through the Pages workflow's commit and deploy result; the final delivery message links that evidence. Local screenshots show the checked-out implementation and are not presented as live captures.
