# Front matter reference

Use native Markdown for article content and a small YAML block for facts, destinations and relationships. `_data/schemas.yml` lists allowed fields and its `required` mapping lists the mandatory fields. `scripts/check_content.rb` validates authored data independently of Jekyll defaults. `DESIGN.MD` documents presentation.

## Minimal authoring contract

- Every record needs a nonempty string `title`.
- Ordinary pages need a registered `permalink`. Indexes additionally need `layout: index` and a nonempty `summary`; directory pages need their layout. Redirect pages need `layout: redirect`.
- Events need exactly one of `start_date` or `start_datetime`. If an end is known, use at most one of `end_date` or `end_datetime`.
- Reports additionally need `publication_url`, `publication_type` and `publisher`.
- Everything else is optional unless a populated field creates a genuine dependency, such as `certification` requiring `certification_url`.

Omit unused fields and nested entries. Do not write `null`, `[]`, `{}` or blank strings as scaffolding. Meaningful `false` values remain valid. Unknown keys, malformed URLs/dates, duplicate references and unresolved targets fail validation.

Use lowercase snake_case for field names, `*_url` for a single destination and plural names for arrays. Inherit layouts and default parents from `_config.yml`. Do not author Jekyll-generated `url`, `collection`, `slug` or `path` properties. Collection slugs come from filenames; collection records do not need `permalink`.

## Collections and routes

Collection names, folders, record routes and asset folders share the same spelling. Hyphenated names are valid; use Liquid bracket access, for example `site['academic-papers']`. Generated internal links must use `relative_url`.

| Collection | Source folder | Directory |
| --- | --- | --- |
| people | `_people` | `/people/` |
| news | `_news` | `/news/` |
| organisations | `_organisations` | `/organisations/` |
| events | `_events` | `/events/` |
| academic-papers | `_academic-papers` | `/academic-papers/` |
| hardware | `_hardware` | `/hardware/` |
| software | `_software` | `/software/` |
| working-groups | `_working-groups` | `/working-groups/` |
| guides | `_guides` | `/guides/` |
| policies | `_policies` | `/policies/` |
| case-studies | `_case-studies` | `/case-studies/` |
| reports | `_reports` | `/reports/` |

Records use `/<collection>/<slug>/`; genuine record images use `/assets/<collection>/<slug>/<filename>`. Add new records and pages to `_data/page-map.yml`. Keep canonical routes and existing redirect aliases; do not maintain duplicate bibliographies or product directories. White papers belong in `_reports` with `publication_type: white-paper`.

## Shared optional fields

| Field | Type and purpose |
| --- | --- |
| `summary` | Short plain-text introduction. Optional on records and ordinary pages; required on indexes. Prefer existing wording. Avoid repeating it verbatim in the body. |
| `version` | Nonempty quoted string such as `"1.01"`; record/document/product version. Individual extension versions stay in technical prose. |
| `document_date` | Quoted `YYYY-MM` or `YYYY-MM-DD`; retain source precision. A month is displayed as a month, not an invented day. |
| `document_url` | HTTP(S) URL or existing root-relative document asset. |
| `image_background` | `dark`, only when genuine light artwork requires a contrasting frame. |
| `parent` | Registered route that agrees with the page map; omit when defaults supply it. |
| `next_page_url` | Registered route or HTTP(S) destination. Existing route data supplies the visible destination title. |
| `related` | Mapping of known collection names to nonempty arrays of existing slugs. `related.pages` contains registered routes instead. |
| `website_label` | Optional meaningful destination label when a `website_url` cannot be accurately described by shared collection defaults. Supported on collections with `website_url`; requires that URL. Do not add an override to every record. |

Ordinary `*_date` values must be valid complete `YYYY-MM-DD` dates. `*_datetime` values must use ISO 8601 with `Z` or a numeric timezone offset. Quote them, for example `"2026-01-21T09:00:00+00:00"`. Only `document_date` accepts month precision. Do not infer missing dates, maturity, membership, certification or speaker status from a mention elsewhere.

## Collection-specific fields

`image_url` is optional on every collection and ordinary content pages. Include it only for a supplied genuine image. Missing images need no placeholder field or asset. Preserve original artwork and image provenance; existing unreferenced placeholder files may remain in the repository.

| Collection | Supported facts and resources |
| --- | --- |
| people | `website_url`, `is_speaker`, `social`, `related` affiliations and groups |
| news | `published_date`, `authors`, `related` |
| organisations | `website_url`, `membership_tier`, `is_founding_member`, `social` |
| events | `website_url`, `registration_url`, start/end date or datetime, `location`, `speakers`, `related` |
| academic-papers | `publication_url`, `published_year`, `authors`, `related` |
| hardware | `website_url`, `repositories`, `type`, `architecture`, `status`, `certification`, `certification_url`, `related` |
| software | `website_url`, `repositories`, `type`, `status`, `related` |
| working-groups | `website_url`, `repositories`, `leads`, `related` |
| guides | `repositories`, `updated_date`, `authors`, `related` |
| policies | `authors` |
| case-studies | `related` |
| reports | `publication_url`, `published_year`, `publication_type`, `publisher`, `authors`, `related` |

`authors`, `speakers` and `leads` are nonempty arrays of `_people` slugs. Policy authors use the same `authors` array as other authored content. Keep full bibliographic citations in the body, including their original author names and publication information. Do not repeat a citation as a directory preview.

`published_year` is an integer from 1000 to 9999. `membership_tier` is `full` or `community`; `is_founding_member` and `is_speaker` are booleans. Membership listings require a confirmed tier; founding status alone does not imply membership. `publication_type` is `report`, `white-paper`, `policy-paper` or `technical-report`. Hardware `certification` is `cheri-enabled`, supported by an authoritative `certification_url` for the specific product/version.

`social` may contain `linkedin_url`, `mastodon_url` and `github_url`; include only populated entries. Other detailed factual properties, legal wording and product-specific configurations remain in the body, using native definition lists where appropriate.

## Named repositories and actions

Use one `repositories` array. Each entry needs only `label` and `url`; labels explain the destination without numbering. Keep single semantic destinations in their existing URL fields. Shared display labels and priorities live in `_data/viewer.yml` and `_includes/resources.html`.

```yaml
repositories:
- label: Build tools (cheribuild)
  url: https://github.com/CTSRD-CHERI/cheribuild
- label: CheriBSD source
  url: https://github.com/CTSRD-CHERI/cheribsd
website_url: https://www.cheribsd.org/getting-started/
website_label: Get started with CheriBSD
```

Do not maintain parallel labels/URLs, numbered repository keys, duplicated resource lists or per-record button styling. Body links that explain a particular passage and full citations may remain even when a destination is also an action.

## Relationships and browsing

Only author verified forward relationships. Refer to collection slugs without a prefix or `.md`; `related.pages` instead uses full registered routes with leading/trailing slashes. Omit empty groups.

The validator resolves aliases, generates reverse links, merges duplicate destinations, preserves meaningful roles and sorts dated content. Do not hand-edit `_data/relationships.yml`. Public pages show a small selection under Explore next; remaining destinations remain available in a native disclosure. Audit edges retain provenance.

Use plain descriptive titles; working-group names spell out Working Group and omit decorative emoji. Directory presentation belongs to `_data/viewer.yml`, not record front matter. Dense directories use compact rows; visual collections and the ordered governing board use cards. People and organisation directories progressively enhance native lists with search. Without JavaScript, every record remains available. News sorts newest first; general events show upcoming items before a newest-first archive. Date filters use the final event day at build time in Europe/London.

## Ordinary, index, directory and redirect pages

Ordinary pages need only title and permalink, plus useful optional values. Native body property lists use Kramdown syntax:

```markdown
Group type
: Technical
{: .record-properties }
```

Indexes keep their Markdown body empty. The menu in `_config.yml` supplies routes, group labels and order. Home destination descriptions reuse the section index summaries; no second navigation tree is maintained.

For `layout: list`, supply `listing.collection`. Dedicated `people`, `events` and `news` layouts already select their collection. Optional `listing.role` is `speaker`, `member` or `board`; optional `listing.status` is `upcoming` or `past` for events. Board order comes from `_data/governing-board.yml`; members require `membership_tier`; speaker lists require `is_speaker: true`. A certified-product list additionally uses `certification: cheri-enabled` with `listing.collection: hardware`.

Alias destinations live in `_data/viewer.yml`. Use an existing canonical route in internal links. Native redirects retain an ordinary destination link without JavaScript. `alternate` and `render_with_liquid` belong in `_config.yml` defaults and the page map, rather than repeated front matter.

## Images and content

Use original images and verified portraits with contained proportions: portraits are square, other primary images use a 3:1 frame, logos retain transparent frames, and `image_background: dark` preserves light artwork. Case-study body illustrations do not need a duplicate lead image.

Use native image classes in Markdown: `.image-left`, `.image-right`, `.image-full`, `.image-logo`, `.image-icon`, `.image-portrait`. Reset left/right alternation for each document. Preserve figures/captions, original technical diagrams, ordered legal clauses and clause identifiers. Keep groups of related images in a responsive gallery. See DESIGN.MD for the image viewer and responsive layout rules.

Verified original logo hashes and treatments live in `_data/image-sources.yml` and `_data/organisation-logos.json`. Validate them with `python3 scripts/prepare_organisation_logos.py --check`.

## Field migration

| Previous authoring | Current authoring |
| --- | --- |
| Every schema key, including empty values | Only required and useful populated optional fields |
| `repository_urls: [url, ...]` | `repositories: [{label: name, url: destination}, ...]` |
| Singular policy `author` | `authors: [people-slug]` |
| Placeholder `image_url` for missing artwork | Omit `image_url` |
| Generic website label for an exceptional destination | Optional `website_label` with the existing `website_url` |
| Duplicate forward/reverse display groups | One generated canonical destination with retained role context |

The completed migration is idempotent. `python3 scripts/normalise_front_matter.py --write` can migrate an older source copy; this maintenance command requires PyYAML. Its default mode reports remaining changes without writing. Normal authoring and validation use the standard Ruby/Jekyll toolchain.

## Examples

These examples are executed by the content validator. Their populated values illustrate supported fields; optional keys can be omitted when not needed.

### people

<!-- schema: people -->
```yaml
title: Adam Finney
image_url: /assets/people/adam-finney/4600c140bf-portrait.jpg
website_url: https://cheri-alliance.org/events/speakers/adam-finney/
is_speaker: true
related:
  organisations:
  - cheri-alliance
  - 3bian
  working-groups:
  - marketing
```

### news

<!-- schema: news -->
```yaml
title: Combatting the AI threat with CHERI
image_url: /assets/news/combatting-the-ai-threat-with-cheri/13658ea5e276-hero.png
published_date: '2026-06-17'
related:
  organisations:
  - cheri-alliance
  - um-labs
  hardware:
  - morello
  software:
  - cheri-linux
  - cheribsd
  - freebsd
```

### organisations

<!-- schema: organisations -->
```yaml
title: CHERI Alliance
image_url: /assets/organisations/cheri-alliance/logo.svg
website_url: https://cheri-alliance.org/
social:
  linkedin_url: https://www.linkedin.com/company/cheri-alliance
```

### events

<!-- schema: events -->
```yaml
title: CHERI Alliance at Embedded World 2026
image_url: /assets/events/embedded-world-2026/4e96ccb7b522-embedded-world-2026.webp
website_url: https://cheri-alliance.org/events/embedded-world-2026/
start_date: '2026-03-10'
end_date: '2026-03-12'
location: Exhibition Centre Nuremberg, Germany
related:
  organisations:
  - capabilities-limited
  - the-capable-hub
  - cheri-alliance
  - codasip
```

### academic-papers

<!-- schema: academic-papers -->
```yaml
title: 'CHERIoT: Complete Memory Safety for Embedded Devices'
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
  hardware:
  - cheriot
```

### hardware

<!-- schema: hardware -->
```yaml
title: X730 Certification Record
image_url: /assets/hardware/x730/c53c4c1378ba-cheri-enabled-2026.webp
website_url: https://codasip.com/solutions/riscv-processor-safety-security/cheri/x730-risc-v-application-processor/
type: processor
architecture: RISC-V (64-bit)
related:
  organisations:
  - codasip
  software:
  - llvm-and-clang
  - rust
version: '1.0'
certification: cheri-enabled
certification_url: https://cheri-alliance.org/cheri-enabled/x730/
summary: A commercially licensable 64-bit CHERI-RISC-V application processor IP designed for larger systems that require operating-system support and protection of substantial software stacks.
```

### software

<!-- schema: software -->
```yaml
title: CheriBSD
website_url: https://www.cheribsd.org/getting-started/
related:
  organisations:
  - freebsd-foundation
  hardware:
  - morello
  software:
  - llvm-and-clang
  - freebsd
repositories:
- label: Build tools (cheribuild)
  url: https://github.com/CTSRD-CHERI/cheribuild
- label: CheriBSD source
  url: https://github.com/CTSRD-CHERI/cheribsd
- label: CheriBSD ports
  url: https://github.com/CTSRD-CHERI/cheribsd-ports
website_label: Get started with CheriBSD
```

### working-groups

<!-- schema: working-groups -->
```yaml
title: 🐧 CHERI Linux WG
image_url: /assets/working-groups/cheri-linux-working-group/bb889a4dc09e-cheri-alliance-working-groups.png
website_url: https://cheri-alliance.org/who-we-are/working-groups/cheri-linux/
leads:
- allison-randal
related:
  organisations:
  - capabilities-limited
  software:
  - cheri-linux
repositories:
- label: CHERI Linux source
  url: https://github.com/CHERI-Alliance/linux
```

### guides

<!-- schema: guides -->
```yaml
title: Build Compartments
related:
  hardware:
  - cheriot
  software:
  - cheribsd
```

### policies

<!-- schema: policies -->
```yaml
title: Competition Law Statement
version: '1.0'
document_date: 2024-08
document_url: https://cheri-alliance.org/legal-competition/
```

### case-studies

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
```

### reports

<!-- schema: reports -->
```yaml
title: An Introduction to CHERI
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
```

### content

<!-- schema: content -->
```yaml
title: Documentation & Guides
permalink: /discover/resources/documentation-and-guides/
summary: Publications and guidance from the CHERI Alliance.
parent: /discover/
next_page_url: /working-groups/
```

### index

<!-- schema: index -->
```yaml
title: CHERI Alliance
permalink: /alliance/
layout: index
summary: Learn about the Alliance’s mission, governance and membership, and find the people, working groups and policies that support its work.
```

### listing

<!-- schema: listing -->
```yaml
title: Upcoming Events
permalink: /news-and-events/events-and-archive/upcoming-events/
layout: events
listing:
  status: upcoming
```

### redirect

<!-- schema: redirect -->
```yaml
title: Papers
permalink: /papers/
layout: redirect
```

## Validate changes

1. Register source files and canonical routes in `_data/page-map.yml`.
2. Run `bundle exec ruby scripts/check_content.rb` and `bundle exec ruby scripts/test_content_model.rb`.
3. Build with `JEKYLL_ENV=production bundle exec jekyll build --destination _site`.
4. Run `python3 scripts/check_collection_links.py` and `python3 scripts/check_page_content.py`.
5. Follow README.md and the Pages workflow for root/baseurl browser, navigation and image checks.

The validator refreshes `_data/checks.yml`, `_data/relationships.yml` and audit reports. Do not hand-edit generated outputs. Add any new property to the allowed schema, value validation, rendering and this reference together; no presentation fields are supported in record front matter.
