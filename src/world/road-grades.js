/** Keep explicitly engineered crossings fixed while distributing excess ground
 * road grade over connected, inferred approaches. Plan coordinates never move. */
const planKey=p=>`plan/${Math.round(p[0]*100)}/${Math.round(p[2]*100)}/${Math.round(p[1]*2)}`;
const planDistance=(a,b)=>Math.hypot(b[0]-a[0],b[2]-a[2]);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const smooth=t=>{t=clamp(t,0,1);return t*t*(3-2*t);};
const eligible=r=>r.mode==='ground'&&!r.protectedProfile&&r.width>=3&&!['footway','path','steps','cycleway','pedestrian','corridor','bridleway'].includes(r.kind);

export function resolveRoadGrades(roads,{maxGrade=.18,maxShift=8,iterations=48}={}){
 const endpoints=new Map(),ends=new Map();
 for(const r of roads){const keys=[];for(const end of [0,1]){const p=r.points[end?r.points.length-1:0],key=r.connectionNodes?.[end]||planKey(p),entries=endpoints.get(key)||[];entries.push({r,end,p});endpoints.set(key,entries);keys.push(key);}ends.set(r,keys);}
 const nodes=new Map();
 for(const [key,entries] of endpoints){
  const authored=entries.filter(e=>e.r.protectedProfile),bridge=entries.filter(e=>e.r.mode==='over'),lower=entries.filter(e=>e.r.mode==='tunnel'||e.r.mode==='under'),crossing=entries.filter(e=>e.r.mode==='crossing');
  const selected=authored.length?authored:bridge.length?bridge:lower.length?lower:crossing.length?crossing:entries,target=selected.reduce((s,e)=>s+e.p[1],0)/selected.length;
  nodes.set(key,{target,base:target,fixed:Boolean(authored.length||bridge.length||lower.length||crossing.length)});
 }
 const constraints=[];for(const r of roads){if(!eligible(r))continue;const length=r.points.slice(1).reduce((s,p,i)=>s+planDistance(r.points[i],p),0),[a,b]=ends.get(r).map(k=>nodes.get(k));if(a!==b&&length>.05)constraints.push({r,a,b,limit:maxGrade*length});}
 for(let pass=0;pass<iterations;pass++){
  let largest=0;
  for(const {a,b,limit} of constraints){const difference=b.target-a.target,excess=Math.abs(difference)-limit;if(excess<=.0001||a.fixed&&b.fixed)continue;largest=Math.max(largest,excess);const sign=Math.sign(difference);
   const move=(node,amount)=>{const before=node.target;node.target=clamp(before+amount,node.base-maxShift,node.base+maxShift);return Math.abs(node.target-before);};
   let remaining=excess;if(!a.fixed&&!b.fixed){remaining-=move(a,sign*excess/2);remaining-=move(b,-sign*remaining);if(remaining>.0001)remaining-=move(a,sign*remaining);}
   else if(!a.fixed)remaining-=move(a,sign*remaining);else remaining-=move(b,-sign*remaining);
  }
  if(largest<.0001)break;
 }
 const adjustments=[];let maximumNodeShift=0;for(const [node,n] of nodes){const shift=Math.abs(n.target-n.base);if(shift>.001)adjustments.push({node,from:Number(n.base.toFixed(3)),to:Number(n.target.toFixed(3))});maximumNodeShift=Math.max(maximumNodeShift,shift);}
 const exceptions=[];let boundedProfiles=0;
 for(const r of roads){
  const path=r.points,keys=ends.get(r),goals=keys.map(k=>nodes.get(k).target),lengths=[0];for(let i=1;i<path.length;i++)lengths.push(lengths.at(-1)+planDistance(path[i-1],path[i]));const length=lengths.at(-1),a=goals[0]-path[0][1],b=goals[1]-path.at(-1)[1];
  r.points=path.map((p,i)=>{const s=lengths[i],t=length<80?s/(length||1):null,wa=t===null?1-smooth(s/40):1-smooth(t),wb=t===null?1-smooth((length-s)/40):smooth(t);return[p[0],p[1]+a*wa+b*wb,p[2]];});
  if(!eligible(r)||length<=.05)continue;
  if(Math.abs(goals[1]-goals[0])>maxGrade*length+.001){exceptions.push({id:r.id,nodes:keys,grade:Number((Math.abs(goals[1]-goals[0])/length).toFixed(3))});continue;}
  let changed=false;for(let pass=0;pass<3;pass++){
   for(let i=1;i<r.points.length-1;i++){const limit=maxGrade*(lengths[i]-lengths[i-1]),old=r.points[i][1],y=clamp(old,r.points[i-1][1]-limit,r.points[i-1][1]+limit);if(Math.abs(y-old)>.0001)changed=true;r.points[i][1]=y;}
   for(let i=r.points.length-2;i>0;i--){const limit=maxGrade*(lengths[i+1]-lengths[i]),old=r.points[i][1],y=clamp(old,r.points[i+1][1]-limit,r.points[i+1][1]+limit);if(Math.abs(y-old)>.0001)changed=true;r.points[i][1]=y;}
  }if(changed)boundedProfiles++;
 }
 return {adjustedNodes:adjustments.length,maximumNodeShift:Number(maximumNodeShift.toFixed(3)),unresolvedGroundGrades:exceptions.length,boundedProfiles,maxGroundGrade:maxGrade,maxNodeShift:maxShift,adjustments,exceptions};
}
