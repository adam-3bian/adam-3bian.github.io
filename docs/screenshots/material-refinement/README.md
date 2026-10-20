# Material design refinement

The baseline is commit `acd9af9`. Captures use matching 1440×1000 desktop and 390×844 mobile Chromium viewports. The before pages were captured before implementation. Expanded-menu baseline captures use the original commit’s compiled stylesheet with the unchanged menu and category markup, opened by keyboard to avoid the hover-and-click toggle closing it during capture. Images are unaltered browser screenshots.

## Design decisions

The refinement keeps the existing page composition and CHERI identity while giving shared components clearer hierarchy and visible resting depth. Logo blue is the primary light-page accent, navy remains the reading colour, cyan identifies menu groups on blue, and red stays limited to the existing important actions.

`tokens.scss` supplies one responsive type scale, corner treatment, gradient palette and elevation scale. Material elevation and Bootstrap typography/spacing informed the rules; no framework, font or JavaScript dependency was added. See the [design-system documentation](../../DESIGN_SYSTEM.md) for the reference links and component contract.

Standalone navigation cards have shallow shadows at rest; compact rows and reading pages stay flat. The slider has a visible gradient frame around its opaque surface. Catalogue Grid view has a pale horizontal gradient between solid cards, while the newsletter has a stronger navy-to-blue surround behind its plain white foreground. The mega-menu has a broad shadow and cyan group headings, including its expanded mobile groups. Text remains on plain, opaque surfaces.

The redundant Introduction labels, generic directory eyebrow and repeated collection name beside the result count no longer render. Source metadata is untouched. Useful event dates/status and document types remain readable in sentence case. Glossary terms use the shared title role, with solid blue letter markers and a quiet alphabet strip. Full content widths, the homepage-only dark appearance, honeycomb, portraits, logo frames and the native-link/panel distinction remain intact.

## Matching screenshots

| View | Desktop before | Desktop after | Mobile before | Mobile after |
| --- | --- | --- | --- | --- |
| Homepage hero | [Before](before-desktop-home.png) | [After](after-desktop-home.png) | [Before](before-mobile-home.png) | [After](after-mobile-home.png) |
| Slider and homepage sections | [Before](before-desktop-slider.png) | [After](after-desktop-slider.png) | [Before](before-mobile-slider.png) | [After](after-mobile-slider.png) |
| Category navigation | [Before](before-desktop-alliance.png) | [After](after-desktop-alliance.png) | [Before](before-mobile-alliance.png) | [After](after-mobile-alliance.png) |
| Expanded mega-menu | [Before](before-desktop-menu.png) | [After](after-desktop-menu.png) | [Before](before-mobile-menu.png) | [After](after-mobile-menu.png) |
| People grid | [Before](before-desktop-people.png) | [After](after-desktop-people.png) | [Before](before-mobile-people.png) | [After](after-mobile-people.png) |
| Member list | [Before](before-desktop-members.png) | [After](after-desktop-members.png) | [Before](before-mobile-members.png) | [After](after-mobile-members.png) |
| Person detail | [Before](before-desktop-person.png) | [After](after-desktop-person.png) | [Before](before-mobile-person.png) | [After](after-mobile-person.png) |
| CHERIBSD without an aside | [Before](before-desktop-software.png) | [After](after-desktop-software.png) | [Before](before-mobile-software.png) | [After](after-mobile-software.png) |
| X730 with an aside | [Before](before-desktop-hardware.png) | [After](after-desktop-hardware.png) | [Before](before-mobile-hardware.png) | [After](after-mobile-hardware.png) |
| Glossary | [Before](before-desktop-glossary.png) | [After](after-desktop-glossary.png) | [Before](before-mobile-glossary.png) | [After](after-mobile-glossary.png) |
| Presentations and onward links | [Before](before-desktop-presentations.png) | [After](after-desktop-presentations.png) | [Before](before-mobile-presentations.png) | [After](after-mobile-presentations.png) |
| News article | [Before](before-desktop-article.png) | [After](after-desktop-article.png) | [Before](before-mobile-article.png) | [After](after-mobile-article.png) |
| Newsletter and footer | [Before](before-desktop-newsletter.png) | [After](after-desktop-newsletter.png) | [Before](before-mobile-newsletter.png) | [After](after-mobile-newsletter.png) |

## Preservation and verification

Both production safe-mode Jekyll builds passed, at `/` and `/preview/`. Both outputs passed `check_content.py` and `check_refinement.py`, with no errors or new broken references. The existing 15 unresolved source references remain recorded by the content audit and were not changed during this presentation pass. Event boundary and configured/unconfigured form tests also passed; no form submission was sent.

All five browser suites passed on both outputs. Together, the layout, refinement and consistency suites completed 310 responsive checks; the catalogue, presentation, refinement and consistency suites completed 202 axe accessibility audits with no reported violations. The presentation suite also reviewed 25 views per output. Checks covered widths from 320 to 1920px, keyboard navigation, focus, Unicode menu state, no-JavaScript content, search/filter/sort persistence, glossary hash/history behaviour, mobile overflow, image fallbacks, sparse metadata, article width, zoom-equivalent layout and reduced-motion settings.

The expanded consistency suite checks the reported presentations page, sentence-case labels, menu typography, visible resting shadows and a plain painted surface behind visible text before any gradient ancestor. It verifies all 84 menu links and their order against the unchanged navigation configuration. These automated checks supplement the visual review; they are not a claim of exhaustive accessibility certification.

All 784 authored Markdown files, including front matter, remain byte-identical. The 738-route comparison found no lost main-content links, anchors, collection body text or navigation links. The glossary's 46 definitions and 20 linked terms, 266 redirects and 84 rendered talks passed the existing preservation checks. All 52 gallery images were captured at matching viewport sizes, with final after captures taken from the completed root build.
