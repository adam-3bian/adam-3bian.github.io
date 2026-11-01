# Grid reconstruction review

Scope: the existing Kidderminster–Birmingham–Dorridge route. The SVR is scenery
around Kidderminster only. The dated source register is
[`location-reference-manifest.json`](../../references/location-reference-manifest.json).

The fixed front captures and diagnostic context views in
[`grid-world/`](../captures/grid-world/) show the same WebGL renderer, palette and
front camera used by the game. Context views are QA fixtures, not new game camera
controls. Capture hashes, camera positions and exact world identities are recorded
in [`grid-world-browser.json`](grid-world-browser.json).

| Location | Visible/modelled relationships | Remaining approximation |
| --- | --- | --- |
| Kidderminster | Two NR platforms; separate Town station, yard roads, carriage/diesel works and exchange; short heritage departure curves away | GWR frontage details, absolute levels and scenery-margin terrain are simplified |
| Galton | Upper railway crosses lower railway and canal; four platforms bind to their own levels; access corridors retain source layers | Access deck/stair levels and structural dimensions are inferred |
| Jewellery Quarter | Parallel Metro and heavy rail, separate platforms, explicit Hockley bores/portals | Furniture, retaining-wall appearance and facade details use the regional kit |
| The Hawthorns | Independent rail/Metro tracks and two platforms for each; removed misassigned distant platform geometry | Platform architecture and urban density are simplified |
| Snow Hill–Moor Street | Continuous urban bore, approximately 1:45; Moor Street frontage, Rotunda, Selfridges and surviving Duddeston Viaduct footprints | Landmark silhouettes and arch spacing are procedural; mapped tunnel extent differs from the historical description |
| Tyseley | Large mapped siding fan, modern maintenance buildings and preserved works/turntable | Shed details and inferred rail levels need further photographic refinement |
| Stourbridge Junction | Separate mapped Town branch and shuttle retained | Existing station architecture remains an approximation |

The final code clears 13,320 longitudinal train-envelope probes across 12 cooked
tiles around eight priority stations and Galton's lower line. This caught and
corrected ground walls across tracks, access corridors misclassified as roads,
misplaced catenary masts, inverted bridge supports and street cuts through tunnel
cover. Probe heights are 1.2, 2.45 and 3.9 m, with three lateral offsets on the main
running lanes and 4 m longitudinal segments. Results are in
[`grid-clearance.json`](grid-clearance.json). These finite probes do not establish a
continuous swept-volume or independent railway loading-gauge certificate.

Appearance checks include the supplied named references
`kidderminster-expanded-0119`, `smethwick-galton-bridge-expanded-1726`,
`jewellery-quarter-original-0397` and `birmingham-moor-street-original-0450`.
Their capture dates and precise camera matches remain unknown. They are qualitative
appearance references, not proof of 2026 topology or independent local recognition.
The source map/node graph and operator/heritage accounts remain the topology
controls. The older photographic acceptance reports retain their own hashes and
are not silently carried forward onto this build.

Validation also includes 95 passing JavaScript tests, TypeScript compilation,
static build provenance verification, and a full IndexedDB world reload with all
`data/` requests blocked. No claim is made for a hardware performance benchmark or
a complete real-world interlocking.
