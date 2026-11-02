# Authored railway acceptance

Overall status: **INCOMPLETE**. The implementation and source migration are working; the full specification is not accepted. See the [stage ledger](../../validation/authored/acceptance.json) for exact scope and evidence.

The normal static application now composes 133 JSON-authored chunks containing 744,322 canonical instances. Stored operations include road topology, signals, switches and protection equipment. Original route data and archived saves remain available. All shared rendered boundaries match exactly; 45,314,729 triangles have zero degenerates, and the audited tree/foundation support checks pass.

The final suite passes 171 tests. Both automated rail journeys visit all 21 destination stops in order, with zero SPADs or collisions; the dispatcher soak also passes. Browser evidence covers all 22 stations from both directions, real driving intervals, injected download failure recovery and full offline save/load. The final production entry and repaired revision pass separate smoke checks. Build verification matches 470 inputs and 420 output files.

Acceptance remains incomplete:

- 7,762 gradient/transition findings and 36,041 undeclared full-section ownership records require review.
- Thirty invalid inferred bridge assemblies were quarantined with their source records retained; 135 sampled clearance intersections across 18 other source objects remain.
- Of 932 enum values, 164 are verified, 30 are unverified, 143 are vocabulary-only and 595 have unknown legacy mappings.
- Station photographic recognition has not passed independent blind review. Some architecture, train and ambient variants remain unverified.
- Actual 1080p frame cadence exceeds targets on SwiftShader. The reference RTX 3060 is unavailable. The measured 6.2% retained JavaScript heap growth does not verify retained GPU bytes.

The 44-view station run used a 960×540 drawing buffer. The subsequent benchmark used a true 1920×1080 buffer before the final bridge quarantine. The final repaired-revision smoke run is explicitly reduced-resolution functional evidence, not a performance pass. Complete reports and captures retain these distinctions.
