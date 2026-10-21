# Site assets

Public `/assets/...` URLs map directly to the repository's `assets/` directory.
Edit the explicit `image.src`, Markdown image/link or `resources[].url` when
adding media. Jekyll publishes checked-in files directly; Python is only an
optional authoring and validation tool.

## Primary images

| Content | Path | File and display ratio | Display fit |
| --- | --- | --- | --- |
| Organisation | `/assets/images/organisation/<markdown-filename>.webp` | 3:1 | contain |
| Person | `/assets/images/people/<markdown-filename>.webp` | 1:1 | cover |
| Event | `/assets/images/events/<markdown-filename>.webp` | 16:9 | contain |
| Post | `/assets/images/posts/<markdown-filename>.webp` | 16:9 | contain |

Omit `.md` from the Markdown filename. Include the date in post image names:
`_posts/2025-05-27-unlocking-the-future-a-roadmap-for-cheri-technology-advancement.md`
uses `/assets/images/posts/2025-05-27-unlocking-the-future-a-roadmap-for-cheri-technology-advancement.webp`.
The `organisation` asset directory is singular even though the collection is
`_organisations`.

Put the primary image in frontmatter once, with its actual dimensions:

```yaml
image:
  src: /assets/images/people/jeremy-singer.webp
  alt: Jeremy Singer
  width: 420
  height: 420
  fit: cover
```

Crop portraits around the actual person's face, allowing natural space around
their head and shoulders. Review lecture photographs carefully: faces on slides
or banners are not the speaker. The file is already cropped, so cover works
consistently in square cards and detail portraits. Existing `image.position:
left` and `right` remain available; normally replace the crop itself for precise
control.

Organisation images use a transparent 1200 × 400 canvas. Keep the entire logo
and its proportions. Remove only exterior background fills; preserve enclosed
white lettering and intentional coloured panels, such as the KU Leuven wordmark.
Lossless WebP preserves logo colours. Do not stretch or crop visible artwork.

Post and event thumbnails contain the complete source within a 16:9 canvas,
with white padding where necessary. Canvas dimensions adapt to the source,
up to 1280 × 720. CSS also uses contain and white padding. Additional body images
retain their natural proportions.

Records without supplied photography or logos remain without an image. Do not
invent headshots or logos to fill these gaps.

## Additional images, downloads and shared assets

Use lowercase kebab-case names that describe the media:

```text
/assets/images/events/<event-markdown-filename>/booth-demonstration.webp
/assets/images/posts/<post-markdown-filename>/architecture-diagram.webp
/assets/pdf/events/<event-markdown-filename>/programme.pdf
/assets/pdf/posts/<post-markdown-filename>/report.pdf
/assets/video/events/<event-markdown-filename>/recording.mp4
/assets/audio/posts/<post-markdown-filename>/interview.mp3
```

Reuse an existing file when several pages refer to the same asset. Conference
replays reuse PDFs in the original conference's directory. General materials
shared across unrelated records live under `/assets/<media-type>/shared/`.
Other collections can use the same ownership convention.

Shared images have descriptive filenames under `/assets/images/shared/`.
Branding, background art, placeholders and social icons use named subdirectories
there. Local Poppins fonts and their stylesheet live in `/assets/fonts/shared/`;
the social icon licence is in `/assets/text/shared/social-icons-licence.txt`.
The logo download pack lives in `/assets/zip/shared/`. Site CSS and JavaScript
remain under `/assets/css/` and `/assets/js/`.

Keep SVG for vector branding, social icons and placeholders; keep ICO/PNG for
browser/platform icons, and retain animation formats where needed. Preserve
download formats, alt text, captions, attribution and licence notices. Download
new cheri-alliance.org media into the appropriate directory and link locally;
ordinary links to webpages remain external.

## Preparing or replacing an image

Install `requirements-dev.txt`, or prepare the files in an image editor. The
optional helper applies the same rules without altering source artwork:

```sh
python scripts/prepare_image.py portrait.jpg assets/images/people/example-person.webp --kind people --crop 120 40 500
python scripts/prepare_image.py logo.png assets/images/organisation/example-org.webp --kind organisation --remove-white-background
python scripts/prepare_image.py poster.png assets/images/events/example-event.webp --kind events
python scripts/prepare_image.py photo.jpg assets/images/posts/2026-10-21-example-post/photo.webp --kind additional
```

Portrait crop arguments are source pixel coordinates: left, top, square size.
The helper requires an explicit reviewed crop, checks its bounds, honours EXIF
orientation, preserves embedded colour profiles and attribution metadata, and
writes portraits up to 512 × 512. White removal is opt-in and
only removes near-white pixels connected to the image edge. Inspect the result;
prefer approved transparent artwork for complex logos.

Replace a file at its existing path, update frontmatter dimensions if needed,
and check desktop and mobile cards and detail pages. New content needs no
manifest entry or generated configuration.

Run:

```sh
python scripts/check_assets.py
python scripts/test_assets.py
python scripts/check_content.py
bundle exec jekyll build --safe --destination dist
python scripts/check_assets.py --site dist
python scripts/check_linked_content.py --site dist
```

## Migration provenance

`migration.json` records old paths and download URLs, original checksums, final
paths, initial output checksums, operations and portrait crop coordinates. It is
historical evidence; its image output checksums do not lock future image edits.
Shared source artwork can have separately named primary derivatives for several
posts; these are recorded alongside the canonical migrated asset.
The content preservation checker resolves old binary and programme-resource
references through this map, while `check_assets.py` validates the editable
current images. Non-image historical PDFs and fonts retain byte checks.

Historical specifications, snapshots and screenshots under `docs/` and test
fixtures intentionally retain their old paths. Active content and templates use
the new paths. Obsolete imported CSS/JavaScript and `.DS_Store` were removed;
byte-identical copies and superseded primary variants were consolidated.

`content-baseline.json` comes from the original branch's rendered site, with
only asset URLs resolved through the migration map. The parity check compares
all page wording, links, image sources and fragment IDs against that baseline.
