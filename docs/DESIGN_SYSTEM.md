# CHERI corporate presentation system

The design combines a confident dark homepage, a white elevated mega-menu and calm inner pages. The visible identity comes from Poppins, navy and logo blue, the continuous honeycomb, a deliberate blue–teal feature surround and clean resting elevation. Decorative outlines, repeated field rules, small uppercase eyebrows and red interface accents are excluded. Native HTML and the existing Jekyll pipeline remain; no framework runtime or new authoring fields are required.

## Ownership and cascade

`settings.scss` owns the palettes, established font assignments, spacing scale and container dimensions. `tokens.scss` defines shared type, radius, surface and elevation roles. `cards.scss` owns navigation surfaces and interaction states; `actions.scss` owns action proportions and states. `detail.scss` owns collection and editorial geometry, while `catalog.scss` owns directory controls and record arrangements. `catalogue-navigation.scss` only arranges menu-derived category choices. It must not redefine card surfaces or catalogue media.

The import order is foundations, base rules, navigation and site components, then detail, catalogue and reference arrangements. The reduced-motion preference is applied after component declarations. Replace an obsolete rule at its source instead of appending another competing override. A variation requires a structural reason, such as square portraits versus rectangular logos or a multi-action panel versus a single destination.

## Palette, typography and spacing

| Role | Colour and purpose |
| --- | --- |
| Logo blue | `#125770`; links, primary light-page actions, selected controls and white-menu group headings |
| Navy | `#152b3b`; primary text and the opaque homepage/closing surfaces |
| White | Reading canvases, menu and card surfaces; inverse text and actions |
| Neutral | `#f3f5f6`; passive supporting information and control fills |
| Supporting text | `#50616d` on white; readable hierarchy without faint text |
| Cyan | `#b9e2f1`; controlled emphasis and accessible links on dark surfaces |
| Teal | Decorative feature gradient only; no collection-specific palettes |

There is no red interface role. Existing image, logo and document-artwork colours remain unchanged, including the red PDF artwork in authored policy content. Errors use explicit language and contrast rather than a red-only signal.

Only the homepage selects the dark palette through its explicit page class. There is no theme toggle, stored theme preference or system-theme switch. Poppins remains on headings, navigation, cards and actions, and throughout the homepage. Inner-page reading copy and form fields retain their existing system font. Code retains its technical font.

| Token | Role |
| --- | --- |
| `--type-display` | Hero opening, responsive 2.5–5rem |
| `--type-page` | Page and record titles, responsive 2–3rem |
| `--type-section` | Section, related-group and newsletter headings, responsive 1.5–1.875rem |
| `--type-title` | Card, menu/footer group and resource headings, 1.125rem |
| `--type-body` | Body text, 1.0625rem; existing mobile reading content uses 1rem |
| `--type-label` | Supporting facts and interface labels, .875rem |

Heading weight is normally 600; body line height is 1.65. Generated headings use sentence case without transforming authored titles or acronyms. Semantic heading levels follow document structure independently of visual size. Use the existing four-pixel spacing scale: 16–20px for navigation padding, 24px for supporting panels, and 32–56px between distinct sections. Cards, actions and panels share a 10px radius; small utility elements use 4px. Titles wrap naturally without arbitrary minimum heights.

## Canvas, decoration and closing composition

The shared container is 1264px including 20px mobile or 32px desktop gutters, giving 1200px of content on wide screens. Header and footer surrounds fill the viewport; their inner text aligns with the main content, hero and slider. Ordinary pages and news use the available width. Collection articles fill their allocated column or the full container when there is no useful aside.

The honeycomb is applied once to the body pseudo-element at its native scale. Its opacity is .30 on light pages and .42 on the homepage. Do not restart the artwork per section. Outer fills may be translucent; text, controls and images must never inherit parent opacity. Every text region meets an opaque plain surface before the artwork or a gradient.

The feature-slider surround uses one 115-degree transition from translucent navy through logo blue to blue-teal. Its 24–32px padding makes that decorative treatment visible. The slide and its controls remain on opaque surfaces. Do not spread gradients over paragraphs, logos or routine cards.

Newsletter and footer form one continuous opaque navy closing region with the same width and padding. The promotion has the top corners and the footer the bottom corners. Both outer surrounds use the same uniform `rgba(16, 60, 80, .86)` tint, allowing the honeycomb to continue through the gutters. There is no newsletter gradient, separate floating footer column, or contrasting box between these regions. On mobile, the heading and subscription action stack naturally.

The hero uses an 80px maximum opening, a subordinate half-size desktop supporting statement and one cyan CHERI conclusion. Mobile scales the supporting statement for readability. All wording and meaningful grouping are preserved. The hero is flat and passive, aligned with the slider, with one subtle bottom divider and no surrounding frame. This single divider is an explicit exception to the borderless presentation rule.

## Elevation, boundaries and interaction

| Level | Use |
| --- | --- |
| 0 | Reading canvas, hero, passive panels and closing composition |
| 1 | Navigation cards, compact linked rows and primary actions |
| 2 | Featured slider and modest hover emphasis |
| 3 | Expanded desktop menu |

Each elevated level combines a short contact shadow and a restrained ambient shadow from the same navy family. Cards have visible resting depth without an outline. Hover changes surface or elevation without movement, scaling or underlining a whole-card title. Keyboard focus uses a separate visible 3px outline. Selection uses fill and weight plus semantic pressed/expanded state. Disabled actions are flat and readable.

Decorative borders are absent from cards, portraits, logo frames, page headers, asides, citations, promotional panels and glossary entries. The remaining borders serve a function: input definition, comparison-table structure, the requested hero divider and keyboard/target focus. Authored horizontal rules remain semantic breaks with spacing, without conspicuous visible lines. Do not restore card outlines on hover.

## Navigation cards and media

`card.html` is the record component and `listing.html` arranges its single set of records into List or Grid. A single destination is one native link with a title, optional image and decorative arrow. A multi-destination block is a passive panel with explicit independent actions. Never nest links, stretch an invisible link over other controls or invent JavaScript-only destinations.

Metadata is explicit through the include parameter `metadata=true`. Event dates/status, news dates, paper publication context and policy version/date can help directory browsing. Related records, Where next and category options use minimal navigation by default. They do not acquire metadata merely because a source record contains it. Search still includes summaries and facts. Meaningful authored resource annotations remain with their records; unlinked product panels retain their descriptions and independent links. Generated excerpts are not repeated beneath cards.

All linked records use a common footer for the arrow and any permitted informational label. Grid footers align at the bottom; compact rows place the arrow consistently to the right. Founder labels derive only from existing membership metadata and have no emblem, fill, outline, shadow or independent interaction. Wide membership lists use a stable footer position; narrow lists give the label a separate row to avoid collisions. The protected member/founder counts are 52 and 21.

Portraits are square: 56px in ordinary rows, 88px in desktop grids and 72px in mobile grids. Portrait grids use compact horizontal identity cards rather than landscape poster slots. Logos are contained in white rectangular areas: 112×56px in wide rows, up to 240×104px in grids, and 260×130px on desktop details. The frame has no decorative outline. Detail portraits are 160px desktop and 80px mobile. Editorial/conference media use landscape frames and preserve text-bearing artwork through containment. Existing source fit/crop information is respected.

Image-bearing directories retain neutral placeholders for absent or failed media. Placeholders are decorative beside the title, not invented identities. Text-only navigation and sparse detail headers do not reserve absent media space. Source assets, alternative text and relationships stay intact.

## Actions and promotional components

`action.html` supplies native navigation/download anchors with shared URL and baseurl handling. `resource-action.html` delegates to it. Operations remain buttons. Actions share Poppins at .9375rem/1.4, weight 500, 48px minimum height, 10px radius, 12px icon spacing and an 18px icon. Primary actions are filled and shallowly elevated; secondary actions use a quiet opaque neutral fill without an outline. On inverse surfaces, primary actions are white with logo-blue text.

Resource actions fit their labels instead of becoming unrelated full-width bars. Long labels wrap. The source primary resource remains prominent. Prose links remain recognisable as links.

`promotional-panel.html` is passive with a standard section heading and one real primary subscription link. `subscribe.html` and the legacy newsletter include share it. The wording remains “Stay connected with CHERI” and “Get the newsletter”, with any existing supporting sentence preserved. There is no whole-banner link or simulated second button.

## Collection arrangements

All collection details share `page-header.html`, `facts.html`, `detail-arrangement.html` and `detail.html`. There is no collection-name eyebrow when breadcrumbs already supply context. Explicit archived-version notices remain. Facts are semantic definition lists; resources retain their destinations and labels. The aside is one borderless neutral region grouped by spacing, not a stack of separate cards.

Aside selection uses existing information roles, not a generic field-count threshold. No presentation flags belong in source records. Sparse identity facts stay near the title. Supporting information occupies a 280–300px desktop region only when it assists use of the record. The main article fills its allocated column; no-aside details fill the shared width. At mobile widths, supporting information precedes the body. The entire article never receives an unconditional 73ch limit.

| Family | Existing information and arrangement |
| --- | --- |
| People | Name, introduction, square portrait and short identity facts near the title. An aside is justified by substantive publication/documentation/download resources alongside other links. Name-only records remain sparse. Talks and publications use the shared relationship components. |
| Organisations | Rectangular contained logo; membership facts and resources form a supporting group when both exist. Activities, products and people stay in the body/relationships. |
| Events | Date/location records use an aside for timing, venue, format and resources. Status remains date-derived; cancellation/postponement remain separate. Programmes, speakers and timetables stay intact. |
| Papers | Ordered authors and original citation stay in the main column. Publication facts and actual resources use the aside. Long author lists wrap without truncation. |
| Reports | The publication arrangement applies when document facts and links exist; sparse records remain compact. Original attribution and authoritative document destinations stay intact. |
| Hardware | Architecture, version, product type, certification or technical resources justify the technical aside. Product and certification-programme versions remain distinct. |
| Software | Platform, architecture, version or documentation/repository/download information justifies the technical aside. CHERIBSD has sparse inline information and uses the full width. |
| Working groups | Collaboration information and participation resources can form an aside. Purpose and substantial descriptions remain authored body content. |
| Guides | Existing prerequisites or substantive technical resources justify supporting information; instructions, code and diagrams remain the main content. |
| Policies | Version, document date and official format justify a formal supporting region. The original PDF-precedence notice remains in the body, and the official document uses the shared action. Archived versions retain status and routes. |

`facts.html` and the catalogue schema remain the complete fact source; choosing an arrangement does not suppress facts. Missing values are omitted without empty panels. Related content always follows the same minimal navigation rules, so a related policy does not display an unnecessary version/date line.

## Editorial, category and reference families

News and ordinary pages have a compact title area, optional existing introduction and concise news byline. They use the full available reading canvas without compulsory asides or raised article wrappers. Navigation and resources around the article share the card system. Comparison tables, timetables, code and editorial images retain responsive handling.

Category and subcategory indices use the existing menu groups as compact card choices. Additional authored destinations remain available once each. Remove generated duplication, never meaningful explanations or independent links. Kramdown sometimes turns pipe-separated navigation into a one-row table, including the 404 page. The content enhancement converts only two-to-four-cell, headerless, link-only rows without non-link IDs into shared navigation choices, retaining labels, destinations and punctuation. Real data tables retain their markup and responsive scrolling; without JavaScript the original native links remain available.

The glossary remains an open semantic reference list. Strong term typography, plain letter headings and spacing replace repeated rules and boxed letters. The compact alphabet index, definition-aware search, reset and result count remain. Direct links reveal a term despite an active filter. All 46 definitions, 20 linked terms, examples, groups and anchors remain available without JavaScript.

## Menu, forms and progressive enhancement

The desktop mega-menu is an elevated white panel with logo-blue group headings and navy options. Hover uses a restrained neutral fill; the selected root trigger has a compact blue treatment rather than a full-height slab. The same white panel appears over the dark homepage. Footer group headings use the same type role in white on navy.

All 84 menu links, labels, groups, destinations and ordering come from the unchanged navigation data. Click/tap opens a disclosure and another activation closes it. Hover never changes disclosure state. Opening a peer closes the previous panel. Escape closes the appropriate level and restores focus; outside clicks dismiss navigation. The decorative Unicode triangles remain synchronised. Short desktop viewports get a scrollable panel within the viewport; mobile retains orderly disclosures and comfortable hit targets. Without JavaScript all destinations remain visible.

List/Grid controls retain one record DOM, search, filters, sorting, result counts and persistence. Glossary and slider behaviour remain progressive and respect reduced motion. Navigation initializes immediately after its preloaded header script, with a short pending state that prevents the large fallback menu flashing during parsing. Script failure clears that state immediately, and a four-second timeout provides a second recovery path. With JavaScript disabled, no pending state is set and the native links stay visible. Catalogue enhancement runs beside its directory, selects the requested or saved view before records paint, and reserves toolbar space while enhancement completes; Poppins heading and navigation weights are preloaded from the existing local assets. These placement changes reduce initial layout shifts without hiding unenhanced content.

Contact/newsletter forms still submit natively when front matter supplies an action. Without one, the published-service fallback remains honest and usable. Presentation tests must not send real messages or invent endpoints.

## Verification and references

Run safe-mode root and `/preview` builds, content/refinement validation, event and form Ruby tests, and the existing catalogue/layout/presentation/refinement/consistency browser suites. `test_corporate.py` adds six-width coverage across page families, computed border/no-red contracts, click/keyboard menu regression checks, short-viewport navigation, no-JavaScript use and accessibility checks. CI runs that suite in Chromium, Firefox and WebKit at both deployment paths. Do not replace preservation or behavioural assertions merely to pass a new visual treatment.

The design draws on [Material elevation](https://material-web.dev/components/elevation/) and [Bootstrap typography](https://getbootstrap.com/docs/5.3/content/typography/) without adopting their runtime dependencies. See the [corporate design review and screenshot gallery](screenshots/corporate-system/README.md) for causes, matching comparisons, exact checks and limitations. Earlier galleries document historical states rather than current component contracts.
