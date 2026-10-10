# Authoring CHERI Alliance content

Each entity lives in one Markdown file. Its filename is its ID: `_people/robert-watson.md` is referenced as `robert-watson`. Keep IDs stable when editing titles: IDs also determine collection URLs. Layout and Markdown settings come from `_config.yml`.

## Minimal front matter

| Field | Where | Purpose |
| --- | --- | --- |
| `title` | Every file | Published page or entity name. |
| `member: true` | Organisations | Identify a confirmed member. Omit for other organisations. |
| `speaker: true` | People | Identify a source-listed speaker. Authors may also be speakers. |
| `organization` | People | Organisation ID, or an array for explicitly published multiple affiliations. |
| `speakers` | Events | Array of people IDs, in source order. |
| `authors` | Papers | Array of named contributor IDs, in citation order. |
| `date` | News where published | Explicit source publication date. Omit when unavailable. |
| `alternate: true` | Differing source versions | Retain a distinct alternate body without repeating it in the primary news feed. |
| `permalink` | Ordinary pages under `pages/` | Public route; collection routes come from filenames. |
| `listing` | Directory pages | Collection name, or `members`/`speakers` to select role flags. |
| `filter` | Event indexes only | Optional `upcoming` or `past`; event dates come from published body definitions. |

Omit false flags, empty arrays, duplicated slugs, per-record layout settings and acquisition metadata. Biographies and article text belong in the Markdown body. Add other metadata only when needed and supported by a source.

Boolean flags describe roles; references describe connections. A `member` flag cannot identify a person's organisation, and a `speaker` flag cannot identify which events they spoke at. Both forms are needed.

## Organisations and people

For `_organisations/codasip.md`, followed by its full published profile:

```yaml
---
title: Codasip
member: true
---
```

An organisation named only in an explicit affiliation gets its published name as `title` and a heading, without invented membership or description.

For `_people/mark-hill.md`, followed by its full published profile:

```yaml
---
title: Mark Hill
organization: codasip
speaker: true
---
```

Multiple explicitly listed affiliations use an array, as in Robert Watson's record:

```yaml
organization: [cheri-alliance, university-of-cambridge]
```

Paper authors without source profiles have name-only records. For example, `_people/anthony-fox.md` contains:

```markdown
---
title: Anthony Fox
---

# Anthony Fox
```

Linked papers appear automatically. Do not invent a biography, photograph, speaker role or current affiliation. Unnamed contributors such as “and others” remain in the original citation; no fictional people records are created.

## Events and papers

Keep the full event body and reference existing people through `speakers`. Keep complete paper citations, descriptions and publication links in the body; use `authors` for existing people in citation order. The following abbreviated example shows the syntax:

```yaml
title: 'CHERI Concentrate: Practical Compressed Capabilities'
authors: [jonathan-woodruff, alexandre-joannou, hongyan-xia, anthony-fox]
```

The actual CHERI Concentrate record retains all 15 named authors. Existing records provide complete source-verified arrays. References must match filenames; the build fails on unknown people or organisation IDs.

Do not repeat reverse relationships. A person's events come from event `speakers`; their publications come from paper `authors`; an organisation's people come from people `organization`. The build generates those sections without Liquid in editorial Markdown.

## Governing board, directories and navigation

`_data/governing-board.yml` is the only data registry: an ordered list of nine people IDs. Names, affiliations and biographies stay in people files. The full source board page remains, with board links back from profiles. When membership changes, update the list and board page together against an authoritative source.

Published member and speaker directories list the canonical records selected by their flags. Their complete original source directories remain as separate Markdown source versions. Flags and affiliations describe captured sources, rather than asserting present employment.

All collection directories support keyword filtering. The people directory can select speakers or paper authors; the organisations directory can select members. Paper-author roles are derived from `authors` references, without another flag. Member tiers and founding status come from the explicit published profile definitions, rather than duplicated YAML.

Event dates and locations come from the source-backed `Date` and `Location` definitions in the body. An event remains upcoming through its last published day, then moves into the past list at the next build. Dates are evaluated in Europe/London; the static preview updates when its build runs. Set `CHERI_TODAY=YYYY-MM-DD` when testing date-dependent changes. No additional date/status front matter is required.

Navigation lives in `_config.yml` under `navigation`. Header and footer edits do not need `_data/navigation.yml`. Primary navigation follows the primary site's published sections.

The homepage uses the shared theme plus its full published body, three latest canonical news cards and upcoming events. Five section hubs and all collection indexes link existing content. Search is generated from complete readable Markdown bodies and derived role information, with code blocks and alternate source versions excluded. Titles, descriptions, sitemap and canonical URLs are generated by the build.

Hardware platforms, boards and processor cores belong in `_hardware`. Operating systems, tools and simulators belong in `_software`. Governance remains under `pages/alliance/leadership/`.

## Markdown, assets and evidence

Write native Kramdown headings, lists, links, tables, definitions and fenced code. Editorial HTML and Liquid wrappers are unnecessary. Images reference original local assets:

```markdown
![Published description](/assets/events/event-id/original-image.png){: .image-full }
```

Use `.image-left`, `.image-right` or `.image-full` from source evidence; inline images also use `.image-inline`. Captions remain Markdown paragraphs. Preserve original asset bytes.

Differing original-site versions use `-original` filenames and `alternate: true`. Their complete bodies remain available. Published website editions use the primary routes; nine retained originals live in `pages/reference/source-versions/`. Exact corrections and directory substitutions are recorded in `reports/website-editions.json` and checked independently. Alternate bodies are excluded from directories/search and marked `noindex`. Capture records, `paper-sources.json`, `relationship-evidence.json`, `derived-content.json` and immutable signatures retain provenance in `reports/`. Deliberate source link/image repairs are recorded separately.

Contact/newsletter forms live in shared includes and are disconnected previews, as requested. Their notices and disabled buttons must remain until a separate integration is approved. Editorial Markdown contains no HTML or Liquid for these components. See [DEPLOYMENT.md](DEPLOYMENT.md) for build and preview hosting instructions.

## Validate changes

From the repository root:

```sh
scripts/ruby.sh scripts/check_markdown.rb
scripts/ruby.sh scripts/build.rb
/workspace/cheri-migration-venv/bin/python scripts/check_site_links.py
/workspace/cheri-migration-venv/bin/python scripts/check_website.py
```

Source comparison checks detect changes to migrated bodies. Intentional editorial changes should update associated provenance and evidence rather than weaken comparisons. See [README_MIGRATION.md](../README_MIGRATION.md) for the full workflow and limits.
