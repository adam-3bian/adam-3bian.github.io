# Colour and component refinement

Before captures use `e59f864`; after captures show this visual refinement. These are unaltered local Chromium renders: desktop 1440×1000, mobile 390×844 and tablet 768×1000. Authored content, section order and the shared content widths are preserved.

## Design decisions

The review identified five issues: the hero gave its statements similar emphasis; selected controls were too faint; theme and catalogue colours competed; interactive cards and passive panels lacked sufficient distinction; and talk metadata/actions used a separate miniature type scale.

The hero now has a stronger opening, smaller supporting statement and cyan CHERI sign-off, with a border related to the slider. Teal identifies controls and links; selected views are filled and bold; secondary facts use quiet opaque surfaces. Red is limited to the compact existing join action and newsletter action cue. The final visual review reduced the join treatment from a large filled card to a compact link button. Body quotes use the normal accent colour.

CHERI talks use a shared component on people and event pages. Multiple-destination records remain passive panels with an event link and clearly labelled resource actions; a single-destination record is one native clickable card. Dates and titles follow the catalogue type scale. Actions align on the right on desktop and wrap underneath on mobile, with 44px targets. All 84 talk titles, dates, event references, locations, resource labels and destinations are verified against the canonical registry.

The glossary retains open definitions and its existing search/index/anchor behaviour, with clearer term typography, letter markers and target highlighting. Navigation triangles, homepage-only dark styling, honeycomb artwork, logo/portrait frames, full-width header/footer surfaces and full-width detail articles remain intact.

See [shared component and colour rules](../../DESIGN_SYSTEM.md).

## Desktop and mobile

| View | Desktop before | Desktop after | Mobile before | Mobile after |
| --- | --- | --- | --- | --- |
| Homepage hero | [Before](before-desktop-home.png) | [After](after-desktop-home.png) | [Before](before-mobile-home.png) | [After](after-mobile-home.png) |
| Homepage slider | [Before](before-desktop-slider.png) | [After](after-desktop-slider.png) | [Before](before-mobile-slider.png) | [After](after-mobile-slider.png) |
| Homepage panels | [Before](before-desktop-panels.png) | [After](after-desktop-panels.png) | [Before](before-mobile-panels.png) | [After](after-mobile-panels.png) |
| Join action and news | [Before](before-desktop-join.png) | [After](after-desktop-join.png) | [Before](before-mobile-join.png) | [After](after-mobile-join.png) |
| News and events | [Before](before-desktop-hub.png) | [After](after-desktop-hub.png) | [Before](before-mobile-hub.png) | [After](after-mobile-hub.png) |
| Members: List | [Before](before-desktop-members.png) | [After](after-desktop-members.png) | [Before](before-mobile-members.png) | [After](after-mobile-members.png) |
| Members: Grid | [Before](before-desktop-members-grid.png) | [After](after-desktop-members-grid.png) | [Before](before-mobile-members-grid.png) | [After](after-mobile-members-grid.png) |
| Mike Eftimakis | [Before](before-desktop-person.png) | [After](after-desktop-person.png) | [Before](before-mobile-person.png) | [After](after-mobile-person.png) |
| CHERI talks | [Before](before-desktop-talks.png) | [After](after-desktop-talks.png) | [Before](before-mobile-talks.png) | [After](after-mobile-talks.png) |
| Axiomise | [Before](before-desktop-company.png) | [After](after-desktop-company.png) | [Before](before-mobile-company.png) | [After](after-mobile-company.png) |
| CheriBSD | [Before](before-desktop-software.png) | [After](after-desktop-software.png) | [Before](before-mobile-software.png) | [After](after-mobile-software.png) |
| X730 and facts aside | [Before](before-desktop-hardware.png) | [After](after-desktop-hardware.png) | [Before](before-mobile-hardware.png) | [After](after-mobile-hardware.png) |
| Glossary | [Before](before-desktop-glossary.png) | [After](after-desktop-glossary.png) | [Before](before-mobile-glossary.png) | [After](after-mobile-glossary.png) |
| News article | [Before](before-desktop-article.png) | [After](after-desktop-article.png) | [Before](before-mobile-article.png) | [After](after-mobile-article.png) |

## Tablet

| View | Before | After |
| --- | --- | --- |
| Homepage hero | [Before](before-tablet-home.png) | [After](after-tablet-home.png) |
| Homepage slider | [Before](before-tablet-slider.png) | [After](after-tablet-slider.png) |
| Homepage panels | [Before](before-tablet-panels.png) | [After](after-tablet-panels.png) |
| Join action and news | [Before](before-tablet-join.png) | [After](after-tablet-join.png) |
| Members: Grid | [Before](before-tablet-members-grid.png) | [After](after-tablet-members-grid.png) |
| Mike Eftimakis | [Before](before-tablet-person.png) | [After](after-tablet-person.png) |
| CHERI talks | [Before](before-tablet-talks.png) | [After](after-tablet-talks.png) |
| Glossary | [Before](before-tablet-glossary.png) | [After](after-tablet-glossary.png) |

## Preservation and validation

A source hash comparison verifies 1,256 unchanged authored/data/asset files. Comparing all 472 rendered content pages against the starting branch found identical text, link destinations, anchors and image paths. The remaining 266 pages are redirects covered by the independent preservation fixture. Both outputs retain 738 HTML pages and add no broken references.

Safe-mode Jekyll builds passed at `/` and `/preview/`. `check_content.py`, `check_refinement.py` and the event-boundary checks passed. Browser suites `test_catalog.py`, `test_layouts.py`, `test_presentation.py` and `test_refinement.py` passed on both deployment paths: 200 responsive layout checks and 158 axe audits, plus glossary, filter/sort/view persistence, keyboard menu, reduced-motion slider and no-JavaScript checks. The talk preservation check covers all 84 canonical talks.

After the final compact-action and quote-keyline adjustments, both safe-mode builds and preservation checks passed again. A targeted review of the homepage and Axiomise at five widths on both deployment paths added 20 responsive checks and 20 axe audits, with no violations. It verified the compact action size, keyboard focus, preserved hero wording and slider operation. The screenshots show this final build.

Actual text/background checks cover hero text, primary actions, selected/unselected view controls, hover states and talk resources. Measured ratios range from 5.51:1 for quiet control labels to 12.89:1 for hovered control text; white on brand red is 6.38:1.
