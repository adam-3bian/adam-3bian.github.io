# Validation contract — content-complete ZIP design

This document describes **checks to run when actually implementing the site**, not a claim that they have been run. Refer to `README_MIGRATION.md` and `docs/DEPLOYMENT.md` for the available runtime. Never report existing `PROGRESS.md` metrics as fresh test results.

## Baseline and scope

- Record the source commit and enumerate editorial files, canonical/alternate routes, asset bytes, source signatures and relationship IDs.
- Compare each affected output page with its complete source body: all text/ordering, headings and fragment IDs, lists, definitions, code, tables, links, images and captions. State exact unverified records.
- Keep original files and assets unchanged for theme-only or instruction-only tasks; compare the changed-path list to prove scope.
- Catalogue every created/removed route and report genuine source gaps. Do not claim a full PDF merely because an external paper link exists.

## Runnable repository checks (use the installed runtime)

```sh
scripts/ruby.sh scripts/check_markdown.rb
scripts/ruby.sh scripts/build.rb
/workspace/cheri-migration-venv/bin/python scripts/check_build.py
/workspace/cheri-migration-venv/bin/python scripts/check_site_links.py
/workspace/cheri-migration-venv/bin/python scripts/check_entities.py
/workspace/cheri-migration-venv/bin/python scripts/check_website.py
python3 scripts/check_theme.py
/workspace/cheri-migration-venv/bin/python -m unittest discover -s tests -v
python3 scripts/check_browser.py
python3 scripts/check_website_browser.py
```

Use the corresponding `bundle exec` / project virtualenv commands from `docs/DEPLOYMENT.md` outside that prepared runtime. `scripts/report.py` and original-source comparison require raw `sources/` snapshots that are not necessarily present in a fresh clone. Mark those tests **not run**, rather than passing them on historical report evidence.

## ZIP parity and behavior

Compare native layouts, includes, Sass, official logos, patterns, JS, typography and computed styles to the ZIP and `reports/template-integration.json`. Where a separate reference build is available, run `python3 scripts/check_theme.py --reference-site /path/to/reference-build`. Check 375/768/1024/1440px for light content pages, dark homepage, cards, long bodies, menus, overflow and pattern opacity.

Test full-page body text, real images and downloads, no template-demo content, source link/fragment preservation, canonical URLs, root/project-baseurl routing, keyboard navigation and submenu, gallery dialog/Escape/focus, carousel controls and reduced motion, date/role ordering, full-body search, no-JS fallback and disconnected forms. Run all relevant validations before declaring the full transformation done.

## Instruction-reset-only PR gate

For a PR that **only resets prompts/docs**, do not falsely claim Jekyll or browser validation was executed. Instead verify the file diff contains only explicit instruction/documentation paths, no editorial/asset/runtime changes, no references from the new active instructions to retired master-prompt authority, and no forbidden deployment or merge. Publish that limited result in the PR. Existing website behavior is structurally unchanged, but runtime checks still belong to a subsequent implementation task.
