# Front matter reference

This is the authoring reference for all ten collections and the three common page schemas. The executable field shapes are in [`_data/schemas.yml`](_data/schemas.yml); [`scripts/check_content.rb`](scripts/check_content.rb) validates them. Rendering, aliases, role relationships and listing presets are defined in [`_data/viewer.yml`](_data/viewer.yml) and [`_config.yml`](_config.yml).

## Required keys and optional values

Each document starts with a YAML block between two `---` lines. **Include every key in its collection or page schema**, including nested keys. An unused scalar is `null`; an unused list is `[]`. A key being required does not mean its value must be populated. `title` must be nonempty, pages need their registered `permalink`, and events need exactly one start date or start datetime.

The three **shared optional properties** below may be omitted entirely, or supplied alongside any collection or page schema. Unknown extra properties fail validation. Populated metadata on article and record pages renders as a semantic definition list, with reference lists and resource navigation. Index pages show their title, summary and page list. Image paths supply the displayed image without adding an original-image download link. Empty metadata and resource sections are omitted.

Keep human-readable article content in the body; keep record-level versions, dates, resource URLs and relationships in front matter.

Shared metadata and body property lists use the same label/value rows, with subtle dividers and stacked labels at 640px and below. For additional factual details that belong to the article, use Kramdown's native definition-list syntax:

```markdown
Group type
: Technical
{: .record-properties }
```

Do not repeat a front-matter property in the body unless it adds useful detail. Event status is derived from the final event date at build time, matching the past/upcoming directories; do not maintain a separate `Status: Upcoming` line.

| Shared property | Type | Meaning and rendering |
| --- | --- | --- |
| `version` | Quoted string or `null` | The document, product or record version; displayed as Version. Use `"1.01"`, not a YAML number. Versions of individual ISA extensions remain with their technical descriptions. |
| `document_date` | Quoted `YYYY-MM` or `YYYY-MM-DD` string, or `null` | The source document's stated date; displayed as Document date. `"2024-08"` displays **August 2024**, preserving month precision. This is separate from publication, event and editorial update dates. |
| `document_url` | HTTP(S) URL, existing root-relative asset path, or `null` | The official document, normally a PDF; displayed as an Official document resource link. Local files must exist. |

Use quoted strings for dates and URLs where YAML punctuation could be ambiguous. Ordinary `*_date` fields require a complete valid `YYYY-MM-DD` date. `*_datetime` fields require ISO 8601 with `Z` or a numeric timezone offset, for example `"2026-01-21T09:00:00+00:00"`. Only `document_date` accepts a month without a day. Do not guess missing dates or invent an effective date from a document's publication date.

## Fields shared by collection records

Every collection has these two required keys, in addition to its own keys listed below:

| Property | Type | Meaning |
| --- | --- | --- |
| `title` | Nonempty string | Human-readable record title. |
| `image_url` | Root-relative asset path | Primary image, stored at `/assets/<collection>/<record-name>/<filename>`. Use neither an underscore on the collection nor `.md` on the record name. Each collection record currently requires an existing local image, including a labelled `placeholder.svg` when the source provides none. |

Collection slugs come from Markdown filenames: `_people/adam-finney.md` becomes `/people/adam-finney/`. Do not put `slug` or `permalink` in collection front matter. Add the record to `_data/page-map.yml` when creating a new file.

Images render in contained 3:1 frames; speaker portraits and the board's portrait cards render in 1:1 frames. Asset bytes retain their original proportions. Placeholder assets remain fallbacks in record headers; directories omit placeholder images and repeated generic group illustrations so that useful text leads the cards. Images do not generate metadata links or empty panels. Image alignment classes belong in Markdown, not front matter: `.image-left`, `.image-right`, `.image-full`, `.image-logo`, `.image-icon` and `.image-portrait`. Keep consecutive photos, logos and portraits in an appropriate gallery; preserve captions with `figure`/`figcaption`.

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
| `related.groups` | Slug array | Related working groups. |

## News (`_news`)

| Additional property | Type | Meaning |
| --- | --- | --- |
| `published_date` | Full date or `null` | Publication date. Dated news sorts newest first; undated records follow it. |
| `authors` | People slug array | Named authors, with links back to their authored news. |
| `related` | Mapping | Include all five keys below. |
| `related.groups` | Slug array | Relevant working groups. |
| `related.organisations` | Slug array | Relevant organisations. |
| `related.hardware` | Slug array | Relevant hardware. |
| `related.software` | Slug array | Relevant software. |
| `related.papers` | Slug array | Relevant publications. |

An event mentioned in news can be linked in the body; `related.events` is not currently a news-schema property.

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
| `related.groups` | Slug array | Participating working groups. |
| `related.organisations` | Slug array | Participating organisations. |
| `related.papers` | Slug array | Relevant publications. |

Events and upcoming events sort by start time/date, earliest first; past-event archives show the newest first. Past/upcoming filters compare the final event day (end, falling back to start) with the build date. An event whose final day is today remains upcoming. This is a build-time filter, not a continuously running browser clock.

## Papers (`_papers`)

| Additional property | Type | Meaning |
| --- | --- | --- |
| `publication_url` | URL or `null` | DOI, publisher record or original paper. |
| `published_year` | Integer from 1000 to 9999, or `null` | Publication year, displayed on detail pages and cards. |
| `authors` | People slug array | Paper authors. Keep any full bibliographic citation in the body. |
| `related` | Mapping | Include all three keys below. |
| `related.groups` | Slug array | Relevant working groups. |
| `related.hardware` | Slug array | Referenced hardware. |
| `related.software` | Slug array | Referenced software. |

The canonical bibliography is `/papers/`; do not maintain a second list of the same citations in a general page.

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

## Groups (`_groups`)

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
| `related.groups` | Slug array | Relevant working groups. |
| `related.hardware` | Slug array | Referenced hardware. |
| `related.software` | Slug array | Referenced software. |

## Policies (`_policies`)

| Additional property | Type | Meaning |
| --- | --- | --- |
| `author` | One people slug or `null` | A named individual author, if provided by the source. Do not put an organisation name here. |

Policies also support the three shared optional properties. Preserve the source's legal wording and clause identifiers. Use semantic ordered lists for numbered clauses and lettered lists; do not turn `2.1.1` into a bullet with an unrelated visible `1.` marker.

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
| `related.groups` | Slug array | Groups. |
| `related.news` | Slug array | News. |
| `related.events` | Slug array | Events. |
| `related.papers` | Slug array | Papers. |
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
next_page_url: /alliance/leadership/working-groups/
related:
  pages: []
  people: []
  organisations: []
  groups: []
  news: []
  events: []
  papers: []
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

Leave the Markdown body empty. Group labels, page links, link labels, order and desktop column counts come directly from `navigation.header` in `_config.yml`, using the menu entry with the index's `permalink`. The home index lists the five top-level section links. Other indexes show their mega-menu's grouped child links, including pages in collections. Edit the menu to change these lists; do not maintain a second set in page content or `sections` front matter.

Indexes render with `hgroup`, `nav`, `ul` and `li`; they need no JavaScript. Group lists use the menu's three or four columns on desktop, two on tablet and one on mobile. Index pages do not add hero images, collection overviews, front-matter inspectors or related-record panels.

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
| `listing.collection` | Collection name or `null` | One of `people`, `news`, `organisations`, `events`, `papers`, `hardware`, `software`, `groups`, `guides`, `policies`. Required as a value for `layout: list`; normally null for the three dedicated layouts. |
| `listing.status` | `past`, `upcoming`, or `null` | Event filtering only. |
| `listing.role` | `speaker`, `member`, `board`, or `null` | `speaker` and `board` require the people collection; `member` requires organisations. `board` uses the ordered person slugs in `_data/governing-board.yml`. |

Complete collection directory example:

<!-- schema: listing -->
```yaml
title: Papers
permalink: /papers/
layout: list
listing:
  collection: papers
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

Working Groups uses `layout: list` and `listing.collection: groups`. Its complete directory is `/alliance/leadership/working-groups/`; `/groups/` redirects there. Keep each group's description in its own `_groups` record.

The member directory's `member` role currently comes from `listing_presets` in `_data/viewer.yml`. Explicit `listing.role`/`listing.status` takes precedence over a preset. News and past-event archives are newest first; other event lists are earliest first; other collections sort by title. Canonical listings exclude records whose inherited `alternate` setting is true. `listing.status` is valid only for events.

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

No `redirect_to`, `hero`, `image_alt`, `caption`, `tags`, `categories`, `published`, `lead` or arbitrary `related.*` key is currently part of these schemas. Add a property to the schema, validator, rendering and this reference together before using it. Body images provide their own alt text and captions in Markdown/semantic HTML.

Distinct overviews and filtered directories are useful even when they link to the same collection: members versus all organisations, speakers versus all people, past/upcoming versus all events, or an explanatory working-group overview versus the group directory. Repeated full articles and bibliographies should share one canonical destination.

The older `/policies/privacy-policy/` text differs from `/policies/privacy/`. It remains a clearly labelled retained source version, outside the canonical policy listing; its wording has not been merged into the current policy.

## Adding or changing content

1. Copy the complete shape for the appropriate schema from `_data/schemas.yml`, fill confirmed values, and retain null/empty keys.
2. Store assets in the owning record directory, write useful alt text, and format prose, lists and captions semantically.
3. Register the URL and parent in `_data/page-map.yml`. Update navigation in `_config.yml` only when a menu link is needed.
4. Use existing slugs for typed relationships; link to canonical URLs rather than repeating another record's content.
5. Run `bundle exec ruby scripts/check_content.rb`, then `JEKYLL_ENV=production bundle exec jekyll build --destination _site`, `python3 scripts/check_collection_links.py` and `python3 scripts/check_page_content.py`.

The validator refreshes `_data/checks.yml`, `_data/relationships.yml` and the audit reports. Do not hand-edit generated reverse relationships. This reference is excluded from the built website and remains available in the repository.
