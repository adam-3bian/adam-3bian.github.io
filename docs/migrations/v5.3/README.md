# v5.3 migration review

The newsletter and footer now form one continuous band. The 12px space belongs to `main`, preserving separation from the header and the newsletter without cutting the footer in half. All action links retain the rounded white newsletter-button treatment, and Contact Us remains the last header action.

## Inventory and routing

`records.csv` maps every original authored record to its new source and public URL. `routes.csv` maps the 738 original rendered URLs; routing-only documents preserve legacy paths, including hardware/software paths. `fragments.csv`, `published-assets.csv`, `prose.csv` and `relationships.csv` record output parity. The complete original source and frozen published inventory are retained as excluded review evidence, never read by website templates.

News uses 48 built-in posts. All 111 people, 69 organisations, 10 events, 16 groups, 10 guides, 11 policies and nine board members remain. The 15 academic papers and five reports share the publication family; report URLs remain unchanged. Existing 84 talk IDs and their speakers/media now belong to their event programmes. Additional published programme rows are retained too.

Morello and Sonata are hardware products. CHERIoT and FPGA-platform guides remain ordinary explanatory pages. The two CHERI Enabled certification records remain ordinary records with their certification facts and separate URLs; the certification overview links to those records. Neither Morello nor Sonata is presented as certified by that migration.

CheriBSD and CHERI Zephyr have verified public source-code repositories (GitHub API returned 200). Compiler/language/tool roundups and operating-system overviews remain ordinary pages until a specific codebase is established. No code repository, employer, job title or event opening time was invented.

All original image, document and font bytes remain at their old URLs. Referenced images also have canonical owner/shared paths. The historical logo ZIP was absent from the checkout and its captured upstream URL returned 404. Its download URL now serves a package of the exact existing site logo files, with a README identifying that restored package; it is not claimed to be the missing original archive.

Several inherited redirects pointed to nonexistent `-original` articles or absent FreeBSD/Zephyr overview routes. They now point directly to existing canonical content. Malformed YouTube query separators are corrected without changing the source video or playlist identities (`media-url-repairs.csv`). Existing query strings and fragments are carried by the redirect script; native refresh and fallback links remain available.

## Editorial gaps

`editorial-review.csv` records the original uncertainties; `source-data-warnings.csv` lists the remaining validation warnings by record. Source validation also reports affiliations without verified position titles/dates and start-only programme timings. Those affiliations remain visible without fabricated employment status. Where a biography explicitly names a current title, that title is retained, including simultaneous affiliations. Board roles remain separate from employment.

The CHERI Alliance organisation had a membership flag but no membership status. It remains in All Organisations and has a full profile, while `current_members` contains the 51 records with verified active source status. The nine-person board retains its original order.

Six previously unlinked talks have a unique matching published event date; their ownership is recorded for review. Two CHERI Blossoms 2026 message rows belong to conference Day 1 (26 March), as shown by their published D1 sequence; 25 March is the separate tutorial. The three published 2027 programme days also live in event schedule YAML. Start-only timetable rows retain that precision. Only the webinar's published 14:00–14:30 BST window supplies verified whole-event clock bounds.

Contact and newsletter remain external-provider forms. Obsolete preview-only prose and duplicate provider links are replaced by their canonical form definition. Field metadata preserves the original provider wire names, but external mode renders no local inputs or fake submit button. The POST renderer is exercised with non-submitting fixtures only.

`remote-links.csv` records read-only HEAD checks of all external CTA destinations. Provider pages and the two repository identities were also verified with GET. Some inherited sites reject automated requests or no longer respond; their original sourced destinations remain available for editorial review. No successful reachability claim is made for blocked or failed checks.

## Validation

The checked-in schema validator rejects unknown keys, invalid taxonomies, missing references, duplicate routes, unsafe form configurations, invalid schedule scopes/IDs, ambiguous clock times and same-track overlaps. Independent fixtures cover multiple current employers, inverse organisation views, multiple organisers, publication ownership, guide sequence and DST boundaries. The rendered audit checks local links, important fragments, original binaries and minimal redirects at both root and `/preview`.

The complete supplied specification, including all 20 family wireframes, is retained in `SPECIFICATION.txt`. No example identity or illustrative URL from it was published as a real record.

The final verification is recorded in `verification.json`: both safe builds pass with zero local link/schema errors. Browser checks cover 1,186 responsive views across root and preview, including all 48 article details. Every original paragraph is accounted for and all 207 code examples retain their text and indentation. Articles derive their reading estimates and category neighbours without duplicated metadata.
