# Material system review

Baseline: deployed commit [`8c0a746`](https://github.com/adam-3bian/adam-3bian.github.io/commit/8c0a7469feb939321f75dbc125d858a86745c06b). The baseline Pages run was [39379624111](https://github.com/adam-3bian/adam-3bian.github.io/actions/runs/39379624111). “After” images show the final safe-mode build of the implementation in this commit. The same routes, viewport dimensions and menu/view states are used in each pair: desktop 1440×1000, mobile 390×844. The browser waits for local fonts and images and uses reduced motion. Images are actual browser captures, not mock-ups.

Public `github.io` pages cannot be fetched from this environment. The audit therefore used a local build of the verified deployed commit. Publication is verified separately through the exact pushed SHA in GitHub Pages Actions; no direct live-browser comparison is claimed.

## Causes and shared changes

| Baseline issue | Cause | Shared resolution |
| --- | --- | --- |
| Redundant “Policies” line and noisy related policy card | Header inferred a collection eyebrow; cards opted into metadata implicitly | Breadcrumb supplies context; archived status remains explicit; card metadata defaults off and directories opt in |
| Isolated PDF action and fragmented sidebar | Resource links had their own sizes and separate panel surface | Facts/resources share one neutral region; one action component supplies the same label/icon sizing and states |
| Newsletter looked like a banner link containing a second button | Two newsletter includes repeated the same whole-link/fake-action pattern | Both call a passive promotional panel with one real, standard primary action |
| Oversized hero, almost invisible gradient frame | Independent hero type scale and an 8px slider edge | Shared display role, tighter hero rhythm and a substantial 24–32px translucent feature surround |
| Menu/footer headings felt unrelated | Cyan applied independently to both group styles | Common white semibold group role on opaque brand surfaces |
| Clickable rows appeared flatter than cards | Card surfaces and overrides were split across Sass files | One common surface and resting elevation; compact geometry changes without a second interaction style |
| Membership labels looked like buttons | Filled rectangular badges used the same colour emphasis as actions | Informational text and a small hexagon marker, retaining stable row/grid footer alignment |
| Honeycomb disappeared through lower sections | Nearly opaque band, opaque outer footer and continuous dark home canvas | One continuous artwork layer, translucent outer surrounds and opaque inner text surfaces |

The hero is passive with one bottom border. The newsletter has no panel hover/elevation; only its real action is interactive. Reading content stays flat and full width. The official PDF notice, all authored wording, member registry, metadata and menu data remain untouched. The resulting contracts and structural exceptions are in [the shared design documentation](../../DESIGN_SYSTEM.md).

## Matching screenshots

### Desktop — 1440×1000

| View | Before | After |
| --- | --- | --- |
| Homepage hero and slider | [Before](before-desktop-home.png) | [After](after-desktop-home.png) |
| Slider surround and adjacent content | [Before](before-desktop-slider.png) | [After](after-desktop-slider.png) |
| Newsletter and transition to footer | [Before](before-desktop-newsletter.png) | [After](after-desktop-newsletter.png) |
| Footer | [Before](before-desktop-footer.png) | [After](after-desktop-footer.png) |
| Expanded mega-menu | [Before](before-desktop-menu.png) | [After](after-desktop-menu.png) |
| Competition Law Statement and PDF resource | [Before](before-desktop-policy.png) | [After](after-desktop-policy.png) |
| Policy related navigation | [Before](before-desktop-policy-related.png) | [After](after-desktop-policy-related.png) |
| Members — List | [Before](before-desktop-members-list.png) | [After](after-desktop-members-list.png) |
| Members — Grid | [Before](before-desktop-members-grid.png) | [After](after-desktop-members-grid.png) |
| Membership badge alignment | [Before](before-desktop-member-cards.png) | [After](after-desktop-member-cards.png) |
| People — Grid | [Before](before-desktop-people.png) | [After](after-desktop-people.png) |
| Person detail | [Before](before-desktop-person.png) | [After](after-desktop-person.png) |
| Organisation detail | [Before](before-desktop-company.png) | [After](after-desktop-company.png) |
| Paper with ordered authors | [Before](before-desktop-paper.png) | [After](after-desktop-paper.png) |
| CHERIBSD without aside | [Before](before-desktop-software.png) | [After](after-desktop-software.png) |
| X730 with aside | [Before](before-desktop-hardware.png) | [After](after-desktop-hardware.png) |
| Glossary | [Before](before-desktop-glossary.png) | [After](after-desktop-glossary.png) |
| Alliance category index | [Before](before-desktop-alliance.png) | [After](after-desktop-alliance.png) |
| News and events category index | [Before](before-desktop-subcategory.png) | [After](after-desktop-subcategory.png) |
| Presentations / supporting navigation | [Before](before-desktop-presentations.png) | [After](after-desktop-presentations.png) |
| News article | [Before](before-desktop-article.png) | [After](after-desktop-article.png) |

### Mobile — 390×844

| View | Before | After |
| --- | --- | --- |
| Homepage hero and slider | [Before](before-mobile-home.png) | [After](after-mobile-home.png) |
| Slider surround and adjacent content | [Before](before-mobile-slider.png) | [After](after-mobile-slider.png) |
| Newsletter and transition to footer | [Before](before-mobile-newsletter.png) | [After](after-mobile-newsletter.png) |
| Footer | [Before](before-mobile-footer.png) | [After](after-mobile-footer.png) |
| Expanded mega-menu | [Before](before-mobile-menu.png) | [After](after-mobile-menu.png) |
| Competition Law Statement and PDF resource | [Before](before-mobile-policy.png) | [After](after-mobile-policy.png) |
| Policy related navigation | [Before](before-mobile-policy-related.png) | [After](after-mobile-policy-related.png) |
| Members — List | [Before](before-mobile-members-list.png) | [After](after-mobile-members-list.png) |
| Members — Grid | [Before](before-mobile-members-grid.png) | [After](after-mobile-members-grid.png) |
| Membership badge alignment | [Before](before-mobile-member-cards.png) | [After](after-mobile-member-cards.png) |
| People — Grid | [Before](before-mobile-people.png) | [After](after-mobile-people.png) |
| Person detail | [Before](before-mobile-person.png) | [After](after-mobile-person.png) |
| Organisation detail | [Before](before-mobile-company.png) | [After](after-mobile-company.png) |
| Paper with ordered authors | [Before](before-mobile-paper.png) | [After](after-mobile-paper.png) |
| CHERIBSD without aside | [Before](before-mobile-software.png) | [After](after-mobile-software.png) |
| X730 with aside | [Before](before-mobile-hardware.png) | [After](after-mobile-hardware.png) |
| Glossary | [Before](before-mobile-glossary.png) | [After](after-mobile-glossary.png) |
| Alliance category index | [Before](before-mobile-alliance.png) | [After](after-mobile-alliance.png) |
| News and events category index | [Before](before-mobile-subcategory.png) | [After](after-mobile-subcategory.png) |
| Presentations / supporting navigation | [Before](before-mobile-presentations.png) | [After](after-mobile-presentations.png) |
| News article | [Before](before-mobile-article.png) | [After](after-mobile-article.png) |

## Checks completed

| Check | Result |
| --- | --- |
| Jekyll production build with `--safe` at root and `--baseurl /preview` | Passed on both final outputs |
| `check_content.py` on both outputs | 738 pages, unchanged collection counts, no new broken references |
| `check_refinement.py` on both outputs | 46 glossary definitions, 20 linked terms, 266 redirects and 84 talks preserved |
| Event-status Ruby tests | Date boundaries and cancellation/postponement handling passed |
| Form Ruby tests | Configured POST/GET endpoints, baseurl, labels and unconfigured fallback passed; no messages sent |
| `test_catalog.py` on both outputs | Search/filter/sort/view state, board order, sparse records, no-JavaScript behaviour and 84 axe audits passed |
| `test_layouts.py` on both outputs | 80 responsive checks, full-width surfaces, content alignment, homepage-only theme and keyboard menu behaviour passed |
| `test_presentation.py` on both outputs | 50 reviewed views, glossary interactions, passive/card contracts, actual action-state contrast, reduced motion and tablet accessibility passed |
| `test_refinement.py` on both outputs | 120 responsive checks and 72 axe audits; images, full-width/aside geometry, history, product notes and zoom equivalent passed |
| `test_consistency.py` on both outputs | 144 responsive checks and 48 axe audits; exact 84-option menu, newsletter semantics, plain text surfaces, policy context and 52 members / 21 founding labels passed |
| Independent source/render comparison against the starting commit | All 784 authored Markdown/front-matter files identical; no lost main destinations or anchors, no changed detail/article body text or menu options across 738 routes |
| Software ecosystem subcategory review | All 12 compact destinations and authored introductions retained; no overflow at 320, 768, 1024 and 1920px |

The full browser run included **206 axe audits with no reported violations**, plus contrast measurements for actual resting/hover/selected/focus states. Viewport coverage includes 320, 390, 768, 999, 1000, 1024, 1280, 1440, 1600 and 1920px, with a 720-CSS-pixel / 2× pixel-ratio zoom equivalent. Desktop, tablet and mobile renders were inspected, including long titles, many authors, absent portraits, sparse metadata, logo frames and the dense X730 aside.

The final removal of the legacy join-action rules was followed by fresh safe-mode builds at both URLs, a rendered-file comparison (only the homepage HTML changed), renewed preservation/content checks, and reruns of both presentation suites. A final six-width action check at both URLs confirmed identical typography, line height, radius, padding, gap and minimum height for the join and subscription actions, visible focus, no overflow and native no-JavaScript links. That shared-proportions assertion is also retained in `test_presentation.py`. The final homepage reading-canvas adjustment extends the opaque surface into the existing gutters without moving its text or cards. It was rebuilt in safe mode at both URLs and checked for action geometry and overflow, with four additional desktop/mobile homepage axe audits passing. All “After” screenshots were recaptured from the final builds.

The 15 previously known unresolved references remain unchanged, including the missing FreeBSD route and logo-pack download. They are content issues recorded by the existing baseline, not regressions introduced here. No external service submission or independent external-link availability audit is claimed. No authored Markdown, front matter, assets, citations or menu data were edited. The prompt was not added to the repository.
