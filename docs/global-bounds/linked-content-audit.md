# Linked-content audit

The native Jekyll root and `/preview` builds each pass the site-wide audit across all 755 rendered pages and 472 source records. The checks compare rendered associations with front matter, so an unrelated record fails even when its URL exists.

| Check | Coverage per build | Result |
| --- | ---: | --- |
| Local link and asset destinations, including navigation/footer | 57,381 | Passed |
| Linked fragments, including redirects | 788 | Passed |
| Related-record sections, including intentionally absent sections | 1,334 | Passed |
| Related-record links | 1,333 | Passed |
| Fact links | 70 | Passed |
| Author links and order | 201 | Passed |
| Record resources | 156 | Passed |
| Programme speaker credits | 138 | Passed |
| Programme resources | 209 | Passed |
| Personal talk cards and their resources | 138 | Passed |

The separate migration checks also preserve 283 redirects, 366 original associations, 17,404 historical fragment references and 416 original assets. Manufacturer records pass 48 responsive views and 24 axe audits across Chromium, Firefox and WebKit, including reciprocal navigation between each product and its organisation.

## Repairs

- Morello now references Arm; Sonata references lowRISC. The previous missing manufacturer values caused Jekyll's `where` filter to enumerate all 69 organisations on both products. The filter now requires a nonempty reference; unresolved values render no manufacturer section or blank fact. Both organisation records show the corresponding product.
- Empty article categories cannot infer unrelated articles. Invalid related-content types cannot reuse the preceding reference's collection, and empty slugs cannot select the first record.
- Both Sonata documentation links use the maintained lowRISC documentation URL, verified against the project's own README and live documentation.
- The Sunburst announcement links to this site's existing CHERI Blossoms 2025 record, including the `/preview` prefix.
- Three export-control references use the publisher's current pages, verified by their navigation and page content. Policy wording remains unchanged.
- The archived cost-of-memory-unsafety page no longer links to the literal `Add Link to CRA Webinar` placeholder. Its existing wording remains; the unspecified study needs an editorial source.

## External destinations

All 565 original unique HTTP(S) URLs were requested, with HEAD followed by GET for unsuccessful responses. Six broken URL destinations were repaired or unlinked as listed above. The four new external destinations were checked again. The resulting site has **563 unique external URLs: 372 reachable, 4 returning HTTP 404, and 187 unverified** because of rate limits, access restrictions or connection failures. Third-party fragments and editorial accuracy are outside the HTTP check.

These four URLs remain for editorial review because a corresponding replacement could not be verified:

| URL returning 404 | Used by |
| --- | --- |
| `https://cheri-alliance.github.io/alliance/about-and-governance/technical-leadership/` | Collaboration Principles; Governance |
| `https://lowrisc.org/code-of-conduct/` | Current Code of Conduct; retained source version |
| `https://nquiringminds.com/snbd/` | NquiringMinds organisation |
| `https://www.linkedin.com/in/wlien/` | SCI Semiconductor and CHERI Alliance at RISC-V Summit in China |

The [complete machine-readable report](linked-content-audit.json) lists every final external URL, source pages, HTTP result and unverified response. External status checks are optional and separate from the CI gate: third-party outages must not block a valid Pages build. Local destinations and source-to-rendered record associations now run in CI for both deployment prefixes.

```sh
python scripts/check_linked_content.py --site dist --report reports/linked-content-root.json
python scripts/check_linked_content.py --site dist-baseurl/preview --baseurl /preview --report reports/linked-content-preview.json
# Optional live external scan:
python scripts/check_linked_content.py --site dist --external --report reports/linked-content-external.json
```
