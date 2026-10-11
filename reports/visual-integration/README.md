# Visual integration and repair — 11 October 2026

Implemented on `codex/phased-site-transformation`, continuing from the latest pushed development commit `565567f8a2db6416aa2917600a57e690d264c9b0`. This report covers the user's complete visual-integration request following Phase 7. The original ZIP supplies the design; the repository's 476 editorial records supply the content.

## Baseline and deployment evidence

Fetched `main` at `7f3839872c8fea6a709b99d241880de0f3915c42` and the working branch at `565567f8a2db6416aa2917600a57e690d264c9b0`. Development was already ahead of `main`; none of its completed collection, relationship, image, chronology or redirect work was discarded. In particular, `main` has no homepage `slider` data, while development has two genuine featured records and the restored original ZIP slider.

The expected Pages source is `main` and `/(root)`, as documented in the repository. The current settings, latest deployment and **exact served commit remain unverified**: the public URL and Pages API returned tunnel/403 errors. Chromium navigation failed at 375, 768, 1024 and 1440px. The GitHub deployments web endpoint returned 404. The previously recorded successful managed run `38026622317` is historical evidence, not a fresh deployment result. No hosted CSS/image/JavaScript finding is inferred from a local build.

Evidence: [branch/config baseline](evidence/baseline.json), [HTTP access attempts](evidence/public-access.json), [real-browser access attempts](evidence/public-browser.json). Main, Pages settings and production deployment were not changed. No PR was opened; repository instructions require a separate request to open one.

## Diagnosed causes and implemented repairs

| Finding from source/browser evidence | Repair |
| --- | --- |
| The homepage explanation appeared below the slider, disconnected from its headline. Audience and community sections remained successive paragraphs/bullet lists. | Keep both genuine introductory paragraphs in the native hero. Render the three audience sections as a three-column card grid, ecosystem/community as a two-column grid, and the existing membership link as a native CTA. All words, headings and destinations remain. |
| Five topic hubs had the same uncomposed curated sections. | Reuse the section renderer on all five hubs, ahead of the existing child-page directories. Markdown remains the single source of text and links. |
| Speaker talk titles, dates, locations and actions ran together as loose paragraphs. | Group 85 complete talk sequences on 59 profiles into native cards. Preserve the existing table on the remaining speaker profile as a scrolling table. No talk, affiliation, action label or download link is omitted. |
| Inferred technical diagrams were cropped into photographic square thumbnails, clipping labels. | Use the ZIP's existing `image-contain` treatment for inferred general/technical card media. Explicit thumbnails, people portraits and news/event photographs retain their existing rules. No replacement artwork is introduced. |
| A compatibility-anchor span interrupted `.breadcrumbs + .hero` on 90 pages. | Move the alias inside `.hero-intro`, preserving its ID and restoring the original selector. For example, Anthony Fox's hero top padding is now the ZIP's 16px, instead of 48px on mobile/64px on desktop. No compensating padding override was added. |
| The CHERIoT Ibex certification page overflowed to 397px at a 375px viewport. Its citation contains a bare DOI, outside the existing link-only wrap rule. | Apply the existing wrapping behaviour to article text generally. The page now measures 360px scroll width within the 375px viewport with stable scrollbar space. Code and tables retain native scrolling. |
| Three unused acquired mdBook search scripts remained published as static files. | Exclude both searcher scripts and Elasticlunr from output, preserving their original bytes in the repository. No search page, interface, index, runtime request or navigation link is present. |

The local baseline already loaded compiled `assets/css/main.css`, local Poppins fonts, genuine images, logos and backgrounds successfully. The repair does not claim those assets were missing from the live site. The ZIP's hero/card/slider/colour/background primitives were retained; 27 design/asset/script comparisons pass with only the documented local-font and adapter-import differences. Slider HTML, Sass and JavaScript are byte-identical to the supplied archive.

The initial light-theme comparison paired a hub without breadcrumbs with a reference page that has breadcrumbs. That comparison was corrected with a separate native ZIP fixture matching the hub structure. The investigation independently identified the real alias-spacing defect above; the final comparison also covers a profile with breadcrumbs. The initial failure evidence is retained in [first-pass-browser.json](evidence/first-pass-browser.json) and [spacing-and-overflow-before.json](evidence/spacing-and-overflow-before.json).

## Files and shared integration points

- `_includes/section-cards.html`, `_layouts/default.html`, `_layouts/index.html` and presentation-only front matter on the homepage/five hubs: reusable grouping of complete existing Markdown sections; optional multi-paragraph hero introduction.
- `_includes/talk-cards.html` and `_layouts/person.html`: native cards for the retained speaker-export paragraph structure, with an unchanged-table fallback.
- `_includes/hero.html`: compatibility anchors inside the hero, restoring native breadcrumb adjacency.
- `_includes/listing.html`: uncropped inferred technical media using the existing contain class.
- `_sass/_site-features.scss`: wrap bare citation text as well as linked URLs. Native design tokens and component Sass are unchanged.
- `_config.yml`: exclude three obsolete search scripts; root URL, empty `baseurl`, collection defaults and native publishing architecture remain.
- Authoring/theme/deployment/validation documentation and `TRANSFORMATION_PROMPT.md`: describe the implemented adapters, remove contradictory search/filter requirements and point to current native checks.
- This directory: independently reproducible browser/reference/content/design audits and their measured evidence. Earlier phase evidence is preserved.

## Screenshots

These are local Chromium screenshots, not screenshots of a successfully accessed public site. The baseline build is the original development SHA above. Full-page captures retain the genuine content; the independent ZIP reference includes its demonstration content only outside the repository build.

| Representative page/component | Before | After/reference |
| --- | --- | --- |
| Homepage, 1440px | [Before](evidence/before-home-1440.png) | [After](evidence/after-home-1440.png) |
| Homepage, 375px | [Before](evidence/before-home-375.png) | [After](evidence/after-home-375.png) |
| Homepage, intermediate widths | — | [768px](evidence/after-home-768.png), [1024px](evidence/after-home-1024.png) |
| Robert Watson, 1440px | [Before](evidence/before-people-robert-watson-1440.png) | [After](evidence/after-people-robert-watson-1440.png) |
| Robert Watson, 375px | [Before](evidence/before-people-robert-watson-375.png) | [After](evidence/after-people-robert-watson-375.png) |
| Discover hub, 1440px | [Before](evidence/before-discover-1440.png) | [After](evidence/after-discover-1440.png) |
| Discover hub, 375px | [Before](evidence/before-discover-375.png) | [After](evidence/after-discover-375.png) |
| Profile spacing, 375px | [Before](evidence/before-profile-spacing-375.png) | [After](evidence/after-profile-spacing-375.png) |
| Unlinked citation, 375px | [Before](evidence/before-citation-375.png) | [After](evidence/after-citation-375.png) |
| Authentic slider, 1440px | [Application](evidence/slider-1440.png) | [Independently built ZIP, same data](evidence/zip-slider-1440.png) |
| Authentic slider, 375px | [Application](evidence/slider-375.png) | [Independently built ZIP, same data](evidence/zip-slider-375.png) |

Additional member, news, board, event, policy and form screenshots are in `evidence/`. The original ZIP homepage is also captured at [1440px](evidence/zip-home-1440.png) and [375px](evidence/zip-home-375.png).

## Fresh verification

**Final all-page browser rerun passes:** all 476 editorial routes at all four requested widths, plus 24 representative prefixed views (**1,928 observations**). There is no horizontal/card overflow, clipped card content, missing/faded image, missing font, local resource failure, console error, nested link, empty card or duplicate onward section in those checks. All 16 shared light/dark/card ZIP style comparisons pass. All 20 keyboard category flows (68 nested group checks), 10 touch category flows with every nested group, two disconnected forms, four image-dialog/Escape checks and 10 no-JS views pass.

- Native root build and safe `/cheri-preview` build succeed using github-pages 232 / Jekyll 3.10. Independent ZIP build succeeds with the same local Poppins faces. No custom plugin, framework, build dependency or repository-owned deployment workflow was added.
- All 30 existing unit tests and all 476 Markdown checks pass. The latter checks native Kramdown, image alignment/assets and absence of CMS formatting. Its historical report file was preserved; fresh output is in this evidence directory.
- Complete source/output audit passes for all 476 records, all 293 pre-existing source cards and all 242 source-navigation components. Every Markdown body hash is unchanged. Only six landing pages gain the explicitly recorded presentation metadata; all prior metadata and relationships remain.
- 366 ordered forward references and 293 reverse relationships resolve. All 112 people, nine board IDs and existing author/speaker/organisation associations remain intact.
- All 430 original asset mappings / 396 unique source assets retain their recorded hashes. 347 images decode and 17 local PDFs retain their signatures/headers. Only the three explicitly excluded search-code assets are no longer published.
- All 742 HTML outputs, 266 existing redirects and 456 canonical sitemap entries pass route checks. Both root and project builds pass **60,613 local URL/fragment references plus seven CSS dependencies**, with zero errors. External URLs are retained and enumerated, not claimed freshly reachable.
- The separate carousel/redirect browser run passes 56 root/project responsive views, four ZIP style/dimension comparisons, 11 carousel checks, 16 redirect/anchor checks, six no-JS cases and both slider CTA destinations. Timers use actual five-second waits. The hidden-tab guard uses a documented `document.hidden` simulation; it is not described as an actual background-tab experiment.
- 27 ZIP design/asset/script comparisons, seven section grids and 85 talk cards pass the independent design audit. No active search surface, index or search-script publication remains.

Reproduction commands and runtime requirements are in [docs/VALIDATION.md](../../docs/VALIDATION.md). `prepare_reference.py` extracts the actual ZIP; its layouts/Sass/JS stay authoritative. The only reference adaptations are local copies of the same fonts and separate fixtures using real slide data/matching page hierarchy. Root and prefixed application builds are independent of that reference.

Primary evidence: [content/route summary](evidence/summary.json), [body comparisons](evidence/rendered-content-audit.json), [relationships](evidence/relationship-audit.json), [assets](evidence/asset-audit.json), [root links](evidence/root-links.json), [project links](evidence/project-links.json), [design comparison](evidence/design-audit.json), [full browser results](evidence/browser.json), [carousel/redirect results](evidence/carousel-and-redirect-browser.json), [targeted layout recheck](evidence/layout-fix-verification.json).

## Unresolved exceptions and boundaries

1. **Live verification remains blocked.** The current Pages configuration, newest deployment and exact public SHA could not be fetched. Publishing remains a separate authorized action. Pushing this review branch does not update a site configured to publish `main`.
2. Existing archive limits remain explicit: raw source HTML captures are unavailable locally, and the 15 externally linked full papers were not reacquired. Saved source signatures, catalogue records and current complete Markdown were verified. There was no new scrape and no invented biography, photograph, affiliation or editorial copy. The 65 verified name-only records remain name-only.
3. The previous ZIP integration intentionally omits 133 source Where-next descriptions from display while retaining their verbatim Markdown; the template specifies a description-free CTA. Related descriptions and ordinary article prose remain visible. This repair introduces no additional content omission.
4. The previously documented `/CHERI-seL4-Exercises/exercises/buffer-overflow-global/` versus `index.html` output collision remains resolved in favour of the existing real page; the alternate captured version remains under `/reference/`. Without JavaScript, static redirects reach the destination but cannot transfer an incoming query/fragment dynamically. Both behaviours are preserved and reported in [exceptions.json](evidence/exceptions.json).

No significant additional local discrepancy is knowingly deferred; final browser status is recorded above. No merge, deployment, form submission, new external acquisition or Pages-setting change was performed.
