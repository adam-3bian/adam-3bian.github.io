import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {RouteGeometry} from '../src/core/geometry';
import {engineerSurfaceRoad,Terrain} from '../src/world/surfaces';
import {accessSourceIds,accessDefinitions} from '../src/world/access-sites';
import type {Feature,RouteData} from '../src/core/types';

// Screens source-derived centreline crossings for review; this is not a
// triangle intersection test or a complete inventory of footway structures.
const sourcePaths=['public/data/route.json','public/data/road-surfaces.json','public/data/terrain.bin','src/core/geometry.ts','src/world/surfaces.ts','src/world/access-sites.ts','src/world/site-definitions.json','scripts/audit-footways.ts'];
const hashes=Object.fromEntries(sourcePaths.map(p=>[p,createHash('sha256').update(readFileSync(p)).digest('hex')]));
const route=new RouteGeometry(JSON.parse(readFileSync(sourcePaths[0],'utf8')) as RouteData);
const roads=JSON.parse(readFileSync(sourcePaths[1],'utf8')).roads as Feature[];
const bytes=readFileSync('public/data/terrain.bin'),terrain=new Terrain(route.data.terrain,new Uint16Array(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength)));
const candidates:{id:string;segment:number;lane:number;s:number;pathHeight:number;railHeight:number;difference:number;classification:string}[]=[];
let segments=0;
for(const feature of roads){
  if(!['footway','path','steps','pedestrian','cycleway'].includes(String(feature.kind)))continue;
  if(accessSourceIds.has(feature.id))continue;
  const road=engineerSurfaceRoad(feature,route,terrain);if(!road||road.mode!=='ground')continue;
  for(let i=1;i<road.points.length;i++){
    const a=road.points[i-1],b=road.points[i],pa=route.project(a[0],a[2],40),pb=route.project(b[0],b[2],40);
    segments++;if(pa.distance>40||pb.distance>40||Math.abs(pa.s-pb.s)>30||Math.abs(pa.side-pb.side)<.1)continue;
    for(const lane of [0,4.2]){
      const mid=(pa.s+pb.s)/2,side=lane===0?0:route.laneOffset(mid,lane),t=(side-pa.side)/(pb.side-pa.side);
      if(t<0||t>1)continue;
      const s=pa.s+(pb.s-pa.s)*t,height=a[1]+(b[1]-a[1])*t+.035,rail=route.lanePose(s,lane).position[1],difference=height-rail;
      if(difference<-.4||difference>4.5)continue;
      candidates.push({id:feature.id,segment:i-1,lane,s,pathHeight:height,railHeight:rail,difference,classification:'unreviewed candidate; validate emitted geometry and source crossing type'});
    }
  }
}
const result={generatedUTC:new Date().toISOString(),sourceHashes:hashes,scope:'Ground-mode footway centreline candidates near two modelled running lanes. Not full geometry, pedestrian connectivity, bridge, crossing or clearance acceptance.',segmentsExamined:segments,candidateCount:candidates.length,declaredLayeredAccessReplacements:accessDefinitions.map(s=>({site:s.id,sourceIds:[s.deck,...s.stairs],geometryEvidence:'docs/reports/hagley-access-diagnostic.json',status:'declared replacement; consult actual mesh audit, not an automatic clearance pass'})),candidates};
writeFileSync('docs/reports/footway-crossing-candidates.json',JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({segmentsExamined:segments,candidateCount:candidates.length,hagley:candidates.filter(c=>c.id==='way/240115500/0')},null,2));
if(candidates.length)process.exitCode=1;
