# Phase 6 — Homepage, navigation, footer, socials and forms

Verified **10 October 2026 (Europe/London)** on `codex/phased-site-transformation`. The user requested Phases 5 and 6 together; Phase 5 was completed and pushed first.

## Baseline and delivery

Starting commit: **`f968fad0257c0b4fc5b71299aefb3b300480abeb`**, the completed Phase 5 implementation/evidence commit. The combined task began from Phase 4's latest pushed `f000ccde5c526ba573a23dcf1cc5524f469dc92c`, after reading its report and fetching the working branch. **Ending implementation/evidence commit: `3f2fa2f60d5363f5e62316ecdce34210866d1e36`**, pushed to the working branch. A following documentation-only commit records that SHA; resolve the final delivery SHA with `git log -1 --format=%H -- reports/codex-phases/phase-06.md`.

Reviewed the actual retained starter ZIP, its homepage/default layout, slider, header/footer, forms, specification, authoring examples and source/license notes, plus the user's supplied master prompt. No demonstration content/assets entered production. The existing cloud-onboarding native github-pages 232/Jekyll 3.10.0 bundle remains sufficient; dependencies and environment configuration are unchanged.

## Implementation

**Real dark homepage.** Retained every byte of the full homepage Markdown body and its large dark hero. Added two genuine image/text slides from existing records: CHERITech'26 and the ETSI memory-safety article. Titles, images/alts and text come directly from those records; [slide provenance](phase-06-evidence/slide-provenance.json) records paths and hashes. The actual ZIP slider now appears immediately after the hero, with native 40/56px section spacing. Each whole slide links its existing canonical record; genuine artwork is contained without cropping. Existing news/event selections, Related pages and Where next remain.

**Carousel controls.** Reused the ZIP markup, Sass, dots and vanilla script. Autoplay advances at 5,000ms; any focus within the carousel pauses it, including dot controls. Hidden documents and reduced motion stop automatic rotation. Added a native Pause/Play button for persistent user control. Reduced motion disables automatic playback but preserves manual dots. Inactive slides remain hidden/inert and excluded from focus; their native invisible frames reserve the largest caption height. With no JavaScript, the first slide and link remain usable and controls stay hidden.

**Five / three / five navigation.** Retained the five existing header categories and real submenu destinations: Discover CHERI, Adopt, Build, CHERI Alliance, News & Events. Removed Explore from the footer; the native `columns-3` grid now contains Updates, CHERI Alliance and Legal only. Added the exact five social destinations from the supplied master prompt, in order: Slack, LinkedIn, Mastodon, GitHub, YouTube. All have meaningful local icons and protected new-tab links.

Slack/LinkedIn/Mastodon SVGs are unchanged from the ZIP. GitHub/YouTube paths come from **Bootstrap Icons v1.13.1**, with matching 24×24 wrappers and `#f5f7f5` fill. Path geometry is unchanged; upstream MIT wording matches the existing retained license. Download and installed hashes are in [reference-access.json](phase-06-evidence/reference-access.json). No icon font, CDN script or tracking widget is loaded by the site.

**Evidence-backed navigation fixes.** Browser testing exposed an incomplete existing tablet adapter: at 768–1100px, JavaScript selected stacked menus but CSS still hid the nested group controls. The adapter now restores the native stacked controls and static submenu placement. A broad legacy `[hidden] !important` rule also overrode the ZIP's no-JavaScript menu fallback and stable carousel-height treatment; it is now limited to hidden card-list items. No ZIP design tokens were changed.

**Forms and subscribe.** Existing native includes/controls were already suitable and remain intact. Contact and newsletter are explicitly disconnected previews with notices, associated labels, disabled buttons and genuine external destinations. There is no submit form/endpoint, fabricated success, or data collection. Subscribe links the real local newsletter page.

Changed runtime: `_config.yml`, `_includes/{footer,slider}.html`, `_layouts/default.html`, `_sass/_site-features.scss`, `assets/js/slider.js`, two new social SVGs and homepage front matter only. Documentation/evidence: `docs/{AUTHORING,THEME}.md`, `PROGRESS.md`, both phase reports, Phase 6 helpers and evidence. All other editorial records, relationships, original media/fonts/logos, dependency manifests and publishing settings remain unchanged.

## Fresh verification

| Check | Result |
| --- | --- |
| Native root and safe `/cheri-preview` builds | Pass; **481 HTML outputs** each. |
| Source and rendered content | **476/476 body hashes and full rendered prose signatures pass**, excluding only the separately verified new slider. Other 475 editorial files byte-match Phase 5. |
| Canonicals, anchors and relationships | All 476 routes/canonicals, single H1, unique IDs and former anchors pass; all rendered relationship target arrays unchanged. Sitemap byte-identical to Phase 5. |
| Header/footer/social shell | Exact five-header/three-footer/five-social model verified on **all 476 editorial outputs**. All local menu/footer targets resolve in the full link audit. |
| Assets | **414 of 415 existing asset/favicon sources unchanged**; the documented slider script is the sole modified asset. Every static asset matches both outputs; SCSS has its compiled output. Two matching licensed SVG icons added. |
| Native Markdown and JavaScript | **476 Markdown records pass**; `node --check` passes for slider and navigation scripts. Historical Markdown audit JSON restored. |
| Existing regression suite | **30 tests passed in Phase 5 earlier in this combined task**; those test-covered migration modules did not change in Phase 6. No duplicate run claimed. |
| Responsive browser | **Six routes × four widths = 24 views**, at 375/768/1024/1440px, with decoded opaque foreground images, one H1, no overflow or JavaScript errors. |
| Actual ZIP styles | **Four comparisons pass** for dark hero, slider/grid/images/dots, typography, spacing, footer/social treatment and subscribe surfaces. |
| Header interactions | **20 keyboard menu flows** pass: five categories at every width, nested stacked controls, Escape closure and focus restoration, no menu overflow. |
| Carousel | **15 checks pass**: stable height at four widths, actual approximately-five-second advancement, link/dot focus pause, blur resume, visibility-event pause/resume, persistent Pause/Play, reduced motion/manual selection, hidden/inert state. Visibility handling uses a documented deterministic `document.hidden`/`visibilitychange` simulation; an actual backgrounded desktop tab was not measured. |
| Keyboard navigation | Both slide CTAs and the Subscribe link navigate correctly; native slide links show keyboard focus. |
| Forms | Contact's five fields and newsletter's one field have labels; typing/Enter stays local, produces **zero requests**, and leaves disabled non-submitting controls. No external form was submitted. |
| No JavaScript | **Six mobile/desktop views** pass: header links remain visible, homepage first slide/CTA works, carousel controls stay hidden, forms stay disconnected, no overflow. |
| Project-prefix browser | **12 views** pass for menu/footer/subscribe/slide links and all generated slide/social images. |
| Full root links | **59,344 local references**, **one existing error**: `/search/` on 404. |
| Full project-prefix links | **1,406 retained source URL errors**; zero errors among **3,331 generated card/image references**. |
| Whitespace | `git diff --check` passes. |

Evidence: [audit.json](phase-06-evidence/audit.json), [browser.json](phase-06-evidence/browser.json), build/Markdown/browser logs and screenshots in [phase-06-evidence](phase-06-evidence/). Responsive screenshots use reduced motion for stable capture; the timed interaction tests explicitly enable normal motion. Inspected desktop slider and mobile footer screenshots confirm authentic artwork and all five icons.

The initial browser run exposed the tablet CSS defect above. A later keyboard assertion incorrectly sampled focus visibility after pointer input; the harness now switches to keyboard input before checking the native link. The final browser evidence is from the corrected run against the final build.

## Reproduction

Use the Phase 5 build as `BEFORE`, build the final checkout into root and prefixed temporary outputs, and use the independently built actual ZIP reference with local Poppins (see Phase 5).

```sh
bundle exec jekyll build --destination /tmp/cheri-phase6-site
bundle exec jekyll build --safe --baseurl /cheri-preview --destination /tmp/cheri-phase6-project/cheri-preview
bundle exec ruby scripts/check_markdown.rb
node --check assets/js/slider.js
node --check assets/js/navigation.js
python reports/codex-phases/audit_phase06.py /tmp/cheri-phase5-site /tmp/cheri-phase6-site /tmp/cheri-phase6-project/cheri-preview
python3 reports/codex-phases/browser_phase06.py /tmp/cheri-phase6-site /tmp/cheri-phase56-reference-site /tmp/cheri-phase6-project
git diff --check
```

Here `sh /workspace/cheri-native-bundle.sh` substitutes for `bundle`; migration Python is `/workspace/cheri-migration-venv/bin/python`, system Python provides Chromium/Playwright. Preserve the historical Markdown validation JSON when running its checker. Browser functional checks block external requests and never submit production forms.

## Exceptions and handoff

**Phase 6's implementation exit gate passes.** Remaining verification/content limitations are explicit:

- The requested live navigation comparison at `https://cheri-alliance.github.io/` was blocked by a proxy **403 CONNECT** response. Existing repository menu destinations and the supplied explicit five-category/three-group specification were used; no submenu was invented.
- A read-only HEAD check of the GitHub social destination returned **200**. Slack, LinkedIn, Mastodon and YouTube were blocked by the same proxy; their correct supplied URLs, local icons and anchor behavior are verified, but current external service availability is not. See [social-access.json](phase-06-evidence/social-access.json).
- Root `/search/` and retained source-body project-prefix failures remain **Phase 7** work. Full-site link validation is not yet entirely passing. Root Pages publishing remains the configured deployment target.
- Legacy validators requiring removed search/plugin metadata remain **Phase 8** work. Chromium coverage is representative, not every browser or a hosted Pages deployment. Source labels/dates and name-only/catalogue limitations recorded in earlier reports persist.

No new editorial scraping, PDF acquisition, real form submission, PR publication, main modification, merge, Pages-setting change or deployment occurred. Only the requested working branch is pushed. Remote `main` remains at the observed `7f3839872c8fea6a709b99d241880de0f3915c42`.
