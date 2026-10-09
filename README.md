# CHERI Alliance content

Live-site content migration from `cheri-alliance.github.io` and `cheri-alliance.org`, keeping each source version separately traceable.

**382 editorial files**, all in YAML front matter and Kramdown Markdown. Browse the content below:

| Content | Folder | Files |
| --- | --- | ---: |
| Organisations | [_organisations/](_organisations/) | 51 |
| Events | [_events/](_events/) | 10 |
| Paper catalogue entries | [_papers/](_papers/) | 15 |
| Hardware | [_hardware/](_hardware/) | 6 |
| Software | [_software/](_software/) | 10 |
| People | [_people/](_people/) | 63 |
| News | [_news/](_news/) | 53 |
| Working groups | [_groups/](_groups/) | 16 |
| Guides | [_guides/](_guides/) | 10 |
| Policies | [_policies/](_policies/) | 11 |
| Other source pages | [pages/](pages/) | 137 |

Hardware includes Morello, Sonata, CHERIoT, FPGA platforms, CHERIoT Ibex and X730. Simulators belong to software. The [governing board](pages/cheri-alliance.github.io/alliance/leadership/governing-board.md) stays with the Alliance governance pages.

Images and downloads are in [assets/](assets/). Source-backed organisation, paper and board registries are in [_data/](_data/). Paper entries retain complete source catalogue citations/descriptions and publication links; external PDFs have not been acquired.

Validation passed for all 382 content files, 372 source URL mappings on 367 routes, 15 paper routes, 421 asset URL mappings, 25 regression tests and 99 browser comparisons. The migration remains partial: original WordPress content, remaining assets, full local navigation routing and whole-page/mobile checks remain unfinished.

See [PROGRESS.md](PROGRESS.md) for measured coverage and exceptions, [README_MIGRATION.md](README_MIGRATION.md) for setup/build/resume commands, and [MIGRATION_SPEC.md](MIGRATION_SPEC.md) for the Markdown-only content requirements. Raw acquired HTML and screenshots remain local; published source signatures and validation reports support build checks from this repository.
