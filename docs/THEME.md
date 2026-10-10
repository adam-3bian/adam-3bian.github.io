# Theme authority and integration

The presentation reference is the user-uploaded `cheri-alliance-starter-kit-simplified-authoring (3).zip`. The current goal is to retain existing content while using that theme, rather than reproducing the visual design of either source website.

The original archive and detailed master prompt are now retained in [references/](references/README.md). [Phase 0](../reports/codex-phases/phase-00.md) records fresh native-Jekyll findings; the earlier integration and validation statements below remain historical evidence.

The archive's actual `_layouts`, `_includes`, `_sass`, branded/background assets and JavaScript components were imported. No sample articles, biographies, placeholder assets, dependency manifests or sample navigation were substituted for this repository's content and configuration. `reports/template-integration.json` records archive/file hashes and the deliberate adaptations.

## Permitted adapters

- The native header/footer read `site.navigation` from `_config.yml` directly, without a Ruby navigation adapter.
- The default Liquid layout extracts source headings and breadcrumbs without dropping original Markdown body content; collection listing and relationship Liquid includes replace generated display data.
- The default layout preserves SEO and functional includes for search, directories, author relationships and disconnected forms. The native `sitemap.xml` and redirects replace the necessary plugin-generated routes; the former custom search feature is removed.
- Native hero/page-heading includes accept original heading HTML to retain exact text and incoming fragment IDs. Migrated paragraphs are not removed or duplicated as synthesized introductions.
- Extracted `page-hero-summary` paragraphs receive the ZIP's native `lede` class after removal from the body, so their text appears once with the shared introduction typography. Full citation URLs wrap within `.content a`; this narrow source-content adapter prevents mobile overflow without changing link labels or targets.
- Person layouts reuse source-owned portraits rather than inserting a second image. Existing people, organisations, news and events use the starter's person/member/post/event layouts through configuration defaults.
- `_sass/settings.scss` loads the same Poppins faces locally. `_sass/_site-features.scss` styles only added functionality and source-data adapters. It must not override theme colours, watermark opacity, hero typography or substitute a custom profile layout. The existing long navigation uses the native stacked menu at tablet widths.

The starter's defaults enable heroes on ordinary pages as well as the homepage. Its original translucent page surfaces and watermark strengths apply directly. Old `_website.scss`/`_migration-content.scss` overrides are retired from the build.

## Shared components after Phase 2

`listing.html` is the single generic card renderer for documents, relationship lists and YAML links. `related-pages.html` supplies a grid of resolved destinations; `where-next.html` supplies one full-width CTA with no description. Both retain the ZIP's native card/CTA classes, spacing and states. People and organisations default to the ZIP's compact image/title treatment; dates are shown only on chronological news/event card types. Existing event chronology and undated-news handling remain Phase 4 work.

Explicit thumbnail metadata wins. Otherwise the renderer reuses the record's first genuine local image from either Markdown or converted HTML, preserving its alt text. People/member frames are square, news/events landscape, and logos use `contain`. The redundant `.content .cards img` height override was removed so the ZIP's frame rule applies inside articles too. There is no placeholder image or global crop/opacity override. Ordinary body images retain their source proportions, alignment and captions; the original image-dialog script is unchanged.

The default layout now feeds the native hero/page-heading includes from one extracted source H1 and introduction. Existing IDs and source preambles are retained. Additional H1s in two printed archives become H2 chapter headings without changing their wording/order/anchors. The former synthetic hero anchor remains available where needed.

Existing source Where next/Related content fragments have explicit front-matter counterparts on 137 records. Their original Markdown remains intact as provenance; the layout replaces only those marked navigation sections with the shared components. All 227 Related content descriptions remain visible. The 133 old Where next descriptions are intentionally omitted from display to meet the requested component contract, and remain verbatim in source and [Phase 2 evidence](../reports/codex-phases/phase-02-evidence/onward-mapping.json). No ordinary article paragraph is removed. New content can use the native YAML directly without legacy fragments.

## Canonical people after Phase 3

The named `people` layout now owns `/people/`, Speakers and Governing Board. It selects the same `_people` records: alphabetical all-people, alphabetical `speaker: true`, or the exact ID order in `_data/governing-board.yml`. It calls `listing.html` and the legacy `site-features` adapter skips these pages, preventing duplicate directories.

The board's `listing.source-fragments: true` marks its retained source-card block as provenance. The layout replaces that block at its original position, preserving the introduction, explanatory paragraphs and section anchors. Board cards obtain the original role and affiliation from each canonical person's existing definition list, retain the View profile action, and use that person's genuine portrait. The nine former board images remain in source/assets; they are no longer a second maintained portrait selection. Speaker cards retain the ZIP's image/title-only presentation. The source-to-canonical image and text mapping is recorded in [Phase 3 evidence](../reports/codex-phases/phase-03-evidence/audit.json).

The `person` layout gives the existing first source portrait the ZIP's `image-square` treatment in place; its alt text, alignment, caption and surrounding biography remain intact. Both cards and details therefore use the same real image without adding portrait metadata to 63 existing records. Explicit native `thumbnail` metadata takes precedence on both surfaces and replaces the existing primary image in place, avoiding duplicates. A record without a source image or thumbnail stays image-free. All original person Markdown remains unchanged, and published reverse links continue to derive from news/event/paper IDs.

## News, events and ordered relationships after Phase 4

The named `news`/`post` and `events`/`event` paths now use the real `_news` and `_events` collections. A shared native `chronological-items.html` include supplies directories, homepage selections and person reverse lists. Dated news is newest first; undated records follow alphabetically with no fallback date. Events use verified `date`/`end-date` metadata copied from their retained source definitions, earliest first, and past/upcoming selection uses the inclusive final day at build time. Cards preserve the ZIP's 16:9 frames and date-range treatment, adding the existing source Location label. No JavaScript filtering or custom plugin is introduced.

The native `future: true` setting keeps future event occurrence dates from suppressing their published routes. `undated: true` explicitly identifies the three canonical and nine alternate news records without verified date metadata; no publication date was inferred from related versions or a build timestamp.

`relationships.html` resolves each stored author/speaker ID in order. Three source conference Speakers sections render their 68 original excerpts and affiliations through the same card include, at the original position and with original keynote/featured headings. The redundant generated speaker section is suppressed there; its old `speakers-title` anchor remains as an alias. Cards use canonical person portraits, while all former source pictures/fragments remain in Markdown/assets and [Phase 4 mapping evidence](../reports/codex-phases/phase-04-evidence/audit.json). Other events receive the shared generated section once below the body. No author/speaker ID, canonical profile or reverse relationship is copied or inferred.

## Validation and delivery

Run the repository's build, full-content/asset/link checks, author relationship checks and desktop/mobile browser flows. Compare computed visual styles and representative screenshots against a build of the ZIP itself. Keep content hashes unchanged during theme-only tasks. Shared presentation and newly generated navigation can differ from archival body text; complete bodies must still match their retained signatures.

The ZIP documents describe the example starter; they do not replace the user's instructions, this repository's content-fidelity rules or its supported runtime. The legacy acquisition prompts now identify their scope explicitly.

A local build or cloud-environment publication does not deploy GitHub Pages. Local edits must be committed/pushed and the configured Pages workflow must succeed before the public site can reflect them. Deployment is a separate action requiring the user's authorization.


For the standard build, `python3 scripts/check_theme.py` verifies exact imported files and active native components. For a rendered reference comparison, build the extracted starter into a separate directory with the same local Poppins faces, then run `python3 scripts/check_theme.py --reference-site /path/to/reference-build`. Redirect plugins can be omitted when building that typography/component reference; source-content and route correctness are validated independently against the application build.
