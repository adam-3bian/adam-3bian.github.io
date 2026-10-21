# Hero and interaction review

All work is on `design/catalogue-polish`. This review changes templates, generated interface labels and styling. No Markdown records, authored prose, role values, names, artwork or relationships are edited.

Every hero now comes from `_includes/page-header.html`, with shared geometry in `_sass/_hero.scss`. Ordinary heroes vertically centre the heading group, use one title scale and padding system, and expand for long titles instead of clipping them. Their height follows the content rather than a minimum frame height, avoiding excess space above and below shorter headings and logos. People summaries are omitted from the hero while their source fields and biographies remain intact. Portraits stay beside names on mobile; wider media stack. The homepage keeps its existing display hierarchy through the same template.

Product hero frames follow each image's natural proportions so photographs such as Morello fill their rounded frame without added white strips or cropping. Organisation logos retain their white backing and 3:1 containment.

Cards, text links, directory view controls, glossary controls, programme tabs and slider links give consistent pointer and keyboard feedback. Focus rings remain visible. All standard buttons invert their colours on hover/focus; plain links on light surfaces turn red. Dark-surface links keep their light hover colour. Matching navigation palettes and footer hover behaviour remain intact. Generated labels such as Governance Role, Focus Areas, Publication Type and Sort By are capitalised in their design sources; Markdown values keep their original case.

## Visual comparisons

| View | Before | After |
| --- | --- | --- |
| Person, desktop | [Before](screenshots/hero-consistency/before-person-1440.png) | [After](screenshots/hero-consistency/after-person-1440.png) |
| Person, mobile | [Before](screenshots/hero-consistency/before-person-390.png) | [After](screenshots/hero-consistency/after-person-390.png) |
| Member, desktop | [Before](screenshots/hero-consistency/before-member-1440.png) | [After](screenshots/hero-consistency/after-member-1440.png) |
| Member, mobile | [Before](screenshots/hero-consistency/before-member-390.png) | [After](screenshots/hero-consistency/after-member-390.png) |

Additional examples: [compact Cantech hero](screenshots/hero-consistency/after-cantech-1440.png), [Morello desktop](screenshots/hero-consistency/after-morello-1440.png), and [Morello mobile](screenshots/hero-consistency/after-morello-390.png).

## Repeatable checks

Run the safe-mode Jekyll build and existing content/link/component checks. `scripts/test_heroes.py` adds 96 responsive views across 16 representative pages at 320–1920px, six views with 200% text sizing, 32 accessibility audits, and 15 comparisons between hover and keyboard-focus states. Product frames must match the image proportions without added padding; buttons must invert, light-surface text links must turn red, and dark-surface links must stay readable. Configure `SITE_URL`, `REPORT_ROOT`, `PLAYWRIGHT_BROWSERS_PATH` and `AXE_PATH` as for the other browser suites. Run it at the root URL and a prefixed deployment URL.

The full-site geometry review also checks all 472 rendered inner-page heroes at desktop and mobile widths for centred heading groups, valid title/image bounds and no horizontal overflow. The existing component suite covers another 176 responsive views.

Rendered-content comparison permits only removal of duplicated people hero summaries and explicit capitalisation changes to generated fact/search/sort labels. Routes, links, images, anchors and all remaining text must match the previous build.
