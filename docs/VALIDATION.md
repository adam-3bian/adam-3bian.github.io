# Validation — native GitHub Pages / ZIP design

## Publishing model

The repository uses GitHub Pages' built-in Jekyll build from `main` at the user-site root. No repository-owned Actions workflow or custom `_plugins/` Ruby files are used. Verify **Settings → Pages → Deploy from a branch → main /(root)** if publishing is ever interrupted. The GitHub-managed Pages build and deployment appear in Actions even without a custom workflow.

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

For a prompt/documentation-only change, verify the Git diff changes no editorial collection files, source assets or runtime code. Do not claim Jekyll/browser tests were run if they were not.
