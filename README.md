# CHERI Content Viewer

A minimal Jekyll site with 330 collection records and 168 pages. Collection content has been audited against CHERI Alliance profiles and resources; original image bytes remain bundled.

## Run locally

Install Ruby 3.2 or later and Bundler, then run these commands in this directory:

```sh
bundle install
bundle exec ruby scripts/check_content.rb
bundle exec jekyll serve
```

Open http://localhost:4000. The content checks page is at http://localhost:4000/checks/.

## What to check

The source menu and the twelve collection links let you reach the content. Each detail page shows its title, a supplied primary image, an At a glance summary, article body and related content. Raw authoring properties and unused values are available in the content audit. Primary images render once; body illustrations stay with the content. Record facts use an unboxed definition list, and resource URLs appear as labelled navigation links without a surrounding card. Original-image download links are omitted; eligible article images enlarge in the image viewer.

The header preserves the five-category mega-menu and its complete nested link hierarchy. Author internal membership in each source page or record's `navigation.header` mapping; `_config.yml` retains the fixed category/group scaffold, overview routes and column counts. Run `bundle exec ruby scripts/check_content.rb` to generate `_data/primary-navigation.json` rather than editing generated links. See `FRONT_MATTER.MD` for labels, ordering and nested Build groups. Native `details`/`summary` controls remain usable without JavaScript; the small `assets/navigation.js` enhancement adds the mobile Menu button, arrow keys, Escape, outside-click dismissal, and focus handling. At 1024px and wider, menus overlay the content in three or four columns and scroll within short viewports. At smaller widths, they expand in the page flow.

The shared footer keeps Updates, CHERI Alliance, Learn and Build, and Policies in four visible groups on desktop, two on tablet and one on mobile, followed by copyright and social links. Its native navigation and lists work without JavaScript. Author internal membership in each source's `navigation.footer` mapping; the validator generates `_data/footer_navigation.json`. The fixed group scaffold and social links remain in `_config.yml`. Collection directories are available through these groups; Content checks remains an editorial page outside visitor navigation. Internal links respect the configured baseurl, and social links use the supplied LinkedIn, Mastodon and Slack icons with visible text labels.

The homepage and five section landing pages retain their titles and introductions alongside source-backed pathways, featured resources and native browse links. The section pages use the same generated `_data/primary-navigation.json` hierarchy as the mega-menu, including collection destinations and nested Build groups. The homepage links to all five main sections. Keep index Markdown bodies empty; introductions remain in `summary`, while source-backed presentation metadata remains in `_data/landing.yml`. Navigation membership belongs in source front matter rather than another list of links. These pages work without JavaScript and adapt to desktop, tablet and mobile widths.

The content checks page shows coverage for all twelve collections and lists every page and record, including retained source versions and aliases. Filter by collection, source-image availability, placeholder fallback, missing news date, retained version or title/source file; inspect each record’s raw properties using its native disclosure. Its small filter can find a title, type, or source file. Missing optional images or news dates are identified as unprovided values. Actual errors include incomplete schemas, invalid dates, unknown relationship references, broken navigation targets, and missing image files.

News is newest first, with undated records after dated ones. Events are earliest first; past archives are newest first. Upcoming and past lists use the final event day in the Europe/London timezone. Papers and reports use publication year descending, with alphabetical ties and undated records last. Other general directories sort alphabetically; curated learning pathways retain their configured sequence. The speaker list uses is_speaker, and the member list uses a confirmed membership_tier. The board list uses the ordered canonical people in _data/governing-board.yml. Alternate source records remain accessible from the audit while canonical lists omit them.

Directories consist of introductory Markdown followed by linked cards drawn from collection records. Each entire card, including its image and padding, is one native link with a visible keyboard focus state; no click-handler script is needed. Cards use native lists and heading groups, include an opening-paragraph preview, and omit empty placeholders. Working Groups is the complete directory at `/working-groups/`; former `/groups/` routes redirect to the new directory and records. Board cards have consistent square portraits and open the person profiles. Shared record properties and company details use readable definition lists with open spacing, stacking labels above values on mobile. Events group their date range under When and location under Where.

Authors, speakers, affiliations, working-group leads, and generic related fields produce clickable forward and reverse relationships. Related content uses the same deep-blue linked cards as collection directories and recommended routes. Record-type audit labels stay out of this navigation. Reverse links are derived by the check script; do not edit _data/relationships.yml. After changing content or front matter, run the check script again before building to refresh the audit and reverse links.

Consolidated duplicate directories and policy copies redirect to their canonical destinations, with ordinary destination links as a fallback. Other retained source versions show their destination links. Repeated original news articles and the Benjamin Fletcher alias point to their canonical records, preserving existing URLs. Contact and subscription pages are content examples; no form submits data.

## Authoring reference

See [FRONT_MATTER.MD](FRONT_MATTER.MD) for every supported collection and page property, types, relationships, date precision, complete examples, inherited defaults and canonical aliases. Record-level versions and document dates belong in front matter; shared optional fields are validated and displayed in metadata.

## Case studies and reports

Organisation logos with accidental white canvases use self-contained SVG masks over their original source files, preserving the lettering and artwork. Regenerate these display assets with `python3 scripts/prepare_organisation_logos.py`; `--check` verifies them without writing. Intentional white artwork and the seal interior are protected.

The four original case-study sections are now `_case-studies` records, with cards at `/case-studies/`. Their article text is preserved; images moved into their record directories and each document starts its own left/right sequence. The five original report entries are `_reports` records at `/reports/`, with publication type, year, publisher, author references and original publication URLs. Academic papers remain in `_academic-papers`. The previous overview routes redirect to the canonical directories. Schemas, menus, breadcrumbs, relationships and the audit all include these collections.

The visual system lives in `assets/site.css`, including local Poppins fonts, shared spacing, responsive layouts and interaction styles. There is no second theme override stylesheet. The supplied starter kit sets the direction: a dark homepage, light inner pages, deep-blue section introductions and a dark footer. A shared 80rem frame contains headings, prose, media and responsive card grids. Like the starter kit, body text uses the available content width and wraps naturally beside floated illustrations; no narrower article column is imposed. Breadcrumbs live in the document shell for section indexes, directories and records. Directory controls offer sorting and source-backed metadata filters; text search is available on the dedicated search page. Contact and subscription forms are authored through the optional `form` front matter described in [FRONT_MATTER.MD](FRONT_MATTER.MD); missing endpoints keep them non-submitting previews.

## Collection content and assets

New images belong under `assets/images/people/`, `logos/`, `products/`, `news/` or `misc/`, using descriptive subfolders where helpful. Original `assets/<collection>/<record-name>/` paths remain supported; do not move existing artwork without updating all references and provenance together. Body images may reuse the same canonical asset. Fonts stay in `assets/fonts/`. The supplied social icons and their licence are in `assets/images/logos/social/`.

Detail-header artwork and record galleries use contained 3:1 frames. Directory cards use 16:9 resource imagery and 3:2 logo frames; homepage case-study images use 4:3 frames. People portraits use 1:1 frames in detail headers, cards, and portrait galleries, including board members who are not speakers. Add `.image-portrait` to a portrait used elsewhere. Containment preserves the entire photograph, logo, or diagram; the image viewer displays the original asset at its natural proportions. Missing source images use a clearly labelled local `placeholder.svg` with the appropriate ratio. These fallbacks do not appear in public headers or cards and do not create resource links or empty metadata panels. The audit distinguishes them from supplied source images.

Working groups are stored in `_working-groups`, with assets under `assets/working-groups/<record-name>/` and detail URLs at `/working-groups/<record-name>/`. Former `/groups/` URLs are redirects. Use `related.working-groups` for references and `leads: []` so co-leads have separate person references. Policies include `image_url`. Other schema fields retain their existing shapes. Use arrays for authors, speakers, repositories, and related slugs; every referenced collection record must exist. Do not infer membership or speaker status from a mention in another article.

CHERI Enabled Products is a hardware directory filtered by `certification: cheri-enabled`. Set that property only on a confirmed certified product/version and include its authoritative `certification_url`. The directory cards, descriptions and drill-through links come from the hardware records. Original product summaries and certification explanations are retained there; no second product list is maintained on the page.

After a production build, check all rendered collection links, images, inverse references, and anchors:

```sh
bundle exec ruby scripts/check_content.rb
JEKYLL_ENV=production bundle exec jekyll build --destination _site
python3 scripts/check_collection_links.py
python3 scripts/check_page_content.py
```

The link checker uses Python's standard library. To check a repository subpath, build with `--baseurl /preview` and run `python3 scripts/check_collection_links.py _site --baseurl /preview`. The audit details and explicitly missing illustrations are recorded in `reports/collection-audit.json`. External resource links recovered from source profiles retain their original targets.


## Markdown image layout

All Markdown images are responsive and stay inside the shared page container. Use a Kramdown **inline** attribute list immediately after the image (on the same line) to opt into an alignment. Examples use placeholder paths; replace them with existing files in `assets/`:

The site uses native GFM, supported by both production and GitHub Pages builds. Escape literal pipes as `\|` in prose and lists so they do not become accidental tables; leave fenced code literal.

```markdown
![Descriptive alt text](/assets/example.jpg){: .image-left }

![Descriptive alt text](/assets/example.jpg){: .image-right }

![Descriptive alt text](/assets/example.jpg){: .image-full }
```

Alternate ordinary editorial illustrations left, right, left throughout each document, resetting at its beginning. Place an image before the prose it illustrates so that the text can wrap alongside it. Existing explicit choices take precedence; exclude hero images, logos, portraits, galleries, and full-width technical illustrations from the sequence.

Left and right images float at 42% of the article width above 960px. They stack at 100% at tablet and mobile widths, including 640px and below, to keep text columns readable. Headings, galleries, and the end of the article clear floats. `.image-full` fills the entire content container without an additional article-width cap. Image content retains its proportions within the frame. Do not use fixed inline widths or alignment HTML attributes.

Use a semantic figure for an existing caption, keeping the image as native Markdown:

```html
<figure class="image-full" markdown="block">

![Descriptive alt text](/assets/example.jpg)

<figcaption>Existing caption text</figcaption>
</figure>
```

Use `.image-logo` or `.image-icon` for an isolated mark with bounded display dimensions. Consecutive photographs and imported directories use a simple `<ul class="image-gallery" markdown="block">` with `<li markdown="block">` items. Add `.portrait-gallery`, `.logo-gallery`, or `.record-gallery` for portraits, logo collections, or related-record teasers respectively; keep each image with its existing name, caption, or description. These groups never participate in the left/right sequence. Use detailed diagrams, charts, and screenshots at full width, and do not invent captions.

Editorial images and photo galleries can be enlarged in a native `<dialog>` viewer. Click/tap a suitable image, or focus it and press Enter/Space. Previous/Next buttons and arrow keys navigate only the current article's images; Escape, Close, or the backdrop dismisses the viewer. Captions come from existing figcaptions or alt text. Focus and page scroll position return to the opening image. There is no animation. Logos, icons, portraits, record teasers, hero images, and images in links or interactive elements are excluded. Add `data-no-image-viewer` to opt another image or group out; `data-full-src` can identify an original if a thumbnail is added later. Without JavaScript or native dialog support, the original content stays readable.

## Build and GitHub Pages

```sh
bundle exec ruby scripts/check_content.rb
bundle exec jekyll build
```

The content validator renders Markdown before checking image references, so it also covers figures, galleries, reference-style images, and HTML images while ignoring fenced examples. Browser regression checks run in the Pages workflow before deployment and cover every page with body images and representative records from all twelve collections at 1440, 1024, 768, 640, and 375px. They check built image paths, containment, wrapping, float clearing, the viewer's keyboard/focus/scroll behaviour, captions, touch controls, reduced motion, linked-image exclusions, and the no-JavaScript fallback. Run the same checks locally with:

```sh
# Install test tooling separately from the site (not a production dependency).
npm install --prefix /tmp/cheri-image-tests --no-save playwright@1.56.1 axe-core
NODE_PATH=/tmp/cheri-image-tests/node_modules /tmp/cheri-image-tests/node_modules/.bin/playwright install chromium --only-shell
python3 -m http.server 4000 --directory _site
# In another terminal:
NODE_PATH=/tmp/cheri-image-tests/node_modules AXE_PATH=/tmp/cheri-image-tests/node_modules/axe-core/axe.min.js node scripts/test_images.cjs
NODE_PATH=/tmp/cheri-image-tests/node_modules AXE_PATH=/tmp/cheri-image-tests/node_modules/axe-core/axe.min.js node scripts/test_navigation.cjs
```

Set `SITE_DIR` and `SITE_URL` to test a different build or a repository subpath. Test results are written to `reports/image-tests/results.json`.

The Pages workflow also checks all five primary menus at the same viewport widths, verifies the 96 existing primary links and ten collection links, and tests keyboard, focus, touch, no-JavaScript, and short-viewport behavior. Navigation screenshots and results are saved in `reports/navigation-tests/`; axe checks the open and closed header for WCAG A/AA violations before deployment.

Jekyll writes the static site into _site. The site uses Jekyll 3.10, standard Liquid, and Kramdown. Native Kramdown/GFM renders the existing Markdown without a custom parser plugin. Set url and baseurl in _config.yml for your repository. Internal links and images use relative_url, including body illustrations, so repository subpaths work. For GitHub Pages, build with GitHub Actions and publish _site; the built-in Pages safe-mode build does not load custom plugins.

For a hosted static build, use bundle exec jekyll build --destination dist. The .openai directory only identifies the private hosted preview; it is omitted from the downloadable project ZIP.

## Files

Content stays under `pages/` and twelve collection folders. The `index`, `section`, `record` and `list` layouts own their page structures; `document`, `pages`, `people`, `news` and `events` preserve existing layout names as adapters. Shared includes handle the header, footer, nested menu links, date-aware activity and optional authored forms. The schemas extend the supplied v1.4 document with policy images and multiple group leads. Presentation lives in assets/site.css and assets/viewer.js. The Content checks page shows optional values and the latest data audit; reports also include verification results for the build and rendered collection links.

The source snapshot is adam-3bian/adam-3bian.github.io at commit 7f3839872c8fea6a709b99d241880de0f3915c42. Original image bytes are bundled. The check script validates data and image paths; it does not claim that external websites or downloads are available.
