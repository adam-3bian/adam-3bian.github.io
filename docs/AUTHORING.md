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
| `date` | News and events | Source publication date for news; source occurrence date/time for events. |
| `end-date` | Multi-day events | Last published event day, inclusive. Omit for a single day. |
| `undated: true` | A news/event record without a verified date | Prevent Jekyll's implicit build date from being displayed or used as a genuine date. Omit `date` in this case. |
| `alternate: true` | Differing source versions | Retain a distinct alternate body without repeating it in the primary news feed. |
| `permalink` | Ordinary pages under `pages/` | Public route; collection routes come from filenames. |
| `listing` | Directory pages | For `layout: people`, optional `role: speaker` or `registry: governing-board`; for `layout: events`, optional `status: upcoming` or `status: past`. Group optional `columns` here. Other directories use `layout: list` with `listing.collection`; members use `layout: members`. |
| `thumbnail` | A record with genuine media | Optional grouped `src`, `alt`, `fit`, `position`, `width` and `height`; otherwise cards reuse its first local source image. |
| `where-next` | A page with a known next destination | One `url`, with optional `title`, `action`, `image`, `target` and `rel`. No description is rendered. |
| `related-pages` | A page with known related destinations | Ordered URL objects; infer destination titles unless an explicit override is needed. Optional source-backed `description`, `action`, `target` and `rel`. |

Omit false flags, empty arrays, duplicated slugs, per-record layout settings and acquisition metadata. Biographies and article text belong in the Markdown body. Add other metadata only when needed and supported by a source.

### Shared cards and onward links (Phase 2)

Use real destinations in front matter; no card HTML or Liquid is needed in editorial bodies:

```yaml
where-next:
  url: /guides/choose-a-platform/
related-pages:
- url: /build/platforms/platform-comparison/
- url: /guides/port-existing-software/
```

Where next always renders one full-width card with a title and action. Related pages uses a responsive grid. The shared renderer resolves internal titles from actual pages/records, preserves explicit overrides, prefixes local links/assets for project builds, and adds `noopener noreferrer` for explicit `target: _blank`. Person/member cards use square images, news/event cards use landscape frames, and a missing genuine image produces a text-only card. An explicit empty image alt remains empty; use `fit: contain` for a logo or diagram that must stay uncropped.

For the migrated 137 records, retained `.where-next-title` / `.related-pages-title` blocks are original source evidence; their YAML fields now control display. Keep their historical wording intact. Existing Where next descriptions are intentionally omitted from the rendered component; Related content descriptions remain visible through the YAML mapping. New authored pages need only the YAML fields. See [Phase 2](../reports/codex-phases/phase-02.md) for measured preservation and the limits of older search/filter/date statements below.

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

## Events, news and papers

Keep the full event body and reference existing people through `speakers`. Keep complete paper citations, descriptions and publication links in the body; use `authors` for existing people in citation order. The following abbreviated example shows the syntax:

```yaml
title: 'CHERI Concentrate: Practical Compressed Capabilities'
authors: [jonathan-woodruff, alexandre-joannou, hongyan-xia, anthony-fox]
```

The actual CHERI Concentrate record retains all 15 named authors. Existing records provide complete source-verified arrays. References must match filenames; validate IDs independently, because native Jekyll does not reject unknown people or organisation IDs.

News uses the same `authors` references. For example, `_news/one-bug-is-all-it-takes.md` uses `authors: [adam-finney]`. Add authors only from an explicit published byline, with evidence in `reports/relationship-evidence.json`; people mentioned, interviewed or quoted in a story are not automatically its authors. Reuse existing profiles. A bylined author without a profile gets a name-only people record, like a paper author, with provenance in `reports/derived-content.json`.

News displays linked author cards. People display their canonical news articles newest first; retained `alternate: true` versions do not create duplicate cards. If a byline is preserved only in an original source version, record that distinct evidence rather than altering or merging the source bodies.

Do not repeat reverse relationships. A person's events come from event `speakers`; their publications and news come from paper/news `authors`; an organisation's people come from people `organization`. The build generates those sections without Liquid in editorial Markdown.

Author and speaker cards follow the stored ID array exactly. Keep that order when it is source-backed; do not alphabetize citations or keynote selections. Authors appear below the complete article/paper body. New events get one generated Speakers section below the body. The three migrated conference records with `source-speakers: true` instead reuse their source Speakers position and keynote/featured grouping, preserving each published excerpt and affiliation in the generic cards. Their original Markdown fragments remain provenance, not a second maintained card list. All person cards link canonical `_people` profiles and reuse their real portraits; a missing portrait stays absent.

Use `layout: news` for the two news indexes and `layout: events` for event indexes. The shared chronology include reads `_news` (not `_posts`), excludes alternate versions, orders dated news newest first, and appends undated records alphabetically without date labels. The homepage selects the three latest genuinely dated news records. All-event and past/upcoming lists sort earliest first; person reverse lists reuse the same chronology. The original news bylines, source dates, event programmes and citations remain in their full bodies.

## Governing board, directories and navigation

`_data/governing-board.yml` is the only data registry: an ordered list of nine people IDs. Names, affiliations and biographies stay in people files. The full source board page remains, with board links back from profiles. When membership changes, update the list and board page together against an authoritative source.

People directories now select `layout: people`. Omit `listing` to show all canonical people alphabetically. Speakers uses `listing: {role: speaker}`; the board uses `listing: {registry: governing-board}` and keeps registry order. Both use the generic cards and canonical `/people/:id/` routes. The optional `columns` setting supports the ZIP's 2/3/4 columns.

The migrated board additionally has `listing.source-fragments: true`: its original portrait/card Markdown is preserved as historical source evidence, while the people layout replaces that presentation with canonical records. Do not update those retained fragments to maintain a second board list. Update `_data/governing-board.yml` and the source-backed role/affiliation definitions in `_people` instead; ordinary board prose remains editable. Each board card reads the person's existing `Board role` and `Organisation` definitions. See the [Phase 3 report](../reports/codex-phases/phase-03.md) for the measured mapping.

Existing people reuse their first genuine Markdown portrait for both cards and square detail images. Keep its alt text, alignment and caption; do not add a second portrait. New records may use the ZIP's grouped `thumbnail` metadata instead. An explicit thumbnail overrides the primary portrait on both surfaces. Name-only records remain name-only, with relationships generated from the existing reference IDs. The Phase 3 audit independently checks every board ID and all person relationship targets; native Jekyll alone does not fail on unknown IDs.

Published member and speaker directories list the canonical records selected by their flags. Their complete original source directories remain as separate Markdown source versions. Flags and affiliations describe captured sources, rather than asserting present employment.

Directories use native cards without keyword filters. Author roles are derived from `authors` references, without another flag. Member tiers and founding status come from the explicit published profile definitions, rather than duplicated YAML.

Event `date` and optional `end-date` now mirror the source-backed `Date` definition in the unchanged body. Keep them consistent; the Phase 4 audit checks their provenance. Location labels still come from the existing `Location` definition, without duplicated metadata. An event remains upcoming through its last published day, then moves into the past list at the next build. Production classification uses `site.time` in the configured Europe/London timezone, not a browser clock or the historical `CHERI_TODAY` environment variable. Unknown-date events appear only in the all-events list and receive no invented past/upcoming classification.

`future: true` is necessary for native Jekyll to write already-published upcoming event pages: their `date` is an occurrence date, not a scheduled publication date. Draft content should explicitly use `published: false`. This is a build setting, not a deployment. The isolated Phase 4 fixture supplies dates directly to the chronology include and uses a temporary Jekyll `time` override to check the empty-upcoming state; neither override is in production configuration. An empty event selection displays a simple factual message rather than placeholder cards.

Navigation lives in `_config.yml` under `navigation`. Header and footer edits do not need `_data/navigation.yml`. Primary navigation follows the primary site's published sections.

The homepage uses the shared theme plus its full published body, three latest canonical news cards and upcoming events. Five section hubs and all collection indexes link existing content. Search is generated from complete readable Markdown bodies and derived role information, with code blocks and alternate source versions excluded. Titles, descriptions, sitemap and canonical URLs are generated by the build.

Hardware platforms, boards and processor cores belong in `_hardware`. Operating systems, tools and simulators belong in `_software`. Governance remains under `pages/alliance/leadership/`.

## Markdown, assets and evidence

Write native Kramdown headings, lists, links, tables, definitions and fenced code. Keep CMS classes such as `.elementor-*`, `.wp-*`, `.widget-*` and `.tablepress*` out of Markdown. The actual uploaded starter layout/includes/Sass supply breadcrumbs, page headings and native hero sections. Read [THEME.md](THEME.md) before presentation changes; source layout evidence does not override the theme. Preserve semantic image alignment classes and real heading anchors; the converter and Markdown validator enforce that separation. Editorial HTML and Liquid wrappers are unnecessary. Images reference original local assets:

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

## Other directories and section hubs (Phase 5)

Use `layout: members` for the verified member directory; it selects only `member: true` from `_organisations`. Do not create `_members`. The universal compact cards reuse genuine logos, with the source-backed Founding member designation where present. Organisation details contain their original descriptions, membership definitions and reverse-linked people; no missing profile is filled with invented text.

Other collections use `layout: list` and grouped `listing.collection` (organisations, papers, hardware, software, policies, guides or groups). Optional `columns`, `compact`, `action`, `sort` and `order` follow the starter schema. The complete directory introduction appears before its cards. A paper remains a catalogue record with its genuine publication links; no local full paper is implied.

The five main hubs use `layout: index`. Their cards derive from `parent` references; collection and section defaults live in `_config.yml`, with explicit parent overrides on directory pages. Keep those references aligned with real destinations. Hubs preserve their original curated text/link lists before the generated children. Alternate source versions stay out of derived indexes.

The remaining 216 migrated source-card entries render through `source-card-groups.html` and the universal `listing.html` shell. Their images, labels, dated/status text, headings, summaries, actions and curated order stay verbatim from the retained Kramdown. This includes historical source-version directories; they are not replaced with today's canonical feed. New content should use collection/parent references or `related-pages`, not add migration fragments. The Phase 5 audit checks each retained fragment independently as well as all other rendered prose.
