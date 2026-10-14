# Front matter reference

This is the authoring reference for all twelve collections and the four common page schemas (content, index, listing and redirect). The executable field shapes are in [`_data/schemas.yml`](_data/schemas.yml); [`scripts/check_content.rb`](scripts/check_content.rb) validates them. Rendering, aliases, role relationships and listing presets are defined in [`_data/viewer.yml`](_data/viewer.yml) and [`_config.yml`](_config.yml).

## Collections and canonical routes

Hyphenated Jekyll collection names are supported. Collection keys, folders,
asset directories and record URLs use the same spelling. Use Liquid bracket
access for hyphenated keys, for example `site['academic-papers']`; use
`relative_url` for generated internal links so non-empty base URLs work.

| Collection key | Source folder | Directory | Record and asset path |
| --- | --- | --- | --- |
| `people` | `_people` | `/people/` | `/people/<slug>/`; `assets/people/<slug>/` |
| `news` | `_news` | `/news/` | `/news/<slug>/`; `assets/news/<slug>/` |
| `organisations` | `_organisations` | `/organisations/` | `/organisations/<slug>/`; `assets/organisations/<slug>/` |
| `events` | `_events` | `/events/` | `/events/<slug>/`; `assets/events/<slug>/` |
| `academic-papers` | `_academic-papers` | `/academic-papers/` | `/academic-papers/<slug>/`; `assets/academic-papers/<slug>/` |
| `hardware` | `_hardware` | `/hardware/` | `/hardware/<slug>/`; `assets/hardware/<slug>/` |
| `software` | `_software` | `/software/` | `/software/<slug>/`; `assets/software/<slug>/` |
| `working-groups` | `_working-groups` | `/working-groups/` | `/working-groups/<slug>/`; `assets/working-groups/<slug>/` |
| `guides` | `_guides` | `/guides/` | `/guides/<slug>/`; `assets/guides/<slug>/` |
| `policies` | `_policies` | `/policies/` | `/policies/<slug>/`; `assets/policies/<slug>/` |
| `case-studies` | `_case-studies` | `/case-studies/` | `/case-studies/<slug>/`; `assets/case-studies/<slug>/` |
| `reports` | `_reports` | `/reports/` | `/reports/<slug>/`; `assets/reports/<slug>/` |

White papers remain in `_reports` with `publication_type: white-paper`. Do not
create a duplicate `_white-papers` bibliography. Academic citations belong in
`_academic-papers`; adoption stories belong in `_case-studies`.

All collections share the image convention below. Complete examples for every
collection appear later and are validated against their schema. Layout and
presentation rules are in [DESIGN.MD](DESIGN.MD).

## Required keys and optional values

Each document starts with a YAML block between two `---` lines. **Include every key in its collection or page schema**, including nested keys. An unused scalar is `null`; an unused list is `[]`. A key being required does not mean its value must be populated. `title` must be nonempty, pages need their registered `permalink`, and events need exactly one start date or start datetime.

The **shared optional properties** below may be omitted entirely, or supplied alongside any collection or page schema. Unknown extra properties fail validation. Populated metadata on article and record pages renders as a semantic definition list, with reference lists and resource navigation. Index pages show their title, summary and page list. Image paths supply the displayed image without adding an original-image download link. Empty metadata and resource sections are omitted.

Keep human-readable article content in the body; keep record-level versions, dates, resource URLs and relationships in front matter.

Shared metadata and body property lists use the same label/value rows, with open spacing and stacked labels at 640px and below. For additional factual details that belong to the article, use Kramdown's native definition-list syntax:

```markdown
Group type
: Technical
{: .record-properties }
```

Do not repeat a front-matter property in the body unless it adds useful detail. Event status is derived from the final event date at build time, matching the past/upcoming directories; do not maintain a separate `Status: Upcoming` line.

| Shared property | Type | Meaning and rendering |
| --- | --- | --- |
| `toc` | Boolean or `null` | `true` enables native contents links when at least two headings exist; `false` omits them. The default automatically offers contents on long guides and technical/reference articles with at least four section headings. Existing heading IDs and wording are retained. |
| `version` | Quoted string or `null` | The document, product or record version; displayed as Version. Use `"1.01"`, not a YAML number. Versions of individual ISA extensions remain with their technical descriptions. |
| `document_date` | Quoted `YYYY-MM` or `YYYY-MM-DD` string, or `null` | The source document's stated date; displayed as Document date. `"2024-08"` displays **August 2024**, preserving month precision. This is separate from publication, event and editorial update dates. |
| `document_url` | HTTP(S) URL, existing root-relative asset path, or `null` | The official document, normally a PDF; displayed as a Read document resource link. Local files must exist. |
| `image_background` | `dark` or `null` | Optional contrast frame for light artwork on a primary header/card image. Default organisation frames are transparent; `dark` uses the site ink colour without changing asset pixels. |
| `summary` | String or `null` | A short introduction under the title and, when provided, the card preview. It remains required by content/index schemas. |
| `parent` | Registered page route or `null` | Optional breadcrumb parent override; update the page map to agree. Collection defaults normally supply it. |
| `next_page_url` | Registered page route, HTTP(S) URL, or `null` | Optional next-page navigation. |
| `related` | Mapping of registered collection keys to slug arrays; `pages` contains page routes | Optional on listings. For collections/content pages, keep their required related keys and add other registered collection keys when useful. For example, `related.case-studies: [cheribsd]` and `related.reports: [an-introduction-to-cheri]`. Unknown collections, duplicate values and unresolved targets fail validation. |

Use quoted strings for dates and URLs where YAML punctuation could be ambiguous. Ordinary `*_date` fields require a complete valid `YYYY-MM-DD` date. `*_datetime` fields require ISO 8601 with `Z` or a numeric timezone offset, for example `"2026-01-21T09:00:00+00:00"`. Only `document_date` accepts a month without a day. Do not guess missing dates or invent an effective date from a document's publication date.

## Fields shared by collection records

Every collection has these two required keys, in addition to its own keys listed below:

| Property | Type | Meaning |
| --- | --- | --- |
| `title` | Nonempty string | Human-readable record title. |
| `image_url` | Root-relative asset path | Primary image, stored at `/assets/<collection>/<record-name>/<filename>`. Use neither an underscore on the collection nor `.md` on the record name. Each collection record currently requires an existing local image, including a labelled `placeholder.svg` when the source provides none. |

Collection slugs come from Markdown filenames: `_people/adam-finney.md` becomes `/people/adam-finney/`. Do not put `slug` or `permalink` in collection front matter. Add the record to `_data/page-map.yml` when creating a new file.

Images render in contained 3:1 frames; people portraits, including speakers and board members, render in 1:1 frames. Asset bytes retain their original proportions. Placeholder assets remain local fallbacks for validation and image coverage; public headers and directories omit them. Organisation logos normally use transparent display frames. For white or pale artwork, set `image_background: dark` to make its header and card readable on a light page. Inline Markdown can use `data-image-background="dark"` in its Kramdown attribute list. Case-study primary images supply the directory cards; their body illustrations render beside the prose without a duplicate header image. Images do not generate metadata links or empty panels. Image alignment classes belong in Markdown, not front matter: `.image-left`, `.image-right`, `.image-full`, `.image-logo`, `.image-icon` and `.image-portrait`. Keep consecutive photos, logos and portraits in an appropriate gallery; preserve captions with `figure`/`figcaption`.

All relationship arrays contain existing **collection slugs**, without directory prefixes, `.md`, or full URLs. `related.pages` is the exception: it contains registered page routes, including the leading and trailing slash. Do not use a comma-separated string in place of an array, and do not repeat values. Authors, speakers, leads and the singular policy author all reference `_people` records.

## People (`_people`)

| Additional property | Type | Meaning |
| --- | --- | --- |
| `website_url` | URL or `null` | Personal or profile website. |
| `is_speaker` | Boolean or `null` | `true` includes the person in speaker listings and selects the square portrait frame. |
| `social` | Mapping | Include all three social keys below. |
| `social.linkedin_url` | URL or `null` | LinkedIn profile. |
| `social.mastodon_url` | URL or `null` | Mastodon profile. |
| `social.github_url` | URL or `null` | GitHub profile. |
| `related` | Mapping | Include both relationship keys below. |
| `related.organisations` | Slug array | Affiliations; displayed in metadata and as reverse relationships. |
| `related.working-groups` | Slug array | Related working groups. |

## News (`_news`)

| Additional property | Type | Meaning |
| --- | --- | --- |
| `published_date` | Full date or `null` | Publication date. Dated news sorts newest first; undated records follow it. |
| `authors` | People slug array | Named authors, with links back to their authored news. |
| `related` | Mapping | Include all five keys below. |
| `related.working-groups` | Slug array | Relevant working groups. |
| `related.organisations` | Slug array | Relevant organisations. |
| `related.hardware` | Slug array | Relevant hardware. |
| `related.software` | Slug array | Relevant software. |
| `related.academic-papers` | Slug array | Relevant publications. |

The five related keys above are required. Shared `related` support also permits other registered collection keys, such as `related.events`, for verified relationships.

## Organisations (`_organisations`)

| Additional property | Type | Meaning |
| --- | --- | --- |
| `website_url` | URL or `null` | Organisation website. |
| `membership_tier` | `full`, `community`, or `null` | Confirmed Alliance membership. A non-null value includes the record in member listings. |
| `is_founding_member` | Boolean or `null` | Confirmed founder status; does not by itself select the member listing. |
| `social` | Mapping | Include all three keys below. |
| `social.linkedin_url` | URL or `null` | LinkedIn profile. |
| `social.mastodon_url` | URL or `null` | Mastodon profile. |
| `social.github_url` | URL or `null` | GitHub profile. |

Do not infer membership, founder status or speaker status from a mention elsewhere.

## Events (`_events`)

| Additional property | Type | Meaning |
| --- | --- | --- |
| `website_url` | URL or `null` | Event website. |
| `registration_url` | URL or `null` | Registration destination. |
| `start_date` | Full date or `null` | All-day or date-only start. Set this **or** `start_datetime`. |
| `start_datetime` | Zoned datetime or `null` | Start with a known time. |
| `end_date` | Full date or `null` | Date-only end. Set this **or** `end_datetime`, or leave both null. |
| `end_datetime` | Zoned datetime or `null` | End with a known time. |
| `location` | String or `null` | Venue, locality or online location. |
| `speakers` | People slug array | Confirmed speakers. This relationship does not automatically set their `is_speaker` value. |
| `related` | Mapping | Include all three keys below. |
| `related.working-groups` | Slug array | Participating working groups. |
| `related.organisations` | Slug array | Participating organisations. |
| `related.academic-papers` | Slug array | Relevant publications. |

Events and upcoming events sort by start time/date, earliest first; past-event archives show the newest first. Past/upcoming filters compare the final event day (end, falling back to start) with the build date. An event whose final day is today remains upcoming. This is a build-time filter, not a continuously running browser clock.

## Academic papers (`_academic-papers`)

| Additional property | Type | Meaning |
| --- | --- | --- |
| `publication_url` | URL or `null` | DOI, publisher record or original paper. |
| `published_year` | Integer from 1000 to 9999, or `null` | Publication year, displayed on detail pages and cards. |
| `authors` | People slug array | Paper authors. Keep any full bibliographic citation in the body. |
| `related` | Mapping | Include all three keys below. |
| `related.working-groups` | Slug array | Relevant working groups. |
| `related.hardware` | Slug array | Referenced hardware. |
| `related.software` | Slug array | Referenced software. |

The canonical bibliography is `/academic-papers/`; academic records are stored in `_academic-papers` with assets under `assets/academic-papers/<record-name>/`. Record URLs now use `/academic-papers/<record-name>/`. The former `/papers/` directory, all `/papers/<record-name>/` records and the old Discover overview redirect directly to their canonical destinations. Do not maintain a second list of the same citations in a general page.

## Case studies (`_case-studies`)

Use for individual application or adoption stories. Keep hardware and software catalogue records separate, and link them through `related`. The directory is `/case-studies/`, and `_case-studies/cheribsd.md` renders at `/case-studies/cheribsd/`. Store assets under `/assets/case-studies/cheribsd/`. The previous overview URL redirects to the directory.

| Additional property | Type | Meaning |
| --- | --- | --- |
| `related` | Mapping | Include all four keys below. |
| `related.organisations` | Slug array | Participating organisations. |
| `related.hardware` | Slug array | Platforms used or discussed. |
| `related.software` | Slug array | Software used or discussed. |
| `related.reports` | Slug array | Supporting reports. |

A `summary` can reuse the existing overview's short description. Do not invent outcomes, certification claims or dates when migrating a story. The primary image appears on directory cards; body images remain with their prose and captions, with left/right alternation reset for each new document.

<!-- schema: case-studies -->
```yaml
title: 'Morello: a complete experimental stack'
image_url: /assets/case-studies/morello/bfeebb3ac676-morello-board.webp
summary: CHERI at application and server scale
related:
  organisations:
  - arm
  hardware:
  - morello
  software:
  - cheribsd
  reports: []
```

## Reports and white papers (`_reports`)

Use one collection for reports and white papers, with a publication type. Academic papers remain in `_academic-papers`. The directory is `/reports/`; each record has its own `/reports/<slug>/` page. Keep the existing citation and descriptive text in the body, and link the original publisher's page or document.

| Additional property | Type | Meaning |
| --- | --- | --- |
| `publication_url` | Required HTTP(S) URL | Original publication or publisher record; shown as Read publication. |
| `published_year` | Integer from 1000 to 9999, or `null` | The stated year, preserving the source's precision. |
| `publication_type` | `report`, `white-paper`, `policy-paper` or `technical-report` | Reader-facing publication classification. |
| `publisher` | Required nonempty string | Publisher's existing name. |
| `authors` | People slug array | Named authors; leave empty for institution-authored documents without person records. |
| `related` | Mapping | Include all four keys below. |
| `related.organisations` | Slug array | Publishers or participating organisations. |
| `related.case-studies` | Slug array | Relevant application stories. |
| `related.hardware` | Slug array | Referenced platforms. |
| `related.software` | Slug array | Referenced software. |

<!-- schema: reports -->
```yaml
title: An Introduction to CHERI
image_url: /assets/reports/an-introduction-to-cheri/placeholder.svg
publication_url: https://www.cl.cam.ac.uk/techreports/UCAM-CL-TR-941.html
published_year: 2019
publication_type: technical-report
publisher: University of Cambridge
authors:
- robert-watson
- simon-moore
- peter-sewell
- peter-g-neumann
related:
  organisations:
  - university-of-cambridge
  case-studies: []
  hardware: []
  software: []
```


## Hardware (`_hardware`)

| Additional property | Type | Meaning |
| --- | --- | --- |
| `website_url` | URL or `null` | Product/platform website. |
| `repository_urls` | URL array | Source and design repositories; each gets a resource link. |
| `type` | String or `null` | Hardware classification, such as `processor` or `platform`. |
| `architecture` | String or `null` | Architecture description. |
| `status` | String or `null` | Documented availability or maturity. |
| `related` | Mapping | Include all three keys below. |
| `related.organisations` | Slug array | Vendors or participating organisations. |
| `related.hardware` | Slug array | Related hardware records. |
| `related.software` | Slug array | Compatible or relevant software. |

`type`, `architecture` and `status` are descriptive strings, not fixed enumerations. Record-level product versions can use the shared `version` property; detailed component versions and certification evidence stay with their descriptions.

| Optional hardware property | Type | Meaning |
| --- | --- | --- |
| `certification` | `cheri-enabled` or `null` | Confirmed CHERI Enabled certification for the specific product and version. Omit for other implementations; do not infer certification from a family name. |
| `certification_url` | URL or `null` | Required authoritative certification record when `certification` is set. |

The CHERI Enabled Products directory uses `layout: list`, `listing.collection: hardware`, and the optional top-level filter `certification: cheri-enabled`. Its cards are generated from matching hardware records; maintain product descriptions and evidence in those records rather than a second list on the page.

## Software (`_software`)

| Additional property | Type | Meaning |
| --- | --- | --- |
| `website_url` | URL or `null` | Software/project website. |
| `repository_urls` | URL array | Source repositories. |
| `type` | String or `null` | Software classification. |
| `status` | String or `null` | Documented availability or maturity. |
| `related` | Mapping | Include all three keys below. |
| `related.organisations` | Slug array | Maintainers or participating organisations. |
| `related.hardware` | Slug array | Relevant platforms. |
| `related.software` | Slug array | Related software. |

## Working groups (`_working-groups`)

| Additional property | Type | Meaning |
| --- | --- | --- |
| `website_url` | URL or `null` | Group page or resource hub. |
| `repository_urls` | URL array | Group repositories. |
| `leads` | People slug array | Named leads/co-leads. Use `leads`, not a singular `lead`. |
| `related` | Mapping | Include all three keys below. |
| `related.organisations` | Slug array | Participating organisations. |
| `related.hardware` | Slug array | Relevant platforms. |
| `related.software` | Slug array | Relevant projects. |

## Guides (`_guides`)

| Additional property | Type | Meaning |
| --- | --- | --- |
| `repository_urls` | URL array | Source code or training repositories. |
| `updated_date` | Full date or `null` | Known editorial update date. |
| `authors` | People slug array | Guide authors. |
| `related` | Mapping | Include all three keys below. |
| `related.working-groups` | Slug array | Relevant working groups. |
| `related.hardware` | Slug array | Referenced hardware. |
| `related.software` | Slug array | Referenced software. |

## Policies (`_policies`)

| Additional property | Type | Meaning |
| --- | --- | --- |
| `author` | One people slug or `null` | A named individual author, if provided by the source. Do not put an organisation name here. |

Policies also support all shared optional properties. Preserve the source's legal wording and clause identifiers. Use semantic ordered lists for numbered clauses and lettered lists; do not turn `2.1.1` into a bullet with an unrelated visible `1.` marker.

Complete policy example:

<!-- schema: policies -->
```yaml
title: Competition Law Statement
image_url: /assets/policies/competition-law-statement/placeholder.svg
author: null
version: "1.0"
document_date: "2024-08"
document_url: https://cheri-alliance.org/legal-competition/
```

## Ordinary pages (`content` schema)

Use this for prose pages under `pages/`, including technical explanations, exercises, resource overviews and common informational pages. The shared optional properties are also available.

| Required property | Type | Meaning |
| --- | --- | --- |
| `title` | Nonempty string | Page title. |
| `permalink` | Registered root-relative page route | Stable URL; normally ends in `/`. Retained imported file-style URLs may end in `.html`. |
| `summary` | String or `null` | Introductory text beneath the title. |
| `image_url` | Existing asset path or `null` | Optional lead image. |
| `updated_date` | Full date or `null` | Known editorial update date. |
| `parent` | Existing page route or `null` | Parent used by breadcrumbs and index child links; must agree with `_data/page-map.yml`. |
| `next_page_url` | Existing page route, HTTP(S) URL, or `null` | An onward link after the article. |
| `related` | Mapping | Include every relationship key below, even when empty. |
| `related.pages` | Page-route array | Related general pages. |
| `related.people` | Slug array | People. |
| `related.organisations` | Slug array | Organisations. |
| `related.working-groups` | Slug array | Groups. |
| `related.news` | Slug array | News. |
| `related.events` | Slug array | Events. |
| `related.academic-papers` | Slug array | Papers. |
| `related.hardware` | Slug array | Hardware. |
| `related.software` | Slug array | Software. |
| `related.guides` | Slug array | Guides. |
| `related.policies` | Slug array | Policies. |

Complete ordinary-page example using an existing route:

<!-- schema: content -->
```yaml
title: Documentation & Guides
permalink: /discover/resources/documentation-and-guides/
summary: Publications and guidance from the CHERI Alliance.
image_url: null
updated_date: null
parent: /discover/
next_page_url: /working-groups/
related:
  pages: []
  people: []
  organisations: []
  working-groups: []
  news: []
  events: []
  academic-papers: []
  hardware: []
  software: []
  guides: []
  policies: []
```

## Section and home pages (`index` schema)

Use for home and section landing pages. Each index contains one title, one short introduction and a native list of linked pages. Parent routes are inherited through `_config.yml` and recorded in the page map.

| Required property | Type | Meaning |
| --- | --- | --- |
| `title` | Nonempty string | Landing-page title. |
| `permalink` | Registered page route | Stable URL, including `/` for home. |
| `layout` | `index` | The section/home layout. |
| `summary` | Nonempty string | One short introductory paragraph, rendered as plain text. |

Leave the Markdown body empty. Group labels, page links, link labels, order and desktop column counts come directly from `navigation.header` in `_config.yml`, using the menu entry with the index's `permalink`. The homepage and section landings use `_data/landing.yml` for source-backed starting points, group descriptions, featured canonical routes and next actions. News and events are generated from their collections. The homepage retains the five top-level section links and original title and summary; section pages retain their complete grouped browse links. Edit the navigation configuration to change those browse lists rather than maintaining another complete copy.

Indexes render with semantic headings, navigation and lists; they need no JavaScript. Browse groups use the configuration's three or four columns on desktop, two on tablet and one on mobile. Source-backed route lists and optional featured sections use shared includes; no authoring inspectors or raw relationship panels appear. The homepage uses the shared card include for approved case studies, omitting placeholder artwork.

Optional index presentation properties are additive; existing index front matter
remains valid. They override the corresponding shared presentation value:

| Optional property | Type | Purpose |
| --- | --- | --- |
| `introductory_routes` | Array of canonical internal routes | Recommended starting points; an empty array omits the section. |
| `featured_routes` | Array of canonical internal routes | Featured resources; an empty array omits the section. |
| `section_description` | Nonempty string or `null` | Introductory description, falling back to the existing summary. |

The content validator checks recommended routes and descriptions. Titles,
summaries and first-paragraph previews are read from each linked source record.

Complete index example:

<!-- schema: index -->
```yaml
title: CHERI Alliance
permalink: /alliance/
layout: index
summary: Learn about the Alliance’s mission, governance and membership, and find the people, working groups and policies that support its work.
```

## Directory pages (`listing` schema)

| Required property | Type | Meaning |
| --- | --- | --- |
| `title` | Nonempty string | Directory title. |
| `permalink` | Registered page route | Directory URL. |
| `layout` | `list`, `news`, `events`, or `people` | `list` selects `listing.collection`; the other layouts select their named collection. Retained duplicate directories use `redirect`. |
| `listing` | Mapping | Include all three keys below. |
| `listing.collection` | Collection name or `null` | One of `people`, `news`, `organisations`, `events`, `academic-papers`, `hardware`, `software`, `working-groups`, `guides`, `policies`, `case-studies`, `reports`. Required as a value for `layout: list`; normally null for the three dedicated layouts. |
| `listing.status` | `past`, `upcoming`, or `null` | Event filtering only. |
| `listing.role` | `speaker`, `member`, `board`, or `null` | `speaker` and `board` require the people collection; `member` requires organisations. `board` uses the ordered person slugs in `_data/governing-board.yml`. |

Complete collection directory example:

<!-- schema: listing -->
```yaml
title: Papers
permalink: /academic-papers/
layout: list
listing:
  collection: academic-papers
  status: null
  role: null
```

Complete filtered directory example:

<!-- schema: listing -->
```yaml
title: Upcoming Events
permalink: /news-and-events/events-and-archive/upcoming-events/
layout: events
listing:
  collection: null
  status: upcoming
  role: null
```

Directory bodies contain introductory Markdown, followed by one automatically generated card list. Do not copy biographies, group descriptions, portraits or record links into a second hand-maintained list. Cards take their titles, dates, images and opening paragraph from the collection records; their action labels come from `_data/viewer.yml`. They use native lists, links and heading groups, and work without JavaScript.

The Governing Board directory uses `layout: list`, `listing.collection: people` and `listing.role: board`. Update `_data/governing-board.yml` when the membership changes; each slug must identify one canonical person record. The cards preserve roster order, use square portraits, and link to biographies. This display treatment does not mark non-speakers as speakers.

Working Groups uses `layout: list` and `listing.collection: working-groups`. Its complete directory is `/working-groups/`; `/groups/`, old `/groups/<slug>/` details and `/alliance/leadership/working-groups/` redirect to the new directory or record. Keep each group's description in its own `_working-groups` record.

The member directory's `member` role currently comes from `listing_presets` in `_data/viewer.yml`. Explicit `listing.role`/`listing.status` takes precedence over a preset. News and past-event archives are newest first; other event lists are earliest first; other collections sort by title. Canonical listings exclude records whose inherited `alternate` setting is true. `listing.status` is valid only for events.

Record properties render as an unboxed “At a glance” definition list. Events combine their start/end values into one When entry and retain both dates/times. Raw authoring properties are available in the audit at `/checks/`, rather than at the end of public articles.

## Redirect pages (`redirect` schema)

Use a small Markdown stub for an obsolete record or directory. Keep canonical
content in its collection or page; do not copy its body into the stub.

| Required property | Type | Meaning |
| --- | --- | --- |
| `title` | Nonempty string | Existing destination title. |
| `permalink` | Old registered route | Retained public URL. |
| `layout` | `redirect` | Native HTML refresh and normal destination link. |

<!-- schema: redirect -->
```yaml
title: Papers
permalink: /papers/
layout: redirect
```

Register the stub with `page_type: Redirect` in `_data/page-map.yml` and add its
source-to-destination mapping to `aliases` in `_data/viewer.yml`. Alias keys
retain the old URLs; values use the final canonical route, never another alias.
Existing content-schema source pages may also inherit a redirect layout from
`_config.yml`. Redirects work without JavaScript and provide a normal fallback
link. Navigation, relationships and Markdown links use canonical destinations.

## Inherited settings, aliases and generated properties

These are Jekyll settings used by the site, **not extra keys to add to a strict content schema**. Collection and ordinary-page layout overrides belong in `_config.yml` defaults; indexes and listings already have a required `layout` key.

| Setting/property | Where it belongs | Effect |
| --- | --- | --- |
| `layout` | `_config.yml` defaults, or the index/listing schema | `document` is the default detail layout. `index`, `list`, `news`, `events`, `people` and `redirect` are available page layouts. `default` is the outer HTML shell. |
| `parent` | Content front matter where supported; otherwise defaults and page map | Breadcrumb and section hierarchy. Collections inherit their directory route. |
| `alternate` | `_config.yml` defaults and `_data/page-map.yml` | Retains a source/alias URL but omits it from canonical directories and index child links. |
| `render_with_liquid` | `_config.yml` defaults | Defaults to `false`; Markdown code examples remain literal. Layouts/includes still use Liquid. |
| Alias source → destination | `aliases` in `_data/viewer.yml` | Supplies a canonical destination and alias notice. Destinations must exist and cannot themselves be aliases. |
| `layout: redirect` for an alias | `_config.yml` defaults, plus explicit layout on a listing page | Redirects using a native HTML refresh with an ordinary destination link as fallback. It works without JavaScript. Internal links should use the canonical route. |
| `url`, `collection`, `slug`, `path` | Generated by Jekyll | Do not author these in front matter. |
| `date` | Jekyll-generated document metadata | Not the site's supported publication field. Use `published_date`, event date fields, `updated_date` or `document_date` according to meaning. |

No `redirect_to`, `hero`, `image_alt`, `caption`, `tags`, `categories`, `published`, `lead` or unregistered `related.*` key is currently part of these schemas. Add a property to the schema, validator, rendering and this reference together before using it. Body images provide their own alt text and captions in Markdown/semantic HTML.

Distinct overviews and filtered directories are useful even when they link to the same collection: members versus all organisations, speakers versus all people, past/upcoming versus all events, or an explanatory working-group overview versus the group directory. Repeated full articles and bibliographies should share one canonical destination.

The older `/policies/privacy-policy/` text differs from `/policies/privacy/`. It remains a clearly labelled retained source version, outside the canonical policy listing; its wording has not been merged into the current policy.

## Verified image provenance

`_data/image-sources.yml` records the source page, asset URL, retrieval date and
SHA-256 for newly obtained original organisation artwork. Validation checks the
local bytes against these hashes. The audit exposes this as computed
`image_source` metadata, alongside the effective inherited `layout`; neither is
an extra authoring key. The supplied Alliance vector is unchanged in
`assets/brand/` and its organisation record directory. Earlier bitmap-to-SVG
background treatments remain reproducible using
`scripts/prepare_organisation_logos.py --check`.

## Complete collection examples

These examples use existing records and preserve their full required field
shape. Replace factual values for another record; retain required nested keys,
use `null` or `[]` when unknown, and add only documented optional properties.
Placeholder paths refer to valid local assets, not factual illustrations.

### `people`

<!-- schema: people -->
```yaml
title: Adam Finney
image_url: /assets/people/adam-finney/4600c140bf-portrait.jpg
website_url: https://cheri-alliance.org/events/speakers/adam-finney/
is_speaker: true
social:
  linkedin_url: null
  mastodon_url: null
  github_url: null
related:
  organisations:
  - cheri-alliance
  - 3bian
  working-groups:
  - marketing
```

### `news`

<!-- schema: news -->
```yaml
title: Combatting the AI threat with CHERI
image_url: /assets/news/combatting-the-ai-threat-with-cheri/13658ea5e276-hero.png
published_date: '2026-06-17'
authors: []
related:
  working-groups: []
  organisations:
  - cheri-alliance
  - um-labs
  hardware:
  - morello
  software:
  - cheri-linux
  - cheribsd
  - freebsd
  academic-papers: []
```

### `organisations`

<!-- schema: organisations -->
```yaml
title: CHERI Alliance
image_url: /assets/organisations/cheri-alliance/logo.svg
website_url: https://cheri-alliance.org/
membership_tier: null
is_founding_member: null
social:
  linkedin_url: https://www.linkedin.com/company/cheri-alliance
  mastodon_url: null
  github_url: null
```

### `events`

<!-- schema: events -->
```yaml
title: CHERI Alliance at Embedded World 2026
image_url: /assets/events/embedded-world-2026/4e96ccb7b522-embedded-world-2026.webp
website_url: https://cheri-alliance.org/events/embedded-world-2026/
registration_url: null
start_date: '2026-03-10'
start_datetime: null
end_date: '2026-03-12'
end_datetime: null
location: Exhibition Centre Nuremberg, Germany
speakers: []
related:
  working-groups: []
  organisations:
  - capabilities-limited
  - the-capable-hub
  - cheri-alliance
  - codasip
  academic-papers: []
```

### `academic-papers`

<!-- schema: academic-papers -->
```yaml
title: 'CHERIoT: Complete Memory Safety for Embedded Devices'
image_url: /assets/academic-papers/cheriot-complete-memory-safety-for-embedded-devices/placeholder.svg
publication_url: https://www.cl.cam.ac.uk/research/security/ctsrd/pdfs/202310ieeemicro-cheriot-uarch.pdf
published_year: 2023
authors:
- saar-amar
- david-chisnall
- tony-chen
- nathaniel-wesley-filardo
- ben-laurie
- kunyan-liu
- robert-m-norton
- simon-moore
- yucong-tao
- robert-watson
- hongyan-xia
related:
  working-groups: []
  hardware:
  - cheriot
  software: []
```

### `hardware`

<!-- schema: hardware -->
```yaml
title: X730 Certification Record
image_url: /assets/hardware/x730/c53c4c1378ba-cheri-enabled-2026.webp
website_url: https://codasip.com/solutions/riscv-processor-safety-security/cheri/x730-risc-v-application-processor/
repository_urls: []
type: processor
architecture: RISC-V (64-bit)
status: null
related:
  organisations:
  - codasip
  hardware: []
  software:
  - llvm-and-clang
  - rust
version: '1.0'
certification: cheri-enabled
certification_url: https://cheri-alliance.org/cheri-enabled/x730/
summary: A commercially licensable 64-bit CHERI-RISC-V application processor IP designed for larger systems that
  require operating-system support and protection of substantial software stacks.
```

### `software`

<!-- schema: software -->
```yaml
title: CheriBSD
image_url: /assets/software/cheribsd/placeholder.svg
website_url: https://www.cheribsd.org/getting-started/
repository_urls:
- https://github.com/CTSRD-CHERI/cheribuild
- https://github.com/CTSRD-CHERI/cheribsd
- https://github.com/CTSRD-CHERI/cheribsd-ports
type: null
status: null
related:
  organisations:
  - freebsd-foundation
  hardware:
  - morello
  software:
  - llvm-and-clang
  - freebsd
```

### `working-groups`

<!-- schema: working-groups -->
```yaml
title: 🐧 CHERI Linux WG
image_url: /assets/working-groups/cheri-linux-working-group/bb889a4dc09e-cheri-alliance-working-groups.png
website_url: https://cheri-alliance.org/who-we-are/working-groups/cheri-linux/
repository_urls:
- https://github.com/CHERI-Alliance/linux
leads:
- allison-randal
related:
  organisations:
  - capabilities-limited
  hardware: []
  software:
  - cheri-linux
```

### `guides`

<!-- schema: guides -->
```yaml
title: Build Compartments
image_url: /assets/guides/build-compartments/placeholder.svg
repository_urls: []
updated_date: null
authors: []
related:
  working-groups: []
  hardware:
  - cheriot
  software:
  - cheribsd
```

### `policies`

<!-- schema: policies -->
```yaml
title: Competition Law Statement
image_url: /assets/policies/competition-law-statement/placeholder.svg
author: null
version: '1.0'
document_date: 2024-08
document_url: https://cheri-alliance.org/legal-competition/
```

### `case-studies`

<!-- schema: case-studies -->
```yaml
title: 'Morello: a complete experimental stack'
image_url: /assets/case-studies/morello/bfeebb3ac676-morello-board.webp
summary: CHERI at application and server scale
related:
  organisations:
  - arm
  hardware:
  - morello
  software:
  - cheribsd
  reports: []
```

### `reports`

<!-- schema: reports -->
```yaml
title: An Introduction to CHERI
image_url: /assets/reports/an-introduction-to-cheri/placeholder.svg
publication_url: https://www.cl.cam.ac.uk/techreports/UCAM-CL-TR-941.html
published_year: 2019
publication_type: technical-report
publisher: University of Cambridge
authors:
- robert-watson
- simon-moore
- peter-sewell
- peter-g-neumann
related:
  organisations:
  - university-of-cambridge
  case-studies: []
  hardware: []
  software: []
```

## Adding or changing content

1. Copy the complete shape for the appropriate schema from `_data/schemas.yml`, fill confirmed values, and retain null/empty keys.
2. Store assets in the owning record directory, write useful alt text, and format prose, lists and captions semantically.
3. Register the URL and parent in `_data/page-map.yml`. Update navigation in `_config.yml` only when a menu link is needed.
4. Use existing slugs for typed relationships; link to canonical URLs rather than repeating another record's content.
5. Run `bundle exec ruby scripts/check_content.rb`, then `JEKYLL_ENV=production bundle exec jekyll build --destination _site`, `python3 scripts/check_collection_links.py` and `python3 scripts/check_page_content.py`.

The validator refreshes `_data/checks.yml`, `_data/relationships.yml` and the audit reports. Do not hand-edit generated reverse relationships. This reference is excluded from the built website and remains available in the repository.
