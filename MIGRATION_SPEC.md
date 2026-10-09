# Migration authority

The full requirements are in [CHERI_MIGRATION_SPEC.md](CHERI_MIGRATION_SPEC.md), with execution rules in [AGENTS.md](AGENTS.md). Both source websites remain separately traceable.

The user's subsequent instruction requires **YAML front matter and Markdown only** for editorial content. This overrides the original spec's allowance for inline raw HTML. Use native Kramdown headings, lists, definitions, fenced code, pipe tables, links, images and attribute lists. Image roles remain source-derived `.image-left`, `.image-right` or `.image-full`; inline source images also retain `.image-inline` so they do not become floats. HTML examples inside fenced code remain literal code.

Do not add Liquid raw wrappers. Jekyll's `render_with_liquid: false` protects literal source text. Shared layouts and the presentation plugin generate browser HTML without embedding HTML in editorial Markdown.

Compare complete source bodies with generated Kramdown and built output. HTML5 parsing follows browser handling of malformed source markup. Equivalent inline containers, tight/loose single-paragraph list items and adjacent links sharing a destination are normalized; text order, code, table cells, headings, definitions, image destinations and link labels remain checked. Splitting a whole-card link into Markdown block links preserves its complete text and destination.

Paper records reproduce complete published catalogue entries and external publication links. Do not describe them as acquired full papers while external publication acquisition remains blocked. Progress and validation evidence are in [PROGRESS.md](PROGRESS.md) and `reports/`.

## Hardware and software collections

The user clarified that boards means hardware boards. Use `_hardware/` for hardware platforms, boards and processor cores, and `_software/` for operating systems, tools and simulators. Hardware product profiles join `_hardware/`; retain each original body and source route. The governing board is a standalone page under `pages/cheri-alliance.github.io/alliance/leadership/`, with its source-backed member registry retained in `_data/governing-board.yml`. Do not create a `_boards/` collection for governance.
