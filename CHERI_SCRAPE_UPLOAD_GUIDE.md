# CHERI Alliance — source capture and upload guide

## Preferred option: upload source exports

If you have administrative access to the websites:

1. **WordPress / cheri-alliance.org:** export **All content** in WordPress (Tools → Export). Also copy the entire `wp-content/uploads` media directory, plus exported custom fields/custom post type configuration and form definitions where possible. WordPress XML does **not** contain the binary media files. Keep an archive of site HTML/rendered pages for comparison with what the visitor actually sees.
2. **GitHub Pages / cheri-alliance.github.io:** if you control the repository, provide a repository ZIP or Git export including Markdown/HTML, `_data`, layouts/includes, assets and configuration, plus any generated site output available. Do not assume any particular repository URL without verifying it.
3. Include original exports rather than relying only on AI-extracted text. Do not upload credentials, API tokens, private submissions, email subscriber details or other non-public personal data.

## Fallback: make local website mirrors

Run these commands on **your own machine** in a terminal with `wget` installed:

```bash
mkdir -p cheri-captures/original cheri-captures/github-pages

wget --mirror --page-requisites --adjust-extension \
  --directory-prefix=cheri-captures/original \
  --output-file=cheri-original-wget.log \
  https://cheri-alliance.org/

wget --mirror --page-requisites --adjust-extension \
  --directory-prefix=cheri-captures/github-pages \
  --output-file=cheri-github-pages-wget.log \
  https://cheri-alliance.github.io/
```

Inspect download logs for errors. A `wget` mirror may miss JavaScript-rendered content, dynamically loaded pagination, site-generated PDF links, form definitions or files that are not linked from scanned pages. Use browser automation for DOM snapshots where necessary and obtain the relevant website permissions. Do not submit contact/subscription forms while crawling.

## Upload a set of archives

Suggested uploads:

```text
cheri-original-wordpress-export.xml    (if available)
cheri-original-uploads.zip            (if available)
cheri-original-html.zip
cheri-github-source.zip               (if available)
cheri-github-html.zip
cheri-crawl-logs.zip
```

Keep the two source websites separate. If an archive is too large, split assets into several archives but preserve original relative paths. Including sitemaps, WARC captures or URL inventories is helpful.

## What Astra should do after upload

Start with the provisional `CHERI_HIERARCHICAL_SITEMAP.md` and `CHERI_SITE_INVENTORY.json`. Compare their URLs against the *uploaded* HTML/XML/source exports, recursively discover additional pages, and calculate an explicit missing-pages list. Do not convert a page until its body and referenced original assets have been captured. Follow `CHERI_MIGRATION_SPEC.md` for content-to-assets mapping, minimal front matter, entity relationships, Kramdown layout and page-by-page verification.

**Limit:** An offline mirror alone cannot guarantee complete coverage. The strongest evidence is a combination of authoritative exports, source files, a recursive link crawl, rendered DOM snapshots and file-by-file validation.