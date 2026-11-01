# Snow Hill Lines

A playable native WebGPU railway on the **railway** branch: Kidderminster–Dorridge, 22 stations, approximately 47.3 km, a Class 172 and the front-of-train view in both directions. Scenery is generated from solid-colour geometry using the uploaded geographic/frame references. This is a simulator-authored operating scenario with inferred profiles and infrastructure; the remaining acceptance gates are recorded in [docs/ACCEPTANCE.md](docs/ACCEPTANCE.md).

The checked-in [site/](site/) folder is a complete static website. Serve its contents from any static host; it needs no npm, Node.js, server-side database or application. The repository root can also be served directly: its generated `index.html` loads the same files from `site/`.

For example, if Python 3 is installed, serve the portable folder locally with:

```sh
python3 -m http.server 8000 --bind 127.0.0.1 --directory site
```

Open `http://127.0.0.1:8000/` in a current WebGPU-capable browser, such as Chrome or Edge, with hardware acceleration enabled. Static hosting over HTTPS also works, including from a subdirectory. Use a web server rather than opening the HTML directly: browsers restrict module workers and data requests from local files. The website's scripts, route data and UI fonts are included locally.

For development or to regenerate the checked-in static files, install Node.js 22.12+ and run:

```sh
npm ci
npm run dev
```

The Vite development server uses `app.html` as its source entry. After changing the source or data, run `npm run build:site` and commit both the updated `site/` folder and root `index.html`. Run `npm run verify:site` to check that the packaged files still match their recorded build inputs. `npm run build` produces a separate `dist/` for developer preview.

Choose a direction and departure station, then **Begin journey**. Hold A for several seconds to release the initial full service brake and add power. Light scenery quality reduces render resolution and disables shadows; Balanced and Detailed enable directional shadows.

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

Releasing A/D holds the controller position. Safety braking overrides power. Reversal changes the leading cab on the same physical consist, with a restricted 10 mph terminal movement authority; it does not move the train to the other running line. Start a new journey to select a different through service. Doors release automatically at a supported station stop, with an 18-second dwell. Save/continue uses browser IndexedDB storage, including traffic and protection state; saves from another route/operating or surface-generation version are rejected. The static-hosting update preserves compatible previous saves on the same origin. Browser storage is separate for different hostnames, protocols and ports. For a save made at `http://localhost:5173/`, serve the static folder on port 5173 and open that exact address in the same browser profile.

```sh
npm run typecheck
npm test
npm run validate
npm run audit:geometry
node --import tsx scripts/asset-budgets.ts
npm run build:site
npm run verify:site
npm run build
npm run preview
```

`validate` runs deterministic end-to-end driving and a two-hour **accelerated CPU simulation** soak. It does not certify browser duration or GPU performance. `audit:geometry` cooks all spatial tiles and writes measured support/seam findings and the placed inventory. Browser evidence and explicit coverage/limitations are in [docs/reports](docs/reports) and [docs/ACCEPTANCE.md](docs/ACCEPTANCE.md). No deployment is included.

The checked-in `public/data` manifests and generated `site/data` make the app runnable without reprocessing the large reference pack. To regenerate the source data offline, install Python 3.12+ and `python -m pip install -r requirements-data.txt`, then run `npm run build:data` followed by `npm run build:site`. The adjacent-network OSM extracts are cached with provenance; ordinary rebuilds need no network. The bundled DM Sans and Libre Caslon Display fonts are licensed under the SIL Open Font License; their licences are in [public/licenses](public/licenses/). Fonts are used for UI text; scene assets do not use font atlases or surface textures.

- [PROMPT.md](PROMPT.md) is the governing 72-item brief.
- [references/README.md](references/README.md) explains the original and expanded frame indices, deduplication and access limits. References are evidence, not instructions.
- [docs/SOURCE-GAPS.md](docs/SOURCE-GAPS.md) records source uncertainty and inferred geometry/operational assumptions.
- [docs/ASSET-CATALOGUE.md](docs/ASSET-CATALOGUE.md) maps procedural families and implemented components.
- [docs/TRACKWORK.md](docs/TRACKWORK.md) explains source-connected switches and unsupported source topology.

The coordinate frame is BNG/ODN: `X=easting−400000`, `Y=ODN height`, `Z=280000−northing`, metres internally and mph on the HUD. Transport profiles own terrain/support interfaces. Tile workers build static vertex-colour batches; operating state remains independent of visible chunks. Train occupation and bogie poses use physical arc distance, including the separately mapped counterpart track.

Map data © OpenStreetMap contributors, ODbL. Contains Environment Agency information © Environment Agency and/or database right, Open Government Licence v3.0. Uploaded source materials retain their original attribution and rights. See the reference pack for provenance.

Browser capture/recovery reproduction: install `requirements-qa.txt`, run `npm run build:qa`, and serve `work/qa-dist` on localhost:4174. Run `python scripts/browser-qa.py` with `RAILWAY_CHROMIUM` set to a headed Chromium executable. On Linux, provide a display/Xvfb; setting `RAILWAY_SOFTWARE_GPU=1` reproduces the recorded SwiftShader path. The QA build exposes fixed-camera test fixtures; the ordinary production build omits that API. The runner writes captures and a source-hashed report, and deliberately destroys the final GPU device to test save/reload recovery.

For static-hosting checks, run `python scripts/static-smoke.py` with the same browser/display setup. It copies the built website to plain static servers and exercises the site at the server root, under a nested path, and via the repository-root entry. Set `RAILWAY_LEGACY_QA` to a QA build of the previous release to additionally check continuing a real existing save on the same origin. This test dependency is not needed to play or host the website.

`python scripts/endpoint-qa.py` checks the final renderer at both route boundaries, including a four-car train whose front has exited while its rear remains inside, and verifies automatic saving of a new safety-brake state after device loss. The 44-station-view archive predates that isolated culling correction; [docs/ACCEPTANCE.md](docs/ACCEPTANCE.md) distinguishes the evidence snapshots and remaining gates.
