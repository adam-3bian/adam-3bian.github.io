# Catalogue consistency review

Before captures show `da62b24`; after captures show this refinement. All images are unaltered local Chromium screenshots at matching 1440×1000 desktop and 390×844 mobile viewports.

## Changes

- Category pages use the existing mega-menu groups and options as compact clickable cards. Additional authored destinations and child routes appear once below. All 84 mega-menu options, destinations and their order are preserved.
- Related records, Where next and Related pages share compact rows and common headings. Navigation descriptions and duplicated event context no longer appear beneath or within cards. The underlying Markdown and structured values are unchanged.
- People grids use horizontal square-image/name cards; organisation logos remain in landscape frames. Images are contained to preserve faces, lettering and diagrams. Missing or failed catalogue images use neutral decorative placeholders.
- The hero has only a bottom keyline. Whole-card hover uses border, surface and shadow instead of title underlines. Gradients and transparency are confined to decorative surrounds; text-bearing surfaces are opaque and plain.
- The light mega-menu uses the existing logo blue, `#125770`, with white text. The newsletter has a plain white foreground, restrained shadow and the requested Get the newsletter action.
- Founding-member badges use the 21 existing status values. See the [membership comparison](../../MEMBERSHIP_REVIEW.md) for official profile checks and limitations.
- A configured `form.action` enables native contact submission. With no endpoint, visitors use the existing published-form link, rather than disabled controls. No submission service was invented and no test enquiry was sent.

## Matching views

| View | Desktop before | Desktop after | Mobile before | Mobile after |
| --- | --- | --- | --- | --- |
| Homepage hero | [Before](before-desktop-home.png) | [After](after-desktop-home.png) | [Before](before-mobile-home.png) | [After](after-mobile-home.png) |
| Alliance category | [Before](before-desktop-alliance.png) | [After](after-desktop-alliance.png) | [Before](before-mobile-alliance.png) | [After](after-mobile-alliance.png) |
| Build category | [Before](before-desktop-build.png) | [After](after-desktop-build.png) | [Before](before-mobile-build.png) | [After](after-mobile-build.png) |
| Conference navigation | [Before](before-desktop-blossoms.png) | [After](after-desktop-blossoms.png) | [Before](before-mobile-blossoms.png) | [After](after-mobile-blossoms.png) |
| People grid and placeholders | [Before](before-desktop-people.png) | [After](after-desktop-people.png) | [Before](before-mobile-people.png) | [After](after-mobile-people.png) |
| Members and founding badge | [Before](before-desktop-members.png) | [After](after-desktop-members.png) | [Before](before-mobile-members.png) | [After](after-mobile-members.png) |
| Person detail | [Before](before-desktop-person.png) | [After](after-desktop-person.png) | [Before](before-mobile-person.png) | [After](after-mobile-person.png) |
| Related records | [Before](before-desktop-related.png) | [After](after-desktop-related.png) | [Before](before-mobile-related.png) | [After](after-mobile-related.png) |
| Contact page | [Before](before-desktop-contact.png) | [After](after-desktop-contact.png) | [Before](before-mobile-contact.png) | [After](after-mobile-contact.png) |
| Newsletter band and common headings | [Before](before-desktop-newsletter.png) | [After](after-desktop-newsletter.png) | [Before](before-mobile-newsletter.png) | [After](after-mobile-newsletter.png) |
| Unchanged mega-menu options | [Before](before-desktop-menu.png) | [After](after-desktop-menu.png) | [Before](before-mobile-menu.png) | [After](after-mobile-menu.png) |

## Preservation and verification

The source comparison found all 784 authored Markdown files unchanged, including their front matter. A comparison across all 738 rendered routes found no lost links or anchors, no collection article-body text changes and no menu link changes. Record counts, references, glossary content, redirects and all 84 talks passed the existing preservation checks.

Safe-mode builds passed at `/` and `/preview/`, with no new broken references. Contact form checks cover native POST/GET behaviour, local and external actions, baseurl handling, field names and labels, front-matter activation, and the no-endpoint fallback. No real form submissions were made.

The existing catalogue, layout, presentation and refinement browser suites and the new consistency suite passed on both outputs: 300 automated responsive checks and 198 axe accessibility audits, alongside the presentation review. The consistency suite checks all 84 menu links against the unchanged configuration, desktop/mobile menu operation, 21 founding badges, all 111 people image frames, absent and failed-image fallbacks, compact related navigation, plain newsletter surfaces, hero borders and visible keyboard focus. Both no-JavaScript checks passed.

After the final removal of obsolete preview notices from rendered form pages, both safe-mode builds, static content checks, route preservation comparison and the consistency suite were repeated successfully. The matching after screenshots were then recaptured. The earlier suites had already passed the final visual implementation; they were not rerun solely for that UI-copy suppression.

See [shared design rules](../../DESIGN_SYSTEM.md) and [authoring guidance](../../AUTHORING.md).
