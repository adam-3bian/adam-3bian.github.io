# CHERI corporate presentation system

The design combines a confident dark homepage, matching navigation and heroes, a white elevated mega-menu and calm inner-page content. The visible identity comes from Poppins, navy and logo blue, the continuous honeycomb and clean resting elevation. Repeated field rules and small uppercase eyebrows are excluded. Native HTML and the existing Jekyll pipeline remain; no framework runtime or new authoring fields are required.

## Ownership and cascade

`settings.scss` owns the palettes, established font assignments, spacing scale and container dimensions. `tokens.scss` defines shared type, radius, surface and elevation roles. `page-header.html` renders every hero, including the distinct homepage opening; `hero.scss` owns hero alignment, title sizing and image frames. `cards.scss` owns navigation surfaces and interaction states; `actions.scss` owns action proportions and states. `detail.scss` owns collection and editorial geometry, while `catalog.scss` owns directory controls and record arrangements. `catalogue-navigation.scss` only arranges menu-derived category choices. It must not redefine card surfaces or catalogue media.

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
| Red | `#b42318`; plain-text link hover and keyboard focus on light surfaces |
| Teal | Focus outlines; no collection-specific palettes |

Red is reserved for plain-text link interaction on light surfaces. Dark surfaces retain a light hover colour for contrast. Existing image, logo and document-artwork colours remain unchanged, including the red PDF artwork in authored policy content. Errors use explicit language and contrast rather than a red-only signal.

The homepage uses a dark canvas. Navigation and inner-page heroes use exactly the same dark palette over the light inner-page canvas. There is no theme toggle, stored theme preference or system-theme switch. Poppins is shared by headings, body text, navigation, cards and actions. Code retains its technical font.

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

The feature slider has one elevated track with opaque slides and a separate compact control group. It has no additional gradient surround or nested elevated slide surface. Hover and keyboard focus raise the track together.

Newsletter and footer use separate opaque navy panels with the same width and padding, a 16px gap and 10px corners. Their outer surrounds are transparent so the page honeycomb continues through the gutters. There is no newsletter gradient or separate floating footer column. On mobile, the heading and subscription action stack naturally.

The homepage hero uses an 80px maximum opening, a subordinate half-size desktop supporting statement and one cyan CHERI conclusion. Mobile scales the supporting statement for readability. Ordinary heroes share the responsive page-title scale, 32px desktop/16px mobile padding, a 10px radius and the same subtle frame as other bounded regions. Their height follows the copy and media, with no minimum height, fixed height or clipping. The entire heading group is vertically centred beside any image. Mobile portraits remain beside the name; logos and event images stack below the heading group. Longer titles, introductions and inline facts grow the frame naturally.

People, member-organisation and news heroes omit summaries. Those source fields remain available to search, metadata and cards; body content is unchanged. Other page introductions remain visible. Do not add per-record layout flags or move biographies into the hero. Generated fact labels and directory control labels use consistent capitalisation, such as “Governance Role” and “Sort By”; authored Markdown names, roles and values retain their original case.

## Elevation, boundaries and interaction

| Level | Use |
| --- | --- |
| 0 | Reading canvas, hero, passive panels and closing composition |
| 1 | Navigation cards, compact linked rows and primary actions |
| 2 | Featured slider and modest hover emphasis |
| 3 | Expanded desktop menu |

Each elevated level combines a short contact shadow and a restrained ambient shadow from the same navy family. Cards have visible resting depth without an outline. Hover and keyboard focus share surface/elevation feedback, without movement, scaling or underlining a whole-card title. Keyboard focus adds a separate visible 3px outline. This state pairing also applies to text links, directory view controls, glossary controls, programme tabs and featured slides. Passive panels do not respond as links. Selection uses fill and weight plus semantic pressed/expanded state. Disabled actions are flat and readable.

Cards, portraits, logo frames, asides, citations and glossary entries have no decorative outline. The global hero, content, promotion and footer panels share a subtle 1px frame. Other borders serve input definition, comparison-table structure and keyboard/target focus. Authored horizontal rules remain semantic breaks with spacing, without conspicuous visible lines. Do not restore card outlines on hover.

## Navigation cards and media

`card.html` is the record component and `listing.html` arranges its single set of records into List or Grid. A single destination is one native link with a title, optional image and decorative arrow. A multi-destination block is a passive panel with explicit independent actions. Never nest links, stretch an invisible link over other controls or invent JavaScript-only destinations.

Metadata is explicit through the include parameter `metadata=true`. Event dates/status, news dates, paper publication context and policy version/date can help directory browsing. Related records, Where next and category options use minimal navigation by default. They do not acquire metadata merely because a source record contains it. Search still includes summaries and facts. Meaningful authored resource annotations remain with their records; unlinked product panels retain their descriptions and independent links. Generated excerpts are not repeated beneath cards.

All linked records use a common footer for the arrow and any permitted informational label. Grid footers align at the bottom; compact rows place the arrow consistently to the right. Founder labels derive only from existing membership metadata and have no emblem, fill, outline, shadow or independent interaction. Wide membership lists use a stable footer position; narrow lists give the label a separate row to avoid collisions. The protected member/founder counts are 52 and 21.

Portraits are square: 56px in ordinary rows, 88px in desktop grids and 72px in mobile grids. Portrait grids use compact horizontal identity cards rather than landscape poster slots. Logos use 3:1 contained frames, including 270×90px desktop heroes and up to 240×80px mobile heroes. The frame has no decorative outline and a white backing keeps transparent artwork readable. Detail portraits are 160px desktop and 80px mobile, with face-focused cover images. News/event thumbnails use 16:9 cover images in cards, heroes and article leads. Product hero images use their natural proportions at 240px desktop/192px mobile width, avoiding white padding or cropped board details. Additional authored content images retain their own proportions.

Image-bearing directories retain neutral placeholders for absent or failed media. Placeholders are decorative beside the title, not invented identities. Text-only navigation and sparse detail headers do not reserve absent media space. Source assets, alternative text and relationships stay intact.

## Actions and promotional components

`action.html` supplies native navigation/download anchors with shared URL and baseurl handling. `resource-action.html` delegates to it. Operations remain buttons. Actions share Poppins at .9375rem/1.4, weight 500, 48px minimum height, 10px radius, 12px icon spacing and an 18px icon. Actions use a white fill, logo-blue text and a visible 1px logo-blue border with shallow elevation in both palettes.

Resource actions fit their labels instead of becoming unrelated full-width bars. Long labels wrap. The source primary resource remains prominent. Prose links remain recognisable as links.

Hand-authored Markdown links may use the native Kramdown attribute list
`[Action label](/destination/){: .button }` for the shared button treatment.

All standard buttons use white with logo-blue text in both palettes; hover and keyboard focus invert those colours. Disabled buttons retain their disabled state. Plain links on light surfaces turn red on hover/focus, while dark-surface links retain a light colour. Footer links retain their filled hover treatment without a mouse-hover underline, and keep a keyboard-focus indicator.

Category-index and footer navigation share the mega-menu's full-width rows,
regular-weight 15px type, 44px minimum height and 10px corners. Index links have
no card surface or shadow and use the mega-menu's pale hover/focus fill. Footer
rows keep their dark palette, using the existing dark teal highlight. All three
use a visible keyboard focus ring. Section headings and link destinations stay
unchanged.

Reviewed navigation states: [desktop index](screenshots/navigation-menus/desktop-index-hover.png),
[mobile index](screenshots/navigation-menus/mobile-index-hover.png),
[desktop footer](screenshots/navigation-menus/desktop-footer-hover.png) and
[mobile footer](screenshots/navigation-menus/mobile-footer-hover.png).

`promotional-panel.html` is passive with a standard section heading and one real primary subscription link. `subscribe.html` and the legacy newsletter include share it. The wording remains “Stay connected with CHERI” and “Get the newsletter”, with any existing supporting sentence preserved. There is no whole-banner link or simulated second button.

## Collection arrangements

All collection details share `page-header.html`, `facts.html`, `detail-arrangement.html` and `detail.html`. There is no collection-name eyebrow when breadcrumbs already supply context. Explicit archived-version notices remain. Facts are semantic definition lists; resources retain their destinations and labels. The aside is one borderless neutral region grouped by spacing, not a stack of separate cards.

Aside selection uses existing information roles, not a generic field-count threshold. No presentation flags belong in source records. Sparse identity facts stay near the title. Supporting information occupies a 280–300px desktop region only when it assists use of the record. The main article fills its allocated column; no-aside details fill the shared width. At mobile widths, supporting information precedes the body. The entire article never receives an unconditional 73ch limit.

| Family | Existing information and arrangement |
| --- | --- |
| People | Name and square portrait in the hero, with biography and useful identity facts below. An aside is justified by substantive publication/documentation/download resources alongside other links. Name-only records remain sparse. Talks and publications use the shared relationship components. |
| Organisations | Rectangular contained logo; membership facts and resources form a supporting group when both exist. Activities, products and people stay in the body/relationships. |
| Events | Date/location records use an aside for timing, venue, format and resources. Status remains date-derived; cancellation/postponement remain separate. The programme spans the full canvas below the overview, with one continuous rail per day, blue session bands and green breaks. Speaker credits stay in the timeline; credits without a programme entry remain aside facts, without a separate speaker card list. Existing front matter and talk links stay intact. |
| Papers | Ordered authors and original citation stay in the main column. Publication facts and actual resources use the aside. Long author lists wrap without truncation. |
| Reports | The publication arrangement applies when document facts and links exist; sparse records remain compact. Original attribution and authoritative document destinations stay intact. |
| Hardware | Architecture, version, product type, certification or technical resources justify the technical aside. Product and certification-programme versions remain distinct. |
| Software | Platform, architecture, version or documentation/repository/download information justifies the technical aside. CHERIBSD has sparse inline information and uses the full width. |
| Working groups | Collaboration information and participation resources can form an aside. Purpose and substantial descriptions remain authored body content. |
| Guides | Existing prerequisites or substantive technical resources justify supporting information; instructions, code and diagrams remain the main content. |
| Policies | Version, document date and official format justify a formal supporting region. The original PDF-precedence notice remains in the body, and the official document uses the shared action. Archived versions retain status and routes. |

`facts.html` and the catalogue schema remain the complete fact source; choosing an arrangement does not suppress facts. Missing values are omitted without empty panels. Related content always follows the same minimal navigation rules, so a related policy does not display an unnecessary version/date line.

Generic related links and category-related articles share one “Where Next?”
section. These cards show their titles and arrows without thumbnails. Automatic
article neighbours keep their order, followed by explicit `related` entries;
duplicate destinations appear once. Other pages retain their `related-title`
and article-related fragment links. Named sections such as People, Events, Publications
and Organisers retain their headings and thumbnails, as do directory listings.
The homepage omits generic related links and keeps its dedicated news and events.

Light-mode navigation cards keep their white fill and use the existing form
control's slate border (`--colour-control-border`). Hover and keyboard focus
change that border to the link accent, with the existing fill, elevation and
focus ring. This applies to clickable cards in related sections and lists;
passive panels and dark-mode cards retain their existing treatment.

Review examples: [desktop Where Next?](screenshots/where-next/desktop.png),
[mobile Where Next?](screenshots/where-next/mobile.png),
[desktop list card](screenshots/where-next/desktop-list-card.png) and
[mobile list card](screenshots/where-next/mobile-list-card.png).

## Editorial, category and reference families

News heroes contain the title and concise byline; ordinary pages retain their existing introduction. They use the full available reading canvas without compulsory asides or raised article wrappers. Navigation and resources around the article share the card system. Comparison tables, timetables, code and editorial images retain responsive handling.

Category and subcategory indices use the existing menu groups as compact card choices. Additional authored destinations remain available once each. Remove generated duplication, never meaningful explanations or independent links. Kramdown sometimes turns pipe-separated navigation into a one-row table, including the 404 page. The content enhancement converts only two-to-four-cell, headerless, link-only rows without non-link IDs into shared navigation choices, retaining labels, destinations and punctuation. Real data tables retain their markup and responsive scrolling; without JavaScript the original native links remain available.

The glossary remains an open semantic reference list. Strong term typography, plain letter headings and spacing replace repeated rules and boxed letters. The compact alphabet index, definition-aware search, reset and result count remain. Direct links reveal a term despite an active filter. All 46 definitions, 20 linked terms, examples, groups and anchors remain available without JavaScript.

## Menu, forms and progressive enhancement

The desktop mega-menu is an elevated white panel with logo-blue group headings and navy options. Hover uses a restrained neutral fill; the selected root trigger has a compact blue treatment rather than a full-height slab. The same white panel appears over the dark homepage. Footer group headings use the same type role in white on navy.

All 84 menu links, labels, groups, destinations and ordering come from the unchanged navigation data. Click/tap opens a disclosure and another activation closes it. Hover never changes disclosure state. Opening a peer closes the previous panel. Escape closes the appropriate level and restores focus; outside clicks dismiss navigation. The decorative Unicode triangles remain synchronised. Short desktop viewports get a scrollable panel within the viewport; mobile retains orderly disclosures and comfortable hit targets. Without JavaScript all destinations remain visible.

List/Grid controls retain one record DOM, search, filters, sorting, result counts and persistence. Glossary and slider behaviour remain progressive and respect reduced motion. Navigation initializes immediately after its preloaded header script, with a short pending state that prevents the large fallback menu flashing during parsing. Script failure clears that state immediately, and a four-second timeout provides a second recovery path. With JavaScript disabled, no pending state is set and the native links stay visible. Catalogue enhancement runs beside its directory, selects the requested or saved view before records paint, and reserves toolbar space while enhancement completes; Poppins heading and navigation weights are preloaded from the existing local assets. These placement changes reduce initial layout shifts without hiding unenhanced content.

Directory fields and view controls use scalable minimum heights rather than fixed heights. Their padding and text must fit when browser text is enlarged to 200%; filter widths can grow and wrap onto another row. The search icon is vertically centred independently of the input's line height.

Contact/newsletter forms submit natively when front matter supplies `form.action`, with `form.method` defaulting to `post`. The contact include always shows its existing labelled fields. Without an action, those fields use a non-submitting group, the Send button is disabled, and the published contact link explains how to send an enquiry. Configuring an action replaces that group with a live native form automatically. The newsletter keeps its published-service link when no action is configured. Presentation tests must not send real messages or invent endpoints.

## Verification and references

Run safe-mode root and `/preview` builds, content/refinement validation, event and form Ruby tests, and the existing catalogue/layout/presentation/refinement/consistency browser suites. `test_corporate.py` adds six-width coverage across page families, computed border/colour contracts, click/keyboard menu regression checks, short-viewport navigation, no-JavaScript use and accessibility checks. CI runs that suite in Chromium, Firefox and WebKit at both deployment paths. Do not replace preservation or behavioural assertions merely to pass a new visual treatment.

The design draws on [Material elevation](https://material-web.dev/components/elevation/) and [Bootstrap typography](https://getbootstrap.com/docs/5.3/content/typography/) without adopting their runtime dependencies. See the [corporate design review and screenshot gallery](screenshots/corporate-system/README.md) for causes, matching comparisons, exact checks and limitations. Earlier galleries document historical states rather than current component contracts.
