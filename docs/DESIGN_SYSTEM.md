# Shared design rules

The CHERI catalogue uses a common container, type system and component vocabulary. Content is authored in Markdown; presentation belongs in layouts, includes, Sass and progressive enhancements.

## Canvas, identity and typography

The site container is 1264px including 20px mobile and 32px desktop gutters, giving a 1200px content area on wide screens. Header/footer surfaces span the viewport; their inner content aligns with the main canvas. News, ordinary pages and collection details use the available width. A collection article fills the content container when it has no aside, or fills its allocated left column when facts and resources occupy the right.

Only `/` uses the dark palette and the original homepage composition. Its Poppins text treatment is retained. Other pages are light, with Poppins headings, navigation, buttons and card titles, and a system sans-serif for body copy, form inputs and supporting facts. There is no theme toggle, stored theme preference or automatic system-theme selection.

Use solid reading surfaces, quiet borders and restrained brand accents. Decorative gradients and transparent section backgrounds may surround them; never put text directly over honeycomb artwork or a gradient. The newsletter uses a plain white foreground panel over a blue decorative band. The original honeycomb remains visible in page gutters and the newsletter band. Do not apply translucency to reading surfaces or put a raised wrapper around every article. Common corner radii are 8px; utility controls and media frames may use 4–8px. Navigation hover/focus states provide emphasis without giving passive panels an interactive appearance. Whole-card titles are not underlined on hover; border, surface, shadow and keyboard outline communicate the interaction. Ordinary inline links retain underlines.

Colour roles are defined once in the theme maps in `settings.scss`. `tokens.scss` defines the shared type, radius, gradient and elevation roles and aliases the theme colours as `--accent`, `--ink` and `--surface`. Do not introduce a competing palette or hard-code a second primary-button colour in a component.

| Role | Light pages | Homepage |
| --- | --- | --- |
| Main text | Navy `#152b3b` | White |
| Supporting text | `#526574` | `#d1d6df` |
| Links and accents | Logo blue `#125770` | Cyan `#b9e2f1` |
| Primary controls / selected view | Logo blue with white text | Cyan with dark text |
| Secondary surfaces | `#f1f5f7` | `#102a38` |
| Quiet borders | `#d0dde5` | `#3f6174` |
| Limited brand action | Red `#ba1e1e` with white text | The same red/white pairing |

Red is reserved for the existing join action and newsletter action cue. The join action is a compact native link, not a full-width red band. Newsletter cues remain spans inside their existing single-link cards. Red is not a selection state, collection category or status colour. Selected List/Grid controls use a filled surface and stronger label weight; hover changes the surface, and keyboard focus adds a separate outline.

The homepage hero keeps its opening statement largest, supporting statement smaller, and existing concluding CHERI statement in cyan. Text comes directly from the existing fields. The hero and slider share a 1px border family. The hero has square corners and only a bottom keyline; no side or top border. It has no hover or clickable behaviour. Homepage panels use quiet dark surfaces and cyan headings, while actual links retain underlines or explicit action cues.

Use the spacing tokens in `settings.scss`. Close spacing joins related facts; record spacing supports scanning; section spacing separates topics. Directory headers and toolbars are compact. Breadcrumb list items have their own compact rhythm instead of inheriting full menu-row heights.

## Material principles within the CHERI identity

The implementation adapts [Material's limited elevation system](https://material-web.dev/components/elevation/) and [purpose-based typography roles](https://m3.material.io/styles/typography/applying-type), alongside [Bootstrap's responsive typography](https://getbootstrap.com/docs/5.3/content/typography/) and [shared spacing scale](https://getbootstrap.com/docs/5.3/utilities/spacing/). These are design references, not runtime dependencies. Existing fonts, native HTML controls and the Jekyll asset pipeline remain in use.

| Shared type role | Value | Use |
| --- | --- | --- |
| `--type-page` | Responsive 2–3rem | Page and record titles |
| `--type-section` | Responsive 1.375–1.75rem | Article sections, related sections, slider feature title and newsletter heading |
| `--type-title` | 1.125rem | Record titles, menu groups, category groups, glossary terms and resource headings |
| `--type-body` | 1.0625rem, 1rem for mobile prose | Reading text |
| `--type-label` | .875rem | Metadata, controls, breadcrumbs and supporting labels |

Use sentence case without uppercase transforms or tracked-out labels. Preserve the source capitalisation of names and acronyms. Mobile layouts use the same roles rather than unrelated heading sizes. Headings use weight 600 and a comfortable 1.3 line height, with a tighter page-title line height and the existing distinct hero scale. Body text uses 1.65 line height. Menu options remain at the established navigation size.

| Elevation role | Use |
| --- | --- |
| `--elevation-0` | Reading canvas, compact list rows and passive panels |
| `--elevation-1` | Standalone navigation cards and primary buttons at rest |
| `--elevation-2` | Slider frame, newsletter foreground, card/button hover and desktop flyouts |
| `--elevation-3` | Expanded mega-menu and slider hover |

Shadows combine a short contact shadow with a softer ambient shadow, using navy on light pages and a deeper shadow on the homepage. Hover changes surface, border and elevation without translating the component or underlining the whole link. Compact rows retain their flat elevation on hover. Focus adds a separate 3px outline; selected controls retain their filled surface and heavier label. Disabled buttons use a solid quiet surface, muted text, no shadow and the disabled cursor. Reduced motion disables component transitions.

The navy-to-blue `--gradient-brand` is visible in the slider's 8px frame and the newsletter surround. The horizontal `--gradient-soft` sits between opaque Grid-view cards, so its colour remains visible even in very long directories. `--gradient-gutter` supports the honeycomb outside the reading canvas. Gradients never sit directly under writing. Product annotations also have an opaque backing when they share a grid item with a card. List view remains a plain, compact surface, and switching layouts preserves the same records and controls.

Mega-menu group headings use the same Poppins title role as category groups, with cyan on the solid logo-blue menu. Expanded mobile group headings retain that colour. Every option, destination, group and order remains governed by the existing navigation data. Footer groups use the same title treatment. Red remains limited to the established important actions.

## Cards, panels and annotations

| Component | Contract |
| --- | --- |
| Destination/record card | One native `a.catalog-card.navigation-card`, with a real destination and consistent hover/focus treatment. Title, optional image and a decorative arrow; no descriptive excerpt. Dates remain where they support chronological browsing, and founding members receive a badge from existing metadata. |
| Compact List | Horizontal rows, quiet separators and dedicated action alignment on wide screens. Long titles wrap and rows grow as required. |
| Grid | Responsive bordered cards with consistent padding, image frames and action positions. The same records and DOM serve both views. |
| Editorial panel | A passive container with independent links. No pointer cursor or whole-panel hover effect. Full authored text remains available. |
| Unlinked product | A passive content panel with its factual description and any authored links. Do not invent a destination. |
| Context/resource annotation | Navigation descriptions stay in their Markdown source and are not repeated below cards. Embedded product notes with independent resource links stay in the same list item as their product so filtering keeps them together. |

Do not nest interactive controls or use stretched-link overlays, `onclick` containers or duplicated hidden card sets. Preserve all existing destinations and actions. Summaries remain canonical detail introductions and searchable data even when cards do not display them.

`card.html` supplies shared record cards. Listings do not append the old `listing-notes.html` output. `section-cards.html` arranges complete authored multi-link homepage sections; these remain editorial panels. Category indices use the existing mega-menu groups and options as compact cards, followed by any additional authored or child destinations once each. The menu itself retains every option, group, destination and order. Homepage slides retain their authored promotional content.

Do not repeat the generic “Introduction” resource label above a destination whose title already explains it. That value remains in front matter. Useful distinctions such as Standard, Specification, event status and dates remain visible in the shared sentence-case label style. Directory headers omit the generated “Explore the CHERI ecosystem” eyebrow and the duplicate collection name beside the result count. Keep the count and every search, sort and filter control.

`talk-card.html` applies the same distinction to CHERI talks from the canonical registry. A talk with exactly one distinct destination is one native navigation-card link. Talks with multiple destinations are passive content panels with separate event/resource links; a talk with no destinations remains a complete passive record. Preserve title, date, event, location, action labels and registry order. On wide screens, actions align to the right of the talk copy; on mobile they wrap beneath it. Titles and metadata use the catalogue scale, and resource actions have 44px minimum targets. `resource-action.html` supplies the same labelled link treatment for talks and detail resources; do not add a separate miniature talk-link style.

## Image geometry

People use square 1:1 frames with modest corners: 56–64px in list rows, 88px in desktop grids and 72px in mobile grids, 176px in desktop detail headers and 80px on mobile. Catalogue portraits use `contain` inside square frames so landscape photographs and faces are not cut off; detail images retain their authored image settings. Mobile portrait headers use a grid so the introduction starts below the image rather than overlapping it.

Organisation marks use an opaque landscape frame, centred with `contain` and internal padding. List frames are 120×60px on desktop and 88×44px on mobile. Grid frames have the same 256px maximum width and 112px height across logos. Detail frames are 260×130px on desktop and 192×96px on mobile. Square marks remain centred in these landscape frames. Intrinsic image dimensions do not determine frame widths.

Hardware diagrams and product artwork use `contain`; editorial images retain their useful proportions. Image-bearing record lists and grids use neutral person, organisation or document placeholders when thumbnails are absent. Failed catalogue image loads use the same fallback. The placeholder is decorative next to the record title and never impersonates a photograph or logo. Text-only navigation options have no image frame; sparse detail headers do not reserve an image column. Keep image source paths, alt text and useful intrinsic dimensions in front matter; frame dimensions belong in CSS.

## Detail facts and resources

There is no visible generic “At a glance” heading. One or two short facts form an inline semantic definition list near the title/summary. Up to three resource actions can appear alongside these introductory facts. No facts means no empty wrapper.

More than two facts, a long fact/array, or more than three resource actions use the common side region on wide screens. It appears naturally above the body on mobile. This choice is derived from structured values, not per-record display switches or rendered HTML. The existing `facts-title` target remains available where facts exist. Certification facts retain their actual labels, dates and programme/product version distinctions.

Do not impose a reading-length `max-width` on `.record-body` or reserve an empty metadata column. CHERIBSD, for example, has one short structured fact and uses the full container with that fact inline. X730 has substantial technical and certification facts in the existing right-hand aside. At mobile widths, both the aside and article fill the container. Keep tables, code and diagrams responsive within the article; any specialist reading-width constraint belongs on the relevant content block.

Resource actions have at least 44px height. Facts and resources use quiet borders and spacing; they do not suggest whole-panel interaction. Related records follow the main body.

## Glossary and progressive enhancement

The output-disabled `_glossary` collection contains one Markdown file per term. Front matter has `title`, a stable `anchor`, and an optional existing destination in `link`. The definition, examples and inline links belong in the body. Numbered filenames retain the editorial order; letters, counts and search data are derived. The glossary page owns its introductory Markdown. There is no HTML-splitting glossary parser or second authoring registry.

Terms sit directly above their definitions, with a nearby permalink and a quiet letter rail. Entries remain open. The alphabet is a single scrolling strip on narrow screens; all letters are accessible by touch or keyboard. Search matches terms and definitions, reports the result count and offers clear/reset controls. Hash navigation clears a conflicting filter and reveals the target, including browser back/forward and repeated same-hash links. Without JavaScript, all definitions, links and the alphabet remain available.

Letter markers use a solid logo-blue surface and white lettering; terms use the shared Poppins title role. The alphabet strip has a quiet solid surface. A directly targeted entry receives a pale highlight with an outlined term. This is a reference cue, not a per-entry card or collapsed disclosure.

The light-page mega-menu uses the logo’s `#125770` blue with white text and clear focus states; the homepage retains its dark treatment. Keep Unicode `▼`/`▲` menu indicators decorative and synchronised with expanded states. Preserve visible focus, 44px controls, no-JavaScript content and reduced-motion behaviour. Overflowing tables and code examples gain keyboard focus through the shared content enhancement; their text remains intact.

## Verification

Run `check_content.py`, `check_refinement.py`, `test_event_status.rb`, `test_forms.rb`, `test_catalog.py`, `test_layouts.py`, `test_presentation.py`, `test_refinement.py` and `test_consistency.py` against safe-mode root and baseurl builds as appropriate. The consistency suite checks visible resting depth, gradient surrounds, plain surfaces behind text, menu heading roles and the absence of redundant labels as well as the existing interaction contract. The refinement fixtures are preservation evidence, not an authoring source. Update them deliberately for reviewed editorial changes. See [the Material refinement review](screenshots/material-refinement/README.md) for the latest matching screenshots and measured outcomes.

## Supporting navigation and forms

Related records, “Where next” and “Related pages” share compact full-width rows and the same section-heading typography. List/Grid controls still apply to collection directories. People grids use horizontal portrait-and-name cards to avoid large empty panels. News and event artwork is contained rather than cropped.

Contact and newsletter forms use one `form-panel.html` component. With `form.action` in page front matter, the contact form submits natively to that endpoint; `form.method` is optional and defaults to `post`. Without an endpoint, show the existing published-service link instead of disabled fields or a preview warning. Preserve historical form fragment IDs. Do not invent submission endpoints or claim delivery without a working service.

See [the consistency review](screenshots/catalogue-consistency/README.md) for screenshots, preservation checks and the membership comparison.
