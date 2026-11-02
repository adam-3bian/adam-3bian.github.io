# Map-data audit

This is the historical grid audit. The current source/cache contract and
route-wide migration evidence are in [AUTHORED-WORLD.md](AUTHORED-WORLD.md).

Repository `adam-3bian.github.io`, branch `railway`; baseline commit
`4777fb4183108eae565034c2e776527b76d3292f`. The working tree was clean when
this repair began. The existing route is Kidderminster–Birmingham–Dorridge,
with 22 playable stations. The agreed SVR scope is neighbouring Kidderminster
Town and yard scenery, not a new playable route to Bridgnorth. Existing fixed
baseline views are in `docs/captures/grid-world/` (including `kid-1.png`,
`sgb-1.png` and `tys-1.png`). New comparison captures and their scope are in
`docs/captures/landscape/` and `docs/reports/landscape-browser.json`.

## Sources of truth and risks

The static site is Vite/JavaScript with an existing Three.js WebGL 2 renderer.
`public/data/grid/world.json`, its hashed tile documents and `terrain.bin` are
the saved world authority. `public/data/route.json`, `reconstruction.json`,
`road-surfaces.json` and the old tile exports are preserved import controls and
historical evidence. `references/location-reference-manifest.json` records the
era, source dates and confidence; `references/atlas/`, `references/geography/`
and the 3,000-frame location index contain the supporting maps and photographs.
The visual renderer uses the grid data and procedural regional/landmark assets;
simulation and traffic state are stored with the world in IndexedDB.

The coordinate frame is X = British National Grid easting − 400000 m,
Z = 280000 − northing, with Y in model ODN metres. Grid cells are 16 m, planar
sub-anchors are 0.01 m, and elevation ticks are 1/32 m. Curves and grade are
interpolated between stored anchors. Source node IDs distinguish rail and tram
connections and vertically separated crossings. A matching plan position alone
is not evidence of a junction.

The pre-repair corridor export omitted some OSM roads and hid junctions inside
long polylines; several bridge clearances used steep local terrain cuts. Road
heights and much railway infrastructure were inferred, not surveyed. Buildings
with missing type/height information could use oversized generic forms. The
Comberton Hill road crossing Kidderminster station had road geometry without a
reliable bridge profile. Saved worlds contain large tile sets, so rewriting a
journey without the matching world revision could corrupt its composition.

The repair keeps the source controls and original IDs, compiles additional
dated OSM station-area road and building ways, and records the sources in the
world. Mapped endpoints now share grid anchors; road bridges and terrain are
separate layers. The operational gates at Blakedown, Cradley Heath, Langley
Green and Bentley Heath are aligned with pairs of tagged OSM railway-crossing
nodes. Their prior inferred positions and chainages are retained in the world;
the two largest corrections are approximately 320 m and 290 m respectively.
A path ending beside a running track no longer becomes a crossing solely through
proximity. Inferred elevations remain explicitly modelled rather than
claimed as survey data. Older saves are preserved in browser storage but their
world identity is rejected if incompatible; no automatic migration between
different operating geometries is claimed. A new save captures the full world
atomically and can be restored without the data network.

The Hagley covered-footbridge deck and both stairs are a single bespoke source
assembly. Their source IDs are protected from road-junction splitting during
compilation, and both neighbouring grid tiles are checked for a complete
assembly. A failed required scenery tile is now reported during loading instead
of leaving the progress screen waiting for the generic timeout.

Livery Street's mapped canal bridge is below the Snow Hill railway viaduct,
as shown in the dated Geograph reference in the location manifest. Treating it
as a road bridge above the railway had produced a roughly 330% approach grade;
the revised datum is inferred from the road and terrain, and the earlier datum
remains in the compiled record. A remote pedestrian endpoint no longer fixes a
connected street's height at the far end of an underpass. The compiler now
records nine constrained motor-road grade exceptions, down from 27; these and
the broader graph/terrain warnings still require site review. The automatic
adjustments have an 8 m bound and do not move plan coordinates. The largest
remaining endpoint-grade estimates are on St Pauls Road (63.1%), Castle Road
(44.4%) and two Halfords Lane pieces (31.0% and 32.3%); the estimates are
model diagnostics, not verified road gradients.

The [Great Western Arcade](https://greatwesternarcade.co.uk/about-gwa) was
built above the Snow Hill–Moor Street tunnel. A wider-than-station sweep found
12 intersections where the level plinths for mapped buildings `way/24712366`
and `way/144379352` entered that bore. Foundation composition now partitions
the footprint against the sampled tunnel corridor and raises only the affected
foundation fragments above its modelled roof; the buildings and surrounding
foundation remain. The previous-release baseline and current finite probes are
in `docs/reports/snow-hill-foundation-baseline.json` and
`docs/reports/livery-clearance.json`. This is inferred support geometry, not a
survey of the arcade's structure.

The earlier reconstruction omitted the two existing Metro service paths at
The Hawthorns and bound both tram platforms to a track over a kilometre away.
The compiler retains the two earlier mapped paths, creates separate tram graph
pieces along them, and binds each platform to its nearest local path. The
inferred platform-width direction and former binding are retained for review;
Metro and heavy rail remain distinct networks.

At Jewellery Quarter, two mapped pedestrian links between the Metro platform
edges use the adjacent tram levels instead of the former ground-height estimate;
the old profiles remain recorded. Paired tram tracks through two mapped tunnel
sections use one shared civil opening per pair, with terrain clipped at the
portals. This is a geometry/clearance inference, not a surveyed bore plan.

## OpenLoco research

The following were inspected on 2026-11-01 at OpenLoco revision
[`638938c`](https://github.com/OpenLoco/OpenLoco/commit/638938cfc403560ea54cfbb741fd717d0a617546):

- [TrackEnum.h](https://github.com/OpenLoco/OpenLoco/blob/638938cfc403560ea54cfbb741fd717d0a617546/src/OpenLoco/include/OpenLoco/Map/Track/TrackEnum.h): 44 rail and 10 road IDs, including separate one-sided forms and slope/curve traits.
- [TrackData.cpp](https://github.com/OpenLoco/OpenLoco/blob/638938cfc403560ea54cfbb741fd717d0a617546/src/OpenLoco/src/Map/Track/TrackData.cpp): piece footprints, quarter-tile masks, rotated connection masks, height and reverse-direction information.
- [SubpositionData.cpp](https://github.com/OpenLoco/OpenLoco/blob/638938cfc403560ea54cfbb741fd717d0a617546/src/OpenLoco/src/Map/Track/SubpositionData.cpp): vehicle movement samples separately record direction, reversal, height and pitch along pieces.
- [PaintTrackData.h](https://github.com/OpenLoco/OpenLoco/blob/638938cfc403560ea54cfbb741fd717d0a617546/src/OpenLoco/include/OpenLoco/Paint/PaintTrackData.h): orientation-dependent layers, bounds, bridge edges and tunnel heights.
- [PaintRoad.cpp](https://github.com/OpenLoco/OpenLoco/blob/638938cfc403560ea54cfbb741fd717d0a617546/src/OpenLoco/src/Paint/PaintRoad.cpp): road-specific composition, one-way direction and level-crossing handling.

The simulator uses these architectural ideas and the user-provided ID names,
not OpenLoco graphics or copied source tables. The project catalogue uses its own
16 m grid and approximate parametric radii; it is not an exact OpenLoco map
importer. The imported real alignments remain flexible paths rather than being
distorted into the reference radii.

## Remaining risks

OSM station extracts do not constitute a complete street survey; source tags,
heights and vertical clearance are incomplete. The engine renders the player on
its existing primary continuous route, while imported sidings and most new
junction records remain physical scenery rather than a fully routable railway
interlocking. The piece catalogue and graph provide construction primitives;
they do not by themselves migrate every historical map record to a reference ID
or add a player construction interface. Detailed source-photo comparison,
hardware performance and continuous driving of every route section still need
independent review. Audit output and warnings must not be treated as geographic
or operational acceptance.
