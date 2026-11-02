/** Explicit authoring operation: refresh derived occupancy and integrity hashes.
 * Never generates placements, elevations or variants. Not called by site builds. */
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {resolveComposition} from '../src/world/prefab-composition.js';
const file='public/data/grid/scenes/kidderminster/world.json',read=p=>JSON.parse(readFileSync(p)),write=(p,d)=>writeFileSync(p,JSON.stringify(d,null,2)+'\n');
const manifest=read(file),catalogue=read(`public/${manifest.catalogue.url}`),enums=read(`public/${manifest.enums.url}`),chunks=manifest.tiles.map(t=>read(`public/${t.url}`));
const world=resolveComposition(chunks,catalogue,enums,{validateIndex:false});
for(const chunk of chunks){
    for(const i of chunk.instances)i.occupancy=world.instances.get(i.id).cells;
    for(const c of chunk.terrain)c.instances=[...(world.occupancy.get(`${c.x},${c.z}`)||[])].sort();
}
resolveComposition(chunks,catalogue,enums);
for(const chunk of chunks)write(`public/${manifest.tiles.find(t=>t.id===chunk.id).url}`,chunk);
for(const ref of [manifest.catalogue,manifest.enums,...manifest.tiles])ref.sha256=createHash('sha256').update(readFileSync(`public/${ref.url}`)).digest('hex');
manifest.revision=createHash('sha256').update(JSON.stringify([manifest.catalogue.sha256,manifest.enums.sha256,...manifest.tiles.map(t=>t.sha256)])).digest('hex');
write(file,manifest);
console.log(`Indexed ${world.instances.size} instances, ${world.terrain.cells.size} terrain cells. No placements changed.`);
