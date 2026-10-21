---
layout: page
title: Publishing and editing site content
summary: A developer's guide to Markdown, collection front matter, images, relationships and local verification.
permalink: /publishers/
slug: publishers
unlisted: true
---

## Start with the Markdown

Edit the owning Markdown file first. Write prose, headings, lists, links, images,
tables and code in its body; use YAML front matter for structured facts and
relationships. Shared Jekyll layouts generate cards, navigation, bylines, asides
and event programmes. There is no CMS export or content-generation step.

This guide's source is `pages/publishers.md`, served at `/publishers/`. It has no
menu entry. `unlisted: true` excludes it from the sitemap and adds a search-engine
noindex instruction. The URL remains publicly accessible; this is not a private page.

For this design work, use `design/catalogue-polish` exclusively. Inspect your
branch and working tree before editing:

~~~sh
git status --short --branch
git branch --show-current
~~~

1. Find the existing record, or copy a nearby record in the same collection.
2. Choose a lowercase kebab-case filename and a stable public `permalink`.
3. Edit the body and only the front-matter fields needed for that content.
4. Add local media, then update its explicit paths and meaningful alt text.
5. Build and check links, desktop/mobile presentation and affected inverse views.

Source paths and public URLs are separate. For example, `pages/contact.md` is
served at `/alliance/membership/contact/`. Moving its source does not change the
URL, slug, existing links or form. Keep those values unless deliberately changing
the public route, with a redirect from the previous route.

## Writing body content and links

The Markdown engine is **Kramdown**. Start the body with `##`, since the layout
provides the H1. Use `###` for subsections. Keep a blank line around lists,
tables and fenced examples.

~~~markdown
## What changed

Explain the change in a short paragraph with **useful emphasis**.

- First point.
- Second point.

### Learn more

[Read about CHERI](/discover/why-cheri/why-cheri/).
~~~

Use meaningful link text or angle-bracket autolinks:

~~~markdown
[CHERI Zephyr source](https://github.com/CHERI-Alliance/CHERI-zephyr)

<https://github.com/CHERI-Alliance/CHERI-zephyr>

[Contact the Alliance](/alliance/membership/contact/)
~~~

Kramdown does not automatically link every plain URL. Use one of these forms,
including in citations and blockquotes. URLs in code examples intentionally
remain literal.

The shared template adds `rel="noopener noreferrer"` before `target="_blank"`
to external HTTP/HTTPS links, including front-matter resource actions. Authors
do not need to repeat those attributes. Existing relationship tokens such as
`nofollow` are retained. Internal links stay in the same tab; email and telephone
links retain their normal behaviour. This works without JavaScript.

Use root-relative internal paths starting with `/`, rather than the deployed
hostname. The template applies the deployment's `baseurl` to rendered links and
media. Do not hard-code `/preview` into content.

Use fenced code blocks with a language, such as `sh`, `c` or `yaml`. Liquid runs
before Markdown, even in code fences: protect literal Liquid examples with
Liquid raw/endraw wrappers. Avoid executable Liquid and layout HTML in content;
add reusable presentation in `_includes` or `_layouts`.

## Left, right and full-width body images

Put an alignment class immediately after a Markdown image. Replace the existing
local paths and alt text in these examples with the intended artwork.

### Left image

~~~markdown
![Robert Watson speaking at CHERI Blossoms](/assets/images/events/cheri-blossoms-conference-2026/cheri-blossoms-2026-robert-watson-giving-a-talk.webp){: .image-left }

The following paragraph flows beside the image on desktop.
~~~

### Right image

~~~markdown
![Robert Watson speaking at CHERI Blossoms](/assets/images/events/cheri-blossoms-conference-2026/cheri-blossoms-2026-robert-watson-giving-a-talk.webp){: .image-right }

The following paragraph flows beside the image on desktop.
~~~

### Full-width image

~~~markdown
![The William Gates building](/assets/images/events/cheri-blossoms-conference-2026/william-gates-building-outside-view.webp){: .image-full }
~~~

At widths of at least 768px, left/right images use at most 40% of the content
width, 28rem wide and 20rem high, preserving proportions. On smaller screens they
stack at full content width. Full-width means the available article column,
including when an aside is present. All three styles retain natural proportions
and use the site's slight corner rounding. Do not add fixed inline sizes.

Aligned body images open in the shared enlargement dialog. Add `.no-zoom` to
the same attributes to omit enlargement. Use `.image-inline` for a small inline
mark that should not float or expand. Put captions, attribution and licence
details in adjacent Markdown. Alt text should describe meaning, not a filename.

## Shared front matter

Every ordinary page and collection record needs `title`, a factual `summary`,
an explicit `permalink` and a unique `slug`. Keep existing slugs stable because
other records reference them. For new collection records, match the slug to the
filename without `.md`; post filenames additionally begin with their date.

This is a complete ordinary-page scaffold. Replace the illustrative values:

~~~yaml
---
layout: page
title: Example resource
summary: Explain what the reader will find here.
permalink: /discover/resources/example-resource/
slug: discover-resources-example-resource
navigation:
  header:
    category: Discover CHERI
    subcategory: Resources
---
~~~

`navigation.header` supplies category context and breadcrumbs; it does not add
a header link automatically. Add intentional header entries in `_config.yml`.
Optional `navigation.footer.category` adds a footer entry using a category from
`_data/footer_categories.yml`. Omit menu metadata for `unlisted: true` pages.

| Optional field | Purpose |
| --- | --- |
| `image` | Primary `src`, `alt`, actual pixel `width`/`height`, and the collection's `fit`. |
| `resources` | Downloads/destinations with `type`, `label` and `url`. |
| `related` | Contextual references with target `type`, `slug` and `relation`. |
| `forms` | Existing keys from `_data/forms.yml`, such as `contact`. |
| `canonical_url` | Deliberate canonical destination for a retained version. |
| `sitemap: false` | Existing archived/source versions; also displays the archived-version label. Use `unlisted` for a current utility page. |

Supported resource types are `website`, `documentation`, `repository`, `download`,
`pdf`, `slides`, `video`, `publication`, `recording` and `external`:

~~~yaml
resources:
- type: pdf
  label: Download official PDF
  url: /assets/pdf/shared/code-of-conduct.pdf
related:
- type: organisation
  slug: cheri-alliance
  relation: related
~~~

Related types are `page`, `post`, `event`, `person`, `organisation`, `paper`,
`product`, `repository`, `working_group`, `guide` and `policy`. References use
the target's slug, not its URL. Do not duplicate relationships already derived
from authors, speakers, affiliations or manufacturers.

## Front matter by collection

Keep the shared fields above, choose the correct layout, and add the owning
semantic object. The following snippets are **additions to the common scaffold**,
not complete files. `_data/taxonomy.yml` defines enumerated values;
`_data/catalog.yml` defines displayed facts. Do not invent metadata to fill a
card, or add per-record colour, spacing or image-ratio flags.

| Source | Layout | Semantic object | Public route convention |
| --- | --- | --- | --- |
| `pages/` | `page`, or `list` for a directory | None | Explicit `permalink` |
| `_posts/YYYY-MM-DD-name.md` | `article` | `post` | `/news/name/` |
| `_events/name.md` | `detail` | `event` | `/events/name/` |
| `_people/name.md` | `detail` | `person` | `/people/name/` |
| `_organisations/name.md` | `detail` | `organisation` | `/organisations/name/` |
| `_papers/name.md` | `detail` | `publication` | `/papers/name/` |
| `_products/name.md` | `detail` | `product` | `/products/name/` |
| `_repositories/name.md` | `detail` | `repository` | `/repositories/name/` |
| `_groups/name.md` | `detail` | `working_group` | `/groups/name/` |
| `_guides/name.md` | `detail` | `guide` | `/guides/name/` |
| `_policies/name.md` | `detail` | `policy` | `/policies/name/` |

### Pages and directories

Most pages need only the scaffold and Markdown. Store a general page directly
under `pages/`, or use existing category/subcategory folders. A certification
page can retain verified answers in its body without a new collection schema.

Directories use `layout: list` and query a collection:

~~~yaml
listing:
  collection: events
  filter: upcoming
  sort: date_asc
~~~

Reuse an existing directory's supported filters and sorting. Members use
`collection: organisations` and `filter: current_members`; past events use
`filter: past`. Do not copy generated cards into Markdown.

Forms use keys, such as `forms: [contact]` on `pages/contact.md`. Fields and
submission behaviour live in `_data/forms.yml`. An `unconfigured` form checks
fields locally but sends no message; configure a real POST provider there before
submission works. There is no page-level `form.action` setting.

### Posts

~~~yaml
date: '2026-10-21T09:00:00+01:00'
post:
  category: ecosystem
  tags:
  - Ecosystem
  authors:
  - person: mike-eftimakis
~~~

Use `2026-10-21-example-news.md` with slug `example-news`. Categories are
`cheri-alliance-news`, `ecosystem`, `events` and `government-regulation`.
Author order is significant. A guest author uses `name` instead of `person`,
never both. Reading time is generated from the body. News heroes show the title
and byline without the summary paragraph. Keep `summary` for metadata and search;
write the article's complete introduction in the Markdown body.

### Events and programmes

~~~yaml
date: '2026-11-12'
end_date: '2026-11-13'
event:
  format: conference
  series: cheritech
  timezone: Europe/Berlin
  location:
    venue: Munich Messe
    city: Munich
    country: Germany
  organisers:
  - organisation: cheri-alliance
    role: organiser
  schedule:
  - date: '2026-11-12'
    sessions:
    - title: Keynotes
      type: keynote
      start: '13:05'
      end: '14:20'
      presentations:
      - title: Progress of the Alliance
        start: '14:00'
        speakers:
        - person: mike-eftimakis
          affiliation: CHERI Alliance
~~~

Formats are `conference`, `exhibition`, `tutorial`, `webinar` and `workshop`.
Quote ISO dates and `HH:MM` clock values. Keep the timezone explicit when timing
is known. Omit unavailable times rather than estimating them; omit `end_date`
for a single day. Optional `registration` contains `label` and `url`.
`partners` takes organisation/role entries like `organisers`.

Nest each talk's `speakers` and `resources` directly under that talk. A guest
uses `name` and optional `affiliation` instead of `person`. Speaker `role`
defaults to `speaker`; specify a different role only when needed. A shared
affiliation may sit beside the talk title. Event-wide speakers with no talk can
go in `event.speakers`; event-wide resources remain top-level.

Standalone entries default to `talk`, entries with presentations to `session`,
and tracks to `main`. Set `type` for breaks, networking, panels and other
non-default entries. YAML order controls display order. No authored IDs or
`session_id`/`presentation_id` references are needed: templates scan
`speakers.person` to derive profile Events and talk cards, and generate anchors
automatically. Existing bookmarks remain in migration aliases. Changing titles
updates generated profile links; do not maintain a separate scheduled-speaker list.

### People

~~~yaml
person:
  roles:
  - speaker
  affiliation:
    organisation: lowrisc
    relationship: employment
    positions:
    - title: Pro bono CEO
      status: current
  other_affiliations:
  - organisation: cheri-alliance
~~~

Use one singular `affiliation` for the main company/institution and optional
`other_affiliations`. Each has an organisation slug, optional `relationship` and
optional `positions`. Relationships are `employment`, `research`, `consultancy`,
`governance` and unspecified (`other`, the default). Positions have `title`,
`status: current` or `past`, and optional quoted `start_date`/`end_date`.
Preserve concurrent and historical positions.

Cards show name, the first current position at the main affiliation if supplied,
then that organisation on separate lines. Profiles, inverse organisation lists,
search and filters retain additional affiliations. Do not invent a job title.
Governance fields `board_role` and `board_order` go under `person.governance`;
preserve curated board order. Events, articles and publications are found from
their owning records, not maintained again here.

### Organisations

~~~yaml
organisation:
  website: https://www.axiomise.com/
  membership:
    is_member: true
    status: active
    tier: full
~~~

Optional `type` and `sector` describe the organisation. Membership statuses are
`active`, `past`, `inactive`, `pending` and `unknown`; only verified active
members appear in the current-members view. Set `founding_member: true` only
when confirmed. Omit membership for non-members rather than guessing. People
relationships are derived from their affiliations.

### Papers and other publications

~~~yaml
publication:
  year: 2025
  type: academic_paper
  venue: ACM/IEEE ISCA 2025
  citation: Preserve the complete published citation here.
  authors:
  - person: jianyi-cheng
  - name: A guest author without a profile
~~~

Use integer `year`. Preserve author spelling/order, full citation, venue and
optional `doi`. Reports use `_papers` with the appropriate publication type,
not a separate reports collection. Use `resources` for the publication or local
PDF. Retain corporate authorship in the citation, without inventing person records.

### Products

~~~yaml
product:
  type: development_kit
  manufacturer: arm
  architecture: Morello
~~~

Types are `board`, `chip`, `development_kit`, `fpga_board`, `fpga_system`, `soc`
and `other`. Optional `maturity` and `availability` retain sourced facts.
`manufacturer` references an organisation. Optional `repositories` contains
`repository` slugs with `compatibility`: `supported`, `experimental`, `planned`,
`unsupported` or `unknown`. Product inclusion is not evidence of certification;
retain certification scope and answers on their existing pages.

### Repositories and software

~~~yaml
repository:
  type: operating_system
resources:
- type: repository
  label: CHERI Zephyr source code
  url: https://github.com/CHERI-Alliance/CHERI-zephyr
~~~

A verified repository resource is required. Other types are `application`,
`compiler`, `firmware`, `library`, `other`, `simulator`, `toolchain` and `tools`.
Optional `architectures` is an array; `maturity` is a sourced fact.
`maintainers` takes organisation/role entries. Compatibility belongs on the
product; an overview does not establish support for every mentioned platform.

### Working groups

~~~yaml
working_group:
  type: technical
  leads:
  - person: hesham-almatary
  coordinator: cheri-alliance
  focus_areas:
  - Shared technical work
~~~

Types are `technical`, `programme` and `other`. Add a sourced `status` when
known. `coordinator` references an organisation, not a person. `leads` contains
one or more `person` references; a lead without a profile can use `name` instead.
Use exactly one identity per entry. Leads display in the group's facts aside;
their profiles automatically list the working groups they lead. Maintain this
relationship only on the group. Do not add contact forms to working-group pages.
The general contact page remains available in navigation.

### Guides

~~~yaml
guide:
  topic: compartmentalisation
  level: intermediate
  prerequisites:
  - Familiarity with the chosen CHERI platform
~~~

Topics are `compartmentalisation`, `downloads`, `getting-started`, `porting`,
`reference`, `security-engineering`, `simulation`, `toolchains` and `training`.
Optional levels are `beginner`, `intermediate` and `advanced`. Set
`estimated_minutes` only when supported. `primary_product` references a product.
Lessons can share `series` and numeric `sequence`; the layout derives neighbours.
Keep instructions and code in the body.

### Policies

~~~yaml
policy:
  type: governance
  version: '1.01'
  dates:
    effective: '2025-04-14'
  owner: cheri-alliance
  status: current
~~~

Quote versions and preserve source date precision. Optional `dates.reviewed`
records a real review. Statuses are `current`, `draft` and `archived`. Retain
legal wording, attribution, the official PDF resource and notices about which
document is authoritative. The supported policy type is currently `governance`;
change taxonomy and validation deliberately before adding another.

### Glossary entries and redirects

`_glossary/` renders on the existing glossary page without separate detail URLs.
Preserve numbered filename order. Front matter contains `title`, stable `anchor`
and optional real `link`; the body is the definition. Do not add duplicate
definition, ordering or search-index fields.

`_redirects/` records contain `permalink`, `redirect_to` and optional
`sitemap: false`, with no body. Point directly to the final destination, avoiding
redirect chains. Preserve historical fragments as well as routes.

## Image sizes and asset ownership

Use explicit primary-image front matter with the actual file dimensions:

~~~yaml
image:
  src: /assets/images/people/gavin-ferris.webp
  alt: Gavin Ferris
  width: 370
  height: 370
  fit: cover
~~~

Public media URLs start with a slash followed by `assets/`, mapping to the repository's `assets/` directory. In these
patterns, replace `name` with the Markdown filename without `.md`; prepend `/`
when using a path in front matter.

| Collection | Primary path | Ratio and fit | Preparation |
| --- | --- | --- | --- |
| People | `assets/images/people/name.webp` | 1:1, cover | Face-focused square; normally up to 512 × 512, with natural head-and-shoulders framing. |
| Organisations | `assets/images/organisation/name.webp` | 3:1, contain | Transparent 1200 × 400 canvas; retain the complete logo, colours and details. |
| Events | `assets/images/events/name.webp` | 16:9, contain | Complete source with white padding; normally up to 1280 × 720. |
| Posts | `assets/images/posts/YYYY-MM-DD-name.webp` | 16:9, contain | Include the Markdown filename's date; preserve the complete image with white padding. |
| Pages, papers, products, repositories, groups, guides and policies | Owned collection folder or descriptive shared asset | No imposed file ratio | Preserve natural proportions; contain logos, badges and diagrams. |
| Additional body images | Owning record's image folder | Natural aspect ratio | Left, right or full width; primary-thumbnail ratios do not apply. |

Review the actual face before cropping a portrait; a face on a slide behind the
speaker is not the subject. Prefer fixing the source crop to per-page CSS.
Existing `image.position: left` or `right` can adjust presentation if needed.
Never stretch/crop logos. Remove only unintended exterior fills, preserving
deliberate white lettering and coloured panels.

Hero image frames use a white CSS background so transparent badges and logos
remain legible against navy. This does not add white pixels to transparent
organisation files. Omit an image when no artwork has been supplied.

Additional images and downloads use these ownership patterns:

~~~text
assets/images/events/name/exhibition.webp
assets/images/posts/YYYY-MM-DD-name/architecture-diagram.webp
assets/pdf/events/name/programme.pdf
assets/pdf/posts/YYYY-MM-DD-name/report.pdf
assets/video/events/name/recording.mp4
assets/audio/posts/YYYY-MM-DD-name/interview.mp3
~~~

Use the same media-type/content-type/record/filename convention for other
collections. `organisation` is singular in asset paths. Shared media belongs
under `assets/MEDIA-TYPE/shared/` with descriptive filenames. Branding,
backgrounds and social images have named shared subfolders; fonts live under
`assets/fonts/shared/`. Reuse shared files rather than adding identical copies.
Keep SVG for vectors and animation formats when conversion would lose necessary
functionality. Preserve licences, attribution and captions.

Prepare artwork in an editor or use `scripts/prepare_image.py`. Portrait
`--crop` arguments are source-pixel left, top and square size. Inspect automatic
white-background removal. Replace a file at its established path where possible,
updating dimensions if changed. New media needs no migration-manifest entry.

## Running Jekyll in the Alpine dev container

Install Docker (Docker Desktop on macOS/Windows) and VS Code's **Dev Containers**
extension. Clone this repository, open its root folder in VS Code, then choose
**Dev Containers: Reopen in Container** from the command palette.

The configuration in `.devcontainer/` builds from Ruby 3.3 on Alpine Linux.
It installs the Bundler version recorded in `Gemfile.lock`, all pinned Gemfile
dependencies, Git and Node.js. Native gem build tools are removed after the
image is built to reduce its size. Your source is bind-mounted, so edits in the
container remain in your checkout. The editor and terminal run as `vscode`,
not root. Port 4000 is forwarded automatically.

In the container's terminal, check the branch and start the server:

~~~sh
git branch --show-current
bundle check
bundle exec jekyll serve --safe --host 0.0.0.0 --port 4000 --force_polling
~~~

For this design work, the branch must be `design/catalogue-polish`. Open
`http://localhost:4000` on your host; the guide is at `/publishers/`. The first
build can take a while. Jekyll rebuilds after Markdown edits; `--force_polling`
helps detect changes through Docker bind mounts. Stop it with Ctrl+C. Restart
after editing `_config.yml`. The existing `future: true` setting includes
scheduled posts, matching the site's normal build.

Build once instead of starting a server with:

~~~sh
bundle exec jekyll build --safe --destination dist
~~~

The container installs Ruby dependencies during its image build and checks them
again when created. After changing `Gemfile` or `Gemfile.lock`, choose **Dev
Containers: Rebuild Container** so the cached image matches the checkout. Do not
copy host gems or `vendor/bundle` into Alpine; its native libraries use musl.
Python/browser validation tools are separate optional dependencies from
`requirements-dev.txt`; they are not needed just to run Jekyll.

Without VS Code, build and run the same image from the repository root:

~~~sh
docker build -f .devcontainer/Dockerfile -t cheri-jekyll .
docker run --rm -it -p 4000:4000 \
  --mount "type=bind,source=$(pwd),target=/workspaces/cheri-alliance" \
  cheri-jekyll \
  bundle exec jekyll serve --safe --host 0.0.0.0 --port 4000 --force_polling
~~~

The CLI example uses UID 1000; on Linux, VS Code Dev Containers adjusts the
editor user's UID to your host automatically. Prefer that route if your host
checkout uses another UID and the CLI container cannot write its output.

## Build and verify before publishing

~~~sh
bundle install
python -m pip install -r requirements-dev.txt
python scripts/check_content.py
python scripts/check_assets.py
bundle exec jekyll build --safe --destination dist
python scripts/check_content.py --site dist
python scripts/check_assets.py --site dist
python scripts/check_linked_content.py --site dist
python -m http.server 4000 --directory dist
~~~

Review desktop and mobile. Check crops, transparent logos, text wrapping,
captions, downloads, event tabs, speaker profiles and inverse organisation views
affected by the edit. Check external links without JavaScript too. Confirm new
external destinations; local checks cannot guarantee another service's uptime.

For deployment-path changes, also build with `--baseurl /preview` and verify
links under that prefix. GitHub Pages uses native safe-mode Jekyll: no custom
content-rendering plugin is required.

Snapshots and preservation baselines under `docs/` and `scripts/fixtures/` are
migration evidence, not authoring sources. If an intentional editorial edit
changes a protected contract, review/update the relevant fixture deliberately;
do not regenerate it to hide an unexplained failure. Inspect `git diff` and run
existing CI checks relevant to the changed feature before committing.
