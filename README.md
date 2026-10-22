# CHERI Alliance website

A Jekyll site for GitHub Pages. Work on `design/catalogue-polish`.

## Run locally

```sh
bundle install
bundle exec jekyll serve --safe
```

Open <http://localhost:4000>. Build once with `bundle exec jekyll build --safe`;
generated files go into `_site/` and are ignored by Git.

The existing Alpine setup in `.devcontainer/` provides Ruby, Bundler and the
Gemfile dependencies. In VS Code, choose **Dev Containers: Reopen in Container**,
then run:

```sh
bundle exec jekyll serve --safe --host 0.0.0.0 --port 4000 --force_polling
```

## Edit content

See [the publishing guide](pages/publishers.md), served at `/publishers/`, for
Markdown, front matter, media paths and collection conventions. It is unlisted.

- `pages/` and the collection directories contain Markdown content.
- `_layouts/`, `_includes/`, `_sass/` and `_data/` render the site.
- `assets/` contains the public images, PDFs, fonts and browser code.
- `_redirects/` preserves old public URLs.
- `_config.yml` defines routes, navigation and the GitHub Pages configuration.

GitHub Pages builds directly from its configured branch and root directory.
No custom workflow, Python scripts or generated migration files are required.
For project sites, set the appropriate `url` and `baseurl` in `_config.yml`.
