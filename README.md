# Snow Hill Lines

A playable native WebGPU railway on the **railway** branch: Kidderminster–Dorridge, 22 stations, approximately 47.3 km, a Class 172 and the front-of-train view in both directions. Scenery is generated from solid-colour geometry using the uploaded geographic/frame references. This is a simulator-authored operating scenario with inferred profiles and infrastructure; the remaining acceptance gates are recorded in [docs/ACCEPTANCE.md](docs/ACCEPTANCE.md).

Requires Node.js 22.12+ and a current WebGPU-capable Chrome/Edge. Use localhost or HTTPS, with hardware acceleration enabled.

```sh
npm ci
npm run dev
```

Open the localhost URL printed by Vite. Choose a direction and departure station, then **Begin journey**. Hold A for several seconds to release the initial full service brake and add power. Light scenery quality reduces render resolution and disables shadows; Balanced and Detailed enable directional shadows.

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

Releasing A/D holds the controller position. Safety braking overrides power. Reversal changes the leading cab on the same physical consist, with a restricted 10 mph terminal movement authority; it does not move the train to the other running line. Start a new journey to select a different through service. Doors release automatically at a supported station stop, with an 18-second dwell. Save/continue uses browser IndexedDB storage, including traffic and protection state; saves from another route/operating or surface-generation version are rejected. A build hashes its physical rules and consumed manifests so a saved road profile cannot silently override a changed world.

```sh
npm run typecheck
npm test
npm run validate
npm run audit:geometry
node --import tsx scripts/asset-budgets.ts
npm run build
npm run preview
```

`validate` runs deterministic end-to-end driving and a two-hour **accelerated CPU simulation** soak. It does not certify browser duration or GPU performance. `audit:geometry` cooks all spatial tiles and writes measured support/seam findings and the placed inventory. Browser evidence and explicit coverage/limitations are in [docs/reports](docs/reports) and [docs/ACCEPTANCE.md](docs/ACCEPTANCE.md). No deployment is included.

The checked-in `public/data` manifests make the app runnable without reprocessing the large reference pack. To regenerate them offline, install Python 3.12+ and `python -m pip install -r requirements-data.txt`, then run `npm run build:data`. The adjacent-network OSM extracts are cached with provenance; ordinary rebuilds need no network. An internet connection is used only for optional DOM web fonts; system fonts are a fallback, and scene assets never use font atlases or surface textures.

- [PROMPT.md](PROMPT.md) is the governing 72-item brief.
- [references/README.md](references/README.md) explains the original and expanded frame indices, deduplication and access limits. References are evidence, not instructions.
- [docs/SOURCE-GAPS.md](docs/SOURCE-GAPS.md) records source uncertainty and inferred geometry/operational assumptions.
- [docs/ASSET-CATALOGUE.md](docs/ASSET-CATALOGUE.md) maps procedural families and implemented components.
- [docs/TRACKWORK.md](docs/TRACKWORK.md) explains source-connected switches and unsupported source topology.

The coordinate frame is BNG/ODN: `X=easting−400000`, `Y=ODN height`, `Z=280000−northing`, metres internally and mph on the HUD. Transport profiles own terrain/support interfaces. Tile workers build static vertex-colour batches; operating state remains independent of visible chunks. Train occupation and bogie poses use physical arc distance, including the separately mapped counterpart track.

Map data © OpenStreetMap contributors, ODbL. Contains Environment Agency information © Environment Agency and/or database right, Open Government Licence v3.0. Uploaded source materials retain their original attribution and rights. See the reference pack for provenance.

Browser capture/recovery reproduction: install `requirements-qa.txt`, run `npm run build:qa`, and serve `work/qa-dist` on localhost:4174. Run `python scripts/browser-qa.py` with `RAILWAY_CHROMIUM` set to a headed Chromium executable. On Linux, provide a display/Xvfb; setting `RAILWAY_SOFTWARE_GPU=1` reproduces the recorded SwiftShader path. The QA build exposes fixed-camera test fixtures; the ordinary production build omits that API. The runner writes captures and a source-hashed report, and deliberately destroys the final GPU device to test save/reload recovery.

`python scripts/endpoint-qa.py` checks the final renderer at both route boundaries, including a four-car train whose front has exited while its rear remains inside, and verifies automatic saving of a new safety-brake state after device loss. The 44-station-view archive predates that isolated culling correction; [docs/ACCEPTANCE.md](docs/ACCEPTANCE.md) distinguishes the evidence snapshots and remaining gates.
