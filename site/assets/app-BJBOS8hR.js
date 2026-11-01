(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))n(s);new MutationObserver(s=>{for(const r of s)if(r.type==="childList")for(const a of r.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&n(a)}).observe(document,{childList:!0,subtree:!0});function t(s){const r={};return s.integrity&&(r.integrity=s.integrity),s.referrerPolicy&&(r.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?r.credentials="include":s.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function n(s){if(s.ep)return;s.ep=!0;const r=t(s);fetch(s.href,r)}})();const at=(i,e,t)=>Math.max(e,Math.min(t,i)),ft=(i,e,t)=>i+(e-i)*t,aa=i=>{const e=at(i,0,1);return e*e*(3-2*e)},Lh=i=>i*2.2369362921,Es=i=>i/2.2369362921;function Nn(i){let e=2166136261;for(const t of String(i))e^=t.charCodeAt(0),e=Math.imul(e,16777619);return e>>>0}function Ni(i){const e=i.right,t=i.tangent,n=[e[1]*t[2]-e[2]*t[1],e[2]*t[0]-e[0]*t[2],e[0]*t[1]-e[1]*t[0]],s=Math.hypot(...n)||1,r=Math.cos(i.bank),a=Math.sin(i.bank);return[e[0]*r+n[0]/s*a,e[1]*r+n[1]/s*a,e[2]*r+n[2]/s*a]}function hc(i){const e=Ni(i),t=i.tangent,n=[e[1]*t[2]-e[2]*t[1],e[2]*t[0]-e[0]*t[2],e[0]*t[1]-e[1]*t[0]],s=Math.hypot(...n)||1;return n.map(r=>r/s)}class ht{constructor(e){if(this.points=e,e.length<2)throw new Error("A path needs at least two points");this.lengths=new Float64Array(e.length);for(let t=1;t<e.length;t++)this.lengths[t]=this.lengths[t-1]+Math.hypot(...e[t].map((n,s)=>n-e[t-1][s]));this.length=this.lengths[this.lengths.length-1],this.frames=new Float64Array(e.length*4);for(let t=0;t<e.length-1;t++){const n=e[t],s=e[t+1],r=e[Math.max(0,t-1)],a=e[Math.min(e.length-1,t+2)],o=a[0]-r[0],l=a[1]-r[1],c=a[2]-r[2],u=Math.hypot(o,c)||1,f=e[Math.max(0,t-3)],d=e[Math.min(e.length-1,t+4)],h=n[0]-f[0],p=n[2]-f[2],v=d[0]-s[0],m=d[2]-s[2],g=Math.hypot(h,p)*Math.hypot(v,m);this.frames.set([o/u,l/u,c/u,g>1?at(-(h*m-p*v)/g*.12,-.075,.075):0],t*4)}this.frames.set(this.frames.subarray((e.length-2)*4,(e.length-1)*4),(e.length-1)*4)}points;lengths;length;frames;segment(e){let t=0,n=this.points.length-2;for(;t<n;){const s=t+n+1>>1;this.lengths[s]<=e?t=s:n=s-1}return t}sample(e,t=0){const n=at(e,0,this.length),s=this.segment(n),r=this.points[s],a=this.points[s+1],o=this.lengths[s+1]-this.lengths[s],l=o?(n-this.lengths[s])/o:0,c=ft(this.frames[s*4],this.frames[(s+1)*4],l),u=ft(this.frames[s*4+1],this.frames[(s+1)*4+1],l),f=ft(this.frames[s*4+2],this.frames[(s+1)*4+2],l),d=Math.hypot(c,f)||1,h=[c/d,u/d,f/d],p=[-h[2],0,h[0]],v=ft(this.frames[s*4+3],this.frames[(s+1)*4+3],l),m=e-n;return{position:[ft(r[0],a[0],l)+p[0]*t+h[0]*m,ft(r[1],a[1],l)+h[1]*m,ft(r[2],a[2],l)+p[2]*t+h[2]*m],tangent:h,right:p,grade:u/d,yaw:Math.atan2(-h[0],-h[2]),pitch:Math.atan2(u,d),bank:v,s:e}}nearest(e,t,n){let s=0,r=this.points.length-1;n!==void 0&&(s=this.segment(Math.max(0,n-150)),r=Math.min(r,this.segment(n+150)+2));let a=1/0,o=0,l=0;for(let c=s;c<r;c++){const u=this.points[c],f=this.points[c+1],d=f[0]-u[0],h=f[2]-u[2],p=at(((e-u[0])*d+(t-u[2])*h)/(d*d+h*h||1),0,1),v=u[0]+p*d,m=u[2]+p*h,g=Math.hypot(e-v,t-m);g<a&&(a=g,o=ft(this.lengths[c],this.lengths[c+1],p),l=((e-v)*-h+(t-m)*d)/Math.hypot(d,h))}return{s:o,distance:a,side:l}}}class Dh extends ht{constructor(e){super(e.points),this.data=e,this.fingerprint=Nn(JSON.stringify({simulation:"2026-v3",points:e.points,opposing:e.opposingOffsets||null,stations:e.stations.map(n=>[n.id,n.s]),network:e.network,crossings:e.crossings,structures:e.structures})).toString(16);const t=e.opposingTrack?.points;t?.length===e.points.length&&(this.opposingPath=new ht(t)),this.stations=e.stations.map(n=>({...n,s:Number.isFinite(n.s)?this.sourceS(n.s):this.nearest(n.position[0],n.position[2]).s,length:n.length||150,platformCount:n.platformCount||2})).sort((n,s)=>n.s-s.s);for(let n=0;n<this.points.length-1;n++){const s=this.points[n],r=`${Math.floor(s[0]/100)},${Math.floor(s[2]/100)}`,a=this.buckets.get(r)||[];a.push(n),this.buckets.set(r,a)}}data;stations;fingerprint;opposingPath;endpointPaths=new Map;buckets=new Map;sourceS(e){const t=this.data.chainages;if(!t)return e;let n=0,s=t.length-2;for(;n<s;){const r=n+s+1>>1;t[r]<=e?n=r:s=r-1}return ft(this.lengths[n],this.lengths[n+1],at((e-t[n])/(t[n+1]-t[n]||1),0,1))}laneOffset(e,t){if(t===0)return 0;const n=this.data.opposingOffsets;if(!n||n.length!==this.points.length)return t;const s=this.segment(at(e,0,this.length)),r=at((e-this.lengths[s])/(this.lengths[s+1]-this.lengths[s]||1),0,1);return ft(n[s],n[s+1],r)}setEndpointContext(e){for(const t of e){const n=t.metadata;n?.contextOnly&&this.endpointPaths.set(`${n.lane}/${n.atEnd}`,{path:t.path||new ht(t.points),right:n.endpointRight,bank:Number(n.endpointBank)||0})}}laneArc(e,t){if(t===0||!this.opposingPath||e<0)return e;if(e>this.length)return this.opposingPath.length+e-this.length;const n=this.segment(e),s=(e-this.lengths[n])/(this.lengths[n+1]-this.lengths[n]||1);return ft(this.opposingPath.lengths[n],this.opposingPath.lengths[n+1],s)}travel(e,t,n){if(n===0||!this.opposingPath)return e+t;const s=this.laneArc(e,n)+t;if(s<0)return s;if(s>this.opposingPath.length)return this.length+s-this.opposingPath.length;const r=this.opposingPath.segment(s),a=(s-this.opposingPath.lengths[r])/(this.opposingPath.lengths[r+1]-this.opposingPath.lengths[r]||1);return ft(this.lengths[r],this.lengths[r+1],a)}laneDistance(e,t,n){return this.laneArc(t,n)-this.laneArc(e,n)}lanePose(e,t){if(e<0||e>this.length){const n=e>this.length,s=this.endpointPaths.get(`${t}/${n}`);if(s){const r=n?e-this.length:-e,a=s.path.sample(r),o=at(r/25,0,1),l=n?1:-1;if(s.right){const c=ft(s.right[0],a.right[0],o),u=ft(s.right[2],a.right[2],o),f=Math.hypot(c,u)||1;a.right=[c/f,0,u/f],a.bank=ft(s.bank,a.bank,o)}return a.tangent=a.tangent.map(c=>c*l),a.right=a.right.map(c=>c*l),a.bank*=l,a.grade*=l,a.yaw=Math.atan2(-a.tangent[0],-a.tangent[2]),a.pitch=Math.atan2(a.grade,1),a.s=e,a}}if(t!==0&&this.opposingPath){const n=this.opposingPath.sample(this.laneArc(e,t));return n.s=e,n}return this.sample(e,t===0?0:this.laneOffset(e,t))}railPosition(e,t,n){const s=this.lanePose(e,t),r=Ni(s);return s.position.map((a,o)=>a+r[o]*n)}project(e,t,n=150){const s=Math.floor(e/100),r=Math.floor(t/100);let a=1/0,o=0,l=0;const c=Math.ceil(n/100);for(let u=-c;u<=c;u++)for(let f=-c;f<=c;f++)for(const d of this.buckets.get(`${s+u},${r+f}`)||[]){const h=this.points[d],p=this.points[d+1],v=p[0]-h[0],m=p[2]-h[2],g=at(((e-h[0])*v+(t-h[2])*m)/(v*v+m*m||1),0,1),x=e-h[0]-v*g,M=t-h[2]-m*g,S=Math.hypot(x,M);S<a&&(a=S,o=ft(this.lengths[d],this.lengths[d+1],g),l=(x*-m+M*v)/(Math.hypot(v,m)||1))}return{s:o,distance:a,side:l}}limit(e){const t=this.stations.find(r=>Math.abs(r.s-e)<400);if(t?.id==="BSW"||t?.id==="BMO")return 25;const n=this.stations.find(r=>r.id==="BSW")?.s||this.length*.6,s=this.stations.find(r=>r.id==="SBJ")?.s||1e4;return Math.abs(e-n)<1400?30:e<s?65:e<n?55:70}tunnelAt(e){return(this.data.tunnels||[]).find(t=>e>this.sourceS(t.start)&&e<this.sourceS(t.end))}}const Ih=[{id:"hagley-covered-footbridge",station:"HAG",deck:"way/240115500/0",stairs:["way/240115501/0","way/240115499/0"],covered:!0,palette:"historic-purple",reference:"references/by-location/hagley/hagley-covered-footbridge-original-0133.jpg",confidence:"source plan and reference form; engineered heights and stair extension are inferred"}],Nh=[{id:"hagley-brake-lane",span:"way/184620647/0",approaches:["way/150242118/0","way/157158203/0"],reference:"references/by-location/hagley/hagley-brake-lane-arch-original-0137.jpg",confidence:"source road geometry and reference arch; modelled span, soffit, profile and foundation levels are inferred",form:"masonry-arch",deckAboveRail:6.3,transitionLength:100,archSpring:2.9,archRise:3.2}],uc={access:Ih,roadBridges:Nh},Wo=uc.roadBridges,Xo=new WeakMap;function Uh(i,e){if(!Wo.some(n=>[n.span,...n.approaches].includes(i.id)))return null;let t=Xo.get(e);if(!t){t=new Map,Xo.set(e,t);const n=new Map((e.data.surfaceRoads||[]).map(s=>[s.id,s]));for(const s of Wo){const r=[s.approaches[0],s.span,s.approaches[1]].map(h=>n.get(h));if(r.some(h=>!h?.points?.length))continue;const a=[];for(const h of r){const p=h.points;if(a.length&&Math.hypot(a.at(-1)[0]-p[0][0],a.at(-1)[2]-p[0][2])>.01)throw new Error(`${s.id}: JOIN-01 road approach endpoints do not match`);a.push(...a.length?p.slice(1):p)}const o=new ht(a),l=new ht(r[1].points),c=l.sample(l.length/2).position,u=o.nearest(c[0],c[2]),f=e.project(c[0],c[2],100),d=e.sample(f.s).position[1]+s.deckAboveRail;for(const h of r){const p=h.points.map(g=>{const x=o.nearest(g[0],g[2]),M=Math.abs(x.s-u.s),S=1-aa(at((M-l.length/2)/s.transitionLength,0,1));return[g[0],g[1]+(d-g[1])*S,g[2]]}),v=new ht(p),m=h.id===s.span;t.set(h.id,{id:h.id,kind:String(h.kind),width:Number(h.width)||5.5,points:p,path:v,mode:m?"over":"ground",sourceStructure:s.id,inferred:!0,...m?{crossingS:v.nearest(c[0],c[2]).s,routeS:f.s,spanHalfLength:v.length/2}:{}})}}}return t.get(i.id)||null}class Fh{constructor(e,t){if(this.meta=e,this.pixels=t,t.length!==e.width*e.height)throw new Error("Heightmap dimensions do not match data.")}meta;pixels;raw(e,t){const{origin:n,step:s,width:r,height:a,offset:o,scale:l}=this.meta,c=at((e-n[0])/s,0,r-1.001),u=at((t-n[1])/s,0,a-1.001),f=Math.floor(c),d=Math.floor(u),h=c-f,p=u-d,m=[d*r+f,d*r+f+1,(d+1)*r+f,(d+1)*r+f+1].map(M=>this.pixels[M]===0?NaN:o+(this.pixels[M]-1)*l),g=m.find(Number.isFinite)??100,x=m.map(M=>Number.isFinite(M)?M:g);return ft(ft(x[0],x[1],h),ft(x[2],x[3],h),p)}}function Oh(i,e){if(!i.points||i.points.length<2)return null;const t=Uh(i,e);if(t)return t;const n=i.points.map(m=>[...m]),s=new ht(n),r={id:i.id,kind:String(i.kind||"residential"),width:Number(i.width)||5.6,points:n,path:s,mode:"ground",inferred:!1},a=["footway","path","steps","cycleway","pedestrian"].includes(r.kind);a&&(r.width=Math.min(2.2,r.width));const o=i.gradeRelations||[],l=o.find(m=>m.relation==="on"&&e.data.structures.some(g=>g.id===m.structure&&(g.type==="footbridge"||g.type==="roadBridge")))||o.find(m=>m.relation==="under"&&e.data.structures.some(g=>g.id===m.structure&&g.type==="railBridge"));if(l){const m=e.data.structures.find(M=>M.id===l.structure);let g=0,x=1/0;if(n.forEach((M,S)=>{const w=Math.hypot(M[0]-m.position[0],M[2]-m.position[2]);w<x&&(x=w,g=S)}),x<Math.max(30,Number(m.length)||30)){r.mode=l.relation==="on"?"over":"under",r.sourceStructure=m.id,r.inferred=!0,r.crossingS=s.lengths[g],r.spanHalfLength=Math.max(4,(Number(m.length)||25)/2+2);const M=e.project(m.position[0],m.position[2]);r.routeS=M.s;const S=e.sample(M.s).position[1];let w=l.y;M.distance<12&&(w=r.mode==="over"?Math.max(w,S+(a?5.8:6.3)):Math.min(w,S-5.8));const T=Math.max(r.spanHalfLength+35,Math.abs(w-n[g][1])*(a?12:22));for(let _=0;_<n.length;_++){const b=Math.abs(s.lengths[_]-r.crossingS),P=1-aa((b-r.spanHalfLength)/T);n[_][1]=ft(n[_][1],w,P)}return r.path=new ht(n),r}}if(a)return r;let c=null;for(let m=0;m<n.length;m++){const g=n[m],x=e.project(g[0],g[2]);if(x.distance<7&&(!c||x.distance<c.d)){const M=e.sample(x.s),S=n[Math.max(0,m-1)],w=n[Math.min(n.length-1,m+1)],T=w[0]-S[0],_=w[2]-S[2];Math.abs(T*M.tangent[2]-_*M.tangent[0])/(Math.hypot(T,_)||1)>.35&&(c={index:m,d:x.distance,s:x.s,side:x.side})}}if(!c)return r;const u=e.sample(c.s),f=n[c.index][1];let d=f;const h=f-u.position[1];if(e.tunnelAt(c.s)&&h>5.8)return r;e.stations.some(m=>["BKD","CRA","LGG"].includes(m.id)&&Math.abs(m.s-c.s)<200)||Math.abs((e.stations.find(m=>m.id==="DDG")?.s??0)-900-c.s)<130?(r.mode="crossing",d=u.position[1]):h>3?(r.mode="over",d=Math.max(f,u.position[1]+6.3)):(r.mode="under",d=Math.min(f,u.position[1]-5.8)),r.inferred=!0,r.routeS=c.s,r.crossingS=s.lengths[c.index];const v=r.mode==="crossing"?35:Math.max(100,Math.abs(d-f)*20);for(let m=0;m<n.length;m++){const g=Math.abs(s.lengths[m]-r.crossingS),x=1-aa((g-r.width)/(v-r.width));n[m][1]=ft(n[m][1],d,x)}return r.path=new ht(n),r}function Bh(i,e,t){const n=Oh(i,e);if(!n||n.sourceStructure)return n;const s=/way\/(\d+)/.exec(n.id)?.[1],r=e.data.structures.find(d=>s&&(d.sourceWayIds||[]).includes(s)&&["roadBridge","footbridge"].includes(d.type));if(!r)return n;const a=n.path.nearest(r.position[0],r.position[2]);if(a.distance>20)return n;const o=e.project(r.position[0],r.position[2],100),l=e.sample(o.s).position[1],c=Math.max(r.position[1],o.distance<25?l+6.3:t.raw(r.position[0],r.position[2])+2),u=Math.max(65,r.length??20);n.mode="over",n.crossingS=a.s,n.routeS=o.s,n.inferred=!0;const f=n.path;return n.points=n.points.map((d,h)=>{const p=Math.abs(f.lengths[h]-a.s),v=1-at((p-(r.length??20)/2)/u,0,1);return[d[0],d[1]+Math.max(0,c-d[1])*v,d[2]]}),n.path=new ht(n.points),n}const yr=(i,e)=>i<e?-1:i>e?1:0,kh=new Set(["motorway","motorway_link","trunk","trunk_link","primary","primary_link","secondary","secondary_link","tertiary","tertiary_link","unclassified","residential","living_street","road"]);function oa(i){return kh.has(i.kind)&&i.width>=4.5&&Array.isArray(i.points)&&i.points.length>=2}class zh{roads=new Map;cars=new Map;nodes=new Map;reservations=new Map;spawnPlan;setSpawnPlan(e){const t=new Map;for(const n of e){if(!oa(n)||Nn(n.id)%4!==0)continue;const s=new ht(n.points);if(s.length<65)continue;const r=s.sample(s.length*.5).position,a=`${Math.floor(r[0]/1e3)},${Math.floor(r[2]/1e3)}`,o=t.get(a)||[];o.push({id:n.id,rank:Nn(`population/${n.id}`)}),t.set(a,o)}this.spawnPlan=new Set([...t.values()].flatMap(n=>n.sort((s,r)=>s.rank-r.rank||yr(s.id,r.id)).slice(0,8).map(s=>s.id)))}addRoads(e){for(const t of e){if(this.roads.has(t.id)||!oa(t))continue;const n=new ht(t.points);this.roads.set(t.id,{...t,path:n});for(const s of[0,1]){const r=t.points[s===0?0:t.points.length-1],a=this.key(r),o=this.nodes.get(a)||[];o.push({id:t.id,end:s}),this.nodes.set(a,o)}if(!(n.length<65||Nn(t.id)%4!==0||(this.spawnPlan?!this.spawnPlan.has(t.id):this.cars.size>=150)))for(const s of[1,-1]){const r=`car-${t.id}-${s}`;let a=n.length*(.18+Nn(r)%60/100);t.mode==="crossing"&&t.crossingS!==void 0&&Math.abs(a-t.crossingS)<40&&(a=at(t.crossingS-s*(40+Nn(r)%15),2,n.length-2));const o=n.sample(a,-s*t.width*.23),l=Nn(r)%24;o.position[1]+=(t.mode==="crossing"?-.005:.035)*.54;const c=t.width>=7&&l<2?"lorry":t.width>=6.3&&l<4?"bus":t.width>=5.3&&l<7?"van":l===8?"taxi":"car";this.cars.set(r,{id:r,road:t.id,s:a,direction:s,speed:0,kind:c,position:o.position,yaw:o.yaw+(s<0?Math.PI:0),pitch:o.pitch*s,bank:t.mode==="crossing"?0:.07/t.width,length:c==="bus"?10:c==="lorry"?12:c==="van"?5.5:4.5})}}}configure(e){this.roads.clear(),this.nodes.clear(),this.cars.clear(),this.reservations.clear();const t=[...e].sort((n,s)=>yr(n.id,s.id));this.setSpawnPlan(t),this.addRoads(t)}key(e){return`${Math.round(e[0]/4)},${Math.round(e[1]/2)},${Math.round(e[2]/4)}`}snapshot(){return{roads:[...this.roads.values()].map(({path:e,...t})=>t),cars:[...this.cars.values()].map(e=>({...e,transition:e.transition?{...e.transition,path:e.transition.path.points}:void 0})),reservations:[...this.reservations],spawnPlan:this.spawnPlan?[...this.spawnPlan].sort():void 0}}snapshotState(){return{version:2,cars:[...this.cars.values()].map(e=>({...e,transition:e.transition?{...e.transition,path:e.transition.path.points}:void 0})),reservations:[...this.reservations]}}restoreState(e){if(e?.version!==2||!Array.isArray(e.cars)||!Array.isArray(e.reservations))throw new Error("This save has an incompatible road traffic state. Start a new journey.");const t=new Map;for(const s of e.cars){if(!s||typeof s.id!="string"||t.has(s.id)||!this.roads.has(s.road)||![1,-1].includes(s.direction)||!Number.isFinite(s.s)||!Number.isFinite(s.speed))throw new Error("The saved road traffic does not match the current road network. Start a new journey.");const r={...s};if(s.transition){const a=s.transition;if(!this.roads.has(a.next)||!Array.isArray(a.path)||a.path.length<2||!Number.isFinite(a.s))throw new Error("The saved road transition is incompatible. Start a new journey.");r.transition={...a,path:new ht(a.path)}}t.set(r.id,r)}const n=new Map;for(const s of e.reservations){if(!Array.isArray(s)||s.length!==2||typeof s[0]!="string"||!this.nodes.has(s[0])||!s[1]||!t.has(s[1].car)||!Number.isFinite(s[1].until))throw new Error("The saved road reservation is incompatible. Start a new journey.");n.set(s[0],s[1])}this.cars.clear();for(const[s,r]of t)this.cars.set(s,r);this.reservations.clear();for(const[s,r]of n)this.reservations.set(s,r)}reset(){const e=[...this.roads.values()].map(({path:t,...n})=>n);this.roads.clear(),this.nodes.clear(),this.cars.clear(),this.reservations.clear(),this.addRoads(e)}restore(e){this.roads.clear(),this.nodes.clear(),this.cars.clear(),this.reservations.clear(),e.spawnPlan&&(this.spawnPlan=new Set(e.spawnPlan)),this.addRoads(e.roads),this.cars.clear();for(const t of e.cars)t.transition&&(t.transition.path=new ht(t.transition.path)),this.cars.set(t.id,t);for(const[t,n]of e.reservations)this.reservations.set(t,n)}crossingClear(e){for(const t of this.cars.values()){const n=this.roads.get(t.road);if(n?.mode!=="crossing"||n.routeS===void 0||n.crossingS===void 0||Math.abs(n.routeS-e)>220)continue;const s=(n.crossingS-t.s)*t.direction,r=16+t.length/2;if(s>-r&&(s<r||s>0&&s<r+t.speed*t.speed/3.6))return!1}return!0}update(e,t,n,s){for(const[o,l]of this.reservations)l.until<t&&this.reservations.delete(o);const r=new Map,a=new Map;for(const o of this.cars.values()){const l=`${o.road}/${o.direction}`,c=r.get(l)||[];c.push(o),r.set(l,c)}for(const o of r.values()){o.sort((l,c)=>(l.s-c.s)*l.direction);for(let l=0;l<o.length-1;l++)a.set(o[l].id,o[l+1])}for(const o of this.cars.values()){if(o.transition){const h=o.transition;o.speed=Math.min(5,o.speed+.7*e),h.s+=o.speed*e;const p=h.path.sample(h.s);o.position=p.position,o.yaw=p.yaw,o.pitch=p.pitch,h.s>=h.path.length&&(o.road=h.next,o.direction=h.direction,o.s=h.nextS,o.transition=void 0);continue}const l=this.roads.get(o.road);if(!l)continue;let c=l.kind==="primary"||l.kind==="secondary"?12:9;const u=o.direction===1?l.path.length-o.s:o.s,f=a.get(o.id);if(f){const h=(f.s-o.s)*o.direction;h>0&&(c=Math.min(c,Math.sqrt(Math.max(0,2*1.8*(h-(o.length+f.length)/2-3.5)))))}if(l.mode==="crossing"&&l.routeS!==void 0&&l.crossingS!==void 0){const h=n.find(m=>Math.abs(m.s-l.routeS)<220),p=(l.crossingS-o.s)*o.direction;p<-(16+o.length/2)&&(o.crossingCommitted=void 0),h&&h.state==="warning"&&p>0&&p<o.length/2+12+o.speed*o.speed/4.6&&(o.crossingCommitted=h.id);const v=(r.get(`${o.road}/${o.direction}`)||[]).some(m=>m.id!==o.id&&(m.s-l.crossingS)*o.direction>0&&(m.s-l.crossingS)*o.direction<26+o.length+m.length/2);p>0&&!(h&&o.crossingCommitted===h.id)&&(h&&h.state!=="open"||v)&&(c=Math.min(c,Math.sqrt(Math.max(0,2*2.3*(p-o.length/2-18)))))}if(u<30){const h=l.points[o.direction===1?l.points.length-1:0],p=this.key(h),v=(this.nodes.get(p)||[]).filter(x=>x.id!==l.id);v.sort((x,M)=>yr(x.id,M.id)||x.end-M.end);const m=v.length?v[Nn(o.id+p)%v.length]:void 0,g=this.reservations.get(p);if(!m||g&&g.car!==o.id)c=Math.min(c,Math.sqrt(Math.max(0,2*1.7*(u-8))));else if(c=Math.min(c,5),u<12){const x=this.roads.get(m.id),M=m.end===0?1:-1,S=M===1?12:x.path.length-12,w=x.path.sample(S,-M*x.width*.23);if(w.position[1]+=(x.mode==="crossing"?-.005:.035)*.54,(r.get(`${x.id}/${M}`)||[]).some(_=>_.id!==o.id&&Math.abs(_.s-S)<(o.length+_.length)/2+8))c=0;else{const _=l.path.sample(o.s,-o.direction*l.width*.23).position;_[1]+=(l.mode==="crossing"?-.005:.035)*.54;const b=[h[0],ft(_[1],w.position[1],.5),h[2]],P=[];for(let R=0;R<=12;R++){const C=R/12,F=1-C;P.push([F*F*_[0]+2*F*C*b[0]+C*C*w.position[0],ft(_[1],w.position[1],C),F*F*_[2]+2*F*C*b[2]+C*C*w.position[2]])}o.transition={path:new ht(P),s:0,next:x.id,direction:M,nextS:S,node:p},this.reservations.set(p,{car:o.id,until:t+8});continue}}}o.speed=Math.max(0,o.speed+at(c-o.speed,-2.5*e,1.1*e)),o.s=at(o.s+o.direction*o.speed*e,2,l.path.length-2);const d=l.path.sample(o.s,-o.direction*l.width*.23);o.position=d.position,o.position[1]+=(l.mode==="crossing"?-.005:.035)*.54,o.yaw=d.yaw+(o.direction<0?Math.PI:0),o.pitch=d.pitch*o.direction,o.bank=l.mode==="crossing"?0:.07/l.width}}}const eo="187",Gh=0,qo=1,Hh=2,Js=1,Vh=2,Ji=3,hi=0,Jt=1,Sn=2,Di=0,ts=1,Yo=2,$o=3,Ko=4,Wh=5,Ri=100,Xh=101,qh=102,Yh=103,$h=104,Kh=200,Zh=201,Jh=202,Qh=203,dc=204,fc=205,jh=206,eu=207,tu=208,nu=209,iu=210,su=211,ru=212,au=213,ou=214,la=0,ca=1,ha=2,os=3,ua=4,da=5,fa=6,pa=7,pc=0,lu=1,cu=2,On=0,mc=1,gc=2,_c=3,to=4,vc=5,xc=6,Mc=7,Sc=300,Ui=301,ls=302,Er=303,br=304,ma=1e3,Un=1001,ga=1002,Ot=1003,hu=1004,bs=1005,Zt=1006,wr=1007,Zn=1008,nn=1009,yc=1010,Ec=1011,cs=1012,no=1013,wn=1014,yn=1015,Tn=1016,io=1017,so=1018,Fi=1020,bc=35902,wc=35899,Tc=1021,Ac=1022,En=1023,jn=1026,Jn=1027,Rc=1028,ro=1029,ui=1030,ao=1031,oo=1033,Qs=33776,js=33777,er=33778,tr=33779,_a=35840,va=35841,xa=35842,Ma=35843,Sa=36196,ya=37492,Ea=37496,ba=37488,wa=37489,rr=37490,Ta=37491,Aa=37808,Ra=37809,Ca=37810,Pa=37811,La=37812,Da=37813,Ia=37814,Na=37815,Ua=37816,Fa=37817,Oa=37818,Ba=37819,ka=37820,za=37821,Ga=36492,Ha=36494,Va=36495,Wa=36283,Xa=36284,ar=36285,qa=36286,uu=3200,Ya=0,du=1,Kn="",an="srgb",or="srgb-linear",lr="linear",dt="srgb",Tr=7680,fu=519,pu=512,mu=513,gu=514,Cc=515,_u=516,vu=517,Pc=518,Lc=519,xu=35044,Zo="300 es",mn=2e3,hs=2001;function Mu(i){for(let e=i.length-1;e>=0;--e)if(i[e]>=65535)return!0;return!1}function cr(i){return document.createElementNS("http://www.w3.org/1999/xhtml",i)}function Su(){const i=cr("canvas");return i.style.display="block",i}const Jo={};function Qo(...i){const e="THREE."+i.shift();console.log(e,...i)}function Dc(i){const e=i[0];if(typeof e=="string"&&e.startsWith("TSL:")){const t=i[1];t&&t.isStackTrace?i[0]+=" "+t.getLocation():i[1]='Stack trace not available. Enable "THREE.Node.captureStackTrace" to capture stack traces.'}return i}function He(...i){i=Dc(i);const e="THREE."+i.shift();{const t=i[0];t&&t.isStackTrace?console.warn(t.getError(e)):console.warn(e,...i)}}function lt(...i){i=Dc(i);const e="THREE."+i.shift();{const t=i[0];t&&t.isStackTrace?console.error(t.getError(e)):console.error(e,...i)}}function nr(...i){const e=i.join(" ");e in Jo||(Jo[e]=!0,He(...i))}function yu(i,e,t){return new Promise(function(n,s){function r(){switch(i.clientWaitSync(e,i.SYNC_FLUSH_COMMANDS_BIT,0)){case i.WAIT_FAILED:s();break;case i.TIMEOUT_EXPIRED:setTimeout(r,t);break;default:n()}}setTimeout(r,t)})}const Eu={[la]:la,[ha]:fa,[ua]:ua,[os]:da,[ca]:ca,[fa]:ha,[pa]:pa,[da]:os};class pi{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});const n=this._listeners;n[e]===void 0&&(n[e]=[]),n[e].indexOf(t)===-1&&n[e].push(t)}hasEventListener(e,t){const n=this._listeners;return n===void 0?!1:n[e]!==void 0&&n[e].indexOf(t)!==-1}removeEventListener(e,t){const n=this._listeners;if(n===void 0)return;const s=n[e];if(s!==void 0){const r=s.indexOf(t);r!==-1&&s.splice(r,1)}}dispatchEvent(e){const t=this._listeners;if(t===void 0)return;const n=t[e.type];if(n!==void 0){e.target=this;const s=n.slice(0);for(let r=0,a=s.length;r<a;r++)s[r].call(this,e);e.target=null}}}const Vt=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"];let jo=1234567;const ns=Math.PI/180,us=180/Math.PI;function mi(){const i=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return(Vt[i&255]+Vt[i>>8&255]+Vt[i>>16&255]+Vt[i>>24&255]+"-"+Vt[e&255]+Vt[e>>8&255]+"-"+Vt[e>>16&15|64]+Vt[e>>24&255]+"-"+Vt[t&63|128]+Vt[t>>8&255]+"-"+Vt[t>>16&255]+Vt[t>>24&255]+Vt[n&255]+Vt[n>>8&255]+Vt[n>>16&255]+Vt[n>>24&255]).toLowerCase()}function nt(i,e,t){return Math.max(e,Math.min(t,i))}function lo(i,e){return(i%e+e)%e}function bu(i,e,t,n,s){return n+(i-e)*(s-n)/(t-e)}function wu(i,e,t){return i!==e?(t-i)/(e-i):0}function is(i,e,t){return(1-t)*i+t*e}function Tu(i,e,t,n){return is(i,e,1-Math.exp(-t*n))}function Au(i,e=1){return e-Math.abs(lo(i,e*2)-e)}function Ru(i,e,t){return i<=e?0:i>=t?1:(i=(i-e)/(t-e),i*i*(3-2*i))}function Cu(i,e,t){return i<=e?0:i>=t?1:(i=(i-e)/(t-e),i*i*i*(i*(i*6-15)+10))}function Pu(i,e){return i+Math.floor(Math.random()*(e-i+1))}function Lu(i,e){return i+Math.random()*(e-i)}function Du(i){return i*(.5-Math.random())}function Iu(i){i!==void 0&&(jo=i);let e=jo+=1831565813;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}function Nu(i){return i*ns}function Uu(i){return i*us}function Fu(i){return i>0&&Number.isInteger(i)&&2**Math.round(Math.log2(i))===i}function Ou(i){return Math.pow(2,Math.ceil(Math.log(i)/Math.LN2))}function Ic(i){return Math.pow(2,Math.floor(Math.log(i)/Math.LN2))}function Bu(i,e,t,n,s){const r=Math.cos,a=Math.sin,o=r(t/2),l=a(t/2),c=r((e+n)/2),u=a((e+n)/2),f=r((e-n)/2),d=a((e-n)/2),h=r((n-e)/2),p=a((n-e)/2);switch(s){case"XYX":i.set(o*u,l*f,l*d,o*c);break;case"YZY":i.set(l*d,o*u,l*f,o*c);break;case"ZXZ":i.set(l*f,l*d,o*u,o*c);break;case"XZX":i.set(o*u,l*p,l*h,o*c);break;case"YXY":i.set(l*h,o*u,l*p,o*c);break;case"ZYZ":i.set(l*p,l*h,o*u,o*c);break;default:He("MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: "+s)}}function co(i){switch(i.constructor){case Uint32Array:return 4294967295;case Uint16Array:return 65535;case Uint8Array:case Uint8ClampedArray:return 255;case Int32Array:return 2147483647;case Int16Array:return 32767;case Int8Array:return 127;default:return}}function Nc(i,e){if(e.constructor===Float32Array)return i;const t=co(e);if(t===void 0)throw new Error("THREE.MathUtils: Invalid component type.");return Math.max(i/t,-1)}function Uc(i,e){if(e.constructor===Float32Array)return i;const t=co(e);if(t===void 0)throw new Error("THREE.MathUtils: Invalid component type.");return Math.round(i*t)}const Fc={DEG2RAD:ns,RAD2DEG:us,generateUUID:mi,clamp:nt,euclideanModulo:lo,mapLinear:bu,inverseLerp:wu,lerp:is,damp:Tu,pingpong:Au,smoothstep:Ru,smootherstep:Cu,randInt:Pu,randFloat:Lu,randFloatSpread:Du,seededRandom:Iu,degToRad:Nu,radToDeg:Uu,isPowerOfTwo:Fu,ceilPowerOfTwo:Ou,floorPowerOfTwo:Ic,setQuaternionFromProperEuler:Bu,normalize:Uc,denormalize:Nc},Co=class Co{constructor(e=0,t=0){this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("THREE.Vector2: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("THREE.Vector2: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){const t=this.x,n=this.y,s=e.elements;return this.x=s[0]*t+s[3]*n+s[6],this.y=s[1]*t+s[4]*n+s[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=nt(this.x,e.x,t.x),this.y=nt(this.y,e.y,t.y),this}clampScalar(e,t){return this.x=nt(this.x,e,t),this.y=nt(this.y,e,t),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar(nt(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const n=this.dot(e)/t;return Math.acos(nt(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,n=this.y-e.y;return t*t+n*n}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){const n=Math.cos(t),s=Math.sin(t),r=this.x-e.x,a=this.y-e.y;return this.x=r*n-a*s+e.x,this.y=r*s+a*n+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}};Co.prototype.isVector2=!0;let Se=Co;class Gi{constructor(e=0,t=0,n=0,s=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=n,this._w=s}static slerpFlat(e,t,n,s,r,a,o){let l=n[s+0],c=n[s+1],u=n[s+2],f=n[s+3],d=r[a+0],h=r[a+1],p=r[a+2],v=r[a+3];if(f!==v||l!==d||c!==h||u!==p){let m=l*d+c*h+u*p+f*v;m<0&&(d=-d,h=-h,p=-p,v=-v,m=-m);let g=1-o;if(m<.9995){const x=Math.acos(m),M=Math.sin(x);g=Math.sin(g*x)/M,o=Math.sin(o*x)/M,l=l*g+d*o,c=c*g+h*o,u=u*g+p*o,f=f*g+v*o}else{l=l*g+d*o,c=c*g+h*o,u=u*g+p*o,f=f*g+v*o;const x=1/Math.sqrt(l*l+c*c+u*u+f*f);l*=x,c*=x,u*=x,f*=x}}e[t]=l,e[t+1]=c,e[t+2]=u,e[t+3]=f}static multiplyQuaternionsFlat(e,t,n,s,r,a){const o=n[s],l=n[s+1],c=n[s+2],u=n[s+3],f=r[a],d=r[a+1],h=r[a+2],p=r[a+3];return e[t]=o*p+u*f+l*h-c*d,e[t+1]=l*p+u*d+c*f-o*h,e[t+2]=c*p+u*h+o*d-l*f,e[t+3]=u*p-o*f-l*d-c*h,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,n,s){return this._x=e,this._y=t,this._z=n,this._w=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){const n=e._x,s=e._y,r=e._z,a=e._order,o=Math.cos,l=Math.sin,c=o(n/2),u=o(s/2),f=o(r/2),d=l(n/2),h=l(s/2),p=l(r/2);switch(a){case"XYZ":this._x=d*u*f+c*h*p,this._y=c*h*f-d*u*p,this._z=c*u*p+d*h*f,this._w=c*u*f-d*h*p;break;case"YXZ":this._x=d*u*f+c*h*p,this._y=c*h*f-d*u*p,this._z=c*u*p-d*h*f,this._w=c*u*f+d*h*p;break;case"ZXY":this._x=d*u*f-c*h*p,this._y=c*h*f+d*u*p,this._z=c*u*p+d*h*f,this._w=c*u*f-d*h*p;break;case"ZYX":this._x=d*u*f-c*h*p,this._y=c*h*f+d*u*p,this._z=c*u*p-d*h*f,this._w=c*u*f+d*h*p;break;case"YZX":this._x=d*u*f+c*h*p,this._y=c*h*f+d*u*p,this._z=c*u*p-d*h*f,this._w=c*u*f-d*h*p;break;case"XZY":this._x=d*u*f-c*h*p,this._y=c*h*f-d*u*p,this._z=c*u*p+d*h*f,this._w=c*u*f+d*h*p;break;default:He("Quaternion: .setFromEuler() encountered an unknown order: "+a)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){const n=t/2,s=Math.sin(n);return this._x=e.x*s,this._y=e.y*s,this._z=e.z*s,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(e){const t=e.elements,n=t[0],s=t[4],r=t[8],a=t[1],o=t[5],l=t[9],c=t[2],u=t[6],f=t[10],d=n+o+f;if(d>0){const h=.5/Math.sqrt(d+1);this._w=.25/h,this._x=(u-l)*h,this._y=(r-c)*h,this._z=(a-s)*h}else if(n>o&&n>f){const h=2*Math.sqrt(1+n-o-f);this._w=(u-l)/h,this._x=.25*h,this._y=(s+a)/h,this._z=(r+c)/h}else if(o>f){const h=2*Math.sqrt(1+o-n-f);this._w=(r-c)/h,this._x=(s+a)/h,this._y=.25*h,this._z=(l+u)/h}else{const h=2*Math.sqrt(1+f-n-o);this._w=(a-s)/h,this._x=(r+c)/h,this._y=(l+u)/h,this._z=.25*h}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let n=e.dot(t)+1;return n<1e-8?(n=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=n):(this._x=0,this._y=-e.z,this._z=e.y,this._w=n)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=n),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(nt(this.dot(e),-1,1)))}rotateTowards(e,t){const n=this.angleTo(e);if(n===0)return this;const s=Math.min(1,t/n);return this.slerp(e,s),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){const n=e._x,s=e._y,r=e._z,a=e._w,o=t._x,l=t._y,c=t._z,u=t._w;return this._x=n*u+a*o+s*c-r*l,this._y=s*u+a*l+r*o-n*c,this._z=r*u+a*c+n*l-s*o,this._w=a*u-n*o-s*l-r*c,this._onChangeCallback(),this}slerp(e,t){let n=e._x,s=e._y,r=e._z,a=e._w,o=this.dot(e);o<0&&(n=-n,s=-s,r=-r,a=-a,o=-o);let l=1-t;if(o<.9995){const c=Math.acos(o),u=Math.sin(c);l=Math.sin(l*c)/u,t=Math.sin(t*c)/u,this._x=this._x*l+n*t,this._y=this._y*l+s*t,this._z=this._z*l+r*t,this._w=this._w*l+a*t,this._onChangeCallback()}else this._x=this._x*l+n*t,this._y=this._y*l+s*t,this._z=this._z*l+r*t,this._w=this._w*l+a*t,this.normalize();return this}slerpQuaternions(e,t,n){return this.copy(e).slerp(t,n)}random(){const e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),n=Math.random(),s=Math.sqrt(1-n),r=Math.sqrt(n);return this.set(s*Math.sin(e),s*Math.cos(e),r*Math.sin(t),r*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}}const Po=class Po{constructor(e=0,t=0,n=0){this.x=e,this.y=t,this.z=n}set(e,t,n){return n===void 0&&(n=this.z),this.x=e,this.y=t,this.z=n,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("THREE.Vector3: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("THREE.Vector3: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(el.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(el.setFromAxisAngle(e,t))}applyMatrix3(e){const t=this.x,n=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[3]*n+r[6]*s,this.y=r[1]*t+r[4]*n+r[7]*s,this.z=r[2]*t+r[5]*n+r[8]*s,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){const t=this.x,n=this.y,s=this.z,r=e.elements,a=1/(r[3]*t+r[7]*n+r[11]*s+r[15]);return this.x=(r[0]*t+r[4]*n+r[8]*s+r[12])*a,this.y=(r[1]*t+r[5]*n+r[9]*s+r[13])*a,this.z=(r[2]*t+r[6]*n+r[10]*s+r[14])*a,this}applyQuaternion(e){const t=this.x,n=this.y,s=this.z,r=e.x,a=e.y,o=e.z,l=e.w,c=2*(a*s-o*n),u=2*(o*t-r*s),f=2*(r*n-a*t);return this.x=t+l*c+a*f-o*u,this.y=n+l*u+o*c-r*f,this.z=s+l*f+r*u-a*c,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){const t=this.x,n=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[4]*n+r[8]*s,this.y=r[1]*t+r[5]*n+r[9]*s,this.z=r[2]*t+r[6]*n+r[10]*s,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=nt(this.x,e.x,t.x),this.y=nt(this.y,e.y,t.y),this.z=nt(this.z,e.z,t.z),this}clampScalar(e,t){return this.x=nt(this.x,e,t),this.y=nt(this.y,e,t),this.z=nt(this.z,e,t),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar(nt(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){const n=e.x,s=e.y,r=e.z,a=t.x,o=t.y,l=t.z;return this.x=s*l-r*o,this.y=r*a-n*l,this.z=n*o-s*a,this}projectOnVector(e){const t=e.lengthSq();if(t===0)return this.set(0,0,0);const n=e.dot(this)/t;return this.copy(e).multiplyScalar(n)}projectOnPlane(e){return Ar.copy(this).projectOnVector(e),this.sub(Ar)}reflect(e){return this.sub(Ar.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const n=this.dot(e)/t;return Math.acos(nt(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,n=this.y-e.y,s=this.z-e.z;return t*t+n*n+s*s}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,n){const s=Math.sin(t)*e;return this.x=s*Math.sin(n),this.y=Math.cos(t)*e,this.z=s*Math.cos(n),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,n){return this.x=e*Math.sin(t),this.y=n,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){const t=this.setFromMatrixColumn(e,0).length(),n=this.setFromMatrixColumn(e,1).length(),s=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=n,this.z=s,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){const e=Math.random()*Math.PI*2,t=Math.random()*2-1,n=Math.sqrt(1-t*t);return this.x=n*Math.cos(e),this.y=t,this.z=n*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}};Po.prototype.isVector3=!0;let O=Po;const Ar=new O,el=new Gi,Lo=class Lo{constructor(e,t,n,s,r,a,o,l,c){this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,n,s,r,a,o,l,c)}set(e,t,n,s,r,a,o,l,c){const u=this.elements;return u[0]=e,u[1]=s,u[2]=o,u[3]=t,u[4]=r,u[5]=l,u[6]=n,u[7]=a,u[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){const t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],this}extractBasis(e,t,n){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(e){const t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const n=e.elements,s=t.elements,r=this.elements,a=n[0],o=n[3],l=n[6],c=n[1],u=n[4],f=n[7],d=n[2],h=n[5],p=n[8],v=s[0],m=s[3],g=s[6],x=s[1],M=s[4],S=s[7],w=s[2],T=s[5],_=s[8];return r[0]=a*v+o*x+l*w,r[3]=a*m+o*M+l*T,r[6]=a*g+o*S+l*_,r[1]=c*v+u*x+f*w,r[4]=c*m+u*M+f*T,r[7]=c*g+u*S+f*_,r[2]=d*v+h*x+p*w,r[5]=d*m+h*M+p*T,r[8]=d*g+h*S+p*_,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){const e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],a=e[4],o=e[5],l=e[6],c=e[7],u=e[8];return t*a*u-t*o*c-n*r*u+n*o*l+s*r*c-s*a*l}invert(){const e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],a=e[4],o=e[5],l=e[6],c=e[7],u=e[8],f=u*a-o*c,d=o*l-u*r,h=c*r-a*l,p=t*f+n*d+s*h;if(p===0)return this.set(0,0,0,0,0,0,0,0,0);const v=1/p;return e[0]=f*v,e[1]=(s*c-u*n)*v,e[2]=(o*n-s*a)*v,e[3]=d*v,e[4]=(u*t-s*l)*v,e[5]=(s*r-o*t)*v,e[6]=h*v,e[7]=(n*l-c*t)*v,e[8]=(a*t-n*r)*v,this}transpose(){let e;const t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){const t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,n,s,r,a,o){const l=Math.cos(r),c=Math.sin(r);return this.set(n*l,n*c,-n*(l*a+c*o)+a+e,-s*c,s*l,-s*(-c*a+l*o)+o+t,0,0,1),this}scale(e,t){return nr("Matrix3: .scale() is deprecated. Use .makeScale() instead."),this.premultiply(Rr.makeScale(e,t)),this}rotate(e){return nr("Matrix3: .rotate() is deprecated. Use .makeRotation() instead."),this.premultiply(Rr.makeRotation(-e)),this}translate(e,t){return nr("Matrix3: .translate() is deprecated. Use .makeTranslation() instead."),this.premultiply(Rr.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){const t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,n,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){const t=this.elements,n=e.elements;for(let s=0;s<9;s++)if(t[s]!==n[s])return!1;return!0}fromArray(e,t=0){for(let n=0;n<9;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){const n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e}clone(){return new this.constructor().fromArray(this.elements)}};Lo.prototype.isMatrix3=!0;let Xe=Lo;const Rr=new Xe,tl=new Xe().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),nl=new Xe().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function ku(){const i={enabled:!0,workingColorSpace:or,spaces:{},convert:function(s,r,a){return this.enabled===!1||r===a||!r||!a||(this.spaces[r].transfer===dt&&(s.r=Bn(s.r),s.g=Bn(s.g),s.b=Bn(s.b)),this.spaces[r].primaries!==this.spaces[a].primaries&&(s.applyMatrix3(this.spaces[r].toXYZ),s.applyMatrix3(this.spaces[a].fromXYZ)),this.spaces[a].transfer===dt&&(s.r=Ii(s.r),s.g=Ii(s.g),s.b=Ii(s.b))),s},workingToColorSpace:function(s,r){return this.convert(s,this.workingColorSpace,r)},colorSpaceToWorking:function(s,r){return this.convert(s,r,this.workingColorSpace)},getPrimaries:function(s){return this.spaces[s].primaries},getTransfer:function(s){return s===Kn?lr:this.spaces[s].transfer},getToneMappingMode:function(s){return this.spaces[s].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(s,r=this.workingColorSpace){return s.fromArray(this.spaces[r].luminanceCoefficients)},define:function(s){Object.assign(this.spaces,s)},_getMatrix:function(s,r,a){return s.copy(this.spaces[a].fromXYZ).multiply(this.spaces[r].toXYZ)},_getDrawingBufferColorSpace:function(s){return this.spaces[s].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(s=this.workingColorSpace){return this.spaces[s].workingColorSpaceConfig.unpackColorSpace}},e=[.64,.33,.3,.6,.15,.06],t=[.2126,.7152,.0722],n=[.3127,.329];return i.define({[or]:{primaries:e,whitePoint:n,transfer:lr,toXYZ:tl,fromXYZ:nl,luminanceCoefficients:t,workingColorSpaceConfig:{unpackColorSpace:an},outputColorSpaceConfig:{drawingBufferColorSpace:an}},[an]:{primaries:e,whitePoint:n,transfer:dt,toXYZ:tl,fromXYZ:nl,luminanceCoefficients:t,outputColorSpaceConfig:{drawingBufferColorSpace:an}}}),i}const rt=ku();function Bn(i){return i<.04045?i*.0773993808:Math.pow(i*.9478672986+.0521327014,2.4)}function Ii(i){return i<.0031308?i*12.92:1.055*Math.pow(i,.41666)-.055}let gi;class zu{static getDataURL(e,t="image/png"){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let n;if(e instanceof HTMLCanvasElement)n=e;else{gi===void 0&&(gi=cr("canvas")),gi.width=e.width,gi.height=e.height;const s=gi.getContext("2d");e instanceof ImageData?s.putImageData(e,0,0):s.drawImage(e,0,0,e.width,e.height),n=gi}return n.toDataURL(t)}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){const t=cr("canvas");t.width=e.width,t.height=e.height;const n=t.getContext("2d");n.drawImage(e,0,0,e.width,e.height);const s=n.getImageData(0,0,e.width,e.height),r=s.data;for(let a=0;a<r.length;a++)r[a]=Bn(r[a]/255)*255;return n.putImageData(s,0,0),t}else if(e.data){const t=e.data.slice(0);for(let n=0;n<t.length;n++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[n]=Math.floor(Bn(t[n]/255)*255):t[n]=Bn(t[n]);return{data:t,width:e.width,height:e.height}}else return He("ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}}let Gu=0;class ho{constructor(e=null){this.isTextureSource=!0,Object.defineProperty(this,"id",{value:Gu++}),this.uuid=mi(),this.data=e,this.dataReady=!0,this.version=0}getSize(e){const t=this.data;return typeof HTMLVideoElement<"u"&&t instanceof HTMLVideoElement?e.set(t.videoWidth,t.videoHeight,0):typeof VideoFrame<"u"&&t instanceof VideoFrame?e.set(t.displayWidth,t.displayHeight,0):t!==null?e.set(t.width||0,t.height||0,t.depth||0):e.set(0,0,0),e}set needsUpdate(e){e===!0&&this.version++}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];const n={uuid:this.uuid,url:""},s=this.data;if(s!==null){let r;if(Array.isArray(s)){r=[];for(let a=0,o=s.length;a<o;a++)s[a].isDataTexture?r.push(Cr(s[a].image)):r.push(Cr(s[a]))}else r=Cr(s);n.url=r}return t||(e.images[this.uuid]=n),n}}function Cr(i){return typeof HTMLImageElement<"u"&&i instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&i instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&i instanceof ImageBitmap?zu.getDataURL(i):i.data?{data:Array.from(i.data),width:i.width,height:i.height,type:i.data.constructor.name}:(He("Texture: Unable to serialize Texture."),{})}let Hu=0;const Pr=new O;class $t extends pi{constructor(e=$t.DEFAULT_IMAGE,t=$t.DEFAULT_MAPPING,n=Un,s=Un,r=Zt,a=Zn,o=En,l=nn,c=$t.DEFAULT_ANISOTROPY,u=Kn){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:Hu++}),this.uuid=mi(),this.name="",this.source=new ho(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=n,this.wrapT=s,this.magFilter=r,this.minFilter=a,this.anisotropy=c,this.format=o,this.internalFormat=null,this.type=l,this.offset=new Se(0,0),this.repeat=new Se(1,1),this.center=new Se(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new Xe,this.generateMipmaps=!0,this.mipmapsAutoUpdate=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=u,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(e&&e.depth&&e.depth>1),this.pmremVersion=0,this.isPMREMTexture=!1,this.normalized=!1}get width(){return this.source.getSize(Pr).x}get height(){return this.source.getSize(Pr).y}get depth(){return this.source.getSize(Pr).z}get image(){return this.source.data}set image(e){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.normalized=e.normalized,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.mipmapsAutoUpdate=e.mipmapsAutoUpdate,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.renderTarget=e.renderTarget,this.isRenderTargetTexture=e.isRenderTargetTexture,this.isPMREMTexture=e.isPMREMTexture,this.isArrayTexture=e.isArrayTexture,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}setValues(e){for(const t in e){const n=e[t];if(n===void 0){He(`Texture.setValues(): parameter '${t}' has value of undefined.`);continue}const s=this[t];if(s===void 0){He(`Texture.setValues(): property '${t}' does not exist.`);continue}s&&n&&s.isVector2&&n.isVector2||s&&n&&s.isVector3&&n.isVector3||s&&n&&s.isMatrix3&&n.isMatrix3?s.copy(n):this[t]=n}}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];const n={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,normalized:this.normalized,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,mipmapsAutoUpdate:this.mipmapsAutoUpdate,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),t||(e.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==Sc)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case ma:e.x=e.x-Math.floor(e.x);break;case Un:e.x=e.x<0?0:1;break;case ga:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case ma:e.y=e.y-Math.floor(e.y);break;case Un:e.y=e.y<0?0:1;break;case ga:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}}$t.DEFAULT_IMAGE=null;$t.DEFAULT_MAPPING=Sc;$t.DEFAULT_ANISOTROPY=1;const Do=class Do{constructor(e=0,t=0,n=0,s=1){this.x=e,this.y=t,this.z=n,this.w=s}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,n,s){return this.x=e,this.y=t,this.z=n,this.w=s,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("THREE.Vector4: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("THREE.Vector4: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){const t=this.x,n=this.y,s=this.z,r=this.w,a=e.elements;return this.x=a[0]*t+a[4]*n+a[8]*s+a[12]*r,this.y=a[1]*t+a[5]*n+a[9]*s+a[13]*r,this.z=a[2]*t+a[6]*n+a[10]*s+a[14]*r,this.w=a[3]*t+a[7]*n+a[11]*s+a[15]*r,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);const t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,n,s,r;const l=e.elements,c=l[0],u=l[4],f=l[8],d=l[1],h=l[5],p=l[9],v=l[2],m=l[6],g=l[10];if(Math.abs(u-d)<.01&&Math.abs(f-v)<.01&&Math.abs(p-m)<.01){if(Math.abs(u+d)<.1&&Math.abs(f+v)<.1&&Math.abs(p+m)<.1&&Math.abs(c+h+g-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;const M=(c+1)/2,S=(h+1)/2,w=(g+1)/2,T=(u+d)/4,_=(f+v)/4,b=(p+m)/4;return M>S&&M>w?M<.01?(n=0,s=.707106781,r=.707106781):(n=Math.sqrt(M),s=T/n,r=_/n):S>w?S<.01?(n=.707106781,s=0,r=.707106781):(s=Math.sqrt(S),n=T/s,r=b/s):w<.01?(n=.707106781,s=.707106781,r=0):(r=Math.sqrt(w),n=_/r,s=b/r),this.set(n,s,r,t),this}let x=Math.sqrt((m-p)*(m-p)+(f-v)*(f-v)+(d-u)*(d-u));return Math.abs(x)<.001&&(x=1),this.x=(m-p)/x,this.y=(f-v)/x,this.z=(d-u)/x,this.w=Math.acos((c+h+g-1)/2),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=nt(this.x,e.x,t.x),this.y=nt(this.y,e.y,t.y),this.z=nt(this.z,e.z,t.z),this.w=nt(this.w,e.w,t.w),this}clampScalar(e,t){return this.x=nt(this.x,e,t),this.y=nt(this.y,e,t),this.z=nt(this.z,e,t),this.w=nt(this.w,e,t),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar(nt(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this.w=e.w+(t.w-e.w)*n,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}};Do.prototype.isVector4=!0;let bt=Do;class Vu extends pi{constructor(e=1,t=1,n={}){super(),n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:Zt,depthBuffer:!0,stencilBuffer:!1,resolveColorBuffer:!0,resolveDepthBuffer:!0,resolveStencilBuffer:!0,storeMultisampledColorBuffer:!0,storeMultisampledDepthBuffer:!0,storeMultisampledStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1,useArrayDepthTexture:!1},n),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=n.depth,this.scissor=new bt(0,0,e,t),this.scissorTest=!1,this.viewport=new bt(0,0,e,t),this.textures=[];const s=n.count;for(let r=0;r<s;r++)this.textures[r]=new $t({width:e,height:t,depth:n.depth}),this.textures[r].isRenderTargetTexture=!0,this.textures[r].renderTarget=this;this._setTextureOptions(n),this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveColorBuffer=n.resolveColorBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this.storeMultisampledColorBuffer=n.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=n.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=n.storeMultisampledStencilBuffer,this._depthTexture=null,this.depthTexture=n.depthTexture,this.samples=n.samples,this.multiview=n.multiview,this.useArrayDepthTexture=n.useArrayDepthTexture}_setTextureOptions(e={}){const t={minFilter:Zt,generateMipmaps:!1,flipY:!1,internalFormat:null};e.mapping!==void 0&&(t.mapping=e.mapping),e.wrapS!==void 0&&(t.wrapS=e.wrapS),e.wrapT!==void 0&&(t.wrapT=e.wrapT),e.wrapR!==void 0&&(t.wrapR=e.wrapR),e.magFilter!==void 0&&(t.magFilter=e.magFilter),e.minFilter!==void 0&&(t.minFilter=e.minFilter),e.format!==void 0&&(t.format=e.format),e.type!==void 0&&(t.type=e.type),e.anisotropy!==void 0&&(t.anisotropy=e.anisotropy),e.colorSpace!==void 0&&(t.colorSpace=e.colorSpace),e.flipY!==void 0&&(t.flipY=e.flipY),e.generateMipmaps!==void 0&&(t.generateMipmaps=e.generateMipmaps),e.mipmapsAutoUpdate!==void 0&&(t.mipmapsAutoUpdate=e.mipmapsAutoUpdate),e.internalFormat!==void 0&&(t.internalFormat=e.internalFormat);for(let n=0;n<this.textures.length;n++)this.textures[n].setValues(t)}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}set depthTexture(e){this._depthTexture!==null&&this._depthTexture.renderTarget===this&&(this._depthTexture.renderTarget=null),e!==null&&e.renderTarget===null&&(e.renderTarget=this),this._depthTexture=e}get depthTexture(){return this._depthTexture}setSize(e,t,n=1){if(this.width!==e||this.height!==t||this.depth!==n){this.width=e,this.height=t,this.depth=n;for(let s=0,r=this.textures.length;s<r;s++)this.textures[s].image.width=e,this.textures[s].image.height=t,this.textures[s].image.depth=n,this.textures[s].isData3DTexture!==!0&&(this.textures[s].isArrayTexture=this.textures[s].image.depth>1);this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let t=0,n=e.textures.length;t<n;t++){this.textures[t]=e.textures[t].clone(),this.textures[t].isRenderTargetTexture=!0,this.textures[t].renderTarget=this;const s=Object.assign({},e.textures[t].image);this.textures[t].source=new ho(s)}if(this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveColorBuffer=e.resolveColorBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,this.storeMultisampledColorBuffer=e.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=e.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=e.storeMultisampledStencilBuffer,e.depthTexture!==null)if(e.depthTexture.renderTarget===e){const t=e.depthTexture.clone();t.renderTarget=null,this.depthTexture=t}else this.depthTexture=e.depthTexture;else this.depthTexture=null;return this.samples=e.samples,this.multiview=e.multiview,this.useArrayDepthTexture=e.useArrayDepthTexture,this}dispose(){this.dispatchEvent({type:"dispose"})}}class bn extends Vu{constructor(e=1,t=1,n={}){super(e,t,n),this.isWebGLRenderTarget=!0}}class Oc extends $t{constructor(e=null,t=1,n=1,s=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:n,depth:s},this.magFilter=Ot,this.minFilter=Ot,this.wrapR=Un,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}copy(e){return super.copy(e),this.wrapR=e.wrapR,this}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}}class Wu extends $t{constructor(e=null,t=1,n=1,s=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:n,depth:s},this.magFilter=Ot,this.minFilter=Ot,this.wrapR=Un,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}copy(e){return super.copy(e),this.wrapR=e.wrapR,this}}const pr=class pr{constructor(e,t,n,s,r,a,o,l,c,u,f,d,h,p,v,m){this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,n,s,r,a,o,l,c,u,f,d,h,p,v,m)}set(e,t,n,s,r,a,o,l,c,u,f,d,h,p,v,m){const g=this.elements;return g[0]=e,g[4]=t,g[8]=n,g[12]=s,g[1]=r,g[5]=a,g[9]=o,g[13]=l,g[2]=c,g[6]=u,g[10]=f,g[14]=d,g[3]=h,g[7]=p,g[11]=v,g[15]=m,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new pr().fromArray(this.elements)}copy(e){const t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],t[9]=n[9],t[10]=n[10],t[11]=n[11],t[12]=n[12],t[13]=n[13],t[14]=n[14],t[15]=n[15],this}copyPosition(e){const t=this.elements,n=e.elements;return t[12]=n[12],t[13]=n[13],t[14]=n[14],this}setFromMatrix3(e){const t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,n){return this.determinantAffine()===0?(e.set(1,0,0),t.set(0,1,0),n.set(0,0,1),this):(e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this)}makeBasis(e,t,n){return this.set(e.x,t.x,n.x,0,e.y,t.y,n.y,0,e.z,t.z,n.z,0,0,0,0,1),this}extractRotation(e){if(e.determinantAffine()===0)return this.identity();const t=this.elements,n=e.elements,s=1/_i.setFromMatrixColumn(e,0).length(),r=1/_i.setFromMatrixColumn(e,1).length(),a=1/_i.setFromMatrixColumn(e,2).length();return t[0]=n[0]*s,t[1]=n[1]*s,t[2]=n[2]*s,t[3]=0,t[4]=n[4]*r,t[5]=n[5]*r,t[6]=n[6]*r,t[7]=0,t[8]=n[8]*a,t[9]=n[9]*a,t[10]=n[10]*a,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){const t=this.elements,n=e.x,s=e.y,r=e.z,a=Math.cos(n),o=Math.sin(n),l=Math.cos(s),c=Math.sin(s),u=Math.cos(r),f=Math.sin(r);if(e.order==="XYZ"){const d=a*u,h=a*f,p=o*u,v=o*f;t[0]=l*u,t[4]=-l*f,t[8]=c,t[1]=h+p*c,t[5]=d-v*c,t[9]=-o*l,t[2]=v-d*c,t[6]=p+h*c,t[10]=a*l}else if(e.order==="YXZ"){const d=l*u,h=l*f,p=c*u,v=c*f;t[0]=d+v*o,t[4]=p*o-h,t[8]=a*c,t[1]=a*f,t[5]=a*u,t[9]=-o,t[2]=h*o-p,t[6]=v+d*o,t[10]=a*l}else if(e.order==="ZXY"){const d=l*u,h=l*f,p=c*u,v=c*f;t[0]=d-v*o,t[4]=-a*f,t[8]=p+h*o,t[1]=h+p*o,t[5]=a*u,t[9]=v-d*o,t[2]=-a*c,t[6]=o,t[10]=a*l}else if(e.order==="ZYX"){const d=a*u,h=a*f,p=o*u,v=o*f;t[0]=l*u,t[4]=p*c-h,t[8]=d*c+v,t[1]=l*f,t[5]=v*c+d,t[9]=h*c-p,t[2]=-c,t[6]=o*l,t[10]=a*l}else if(e.order==="YZX"){const d=a*l,h=a*c,p=o*l,v=o*c;t[0]=l*u,t[4]=v-d*f,t[8]=p*f+h,t[1]=f,t[5]=a*u,t[9]=-o*u,t[2]=-c*u,t[6]=h*f+p,t[10]=d-v*f}else if(e.order==="XZY"){const d=a*l,h=a*c,p=o*l,v=o*c;t[0]=l*u,t[4]=-f,t[8]=c*u,t[1]=d*f+v,t[5]=a*u,t[9]=h*f-p,t[2]=p*f-h,t[6]=o*u,t[10]=v*f+d}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(Xu,e,qu)}lookAt(e,t,n){const s=this.elements;return jt.subVectors(e,t),jt.lengthSq()===0&&(jt.z=1),jt.normalize(),Vn.crossVectors(n,jt),Vn.lengthSq()===0&&(Math.abs(n.z)===1?jt.x+=1e-4:jt.z+=1e-4,jt.normalize(),Vn.crossVectors(n,jt)),Vn.normalize(),ws.crossVectors(jt,Vn),s[0]=Vn.x,s[4]=ws.x,s[8]=jt.x,s[1]=Vn.y,s[5]=ws.y,s[9]=jt.y,s[2]=Vn.z,s[6]=ws.z,s[10]=jt.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const n=e.elements,s=t.elements,r=this.elements,a=n[0],o=n[4],l=n[8],c=n[12],u=n[1],f=n[5],d=n[9],h=n[13],p=n[2],v=n[6],m=n[10],g=n[14],x=n[3],M=n[7],S=n[11],w=n[15],T=s[0],_=s[4],b=s[8],P=s[12],R=s[1],C=s[5],F=s[9],V=s[13],D=s[2],z=s[6],X=s[10],k=s[14],se=s[3],$=s[7],ee=s[11],ie=s[15];return r[0]=a*T+o*R+l*D+c*se,r[4]=a*_+o*C+l*z+c*$,r[8]=a*b+o*F+l*X+c*ee,r[12]=a*P+o*V+l*k+c*ie,r[1]=u*T+f*R+d*D+h*se,r[5]=u*_+f*C+d*z+h*$,r[9]=u*b+f*F+d*X+h*ee,r[13]=u*P+f*V+d*k+h*ie,r[2]=p*T+v*R+m*D+g*se,r[6]=p*_+v*C+m*z+g*$,r[10]=p*b+v*F+m*X+g*ee,r[14]=p*P+v*V+m*k+g*ie,r[3]=x*T+M*R+S*D+w*se,r[7]=x*_+M*C+S*z+w*$,r[11]=x*b+M*F+S*X+w*ee,r[15]=x*P+M*V+S*k+w*ie,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){const e=this.elements,t=e[0],n=e[4],s=e[8],r=e[12],a=e[1],o=e[5],l=e[9],c=e[13],u=e[2],f=e[6],d=e[10],h=e[14],p=e[3],v=e[7],m=e[11],g=e[15],x=l*h-c*d,M=o*h-c*f,S=o*d-l*f,w=a*h-c*u,T=a*d-l*u,_=a*f-o*u;return t*(v*x-m*M+g*S)-n*(p*x-m*w+g*T)+s*(p*M-v*w+g*_)-r*(p*S-v*T+m*_)}determinantAffine(){const e=this.elements,t=e[0],n=e[4],s=e[8],r=e[1],a=e[5],o=e[9],l=e[2],c=e[6],u=e[10];return t*(a*u-o*c)-n*(r*u-o*l)+s*(r*c-a*l)}transpose(){const e=this.elements;let t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,n){const s=this.elements;return e.isVector3?(s[12]=e.x,s[13]=e.y,s[14]=e.z):(s[12]=e,s[13]=t,s[14]=n),this}invert(){const e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],a=e[4],o=e[5],l=e[6],c=e[7],u=e[8],f=e[9],d=e[10],h=e[11],p=e[12],v=e[13],m=e[14],g=e[15],x=t*o-n*a,M=t*l-s*a,S=t*c-r*a,w=n*l-s*o,T=n*c-r*o,_=s*c-r*l,b=u*v-f*p,P=u*m-d*p,R=u*g-h*p,C=f*m-d*v,F=f*g-h*v,V=d*g-h*m,D=x*V-M*F+S*C+w*R-T*P+_*b;if(D===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);const z=1/D;return e[0]=(o*V-l*F+c*C)*z,e[1]=(s*F-n*V-r*C)*z,e[2]=(v*_-m*T+g*w)*z,e[3]=(d*T-f*_-h*w)*z,e[4]=(l*R-a*V-c*P)*z,e[5]=(t*V-s*R+r*P)*z,e[6]=(m*S-p*_-g*M)*z,e[7]=(u*_-d*S+h*M)*z,e[8]=(a*F-o*R+c*b)*z,e[9]=(n*R-t*F-r*b)*z,e[10]=(p*T-v*S+g*x)*z,e[11]=(f*S-u*T-h*x)*z,e[12]=(o*P-a*C-l*b)*z,e[13]=(t*C-n*P+s*b)*z,e[14]=(v*M-p*w-m*x)*z,e[15]=(u*w-f*M+d*x)*z,this}scale(e){const t=this.elements,n=e.x,s=e.y,r=e.z;return t[0]*=n,t[4]*=s,t[8]*=r,t[1]*=n,t[5]*=s,t[9]*=r,t[2]*=n,t[6]*=s,t[10]*=r,t[3]*=n,t[7]*=s,t[11]*=r,this}getMaxScaleOnAxis(){const e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],n=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],s=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,n,s))}makeTranslation(e,t,n){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,n,0,0,0,1),this}makeRotationX(e){const t=Math.cos(e),n=Math.sin(e);return this.set(1,0,0,0,0,t,-n,0,0,n,t,0,0,0,0,1),this}makeRotationY(e){const t=Math.cos(e),n=Math.sin(e);return this.set(t,0,n,0,0,1,0,0,-n,0,t,0,0,0,0,1),this}makeRotationZ(e){const t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,0,n,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){const n=Math.cos(t),s=Math.sin(t),r=1-n,a=e.x,o=e.y,l=e.z,c=r*a,u=r*o;return this.set(c*a+n,c*o-s*l,c*l+s*o,0,c*o+s*l,u*o+n,u*l-s*a,0,c*l-s*o,u*l+s*a,r*l*l+n,0,0,0,0,1),this}makeScale(e,t,n){return this.set(e,0,0,0,0,t,0,0,0,0,n,0,0,0,0,1),this}makeShear(e,t,n,s,r,a){return this.set(1,n,r,0,e,1,a,0,t,s,1,0,0,0,0,1),this}compose(e,t,n){const s=this.elements,r=t._x,a=t._y,o=t._z,l=t._w,c=r+r,u=a+a,f=o+o,d=r*c,h=r*u,p=r*f,v=a*u,m=a*f,g=o*f,x=l*c,M=l*u,S=l*f,w=n.x,T=n.y,_=n.z;return s[0]=(1-(v+g))*w,s[1]=(h+S)*w,s[2]=(p-M)*w,s[3]=0,s[4]=(h-S)*T,s[5]=(1-(d+g))*T,s[6]=(m+x)*T,s[7]=0,s[8]=(p+M)*_,s[9]=(m-x)*_,s[10]=(1-(d+v))*_,s[11]=0,s[12]=e.x,s[13]=e.y,s[14]=e.z,s[15]=1,this}decompose(e,t,n){const s=this.elements;e.x=s[12],e.y=s[13],e.z=s[14];const r=this.determinantAffine();if(r===0)return n.set(1,1,1),t.identity(),this;let a=_i.set(s[0],s[1],s[2]).length();const o=_i.set(s[4],s[5],s[6]).length(),l=_i.set(s[8],s[9],s[10]).length();r<0&&(a=-a),cn.copy(this);const c=1/a,u=1/o,f=1/l;return cn.elements[0]*=c,cn.elements[1]*=c,cn.elements[2]*=c,cn.elements[4]*=u,cn.elements[5]*=u,cn.elements[6]*=u,cn.elements[8]*=f,cn.elements[9]*=f,cn.elements[10]*=f,t.setFromRotationMatrix(cn),n.x=a,n.y=o,n.z=l,this}makePerspective(e,t,n,s,r,a,o=mn,l=!1){const c=this.elements,u=2*r/(t-e),f=2*r/(n-s),d=(t+e)/(t-e),h=(n+s)/(n-s);let p,v;if(l)p=r/(a-r),v=a*r/(a-r);else if(o===mn)p=-(a+r)/(a-r),v=-2*a*r/(a-r);else if(o===hs)p=-a/(a-r),v=-a*r/(a-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+o);return c[0]=u,c[4]=0,c[8]=d,c[12]=0,c[1]=0,c[5]=f,c[9]=h,c[13]=0,c[2]=0,c[6]=0,c[10]=p,c[14]=v,c[3]=0,c[7]=0,c[11]=-1,c[15]=0,this}makeOrthographic(e,t,n,s,r,a,o=mn,l=!1){const c=this.elements,u=2/(t-e),f=2/(n-s),d=-(t+e)/(t-e),h=-(n+s)/(n-s);let p,v;if(l)p=1/(a-r),v=a/(a-r);else if(o===mn)p=-2/(a-r),v=-(a+r)/(a-r);else if(o===hs)p=-1/(a-r),v=-r/(a-r);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+o);return c[0]=u,c[4]=0,c[8]=0,c[12]=d,c[1]=0,c[5]=f,c[9]=0,c[13]=h,c[2]=0,c[6]=0,c[10]=p,c[14]=v,c[3]=0,c[7]=0,c[11]=0,c[15]=1,this}equals(e){const t=this.elements,n=e.elements;for(let s=0;s<16;s++)if(t[s]!==n[s])return!1;return!0}fromArray(e,t=0){for(let n=0;n<16;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){const n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e[t+9]=n[9],e[t+10]=n[10],e[t+11]=n[11],e[t+12]=n[12],e[t+13]=n[13],e[t+14]=n[14],e[t+15]=n[15],e}};pr.prototype.isMatrix4=!0;let xt=pr;const _i=new O,cn=new xt,Xu=new O(0,0,0),qu=new O(1,1,1),Vn=new O,ws=new O,jt=new O,il=new xt,sl=new Gi;class ei{constructor(e=0,t=0,n=0,s=ei.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=n,this._order=s}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,n,s=this._order){return this._x=e,this._y=t,this._z=n,this._order=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,n=!0){const s=e.elements,r=s[0],a=s[4],o=s[8],l=s[1],c=s[5],u=s[9],f=s[2],d=s[6],h=s[10];switch(t){case"XYZ":this._y=Math.asin(nt(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-u,h),this._z=Math.atan2(-a,r)):(this._x=Math.atan2(d,c),this._z=0);break;case"YXZ":this._x=Math.asin(-nt(u,-1,1)),Math.abs(u)<.9999999?(this._y=Math.atan2(o,h),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-f,r),this._z=0);break;case"ZXY":this._x=Math.asin(nt(d,-1,1)),Math.abs(d)<.9999999?(this._y=Math.atan2(-f,h),this._z=Math.atan2(-a,c)):(this._y=0,this._z=Math.atan2(l,r));break;case"ZYX":this._y=Math.asin(-nt(f,-1,1)),Math.abs(f)<.9999999?(this._x=Math.atan2(d,h),this._z=Math.atan2(l,r)):(this._x=0,this._z=Math.atan2(-a,c));break;case"YZX":this._z=Math.asin(nt(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-u,c),this._y=Math.atan2(-f,r)):(this._x=0,this._y=Math.atan2(o,h));break;case"XZY":this._z=Math.asin(-nt(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(d,c),this._y=Math.atan2(o,r)):(this._x=Math.atan2(-u,h),this._y=0);break;default:He("Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,n===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,n){return il.makeRotationFromQuaternion(e),this.setFromRotationMatrix(il,t,n)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return sl.setFromEuler(this),this.setFromQuaternion(sl,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}}ei.DEFAULT_ORDER="XYZ";class Bc{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}}let Yu=0;const rl=new O,vi=new Gi,Cn=new xt,Ts=new O,Wi=new O,$u=new O,Ku=new Gi,al=new O(1,0,0),ol=new O(0,1,0),ll=new O(0,0,1),cl={type:"added"},Zu={type:"removed"},xi={type:"childadded",child:null},Lr={type:"childremoved",child:null};class Bt extends pi{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:Yu++}),this.uuid=mi(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=Bt.DEFAULT_UP.clone();const e=new O,t=new ei,n=new Gi,s=new O(1,1,1);function r(){n.setFromEuler(t,!1)}function a(){t.setFromQuaternion(n,void 0,!1)}t._onChange(r),n._onChange(a),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:s},modelViewMatrix:{value:new xt},normalMatrix:{value:new Xe}}),this.matrix=new xt,this.matrixWorld=new xt,this.matrixAutoUpdate=Bt.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=Bt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new Bc,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.static=!1,this.userData={},this.pivot=null}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale),this.pivot!==null&&this.position.copy(this.pivot).applyMatrix4(this.matrix).sub(this.pivot)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return vi.setFromAxisAngle(e,t),this.quaternion.multiply(vi),this}rotateOnWorldAxis(e,t){return vi.setFromAxisAngle(e,t),this.quaternion.premultiply(vi),this}rotateX(e){return this.rotateOnAxis(al,e)}rotateY(e){return this.rotateOnAxis(ol,e)}rotateZ(e){return this.rotateOnAxis(ll,e)}translateOnAxis(e,t){return rl.copy(e).applyQuaternion(this.quaternion),this.position.add(rl.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(al,e)}translateY(e){return this.translateOnAxis(ol,e)}translateZ(e){return this.translateOnAxis(ll,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(Cn.copy(this.matrixWorld).invert())}lookAt(e,t,n){e.isVector3?Ts.copy(e):Ts.set(e,t,n);const s=this.parent;this.updateWorldMatrix(!0,!1),Wi.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?Cn.lookAt(Wi,Ts,this.up):Cn.lookAt(Ts,Wi,this.up),this.quaternion.setFromRotationMatrix(Cn),s&&(Cn.extractRotation(s.matrixWorld),vi.setFromRotationMatrix(Cn),this.quaternion.premultiply(vi.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(lt("Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(cl),xi.child=e,this.dispatchEvent(xi),xi.child=null):lt("Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}const t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(Zu),Lr.child=e,this.dispatchEvent(Lr),Lr.child=null),this}removeFromParent(){const e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),Cn.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),Cn.multiply(e.parent.matrixWorld)),e.applyMatrix4(Cn),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(cl),xi.child=e,this.dispatchEvent(xi),xi.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let n=0,s=this.children.length;n<s;n++){const a=this.children[n].getObjectByProperty(e,t);if(a!==void 0)return a}}getObjectsByProperty(e,t,n=[]){this[e]===t&&n.push(this);const s=this.children;for(let r=0,a=s.length;r<a;r++)s[r].getObjectsByProperty(e,t,n);return n}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Wi,e,$u),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Wi,Ku,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);const t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}intersectsFrustum(){return!0}traverse(e){e(this);const t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);const t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].traverseVisible(e)}traverseAncestors(e){const t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale);const e=this.pivot;if(e!==null){const t=e.x,n=e.y,s=e.z,r=this.matrix.elements;r[12]+=t-r[0]*t-r[4]*n-r[8]*s,r[13]+=n-r[1]*t-r[5]*n-r[9]*s,r[14]+=s-r[2]*t-r[6]*n-r[10]*s}this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);const t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].updateMatrixWorld(e)}updateWorldMatrix(e,t,n=!1){const s=this.parent;if(e===!0&&s!==null&&s.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||n)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,n=!0),t===!0){const r=this.children;for(let a=0,o=r.length;a<o;a++)r[a].updateWorldMatrix(!1,!0,n)}}toJSON(e){const t=e===void 0||typeof e=="string",n={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});const s={};s.uuid=this.uuid,s.type=this.type,s.name=this.name,s.castShadow=this.castShadow,s.receiveShadow=this.receiveShadow,s.visible=this.visible,s.frustumCulled=this.frustumCulled,s.renderOrder=this.renderOrder,s.static=this.static,s.matrixAutoUpdate=this.matrixAutoUpdate,Object.keys(this.userData).length>0&&(s.userData=this.userData),s.layers=this.layers.mask,s.matrix=this.matrix.toArray(),s.up=this.up.toArray(),this.pivot!==null&&(s.pivot=this.pivot.toArray()),this.morphTargetDictionary!==void 0&&(s.morphTargetDictionary=Object.assign({},this.morphTargetDictionary)),this.morphTargetInfluences!==void 0&&(s.morphTargetInfluences=this.morphTargetInfluences.slice()),this.isInstancedMesh&&(s.type="InstancedMesh",s.count=this.count,s.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(s.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(s.type="BatchedMesh",s.perObjectFrustumCulled=this.perObjectFrustumCulled,s.sortObjects=this.sortObjects,s.drawRanges=this._drawRanges,s.reservedRanges=this._reservedRanges,s.geometryInfo=this._geometryInfo.map(o=>({...o,boundingBox:o.boundingBox?o.boundingBox.toJSON():void 0,boundingSphere:o.boundingSphere?o.boundingSphere.toJSON():void 0})),s.instanceInfo=this._instanceInfo.map(o=>({...o})),s.availableInstanceIds=this._availableInstanceIds.slice(),s.availableGeometryIds=this._availableGeometryIds.slice(),s.nextIndexStart=this._nextIndexStart,s.nextVertexStart=this._nextVertexStart,s.geometryCount=this._geometryCount,s.maxInstanceCount=this._maxInstanceCount,s.maxVertexCount=this._maxVertexCount,s.maxIndexCount=this._maxIndexCount,s.geometryInitialized=this._geometryInitialized,s.matricesTexture=this._matricesTexture.toJSON(e),s.indirectTexture=this._indirectTexture.toJSON(e),this._colorsTexture!==null&&(s.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(s.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(s.boundingBox=this.boundingBox.toJSON()));function r(o,l){return o[l.uuid]===void 0&&(o[l.uuid]=l.toJSON(e)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?s.background=this.background.toJSON():this.background.isTexture&&(s.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(s.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){s.geometry=r(e.geometries,this.geometry);const o=this.geometry.parameters;if(o!==void 0&&o.shapes!==void 0){const l=o.shapes;if(Array.isArray(l))for(let c=0,u=l.length;c<u;c++){const f=l[c];r(e.shapes,f)}else r(e.shapes,l)}}if(this.isSkinnedMesh&&(s.bindMode=this.bindMode,s.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(e.skeletons,this.skeleton),s.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){const o=[];for(let l=0,c=this.material.length;l<c;l++)o.push(r(e.materials,this.material[l]));s.material=o}else s.material=r(e.materials,this.material);if(this.children.length>0){s.children=[];for(let o=0;o<this.children.length;o++)s.children.push(this.children[o].toJSON(e).object)}if(this.animations.length>0){s.animations=[];for(let o=0;o<this.animations.length;o++){const l=this.animations[o];s.animations.push(r(e.animations,l))}}if(t){const o=a(e.geometries),l=a(e.materials),c=a(e.textures),u=a(e.images),f=a(e.shapes),d=a(e.skeletons),h=a(e.animations),p=a(e.nodes);o.length>0&&(n.geometries=o),l.length>0&&(n.materials=l),c.length>0&&(n.textures=c),u.length>0&&(n.images=u),f.length>0&&(n.shapes=f),d.length>0&&(n.skeletons=d),h.length>0&&(n.animations=h),p.length>0&&(n.nodes=p)}return n.object=s,n;function a(o){const l=[];for(const c in o){const u=o[c];delete u.metadata,l.push(u)}return l}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.pivot=e.pivot!==null?e.pivot.clone():null,this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.static=e.static,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let n=0;n<e.children.length;n++){const s=e.children[n];this.add(s.clone())}return this}dispose(){this.dispatchEvent({type:"dispose"})}}Bt.DEFAULT_UP=new O(0,1,0);Bt.DEFAULT_MATRIX_AUTO_UPDATE=!0;Bt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;class Et extends Bt{constructor(){super(),this.isGroup=!0,this.type="Group"}}const Ju={type:"move"};class Dr{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new Et,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new Et,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new O,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new O),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new Et,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new O,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new O,this._grip.eventsEnabled=!1),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){const t=this._hand;if(t)for(const n of e.hand.values())this._getHandJoint(t,n)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,n){let s=null,r=null,a=null;const o=this._targetRay,l=this._grip,c=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(c&&e.hand){a=!0;for(const v of e.hand.values()){const m=t.getJointPose(v,n),g=this._getHandJoint(c,v);m!==null&&(g.matrix.fromArray(m.transform.matrix),g.matrix.decompose(g.position,g.quaternion,g.scale),g.matrixWorldNeedsUpdate=!0,g.jointRadius=m.radius),g.visible=m!==null}const u=c.joints["index-finger-tip"],f=c.joints["thumb-tip"],d=u.position.distanceTo(f.position),h=.02,p=.005;c.inputState.pinching&&d>h+p?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!c.inputState.pinching&&d<=h-p&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else l!==null&&e.gripSpace&&(r=t.getPose(e.gripSpace,n),r!==null&&(l.matrix.fromArray(r.transform.matrix),l.matrix.decompose(l.position,l.quaternion,l.scale),l.matrixWorldNeedsUpdate=!0,r.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(r.linearVelocity)):l.hasLinearVelocity=!1,r.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(r.angularVelocity)):l.hasAngularVelocity=!1,l.eventsEnabled&&l.dispatchEvent({type:"gripUpdated",data:e,target:this})));o!==null&&(s=t.getPose(e.targetRaySpace,n),s===null&&r!==null&&(s=r),s!==null&&(o.matrix.fromArray(s.transform.matrix),o.matrix.decompose(o.position,o.quaternion,o.scale),o.matrixWorldNeedsUpdate=!0,s.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(s.linearVelocity)):o.hasLinearVelocity=!1,s.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(s.angularVelocity)):o.hasAngularVelocity=!1,this.dispatchEvent(Ju)))}return o!==null&&(o.visible=s!==null),l!==null&&(l.visible=r!==null),c!==null&&(c.visible=a!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){const n=new Et;n.matrixAutoUpdate=!1,n.visible=!1,e.joints[t.jointName]=n,e.add(n)}return e.joints[t.jointName]}}const kc={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},Wn={h:0,s:0,l:0},As={h:0,s:0,l:0};function Ir(i,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?i+(e-i)*6*t:t<1/2?e:t<2/3?i+(e-i)*6*(2/3-t):i}class Ve{constructor(e,t,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,n)}set(e,t,n){if(t===void 0&&n===void 0){const s=e;s&&s.isColor?this.copy(s):typeof s=="number"?this.setHex(s):typeof s=="string"&&this.setStyle(s)}else this.setRGB(e,t,n);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=an){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,rt.colorSpaceToWorking(this,t),this}setRGB(e,t,n,s=rt.workingColorSpace){return this.r=e,this.g=t,this.b=n,rt.colorSpaceToWorking(this,s),this}setHSL(e,t,n,s=rt.workingColorSpace){if(e=lo(e,1),t=nt(t,0,1),n=nt(n,0,1),t===0)this.r=this.g=this.b=n;else{const r=n<=.5?n*(1+t):n+t-n*t,a=2*n-r;this.r=Ir(a,r,e+1/3),this.g=Ir(a,r,e),this.b=Ir(a,r,e-1/3)}return rt.colorSpaceToWorking(this,s),this}setStyle(e,t=an){function n(r){r!==void 0&&parseFloat(r)<1&&He("Color: Alpha component of "+e+" will be ignored.")}let s;if(s=/^(\w+)\(([^\)]*)\)/.exec(e)){let r;const a=s[1],o=s[2];switch(a){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d+(?:\.\d+)?|\.\d+)\s*)?$/.exec(o))return n(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,t);if(r=/^\s*(\d+(?:\.\d+)?|\.\d+)\%\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*(?:,\s*(\d+(?:\.\d+)?|\.\d+)\s*)?$/.exec(o))return n(r[4]),this.setRGB(Math.min(100,parseFloat(r[1]))/100,Math.min(100,parseFloat(r[2]))/100,Math.min(100,parseFloat(r[3]))/100,t);break;case"hsl":case"hsla":if(r=/^\s*([+-]?(?:\d+(?:\.\d+)?|\.\d+))\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*(?:,\s*(\d+(?:\.\d+)?|\.\d+)\s*)?$/.exec(o))return n(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,t);break;default:He("Color: Unknown color model "+e)}}else if(s=/^\#([A-Fa-f\d]+)$/.exec(e)){const r=s[1],a=r.length;if(a===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,t);if(a===6)return this.setHex(parseInt(r,16),t);He("Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=an){const n=kc[e.toLowerCase()];return n!==void 0?this.setHex(n,t):He("Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=Bn(e.r),this.g=Bn(e.g),this.b=Bn(e.b),this}copyLinearToSRGB(e){return this.r=Ii(e.r),this.g=Ii(e.g),this.b=Ii(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=an){return rt.workingToColorSpace(Wt.copy(this),e),Math.round(nt(Wt.r*255,0,255))*65536+Math.round(nt(Wt.g*255,0,255))*256+Math.round(nt(Wt.b*255,0,255))}getHexString(e=an){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=rt.workingColorSpace){rt.workingToColorSpace(Wt.copy(this),t);const n=Wt.r,s=Wt.g,r=Wt.b,a=Math.max(n,s,r),o=Math.min(n,s,r);let l,c;const u=(o+a)/2;if(o===a)l=0,c=0;else{const f=a-o;switch(c=u<=.5?f/(a+o):f/(2-a-o),a){case n:l=(s-r)/f+(s<r?6:0);break;case s:l=(r-n)/f+2;break;case r:l=(n-s)/f+4;break}l/=6}return e.h=l,e.s=c,e.l=u,e}getRGB(e,t=rt.workingColorSpace){return rt.workingToColorSpace(Wt.copy(this),t),e.r=Wt.r,e.g=Wt.g,e.b=Wt.b,e}getStyle(e=an){rt.workingToColorSpace(Wt.copy(this),e);const t=Wt.r,n=Wt.g,s=Wt.b;return e!==an?`color(${e} ${t.toFixed(3)} ${n.toFixed(3)} ${s.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(n*255)},${Math.round(s*255)})`}offsetHSL(e,t,n){return this.getHSL(Wn),this.setHSL(Wn.h+e,Wn.s+t,Wn.l+n)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,n){return this.r=e.r+(t.r-e.r)*n,this.g=e.g+(t.g-e.g)*n,this.b=e.b+(t.b-e.b)*n,this}lerpHSL(e,t){this.getHSL(Wn),e.getHSL(As);const n=is(Wn.h,As.h,t),s=is(Wn.s,As.s,t),r=is(Wn.l,As.l,t);return this.setHSL(n,s,r),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){const t=this.r,n=this.g,s=this.b,r=e.elements;return this.r=r[0]*t+r[3]*n+r[6]*s,this.g=r[1]*t+r[4]*n+r[7]*s,this.b=r[2]*t+r[5]*n+r[8]*s,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}}const Wt=new Ve;Ve.NAMES=kc;class uo{constructor(e,t=1,n=1e3){this.isFog=!0,this.name="",this.color=new Ve(e),this.near=t,this.far=n}clone(){return new uo(this.color,this.near,this.far)}toJSON(){return{type:"Fog",name:this.name,color:this.color.getHex(),near:this.near,far:this.far}}}class Qu extends Bt{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new ei,this.environmentIntensity=1,this.environmentRotation=new ei,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),this.background=e.background!==null?e.background.clone():null,this.environment=e.environment!==null?e.environment.clone():null,this.fog=e.fog!==null?e.fog.clone():null,this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),this.overrideMaterial=e.overrideMaterial!==null?e.overrideMaterial.clone():null,this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){const t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),t.object.backgroundBlurriness=this.backgroundBlurriness,t.object.backgroundIntensity=this.backgroundIntensity,t.object.backgroundRotation=this.backgroundRotation.toArray(),t.object.environmentIntensity=this.environmentIntensity,t.object.environmentRotation=this.environmentRotation.toArray(),t}}const hn=new O,Pn=new O,Nr=new O,Ln=new O,Mi=new O,Si=new O,hl=new O,Ur=new O,Fr=new O,Or=new O,Br=new bt,kr=new bt,zr=new bt;class fn{constructor(e=new O,t=new O,n=new O){this.a=e,this.b=t,this.c=n}static getNormal(e,t,n,s){s.subVectors(n,t),hn.subVectors(e,t),s.cross(hn);const r=s.lengthSq();return r>0?s.multiplyScalar(1/Math.sqrt(r)):s.set(0,0,0)}static getBarycoord(e,t,n,s,r){hn.subVectors(s,t),Pn.subVectors(n,t),Nr.subVectors(e,t);const a=hn.dot(hn),o=hn.dot(Pn),l=hn.dot(Nr),c=Pn.dot(Pn),u=Pn.dot(Nr),f=a*c-o*o;if(f===0)return r.set(0,0,0),null;const d=1/f,h=(c*l-o*u)*d,p=(a*u-o*l)*d;return r.set(1-h-p,p,h)}static containsPoint(e,t,n,s){return this.getBarycoord(e,t,n,s,Ln)===null?!1:Ln.x>=0&&Ln.y>=0&&Ln.x+Ln.y<=1}static getInterpolation(e,t,n,s,r,a,o,l){return this.getBarycoord(e,t,n,s,Ln)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(r,Ln.x),l.addScaledVector(a,Ln.y),l.addScaledVector(o,Ln.z),l)}static getInterpolatedAttribute(e,t,n,s,r,a){return Br.setScalar(0),kr.setScalar(0),zr.setScalar(0),Br.fromBufferAttribute(e,t),kr.fromBufferAttribute(e,n),zr.fromBufferAttribute(e,s),a.setScalar(0),a.addScaledVector(Br,r.x),a.addScaledVector(kr,r.y),a.addScaledVector(zr,r.z),a}static isFrontFacing(e,t,n,s){return hn.subVectors(n,t),Pn.subVectors(e,t),hn.cross(Pn).dot(s)<0}set(e,t,n){return this.a.copy(e),this.b.copy(t),this.c.copy(n),this}setFromPointsAndIndices(e,t,n,s){return this.a.copy(e[t]),this.b.copy(e[n]),this.c.copy(e[s]),this}setFromAttributeAndIndices(e,t,n,s){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,n),this.c.fromBufferAttribute(e,s),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return hn.subVectors(this.c,this.b),Pn.subVectors(this.a,this.b),hn.cross(Pn).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return fn.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return fn.getBarycoord(e,this.a,this.b,this.c,t)}getInterpolation(e,t,n,s,r){return fn.getInterpolation(e,this.a,this.b,this.c,t,n,s,r)}containsPoint(e){return fn.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return fn.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){const n=this.a,s=this.b,r=this.c;let a,o;Mi.subVectors(s,n),Si.subVectors(r,n),Ur.subVectors(e,n);const l=Mi.dot(Ur),c=Si.dot(Ur);if(l<=0&&c<=0)return t.copy(n);Fr.subVectors(e,s);const u=Mi.dot(Fr),f=Si.dot(Fr);if(u>=0&&f<=u)return t.copy(s);const d=l*f-u*c;if(d<=0&&l>=0&&u<=0&&l-u>0)return a=l/(l-u),t.copy(n).addScaledVector(Mi,a);Or.subVectors(e,r);const h=Mi.dot(Or),p=Si.dot(Or);if(p>=0&&h<=p)return t.copy(r);const v=h*c-l*p;if(v<=0&&c>=0&&p<=0)return o=c/(c-p),t.copy(n).addScaledVector(Si,o);const m=u*p-h*f;if(m<=0&&f-u>=0&&h-p>=0)return hl.subVectors(r,s),o=(f-u)/(f-u+(h-p)),t.copy(s).addScaledVector(hl,o);const g=1/(m+v+d);return a=v*g,o=d*g,t.copy(n).addScaledVector(Mi,a).addScaledVector(Si,o)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}}class ti{constructor(e=new O(1/0,1/0,1/0),t=new O(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t+=3)this.expandByPoint(un.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,n=e.count;t<n;t++)this.expandByPoint(un.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){const n=un.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(n),this.max.copy(e).add(n),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);const n=e.geometry;if(n!==void 0){const r=n.getAttribute("position");if(t===!0&&r!==void 0&&e.isInstancedMesh!==!0&&e.isBatchedMesh!==!0)for(let a=0,o=r.count;a<o;a++)e.isMesh===!0?e.getVertexPosition(a,un):un.fromBufferAttribute(r,a),un.applyMatrix4(e.matrixWorld),this.expandByPoint(un);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),Rs.copy(e.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),Rs.copy(n.boundingBox)),Rs.applyMatrix4(e.matrixWorld),this.union(Rs)}const s=e.children;for(let r=0,a=s.length;r<a;r++)this.expandByObject(s[r],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,un),un.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,n;return e.normal.x>0?(t=e.normal.x*this.min.x,n=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,n=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,n+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,n+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,n+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,n+=e.normal.z*this.min.z),t<=-e.constant&&n>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(Xi),Cs.subVectors(this.max,Xi),yi.subVectors(e.a,Xi),Ei.subVectors(e.b,Xi),bi.subVectors(e.c,Xi),Xn.subVectors(Ei,yi),qn.subVectors(bi,Ei),ri.subVectors(yi,bi);let t=[0,-Xn.z,Xn.y,0,-qn.z,qn.y,0,-ri.z,ri.y,Xn.z,0,-Xn.x,qn.z,0,-qn.x,ri.z,0,-ri.x,-Xn.y,Xn.x,0,-qn.y,qn.x,0,-ri.y,ri.x,0];return!Gr(t,yi,Ei,bi,Cs)||(t=[1,0,0,0,1,0,0,0,1],!Gr(t,yi,Ei,bi,Cs))?!1:(Ps.crossVectors(Xn,qn),t=[Ps.x,Ps.y,Ps.z],Gr(t,yi,Ei,bi,Cs))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,un).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(un).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(Dn[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),Dn[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),Dn[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),Dn[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),Dn[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),Dn[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),Dn[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),Dn[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(Dn),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(e){return this.min.fromArray(e.min),this.max.fromArray(e.max),this}}const Dn=[new O,new O,new O,new O,new O,new O,new O,new O],un=new O,Rs=new ti,yi=new O,Ei=new O,bi=new O,Xn=new O,qn=new O,ri=new O,Xi=new O,Cs=new O,Ps=new O,ai=new O;function Gr(i,e,t,n,s){for(let r=0,a=i.length-3;r<=a;r+=3){ai.fromArray(i,r);const o=s.x*Math.abs(ai.x)+s.y*Math.abs(ai.y)+s.z*Math.abs(ai.z),l=e.dot(ai),c=t.dot(ai),u=n.dot(ai);if(Math.max(-Math.max(l,c,u),Math.min(l,c,u))>o)return!1}return!0}const Ct=new O,Ls=new Se;let ju=0;class gn extends pi{constructor(e,t,n=!1){if(super(),Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:ju++}),this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=n,this.usage=xu,this.updateRanges=[],this.gpuType=yn,this.version=0,this._normalizationScale=e!==void 0?co(e):void 0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this._normalizationScale=e._normalizationScale,this}copyAt(e,t,n){e*=this.itemSize,n*=t.itemSize;for(let s=0,r=this.itemSize;s<r;s++)this.array[e+s]=t.array[n+s];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,n=this.count;t<n;t++)Ls.fromBufferAttribute(this,t),Ls.applyMatrix3(e),this.setXY(t,Ls.x,Ls.y);else if(this.itemSize===3)for(let t=0,n=this.count;t<n;t++)Ct.fromBufferAttribute(this,t),Ct.applyMatrix3(e),this.setXYZ(t,Ct.x,Ct.y,Ct.z);return this}applyMatrix4(e){for(let t=0,n=this.count;t<n;t++)Ct.fromBufferAttribute(this,t),Ct.applyMatrix4(e),this.setXYZ(t,Ct.x,Ct.y,Ct.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)Ct.fromBufferAttribute(this,t),Ct.applyNormalMatrix(e),this.setXYZ(t,Ct.x,Ct.y,Ct.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)Ct.fromBufferAttribute(this,t),Ct.transformDirection(e),this.setXYZ(t,Ct.x,Ct.y,Ct.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let n=this.array[e*this.itemSize+t];return this.normalized&&(n=this._denormalize(n)),n}setComponent(e,t,n){return this.normalized&&(n=this._normalize(n)),this.array[e*this.itemSize+t]=n,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=this._denormalize(t)),t}setX(e,t){return this.normalized&&(t=this._normalize(t)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=this._denormalize(t)),t}setY(e,t){return this.normalized&&(t=this._normalize(t)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=this._denormalize(t)),t}setZ(e,t){return this.normalized&&(t=this._normalize(t)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=this._denormalize(t)),t}setW(e,t){return this.normalized&&(t=this._normalize(t)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,n){return e*=this.itemSize,this.normalized&&(t=this._normalize(t),n=this._normalize(n)),this.array[e+0]=t,this.array[e+1]=n,this}setXYZ(e,t,n,s){return e*=this.itemSize,this.normalized&&(t=this._normalize(t),n=this._normalize(n),s=this._normalize(s)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=s,this}setXYZW(e,t,n,s,r){return e*=this.itemSize,this.normalized&&(t=this._normalize(t),n=this._normalize(n),s=this._normalize(s),r=this._normalize(r)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=s,this.array[e+3]=r,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){const e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return e.name=this.name,e.usage=this.usage,e.gpuType=this.gpuType,e}dispose(){this.dispatchEvent({type:"dispose"})}_denormalize(e){const t=this._normalizationScale;return t!==void 0?Math.max(e/t,-1):Nc(e,this.array)}_normalize(e){const t=this._normalizationScale;return t!==void 0?Math.round(e*t):Uc(e,this.array)}}class zc extends gn{constructor(e,t,n){super(new Uint16Array(e),t,n)}}class Gc extends gn{constructor(e,t,n){super(new Uint32Array(e),t,n)}}class Tt extends gn{constructor(e,t,n){super(new Float32Array(e),t,n)}}const ed=new ti,qi=new O,Hr=new O;class fo{constructor(e=new O,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){const n=this.center;t!==void 0?n.copy(t):ed.setFromPoints(e).getCenter(n);let s=0;for(let r=0,a=e.length;r<a;r++)s=Math.max(s,n.distanceToSquared(e[r]));return this.radius=Math.sqrt(s),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){const t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){const n=this.center.distanceToSquared(e);return t.copy(e),n>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;qi.subVectors(e,this.center);const t=qi.lengthSq();if(t>this.radius*this.radius){const n=Math.sqrt(t),s=(n-this.radius)*.5;this.center.addScaledVector(qi,s/n),this.radius+=s}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(Hr.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(qi.copy(e.center).add(Hr)),this.expandByPoint(qi.copy(e.center).sub(Hr))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(e){return this.radius=e.radius,this.center.fromArray(e.center),this}}let td=0;const rn=new xt,Vr=new Bt,wi=new O,en=new ti,Yi=new ti,Nt=new O;class Xt extends pi{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:td++}),this.uuid=mi(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={},this._transformed=!1}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(Mu(e)?Gc:zc)(e,1):this.index=e,this}setIndirect(e,t=0){return this.indirect=e,this.indirectOffset=t,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,n=0){this.groups.push({start:e,count:t,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){const t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);const n=this.attributes.normal;if(n!==void 0){const r=new Xe().getNormalMatrix(e);n.applyNormalMatrix(r),n.needsUpdate=!0}const s=this.attributes.tangent;return s!==void 0&&(s.transformDirection(e),s.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this._transformed=!0,this}applyQuaternion(e){return rn.makeRotationFromQuaternion(e),this.applyMatrix4(rn),this}rotateX(e){return rn.makeRotationX(e),this.applyMatrix4(rn),this}rotateY(e){return rn.makeRotationY(e),this.applyMatrix4(rn),this}rotateZ(e){return rn.makeRotationZ(e),this.applyMatrix4(rn),this}translate(e,t,n){return rn.makeTranslation(e,t,n),this.applyMatrix4(rn),this}scale(e,t,n){return rn.makeScale(e,t,n),this.applyMatrix4(rn),this}lookAt(e){return Vr.lookAt(e),Vr.updateMatrix(),this.applyMatrix4(Vr.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(wi).negate(),this.translate(wi.x,wi.y,wi.z),this}setFromPoints(e){const t=this.getAttribute("position");if(t===void 0){const n=[];for(let s=0,r=e.length;s<r;s++){const a=e[s];n.push(a.x,a.y,a.z||0)}this.setAttribute("position",new Tt(n,3))}else{const n=Math.min(e.length,t.count);for(let s=0;s<n;s++){const r=e[s];t.setXYZ(s,r.x,r.y,r.z||0)}e.length>t.count&&He("BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new ti);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){lt("BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new O(-1/0,-1/0,-1/0),new O(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let n=0,s=t.length;n<s;n++){const r=t[n];en.setFromBufferAttribute(r),this.morphTargetsRelative?(Nt.addVectors(this.boundingBox.min,en.min),this.boundingBox.expandByPoint(Nt),Nt.addVectors(this.boundingBox.max,en.max),this.boundingBox.expandByPoint(Nt)):(this.boundingBox.expandByPoint(en.min),this.boundingBox.expandByPoint(en.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&lt('BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new fo);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){lt("BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new O,1/0);return}if(e){const n=this.boundingSphere.center;if(en.setFromBufferAttribute(e),t)for(let r=0,a=t.length;r<a;r++){const o=t[r];Yi.setFromBufferAttribute(o),this.morphTargetsRelative?(Nt.addVectors(en.min,Yi.min),en.expandByPoint(Nt),Nt.addVectors(en.max,Yi.max),en.expandByPoint(Nt)):(en.expandByPoint(Yi.min),en.expandByPoint(Yi.max))}en.getCenter(n);let s=0;for(let r=0,a=e.count;r<a;r++)Nt.fromBufferAttribute(e,r),s=Math.max(s,n.distanceToSquared(Nt));if(t)for(let r=0,a=t.length;r<a;r++){const o=t[r],l=this.morphTargetsRelative;for(let c=0,u=o.count;c<u;c++)Nt.fromBufferAttribute(o,c),l&&(wi.fromBufferAttribute(e,c),Nt.add(wi)),s=Math.max(s,n.distanceToSquared(Nt))}this.boundingSphere.radius=Math.sqrt(s),isNaN(this.boundingSphere.radius)&&lt('BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){const e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){lt("BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}const n=t.position,s=t.normal,r=t.uv;let a=this.getAttribute("tangent");(a===void 0||a.count!==n.count)&&(a=new gn(new Float32Array(4*n.count),4),this.setAttribute("tangent",a));const o=[],l=[],c=new Uint8Array(n.count);for(let P=0;P<n.count;P++)o[P]=new O,l[P]=new O;const u=new O,f=new O,d=new O,h=new Se,p=new Se,v=new Se,m=new O,g=new O;function x(P,R,C){c[P]=c[R]=c[C]=1,u.fromBufferAttribute(n,P),f.fromBufferAttribute(n,R),d.fromBufferAttribute(n,C),h.fromBufferAttribute(r,P),p.fromBufferAttribute(r,R),v.fromBufferAttribute(r,C),f.sub(u),d.sub(u),p.sub(h),v.sub(h);const F=1/(p.x*v.y-v.x*p.y);isFinite(F)&&(m.copy(f).multiplyScalar(v.y).addScaledVector(d,-p.y).multiplyScalar(F),g.copy(d).multiplyScalar(p.x).addScaledVector(f,-v.x).multiplyScalar(F),o[P].add(m),o[R].add(m),o[C].add(m),l[P].add(g),l[R].add(g),l[C].add(g))}let M=this.groups;M.length===0&&(M=[{start:0,count:e.count}]);for(let P=0,R=M.length;P<R;++P){const C=M[P],F=C.start,V=C.count;for(let D=F,z=F+V;D<z;D+=3)x(e.getX(D+0),e.getX(D+1),e.getX(D+2))}const S=new O,w=new O,T=new O,_=new O;function b(P){T.fromBufferAttribute(s,P),_.copy(T);const R=o[P];S.copy(R),S.sub(T.multiplyScalar(T.dot(R))).normalize(),w.crossVectors(_,R);const F=w.dot(l[P])<0?-1:1;a.setXYZW(P,S.x,S.y,S.z,F)}for(let P=0,R=n.count;P<R;++P)c[P]&&b(P);this._transformed=!0}computeVertexNormals(){const e=this.index,t=this.getAttribute("position");if(t!==void 0){let n=this.getAttribute("normal");if(n===void 0||n.count!==t.count)n=new gn(new Float32Array(t.count*3),3),this.setAttribute("normal",n);else for(let d=0,h=n.count;d<h;d++)n.setXYZ(d,0,0,0);const s=new O,r=new O,a=new O,o=new O,l=new O,c=new O,u=new O,f=new O;if(e)for(let d=0,h=e.count;d<h;d+=3){const p=e.getX(d+0),v=e.getX(d+1),m=e.getX(d+2);s.fromBufferAttribute(t,p),r.fromBufferAttribute(t,v),a.fromBufferAttribute(t,m),u.subVectors(a,r),f.subVectors(s,r),u.cross(f),o.fromBufferAttribute(n,p),l.fromBufferAttribute(n,v),c.fromBufferAttribute(n,m),o.add(u),l.add(u),c.add(u),n.setXYZ(p,o.x,o.y,o.z),n.setXYZ(v,l.x,l.y,l.z),n.setXYZ(m,c.x,c.y,c.z)}else for(let d=0,h=t.count;d<h;d+=3)s.fromBufferAttribute(t,d+0),r.fromBufferAttribute(t,d+1),a.fromBufferAttribute(t,d+2),u.subVectors(a,r),f.subVectors(s,r),u.cross(f),n.setXYZ(d+0,u.x,u.y,u.z),n.setXYZ(d+1,u.x,u.y,u.z),n.setXYZ(d+2,u.x,u.y,u.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){const e=this.attributes.normal;for(let t=0,n=e.count;t<n;t++)Nt.fromBufferAttribute(e,t),Nt.normalize(),e.setXYZ(t,Nt.x,Nt.y,Nt.z)}toNonIndexed(){function e(o,l){const c=o.array,u=o.itemSize,f=o.normalized,d=new c.constructor(l.length*u);let h=0,p=0;for(let v=0,m=l.length;v<m;v++){o.isInterleavedBufferAttribute?h=l[v]*o.data.stride+o.offset:h=l[v]*u;for(let g=0;g<u;g++)d[p++]=c[h++]}return new gn(d,u,f)}if(this.index===null)return He("BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;const t=new Xt,n=this.index.array,s=this.attributes;for(const o in s){const l=s[o],c=e(l,n);t.setAttribute(o,c)}const r=this.morphAttributes;for(const o in r){const l=[],c=r[o];for(let u=0,f=c.length;u<f;u++){const d=c[u],h=e(d,n);l.push(h)}t.morphAttributes[o]=l}t.morphTargetsRelative=this.morphTargetsRelative;const a=this.groups;for(let o=0,l=a.length;o<l;o++){const c=a[o];t.addGroup(c.start,c.count,c.materialIndex)}return t}toJSON(){const e={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.parameters!==void 0&&this._transformed===!0?"BufferGeometry":this.type,e.name=this.name,Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0&&this._transformed!==!0){const l=this.parameters;for(const c in l)l[c]!==void 0&&(e[c]=l[c]);return e}e.data={attributes:{}};const t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});const n=this.attributes;for(const l in n){const c=n[l];e.data.attributes[l]=c.toJSON(e.data)}const s={};let r=!1;for(const l in this.morphAttributes){const c=this.morphAttributes[l],u=[];for(let f=0,d=c.length;f<d;f++){const h=c[f];u.push(h.toJSON(e.data))}u.length>0&&(s[l]=u,r=!0)}r&&(e.data.morphAttributes=s,e.data.morphTargetsRelative=this.morphTargetsRelative);const a=this.groups;a.length>0&&(e.data.groups=JSON.parse(JSON.stringify(a)));const o=this.boundingSphere;return o!==null&&(e.data.boundingSphere=o.toJSON()),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;const t={};this.name=e.name;const n=e.index;n!==null&&this.setIndex(n.clone());const s=e.attributes;for(const c in s){const u=s[c];this.setAttribute(c,u.clone(t))}const r=e.morphAttributes;for(const c in r){const u=[],f=r[c];for(let d=0,h=f.length;d<h;d++)u.push(f[d].clone(t));this.morphAttributes[c]=u}this.morphTargetsRelative=e.morphTargetsRelative;const a=e.groups;for(let c=0,u=a.length;c<u;c++){const f=a[c];this.addGroup(f.start,f.count,f.materialIndex)}const o=e.boundingBox;o!==null&&(this.boundingBox=o.clone());const l=e.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this._transformed=e._transformed,this}dispose(){this.dispatchEvent({type:"dispose"})}}const Wr=new O,nd=new O,id=new Xe;class $n{constructor(e=new O(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,n,s){return this.normal.set(e,t,n),this.constant=s,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,n){const s=Wr.subVectors(n,t).cross(nd.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(s,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){const e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t,n=!0){const s=e.delta(Wr),r=this.normal.dot(s);if(r===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;const a=-(e.start.dot(this.normal)+this.constant)/r;return n===!0&&(a<0||a>1)?null:t.copy(e.start).addScaledVector(s,a)}intersectsLine(e){const t=this.distanceToPoint(e.start),n=this.distanceToPoint(e.end);return t<0&&n>0||n<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){const n=t||id.getNormalMatrix(e),s=this.coplanarPoint(Wr).applyMatrix4(e),r=this.normal.applyMatrix3(n).normalize();return this.constant=-s.dot(r),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}toJSON(){return{normal:this.normal.toArray(),constant:this.constant}}fromJSON(e){return this.normal.fromArray(e.normal),this.constant=e.constant,this}}let sd=0;class vs extends pi{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:sd++}),this.uuid=mi(),this.name="",this.type="Material",this.blending=ts,this.side=hi,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=dc,this.blendDst=fc,this.blendEquation=Ri,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new Ve(0,0,0),this.blendAlpha=0,this.depthFunc=os,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=fu,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=Tr,this.stencilZFail=Tr,this.stencilZPass=Tr,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(const t in e){const n=e[t];if(n===void 0){He(`Material: parameter '${t}' has value of undefined.`);continue}const s=this[t];if(s===void 0){He(`Material: '${t}' is not a property of THREE.${this.type}.`);continue}s&&s.isColor?s.set(n):s&&s.isVector2&&n&&n.isVector2||s&&s.isEuler&&n&&n.isEuler||s&&s.isVector3&&n&&n.isVector3?s.copy(n):this[t]=n}}toJSON(e){const t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});const n={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,n.blending=this.blending,n.side=this.side,n.shadowSide=this.shadowSide,n.vertexColors=this.vertexColors,n.opacity=this.opacity,n.transparent=this.transparent,n.blendSrc=this.blendSrc,n.blendDst=this.blendDst,n.blendEquation=this.blendEquation,n.blendSrcAlpha=this.blendSrcAlpha,n.blendDstAlpha=this.blendDstAlpha,n.blendEquationAlpha=this.blendEquationAlpha,n.blendColor=this.blendColor.getHex(),n.blendAlpha=this.blendAlpha,n.depthFunc=this.depthFunc,n.depthTest=this.depthTest,n.depthWrite=this.depthWrite,n.colorWrite=this.colorWrite,n.clipIntersection=this.clipIntersection,n.clipShadows=this.clipShadows,n.stencilWriteMask=this.stencilWriteMask,n.stencilFunc=this.stencilFunc,n.stencilRef=this.stencilRef,n.stencilFuncMask=this.stencilFuncMask,n.stencilFail=this.stencilFail,n.stencilZFail=this.stencilZFail,n.stencilZPass=this.stencilZPass,n.stencilWrite=this.stencilWrite,n.polygonOffset=this.polygonOffset,n.polygonOffsetFactor=this.polygonOffsetFactor,n.polygonOffsetUnits=this.polygonOffsetUnits,n.dithering=this.dithering,n.alphaTest=this.alphaTest,n.alphaHash=this.alphaHash,n.alphaToCoverage=this.alphaToCoverage,n.premultipliedAlpha=this.premultipliedAlpha,n.forceSinglePass=this.forceSinglePass,n.allowOverride=this.allowOverride,n.visible=this.visible,n.toneMapped=this.toneMapped,n.name=this.name,this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.diffuseRoughness!==void 0&&(n.diffuseRoughness=this.diffuseRoughness),this.diffuseRoughnessMap&&this.diffuseRoughnessMap.isTexture&&(n.diffuseRoughnessMap=this.diffuseRoughnessMap.toJSON(e).uuid),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(n.sheenColorMap=this.sheenColorMap.toJSON(e).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(n.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(e).uuid),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.retroreflectivity!==void 0&&(n.retroreflectivity=this.retroreflectivity),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessMinimum!==void 0&&(n.iridescenceThicknessMinimum=this.iridescenceThicknessMinimum),this.iridescenceThicknessMaximum!==void 0&&(n.iridescenceThicknessMaximum=this.iridescenceThicknessMaximum),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(e).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(e).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(e).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(e).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(e).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),Array.isArray(this.clippingPlanes)&&this.clippingPlanes.length>0&&(n.clippingPlanes=this.clippingPlanes.map(r=>r.toJSON())),this.rotation!==void 0&&(n.rotation=this.rotation),this.depthPacking!==void 0&&(n.depthPacking=this.depthPacking),this.linewidth!==void 0&&(n.linewidth=this.linewidth),this.linecap!==void 0&&(n.linecap=this.linecap),this.linejoin!==void 0&&(n.linejoin=this.linejoin),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.wireframe!==void 0&&(n.wireframe=this.wireframe),this.wireframeLinewidth!==void 0&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!==void 0&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!==void 0&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading!==void 0&&(n.flatShading=this.flatShading),this.fog!==void 0&&(n.fog=this.fog),Object.keys(this.userData).length>0&&(n.userData=this.userData);function s(r){const a=[];for(const o in r){const l=r[o];delete l.metadata,a.push(l)}return a}if(t){const r=s(e.textures),a=s(e.images);r.length>0&&(n.textures=r),a.length>0&&(n.images=a)}return n}fromJSON(e,t){if(e.uuid!==void 0&&(this.uuid=e.uuid),e.name!==void 0&&(this.name=e.name),e.color!==void 0&&this.color!==void 0&&this.color.setHex(e.color),e.roughness!==void 0&&(this.roughness=e.roughness),e.metalness!==void 0&&(this.metalness=e.metalness),e.sheen!==void 0&&(this.sheen=e.sheen),e.sheenColor!==void 0&&(this.sheenColor=new Ve().setHex(e.sheenColor)),e.sheenRoughness!==void 0&&(this.sheenRoughness=e.sheenRoughness),e.emissive!==void 0&&this.emissive!==void 0&&this.emissive.setHex(e.emissive),e.specular!==void 0&&this.specular!==void 0&&this.specular.setHex(e.specular),e.specularIntensity!==void 0&&(this.specularIntensity=e.specularIntensity),e.specularColor!==void 0&&this.specularColor!==void 0&&this.specularColor.setHex(e.specularColor),e.shininess!==void 0&&(this.shininess=e.shininess),e.clearcoat!==void 0&&(this.clearcoat=e.clearcoat),e.clearcoatRoughness!==void 0&&(this.clearcoatRoughness=e.clearcoatRoughness),e.diffuseRoughness!==void 0&&(this.diffuseRoughness=e.diffuseRoughness),e.dispersion!==void 0&&(this.dispersion=e.dispersion),e.retroreflectivity!==void 0&&(this.retroreflectivity=e.retroreflectivity),e.iridescence!==void 0&&(this.iridescence=e.iridescence),e.iridescenceIOR!==void 0&&(this.iridescenceIOR=e.iridescenceIOR),e.iridescenceThicknessMinimum!==void 0&&(this.iridescenceThicknessMinimum=e.iridescenceThicknessMinimum),e.iridescenceThicknessMaximum!==void 0&&(this.iridescenceThicknessMaximum=e.iridescenceThicknessMaximum),e.iridescenceThicknessRange!==void 0&&(this.iridescenceThicknessMinimum=e.iridescenceThicknessRange[0],this.iridescenceThicknessMaximum=e.iridescenceThicknessRange[1]),e.transmission!==void 0&&(this.transmission=e.transmission),e.thickness!==void 0&&(this.thickness=e.thickness),e.attenuationDistance!==void 0&&(this.attenuationDistance=e.attenuationDistance),e.attenuationColor!==void 0&&this.attenuationColor!==void 0&&this.attenuationColor.setHex(e.attenuationColor),e.anisotropy!==void 0&&(this.anisotropy=e.anisotropy),e.anisotropyRotation!==void 0&&(this.anisotropyRotation=e.anisotropyRotation),e.fog!==void 0&&(this.fog=e.fog),e.flatShading!==void 0&&(this.flatShading=e.flatShading),e.blending!==void 0&&(this.blending=e.blending),e.combine!==void 0&&(this.combine=e.combine),e.side!==void 0&&(this.side=e.side),e.shadowSide!==void 0&&(this.shadowSide=e.shadowSide),e.opacity!==void 0&&(this.opacity=e.opacity),e.transparent!==void 0&&(this.transparent=e.transparent),e.alphaTest!==void 0&&(this.alphaTest=e.alphaTest),e.alphaHash!==void 0&&(this.alphaHash=e.alphaHash),e.depthFunc!==void 0&&(this.depthFunc=e.depthFunc),e.depthTest!==void 0&&(this.depthTest=e.depthTest),e.depthWrite!==void 0&&(this.depthWrite=e.depthWrite),e.colorWrite!==void 0&&(this.colorWrite=e.colorWrite),e.clippingPlanes!==void 0&&(this.clippingPlanes=e.clippingPlanes.map(n=>new $n().fromJSON(n))),e.clipIntersection!==void 0&&(this.clipIntersection=e.clipIntersection),e.clipShadows!==void 0&&(this.clipShadows=e.clipShadows),e.depthPacking!==void 0&&(this.depthPacking=e.depthPacking),e.blendSrc!==void 0&&(this.blendSrc=e.blendSrc),e.blendDst!==void 0&&(this.blendDst=e.blendDst),e.blendEquation!==void 0&&(this.blendEquation=e.blendEquation),e.blendSrcAlpha!==void 0&&(this.blendSrcAlpha=e.blendSrcAlpha),e.blendDstAlpha!==void 0&&(this.blendDstAlpha=e.blendDstAlpha),e.blendEquationAlpha!==void 0&&(this.blendEquationAlpha=e.blendEquationAlpha),e.blendColor!==void 0&&this.blendColor!==void 0&&this.blendColor.setHex(e.blendColor),e.blendAlpha!==void 0&&(this.blendAlpha=e.blendAlpha),e.stencilWriteMask!==void 0&&(this.stencilWriteMask=e.stencilWriteMask),e.stencilFunc!==void 0&&(this.stencilFunc=e.stencilFunc),e.stencilRef!==void 0&&(this.stencilRef=e.stencilRef),e.stencilFuncMask!==void 0&&(this.stencilFuncMask=e.stencilFuncMask),e.stencilFail!==void 0&&(this.stencilFail=e.stencilFail),e.stencilZFail!==void 0&&(this.stencilZFail=e.stencilZFail),e.stencilZPass!==void 0&&(this.stencilZPass=e.stencilZPass),e.stencilWrite!==void 0&&(this.stencilWrite=e.stencilWrite),e.wireframe!==void 0&&(this.wireframe=e.wireframe),e.wireframeLinewidth!==void 0&&(this.wireframeLinewidth=e.wireframeLinewidth),e.wireframeLinecap!==void 0&&(this.wireframeLinecap=e.wireframeLinecap),e.wireframeLinejoin!==void 0&&(this.wireframeLinejoin=e.wireframeLinejoin),e.rotation!==void 0&&(this.rotation=e.rotation),e.linewidth!==void 0&&(this.linewidth=e.linewidth),e.linecap!==void 0&&(this.linecap=e.linecap),e.linejoin!==void 0&&(this.linejoin=e.linejoin),e.dashSize!==void 0&&(this.dashSize=e.dashSize),e.gapSize!==void 0&&(this.gapSize=e.gapSize),e.scale!==void 0&&(this.scale=e.scale),e.polygonOffset!==void 0&&(this.polygonOffset=e.polygonOffset),e.polygonOffsetFactor!==void 0&&(this.polygonOffsetFactor=e.polygonOffsetFactor),e.polygonOffsetUnits!==void 0&&(this.polygonOffsetUnits=e.polygonOffsetUnits),e.dithering!==void 0&&(this.dithering=e.dithering),e.alphaToCoverage!==void 0&&(this.alphaToCoverage=e.alphaToCoverage),e.premultipliedAlpha!==void 0&&(this.premultipliedAlpha=e.premultipliedAlpha),e.forceSinglePass!==void 0&&(this.forceSinglePass=e.forceSinglePass),e.allowOverride!==void 0&&(this.allowOverride=e.allowOverride),e.visible!==void 0&&(this.visible=e.visible),e.toneMapped!==void 0&&(this.toneMapped=e.toneMapped),e.userData!==void 0&&(this.userData=e.userData),e.vertexColors!==void 0&&(typeof e.vertexColors=="number"?this.vertexColors=e.vertexColors>0:this.vertexColors=e.vertexColors),e.size!==void 0&&(this.size=e.size),e.sizeAttenuation!==void 0&&(this.sizeAttenuation=e.sizeAttenuation),e.map!==void 0&&(this.map=t[e.map]||null),e.matcap!==void 0&&(this.matcap=t[e.matcap]||null),e.alphaMap!==void 0&&(this.alphaMap=t[e.alphaMap]||null),e.bumpMap!==void 0&&(this.bumpMap=t[e.bumpMap]||null),e.bumpScale!==void 0&&(this.bumpScale=e.bumpScale),e.normalMap!==void 0&&(this.normalMap=t[e.normalMap]||null),e.normalMapType!==void 0&&(this.normalMapType=e.normalMapType),e.normalScale!==void 0){let n=e.normalScale;Array.isArray(n)===!1&&(n=[n,n]),this.normalScale=new Se().fromArray(n)}return e.displacementMap!==void 0&&(this.displacementMap=t[e.displacementMap]||null),e.displacementScale!==void 0&&(this.displacementScale=e.displacementScale),e.displacementBias!==void 0&&(this.displacementBias=e.displacementBias),e.roughnessMap!==void 0&&(this.roughnessMap=t[e.roughnessMap]||null),e.metalnessMap!==void 0&&(this.metalnessMap=t[e.metalnessMap]||null),e.emissiveMap!==void 0&&(this.emissiveMap=t[e.emissiveMap]||null),e.emissiveIntensity!==void 0&&(this.emissiveIntensity=e.emissiveIntensity),e.specularMap!==void 0&&(this.specularMap=t[e.specularMap]||null),e.specularIntensityMap!==void 0&&(this.specularIntensityMap=t[e.specularIntensityMap]||null),e.specularColorMap!==void 0&&(this.specularColorMap=t[e.specularColorMap]||null),e.envMap!==void 0&&(this.envMap=t[e.envMap]||null),e.envMapRotation!==void 0&&this.envMapRotation.fromArray(e.envMapRotation),e.envMapIntensity!==void 0&&(this.envMapIntensity=e.envMapIntensity),e.reflectivity!==void 0&&(this.reflectivity=e.reflectivity),e.refractionRatio!==void 0&&(this.refractionRatio=e.refractionRatio),e.lightMap!==void 0&&(this.lightMap=t[e.lightMap]||null),e.lightMapIntensity!==void 0&&(this.lightMapIntensity=e.lightMapIntensity),e.aoMap!==void 0&&(this.aoMap=t[e.aoMap]||null),e.aoMapIntensity!==void 0&&(this.aoMapIntensity=e.aoMapIntensity),e.gradientMap!==void 0&&(this.gradientMap=t[e.gradientMap]||null),e.clearcoatMap!==void 0&&(this.clearcoatMap=t[e.clearcoatMap]||null),e.clearcoatRoughnessMap!==void 0&&(this.clearcoatRoughnessMap=t[e.clearcoatRoughnessMap]||null),e.clearcoatNormalMap!==void 0&&(this.clearcoatNormalMap=t[e.clearcoatNormalMap]||null),e.clearcoatNormalScale!==void 0&&(this.clearcoatNormalScale=new Se().fromArray(e.clearcoatNormalScale)),e.diffuseRoughnessMap!==void 0&&(this.diffuseRoughnessMap=t[e.diffuseRoughnessMap]||null),e.iridescenceMap!==void 0&&(this.iridescenceMap=t[e.iridescenceMap]||null),e.iridescenceThicknessMap!==void 0&&(this.iridescenceThicknessMap=t[e.iridescenceThicknessMap]||null),e.transmissionMap!==void 0&&(this.transmissionMap=t[e.transmissionMap]||null),e.thicknessMap!==void 0&&(this.thicknessMap=t[e.thicknessMap]||null),e.anisotropyMap!==void 0&&(this.anisotropyMap=t[e.anisotropyMap]||null),e.sheenColorMap!==void 0&&(this.sheenColorMap=t[e.sheenColorMap]||null),e.sheenRoughnessMap!==void 0&&(this.sheenRoughnessMap=t[e.sheenRoughnessMap]||null),this}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;const t=e.clippingPlanes;let n=null;if(t!==null){const s=t.length;n=new Array(s);for(let r=0;r!==s;++r)n[r]=t[r].clone()}return this.clippingPlanes=n,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.allowOverride=e.allowOverride,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}}const In=new O,Xr=new O,Ds=new O,Is=new O;class rd{constructor(e=new O,t=new O(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,In)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);const n=t.dot(this.direction);return n<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){const t=In.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(In.copy(this.origin).addScaledVector(this.direction,t),In.distanceToSquared(e))}distanceSqToSegment(e,t,n,s){Xr.copy(e).add(t).multiplyScalar(.5),Ds.copy(t).sub(e).normalize(),Is.copy(this.origin).sub(Xr);const r=e.distanceTo(t)*.5,a=-this.direction.dot(Ds),o=Is.dot(this.direction),l=-Is.dot(Ds),c=Is.lengthSq(),u=Math.abs(1-a*a);let f,d,h,p;if(u>0)if(f=a*l-o,d=a*o-l,p=r*u,f>=0)if(d>=-p)if(d<=p){const v=1/u;f*=v,d*=v,h=f*(f+a*d+2*o)+d*(a*f+d+2*l)+c}else d=r,f=Math.max(0,-(a*d+o)),h=-f*f+d*(d+2*l)+c;else d=-r,f=Math.max(0,-(a*d+o)),h=-f*f+d*(d+2*l)+c;else d<=-p?(f=Math.max(0,-(-a*r+o)),d=f>0?-r:Math.min(Math.max(-r,-l),r),h=-f*f+d*(d+2*l)+c):d<=p?(f=0,d=Math.min(Math.max(-r,-l),r),h=d*(d+2*l)+c):(f=Math.max(0,-(a*r+o)),d=f>0?r:Math.min(Math.max(-r,-l),r),h=-f*f+d*(d+2*l)+c);else d=a>0?-r:r,f=Math.max(0,-(a*d+o)),h=-f*f+d*(d+2*l)+c;return n&&n.copy(this.origin).addScaledVector(this.direction,f),s&&s.copy(Xr).addScaledVector(Ds,d),h}intersectSphere(e,t){if(e.radius<0)return null;In.subVectors(e.center,this.origin);const n=In.dot(this.direction),s=In.dot(In)-n*n,r=e.radius*e.radius;if(s>r)return null;const a=Math.sqrt(r-s),o=n-a,l=n+a;return l<0?null:o<0?this.at(l,t):this.at(o,t)}intersectsSphere(e){return e.radius<0?!1:this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){const t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;const n=-(this.origin.dot(e.normal)+e.constant)/t;return n>=0?n:null}intersectPlane(e,t){const n=this.distanceToPlane(e);return n===null?null:this.at(n,t)}intersectsPlane(e){const t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let n,s,r,a,o,l;const c=1/this.direction.x,u=1/this.direction.y,f=1/this.direction.z,d=this.origin;return c>=0?(n=(e.min.x-d.x)*c,s=(e.max.x-d.x)*c):(n=(e.max.x-d.x)*c,s=(e.min.x-d.x)*c),u>=0?(r=(e.min.y-d.y)*u,a=(e.max.y-d.y)*u):(r=(e.max.y-d.y)*u,a=(e.min.y-d.y)*u),n>a||r>s||((r>n||isNaN(n))&&(n=r),(a<s||isNaN(s))&&(s=a),f>=0?(o=(e.min.z-d.z)*f,l=(e.max.z-d.z)*f):(o=(e.max.z-d.z)*f,l=(e.min.z-d.z)*f),n>l||o>s)||((o>n||n!==n)&&(n=o),(l<s||s!==s)&&(s=l),s<0)?null:this.at(n>=0?n:s,t)}intersectsBox(e){return this.intersectBox(e,In)!==null}intersectTriangle(e,t,n,s,r){const a=this.origin,o=this.direction,l=o.x,c=o.y,u=o.z,f=e.x-a.x,d=e.y-a.y,h=e.z-a.z,p=t.x-a.x,v=t.y-a.y,m=t.z-a.z,g=n.x-a.x,x=n.y-a.y,M=n.z-a.z,S=Math.abs(l),w=Math.abs(c),T=Math.abs(u);let _,b,P,R,C,F,V,D,z,X,k,se;if(S>=w&&S>=T?(P=l,F=f,z=p,se=g,l>=0?(_=c,b=u,R=d,C=h,V=v,D=m,X=x,k=M):(_=u,b=c,R=h,C=d,V=m,D=v,X=M,k=x)):w>=T?(P=c,F=d,z=v,se=x,c>=0?(_=u,b=l,R=h,C=f,V=m,D=p,X=M,k=g):(_=l,b=u,R=f,C=h,V=p,D=m,X=g,k=M)):(P=u,F=h,z=m,se=M,u>=0?(_=l,b=c,R=f,C=d,V=p,D=v,X=g,k=x):(_=c,b=l,R=d,C=f,V=v,D=p,X=x,k=g)),P===0)return null;const $=_/P,ee=b/P,ie=1/P,we=R-$*F,Fe=C-ee*F,K=V-$*z,ge=D-ee*z,Te=X-$*se,Ue=k-ee*se,Me=Te*ge-Ue*K,Oe=we*Ue-Fe*Te,pt=K*Fe-ge*we;if(s){if(Me<0||Oe<0||pt<0)return null}else if((Me<0||Oe<0||pt<0)&&(Me>0||Oe>0||pt>0))return null;const ze=Me+Oe+pt;if(ze===0)return null;const Ye=ie*(Me*F+Oe*z+pt*se);return(ze>0?Ye<0:Ye>0)?null:this.at(Ye/ze,r)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}}class ad extends vs{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new Ve(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new ei,this.combine=pc,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}}const ul=new xt,oi=new rd,Ns=new fo,dl=new O,Us=new O,Fs=new O,Os=new O,qr=new O,Bs=new O,fl=new O,ks=new O;class kt extends Bt{constructor(e=new Xt,t=new ad){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0?this.morphTargetInfluences=e.morphTargetInfluences.slice():this.morphTargetInfluences=void 0,e.morphTargetDictionary!==void 0?this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary):this.morphTargetDictionary=void 0,this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){const t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){const s=t[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=s.length;r<a;r++){const o=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}getVertexPosition(e,t){const n=this.geometry,s=n.attributes.position,r=n.morphAttributes.position,a=n.morphTargetsRelative;t.fromBufferAttribute(s,e);const o=this.morphTargetInfluences;if(r&&o){Bs.set(0,0,0);for(let l=0,c=r.length;l<c;l++){const u=o[l],f=r[l];u!==0&&(qr.fromBufferAttribute(f,e),a?Bs.addScaledVector(qr,u):Bs.addScaledVector(qr.sub(t),u))}t.add(Bs)}return t}intersectsFrustum(e){return e.intersectsObject(this)}raycast(e,t){const n=this.geometry,s=this.material,r=this.matrixWorld;s!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),Ns.copy(n.boundingSphere),Ns.applyMatrix4(r),oi.copy(e.ray).recast(e.near),!(Ns.containsPoint(oi.origin)===!1&&(oi.intersectSphere(Ns,dl)===null||oi.origin.distanceToSquared(dl)>(e.far-e.near)**2))&&(ul.copy(r).invert(),oi.copy(e.ray).applyMatrix4(ul),!(n.boundingBox!==null&&oi.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(e,t,oi)))}_computeIntersections(e,t,n){let s;const r=this.geometry,a=this.material,o=r.index,l=r.attributes.position,c=r.attributes.uv,u=r.attributes.uv1,f=r.attributes.normal,d=r.groups,h=r.drawRange;if(o!==null)if(Array.isArray(a))for(let p=0,v=d.length;p<v;p++){const m=d[p],g=a[m.materialIndex],x=Math.max(m.start,h.start),M=Math.min(o.count,Math.min(m.start+m.count,h.start+h.count));for(let S=x,w=M;S<w;S+=3){const T=o.getX(S),_=o.getX(S+1),b=o.getX(S+2);s=zs(this,g,e,n,c,u,f,T,_,b),s&&(s.faceIndex=Math.floor(S/3),s.face.materialIndex=m.materialIndex,t.push(s))}}else{const p=Math.max(0,h.start),v=Math.min(o.count,h.start+h.count);for(let m=p,g=v;m<g;m+=3){const x=o.getX(m),M=o.getX(m+1),S=o.getX(m+2);s=zs(this,a,e,n,c,u,f,x,M,S),s&&(s.faceIndex=Math.floor(m/3),t.push(s))}}else if(l!==void 0)if(Array.isArray(a))for(let p=0,v=d.length;p<v;p++){const m=d[p],g=a[m.materialIndex],x=Math.max(m.start,h.start),M=Math.min(l.count,Math.min(m.start+m.count,h.start+h.count));for(let S=x,w=M;S<w;S+=3){const T=S,_=S+1,b=S+2;s=zs(this,g,e,n,c,u,f,T,_,b),s&&(s.faceIndex=Math.floor(S/3),s.face.materialIndex=m.materialIndex,t.push(s))}}else{const p=Math.max(0,h.start),v=Math.min(l.count,h.start+h.count);for(let m=p,g=v;m<g;m+=3){const x=m,M=m+1,S=m+2;s=zs(this,a,e,n,c,u,f,x,M,S),s&&(s.faceIndex=Math.floor(m/3),t.push(s))}}}}function od(i,e,t,n,s,r,a,o){let l;if(e.side===Jt?l=n.intersectTriangle(a,r,s,!0,o):l=n.intersectTriangle(s,r,a,e.side===hi,o),l===null)return null;ks.copy(o),ks.applyMatrix4(i.matrixWorld);const c=t.ray.origin.distanceTo(ks);return c<t.near||c>t.far?null:{distance:c,point:ks.clone(),object:i}}function zs(i,e,t,n,s,r,a,o,l,c){i.getVertexPosition(o,Us),i.getVertexPosition(l,Fs),i.getVertexPosition(c,Os);const u=od(i,e,t,n,Us,Fs,Os,fl);if(u){const f=new O;fn.getBarycoord(fl,Us,Fs,Os,f),s&&(u.uv=fn.getInterpolatedAttribute(s,o,l,c,f,new Se)),r&&(u.uv1=fn.getInterpolatedAttribute(r,o,l,c,f,new Se)),a&&(u.normal=fn.getInterpolatedAttribute(a,o,l,c,f,new O),u.normal.dot(n.direction)>0&&u.normal.multiplyScalar(-1));const d={a:o,b:l,c,normal:new O,materialIndex:0};fn.getNormal(Us,Fs,Os,d.normal),u.face=d,u.barycoord=f}return u}class ld extends $t{constructor(e=null,t=1,n=1,s,r,a,o,l,c=Ot,u=Ot,f,d){super(null,a,o,l,c,u,s,r,f,d),this.isDataTexture=!0,this.image={data:e,width:t,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}const li=new fo,cd=new Se(.5,.5),Gs=new O;class ds{constructor(e=new $n,t=new $n,n=new $n,s=new $n,r=new $n,a=new $n){this.planes=[e,t,n,s,r,a]}set(e,t,n,s,r,a){const o=this.planes;return o[0].copy(e),o[1].copy(t),o[2].copy(n),o[3].copy(s),o[4].copy(r),o[5].copy(a),this}copy(e){const t=this.planes;for(let n=0;n<6;n++)t[n].copy(e.planes[n]);return this}setFromProjectionMatrix(e,t=mn,n=!1){const s=this.planes,r=e.elements,a=r[0],o=r[1],l=r[2],c=r[3],u=r[4],f=r[5],d=r[6],h=r[7],p=r[8],v=r[9],m=r[10],g=r[11],x=r[12],M=r[13],S=r[14],w=r[15];if(s[0].setComponents(c-a,h-u,g-p,w-x).normalize(),s[1].setComponents(c+a,h+u,g+p,w+x).normalize(),s[2].setComponents(c+o,h+f,g+v,w+M).normalize(),s[3].setComponents(c-o,h-f,g-v,w-M).normalize(),n)s[4].setComponents(l,d,m,S).normalize(),s[5].setComponents(c-l,h-d,g-m,w-S).normalize();else if(s[4].setComponents(c-l,h-d,g-m,w-S).normalize(),t===mn)s[5].setComponents(c+l,h+d,g+m,w+S).normalize();else if(t===hs)s[5].setComponents(l,d,m,S).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),li.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{const t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),li.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(li)}intersectsSprite(e){li.center.set(0,0,0);const t=cd.distanceTo(e.center);return li.radius=.7071067811865476+t,li.applyMatrix4(e.matrixWorld),this.intersectsSphere(li)}intersectsSphere(e){const t=this.planes,n=e.center,s=-e.radius;for(let r=0;r<6;r++)if(t[r].distanceToPoint(n)<s)return!1;return!0}intersectsBox(e){const t=this.planes;for(let n=0;n<6;n++){const s=t[n];if(Gs.x=s.normal.x>0?e.max.x:e.min.x,Gs.y=s.normal.y>0?e.max.y:e.min.y,Gs.z=s.normal.z>0?e.max.z:e.min.z,s.distanceToPoint(Gs)<0)return!1}return!0}containsPoint(e){const t=this.planes;for(let n=0;n<6;n++)if(t[n].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}}const pl=new xt;class po{constructor(){this.coordinateSystem=mn,this._frustums=[],this._count=0}setFromArrayCamera(e){const t=e.cameras,n=this._frustums;for(let s=0;s<t.length;s++){const r=t[s];pl.multiplyMatrices(r.projectionMatrix,r.matrixWorldInverse),n[s]===void 0&&(n[s]=new ds),n[s].setFromProjectionMatrix(pl,r.coordinateSystem,r.reversedDepth)}return this._count=t.length,this}getFrustum(e){return this._frustums[e]}intersectsObject(e){const t=this._frustums;for(let n=0;n<this._count;n++)if(t[n].intersectsObject(e))return!0;return!1}intersectsSprite(e){const t=this._frustums;for(let n=0;n<this._count;n++)if(t[n].intersectsSprite(e))return!0;return!1}intersectsSphere(e){const t=this._frustums;for(let n=0;n<this._count;n++)if(t[n].intersectsSphere(e))return!0;return!1}intersectsBox(e){const t=this._frustums;for(let n=0;n<this._count;n++)if(t[n].intersectsBox(e))return!0;return!1}containsPoint(e){const t=this._frustums;for(let n=0;n<this._count;n++)if(t[n].containsPoint(e))return!0;return!1}copy(e){this.coordinateSystem=e.coordinateSystem;const t=this._frustums,n=e._frustums;for(let s=0;s<e._count;s++)t[s]===void 0&&(t[s]=new ds),t[s].copy(n[s]);return this._count=e._count,this}clone(){return new po().copy(this)}}class Hc extends $t{constructor(e=[],t=Ui,n,s,r,a,o,l,c,u){super(e,t,n,s,r,a,o,l,c,u),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}}class Oi extends $t{constructor(e,t,n=wn,s,r,a,o=Ot,l=Ot,c,u=jn,f=1){if(u!==jn&&u!==Jn)throw new Error("THREE.DepthTexture: format must be either THREE.DepthFormat or THREE.DepthStencilFormat");const d={width:e,height:t,depth:f};super(d,s,r,a,o,l,u,n,c),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.source=new ho(Object.assign({},e.image)),this.compareFunction=e.compareFunction,this}toJSON(e){const t=super.toJSON(e);return t.compareFunction=this.compareFunction,t}}class Vc extends Oi{constructor(e,t=wn,n=Ui,s,r,a=Ot,o=Ot,l,c=jn){const u={width:e,height:e,depth:1},f=[u,u,u,u,u,u];super(e,e,t,n,s,r,a,o,l,c),this.image=f,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(e){this.image=e}}class Wc extends $t{constructor(e=null){super(),this.sourceTexture=e,this.isExternalTexture=!0}copy(e){return super.copy(e),this.sourceTexture=e.sourceTexture,this}}class kn extends Xt{constructor(e=1,t=1,n=1,s=1,r=1,a=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:n,widthSegments:s,heightSegments:r,depthSegments:a};const o=this;s=Math.floor(s),r=Math.floor(r),a=Math.floor(a);const l=[],c=[],u=[],f=[];let d=0,h=0;p("z","y","x",-1,-1,n,t,e,a,r,0),p("z","y","x",1,-1,n,t,-e,a,r,1),p("x","z","y",1,1,e,n,t,s,a,2),p("x","z","y",1,-1,e,n,-t,s,a,3),p("x","y","z",1,-1,e,t,n,s,r,4),p("x","y","z",-1,-1,e,t,-n,s,r,5),this.setIndex(l),this.setAttribute("position",new Tt(c,3)),this.setAttribute("normal",new Tt(u,3)),this.setAttribute("uv",new Tt(f,2));function p(v,m,g,x,M,S,w,T,_,b,P){const R=S/_,C=w/b,F=S/2,V=w/2,D=T/2,z=_+1,X=b+1;let k=0,se=0;const $=new O;for(let ee=0;ee<X;ee++){const ie=ee*C-V;for(let we=0;we<z;we++){const Fe=we*R-F;$[v]=Fe*x,$[m]=ie*M,$[g]=D,c.push($.x,$.y,$.z),$[v]=0,$[m]=0,$[g]=T>0?1:-1,u.push($.x,$.y,$.z),f.push(we/_),f.push(1-ee/b),k+=1}}for(let ee=0;ee<b;ee++)for(let ie=0;ie<_;ie++){const we=d+ie+z*ee,Fe=d+ie+z*(ee+1),K=d+(ie+1)+z*(ee+1),ge=d+(ie+1)+z*ee;l.push(we,Fe,ge),l.push(Fe,K,ge),se+=6}o.addGroup(h,se,P),h+=se,d+=k}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new kn(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}}class mr extends Xt{constructor(e=1,t=1,n=1,s=32,r=1,a=!1,o=0,l=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:e,radiusBottom:t,height:n,radialSegments:s,heightSegments:r,openEnded:a,thetaStart:o,thetaLength:l};const c=this;s=Math.floor(s),r=Math.floor(r);const u=[],f=[],d=[],h=[];let p=0;const v=[],m=n/2;let g=0;x(),a===!1&&(e>0&&M(!0),t>0&&M(!1)),this.setIndex(u),this.setAttribute("position",new Tt(f,3)),this.setAttribute("normal",new Tt(d,3)),this.setAttribute("uv",new Tt(h,2));function x(){const S=new O,w=new O;let T=0;const _=(t-e)/n;for(let b=0;b<=r;b++){const P=[],R=b/r,C=R*(t-e)+e;for(let F=0;F<=s;F++){const V=F/s,D=V*l+o,z=Math.sin(D),X=Math.cos(D);w.x=C*z,w.y=-R*n+m,w.z=C*X,f.push(w.x,w.y,w.z),S.set(z,_,X).normalize(),d.push(S.x,S.y,S.z),h.push(V,1-R),P.push(p++)}v.push(P)}for(let b=0;b<s;b++)for(let P=0;P<r;P++){const R=v[P][b],C=v[P+1][b],F=v[P+1][b+1],V=v[P][b+1];(e>0||P!==0)&&(u.push(R,C,V),T+=3),(t>0||P!==r-1)&&(u.push(C,F,V),T+=3)}c.addGroup(g,T,0),g+=T}function M(S){const w=p,T=new Se,_=new O;let b=0;const P=S===!0?e:t,R=S===!0?1:-1;for(let F=1;F<=s;F++)f.push(0,m*R,0),d.push(0,R,0),h.push(.5,.5),p++;const C=p;for(let F=0;F<=s;F++){const D=F/s*l+o,z=Math.cos(D),X=Math.sin(D);_.x=P*X,_.y=m*R,_.z=P*z,f.push(_.x,_.y,_.z),d.push(0,R,0),T.x=z*.5+.5,T.y=X*.5*R+.5,h.push(T.x,T.y),p++}for(let F=0;F<s;F++){const V=w+F,D=C+F;S===!0?u.push(D,D+1,V):u.push(D+1,D,V),b+=3}c.addGroup(g,b,S===!0?1:2),g+=b}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new mr(e.radiusTop,e.radiusBottom,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}}class mo extends mr{constructor(e=1,t=1,n=32,s=1,r=!1,a=0,o=Math.PI*2){super(0,e,t,n,s,r,a,o),this.type="ConeGeometry",this.parameters={radius:e,height:t,radialSegments:n,heightSegments:s,openEnded:r,thetaStart:a,thetaLength:o}}static fromJSON(e){return new mo(e.radius,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}}class go extends Xt{constructor(e=[],t=[],n=1,s=0){super(),this.type="PolyhedronGeometry",this.parameters={vertices:e,indices:t,radius:n,detail:s};const r=[],a=[];o(s),c(n),u(),this.setAttribute("position",new Tt(r,3)),this.setAttribute("normal",new Tt(r.slice(),3)),this.setAttribute("uv",new Tt(a,2)),s===0?this.computeVertexNormals():this.normalizeNormals();function o(x){const M=new O,S=new O,w=new O;for(let T=0;T<t.length;T+=3)h(t[T+0],M),h(t[T+1],S),h(t[T+2],w),l(M,S,w,x)}function l(x,M,S,w){const T=w+1,_=[];for(let b=0;b<=T;b++){_[b]=[];const P=x.clone().lerp(S,b/T),R=M.clone().lerp(S,b/T),C=T-b;for(let F=0;F<=C;F++)F===0&&b===T?_[b][F]=P:_[b][F]=P.clone().lerp(R,F/C)}for(let b=0;b<T;b++)for(let P=0;P<2*(T-b)-1;P++){const R=Math.floor(P/2);P%2===0?(d(_[b][R+1]),d(_[b+1][R]),d(_[b][R])):(d(_[b][R+1]),d(_[b+1][R+1]),d(_[b+1][R]))}}function c(x){const M=new O;for(let S=0;S<r.length;S+=3)M.x=r[S+0],M.y=r[S+1],M.z=r[S+2],M.normalize().multiplyScalar(x),r[S+0]=M.x,r[S+1]=M.y,r[S+2]=M.z}function u(){const x=new O;for(let M=0;M<r.length;M+=3){x.x=r[M+0],x.y=r[M+1],x.z=r[M+2];const S=m(x)/2/Math.PI+.5,w=g(x)/Math.PI+.5;a.push(S,1-w)}p(),f()}function f(){for(let x=0;x<a.length;x+=6){const M=a[x+0],S=a[x+2],w=a[x+4],T=Math.max(M,S,w),_=Math.min(M,S,w);T>.9&&_<.1&&(M<.2&&(a[x+0]+=1),S<.2&&(a[x+2]+=1),w<.2&&(a[x+4]+=1))}}function d(x){r.push(x.x,x.y,x.z)}function h(x,M){const S=x*3;M.x=e[S+0],M.y=e[S+1],M.z=e[S+2]}function p(){const x=new O,M=new O,S=new O,w=new O,T=new Se,_=new Se,b=new Se;for(let P=0,R=0;P<r.length;P+=9,R+=6){x.set(r[P+0],r[P+1],r[P+2]),M.set(r[P+3],r[P+4],r[P+5]),S.set(r[P+6],r[P+7],r[P+8]),T.set(a[R+0],a[R+1]),_.set(a[R+2],a[R+3]),b.set(a[R+4],a[R+5]),w.copy(x).add(M).add(S).divideScalar(3);const C=m(w);v(T,R+0,x,C),v(_,R+2,M,C),v(b,R+4,S,C)}}function v(x,M,S,w){w<0&&x.x===1&&(a[M]=x.x-1),S.x===0&&S.z===0&&(a[M]=w/2/Math.PI+.5)}function m(x){return Math.atan2(x.z,-x.x)}function g(x){return Math.atan2(-x.y,Math.sqrt(x.x*x.x+x.z*x.z))}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new go(e.vertices,e.indices,e.radius,e.detail)}}class An{constructor(){this.type="Curve",this.arcLengthDivisions=200,this.needsUpdate=!1,this.cacheArcLengths=null}getPoint(){He("Curve: .getPoint() not implemented.")}getPointAt(e,t){const n=this.getUtoTmapping(e);return this.getPoint(n,t)}getPoints(e=5){const t=[];for(let n=0;n<=e;n++)t.push(this.getPoint(n/e));return t}getSpacedPoints(e=5){const t=[];for(let n=0;n<=e;n++)t.push(this.getPointAt(n/e));return t}getLength(){const e=this.getLengths();return e[e.length-1]}getLengths(e=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===e+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;const t=[];let n,s=this.getPoint(0),r=0;t.push(0);for(let a=1;a<=e;a++)n=this.getPoint(a/e),r+=n.distanceTo(s),t.push(r),s=n;return this.cacheArcLengths=t,t}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(e,t=null){const n=this.getLengths();let s=0;const r=n.length;let a;t?a=t:a=e*n[r-1];let o=0,l=r-1,c;for(;o<=l;)if(s=Math.floor(o+(l-o)/2),c=n[s]-a,c<0)o=s+1;else if(c>0)l=s-1;else{l=s;break}if(s=l,n[s]===a)return s/(r-1);const u=n[s],d=n[s+1]-u,h=(a-u)/d;return(s+h)/(r-1)}getTangent(e,t){let s=e-1e-4,r=e+1e-4;s<0&&(s=0),r>1&&(r=1);const a=this.getPoint(s),o=this.getPoint(r),l=t||(a.isVector2?new Se:new O);return l.copy(o).sub(a).normalize(),l}getTangentAt(e,t){const n=this.getUtoTmapping(e);return this.getTangent(n,t)}computeFrenetFrames(e,t=!1){const n=new O,s=[],r=[],a=[],o=new O,l=new xt;for(let h=0;h<=e;h++){const p=h/e;s[h]=this.getTangentAt(p,new O)}r[0]=new O,a[0]=new O;let c=Number.MAX_VALUE;const u=Math.abs(s[0].x),f=Math.abs(s[0].y),d=Math.abs(s[0].z);u<=c&&(c=u,n.set(1,0,0)),f<=c&&(c=f,n.set(0,1,0)),d<=c&&n.set(0,0,1),o.crossVectors(s[0],n).normalize(),r[0].crossVectors(s[0],o),a[0].crossVectors(s[0],r[0]);for(let h=1;h<=e;h++){if(r[h]=r[h-1].clone(),a[h]=a[h-1].clone(),o.crossVectors(s[h-1],s[h]),o.length()>Number.EPSILON){o.normalize();const p=Math.acos(nt(s[h-1].dot(s[h]),-1,1));r[h].applyMatrix4(l.makeRotationAxis(o,p))}a[h].crossVectors(s[h],r[h])}if(t===!0){let h=Math.acos(nt(r[0].dot(r[e]),-1,1));h/=e,s[0].dot(o.crossVectors(r[0],r[e]))>0&&(h=-h);for(let p=1;p<=e;p++)r[p].applyMatrix4(l.makeRotationAxis(s[p],h*p)),a[p].crossVectors(s[p],r[p])}return{tangents:s,normals:r,binormals:a}}clone(){return new this.constructor().copy(this)}copy(e){return this.arcLengthDivisions=e.arcLengthDivisions,this.cacheArcLengths=null,this}toJSON(){const e={metadata:{version:4.7,type:"Curve",generator:"Curve.toJSON"}};return e.arcLengthDivisions=this.arcLengthDivisions,e.type=this.type,e}fromJSON(e){return this.arcLengthDivisions=e.arcLengthDivisions,this.cacheArcLengths=null,this}}class _o extends An{constructor(e=0,t=0,n=1,s=1,r=0,a=Math.PI*2,o=!1,l=0){super(),this.isEllipseCurve=!0,this.type="EllipseCurve",this.aX=e,this.aY=t,this.xRadius=n,this.yRadius=s,this.aStartAngle=r,this.aEndAngle=a,this.aClockwise=o,this.aRotation=l}getPoint(e,t=new Se){const n=t,s=Math.PI*2;let r=this.aEndAngle-this.aStartAngle;const a=Math.abs(r)<Number.EPSILON;for(;r<0;)r+=s;for(;r>s;)r-=s;r<Number.EPSILON&&(a?r=0:r=s),this.aClockwise===!0&&!a&&(r===s?r=-s:r=r-s);const o=this.aStartAngle+e*r;let l=this.aX+this.xRadius*Math.cos(o),c=this.aY+this.yRadius*Math.sin(o);if(this.aRotation!==0){const u=Math.cos(this.aRotation),f=Math.sin(this.aRotation),d=l-this.aX,h=c-this.aY;l=d*u-h*f+this.aX,c=d*f+h*u+this.aY}return n.set(l,c)}copy(e){return super.copy(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}toJSON(){const e=super.toJSON();return e.aX=this.aX,e.aY=this.aY,e.xRadius=this.xRadius,e.yRadius=this.yRadius,e.aStartAngle=this.aStartAngle,e.aEndAngle=this.aEndAngle,e.aClockwise=this.aClockwise,e.aRotation=this.aRotation,e}fromJSON(e){return super.fromJSON(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}}class hd extends _o{constructor(e,t,n,s,r,a){super(e,t,n,n,s,r,a),this.isArcCurve=!0,this.type="ArcCurve"}}function vo(){let i=0,e=0,t=0,n=0;function s(r,a,o,l){i=r,e=o,t=-3*r+3*a-2*o-l,n=2*r-2*a+o+l}return{initCatmullRom:function(r,a,o,l,c){s(a,o,c*(o-r),c*(l-a))},initNonuniformCatmullRom:function(r,a,o,l,c,u,f){let d=(a-r)/c-(o-r)/(c+u)+(o-a)/u,h=(o-a)/u-(l-a)/(u+f)+(l-o)/f;d*=u,h*=u,s(a,o,d,h)},calc:function(r){const a=r*r,o=a*r;return i+e*r+t*a+n*o}}}const ml=new O,gl=new O,Yr=new vo,$r=new vo,Kr=new vo;class ud extends An{constructor(e=[],t=!1,n="centripetal",s=.5){super(),this.isCatmullRomCurve3=!0,this.type="CatmullRomCurve3",this.points=e,this.closed=t,this.curveType=n,this.tension=s}getPoint(e,t=new O){const n=t,s=this.points,r=s.length,a=(r-(this.closed?0:1))*e;let o=Math.floor(a),l=a-o;this.closed?o+=o>0?0:(Math.floor(Math.abs(o)/r)+1)*r:l===0&&o===r-1&&(o=r-2,l=1);let c,u;this.closed||o>0?c=s[(o-1)%r]:(gl.subVectors(s[0],s[1]).add(s[0]),c=gl);const f=s[o%r],d=s[(o+1)%r];if(this.closed||o+2<r?u=s[(o+2)%r]:(ml.subVectors(s[r-1],s[r-2]).add(s[r-1]),u=ml),this.curveType==="centripetal"||this.curveType==="chordal"){const h=this.curveType==="chordal"?.5:.25;let p=Math.pow(c.distanceToSquared(f),h),v=Math.pow(f.distanceToSquared(d),h),m=Math.pow(d.distanceToSquared(u),h);v<1e-4&&(v=1),p<1e-4&&(p=v),m<1e-4&&(m=v),Yr.initNonuniformCatmullRom(c.x,f.x,d.x,u.x,p,v,m),$r.initNonuniformCatmullRom(c.y,f.y,d.y,u.y,p,v,m),Kr.initNonuniformCatmullRom(c.z,f.z,d.z,u.z,p,v,m)}else this.curveType==="catmullrom"&&(Yr.initCatmullRom(c.x,f.x,d.x,u.x,this.tension),$r.initCatmullRom(c.y,f.y,d.y,u.y,this.tension),Kr.initCatmullRom(c.z,f.z,d.z,u.z,this.tension));return n.set(Yr.calc(l),$r.calc(l),Kr.calc(l)),n}copy(e){super.copy(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){const s=e.points[t];this.points.push(s.clone())}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}toJSON(){const e=super.toJSON();e.points=[];for(let t=0,n=this.points.length;t<n;t++){const s=this.points[t];e.points.push(s.toArray())}return e.closed=this.closed,e.curveType=this.curveType,e.tension=this.tension,e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){const s=e.points[t];this.points.push(new O().fromArray(s))}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}}function _l(i,e,t,n,s){const r=(n-e)*.5,a=(s-t)*.5,o=i*i,l=i*o;return(2*t-2*n+r+a)*l+(-3*t+3*n-2*r-a)*o+r*i+t}function dd(i,e){const t=1-i;return t*t*e}function fd(i,e){return 2*(1-i)*i*e}function pd(i,e){return i*i*e}function ss(i,e,t,n){return dd(i,e)+fd(i,t)+pd(i,n)}function md(i,e){const t=1-i;return t*t*t*e}function gd(i,e){const t=1-i;return 3*t*t*i*e}function _d(i,e){return 3*(1-i)*i*i*e}function vd(i,e){return i*i*i*e}function rs(i,e,t,n,s){return md(i,e)+gd(i,t)+_d(i,n)+vd(i,s)}class Xc extends An{constructor(e=new Se,t=new Se,n=new Se,s=new Se){super(),this.isCubicBezierCurve=!0,this.type="CubicBezierCurve",this.v0=e,this.v1=t,this.v2=n,this.v3=s}getPoint(e,t=new Se){const n=t,s=this.v0,r=this.v1,a=this.v2,o=this.v3;return n.set(rs(e,s.x,r.x,a.x,o.x),rs(e,s.y,r.y,a.y,o.y)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){const e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}}class xd extends An{constructor(e=new O,t=new O,n=new O,s=new O){super(),this.isCubicBezierCurve3=!0,this.type="CubicBezierCurve3",this.v0=e,this.v1=t,this.v2=n,this.v3=s}getPoint(e,t=new O){const n=t,s=this.v0,r=this.v1,a=this.v2,o=this.v3;return n.set(rs(e,s.x,r.x,a.x,o.x),rs(e,s.y,r.y,a.y,o.y),rs(e,s.z,r.z,a.z,o.z)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){const e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}}class qc extends An{constructor(e=new Se,t=new Se){super(),this.isLineCurve=!0,this.type="LineCurve",this.v1=e,this.v2=t}getPoint(e,t=new Se){const n=t;return e===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(e).add(this.v1)),n}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new Se){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){const e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}}class Md extends An{constructor(e=new O,t=new O){super(),this.isLineCurve3=!0,this.type="LineCurve3",this.v1=e,this.v2=t}getPoint(e,t=new O){const n=t;return e===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(e).add(this.v1)),n}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new O){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){const e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}}class Yc extends An{constructor(e=new Se,t=new Se,n=new Se){super(),this.isQuadraticBezierCurve=!0,this.type="QuadraticBezierCurve",this.v0=e,this.v1=t,this.v2=n}getPoint(e,t=new Se){const n=t,s=this.v0,r=this.v1,a=this.v2;return n.set(ss(e,s.x,r.x,a.x),ss(e,s.y,r.y,a.y)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){const e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}}class Sd extends An{constructor(e=new O,t=new O,n=new O){super(),this.isQuadraticBezierCurve3=!0,this.type="QuadraticBezierCurve3",this.v0=e,this.v1=t,this.v2=n}getPoint(e,t=new O){const n=t,s=this.v0,r=this.v1,a=this.v2;return n.set(ss(e,s.x,r.x,a.x),ss(e,s.y,r.y,a.y),ss(e,s.z,r.z,a.z)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){const e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}}class $c extends An{constructor(e=[]){super(),this.isSplineCurve=!0,this.type="SplineCurve",this.points=e}getPoint(e,t=new Se){const n=t,s=this.points,r=(s.length-1)*e,a=Math.floor(r),o=r-a,l=s[a===0?a:a-1],c=s[a],u=s[a>s.length-2?s.length-1:a+1],f=s[a>s.length-3?s.length-1:a+2];return n.set(_l(o,l.x,c.x,u.x,f.x),_l(o,l.y,c.y,u.y,f.y)),n}copy(e){super.copy(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){const s=e.points[t];this.points.push(s.clone())}return this}toJSON(){const e=super.toJSON();e.points=[];for(let t=0,n=this.points.length;t<n;t++){const s=this.points[t];e.points.push(s.toArray())}return e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){const s=e.points[t];this.points.push(new Se().fromArray(s))}return this}}var $a=Object.freeze({__proto__:null,ArcCurve:hd,CatmullRomCurve3:ud,CubicBezierCurve:Xc,CubicBezierCurve3:xd,EllipseCurve:_o,LineCurve:qc,LineCurve3:Md,QuadraticBezierCurve:Yc,QuadraticBezierCurve3:Sd,SplineCurve:$c});class yd extends An{constructor(){super(),this.type="CurvePath",this.curves=[],this.autoClose=!1,this.cacheLengths=null}add(e){this.curves.push(e)}closePath(){const e=this.curves[0].getPoint(0),t=this.curves[this.curves.length-1].getPoint(1);if(!e.equals(t)){const n=e.isVector2===!0?"LineCurve":"LineCurve3";this.curves.push(new $a[n](t,e))}return this}getPoint(e,t){const n=e*this.getLength(),s=this.getCurveLengths();let r=0;for(;r<s.length;){if(s[r]>=n){const a=s[r]-n,o=this.curves[r],l=o.getLength(),c=l===0?0:1-a/l;return o.getPointAt(c,t)}r++}return null}getLength(){const e=this.getCurveLengths();return e[e.length-1]}updateArcLengths(){this.needsUpdate=!0,this.cacheLengths=null,this.getCurveLengths()}getCurveLengths(){if(this.cacheLengths&&this.cacheLengths.length===this.curves.length)return this.cacheLengths;const e=[];let t=0;for(let n=0,s=this.curves.length;n<s;n++)t+=this.curves[n].getLength(),e.push(t);return this.cacheLengths=e,e}getSpacedPoints(e=40){const t=[];for(let n=0;n<=e;n++)t.push(this.getPoint(n/e));return this.autoClose&&t.push(t[0]),t}getPoints(e=12){const t=[];let n;for(let s=0,r=this.curves;s<r.length;s++){const a=r[s],o=a.isEllipseCurve?e*2:a.isLineCurve||a.isLineCurve3?1:a.isSplineCurve?e*a.points.length:e,l=a.getPoints(o);for(let c=0;c<l.length;c++){const u=l[c];n&&n.equals(u)||(t.push(u),n=u)}}return this.autoClose&&t.length>1&&!t[t.length-1].equals(t[0])&&t.push(t[0]),t}copy(e){super.copy(e),this.curves=[];for(let t=0,n=e.curves.length;t<n;t++){const s=e.curves[t];this.curves.push(s.clone())}return this.autoClose=e.autoClose,this.cacheLengths=null,this}toJSON(){const e=super.toJSON();e.autoClose=this.autoClose,e.curves=[];for(let t=0,n=this.curves.length;t<n;t++){const s=this.curves[t];e.curves.push(s.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.autoClose=e.autoClose,this.curves=[];for(let t=0,n=e.curves.length;t<n;t++){const s=e.curves[t];this.curves.push(new $a[s.type]().fromJSON(s))}return this.cacheLengths=null,this}}class hr extends yd{constructor(e){super(),this.type="Path",this.currentPoint=new Se,e&&this.setFromPoints(e)}setFromPoints(e){this.moveTo(e[0].x,e[0].y);for(let t=1,n=e.length;t<n;t++)this.lineTo(e[t].x,e[t].y);return this}moveTo(e,t){return this.currentPoint.set(e,t),this}lineTo(e,t){const n=new qc(this.currentPoint.clone(),new Se(e,t));return this.curves.push(n),this.currentPoint.set(e,t),this}quadraticCurveTo(e,t,n,s){const r=new Yc(this.currentPoint.clone(),new Se(e,t),new Se(n,s));return this.curves.push(r),this.currentPoint.set(n,s),this}bezierCurveTo(e,t,n,s,r,a){const o=new Xc(this.currentPoint.clone(),new Se(e,t),new Se(n,s),new Se(r,a));return this.curves.push(o),this.currentPoint.set(r,a),this}splineThru(e){const t=[this.currentPoint.clone()].concat(e),n=new $c(t);return this.curves.push(n),this.currentPoint.copy(e[e.length-1]),this}arc(e,t,n,s,r,a){const o=this.currentPoint.x,l=this.currentPoint.y;return this.absarc(e+o,t+l,n,s,r,a),this}absarc(e,t,n,s,r,a){return this.absellipse(e,t,n,n,s,r,a),this}ellipse(e,t,n,s,r,a,o,l){const c=this.currentPoint.x,u=this.currentPoint.y;return this.absellipse(e+c,t+u,n,s,r,a,o,l),this}absellipse(e,t,n,s,r,a,o,l){const c=new _o(e,t,n,s,r,a,o,l);if(this.curves.length>0){const f=c.getPoint(0);f.equals(this.currentPoint)||this.lineTo(f.x,f.y)}this.curves.push(c);const u=c.getPoint(1);return this.currentPoint.copy(u),this}copy(e){return super.copy(e),this.currentPoint.copy(e.currentPoint),this}toJSON(){const e=super.toJSON();return e.currentPoint=this.currentPoint.toArray(),e}fromJSON(e){return super.fromJSON(e),this.currentPoint.fromArray(e.currentPoint),this}}class ur extends hr{constructor(e){super(e),this.uuid=mi(),this.type="Shape",this.holes=[]}getPointsHoles(e){const t=[];for(let n=0,s=this.holes.length;n<s;n++)t[n]=this.holes[n].getPoints(e);return t}extractPoints(e){return{shape:this.getPoints(e),holes:this.getPointsHoles(e)}}copy(e){super.copy(e),this.holes=[];for(let t=0,n=e.holes.length;t<n;t++){const s=e.holes[t];this.holes.push(s.clone())}return this}toJSON(){const e=super.toJSON();e.uuid=this.uuid,e.holes=[];for(let t=0,n=this.holes.length;t<n;t++){const s=this.holes[t];e.holes.push(s.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.uuid=e.uuid,this.holes=[];for(let t=0,n=e.holes.length;t<n;t++){const s=e.holes[t];this.holes.push(new hr().fromJSON(s))}return this}}function Ed(i,e,t=2){const n=e&&e.length,s=n?e[0]*t:i.length;let r=Kc(i,0,s,t,!0);const a=[];if(!r||r.next===r.prev)return a;let o,l,c;if(n&&(r=Rd(i,e,r,t)),i.length>80*t){o=i[0],l=i[1];let u=o,f=l;for(let d=t;d<s;d+=t){const h=i[d],p=i[d+1];h<o&&(o=h),p<l&&(l=p),h>u&&(u=h),p>f&&(f=p)}c=Math.max(u-o,f-l),c=c!==0?32767/c:0}return fs(r,a,t,o,l,c,0),a}function Kc(i,e,t,n,s){let r;if(s===kd(i,e,t,n)>0)for(let a=e;a<t;a+=n)r=vl(a/n|0,i[a],i[a+1],r);else for(let a=t-n;a>=e;a-=n)r=vl(a/n|0,i[a],i[a+1],r);return r&&Bi(r,r.next)&&(ms(r),r=r.next),r}function di(i,e){if(!i)return i;e||(e=i);let t=i,n;do if(n=!1,!t.steiner&&(Bi(t,t.next)||wt(t.prev,t,t.next)===0)){if(ms(t),t=e=t.prev,t===t.next)break;n=!0}else t=t.next;while(n||t!==e);return e}function fs(i,e,t,n,s,r,a){if(!i)return;!a&&r&&Id(i,n,s,r);let o=i;for(;i.prev!==i.next;){const l=i.prev,c=i.next;if(r?wd(i,n,s,r):bd(i)){e.push(l.i,i.i,c.i),ms(i),i=c.next,o=c.next;continue}if(i=c,i===o){a?a===1?(i=Td(di(i),e),fs(i,e,t,n,s,r,2)):a===2&&Ad(i,e,t,n,s,r):fs(di(i),e,t,n,s,r,1);break}}}function bd(i){const e=i.prev,t=i,n=i.next;if(wt(e,t,n)>=0)return!1;const s=e.x,r=t.x,a=n.x,o=e.y,l=t.y,c=n.y,u=Math.min(s,r,a),f=Math.min(o,l,c),d=Math.max(s,r,a),h=Math.max(o,l,c);let p=n.next;for(;p!==e;){if(p.x>=u&&p.x<=d&&p.y>=f&&p.y<=h&&Qi(s,o,r,l,a,c,p.x,p.y)&&wt(p.prev,p,p.next)>=0)return!1;p=p.next}return!0}function wd(i,e,t,n){const s=i.prev,r=i,a=i.next;if(wt(s,r,a)>=0)return!1;const o=s.x,l=r.x,c=a.x,u=s.y,f=r.y,d=a.y,h=Math.min(o,l,c),p=Math.min(u,f,d),v=Math.max(o,l,c),m=Math.max(u,f,d),g=Ka(h,p,e,t,n),x=Ka(v,m,e,t,n);let M=i.prevZ,S=i.nextZ;for(;M&&M.z>=g&&S&&S.z<=x;){if(M.x>=h&&M.x<=v&&M.y>=p&&M.y<=m&&M!==s&&M!==a&&Qi(o,u,l,f,c,d,M.x,M.y)&&wt(M.prev,M,M.next)>=0||(M=M.prevZ,S.x>=h&&S.x<=v&&S.y>=p&&S.y<=m&&S!==s&&S!==a&&Qi(o,u,l,f,c,d,S.x,S.y)&&wt(S.prev,S,S.next)>=0))return!1;S=S.nextZ}for(;M&&M.z>=g;){if(M.x>=h&&M.x<=v&&M.y>=p&&M.y<=m&&M!==s&&M!==a&&Qi(o,u,l,f,c,d,M.x,M.y)&&wt(M.prev,M,M.next)>=0)return!1;M=M.prevZ}for(;S&&S.z<=x;){if(S.x>=h&&S.x<=v&&S.y>=p&&S.y<=m&&S!==s&&S!==a&&Qi(o,u,l,f,c,d,S.x,S.y)&&wt(S.prev,S,S.next)>=0)return!1;S=S.nextZ}return!0}function Td(i,e){let t=i;do{const n=t.prev,s=t.next.next;!Bi(n,s)&&Jc(n,t,t.next,s)&&ps(n,s)&&ps(s,n)&&(e.push(n.i,t.i,s.i),ms(t),ms(t.next),t=i=s),t=t.next}while(t!==i);return di(t)}function Ad(i,e,t,n,s,r){let a=i;do{let o=a.next.next;for(;o!==a.prev;){if(a.i!==o.i&&Fd(a,o)){let l=Qc(a,o);a=di(a,a.next),l=di(l,l.next),fs(a,e,t,n,s,r,0),fs(l,e,t,n,s,r,0);return}o=o.next}a=a.next}while(a!==i)}function Rd(i,e,t,n){const s=[];for(let r=0,a=e.length;r<a;r++){const o=e[r]*n,l=r<a-1?e[r+1]*n:i.length,c=Kc(i,o,l,n,!1);c===c.next&&(c.steiner=!0),s.push(Ud(c))}s.sort(Cd);for(let r=0;r<s.length;r++)t=Pd(s[r],t);return t}function Cd(i,e){let t=i.x-e.x;if(t===0&&(t=i.y-e.y,t===0)){const n=(i.next.y-i.y)/(i.next.x-i.x),s=(e.next.y-e.y)/(e.next.x-e.x);t=n-s}return t}function Pd(i,e){const t=Ld(i,e);if(!t)return e;const n=Qc(t,i);return di(n,n.next),di(t,t.next)}function Ld(i,e){let t=e;const n=i.x,s=i.y;let r=-1/0,a;if(Bi(i,t))return t;do{if(Bi(i,t.next))return t.next;if(s<=t.y&&s>=t.next.y&&t.next.y!==t.y){const f=t.x+(s-t.y)*(t.next.x-t.x)/(t.next.y-t.y);if(f<=n&&f>r&&(r=f,a=t.x<t.next.x?t:t.next,f===n))return a}t=t.next}while(t!==e);if(!a)return null;const o=a,l=a.x,c=a.y;let u=1/0;t=a;do{if(n>=t.x&&t.x>=l&&n!==t.x&&Zc(s<c?n:r,s,l,c,s<c?r:n,s,t.x,t.y)){const f=Math.abs(s-t.y)/(n-t.x);ps(t,i)&&(f<u||f===u&&(t.x>a.x||t.x===a.x&&Dd(a,t)))&&(a=t,u=f)}t=t.next}while(t!==o);return a}function Dd(i,e){return wt(i.prev,i,e.prev)<0&&wt(e.next,i,i.next)<0}function Id(i,e,t,n){let s=i;do s.z===0&&(s.z=Ka(s.x,s.y,e,t,n)),s.prevZ=s.prev,s.nextZ=s.next,s=s.next;while(s!==i);s.prevZ.nextZ=null,s.prevZ=null,Nd(s)}function Nd(i){let e,t=1;do{let n=i,s;i=null;let r=null;for(e=0;n;){e++;let a=n,o=0;for(let c=0;c<t&&(o++,a=a.nextZ,!!a);c++);let l=t;for(;o>0||l>0&&a;)o!==0&&(l===0||!a||n.z<=a.z)?(s=n,n=n.nextZ,o--):(s=a,a=a.nextZ,l--),r?r.nextZ=s:i=s,s.prevZ=r,r=s;n=a}r.nextZ=null,t*=2}while(e>1);return i}function Ka(i,e,t,n,s){return i=(i-t)*s|0,e=(e-n)*s|0,i=(i|i<<8)&16711935,i=(i|i<<4)&252645135,i=(i|i<<2)&858993459,i=(i|i<<1)&1431655765,e=(e|e<<8)&16711935,e=(e|e<<4)&252645135,e=(e|e<<2)&858993459,e=(e|e<<1)&1431655765,i|e<<1}function Ud(i){let e=i,t=i;do(e.x<t.x||e.x===t.x&&e.y<t.y)&&(t=e),e=e.next;while(e!==i);return t}function Zc(i,e,t,n,s,r,a,o){return(s-a)*(e-o)>=(i-a)*(r-o)&&(i-a)*(n-o)>=(t-a)*(e-o)&&(t-a)*(r-o)>=(s-a)*(n-o)}function Qi(i,e,t,n,s,r,a,o){return!(i===a&&e===o)&&Zc(i,e,t,n,s,r,a,o)}function Fd(i,e){return i.next.i!==e.i&&i.prev.i!==e.i&&!Od(i,e)&&(ps(i,e)&&ps(e,i)&&Bd(i,e)&&(wt(i.prev,i,e.prev)||wt(i,e.prev,e))||Bi(i,e)&&wt(i.prev,i,i.next)>0&&wt(e.prev,e,e.next)>0)}function wt(i,e,t){return(e.y-i.y)*(t.x-e.x)-(e.x-i.x)*(t.y-e.y)}function Bi(i,e){return i.x===e.x&&i.y===e.y}function Jc(i,e,t,n){const s=Vs(wt(i,e,t)),r=Vs(wt(i,e,n)),a=Vs(wt(t,n,i)),o=Vs(wt(t,n,e));return!!(s!==r&&a!==o||s===0&&Hs(i,t,e)||r===0&&Hs(i,n,e)||a===0&&Hs(t,i,n)||o===0&&Hs(t,e,n))}function Hs(i,e,t){return e.x<=Math.max(i.x,t.x)&&e.x>=Math.min(i.x,t.x)&&e.y<=Math.max(i.y,t.y)&&e.y>=Math.min(i.y,t.y)}function Vs(i){return i>0?1:i<0?-1:0}function Od(i,e){let t=i;do{if(t.i!==i.i&&t.next.i!==i.i&&t.i!==e.i&&t.next.i!==e.i&&Jc(t,t.next,i,e))return!0;t=t.next}while(t!==i);return!1}function ps(i,e){return wt(i.prev,i,i.next)<0?wt(i,e,i.next)>=0&&wt(i,i.prev,e)>=0:wt(i,e,i.prev)<0||wt(i,i.next,e)<0}function Bd(i,e){let t=i,n=!1;const s=(i.x+e.x)/2,r=(i.y+e.y)/2;do t.y>r!=t.next.y>r&&t.next.y!==t.y&&s<(t.next.x-t.x)*(r-t.y)/(t.next.y-t.y)+t.x&&(n=!n),t=t.next;while(t!==i);return n}function Qc(i,e){const t=Za(i.i,i.x,i.y),n=Za(e.i,e.x,e.y),s=i.next,r=e.prev;return i.next=e,e.prev=i,t.next=s,s.prev=t,n.next=t,t.prev=n,r.next=n,n.prev=r,n}function vl(i,e,t,n){const s=Za(i,e,t);return n?(s.next=n.next,s.prev=n,n.next.prev=s,n.next=s):(s.prev=s,s.next=s),s}function ms(i){i.next.prev=i.prev,i.prev.next=i.next,i.prevZ&&(i.prevZ.nextZ=i.nextZ),i.nextZ&&(i.nextZ.prevZ=i.prevZ)}function Za(i,e,t){return{i,x:e,y:t,prev:null,next:null,z:0,prevZ:null,nextZ:null,steiner:!1}}function kd(i,e,t,n){let s=0;for(let r=e,a=t-n;r<t;r+=n)s+=(i[a]-i[r])*(i[r+1]+i[a+1]),a=r;return s}class zd{static triangulate(e,t,n=2){return Ed(e,t,n)}}class Pi{static area(e){const t=e.length;let n=0;for(let s=t-1,r=0;r<t;s=r++)n+=e[s].x*e[r].y-e[r].x*e[s].y;return n*.5}static isClockWise(e){return Pi.area(e)<0}static triangulateShape(e,t){const n=[],s=[],r=[];xl(e),Ml(n,e);let a=e.length;t.forEach(xl);for(let l=0;l<t.length;l++)s.push(a),a+=t[l].length,Ml(n,t[l]);const o=zd.triangulate(n,s);for(let l=0;l<o.length;l+=3)r.push(o.slice(l,l+3));return r}}function xl(i){const e=i.length;e>2&&i[e-1].equals(i[0])&&i.pop()}function Ml(i,e){for(let t=0;t<e.length;t++)i.push(e[t].x),i.push(e[t].y)}class gs extends Xt{constructor(e=new ur([new Se(.5,.5),new Se(-.5,.5),new Se(-.5,-.5),new Se(.5,-.5)]),t={}){super(),this.type="ExtrudeGeometry",this.parameters={shapes:e,options:t},e=Array.isArray(e)?e:[e];const n=this,s=[],r=[];for(let o=0,l=e.length;o<l;o++){const c=e[o];a(c)}this.setAttribute("position",new Tt(s,3)),this.setAttribute("uv",new Tt(r,2)),this.computeVertexNormals();function a(o){const l=[],c=t.curveSegments!==void 0?t.curveSegments:12,u=t.steps!==void 0?t.steps:1,f=t.depth!==void 0?t.depth:1;let d=t.bevelEnabled!==void 0?t.bevelEnabled:!0,h=t.bevelThickness!==void 0?t.bevelThickness:.2,p=t.bevelSize!==void 0?t.bevelSize:h-.1,v=t.bevelOffset!==void 0?t.bevelOffset:0,m=t.bevelSegments!==void 0?t.bevelSegments:3;const g=t.extrudePath,x=t.UVGenerator!==void 0?t.UVGenerator:Gd;let M,S=!1,w,T,_,b;if(g){M=g.getSpacedPoints(u),S=!0,d=!1;const te=g.isCatmullRomCurve3?g.closed:!1;w=g.computeFrenetFrames(u,te),T=new O,_=new O,b=new O}d||(m=0,h=0,p=0,v=0);const P=o.extractPoints(c);let R=P.shape;const C=P.holes;if(!Pi.isClockWise(R)){R=R.reverse();for(let te=0,he=C.length;te<he;te++){const q=C[te];Pi.isClockWise(q)&&(C[te]=q.reverse())}}function V(te){const q=10000000000000001e-36;let ae=te[0];for(let re=1;re<=te.length;re++){const Be=re%te.length,Ae=te[Be],$e=Ae.x-ae.x,Je=Ae.y-ae.y,et=$e*$e+Je*Je,U=Math.max(Math.abs(Ae.x),Math.abs(Ae.y),Math.abs(ae.x),Math.abs(ae.y)),St=q*U*U;if(et<=St){te.splice(Be,1),re--;continue}ae=Ae}}V(R),C.forEach(V);const D=C.length,z=R;for(let te=0;te<D;te++){const he=C[te];R=R.concat(he)}function X(te,he,q){return he||lt("ExtrudeGeometry: vec does not exist"),te.clone().addScaledVector(he,q)}const k=R.length;function se(te,he,q){let ae,re,Be;const Ae=te.x-he.x,$e=te.y-he.y,Je=q.x-te.x,et=q.y-te.y,U=Ae*Ae+$e*$e,St=Ae*et-$e*Je;if(Math.abs(St)>Number.EPSILON){const tt=Math.sqrt(U),mt=Math.sqrt(Je*Je+et*et),_e=he.x-$e/tt,At=he.y+Ae/tt,Ge=q.x-et/mt,We=q.y+Je/mt,A=((Ge-_e)*et-(We-At)*Je)/(Ae*et-$e*Je);ae=_e+Ae*A-te.x,re=At+$e*A-te.y;const y=ae*ae+re*re;if(y<=2)return new Se(ae,re);Be=Math.sqrt(y/2)}else{let tt=!1;Ae>Number.EPSILON?Je>Number.EPSILON&&(tt=!0):Ae<-Number.EPSILON?Je<-Number.EPSILON&&(tt=!0):Math.sign($e)===Math.sign(et)&&(tt=!0),tt?(ae=-$e,re=Ae,Be=Math.sqrt(U)):(ae=Ae,re=$e,Be=Math.sqrt(U/2))}return new Se(ae/Be,re/Be)}const $=[];for(let te=0,he=z.length,q=he-1,ae=te+1;te<he;te++,q++,ae++)q===he&&(q=0),ae===he&&(ae=0),$[te]=se(z[te],z[q],z[ae]);const ee=[];let ie,we=$.concat();for(let te=0,he=D;te<he;te++){const q=C[te];ie=[];for(let ae=0,re=q.length,Be=re-1,Ae=ae+1;ae<re;ae++,Be++,Ae++)Be===re&&(Be=0),Ae===re&&(Ae=0),ie[ae]=se(q[ae],q[Be],q[Ae]);ee.push(ie),we=we.concat(ie)}let Fe;if(m===0)Fe=Pi.triangulateShape(z,C);else{const te=[],he=[];for(let q=0;q<m;q++){const ae=q/m,re=h*Math.cos(ae*Math.PI/2),Be=p*Math.sin(ae*Math.PI/2)+v;for(let Ae=0,$e=z.length;Ae<$e;Ae++){const Je=X(z[Ae],$[Ae],Be);Oe(Je.x,Je.y,-re),ae===0&&te.push(Je)}for(let Ae=0,$e=D;Ae<$e;Ae++){const Je=C[Ae];ie=ee[Ae];const et=[];for(let U=0,St=Je.length;U<St;U++){const tt=X(Je[U],ie[U],Be);Oe(tt.x,tt.y,-re),ae===0&&et.push(tt)}ae===0&&he.push(et)}}Fe=Pi.triangulateShape(te,he)}const K=Fe.length,ge=p+v;for(let te=0;te<k;te++){const he=d?X(R[te],we[te],ge):R[te];S?(_.copy(w.normals[0]).multiplyScalar(he.x),T.copy(w.binormals[0]).multiplyScalar(he.y),b.copy(M[0]).add(_).add(T),Oe(b.x,b.y,b.z)):Oe(he.x,he.y,0)}for(let te=1;te<=u;te++)for(let he=0;he<k;he++){const q=d?X(R[he],we[he],ge):R[he];S?(_.copy(w.normals[te]).multiplyScalar(q.x),T.copy(w.binormals[te]).multiplyScalar(q.y),b.copy(M[te]).add(_).add(T),Oe(b.x,b.y,b.z)):Oe(q.x,q.y,f/u*te)}for(let te=m-1;te>=0;te--){const he=te/m,q=h*Math.cos(he*Math.PI/2),ae=p*Math.sin(he*Math.PI/2)+v;for(let re=0,Be=z.length;re<Be;re++){const Ae=X(z[re],$[re],ae);Oe(Ae.x,Ae.y,f+q)}for(let re=0,Be=C.length;re<Be;re++){const Ae=C[re];ie=ee[re];for(let $e=0,Je=Ae.length;$e<Je;$e++){const et=X(Ae[$e],ie[$e],ae);S?Oe(et.x,et.y+M[u-1].y,M[u-1].x+q):Oe(et.x,et.y,f+q)}}}Te(),Ue();function Te(){const te=s.length/3;if(d){let he=0,q=k*he;for(let ae=0;ae<K;ae++){const re=Fe[ae];pt(re[2]+q,re[1]+q,re[0]+q)}he=u+m*2,q=k*he;for(let ae=0;ae<K;ae++){const re=Fe[ae];pt(re[0]+q,re[1]+q,re[2]+q)}}else{for(let he=0;he<K;he++){const q=Fe[he];pt(q[2],q[1],q[0])}for(let he=0;he<K;he++){const q=Fe[he];pt(q[0]+k*u,q[1]+k*u,q[2]+k*u)}}n.addGroup(te,s.length/3-te,0)}function Ue(){const te=s.length/3;let he=0;Me(z,he),he+=z.length;for(let q=0,ae=C.length;q<ae;q++){const re=C[q];Me(re,he),he+=re.length}n.addGroup(te,s.length/3-te,1)}function Me(te,he){let q=te.length;for(;--q>=0;){const ae=q;let re=q-1;re<0&&(re=te.length-1);for(let Be=0,Ae=u+m*2;Be<Ae;Be++){const $e=k*Be,Je=k*(Be+1),et=he+ae+$e,U=he+re+$e,St=he+re+Je,tt=he+ae+Je;ze(et,U,St,tt)}}}function Oe(te,he,q){l.push(te),l.push(he),l.push(q)}function pt(te,he,q){Ye(te),Ye(he),Ye(q);const ae=s.length/3,re=x.generateTopUV(n,s,ae-3,ae-2,ae-1);Ke(re[0]),Ke(re[1]),Ke(re[2])}function ze(te,he,q,ae){Ye(te),Ye(he),Ye(ae),Ye(he),Ye(q),Ye(ae);const re=s.length/3,Be=x.generateSideWallUV(n,s,re-6,re-3,re-2,re-1);Ke(Be[0]),Ke(Be[1]),Ke(Be[3]),Ke(Be[1]),Ke(Be[2]),Ke(Be[3])}function Ye(te){s.push(l[te*3+0]),s.push(l[te*3+1]),s.push(l[te*3+2])}function Ke(te){r.push(te.x),r.push(te.y)}}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){const e=super.toJSON(),t=this.parameters.shapes,n=this.parameters.options;return Hd(t,n,e)}static fromJSON(e,t){const n=[];for(let r=0,a=e.shapes.length;r<a;r++){const o=t[e.shapes[r]];n.push(o)}const s=e.options.extrudePath;return s!==void 0&&(e.options.extrudePath=new $a[s.type]().fromJSON(s)),new gs(n,e.options)}}const Gd={generateTopUV:function(i,e,t,n,s){const r=e[t*3],a=e[t*3+1],o=e[n*3],l=e[n*3+1],c=e[s*3],u=e[s*3+1];return[new Se(r,a),new Se(o,l),new Se(c,u)]},generateSideWallUV:function(i,e,t,n,s,r){const a=e[t*3],o=e[t*3+1],l=e[t*3+2],c=e[n*3],u=e[n*3+1],f=e[n*3+2],d=e[s*3],h=e[s*3+1],p=e[s*3+2],v=e[r*3],m=e[r*3+1],g=e[r*3+2];return Math.abs(o-u)<Math.abs(a-c)?[new Se(a,1-l),new Se(c,1-f),new Se(d,1-p),new Se(v,1-g)]:[new Se(o,1-l),new Se(u,1-f),new Se(h,1-p),new Se(m,1-g)]}};function Hd(i,e,t){if(t.shapes=[],Array.isArray(i))for(let n=0,s=i.length;n<s;n++){const r=i[n];t.shapes.push(r.uuid)}else t.shapes.push(i.uuid);return t.options=Object.assign({},e),e.extrudePath!==void 0&&(t.options.extrudePath=e.extrudePath.toJSON()),t}class xo extends go{constructor(e=1,t=0){const n=(1+Math.sqrt(5))/2,s=[-1,n,0,1,n,0,-1,-n,0,1,-n,0,0,-1,n,0,1,n,0,-1,-n,0,1,-n,n,0,-1,n,0,1,-n,0,-1,-n,0,1],r=[0,11,5,0,5,1,0,1,7,0,7,10,0,10,11,1,5,9,5,11,4,11,10,2,10,7,6,7,1,8,3,9,4,3,4,2,3,2,6,3,6,8,3,8,9,4,9,5,2,4,11,6,2,10,8,6,7,9,8,1];super(s,r,e,t),this.type="IcosahedronGeometry",this.parameters={radius:e,detail:t}}static fromJSON(e){return new xo(e.radius,e.detail)}}class gr extends Xt{constructor(e=1,t=1,n=1,s=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:n,heightSegments:s};const r=e/2,a=t/2,o=Math.floor(n),l=Math.floor(s),c=o+1,u=l+1,f=e/o,d=t/l,h=[],p=[],v=[],m=[];for(let g=0;g<u;g++){const x=g*d-a;for(let M=0;M<c;M++){const S=M*f-r;p.push(S,-x,0),v.push(0,0,1),m.push(M/o),m.push(1-g/l)}}for(let g=0;g<l;g++)for(let x=0;x<o;x++){const M=x+c*g,S=x+c*(g+1),w=x+1+c*(g+1),T=x+1+c*g;h.push(M,S,T),h.push(S,w,T)}this.setIndex(h),this.setAttribute("position",new Tt(p,3)),this.setAttribute("normal",new Tt(v,3)),this.setAttribute("uv",new Tt(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new gr(e.width,e.height,e.widthSegments,e.heightSegments)}}function ki(i){const e={};for(const t in i){e[t]={};for(const n in i[t]){const s=i[t][n];if(Sl(s))s.isRenderTargetTexture?(He("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][n]=null):e[t][n]=s.clone();else if(Array.isArray(s))if(Sl(s[0])){const r=[];for(let a=0,o=s.length;a<o;a++)r[a]=s[a].clone();e[t][n]=r}else e[t][n]=s.slice();else e[t][n]=s}}return e}function Yt(i){const e={};for(let t=0;t<i.length;t++){const n=ki(i[t]);for(const s in n)e[s]=n[s]}return e}function Sl(i){return i&&(i.isColor||i.isMatrix3||i.isMatrix4||i.isVector2||i.isVector3||i.isVector4||i.isTexture||i.isQuaternion)}function Vd(i){const e=[];for(let t=0;t<i.length;t++)e.push(i[t].clone());return e}function jc(i){const e=i.getRenderTarget();return e===null?i.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:rt.workingColorSpace}const Wd={clone:ki,merge:Yt};var Xd=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,qd=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;class fi extends vs{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=Xd,this.fragmentShader=qd,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=ki(e.uniforms),this.uniformsGroups=Vd(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this.defaultAttributeValues=Object.assign({},e.defaultAttributeValues),this.index0AttributeName=e.index0AttributeName,this.uniformsNeedUpdate=e.uniformsNeedUpdate,this}toJSON(e){const t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(const s in this.uniforms){const a=this.uniforms[s].value;a&&a.isTexture?t.uniforms[s]={type:"t",value:a.toJSON(e).uuid}:a&&a.isColor?t.uniforms[s]={type:"c",value:a.getHex()}:a&&a.isVector2?t.uniforms[s]={type:"v2",value:a.toArray()}:a&&a.isVector3?t.uniforms[s]={type:"v3",value:a.toArray()}:a&&a.isVector4?t.uniforms[s]={type:"v4",value:a.toArray()}:a&&a.isMatrix3?t.uniforms[s]={type:"m3",value:a.toArray()}:a&&a.isMatrix4?t.uniforms[s]={type:"m4",value:a.toArray()}:t.uniforms[s]={value:a}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;const n={};for(const s in this.extensions)this.extensions[s]===!0&&(n[s]=!0);return Object.keys(n).length>0&&(t.extensions=n),t}fromJSON(e,t){if(super.fromJSON(e,t),e.uniforms!==void 0)for(const n in e.uniforms){const s=e.uniforms[n];switch(this.uniforms[n]={},s.type){case"t":this.uniforms[n].value=t[s.value]||null;break;case"c":this.uniforms[n].value=new Ve().setHex(s.value);break;case"v2":this.uniforms[n].value=new Se().fromArray(s.value);break;case"v3":this.uniforms[n].value=new O().fromArray(s.value);break;case"v4":this.uniforms[n].value=new bt().fromArray(s.value);break;case"m3":this.uniforms[n].value=new Xe().fromArray(s.value);break;case"m4":this.uniforms[n].value=new xt().fromArray(s.value);break;default:this.uniforms[n].value=s.value}}if(e.defines!==void 0&&(this.defines=e.defines),e.vertexShader!==void 0&&(this.vertexShader=e.vertexShader),e.fragmentShader!==void 0&&(this.fragmentShader=e.fragmentShader),e.glslVersion!==void 0&&(this.glslVersion=e.glslVersion),e.extensions!==void 0)for(const n in e.extensions)this.extensions[n]=e.extensions[n];return e.lights!==void 0&&(this.lights=e.lights),e.clipping!==void 0&&(this.clipping=e.clipping),this}}class Yd extends fi{constructor(e){super(e),this.isRawShaderMaterial=!0,this.type="RawShaderMaterial"}}class _n extends vs{constructor(e){super(),this.isMeshStandardMaterial=!0,this.type="MeshStandardMaterial",this.defines={STANDARD:""},this.color=new Ve(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Ve(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=Ya,this.normalScale=new Se(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new ei,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:""},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}}class $d extends vs{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=uu,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}}class Kd extends vs{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}}class eh extends Bt{static registerNode(e){this.prototype._lightNode=e}constructor(e,t=1){super(),this.isLight=!0,this.type="Light",this.color=new Ve(e),this.intensity=t}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){const t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,t}}class Zd extends eh{constructor(e,t,n){super(e,n),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(Bt.DEFAULT_UP),this.updateMatrix(),this.groundColor=new Ve(t)}copy(e,t){return super.copy(e,t),this.groundColor.copy(e.groundColor),this}toJSON(e){const t=super.toJSON(e);return t.object.groundColor=this.groundColor.getHex(),t}}const Zr=new xt,yl=new O,El=new O;class Jd{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.biasNode=null,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new Se(512,512),this.mapType=nn,this.map=null,this.mapPass=null,this.matrix=new xt,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new ds,this._frameExtents=new Se(1,1),this._viewportCount=1,this._viewports=[new bt(0,0,1,1)]}getViewportCount(){return this._viewportCount}getCamera(){return this.camera}getFrustum(){return this._frustum}updateMatrices(e){const t=this.camera;yl.setFromMatrixPosition(e.matrixWorld),t.position.copy(yl),El.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(El),t.updateMatrixWorld(),this._updateMatrix(t,this.matrix,this._frustum)}_updateMatrix(e,t,n,s){Zr.multiplyMatrices(e.projectionMatrix,e.matrixWorldInverse),n.setFromProjectionMatrix(Zr,e.coordinateSystem,e.reversedDepth);const r=this._frameExtents,a=s?s.z/r.x:1,o=s?s.w/r.y:1,l=s?s.x/r.x:0,c=s?s.y/r.y:0;e.coordinateSystem===hs||e.reversedDepth?t.set(.5*a,0,0,.5*a+l,0,.5*o,0,.5*o+c,0,0,1,0,0,0,0,1):t.set(.5*a,0,0,.5*a+l,0,.5*o,0,.5*o+c,0,0,.5,.5,0,0,0,1),t.multiply(Zr)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.autoUpdate=e.autoUpdate,this.needsUpdate=e.needsUpdate,this.normalBias=e.normalBias,this.blurSamples=e.blurSamples,this.mapSize.copy(e.mapSize),this.mapType=e.mapType,this.biasNode=e.biasNode,this}clone(){return new this.constructor().copy(this)}toJSON(){const e={};return e.intensity=this.intensity,e.bias=this.bias,e.normalBias=this.normalBias,e.radius=this.radius,e.blurSamples=this.blurSamples,e.mapSize=this.mapSize.toArray(),e.mapType=this.mapType,e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}}const Ws=new O,Xs=new Gi,vn=new O;class th extends Bt{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new xt,this.projectionMatrix=new xt,this.projectionMatrixInverse=new xt,this.coordinateSystem=mn,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorld.decompose(Ws,Xs,vn),vn.x===1&&vn.y===1&&vn.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(Ws,Xs,vn.set(1,1,1)).invert()}updateWorldMatrix(e,t,n=!1){super.updateWorldMatrix(e,t,n),this.matrixWorld.decompose(Ws,Xs,vn),vn.x===1&&vn.y===1&&vn.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(Ws,Xs,vn.set(1,1,1)).invert()}clone(){return new this.constructor().copy(this)}}const Yn=new O,bl=new Se,wl=new Se;class dn extends th{constructor(e=50,t=1,n=.1,s=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=n,this.far=s,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){const t=.5*this.getFilmHeight()/e;this.fov=us*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){const e=Math.tan(ns*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return us*2*Math.atan(Math.tan(ns*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,n){Yn.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(Yn.x,Yn.y).multiplyScalar(-e/Yn.z),Yn.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(Yn.x,Yn.y).multiplyScalar(-e/Yn.z)}getViewSize(e,t){return this.getViewBounds(e,bl,wl),t.subVectors(wl,bl)}setViewOffset(e,t,n,s,r,a){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=this.near;let t=e*Math.tan(ns*.5*this.fov)/this.zoom,n=2*t,s=this.aspect*n,r=-.5*s;const a=this.view;if(this.view!==null&&this.view.enabled){const l=a.fullWidth,c=a.fullHeight;r+=a.offsetX*s/l,t-=a.offsetY*n/c,s*=a.width/l,n*=a.height/c}const o=this.filmOffset;o!==0&&(r+=e*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+s,t,t-n,e,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}}class nh extends th{constructor(e=-1,t=1,n=1,s=-1,r=.1,a=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=n,this.bottom=s,this.near=r,this.far=a,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,n,s,r,a){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,s=(this.top+this.bottom)/2;let r=n-e,a=n+e,o=s+t,l=s-t;if(this.view!==null&&this.view.enabled){const c=(this.right-this.left)/this.view.fullWidth/this.zoom,u=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=c*this.view.offsetX,a=r+c*this.view.width,o-=u*this.view.offsetY,l=o-u*this.view.height}this.projectionMatrix.makeOrthographic(r,a,o,l,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}}class Qd extends Jd{constructor(){super(new nh(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}}class jd extends eh{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(Bt.DEFAULT_UP),this.updateMatrix(),this.target=new Bt,this.shadow=new Qd}dispose(){super.dispose(),this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}toJSON(e){const t=super.toJSON(e);return t.object.shadow=this.shadow.toJSON(),t.object.target=this.target.uuid,t}}const Ti=-90,Ai=1;class Ja extends Bt{constructor(e,t,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;const s=new dn(Ti,Ai,e,t);s.layers=this.layers,this.add(s);const r=new dn(Ti,Ai,e,t);r.layers=this.layers,this.add(r);const a=new dn(Ti,Ai,e,t);a.layers=this.layers,this.add(a);const o=new dn(Ti,Ai,e,t);o.layers=this.layers,this.add(o);const l=new dn(Ti,Ai,e,t);l.layers=this.layers,this.add(l);const c=new dn(Ti,Ai,e,t);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){const e=this.coordinateSystem,t=this.children.concat(),[n,s,r,a,o,l]=t;for(const c of t)this.remove(c);if(e===mn)n.up.set(0,1,0),n.lookAt(1,0,0),s.up.set(0,1,0),s.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),a.up.set(0,0,1),a.lookAt(0,-1,0),o.up.set(0,1,0),o.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(e===hs)n.up.set(0,-1,0),n.lookAt(-1,0,0),s.up.set(0,-1,0),s.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),a.up.set(0,0,-1),a.lookAt(0,-1,0),o.up.set(0,-1,0),o.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(const c of t)this.add(c),c.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();const{renderTarget:n,activeMipmapLevel:s}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());const[r,a,o,l,c,u]=this.children,f=e.getRenderTarget(),d=e.getActiveCubeFace(),h=e.getActiveMipmapLevel(),p=e.xr.enabled;e.xr.enabled=!1;const v=n.texture.mipmapsAutoUpdate;n.texture.mipmapsAutoUpdate=!1;let m=!1;e.isWebGLRenderer===!0?m=e.state.buffers.depth.getReversed():m=e.reversedDepthBuffer,e.setRenderTarget(n,0,s),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,r),e.setRenderTarget(n,1,s),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,a),e.setRenderTarget(n,2,s),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,o),e.setRenderTarget(n,3,s),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,l),e.setRenderTarget(n,4,s),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,c),n.texture.mipmapsAutoUpdate=v,e.setRenderTarget(n,5,s),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,u),e.setRenderTarget(f,d,h),e.xr.enabled=p,n.texture.needsPMREMUpdate=!0}}class ef extends dn{constructor(e=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=e,this.perCameraFrustumCulled=!1}}function Tl(i,e,t,n){const s=tf(n);switch(t){case Tc:return i*e;case Rc:return i*e/s.components*s.byteLength;case ro:return i*e/s.components*s.byteLength;case ui:return i*e*2/s.components*s.byteLength;case ao:return i*e*2/s.components*s.byteLength;case Ac:return i*e*3/s.components*s.byteLength;case En:return i*e*4/s.components*s.byteLength;case oo:return i*e*4/s.components*s.byteLength;case Qs:case js:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*8;case er:case tr:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case va:case Ma:return Math.max(i,16)*Math.max(e,8)/4;case _a:case xa:return Math.max(i,8)*Math.max(e,8)/2;case Sa:case ya:case ba:case wa:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*8;case Ea:case rr:case Ta:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case Aa:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case Ra:return Math.floor((i+4)/5)*Math.floor((e+3)/4)*16;case Ca:return Math.floor((i+4)/5)*Math.floor((e+4)/5)*16;case Pa:return Math.floor((i+5)/6)*Math.floor((e+4)/5)*16;case La:return Math.floor((i+5)/6)*Math.floor((e+5)/6)*16;case Da:return Math.floor((i+7)/8)*Math.floor((e+4)/5)*16;case Ia:return Math.floor((i+7)/8)*Math.floor((e+5)/6)*16;case Na:return Math.floor((i+7)/8)*Math.floor((e+7)/8)*16;case Ua:return Math.floor((i+9)/10)*Math.floor((e+4)/5)*16;case Fa:return Math.floor((i+9)/10)*Math.floor((e+5)/6)*16;case Oa:return Math.floor((i+9)/10)*Math.floor((e+7)/8)*16;case Ba:return Math.floor((i+9)/10)*Math.floor((e+9)/10)*16;case ka:return Math.floor((i+11)/12)*Math.floor((e+9)/10)*16;case za:return Math.floor((i+11)/12)*Math.floor((e+11)/12)*16;case Ga:case Ha:case Va:return Math.ceil(i/4)*Math.ceil(e/4)*16;case Wa:case Xa:return Math.ceil(i/4)*Math.ceil(e/4)*8;case ar:case qa:return Math.ceil(i/4)*Math.ceil(e/4)*16}throw new Error(`Unable to determine texture byte length for ${t} format.`)}function tf(i){switch(i){case nn:case yc:return{byteLength:1,components:1};case cs:case Ec:case Tn:return{byteLength:2,components:1};case io:case so:return{byteLength:2,components:4};case wn:case no:case yn:return{byteLength:4,components:1};case bc:case wc:return{byteLength:4,components:3}}throw new Error(`THREE.TextureUtils: Unknown texture type ${i}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:eo}}));typeof window<"u"&&(window.__THREE__?He("WARNING: Multiple instances of Three.js being imported."):window.__THREE__=eo);function ih(){let i=null,e=!1,t=null,n=null;function s(r,a){n=i.requestAnimationFrame(s),t(r,a)}return{start:function(){e!==!0&&t!==null&&i!==null&&(n=i.requestAnimationFrame(s),e=!0)},stop:function(){i!==null&&i.cancelAnimationFrame(n),e=!1},setAnimationLoop:function(r){t=r},setContext:function(r){i=r}}}function nf(i){const e=new WeakMap;function t(o,l){const c=o.array,u=o.usage,f=c.byteLength,d=i.createBuffer();i.bindBuffer(l,d),i.bufferData(l,c,u),o.onUploadCallback();let h;if(c instanceof Float32Array)h=i.FLOAT;else if(typeof Float16Array<"u"&&c instanceof Float16Array)h=i.HALF_FLOAT;else if(c instanceof Uint16Array)o.isFloat16BufferAttribute?h=i.HALF_FLOAT:h=i.UNSIGNED_SHORT;else if(c instanceof Int16Array)h=i.SHORT;else if(c instanceof Uint32Array)h=i.UNSIGNED_INT;else if(c instanceof Int32Array)h=i.INT;else if(c instanceof Int8Array)h=i.BYTE;else if(c instanceof Uint8Array)h=i.UNSIGNED_BYTE;else if(c instanceof Uint8ClampedArray)h=i.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+c);return{buffer:d,type:h,bytesPerElement:c.BYTES_PER_ELEMENT,version:o.version,size:f}}function n(o,l,c){const u=l.array,f=l.updateRanges;if(i.bindBuffer(c,o),f.length===0)i.bufferSubData(c,0,u);else{f.sort((h,p)=>h.start-p.start);let d=0;for(let h=1;h<f.length;h++){const p=f[d],v=f[h];v.start<=p.start+p.count+1?p.count=Math.max(p.count,v.start+v.count-p.start):(++d,f[d]=v)}f.length=d+1;for(let h=0,p=f.length;h<p;h++){const v=f[h];i.bufferSubData(c,v.start*u.BYTES_PER_ELEMENT,u,v.start,v.count)}l.clearUpdateRanges()}l.onUploadCallback()}function s(o){return o.isInterleavedBufferAttribute&&(o=o.data),e.get(o)}function r(o){o.isInterleavedBufferAttribute&&(o=o.data);const l=e.get(o);l&&(i.deleteBuffer(l.buffer),e.delete(o))}function a(o,l){if(o.isInterleavedBufferAttribute&&(o=o.data),o.isGLBufferAttribute){const u=e.get(o);(!u||u.version<o.version)&&e.set(o,{buffer:o.buffer,type:o.type,bytesPerElement:o.elementSize,version:o.version});return}const c=e.get(o);if(c===void 0)e.set(o,t(o,l));else if(c.version<o.version){if(c.size!==o.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");n(c.buffer,o,l),c.version=o.version}}return{get:s,remove:r,update:a}}var sf=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,rf=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,af=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,of=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,lf=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,cf=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,hf=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,uf=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,df=`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec4 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 );
	}
#endif`,ff=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,pf=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,mf=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,gf=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,_f=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,vf=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,xf=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,Mf=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,Sf=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,yf=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,Ef=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#endif`,bf=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#endif`,wf=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec4 vColor;
#endif`,Tf=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec4( 1.0 );
#endif
#ifdef USE_COLOR_ALPHA
	vColor *= color;
#elif defined( USE_COLOR )
	vColor.rgb *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.rgb *= instanceColor.rgb;
#endif
#ifdef USE_BATCHING_COLOR
	vColor *= getBatchingColor( getIndirectIndex( gl_DrawID ) );
#endif`,Af=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
#define inverseTransformDirection transformDirectionByInverseViewMatrix
vec3 transformNormalByInverseViewMatrix( in vec3 normal, in mat4 viewMatrix ) {
	return normalize( ( vec4( normal, 0.0 ) * viewMatrix ).xyz );
}
vec3 transformDirectionByInverseViewMatrix( in vec3 dir, in mat4 viewMatrix ) {
	return normalize( ( vec4( dir, 0.0 ) * viewMatrix ).xyz );
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,Rf=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
#endif`,Cf=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,Pf=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,Lf=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,Df=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,If="gl_FragColor = linearToOutputTexel( gl_FragColor );",Nf=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,Uf=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * reflectVec );
		#ifdef ENVMAP_BLENDING_MULTIPLY
			outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_MIX )
			outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_ADD )
			outgoingLight += envColor.xyz * specularStrength * reflectivity;
		#endif
	#endif
#endif`,Ff=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform mat3 envMapRotation;
	uniform samplerCube envMap;
	#ifdef ENVMAP_TYPE_PMREM
		float roughnessToMip( const in float roughness ) {
			float r = clamp( roughness, 0.0, 1.0 );
			return ENVMAP_MAX_LOD * r * ( 2.0 - r );
		}
	#endif
#endif`,Of=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,Bf=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,kf=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,zf=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,Gf=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,Hf=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,Vf=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,Wf=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,Xf=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,qf=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,Yf=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,$f=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_SUN_LIGHTS > 0
	struct SunLight {
		vec3 direction;
		vec3 color;
	};
	uniform SunLight sunLights[ NUM_SUN_LIGHTS ];
	void getSunLightInfo( const in SunLight sunLight, out IncidentLight light ) {
		light.color = sunLight.color;
		light.direction = sunLight.direction;
		light.visible = true;
	}
#endif
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif
#include <lightprobes_pars_fragment>`,Kf=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_PMREM
			vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
			vec4 envMapColor = textureLod( envMap, envMapRotation * worldNormal, ENVMAP_MAX_LOD );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_PMREM
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, pow4( roughness ) ) );
			reflectVec = transformDirectionByInverseViewMatrix( reflectVec, viewMatrix );
			vec4 envMapColor = textureLod( envMap, envMapRotation * reflectVec, roughnessToMip( roughness ) );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_RETROREFLECTION
		vec3 getIBLRetroRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
			#ifdef ENVMAP_TYPE_PMREM
				vec3 retroVec = normalize( mix( viewDir, normal, pow4( roughness ) ) );
				retroVec = transformDirectionByInverseViewMatrix( retroVec, viewMatrix );
				vec4 envMapColor = textureLod( envMap, envMapRotation * retroVec, roughnessToMip( roughness ) );
				return envMapColor.rgb * envMapIntensity;
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_PMREM
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
		#ifdef USE_RETROREFLECTION
			vec3 getIBLAnisotropyRetroRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
				#ifdef ENVMAP_TYPE_PMREM
					vec3 bentNormal = cross( bitangent, viewDir );
					bentNormal = normalize( cross( bentNormal, bitangent ) );
					bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
					return getIBLRetroRadiance( viewDir, bentNormal, roughness );
				#else
					return vec3( 0.0 );
				#endif
			}
		#endif
	#endif
#endif`,Zf=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,Jf=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,Qf=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,jf=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,ep=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.diffuseContribution = diffuseColor.rgb * ( 1.0 - metalnessFactor );
material.metalness = metalnessFactor;
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.045 );
material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef USE_DIFFUSE_ROUGHNESS
	float diffuseRoughnessFactor = diffuseRoughness;
	#ifdef USE_DIFFUSE_ROUGHNESSMAP
		diffuseRoughnessFactor *= texture2D( diffuseRoughnessMap, vDiffuseRoughnessMapUv ).r;
	#endif
	material.diffuseRoughness = saturate( diffuseRoughnessFactor );
#endif
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor;
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = vec3( 0.04 );
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.045 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_RETROREFLECTION
	material.retroreflectivity = retroreflectivity;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.0001, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,tp=`uniform sampler2D dfgLUT;
struct PhysicalMaterial {
	vec3 diffuseColor;
	vec3 diffuseContribution;
	vec3 specularColor;
	vec3 specularColorBlended;
	float roughness;
	float metalness;
	float specularF90;
	float dispersion;
	vec2 dfg;
	vec3 multiScatteringCompensation;
	#ifdef USE_DIFFUSE_ROUGHNESS
		float diffuseRoughness;
	#endif
	#ifdef USE_RETROREFLECTION
		float retroreflectivity;
	#endif
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0Dielectric;
		vec3 iridescenceF0Metallic;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
#ifdef USE_DIFFUSE_ROUGHNESS
	const float EON_EPSILON = 1e-7;
	float FON_DirectionalAlbedo( const in float mu, const in float roughness, const in float A ) {
		float muComp = 1.0 - mu;
		float gOverPi = muComp * ( 0.0571085289 + muComp * ( 0.491881867 + muComp * ( - 0.332181442 + muComp * 0.0714429953 ) ) );
		return A * ( 1.0 + roughness * gOverPi );
	}
	vec3 BRDF_EON( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 diffuseColor, const in float roughness ) {
		vec3 rho = saturate( diffuseColor );
		if ( roughness <= EON_EPSILON ) return BRDF_Lambert( rho );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float s = dot( lightDir, viewDir ) - dotNL * dotNV;
		float sOverT = ( s > 0.0 ) ? s / max( max( dotNL, dotNV ), EON_EPSILON ) : s;
		float A = 1.0 / ( 1.0 + ( 0.5 - 2.0 / ( 3.0 * PI ) ) * roughness );
		vec3 singleScatter = rho * RECIPROCAL_PI * A * ( 1.0 + roughness * sOverT );
		float averageAlbedo = A * ( 1.0 + ( 2.0 / 3.0 - 28.0 / ( 15.0 * PI ) ) * roughness );
		float albedoV = FON_DirectionalAlbedo( dotNV, roughness, A );
		float albedoL = FON_DirectionalAlbedo( dotNL, roughness, A );
		vec3 rhoMultiScatter = rho * rho * averageAlbedo / max( vec3( EON_EPSILON ), vec3( 1.0 ) - rho * ( 1.0 - averageAlbedo ) );
		vec3 multiScatter = rhoMultiScatter * RECIPROCAL_PI
			* max( EON_EPSILON, 1.0 - albedoV )
			* max( EON_EPSILON, 1.0 - albedoL )
			/ max( EON_EPSILON, 1.0 - averageAlbedo );
		return singleScatter + multiScatter;
	}
	vec3 EON_DirectionalAlbedo( const in vec3 diffuseColor, const in float roughness, const in float dotNV ) {
		vec3 rho = saturate( diffuseColor );
		if ( roughness <= EON_EPSILON ) return rho;
		float A = 1.0 / ( 1.0 + ( 0.5 - 2.0 / ( 3.0 * PI ) ) * roughness );
		float directionalAlbedo = FON_DirectionalAlbedo( dotNV, roughness, A );
		float averageAlbedo = A * ( 1.0 + ( 2.0 / 3.0 - 28.0 / ( 15.0 * PI ) ) * roughness );
		vec3 rhoMultiScatter = rho * rho * averageAlbedo / max( vec3( EON_EPSILON ), vec3( 1.0 ) - rho * ( 1.0 - averageAlbedo ) );
		return rho * directionalAlbedo + rhoMultiScatter * ( 1.0 - directionalAlbedo );
	}
#endif
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		return 0.5 / max( gv + gl, EPSILON );
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = max( material.clearcoatRoughness, 0.045 );
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColorBlended;
	float f90 = material.specularF90;
	float roughness = max( material.roughness, 0.045 );
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float alphaT = max( material.alphaT, alpha );
		float V = V_GGX_SmithCorrelated_Anisotropic( alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transpose( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float rInv = 1.0 / ( roughness + 0.1 );
	float a = -1.9362 + 1.0678 * roughness + 0.4573 * r2 - 0.8469 * rInv;
	float b = -0.6014 + 0.5538 * roughness - 0.4670 * r2 - 0.1255 * rInv;
	float DG = exp( a * dotNV + b );
	return saturate( DG );
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 fab = texture2D( dfgLUT, vec2( roughness, dotNV ) ).rg;
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec2 fab, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec2 fab, const in vec3 specularColor, const in float specularF90, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColorBlended * t2.x + ( material.specularF90 - material.specularColorBlended ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseContribution * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
		#ifdef USE_CLEARCOAT
			vec3 Ncc = geometryClearcoatNormal;
			vec2 uvClearcoat = LTC_Uv( Ncc, viewDir, material.clearcoatRoughness );
			vec4 t1Clearcoat = texture2D( ltc_1, uvClearcoat );
			vec4 t2Clearcoat = texture2D( ltc_2, uvClearcoat );
			mat3 mInvClearcoat = mat3(
				vec3( t1Clearcoat.x, 0, t1Clearcoat.y ),
				vec3(             0, 1,             0 ),
				vec3( t1Clearcoat.z, 0, t1Clearcoat.w )
			);
			vec3 fresnelClearcoat = material.clearcoatF0 * t2Clearcoat.x + ( material.clearcoatF90 - material.clearcoatF0 ) * t2Clearcoat.y;
			clearcoatSpecularDirect += lightColor * fresnelClearcoat * LTC_Evaluate( Ncc, viewDir, position, mInvClearcoat, rectCoords );
		#endif
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
 
 		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
 
 		float sheenAlbedoV = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
 		float sheenAlbedoL = IBLSheenBRDF( geometryNormal, directLight.direction, material.sheenRoughness );
 
 		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * max( sheenAlbedoV, sheenAlbedoL );
 
 		irradiance *= sheenEnergyComp;
 
 	#endif
	vec3 specularBRDF = BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	#ifdef USE_RETROREFLECTION
		vec3 retroViewDir = reflect( - geometryViewDir, geometryNormal );
		vec3 retroSpecularBRDF = BRDF_GGX( directLight.direction, retroViewDir, geometryNormal, material );
		specularBRDF = mix( specularBRDF, retroSpecularBRDF, saturate( material.retroreflectivity ) );
	#endif
	reflectedLight.directSpecular += irradiance * specularBRDF * material.multiScatteringCompensation;
	vec3 halfDir = normalize( directLight.direction + geometryViewDir );
	float dotVH = saturate( dot( geometryViewDir, halfDir ) );
	vec3 F = F_Schlick( material.specularColor, material.specularF90, dotVH );
	#ifdef USE_RETROREFLECTION
		vec3 retroHalfDir = normalize( directLight.direction + retroViewDir );
		float dotRetroVH = saturate( dot( retroViewDir, retroHalfDir ) );
		vec3 retroF = F_Schlick( material.specularColor, material.specularF90, dotRetroVH );
		F = mix( F, retroF, saturate( material.retroreflectivity ) );
	#endif
	#ifdef USE_DIFFUSE_ROUGHNESS
		vec3 diffuseBRDF = BRDF_EON( directLight.direction, geometryViewDir, geometryNormal, material.diffuseColor, material.diffuseRoughness ) * ( 1.0 - material.metalness );
	#else
		vec3 diffuseBRDF = BRDF_Lambert( material.diffuseContribution );
	#endif
	reflectedLight.directDiffuse += irradiance * diffuseBRDF * ( 1.0 - F );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( material.dfg, material.specularColor, material.specularF90, material.iridescence, material.iridescenceF0Dielectric, singleScattering, multiScattering );
	#else
		computeMultiscattering( material.dfg, material.specularColor, material.specularF90, singleScattering, multiScattering );
	#endif
	#ifdef USE_DIFFUSE_ROUGHNESS
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		vec3 diffuseAlbedo = EON_DirectionalAlbedo( material.diffuseColor, material.diffuseRoughness, dotNV ) * ( 1.0 - material.metalness );
		vec3 diffuse = irradiance * RECIPROCAL_PI * diffuseAlbedo * ( 1.0 - singleScattering - multiScattering );
	#else
		vec3 diffuse = irradiance * BRDF_Lambert( material.diffuseContribution ) * ( 1.0 - singleScattering - multiScattering );
	#endif
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		sheenSpecularIndirect += irradiance * material.sheenColor * sheenAlbedo * RECIPROCAL_PI;
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		diffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectDiffuse += diffuse;
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness ) * RECIPROCAL_PI;
 	#endif
	vec3 singleScatteringDielectric = vec3( 0.0 );
	vec3 multiScatteringDielectric = vec3( 0.0 );
	vec3 singleScatteringMetallic = vec3( 0.0 );
	vec3 multiScatteringMetallic = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( material.dfg, material.specularColor, material.specularF90, material.iridescence, material.iridescenceF0Dielectric, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscatteringIridescence( material.dfg, material.diffuseColor, material.specularF90, material.iridescence, material.iridescenceF0Metallic, singleScatteringMetallic, multiScatteringMetallic );
	#else
		computeMultiscattering( material.dfg, material.specularColor, material.specularF90, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscattering( material.dfg, material.diffuseColor, material.specularF90, singleScatteringMetallic, multiScatteringMetallic );
	#endif
	vec3 singleScattering = mix( singleScatteringDielectric, singleScatteringMetallic, material.metalness );
	vec3 multiScattering = mix( multiScatteringDielectric, multiScatteringMetallic, material.metalness );
	vec3 totalScatteringDielectric = singleScatteringDielectric + multiScatteringDielectric;
	#ifdef USE_DIFFUSE_ROUGHNESS
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		vec3 diffuse = EON_DirectionalAlbedo( material.diffuseColor, material.diffuseRoughness, dotNV ) * ( 1.0 - material.metalness ) * ( 1.0 - totalScatteringDielectric );
	#else
		vec3 diffuse = material.diffuseContribution * ( 1.0 - totalScatteringDielectric );
	#endif
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	vec3 indirectSpecular = radiance * singleScattering;
	indirectSpecular += multiScattering * cosineWeightedIrradiance;
	vec3 indirectDiffuse = diffuse * cosineWeightedIrradiance;
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		indirectSpecular *= sheenEnergyComp;
		indirectDiffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectSpecular += indirectSpecular;
	reflectedLight.indirectDiffuse += indirectDiffuse;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,np=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		vec3 iridescenceFresnelDielectric = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		vec3 iridescenceFresnelMetallic = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.diffuseColor );
		material.iridescenceFresnel = mix( iridescenceFresnelDielectric, iridescenceFresnelMetallic, material.metalness );
		material.iridescenceF0Dielectric = Schlick_to_F0( iridescenceFresnelDielectric, 1.0, dotNVi );
		material.iridescenceF0Metallic = Schlick_to_F0( iridescenceFresnelMetallic, 1.0, dotNVi );
	}
#endif
#ifdef STANDARD
	float dotNVms = saturate( dot( geometryNormal, geometryViewDir ) );
	material.dfg = texture2D( dfgLUT, vec2( material.roughness, dotNVms ) ).rg;
	#if ( NUM_SUN_LIGHTS > 0 || NUM_DIR_LIGHTS > 0 || NUM_POINT_LIGHTS > 0 || NUM_SPOT_LIGHTS > 0 )
		float EssMs = material.dfg.x + material.dfg.y;
		material.multiScatteringCompensation = 1.0 + material.specularColorBlended * ( 1.0 / EssMs - 1.0 );
	#endif
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS ) && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SUN_LIGHTS > 0 ) && defined( RE_Direct )
	SunLight sunLight;
	#if defined( USE_SHADOWMAP ) && NUM_SUN_LIGHT_SHADOWS > 0
	SunLightShadow sunLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SUN_LIGHTS; i ++ ) {
		sunLight = sunLights[ i ];
		getSunLightInfo( sunLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SUN_LIGHT_SHADOWS )
		sunLightShadow = sunLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getSunShadow( sunShadowMap[ i ], sunLightShadow, UNROLLED_LOOP_INDEX ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_LIGHT_PROBE_GRIDS > 0
		vec3 probeWorldPos = ( ( vec4( geometryPosition, 1.0 ) - viewMatrix[ 3 ] ) * viewMatrix ).xyz;
		vec3 probeWorldNormal = transformNormalByInverseViewMatrix( geometryNormal, viewMatrix );
		int probeGrid = - 1;
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_LIGHT_PROBE_GRIDS; i ++ ) {
			if ( isInsideLightProbeGrid( probeWorldPos, probeWorldNormal, probesMin[ i ], probesMax[ i ], probesResolution[ i ] ) ) probeGrid = UNROLLED_LOOP_INDEX;
		}
		#pragma unroll_loop_end
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_LIGHT_PROBE_GRIDS; i ++ ) {
			if ( probeGrid == UNROLLED_LOOP_INDEX ) irradiance += getLightProbeGridIrradiance( probesSH[ i ], probesMin[ i ], probesMax[ i ], probesResolution[ i ], probeWorldPos, probeWorldNormal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,ip=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( ENVMAP_TYPE_PMREM )
		#if defined( STANDARD ) || defined( LAMBERT ) || defined( PHONG )
			iblIrradiance += getIBLIrradiance( geometryNormal );
		#endif
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		vec3 iblRadiance = getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		vec3 iblRadiance = getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_RETROREFLECTION
		#ifdef USE_ANISOTROPY
			vec3 retroIBLRadiance = getIBLAnisotropyRetroRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
		#else
			vec3 retroIBLRadiance = getIBLRetroRadiance( geometryViewDir, geometryNormal, material.roughness );
		#endif
		iblRadiance = mix( iblRadiance, retroIBLRadiance, saturate( material.retroreflectivity ) );
	#endif
	radiance += iblRadiance;
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,sp=`#if defined( RE_IndirectDiffuse )
	#if defined( LAMBERT ) || defined( PHONG )
		irradiance += iblIrradiance;
	#endif
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,rp=`#if NUM_LIGHT_PROBE_GRIDS > 0
uniform highp sampler3D probesSH[ NUM_LIGHT_PROBE_GRIDS ];
uniform vec3 probesMin[ NUM_LIGHT_PROBE_GRIDS ];
uniform vec3 probesMax[ NUM_LIGHT_PROBE_GRIDS ];
uniform vec3 probesResolution[ NUM_LIGHT_PROBE_GRIDS ];
bool isInsideLightProbeGrid( vec3 worldPos, vec3 worldNormal, vec3 probesMin, vec3 probesMax, vec3 probesResolution ) {
	vec3 spacing = ( probesMax - probesMin ) / probesResolution;
	vec3 samplePos = worldPos + worldNormal * spacing * 0.5;
	vec3 margin = spacing * 0.01;
	return all( greaterThanEqual( samplePos, probesMin - margin ) ) && all( lessThanEqual( samplePos, probesMax + margin ) );
}
vec3 getLightProbeGridIrradiance( highp sampler3D probesSH, vec3 probesMin, vec3 probesMax, vec3 probesResolution, vec3 worldPos, vec3 worldNormal ) {
	vec3 res = probesResolution;
	vec3 gridRange = probesMax - probesMin;
	vec3 probeSpacing = gridRange / res;
	vec3 samplePos = worldPos + worldNormal * probeSpacing * 0.5;
	vec3 uvw = clamp( ( samplePos - probesMin ) / gridRange, 0.5 / res, 1.0 - 0.5 / res );
	float nz          = res.z;
	float paddedSlices = nz + 2.0;
	float atlasDepth  = 7.0 * paddedSlices;
	float uvZBase     = uvw.z * nz + 1.0;
	vec4 s0 = texture( probesSH, vec3( uvw.xy, ( uvZBase                       ) / atlasDepth ) );
	vec4 s1 = texture( probesSH, vec3( uvw.xy, ( uvZBase +       paddedSlices   ) / atlasDepth ) );
	vec4 s2 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 2.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s3 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 3.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s4 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 4.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s5 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 5.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s6 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 6.0 * paddedSlices   ) / atlasDepth ) );
	vec3 c0 = s0.xyz;
	vec3 c1 = vec3( s0.w, s1.xy );
	vec3 c2 = vec3( s1.zw, s2.x );
	vec3 c3 = s2.yzw;
	vec3 c4 = s3.xyz;
	vec3 c5 = vec3( s3.w, s4.xy );
	vec3 c6 = vec3( s4.zw, s5.x );
	vec3 c7 = s5.yzw;
	vec3 c8 = s6.xyz;
	float x = worldNormal.x, y = worldNormal.y, z = worldNormal.z;
	vec3 result = c0 * 0.886227;
	result += c1 * 2.0 * 0.511664 * y;
	result += c2 * 2.0 * 0.511664 * z;
	result += c3 * 2.0 * 0.511664 * x;
	result += c4 * 2.0 * 0.429043 * x * y;
	result += c5 * 2.0 * 0.429043 * y * z;
	result += c6 * ( 0.743125 * z * z - 0.247708 );
	result += c7 * 2.0 * 0.429043 * x * z;
	result += c8 * 0.429043 * ( x * x - y * y );
	return max( result, vec3( 0.0 ) );
}
#endif`,ap=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,op=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,lp=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,cp=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,hp=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,up=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,dp=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,fp=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,pp=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,mp=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,gp=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,_p=`#if defined( USE_MORPHCOLORS )
	#if defined( USE_COLOR_ALPHA )
		vColor *= morphTargetBaseInfluence;
	#elif defined( USE_COLOR )
		vColor.rgb *= morphTargetBaseInfluence;
	#endif
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor.rgb += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,vp=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,xp=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,Mp=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Sp=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#ifdef DOUBLE_SIDED
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#ifdef DOUBLE_SIDED
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,yp=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#if defined( USE_PACKED_NORMALMAP )
		mapN = vec3( mapN.xy, sqrt( saturate( 1.0 - dot( mapN.xy, mapN.xy ) ) ) );
	#endif
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,Ep=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,bp=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,wp=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
		#ifdef FLIP_SIDED
			vBitangent = - vBitangent;
		#endif
	#endif
#endif`,Tp=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,Ap=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,Rp=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,Cp=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,Pp=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,Lp=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,Dp=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	#ifdef USE_REVERSED_DEPTH_BUFFER
	
		return depth * ( far - near ) - far;
	#else
		return depth * ( near - far ) - near;
	#endif
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	
	#ifdef USE_REVERSED_DEPTH_BUFFER
		return ( near * far ) / ( ( near - far ) * depth - near );
	#else
		return ( near * far ) / ( ( far - near ) * depth - far );
	#endif
}`,Ip=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,Np=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,Up=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,Fp=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,Op=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,Bp=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,kp=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
		#define SUN_LIGHT_CASCADES 2
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow sunShadowMap[ NUM_SUN_LIGHT_SHADOWS ];
		#else
			uniform sampler2D sunShadowMap[ NUM_SUN_LIGHT_SHADOWS ];
		#endif
		uniform mat4 sunShadowMatrix[ NUM_SUN_LIGHT_SHADOWS * SUN_LIGHT_CASCADES ];
		uniform vec4 sunShadowCascade[ NUM_SUN_LIGHT_SHADOWS * SUN_LIGHT_CASCADES ];
		varying vec4 vSunShadowWorldPosition;
		varying vec3 vSunShadowWorldNormal;
		struct SunLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SunLightShadow sunLightShadows[ NUM_SUN_LIGHT_SHADOWS ];
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#else
			uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#endif
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#else
			uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#endif
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform samplerCubeShadow pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#elif defined( SHADOWMAP_TYPE_BASIC )
			uniform samplerCube pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#endif
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float interleavedGradientNoise( vec2 position ) {
			return fract( 52.9829189 * fract( dot( position, vec2( 0.06711056, 0.00583715 ) ) ) );
		}
		vec2 vogelDiskSample( int sampleIndex, int samplesCount, float phi ) {
			const float goldenAngle = 2.399963229728653;
			float r = sqrt( ( float( sampleIndex ) + 0.5 ) / float( samplesCount ) );
			float theta = float( sampleIndex ) * goldenAngle + phi;
			return vec2( cos( theta ), sin( theta ) ) * r;
		}
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float getShadow( sampler2DShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
				vec2 radius = shadowRadius * texelSize;
				float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
				shadow = (
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 0, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 1, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 2, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 3, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 4, 5, phi ) * radius, shadowCoord.z ) )
				) * 0.2;
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#elif defined( SHADOWMAP_TYPE_VSM )
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 distribution = texture2D( shadowMap, shadowCoord.xy ).rg;
				float mean = distribution.x;
				float variance = distribution.y * distribution.y;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					float hard_shadow = step( mean, shadowCoord.z );
				#else
					float hard_shadow = step( shadowCoord.z, mean );
				#endif
				
				if ( hard_shadow == 1.0 ) {
					shadow = 1.0;
				} else {
					variance = max( variance, 0.0000001 );
					float d = shadowCoord.z - mean;
					float p_max = variance / ( variance + d * d );
					p_max = clamp( ( p_max - 0.3 ) / 0.65, 0.0, 1.0 );
					shadow = max( hard_shadow, p_max );
				}
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#else
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				float depth = texture2D( shadowMap, shadowCoord.xy ).r;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					shadow = step( depth, shadowCoord.z );
				#else
					shadow = step( shadowCoord.z, depth );
				#endif
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#endif
	#if NUM_SUN_LIGHT_SHADOWS > 0
		float getSunShadow(
			#if defined( SHADOWMAP_TYPE_PCF )
				sampler2DShadow shadowMap,
			#else
				sampler2D shadowMap,
			#endif
			SunLightShadow sunLightShadow,
			int shadowIndex
		) {
			vec4 shadowWorldPosition = vec4( vSunShadowWorldPosition.xyz + vSunShadowWorldNormal * sunLightShadow.shadowNormalBias, 1.0 );
			float viewDepth = vSunShadowWorldPosition.w;
			int cascadeOffset = shadowIndex * SUN_LIGHT_CASCADES;
			float shadow = 1.0;
			for ( int i = SUN_LIGHT_CASCADES - 1; i >= 0; i -- ) {
				vec4 cascade = sunShadowCascade[ cascadeOffset + i ];
				if ( viewDepth >= cascade.x && viewDepth < cascade.y ) {
					float cascadeShadow = getShadow(
						shadowMap,
						sunLightShadow.shadowMapSize,
						sunLightShadow.shadowIntensity,
						sunLightShadow.shadowBias,
						sunLightShadow.shadowRadius,
						sunShadowMatrix[ cascadeOffset + i ] * shadowWorldPosition
					);
					shadow = mix( cascadeShadow, shadow, smoothstep( cascade.z, cascade.y, viewDepth ) );
				}
			}
			return shadow;
		}
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	#if defined( SHADOWMAP_TYPE_PCF )
	float getPointShadow( samplerCubeShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 bd3D = normalize( lightToPosition );
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			float lightDistance = length( lightToPosition );
			float depthRange = shadowCameraFar - shadowCameraNear;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				float depthA = - shadowCameraNear / depthRange - shadowBias;
				float depthB = shadowCameraNear * shadowCameraFar / ( depthRange * lightDistance );
			#else
				float depthA = shadowCameraFar / depthRange + shadowBias;
				float depthB = - shadowCameraNear * shadowCameraFar / ( depthRange * lightDistance );
			#endif
			float texelSize = shadowRadius / shadowMapSize.x;
			vec3 absDir = abs( bd3D );
			vec3 tangent = absDir.x > absDir.z ? vec3( 0.0, 1.0, 0.0 ) : vec3( 1.0, 0.0, 0.0 );
			tangent = normalize( cross( bd3D, tangent ) );
			vec3 bitangent = cross( bd3D, tangent );
			float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
			shadow = 0.0;
			for ( int i = 0; i < 5; i ++ ) {
				vec2 offset = vogelDiskSample( i, 5, phi );
				vec3 direction = bd3D + ( tangent * offset.x + bitangent * offset.y ) * texelSize;
				vec3 absDirection = abs( direction );
				float dp = depthA + depthB / max( max( absDirection.x, absDirection.y ), absDirection.z );
				shadow += texture( shadowMap, vec4( direction, dp ) );
			}
			shadow *= 0.2;
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#elif defined( SHADOWMAP_TYPE_BASIC )
	float getPointShadow( samplerCube shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			float depth = textureCube( shadowMap, bd3D ).r;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				depth = 1.0 - depth;
			#endif
			shadow = step( dp, depth );
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#endif
	#endif
#endif`,zp=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
		varying vec4 vSunShadowWorldPosition;
		varying vec3 vSunShadowWorldNormal;
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,Gp=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_SUN_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	#ifdef HAS_NORMAL
		vec3 shadowWorldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
	#else
		vec3 shadowWorldNormal = vec3( 0.0 );
	#endif
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_SUN_LIGHT_SHADOWS > 0
		vSunShadowWorldPosition = vec4( worldPosition.xyz, - mvPosition.z );
		vSunShadowWorldNormal = shadowWorldNormal;
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,Hp=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
	SunLightShadow sunLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SUN_LIGHT_SHADOWS; i ++ ) {
		sunLight = sunLightShadows[ i ];
		shadow *= receiveShadow ? getSunShadow( sunShadowMap[ i ], sunLight, UNROLLED_LOOP_INDEX ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0 && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,Vp=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,Wp=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,Xp=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,qp=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,Yp=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,$p=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,Kp=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,Zp=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,Jp=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseContribution, material.specularColorBlended, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,Qp=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,jp=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_DIFFUSE_ROUGHNESSMAP
	varying vec2 vDiffuseRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,e0=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_DIFFUSE_ROUGHNESSMAP
	uniform mat3 diffuseRoughnessMapTransform;
	varying vec2 vDiffuseRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,t0=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DIFFUSE_ROUGHNESSMAP
	vDiffuseRoughnessMapUv = ( diffuseRoughnessMapTransform * vec3( DIFFUSE_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,n0=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;const i0=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,s0=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,r0=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,a0=`uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <envmap_common_pars_fragment>
void main() {
	#ifdef ENVMAP_TYPE_PMREM
		vec4 texColor = textureLod( envMap, backgroundRotation * vWorldDirection, roughnessToMip( backgroundBlurriness ) );
	#else
		vec4 texColor = textureCube( envMap, backgroundRotation * vWorldDirection );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,o0=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,l0=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,c0=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,h0=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	#ifdef USE_REVERSED_DEPTH_BUFFER
		float fragCoordZ = vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ];
	#else
		float fragCoordZ = 0.5 * vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ] + 0.5;
	#endif
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,u0=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,d0=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = vec4( dist, 0.0, 0.0, 1.0 );
}`,f0=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,p0=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,m0=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,g0=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,_0=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,v0=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,x0=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,M0=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,S0=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,y0=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,E0=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,b0=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( normalize( normal ) * 0.5 + 0.5, diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,w0=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,T0=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,A0=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,R0=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DIFFUSE_ROUGHNESS
	uniform float diffuseRoughness;
	#ifdef USE_DIFFUSE_ROUGHNESSMAP
		uniform sampler2D diffuseRoughnessMap;
	#endif
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_RETROREFLECTION
	uniform float retroreflectivity;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
 
		outgoingLight = outgoingLight + sheenSpecularDirect + sheenSpecularIndirect;
 
 	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,C0=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,P0=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,L0=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,D0=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,I0=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,N0=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,U0=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,F0=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,je={alphahash_fragment:sf,alphahash_pars_fragment:rf,alphamap_fragment:af,alphamap_pars_fragment:of,alphatest_fragment:lf,alphatest_pars_fragment:cf,aomap_fragment:hf,aomap_pars_fragment:uf,batching_pars_vertex:df,batching_vertex:ff,begin_vertex:pf,beginnormal_vertex:mf,bsdfs:gf,iridescence_fragment:_f,bumpmap_pars_fragment:vf,clipping_planes_fragment:xf,clipping_planes_pars_fragment:Mf,clipping_planes_pars_vertex:Sf,clipping_planes_vertex:yf,color_fragment:Ef,color_pars_fragment:bf,color_pars_vertex:wf,color_vertex:Tf,common:Af,defaultnormal_vertex:Rf,displacementmap_pars_vertex:Cf,displacementmap_vertex:Pf,emissivemap_fragment:Lf,emissivemap_pars_fragment:Df,colorspace_fragment:If,colorspace_pars_fragment:Nf,envmap_fragment:Uf,envmap_common_pars_fragment:Ff,envmap_pars_fragment:Of,envmap_pars_vertex:Bf,envmap_physical_pars_fragment:Kf,envmap_vertex:kf,fog_vertex:zf,fog_pars_vertex:Gf,fog_fragment:Hf,fog_pars_fragment:Vf,gradientmap_pars_fragment:Wf,lightmap_pars_fragment:Xf,lights_lambert_fragment:qf,lights_lambert_pars_fragment:Yf,lights_pars_begin:$f,lights_toon_fragment:Zf,lights_toon_pars_fragment:Jf,lights_phong_fragment:Qf,lights_phong_pars_fragment:jf,lights_physical_fragment:ep,lights_physical_pars_fragment:tp,lights_fragment_begin:np,lights_fragment_maps:ip,lights_fragment_end:sp,lightprobes_pars_fragment:rp,logdepthbuf_fragment:ap,logdepthbuf_pars_fragment:op,logdepthbuf_pars_vertex:lp,logdepthbuf_vertex:cp,map_fragment:hp,map_pars_fragment:up,map_particle_fragment:dp,map_particle_pars_fragment:fp,metalnessmap_fragment:pp,metalnessmap_pars_fragment:mp,morphinstance_vertex:gp,morphcolor_vertex:_p,morphnormal_vertex:vp,morphtarget_pars_vertex:xp,morphtarget_vertex:Mp,normal_fragment_begin:Sp,normal_fragment_maps:yp,normal_pars_fragment:Ep,normal_pars_vertex:bp,normal_vertex:wp,normalmap_pars_fragment:Tp,clearcoat_normal_fragment_begin:Ap,clearcoat_normal_fragment_maps:Rp,clearcoat_pars_fragment:Cp,iridescence_pars_fragment:Pp,opaque_fragment:Lp,packing:Dp,premultiplied_alpha_fragment:Ip,project_vertex:Np,dithering_fragment:Up,dithering_pars_fragment:Fp,roughnessmap_fragment:Op,roughnessmap_pars_fragment:Bp,shadowmap_pars_fragment:kp,shadowmap_pars_vertex:zp,shadowmap_vertex:Gp,shadowmask_pars_fragment:Hp,skinbase_vertex:Vp,skinning_pars_vertex:Wp,skinning_vertex:Xp,skinnormal_vertex:qp,specularmap_fragment:Yp,specularmap_pars_fragment:$p,tonemapping_fragment:Kp,tonemapping_pars_fragment:Zp,transmission_fragment:Jp,transmission_pars_fragment:Qp,uv_pars_fragment:jp,uv_pars_vertex:e0,uv_vertex:t0,worldpos_vertex:n0,background_vert:i0,background_frag:s0,backgroundCube_vert:r0,backgroundCube_frag:a0,cube_vert:o0,cube_frag:l0,depth_vert:c0,depth_frag:h0,distance_vert:u0,distance_frag:d0,equirect_vert:f0,equirect_frag:p0,linedashed_vert:m0,linedashed_frag:g0,meshbasic_vert:_0,meshbasic_frag:v0,meshlambert_vert:x0,meshlambert_frag:M0,meshmatcap_vert:S0,meshmatcap_frag:y0,meshnormal_vert:E0,meshnormal_frag:b0,meshphong_vert:w0,meshphong_frag:T0,meshphysical_vert:A0,meshphysical_frag:R0,meshtoon_vert:C0,meshtoon_frag:P0,points_vert:L0,points_frag:D0,shadow_vert:I0,shadow_frag:N0,sprite_vert:U0,sprite_frag:F0},Ee={common:{diffuse:{value:new Ve(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Xe},alphaMap:{value:null},alphaMapTransform:{value:new Xe},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Xe}},envmap:{envMap:{value:null},envMapRotation:{value:new Xe},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Xe}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Xe}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Xe},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Xe},normalScale:{value:new Se(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Xe},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Xe}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Xe}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Xe}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new Ve(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},sunLights:{value:[],properties:{direction:{},color:{}}},sunLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},sunShadowMatrix:{value:[]},sunShadowCascade:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null},probesSH:{value:[]},probesMin:{value:[]},probesMax:{value:[]},probesResolution:{value:[]}},points:{diffuse:{value:new Ve(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Xe},alphaTest:{value:0},uvTransform:{value:new Xe}},sprite:{diffuse:{value:new Ve(16777215)},opacity:{value:1},center:{value:new Se(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Xe},alphaMap:{value:null},alphaMapTransform:{value:new Xe},alphaTest:{value:0}}},Mn={basic:{uniforms:Yt([Ee.common,Ee.specularmap,Ee.envmap,Ee.aomap,Ee.lightmap,Ee.fog]),vertexShader:je.meshbasic_vert,fragmentShader:je.meshbasic_frag},lambert:{uniforms:Yt([Ee.common,Ee.specularmap,Ee.envmap,Ee.aomap,Ee.lightmap,Ee.emissivemap,Ee.bumpmap,Ee.normalmap,Ee.displacementmap,Ee.fog,Ee.lights,{emissive:{value:new Ve(0)},envMapIntensity:{value:1}}]),vertexShader:je.meshlambert_vert,fragmentShader:je.meshlambert_frag},phong:{uniforms:Yt([Ee.common,Ee.specularmap,Ee.envmap,Ee.aomap,Ee.lightmap,Ee.emissivemap,Ee.bumpmap,Ee.normalmap,Ee.displacementmap,Ee.fog,Ee.lights,{emissive:{value:new Ve(0)},specular:{value:new Ve(1118481)},shininess:{value:30},envMapIntensity:{value:1}}]),vertexShader:je.meshphong_vert,fragmentShader:je.meshphong_frag},standard:{uniforms:Yt([Ee.common,Ee.envmap,Ee.aomap,Ee.lightmap,Ee.emissivemap,Ee.bumpmap,Ee.normalmap,Ee.displacementmap,Ee.roughnessmap,Ee.metalnessmap,Ee.fog,Ee.lights,{emissive:{value:new Ve(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:je.meshphysical_vert,fragmentShader:je.meshphysical_frag},toon:{uniforms:Yt([Ee.common,Ee.aomap,Ee.lightmap,Ee.emissivemap,Ee.bumpmap,Ee.normalmap,Ee.displacementmap,Ee.gradientmap,Ee.fog,Ee.lights,{emissive:{value:new Ve(0)}}]),vertexShader:je.meshtoon_vert,fragmentShader:je.meshtoon_frag},matcap:{uniforms:Yt([Ee.common,Ee.bumpmap,Ee.normalmap,Ee.displacementmap,Ee.fog,{matcap:{value:null}}]),vertexShader:je.meshmatcap_vert,fragmentShader:je.meshmatcap_frag},points:{uniforms:Yt([Ee.points,Ee.fog]),vertexShader:je.points_vert,fragmentShader:je.points_frag},dashed:{uniforms:Yt([Ee.common,Ee.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:je.linedashed_vert,fragmentShader:je.linedashed_frag},depth:{uniforms:Yt([Ee.common,Ee.displacementmap]),vertexShader:je.depth_vert,fragmentShader:je.depth_frag},normal:{uniforms:Yt([Ee.common,Ee.bumpmap,Ee.normalmap,Ee.displacementmap,{opacity:{value:1}}]),vertexShader:je.meshnormal_vert,fragmentShader:je.meshnormal_frag},sprite:{uniforms:Yt([Ee.sprite,Ee.fog]),vertexShader:je.sprite_vert,fragmentShader:je.sprite_frag},background:{uniforms:{uvTransform:{value:new Xe},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:je.background_vert,fragmentShader:je.background_frag},backgroundCube:{uniforms:{envMap:{value:null},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new Xe}},vertexShader:je.backgroundCube_vert,fragmentShader:je.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:je.cube_vert,fragmentShader:je.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:je.equirect_vert,fragmentShader:je.equirect_frag},distance:{uniforms:Yt([Ee.common,Ee.displacementmap,{referencePosition:{value:new O},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:je.distance_vert,fragmentShader:je.distance_frag},shadow:{uniforms:Yt([Ee.lights,Ee.fog,{color:{value:new Ve(0)},opacity:{value:1}}]),vertexShader:je.shadow_vert,fragmentShader:je.shadow_frag}};Mn.physical={uniforms:Yt([Mn.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Xe},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Xe},clearcoatNormalScale:{value:new Se(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Xe},diffuseRoughness:{value:0},diffuseRoughnessMap:{value:null},diffuseRoughnessMapTransform:{value:new Xe},dispersion:{value:0},retroreflectivity:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Xe},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Xe},sheen:{value:0},sheenColor:{value:new Ve(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Xe},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Xe},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Xe},transmissionSamplerSize:{value:new Se},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Xe},attenuationDistance:{value:0},attenuationColor:{value:new Ve(0)},specularColor:{value:new Ve(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Xe},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Xe},anisotropyVector:{value:new Se},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Xe}}]),vertexShader:je.meshphysical_vert,fragmentShader:je.meshphysical_frag};const qs={r:0,b:0,g:0},O0=new xt,sh=new Xe;sh.set(-1,0,0,0,1,0,0,0,1);function B0(i,e,t,n,s,r){const a=new Ve(0);let o=s===!0?0:1,l,c,u=null,f=0,d=null;function h(x){let M=x.isScene===!0?x.background:null;if(M&&M.isTexture){const S=x.backgroundBlurriness>0;M=e.get(M,S)}return M}function p(x){let M=!1;const S=h(x);S===null?m(a,o):S&&S.isColor&&(m(S,1),M=!0);const w=i.xr.getEnvironmentBlendMode();w==="additive"?t.buffers.color.setClear(0,0,0,1,r):w==="alpha-blend"&&t.buffers.color.setClear(0,0,0,0,r),(i.autoClear||M)&&(t.buffers.depth.setTest(!0),t.buffers.depth.setMask(!0),t.buffers.color.setMask(!0),i.clear(i.autoClearColor,i.autoClearDepth,i.autoClearStencil))}function v(x,M){const S=h(M);S&&S.isCubeTexture?(c===void 0&&(c=new kt(new kn(1,1,1),new fi({name:"BackgroundCubeMaterial",uniforms:ki(Mn.backgroundCube.uniforms),vertexShader:Mn.backgroundCube.vertexShader,fragmentShader:Mn.backgroundCube.fragmentShader,side:Jt,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute("normal"),c.geometry.deleteAttribute("uv"),c.onBeforeRender=function(w,T,_){this.matrixWorld.copyPosition(_.matrixWorld)},Object.defineProperty(c.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),n.update(c)),c.material.uniforms.envMap.value=S,c.material.uniforms.backgroundBlurriness.value=M.backgroundBlurriness,c.material.uniforms.backgroundIntensity.value=M.backgroundIntensity,c.material.uniforms.backgroundRotation.value.setFromMatrix4(O0.makeRotationFromEuler(M.backgroundRotation)).transpose(),S.isRenderTargetTexture===!1&&c.material.uniforms.backgroundRotation.value.premultiply(sh),c.material.toneMapped=rt.getTransfer(S.colorSpace)!==dt,(u!==S||f!==S.version||d!==i.toneMapping)&&(c.material.needsUpdate=!0,u=S,f=S.version,d=i.toneMapping),c.layers.enableAll(),x.unshift(c,c.geometry,c.material,0,0,null)):S&&S.isTexture&&(l===void 0&&(l=new kt(new gr(2,2),new fi({name:"BackgroundMaterial",uniforms:ki(Mn.background.uniforms),vertexShader:Mn.background.vertexShader,fragmentShader:Mn.background.fragmentShader,side:hi,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),l.geometry.deleteAttribute("normal"),Object.defineProperty(l.material,"map",{get:function(){return this.uniforms.t2D.value}}),n.update(l)),l.material.uniforms.t2D.value=S,l.material.uniforms.backgroundIntensity.value=M.backgroundIntensity,l.material.toneMapped=rt.getTransfer(S.colorSpace)!==dt,S.matrixAutoUpdate===!0&&S.updateMatrix(),l.material.uniforms.uvTransform.value.copy(S.matrix),(u!==S||f!==S.version||d!==i.toneMapping)&&(l.material.needsUpdate=!0,u=S,f=S.version,d=i.toneMapping),l.layers.enableAll(),x.unshift(l,l.geometry,l.material,0,0,null))}function m(x,M){x.getRGB(qs,jc(i)),t.buffers.color.setClear(qs.r,qs.g,qs.b,M,r)}function g(){c!==void 0&&(c.geometry.dispose(),c.material.dispose(),c=void 0),l!==void 0&&(l.geometry.dispose(),l.material.dispose(),l=void 0)}return{getClearColor:function(){return a},setClearColor:function(x,M=1){a.set(x),o=M,m(a,o)},getClearAlpha:function(){return o},setClearAlpha:function(x){o=x,m(a,o)},render:p,addToRenderList:v,dispose:g}}function k0(i,e){const t=i.getParameter(i.MAX_VERTEX_ATTRIBS),n={},s=d(null);let r=s,a=!1;function o(C,F,V,D,z){let X=!1;const k=f(C,D,V,F);r!==k&&(r=k,c(r.object)),X=h(C,D,V,z),X&&p(C,D,V,z),z!==null&&e.update(z,i.ELEMENT_ARRAY_BUFFER),(X||a)&&(a=!1,S(C,F,V,D),z!==null&&i.bindBuffer(i.ELEMENT_ARRAY_BUFFER,e.get(z).buffer))}function l(){return i.createVertexArray()}function c(C){return i.bindVertexArray(C)}function u(C){return i.deleteVertexArray(C)}function f(C,F,V,D){const z=D.wireframe===!0;let X=n[F.id];X===void 0&&(X={},n[F.id]=X);const k=C.isInstancedMesh===!0?C.id:0;let se=X[k];se===void 0&&(se={},X[k]=se);let $=se[V.id];$===void 0&&($={},se[V.id]=$);let ee=$[z];return ee===void 0&&(ee=d(l()),$[z]=ee),ee}function d(C){const F=[],V=[],D=[];for(let z=0;z<t;z++)F[z]=0,V[z]=0,D[z]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:F,enabledAttributes:V,attributeDivisors:D,object:C,attributes:{},index:null}}function h(C,F,V,D){const z=r.attributes,X=F.attributes;let k=0;const se=V.getAttributes();for(const $ in se)if(se[$].location>=0){const ie=z[$];let we=X[$];if(we===void 0&&($==="instanceMatrix"&&C.instanceMatrix&&(we=C.instanceMatrix),$==="instanceColor"&&C.instanceColor&&(we=C.instanceColor)),ie===void 0||ie.attribute!==we||we&&ie.data!==we.data)return!0;k++}return r.attributesNum!==k||r.index!==D}function p(C,F,V,D){const z={},X=F.attributes;let k=0;const se=V.getAttributes();for(const $ in se)if(se[$].location>=0){let ie=X[$];ie===void 0&&($==="instanceMatrix"&&C.instanceMatrix&&(ie=C.instanceMatrix),$==="instanceColor"&&C.instanceColor&&(ie=C.instanceColor));const we={};we.attribute=ie,ie&&ie.data&&(we.data=ie.data),z[$]=we,k++}r.attributes=z,r.attributesNum=k,r.index=D}function v(){const C=r.newAttributes;for(let F=0,V=C.length;F<V;F++)C[F]=0}function m(C){g(C,0)}function g(C,F){const V=r.newAttributes,D=r.enabledAttributes,z=r.attributeDivisors;V[C]=1,D[C]===0&&(i.enableVertexAttribArray(C),D[C]=1),z[C]!==F&&(i.vertexAttribDivisor(C,F),z[C]=F)}function x(){const C=r.newAttributes,F=r.enabledAttributes;for(let V=0,D=F.length;V<D;V++)F[V]!==C[V]&&(i.disableVertexAttribArray(V),F[V]=0)}function M(C,F,V,D,z,X,k){k===!0?i.vertexAttribIPointer(C,F,V,z,X):i.vertexAttribPointer(C,F,V,D,z,X)}function S(C,F,V,D){v();const z=D.attributes,X=V.getAttributes(),k=F.defaultAttributeValues;for(const se in X){const $=X[se];if($.location>=0){let ee=z[se];if(ee===void 0&&(se==="instanceMatrix"&&C.instanceMatrix&&(ee=C.instanceMatrix),se==="instanceColor"&&C.instanceColor&&(ee=C.instanceColor)),ee!==void 0){const ie=ee.normalized,we=ee.itemSize,Fe=e.get(ee);if(Fe===void 0)continue;const K=Fe.buffer,ge=Fe.type,Te=Fe.bytesPerElement,Ue=ge===i.INT||ge===i.UNSIGNED_INT||ee.gpuType===no;if(ee.isInterleavedBufferAttribute){const Me=ee.data,Oe=Me.isInterleavedBuffer===!0?Me.stride:Me.itemSize,pt=ee.offset;if(Me.isInstancedInterleavedBuffer||Me.isInstancedBufferAttribute){for(let ze=0;ze<$.locationSize;ze++)g($.location+ze,Me.meshPerAttribute);C.isInstancedMesh!==!0&&D._maxInstanceCount===void 0&&(D._maxInstanceCount=Me.meshPerAttribute*Me.count)}else for(let ze=0;ze<$.locationSize;ze++)m($.location+ze);i.bindBuffer(i.ARRAY_BUFFER,K);for(let ze=0;ze<$.locationSize;ze++)M($.location+ze,we/$.locationSize,ge,ie,Oe*Te,(pt+we/$.locationSize*ze)*Te,Ue)}else{if(ee.isInstancedBufferAttribute){for(let Me=0;Me<$.locationSize;Me++)g($.location+Me,ee.meshPerAttribute);C.isInstancedMesh!==!0&&D._maxInstanceCount===void 0&&(D._maxInstanceCount=ee.meshPerAttribute*ee.count)}else for(let Me=0;Me<$.locationSize;Me++)m($.location+Me);i.bindBuffer(i.ARRAY_BUFFER,K);for(let Me=0;Me<$.locationSize;Me++)M($.location+Me,we/$.locationSize,ge,ie,we*Te,we/$.locationSize*Me*Te,Ue)}}else if(k!==void 0){const ie=k[se];if(ie!==void 0)switch(ie.length){case 2:i.vertexAttrib2fv($.location,ie);break;case 3:i.vertexAttrib3fv($.location,ie);break;case 4:i.vertexAttrib4fv($.location,ie);break;default:i.vertexAttrib1fv($.location,ie)}}}}x()}function w(){P();for(const C in n){const F=n[C];for(const V in F){const D=F[V];for(const z in D){const X=D[z];for(const k in X)u(X[k].object),delete X[k];delete D[z]}}delete n[C]}}function T(C){if(n[C.id]===void 0)return;const F=n[C.id];for(const V in F){const D=F[V];for(const z in D){const X=D[z];for(const k in X)u(X[k].object),delete X[k];delete D[z]}}delete n[C.id]}function _(C){for(const F in n){const V=n[F];for(const D in V){const z=V[D];if(z[C.id]===void 0)continue;const X=z[C.id];for(const k in X)u(X[k].object),delete X[k];delete z[C.id]}}}function b(C){for(const F in n){const V=n[F],D=C.isInstancedMesh===!0?C.id:0,z=V[D];if(z!==void 0){for(const X in z){const k=z[X];for(const se in k)u(k[se].object),delete k[se];delete z[X]}delete V[D],Object.keys(V).length===0&&delete n[F]}}}function P(){R(),a=!0,r!==s&&(r=s,c(r.object))}function R(){s.geometry=null,s.program=null,s.wireframe=!1}return{setup:o,reset:P,resetDefaultState:R,dispose:w,releaseStatesOfGeometry:T,releaseStatesOfObject:b,releaseStatesOfProgram:_,initAttributes:v,enableAttribute:m,disableUnusedAttributes:x}}function z0(i,e,t){let n;function s(l){n=l}function r(l,c){i.drawArrays(n,l,c),t.update(c,n,1)}function a(l,c,u){u!==0&&(i.drawArraysInstanced(n,l,c,u),t.update(c,n,u))}function o(l,c,u){if(u===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(n,l,0,c,0,u);let d=0;for(let h=0;h<u;h++)d+=c[h];t.update(d,n,1)}this.setMode=s,this.render=r,this.renderInstances=a,this.renderMultiDraw=o}function G0(i,e,t,n){let s;function r(){if(s!==void 0)return s;if(e.has("EXT_texture_filter_anisotropic")===!0){const _=e.get("EXT_texture_filter_anisotropic");s=i.getParameter(_.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else s=0;return s}function a(_){return!(_!==En&&n.convert(_)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_FORMAT))}function o(_){const b=_===Tn&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(_!==nn&&_!==yn&&!b&&n.convert(_)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_TYPE))}function l(_){if(_==="highp"){if(i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.HIGH_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.HIGH_FLOAT).precision>0)return"highp";_="mediump"}return _==="mediump"&&i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.MEDIUM_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let c=t.precision!==void 0?t.precision:"highp";const u=l(c);u!==c&&(He("WebGLRenderer:",c,"not supported, using",u,"instead."),c=u);const f=t.reversedDepthBuffer===!0&&e.has("EXT_clip_control"),d=t.logarithmicDepthBuffer===!0&&f===!1;t.reversedDepthBuffer===!0&&f===!1&&He("WebGLRenderer: Unable to use reversed depth buffer due to missing EXT_clip_control extension. Fallback to default depth buffer."),t.logarithmicDepthBuffer===!0&&f===!0&&He("WebGLRenderer: Logarithmic depth buffer is ignored when reversed depth buffer is enabled.");const h=i.getParameter(i.MAX_TEXTURE_IMAGE_UNITS),p=i.getParameter(i.MAX_VERTEX_TEXTURE_IMAGE_UNITS),v=i.getParameter(i.MAX_TEXTURE_SIZE),m=i.getParameter(i.MAX_CUBE_MAP_TEXTURE_SIZE),g=i.getParameter(i.MAX_VERTEX_ATTRIBS),x=i.getParameter(i.MAX_VERTEX_UNIFORM_VECTORS),M=i.getParameter(i.MAX_VARYING_VECTORS),S=i.getParameter(i.MAX_FRAGMENT_UNIFORM_VECTORS),w=i.getParameter(i.MAX_SAMPLES),T=i.getParameter(i.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:l,textureFormatReadable:a,textureTypeReadable:o,precision:c,logarithmicDepthBuffer:d,reversedDepthBuffer:f,maxTextures:h,maxVertexTextures:p,maxTextureSize:v,maxCubemapSize:m,maxAttributes:g,maxVertexUniforms:x,maxVaryings:M,maxFragmentUniforms:S,maxSamples:w,samples:T}}function H0(i){const e=this;let t=null,n=0,s=!1,r=!1;const a=new $n,o=new Xe,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(f,d){const h=f.length!==0||d||n!==0||s;return s=d,n=f.length,h},this.beginShadows=function(){r=!0,u(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(f,d){t=u(f,d,0)},this.setState=function(f,d,h){const p=f.clippingPlanes,v=f.clipIntersection,m=f.clipShadows,g=i.get(f);if(!s||p===null||p.length===0||r&&!m)r?u(null):c();else{const x=r?0:n,M=x*4;let S=g.clippingState||null;l.value=S,S=u(p,d,M,h);for(let w=0;w!==M;++w)S[w]=t[w];g.clippingState=S,this.numIntersection=v?this.numPlanes:0,this.numPlanes+=x}};function c(){l.value!==t&&(l.value=t,l.needsUpdate=n>0),e.numPlanes=n,e.numIntersection=0}function u(f,d,h,p){const v=f!==null?f.length:0;let m=null;if(v!==0){if(m=l.value,p!==!0||m===null){const g=h+v*4,x=d.matrixWorldInverse;o.getNormalMatrix(x),(m===null||m.length<g)&&(m=new Float32Array(g));for(let M=0,S=h;M!==v;++M,S+=4)a.copy(f[M]).applyMatrix4(x,o),a.normal.toArray(m,S),m[S+3]=a.constant}l.value=m,l.needsUpdate=!0}return e.numPlanes=v,e.numIntersection=0,m}}class Mo extends bn{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;const n={width:e,height:e,depth:1},s=[n,n,n,n,n,n];this.texture=new Hc(s),this._setTextureOptions(t),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;const n={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},s=new kn(5,5,5),r=new fi({name:"CubemapFromEquirect",uniforms:ki(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:Jt,blending:Di});r.uniforms.tEquirect.value=t;const a=new kt(s,r),o=t.minFilter;return t.minFilter===Zn&&(t.minFilter=Zt),new Ja(1,10,this).update(e,a),t.minFilter=o,a.geometry.dispose(),a.material.dispose(),this}clear(e,t=!0,n=!0,s=!0){const r=e.getRenderTarget();for(let a=0;a<6;a++)e.setRenderTarget(this,a),e.clear(t,n,s);e.setRenderTarget(r)}}const Al=256,V0=3,W0=20,rh=256,ah=16,X0=3,q0=new O,Y0=new Ve;class dr{constructor(e){this._renderer=e,this._cubeSize=0,this._sourceTarget=null,this._cubeCamera=new Ja(1,10,null),this._boxMesh=new kt(new kn(5,5,5),null),this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null,this._integrationMaterial=null}fromScene(e,t=0,n=.1,s=100,r={}){const{size:a=256,position:o=q0}=r,l=this._renderer;this._setSize(a);const c=this._allocateTarget(),u=this._getSourceTarget(!0);t>0&&(u.texture.mipmapsAutoUpdate=!1);const f=l.autoClear,d=l.autoClearColor,h=l.autoClearDepth,p=l.autoClearStencil,v=e.background;l.autoClear=!0,l.autoClearColor=!0,l.autoClearDepth=!0,l.autoClearStencil=!0,v===null&&(e.background=l.getClearColor(Y0));const m=new Ja(n,s,u);return m.position.copy(o),m.update(l,e),l.autoClear=f,l.autoClearColor=d,l.autoClearDepth=h,l.autoClearStencil=p,e.background=v,t>0&&(u.texture.mipmapsAutoUpdate=!0,this._blur(c,t)),this._applyPMREM(c),c}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=Pl(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=Cl(),this._compileMaterial(this._equirectMaterial))}dispose(){this._sourceTarget!==null&&this._sourceTarget.dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._integrationMaterial!==null&&this._integrationMaterial.dispose(),this._boxMesh.geometry.dispose()}static lodToRoughness(e,t){return t>0?1-Math.sqrt(1-e/t):0}_setSize(e){this._cubeSize=Math.max(Al,Ic(e))}_fromTexture(e,t){e.mapping===Ui||e.mapping===ls?this._setSize(e.image.length===0?Al:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4);const n=t||this._allocateTarget();return this._textureToCubemap(e),this._applyPMREM(n),n}_allocateTarget(){const e=this._cubeSize,t=Rl(e,!1,!1),n=Math.log2(e)-V0;for(let s=0;s<=n;s++)t.texture.mipmaps.push({width:e>>s,height:e>>s});return t.texture.name="PMREM",t.texture.isPMREMTexture=!0,t}_getSourceTarget(e=!1){const t=this._cubeSize,n=this._sourceTarget;return(n===null||n.width!==t||e&&n.depthBuffer===!1)&&(n!==null&&n.dispose(),this._sourceTarget=Rl(t,!0,e)),this._sourceTarget}_compileMaterial(e){this._boxMesh.material=e,this._renderer.compile(this._boxMesh,this._cubeCamera.children[0])}_renderCube(e,t,n){const s=this._boxMesh,r=this._cubeCamera;s.material=n,r.renderTarget=e,r.activeMipmapLevel=t;const a=e.width>>t;e.viewport.set(0,0,a,a),r.update(this._renderer,s),e.viewport.set(0,0,e.width,e.height)}_textureToCubemap(e){let t;e.mapping===Ui||e.mapping===ls?(this._cubemapMaterial===null&&(this._cubemapMaterial=Pl()),t=this._cubemapMaterial,t.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):(this._equirectMaterial===null&&(this._equirectMaterial=Cl()),t=this._equirectMaterial),t.uniforms.envMap.value=e,this._renderCube(this._getSourceTarget(),0,t)}_applyPMREM(e){this._ggxMaterial===null&&(this._ggxMaterial=$0(),this._integrationMaterial=K0());const t=this._cubeSize,n=e.texture.mipmaps.length-1,s=this._ggxMaterial.uniforms;s.envMap.value=this._sourceTarget.texture;const r=this._integrationMaterial.uniforms;r.envMap.value=this._sourceTarget.texture,r.sourceLod.value=Math.log2(t/ah);for(let a=0;a<=n;a++){const o=dr.lodToRoughness(a,n);if(a>n-X0)r.roughness.value=o,this._renderCube(e,a,this._integrationMaterial);else{const l=o>0?Math.log2(t)+.5*Math.log2(6/(rh*Math.pow(o,4)))+.5:0;s.roughness.value=o,s.lodBias.value=l,this._renderCube(e,a,this._ggxMaterial)}}}_blur(e,t){this._blurMaterial===null&&(this._blurMaterial=Z0());const n=this._blurMaterial,s=n.uniforms,r=this._sourceTarget;s.sigma.value=Math.min(t,Math.PI)/Math.SQRT2,s.envMap.value=r.texture,this._renderCube(e,0,n),s.envMap.value=e.texture,this._renderCube(r,0,n)}}function Rl(i,e,t){return new Mo(i,{minFilter:Zn,generateMipmaps:e,type:Tn,colorSpace:or,depthBuffer:t})}function xs(i,e,t){return new fi({name:i,uniforms:e,vertexShader:je.cube_vert,fragmentShader:t,side:Jt,blending:Di,depthTest:!1,depthWrite:!1})}function $0(){return xs("PMREMGGXConvolution",{envMap:{value:null},roughness:{value:0},lodBias:{value:0}},`

		#define GGX_SAMPLES ${rh}u

		varying vec3 vWorldDirection;

		uniform samplerCube envMap;
		uniform float roughness;
		uniform float lodBias;

		#include <common>

		// Van der Corput radical inverse
		float radicalInverse_VdC( uint bits ) {

			bits = ( bits << 16u ) | ( bits >> 16u );
			bits = ( ( bits & 0x55555555u ) << 1u ) | ( ( bits & 0xAAAAAAAAu ) >> 1u );
			bits = ( ( bits & 0x33333333u ) << 2u ) | ( ( bits & 0xCCCCCCCCu ) >> 2u );
			bits = ( ( bits & 0x0F0F0F0Fu ) << 4u ) | ( ( bits & 0xF0F0F0F0u ) >> 4u );
			bits = ( ( bits & 0x00FF00FFu ) << 8u ) | ( ( bits & 0xFF00FF00u ) >> 8u );
			return float( bits ) * 2.3283064365386963e-10; // / 0x100000000

		}

		// Hammersley sequence
		vec2 hammersley( uint i, uint N ) {

			return vec2( float( i ) / float( N ), radicalInverse_VdC( i ) );

		}

		void main() {

			vec3 N = normalize( vWorldDirection );

			// For very low roughness, just sample the environment directly
			if ( roughness < 0.001 ) {

				gl_FragColor = vec4( textureLod( envMap, N, 0.0 ).rgb, 1.0 );
				return;

			}

			float alpha = roughness * roughness;
			float alpha2 = alpha * alpha;

			// Tangent space basis for VNDF sampling
			vec3 up = abs( N.z ) < 0.999 ? vec3( 0.0, 0.0, 1.0 ) : vec3( 1.0, 0.0, 0.0 );
			vec3 tangent = normalize( cross( up, N ) );
			vec3 bitangent = cross( N, tangent );

			vec3 prefilteredColor = vec3( 0.0 );
			float totalWeight = 0.0;

			for ( uint i = 0u; i < GGX_SAMPLES; i ++ ) {

				vec2 Xi = hammersley( i, GGX_SAMPLES );

				// With V = N, sample the reflected direction directly.
				float invQ = 1.0 / ( 1.0 - Xi.x + alpha2 * Xi.x );
				float NdotL = ( 1.0 - Xi.x - alpha2 * Xi.x ) * invQ;

				if ( NdotL > 0.0 ) {

					float phi = 2.0 * PI * Xi.y;
					float sinTheta = 2.0 * alpha * sqrt( Xi.x * ( 1.0 - Xi.x ) ) * invQ;
					vec3 L = N * NdotL + ( tangent * cos( phi ) + bitangent * sin( phi ) ) * sinTheta;

					// Match the source mip to the sample's solid angle. The terms
					// independent of the sample are precomputed in lodBias.
					float d = alpha2 * invQ;
					float lod = max( log2( d ) + lodBias, 0.0 );

					// Weight by NdotL for the split-sum approximation
					prefilteredColor += textureLod( envMap, L, lod ).rgb * NdotL;
					totalWeight += NdotL;

				}

			}

			gl_FragColor = vec4( prefilteredColor / totalWeight, 1.0 );

		}
	`)}function K0(){return xs("PMREMGGXIntegration",{envMap:{value:null},roughness:{value:0},sourceLod:{value:0},sourceSize:{value:ah}},`

		varying vec3 vWorldDirection;

		uniform samplerCube envMap;
		uniform float roughness;
		uniform float sourceLod;
		uniform int sourceSize;

		void main() {

			vec3 N = normalize( vWorldDirection );

			float alpha = roughness * roughness;
			float alpha2 = alpha * alpha;

			float texelSize = 2.0 / float( sourceSize );

			vec3 prefilteredColor = vec3( 0.0 );
			float totalWeight = 0.0;

			// Pair opposite texels: only the one in N's hemisphere contributes.
			for ( int face = 0; face < 3; face ++ ) {

				for ( int y = 0; y < sourceSize; y ++ ) {

					for ( int x = 0; x < sourceSize; x ++ ) {

						vec2 uv = ( vec2( x, y ) + 0.5 ) * texelSize - 1.0;
						vec3 texelDirection = face == 0 ? vec3( 1.0, uv ) : ( face == 1 ? vec3( uv.x, 1.0, uv.y ) : vec3( uv, 1.0 ) );

						float invDistance = inversesqrt( 1.0 + dot( uv, uv ) );
						float NdotL = dot( N, texelDirection );
						texelDirection *= NdotL < 0.0 ? - 1.0 : 1.0;
						NdotL = abs( NdotL ) * invDistance;

						// With V = N, NdotH squared is ( 1 + NdotL ) / 2. Common factors
						// in the GGX distribution and texel solid angle cancel when normalized.
						float d = 1.0 + alpha2 + ( alpha2 - 1.0 ) * NdotL;
						float weight = NdotL * invDistance * invDistance * invDistance / ( d * d );

						prefilteredColor += textureLod( envMap, texelDirection, sourceLod ).rgb * weight;
						totalWeight += weight;

					}

				}

			}

			gl_FragColor = vec4( prefilteredColor / totalWeight, 1.0 );

		}
	`)}function Z0(){return xs("PMREMSphericalGaussianBlur",{envMap:{value:null},sigma:{value:0}},`

		#define SAMPLES ${W0}
		#define GOLDEN_ANGLE 2.39996322973

		varying vec3 vWorldDirection;

		uniform samplerCube envMap;
		uniform float sigma;

		#include <common>

		void main() {

			vec3 outputDirection = normalize( vWorldDirection );

			vec3 up = abs( outputDirection.z ) < 0.999 ? vec3( 0.0, 0.0, 1.0 ) : vec3( 1.0, 0.0, 0.0 );
			vec3 tangent = normalize( cross( up, outputDirection ) );
			vec3 bitangent = cross( outputDirection, tangent );

			// Truncate the kernel at three standard deviations or at the antipode.
			float thetaMax = min( 3.0 * sigma, PI );
			float truncation = 1.0 - exp( - 0.5 * thetaMax * thetaMax / ( sigma * sigma ) );

			vec3 accumColor = vec3( 0.0 );
			float accumWeight = 0.0;

			for ( int i = 0; i < SAMPLES; i ++ ) {

				// Stratified inverse-CDF sampling of the Gaussian, placed on a golden-angle spiral.
				float stratum = ( float( i ) + 0.5 ) / float( SAMPLES );
				float theta = sigma * sqrt( - 2.0 * log( 1.0 - stratum * truncation ) );
				float phi = float( i ) * GOLDEN_ANGLE;

				vec3 offset = cos( phi ) * tangent + sin( phi ) * bitangent;
				vec3 sampleDirection = cos( theta ) * outputDirection + sin( theta ) * offset;

				// Correct the planar sample density to solid angle.
				float weight = sin( theta ) / theta;

				accumColor += weight * textureLod( envMap, sampleDirection, 0.0 ).rgb;
				accumWeight += weight;

			}

			gl_FragColor = vec4( accumColor / accumWeight, 1.0 );

		}
	`)}function Cl(){return xs("PMREMEquirectangularToCubemap",{envMap:{value:null}},`

		varying vec3 vWorldDirection;

		uniform sampler2D envMap;

		#include <common>

		void main() {

			// Average four subpixel samples to preserve small, bright features.
			vec3 direction = normalize( vWorldDirection );
			vec3 dx = dFdx( direction ) * 0.25;
			vec3 dy = dFdy( direction ) * 0.25;

			vec3 color = textureLod( envMap, equirectUv( normalize( direction - dx - dy ) ), 0.0 ).rgb;
			color += textureLod( envMap, equirectUv( normalize( direction + dx - dy ) ), 0.0 ).rgb;
			color += textureLod( envMap, equirectUv( normalize( direction - dx + dy ) ), 0.0 ).rgb;
			color += textureLod( envMap, equirectUv( normalize( direction + dx + dy ) ), 0.0 ).rgb;
			gl_FragColor = vec4( color * 0.25, 1.0 );

		}
	`)}function Pl(){return xs("PMREMCubemapToCubemap",{envMap:{value:null},flipEnvMap:{value:-1}},`

		varying vec3 vWorldDirection;

		uniform samplerCube envMap;
		uniform float flipEnvMap;

		void main() {

			gl_FragColor = vec4( textureCube( envMap, vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) ).rgb, 1.0 );

		}
	`)}function J0(i){let e=new WeakMap,t=new WeakMap,n=null;function s(d,h=!1){return d==null?null:h?a(d):r(d)}function r(d){if(d&&d.isTexture){const h=d.mapping;if(h===Er||h===br)if(e.has(d)){const p=e.get(d).texture;return o(p,d.mapping)}else{const p=d.image;if(p&&p.height>0){const v=new Mo(p.height);return v.fromEquirectangularTexture(i,d),e.set(d,v),d.addEventListener("dispose",c),o(v.texture,d.mapping)}else return null}}return d}function a(d){if(d&&d.isTexture&&d.isPMREMTexture!==!0){const h=d.mapping,p=h===Er||h===br,v=h===Ui||h===ls;if(p||v){let m=t.get(d);const g=m!==void 0?m.texture.pmremVersion:0;if(d.isRenderTargetTexture&&d.pmremVersion!==g)return n===null&&(n=new dr(i)),m=p?n.fromEquirectangular(d,m):n.fromCubemap(d,m),m.texture.pmremVersion=d.pmremVersion,t.set(d,m),m.texture;if(m!==void 0)return m.texture;{const x=d.image;return p&&x&&x.height>0||v&&x&&l(x)?(n===null&&(n=new dr(i)),m=p?n.fromEquirectangular(d):n.fromCubemap(d),m.texture.pmremVersion=d.pmremVersion,t.set(d,m),d.addEventListener("dispose",u),m.texture):null}}}return d}function o(d,h){return h===Er?d.mapping=Ui:h===br&&(d.mapping=ls),d}function l(d){let h=0;const p=6;for(let v=0;v<p;v++)d[v]!==void 0&&h++;return h===p}function c(d){const h=d.target;h.removeEventListener("dispose",c);const p=e.get(h);p!==void 0&&(e.delete(h),p.dispose())}function u(d){const h=d.target;h.removeEventListener("dispose",u);const p=t.get(h);p!==void 0&&(t.delete(h),p.dispose())}function f(){e=new WeakMap,t=new WeakMap,n!==null&&(n.dispose(),n=null)}return{get:s,dispose:f}}function Q0(i){const e={};function t(n){if(e[n]!==void 0)return e[n];const s=i.getExtension(n);return e[n]=s,s}return{has:function(n){return t(n)!==null},init:function(){t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance"),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture"),t("WEBGL_render_shared_exponent")},get:function(n){const s=t(n);return s===null&&nr("WebGLRenderer: "+n+" extension not supported."),s}}}function j0(i,e,t,n){const s={},r=new WeakMap,a=new FinalizationRegistry(p=>delete s[p]);function o(p){l(p.target)}function l(p){p.index!==null&&e.remove(p.index);for(const m in p.attributes)e.remove(p.attributes[m]);p.removeEventListener("dispose",o),delete s[p.id],a.unregister(p);const v=r.get(p);v&&(e.remove(v),r.delete(p)),n.releaseStatesOfGeometry(p),p.isInstancedBufferGeometry===!0&&delete p._maxInstanceCount,t.memory.geometries--}function c(p,v){return s[v.id]!==void 0||(v.addEventListener("dispose",o),s[v.id]=new WeakRef(v),a.register(v,v.id,v),t.memory.geometries++),v}function u(p){const v=p.attributes;for(const m in v)e.update(v[m],i.ARRAY_BUFFER)}function f(p){const v=p.index,m=p.attributes.position;let g=0;if(m===void 0)return;const x=v!==null?v.array.length:m.array.length/3-1,M=m.count>=65535?Gc:zc,S=new M(Math.ceil(x/3)*6,1),w=S.array;if(v!==null){const _=v.array;g=v.version;for(let b=0,P=0;b<x;b+=3){const R=_[b+0],C=_[b+1],F=_[b+2];w[P++]=R,w[P++]=C,w[P++]=C,w[P++]=F,w[P++]=F,w[P++]=R}}else{g=m.version;for(let _=0,b=0;_<x;_+=3){const P=_+0,R=_+1,C=_+2;w[b++]=P,w[b++]=R,w[b++]=R,w[b++]=C,w[b++]=C,w[b++]=P}}S.version=g;const T=r.get(p);T&&e.remove(T),r.set(p,S)}function d(p){const v=r.get(p);if(v){const m=p.index;m!==null&&v.version<m.version&&f(p)}else f(p);return r.get(p)}function h(){for(const p in s){const v=s[p].deref();v!==void 0&&l(v)}}return{get:c,update:u,getWireframeAttribute:d,dispose:h}}function em(i,e,t){let n;function s(f){n=f}let r,a;function o(f){r=f.type,a=f.bytesPerElement}function l(f,d){i.drawElements(n,d,r,f*a),t.update(d,n,1)}function c(f,d,h){h!==0&&(i.drawElementsInstanced(n,d,r,f*a,h),t.update(d,n,h))}function u(f,d,h){if(h===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(n,d,0,r,f,0,h);let v=0;for(let m=0;m<h;m++)v+=d[m];t.update(v,n,1)}this.setMode=s,this.setIndex=o,this.render=l,this.renderInstances=c,this.renderMultiDraw=u}function tm(i){const e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function n(r,a,o){switch(t.calls++,a){case i.TRIANGLES:t.triangles+=o*(r/3);break;case i.LINES:t.lines+=o*(r/2);break;case i.LINE_STRIP:t.lines+=o*(r-1);break;case i.LINE_LOOP:t.lines+=o*r;break;case i.POINTS:t.points+=o*r;break;default:lt("WebGLInfo: Unknown draw mode:",a);break}}function s(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:s,update:n}}function nm(i,e,t){const n=new WeakMap,s=new bt;function r(a,o,l){const c=a.morphTargetInfluences,u=o.morphAttributes.position||o.morphAttributes.normal||o.morphAttributes.color,f=u!==void 0?u.length:0;let d=n.get(o);if(d===void 0||d.count!==f){let P=function(){_.dispose(),n.delete(o),o.removeEventListener("dispose",P)};d!==void 0&&d.texture.dispose();const h=o.morphAttributes.position!==void 0,p=o.morphAttributes.normal!==void 0,v=o.morphAttributes.color!==void 0,m=o.morphAttributes.position||[],g=o.morphAttributes.normal||[],x=o.morphAttributes.color||[];let M=0;h===!0&&(M=1),p===!0&&(M=2),v===!0&&(M=3);let S=o.attributes.position.count*M,w=1;S>e.maxTextureSize&&(w=Math.ceil(S/e.maxTextureSize),S=e.maxTextureSize);const T=new Float32Array(S*w*4*f),_=new Oc(T,S,w,f);_.type=yn,_.needsUpdate=!0;const b=M*4;for(let R=0;R<f;R++){const C=m[R],F=g[R],V=x[R],D=S*w*4*R;for(let z=0;z<C.count;z++){const X=z*b;h===!0&&(s.fromBufferAttribute(C,z),T[D+X+0]=s.x,T[D+X+1]=s.y,T[D+X+2]=s.z,T[D+X+3]=0),p===!0&&(s.fromBufferAttribute(F,z),T[D+X+4]=s.x,T[D+X+5]=s.y,T[D+X+6]=s.z,T[D+X+7]=0),v===!0&&(s.fromBufferAttribute(V,z),T[D+X+8]=s.x,T[D+X+9]=s.y,T[D+X+10]=s.z,T[D+X+11]=V.itemSize===4?s.w:1)}}d={count:f,texture:_,size:new Se(S,w)},n.set(o,d),o.addEventListener("dispose",P)}if(a.isInstancedMesh===!0&&a.morphTexture!==null)l.getUniforms().setValue(i,"morphTexture",a.morphTexture,t);else{let h=0;for(let v=0;v<c.length;v++)h+=c[v];const p=o.morphTargetsRelative?1:1-h;l.getUniforms().setValue(i,"morphTargetBaseInfluence",p),l.getUniforms().setValue(i,"morphTargetInfluences",c)}l.getUniforms().setValue(i,"morphTargetsTexture",d.texture,t),l.getUniforms().setValue(i,"morphTargetsTextureSize",d.size)}return{update:r}}function im(i,e,t,n,s){let r=new WeakMap;function a(c){const u=s.render.frame,f=c.geometry,d=e.get(c,f);if(r.get(d)!==u&&(e.update(d),r.set(d,u)),c.isInstancedMesh&&(c.hasEventListener("dispose",l)===!1&&c.addEventListener("dispose",l),r.get(c)!==u&&(t.update(c.instanceMatrix,i.ARRAY_BUFFER),c.instanceColor!==null&&t.update(c.instanceColor,i.ARRAY_BUFFER),r.set(c,u))),c.isSkinnedMesh){const h=c.skeleton;r.get(h)!==u&&(h.update(),r.set(h,u))}return d}function o(){r=new WeakMap}function l(c){const u=c.target;u.removeEventListener("dispose",l),n.releaseStatesOfObject(u),t.remove(u.instanceMatrix),u.instanceColor!==null&&t.remove(u.instanceColor)}return{update:a,dispose:o}}const sm={[mc]:"LINEAR_TONE_MAPPING",[gc]:"REINHARD_TONE_MAPPING",[_c]:"CINEON_TONE_MAPPING",[to]:"ACES_FILMIC_TONE_MAPPING",[xc]:"AGX_TONE_MAPPING",[Mc]:"NEUTRAL_TONE_MAPPING",[vc]:"CUSTOM_TONE_MAPPING"};function rm(i,e,t,n,s,r){const a=new bn(e,t,{type:i,depthBuffer:s,stencilBuffer:r,samples:n?4:0,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,resolveDepthBuffer:!1,resolveStencilBuffer:!1});let o=null,l=null,c=null;const u=new Xt;u.setAttribute("position",new Tt([-1,3,0,-1,-1,0,3,-1,0],3)),u.setAttribute("uv",new Tt([0,2,0,0,2,0],2));const f=new Yd({uniforms:{tDiffuse:{value:null}},vertexShader:`
			precision highp float;

			uniform mat4 modelViewMatrix;
			uniform mat4 projectionMatrix;

			attribute vec3 position;
			attribute vec2 uv;

			varying vec2 vUv;

			void main() {
				vUv = uv;
				gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
			}`,fragmentShader:`
			precision highp float;

			uniform sampler2D tDiffuse;

			varying vec2 vUv;

			#include <tonemapping_pars_fragment>
			#include <colorspace_pars_fragment>

			void main() {
				gl_FragColor = texture2D( tDiffuse, vUv );

				#ifdef LINEAR_TONE_MAPPING
					gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );
				#elif defined( REINHARD_TONE_MAPPING )
					gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );
				#elif defined( CINEON_TONE_MAPPING )
					gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );
				#elif defined( ACES_FILMIC_TONE_MAPPING )
					gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );
				#elif defined( AGX_TONE_MAPPING )
					gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );
				#elif defined( NEUTRAL_TONE_MAPPING )
					gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );
				#elif defined( CUSTOM_TONE_MAPPING )
					gl_FragColor.rgb = CustomToneMapping( gl_FragColor.rgb );
				#endif

				#ifdef SRGB_TRANSFER
					gl_FragColor = sRGBTransferOETF( gl_FragColor );
				#endif
			}`,depthTest:!1,depthWrite:!1}),d=new kt(u,f),h=new nh(-1,1,1,-1,0,1);let p=null,v=null,m=!1,g,x=null,M=[],S=!1;this.setSize=function(w,T){a.setSize(w,T),o!==null&&o.setSize(w,T),l!==null&&l.setSize(w,T);for(let _=0;_<M.length;_++){const b=M[_];b.setSize&&b.setSize(w,T)}},this.setEffects=function(w){M=w,S=M.length>0&&M[0].isRenderPass===!0;const T=a.width,_=a.height;M.length>0&&o===null&&(o=new bn(T,_,{type:Tn,depthBuffer:!1,stencilBuffer:!1}),l=new bn(T,_,{type:Tn,depthBuffer:!1,stencilBuffer:!1}));const b=s===!0&&M.some(P=>P.needsDepthTexture===!0);b!==(a.depthTexture!==null)&&(b===!0&&c===null&&(c=new Oi(T,_),r===!0&&(c.format=Jn,c.type=Fi)),a.dispose(),a.depthTexture=b?c:null,a.resolveDepthBuffer=b,a.storeMultisampledDepthBuffer=b);for(let P=0;P<M.length;P++){const R=M[P];R.setSize&&R.setSize(T,_),b&&R.needsDepthTexture===!0&&R.setDepthTexture&&R.setDepthTexture(c)}},this.begin=function(w,T){if(m||w.toneMapping===On&&M.length===0)return!1;if(x=T,T!==null){const _=T.width,b=T.height;(a.width!==_||a.height!==b)&&this.setSize(_,b)}return S===!1&&w.setRenderTarget(a),g=w.toneMapping,w.toneMapping=On,!0},this.hasRenderPass=function(){return S},this.end=function(w,T){w.toneMapping=g,m=!0;let _=a,b=o;for(let P=0;P<M.length;P++){const R=M[P];R.enabled!==!1&&(R.render(w,b,_,T),R.needsSwap!==!1&&(_=b,b=b===o?l:o))}if(p!==w.outputColorSpace||v!==w.toneMapping){p=w.outputColorSpace,v=w.toneMapping,f.defines={},rt.getTransfer(p)===dt&&(f.defines.SRGB_TRANSFER="");const P=sm[v];P&&(f.defines[P]=""),f.needsUpdate=!0}f.uniforms.tDiffuse.value=_.texture,w.setRenderTarget(x),w.render(d,h),x=null,m=!1},this.isCompositing=function(){return m},this.dispose=function(){a.dispose(),o!==null&&o.dispose(),l!==null&&l.dispose(),u.dispose(),f.dispose()}}const oh=new $t,lh=new Oi(1,1),ch=new Vc(1),hh=new Oc,uh=new Wu,dh=new Hc,Ll=[],Dl=[],Il=new Float32Array(16),Nl=new Float32Array(9),Ul=new Float32Array(4);function Hi(i,e,t){const n=i[0];if(n<=0||n>0)return i;const s=e*t;let r=Ll[s];if(r===void 0&&(r=new Float32Array(s),Ll[s]=r),e!==0){n.toArray(r,0);for(let a=1,o=0;a!==e;++a)o+=t,i[a].toArray(r,o)}return r}function Pt(i,e){if(i.length!==e.length)return!1;for(let t=0,n=i.length;t<n;t++)if(i[t]!==e[t])return!1;return!0}function Lt(i,e){for(let t=0,n=e.length;t<n;t++)i[t]=e[t]}function _r(i,e){let t=Dl[e];t===void 0&&(t=new Int32Array(e),Dl[e]=t);for(let n=0;n!==e;++n)t[n]=i.allocateTextureUnit();return t}function am(i,e){const t=this.cache;t[0]!==e&&(i.uniform1f(this.addr,e),t[0]=e)}function om(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Pt(t,e))return;i.uniform2fv(this.addr,e),Lt(t,e)}}function lm(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(i.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(Pt(t,e))return;i.uniform3fv(this.addr,e),Lt(t,e)}}function cm(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Pt(t,e))return;i.uniform4fv(this.addr,e),Lt(t,e)}}function hm(i,e){const t=this.cache,n=e.elements;if(n===void 0){if(Pt(t,e))return;i.uniformMatrix2fv(this.addr,!1,e),Lt(t,e)}else{if(Pt(t,n))return;Ul.set(n),i.uniformMatrix2fv(this.addr,!1,Ul),Lt(t,n)}}function um(i,e){const t=this.cache,n=e.elements;if(n===void 0){if(Pt(t,e))return;i.uniformMatrix3fv(this.addr,!1,e),Lt(t,e)}else{if(Pt(t,n))return;Nl.set(n),i.uniformMatrix3fv(this.addr,!1,Nl),Lt(t,n)}}function dm(i,e){const t=this.cache,n=e.elements;if(n===void 0){if(Pt(t,e))return;i.uniformMatrix4fv(this.addr,!1,e),Lt(t,e)}else{if(Pt(t,n))return;Il.set(n),i.uniformMatrix4fv(this.addr,!1,Il),Lt(t,n)}}function fm(i,e){const t=this.cache;t[0]!==e&&(i.uniform1i(this.addr,e),t[0]=e)}function pm(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Pt(t,e))return;i.uniform2iv(this.addr,e),Lt(t,e)}}function mm(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Pt(t,e))return;i.uniform3iv(this.addr,e),Lt(t,e)}}function gm(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Pt(t,e))return;i.uniform4iv(this.addr,e),Lt(t,e)}}function _m(i,e){const t=this.cache;t[0]!==e&&(i.uniform1ui(this.addr,e),t[0]=e)}function vm(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Pt(t,e))return;i.uniform2uiv(this.addr,e),Lt(t,e)}}function xm(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Pt(t,e))return;i.uniform3uiv(this.addr,e),Lt(t,e)}}function Mm(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Pt(t,e))return;i.uniform4uiv(this.addr,e),Lt(t,e)}}function vr(i){return i.version===0&&(i.compareFunction=Lc,i.needsUpdate=!0),i}function Sm(i,e,t){const n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s);let r;this.type===i.SAMPLER_2D_SHADOW?r=vr(lh):r=oh,t.setTexture2D(e||r,s)}function ym(i,e,t){const n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTexture3D(e||uh,s)}function Em(i,e,t){const n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s);let r;this.type===i.SAMPLER_CUBE_SHADOW?r=vr(ch):r=dh,t.setTextureCube(e||r,s)}function bm(i,e,t){const n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTexture2DArray(e||hh,s)}function wm(i){switch(i){case 5126:return am;case 35664:return om;case 35665:return lm;case 35666:return cm;case 35674:return hm;case 35675:return um;case 35676:return dm;case 5124:case 35670:return fm;case 35667:case 35671:return pm;case 35668:case 35672:return mm;case 35669:case 35673:return gm;case 5125:return _m;case 36294:return vm;case 36295:return xm;case 36296:return Mm;case 35678:case 36198:case 36298:case 36306:case 35682:return Sm;case 35679:case 36299:case 36307:return ym;case 35680:case 36300:case 36308:case 36293:return Em;case 36289:case 36303:case 36311:case 36292:return bm}}function Tm(i,e){i.uniform1fv(this.addr,e)}function Am(i,e){const t=Hi(e,this.size,2);i.uniform2fv(this.addr,t)}function Rm(i,e){const t=Hi(e,this.size,3);i.uniform3fv(this.addr,t)}function Cm(i,e){const t=Hi(e,this.size,4);i.uniform4fv(this.addr,t)}function Pm(i,e){const t=Hi(e,this.size,4);i.uniformMatrix2fv(this.addr,!1,t)}function Lm(i,e){const t=Hi(e,this.size,9);i.uniformMatrix3fv(this.addr,!1,t)}function Dm(i,e){const t=Hi(e,this.size,16);i.uniformMatrix4fv(this.addr,!1,t)}function Im(i,e){i.uniform1iv(this.addr,e)}function Nm(i,e){i.uniform2iv(this.addr,e)}function Um(i,e){i.uniform3iv(this.addr,e)}function Fm(i,e){i.uniform4iv(this.addr,e)}function Om(i,e){i.uniform1uiv(this.addr,e)}function Bm(i,e){i.uniform2uiv(this.addr,e)}function km(i,e){i.uniform3uiv(this.addr,e)}function zm(i,e){i.uniform4uiv(this.addr,e)}function Gm(i,e,t){const n=this.cache,s=e.length,r=_r(t,s);Pt(n,r)||(i.uniform1iv(this.addr,r),Lt(n,r));let a;this.type===i.SAMPLER_2D_SHADOW?a=vr(lh):a=oh;for(let o=0;o!==s;++o)t.setTexture2D(e[o]||a,r[o])}function Hm(i,e,t){const n=this.cache,s=e.length,r=_r(t,s);Pt(n,r)||(i.uniform1iv(this.addr,r),Lt(n,r));for(let a=0;a!==s;++a)t.setTexture3D(e[a]||uh,r[a])}function Vm(i,e,t){const n=this.cache,s=e.length,r=_r(t,s);Pt(n,r)||(i.uniform1iv(this.addr,r),Lt(n,r));let a;this.type===i.SAMPLER_CUBE_SHADOW?a=vr(ch):a=dh;for(let o=0;o!==s;++o)t.setTextureCube(e[o]||a,r[o])}function Wm(i,e,t){const n=this.cache,s=e.length,r=_r(t,s);Pt(n,r)||(i.uniform1iv(this.addr,r),Lt(n,r));for(let a=0;a!==s;++a)t.setTexture2DArray(e[a]||hh,r[a])}function Xm(i){switch(i){case 5126:return Tm;case 35664:return Am;case 35665:return Rm;case 35666:return Cm;case 35674:return Pm;case 35675:return Lm;case 35676:return Dm;case 5124:case 35670:return Im;case 35667:case 35671:return Nm;case 35668:case 35672:return Um;case 35669:case 35673:return Fm;case 5125:return Om;case 36294:return Bm;case 36295:return km;case 36296:return zm;case 35678:case 36198:case 36298:case 36306:case 35682:return Gm;case 35679:case 36299:case 36307:return Hm;case 35680:case 36300:case 36308:case 36293:return Vm;case 36289:case 36303:case 36311:case 36292:return Wm}}class qm{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.setValue=wm(t.type)}}class Ym{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=Xm(t.type)}}class $m{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,n){const s=this.seq;for(let r=0,a=s.length;r!==a;++r){const o=s[r];o.setValue(e,t[o.id],n)}}}const Jr=/(\w+)(\])?(\[|\.)?/g;function Fl(i,e){i.seq.push(e),i.map[e.id]=e}function Km(i,e,t){const n=i.name,s=n.length;for(Jr.lastIndex=0;;){const r=Jr.exec(n),a=Jr.lastIndex;let o=r[1];const l=r[2]==="]",c=r[3];if(l&&(o=o|0),c===void 0||c==="["&&a+2===s){Fl(t,c===void 0?new qm(o,i,e):new Ym(o,i,e));break}else{let f=t.map[o];f===void 0&&(f=new $m(o),Fl(t,f)),t=f}}}class ir{constructor(e,t){this.seq=[],this.map={};const n=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let a=0;a<n;++a){const o=e.getActiveUniform(t,a),l=e.getUniformLocation(t,o.name);Km(o,l,this)}const s=[],r=[];for(const a of this.seq)a.type===e.SAMPLER_2D_SHADOW||a.type===e.SAMPLER_CUBE_SHADOW||a.type===e.SAMPLER_2D_ARRAY_SHADOW?s.push(a):r.push(a);s.length>0&&(this.seq=s.concat(r))}setValue(e,t,n,s){const r=this.map[t];r!==void 0&&r.setValue(e,n,s)}setOptional(e,t,n){const s=t[n];s!==void 0&&this.setValue(e,n,s)}static upload(e,t,n,s){for(let r=0,a=t.length;r!==a;++r){const o=t[r],l=n[o.id];l.needsUpdate!==!1&&o.setValue(e,l.value,s)}}static seqWithValue(e,t){const n=[];for(let s=0,r=e.length;s!==r;++s){const a=e[s];a.id in t&&n.push(a)}return n}}function Ol(i,e,t){const n=i.createShader(e);return i.shaderSource(n,t),i.compileShader(n),n}const Zm=37297;let Jm=0;function Qm(i,e){const t=i.split(`
`),n=[],s=Math.max(e-6,0),r=Math.min(e+6,t.length);for(let a=s;a<r;a++){const o=a+1;n.push(`${o===e?">":" "} ${o}: ${t[a]}`)}return n.join(`
`)}const Bl=new Xe;function jm(i){rt._getMatrix(Bl,rt.workingColorSpace,i);const e=`mat3( ${Bl.elements.map(t=>t.toFixed(4))} )`;switch(rt.getTransfer(i)){case lr:return[e,"LinearTransferOETF"];case dt:return[e,"sRGBTransferOETF"];default:return He("WebGLProgram: Unsupported color space: ",i),[e,"LinearTransferOETF"]}}function kl(i,e,t){const n=i.getShaderParameter(e,i.COMPILE_STATUS),r=(i.getShaderInfoLog(e)||"").trim();if(n&&r==="")return"";const a=/ERROR: 0:(\d+)/.exec(r);if(a){const o=parseInt(a[1]);return t.toUpperCase()+`

`+r+`

`+Qm(i.getShaderSource(e),o)}else return r}function eg(i,e){const t=jm(e);return[`vec4 ${i}( vec4 value ) {`,`	return ${t[1]}( vec4( ${t[0]} * value.rgb, value.a ) );`,"}"].join(`
`)}const tg={[mc]:"Linear",[gc]:"Reinhard",[_c]:"Cineon",[to]:"ACESFilmic",[xc]:"AgX",[Mc]:"Neutral",[vc]:"Custom"};function ng(i,e){const t=tg[e];return t===void 0?(He("WebGLProgram: Unsupported toneMapping:",e),"vec3 "+i+"( vec3 color ) { return LinearToneMapping( color ); }"):"vec3 "+i+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}const Ys=new O;function ig(){rt.getLuminanceCoefficients(Ys);const i=Ys.x.toFixed(4),e=Ys.y.toFixed(4),t=Ys.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${i}, ${e}, ${t} );`,"	return dot( weights, rgb );","}"].join(`
`)}function sg(i){return[i.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",i.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(ji).join(`
`)}function rg(i){const e=[];for(const t in i){const n=i[t];n!==!1&&e.push("#define "+t+" "+n)}return e.join(`
`)}function ag(i,e){const t={},n=i.getProgramParameter(e,i.ACTIVE_ATTRIBUTES);for(let s=0;s<n;s++){const r=i.getActiveAttrib(e,s),a=r.name;let o=1;r.type===i.FLOAT_MAT2&&(o=2),r.type===i.FLOAT_MAT3&&(o=3),r.type===i.FLOAT_MAT4&&(o=4),t[a]={type:r.type,location:i.getAttribLocation(e,a),locationSize:o}}return t}function ji(i){return i!==""}function zl(i,e){const t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return i.replace(/NUM_SUN_LIGHTS/g,e.numSunLights).replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_SUN_LIGHT_SHADOWS/g,e.numSunLightShadows).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows).replace(/NUM_LIGHT_PROBE_GRIDS/g,e.numLightProbeGrids)}function Gl(i,e){return i.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}const og=/^[ \t]*#include +<([\w\d./]+)>/gm;function Qa(i){return i.replace(og,lg)}function lg(i,e){const t=je[e];if(t===void 0)throw new Error("THREE.WebGLProgram: Can not resolve #include <"+e+">");return Qa(t)}const cg=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function Hl(i){return i.replace(cg,hg)}function hg(i,e,t,n){let s="";for(let r=parseInt(e);r<parseInt(t);r++)s+=n.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return s}function Vl(i){let e=`precision ${i.precision} float;
	precision ${i.precision} int;
	precision ${i.precision} sampler2D;
	precision ${i.precision} samplerCube;
	precision ${i.precision} sampler3D;
	precision ${i.precision} sampler2DArray;
	precision ${i.precision} sampler2DShadow;
	precision ${i.precision} samplerCubeShadow;
	precision ${i.precision} sampler2DArrayShadow;
	precision ${i.precision} isampler2D;
	precision ${i.precision} isampler3D;
	precision ${i.precision} isamplerCube;
	precision ${i.precision} isampler2DArray;
	precision ${i.precision} usampler2D;
	precision ${i.precision} usampler3D;
	precision ${i.precision} usamplerCube;
	precision ${i.precision} usampler2DArray;
	`;return i.precision==="highp"?e+=`
#define HIGH_PRECISION`:i.precision==="mediump"?e+=`
#define MEDIUM_PRECISION`:i.precision==="lowp"&&(e+=`
#define LOW_PRECISION`),e}const ug={[Js]:"SHADOWMAP_TYPE_PCF",[Ji]:"SHADOWMAP_TYPE_VSM"};function dg(i){return ug[i.shadowMapType]||"SHADOWMAP_TYPE_BASIC"}const fg={[ls]:"ENVMAP_MODE_REFRACTION"};function pg(i){return i.envMap===!1?"ENVMAP_MODE_REFLECTION":fg[i.envMapMode]||"ENVMAP_MODE_REFLECTION"}const mg={[pc]:"ENVMAP_BLENDING_MULTIPLY",[lu]:"ENVMAP_BLENDING_MIX",[cu]:"ENVMAP_BLENDING_ADD"};function gg(i){return i.envMap===!1?"ENVMAP_BLENDING_NONE":mg[i.combine]||"ENVMAP_BLENDING_NONE"}function _g(i,e,t,n){const s=i.getContext(),r=t.defines;let a=t.vertexShader,o=t.fragmentShader;const l=dg(t),c=t.envMapPMREM===!0?"ENVMAP_TYPE_PMREM":"ENVMAP_TYPE_CUBE",u=pg(t),f=gg(t),d=sg(t),h=rg(r),p=s.createProgram();let v,m,g=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(v=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,h].filter(ji).join(`
`),v.length>0&&(v+=`
`),m=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,h].filter(ji).join(`
`),m.length>0&&(m+=`
`)):(v=[Vl(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,h,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.batchingColor?"#define USE_BATCHING_COLOR":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.instancingMorph?"#define USE_INSTANCING_MORPH":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+u:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.diffuseRoughnessMap?"#define USE_DIFFUSE_ROUGHNESSMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.diffuseRoughnessMapUv?"#define DIFFUSE_ROUGHNESSMAP_UV "+t.diffuseRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexNormals?"#define HAS_NORMAL":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(ji).join(`
`),m=[Vl(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,h,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+c:"",t.envMap?"#define "+u:"",t.envMap?"#define "+f:"",t.envMapPMREM?"#define ENVMAP_MAX_LOD "+t.envMapMaxLod+".0":"",t.envMapPMREM?"#define ENVMAP_SIZE "+t.envMapSize+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.packedNormalMap?"#define USE_PACKED_NORMALMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.diffuseRoughness?"#define USE_DIFFUSE_ROUGHNESS":"",t.diffuseRoughnessMap?"#define USE_DIFFUSE_ROUGHNESSMAP":"",t.dispersion?"#define USE_DISPERSION":"",t.retroreflection?"#define USE_RETROREFLECTION":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor?"#define USE_COLOR":"",t.vertexAlphas||t.batchingColor?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==On?"#define TONE_MAPPING":"",t.toneMapping!==On?je.tonemapping_pars_fragment:"",t.toneMapping!==On?ng("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",je.colorspace_pars_fragment,eg("linearToOutputTexel",t.outputColorSpace),ig(),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(ji).join(`
`)),a=Qa(a),a=zl(a,t),a=Gl(a,t),o=Qa(o),o=zl(o,t),o=Gl(o,t),a=Hl(a),o=Hl(o),t.isRawShaderMaterial!==!0&&(g=`#version 300 es
`,v=[d,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+v,m=["#define varying in",t.glslVersion===Zo?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===Zo?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+m);const x=g+v+a,M=g+m+o,S=Ol(s,s.VERTEX_SHADER,x),w=Ol(s,s.FRAGMENT_SHADER,M);s.attachShader(p,S),s.attachShader(p,w),t.index0AttributeName!==void 0?s.bindAttribLocation(p,0,t.index0AttributeName):t.hasPositionAttribute===!0&&s.bindAttribLocation(p,0,"position"),s.linkProgram(p);function T(R){if(i.debug.checkShaderErrors){const C=s.getProgramInfoLog(p)||"",F=s.getShaderInfoLog(S)||"",V=s.getShaderInfoLog(w)||"",D=C.trim(),z=F.trim(),X=V.trim();let k=!0,se=!0;if(s.getProgramParameter(p,s.LINK_STATUS)===!1)if(k=!1,typeof i.debug.onShaderError=="function")i.debug.onShaderError(s,p,S,w);else{const $=kl(s,S,"vertex"),ee=kl(s,w,"fragment");lt("WebGLProgram: Shader Error "+s.getError()+" - VALIDATE_STATUS "+s.getProgramParameter(p,s.VALIDATE_STATUS)+`

Material Name: `+R.name+`
Material Type: `+R.type+`

Program Info Log: `+D+`
`+$+`
`+ee)}else D!==""?He("WebGLProgram: Program Info Log:",D):(z===""||X==="")&&(se=!1);se&&(R.diagnostics={runnable:k,programLog:D,vertexShader:{log:z,prefix:v},fragmentShader:{log:X,prefix:m}})}s.deleteShader(S),s.deleteShader(w),_=new ir(s,p),b=ag(s,p)}let _;this.getUniforms=function(){return _===void 0&&T(this),_};let b;this.getAttributes=function(){return b===void 0&&T(this),b};let P=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return P===!1&&(P=s.getProgramParameter(p,Zm)),P},this.destroy=function(){n.releaseStatesOfProgram(this),s.deleteProgram(p),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=Jm++,this.cacheKey=e,this.usedTimes=1,this.program=p,this.vertexShader=S,this.fragmentShader=w,this}let vg=0;class xg{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e,t,n){const s=this._getShaderCacheForMaterial(e);return s.has(t)===!1&&(s.add(t),t.usedTimes++),s.has(n)===!1&&(s.add(n),n.usedTimes++),this}remove(e){const t=this.materialCache.get(e);for(const n of t)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(e),this}getVertexShaderStage(e){return this._getShaderStage(e.vertexShader)}getFragmentShaderStage(e){return this._getShaderStage(e.fragmentShader)}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){const t=this.materialCache;let n=t.get(e);return n===void 0&&(n=new Set,t.set(e,n)),n}_getShaderStage(e){const t=this.shaderCache;let n=t.get(e);return n===void 0&&(n=new Mg(e),t.set(e,n)),n}}class Mg{constructor(e){this.id=vg++,this.code=e,this.usedTimes=0}}function Sg(i){return i===ui||i===rr||i===ar}function yg(i,e,t,n,s,r){const a=new Bc,o=new xg,l=new Set,c=[],u=new Map,f=n.logarithmicDepthBuffer,d={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distance",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function h(_){return l.add(_),_===0?"uv":`uv${_}`}function p(_,b,P,R,C,F){const V=R.fog,D=C.geometry,z=_.isMeshStandardMaterial||_.isMeshLambertMaterial||_.isMeshPhongMaterial?R.environment:null,X=_.isMeshStandardMaterial||_.isMeshLambertMaterial&&!_.envMap||_.isMeshPhongMaterial&&!_.envMap,k=e.get(_.envMap||z,X),se=d[_.type];let $=n.precision;_.precision!==null&&($=n.getMaxPrecision(_.precision),$!==_.precision&&He("WebGLProgram.getParameters:",_.precision,"not supported, using",$,"instead."));const ee=D.morphAttributes.position||D.morphAttributes.normal||D.morphAttributes.color,ie=ee!==void 0?ee.length:0;let we=0;D.morphAttributes.position!==void 0&&(we=1),D.morphAttributes.normal!==void 0&&(we=2),D.morphAttributes.color!==void 0&&(we=3);let Fe,K,ge,Te;if(se){const ye=Mn[se];Fe=ye.vertexShader,K=ye.fragmentShader}else{Fe=_.vertexShader,K=_.fragmentShader;const ye=o.getVertexShaderStage(_),ut=o.getFragmentShaderStage(_);o.update(_,ye,ut),ge=ye.id,Te=ut.id}const Ue=i.getRenderTarget(),Me=i.state.buffers.depth.getReversed(),Oe=C.isInstancedMesh===!0,pt=C.isBatchedMesh===!0,ze=!!_.map,Ye=!!_.matcap,Ke=!!k,te=Ke&&k.isPMREMTexture===!0,he=!!_.aoMap,q=!!_.lightMap,ae=!!_.bumpMap&&_.wireframe===!1,re=!!_.normalMap,Be=!!_.displacementMap,Ae=!!_.emissiveMap,$e=!!_.metalnessMap,Je=!!_.roughnessMap,et=_.anisotropy>0,U=_.clearcoat>0,St=_.diffuseRoughness>0,tt=_.dispersion>0,mt=_.retroreflectivity>0,_e=_.iridescence>0,At=_.sheen>0,Ge=_.transmission>0,We=et&&!!_.anisotropyMap,A=U&&!!_.clearcoatMap,y=U&&!!_.clearcoatNormalMap,H=U&&!!_.clearcoatRoughnessMap,oe=St&&!!_.diffuseRoughnessMap,ne=_e&&!!_.iridescenceMap,ue=_e&&!!_.iridescenceThicknessMap,ve=At&&!!_.sheenColorMap,J=At&&!!_.sheenRoughnessMap,Q=!!_.specularMap,fe=!!_.specularColorMap,I=!!_.specularIntensityMap,j=Ge&&!!_.transmissionMap,Z=Ge&&!!_.thicknessMap,pe=!!_.gradientMap,ce=!!_.alphaMap,de=_.alphaTest>0,Ne=!!_.alphaHash,Qe=!!_.extensions;let le=On;_.toneMapped&&(Ue===null||Ue.isXRRenderTarget===!0)&&(le=i.toneMapping);const ke=te?k.isCompressedCubeTexture?k.image[0].mipmaps:k.mipmaps:null,Ze={shaderID:se,shaderType:_.type,shaderName:_.name,vertexShader:Fe,fragmentShader:K,defines:_.defines,customVertexShaderID:ge,customFragmentShaderID:Te,isRawShaderMaterial:_.isRawShaderMaterial===!0,glslVersion:_.glslVersion,precision:$,batching:pt,batchingColor:pt&&C._colorsTexture!==null,instancing:Oe,instancingColor:Oe&&C.instanceColor!==null,instancingMorph:Oe&&C.morphTexture!==null,outputColorSpace:Ue===null?i.outputColorSpace:Ue.isXRRenderTarget===!0?Ue.texture.colorSpace:rt.workingColorSpace,alphaToCoverage:!!_.alphaToCoverage,map:ze,matcap:Ye,envMap:Ke,envMapMode:Ke&&k.mapping,envMapPMREM:te,envMapMaxLod:te?ke.length-1:null,envMapSize:te?ke[0].width:null,aoMap:he,lightMap:q,bumpMap:ae,normalMap:re,displacementMap:Be,emissiveMap:Ae,normalMapObjectSpace:re&&_.normalMapType===du,normalMapTangentSpace:re&&_.normalMapType===Ya,packedNormalMap:re&&_.normalMapType===Ya&&Sg(_.normalMap.format),metalnessMap:$e,roughnessMap:Je,anisotropy:et,anisotropyMap:We,clearcoat:U,clearcoatMap:A,clearcoatNormalMap:y,clearcoatRoughnessMap:H,diffuseRoughness:St,diffuseRoughnessMap:oe,dispersion:tt,retroreflection:mt,iridescence:_e,iridescenceMap:ne,iridescenceThicknessMap:ue,sheen:At,sheenColorMap:ve,sheenRoughnessMap:J,specularMap:Q,specularColorMap:fe,specularIntensityMap:I,transmission:Ge,transmissionMap:j,thicknessMap:Z,gradientMap:pe,opaque:_.transparent===!1&&_.blending===ts&&_.alphaToCoverage===!1,alphaMap:ce,alphaTest:de,alphaHash:Ne,combine:_.combine,mapUv:ze&&h(_.map.channel),aoMapUv:he&&h(_.aoMap.channel),lightMapUv:q&&h(_.lightMap.channel),bumpMapUv:ae&&h(_.bumpMap.channel),normalMapUv:re&&h(_.normalMap.channel),displacementMapUv:Be&&h(_.displacementMap.channel),emissiveMapUv:Ae&&h(_.emissiveMap.channel),metalnessMapUv:$e&&h(_.metalnessMap.channel),roughnessMapUv:Je&&h(_.roughnessMap.channel),anisotropyMapUv:We&&h(_.anisotropyMap.channel),clearcoatMapUv:A&&h(_.clearcoatMap.channel),clearcoatNormalMapUv:y&&h(_.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:H&&h(_.clearcoatRoughnessMap.channel),diffuseRoughnessMapUv:oe&&h(_.diffuseRoughnessMap.channel),iridescenceMapUv:ne&&h(_.iridescenceMap.channel),iridescenceThicknessMapUv:ue&&h(_.iridescenceThicknessMap.channel),sheenColorMapUv:ve&&h(_.sheenColorMap.channel),sheenRoughnessMapUv:J&&h(_.sheenRoughnessMap.channel),specularMapUv:Q&&h(_.specularMap.channel),specularColorMapUv:fe&&h(_.specularColorMap.channel),specularIntensityMapUv:I&&h(_.specularIntensityMap.channel),transmissionMapUv:j&&h(_.transmissionMap.channel),thicknessMapUv:Z&&h(_.thicknessMap.channel),alphaMapUv:ce&&h(_.alphaMap.channel),vertexTangents:!!D.attributes.tangent&&(re||et),vertexNormals:!!D.attributes.normal,vertexColors:_.vertexColors,vertexAlphas:_.vertexColors===!0&&!!D.attributes.color&&D.attributes.color.itemSize===4,pointsUvs:C.isPoints===!0&&!!D.attributes.uv&&(ze||ce),fog:!!V,useFog:_.fog===!0,fogExp2:!!V&&V.isFogExp2,flatShading:_.wireframe===!1&&(_.flatShading===!0||D.attributes.normal===void 0&&re===!1&&(_.isMeshLambertMaterial||_.isMeshPhongMaterial||_.isMeshStandardMaterial||_.isMeshPhysicalMaterial)),sizeAttenuation:_.sizeAttenuation===!0,logarithmicDepthBuffer:f,reversedDepthBuffer:Me,skinning:C.isSkinnedMesh===!0,hasPositionAttribute:D.attributes.position!==void 0,morphTargets:D.morphAttributes.position!==void 0,morphNormals:D.morphAttributes.normal!==void 0,morphColors:D.morphAttributes.color!==void 0,morphTargetsCount:ie,morphTextureStride:we,numSunLights:b.sun.length,numDirLights:b.directional.length,numPointLights:b.point.length,numSpotLights:b.spot.length,numSpotLightMaps:b.spotLightMap.length,numRectAreaLights:b.rectArea.length,numHemiLights:b.hemi.length,numSunLightShadows:b.sunShadowMap.length,numDirLightShadows:b.directionalShadowMap.length,numPointLightShadows:b.pointShadowMap.length,numSpotLightShadows:b.spotShadowMap.length,numSpotLightShadowsWithMaps:b.numSpotLightShadowsWithMaps,numLightProbes:b.numLightProbes,numLightProbeGrids:F.filter(ye=>ye.texture!==null).length,numClippingPlanes:r.numPlanes,numClipIntersection:r.numIntersection,dithering:_.dithering,shadowMapEnabled:i.shadowMap.enabled&&P.length>0,shadowMapType:i.shadowMap.type,toneMapping:le,decodeVideoTexture:ze&&_.map.isVideoTexture===!0&&rt.getTransfer(_.map.colorSpace)===dt,decodeVideoTextureEmissive:Ae&&_.emissiveMap.isVideoTexture===!0&&rt.getTransfer(_.emissiveMap.colorSpace)===dt,premultipliedAlpha:_.premultipliedAlpha,doubleSided:_.side===Sn,flipSided:_.side===Jt,useDepthPacking:_.depthPacking>=0,depthPacking:_.depthPacking||0,index0AttributeName:_.index0AttributeName,extensionClipCullDistance:Qe&&_.extensions.clipCullDistance===!0&&t.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(Qe&&_.extensions.multiDraw===!0||pt)&&t.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:t.has("KHR_parallel_shader_compile"),customProgramCacheKey:_.customProgramCacheKey()};return Ze.vertexUv1s=l.has(1),Ze.vertexUv2s=l.has(2),Ze.vertexUv3s=l.has(3),l.clear(),Ze}function v(_){const b=[];if(_.shaderID?b.push(_.shaderID):(b.push(_.customVertexShaderID),b.push(_.customFragmentShaderID)),_.defines!==void 0)for(const P in _.defines)b.push(P),b.push(_.defines[P]);return _.isRawShaderMaterial===!1&&(m(b,_),g(b,_),b.push(i.outputColorSpace)),b.push(_.customProgramCacheKey),b.join()}function m(_,b){_.push(b.precision),_.push(b.outputColorSpace),_.push(b.envMapMode),_.push(b.envMapPMREM),_.push(b.envMapMaxLod),_.push(b.envMapSize),_.push(b.mapUv),_.push(b.alphaMapUv),_.push(b.lightMapUv),_.push(b.aoMapUv),_.push(b.bumpMapUv),_.push(b.normalMapUv),_.push(b.displacementMapUv),_.push(b.emissiveMapUv),_.push(b.metalnessMapUv),_.push(b.roughnessMapUv),_.push(b.anisotropyMapUv),_.push(b.clearcoatMapUv),_.push(b.clearcoatNormalMapUv),_.push(b.clearcoatRoughnessMapUv),_.push(b.diffuseRoughnessMapUv),_.push(b.iridescenceMapUv),_.push(b.iridescenceThicknessMapUv),_.push(b.sheenColorMapUv),_.push(b.sheenRoughnessMapUv),_.push(b.specularMapUv),_.push(b.specularColorMapUv),_.push(b.specularIntensityMapUv),_.push(b.transmissionMapUv),_.push(b.thicknessMapUv),_.push(b.combine),_.push(b.fogExp2),_.push(b.sizeAttenuation),_.push(b.morphTargetsCount),_.push(b.numSunLights),_.push(b.numDirLights),_.push(b.numPointLights),_.push(b.numSpotLights),_.push(b.numSpotLightMaps),_.push(b.numHemiLights),_.push(b.numRectAreaLights),_.push(b.numSunLightShadows),_.push(b.numDirLightShadows),_.push(b.numPointLightShadows),_.push(b.numSpotLightShadows),_.push(b.numSpotLightShadowsWithMaps),_.push(b.numLightProbes),_.push(b.numLightProbeGrids),_.push(b.shadowMapType),_.push(b.toneMapping),_.push(b.numClippingPlanes),_.push(b.numClipIntersection),_.push(b.depthPacking)}function g(_,b){a.disableAll(),b.instancing&&a.enable(0),b.instancingColor&&a.enable(1),b.instancingMorph&&a.enable(2),b.matcap&&a.enable(3),b.envMap&&a.enable(4),b.normalMapObjectSpace&&a.enable(5),b.normalMapTangentSpace&&a.enable(6),b.clearcoat&&a.enable(7),b.iridescence&&a.enable(8),b.alphaTest&&a.enable(9),b.vertexColors&&a.enable(10),b.vertexAlphas&&a.enable(11),b.vertexUv1s&&a.enable(12),b.vertexUv2s&&a.enable(13),b.vertexUv3s&&a.enable(14),b.vertexTangents&&a.enable(15),b.anisotropy&&a.enable(16),b.alphaHash&&a.enable(17),b.batching&&a.enable(18),b.dispersion&&a.enable(19),b.retroreflection&&a.enable(24),b.diffuseRoughness&&a.enable(25),b.batchingColor&&a.enable(20),b.gradientMap&&a.enable(21),b.packedNormalMap&&a.enable(22),b.vertexNormals&&a.enable(23),_.push(a.mask),a.disableAll(),b.fog&&a.enable(0),b.useFog&&a.enable(1),b.flatShading&&a.enable(2),b.logarithmicDepthBuffer&&a.enable(3),b.reversedDepthBuffer&&a.enable(4),b.skinning&&a.enable(5),b.morphTargets&&a.enable(6),b.morphNormals&&a.enable(7),b.morphColors&&a.enable(8),b.premultipliedAlpha&&a.enable(9),b.shadowMapEnabled&&a.enable(10),b.doubleSided&&a.enable(11),b.flipSided&&a.enable(12),b.useDepthPacking&&a.enable(13),b.dithering&&a.enable(14),b.transmission&&a.enable(15),b.sheen&&a.enable(16),b.opaque&&a.enable(17),b.pointsUvs&&a.enable(18),b.decodeVideoTexture&&a.enable(19),b.decodeVideoTextureEmissive&&a.enable(20),b.alphaToCoverage&&a.enable(21),b.numLightProbeGrids>0&&a.enable(22),b.hasPositionAttribute&&a.enable(23),_.push(a.mask)}function x(_){const b=d[_.type];let P;if(b){const R=Mn[b];P=Wd.clone(R.uniforms)}else P=_.uniforms;return P}function M(_,b){let P=u.get(b);return P!==void 0?++P.usedTimes:(P=new _g(i,b,_,s),c.push(P),u.set(b,P)),P}function S(_){if(--_.usedTimes===0){const b=c.indexOf(_);c[b]=c[c.length-1],c.pop(),u.delete(_.cacheKey),_.destroy()}}function w(_){o.remove(_)}function T(){o.dispose()}return{getParameters:p,getProgramCacheKey:v,getUniforms:x,acquireProgram:M,releaseProgram:S,releaseShaderCache:w,programs:c,dispose:T}}function Eg(){let i=new WeakMap;function e(a){return i.has(a)}function t(a){let o=i.get(a);return o===void 0&&(o={},i.set(a,o)),o}function n(a){i.delete(a)}function s(a,o,l){i.get(a)[o]=l}function r(){i=new WeakMap}return{has:e,get:t,remove:n,update:s,dispose:r}}function bg(i,e){return i.groupOrder!==e.groupOrder?i.groupOrder-e.groupOrder:i.renderOrder!==e.renderOrder?i.renderOrder-e.renderOrder:i.material.id!==e.material.id?i.material.id-e.material.id:i.materialVariant!==e.materialVariant?i.materialVariant-e.materialVariant:i.z!==e.z?i.z-e.z:i.id-e.id}function Wl(i,e){return i.groupOrder!==e.groupOrder?i.groupOrder-e.groupOrder:i.renderOrder!==e.renderOrder?i.renderOrder-e.renderOrder:i.z!==e.z?e.z-i.z:i.id-e.id}function Xl(){const i=[];let e=0;const t=[],n=[],s=[];function r(){e=0,t.length=0,n.length=0,s.length=0}function a(d){let h=0;return d.isInstancedMesh&&(h+=2),d.isSkinnedMesh&&(h+=1),h}function o(d,h,p,v,m,g){let x=i[e];return x===void 0?(x={id:d.id,object:d,geometry:h,material:p,materialVariant:a(d),groupOrder:v,renderOrder:d.renderOrder,z:m,group:g},i[e]=x):(x.id=d.id,x.object=d,x.geometry=h,x.material=p,x.materialVariant=a(d),x.groupOrder=v,x.renderOrder=d.renderOrder,x.z=m,x.group=g),e++,x}function l(d,h,p,v,m,g,x){x.reversedDepth===!0&&(m=-m);const M=o(d,h,p,v,m,g);p.transmission>0?n.push(M):p.transparent===!0?s.push(M):t.push(M)}function c(d,h,p,v,m,g){const x=o(d,h,p,v,m,g);p.transmission>0?n.unshift(x):p.transparent===!0?s.unshift(x):t.unshift(x)}function u(d,h){t.length>1&&t.sort(d||bg),n.length>1&&n.sort(h||Wl),s.length>1&&s.sort(h||Wl)}function f(){for(let d=e,h=i.length;d<h;d++){const p=i[d];if(p.id===null)break;p.id=null,p.object=null,p.geometry=null,p.material=null,p.group=null}}return{opaque:t,transmissive:n,transparent:s,init:r,push:l,unshift:c,finish:f,sort:u}}function wg(){let i=new WeakMap;function e(n,s){const r=i.get(n);let a;return r===void 0?(a=new Xl,i.set(n,[a])):s>=r.length?(a=new Xl,r.push(a)):a=r[s],a}function t(){i=new WeakMap}return{get:e,dispose:t}}function Tg(){const i={};return{get:function(e){if(i[e.id]!==void 0)return i[e.id];let t;switch(e.type){case"SunLight":case"DirectionalLight":t={direction:new O,color:new Ve};break;case"SpotLight":t={position:new O,direction:new O,color:new Ve,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new O,color:new Ve,distance:0,decay:0};break;case"HemisphereLight":t={direction:new O,skyColor:new Ve,groundColor:new Ve};break;case"RectAreaLight":t={color:new Ve,position:new O,halfWidth:new O,halfHeight:new O};break}return i[e.id]=t,t}}}function Ag(){const i={};return{get:function(e){if(i[e.id]!==void 0)return i[e.id];let t;switch(e.type){case"SunLight":case"DirectionalLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Se};break;case"SpotLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Se};break;case"PointLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Se,shadowCameraNear:1,shadowCameraFar:1e3};break}return i[e.id]=t,t}}}let Rg=0;function Cg(i,e){return(e.castShadow?2:0)-(i.castShadow?2:0)+(e.map?1:0)-(i.map?1:0)}function Pg(i){const e=new Tg,t=Ag(),n={version:0,hash:{sunLength:-1,directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numSunShadows:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],sun:[],sunShadow:[],sunShadowMap:[],sunShadowMatrix:[],sunShadowCascade:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let c=0;c<9;c++)n.probe.push(new O);const s=new O,r=new xt,a=new xt;function o(c){let u=0,f=0,d=0;for(let F=0;F<9;F++)n.probe[F].set(0,0,0);let h=0,p=0,v=0,m=0,g=0,x=0,M=0,S=0,w=0,T=0,_=0,b=0,P=0,R=0;c.sort(Cg);for(let F=0,V=c.length;F<V;F++){const D=c[F],z=D.color,X=D.intensity,k=D.distance;let se=null;if(D.shadow&&D.shadow.map&&(D.shadow.map.texture.format===ui?se=D.shadow.map.texture:se=D.shadow.map.depthTexture||D.shadow.map.texture),D.isAmbientLight)u+=z.r*X,f+=z.g*X,d+=z.b*X;else if(D.isLightProbe){for(let $=0;$<9;$++)n.probe[$].addScaledVector(D.sh.coefficients[$],X);R++}else if(D.isSunLight){const $=e.get(D);if($.color.copy(D.color).multiplyScalar(D.intensity),D.castShadow){const ee=D.shadow,ie=t.get(D);ie.shadowIntensity=ee.intensity,ie.shadowBias=ee.bias,ie.shadowNormalBias=ee.normalBias,ie.shadowRadius=ee.radius,ie.shadowMapSize.copy(ee.mapSize).multiply(ee.getFrameExtents()),n.sunShadow[p]=ie,n.sunShadowMap[p]=se;const we=ee.getViewportCount();for(let Fe=0;Fe<we;Fe++)n.sunShadowMatrix[v+Fe]=ee.getMatrix(Fe),n.sunShadowCascade[v+Fe]=ee._cascadeData[Fe];v+=we,p++}n.sun[h]=$,h++}else if(D.isDirectionalLight){const $=e.get(D);if($.color.copy(D.color).multiplyScalar(D.intensity),D.castShadow){const ee=D.shadow,ie=t.get(D);ie.shadowIntensity=ee.intensity,ie.shadowBias=ee.bias,ie.shadowNormalBias=ee.normalBias,ie.shadowRadius=ee.radius,ie.shadowMapSize=ee.mapSize,n.directionalShadow[m]=ie,n.directionalShadowMap[m]=se,n.directionalShadowMatrix[m]=D.shadow.matrix,w++}n.directional[m]=$,m++}else if(D.isSpotLight){const $=e.get(D);$.position.setFromMatrixPosition(D.matrixWorld),$.color.copy(z).multiplyScalar(X),$.distance=k,$.coneCos=Math.cos(D.angle),$.penumbraCos=Math.cos(D.angle*(1-D.penumbra)),$.decay=D.decay,n.spot[x]=$;const ee=D.shadow;if(D.map&&(n.spotLightMap[b]=D.map,b++,ee.updateMatrices(D),D.castShadow&&P++),n.spotLightMatrix[x]=ee.matrix,D.castShadow){const ie=t.get(D);ie.shadowIntensity=ee.intensity,ie.shadowBias=ee.bias,ie.shadowNormalBias=ee.normalBias,ie.shadowRadius=ee.radius,ie.shadowMapSize=ee.mapSize,n.spotShadow[x]=ie,n.spotShadowMap[x]=se,_++}x++}else if(D.isRectAreaLight){const $=e.get(D);$.color.copy(z).multiplyScalar(X),$.halfWidth.set(D.width*.5,0,0),$.halfHeight.set(0,D.height*.5,0),n.rectArea[M]=$,M++}else if(D.isPointLight){const $=e.get(D);if($.color.copy(D.color).multiplyScalar(D.intensity),$.distance=D.distance,$.decay=D.decay,D.castShadow){const ee=D.shadow,ie=t.get(D);ie.shadowIntensity=ee.intensity,ie.shadowBias=ee.bias,ie.shadowNormalBias=ee.normalBias,ie.shadowRadius=ee.radius,ie.shadowMapSize=ee.mapSize,ie.shadowCameraNear=ee.camera.near,ie.shadowCameraFar=ee.camera.far,n.pointShadow[g]=ie,n.pointShadowMap[g]=se,n.pointShadowMatrix[g]=D.shadow.matrix,T++}n.point[g]=$,g++}else if(D.isHemisphereLight){const $=e.get(D);$.skyColor.copy(D.color).multiplyScalar(X),$.groundColor.copy(D.groundColor).multiplyScalar(X),n.hemi[S]=$,S++}}M>0&&(i.has("OES_texture_float_linear")===!0?(n.rectAreaLTC1=Ee.LTC_FLOAT_1,n.rectAreaLTC2=Ee.LTC_FLOAT_2):(n.rectAreaLTC1=Ee.LTC_HALF_1,n.rectAreaLTC2=Ee.LTC_HALF_2)),n.ambient[0]=u,n.ambient[1]=f,n.ambient[2]=d;const C=n.hash;(C.sunLength!==h||C.directionalLength!==m||C.pointLength!==g||C.spotLength!==x||C.rectAreaLength!==M||C.hemiLength!==S||C.numSunShadows!==p||C.numDirectionalShadows!==w||C.numPointShadows!==T||C.numSpotShadows!==_||C.numSpotMaps!==b||C.numLightProbes!==R)&&(n.sun.length=h,n.directional.length=m,n.spot.length=x,n.rectArea.length=M,n.point.length=g,n.hemi.length=S,n.sunShadow.length=p,n.sunShadowMap.length=p,n.sunShadowMatrix.length=v,n.sunShadowCascade.length=v,n.directionalShadow.length=w,n.directionalShadowMap.length=w,n.directionalShadowMatrix.length=w,n.pointShadow.length=T,n.pointShadowMap.length=T,n.pointShadowMatrix.length=T,n.spotShadow.length=_,n.spotShadowMap.length=_,n.spotLightMatrix.length=_+b-P,n.spotLightMap.length=b,n.numSpotLightShadowsWithMaps=P,n.numLightProbes=R,C.sunLength=h,C.directionalLength=m,C.pointLength=g,C.spotLength=x,C.rectAreaLength=M,C.hemiLength=S,C.numSunShadows=p,C.numDirectionalShadows=w,C.numPointShadows=T,C.numSpotShadows=_,C.numSpotMaps=b,C.numLightProbes=R,n.version=Rg++)}function l(c,u){let f=0,d=0,h=0,p=0,v=0,m=0;const g=u.matrixWorldInverse;for(let x=0,M=c.length;x<M;x++){const S=c[x];if(S.isSunLight){const w=n.sun[f];w.direction.setFromMatrixPosition(S.matrixWorld),w.direction.transformDirection(g),f++}else if(S.isDirectionalLight){const w=n.directional[d];w.direction.setFromMatrixPosition(S.matrixWorld),s.setFromMatrixPosition(S.target.matrixWorld),w.direction.sub(s),w.direction.transformDirection(g),d++}else if(S.isSpotLight){const w=n.spot[p];w.position.setFromMatrixPosition(S.matrixWorld),w.position.applyMatrix4(g),w.direction.setFromMatrixPosition(S.matrixWorld),s.setFromMatrixPosition(S.target.matrixWorld),w.direction.sub(s),w.direction.transformDirection(g),p++}else if(S.isRectAreaLight){const w=n.rectArea[v];w.position.setFromMatrixPosition(S.matrixWorld),w.position.applyMatrix4(g),a.identity(),r.copy(S.matrixWorld),r.premultiply(g),a.extractRotation(r),w.halfWidth.set(S.width*.5,0,0),w.halfHeight.set(0,S.height*.5,0),w.halfWidth.applyMatrix4(a),w.halfHeight.applyMatrix4(a),v++}else if(S.isPointLight){const w=n.point[h];w.position.setFromMatrixPosition(S.matrixWorld),w.position.applyMatrix4(g),h++}else if(S.isHemisphereLight){const w=n.hemi[m];w.direction.setFromMatrixPosition(S.matrixWorld),w.direction.transformDirection(g),m++}}}return{setup:o,setupView:l,state:n}}function ql(i){const e=new Pg(i),t=[],n=[],s=[];function r(f){u.camera=f,t.length=0,n.length=0,s.length=0}function a(f){f.isLightProbeGrid?s.push(f):t.push(f)}function o(f){n.push(f)}function l(){e.setup(t),s.sort((f,d)=>f.priority-d.priority||f.id-d.id)}function c(f){e.setupView(t,f)}const u={lightsArray:t,shadowsArray:n,lightProbeGridArray:s,camera:null,lights:e,transmissionRenderTarget:{},textureUnits:0};return{init:r,state:u,setupLights:l,setupLightsView:c,pushLight:a,pushShadow:o}}function Lg(i){let e=new WeakMap;function t(s,r=0){const a=e.get(s);let o;return a===void 0?(o=new ql(i),e.set(s,[o])):r>=a.length?(o=new ql(i),a.push(o)):o=a[r],o}function n(){e=new WeakMap}return{get:t,dispose:n}}const Dg=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,Ig=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ).rg;
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ).r;
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( max( 0.0, squared_mean - mean * mean ) );
	gl_FragColor = vec4( mean, std_dev, 0.0, 1.0 );
}`,Ng=[new O(1,0,0),new O(-1,0,0),new O(0,1,0),new O(0,-1,0),new O(0,0,1),new O(0,0,-1)],Ug=[new O(0,-1,0),new O(0,-1,0),new O(0,0,1),new O(0,0,-1),new O(0,-1,0),new O(0,-1,0)],Yl=new xt,$i=new O,Qr=new O;function Fg(i,e,t){let n=new ds;const s=new Se,r=new Se,a=new bt,o=new $d,l=new Kd,c={},u=t.maxTextureSize,f={[hi]:Jt,[Jt]:hi,[Sn]:Sn},d=new fi({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new Se},radius:{value:4}},vertexShader:Dg,fragmentShader:Ig}),h=d.clone();h.defines.HORIZONTAL_PASS=1;const p=new Xt;p.setAttribute("position",new gn(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));const v=new kt(p,d),m=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=Js;let g=this.type;this.render=function(T,_,b){if(m.enabled===!1||m.autoUpdate===!1&&m.needsUpdate===!1||T.length===0)return;this.type===Vh&&(He("WebGLShadowMap: PCFSoftShadowMap has been removed. Using PCFShadowMap instead."),this.type=Js);const P=i.getRenderTarget(),R=i.getActiveCubeFace(),C=i.getActiveMipmapLevel(),F=i.state;F.setBlending(Di),F.buffers.depth.getReversed()===!0?F.buffers.color.setClear(0,0,0,0):F.buffers.color.setClear(1,1,1,1),F.buffers.depth.setTest(!0),F.setScissorTest(!1);const V=g!==this.type;V&&_.traverse(function(D){D.material&&(Array.isArray(D.material)?D.material.forEach(z=>z.needsUpdate=!0):D.material.needsUpdate=!0)});for(let D=0,z=T.length;D<z;D++){const X=T[D],k=X.shadow;if(k===void 0){He("WebGLShadowMap:",X,"has no shadow.");continue}if(k.autoUpdate===!1&&k.needsUpdate===!1)continue;s.copy(k.mapSize);const se=k.getFrameExtents();s.multiply(se),r.copy(k.mapSize),(s.x>u||s.y>u)&&(s.x>u&&(r.x=Math.floor(u/se.x),s.x=r.x*se.x,k.mapSize.x=r.x),s.y>u&&(r.y=Math.floor(u/se.y),s.y=r.y*se.y,k.mapSize.y=r.y));const $=i.state.buffers.depth.getReversed();if(k.camera._reversedDepth=$,k.map===null||V===!0){if(k.map!==null&&(k.map.depthTexture!==null&&(k.map.depthTexture.dispose(),k.map.depthTexture=null),k.map.dispose()),this.type===Ji){if(X.isPointLight){He("WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.");continue}k.map=new bn(s.x,s.y,{format:ui,type:Tn,minFilter:Zt,magFilter:Zt,generateMipmaps:!1}),k.map.texture.name=X.name+".shadowMap",k.map.depthTexture=new Oi(s.x,s.y,yn),k.map.depthTexture.name=X.name+".shadowMapDepth",k.map.depthTexture.format=jn,k.map.depthTexture.compareFunction=null,k.map.depthTexture.minFilter=Ot,k.map.depthTexture.magFilter=Ot}else X.isPointLight?(k.map=new Mo(s.x),k.map.depthTexture=new Vc(s.x,wn)):(k.map=new bn(s.x,s.y),k.map.depthTexture=new Oi(s.x,s.y,wn)),k.map.depthTexture.name=X.name+".shadowMap",k.map.depthTexture.format=jn,this.type===Js?(k.map.depthTexture.compareFunction=$?Pc:Cc,k.map.depthTexture.minFilter=Zt,k.map.depthTexture.magFilter=Zt):(k.map.depthTexture.compareFunction=null,k.map.depthTexture.minFilter=Ot,k.map.depthTexture.magFilter=Ot);k.camera.updateProjectionMatrix()}k.map.isWebGLCubeRenderTarget!==!0&&(k.map.width!==s.x||k.map.height!==s.y)&&k.map.setSize(s.x,s.y);const ee=k.map.isWebGLCubeRenderTarget?6:k.getViewportCount();X.isPointLight!==!0&&k.updateMatrices(X,b);const ie=(k.camera.layers.mask&4294967294)!==0?k.camera.layers:b.layers;for(let we=0;we<ee;we++){const Fe=k.getCamera(we);if(X.isPointLight){const K=k.camera,ge=k.matrix,Te=X.distance||K.far;Te!==K.far&&(K.far=Te,K.updateProjectionMatrix()),$i.setFromMatrixPosition(X.matrixWorld),K.position.copy($i),Qr.copy(K.position),Qr.add(Ng[we]),K.up.copy(Ug[we]),K.lookAt(Qr),K.updateMatrixWorld(),ge.makeTranslation(-$i.x,-$i.y,-$i.z),Yl.multiplyMatrices(K.projectionMatrix,K.matrixWorldInverse),k._frustum.setFromProjectionMatrix(Yl,K.coordinateSystem,K.reversedDepth)}if(k.map.isWebGLCubeRenderTarget)i.setRenderTarget(k.map,we),i.clear();else{we===0&&(i.setRenderTarget(k.map),i.clear());const K=k.getViewport(we);a.set(r.x*K.x,r.y*K.y,r.x*K.z,r.y*K.w),F.viewport(a)}n=k.getFrustum(we),S(_,b,Fe,X,ie,this.type)}k.isPointLightShadow!==!0&&this.type===Ji&&x(k,b),k.needsUpdate=!1}g=this.type,m.needsUpdate=!1,i.setRenderTarget(P,R,C)};function x(T,_){const b=e.update(v);d.defines.VSM_SAMPLES!==T.blurSamples&&(d.defines.VSM_SAMPLES=T.blurSamples,h.defines.VSM_SAMPLES=T.blurSamples,d.needsUpdate=!0,h.needsUpdate=!0),T.mapPass===null?T.mapPass=new bn(s.x,s.y,{format:ui,type:Tn}):(T.mapPass.width!==T.map.width||T.mapPass.height!==T.map.height)&&T.mapPass.setSize(T.map.width,T.map.height),d.uniforms.shadow_pass.value=T.map.depthTexture,d.uniforms.resolution.value.set(T.map.width,T.map.height),d.uniforms.radius.value=T.radius,i.setRenderTarget(T.mapPass),i.clear(),i.renderBufferDirect(_,null,b,d,v,null),h.uniforms.shadow_pass.value=T.mapPass.texture,h.uniforms.resolution.value.set(T.map.width,T.map.height),h.uniforms.radius.value=T.radius,i.setRenderTarget(T.map),i.clear(),i.renderBufferDirect(_,null,b,h,v,null)}function M(T,_,b,P){let R=null;const C=b.isPointLight===!0?T.customDistanceMaterial:T.customDepthMaterial;if(C!==void 0)R=C;else if(R=b.isPointLight===!0?l:o,i.localClippingEnabled&&_.clipShadows===!0&&Array.isArray(_.clippingPlanes)&&_.clippingPlanes.length!==0||_.displacementMap&&_.displacementScale!==0||_.alphaMap&&_.alphaTest>0||_.map&&_.alphaTest>0||_.alphaToCoverage===!0){const F=R.uuid,V=_.uuid;let D=c[F];D===void 0&&(D={},c[F]=D);let z=D[V];z===void 0&&(z=R.clone(),D[V]=z,_.addEventListener("dispose",w)),R=z}if(R.visible=_.visible,R.wireframe=_.wireframe,P===Ji?R.side=_.shadowSide!==null?_.shadowSide:_.side:R.side=_.shadowSide!==null?_.shadowSide:f[_.side],R.alphaMap=_.alphaMap,R.alphaTest=_.alphaToCoverage===!0?.5:_.alphaTest,R.map=_.map,R.clipShadows=_.clipShadows,R.clippingPlanes=_.clippingPlanes,R.clipIntersection=_.clipIntersection,R.displacementMap=_.displacementMap,R.displacementScale=_.displacementScale,R.displacementBias=_.displacementBias,R.wireframeLinewidth=_.wireframeLinewidth,R.linewidth=_.linewidth,b.isPointLight===!0&&R.isMeshDistanceMaterial===!0){const F=i.properties.get(R);F.light=b}return R}function S(T,_,b,P,R,C){if(T.visible===!1)return;if(T.layers.test(R)&&(T.isMesh||T.isLine||T.isPoints)&&(T.castShadow||T.receiveShadow&&C===Ji)&&(!T.frustumCulled||T.intersectsFrustum(n))){T.modelViewMatrix.multiplyMatrices(b.matrixWorldInverse,T.matrixWorld);const D=e.update(T),z=T.material;if(Array.isArray(z)){const X=D.groups;for(let k=0,se=X.length;k<se;k++){const $=X[k],ee=z[$.materialIndex];if(ee&&ee.visible){const ie=M(T,ee,P,C);T.onBeforeShadow(i,T,_,b,D,ie,$),i.renderBufferDirect(b,null,D,ie,T,$),T.onAfterShadow(i,T,_,b,D,ie,$)}}}else if(z.visible){const X=M(T,z,P,C);T.onBeforeShadow(i,T,_,b,D,X,null),i.renderBufferDirect(b,null,D,X,T,null),T.onAfterShadow(i,T,_,b,D,X,null)}}const V=T.children;for(let D=0,z=V.length;D<z;D++)S(V[D],_,b,P,R,C)}function w(T){T.target.removeEventListener("dispose",w);for(const b in c){const P=c[b],R=T.target.uuid;R in P&&(P[R].dispose(),delete P[R])}}}function Og(i,e){function t(){let I=!1;const j=new bt;let Z=null;const pe=new bt(0,0,0,0);return{setMask:function(ce){Z!==ce&&!I&&(i.colorMask(ce,ce,ce,ce),Z=ce)},setLocked:function(ce){I=ce},setClear:function(ce,de,Ne,Qe,le){le===!0&&(ce*=Qe,de*=Qe,Ne*=Qe),j.set(ce,de,Ne,Qe),pe.equals(j)===!1&&(i.clearColor(ce,de,Ne,Qe),pe.copy(j))},reset:function(){I=!1,Z=null,pe.set(-1,0,0,0)}}}function n(){let I=!1,j=!1,Z=null,pe=null,ce=null;return{setReversed:function(de){if(j!==de){const Ne=e.get("EXT_clip_control");de?Ne.clipControlEXT(Ne.LOWER_LEFT_EXT,Ne.ZERO_TO_ONE_EXT):Ne.clipControlEXT(Ne.LOWER_LEFT_EXT,Ne.NEGATIVE_ONE_TO_ONE_EXT),j=de;const Qe=ce;ce=null,this.setClear(Qe)}},getReversed:function(){return j},setTest:function(de){de?Me(i.DEPTH_TEST):Oe(i.DEPTH_TEST)},setMask:function(de){Z!==de&&!I&&(i.depthMask(de),Z=de)},setFunc:function(de){if(j&&(de=Eu[de]),pe!==de){switch(de){case la:i.depthFunc(i.NEVER);break;case ca:i.depthFunc(i.ALWAYS);break;case ha:i.depthFunc(i.LESS);break;case os:i.depthFunc(i.LEQUAL);break;case ua:i.depthFunc(i.EQUAL);break;case da:i.depthFunc(i.GEQUAL);break;case fa:i.depthFunc(i.GREATER);break;case pa:i.depthFunc(i.NOTEQUAL);break;default:i.depthFunc(i.LEQUAL)}pe=de}},setLocked:function(de){I=de},setClear:function(de){ce!==de&&(ce=de,j&&(de=1-de),i.clearDepth(de))},reset:function(){I=!1,Z=null,pe=null,ce=null,j=!1}}}function s(){let I=!1,j=null,Z=null,pe=null,ce=null,de=null,Ne=null,Qe=null,le=null;return{setTest:function(ke){I||(ke?Me(i.STENCIL_TEST):Oe(i.STENCIL_TEST))},setMask:function(ke){j!==ke&&!I&&(i.stencilMask(ke),j=ke)},setFunc:function(ke,Ze,ye){(Z!==ke||pe!==Ze||ce!==ye)&&(i.stencilFunc(ke,Ze,ye),Z=ke,pe=Ze,ce=ye)},setOp:function(ke,Ze,ye){(de!==ke||Ne!==Ze||Qe!==ye)&&(i.stencilOp(ke,Ze,ye),de=ke,Ne=Ze,Qe=ye)},setLocked:function(ke){I=ke},setClear:function(ke){le!==ke&&(i.clearStencil(ke),le=ke)},reset:function(){I=!1,j=null,Z=null,pe=null,ce=null,de=null,Ne=null,Qe=null,le=null}}}const r=new t,a=new n,o=new s;let l={};const c=new WeakMap;let u={},f={},d={},h=new WeakMap,p=[],v=null,m=!1,g=null,x=null,M=null,S=null,w=null,T=null,_=null,b=new Ve(0,0,0),P=0,R=!1,C=null,F=null,V=null,D=null,z=null;const X=i.getParameter(i.MAX_COMBINED_TEXTURE_IMAGE_UNITS);let k=!1,se=0;const $=i.getParameter(i.VERSION);$.indexOf("WebGL")!==-1?(se=parseFloat(/^WebGL (\d)/.exec($)[1]),k=se>=1):$.indexOf("OpenGL ES")!==-1&&(se=parseFloat(/^OpenGL ES (\d)/.exec($)[1]),k=se>=2);let ee=null,ie={};const we=i.getParameter(i.SCISSOR_BOX),Fe=i.getParameter(i.VIEWPORT),K=new bt().fromArray(we),ge=new bt().fromArray(Fe);function Te(I,j,Z,pe){const ce=new Uint8Array(4),de=i.createTexture();i.bindTexture(I,de),i.texParameteri(I,i.TEXTURE_MIN_FILTER,i.NEAREST),i.texParameteri(I,i.TEXTURE_MAG_FILTER,i.NEAREST);for(let Ne=0;Ne<Z;Ne++)I===i.TEXTURE_3D||I===i.TEXTURE_2D_ARRAY?i.texImage3D(j,0,i.RGBA,1,1,pe,0,i.RGBA,i.UNSIGNED_BYTE,ce):i.texImage2D(j+Ne,0,i.RGBA,1,1,0,i.RGBA,i.UNSIGNED_BYTE,ce);return de}const Ue={};Ue[i.TEXTURE_2D]=Te(i.TEXTURE_2D,i.TEXTURE_2D,1),Ue[i.TEXTURE_CUBE_MAP]=Te(i.TEXTURE_CUBE_MAP,i.TEXTURE_CUBE_MAP_POSITIVE_X,6),Ue[i.TEXTURE_2D_ARRAY]=Te(i.TEXTURE_2D_ARRAY,i.TEXTURE_2D_ARRAY,1,1),Ue[i.TEXTURE_3D]=Te(i.TEXTURE_3D,i.TEXTURE_3D,1,1),r.setClear(0,0,0,1),a.setClear(1),o.setClear(0),Me(i.DEPTH_TEST),a.setFunc(os),ae(!1),re(qo),Me(i.CULL_FACE),he(Di);function Me(I){u[I]!==!0&&(i.enable(I),u[I]=!0)}function Oe(I){u[I]!==!1&&(i.disable(I),u[I]=!1)}function pt(I,j){return d[I]!==j?(i.bindFramebuffer(I,j),d[I]=j,I===i.DRAW_FRAMEBUFFER&&(d[i.FRAMEBUFFER]=j),I===i.FRAMEBUFFER&&(d[i.DRAW_FRAMEBUFFER]=j),!0):!1}function ze(I,j){let Z=p,pe=!1;if(I){Z=h.get(j),Z===void 0&&(Z=[],h.set(j,Z));const ce=I.textures;if(Z.length!==ce.length||Z[0]!==i.COLOR_ATTACHMENT0){for(let de=0,Ne=ce.length;de<Ne;de++)Z[de]=i.COLOR_ATTACHMENT0+de;Z.length=ce.length,pe=!0}}else Z[0]!==i.BACK&&(Z[0]=i.BACK,pe=!0);pe&&i.drawBuffers(Z)}function Ye(I){return v!==I?(i.useProgram(I),v=I,!0):!1}const Ke={[Ri]:i.FUNC_ADD,[Xh]:i.FUNC_SUBTRACT,[qh]:i.FUNC_REVERSE_SUBTRACT};Ke[Yh]=i.MIN,Ke[$h]=i.MAX;const te={[Kh]:i.ZERO,[Zh]:i.ONE,[Jh]:i.SRC_COLOR,[dc]:i.SRC_ALPHA,[iu]:i.SRC_ALPHA_SATURATE,[tu]:i.DST_COLOR,[jh]:i.DST_ALPHA,[Qh]:i.ONE_MINUS_SRC_COLOR,[fc]:i.ONE_MINUS_SRC_ALPHA,[nu]:i.ONE_MINUS_DST_COLOR,[eu]:i.ONE_MINUS_DST_ALPHA,[su]:i.CONSTANT_COLOR,[ru]:i.ONE_MINUS_CONSTANT_COLOR,[au]:i.CONSTANT_ALPHA,[ou]:i.ONE_MINUS_CONSTANT_ALPHA};function he(I,j,Z,pe,ce,de,Ne,Qe,le,ke){if(I===Di){m===!0&&(Oe(i.BLEND),m=!1);return}if(m===!1&&(Me(i.BLEND),m=!0),I!==Wh){if(I!==g||ke!==R){if((x!==Ri||w!==Ri)&&(i.blendEquation(i.FUNC_ADD),x=Ri,w=Ri),ke)switch(I){case ts:i.blendFuncSeparate(i.ONE,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case Yo:i.blendFunc(i.ONE,i.ONE);break;case $o:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case Ko:i.blendFuncSeparate(i.DST_COLOR,i.ONE_MINUS_SRC_ALPHA,i.ZERO,i.ONE);break;default:lt("WebGLState: Invalid blending: ",I);break}else switch(I){case ts:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case Yo:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE,i.ONE,i.ONE);break;case $o:lt("WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case Ko:lt("WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:lt("WebGLState: Invalid blending: ",I);break}M=null,S=null,T=null,_=null,b.set(0,0,0),P=0,g=I,R=ke}return}ce=ce||j,de=de||Z,Ne=Ne||pe,(j!==x||ce!==w)&&(i.blendEquationSeparate(Ke[j],Ke[ce]),x=j,w=ce),(Z!==M||pe!==S||de!==T||Ne!==_)&&(i.blendFuncSeparate(te[Z],te[pe],te[de],te[Ne]),M=Z,S=pe,T=de,_=Ne),(Qe.equals(b)===!1||le!==P)&&(i.blendColor(Qe.r,Qe.g,Qe.b,le),b.copy(Qe),P=le),g=I,R=!1}function q(I,j){I.side===Sn?Oe(i.CULL_FACE):Me(i.CULL_FACE);let Z=I.side===Jt;j&&(Z=!Z),ae(Z),I.blending===ts&&I.transparent===!1?he(Di):he(I.blending,I.blendEquation,I.blendSrc,I.blendDst,I.blendEquationAlpha,I.blendSrcAlpha,I.blendDstAlpha,I.blendColor,I.blendAlpha,I.premultipliedAlpha),a.setFunc(I.depthFunc),a.setTest(I.depthTest),a.setMask(I.depthWrite),r.setMask(I.colorWrite);const pe=I.stencilWrite;o.setTest(pe),pe&&(o.setMask(I.stencilWriteMask),o.setFunc(I.stencilFunc,I.stencilRef,I.stencilFuncMask),o.setOp(I.stencilFail,I.stencilZFail,I.stencilZPass)),Ae(I.polygonOffset,I.polygonOffsetFactor,I.polygonOffsetUnits),I.alphaToCoverage===!0?Me(i.SAMPLE_ALPHA_TO_COVERAGE):Oe(i.SAMPLE_ALPHA_TO_COVERAGE)}function ae(I){C!==I&&(I?i.frontFace(i.CW):i.frontFace(i.CCW),C=I)}function re(I){I!==Gh?(Me(i.CULL_FACE),I!==F&&(I===qo?i.cullFace(i.BACK):I===Hh?i.cullFace(i.FRONT):i.cullFace(i.FRONT_AND_BACK))):Oe(i.CULL_FACE),F=I}function Be(I){I!==V&&(k&&i.lineWidth(I),V=I)}function Ae(I,j,Z){I?(Me(i.POLYGON_OFFSET_FILL),(D!==j||z!==Z)&&(D=j,z=Z,a.getReversed()&&(j=-j,Z=-Z),i.polygonOffset(j,Z))):Oe(i.POLYGON_OFFSET_FILL)}function $e(I){I?Me(i.SCISSOR_TEST):Oe(i.SCISSOR_TEST)}function Je(I){I===void 0&&(I=i.TEXTURE0+X-1),ee!==I&&(i.activeTexture(I),ee=I)}function et(I,j,Z){Z===void 0&&(ee===null?Z=i.TEXTURE0+X-1:Z=ee);let pe=ie[Z];pe===void 0&&(pe={type:void 0,texture:void 0},ie[Z]=pe),(pe.type!==I||pe.texture!==j)&&(ee!==Z&&(i.activeTexture(Z),ee=Z),i.bindTexture(I,j||Ue[I]),pe.type=I,pe.texture=j)}function U(){const I=ie[ee];I!==void 0&&I.type!==void 0&&(i.bindTexture(I.type,null),I.type=void 0,I.texture=void 0)}function St(){try{i.compressedTexImage2D(...arguments)}catch(I){lt("WebGLState:",I)}}function tt(){try{i.compressedTexImage3D(...arguments)}catch(I){lt("WebGLState:",I)}}function mt(){try{i.texSubImage2D(...arguments)}catch(I){lt("WebGLState:",I)}}function _e(){try{i.texSubImage3D(...arguments)}catch(I){lt("WebGLState:",I)}}function At(){try{i.compressedTexSubImage2D(...arguments)}catch(I){lt("WebGLState:",I)}}function Ge(){try{i.compressedTexSubImage3D(...arguments)}catch(I){lt("WebGLState:",I)}}function We(){try{i.texStorage2D(...arguments)}catch(I){lt("WebGLState:",I)}}function A(){try{i.texStorage3D(...arguments)}catch(I){lt("WebGLState:",I)}}function y(){try{i.texImage2D(...arguments)}catch(I){lt("WebGLState:",I)}}function H(){try{i.texImage3D(...arguments)}catch(I){lt("WebGLState:",I)}}function oe(I){return f[I]!==void 0?f[I]:i.getParameter(I)}function ne(I,j){f[I]!==j&&(i.pixelStorei(I,j),f[I]=j)}function ue(I){K.equals(I)===!1&&(i.scissor(I.x,I.y,I.z,I.w),K.copy(I))}function ve(I){ge.equals(I)===!1&&(i.viewport(I.x,I.y,I.z,I.w),ge.copy(I))}function J(I,j){let Z=c.get(j);Z===void 0&&(Z=new WeakMap,c.set(j,Z));let pe=Z.get(I);pe===void 0&&(pe=i.getUniformBlockIndex(j,I.name),i.uniformBlockBinding(j,pe,pe),Z.set(I,pe))}function Q(I,j,Z){const ce=c.get(j).get(I);l[ce]!==Z&&(i.bindBufferBase(i.UNIFORM_BUFFER,ce,Z),l[ce]=Z)}function fe(){i.disable(i.BLEND),i.disable(i.CULL_FACE),i.disable(i.DEPTH_TEST),i.disable(i.POLYGON_OFFSET_FILL),i.disable(i.SCISSOR_TEST),i.disable(i.STENCIL_TEST),i.disable(i.SAMPLE_ALPHA_TO_COVERAGE),i.blendEquation(i.FUNC_ADD),i.blendFunc(i.ONE,i.ZERO),i.blendFuncSeparate(i.ONE,i.ZERO,i.ONE,i.ZERO),i.blendColor(0,0,0,0),i.colorMask(!0,!0,!0,!0),i.clearColor(0,0,0,0),i.depthMask(!0),i.depthFunc(i.LESS),a.setReversed(!1),i.clearDepth(1),i.stencilMask(4294967295),i.stencilFunc(i.ALWAYS,0,4294967295),i.stencilOp(i.KEEP,i.KEEP,i.KEEP),i.clearStencil(0),i.cullFace(i.BACK),i.frontFace(i.CCW),i.polygonOffset(0,0),i.activeTexture(i.TEXTURE0),i.bindFramebuffer(i.FRAMEBUFFER,null),i.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),i.bindFramebuffer(i.READ_FRAMEBUFFER,null),i.useProgram(null),i.lineWidth(1),i.scissor(0,0,i.canvas.width,i.canvas.height),i.viewport(0,0,i.canvas.width,i.canvas.height),i.pixelStorei(i.PACK_ALIGNMENT,4),i.pixelStorei(i.UNPACK_ALIGNMENT,4),i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,!1),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,i.BROWSER_DEFAULT_WEBGL),i.pixelStorei(i.PACK_ROW_LENGTH,0),i.pixelStorei(i.PACK_SKIP_PIXELS,0),i.pixelStorei(i.PACK_SKIP_ROWS,0),i.pixelStorei(i.UNPACK_ROW_LENGTH,0),i.pixelStorei(i.UNPACK_IMAGE_HEIGHT,0),i.pixelStorei(i.UNPACK_SKIP_PIXELS,0),i.pixelStorei(i.UNPACK_SKIP_ROWS,0),i.pixelStorei(i.UNPACK_SKIP_IMAGES,0),u={},f={},ee=null,ie={},d={},l={},h=new WeakMap,p=[],v=null,m=!1,g=null,x=null,M=null,S=null,w=null,T=null,_=null,b=new Ve(0,0,0),P=0,R=!1,C=null,F=null,V=null,D=null,z=null,K.set(0,0,i.canvas.width,i.canvas.height),ge.set(0,0,i.canvas.width,i.canvas.height),r.reset(),a.reset(),o.reset()}return{buffers:{color:r,depth:a,stencil:o},enable:Me,disable:Oe,bindFramebuffer:pt,drawBuffers:ze,useProgram:Ye,setBlending:he,setMaterial:q,setFlipSided:ae,setCullFace:re,setLineWidth:Be,setPolygonOffset:Ae,setScissorTest:$e,activeTexture:Je,bindTexture:et,unbindTexture:U,compressedTexImage2D:St,compressedTexImage3D:tt,texImage2D:y,texImage3D:H,pixelStorei:ne,getParameter:oe,updateUBOMapping:J,uniformBlockBinding:Q,texStorage2D:We,texStorage3D:A,texSubImage2D:mt,texSubImage3D:_e,compressedTexSubImage2D:At,compressedTexSubImage3D:Ge,scissor:ue,viewport:ve,reset:fe}}function Bg(i,e,t,n,s,r,a){const o=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),c=new Se,u=new WeakMap,f=new Set;let d;const h=new WeakMap,p=new Set,v=new FinalizationRegistry(A=>p.delete(A));let m=!1;try{m=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function g(A,y){return m?new OffscreenCanvas(A,y):cr("canvas")}function x(A,y,H){let oe=1;const ne=We(A);if((ne.width>H||ne.height>H)&&(oe=H/Math.max(ne.width,ne.height)),oe<1)if(typeof HTMLImageElement<"u"&&A instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&A instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&A instanceof ImageBitmap||typeof VideoFrame<"u"&&A instanceof VideoFrame){const ue=Math.floor(oe*ne.width),ve=Math.floor(oe*ne.height);d===void 0&&(d=g(ue,ve));const J=y?g(ue,ve):d;return J.width=ue,J.height=ve,J.getContext("2d").drawImage(A,0,0,ue,ve),He("WebGLRenderer: Texture has been resized from ("+ne.width+"x"+ne.height+") to ("+ue+"x"+ve+")."),J}else return"data"in A&&He("WebGLRenderer: Image in DataTexture is too big ("+ne.width+"x"+ne.height+")."),A;return A}function M(A){return A.generateMipmaps}function S(A){i.generateMipmap(A)}function w(A){return A.isWebGLCubeRenderTarget?i.TEXTURE_CUBE_MAP:A.isWebGL3DRenderTarget?i.TEXTURE_3D:A.isWebGLArrayRenderTarget||A.isCompressedArrayTexture?i.TEXTURE_2D_ARRAY:i.TEXTURE_2D}function T(A,y,H,oe,ne,ue=!1){if(A!==null){if(i[A]!==void 0)return i[A];He("WebGLRenderer: Attempt to use non-existing WebGL internal format '"+A+"'")}let ve;oe&&(ve=e.get("EXT_texture_norm16"),ve||He("WebGLRenderer: Unable to use normalized textures without EXT_texture_norm16 extension"));let J=y;if(y===i.RED&&(H===i.FLOAT&&(J=i.R32F),H===i.HALF_FLOAT&&(J=i.R16F),H===i.UNSIGNED_BYTE&&(J=i.R8),H===i.UNSIGNED_SHORT&&ve&&(J=ve.R16_EXT),H===i.SHORT&&ve&&(J=ve.R16_SNORM_EXT)),y===i.RED_INTEGER&&(H===i.UNSIGNED_BYTE&&(J=i.R8UI),H===i.UNSIGNED_SHORT&&(J=i.R16UI),H===i.UNSIGNED_INT&&(J=i.R32UI),H===i.BYTE&&(J=i.R8I),H===i.SHORT&&(J=i.R16I),H===i.INT&&(J=i.R32I)),y===i.RG&&(H===i.FLOAT&&(J=i.RG32F),H===i.HALF_FLOAT&&(J=i.RG16F),H===i.UNSIGNED_BYTE&&(J=i.RG8),H===i.UNSIGNED_SHORT&&ve&&(J=ve.RG16_EXT),H===i.SHORT&&ve&&(J=ve.RG16_SNORM_EXT)),y===i.RG_INTEGER&&(H===i.UNSIGNED_BYTE&&(J=i.RG8UI),H===i.UNSIGNED_SHORT&&(J=i.RG16UI),H===i.UNSIGNED_INT&&(J=i.RG32UI),H===i.BYTE&&(J=i.RG8I),H===i.SHORT&&(J=i.RG16I),H===i.INT&&(J=i.RG32I)),y===i.RGB_INTEGER&&(H===i.UNSIGNED_BYTE&&(J=i.RGB8UI),H===i.UNSIGNED_SHORT&&(J=i.RGB16UI),H===i.UNSIGNED_INT&&(J=i.RGB32UI),H===i.BYTE&&(J=i.RGB8I),H===i.SHORT&&(J=i.RGB16I),H===i.INT&&(J=i.RGB32I)),y===i.RGBA_INTEGER&&(H===i.UNSIGNED_BYTE&&(J=i.RGBA8UI),H===i.UNSIGNED_SHORT&&(J=i.RGBA16UI),H===i.UNSIGNED_INT&&(J=i.RGBA32UI),H===i.BYTE&&(J=i.RGBA8I),H===i.SHORT&&(J=i.RGBA16I),H===i.INT&&(J=i.RGBA32I)),y===i.RGB&&(H===i.UNSIGNED_SHORT&&ve&&(J=ve.RGB16_EXT),H===i.SHORT&&ve&&(J=ve.RGB16_SNORM_EXT),H===i.UNSIGNED_INT_5_9_9_9_REV&&(J=i.RGB9_E5),H===i.UNSIGNED_INT_10F_11F_11F_REV&&(J=i.R11F_G11F_B10F)),y===i.RGBA){const Q=ue?lr:rt.getTransfer(ne);H===i.FLOAT&&(J=i.RGBA32F),H===i.HALF_FLOAT&&(J=i.RGBA16F),H===i.UNSIGNED_BYTE&&(J=Q===dt?i.SRGB8_ALPHA8:i.RGBA8),H===i.UNSIGNED_SHORT&&ve&&(J=ve.RGBA16_EXT),H===i.SHORT&&ve&&(J=ve.RGBA16_SNORM_EXT),H===i.UNSIGNED_SHORT_4_4_4_4&&(J=i.RGBA4),H===i.UNSIGNED_SHORT_5_5_5_1&&(J=i.RGB5_A1)}return(J===i.R16F||J===i.R32F||J===i.RG16F||J===i.RG32F||J===i.RGBA16F||J===i.RGBA32F)&&e.get("EXT_color_buffer_float"),J}function _(A,y){let H;return A?y===null||y===wn||y===Fi?H=i.DEPTH24_STENCIL8:y===yn?H=i.DEPTH32F_STENCIL8:y===cs&&(H=i.DEPTH24_STENCIL8,He("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):y===null||y===wn||y===Fi?H=i.DEPTH_COMPONENT24:y===yn?H=i.DEPTH_COMPONENT32F:y===cs&&(H=i.DEPTH_COMPONENT16),H}function b(A,y){return M(A)===!0||A.isFramebufferTexture&&A.minFilter!==Ot&&A.minFilter!==Zt?Math.log2(Math.max(y.width,y.height))+1:A.mipmaps.length>0?A.mipmaps.length:A.isCompressedTexture&&Array.isArray(A.image)?y.mipmaps.length:1}function P(A){const y=new WeakRef(A);n.get(A).__ref=y,p.add(y),v.register(A,y,y)}function R(A){const y=n.get(A).__ref;y!==void 0&&(p.delete(y),v.unregister(y))}function C(A){V(A.target)}function F(A){D(A.target)}function V(A){A.removeEventListener("dispose",C),R(A),X(A),A.isVideoTexture&&u.delete(A),A.isHTMLTexture&&f.delete(A)}function D(A){A.removeEventListener("dispose",F),R(A),se(A)}function z(){for(const A of p){const y=A.deref();y!==void 0&&(y.isRenderTarget===!0?D(y):V(y))}p.clear(),f.clear()}function X(A){const y=n.get(A);if(y.__webglInit===void 0)return;const H=A.source,oe=h.get(H);if(oe){const ne=oe[y.__cacheKey];ne.usedTimes--,ne.usedTimes===0&&k(A),Object.keys(oe).length===0&&h.delete(H)}n.remove(A)}function k(A){const y=n.get(A);i.deleteTexture(y.__webglTexture);const H=A.source,oe=h.get(H);delete oe[y.__cacheKey],a.memory.textures--}function se(A){const y=n.get(A);y.__depthDisposeCallback&&y.__depthDisposeCallback();const H=A.depthTexture;if(H&&H.renderTarget===A&&V(H),A.isWebGLCubeRenderTarget)for(let ne=0;ne<6;ne++){if(Array.isArray(y.__webglFramebuffer[ne]))for(let ue=0;ue<y.__webglFramebuffer[ne].length;ue++)i.deleteFramebuffer(y.__webglFramebuffer[ne][ue]);else i.deleteFramebuffer(y.__webglFramebuffer[ne]);y.__webglDepthbuffer&&i.deleteRenderbuffer(y.__webglDepthbuffer[ne])}else{if(Array.isArray(y.__webglFramebuffer))for(let ne=0;ne<y.__webglFramebuffer.length;ne++)i.deleteFramebuffer(y.__webglFramebuffer[ne]);else i.deleteFramebuffer(y.__webglFramebuffer);if(y.__webglDepthbuffer&&i.deleteRenderbuffer(y.__webglDepthbuffer),y.__webglMultisampledFramebuffer&&i.deleteFramebuffer(y.__webglMultisampledFramebuffer),y.__webglColorRenderbuffer)for(let ne=0;ne<y.__webglColorRenderbuffer.length;ne++)y.__webglColorRenderbuffer[ne]&&i.deleteRenderbuffer(y.__webglColorRenderbuffer[ne]);y.__webglDepthRenderbuffer&&i.deleteRenderbuffer(y.__webglDepthRenderbuffer)}const oe=A.textures;for(let ne=0,ue=oe.length;ne<ue;ne++){const ve=n.get(oe[ne]);ve.__webglTexture&&(i.deleteTexture(ve.__webglTexture),a.memory.textures--),n.remove(oe[ne])}n.remove(A)}let $=0;function ee(){$=0}function ie(){return $}function we(A){$=A}function Fe(){const A=$;return A>=s.maxTextures&&He("WebGLTextures: Trying to use "+(A+1)+" texture units while this GPU supports only "+s.maxTextures),$+=1,A}function K(A){const y=[];return y.push(A.wrapS),y.push(A.wrapT),y.push(A.wrapR||0),y.push(A.magFilter),y.push(A.minFilter),y.push(A.anisotropy),y.push(A.internalFormat),y.push(A.format),y.push(A.type),y.push(A.generateMipmaps),y.push(A.mipmapsAutoUpdate),y.push(A.premultiplyAlpha),y.push(A.flipY),y.push(A.unpackAlignment),y.push(A.colorSpace),y.join()}function ge(A,y){const H=n.get(A);if(A.isVideoTexture&&At(A),A.isRenderTargetTexture===!1&&A.isExternalTexture!==!0&&A.version>0&&H.__version!==A.version){const oe=A.image;if(oe===null)He("WebGLRenderer: Texture marked for update but no image data found.");else if(oe.complete===!1)He("WebGLRenderer: Texture marked for update but image is incomplete");else{q(H,A,y);return}}else A.isExternalTexture&&(H.__webglTexture=A.sourceTexture?A.sourceTexture:null);t.bindTexture(i.TEXTURE_2D,H.__webglTexture,i.TEXTURE0+y)}function Te(A,y){const H=n.get(A);if(A.isRenderTargetTexture===!1&&A.version>0&&H.__version!==A.version){q(H,A,y);return}else A.isExternalTexture&&(H.__webglTexture=A.sourceTexture?A.sourceTexture:null);t.bindTexture(i.TEXTURE_2D_ARRAY,H.__webglTexture,i.TEXTURE0+y)}function Ue(A,y){const H=n.get(A);if(A.isRenderTargetTexture===!1&&A.version>0&&H.__version!==A.version){q(H,A,y);return}t.bindTexture(i.TEXTURE_3D,H.__webglTexture,i.TEXTURE0+y)}function Me(A,y){const H=n.get(A);if(A.version>0&&H.__version!==A.version){ae(H,A,y);return}t.bindTexture(i.TEXTURE_CUBE_MAP,H.__webglTexture,i.TEXTURE0+y)}const Oe={[ma]:i.REPEAT,[Un]:i.CLAMP_TO_EDGE,[ga]:i.MIRRORED_REPEAT},pt={[Ot]:i.NEAREST,[hu]:i.NEAREST_MIPMAP_NEAREST,[bs]:i.NEAREST_MIPMAP_LINEAR,[Zt]:i.LINEAR,[wr]:i.LINEAR_MIPMAP_NEAREST,[Zn]:i.LINEAR_MIPMAP_LINEAR},ze={[pu]:i.NEVER,[Lc]:i.ALWAYS,[mu]:i.LESS,[Cc]:i.LEQUAL,[gu]:i.EQUAL,[Pc]:i.GEQUAL,[_u]:i.GREATER,[vu]:i.NOTEQUAL};function Ye(A,y){if(y.type===yn&&e.has("OES_texture_float_linear")===!1&&(y.magFilter===Zt||y.magFilter===wr||y.magFilter===bs||y.magFilter===Zn||y.minFilter===Zt||y.minFilter===wr||y.minFilter===bs||y.minFilter===Zn)&&He("WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),i.texParameteri(A,i.TEXTURE_WRAP_S,Oe[y.wrapS]),i.texParameteri(A,i.TEXTURE_WRAP_T,Oe[y.wrapT]),(A===i.TEXTURE_3D||A===i.TEXTURE_2D_ARRAY)&&i.texParameteri(A,i.TEXTURE_WRAP_R,Oe[y.wrapR]),i.texParameteri(A,i.TEXTURE_MAG_FILTER,pt[y.magFilter]),i.texParameteri(A,i.TEXTURE_MIN_FILTER,pt[y.minFilter]),y.compareFunction&&(i.texParameteri(A,i.TEXTURE_COMPARE_MODE,i.COMPARE_REF_TO_TEXTURE),i.texParameteri(A,i.TEXTURE_COMPARE_FUNC,ze[y.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(y.magFilter===Ot||y.minFilter!==bs&&y.minFilter!==Zn||y.type===yn&&e.has("OES_texture_float_linear")===!1)return;if(y.anisotropy>1||n.get(y).__currentAnisotropy){const H=e.get("EXT_texture_filter_anisotropic");i.texParameterf(A,H.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(y.anisotropy,s.getMaxAnisotropy())),n.get(y).__currentAnisotropy=y.anisotropy}}}function Ke(A,y){let H=!1;A.__webglInit===void 0&&(A.__webglInit=!0,y.addEventListener("dispose",C),P(y));const oe=y.source;let ne=h.get(oe);ne===void 0&&(ne={},h.set(oe,ne));const ue=K(y);if(ue!==A.__cacheKey){ne[ue]===void 0&&(ne[ue]={texture:i.createTexture(),usedTimes:0},a.memory.textures++,H=!0),ne[ue].usedTimes++;const ve=ne[A.__cacheKey];ve!==void 0&&(ne[A.__cacheKey].usedTimes--,ve.usedTimes===0&&k(y)),A.__cacheKey=ue,A.__webglTexture=ne[ue].texture}return H}function te(A,y,H){return Math.floor(Math.floor(A/H)/y)}function he(A,y,H,oe){const ue=A.updateRanges;if(ue.length===0)t.texSubImage2D(i.TEXTURE_2D,0,0,0,y.width,y.height,H,oe,y.data);else{ue.sort((I,j)=>I.start-j.start);let ve=0;for(let I=1;I<ue.length;I++){const j=ue[ve],Z=ue[I],pe=j.start+j.count,ce=te(Z.start,y.width,4),de=te(j.start,y.width,4);Z.start<=pe+1&&ce===de&&te(Z.start+Z.count-1,y.width,4)===ce?j.count=Math.max(j.count,Z.start+Z.count-j.start):(++ve,ue[ve]=Z)}ue.length=ve+1;const J=t.getParameter(i.UNPACK_ROW_LENGTH),Q=t.getParameter(i.UNPACK_SKIP_PIXELS),fe=t.getParameter(i.UNPACK_SKIP_ROWS);t.pixelStorei(i.UNPACK_ROW_LENGTH,y.width);for(let I=0,j=ue.length;I<j;I++){const Z=ue[I],pe=Math.floor(Z.start/4),ce=Math.ceil(Z.count/4),de=pe%y.width,Ne=Math.floor(pe/y.width),Qe=ce,le=1;t.pixelStorei(i.UNPACK_SKIP_PIXELS,de),t.pixelStorei(i.UNPACK_SKIP_ROWS,Ne),t.texSubImage2D(i.TEXTURE_2D,0,de,Ne,Qe,le,H,oe,y.data)}A.clearUpdateRanges(),t.pixelStorei(i.UNPACK_ROW_LENGTH,J),t.pixelStorei(i.UNPACK_SKIP_PIXELS,Q),t.pixelStorei(i.UNPACK_SKIP_ROWS,fe)}}function q(A,y,H){let oe=i.TEXTURE_2D;(y.isDataArrayTexture||y.isCompressedArrayTexture)&&(oe=i.TEXTURE_2D_ARRAY),y.isData3DTexture&&(oe=i.TEXTURE_3D);const ne=Ke(A,y),ue=y.source;t.bindTexture(oe,A.__webglTexture,i.TEXTURE0+H);const ve=n.get(ue);if(ue.version!==ve.__version||ne===!0){if(t.activeTexture(i.TEXTURE0+H),(typeof ImageBitmap<"u"&&y.image instanceof ImageBitmap)===!1){const le=rt.getPrimaries(rt.workingColorSpace),ke=y.colorSpace===Kn?null:rt.getPrimaries(y.colorSpace),Ze=y.colorSpace===Kn||le===ke?i.NONE:i.BROWSER_DEFAULT_WEBGL;t.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,y.flipY),t.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,y.premultiplyAlpha),t.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,Ze)}t.pixelStorei(i.UNPACK_ALIGNMENT,y.unpackAlignment);let Q=x(y.image,!1,s.maxTextureSize);Q=Ge(y,Q);const fe=r.convert(y.format,y.colorSpace),I=r.convert(y.type);let j=T(y.internalFormat,fe,I,y.normalized,y.colorSpace,y.isVideoTexture);Ye(oe,y);let Z;const pe=y.mipmaps,ce=y.isVideoTexture!==!0,de=ve.__version===void 0||ne===!0,Ne=ue.dataReady,Qe=b(y,Q);if(y.isDepthTexture)j=_(y.format===Jn,y.type),de&&(ce?t.texStorage2D(i.TEXTURE_2D,1,j,Q.width,Q.height):t.texImage2D(i.TEXTURE_2D,0,j,Q.width,Q.height,0,fe,I,null));else if(y.isDataTexture)if(pe.length>0){ce&&de&&t.texStorage2D(i.TEXTURE_2D,Qe,j,pe[0].width,pe[0].height);for(let le=0,ke=pe.length;le<ke;le++)Z=pe[le],ce?Ne&&t.texSubImage2D(i.TEXTURE_2D,le,0,0,Z.width,Z.height,fe,I,Z.data):t.texImage2D(i.TEXTURE_2D,le,j,Z.width,Z.height,0,fe,I,Z.data);y.generateMipmaps=!1}else ce?(de&&t.texStorage2D(i.TEXTURE_2D,Qe,j,Q.width,Q.height),Ne&&he(y,Q,fe,I)):t.texImage2D(i.TEXTURE_2D,0,j,Q.width,Q.height,0,fe,I,Q.data);else if(y.isCompressedTexture)if(y.isCompressedArrayTexture){ce&&de&&t.texStorage3D(i.TEXTURE_2D_ARRAY,Qe,j,pe[0].width,pe[0].height,Q.depth);for(let le=0,ke=pe.length;le<ke;le++)if(Z=pe[le],y.format!==En)if(fe!==null)if(ce){if(Ne)if(y.layerUpdates.size>0){const Ze=Tl(Z.width,Z.height,y.format,y.type);for(const ye of y.layerUpdates){const ut=Z.data.subarray(ye*Ze/Z.data.BYTES_PER_ELEMENT,(ye+1)*Ze/Z.data.BYTES_PER_ELEMENT);t.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,le,0,0,ye,Z.width,Z.height,1,fe,ut)}}else t.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,le,0,0,0,Z.width,Z.height,Q.depth,fe,Z.data)}else t.compressedTexImage3D(i.TEXTURE_2D_ARRAY,le,j,Z.width,Z.height,Q.depth,0,Z.data,0,0);else He("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else ce?Ne&&t.texSubImage3D(i.TEXTURE_2D_ARRAY,le,0,0,0,Z.width,Z.height,Q.depth,fe,I,Z.data):t.texImage3D(i.TEXTURE_2D_ARRAY,le,j,Z.width,Z.height,Q.depth,0,fe,I,Z.data);y.layerUpdates.size>0&&y.clearLayerUpdates()}else{ce&&de&&t.texStorage2D(i.TEXTURE_2D,Qe,j,pe[0].width,pe[0].height);for(let le=0,ke=pe.length;le<ke;le++)Z=pe[le],y.format!==En?fe!==null?ce?Ne&&t.compressedTexSubImage2D(i.TEXTURE_2D,le,0,0,Z.width,Z.height,fe,Z.data):t.compressedTexImage2D(i.TEXTURE_2D,le,j,Z.width,Z.height,0,Z.data):He("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):ce?Ne&&t.texSubImage2D(i.TEXTURE_2D,le,0,0,Z.width,Z.height,fe,I,Z.data):t.texImage2D(i.TEXTURE_2D,le,j,Z.width,Z.height,0,fe,I,Z.data)}else if(y.isDataArrayTexture)if(ce){if(de&&t.texStorage3D(i.TEXTURE_2D_ARRAY,Qe,j,Q.width,Q.height,Q.depth),Ne)if(y.layerUpdates.size>0){const le=Tl(Q.width,Q.height,y.format,y.type);for(const ke of y.layerUpdates){const Ze=Q.data.subarray(ke*le/Q.data.BYTES_PER_ELEMENT,(ke+1)*le/Q.data.BYTES_PER_ELEMENT);t.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,ke,Q.width,Q.height,1,fe,I,Ze)}y.clearLayerUpdates()}else t.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,0,Q.width,Q.height,Q.depth,fe,I,Q.data)}else t.texImage3D(i.TEXTURE_2D_ARRAY,0,j,Q.width,Q.height,Q.depth,0,fe,I,Q.data);else if(y.isData3DTexture)ce?(de&&t.texStorage3D(i.TEXTURE_3D,Qe,j,Q.width,Q.height,Q.depth),Ne&&t.texSubImage3D(i.TEXTURE_3D,0,0,0,0,Q.width,Q.height,Q.depth,fe,I,Q.data)):t.texImage3D(i.TEXTURE_3D,0,j,Q.width,Q.height,Q.depth,0,fe,I,Q.data);else if(y.isFramebufferTexture){if(de)if(ce)t.texStorage2D(i.TEXTURE_2D,Qe,j,Q.width,Q.height);else{let le=Q.width,ke=Q.height;for(let Ze=0;Ze<Qe;Ze++)t.texImage2D(i.TEXTURE_2D,Ze,j,le,ke,0,fe,I,null),le>>=1,ke>>=1}}else if(y.isHTMLTexture){if("texElementImage2D"in i){const le=i.canvas;if(le.hasAttribute("layoutsubtree")||le.setAttribute("layoutsubtree","true"),Q.parentNode!==le){le.appendChild(Q),f.add(y),le.onpaint=ke=>{const Ze=ke.changedElements;for(const ye of f)Ze.includes(ye.image)&&(ye.needsUpdate=!0)},le.requestPaint();return}if(i.texElementImage2D.length===3)i.texElementImage2D(i.TEXTURE_2D,i.RGBA8,Q);else{const Ze=i.RGBA,ye=i.RGBA,ut=i.UNSIGNED_BYTE;i.texElementImage2D(i.TEXTURE_2D,0,Ze,ye,ut,Q)}i.texParameteri(i.TEXTURE_2D,i.TEXTURE_MIN_FILTER,i.LINEAR),i.texParameteri(i.TEXTURE_2D,i.TEXTURE_WRAP_S,i.CLAMP_TO_EDGE),i.texParameteri(i.TEXTURE_2D,i.TEXTURE_WRAP_T,i.CLAMP_TO_EDGE)}}else if(pe.length>0){if(ce&&de){const le=We(pe[0]);t.texStorage2D(i.TEXTURE_2D,Qe,j,le.width,le.height)}for(let le=0,ke=pe.length;le<ke;le++)Z=pe[le],ce?Ne&&t.texSubImage2D(i.TEXTURE_2D,le,0,0,fe,I,Z):t.texImage2D(i.TEXTURE_2D,le,j,fe,I,Z);y.generateMipmaps=!1}else if(ce){if(de){const le=We(Q);t.texStorage2D(i.TEXTURE_2D,Qe,j,le.width,le.height)}Ne&&t.texSubImage2D(i.TEXTURE_2D,0,0,0,fe,I,Q)}else t.texImage2D(i.TEXTURE_2D,0,j,fe,I,Q);M(y)&&y.mipmapsAutoUpdate===!0&&S(oe),ve.__version=ue.version,y.onUpdate&&y.onUpdate(y)}A.__version=y.version}function ae(A,y,H){if(y.image.length!==6)return;const oe=Ke(A,y),ne=y.source;t.bindTexture(i.TEXTURE_CUBE_MAP,A.__webglTexture,i.TEXTURE0+H);const ue=n.get(ne);if(ne.version!==ue.__version||oe===!0){t.activeTexture(i.TEXTURE0+H);const ve=rt.getPrimaries(rt.workingColorSpace),J=y.colorSpace===Kn?null:rt.getPrimaries(y.colorSpace),Q=y.colorSpace===Kn||ve===J?i.NONE:i.BROWSER_DEFAULT_WEBGL;t.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,y.flipY),t.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,y.premultiplyAlpha),t.pixelStorei(i.UNPACK_ALIGNMENT,y.unpackAlignment),t.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,Q);const fe=y.isCompressedTexture||y.image[0].isCompressedTexture,I=y.image[0]&&y.image[0].isDataTexture,j=[];for(let ye=0;ye<6;ye++)!fe&&!I?j[ye]=x(y.image[ye],!0,s.maxCubemapSize):j[ye]=I?y.image[ye].image:y.image[ye],j[ye]=Ge(y,j[ye]);const Z=j[0],pe=r.convert(y.format,y.colorSpace),ce=r.convert(y.type);let de=T(y.internalFormat,pe,ce,y.normalized,y.colorSpace);const Ne=y.isVideoTexture!==!0,Qe=ue.__version===void 0||oe===!0,le=ne.dataReady;let ke=b(y,Z);Ye(i.TEXTURE_CUBE_MAP,y);let Ze;if(y.isDepthTexture){if(de=_(y.format===Jn,y.type),Qe)if(Ne)t.texStorage2D(i.TEXTURE_CUBE_MAP,1,de,Z.width,Z.height);else for(let ye=0;ye<6;ye++)t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ye,0,de,Z.width,Z.height,0,pe,ce,null)}else if(fe){Ne&&Qe&&t.texStorage2D(i.TEXTURE_CUBE_MAP,ke,de,Z.width,Z.height);for(let ye=0;ye<6;ye++){Ze=j[ye].mipmaps;for(let ut=0;ut<Ze.length;ut++){const Dt=Ze[ut];y.format!==En?pe!==null?Ne?le&&t.compressedTexSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ye,ut,0,0,Dt.width,Dt.height,pe,Dt.data):t.compressedTexImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ye,ut,de,Dt.width,Dt.height,0,Dt.data):He("WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):Ne?le&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ye,ut,0,0,Dt.width,Dt.height,pe,ce,Dt.data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ye,ut,de,Dt.width,Dt.height,0,pe,ce,Dt.data)}}}else{if(Ze=y.mipmaps,Ne&&Qe){Ze.length>0&&ke++;const ye=We(j[0]);t.texStorage2D(i.TEXTURE_CUBE_MAP,ke,de,ye.width,ye.height)}for(let ye=0;ye<6;ye++)if(I){Ne?le&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ye,0,0,0,j[ye].width,j[ye].height,pe,ce,j[ye].data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ye,0,de,j[ye].width,j[ye].height,0,pe,ce,j[ye].data);for(let ut=0;ut<Ze.length;ut++){const Gn=Ze[ut].image[ye].image;Ne?le&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ye,ut+1,0,0,Gn.width,Gn.height,pe,ce,Gn.data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ye,ut+1,de,Gn.width,Gn.height,0,pe,ce,Gn.data)}}else{Ne?le&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ye,0,0,0,pe,ce,j[ye]):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ye,0,de,pe,ce,j[ye]);for(let ut=0;ut<Ze.length;ut++){const Dt=Ze[ut];Ne?le&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ye,ut+1,0,0,pe,ce,Dt.image[ye]):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ye,ut+1,de,pe,ce,Dt.image[ye])}}}M(y)&&y.mipmapsAutoUpdate===!0&&S(i.TEXTURE_CUBE_MAP),ue.__version=ne.version,y.onUpdate&&y.onUpdate(y)}A.__version=y.version}function re(A,y,H,oe,ne,ue){const ve=r.convert(H.format,H.colorSpace),J=r.convert(H.type),Q=T(H.internalFormat,ve,J,H.normalized,H.colorSpace),fe=n.get(y),I=n.get(H);if(I.__renderTarget=y,!fe.__hasExternalTextures){const j=Math.max(1,y.width>>ue),Z=Math.max(1,y.height>>ue);ne===i.TEXTURE_3D||ne===i.TEXTURE_2D_ARRAY?t.texImage3D(ne,ue,Q,j,Z,y.depth,0,ve,J,null):t.texImage2D(ne,ue,Q,j,Z,0,ve,J,null)}t.bindFramebuffer(i.FRAMEBUFFER,A),_e(y)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,oe,ne,I.__webglTexture,0,mt(y)):(ne===i.TEXTURE_2D||ne>=i.TEXTURE_CUBE_MAP_POSITIVE_X&&ne<=i.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&i.framebufferTexture2D(i.FRAMEBUFFER,oe,ne,I.__webglTexture,ue),t.bindFramebuffer(i.FRAMEBUFFER,null)}function Be(A,y,H){if(i.bindRenderbuffer(i.RENDERBUFFER,A),y.depthBuffer){const oe=y.depthTexture,ne=oe&&oe.isDepthTexture?oe.type:null,ue=_(y.stencilBuffer,ne),ve=y.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;_e(y)?o.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,mt(y),ue,y.width,y.height):H?i.renderbufferStorageMultisample(i.RENDERBUFFER,mt(y),ue,y.width,y.height):i.renderbufferStorage(i.RENDERBUFFER,ue,y.width,y.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,ve,i.RENDERBUFFER,A)}else{const oe=y.textures;for(let ne=0;ne<oe.length;ne++){const ue=oe[ne],ve=r.convert(ue.format,ue.colorSpace),J=r.convert(ue.type),Q=T(ue.internalFormat,ve,J,ue.normalized,ue.colorSpace);_e(y)?o.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,mt(y),Q,y.width,y.height):H?i.renderbufferStorageMultisample(i.RENDERBUFFER,mt(y),Q,y.width,y.height):i.renderbufferStorage(i.RENDERBUFFER,Q,y.width,y.height)}}i.bindRenderbuffer(i.RENDERBUFFER,null)}function Ae(A,y,H){const oe=y.isWebGLCubeRenderTarget===!0;if(t.bindFramebuffer(i.FRAMEBUFFER,A),!(y.depthTexture&&y.depthTexture.isDepthTexture))throw new Error("THREE.WebGLTextures: renderTarget.depthTexture must be an instance of THREE.DepthTexture.");const ne=n.get(y.depthTexture);ne.__renderTarget=y;const ue=oe?y.depthTexture.image[0]:y.depthTexture.image;(!ne.__webglTexture||ue.width!==y.width||ue.height!==y.height)&&(ue.width=y.width,ue.height=y.height,y.depthTexture.needsUpdate=!0),oe?Me(y.depthTexture,0):ge(y.depthTexture,0);const ve=ne.__webglTexture,J=mt(y),Q=oe?i.TEXTURE_CUBE_MAP_POSITIVE_X+H:i.TEXTURE_2D,fe=y.depthTexture.format===Jn?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;if(y.depthTexture.format===jn)_e(y)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,fe,Q,ve,0,J):i.framebufferTexture2D(i.FRAMEBUFFER,fe,Q,ve,0);else if(y.depthTexture.format===Jn)_e(y)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,fe,Q,ve,0,J):i.framebufferTexture2D(i.FRAMEBUFFER,fe,Q,ve,0);else throw new Error("THREE.WebGLTextures: Unknown depthTexture format.")}function $e(A){const y=n.get(A),H=A.isWebGLCubeRenderTarget===!0;if(y.__boundDepthTexture!==A.depthTexture){const oe=A.depthTexture;if(y.__depthDisposeCallback&&y.__depthDisposeCallback(),oe){const ne=()=>{delete y.__boundDepthTexture,delete y.__depthDisposeCallback,oe.removeEventListener("dispose",ne)};oe.addEventListener("dispose",ne),y.__depthDisposeCallback=ne}y.__boundDepthTexture=oe}if(A.depthTexture&&!y.__autoAllocateDepthBuffer)if(H)for(let oe=0;oe<6;oe++)Ae(y.__webglFramebuffer[oe],A,oe);else A.texture.mipmaps.length>0?Ae(y.__webglFramebuffer[0],A,0):Ae(y.__webglFramebuffer,A,0);else if(H){y.__webglDepthbuffer=[];for(let oe=0;oe<6;oe++)if(t.bindFramebuffer(i.FRAMEBUFFER,y.__webglFramebuffer[oe]),y.__webglDepthbuffer[oe]===void 0)y.__webglDepthbuffer[oe]=i.createRenderbuffer(),Be(y.__webglDepthbuffer[oe],A,!1);else{const ne=A.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,ue=y.__webglDepthbuffer[oe];i.bindRenderbuffer(i.RENDERBUFFER,ue),i.framebufferRenderbuffer(i.FRAMEBUFFER,ne,i.RENDERBUFFER,ue)}}else if(A.texture.mipmaps.length>0?t.bindFramebuffer(i.FRAMEBUFFER,y.__webglFramebuffer[0]):t.bindFramebuffer(i.FRAMEBUFFER,y.__webglFramebuffer),y.__webglDepthbuffer===void 0)y.__webglDepthbuffer=i.createRenderbuffer(),Be(y.__webglDepthbuffer,A,!1);else{const ne=A.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,ue=y.__webglDepthbuffer;i.bindRenderbuffer(i.RENDERBUFFER,ue),i.framebufferRenderbuffer(i.FRAMEBUFFER,ne,i.RENDERBUFFER,ue)}t.bindFramebuffer(i.FRAMEBUFFER,null)}function Je(A,y,H){const oe=n.get(A);y!==void 0&&re(oe.__webglFramebuffer,A,A.texture,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,0),H!==void 0&&$e(A)}function et(A){const y=A.texture,H=n.get(A),oe=n.get(y);A.addEventListener("dispose",F),P(A);const ne=A.textures,ue=A.isWebGLCubeRenderTarget===!0,ve=ne.length>1;if(ve||(oe.__webglTexture===void 0&&(oe.__webglTexture=i.createTexture()),oe.__version=y.version,a.memory.textures++),ue){H.__webglFramebuffer=[];for(let J=0;J<6;J++)if(y.mipmaps.length>0){H.__webglFramebuffer[J]=[];for(let Q=0;Q<y.mipmaps.length;Q++)H.__webglFramebuffer[J][Q]=i.createFramebuffer()}else H.__webglFramebuffer[J]=i.createFramebuffer()}else{if(y.mipmaps.length>0){H.__webglFramebuffer=[];for(let J=0;J<y.mipmaps.length;J++)H.__webglFramebuffer[J]=i.createFramebuffer()}else H.__webglFramebuffer=i.createFramebuffer();if(ve)for(let J=0,Q=ne.length;J<Q;J++){const fe=n.get(ne[J]);fe.__webglTexture===void 0&&(fe.__webglTexture=i.createTexture(),a.memory.textures++)}if(A.samples>0&&_e(A)===!1){H.__webglMultisampledFramebuffer=i.createFramebuffer(),H.__webglColorRenderbuffer=[],t.bindFramebuffer(i.FRAMEBUFFER,H.__webglMultisampledFramebuffer);for(let J=0;J<ne.length;J++){const Q=ne[J];H.__webglColorRenderbuffer[J]=i.createRenderbuffer(),i.bindRenderbuffer(i.RENDERBUFFER,H.__webglColorRenderbuffer[J]);const fe=r.convert(Q.format,Q.colorSpace),I=r.convert(Q.type),j=T(Q.internalFormat,fe,I,Q.normalized,Q.colorSpace,A.isXRRenderTarget===!0),Z=mt(A);i.renderbufferStorageMultisample(i.RENDERBUFFER,Z,j,A.width,A.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+J,i.RENDERBUFFER,H.__webglColorRenderbuffer[J])}i.bindRenderbuffer(i.RENDERBUFFER,null),A.depthBuffer&&(H.__webglDepthRenderbuffer=i.createRenderbuffer(),Be(H.__webglDepthRenderbuffer,A,!0)),t.bindFramebuffer(i.FRAMEBUFFER,null)}}if(ue){t.bindTexture(i.TEXTURE_CUBE_MAP,oe.__webglTexture),Ye(i.TEXTURE_CUBE_MAP,y);for(let J=0;J<6;J++)if(y.mipmaps.length>0)for(let Q=0;Q<y.mipmaps.length;Q++)re(H.__webglFramebuffer[J][Q],A,y,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+J,Q);else re(H.__webglFramebuffer[J],A,y,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+J,0);M(y)?S(i.TEXTURE_CUBE_MAP):y.mipmaps.length>0&&i.texParameteri(i.TEXTURE_CUBE_MAP,i.TEXTURE_MAX_LEVEL,y.mipmaps.length-1),t.unbindTexture()}else if(ve){for(let J=0,Q=ne.length;J<Q;J++){const fe=ne[J],I=n.get(fe);let j=i.TEXTURE_2D;(A.isWebGL3DRenderTarget||A.isWebGLArrayRenderTarget)&&(j=A.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),t.bindTexture(j,I.__webglTexture),Ye(j,fe),re(H.__webglFramebuffer,A,fe,i.COLOR_ATTACHMENT0+J,j,0),M(fe)&&S(j)}t.unbindTexture()}else{let J=i.TEXTURE_2D;if((A.isWebGL3DRenderTarget||A.isWebGLArrayRenderTarget)&&(J=A.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),t.bindTexture(J,oe.__webglTexture),Ye(J,y),y.mipmaps.length>0)for(let Q=0;Q<y.mipmaps.length;Q++)re(H.__webglFramebuffer[Q],A,y,i.COLOR_ATTACHMENT0,J,Q);else re(H.__webglFramebuffer,A,y,i.COLOR_ATTACHMENT0,J,0);M(y)?S(J):y.mipmaps.length>0&&i.texParameteri(J,i.TEXTURE_MAX_LEVEL,y.mipmaps.length-1),t.unbindTexture()}A.depthBuffer&&$e(A)}function U(A){const y=A.textures;for(let H=0,oe=y.length;H<oe;H++){const ne=y[H];if(M(ne)&&ne.mipmapsAutoUpdate===!0){const ue=w(A),ve=n.get(ne).__webglTexture;t.bindTexture(ue,ve),S(ue),t.unbindTexture()}}}const St=[];function tt(A){if(A.samples>0){if(_e(A)===!1){const y=A.textures,H=A.width,oe=A.height;let ne=i.COLOR_BUFFER_BIT;const ue=A.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,ve=n.get(A),J=y.length>1;if(J)for(let fe=0;fe<y.length;fe++)t.bindFramebuffer(i.FRAMEBUFFER,ve.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+fe,i.RENDERBUFFER,null),t.bindFramebuffer(i.FRAMEBUFFER,ve.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+fe,i.TEXTURE_2D,null,0);t.bindFramebuffer(i.READ_FRAMEBUFFER,ve.__webglMultisampledFramebuffer),A.texture.mipmaps.length>0?t.bindFramebuffer(i.DRAW_FRAMEBUFFER,ve.__webglFramebuffer[0]):t.bindFramebuffer(i.DRAW_FRAMEBUFFER,ve.__webglFramebuffer);for(let fe=0;fe<y.length;fe++){if(A.resolveDepthBuffer&&(A.depthBuffer&&(ne|=i.DEPTH_BUFFER_BIT),A.stencilBuffer&&A.resolveStencilBuffer&&(ne|=i.STENCIL_BUFFER_BIT)),J){i.framebufferRenderbuffer(i.READ_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.RENDERBUFFER,ve.__webglColorRenderbuffer[fe]);const I=n.get(y[fe]).__webglTexture;i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,I,0)}i.blitFramebuffer(0,0,H,oe,0,0,H,oe,ne,i.NEAREST),l===!0&&(St.length=0,St.push(i.COLOR_ATTACHMENT0+fe),A.depthBuffer&&A.storeMultisampledDepthBuffer===!1&&St.push(ue),i.invalidateFramebuffer(i.READ_FRAMEBUFFER,St))}if(t.bindFramebuffer(i.READ_FRAMEBUFFER,null),t.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),J)for(let fe=0;fe<y.length;fe++){t.bindFramebuffer(i.FRAMEBUFFER,ve.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+fe,i.RENDERBUFFER,ve.__webglColorRenderbuffer[fe]);const I=n.get(y[fe]).__webglTexture;t.bindFramebuffer(i.FRAMEBUFFER,ve.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+fe,i.TEXTURE_2D,I,0)}t.bindFramebuffer(i.DRAW_FRAMEBUFFER,ve.__webglMultisampledFramebuffer)}else if(A.depthBuffer&&A.storeMultisampledDepthBuffer===!1&&l){const y=A.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,[y])}}}function mt(A){return Math.min(s.maxSamples,A.samples)}function _e(A){const y=n.get(A);return A.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&y.__useRenderToTexture!==!1}function At(A){const y=a.render.frame;u.get(A)!==y&&(u.set(A,y),A.update())}function Ge(A,y){const H=A.colorSpace,oe=A.format,ne=A.type;return A.isCompressedTexture===!0||A.isVideoTexture===!0||H!==or&&H!==Kn&&(rt.getTransfer(H)===dt?(oe!==En||ne!==nn)&&He("WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):lt("WebGLTextures: Unsupported texture color space:",H)),y}function We(A){return typeof HTMLImageElement<"u"&&A instanceof HTMLImageElement?(c.width=A.naturalWidth||A.width,c.height=A.naturalHeight||A.height):typeof VideoFrame<"u"&&A instanceof VideoFrame?(c.width=A.displayWidth,c.height=A.displayHeight):(c.width=A.width,c.height=A.height),c}this.allocateTextureUnit=Fe,this.resetTextureUnits=ee,this.getTextureUnits=ie,this.setTextureUnits=we,this.setTexture2D=ge,this.setTexture2DArray=Te,this.setTexture3D=Ue,this.setTextureCube=Me,this.rebindTextures=Je,this.setupRenderTarget=et,this.updateRenderTargetMipmap=U,this.updateMultisampleRenderTarget=tt,this.setupDepthRenderbuffer=$e,this.setupFrameBufferTexture=re,this.useMultisampledRTT=_e,this.dispose=z}function kg(i,e){function t(n,s=Kn){let r;const a=rt.getTransfer(s);if(n===nn)return i.UNSIGNED_BYTE;if(n===io)return i.UNSIGNED_SHORT_4_4_4_4;if(n===so)return i.UNSIGNED_SHORT_5_5_5_1;if(n===bc)return i.UNSIGNED_INT_5_9_9_9_REV;if(n===wc)return i.UNSIGNED_INT_10F_11F_11F_REV;if(n===yc)return i.BYTE;if(n===Ec)return i.SHORT;if(n===cs)return i.UNSIGNED_SHORT;if(n===no)return i.INT;if(n===wn)return i.UNSIGNED_INT;if(n===yn)return i.FLOAT;if(n===Tn)return i.HALF_FLOAT;if(n===Tc)return i.ALPHA;if(n===Ac)return i.RGB;if(n===En)return i.RGBA;if(n===jn)return i.DEPTH_COMPONENT;if(n===Jn)return i.DEPTH_STENCIL;if(n===Rc)return i.RED;if(n===ro)return i.RED_INTEGER;if(n===ui)return i.RG;if(n===ao)return i.RG_INTEGER;if(n===oo)return i.RGBA_INTEGER;if(n===Qs||n===js||n===er||n===tr)if(a===dt)if(r=e.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(n===Qs)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===js)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===er)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===tr)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=e.get("WEBGL_compressed_texture_s3tc"),r!==null){if(n===Qs)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===js)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===er)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===tr)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(n===_a||n===va||n===xa||n===Ma)if(r=e.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(n===_a)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===va)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===xa)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===Ma)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(n===Sa||n===ya||n===Ea||n===ba||n===wa||n===rr||n===Ta)if(r=e.get("WEBGL_compressed_texture_etc"),r!==null){if(n===Sa||n===ya)return a===dt?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(n===Ea)return a===dt?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC;if(n===ba)return r.COMPRESSED_R11_EAC;if(n===wa)return r.COMPRESSED_SIGNED_R11_EAC;if(n===rr)return r.COMPRESSED_RG11_EAC;if(n===Ta)return r.COMPRESSED_SIGNED_RG11_EAC}else return null;if(n===Aa||n===Ra||n===Ca||n===Pa||n===La||n===Da||n===Ia||n===Na||n===Ua||n===Fa||n===Oa||n===Ba||n===ka||n===za)if(r=e.get("WEBGL_compressed_texture_astc"),r!==null){if(n===Aa)return a===dt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===Ra)return a===dt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===Ca)return a===dt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===Pa)return a===dt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===La)return a===dt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===Da)return a===dt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===Ia)return a===dt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===Na)return a===dt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===Ua)return a===dt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===Fa)return a===dt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===Oa)return a===dt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===Ba)return a===dt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===ka)return a===dt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===za)return a===dt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(n===Ga||n===Ha||n===Va)if(r=e.get("EXT_texture_compression_bptc"),r!==null){if(n===Ga)return a===dt?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===Ha)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===Va)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(n===Wa||n===Xa||n===ar||n===qa)if(r=e.get("EXT_texture_compression_rgtc"),r!==null){if(n===Wa)return r.COMPRESSED_RED_RGTC1_EXT;if(n===Xa)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===ar)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===qa)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return n===Fi?i.UNSIGNED_INT_24_8:i[n]!==void 0?i[n]:null}return{convert:t}}const zg=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,Gg=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`;class Hg{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t){if(this.texture===null){const n=new Wc(e.texture);(e.depthNear!==t.depthNear||e.depthFar!==t.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=n}}getMesh(e){if(this.texture!==null&&this.mesh===null){const t=e.cameras[0].viewport,n=new fi({vertexShader:zg,fragmentShader:Gg,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new kt(new gr(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}}class Vg extends pi{constructor(e,t){super();const n=this;let s=null,r=1,a=null,o="local-floor",l=1,c=null,u=null,f=null,d=null,h=null,p=null;const v=typeof XRWebGLBinding<"u",m=new Hg,g={},x=t.getContextAttributes();let M=null,S=null;const w=[],T=[],_=new Se;let b=null,P=null;const R=new dn;R.viewport=new bt;const C=new dn;C.viewport=new bt;const F=[R,C],V=new ef;let D=null,z=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(K){let ge=w[K];return ge===void 0&&(ge=new Dr,w[K]=ge),ge.getTargetRaySpace()},this.getControllerGrip=function(K){let ge=w[K];return ge===void 0&&(ge=new Dr,w[K]=ge),ge.getGripSpace()},this.getHand=function(K){let ge=w[K];return ge===void 0&&(ge=new Dr,w[K]=ge),ge.getHandSpace()};function X(K){const ge=T.indexOf(K.inputSource);if(ge===-1)return;const Te=w[ge];Te!==void 0&&(Te.update(K.inputSource,K.frame,c||a),Te.dispatchEvent({type:K.type,data:K.inputSource}))}function k(){s.removeEventListener("select",X),s.removeEventListener("selectstart",X),s.removeEventListener("selectend",X),s.removeEventListener("squeeze",X),s.removeEventListener("squeezestart",X),s.removeEventListener("squeezeend",X),s.removeEventListener("end",k),s.removeEventListener("inputsourceschange",se);for(let K=0;K<w.length;K++){const ge=T[K];ge!==null&&(T[K]=null,w[K].disconnect(ge))}D=null,z=null,m.reset();for(const K in g)delete g[K];if(e.setRenderTarget(M),h=null,d=null,f=null,s=null,S=null,Fe.stop(),n.isPresenting=!1,e.setPixelRatio(b),e.setSize(_.width,_.height,!1),P!==null){const K=P.camera;K.fov=P.fov,K.zoom=P.zoom,K.updateProjectionMatrix(),P=null}n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(K){r=K,n.isPresenting===!0&&He("WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(K){o=K,n.isPresenting===!0&&He("WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||a},this.setReferenceSpace=function(K){c=K},this.getBaseLayer=function(){return d!==null?d:h},this.getBinding=function(){return f===null&&v&&(f=new XRWebGLBinding(s,t)),f},this.getFrame=function(){return p},this.getSession=function(){return s},this.setSession=async function(K){if(s=K,s!==null){if(M=e.getRenderTarget(),s.addEventListener("select",X),s.addEventListener("selectstart",X),s.addEventListener("selectend",X),s.addEventListener("squeeze",X),s.addEventListener("squeezestart",X),s.addEventListener("squeezeend",X),s.addEventListener("end",k),s.addEventListener("inputsourceschange",se),x.xrCompatible!==!0&&await t.makeXRCompatible(),b=e.getPixelRatio(),e.getSize(_),v&&"createProjectionLayer"in XRWebGLBinding.prototype){let Te=null,Ue=null,Me=null;x.depth&&(Me=x.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,Te=x.stencil?Jn:jn,Ue=x.stencil?Fi:wn);const Oe={colorFormat:t.RGBA8,depthFormat:Me,scaleFactor:r};f=this.getBinding(),d=f.createProjectionLayer(Oe),s.updateRenderState({layers:[d]}),e.setPixelRatio(1),e.setSize(d.textureWidth,d.textureHeight,!1),S=new bn(d.textureWidth,d.textureHeight,{format:En,type:nn,depthTexture:new Oi(d.textureWidth,d.textureHeight,Ue,void 0,void 0,void 0,void 0,void 0,void 0,Te),stencilBuffer:x.stencil,colorSpace:e.outputColorSpace,samples:x.antialias?4:0,resolveDepthBuffer:d.ignoreDepthValues===!1,resolveStencilBuffer:d.ignoreDepthValues===!1,storeMultisampledDepthBuffer:d.ignoreDepthValues===!1,storeMultisampledStencilBuffer:d.ignoreDepthValues===!1})}else{const Te={antialias:x.antialias,alpha:!0,depth:x.depth,stencil:x.stencil,framebufferScaleFactor:r};h=new XRWebGLLayer(s,t,Te),s.updateRenderState({baseLayer:h}),e.setPixelRatio(1),e.setSize(h.framebufferWidth,h.framebufferHeight,!1),S=new bn(h.framebufferWidth,h.framebufferHeight,{format:En,type:nn,colorSpace:e.outputColorSpace,stencilBuffer:x.stencil,resolveDepthBuffer:h.ignoreDepthValues===!1,resolveStencilBuffer:h.ignoreDepthValues===!1,storeMultisampledDepthBuffer:h.ignoreDepthValues===!1,storeMultisampledStencilBuffer:h.ignoreDepthValues===!1})}S.isXRRenderTarget=!0,this.setFoveation(l),c=null,a=await s.requestReferenceSpace(o),Fe.setContext(s),Fe.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(s!==null)return s.environmentBlendMode},this.getDepthTexture=function(){return m.getDepthTexture()};function se(K){for(let ge=0;ge<K.removed.length;ge++){const Te=K.removed[ge],Ue=T.indexOf(Te);Ue>=0&&(T[Ue]=null,w[Ue].disconnect(Te))}for(let ge=0;ge<K.added.length;ge++){const Te=K.added[ge];let Ue=T.indexOf(Te);if(Ue===-1){for(let Oe=0;Oe<w.length;Oe++)if(Oe>=T.length){T.push(Te),Ue=Oe;break}else if(T[Oe]===null){T[Oe]=Te,Ue=Oe;break}if(Ue===-1)break}const Me=w[Ue];Me&&Me.connect(Te)}}function $(K,ge){ge===null?K.matrixWorld.copy(K.matrix):K.matrixWorld.multiplyMatrices(ge.matrixWorld,K.matrix),K.matrixWorldInverse.copy(K.matrixWorld).invert()}this.updateCamera=function(K){if(s===null)return;let ge=K.near,Te=K.far;m.texture!==null&&(m.depthNear>0&&(ge=m.depthNear),m.depthFar>0&&(Te=m.depthFar)),V.near=C.near=R.near=ge,V.far=C.far=R.far=Te,(D!==V.near||z!==V.far)&&(s.updateRenderState({depthNear:V.near,depthFar:V.far}),D=V.near,z=V.far),V.layers.mask=K.layers.mask|6,R.layers.mask=V.layers.mask&-5,C.layers.mask=V.layers.mask&-3;const Ue=K.parent,Me=V.cameras;$(V,Ue);for(let Oe=0;Oe<Me.length;Oe++)$(Me[Oe],Ue);V.projectionMatrix.copy(R.projectionMatrix),V.projectionMatrixInverse.copy(R.projectionMatrixInverse),P===null&&K.isPerspectiveCamera&&(P={camera:K,fov:K.fov,zoom:K.zoom}),ee(K,V,Ue)};function ee(K,ge,Te){Te===null?K.matrix.copy(ge.matrixWorld):(K.matrix.copy(Te.matrixWorld),K.matrix.invert(),K.matrix.multiply(ge.matrixWorld)),K.matrix.decompose(K.position,K.quaternion,K.scale),K.updateMatrixWorld(!0),K.projectionMatrix.copy(ge.projectionMatrix),K.projectionMatrixInverse.copy(ge.projectionMatrixInverse),K.isPerspectiveCamera&&(K.fov=us*2*Math.atan(1/K.projectionMatrix.elements[5]),K.zoom=1)}this.getCamera=function(){return V},this.getFoveation=function(){if(!(d===null&&h===null))return l},this.setFoveation=function(K){l=K,d!==null&&(d.fixedFoveation=K),h!==null&&h.fixedFoveation!==void 0&&(h.fixedFoveation=K)},this.hasDepthSensing=function(){return m.texture!==null},this.getDepthSensingMesh=function(){return m.getMesh(V)},this.getCameraTexture=function(K){return g[K]};let ie=null;function we(K,ge){if(u=ge.getViewerPose(c||a),p=ge,u!==null){const Te=u.views;h!==null&&(e.setRenderTargetFramebuffer(S,h.framebuffer),e.setRenderTarget(S));let Ue=!1;Te.length!==V.cameras.length&&(V.cameras.length=0,Ue=!0);for(let ze=0;ze<Te.length;ze++){const Ye=Te[ze];let Ke=null;if(h!==null)Ke=h.getViewport(Ye);else{const he=f.getViewSubImage(d,Ye);Ke=he.viewport,ze===0&&(e.setRenderTargetTextures(S,he.colorTexture,he.depthStencilTexture),e.setRenderTarget(S))}let te=F[ze];te===void 0&&(te=new dn,te.layers.enable(ze),te.viewport=new bt,F[ze]=te),te.matrix.fromArray(Ye.transform.matrix),te.matrix.decompose(te.position,te.quaternion,te.scale),te.projectionMatrix.fromArray(Ye.projectionMatrix),te.projectionMatrixInverse.copy(te.projectionMatrix).invert(),te.viewport.set(Ke.x,Ke.y,Ke.width,Ke.height),ze===0&&(V.matrix.copy(te.matrix),V.matrix.decompose(V.position,V.quaternion,V.scale)),Ue===!0&&V.cameras.push(te)}const Me=s.enabledFeatures;if(Me&&Me.includes("depth-sensing")&&s.depthUsage=="gpu-optimized"&&v){f=n.getBinding();const ze=f.getDepthInformation(Te[0]);ze&&ze.isValid&&ze.texture&&m.init(ze,s.renderState)}if(Me&&Me.includes("camera-access")&&v){e.state.unbindTexture(),f=n.getBinding();for(let ze=0;ze<Te.length;ze++){const Ye=Te[ze].camera;if(Ye){let Ke=g[Ye];Ke||(Ke=new Wc,g[Ye]=Ke);const te=f.getCameraImage(Ye);Ke.sourceTexture=te}}}}for(let Te=0;Te<w.length;Te++){const Ue=T[Te],Me=w[Te];Ue!==null&&Me!==void 0&&Me.update(Ue,ge,c||a)}ie&&ie(K,ge),ge.detectedPlanes&&n.dispatchEvent({type:"planesdetected",data:ge}),p=null}const Fe=new ih;Fe.setAnimationLoop(we),this.setAnimationLoop=function(K){ie=K},this.dispose=function(){}}}const Wg=new xt,fh=new Xe;fh.set(-1,0,0,0,1,0,0,0,1);function Xg(i,e){function t(m,g){m.matrixAutoUpdate===!0&&m.updateMatrix(),g.value.copy(m.matrix)}function n(m,g){g.color.getRGB(m.fogColor.value,jc(i)),g.isFog?(m.fogNear.value=g.near,m.fogFar.value=g.far):g.isFogExp2&&(m.fogDensity.value=g.density)}function s(m,g,x,M,S){g.isNodeMaterial?g.uniformsNeedUpdate=!1:g.isMeshBasicMaterial?r(m,g):g.isMeshLambertMaterial?(r(m,g),g.envMap&&(m.envMapIntensity.value=g.envMapIntensity)):g.isMeshToonMaterial?(r(m,g),f(m,g)):g.isMeshPhongMaterial?(r(m,g),u(m,g),g.envMap&&(m.envMapIntensity.value=g.envMapIntensity)):g.isMeshStandardMaterial?(r(m,g),d(m,g),g.isMeshPhysicalMaterial&&h(m,g,S)):g.isMeshMatcapMaterial?(r(m,g),p(m,g)):g.isMeshDepthMaterial?r(m,g):g.isMeshDistanceMaterial?(r(m,g),v(m,g)):g.isMeshNormalMaterial?r(m,g):g.isLineBasicMaterial?(a(m,g),g.isLineDashedMaterial&&o(m,g)):g.isPointsMaterial?l(m,g,x,M):g.isSpriteMaterial?c(m,g):g.isShadowMaterial?(m.color.value.copy(g.color),m.opacity.value=g.opacity):g.isShaderMaterial&&(g.uniformsNeedUpdate=!1)}function r(m,g){m.opacity.value=g.opacity,g.color&&m.diffuse.value.copy(g.color),g.emissive&&m.emissive.value.copy(g.emissive).multiplyScalar(g.emissiveIntensity),g.map&&(m.map.value=g.map,t(g.map,m.mapTransform)),g.alphaMap&&(m.alphaMap.value=g.alphaMap,t(g.alphaMap,m.alphaMapTransform)),g.bumpMap&&(m.bumpMap.value=g.bumpMap,t(g.bumpMap,m.bumpMapTransform),m.bumpScale.value=g.bumpScale,g.side===Jt&&(m.bumpScale.value*=-1)),g.normalMap&&(m.normalMap.value=g.normalMap,t(g.normalMap,m.normalMapTransform),m.normalScale.value.copy(g.normalScale),g.side===Jt&&m.normalScale.value.negate()),g.displacementMap&&(m.displacementMap.value=g.displacementMap,t(g.displacementMap,m.displacementMapTransform),m.displacementScale.value=g.displacementScale,m.displacementBias.value=g.displacementBias),g.emissiveMap&&(m.emissiveMap.value=g.emissiveMap,t(g.emissiveMap,m.emissiveMapTransform)),g.specularMap&&(m.specularMap.value=g.specularMap,t(g.specularMap,m.specularMapTransform)),g.alphaTest>0&&(m.alphaTest.value=g.alphaTest);const x=e.get(g),M=x.envMap,S=x.envMapRotation;M&&(m.envMap.value=M,m.envMapRotation.value.setFromMatrix4(Wg.makeRotationFromEuler(S)).transpose(),M.isCubeTexture&&M.isRenderTargetTexture===!1&&m.envMapRotation.value.premultiply(fh),m.reflectivity.value=g.reflectivity,m.ior.value=g.ior,m.refractionRatio.value=g.refractionRatio),g.lightMap&&(m.lightMap.value=g.lightMap,m.lightMapIntensity.value=g.lightMapIntensity,t(g.lightMap,m.lightMapTransform)),g.aoMap&&(m.aoMap.value=g.aoMap,m.aoMapIntensity.value=g.aoMapIntensity,t(g.aoMap,m.aoMapTransform))}function a(m,g){m.diffuse.value.copy(g.color),m.opacity.value=g.opacity,g.map&&(m.map.value=g.map,t(g.map,m.mapTransform))}function o(m,g){m.dashSize.value=g.dashSize,m.totalSize.value=g.dashSize+g.gapSize,m.scale.value=g.scale}function l(m,g,x,M){m.diffuse.value.copy(g.color),m.opacity.value=g.opacity,m.size.value=g.size*x,m.scale.value=M*.5,g.map&&(m.map.value=g.map,t(g.map,m.uvTransform)),g.alphaMap&&(m.alphaMap.value=g.alphaMap,t(g.alphaMap,m.alphaMapTransform)),g.alphaTest>0&&(m.alphaTest.value=g.alphaTest)}function c(m,g){m.diffuse.value.copy(g.color),m.opacity.value=g.opacity,m.rotation.value=g.rotation,g.map&&(m.map.value=g.map,t(g.map,m.mapTransform)),g.alphaMap&&(m.alphaMap.value=g.alphaMap,t(g.alphaMap,m.alphaMapTransform)),g.alphaTest>0&&(m.alphaTest.value=g.alphaTest)}function u(m,g){m.specular.value.copy(g.specular),m.shininess.value=Math.max(g.shininess,1e-4)}function f(m,g){g.gradientMap&&(m.gradientMap.value=g.gradientMap)}function d(m,g){m.metalness.value=g.metalness,g.metalnessMap&&(m.metalnessMap.value=g.metalnessMap,t(g.metalnessMap,m.metalnessMapTransform)),m.roughness.value=g.roughness,g.roughnessMap&&(m.roughnessMap.value=g.roughnessMap,t(g.roughnessMap,m.roughnessMapTransform)),g.envMap&&(m.envMapIntensity.value=g.envMapIntensity)}function h(m,g,x){m.ior.value=g.ior,g.diffuseRoughness>0&&(m.diffuseRoughness.value=g.diffuseRoughness,g.diffuseRoughnessMap&&(m.diffuseRoughnessMap.value=g.diffuseRoughnessMap,t(g.diffuseRoughnessMap,m.diffuseRoughnessMapTransform))),g.sheen>0&&(m.sheenColor.value.copy(g.sheenColor).multiplyScalar(g.sheen),m.sheenRoughness.value=g.sheenRoughness,g.sheenColorMap&&(m.sheenColorMap.value=g.sheenColorMap,t(g.sheenColorMap,m.sheenColorMapTransform)),g.sheenRoughnessMap&&(m.sheenRoughnessMap.value=g.sheenRoughnessMap,t(g.sheenRoughnessMap,m.sheenRoughnessMapTransform))),g.clearcoat>0&&(m.clearcoat.value=g.clearcoat,m.clearcoatRoughness.value=g.clearcoatRoughness,g.clearcoatMap&&(m.clearcoatMap.value=g.clearcoatMap,t(g.clearcoatMap,m.clearcoatMapTransform)),g.clearcoatRoughnessMap&&(m.clearcoatRoughnessMap.value=g.clearcoatRoughnessMap,t(g.clearcoatRoughnessMap,m.clearcoatRoughnessMapTransform)),g.clearcoatNormalMap&&(m.clearcoatNormalMap.value=g.clearcoatNormalMap,t(g.clearcoatNormalMap,m.clearcoatNormalMapTransform),m.clearcoatNormalScale.value.copy(g.clearcoatNormalScale),g.side===Jt&&m.clearcoatNormalScale.value.negate())),g.dispersion>0&&(m.dispersion.value=g.dispersion),g.retroreflectivity>0&&(m.retroreflectivity.value=g.retroreflectivity),g.iridescence>0&&(m.iridescence.value=g.iridescence,m.iridescenceIOR.value=g.iridescenceIOR,m.iridescenceThicknessMinimum.value=g.iridescenceThicknessMinimum,m.iridescenceThicknessMaximum.value=g.iridescenceThicknessMaximum,g.iridescenceMap&&(m.iridescenceMap.value=g.iridescenceMap,t(g.iridescenceMap,m.iridescenceMapTransform)),g.iridescenceThicknessMap&&(m.iridescenceThicknessMap.value=g.iridescenceThicknessMap,t(g.iridescenceThicknessMap,m.iridescenceThicknessMapTransform))),g.transmission>0&&(m.transmission.value=g.transmission,m.transmissionSamplerMap.value=x.texture,m.transmissionSamplerSize.value.set(x.width,x.height),g.transmissionMap&&(m.transmissionMap.value=g.transmissionMap,t(g.transmissionMap,m.transmissionMapTransform)),m.thickness.value=g.thickness,g.thicknessMap&&(m.thicknessMap.value=g.thicknessMap,t(g.thicknessMap,m.thicknessMapTransform)),m.attenuationDistance.value=g.attenuationDistance,m.attenuationColor.value.copy(g.attenuationColor)),g.anisotropy>0&&(m.anisotropyVector.value.set(g.anisotropy*Math.cos(g.anisotropyRotation),g.anisotropy*Math.sin(g.anisotropyRotation)),g.anisotropyMap&&(m.anisotropyMap.value=g.anisotropyMap,t(g.anisotropyMap,m.anisotropyMapTransform))),m.specularIntensity.value=g.specularIntensity,m.specularColor.value.copy(g.specularColor),g.specularColorMap&&(m.specularColorMap.value=g.specularColorMap,t(g.specularColorMap,m.specularColorMapTransform)),g.specularIntensityMap&&(m.specularIntensityMap.value=g.specularIntensityMap,t(g.specularIntensityMap,m.specularIntensityMapTransform))}function p(m,g){g.matcap&&(m.matcap.value=g.matcap)}function v(m,g){const x=e.get(g).light;m.referencePosition.value.setFromMatrixPosition(x.matrixWorld),m.nearDistance.value=x.shadow.camera.near,m.farDistance.value=x.shadow.camera.far}return{refreshFogUniforms:n,refreshMaterialUniforms:s}}function qg(i,e,t,n){let s={},r={};function a(x,M){const S=M.program;n.uniformBlockBinding(x,S,s[x.id])}function o(x,M){let S=s[x.id];S===void 0&&(p(x),S=l(x),s[x.id]=S,x.addEventListener("dispose",m));const w=M.program;n.updateUBOMapping(x,w);const T=e.render.frame;r[x.id]!==T&&(c(x),r[x.id]=T)}function l(x){const M=i.createBuffer(),S=x.__size,w=x.usage;return i.bindBuffer(i.UNIFORM_BUFFER,M),i.bufferData(i.UNIFORM_BUFFER,S,w),i.bindBuffer(i.UNIFORM_BUFFER,null),M}function c(x){const M=s[x.id],S=x.uniforms,w=x.__cache;i.bindBuffer(i.UNIFORM_BUFFER,M);for(let T=0,_=S.length;T<_;T++){const b=S[T];if(Array.isArray(b))for(let P=0,R=b.length;P<R;P++)u(b[P],T,P,w);else u(b,T,0,w)}i.bindBuffer(i.UNIFORM_BUFFER,null)}function u(x,M,S,w){if(d(x,M,S,w)===!0){const T=x.__offset,_=x.value;if(Array.isArray(_)){let b=0;for(let P=0;P<_.length;P++){const R=_[P],C=v(R,!0);f(R,x.__data,b),b+=C.storage/Float32Array.BYTES_PER_ELEMENT}}else f(_,x.__data,0);i.bufferSubData(i.UNIFORM_BUFFER,T,x.__data)}}function f(x,M,S){typeof x=="number"||typeof x=="boolean"?M[S]=x:x.isMatrix3?(M[S]=x.elements[0],M[S+1]=x.elements[1],M[S+2]=x.elements[2],M[S+3]=0,M[S+4]=x.elements[3],M[S+5]=x.elements[4],M[S+6]=x.elements[5],M[S+7]=0,M[S+8]=x.elements[6],M[S+9]=x.elements[7],M[S+10]=x.elements[8],M[S+11]=0):ArrayBuffer.isView(x)?M.set(x.subarray(0,M.length-S),S):x.toArray(M,S)}function d(x,M,S,w){const T=x.value,_=M+"_"+S;if(Array.isArray(T)){w[_]===void 0&&(w[_]=[]);const b=w[_];let P=!1;for(let R=0;R<T.length;R++)h(T[R],b,R)===!0&&(P=!0);return P}return h(T,w,_)}function h(x,M,S){if(M[S]===void 0)return typeof x=="number"||typeof x=="boolean"?M[S]=x:ArrayBuffer.isView(x)?M[S]=x.slice():M[S]=x.clone(),!0;{const w=M[S];if(typeof x=="number"||typeof x=="boolean"){if(w!==x)return M[S]=x,!0}else{if(ArrayBuffer.isView(x))return!0;if(w.equals(x)===!1)return w.copy(x),!0}}return!1}function p(x){const M=x.uniforms;let S=0;const w=16;for(let _=0,b=M.length;_<b;_++){const P=Array.isArray(M[_])?M[_]:[M[_]];for(let R=0,C=P.length;R<C;R++){const F=P[R],V=Array.isArray(F.value)?F.value:[F.value],D=Array.isArray(M[_])||Array.isArray(F.value);let z=S;for(let k=0,se=V.length;k<se;k++){const $=V[k],ee=v($,D),ie=S%w,we=ie%ee.boundary,Fe=ie+we;S+=we,Fe!==0&&w-Fe<ee.storage&&(S+=w-Fe),k===0&&(z=S),S+=ee.storage}const X=F.type==="int"?Int32Array:F.type==="uint"?Uint32Array:Float32Array;F.__data=new X((S-z)/Float32Array.BYTES_PER_ELEMENT),F.__offset=z}}const T=S%w;return T>0&&(S+=w-T),x.__size=S,x.__cache={},this}function v(x,M){const S={boundary:0,storage:0};return typeof x=="number"||typeof x=="boolean"?(S.boundary=4,S.storage=4):x.isVector2?(S.boundary=8,S.storage=8):x.isVector3||x.isColor?(S.boundary=16,S.storage=12):x.isVector4?(S.boundary=16,S.storage=16):x.isMatrix3?(S.boundary=16,S.storage=48):x.isMatrix4?(S.boundary=16,S.storage=64):x.isTexture?He("WebGLRenderer: Texture samplers can not be part of an uniforms group."):ArrayBuffer.isView(x)?(S.boundary=16,S.storage=x.byteLength):He("WebGLRenderer: Unsupported uniform value type.",x),M===!0&&(S.boundary=16,S.storage=Math.ceil(S.storage/16)*16),S}function m(x){const M=x.target;M.removeEventListener("dispose",m),i.deleteBuffer(s[M.id]),delete s[M.id],delete r[M.id]}function g(){for(const x in s)i.deleteBuffer(s[x]);s={},r={}}return{bind:a,update:o,dispose:g}}const Yg=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]);let xn=null;function $g(){return xn===null&&(xn=new ld(Yg,16,16,ui,Tn),xn.name="DFG_LUT",xn.minFilter=Zt,xn.magFilter=Zt,xn.wrapS=Un,xn.wrapT=Un,xn.generateMipmaps=!1,xn.needsUpdate=!0),xn}class Kg{constructor(e={}){const{canvas:t=Su(),context:n=null,depth:s=!0,stencil:r=!1,alpha:a=!1,antialias:o=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:u="default",failIfMajorPerformanceCaveat:f=!1,reversedDepthBuffer:d=!1,outputBufferType:h=nn}=e;this.isWebGLRenderer=!0;let p;if(n!==null){if(typeof WebGLRenderingContext<"u"&&n instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");p=n.getContextAttributes().alpha}else p=a;const v=h,m=new Set([oo,ao,ro]),g=new Set([nn,wn,cs,Fi,io,so]),x=new Uint32Array(4),M=new Int32Array(4),S={textures:[],min:[],max:[],resolution:[]};let w=null,T=null;const _=[],b=[];let P=null;this.domElement=t,this.debug={checkShaderErrors:!0,diagnostics:{keywords:!1},onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=On,this.toneMappingExposure=1,this.transmissionResolutionScale=1;const R=this;let C=!1,F=null,V=null,D=null,z=null;this._outputColorSpace=an;let X=0,k=0,se=null,$=-1,ee=null;const ie=new bt,we=new bt;let Fe=null;const K=new Ve(0);let ge=0,Te=t.width,Ue=t.height,Me=1,Oe=null,pt=null;const ze=new bt(0,0,Te,Ue),Ye=new bt(0,0,Te,Ue);let Ke=!1;const te=new ds,he=new po;let q=!1,ae=!1;const re=new xt,Be=new O,Ae=new bt,$e={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};let Je=!1;function et(){return se===null?Me:1}let U=n;function St(E,N){return t.getContext(E,N)}let tt,mt,_e,At,Ge,We,A,y,H,oe,ne,ue,ve,J,Q,fe,I,j,Z,pe,ce,de,Ne;try{const E={alpha:!0,depth:s,stencil:r,antialias:o,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:u,failIfMajorPerformanceCaveat:f};if("setAttribute"in t&&t.setAttribute("data-engine",`three.js r${eo}`),t.addEventListener("webglcontextlost",ke,!1),t.addEventListener("webglcontextrestored",Ze,!1),t.addEventListener("webglcontextcreationerror",ye,!1),U===null){const N="webgl2";if(U=St(N,E),U===null)throw St(N)?new Error("THREE.WebGLRenderer: Error creating WebGL context with your selected attributes."):new Error("THREE.WebGLRenderer: Error creating WebGL context.")}Qe()}catch(E){throw t.removeEventListener("webglcontextlost",ke,!1),t.removeEventListener("webglcontextrestored",Ze,!1),t.removeEventListener("webglcontextcreationerror",ye,!1),lt("WebGLRenderer: "+E.message),E}function Qe(){tt=new Q0(U),tt.init(),ce=new kg(U,tt),mt=new G0(U,tt,e,ce),_e=new Og(U,tt),mt.reversedDepthBuffer&&d&&_e.buffers.depth.setReversed(!0),V=U.createFramebuffer(),D=U.createFramebuffer(),z=U.createFramebuffer(),At=new tm(U),Ge=new Eg,We=new Bg(U,tt,_e,Ge,mt,ce,At),A=new J0(R),y=new nf(U),de=new k0(U,y),H=new j0(U,y,At,de),oe=new im(U,H,y,de,At),j=new nm(U,mt,We),Q=new H0(Ge),ne=new yg(R,A,tt,mt,de,Q),ue=new Xg(R,Ge),ve=new wg,J=new Lg(tt),I=new B0(R,A,_e,oe,p,l),fe=new Fg(R,oe,mt),Ne=new qg(U,At,mt,_e),Z=new z0(U,tt,At),pe=new em(U,tt,At),At.programs=ne.programs,R.capabilities=mt,R.extensions=tt,R.properties=Ge,R.renderLists=ve,R.shadowMap=fe,R.state=_e,R.info=At}v!==nn&&(P=new rm(v,t.width,t.height,o,s,r));const le=new Vg(R,U);this.xr=le,this.getContext=function(){return U},this.getContextAttributes=function(){return U.getContextAttributes()},this.forceContextLoss=function(){const E=tt.get("WEBGL_lose_context");E&&E.loseContext()},this.forceContextRestore=function(){const E=tt.get("WEBGL_lose_context");E&&E.restoreContext()},this.getPixelRatio=function(){return Me},this.setPixelRatio=function(E){E!==void 0&&(Me=E,this.setSize(Te,Ue,!1))},this.getSize=function(E){return E.set(Te,Ue)},this.setSize=function(E,N,Y=!0){if(le.isPresenting){He("WebGLRenderer: Can't change size while VR device is presenting.");return}Te=E,Ue=N,t.width=Math.floor(E*Me),t.height=Math.floor(N*Me),Y===!0&&(t.style.width=E+"px",t.style.height=N+"px"),P!==null&&P.setSize(t.width,t.height),this.setViewport(0,0,E,N)},this.getDrawingBufferSize=function(E){return E.set(Te*Me,Ue*Me).floor()},this.setDrawingBufferSize=function(E,N,Y){Te=E,Ue=N,Me=Y,t.width=Math.floor(E*Y),t.height=Math.floor(N*Y),this.setViewport(0,0,E,N)},this.setEffects=function(E){if(v===nn){lt("WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.");return}if(E){for(let N=0;N<E.length;N++)if(E[N].isOutputPass===!0){He("WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.");break}}P.setEffects(E||[])},this.getCurrentViewport=function(E){return E.copy(ie)},this.getViewport=function(E){return E.copy(ze)},this.setViewport=function(E,N,Y,G){E.isVector4?ze.set(E.x,E.y,E.z,E.w):ze.set(E,N,Y,G),_e.viewport(ie.copy(ze).multiplyScalar(et()).round())},this.getScissor=function(E){return E.copy(Ye)},this.setScissor=function(E,N,Y,G){E.isVector4?Ye.set(E.x,E.y,E.z,E.w):Ye.set(E,N,Y,G),_e.scissor(we.copy(Ye).multiplyScalar(et()).round())},this.getScissorTest=function(){return Ke},this.setScissorTest=function(E){_e.setScissorTest(Ke=E)},this.setOpaqueSort=function(E){Oe=E},this.setTransparentSort=function(E){pt=E},this.getClearColor=function(E){return E.copy(I.getClearColor())},this.setClearColor=function(){I.setClearColor(...arguments)},this.getClearAlpha=function(){return I.getClearAlpha()},this.setClearAlpha=function(){I.setClearAlpha(...arguments)},this.clear=function(E=!0,N=!0,Y=!0){let G=0;if(E){let W=!1;if(se!==null){const xe=se.texture.format;W=m.has(xe)}if(W){const xe=se.texture.type,Ce=g.has(xe),me=I.getClearColor(),be=I.getClearAlpha(),De=me.r,qe=me.g,it=me.b;Ce?(x[0]=De,x[1]=qe,x[2]=it,x[3]=be,U.clearBufferuiv(U.COLOR,0,x)):(M[0]=De,M[1]=qe,M[2]=it,M[3]=be,U.clearBufferiv(U.COLOR,0,M))}else G|=U.COLOR_BUFFER_BIT}N&&(G|=U.DEPTH_BUFFER_BIT,this.state.buffers.depth.setMask(!0)),Y&&(G|=U.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),G!==0&&U.clear(G)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.setNodesHandler=function(E){E.setRenderer(this),F=E},this.dispose=function(){t.removeEventListener("webglcontextlost",ke,!1),t.removeEventListener("webglcontextrestored",Ze,!1),t.removeEventListener("webglcontextcreationerror",ye,!1),I.dispose(),ve.dispose(),J.dispose(),We.dispose(),Ge.dispose(),A.dispose(),oe.dispose(),H.dispose(),de.dispose(),Ne.dispose(),ne.dispose(),le.dispose(),le.removeEventListener("sessionstart",No),le.removeEventListener("sessionend",Uo),ni.stop()};function ke(E){E.preventDefault(),Qo("WebGLRenderer: Context Lost."),C=!0}function Ze(){Qo("WebGLRenderer: Context Restored."),C=!1;const E=At.autoReset,N=fe.enabled,Y=fe.autoUpdate,G=fe.needsUpdate,W=fe.type;Qe(),At.autoReset=E,fe.enabled=N,fe.autoUpdate=Y,fe.needsUpdate=G,fe.type=W}function ye(E){lt("WebGLRenderer: A WebGL context could not be created. Reason: ",E.statusMessage)}function ut(E){const N=E.target;N.removeEventListener("dispose",ut),Dt(N)}function Dt(E){Gn(E),Ge.remove(E)}function Gn(E){const N=Ge.get(E).programs;N!==void 0&&(N.forEach(function(Y){ne.releaseProgram(Y)}),E.isShaderMaterial&&ne.releaseShaderCache(E))}this.renderBufferDirect=function(E,N,Y,G,W,xe){N===null&&(N=$e);const Ce=W.isMesh&&W.matrixWorld.determinantAffine()<0,me=Rh(E,N,Y,G,W);_e.setMaterial(G,Ce);let be=Y.index,De=1;if(G.wireframe===!0){if(be=H.getWireframeAttribute(Y),be===void 0)return;De=2}const qe=Y.drawRange,it=Y.attributes.position;let Pe=qe.start*De,st=(qe.start+qe.count)*De;xe!==null&&(Pe=Math.max(Pe,xe.start*De),st=Math.min(st,(xe.start+xe.count)*De)),be!==null?(Pe=Math.max(Pe,0),st=Math.min(st,be.count)):it!=null&&(Pe=Math.max(Pe,0),st=Math.min(st,it.count));const Rt=st-Pe;if(Rt<0||Rt===1/0)return;de.setup(W,G,me,Y,be);let Mt,gt=Z;if(be!==null&&(Mt=y.get(be),gt=pe,gt.setIndex(Mt)),W.isMesh)G.wireframe===!0?(_e.setLineWidth(G.wireframeLinewidth*et()),gt.setMode(U.LINES)):gt.setMode(U.TRIANGLES);else if(W.isLine){let Gt=G.linewidth;Gt===void 0&&(Gt=1),_e.setLineWidth(Gt*et()),W.isLineSegments?gt.setMode(U.LINES):W.isLineLoop?gt.setMode(U.LINE_LOOP):gt.setMode(U.LINE_STRIP)}else W.isPoints?gt.setMode(U.POINTS):W.isSprite&&gt.setMode(U.TRIANGLES);if(W.isBatchedMesh)if(tt.get("WEBGL_multi_draw"))gt.renderMultiDraw(W._multiDrawStarts,W._multiDrawCounts,W._multiDrawCount);else{const Gt=W._multiDrawStarts,Le=W._multiDrawCounts,qt=W._multiDrawCount,ct=be?y.get(be).bytesPerElement:1,ii=Ge.get(G).currentProgram.getUniforms();for(let Ht=0;Ht<qt;Ht++)ii.setValue(U,"_gl_DrawID",Ht),gt.render(Gt[Ht]/ct,Le[Ht])}else if(W.isInstancedMesh)gt.renderInstances(Pe,Rt,W.count);else if(Y.isInstancedBufferGeometry){const Gt=Y._maxInstanceCount!==void 0?Y._maxInstanceCount:1/0,Le=Math.min(Y.instanceCount,Gt);gt.renderInstances(Pe,Rt,Le)}else gt.render(Pe,Rt)};function Io(E,N,Y,G){F!==null&&E.isNodeMaterial&&F.setObject(G,E),q===!0&&Q.setState(E,Y,!1),E.transparent===!0&&E.side===Sn&&E.forceSinglePass===!1?(E.side=Jt,E.needsUpdate=!0,Vi(E,N,G),E.side=hi,E.needsUpdate=!0,Vi(E,N,G),E.side=Sn):Vi(E,N,G)}this.compile=function(E,N,Y=null){Y===null&&(Y=E),F!==null&&F.renderStart(E,N,Y),T=J.get(Y),T.init(N),b.push(T),Y.traverseVisible(function(W){W.isLight&&W.layers.test(N.layers)&&(T.pushLight(W),W.castShadow&&T.pushShadow(W))}),E!==Y&&E.traverseVisible(function(W){W.isLight&&W.layers.test(N.layers)&&(T.pushLight(W),W.castShadow&&T.pushShadow(W))}),T.setupLights(),F!==null&&F.updateLights(T.state.lightsArray),ae=this.localClippingEnabled,q=Q.init(this.clippingPlanes,ae),q===!0&&Q.setGlobalState(this.clippingPlanes,N),F!==null&&fe.render(T.state.shadowsArray,Y,N);const G=new Set;return E.traverse(function(W){if(!(W.isMesh||W.isPoints||W.isLine||W.isSprite))return;const xe=W.material;if(xe)if(Array.isArray(xe))for(let Ce=0;Ce<xe.length;Ce++){const me=xe[Ce];Io(me,Y,N,W),G.add(me)}else Io(xe,Y,N,W),G.add(xe)}),T=b.pop(),F!==null&&F.renderEnd(),G},this.compileAsync=function(E,N,Y=null){const G=this.compile(E,N,Y);return new Promise(W=>{function xe(){if(G.forEach(function(Ce){const be=Ge.get(Ce).currentProgram;(be===void 0||be.isReady())&&G.delete(Ce)}),G.size===0){W(E);return}setTimeout(xe,10)}tt.get("KHR_parallel_shader_compile")!==null?xe():setTimeout(xe,10)})};let Mr=null;function Th(E){Mr&&Mr(E)}function No(){ni.stop()}function Uo(){ni.start()}const ni=new ih;ni.setAnimationLoop(Th),typeof self<"u"&&ni.setContext(self),this.setAnimationLoop=function(E){Mr=E,le.setAnimationLoop(E),E===null?ni.stop():ni.start()},le.addEventListener("sessionstart",No),le.addEventListener("sessionend",Uo),this.render=function(E,N){if(N!==void 0&&N.isCamera!==!0){lt("WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(C===!0)return;F!==null&&F.renderStart(E,N);const Y=le.enabled===!0&&le.isPresenting===!0,G=P!==null&&(se===null||Y)&&P.begin(R,se);if(E.matrixWorldAutoUpdate===!0&&E.updateMatrixWorld(),N.parent===null&&N.matrixWorldAutoUpdate===!0&&N.updateMatrixWorld(),le.enabled===!0&&le.isPresenting===!0&&(P===null||P.isCompositing()===!1)&&(le.cameraAutoUpdate===!0&&le.updateCamera(N),N=le.getCamera()),E.isScene===!0&&E.onBeforeRender(R,E,N,se),T=J.get(E,b.length),T.init(N),T.state.textureUnits=We.getTextureUnits(),b.push(T),re.multiplyMatrices(N.projectionMatrix,N.matrixWorldInverse),N.isArrayCamera?he.setFromArrayCamera(N):te.setFromProjectionMatrix(re,mn,N.reversedDepth),ae=this.localClippingEnabled,q=Q.init(this.clippingPlanes,ae),w=ve.get(E,_.length),w.init(),_.push(w),this.info.render.frame++,le.enabled===!0&&le.isPresenting===!0){const Ce=R.xr.getDepthSensingMesh();Ce!==null&&Sr(Ce,N,-1/0,R.sortObjects)}Sr(E,N,0,R.sortObjects),w.finish(),F!==null&&F.updateLights(T.state.lightsArray),R.sortObjects===!0&&w.sort(Oe,pt),Je=le.enabled===!1||le.isPresenting===!1||le.hasDepthSensing()===!1,Je&&I.addToRenderList(w,E),this.info.autoReset===!0&&this.info.reset(),q===!0&&Q.beginShadows();const W=T.state.shadowsArray;if(fe.render(W,E,N),q===!0&&Q.endShadows(),(G&&P.hasRenderPass())===!1){const Ce=w.opaque,me=w.transmissive;if(T.setupLights(),N.isArrayCamera){const be=N.cameras;if(me.length>0)for(let De=0,qe=be.length;De<qe;De++){const it=be[De];Oo(Ce,me,E,it)}Je&&I.render(E);for(let De=0,qe=be.length;De<qe;De++){const it=be[De];Fo(w,E,it,it.viewport)}}else me.length>0&&Oo(Ce,me,E,N),Je&&I.render(E),Fo(w,E,N)}se!==null&&k===0&&(We.updateMultisampleRenderTarget(se),We.updateRenderTargetMipmap(se)),G&&P.end(R),E.isScene===!0&&E.onAfterRender(R,E,N),de.resetDefaultState(),$=-1,ee=null,b.pop(),b.length>0?(T=b[b.length-1],We.setTextureUnits(T.state.textureUnits),q===!0&&Q.setGlobalState(R.clippingPlanes,T.state.camera)):T=null,_.pop(),_.length>0?w=_[_.length-1]:w=null,F!==null&&F.renderEnd()};function Sr(E,N,Y,G){if(E.visible===!1)return;if(E.layers.test(N.layers)){if(E.isGroup)Y=E.renderOrder;else if(E.isLOD)E.autoUpdate===!0&&E.update(N);else if(E.isLight)T.pushLight(E),E.castShadow&&T.pushShadow(E);else if(E.isSprite){const Ce=N.isArrayCamera?he:te;if(!E.frustumCulled||E.intersectsFrustum(Ce)){G&&Ae.setFromMatrixPosition(E.matrixWorld).applyMatrix4(re);const me=oe.update(E),be=E.material;be.visible&&w.push(E,me,be,Y,Ae.z,null,N)}}else if(E.isMesh||E.isLine||E.isPoints){const Ce=N.isArrayCamera?he:te;if(!E.frustumCulled||E.intersectsFrustum(Ce)){const me=oe.update(E),be=E.material;if(G&&(E.boundingSphere!==void 0?(E.boundingSphere===null&&E.computeBoundingSphere(),Ae.copy(E.boundingSphere.center)):(me.boundingSphere===null&&me.computeBoundingSphere(),Ae.copy(me.boundingSphere.center)),Ae.applyMatrix4(E.matrixWorld).applyMatrix4(re)),Array.isArray(be)){const De=me.groups;for(let qe=0,it=De.length;qe<it;qe++){const Pe=De[qe],st=be[Pe.materialIndex];st&&st.visible&&w.push(E,me,st,Y,Ae.z,Pe,N)}}else be.visible&&w.push(E,me,be,Y,Ae.z,null,N)}}}const xe=E.children;for(let Ce=0,me=xe.length;Ce<me;Ce++)Sr(xe[Ce],N,Y,G)}function Fo(E,N,Y,G){const{opaque:W,transmissive:xe,transparent:Ce}=E;T.setupLightsView(Y),q===!0&&Q.setGlobalState(R.clippingPlanes,Y),G&&_e.viewport(ie.copy(G)),W.length>0&&Ss(W,N,Y),xe.length>0&&Ss(xe,N,Y),Ce.length>0&&Ss(Ce,N,Y),_e.buffers.depth.setTest(!0),_e.buffers.depth.setMask(!0),_e.buffers.color.setMask(!0),_e.setPolygonOffset(!1)}function Oo(E,N,Y,G){if((Y.isScene===!0?Y.overrideMaterial:null)!==null)return;if(T.state.transmissionRenderTarget[G.id]===void 0){const Pe=tt.has("EXT_color_buffer_half_float")||tt.has("EXT_color_buffer_float");T.state.transmissionRenderTarget[G.id]=new bn(1,1,{generateMipmaps:!0,type:Pe?Tn:nn,minFilter:Zn,samples:Math.max(4,mt.samples),stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,colorSpace:rt.workingColorSpace})}const xe=T.state.transmissionRenderTarget[G.id],Ce=G.viewport||ie;xe.setSize(Ce.z*R.transmissionResolutionScale,Ce.w*R.transmissionResolutionScale);const me=R.getRenderTarget(),be=R.getActiveCubeFace(),De=R.getActiveMipmapLevel();R.setRenderTarget(xe),R.getClearColor(K),ge=R.getClearAlpha(),ge<1&&R.setClearColor(16777215,.5),R.clear(),Je&&I.render(Y);const qe=R.toneMapping;R.toneMapping=On;const it=G.viewport;if(G.viewport!==void 0&&(G.viewport=void 0),T.setupLightsView(G),q===!0&&Q.setGlobalState(R.clippingPlanes,G),Ss(E,Y,G),We.updateMultisampleRenderTarget(xe),We.updateRenderTargetMipmap(xe),tt.has("WEBGL_multisampled_render_to_texture")===!1){let Pe=!1;for(let st=0,Rt=N.length;st<Rt;st++){const Mt=N[st],{object:gt,geometry:Gt,material:Le,group:qt}=Mt;if(Le.side===Sn&&gt.layers.test(G.layers)){const ct=Le.side;Le.side=Jt,Le.needsUpdate=!0,Bo(gt,Y,G,Gt,Le,qt),Le.side=ct,Le.needsUpdate=!0,Pe=!0}}Pe===!0&&(We.updateMultisampleRenderTarget(xe),We.updateRenderTargetMipmap(xe))}R.setRenderTarget(me,be,De),R.setClearColor(K,ge),it!==void 0&&(G.viewport=it),R.toneMapping=qe}function Ss(E,N,Y){const G=N.isScene===!0?N.overrideMaterial:null;for(let W=0,xe=E.length;W<xe;W++){const Ce=E[W],{object:me,geometry:be,group:De}=Ce;let qe=Ce.material;qe.allowOverride===!0&&G!==null&&(qe=G),me.layers.test(Y.layers)&&Bo(me,N,Y,be,qe,De)}}function Bo(E,N,Y,G,W,xe){F!==null&&W.isNodeMaterial&&F.setObject(E,W),E.onBeforeRender(R,N,Y,G,W,xe),E.modelViewMatrix.multiplyMatrices(Y.matrixWorldInverse,E.matrixWorld),E.normalMatrix.getNormalMatrix(E.modelViewMatrix),W.onBeforeRender(R,N,Y,G,E,xe),W.transparent===!0&&W.side===Sn&&W.forceSinglePass===!1?(W.side=Jt,W.needsUpdate=!0,R.renderBufferDirect(Y,N,G,W,E,xe),W.side=hi,W.needsUpdate=!0,R.renderBufferDirect(Y,N,G,W,E,xe),W.side=Sn):R.renderBufferDirect(Y,N,G,W,E,xe),E.onAfterRender(R,N,Y,G,W,xe)}function ko(E){let N=0;for(const Y of E)Y.texture!==null&&N++;return N}function Vi(E,N,Y){N.isScene!==!0&&(N=$e);const G=Ge.get(E),W=T.state.lights,xe=T.state.shadowsArray,Ce=W.state.version,me=ne.getParameters(E,W.state,xe,N,Y,T.state.lightProbeGridArray),be=ne.getProgramCacheKey(me);let De=G.programs;G.environment=E.isMeshStandardMaterial||E.isMeshLambertMaterial||E.isMeshPhongMaterial?N.environment:null,G.fog=N.fog;const qe=E.isMeshStandardMaterial||E.isMeshLambertMaterial&&!E.envMap||E.isMeshPhongMaterial&&!E.envMap;G.envMap=A.get(E.envMap||G.environment,qe),G.envMapRotation=G.environment!==null&&E.envMap===null?N.environmentRotation:E.envMapRotation,De===void 0&&(E.addEventListener("dispose",ut),De=new Map,G.programs=De,G.programVariants=new Map);let it=De.get(be);if(it!==void 0){if(G.currentProgram===it&&G.lightsStateVersion===Ce)return Go(E,me),it}else me.uniforms=ne.getUniforms(E),F!==null&&E.isNodeMaterial&&F.build(E,Y,me),E.onBeforeCompile(me,R),it=ne.acquireProgram(me,be),De.set(be,it),G.uniforms=me.uniforms;const Pe=G.uniforms;return(!E.isShaderMaterial&&!E.isRawShaderMaterial||E.clipping===!0)&&(Pe.clippingPlanes=Q.uniform),Go(E,me),G.needsLights=Ph(E),G.lightsStateVersion=Ce,G.needsLights&&(Pe.ambientLightColor.value=W.state.ambient,Pe.lightProbe.value=W.state.probe,Pe.sunLights.value=W.state.sun,Pe.sunLightShadows.value=W.state.sunShadow,Pe.directionalLights.value=W.state.directional,Pe.directionalLightShadows.value=W.state.directionalShadow,Pe.spotLights.value=W.state.spot,Pe.spotLightShadows.value=W.state.spotShadow,Pe.rectAreaLights.value=W.state.rectArea,Pe.ltc_1.value=W.state.rectAreaLTC1,Pe.ltc_2.value=W.state.rectAreaLTC2,Pe.pointLights.value=W.state.point,Pe.pointLightShadows.value=W.state.pointShadow,Pe.hemisphereLights.value=W.state.hemi,Pe.sunShadowMatrix.value=W.state.sunShadowMatrix,Pe.sunShadowCascade.value=W.state.sunShadowCascade,Pe.directionalShadowMatrix.value=W.state.directionalShadowMatrix,Pe.spotLightMatrix.value=W.state.spotLightMatrix,Pe.spotLightMap.value=W.state.spotLightMap,Pe.pointShadowMatrix.value=W.state.pointShadowMatrix),G.numLightProbeGrids=ko(T.state.lightProbeGridArray),G.currentProgram=it,G.uniformsList=null,it}function Ah(E,N,Y,G,W){const xe=Ge.get(E),Ce=xe.currentProgram.id+","+G+","+W;let me=xe.programVariants.get(Ce);return me===void 0?(me=Vi(E,N,Y),xe.programVariants.set(Ce,me)):(xe.currentProgram=me,xe.uniformsList=null,xe.outputColorSpace=G,xe.toneMapping=W),me}function zo(E){if(E.uniformsList===null){const N=E.currentProgram.getUniforms();E.uniformsList=ir.seqWithValue(N.seq,E.uniforms)}return E.uniformsList}function Go(E,N){const Y=Ge.get(E);Y.outputColorSpace=N.outputColorSpace,Y.batching=N.batching,Y.batchingColor=N.batchingColor,Y.instancing=N.instancing,Y.instancingColor=N.instancingColor,Y.instancingMorph=N.instancingMorph,Y.skinning=N.skinning,Y.morphTargets=N.morphTargets,Y.morphNormals=N.morphNormals,Y.morphColors=N.morphColors,Y.morphTargetsCount=N.morphTargetsCount,Y.numClippingPlanes=N.numClippingPlanes,Y.numIntersection=N.numClipIntersection,Y.vertexAlphas=N.vertexAlphas,Y.vertexTangents=N.vertexTangents,Y.toneMapping=N.toneMapping}function Rh(E,N,Y,G,W){N.isScene!==!0&&(N=$e),We.resetTextureUnits();const xe=N.fog,Ce=G.isMeshStandardMaterial||G.isMeshLambertMaterial||G.isMeshPhongMaterial?N.environment:null,me=se===null?R.outputColorSpace:se.isXRRenderTarget===!0?se.texture.colorSpace:rt.workingColorSpace,be=G.isMeshStandardMaterial||G.isMeshLambertMaterial&&!G.envMap||G.isMeshPhongMaterial&&!G.envMap,De=A.get(G.envMap||Ce,be),qe=G.vertexColors===!0&&!!Y.attributes.color&&Y.attributes.color.itemSize===4,it=!!Y.attributes.tangent&&(!!G.normalMap||G.anisotropy>0),Pe=!!Y.morphAttributes.position,st=!!Y.morphAttributes.normal,Rt=!!Y.morphAttributes.color;let Mt=On;G.toneMapped&&(se===null||se.isXRRenderTarget===!0)&&(Mt=R.toneMapping);const gt=Y.morphAttributes.position||Y.morphAttributes.normal||Y.morphAttributes.color,Gt=gt!==void 0?gt.length:0,Le=Ge.get(G),qt=T.state.lights;if(q===!0&&(ae===!0||E!==ee)){const yt=E===ee&&G.id===$;Q.setState(G,E,yt)}let ct=!1,ii=!1;G.version===Le.__version?Le.needsLights&&Le.lightsStateVersion!==qt.state.version||W.isBatchedMesh&&Le.batching===!1||!W.isBatchedMesh&&Le.batching===!0||W.isBatchedMesh&&Le.batchingColor===!0&&W._colorsTexture===null||W.isBatchedMesh&&Le.batchingColor===!1&&W._colorsTexture!==null||W.isInstancedMesh&&Le.instancing===!1||!W.isInstancedMesh&&Le.instancing===!0||W.isSkinnedMesh&&Le.skinning===!1||!W.isSkinnedMesh&&Le.skinning===!0||W.isInstancedMesh&&Le.instancingColor===!0&&W.instanceColor===null||W.isInstancedMesh&&Le.instancingColor===!1&&W.instanceColor!==null||W.isInstancedMesh&&Le.instancingMorph===!0&&W.morphTexture===null||W.isInstancedMesh&&Le.instancingMorph===!1&&W.morphTexture!==null||Le.envMap!==De||G.fog===!0&&Le.fog!==xe||Le.numClippingPlanes!==void 0&&(Le.numClippingPlanes!==Q.numPlanes||Le.numIntersection!==Q.numIntersection)||Le.vertexAlphas!==qe||Le.vertexTangents!==it||Le.morphTargets!==Pe||Le.morphNormals!==st||Le.morphColors!==Rt||Le.morphTargetsCount!==Gt||Le.numLightProbeGrids!==ko(T.state.lightProbeGridArray)?ct=!0:(Le.outputColorSpace!==me||Le.toneMapping!==Mt)&&(ii=!0):(ct=!0,Le.__version=G.version);let Ht=Le.currentProgram;(ct===!0||ii===!0)&&(Ht=ii===!0?Ah(G,N,W,me,Mt):Vi(G,N,W),F&&G.isNodeMaterial&&F.onUpdateProgram(G,Ht,Le));let ys=!1,Hn=!1,si=!1;const ot=Ht.getUniforms(),Ft=Le.uniforms;if(_e.useProgram(Ht.program)&&(ys=!0,Hn=!0,si=!0),G.id!==$&&($=G.id,Hn=!0),ys||ee!==E){_e.buffers.depth.getReversed()&&E.reversedDepth!==!0&&(E._reversedDepth=!0,E.updateProjectionMatrix()),ot.setValue(U,"projectionMatrix",E.projectionMatrix),ot.setValue(U,"viewMatrix",E.matrixWorldInverse);const It=ot.map.cameraPosition;It!==void 0&&It.setValue(U,Be.setFromMatrixPosition(E.matrixWorld)),mt.logarithmicDepthBuffer&&ot.setValue(U,"logDepthBufFC",2/(Math.log(E.far+1)/Math.LN2)),(G.isMeshPhongMaterial||G.isMeshToonMaterial||G.isMeshLambertMaterial||G.isMeshBasicMaterial||G.isMeshStandardMaterial||G.isShaderMaterial)&&ot.setValue(U,"isOrthographic",E.isOrthographicCamera===!0),ee!==E&&(ee=E,Hn=!0,si=!0)}if(Le.needsLights&&(qt.state.sunShadowMap.length>0&&ot.setValue(U,"sunShadowMap",qt.state.sunShadowMap,We),qt.state.directionalShadowMap.length>0&&ot.setValue(U,"directionalShadowMap",qt.state.directionalShadowMap,We),qt.state.spotShadowMap.length>0&&ot.setValue(U,"spotShadowMap",qt.state.spotShadowMap,We),qt.state.pointShadowMap.length>0&&ot.setValue(U,"pointShadowMap",qt.state.pointShadowMap,We)),W.isSkinnedMesh){ot.setOptional(U,W,"bindMatrix"),ot.setOptional(U,W,"bindMatrixInverse");const yt=W.skeleton;yt&&(yt.boneTexture===null&&yt.computeBoneTexture(),ot.setValue(U,"boneTexture",yt.boneTexture,We))}W.isBatchedMesh&&(ot.setOptional(U,W,"batchingTexture"),ot.setValue(U,"batchingTexture",W._matricesTexture,We),ot.setOptional(U,W,"batchingIdTexture"),ot.setValue(U,"batchingIdTexture",W._indirectTexture,We),ot.setOptional(U,W,"batchingColorTexture"),W._colorsTexture!==null&&ot.setValue(U,"batchingColorTexture",W._colorsTexture,We));const ln=Y.morphAttributes;if((ln.position!==void 0||ln.normal!==void 0||ln.color!==void 0)&&j.update(W,Y,Ht),(Hn||Le.receiveShadow!==W.receiveShadow)&&(Le.receiveShadow=W.receiveShadow,ot.setValue(U,"receiveShadow",W.receiveShadow)),(G.isMeshStandardMaterial||G.isMeshLambertMaterial||G.isMeshPhongMaterial)&&G.envMap===null&&N.environment!==null&&(Ft.envMapIntensity.value=N.environmentIntensity),Ft.dfgLUT!==void 0&&(Ft.dfgLUT.value=$g()),Hn){if(ot.setValue(U,"toneMappingExposure",R.toneMappingExposure),Le.needsLights&&Ch(Ft,si),xe&&G.fog===!0&&ue.refreshFogUniforms(Ft,xe),ue.refreshMaterialUniforms(Ft,G,Me,Ue,T.state.transmissionRenderTarget[E.id]),Le.needsLights&&Le.numLightProbeGrids>0){const yt=S;let It=0;for(const Rn of T.state.lightProbeGridArray)Rn.texture!==null&&(yt.textures[It]=Rn.texture,yt.min[It]=Rn.boundingBox.min,yt.max[It]=Rn.boundingBox.max,yt.resolution[It]=Rn.resolution,It++);for(const Rn in yt)yt[Rn].length=It;Ft.probesSH.value=yt.textures,Ft.probesMin.value=yt.min,Ft.probesMax.value=yt.max,Ft.probesResolution.value=yt.resolution}ir.upload(U,zo(Le),Ft,We)}if(G.isShaderMaterial&&G.uniformsNeedUpdate===!0&&(ir.upload(U,zo(Le),Ft,We),G.uniformsNeedUpdate=!1),G.isSpriteMaterial&&ot.setValue(U,"center",W.center),ot.setValue(U,"modelViewMatrix",W.modelViewMatrix),ot.setValue(U,"normalMatrix",W.normalMatrix),ot.setValue(U,"modelMatrix",W.matrixWorld),G.uniformsGroups!==void 0){const yt=G.uniformsGroups;for(let It=0,Rn=yt.length;It<Rn;It++){const Vo=yt[It];Ne.update(Vo,Ht),Ne.bind(Vo,Ht)}}return Ht}function Ch(E,N){E.ambientLightColor.needsUpdate=N,E.lightProbe.needsUpdate=N,E.sunLights.needsUpdate=N,E.sunLightShadows.needsUpdate=N,E.directionalLights.needsUpdate=N,E.directionalLightShadows.needsUpdate=N,E.pointLights.needsUpdate=N,E.pointLightShadows.needsUpdate=N,E.spotLights.needsUpdate=N,E.spotLightShadows.needsUpdate=N,E.rectAreaLights.needsUpdate=N,E.hemisphereLights.needsUpdate=N}function Ph(E){return E.isMeshLambertMaterial||E.isMeshToonMaterial||E.isMeshPhongMaterial||E.isMeshStandardMaterial||E.isShadowMaterial||E.isShaderMaterial&&E.lights===!0}this.getActiveCubeFace=function(){return X},this.getActiveMipmapLevel=function(){return k},this.getRenderTarget=function(){return se},this.setRenderTargetTextures=function(E,N,Y){const G=Ge.get(E);G.__autoAllocateDepthBuffer=E.resolveDepthBuffer===!1,G.__autoAllocateDepthBuffer===!1&&(G.__useRenderToTexture=!1),Ge.get(E.texture).__webglTexture=N,Ge.get(E.depthTexture).__webglTexture=G.__autoAllocateDepthBuffer?void 0:Y,G.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(E,N){const Y=Ge.get(E);Y.__webglFramebuffer=N,Y.__useDefaultFramebuffer=N===void 0},this.setRenderTarget=function(E,N=0,Y=0){se=E,X=N,k=Y;let G=null,W=!1,xe=!1;if(E){const me=Ge.get(E);if(me.__useDefaultFramebuffer!==void 0){_e.bindFramebuffer(U.FRAMEBUFFER,me.__webglFramebuffer),ie.copy(E.viewport),we.copy(E.scissor),Fe=E.scissorTest,_e.viewport(ie),_e.scissor(we),_e.setScissorTest(Fe),$=-1;return}else if(me.__webglFramebuffer===void 0)We.setupRenderTarget(E);else if(me.__hasExternalTextures)We.rebindTextures(E,Ge.get(E.texture).__webglTexture,Ge.get(E.depthTexture).__webglTexture);else if(E.depthBuffer){const qe=E.depthTexture;if(me.__boundDepthTexture!==qe){if(qe!==null&&Ge.has(qe)&&(E.width!==qe.image.width||E.height!==qe.image.height))throw new Error("THREE.WebGLRenderer: Attached DepthTexture is initialized to the incorrect size.");We.setupDepthRenderbuffer(E)}}const be=E.texture;(be.isData3DTexture||be.isDataArrayTexture||be.isCompressedArrayTexture)&&(xe=!0);const De=Ge.get(E).__webglFramebuffer;E.isWebGLCubeRenderTarget?(Array.isArray(De[N])?G=De[N][Y]:G=De[N],W=!0):E.samples>0&&We.useMultisampledRTT(E)===!1?G=Ge.get(E).__webglMultisampledFramebuffer:Array.isArray(De)?G=De[Y]:G=De,ie.copy(E.viewport),we.copy(E.scissor),Fe=E.scissorTest}else ie.copy(ze).multiplyScalar(Me).floor(),we.copy(Ye).multiplyScalar(Me).floor(),Fe=Ke;if(Y!==0&&(G=V),_e.bindFramebuffer(U.FRAMEBUFFER,G)&&_e.drawBuffers(E,G),_e.viewport(ie),_e.scissor(we),_e.setScissorTest(Fe),W){const me=Ge.get(E.texture);U.framebufferTexture2D(U.FRAMEBUFFER,U.COLOR_ATTACHMENT0,U.TEXTURE_CUBE_MAP_POSITIVE_X+N,me.__webglTexture,Y)}else if(xe){const me=N;for(let be=0;be<E.textures.length;be++){const De=Ge.get(E.textures[be]);U.framebufferTextureLayer(U.FRAMEBUFFER,U.COLOR_ATTACHMENT0+be,De.__webglTexture,Y,me)}}else if(E!==null&&Y!==0){const me=Ge.get(E.texture);U.framebufferTexture2D(U.FRAMEBUFFER,U.COLOR_ATTACHMENT0,U.TEXTURE_2D,me.__webglTexture,Y)}$=-1};function Ho(E){const N=Ge.get(E);return(N.__readFormat!==E.format||N.__readType!==E.type)&&(N.__readFormat=E.format,N.__readType=E.type,N.__formatReadable=mt.textureFormatReadable(E.format),N.__typeReadable=mt.textureTypeReadable(E.type)),N}this.readRenderTargetPixels=function(E,N,Y,G,W,xe,Ce,me=0){if(!(E&&E.isWebGLRenderTarget)){lt("WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let be=Ge.get(E).__webglFramebuffer;if(E.isWebGLCubeRenderTarget&&Ce!==void 0&&(be=be[Ce],Array.isArray(be)&&(be=be[0])),be){_e.bindFramebuffer(U.FRAMEBUFFER,be);try{const De=E.textures[me],qe=De.format,it=De.type;E.textures.length>1&&U.readBuffer(U.COLOR_ATTACHMENT0+me);const Pe=Ho(De);if(Pe.__formatReadable===!1){lt("WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(Pe.__typeReadable===!1){lt("WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}N>=0&&N<=E.width-G&&Y>=0&&Y<=E.height-W&&U.readPixels(N,Y,G,W,ce.convert(qe),ce.convert(it),xe)}finally{const De=se!==null?Ge.get(se).__webglFramebuffer:null;_e.bindFramebuffer(U.FRAMEBUFFER,De)}}},this.readRenderTargetPixelsAsync=async function(E,N,Y,G,W,xe,Ce,me=0){if(!(E&&E.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let be=Ge.get(E).__webglFramebuffer;if(E.isWebGLCubeRenderTarget&&Ce!==void 0&&(be=be[Ce],Array.isArray(be)&&(be=be[0])),be)if(N>=0&&N<=E.width-G&&Y>=0&&Y<=E.height-W){_e.bindFramebuffer(U.FRAMEBUFFER,be);const De=E.textures[me],qe=De.format,it=De.type;E.textures.length>1&&U.readBuffer(U.COLOR_ATTACHMENT0+me);const Pe=Ho(De);if(Pe.__formatReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(Pe.__typeReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");const st=U.createBuffer();U.bindBuffer(U.PIXEL_PACK_BUFFER,st),U.bufferData(U.PIXEL_PACK_BUFFER,xe.byteLength,U.STREAM_READ),U.readPixels(N,Y,G,W,ce.convert(qe),ce.convert(it),0),U.bindBuffer(U.PIXEL_PACK_BUFFER,null);const Rt=se!==null?Ge.get(se).__webglFramebuffer:null;_e.bindFramebuffer(U.FRAMEBUFFER,Rt);const Mt=U.fenceSync(U.SYNC_GPU_COMMANDS_COMPLETE,0);return U.flush(),await yu(U,Mt,4),U.bindBuffer(U.PIXEL_PACK_BUFFER,st),U.getBufferSubData(U.PIXEL_PACK_BUFFER,0,xe),U.bindBuffer(U.PIXEL_PACK_BUFFER,null),U.deleteBuffer(st),U.deleteSync(Mt),xe}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(E,N=null,Y=0){const G=Math.pow(2,-Y),W=Math.floor(E.image.width*G),xe=Math.floor(E.image.height*G),Ce=N!==null?N.x:0,me=N!==null?N.y:0;We.setTexture2D(E,0),U.copyTexSubImage2D(U.TEXTURE_2D,Y,0,0,Ce,me,W,xe),_e.unbindTexture()},this.copyTextureToTexture=function(E,N,Y=null,G=null,W=0,xe=0){let Ce,me,be,De,qe,it,Pe,st,Rt;const Mt=E.isCompressedTexture?E.mipmaps[xe]:E.image;if(Y!==null)Ce=Y.max.x-Y.min.x,me=Y.max.y-Y.min.y,be=Y.isBox3?Y.max.z-Y.min.z:1,De=Y.min.x,qe=Y.min.y,it=Y.isBox3?Y.min.z:0;else{const ot=Math.pow(2,-W);Ce=Math.floor(Mt.width*ot),me=Math.floor(Mt.height*ot),E.isDataArrayTexture?be=Mt.depth:E.isData3DTexture?be=Math.floor(Mt.depth*ot):be=1,De=0,qe=0,it=0}G!==null?(Pe=G.x,st=G.y,Rt=G.z):(Pe=0,st=0,Rt=0);const gt=ce.convert(N.format),Gt=ce.convert(N.type);let Le;N.isData3DTexture?(We.setTexture3D(N,0),Le=U.TEXTURE_3D):N.isDataArrayTexture||N.isCompressedArrayTexture?(We.setTexture2DArray(N,0),Le=U.TEXTURE_2D_ARRAY):(We.setTexture2D(N,0),Le=U.TEXTURE_2D),_e.activeTexture(U.TEXTURE0),_e.pixelStorei(U.UNPACK_FLIP_Y_WEBGL,N.flipY),_e.pixelStorei(U.UNPACK_PREMULTIPLY_ALPHA_WEBGL,N.premultiplyAlpha),_e.pixelStorei(U.UNPACK_ALIGNMENT,N.unpackAlignment);const qt=_e.getParameter(U.UNPACK_ROW_LENGTH),ct=_e.getParameter(U.UNPACK_IMAGE_HEIGHT),ii=_e.getParameter(U.UNPACK_SKIP_PIXELS),Ht=_e.getParameter(U.UNPACK_SKIP_ROWS),ys=_e.getParameter(U.UNPACK_SKIP_IMAGES);_e.pixelStorei(U.UNPACK_ROW_LENGTH,Mt.width),_e.pixelStorei(U.UNPACK_IMAGE_HEIGHT,Mt.height),_e.pixelStorei(U.UNPACK_SKIP_PIXELS,De),_e.pixelStorei(U.UNPACK_SKIP_ROWS,qe),_e.pixelStorei(U.UNPACK_SKIP_IMAGES,it);const Hn=E.isDataArrayTexture||E.isData3DTexture,si=N.isDataArrayTexture||N.isData3DTexture;if(E.isDepthTexture){const ot=Ge.get(E),Ft=Ge.get(N),ln=Ge.get(ot.__renderTarget),yt=Ge.get(Ft.__renderTarget);_e.bindFramebuffer(U.READ_FRAMEBUFFER,ln.__webglFramebuffer),_e.bindFramebuffer(U.DRAW_FRAMEBUFFER,yt.__webglFramebuffer);for(let It=0;It<be;It++)Hn&&(U.framebufferTextureLayer(U.READ_FRAMEBUFFER,U.COLOR_ATTACHMENT0,Ge.get(E).__webglTexture,W,it+It),U.framebufferTextureLayer(U.DRAW_FRAMEBUFFER,U.COLOR_ATTACHMENT0,Ge.get(N).__webglTexture,xe,Rt+It)),U.blitFramebuffer(De,qe,De+Ce,qe+me,Pe,st,Pe+Ce,st+me,U.DEPTH_BUFFER_BIT,U.NEAREST);_e.bindFramebuffer(U.READ_FRAMEBUFFER,null),_e.bindFramebuffer(U.DRAW_FRAMEBUFFER,null)}else if(W!==0||E.isRenderTargetTexture||Ge.has(E)){const ot=Ge.get(E),Ft=Ge.get(N);_e.bindFramebuffer(U.READ_FRAMEBUFFER,D),_e.bindFramebuffer(U.DRAW_FRAMEBUFFER,z);for(let ln=0;ln<be;ln++)Hn?U.framebufferTextureLayer(U.READ_FRAMEBUFFER,U.COLOR_ATTACHMENT0,ot.__webglTexture,W,it+ln):U.framebufferTexture2D(U.READ_FRAMEBUFFER,U.COLOR_ATTACHMENT0,U.TEXTURE_2D,ot.__webglTexture,W),si?U.framebufferTextureLayer(U.DRAW_FRAMEBUFFER,U.COLOR_ATTACHMENT0,Ft.__webglTexture,xe,Rt+ln):U.framebufferTexture2D(U.DRAW_FRAMEBUFFER,U.COLOR_ATTACHMENT0,U.TEXTURE_2D,Ft.__webglTexture,xe),W!==0?U.blitFramebuffer(De,qe,De+Ce,qe+me,Pe,st,Pe+Ce,st+me,U.COLOR_BUFFER_BIT,U.NEAREST):si?U.copyTexSubImage3D(Le,xe,Pe,st,Rt+ln,De,qe,Ce,me):U.copyTexSubImage2D(Le,xe,Pe,st,De,qe,Ce,me);_e.bindFramebuffer(U.READ_FRAMEBUFFER,null),_e.bindFramebuffer(U.DRAW_FRAMEBUFFER,null)}else si?E.isDataTexture||E.isData3DTexture?U.texSubImage3D(Le,xe,Pe,st,Rt,Ce,me,be,gt,Gt,Mt.data):N.isCompressedArrayTexture?U.compressedTexSubImage3D(Le,xe,Pe,st,Rt,Ce,me,be,gt,Mt.data):U.texSubImage3D(Le,xe,Pe,st,Rt,Ce,me,be,gt,Gt,Mt):E.isDataTexture?U.texSubImage2D(U.TEXTURE_2D,xe,Pe,st,Ce,me,gt,Gt,Mt.data):E.isCompressedTexture?U.compressedTexSubImage2D(U.TEXTURE_2D,xe,Pe,st,Mt.width,Mt.height,gt,Mt.data):U.texSubImage2D(U.TEXTURE_2D,xe,Pe,st,Ce,me,gt,Gt,Mt);_e.pixelStorei(U.UNPACK_ROW_LENGTH,qt),_e.pixelStorei(U.UNPACK_IMAGE_HEIGHT,ct),_e.pixelStorei(U.UNPACK_SKIP_PIXELS,ii),_e.pixelStorei(U.UNPACK_SKIP_ROWS,Ht),_e.pixelStorei(U.UNPACK_SKIP_IMAGES,ys),xe===0&&N.generateMipmaps===!0&&N.mipmapsAutoUpdate===!0&&U.generateMipmap(Le),_e.unbindTexture()},this.initRenderTarget=function(E){Ge.get(E).__webglFramebuffer===void 0&&We.setupRenderTarget(E)},this.initTexture=function(E){E.isCubeTexture?We.setTextureCube(E,0):E.isData3DTexture?We.setTexture3D(E,0):E.isDataArrayTexture||E.isCompressedArrayTexture?We.setTexture2DArray(E,0):We.setTexture2D(E,0),_e.unbindTexture()},this.resetState=function(){X=0,k=0,se=null,_e.reset(),de.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return mn}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;const t=this.getContext();t.drawingBufferColorSpace=rt._getDrawingBufferColorSpace(e),t.unpackColorSpace=rt._getUnpackColorSpace()}}class Zg{positions=[];normals=[];colors=[];indices=[];add(e){e.updateMatrixWorld(!0),e.traverse(t=>{if(!t.isMesh)return;const n=t,s=n.geometry,r=s.getAttribute("position"),a=s.getAttribute("normal");if(!r)return;const o=new Xe().getNormalMatrix(n.matrixWorld),c=(Array.isArray(n.material)?n.material[0]:n.material).color||new Ve(16777215),u=this.positions.length/3,f=new O,d=new O;for(let h=0;h<r.count;h++){f.fromBufferAttribute(r,h).applyMatrix4(n.matrixWorld),this.positions.push(f.x,f.y,f.z),a?d.fromBufferAttribute(a,h).applyMatrix3(o).normalize():d.set(0,1,0),this.normals.push(d.x,d.y,d.z);const p=s.getAttribute("color");this.colors.push(c.r*(p?p.getX(h):1),c.g*(p?p.getY(h):1),c.b*(p?p.getZ(h):1))}if(s.index)for(let h=0;h<s.index.count;h++)this.indices.push(u+s.index.getX(h));else for(let h=0;h<r.count;h++)this.indices.push(u+h)})}triangle(e,t,n,s){const r=this.positions.length/3,a=new O(t[0]-e[0],t[1]-e[1],t[2]-e[2]),o=new O(n[0]-e[0],n[1]-e[1],n[2]-e[2]),l=a.cross(o).normalize();for(const c of[e,t,n])this.positions.push(...c),this.normals.push(l.x,l.y,l.z),this.colors.push(s.r,s.g,s.b);this.indices.push(r,r+1,r+2)}packet(){return{position:new Float32Array(this.positions),normal:new Float32Array(this.normals),color:new Float32Array(this.colors),index:new Uint32Array(this.indices)}}}function ph(i){const e=new Xt;return e.setAttribute("position",new gn(i.position,3)),e.setAttribute("normal",new gn(i.normal,3)),e.setAttribute("color",new gn(i.color,3)),e.setIndex(new gn(i.index,1)),e.computeBoundingSphere(),e}const So=1.435,yo=.075,Qn=(So+yo)/2,jr=(i,e)=>Math.hypot(i[0]-e[0],i[2]-e[2]),$l=(i,e)=>{const t=Math.hypot(e[0]-i[0],e[2]-i[2])||1;return[(e[0]-i[0])/t,0,(e[2]-i[2])/t]},$s=(i,e)=>i[0]*e[0]+i[2]*e[2],Kl=(i,e)=>i.from===e?i.points:i.points.slice().reverse(),Zl=i=>{const e=at(i,0,1);return e*e*(3-2*e)},Eo=i=>{const e=Math.hypot(...i)||1;return i.map(t=>t/e)},ea=(i,e)=>({gaugeRight:Ni(i).map(t=>t*e),unitUp:hc(i)}),mh=(i,e)=>{const t=i.reduce((n,s,r)=>n+s*e[r],0);return Eo(i.map((n,s)=>n-t*e[s]))};function bo(i,e,t){const n=i.segment(at(t,0,i.length)),s=at((t-i.lengths[n])/(i.lengths[n+1]-i.lengths[n]||1),0,1),r=e[n],a=e[n+1],o=Eo(r.gaugeRight.map((l,c)=>ft(l,a.gaugeRight[c],s)));return{gaugeRight:o,unitUp:mh(r.unitUp.map((l,c)=>ft(l,a.unitUp[c],s)),o)}}function Fn(i,e,t,n,s=0){const r=i.sample(t),a=bo(i,e,t);return r.position.map((o,l)=>o+a.gaugeRight[l]*n-a.unitUp[l]*s)}function Jg(i){const e=new ht(i.normalPath),t=new ht(i.branchPath),n=e.lengths[i.toeIndex];return e.points.map((s,r)=>{const a=e.lengths[r],o=e.sample(a),l=t.sample(Math.max(0,a-n)),c=bo(e,i.normalFrames,a),u=l.position.reduce((h,p,v)=>h+(p-o.position[v])*c.gaugeRight[v],0),f=Math.min(0,u)-1.63,d=Math.max(0,u)+1.63;return{topLeft:Fn(e,i.normalFrames,a,f,.29),topRight:Fn(e,i.normalFrames,a,d,.29),bottomLeft:Fn(e,i.normalFrames,a,f-.35,.64),bottomRight:Fn(e,i.normalFrames,a,d+.35,.64)}})}function Qg(i){const e=i.data.network;if(!e?.nodes||!e.edges)return{switches:[],gaps:["No source-node rail graph was supplied."]};const t=new Map(e.edges.map(o=>[o.id,o])),n=new Map(e.nodes.map(o=>[o.id,o])),s=[],r=[],a=e.nodes.filter(o=>o.edges.length===3).sort((o,l)=>o.id.localeCompare(l.id));for(const o of a){const l=o.edges.map(q=>t.get(q)).filter(q=>!!q&&q.points.length>=2);if(l.length!==3)continue;const c=i.project(o.position[0],o.position[2],100);if(!Number.isFinite(c.s)||c.distance>30)continue;let u=0,f=c.s,d=c.distance;if(i.opposingPath){const q=i.opposingPath.nearest(o.position[0],o.position[2]);q.distance<d&&(u=4.2,f=i.travel(0,q.s,4.2),d=q.distance)}if(d>1.8){r.push(`${o.id}: mapped junction is ${d.toFixed(2)} m from the modelled running paths; retained as source graph, not an invented operating switch.`);continue}const h=l.map(q=>Kl(q,o.id)),p=h.map(q=>{const ae=new ht(q);return $l(q[0],ae.sample(Math.min(8,ae.length)).position)});let v=[0,1],m=-1/0;for(const q of[[0,1],[0,2],[1,2]]){const ae=$s(p[q[0]],p[q[1]]);ae>m&&(m=ae,v=q)}const g=[0,1,2].find(q=>!v.includes(q));if(m<.65||v.some(q=>$s(p[q],p[g])>-.65)){r.push(`${o.id}: graph branch is not a supported simple turnout geometry.`);continue}const x=i.lanePose(f,u),M=$s(p[v[0]],x.tangent)>0?1:-1,S=q=>{const ae=new ht(h[q]);let re=0;for(const Be of[6,12,20]){const Ae=ae.sample(Math.min(Be,ae.length)).position,$e=i.travel(f,M*Math.min(Be,ae.length),u);re+=jr(Ae,i.lanePose($e,u).position)}return re},w=S(v[0])<=S(v[1])?v[0]:v[1],T=v.find(q=>q!==w);if(S(w)>9){r.push(`${o.id}: neither outgoing edge continues the modelled running line closely enough for a proved normal route.`);continue}const _=[l[T]];let b=h[T].map(q=>[...q]),P=l[T].from===o.id?l[T].to:l[T].from,R=new ht(b).length;const C=new Set([l[T].id]);for(;R<42;){const q=n.get(P);if(!q||q.edges.length!==2)break;const ae=q.edges.find(Ae=>!C.has(Ae)),re=ae&&t.get(ae);if(!re)break;C.add(re.id);const Be=Kl(re,P);if(jr(b.at(-1),Be[0])>.1)break;b.push(...Be.slice(1)),_.push(re),P=re.from===P?re.to:re.from,R=new ht(b).length}if(R<18){r.push(`${o.id}: reverse edge ends at another unresolved junction before a complete switch can fit.`);continue}const F=new ht(b),V=Math.min(52,F.length),D=F.sample(V).position,z=i.lanePose(f,u).position,X=z.map((q,ae)=>q-b[0][ae]),k=[];for(let q=0;q<V;q+=1){const ae=F.sample(q).position,re=1-Zl(q/Math.min(20,V));k.push(ae.map((Be,Ae)=>Be+X[Ae]*re))}k.push(D);const se=i.lanePose(i.travel(f,M*V,u),u).position;if($s($l(z,se),x.tangent)*M<.5)continue;const ee=D.map((q,ae)=>q-se[ae]),ie=ee[0]*x.right[0]+ee[2]*x.right[2];if(Math.abs(ie)<Qn*2){r.push(`${o.id}: mapped routes do not separate enough to build a complete frog before their next junction.`);continue}const we=ie*M>0?1:-1,Fe=14,K=[],ge=[],Te=[];for(let q=-Fe;q<=V;q+=1){const ae=i.lanePose(i.travel(f,M*q,u),u);K.push(ae.position),ge.push(ea(ae,M)),q<0&&Te.push(ae.position)}jr(K.at(-1),se)>.01&&(K.push(se),ge.push(ea(i.lanePose(i.travel(f,M*V,u),u),M)));const Ue=new ht(k),Me=ea(x,M),Oe=k.map((q,ae)=>{const re=Math.min(ae,V),Be=re>=20?F.sample(re):Ue.sample(Ue.lengths[ae]),Ae=Zl(re/20),$e=Ni(Be),Je=hc(Be),et=Eo(Me.gaugeRight.map((U,St)=>ft(U,$e[St],Ae)));return{gaugeRight:et,unitUp:mh(Me.unitUp.map((U,St)=>ft(U,Je[St],Ae)),et)}}),pt=[...Te,...k],ze=Te.length;let Ye=-1;for(let q=1;q<k.length;q++){const ae=i.lanePose(i.travel(f,M*Math.min(q,V),u),u),re=Ni(ae),Ae=k[q].reduce(($e,Je,et)=>$e+(Je-ae.position[et])*re[et],0);if(Math.abs(Ae)>=Qn*2){Ye=q;break}}if(Ye<5){r.push(`${o.id}: unresolved or excessively tight crossing geometry; reverse route is not fabricated.`);continue}const Ke=i.travel(f,-M*Fe,u),te=i.travel(f,M*V,u);if(s.some(q=>q.lane===u&&Math.max(q.startS,Math.min(Ke,te))<Math.min(q.endS,Math.max(Ke,te)))){r.push(`${o.id}: overlaps a neighbouring simple-switch envelope; compound trackwork requires authoring.`);continue}const he={id:`SW-${o.id}`,s:f,lane:u,sourceNode:o.id,direction:M,normalEdgeIds:[l[g].id,l[w].id],reverseEdgeIds:[l[g].id,l[T].id],branchEdgeIds:_.map(q=>q.id),sourceWayIds:[...new Set([...l,..._].flatMap(q=>q.sourceWayIds||[]))],normalPath:K,normalFrames:ge,reversePath:pt,branchPath:k,branchFrames:Oe,formationSections:[],startS:Math.min(Ke,te),endS:Math.max(Ke,te),toeIndex:ze,hand:we,frogIndex:Ye,sourcePosition:o.position,position:z,sourceFitAdjustment:Math.hypot(...X),sourceEndpoint:D,supportPaths:[K,k],gauge:So,replaceRunningRailWithinSpan:!0,source:"Retained source-node graph in the supplied rail SVG; normal path shares the runtime rail alignment; reverse rejoins its actual mapped edge.",confidence:"Source connectivity retained; blade, frog, bearer dimensions and exact operational permissions are simulator authoring, not surveyed switch/interlocking proof."};he.formationSections=Jg(he),s.push(he)}return s.sort((o,l)=>o.s-l.s||o.lane-l.lane),s.length&&s[0].s>i.length*.5&&r.unshift("The retained node graph supplies eastern junctions only. Western switch topology is not replaced by fictional station-anchor points."),s.length||r.push("No source junction satisfied all simple-turnout connectivity and runtime alignment checks."),{switches:s,gaps:r}}const gh=new _n({color:10726053,roughness:.55,metalness:.35,flatShading:!0}),jg=new _n({color:6643024,roughness:1,flatShading:!0}),e_=new _n({color:9144444,roughness:1,flatShading:!0}),t_=new _n({color:6846060,roughness:.9,flatShading:!0}),Jl=new kn(1,1,1),Ql=i=>new O(...i);function ta(i,e,t,n,s,r,a,o,l=0){const c=[];for(const d of[n,s])for(const h of[l,l+o])for(const p of[-1,1])c.push(...Fn(e,t,d,r+p*a/2,h));const u=new Xt;u.setAttribute("position",new Tt(c,3)),u.setIndex([0,5,4,0,1,5,2,7,3,2,6,7,0,6,2,0,4,6,1,7,5,1,3,7,0,3,1,0,2,3,4,7,6,4,5,7]),u.computeVertexNormals();const f=new kt(u,gh);return f.castShadow=!0,f.receiveShadow=!0,i.add(f),f}function sr(i,e,t,n,s,r){ta(i,e,t,n,s,r,yo,.045),ta(i,e,t,n,s,r,.025,.07,.045),ta(i,e,t,n,s,r,.14,.025,.115)}function n_(i,e){const t=[],n=[];for(let a=1;a<e.length;a++){const o=e[a-1],l=e[a],c=t.length/3;for(const u of[o.topLeft,o.topRight,o.bottomLeft,o.bottomRight,l.topLeft,l.topRight,l.bottomLeft,l.bottomRight])t.push(...u);n.push(...[0,5,4,0,1,5,2,7,3,2,6,7,0,6,2,0,4,6,1,7,5,1,3,7,0,3,1,0,2,3,4,7,6,4,5,7].map(u=>u+c))}const s=new Xt;s.setAttribute("position",new Tt(t,3)),s.setIndex(n),s.computeVertexNormals();const r=new kt(s,e_);r.receiveShadow=!0,i.add(r)}function jl(i,e,t,n={}){const s=new ht(e);for(const r of[-1,1])for(let a=0;a<s.length;a+=1){let o=[[a,Math.min(a+1,s.length)]];for(const l of n.gaps??[])if(l.side===r){const{start:c,end:u}=l;o=o.flatMap(([f,d])=>d<=c||f>=u?[[f,d]]:[[f,Math.min(d,c)],[Math.max(f,u),d]].filter(([h,p])=>p-h>.001))}for(const[l,c]of o)sr(i,s,t,l,c,r*Qn)}}function ec(i,e,t,n){const s=[],r=[],a=[],o=[];for(let u=0;u<=8;u++){const f=u/8,d=t+.1+f*7,h=ft(.008,.04,f),p=Fn(i,e,d,0),v=Fn(i,e,d,1),m=v.map((g,x)=>g-p[x]);for(const[g,x]of[[-h/2,0],[h/2,0],[-h/2,.14],[h/2,.14]]){const M=n*Qn+g,S=Fn(i,e,d,M,x);s.push(...S),r.push(...m),a.push(1-f)}}for(let u=0;u<8;u++){const f=u*4,d=f+4;o.push(f,f+1,d+1,f,d+1,d,f+2,d+2,d+3,f+2,d+3,f+3,f,d,d+2,f,d+2,f+2,f+1,f+3,d+3,f+1,d+3,d+1)}o.push(0,2,3,0,3,1,32,33,35,32,35,34);const l=new Xt;l.setAttribute("position",new Tt(s,3)),l.setIndex(o),l.computeVertexNormals();const c=new kt(l,gh);return c.userData.basePositions=new Float32Array(s),c.userData.rights=new Float32Array(r),c.userData.weights=new Float32Array(a),c.userData.side=n,c.castShadow=!0,c}function i_(i,e={}){const t=new Et;t.name=i.id;const n=new ht(i.normalPath),s=new ht(i.branchPath),r=n.lengths[Math.min(i.toeIndex,n.points.length-1)],a=s.lengths[Math.min(i.frogIndex,s.points.length-1)],o=s.sample(a),l=n.nearest(o.position[0],o.position[2]),c=l.s;e.includeBallast!==!1&&n_(t,i.formationSections),jl(t,i.normalPath,i.normalFrames,{gaps:[{start:r,end:r+7.1,side:i.hand},{start:c-.35,end:c+.35,side:i.hand}]}),jl(t,i.branchPath,i.branchFrames,{gaps:[{start:0,end:7.1,side:-i.hand},{start:a-.35,end:a+.35,side:-i.hand}]});for(let M=-12;M<s.length;M+=.72){const S=n.sample(r+M),w=s.sample(Math.max(0,M)),T=Math.min(0,(w.position[0]-S.position[0])*S.right[0]+(w.position[2]-S.position[2])*S.right[2])-.98,_=Math.max(0,(w.position[0]-S.position[0])*S.right[0]+(w.position[2]-S.position[2])*S.right[2])+.98,b=bo(n,i.normalFrames,r+M),P=Ql(b.gaugeRight),R=Ql(b.unitUp),C=R.clone().cross(P).normalize(),F=new kt(Jl,jg);F.position.fromArray(Fn(n,i.normalFrames,r+M,(T+_)/2,.215)),F.scale.set(.24,.15,_-T),F.quaternion.setFromRotationMatrix(new xt().makeBasis(C,R,P)),F.castShadow=!0,F.receiveShadow=!0,t.add(F)}const u=ec(n,i.normalFrames,r,i.hand),f=ec(s,i.branchFrames,0,-i.hand);u.userData.closesFor="normal",f.userData.closesFor="reverse";for(const M of[u,f])M.name=`${i.id}:blade:${M.userData.closesFor}`,M.userData.id=M.name;const d=[u,f];sr(t,n,i.normalFrames,c-.65,c+.9,i.hand*Qn),sr(t,n,i.normalFrames,c-1.6,c+1.6,-i.hand*(Qn-.16)),sr(t,s,i.branchFrames,Math.max(0,a-1.7),Math.min(s.length,a+1.7),-i.hand*Qn);const h=n.sample(r+4,-i.hand*1.75),p=new kt(Jl,t_);p.position.fromArray(h.position),p.position.y-=.1,p.scale.set(.65,.32,.9),p.rotation.y=h.yaw,t.add(p);const v=new Zg;v.add(t);const m=ph(v.packet());t.clear();const g=new kt(m,new _n({vertexColors:!0,roughness:.8,metalness:.2,flatShading:!0}));g.name=`${i.id}:fixed`,g.userData.id=g.name,g.castShadow=!0,g.receiveShadow=!0,t.add(g,...d),Object.assign(t.userData,{id:i.id,family:"source-connected-turnout",sourceNode:i.sourceNode,normalEdgeIds:i.normalEdgeIds,reverseEdgeIds:i.reverseEdgeIds,source:i.source,confidence:i.confidence,gauge:So,railHeadWidth:yo,railCentreSpacing:Qn*2,blades:d,hand:i.hand,definition:i,supportPaths:i.supportPaths,replaceRunningRailWithinSpan:!0}),t.updateMatrixWorld(!0);const x=new ti().setFromObject(t);return t.userData.bounds={min:x.min.toArray(),max:x.max.toArray()},_h(t,0),t}function _h(i,e){const t=at(e,0,1),n=i.userData.blades;if(n){for(const s of n){const r=s.userData.side,a=s.userData.closesFor==="normal"?1-t:t,o=s.userData.basePositions,l=s.userData.rights,c=s.userData.weights,u=s.geometry.getAttribute("position");for(let f=0;f<u.count;f++){const d=-r*(.044+(1-a)*.18)*c[f];u.setXYZ(f,o[f*3]+l[f*3]*d,o[f*3+1]+l[f*3+1]*d,o[f*3+2]+l[f*3+2]*d)}u.needsUpdate=!0,s.geometry.computeVertexNormals(),s.geometry.computeBoundingSphere()}i.userData.blend=t,i.userData.proved=t===0?"normal":t===1?"reverse":"moving",i.userData.selectedSourceEdges=t===0?i.userData.normalEdgeIds:t===1?i.userData.reverseEdgeIds:null}}class s_{constructor(e){this.route=e,this.trackwork=Qg(e),e.data.trackwork=this.trackwork.switches;for(const t of e.stations)for(const n of[1,-1])for(const[s,r]of[-t.length/2-170,t.length/2+85].entries()){const a=t.s+n*r;a>10&&a<e.length-10&&this.signals.push({id:`SH-${t.id}-${n===1?"U":"D"}${s+1}`,s:a,direction:n,lane:n===1?4.2:0,aspects:s===0?4:3,source:"Designed simulator block; exact signal plan unavailable"})}this.signals.sort((t,n)=>t.s-n.s);for(const t of[1,-1]){const n=this.signals.filter(s=>s.direction===t);for(let s=1;s<n.length;s++){const r=n[s].s-n[s-1].s;if(r<1900)continue;const a=Math.floor(r/1400);for(let o=1;o<=a;o++){const l=n[s-1].s+r*o/(a+1);this.signals.push({id:`SH-SEC-${t}-${s}-${o}`,s:l,direction:t,lane:t===1?4.2:0,aspects:4,source:"Designed intermediate simulator block"})}}}this.signals.sort((t,n)=>t.s-n.s);for(const t of[1,-1]){const n=this.signals.filter(s=>s.direction===t).sort((s,r)=>(s.s-r.s)*t);this.signalGroups.set(t,n),n.forEach((s,r)=>this.signalIndex.set(s.id,r))}this.points=this.trackwork.switches.map(t=>({id:t.id,s:t.s,lane:t.lane,state:"normal",target:"normal",blend:0,lockedBy:null}));for(const t of e.data.crossings||[])this.crossings.push({id:t.id,s:e.sourceS(t.s),state:"open",blend:0,timer:0,held:!1});this.start(1,0)}route;player;ai=[];signals=[];points=[];crossings=[];events=[];calls=[];clock=8*3600+720;elapsed=0;paused=!0;timeScale=1;aws={pending:!1,deadline:0,indicator:!1,brake:!1,lastSignal:"",acknowledged:0};tpws={active:!1,reason:"",stoppedAt:-1,ossEntries:{},tssEntries:{}};stats={spads:0,aiSpads:0,collisions:0,stops:0,awsMissed:0,tpwsInterventions:0,distance:0};sound;onEvent;roadTraffic=new zh;roadAccumulator=0;roadCrossingClear=e=>this.roadTraffic.crossingClear(e);signalGroups=new Map;signalIndex=new Map;trackwork;configureRoadNetwork(e,t){const s=e.filter(r=>oa({id:r.id,kind:String(r.kind||"residential"),width:Number(r.width)||5.6,points:r.points||[]})).map(r=>Bh(r,this.route,t)).filter(r=>!!r);this.roadTraffic.configure(s),this.roadAccumulator=0}advanceRoadTraffic(e){for(this.roadAccumulator+=e;this.roadAccumulator+1e-9>=.05;)this.roadAccumulator=Math.max(0,this.roadAccumulator-.05),this.roadTraffic.update(.05,this.clock-this.roadAccumulator,this.crossings)}log(e,t){const n={time:this.clock,type:e,message:t};this.events.push(n),this.events.length>200&&this.events.shift(),this.onEvent?.(n)}start(e,t=e===1?0:this.route.stations.length-1){this.clock=8*3600+720,this.roadAccumulator=0,this.roadTraffic.reset();const n=this.route.stations[t];this.player={id:"player",s:at(n.s+e*34,4,this.route.length-4),speed:0,direction:e,lane:e===1?4.2:0,length:70.3,cars:3,kind:"172",nextStop:t+e,dwell:0,doors:!1,controller:-1,arrived:!1},this.calls=[],this.aws={pending:!1,deadline:0,indicator:!1,brake:!1,lastSignal:"",acknowledged:0},this.tpws={active:!1,reason:"",stoppedAt:-1,ossEntries:{},tssEntries:{}},this.ai=[],this.elapsed=0,this.events=[],this.stats={spads:0,aiSpads:0,collisions:0,stops:0,awsMissed:0,tpwsInterventions:0,distance:0};for(const s of[1,-1])for(let r=0;r<8;r++){let a=1100+r*(this.route.length-2200)/7+(s===-1?850:0);a=at(a,200,this.route.length-200),s===e&&Math.abs(a-this.player.s)<1200&&(a=at(a+e*1700,150,this.route.length-150));const o=this.route.stations.findIndex(c=>c.s>a),l=s===1?r===0:r===7;this.ai.push({id:`AI-${s}-${r}`,s:a,speed:Es(32),direction:s,lane:s===1?4.2:0,length:l?93.95:70.3,cars:l?4:3,kind:l?"168":"172",nextStop:s===1?o<0?this.route.stations.length:o:o<0?this.route.stations.length-1:o-1,dwell:0,doors:!1,controller:.5,arrived:!1})}for(const s of this.points)s.state="normal",s.target="normal",s.blend=0,s.lockedBy=null;for(const s of this.crossings)s.state="open",s.blend=0,s.timer=0,s.held=!1;this.paused=!0,this.log("journey",`Ready at ${n.name}. Hold A to release the brake.`)}allTrains(){return[this.player,...this.ai.filter(e=>e.portalWaitUntil===void 0)]}interval(e,t=0){const n=this.route.travel(e.s,-e.direction*e.length,e.lane);return[this.route.travel(Math.min(e.s,n),-t,e.lane),this.route.travel(Math.max(e.s,n),t,e.lane)]}occupied(e,t,n,s){const r=Math.min(e,t),a=Math.max(e,t);return this.allTrains().some(o=>{if(o.id===s||Math.abs(o.lane-n)>1)return!1;const[l,c]=this.interval(o);return c>=r&&l<=a})}pointOccupied(e){return this.allTrains().some(t=>{const[n,s]=this.interval(t,18);return e.s>=n&&e.s<=s})}requestPoint(e,t){const n=this.points.find(r=>r.id===e);if(!n)return!1;const s=this.allTrains().some(r=>Math.abs(r.s-n.s)<Math.max(100,r.speed*r.speed/1.2+60));return n.lockedBy||this.pointOccupied(n)||s?(this.log("points",`${e} is locked by an occupied or approaching route.`),!1):(n.target=t,n.state="moving",this.log("points",`${e} requested ${t}.`),!0)}nextSignal(e=this.player){const t=this.signalGroups.get(e.direction)||[];let n=0,s=t.length;for(;n<s;){const a=n+s>>1;(t[a].s-e.s)*e.direction>=-.1?s=a:n=a+1}const r=t[n];return r&&Math.abs(r.lane-e.lane)<1?r:void 0}aspect(e,t="player"){const n=this.signalGroups.get(e.direction)||[],s=this.signalIndex.get(e.id)??-1;if(s<0)return"red";for(let r=0;r<3;r++){const a=n[s+r],o=n[s+r+1];if(!a)break;const l=o?.s??(e.direction===1?this.route.length+100:-100),c=this.points.some(f=>(f.lane===void 0||f.lane===e.lane)&&(f.s-a.s)*e.direction>=0&&(l-f.s)*e.direction>=0&&(f.state==="moving"||f.state==="reverse")),u=this.crossings.some(f=>(f.s-a.s)*e.direction>=0&&(l-f.s)*e.direction>=0&&f.blend<.99);if(this.occupied(a.s+e.direction*3,l+e.direction*90,e.lane,t)||c||u)return r===0?"red":r===1?"yellow":e.aspects===4?"double-yellow":"green"}return"green"}acknowledge(){this.aws.pending&&(this.aws.pending=!1,this.aws.acknowledged++,this.sound?.("ack"),this.log("aws","AWS warning acknowledged.")),this.aws.brake&&this.player.speed<.05&&(this.aws.brake=!1,this.log("aws","AWS brake released at standstill."))}resetTPWS(){return this.tpws.active?this.player.speed>.05||this.tpws.stoppedAt<0||this.clock-this.tpws.stoppedAt<5?(this.log("tpws","Stop the train and wait five seconds before resetting TPWS."),!1):(this.tpws.active=!1,this.tpws.reason="",this.player.controller=-1,this.log("tpws","TPWS reset. Service brake remains applied."),!0):!0}setDirection(e){const t=this.player;if(e===t.direction)return!0;if(t.speed>.05||t.controller>0||t.doors)return this.log("direction","Stop, close doors and select idle/brake before changing direction."),!1;const n=this.route.stations.find(o=>(o.id==="KID"||o.id==="DDG")&&Math.abs(o.s-t.s)<180);if(!n)return this.log("direction","No reverse movement authority at this location."),!1;const s=this.route.travel(t.s,-t.direction*t.length,t.lane),r=this.route.travel(s,e*300,t.lane);if(this.occupied(s,r,t.lane,t.id))return this.log("direction","Reverse route occupied."),!1;t.s=s,t.direction=e;const a=e===1?4.2:0;return t.reverseAuthority=t.lane===a?void 0:{min:n.s-150,max:n.s+150},t.nextStop=this.route.stations.findIndex(o=>o.s>t.s),e===-1&&(t.nextStop=(t.nextStop<0?this.route.stations.length:t.nextStop)-1),t.arrived=!1,this.log("direction",t.reverseAuthority?"Station reversal authorised, maximum 10 mph. Physical consist unchanged.":e===1?"Forward selected.":"Reverse selected."),!0}targetStation(e=this.player){return this.route.stations[e.nextStop]}stopPosition(e,t){return at(e.s+t*Math.min(40,e.length/2-8),3,this.route.length-3)}distanceToStop(e=this.player){const t=this.targetStation(e);return t?this.route.laneDistance(e.s,this.stopPosition(t,e.direction),e.lane)*e.direction:0}triggerTPWS(e){this.tpws.active||(this.tpws={active:!0,reason:e,stoppedAt:-1,ossEntries:{},tssEntries:{}},this.stats.tpwsInterventions++,this.sound?.("tpws"),this.log("tpws",e))}update(e,t){if(this.paused)return;this.clock+=e,this.elapsed+=e;const n=this.player;t.a!==t.d&&(n.controller=at(n.controller+(t.a?.45:-.45)*e,-1,1));for(const p of this.points){const v=this.allTrains().find(m=>(p.s-m.s)*m.direction>-m.length-30&&(p.s-m.s)*m.direction<Math.max(100,m.speed*12));p.lockedBy=v?.id??null,p.state==="moving"&&!this.pointOccupied(p)&&(p.blend=at(p.blend+(p.target==="reverse"?1:-1)*e/2.5,0,1),(p.blend===0||p.blend===1)&&(p.state=p.target))}for(const p of this.crossings){const v=this.allTrains().some(m=>{const g=(p.s-m.s)*m.direction;return g>-m.length-35&&g<Math.max(1e3,m.speed*45)});p.held=v,v&&(p.state==="open"||p.state==="opening")&&(p.state="warning",p.timer=0),p.state==="warning"&&(p.timer+=e)>3&&(this.roadCrossingClear?.(p.s)??!0)&&(p.state="closing"),p.state==="closing"&&(p.blend=at(p.blend+e/3,0,1),p.blend===1&&(p.state="closed")),!v&&p.state==="closed"?(p.timer+=e,p.timer>5&&(p.state="opening")):v&&p.state==="closed"&&(p.timer=0),p.state==="opening"&&(p.blend=at(p.blend-e/3,0,1),p.blend===0&&(p.state="open"))}this.advanceRoadTraffic(e);const s=n.s;n.doors&&(n.dwell-=e,n.dwell<=0&&(n.doors=!1,this.sound?.("doors"),this.log("station","Doors closed. Ready to depart."))),this.aws.pending&&this.clock>this.aws.deadline&&(this.aws.pending=!1,this.aws.brake=!0,this.stats.awsMissed++,this.sound?.("tpws"),this.log("aws","AWS missed. Brake demand. Stop and acknowledge."));const r=n.controller>0?Math.min(.95,6.7/Math.max(5,n.speed))*n.controller:0,a=n.reverseAuthority?this.route.laneDistance(n.s,n.direction===1?n.reverseAuthority.max:n.reverseAuthority.min,n.lane)*n.direction:1/0,o=Math.min(Es(10),Math.sqrt(Math.max(0,2*.65*(a-7))));n.authorityBrake=!!n.reverseAuthority&&(a<=7||n.speed>o);const l=n.controller<0?-.95*n.controller:0,c=this.aws.brake||this.tpws.active?1.25:n.authorityBrake?1.05:0,u=this.route.lanePose(n.s,n.lane),f=.012+2e-4*n.speed*n.speed,d=(n.doors||this.aws.brake||this.tpws.active||n.authorityBrake?0:r)-Math.max(l,c)-f-u.grade*9.81*n.direction;if(n.speed=Math.max(0,n.speed+d*e),n.doors&&(n.speed=0),n.s=this.route.travel(n.s,n.direction*n.speed*e,n.lane),this.stats.distance+=Math.abs(this.route.laneDistance(s,n.s,n.lane)),n.s<0||n.s>this.route.length+2){n.speed=0,n.controller=-1,this.paused=!0,this.log("boundary","You have passed the modelled route boundary. Restart or load a saved journey.");return}for(const p of this.signals){if(p.direction!==n.direction||Math.abs(p.lane-n.lane)>1)continue;const v=this.route.laneDistance(s,p.s,n.lane)*n.direction,m=this.route.laneDistance(n.s,p.s,n.lane)*n.direction,g=this.aspect(p);v>200&&m<=200&&(this.aws.lastSignal=p.id,this.aws.indicator=g!=="green",g==="green"?this.sound?.("clear"):(this.aws.pending=!0,this.aws.deadline=this.clock+2.7,this.sound?.("aws"),this.log("aws",`AWS: ${p.id}, ${g}. Acknowledge with Q.`)));const x=this.tpws.ossEntries??(this.tpws.ossEntries={}),M=w=>this.clock-e+e*at((v-w)/(v-m||1),0,1);if(v>74&&m<=74&&g==="red"&&(x[p.id]={time:M(74),direction:n.direction,lane:n.lane}),v>70&&m<=70){const w=x[p.id];w&&w.direction===n.direction&&w.lane===n.lane&&g==="red"&&M(70)-w.time<4/Math.sqrt(2*.8*55)&&this.triggerTPWS(`TPWS overspeed intervention at ${p.id}.`),delete x[p.id]}const S=this.tpws.tssEntries??(this.tpws.tssEntries={});if(v>1.2&&m<=1.2&&g==="red"&&(S[p.id]={time:M(1.2),direction:n.direction,lane:n.lane}),v>0&&m<=0){if(g==="red"){this.stats.spads++;const w=S[p.id];w&&w.direction===n.direction&&w.lane===n.lane&&M(0)-w.time<1.1&&this.triggerTPWS(`TPWS train-stop intervention at ${p.id}.`)}delete S[p.id]}}const h=this.targetStation();if(h){const p=this.distanceToStop();Math.abs(p)<20&&n.speed<.25&&!this.calls.includes(h.id)?(n.speed=0,n.controller=-1,n.doors=!0,n.dwell=18,this.calls.push(h.id),this.stats.stops++,this.sound?.("doors"),this.log("station",`${h.name}. Doors released; 18 second dwell.`),n.nextStop+=n.direction,(n.nextStop<0||n.nextStop>=this.route.stations.length)&&(n.arrived=!0,this.log("complete","Journey complete."))):p<-100&&!this.calls.includes(h.id)&&(this.log("station",`${h.name} passed.`),n.nextStop+=n.direction)}this.tpws.active&&n.speed<.05&&this.tpws.stoppedAt<0&&(this.tpws.stoppedAt=this.clock);for(const p of this.ai)this.driveAI(p,e);this.checkCollisions()}driveAI(e,t){if(e.portalWaitUntil!==void 0){if(this.clock<e.portalWaitUntil)return;const l=e.direction===1?-220:this.route.length+220;if(Math.abs(l-this.player.s)<1400||this.occupied(l-e.direction*e.length,l+e.direction*100,e.lane,e.id))return;e.portalWaitUntil=void 0,e.s=l,e.speed=0,e.nextStop=e.direction===1?0:this.route.stations.length-1}if(e.dwell>0){e.dwell-=t,e.speed=0,e.doors=!0,e.dwell<=0&&(e.doors=!1,e.nextStop+=e.direction);return}if(e.kind==="168")for(;this.targetStation(e)&&!["KID","SBJ","SGB","BSW","BMO","SOL","DDG"].includes(this.targetStation(e).id);)e.nextStop+=e.direction;const n=this.nextSignal(e),s=n?this.aspect(n,e.id):"green";let r=Es(this.route.limit(e.s)-(e.kind==="168"?0:5));if(n&&s==="red"){const l=this.route.laneDistance(e.s,n.s,e.lane)*e.direction-10;r=Math.min(r,Math.sqrt(Math.max(0,2*.68*l)))}n&&s==="yellow"&&(r=Math.min(r,Es(35)));const a=this.targetStation(e);if(a){const l=this.distanceToStop(e);if(l>-20){if(r=Math.min(r,Math.sqrt(Math.max(0,2*.68*(l-1)))),l<2&&e.speed<.4){e.speed=0,e.dwell=18+Nn(e.id+a.id)%12,e.doors=!0;return}}else e.nextStop+=e.direction}for(const l of this.allTrains()){if(l.id===e.id||Math.abs(l.lane-e.lane)>1)continue;const[c,u]=this.interval(l),f=e.direction===1?c-e.s:e.s-u;f>0&&(r=Math.min(r,Math.sqrt(Math.max(0,2*.7*(f-40)))))}const o=e.s;e.speed=Math.max(0,e.speed+at(r-e.speed,-.9*t,.65*t)),e.s=this.route.travel(e.s,e.direction*e.speed*t,e.lane),n&&(n.s-o)*e.direction>0&&(n.s-e.s)*e.direction<=0&&s==="red"&&this.stats.aiSpads++,(e.s>this.route.length+200||e.s<-200)&&(e.portalWaitUntil=this.clock+45,e.speed=0)}checkCollisions(){const e=this.allTrains();for(let t=0;t<e.length;t++)for(let n=t+1;n<e.length;n++){const s=e[t],r=e[n];if(Math.abs(s.lane-r.lane)>1)continue;const[a,o]=this.interval(s),[l,c]=this.interval(r);if(Math.min(o,c)-Math.max(a,l)>2){s.speed=0,r.speed=0,this.stats.collisions++,this.paused=!0,this.log("collision",`Movement stopped: conflicting occupation ${s.id}/${r.id}.`);return}}}snapshot(){return JSON.parse(JSON.stringify({version:2,worldHash:String(this.route.data.worldHash||this.route.fingerprint),routeFingerprint:this.route.fingerprint,routeLength:this.route.length,clock:this.clock,player:this.player,ai:this.ai,points:this.points,crossings:this.crossings,aws:this.aws,tpws:this.tpws,calls:this.calls,stats:this.stats,timeScale:this.timeScale,roadTraffic:this.roadTraffic.snapshotState(),roadAccumulator:this.roadAccumulator}))}restore(e){if(e.version!==2||e.worldHash!==String(this.route.data.worldHash||this.route.fingerprint)||e.routeFingerprint!==this.route.fingerprint||Math.abs(e.routeLength-this.route.length)>1)throw new Error("This save belongs to another route version. Start a new journey.");if(e.roadTraffic)this.roadTraffic.restoreState(e.roadTraffic);else if(this.roadTraffic.roads.size)throw new Error("This save has no compatible road traffic state. Start a new journey.");this.clock=e.clock,this.player=e.player,this.ai=e.ai,this.points=e.points,this.crossings=e.crossings,this.aws=e.aws,this.tpws=e.tpws,this.calls=e.calls,this.stats=e.stats,this.timeScale=e.timeScale,this.roadAccumulator=Number.isFinite(e.roadAccumulator)?Math.max(0,Math.min(.05,e.roadAccumulator)):0,this.paused=!0,this.log("save","Journey restored, paused.")}clockText(){return new Date(this.clock*1e3).toISOString().slice(11,19)}get speedMph(){return Lh(this.player.speed)}}const L={steel:6712169,dark:2370862,rail:10265505,sleeper:6708303,brick:10312773,brown:7885897,cream:15260865,stone:11774624,roof:5396053,white:15329500,glass:3954272,purple:6510454,yellow:15387468,orange:12876853,green:3892818,leaf:6651211,red:12865091,ballast:9144444,concrete:11052698,black:1515811},r_=new kn(1,1,1),Ci=new mr(1,1,1,8),a_=new mo(1,1,6),Ks=new xo(1,0),pn=.915,tc=new Map;function vh(i,e=!1){const t=`${i}/${e}`;let n=tc.get(t);return n||(n=new _n({color:i,roughness:.86,metalness:.04,flatShading:!0,emissive:e?i:0,emissiveIntensity:e?.9:0}),tc.set(t,n)),n}function Ut(i,e,t,n,s,r,a=1,o=1,l=1,c=!1){const u=new kt(i,vh(e,c));return u.position.set(n,s,r),u.scale.set(a,o,l),u.castShadow=!0,u.receiveShadow=!0,t.add(u),u}function B(i,e,t,n,s,r,a,o,l=!1){return Ut(r_,e,i,t,n,s,r,a,o,l)}function _t(i,e,t,n,s,r,a){return Ut(Ci,e,i,t,n,s,r,a,r)}function on(i,e,t,n,s,r=s){const a=n.clone().sub(t),o=B(i,e,(t.x+n.x)/2,(t.y+n.y)/2,(t.z+n.z)/2,s,a.length(),r);return o.quaternion.setFromUnitVectors(new O(0,1,0),a.normalize()),o}const vt=(i,e,t)=>new O(i,e,t);function nc(i){let e=i|0;return()=>(e=Math.imul(e^e>>>15,1|e),e^=e+Math.imul(e^e>>>7,61|e),((e^e>>>14)>>>0)/4294967296)}function tn(i,e,t,n=[[0,0,0]]){i.updateMatrixWorld(!0);const s=new ti().setFromObject(i),r=String(t.id??`${e}/prototype/${t.seed??1}`);let a=0;return i.traverse(o=>{o!==i&&(o.userData.componentId=`${r}/component/${a++}`,o.userData.instanceRootId=r)}),Object.assign(i.userData,{family:e,generator:"procedural-assets-v1",id:r,requiresWorldInstanceId:t.id===void 0,seed:t.seed??1,source:t.source??"parameterised approximation; see route manifest",confidence:t.confidence??"inferred form",bounds:{min:s.min.toArray(),max:s.max.toArray()},supportAnchors:n,collision:"compound bounds; route clearance is authoritative",textureCount:0}),i}const xh=(()=>{const i=new ur;i.moveTo(-.5,0),i.lineTo(.5,0),i.lineTo(0,1),i.closePath();const e=new gs(i,{depth:1,bevelEnabled:!1,steps:1});return e.translate(0,0,-.5),e})(),o_=(()=>{const i=new Xt;i.setAttribute("position",new Tt([-.5,0,-.5,.5,0,-.5,-.5,0,.5,.5,0,.5,-.5,1,-.5,.5,1,-.5],3)),i.setIndex([0,1,5,0,5,4,0,2,3,0,3,1,4,5,3,4,3,2,0,4,2,1,3,5]);const e=i.toNonIndexed();return e.computeVertexNormals(),i.dispose(),e})(),l_={A:["01110","10001","10001","11111","10001","10001","10001"],B:["11110","10001","10001","11110","10001","10001","11110"],C:["01111","10000","10000","10000","10000","10000","01111"],D:["11110","10001","10001","10001","10001","10001","11110"],E:["11111","10000","10000","11110","10000","10000","11111"],F:["11111","10000","10000","11110","10000","10000","10000"],G:["01111","10000","10000","10111","10001","10001","01111"],H:["10001","10001","10001","11111","10001","10001","10001"],I:["11111","00100","00100","00100","00100","00100","11111"],J:["00111","00010","00010","00010","10010","10010","01100"],K:["10001","10010","10100","11000","10100","10010","10001"],L:["10000","10000","10000","10000","10000","10000","11111"],M:["10001","11011","10101","10101","10001","10001","10001"],N:["10001","11001","10101","10011","10001","10001","10001"],O:["01110","10001","10001","10001","10001","10001","01110"],P:["11110","10001","10001","11110","10000","10000","10000"],Q:["01110","10001","10001","10001","10101","10010","01101"],R:["11110","10001","10001","11110","10100","10010","10001"],S:["01111","10000","10000","01110","00001","00001","11110"],T:["11111","00100","00100","00100","00100","00100","00100"],U:["10001","10001","10001","10001","10001","10001","01110"],V:["10001","10001","10001","10001","10001","01010","00100"],W:["10001","10001","10001","10101","10101","10101","01010"],X:["10001","10001","01010","00100","01010","10001","10001"],Y:["10001","10001","01010","00100","00100","00100","00100"],Z:["11111","00001","00010","00100","01000","10000","11111"],0:["01110","10011","10101","10101","10101","11001","01110"],1:["00100","01100","00100","00100","00100","00100","01110"],2:["01110","10001","00001","00010","00100","01000","11111"],3:["11110","00001","00001","01110","00001","00001","11110"],4:["00010","00110","01010","10010","11111","00010","00010"],5:["11111","10000","10000","11110","00001","00001","11110"],6:["01110","10000","10000","11110","10001","10001","01110"],7:["11111","00001","00010","00100","01000","01000","01000"],8:["01110","10001","10001","01110","10001","10001","01110"],9:["01110","10001","10001","01111","00001","00001","01110"],"-":["00000","00000","00000","11111","00000","00000","00000"],".":["00000","00000","00000","00000","00000","00100","00100"]};function Ki(i,e=.25,t=L.white){const n=[],s=[],r=e/7,a=i.toUpperCase(),o=-a.length*6*r/2;for(let u=0;u<a.length;u++){const f=l_[a[u]];if(f){for(let d=0;d<7;d++)for(let h=0;h<5;h++)if(f[d][h]==="1"){const p=o+(u*6+h)*r,v=(6-d)*r,m=r*.92;n.push(p,v,0,p+m,v,0,p+m,v+m,0,p,v,0,p+m,v+m,0,p,v+m,0);for(let g=0;g<6;g++)s.push(0,0,1)}}}const l=new Xt;l.setAttribute("position",new Tt(n,3)),l.setAttribute("normal",new Tt(s,3));const c=new kt(l,vh(t));return c.userData.geometricLettering=!0,c}function ic(i,e,t=L.rail){for(let n=1;n<e.length;n++){const s=e[n-1],r=e[n],a=r.clone().sub(s).normalize(),o=new O(a.z,0,-a.x).normalize(),l=a.clone().cross(o).normalize(),c=new xt().makeBasis(o,l,a),u=s.clone().add(r).multiplyScalar(.5);for(const[f,d,h,p]of[["head",.075,0,.045],["web",.025,-.045,.07],["foot",.14,-.115,.025]]){const v=u.clone().addScaledVector(l,h-p/2),m=B(i,t,v.x,v.y,v.z,d,p,s.distanceTo(r));m.quaternion.setFromRotationMatrix(c),m.userData.railProfile=f}}}function na(i,e,t,n,s=!1){const r=new Et;r.userData.trackPlatform={x:e,width:t,length:n,heritage:s},i.add(r),i=r,B(i,s?L.brick:L.concrete,e,.375,0,t,1.03,n),B(i,6448996,e,.9,0,t,.03,n);const a=e>0?e-t/2:e+t/2;B(i,L.cream,a,.908,0,.34,.035,n),B(i,L.yellow,a+(e>0?.46:-.46),.922,0,.1,.012,n-3),B(i,12104090,a+(e>0?.7:-.7),.92,0,.24,.025,n-3);for(const o of[-1,1]){const l=Ut(o_,s?L.brick:L.concrete,i,e,0,o*(n/2+2.3),t,pn,4.6);o<0&&(l.rotation.y=Math.PI)}}function sc(i,e,t,n,s,r){B(i,L.roof,e,4+.12,t,n,.24,s),B(i,r?L.cream:11975088,e,4-.06,t,n,.1,s);for(const l of[-1,1])B(i,r?L.cream:L.steel,e+l*(n/2-.08),4-.15,t,.13,.35,s);const o=Math.max(2,Math.floor(s/7));for(let l=0;l<=o;l++){const c=t-s/2+l*s/o;_t(i,r?L.purple:L.steel,e,(4+pn)/2,c,.065,4-pn),on(i,r?L.purple:L.steel,vt(e,3.1,c),vt(e-n*.38,3.86,c),.065),on(i,r?L.purple:L.steel,vt(e,3.1,c),vt(e+n*.38,3.86,c),.065),B(i,L.cream,e,4-.22,c,n-.1,.16,.16)}for(const l of[-1,1])B(i,L.dark,e+l*n/2,4-.02,t,.11,.14,s),_t(i,L.dark,e+l*n/2,2.35,t-s/2+.15,.045,3.15)}function c_(i,e,t,n=16){const a=n/2-.7;B(i,t?L.purple:L.steel,0,6.2,e,n,.35,2.2);for(const o of[-1,1])if(t?(B(i,L.purple,0,6.2+.17,e+o*2.2/2,n,.13,.12),B(i,L.purple,0,6.2+1.18,e+o*2.2/2,n,.13,.12)):B(i,L.steel,0,6.2+.65,e+o*2.2/2,n,1.25,.12),t)for(let l=0;l<Math.ceil(n/.75);l++){const c=-n/2+l*.75;on(i,L.cream,vt(c,6.2+.17,e+o*2.2/2),vt(c+.72,6.2+1.14,e+o*2.2/2),.045),on(i,L.cream,vt(c,6.2+1.14,e+o*2.2/2),vt(c+.72,6.2+.17,e+o*2.2/2),.045)}for(const o of[-a,a]){for(const f of[e-.85,e+.85])B(i,t?L.purple:L.steel,o,3.45,f,.24,5.3,.24);const l=8.2,c=22,u=e+1.1;for(let f=0;f<c;f++){const d=pn+(f+1)*(6.2-pn)/c;B(i,t?L.purple:L.concrete,o,d/2,u+l-f*l/c,1.7,d,l/c+.01)}for(const f of[-.86,.86]){on(i,t?L.cream:L.steel,vt(o+f,1.8,u+l),vt(o+f,6.2+.95,u),.065);for(let d=0;d<=5;d++){const h=d/5;B(i,t?L.cream:L.steel,o+f,1.34+h*(6.2-pn),u+l*(1-h),.06,.95,.06)}}}t&&Ut(xh,L.roof,i,0,6.2+1.6,e,n+.5,.65,2.2+.5)}class h_{station(e){const t=new Et;t.name=`station-${e.id??"unknown"}`;const n=String(e.id??"").toUpperCase(),s=String(e.name??n),r=Math.max(70,e.length??165),a=/HAG|HAGLEY|BMO|MOOR|DDG|DORRIDGE/.test(n+" "+s.toUpperCase()),o=/BSW|SNOW/.test(n+" "+s.toUpperCase()),l=/SGB|GALTON/.test(n+" "+s.toUpperCase()),c=o?5:4.1,u=e.trackSpacing??4.2,f=u/2+1.7,d=f+c/2;na(t,-d,c,r,a),na(t,d,c,r,a);const h=Number(e.canopyLength)||Math.min(r*.56,a?80:65),p=Number(e.canopyCentre??-10);for(const v of[-1,1]){sc(t,v*(d+.15),p,c+.5,o?r:h,a);const m=this.building({width:3.5,depth:a?16:10,height:a?3.2:2.8,style:a?"historic":"station",seed:13});m.position.set(v*(f+c+1.6),pn,-15),t.add(m);for(let x=-r/2+15;x<r/2;x+=24){const M=this.furniture("lamp");M.position.set(v*(f+c-.65),pn,x),t.add(M);const S=this.furniture("bench");S.position.set(v*(d+.6),pn,x+3),S.rotation.y=v>0?-Math.PI/2:Math.PI/2,t.add(S)}const g=Math.min(6.8,Math.max(2.9,s.length*.15));B(t,a?L.purple:L.green,v*d,2.3,r*.28,g,.62,.12);for(const x of[-g*.4,g*.4])B(t,L.steel,v*d+x,1.57,r*.28,.06,1.45,.06);for(const x of[-1,1]){const M=Ki(s,Math.min(.25,g/(Math.max(s.length,1)*.9)),L.white);M.position.set(v*d,2.16,r*.28+x*.065),x<0&&(M.rotation.y=Math.PI),t.add(M)}}if(e.footbridge!==!1&&!/BKD|BLAKEDOWN/.test(n+" "+s.toUpperCase())&&c_(t,-Math.min(48,r*.24),/HAG|HAGLEY/.test(n+" "+s.toUpperCase()),2*(d+1)),(/SBJ|STOURBRIDGE/.test(n+" "+s.toUpperCase())||e.platformCount>=3)&&(na(t,-d-5.9,2.5,85,a),B(t,L.concrete,-d-4.35,.22,38,1.1,.5,1.3)),o){B(t,L.concrete,0,8.4,0,2*(d+c),1.25,r*.86);for(const v of[-d-1,d+1])for(let m=-r*.43;m<r*.43;m+=12)B(t,L.concrete,v,4.8,m,.7,8,.7);for(const v of[-d-5,d+5])B(t,7502974,v,13,-25,7,10,28)}if(l){B(t,L.concrete,0,7.5,-30,29,.85,8.5);for(const v of[-12,12])B(t,L.concrete,v,4,-30,1.2,7.8,7);for(const v of[-1,1])B(t,9349794,v*8,5,-48,2.3,8,3.5)}if(/DDG|DORRIDGE/.test(n+" "+s.toUpperCase())){const v=this.building({width:8,depth:22,height:5.1,style:"historic",seed:21});v.position.set(d+6,pn,-38),t.add(v)}if(/KID|KIDDERMINSTER/.test(n+" "+s.toUpperCase())){const v=this.building({width:9,depth:35,height:4.2,style:"historic",seed:11});v.position.set(-d-15,0,-8),t.add(v),sc(t,-d-12,-5,7,42,!0)}return t.userData.platformEdges=[-f,f],t.userData.platformLength=r,t.userData.platformHeight=pn,tn(t,"station",e,[[-d,0,-r/2],[d,0,r/2]])}building(e){const t=new Et,n=Math.max(1,e.width??7),s=Math.max(1,e.depth??9),r=Math.max(1.2,e.height??6),a=nc(e.seed??1),o=/industrial|warehouse|shed/.test(e.style??""),l=/historic|terrace|brick/.test(e.style??""),c=[L.brick,L.brown,10976347,11770747,12891803][Math.floor(a()*5)];B(t,L.concrete,0,.1,0,n+.15,.2,s+.15),B(t,o?10264986:c,0,r/2+.15,0,n,r,s),o||e.roof==="flat"?(B(t,L.roof,0,r+.25,0,n+.3,.22,s+.3),B(t,L.steel,0,r+.4,0,n*.25,.15,s*.5)):(Ut(xh,l?6904662:L.roof,t,0,r+.15,0,n+.42,Math.min(n*.38,2.7),s+.4),B(t,c,n*.26,r+Math.min(n*.38,2.7)+.15,-s*.25,.55,1.05,.7),B(t,L.cream,n*.26,r+Math.min(n*.38,2.7)+.73,-s*.25,.65,.14,.8));const u=Math.min(5,Math.max(1,Math.floor(r/2.9))),f=Math.min(8,Math.max(1,Math.floor(n/2.5)));for(const h of[-1,1]){for(let v=0;v<u;v++)for(let m=0;m<f;m++){const g=-n/2+(m+.5)*n/f,x=1.6+v*Math.min(3.05,r/u);B(t,L.cream,g,x,h*(s/2+.012),Math.min(1.12,n/f*.58),1.2,.065),B(t,L.glass,g,x,h*(s/2+.052),Math.min(.94,n/f*.46),1.04,.035)}const p=h*(s/2+.04);B(t,l?L.green:L.dark,-n*.26,1.16,p,.9,2,.09),B(t,L.concrete,-n*.26,.14,p+h*.22,1.15,.26,.55)}const d=Math.min(7,Math.max(1,Math.floor(s/3)));for(const h of[-1,1])for(let p=0;p<d;p++)for(let v=0;v<u;v++)B(t,L.glass,h*(n/2+.024),1.6+v*Math.min(3.05,r/u),-s/2+(p+.5)*s/d,.05,1.03,1);for(const h of[-1,1])B(t,L.dark,h*(n/2+.12),r+.08,0,.12,.12,s+.35),_t(t,L.dark,h*(n/2+.12),r/2,s/2-.12,.045,r);return tn(t,"building",e,[[-n/2,0,-s/2],[n/2,0,-s/2],[-n/2,0,s/2],[n/2,0,s/2]])}tree(e={}){const t=new Et,n=e.height??6+(e.seed??1)%6,s=nc(e.seed??7);if(_t(t,6443333,0,n*.36,0,n*.037,n*.72),e.type==="conifer")for(let r=0;r<3;r++)Ut(a_,4349770,t,0,n*(.48+r*.17),0,n*(.26-r*.045),n*.55,n*(.26-r*.045));else{Ut(Ks,[L.leaf,7963211,10263388,5729865][(e.seed??1)%4],t,0,n*.7,0,n*.31,n*.34,n*.29);for(let r=0;r<2;r++)Ut(Ks,r?7570254:5467208,t,(s()-.5)*n*.33,n*(.56+s()*.22),(s()-.5)*n*.3,n*.24,n*.26,n*.23)}return tn(t,"vegetation",e,[[0,0,0]])}signal(e={}){const t=new Et,n=e.height??4.6;if(e.gantry){for(const l of[-1,1])B(t,L.steel,l*6.5,n*.6,0,.28,n*1.2,.28);B(t,L.steel,0,n*1.2,0,13.4,.32,.5);for(let l=-6;l<6;l+=1.3)on(t,L.steel,vt(l,n*1.2-.3,0),vt(l+1.3,n*1.2+.3,0),.08)}else{_t(t,L.steel,0,n/2-.35,0,.075,n-.7),B(t,L.concrete,0,-.08,0,.55,.25,.55);for(let l=.35;l<n-.8;l+=.38)B(t,L.steel,.21,l,-.12,.3,.032,.06);for(const l of[.07,.36])B(t,L.steel,l,(n-.7)/2,-.12,.035,n-.7,.035)}const s=n-.35;B(t,L.black,0,s,0,.58,1.3,.23);const r={red:[],yellow:[],green:[],doubleYellow:[]},a=[["red",s-.42,15746098],["yellow",s-.08,16761641],["green",s+.26,5036939]];(e.aspects===4||e.fourAspect)&&a.push(["doubleYellow",s+.6,16761641]);for(const[l,c,u]of a){const f=Ut(Ci,u,t,0,c,.145,.105,.055,.105,!0);f.rotation.x=Math.PI/2,f.material=new _n({color:1516834,emissive:u,emissiveIntensity:0,roughness:.4}),r[l].push(f),B(t,L.black,0,c+.115,.18,.29,.045,.3)}B(t,L.white,0,n-1.54,.12,.48,.28,.03);const o=Ki(String(e.id??"S").slice(-5),.115,L.black);if(o.position.set(0,n-1.6,.14),t.add(o),e.indicator){B(t,L.black,.35,n+.65,0,.9,.25,.2);for(let l=0;l<5;l++)Ut(Ci,L.white,t,-.01+l*.15,n+.65+l*.09,.15,.035,.035,.035,!0).rotation.x=Math.PI/2}return t.userData.lenses=r,Mh(t,e.aspect??"red"),tn(t,"signal",e)}turnout(e={}){const t=new Et,n=e.length??32,s=e.hand==="left"?-1:typeof e.hand=="number"?e.hand:1,r=1.435,a=.075,o=(r+a)/2;for(let f=0;f<=Math.ceil(n/.64);f++){const d=Math.min(n,f*.64),h=d/n,p=s*3.8*h*h;B(t,L.ballast,p/2,-.465,-d,3.65+Math.abs(p),.35,.88),B(t,L.sleeper,p/2,-.215,-d,2.65+Math.abs(p),.15,.24)}for(const f of[-1,1])ic(t,[vt(f*o,0,0),vt(f*o,0,-n)]);for(const f of[-1,1]){const d=[];for(let h=5;h<=32;h++){const p=h/32,v=s*7.6*p,m=Math.hypot(n,v);d.push(vt(s*3.8*p*p+f*o*n/m,0,-n*p+f*o*v/m))}ic(t,d)}const l=[];for(const f of[-1,1]){const d=f*(r/2-.0225),h=B(t,L.rail,d,-.06,-5,.045,.12,9.6);h.userData.side=f,h.userData.baseX=d,h.userData.stockCentreX=f*o,l.push(h)}const c=Math.sqrt((r+a)/3.8),u=B(t,L.rail,s*o,-.07,-n*c,.1,.14,1.9);u.rotation.y=-s*Math.atan(7.6*c/n);for(const f of[-.65,.65])B(t,L.rail,f,-.06,-n*c,.055,.12,3.7);return B(t,L.dark,s*1.8,-.02,-3,.7,.3,.45),B(t,L.steel,s*.5,-.06,-3,2.4,.055,.06),t.userData.blades=l,t.userData.gauge=r,t.userData.railHeadWidth=a,t.userData.stockRailCentres=[-o,o],t.userData.hand=s,t.userData.routeEnds={normal:[0,0,-n],reverse:[s*3.8,0,-n]},u_(t,e.state==="reverse"?1:0),tn(t,"turnout",e)}masonryArch(e){const t=new Et,n=Number(e.opening)||9.2,s=n/2,r=Number(e.height)||6.8,a=Number(e.depth)||7.5,o=Number(e.shear)||0,l=s+2,c=Number(e.spring)||2.9,u=Number(e.rise)||3.2,f=new ur;f.moveTo(-l,-1),f.lineTo(l,-1),f.lineTo(l,r),f.lineTo(-l,r),f.closePath();const d=new hr;d.moveTo(-s,-.8),d.lineTo(s,-.8),d.lineTo(s,c),d.absellipse(0,c,s,u,0,Math.PI,!1,0),d.lineTo(-s,-.8),d.closePath(),f.holes.push(d);const h=new gs(f,{depth:a,steps:1,bevelEnabled:!1,curveSegments:14});h.translate(0,0,-a/2);const p=h.getAttribute("position");for(let M=0;M<p.count;M++)p.setZ(M,p.getZ(M)+p.getX(M)*o);h.computeVertexNormals(),Ut(h,L.brick,t,0,0,0);const v=l*2,m=v*o,g=Math.hypot(v,m),x=Math.atan2(-v,-m);for(const M of[-1,1]){const S=B(t,L.brick,0,r+.5,M*(a/2-.1),.38,1,g);S.rotation.y=x;const w=B(t,L.stone,0,r+1.05,M*(a/2-.1),.49,.14,g+.3);w.rotation.y=x}return t.userData.opening={width:n,spring:c,rise:u,depth:a,shear:o},t.userData.deckHeight=r,tn(t,"masonry-arch",e,[[-s-1,-1,-a/2],[-s-1,-1,a/2],[s+1,-1,-a/2],[s+1,-1,a/2]].map(([M,S,w])=>[M,S,w+M*o]))}bridge(e={}){const t=new Et,n=e.width??9,s=e.length??18,r=e.height??6,a=String(e.type??"road");B(t,a==="masonry"?L.brick:L.concrete,0,r-.42,0,n,.84,s),B(t,a==="rail"?L.ballast:6843239,0,r+.01,0,n-.45,.1,s);for(const o of[-1,1]){B(t,a==="masonry"?L.brick:L.steel,o*(n/2-.13),r+.55,0,.28,1.2,s),B(t,L.stone,o*(n/2-.13),r+1.18,0,.35,.13,s),B(t,a==="masonry"?L.brick:L.concrete,0,(r-.84)/2,o*(s/2-.65),n+1,r-.84,1.3);for(const l of[-n/2,n/2])B(t,L.concrete,l,(r-.84)/2,o*(s/2+.8),.7,r-.84,2.6)}if(a==="rail"||a==="girder")for(const o of[-n/2+.5,n/2-.5]){B(t,L.steel,o,r-.9,0,.28,.9,s-2);for(let l=0;l<s-2;l+=2)on(t,L.steel,vt(o,r-1.3,-s/2+1+l),vt(o,r-.5,-s/2+3+l),.07)}return t.userData.deckHeight=r,t.userData.opening={width:n-1,height:r-.84,length:s-2.6},tn(t,"bridge",e,[[0,0,-s/2],[0,0,s/2]])}tunnel(e={}){const t=new Et,n=e.width??8.6,s=e.height??6.5,r=e.length??60,a=.5,o=(l,c,u,f)=>{const d=l/2,h=c-d,p=new ur;p.moveTo(-d-u,-.7),p.lineTo(d+u,-.7),p.lineTo(d+u,h),p.absarc(0,h,d+u,0,Math.PI,!1),p.closePath();const v=new hr;v.moveTo(-d,-.45),v.lineTo(-d,h),v.absarc(0,h,d,Math.PI,0,!0),v.lineTo(d,-.45),v.closePath(),p.holes.push(v);const m=new gs(p,{depth:f,steps:1,bevelEnabled:!1,curveSegments:10});return m.translate(0,0,-f/2),m};Ut(o(n,s,a,r),7104607,t,0,0,0);for(const l of[-1,1]){Ut(o(n,s,1.4,1.2),L.brick,t,0,0,l*r/2),B(t,L.stone,0,s+1.18,l*r/2,n+3.2,.22,1.55);for(const c of[-n/2-1.3,n/2+1.3])B(t,L.brick,c,2.7,l*r/2,1.5,6.8,1.5)}for(const l of[-1,1])B(t,7829100,l*(n/2-.3),-.28,0,.34,.25,r);return t.userData.clearOpening={width:n,height:s,length:r},tn(t,"tunnel",e,[[-n/2,0,0],[n/2,0,0]])}roadVehicle(e={}){const t=new Et,n=String(e.kind??"car").toLowerCase(),s=/bus|coach/.test(n),r=/lorry|truck|hgv/.test(n),a=n==="van";if(r){const h=e.color??13815999;B(t,L.dark,0,.59,0,2.05,.32,9.8),B(t,h,0,1.72,-3.64,2.42,2.02,2.72),B(t,L.roof,0,2.82,-3.64,2.44,.2,2.74),B(t,13027518,0,2.11,1.2,2.45,2.7,7.4),B(t,L.steel,0,.76,1.2,2.5,.16,7.5),B(t,L.glass,0,2.2,-5.018,2.08,.9,.045),B(t,L.dark,0,1.21,-5.025,1.6,.34,.06);for(const m of[-1,1])B(t,L.glass,m*1.225,2.18,-3.7,.035,.87,1.9),B(t,L.dark,m*1.43,2.12,-4.75,.15,.28,.14),B(t,15525576,m*.87,1.03,-5.04,.34,.22,.045,!0),B(t,12864323,m*.94,.92,4.94,.28,.18,.04,!0),B(t,L.steel,m*.59,2.08,4.915,1.14,2.42,.025),B(t,L.dark,m*.1,1.9,4.94,.045,.75,.035);for(const m of[-3.6,2.85,4.02])for(const g of[-1.1,1.1]){const x=_t(t,L.black,g,.48,m,.48,.28);x.rotation.z=Math.PI/2;const M=_t(t,L.steel,g*1.02,.48,m,.24,.29);M.rotation.z=Math.PI/2}B(t,L.steel,0,.63,-5.05,2.46,.24,.22),B(t,L.yellow,0,.94,4.94,.45,.14,.035);const p=tn(t,"road-vehicle",{...e}),v=p.userData.bounds;return p.userData.vehicleDimensions={length:v.max[2]-v.min[2],width:v.max[0]-v.min[0],height:v.max[1]},p}const o=s?10.8:r?10:a?5.4:4.5,l=s||r?2.45:1.8,c=s?3.05:r?3.5:a?2.5:1.55,u=e.color??[10770504,6783115,11909033,15657436,4279121][(e.seed??1)%5];B(t,L.dark,0,.45,0,l*.86,.25,o*.85),B(t,u,0,c*.48+.17,0,l,c*.55,o),B(t,u,0,c*.8,r?1.5:.15,l*.92,c*.4,o*.7),r&&B(t,13158329,0,2.25,1.2,2.42,2.6,6.9);const f=r?1.5:.15;B(t,L.glass,0,c*.82,f-o*.35-.025,l*.85,c*.29,.05),B(t,L.glass,0,c*.82,f+o*.35+.025,l*.85,c*.25,.05);for(const h of[-1,1])for(let p=0;p<(s?6:r?1:2);p++)B(t,L.glass,h*(l*.46+.012),c*.8,-o*.29+p*o*(s?.12:.31),.035,c*.29,o*(s?.09:.23));const d=s||r?.43:.32;for(const h of[-l*.46,l*.46])for(const p of[-o*.32,o*.32]){const v=_t(t,L.black,h,d,p,d,.22);v.rotation.z=Math.PI/2;const m=_t(t,L.steel,h*1.02,d,p,d*.5,.24);m.rotation.z=Math.PI/2}for(const h of[-1,1])B(t,16116944,h*l*.31,.7,-o/2-.015,.3,.17,.035,!0),B(t,13191743,h*l*.31,.7,o/2+.015,.26,.17,.035,!0);if(n==="taxi"){B(t,15129e3,0,c+.12,.05,.6,.2,.28);const h=Ki("TAXI",.12,L.black);h.position.set(0,c+.055,-.097),h.rotation.y=Math.PI,t.add(h)}return t.userData.vehicleDimensions={length:o,width:l,height:c},tn(t,"road-vehicle",e,[[-l*.46,0,-o*.32],[l*.46,0,o*.32]])}train(e={kind:"172"}){const t=new Et,n=String(e.kind??"172"),s=n==="139",r=n==="metro",a=n==="emu",o=n==="heritage",l=Math.max(1,e.cars??(s?1:r?3:a?4:3)),c=s?9.6:r?10.5:a?20.4:23,u=r?2.65:2.75,f=n==="168"?13224125:s?15130567:r?12962245:a?13225680:o?8081729:14209724,d=[],h=[],p=[],v=[];for(let m=0;m<l;m++){const g=new Et;g.position.z=m*(c+.65)+c/2,t.add(g),d.push(g),B(g,L.dark,0,.77,0,u*.75,.65,c*.91),B(g,f,0,2.28,0,u,2.45,c-.35),B(g,o?L.brown:L.purple,0,1.14,0,u+.02,.35,c-.3),B(g,n==="172"?L.orange:r?10241915:a?3496314:o?L.cream:3690860,0,1.5,0,u+.025,.23,c-.35),B(g,L.roof,0,3.61,0,u*.92,.27,c-.7);for(const x of[-c*.29,c*.29]){B(g,L.dark,0,.64,x,1.85,.38,2.5);for(const M of[-1.05,1.05])for(const S of[-.755,.755]){const w=_t(g,L.dark,S,.4,x+M,.4,.16);w.rotation.z=Math.PI/2}}for(const x of[-1,1]){for(let M=0;M<(s?4:8);M++)B(g,L.glass,x*(u/2+.012),2.65,-c*.36+M*c*(s?.23:.105),.04,.88,s?1.15:1.55);for(const M of[-c*.33,c*.33]){const S=B(g,n==="172"?L.purple:L.steel,x*(u/2+.035),2.16,M,.045,2.05,1.15);h.push(S),B(g,L.glass,x*(u/2+.065),2.68,M,.035,.75,.8)}}for(const x of[-1,1]){const M=m===0&&x===-1||m===l-1&&x===1;B(g,L.steel,0,.73,x*(c/2-(M?.25:0)),.35,.22,M?.5:.65)}for(const x of[-1,1]){const M=m===0&&x===-1||m===l-1&&x===1;if(B(g,M?r?12962245:L.yellow:L.dark,0,2.1,x*(c/2-.1),u*.91,2.52,.16),B(g,L.glass,0,2.95,x*(c/2-.026),u*.8,.77,.045),M)for(const S of[-.88,.88]){const w=B(g,x===-1?16183241:15293259,S,1.75,x*(c/2-.031),.22,.22,.05,!0);(x===-1?p:v).push(w)}}if(B(g,L.steel,0,3.86,0,u*.54,.26,2.3),(r||a)&&m===Math.min(1,l-1)){B(g,L.dark,0,4.03,0,1.2,.15,1.75);for(const x of[-.4,.4])on(g,L.dark,vt(x,4.1,-.7),vt(x,4.75,.65),.045),on(g,L.dark,vt(x,4.75,.65),vt(x,5.43,0),.045),on(g,L.dark,vt(x,4.1,.7),vt(x,4.75,-.65),.045),on(g,L.dark,vt(x,4.75,-.65),vt(x,5.43,0),.045);B(g,L.dark,0,5.46,0,1.35,.08,.12)}}return t.userData.cars=d,t.userData.doors=h,t.userData.frontLights=p,t.userData.rearLights=v,t.userData.totalLength=l*c+(l-1)*.65,t.userData.carLength=c,t.userData.couplerGap=.65,t.userData.firstCarCentreDistance=c/2,t.userData.noseOffset=0,t.userData.carCentreDistances=Array.from({length:l},(m,g)=>c/2+g*(c+.65)),t.userData.originConvention="front nose at z=0, consist extends in +Z",tn(t,"rolling-stock",e)}crossing(e={}){const t=new Et,n=e.width??7,s=e.tracks??2,r=e.trackSpacing??4.2,a=[];for(let u=0;u<s;u++){const f=(u-(s-1)/2)*r;a.push(f-.755,f+.755)}const o=[-s*r/2-1,...a.flatMap(u=>[u-.1,u+.1]),s*r/2+1];for(let u=0;u<o.length-1;u+=2)B(t,7501677,(o[u]+o[u+1])/2,-.09,0,o[u+1]-o[u],.17,n);const l=[],c=[];for(const u of[-1,1]){const f=u*(s*r/2+1.4),d=u*(n/2+.8);B(t,L.concrete,f,-.12,d,.9,.25,.9),B(t,L.white,f,.7,d,.5,1.4,.5);const h=new Et;h.position.set(f,1.2,d),h.rotation.y=u>0?Math.PI:0,t.add(h);const p=s*r/2+2;for(let m=0;m<Math.ceil(p/.55);m++)B(h,m%2?L.red:L.white,.275+m*.55,0,0,.55,.2,.14);B(h,L.dark,-.28,0,0,.65,.38,.46),l.push({pivot:h,upSign:1});const v=d+u*1.1;B(t,L.black,f,2,v,.85,.65,.18),_t(t,L.steel,f,.95,v,.065,1.9);for(const m of[-.22,.22]){const g=Ut(Ci,L.red,t,f+m,2.12,v+u*.11,.13,.05,.13,!0);g.rotation.x=Math.PI/2,g.material=new _n({color:3153181,emissive:16726059,emissiveIntensity:0}),c.push(g)}B(t,L.yellow,f,1.86,v+u*.11,.2,.16,.04)}return t.userData.barriers=l,t.userData.warningLights=c,Sh(t,e.closed?1:0,0),tn(t,"level-crossing",e)}furniture(e,t={}){const n=new Et;e=e.toLowerCase().replace(/[-_ ]/g,"");const s=(r,a,o,l,c=.1,u=L.white)=>{const f=Ki(r,c,u);return f.position.set(a,o,l),n.add(f),f};if(e==="bench"){B(n,L.brown,0,.48,0,1.8,.12,.52),B(n,L.brown,0,.85,.22,1.8,.63,.08);for(const r of[-.65,.65])B(n,L.steel,r,.23,0,.08,.46,.45),B(n,L.steel,r,.62,0,.09,.1,.63)}else if(e==="lamp")_t(n,L.steel,0,2.5,0,.065,5),B(n,L.concrete,0,-.08,0,.38,.17,.38),B(n,L.dark,0,5,0,.55,.13,.8),B(n,L.white,0,4.91,0,.48,.035,.72,!0);else if(e==="ticketmachine"){B(n,L.concrete,0,.06,0,.85,.12,.65),B(n,4352866,0,.99,0,.65,1.86,.46),B(n,L.dark,0,1.36,.245,.45,.4,.035),B(n,10202784,0,1.36,.267,.35,.29,.025),B(n,L.black,0,.94,.245,.23,.025,.035),B(n,L.dark,0,.7,.27,.3,.08,.1);for(const r of[-.12,0,.12])B(n,L.steel,r,1.05,.255,.065,.065,.025);s("TICKETS",0,1.73,.245,.085),n.userData.facility="ticket-machine"}else if(e==="helppoint"){B(n,L.concrete,0,.045,0,.45,.09,.45),_t(n,L.steel,0,1.1,0,.055,2.2),B(n,4683621,0,1.36,.03,.37,.78,.23),B(n,L.dark,0,1.57,.157,.22,.11,.025);const r=Ut(Ci,13874760,n,0,1.26,.165,.075,.025,.075);r.rotation.x=Math.PI/2,s("HELP",0,1.69,.158,.07),n.userData.facility="help-point"}else if(e==="cctv")_t(n,L.steel,0,2.5,0,.06,5),B(n,L.concrete,0,.04,0,.36,.08,.36),B(n,L.steel,.22,4.72,0,.45,.09,.1),B(n,13225153,.46,4.72,-.12,.22,.2,.5),B(n,L.black,.46,4.72,-.378,.14,.13,.025),B(n,L.steel,.46,4.86,-.13,.3,.055,.58),B(n,12237998,0,3.9,.05,.36,.24,.035),s("CCTV",0,3.84,.075,.065,L.dark),n.userData.facility="cctv";else if(e==="clock"){_t(n,L.steel,0,1.45,0,.06,2.9);const r=_t(n,L.dark,0,2.95,0,.38,.13);r.rotation.x=Math.PI/2;const a=_t(n,L.cream,0,2.95,.076,.335,.025);a.rotation.x=Math.PI/2;for(let c=0;c<12;c++){const u=c*Math.PI/6,f=B(n,L.dark,Math.sin(u)*.28,2.95+Math.cos(u)*.28,.097,.018,.055,.014);f.rotation.z=-u}const o=new Et;o.position.set(0,2.95,.111),o.rotation.z=-(Number(t.hour??10)%12+Number(t.minute??10)/60)*Math.PI/6,B(o,L.dark,0,.085,0,.025,.17,.016),n.add(o);const l=new Et;l.position.set(0,2.95,.118),l.rotation.z=-Number(t.minute??10)*Math.PI/30,B(l,L.dark,0,.12,0,.016,.24,.014),n.add(l),n.userData.hands={hour:o,minute:l}}else if(e==="cyclerack")for(const r of[-.65,0,.65]){for(const a of[-.3,.3])_t(n,L.steel,r,.4,a,.035,.8);B(n,L.steel,r,.8,0,.07,.07,.6);for(const a of[-.3,.3])B(n,L.steel,r,.018,a,.2,.035,.15)}else if(e==="planter"){B(n,L.brick,0,.23,0,1.4,.46,.62),B(n,5852988,0,.465,0,1.22,.035,.45);for(let r=0;r<5;r++){const a=-.48+r*.24;_t(n,L.green,a,.56,0,.018,.18),Ut(Ks,r%2?12480901:12888932,n,a,.7,0,.12,.1,.11)}}else if(e==="departureboard"){for(const r of[-.68,.68])_t(n,L.steel,r,1.15,0,.045,2.3),B(n,L.concrete,r,.03,0,.22,.06,.22);B(n,L.black,0,2.38,0,1.8,.65,.16),s("DEPARTURES",0,2.52,.09,.115,14136940),t.text&&s(String(t.text).slice(0,19),0,2.24,.09,.09,14136940),n.userData.display={text:t.text??"",binding:"station departures"}}else if(e==="busstop")_t(n,L.steel,0,1.35,0,.045,2.7),B(n,L.concrete,0,.025,0,.24,.05,.24),B(n,L.white,0,2.45,0,.46,.61,.08),B(n,L.red,0,2.61,.049,.4,.2,.025),s("BUS",0,2.55,.065,.085),B(n,L.dark,0,1.38,.04,.29,.65,.08),B(n,L.cream,0,1.38,.089,.25,.59,.018),s("TIMES",0,1.56,.101,.045,L.dark);else if(e==="trafficlight"){_t(n,L.steel,0,1.35,0,.055,2.7),B(n,L.concrete,0,.035,0,.3,.07,.3),B(n,L.black,0,2.86,0,.38,1.08,.2);const r={red:[],yellow:[],green:[]};for(const[a,o,l]of[["red",3.16,15156277],["yellow",2.86,15318339],["green",2.56,5094014]]){const c=Ut(Ci,l,n,0,o,.12,.1,.04,.1);c.rotation.x=Math.PI/2,c.material=new _n({color:1516834,emissive:l,emissiveIntensity:a===(t.aspect??"red")?1.1:0}),r[a].push(c),B(n,L.black,0,o+.11,.15,.28,.035,.22)}n.userData.lenses=r,n.userData.aspect=t.aspect??"red"}else if(e==="roadsign"){_t(n,L.steel,0,1,0,.045,2);const r=_t(n,L.red,0,1.95,0,.34,.075);r.rotation.x=Math.PI/2;const a=_t(n,L.white,0,1.95,.045,.28,.025);a.rotation.x=Math.PI/2,s(String(t.text??"30"),0,1.82,.065,.25,L.dark)}else if(e==="gate"){const r=t.width??3;for(const o of[-r/2,r/2])B(n,L.steel,o,.85,0,.12,1.7,.12),B(n,L.concrete,o,.02,0,.3,.04,.3);const a=new Et;a.position.set(-r/2,0,0),n.add(a);for(const o of[.3,1.45])B(a,L.steel,r/2,o,0,r-.16,.08,.08);for(let o=.16;o<r-.1;o+=.2)B(a,L.steel,o,.87,0,.035,1.2,.035);n.userData.hinge=a}else if(e==="fence"){const r=t.length??3,a=t.height??1.6;for(const o of[-r/2,r/2])B(n,L.steel,0,a/2,o,.07,a,.07);for(const o of[.3,a-.2])B(n,L.steel,0,o,0,.045,.05,r);for(let o=-r/2;o<=r/2;o+=.2)B(n,L.steel,0,a/2,o,.035,a,.035)}else if(e==="aws"){B(n,L.yellow,0,.07,0,.47,.15,.58),B(n,L.dark,0,.16,0,.37,.05,.44);for(const r of[-.31,.31])B(n,L.steel,r,-.02,0,.17,.1,.65)}else if(e==="tpws"){for(const r of[-.5,.5])B(n,L.yellow,r,.04,0,.045,.08,1);for(const r of[-.5,.5])B(n,L.yellow,0,.04,r,1,.08,.045)}else if(e==="buffer"){for(const r of[-.755,.755])on(n,L.steel,vt(r,0,.9),vt(r,.9,0),.16),B(n,L.steel,r,.9,0,.18,.22,.5);B(n,L.red,0,.95,-.1,2.5,.4,.3)}else if(e==="person"||e==="staff"){for(const r of[-.13,.13])B(n,3161675,r,.425,0,.18,.85,.22);if(B(n,t.color??(e==="staff"?L.orange:L.purple),0,1.1,0,.48,.62,.28),Ut(Ks,13148805,n,0,1.61,0,.18,.23,.18),e==="staff")for(const r of[1,1.22])B(n,L.yellow,0,r,.15,.48,.055,.025);for(const r of[-.32,.32])B(n,t.color??L.orange,r,1.08,0,.13,.6,.16)}else if(e==="sign"){_t(n,L.steel,0,.95,0,.045,1.9),B(n,L.white,0,1.8,0,.62,.55,.06);const r=Ki(String(t.text??"75"),.28,L.black);r.position.set(0,1.65,.04),n.add(r)}else if(e==="drainage")B(n,L.concrete,0,-.12,0,.48,.2,t.length??3),B(n,L.dark,0,-.01,0,.25,.025,t.length??3);else if(e==="bin")_t(n,L.dark,0,.48,0,.25,.95),B(n,L.steel,0,.94,0,.52,.08,.5),B(n,L.black,0,.8,.255,.23,.075,.025);else if(e==="stairs")for(let r=0;r<10;r++)B(n,L.concrete,0,(r+1)*.09,-r*.3,1.8,(r+1)*.18,.3);else B(n,L.concrete,0,.05,0,.85,.1,.65),B(n,e==="cabinet"?10990756:L.steel,0,.7,0,.68,1.3,.45),B(n,L.dark,.2,.75,.235,.035,.23,.035);return tn(n,e,t)}}function Mh(i,e){const t=i.userData.lenses;if(!t)return;const n=e==="doubleYellow"?["yellow","doubleYellow"]:[e];for(const[s,r]of Object.entries(t))for(const a of r){const o=a.material,l=n.includes(s);o.color.setHex(l?s==="red"?15746098:s==="green"?5036939:16761641:1516834),o.emissiveIntensity=l?1.3:0}i.userData.aspect=e}function u_(i,e){const t=Fc.clamp(e,0,1),n=i.userData.blades;if(n)for(const s of n){const r=s.userData.side,a=r<0?1-t:t;s.position.x=s.userData.baseX-r*(1-a)*.17,s.rotation.y=r*(1-a)*.012}i.userData.blend=t,i.userData.proved=t===0?"normal":t===1?"reverse":"moving"}function Sh(i,e,t=0,n=e>.01){const s=Fc.clamp(e,0,1),r=i.userData.barriers;if(r)for(const o of r)o.pivot.rotation.z=(1-s)*Math.PI/2;const a=i.userData.warningLights;a&&a.forEach((o,l)=>{const c=o.material;c.emissiveIntensity=n&&Math.floor(t*2.8+l)%2===0?1.5:0}),i.userData.closedBlend=s}const ia=i=>{const e=Math.hypot(...i)||1;return i.map(t=>t/e)},rc=(i,e)=>[i[1]*e[2]-i[2]*e[1],i[2]*e[0]-i[0]*e[2],i[0]*e[1]-i[1]*e[0]];function ci(i,e=1,t){const n=ia(t??i.tangent.map(o=>o*e)),s=Ni(i).map(o=>o*e),r=ia(rc(s,n));return{right:ia(rc(n,r)),up:r,forward:n}}function d_(i,e,t){return ci({tangent:[-Math.sin(i)*Math.cos(e),Math.sin(e),-Math.cos(i)*Math.cos(e)],right:[Math.cos(i),0,-Math.sin(i)],bank:t})}function Li(i,e){const t=i.replace(/^\/+/,""),n=t.split("/");if(n.length<2||n[0]!=="data"||n.some(s=>!/^[A-Za-z0-9_-][A-Za-z0-9._-]*$/.test(s)))throw new Error(`Invalid local route data path: ${i}`);return new URL(t,e).href}class f_{constructor(e,t,n,s=8192){this.container=e,this.renderer=t,this.camera=n,this.maximumDimension=s,window.addEventListener("resize",this.schedule),typeof ResizeObserver<"u"&&(this.observer=new ResizeObserver(this.schedule),this.observer.observe(e)),this.resize()}container;renderer;camera;maximumDimension;observer;frame=0;scale=.5;last="";disposed=!1;schedule=()=>{!this.disposed&&!this.frame&&(this.frame=requestAnimationFrame(()=>{this.frame=0,this.resize()}))};setScale(e){this.scale=Number.isFinite(e)?Math.max(.5,Math.min(1,e)):.5,this.resize()}resize(){if(this.disposed)return;const e=Math.floor(this.container.clientWidth),t=Math.floor(this.container.clientHeight);if(!Number.isFinite(e)||!Number.isFinite(t)||e<1||t<1)return;const n=Math.min(this.scale,this.maximumDimension/e,this.maximumDimension/t,Math.sqrt(16777216/(e*t))),s=`${e}/${t}/${n}`;s!==this.last&&(this.renderer.setDrawingBufferSize(e,t,n),this.camera.aspect=e/t,this.camera.updateProjectionMatrix(),this.last=s)}dispose(){this.disposed=!0,this.observer?.disconnect(),window.removeEventListener("resize",this.schedule),this.frame&&cancelAnimationFrame(this.frame),this.frame=0}}class p_{constructor(e,t,n,s){this.container=e,this.data=t,this.route=n,this.sim=s;const r=document.createElement("canvas");let a=null;try{a=r.getContext("webgl2",{antialias:!0,alpha:!1,powerPreference:"high-performance"})}catch{}if(!a)throw new Error("WebGL 2 is unavailable. Enable hardware acceleration or use a current browser with WebGL 2 support.");this.renderer=new Kg({canvas:r,context:a,antialias:!0,alpha:!1,powerPreference:"high-performance"}),r.addEventListener("webglcontextlost",this.contextLost),this.gpuInfo=String(a.getParameter(a.RENDERER)||"WebGL 2"),this.renderer.setPixelRatio(.5),this.renderer.setClearColor(13489868),this.renderer.toneMapping=to,this.renderer.toneMappingExposure=1,this.renderer.shadowMap.enabled=!0,this.scene.background=new Ve(13489868),this.scene.fog=this.fog,this.scene.add(this.ambient,this.sun),this.sun.position.set(-140,250,-80),this.sun.castShadow=!0,this.sun.shadow.mapSize.set(1024,1024),Object.assign(this.sun.shadow.camera,{left:-95,right:95,top:95,bottom:-95,near:1,far:650}),this.sun.shadow.bias=-5e-4,this.sun.shadow.normalBias=.12,this.sun.shadow.camera.updateProjectionMatrix(),this.scene.add(this.sun.target),this.container.appendChild(this.renderer.domElement),this.renderer.domElement.setAttribute("aria-label","View from the front of the train"),this.worker=this.createWorker(),this.viewport=new f_(this.container,this.renderer,this.camera,Number(a.getParameter(a.MAX_RENDERBUFFER_SIZE))||8192)}container;data;route;sim;scene=new Qu;camera=new dn(62,1,.2,2400);factory=new h_;get roadTraffic(){return this.sim.roadTraffic}loopFootGeometry=new kn(.18,.25,.18);loopFootMaterial=new _n({color:5397332,roughness:.95});renderer;viewport;worker;ready=!1;loaded=new Map;requested=new Set;tileRetries=new Map;requestTokens=new Map;requestTimers=new Map;requestAborts=new Map;nextRequestToken=0;terrainSource;workerFailures=0;disposed=!1;adjacent=[];walkers=new Map;signalModels=new Map;pointModels=new Map;crossingModels=new Map;trainModels=new Map;carModels=new Map;fog=new uo(13489868,450,1700);sun=new jd(16772559,3);ambient=new Zd(14083564,7964251,2.7);gpuInfo="WebGL 2";tileCount=0;triangles=0;placements=0;failures=[];frameTimes=[];onProgress;onError;contextLost=e=>{if(e.preventDefault(),this.disposed)return;const t=new Error("Graphics context lost. Reload to reconnect graphics.");this.failures.push(t.message),this.sim.paused=!0,this.onError?.(t)};quality="balanced";lastS=-1/0;previousCamera=new O;firstFrame=!0;warmFrames=0;async init(e){if(this.renderer.getContext().isContextLost())throw new Error("The WebGL 2 context was lost. Reload to reconnect graphics.");const t=await fetch(Li("data/adjacent-services.json",document.baseURI));if(t.ok){const n=await t.json();this.data.adjacentServices=n.services;for(const s of n.services){const r=s.kind==="shuttle"?"139":s.kind==="tram"?"metro":s.kind==="heritage"?"heritage":"emu",a=this.factory.train({id:s.id,kind:r,cars:s.cars});this.scene.add(a),this.adjacent.push({data:s,path:new ht(s.points),model:a})}}this.terrainSource=e,this.initialiseWorker(),this.makeInfrastructure()}createWorker(){const e=new Worker(new URL(""+new URL("world.worker-intzf3Kn.js",import.meta.url).href,import.meta.url),{type:"module"});return e.onmessage=t=>{e===this.worker&&!this.disposed&&this.onWorker(t.data)},e.onerror=t=>{t.preventDefault(),e===this.worker&&!this.disposed&&this.restartWorker(t.message||"World worker failed")},e}initialiseWorker(){if(!this.terrainSource)return;const e=this.terrainSource.slice(0);this.worker.postMessage({type:"init",route:this.data,terrain:e},[e])}restartWorker(e){this.ready=!1,this.worker.terminate();for(const t of[...this.requested])this.tileFailed(t,e);if(++this.workerFailures>=4||!this.terrainSource){const t=`Scenery worker could not recover: ${e}. Reload and try again.`;this.failures.push(t),this.onError?.(new Error(t));return}this.worker=this.createWorker(),this.initialiseWorker()}clearRequest(e){const t=this.requestTimers.get(e);t!==void 0&&window.clearTimeout(t),this.requestTimers.delete(e),this.requestAborts.get(e)?.abort(),this.requestAborts.delete(e),this.requestTokens.delete(e),this.requested.delete(e)}onWorker(e){if(e.type==="ready"){this.ready=!0,this.updateTiles(!0);return}if(e.type==="tile"&&typeof e.id!="string"||e.id&&(!this.requestTokens.has(e.id)||e.token!==this.requestTokens.get(e.id)))return;if(e.type==="error"){const a=e.error||e.message||"World generation failed.";e.id?this.tileFailed(e.id,a):this.restartWorker(a);return}if(e.type!=="tile")return;const t=e.mesh||e.result?.mesh;if(!t){e.id&&this.tileFailed(e.id,"Worker returned no geometry");return}if(!(t.position instanceof Float32Array)||!(t.normal instanceof Float32Array)||!(t.color instanceof Float32Array)||!(t.index instanceof Uint32Array)||!t.position.length||t.position.length%3!==0||t.normal.length!==t.position.length||t.color.length!==t.position.length||!t.index.length||t.index.length%3!==0){e.id&&this.tileFailed(e.id,"Worker returned malformed geometry");return}let n;try{n=ph(t)}catch(a){e.id&&this.tileFailed(e.id,`Invalid geometry: ${a instanceof Error?a.message:String(a)}`);return}this.clearRequest(e.id),this.workerFailures=0,this.tileRetries.delete(e.id);const s=new _n({vertexColors:!0,roughness:.94,metalness:0,side:Sn,flatShading:!0}),r=new kt(n,s);r.receiveShadow=!0,r.castShadow=!0,r.name=`tile:${e.id}`,this.scene.add(r),this.loaded.set(e.id,{mesh:r,used:performance.now()}),this.tileCount=this.loaded.size,this.triangles+=t.index.length/3,this.placements+=(e.placements||[]).length;for(const a of e.pedestrianPaths||[]){if(this.walkers.has(a.id))continue;const o=this.factory.furniture("person",{id:a.id,color:a.role==="staff"?13673292:6386570});this.scene.add(o),this.walkers.set(a.id,{path:new ht(a.points),model:o,speed:a.speed||.7,phase:sa(a.id)%20})}this.evictInactiveTiles(),this.onProgress?.(),this.updateTiles(!0)}tileFailed(e,t){this.clearRequest(e);const n=(this.tileRetries.get(e)?.attempts??0)+1,s=performance.now()+Math.min(4e3,250*2**(n-1));if(this.tileRetries.set(e,{attempts:n,next:s}),n>=4){const r=`Scenery tile ${e} failed after ${n} attempts: ${t}`;this.failures.push(r),this.onError?.(new Error(r));return}window.setTimeout(()=>{this.disposed||this.updateTiles(!0)},Math.max(1,Math.ceil(s-performance.now())+1)),this.updateTiles(!0)}setQuality(e){this.quality=e,this.renderer.shadowMap.enabled=e!=="low",this.updateTiles(!0)}setRenderScale(e){this.viewport.setScale(e)}resetTraffic(){for(const e of this.carModels.values())this.scene.remove(e);this.carModels.clear()}async preparePosition(){this.updateTiles(!0);const e=this.route.lanePose(this.sim.player.s,this.sim.player.lane).position,t=this.data.tiles.filter(n=>Math.hypot(Math.max(n.bounds[0]-e[0],0,e[0]-n.bounds[2]),Math.max(n.bounds[1]-e[2],0,e[2]-n.bounds[3]))<250).map(n=>n.id);await new Promise((n,s)=>{const r=performance.now(),a=()=>{t.every(o=>this.loaded.has(o))?n():performance.now()-r>9e4?s(new Error("The departure scenery could not be prepared. Reload and try again.")):setTimeout(a,150)};a()})}place(e,t,n=0,s=!1){const r=this.route.sample(t,n);e.position.fromArray(r.position),e.rotation.set(r.pitch,r.yaw+(s?Math.PI:0),-r.bank),this.scene.add(e)}placeOnLane(e,t,n,s=0,r=0,a=!1){const o=this.route.lanePose(t,n);e.position.set(o.position[0]+o.right[0]*s,o.position[1]+r,o.position[2]+o.right[2]*s),e.rotation.y=o.yaw+(a?Math.PI:0),this.scene.add(e)}placeRailDevice(e,t,n,s,r){const a=this.route.lanePose(t,n),o=ci(a,r);e.position.set(...a.position).addScaledVector(new O(...o.up),s),Zi(e,o),this.scene.add(e)}makeInfrastructure(){for(const e of this.sim.signals){const t=this.factory.signal({id:e.id,aspect:"red",aspects:e.aspects});this.placeOnLane(t,e.s,e.lane,-e.direction*2.1,-.4,e.direction===-1),this.signalModels.set(e.id,t);for(const n of[200,74,70,1.2,0]){const s=this.factory.furniture(n===200?"aws":"tpws",{id:`${e.id}/${n===200?"aws":"tpws-"+n}`,source:e.source});if(n!==200){const a=[];for(const l of[-.5,.5])for(const c of[-.42,.42]){const u=new kt(this.loopFootGeometry,this.loopFootMaterial);u.position.set(l,-.12,c),u.userData.componentId=`${s.userData.id}/bed-mount/${l}/${c}`,u.castShadow=!0,u.receiveShadow=!0,s.add(u),a.push([l,-.245,c])}s.userData.supportAnchors=a,s.userData.parentSupport="rail-bed",s.userData.intentionalIntersections="Footings extend 45 mm into nominal ballast, allowing for local grade.",s.updateMatrixWorld(!0);const o=new ti().setFromObject(s);s.userData.bounds={min:o.min.toArray(),max:o.max.toArray()}}const r=this.route.travel(e.s,-e.direction*n,e.lane);this.placeRailDevice(s,r,e.lane,n===200?-.22:-.09,e.direction)}}for(const e of this.sim.trackwork.switches){const t=i_(e);this.scene.add(t),this.pointModels.set(e.id,t)}for(const e of this.sim.crossings){const t=Math.abs(this.route.laneOffset(e.s,4.2)),n=this.factory.crossing({id:e.id,width:7,tracks:2,trackSpacing:t});this.place(n,e.s,this.route.laneOffset(e.s,4.2)/2),this.crossingModels.set(e.id,n)}}async updateTiles(e=!1){if(!this.ready)return;const t=this.sim.player.s;if(!e&&Math.abs(t-this.lastS)<100)return;this.lastS=t;const n=this.route.sample(t).position,s=this.quality==="high"?1750:this.quality==="low"?900:1300,r=performance.now(),a=this.data.tiles.map(l=>{const c=l.bounds,u=Math.hypot(Math.max(c[0]-n[0],0,n[0]-c[2]),Math.max(c[1]-n[2],0,n[2]-c[3]));return{tile:l,d:u}}).filter(l=>l.d<s).sort((l,c)=>l.d-c.d),o=new Set(a.map(l=>l.tile.id));for(const{tile:l}of a){const c=this.loaded.get(l.id);if(c){c.used=r;continue}if(this.requested.size)break;const u=this.tileRetries.get(l.id);if(u&&(u.attempts>=4||r<u.next))continue;const f=++this.nextRequestToken,d=new AbortController;this.requested.add(l.id),this.requestTokens.set(l.id,f),this.requestAborts.set(l.id,d);const h=window.setTimeout(()=>d.abort(),3e4);try{const p=await fetch(Li(l.url,document.baseURI),{signal:d.signal});if(!p.ok)throw new Error(`Could not load route tile ${l.id} (HTTP ${p.status})`);const v=await p.json();if(this.requestTokens.get(l.id)!==f)return;this.requestAborts.delete(l.id);const m=window.setTimeout(()=>{this.requestTokens.get(l.id)===f&&this.restartWorker(`Tile ${l.id} generation timed out`)},9e4);this.requestTimers.set(l.id,m),this.worker.postMessage({type:"build",tile:v,token:f})}catch(p){this.requestTokens.get(l.id)===f&&this.tileFailed(l.id,p instanceof Error?p.message:String(p))}finally{window.clearTimeout(h)}break}this.evictInactiveTiles(o)}evictInactiveTiles(e){if(this.loaded.size>25){if(!e){const t=this.route.lanePose(this.sim.player.s,this.sim.player.lane).position,n=this.quality==="high"?1750:this.quality==="low"?900:1300;e=new Set(this.data.tiles.filter(s=>Math.hypot(Math.max(s.bounds[0]-t[0],0,t[0]-s.bounds[2]),Math.max(s.bounds[1]-t[2],0,t[2]-s.bounds[3]))<n).map(s=>s.id))}for(const[t,n]of[...this.loaded].sort((s,r)=>s[1].used-r[1].used)){if(this.loaded.size<=22)break;e.has(t)||(this.triangles-=n.mesh.geometry.index.count/3,this.scene.remove(n.mesh),n.mesh.geometry.dispose(),n.mesh.material.dispose(),this.loaded.delete(t),this.requested.delete(t))}}this.tileCount=this.loaded.size}draw(e){const t=performance.now();this.updateTiles();const n=this.sim.player,s=this.route.lanePose(n.s,n.lane),r=n.direction,a=ci(s,r),o=new O(...s.position).addScaledVector(new O(...a.up),2.45),l=this.route.lanePose(this.route.travel(n.s,r*38,n.lane),n.lane),c=new O(...l.position);c.addScaledVector(new O(...ci(l,r).up),2.25),this.firstFrame||this.previousCamera.distanceTo(o)>30?(this.camera.position.copy(o),this.firstFrame=!1):this.camera.position.lerp(o,1-Math.exp(-e*18)),this.previousCamera.copy(o),this.camera.up.fromArray(a.up),this.camera.lookAt(c);const u=this.route.tunnelAt(n.s),f=u?.78:1.1;this.renderer.toneMappingExposure+=(f-this.renderer.toneMappingExposure)*Math.min(1,e*2),this.ambient.intensity=u?1.1:2.7,this.sun.position.copy(o).add(new O(-140,250,-80)),this.sun.target.position.copy(o),this.sun.target.updateMatrixWorld();for(const h of this.sim.signals){const p=this.signalModels.get(h.id);p.visible=Math.abs(h.s-n.s)<1900,p.visible&&Mh(p,this.sim.aspect(h).replace("double-yellow","doubleYellow"))}for(const h of this.sim.points){const p=this.pointModels.get(h.id);p&&(p.visible=Math.abs(h.s-n.s)<1500,p.visible&&p.userData.blend!==h.blend&&_h(p,h.blend))}for(const h of this.sim.crossings){const p=this.crossingModels.get(h.id);p.visible=Math.abs(h.s-n.s)<1500,p.visible&&Sh(p,h.blend,this.sim.clock,h.state!=="open")}for(const h of this.sim.ai){let p=this.trainModels.get(h.id);const[v,m]=this.sim.interval(h);if(h.portalWaitUntil!==void 0||m<0||v>this.route.length||Math.abs(h.s-n.s)>1800){p&&(p.visible=!1);continue}p||(p=this.factory.train({id:h.id,kind:h.kind,cars:h.cars}),this.trainModels.set(h.id,p),this.scene.add(p)),p.visible=!0;const g=p.userData.cars;if(g){p.position.set(0,0,0),p.rotation.set(0,0,0);const x=Number(p.userData.carLength)||23,M=Number(p.userData.couplerGap)||.65;g.forEach((S,w)=>{const T=this.route.travel(h.s,-h.direction*(x/2+w*(x+M)),h.lane),_=this.route.lanePose(this.route.travel(T,h.direction*x*.29,h.lane),h.lane),b=this.route.lanePose(this.route.travel(T,-h.direction*x*.29,h.lane),h.lane),P=_.position.map((R,C)=>R-b.position[C]);S.position.set((_.position[0]+b.position[0])/2,(_.position[1]+b.position[1])/2,(_.position[2]+b.position[2])/2),Zi(S,ci(this.route.lanePose(T,h.lane),h.direction,P))})}else{const x=this.route.lanePose(h.s,h.lane);p.position.fromArray(x.position),Zi(p,ci(x,h.direction))}}for(const h of this.adjacent){const{data:p,path:v,model:m}=h,g=Number(m.userData.totalLength)||70,x=Number(p.cycleSeconds)||240,M=this.sim.clock%x/x,S=p.metadata?.static?!0:M<.5,w=at((S?M:1-M)*2*1.2-.1,0,1),T=p.metadata?.static?v.length*.55:m_(g/2,v.length-g/2,w),_=T,b=v.sample(_).position;if(m.visible=Math.hypot(b[0]-o.x,b[2]-o.z)<1600,!m.visible)continue;x_(m,S?1:-1,!!p.metadata?.static),m.userData.cars?.forEach((C,F)=>{const V=v.sample(T+g/2-(Number(m.userData.firstCarCentreDistance)+F*(Number(m.userData.carLength)+.65)));C.position.fromArray(V.position),Zi(C,ci(V,1))})}for(const h of this.walkers.values()){const p=(this.sim.clock+h.phase)*h.speed%(h.path.length*2),v=p<=h.path.length,m=v?p:h.path.length*2-p,g=h.path.sample(m);h.model.visible=Math.hypot(g.position[0]-o.x,g.position[2]-o.z)<350,h.model.visible&&(h.model.position.fromArray(g.position),h.model.rotation.y=g.yaw+(v?0:Math.PI))}for(const h of this.roadTraffic.cars.values()){let p=this.carModels.get(h.id);if(Math.hypot(h.position[0]-o.x,h.position[2]-o.z)>950){p&&(p.visible=!1);continue}p||(p=this.factory.roadVehicle({kind:h.kind,id:h.id,seed:sa(h.id),color:[15328469,5466997,10183246,5594452][sa(h.id)%4]}),this.carModels.set(h.id,p),this.scene.add(p)),p.visible=!0,p.position.fromArray(h.position),Zi(p,d_(h.yaw,h.pitch||0,h.bank||0))}this.renderer.render(this.scene,this.camera);const d=performance.now()-t;this.warmFrames++>60&&(this.frameTimes.push(d),this.frameTimes.length>600&&this.frameTimes.shift())}async finishFrame(){this.renderer.getContext().finish()}stats(){return{backend:this.renderer.getContext().isContextLost()?"unavailable":"WebGL2",adapter:this.gpuInfo,tiles:this.tileCount,triangles:this.triangles,placements:this.placements,gpuErrors:this.failures,drawCalls:this.renderer.info.render.calls,memory:this.renderer.info.memory}}dispose(){this.disposed=!0,this.viewport.dispose();for(const e of[...this.requested])this.clearRequest(e);this.renderer.domElement.removeEventListener("webglcontextlost",this.contextLost),this.worker.terminate(),this.renderer.dispose()}}function m_(i,e,t){return i+(e-i)*t}function sa(i){let e=0;for(const t of i)e=Math.imul(e,31)+t.charCodeAt(0);return e>>>0}const ac=new xt,g_=new O,__=new O,v_=new O;function Zi(i,e){ac.makeBasis(g_.fromArray(e.right),__.fromArray(e.up),v_.fromArray(e.forward).negate()),i.quaternion.setFromRotationMatrix(ac)}function x_(i,e,t=!1){if(!(i.userData.lightDirection===e&&i.userData.parkedLights===t)){for(const[n,s]of[[1,i.userData.frontLights],[-1,i.userData.rearLights]])for(const r of s||[]){r.userData.ownLampMaterial||(r.material=r.material.clone(),r.userData.ownLampMaterial=!0),r.visible=!t;const a=r.material,o=n===e?16183241:15293259;a.color.setHex(o),a.emissive.setHex(o)}i.userData.lightDirection=e,i.userData.parkedLights=t}}class M_{context;master;traction;tractionGain;horn;warning;rolling;brake;ambience;crossing;reverb;volume=.35;async init(){if(this.context){await this.context.resume();return}const e=new AudioContext;this.context=e,this.master=e.createGain(),this.master.gain.value=this.volume,this.master.connect(e.destination);const t=e.createBuffer(2,e.sampleRate*1.2,e.sampleRate);let n=172;const s=()=>(n=Math.imul(n,1664525)+1013904223|0,(n>>>0)/2147483648-1);for(let d=0;d<2;d++){const h=t.getChannelData(d);for(let p=0;p<h.length;p++)h[p]=s()*(1-p/h.length)**2*.28}const r=e.createConvolver();r.buffer=t,this.reverb=e.createGain(),this.reverb.gain.value=0,this.master.connect(r),r.connect(this.reverb),this.reverb.connect(e.destination),this.tractionGain=e.createGain(),this.tractionGain.gain.value=0;const a=e.createBiquadFilter();a.type="lowpass",a.frequency.value=250,this.tractionGain.connect(a),a.connect(this.master),this.traction=e.createOscillator(),this.traction.type="sawtooth",this.traction.frequency.value=38,this.traction.connect(this.tractionGain),this.traction.start();const o=e.createBuffer(1,e.sampleRate*2,e.sampleRate),l=o.getChannelData(0);for(let d=0;d<l.length;d++)l[d]=s();const c=(d,h)=>{const p=e.createBufferSource();p.buffer=o,p.loop=!0;const v=e.createBiquadFilter();v.type="bandpass",v.frequency.value=d,v.Q.value=h;const m=e.createGain();return m.gain.value=0,p.connect(v),v.connect(m),m.connect(this.master),p.start(),m};this.rolling=c(580,.65),this.brake=c(1900,3),this.ambience=c(370,.4),this.horn=e.createGain(),this.horn.gain.value=0,this.horn.connect(this.master);for(const d of[370,440]){const h=e.createOscillator();h.type="triangle",h.frequency.value=d,h.connect(this.horn),h.start()}this.warning=e.createGain(),this.warning.gain.value=0,this.warning.connect(this.master);const u=e.createOscillator();u.type="sine",u.frequency.value=880,u.connect(this.warning),u.start(),this.crossing=e.createGain(),this.crossing.gain.value=0,this.crossing.connect(this.master);const f=e.createOscillator();f.type="sine",f.frequency.value=1020,f.connect(this.crossing),f.start(),await e.resume()}setVolume(e){this.volume=e,this.master&&this.master.gain.setTargetAtTime(e,this.context.currentTime,.05)}event(e){const t=this.context;if(!t||!this.master)return;const n=e==="clear"?[940,1254]:e==="doors"?[660,880]:e==="tpws"?[220,440]:e==="ack"?[520]:[];for(const[s,r]of n.entries()){const a=t.createOscillator(),o=t.createGain();a.type=e==="tpws"?"square":"sine",a.frequency.value=r,o.gain.setValueAtTime(.05,t.currentTime+s*.09),o.gain.exponentialRampToValueAtTime(.001,t.currentTime+.7+s*.09),a.connect(o),o.connect(this.master),a.start(t.currentTime+s*.09),a.stop(t.currentTime+1+s*.09)}}update(e,t){if(!this.context)return;const n=this.context.currentTime,s=e.paused,r=e.player.speed,a=!!e.route.tunnelAt(e.player.s);this.traction?.frequency.setTargetAtTime(34+r*2.1+Math.max(0,e.player.controller)*35,n,.15),this.tractionGain?.gain.setTargetAtTime(s?0:.012+Math.max(0,e.player.controller)*.025+r*4e-4,n,.12),this.rolling?.gain.setTargetAtTime(s?0:Math.min(.13,r*.004),n,.12),this.brake?.gain.setTargetAtTime(!s&&r>1?Math.max(0,-e.player.controller)*.025:0,n,.1),this.ambience?.gain.setTargetAtTime(s?0:a?.002:.008,n,.3),this.reverb?.gain.setTargetAtTime(!s&&a?this.volume*.38:0,n,.25),this.horn?.gain.setTargetAtTime(!s&&t?.09:0,n,.025),this.warning?.gain.setTargetAtTime(!s&&(e.aws.pending||e.tpws.active)&&Math.floor(n*5)%2===0?.07:0,n,.015);const o=e.crossings.find(c=>c.state!=="open"&&Math.abs(c.s-e.player.s)<240),l=o?Math.abs(o.s-e.player.s):240;this.crossing?.gain.setTargetAtTime(!s&&o&&Math.floor(e.clock*4)%2===0?.025*(1-l/240):0,n,.015)}}class S_{constructor(e="snow-hill-lines",t="snow-hill-lines-save-v1"){this.name=e,this.legacyKey=t}name;legacyKey;database;open(){return this.database??=new Promise((e,t)=>{const n=indexedDB.open(this.name,1);n.onupgradeneeded=()=>{n.result.objectStoreNames.contains("journeys")||n.result.createObjectStore("journeys")},n.onsuccess=()=>e(n.result),n.onerror=()=>{this.database=void 0,t(n.error||new Error("Journey storage could not be opened."))},n.onblocked=()=>{this.database=void 0,t(new Error("Close other older Snow Hill Lines tabs, then save again."))}})}async put(e){const t=await this.open();await new Promise((n,s)=>{const r=t.transaction("journeys","readwrite");r.objectStore("journeys").put(e,"active"),r.oncomplete=()=>n(),r.onerror=()=>s(r.error||new Error("Journey storage failed.")),r.onabort=()=>s(r.error||new Error("Journey storage was interrupted."))})}async get(){const e=await this.open(),t=await new Promise((r,a)=>{const o=e.transaction("journeys","readonly").objectStore("journeys").get("active");o.onsuccess=()=>r(o.result),o.onerror=()=>a(o.error)});if(t)return t;const n=localStorage.getItem(this.legacyKey);if(!n)return;const s=JSON.parse(n);return await this.put(s),localStorage.removeItem(this.legacyKey),s}}const y_=uc.access;new Set(y_.flatMap(i=>[i.deck,...i.stairs]));new Ve(8294246),new Ve(9207909),new Ve(9144444),new Ve(10660517),new Ve(6511181),new Ve(6843496),new Ve(11908005),new Ve(14539984),new Ve(10316629),new Ve(7828331),new Ve(7179925);new kn(1,1,1);function E_(i,e,t,n){const s=n[0]-t[0],r=n[2]-t[2],a=at(((i-t[0])*s+(e-t[2])*r)/(s*s+r*r||1),0,1);return{distance:Math.hypot(i-t[0]-a*s,e-t[2]-a*r),t:a}}const oc=new WeakMap;function b_(i){const e=oc.get(i);if(e)return e;const t=[],n=new Map,s=a=>`${a[0].toFixed(2)},${a[2].toFixed(2)}`;for(const a of i.data.tracks)for(let o=1;o<(a.points?.length||0);o++){const l={a:a.points[o-1],b:a.points[o],id:a.id,index:o};t.push(l);for(const c of[l.a,l.b]){const u=s(c),f=n.get(u)||[];f.push(l),n.set(u,f)}}const r=[];for(const a of[!1,!0])for(const o of[0,4.2]){const l=a?1:-1,c=i.lanePose(a?i.length:0,o),u=c.tangent.map(P=>P*l);let f;for(const P of t){const R=E_(c.position[0],c.position[2],P.a,P.b);if(R.distance>4.5)continue;const C=P.b[0]-P.a[0],F=P.b[2]-P.a[2],V=Math.hypot(C,F),D=(C*u[0]+F*u[2])/(V||1),z=D>0?1:-1;if(Math.abs(D)<.82||(z>0?1-R.t:R.t)*V<.05)continue;const X=R.distance+(1-Math.abs(D))*2;(!f||X<f.score)&&(f={segment:P,t:R.t,direction:z,score:X})}if(!f)continue;let d=f.segment,h=f.direction;const p=d.a.map((P,R)=>P+(d.b[R]-P)*f.t),v=[p,h>0?d.b:d.a],m=new Set([d]),g=new Set([d.id]);let x=Math.hypot(v[1][0]-v[0][0],v[1][2]-v[0][2]);for(;x<180;){const P=v.at(-1),R=v.at(-2),C=P[0]-R[0],F=P[2]-R[2],V=Math.hypot(C,F)||1,D=/^way\/\d+/.exec(d.id)?.[0],z=(n.get(s(P))||[]).filter(k=>!m.has(k)).map(k=>{const se=s(k.a)===s(P)?k.b:k.a,$=se[0]-P[0],ee=se[2]-P[2],ie=Math.hypot($,ee),we=($*C+ee*F)/(ie*V||1);return{segment:k,target:se,d:ie,dot:we,same:D!==void 0&&k.id.startsWith(`${D}/`)}}).filter(k=>k.d>.05&&k.dot>.75).sort((k,se)=>Number(se.same)-Number(k.same)||se.dot-k.dot||k.segment.id.localeCompare(se.segment.id));if(!z.length)break;const X=z[0];if(z[1]&&!X.same&&X.dot-z[1].dot<.02)break;v.push(X.target),x+=X.d,d=X.segment,m.add(d),g.add(d.id)}if(x<20)continue;const M=new ht(v),S=Math.min(180,M.length),w=Math.min(25,S),T=M.sample(w),_=[],b=P=>{const R=M.sample(P).position,C=at(P/w,0,1),F=2*C*C*C-3*C*C+1,V=C*C*C-2*C*C+C,D=-2*C*C*C+3*C*C,z=C*C*C-C*C,X=P<w?F*c.position[0]+V*w*u[0]+D*T.position[0]+z*w*T.tangent[0]:R[0],k=P<w?F*c.position[2]+V*w*u[2]+D*T.position[2]+z*w*T.tangent[2]:R[2];_.push([X,c.position[1]+c.grade*l*P,k])};for(let P=0;P<S;P+=2)b(P);b(S),r.push({id:`context/${a?"DDG":"KID"}/${o}`,points:_,path:new ht(_),overhead:!1,source:"Connected mapped source rail segments; engineered endpoint grade continued",metadata:{contextOnly:!0,playable:!1,lane:o,atEnd:a,extent:S,sourceIds:[...g],sourceFitDistance:f.score,endpointRight:c.right.map(P=>P*l),endpointBank:c.bank*l}})}return oc.set(i,r),r}const w_='<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M4 12 12 4M5 4h7v7" stroke="currentColor" stroke-width="1.3"/></svg>',T_='<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M9 7v10M15 7v10" stroke="currentColor" stroke-width="2"/></svg>',Zs='<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 12h15m-6-6 6 6-6 6" stroke="currentColor" stroke-width="1.5"/></svg>',A_=document.querySelector("#app");A_.innerHTML=`<main class="simulator">
  <div id="viewport" role="img" aria-label="Front view of the Kidderminster to Dorridge railway"></div>
  <div class="vignette" aria-hidden="true"></div>
  <div class="drive-actions"><span class="clock" id="clock">08:12:00</span><button id="pause" class="icon-button" aria-label="Pause journey">${T_}</button></div>
  <section id="menu" class="menu" aria-label="Journey setup"><div class="menu-panel">
    <h1>Railway demo</h1>
    <p class="intro">Choose a direction and departure station.</p>
    <div class="form-row"><label>Direction<select id="direction"><option value="1">Kidderminster → Dorridge</option><option value="-1">Dorridge → Kidderminster</option></select></label></div>
    <div class="form-row"><label>Depart from<select id="start-station" aria-label="Departure station"><option>Loading stations…</option></select></label></div>
    <button id="begin" class="primary" disabled><span id="begin-label">Loading…</span>${Zs}</button>
    <button id="resume-save" class="secondary" hidden>Continue saved journey ${Zs}</button>
    <div class="menu-bottom"><span class="gpu-badge" id="gpu-state"><i></i> LOADING</span><button id="settings-open" class="text-button">Settings</button></div>
  </div></section>
  <section id="hud" class="hud" hidden aria-label="Driving instruments">
    <div class="notice" id="notice" role="status">Hold A to release the brake.</div>
    <div class="dashboard"><div class="instrument speed"><span class="instrument-label">SPEED</span><div><strong id="speed">0</strong><span>mph</span></div><small>LIMIT <b id="limit">65</b></small></div>
    <div class="instrument next-stop"><span class="instrument-label">NEXT STATION</span><strong id="next-stop">Blakedown</strong><div><span id="distance">5.1 km</span><span id="doors">Doors secured</span></div><div class="distance-line"><i id="stop-progress"></i></div></div>
    <div class="instrument controller"><span class="instrument-label">POWER / BRAKE</span><strong id="controller-state">Full service brake</strong><div class="control-track"><span class="brake-zone"></span><i id="controller-pointer"></i></div><small><span>BRAKE</span><span id="reverser">FORWARD</span><span>POWER</span></small></div>
    <button class="instrument aws" id="aws" aria-label="AWS acknowledge"><span class="instrument-label">AWS</span><span class="aws-lamp" id="aws-lamp"><i></i></span><span id="aws-state">Clear</span><kbd>Q</kbd></button></div>
    <div class="controls-strip"><span><kbd>A</kbd> Power / release</span><span><kbd>D</kbd> Brake</span><span><kbd>Q</kbd> Acknowledge</span><span><kbd>SPACE</kbd> Horn</span><span><kbd>W</kbd><kbd>S</kbd> Direction</span><button id="stops-open" class="text-button">Route & stops ${w_}</button><button id="save" class="text-button">Save</button></div>
    <button id="tpws-reset" class="tpws-reset" hidden>TPWS brake demand · stop, then reset</button>
    <div class="touch-controls"><button data-drive="d" aria-label="Apply brakes">D · Brake</button><button data-drive="a" aria-label="Release brake and add power">A · Power</button><button data-drive="horn" aria-label="Horn">Horn</button></div>
  </section>
  <section id="pause-panel" class="dialog" hidden><div class="dialog-card"><h2>Paused</h2><p id="pause-detail">Your train and traffic are paused.</p><button id="continue" class="primary">Continue ${Zs}</button><button id="save-paused" class="secondary">Save journey</button><button id="settings-paused" class="secondary">Settings</button><button id="new-journey" class="text-button">Choose a new journey</button></div></section>
  <section id="settings" class="dialog" hidden><div class="dialog-card"><button class="dialog-close" data-close="settings" aria-label="Close settings">×</button><h2>Settings</h2><label>Render resolution<select id="render-scale"><option value="0.5" selected>50% — faster</option><option value="0.75">75%</option><option value="1">100% — sharper</option></select></label><p class="resolution-note">Scales the 3D view; the controls stay sharp. 50% uses one quarter of the pixels.</p><label>Scenery quality<select id="quality"><option value="low">Light — fewer distant tiles, no shadows</option><option value="balanced" selected>Balanced</option><option value="high">Detailed — more distant scenery</option></select></label><label>Sound level<input id="volume" type="range" min="0" max="1" step=".01" value=".35" /></label><p class="setting-note">A / D: power and brake · Q: AWS · Space: horn · W / S: direction · T: unassigned</p></div></section>
  <section id="stops" class="stops-panel" hidden><button class="dialog-close" data-close="stops" aria-label="Close route">×</button><span class="eyebrow">YOUR JOURNEY</span><h2>The line ahead.</h2><div id="stop-list"></div><small>Representative all-stations service</small></section>
  <section id="error" class="dialog" hidden><div class="dialog-card"><h2 id="error-title">Unable to start</h2><p id="error-text"></p><button id="reload" class="primary">Reload ${Zs}</button></div></section>
  <footer class="credit">© OpenStreetMap contributors · Environment Agency ground data</footer>
</main>`;const Re=i=>document.getElementById(i),Qt={a:!1,d:!1,horn:!1},zi=new M_;let Ie,Kt,sn,zn=!1,fr=!1,es=0,ja=performance.now(),lc=0,cc=0,yh=0;const wo=new S_;let ra=!1;const Eh="railway-demo-preferences-v1";function R_(){try{const i=JSON.parse(localStorage.getItem(Eh)||"null");["0.5","0.75","1"].includes(i?.renderScale)&&(Re("render-scale").value=i.renderScale),["low","balanced","high"].includes(i?.quality)&&(Re("quality").value=i.quality),typeof i?.volume=="number"&&Number.isFinite(i.volume)&&(Re("volume").value=String(at(i.volume,0,1)))}catch{}zi.setVolume(Number(Re("volume").value))}function To(){try{localStorage.setItem(Eh,JSON.stringify({renderScale:Re("render-scale").value,quality:Re("quality").value,volume:Number(Re("volume").value)}))}catch{}}R_();function zt(i,e){Re(i).hidden=!e}function _s(i,e=!1){Re("notice").textContent=i,Re("notice").classList.toggle("important",e),yh=performance.now()+(e?1e4:6500)}function bh(){Qt.a=!1,Qt.d=!1,Qt.horn=!1}function xr(){!zn||!Ie||(Ie.paused=!0,bh(),zt("pause-panel",!0),zi.update(Ie,!1),Ms(!1))}function Ao(){!fr||!Ie||(Ie.paused=!1,zt("pause-panel",!1),zi.init(),ja=performance.now(),es=0)}async function Ms(i=!0){if(!Ie||!zn)return!1;try{const e=Ie.snapshot();return await wo.put(e),ra=!1,i&&_s(`Journey saved at ${Ie.clockText()}.`),!0}catch{return(i||!ra)&&_s("This browser could not store the journey."),ra=!0,!1}}function as(i){Re("error").hidden&&(console.error(i),Ie&&(Ie.paused=!0),Re("error-text").textContent=i.message,zt("error",!0),bh(),zn&&Ms(!1).then(e=>{Re("error-text").textContent=i.message+(e?" Your paused journey was saved. Reload, then choose Continue saved journey.":" Saving failed. Reloading may lose unsaved progress.")}))}function wh(i){const e=Re("start-station"),t=i===1?sn.stations:[...sn.stations].reverse();e.innerHTML=t.map(n=>{const s=n.id===(i===1?"DDG":"KID");return`<option value="${n.id}" ${s?"disabled":""}>${n.name}${s?" · end of route":""}</option>`}).join("")}function Ro(){const i=Re("stop-list");i.innerHTML=(Ie.player.direction===1?sn.stations:[...sn.stations].reverse()).map(e=>`<div class="stop-item ${Ie.calls.includes(e.id)?"visited":""} ${Ie.targetStation()?.id===e.id?"next":""}"><i></i><span>${e.name}</span><small>${Ie.calls.includes(e.id)?"✓":e.id}</small></div>`).join("")}async function C_(){if(!fr)return;const i=Number(Re("direction").value),e=sn.stations.findIndex(t=>t.id===Re("start-station").value);if(e<0||e+i<0||e+i>=sn.stations.length){Re("begin-label").textContent="Choose a departure with a station ahead";return}Ie.start(i,e),Kt.resetTraffic(),Re("begin").disabled=!0,Re("begin-label").textContent="Preparing departure…";try{await Kt.preparePosition(),zn=!0,zt("menu",!1),zt("hud",!0),Ao(),Ro(),_s("Hold A to release the service brake, then add power.")}catch(t){as(t)}finally{Re("begin").disabled=!1,Re("begin-label").textContent="Begin journey"}}function P_(i){if(!Ie||(Re("clock").textContent=Ie.clockText(),!zn))return;Re("speed").textContent=Math.round(Ie.speedMph).toString(),Re("limit").textContent=String(sn.limit(Ie.player.s)),Re("speed").classList.toggle("overspeed",Ie.speedMph>sn.limit(Ie.player.s)+2);const e=Ie.targetStation(),t=Math.max(0,Ie.distanceToStop());Re("next-stop").textContent=e?.name||(Ie.player.arrived?"Journey complete":"End of line"),Re("distance").textContent=t>=1e3?`${(t/1e3).toFixed(1)} km`:`${Math.round(t)} m`,Re("doors").textContent=Ie.player.doors?`Doors open · ${Math.ceil(Ie.player.dwell)}s`:"Doors secured",Re("doors").classList.toggle("open",Ie.player.doors);const n=Ie.player.controller;Re("controller-state").textContent=Ie.aws.brake||Ie.tpws.active||Ie.player.authorityBrake?"Safety brake demand":n<-.02?`${Math.round(-n*100)}% service brake`:n>.02?`${Math.round(n*100)}% power`:"Coasting",Re("controller-pointer").style.left=`${(n+1)*50}%`,Re("reverser").textContent=Ie.player.reverseAuthority?"REVERSAL · 10 MPH":Ie.player.direction===1?"FORWARD":"REVERSE",Re("aws-lamp").classList.toggle("warning",Ie.aws.indicator),Re("aws").classList.toggle("pending",Ie.aws.pending),Re("aws-state").textContent=Ie.aws.pending?"Acknowledge":Ie.aws.brake?"Brake demand":Ie.aws.indicator?"Acknowledged":"Clear",zt("tpws-reset",Ie.tpws.active),Re("tpws-reset").textContent=Ie.tpws.active?`${Ie.tpws.reason} · Reset when stopped`:"",Re("stop-progress").style.width=`${at(1-t/5e3,0,1)*100}%`,i>yh&&!Ie.aws.pending&&!Ie.tpws.active?Re("notice").classList.add("quiet"):Re("notice").classList.remove("quiet")}Re("begin").addEventListener("click",C_);Re("pause").addEventListener("click",xr);Re("continue").addEventListener("click",Ao);Re("aws").addEventListener("click",()=>Ie?.acknowledge());Re("tpws-reset").addEventListener("click",()=>Ie?.resetTPWS());Re("save").addEventListener("click",()=>Ms());Re("save-paused").addEventListener("click",()=>Ms());Re("reload").addEventListener("click",()=>location.reload());Re("new-journey").addEventListener("click",()=>{Ie.paused=!0,zn=!1,zt("pause-panel",!1),zt("hud",!1),zt("menu",!0)});Re("settings-open").addEventListener("click",()=>zt("settings",!0));Re("settings-paused").addEventListener("click",()=>zt("settings",!0));Re("stops-open").addEventListener("click",()=>{Ro(),zt("stops",!0)});document.querySelectorAll("[data-close]").forEach(i=>i.addEventListener("click",()=>zt(i.dataset.close,!1)));Re("direction").addEventListener("change",()=>wh(Number(Re("direction").value)));Re("quality").addEventListener("change",()=>{Kt?.setQuality(Re("quality").value),To()});Re("render-scale").addEventListener("change",()=>{Kt?.setRenderScale(Number(Re("render-scale").value)),To()});Re("volume").addEventListener("input",()=>{zi.setVolume(Number(Re("volume").value)),To()});Re("resume-save").addEventListener("click",async()=>{try{const i=await wo.get();if(!i)throw new Error("No saved journey was found.");Ie.restore(i),Kt.resetTraffic(),await Kt.preparePosition(),zn=!0,zt("menu",!1),zt("hud",!0),Ro(),Ao(),_s("Saved journey restored.")}catch(i){as(i)}});document.querySelectorAll("[data-drive]").forEach(i=>{const e=i.dataset.drive;i.addEventListener("pointerdown",t=>{Qt[e]=!0,i.setPointerCapture(t.pointerId)}),i.addEventListener("pointerup",()=>Qt[e]=!1),i.addEventListener("pointercancel",()=>Qt[e]=!1)});window.addEventListener("keydown",i=>{if(!zn||Ie.paused||["SELECT","INPUT","TEXTAREA"].includes(i.target?.tagName))return;const e=i.code;["KeyA","KeyD","KeyQ","KeyW","KeyS","Space"].includes(e)&&i.preventDefault(),e==="KeyA"&&(Qt.a=!0),e==="KeyD"&&(Qt.d=!0),e==="Space"&&(Qt.horn=!0),i.repeat||(e==="KeyQ"&&Ie.acknowledge(),e==="KeyW"&&Ie.setDirection(1),e==="KeyS"&&Ie.setDirection(-1),e==="Escape"&&xr())});window.addEventListener("keyup",i=>{i.code==="KeyA"&&(Qt.a=!1),i.code==="KeyD"&&(Qt.d=!1),i.code==="Space"&&(Qt.horn=!1)});window.addEventListener("blur",xr);document.addEventListener("visibilitychange",()=>{document.hidden&&xr()});async function L_(){try{let i=function(o){try{const l=Math.min(1,(o-ja)/1e3);if(ja=o,es+=l,Ie.paused)es=0;else for(;es>=.016666666666666666;)Ie.update(.016666666666666666,Qt),es-=.016666666666666666;zi.update(Ie,Qt.horn),Kt.draw(l),o-lc>100&&(P_(o),lc=o),zn&&!Ie.paused&&o-cc>1e4&&(Ms(!1),cc=o),requestAnimationFrame(i)}catch(l){as(l)}};const e=await fetch(Li("data/route.json",document.baseURI));if(!e.ok)throw new Error("Route data is missing. Check that the website’s data folder was copied in full.");const t=await e.json();t.worldHash="335640056a9acf3d38564b2a887c4c737134540d0e9d26ca02dd8f6801082b89",sn=new Dh(t),sn.setEndpointContext(b_(sn)),Ie=new s_(sn),Ie.sound=o=>zi.event(o),Ie.onEvent=o=>{(o.type==="aws"||o.type==="tpws"||o.type==="station"||o.type==="direction"||o.type==="complete")&&_s(o.message,o.type==="tpws"||o.type==="aws")},wh(1);const[n,s,r]=await Promise.all([fetch(Li("data/road-surfaces.json",document.baseURI)),fetch(Li("data/land-surfaces.json",document.baseURI)),fetch(Li(t.terrain.url,document.baseURI))]);if(!n.ok)throw new Error("The shared road support manifest could not be loaded.");if(!s.ok)throw new Error("The shared water support manifest could not be loaded.");if(!r.ok)throw new Error("Terrain data could not be loaded.");t.surfaceRoads=(await n.json()).roads,t.surfaceWater=(await s.json()).water;const a=await r.arrayBuffer();Ie.configureRoadNetwork(t.surfaceRoads,new Fh(t.terrain,new Uint16Array(a))),Kt=new p_(Re("viewport"),t,sn,Ie),Kt.setRenderScale(Number(Re("render-scale").value)),Kt.setQuality(Re("quality").value),Kt.onError=as,Kt.onProgress=()=>{!fr&&Kt.tileCount>=3&&(fr=!0,Re("begin").disabled=!1,Re("begin-label").textContent="Begin journey",Re("gpu-state").innerHTML="<i></i> WEBGL 2 READY",wo.get().then(o=>zt("resume-save",!!o)).catch(()=>zt("resume-save",!1)))},await Kt.init(a),requestAnimationFrame(i)}catch(i){as(i)}}L_();
