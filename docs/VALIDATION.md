# Catalogue redesign validation

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
| Browser review | 41 views per deployment: desktop/mobile directories and representative details, articles and ordinary pages, plus dark-theme checks. |
| Accessibility | No axe WCAG A/AA violations in the 82 audited views. |
| Interaction checks | Search, accent-insensitive matching, filters, title/date sorting, keyboard view switching, query-state persistence, reset, board order and sparse records passed. |
| No JavaScript | All directory records and official document actions remain available. |
| Event status | Start/end-day boundaries and cancellation/postponement cases passed. |
| Review screenshots | 13 per deployment, including list, grid, detail, policy, news, ordinary page and dark-theme examples. |
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
