# Layout repair screenshots

The homepage comparisons show `01e5f11` before the repairs and the corrected layout, at matching viewport widths. The original at `362e3d6` was used to check the hero, palette, honeycomb and section composition.

| Homepage | Before | After |
| --- | --- | --- |
| Desktop, 1600px | [Before](before-desktop-home.png) | [After](after-desktop-home.png) |
| Mobile, 390px | [Before](before-mobile-home.png) | [After](after-mobile-home.png) |

Representative repaired reading layouts, captured at 1440px desktop and 390px mobile:

| Page | Desktop | Mobile |
| --- | --- | --- |
| Ordinary page | [How does CHERI work?](after-desktop-page.png) | [How does CHERI work?](after-mobile-page.png) |
| News article | [AI Doesn't Need a Kill Switch](after-desktop-news.png) | [AI Doesn't Need a Kill Switch](after-mobile-news.png) |

These are unaltered browser captures. The full local evidence in `reports/layout-fixes/` includes before/after full-page screenshots of all five representative route types, including the footer, directories and collection details, plus the original-reference captures. The automated workflow regenerates the repaired views and uploads the complete review artifact. See [validation results](../../VALIDATION.md#layout-repairs) for causes, measured widths and the checks performed.
