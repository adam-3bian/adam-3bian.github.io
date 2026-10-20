# Spacing and component consolidation

Implementation on `design/catalogue-polish`, based exclusively on its starting
commit `30120f753d69365cfa65fcd2baaf84de10b2c6e2`. Before screenshots and measurements
were taken from a safe Jekyll build of that commit, before any implementation edits.

The user's [spacing/refactoring request](SPACING_SCOPE.txt) defines scope. The
[component contract](COMPONENT_CONTRACT.txt) provides design guidance; its proposed
legacy schema, optional redesigns and sign-off questions are not runtime instructions.
The existing semantic content model, branding, click-first navigation, dark homepage,
slideshow controls and technical-table behavior are retained. The user's subsequent
instruction explicitly restores on-page contact and newsletter fields without endpoints
or a visible preview notice, superseding the documents' external-only form recommendation.

## Confirmed defects and corrections

| Problem measured before | Cause | Correction and owner |
| --- | --- | --- |
| At 390px, Axiomise's title wrapped into a 56px logo column; its first card was about 290px tall | Below 480px, `display: contents` let unrelated copy children auto-place in the outer logo grid | Keep one real flex copy column, with an independently wrapping footer; consistent 24px inner padding in list and grid views. `_sass/_catalog.scss` |
| Category lists had 40px of default indentation and no shared card geometry | The template emitted `category-links` while Sass styled unused `option-*` / `index-*` names | One `category-sections` / `category-links` system, explicit margin/padding/list resets, native card links, configured desktop columns (three or four), two tablet columns and one mobile column. `_layouts/page.html`, `_sass/_catalogue-navigation.scss` |
| At 1440px, the news heading used a 1200px column while the prose used about 833px | Only `.reading-content` had a reading-width constraint | Breadcrumbs, heading, image frame, prose and resource region share a centered 52rem/832px editorial column. Authentic images retain their source fit. `_sass/_semantic.scss` |
| At 768px, the event body was only 392px wide | A 280px rail and 32px gutter remained beside the body | Stack facts/resources before the narrative below 1024px; the body becomes 704px wide. Keep a useful 70/30 desktop arrangement. Facts use two columns on tablets and one on narrow phones. `_sass/_detail.scss` |
| A 12px outer strip interrupted the main-to-newsletter transition | `main` had symmetric block margins as well as internal bottom padding | Keep the 12px upper separation and use zero lower margin; newsletter/footer still join without a gap. `_sass/_main.scss` |
| Homepage sections accumulated 72–88px before their meaningful content | Full section margins were combined with padded reading panels | Panels own 24px padding; the homepage supplies a 24px external interval, rather than another full section gap. Remove redundant heading/body and detail-layout margins. `_sass/_main.scss`, `_sass/_detail.scss` |
| Equivalent records used 16px, 20px and 24px card padding | List, grid and responsive overrides redefined the card foundation | All catalogue record cards use the existing shared 24px token. Category navigation has a deliberate compact link variant. `_sass/_catalog.scss` |
| Resource and registration roles were not represented consistently, and aside actions had uneven widths | Resource buttons inherited the secondary role, and individual labels determined aside width | One action renderer emits primary registration, secondary website and resource roles using the newsletter's shared white rounded button styling. Aside actions fill their rail and wrap safely. Facts' inline record references stay ordinary links. `_includes/action.html`, `_includes/resource-links.html`, `_sass/_actions.scss`, `_sass/_detail.scss` |

Passive panels remain passive. Navigation and downloads remain anchors; local
operations remain native buttons. Existing labels, destinations, image assets and
focus indicators are preserved. No nested controls were introduced.

The cleanup also removes obsolete `theme-content`, `entity-*`, `index-*`,
`option-*`, `related-block`, `author-credit`, `record-backlinks`, `reading-resources`,
`simple-facts`, `section-intro`, `section-link`, `card-description`, and old hardware
portrait selectors. Their classes were checked against all 755 rendered routes and
the live templates/scripts before removal.

## Template consolidation

| Measure | Before | After |
| --- | ---: | ---: |
| Include files | 40 | 31 |
| Layout files | 29 | 6 |
| Includes with exactly one source call site | 23 | 14 |
| Removed includes | — | 9 |
| Removed pass-through layout wrappers | — | 23 |
| Delegation chains collapsed | — | 4 |
| Additional owner-only fragments inlined | — | 4 |
| Duplicated full Liquid renderers merged | — | 0 |

Cards, actions, dates and images already had canonical renderers. Those genuine
shared primitives are retained; the removed duplication was in delegation layers,
padding overrides and the parallel category styling system, rather than a second
complete card/action renderer. The four collapsed chains and four inlined fragments
are itemized below.

All ten semantic families remain distinct through their existing nested metadata
and directory declarations. Posts use `article`, other records use `detail`,
directories use `list`, and ordinary/landing/form pages use `page`. `default` owns
the document shell, and `redirect` owns plugin-generated routing pages. Authoring
defaults, 472 record/page layout declarations, source validation and fixtures now
refer directly to those real layouts. Editorial bodies and other metadata are unchanged.

Merged delegation chains:

- `listing` goes into its sole `relationship-section` caller; `card` remains the
  shared renderer for directories and related lists.
- `related-content` and `site-features` merge into the meaningful `relationships`
  boundary, preserving inverse relationships, explicit related records and home features.
- `person-talks` moves into its sole relationships owner; `person-talk` remains
  shared by session and presentation rendering.
- `promotional-panel` merges into `newsletter-cta`; the global newsletter still
  owns one passive panel and one real action.
- Category links, guide neighbors, home hero markup and the trivial form-key loop
  move into their page/detail owners. Stateful form rendering stays shared.

The machine-readable [before graph](templates-before.json) and
[after graph](templates-after.json) list every file, source call count, caller and
line, dependencies, reachability and pass-through-wrapper status. Counts are source
call sites, including layout defaults and inheritance, rather than runtime loop
iterations. Raw/commented Liquid and archived migration fixtures are excluded.
No unresolved dynamic references exist. `jekyll-redirect-from` injects the `redirect`
layout at runtime for 283 routing records; this resolved dynamic binding is explicitly
recorded, so a zero direct-template-call count cannot misclassify it as unused.

### Remaining single-use includes

These have one source call site but a substantial independent responsibility or a
site-wide reusable component boundary. None is a pass-through delegate.

| Include | Reason to retain |
| --- | --- |
| `anchor-aliases.html` | Isolated legacy-fragment transform used across all rendered content; protects historical heading destinations. |
| `breadcrumbs.html` | Shared site-wide navigation primitive with generated ancestor resolution. |
| `content-urls.html` | Substantial deployment-prefix transform that preserves literal code and external URLs. |
| `directory.html` | Shared directory controls, result count, record grid, progressive enhancement and empty state for every catalogue family. |
| `event-programme.html` | Complete nested day/session/presentation renderer with scoped speaker/resource ownership. |
| `facts.html` | Shared metadata extraction and factual relationship resolution across detail families. |
| `footer.html` | Site-wide footer navigation and social destinations; independent landmark. |
| `glossary.html` | Stateful searchable glossary, term navigation and no-JavaScript fallback. |
| `header.html` | Complex shared navigation landmark, including desktop/mobile disclosures. |
| `image-overlay.html` | One independently labelled dialog boundary paired with its interaction script. |
| `newsletter-cta.html` | Site-wide subscription configuration, landmark and passive panel; former decorative delegate removed. |
| `relationships.html` | Cross-family relationship ownership, inverse lookup, explicit related records and home features. |
| `section-cards.html` | Substantial Markdown-section transformation preserving the original editorial source and order. |
| `slider.html` | Accessible interactive feature renderer with manual controls and progressive enhancement. |

## Forms

Contact has the original request selector, first/last name, email and message;
newsletter has its email field. Both render on their own pages, before the detailed
editorial guidance, and retain associated labels, responsive controls and privacy text.
There is no link out to the Alliance website or Kit within either form panel.

As explicitly requested, these forms are intentionally not connected to a service.
`submission.mode: unconfigured` has no URL, no network action and no success message.
It renders enabled local fields and a native button that checks validity. A hidden,
disabled default submitter prevents implicit Enter submission even with JavaScript
disabled. No visible preview status is added. Future POST activation still requires
a verified endpoint and the existing backend/security/response configuration; external
and disabled renderer modes retain their regression fixtures.

## Content and responsive verification

[Source preservation](source-preservation.json) verifies 801 Markdown sources:
every editorial body is byte-identical, and every front-matter value except the
layout alias is unchanged. These include the 472 rendered records/pages, 283 routing
records and 46 glossary entries.

[Rendered baseline](rendered-baseline.json) stores normalized hashes for main text,
link multiplicities, image sources and fragment IDs on all 755 routes, captured before
editing this branch. The comparison excludes only the form panel explicitly changed
by the user and normalizes the `/preview` deployment prefix. Root and preview checks
must each report zero differences. The original migration checks separately protect
366 relationships, 17,404 fragment references and 416 original binary assets.

The new component suite measures 22 real routes at **320, 375, 390, 430, 768, 1024,
1440 and 1920px**: all five category landings, home, member/speaker/news/event
directories and details, products, repositories, papers, guides, groups, glossary,
contact and newsletter. It checks real bounding boxes and computed styles, card
placement, article alignment, tablet stacking, category resets, aside actions and
focus, form semantics, nested controls and the lower page transition. The existing
suites additionally cover actual keyboard/touch menus, no-JavaScript navigation,
catalogue search/filter/sort/view persistence, programme completeness, image failures,
200% zoom-equivalent layouts, reduced motion and axe accessibility audits.

Physical iOS/Android devices are not available in this environment. Browser evidence
here uses Chromium with desktop/mobile viewport and touch emulation; it is not a claim
of physical-device certification. Existing source-data precision warnings remain
documented by the content validation report.

### Reproduce

Use the repository's GitHub Pages bundle (`github-pages` 232 / safe Jekyll 3.10),
Python requirements and an installed Playwright browser. The environment wrapper used
locally was `sh /workspace/cheri-native-bundle.sh exec` in place of `bundle exec`.

```sh
python scripts/check_content.py
python scripts/check_refinement.py
python scripts/test_spec.py
python scripts/template_inventory.py --output reports/templates.json
bundle exec ruby scripts/test_forms.rb
bundle exec ruby scripts/test_event_status.rb
bundle exec ruby scripts/test_relationships.rb
JEKYLL_ENV=production bundle exec jekyll build --safe --destination dist
JEKYLL_ENV=production bundle exec jekyll build --safe --baseurl /preview --destination dist-baseurl/preview
python scripts/check_content.py --site dist --report reports/components/root-content.json
python scripts/check_content.py --site dist-baseurl/preview --baseurl /preview --report reports/components/preview-content.json
bundle exec ruby scripts/test_markdown.rb dist
bundle exec ruby scripts/test_markdown.rb dist-baseurl/preview
python scripts/check_component_parity.py docs/design-polish/rendered-baseline.json dist --report reports/components/root-parity.json
python scripts/check_component_parity.py docs/design-polish/rendered-baseline.json dist-baseurl/preview --baseurl /preview --report reports/components/preview-parity.json
```

Serve `dist` and `dist-baseurl`, set `SITE_URL`, `REPORT_ROOT`, `AXE_PATH` and
`CHROMIUM_EXECUTABLE` as appropriate, then run:

```sh
python scripts/test_components.py
python scripts/test_forms.py
python scripts/test_layouts.py
python scripts/test_presentation.py
python scripts/test_consistency.py
python scripts/test_refinement.py
python scripts/test_catalog.py
python scripts/test_corporate.py
python scripts/test_semantic.py
python scripts/test_posts.py
```

The GitHub workflow now runs the template graph, full-route parity and component
geometry checks alongside its existing validation in root and preview deployments.
Deploy remains restricted to `main`; pushing this review branch runs validation only.

Detailed local geometry, before/after screenshots, suite logs and parity reports are
under `reports/components/`. Review-sized before/after images and final check results
are recorded below.

## Complete template decisions

Call counts refer to the graph definitions above. Full call-site paths and lines are
also in [the decision inventory](template-decisions.json). Every original file has a
disposition; removed files have zero remaining references.

| Template | Calls before → after | Disposition |
| --- | ---: | --- |
| `_includes/action.html` | 8 → 8 | Retain: Canonical navigation/resource action: safe URL/rel handling, roles, label and icon. |
| `_includes/anchor-aliases.html` | 1 → 1 | Retain: substantial isolated legacy-fragment transform across the entire site. |
| `_includes/authors.html` | 2 → 2 | Retain: Reusable author/person resolution used by bylines and publications. |
| `_includes/breadcrumbs.html` | 1 → 1 | Retain: site-wide navigation primitive with generated ancestor resolution. |
| `_includes/card.html` | 2 → 2 | Retain: Canonical family-aware record markup, shared by directories and related sections. |
| `_includes/category-links.html` | 1 → 0 | Remove: Inline the short menu-derived category traversal in the page layout. |
| `_includes/chronological-items.html` | 2 → 2 | Retain: Shared event ordering/filtering with the same boundary logic as status labels. |
| `_includes/content-urls.html` | 1 → 1 | Retain: substantial deployment-prefix transform with literal-code safeguards. |
| `_includes/date.html` | 8 → 8 | Retain: One semantic date renderer for ISO strings and native Jekyll dates. |
| `_includes/directory.html` | 1 → 1 | Retain: cross-family controls, grid, empty state and progressive enhancement. |
| `_includes/event-programme.html` | 1 → 1 | Retain: nested days, sessions, presentations and scoped speaker/resource ownership. |
| `_includes/event-status.html` | 3 → 3 | Retain: One status calculation shared by cards, filtering and detail facts. |
| `_includes/facts.html` | 1 → 1 | Retain: cross-family fact extraction and owning relationship resolution. |
| `_includes/footer.html` | 1 → 1 | Retain: independent site-wide footer landmark and navigation. |
| `_includes/form-fields.html` | 2 → 3 | Retain: Shared labelled field renderer across all form submission modes. |
| `_includes/form-from-data.html` | 1 → 2 | Retain: Meaningful stateful form renderer shared by ordinary and collection pages. |
| `_includes/glossary.html` | 1 → 1 | Retain: searchable glossary, term navigation and no-JavaScript fallback. |
| `_includes/guide-navigation.html` | 1 → 0 | Remove: Inline guide prerequisite/neighbor logic in its sole detail-layout owner. |
| `_includes/header.html` | 1 → 1 | Retain: complex site-wide desktop/mobile navigation landmark. |
| `_includes/home-hero.html` | 1 → 0 | Remove: Inline eight lines of home-only markup in its page-layout branch. |
| `_includes/icon.html` | 6 → 7 | Retain: Repeated accessible decorative icon primitive. |
| `_includes/image-overlay.html` | 1 → 1 | Retain: independently labelled dialog tied to its interaction script. |
| `_includes/image.html` | 3 → 3 | Retain: Repeated responsive media primitive preserving source fit and alternative text. |
| `_includes/listing.html` | 1 → 0 | Remove: Inline the one-use list shell into relationship-section; card markup remains canonical. |
| `_includes/local-epoch.html` | 2 → 2 | Retain: Shared IANA local-time conversion for event boundaries. |
| `_includes/newsletter-cta.html` | 1 → 1 | Retain: site-wide subscription landmark; decorative delegate merged. |
| `_includes/page-forms.html` | 2 → 0 | Remove: Inline the trivial form-key loop in its owners; retain reusable form-from-data. |
| `_includes/page-header.html` | 3 → 3 | Retain: Shared heading, summary, author metadata and authentic detail image. |
| `_includes/person-talk.html` | 2 → 2 | Retain: Shared session/presentation talk card with scoped event resources. |
| `_includes/person-talks.html` | 1 → 0 | Remove: Inline the one-use traversal into relationships; keep shared person-talk rendering. |
| `_includes/programme-speakers.html` | 2 → 2 | Retain: Shared credit resolution for sessions and presentations. |
| `_includes/promotional-panel.html` | 1 → 0 | Remove: Merge one-use decorative wrapper into newsletter-cta. |
| `_includes/related-content.html` | 1 → 0 | Remove: Merge explicit related-record resolution into relationships. |
| `_includes/relationship-section.html` | 23 → 23 | Retain: Repeated related-section primitive with a shared card renderer. |
| `_includes/relationships.html` | 1 → 1 | Retain: cross-family inverse/explicit relationships and home features. |
| `_includes/resource-links.html` | 7 → 7 | Retain: Canonical resource/registration/website/person-link resolution and action markup. |
| `_includes/section-cards.html` | 1 → 1 | Retain: substantial source-preserving Markdown section transformation. |
| `_includes/site-features.html` | 1 → 0 | Remove: Replace delegation with the meaningful relationships boundary; preserve home features there. |
| `_includes/slider.html` | 1 → 1 | Retain: accessible interactive features, controls and no-JavaScript fallback. |
| `_includes/url.html` | 5 → 5 | Retain: Shared safe root/baseurl/external URL normalization. |
| `_layouts/article.html` | 1 → 49 | Retain: actual editorial composition without a persistent fact rail. |
| `_layouts/default.html` | 3 → 3 | Retain: shared document shell; no unrelated content logic added. |
| `_layouts/detail.html` | 9 → 260 | Retain: actual facts/resources/article/guide composition. |
| `_layouts/details/event.html` | 11 → 0 | Remove: pass-through alias; its declarative semantic source now selects the real shared layout. |
| `_layouts/details/guide.html` | 11 → 0 | Remove: pass-through alias; its declarative semantic source now selects the real shared layout. |
| `_layouts/details/member.html` | 70 → 0 | Remove: pass-through alias; its declarative semantic source now selects the real shared layout. |
| `_layouts/details/paper.html` | 21 → 0 | Remove: pass-through alias; its declarative semantic source now selects the real shared layout. |
| `_layouts/details/policy.html` | 12 → 0 | Remove: pass-through alias; its declarative semantic source now selects the real shared layout. |
| `_layouts/details/post.html` | 49 → 0 | Remove: pass-through alias; its declarative semantic source now selects the real shared layout. |
| `_layouts/details/product.html` | 3 → 0 | Remove: pass-through alias; its declarative semantic source now selects the real shared layout. |
| `_layouts/details/repository.html` | 3 → 0 | Remove: pass-through alias; its declarative semantic source now selects the real shared layout. |
| `_layouts/details/speaker.html` | 112 → 0 | Remove: pass-through alias; its declarative semantic source now selects the real shared layout. |
| `_layouts/details/working-group.html` | 17 → 0 | Remove: pass-through alias; its declarative semantic source now selects the real shared layout. |
| `_layouts/list.html` | 10 → 20 | Retain: actual family filters, source ordering and directory composition. |
| `_layouts/lists/events.html` | 3 → 0 | Remove: pass-through alias; its declarative semantic source now selects the real shared layout. |
| `_layouts/lists/guides.html` | 1 → 0 | Remove: pass-through alias; its declarative semantic source now selects the real shared layout. |
| `_layouts/lists/members.html` | 2 → 0 | Remove: pass-through alias; its declarative semantic source now selects the real shared layout. |
| `_layouts/lists/papers.html` | 4 → 0 | Remove: pass-through alias; its declarative semantic source now selects the real shared layout. |
| `_layouts/lists/policies.html` | 1 → 0 | Remove: pass-through alias; its declarative semantic source now selects the real shared layout. |
| `_layouts/lists/posts.html` | 2 → 0 | Remove: pass-through alias; its declarative semantic source now selects the real shared layout. |
| `_layouts/lists/products.html` | 1 → 0 | Remove: pass-through alias; its declarative semantic source now selects the real shared layout. |
| `_layouts/lists/repositories.html` | 1 → 0 | Remove: pass-through alias; its declarative semantic source now selects the real shared layout. |
| `_layouts/lists/speakers.html` | 3 → 0 | Remove: pass-through alias; its declarative semantic source now selects the real shared layout. |
| `_layouts/lists/working-groups.html` | 2 → 0 | Remove: pass-through alias; its declarative semantic source now selects the real shared layout. |
| `_layouts/page/form.html` | 2 → 0 | Remove: pass-through alias; its declarative semantic source now selects the real shared layout. |
| `_layouts/page/landing.html` | 6 → 0 | Remove: pass-through alias; its declarative semantic source now selects the real shared layout. |
| `_layouts/page/standard.html` | 146 → 0 | Remove: pass-through alias; its declarative semantic source now selects the real shared layout. |
| `_layouts/page.html` | 4 → 155 | Retain: meaningful ordinary/landing/form composition. |
| `_layouts/redirect.html` | 1 → 1 | Retain: runtime plugin binding for 283 redirects, not unused code. |


## Final check results

All checks below passed. [Machine-readable verification](verification.json) records
actual commands, exit codes, durations, deployments, output paths and preservation
counts. The full existing browser regression pass was followed by five checks on the
final builds: component geometry and semantic behavior in both deployments, and the
shared component consistency suite on root.

| Check | Result |
| --- | --- |
| Safe GitHub Pages/Jekyll 3.10 build, root and `/preview` | Pass |
| Content schema, taxonomy, relationships, glossary and routing, both deployments | Pass; 755 routes each, 283 redirects, 366 preserved relationships, 17,404 fragment references and 416 original assets |
| Before/after rendered text, links, image sources and IDs | Pass; zero differences on all 755 routes in both deployments, excluding only the requested form-panel replacement |
| Source preservation | Pass; 801 bodies byte-identical and all non-layout front matter unchanged |
| Include/layout graph | Pass; no missing or unresolved dynamic references |
| Schema adversarial fixtures | Pass; eight tests |
| Form, event-status/date and relationship fixtures | Pass; no data submitted |
| Markdown/code preservation | Pass; 207 literal code blocks and 2,914 source paragraphs in each deployment |
| New component geometry suite | Pass; 176 views per deployment across all eight requested widths |
| Existing layout, presentation, consistency, refinement and catalogue suites | Pass |
| Corporate navigation, keyboard/touch, reduced motion and no-JavaScript suite | Pass on root and preview in Chromium |
| Semantic family, forms, filters, inverse relationships, programme and axe suite | Pass on root and preview |
| All 48 news articles | Pass; 96 responsive checks plus bylines, metadata, reading time, images, related articles and axe checks |
| Diff whitespace and Python compilation | Pass |

The form tests cover mouse and Enter-key use with JavaScript enabled and disabled.
The intentionally unconfigured forms do not navigate, put values in query strings or
claim successful delivery. No known layout failures remain in the audited matrix.
The 73 existing source-precision warnings are unchanged; physical mobile-device
validation remains outside the available environment.

## Before/after screenshots

Both columns come from this same branch, using identical fonts, images, viewport
sizes and browser settings. The before site was built before implementation changes.
Full-page and viewport captures plus measured bounding boxes remain under
`reports/components/before/` and `reports/components/root/components/`.

| Review | Before | After |
| --- | --- | --- |
| Mobile member card, 390px | [Before](screenshots/mobile-member-before.png) | [After](screenshots/mobile-member-after.png) |
| Tablet event and facts/resources, 768px | [Before](screenshots/tablet-event-before.png) | [After](screenshots/tablet-event-after.png) |
| Desktop article alignment, 1440px | [Before](screenshots/desktop-article-before.png) | [After](screenshots/desktop-article-after.png) |
| Category links and configured columns, 1440px | [Before](screenshots/desktop-categories-before.png) | [After](screenshots/desktop-categories-after.png) |
| Homepage intro and feature spacing, 1440px | [Before](screenshots/desktop-home-before.png) | [After](screenshots/desktop-home-after.png) |
| Contact page, 390px | [Before](screenshots/mobile-contact-before.png) | [After](screenshots/mobile-contact-after.png) |

Complete restored form panels: [contact](screenshots/mobile-contact-form.png) and
[newsletter](screenshots/mobile-newsletter-form.png).
