# CHERI Alliance — active content and migration fidelity contract

This document records content-preservation requirements. [docs/THEME.md](docs/THEME.md) and the retained starter ZIP define presentation. The two original CHERI sites are distinct sources of provenance, not required visual matches.

## Scope and sources

Preserve **all currently available repository content**, including canonical and differing historical versions. Content accuracy is source-backed: complete source text, headings and anchors, quotes, link labels/destinations, lists, definitions, code, tables, captions, dates, image roles and original assets. Never replace source bodies with excerpts or invented text; a source-backed title-only person does not justify a fictional biography. A full paper catalogue entry and a linked external PDF are not an acquired full-paper body.

Only a separately authorized acquisition task may expand coverage of `cheri-alliance.org` or `cheri-alliance.github.io`. Such work must record each original URL, redirects, source site, content capture/snapshot timestamp, status, provenance, assets and exact conversion verification. The provisional `CHERI_HIERARCHICAL_SITEMAP.md` and `CHERI_SITE_INVENTORY.json` are incomplete starting inventories, not proof of exhaustive discovery. Never report uncaptured source pages as complete.

## Authoring and relationships

Editorial bodies are YAML front matter plus native **Kramdown Markdown**, not embedded HTML/Liquid, WordPress wrappers or excerpt metadata. Preserve true body text and fragment IDs. Use minimal evidence-backed fields per `docs/AUTHORING.md`: `title`, true role flags (`member` / `speaker`), genuine `organization`, `speakers` and `authors` ID references, sourced dates, `permalink` and supported display/listing fields. Omit false/null/empty constructs. Derive reverse associations rather than duplicating them. Retain distinctly differing source versions separately and avoid duplicate canonical feeds/search.

Use `_hardware/` for boards, cores and hardware platforms, `_software/` for software and simulators. Governance board data is an ordered list of nine verifiable people IDs in `_data/governing-board.yml`, with the genuine leadership page in `pages/alliance/leadership/`; do not create a governance `_boards/` collection. Preserve all established canonical routes, role flags and IDs.

Source image roles may use `.image-left`, `.image-right`, `.image-full` and `.image-inline` attribute lists; retain original ratios and source reading order, but let the ZIP control published image/component appearance. Preserve original assets and downloads without stock/fake replacements. Document deliberate same-entity asset repairs, redirects and broken source anchor corrections separately; do not hide them by rewriting the comparison baseline.

## Fidelity proof and honest limits

Compare rendered output with retained source signatures, normalising only semantically irrelevant whitespace/HTML structures and **documented** canonical link or fragment repairs. Never normalise away missing text, table cells, headings, image destinations, code or original link labels. Keep `reports/source-manifest.csv`, `reports/asset-manifest.csv`, `reports/content-validation.csv`, `reports/website-editions.json` and other existing evidence when present; do not fabricate missing evidence.

Record exact errors and unresolved external content in `PROGRESS.md` and appropriate reports. All available repository content is required for this site; exhaustive historical-worldwide discovery and external PDF acquisition are separate, currently unfinished work. See `docs/VALIDATION.md` for acceptance checks.
