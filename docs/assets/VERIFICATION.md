# Asset migration verification

Implemented on `design/catalogue-polish`, starting from `87c5045`.

| Result | Count |
| --- | ---: |
| Final organised asset files | 410 |
| Face-focused square portraits | 63 |
| Transparent 3:1 organisation logos | 52 |
| Contained 16:9 event thumbnails | 10 |
| Contained 16:9 post thumbnails | 47 |
| PDFs downloaded from cheri-alliance.org | 84 |
| Total local PDFs | 101 |
| Failed downloads | 0 |

All 410 final files are accounted for in the migration inventory, including
separately named primary derivatives of shared artwork. Every initial output
checksum matches the recorded migration result. Embedded colour profiles/XMP
were retained for 26 images. Alt text, captions, editorial wording, credits,
resource labels and licensing notices were preserved.

The editorial audit compared 801 Markdown records with the original branch.
Only asset references and primary image metadata changed. The rendered parity
check covers all 755 routes, including page wording, links, images and fragment
IDs, with asset paths normalised through the migration map. The original
preservation checks retain 366 relationships, 17,404 fragments and 416 historical
binary references. The 73 pre-existing source-data warnings remain unchanged.

## Checks performed

- Production safe Jekyll builds for `/` and `/preview`, using native Jekyll 3.10.
- Source contracts, glossary preservation, template inventory and Markdown checks.
- Seven image preparation regressions, including explicit face crops, complete
  thumbnail edges, transparent padding, enclosed white lettering, coloured brand
  panels, animation protection, colour profiles and attribution metadata.
- Eight schema regressions and the existing Ruby event, form and relationship
  suites.
- Complete rendered local-link and relationship audits in both deployments.
- Asset checks for primary paths, formats, dimensions, transparency, local
  references, PDF signatures, raster readability, font URLs and compiled CSS URLs.
- Chromium semantic acceptance: 60 responsive views and 40 axe accessibility
  audits per deployment, plus programme, affiliation, filtering, redirect and
  no-JavaScript checks.
- Existing component geometry checks at eight widths from 320 to 1920 pixels:
  176 responsive views.
- Explicit desktop/mobile checks for all four primary image types, local fonts,
  PDF downloads and the logo ZIP.
- Sixteen additional root/preview browser views covering dark/light backgrounds,
  galleries, diagrams and shared media, with every image decoded and no failed
  asset HTTP responses.
- Whitespace checks and a final scan for retired paths and remaining remotely
  hosted cheri-alliance.org media.

## Documented format and content choices

SVG branding, social icons and placeholders retain their vector format. Browser
and platform icons retain PNG/ICO. PDFs, fonts and the logo ZIP retain their
original formats; PDFs and fonts retain their original bytes. Organisation
logos retain intentional coloured brand panels and enclosed white artwork,
surrounded by transparent padding.

Records without a supplied image were not given invented photography or logos:
48 people, 17 organisations and one post remain without primary images. No asset
download or conversion remains unresolved.

See [the authoring guide](README.md) for adding and replacing assets by hand.
