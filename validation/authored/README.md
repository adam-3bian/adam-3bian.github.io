# Evidence scope

`world.json` and `asset-coverage.json` describe the current revision printed in
those reports. `transport-profiles.json` audits the retained source paths and
the authored operating road network; its review findings are not engineering
approvals. `acceptance.json` is the consolidated stage ledger.

Files named `<x>_<z>.json`, `migration.json`, `curation.json` and
`kidderminster-gate-browser.json` are **historical migration-stage evidence**.
Their counts and hashes preceded later station curation, boundary corrections
and cache filename changes. They are not current cache descriptors. The sole
runtime manifest is `public/data/grid/authored-world.json`.

`browser-stations.json` covers all 22 stations from both directions, an actual
driving interval and an offline IndexedDB reload. Its viewport was 1920×1080
but its drawing buffer was 960×540. `browser-final.json` records the subsequent
explicit 1920×1080 run, repeated visits, memory and injected-failure checks.
Both use SwiftShader, not the declared reference GPU. Station photographs were
reviewed by the implementing assistant; independent blind recognition remains
blocked. Captures are in `docs/captures/authored/`.

The 1080p run predates the final invalid-bridge quarantine. Its measured frame
cadence exceeds the target on this software renderer. Its 6.2% collected
JavaScript heap growth does not verify retained GPU bytes. `browser-smoke.json`
checks the final repaired revision, including the built production entry and
an offline save, at an explicitly reduced resolution; it is not a benchmark.

`clearance.json` records 135 sampled-envelope intersections affecting 18
preserved source instances after the 30 invalid inferred bridge assemblies
were quarantined. That audit intentionally exits nonzero while these review
findings remain. `world.json` passes structural, support and seam checks only.

`browser-before-release-fix.json` preserves the failed production-entry check
that exposed a stale release-revision constant. `browser-smoke.json` is the
rerun after the fix and also asserts that a new journey starts without a reload.
The five targeted static-hosting/save-compatibility tests were rerun after
that fix in addition to the full 171-test suite.
