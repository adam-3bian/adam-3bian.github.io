# Separate form service

GitHub Pages serves only the Jekyll site. Run this service on a separate PHP 8.2+ host. It can use its own hostname or an NGINX path such as `https://forms.example.org/forms/`. NGINX cannot be installed on GitHub Pages itself.

## Install

1. From the site checkout, run `bundle exec ruby backend/build-schema.rb`. This exports the exact YAML field definitions from `contact.md` and `apply.md` to `backend/private/form-schema.json`. Regenerate it whenever either form changes.
2. Copy the `backend/` directory to the backend server, including the generated JSON. Run `composer install --no-dev --prefer-dist --optimize-autoloader` inside it. The dependencies are the official ALTCHA verifier, PHPMailer for SMTP and phpdotenv for standard `.env` parsing.
3. Copy `.env.example` to `.env`. Keep it **outside `public/`** and restrict filesystem access to the deployer and PHP process. Never commit it. Use the same rule for backups. Environment variables supplied by the host take precedence over the `.env` file.
4. Configure the settings below. Set `FORM_ENABLED=true` only after filling them in.
5. Point NGINX/PHP-FPM at `backend/public/index.php`. Adapt `nginx-example.conf` to your hostname, TLS certificates, filesystem paths and PHP-FPM socket. Give PHP write access to `backend/private/runtime/`; it must remain outside the web root. If using containers, persist this directory across restarts and share it between PHP workers on that host.
6. Put the public handler URL into `forms.endpoint` in the Jekyll `_config.yml`, and rebuild/deploy the site.
7. Test the live contact form with fictional data and check the receiving inbox before opening submissions to residents.

## `.env` settings

```dotenv
FORM_ENABLED=true
FORM_ALLOWED_ORIGINS=https://adam-3bian.github.io
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

Use separate recipient addresses if desired. The current workspace's ignored `.env` has the requested initial recipient for both forms; the committed `.env.example` intentionally leaves addresses and credentials blank. Use single quotes around passwords containing `$` so dotenv does not interpolate them. Do not paste SMTP passwords into the public endpoint setting.

`SMTP_FROM_ADDRESS` must be a mailbox your SMTP provider permits; the user's submitted email becomes Reply-To, not the sender. Use `tls` on 587 for STARTTLS or `ssl` on 465 for implicit TLS. TLS certificate validation stays enabled. The backend only permits unencrypted SMTP for an explicitly configured loopback test sink.

Generate a secret on the backend server:

```sh
php -r 'echo bin2hex(random_bytes(32)), PHP_EOL;'
```

`FORM_ALLOWED_ORIGINS` is a comma-separated list of exact website origins, without trailing slashes or paths. A project Pages path still has origin `https://adam-3bian.github.io`. Add a custom domain's origin if you later use one. Do not use `*`.

## Spam protection and delivery

The pinned ALTCHA 3.5.0 browser widget is served locally by Jekyll, with its MIT licence. The compatible official PHP library creates signed, expiring proof-of-work challenges. Challenges are bound to the form, origin and requesting IP and can be used once. The widget uses native checkbox presentation; its web component is the only custom element. The surrounding form uses native controls. Tracking, cookies and the optional interaction collector are not enabled.

Server validation preserves the supplied field rules, including conditional joint-applicant questions, dates, choice allowlists, repeating rows and declarations. The endpoint also checks body size, a honeypot and request rates. Failed verification or SMTP responses do not clear the user's answers. A success response is shown only after the SMTP server accepts the message. SMTP acceptance does not guarantee inbox delivery; check your provider's domain authentication and delivery logs.

`FORM_RATE_LIMIT` defaults to five attempts per IP per hour; `FORM_CHALLENGE_LIMIT` defaults to sixty. Tune these for shared connections. The handler uses `REMOTE_ADDR`, not untrusted forwarded headers. If another proxy fronts NGINX, configure NGINX's trusted real-IP module for that proxy before passing the address to PHP.

ALTCHA difficulty and expiry are configured through `ALTCHA_COST`, `ALTCHA_MAX_COUNTER` and `ALTCHA_EXPIRES`. Keep browser and PHP library versions compatible when upgrading.

The service stores only rate timestamps, consumed challenge identifiers and keyed duplicate fingerprints with delivery references. It does not store message bodies or applications. Run `php /path/to/backend/private/cleanup.php` hourly from cron to remove technical records older than 48 hours. It avoids records locked by active requests. Email retention is managed by the receiving mailbox.

## Troubleshooting

- **Unavailable notice on the site:** `forms.endpoint` is empty. The site cannot send until a real HTTPS endpoint is configured.
- **503 response:** check `FORM_ENABLED`, SMTP settings, `ALTCHA_SECRET`, Composer installation, generated schema and private runtime permissions. Logs intentionally record exception classes without message bodies, passwords or SMTP transcripts.
- **403 response:** the exact website origin is missing from `FORM_ALLOWED_ORIGINS`.
- **422 or 409 response:** correct the marked answers or complete a new ALTCHA check. Answers remain in the form.
- **429 response:** the configured hourly request limit was reached.
- **CORS or network error:** verify the public handler URL, TLS certificate and NGINX route. The backend allows only the configured origins and does not use browser cookies.

The NGINX file is a deployment template; test it with `nginx -t` on your server after substituting your actual paths and certificates. No live backend URL or SMTP credentials were supplied during the refactor, so production email delivery remains a deployment step.
