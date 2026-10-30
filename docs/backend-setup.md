# Email forms: setup and hosting

The website stays static. A small PHP entry point handles SMTP delivery and open-source ALTCHA verification. Choose either the complete `_site` deployment below or a separate handler for GitHub Pages. No CAPTCHA account or hosted form-service account is required; you do need a PHP host and an SMTP service.

## Build a portable `_site`

On the build machine, install Ruby 3.3, Bundler, PHP 8.2+ with OpenSSL and mbstring, and Composer 2. From the repository root:

```sh
bundle install
composer install --working-dir=forms --no-dev --prefer-dist --optimize-autoloader
bundle exec jekyll build --safe --strict_front_matter --config _config.yml,_config-php.yml
```

The PHP profile sets the public endpoint to `/forms/index.php`. Set `url` and, if needed, `baseurl` in `_config.yml` for your host before building. Jekyll prefixes local endpoints and links with `baseurl`.

The output includes static pages, `forms/index.php`, its support files, installed dependencies and `forms/schema.json`. Jekyll generates that JSON directly from `_data/forms.yml`, the same data used to render the controls. There is no separate Ruby export command and no YAML parser to install on the server. After a form edit, rebuild and deploy the frontend and handler together.

Upload the **contents** of `_site/` to `/srv/small-heath/public/` or your host's equivalent. Ruby, Bundler, Composer and the Jekyll source are not needed on the production server after this build.

## Keep settings outside the public directory

The expected server layout is:

```text
/srv/small-heath/
├── .env
├── form-runtime/
└── public/
    ├── index.html
    ├── assets/
    └── forms/
        ├── index.php
        ├── app.php
        ├── config.php
        ├── cleanup.php
        ├── schema.json
        └── vendor/
```

Copy the repository's `.env.example` to `/srv/small-heath/.env`. Restrict read access to the deployer and PHP process, for example owner/group access with mode `640`. Never commit it or put it in the public directory, including in backups. The handler refuses to use an environment directory inside the site directory.

By default the handler finds `.env` one directory above the site root. Set `FORM_ENV_FILE` in PHP-FPM/NGINX or the process environment if your private file lives elsewhere. The runtime directory is created beside that file, named `form-runtime`. Create it with write access for PHP if the parent directory is not writable. Keep it private and persistent across deployments; share it between PHP workers on the same host.

To put runtime records in a different private directory, set `FORM_RUNTIME_DIR` to an absolute path outside the web root. The [Docker setup](docker-setup.md) sets this to `/var/lib/small-heath/form-runtime` automatically.

Fill in `.env`:

```dotenv
FORM_ENABLED=true
FORM_ALLOWED_ORIGINS=https://housing.example.org
FORM_CONTACT_RECIPIENT=your-receiving-address
FORM_APPLICATION_RECIPIENT=your-receiving-address

SMTP_HOST=your-smtp-host
SMTP_PORT=587
SMTP_ENCRYPTION=tls
SMTP_USERNAME=your-smtp-username
SMTP_PASSWORD='your-smtp-password'
SMTP_FROM_ADDRESS=your-authorised-sender
SMTP_FROM_NAME="Small Heath Park Housing Co-operative"

ALTCHA_SECRET=your-random-secret
```

Use separate recipient addresses if desired. The current workspace's ignored `.env` already has the requested initial recipient for both forms; the committed template leaves recipients and credentials blank. Changes to these settings take effect on the next request without rebuilding Jekyll. Keep `FORM_ENABLED=false` until the settings are ready.

Use single quotes for passwords containing `$` so dotenv does not interpolate them. Host-supplied PHP environment settings take precedence over the file. `SMTP_FROM_ADDRESS` must be a sender your SMTP provider permits; a resident's email becomes Reply-To. Use `tls` on 587 for STARTTLS or `ssl` on 465 for implicit TLS. Certificate validation remains enabled; unencrypted SMTP is permitted only for a loopback test sink.

Generate the ALTCHA secret on your server:

```sh
php -r 'echo bin2hex(random_bytes(32)), PHP_EOL;'
```

`FORM_ALLOWED_ORIGINS` lists exact website origins, comma-separated, without paths or trailing slashes. For GitHub Pages use `https://adam-3bian.github.io`, including when the site is under a project path. Add a custom domain's origin if needed. Do not use `*`. A same-host PHP deployment also needs its website origin in this list.

## NGINX and PHP-FPM

Adapt [nginx-example.conf](nginx-example.conf) to your domain, TLS certificate paths, public directory and PHP-FPM socket. It serves HTML/assets normally, executes only `/forms/index.php`, and denies HTTP access to other files under `/forms/`. `.env` and runtime files remain outside the document root.

Run `nginx -t` on your server, then reload NGINX using your host's normal procedure. For deployment under a subdirectory, prefix the endpoint location and its script paths to match your `baseurl`. The supplied example assumes the site is at the domain root. Configure equivalent access rules if you use another web server; do not serve PHP source as text.

If the handler has its own domain, the same example works with only the built `forms/` directory under `public/`. Replace the general `location /` with `return 404` inside that block and remove `error_page 404 /404.html` when no site pages are deployed there.

If a trusted reverse proxy fronts NGINX, configure NGINX's real-IP module for that proxy before passing the address to PHP. The handler uses `REMOTE_ADDR`, not untrusted forwarded headers.

## Local PHP preview

Build the PHP version as above. Keep your local `.env` in the repository root, beside `_site/`; do not overwrite an existing configured file. Add `http://127.0.0.1:4000` to `FORM_ALLOWED_ORIGINS`, configure a test SMTP service, and run:

```sh
php -S 127.0.0.1:4000 -t _site
```

Open `http://127.0.0.1:4000`. This executes the built PHP handler, unlike `jekyll serve`. PHP's development server is for local use; use the NGINX access rules for production. The automated backend test below uses its own isolated configuration and mail sink, so it does not require your SMTP credentials.

## GitHub Pages with a separate handler

GitHub Pages cannot execute PHP or run NGINX. The website can stay on Pages while the same handler runs on another HTTPS host:

1. Install Composer dependencies and build the PHP profile as above. Copy the resulting `_site/forms/` to the PHP host's `public/forms/`. Configure its private `.env` and NGINX as above.
2. Put `https://adam-3bian.github.io` in `FORM_ALLOWED_ORIGINS` on that host.
3. Set the public URL in the Jekyll `_config.yml`:

   ```yaml
   forms:
     endpoint: 'https://forms.example.org/forms/index.php'
     privacy_url: /form-information/
   ```

4. Build and deploy the **default** Jekyll configuration to Pages:

   ```sh
   bundle exec jekyll build --safe --strict_front_matter
   ```

The default build excludes the entire `forms/` directory. The handler uses `?form=contact` and `?form=application`; `&challenge=1` requests an ALTCHA challenge. Supply the base endpoint without query parameters. It works across origins through a restricted CORS allowlist and does not use browser cookies.

After changing `_data/forms.yml`, deploy a fresh PHP-profile handler build as well as the static Pages build. The included GitHub Actions workflow checks both outputs but deploys only the static one to Pages.

## Check delivery

Before enabling resident submissions:

1. Open the contact page on the deployed HTTPS site, complete ALTCHA and send a fictional test message.
2. Check the receiving inbox and verify Reply-To, then test a fictional housing application.
3. Check that `/forms/config.php`, `/forms/vendor/autoload.php` and `/.env` are inaccessible over HTTP.
4. Keep the PHP error log available for operational checks. It records exception classes without submitted content, passwords or SMTP transcripts.

Success means the SMTP server accepted the message. It does not guarantee inbox delivery; check your provider's domain authentication, spam filtering and delivery logs.

For repeatable local integration checks with no external email:

```sh
PHP_SITE=_site python3 tests/check-backend.py
```

## Spam protection, storage and maintenance

The pinned ALTCHA 3.5.0 browser widget is served locally with its MIT licence. The official PHP library creates signed, expiring proof-of-work challenges bound to the form, origin and requesting IP. A challenge can be used only once. Tracking, cookies and the optional interaction collector are disabled.

The handler validates required and conditional fields, dates, allowed choices, repeat rows and declarations. It also checks body size, a honeypot and request rates. Failed validation, CAPTCHA or SMTP delivery leaves answers in the browser form. Duplicate successful submissions reuse a receipt instead of sending another message.

`FORM_RATE_LIMIT` defaults to five attempts per IP per hour; `FORM_CHALLENGE_LIMIT` defaults to sixty. Tune these for shared connections. `ALTCHA_COST`, `ALTCHA_MAX_COUNTER` and `ALTCHA_EXPIRES` control proof-of-work difficulty and lifetime. Keep browser and PHP library versions compatible when upgrading.

`form-runtime/` stores only rate timestamps, consumed challenge identifiers and keyed duplicate fingerprints with delivery references, not message bodies or applications. Run this hourly from cron as the PHP user to remove technical records older than 48 hours:

```sh
php /srv/small-heath/public/forms/cleanup.php
```

If you use a custom private path, supply the same `FORM_ENV_FILE` for this command. Cleanup avoids records locked by active requests. Email retention is managed by the receiving mailbox.

## Troubleshooting

- **Unavailable notice:** the static site's `forms.endpoint` is empty. Set a real public endpoint and rebuild, or use the PHP build profile.
- **404 for the handler:** check that the PHP profile was used and the NGINX exact location matches the endpoint, including any subdirectory.
- **503 response:** check `FORM_ENABLED`, SMTP, `ALTCHA_SECRET`, Composer installation, generated `forms/schema.json` and private runtime permissions. Check the PHP log for the exception class.
- **403 response:** the exact website origin is missing from `FORM_ALLOWED_ORIGINS`.
- **422 or 409 response:** correct the indicated answers or complete a new ALTCHA check; answers remain in the form.
- **429 response:** the configured hourly request limit was reached.
- **CORS/network error:** verify the public HTTPS URL, certificate, NGINX route and origin allowlist.

No production handler URL or SMTP credentials were supplied during development. The default Pages endpoint is therefore empty and the local service remains disabled until deployment is configured. The NGINX template must be checked on the actual server with its real paths, certificates and PHP-FPM socket.
