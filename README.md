# CHERI Content Viewer

A minimal, reusable Jekyll site for reviewing the 481 migrated content records. The latest deduplicated Markdown files are included unchanged, with all specification fields and 341 original images.

## Run locally

Install Ruby 3.2 or later and Bundler, then run these commands in this directory:

```sh
bundle install
bundle exec ruby scripts/check_content.rb
bundle exec jekyll serve
```

Open http://localhost:4000. The content checks page is at http://localhost:4000/checks/.

## What to check

The source menu and the ten collection links let you reach the content. Each detail page shows its title, primary image, populated metadata, article body, linked records, and an expandable front matter inspector. Unused null and empty values remain visible in the inspector. Primary images render once; body illustrations stay with the content.

The content checks page lists every page and record, including retained source versions and aliases. Its small filter can find a title, type, or source file. Missing optional images or news dates are identified as unprovided values. Actual errors include incomplete schemas, invalid dates, unknown relationship references, broken navigation targets, and missing image files.

News is newest first, with undated records after dated ones. Events are earliest first; upcoming and past lists use the final event day in the Europe/London timezone. People, organisations, and other collections sort alphabetically. The speaker list uses is_speaker, and the member list uses a confirmed membership_tier. Alternate source records remain accessible from the audit while canonical lists omit them.

Authors, speakers, affiliations, lead and author roles, and generic related fields produce clickable forward and reverse relationships. Reverse links are derived by the check script; do not edit _data/relationships.yml. After changing content or front matter, run the check script again before building to refresh the audit and reverse links.

The five retained alias pages show their destination links. They are reviewable pages; this viewer does not automatically redirect them. Contact and subscription pages are content examples; no form submits data.


## Markdown image layout

All Markdown images are responsive and stay inside the shared page container. Use a Kramdown **inline** attribute list immediately after the image (on the same line) to opt into an alignment. Examples use placeholder paths; replace them with existing files in `assets/`:

```markdown
![Descriptive alt text](/assets/example.jpg){: .image-left }

![Descriptive alt text](/assets/example.jpg){: .image-right }

![Descriptive alt text](/assets/example.jpg){: .image-full }
```

Left and right images float beside text on larger screens (up to 45% width, capped at 25rem). At 640px and below, both stack at 100% of the container; `.image-full` always fills the container. Ordinary Markdown images retain their natural aspect ratio. A semantic `<figure class="image-left">` / `<figure class="image-right">` / `<figure class="image-full">` with `<figcaption>` also works when captions are needed. Do not use fixed inline widths or alignment HTML attributes. The `image-full` class means the entire **content** width, not an overflow beyond the viewport.

## Build and GitHub Pages

```sh
bundle exec ruby scripts/check_content.rb
bundle exec jekyll build
```

Jekyll writes the static site into _site. The site uses Jekyll 3.10, standard Liquid, and Kramdown. One small parser plugin keeps text containing a pipe character as a paragraph; the source Markdown stays unchanged. Set url and baseurl in _config.yml for your repository. Internal links and images use relative_url, including body illustrations, so repository subpaths work. For GitHub Pages, build with GitHub Actions and publish _site; the built-in Pages safe-mode build does not load custom plugins.

For a hosted static build, use bundle exec jekyll build --destination dist. The .openai directory only identifies the private hosted preview; it is omitted from the downloadable project ZIP.

## Files

The content stays under pages and the ten separate collection folders. One document layout, one card component, and one listing include render all types; the people, news, and events layout files only select their collection. The schemas come from the supplied v1.4 document. Presentation lives in assets/viewer.css and assets/viewer.js. The Content checks page shows missing optional values and the latest data audit; reports also include verification results for the native build, rendered links, and a repository subpath. Browser visual testing was unavailable in the build environment.

The source snapshot is adam-3bian/adam-3bian.github.io at commit 7f3839872c8fea6a709b99d241880de0f3915c42. Original image bytes are bundled. The check script validates data and image paths; it does not claim that external websites or downloads are available.
