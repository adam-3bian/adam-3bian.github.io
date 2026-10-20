# CHERI presentation system

The site uses Material principles of surfaces, hierarchy and elevation within the CHERI identity. It keeps native HTML, the existing Poppins font files and the Jekyll pipeline. There is no framework runtime, theme switch, new authoring field or collection-specific palette. Authored Markdown and front matter remain the source of truth; presentation decisions belong in shared includes and Sass.

## Foundations

`settings.scss` owns the brand and page palettes, four-pixel spacing scale and layout dimensions. `tokens.scss` supplies purpose-based type, surface, radius and elevation roles. `cards.scss` owns the common navigation surface, `actions.scss` the action system, and `catalog.scss` record/directory geometry. Later files must not redefine these foundations. The stylesheet imports settings, themes and tokens first; components then consume those roles.

| Role | Application |
| --- | --- |
| Logo blue `#125770` | Light-page links, primary actions, selected controls and the mega-menu |
| Navy `#152b3b` | Light-page headings, homepage hero and inverse promotional surface |
| White | Inner-page reading canvas and cards; text on inverse surfaces |
| Neutral `#f3f5f6` | Toolbar, passive information and detail aside |
| Cyan `#b9e2f1` | Accessible homepage links and selected controls; not a separate menu/footer heading colour |
| Red `#ba1e1e` | Existing membership/join action, rather than every primary action |

Only the homepage has the dark page palette. News, ordinary pages and collection details stay light regardless of OS preference or stored values. Poppins remains on headings, navigation, cards and actions, and throughout the homepage. The existing system font remains on inner-page body copy, inputs and supporting facts. Code keeps its technical font.

| Type token | Role |
| --- | --- |
| `--type-display` | Hero opening, responsive 2.5–4.5rem |
| `--type-page` | Page and record titles, responsive 2–3rem |
| `--type-section` | Sections, related groups, feature title and promotional heading, responsive 1.375–1.75rem |
| `--type-title` | Card, menu/footer group, category group and resource headings, 1.125rem |
| `--type-body` | Reading text, 1.0625rem; established mobile prose uses 1rem |
| `--type-label` | Supporting metadata and interface labels, .875rem |

Heading weight is normally 600, with a 1.3 line height; reading text uses 1.65. Use sentence case for generated interface headings without changing authored titles, acronyms or organisation names. Heading level follows document structure, independently of font size. The default language has no small uppercase eyebrows or tracked-out category labels.

Use the existing 4px-based spacing tokens. Cards and dense rows use 16–20px padding, feature surfaces use 24–32px, and distinct sections use 32–56px according to viewport and role. Do not introduce arbitrary minimum heights to equalise content. Cards and controls share an 8px radius; small media and utility elements may use 4px.

## Canvas and decorative surrounds

The common container is 1264px including 20px mobile or 32px desktop gutters, yielding 1200px of content on wide screens. Header and footer surrounds fill the viewport. Their inner regions align with the same container. Ordinary pages and news fill the available content width. Collection articles fill either the whole container or the column allocated beside a useful aside.

The original hexagon artwork is applied once, to the body pseudo-element at its native scale. Do not restart it in sections. The light artwork layer uses .34 opacity and the homepage layer .48. Section fills are translucent background colours, never opacity on a parent containing text. Mobile retains patterned space between the hero, slider, content, newsletter and footer without shrinking reading columns.

All text sits on an opaque plain surface. Most pages use the main white canvas. Home uses discrete opaque hero, article, panel and card surfaces, allowing the artwork to appear in the gaps. Footer columns share one opaque footer surface, rather than separate boxes. Preserve these inner reading surfaces when adding decorative backgrounds.

The slider surround uses the shared 115-degree navy-to-logo-blue gradient with translucent stops. The surround has 24px vertical padding on mobile and 32px on desktop, making the gradient visible at ordinary viewing size. Slides remain opaque; controls sit on a small plain inverse surface. The gradient is not on the paragraph, the image or every card.

The newsletter surround is a **uniform** logo-blue fill at .74 opacity, with no gradient or extra pattern layer. Its text and action share an opaque navy panel. The footer surround uses a uniform dark tint at .82 opacity, with its text on one opaque inner region. Do not stack translucent layers that suppress the hexagons.

## Elevation and states

| Token | Resting role |
| --- | --- |
| `--elevation-0` | Reading canvases, passive information, hero, promotional panel |
| `--elevation-1` | Navigation cards, compact clickable rows and primary actions |
| `--elevation-2` | Featured slider and hover emphasis for cards/primary actions |
| `--elevation-3` | Expanded mega-menu, with a broad ambient shadow |

Shadows combine a short contact shadow with a softer navy-tinted ambient shadow. They are visible at rest on navigation components. A subtle neutral edge complements them; do not add a strong outline and accent stripe as additional boundaries. Authored horizontal rules retain their structural breaks with the common quiet divider treatment.

Hover changes surface, edge or depth without movement, enlargement or underlined whole-card titles. Focus adds a separate 3px visible outline. Selection uses fill and stronger text weight as well as colour. Disabled buttons have a plain neutral surface and no elevation. Reduced motion disables component transitions; slider behaviour continues to honour the existing preference handling.

## Navigation cards and passive panels

`card.html` is the record component; `listing.html` arranges it as compact rows or a grid. Directory List/Grid controls operate on the same DOM records. `navigation-option.html` uses the same navigation surface for category options; its compact interface-label proportions suit grouped navigation.

A single-destination card is one native link with an optional image, title and decorative arrow. It has no inner button, stretched overlay or script-only click handler. A block with several independent destinations is a passive `content-panel`, with explicit links and no pointer cursor or whole-panel hover response. Unlinked product records keep their factual descriptions and authored links instead of acquiring invented destinations.

Metadata is **opt-in** via the include parameter `metadata=true`, not inferred solely from the collection. `directory.html` opts in for chronological news/events, paper year/venue and policy version/date. Featured news and events also opt in. The normal card default is minimal. “Where next”, “Related pages”, relationships, category options and general supporting links do not acquire record metadata just because a canonical record has it. Resource types likewise require an explicit browsing context. Summaries and facts remain in search data and on details.

Do not render descriptions below navigation cards. Keep meaningful authored annotations with independent links, such as product resources, in the same item so filtering preserves their relationship. Citations and talk details remain intact.

Compact rows have the same solid surface and resting shadow as grid cards. Long titles wrap. Grid images and footer placement align through flex/grid layout; rows grow when necessary. A card footer exists where the structure includes an informational label. Its layout is selected structurally with `:has(.catalog-footer)`, rather than inventing a new colour or surface for organisations.

Founding membership is derived only from `membership_status`. In directories, the label uses Poppins with a small solid hexagonal marker and brand-blue text. It has no background, border, shadow or independent hover state and cannot be mistaken for a second button. Grid footers align at the bottom, including cards without badges. Wide list footers align in a stable right-hand column; narrow lists place the footer below image/title. Supporting navigation omits the badge along with other nonessential metadata. The registry still contains 52 current members and 21 founding members.

CHERI talks use the same semantic split. A talk with one distinct destination is a navigation card. Multiple destinations remain separate resource actions in a passive panel; no-destination talks remain passive records. Dates, titles, event/location wording, labels and registry order are preserved. This is a structural exception to title-only supporting navigation because talks have independently useful bibliographic/resource information.

## Actions and promotional panels

`action.html` renders native link actions and preserves URL/baseurl handling, target and rel attributes. `resource-action.html` delegates to it; the source `primary` value selects the primary role. Form submissions and view operations remain native buttons. Both semantics use the same action CSS.

Actions use Poppins at .9375rem/1.4, weight 500, a 48px minimum height, 8px corners, 12px icon spacing and an 18px icon. Primary actions are filled with resting elevation. Secondary actions have a quiet edge and plain surface. Resource actions fit their label and icon rather than becoming custom full-width bars. Long labels wrap within their container. Inverse surfaces map the primary action to white with logo-blue text, with the same dimensions, focus and states.

`promotional-panel.html` is passive, with a section-role heading and one explicit primary action. Both `subscribe.html` and the legacy `newsletter-cta.html` delegate to it. The latter retains its existing supporting sentence when used. The whole panel is never an anchor; only the real “Get the newsletter” link navigates. The panel has no hover response or unnecessary elevation. Desktop places copy and action in a compact horizontal row; mobile stacks them without stretching the action needlessly.

The hero uses the same navy surface and type/spacing roles. Its opening is the shared display heading; the support and concluding statement are .68 of that size, with the concluding statement differentiated by weight. All wording, meaningful grouping and explanatory paragraphs remain unchanged. It has a single subtle bottom border, no side/top frame, shadow or hover behaviour. Its text edge aligns with the slider surface and shared content container. The surrounding gradient belongs to the slider frame, outside the hero's opaque reading surface.

## Detail and editorial families

Collection details share `page-header.html` and `detail.html`, including People, Organisations, Papers, Events, Hardware, Software, Working Groups, Guides, Reports and Policies. The header no longer repeats the collection label supplied by the breadcrumb. A retained version still displays its explicit “Archived version” status.

One or two short facts remain in an inline semantic definition list. More than two facts, a long fact/array or more than three resource actions use the shared right-hand aside. The aside is **one neutral supporting surface**, with facts and resources grouped by spacing and a quiet divider. The resources nav is not another floating box. No generic “At a glance” heading is added. Primary policy downloads use the shared action; the authored notice explaining that the PDF takes precedence is untouched.

Without an aside, the article fills the shared content width. With an aside it fills the allocated article column. Never impose an unconditional 73ch maximum or reserve an empty metadata column. At mobile sizes, the aside appears above the article. CHERIBSD remains a full-width example with sparse inline facts; X730 demonstrates the useful technical aside. Tables, code, timetables, diagrams and editorial images retain responsive handling.

News and ordinary pages remain the simpler editorial family: full available width, a compact header and concise news byline. The article itself is flat. Cards are used for navigation and related material around it. Related headings follow the section role regardless of which include supplies them. The policy related-card context omits version/date while retaining both values on its detail page and in search.

## Images and reference content

Portraits use square frames: 56–64px in rows, 88px in desktop grids and 72px on mobile, with existing detail geometry of 176px desktop / 80px mobile. Organisation logos use centred white rectangular frames: 120×60px in wide lists, 256×112px maximum in grids, and 260×130px on wide details. The logo frame has no decorative outline. People grids keep compact horizontal portrait-and-name geometry because square portraits do not need landscape-card space. Logos and technical diagrams are contained; editorial images retain useful proportions.

Image-bearing lists retain neutral person/organisation/document placeholders for absent and failed loads. The placeholder is decorative beside the title, not a fabricated portrait or logo. Text-only supporting options do not reserve image frames; sparse detail headers do not reserve an absent image column. Source paths, alt text and dimensions are preserved.

The glossary remains an open reference list, not cards or accordions for every term. It shares Poppins term hierarchy, neutral search/index surfaces, brand-coloured letter markers, quiet separators and common spacing. Preserve all 46 definitions, 20 linked terms, examples, groups, anchors and editorial order. Search includes definitions, preserves result counts/reset behaviour and reveals a directly linked term despite a conflicting filter. All definitions and alphabet links remain available without JavaScript.

## Navigation and forms

The existing menu data controls all 84 options and their labels, order, destinations and groups. The mega-menu uses a plain brand-blue surface and elevation 3. Group headings are white and semibold, using the same role as footer groups; importance comes from weight and spacing. Native disclosure behaviour, Escape, keyboard focus, mobile groups and decorative `▼`/`▲` indicators remain intact. No-JavaScript links stay available.

Category indices use the existing menu groups/options, followed by additional authored/child destinations once each. Preserve those extra destinations rather than silently deleting routes to simplify a category.

Contact/newsletter forms retain `form-panel.html`. A configured `form.action` submits natively; `form.method` defaults to `post`. Without an endpoint the existing published-service link remains. Do not invent submission services, send test messages or claim delivery from a purely presentational test. Historical form fragment IDs remain intact.

## Design references and verification

The system adapts [Material elevation](https://material-web.dev/components/elevation/), [Material type roles](https://m3.material.io/styles/typography/applying-type), [Bootstrap typography](https://getbootstrap.com/docs/5.3/content/typography/) and [Bootstrap spacing](https://getbootstrap.com/docs/5.3/utilities/spacing/) without adding their runtime dependencies.

Run safe-mode root and `/preview` builds, `check_content.py`, `check_refinement.py`, the event/form Ruby tests, and all five browser suites: `test_catalog.py`, `test_layouts.py`, `test_presentation.py`, `test_refinement.py`, `test_consistency.py`. Preserve their behavioural assertions when changing a presentation contract. The consistency suite explicitly checks the passive promotion, standard action, translucent surround, plain text surfaces, white menu/footer headings, minimal policy navigation, retained PDF notice and non-button membership labels.

See the [Material system review](screenshots/material-system/README.md) for baseline causes, matching screenshots, exact checks and limitations. Earlier [finishing](screenshots/finish-refinement/README.md) and [consistency](screenshots/catalogue-consistency/README.md) galleries are historical evidence, not the current component specification.
