# Accessibility regression review

Target: WCAG 2.2 AA. Automated checks support this target; they do not certify
conformance or replace testing with assistive technology and real devices.

Run `scripts/test_accessibility.cjs` with the same Playwright/axe environment as
the other browser tests. CI runs it for both root and `/preview` builds. It checks
whole-page axe findings at 320px, native skip links, 200% text enlargement,
720/360/320px reflow, search/filter focus and no-JavaScript reading. The dedicated
navigation, search, directories, reading and image suites cover the controls in
more depth. Narrow reflow approximates 200% and 400% browser zoom from a wide
desktop viewport; it does not emulate every browser's zoom implementation.

Before release, manually review these behaviours:

- With NVDA/Firefox or VoiceOver/Safari, navigate landmarks and headings, open
  menus, follow the current section and return to the main content. Check that
  disclosure, expanded and current states are announced clearly.
- Submit a search, change its type, clear it and try a query with no results.
  Confirm the polite result announcement is understandable and focus stays in
  the initiating control. Repeat with directory facets and Reset.
- Open an editorial image using Enter and Space, inspect its alternative and
  caption, use previous/next, close with Escape and confirm focus and scroll
  return. Check native dialog focus containment with Tab and Shift+Tab.
- At actual 200% and 400% browser zoom, inspect the header, forms, long titles,
  facts, tables, code and footer. Use a narrow phone in portrait and landscape.
  Wide tables/code may scroll within their own labelled regions.
- Disable JavaScript. Follow the native menu disclosures, homepage actions,
  learning sequence, directory links/alphabet and contents links. Search should
  explain its requirement and offer normal browse links; all directory records
  must remain available.
- Review informative artwork in context. Preserve captions and dark backgrounds.
  Source alt text is retained; check that detailed diagrams have enough adjacent
  explanation for the intended reader. Do not fabricate descriptions of images
  that have not been inspected.
- Enable reduced motion and forced colours, and check visible focus throughout.
  Review external links and third-party documents separately: the site's checks
  cannot establish the accessibility of those destinations.

The retained `/checks/` maintenance route is public and not access-controlled.
It is excluded from visitor navigation, search and sitemap and marked noindex.
CI also saves its output and validation reports as a maintainer artifact.
