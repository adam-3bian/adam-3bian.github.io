# Refactor audit and verification

## Sources and scope

The replacement uses the uploaded `small-heath-park-site.zip`. The prior `adam-3bian/adam-3bian.github.io` checkout at `30120f753d69365cfa65fcd2baaf84de10b2c6e2` was inspected before replacement: its configuration, page and document layouts, contact-page front matter, navigation and deployment workflow. Its useful patterns are Markdown bodies, explicit permalinks and nested data with short Liquid loops. Its CHERI-specific collections and migration machinery are unnecessary for this smaller site and were removed as part of the requested replacement. Git history retains the previous site.

Instructions in the archive's documentation were treated as descriptions of that source, not as new instructions overriding the user's request.

## Root causes and changes

- The ZIP nested a narrow container inside padded content cards, with additional mobile padding. Form fields consequently lost usable width and no longer lined up with headings. The final layout uses one shared gutter, an 82rem page grid and a 52rem reading measure. Page headings, cards, forms and footer share the page grid; long prose keeps a readable line length.
- Eleven Sass partials, a pass-through form layout and twelve includes split a small website across too many files. There are now two layouts, three form includes and one native CSS file. Shared control attributes are captured once in the field include.
- A custom Jekyll plugin resolved form templates and copied PHP into generated output. It would not work in a native Pages safe build. `_data/forms.yml` now supplies both form layouts and PHP validation data. A normal Liquid `jsonify` template generates `forms/schema.json` during the optional PHP-profile build. No plugin or separate schema-export command is needed. The default Pages build excludes PHP; the optional profile produces a portable `_site` including the handler and dependencies.
- The long declaration lived in a YAML string. It is now readable Markdown in the application page, placed beside the declaration checkboxes in step six. Other article bodies, source policy text and download links remain Markdown.
- Form labels, controls, help, choices, errors and actions use one spacing scale. Groups use fieldsets and legends, errors link to inputs, and review content is inserted as text. Repeat rows keep unique IDs, focus management and server validation.
- Browser behavior is limited to navigation and form interactions. Native details handle dropdowns. The requested ALTCHA widget is the only custom element and third-party browser code; it is pinned and locally served with its licence. The optional PHP service uses the official ALTCHA library, PHPMailer and dotenv rather than implementing cryptography, SMTP or secret-file parsing.
- `.env` contains recipient, SMTP and ALTCHA settings. It is ignored and stays beside the public directory, outside the web root; technical runtime files live there too. Jekyll only publishes the configured `forms.endpoint` URL. The backend checks challenges and form data before handing mail to SMTP.

## Layout refinement

The Confederation of Co-operative Housing website at https://www.cch.coop/ was inspected for the requested design reference. Its prominent masthead, broad navigation, generous horizontal layout and clear service links informed the refinement. Its content, artwork and organisational claims were not imported.

The original Small Heath artwork now has a larger, visible place in the header at desktop and mobile widths and anchors the home-page facts panel. A full-width navy navigation bar, lighter page headings and consistent service cards retain the site's navy, blue and magenta identity. Contact details sit beside the contact form on desktop; policy pages use a reading column and practical links. The housing form uses a numbered step sidebar beside a wider field area, with two-column controls where space permits and single-column controls on small phones.

## Preservation

All 13 uploaded page routes remain, including `/apply/`, `/contact/`, `/key-issues/` and `/404.html`. The two original PDFs, logo and favicon are byte-identical. All contact fields and all 77 application field definitions (including repeat-row children) retain their names, types, options, required/conditional rules and validation limits. The multi-step review, conditional joint applicant fields and household/address repeaters remain functional. The endpoint supports either a separate HTTPS service for Pages or same-origin PHP hosting.

The later visual refinement preserves all 13 Markdown page bodies, apart from the declaration's placement marker and heading level. A data comparison confirms that both definitions in `_data/forms.yml` exactly match the previously published form definitions; only their storage location changed.

The original unrelated CHERI routes were replaced as requested, rather than redirected to unrelated housing content. The archive's generated `_site`, duplicated `hosting`, caches, PHP copies, Sass files and plugin were not imported into the final source.

## Checks

- Jekyll 3.10 builds with `--safe --strict_front_matter` at the site root and under `/preview`.
- The site checker validates all original routes, internal links, fragments, image alternatives, form labels, unique IDs, heading order, ARIA references, canonical URLs and descriptions. The default output contains no PHP. The optional PHP output contains the handler, dependencies and generated schema. Neither output contains `.env` or runtime files.
- Chromium visits all 13 pages at widths of 320, 390, 768 and 1440 pixels: 52 checks with no horizontal overflow.
- Sixteen axe checks cover home, contact, housing application and the long policy article at those widths with no reported violations in the selected WCAG A/AA and best-practice rules. This is automated evidence, not a claim of complete accessibility certification.
- Browser interactions cover keyboard/touch navigation, Escape/focus handling, invalid submissions, field-linked errors, conditional requirements, added household rows, review/edit behavior and the no-JavaScript paper/telephone fallback.
- Twenty-two backend checks exercise the actual built PHP output: real ALTCHA cryptographic verification, signature tampering, cross-form challenge rejection, replay rejection, CORS, server validation, honeypot, rate/body limits, local SMTP success/failure and duplicate receipts. No external email is sent by these tests.
- A real browser ran the complete portable PHP build, completed the actual ALTCHA widget challenge, retained answers after a simulated SMTP failure and submitted once on retry with SMTP captured locally.
- Composer audit reported no known security advisories for the locked backend packages.

Representative desktop, tablet and mobile screenshots were visually reviewed. They confirm consistent reading widths, aligned form controls, clean wrapping and readable long-form content.

## Remaining deployment steps

No production form hostname or SMTP credentials were provided. The default Pages `forms.endpoint` remains empty and the local `.env` remains disabled, so the public site clearly states that online sending is unavailable. The workspace's ignored `.env` has the requested initial receiving address for both forms. Supply the endpoint and SMTP values, deploy the PHP service and verify inbox delivery before enabling live submissions. For a complete PHP-hosted site, the optional build profile sets the local endpoint automatically.

The NGINX template needs the actual host's filesystem paths, TLS certificates and PHP-FPM socket. It cannot be verified against that host until those details exist. Email retention and delivery configuration are controlled by the chosen mail service.
