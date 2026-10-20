# Colour, card and membership finishing pass

The baseline is commit `88b6864`. These are unaltered Chromium screenshots at matching 1440×1000 desktop and 390×844 mobile viewports. Before captures were made before implementation; after captures use the final production safe-mode build. The two additional founding-member mobile captures show the finished treatment further down the directory.

## What changed and why

The washed-out appearance came from pale blue grid/gutter gradients, blue outlines around white logo frames and a pastel membership badge. List view also removed the shared card styling, and badges followed titles of different heights. The newsletter had competing component colour definitions and a gradient surround.

The newsletter now uses one uniform logo-blue surround at 92% opacity, with no gradient or extra artwork layer. Its foreground is opaque navy with white text and the existing red action cue. Hover keeps an opaque, high-contrast surface. The panel has no outline. All writing remains on plain surfaces; the original honeycomb stays in the page background.

List rows and Grid cards share the same subtle neutral border, modest corners, shallow resting shadow and native-link interaction. Related rows use that treatment too. Hover changes the edge, surface and elevation without movement or title underlines. Neutral supporting surfaces replace the pale-blue washes. Logo frames and detail images no longer have extra outlines; category cards no longer have an additional coloured left edge. Metadata panels use grouping and spacing rather than an outer box. The slider keeps its stronger navy-to-logo-blue decorative gradient.

Founding-member badges use solid logo blue with white text, derived from the existing metadata. In Grid view, badges and arrows share a footer anchored to the bottom of each row of cards, including records with longer titles. Wide List rows align badges beside the action. Below 480px, member rows put their footer below the image/title pair so the badge cannot crowd the arrow. Non-founding members receive no badge. The existing 52 member records and 21 founding-member labels are preserved.

Colour and elevation roles remain in the shared theme maps and tokens. No font, framework, dependency, source-content or navigation-data changes were made. See [the updated shared design rules](../../DESIGN_SYSTEM.md).

## Matching screenshots

| View | Desktop before | Desktop after | Mobile before | Mobile after |
| --- | --- | --- | --- | --- |
| Homepage | [Before](before-desktop-home.png) | [After](after-desktop-home.png) | [Before](before-mobile-home.png) | [After](after-mobile-home.png) |
| Slider | [Before](before-desktop-slider.png) | [After](after-desktop-slider.png) | [Before](before-mobile-slider.png) | [After](after-mobile-slider.png) |
| Category navigation | [Before](before-desktop-alliance.png) | [After](after-desktop-alliance.png) | [Before](before-mobile-alliance.png) | [After](after-mobile-alliance.png) |
| Expanded mega-menu | [Before](before-desktop-menu.png) | [After](after-desktop-menu.png) | [Before](before-mobile-menu.png) | [After](after-mobile-menu.png) |
| People grid | [Before](before-desktop-people.png) | [After](after-desktop-people.png) | [Before](before-mobile-people.png) | [After](after-mobile-people.png) |
| Member List view | [Before](before-desktop-members-list.png) | [After](after-desktop-members-list.png) | [Before](before-mobile-members-list.png) | [After](after-mobile-members-list.png) |
| Member Grid view | [Before](before-desktop-members-grid.png) | [After](after-desktop-members-grid.png) | [Before](before-mobile-members-grid.png) | [After](after-mobile-members-grid.png) |
| Member cards | [Before](before-desktop-member-cards.png) | [After](after-desktop-member-cards.png) | [Before](before-mobile-member-cards.png) | [After](after-mobile-member-cards.png) |
| Person detail | [Before](before-desktop-person.png) | [After](after-desktop-person.png) | [Before](before-mobile-person.png) | [After](after-mobile-person.png) |
| CHERIBSD without an aside | [Before](before-desktop-software.png) | [After](after-desktop-software.png) | [Before](before-mobile-software.png) | [After](after-mobile-software.png) |
| X730 with an aside | [Before](before-desktop-hardware.png) | [After](after-desktop-hardware.png) | [Before](before-mobile-hardware.png) | [After](after-mobile-hardware.png) |
| Glossary | [Before](before-desktop-glossary.png) | [After](after-desktop-glossary.png) | [Before](before-mobile-glossary.png) | [After](after-mobile-glossary.png) |
| Presentations and onward links | [Before](before-desktop-presentations.png) | [After](after-desktop-presentations.png) | [Before](before-mobile-presentations.png) | [After](after-mobile-presentations.png) |
| News article | [Before](before-desktop-article.png) | [After](after-desktop-article.png) | [Before](before-mobile-article.png) | [After](after-mobile-article.png) |
| Newsletter and footer | [Before](before-desktop-newsletter.png) | [After](after-desktop-newsletter.png) | [Before](before-mobile-newsletter.png) | [After](after-mobile-newsletter.png) |

Additional finished mobile views: [founding members in List view](after-mobile-founder-list.png) and [founding members in Grid view](after-mobile-founder-grid.png).

## Preservation and checks completed

Both production Jekyll safe-mode builds passed, at `/` and `/preview/`. Both passed `check_content.py` and `check_refinement.py`. There were no new broken references or content errors. The 15 pre-existing unresolved source references remain documented by the content audit; this presentation pass did not alter their authored destinations.

All 784 authored Markdown files, including front matter, remain byte-identical. The before/after comparison across 738 rendered routes found no lost main-content links, anchors, collection/article body text or menu links. The existing checks preserved all collection counts, 46 glossary definitions and 20 linked terms, 266 redirects and 84 talks. The menu retains all 84 links in their original groups and order.

All five browser suites passed on both builds: `test_catalog.py`, `test_layouts.py`, `test_presentation.py`, `test_refinement.py` and `test_consistency.py`. The final runs completed 310 responsive checks and 202 axe audits without reported violations, plus 50 presentation review views. Widths ranged from 320 to 1920px. Checks cover keyboard menus and Unicode indicators, visible focus, no-JavaScript records, search/filter/sort/view persistence, glossary hash/history, image fallbacks, sparse details, metadata asides, article width, mobile overflow, zoom-equivalent layout and reduced-motion settings. These checks supplement visual review rather than establish exhaustive accessibility certification.

The consistency suite now verifies real membership-card geometry, including long titles and records without badges. It checks footer alignment, separation of badges and arrows, aligned wide-row badges, unoutlined logo frames, and resting shadows in both layouts. Newsletter assertions cover its uniform translucent surround, opaque resting and hover surfaces, white heading, missing outline and visible keyboard focus.

Calculated contrast ratios are 14.58:1 for white on the navy newsletter panel, 11.96:1 on its hover surface, 8.01:1 for white on the founding-member blue, 6.38:1 for white on the red action, and 6.05:1 for supporting text on white. Event date/status tests and configured/unconfigured form tests passed. No form submissions were sent.

The gallery contains 60 matching before/after images and two additional finished mobile founding-member views. The newsletter destination was also visually reviewed at desktop and mobile sizes. Shared source changes are limited to templates and styles, with regression checks and design documentation updated alongside them.
