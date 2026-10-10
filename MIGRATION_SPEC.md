# Migration authority

The full requirements are in [CHERI_MIGRATION_SPEC.md](CHERI_MIGRATION_SPEC.md), with execution rules in [AGENTS.md](AGENTS.md). Both source websites remain separately traceable.

The user's subsequent instruction requires **YAML front matter and Markdown only** for editorial content. This overrides the original spec's allowance for inline raw HTML. Use native Kramdown headings, lists, definitions, fenced code, pipe tables, links, images and attribute lists. Image roles remain source-derived `.image-left`, `.image-right` or `.image-full`; inline source images also retain `.image-inline` so they do not become floats. HTML examples inside fenced code remain literal code.

Do not add Liquid raw wrappers. Jekyll's `render_with_liquid: false` protects literal source text. Shared layouts and the presentation plugin generate browser HTML without embedding HTML in editorial Markdown.

Compare complete source bodies with generated Kramdown and built output. HTML5 parsing follows browser handling of malformed source markup. Equivalent inline containers, tight/loose single-paragraph list items and adjacent links sharing a destination are normalized; text order, code, table cells, headings, definitions, image destinations and link labels remain checked. Splitting a whole-card link into Markdown block links preserves its complete text and destination.

Paper records reproduce complete published catalogue entries and external publication links. Do not describe them as acquired full papers while external publication acquisition remains blocked. Progress and validation evidence are in [PROGRESS.md](PROGRESS.md) and `reports/`.

## Hardware and software collections

The user clarified that boards means hardware boards. Use `_hardware/` for hardware platforms, boards and processor cores, and `_software/` for operating systems, tools and simulators. Hardware product profiles join `_hardware/`; retain each original body and source route. The governing board is a standalone page under `pages/alliance/leadership/`, with its source-backed people IDs retained in `_data/governing-board.yml`. Do not create a `_boards/` collection for governance.

## Final website authoring and template

The user requested the uploaded simplified-authoring starter as the presentation template while retaining the migrated collections and complete content. Theme and navigation controls now follow that starter; earlier source pixel comparisons are historical evidence. Complete body fidelity, original assets and image-role evidence still apply.

Editorial filenames and canonical URLs omit source-host prefixes. Minimal front matter uses `title`, role flags `member`/`speaker`, and filename references `organization`/`speakers`/`authors`. Reverse links are generated. `_data/governing-board.yml` is the sole registry, containing ordered people IDs. Navigation belongs in `_config.yml`, and provenance belongs in reports. Name-only author records are explicitly authorized for contributors without profiles; no biographies or affiliations may be invented.

The final-source comparison translates only declared canonical link destinations, retaining source link labels and all body text. Same-entity source image repairs and broken source fragment corrections are recorded separately. Distinct source versions remain separately traceable. See [docs/AUTHORING.md](docs/AUTHORING.md) for the schema.
