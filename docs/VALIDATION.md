# Catalogue redesign validation

The latest presentation and Markdown migration results are in [the refinement review](REFINEMENT_REVIEW.md). The results below retain the earlier migration and layout-repair history.

Reviewed 20 October 2026 on `design/collections-redesign`, based on main commit `362e3d6`.

## Results

| Check | Result |
| --- | --- |
| Original collection records | All 305 retained; ordered author, speaker and organisation references preserved. |
| Publications | All 15 original paper citations retained verbatim. |
| Consolidated records | Five report records, 84 shared talks covering all 60 original talk profiles, and 23 structured product/project entries. |
| Safe Jekyll build | Passed at `/` and `/preview/`. Both outputs contain 738 HTML files. |
| Existing routes | All 732 retained. |
| Existing main-content anchors | All 2,974 recorded anchors retained. No duplicate rendered IDs. |
| Rendered links | No new broken references; inherited failures are listed separately below. |
| Browser review | 42 views per deployment: desktop/mobile directories, glossary, representative details, articles, ordinary pages and the original dark homepage. Two additional tablet glossary audits cover the presentation pass. |
| Accessibility | No axe WCAG A/AA violations in the 86 audited views. |
| Interaction checks | Search, accent-insensitive matching, filters, title/date sorting, keyboard view switching, query-state persistence, reset, board order and sparse records passed. |
| No JavaScript | All directory records and official document actions remain available. |
| Event status | Start/end-day boundaries and cancellation/postponement cases passed. |
| Review screenshots | 14 per deployment, including list, grid, detail, policy, news, ordinary page and homepage examples. Dedicated layout checks also save 12 full-page/hero screenshots per deployment. |
| Source hygiene | Python/JavaScript syntax and `git diff --check` passed. |

The local environment used its retained GitHub Pages bundle through `/workspace/cheri-native-bundle.sh`. The substantive build commands were `jekyll build --safe --destination dist` and `jekyll build --safe --baseurl /preview --destination dist-baseurl/preview`. Content checks used `scripts/check_content.py`; browser checks used Playwright, system Chromium and axe-core 4.10.3. The updated GitHub Actions workflow runs the equivalent checks with the repository's bundle. A hosted Actions run and deployment were not performed in this local review.

The checker's complete results are saved in `reports/root-content.json` and `reports/preview-content.json`. Browser results and screenshots are in `reports/browser/` and `reports/preview-browser/`. These generated review folders are excluded from the published site and uploaded as CI artifacts by the workflow.

## Inherited references

The baseline contains 15 broken references across these destinations:

- A missing CHERI Alliance logo-pack ZIP referenced by four pages.
- The former `/discover-cheri/` route.
- Two event speaker links, `/people/greg-chadwick/` and `/people/reid-derby/`, without corresponding source records.
- `/software/freebsd/`, referenced by two pages without a corresponding source record.
- Six references using older or mismatched technology paths for tags, sealing, compartmentalisation and spatial memory safety.

The rendered audit lists each source page and destination. These inherited failures are distinguished from regressions; the migration does not create replacement biographies, product claims, or an unverified downloadable archive.

Two unmarked policy copies now retain their routes as alternate versions with canonical links to the current policies. The earlier trademark alternate remains retained. Original media assets are preserved; generated card frames and SVG interface icons replace copied presentation markup.

## Build configuration

The main snapshot's workflow referenced missing scripts. It now invokes the checks that are present in this branch, validates both deployment prefixes, saves screenshots/results, and permits deployment only from main.

Generated `dist`, `dist-baseurl` and `_site` folders are explicitly excluded from source discovery, preventing one build from ingesting another build's output. Six retained documents also have repaired Markdown heading levels; their labels and anchors are unchanged.


## Layout repairs

The follow-up compares the rendered original at `362e3d6` with the catalogue redesign at `01e5f11`. The original backgrounds, palette and homepage composition are retained alongside the collection improvements.

| Cause | Repair |
| --- | --- |
| Extra 73ch/76ch page and article wrappers narrowed the content below the site container. | Ordinary pages, news headers, summaries, bodies and resources now use the available container width. Collection-detail prose retains its reading width. |
| Header/footer surface elements carried the content maximum width. | The outer surfaces fill the viewport; shared inner containers align with main content. The newsletter band follows the same structure. |
| Theme controls stored a visitor preference that overrode route styling. | The toggle, logo-switching data and theme-selection code are removed. Only `/` receives the explicit `home-page` class and original dark palette. Other routes remain light regardless of stored preference or OS theme. |
| The honeycomb was hidden on most routes and reduced to 0.025 opacity elsewhere. | Both original WebP tiles, native repeat/scale and original opacity values are restored, including the translucent page and homepage hero surfaces. |
| The homepage heading's HTML was escaped; the page layout omitted its configured section grouping. | A dedicated hero renders plain structured title/subtitle fields and both original introduction paragraphs. The original three-card and two-card groups, slider and onward content are restored. |
| Menu indicators used CSS border chevrons. | Each disclosure has an aria-hidden Unicode triangle; one state setter synchronises `▼`/`▲` with `aria-expanded`. |
| The desktop navigation could crowd intermediate widths; a stable scrollbar gutter reserved a blank edge strip. | Navigation switches at 1000px, and the unnecessary gutter reservation is removed. |

`scripts/test_layouts.py` checks five representative routes at 320, 390, 768, 999, 1000, 1280, 1600 and 1920px on both deployments: 80 route/width checks in total. It measures header/footer edges, inner-container alignment and article width; verifies honeycomb asset delivery, logos, titles and homepage section groups; and exercises keyboard expansion, Escape, visible focus and triangle state. It also checks the homepage and news with JavaScript disabled.

The final safe-mode root and `/preview/` builds both pass the original route, anchor, reference and asset audit. The 15 inherited broken references listed above remain unchanged; no new failures were introduced. The catalogue suite still covers List/Grid state, filtering, sorting, sparse records and progressive enhancement. No hosted Actions run or deployment was performed.

Original, before and after screenshots are saved under `reports/layout-fixes/original/`, `before/`, `after/` and `preview/`; each includes desktop/mobile homepage, ordinary page, news article, collection directory and detail examples. The original/before captures use 1600px desktop and 390px mobile widths; the after captures use the same widths. The workflow uploads newly generated screenshots and JSON results with the catalogue review artifact.

[Representative before/after screenshots](screenshots/layout-repairs/README.md) are also retained in the repository for review.

The subsequent [catalogue polish review](DESIGN_REVIEW.md) records the opaque surfaces, card/panel contracts and glossary improvements, with [shared component rules](DESIGN_SYSTEM.md) and matching before/after screenshots.
