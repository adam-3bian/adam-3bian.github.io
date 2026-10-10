# Build and deploy the CHERI Alliance website

The repository is a complete static Jekyll website using the uploaded simplified-authoring design. Editorial content is Markdown with minimal YAML front matter. Custom plugins derive cards, event chronology, relationships, search and deployment URLs from those records.

## GitHub Pages preview

The preview is configured for **https://adam-3bian.github.io/cheri-alliance-content/**. This is a deployment target, not evidence that hosting is already enabled. Neither existing CHERI Alliance public domain is configured or changed.

1. In this repository's **Settings → Pages**, choose **GitHub Actions** as the source. The repository must support Pages under its current visibility and account plan.
2. Open **Actions → Build and deploy CHERI Alliance**. The workflow runs on pushes to `main`; after enabling Pages, rerun its latest run or select **Run workflow**.
3. The build installs the locked Ruby dependencies, checks Markdown, builds the complete site, validates retained source bodies/assets, local links, relationships and website outputs, and runs conversion regression tests. It uploads `_site` as the Pages artifact.
4. The deploy job publishes that artifact to the `github-pages` environment. Its successful deployment supplies the actual preview URL.

Pull requests build and validate the same artifact without publishing it. The workflow's build token has read-only repository access; the deployment job has Pages and identity-token permissions. No production credentials or form-service secrets are needed.

Use this workflow rather than the restricted native Pages Jekyll build: repository plugins are essential to the website. There is no `CNAME` file. Hosting activation and the first successful deployment must be checked in GitHub; a pushed workflow alone does not prove a live site.

## Local development

With Ruby 3.3 and Python 3.12 installed:

```sh
bundle install
python3 -m venv .venv
.venv/bin/pip install -r requirements-migration.txt
bundle exec ruby scripts/check_markdown.rb
bundle exec ruby scripts/build.rb
.venv/bin/python scripts/check_build.py
.venv/bin/python scripts/check_site_links.py
.venv/bin/python scripts/check_entities.py
.venv/bin/python scripts/check_website.py
python3 scripts/serve.py --port 4000
```

The development server serves the configured `/cheri-alliance-content/` path and a branded 404. It stops with Ctrl-C. On the prepared cloud environment, use `scripts/setup.sh`, `scripts/ruby.sh` and `/workspace/cheri-migration-venv/bin/python` as described in [README_MIGRATION.md](../README_MIGRATION.md).

Browser validation uses installed Playwright and Chromium: `python3 scripts/check_browser.py` checks 15 source-content routes on desktop/mobile; `python3 scripts/check_website_browser.py` exercises search, filters, keyboard menus, disconnected forms, responsive layouts and JavaScript-free fallbacks. Screenshots are local evidence and are ignored by Git.

The retained source bodies and the published website editions are checked separately. [website-editions.json](../reports/website-editions.json) records the exact published corrections and generated-directory substitutions. Their complete source bodies remain as Markdown under `pages/reference/source-versions/`, excluded from search and marked `noindex`.

## Forms

Contact and newsletter forms are visible previews with disabled submit buttons, no submission endpoint and no backend. The site prevents submit events; disabled buttons also prevent normal submission without JavaScript. Entered data stays on the page. Published Alliance contact and mailing-list links remain available for visitors who want to use the existing services. No form submissions were made during validation.

Connecting a form later is a separate change requiring a chosen service, endpoint, privacy review and delivery testing. The current website needs no form credentials.

## Future domain changes

The preview's `_config.yml` has `url: https://adam-3bian.github.io` and `baseurl: /cheri-alliance-content`. Layouts, Markdown links, JavaScript, CSS and local fonts support that project path.

For a later explicitly authorized domain-root deployment, change `url` to that domain and `baseurl` to an empty string, then separately configure hosting and DNS. A compatibility build can be tested without changing public settings:

```sh
CHERI_SITE_DESTINATION=/tmp/cheri-root-site CHERI_SITE_BASEURL='' CHERI_SITE_URL=https://cheri-alliance.org bundle exec ruby scripts/build.rb
CHERI_SITE_DESTINATION=/tmp/cheri-root-site .venv/bin/python scripts/check_site_links.py
CHERI_SITE_DESTINATION=/tmp/cheri-root-site .venv/bin/python scripts/check_website.py
```

The website is functional with the existing converted content. The broader migration still has unconverted original WordPress pages and unacquired external full-paper PDFs; [PROGRESS.md](../PROGRESS.md) records those limits.
