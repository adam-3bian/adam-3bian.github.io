# CHERI Alliance migration — prompt pack

This pack bundles a **single copy-and-paste prompt** and the **recommended Codex/Work file-based workflow**. It does not contain a completed website scrape.

## Recommended setup

Use **GPT-6 Astra in Codex** (Medium reasoning to start; High for difficult migration, provenance or validation issues). Codex is well suited to processing source exports, writing conversion scripts, creating Jekyll files and running tests. ChatGPT Work is a useful alternative if accessing and navigating live websites via a cloud browser is the main obstacle. In standard Chat, GPT-6 High or Extra High is most useful for reviewing the information architecture and migration outputs.

1. Create or open a Git repository for the migration.
2. Copy `AGENTS.md`, `CHERI_MIGRATION_SPEC.md`, `START_PROMPT.md`, `PROGRESS_TEMPLATE.md` and the provisional inventories into the repository root.
3. Rename `PROGRESS_TEMPLATE.md` to `PROGRESS.md` and update it during the project.
4. Attach or place source exports/mirrors in the work environment: WordPress XML + upload files, GitHub Pages repository source, and/or HTML captures with crawl logs. Do not include credentials or private form submissions.
5. Paste the contents of `START_PROMPT.md` into Codex. Keep it pointed at the repository and ask it to execute real file changes and tests.
6. At checkpoints, request the completed/failing/unprocessed URL counts and a per-page audit; the provisional inventory is NOT evidence of a complete migration.

For a one-message alternative, paste the contents of `CHERI_MASTER_PROMPT.md`. It includes the specification inline; it is longer and harder to maintain than the recommended file-based approach.

## Why this structure

`AGENTS.md` is deliberately short and reusable. The complete authoritative requirements are in `CHERI_MIGRATION_SPEC.md`. `START_PROMPT.md` tells the agent which stage to execute. The sitemap and inventory are **inputs to verify and expand**, not a finish line. Disk-backed progress records survive chat-context compaction.

## Reminder

A prompt, model selection, sitemap inventory, or even a recursive crawler cannot guarantee no content was missed. For strongest assurance, combine authoritative CMS/repository source exports, a link/asset crawl, rendered source snapshots and automated per-page comparisons. Clearly label any unverified or inaccessible material.