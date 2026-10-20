# Authoring the CHERI catalogue

Content lives in Markdown records. YAML front matter supplies the title, introduction, facts, images and resource actions; the body supplies the article or biography. Layouts generate breadcrumbs, cards, metadata and related records. Jekyll builds in safe mode without a custom plugin.

## Common fields

| Field | Use |
| --- | --- |
| `title` | Canonical record name. Do not repeat it as an H1 in the body. |
| `display_title` | Optional retained source heading where it differs from the record name; new records normally need only `title`. |
| `summary` | A short, factual introduction. Basic Markdown links/emphasis are supported. Cards use a plain-text preview. |
| `thumbnail` | An object containing `src`, `alt`, and preferably intrinsic `width`/`height`. Use `fit: contain` for logos and diagrams. |
| `thumbnail_in_body` | Set `true` when that image already appears in its editorial context. Cards can reuse it without adding a second lead image. |
| `links` | Resource entries with `label`, `url`, `kind`; at most one may have `primary: true`. |
| `organization` | An ordered array of `_organisations` filename slugs. Use `organization_label` when only a name is known and no organisation record exists. |
| `authors`, `speakers` | Ordered arrays of `_people` filename slugs. Never silently reorder authors. |
| `alternate`, `canonical_url` | Keep an older record accessible while excluding it from directories and pointing readers/search engines to its current version. |
| `where-next`, `related-pages` | Existing structured navigation references. No copied card markup is needed. |

For example:

```yaml
links:
  - label: Download official PDF
    url: /assets/shared/source-assets/1ef747d8f739-ip-policy.pdf
    kind: document
    primary: true
```

Use `website`, `repository`, `publication`, `document`, `registration`, `slides`, `video`, `profile`, `location`, or `resource` as appropriate. `navigation` is reserved for directory back-links.

Quote versions (`"1.01"`, `"1.0"`) and date strings. Preserve date precision: `"2024-08"` means August 2024, not the first day of August. A publication with only a known year uses an integer `year`. Timed events retain their explicit offset in `start_datetime`, for example `2026-09-09T14:00:00+01:00`.

## Collection examples

These short examples show the relevant fields; add a sourced summary, thumbnail and links where useful. The complete display-field definitions live in `_data/catalog.yml`.

People (`_people/mike-eftimakis.md`):

```yaml
title: Mike Eftimakis
organization: [cheri-alliance]
speaker: true
board_role: Founding Director
```

Organisations (`_organisations/axiomise-ltd.md`):

```yaml
title: Axiomise Ltd
member: true
membership_status: Member
membership_category: Full Member
```

News (`_news/a-new-etsi-standard-could-rewrite-the-memory-safety-debate.md`):

```yaml
title: A new ETSI standard could rewrite the memory-safety debate
date: '2026-07-29T17:07:00+01:00'
authors: [mike-eftimakis]
tags: [Ecosystem, Government / Regulation]
```

Events (`_events/cheritech26.md`):

```yaml
title: "CHERITech'26"
start_date: "2026-11-12"
end_date: "2026-11-13"
format: Conference
series: CHERITech
```

Add a sourced `location`, `speakers`, and registration links. `date_note` can preserve a more detailed schedule, such as separate tutorial or exhibition dates. Event timing status is derived at build time from the complete date range. Only use `event_state: cancelled` or `event_state: postponed` when confirmed. The scheduled daily build refreshes the static date-dependent directories.

Papers (`_papers/cheriot-complete-memory-safety-for-embedded-devices.md`):

```yaml
title: 'CHERIoT: Complete Memory Safety for Embedded Devices'
year: 2023
venue: IEEE/ACM MICRO 2023
authors: [saar-amar, david-chisnall, tony-chen, nathaniel-wesley-filardo, ben-laurie, kunyan-liu, robert-m-norton, simon-moore, yucong-tao, robert-watson, hongyan-xia]
```

Preserve the original complete citation in `citation`, including its author spellings and ordering. Put the publication URL in `links` with `kind: publication`. Authors appear in the main reading column so long lists do not make the facts panel excessively tall.

Hardware (`_hardware/x730.md`):

```yaml
title: X730 Certification Record
record_type: Certification record
organization: [codasip]
product_name: X730-MP4-Lux
version: "1.0"
certification:
  date: "2026-03-26"
  programme_version: "1.0"
  derivative: false
```

Other supported facts include `product_type`, `reference`, `architecture`, and `organization_type`. A general platform overview uses `record_type: Platform overview`. Do not infer certification from a product listing, and do not conflate product and certification programme versions. Keep detailed certification answers and scope statements in the body.

Software (`_software/cheribsd.md`):

```yaml
title: CheriBSD
software_type: Operating system
```

Optional sourced fields are `architectures`, `platforms` (arrays), `release_status`, and quoted `version`. Repository and documentation destinations belong in `links`. An overview discussing a platform does not by itself establish support for every platform it mentions.

Working groups (`_groups/certification-working-group.md`):

```yaml
title: ✅ Certification WG
group_type: Programme and ecosystem
collaboration_areas:
  - Certification criteria
  - Evidence and assurance needs
  - Programme development
```

The other existing group category is `Technical`. Participation/enquiry actions belong in `links`.

Guides (`_guides/build-compartments.md`):

```yaml
title: Build Compartments
topic: Compartmentalisation
```

Optional `platforms` and `prerequisites` are arrays. Keep instructions, comparisons and code examples in the body. Do not manufacture difficulty ratings, reading times, or prerequisites.

Policies (`_policies/intellectual-property-policy.md`):

```yaml
title: Intellectual Property Policy
version: "1.01"
document_date: "2024-08"
authoritative_format: PDF
```

Add the official document link. Preserve legal text and the notice explaining that the PDF is authoritative. `ip-policy` and `privacy-policy` retain their old routes as alternates of the current policy pages; the earlier trademark version remains retained too.

Reports (`_reports/digital-security-by-design-programme-outcomes.md`):

```yaml
title: Digital Security by Design Programme Outcomes
resource_type: Report or white paper
year: 2025
citation: Innovate UK. Programme outcomes report, 2025.
```

Reports are independent publications with their own detail pages. Corporate authors remain in the original citation; do not invent a person record for an organisation.

## Directories, resources and talks

Collection directories select records through `listing.collection`. The List/Grid controls share one set of cards; search, filters, sorting and the selected view are preserved across switches. Filters appear only when the records supply multiple useful values. Without JavaScript every record remains a normal link.

The speakers directory filters `speaker: true`, members filter `member: true`, and the board uses `_data/governing-board.yml` as its authoritative order. Upcoming/past events and the academic bibliography are views of their respective collections. Certified-product listings select records with certification metadata.

The general product catalogue keeps its 23 product/project entries in `product_entries` on its existing Markdown page, including category, organisation, type, release status and description. Entries with no published destination remain plain cards. Certification listings query the Hardware collection instead of treating general product inclusion as certification.

Small document/presentation lists use `resource_entries` on the owning page, with `title`, `url`, `resource_type`, `description` and optional `citation`. The current opportunity remains an ordinary page with structured `opportunity_type`, `location`, `working_pattern`, `posted_date`, `experience` and `skills`; its directory references that page through `page_entries`.

Talks have no independent detail routes. `_data/talks.yml` is the single shared registry used by speaker and event pages:

```yaml
- id: stable-unique-id
  title: Talk title
  date: "2026-03-26"
  speakers: [mike-eftimakis]
  event: cheri-blossoms-conference-2026
  event_title: CHERI Blossoms 2026
  location: Cambridge, UK
  links:
    - label: Watch video
      url: https://example.org/recording
      kind: video
```

This last example is a scaffold, not a publication claim. Supply the real title and resource URL. Use `card_sections` only for contextual groupings of canonical record references, such as an event's keynote speakers; biography text belongs to the person's record.

Start body content at `##`. Use ordinary Markdown lists, images, code fences and tables. Preserve explicit anchors when editing headings, for example `{: id="biography" }`. `_data/legacy_anchors.yml` retains bookmarks moved by the migration. Do not restore export classes such as `collection-card__*` or `entity-facts`.

## Local validation

Ordinary pages and news use the shared site content width. Collection details retain a readable prose column and optional facts panel. The header, newsletter band and footer have full-width surfaces with their contents aligned to the same container. The original honeycomb assets remain the background on both page palettes.

Only `/` uses the original dark palette, selected by its `home-page` class. There is no visitor theme setting. The homepage hero uses plain `hero.title`, an ordered `hero.subtitle` array, `summary`, and Markdown in `hero.introduction`; do not put HTML tags in the title. Its `sections` configuration arranges the existing Markdown sections into the original groups.

```sh
python -m pip install -r requirements-dev.txt
python scripts/check_content.py
bundle exec ruby scripts/test_event_status.rb
bundle exec jekyll build --safe --destination dist
python scripts/check_content.py --site dist
bundle exec jekyll build --safe --baseurl /preview --destination dist-baseurl/preview
python scripts/check_content.py --site dist-baseurl/preview --baseurl /preview
```

For browser checks, serve the output directory, install Chromium with `python -m playwright install chromium`, and install `axe-core@4.10.3`. Set `SITE_URL` and `AXE_PATH`, then run `python scripts/test_catalog.py` and `python scripts/test_layouts.py`. Optional `CHROMIUM_EXECUTABLE` selects an existing Chromium binary. Catalogue screenshots go to `reports/browser/`; container, theme and navigation checks and full-page screenshots go to `reports/layout-fixes/after/`. CI checks both `/` and `/preview/` and uploads the review evidence.

The fixtures under `scripts/fixtures/` are a migration safety net. Update them deliberately when a reviewed editorial change intentionally changes an existing route, anchor or ordered relationship. The rendered audit records inherited broken references separately from regressions.
