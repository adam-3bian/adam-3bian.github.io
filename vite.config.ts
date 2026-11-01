import {defineConfig} from 'vite';
import {createHash} from 'node:crypto';
import {readFileSync,readdirSync} from 'node:fs';

// Save identity covers physical rules and consumed source data, independently of UI edits.
function worldIdentity(){const files=['vite.config.ts','src/core/geometry.ts','src/core/simulation.ts','src/core/pose.ts','src/world/build.ts','src/world/platforms.ts','src/world/surfaces.ts','src/world/traffic.ts','src/render/assets.ts','src/render/trackwork.ts','src/render/batch.ts','src/render/renderer.ts','public/data/route.json','public/data/terrain.bin','public/data/adjacent-services.json','public/data/road-surfaces.json','public/data/land-surfaces.json',...readdirSync('public/data/tiles').sort().map(name=>`public/data/tiles/${name}`)];const hash=createHash('sha256');for(const path of files)hash.update(path).update('\0').update(readFileSync(path));return hash.digest('hex');}
export default defineConfig({define:{__RAILWAY_WORLD_HASH__:JSON.stringify(worldIdentity())}});
