# Validation — native GitHub Pages / ZIP design

## Publishing model

The intended publishing model is GitHub Pages' built-in Jekyll build from `main` at the user-site root. No repository-owned Actions workflow or custom `_plugins/` Ruby files are used. The GitHub-managed Pages build and deployment appear in Actions even without a custom workflow. Current live settings and the served commit could not be independently verified on 11 October 2026: the public URL and Pages API were blocked by the cloud environment. See [the current integration report](../reports/visual-integration/README.md). Do not change settings, merge or deploy without authorization.

## Actual conversion outcome (10 October 2026)

- Conversion commit: `0033782e982284241b63c23377c2927c1e525f38`.
- GitHub's managed Pages run `38026622317` **completed successfully**, including the Jekyll build and deployment: https://github.com/adam-3bian/adam-3bian.github.io/actions/runs/38026622317
- GitHub compare confirmed the former workflow and five custom Ruby plugins were deleted. The existing content collections, Markdown bodies, originals and assets were **not modified** by the conversion.
- This confirms a successful **build and deploy**, **not** complete visual, interaction, semantic-output or source-body fidelity verification. Browser checks against the ZIP and full output/asset audits have not been rerun in this session.
- The old custom-plugin validation and `PROGRESS.md` counts are historical baselines. Do not claim they still passed unchanged on native Jekyll.

## Repeatable local verification

Install the repository's GitHub Pages gems, then run:

```sh
bundle install
bundle exec jekyll build
bundle exec jekyll serve
```

On the built/hosted output verify:

1. Source-backed Markdown bodies preserve every heading, paragraph, table, definition, inline image, caption, link label, code block and original fragment anchor. Verify real people/organisations/news/events and canonical versus alternate source versions.
2. GitHub Pages serves every canonical collection permalink, generated navigation directory, source-compatible redirect, sitemap, robots file and full-body directory pages. The ZIP has no site search or directory-filter component; verify those are absent.
3. Verify navigation, focus, keyboard accessibility, responsive cards, portrait/news images, source-side references, related-content links and metadata, light/dark Poppins/honeycomb presentation and long-page overflow. Compare at 375px, 768px, 1024px and 1440px with the actual ZIP.
4. Verify disconnected contact/newsletter forms cannot submit. Test original images and downloadable assets and off-site link behavior.
5. Verify root-site URLs use `https://adam-3bian.github.io/` and no stale `/cheri-alliance-content/` baseurl. Reassess any bookmarks of the former preview path before relying on redirects.
6. Review GitHub's **pages build and deployment** status for each relevant commit. Report exact failures and incomplete external archives/PDFs; do not mark external-source acquisition complete.

All validation must be evidence-driven. A built page is not automatically a pixel-faithful or full-content-verified page.

## Instruction-only changes

For a documentation-only change, verify the Git diff changes no editorial collection files, source assets or runtime code. Do not claim Jekyll/browser tests were run if they were not.

## Phase 7 source and route audit

The reproducible cloud audit is `reports/codex-phases/audit_phase07.py BEFORE_SITE SITE PROJECT_SITE`, using the migration Python environment and prepared native bundle. It reads the frozen Phase 7 inventory, renders all current Markdown through native Kramdown, compares all available saved source signatures and paper catalogue evidence, and checks complete rendered prose plus the explicitly mapped source cards/navigation. It also audits entity IDs, original asset hashes, source routes, redirect targets, sitemap and all local root/project URLs. Raw capture availability is recorded separately; retained signatures are not a fresh raw-HTML checksum check.

`fixture_phase07.py` checks URL adaptation, including quoted attribute text, escaped code, existing prefixes, query strings and fragments. `browser_phase07.py SITE REFERENCE_SITE PROJECT_PARENT` tests the original ZIP slider with the same real slide data, root/project reading pages, redirects, anchors and JavaScript-free fallbacks. These are historical phase evidence helpers. The current native integration checks below supersede the old plugin-dependent search/filter validators. Do not run `check_live_sources.py` for a theme audit: it initiates external acquisition.

## Current visual integration checks

[reports/visual-integration/](../reports/visual-integration/README.md) contains the measured baseline, before/after screenshots and reproducible checks for this repair. The content audit uses the frozen pre-repair inventory, explicitly permitted presentation metadata, complete native Kramdown signatures and original asset evidence. It checks every editorial route and relationship. It writes only the current evidence directory, preserving previous phase reports.

In the prepared cloud environment, run from the repository root (all destinations are outside the checkout):

```sh
sh /workspace/cheri-native-bundle.sh exec jekyll build --destination /tmp/cheri-integration-site
sh /workspace/cheri-native-bundle.sh exec jekyll build --safe --baseurl /cheri-preview --destination /tmp/cheri-integration-project/cheri-preview
/workspace/cheri-migration-venv/bin/python reports/visual-integration/prepare_reference.py /tmp/cheri-integration-reference
sh /workspace/cheri-native-bundle.sh exec jekyll build --source /tmp/cheri-integration-reference/basic-site --destination /tmp/cheri-integration-reference-site
/workspace/cheri-migration-venv/bin/python reports/visual-integration/audit.py /tmp/cheri-integration-before /tmp/cheri-integration-site /tmp/cheri-integration-project/cheri-preview
/workspace/cheri-migration-venv/bin/python reports/visual-integration/design_audit.py /tmp/cheri-integration-site
python3 reports/visual-integration/browser.py /tmp/cheri-integration-site /tmp/cheri-integration-reference-site /tmp/cheri-integration-project
python3 reports/visual-integration/carousel_browser.py /tmp/cheri-integration-site /tmp/cheri-integration-reference-site /tmp/cheri-integration-project
/workspace/cheri-migration-venv/bin/python -m unittest discover -s tests -v
```

`/tmp/cheri-integration-before` is the separately built baseline commit `565567f8a2db6416aa2917600a57e690d264c9b0`. Recreate it from a temporary `git archive` extraction when needed; never reset the working branch to make a baseline. Normal installations use the repository's supported `bundle exec` instead of the prepared cloud wrapper. The audit's native Kramdown subprocess currently uses that wrapper. Browser checks use Python Playwright and `/usr/bin/chromium`; content/design audits use the existing migration dependencies.

The full browser audit visits all 476 editorial routes at 375/768/1024/1440px, then checks prefixed representative pages, light/dark ZIP styles, every primary and nested menu group, touch/keyboard/Escape, image dialogs, disconnected forms and no-JS behaviour. The separate carousel audit uses real five-second timers and tests the original ZIP's persistent-dot playback policy, reduced motion and URL/fragment redirects. The design audit verifies native source files, no search UI/index/runtime and the unpublished archive search scripts.

The Markdown validator remains `bundle exec ruby scripts/check_markdown.rb`. It writes `reports/markdown-format-validation.json`; preserve that historical file and copy the new result into the current evidence directory when reproducing this audit. Do not describe external-link availability, raw capture checksums or live hosting as verified by these local checks.
