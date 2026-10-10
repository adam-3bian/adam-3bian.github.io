# CHERI Alliance content

Website content from `cheri-alliance.github.io` and `cheri-alliance.org`, using the uploaded simplified-authoring starter theme. Editorial content is **YAML front matter and Kramdown Markdown only**. Provenance stays in reports; filenames and website URLs omit source-host prefixes.

**451 editorial files**, including complete original page bodies, paper catalogue entries and minimal source-named records:

| Content | Folder | Files |
| --- | --- | ---: |
| Organisations | [_organisations/](_organisations/) | 69 |
| People | [_people/](_people/) | 109 |
| Events | [_events/](_events/) | 10 |
| Paper catalogue entries | [_papers/](_papers/) | 15 |
| Hardware | [_hardware/](_hardware/) | 6 |
| Software | [_software/](_software/) | 10 |
| News | [_news/](_news/) | 56 |
| Working groups | [_groups/](_groups/) | 16 |
| Guides | [_guides/](_guides/) | 10 |
| Policies | [_policies/](_policies/) | 11 |
| Other pages and collection indexes | [pages/](pages/) | 139 |

Use `member: true` for the 52 member organisations and `speaker: true` for the 60 source-listed speakers. Link records with `organization`, `speakers` and `authors`; related events, publications and people are generated automatically. The only `_data` file is [governing-board.yml](_data/governing-board.yml), containing nine people references. See [the authoring guide](docs/AUTHORING.md) for examples.

The menu follows the primary site's five sections and published groups, adding hardware/software/paper indexes and original-site Morello return information. Original images and downloads are in [assets/](assets/). No template sample biographies or placeholder content were imported.

Validation passed for all 451 Markdown files, 376 source URL mappings, 15 paper routes, 371 live source rechecks, 29 regression tests and 15 desktop/mobile browser scenarios. All rendered local links and anchors passed. The migration remains partial: original WordPress archives and other retained pages remain unconverted, and full external paper PDFs remain unacquired. Paper records contain complete source catalogue entries and original publication links.

See [PROGRESS.md](PROGRESS.md) for measured coverage and exceptions, [README_MIGRATION.md](README_MIGRATION.md) for build/check commands, and [MIGRATION_SPEC.md](MIGRATION_SPEC.md) for editorial requirements.
