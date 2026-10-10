# CHERI Alliance — complete content-to-ZIP website transformation

**This is the one active, executable implementation prompt for the full transformation.** Act as a senior Jekyll engineer, design-system implementer and lossless content-fidelity auditor. Implement a working website; do not stop at a proposal, mock-up, sample collection or short preview.

## Inputs and authority

- **Content/source of truth:** the checked-out current repository `https://github.com/adam-3bian/adam-3bian.github.io`. Record its exact starting commit. Its source-backed editorial files, relationships, canonical routes, original assets and provenance are the content authority.
- **Design and authoring source of truth:** the user's attached `cheri-alliance-starter-kit-simplified-authoring (3).zip`, Jekyll root `basic-site/`. Inspect `README.md`, `SPECIFICATION.md`, `SOURCE-NOTES.md`, `CHANGES.md`, `VERIFICATION.md`, `markup-examples.md`, `_config.yml`, `_data/navigation.yml`, all layouts, includes, Sass, JS, scripts, image and brand assets. Use the ZIP's **actual** design, methodology and behavior.
- **Integration guidance:** `AGENTS.md`, `docs/THEME.md`, `docs/AUTHORING.md`, `MIGRATION_SPEC.md`, `docs/VALIDATION.md`, `README_MIGRATION.md` and current `reports/`.
- The user request controls scope; this document does not by itself authorize a web crawl, production deployment, destructive repository rewrite or merge.

When sources conflict, preserve real repository content, established URLs and working functionality while adapting it to the ZIP's native presentation. The original WordPress/GitHub CHERI sites are provenance sources **not** visual targets. Keep justified adapter differences explicit. Audit existing ZIP-theme integration first using `reports/template-integration.json` and `docs/THEME.md`; do not redo correct work.

## 1 — Freeze the real-content baseline

Enumerate every tracked editorial file in `_people/`, `_organisations/`, `_events/`, `_news/`, `_groups/`, `_guides/`, `_hardware/`, `_software/`, `_papers/`, `_policies/` and `pages/`, plus any additional populated content. Inventory public routes, aliases, source versions, shared/navigation content, entity references, search documents, attachments, images and downloads.

Produce a content-to-output mapping with source path, commit/hash, type, canonical route, selected ZIP layout/adapter, related assets and verification result. Prefer existing reliable `reports/` evidence; measure counts from the checkout instead of assuming the numbers in previous progress notes remain current. Keep all original provenance/evidence and existing source signatures.

Classify correctly: complete source page; published paper **catalogue entry** (not necessarily the full external PDF); legitimately name-only profile; source-backed hub/index; preserved alternate source version; genuine unresolved or literal source placeholder. Do not describe a partial archive as complete.

## 2 — Preserve every available original body

All available published content is mandatory, not representative. Keep **the entire text and original reading order** of headings, introductory prose, paragraphs, lists, nested lists, code, tables, definitions, quotations, citations, footnotes, dates, bylines, image positions/alt text, captions, links and download references.

**Never** substitute summaries, excerpts, ellipses, generic advertising prose, rewritten shorter pages, synthetic authors/bios/affiliations/quotes/dates, stock artwork or illustrative placeholder images. Keep the source's genuine wording even if awkward. An archival source's own placeholder may remain verbatim in its separately retained source version and must be reported, never masked by an invented link or sentence.

Retain source-backed `member: true`, `speaker: true`, `organization`, `speakers` and `authors` references, order of event speakers and paper authors, and distinct canonical versus alternate published source versions. Derive reverse relationships from established IDs; exclude `alternate: true` records from duplicate feeds and search where appropriate.

Use **YAML front matter and native Kramdown Markdown only** in editorial files, with minimal supported fields; no added HTML, Liquid or CMS styling wrappers. Retain actual heading IDs and full text while presenting a single visible H1 and exactly one introduction. The ZIP's first-paragraph-as-introduction convention must not cause dropped, duplicated or fabricated paragraphs. Preserve original image roles (`.image-left`, `.image-right`, `.image-full` and inline role) and natural aspect ratios.

Original photographs, portraits, logos, diagrams, presentations, PDFs and documents remain in their genuine acquired quality and local asset paths, with original source links where relevant. Do not populate missing records with fabricated information. For unrecoverable items, report the actual source and exception.

## 3 — Keep the ZIP's design and methodology, not a visual imitation

Retain the ZIP's Jekyll + Liquid + Kramdown + SCSS + vanilla JavaScript architecture and actual layouts/includes/Sass/scripts/brand files. Preserve the working repository's build toolchain and required plugins rather than blindly replacing pinned dependencies with the ZIP's smaller demonstration Gemfile.

Conform to the starter's precise presentation and behavior:

- **Brand/themes:** original official blue and white CHERI SVG logo masters, approved favicon, local Poppins where already implemented; ZIP-derived blues, beige/white/charcoal, contrast, light/dark opacity, flat surfaces and responsive spacing. Home is dark; standard content pages are light. Do not inject WordPress/Elementor colours, cards or source-site profile sidebars.
- **Honeycomb:** original SVG composition and seamless repeating lossless light/dark WebP backgrounds at native scale, with baked alternating 1px horizontal line/transparent gap pixels, exact ZIP opacity settings and no extra grain or CSS stripes. Preserve translucency and text contrast; never redraw masters.
- **Native components:** header/megamenu, breadcrumbs, heroes, heading, member/person/post/event layouts, image overlays, related links, cards, `Where next` without descriptions, Subscribe band, footer and social assets. Use the ZIP's naming, shallow include hierarchy, hover/focus states and native card/hero surfaces; adapt only what source-backed content requires.
- **Images:** square people/member portraits (reuse the genuine listing thumbnail on person detail); 16:9 news/events listing frames; 3:2 left/right inline framing, 16:9 full-width/slide framing where applicable; respect cover/contain, alt text, captions and responsive behavior. A source without a real image should render cleanly without a fake portrait.
- **Navigation/carousels:** keyboard-accessible responsive nested menus; full-slide CTA surfaces with separate carousel controls and ZIP behavior, including the homepage five-second auto-advance and reduced-motion/focus/visibility handling where applicable. Use authentic sourced slides only, never create fake ones to populate a slot. Preserve functional first-slide/no-JS fallback.
- **Links/tables/forms:** valid relative and external links with safe explicit new-tab target/rel, root and project-baseurl builds, scrolling narrow tables, viewport image dialog with Escape/focus return, focus states and no-JavaScript content. Forms remain **clearly non-submitting** absent a specifically authorized working endpoint; never fabricate integration or submit captured data.
- **Listings:** newest-first news, earliest-first dated events, alphabetical people/member directories, native card/image treatment and accessible filters. Preserve useful repository functions beyond the ZIP sample: full-body search, relation-driven author pages, canonical metadata, sitemap, redirects, working directories and 404.

When existing repository functionality needs a theme adapter, isolate it, document why, and test it. Do not override the ZIP's typography, palette, watermark strengths, hero geometry or card design merely to resemble an older website.

## 4 — Complete functional site, not a sample

Map every public canonical page and real directory to a working ZIP layout or minimal adapter. Populate homepage, existing five major navigation sections, topic hubs, resource guides, working groups, people, members, papers, news, event chronology and related content from the real repository. Keep the homepage's entire published body.

Preserve public URLs and slug stability, related links, actual source-backed cards, contact/newsletter notices, publisher metadata, article headings and fragment anchors. Keep working redirects and navigation, including compatibility routes; exclude alternate source-version duplicates from feeds and canonical indexes.

Make canonical records discoverable through section hubs, directories, real internal links and/or search. Never publish `Lorem ipsum`, `Sample member`, `Example speaker`, `Coming soon`, `TODO`, `TBD`, “replace this”, mock testimonials, unsourced statistics or demo CTA links. Search the **rendered output**, exempting accurately quoted archival source text and developer-only authoring examples.

## 5 — Verify before calling it complete

Implement in the actual repository, not just a design brief. Maintain evidence per `docs/VALIDATION.md`. Run the documented Jekyll build, markdown/body preservation checks, asset and link/anchor checks, ID/relationship checks, template comparison, regression tests and representative browser flows where available. Record exact commands/results; clearly label any check that could not run.

Acceptance gates:

1. Every available source-backed editorial record maps to its entire rendered output or a preserved alternate/evidence record. Publish exact counts and unresolved classifications.
2. Every captured source body retains full text order, tables, headings/IDs, links, images and code; zero unexplained omissions or truncation versus frozen signatures.
3. All internal links, canonical routes, fragments, redirects, sourced assets and relationship IDs resolve, or a detailed exception is recorded without false “pass”.
4. Compare templates to the supplied ZIP and rendered reference at desktop, tablet and mobile (375, 768, 1024, 1440px), including home dark mode, long articles, cards, person/member detail, tables and navigation. Check actual palette, typography, hero, honeycomb opacity and surface states, not just screenshot similarity.
5. Verify keyboard menus/focus, image overlay/Escape, carousel focus/autoplay and reduced motion, responsive overflow, no-JS content, disconnected forms, ordering/search and proper URLs at root and project baseurl.
6. Keep GitHub Pages workflow functional. A local build is **not** evidence of a deployment; obtain separate permission before changing `main`, publishing or altering production settings.

## 6 — Report and deliver

Deliver the edited working repository, a source-to-output content/layout manifest, byte or signature preservation evidence, theme-integrity results, build/link/relationship/browser results, a list of documented adapters and remaining deficiencies. Update `PROGRESS.md` and relevant `reports/` with measured results, preserving older validation artifacts.

The repository currently describes historical source archives and externally linked full-paper PDFs that remain unacquired. **Do not claim exhaustive coverage of either original CHERI website or an acquired full PDF unless evidence actually proves it.** A new capture phase is a separate user request; do not silently start crawling while fixing a theme or resetting instructions.

Do not merge, force-push, deploy, alter DNS or submit forms without authorization. Do not stop after demonstration pages. The objective is full preservation of **all available real repository content** using the ZIP's **actual design, authoring methodology and interaction rules**, with no invented fillers.
