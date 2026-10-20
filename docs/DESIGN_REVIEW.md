# Catalogue design review

This presentation pass starts at `bcdd236` on `design/collections-redesign` and is developed separately on `design/catalogue-polish`.

## Audit and decisions

| Finding | Change |
| --- | --- |
| Honeycomb artwork showed through prose, diagrams, headers and translucent homepage panels. | Opaque reading/component surfaces retain a clear canvas. Original tiles remain visible in the page gutters and the newsletter band's decorative background. |
| Multilink editorial sections used the same `.card` hover treatment as whole-card links. | Editorial sections and multi-link talk rows now use quiet `content-panel` styling. Single-destination cards remain semantic anchor elements with a shared border, shadow, hover and focus language. Entries without a destination remain passive panels. |
| Navigation-card titles and actions had inconsistent emphasis; metadata was very small. | Shared title emphasis and outside focus outlines, larger summaries/metadata, a dedicated list action area, and consistent control radii and target sizes improve scanning. |
| Facts/resources and controls used some of the same raised treatment as navigation cards. | Borders and spacing structure supporting panels; navigation cards carry the purposeful resting/hover depth. |
| Secondary landing headers were oversized relative to their content. | Compact title proportions and padding align them with the rest of the catalogue. The homepage retains its original hero composition. |
| The glossary rendered definition markers as literal colons in ordinary paragraphs. | The same source is rendered as semantic term/definition rows with aligned columns, clear separators and open definitions. |
| Glossary navigation stopped at the letter index. | All 46 terms have individual permalinks. Search matches terms and definitions, ignores accents, reports results and supports reset. Hash navigation clears filters and reveals the target. |
| Tablet term links were crowded beside their permalink controls. | Definitions stack beneath terms below 1000px, and term/permalink targets have comfortable height and separation. |
| A legacy tablet menu override duplicated the header's responsive rules and used unscoped header selectors. | The header/navigation styles now own the shared 1000px breakpoint directly. Unicode indicators and keyboard behaviour remain intact. |

The [shared design rules](DESIGN_SYSTEM.md) describe surfaces, component roles, typography, controls, glossary behaviour and maintenance. No authored Markdown or record data was rewritten to achieve the layouts.

## Validation

Final results and screenshots are recorded after the safe-mode root and `/preview/` builds. The checks cover:

- Byte-for-byte preservation of 921 protected authored Markdown, metadata and non-code asset files against the starting snapshot.
- Original record counts, ordered relationships, routes, meaningful anchors and assets, using the existing migration audit.
- All 46 glossary definitions in their original order, all 20 existing term links, the 16 original alphabet groups and unique new term anchors.
- Accent-insensitive and definition search, multiple-word queries, counts, empty/reset states, filtered deep links and no-JavaScript access.
- Native card links without nested controls, passive panels without misleading hover states, opaque surfaces and reduced-motion styles.
- List/Grid state, filters, sorting, sparse records, keyboard menu operation, visible focus and responsive layout.
- Axe WCAG A/AA checks at desktop/mobile sizes and an additional tablet glossary review.

Final local results:

| Check | Result |
| --- | --- |
| Safe-mode builds | Passed at `/` and `/preview/`, using Jekyll 3.10.0 / GitHub Pages 232. |
| Content preservation | All 921 protected files unchanged. All collection counts and ordered references retained. |
| Routes and anchors | 738 generated HTML files per deployment, including all 732 original routes and 2,974 recorded anchors; no duplicate IDs. |
| Rendered references | No new broken references; the 15 inherited failures remain documented separately. |
| Glossary | All 46 original definitions, their order, 20 term destinations and 16 letter groups retained; new term IDs are unique. Search, reset, filtered hash navigation and no-JavaScript access pass. |
| Accessibility | No axe WCAG A/AA violations in 84 desktop/mobile views plus two tablet glossary audits. |
| Responsive layout | 80 route/width checks pass across 320, 390, 768, 999, 1000, 1280, 1600 and 1920px. |
| Presentation contracts | 42 representative presentation views pass; the full root output also contains 2,210 valid native navigation-card instances, 15 editorial panels, 169 talk rows and eight product panels, with no nested navigation-card controls. |
| Motion and interaction | Reduced-motion card styles and suppressed carousel autoplay pass; manual slide selection, keyboard menus, Unicode state indicators, List/Grid state, filtering and sorting remain usable. |
| Source checks | Python/JavaScript syntax, event date/status boundaries and `git diff --check` pass. |
| Screenshots | 20 before captures and 23 repaired captures per deployment, including tablet and panel examples; 19 representative images are retained in the repository. |

The current workflow runs `scripts/check_content.py`, `scripts/test_catalog.py`, `scripts/test_layouts.py` and `scripts/test_presentation.py` for both deployments. The local environment uses its retained GitHub Pages bundle via `/workspace/cheri-native-bundle.sh`, Chromium and axe-core 4.10.3. No hosted Actions run or deployment is claimed by the local review.

Full before captures are in `reports/polish/before/`; repaired captures and JSON results are in `reports/polish/after/` and `reports/polish/preview/`. The generated reports are excluded from publication and uploaded by CI. Representative images are retained in [the screenshot directory](screenshots/catalogue-polish/README.md).

The inherited 15 broken references listed in [the migration validation](VALIDATION.md#inherited-references) remain distinguished from regressions. This design pass does not invent their missing records or resources.
