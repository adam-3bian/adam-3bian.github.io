# Small Heath Park Housing Co-operative

A small Jekyll site for GitHub Pages, with a separate PHP service for email and ALTCHA spam protection. The site retains the pages, documents, branding and housing questions from the supplied ZIP.

## Site structure

```text
*.md                      Pages: nested YAML configuration, then Markdown content
_config.yml               Jekyll settings and the public form endpoint
_data/                    Navigation and organisation details
_layouts/                 default.html (document), page.html (page structure)
_includes/                form.html, field.html, repeater.html
assets/css/main.css       One CSS file, shared tokens and responsive rules
assets/js/                Navigation, forms and the pinned ALTCHA distribution
assets/images/            Original branding
assets/documents/         Original PDFs
backend/                  Separate PHP service; excluded from GitHub Pages
  public/index.php        The only public PHP entry point
  private/                Validation, SMTP configuration loader and cleanup
  .env.example            Non-secret configuration template
  build-schema.rb         Exports form definitions for the backend
  nginx-example.conf      Separate-host NGINX example
  composer.json           ALTCHA, PHPMailer and dotenv dependencies
  composer.lock           Locked backend dependencies
tests/                    Static, browser and backend checks
```

Two layouts and three meaningful includes handle the whole site. There are no Jekyll plugins, Sass partials, CSS frameworks, npm build steps or custom content collections. Kramdown renders editorial content. Front matter holds heroes, cards, calls to action and form definitions. Standard Jekyll filenames keep their required underscores; authored asset filenames and CSS selectors use lowercase kebab-case, and JavaScript names use camelCase.

## Run and publish

Use Ruby 3.3 and Bundler:

```sh
bundle install
bundle exec jekyll serve --safe
```

For GitHub Pages, select **GitHub Actions** in the repository's Pages settings. The included workflow builds with Jekyll 3.10 in safe mode, validates the output and the separate backend, and deploys `main`. A pull request runs checks without deployment. Native branch-based Pages builds also work because there are no unsupported plugins.

`url` is `https://adam-3bian.github.io` and `baseurl` is empty. For project Pages, set `baseurl` to the repository path. All internal links, assets and metadata use Jekyll URL filters.

## Configure forms

The static site only needs this public setting in `_config.yml`:

```yaml
forms:
  endpoint: 'https://forms.your-domain.example/forms/'
  privacy_url: /form-information/
```

The one handler serves both forms: `?form=contact` and `?form=application`; adding `&challenge=1` requests an ALTCHA challenge. Set `forms.endpoint` to the handler's full HTTPS URL without a query string. An empty value shows an honest unavailable notice and allows users to check their answers without sending them.

Recipients and SMTP settings belong in **`backend/.env`**, never Jekyll front matter, JavaScript, GitHub Actions variables embedded into the site, or committed source. `.env` is ignored by Git and `backend/` is excluded from every Jekyll build. The example NGINX root contains only `backend/public/`.

See [backend setup](docs/backend-setup.md) for `.env`, SMTP, ALTCHA, NGINX and deployment instructions. There is no hosted form-service account or CAPTCHA account to create. You do need a PHP host and an SMTP service you can send through.

## Edit content

Write page bodies in Markdown with H2/H3 headings under the layout's H1. Put structured information beside the page in nested YAML: `hero`, `services`, `cta`, `downloads` or `form`. Avoid using YAML for long paragraphs or articles. The application declaration is ordinary Markdown in `apply.md`.

Both forms define `form.sections[].fields[]` directly in their page front matter. Keep existing field `name` values stable. Supported fields are native text, email, telephone, date, number, select, textarea, checkbox and radio controls; `checkboxes` groups choices and `repeat` lists household members or previous addresses. Conditional fields use `when` and `required_when`. After changing form data, regenerate the backend schema and redeploy it:

```sh
bundle exec ruby backend/build-schema.rb
```

The original application PDF remains available. Without JavaScript, users can read every application section and use the paper form or office telephone. Online submission requires JavaScript for ALTCHA. Answers stay on the current page and are not saved to browser storage.

## Verification

```sh
bundle exec jekyll build --safe --strict_front_matter
python3 tests/check-site.py _site
node --check assets/js/forms.js
node --check assets/js/navigation.js
composer install --working-dir=backend --no-dev
bundle exec ruby backend/build-schema.rb
python3 tests/check-backend.py
```

The backend test uses an isolated `.env`, a real PHP server and a local SMTP sink; it never sends external email. For responsive and accessibility checks, install Python Playwright and axe-core in a temporary tools directory, serve `_site`, then run:

```sh
SITE_URL=http://127.0.0.1:4200 \
AXE_PATH=/path/to/axe-core/axe.min.js \
REPORT_DIR=work/browser python3 tests/check-browser.py
```

`CHROMIUM_PATH` can select an existing Chromium executable. The browser suite expects the default empty endpoint and blocks outgoing POST requests. See [audit and verification](docs/refactor-notes.md) for the refactor decisions, preservation checks and deployment limits.
