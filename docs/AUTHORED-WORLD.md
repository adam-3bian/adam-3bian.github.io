# Authored railway world

The normal simulator now reads 133 authored scenery chunks on `railway`. The
route remains Kidderminster–Birmingham–Dorridge, with 22 playable stations. This
is a static Three.js application; hosting requires no server application,
database, geographic API or world-generation service.

This implementation does **not** establish a full specification acceptance
pass. The engineering exceptions, variant coverage and measured performance
are recorded explicitly in `validation/authored/`. Preserving an inherited
alignment is not approval of its gradient, and rendering a station is not
proof of photographic recognition.

## Source and runtime contract

| Layer | Authoritative source | Runtime representation |
| --- | --- | --- |
| Construction definitions and strict placement rules | `public/data/grid/prefabs/construction.json`, `enums.json` | Native full-section compositor and construction fixture |
| Permanent route geometry and placements | `world-source/chunks/*.json` | Content-checked compressed JSON, composed in a worker |
| Operating paths, road graph, signals, switches and protection equipment | `world-source/operations.json` | Verified `operations.json.gz.bin`; stored poses and topology |
| Ambient populations | `world-source/ambient-zones.json` | Seeded, capped and distance-culled instanced animation |
| Station appearance references and authoring decisions | `world-source/stations.json` | Curated models already stored in the chunk documents |
| Archived pre-migration world | `public/data/grid/world.json`, `tiles/`, `terrain.bin` | Original saved-world compatibility path |

Each chunk separates reusable geometry, prefab assemblies, canonical instances,
16 m construction-cell indexes, supported character spawns, original source
records and migration exceptions. Geometry is local to its prefab, stored at
millimetre precision. Instance anchors use centimetres horizontally and 1/32 m
height ticks, with explicit residual transforms where inherited geometry needs
them. One canonical instance owns a multi-cell object; cell indexes reference
that identity. Geometry and assemblies are deduplicated by stable content IDs.

The deployed files under `public/data/grid/authored/` are derived caches. Their
`.json.gz.bin` suffix avoids hosts interpreting the suffix as HTTP content
encoding; the loader also handles transparent HTTP decompression. Both cache
and uncompressed content hashes are checked. The manifest is lightweight and
lists chunk bounds, dependencies and hashes. Operational JSON is decoded in a
worker; detailed scenery is fetched and decoded only when needed.

Normal loading calls `composeAuthoredChunk`. It does not run the old permanent
placement loops, road engineering, signal-spacing rules or switch selection.
Old reconstruction remains available only when restoring an archived legacy
world. Train movement, point blades, signal aspects, road traffic, cat rigs and
ambient life remain dynamic.

## Editing and rebuilding

Edit the source chunk's instance anchor, transform, prefab reference, geometry
or construction corners. Retain the object's canonical ID and provenance.
When changing its footprint, also update its occupied-cell references, bounds,
height band and support metadata. A model replacement must refer to an actual
definition and geometry. Keep original unsupported records and state the
reason in `exceptions`; do not erase them to silence diagnostics.

Ground stores shared base/corner ticks and reference ticks. The inherited
cut/fill shape is an explicit stored mesh residual, rather than an implicit
runtime terrain solver. `AuthoredGround` applies corner edits to the exact
rendered vertices and uses those same triangles for support queries. Canonical
boundary heights eliminate the one-tick quantisation seams found during the
route audit. Native construction terrain uses the documented NW–SE split.

```sh
npm run cache:world        # derive compressed caches from reviewed JSON edits
npm run check:world        # fail if source/cache identities differ
npm run diagnose:prefabs  # strict construction scene
npm run diagnose:world    # source, profile, whole-scene and enum diagnostics
npm test
npm run validate          # accelerated end-to-end rail simulation
npm run build:site
npm run verify:site
```

`build:site` checks the caches and never chooses placements. The one-time
`author-*`, `seal-*` and station-adoption scripts are explicit migration tools
with overwrite guards. They are not normal build steps. The old importer also
requires an explicit draft directory under `work/` and cannot overwrite the
authored world. `world-source/stations.json` documents the authoring decisions;
changing that reference file alone does not regenerate a curated station.

## Construction and migration limits

The strict catalogue implements all 44 rail and 10 road reference IDs, rotations
and smooth geometry. Grade-bearing sections must be complete; short visual
pieces cannot absorb a slope. Analytic cubic extrema enforce infrastructure
class caps and transition limits. Ports include position, direction and mode;
plan crossings alone create no connection. The fixture verifies multi-cell
ownership, platforms, bearings, foundations and vertical separation.

The migrated route retains its existing geographic profiles. Many source
curves do not declare full-section grade ownership and some exceed the new
limits. `transport-profiles.json` lists IDs, locations, classes, actual maxima,
limits, sources and affected extents. These are **REQUIRES_REVIEW**, not
automatically approved exceptions. Pedestrian routes, steps and waterways are
listed separately instead of applying motor-road limits to them. Switch source
gaps also remain explicit. Consequently route-wide engineering acceptance is
incomplete even when all structural JSON and geometry checks pass.

The whole-scene diagnostic reconstructs every chunk, checks finite geometry,
degenerate triangles, canonical identities, references, occupancy indexes,
shared corner heights, rendered boundary heights and local/cross-chunk tree
and foundation support. It records unsupported source extents separately.
Its structural result must not be read as a blanket clearance or accessibility
certificate. The older source diagnostic remains for comparison.

`node scripts/audit-crossing-orientation.js` checks the rendered gate arms and
warning heads against the actual stored operating-road tangent at all four
crossings. This passes for Blakedown, Cradley Heath, Langley Green and Bentley
Heath. It establishes orientation; swept barrier clearance and surveyed site
dimensions remain separate checks.

`node --expose-gc scripts/audit-authored-clearance.js` sweeps both running lanes
along the complete playable alignment at 4 m intervals against the actual
stored triangles. This found invalid legacy bridge inference: negative support
heights and distant roads incorrectly linked to chainage zero. Thirty invalid
generated decks are quarantined, with their original instances, geometry and
source records retained in explicit migration exceptions. Other clearance
findings remain identified in `clearance.json`; moving source buildings or
altering real road/tunnel levels requires justified geometry, not arbitrary
deletion. The sweep is a sampled envelope check, not a survey certificate.

## Appearance and dynamic objects

All 22 stations have individual authoring profiles and reference records.
Their canopy forms, frames, colours, glazing and shelter extents are stored
in the migrated chunks. Seven smaller stations had the generic long canopy
assemblies curtailed or rebuilt. Existing access structures and mapped station
polygons remain. Captures show both approach directions and station context.
Independent blind recognition has not been performed; uncertain dimensions
and old or undated photographs are labelled.

Industrial roofs use repeated portal/northlight bays, with loading doors and
high glazing. Road vehicles have 21 explicit project-scale profiles, including
double-deck buses, articulated lorries and cycles. Train shells, windscreens,
Class 172/168 cab distinctions, Class 139 height and moving doors were revised.
These are geometric approximations, not manufacturer-certified models.

Passengers are clothed bipedal cats with feline ears, muzzle, eyes, whiskers,
paws and tails. Shared geometry supports 11 coats, 12 clothing variants and
12 independently phased animation states. Supported paths and bench seats are
stored in JSON; obstructed walking paths are retained as rejected navigation
and use stationary waiting. Birds, clouds and occasional aircraft use explicit
zone seeds, population limits, heights, update rates and distance culling.
The full enum ledger distinguishes working models from unverified or unmapped
variants; the 932-value vocabulary alone is not asset completeness.

## Streaming, saves and evidence

The lifecycle records queued, fetched, decoded, composed, GPU-preparing,
GPU-ready, failed and evicted states. First rendering, rather than worker
completion, marks GPU readiness. Tokens reject stale results; timeouts and
bounded retries recover transient failures. Eviction releases both LOD
geometries and orphaned cats. Prefetch follows speed/direction and dependencies.
Essential scenery gates simulation advancement. Static meshes are not rebuilt
per frame; distant index buffers reduce detail and cat/ambient updates are
budgeted. The compressed live cache is bounded to 96 MiB.

Snapshots archive every chunk independently of that live cache, so evicted
tiles remain available offline. The previous known world identities retain
their archived maps and simulation contract. Offline reload was tested with
all data requests blocked and exact chainage/revision comparison.

See `validation/authored/acceptance.json`, `world.json`, `asset-coverage.json`,
`transport-profiles.json`, the browser reports, and `docs/reports/simulation.json`
for precise results and scope. The initial 44-view browser run used a
1920×1080 viewport with a 960×540 drawing buffer; its timings are not 1080p
benchmarks. The subsequent browser run explicitly requests a 1920×1080
drawing buffer and reports cadence separately from render submission/finish.
The available GPU is Chromium SwiftShader. The reference RTX 3060 gate and
independent station-recognition gate cannot be marked passed in this environment.
The measured software-renderer frame cadence exceeds the target. The 6.2%
retained JavaScript heap growth is below 10% in that sample, but GPU retained
bytes are not available. A separate reduced-resolution final smoke run checks
the repaired revision and the production entry without making a performance
claim. The final sampled clearance audit still reports 135 intersections across
18 source instances, with exact IDs and locations retained for review.
