# Authoritative grid reconstruction

This document describes the archived pre-migration grid format. The current
runtime uses the 133-chunk [authored world](AUTHORED-WORLD.md), including stored
permanent scenery and operating-equipment placements. The files and runtime
derivation described below remain for archived saved-world compatibility.

Scope is the existing Kidderminster–Birmingham–Dorridge game, on `railway` only.
The SVR is **Kidderminster scenery only**: Town station, its yard and works,
exchange connection and the nearby departing line. There is no SVR journey,
Bewdley station or route to Bridgnorth in the runtime world.

Consult `references/location-reference-manifest.json` before changing geography.
It records the 2026 infrastructure baseline, source dates, unknown photograph
dates, location footprints, composition requirements, confidence and fixed views.
Archived OpenStreetMap extracts in `references/geography/` preserve source way
and node IDs. Older track plans explain topology/history; they do not reinstate
demolished Tyseley roundhouses in the modern scene.

## Storage and rendering

`public/data/grid/world.json` is the runtime authority. Its tagged integer anchors
use 16 m cells, centimetre plan sub-anchors and 1/32 m height ticks. Negative
addresses use floor division. Roads, building footprints, station surfaces,
structures, terrain and track geometry are reconstructed from this document and
its SHA-256-addressed tile set. The original floating-point exports remain import
inputs and historical audit evidence; the browser no longer loads them to compose
the world. World generation retains stable entity IDs and deterministic seeds.
Road and rail records contain compact quarter-cell occupancy masks and height
bands, so a road, tramway or railway can share horizontal cells at different
levels without becoming connected. Stable asset IDs select the existing kit.

`CurvePath` renders cubic Hermite curves through the canonical anchors. Adjacent
pieces share tangents; the height derivative is monotone to avoid overshoot on
shallow gradients. This preserves bends and continuous train orientation without
turning visible rails into grid squares. Main running lines and imported source
edges also have reusable piece records, connection ports and stacked occupancy.
Connectivity uses source IDs and transport mode, never proximity or a plan crossing.

The existing WebGL 2 renderer, camera, palette, front view and driving controls are
retained. The regional/landmark generators feed its existing mesh batches.
Landmark silhouettes are simplified procedural models, not scanned replicas.
The base terrain is a common 16 m corner grid with slope-limited heights. Roads,
track, buildings, bridges and tunnel components occupy separate overlay layers.
Roads compile into reusable straight, curve, gradient, junction, bridge, tunnel
and crossing pieces; rail and tram pieces have source-node ports and explicit
turnout, bridge and tunnel records. The grid records preserve smooth centre-lines.

## Site corrections

- Kidderminster has two main-line platform objects. The former misassigned SVR
  island belongs to a separate KDT station, with source-connected yard roads,
  carriage/repair/diesel facilities, its own station building and signal box.
  Source crossovers and the exchange remain physical scenery; protective signals
  do not grant player authority to drive across the NR/SVR boundary.
  The mapped Comberton Hill A448 bridge and its approaches cross the end of the
  station, with an inferred deck height and sufficient train clearance.
  Kidderminster and Tyseley buffer stops use the existing buffer asset only
  where a dated OSM stop node matches a degree-one mapped track endpoint.
- Galton has distinct high and low rail/platform bindings, a spanning upper deck
  and a lower canal/rail corridor. Indoor access layers use elevated walkways;
  the historic canal bridge uses its own deck profile. Upper platform side faces end at deck level,
  rather than becoming walls across the lower railway.
- Jewellery Quarter and The Hawthorns each have two rail and two Metro platform
  surfaces, different boarding heights and separate track graphs. The wrongly
  labelled platforms about 1.9 km from The Hawthorns are no longer used there.
  Metro bores and portals are explicit civil structures.
- Snow Hill retains its substantial urban tunnel. The approximately 1:45 bore
  profile has a smooth northern transition. The mapped model span is about 584 m;
  this differs from the historical 596-yard description. Absolute elevations
  remain inferred and are not presented as surveyed railhead levels.
- Tyseley uses its mapped siding fan, modern depot, preserved works and surviving
  turntable. Moor Street receives its frontage composition, Selfridges and the
  Rotunda, alongside the mapped surviving Duddeston Viaduct. Common station components and engineering materials remain reusable.
- The Stourbridge Town shuttle retains its independent mapped branch.

## Saving and checking

IndexedDB schema 2 stores a complete grid world alongside the journey. The first
save verifies and gathers **every** tile and the terrain, then commits the world
and journey in one transaction. Later saves reuse that immutable world. A failed
fetch or transaction leaves the previous save intact. A reload with all world
data requests blocked is an acceptance test. Engine/world identity changes reject
incompatible older journeys rather than mixing new scenery with an old simulation.
The immediately preceding grid release is explicitly checked for its known
revision and route fingerprint and can continue with its saved world, including
offline. Starting a new journey requests the current release's world; if it is
offline, the archived world remains available. Replacing an archived world under
the same release hash atomically backs up the old snapshot and matching world by
revision.
When a newer world is saved, the previous active journey is kept under
`backup/<worldHash>` in the `journeys` IndexedDB store, and its old world is kept
in the `worlds` store. There is no in-game migration of incompatible operating
state; recovering such a backup requires the corresponding older game version.

Build from the checked-in controls and archived source extracts with Node.js:

```sh
npm run build:world -- --output work/grid-import-draft
npm run check
npm test
npm run build:qa
node scripts/landscape-browser-qa.js
node scripts/audit-grid-clearance.js
npm run diagnose:world
```

The JavaScript browser runner starts its own local static server and captures
fixed front and context views, then checks complete-world saving and reload with
data requests blocked. The clearance audit sweeps both running lanes and Galton’s
lower tracks through actual cooked triangles around priority locations. It also
checks finite vertices. `npm run build:site` refreshes the portable checked-in static build;
`npm run verify:site` verifies its provenance. Neither command deploys anything.
`diagnose:world` reports mismatched anchors and unknown templates as errors, and
lists candidate dead ends, duplicate paths, tangent and tight-radius changes,
steep grades, unmatched level crossings and terrain/rail height differences
for review. Dead ends and large level
differences can be intentional, including at crossings and tunnels.

In a QA/development build, `const d = await __railway.debug()` creates a
developer inspector. Call `d.show(x, z, radiusCells)` and `d.hide()` to toggle
the terrain grid; `d.inspect(x, z)` returns tile/sub-tile coordinates, nearby
piece IDs, connection ports, rail height and terrain height. It adds no controls
or overlay to the normal production view.

The 2026 station-area road and building extracts include source URLs, retrieval
dates, way and node identities. The original corridor controls fill the spaces
between those extracts; the road network is not a complete street survey. OSM
building tags select houses, terraces, flats and other forms where available;
untagged homes default to two storeys. Formation and bridge elevations are
modelled, not taken as surveyed levels.

Limits: map/node topology is stronger evidence than inferred heights, widths and
asset shapes. The short western terrain margin is a gradient-constrained model;
EA terrain is resampled and smoothed for a consistent game landscape, with a
smooth join to that margin. Fixed screenshots and
finite geometry checks do not establish a surveyed reconstruction, a complete
real-world interlocking, or hardware performance. Record visual discrepancies
instead of marking a location accepted solely because these checks pass.

Exact repeated two-way ground-road segments from the same source way and the
same endpoint nodes are collapsed during compilation; their original IDs remain
in `sourceAliases`. One-way or otherwise ambiguous overlaps remain for review.
The compiler distributes steep ground-road approaches across connected nodes
while fixing mapped bridge, tunnel and level-crossing controls. Node changes and
remaining conflicts are recorded in `construction.gradeAdjustments` and
`construction.gradeExceptions`; those values are inferred, not survey heights.
