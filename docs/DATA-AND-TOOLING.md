# Data and tooling

The website, world compiler, reference checks and browser checks use JavaScript.
The deployed `site/` is static and needs no server-side runtime.

The world compiler starts from the checked-in, previously normalised route,
terrain and reconstruction controls in `public/data/`, plus the dated OSM
extracts in `references/geography/`. It writes a review draft with
`npm run build:world -- --output work/grid-import-draft`; it cannot overwrite
`public/data/grid/` and does not need a network connection. New OSM station
extracts can be downloaded with `node scripts/fetch-osm-landscape.js` before a
world rebuild. `scripts/fetch-osm-buffer-stops.js` and
`scripts/fetch-osm-crossings.js` likewise archive the mapped source nodes used
for buffers and operational crossing locations. The reference manifest
describes coverage and uncertainty.

The old one-time atlas-to-control and research-report scripts and their inputs,
generated controls, reports and review notes remain checked in for provenance.
Some of those legacy offline tools are still Python; they are not required to
run, build or host the current JavaScript website. Rebuilding the *old* controls
from the raw SVG/heightmap atlas is not yet implemented in the JavaScript
compiler; edit or replace the checked-in controls when updating those underlying
sources. Existing reports from legacy tools are historical evidence, not
current acceptance.

The current JavaScript checks cover the grid, geometry, traffic, reference
integrity and review-note hashes. `scripts/landscape-browser-qa.js` checks the
current loading, resolution, fixed views and complete-world offline reload.
These checks do not by themselves certify every scene, raw source extraction or
hardware performance.

`node scripts/profile-loading-browser.js` records a cold local Chromium load in
`work/`; pass `3` to emulate a threefold CPU slowdown. It uses SwiftShader and
reports main-thread timing separately from worker and graphics work. For the
previous-release save check, extract the old `site/` from commit `c4bfc49` into
`work/previous-site/`, build the QA site, then run
`node scripts/save-upgrade-browser-qa.js`. Its offline and new-journey checks
use one browser origin so they share the same IndexedDB storage.
