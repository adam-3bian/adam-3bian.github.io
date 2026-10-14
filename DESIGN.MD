# CHERI Alliance design language

Use the supplied blue CHERI Alliance logo and a light editorial layout. The
starter kit informs the spacing, column navigation and fully linked cards.
Preserve article wording. Build with native Markdown, YAML and shared Jekyll
includes, generic CSS first, and minimal vanilla JavaScript. No component
framework, remote font or third-party image viewer is needed.

## Foundations

| Rule | Value or purpose |
| --- | --- |
| Page | White with pale blue navigation and image surfaces |
| Text | Deep blue `#163747`; secondary text `#536874` |
| Brand and links | CHERI blue `#125770`; darker blue on hover |
| Accent | CHERI red `#ba1e1e`, used sparingly as a section keyline |
| Borders | Soft blue-grey `#d6e2e8` |
| Focus | A visible 3px amber outline; never colour alone |
| Typeface | Local system sans-serif; monospace for code |
| Body | 1rem, line height 1.65; scalable headings with tighter line height |
| Spacing | A quarter-rem rhythm: .25, .5, .75, 1, 1.5, 2, 3 and 4rem |
| Container | One shared 88rem site frame; prose uses a 74ch reading column, with facts alongside when useful |
| Gutters | 2.5rem desktop, 1.5rem tablet, 1rem mobile |
| Controls | At least 44px for navigation, buttons and touch targets |
| Corners | Small .4rem rounding on cards and controls |

Style elements first: headings, paragraphs, links, lists, definition lists,
tables, figures, details, forms and code. Classes identify real layout roles,
rather than every field or page. Keep tokens and rules in `assets/viewer.css`;
avoid per-record overrides.

## Site frame

The header contains the original Alliance logo and the existing mega menu.
Native `details` and `summary` keep links available without JavaScript; the small
navigation script adds keyboard behaviour and the mobile toggle. Give the logo
an accessible home-link name and explicit intrinsic dimensions.

The light footer has four visible link groups on desktop, two on tablet and one
on mobile, followed by copyright and social links. Collection shortcuts and
Content checks form a separate utility band below the footer. They are available
without opening the main menu and do not compete with primary routes.

Use one `main` landmark and one page title. Use `article` for records, `nav` for
destinations, `section` for named content regions, and `aside` for supplementary
utilities. Avoid unnecessary `div` and `span`; do not invent semantic sections
solely to replace a layout wrapper.

## Pages and indexes

Ordinary pages have breadcrumbs, a title, optional introduction, Markdown body
and relevant onward links. Preserve supplied wording. Headings clear floated
images; plain-text articles use a readable column. Wide diagrams, galleries and technical tables use the full content container.

A section index has its title, existing introduction and clearly headed groups from the matching mega menu. Home links have section titles and their existing introductions so visitors can choose between learning, adoption, building and participation. The menu remains the single route source. Indexes use native navigation and headings with generous spacing and visible focus, without per-page component configuration.

## Lists and directories

Directories contain introductory Markdown and a native `ul`. Visual collections use cards; bibliographies, policies, guides, software and dense people/organisation directories use compact rows. Presentation defaults live in `_data/viewer.yml`; the ordered governing board retains portrait cards. Every record is one native link including padding, with an accessible name drawn from its title and no nested links. Missing images render no placeholder panel; directory titles retain their column alignment.

Keep titles intact, previews concise and useful metadata visible. Papers skip the bibliographic citation when choosing a preview; reports can use publisher/year alone when no descriptive paragraph exists. Counts are secondary and headings avoid repeating the page title. Search progressively enhances large people and organisation directories with native form controls, counts, Clear and an empty-result message; all records remain usable without JavaScript.

Member, speaker, board and certified-product directories filter verified data. General events put upcoming events first and then recent archive items. Preserve old routes with redirects. Related resources resolve canonical URLs, merge duplicate destinations and keep meaningful role context. Show up to three groups of four links initially, with remaining links in a native More related resources disclosure. Do not invent filtered routes or compatibility claims.

Ordinary Markdown lists keep their indentation and vertical rhythm. Numbered
legal clauses retain their established numbering and nesting. Use definition
lists for factual body properties. Reserve tables for true comparisons and
contain large technical tables with horizontal scrolling.

## Details and properties

A detail page uses `article`, a compact `header`/`hgroup`, meaningful resource actions, selected facts, the existing body and onward links. Short opening introductions move into the header with their native links; publication abstracts precede their full citations. Explicit summary fields remain optional. Portraits and logos support the introduction without dominating it. One real layout wrapper places facts beside prose on desktop; it stacks in native document order on tablet/mobile. Wide technical content remains full width. Properties use `dl`, `dt` and `dd`, with open spacing rather than cell
borders. Sidebar facts stack labels over values. Full-width facts place labels beside values on desktop and above them on mobile. Event
dates retain source precision and timezone. Resources are distinct native links with meaningful destination names. One useful action may have visual priority; supporting source/profile links remain quieter. Repository entries use label and URL, without numbering. Hide empty fields and keep raw front matter, provenance and asset
inspection in `/checks/`.

Native `details` reveals supplementary content, with a visible, descriptive
`summary` and a generous touch target. Do not hide the primary article or
ordinary directory links in disclosures. No JavaScript is needed for disclosure.

## Images

Use original artwork and verified portraits. Centre images with
`object-position: center` and `object-fit: contain`; never stretch, trim lettering
or manufacture photographs. Non-portrait frames are 3:1; speaker, team and board
portraits are 1:1. Logos have transparent frames and inset spacing. Preserve
intentional artwork backgrounds; remove accidental canvas backgrounds through
reproducible SVG treatments, retaining original assets. For light artwork, the
optional `image_background: dark` property supplies a contrasting primary-image
frame on headers and cards. The page stays light and the artwork stays intact.
Inline images can use `data-image-background="dark"` in native Markdown attributes.

Normal prose illustrations alternate `.image-left`, `.image-right` in each
document, starting left. Desktop floats occupy 42% with a 1.5rem text gutter.
Stack at 960px and below so tablet text stays readable. Heroes, logos, portraits,
galleries, charts and detailed diagrams are exceptions. Use `.image-full` when
smaller rendering would hide detail. Preserve deliberate working alignments.
Consecutive images use one responsive gallery. Preserve existing captions in
`figure` and `figcaption`.

Missing primary images are omitted from front matter and the public layout. Do not add placeholders merely to satisfy a schema. Record assets live under
`assets/<collection>/<record-slug>/`.

Eligible article images use a native `dialog` viewer with full-resolution
artwork, focus return, Escape/backdrop close, labelled previous/next controls,
arrow keys and scroll locking. Exclude linked, decorative, logo, portrait and
placeholder images. No animation is required, including for reduced-motion
users. Content and ordinary links work without JavaScript.

## Authoring and verification

Use `FRONT_MATTER.MD` and `_data/schemas.yml` for fields; use native Markdown and
the existing image classes instead of hand-built page components. Navigation
comes from `_config.yml`, display roles from `_data/viewer.yml`, and the complete
registry from `_data/page-map.yml`.

Validate content, assets, relationships and logo generation. Build at the root
and with a non-empty base URL, including safe Jekyll mode. Check content families,
menus, the footer band, image viewer and no-JavaScript behaviour at 1440, 1024,
768, 640 and 375px. Browser checks cover containment, keyboard operation,
accessible semantics and centred imagery. Verify the deployed revision.
