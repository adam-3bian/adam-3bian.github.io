# Instruction reset — 10 October 2026

This change resets **active guidance only**. It does not itself rebuild the site, reacquire historical content or deploy anything. Baseline: `main` commit `3f7405c96027c8aa7335b6ec24ea5e3f695cb0c4`.

## Single entry and authority

- `AGENTS.md` — top-level agent policies, task scoping and precedence.
- `TRANSFORMATION_PROMPT.md` — one full implementation brief for using the existing source-backed repository with the attached ZIP's actual theme and methodology.
- `START_PROMPT.md` — short pointer for an agent about to work.
- `docs/THEME.md` — **unchanged** integrated ZIP design reference.
- `docs/AUTHORING.md` — **unchanged** real collection authoring/relationships.
- `MIGRATION_SPEC.md` — current content-fidelity requirements; acquisition explicitly opt-in.
- `docs/VALIDATION.md` — checks and honest pass/fail evidence.

Old filenames `CHERI_MASTER_PROMPT.md`, `CHERI_MIGRATION_SPEC.md` and `README_CHERI_PROMPT_PACK.md` are retained as short **compatibility pointers only** so bookmarked links cannot silently re-activate incompatible instructions. `CHERI_SCRAPE_UPLOAD_GUIDE.md` is a non-active pointer for historical capture; original files remain recoverable through Git history. Existing `PROGRESS.md`, `reports/`, inventory and source documents remain historical evidence, not competing master prompts.

## Scope protections

No collection Markdown, image, document, theme code, build script, dependency, GitHub workflow, route, permalink or deployment setting is modified by this reset. Those may be changed only in a separately authorized website implementation. A PR build may run GitHub Actions, but no deployment or merge is requested. The ZIP's original rules remain the presentation authority; working content and repository features remain the implementation baseline.

## Future use

Open the repository on a fresh agent session and read `AGENTS.md`, then `TRANSFORMATION_PROMPT.md` when asking for the complete transformation. Attach or provide the actual ZIP; do not infer it from a description. Any new acquisition of external historical archives or inaccessible PDFs requires an explicit separate request, provenance and validation.
