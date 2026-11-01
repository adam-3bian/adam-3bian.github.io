/** Compile OSM ways into deterministic, grid-addressable road pieces.
 * The archived snapshots are the authority for plan connectivity, bridge tags
 * and building types. Heights remain a consistency model, not surveyed levels.
 */
import {readFileSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import proj4 from 'proj4';
import {Polyline} from '../src/core/geometry.js';
import {engineerSurfaceRoad} from '../src/world/surfaces.js';
import {roadSiteDefinitions} from '../src/world/road-sites.js';
import {accessSourceIds} from '../src/world/access-sites.js';
import {occupiedQuarters} from '../src/world/piece-registry.js';
import {resolveRoadGrades} from '../src/world/road-grades.js';

proj4.defs('EPSG:27700','+proj=tmerc +lat_0=49 +lon_0=-2 +k=0.9996012717 +x_0=400000 +y_0=-100000 +ellps=airy +towgs84=446.448,-125.157,542.060,0.1502,0.2470,0.8421,-20.4894 +units=m +no_defs');
/** The same WGS84-to-world transform is used for roads and reference nodes. */
export function osmWorldPosition(lon,lat){const [east,north]=proj4('EPSG:4326','EPSG:27700',[+lon,+lat]);return [Math.round((east-400000)*100)/100,Math.round((280000-north)*100)/100];}
const highways=new Set(['motorway','motorway_link','trunk','trunk_link','primary','primary_link','secondary','secondary_link','tertiary','tertiary_link','unclassified','residential','living_street','service','road','footway','path','steps','cycleway','pedestrian','track','bridleway']);
const widths={motorway:10,trunk:8,primary:7.2,secondary:6.6,tertiary:6,residential:5.5,unclassified:5.5,living_street:4.8,service:3.6,road:5.5,footway:1.8,path:1.6,steps:1.7,cycleway:2.2,pedestrian:3.5,track:3.4,bridleway:2.4};
const motor=new Set(['motorway','motorway_link','trunk','trunk_link','primary','primary_link','secondary','secondary_link','tertiary','tertiary_link','unclassified','residential','living_street','road']);
const sourceId=id=>/^way\/(\d+)/.exec(id)?.[1];
const idSort=(a,b)=>String(a).localeCompare(String(b),'en',{numeric:true});
const bounds=points=>[Math.floor(Math.min(...points.map(p=>p[0]))*100)/100,Math.floor(Math.min(...points.map(p=>p[2]))*100)/100,Math.ceil(Math.max(...points.map(p=>p[0]))*100)/100,Math.ceil(Math.max(...points.map(p=>p[2]))*100)/100];
const nodeKey=id=>`osm/${id}`;
const distance=(a,b)=>Math.hypot(a[0]-b[0],a[2]-b[2]);
function widthOf(tags){const explicit=parseFloat(tags.width);if(Number.isFinite(explicit)&&explicit>=1&&explicit<=30)return explicit;const kind=tags.highway?.replace(/_link$/,'')||'road',base=widths[kind]||5.5;return tags.lanes==='1'&&base>4.5?4.5:base;}
function nearestRoute(route,points,radius=900){for(let i=0;i<points.length;i+=Math.max(1,Math.floor(points.length/8)))if(route.project(points[i][0],points[i][2],radius).distance<radius)return true;return route.project(points.at(-1)[0],points.at(-1)[2],radius).distance<radius;}
function catalogId(road){if(road.mode==='over')return 'road/bridge';if(road.mode==='tunnel')return 'road/tunnel';if(road.mode==='crossing'||road.mode==='pedestrian-crossing')return 'road/level-crossing';if(Math.abs(road.points.at(-1)[1]-road.points[0][1])>.4)return 'road/gradient';if(road.points.length>2){const a=road.points[0],b=road.points.at(-1),dx=b[0]-a[0],dz=b[2]-a[2],len=Math.hypot(dx,dz)||1;if(road.points.some(p=>Math.abs((p[0]-a[0])*dz-(p[2]-a[2])*dx)/len>.3))return 'road/curve';}return 'road/straight';}
export const PIECE_CATALOG=[
 ...['straight','curve','gradient','junction','bridge','tunnel','level-crossing'].map(id=>({id:`road/${id}`,family:'road',form:id})),
 ...['straight','curve','gradient','turnout','bridge','tunnel'].map(id=>({id:`rail/${id}`,family:'rail',form:id})),
 ...['straight','curve','turnout','bridge','tunnel'].map(id=>({id:`tram/${id}`,family:'tram',form:id})),
];

/** Return copied features; keep source ways and carefully authored structures separate. */
export function compileLandscape(route,terrain,originalRoads,tiles){
 const files=readdirSync('references/geography').filter(n=>n.endsWith('.osm.json')).sort(),nodes=new Map(),ways=new Map(),sources=[];
 for(const file of files){const bytes=readFileSync(`references/geography/${file}`),doc=JSON.parse(bytes);sources.push({file,sha256:createHash('sha256').update(bytes).digest('hex'),date:doc.osm3s?.timestamp_osm_base,source:doc.source||'https://overpass-api.de/'});
  for(const e of doc.elements||[])if(e.type==='node'&&Number.isFinite(+e.lon)&&Number.isFinite(+e.lat))nodes.set(String(e.id),e);else if(e.type==='way'&&e.nodes?.length)ways.set(String(e.id),e);
 }
 const positions=new Map();function locate(id){id=String(id);if(!positions.has(id)){const n=nodes.get(id);if(!n)return;positions.set(id,osmWorldPosition(n.lon,n.lat));}return positions.get(id);}
 const roadWays=[...ways.values()].filter(w=>highways.has(w.tags?.highway)&&w.nodes.every(n=>nodes.has(String(n))));
 const members=new Map();for(const w of roadWays)for(const node of new Set(w.nodes.map(String))){const ids=members.get(node)||new Set();ids.add(String(w.id));members.set(node,ids);}
 const oldByWay=new Map();for(const road of originalRoads){const id=sourceId(road.id);if(id){const list=oldByWay.get(id)||[];list.push(road);oldByWay.set(id,list);}}
 const protectedIds=new Set([...accessSourceIds,...roadSiteDefinitions.flatMap(s=>[s.span,...s.approaches])]);for(const road of originalRoads)if(road.elevationMode||road.gradeRelations?.length)protectedIds.add(road.id);
 const overrides=new Map(),cuts=new Map();
 // Recover the shared OSM junctions that are hidden inside older SVG paths.
 for(const road of originalRoads){const id=sourceId(road.id),way=ways.get(id);if(!way||!road.points?.length)continue;const path=new Polyline(road.points),hits=[];
  for(const node of way.nodes){const k=String(node);if((members.get(k)?.size||0)<2)continue;const pos=locate(k);if(!pos)continue;const hit=path.nearest(...pos);if(hit.distance>4)continue;
   const pose=path.sample(hit.s).position,previous=overrides.get(k);if(!previous||hit.distance<previous.distance)overrides.set(k,{distance:hit.distance,position:pose});
   if(hit.s>.05&&hit.s<path.length-.05&&!protectedIds.has(road.id))hits.push({s:hit.s,node:k});
  }
  if(hits.length)cuts.set(road.id,hits.sort((a,b)=>a.s-b.s).filter((x,i,a)=>i===0||x.s-a[i-1].s>.05));
 }
 function xy(id){const q=overrides.get(String(id))?.position;if(q)return [q[0],q[2]];return locate(id);}
 function nearbyNode(way,p){let best;for(const id of way?.nodes||[]){const q=xy(id);if(!q)continue;const d=Math.hypot(q[0]-p[0],q[1]-p[2]);if(d<4&&(!best||d<best.distance))best={id:String(id),distance:d,position:q};}return best;}
 const roads=[];
 for(const original of originalRoads){const way=ways.get(sourceId(original.id)),tag=way?.tags||{},raw=original.points;if(!raw?.length)continue;
  const path=new Polyline(raw),breaks=[{s:0,node:nearbyNode(way,raw[0])?.id},...(cuts.get(original.id)||[]),{s:path.length,node:nearbyNode(way,raw.at(-1))?.id}];
  for(let i=1;i<breaks.length;i++){const a=breaks[i-1],b=breaks[i];if(b.s-a.s<.05)continue;
   const pts=[path.sample(a.s).position,...raw.filter((_,j)=>path.lengths[j]>a.s+.001&&path.lengths[j]<b.s-.001).map(p=>[...p]),path.sample(b.s).position];
   for(const [index,key] of [[0,a.node],[pts.length-1,b.node]])if(key){const q=xy(key);pts[index][0]=q[0];pts[index][2]=q[1];}
   const protectedProfile=protectedIds.has(original.id),points=pts.map(p=>[p[0],protectedProfile?p[1]:terrain.raw(p[0],p[2])+.12,p[2]]);
   const id=breaks.length===2?original.id:`${original.id}/piece/${i-1}`;
   roads.push({...original,id,sourceId:original.id,points,bounds:bounds(points),connectionNodes:[a.node?nodeKey(a.node):undefined,b.node?nodeKey(b.node):undefined],oneway:tag.oneway==='yes'||tag.oneway==='1'||tag.junction==='roundabout'?1:tag.oneway==='-1'?-1:0,sourceTags:tag,protectedProfile});
  }
 }
 const legacyWays=new Set(oldByWay.keys()),added=[];
 for(const w of roadWays){if(legacyWays.has(String(w.id)))continue;const points=w.nodes.map(n=>xy(n));if(points.some(p=>!p))continue;
  const probe=points.map(p=>[p[0],0,p[1]]);if(!nearestRoute(route,probe,950))continue;
  const breaks=[0];for(let i=1;i<w.nodes.length-1;i++)if((members.get(String(w.nodes[i]))?.size||0)>1)breaks.push(i);breaks.push(w.nodes.length-1);
  for(let j=1;j<breaks.length;j++){const from=breaks[j-1],to=breaks[j],ps=points.slice(from,to+1).map(p=>[p[0],terrain.raw(p[0],p[1])+.12,p[1]]);if(distance(ps[0],ps.at(-1))<.05)continue;
   const tags=w.tags,kind=tags.highway,bridge=tags.bridge&&tags.bridge!=='no',tunnel=tags.tunnel&&tags.tunnel!=='no';
   const feature={id:`osm-road/${w.id}/${from}-${to}`,sourceWayId:String(w.id),points:ps,bounds:bounds(ps),width:widthOf(tags),kind,name:tags.name||'',connectionNodes:[nodeKey(w.nodes[from]),nodeKey(w.nodes[to])],sourceTags:{highway:kind,bridge:tags.bridge,tunnel:tags.tunnel,layer:tags.layer,oneway:tags.oneway},oneway:tags.oneway==='yes'||tags.oneway==='1'||tags.junction==='roundabout'?1:tags.oneway==='-1'?-1:0,confidence:'2026 OSM way/node geometry; height is modelled'};
   if(bridge){const path=new Polyline(ps),mid=path.sample(path.length/2),near=route.project(mid.position[0],mid.position[2],100),track=route.sample(near.s),cross=Math.abs(mid.tangent[0]*track.tangent[2]-mid.tangent[2]*track.tangent[0]);
    const required=near.distance<Math.abs(route.laneOffset(near.s,4.2))+12&&cross>.35&&!route.tunnelAt(near.s)?track.position[1]+6.3:Math.max(ps[0][1],ps.at(-1)[1],terrain.raw(mid.position[0],mid.position[2])+2);
    feature.points=ps.map(p=>[p[0],Math.max(p[1],required),p[2]]);feature.elevationMode='over';
   }else if(tunnel&&tunnel!=='building_passage'){feature.elevationMode='tunnel';feature.points=ps.map(p=>[p[0],p[1]-5.5,p[2]]);}
   added.push(feature);
  }
 }
 route.data.surfaceRoads=[...roads,...added];
 const resolved=[];
 for(const feature of route.data.surfaceRoads){const cooked=engineerSurfaceRoad(feature,route,terrain);if(!cooked)continue;const {path,...profile}=cooked;resolved.push({...feature,...profile,profileResolved:true});}
 // Some old source ways double back over exactly the same two-way segment.
 // Collapse only identical geometry and mapped end nodes from the same source;
 // retain every duplicate ID as an alias. Ambiguous/one-way overlaps remain.
 const unique=[],duplicates=new Map();let collapsedDuplicates=0;
 for(const r of resolved){
  const nodes=r.connectionNodes||[],source=r.sourceId||r.sourceWayId;
  if(r.mode!=='ground'||r.protectedProfile||r.oneway||!source||nodes.length!==2||nodes.some(n=>!n)){unique.push(r);continue;}
  const coords=r.points.map(p=>`${Math.round(p[0]*100)},${Math.round(p[1]*32)},${Math.round(p[2]*100)}`),a=coords.join(';'),b=[...coords].reverse().join(';'),key=[source,r.kind,r.width,...[...nodes].sort(),a<b?a:b].join('|'),prior=duplicates.get(key);
  if(prior){(prior.sourceAliases??=[]).push(r.id);collapsedDuplicates++;}else{duplicates.set(key,r);unique.push(r);}
 }
 resolved.splice(0,resolved.length,...unique);
 const gradeRepair=resolveRoadGrades(resolved);
 const {adjustments:gradeAdjustments,exceptions:gradeExceptions,...gradeSummary}=gradeRepair;
 for(const r of resolved){r.bounds=bounds(r.points);r.template=catalogId(r);}
 // Add missing geometry to every intersected 1 km chunk, with one rendering
 // owner per piece. Split only at tile edges so roads never disappear at seams.
 for(const tile of tiles.values())tile.roads=[];
 const tiled=[];
 for(const road of resolved){const path=new Polyline(road.points);let current=[road.points[0]],startNode=road.connectionNodes?.[0],piece=0,startS=0;
  const flush=(endNode,endS)=>{const next=()=>{piece++;startNode=endNode;startS=endS;};if(current.length<2||distance(current[0],current.at(-1))<.03){next();return;}const sample=new Polyline(current),mid=sample.sample(sample.length/2).position,x=Math.floor(mid[0]/1000),z=Math.floor(mid[2]/1000),tile=tiles.get(`${x}_${z}`);if(!tile){next();return;}
   const id=piece===0&&endS>=path.length-.001?road.id:`${road.id}/tile/${piece}`,crossingS=road.crossingS===undefined?undefined:road.crossingS-startS;
   // The first and last point are the port anchors; fixed-point direction
   // vectors avoid duplicating full coordinate objects in every saved tile.
   const vec=(a,b)=>{const dx=b[0]-a[0],dy=b[1]-a[1],dz=b[2]-a[2],n=Math.hypot(dx,dy,dz)||1;return [dx,dy,dz].map(v=>Math.round(v/n*10000));};
   const {sourceTags,confidence,protectedProfile,profileResolved,inferred,...compact}=road;
   const item={...compact,id,points:current,bounds:bounds(current),connectionNodes:[startNode,endNode],portVectors:[vec(current[0],current[1]),vec(current.at(-1),current.at(-2))],occupancy:occupiedQuarters(current,road.width/2),minLevel:Math.round(Math.min(...current.map(p=>p[1]))*32),maxLevel:Math.round((Math.max(...current.map(p=>p[1]))+5)*32),asset:'existing/road-surface',crossingS};
   if(crossingS!==undefined&&(crossingS<-.01||crossingS>endS-startS+.01))item.structureOwner=false;
   if(!item.name)delete item.name;if(item.sourceId===item.id)delete item.sourceId;
   tile.roads.push(item);tiled.push(item);next();};
  for(let i=1;i<road.points.length;i++){const a=road.points[i-1],b=road.points[i],ts=[];
   for(const axis of [0,2]){const lo=Math.min(a[axis],b[axis]),hi=Math.max(a[axis],b[axis]);for(let edge=Math.floor(lo/1000+1)*1000;edge<hi-.001;edge+=1000){const t=(edge-a[axis])/(b[axis]-a[axis]);if(t>.00001&&t<.99999)ts.push(t);}}
   for(const t of [...new Set(ts)].sort((a,b)=>a-b)){const p=a.map((v,k)=>v+(b[k]-v)*t),s=path.lengths[i-1]+(path.lengths[i]-path.lengths[i-1])*t,key=`seam/${road.id}/${i}/${t.toFixed(6)}`;current.push(p);flush(key,s);current=[p];}
   current.push(b);
  }
  flush(road.connectionNodes?.[1],path.length);
 }
 route.data.surfaceRoads=tiled;
 const junctions=[];const groups=new Map();for(const r of tiled)if(r.mode!=='over'&&r.mode!=='tunnel')for(const end of[0,1]){const key=r.connectionNodes?.[end];if(!key?.startsWith('osm/'))continue;const list=groups.get(key)||[];list.push({id:r.id,point:r.points[end?r.points.length-1:0],width:r.width,kind:r.kind});groups.set(key,list);}
 for(const [node,legs]of groups)if(legs.filter(l=>motor.has(l.kind)).length>=3)junctions.push({id:`junction/${node}`,template:'road/junction',position:legs[0].point,ports:legs.map(l=>l.id).sort(),radius:Math.min(8,Math.max(...legs.map(l=>l.width))/2+.4)});
 // OSM tags correct generic building types without inventing new placements.
 let matchedBuildings=0,addedBuildings=0;
 const known=new Set();for(const tile of tiles.values())for(const b of tile.buildings){const id=sourceId(b.sourceId||b.id);if(id)known.add(id);const tags=ways.get(id)?.tags;if(tags?.building){b.buildingType=tags.building;if(tags['building:levels'])b.buildingLevels=tags['building:levels'];if(tags.height)b.sourceHeight=parseFloat(tags.height);if(tags.amenity)b.buildingUse=tags.amenity;else if(tags.shop)b.buildingUse=`shop:${tags.shop}`;matchedBuildings++;}}
 for(const w of ways.values()){if(!w.tags?.building||known.has(String(w.id))||w.nodes.length<4||w.nodes[0]!==w.nodes.at(-1)||!w.nodes.every(n=>nodes.has(String(n))))continue;const fp=w.nodes.slice(0,-1).map(n=>locate(n));if(fp.length<3||fp.some(p=>!p))continue;const ps=fp.map(p=>[p[0],0,p[1]]);if(!nearestRoute(route,ps,550))continue;const x=fp.reduce((s,p)=>s+p[0],0)/fp.length,z=fp.reduce((s,p)=>s+p[1],0)/fp.length,tile=tiles.get(`${Math.floor(x/1000)}_${Math.floor(z/1000)}`);if(!tile)continue;
  tile.buildings.push({id:`way/${w.id}`,footprint:fp,buildingType:w.tags.building,buildingLevels:w.tags['building:levels'],buildingUse:w.tags.amenity||(w.tags.shop?`shop:${w.tags.shop}`:undefined),sourceHeight:w.tags.height?parseFloat(w.tags.height):undefined,name:w.tags.name||'',confidence:'OSM building footprint and tags; untagged height inferred'});known.add(String(w.id));addedBuildings++;
 }
 const nodesWithDegree=[...members.values()].filter(ids=>ids.size>=3).length;
 return {sources,roads:tiled,junctions,gradeAdjustments,gradeExceptions,stats:{snapshots:files.length,sourceWays:roadWays.length,addedRoadPieces:added.length,existingRoadPieces:roads.length,collapsedDuplicateRoadPieces:collapsedDuplicates,gradeRepair:gradeSummary,tiledRoadPieces:tiled.length,sourceJunctions:nodesWithDegree,renderedJunctions:junctions.length,matchedBuildings,addedBuildings}};
}
