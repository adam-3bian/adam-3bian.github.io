# Authoritative grid reconstruction

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

`CurvePath` renders cubic Hermite curves through the canonical anchors. Adjacent
pieces share tangents; the height derivative is monotone to avoid overshoot on
shallow gradients. This preserves bends and continuous train orientation without
turning visible rails into grid squares. Main running lines and imported source
edges also have reusable piece records, connection ports and stacked occupancy.
Connectivity uses source IDs and transport mode, never proximity or a plan crossing.

The existing WebGL 2 renderer, camera, palette, front view and driving controls are
retained. The new regional/landmark generators feed its existing mesh batches.
Landmark silhouettes are simplified procedural models, not scanned replicas.

## Site corrections

- Kidderminster has two main-line platform objects. The former misassigned SVR
  island belongs to a separate KDT station, with source-connected yard roads,
  carriage/repair/diesel facilities, its own station building and signal box.
  Source crossovers and the exchange remain physical scenery; protective signals
  do not grant player authority to drive across the NR/SVR boundary.
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

Build from the archived source extracts with:

```sh
python scripts/import-geography.py
npm run build:world
npm run typecheck
npm test
npm run build:qa
npx tsx scripts/audit-grid-clearance.ts
```

The importer requires `requirements-data.txt`. `scripts/grid-browser-qa.py`
expects the QA build served on port 4175 and captures fixed front views at the
priority stations and diagnostic context views, then checks complete-world saving and reload with data requests
blocked. The clearance audit sweeps both running lanes and Galton’s lower
tracks through actual cooked triangles around eight priority locations. It also
checks finite vertices. `npm run build:site` refreshes the portable checked-in static build;
`npm run verify:site` verifies its provenance. Neither command deploys anything.

Limits: map/node topology is stronger evidence than inferred heights, widths and
asset shapes. The short western terrain margin is a gradient-constrained model;
the original EA terrain remains the main corridor source, with a smooth join to
that margin. Fixed screenshots and
finite geometry checks do not establish a surveyed reconstruction, a complete
real-world interlocking, or hardware performance. Record visual discrepancies
instead of marking a location accepted solely because these checks pass.
