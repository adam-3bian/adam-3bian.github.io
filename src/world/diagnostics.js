/** Read-only diagnostics. Findings identify candidates for review; source-node
 * dead ends, sharp road corners and inferred grades are not automatically errors. */
import {anchor} from './grid.js';
import {resolveAsset} from './asset-registry.js';

export function inspectGridWorld(route,terrainHeight){
 const nodeGroups=new Map(),ids=new Set(),geometry=new Map(),errors=[],warnings={unconnected:[],tangent:[],radius:[],gradient:[],duplicate:[],terrain:[],crossing:[]};
 const totals={railPieces:0,tramPieces:0,roadPieces:0,unconnected:0,unmappedEndpoints:0,unconnectedMapped:0,tangent:0,radius:0,gradient:0,duplicate:0,terrain:0,crossing:0};
 const knownTemplates=new Set((route.construction?.catalog||[]).map(x=>x.id));
 const addWarning=(kind,value)=>{totals[kind]++;if(warnings[kind].length<40)warnings[kind].push(value);};
 const vector=v=>{if(!Array.isArray(v)||v.length!==3||v.some(n=>!Number.isFinite(n)))return;const n=Math.hypot(...v);return n?v.map(x=>x/n):undefined;};
 const add=(item,mode,points,ports)=>{
  if(ids.has(`${mode}/${item.id}`))errors.push({id:item.id,reason:'duplicate identity'});ids.add(`${mode}/${item.id}`);
  if(!Array.isArray(points)||points.length<2||points.some(p=>!Array.isArray(p)||p.length!==3||!p.every(Number.isSafeInteger))){errors.push({id:item.id,reason:'invalid grid anchors'});return;}
  if(item.template&&!knownTemplates.has(item.template)&&!item.template.includes('/reference/'))errors.push({id:item.id,reason:`unrecognised template ${item.template}`});
  if(item.asset&&!resolveAsset(item.asset))errors.push({id:item.id,reason:`unrecognised asset ${item.asset}`});
  for(const asset of Object.values(item.assets||{}))if(!resolveAsset(asset))errors.push({id:item.id,reason:`unrecognised asset ${asset}`});
  const forward=points.map(p=>p.join(',')).join(';'),back=[...points].reverse().map(p=>p.join(',')).join(';'),key=`${mode}/${forward<back?forward:back}`,previous=geometry.get(key);
  if(previous)addWarning('duplicate',{id:item.id,other:previous,mode});else geometry.set(key,item.id);
  for(let i=1;i<points.length;i++){const a=points[i-1],b=points[i],plan=Math.hypot((b[0]-a[0])/100,(b[2]-a[2])/100);if(plan<.05)continue;const grade=Math.abs((b[1]-a[1])/32/plan),limit=mode==='road'?.25:.06;if(grade>limit)addWarning('gradient',{id:item.id,mode,grade:Number(grade.toFixed(3))});}
  if(mode!=='road')for(let i=1;i<points.length-1;i++){const a=points[i-1],b=points[i],c=points[i+1],ab=Math.hypot(b[0]-a[0],b[2]-a[2])/100,bc=Math.hypot(c[0]-b[0],c[2]-b[2])/100,ac=Math.hypot(c[0]-a[0],c[2]-a[2])/100,cross=Math.abs((b[0]-a[0])*(c[2]-a[2])-(b[2]-a[2])*(c[0]-a[0]))/10000;if(Math.min(ab,bc)<.5||cross<.01)continue;const radius=ab*bc*ac/(2*cross);if(radius<12)addWarning('radius',{id:item.id,mode,metres:Number(radius.toFixed(2)),note:'tight sample; verify the intended geometry and scale'});}
  ports.forEach((port,end)=>{if(!port?.node)return;const expected=points[end?points.length-1:0];if(port.anchor?.some((n,i)=>n!==expected[i]))errors.push({id:item.id,reason:'port does not match endpoint'});const node=`${mode}/${port.node}`,entries=nodeGroups.get(node)||[];entries.push({id:item.id,anchor:expected,vector:vector(port.vector),mapped:port.mapped!==false});nodeGroups.set(node,entries);});
  if(mode!=='road'&&terrainHeight&&points.length){const mid=points[Math.floor(points.length/2)],x=mid[0]/100,z=mid[2]/100,y=mid[1]/32,ground=terrainHeight(x,z);if(Number.isFinite(ground)&&Math.abs(ground-y)>18&&!/bridge|tunnel/.test(item.template||''))addWarning('terrain',{id:item.id,railHeight:y,terrainHeight:Number(ground.toFixed(2)),note:'check earthwork or a missing structure'});}
 };
 for(const p of route.gridPieces||[]){const mode=p.ports?.[0]?.mode||'rail';totals[mode==='tram'?'tramPieces':'railPieces']++;add(p,mode,p.anchors,p.ports||[]);}
 for(const r of route.surfaceRoads||[]){totals.roadPieces++;const points=(r.points||[]).map(anchor),ports=[0,1].map(i=>({node:r.connectionNodes?.[i]||`${r.id}/unmapped/${i}`,mapped:Boolean(r.connectionNodes?.[i]),anchor:points[i?points.length-1:0],vector:r.portVectors?.[i]}));add(r,'road',points,ports);if(r.mode==='crossing'&&(!Number.isFinite(r.routeS)||!(route.crossings||[]).some(c=>Math.abs(c.s-r.routeS)<220)))addWarning('crossing',{id:r.id,note:'level crossing lacks a nearby matching railway crossing record'});}
 for(const item of [...(route.landmarks||[]),...(route.bufferStops||[])])if(item.asset&&!resolveAsset(item.asset))errors.push({id:item.id,reason:`unrecognised asset ${item.asset}`});
 for(const [node,entries] of nodeGroups){
  const first=entries[0];if(entries.some(e=>e.anchor.some((v,i)=>v!==first.anchor[i])))errors.push({node,reason:'shared node has mismatched anchors'});
  if(entries.length===1){totals[first.mapped?'unconnectedMapped':'unmappedEndpoints']++;addWarning('unconnected',{node,piece:first.id,note:first.mapped?'may be a legitimate end or a clipped boundary':'source node unknown; spatial fallback is not assessed here'});}
  else if(entries.length===2&&first.vector&&entries[1].vector){const dot=first.vector.reduce((s,v,i)=>s+v*entries[1].vector[i],0);if(dot>-.966)addWarning('tangent',{node,pieces:entries.map(e=>e.id),degrees:Number((Math.acos(Math.max(-1,Math.min(1,-dot)))*180/Math.PI).toFixed(1))});}
 }
 return {scope:'Grid/source consistency diagnostics; warnings need site review and are not proof of defects.',totals,errors,warnings};
}
