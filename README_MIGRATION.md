# Develop and resume the migration

Use this existing checkout; cloud tasks are isolated. The migration remains partial; see [PROGRESS.md](PROGRESS.md). No form submissions are performed.

## Runtime and verification

On the Debian 13 cloud environment, `scripts/setup.sh` installs pinned Python dependencies in `/workspace/cheri-migration-venv` and a private Ruby/Jekyll runtime in `/workspace/cheri-tools/ruby`. Debian package signatures/checksums and TLS validation remain enabled. Dependencies and retained tools are outside the checkout.

From the repository root:

```sh
scripts/setup.sh
scripts/ruby.sh scripts/check_markdown.rb
scripts/ruby.sh scripts/build.rb
/workspace/cheri-migration-venv/bin/python scripts/check_build.py
/workspace/cheri-migration-venv/bin/python scripts/check_entities.py
/workspace/cheri-migration-venv/bin/python -m unittest discover -s tests -v
python3 scripts/check_browser.py
/workspace/cheri-migration-venv/bin/python scripts/report.py
```

Validated runtime: Python 3.12, Ruby 3.3.8, Jekyll 4.3.4, Kramdown 2.5.1, Chromium 151.0.7922.173. Browser commands use the environment's installed Playwright and `/usr/bin/chromium`. Build and HTTP comparison work from the published semantic signatures without raw source HTML. Browser checks use published `source-layout.json`; new captures require access to the live sites.

Chromium must trust the provided platform CA using its supported NSS database. This environment's existing `/home/agent/.pki/nssdb` was updated with `certutil -A` and the CA certificates from `/usr/local/share/ca-certificates/` after obtaining write permission. Preserve existing entries; initialize only an absent database. Do not disable TLS/certificate verification.

## Editorial content

All editorial files use YAML front matter and native Kramdown Markdown, with no embedded HTML or Liquid wrappers. The format audit inspects the parsed Markdown tree; literal HTML inside fenced code remains code. Collections and counts are listed in the root README and progress report. Shared layouts/plugins generate presentation HTML, including profile sidebars and article heroes.

The converter checks complete source bodies against rendered output: text order, headings/IDs, lists, definitions, code, table cells, links and images. HTML5 parsing preserves browser handling of malformed source HTML. Browser-derived image classes are stored in `reports/layout-decisions.json`. Source-backed registry relationships are separate from page content; no affiliations are guessed.

## Resume acquisition and conversion

```sh
/workspace/cheri-migration-venv/bin/python scripts/capture.py --limit-per-site 250 --time-budget 600
/workspace/cheri-migration-venv/bin/python scripts/report.py
/workspace/cheri-migration-venv/bin/python scripts/crawl_assets.py --host cheri-alliance.github.io --time-budget 600
python3 scripts/browser_capture.py scripts/browser-crawl-009.json
/workspace/cheri-migration-venv/bin/python scripts/classify_layouts.py
/workspace/cheri-migration-venv/bin/python scripts/convert_batch.py scripts/batch-011.json
/workspace/cheri-migration-venv/bin/python scripts/extract_papers.py
```

Only run acquisition/conversion commands when their input snapshots exist. `sources/`, raw browser HTML/screenshots and temporary logs stay local and are ignored by Git. Published capture records keep timestamps, source URLs and SHA-256 hashes; `reports/validation/*/source-signature.json` preserves build comparison evidence. A fresh checkout must re-capture missing raw snapshots for conversion, not claim snapshots exist because their paths are listed. Successfully retained local snapshots are checksum-checked and reused.

The public crawler consults robots.txt, reads sitemaps and follows internal links, with one network worker per source and the original WordPress site's ten-second crawl delay. It checkpoints periodically and on graceful termination; use SIGINT/SIGTERM for restartable interruption. Static discovery does not prove exhaustive JavaScript/query coverage. Failed requests retain reasons and are not silently retried; preserve their earlier evidence before a diagnosed retry. `capture-index.json` is restart state, not proof of complete migration. Keep both origins separate.

`crawl_assets.py` retains original bytes, verifies file structure and deduplicates by SHA-256. Asset ownership follows source paths or explicit publication records. Source image 404s remain original references and reported exceptions. Paper entries reproduce the complete source catalogue; full external PDFs remain blocked by network policy. Poppins source CSS/fonts are local; derived font CSS rewrites only asset URLs.

The final declared batch covers all 372 converted source URL mappings. Incremental batches remain as acquisition history. All 382 editorial files pass format checks; 99 browser-backed profiles/articles pass desktop image geometry and visible-content checks. Additional collection source screenshots do not imply completed whole-page layout verification. Local navigation routing, remaining WordPress conversion/assets and full mobile/whole-site validation are still outstanding.
