# Global page bounds

This change follows the supplied global layout sketch on `design/catalogue-polish`. The header and breadcrumb background span the viewport. The hero, content, subscription and footer have matching centred outer edges, with separate rounded, opaque surfaces and 16px gaps. The slider and optional supporting aside belong inside the content surface.

The slider has no additional backdrop or outer padding. Homepage section panels use the same card colour and shadow as the slides.

Decorative borders use a subtle shared 1px stroke, including separators above and below the breadcrumb strip, menu outlines and table grid lines.

The five category index pages show the complete menu-derived link grids, with their duplicate summary panels removed. The original Markdown remains in source and its ten heading fragments remain valid through compatibility aliases. Breadcrumbs include a subcategory only when it has a real, public destination page; other menu grouping labels are omitted.

Product manufacturers now resolve from explicit record references: Morello links to Arm and Sonata to lowRISC, with matching facts and inverse product sections. Missing manufacturer values no longer expand to the entire organisation catalogue. Empty article categories and malformed related-content references are guarded as well. The [site-wide linked-content audit](linked-content-audit.md) records source-to-rendered association checks and the external URL review.

## Shared geometry

The existing 1264px site container remains the outer frame: 20px gutters below 768px and 32px gutters from 768px. This gives a maximum panel width of 1200px. Panels have 16px inner padding on mobile and 32px from tablet upwards. All containers use the shared 10px radius on all four corners, including the content panel, footer and mega menus. The watermark remains visible in the surrounding canvas and gaps. The breadcrumb strip uses a pale blue surface with dark blue links.

The screenshots and verification below record the initial bounds revision at `3cb7bb5`, before the follow-up colour and corner standardisation.

All live page families use this composition through the existing `page`, `list`, `detail` and `article` layouts. Article text and its lead image retain the 52rem reading width inside the full-width panels. Details keep their useful aside on desktop and stack it above the body on narrower screens. Catalogue identity cards stack below 480px to leave a usable text column inside the mobile panel.

Legacy anchor spans no longer add a flex gap before a hero or a false paragraph gap before the first content heading. Mobile directory summaries use 1.5 line spacing to keep the first result within reach. Long native contact dropdown labels wrap: this fixes the WebKit 320px overflow seen in the preceding CI run, while retaining the native control and its focus outline.

## Jekyll and GitHub Pages only

GitHub Pages natively builds and publishes its configured source, `design/catalogue-polish` at `/`. The independent validation build uses `actions/jekyll-build-pages@v1` to render the checked-in Markdown, Liquid, YAML and Sass directly. It has no Python, Node, content preprocessing or alternative frontend build step. GitHub's output is shared with a separate validation job. That job uses Ruby and Python checks, browser automation and axe; it also exercises a native Jekyll build under `/preview`. The validation workflow has no publishing job or Pages write permission. The old `.github/workflows/pages.yml` workflow is disabled at repository level so its nightly run on the frozen `main` branch cannot republish an outdated site. Validation lives separately in `.github/workflows/design-validation.yml`; GitHub's native `pages-build-deployment` workflow alone owns publishing from the configured source. This revision changes only `design/catalogue-polish`.

## Review views

Each pair uses the same viewport and content. The before build is commit `3a96ce2`; screenshots load local fonts and all images before capture.

| View | Before | After |
| --- | --- | --- |
| Home, 1440px | [Before](screenshots/before-home-1440.png) | [After](screenshots/after-home-1440.png) |
| Event and aside, 1440px | [Before](screenshots/before-event-1440.png) | [After](screenshots/after-event-1440.png) |
| Subscription and footer, 1440px | [Before](screenshots/before-footer-1440.png) | [After](screenshots/after-footer-1440.png) |
| Contact form, 390px | [Before](screenshots/before-contact-390.png) | [After](screenshots/after-contact-390.png) |

## Verification

The source checks preserve 755 routes, 283 redirects, 366 original relationships, 17,404 fragment references and 416 original assets. The original migration baseline remains unchanged. The active [rendered baseline](navigation-baseline.json) accounts for the requested index summaries, breadcrumbs, manufacturer repairs and verified link corrections; it was derived from the unchanged reference DOM, independently of the implementation. The [change manifest](navigation-changes.json) records each approved transformation. All historical fragment IDs remain valid. Manufacturer card images change on the two products and their two organisations; the organisation pages gain a `products-title` fragment. Every other image and fragment-ID snapshot remains identical. Native Markdown checks cover 207 literal code examples and 2914 source paragraphs. Form configuration remains unchanged.

At the initial bounds revision, all ten browser suites passed at the root URL, including 378 route/viewport checks across Chromium, Firefox and WebKit. The `/preview` build passed 176 component views, local forms, catalogue and semantic interactions, plus 126 Chromium corporate checks. CI retains all ten suites and the three-engine matrix for both deployments. Exact historical coverage is recorded in [verification.json](verification.json). Forms retain the requested intentionally unconfigured state; no submissions are sent. The 73 existing source-data warnings remain documented in the migration report.

The follow-up visual checks pass 176 component views, 72 consistency views with 24 axe audits, 25 presentation views, and 30 focused Chromium/Firefox/WebKit views with 18 axe audits. Native root and `/preview` builds also run the new `scripts/check_linked_content.py` in CI. This compares relationship sections, fact links, author order, programme credits/resources and personal talk cards against front matter, and checks local destinations and fragments throughout the page, including navigation and footer links. Optional `--external` HTTP checks remain a separate report because third-party restrictions and outages are outside this build's control.
