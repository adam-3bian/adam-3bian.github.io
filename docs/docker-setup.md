# Docker Compose setup

This starts a complete website on Alpine Linux using NGINX, PHP-FPM and a one-off Jekyll build container. Bundler, Jekyll and the PHP dependencies are installed inside the images; the host needs Docker Engine and the Docker Compose plugin, not Ruby, PHP or Composer.

## Start the website

From the repository root:

```sh
docker compose up --build -d
```

Open **http://localhost:8080**. The first run downloads and builds the images; later runs reuse the build cache. The `site-build` container exits after generating the site, which is expected. NGINX and PHP remain running:

```sh
docker compose ps -a
docker compose logs site-build
```

The website works immediately. Forms show the unavailable notice until you configure and enable SMTP below; you can still read the application and use the paper or telephone options.

## Files and mounts

```text
Repository                            Container
etc/nginx/conf.d/                 ->  /etc/nginx/conf.d/        NGINX settings
etc/small-heath/.env              ->  /etc/small-heath/.env     Private settings, read-only
www/html/                         ->  /www/html/                Generated website
var/lib/small-heath/form-runtime/ ->  /var/lib/small-heath/form-runtime/  Private records
```

The `www/html` directory is created automatically and contains the same static pages and PHP handler as the portable `_site` build. The builder regenerates the site at startup and overwrites matching generated files; edit the Markdown and YAML source instead of editing this folder. It does not delete unrelated files. NGINX and PHP mount the generated site read-only.

The private `.env` and runtime directory are outside `/www/html`. Git and the Docker build context exclude them. PHP copies `.env` to a private in-memory directory at startup so its workers can read it even when the host file has mode `600`. The PHP container owns its runtime directory and creates it with private permissions; use a directory dedicated to this application. `docker compose down` does not remove the bind-mounted website or runtime data.

To check the installed build tools:

```sh
docker compose run --rm --no-deps site-build bundle --version
docker compose run --rm --no-deps site-build bundle exec jekyll --version
```

## Enable email

Copy the template only if you do not already have a configured file:

```sh
cp .env.example etc/small-heath/.env
chmod 600 etc/small-heath/.env
```

Edit `etc/small-heath/.env` on the server. Set both recipient addresses, an authorised SMTP sender, SMTP server, port, encryption, username and password. Set `FORM_ALLOWED_ORIGINS` to the exact website origin, for example `http://localhost:8080` for local testing or `https://housing.example.org` for a real domain. Origins are comma-separated and have no trailing slash or path. Generate a new ALTCHA secret with:

```sh
docker compose exec php php -r 'echo bin2hex(random_bytes(32)), PHP_EOL;'
```

Put that value in `ALTCHA_SECRET`. Set `FORM_ENABLED=true` only when the SMTP settings are ready, then recreate the services so PHP reloads the private file and Jekyll enables the public form endpoint:

```sh
docker compose up --build --force-recreate -d
```

The `.env` contents are not published in the site. Keep backups private as well. The single generated schema comes from `_data/forms.yml`; changes to form definitions need only a rebuild, not a separate Ruby export.

Send fictional test messages through both forms and confirm they arrive in the configured inbox. SMTP acceptance is not a guarantee of inbox delivery. See [email settings and troubleshooting](backend-setup.md) for SMTP encryption, ALTCHA, data retention and operating details.

## Change the address or directories

The default public address is `http://localhost:8080`. For a different port or domain, supply the port and canonical website URL together when starting or rebuilding:

```sh
SITE_PORT=8081 SITE_URL=http://localhost:8081 docker compose up --build -d
```

For production, use your public HTTPS origin as `SITE_URL`, include that origin in `FORM_ALLOWED_ORIGINS`, and terminate TLS with a reverse proxy or adapt the NGINX configuration to use your certificate. The supplied Compose listener is HTTP for straightforward local setup. If a reverse proxy is in front of NGINX, configure trusted real-IP addresses for that proxy so rate limits identify clients correctly; do not trust arbitrary forwarded headers.

The default bind-mounted folders can be changed with `SITE_ROOT_DIR`, `SITE_CONFIG_DIR` and `SITE_RUNTIME_DIR`. Use directories dedicated to this site; the runtime directory's ownership is assigned to the PHP worker. Keep both the configuration and runtime directories outside the web root.

After editing `etc/nginx/conf.d/default.conf`, check and reload it:

```sh
docker compose exec nginx nginx -t
docker compose restart nginx
```

The supplied rules execute only `/forms/index.php` and deny HTTP access to the other PHP, schema and dependency files. The handler can also serve a separate GitHub Pages frontend: set its Pages `forms.endpoint` to this host's public HTTPS `/forms/index.php` URL and add the Pages origin to `FORM_ALLOWED_ORIGINS`.

## Update, maintain and stop

After editing site content, `_data/forms.yml` or dependencies, rebuild and restart:

```sh
docker compose up --build -d
```

Run cleanup hourly from your server's scheduler to remove technical records older than 48 hours:

```sh
docker compose exec -T php php /www/html/forms/cleanup.php
```

Stop the services with:

```sh
docker compose down
```

If the site does not start, check `docker compose logs site-build`, `docker compose logs php` and `docker compose logs nginx`. If the form displays an unavailable notice after enabling it, recreate the services and check the `.env` file, allowed origin, SMTP settings, ALTCHA secret and private runtime permissions. PHP logs omit submitted answers and SMTP credentials.
