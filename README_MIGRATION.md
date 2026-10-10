# Develop and resume the migration

Use this existing checkout; cloud tasks are isolated. The migration remains partial; see [PROGRESS.md](PROGRESS.md). No form submissions are performed.

## Runtime and verification

On the Debian 13 cloud environment, `scripts/setup.sh` installs pinned Python dependencies in `/workspace/cheri-migration-venv` and a private Ruby/Jekyll runtime in `/workspace/cheri-tools/ruby`. Package signatures, checksums and TLS validation remain enabled. Retained tools and dependencies are outside the checkout.

From the repository root:

```sh
scripts/setup.sh
scripts/ruby.sh scripts/check_markdown.rb
scripts/ruby.sh scripts/build.rb
/workspace/cheri-migration-venv/bin/python scripts/check_build.py
/workspace/cheri-migration-venv/bin/python scripts/check_site_links.py
/workspace/cheri-migration-venv/bin/python scripts/check_entities.py
/workspace/cheri-migration-venv/bin/python -m unittest discover -s tests -v
python3 scripts/check_browser.py
/workspace/cheri-migration-venv/bin/python scripts/report.py
```

Validated runtime: Python 3.12, Ruby 3.3.8, Jekyll 4.3.4, Kramdown 2.5.1 and Chromium 151.0.7922.173. Browser commands use the environment's installed Playwright and `/usr/bin/chromium`. Build, HTTP, relationship and current-theme browser checks use published evidence without raw source HTML. `report.py` additionally audits locally retained raw snapshots and requires those files. Temporary local HTTP servers stop when checks finish; no persistent service is required.

Live source captures require Chromium to trust the platform CA through its supported NSS database. Preserve existing entries and request filesystem access if that database needs updating. Do not disable TLS verification.

## Editorial content and theme

See [docs/AUTHORING.md](docs/AUTHORING.md) for minimal front matter, roles, IDs and relationships. `_data` contains only governing-board people IDs. Navigation belongs in `_config.yml`; provenance belongs in reports. The supplied starter's theme, styles, brand assets and navigation controls were integrated without its sample content. Its dependency manifest was not substituted for the working Jekyll runtime.

Editorial files contain YAML front matter and native Kramdown, without embedded HTML or Liquid. Literal HTML inside fenced code remains code. Shared layouts and plugins generate presentation and reverse relationships. The requested theme supersedes earlier source pixel geometry comparisons; current browser checks exercise 15 representative routes at desktop and mobile sizes, including menus, image decoding, font loading, overflow and full visible source-body text.

Deployment must run the custom Jekyll build so the relationship and presentation plugins execute. GitHub Pages' restricted native build does not load repository plugins; use a build workflow when deploying this theme. Pushing content to this repository does not itself replace either source website.

Source signatures check complete bodies: text order, headings/IDs, paragraphs, lists, definitions, code, tables, links and original images. Canonical links, two broken source fragments and three source image repairs retain separate provenance. All rendered local routes, assets and anchors are checked; outbound links and every browser route have not been exhaustively validated.

## Resume acquisition and conversion

Run acquisition only for a deliberate next batch:

```sh
/workspace/cheri-migration-venv/bin/python scripts/capture.py --limit-per-site 250 --time-budget 180
/workspace/cheri-migration-venv/bin/python scripts/report.py
/workspace/cheri-migration-venv/bin/python scripts/crawl_assets.py --host cheri-alliance.github.io --time-budget 180
python3 scripts/browser_capture.py scripts/batch-012.json
/workspace/cheri-migration-venv/bin/python scripts/classify_layouts.py
/workspace/cheri-migration-venv/bin/python scripts/convert_batch.py scripts/batch-012.json
/workspace/cheri-migration-venv/bin/python scripts/extract_papers.py
```

The example batch is already converted. New work needs a new URL list and source evidence; rerunning it checks conversion reproducibility. Converters preserve existing canonical paths and relationship front matter and write paper provenance to `reports/paper-sources.json`. New entities still require a source-backed role/relationship audit. `prepare_authoring.py` records the initial restructuring; it is not an everyday authoring command. A wholesale restructure requires reapplying and checking declared link/image repairs.

Raw `sources/`, browser HTML/screenshots and temporary logs remain local and ignored by Git. Published records retain timestamps, source URLs and SHA-256 hashes; `reports/validation/*/source-signature.json` preserves comparison evidence. A fresh checkout must recapture missing raw snapshots for conversion. Listed snapshot paths alone do not establish that files exist.

When raw snapshots are available, additional source checks are:

```sh
/workspace/cheri-migration-venv/bin/python scripts/check_source_content.py
/workspace/cheri-migration-venv/bin/python scripts/check_live_sources.py
```

The live check fetches one primary body per migrated file, uses one worker per host and honors the original site's ten-second delay. It records changed and failed pages separately. Full discovery follows robots.txt, sitemaps and internal links, checkpoints on interruption, and preserves failed-request history. Static queue exhaustion does not establish exhaustive JavaScript, query or pagination coverage.

Asset acquisition retains original bytes, verifies file structure and deduplicates by SHA-256. Ownership follows explicit source paths/publication records. Original 404s remain recorded even when a separately documented same-entity image repair exists. Paper files reproduce complete catalogue entries; external PDFs remain unacquired. Local Poppins CSS/fonts remove the external font dependency.

Current scope and limits are measured in [PROGRESS.md](PROGRESS.md). The original large archives remain unread; the user-selected live sites are the content sources. The smaller starter archive was inspected solely as the requested template.
