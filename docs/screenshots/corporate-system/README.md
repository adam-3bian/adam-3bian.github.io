# Corporate design review

The comparison baseline is commit `d9667db997be575b362e3fd221cb075ff19de2bd` on `design/catalogue-polish`. Both GitHub workflows reported that exact commit deployed successfully before this work. Baseline PNGs are retained captures of that build from the preceding Material-system review. The after images are actual local safe-mode renders, using the same 1440×1000 desktop and 390×844 mobile viewports, routes and interaction states. Fonts and images are loaded before capture, and reduced motion is enabled.

## Critique and implemented direction

The previous implementation still drew boundaries around too many unrelated elements. Card outlines, header rules, metadata dividers and citation stripes competed with the content. Those decorative boundaries are removed at their component definitions. Input borders, meaningful table structure, focus indicators and the requested single hero divider remain for their specific purposes.

The blue menu slab and full-height selected tab competed with the page. A white elevated menu now carries blue group headings, navy options and a compact selected trigger. Hover previously opened a panel that the following click immediately closed. It now supplies visual feedback only; click, tap and keyboard share one disclosure model. The navigation data is unchanged.

The hierarchy depended on repeated boxes and pastel accents. The new system uses stronger Poppins headings, a clearer hero progression, white or navy reading surfaces and a visible blue–teal feature surround. Red is removed from interface roles while authored artwork keeps its original colours. Shadows are softer and cleaner, with no outline added as a second boundary.

Record arrangements depended on a generic count of facts rather than their usefulness. The shared arrangement include now considers the information role of each collection. Papers have a bibliographic supporting region, useful membership information has a coherent home, sparse People records remain simple, and CHERIBSD retains the available width. No record styling flags were introduced and facts are not suppressed by the arrangement choice.

The newsletter and footer were visually separate dark rectangles with inconsistent surrounding colour. They now share a continuous navy surface, aligned padding, white headings and the standard white primary action. A single uniform translucent surround lets the original honeycomb continue through the closing region. The hero remains flat and passive, while the slider and navigation supply the material depth.

The resulting direction is a borderless corporate catalogue with a confident dark homepage, a compact white menu and calm inner pages. The shared rules are documented in [DESIGN_SYSTEM.md](../../DESIGN_SYSTEM.md).

## Matched comparisons

Each pair uses the same viewport size. Some content moves vertically because the spacing and title wrapping have changed; the comparison is anchored to the same component or route.

| View | Desktop before | Desktop after | Mobile before | Mobile after |
| --- | --- | --- | --- | --- |
| Homepage | [Before](before-desktop-home.png) | [After](after-desktop-home.png) | [Before](before-mobile-home.png) | [After](after-mobile-home.png) |
| Feature slider | [Before](before-desktop-slider.png) | [After](after-desktop-slider.png) | [Before](before-mobile-slider.png) | [After](after-mobile-slider.png) |
| Expanded mega-menu | [Before](before-desktop-menu.png) | [After](after-desktop-menu.png) | [Before](before-mobile-menu.png) | [After](after-mobile-menu.png) |
| Members, List | [Before](before-desktop-members-list.png) | [After](after-desktop-members-list.png) | [Before](before-mobile-members-list.png) | [After](after-mobile-members-list.png) |
| Members, Grid | [Before](before-desktop-members-grid.png) | [After](after-desktop-members-grid.png) | [Before](before-mobile-members-grid.png) | [After](after-mobile-members-grid.png) |
| Founding-member alignment | [Before](before-desktop-member-cards.png) | [After](after-desktop-member-cards.png) | [Before](before-mobile-member-cards.png) | [After](after-mobile-member-cards.png) |
| People directory | [Before](before-desktop-people.png) | [After](after-desktop-people.png) | [Before](before-mobile-people.png) | [After](after-mobile-people.png) |
| Person detail | [Before](before-desktop-person.png) | [After](after-desktop-person.png) | [Before](before-mobile-person.png) | [After](after-mobile-person.png) |
| Organisation detail | [Before](before-desktop-company.png) | [After](after-desktop-company.png) | [Before](before-mobile-company.png) | [After](after-mobile-company.png) |
| Publication detail | [Before](before-desktop-paper.png) | [After](after-desktop-paper.png) | [Before](before-mobile-paper.png) | [After](after-mobile-paper.png) |
| CHERIBSD, without an aside | [Before](before-desktop-software.png) | [After](after-desktop-software.png) | [Before](before-mobile-software.png) | [After](after-mobile-software.png) |
| X730, with a technical aside | [Before](before-desktop-hardware.png) | [After](after-desktop-hardware.png) | [Before](before-mobile-hardware.png) | [After](after-mobile-hardware.png) |
| Policy and official resource | [Before](before-desktop-policy.png) | [After](after-desktop-policy.png) | [Before](before-mobile-policy.png) | [After](after-mobile-policy.png) |
| Policy related navigation | [Before](before-desktop-policy-related.png) | [After](after-desktop-policy-related.png) | [Before](before-mobile-policy-related.png) | [After](after-mobile-policy-related.png) |
| Glossary | [Before](before-desktop-glossary.png) | [After](after-desktop-glossary.png) | [Before](before-mobile-glossary.png) | [After](after-mobile-glossary.png) |
| Category index | [Before](before-desktop-alliance.png) | [After](after-desktop-alliance.png) | [Before](before-mobile-alliance.png) | [After](after-mobile-alliance.png) |
| News and events index | [Before](before-desktop-subcategory.png) | [After](after-desktop-subcategory.png) | [Before](before-mobile-subcategory.png) | [After](after-mobile-subcategory.png) |
| Supporting resource navigation | [Before](before-desktop-presentations.png) | [After](after-desktop-presentations.png) | [Before](before-mobile-presentations.png) | [After](after-mobile-presentations.png) |
| News article | [Before](before-desktop-article.png) | [After](after-desktop-article.png) | [Before](before-mobile-article.png) | [After](after-mobile-article.png) |
| Newsletter and closing region | [Before](before-desktop-newsletter.png) | [After](after-desktop-newsletter.png) | [Before](before-mobile-newsletter.png) | [After](after-mobile-newsletter.png) |
| Footer | [Before](before-desktop-footer.png) | [After](after-desktop-footer.png) | [Before](before-mobile-footer.png) | [After](after-mobile-footer.png) |


Additional final views show [desktop founding members](final-desktop-founders.png), [mobile founding members](final-mobile-founders.png), the [desktop 404 page](final-desktop-404.png) and the [mobile 404 page](final-mobile-404.png). These are supplementary views rather than matched baseline pairs.

## Preservation and verification

Both production safe-mode builds completed, at the root and `/preview`. The content and refinement validators passed on both. The comparison protected 881 source/data/media files, including 785 Markdown files, and compared the rendered information on all 472 content routes. No protected file changes, missing rendered words, removed destinations, missing assets or lost anchors were found. Navigation labels/order/destinations and page titles/canonical/social metadata matched the baseline. All 738 generated routes remain, including 266 redirects, and the structural scan found one main heading per content page and no duplicate IDs.

The member/founder counts remain 52/21, menu destinations 84, glossary terms 46, original linked terms 20 and talks 84. Collection counts and the full inherited-reference list are in [verification.json](verification.json). Fifteen pre-existing broken references remain; there are no newly broken references. They include missing historical technology/person/software routes and the absent logo-pack ZIP. Their factual content and destinations were deliberately left unchanged.

The event-boundary and configured-form Ruby checks passed. No real form messages were submitted. The existing catalogue, layout, presentation, refinement and consistency suites passed in local Chromium, including contrast/accessibility scans, search/filter/sort persistence, record counts, gallery media, source annotations, glossary links, native actions, reduced motion, plain text surfaces and footer/menu presentation. The new corporate suite passed 126 route/viewport checks at each deployment path, covering all collection families, editorial pages, categories, contact and 404. It also exercised click/keyboard disclosure, emulated taps, short screens, 200% text, no-JavaScript links and recovery from a failed menu script. The existing zoom-equivalent check uses a 720-CSS-pixel viewport at twice the pixel ratio. These are browser emulations, not real-device testing.

The final [local loading samples](loading-samples.json) recorded zero observed layout shifts for the homepage, members Grid and a news article at 390px and 1440px. This is a short local cold-context observation, not a field Core Web Vitals score or a claim about every connection and device. Menu initialization, preferred-view selection, toolbar-space reservation and preloading of existing font assets address the observed loading jumps without changing the content.

The GitHub validation workflow runs the new corporate suite in Chromium, Firefox and WebKit at both paths, alongside the existing suites. Local Firefox/WebKit downloads were blocked by this environment's network policy, so their verification belongs to the remote workflow. See the [branch workflow history](https://github.com/adam-3bian/adam-3bian.github.io/actions/workflows/pages.yml?query=branch%3Adesign%2Fcatalogue-polish) for the exact commit's outcome and downloadable review evidence. Direct access to the published `github.io` site is also blocked in this environment; local rendered review and exact-commit deployment verification must be distinguished from a live visual smoke test.

The implementation preserved the deliberate suppression of generated duplicate excerpts and redundant collection eyebrows. It retained authored explanations, legal PDF notices, complete citations, independent resource annotations and all useful detail facts. The prompt itself is not stored in this repository.
