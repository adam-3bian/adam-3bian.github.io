# CHERI Alliance website

Jekyll content and catalogue templates for GitHub Pages. The current working and published branch is `design/catalogue-polish`.

The [v5.3 specification](docs/migrations/v5.3/SPECIFICATION.txt) defines the content contract. [Migration notes](docs/migrations/v5.3/README.md) explain classifications, preservation checks and source-data gaps.

## Authoring

Use `_posts` for news, with dated filenames. The nine other editorial collections are events, people, organisations, papers, products, repositories, groups, guides and policies. Six real layouts replace the previous passthrough aliases: `default`, `page`, `list`, `detail`, `article` and `redirect`. Use `article` for posts, `detail` for other records, `list` with a `listing` declaration for directories, and `page` for ordinary, landing and form pages. Semantic front matter continues to distinguish every content family; no content taxonomy has been merged.

Records have a title, summary, explicit permalink and `navigation.header` context. Facts belong in their semantic group (`person`, `event`, `publication`, etc.). Related records use typed `related` references. Resource links use `resources`; forms reference `_data/forms.yml`. Inverse relationships are generated from the owning record, including all simultaneous affiliations.

Bodies use ordinary Kramdown with H2/H3 headings, fenced code, links, images, lists and tables. Keep image alignment classes beside inline images. Put the primary image in `image`, once. Literal Liquid examples need `raw` wrappers. The glossary remains a non-output support collection.

Header menus are curated in `_config.yml`. A page joins the footer only through `navigation.footer.category`; `_data/footer_categories.yml` supplies headings. Routing records in `_redirects` contain only `permalink` and `redirect_to`.

## Build and deploy

GitHub Pages natively builds and publishes its configured source, `design/catalogue-polish` at `/`. Markdown, Liquid, Sass and checked-in YAML render directly under safe Jekyll; there is no content preprocessing or separate frontend build. The validation workflow independently uses `actions/jekyll-build-pages@v1`, GitHub Pages’ official Jekyll action, and shares its output with a separate validation job. That job checks the official output and a native Jekyll `/preview` build; Python, Playwright and axe are validation tools only. This workflow has no publishing job or Pages write permission.

The previous `.github/workflows/pages.yml` workflow also exists on the frozen `main` branch and used to republish that older site during its nightly schedule. It is disabled at repository level. Validation now lives separately in `.github/workflows/design-validation.yml`, while GitHub's native `pages-build-deployment` workflow owns publishing from the configured source. Keep the old publishing workflow disabled while `main` contains the outdated version.

The [global bounds review](docs/global-bounds/README.md) documents the shared hero, content, subscription and footer frame.

## Validate locally

```sh
bundle install
python -m pip install -r requirements-dev.txt
python scripts/check_content.py
python scripts/check_refinement.py
python scripts/test_spec.py
bundle exec ruby scripts/test_event_status.rb
bundle exec ruby scripts/test_forms.rb
bundle exec ruby scripts/test_relationships.rb
JEKYLL_ENV=production bundle exec jekyll build --safe --destination dist
python scripts/check_content.py --site dist --report reports/content.json
python scripts/check_refinement.py --site dist
bundle exec ruby scripts/test_markdown.rb dist
```

Repeat the build with `--baseurl /preview --destination dist-baseurl/preview` and validate with `--baseurl /preview`. The workflow also exercises responsive layouts, keyboard/touch navigation, no-JavaScript use, catalogue controls and axe accessibility checks in both deployments.

Event status uses `site.time` and generic IANA offset periods so it works under safe Jekyll 3. Regenerate `_data/time_zones.yml` with `python scripts/generate_time_zones.py` after changing timezone support; the current range is 2020–2050. Extend the generator range and validation together for later events.

Contact and newsletter fields render locally in intentionally `unconfigured` mode, as requested. No endpoint, external hand-off, submission or success message is present. A disabled hidden default submitter prevents implicit submission with JavaScript off; the visible native button only checks validity. To activate submission later, configure a verified provider using `post` mode, with server-side validation, security controls, privacy and actual server responses. The reusable renderer also retains external and disabled modes. No contact or newsletter data is submitted by tests.

The [component consolidation report](docs/design-polish/README.md) records the measured layout fixes, template graph and responsive evidence. Run `python scripts/template_inventory.py` to check all live include references and layout inheritance, and `python scripts/test_components.py` against a served build for the spacing and component regressions.
