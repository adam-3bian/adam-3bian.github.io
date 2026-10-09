# Start the CHERI Alliance migration

Work in this project/repository using **CHERI_MIGRATION_SPEC.md** as the full authoritative migration requirement and **AGENTS.md** as the non-negotiable execution rules. Also read the provisional **CHERI_HIERARCHICAL_SITEMAP.md** and **CHERI_SITE_INVENTORY.json**, plus any source exports/HTML mirrors I have uploaded.

**Objective:** Build a complete, verifiable Jekyll/Kramdown migration of both https://cheri-alliance.org/ and https://cheri-alliance.github.io/, with all public source content preserved verbatim; simple relationship-based front matter; content-aligned assets; and left/right/full-width images expressed with Kramdown attribute lists.

Proceed in stages and save your work to disk. **First, verify the available inputs and expand the canonical URL, page, asset and form inventory** before attempting to declare any pages complete. Separate the two domains and retain provenance. Map each discovered source URL to a local content file and an explicit status.

Next, implement a reproducible extraction/conversion/verification pipeline, using original HTML/source exports and downloaded media when available. Process in manageable batches and run page-by-page rendered-text, structural, link, image and asset comparisons. Keep reports and `PROGRESS.md` updated after each batch. If this environment lacks source access or required files, record exact blockers; don't fabricate missing content or silently declare success.

I want **real completed files plus an auditable verification report**, not example-only pages or a summary of the websites. Never replace full article bodies with archive excerpts. Start with inventory validation, a test extraction/conversion of representative page types, and evidence that the checks work; then continue across the full discovered inventory within the available execution time. Clearly report unfinished work without claiming it is complete.