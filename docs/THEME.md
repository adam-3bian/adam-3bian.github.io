# Theme authority and integration

The presentation reference is the user-uploaded `cheri-alliance-starter-kit-simplified-authoring (3).zip`. The current goal is to retain existing content while using that theme, rather than reproducing the visual design of either source website.

The archive's actual `_layouts`, `_includes`, `_sass`, branded/background assets and JavaScript components were imported. No sample articles, biographies, placeholder assets, dependency manifests or sample navigation were substituted for this repository's content and configuration. `reports/template-integration.json` records archive/file hashes and the deliberate adaptations.

## Permitted adapters

- The native header/footer read `site.navigation` from `_config.yml` directly, without a Ruby navigation adapter.
- The default Liquid layout extracts source headings and breadcrumbs without dropping original Markdown body content; collection listing and relationship Liquid includes replace generated display data.
- The default layout preserves SEO and functional includes for search, directories, author relationships and disconnected forms. The native `search-index.json`, `sitemap.xml` and redirects replace plugin-generated outputs.
- Native hero/page-heading includes accept original heading HTML to retain exact text and incoming fragment IDs. Migrated paragraphs are not removed or duplicated as synthesized introductions.
- Person layouts reuse source-owned portraits rather than inserting a second image. Existing people, organisations, news and events use the starter's person/member/post/event layouts through configuration defaults.
- `_sass/settings.scss` loads the same Poppins faces locally. `_sass/_site-features.scss` styles only added functionality and source-data adapters. It must not override theme colours, watermark opacity, hero typography or substitute a custom profile layout. The existing long navigation uses the native stacked menu at tablet widths.

The starter's defaults enable heroes on ordinary pages as well as the homepage. Its original translucent page surfaces and watermark strengths apply directly. Old `_website.scss`/`_migration-content.scss` overrides are retired from the build.

## Validation and delivery

Run the repository's build, full-content/asset/link checks, author relationship checks and desktop/mobile browser flows. Compare computed visual styles and representative screenshots against a build of the ZIP itself. Keep content hashes unchanged during theme-only tasks. Shared presentation and newly generated navigation can differ from archival body text; complete bodies must still match their retained signatures.

The ZIP documents describe the example starter; they do not replace the user's instructions, this repository's content-fidelity rules or its supported runtime. The legacy acquisition prompts now identify their scope explicitly.

A local build or cloud-environment publication does not deploy GitHub Pages. Local edits must be committed/pushed and the configured Pages workflow must succeed before the public site can reflect them. Deployment is a separate action requiring the user's authorization.


For the standard build, `python3 scripts/check_theme.py` verifies exact imported files and active native components. For a rendered reference comparison, build the extracted starter into a separate directory with the same local Poppins faces, then run `python3 scripts/check_theme.py --reference-site /path/to/reference-build`. Redirect plugins can be omitted when building that typography/component reference; source-content and route correctness are validated independently against the application build.
