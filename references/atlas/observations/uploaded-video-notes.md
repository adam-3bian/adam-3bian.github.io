# Snow Hill Line — uploaded video observations and return-journey requirements

Reviewed: 1 November 2026. These analytical notes were prepared before the latest project was reattached. The supplied v0.11 ZIP was subsequently recovered and used for the v0.12 implementation. The observations below remain limited to the sampled footage; release validation is recorded separately in ../../TEST-REPORT.md.

## Files actually inspected

- **ytcuttr_clip_00-00-10_00-10-10.mp4**: 604.19 seconds; 640 × 360; H.264 video/AAC audio. SHA-256: `1080cce39bc19b88042bd89984819fdf19a432872b3ea98b7c4d6100b4a04780`.
- **ytcuttr_clip_00-01-10_00-11-10.mp4**: 605.11 seconds; 640 × 360; H.264 video/AAC audio. SHA-256: `91f4cd6ccbcf40becbf3924c29c86b816bfc3c5a519b5be79d46e33eed23b4fb`.

Frames were decoded from both files every 30 seconds through 10:00, with additional full-resolution samples at 9:10, 9:20 and 9:25 in the first clip. This is sampled visual inspection, not a claim to have watched every frame or measured dimensions. Timestamps below are relative to the uploaded file, not the original YouTube video.

The first clip includes an introductory title identifying Birmingham Moor Street–London Marylebone and a Chiltern Trainspotters 2022 copyright notice. Its introduction explicitly says the guide may contain errors and is not for official route learning. Capture date is not independently established. The reference is useful for visual form; captions are not current operational authority.

Both files are approximately ten minutes long. Visual samples establish substantial overlap: the second starts around the scene at 1:00 in the first, and its 9:00 scene matches the first clip's 10:00 scene closely. Treat them as largely overlapping footage, not as ten minutes plus a separate final five minutes to Dorridge. Solihull is explicitly labelled at 9:20 in the first clip. No Dorridge arrival or Moor Street–Snow Hill tunnel passage was found in these sampled sections.

## Observations to carry into implementation

| Reference | Directly observed | Implementation implication |
| --- | --- | --- |
| First clip 0:30 | Station-departure parapets, fencing, overhead signal gantries and several source-fixed railway tracks | Moor Street needs substantial supporting civil geometry and correctly mounted signals; isolated rails or ground poles will not reproduce the view |
| First clip 1:00 / second 0:00 | Elevated open railway approach, multiple lines/sidings and urban massing; caption identifies Moor Street sidings on the right | Distinguish main, siding and diverging geometry; preserve the fixed geographic arrangement when changing player routes |
| First clip 1:30–2:00 / second 0:30–1:00 | Raised city railway, prominent parallel masonry arches to the left and a tower-like landmark ahead/right | Inventory real viaduct/deck/support structures and match skyline silhouettes; exact structure IDs and dimensions still require map/reference correlation |
| First clip 2:30–4:30 / second 1:30–3:30 | Multiple tracks, industrial surroundings, retaining/boundary walls, uneven earthworks and a broad crossing structure ahead | Keep roads/decks/ground/rail height separate; do not flatten this entire corridor or assume a bridge at every plan intersection |
| First clip 5:00 / second 4:00 | Overhead signal gantries and a visible converging/diverging track arrangement; large industrial structure on the right | Fit stock/closure rails and turnout routes to the source network. Footage does not demonstrate blade movement or establish an interlocking |
| First clip 6:00 / second 5:00 | Tyseley caption, platform/canopy structures and adjacent railway | Compare the selected running path and platform sides carefully; a connected graph path alone does not prove the chosen passenger route |
| First clip 6:30–9:00 / second 5:30–8:00 | Enclosed vegetated railway with significant banks/cuttings and changing roadside/building context | Use source relief plus justified engineered formation. Avoid both terrain intrusion and a permanently flat green strip |
| First clip 9:20–9:30 / second approximately 8:20–8:30 | Explicit Solihull label, platform on the driver's right, lamps, canopy/building forms and access structure further ahead | Use this as a southbound comparison checkpoint. Changing driving direction changes what appears left/right; the geographic platform must not move or be mirrored |
| First clip 10:00 / second 9:00–10:00 | Railway after the Solihull platform, further structures and vegetation | Existing references do not establish the final approach/arrival at Dorridge or the Snow Hill tunnel interior |

No coordinates, exact heights, gradient, turnout radius or clearances were inferred as surveyed measurements from these 640 × 360 compressed frames. Independent map/engineering/photographic evidence remains necessary. Copyrighted footage/frames are not redistributed in this report; it contains analytical notes and local-file time references only.

## Bidirectional operation requested by the user

The implementation scope is now **Dorridge → Birmingham Snow Hill** and **Birmingham Snow Hill → Dorridge**, selectable before starting a journey. This must be complete travel in both directions, not just a rotated camera on the original route.

- Keep the fixed world coordinate frame and geographic source geometry. Select the appropriate directed Up/Down track path and valid station platforms for each service; verify the Snow Hill departure and Dorridge arrival assignments.
- Keep geographic chainage separate from physical journey distance. World chainage can decrease southbound while trip progress, speed and scheduled-stop distance remain positive in the travel direction. Arc distance through alternatives must be physical, including the whole train.
- Orient the driver's pose, forward look-ahead, bogies, cars, headlights/tail lights and destination displays consistently with the selected route/direction. Camera right/left changes with heading; scenery and platforms stay fixed.
- Reverse station/calling order and choose coherent direction-specific timings/stopping flags. Update origin/destination, next-stop HUD, map/progress, station selector, stop scoring and completion boundary together.
- Associate signals, blocks and protection devices with governing directed edges. OSM forward/backward is relative to source-way ordering, not automatically north/south. Implement approach/rear clearance for AWS/TPWS, crossings and turnouts in both directions.
- Point occupancy/proof/conflicts must use the occupied physical edges and full-consist rear, not a direction-blind main-chainage interval. Preserve the documented exclusive protection around any unresolved shared Tyseley source route.
- Route AI traffic, lead/opposing trains and their platform calls using the same network and direction rules; prevent a direction change from creating head-on traffic or misplaced lights.
- Make streaming, visible chunk bounds, LOD, exit prefetch and eviction travel-direction-aware. The previous ahead-only positive-chainage renderer/loader must not leave southbound views empty or loading too late.
- Save route ID, travel direction, graph position, stopping progress, point/traffic/protection state and scenario time. Preserve or clearly restart legacy northbound-only saves; never silently reinterpret them as southbound.
- Test both complete journeys, both tunnel directions, every permitted turnout, both bogies/all cars, AI conflict protection, crossing approach/release, inside-tunnel save/resume, camera stability, render scales and revisited cache memory in a real browser.

## Implementation follow-through

The reattached v0.11 project is the baseline for v0.12. Both complete journey directions, travel-aware streaming, fixed source geometry, recovered station surfaces, inventoried bridges, point inspection and the common camera/rail curve are implemented. The clips did not supply the missing tunnel/Dorridge views or independently verified dimensions. See ../../ACCEPTANCE.md and ../../CONTINUATION.md for remaining evidence and browser requirements.
