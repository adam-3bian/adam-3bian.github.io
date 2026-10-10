# CHERI Alliance website

Complete static website using the uploaded simplified-authoring design and source-backed content from `cheri-alliance.github.io` and `cheri-alliance.org`. It includes responsive navigation and page/profile layouts, linked directories, full-body search, news and dated event lists, local fonts, canonical URLs, sitemap, compatibility redirects and a branded 404. Contact and newsletter forms are visible with submission disabled, as requested.

The GitHub Actions workflow builds, validates and deploys a preview artifact. The configured preview target is **https://adam-3bian.github.io/cheri-alliance-content/**; enable **Settings → Pages → Source: GitHub Actions**, then run the workflow. See [deployment instructions](docs/DEPLOYMENT.md). Existing public CHERI domains are unchanged.

Editorial content is **YAML front matter and Kramdown Markdown only**. Provenance stays in reports; filenames and website URLs omit source-host prefixes. **477 editorial files** retain complete original bodies, paper catalogue entries, minimal source-named records and the working site's indexes/hubs:

| Content | Folder | Files |
| --- | --- | ---: |
| Organisations | [_organisations/](_organisations/) | 69 |
| People | [_people/](_people/) | 112 |
| Events | [_events/](_events/) | 10 |
| Paper catalogue entries | [_papers/](_papers/) | 15 |
| Hardware | [_hardware/](_hardware/) | 6 |
| Software | [_software/](_software/) | 10 |
| News | [_news/](_news/) | 56 |
| Working groups | [_groups/](_groups/) | 16 |
| Guides | [_guides/](_guides/) | 10 |
| Policies | [_policies/](_policies/) | 11 |
| Other pages, hubs, indexes and retained source versions | [pages/](pages/) | 162 |

Use `member: true` for the 52 member organisations and `speaker: true` for the 60 source-listed speakers. Link records with `organization`, `speakers` and `authors`; related events, publications, news and people are generated automatically. The only `_data` file is [governing-board.yml](_data/governing-board.yml), containing nine people references. See [the authoring guide](docs/AUTHORING.md) for examples.

The site uses the actual uploaded starter layouts, includes, Sass modules and scripts. Source-theme palette/opacity/profile overrides were removed; [theme integration notes](docs/THEME.md) record the adapters and validation against a build of the ZIP. Existing content files remain unchanged during this theme replacement.

The menu follows the primary site's five sections and published groups, adding hardware/software/paper indexes and original-site Morello return information. Original images and downloads are in [assets/](assets/). No template sample biographies or placeholder content were imported.

Nine published editions replace static directory lists and form placeholders or correct explicit source mistakes; their complete original bodies remain as separate Markdown source versions. [The editorial change record](reports/website-editions.json) and website validation keep those changes distinct from source-body fidelity checks.

Validation covers all 477 Markdown files, 376 retained source URL mappings, 15 paper routes, 430 original asset responses, 30 regression tests, 15 desktop/mobile source-page scenarios and 12 website browser flows. Search indexes 456 canonical pages. Current build, content, link and browser checks pass at the configured preview project path using the documented private runtime. Earlier domain-root and exact locked Bundler validation is recorded separately; those were not rerun for this presentation change.

The website works with the converted content. The broader migration remains partial: original WordPress archives and other retained pages remain unconverted, and external full-paper PDFs remain unacquired. Paper records contain complete source catalogue entries and original publication links. Earlier live checks passed for 371 distinct source pages; individual timestamps remain in the evidence reports.

See [PROGRESS.md](PROGRESS.md) for measured coverage and exceptions, [README_MIGRATION.md](README_MIGRATION.md) for build/check commands, and [MIGRATION_SPEC.md](MIGRATION_SPEC.md) for editorial requirements.
