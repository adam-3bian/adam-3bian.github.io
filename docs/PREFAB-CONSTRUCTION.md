# Prefab construction: first implementation

This is an incremental implementation on `railway`, starting from
`363ea84b481ad8a2e0dc0a9439d60dba4e15fca6`. It does not finish the master brief.
The existing playable map, station order, driving camera and operating simulation
remain unchanged. No production world was regenerated and no deployment occurred.

## What can be run

Run `npm run dev` and open `/prefab-preview.html`, or serve the checked-in `site/`
and open `prefab-preview.html` within that directory. It also works under a nested
static-host URL. The original simulator remains at the normal index page.

The scene uses 13 prefab definitions, 24 canonical object instances, 192 ground
cells and two streaming chunks. It contains a full-size 80 m radius curve, three
complete 16 m gradient sections, a T-junction, a road bridge over the railway,
two platform sections, a British house, a portal-frame warehouse, four trees,
three fence sections and adjacent sloping/level terrain. The warehouse crosses
the chunk boundary and is rendered by its western owner exactly once.

**Geographic limitation:** this is an engineering acceptance arrangement in the
existing Kidderminster coordinate frame, not a faithful conversion of an existing
station scene. Its source record explicitly says `VISUAL_APPROXIMATION`. The
master brief's existing-scene migration/recognisability requirement remains
incomplete. These are working renderable models and construction code, but this
fixture must not be counted as a reconstructed station or a migrated route area.

## Sources and ownership

| Concept | Source | Behaviour |
| --- | --- | --- |
| Prefab definition | `public/data/grid/prefabs/construction.json` | Stable ID, geometry, reference-piece ID where applicable, dimensions, footprint, orientations, ports, placement rule, elevation behaviour, support, clearance, asset, variants and chunk LOD policy. |
| Prefab instance | `public/data/grid/scenes/kidderminster/kid-{west,east}.json` → `instances` | Stable ID; existing centimetre/tick anchor; quarter-turn rotation; explicit profile, foundation/bearing data, variants, provenance and occupied cells. |
| Construction tile | Same chunk documents → `terrain` | Existing 16 m coordinates; base ticks; NW/NE/SE/SW corner deltas; material, land cover, earthwork, water status and references to occupants. |
| Streaming chunk | `public/data/grid/scenes/kidderminster/world.json` → `tiles` | Bounds, SHA-256 checked documents and explicit neighbour dependencies. No request per 16 m cell. |
| Enums | `public/data/grid/enums.json` | 69 categories, 932 stable values, names and associated implemented-slice prefab IDs. Empty associations do not imply an asset exists. |

This extends `GRID`, `terrain-grid.js`, `piece-registry.js`, `PieceGraph`,
`GridWorld`, `buildTile`, the existing worker, `Batch` and `AssetFactory`. It does
not introduce another cell size or coordinate convention. The 44 legacy rail
and ten road reference IDs and their existing behaviour are preserved.

`GridWorld.loadComposition` reads the small separate scene manifest and catalogue.
The existing checked JSON cache handles chunk fetches, coalesced requests, hash
checks, timeouts, retries after failure and complete snapshots. Chunk context
includes its declared neighbours for shared edges, references and supports.
Only canonical owner instances and owned terrain cells emit geometry. The worker
returns the same typed mesh packet as the main game, plus a chunk origin; the
existing renderer accepts that origin. The review page attaches both packets
before reporting readiness and disposes old geometry after a successful reload.
It keeps the last complete scene visible if a replacement cannot be built.

For now both small fixture chunks depend on each other. This is bounded for the
fixture, **not** a finished solution for route-wide dependency scheduling,
prefetching, eviction or per-object LOD. Existing main-route streaming is retained.

## Terrain, paths and supports

Terrain uses the existing 1/32 m height tick and exact shared corners. The fixed
NW–SE triangulation is also used by `ConstructionTerrain.raw`, so rendered planes,
foundation checks and tree/fence attachments use the same surface. Out-of-coverage
support queries fail rather than extrapolating substitute ground.

New transport instances use explicit `LEVEL`, `FULL_TILE_UPHILL` or
`FULL_TILE_DOWNHILL` profiles. A cubic height profile records rise ticks and both
boundary grades. Analytic derivative extrema validate the entire section; a
second-derivative bound checks grade change per 16 m. Half-length slopes, hidden
level-section humps, sign reversals and illegal interior grades fail validation.
The new path adapter is shared by mesh generation, the review camera and
`PieceGraph` travel. Existing imported transport paths retain their interpolation.
Reference pieces' historical nominal grades are not a claim that they meet these
new construction limits; only explicit construction profiles are validated here.

Matching connections require the same node, transport mode and integer 3D anchor,
with opposing continuous tangents. Junction arms use an explicit internal node;
`PieceGraph` requires a selected pair. Plan crossings do not connect networks.
Bridge roads reference their deck; bearing bases reference actual ground. The
fixture also declares a checked railway-to-soffit clearance. Platforms reference
their adjacent rail path and boarding offset, including the rail's gentle grade.
Slab foundations must reach the terrain across their footprint without burying
the building or exceeding a bounded depth. Trees remain upright; fence posts and
rails follow their own ground contacts.

Only the terrain types, asset families and support arrangements exercised here
are implemented in the new compositor. General swept-solid interference,
accessible routes, retained steps, cliffs, tunnels, arbitrary support graphs,
grade exception evidence and all infrastructure classes remain unfinished.

## Editing and checking

Edit the JSON catalogue or instance/terrain records, then explicitly run:

```sh
npm run author:prefabs
npm run diagnose:prefabs
node --test tests/prefab-composition.test.js
npm run build:qa
node scripts/prefab-browser-qa.js
npm run build:site
npm run verify:site
```

`author:prefabs` only derives occupancy indexes and integrity hashes. It never
chooses positions, heights, prefab identities or variants. A shared corner edit
must update every incident cell; invalid seams or supports are reported before
the edited chunks are written. Reload JSON in the review page after indexing.
Normal site builds do not invoke this authoring command or the old importer.

The old importer now requires an explicit draft output directory:

```sh
npm run build:world -- --output work/grid-import-draft
```

It cannot write directly to `public/data/grid`. Review/importing a draft into
curated data is a separate operation; no automatic promotion is implemented.
Running the former bare command deliberately fails with an actionable message.

Snapshots include catalogue, enum document and the full checked chunk set. The
review page snapshots its edited chunks and updates their hashes. The unchanged
main-route operating state also has a narrowly scoped compatibility entry for the
pre-change build hash and exact world revision; previous saves are backed up by
the existing transactional IndexedDB implementation.

## Audit before editing

The repository identity, clean status and initial `work` checkout were verified
before switching to the existing remote `railway` branch. No edits were made on
`work`. No applicable `AGENTS.md` was present. README, grid/data documentation,
acceptance limits, loading, storage, worker composition and asset paths were read.

The existing live manifest is **28,484,967 bytes**, with 133 chunks and 22 playable
station controls. It contains 2,889 rail/tram pieces, 34,311 road pieces, 3,099 road
junctions, 57 platform records, 23 station compositions (including non-playable
context), 14 landmarks, six civils and 43 buffer stops. Chunk arrays hold 48,207
building records, 34,311 road records, 6,900 land records and 51 platform records;
these are record counts, not a deduplicated render inventory.

| Existing content | Ownership and remaining runtime work |
| --- | --- |
| Mainline, mapped roads, source tracks and station controls | Quantised JSON already owns broad positions/topology. Runtime derives geometry, surfaces and some heights. |
| Terrain | Shared binary height grid; `SurfaceField`/cooked soil still add runtime transport and foundation treatments. Route terrain is not yet editable authoritative corner JSON. |
| Buildings | JSON footprints/IDs exist. Runtime classification, foundation decisions and rejection can alter visible results. |
| Platforms/station furniture/access | Some explicit footprints/compositions; the worker still chooses component/furniture placements and support adjustments. |
| Trees | `build.js` still samples up to 480 seeded placement candidates per legacy chunk. Permanent locations are not stored in JSON. |
| Fences/cabinets/other trackside objects | Many positions still derive from routes in loops rather than stored prefab instances. |
| Landmarks/buffers | Explicit JSON records select existing model factories. |
| People/traffic/rolling stock | Existing human models and vehicle systems remain. No cat or ambient-life implementation in this pass. |

`asset-registry.js` remains a small legacy registry. The new enum catalogue is
authoritative for the new construction schema; reconciling all legacy factory
names and production records into it is **incomplete**. The coverage table in
`reports/prefab-scene.json` lists actual slice object-kind coverage without
inventing placeholder models for the remaining categories.

## OpenLoco reference review

Reviewed on 2026-11-02 at revision
`638938cfc403560ea54cfbb741fd717d0a617546` in
[OpenLoco](https://github.com/OpenLoco/OpenLoco/tree/638938cfc403560ea54cfbb741fd717d0a617546/src/OpenLoco):

* `include/OpenLoco/Map/SurfaceElement.h`: base surface and corner/slope flags.
* `include/OpenLoco/Map/TileElement.h`: separate base/clear heights and occupied quarters.
* `src/Map/TileManager.cpp`: slope-dependent ground-height calculations.
* `src/Map/Track/TrackData.cpp`: rotated connection and quarter-tile footprint data.
* `src/GameCommands/Track/CreateTrack.cpp`: bridge/support and track connection checks.
* `src/GameCommands/Road/CreateRoad.cpp`: road placement and bridge configuration limits.
* `include/OpenLoco/Objects/BridgeObject.h`: clear-height and component concepts.
* `src/Paint/PaintSurface.cpp`: corner-height and neighbouring-surface treatment.

The code here uses independent project geometry and the existing 16 m grid,
not copied graphics or OpenLoco's height increments/placement tables.

## Stage status and remaining acceptance

| Stage | Classification | Evidence/limit |
| --- | --- | --- |
| 0: code/data ownership and baseline audit | IMPLEMENTED_AND_VERIFIED | 144 baseline tests passed. Fresh local Chromium/SwiftShader loaded the original menu in 47,303 ms with zero page errors; JS heap 117,142,604 bytes. This is one cold-load measurement, not a hardware benchmark. |
| 1: compositor, authoring, data/geometry tests | IMPLEMENTED_AND_VERIFIED | Real worker-built JSON scene; see prefab diagnostic and browser reports. Geometry, edits, rotations, joins, ownership, support failures and save/reload are exercised. |
| 1: conversion of an existing recognisable scene | INCOMPLETE | Fixture layout is an explicit engineering approximation. No existing station has been accepted as migrated. |
| 2: terrain/grades across the route | INCOMPLETE | New rules work in the slice; live terrain/road profiles unchanged. |
| 3: world migration | INCOMPLETE | Zero live-route chunks migrated. Import overwrite protection is implemented. |
| 4: enum/asset reconciliation | INCOMPLETE | Canonical vocabulary and 13 working definitions; legacy reconciliation and most required families remain. |
| 5–7: stations, vehicles, cats and ambient life | INCOMPLETE | No new station acceptance, rolling-stock changes, cat animation or ambient systems. |
| 8: full-route stability/performance | INCOMPLETE | Targeted browser regressions only. No reference-GPU, two-direction continuous-drive or retained-memory benchmark. |

Live-route `diagnose:world` still reports zero hard errors with 291 gradient,
1,643 tangent, 94 duplicate and two terrain warnings, plus 20,126 unconnected
port candidates (many may be legitimate ends). These are unchanged findings,
not fixes or proof of route-wide correctness. Earlier Blakedown orientation,
scenery clipping, unsupported assets and degenerate geometry concerns are not
declared resolved by this fixture. No photographic/blind station review occurred.

## Recorded verification for this pass

The baseline passed 144 tests. The full suite after implementation passed 155;
a final 15-test focused run covers the last occupancy/height-band hardening.
`check`, `diagnose:prefabs`, `diagnose:world`, `build:site`, `verify:site` and
`git diff --check` passed within their scopes. The packaged site contains
323 hashed build inputs and 284 output files. The unchanged live route data
was checked directly against the baseline Git tree.

The [browser evidence](reports/prefab-browser.json) records the actual GPU, CPU,
browser, sizes, frames and captures. The final isolated fixture used two draw
calls and 18,660 triangles with zero detected degenerate triangles. Its maximum
rail gradient is 0.390625%, and its maximum grade change per 16 m is 0.390625
percentage points. No existing route gradient was corrected.

The final 120-frame SwiftShader sample measured median 400 ms, p95 900 ms and
maximum 1,316.5 ms. These exceed the performance targets on this software
renderer; this is not a reference-GPU run or a streaming-stall measurement.
No warmed memory-growth measurement was made. Cold-load timings vary with the
concurrent local work and must not be presented as a speed improvement.

The existing driver's view rendered with zero WebGL errors after 12 accelerated
simulation seconds and approximately 33.47 m of movement. A real IndexedDB
snapshot with the known pre-change build identity restored offline, preserving
all 133 chunks and the exact saved chainage. This checks the compatibility
contract using unchanged simulation/map data; it is not a separately launched
old-binary upgrade test. No page errors were recorded.

The [execution record](reports/prefab-execution.json) lists every modified/created
file, command outcome and outstanding stage. Changes remain uncommitted on
`railway`; no push, PR, merge or deployment was performed.
