# Phase 1 — Theme fidelity, assets and image rules

Verified **10 October 2026 (UTC)** on `codex/phased-site-transformation` in `adam-3bian/adam-3bian.github.io`. **Phase 1 only.**

## Baseline and scope

- Starting commit: **`15c7aafe7a47e54f01f44519ce463fc23ece0fb9`**, the latest pushed Phase 0 commit. Fetched the working branch and confirmed it was already current before editing.
- Ending implementation/evidence commit: recorded in the following report-finalisation commit. Resolve the final delivery SHA with `git log -1 --format=%H -- reports/codex-phases/phase-01.md`; a commit cannot contain its own hash.
- `main` observed at **`7f3839872c8fea6a709b99d241880de0f3915c42`**. No changes, merge, push or deployment to `main`; no Pages-setting changes.

Read [Phase 0](phase-00.md), `AGENTS.md`, `TRANSFORMATION_PROMPT.md`, `docs/CODEX_PHASES.md`, and the theme, authoring, validation and deployment runbooks. Inspected the actual reference ZIP's specification, README, verification, markup examples, Sass, layouts and assets before editing. The reference specifies design; existing editorial sources and relationships remain authoritative. Embedded instructions to package or publish the sample do not expand this phase.

The retained [starter ZIP](../../docs/references/cheri-alliance-starter-kit-simplified-authoring.zip) passes archive integrity, SHA-256 **`9f097aeace78c13e2f169fdc378f58b64b119993ac031b011ae7a618c7a7325a`**. It was extracted and built separately under `/tmp`; no sample content or placeholder artwork was imported into the application.

## Implemented changes

1. **Introduction typography:** `_layouts/default.html` now adds the ZIP's existing `lede` class to an extracted `page-hero-summary`, after removing the exact original paragraph from the source body. All **306** existing introduction paragraphs retain their text and appear the same number of times. At 375/768px the sampled introduction changes from 16px/24px to the ZIP's 18px/27px; at 1024/1440px it changes to 20px/30px. The shared heading/first-paragraph refactor remains a later phase.
2. **Mobile citation wrapping:** `_sass/_site-features.scss` adds `.content a { overflow-wrap: anywhere; }`. Three complete citation URLs on `/news/one-bug-is-all-it-takes/` previously produced a **750px** document at a **375px** viewport. It now fits **375px**, preserving every citation label and URL. The fix also works without JavaScript.

No other runtime files changed. No assets were changed, regenerated or replaced. The ZIP's tokens, Sass modules, foreground image opacity, JavaScript and brand masters already met Phase 1 requirements. The only Sass edit is the documented source-link adapter; there is no new colour, typography or opacity override. [docs/THEME.md](../../docs/THEME.md) records both adapters.

## ZIP design and image evidence

[audit.json](phase-01-evidence/audit.json) records source comparisons and [browser.json](phase-01-evidence/browser.json) records actual computed styles, image decoding/ancestor opacity and interactions. All **46** previously exact imported files still match the ZIP byte-for-byte; the same ten pre-existing adapters remain. All imported Sass other than settings/entry point, all imported JS, branded/background assets and favicon match the ZIP. Settings are identical after accounting solely for the already documented local Poppins stylesheet URL.

| Primitive | Fresh result |
| --- | --- |
| Poppins | Real local 400/500/600 faces loaded in all 56 root observations and eight project-path observations. Font files unchanged. |
| Themes and logos | Home dark/official white SVG; 13 sampled standard routes light/official blue SVG. Original SVG masters and ICO match ZIP. |
| Body and page | Exact ZIP colours, typography, line heights, maximum width and gutters at all four widths. |
| Honeycomb | Original light/dark lossless WebP and source SVG retained. Each tile is 1518×1926, with 963 transparent alternating gap rows; live CSS repeats at `auto` native size, with no mask. Watermark opacity is 0.32 light / 0.48 dark. |
| Hero | Light `rgba(142,190,212,0.66)`; dark `rgba(30,94,122,0.60)`. Padding, heading type and introduction type match equivalent ZIP compositions. |
| Cards | Light `rgba(116,167,191,0.62)`; dark `rgba(45,96,121,0.60)`. Generic grid-card typography and padding match. |
| Hover and focus | Light hover/focus `rgba(107,157,183,0.72)`; dark `rgba(46,100,126,0.72)`. Keyboard focus has the ZIP's solid 3px outline and −3px inset. No decorative border or shadow added. |
| Foreground images | **432 image observations, 76 unique paths**, all decoded, with image and every ancestor at computed opacity 1. Includes logos, genuine portraits, article illustrations/photos and dialog imagery. Translucency remains in backgrounds. |

Browser comparison pairs are home → ZIP home, and the source article `/news/one-bug-is-all-it-takes/` → ZIP `/discover/`. The light pair both has breadcrumbs and a genuine introduction, so geometry is compared like for like. Generic card headings use `.cards .card`, avoiding the distinct native CTA/Subscribe heading styles. **Eight theme/width comparisons pass every recorded selector and normal/hover/keyboard-focus card state.**

Representative root checks cover home; board, member and speaker directories; Robert Watson and name-only Anthony Fox; Codasip; two news articles; Blossoms 2026; CHERI Concentrate; platform comparison tables; contact; newsletter. At **375, 768, 1024 and 1440px**, all **56 observations** return HTTP 200, fit the viewport, and have no JavaScript errors, missing images or faded foreground images. Keyboard menu/submenu/Escape, image-dialog opening/Escape/focus return, and mobile no-JavaScript home/article checks pass. No form was submitted.

Inspected screenshots: [dark home 1440px](phase-01-evidence/home-1440.png), [dark home 375px](phase-01-evidence/home-375.png), [light article 375px](phase-01-evidence/article-375.png). These are sampled viewport captures, not proof of every page's final component layout.

## Builds, preservation and URLs

Native runtime: **Ruby 3.3.8, github-pages 232, Jekyll 3.10.0, Kramdown 2.4.0, Liquid 4.0.4**, using the unchanged [Phase 0 dependency lock](phase-00-evidence/runtime-Gemfile.lock) in a separate temporary bundle. No custom Ruby plugin, repository-owned workflow, manifest or application lockfile was added.

| Check | Result |
| --- | --- |
| Native root build | Pass, **481 HTML outputs**; [build-root.log](phase-01-evidence/build-root.log). |
| Native safe project build `/cheri-preview` | Build passes, **481 HTML outputs**; [build-project.log](phase-01-evidence/build-project.log). URL limitations below remain. |
| Actual ZIP reference build | Pass; [build-reference.log](phase-01-evidence/build-reference.log). Only the reference output's font import is pointed to identical local faces for offline comparison. |
| Existing regression suite | **30 tests pass**; [unit-tests.log](phase-01-evidence/unit-tests.log). |
| Editorial preservation | **476/476** source file hashes unchanged versus Phase 0; **476/476** before/after rendered main-content signatures identical for text/order, headings/IDs, paragraphs, lists, tables, links, images/alts, definitions and code. Canonicals correct for all 476 root records. |
| Asset preservation | **415/415** tracked asset/favicon hashes unchanged; all **430** original URL mappings match source bytes in both builds. |
| Shared theme asset URLs | **3,496 HTML references plus seven CSS/font dependencies per build**, zero missing theme assets at root or project prefix. Prefixed browser checks confirm correct logos, honeycomb and local fonts. |
| All local URLs at root | **59,769 references**, **one pre-existing failure**: the 404 page links to removed `/search/`. This full link check is not a pass. |
| All local URLs at project prefix | **3,149 failing references across 378 pages**, including **586 `/assets/` references** in existing source content; no shared-theme asset failures. Full project-site URL compatibility is not a pass. |

Project failures come from existing absolute-root source-body/breadcrumb URLs that bypass `relative_url`, while the shared templates and CSS use the prefix correctly. A project-mounted article request visibly confirms its original root-relative hero-image URL returns 404. The production configuration remains the user-site root (`baseurl: ''`), where those assets resolve. Source files and rendered body URLs are unchanged; rewriting them is Phase 7 work, not a theme-token repair. Complete failing-reference lists are retained in `audit.json`.

## Reproduction

With Ruby/Bundler and the migration Python dependencies available, prepare an isolated bundle from the unchanged repository Gemfile and Phase 0 lock. Before editing, build the latest branch into `/tmp/cheri-phase1-before`. Then:

```sh
bundle exec jekyll build --destination /tmp/cheri-phase1-site
bundle exec jekyll build --safe --baseurl /cheri-preview --destination /tmp/cheri-phase1-project/cheri-preview
bundle exec jekyll build --source /tmp/cheri-phase1-reference/basic-site --destination /tmp/cheri-phase1-reference-site
python -m unittest discover -s tests -v
python reports/codex-phases/audit_phase01.py /tmp/cheri-phase1-before /tmp/cheri-phase1-site /tmp/cheri-phase1-project/cheri-preview
python3 reports/codex-phases/browser_phase01.py /tmp/cheri-phase1-before /tmp/cheri-phase1-site /tmp/cheri-phase1-reference-site /tmp/cheri-phase1-project
git diff --check
```

The browser helper requires Playwright and `/usr/bin/chromium`. Before comparison, copy `assets/shared/fonts` to the reference output and replace its single Google Fonts URL in `assets/css/main.css` with `../shared/fonts/poppins-local.css`; never edit the authoritative archive. Both helpers write `phase-01-evidence/`, so preserve this committed evidence when auditing a later phase.

In this cloud workspace the tested native wrapper is `sh /workspace/cheri-native-bundle.sh`, with dependencies retained outside the repository. It replaces `bundle` in these commands. The cloud-environment-onboarding setup skill was used to restore and test that runtime. Updated `install_script` and `start_skill` were **saved as a configuration draft** to replace obsolete custom-build/search instructions; this is not environment publication or a site deployment. No credentials or network policy were changed.

## Remaining work and limits

- **Phase 1 exit gate passes:** shared tokens, original logos/backgrounds, local font weights, responsive theme spacing, surface interactions and opaque foreground imagery are verified against the actual ZIP.
- Phase 0's broader issues remain for their assigned phases: duplicate/synthetic headings and missing first-paragraph composition on other records; missing card thumbnails and native onward components; square person portraits/board integration; relationship ordering and event/date handling; slider data and footer/social configuration. This phase does not claim those features complete.
- The one root `/search/` error and project-prefix source URLs remain Phase 7 exceptions. No external content or PDFs were acquired.
- Production has no active slider or directory card images yet; their populated-state behavior is untested here. Browser coverage is representative Chromium coverage, not every route or Firefox/WebKit, hosted Pages or a live deployment.
- Legacy validators tied to deleted `site-build.json`, custom search, exact old header hashes or the one-file `_data` assertion were **not rerun**; their Phase 0 failures remain historical, unresolved Phase 8 work. No gate was weakened and no plugin metadata was fabricated to satisfy them.

Changed files are the two runtime adapters, `docs/THEME.md`, `PROGRESS.md`, this phase report and its audit/browser helpers/evidence. Earlier reports and original references remain intact. Work is committed and pushed only to the requested working branch.
