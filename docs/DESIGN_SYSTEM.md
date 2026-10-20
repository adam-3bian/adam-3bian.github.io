# Shared design rules

The catalogue polish builds on `bcdd236`. Authored Markdown, record metadata, relationships and media remain the source of truth. Presentation belongs in layouts, includes, Sass and progressive enhancements.

## Canvas and surfaces

`_sass/settings.scss` owns the light palette and the homepage's dark palette. Reading surfaces, headers, heroes, cards and footers use opaque fills. The original honeycomb tiles retain their native scale and repeat in the surrounding page canvas; the newsletter band also displays the motif behind its solid action card. Decorative artwork uses opacity; text-bearing surfaces do not use glass effects.

The page canvas has no outer card border or shadow. Its 1264px container includes shared 20px mobile and 32px desktop gutters, giving a 1200px content area on wide screens. Header/footer backgrounds span the viewport and their inner content uses the same container. News and ordinary pages fill the available content area. Collection-detail prose retains its readable width and optional facts/resources panel. Sparse records do not reserve an empty panel.

Only `/` receives `home-page` and the dark palette. Its hero, slider, three-panel and two-panel groups and onward sections retain their composition. Other routes stay light; there is no theme preference or toggle.

## Navigation cards and content panels

| Component | Markup and behaviour | Appearance |
| --- | --- | --- |
| Record/destination card | A single `a.catalog-card.navigation-card` with a real `href`. The whole card is the link. | Opaque surface, modest border/radius, subtle resting shadow, stronger border/shadow and underlined title on hover/focus. |
| Large action or slide | A single `a.card` with a real `href`. Existing action/slider labels remain intact. | The same border/radius/focus language, with padding appropriate to the larger composition. |
| Multi-link editorial panel | `section.content-panel.content`, containing independent native links. | Quiet secondary surface and border, no raised shadow, pointer cursor or whole-panel hover state. |
| Product entry without a destination | `article.catalog-card.content-panel`, without a fabricated link or action. | Quiet panel treatment within the existing list/grid geometry. |
| Talks | `li.content-panel` containing the event and individual resource links. | Quiet secondary surface; the row is passive and each action is an independent link. |
| Facts/resources | A semantic definition list and labelled resource links inside compact panels. | Borders and spacing provide structure; the panels do not suggest whole-panel interaction. |

Do not put a link, button or input inside a navigation-card link. Do not use `onclick`, stretched-link overlays or `role="link"` on a passive panel. Every destination must remain an explicit native link. Do not delete independent links merely to make a whole panel clickable.

`_includes/card.html` is shared by collection directories, related records and resource listings. `_includes/section-cards.html` arranges complete authored sections into multi-link panels. Use these shared components instead of copying card markup into Markdown.

List and Grid use the same records and DOM. List cards reserve a dedicated action area on wide screens; mobile actions follow the summary. Grid cards keep their actions aligned at the foot of the content. Long titles wrap; missing images do not produce placeholders. Logos and diagrams use `contain`, while suitable photographs retain their existing crop settings.

## Type, spacing and controls

Use the existing Poppins family and spacing scale from `settings.scss`. Titles are compact outside the homepage. Card summaries and metadata have distinct, readable sizes; facts labels remain quieter than their values. Keep prose, tables, citations, code and editorial images intact.

Shared surfaces use a 12px radius; inputs and buttons use 8px. Navigation cards use the resting/hover shadow tokens. Passive panels and facts use borders rather than the navigation-card shadow. Keep visible focus outlines outside the card boundary, and preserve native link underlines in prose and editorial panels.

Controls use at least 44px height. Glossary index links and permalink controls also have 44px targets. Inline prose links keep their natural typography. The desktop menu starts at the shared 1000px navigation breakpoint; its `▼`/`▲` indicators remain decorative and follow `aria-expanded`. Reduced-motion preferences disable card transitions and the existing carousel autoplay.

## Glossary

The glossary Markdown is unchanged. `_layouts/glossary.html` presents its existing letter groups, term headings and definition-marker paragraphs as semantic `dl`/`dt`/`dd` rows. Existing letter anchors and term destinations are retained; each term also gets a `glossary-term-…` permalink. Preserve these new anchors when changing the presentation in future.

The alphabet index contains the authored letters only. Definitions are open by default. Search matches all words across terms and definitions, ignores accents, reports results and offers clear/reset controls. Following a term or letter anchor clears the filter, reveals the target and moves keyboard focus where appropriate. Without JavaScript, the complete glossary, alphabet index, original links and new term anchors remain available; search controls remain hidden.

On wide screens, letters, terms and definitions align into reference columns. At tablet widths, terms sit above definitions; on mobile, letter groups follow the same single-column flow. There is no card or accordion around every definition.

## Review and maintenance

Run the existing content, catalogue and layout checks plus `scripts/test_presentation.py`. Build in safe mode at `/` and `/preview/`. The presentation checks verify glossary wording/order/links, search and hash behaviour, no-JavaScript access, card semantics, opaque surfaces, reduced-motion styles and tablet accessibility. See `DESIGN_REVIEW.md` for the results and screenshots from this pass.
