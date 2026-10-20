# Collection detail widths

Matching local browser captures before (`00759d5`) and after removing the unconditional `73ch` article limit. Desktop is 1440×1000; mobile is 390×844. The only production change is to shared Sass. Content, metadata, templates, assets and the rules selecting a useful aside are unchanged.

| Detail | Desktop before | Desktop after | Mobile before | Mobile after |
| --- | --- | --- | --- | --- |
| CheriBSD: one inline fact | [Before](before-desktop-cheribsd.png) | [After](after-desktop-cheribsd.png) | [Before](before-mobile-cheribsd.png) | [After](after-mobile-cheribsd.png) |
| X730: technical and certification aside | [Before](before-desktop-x730.png) | [After](after-desktop-x730.png) | [Before](before-mobile-x730.png) | [After](after-mobile-x730.png) |
| CHERIoT: inline facts and code examples | [Before](before-desktop-cheriot.png) | [After](after-desktop-cheriot.png) | [Before](before-mobile-cheriot.png) | [After](after-mobile-cheriot.png) |

At desktop size, the shared content area is 1200px. CheriBSD and CHERIoT now use all 1200px instead of 690px. X730's article uses its full 851px column alongside the existing 64px gap and 285px aside, rather than retaining an additional empty strip inside the article column. At mobile size, the article remains 350px wide and the X730 aside stays above the body.

See the [shared design rules](../../DESIGN_SYSTEM.md#detail-facts-and-resources). The browser refinement suite includes CheriBSD, X730 and the Intellectual Property Policy, and checks full-width articles, occupied sidebar columns and mobile stacking.

Validation completed for this change: safe-mode Jekyll builds at `/` and `/preview/`; `check_content.py` and `check_refinement.py` against both outputs; and `test_refinement.py` against both deployments. The browser runs passed 120 responsive views at 320, 390, 768, 1000 and 1440px and 72 axe audits without violations. Both builds retain 738 rendered pages and add no broken references. Screenshots are local renders; publication is verified separately through GitHub Actions.
