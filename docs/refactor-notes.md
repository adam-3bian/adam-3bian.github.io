# Refactor audit and verification

## Sources and scope

The replacement uses the uploaded `small-heath-park-site.zip`. The prior `adam-3bian/adam-3bian.github.io` checkout at `30120f753d69365cfa65fcd2baaf84de10b2c6e2` was inspected before replacement: its configuration, page and document layouts, contact-page front matter, navigation and deployment workflow. Its useful patterns are Markdown bodies, explicit permalinks and nested data with short Liquid loops. Its CHERI-specific collections and migration machinery are unnecessary for this smaller site and were removed as part of the requested replacement. Git history retains the previous site.

Instructions in the archive's documentation were treated as descriptions of that source, not as new instructions overriding the user's request.

## Root causes and changes

- The ZIP nested a narrow container inside padded content cards, with additional mobile padding. Form fields consequently lost usable width and no longer lined up with headings. The new layout uses one shared gutter and two widths: standard content (74rem) and reading/forms (48rem). Hero headings and their page bodies use the same container.
- Eleven Sass partials, a pass-through form layout and twelve includes split a small website across too many files. There are now two layouts, three form includes and one native CSS file. Shared control attributes are captured once in the field include.
- A custom Jekyll plugin resolved form templates and copied PHP into generated output. It would not work in a native Pages safe build. Form data now lives directly in hierarchical page front matter; plain Liquid renders it. The PHP service is excluded from Jekyll output and deployed separately.
- The long declaration lived in a YAML string. It is now readable Markdown in the application page. Other article bodies, source policy text and download links remain Markdown.
- Form labels, controls, help, choices, errors and actions use one spacing scale. Groups use fieldsets and legends, errors link to inputs, and review content is inserted as text. Repeat rows keep unique IDs, focus management and server validation.
- Browser behavior is limited to navigation and form interactions. Native details handle dropdowns. The requested ALTCHA widget is the only custom element and third-party browser code; it is pinned and locally served with its licence. The optional PHP service uses the official ALTCHA library, PHPMailer and dotenv rather than implementing cryptography, SMTP or secret-file parsing.
- `.env` contains the recipient and SMTP settings. It is ignored and outside the backend web root. Jekyll only publishes the configured `forms.endpoint` URL. The backend checks challenges and form data before handing mail to SMTP.

## Preservation

All 13 uploaded page routes remain, including `/apply/`, `/contact/`, `/key-issues/` and `/404.html`. The two original PDFs, logo and favicon are byte-identical. All contact fields and all 77 application field definitions (including repeat-row children) retain their names, types, options, required/conditional rules and validation limits. The multi-step review, conditional joint applicant fields and household/address repeaters remain functional. Submission changes from same-origin PHP to a configurable cross-origin handler because GitHub Pages cannot execute PHP.

The original unrelated CHERI routes were replaced as requested, rather than redirected to unrelated housing content. The archive's generated `_site`, duplicated `hosting`, caches, PHP copies, Sass files and plugin were not imported into the final source.

## Checks

- Jekyll 3.10 builds with `--safe --strict_front_matter` at the site root and under `/preview`.
- The static checker validates all original routes, internal links, fragments, image alternatives, form labels, unique IDs, heading order, ARIA references, canonical URLs and descriptions. No backend source or credentials appear in the generated site.
- Chromium visits all 13 pages at widths of 320, 390, 768 and 1440 pixels: 52 checks with no horizontal overflow.
- Sixteen axe checks cover home, contact, housing application and the long policy article at those widths with no reported violations in the selected WCAG A/AA and best-practice rules. This is automated evidence, not a claim of complete accessibility certification.
- Browser interactions cover keyboard/touch navigation, Escape/focus handling, invalid submissions, field-linked errors, conditional requirements, added household rows, review/edit behavior and the no-JavaScript paper/telephone fallback.
- Twenty-two backend checks exercise real ALTCHA cryptographic verification, signature tampering, cross-form challenge rejection, replay rejection, CORS, server validation, honeypot, rate/body limits, local SMTP success/failure and duplicate receipts. No external email is sent by these tests.
- A real browser completed the actual ALTCHA widget challenge and submitted a contact form to the separate PHP service with SMTP captured locally.
- Composer audit reported no known security advisories for the locked backend packages.

Representative desktop, tablet and mobile screenshots were visually reviewed. They confirm consistent reading widths, aligned form controls, clean wrapping and readable long-form content.

## Remaining deployment steps

No production form hostname or SMTP credentials were provided. `forms.endpoint` remains empty and the default backend `.env` remains disabled, so the public site clearly states that online sending is unavailable. The workspace's ignored `.env` has the requested initial receiving address for both forms. Supply the endpoint and SMTP values, deploy the PHP service and verify inbox delivery before enabling live submissions.

The NGINX template needs the actual host's filesystem paths, TLS certificates and PHP-FPM socket. It cannot be verified against that host until those details exist. Email retention and delivery configuration are controlled by the chosen mail service.
