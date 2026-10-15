# CHERI Alliance design language

The creative idea is **Security Starts in Hardware**. Use the supplied blue
CHERI Alliance logo and a luminous scientific visual language: architectural
geometries, precise typography, open editorial compositions and restrained
translucent layers. Depth explains capability authority; it is not decoration.
Preserve article wording. Build with native Markdown, YAML and shared Jekyll
includes, generic CSS first, and minimal vanilla JavaScript. No component
framework, remote font or third-party image viewer is needed.

## Foundations

| Rule | Value or purpose |
| --- | --- |
| Page | White `#ffffff` with cool `#f3f7f9` supporting surfaces |
| Text | Deep blue `#163747`; secondary text `#536874` |
| Brand and links | CHERI blue `#125770`; darker blue on hover |
| Accent | CHERI red `#ba1e1e`, reserved for rejection or meaningful emphasis |
| Borders | Soft blue-grey `#d6e2e8` |
| Form boundaries | `--control-line: #738b98`, at least 3:1 against white |
| Focus | A visible 3px amber outline; never colour alone |
| Typeface | Locally served Poppins, with system sans-serif fallbacks; monospace for code |
| Body | 1rem, line height 1.7; scalable headings with tighter line height |
| Spacing | A quarter-rem rhythm: .25, .5, .75, 1, 1.5, 2, 3 and 4rem |
| Container | Full/technical frame 90rem; editorial 76rem; reading 48rem (approximately 78ch at base Poppins size) |
| Gutters | Fluid 4vw desktop, bounded at 4.5rem; 1.5rem tablet and 1rem mobile |
| Controls | At least 44px for navigation, buttons and touch targets |
| Corners | Precise .15rem rounding; avoid pill-shaped decorative controls |

CSS tokens also define a 72ch summary measure, .875rem supporting text, scalable
page and hero titles, a 2rem section rhythm, the shared hover colour and focus
outline. Native primary links share one treatment across page actions, resource
links and onward navigation. Root text sizing respects the browser font setting.

Style elements first: headings, paragraphs, links, lists, definition lists,
tables, figures, details, forms and code. Classes identify real layout roles,
rather than every field or page. Keep tokens and rules in `assets/viewer.css`;
avoid per-record overrides.

## Site frame

The header contains the original Alliance logo and five native menus. The complete
hierarchy is authoritative in `_config.yml`, including nested `links` groups.
The validator generates `_data/primary-navigation.json` directly from it. Header
and section browse share `menu-links.html`; never edit the generated JSON by hand.
Build has three topic areas: Build, Technology and Resources. Software Developers
retains its seven-step sequence; Hardware Developers is explicitly TBD and links
to the existing hardware directory. Capability concepts are nested under their
overview, beside memory protection and system models in a second technical
subcolumn on wide screens; platform and software resources also have separate
subcolumns. Narrower desktop and tablet layouts stack technical subgroups for
readability. Keep overview
and general directory routes alongside the detailed destinations.
Collection active sections use `_data/viewer.yml` associations, with route and
registered-navigation fallbacks for ordinary pages.
Native `details` and `summary` keep links available without JavaScript; the small
navigation script adds keyboard behaviour and the mobile toggle. Mobile menus
show grouped destinations directly within each primary disclosure, without
requiring another disclosure step. Desktop panels use the full shared frame and
scroll within short viewports; mobile follows document flow.
Give the logo
an accessible home-link name and explicit intrinsic dimensions.
Desktop menu items can wrap when text is enlarged, keeping every label and
control within the header. Directory titles and introductions use compact
spacing before controls; long titles and summaries remain complete.
An early, local enhancement flag reserves the mobile menu frame before deferred
code runs. If that code cannot load, DOMContentLoaded restores native navigation;
with JavaScript disabled the complete native disclosures remain visible.

The light footer has four visible link groups on desktop, two on tablet and one
on mobile, followed by copyright and social links. Useful directories appear
once within those visitor-oriented groups, without a separate shortcut band.
The retained `/checks/` compatibility route stays outside visitor navigation,
search and sitemap and carries `noindex`. It remains public: this is not access
control. Maintainers can also download validation reports and the checks page
as a CI artifact; do not put private authoring information in published sources.

Use one `main` landmark and one page title. Use `article` for records, `nav` for
destinations, `section` for named content regions, and `aside` for supplementary
utilities. Avoid unnecessary `div` and `span`; do not invent semantic sections
solely to replace a layout wrapper.

## Pages and indexes

Ordinary pages have breadcrumbs, a title, optional introduction, Markdown body
and relevant onward links. Preserve supplied wording. Headings clear floated
images; paragraphs use a comfortable reading measure, with wider diagrams and tables.

Prose blocks establish an independent formatting context beside floated images,
so illustrations do not remove the article's reading measure. Tables retain
native table/caption semantics inside labelled, keyboard-scrollable regions;
code remains selectable and horizontally scrollable. Long guides and technical
articles can offer a native “On this page” disclosure with stable source heading
links, generated by the existing content validator. The optional `toc` property
can enable or suppress it. Aggregate print-book chapter headings shift one level
below the page title while retaining labels, relative hierarchy and anchors.

A section landing page has its existing title and introduction, source-backed
starting points, relevant featured resources and a complete browse navigation
drawn from the matching `_config.yml` groups. Brief group descriptions come from
shared presentation metadata. Build adds a platform-aware developer progression;
News and Events reuses the build-time activity include. Native links work without
JavaScript. Full article text remains in its canonical source page.
The home index uses a dedicated shared include: the hardware-security headline,
two starting actions, Living Memory Architecture, the preserved CHERI introduction,
source-backed topics and audience routes, selected canonical case studies,
verified member logos, build-time news/events and Alliance participation links. Its
original introduction and five main section destinations remain available.
Presentation metadata lives in `_data/landing.yml`; activity is generated from
the existing collections, with a useful empty-event state.

## Lists and directories

Directories contain introductory Markdown followed by complete native lists.
People and organisations use compact rows; papers and reports use bibliography rows;
policies use document rows; software, guides and groups use text resource lists.
Image-led resources retain three/two/one responsive columns. Every entry remains
one native link, including its image and padding; no nested controls or click
handlers. Keep complete titles, source-derived previews and useful dates clear.

Directory search, sorting and metadata facets are progressive enhancements,
generated only from confirmed roles, membership tiers, dates, types and hardware
relationships. Native organisation alphabet jumps work without JavaScript.
Control state can be shared in the page URL; counts and empty states are labelled.
The validator generates confirmed facet options in `_data/directory_facets.json`.
Real disabled controls reserve their space before enhancement, avoiding a late
list jump. A small early flag reveals them only for scripting-capable browsers;
script failure restores the complete native directory without controls.
Missing metadata stays in the default complete view. Events have distinct upcoming/
current and past lists. The shared event-status include honours exact timestamps
and inclusive date-only final days; clients refresh period filters from those
same source values. A daily run of the existing Pages workflow refreshes static
activity/directory information for visitors without JavaScript.

Member, speaker, board and certified-product directories filter real front
matter. Working groups and academic papers use `/working-groups/` and
`/academic-papers/`; record URLs match collection names. Preserve old routes
with small redirect pages, rather than duplicate listings. Related records use
compact columns of links rather than another large card grid.

Ordinary Markdown lists keep their indentation and vertical rhythm. Numbered
legal clauses retain their established numbering and nesting. Use definition
lists for factual body properties. Reserve tables for true comparisons and
contain large technical tables with horizontal scrolling.

## Details and properties

A detail page uses `article`, `header`/`hgroup`, the existing body and relevant
links. Properties use `dl`, `dt` and `dd`, with open spacing rather than cell
borders. Labels sit beside values on desktop and above values on mobile. Event
dates retain source precision and timezone. Resources are distinct native
links. Hide empty fields and keep raw front matter, provenance and asset
inspection in `/checks/`.

Native `details` reveals supplementary content, with a visible, descriptive
`summary` and a generous touch target. Do not hide the primary article or
ordinary directory links in disclosures. No JavaScript is needed for disclosure.

## Images

Use original artwork and verified portraits. Centre images with
`object-position: center` and `object-fit: contain`; never stretch, trim lettering
or manufacture photographs. Header and thumbnail frames are 3:1; speaker, team and board
portraits are 1:1. Article illustrations, screenshots and technical diagrams use
their intrinsic proportions. `.image-full` allows detailed artwork to use the
whole article width; galleries align their images and captions at the top.
The content validator derives intrinsic dimensions from bundled image files
using standard-library readers. The article template adds width/height hints
where the source has none, reserving layout space while retaining original
assets, alt text, captions and existing dimensions.

Logos have transparent frames and inset spacing. Preserve
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

Missing assets may have a local schema placeholder, but public cards and headers
omit empty placeholder blocks. Record assets live under
`assets/<collection>/<record-slug>/`.

Eligible article images use a native `dialog` viewer with full-resolution
artwork, focus return, Escape/backdrop close, labelled previous/next controls,
arrow keys and scroll locking. Exclude linked, decorative, logo, portrait and
placeholder images. No animation is required, including for reduced-motion
users. Content and ordinary links work without JavaScript.

## Authoring and verification

Public discovery uses one shared canonical-record include for search and the
static XML sitemap. Redirects, aliases, alternates, checks and verified mirror/
print views are excluded. Excluded routes remain available and use `noindex`;
this is discovery guidance, not access control. The content validator generates
an independent expected-route manifest for regression checks. Shared metadata
uses source summaries/excerpts, absolute canonical URLs, approved local raster
artwork and safely encoded, source-backed WebSite/Organization/Event JSON-LD.
Generic reference browser titles may gain context without changing their h1.

Search is a dedicated static page with a Jekyll-generated JSON index. Its small
client loads only on `/search/`, fetches the index on the first query, weights
title matches and uses native form controls, text nodes and same-origin links.
Type filters, status announcements, reset/focus and shareable query state are
progressive enhancements. Without JavaScript, an explicit message and complete
section browse links remain available. No hosted search service is involved.

Use `FRONT_MATTER.MD` and `_data/schemas.yml` for fields; use native Markdown and
the existing image classes instead of hand-built page components. Navigation
comes from `_config.yml`, display roles from `_data/viewer.yml`, and the complete
registry from `_data/page-map.yml`.

Validate content, assets, relationships and logo generation. Build at the root
and with a non-empty base URL, including safe Jekyll mode. Check content families,
menus, the footer, image viewer and no-JavaScript behaviour at 1920, 1440, 1024,
768, 640 and 375px. Browser checks cover containment, keyboard operation,
accessible semantics and centred imagery. Verify the deployed revision.

Select **GitHub Actions** as the Pages publishing source in repository settings.
A simultaneous legacy branch publisher can bypass the validation workflow and
use stale generated caches. Changing that source requires repository
administration; it is not controlled by the Liquid layouts or Pages artifact.


## Width and responsive composition

Use `.width-full` / `.width-technical` for the shared 90rem frame,
`.width-editorial` for a 76rem composition and `.width-reading` for centred 48rem
prose. The reading token uses rem so headings and paragraphs align to the same
physical column rather than each interpreting ch at a different font size.
The article region always spans the full frame. Prose, headings and contents
centre within it; diagrams, galleries, scrollable tables and full illustrations
remain wide. Code can use the editorial measure. Floats retain their wrap and
clear behaviour, without widening every paragraph in their document.

Title/summary regions and homepage scenes balance two columns on desktop.
Resource grids fill their region; general directory rows use meaningful content
columns rather than narrow cards. Tablet reduces columns, stacks the home hero
and editorial illustrations, and retains usable two-column resources. Small
screens stack headings, introductions, metadata and resources. Test at 320px as
well as the required 375px. Never solve page overflow by hiding body content.

## Living Memory Architecture

`memory-architecture.html` is original SVG, with 64 isometric cells, elevated
bounded memory, a translucent authority plane, permitted and rejected paths, and
separate compartment authority. `_data/memory.yml` contains source-linked example
explanations. `assets/memory-architecture.js` loads only on the homepage and
selects examples with native buttons, pressed states and a polite live region.
No remote runtime, canvas, graphics library or automatic motion is required.

The illustration is a conceptual model, not an emulator or physical memory
layout. Bounds, permissions, validity, provenance and sealing are distinct.
Removing store permission illustrates a fault **inside** bounds, separately from
an out-of-bounds fault. Neither the illustration nor its copy promises complete
memory safety. All explanations remain available in a native disclosure without
JavaScript. Transitions are brief, user initiated and respect reduced motion.

## Default collection ordering

`ordered-collection.html` reads `_data/collection_order.json`, generated by the
existing validator using `scripts/collection_order.rb`. No custom Jekyll plugin
is involved: safe-mode Pages builds read the committed cache. Regenerate it after
content changes; never maintain it by hand. Alphabetic comparison is natural,
case insensitive, with original title and canonical URL ties.

| Collection | Default |
| --- | --- |
| People | Displayed name A–Z, including speakers |
| Organisations | Name A–Z, including members, independent of tier |
| News | published_date descending; undated last A–Z |
| Events | Upcoming/current earliest start first; past latest start first |
| Academic papers | published_year descending, title A–Z; undated last |
| Hardware | Title A–Z |
| Software | Title A–Z |
| Working groups | Name A–Z |
| Guides | General directory A–Z |
| Policies | Document title A–Z |
| Case studies | Title A–Z |
| Reports and white papers | published_year descending, title A–Z; undated last |

Governing Board pages retain `_data/governing-board.yml` roster order. Curated
home features, learning pathways and configured navigation retain their explicit
sequence: pass their selected arrays directly to `cards.html` or `route-list.html`
rather than applying directory defaults. These are the documented presentation
overrides; no new front-matter field is needed. Automatic news/events features
use the shared ordered include. Source timestamps retain their offsets and exact
expiry; date-only final days remain inclusive through `event-status.html`.
Client date sorting uses the same collection-specific source field, never an
update timestamp or a date inferred from a filename.
