# Acceptance evidence and open gates

## Current reconstruction evidence — acceptance incomplete

The current source-hashed run is summarised in [HANDOVER.md](../HANDOVER.md), [reconstruction browser report](reports/reconstruction-browser.json), [full geometry report](reports/geometry.json) and [station comparison bundle](station-review.html). Older reports below do not establish acceptance of the changed build.

| Current check | Actual result |
| --- | --- |
| Tests and static package | 88 JS tests / seven Python tests passed; typecheck, production/QA builds and static verification passed; all 140 files hash-checked over root/nested HTTP. |
| Browser resize and capture | Top bar absent; 12 size/scale cases plus independent container/hide-show passed with no GL error/context loss. 44/44 station fixtures captured; no recorded page errors. Paused software-rendered fixtures only, not continuous driving or performance acceptance. |
| Geometry | 121/121 tiles; zero recorded hard/sampled mandatory failures. 543 unmatched road probes, 186 rejected buildings, 842 unsupported cable candidates and 10,851 degenerate triangles remain. Lower-route structural openings are not certified by road-top samples. |
| Hagley | Complete declared footbridge/stair/Brake Lane arch and connected road profiles replace the ground strip. Targeted actual-mesh body-width and stair contacts pass. Inferred dimensions, architecture/surroundings and full swept/support coverage remain open. |
| Map fidelity | Restored bends in 6,535 paths; all 19,499 supplied source subpaths present with original plan vertices. 22 original station pins and 224 civil footprints agree with supplied controls. This is same-source 2D consistency; four tunnel controls and source-missing structures/roads remain unverified. |
| Reference review | 44 game views inspected, 16 supplementary approximate photo pairs, six station photo gaps, zero accepted stations. 389 expanded frame records remain unlocated; all 600 regular five-second samples remain unmapped/unreviewed. |
| Operations | Both 21-stop CPU journeys and two-hour rail-only dispatcher run passed with zero recorded collisions/SPADs. Separate 60-minute mixed run returns nonzero with 1,020 long-stopped vehicles; no mixed-traffic acceptance. |
| Previous save | Real save from 4c6446b rejected clearly by current production build; old save preserved. No migration. |

New visible obstruction candidates at ROW/SGB/SMA/DDG forward and BMO/WMR reverse, generic station identity, crossing orientation/bindings, semantic water/path generation, full world rules, streaming readiness, remaining assets/operations and all source omissions remain open. The two-hour browser/GPU soak, actual driving after resize, full-resolution point readability, RTX 3060 benchmark and three local reviews were not performed.

Run `python scripts/reconstruction-qa.py` to consolidate current static/source/reference checks and verify previously recorded geometry/browser hashes. Add `--capture` and/or `--geometry` to rerun those expensive fixtures; the report distinguishes executed commands from reused evidence. Exit 1 means acceptance remains incomplete. This entry point does not perform photographic judgement or the missing continuous-drive/hardware/human gates.

## Mandatory gates still open

| Gate | Evidence required before acceptance |
| --- | --- |
| World construction and assets | Full layer/connection/support/opening rules across every inventoried site; source-owned fixes for current visual obstructions; all required components and specialised station/civil forms; resolve unmeasured/rejected/unsupported/degenerate cases without shrinking the denominator. |
| Source fidelity | Reconcile six station photo gaps, source-missing western/complex roads/civils, four tunnel controls and current operating plans. Same-source map fidelity is separate from independent geographic/height accuracy and final 3D/photo fidelity. |
| Reference coverage | Map/capture/review every eligible regular five-second image, critical bridges/roads/tunnels and all 22 stations in both directions; retain honest exclusions, uncertainty and unresolved issues. No image-capable agent review counts as one of the three local reviewers. |
| Geometry | Complete actual triangle/volume and swept-body checks for all railway/road widths, supports, foundations, access, portals, approaches and LOD/cross-owner seams. Current road-top samples do not prove an open lower railway. |
| Streaming | Initialisation watchdog, complete required/ready lifecycle, forward-aware prefetch, cross-tile dependency protection, fallback/pause, continuous maximum-speed driving, failures/stalls/stale results, stationary recovery, reversal and eviction/revisit. |
| Operations | Source-backed western/compound pointwork, directed permissions/interlocking, current signals/speeds/crossings, full-consist authorities and 1080p point readability; platform-side doors/passenger boarding; correct UK road graph/junctions/crossing controls and genuine trip completion. Repeat the mixed scenario after resolving long stops. |
| Browser stability | Two-hour browser/GPU run with traffic, streaming, save/resume and retained-memory checks; driving after resize and context recovery. CPU journeys or waiting at QA fixtures do not substitute. |
| Performance | Actual declared RTX 3060 ten-minute 1080p run: median frame time ≤16.7 ms, p95 ≤25 ms, no streaming stall >100 ms and warmed retained memory within 10%. Report reduced-scale results separately. |
| Local recognition | Three independent local reviewers, names/HUD hidden: at least 18/22 stations and 6/8 interstation views identified under the original brief's protocol. No human review was performed. |

[The asset catalogue](ASSET-CATALOGUE.md), [source gaps](SOURCE-GAPS.md), [scenery issues](SCENERY-ISSUES.md), [world rules](WORLD-RULES.md) and [handover](../HANDOVER.md) retain the detailed scope. Original requirements in [PROMPT.md](../PROMPT.md), [FINISHING_PROMPT.md](../FINISHING_PROMPT.md) and [WORLD_RULES_PROMPT.md](../WORLD_RULES_PROMPT.md) are not waived.

Earlier reports such as [WebGL geometry equivalence](reports/webgl-geometry-equivalence.json), [traffic recovery](reports/traffic-browser.json), [WebGL static hosting](reports/webgl-static-site.json) and [older interrupted Hagley browser run](reports/acceptance-hagley-browser-incomplete.json) retain their measured source snapshots. They are historical evidence, not current full acceptance. The earlier WebGPU device-loss failures are retained as failures and do not establish a WebGL defect. Current previous-save rejection is tested separately against 4c6446b; no compatibility migration is claimed.
