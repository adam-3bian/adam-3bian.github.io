# Global page bounds

This change follows the supplied global layout sketch on `design/catalogue-polish`. The header and breadcrumb background span the viewport. The hero, content, subscription and footer have matching centred outer edges, with separate rounded, opaque surfaces and 16px gaps. The slider and optional supporting aside belong inside the content surface.

## Shared geometry

The existing 1264px site container remains the outer frame: 20px gutters below 768px and 32px gutters from 768px. This gives a maximum panel width of 1200px. Panels have 16px inner padding on mobile and 32px from tablet upwards. All containers use the shared 10px radius on all four corners, including the content panel, footer and mega menus. The watermark remains visible in the surrounding canvas and gaps. The breadcrumb strip uses a pale blue surface with dark blue links.

The screenshots and verification below record the initial bounds revision at `3cb7bb5`, before the follow-up colour and corner standardisation.

All live page families use this composition through the existing `page`, `list`, `detail` and `article` layouts. Article text and its lead image retain the 52rem reading width inside the full-width panels. Details keep their useful aside on desktop and stack it above the body on narrower screens. Catalogue identity cards stack below 480px to leave a usable text column inside the mobile panel.

Legacy anchor spans no longer add a flex gap before a hero or a false paragraph gap before the first content heading. Mobile directory summaries use 1.5 line spacing to keep the first result within reach. Long native contact dropdown labels wrap: this fixes the WebKit 320px overflow seen in the preceding CI run, while retaining the native control and its focus outline.

## Jekyll and GitHub Pages only

The build job uses `actions/jekyll-build-pages@v1` to render the checked-in Markdown, Liquid, YAML and Sass directly. It has no Python, Node, content preprocessing or alternative frontend build step. GitHub's output is shared with a separate validation job. That job uses Ruby and Python checks, browser automation and axe; it also exercises a native Jekyll build under `/preview`. Publishing uses `actions/deploy-pages@v4`, restricted to `main` after both jobs pass. This review changes only `design/catalogue-polish`.

## Review views

Each pair uses the same viewport and content. The before build is commit `3a96ce2`; screenshots load local fonts and all images before capture.

| View | Before | After |
| --- | --- | --- |
| Home, 1440px | [Before](screenshots/before-home-1440.png) | [After](screenshots/after-home-1440.png) |
| Event and aside, 1440px | [Before](screenshots/before-event-1440.png) | [After](screenshots/after-event-1440.png) |
| Subscription and footer, 1440px | [Before](screenshots/before-footer-1440.png) | [After](screenshots/after-footer-1440.png) |
| Contact form, 390px | [Before](screenshots/before-contact-390.png) | [After](screenshots/after-contact-390.png) |

## Verification

The source checks preserve 755 routes, 283 redirects, 366 relationships, 17,404 fragment references and 416 original assets. The rendered parity check compares text, link multiplicities, images and IDs against the prior immutable baseline; it includes breadcrumbs in their new position before `main`. The baseline is unchanged. The native Markdown checks cover 207 literal code examples and 2914 source paragraphs. No editorial records or form configuration changed.

All ten browser suites pass at the root URL, including 378 route/viewport checks across Chromium, Firefox and WebKit. The `/preview` build passes 176 component views, local forms, catalogue and semantic interactions, plus 126 Chromium corporate checks. CI retains all ten suites and the three-engine matrix for both deployments. Exact local coverage is recorded in [verification.json](verification.json). Forms retain the requested intentionally unconfigured state; no submissions are sent. The 73 existing source-data warnings remain documented in the migration report.
