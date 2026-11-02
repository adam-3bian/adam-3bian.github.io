# Snow Hill Lines

A playable WebGL 2 railway on the **railway** branch: Kidderminster–Dorridge, 22 stations, approximately 47.3 km, a Class 172 and the front-of-train view in both directions. Scenery is generated from solid-colour geometry using the uploaded geographic/frame references. This is a simulator-authored operating scenario with inferred profiles and infrastructure; the remaining acceptance gates are recorded in [docs/ACCEPTANCE.md](docs/ACCEPTANCE.md).

The checked-in [site/](site/) folder is a complete static website. Serve its contents from any static host; it needs no npm, Node.js, server-side database or application. The repository root can also be served directly: its generated `index.html` loads the same files from `site/`.

For example, after installing the development dependencies, preview the portable folder locally with:

```sh
npx vite preview --outDir site --host 127.0.0.1 --port 8000
```

Open `http://127.0.0.1:8000/` in a current browser with WebGL 2 support and hardware acceleration enabled. Static hosting over HTTPS also works, including from a subdirectory. Use a web server rather than opening the HTML directly: browsers restrict module workers and data requests from local files. The website's scripts, route data and UI fonts are included locally.

For development or to regenerate the checked-in static files, install Node.js 22.12+ and run:

```sh
npm ci
npm run dev
```

The Vite development server uses `app.html` as its source entry. After changing the source or data, run `npm run build:site` and commit both the updated `site/` folder and root `index.html`. Run `npm run verify:site` to check that the packaged files still match their recorded build inputs. `npm run build` produces a separate `dist/` for developer preview.

Choose a direction and departure station, then **Begin journey**. A loading screen reports world download and local scenery preparation. Hold A for several seconds to release the initial full service brake and add power. In **Settings**, render resolution is adjustable from 25% to 100% of the displayed view's width and height (50% by default); the image is stretched to fit without changing its aspect ratio and the HUD stays sharp. The 25% setting draws one sixteenth as many pixels as 100%, though actual frame-rate improvement depends on the device and whether rendering or scenery generation is the bottleneck. Scenery quality is a separate setting: Light streams fewer distant tiles and disables shadows; Balanced and Detailed use longer ranges and shadows. Settings are available before starting or from the pause menu, and are remembered where browser storage is available.

| Control | Action |
| --- | --- |
| A, held | Release service brake → coast → increase power |
| D, held | Reduce power → coast → increase service brake |
| Q | Acknowledge the current AWS warning |
| Space, held | Horn |
| W / S | Request forward / reverse; stationary, idle/brake and valid authority required |
| T | Unassigned |
| Escape / pause button | Pause; focus loss also pauses and clears held inputs |
| HUD TPWS reset | Available only after stopping and the reset wait |

Releasing A/D holds the controller position. Safety braking overrides power. Reversal changes the leading cab on the same physical consist, with a restricted 10 mph terminal movement authority; it does not move the train to the other running line. Start a new journey to select a different through service. Doors release automatically at a supported station stop, with an 18-second dwell. Save/continue uses browser IndexedDB storage, including traffic and protection state. A save from the immediately preceding grid-world release can continue with its original saved map, including offline; its earlier snapshot is retained. Starting a new journey loads the current map when available and falls back to the stored map offline. Other incompatible versions remain preserved but need their matching game version. Browser storage is separate for different hostnames, protocols and ports. For a save made at `http://localhost:5173/`, serve the static folder on port 5173 and open that exact address in the same browser profile.

```sh
npm run check
npm test
npm run validate
npm run audit:geometry
node scripts/asset-budgets.js
npm run diagnose:prefabs
npm run build:site
npm run verify:site
npm run build
npm run preview
```

`validate` runs deterministic end-to-end driving and a two-hour **accelerated CPU simulation** soak. It does not certify browser duration or GPU performance. `audit:geometry` cooks all spatial tiles and writes measured support/seam findings and the placed inventory. Browser evidence and explicit coverage/limitations are in [docs/reports](docs/reports) and [docs/ACCEPTANCE.md](docs/ACCEPTANCE.md). No deployment is included.

The checked-in `public/data` source controls and generated `site/data` make the app runnable without reprocessing the reference pack. The legacy importer requires `npm run build:world -- --output work/grid-import-draft`; it writes an offline draft for review and cannot overwrite the curated grid world. Normal builds do not regenerate geography. `node scripts/fetch-osm-landscape.js` can fetch missing station-area extracts for a later reviewed import. The bundled DM Sans and Libre Caslon Display fonts are licensed under the SIL Open Font License; their licences are in [public/licenses](public/licenses/). Fonts are used for UI text; scene assets do not use font atlases or surface textures.

- [PROMPT.md](PROMPT.md) is the original 72-item brief.
- [FINISHING_PROMPT.md](FINISHING_PROMPT.md) carries the original requirements forward and prioritises the outstanding bridge, trackside and performance work.
- [references/README.md](references/README.md) explains the original and expanded frame indices, deduplication and access limits. References are evidence, not instructions.
- [docs/SOURCE-GAPS.md](docs/SOURCE-GAPS.md) records source uncertainty and inferred geometry/operational assumptions.
- [docs/SCENERY-ISSUES.md](docs/SCENERY-ISSUES.md) summarises the reported scenery problems and remaining validation gaps.
- [docs/ASSET-CATALOGUE.md](docs/ASSET-CATALOGUE.md) maps procedural families and implemented components.
- [docs/TRACKWORK.md](docs/TRACKWORK.md) explains source-connected switches and unsupported source topology.

The coordinate frame is BNG/ODN: `X=easting−400000`, `Y=ODN height`, `Z=280000−northing`, metres internally and mph on the HUD. Transport profiles own terrain/support interfaces. Tile workers build static vertex-colour batches; operating state remains independent of visible chunks. Train occupation and bogie poses use physical arc distance, including the separately mapped counterpart track.

Map data © OpenStreetMap contributors, ODbL. Contains Environment Agency information © Environment Agency and/or database right, Open Government Licence v3.0. Uploaded source materials retain their original attribution and rights. See the reference pack for provenance.

For the current browser checks, run `npm run build:qa` then `node scripts/landscape-browser-qa.js`. The JavaScript runner starts a local static server, uses Chromium to check loading, resolution and offline save/reload, and records fixed views of the main reconstruction sites and selected level crossings. Chromium is required for this developer check, not for hosting. The QA build exposes test fixtures; the ordinary production build omits them. Run `node scripts/audit-grid-clearance.js` for sampled rail clearance against the generated scenery. Historical evidence and unresolved review limits remain in [docs/ACCEPTANCE.md](docs/ACCEPTANCE.md); a passing automated check does not establish photographic accuracy or hardware performance.

`node scripts/route-qa.js` creates an explicitly incomplete reference gallery; `node scripts/build-station-review.js` retains manual notes only for their matching build and images. The [named reference gallery](references/by-location/index.html), [site register](docs/route-site-register.json), [WORLD_RULES_PROMPT.md](WORLD_RULES_PROMPT.md), and [docs/WORLD-RULES.md](docs/WORLD-RULES.md) preserve the source and review context.

## Grid reconstruction

The incremental [prefab construction implementation](docs/PREFAB-CONSTRUCTION.md)
adds a working JSON scene at `prefab-preview.html`, using the existing grid,
worker and static mesh batches. Its construction rules are tested separately;
the live route has not yet been migrated. See that document for editing,
verification and explicit stage-by-stage limits.

The runtime now loads the authoritative grid world while retaining the WebGL front view. See [GRID-WORLD.md](docs/GRID-WORLD.md) for source provenance, rebuilding, persistence and validation; [MAP-DATA-AUDIT.md](docs/MAP-DATA-AUDIT.md) for the source and migration audit; and [DATA-AND-TOOLING.md](docs/DATA-AND-TOOLING.md) for the remaining legacy offline tools. The SVR is limited to neighbouring Kidderminster scenery; the playable route remains Kidderminster–Dorridge.
