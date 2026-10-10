# Codex phase plan — CHERI Alliance Jekyll transformation

**Repository:** https://github.com/adam-3bian/adam-3bian.github.io  
**Working branch:** codex/phased-site-transformation  
**Base:** main  
**Sequence:** Phase 0, then Phases 1–8, in order. One Codex task/session per phase.  
**Publishing:** main is the GitHub Pages publishing branch. Push only to the working branch. Do not merge, deploy, force-push or change Pages settings without explicit approval.

## Purpose

Execute the user's complete CHERI Alliance transformation in manageable, verifiable chunks. These are **implementation** tasks, not requests for nine new plans or nine demonstration sites. Work in the checked-out repository, reusing already correct work and preserving its real editorial content. All phases operate on the same branch, and a later phase begins at the latest pushed commit from the preceding phase.

The repo currently contains real Jekyll collections, ZIP-derived theme files, native GitHub Pages publishing, entity relationships, documentation, and historical validation reports. **Do not erase or rebuild working features merely because a phase names them.** Existing verification reports may be historical and must not be described as fresh test results.

## Authority and inputs

1. Follow the current user task, this phase plan, and AGENTS.md.
2. Follow TRANSFORMATION_PROMPT.md for the complete transformation and its content-fidelity contract. The user's separately supplied full master prompt adds precise specifications (particularly Governing Board/Speakers, universal cards, a single Where next card, five social links, a three-group footer, and fully opaque foreground images); apply those explicit requirements.
3. The **original supplied simplified-authoring starter ZIP** (Jekyll root basic-site/) is the authoritative visual, interaction, authoring and asset reference. Inspect the actual files: SPECIFICATION.md, README.md, layouts, includes, Sass, JavaScript, fonts and imagery. ZIP versions/filenames may differ; inspect the actual archive rather than assuming a guessed filename.
4. The **existing repository** is authoritative for real content, entity IDs, authentic images, record relationships, original URLs, and provenance.
5. Consult docs/THEME.md, docs/AUTHORING.md, docs/VALIDATION.md, docs/DEPLOYMENT.md, MIGRATION_SPEC.md, PROGRESS.md and existing reports. Historical results are not a substitute for fresh checks.
6. For navigation labels and footer destinations, compare the actual website at https://cheri-alliance.github.io/ if an online check is available; don't invent missing submenus.

**ZIP dependency:** the ZIP must be available to Codex in its working environment. An attachment in a different ChatGPT conversation does not automatically become available in a Codex workspace. If the ZIP is not present, continue repository analysis but **do not make speculative ZIP-parity visual changes**; report the missing input and how to supply it.

**Conflict policy:** preserve real repository content and canonical URLs; use the ZIP for visuals and component behaviour. Preserve valid working features unless the current user's explicit requirements supersede them. In particular, the user requested only three footer link groups (Updates, CHERI Alliance, Legal), plus five social destinations; eliminate the existing extra Explore group if still present.

## Rules shared by every phase

- Read AGENTS.md and this document first. Reinspect relevant implementation before editing; don't run the entire transformation simply because TRANSFORMATION_PROMPT.md exists.
- Work **only in adam-3bian/adam-3bian.github.io**, on **codex/phased-site-transformation**, never on main. If the working branch is missing locally, fetch and check it out from origin; never reset it to main after earlier phases have committed changes.
- Implement only this phase. Make the smallest integrated changes; no separate demo website, speculative external scraping, new CMS/frontend framework, unsupported Jekyll Ruby plugins, or custom repo-owned GitHub Actions deployment.
- Do not truncate, summarize, fabricate, or casually reformat source-backed editorial Markdown bodies. Preserve authentic assets and route stability.
- Preserve a single canonical record per entity. Use existing collections such as _people, _organisations, _events, _news, _papers rather than creating duplicates or blindly copying the ZIP's sample content.
- Use Jekyll/Liquid/Kramdown/SCSS/vanilla JavaScript and GitHub Pages-compatible dependencies. Site root is https://adam-3bian.github.io/ with empty baseurl unless deliberately and separately authorised to change it.
- Make content images opaque; opacity/translucency belongs on surfaces/backgrounds, not parent elements that fade logos or photographs.
- Run the relevant tests plus bundle exec jekyll build wherever the toolchain is available. State exactly which checks were executed, passed, failed, or could not run; never claim an unrun visual/browser test passed.
- Keep a concise report in reports/codex-phases/phase-NN.md with: starting and ending commit SHAs; files changed; measured behaviour/results; commands/test outcomes; known exceptions; anything the next phase must know. Update PROGRESS.md where actual implementation status changed; preserve older evidence.
- Commit and **push to origin/codex/phased-site-transformation** after each completed phase. Never push to main, merge, change DNS/Pages settings, force-push, or publish a PR automatically.
- If a phase is already substantially done, verify it and fix only evidenced gaps. A minimal verified phase with an honest report is better than a destructive rewrite.

## Phase 0 — Inventory, baseline and gap analysis

**Goal:** establish an accurate current-state manifest and actionable gaps before styling/content edits. No editorial-body edits and no theme refactor in this phase.

~~~text
Work on Phase 0 of docs/CODEX_PHASES.md ONLY, in adam-3bian/adam-3bian.github.io on the codex/phased-site-transformation branch.

Inspect AGENTS.md, TRANSFORMATION_PROMPT.md, relevant docs/reports, the current Jekyll configuration, all collections, layouts/includes/Sass/JS, and the supplied starter ZIP. Record the starting commit SHA. Audit already implemented ZIP-theme features before deciding work is needed.

Produce a current inventory of editorial records, layout and component coverage, authentic media assets, canonical URLs, redirects, menu/footer/social data, and source-backed entity references. Classify actual gaps for each future phase. Compare claims in historical reports against the current checkout rather than assuming they remain true. Identify any conflict with the user's master prompt (especially three footer groups, five social links, canonical people, universal cards and Where next).

Run a local Jekyll build if tools are available and accurately log the result. Add reports/codex-phases/phase-00.md with counts and an explicit prioritised gap checklist for Phases 1–8. Do not edit editorial Markdown or rebuild components in this phase. Commit and push the documentation/report to the working branch. Report the commit SHA and any missing ZIP/reference input.
~~~

**Exit gate:** repeatable baseline, accurate gap map, no invented pass claims, no content loss.

## Phase 1 — Theme fidelity, assets and image rules

**Goal:** make shared design primitives visually faithful to the ZIP while leaving content intact.

~~~text
Implement Phase 1 of docs/CODEX_PHASES.md ONLY on codex/phased-site-transformation. Read the Phase 0 report first. Inspect the actual starter ZIP and compare shared theme files before changing anything.

Ensure the ZIP-derived Poppins weights, palette, Sass settings, responsive spacing, official blue/white logos, favicon, repeating light/dark honeycomb WebP background, hero and card surface opacity and hover/focus treatments are correctly implemented. Homepage must be dark; standard pages light. Fix only verified differences. Foreground photos, portraits, logos and illustrations must not inherit opacity from their container.

Preserve original ZIP assets instead of drawing approximations. Check baseurl-safe asset paths and verify representative pages at 375, 768, 1024 and 1440px if browser tools exist. Do not remove existing real content or replace theme with source-site/WordPress styling. Record changed Sass/assets, concrete comparison evidence, build results and untested items in reports/codex-phases/phase-01.md. Commit and push to the working branch.
~~~

**Exit gate:** shared tokens, logo/theme backgrounds and image-opacity rules verified against available ZIP evidence.

## Phase 2 — Universal cards and shared content components

**Goal:** one coherent card/listing system across all site sections, plus Related pages, Where next, image positioning and overlays.

~~~text
Implement Phase 2 of docs/CODEX_PHASES.md ONLY. Start from the latest pushed phase commit. Inspect existing listing/card, related-pages, where-next, content-image, overlay and layout includes against the original starter ZIP.

Use the ZIP's generic .cards / .card / .card-media / .card-image / .card-action system and responsive .columns-2/3/4. Reuse one rendering path for generic page/entity cards wherever possible. Cards must be fully clickable, keyboard-focusable, attractive without images, and use genuine content records.

Render Related pages as a multi-card grid resolving destinations. Render Where next as EXACTLY one large full-width card, with resolved title and action, and NO description; do not generate extra destinations. Use actual YAML and real URLs.

Support .image-left, .image-right, .image-full and appropriate containment/cropping on detail pages; preserve image opacity, captions and semantics. Verify the accessible image overlay and Escape/focus restoration. Do not rewrite page bodies to hardcode card markup. Test long text, no-image cases and responsive overflow. Log evidence and exceptions in reports/codex-phases/phase-02.md; commit/push to the working branch.
~~~

**Exit gate:** shared components reused by templates; no isolated bespoke list-card implementations, Where next exactly one.

## Phase 3 — Canonical People, Speakers, Governing Board

**Goal:** one _people collection powers every person appearance, without duplicate biographies or fake profile content.

~~~text
Implement Phase 3 of docs/CODEX_PHASES.md ONLY. First review Phase 0 and Phase 2 reports and the current _people records and related templates.

Keep canonical people in _people/*.md. Make the Governing Board page a true people-list presentation using the existing ordered _data/governing-board.yml person IDs. Make the Speakers page a true people-list presentation selected by verified speaker: true flags and alphabetically ordered unless valid editorial order exists. Both must use the generic person-card system, with original portraits where available, linking to canonical person detail routes.

Ensure person detail pages use the shared person layout and show genuine biography/affiliation plus reverse-related published news, events and papers where referenced. A name-only person stays name-only. Do not create second _speakers or _boardpeople collections or manual duplicate board cards.

Validate every board ID and key person link; check source-backed ordering, portraits, no fabricated details and Jekyll build. Document counts, exceptions and results in reports/codex-phases/phase-03.md; commit/push to the working branch.
~~~

**Exit gate:** board/speaker directories and person details all resolve a single canonical record per person.

## Phase 4 — News, events, authors and reverse relationships

**Goal:** functioning list/detail views with genuinely linked author and speaker cards.

~~~text
Implement Phase 4 of docs/CODEX_PHASES.md ONLY. Inspect existing _news, _events and _papers fields, related includes and reverse-relationship logic before editing.

Retain the _news collection (do not duplicate it into _posts); news directory newest first with genuine dates/images and ZIP-style cards. Render an Authors section below the article body using generic linked people cards for verified front-matter author IDs. Event details display speaker cards from real person IDs; event lists use genuine chronology/known past-upcoming classification. Preserve author/speaker order where sourced.

Use native Liquid/static data for reverse references on person and other relevant detail pages; do not manually copy relationship data in both directions. Never infer ambiguous authors by plain-text name matching or invent portraits. List unresolved IDs explicitly. Preserve every full article/event body, citation, asset and route.

Run Jekyll build and representative checks for article authors, events, missing people references and mobile cards. Record verification and remaining gaps in reports/codex-phases/phase-04.md; commit/push to the working branch.
~~~

**Exit gate:** author/speaker and reverse links are genuine, ordered where needed, navigable and not duplicated.

## Phase 5 — Organisations and all other directories

**Goal:** consistent list/detail architecture beyond people/news/events without losing content.

~~~text
Implement Phase 5 of docs/CODEX_PHASES.md ONLY. Audit already existing organisations, members, papers, hardware, software, policies, guides, working groups, topic hubs and directory pages. Reuse completed Phase 2 cards and working layouts.

Keep _organisations as the canonical organisation collection; list only verified member: true organisations in the member directory. Link real logos and affiliations. Make other directories/section indexes use generic cards and appropriate list/detail layouts. Where a section can derive children via parent references or collections, do so without one-off hardcoded card HTML. Preserve real canonical URLs and original source-body reading order.

Do not fabricate missing catalogue text or full papers; a paper catalogue record is not evidence a full PDF was acquired. Preserve genuine document/image/download links. Validate representative records in every collection, list membership, missing images, relationships, no duplicate canonical records and build. Write reports/codex-phases/phase-05.md; commit/push to the working branch.
~~~

**Exit gate:** source-backed directory coverage across all existing collections using universal components.

## Phase 6 — Homepage, slider, header/footer, socials and forms

**Goal:** complete the main user-facing entry points and ZIP interactions.

~~~text
Implement Phase 6 of docs/CODEX_PHASES.md ONLY. Audit current homepage, slider, navigation, footer, social, subscribe, and form components against the actual ZIP and user master prompt.

Homepage: dark mode, real existing homepage content preserved, large hero, authentic image/text slides; ZIP-equivalent layout, click-through CTA, accessible dots, about 5-second advancement, pause on focus/hidden tab, reduced-motion support and no-JS first slide. Do not publish demo sample slides.

Header: exactly the live website's five top-level categories (Discover CHERI; Adopt; Build; CHERI Alliance; News & Events) with actual working submenu paths and keyboard/mobile interactions. Footer: THREE link groups only (Updates; CHERI Alliance; Legal), not the extra Explore group currently documented in older repo config. Include FIVE working social links with matching local SVG icons: Slack, LinkedIn, Mastodon, GitHub and YouTube.

Forms: retain ZIP layouts/includes/controls; no false successful submission, invented endpoint or collected-data service. Keep real contact/newsletter destinations. Verify image opacity, focus, keyboard nav, mobile menu, slider controls, real card links and root URLs. Document results/exceptions in reports/codex-phases/phase-06.md; commit/push to the working branch.
~~~

**Exit gate:** real dark homepage and ZIP-style slider; correct five-header/three-footer/five-social model; accessible non-submitting forms.

## Phase 7 — Content fidelity, URLs, redirects and missing-link repair

**Goal:** map every existing real source record to output without silent truncation or route regressions.

~~~text
Implement Phase 7 of docs/CODEX_PHASES.md ONLY. Treat this as a comprehensive fidelity/URL audit and targeted repair, not permission to re-scrape an external website.

Freeze current input file inventory and compare every available source-backed Markdown body (including headings, anchors, links, tables, code, images, captions, dates and citations) to corresponding rendered output and historical provenance reports. Account for true alternate versions and name-only records honestly. Report exact counts rather than reusing old numbers unquestioned.

Validate canonical public routes, collection details, entity IDs, nav and footer links, internal anchors, original media/downloads, home slider CTAs and sitemap/404. Repair supported internal link errors and preserve existing redirects. When replacing a known former URL, implement a GitHub Pages-compatible static redirect without unsupported Ruby plugins; do not set up a site-wide domain redirect or alter DNS without explicit authorization. Report genuinely unavailable sources/assets/PDFs instead of creating substitutes.

Produce a source-to-output/route audit plus concrete exceptions in reports/codex-phases/phase-07.md, run Jekyll build and link checks, then commit and push the working branch.
~~~

**Exit gate:** complete measured account of currently available content/routes; documented rather than concealed exceptions.

## Phase 8 — Final integration, regression checks and review handoff

**Goal:** validate all nine phases together, correct regressions, and prepare a reviewable change set.

~~~text
Implement Phase 8 of docs/CODEX_PHASES.md ONLY, starting from the latest pushed codex/phased-site-transformation commit. Read the phase-00 through phase-07 reports, AGENTS.md, master prompt, ZIP and docs/VALIDATION.md.

Run the native GitHub Pages-compatible Jekyll build and available tests. Test source content preservation, original asset decoding, linked people/member/author/speaker cards, reverse references, full-width single Where next, related grids, correct navigation/footer/socials, image alignment and opacity, dark homepage slider, disabled forms, root URLs, sitemap, 404 and static redirects. Where tools allow, run real browser checks at 375/768/1024/1440px with keyboard, reduced-motion, Escape/focus restoration, no-JS fallback and long-page overflow.

Fix only evidence-backed regressions, rerun affected tests, and update the validation report, contributor authoring instructions and PROGRESS.md with truthful current findings. Do NOT mark tests as passed unless actually executed. Do not initiate new web scraping or external PDF acquisition. Do not merge to main, auto-merge, alter publishing settings or deploy. Commit/push final verified changes to the working branch; give the user a summary of changed files, end SHA, passes/failures/exceptions and the review URL. Opening a PR requires separate user instruction.
~~~

**Exit gate:** implementation ready for human review, with explicit remaining limitations and no production deployment.

## Running the phases in Codex

1. Give Codex access to this repository and supply the original starter ZIP in that Codex workspace. Point it to docs/CODEX_PHASES.md and the user master prompt.
2. Select the **codex/phased-site-transformation** branch. **Do not choose main as the working branch.**
3. Copy the prompt under **Phase 0** into Codex. Complete it, inspect its report and confirm the branch is pushed.
4. Start the next Codex task/session on the **same branch**, using the Phase 1 prompt; repeat through Phase 8.
5. Review the complete changes against main after the final phase. Merge to main only when you deliberately want the changed site published.

**Important:** Pushing to this work branch changes the GitHub repository but does **not** update the production Pages website when Pages publishes from main. Redirect fixes in Phase 7 are **URL compatibility redirects within the site**; they do not mean redirecting the entire live domain or changing the repository's publishing branch.
