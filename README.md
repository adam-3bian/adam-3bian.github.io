# CHERI Content Viewer

A minimal Jekyll site with 321 collection records and 166 pages. Collection content has been audited against CHERI Alliance profiles and resources; original image bytes remain bundled.

## Run locally

Install Ruby 3.2 or later and Bundler, then run these commands in this directory:

```sh
bundle install
bundle exec ruby scripts/check_content.rb
bundle exec jekyll serve
```

Open http://localhost:4000. The content checks page is at http://localhost:4000/checks/.

## What to check

The source menu and the ten collection links let you reach the content. Each detail page shows its title, primary image, populated metadata, article body, linked records, and an expandable front matter inspector. Unused null and empty values remain visible in the inspector. Primary images render once; body illustrations stay with the content. Record facts use a compact definition list, and resource URLs appear as labelled navigation links without a surrounding card. Original-image download links are omitted; eligible article images enlarge in the image viewer.

The header adapts the starter kit's column menus and mobile accordions. Edit `navigation.header` in `_config.yml` to change its links and column counts. Native `details`/`summary` controls remain usable without JavaScript; the small `assets/navigation.js` enhancement adds the mobile Menu button, arrow keys, Escape, outside-click dismissal, and focus handling. At 1024px and wider, menus overlay the content in three or four columns and scroll within short viewports. At smaller widths, they expand in the page flow. Footer navigation retains its existing disclosures.

The content checks page lists every page and record, including retained source versions and aliases. Its small filter can find a title, type, or source file. Missing optional images or news dates are identified as unprovided values. Actual errors include incomplete schemas, invalid dates, unknown relationship references, broken navigation targets, and missing image files.

News is newest first, with undated records after dated ones. Events are earliest first; upcoming and past lists use the final event day in the Europe/London timezone. People, organisations, and other collections sort alphabetically. The speaker list uses is_speaker, and the member list uses a confirmed membership_tier. Alternate source records remain accessible from the audit while canonical lists omit them.

Authors, speakers, affiliations, working-group leads, and generic related fields produce clickable forward and reverse relationships. Reverse links are derived by the check script; do not edit _data/relationships.yml. After changing content or front matter, run the check script again before building to refresh the audit and reverse links.

Consolidated duplicate directories and policy copies redirect to their canonical destinations, with ordinary destination links as a fallback. Other retained source versions show their destination links. Repeated original news articles and the Benjamin Fletcher alias point to their canonical records, preserving existing URLs. Contact and subscription pages are content examples; no form submits data.

## Authoring reference

See [FRONT_MATTER.md](FRONT_MATTER.md) for every supported collection and page property, types, relationships, date precision, complete examples, inherited defaults and canonical aliases. Record-level versions and document dates belong in front matter; shared optional fields are validated and displayed in metadata.

## Collection content and assets

Store each record's primary image under `assets/<collection>/<record-name>/`, with neither an underscore prefix nor a `.md` suffix. Body images may reuse another collection record's canonical assets. Keep assets referenced by `pages/` when copying an image into a collection directory.

All displayed collection images use contained 3:1 frames. Speaker portraits use 1:1 frames in detail headers, cards, and portrait galleries. Add `.image-portrait` to a speaker image used elsewhere. Containment preserves the entire photograph, logo, or diagram; the image viewer displays the original asset at its natural proportions. Missing source images use a clearly labelled local `placeholder.svg` with the appropriate ratio. These fallbacks do not create placeholder resource links or empty metadata panels.

Working groups use `leads: []` so co-leads have separate person references. Policies include `image_url`. Other schema fields retain their existing shapes. Use arrays for authors, speakers, repositories, and related slugs; every referenced collection record must exist. Do not infer membership or speaker status from a mention in another article.

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

The content validator renders Markdown before checking image references, so it also covers figures, galleries, reference-style images, and HTML images while ignoring fenced examples. Browser regression checks run in the Pages workflow before deployment and cover every page with body images and representative records from all ten collections at 1440, 1024, 768, 640, and 375px. They check built image paths, containment, wrapping, float clearing, the viewer's keyboard/focus/scroll behaviour, captions, touch controls, reduced motion, linked-image exclusions, and the no-JavaScript fallback. Run the same checks locally with:

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

Jekyll writes the static site into _site. The site uses Jekyll 3.10, standard Liquid, and Kramdown. One small parser plugin keeps text containing a pipe character as a paragraph; the source Markdown stays unchanged. Set url and baseurl in _config.yml for your repository. Internal links and images use relative_url, including body illustrations, so repository subpaths work. For GitHub Pages, build with GitHub Actions and publish _site; the built-in Pages safe-mode build does not load custom plugins.

For a hosted static build, use bundle exec jekyll build --destination dist. The .openai directory only identifies the private hosted preview; it is omitted from the downloadable project ZIP.

## Files

The content stays under pages and the ten separate collection folders. One document layout, one card component, and one listing include render all types; the people, news, and events layout files only select their collection. The schemas extend the supplied v1.4 document with policy images and multiple group leads. Presentation lives in assets/viewer.css and assets/viewer.js. The Content checks page shows optional values and the latest data audit; reports also include verification results for the build and rendered collection links.

The source snapshot is adam-3bian/adam-3bian.github.io at commit 7f3839872c8fea6a709b99d241880de0f3915c42. Original image bytes are bundled. The check script validates data and image paths; it does not claim that external websites or downloads are available.
