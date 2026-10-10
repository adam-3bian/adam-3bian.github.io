# CHERI Alliance website

**For coding agents:** Begin at [AGENTS.md](AGENTS.md). The single complete website task is [TRANSFORMATION_PROMPT.md](TRANSFORMATION_PROMPT.md); [docs/THEME.md](docs/THEME.md) and [docs/AUTHORING.md](docs/AUTHORING.md) retain the ZIP design/methodology and real-content schema, and [docs/VALIDATION.md](docs/VALIDATION.md) defines verification. Historical master prompts are retired pointers, not active instructions.

Complete static website using the uploaded simplified-authoring design and source-backed content from `cheri-alliance.github.io` and `cheri-alliance.org`. It includes responsive navigation and page/profile layouts, linked directories, full-body search, news and dated event lists, local fonts, canonical URLs, sitemap, compatibility redirects and a branded 404. Contact and newsletter forms are visible with submission disabled, as requested.

Deployment now uses the built-in GitHub Pages Jekyll build from **main /(root)**; no repository-owned GitHub Actions workflow is required. An administrator must select **Settings → Pages → Deploy from a branch → main /(root)**. The canonical user-site address is **https://adam-3bian.github.io/**. See [deployment instructions](docs/DEPLOYMENT.md).

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

The site retains the uploaded starter layouts, includes, Sass modules and scripts. Native Liquid/Jekyll templates now replace custom Ruby generators while preserving existing content records; [theme integration notes](docs/THEME.md) document the adaptation.

The menu follows the primary site's five sections and published groups, adding hardware/software/paper indexes and original-site Morello return information. Original images and downloads are in [assets/](assets/). No template sample biographies or placeholder content were imported.

Nine published editions replace static directory lists and form placeholders or correct explicit source mistakes; their complete original bodies remain as separate Markdown source versions. [The editorial change record](reports/website-editions.json) and website validation keep those changes distinct from source-body fidelity checks.

Earlier custom-build validation evidence for 477 Markdown files and site functions is retained in reports. The native GitHub Pages conversion must be verified against a successful GitHub-managed Pages build and representative rendered pages; historical checks do not prove a new native build passed.

The website works with the converted content. The broader migration remains partial: original WordPress archives and other retained pages remain unconverted, and external full-paper PDFs remain unacquired. Paper records contain complete source catalogue entries and original publication links. Earlier live checks passed for 371 distinct source pages; individual timestamps remain in the evidence reports.

See [PROGRESS.md](PROGRESS.md) for measured coverage and exceptions, [README_MIGRATION.md](README_MIGRATION.md) for build/check commands, and [MIGRATION_SPEC.md](MIGRATION_SPEC.md) for editorial requirements.
