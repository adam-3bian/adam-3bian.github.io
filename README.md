# CHERI Alliance content migration

This repository is the working project for a **source-faithful migration** of:

- https://cheri-alliance.org/
- https://cheri-alliance.github.io/

The target is **Jekyll/Kramdown Markdown** with complete page bodies, source-backed reusable entities, minimal YAML front matter, and assets organised by content entity.

> **Status: specification and provisional inventories only.** Neither source website has been fully scraped into this repository. No claim of 100% coverage or verification has been made.

## Start here

1. Read [AGENTS.md](AGENTS.md) (non-negotiable coding-agent instructions).
2. Read [CHERI_MIGRATION_SPEC.md](CHERI_MIGRATION_SPEC.md) (authoritative requirements).
3. Use [START_PROMPT.md](START_PROMPT.md) to initiate work in Codex (GPT-6 Astra or GPT-6.1 Sol).
4. Consult [CHERI_HIERARCHICAL_SITEMAP.md](CHERI_HIERARCHICAL_SITEMAP.md) and [CHERI_SITE_INVENTORY.json](CHERI_SITE_INVENTORY.json). They are **provisional**, not validated against a complete crawl.
5. Keep [PROGRESS.md](PROGRESS.md) updated per batch and record unresolved discrepancies.

The all-in-one alternative is [CHERI_MASTER_PROMPT.md](CHERI_MASTER_PROMPT.md). [CHERI_SCRAPE_UPLOAD_GUIDE.md](CHERI_SCRAPE_UPLOAD_GUIDE.md) explains recommended original-source exports, uploads and crawl evidence. [README_CHERI_PROMPT_PACK.md](README_CHERI_PROMPT_PACK.md) explains how the instruction pack is organised.

## Content / assets model

The eventual content model covers events, working groups, organisations, news, people, papers, products, platforms, projects, standards, guides, media, resources, policies, certifications and forms. Use only source-verified records and relationships. Place assets in matching entity-based subdirectories and store shared assets once.

## Completeness gate

Do not report a successful migration until a reproducible inventory and source-to-output comparison accounts for every eligible page, text block, meaningful asset and link. Missing source material must be reported, **never replaced with invented content**.

## Source material still needed

A WordPress export and media folder, the source for the GitHub Pages site, and/or complete crawl snapshots and logs. Please do not commit credentials, private membership data or form submissions.
