# Deploy directly from GitHub Pages

This website is a static Jekyll site with complete source-backed Markdown content. Its real layouts, Sass, JS and assets are preserved from the user-provided simplified-authoring starter. It now uses **native Liquid and Jekyll's standard collections** rather than custom Ruby plugins or a custom GitHub Actions workflow.

## One required GitHub repository setting

Because GitHub connector file updates cannot change the repository's Pages source setting, an administrator must do this **once** in GitHub:

1. Repository **Settings → Pages → Build and deployment**.
2. Select **Deploy from a branch** (not a custom GitHub Actions workflow).
3. Choose **main** and **/(root)**, then **Save**.
4. GitHub will run its own managed Pages build/deploy process when the branch changes. That managed internal process is normal; there is no repository-owned workflow.

This repository is a **user Pages repository** (`adam-3bian.github.io`), so it publishes at `https://adam-3bian.github.io/` with empty `baseurl`. If the project-path preview `/cheri-alliance-content/` was bookmarked, it is not the canonical native Pages root; do not claim that older preview path is preserved as a separate Pages project without testing.

## Editing

Review edits on the working branch. A separately authorized merge or push to `main` triggers GitHub's built-in Jekyll publishing; pushing `codex/phased-site-transformation` alone does not update the public site. Use front matter and Kramdown according to [AUTHORING.md](AUTHORING.md). Do not add `_plugins/` or unsupported plugins, or GitHub Pages will ignore or reject them. Dynamic collection cards, source-backed references come from the included Liquid templates.

## Local build and verification

Use Ruby and the supported GitHub Pages gems. From the repository root:

```sh
bundle install
bundle exec jekyll build
bundle exec jekyll serve
```

Verify a representative sample of full article bodies, event/person pages, images, URLs, collection directories, relationships, static redirects, sitemap and 404 links after the first native Pages build. The earlier custom-plugin Python/Ruby validators and old `reports/` builds are historical evidence; they are **not** automatically run by native Pages. GitHub-hosted visual parity with the original ZIP still requires a browser audit.

Contact and newsletter forms remain disabled previews and link to existing published external services. No database, WordPress installation or external hosting is required for the website.
