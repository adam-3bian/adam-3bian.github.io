**Expanded one-second frame sequence**

Use [../frame-index-expanded.csv](../frame-index-expanded.csv) to resolve all 3,000 source frames numbered kidderminster2dorridge0001.jpg through kidderminster2dorridge3000.jpg. The user confirmed one frame per second. Relative time from the first supplied image is frame number − 1; the original-video starting offset and capture date are unknown.

This directory stores 2,389 additional unique JPEGs without modifying or recompressing them. Of the 3,000 source records, 605 reuse images already stored in ../frames/ and six reuse another newly stored expanded image. Every row's canonical_path is relative to references/ and resolves to the exact source bytes, verified by its SHA-256. Missing filename copies in this directory are intentional deduplication, not lost frames.

The original five-second sequence is preserved under ../frames/. Matching filenames across sets mean different images; do not overwrite or equate them. [../frame-alignment.csv](../frame-alignment.csv) verifies all 584 original images at expanded number = 5 × original number − 2.

All six ZIPs contain frames only. They do not supply the atlas's missing original-project data, dist or report files. The footage contains edited inserts and material beyond the requested route; expanded frame 2993 is captioned Hatton North Junction. Keep the playable endpoint at Dorridge.
