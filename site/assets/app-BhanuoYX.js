(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))n(s);new MutationObserver(s=>{for(const r of s)if(r.type==="childList")for(const a of r.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&n(a)}).observe(document,{childList:!0,subtree:!0});function t(s){const r={};return s.integrity&&(r.integrity=s.integrity),s.referrerPolicy&&(r.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?r.credentials="include":s.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function n(s){if(s.ep)return;s.ep=!0;const r=t(s);fetch(s.href,r)}})();const it=(i,e,t)=>Math.max(e,Math.min(t,i)),ft=(i,e,t)=>i+(e-i)*t,lr=i=>{const e=it(i,0,1);return e*e*(3-2*e)},Vh=i=>i*2.2369362921,Ts=i=>i/2.2369362921;function In(i){let e=2166136261;for(const t of String(i))e^=t.charCodeAt(0),e=Math.imul(e,16777619);return e>>>0}function Ni(i){const e=i.right,t=i.tangent,n=[e[1]*t[2]-e[2]*t[1],e[2]*t[0]-e[0]*t[2],e[0]*t[1]-e[1]*t[0]],s=Math.hypot(...n)||1,r=Math.cos(i.bank),a=Math.sin(i.bank);return[e[0]*r+n[0]/s*a,e[1]*r+n[1]/s*a,e[2]*r+n[2]/s*a]}function Sc(i){const e=Ni(i),t=i.tangent,n=[e[1]*t[2]-e[2]*t[1],e[2]*t[0]-e[0]*t[2],e[0]*t[1]-e[1]*t[0]],s=Math.hypot(...n)||1;return n.map(r=>r/s)}class ht{points;lengths;length;frames;constructor(e){if(this.points=e,e.length<2)throw new Error("A path needs at least two points");this.lengths=new Float64Array(e.length);for(let t=1;t<e.length;t++)this.lengths[t]=this.lengths[t-1]+Math.hypot(...e[t].map((n,s)=>n-e[t-1][s]));this.length=this.lengths[this.lengths.length-1],this.frames=new Float64Array(e.length*4);for(let t=0;t<e.length-1;t++){const n=e[t],s=e[t+1],r=e[Math.max(0,t-1)],a=e[Math.min(e.length-1,t+2)],o=a[0]-r[0],l=a[1]-r[1],c=a[2]-r[2],u=Math.hypot(o,c)||1,p=e[Math.max(0,t-3)],d=e[Math.min(e.length-1,t+4)],h=n[0]-p[0],f=n[2]-p[2],_=d[0]-s[0],m=d[2]-s[2],g=Math.hypot(h,f)*Math.hypot(_,m);this.frames.set([o/u,l/u,c/u,g>1?it(-(h*m-f*_)/g*.12,-.075,.075):0],t*4)}this.frames.set(this.frames.subarray((e.length-2)*4,(e.length-1)*4),(e.length-1)*4)}segment(e){let t=0,n=this.points.length-2;for(;t<n;){const s=t+n+1>>1;this.lengths[s]<=e?t=s:n=s-1}return t}sample(e,t=0){const n=it(e,0,this.length),s=this.segment(n),r=this.points[s],a=this.points[s+1],o=this.lengths[s+1]-this.lengths[s],l=o?(n-this.lengths[s])/o:0,c=ft(this.frames[s*4],this.frames[(s+1)*4],l),u=ft(this.frames[s*4+1],this.frames[(s+1)*4+1],l),p=ft(this.frames[s*4+2],this.frames[(s+1)*4+2],l),d=Math.hypot(c,p)||1,h=[c/d,u/d,p/d],f=[-h[2],0,h[0]],_=ft(this.frames[s*4+3],this.frames[(s+1)*4+3],l),m=e-n;return{position:[ft(r[0],a[0],l)+f[0]*t+h[0]*m,ft(r[1],a[1],l)+h[1]*m,ft(r[2],a[2],l)+f[2]*t+h[2]*m],tangent:h,right:f,grade:u/d,yaw:Math.atan2(-h[0],-h[2]),pitch:Math.atan2(u,d),bank:_,s:e}}nearest(e,t,n){let s=0,r=this.points.length-1;n!==void 0&&(s=this.segment(Math.max(0,n-150)),r=Math.min(r,this.segment(n+150)+2));let a=1/0,o=0,l=0;for(let c=s;c<r;c++){const u=this.points[c],p=this.points[c+1],d=p[0]-u[0],h=p[2]-u[2],f=it(((e-u[0])*d+(t-u[2])*h)/(d*d+h*h||1),0,1),_=u[0]+f*d,m=u[2]+f*h,g=Math.hypot(e-_,t-m);g<a&&(a=g,o=ft(this.lengths[c],this.lengths[c+1],f),l=((e-_)*-h+(t-m)*d)/Math.hypot(d,h))}return{s:o,distance:a,side:l}}}let fa=class extends ht{derivatives;constructor(e){super(e),this.derivatives=e.map((t,n)=>{const s=Math.max(0,n-1),r=Math.min(e.length-1,n+1),a=this.lengths[r]-this.lengths[s]||1,o=t.map((l,c)=>(e[r][c]-e[s][c])/a);if(n>0&&n<e.length-1){const l=(t[1]-e[n-1][1])/(this.lengths[n]-this.lengths[n-1]||1),c=(e[n+1][1]-t[1])/(this.lengths[n+1]-this.lengths[n]||1);o[1]=l*c<=0?0:2*l*c/(l+c)}return o})}sample(e,t=0){const n=it(e,0,this.length),s=this.segment(n),r=this.points[s],a=this.points[s+1],o=this.lengths[s+1]-this.lengths[s]||1,l=(n-this.lengths[s])/o,c=l*l,u=c*l,p=this.derivatives[s],d=this.derivatives[s+1],h=r.map((S,M)=>(2*u-3*c+1)*S+(u-2*c+l)*o*p[M]+(-2*u+3*c)*a[M]+(u-c)*o*d[M]),f=r.map((S,M)=>((6*c-6*l)*S+(3*c-4*l+1)*o*p[M]+(-6*c+6*l)*a[M]+(3*c-2*l)*o*d[M])/o),_=Math.hypot(f[0],f[2])||1,m=f.map(S=>S/_),g=[-m[2],0,m[0]];return{...super.sample(n),position:h.map((S,M)=>S+g[M]*t+m[M]*(e-n)),tangent:m,right:g,grade:f[1]/_,pitch:Math.atan2(f[1],_),yaw:Math.atan2(-f[0],-f[2]),s:e}}};class Wh extends fa{data;stations;fingerprint;opposingPath;endpointPaths=new Map;buckets=new Map;constructor(e){super(e.points),this.data=e,this.fingerprint=In(JSON.stringify({simulation:"2026-v3",points:e.points,opposing:e.opposingOffsets||null,stations:e.stations.map(n=>[n.id,n.s]),network:e.network,crossings:e.crossings,structures:e.structures})).toString(16);const t=e.opposingTrack?.points;t?.length===e.points.length&&(this.opposingPath=new fa(t)),this.stations=e.stations.map(n=>({...n,s:Number.isFinite(n.s)?this.sourceS(n.s):this.nearest(n.position[0],n.position[2]).s,length:n.length||150,platformCount:n.platformCount||2})).sort((n,s)=>n.s-s.s);for(let n=0;n<this.points.length-1;n++){const s=this.points[n],r=`${Math.floor(s[0]/100)},${Math.floor(s[2]/100)}`,a=this.buckets.get(r)||[];a.push(n),this.buckets.set(r,a)}}sourceS(e){const t=this.data.chainages;if(!t)return e;let n=0,s=t.length-2;for(;n<s;){const r=n+s+1>>1;t[r]<=e?n=r:s=r-1}return ft(this.lengths[n],this.lengths[n+1],it((e-t[n])/(t[n+1]-t[n]||1),0,1))}laneOffset(e,t){if(t===0)return 0;const n=this.data.opposingOffsets;if(!n||n.length!==this.points.length)return t;const s=this.segment(it(e,0,this.length)),r=it((e-this.lengths[s])/(this.lengths[s+1]-this.lengths[s]||1),0,1);return ft(n[s],n[s+1],r)}setEndpointContext(e){for(const t of e){const n=t.metadata;n?.contextOnly&&this.endpointPaths.set(`${n.lane}/${n.atEnd}`,{path:t.path||new ht(t.points),right:n.endpointRight,bank:Number(n.endpointBank)||0})}}laneArc(e,t){if(t===0||!this.opposingPath||e<0)return e;if(e>this.length)return this.opposingPath.length+e-this.length;const n=this.segment(e),s=(e-this.lengths[n])/(this.lengths[n+1]-this.lengths[n]||1);return ft(this.opposingPath.lengths[n],this.opposingPath.lengths[n+1],s)}travel(e,t,n){if(n===0||!this.opposingPath)return e+t;const s=this.laneArc(e,n)+t;if(s<0)return s;if(s>this.opposingPath.length)return this.length+s-this.opposingPath.length;const r=this.opposingPath.segment(s),a=(s-this.opposingPath.lengths[r])/(this.opposingPath.lengths[r+1]-this.opposingPath.lengths[r]||1);return ft(this.lengths[r],this.lengths[r+1],a)}laneDistance(e,t,n){return this.laneArc(t,n)-this.laneArc(e,n)}lanePose(e,t){if(e<0||e>this.length){const n=e>this.length,s=this.endpointPaths.get(`${t}/${n}`);if(s){const r=n?e-this.length:-e,a=s.path.sample(r),o=it(r/25,0,1),l=n?1:-1;if(s.right){const c=ft(s.right[0],a.right[0],o),u=ft(s.right[2],a.right[2],o),p=Math.hypot(c,u)||1;a.right=[c/p,0,u/p],a.bank=ft(s.bank,a.bank,o)}return a.tangent=a.tangent.map(c=>c*l),a.right=a.right.map(c=>c*l),a.bank*=l,a.grade*=l,a.yaw=Math.atan2(-a.tangent[0],-a.tangent[2]),a.pitch=Math.atan2(a.grade,1),a.s=e,a}}if(t!==0&&this.opposingPath){const n=this.opposingPath.sample(this.laneArc(e,t));return n.s=e,n}return this.sample(e,t===0?0:this.laneOffset(e,t))}railPosition(e,t,n){const s=this.lanePose(e,t),r=Ni(s);return s.position.map((a,o)=>a+r[o]*n)}project(e,t,n=150){const s=Math.floor(e/100),r=Math.floor(t/100);let a=1/0,o=0,l=0;const c=Math.ceil(n/100);for(let u=-c;u<=c;u++)for(let p=-c;p<=c;p++)for(const d of this.buckets.get(`${s+u},${r+p}`)||[]){const h=this.points[d],f=this.points[d+1],_=f[0]-h[0],m=f[2]-h[2],g=it(((e-h[0])*_+(t-h[2])*m)/(_*_+m*m||1),0,1),x=e-h[0]-_*g,S=t-h[2]-m*g,M=Math.hypot(x,S);M<a&&(a=M,o=ft(this.lengths[d],this.lengths[d+1],g),l=(x*-m+S*_)/(Math.hypot(_,m)||1))}return{s:o,distance:a,side:l}}limit(e){const t=this.stations.find(r=>Math.abs(r.s-e)<400);if(t?.id==="BSW"||t?.id==="BMO")return 25;const n=this.stations.find(r=>r.id==="BSW")?.s||this.length*.6,s=this.stations.find(r=>r.id==="SBJ")?.s||1e4;return Math.abs(e-n)<1400?30:e<s?65:e<n?55:70}tunnelAt(e){return(this.data.tunnels||[]).find(t=>e>this.sourceS(t.start)&&e<this.sourceS(t.end))}bridgeAt(e){return(this.data.bridges||[]).find(t=>e>this.sourceS(t.start)&&e<this.sourceS(t.end))}}const Xh=[{id:"hagley-covered-footbridge",station:"HAG",deck:"way/240115500/0",stairs:["way/240115501/0","way/240115499/0"],covered:!0,palette:"historic-purple",reference:"references/by-location/hagley/hagley-covered-footbridge-original-0133.jpg",confidence:"source plan and reference form; engineered heights and stair extension are inferred"}],qh=[{id:"kidderminster-comberton-hill",span:"way/40433000/0",approaches:["way/506995957/0","way/40432999/0"],reference:"https://www.openstreetmap.org/way/40433000",confidence:"OSM bridge and connected approaches; deck clearance and elevation inferred",form:"girder",deckAboveRail:6.3,transitionLength:100,archSpring:0,archRise:0},{id:"hagley-brake-lane",span:"way/184620647/0",approaches:["way/150242118/0","way/157158203/0"],reference:"references/by-location/hagley/hagley-brake-lane-arch-original-0137.jpg",confidence:"source road geometry and reference arch; modelled span, soffit, profile and foundation levels are inferred",form:"masonry-arch",deckAboveRail:6.3,transitionLength:100,archSpring:2.9,archRise:3.2}],yc={access:Xh,roadBridges:qh},jo=yc.roadBridges,el=new WeakMap;function Yh(i,e){if(!jo.some(n=>[n.span,...n.approaches].includes(i.id)))return null;let t=el.get(e);if(!t){t=new Map,el.set(e,t);const n=new Map((e.data.surfaceRoads||[]).map(s=>[s.id,s]));for(const s of jo){const r=[s.approaches[0],s.span,s.approaches[1]].map(h=>n.get(h));if(r.some(h=>!h?.points?.length))continue;const a=[];for(const h of r){const f=h.points;if(a.length&&Math.hypot(a.at(-1)[0]-f[0][0],a.at(-1)[2]-f[0][2])>.01)throw new Error(`${s.id}: JOIN-01 road approach endpoints do not match`);a.push(...a.length?f.slice(1):f)}const o=new ht(a),l=new ht(r[1].points),c=l.sample(l.length/2).position,u=o.nearest(c[0],c[2]),p=e.project(c[0],c[2],100),d=e.sample(p.s).position[1]+s.deckAboveRail;for(const h of r){const f=h.points.map(g=>{const x=o.nearest(g[0],g[2]),S=Math.abs(x.s-u.s),M=1-lr(it((S-l.length/2)/s.transitionLength,0,1));return[g[0],g[1]+(d-g[1])*M,g[2]]}),_=new ht(f),m=h.id===s.span;t.set(h.id,{id:h.id,kind:String(h.kind),width:Number(h.width)||5.5,points:f,path:_,mode:m?"over":"ground",sourceStructure:s.id,inferred:!0,...m?{crossingS:_.nearest(c[0],c[2]).s,routeS:p.s,spanHalfLength:_.length/2}:{}})}}}return t.get(i.id)||null}class $h{meta;pixels;constructor(e,t){if(this.meta=e,this.pixels=t,t.length!==e.width*e.height)throw new Error("Heightmap dimensions do not match data.")}raw(e,t){const{origin:n,step:s,width:r,height:a,offset:o,scale:l}=this.meta,c=it((e-n[0])/s,0,r-1.001),u=it((t-n[1])/s,0,a-1.001),p=Math.floor(c),d=Math.floor(u),h=c-p,f=u-d,m=[d*r+p,d*r+p+1,(d+1)*r+p,(d+1)*r+p+1].map(S=>this.pixels[S]===0?NaN:o+(this.pixels[S]-1)*l),g=m.find(Number.isFinite)??100,x=m.map(S=>Number.isFinite(S)?S:g);return ft(ft(x[0],x[1],h),ft(x[2],x[3],h),f)}}function Kh(i,e){if(!i.points||i.points.length<2)return null;if(i.profileResolved||i.template?.startsWith("road/"))return{...i,path:new ht(i.points)};const t=Yh(i,e);if(t)return t;const n=i.points.map(w=>[...w]),s=new ht(n),r={id:i.id,kind:String(i.kind||"residential"),width:Number(i.width)||5.6,points:n,path:s,mode:"ground",inferred:!1},a=["footway","path","steps","cycleway","pedestrian","corridor"].includes(r.kind);if(a&&(r.width=Math.min(2.2,r.width)),i.elevationMode==="over"){const w=s.sample(s.length/2);return{...r,mode:"over",crossingS:s.length/2,spanHalfLength:s.length/2,routeS:e.project(w.position[0],w.position[2],300).s,inferred:!0}}if(i.elevationMode==="tunnel")return{...r,mode:"tunnel",inferred:!0};const o=i.gradeRelations||[],l=o.find(w=>w.relation==="on"&&e.data.structures.some(T=>T.id===w.structure&&(T.type==="footbridge"||T.type==="roadBridge")))||o.find(w=>w.relation==="under"&&e.data.structures.some(T=>T.id===w.structure&&T.type==="railBridge"));if(l){const w=e.data.structures.find(y=>y.id===l.structure);let T=0,v=1/0;if(n.forEach((y,C)=>{const R=Math.hypot(y[0]-w.position[0],y[2]-w.position[2]);R<v&&(v=R,T=C)}),v<Math.max(30,Number(w.length)||30)){r.mode=l.relation==="on"?"over":"under",r.sourceStructure=w.id,r.inferred=!0,r.crossingS=s.lengths[T],r.spanHalfLength=Math.max(4,(Number(w.length)||25)/2+2);const y=e.project(w.position[0],w.position[2]);r.routeS=y.s;const C=e.sample(y.s).position[1];for(let z=0;z<n.length;z++){const L=e.project(n[z][0],n[z][2],60);L.distance<Math.abs(e.laneOffset(L.s,4.2))+8&&(r.spanHalfLength=Math.max(r.spanHalfLength,Math.abs(s.lengths[z]-r.crossingS)+10))}const R=y.distance<Math.abs(e.laneOffset(y.s,4.2))+25||n.some(z=>e.project(z[0],z[2],50).distance<12);let P=l.y;R&&(P=r.mode==="over"?Math.max(P,C+(a?5.8:6.3)):Math.min(P,C-5.8));const F=Math.max(r.spanHalfLength+35,Math.abs(P-n[T][1])*(a?12:22));for(let z=0;z<n.length;z++){const L=Math.abs(s.lengths[z]-r.crossingS),G=1-lr((L-r.spanHalfLength)/F);n[z][1]=ft(n[z][1],P,G)}return r.path=new ht(n),r}}let c=null;for(let w=0;w<n.length;w++){const T=n[w],v=e.project(T[0],T[2]);if(v.distance<7&&(!c||v.distance<c.d)){const y=e.sample(v.s),C=n[Math.max(0,w-1)],R=n[Math.min(n.length-1,w+1)],P=R[0]-C[0],F=R[2]-C[2];Math.abs(P*y.tangent[2]-F*y.tangent[0])/(Math.hypot(P,F)||1)>.35&&(c={index:w,d:v.distance,s:v.s,side:v.side})}}if(!c)return r;const u=n.map(w=>e.project(w[0],w[2],300)).filter(w=>Number.isFinite(w.distance)).map(w=>w.side),p=Math.min(...u),d=Math.max(...u),f=[0,e.laneOffset(c.s,4.2)].some(w=>p<w-.2&&d>w+.2),_=e.sample(c.s),m=n[c.index][1];let g=m;const x=m-_.position[1];if(e.tunnelAt(c.s)&&x>5.8)return r;const S=(e.data.crossings||[]).some(w=>Math.abs(e.sourceS(w.s)-c.s)<100);if(S&&!f)return r;S?(r.mode="crossing",g=_.position[1]):x>3?(r.mode="over",g=Math.max(m,_.position[1]+(a?5.8:6.3))):(r.mode="under",g=Math.min(m,_.position[1]-5.8)),r.inferred=!0,r.routeS=c.s,r.crossingS=s.lengths[c.index];const M=r.mode==="crossing"?35:Math.max(100,Math.abs(g-m)*20);for(let w=0;w<n.length;w++){const T=Math.abs(s.lengths[w]-r.crossingS),v=1-lr((T-r.width)/(M-r.width));n[w][1]=ft(n[w][1],g,v)}return r.path=new ht(n),r}function Zh(i,e,t){const n=Kh(i,e);if(!n||i.profileResolved||i.template?.startsWith("road/"))return n;const s=n.points.map((h,f)=>{const _=e.project(h[0],h[2],60),m=e.tunnelAt(_.s),g=e.laneOffset(_.s,4.2)/2,x=Math.max((Number(m?.width)||9)/2+.8,Math.abs(g)+3);return m&&Math.abs(_.side-g)<x+n.width/2?{s:n.path.lengths[f],raise:Math.max(0,e.sample(_.s).position[1]+7.6-h[1])}:void 0}).filter(h=>!!h&&h.raise>0);if(s.length){const h=n.path;n.points=n.points.map((f,_)=>[f[0],f[1]+Math.max(...s.map(m=>m.raise*(1-lr(Math.abs(h.lengths[_]-m.s)/45)))),f[2]]),n.path=new ht(n.points),n.mode==="under"&&n.routeS!==void 0&&n.path.sample(n.crossingS??0).position[1]>e.sample(n.routeS).position[1]+4&&(n.mode="over",n.spanHalfLength=n.path.length)}if(n.sourceStructure)return n;const r=/way\/(\d+)/.exec(n.id)?.[1],a=e.data.structures.find(h=>r&&(h.sourceWayIds||[]).includes(r)&&["roadBridge","footbridge"].includes(h.type));if(!a)return n;const o=n.path.nearest(a.position[0],a.position[2]);if(o.distance>20)return n;const l=e.project(a.position[0],a.position[2],100),c=e.sample(l.s).position[1],u=Math.max(a.position[1],l.distance<25?c+6.3:t.raw(a.position[0],a.position[2])+2),p=Math.max(65,a.length??20);n.mode="over",n.crossingS=o.s,n.routeS=l.s,n.inferred=!0;const d=n.path;return n.points=n.points.map((h,f)=>{const _=Math.abs(d.lengths[f]-o.s),m=1-it((_-(a.length??20)/2)/p,0,1);return[h[0],h[1]+Math.max(0,u-h[1])*m,h[2]]}),n.path=new ht(n.points),n}const Cr=(i,e)=>i<e?-1:i>e?1:0,Jh=new Set(["motorway","motorway_link","trunk","trunk_link","primary","primary_link","secondary","secondary_link","tertiary","tertiary_link","unclassified","residential","living_street","road"]);function pa(i){return Jh.has(i.kind)&&i.width>=4.5&&Array.isArray(i.points)&&i.points.length>=2}class Qh{roads=new Map;cars=new Map;nodes=new Map;reservations=new Map;spawnPlan;setSpawnPlan(e){const t=new Map;for(const n of e){if(!pa(n)||In(n.id)%4!==0)continue;const s=new ht(n.points);if(s.length<65)continue;const r=s.sample(s.length*.5).position,a=`${Math.floor(r[0]/1e3)},${Math.floor(r[2]/1e3)}`,o=t.get(a)||[];o.push({id:n.id,rank:In(`population/${n.id}`)}),t.set(a,o)}this.spawnPlan=new Set([...t.values()].flatMap(n=>n.sort((s,r)=>s.rank-r.rank||Cr(s.id,r.id)).slice(0,8).map(s=>s.id)))}addRoads(e){for(const t of e){if(this.roads.has(t.id)||!pa(t))continue;const n=new ht(t.points);this.roads.set(t.id,{...t,path:n});for(const s of[0,1]){const r=t.points[s===0?0:t.points.length-1],a=this.key(r,t.connectionNodes?.[s]),o=this.key(r),l={id:t.id,end:s},c=this.nodes.get(a)||[];if(c.push(l),this.nodes.set(a,c),a!==o){const u=this.nodes.get(o)||[];u.push(l),this.nodes.set(o,u)}}if(!(n.length<65||In(t.id)%4!==0||(this.spawnPlan?!this.spawnPlan.has(t.id):this.cars.size>=150)))for(const s of[1,-1]){if(t.oneway&&t.oneway!==s)continue;const r=`car-${t.id}-${s}`;let a=n.length*(.18+In(r)%60/100);t.mode==="crossing"&&t.crossingS!==void 0&&Math.abs(a-t.crossingS)<40&&(a=it(t.crossingS-s*(40+In(r)%15),2,n.length-2));const o=n.sample(a,-s*t.width*.23),l=In(r)%24;o.position[1]+=(t.mode==="crossing"?-.005:.035)*.54;const c=t.width>=7&&l<2?"lorry":t.width>=6.3&&l<4?"bus":t.width>=5.3&&l<7?"van":l===8?"taxi":"car";this.cars.set(r,{id:r,road:t.id,s:a,direction:s,speed:0,kind:c,position:o.position,yaw:o.yaw+(s<0?Math.PI:0),pitch:o.pitch*s,bank:t.mode==="crossing"?0:.07/t.width,length:c==="bus"?10:c==="lorry"?12:c==="van"?5.5:4.5})}}}configure(e){this.roads.clear(),this.nodes.clear(),this.cars.clear(),this.reservations.clear();const t=[...e].sort((n,s)=>Cr(n.id,s.id));this.setSpawnPlan(t),this.addRoads(t)}key(e,t){return t||`${Math.round(e[0]/4)},${Math.round(e[1]/2)},${Math.round(e[2]/4)}`}snapshot(){return{roads:[...this.roads.values()].map(({path:e,...t})=>t),cars:[...this.cars.values()].map(e=>({...e,transition:e.transition?{...e.transition,path:e.transition.path.points}:void 0})),reservations:[...this.reservations],spawnPlan:this.spawnPlan?[...this.spawnPlan].sort():void 0}}snapshotState(){return{version:2,cars:[...this.cars.values()].map(e=>({...e,transition:e.transition?{...e.transition,path:e.transition.path.points}:void 0})),reservations:[...this.reservations]}}restoreState(e){if(e?.version!==2||!Array.isArray(e.cars)||!Array.isArray(e.reservations))throw new Error("This save has an incompatible road traffic state. Start a new journey.");const t=new Map;for(const s of e.cars){if(!s||typeof s.id!="string"||t.has(s.id)||!this.roads.has(s.road)||![1,-1].includes(s.direction)||!Number.isFinite(s.s)||!Number.isFinite(s.speed))throw new Error("The saved road traffic does not match the current road network. Start a new journey.");const r={...s};if(s.transition){const a=s.transition;if(!this.roads.has(a.next)||!Array.isArray(a.path)||a.path.length<2||!Number.isFinite(a.s))throw new Error("The saved road transition is incompatible. Start a new journey.");r.transition={...a,path:new ht(a.path)}}t.set(r.id,r)}const n=new Map;for(const s of e.reservations){if(!Array.isArray(s)||s.length!==2||typeof s[0]!="string"||!this.nodes.has(s[0])||!s[1]||!t.has(s[1].car)||!Number.isFinite(s[1].until))throw new Error("The saved road reservation is incompatible. Start a new journey.");n.set(s[0],s[1])}this.cars.clear();for(const[s,r]of t)this.cars.set(s,r);this.reservations.clear();for(const[s,r]of n)this.reservations.set(s,r)}reset(){const e=[...this.roads.values()].map(({path:t,...n})=>n);this.roads.clear(),this.nodes.clear(),this.cars.clear(),this.reservations.clear(),this.addRoads(e)}restore(e){this.roads.clear(),this.nodes.clear(),this.cars.clear(),this.reservations.clear(),e.spawnPlan&&(this.spawnPlan=new Set(e.spawnPlan)),this.addRoads(e.roads),this.cars.clear();for(const t of e.cars)t.transition&&(t.transition.path=new ht(t.transition.path)),this.cars.set(t.id,t);for(const[t,n]of e.reservations)this.reservations.set(t,n)}crossingClear(e){for(const t of this.cars.values()){const n=this.roads.get(t.road);if(n?.mode!=="crossing"||n.routeS===void 0||n.crossingS===void 0||Math.abs(n.routeS-e)>220)continue;const s=(n.crossingS-t.s)*t.direction,r=16+t.length/2;if(s>-r&&(s<r||s>0&&s<r+t.speed*t.speed/3.6))return!1}return!0}update(e,t,n,s){for(const[o,l]of this.reservations)l.until<t&&this.reservations.delete(o);const r=new Map,a=new Map;for(const o of this.cars.values()){const l=`${o.road}/${o.direction}`,c=r.get(l)||[];c.push(o),r.set(l,c)}for(const o of r.values()){o.sort((l,c)=>(l.s-c.s)*l.direction);for(let l=0;l<o.length-1;l++)a.set(o[l].id,o[l+1])}for(const o of this.cars.values()){if(o.transition){const f=o.transition;o.speed=Math.min(5,o.speed+.7*e),f.s+=o.speed*e;const _=f.path.sample(f.s);o.position=_.position,o.yaw=_.yaw,o.pitch=_.pitch,f.s>=f.path.length&&(o.road=f.next,o.direction=f.direction,o.s=f.nextS,o.transition=void 0);continue}const l=this.roads.get(o.road);if(!l)continue;let c=l.kind==="primary"||l.kind==="secondary"?12:9;const u=o.direction===1?l.path.length-o.s:o.s,p=a.get(o.id);if(p){const f=(p.s-o.s)*o.direction;f>0&&(c=Math.min(c,Math.sqrt(Math.max(0,2*1.8*(f-(o.length+p.length)/2-3.5)))))}if(l.mode==="crossing"&&l.routeS!==void 0&&l.crossingS!==void 0){const f=n.find(g=>Math.abs(g.s-l.routeS)<220),_=(l.crossingS-o.s)*o.direction;_<-(16+o.length/2)&&(o.crossingCommitted=void 0),f&&f.state==="warning"&&_>0&&_<o.length/2+12+o.speed*o.speed/4.6&&(o.crossingCommitted=f.id);const m=(r.get(`${o.road}/${o.direction}`)||[]).some(g=>g.id!==o.id&&(g.s-l.crossingS)*o.direction>0&&(g.s-l.crossingS)*o.direction<26+o.length+g.length/2);_>0&&!(f&&o.crossingCommitted===f.id)&&(f&&f.state!=="open"||m)&&(c=Math.min(c,Math.sqrt(Math.max(0,2*2.3*(_-o.length/2-18)))))}if(u<30){const f=o.direction===1?1:0,_=l.points[f?l.points.length-1:0],m=l.connectionNodes?.[f],g=this.key(_,m),x=this.key(_),S=[...this.nodes.get(g)||[]];for(const y of this.nodes.get(x)||[]){const C=this.roads.get(y.id)?.connectionNodes?.[y.end];(!m||!C)&&!S.some(R=>R.id===y.id&&R.end===y.end)&&S.push(y)}const M=S.some(y=>!this.roads.get(y.id)?.connectionNodes?.[y.end])?x:g,w=S.filter(y=>y.id!==l.id&&(!this.roads.get(y.id).oneway||this.roads.get(y.id).oneway===(y.end===0?1:-1)));w.sort((y,C)=>Cr(y.id,C.id)||y.end-C.end);const T=w.length?w[In(o.id+M)%w.length]:void 0,v=this.reservations.get(M);if(!T||v&&v.car!==o.id)c=Math.min(c,Math.sqrt(Math.max(0,2*1.7*(u-8))));else if(c=Math.min(c,5),u<12){const y=this.roads.get(T.id),C=T.end===0?1:-1,R=Math.min(12,y.path.length*.5),P=C===1?R:y.path.length-R,F=y.path.sample(P,-C*y.width*.23);if(F.position[1]+=(y.mode==="crossing"?-.005:.035)*.54,(r.get(`${y.id}/${C}`)||[]).some(L=>L.id!==o.id&&Math.abs(L.s-P)<(o.length+L.length)/2+8))c=0;else{const L=l.path.sample(o.s,-o.direction*l.width*.23).position;L[1]+=(l.mode==="crossing"?-.005:.035)*.54;const G=[_[0],ft(L[1],F.position[1],.5),_[2]],X=[];for(let B=0;B<=12;B++){const ne=B/12,q=1-ne;X.push([q*q*L[0]+2*q*ne*G[0]+ne*ne*F.position[0],ft(L[1],F.position[1],ne),q*q*L[2]+2*q*ne*G[2]+ne*ne*F.position[2]])}o.transition={path:new ht(X),s:0,next:y.id,direction:C,nextS:P,node:M},this.reservations.set(M,{car:o.id,until:t+8});continue}}}o.speed=Math.max(0,o.speed+it(c-o.speed,-2.5*e,1.1*e));const d=Math.min(2,l.path.length*.2);o.s=it(o.s+o.direction*o.speed*e,d,l.path.length-d);const h=l.path.sample(o.s,-o.direction*l.width*.23);o.position=h.position,o.position[1]+=(l.mode==="crossing"?-.005:.035)*.54,o.yaw=h.yaw+(o.direction<0?Math.PI:0),o.pitch=h.pitch*o.direction,o.bank=l.mode==="crossing"?0:.07/l.width}}}const lo="187",jh=0,tl=1,eu=2,er=1,tu=2,Ji=3,hi=0,Qt=1,Sn=2,Li=0,ns=1,nl=2,il=3,sl=4,nu=5,Ri=100,iu=101,su=102,ru=103,au=104,ou=200,lu=201,cu=202,hu=203,bc=204,Ec=205,uu=206,du=207,fu=208,pu=209,mu=210,gu=211,_u=212,vu=213,xu=214,ma=0,ga=1,_a=2,cs=3,va=4,xa=5,Ma=6,Sa=7,wc=0,Mu=1,Su=2,On=0,Tc=1,Ac=2,Rc=3,co=4,Cc=5,Pc=6,Lc=7,Dc=300,Ii=301,hs=302,Pr=303,Lr=304,ya=1e3,Un=1001,ba=1002,Bt=1003,yu=1004,As=1005,Jt=1006,Dr=1007,Zn=1008,sn=1009,Nc=1010,Ic=1011,us=1012,ho=1013,wn=1014,yn=1015,Tn=1016,uo=1017,fo=1018,Ui=1020,Uc=35902,Fc=35899,Oc=1021,Bc=1022,bn=1023,jn=1026,Jn=1027,kc=1028,po=1029,ui=1030,mo=1031,go=1033,tr=33776,nr=33777,ir=33778,sr=33779,Ea=35840,wa=35841,Ta=35842,Aa=35843,Ra=36196,Ca=37492,Pa=37496,La=37488,Da=37489,cr=37490,Na=37491,Ia=37808,Ua=37809,Fa=37810,Oa=37811,Ba=37812,ka=37813,za=37814,Ga=37815,Ha=37816,Va=37817,Wa=37818,Xa=37819,qa=37820,Ya=37821,$a=36492,Ka=36494,Za=36495,Ja=36283,Qa=36284,hr=36285,ja=36286,bu=3200,eo=0,Eu=1,Kn="",an="srgb",ur="srgb-linear",dr="linear",dt="srgb",Nr=7680,wu=519,Tu=512,Au=513,Ru=514,zc=515,Cu=516,Pu=517,Gc=518,Hc=519,Lu=35044,rl="300 es",mn=2e3,ds=2001;function Du(i){for(let e=i.length-1;e>=0;--e)if(i[e]>=65535)return!0;return!1}function fr(i){return document.createElementNS("http://www.w3.org/1999/xhtml",i)}function Nu(){const i=fr("canvas");return i.style.display="block",i}const al={};function ol(...i){const e="THREE."+i.shift();console.log(e,...i)}function Vc(i){const e=i[0];if(typeof e=="string"&&e.startsWith("TSL:")){const t=i[1];t&&t.isStackTrace?i[0]+=" "+t.getLocation():i[1]='Stack trace not available. Enable "THREE.Node.captureStackTrace" to capture stack traces.'}return i}function He(...i){i=Vc(i);const e="THREE."+i.shift();{const t=i[0];t&&t.isStackTrace?console.warn(t.getError(e)):console.warn(e,...i)}}function lt(...i){i=Vc(i);const e="THREE."+i.shift();{const t=i[0];t&&t.isStackTrace?console.error(t.getError(e)):console.error(e,...i)}}function rr(...i){const e=i.join(" ");e in al||(al[e]=!0,He(...i))}function Iu(i,e,t){return new Promise(function(n,s){function r(){switch(i.clientWaitSync(e,i.SYNC_FLUSH_COMMANDS_BIT,0)){case i.WAIT_FAILED:s();break;case i.TIMEOUT_EXPIRED:setTimeout(r,t);break;default:n()}}setTimeout(r,t)})}const Uu={[ma]:ma,[_a]:Ma,[va]:va,[cs]:xa,[ga]:ga,[Ma]:_a,[Sa]:Sa,[xa]:cs};class pi{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});const n=this._listeners;n[e]===void 0&&(n[e]=[]),n[e].indexOf(t)===-1&&n[e].push(t)}hasEventListener(e,t){const n=this._listeners;return n===void 0?!1:n[e]!==void 0&&n[e].indexOf(t)!==-1}removeEventListener(e,t){const n=this._listeners;if(n===void 0)return;const s=n[e];if(s!==void 0){const r=s.indexOf(t);r!==-1&&s.splice(r,1)}}dispatchEvent(e){const t=this._listeners;if(t===void 0)return;const n=t[e.type];if(n!==void 0){e.target=this;const s=n.slice(0);for(let r=0,a=s.length;r<a;r++)s[r].call(this,e);e.target=null}}}const Vt=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"];let ll=1234567;const is=Math.PI/180,fs=180/Math.PI;function mi(){const i=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return(Vt[i&255]+Vt[i>>8&255]+Vt[i>>16&255]+Vt[i>>24&255]+"-"+Vt[e&255]+Vt[e>>8&255]+"-"+Vt[e>>16&15|64]+Vt[e>>24&255]+"-"+Vt[t&63|128]+Vt[t>>8&255]+"-"+Vt[t>>16&255]+Vt[t>>24&255]+Vt[n&255]+Vt[n>>8&255]+Vt[n>>16&255]+Vt[n>>24&255]).toLowerCase()}function nt(i,e,t){return Math.max(e,Math.min(t,i))}function _o(i,e){return(i%e+e)%e}function Fu(i,e,t,n,s){return n+(i-e)*(s-n)/(t-e)}function Ou(i,e,t){return i!==e?(t-i)/(e-i):0}function ss(i,e,t){return(1-t)*i+t*e}function Bu(i,e,t,n){return ss(i,e,1-Math.exp(-t*n))}function ku(i,e=1){return e-Math.abs(_o(i,e*2)-e)}function zu(i,e,t){return i<=e?0:i>=t?1:(i=(i-e)/(t-e),i*i*(3-2*i))}function Gu(i,e,t){return i<=e?0:i>=t?1:(i=(i-e)/(t-e),i*i*i*(i*(i*6-15)+10))}function Hu(i,e){return i+Math.floor(Math.random()*(e-i+1))}function Vu(i,e){return i+Math.random()*(e-i)}function Wu(i){return i*(.5-Math.random())}function Xu(i){i!==void 0&&(ll=i);let e=ll+=1831565813;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}function qu(i){return i*is}function Yu(i){return i*fs}function $u(i){return i>0&&Number.isInteger(i)&&2**Math.round(Math.log2(i))===i}function Ku(i){return Math.pow(2,Math.ceil(Math.log(i)/Math.LN2))}function Wc(i){return Math.pow(2,Math.floor(Math.log(i)/Math.LN2))}function Zu(i,e,t,n,s){const r=Math.cos,a=Math.sin,o=r(t/2),l=a(t/2),c=r((e+n)/2),u=a((e+n)/2),p=r((e-n)/2),d=a((e-n)/2),h=r((n-e)/2),f=a((n-e)/2);switch(s){case"XYX":i.set(o*u,l*p,l*d,o*c);break;case"YZY":i.set(l*d,o*u,l*p,o*c);break;case"ZXZ":i.set(l*p,l*d,o*u,o*c);break;case"XZX":i.set(o*u,l*f,l*h,o*c);break;case"YXY":i.set(l*h,o*u,l*f,o*c);break;case"ZYZ":i.set(l*f,l*h,o*u,o*c);break;default:He("MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: "+s)}}function vo(i){switch(i.constructor){case Uint32Array:return 4294967295;case Uint16Array:return 65535;case Uint8Array:case Uint8ClampedArray:return 255;case Int32Array:return 2147483647;case Int16Array:return 32767;case Int8Array:return 127;default:return}}function Xc(i,e){if(e.constructor===Float32Array)return i;const t=vo(e);if(t===void 0)throw new Error("THREE.MathUtils: Invalid component type.");return Math.max(i/t,-1)}function qc(i,e){if(e.constructor===Float32Array)return i;const t=vo(e);if(t===void 0)throw new Error("THREE.MathUtils: Invalid component type.");return Math.round(i*t)}const xo={DEG2RAD:is,RAD2DEG:fs,generateUUID:mi,clamp:nt,euclideanModulo:_o,mapLinear:Fu,inverseLerp:Ou,lerp:ss,damp:Bu,pingpong:ku,smoothstep:zu,smootherstep:Gu,randInt:Hu,randFloat:Vu,randFloatSpread:Wu,seededRandom:Xu,degToRad:qu,radToDeg:Yu,isPowerOfTwo:$u,ceilPowerOfTwo:Ku,floorPowerOfTwo:Wc,setQuaternionFromProperEuler:Zu,normalize:qc,denormalize:Xc},Bo=class Bo{constructor(e=0,t=0){this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("THREE.Vector2: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("THREE.Vector2: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){const t=this.x,n=this.y,s=e.elements;return this.x=s[0]*t+s[3]*n+s[6],this.y=s[1]*t+s[4]*n+s[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=nt(this.x,e.x,t.x),this.y=nt(this.y,e.y,t.y),this}clampScalar(e,t){return this.x=nt(this.x,e,t),this.y=nt(this.y,e,t),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar(nt(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const n=this.dot(e)/t;return Math.acos(nt(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,n=this.y-e.y;return t*t+n*n}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){const n=Math.cos(t),s=Math.sin(t),r=this.x-e.x,a=this.y-e.y;return this.x=r*n-a*s+e.x,this.y=r*s+a*n+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}};Bo.prototype.isVector2=!0;let Se=Bo;class zi{constructor(e=0,t=0,n=0,s=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=n,this._w=s}static slerpFlat(e,t,n,s,r,a,o){let l=n[s+0],c=n[s+1],u=n[s+2],p=n[s+3],d=r[a+0],h=r[a+1],f=r[a+2],_=r[a+3];if(p!==_||l!==d||c!==h||u!==f){let m=l*d+c*h+u*f+p*_;m<0&&(d=-d,h=-h,f=-f,_=-_,m=-m);let g=1-o;if(m<.9995){const x=Math.acos(m),S=Math.sin(x);g=Math.sin(g*x)/S,o=Math.sin(o*x)/S,l=l*g+d*o,c=c*g+h*o,u=u*g+f*o,p=p*g+_*o}else{l=l*g+d*o,c=c*g+h*o,u=u*g+f*o,p=p*g+_*o;const x=1/Math.sqrt(l*l+c*c+u*u+p*p);l*=x,c*=x,u*=x,p*=x}}e[t]=l,e[t+1]=c,e[t+2]=u,e[t+3]=p}static multiplyQuaternionsFlat(e,t,n,s,r,a){const o=n[s],l=n[s+1],c=n[s+2],u=n[s+3],p=r[a],d=r[a+1],h=r[a+2],f=r[a+3];return e[t]=o*f+u*p+l*h-c*d,e[t+1]=l*f+u*d+c*p-o*h,e[t+2]=c*f+u*h+o*d-l*p,e[t+3]=u*f-o*p-l*d-c*h,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,n,s){return this._x=e,this._y=t,this._z=n,this._w=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){const n=e._x,s=e._y,r=e._z,a=e._order,o=Math.cos,l=Math.sin,c=o(n/2),u=o(s/2),p=o(r/2),d=l(n/2),h=l(s/2),f=l(r/2);switch(a){case"XYZ":this._x=d*u*p+c*h*f,this._y=c*h*p-d*u*f,this._z=c*u*f+d*h*p,this._w=c*u*p-d*h*f;break;case"YXZ":this._x=d*u*p+c*h*f,this._y=c*h*p-d*u*f,this._z=c*u*f-d*h*p,this._w=c*u*p+d*h*f;break;case"ZXY":this._x=d*u*p-c*h*f,this._y=c*h*p+d*u*f,this._z=c*u*f+d*h*p,this._w=c*u*p-d*h*f;break;case"ZYX":this._x=d*u*p-c*h*f,this._y=c*h*p+d*u*f,this._z=c*u*f-d*h*p,this._w=c*u*p+d*h*f;break;case"YZX":this._x=d*u*p+c*h*f,this._y=c*h*p+d*u*f,this._z=c*u*f-d*h*p,this._w=c*u*p-d*h*f;break;case"XZY":this._x=d*u*p-c*h*f,this._y=c*h*p-d*u*f,this._z=c*u*f+d*h*p,this._w=c*u*p+d*h*f;break;default:He("Quaternion: .setFromEuler() encountered an unknown order: "+a)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){const n=t/2,s=Math.sin(n);return this._x=e.x*s,this._y=e.y*s,this._z=e.z*s,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(e){const t=e.elements,n=t[0],s=t[4],r=t[8],a=t[1],o=t[5],l=t[9],c=t[2],u=t[6],p=t[10],d=n+o+p;if(d>0){const h=.5/Math.sqrt(d+1);this._w=.25/h,this._x=(u-l)*h,this._y=(r-c)*h,this._z=(a-s)*h}else if(n>o&&n>p){const h=2*Math.sqrt(1+n-o-p);this._w=(u-l)/h,this._x=.25*h,this._y=(s+a)/h,this._z=(r+c)/h}else if(o>p){const h=2*Math.sqrt(1+o-n-p);this._w=(r-c)/h,this._x=(s+a)/h,this._y=.25*h,this._z=(l+u)/h}else{const h=2*Math.sqrt(1+p-n-o);this._w=(a-s)/h,this._x=(r+c)/h,this._y=(l+u)/h,this._z=.25*h}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let n=e.dot(t)+1;return n<1e-8?(n=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=n):(this._x=0,this._y=-e.z,this._z=e.y,this._w=n)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=n),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(nt(this.dot(e),-1,1)))}rotateTowards(e,t){const n=this.angleTo(e);if(n===0)return this;const s=Math.min(1,t/n);return this.slerp(e,s),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){const n=e._x,s=e._y,r=e._z,a=e._w,o=t._x,l=t._y,c=t._z,u=t._w;return this._x=n*u+a*o+s*c-r*l,this._y=s*u+a*l+r*o-n*c,this._z=r*u+a*c+n*l-s*o,this._w=a*u-n*o-s*l-r*c,this._onChangeCallback(),this}slerp(e,t){let n=e._x,s=e._y,r=e._z,a=e._w,o=this.dot(e);o<0&&(n=-n,s=-s,r=-r,a=-a,o=-o);let l=1-t;if(o<.9995){const c=Math.acos(o),u=Math.sin(c);l=Math.sin(l*c)/u,t=Math.sin(t*c)/u,this._x=this._x*l+n*t,this._y=this._y*l+s*t,this._z=this._z*l+r*t,this._w=this._w*l+a*t,this._onChangeCallback()}else this._x=this._x*l+n*t,this._y=this._y*l+s*t,this._z=this._z*l+r*t,this._w=this._w*l+a*t,this.normalize();return this}slerpQuaternions(e,t,n){return this.copy(e).slerp(t,n)}random(){const e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),n=Math.random(),s=Math.sqrt(1-n),r=Math.sqrt(n);return this.set(s*Math.sin(e),s*Math.cos(e),r*Math.sin(t),r*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}}const ko=class ko{constructor(e=0,t=0,n=0){this.x=e,this.y=t,this.z=n}set(e,t,n){return n===void 0&&(n=this.z),this.x=e,this.y=t,this.z=n,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("THREE.Vector3: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("THREE.Vector3: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(cl.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(cl.setFromAxisAngle(e,t))}applyMatrix3(e){const t=this.x,n=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[3]*n+r[6]*s,this.y=r[1]*t+r[4]*n+r[7]*s,this.z=r[2]*t+r[5]*n+r[8]*s,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){const t=this.x,n=this.y,s=this.z,r=e.elements,a=1/(r[3]*t+r[7]*n+r[11]*s+r[15]);return this.x=(r[0]*t+r[4]*n+r[8]*s+r[12])*a,this.y=(r[1]*t+r[5]*n+r[9]*s+r[13])*a,this.z=(r[2]*t+r[6]*n+r[10]*s+r[14])*a,this}applyQuaternion(e){const t=this.x,n=this.y,s=this.z,r=e.x,a=e.y,o=e.z,l=e.w,c=2*(a*s-o*n),u=2*(o*t-r*s),p=2*(r*n-a*t);return this.x=t+l*c+a*p-o*u,this.y=n+l*u+o*c-r*p,this.z=s+l*p+r*u-a*c,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){const t=this.x,n=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[4]*n+r[8]*s,this.y=r[1]*t+r[5]*n+r[9]*s,this.z=r[2]*t+r[6]*n+r[10]*s,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=nt(this.x,e.x,t.x),this.y=nt(this.y,e.y,t.y),this.z=nt(this.z,e.z,t.z),this}clampScalar(e,t){return this.x=nt(this.x,e,t),this.y=nt(this.y,e,t),this.z=nt(this.z,e,t),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar(nt(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){const n=e.x,s=e.y,r=e.z,a=t.x,o=t.y,l=t.z;return this.x=s*l-r*o,this.y=r*a-n*l,this.z=n*o-s*a,this}projectOnVector(e){const t=e.lengthSq();if(t===0)return this.set(0,0,0);const n=e.dot(this)/t;return this.copy(e).multiplyScalar(n)}projectOnPlane(e){return Ir.copy(this).projectOnVector(e),this.sub(Ir)}reflect(e){return this.sub(Ir.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const n=this.dot(e)/t;return Math.acos(nt(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,n=this.y-e.y,s=this.z-e.z;return t*t+n*n+s*s}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,n){const s=Math.sin(t)*e;return this.x=s*Math.sin(n),this.y=Math.cos(t)*e,this.z=s*Math.cos(n),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,n){return this.x=e*Math.sin(t),this.y=n,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){const t=this.setFromMatrixColumn(e,0).length(),n=this.setFromMatrixColumn(e,1).length(),s=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=n,this.z=s,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){const e=Math.random()*Math.PI*2,t=Math.random()*2-1,n=Math.sqrt(1-t*t);return this.x=n*Math.cos(e),this.y=t,this.z=n*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}};ko.prototype.isVector3=!0;let O=ko;const Ir=new O,cl=new zi,zo=class zo{constructor(e,t,n,s,r,a,o,l,c){this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,n,s,r,a,o,l,c)}set(e,t,n,s,r,a,o,l,c){const u=this.elements;return u[0]=e,u[1]=s,u[2]=o,u[3]=t,u[4]=r,u[5]=l,u[6]=n,u[7]=a,u[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){const t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],this}extractBasis(e,t,n){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(e){const t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const n=e.elements,s=t.elements,r=this.elements,a=n[0],o=n[3],l=n[6],c=n[1],u=n[4],p=n[7],d=n[2],h=n[5],f=n[8],_=s[0],m=s[3],g=s[6],x=s[1],S=s[4],M=s[7],w=s[2],T=s[5],v=s[8];return r[0]=a*_+o*x+l*w,r[3]=a*m+o*S+l*T,r[6]=a*g+o*M+l*v,r[1]=c*_+u*x+p*w,r[4]=c*m+u*S+p*T,r[7]=c*g+u*M+p*v,r[2]=d*_+h*x+f*w,r[5]=d*m+h*S+f*T,r[8]=d*g+h*M+f*v,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){const e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],a=e[4],o=e[5],l=e[6],c=e[7],u=e[8];return t*a*u-t*o*c-n*r*u+n*o*l+s*r*c-s*a*l}invert(){const e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],a=e[4],o=e[5],l=e[6],c=e[7],u=e[8],p=u*a-o*c,d=o*l-u*r,h=c*r-a*l,f=t*p+n*d+s*h;if(f===0)return this.set(0,0,0,0,0,0,0,0,0);const _=1/f;return e[0]=p*_,e[1]=(s*c-u*n)*_,e[2]=(o*n-s*a)*_,e[3]=d*_,e[4]=(u*t-s*l)*_,e[5]=(s*r-o*t)*_,e[6]=h*_,e[7]=(n*l-c*t)*_,e[8]=(a*t-n*r)*_,this}transpose(){let e;const t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){const t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,n,s,r,a,o){const l=Math.cos(r),c=Math.sin(r);return this.set(n*l,n*c,-n*(l*a+c*o)+a+e,-s*c,s*l,-s*(-c*a+l*o)+o+t,0,0,1),this}scale(e,t){return rr("Matrix3: .scale() is deprecated. Use .makeScale() instead."),this.premultiply(Ur.makeScale(e,t)),this}rotate(e){return rr("Matrix3: .rotate() is deprecated. Use .makeRotation() instead."),this.premultiply(Ur.makeRotation(-e)),this}translate(e,t){return rr("Matrix3: .translate() is deprecated. Use .makeTranslation() instead."),this.premultiply(Ur.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){const t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,n,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){const t=this.elements,n=e.elements;for(let s=0;s<9;s++)if(t[s]!==n[s])return!1;return!0}fromArray(e,t=0){for(let n=0;n<9;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){const n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e}clone(){return new this.constructor().fromArray(this.elements)}};zo.prototype.isMatrix3=!0;let Xe=zo;const Ur=new Xe,hl=new Xe().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),ul=new Xe().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function Ju(){const i={enabled:!0,workingColorSpace:ur,spaces:{},convert:function(s,r,a){return this.enabled===!1||r===a||!r||!a||(this.spaces[r].transfer===dt&&(s.r=Bn(s.r),s.g=Bn(s.g),s.b=Bn(s.b)),this.spaces[r].primaries!==this.spaces[a].primaries&&(s.applyMatrix3(this.spaces[r].toXYZ),s.applyMatrix3(this.spaces[a].fromXYZ)),this.spaces[a].transfer===dt&&(s.r=Di(s.r),s.g=Di(s.g),s.b=Di(s.b))),s},workingToColorSpace:function(s,r){return this.convert(s,this.workingColorSpace,r)},colorSpaceToWorking:function(s,r){return this.convert(s,r,this.workingColorSpace)},getPrimaries:function(s){return this.spaces[s].primaries},getTransfer:function(s){return s===Kn?dr:this.spaces[s].transfer},getToneMappingMode:function(s){return this.spaces[s].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(s,r=this.workingColorSpace){return s.fromArray(this.spaces[r].luminanceCoefficients)},define:function(s){Object.assign(this.spaces,s)},_getMatrix:function(s,r,a){return s.copy(this.spaces[a].fromXYZ).multiply(this.spaces[r].toXYZ)},_getDrawingBufferColorSpace:function(s){return this.spaces[s].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(s=this.workingColorSpace){return this.spaces[s].workingColorSpaceConfig.unpackColorSpace}},e=[.64,.33,.3,.6,.15,.06],t=[.2126,.7152,.0722],n=[.3127,.329];return i.define({[ur]:{primaries:e,whitePoint:n,transfer:dr,toXYZ:hl,fromXYZ:ul,luminanceCoefficients:t,workingColorSpaceConfig:{unpackColorSpace:an},outputColorSpaceConfig:{drawingBufferColorSpace:an}},[an]:{primaries:e,whitePoint:n,transfer:dt,toXYZ:hl,fromXYZ:ul,luminanceCoefficients:t,outputColorSpaceConfig:{drawingBufferColorSpace:an}}}),i}const at=Ju();function Bn(i){return i<.04045?i*.0773993808:Math.pow(i*.9478672986+.0521327014,2.4)}function Di(i){return i<.0031308?i*12.92:1.055*Math.pow(i,.41666)-.055}let gi;class Qu{static getDataURL(e,t="image/png"){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let n;if(e instanceof HTMLCanvasElement)n=e;else{gi===void 0&&(gi=fr("canvas")),gi.width=e.width,gi.height=e.height;const s=gi.getContext("2d");e instanceof ImageData?s.putImageData(e,0,0):s.drawImage(e,0,0,e.width,e.height),n=gi}return n.toDataURL(t)}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){const t=fr("canvas");t.width=e.width,t.height=e.height;const n=t.getContext("2d");n.drawImage(e,0,0,e.width,e.height);const s=n.getImageData(0,0,e.width,e.height),r=s.data;for(let a=0;a<r.length;a++)r[a]=Bn(r[a]/255)*255;return n.putImageData(s,0,0),t}else if(e.data){const t=e.data.slice(0);for(let n=0;n<t.length;n++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[n]=Math.floor(Bn(t[n]/255)*255):t[n]=Bn(t[n]);return{data:t,width:e.width,height:e.height}}else return He("ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}}let ju=0;class Mo{constructor(e=null){this.isTextureSource=!0,Object.defineProperty(this,"id",{value:ju++}),this.uuid=mi(),this.data=e,this.dataReady=!0,this.version=0}getSize(e){const t=this.data;return typeof HTMLVideoElement<"u"&&t instanceof HTMLVideoElement?e.set(t.videoWidth,t.videoHeight,0):typeof VideoFrame<"u"&&t instanceof VideoFrame?e.set(t.displayWidth,t.displayHeight,0):t!==null?e.set(t.width||0,t.height||0,t.depth||0):e.set(0,0,0),e}set needsUpdate(e){e===!0&&this.version++}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];const n={uuid:this.uuid,url:""},s=this.data;if(s!==null){let r;if(Array.isArray(s)){r=[];for(let a=0,o=s.length;a<o;a++)s[a].isDataTexture?r.push(Fr(s[a].image)):r.push(Fr(s[a]))}else r=Fr(s);n.url=r}return t||(e.images[this.uuid]=n),n}}function Fr(i){return typeof HTMLImageElement<"u"&&i instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&i instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&i instanceof ImageBitmap?Qu.getDataURL(i):i.data?{data:Array.from(i.data),width:i.width,height:i.height,type:i.data.constructor.name}:(He("Texture: Unable to serialize Texture."),{})}let ed=0;const Or=new O;class Zt extends pi{constructor(e=Zt.DEFAULT_IMAGE,t=Zt.DEFAULT_MAPPING,n=Un,s=Un,r=Jt,a=Zn,o=bn,l=sn,c=Zt.DEFAULT_ANISOTROPY,u=Kn){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:ed++}),this.uuid=mi(),this.name="",this.source=new Mo(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=n,this.wrapT=s,this.magFilter=r,this.minFilter=a,this.anisotropy=c,this.format=o,this.internalFormat=null,this.type=l,this.offset=new Se(0,0),this.repeat=new Se(1,1),this.center=new Se(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new Xe,this.generateMipmaps=!0,this.mipmapsAutoUpdate=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=u,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(e&&e.depth&&e.depth>1),this.pmremVersion=0,this.isPMREMTexture=!1,this.normalized=!1}get width(){return this.source.getSize(Or).x}get height(){return this.source.getSize(Or).y}get depth(){return this.source.getSize(Or).z}get image(){return this.source.data}set image(e){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.normalized=e.normalized,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.mipmapsAutoUpdate=e.mipmapsAutoUpdate,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.renderTarget=e.renderTarget,this.isRenderTargetTexture=e.isRenderTargetTexture,this.isPMREMTexture=e.isPMREMTexture,this.isArrayTexture=e.isArrayTexture,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}setValues(e){for(const t in e){const n=e[t];if(n===void 0){He(`Texture.setValues(): parameter '${t}' has value of undefined.`);continue}const s=this[t];if(s===void 0){He(`Texture.setValues(): property '${t}' does not exist.`);continue}s&&n&&s.isVector2&&n.isVector2||s&&n&&s.isVector3&&n.isVector3||s&&n&&s.isMatrix3&&n.isMatrix3?s.copy(n):this[t]=n}}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];const n={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,normalized:this.normalized,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,mipmapsAutoUpdate:this.mipmapsAutoUpdate,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),t||(e.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==Dc)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case ya:e.x=e.x-Math.floor(e.x);break;case Un:e.x=e.x<0?0:1;break;case ba:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case ya:e.y=e.y-Math.floor(e.y);break;case Un:e.y=e.y<0?0:1;break;case ba:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}}Zt.DEFAULT_IMAGE=null;Zt.DEFAULT_MAPPING=Dc;Zt.DEFAULT_ANISOTROPY=1;const Go=class Go{constructor(e=0,t=0,n=0,s=1){this.x=e,this.y=t,this.z=n,this.w=s}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,n,s){return this.x=e,this.y=t,this.z=n,this.w=s,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("THREE.Vector4: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("THREE.Vector4: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){const t=this.x,n=this.y,s=this.z,r=this.w,a=e.elements;return this.x=a[0]*t+a[4]*n+a[8]*s+a[12]*r,this.y=a[1]*t+a[5]*n+a[9]*s+a[13]*r,this.z=a[2]*t+a[6]*n+a[10]*s+a[14]*r,this.w=a[3]*t+a[7]*n+a[11]*s+a[15]*r,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);const t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,n,s,r;const l=e.elements,c=l[0],u=l[4],p=l[8],d=l[1],h=l[5],f=l[9],_=l[2],m=l[6],g=l[10];if(Math.abs(u-d)<.01&&Math.abs(p-_)<.01&&Math.abs(f-m)<.01){if(Math.abs(u+d)<.1&&Math.abs(p+_)<.1&&Math.abs(f+m)<.1&&Math.abs(c+h+g-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;const S=(c+1)/2,M=(h+1)/2,w=(g+1)/2,T=(u+d)/4,v=(p+_)/4,y=(f+m)/4;return S>M&&S>w?S<.01?(n=0,s=.707106781,r=.707106781):(n=Math.sqrt(S),s=T/n,r=v/n):M>w?M<.01?(n=.707106781,s=0,r=.707106781):(s=Math.sqrt(M),n=T/s,r=y/s):w<.01?(n=.707106781,s=.707106781,r=0):(r=Math.sqrt(w),n=v/r,s=y/r),this.set(n,s,r,t),this}let x=Math.sqrt((m-f)*(m-f)+(p-_)*(p-_)+(d-u)*(d-u));return Math.abs(x)<.001&&(x=1),this.x=(m-f)/x,this.y=(p-_)/x,this.z=(d-u)/x,this.w=Math.acos((c+h+g-1)/2),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=nt(this.x,e.x,t.x),this.y=nt(this.y,e.y,t.y),this.z=nt(this.z,e.z,t.z),this.w=nt(this.w,e.w,t.w),this}clampScalar(e,t){return this.x=nt(this.x,e,t),this.y=nt(this.y,e,t),this.z=nt(this.z,e,t),this.w=nt(this.w,e,t),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar(nt(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this.w=e.w+(t.w-e.w)*n,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}};Go.prototype.isVector4=!0;let Et=Go;class td extends pi{constructor(e=1,t=1,n={}){super(),n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:Jt,depthBuffer:!0,stencilBuffer:!1,resolveColorBuffer:!0,resolveDepthBuffer:!0,resolveStencilBuffer:!0,storeMultisampledColorBuffer:!0,storeMultisampledDepthBuffer:!0,storeMultisampledStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1,useArrayDepthTexture:!1},n),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=n.depth,this.scissor=new Et(0,0,e,t),this.scissorTest=!1,this.viewport=new Et(0,0,e,t),this.textures=[];const s=n.count;for(let r=0;r<s;r++)this.textures[r]=new Zt({width:e,height:t,depth:n.depth}),this.textures[r].isRenderTargetTexture=!0,this.textures[r].renderTarget=this;this._setTextureOptions(n),this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveColorBuffer=n.resolveColorBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this.storeMultisampledColorBuffer=n.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=n.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=n.storeMultisampledStencilBuffer,this._depthTexture=null,this.depthTexture=n.depthTexture,this.samples=n.samples,this.multiview=n.multiview,this.useArrayDepthTexture=n.useArrayDepthTexture}_setTextureOptions(e={}){const t={minFilter:Jt,generateMipmaps:!1,flipY:!1,internalFormat:null};e.mapping!==void 0&&(t.mapping=e.mapping),e.wrapS!==void 0&&(t.wrapS=e.wrapS),e.wrapT!==void 0&&(t.wrapT=e.wrapT),e.wrapR!==void 0&&(t.wrapR=e.wrapR),e.magFilter!==void 0&&(t.magFilter=e.magFilter),e.minFilter!==void 0&&(t.minFilter=e.minFilter),e.format!==void 0&&(t.format=e.format),e.type!==void 0&&(t.type=e.type),e.anisotropy!==void 0&&(t.anisotropy=e.anisotropy),e.colorSpace!==void 0&&(t.colorSpace=e.colorSpace),e.flipY!==void 0&&(t.flipY=e.flipY),e.generateMipmaps!==void 0&&(t.generateMipmaps=e.generateMipmaps),e.mipmapsAutoUpdate!==void 0&&(t.mipmapsAutoUpdate=e.mipmapsAutoUpdate),e.internalFormat!==void 0&&(t.internalFormat=e.internalFormat);for(let n=0;n<this.textures.length;n++)this.textures[n].setValues(t)}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}set depthTexture(e){this._depthTexture!==null&&this._depthTexture.renderTarget===this&&(this._depthTexture.renderTarget=null),e!==null&&e.renderTarget===null&&(e.renderTarget=this),this._depthTexture=e}get depthTexture(){return this._depthTexture}setSize(e,t,n=1){if(this.width!==e||this.height!==t||this.depth!==n){this.width=e,this.height=t,this.depth=n;for(let s=0,r=this.textures.length;s<r;s++)this.textures[s].image.width=e,this.textures[s].image.height=t,this.textures[s].image.depth=n,this.textures[s].isData3DTexture!==!0&&(this.textures[s].isArrayTexture=this.textures[s].image.depth>1);this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let t=0,n=e.textures.length;t<n;t++){this.textures[t]=e.textures[t].clone(),this.textures[t].isRenderTargetTexture=!0,this.textures[t].renderTarget=this;const s=Object.assign({},e.textures[t].image);this.textures[t].source=new Mo(s)}if(this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveColorBuffer=e.resolveColorBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,this.storeMultisampledColorBuffer=e.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=e.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=e.storeMultisampledStencilBuffer,e.depthTexture!==null)if(e.depthTexture.renderTarget===e){const t=e.depthTexture.clone();t.renderTarget=null,this.depthTexture=t}else this.depthTexture=e.depthTexture;else this.depthTexture=null;return this.samples=e.samples,this.multiview=e.multiview,this.useArrayDepthTexture=e.useArrayDepthTexture,this}dispose(){this.dispatchEvent({type:"dispose"})}}class En extends td{constructor(e=1,t=1,n={}){super(e,t,n),this.isWebGLRenderTarget=!0}}class Yc extends Zt{constructor(e=null,t=1,n=1,s=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:n,depth:s},this.magFilter=Bt,this.minFilter=Bt,this.wrapR=Un,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}copy(e){return super.copy(e),this.wrapR=e.wrapR,this}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}}class nd extends Zt{constructor(e=null,t=1,n=1,s=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:n,depth:s},this.magFilter=Bt,this.minFilter=Bt,this.wrapR=Un,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}copy(e){return super.copy(e),this.wrapR=e.wrapR,this}}const Sr=class Sr{constructor(e,t,n,s,r,a,o,l,c,u,p,d,h,f,_,m){this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,n,s,r,a,o,l,c,u,p,d,h,f,_,m)}set(e,t,n,s,r,a,o,l,c,u,p,d,h,f,_,m){const g=this.elements;return g[0]=e,g[4]=t,g[8]=n,g[12]=s,g[1]=r,g[5]=a,g[9]=o,g[13]=l,g[2]=c,g[6]=u,g[10]=p,g[14]=d,g[3]=h,g[7]=f,g[11]=_,g[15]=m,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new Sr().fromArray(this.elements)}copy(e){const t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],t[9]=n[9],t[10]=n[10],t[11]=n[11],t[12]=n[12],t[13]=n[13],t[14]=n[14],t[15]=n[15],this}copyPosition(e){const t=this.elements,n=e.elements;return t[12]=n[12],t[13]=n[13],t[14]=n[14],this}setFromMatrix3(e){const t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,n){return this.determinantAffine()===0?(e.set(1,0,0),t.set(0,1,0),n.set(0,0,1),this):(e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this)}makeBasis(e,t,n){return this.set(e.x,t.x,n.x,0,e.y,t.y,n.y,0,e.z,t.z,n.z,0,0,0,0,1),this}extractRotation(e){if(e.determinantAffine()===0)return this.identity();const t=this.elements,n=e.elements,s=1/_i.setFromMatrixColumn(e,0).length(),r=1/_i.setFromMatrixColumn(e,1).length(),a=1/_i.setFromMatrixColumn(e,2).length();return t[0]=n[0]*s,t[1]=n[1]*s,t[2]=n[2]*s,t[3]=0,t[4]=n[4]*r,t[5]=n[5]*r,t[6]=n[6]*r,t[7]=0,t[8]=n[8]*a,t[9]=n[9]*a,t[10]=n[10]*a,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){const t=this.elements,n=e.x,s=e.y,r=e.z,a=Math.cos(n),o=Math.sin(n),l=Math.cos(s),c=Math.sin(s),u=Math.cos(r),p=Math.sin(r);if(e.order==="XYZ"){const d=a*u,h=a*p,f=o*u,_=o*p;t[0]=l*u,t[4]=-l*p,t[8]=c,t[1]=h+f*c,t[5]=d-_*c,t[9]=-o*l,t[2]=_-d*c,t[6]=f+h*c,t[10]=a*l}else if(e.order==="YXZ"){const d=l*u,h=l*p,f=c*u,_=c*p;t[0]=d+_*o,t[4]=f*o-h,t[8]=a*c,t[1]=a*p,t[5]=a*u,t[9]=-o,t[2]=h*o-f,t[6]=_+d*o,t[10]=a*l}else if(e.order==="ZXY"){const d=l*u,h=l*p,f=c*u,_=c*p;t[0]=d-_*o,t[4]=-a*p,t[8]=f+h*o,t[1]=h+f*o,t[5]=a*u,t[9]=_-d*o,t[2]=-a*c,t[6]=o,t[10]=a*l}else if(e.order==="ZYX"){const d=a*u,h=a*p,f=o*u,_=o*p;t[0]=l*u,t[4]=f*c-h,t[8]=d*c+_,t[1]=l*p,t[5]=_*c+d,t[9]=h*c-f,t[2]=-c,t[6]=o*l,t[10]=a*l}else if(e.order==="YZX"){const d=a*l,h=a*c,f=o*l,_=o*c;t[0]=l*u,t[4]=_-d*p,t[8]=f*p+h,t[1]=p,t[5]=a*u,t[9]=-o*u,t[2]=-c*u,t[6]=h*p+f,t[10]=d-_*p}else if(e.order==="XZY"){const d=a*l,h=a*c,f=o*l,_=o*c;t[0]=l*u,t[4]=-p,t[8]=c*u,t[1]=d*p+_,t[5]=a*u,t[9]=h*p-f,t[2]=f*p-h,t[6]=o*u,t[10]=_*p+d}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(id,e,sd)}lookAt(e,t,n){const s=this.elements;return en.subVectors(e,t),en.lengthSq()===0&&(en.z=1),en.normalize(),Vn.crossVectors(n,en),Vn.lengthSq()===0&&(Math.abs(n.z)===1?en.x+=1e-4:en.z+=1e-4,en.normalize(),Vn.crossVectors(n,en)),Vn.normalize(),Rs.crossVectors(en,Vn),s[0]=Vn.x,s[4]=Rs.x,s[8]=en.x,s[1]=Vn.y,s[5]=Rs.y,s[9]=en.y,s[2]=Vn.z,s[6]=Rs.z,s[10]=en.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const n=e.elements,s=t.elements,r=this.elements,a=n[0],o=n[4],l=n[8],c=n[12],u=n[1],p=n[5],d=n[9],h=n[13],f=n[2],_=n[6],m=n[10],g=n[14],x=n[3],S=n[7],M=n[11],w=n[15],T=s[0],v=s[4],y=s[8],C=s[12],R=s[1],P=s[5],F=s[9],z=s[13],L=s[2],G=s[6],X=s[10],B=s[14],ne=s[3],q=s[7],ee=s[11],se=s[15];return r[0]=a*T+o*R+l*L+c*ne,r[4]=a*v+o*P+l*G+c*q,r[8]=a*y+o*F+l*X+c*ee,r[12]=a*C+o*z+l*B+c*se,r[1]=u*T+p*R+d*L+h*ne,r[5]=u*v+p*P+d*G+h*q,r[9]=u*y+p*F+d*X+h*ee,r[13]=u*C+p*z+d*B+h*se,r[2]=f*T+_*R+m*L+g*ne,r[6]=f*v+_*P+m*G+g*q,r[10]=f*y+_*F+m*X+g*ee,r[14]=f*C+_*z+m*B+g*se,r[3]=x*T+S*R+M*L+w*ne,r[7]=x*v+S*P+M*G+w*q,r[11]=x*y+S*F+M*X+w*ee,r[15]=x*C+S*z+M*B+w*se,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){const e=this.elements,t=e[0],n=e[4],s=e[8],r=e[12],a=e[1],o=e[5],l=e[9],c=e[13],u=e[2],p=e[6],d=e[10],h=e[14],f=e[3],_=e[7],m=e[11],g=e[15],x=l*h-c*d,S=o*h-c*p,M=o*d-l*p,w=a*h-c*u,T=a*d-l*u,v=a*p-o*u;return t*(_*x-m*S+g*M)-n*(f*x-m*w+g*T)+s*(f*S-_*w+g*v)-r*(f*M-_*T+m*v)}determinantAffine(){const e=this.elements,t=e[0],n=e[4],s=e[8],r=e[1],a=e[5],o=e[9],l=e[2],c=e[6],u=e[10];return t*(a*u-o*c)-n*(r*u-o*l)+s*(r*c-a*l)}transpose(){const e=this.elements;let t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,n){const s=this.elements;return e.isVector3?(s[12]=e.x,s[13]=e.y,s[14]=e.z):(s[12]=e,s[13]=t,s[14]=n),this}invert(){const e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],a=e[4],o=e[5],l=e[6],c=e[7],u=e[8],p=e[9],d=e[10],h=e[11],f=e[12],_=e[13],m=e[14],g=e[15],x=t*o-n*a,S=t*l-s*a,M=t*c-r*a,w=n*l-s*o,T=n*c-r*o,v=s*c-r*l,y=u*_-p*f,C=u*m-d*f,R=u*g-h*f,P=p*m-d*_,F=p*g-h*_,z=d*g-h*m,L=x*z-S*F+M*P+w*R-T*C+v*y;if(L===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);const G=1/L;return e[0]=(o*z-l*F+c*P)*G,e[1]=(s*F-n*z-r*P)*G,e[2]=(_*v-m*T+g*w)*G,e[3]=(d*T-p*v-h*w)*G,e[4]=(l*R-a*z-c*C)*G,e[5]=(t*z-s*R+r*C)*G,e[6]=(m*M-f*v-g*S)*G,e[7]=(u*v-d*M+h*S)*G,e[8]=(a*F-o*R+c*y)*G,e[9]=(n*R-t*F-r*y)*G,e[10]=(f*T-_*M+g*x)*G,e[11]=(p*M-u*T-h*x)*G,e[12]=(o*C-a*P-l*y)*G,e[13]=(t*P-n*C+s*y)*G,e[14]=(_*S-f*w-m*x)*G,e[15]=(u*w-p*S+d*x)*G,this}scale(e){const t=this.elements,n=e.x,s=e.y,r=e.z;return t[0]*=n,t[4]*=s,t[8]*=r,t[1]*=n,t[5]*=s,t[9]*=r,t[2]*=n,t[6]*=s,t[10]*=r,t[3]*=n,t[7]*=s,t[11]*=r,this}getMaxScaleOnAxis(){const e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],n=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],s=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,n,s))}makeTranslation(e,t,n){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,n,0,0,0,1),this}makeRotationX(e){const t=Math.cos(e),n=Math.sin(e);return this.set(1,0,0,0,0,t,-n,0,0,n,t,0,0,0,0,1),this}makeRotationY(e){const t=Math.cos(e),n=Math.sin(e);return this.set(t,0,n,0,0,1,0,0,-n,0,t,0,0,0,0,1),this}makeRotationZ(e){const t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,0,n,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){const n=Math.cos(t),s=Math.sin(t),r=1-n,a=e.x,o=e.y,l=e.z,c=r*a,u=r*o;return this.set(c*a+n,c*o-s*l,c*l+s*o,0,c*o+s*l,u*o+n,u*l-s*a,0,c*l-s*o,u*l+s*a,r*l*l+n,0,0,0,0,1),this}makeScale(e,t,n){return this.set(e,0,0,0,0,t,0,0,0,0,n,0,0,0,0,1),this}makeShear(e,t,n,s,r,a){return this.set(1,n,r,0,e,1,a,0,t,s,1,0,0,0,0,1),this}compose(e,t,n){const s=this.elements,r=t._x,a=t._y,o=t._z,l=t._w,c=r+r,u=a+a,p=o+o,d=r*c,h=r*u,f=r*p,_=a*u,m=a*p,g=o*p,x=l*c,S=l*u,M=l*p,w=n.x,T=n.y,v=n.z;return s[0]=(1-(_+g))*w,s[1]=(h+M)*w,s[2]=(f-S)*w,s[3]=0,s[4]=(h-M)*T,s[5]=(1-(d+g))*T,s[6]=(m+x)*T,s[7]=0,s[8]=(f+S)*v,s[9]=(m-x)*v,s[10]=(1-(d+_))*v,s[11]=0,s[12]=e.x,s[13]=e.y,s[14]=e.z,s[15]=1,this}decompose(e,t,n){const s=this.elements;e.x=s[12],e.y=s[13],e.z=s[14];const r=this.determinantAffine();if(r===0)return n.set(1,1,1),t.identity(),this;let a=_i.set(s[0],s[1],s[2]).length();const o=_i.set(s[4],s[5],s[6]).length(),l=_i.set(s[8],s[9],s[10]).length();r<0&&(a=-a),cn.copy(this);const c=1/a,u=1/o,p=1/l;return cn.elements[0]*=c,cn.elements[1]*=c,cn.elements[2]*=c,cn.elements[4]*=u,cn.elements[5]*=u,cn.elements[6]*=u,cn.elements[8]*=p,cn.elements[9]*=p,cn.elements[10]*=p,t.setFromRotationMatrix(cn),n.x=a,n.y=o,n.z=l,this}makePerspective(e,t,n,s,r,a,o=mn,l=!1){const c=this.elements,u=2*r/(t-e),p=2*r/(n-s),d=(t+e)/(t-e),h=(n+s)/(n-s);let f,_;if(l)f=r/(a-r),_=a*r/(a-r);else if(o===mn)f=-(a+r)/(a-r),_=-2*a*r/(a-r);else if(o===ds)f=-a/(a-r),_=-a*r/(a-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+o);return c[0]=u,c[4]=0,c[8]=d,c[12]=0,c[1]=0,c[5]=p,c[9]=h,c[13]=0,c[2]=0,c[6]=0,c[10]=f,c[14]=_,c[3]=0,c[7]=0,c[11]=-1,c[15]=0,this}makeOrthographic(e,t,n,s,r,a,o=mn,l=!1){const c=this.elements,u=2/(t-e),p=2/(n-s),d=-(t+e)/(t-e),h=-(n+s)/(n-s);let f,_;if(l)f=1/(a-r),_=a/(a-r);else if(o===mn)f=-2/(a-r),_=-(a+r)/(a-r);else if(o===ds)f=-1/(a-r),_=-r/(a-r);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+o);return c[0]=u,c[4]=0,c[8]=0,c[12]=d,c[1]=0,c[5]=p,c[9]=0,c[13]=h,c[2]=0,c[6]=0,c[10]=f,c[14]=_,c[3]=0,c[7]=0,c[11]=0,c[15]=1,this}equals(e){const t=this.elements,n=e.elements;for(let s=0;s<16;s++)if(t[s]!==n[s])return!1;return!0}fromArray(e,t=0){for(let n=0;n<16;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){const n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e[t+9]=n[9],e[t+10]=n[10],e[t+11]=n[11],e[t+12]=n[12],e[t+13]=n[13],e[t+14]=n[14],e[t+15]=n[15],e}};Sr.prototype.isMatrix4=!0;let xt=Sr;const _i=new O,cn=new xt,id=new O(0,0,0),sd=new O(1,1,1),Vn=new O,Rs=new O,en=new O,dl=new xt,fl=new zi;class ei{constructor(e=0,t=0,n=0,s=ei.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=n,this._order=s}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,n,s=this._order){return this._x=e,this._y=t,this._z=n,this._order=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,n=!0){const s=e.elements,r=s[0],a=s[4],o=s[8],l=s[1],c=s[5],u=s[9],p=s[2],d=s[6],h=s[10];switch(t){case"XYZ":this._y=Math.asin(nt(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-u,h),this._z=Math.atan2(-a,r)):(this._x=Math.atan2(d,c),this._z=0);break;case"YXZ":this._x=Math.asin(-nt(u,-1,1)),Math.abs(u)<.9999999?(this._y=Math.atan2(o,h),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-p,r),this._z=0);break;case"ZXY":this._x=Math.asin(nt(d,-1,1)),Math.abs(d)<.9999999?(this._y=Math.atan2(-p,h),this._z=Math.atan2(-a,c)):(this._y=0,this._z=Math.atan2(l,r));break;case"ZYX":this._y=Math.asin(-nt(p,-1,1)),Math.abs(p)<.9999999?(this._x=Math.atan2(d,h),this._z=Math.atan2(l,r)):(this._x=0,this._z=Math.atan2(-a,c));break;case"YZX":this._z=Math.asin(nt(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-u,c),this._y=Math.atan2(-p,r)):(this._x=0,this._y=Math.atan2(o,h));break;case"XZY":this._z=Math.asin(-nt(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(d,c),this._y=Math.atan2(o,r)):(this._x=Math.atan2(-u,h),this._y=0);break;default:He("Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,n===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,n){return dl.makeRotationFromQuaternion(e),this.setFromRotationMatrix(dl,t,n)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return fl.setFromEuler(this),this.setFromQuaternion(fl,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}}ei.DEFAULT_ORDER="XYZ";class $c{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}}let rd=0;const pl=new O,vi=new zi,Cn=new xt,Cs=new O,Vi=new O,ad=new O,od=new zi,ml=new O(1,0,0),gl=new O(0,1,0),_l=new O(0,0,1),vl={type:"added"},ld={type:"removed"},xi={type:"childadded",child:null},Br={type:"childremoved",child:null};class kt extends pi{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:rd++}),this.uuid=mi(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=kt.DEFAULT_UP.clone();const e=new O,t=new ei,n=new zi,s=new O(1,1,1);function r(){n.setFromEuler(t,!1)}function a(){t.setFromQuaternion(n,void 0,!1)}t._onChange(r),n._onChange(a),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:s},modelViewMatrix:{value:new xt},normalMatrix:{value:new Xe}}),this.matrix=new xt,this.matrixWorld=new xt,this.matrixAutoUpdate=kt.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=kt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new $c,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.static=!1,this.userData={},this.pivot=null}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale),this.pivot!==null&&this.position.copy(this.pivot).applyMatrix4(this.matrix).sub(this.pivot)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return vi.setFromAxisAngle(e,t),this.quaternion.multiply(vi),this}rotateOnWorldAxis(e,t){return vi.setFromAxisAngle(e,t),this.quaternion.premultiply(vi),this}rotateX(e){return this.rotateOnAxis(ml,e)}rotateY(e){return this.rotateOnAxis(gl,e)}rotateZ(e){return this.rotateOnAxis(_l,e)}translateOnAxis(e,t){return pl.copy(e).applyQuaternion(this.quaternion),this.position.add(pl.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(ml,e)}translateY(e){return this.translateOnAxis(gl,e)}translateZ(e){return this.translateOnAxis(_l,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(Cn.copy(this.matrixWorld).invert())}lookAt(e,t,n){e.isVector3?Cs.copy(e):Cs.set(e,t,n);const s=this.parent;this.updateWorldMatrix(!0,!1),Vi.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?Cn.lookAt(Vi,Cs,this.up):Cn.lookAt(Cs,Vi,this.up),this.quaternion.setFromRotationMatrix(Cn),s&&(Cn.extractRotation(s.matrixWorld),vi.setFromRotationMatrix(Cn),this.quaternion.premultiply(vi.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(lt("Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(vl),xi.child=e,this.dispatchEvent(xi),xi.child=null):lt("Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}const t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(ld),Br.child=e,this.dispatchEvent(Br),Br.child=null),this}removeFromParent(){const e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),Cn.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),Cn.multiply(e.parent.matrixWorld)),e.applyMatrix4(Cn),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(vl),xi.child=e,this.dispatchEvent(xi),xi.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let n=0,s=this.children.length;n<s;n++){const a=this.children[n].getObjectByProperty(e,t);if(a!==void 0)return a}}getObjectsByProperty(e,t,n=[]){this[e]===t&&n.push(this);const s=this.children;for(let r=0,a=s.length;r<a;r++)s[r].getObjectsByProperty(e,t,n);return n}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Vi,e,ad),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Vi,od,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);const t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}intersectsFrustum(){return!0}traverse(e){e(this);const t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);const t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].traverseVisible(e)}traverseAncestors(e){const t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale);const e=this.pivot;if(e!==null){const t=e.x,n=e.y,s=e.z,r=this.matrix.elements;r[12]+=t-r[0]*t-r[4]*n-r[8]*s,r[13]+=n-r[1]*t-r[5]*n-r[9]*s,r[14]+=s-r[2]*t-r[6]*n-r[10]*s}this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);const t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].updateMatrixWorld(e)}updateWorldMatrix(e,t,n=!1){const s=this.parent;if(e===!0&&s!==null&&s.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||n)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,n=!0),t===!0){const r=this.children;for(let a=0,o=r.length;a<o;a++)r[a].updateWorldMatrix(!1,!0,n)}}toJSON(e){const t=e===void 0||typeof e=="string",n={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});const s={};s.uuid=this.uuid,s.type=this.type,s.name=this.name,s.castShadow=this.castShadow,s.receiveShadow=this.receiveShadow,s.visible=this.visible,s.frustumCulled=this.frustumCulled,s.renderOrder=this.renderOrder,s.static=this.static,s.matrixAutoUpdate=this.matrixAutoUpdate,Object.keys(this.userData).length>0&&(s.userData=this.userData),s.layers=this.layers.mask,s.matrix=this.matrix.toArray(),s.up=this.up.toArray(),this.pivot!==null&&(s.pivot=this.pivot.toArray()),this.morphTargetDictionary!==void 0&&(s.morphTargetDictionary=Object.assign({},this.morphTargetDictionary)),this.morphTargetInfluences!==void 0&&(s.morphTargetInfluences=this.morphTargetInfluences.slice()),this.isInstancedMesh&&(s.type="InstancedMesh",s.count=this.count,s.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(s.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(s.type="BatchedMesh",s.perObjectFrustumCulled=this.perObjectFrustumCulled,s.sortObjects=this.sortObjects,s.drawRanges=this._drawRanges,s.reservedRanges=this._reservedRanges,s.geometryInfo=this._geometryInfo.map(o=>({...o,boundingBox:o.boundingBox?o.boundingBox.toJSON():void 0,boundingSphere:o.boundingSphere?o.boundingSphere.toJSON():void 0})),s.instanceInfo=this._instanceInfo.map(o=>({...o})),s.availableInstanceIds=this._availableInstanceIds.slice(),s.availableGeometryIds=this._availableGeometryIds.slice(),s.nextIndexStart=this._nextIndexStart,s.nextVertexStart=this._nextVertexStart,s.geometryCount=this._geometryCount,s.maxInstanceCount=this._maxInstanceCount,s.maxVertexCount=this._maxVertexCount,s.maxIndexCount=this._maxIndexCount,s.geometryInitialized=this._geometryInitialized,s.matricesTexture=this._matricesTexture.toJSON(e),s.indirectTexture=this._indirectTexture.toJSON(e),this._colorsTexture!==null&&(s.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(s.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(s.boundingBox=this.boundingBox.toJSON()));function r(o,l){return o[l.uuid]===void 0&&(o[l.uuid]=l.toJSON(e)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?s.background=this.background.toJSON():this.background.isTexture&&(s.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(s.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){s.geometry=r(e.geometries,this.geometry);const o=this.geometry.parameters;if(o!==void 0&&o.shapes!==void 0){const l=o.shapes;if(Array.isArray(l))for(let c=0,u=l.length;c<u;c++){const p=l[c];r(e.shapes,p)}else r(e.shapes,l)}}if(this.isSkinnedMesh&&(s.bindMode=this.bindMode,s.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(e.skeletons,this.skeleton),s.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){const o=[];for(let l=0,c=this.material.length;l<c;l++)o.push(r(e.materials,this.material[l]));s.material=o}else s.material=r(e.materials,this.material);if(this.children.length>0){s.children=[];for(let o=0;o<this.children.length;o++)s.children.push(this.children[o].toJSON(e).object)}if(this.animations.length>0){s.animations=[];for(let o=0;o<this.animations.length;o++){const l=this.animations[o];s.animations.push(r(e.animations,l))}}if(t){const o=a(e.geometries),l=a(e.materials),c=a(e.textures),u=a(e.images),p=a(e.shapes),d=a(e.skeletons),h=a(e.animations),f=a(e.nodes);o.length>0&&(n.geometries=o),l.length>0&&(n.materials=l),c.length>0&&(n.textures=c),u.length>0&&(n.images=u),p.length>0&&(n.shapes=p),d.length>0&&(n.skeletons=d),h.length>0&&(n.animations=h),f.length>0&&(n.nodes=f)}return n.object=s,n;function a(o){const l=[];for(const c in o){const u=o[c];delete u.metadata,l.push(u)}return l}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.pivot=e.pivot!==null?e.pivot.clone():null,this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.static=e.static,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let n=0;n<e.children.length;n++){const s=e.children[n];this.add(s.clone())}return this}dispose(){this.dispatchEvent({type:"dispose"})}}kt.DEFAULT_UP=new O(0,1,0);kt.DEFAULT_MATRIX_AUTO_UPDATE=!0;kt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;class St extends kt{constructor(){super(),this.isGroup=!0,this.type="Group"}}const cd={type:"move"};class kr{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new St,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new St,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new O,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new O),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new St,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new O,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new O,this._grip.eventsEnabled=!1),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){const t=this._hand;if(t)for(const n of e.hand.values())this._getHandJoint(t,n)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,n){let s=null,r=null,a=null;const o=this._targetRay,l=this._grip,c=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(c&&e.hand){a=!0;for(const _ of e.hand.values()){const m=t.getJointPose(_,n),g=this._getHandJoint(c,_);m!==null&&(g.matrix.fromArray(m.transform.matrix),g.matrix.decompose(g.position,g.quaternion,g.scale),g.matrixWorldNeedsUpdate=!0,g.jointRadius=m.radius),g.visible=m!==null}const u=c.joints["index-finger-tip"],p=c.joints["thumb-tip"],d=u.position.distanceTo(p.position),h=.02,f=.005;c.inputState.pinching&&d>h+f?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!c.inputState.pinching&&d<=h-f&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else l!==null&&e.gripSpace&&(r=t.getPose(e.gripSpace,n),r!==null&&(l.matrix.fromArray(r.transform.matrix),l.matrix.decompose(l.position,l.quaternion,l.scale),l.matrixWorldNeedsUpdate=!0,r.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(r.linearVelocity)):l.hasLinearVelocity=!1,r.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(r.angularVelocity)):l.hasAngularVelocity=!1,l.eventsEnabled&&l.dispatchEvent({type:"gripUpdated",data:e,target:this})));o!==null&&(s=t.getPose(e.targetRaySpace,n),s===null&&r!==null&&(s=r),s!==null&&(o.matrix.fromArray(s.transform.matrix),o.matrix.decompose(o.position,o.quaternion,o.scale),o.matrixWorldNeedsUpdate=!0,s.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(s.linearVelocity)):o.hasLinearVelocity=!1,s.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(s.angularVelocity)):o.hasAngularVelocity=!1,this.dispatchEvent(cd)))}return o!==null&&(o.visible=s!==null),l!==null&&(l.visible=r!==null),c!==null&&(c.visible=a!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){const n=new St;n.matrixAutoUpdate=!1,n.visible=!1,e.joints[t.jointName]=n,e.add(n)}return e.joints[t.jointName]}}const Kc={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},Wn={h:0,s:0,l:0},Ps={h:0,s:0,l:0};function zr(i,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?i+(e-i)*6*t:t<1/2?e:t<2/3?i+(e-i)*6*(2/3-t):i}class Ve{constructor(e,t,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,n)}set(e,t,n){if(t===void 0&&n===void 0){const s=e;s&&s.isColor?this.copy(s):typeof s=="number"?this.setHex(s):typeof s=="string"&&this.setStyle(s)}else this.setRGB(e,t,n);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=an){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,at.colorSpaceToWorking(this,t),this}setRGB(e,t,n,s=at.workingColorSpace){return this.r=e,this.g=t,this.b=n,at.colorSpaceToWorking(this,s),this}setHSL(e,t,n,s=at.workingColorSpace){if(e=_o(e,1),t=nt(t,0,1),n=nt(n,0,1),t===0)this.r=this.g=this.b=n;else{const r=n<=.5?n*(1+t):n+t-n*t,a=2*n-r;this.r=zr(a,r,e+1/3),this.g=zr(a,r,e),this.b=zr(a,r,e-1/3)}return at.colorSpaceToWorking(this,s),this}setStyle(e,t=an){function n(r){r!==void 0&&parseFloat(r)<1&&He("Color: Alpha component of "+e+" will be ignored.")}let s;if(s=/^(\w+)\(([^\)]*)\)/.exec(e)){let r;const a=s[1],o=s[2];switch(a){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d+(?:\.\d+)?|\.\d+)\s*)?$/.exec(o))return n(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,t);if(r=/^\s*(\d+(?:\.\d+)?|\.\d+)\%\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*(?:,\s*(\d+(?:\.\d+)?|\.\d+)\s*)?$/.exec(o))return n(r[4]),this.setRGB(Math.min(100,parseFloat(r[1]))/100,Math.min(100,parseFloat(r[2]))/100,Math.min(100,parseFloat(r[3]))/100,t);break;case"hsl":case"hsla":if(r=/^\s*([+-]?(?:\d+(?:\.\d+)?|\.\d+))\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*(?:,\s*(\d+(?:\.\d+)?|\.\d+)\s*)?$/.exec(o))return n(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,t);break;default:He("Color: Unknown color model "+e)}}else if(s=/^\#([A-Fa-f\d]+)$/.exec(e)){const r=s[1],a=r.length;if(a===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,t);if(a===6)return this.setHex(parseInt(r,16),t);He("Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=an){const n=Kc[e.toLowerCase()];return n!==void 0?this.setHex(n,t):He("Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=Bn(e.r),this.g=Bn(e.g),this.b=Bn(e.b),this}copyLinearToSRGB(e){return this.r=Di(e.r),this.g=Di(e.g),this.b=Di(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=an){return at.workingToColorSpace(Wt.copy(this),e),Math.round(nt(Wt.r*255,0,255))*65536+Math.round(nt(Wt.g*255,0,255))*256+Math.round(nt(Wt.b*255,0,255))}getHexString(e=an){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=at.workingColorSpace){at.workingToColorSpace(Wt.copy(this),t);const n=Wt.r,s=Wt.g,r=Wt.b,a=Math.max(n,s,r),o=Math.min(n,s,r);let l,c;const u=(o+a)/2;if(o===a)l=0,c=0;else{const p=a-o;switch(c=u<=.5?p/(a+o):p/(2-a-o),a){case n:l=(s-r)/p+(s<r?6:0);break;case s:l=(r-n)/p+2;break;case r:l=(n-s)/p+4;break}l/=6}return e.h=l,e.s=c,e.l=u,e}getRGB(e,t=at.workingColorSpace){return at.workingToColorSpace(Wt.copy(this),t),e.r=Wt.r,e.g=Wt.g,e.b=Wt.b,e}getStyle(e=an){at.workingToColorSpace(Wt.copy(this),e);const t=Wt.r,n=Wt.g,s=Wt.b;return e!==an?`color(${e} ${t.toFixed(3)} ${n.toFixed(3)} ${s.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(n*255)},${Math.round(s*255)})`}offsetHSL(e,t,n){return this.getHSL(Wn),this.setHSL(Wn.h+e,Wn.s+t,Wn.l+n)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,n){return this.r=e.r+(t.r-e.r)*n,this.g=e.g+(t.g-e.g)*n,this.b=e.b+(t.b-e.b)*n,this}lerpHSL(e,t){this.getHSL(Wn),e.getHSL(Ps);const n=ss(Wn.h,Ps.h,t),s=ss(Wn.s,Ps.s,t),r=ss(Wn.l,Ps.l,t);return this.setHSL(n,s,r),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){const t=this.r,n=this.g,s=this.b,r=e.elements;return this.r=r[0]*t+r[3]*n+r[6]*s,this.g=r[1]*t+r[4]*n+r[7]*s,this.b=r[2]*t+r[5]*n+r[8]*s,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}}const Wt=new Ve;Ve.NAMES=Kc;class So{constructor(e,t=1,n=1e3){this.isFog=!0,this.name="",this.color=new Ve(e),this.near=t,this.far=n}clone(){return new So(this.color,this.near,this.far)}toJSON(){return{type:"Fog",name:this.name,color:this.color.getHex(),near:this.near,far:this.far}}}class hd extends kt{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new ei,this.environmentIntensity=1,this.environmentRotation=new ei,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),this.background=e.background!==null?e.background.clone():null,this.environment=e.environment!==null?e.environment.clone():null,this.fog=e.fog!==null?e.fog.clone():null,this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),this.overrideMaterial=e.overrideMaterial!==null?e.overrideMaterial.clone():null,this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){const t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),t.object.backgroundBlurriness=this.backgroundBlurriness,t.object.backgroundIntensity=this.backgroundIntensity,t.object.backgroundRotation=this.backgroundRotation.toArray(),t.object.environmentIntensity=this.environmentIntensity,t.object.environmentRotation=this.environmentRotation.toArray(),t}}const hn=new O,Pn=new O,Gr=new O,Ln=new O,Mi=new O,Si=new O,xl=new O,Hr=new O,Vr=new O,Wr=new O,Xr=new Et,qr=new Et,Yr=new Et;class fn{constructor(e=new O,t=new O,n=new O){this.a=e,this.b=t,this.c=n}static getNormal(e,t,n,s){s.subVectors(n,t),hn.subVectors(e,t),s.cross(hn);const r=s.lengthSq();return r>0?s.multiplyScalar(1/Math.sqrt(r)):s.set(0,0,0)}static getBarycoord(e,t,n,s,r){hn.subVectors(s,t),Pn.subVectors(n,t),Gr.subVectors(e,t);const a=hn.dot(hn),o=hn.dot(Pn),l=hn.dot(Gr),c=Pn.dot(Pn),u=Pn.dot(Gr),p=a*c-o*o;if(p===0)return r.set(0,0,0),null;const d=1/p,h=(c*l-o*u)*d,f=(a*u-o*l)*d;return r.set(1-h-f,f,h)}static containsPoint(e,t,n,s){return this.getBarycoord(e,t,n,s,Ln)===null?!1:Ln.x>=0&&Ln.y>=0&&Ln.x+Ln.y<=1}static getInterpolation(e,t,n,s,r,a,o,l){return this.getBarycoord(e,t,n,s,Ln)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(r,Ln.x),l.addScaledVector(a,Ln.y),l.addScaledVector(o,Ln.z),l)}static getInterpolatedAttribute(e,t,n,s,r,a){return Xr.setScalar(0),qr.setScalar(0),Yr.setScalar(0),Xr.fromBufferAttribute(e,t),qr.fromBufferAttribute(e,n),Yr.fromBufferAttribute(e,s),a.setScalar(0),a.addScaledVector(Xr,r.x),a.addScaledVector(qr,r.y),a.addScaledVector(Yr,r.z),a}static isFrontFacing(e,t,n,s){return hn.subVectors(n,t),Pn.subVectors(e,t),hn.cross(Pn).dot(s)<0}set(e,t,n){return this.a.copy(e),this.b.copy(t),this.c.copy(n),this}setFromPointsAndIndices(e,t,n,s){return this.a.copy(e[t]),this.b.copy(e[n]),this.c.copy(e[s]),this}setFromAttributeAndIndices(e,t,n,s){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,n),this.c.fromBufferAttribute(e,s),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return hn.subVectors(this.c,this.b),Pn.subVectors(this.a,this.b),hn.cross(Pn).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return fn.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return fn.getBarycoord(e,this.a,this.b,this.c,t)}getInterpolation(e,t,n,s,r){return fn.getInterpolation(e,this.a,this.b,this.c,t,n,s,r)}containsPoint(e){return fn.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return fn.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){const n=this.a,s=this.b,r=this.c;let a,o;Mi.subVectors(s,n),Si.subVectors(r,n),Hr.subVectors(e,n);const l=Mi.dot(Hr),c=Si.dot(Hr);if(l<=0&&c<=0)return t.copy(n);Vr.subVectors(e,s);const u=Mi.dot(Vr),p=Si.dot(Vr);if(u>=0&&p<=u)return t.copy(s);const d=l*p-u*c;if(d<=0&&l>=0&&u<=0&&l-u>0)return a=l/(l-u),t.copy(n).addScaledVector(Mi,a);Wr.subVectors(e,r);const h=Mi.dot(Wr),f=Si.dot(Wr);if(f>=0&&h<=f)return t.copy(r);const _=h*c-l*f;if(_<=0&&c>=0&&f<=0)return o=c/(c-f),t.copy(n).addScaledVector(Si,o);const m=u*f-h*p;if(m<=0&&p-u>=0&&h-f>=0)return xl.subVectors(r,s),o=(p-u)/(p-u+(h-f)),t.copy(s).addScaledVector(xl,o);const g=1/(m+_+d);return a=_*g,o=d*g,t.copy(n).addScaledVector(Mi,a).addScaledVector(Si,o)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}}class ti{constructor(e=new O(1/0,1/0,1/0),t=new O(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t+=3)this.expandByPoint(un.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,n=e.count;t<n;t++)this.expandByPoint(un.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){const n=un.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(n),this.max.copy(e).add(n),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);const n=e.geometry;if(n!==void 0){const r=n.getAttribute("position");if(t===!0&&r!==void 0&&e.isInstancedMesh!==!0&&e.isBatchedMesh!==!0)for(let a=0,o=r.count;a<o;a++)e.isMesh===!0?e.getVertexPosition(a,un):un.fromBufferAttribute(r,a),un.applyMatrix4(e.matrixWorld),this.expandByPoint(un);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),Ls.copy(e.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),Ls.copy(n.boundingBox)),Ls.applyMatrix4(e.matrixWorld),this.union(Ls)}const s=e.children;for(let r=0,a=s.length;r<a;r++)this.expandByObject(s[r],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,un),un.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,n;return e.normal.x>0?(t=e.normal.x*this.min.x,n=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,n=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,n+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,n+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,n+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,n+=e.normal.z*this.min.z),t<=-e.constant&&n>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(Wi),Ds.subVectors(this.max,Wi),yi.subVectors(e.a,Wi),bi.subVectors(e.b,Wi),Ei.subVectors(e.c,Wi),Xn.subVectors(bi,yi),qn.subVectors(Ei,bi),ri.subVectors(yi,Ei);let t=[0,-Xn.z,Xn.y,0,-qn.z,qn.y,0,-ri.z,ri.y,Xn.z,0,-Xn.x,qn.z,0,-qn.x,ri.z,0,-ri.x,-Xn.y,Xn.x,0,-qn.y,qn.x,0,-ri.y,ri.x,0];return!$r(t,yi,bi,Ei,Ds)||(t=[1,0,0,0,1,0,0,0,1],!$r(t,yi,bi,Ei,Ds))?!1:(Ns.crossVectors(Xn,qn),t=[Ns.x,Ns.y,Ns.z],$r(t,yi,bi,Ei,Ds))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,un).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(un).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(Dn[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),Dn[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),Dn[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),Dn[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),Dn[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),Dn[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),Dn[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),Dn[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(Dn),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(e){return this.min.fromArray(e.min),this.max.fromArray(e.max),this}}const Dn=[new O,new O,new O,new O,new O,new O,new O,new O],un=new O,Ls=new ti,yi=new O,bi=new O,Ei=new O,Xn=new O,qn=new O,ri=new O,Wi=new O,Ds=new O,Ns=new O,ai=new O;function $r(i,e,t,n,s){for(let r=0,a=i.length-3;r<=a;r+=3){ai.fromArray(i,r);const o=s.x*Math.abs(ai.x)+s.y*Math.abs(ai.y)+s.z*Math.abs(ai.z),l=e.dot(ai),c=t.dot(ai),u=n.dot(ai);if(Math.max(-Math.max(l,c,u),Math.min(l,c,u))>o)return!1}return!0}const Pt=new O,Is=new Se;let ud=0;class gn extends pi{constructor(e,t,n=!1){if(super(),Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:ud++}),this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=n,this.usage=Lu,this.updateRanges=[],this.gpuType=yn,this.version=0,this._normalizationScale=e!==void 0?vo(e):void 0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this._normalizationScale=e._normalizationScale,this}copyAt(e,t,n){e*=this.itemSize,n*=t.itemSize;for(let s=0,r=this.itemSize;s<r;s++)this.array[e+s]=t.array[n+s];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,n=this.count;t<n;t++)Is.fromBufferAttribute(this,t),Is.applyMatrix3(e),this.setXY(t,Is.x,Is.y);else if(this.itemSize===3)for(let t=0,n=this.count;t<n;t++)Pt.fromBufferAttribute(this,t),Pt.applyMatrix3(e),this.setXYZ(t,Pt.x,Pt.y,Pt.z);return this}applyMatrix4(e){for(let t=0,n=this.count;t<n;t++)Pt.fromBufferAttribute(this,t),Pt.applyMatrix4(e),this.setXYZ(t,Pt.x,Pt.y,Pt.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)Pt.fromBufferAttribute(this,t),Pt.applyNormalMatrix(e),this.setXYZ(t,Pt.x,Pt.y,Pt.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)Pt.fromBufferAttribute(this,t),Pt.transformDirection(e),this.setXYZ(t,Pt.x,Pt.y,Pt.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let n=this.array[e*this.itemSize+t];return this.normalized&&(n=this._denormalize(n)),n}setComponent(e,t,n){return this.normalized&&(n=this._normalize(n)),this.array[e*this.itemSize+t]=n,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=this._denormalize(t)),t}setX(e,t){return this.normalized&&(t=this._normalize(t)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=this._denormalize(t)),t}setY(e,t){return this.normalized&&(t=this._normalize(t)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=this._denormalize(t)),t}setZ(e,t){return this.normalized&&(t=this._normalize(t)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=this._denormalize(t)),t}setW(e,t){return this.normalized&&(t=this._normalize(t)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,n){return e*=this.itemSize,this.normalized&&(t=this._normalize(t),n=this._normalize(n)),this.array[e+0]=t,this.array[e+1]=n,this}setXYZ(e,t,n,s){return e*=this.itemSize,this.normalized&&(t=this._normalize(t),n=this._normalize(n),s=this._normalize(s)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=s,this}setXYZW(e,t,n,s,r){return e*=this.itemSize,this.normalized&&(t=this._normalize(t),n=this._normalize(n),s=this._normalize(s),r=this._normalize(r)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=s,this.array[e+3]=r,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){const e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return e.name=this.name,e.usage=this.usage,e.gpuType=this.gpuType,e}dispose(){this.dispatchEvent({type:"dispose"})}_denormalize(e){const t=this._normalizationScale;return t!==void 0?Math.max(e/t,-1):Xc(e,this.array)}_normalize(e){const t=this._normalizationScale;return t!==void 0?Math.round(e*t):qc(e,this.array)}}class Zc extends gn{constructor(e,t,n){super(new Uint16Array(e),t,n)}}class Jc extends gn{constructor(e,t,n){super(new Uint32Array(e),t,n)}}class Tt extends gn{constructor(e,t,n){super(new Float32Array(e),t,n)}}const dd=new ti,Xi=new O,Kr=new O;class yo{constructor(e=new O,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){const n=this.center;t!==void 0?n.copy(t):dd.setFromPoints(e).getCenter(n);let s=0;for(let r=0,a=e.length;r<a;r++)s=Math.max(s,n.distanceToSquared(e[r]));return this.radius=Math.sqrt(s),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){const t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){const n=this.center.distanceToSquared(e);return t.copy(e),n>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;Xi.subVectors(e,this.center);const t=Xi.lengthSq();if(t>this.radius*this.radius){const n=Math.sqrt(t),s=(n-this.radius)*.5;this.center.addScaledVector(Xi,s/n),this.radius+=s}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(Kr.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(Xi.copy(e.center).add(Kr)),this.expandByPoint(Xi.copy(e.center).sub(Kr))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(e){return this.radius=e.radius,this.center.fromArray(e.center),this}}let fd=0;const rn=new xt,Zr=new kt,wi=new O,tn=new ti,qi=new ti,Ut=new O;class Xt extends pi{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:fd++}),this.uuid=mi(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={},this._transformed=!1}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(Du(e)?Jc:Zc)(e,1):this.index=e,this}setIndirect(e,t=0){return this.indirect=e,this.indirectOffset=t,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,n=0){this.groups.push({start:e,count:t,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){const t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);const n=this.attributes.normal;if(n!==void 0){const r=new Xe().getNormalMatrix(e);n.applyNormalMatrix(r),n.needsUpdate=!0}const s=this.attributes.tangent;return s!==void 0&&(s.transformDirection(e),s.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this._transformed=!0,this}applyQuaternion(e){return rn.makeRotationFromQuaternion(e),this.applyMatrix4(rn),this}rotateX(e){return rn.makeRotationX(e),this.applyMatrix4(rn),this}rotateY(e){return rn.makeRotationY(e),this.applyMatrix4(rn),this}rotateZ(e){return rn.makeRotationZ(e),this.applyMatrix4(rn),this}translate(e,t,n){return rn.makeTranslation(e,t,n),this.applyMatrix4(rn),this}scale(e,t,n){return rn.makeScale(e,t,n),this.applyMatrix4(rn),this}lookAt(e){return Zr.lookAt(e),Zr.updateMatrix(),this.applyMatrix4(Zr.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(wi).negate(),this.translate(wi.x,wi.y,wi.z),this}setFromPoints(e){const t=this.getAttribute("position");if(t===void 0){const n=[];for(let s=0,r=e.length;s<r;s++){const a=e[s];n.push(a.x,a.y,a.z||0)}this.setAttribute("position",new Tt(n,3))}else{const n=Math.min(e.length,t.count);for(let s=0;s<n;s++){const r=e[s];t.setXYZ(s,r.x,r.y,r.z||0)}e.length>t.count&&He("BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new ti);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){lt("BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new O(-1/0,-1/0,-1/0),new O(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let n=0,s=t.length;n<s;n++){const r=t[n];tn.setFromBufferAttribute(r),this.morphTargetsRelative?(Ut.addVectors(this.boundingBox.min,tn.min),this.boundingBox.expandByPoint(Ut),Ut.addVectors(this.boundingBox.max,tn.max),this.boundingBox.expandByPoint(Ut)):(this.boundingBox.expandByPoint(tn.min),this.boundingBox.expandByPoint(tn.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&lt('BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new yo);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){lt("BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new O,1/0);return}if(e){const n=this.boundingSphere.center;if(tn.setFromBufferAttribute(e),t)for(let r=0,a=t.length;r<a;r++){const o=t[r];qi.setFromBufferAttribute(o),this.morphTargetsRelative?(Ut.addVectors(tn.min,qi.min),tn.expandByPoint(Ut),Ut.addVectors(tn.max,qi.max),tn.expandByPoint(Ut)):(tn.expandByPoint(qi.min),tn.expandByPoint(qi.max))}tn.getCenter(n);let s=0;for(let r=0,a=e.count;r<a;r++)Ut.fromBufferAttribute(e,r),s=Math.max(s,n.distanceToSquared(Ut));if(t)for(let r=0,a=t.length;r<a;r++){const o=t[r],l=this.morphTargetsRelative;for(let c=0,u=o.count;c<u;c++)Ut.fromBufferAttribute(o,c),l&&(wi.fromBufferAttribute(e,c),Ut.add(wi)),s=Math.max(s,n.distanceToSquared(Ut))}this.boundingSphere.radius=Math.sqrt(s),isNaN(this.boundingSphere.radius)&&lt('BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){const e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){lt("BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}const n=t.position,s=t.normal,r=t.uv;let a=this.getAttribute("tangent");(a===void 0||a.count!==n.count)&&(a=new gn(new Float32Array(4*n.count),4),this.setAttribute("tangent",a));const o=[],l=[],c=new Uint8Array(n.count);for(let C=0;C<n.count;C++)o[C]=new O,l[C]=new O;const u=new O,p=new O,d=new O,h=new Se,f=new Se,_=new Se,m=new O,g=new O;function x(C,R,P){c[C]=c[R]=c[P]=1,u.fromBufferAttribute(n,C),p.fromBufferAttribute(n,R),d.fromBufferAttribute(n,P),h.fromBufferAttribute(r,C),f.fromBufferAttribute(r,R),_.fromBufferAttribute(r,P),p.sub(u),d.sub(u),f.sub(h),_.sub(h);const F=1/(f.x*_.y-_.x*f.y);isFinite(F)&&(m.copy(p).multiplyScalar(_.y).addScaledVector(d,-f.y).multiplyScalar(F),g.copy(d).multiplyScalar(f.x).addScaledVector(p,-_.x).multiplyScalar(F),o[C].add(m),o[R].add(m),o[P].add(m),l[C].add(g),l[R].add(g),l[P].add(g))}let S=this.groups;S.length===0&&(S=[{start:0,count:e.count}]);for(let C=0,R=S.length;C<R;++C){const P=S[C],F=P.start,z=P.count;for(let L=F,G=F+z;L<G;L+=3)x(e.getX(L+0),e.getX(L+1),e.getX(L+2))}const M=new O,w=new O,T=new O,v=new O;function y(C){T.fromBufferAttribute(s,C),v.copy(T);const R=o[C];M.copy(R),M.sub(T.multiplyScalar(T.dot(R))).normalize(),w.crossVectors(v,R);const F=w.dot(l[C])<0?-1:1;a.setXYZW(C,M.x,M.y,M.z,F)}for(let C=0,R=n.count;C<R;++C)c[C]&&y(C);this._transformed=!0}computeVertexNormals(){const e=this.index,t=this.getAttribute("position");if(t!==void 0){let n=this.getAttribute("normal");if(n===void 0||n.count!==t.count)n=new gn(new Float32Array(t.count*3),3),this.setAttribute("normal",n);else for(let d=0,h=n.count;d<h;d++)n.setXYZ(d,0,0,0);const s=new O,r=new O,a=new O,o=new O,l=new O,c=new O,u=new O,p=new O;if(e)for(let d=0,h=e.count;d<h;d+=3){const f=e.getX(d+0),_=e.getX(d+1),m=e.getX(d+2);s.fromBufferAttribute(t,f),r.fromBufferAttribute(t,_),a.fromBufferAttribute(t,m),u.subVectors(a,r),p.subVectors(s,r),u.cross(p),o.fromBufferAttribute(n,f),l.fromBufferAttribute(n,_),c.fromBufferAttribute(n,m),o.add(u),l.add(u),c.add(u),n.setXYZ(f,o.x,o.y,o.z),n.setXYZ(_,l.x,l.y,l.z),n.setXYZ(m,c.x,c.y,c.z)}else for(let d=0,h=t.count;d<h;d+=3)s.fromBufferAttribute(t,d+0),r.fromBufferAttribute(t,d+1),a.fromBufferAttribute(t,d+2),u.subVectors(a,r),p.subVectors(s,r),u.cross(p),n.setXYZ(d+0,u.x,u.y,u.z),n.setXYZ(d+1,u.x,u.y,u.z),n.setXYZ(d+2,u.x,u.y,u.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){const e=this.attributes.normal;for(let t=0,n=e.count;t<n;t++)Ut.fromBufferAttribute(e,t),Ut.normalize(),e.setXYZ(t,Ut.x,Ut.y,Ut.z)}toNonIndexed(){function e(o,l){const c=o.array,u=o.itemSize,p=o.normalized,d=new c.constructor(l.length*u);let h=0,f=0;for(let _=0,m=l.length;_<m;_++){o.isInterleavedBufferAttribute?h=l[_]*o.data.stride+o.offset:h=l[_]*u;for(let g=0;g<u;g++)d[f++]=c[h++]}return new gn(d,u,p)}if(this.index===null)return He("BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;const t=new Xt,n=this.index.array,s=this.attributes;for(const o in s){const l=s[o],c=e(l,n);t.setAttribute(o,c)}const r=this.morphAttributes;for(const o in r){const l=[],c=r[o];for(let u=0,p=c.length;u<p;u++){const d=c[u],h=e(d,n);l.push(h)}t.morphAttributes[o]=l}t.morphTargetsRelative=this.morphTargetsRelative;const a=this.groups;for(let o=0,l=a.length;o<l;o++){const c=a[o];t.addGroup(c.start,c.count,c.materialIndex)}return t}toJSON(){const e={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.parameters!==void 0&&this._transformed===!0?"BufferGeometry":this.type,e.name=this.name,Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0&&this._transformed!==!0){const l=this.parameters;for(const c in l)l[c]!==void 0&&(e[c]=l[c]);return e}e.data={attributes:{}};const t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});const n=this.attributes;for(const l in n){const c=n[l];e.data.attributes[l]=c.toJSON(e.data)}const s={};let r=!1;for(const l in this.morphAttributes){const c=this.morphAttributes[l],u=[];for(let p=0,d=c.length;p<d;p++){const h=c[p];u.push(h.toJSON(e.data))}u.length>0&&(s[l]=u,r=!0)}r&&(e.data.morphAttributes=s,e.data.morphTargetsRelative=this.morphTargetsRelative);const a=this.groups;a.length>0&&(e.data.groups=JSON.parse(JSON.stringify(a)));const o=this.boundingSphere;return o!==null&&(e.data.boundingSphere=o.toJSON()),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;const t={};this.name=e.name;const n=e.index;n!==null&&this.setIndex(n.clone());const s=e.attributes;for(const c in s){const u=s[c];this.setAttribute(c,u.clone(t))}const r=e.morphAttributes;for(const c in r){const u=[],p=r[c];for(let d=0,h=p.length;d<h;d++)u.push(p[d].clone(t));this.morphAttributes[c]=u}this.morphTargetsRelative=e.morphTargetsRelative;const a=e.groups;for(let c=0,u=a.length;c<u;c++){const p=a[c];this.addGroup(p.start,p.count,p.materialIndex)}const o=e.boundingBox;o!==null&&(this.boundingBox=o.clone());const l=e.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this._transformed=e._transformed,this}dispose(){this.dispatchEvent({type:"dispose"})}}const Jr=new O,pd=new O,md=new Xe;class $n{constructor(e=new O(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,n,s){return this.normal.set(e,t,n),this.constant=s,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,n){const s=Jr.subVectors(n,t).cross(pd.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(s,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){const e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t,n=!0){const s=e.delta(Jr),r=this.normal.dot(s);if(r===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;const a=-(e.start.dot(this.normal)+this.constant)/r;return n===!0&&(a<0||a>1)?null:t.copy(e.start).addScaledVector(s,a)}intersectsLine(e){const t=this.distanceToPoint(e.start),n=this.distanceToPoint(e.end);return t<0&&n>0||n<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){const n=t||md.getNormalMatrix(e),s=this.coplanarPoint(Jr).applyMatrix4(e),r=this.normal.applyMatrix3(n).normalize();return this.constant=-s.dot(r),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}toJSON(){return{normal:this.normal.toArray(),constant:this.constant}}fromJSON(e){return this.normal.fromArray(e.normal),this.constant=e.constant,this}}let gd=0;class Ss extends pi{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:gd++}),this.uuid=mi(),this.name="",this.type="Material",this.blending=ns,this.side=hi,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=bc,this.blendDst=Ec,this.blendEquation=Ri,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new Ve(0,0,0),this.blendAlpha=0,this.depthFunc=cs,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=wu,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=Nr,this.stencilZFail=Nr,this.stencilZPass=Nr,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(const t in e){const n=e[t];if(n===void 0){He(`Material: parameter '${t}' has value of undefined.`);continue}const s=this[t];if(s===void 0){He(`Material: '${t}' is not a property of THREE.${this.type}.`);continue}s&&s.isColor?s.set(n):s&&s.isVector2&&n&&n.isVector2||s&&s.isEuler&&n&&n.isEuler||s&&s.isVector3&&n&&n.isVector3?s.copy(n):this[t]=n}}toJSON(e){const t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});const n={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,n.blending=this.blending,n.side=this.side,n.shadowSide=this.shadowSide,n.vertexColors=this.vertexColors,n.opacity=this.opacity,n.transparent=this.transparent,n.blendSrc=this.blendSrc,n.blendDst=this.blendDst,n.blendEquation=this.blendEquation,n.blendSrcAlpha=this.blendSrcAlpha,n.blendDstAlpha=this.blendDstAlpha,n.blendEquationAlpha=this.blendEquationAlpha,n.blendColor=this.blendColor.getHex(),n.blendAlpha=this.blendAlpha,n.depthFunc=this.depthFunc,n.depthTest=this.depthTest,n.depthWrite=this.depthWrite,n.colorWrite=this.colorWrite,n.clipIntersection=this.clipIntersection,n.clipShadows=this.clipShadows,n.stencilWriteMask=this.stencilWriteMask,n.stencilFunc=this.stencilFunc,n.stencilRef=this.stencilRef,n.stencilFuncMask=this.stencilFuncMask,n.stencilFail=this.stencilFail,n.stencilZFail=this.stencilZFail,n.stencilZPass=this.stencilZPass,n.stencilWrite=this.stencilWrite,n.polygonOffset=this.polygonOffset,n.polygonOffsetFactor=this.polygonOffsetFactor,n.polygonOffsetUnits=this.polygonOffsetUnits,n.dithering=this.dithering,n.alphaTest=this.alphaTest,n.alphaHash=this.alphaHash,n.alphaToCoverage=this.alphaToCoverage,n.premultipliedAlpha=this.premultipliedAlpha,n.forceSinglePass=this.forceSinglePass,n.allowOverride=this.allowOverride,n.visible=this.visible,n.toneMapped=this.toneMapped,n.name=this.name,this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.diffuseRoughness!==void 0&&(n.diffuseRoughness=this.diffuseRoughness),this.diffuseRoughnessMap&&this.diffuseRoughnessMap.isTexture&&(n.diffuseRoughnessMap=this.diffuseRoughnessMap.toJSON(e).uuid),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(n.sheenColorMap=this.sheenColorMap.toJSON(e).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(n.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(e).uuid),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.retroreflectivity!==void 0&&(n.retroreflectivity=this.retroreflectivity),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessMinimum!==void 0&&(n.iridescenceThicknessMinimum=this.iridescenceThicknessMinimum),this.iridescenceThicknessMaximum!==void 0&&(n.iridescenceThicknessMaximum=this.iridescenceThicknessMaximum),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(e).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(e).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(e).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(e).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(e).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),Array.isArray(this.clippingPlanes)&&this.clippingPlanes.length>0&&(n.clippingPlanes=this.clippingPlanes.map(r=>r.toJSON())),this.rotation!==void 0&&(n.rotation=this.rotation),this.depthPacking!==void 0&&(n.depthPacking=this.depthPacking),this.linewidth!==void 0&&(n.linewidth=this.linewidth),this.linecap!==void 0&&(n.linecap=this.linecap),this.linejoin!==void 0&&(n.linejoin=this.linejoin),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.wireframe!==void 0&&(n.wireframe=this.wireframe),this.wireframeLinewidth!==void 0&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!==void 0&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!==void 0&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading!==void 0&&(n.flatShading=this.flatShading),this.fog!==void 0&&(n.fog=this.fog),Object.keys(this.userData).length>0&&(n.userData=this.userData);function s(r){const a=[];for(const o in r){const l=r[o];delete l.metadata,a.push(l)}return a}if(t){const r=s(e.textures),a=s(e.images);r.length>0&&(n.textures=r),a.length>0&&(n.images=a)}return n}fromJSON(e,t){if(e.uuid!==void 0&&(this.uuid=e.uuid),e.name!==void 0&&(this.name=e.name),e.color!==void 0&&this.color!==void 0&&this.color.setHex(e.color),e.roughness!==void 0&&(this.roughness=e.roughness),e.metalness!==void 0&&(this.metalness=e.metalness),e.sheen!==void 0&&(this.sheen=e.sheen),e.sheenColor!==void 0&&(this.sheenColor=new Ve().setHex(e.sheenColor)),e.sheenRoughness!==void 0&&(this.sheenRoughness=e.sheenRoughness),e.emissive!==void 0&&this.emissive!==void 0&&this.emissive.setHex(e.emissive),e.specular!==void 0&&this.specular!==void 0&&this.specular.setHex(e.specular),e.specularIntensity!==void 0&&(this.specularIntensity=e.specularIntensity),e.specularColor!==void 0&&this.specularColor!==void 0&&this.specularColor.setHex(e.specularColor),e.shininess!==void 0&&(this.shininess=e.shininess),e.clearcoat!==void 0&&(this.clearcoat=e.clearcoat),e.clearcoatRoughness!==void 0&&(this.clearcoatRoughness=e.clearcoatRoughness),e.diffuseRoughness!==void 0&&(this.diffuseRoughness=e.diffuseRoughness),e.dispersion!==void 0&&(this.dispersion=e.dispersion),e.retroreflectivity!==void 0&&(this.retroreflectivity=e.retroreflectivity),e.iridescence!==void 0&&(this.iridescence=e.iridescence),e.iridescenceIOR!==void 0&&(this.iridescenceIOR=e.iridescenceIOR),e.iridescenceThicknessMinimum!==void 0&&(this.iridescenceThicknessMinimum=e.iridescenceThicknessMinimum),e.iridescenceThicknessMaximum!==void 0&&(this.iridescenceThicknessMaximum=e.iridescenceThicknessMaximum),e.iridescenceThicknessRange!==void 0&&(this.iridescenceThicknessMinimum=e.iridescenceThicknessRange[0],this.iridescenceThicknessMaximum=e.iridescenceThicknessRange[1]),e.transmission!==void 0&&(this.transmission=e.transmission),e.thickness!==void 0&&(this.thickness=e.thickness),e.attenuationDistance!==void 0&&(this.attenuationDistance=e.attenuationDistance),e.attenuationColor!==void 0&&this.attenuationColor!==void 0&&this.attenuationColor.setHex(e.attenuationColor),e.anisotropy!==void 0&&(this.anisotropy=e.anisotropy),e.anisotropyRotation!==void 0&&(this.anisotropyRotation=e.anisotropyRotation),e.fog!==void 0&&(this.fog=e.fog),e.flatShading!==void 0&&(this.flatShading=e.flatShading),e.blending!==void 0&&(this.blending=e.blending),e.combine!==void 0&&(this.combine=e.combine),e.side!==void 0&&(this.side=e.side),e.shadowSide!==void 0&&(this.shadowSide=e.shadowSide),e.opacity!==void 0&&(this.opacity=e.opacity),e.transparent!==void 0&&(this.transparent=e.transparent),e.alphaTest!==void 0&&(this.alphaTest=e.alphaTest),e.alphaHash!==void 0&&(this.alphaHash=e.alphaHash),e.depthFunc!==void 0&&(this.depthFunc=e.depthFunc),e.depthTest!==void 0&&(this.depthTest=e.depthTest),e.depthWrite!==void 0&&(this.depthWrite=e.depthWrite),e.colorWrite!==void 0&&(this.colorWrite=e.colorWrite),e.clippingPlanes!==void 0&&(this.clippingPlanes=e.clippingPlanes.map(n=>new $n().fromJSON(n))),e.clipIntersection!==void 0&&(this.clipIntersection=e.clipIntersection),e.clipShadows!==void 0&&(this.clipShadows=e.clipShadows),e.depthPacking!==void 0&&(this.depthPacking=e.depthPacking),e.blendSrc!==void 0&&(this.blendSrc=e.blendSrc),e.blendDst!==void 0&&(this.blendDst=e.blendDst),e.blendEquation!==void 0&&(this.blendEquation=e.blendEquation),e.blendSrcAlpha!==void 0&&(this.blendSrcAlpha=e.blendSrcAlpha),e.blendDstAlpha!==void 0&&(this.blendDstAlpha=e.blendDstAlpha),e.blendEquationAlpha!==void 0&&(this.blendEquationAlpha=e.blendEquationAlpha),e.blendColor!==void 0&&this.blendColor!==void 0&&this.blendColor.setHex(e.blendColor),e.blendAlpha!==void 0&&(this.blendAlpha=e.blendAlpha),e.stencilWriteMask!==void 0&&(this.stencilWriteMask=e.stencilWriteMask),e.stencilFunc!==void 0&&(this.stencilFunc=e.stencilFunc),e.stencilRef!==void 0&&(this.stencilRef=e.stencilRef),e.stencilFuncMask!==void 0&&(this.stencilFuncMask=e.stencilFuncMask),e.stencilFail!==void 0&&(this.stencilFail=e.stencilFail),e.stencilZFail!==void 0&&(this.stencilZFail=e.stencilZFail),e.stencilZPass!==void 0&&(this.stencilZPass=e.stencilZPass),e.stencilWrite!==void 0&&(this.stencilWrite=e.stencilWrite),e.wireframe!==void 0&&(this.wireframe=e.wireframe),e.wireframeLinewidth!==void 0&&(this.wireframeLinewidth=e.wireframeLinewidth),e.wireframeLinecap!==void 0&&(this.wireframeLinecap=e.wireframeLinecap),e.wireframeLinejoin!==void 0&&(this.wireframeLinejoin=e.wireframeLinejoin),e.rotation!==void 0&&(this.rotation=e.rotation),e.linewidth!==void 0&&(this.linewidth=e.linewidth),e.linecap!==void 0&&(this.linecap=e.linecap),e.linejoin!==void 0&&(this.linejoin=e.linejoin),e.dashSize!==void 0&&(this.dashSize=e.dashSize),e.gapSize!==void 0&&(this.gapSize=e.gapSize),e.scale!==void 0&&(this.scale=e.scale),e.polygonOffset!==void 0&&(this.polygonOffset=e.polygonOffset),e.polygonOffsetFactor!==void 0&&(this.polygonOffsetFactor=e.polygonOffsetFactor),e.polygonOffsetUnits!==void 0&&(this.polygonOffsetUnits=e.polygonOffsetUnits),e.dithering!==void 0&&(this.dithering=e.dithering),e.alphaToCoverage!==void 0&&(this.alphaToCoverage=e.alphaToCoverage),e.premultipliedAlpha!==void 0&&(this.premultipliedAlpha=e.premultipliedAlpha),e.forceSinglePass!==void 0&&(this.forceSinglePass=e.forceSinglePass),e.allowOverride!==void 0&&(this.allowOverride=e.allowOverride),e.visible!==void 0&&(this.visible=e.visible),e.toneMapped!==void 0&&(this.toneMapped=e.toneMapped),e.userData!==void 0&&(this.userData=e.userData),e.vertexColors!==void 0&&(typeof e.vertexColors=="number"?this.vertexColors=e.vertexColors>0:this.vertexColors=e.vertexColors),e.size!==void 0&&(this.size=e.size),e.sizeAttenuation!==void 0&&(this.sizeAttenuation=e.sizeAttenuation),e.map!==void 0&&(this.map=t[e.map]||null),e.matcap!==void 0&&(this.matcap=t[e.matcap]||null),e.alphaMap!==void 0&&(this.alphaMap=t[e.alphaMap]||null),e.bumpMap!==void 0&&(this.bumpMap=t[e.bumpMap]||null),e.bumpScale!==void 0&&(this.bumpScale=e.bumpScale),e.normalMap!==void 0&&(this.normalMap=t[e.normalMap]||null),e.normalMapType!==void 0&&(this.normalMapType=e.normalMapType),e.normalScale!==void 0){let n=e.normalScale;Array.isArray(n)===!1&&(n=[n,n]),this.normalScale=new Se().fromArray(n)}return e.displacementMap!==void 0&&(this.displacementMap=t[e.displacementMap]||null),e.displacementScale!==void 0&&(this.displacementScale=e.displacementScale),e.displacementBias!==void 0&&(this.displacementBias=e.displacementBias),e.roughnessMap!==void 0&&(this.roughnessMap=t[e.roughnessMap]||null),e.metalnessMap!==void 0&&(this.metalnessMap=t[e.metalnessMap]||null),e.emissiveMap!==void 0&&(this.emissiveMap=t[e.emissiveMap]||null),e.emissiveIntensity!==void 0&&(this.emissiveIntensity=e.emissiveIntensity),e.specularMap!==void 0&&(this.specularMap=t[e.specularMap]||null),e.specularIntensityMap!==void 0&&(this.specularIntensityMap=t[e.specularIntensityMap]||null),e.specularColorMap!==void 0&&(this.specularColorMap=t[e.specularColorMap]||null),e.envMap!==void 0&&(this.envMap=t[e.envMap]||null),e.envMapRotation!==void 0&&this.envMapRotation.fromArray(e.envMapRotation),e.envMapIntensity!==void 0&&(this.envMapIntensity=e.envMapIntensity),e.reflectivity!==void 0&&(this.reflectivity=e.reflectivity),e.refractionRatio!==void 0&&(this.refractionRatio=e.refractionRatio),e.lightMap!==void 0&&(this.lightMap=t[e.lightMap]||null),e.lightMapIntensity!==void 0&&(this.lightMapIntensity=e.lightMapIntensity),e.aoMap!==void 0&&(this.aoMap=t[e.aoMap]||null),e.aoMapIntensity!==void 0&&(this.aoMapIntensity=e.aoMapIntensity),e.gradientMap!==void 0&&(this.gradientMap=t[e.gradientMap]||null),e.clearcoatMap!==void 0&&(this.clearcoatMap=t[e.clearcoatMap]||null),e.clearcoatRoughnessMap!==void 0&&(this.clearcoatRoughnessMap=t[e.clearcoatRoughnessMap]||null),e.clearcoatNormalMap!==void 0&&(this.clearcoatNormalMap=t[e.clearcoatNormalMap]||null),e.clearcoatNormalScale!==void 0&&(this.clearcoatNormalScale=new Se().fromArray(e.clearcoatNormalScale)),e.diffuseRoughnessMap!==void 0&&(this.diffuseRoughnessMap=t[e.diffuseRoughnessMap]||null),e.iridescenceMap!==void 0&&(this.iridescenceMap=t[e.iridescenceMap]||null),e.iridescenceThicknessMap!==void 0&&(this.iridescenceThicknessMap=t[e.iridescenceThicknessMap]||null),e.transmissionMap!==void 0&&(this.transmissionMap=t[e.transmissionMap]||null),e.thicknessMap!==void 0&&(this.thicknessMap=t[e.thicknessMap]||null),e.anisotropyMap!==void 0&&(this.anisotropyMap=t[e.anisotropyMap]||null),e.sheenColorMap!==void 0&&(this.sheenColorMap=t[e.sheenColorMap]||null),e.sheenRoughnessMap!==void 0&&(this.sheenRoughnessMap=t[e.sheenRoughnessMap]||null),this}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;const t=e.clippingPlanes;let n=null;if(t!==null){const s=t.length;n=new Array(s);for(let r=0;r!==s;++r)n[r]=t[r].clone()}return this.clippingPlanes=n,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.allowOverride=e.allowOverride,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}}const Nn=new O,Qr=new O,Us=new O,Fs=new O;class _d{constructor(e=new O,t=new O(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,Nn)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);const n=t.dot(this.direction);return n<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){const t=Nn.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(Nn.copy(this.origin).addScaledVector(this.direction,t),Nn.distanceToSquared(e))}distanceSqToSegment(e,t,n,s){Qr.copy(e).add(t).multiplyScalar(.5),Us.copy(t).sub(e).normalize(),Fs.copy(this.origin).sub(Qr);const r=e.distanceTo(t)*.5,a=-this.direction.dot(Us),o=Fs.dot(this.direction),l=-Fs.dot(Us),c=Fs.lengthSq(),u=Math.abs(1-a*a);let p,d,h,f;if(u>0)if(p=a*l-o,d=a*o-l,f=r*u,p>=0)if(d>=-f)if(d<=f){const _=1/u;p*=_,d*=_,h=p*(p+a*d+2*o)+d*(a*p+d+2*l)+c}else d=r,p=Math.max(0,-(a*d+o)),h=-p*p+d*(d+2*l)+c;else d=-r,p=Math.max(0,-(a*d+o)),h=-p*p+d*(d+2*l)+c;else d<=-f?(p=Math.max(0,-(-a*r+o)),d=p>0?-r:Math.min(Math.max(-r,-l),r),h=-p*p+d*(d+2*l)+c):d<=f?(p=0,d=Math.min(Math.max(-r,-l),r),h=d*(d+2*l)+c):(p=Math.max(0,-(a*r+o)),d=p>0?r:Math.min(Math.max(-r,-l),r),h=-p*p+d*(d+2*l)+c);else d=a>0?-r:r,p=Math.max(0,-(a*d+o)),h=-p*p+d*(d+2*l)+c;return n&&n.copy(this.origin).addScaledVector(this.direction,p),s&&s.copy(Qr).addScaledVector(Us,d),h}intersectSphere(e,t){if(e.radius<0)return null;Nn.subVectors(e.center,this.origin);const n=Nn.dot(this.direction),s=Nn.dot(Nn)-n*n,r=e.radius*e.radius;if(s>r)return null;const a=Math.sqrt(r-s),o=n-a,l=n+a;return l<0?null:o<0?this.at(l,t):this.at(o,t)}intersectsSphere(e){return e.radius<0?!1:this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){const t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;const n=-(this.origin.dot(e.normal)+e.constant)/t;return n>=0?n:null}intersectPlane(e,t){const n=this.distanceToPlane(e);return n===null?null:this.at(n,t)}intersectsPlane(e){const t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let n,s,r,a,o,l;const c=1/this.direction.x,u=1/this.direction.y,p=1/this.direction.z,d=this.origin;return c>=0?(n=(e.min.x-d.x)*c,s=(e.max.x-d.x)*c):(n=(e.max.x-d.x)*c,s=(e.min.x-d.x)*c),u>=0?(r=(e.min.y-d.y)*u,a=(e.max.y-d.y)*u):(r=(e.max.y-d.y)*u,a=(e.min.y-d.y)*u),n>a||r>s||((r>n||isNaN(n))&&(n=r),(a<s||isNaN(s))&&(s=a),p>=0?(o=(e.min.z-d.z)*p,l=(e.max.z-d.z)*p):(o=(e.max.z-d.z)*p,l=(e.min.z-d.z)*p),n>l||o>s)||((o>n||n!==n)&&(n=o),(l<s||s!==s)&&(s=l),s<0)?null:this.at(n>=0?n:s,t)}intersectsBox(e){return this.intersectBox(e,Nn)!==null}intersectTriangle(e,t,n,s,r){const a=this.origin,o=this.direction,l=o.x,c=o.y,u=o.z,p=e.x-a.x,d=e.y-a.y,h=e.z-a.z,f=t.x-a.x,_=t.y-a.y,m=t.z-a.z,g=n.x-a.x,x=n.y-a.y,S=n.z-a.z,M=Math.abs(l),w=Math.abs(c),T=Math.abs(u);let v,y,C,R,P,F,z,L,G,X,B,ne;if(M>=w&&M>=T?(C=l,F=p,G=f,ne=g,l>=0?(v=c,y=u,R=d,P=h,z=_,L=m,X=x,B=S):(v=u,y=c,R=h,P=d,z=m,L=_,X=S,B=x)):w>=T?(C=c,F=d,G=_,ne=x,c>=0?(v=u,y=l,R=h,P=p,z=m,L=f,X=S,B=g):(v=l,y=u,R=p,P=h,z=f,L=m,X=g,B=S)):(C=u,F=h,G=m,ne=S,u>=0?(v=l,y=c,R=p,P=d,z=f,L=_,X=g,B=x):(v=c,y=l,R=d,P=p,z=_,L=f,X=x,B=g)),C===0)return null;const q=v/C,ee=y/C,se=1/C,Te=R-q*F,Fe=P-ee*F,K=z-q*G,ge=L-ee*G,Ae=X-q*ne,Ue=B-ee*ne,Me=Ae*ge-Ue*K,Oe=Te*Ue-Fe*Ae,pt=K*Fe-ge*Te;if(s){if(Me<0||Oe<0||pt<0)return null}else if((Me<0||Oe<0||pt<0)&&(Me>0||Oe>0||pt>0))return null;const ze=Me+Oe+pt;if(ze===0)return null;const Ye=se*(Me*F+Oe*G+pt*ne);return(ze>0?Ye<0:Ye>0)?null:this.at(Ye/ze,r)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}}class vd extends Ss{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new Ve(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new ei,this.combine=wc,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}}const Ml=new xt,oi=new _d,Os=new yo,Sl=new O,Bs=new O,ks=new O,zs=new O,jr=new O,Gs=new O,yl=new O,Hs=new O;class zt extends kt{constructor(e=new Xt,t=new vd){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0?this.morphTargetInfluences=e.morphTargetInfluences.slice():this.morphTargetInfluences=void 0,e.morphTargetDictionary!==void 0?this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary):this.morphTargetDictionary=void 0,this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){const t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){const s=t[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=s.length;r<a;r++){const o=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}getVertexPosition(e,t){const n=this.geometry,s=n.attributes.position,r=n.morphAttributes.position,a=n.morphTargetsRelative;t.fromBufferAttribute(s,e);const o=this.morphTargetInfluences;if(r&&o){Gs.set(0,0,0);for(let l=0,c=r.length;l<c;l++){const u=o[l],p=r[l];u!==0&&(jr.fromBufferAttribute(p,e),a?Gs.addScaledVector(jr,u):Gs.addScaledVector(jr.sub(t),u))}t.add(Gs)}return t}intersectsFrustum(e){return e.intersectsObject(this)}raycast(e,t){const n=this.geometry,s=this.material,r=this.matrixWorld;s!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),Os.copy(n.boundingSphere),Os.applyMatrix4(r),oi.copy(e.ray).recast(e.near),!(Os.containsPoint(oi.origin)===!1&&(oi.intersectSphere(Os,Sl)===null||oi.origin.distanceToSquared(Sl)>(e.far-e.near)**2))&&(Ml.copy(r).invert(),oi.copy(e.ray).applyMatrix4(Ml),!(n.boundingBox!==null&&oi.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(e,t,oi)))}_computeIntersections(e,t,n){let s;const r=this.geometry,a=this.material,o=r.index,l=r.attributes.position,c=r.attributes.uv,u=r.attributes.uv1,p=r.attributes.normal,d=r.groups,h=r.drawRange;if(o!==null)if(Array.isArray(a))for(let f=0,_=d.length;f<_;f++){const m=d[f],g=a[m.materialIndex],x=Math.max(m.start,h.start),S=Math.min(o.count,Math.min(m.start+m.count,h.start+h.count));for(let M=x,w=S;M<w;M+=3){const T=o.getX(M),v=o.getX(M+1),y=o.getX(M+2);s=Vs(this,g,e,n,c,u,p,T,v,y),s&&(s.faceIndex=Math.floor(M/3),s.face.materialIndex=m.materialIndex,t.push(s))}}else{const f=Math.max(0,h.start),_=Math.min(o.count,h.start+h.count);for(let m=f,g=_;m<g;m+=3){const x=o.getX(m),S=o.getX(m+1),M=o.getX(m+2);s=Vs(this,a,e,n,c,u,p,x,S,M),s&&(s.faceIndex=Math.floor(m/3),t.push(s))}}else if(l!==void 0)if(Array.isArray(a))for(let f=0,_=d.length;f<_;f++){const m=d[f],g=a[m.materialIndex],x=Math.max(m.start,h.start),S=Math.min(l.count,Math.min(m.start+m.count,h.start+h.count));for(let M=x,w=S;M<w;M+=3){const T=M,v=M+1,y=M+2;s=Vs(this,g,e,n,c,u,p,T,v,y),s&&(s.faceIndex=Math.floor(M/3),s.face.materialIndex=m.materialIndex,t.push(s))}}else{const f=Math.max(0,h.start),_=Math.min(l.count,h.start+h.count);for(let m=f,g=_;m<g;m+=3){const x=m,S=m+1,M=m+2;s=Vs(this,a,e,n,c,u,p,x,S,M),s&&(s.faceIndex=Math.floor(m/3),t.push(s))}}}}function xd(i,e,t,n,s,r,a,o){let l;if(e.side===Qt?l=n.intersectTriangle(a,r,s,!0,o):l=n.intersectTriangle(s,r,a,e.side===hi,o),l===null)return null;Hs.copy(o),Hs.applyMatrix4(i.matrixWorld);const c=t.ray.origin.distanceTo(Hs);return c<t.near||c>t.far?null:{distance:c,point:Hs.clone(),object:i}}function Vs(i,e,t,n,s,r,a,o,l,c){i.getVertexPosition(o,Bs),i.getVertexPosition(l,ks),i.getVertexPosition(c,zs);const u=xd(i,e,t,n,Bs,ks,zs,yl);if(u){const p=new O;fn.getBarycoord(yl,Bs,ks,zs,p),s&&(u.uv=fn.getInterpolatedAttribute(s,o,l,c,p,new Se)),r&&(u.uv1=fn.getInterpolatedAttribute(r,o,l,c,p,new Se)),a&&(u.normal=fn.getInterpolatedAttribute(a,o,l,c,p,new O),u.normal.dot(n.direction)>0&&u.normal.multiplyScalar(-1));const d={a:o,b:l,c,normal:new O,materialIndex:0};fn.getNormal(Bs,ks,zs,d.normal),u.face=d,u.barycoord=p}return u}class Md extends Zt{constructor(e=null,t=1,n=1,s,r,a,o,l,c=Bt,u=Bt,p,d){super(null,a,o,l,c,u,s,r,p,d),this.isDataTexture=!0,this.image={data:e,width:t,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}const li=new yo,Sd=new Se(.5,.5),Ws=new O;class ps{constructor(e=new $n,t=new $n,n=new $n,s=new $n,r=new $n,a=new $n){this.planes=[e,t,n,s,r,a]}set(e,t,n,s,r,a){const o=this.planes;return o[0].copy(e),o[1].copy(t),o[2].copy(n),o[3].copy(s),o[4].copy(r),o[5].copy(a),this}copy(e){const t=this.planes;for(let n=0;n<6;n++)t[n].copy(e.planes[n]);return this}setFromProjectionMatrix(e,t=mn,n=!1){const s=this.planes,r=e.elements,a=r[0],o=r[1],l=r[2],c=r[3],u=r[4],p=r[5],d=r[6],h=r[7],f=r[8],_=r[9],m=r[10],g=r[11],x=r[12],S=r[13],M=r[14],w=r[15];if(s[0].setComponents(c-a,h-u,g-f,w-x).normalize(),s[1].setComponents(c+a,h+u,g+f,w+x).normalize(),s[2].setComponents(c+o,h+p,g+_,w+S).normalize(),s[3].setComponents(c-o,h-p,g-_,w-S).normalize(),n)s[4].setComponents(l,d,m,M).normalize(),s[5].setComponents(c-l,h-d,g-m,w-M).normalize();else if(s[4].setComponents(c-l,h-d,g-m,w-M).normalize(),t===mn)s[5].setComponents(c+l,h+d,g+m,w+M).normalize();else if(t===ds)s[5].setComponents(l,d,m,M).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),li.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{const t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),li.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(li)}intersectsSprite(e){li.center.set(0,0,0);const t=Sd.distanceTo(e.center);return li.radius=.7071067811865476+t,li.applyMatrix4(e.matrixWorld),this.intersectsSphere(li)}intersectsSphere(e){const t=this.planes,n=e.center,s=-e.radius;for(let r=0;r<6;r++)if(t[r].distanceToPoint(n)<s)return!1;return!0}intersectsBox(e){const t=this.planes;for(let n=0;n<6;n++){const s=t[n];if(Ws.x=s.normal.x>0?e.max.x:e.min.x,Ws.y=s.normal.y>0?e.max.y:e.min.y,Ws.z=s.normal.z>0?e.max.z:e.min.z,s.distanceToPoint(Ws)<0)return!1}return!0}containsPoint(e){const t=this.planes;for(let n=0;n<6;n++)if(t[n].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}}const bl=new xt;class bo{constructor(){this.coordinateSystem=mn,this._frustums=[],this._count=0}setFromArrayCamera(e){const t=e.cameras,n=this._frustums;for(let s=0;s<t.length;s++){const r=t[s];bl.multiplyMatrices(r.projectionMatrix,r.matrixWorldInverse),n[s]===void 0&&(n[s]=new ps),n[s].setFromProjectionMatrix(bl,r.coordinateSystem,r.reversedDepth)}return this._count=t.length,this}getFrustum(e){return this._frustums[e]}intersectsObject(e){const t=this._frustums;for(let n=0;n<this._count;n++)if(t[n].intersectsObject(e))return!0;return!1}intersectsSprite(e){const t=this._frustums;for(let n=0;n<this._count;n++)if(t[n].intersectsSprite(e))return!0;return!1}intersectsSphere(e){const t=this._frustums;for(let n=0;n<this._count;n++)if(t[n].intersectsSphere(e))return!0;return!1}intersectsBox(e){const t=this._frustums;for(let n=0;n<this._count;n++)if(t[n].intersectsBox(e))return!0;return!1}containsPoint(e){const t=this._frustums;for(let n=0;n<this._count;n++)if(t[n].containsPoint(e))return!0;return!1}copy(e){this.coordinateSystem=e.coordinateSystem;const t=this._frustums,n=e._frustums;for(let s=0;s<e._count;s++)t[s]===void 0&&(t[s]=new ps),t[s].copy(n[s]);return this._count=e._count,this}clone(){return new bo().copy(this)}}class Qc extends Zt{constructor(e=[],t=Ii,n,s,r,a,o,l,c,u){super(e,t,n,s,r,a,o,l,c,u),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}}class Fi extends Zt{constructor(e,t,n=wn,s,r,a,o=Bt,l=Bt,c,u=jn,p=1){if(u!==jn&&u!==Jn)throw new Error("THREE.DepthTexture: format must be either THREE.DepthFormat or THREE.DepthStencilFormat");const d={width:e,height:t,depth:p};super(d,s,r,a,o,l,u,n,c),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.source=new Mo(Object.assign({},e.image)),this.compareFunction=e.compareFunction,this}toJSON(e){const t=super.toJSON(e);return t.compareFunction=this.compareFunction,t}}class jc extends Fi{constructor(e,t=wn,n=Ii,s,r,a=Bt,o=Bt,l,c=jn){const u={width:e,height:e,depth:1},p=[u,u,u,u,u,u];super(e,e,t,n,s,r,a,o,l,c),this.image=p,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(e){this.image=e}}class eh extends Zt{constructor(e=null){super(),this.sourceTexture=e,this.isExternalTexture=!0}copy(e){return super.copy(e),this.sourceTexture=e.sourceTexture,this}}class kn extends Xt{constructor(e=1,t=1,n=1,s=1,r=1,a=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:n,widthSegments:s,heightSegments:r,depthSegments:a};const o=this;s=Math.floor(s),r=Math.floor(r),a=Math.floor(a);const l=[],c=[],u=[],p=[];let d=0,h=0;f("z","y","x",-1,-1,n,t,e,a,r,0),f("z","y","x",1,-1,n,t,-e,a,r,1),f("x","z","y",1,1,e,n,t,s,a,2),f("x","z","y",1,-1,e,n,-t,s,a,3),f("x","y","z",1,-1,e,t,n,s,r,4),f("x","y","z",-1,-1,e,t,-n,s,r,5),this.setIndex(l),this.setAttribute("position",new Tt(c,3)),this.setAttribute("normal",new Tt(u,3)),this.setAttribute("uv",new Tt(p,2));function f(_,m,g,x,S,M,w,T,v,y,C){const R=M/v,P=w/y,F=M/2,z=w/2,L=T/2,G=v+1,X=y+1;let B=0,ne=0;const q=new O;for(let ee=0;ee<X;ee++){const se=ee*P-z;for(let Te=0;Te<G;Te++){const Fe=Te*R-F;q[_]=Fe*x,q[m]=se*S,q[g]=L,c.push(q.x,q.y,q.z),q[_]=0,q[m]=0,q[g]=T>0?1:-1,u.push(q.x,q.y,q.z),p.push(Te/v),p.push(1-ee/y),B+=1}}for(let ee=0;ee<y;ee++)for(let se=0;se<v;se++){const Te=d+se+G*ee,Fe=d+se+G*(ee+1),K=d+(se+1)+G*(ee+1),ge=d+(se+1)+G*ee;l.push(Te,Fe,ge),l.push(Fe,K,ge),ne+=6}o.addGroup(h,ne,C),h+=ne,d+=B}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new kn(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}}class yr extends Xt{constructor(e=1,t=1,n=1,s=32,r=1,a=!1,o=0,l=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:e,radiusBottom:t,height:n,radialSegments:s,heightSegments:r,openEnded:a,thetaStart:o,thetaLength:l};const c=this;s=Math.floor(s),r=Math.floor(r);const u=[],p=[],d=[],h=[];let f=0;const _=[],m=n/2;let g=0;x(),a===!1&&(e>0&&S(!0),t>0&&S(!1)),this.setIndex(u),this.setAttribute("position",new Tt(p,3)),this.setAttribute("normal",new Tt(d,3)),this.setAttribute("uv",new Tt(h,2));function x(){const M=new O,w=new O;let T=0;const v=(t-e)/n;for(let y=0;y<=r;y++){const C=[],R=y/r,P=R*(t-e)+e;for(let F=0;F<=s;F++){const z=F/s,L=z*l+o,G=Math.sin(L),X=Math.cos(L);w.x=P*G,w.y=-R*n+m,w.z=P*X,p.push(w.x,w.y,w.z),M.set(G,v,X).normalize(),d.push(M.x,M.y,M.z),h.push(z,1-R),C.push(f++)}_.push(C)}for(let y=0;y<s;y++)for(let C=0;C<r;C++){const R=_[C][y],P=_[C+1][y],F=_[C+1][y+1],z=_[C][y+1];(e>0||C!==0)&&(u.push(R,P,z),T+=3),(t>0||C!==r-1)&&(u.push(P,F,z),T+=3)}c.addGroup(g,T,0),g+=T}function S(M){const w=f,T=new Se,v=new O;let y=0;const C=M===!0?e:t,R=M===!0?1:-1;for(let F=1;F<=s;F++)p.push(0,m*R,0),d.push(0,R,0),h.push(.5,.5),f++;const P=f;for(let F=0;F<=s;F++){const L=F/s*l+o,G=Math.cos(L),X=Math.sin(L);v.x=C*X,v.y=m*R,v.z=C*G,p.push(v.x,v.y,v.z),d.push(0,R,0),T.x=G*.5+.5,T.y=X*.5*R+.5,h.push(T.x,T.y),f++}for(let F=0;F<s;F++){const z=w+F,L=P+F;M===!0?u.push(L,L+1,z):u.push(L+1,L,z),y+=3}c.addGroup(g,y,M===!0?1:2),g+=y}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new yr(e.radiusTop,e.radiusBottom,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}}class Eo extends yr{constructor(e=1,t=1,n=32,s=1,r=!1,a=0,o=Math.PI*2){super(0,e,t,n,s,r,a,o),this.type="ConeGeometry",this.parameters={radius:e,height:t,radialSegments:n,heightSegments:s,openEnded:r,thetaStart:a,thetaLength:o}}static fromJSON(e){return new Eo(e.radius,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}}class wo extends Xt{constructor(e=[],t=[],n=1,s=0){super(),this.type="PolyhedronGeometry",this.parameters={vertices:e,indices:t,radius:n,detail:s};const r=[],a=[];o(s),c(n),u(),this.setAttribute("position",new Tt(r,3)),this.setAttribute("normal",new Tt(r.slice(),3)),this.setAttribute("uv",new Tt(a,2)),s===0?this.computeVertexNormals():this.normalizeNormals();function o(x){const S=new O,M=new O,w=new O;for(let T=0;T<t.length;T+=3)h(t[T+0],S),h(t[T+1],M),h(t[T+2],w),l(S,M,w,x)}function l(x,S,M,w){const T=w+1,v=[];for(let y=0;y<=T;y++){v[y]=[];const C=x.clone().lerp(M,y/T),R=S.clone().lerp(M,y/T),P=T-y;for(let F=0;F<=P;F++)F===0&&y===T?v[y][F]=C:v[y][F]=C.clone().lerp(R,F/P)}for(let y=0;y<T;y++)for(let C=0;C<2*(T-y)-1;C++){const R=Math.floor(C/2);C%2===0?(d(v[y][R+1]),d(v[y+1][R]),d(v[y][R])):(d(v[y][R+1]),d(v[y+1][R+1]),d(v[y+1][R]))}}function c(x){const S=new O;for(let M=0;M<r.length;M+=3)S.x=r[M+0],S.y=r[M+1],S.z=r[M+2],S.normalize().multiplyScalar(x),r[M+0]=S.x,r[M+1]=S.y,r[M+2]=S.z}function u(){const x=new O;for(let S=0;S<r.length;S+=3){x.x=r[S+0],x.y=r[S+1],x.z=r[S+2];const M=m(x)/2/Math.PI+.5,w=g(x)/Math.PI+.5;a.push(M,1-w)}f(),p()}function p(){for(let x=0;x<a.length;x+=6){const S=a[x+0],M=a[x+2],w=a[x+4],T=Math.max(S,M,w),v=Math.min(S,M,w);T>.9&&v<.1&&(S<.2&&(a[x+0]+=1),M<.2&&(a[x+2]+=1),w<.2&&(a[x+4]+=1))}}function d(x){r.push(x.x,x.y,x.z)}function h(x,S){const M=x*3;S.x=e[M+0],S.y=e[M+1],S.z=e[M+2]}function f(){const x=new O,S=new O,M=new O,w=new O,T=new Se,v=new Se,y=new Se;for(let C=0,R=0;C<r.length;C+=9,R+=6){x.set(r[C+0],r[C+1],r[C+2]),S.set(r[C+3],r[C+4],r[C+5]),M.set(r[C+6],r[C+7],r[C+8]),T.set(a[R+0],a[R+1]),v.set(a[R+2],a[R+3]),y.set(a[R+4],a[R+5]),w.copy(x).add(S).add(M).divideScalar(3);const P=m(w);_(T,R+0,x,P),_(v,R+2,S,P),_(y,R+4,M,P)}}function _(x,S,M,w){w<0&&x.x===1&&(a[S]=x.x-1),M.x===0&&M.z===0&&(a[S]=w/2/Math.PI+.5)}function m(x){return Math.atan2(x.z,-x.x)}function g(x){return Math.atan2(-x.y,Math.sqrt(x.x*x.x+x.z*x.z))}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new wo(e.vertices,e.indices,e.radius,e.detail)}}class An{constructor(){this.type="Curve",this.arcLengthDivisions=200,this.needsUpdate=!1,this.cacheArcLengths=null}getPoint(){He("Curve: .getPoint() not implemented.")}getPointAt(e,t){const n=this.getUtoTmapping(e);return this.getPoint(n,t)}getPoints(e=5){const t=[];for(let n=0;n<=e;n++)t.push(this.getPoint(n/e));return t}getSpacedPoints(e=5){const t=[];for(let n=0;n<=e;n++)t.push(this.getPointAt(n/e));return t}getLength(){const e=this.getLengths();return e[e.length-1]}getLengths(e=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===e+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;const t=[];let n,s=this.getPoint(0),r=0;t.push(0);for(let a=1;a<=e;a++)n=this.getPoint(a/e),r+=n.distanceTo(s),t.push(r),s=n;return this.cacheArcLengths=t,t}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(e,t=null){const n=this.getLengths();let s=0;const r=n.length;let a;t?a=t:a=e*n[r-1];let o=0,l=r-1,c;for(;o<=l;)if(s=Math.floor(o+(l-o)/2),c=n[s]-a,c<0)o=s+1;else if(c>0)l=s-1;else{l=s;break}if(s=l,n[s]===a)return s/(r-1);const u=n[s],d=n[s+1]-u,h=(a-u)/d;return(s+h)/(r-1)}getTangent(e,t){let s=e-1e-4,r=e+1e-4;s<0&&(s=0),r>1&&(r=1);const a=this.getPoint(s),o=this.getPoint(r),l=t||(a.isVector2?new Se:new O);return l.copy(o).sub(a).normalize(),l}getTangentAt(e,t){const n=this.getUtoTmapping(e);return this.getTangent(n,t)}computeFrenetFrames(e,t=!1){const n=new O,s=[],r=[],a=[],o=new O,l=new xt;for(let h=0;h<=e;h++){const f=h/e;s[h]=this.getTangentAt(f,new O)}r[0]=new O,a[0]=new O;let c=Number.MAX_VALUE;const u=Math.abs(s[0].x),p=Math.abs(s[0].y),d=Math.abs(s[0].z);u<=c&&(c=u,n.set(1,0,0)),p<=c&&(c=p,n.set(0,1,0)),d<=c&&n.set(0,0,1),o.crossVectors(s[0],n).normalize(),r[0].crossVectors(s[0],o),a[0].crossVectors(s[0],r[0]);for(let h=1;h<=e;h++){if(r[h]=r[h-1].clone(),a[h]=a[h-1].clone(),o.crossVectors(s[h-1],s[h]),o.length()>Number.EPSILON){o.normalize();const f=Math.acos(nt(s[h-1].dot(s[h]),-1,1));r[h].applyMatrix4(l.makeRotationAxis(o,f))}a[h].crossVectors(s[h],r[h])}if(t===!0){let h=Math.acos(nt(r[0].dot(r[e]),-1,1));h/=e,s[0].dot(o.crossVectors(r[0],r[e]))>0&&(h=-h);for(let f=1;f<=e;f++)r[f].applyMatrix4(l.makeRotationAxis(s[f],h*f)),a[f].crossVectors(s[f],r[f])}return{tangents:s,normals:r,binormals:a}}clone(){return new this.constructor().copy(this)}copy(e){return this.arcLengthDivisions=e.arcLengthDivisions,this.cacheArcLengths=null,this}toJSON(){const e={metadata:{version:4.7,type:"Curve",generator:"Curve.toJSON"}};return e.arcLengthDivisions=this.arcLengthDivisions,e.type=this.type,e}fromJSON(e){return this.arcLengthDivisions=e.arcLengthDivisions,this.cacheArcLengths=null,this}}class To extends An{constructor(e=0,t=0,n=1,s=1,r=0,a=Math.PI*2,o=!1,l=0){super(),this.isEllipseCurve=!0,this.type="EllipseCurve",this.aX=e,this.aY=t,this.xRadius=n,this.yRadius=s,this.aStartAngle=r,this.aEndAngle=a,this.aClockwise=o,this.aRotation=l}getPoint(e,t=new Se){const n=t,s=Math.PI*2;let r=this.aEndAngle-this.aStartAngle;const a=Math.abs(r)<Number.EPSILON;for(;r<0;)r+=s;for(;r>s;)r-=s;r<Number.EPSILON&&(a?r=0:r=s),this.aClockwise===!0&&!a&&(r===s?r=-s:r=r-s);const o=this.aStartAngle+e*r;let l=this.aX+this.xRadius*Math.cos(o),c=this.aY+this.yRadius*Math.sin(o);if(this.aRotation!==0){const u=Math.cos(this.aRotation),p=Math.sin(this.aRotation),d=l-this.aX,h=c-this.aY;l=d*u-h*p+this.aX,c=d*p+h*u+this.aY}return n.set(l,c)}copy(e){return super.copy(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}toJSON(){const e=super.toJSON();return e.aX=this.aX,e.aY=this.aY,e.xRadius=this.xRadius,e.yRadius=this.yRadius,e.aStartAngle=this.aStartAngle,e.aEndAngle=this.aEndAngle,e.aClockwise=this.aClockwise,e.aRotation=this.aRotation,e}fromJSON(e){return super.fromJSON(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}}class yd extends To{constructor(e,t,n,s,r,a){super(e,t,n,n,s,r,a),this.isArcCurve=!0,this.type="ArcCurve"}}function Ao(){let i=0,e=0,t=0,n=0;function s(r,a,o,l){i=r,e=o,t=-3*r+3*a-2*o-l,n=2*r-2*a+o+l}return{initCatmullRom:function(r,a,o,l,c){s(a,o,c*(o-r),c*(l-a))},initNonuniformCatmullRom:function(r,a,o,l,c,u,p){let d=(a-r)/c-(o-r)/(c+u)+(o-a)/u,h=(o-a)/u-(l-a)/(u+p)+(l-o)/p;d*=u,h*=u,s(a,o,d,h)},calc:function(r){const a=r*r,o=a*r;return i+e*r+t*a+n*o}}}const El=new O,wl=new O,ea=new Ao,ta=new Ao,na=new Ao;class bd extends An{constructor(e=[],t=!1,n="centripetal",s=.5){super(),this.isCatmullRomCurve3=!0,this.type="CatmullRomCurve3",this.points=e,this.closed=t,this.curveType=n,this.tension=s}getPoint(e,t=new O){const n=t,s=this.points,r=s.length,a=(r-(this.closed?0:1))*e;let o=Math.floor(a),l=a-o;this.closed?o+=o>0?0:(Math.floor(Math.abs(o)/r)+1)*r:l===0&&o===r-1&&(o=r-2,l=1);let c,u;this.closed||o>0?c=s[(o-1)%r]:(wl.subVectors(s[0],s[1]).add(s[0]),c=wl);const p=s[o%r],d=s[(o+1)%r];if(this.closed||o+2<r?u=s[(o+2)%r]:(El.subVectors(s[r-1],s[r-2]).add(s[r-1]),u=El),this.curveType==="centripetal"||this.curveType==="chordal"){const h=this.curveType==="chordal"?.5:.25;let f=Math.pow(c.distanceToSquared(p),h),_=Math.pow(p.distanceToSquared(d),h),m=Math.pow(d.distanceToSquared(u),h);_<1e-4&&(_=1),f<1e-4&&(f=_),m<1e-4&&(m=_),ea.initNonuniformCatmullRom(c.x,p.x,d.x,u.x,f,_,m),ta.initNonuniformCatmullRom(c.y,p.y,d.y,u.y,f,_,m),na.initNonuniformCatmullRom(c.z,p.z,d.z,u.z,f,_,m)}else this.curveType==="catmullrom"&&(ea.initCatmullRom(c.x,p.x,d.x,u.x,this.tension),ta.initCatmullRom(c.y,p.y,d.y,u.y,this.tension),na.initCatmullRom(c.z,p.z,d.z,u.z,this.tension));return n.set(ea.calc(l),ta.calc(l),na.calc(l)),n}copy(e){super.copy(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){const s=e.points[t];this.points.push(s.clone())}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}toJSON(){const e=super.toJSON();e.points=[];for(let t=0,n=this.points.length;t<n;t++){const s=this.points[t];e.points.push(s.toArray())}return e.closed=this.closed,e.curveType=this.curveType,e.tension=this.tension,e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){const s=e.points[t];this.points.push(new O().fromArray(s))}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}}function Tl(i,e,t,n,s){const r=(n-e)*.5,a=(s-t)*.5,o=i*i,l=i*o;return(2*t-2*n+r+a)*l+(-3*t+3*n-2*r-a)*o+r*i+t}function Ed(i,e){const t=1-i;return t*t*e}function wd(i,e){return 2*(1-i)*i*e}function Td(i,e){return i*i*e}function rs(i,e,t,n){return Ed(i,e)+wd(i,t)+Td(i,n)}function Ad(i,e){const t=1-i;return t*t*t*e}function Rd(i,e){const t=1-i;return 3*t*t*i*e}function Cd(i,e){return 3*(1-i)*i*i*e}function Pd(i,e){return i*i*i*e}function as(i,e,t,n,s){return Ad(i,e)+Rd(i,t)+Cd(i,n)+Pd(i,s)}class th extends An{constructor(e=new Se,t=new Se,n=new Se,s=new Se){super(),this.isCubicBezierCurve=!0,this.type="CubicBezierCurve",this.v0=e,this.v1=t,this.v2=n,this.v3=s}getPoint(e,t=new Se){const n=t,s=this.v0,r=this.v1,a=this.v2,o=this.v3;return n.set(as(e,s.x,r.x,a.x,o.x),as(e,s.y,r.y,a.y,o.y)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){const e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}}class Ld extends An{constructor(e=new O,t=new O,n=new O,s=new O){super(),this.isCubicBezierCurve3=!0,this.type="CubicBezierCurve3",this.v0=e,this.v1=t,this.v2=n,this.v3=s}getPoint(e,t=new O){const n=t,s=this.v0,r=this.v1,a=this.v2,o=this.v3;return n.set(as(e,s.x,r.x,a.x,o.x),as(e,s.y,r.y,a.y,o.y),as(e,s.z,r.z,a.z,o.z)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){const e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}}class nh extends An{constructor(e=new Se,t=new Se){super(),this.isLineCurve=!0,this.type="LineCurve",this.v1=e,this.v2=t}getPoint(e,t=new Se){const n=t;return e===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(e).add(this.v1)),n}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new Se){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){const e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}}class Dd extends An{constructor(e=new O,t=new O){super(),this.isLineCurve3=!0,this.type="LineCurve3",this.v1=e,this.v2=t}getPoint(e,t=new O){const n=t;return e===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(e).add(this.v1)),n}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new O){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){const e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}}class ih extends An{constructor(e=new Se,t=new Se,n=new Se){super(),this.isQuadraticBezierCurve=!0,this.type="QuadraticBezierCurve",this.v0=e,this.v1=t,this.v2=n}getPoint(e,t=new Se){const n=t,s=this.v0,r=this.v1,a=this.v2;return n.set(rs(e,s.x,r.x,a.x),rs(e,s.y,r.y,a.y)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){const e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}}class Nd extends An{constructor(e=new O,t=new O,n=new O){super(),this.isQuadraticBezierCurve3=!0,this.type="QuadraticBezierCurve3",this.v0=e,this.v1=t,this.v2=n}getPoint(e,t=new O){const n=t,s=this.v0,r=this.v1,a=this.v2;return n.set(rs(e,s.x,r.x,a.x),rs(e,s.y,r.y,a.y),rs(e,s.z,r.z,a.z)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){const e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}}class sh extends An{constructor(e=[]){super(),this.isSplineCurve=!0,this.type="SplineCurve",this.points=e}getPoint(e,t=new Se){const n=t,s=this.points,r=(s.length-1)*e,a=Math.floor(r),o=r-a,l=s[a===0?a:a-1],c=s[a],u=s[a>s.length-2?s.length-1:a+1],p=s[a>s.length-3?s.length-1:a+2];return n.set(Tl(o,l.x,c.x,u.x,p.x),Tl(o,l.y,c.y,u.y,p.y)),n}copy(e){super.copy(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){const s=e.points[t];this.points.push(s.clone())}return this}toJSON(){const e=super.toJSON();e.points=[];for(let t=0,n=this.points.length;t<n;t++){const s=this.points[t];e.points.push(s.toArray())}return e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){const s=e.points[t];this.points.push(new Se().fromArray(s))}return this}}var to=Object.freeze({__proto__:null,ArcCurve:yd,CatmullRomCurve3:bd,CubicBezierCurve:th,CubicBezierCurve3:Ld,EllipseCurve:To,LineCurve:nh,LineCurve3:Dd,QuadraticBezierCurve:ih,QuadraticBezierCurve3:Nd,SplineCurve:sh});class Id extends An{constructor(){super(),this.type="CurvePath",this.curves=[],this.autoClose=!1,this.cacheLengths=null}add(e){this.curves.push(e)}closePath(){const e=this.curves[0].getPoint(0),t=this.curves[this.curves.length-1].getPoint(1);if(!e.equals(t)){const n=e.isVector2===!0?"LineCurve":"LineCurve3";this.curves.push(new to[n](t,e))}return this}getPoint(e,t){const n=e*this.getLength(),s=this.getCurveLengths();let r=0;for(;r<s.length;){if(s[r]>=n){const a=s[r]-n,o=this.curves[r],l=o.getLength(),c=l===0?0:1-a/l;return o.getPointAt(c,t)}r++}return null}getLength(){const e=this.getCurveLengths();return e[e.length-1]}updateArcLengths(){this.needsUpdate=!0,this.cacheLengths=null,this.getCurveLengths()}getCurveLengths(){if(this.cacheLengths&&this.cacheLengths.length===this.curves.length)return this.cacheLengths;const e=[];let t=0;for(let n=0,s=this.curves.length;n<s;n++)t+=this.curves[n].getLength(),e.push(t);return this.cacheLengths=e,e}getSpacedPoints(e=40){const t=[];for(let n=0;n<=e;n++)t.push(this.getPoint(n/e));return this.autoClose&&t.push(t[0]),t}getPoints(e=12){const t=[];let n;for(let s=0,r=this.curves;s<r.length;s++){const a=r[s],o=a.isEllipseCurve?e*2:a.isLineCurve||a.isLineCurve3?1:a.isSplineCurve?e*a.points.length:e,l=a.getPoints(o);for(let c=0;c<l.length;c++){const u=l[c];n&&n.equals(u)||(t.push(u),n=u)}}return this.autoClose&&t.length>1&&!t[t.length-1].equals(t[0])&&t.push(t[0]),t}copy(e){super.copy(e),this.curves=[];for(let t=0,n=e.curves.length;t<n;t++){const s=e.curves[t];this.curves.push(s.clone())}return this.autoClose=e.autoClose,this.cacheLengths=null,this}toJSON(){const e=super.toJSON();e.autoClose=this.autoClose,e.curves=[];for(let t=0,n=this.curves.length;t<n;t++){const s=this.curves[t];e.curves.push(s.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.autoClose=e.autoClose,this.curves=[];for(let t=0,n=e.curves.length;t<n;t++){const s=e.curves[t];this.curves.push(new to[s.type]().fromJSON(s))}return this.cacheLengths=null,this}}class pr extends Id{constructor(e){super(),this.type="Path",this.currentPoint=new Se,e&&this.setFromPoints(e)}setFromPoints(e){this.moveTo(e[0].x,e[0].y);for(let t=1,n=e.length;t<n;t++)this.lineTo(e[t].x,e[t].y);return this}moveTo(e,t){return this.currentPoint.set(e,t),this}lineTo(e,t){const n=new nh(this.currentPoint.clone(),new Se(e,t));return this.curves.push(n),this.currentPoint.set(e,t),this}quadraticCurveTo(e,t,n,s){const r=new ih(this.currentPoint.clone(),new Se(e,t),new Se(n,s));return this.curves.push(r),this.currentPoint.set(n,s),this}bezierCurveTo(e,t,n,s,r,a){const o=new th(this.currentPoint.clone(),new Se(e,t),new Se(n,s),new Se(r,a));return this.curves.push(o),this.currentPoint.set(r,a),this}splineThru(e){const t=[this.currentPoint.clone()].concat(e),n=new sh(t);return this.curves.push(n),this.currentPoint.copy(e[e.length-1]),this}arc(e,t,n,s,r,a){const o=this.currentPoint.x,l=this.currentPoint.y;return this.absarc(e+o,t+l,n,s,r,a),this}absarc(e,t,n,s,r,a){return this.absellipse(e,t,n,n,s,r,a),this}ellipse(e,t,n,s,r,a,o,l){const c=this.currentPoint.x,u=this.currentPoint.y;return this.absellipse(e+c,t+u,n,s,r,a,o,l),this}absellipse(e,t,n,s,r,a,o,l){const c=new To(e,t,n,s,r,a,o,l);if(this.curves.length>0){const p=c.getPoint(0);p.equals(this.currentPoint)||this.lineTo(p.x,p.y)}this.curves.push(c);const u=c.getPoint(1);return this.currentPoint.copy(u),this}copy(e){return super.copy(e),this.currentPoint.copy(e.currentPoint),this}toJSON(){const e=super.toJSON();return e.currentPoint=this.currentPoint.toArray(),e}fromJSON(e){return super.fromJSON(e),this.currentPoint.fromArray(e.currentPoint),this}}class mr extends pr{constructor(e){super(e),this.uuid=mi(),this.type="Shape",this.holes=[]}getPointsHoles(e){const t=[];for(let n=0,s=this.holes.length;n<s;n++)t[n]=this.holes[n].getPoints(e);return t}extractPoints(e){return{shape:this.getPoints(e),holes:this.getPointsHoles(e)}}copy(e){super.copy(e),this.holes=[];for(let t=0,n=e.holes.length;t<n;t++){const s=e.holes[t];this.holes.push(s.clone())}return this}toJSON(){const e=super.toJSON();e.uuid=this.uuid,e.holes=[];for(let t=0,n=this.holes.length;t<n;t++){const s=this.holes[t];e.holes.push(s.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.uuid=e.uuid,this.holes=[];for(let t=0,n=e.holes.length;t<n;t++){const s=e.holes[t];this.holes.push(new pr().fromJSON(s))}return this}}function Ud(i,e,t=2){const n=e&&e.length,s=n?e[0]*t:i.length;let r=rh(i,0,s,t,!0);const a=[];if(!r||r.next===r.prev)return a;let o,l,c;if(n&&(r=zd(i,e,r,t)),i.length>80*t){o=i[0],l=i[1];let u=o,p=l;for(let d=t;d<s;d+=t){const h=i[d],f=i[d+1];h<o&&(o=h),f<l&&(l=f),h>u&&(u=h),f>p&&(p=f)}c=Math.max(u-o,p-l),c=c!==0?32767/c:0}return ms(r,a,t,o,l,c,0),a}function rh(i,e,t,n,s){let r;if(s===Jd(i,e,t,n)>0)for(let a=e;a<t;a+=n)r=Al(a/n|0,i[a],i[a+1],r);else for(let a=t-n;a>=e;a-=n)r=Al(a/n|0,i[a],i[a+1],r);return r&&Oi(r,r.next)&&(_s(r),r=r.next),r}function di(i,e){if(!i)return i;e||(e=i);let t=i,n;do if(n=!1,!t.steiner&&(Oi(t,t.next)||wt(t.prev,t,t.next)===0)){if(_s(t),t=e=t.prev,t===t.next)break;n=!0}else t=t.next;while(n||t!==e);return e}function ms(i,e,t,n,s,r,a){if(!i)return;!a&&r&&Xd(i,n,s,r);let o=i;for(;i.prev!==i.next;){const l=i.prev,c=i.next;if(r?Od(i,n,s,r):Fd(i)){e.push(l.i,i.i,c.i),_s(i),i=c.next,o=c.next;continue}if(i=c,i===o){a?a===1?(i=Bd(di(i),e),ms(i,e,t,n,s,r,2)):a===2&&kd(i,e,t,n,s,r):ms(di(i),e,t,n,s,r,1);break}}}function Fd(i){const e=i.prev,t=i,n=i.next;if(wt(e,t,n)>=0)return!1;const s=e.x,r=t.x,a=n.x,o=e.y,l=t.y,c=n.y,u=Math.min(s,r,a),p=Math.min(o,l,c),d=Math.max(s,r,a),h=Math.max(o,l,c);let f=n.next;for(;f!==e;){if(f.x>=u&&f.x<=d&&f.y>=p&&f.y<=h&&Qi(s,o,r,l,a,c,f.x,f.y)&&wt(f.prev,f,f.next)>=0)return!1;f=f.next}return!0}function Od(i,e,t,n){const s=i.prev,r=i,a=i.next;if(wt(s,r,a)>=0)return!1;const o=s.x,l=r.x,c=a.x,u=s.y,p=r.y,d=a.y,h=Math.min(o,l,c),f=Math.min(u,p,d),_=Math.max(o,l,c),m=Math.max(u,p,d),g=no(h,f,e,t,n),x=no(_,m,e,t,n);let S=i.prevZ,M=i.nextZ;for(;S&&S.z>=g&&M&&M.z<=x;){if(S.x>=h&&S.x<=_&&S.y>=f&&S.y<=m&&S!==s&&S!==a&&Qi(o,u,l,p,c,d,S.x,S.y)&&wt(S.prev,S,S.next)>=0||(S=S.prevZ,M.x>=h&&M.x<=_&&M.y>=f&&M.y<=m&&M!==s&&M!==a&&Qi(o,u,l,p,c,d,M.x,M.y)&&wt(M.prev,M,M.next)>=0))return!1;M=M.nextZ}for(;S&&S.z>=g;){if(S.x>=h&&S.x<=_&&S.y>=f&&S.y<=m&&S!==s&&S!==a&&Qi(o,u,l,p,c,d,S.x,S.y)&&wt(S.prev,S,S.next)>=0)return!1;S=S.prevZ}for(;M&&M.z<=x;){if(M.x>=h&&M.x<=_&&M.y>=f&&M.y<=m&&M!==s&&M!==a&&Qi(o,u,l,p,c,d,M.x,M.y)&&wt(M.prev,M,M.next)>=0)return!1;M=M.nextZ}return!0}function Bd(i,e){let t=i;do{const n=t.prev,s=t.next.next;!Oi(n,s)&&oh(n,t,t.next,s)&&gs(n,s)&&gs(s,n)&&(e.push(n.i,t.i,s.i),_s(t),_s(t.next),t=i=s),t=t.next}while(t!==i);return di(t)}function kd(i,e,t,n,s,r){let a=i;do{let o=a.next.next;for(;o!==a.prev;){if(a.i!==o.i&&$d(a,o)){let l=lh(a,o);a=di(a,a.next),l=di(l,l.next),ms(a,e,t,n,s,r,0),ms(l,e,t,n,s,r,0);return}o=o.next}a=a.next}while(a!==i)}function zd(i,e,t,n){const s=[];for(let r=0,a=e.length;r<a;r++){const o=e[r]*n,l=r<a-1?e[r+1]*n:i.length,c=rh(i,o,l,n,!1);c===c.next&&(c.steiner=!0),s.push(Yd(c))}s.sort(Gd);for(let r=0;r<s.length;r++)t=Hd(s[r],t);return t}function Gd(i,e){let t=i.x-e.x;if(t===0&&(t=i.y-e.y,t===0)){const n=(i.next.y-i.y)/(i.next.x-i.x),s=(e.next.y-e.y)/(e.next.x-e.x);t=n-s}return t}function Hd(i,e){const t=Vd(i,e);if(!t)return e;const n=lh(t,i);return di(n,n.next),di(t,t.next)}function Vd(i,e){let t=e;const n=i.x,s=i.y;let r=-1/0,a;if(Oi(i,t))return t;do{if(Oi(i,t.next))return t.next;if(s<=t.y&&s>=t.next.y&&t.next.y!==t.y){const p=t.x+(s-t.y)*(t.next.x-t.x)/(t.next.y-t.y);if(p<=n&&p>r&&(r=p,a=t.x<t.next.x?t:t.next,p===n))return a}t=t.next}while(t!==e);if(!a)return null;const o=a,l=a.x,c=a.y;let u=1/0;t=a;do{if(n>=t.x&&t.x>=l&&n!==t.x&&ah(s<c?n:r,s,l,c,s<c?r:n,s,t.x,t.y)){const p=Math.abs(s-t.y)/(n-t.x);gs(t,i)&&(p<u||p===u&&(t.x>a.x||t.x===a.x&&Wd(a,t)))&&(a=t,u=p)}t=t.next}while(t!==o);return a}function Wd(i,e){return wt(i.prev,i,e.prev)<0&&wt(e.next,i,i.next)<0}function Xd(i,e,t,n){let s=i;do s.z===0&&(s.z=no(s.x,s.y,e,t,n)),s.prevZ=s.prev,s.nextZ=s.next,s=s.next;while(s!==i);s.prevZ.nextZ=null,s.prevZ=null,qd(s)}function qd(i){let e,t=1;do{let n=i,s;i=null;let r=null;for(e=0;n;){e++;let a=n,o=0;for(let c=0;c<t&&(o++,a=a.nextZ,!!a);c++);let l=t;for(;o>0||l>0&&a;)o!==0&&(l===0||!a||n.z<=a.z)?(s=n,n=n.nextZ,o--):(s=a,a=a.nextZ,l--),r?r.nextZ=s:i=s,s.prevZ=r,r=s;n=a}r.nextZ=null,t*=2}while(e>1);return i}function no(i,e,t,n,s){return i=(i-t)*s|0,e=(e-n)*s|0,i=(i|i<<8)&16711935,i=(i|i<<4)&252645135,i=(i|i<<2)&858993459,i=(i|i<<1)&1431655765,e=(e|e<<8)&16711935,e=(e|e<<4)&252645135,e=(e|e<<2)&858993459,e=(e|e<<1)&1431655765,i|e<<1}function Yd(i){let e=i,t=i;do(e.x<t.x||e.x===t.x&&e.y<t.y)&&(t=e),e=e.next;while(e!==i);return t}function ah(i,e,t,n,s,r,a,o){return(s-a)*(e-o)>=(i-a)*(r-o)&&(i-a)*(n-o)>=(t-a)*(e-o)&&(t-a)*(r-o)>=(s-a)*(n-o)}function Qi(i,e,t,n,s,r,a,o){return!(i===a&&e===o)&&ah(i,e,t,n,s,r,a,o)}function $d(i,e){return i.next.i!==e.i&&i.prev.i!==e.i&&!Kd(i,e)&&(gs(i,e)&&gs(e,i)&&Zd(i,e)&&(wt(i.prev,i,e.prev)||wt(i,e.prev,e))||Oi(i,e)&&wt(i.prev,i,i.next)>0&&wt(e.prev,e,e.next)>0)}function wt(i,e,t){return(e.y-i.y)*(t.x-e.x)-(e.x-i.x)*(t.y-e.y)}function Oi(i,e){return i.x===e.x&&i.y===e.y}function oh(i,e,t,n){const s=qs(wt(i,e,t)),r=qs(wt(i,e,n)),a=qs(wt(t,n,i)),o=qs(wt(t,n,e));return!!(s!==r&&a!==o||s===0&&Xs(i,t,e)||r===0&&Xs(i,n,e)||a===0&&Xs(t,i,n)||o===0&&Xs(t,e,n))}function Xs(i,e,t){return e.x<=Math.max(i.x,t.x)&&e.x>=Math.min(i.x,t.x)&&e.y<=Math.max(i.y,t.y)&&e.y>=Math.min(i.y,t.y)}function qs(i){return i>0?1:i<0?-1:0}function Kd(i,e){let t=i;do{if(t.i!==i.i&&t.next.i!==i.i&&t.i!==e.i&&t.next.i!==e.i&&oh(t,t.next,i,e))return!0;t=t.next}while(t!==i);return!1}function gs(i,e){return wt(i.prev,i,i.next)<0?wt(i,e,i.next)>=0&&wt(i,i.prev,e)>=0:wt(i,e,i.prev)<0||wt(i,i.next,e)<0}function Zd(i,e){let t=i,n=!1;const s=(i.x+e.x)/2,r=(i.y+e.y)/2;do t.y>r!=t.next.y>r&&t.next.y!==t.y&&s<(t.next.x-t.x)*(r-t.y)/(t.next.y-t.y)+t.x&&(n=!n),t=t.next;while(t!==i);return n}function lh(i,e){const t=io(i.i,i.x,i.y),n=io(e.i,e.x,e.y),s=i.next,r=e.prev;return i.next=e,e.prev=i,t.next=s,s.prev=t,n.next=t,t.prev=n,r.next=n,n.prev=r,n}function Al(i,e,t,n){const s=io(i,e,t);return n?(s.next=n.next,s.prev=n,n.next.prev=s,n.next=s):(s.prev=s,s.next=s),s}function _s(i){i.next.prev=i.prev,i.prev.next=i.next,i.prevZ&&(i.prevZ.nextZ=i.nextZ),i.nextZ&&(i.nextZ.prevZ=i.prevZ)}function io(i,e,t){return{i,x:e,y:t,prev:null,next:null,z:0,prevZ:null,nextZ:null,steiner:!1}}function Jd(i,e,t,n){let s=0;for(let r=e,a=t-n;r<t;r+=n)s+=(i[a]-i[r])*(i[r+1]+i[a+1]),a=r;return s}class Qd{static triangulate(e,t,n=2){return Ud(e,t,n)}}class Pi{static area(e){const t=e.length;let n=0;for(let s=t-1,r=0;r<t;s=r++)n+=e[s].x*e[r].y-e[r].x*e[s].y;return n*.5}static isClockWise(e){return Pi.area(e)<0}static triangulateShape(e,t){const n=[],s=[],r=[];Rl(e),Cl(n,e);let a=e.length;t.forEach(Rl);for(let l=0;l<t.length;l++)s.push(a),a+=t[l].length,Cl(n,t[l]);const o=Qd.triangulate(n,s);for(let l=0;l<o.length;l+=3)r.push(o.slice(l,l+3));return r}}function Rl(i){const e=i.length;e>2&&i[e-1].equals(i[0])&&i.pop()}function Cl(i,e){for(let t=0;t<e.length;t++)i.push(e[t].x),i.push(e[t].y)}class vs extends Xt{constructor(e=new mr([new Se(.5,.5),new Se(-.5,.5),new Se(-.5,-.5),new Se(.5,-.5)]),t={}){super(),this.type="ExtrudeGeometry",this.parameters={shapes:e,options:t},e=Array.isArray(e)?e:[e];const n=this,s=[],r=[];for(let o=0,l=e.length;o<l;o++){const c=e[o];a(c)}this.setAttribute("position",new Tt(s,3)),this.setAttribute("uv",new Tt(r,2)),this.computeVertexNormals();function a(o){const l=[],c=t.curveSegments!==void 0?t.curveSegments:12,u=t.steps!==void 0?t.steps:1,p=t.depth!==void 0?t.depth:1;let d=t.bevelEnabled!==void 0?t.bevelEnabled:!0,h=t.bevelThickness!==void 0?t.bevelThickness:.2,f=t.bevelSize!==void 0?t.bevelSize:h-.1,_=t.bevelOffset!==void 0?t.bevelOffset:0,m=t.bevelSegments!==void 0?t.bevelSegments:3;const g=t.extrudePath,x=t.UVGenerator!==void 0?t.UVGenerator:jd;let S,M=!1,w,T,v,y;if(g){S=g.getSpacedPoints(u),M=!0,d=!1;const te=g.isCatmullRomCurve3?g.closed:!1;w=g.computeFrenetFrames(u,te),T=new O,v=new O,y=new O}d||(m=0,h=0,f=0,_=0);const C=o.extractPoints(c);let R=C.shape;const P=C.holes;if(!Pi.isClockWise(R)){R=R.reverse();for(let te=0,he=P.length;te<he;te++){const Y=P[te];Pi.isClockWise(Y)&&(P[te]=Y.reverse())}}function z(te){const Y=10000000000000001e-36;let ae=te[0];for(let re=1;re<=te.length;re++){const Be=re%te.length,Re=te[Be],$e=Re.x-ae.x,Je=Re.y-ae.y,et=$e*$e+Je*Je,U=Math.max(Math.abs(Re.x),Math.abs(Re.y),Math.abs(ae.x),Math.abs(ae.y)),yt=Y*U*U;if(et<=yt){te.splice(Be,1),re--;continue}ae=Re}}z(R),P.forEach(z);const L=P.length,G=R;for(let te=0;te<L;te++){const he=P[te];R=R.concat(he)}function X(te,he,Y){return he||lt("ExtrudeGeometry: vec does not exist"),te.clone().addScaledVector(he,Y)}const B=R.length;function ne(te,he,Y){let ae,re,Be;const Re=te.x-he.x,$e=te.y-he.y,Je=Y.x-te.x,et=Y.y-te.y,U=Re*Re+$e*$e,yt=Re*et-$e*Je;if(Math.abs(yt)>Number.EPSILON){const tt=Math.sqrt(U),mt=Math.sqrt(Je*Je+et*et),_e=he.x-$e/tt,At=he.y+Re/tt,Ge=Y.x-et/mt,We=Y.y+Je/mt,A=((Ge-_e)*et-(We-At)*Je)/(Re*et-$e*Je);ae=_e+Re*A-te.x,re=At+$e*A-te.y;const b=ae*ae+re*re;if(b<=2)return new Se(ae,re);Be=Math.sqrt(b/2)}else{let tt=!1;Re>Number.EPSILON?Je>Number.EPSILON&&(tt=!0):Re<-Number.EPSILON?Je<-Number.EPSILON&&(tt=!0):Math.sign($e)===Math.sign(et)&&(tt=!0),tt?(ae=-$e,re=Re,Be=Math.sqrt(U)):(ae=Re,re=$e,Be=Math.sqrt(U/2))}return new Se(ae/Be,re/Be)}const q=[];for(let te=0,he=G.length,Y=he-1,ae=te+1;te<he;te++,Y++,ae++)Y===he&&(Y=0),ae===he&&(ae=0),q[te]=ne(G[te],G[Y],G[ae]);const ee=[];let se,Te=q.concat();for(let te=0,he=L;te<he;te++){const Y=P[te];se=[];for(let ae=0,re=Y.length,Be=re-1,Re=ae+1;ae<re;ae++,Be++,Re++)Be===re&&(Be=0),Re===re&&(Re=0),se[ae]=ne(Y[ae],Y[Be],Y[Re]);ee.push(se),Te=Te.concat(se)}let Fe;if(m===0)Fe=Pi.triangulateShape(G,P);else{const te=[],he=[];for(let Y=0;Y<m;Y++){const ae=Y/m,re=h*Math.cos(ae*Math.PI/2),Be=f*Math.sin(ae*Math.PI/2)+_;for(let Re=0,$e=G.length;Re<$e;Re++){const Je=X(G[Re],q[Re],Be);Oe(Je.x,Je.y,-re),ae===0&&te.push(Je)}for(let Re=0,$e=L;Re<$e;Re++){const Je=P[Re];se=ee[Re];const et=[];for(let U=0,yt=Je.length;U<yt;U++){const tt=X(Je[U],se[U],Be);Oe(tt.x,tt.y,-re),ae===0&&et.push(tt)}ae===0&&he.push(et)}}Fe=Pi.triangulateShape(te,he)}const K=Fe.length,ge=f+_;for(let te=0;te<B;te++){const he=d?X(R[te],Te[te],ge):R[te];M?(v.copy(w.normals[0]).multiplyScalar(he.x),T.copy(w.binormals[0]).multiplyScalar(he.y),y.copy(S[0]).add(v).add(T),Oe(y.x,y.y,y.z)):Oe(he.x,he.y,0)}for(let te=1;te<=u;te++)for(let he=0;he<B;he++){const Y=d?X(R[he],Te[he],ge):R[he];M?(v.copy(w.normals[te]).multiplyScalar(Y.x),T.copy(w.binormals[te]).multiplyScalar(Y.y),y.copy(S[te]).add(v).add(T),Oe(y.x,y.y,y.z)):Oe(Y.x,Y.y,p/u*te)}for(let te=m-1;te>=0;te--){const he=te/m,Y=h*Math.cos(he*Math.PI/2),ae=f*Math.sin(he*Math.PI/2)+_;for(let re=0,Be=G.length;re<Be;re++){const Re=X(G[re],q[re],ae);Oe(Re.x,Re.y,p+Y)}for(let re=0,Be=P.length;re<Be;re++){const Re=P[re];se=ee[re];for(let $e=0,Je=Re.length;$e<Je;$e++){const et=X(Re[$e],se[$e],ae);M?Oe(et.x,et.y+S[u-1].y,S[u-1].x+Y):Oe(et.x,et.y,p+Y)}}}Ae(),Ue();function Ae(){const te=s.length/3;if(d){let he=0,Y=B*he;for(let ae=0;ae<K;ae++){const re=Fe[ae];pt(re[2]+Y,re[1]+Y,re[0]+Y)}he=u+m*2,Y=B*he;for(let ae=0;ae<K;ae++){const re=Fe[ae];pt(re[0]+Y,re[1]+Y,re[2]+Y)}}else{for(let he=0;he<K;he++){const Y=Fe[he];pt(Y[2],Y[1],Y[0])}for(let he=0;he<K;he++){const Y=Fe[he];pt(Y[0]+B*u,Y[1]+B*u,Y[2]+B*u)}}n.addGroup(te,s.length/3-te,0)}function Ue(){const te=s.length/3;let he=0;Me(G,he),he+=G.length;for(let Y=0,ae=P.length;Y<ae;Y++){const re=P[Y];Me(re,he),he+=re.length}n.addGroup(te,s.length/3-te,1)}function Me(te,he){let Y=te.length;for(;--Y>=0;){const ae=Y;let re=Y-1;re<0&&(re=te.length-1);for(let Be=0,Re=u+m*2;Be<Re;Be++){const $e=B*Be,Je=B*(Be+1),et=he+ae+$e,U=he+re+$e,yt=he+re+Je,tt=he+ae+Je;ze(et,U,yt,tt)}}}function Oe(te,he,Y){l.push(te),l.push(he),l.push(Y)}function pt(te,he,Y){Ye(te),Ye(he),Ye(Y);const ae=s.length/3,re=x.generateTopUV(n,s,ae-3,ae-2,ae-1);Ke(re[0]),Ke(re[1]),Ke(re[2])}function ze(te,he,Y,ae){Ye(te),Ye(he),Ye(ae),Ye(he),Ye(Y),Ye(ae);const re=s.length/3,Be=x.generateSideWallUV(n,s,re-6,re-3,re-2,re-1);Ke(Be[0]),Ke(Be[1]),Ke(Be[3]),Ke(Be[1]),Ke(Be[2]),Ke(Be[3])}function Ye(te){s.push(l[te*3+0]),s.push(l[te*3+1]),s.push(l[te*3+2])}function Ke(te){r.push(te.x),r.push(te.y)}}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){const e=super.toJSON(),t=this.parameters.shapes,n=this.parameters.options;return ef(t,n,e)}static fromJSON(e,t){const n=[];for(let r=0,a=e.shapes.length;r<a;r++){const o=t[e.shapes[r]];n.push(o)}const s=e.options.extrudePath;return s!==void 0&&(e.options.extrudePath=new to[s.type]().fromJSON(s)),new vs(n,e.options)}}const jd={generateTopUV:function(i,e,t,n,s){const r=e[t*3],a=e[t*3+1],o=e[n*3],l=e[n*3+1],c=e[s*3],u=e[s*3+1];return[new Se(r,a),new Se(o,l),new Se(c,u)]},generateSideWallUV:function(i,e,t,n,s,r){const a=e[t*3],o=e[t*3+1],l=e[t*3+2],c=e[n*3],u=e[n*3+1],p=e[n*3+2],d=e[s*3],h=e[s*3+1],f=e[s*3+2],_=e[r*3],m=e[r*3+1],g=e[r*3+2];return Math.abs(o-u)<Math.abs(a-c)?[new Se(a,1-l),new Se(c,1-p),new Se(d,1-f),new Se(_,1-g)]:[new Se(o,1-l),new Se(u,1-p),new Se(h,1-f),new Se(m,1-g)]}};function ef(i,e,t){if(t.shapes=[],Array.isArray(i))for(let n=0,s=i.length;n<s;n++){const r=i[n];t.shapes.push(r.uuid)}else t.shapes.push(i.uuid);return t.options=Object.assign({},e),e.extrudePath!==void 0&&(t.options.extrudePath=e.extrudePath.toJSON()),t}class Ro extends wo{constructor(e=1,t=0){const n=(1+Math.sqrt(5))/2,s=[-1,n,0,1,n,0,-1,-n,0,1,-n,0,0,-1,n,0,1,n,0,-1,-n,0,1,-n,n,0,-1,n,0,1,-n,0,-1,-n,0,1],r=[0,11,5,0,5,1,0,1,7,0,7,10,0,10,11,1,5,9,5,11,4,11,10,2,10,7,6,7,1,8,3,9,4,3,4,2,3,2,6,3,6,8,3,8,9,4,9,5,2,4,11,6,2,10,8,6,7,9,8,1];super(s,r,e,t),this.type="IcosahedronGeometry",this.parameters={radius:e,detail:t}}static fromJSON(e){return new Ro(e.radius,e.detail)}}class br extends Xt{constructor(e=1,t=1,n=1,s=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:n,heightSegments:s};const r=e/2,a=t/2,o=Math.floor(n),l=Math.floor(s),c=o+1,u=l+1,p=e/o,d=t/l,h=[],f=[],_=[],m=[];for(let g=0;g<u;g++){const x=g*d-a;for(let S=0;S<c;S++){const M=S*p-r;f.push(M,-x,0),_.push(0,0,1),m.push(S/o),m.push(1-g/l)}}for(let g=0;g<l;g++)for(let x=0;x<o;x++){const S=x+c*g,M=x+c*(g+1),w=x+1+c*(g+1),T=x+1+c*g;h.push(S,M,T),h.push(M,w,T)}this.setIndex(h),this.setAttribute("position",new Tt(f,3)),this.setAttribute("normal",new Tt(_,3)),this.setAttribute("uv",new Tt(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new br(e.width,e.height,e.widthSegments,e.heightSegments)}}function Bi(i){const e={};for(const t in i){e[t]={};for(const n in i[t]){const s=i[t][n];if(Pl(s))s.isRenderTargetTexture?(He("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][n]=null):e[t][n]=s.clone();else if(Array.isArray(s))if(Pl(s[0])){const r=[];for(let a=0,o=s.length;a<o;a++)r[a]=s[a].clone();e[t][n]=r}else e[t][n]=s.slice();else e[t][n]=s}}return e}function Yt(i){const e={};for(let t=0;t<i.length;t++){const n=Bi(i[t]);for(const s in n)e[s]=n[s]}return e}function Pl(i){return i&&(i.isColor||i.isMatrix3||i.isMatrix4||i.isVector2||i.isVector3||i.isVector4||i.isTexture||i.isQuaternion)}function tf(i){const e=[];for(let t=0;t<i.length;t++)e.push(i[t].clone());return e}function ch(i){const e=i.getRenderTarget();return e===null?i.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:at.workingColorSpace}const nf={clone:Bi,merge:Yt};var sf=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,rf=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;class fi extends Ss{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=sf,this.fragmentShader=rf,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=Bi(e.uniforms),this.uniformsGroups=tf(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this.defaultAttributeValues=Object.assign({},e.defaultAttributeValues),this.index0AttributeName=e.index0AttributeName,this.uniformsNeedUpdate=e.uniformsNeedUpdate,this}toJSON(e){const t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(const s in this.uniforms){const a=this.uniforms[s].value;a&&a.isTexture?t.uniforms[s]={type:"t",value:a.toJSON(e).uuid}:a&&a.isColor?t.uniforms[s]={type:"c",value:a.getHex()}:a&&a.isVector2?t.uniforms[s]={type:"v2",value:a.toArray()}:a&&a.isVector3?t.uniforms[s]={type:"v3",value:a.toArray()}:a&&a.isVector4?t.uniforms[s]={type:"v4",value:a.toArray()}:a&&a.isMatrix3?t.uniforms[s]={type:"m3",value:a.toArray()}:a&&a.isMatrix4?t.uniforms[s]={type:"m4",value:a.toArray()}:t.uniforms[s]={value:a}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;const n={};for(const s in this.extensions)this.extensions[s]===!0&&(n[s]=!0);return Object.keys(n).length>0&&(t.extensions=n),t}fromJSON(e,t){if(super.fromJSON(e,t),e.uniforms!==void 0)for(const n in e.uniforms){const s=e.uniforms[n];switch(this.uniforms[n]={},s.type){case"t":this.uniforms[n].value=t[s.value]||null;break;case"c":this.uniforms[n].value=new Ve().setHex(s.value);break;case"v2":this.uniforms[n].value=new Se().fromArray(s.value);break;case"v3":this.uniforms[n].value=new O().fromArray(s.value);break;case"v4":this.uniforms[n].value=new Et().fromArray(s.value);break;case"m3":this.uniforms[n].value=new Xe().fromArray(s.value);break;case"m4":this.uniforms[n].value=new xt().fromArray(s.value);break;default:this.uniforms[n].value=s.value}}if(e.defines!==void 0&&(this.defines=e.defines),e.vertexShader!==void 0&&(this.vertexShader=e.vertexShader),e.fragmentShader!==void 0&&(this.fragmentShader=e.fragmentShader),e.glslVersion!==void 0&&(this.glslVersion=e.glslVersion),e.extensions!==void 0)for(const n in e.extensions)this.extensions[n]=e.extensions[n];return e.lights!==void 0&&(this.lights=e.lights),e.clipping!==void 0&&(this.clipping=e.clipping),this}}class af extends fi{constructor(e){super(e),this.isRawShaderMaterial=!0,this.type="RawShaderMaterial"}}class _n extends Ss{constructor(e){super(),this.isMeshStandardMaterial=!0,this.type="MeshStandardMaterial",this.defines={STANDARD:""},this.color=new Ve(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Ve(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=eo,this.normalScale=new Se(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new ei,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:""},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}}class of extends Ss{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=bu,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}}class lf extends Ss{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}}class hh extends kt{static registerNode(e){this.prototype._lightNode=e}constructor(e,t=1){super(),this.isLight=!0,this.type="Light",this.color=new Ve(e),this.intensity=t}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){const t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,t}}class cf extends hh{constructor(e,t,n){super(e,n),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(kt.DEFAULT_UP),this.updateMatrix(),this.groundColor=new Ve(t)}copy(e,t){return super.copy(e,t),this.groundColor.copy(e.groundColor),this}toJSON(e){const t=super.toJSON(e);return t.object.groundColor=this.groundColor.getHex(),t}}const ia=new xt,Ll=new O,Dl=new O;class hf{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.biasNode=null,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new Se(512,512),this.mapType=sn,this.map=null,this.mapPass=null,this.matrix=new xt,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new ps,this._frameExtents=new Se(1,1),this._viewportCount=1,this._viewports=[new Et(0,0,1,1)]}getViewportCount(){return this._viewportCount}getCamera(){return this.camera}getFrustum(){return this._frustum}updateMatrices(e){const t=this.camera;Ll.setFromMatrixPosition(e.matrixWorld),t.position.copy(Ll),Dl.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(Dl),t.updateMatrixWorld(),this._updateMatrix(t,this.matrix,this._frustum)}_updateMatrix(e,t,n,s){ia.multiplyMatrices(e.projectionMatrix,e.matrixWorldInverse),n.setFromProjectionMatrix(ia,e.coordinateSystem,e.reversedDepth);const r=this._frameExtents,a=s?s.z/r.x:1,o=s?s.w/r.y:1,l=s?s.x/r.x:0,c=s?s.y/r.y:0;e.coordinateSystem===ds||e.reversedDepth?t.set(.5*a,0,0,.5*a+l,0,.5*o,0,.5*o+c,0,0,1,0,0,0,0,1):t.set(.5*a,0,0,.5*a+l,0,.5*o,0,.5*o+c,0,0,.5,.5,0,0,0,1),t.multiply(ia)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.autoUpdate=e.autoUpdate,this.needsUpdate=e.needsUpdate,this.normalBias=e.normalBias,this.blurSamples=e.blurSamples,this.mapSize.copy(e.mapSize),this.mapType=e.mapType,this.biasNode=e.biasNode,this}clone(){return new this.constructor().copy(this)}toJSON(){const e={};return e.intensity=this.intensity,e.bias=this.bias,e.normalBias=this.normalBias,e.radius=this.radius,e.blurSamples=this.blurSamples,e.mapSize=this.mapSize.toArray(),e.mapType=this.mapType,e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}}const Ys=new O,$s=new zi,vn=new O;class uh extends kt{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new xt,this.projectionMatrix=new xt,this.projectionMatrixInverse=new xt,this.coordinateSystem=mn,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorld.decompose(Ys,$s,vn),vn.x===1&&vn.y===1&&vn.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(Ys,$s,vn.set(1,1,1)).invert()}updateWorldMatrix(e,t,n=!1){super.updateWorldMatrix(e,t,n),this.matrixWorld.decompose(Ys,$s,vn),vn.x===1&&vn.y===1&&vn.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(Ys,$s,vn.set(1,1,1)).invert()}clone(){return new this.constructor().copy(this)}}const Yn=new O,Nl=new Se,Il=new Se;class dn extends uh{constructor(e=50,t=1,n=.1,s=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=n,this.far=s,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){const t=.5*this.getFilmHeight()/e;this.fov=fs*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){const e=Math.tan(is*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return fs*2*Math.atan(Math.tan(is*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,n){Yn.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(Yn.x,Yn.y).multiplyScalar(-e/Yn.z),Yn.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(Yn.x,Yn.y).multiplyScalar(-e/Yn.z)}getViewSize(e,t){return this.getViewBounds(e,Nl,Il),t.subVectors(Il,Nl)}setViewOffset(e,t,n,s,r,a){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=this.near;let t=e*Math.tan(is*.5*this.fov)/this.zoom,n=2*t,s=this.aspect*n,r=-.5*s;const a=this.view;if(this.view!==null&&this.view.enabled){const l=a.fullWidth,c=a.fullHeight;r+=a.offsetX*s/l,t-=a.offsetY*n/c,s*=a.width/l,n*=a.height/c}const o=this.filmOffset;o!==0&&(r+=e*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+s,t,t-n,e,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}}class dh extends uh{constructor(e=-1,t=1,n=1,s=-1,r=.1,a=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=n,this.bottom=s,this.near=r,this.far=a,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,n,s,r,a){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,s=(this.top+this.bottom)/2;let r=n-e,a=n+e,o=s+t,l=s-t;if(this.view!==null&&this.view.enabled){const c=(this.right-this.left)/this.view.fullWidth/this.zoom,u=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=c*this.view.offsetX,a=r+c*this.view.width,o-=u*this.view.offsetY,l=o-u*this.view.height}this.projectionMatrix.makeOrthographic(r,a,o,l,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}}class uf extends hf{constructor(){super(new dh(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}}class df extends hh{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(kt.DEFAULT_UP),this.updateMatrix(),this.target=new kt,this.shadow=new uf}dispose(){super.dispose(),this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}toJSON(e){const t=super.toJSON(e);return t.object.shadow=this.shadow.toJSON(),t.object.target=this.target.uuid,t}}const Ti=-90,Ai=1;class so extends kt{constructor(e,t,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;const s=new dn(Ti,Ai,e,t);s.layers=this.layers,this.add(s);const r=new dn(Ti,Ai,e,t);r.layers=this.layers,this.add(r);const a=new dn(Ti,Ai,e,t);a.layers=this.layers,this.add(a);const o=new dn(Ti,Ai,e,t);o.layers=this.layers,this.add(o);const l=new dn(Ti,Ai,e,t);l.layers=this.layers,this.add(l);const c=new dn(Ti,Ai,e,t);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){const e=this.coordinateSystem,t=this.children.concat(),[n,s,r,a,o,l]=t;for(const c of t)this.remove(c);if(e===mn)n.up.set(0,1,0),n.lookAt(1,0,0),s.up.set(0,1,0),s.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),a.up.set(0,0,1),a.lookAt(0,-1,0),o.up.set(0,1,0),o.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(e===ds)n.up.set(0,-1,0),n.lookAt(-1,0,0),s.up.set(0,-1,0),s.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),a.up.set(0,0,-1),a.lookAt(0,-1,0),o.up.set(0,-1,0),o.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(const c of t)this.add(c),c.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();const{renderTarget:n,activeMipmapLevel:s}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());const[r,a,o,l,c,u]=this.children,p=e.getRenderTarget(),d=e.getActiveCubeFace(),h=e.getActiveMipmapLevel(),f=e.xr.enabled;e.xr.enabled=!1;const _=n.texture.mipmapsAutoUpdate;n.texture.mipmapsAutoUpdate=!1;let m=!1;e.isWebGLRenderer===!0?m=e.state.buffers.depth.getReversed():m=e.reversedDepthBuffer,e.setRenderTarget(n,0,s),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,r),e.setRenderTarget(n,1,s),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,a),e.setRenderTarget(n,2,s),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,o),e.setRenderTarget(n,3,s),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,l),e.setRenderTarget(n,4,s),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,c),n.texture.mipmapsAutoUpdate=_,e.setRenderTarget(n,5,s),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,u),e.setRenderTarget(p,d,h),e.xr.enabled=f,n.texture.needsPMREMUpdate=!0}}class ff extends dn{constructor(e=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=e,this.perCameraFrustumCulled=!1}}function Ul(i,e,t,n){const s=pf(n);switch(t){case Oc:return i*e;case kc:return i*e/s.components*s.byteLength;case po:return i*e/s.components*s.byteLength;case ui:return i*e*2/s.components*s.byteLength;case mo:return i*e*2/s.components*s.byteLength;case Bc:return i*e*3/s.components*s.byteLength;case bn:return i*e*4/s.components*s.byteLength;case go:return i*e*4/s.components*s.byteLength;case tr:case nr:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*8;case ir:case sr:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case wa:case Aa:return Math.max(i,16)*Math.max(e,8)/4;case Ea:case Ta:return Math.max(i,8)*Math.max(e,8)/2;case Ra:case Ca:case La:case Da:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*8;case Pa:case cr:case Na:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case Ia:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case Ua:return Math.floor((i+4)/5)*Math.floor((e+3)/4)*16;case Fa:return Math.floor((i+4)/5)*Math.floor((e+4)/5)*16;case Oa:return Math.floor((i+5)/6)*Math.floor((e+4)/5)*16;case Ba:return Math.floor((i+5)/6)*Math.floor((e+5)/6)*16;case ka:return Math.floor((i+7)/8)*Math.floor((e+4)/5)*16;case za:return Math.floor((i+7)/8)*Math.floor((e+5)/6)*16;case Ga:return Math.floor((i+7)/8)*Math.floor((e+7)/8)*16;case Ha:return Math.floor((i+9)/10)*Math.floor((e+4)/5)*16;case Va:return Math.floor((i+9)/10)*Math.floor((e+5)/6)*16;case Wa:return Math.floor((i+9)/10)*Math.floor((e+7)/8)*16;case Xa:return Math.floor((i+9)/10)*Math.floor((e+9)/10)*16;case qa:return Math.floor((i+11)/12)*Math.floor((e+9)/10)*16;case Ya:return Math.floor((i+11)/12)*Math.floor((e+11)/12)*16;case $a:case Ka:case Za:return Math.ceil(i/4)*Math.ceil(e/4)*16;case Ja:case Qa:return Math.ceil(i/4)*Math.ceil(e/4)*8;case hr:case ja:return Math.ceil(i/4)*Math.ceil(e/4)*16}throw new Error(`Unable to determine texture byte length for ${t} format.`)}function pf(i){switch(i){case sn:case Nc:return{byteLength:1,components:1};case us:case Ic:case Tn:return{byteLength:2,components:1};case uo:case fo:return{byteLength:2,components:4};case wn:case ho:case yn:return{byteLength:4,components:1};case Uc:case Fc:return{byteLength:4,components:3}}throw new Error(`THREE.TextureUtils: Unknown texture type ${i}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:lo}}));typeof window<"u"&&(window.__THREE__?He("WARNING: Multiple instances of Three.js being imported."):window.__THREE__=lo);function fh(){let i=null,e=!1,t=null,n=null;function s(r,a){n=i.requestAnimationFrame(s),t(r,a)}return{start:function(){e!==!0&&t!==null&&i!==null&&(n=i.requestAnimationFrame(s),e=!0)},stop:function(){i!==null&&i.cancelAnimationFrame(n),e=!1},setAnimationLoop:function(r){t=r},setContext:function(r){i=r}}}function mf(i){const e=new WeakMap;function t(o,l){const c=o.array,u=o.usage,p=c.byteLength,d=i.createBuffer();i.bindBuffer(l,d),i.bufferData(l,c,u),o.onUploadCallback();let h;if(c instanceof Float32Array)h=i.FLOAT;else if(typeof Float16Array<"u"&&c instanceof Float16Array)h=i.HALF_FLOAT;else if(c instanceof Uint16Array)o.isFloat16BufferAttribute?h=i.HALF_FLOAT:h=i.UNSIGNED_SHORT;else if(c instanceof Int16Array)h=i.SHORT;else if(c instanceof Uint32Array)h=i.UNSIGNED_INT;else if(c instanceof Int32Array)h=i.INT;else if(c instanceof Int8Array)h=i.BYTE;else if(c instanceof Uint8Array)h=i.UNSIGNED_BYTE;else if(c instanceof Uint8ClampedArray)h=i.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+c);return{buffer:d,type:h,bytesPerElement:c.BYTES_PER_ELEMENT,version:o.version,size:p}}function n(o,l,c){const u=l.array,p=l.updateRanges;if(i.bindBuffer(c,o),p.length===0)i.bufferSubData(c,0,u);else{p.sort((h,f)=>h.start-f.start);let d=0;for(let h=1;h<p.length;h++){const f=p[d],_=p[h];_.start<=f.start+f.count+1?f.count=Math.max(f.count,_.start+_.count-f.start):(++d,p[d]=_)}p.length=d+1;for(let h=0,f=p.length;h<f;h++){const _=p[h];i.bufferSubData(c,_.start*u.BYTES_PER_ELEMENT,u,_.start,_.count)}l.clearUpdateRanges()}l.onUploadCallback()}function s(o){return o.isInterleavedBufferAttribute&&(o=o.data),e.get(o)}function r(o){o.isInterleavedBufferAttribute&&(o=o.data);const l=e.get(o);l&&(i.deleteBuffer(l.buffer),e.delete(o))}function a(o,l){if(o.isInterleavedBufferAttribute&&(o=o.data),o.isGLBufferAttribute){const u=e.get(o);(!u||u.version<o.version)&&e.set(o,{buffer:o.buffer,type:o.type,bytesPerElement:o.elementSize,version:o.version});return}const c=e.get(o);if(c===void 0)e.set(o,t(o,l));else if(c.version<o.version){if(c.size!==o.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");n(c.buffer,o,l),c.version=o.version}}return{get:s,remove:r,update:a}}var gf=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,_f=`#ifdef USE_ALPHAHASH
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
#endif`,vf=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,xf=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Mf=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,Sf=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,yf=`#ifdef USE_AOMAP
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
#endif`,bf=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,Ef=`#ifdef USE_BATCHING
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
#endif`,wf=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,Tf=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,Af=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,Rf=`float G_BlinnPhong_Implicit( ) {
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
} // validated`,Cf=`#ifdef USE_IRIDESCENCE
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
#endif`,Pf=`#ifdef USE_BUMPMAP
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
#endif`,Lf=`#if NUM_CLIPPING_PLANES > 0
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
#endif`,Df=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,Nf=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,If=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,Uf=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#endif`,Ff=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#endif`,Of=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec4 vColor;
#endif`,Bf=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
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
#endif`,kf=`#define PI 3.141592653589793
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
} // validated`,zf=`vec3 transformedNormal = objectNormal;
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
#endif`,Gf=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,Hf=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,Vf=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,Wf=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,Xf="gl_FragColor = linearToOutputTexel( gl_FragColor );",qf=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,Yf=`#ifdef USE_ENVMAP
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
#endif`,$f=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform mat3 envMapRotation;
	uniform samplerCube envMap;
	#ifdef ENVMAP_TYPE_PMREM
		float roughnessToMip( const in float roughness ) {
			float r = clamp( roughness, 0.0, 1.0 );
			return ENVMAP_MAX_LOD * r * ( 2.0 - r );
		}
	#endif
#endif`,Kf=`#ifdef USE_ENVMAP
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
#endif`,Zf=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,Jf=`#ifdef USE_ENVMAP
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
#endif`,Qf=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,jf=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,ep=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,tp=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,np=`#ifdef USE_GRADIENTMAP
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
}`,ip=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,sp=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,rp=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,ap=`uniform bool receiveShadow;
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
#include <lightprobes_pars_fragment>`,op=`#ifdef USE_ENVMAP
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
#endif`,lp=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,cp=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,hp=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,up=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,dp=`PhysicalMaterial material;
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
#endif`,fp=`uniform sampler2D dfgLUT;
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
}`,pp=`
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
#endif`,mp=`#if defined( RE_IndirectDiffuse )
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
#endif`,gp=`#if defined( RE_IndirectDiffuse )
	#if defined( LAMBERT ) || defined( PHONG )
		irradiance += iblIrradiance;
	#endif
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,_p=`#if NUM_LIGHT_PROBE_GRIDS > 0
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
#endif`,vp=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,xp=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Mp=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Sp=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,yp=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,bp=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,Ep=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
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
#endif`,wp=`#if defined( USE_POINTS_UV )
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
#endif`,Tp=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,Ap=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,Rp=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,Cp=`#if defined( USE_MORPHCOLORS )
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
#endif`,Pp=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Lp=`#ifdef USE_MORPHTARGETS
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
#endif`,Dp=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Np=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
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
vec3 nonPerturbedNormal = normal;`,Ip=`#ifdef USE_NORMALMAP_OBJECTSPACE
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
#endif`,Up=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Fp=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Op=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
		#ifdef FLIP_SIDED
			vBitangent = - vBitangent;
		#endif
	#endif
#endif`,Bp=`#ifdef USE_NORMALMAP
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
#endif`,kp=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,zp=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,Gp=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,Hp=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,Vp=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,Wp=`vec3 packNormalToRGB( const in vec3 normal ) {
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
}`,Xp=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,qp=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,Yp=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,$p=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,Kp=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,Zp=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,Jp=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,Qp=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,jp=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_SUN_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
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
#endif`,em=`float getShadowMask() {
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
}`,tm=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,nm=`#ifdef USE_SKINNING
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
#endif`,im=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,sm=`#ifdef USE_SKINNING
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
#endif`,rm=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,am=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,om=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,lm=`#ifndef saturate
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
vec3 CustomToneMapping( vec3 color ) { return color; }`,cm=`#ifdef USE_TRANSMISSION
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
#endif`,hm=`#ifdef USE_TRANSMISSION
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
#endif`,um=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,dm=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,fm=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,pm=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;const mm=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,gm=`uniform sampler2D t2D;
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
}`,_m=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,vm=`uniform float backgroundBlurriness;
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
}`,xm=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Mm=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Sm=`#include <common>
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
}`,ym=`#if DEPTH_PACKING == 3200
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
}`,bm=`#define DISTANCE
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
}`,Em=`#define DISTANCE
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
}`,wm=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,Tm=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Am=`uniform float scale;
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
}`,Rm=`uniform vec3 diffuse;
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
}`,Cm=`#include <common>
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
}`,Pm=`uniform vec3 diffuse;
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
}`,Lm=`#define LAMBERT
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
}`,Dm=`#define LAMBERT
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
}`,Nm=`#define MATCAP
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
}`,Im=`#define MATCAP
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
}`,Um=`#define NORMAL
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
}`,Fm=`#define NORMAL
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
}`,Om=`#define PHONG
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
}`,Bm=`#define PHONG
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
}`,km=`#define STANDARD
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
}`,zm=`#define STANDARD
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
}`,Gm=`#define TOON
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
}`,Hm=`#define TOON
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
}`,Vm=`uniform float size;
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
}`,Wm=`uniform vec3 diffuse;
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
}`,Xm=`#include <common>
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
}`,qm=`uniform vec3 color;
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
}`,Ym=`uniform float rotation;
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
}`,$m=`uniform vec3 diffuse;
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
}`,je={alphahash_fragment:gf,alphahash_pars_fragment:_f,alphamap_fragment:vf,alphamap_pars_fragment:xf,alphatest_fragment:Mf,alphatest_pars_fragment:Sf,aomap_fragment:yf,aomap_pars_fragment:bf,batching_pars_vertex:Ef,batching_vertex:wf,begin_vertex:Tf,beginnormal_vertex:Af,bsdfs:Rf,iridescence_fragment:Cf,bumpmap_pars_fragment:Pf,clipping_planes_fragment:Lf,clipping_planes_pars_fragment:Df,clipping_planes_pars_vertex:Nf,clipping_planes_vertex:If,color_fragment:Uf,color_pars_fragment:Ff,color_pars_vertex:Of,color_vertex:Bf,common:kf,defaultnormal_vertex:zf,displacementmap_pars_vertex:Gf,displacementmap_vertex:Hf,emissivemap_fragment:Vf,emissivemap_pars_fragment:Wf,colorspace_fragment:Xf,colorspace_pars_fragment:qf,envmap_fragment:Yf,envmap_common_pars_fragment:$f,envmap_pars_fragment:Kf,envmap_pars_vertex:Zf,envmap_physical_pars_fragment:op,envmap_vertex:Jf,fog_vertex:Qf,fog_pars_vertex:jf,fog_fragment:ep,fog_pars_fragment:tp,gradientmap_pars_fragment:np,lightmap_pars_fragment:ip,lights_lambert_fragment:sp,lights_lambert_pars_fragment:rp,lights_pars_begin:ap,lights_toon_fragment:lp,lights_toon_pars_fragment:cp,lights_phong_fragment:hp,lights_phong_pars_fragment:up,lights_physical_fragment:dp,lights_physical_pars_fragment:fp,lights_fragment_begin:pp,lights_fragment_maps:mp,lights_fragment_end:gp,lightprobes_pars_fragment:_p,logdepthbuf_fragment:vp,logdepthbuf_pars_fragment:xp,logdepthbuf_pars_vertex:Mp,logdepthbuf_vertex:Sp,map_fragment:yp,map_pars_fragment:bp,map_particle_fragment:Ep,map_particle_pars_fragment:wp,metalnessmap_fragment:Tp,metalnessmap_pars_fragment:Ap,morphinstance_vertex:Rp,morphcolor_vertex:Cp,morphnormal_vertex:Pp,morphtarget_pars_vertex:Lp,morphtarget_vertex:Dp,normal_fragment_begin:Np,normal_fragment_maps:Ip,normal_pars_fragment:Up,normal_pars_vertex:Fp,normal_vertex:Op,normalmap_pars_fragment:Bp,clearcoat_normal_fragment_begin:kp,clearcoat_normal_fragment_maps:zp,clearcoat_pars_fragment:Gp,iridescence_pars_fragment:Hp,opaque_fragment:Vp,packing:Wp,premultiplied_alpha_fragment:Xp,project_vertex:qp,dithering_fragment:Yp,dithering_pars_fragment:$p,roughnessmap_fragment:Kp,roughnessmap_pars_fragment:Zp,shadowmap_pars_fragment:Jp,shadowmap_pars_vertex:Qp,shadowmap_vertex:jp,shadowmask_pars_fragment:em,skinbase_vertex:tm,skinning_pars_vertex:nm,skinning_vertex:im,skinnormal_vertex:sm,specularmap_fragment:rm,specularmap_pars_fragment:am,tonemapping_fragment:om,tonemapping_pars_fragment:lm,transmission_fragment:cm,transmission_pars_fragment:hm,uv_pars_fragment:um,uv_pars_vertex:dm,uv_vertex:fm,worldpos_vertex:pm,background_vert:mm,background_frag:gm,backgroundCube_vert:_m,backgroundCube_frag:vm,cube_vert:xm,cube_frag:Mm,depth_vert:Sm,depth_frag:ym,distance_vert:bm,distance_frag:Em,equirect_vert:wm,equirect_frag:Tm,linedashed_vert:Am,linedashed_frag:Rm,meshbasic_vert:Cm,meshbasic_frag:Pm,meshlambert_vert:Lm,meshlambert_frag:Dm,meshmatcap_vert:Nm,meshmatcap_frag:Im,meshnormal_vert:Um,meshnormal_frag:Fm,meshphong_vert:Om,meshphong_frag:Bm,meshphysical_vert:km,meshphysical_frag:zm,meshtoon_vert:Gm,meshtoon_frag:Hm,points_vert:Vm,points_frag:Wm,shadow_vert:Xm,shadow_frag:qm,sprite_vert:Ym,sprite_frag:$m},be={common:{diffuse:{value:new Ve(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Xe},alphaMap:{value:null},alphaMapTransform:{value:new Xe},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Xe}},envmap:{envMap:{value:null},envMapRotation:{value:new Xe},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Xe}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Xe}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Xe},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Xe},normalScale:{value:new Se(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Xe},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Xe}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Xe}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Xe}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new Ve(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},sunLights:{value:[],properties:{direction:{},color:{}}},sunLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},sunShadowMatrix:{value:[]},sunShadowCascade:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null},probesSH:{value:[]},probesMin:{value:[]},probesMax:{value:[]},probesResolution:{value:[]}},points:{diffuse:{value:new Ve(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Xe},alphaTest:{value:0},uvTransform:{value:new Xe}},sprite:{diffuse:{value:new Ve(16777215)},opacity:{value:1},center:{value:new Se(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Xe},alphaMap:{value:null},alphaMapTransform:{value:new Xe},alphaTest:{value:0}}},Mn={basic:{uniforms:Yt([be.common,be.specularmap,be.envmap,be.aomap,be.lightmap,be.fog]),vertexShader:je.meshbasic_vert,fragmentShader:je.meshbasic_frag},lambert:{uniforms:Yt([be.common,be.specularmap,be.envmap,be.aomap,be.lightmap,be.emissivemap,be.bumpmap,be.normalmap,be.displacementmap,be.fog,be.lights,{emissive:{value:new Ve(0)},envMapIntensity:{value:1}}]),vertexShader:je.meshlambert_vert,fragmentShader:je.meshlambert_frag},phong:{uniforms:Yt([be.common,be.specularmap,be.envmap,be.aomap,be.lightmap,be.emissivemap,be.bumpmap,be.normalmap,be.displacementmap,be.fog,be.lights,{emissive:{value:new Ve(0)},specular:{value:new Ve(1118481)},shininess:{value:30},envMapIntensity:{value:1}}]),vertexShader:je.meshphong_vert,fragmentShader:je.meshphong_frag},standard:{uniforms:Yt([be.common,be.envmap,be.aomap,be.lightmap,be.emissivemap,be.bumpmap,be.normalmap,be.displacementmap,be.roughnessmap,be.metalnessmap,be.fog,be.lights,{emissive:{value:new Ve(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:je.meshphysical_vert,fragmentShader:je.meshphysical_frag},toon:{uniforms:Yt([be.common,be.aomap,be.lightmap,be.emissivemap,be.bumpmap,be.normalmap,be.displacementmap,be.gradientmap,be.fog,be.lights,{emissive:{value:new Ve(0)}}]),vertexShader:je.meshtoon_vert,fragmentShader:je.meshtoon_frag},matcap:{uniforms:Yt([be.common,be.bumpmap,be.normalmap,be.displacementmap,be.fog,{matcap:{value:null}}]),vertexShader:je.meshmatcap_vert,fragmentShader:je.meshmatcap_frag},points:{uniforms:Yt([be.points,be.fog]),vertexShader:je.points_vert,fragmentShader:je.points_frag},dashed:{uniforms:Yt([be.common,be.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:je.linedashed_vert,fragmentShader:je.linedashed_frag},depth:{uniforms:Yt([be.common,be.displacementmap]),vertexShader:je.depth_vert,fragmentShader:je.depth_frag},normal:{uniforms:Yt([be.common,be.bumpmap,be.normalmap,be.displacementmap,{opacity:{value:1}}]),vertexShader:je.meshnormal_vert,fragmentShader:je.meshnormal_frag},sprite:{uniforms:Yt([be.sprite,be.fog]),vertexShader:je.sprite_vert,fragmentShader:je.sprite_frag},background:{uniforms:{uvTransform:{value:new Xe},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:je.background_vert,fragmentShader:je.background_frag},backgroundCube:{uniforms:{envMap:{value:null},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new Xe}},vertexShader:je.backgroundCube_vert,fragmentShader:je.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:je.cube_vert,fragmentShader:je.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:je.equirect_vert,fragmentShader:je.equirect_frag},distance:{uniforms:Yt([be.common,be.displacementmap,{referencePosition:{value:new O},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:je.distance_vert,fragmentShader:je.distance_frag},shadow:{uniforms:Yt([be.lights,be.fog,{color:{value:new Ve(0)},opacity:{value:1}}]),vertexShader:je.shadow_vert,fragmentShader:je.shadow_frag}};Mn.physical={uniforms:Yt([Mn.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Xe},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Xe},clearcoatNormalScale:{value:new Se(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Xe},diffuseRoughness:{value:0},diffuseRoughnessMap:{value:null},diffuseRoughnessMapTransform:{value:new Xe},dispersion:{value:0},retroreflectivity:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Xe},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Xe},sheen:{value:0},sheenColor:{value:new Ve(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Xe},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Xe},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Xe},transmissionSamplerSize:{value:new Se},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Xe},attenuationDistance:{value:0},attenuationColor:{value:new Ve(0)},specularColor:{value:new Ve(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Xe},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Xe},anisotropyVector:{value:new Se},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Xe}}]),vertexShader:je.meshphysical_vert,fragmentShader:je.meshphysical_frag};const Ks={r:0,b:0,g:0},Km=new xt,ph=new Xe;ph.set(-1,0,0,0,1,0,0,0,1);function Zm(i,e,t,n,s,r){const a=new Ve(0);let o=s===!0?0:1,l,c,u=null,p=0,d=null;function h(x){let S=x.isScene===!0?x.background:null;if(S&&S.isTexture){const M=x.backgroundBlurriness>0;S=e.get(S,M)}return S}function f(x){let S=!1;const M=h(x);M===null?m(a,o):M&&M.isColor&&(m(M,1),S=!0);const w=i.xr.getEnvironmentBlendMode();w==="additive"?t.buffers.color.setClear(0,0,0,1,r):w==="alpha-blend"&&t.buffers.color.setClear(0,0,0,0,r),(i.autoClear||S)&&(t.buffers.depth.setTest(!0),t.buffers.depth.setMask(!0),t.buffers.color.setMask(!0),i.clear(i.autoClearColor,i.autoClearDepth,i.autoClearStencil))}function _(x,S){const M=h(S);M&&M.isCubeTexture?(c===void 0&&(c=new zt(new kn(1,1,1),new fi({name:"BackgroundCubeMaterial",uniforms:Bi(Mn.backgroundCube.uniforms),vertexShader:Mn.backgroundCube.vertexShader,fragmentShader:Mn.backgroundCube.fragmentShader,side:Qt,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute("normal"),c.geometry.deleteAttribute("uv"),c.onBeforeRender=function(w,T,v){this.matrixWorld.copyPosition(v.matrixWorld)},Object.defineProperty(c.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),n.update(c)),c.material.uniforms.envMap.value=M,c.material.uniforms.backgroundBlurriness.value=S.backgroundBlurriness,c.material.uniforms.backgroundIntensity.value=S.backgroundIntensity,c.material.uniforms.backgroundRotation.value.setFromMatrix4(Km.makeRotationFromEuler(S.backgroundRotation)).transpose(),M.isRenderTargetTexture===!1&&c.material.uniforms.backgroundRotation.value.premultiply(ph),c.material.toneMapped=at.getTransfer(M.colorSpace)!==dt,(u!==M||p!==M.version||d!==i.toneMapping)&&(c.material.needsUpdate=!0,u=M,p=M.version,d=i.toneMapping),c.layers.enableAll(),x.unshift(c,c.geometry,c.material,0,0,null)):M&&M.isTexture&&(l===void 0&&(l=new zt(new br(2,2),new fi({name:"BackgroundMaterial",uniforms:Bi(Mn.background.uniforms),vertexShader:Mn.background.vertexShader,fragmentShader:Mn.background.fragmentShader,side:hi,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),l.geometry.deleteAttribute("normal"),Object.defineProperty(l.material,"map",{get:function(){return this.uniforms.t2D.value}}),n.update(l)),l.material.uniforms.t2D.value=M,l.material.uniforms.backgroundIntensity.value=S.backgroundIntensity,l.material.toneMapped=at.getTransfer(M.colorSpace)!==dt,M.matrixAutoUpdate===!0&&M.updateMatrix(),l.material.uniforms.uvTransform.value.copy(M.matrix),(u!==M||p!==M.version||d!==i.toneMapping)&&(l.material.needsUpdate=!0,u=M,p=M.version,d=i.toneMapping),l.layers.enableAll(),x.unshift(l,l.geometry,l.material,0,0,null))}function m(x,S){x.getRGB(Ks,ch(i)),t.buffers.color.setClear(Ks.r,Ks.g,Ks.b,S,r)}function g(){c!==void 0&&(c.geometry.dispose(),c.material.dispose(),c=void 0),l!==void 0&&(l.geometry.dispose(),l.material.dispose(),l=void 0)}return{getClearColor:function(){return a},setClearColor:function(x,S=1){a.set(x),o=S,m(a,o)},getClearAlpha:function(){return o},setClearAlpha:function(x){o=x,m(a,o)},render:f,addToRenderList:_,dispose:g}}function Jm(i,e){const t=i.getParameter(i.MAX_VERTEX_ATTRIBS),n={},s=d(null);let r=s,a=!1;function o(P,F,z,L,G){let X=!1;const B=p(P,L,z,F);r!==B&&(r=B,c(r.object)),X=h(P,L,z,G),X&&f(P,L,z,G),G!==null&&e.update(G,i.ELEMENT_ARRAY_BUFFER),(X||a)&&(a=!1,M(P,F,z,L),G!==null&&i.bindBuffer(i.ELEMENT_ARRAY_BUFFER,e.get(G).buffer))}function l(){return i.createVertexArray()}function c(P){return i.bindVertexArray(P)}function u(P){return i.deleteVertexArray(P)}function p(P,F,z,L){const G=L.wireframe===!0;let X=n[F.id];X===void 0&&(X={},n[F.id]=X);const B=P.isInstancedMesh===!0?P.id:0;let ne=X[B];ne===void 0&&(ne={},X[B]=ne);let q=ne[z.id];q===void 0&&(q={},ne[z.id]=q);let ee=q[G];return ee===void 0&&(ee=d(l()),q[G]=ee),ee}function d(P){const F=[],z=[],L=[];for(let G=0;G<t;G++)F[G]=0,z[G]=0,L[G]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:F,enabledAttributes:z,attributeDivisors:L,object:P,attributes:{},index:null}}function h(P,F,z,L){const G=r.attributes,X=F.attributes;let B=0;const ne=z.getAttributes();for(const q in ne)if(ne[q].location>=0){const se=G[q];let Te=X[q];if(Te===void 0&&(q==="instanceMatrix"&&P.instanceMatrix&&(Te=P.instanceMatrix),q==="instanceColor"&&P.instanceColor&&(Te=P.instanceColor)),se===void 0||se.attribute!==Te||Te&&se.data!==Te.data)return!0;B++}return r.attributesNum!==B||r.index!==L}function f(P,F,z,L){const G={},X=F.attributes;let B=0;const ne=z.getAttributes();for(const q in ne)if(ne[q].location>=0){let se=X[q];se===void 0&&(q==="instanceMatrix"&&P.instanceMatrix&&(se=P.instanceMatrix),q==="instanceColor"&&P.instanceColor&&(se=P.instanceColor));const Te={};Te.attribute=se,se&&se.data&&(Te.data=se.data),G[q]=Te,B++}r.attributes=G,r.attributesNum=B,r.index=L}function _(){const P=r.newAttributes;for(let F=0,z=P.length;F<z;F++)P[F]=0}function m(P){g(P,0)}function g(P,F){const z=r.newAttributes,L=r.enabledAttributes,G=r.attributeDivisors;z[P]=1,L[P]===0&&(i.enableVertexAttribArray(P),L[P]=1),G[P]!==F&&(i.vertexAttribDivisor(P,F),G[P]=F)}function x(){const P=r.newAttributes,F=r.enabledAttributes;for(let z=0,L=F.length;z<L;z++)F[z]!==P[z]&&(i.disableVertexAttribArray(z),F[z]=0)}function S(P,F,z,L,G,X,B){B===!0?i.vertexAttribIPointer(P,F,z,G,X):i.vertexAttribPointer(P,F,z,L,G,X)}function M(P,F,z,L){_();const G=L.attributes,X=z.getAttributes(),B=F.defaultAttributeValues;for(const ne in X){const q=X[ne];if(q.location>=0){let ee=G[ne];if(ee===void 0&&(ne==="instanceMatrix"&&P.instanceMatrix&&(ee=P.instanceMatrix),ne==="instanceColor"&&P.instanceColor&&(ee=P.instanceColor)),ee!==void 0){const se=ee.normalized,Te=ee.itemSize,Fe=e.get(ee);if(Fe===void 0)continue;const K=Fe.buffer,ge=Fe.type,Ae=Fe.bytesPerElement,Ue=ge===i.INT||ge===i.UNSIGNED_INT||ee.gpuType===ho;if(ee.isInterleavedBufferAttribute){const Me=ee.data,Oe=Me.isInterleavedBuffer===!0?Me.stride:Me.itemSize,pt=ee.offset;if(Me.isInstancedInterleavedBuffer||Me.isInstancedBufferAttribute){for(let ze=0;ze<q.locationSize;ze++)g(q.location+ze,Me.meshPerAttribute);P.isInstancedMesh!==!0&&L._maxInstanceCount===void 0&&(L._maxInstanceCount=Me.meshPerAttribute*Me.count)}else for(let ze=0;ze<q.locationSize;ze++)m(q.location+ze);i.bindBuffer(i.ARRAY_BUFFER,K);for(let ze=0;ze<q.locationSize;ze++)S(q.location+ze,Te/q.locationSize,ge,se,Oe*Ae,(pt+Te/q.locationSize*ze)*Ae,Ue)}else{if(ee.isInstancedBufferAttribute){for(let Me=0;Me<q.locationSize;Me++)g(q.location+Me,ee.meshPerAttribute);P.isInstancedMesh!==!0&&L._maxInstanceCount===void 0&&(L._maxInstanceCount=ee.meshPerAttribute*ee.count)}else for(let Me=0;Me<q.locationSize;Me++)m(q.location+Me);i.bindBuffer(i.ARRAY_BUFFER,K);for(let Me=0;Me<q.locationSize;Me++)S(q.location+Me,Te/q.locationSize,ge,se,Te*Ae,Te/q.locationSize*Me*Ae,Ue)}}else if(B!==void 0){const se=B[ne];if(se!==void 0)switch(se.length){case 2:i.vertexAttrib2fv(q.location,se);break;case 3:i.vertexAttrib3fv(q.location,se);break;case 4:i.vertexAttrib4fv(q.location,se);break;default:i.vertexAttrib1fv(q.location,se)}}}}x()}function w(){C();for(const P in n){const F=n[P];for(const z in F){const L=F[z];for(const G in L){const X=L[G];for(const B in X)u(X[B].object),delete X[B];delete L[G]}}delete n[P]}}function T(P){if(n[P.id]===void 0)return;const F=n[P.id];for(const z in F){const L=F[z];for(const G in L){const X=L[G];for(const B in X)u(X[B].object),delete X[B];delete L[G]}}delete n[P.id]}function v(P){for(const F in n){const z=n[F];for(const L in z){const G=z[L];if(G[P.id]===void 0)continue;const X=G[P.id];for(const B in X)u(X[B].object),delete X[B];delete G[P.id]}}}function y(P){for(const F in n){const z=n[F],L=P.isInstancedMesh===!0?P.id:0,G=z[L];if(G!==void 0){for(const X in G){const B=G[X];for(const ne in B)u(B[ne].object),delete B[ne];delete G[X]}delete z[L],Object.keys(z).length===0&&delete n[F]}}}function C(){R(),a=!0,r!==s&&(r=s,c(r.object))}function R(){s.geometry=null,s.program=null,s.wireframe=!1}return{setup:o,reset:C,resetDefaultState:R,dispose:w,releaseStatesOfGeometry:T,releaseStatesOfObject:y,releaseStatesOfProgram:v,initAttributes:_,enableAttribute:m,disableUnusedAttributes:x}}function Qm(i,e,t){let n;function s(l){n=l}function r(l,c){i.drawArrays(n,l,c),t.update(c,n,1)}function a(l,c,u){u!==0&&(i.drawArraysInstanced(n,l,c,u),t.update(c,n,u))}function o(l,c,u){if(u===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(n,l,0,c,0,u);let d=0;for(let h=0;h<u;h++)d+=c[h];t.update(d,n,1)}this.setMode=s,this.render=r,this.renderInstances=a,this.renderMultiDraw=o}function jm(i,e,t,n){let s;function r(){if(s!==void 0)return s;if(e.has("EXT_texture_filter_anisotropic")===!0){const v=e.get("EXT_texture_filter_anisotropic");s=i.getParameter(v.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else s=0;return s}function a(v){return!(v!==bn&&n.convert(v)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_FORMAT))}function o(v){const y=v===Tn&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(v!==sn&&v!==yn&&!y&&n.convert(v)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_TYPE))}function l(v){if(v==="highp"){if(i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.HIGH_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.HIGH_FLOAT).precision>0)return"highp";v="mediump"}return v==="mediump"&&i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.MEDIUM_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let c=t.precision!==void 0?t.precision:"highp";const u=l(c);u!==c&&(He("WebGLRenderer:",c,"not supported, using",u,"instead."),c=u);const p=t.reversedDepthBuffer===!0&&e.has("EXT_clip_control"),d=t.logarithmicDepthBuffer===!0&&p===!1;t.reversedDepthBuffer===!0&&p===!1&&He("WebGLRenderer: Unable to use reversed depth buffer due to missing EXT_clip_control extension. Fallback to default depth buffer."),t.logarithmicDepthBuffer===!0&&p===!0&&He("WebGLRenderer: Logarithmic depth buffer is ignored when reversed depth buffer is enabled.");const h=i.getParameter(i.MAX_TEXTURE_IMAGE_UNITS),f=i.getParameter(i.MAX_VERTEX_TEXTURE_IMAGE_UNITS),_=i.getParameter(i.MAX_TEXTURE_SIZE),m=i.getParameter(i.MAX_CUBE_MAP_TEXTURE_SIZE),g=i.getParameter(i.MAX_VERTEX_ATTRIBS),x=i.getParameter(i.MAX_VERTEX_UNIFORM_VECTORS),S=i.getParameter(i.MAX_VARYING_VECTORS),M=i.getParameter(i.MAX_FRAGMENT_UNIFORM_VECTORS),w=i.getParameter(i.MAX_SAMPLES),T=i.getParameter(i.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:l,textureFormatReadable:a,textureTypeReadable:o,precision:c,logarithmicDepthBuffer:d,reversedDepthBuffer:p,maxTextures:h,maxVertexTextures:f,maxTextureSize:_,maxCubemapSize:m,maxAttributes:g,maxVertexUniforms:x,maxVaryings:S,maxFragmentUniforms:M,maxSamples:w,samples:T}}function e0(i){const e=this;let t=null,n=0,s=!1,r=!1;const a=new $n,o=new Xe,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(p,d){const h=p.length!==0||d||n!==0||s;return s=d,n=p.length,h},this.beginShadows=function(){r=!0,u(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(p,d){t=u(p,d,0)},this.setState=function(p,d,h){const f=p.clippingPlanes,_=p.clipIntersection,m=p.clipShadows,g=i.get(p);if(!s||f===null||f.length===0||r&&!m)r?u(null):c();else{const x=r?0:n,S=x*4;let M=g.clippingState||null;l.value=M,M=u(f,d,S,h);for(let w=0;w!==S;++w)M[w]=t[w];g.clippingState=M,this.numIntersection=_?this.numPlanes:0,this.numPlanes+=x}};function c(){l.value!==t&&(l.value=t,l.needsUpdate=n>0),e.numPlanes=n,e.numIntersection=0}function u(p,d,h,f){const _=p!==null?p.length:0;let m=null;if(_!==0){if(m=l.value,f!==!0||m===null){const g=h+_*4,x=d.matrixWorldInverse;o.getNormalMatrix(x),(m===null||m.length<g)&&(m=new Float32Array(g));for(let S=0,M=h;S!==_;++S,M+=4)a.copy(p[S]).applyMatrix4(x,o),a.normal.toArray(m,M),m[M+3]=a.constant}l.value=m,l.needsUpdate=!0}return e.numPlanes=_,e.numIntersection=0,m}}class Co extends En{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;const n={width:e,height:e,depth:1},s=[n,n,n,n,n,n];this.texture=new Qc(s),this._setTextureOptions(t),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;const n={uniforms:{tEquirect:{value:null}},vertexShader:`

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
			`},s=new kn(5,5,5),r=new fi({name:"CubemapFromEquirect",uniforms:Bi(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:Qt,blending:Li});r.uniforms.tEquirect.value=t;const a=new zt(s,r),o=t.minFilter;return t.minFilter===Zn&&(t.minFilter=Jt),new so(1,10,this).update(e,a),t.minFilter=o,a.geometry.dispose(),a.material.dispose(),this}clear(e,t=!0,n=!0,s=!0){const r=e.getRenderTarget();for(let a=0;a<6;a++)e.setRenderTarget(this,a),e.clear(t,n,s);e.setRenderTarget(r)}}const Fl=256,t0=3,n0=20,mh=256,gh=16,i0=3,s0=new O,r0=new Ve;class gr{constructor(e){this._renderer=e,this._cubeSize=0,this._sourceTarget=null,this._cubeCamera=new so(1,10,null),this._boxMesh=new zt(new kn(5,5,5),null),this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null,this._integrationMaterial=null}fromScene(e,t=0,n=.1,s=100,r={}){const{size:a=256,position:o=s0}=r,l=this._renderer;this._setSize(a);const c=this._allocateTarget(),u=this._getSourceTarget(!0);t>0&&(u.texture.mipmapsAutoUpdate=!1);const p=l.autoClear,d=l.autoClearColor,h=l.autoClearDepth,f=l.autoClearStencil,_=e.background;l.autoClear=!0,l.autoClearColor=!0,l.autoClearDepth=!0,l.autoClearStencil=!0,_===null&&(e.background=l.getClearColor(r0));const m=new so(n,s,u);return m.position.copy(o),m.update(l,e),l.autoClear=p,l.autoClearColor=d,l.autoClearDepth=h,l.autoClearStencil=f,e.background=_,t>0&&(u.texture.mipmapsAutoUpdate=!0,this._blur(c,t)),this._applyPMREM(c),c}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=kl(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=Bl(),this._compileMaterial(this._equirectMaterial))}dispose(){this._sourceTarget!==null&&this._sourceTarget.dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._integrationMaterial!==null&&this._integrationMaterial.dispose(),this._boxMesh.geometry.dispose()}static lodToRoughness(e,t){return t>0?1-Math.sqrt(1-e/t):0}_setSize(e){this._cubeSize=Math.max(Fl,Wc(e))}_fromTexture(e,t){e.mapping===Ii||e.mapping===hs?this._setSize(e.image.length===0?Fl:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4);const n=t||this._allocateTarget();return this._textureToCubemap(e),this._applyPMREM(n),n}_allocateTarget(){const e=this._cubeSize,t=Ol(e,!1,!1),n=Math.log2(e)-t0;for(let s=0;s<=n;s++)t.texture.mipmaps.push({width:e>>s,height:e>>s});return t.texture.name="PMREM",t.texture.isPMREMTexture=!0,t}_getSourceTarget(e=!1){const t=this._cubeSize,n=this._sourceTarget;return(n===null||n.width!==t||e&&n.depthBuffer===!1)&&(n!==null&&n.dispose(),this._sourceTarget=Ol(t,!0,e)),this._sourceTarget}_compileMaterial(e){this._boxMesh.material=e,this._renderer.compile(this._boxMesh,this._cubeCamera.children[0])}_renderCube(e,t,n){const s=this._boxMesh,r=this._cubeCamera;s.material=n,r.renderTarget=e,r.activeMipmapLevel=t;const a=e.width>>t;e.viewport.set(0,0,a,a),r.update(this._renderer,s),e.viewport.set(0,0,e.width,e.height)}_textureToCubemap(e){let t;e.mapping===Ii||e.mapping===hs?(this._cubemapMaterial===null&&(this._cubemapMaterial=kl()),t=this._cubemapMaterial,t.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):(this._equirectMaterial===null&&(this._equirectMaterial=Bl()),t=this._equirectMaterial),t.uniforms.envMap.value=e,this._renderCube(this._getSourceTarget(),0,t)}_applyPMREM(e){this._ggxMaterial===null&&(this._ggxMaterial=a0(),this._integrationMaterial=o0());const t=this._cubeSize,n=e.texture.mipmaps.length-1,s=this._ggxMaterial.uniforms;s.envMap.value=this._sourceTarget.texture;const r=this._integrationMaterial.uniforms;r.envMap.value=this._sourceTarget.texture,r.sourceLod.value=Math.log2(t/gh);for(let a=0;a<=n;a++){const o=gr.lodToRoughness(a,n);if(a>n-i0)r.roughness.value=o,this._renderCube(e,a,this._integrationMaterial);else{const l=o>0?Math.log2(t)+.5*Math.log2(6/(mh*Math.pow(o,4)))+.5:0;s.roughness.value=o,s.lodBias.value=l,this._renderCube(e,a,this._ggxMaterial)}}}_blur(e,t){this._blurMaterial===null&&(this._blurMaterial=l0());const n=this._blurMaterial,s=n.uniforms,r=this._sourceTarget;s.sigma.value=Math.min(t,Math.PI)/Math.SQRT2,s.envMap.value=r.texture,this._renderCube(e,0,n),s.envMap.value=e.texture,this._renderCube(r,0,n)}}function Ol(i,e,t){return new Co(i,{minFilter:Zn,generateMipmaps:e,type:Tn,colorSpace:ur,depthBuffer:t})}function ys(i,e,t){return new fi({name:i,uniforms:e,vertexShader:je.cube_vert,fragmentShader:t,side:Qt,blending:Li,depthTest:!1,depthWrite:!1})}function a0(){return ys("PMREMGGXConvolution",{envMap:{value:null},roughness:{value:0},lodBias:{value:0}},`

		#define GGX_SAMPLES ${mh}u

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
	`)}function o0(){return ys("PMREMGGXIntegration",{envMap:{value:null},roughness:{value:0},sourceLod:{value:0},sourceSize:{value:gh}},`

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
	`)}function l0(){return ys("PMREMSphericalGaussianBlur",{envMap:{value:null},sigma:{value:0}},`

		#define SAMPLES ${n0}
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
	`)}function Bl(){return ys("PMREMEquirectangularToCubemap",{envMap:{value:null}},`

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
	`)}function kl(){return ys("PMREMCubemapToCubemap",{envMap:{value:null},flipEnvMap:{value:-1}},`

		varying vec3 vWorldDirection;

		uniform samplerCube envMap;
		uniform float flipEnvMap;

		void main() {

			gl_FragColor = vec4( textureCube( envMap, vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) ).rgb, 1.0 );

		}
	`)}function c0(i){let e=new WeakMap,t=new WeakMap,n=null;function s(d,h=!1){return d==null?null:h?a(d):r(d)}function r(d){if(d&&d.isTexture){const h=d.mapping;if(h===Pr||h===Lr)if(e.has(d)){const f=e.get(d).texture;return o(f,d.mapping)}else{const f=d.image;if(f&&f.height>0){const _=new Co(f.height);return _.fromEquirectangularTexture(i,d),e.set(d,_),d.addEventListener("dispose",c),o(_.texture,d.mapping)}else return null}}return d}function a(d){if(d&&d.isTexture&&d.isPMREMTexture!==!0){const h=d.mapping,f=h===Pr||h===Lr,_=h===Ii||h===hs;if(f||_){let m=t.get(d);const g=m!==void 0?m.texture.pmremVersion:0;if(d.isRenderTargetTexture&&d.pmremVersion!==g)return n===null&&(n=new gr(i)),m=f?n.fromEquirectangular(d,m):n.fromCubemap(d,m),m.texture.pmremVersion=d.pmremVersion,t.set(d,m),m.texture;if(m!==void 0)return m.texture;{const x=d.image;return f&&x&&x.height>0||_&&x&&l(x)?(n===null&&(n=new gr(i)),m=f?n.fromEquirectangular(d):n.fromCubemap(d),m.texture.pmremVersion=d.pmremVersion,t.set(d,m),d.addEventListener("dispose",u),m.texture):null}}}return d}function o(d,h){return h===Pr?d.mapping=Ii:h===Lr&&(d.mapping=hs),d}function l(d){let h=0;const f=6;for(let _=0;_<f;_++)d[_]!==void 0&&h++;return h===f}function c(d){const h=d.target;h.removeEventListener("dispose",c);const f=e.get(h);f!==void 0&&(e.delete(h),f.dispose())}function u(d){const h=d.target;h.removeEventListener("dispose",u);const f=t.get(h);f!==void 0&&(t.delete(h),f.dispose())}function p(){e=new WeakMap,t=new WeakMap,n!==null&&(n.dispose(),n=null)}return{get:s,dispose:p}}function h0(i){const e={};function t(n){if(e[n]!==void 0)return e[n];const s=i.getExtension(n);return e[n]=s,s}return{has:function(n){return t(n)!==null},init:function(){t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance"),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture"),t("WEBGL_render_shared_exponent")},get:function(n){const s=t(n);return s===null&&rr("WebGLRenderer: "+n+" extension not supported."),s}}}function u0(i,e,t,n){const s={},r=new WeakMap,a=new FinalizationRegistry(f=>delete s[f]);function o(f){l(f.target)}function l(f){f.index!==null&&e.remove(f.index);for(const m in f.attributes)e.remove(f.attributes[m]);f.removeEventListener("dispose",o),delete s[f.id],a.unregister(f);const _=r.get(f);_&&(e.remove(_),r.delete(f)),n.releaseStatesOfGeometry(f),f.isInstancedBufferGeometry===!0&&delete f._maxInstanceCount,t.memory.geometries--}function c(f,_){return s[_.id]!==void 0||(_.addEventListener("dispose",o),s[_.id]=new WeakRef(_),a.register(_,_.id,_),t.memory.geometries++),_}function u(f){const _=f.attributes;for(const m in _)e.update(_[m],i.ARRAY_BUFFER)}function p(f){const _=f.index,m=f.attributes.position;let g=0;if(m===void 0)return;const x=_!==null?_.array.length:m.array.length/3-1,S=m.count>=65535?Jc:Zc,M=new S(Math.ceil(x/3)*6,1),w=M.array;if(_!==null){const v=_.array;g=_.version;for(let y=0,C=0;y<x;y+=3){const R=v[y+0],P=v[y+1],F=v[y+2];w[C++]=R,w[C++]=P,w[C++]=P,w[C++]=F,w[C++]=F,w[C++]=R}}else{g=m.version;for(let v=0,y=0;v<x;v+=3){const C=v+0,R=v+1,P=v+2;w[y++]=C,w[y++]=R,w[y++]=R,w[y++]=P,w[y++]=P,w[y++]=C}}M.version=g;const T=r.get(f);T&&e.remove(T),r.set(f,M)}function d(f){const _=r.get(f);if(_){const m=f.index;m!==null&&_.version<m.version&&p(f)}else p(f);return r.get(f)}function h(){for(const f in s){const _=s[f].deref();_!==void 0&&l(_)}}return{get:c,update:u,getWireframeAttribute:d,dispose:h}}function d0(i,e,t){let n;function s(p){n=p}let r,a;function o(p){r=p.type,a=p.bytesPerElement}function l(p,d){i.drawElements(n,d,r,p*a),t.update(d,n,1)}function c(p,d,h){h!==0&&(i.drawElementsInstanced(n,d,r,p*a,h),t.update(d,n,h))}function u(p,d,h){if(h===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(n,d,0,r,p,0,h);let _=0;for(let m=0;m<h;m++)_+=d[m];t.update(_,n,1)}this.setMode=s,this.setIndex=o,this.render=l,this.renderInstances=c,this.renderMultiDraw=u}function f0(i){const e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function n(r,a,o){switch(t.calls++,a){case i.TRIANGLES:t.triangles+=o*(r/3);break;case i.LINES:t.lines+=o*(r/2);break;case i.LINE_STRIP:t.lines+=o*(r-1);break;case i.LINE_LOOP:t.lines+=o*r;break;case i.POINTS:t.points+=o*r;break;default:lt("WebGLInfo: Unknown draw mode:",a);break}}function s(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:s,update:n}}function p0(i,e,t){const n=new WeakMap,s=new Et;function r(a,o,l){const c=a.morphTargetInfluences,u=o.morphAttributes.position||o.morphAttributes.normal||o.morphAttributes.color,p=u!==void 0?u.length:0;let d=n.get(o);if(d===void 0||d.count!==p){let C=function(){v.dispose(),n.delete(o),o.removeEventListener("dispose",C)};d!==void 0&&d.texture.dispose();const h=o.morphAttributes.position!==void 0,f=o.morphAttributes.normal!==void 0,_=o.morphAttributes.color!==void 0,m=o.morphAttributes.position||[],g=o.morphAttributes.normal||[],x=o.morphAttributes.color||[];let S=0;h===!0&&(S=1),f===!0&&(S=2),_===!0&&(S=3);let M=o.attributes.position.count*S,w=1;M>e.maxTextureSize&&(w=Math.ceil(M/e.maxTextureSize),M=e.maxTextureSize);const T=new Float32Array(M*w*4*p),v=new Yc(T,M,w,p);v.type=yn,v.needsUpdate=!0;const y=S*4;for(let R=0;R<p;R++){const P=m[R],F=g[R],z=x[R],L=M*w*4*R;for(let G=0;G<P.count;G++){const X=G*y;h===!0&&(s.fromBufferAttribute(P,G),T[L+X+0]=s.x,T[L+X+1]=s.y,T[L+X+2]=s.z,T[L+X+3]=0),f===!0&&(s.fromBufferAttribute(F,G),T[L+X+4]=s.x,T[L+X+5]=s.y,T[L+X+6]=s.z,T[L+X+7]=0),_===!0&&(s.fromBufferAttribute(z,G),T[L+X+8]=s.x,T[L+X+9]=s.y,T[L+X+10]=s.z,T[L+X+11]=z.itemSize===4?s.w:1)}}d={count:p,texture:v,size:new Se(M,w)},n.set(o,d),o.addEventListener("dispose",C)}if(a.isInstancedMesh===!0&&a.morphTexture!==null)l.getUniforms().setValue(i,"morphTexture",a.morphTexture,t);else{let h=0;for(let _=0;_<c.length;_++)h+=c[_];const f=o.morphTargetsRelative?1:1-h;l.getUniforms().setValue(i,"morphTargetBaseInfluence",f),l.getUniforms().setValue(i,"morphTargetInfluences",c)}l.getUniforms().setValue(i,"morphTargetsTexture",d.texture,t),l.getUniforms().setValue(i,"morphTargetsTextureSize",d.size)}return{update:r}}function m0(i,e,t,n,s){let r=new WeakMap;function a(c){const u=s.render.frame,p=c.geometry,d=e.get(c,p);if(r.get(d)!==u&&(e.update(d),r.set(d,u)),c.isInstancedMesh&&(c.hasEventListener("dispose",l)===!1&&c.addEventListener("dispose",l),r.get(c)!==u&&(t.update(c.instanceMatrix,i.ARRAY_BUFFER),c.instanceColor!==null&&t.update(c.instanceColor,i.ARRAY_BUFFER),r.set(c,u))),c.isSkinnedMesh){const h=c.skeleton;r.get(h)!==u&&(h.update(),r.set(h,u))}return d}function o(){r=new WeakMap}function l(c){const u=c.target;u.removeEventListener("dispose",l),n.releaseStatesOfObject(u),t.remove(u.instanceMatrix),u.instanceColor!==null&&t.remove(u.instanceColor)}return{update:a,dispose:o}}const g0={[Tc]:"LINEAR_TONE_MAPPING",[Ac]:"REINHARD_TONE_MAPPING",[Rc]:"CINEON_TONE_MAPPING",[co]:"ACES_FILMIC_TONE_MAPPING",[Pc]:"AGX_TONE_MAPPING",[Lc]:"NEUTRAL_TONE_MAPPING",[Cc]:"CUSTOM_TONE_MAPPING"};function _0(i,e,t,n,s,r){const a=new En(e,t,{type:i,depthBuffer:s,stencilBuffer:r,samples:n?4:0,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,resolveDepthBuffer:!1,resolveStencilBuffer:!1});let o=null,l=null,c=null;const u=new Xt;u.setAttribute("position",new Tt([-1,3,0,-1,-1,0,3,-1,0],3)),u.setAttribute("uv",new Tt([0,2,0,0,2,0],2));const p=new af({uniforms:{tDiffuse:{value:null}},vertexShader:`
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
			}`,depthTest:!1,depthWrite:!1}),d=new zt(u,p),h=new dh(-1,1,1,-1,0,1);let f=null,_=null,m=!1,g,x=null,S=[],M=!1;this.setSize=function(w,T){a.setSize(w,T),o!==null&&o.setSize(w,T),l!==null&&l.setSize(w,T);for(let v=0;v<S.length;v++){const y=S[v];y.setSize&&y.setSize(w,T)}},this.setEffects=function(w){S=w,M=S.length>0&&S[0].isRenderPass===!0;const T=a.width,v=a.height;S.length>0&&o===null&&(o=new En(T,v,{type:Tn,depthBuffer:!1,stencilBuffer:!1}),l=new En(T,v,{type:Tn,depthBuffer:!1,stencilBuffer:!1}));const y=s===!0&&S.some(C=>C.needsDepthTexture===!0);y!==(a.depthTexture!==null)&&(y===!0&&c===null&&(c=new Fi(T,v),r===!0&&(c.format=Jn,c.type=Ui)),a.dispose(),a.depthTexture=y?c:null,a.resolveDepthBuffer=y,a.storeMultisampledDepthBuffer=y);for(let C=0;C<S.length;C++){const R=S[C];R.setSize&&R.setSize(T,v),y&&R.needsDepthTexture===!0&&R.setDepthTexture&&R.setDepthTexture(c)}},this.begin=function(w,T){if(m||w.toneMapping===On&&S.length===0)return!1;if(x=T,T!==null){const v=T.width,y=T.height;(a.width!==v||a.height!==y)&&this.setSize(v,y)}return M===!1&&w.setRenderTarget(a),g=w.toneMapping,w.toneMapping=On,!0},this.hasRenderPass=function(){return M},this.end=function(w,T){w.toneMapping=g,m=!0;let v=a,y=o;for(let C=0;C<S.length;C++){const R=S[C];R.enabled!==!1&&(R.render(w,y,v,T),R.needsSwap!==!1&&(v=y,y=y===o?l:o))}if(f!==w.outputColorSpace||_!==w.toneMapping){f=w.outputColorSpace,_=w.toneMapping,p.defines={},at.getTransfer(f)===dt&&(p.defines.SRGB_TRANSFER="");const C=g0[_];C&&(p.defines[C]=""),p.needsUpdate=!0}p.uniforms.tDiffuse.value=v.texture,w.setRenderTarget(x),w.render(d,h),x=null,m=!1},this.isCompositing=function(){return m},this.dispose=function(){a.dispose(),o!==null&&o.dispose(),l!==null&&l.dispose(),u.dispose(),p.dispose()}}const _h=new Zt,vh=new Fi(1,1),xh=new jc(1),Mh=new Yc,Sh=new nd,yh=new Qc,zl=[],Gl=[],Hl=new Float32Array(16),Vl=new Float32Array(9),Wl=new Float32Array(4);function Gi(i,e,t){const n=i[0];if(n<=0||n>0)return i;const s=e*t;let r=zl[s];if(r===void 0&&(r=new Float32Array(s),zl[s]=r),e!==0){n.toArray(r,0);for(let a=1,o=0;a!==e;++a)o+=t,i[a].toArray(r,o)}return r}function Lt(i,e){if(i.length!==e.length)return!1;for(let t=0,n=i.length;t<n;t++)if(i[t]!==e[t])return!1;return!0}function Dt(i,e){for(let t=0,n=e.length;t<n;t++)i[t]=e[t]}function Er(i,e){let t=Gl[e];t===void 0&&(t=new Int32Array(e),Gl[e]=t);for(let n=0;n!==e;++n)t[n]=i.allocateTextureUnit();return t}function v0(i,e){const t=this.cache;t[0]!==e&&(i.uniform1f(this.addr,e),t[0]=e)}function x0(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Lt(t,e))return;i.uniform2fv(this.addr,e),Dt(t,e)}}function M0(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(i.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(Lt(t,e))return;i.uniform3fv(this.addr,e),Dt(t,e)}}function S0(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Lt(t,e))return;i.uniform4fv(this.addr,e),Dt(t,e)}}function y0(i,e){const t=this.cache,n=e.elements;if(n===void 0){if(Lt(t,e))return;i.uniformMatrix2fv(this.addr,!1,e),Dt(t,e)}else{if(Lt(t,n))return;Wl.set(n),i.uniformMatrix2fv(this.addr,!1,Wl),Dt(t,n)}}function b0(i,e){const t=this.cache,n=e.elements;if(n===void 0){if(Lt(t,e))return;i.uniformMatrix3fv(this.addr,!1,e),Dt(t,e)}else{if(Lt(t,n))return;Vl.set(n),i.uniformMatrix3fv(this.addr,!1,Vl),Dt(t,n)}}function E0(i,e){const t=this.cache,n=e.elements;if(n===void 0){if(Lt(t,e))return;i.uniformMatrix4fv(this.addr,!1,e),Dt(t,e)}else{if(Lt(t,n))return;Hl.set(n),i.uniformMatrix4fv(this.addr,!1,Hl),Dt(t,n)}}function w0(i,e){const t=this.cache;t[0]!==e&&(i.uniform1i(this.addr,e),t[0]=e)}function T0(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Lt(t,e))return;i.uniform2iv(this.addr,e),Dt(t,e)}}function A0(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Lt(t,e))return;i.uniform3iv(this.addr,e),Dt(t,e)}}function R0(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Lt(t,e))return;i.uniform4iv(this.addr,e),Dt(t,e)}}function C0(i,e){const t=this.cache;t[0]!==e&&(i.uniform1ui(this.addr,e),t[0]=e)}function P0(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Lt(t,e))return;i.uniform2uiv(this.addr,e),Dt(t,e)}}function L0(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Lt(t,e))return;i.uniform3uiv(this.addr,e),Dt(t,e)}}function D0(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Lt(t,e))return;i.uniform4uiv(this.addr,e),Dt(t,e)}}function wr(i){return i.version===0&&(i.compareFunction=Hc,i.needsUpdate=!0),i}function N0(i,e,t){const n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s);let r;this.type===i.SAMPLER_2D_SHADOW?r=wr(vh):r=_h,t.setTexture2D(e||r,s)}function I0(i,e,t){const n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTexture3D(e||Sh,s)}function U0(i,e,t){const n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s);let r;this.type===i.SAMPLER_CUBE_SHADOW?r=wr(xh):r=yh,t.setTextureCube(e||r,s)}function F0(i,e,t){const n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTexture2DArray(e||Mh,s)}function O0(i){switch(i){case 5126:return v0;case 35664:return x0;case 35665:return M0;case 35666:return S0;case 35674:return y0;case 35675:return b0;case 35676:return E0;case 5124:case 35670:return w0;case 35667:case 35671:return T0;case 35668:case 35672:return A0;case 35669:case 35673:return R0;case 5125:return C0;case 36294:return P0;case 36295:return L0;case 36296:return D0;case 35678:case 36198:case 36298:case 36306:case 35682:return N0;case 35679:case 36299:case 36307:return I0;case 35680:case 36300:case 36308:case 36293:return U0;case 36289:case 36303:case 36311:case 36292:return F0}}function B0(i,e){i.uniform1fv(this.addr,e)}function k0(i,e){const t=Gi(e,this.size,2);i.uniform2fv(this.addr,t)}function z0(i,e){const t=Gi(e,this.size,3);i.uniform3fv(this.addr,t)}function G0(i,e){const t=Gi(e,this.size,4);i.uniform4fv(this.addr,t)}function H0(i,e){const t=Gi(e,this.size,4);i.uniformMatrix2fv(this.addr,!1,t)}function V0(i,e){const t=Gi(e,this.size,9);i.uniformMatrix3fv(this.addr,!1,t)}function W0(i,e){const t=Gi(e,this.size,16);i.uniformMatrix4fv(this.addr,!1,t)}function X0(i,e){i.uniform1iv(this.addr,e)}function q0(i,e){i.uniform2iv(this.addr,e)}function Y0(i,e){i.uniform3iv(this.addr,e)}function $0(i,e){i.uniform4iv(this.addr,e)}function K0(i,e){i.uniform1uiv(this.addr,e)}function Z0(i,e){i.uniform2uiv(this.addr,e)}function J0(i,e){i.uniform3uiv(this.addr,e)}function Q0(i,e){i.uniform4uiv(this.addr,e)}function j0(i,e,t){const n=this.cache,s=e.length,r=Er(t,s);Lt(n,r)||(i.uniform1iv(this.addr,r),Dt(n,r));let a;this.type===i.SAMPLER_2D_SHADOW?a=wr(vh):a=_h;for(let o=0;o!==s;++o)t.setTexture2D(e[o]||a,r[o])}function eg(i,e,t){const n=this.cache,s=e.length,r=Er(t,s);Lt(n,r)||(i.uniform1iv(this.addr,r),Dt(n,r));for(let a=0;a!==s;++a)t.setTexture3D(e[a]||Sh,r[a])}function tg(i,e,t){const n=this.cache,s=e.length,r=Er(t,s);Lt(n,r)||(i.uniform1iv(this.addr,r),Dt(n,r));let a;this.type===i.SAMPLER_CUBE_SHADOW?a=wr(xh):a=yh;for(let o=0;o!==s;++o)t.setTextureCube(e[o]||a,r[o])}function ng(i,e,t){const n=this.cache,s=e.length,r=Er(t,s);Lt(n,r)||(i.uniform1iv(this.addr,r),Dt(n,r));for(let a=0;a!==s;++a)t.setTexture2DArray(e[a]||Mh,r[a])}function ig(i){switch(i){case 5126:return B0;case 35664:return k0;case 35665:return z0;case 35666:return G0;case 35674:return H0;case 35675:return V0;case 35676:return W0;case 5124:case 35670:return X0;case 35667:case 35671:return q0;case 35668:case 35672:return Y0;case 35669:case 35673:return $0;case 5125:return K0;case 36294:return Z0;case 36295:return J0;case 36296:return Q0;case 35678:case 36198:case 36298:case 36306:case 35682:return j0;case 35679:case 36299:case 36307:return eg;case 35680:case 36300:case 36308:case 36293:return tg;case 36289:case 36303:case 36311:case 36292:return ng}}class sg{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.setValue=O0(t.type)}}class rg{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=ig(t.type)}}class ag{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,n){const s=this.seq;for(let r=0,a=s.length;r!==a;++r){const o=s[r];o.setValue(e,t[o.id],n)}}}const sa=/(\w+)(\])?(\[|\.)?/g;function Xl(i,e){i.seq.push(e),i.map[e.id]=e}function og(i,e,t){const n=i.name,s=n.length;for(sa.lastIndex=0;;){const r=sa.exec(n),a=sa.lastIndex;let o=r[1];const l=r[2]==="]",c=r[3];if(l&&(o=o|0),c===void 0||c==="["&&a+2===s){Xl(t,c===void 0?new sg(o,i,e):new rg(o,i,e));break}else{let p=t.map[o];p===void 0&&(p=new ag(o),Xl(t,p)),t=p}}}class ar{constructor(e,t){this.seq=[],this.map={};const n=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let a=0;a<n;++a){const o=e.getActiveUniform(t,a),l=e.getUniformLocation(t,o.name);og(o,l,this)}const s=[],r=[];for(const a of this.seq)a.type===e.SAMPLER_2D_SHADOW||a.type===e.SAMPLER_CUBE_SHADOW||a.type===e.SAMPLER_2D_ARRAY_SHADOW?s.push(a):r.push(a);s.length>0&&(this.seq=s.concat(r))}setValue(e,t,n,s){const r=this.map[t];r!==void 0&&r.setValue(e,n,s)}setOptional(e,t,n){const s=t[n];s!==void 0&&this.setValue(e,n,s)}static upload(e,t,n,s){for(let r=0,a=t.length;r!==a;++r){const o=t[r],l=n[o.id];l.needsUpdate!==!1&&o.setValue(e,l.value,s)}}static seqWithValue(e,t){const n=[];for(let s=0,r=e.length;s!==r;++s){const a=e[s];a.id in t&&n.push(a)}return n}}function ql(i,e,t){const n=i.createShader(e);return i.shaderSource(n,t),i.compileShader(n),n}const lg=37297;let cg=0;function hg(i,e){const t=i.split(`
`),n=[],s=Math.max(e-6,0),r=Math.min(e+6,t.length);for(let a=s;a<r;a++){const o=a+1;n.push(`${o===e?">":" "} ${o}: ${t[a]}`)}return n.join(`
`)}const Yl=new Xe;function ug(i){at._getMatrix(Yl,at.workingColorSpace,i);const e=`mat3( ${Yl.elements.map(t=>t.toFixed(4))} )`;switch(at.getTransfer(i)){case dr:return[e,"LinearTransferOETF"];case dt:return[e,"sRGBTransferOETF"];default:return He("WebGLProgram: Unsupported color space: ",i),[e,"LinearTransferOETF"]}}function $l(i,e,t){const n=i.getShaderParameter(e,i.COMPILE_STATUS),r=(i.getShaderInfoLog(e)||"").trim();if(n&&r==="")return"";const a=/ERROR: 0:(\d+)/.exec(r);if(a){const o=parseInt(a[1]);return t.toUpperCase()+`

`+r+`

`+hg(i.getShaderSource(e),o)}else return r}function dg(i,e){const t=ug(e);return[`vec4 ${i}( vec4 value ) {`,`	return ${t[1]}( vec4( ${t[0]} * value.rgb, value.a ) );`,"}"].join(`
`)}const fg={[Tc]:"Linear",[Ac]:"Reinhard",[Rc]:"Cineon",[co]:"ACESFilmic",[Pc]:"AgX",[Lc]:"Neutral",[Cc]:"Custom"};function pg(i,e){const t=fg[e];return t===void 0?(He("WebGLProgram: Unsupported toneMapping:",e),"vec3 "+i+"( vec3 color ) { return LinearToneMapping( color ); }"):"vec3 "+i+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}const Zs=new O;function mg(){at.getLuminanceCoefficients(Zs);const i=Zs.x.toFixed(4),e=Zs.y.toFixed(4),t=Zs.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${i}, ${e}, ${t} );`,"	return dot( weights, rgb );","}"].join(`
`)}function gg(i){return[i.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",i.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(ji).join(`
`)}function _g(i){const e=[];for(const t in i){const n=i[t];n!==!1&&e.push("#define "+t+" "+n)}return e.join(`
`)}function vg(i,e){const t={},n=i.getProgramParameter(e,i.ACTIVE_ATTRIBUTES);for(let s=0;s<n;s++){const r=i.getActiveAttrib(e,s),a=r.name;let o=1;r.type===i.FLOAT_MAT2&&(o=2),r.type===i.FLOAT_MAT3&&(o=3),r.type===i.FLOAT_MAT4&&(o=4),t[a]={type:r.type,location:i.getAttribLocation(e,a),locationSize:o}}return t}function ji(i){return i!==""}function Kl(i,e){const t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return i.replace(/NUM_SUN_LIGHTS/g,e.numSunLights).replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_SUN_LIGHT_SHADOWS/g,e.numSunLightShadows).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows).replace(/NUM_LIGHT_PROBE_GRIDS/g,e.numLightProbeGrids)}function Zl(i,e){return i.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}const xg=/^[ \t]*#include +<([\w\d./]+)>/gm;function ro(i){return i.replace(xg,Mg)}function Mg(i,e){const t=je[e];if(t===void 0)throw new Error("THREE.WebGLProgram: Can not resolve #include <"+e+">");return ro(t)}const Sg=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function Jl(i){return i.replace(Sg,yg)}function yg(i,e,t,n){let s="";for(let r=parseInt(e);r<parseInt(t);r++)s+=n.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return s}function Ql(i){let e=`precision ${i.precision} float;
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
#define LOW_PRECISION`),e}const bg={[er]:"SHADOWMAP_TYPE_PCF",[Ji]:"SHADOWMAP_TYPE_VSM"};function Eg(i){return bg[i.shadowMapType]||"SHADOWMAP_TYPE_BASIC"}const wg={[hs]:"ENVMAP_MODE_REFRACTION"};function Tg(i){return i.envMap===!1?"ENVMAP_MODE_REFLECTION":wg[i.envMapMode]||"ENVMAP_MODE_REFLECTION"}const Ag={[wc]:"ENVMAP_BLENDING_MULTIPLY",[Mu]:"ENVMAP_BLENDING_MIX",[Su]:"ENVMAP_BLENDING_ADD"};function Rg(i){return i.envMap===!1?"ENVMAP_BLENDING_NONE":Ag[i.combine]||"ENVMAP_BLENDING_NONE"}function Cg(i,e,t,n){const s=i.getContext(),r=t.defines;let a=t.vertexShader,o=t.fragmentShader;const l=Eg(t),c=t.envMapPMREM===!0?"ENVMAP_TYPE_PMREM":"ENVMAP_TYPE_CUBE",u=Tg(t),p=Rg(t),d=gg(t),h=_g(r),f=s.createProgram();let _,m,g=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(_=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,h].filter(ji).join(`
`),_.length>0&&(_+=`
`),m=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,h].filter(ji).join(`
`),m.length>0&&(m+=`
`)):(_=[Ql(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,h,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.batchingColor?"#define USE_BATCHING_COLOR":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.instancingMorph?"#define USE_INSTANCING_MORPH":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+u:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.diffuseRoughnessMap?"#define USE_DIFFUSE_ROUGHNESSMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.diffuseRoughnessMapUv?"#define DIFFUSE_ROUGHNESSMAP_UV "+t.diffuseRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexNormals?"#define HAS_NORMAL":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(ji).join(`
`),m=[Ql(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,h,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+c:"",t.envMap?"#define "+u:"",t.envMap?"#define "+p:"",t.envMapPMREM?"#define ENVMAP_MAX_LOD "+t.envMapMaxLod+".0":"",t.envMapPMREM?"#define ENVMAP_SIZE "+t.envMapSize+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.packedNormalMap?"#define USE_PACKED_NORMALMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.diffuseRoughness?"#define USE_DIFFUSE_ROUGHNESS":"",t.diffuseRoughnessMap?"#define USE_DIFFUSE_ROUGHNESSMAP":"",t.dispersion?"#define USE_DISPERSION":"",t.retroreflection?"#define USE_RETROREFLECTION":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor?"#define USE_COLOR":"",t.vertexAlphas||t.batchingColor?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==On?"#define TONE_MAPPING":"",t.toneMapping!==On?je.tonemapping_pars_fragment:"",t.toneMapping!==On?pg("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",je.colorspace_pars_fragment,dg("linearToOutputTexel",t.outputColorSpace),mg(),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(ji).join(`
`)),a=ro(a),a=Kl(a,t),a=Zl(a,t),o=ro(o),o=Kl(o,t),o=Zl(o,t),a=Jl(a),o=Jl(o),t.isRawShaderMaterial!==!0&&(g=`#version 300 es
`,_=[d,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+_,m=["#define varying in",t.glslVersion===rl?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===rl?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+m);const x=g+_+a,S=g+m+o,M=ql(s,s.VERTEX_SHADER,x),w=ql(s,s.FRAGMENT_SHADER,S);s.attachShader(f,M),s.attachShader(f,w),t.index0AttributeName!==void 0?s.bindAttribLocation(f,0,t.index0AttributeName):t.hasPositionAttribute===!0&&s.bindAttribLocation(f,0,"position"),s.linkProgram(f);function T(R){if(i.debug.checkShaderErrors){const P=s.getProgramInfoLog(f)||"",F=s.getShaderInfoLog(M)||"",z=s.getShaderInfoLog(w)||"",L=P.trim(),G=F.trim(),X=z.trim();let B=!0,ne=!0;if(s.getProgramParameter(f,s.LINK_STATUS)===!1)if(B=!1,typeof i.debug.onShaderError=="function")i.debug.onShaderError(s,f,M,w);else{const q=$l(s,M,"vertex"),ee=$l(s,w,"fragment");lt("WebGLProgram: Shader Error "+s.getError()+" - VALIDATE_STATUS "+s.getProgramParameter(f,s.VALIDATE_STATUS)+`

Material Name: `+R.name+`
Material Type: `+R.type+`

Program Info Log: `+L+`
`+q+`
`+ee)}else L!==""?He("WebGLProgram: Program Info Log:",L):(G===""||X==="")&&(ne=!1);ne&&(R.diagnostics={runnable:B,programLog:L,vertexShader:{log:G,prefix:_},fragmentShader:{log:X,prefix:m}})}s.deleteShader(M),s.deleteShader(w),v=new ar(s,f),y=vg(s,f)}let v;this.getUniforms=function(){return v===void 0&&T(this),v};let y;this.getAttributes=function(){return y===void 0&&T(this),y};let C=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return C===!1&&(C=s.getProgramParameter(f,lg)),C},this.destroy=function(){n.releaseStatesOfProgram(this),s.deleteProgram(f),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=cg++,this.cacheKey=e,this.usedTimes=1,this.program=f,this.vertexShader=M,this.fragmentShader=w,this}let Pg=0;class Lg{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e,t,n){const s=this._getShaderCacheForMaterial(e);return s.has(t)===!1&&(s.add(t),t.usedTimes++),s.has(n)===!1&&(s.add(n),n.usedTimes++),this}remove(e){const t=this.materialCache.get(e);for(const n of t)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(e),this}getVertexShaderStage(e){return this._getShaderStage(e.vertexShader)}getFragmentShaderStage(e){return this._getShaderStage(e.fragmentShader)}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){const t=this.materialCache;let n=t.get(e);return n===void 0&&(n=new Set,t.set(e,n)),n}_getShaderStage(e){const t=this.shaderCache;let n=t.get(e);return n===void 0&&(n=new Dg(e),t.set(e,n)),n}}class Dg{constructor(e){this.id=Pg++,this.code=e,this.usedTimes=0}}function Ng(i){return i===ui||i===cr||i===hr}function Ig(i,e,t,n,s,r){const a=new $c,o=new Lg,l=new Set,c=[],u=new Map,p=n.logarithmicDepthBuffer,d={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distance",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function h(v){return l.add(v),v===0?"uv":`uv${v}`}function f(v,y,C,R,P,F){const z=R.fog,L=P.geometry,G=v.isMeshStandardMaterial||v.isMeshLambertMaterial||v.isMeshPhongMaterial?R.environment:null,X=v.isMeshStandardMaterial||v.isMeshLambertMaterial&&!v.envMap||v.isMeshPhongMaterial&&!v.envMap,B=e.get(v.envMap||G,X),ne=d[v.type];let q=n.precision;v.precision!==null&&(q=n.getMaxPrecision(v.precision),q!==v.precision&&He("WebGLProgram.getParameters:",v.precision,"not supported, using",q,"instead."));const ee=L.morphAttributes.position||L.morphAttributes.normal||L.morphAttributes.color,se=ee!==void 0?ee.length:0;let Te=0;L.morphAttributes.position!==void 0&&(Te=1),L.morphAttributes.normal!==void 0&&(Te=2),L.morphAttributes.color!==void 0&&(Te=3);let Fe,K,ge,Ae;if(ne){const ye=Mn[ne];Fe=ye.vertexShader,K=ye.fragmentShader}else{Fe=v.vertexShader,K=v.fragmentShader;const ye=o.getVertexShaderStage(v),ut=o.getFragmentShaderStage(v);o.update(v,ye,ut),ge=ye.id,Ae=ut.id}const Ue=i.getRenderTarget(),Me=i.state.buffers.depth.getReversed(),Oe=P.isInstancedMesh===!0,pt=P.isBatchedMesh===!0,ze=!!v.map,Ye=!!v.matcap,Ke=!!B,te=Ke&&B.isPMREMTexture===!0,he=!!v.aoMap,Y=!!v.lightMap,ae=!!v.bumpMap&&v.wireframe===!1,re=!!v.normalMap,Be=!!v.displacementMap,Re=!!v.emissiveMap,$e=!!v.metalnessMap,Je=!!v.roughnessMap,et=v.anisotropy>0,U=v.clearcoat>0,yt=v.diffuseRoughness>0,tt=v.dispersion>0,mt=v.retroreflectivity>0,_e=v.iridescence>0,At=v.sheen>0,Ge=v.transmission>0,We=et&&!!v.anisotropyMap,A=U&&!!v.clearcoatMap,b=U&&!!v.clearcoatNormalMap,V=U&&!!v.clearcoatRoughnessMap,oe=yt&&!!v.diffuseRoughnessMap,ie=_e&&!!v.iridescenceMap,ue=_e&&!!v.iridescenceThicknessMap,ve=At&&!!v.sheenColorMap,J=At&&!!v.sheenRoughnessMap,Q=!!v.specularMap,fe=!!v.specularColorMap,N=!!v.specularIntensityMap,j=Ge&&!!v.transmissionMap,Z=Ge&&!!v.thicknessMap,pe=!!v.gradientMap,ce=!!v.alphaMap,de=v.alphaTest>0,Ie=!!v.alphaHash,Qe=!!v.extensions;let le=On;v.toneMapped&&(Ue===null||Ue.isXRRenderTarget===!0)&&(le=i.toneMapping);const ke=te?B.isCompressedCubeTexture?B.image[0].mipmaps:B.mipmaps:null,Ze={shaderID:ne,shaderType:v.type,shaderName:v.name,vertexShader:Fe,fragmentShader:K,defines:v.defines,customVertexShaderID:ge,customFragmentShaderID:Ae,isRawShaderMaterial:v.isRawShaderMaterial===!0,glslVersion:v.glslVersion,precision:q,batching:pt,batchingColor:pt&&P._colorsTexture!==null,instancing:Oe,instancingColor:Oe&&P.instanceColor!==null,instancingMorph:Oe&&P.morphTexture!==null,outputColorSpace:Ue===null?i.outputColorSpace:Ue.isXRRenderTarget===!0?Ue.texture.colorSpace:at.workingColorSpace,alphaToCoverage:!!v.alphaToCoverage,map:ze,matcap:Ye,envMap:Ke,envMapMode:Ke&&B.mapping,envMapPMREM:te,envMapMaxLod:te?ke.length-1:null,envMapSize:te?ke[0].width:null,aoMap:he,lightMap:Y,bumpMap:ae,normalMap:re,displacementMap:Be,emissiveMap:Re,normalMapObjectSpace:re&&v.normalMapType===Eu,normalMapTangentSpace:re&&v.normalMapType===eo,packedNormalMap:re&&v.normalMapType===eo&&Ng(v.normalMap.format),metalnessMap:$e,roughnessMap:Je,anisotropy:et,anisotropyMap:We,clearcoat:U,clearcoatMap:A,clearcoatNormalMap:b,clearcoatRoughnessMap:V,diffuseRoughness:yt,diffuseRoughnessMap:oe,dispersion:tt,retroreflection:mt,iridescence:_e,iridescenceMap:ie,iridescenceThicknessMap:ue,sheen:At,sheenColorMap:ve,sheenRoughnessMap:J,specularMap:Q,specularColorMap:fe,specularIntensityMap:N,transmission:Ge,transmissionMap:j,thicknessMap:Z,gradientMap:pe,opaque:v.transparent===!1&&v.blending===ns&&v.alphaToCoverage===!1,alphaMap:ce,alphaTest:de,alphaHash:Ie,combine:v.combine,mapUv:ze&&h(v.map.channel),aoMapUv:he&&h(v.aoMap.channel),lightMapUv:Y&&h(v.lightMap.channel),bumpMapUv:ae&&h(v.bumpMap.channel),normalMapUv:re&&h(v.normalMap.channel),displacementMapUv:Be&&h(v.displacementMap.channel),emissiveMapUv:Re&&h(v.emissiveMap.channel),metalnessMapUv:$e&&h(v.metalnessMap.channel),roughnessMapUv:Je&&h(v.roughnessMap.channel),anisotropyMapUv:We&&h(v.anisotropyMap.channel),clearcoatMapUv:A&&h(v.clearcoatMap.channel),clearcoatNormalMapUv:b&&h(v.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:V&&h(v.clearcoatRoughnessMap.channel),diffuseRoughnessMapUv:oe&&h(v.diffuseRoughnessMap.channel),iridescenceMapUv:ie&&h(v.iridescenceMap.channel),iridescenceThicknessMapUv:ue&&h(v.iridescenceThicknessMap.channel),sheenColorMapUv:ve&&h(v.sheenColorMap.channel),sheenRoughnessMapUv:J&&h(v.sheenRoughnessMap.channel),specularMapUv:Q&&h(v.specularMap.channel),specularColorMapUv:fe&&h(v.specularColorMap.channel),specularIntensityMapUv:N&&h(v.specularIntensityMap.channel),transmissionMapUv:j&&h(v.transmissionMap.channel),thicknessMapUv:Z&&h(v.thicknessMap.channel),alphaMapUv:ce&&h(v.alphaMap.channel),vertexTangents:!!L.attributes.tangent&&(re||et),vertexNormals:!!L.attributes.normal,vertexColors:v.vertexColors,vertexAlphas:v.vertexColors===!0&&!!L.attributes.color&&L.attributes.color.itemSize===4,pointsUvs:P.isPoints===!0&&!!L.attributes.uv&&(ze||ce),fog:!!z,useFog:v.fog===!0,fogExp2:!!z&&z.isFogExp2,flatShading:v.wireframe===!1&&(v.flatShading===!0||L.attributes.normal===void 0&&re===!1&&(v.isMeshLambertMaterial||v.isMeshPhongMaterial||v.isMeshStandardMaterial||v.isMeshPhysicalMaterial)),sizeAttenuation:v.sizeAttenuation===!0,logarithmicDepthBuffer:p,reversedDepthBuffer:Me,skinning:P.isSkinnedMesh===!0,hasPositionAttribute:L.attributes.position!==void 0,morphTargets:L.morphAttributes.position!==void 0,morphNormals:L.morphAttributes.normal!==void 0,morphColors:L.morphAttributes.color!==void 0,morphTargetsCount:se,morphTextureStride:Te,numSunLights:y.sun.length,numDirLights:y.directional.length,numPointLights:y.point.length,numSpotLights:y.spot.length,numSpotLightMaps:y.spotLightMap.length,numRectAreaLights:y.rectArea.length,numHemiLights:y.hemi.length,numSunLightShadows:y.sunShadowMap.length,numDirLightShadows:y.directionalShadowMap.length,numPointLightShadows:y.pointShadowMap.length,numSpotLightShadows:y.spotShadowMap.length,numSpotLightShadowsWithMaps:y.numSpotLightShadowsWithMaps,numLightProbes:y.numLightProbes,numLightProbeGrids:F.filter(ye=>ye.texture!==null).length,numClippingPlanes:r.numPlanes,numClipIntersection:r.numIntersection,dithering:v.dithering,shadowMapEnabled:i.shadowMap.enabled&&C.length>0,shadowMapType:i.shadowMap.type,toneMapping:le,decodeVideoTexture:ze&&v.map.isVideoTexture===!0&&at.getTransfer(v.map.colorSpace)===dt,decodeVideoTextureEmissive:Re&&v.emissiveMap.isVideoTexture===!0&&at.getTransfer(v.emissiveMap.colorSpace)===dt,premultipliedAlpha:v.premultipliedAlpha,doubleSided:v.side===Sn,flipSided:v.side===Qt,useDepthPacking:v.depthPacking>=0,depthPacking:v.depthPacking||0,index0AttributeName:v.index0AttributeName,extensionClipCullDistance:Qe&&v.extensions.clipCullDistance===!0&&t.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(Qe&&v.extensions.multiDraw===!0||pt)&&t.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:t.has("KHR_parallel_shader_compile"),customProgramCacheKey:v.customProgramCacheKey()};return Ze.vertexUv1s=l.has(1),Ze.vertexUv2s=l.has(2),Ze.vertexUv3s=l.has(3),l.clear(),Ze}function _(v){const y=[];if(v.shaderID?y.push(v.shaderID):(y.push(v.customVertexShaderID),y.push(v.customFragmentShaderID)),v.defines!==void 0)for(const C in v.defines)y.push(C),y.push(v.defines[C]);return v.isRawShaderMaterial===!1&&(m(y,v),g(y,v),y.push(i.outputColorSpace)),y.push(v.customProgramCacheKey),y.join()}function m(v,y){v.push(y.precision),v.push(y.outputColorSpace),v.push(y.envMapMode),v.push(y.envMapPMREM),v.push(y.envMapMaxLod),v.push(y.envMapSize),v.push(y.mapUv),v.push(y.alphaMapUv),v.push(y.lightMapUv),v.push(y.aoMapUv),v.push(y.bumpMapUv),v.push(y.normalMapUv),v.push(y.displacementMapUv),v.push(y.emissiveMapUv),v.push(y.metalnessMapUv),v.push(y.roughnessMapUv),v.push(y.anisotropyMapUv),v.push(y.clearcoatMapUv),v.push(y.clearcoatNormalMapUv),v.push(y.clearcoatRoughnessMapUv),v.push(y.diffuseRoughnessMapUv),v.push(y.iridescenceMapUv),v.push(y.iridescenceThicknessMapUv),v.push(y.sheenColorMapUv),v.push(y.sheenRoughnessMapUv),v.push(y.specularMapUv),v.push(y.specularColorMapUv),v.push(y.specularIntensityMapUv),v.push(y.transmissionMapUv),v.push(y.thicknessMapUv),v.push(y.combine),v.push(y.fogExp2),v.push(y.sizeAttenuation),v.push(y.morphTargetsCount),v.push(y.numSunLights),v.push(y.numDirLights),v.push(y.numPointLights),v.push(y.numSpotLights),v.push(y.numSpotLightMaps),v.push(y.numHemiLights),v.push(y.numRectAreaLights),v.push(y.numSunLightShadows),v.push(y.numDirLightShadows),v.push(y.numPointLightShadows),v.push(y.numSpotLightShadows),v.push(y.numSpotLightShadowsWithMaps),v.push(y.numLightProbes),v.push(y.numLightProbeGrids),v.push(y.shadowMapType),v.push(y.toneMapping),v.push(y.numClippingPlanes),v.push(y.numClipIntersection),v.push(y.depthPacking)}function g(v,y){a.disableAll(),y.instancing&&a.enable(0),y.instancingColor&&a.enable(1),y.instancingMorph&&a.enable(2),y.matcap&&a.enable(3),y.envMap&&a.enable(4),y.normalMapObjectSpace&&a.enable(5),y.normalMapTangentSpace&&a.enable(6),y.clearcoat&&a.enable(7),y.iridescence&&a.enable(8),y.alphaTest&&a.enable(9),y.vertexColors&&a.enable(10),y.vertexAlphas&&a.enable(11),y.vertexUv1s&&a.enable(12),y.vertexUv2s&&a.enable(13),y.vertexUv3s&&a.enable(14),y.vertexTangents&&a.enable(15),y.anisotropy&&a.enable(16),y.alphaHash&&a.enable(17),y.batching&&a.enable(18),y.dispersion&&a.enable(19),y.retroreflection&&a.enable(24),y.diffuseRoughness&&a.enable(25),y.batchingColor&&a.enable(20),y.gradientMap&&a.enable(21),y.packedNormalMap&&a.enable(22),y.vertexNormals&&a.enable(23),v.push(a.mask),a.disableAll(),y.fog&&a.enable(0),y.useFog&&a.enable(1),y.flatShading&&a.enable(2),y.logarithmicDepthBuffer&&a.enable(3),y.reversedDepthBuffer&&a.enable(4),y.skinning&&a.enable(5),y.morphTargets&&a.enable(6),y.morphNormals&&a.enable(7),y.morphColors&&a.enable(8),y.premultipliedAlpha&&a.enable(9),y.shadowMapEnabled&&a.enable(10),y.doubleSided&&a.enable(11),y.flipSided&&a.enable(12),y.useDepthPacking&&a.enable(13),y.dithering&&a.enable(14),y.transmission&&a.enable(15),y.sheen&&a.enable(16),y.opaque&&a.enable(17),y.pointsUvs&&a.enable(18),y.decodeVideoTexture&&a.enable(19),y.decodeVideoTextureEmissive&&a.enable(20),y.alphaToCoverage&&a.enable(21),y.numLightProbeGrids>0&&a.enable(22),y.hasPositionAttribute&&a.enable(23),v.push(a.mask)}function x(v){const y=d[v.type];let C;if(y){const R=Mn[y];C=nf.clone(R.uniforms)}else C=v.uniforms;return C}function S(v,y){let C=u.get(y);return C!==void 0?++C.usedTimes:(C=new Cg(i,y,v,s),c.push(C),u.set(y,C)),C}function M(v){if(--v.usedTimes===0){const y=c.indexOf(v);c[y]=c[c.length-1],c.pop(),u.delete(v.cacheKey),v.destroy()}}function w(v){o.remove(v)}function T(){o.dispose()}return{getParameters:f,getProgramCacheKey:_,getUniforms:x,acquireProgram:S,releaseProgram:M,releaseShaderCache:w,programs:c,dispose:T}}function Ug(){let i=new WeakMap;function e(a){return i.has(a)}function t(a){let o=i.get(a);return o===void 0&&(o={},i.set(a,o)),o}function n(a){i.delete(a)}function s(a,o,l){i.get(a)[o]=l}function r(){i=new WeakMap}return{has:e,get:t,remove:n,update:s,dispose:r}}function Fg(i,e){return i.groupOrder!==e.groupOrder?i.groupOrder-e.groupOrder:i.renderOrder!==e.renderOrder?i.renderOrder-e.renderOrder:i.material.id!==e.material.id?i.material.id-e.material.id:i.materialVariant!==e.materialVariant?i.materialVariant-e.materialVariant:i.z!==e.z?i.z-e.z:i.id-e.id}function jl(i,e){return i.groupOrder!==e.groupOrder?i.groupOrder-e.groupOrder:i.renderOrder!==e.renderOrder?i.renderOrder-e.renderOrder:i.z!==e.z?e.z-i.z:i.id-e.id}function ec(){const i=[];let e=0;const t=[],n=[],s=[];function r(){e=0,t.length=0,n.length=0,s.length=0}function a(d){let h=0;return d.isInstancedMesh&&(h+=2),d.isSkinnedMesh&&(h+=1),h}function o(d,h,f,_,m,g){let x=i[e];return x===void 0?(x={id:d.id,object:d,geometry:h,material:f,materialVariant:a(d),groupOrder:_,renderOrder:d.renderOrder,z:m,group:g},i[e]=x):(x.id=d.id,x.object=d,x.geometry=h,x.material=f,x.materialVariant=a(d),x.groupOrder=_,x.renderOrder=d.renderOrder,x.z=m,x.group=g),e++,x}function l(d,h,f,_,m,g,x){x.reversedDepth===!0&&(m=-m);const S=o(d,h,f,_,m,g);f.transmission>0?n.push(S):f.transparent===!0?s.push(S):t.push(S)}function c(d,h,f,_,m,g){const x=o(d,h,f,_,m,g);f.transmission>0?n.unshift(x):f.transparent===!0?s.unshift(x):t.unshift(x)}function u(d,h){t.length>1&&t.sort(d||Fg),n.length>1&&n.sort(h||jl),s.length>1&&s.sort(h||jl)}function p(){for(let d=e,h=i.length;d<h;d++){const f=i[d];if(f.id===null)break;f.id=null,f.object=null,f.geometry=null,f.material=null,f.group=null}}return{opaque:t,transmissive:n,transparent:s,init:r,push:l,unshift:c,finish:p,sort:u}}function Og(){let i=new WeakMap;function e(n,s){const r=i.get(n);let a;return r===void 0?(a=new ec,i.set(n,[a])):s>=r.length?(a=new ec,r.push(a)):a=r[s],a}function t(){i=new WeakMap}return{get:e,dispose:t}}function Bg(){const i={};return{get:function(e){if(i[e.id]!==void 0)return i[e.id];let t;switch(e.type){case"SunLight":case"DirectionalLight":t={direction:new O,color:new Ve};break;case"SpotLight":t={position:new O,direction:new O,color:new Ve,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new O,color:new Ve,distance:0,decay:0};break;case"HemisphereLight":t={direction:new O,skyColor:new Ve,groundColor:new Ve};break;case"RectAreaLight":t={color:new Ve,position:new O,halfWidth:new O,halfHeight:new O};break}return i[e.id]=t,t}}}function kg(){const i={};return{get:function(e){if(i[e.id]!==void 0)return i[e.id];let t;switch(e.type){case"SunLight":case"DirectionalLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Se};break;case"SpotLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Se};break;case"PointLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Se,shadowCameraNear:1,shadowCameraFar:1e3};break}return i[e.id]=t,t}}}let zg=0;function Gg(i,e){return(e.castShadow?2:0)-(i.castShadow?2:0)+(e.map?1:0)-(i.map?1:0)}function Hg(i){const e=new Bg,t=kg(),n={version:0,hash:{sunLength:-1,directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numSunShadows:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],sun:[],sunShadow:[],sunShadowMap:[],sunShadowMatrix:[],sunShadowCascade:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let c=0;c<9;c++)n.probe.push(new O);const s=new O,r=new xt,a=new xt;function o(c){let u=0,p=0,d=0;for(let F=0;F<9;F++)n.probe[F].set(0,0,0);let h=0,f=0,_=0,m=0,g=0,x=0,S=0,M=0,w=0,T=0,v=0,y=0,C=0,R=0;c.sort(Gg);for(let F=0,z=c.length;F<z;F++){const L=c[F],G=L.color,X=L.intensity,B=L.distance;let ne=null;if(L.shadow&&L.shadow.map&&(L.shadow.map.texture.format===ui?ne=L.shadow.map.texture:ne=L.shadow.map.depthTexture||L.shadow.map.texture),L.isAmbientLight)u+=G.r*X,p+=G.g*X,d+=G.b*X;else if(L.isLightProbe){for(let q=0;q<9;q++)n.probe[q].addScaledVector(L.sh.coefficients[q],X);R++}else if(L.isSunLight){const q=e.get(L);if(q.color.copy(L.color).multiplyScalar(L.intensity),L.castShadow){const ee=L.shadow,se=t.get(L);se.shadowIntensity=ee.intensity,se.shadowBias=ee.bias,se.shadowNormalBias=ee.normalBias,se.shadowRadius=ee.radius,se.shadowMapSize.copy(ee.mapSize).multiply(ee.getFrameExtents()),n.sunShadow[f]=se,n.sunShadowMap[f]=ne;const Te=ee.getViewportCount();for(let Fe=0;Fe<Te;Fe++)n.sunShadowMatrix[_+Fe]=ee.getMatrix(Fe),n.sunShadowCascade[_+Fe]=ee._cascadeData[Fe];_+=Te,f++}n.sun[h]=q,h++}else if(L.isDirectionalLight){const q=e.get(L);if(q.color.copy(L.color).multiplyScalar(L.intensity),L.castShadow){const ee=L.shadow,se=t.get(L);se.shadowIntensity=ee.intensity,se.shadowBias=ee.bias,se.shadowNormalBias=ee.normalBias,se.shadowRadius=ee.radius,se.shadowMapSize=ee.mapSize,n.directionalShadow[m]=se,n.directionalShadowMap[m]=ne,n.directionalShadowMatrix[m]=L.shadow.matrix,w++}n.directional[m]=q,m++}else if(L.isSpotLight){const q=e.get(L);q.position.setFromMatrixPosition(L.matrixWorld),q.color.copy(G).multiplyScalar(X),q.distance=B,q.coneCos=Math.cos(L.angle),q.penumbraCos=Math.cos(L.angle*(1-L.penumbra)),q.decay=L.decay,n.spot[x]=q;const ee=L.shadow;if(L.map&&(n.spotLightMap[y]=L.map,y++,ee.updateMatrices(L),L.castShadow&&C++),n.spotLightMatrix[x]=ee.matrix,L.castShadow){const se=t.get(L);se.shadowIntensity=ee.intensity,se.shadowBias=ee.bias,se.shadowNormalBias=ee.normalBias,se.shadowRadius=ee.radius,se.shadowMapSize=ee.mapSize,n.spotShadow[x]=se,n.spotShadowMap[x]=ne,v++}x++}else if(L.isRectAreaLight){const q=e.get(L);q.color.copy(G).multiplyScalar(X),q.halfWidth.set(L.width*.5,0,0),q.halfHeight.set(0,L.height*.5,0),n.rectArea[S]=q,S++}else if(L.isPointLight){const q=e.get(L);if(q.color.copy(L.color).multiplyScalar(L.intensity),q.distance=L.distance,q.decay=L.decay,L.castShadow){const ee=L.shadow,se=t.get(L);se.shadowIntensity=ee.intensity,se.shadowBias=ee.bias,se.shadowNormalBias=ee.normalBias,se.shadowRadius=ee.radius,se.shadowMapSize=ee.mapSize,se.shadowCameraNear=ee.camera.near,se.shadowCameraFar=ee.camera.far,n.pointShadow[g]=se,n.pointShadowMap[g]=ne,n.pointShadowMatrix[g]=L.shadow.matrix,T++}n.point[g]=q,g++}else if(L.isHemisphereLight){const q=e.get(L);q.skyColor.copy(L.color).multiplyScalar(X),q.groundColor.copy(L.groundColor).multiplyScalar(X),n.hemi[M]=q,M++}}S>0&&(i.has("OES_texture_float_linear")===!0?(n.rectAreaLTC1=be.LTC_FLOAT_1,n.rectAreaLTC2=be.LTC_FLOAT_2):(n.rectAreaLTC1=be.LTC_HALF_1,n.rectAreaLTC2=be.LTC_HALF_2)),n.ambient[0]=u,n.ambient[1]=p,n.ambient[2]=d;const P=n.hash;(P.sunLength!==h||P.directionalLength!==m||P.pointLength!==g||P.spotLength!==x||P.rectAreaLength!==S||P.hemiLength!==M||P.numSunShadows!==f||P.numDirectionalShadows!==w||P.numPointShadows!==T||P.numSpotShadows!==v||P.numSpotMaps!==y||P.numLightProbes!==R)&&(n.sun.length=h,n.directional.length=m,n.spot.length=x,n.rectArea.length=S,n.point.length=g,n.hemi.length=M,n.sunShadow.length=f,n.sunShadowMap.length=f,n.sunShadowMatrix.length=_,n.sunShadowCascade.length=_,n.directionalShadow.length=w,n.directionalShadowMap.length=w,n.directionalShadowMatrix.length=w,n.pointShadow.length=T,n.pointShadowMap.length=T,n.pointShadowMatrix.length=T,n.spotShadow.length=v,n.spotShadowMap.length=v,n.spotLightMatrix.length=v+y-C,n.spotLightMap.length=y,n.numSpotLightShadowsWithMaps=C,n.numLightProbes=R,P.sunLength=h,P.directionalLength=m,P.pointLength=g,P.spotLength=x,P.rectAreaLength=S,P.hemiLength=M,P.numSunShadows=f,P.numDirectionalShadows=w,P.numPointShadows=T,P.numSpotShadows=v,P.numSpotMaps=y,P.numLightProbes=R,n.version=zg++)}function l(c,u){let p=0,d=0,h=0,f=0,_=0,m=0;const g=u.matrixWorldInverse;for(let x=0,S=c.length;x<S;x++){const M=c[x];if(M.isSunLight){const w=n.sun[p];w.direction.setFromMatrixPosition(M.matrixWorld),w.direction.transformDirection(g),p++}else if(M.isDirectionalLight){const w=n.directional[d];w.direction.setFromMatrixPosition(M.matrixWorld),s.setFromMatrixPosition(M.target.matrixWorld),w.direction.sub(s),w.direction.transformDirection(g),d++}else if(M.isSpotLight){const w=n.spot[f];w.position.setFromMatrixPosition(M.matrixWorld),w.position.applyMatrix4(g),w.direction.setFromMatrixPosition(M.matrixWorld),s.setFromMatrixPosition(M.target.matrixWorld),w.direction.sub(s),w.direction.transformDirection(g),f++}else if(M.isRectAreaLight){const w=n.rectArea[_];w.position.setFromMatrixPosition(M.matrixWorld),w.position.applyMatrix4(g),a.identity(),r.copy(M.matrixWorld),r.premultiply(g),a.extractRotation(r),w.halfWidth.set(M.width*.5,0,0),w.halfHeight.set(0,M.height*.5,0),w.halfWidth.applyMatrix4(a),w.halfHeight.applyMatrix4(a),_++}else if(M.isPointLight){const w=n.point[h];w.position.setFromMatrixPosition(M.matrixWorld),w.position.applyMatrix4(g),h++}else if(M.isHemisphereLight){const w=n.hemi[m];w.direction.setFromMatrixPosition(M.matrixWorld),w.direction.transformDirection(g),m++}}}return{setup:o,setupView:l,state:n}}function tc(i){const e=new Hg(i),t=[],n=[],s=[];function r(p){u.camera=p,t.length=0,n.length=0,s.length=0}function a(p){p.isLightProbeGrid?s.push(p):t.push(p)}function o(p){n.push(p)}function l(){e.setup(t),s.sort((p,d)=>p.priority-d.priority||p.id-d.id)}function c(p){e.setupView(t,p)}const u={lightsArray:t,shadowsArray:n,lightProbeGridArray:s,camera:null,lights:e,transmissionRenderTarget:{},textureUnits:0};return{init:r,state:u,setupLights:l,setupLightsView:c,pushLight:a,pushShadow:o}}function Vg(i){let e=new WeakMap;function t(s,r=0){const a=e.get(s);let o;return a===void 0?(o=new tc(i),e.set(s,[o])):r>=a.length?(o=new tc(i),a.push(o)):o=a[r],o}function n(){e=new WeakMap}return{get:t,dispose:n}}const Wg=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,Xg=`uniform sampler2D shadow_pass;
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
}`,qg=[new O(1,0,0),new O(-1,0,0),new O(0,1,0),new O(0,-1,0),new O(0,0,1),new O(0,0,-1)],Yg=[new O(0,-1,0),new O(0,-1,0),new O(0,0,1),new O(0,0,-1),new O(0,-1,0),new O(0,-1,0)],nc=new xt,Yi=new O,ra=new O;function $g(i,e,t){let n=new ps;const s=new Se,r=new Se,a=new Et,o=new of,l=new lf,c={},u=t.maxTextureSize,p={[hi]:Qt,[Qt]:hi,[Sn]:Sn},d=new fi({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new Se},radius:{value:4}},vertexShader:Wg,fragmentShader:Xg}),h=d.clone();h.defines.HORIZONTAL_PASS=1;const f=new Xt;f.setAttribute("position",new gn(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));const _=new zt(f,d),m=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=er;let g=this.type;this.render=function(T,v,y){if(m.enabled===!1||m.autoUpdate===!1&&m.needsUpdate===!1||T.length===0)return;this.type===tu&&(He("WebGLShadowMap: PCFSoftShadowMap has been removed. Using PCFShadowMap instead."),this.type=er);const C=i.getRenderTarget(),R=i.getActiveCubeFace(),P=i.getActiveMipmapLevel(),F=i.state;F.setBlending(Li),F.buffers.depth.getReversed()===!0?F.buffers.color.setClear(0,0,0,0):F.buffers.color.setClear(1,1,1,1),F.buffers.depth.setTest(!0),F.setScissorTest(!1);const z=g!==this.type;z&&v.traverse(function(L){L.material&&(Array.isArray(L.material)?L.material.forEach(G=>G.needsUpdate=!0):L.material.needsUpdate=!0)});for(let L=0,G=T.length;L<G;L++){const X=T[L],B=X.shadow;if(B===void 0){He("WebGLShadowMap:",X,"has no shadow.");continue}if(B.autoUpdate===!1&&B.needsUpdate===!1)continue;s.copy(B.mapSize);const ne=B.getFrameExtents();s.multiply(ne),r.copy(B.mapSize),(s.x>u||s.y>u)&&(s.x>u&&(r.x=Math.floor(u/ne.x),s.x=r.x*ne.x,B.mapSize.x=r.x),s.y>u&&(r.y=Math.floor(u/ne.y),s.y=r.y*ne.y,B.mapSize.y=r.y));const q=i.state.buffers.depth.getReversed();if(B.camera._reversedDepth=q,B.map===null||z===!0){if(B.map!==null&&(B.map.depthTexture!==null&&(B.map.depthTexture.dispose(),B.map.depthTexture=null),B.map.dispose()),this.type===Ji){if(X.isPointLight){He("WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.");continue}B.map=new En(s.x,s.y,{format:ui,type:Tn,minFilter:Jt,magFilter:Jt,generateMipmaps:!1}),B.map.texture.name=X.name+".shadowMap",B.map.depthTexture=new Fi(s.x,s.y,yn),B.map.depthTexture.name=X.name+".shadowMapDepth",B.map.depthTexture.format=jn,B.map.depthTexture.compareFunction=null,B.map.depthTexture.minFilter=Bt,B.map.depthTexture.magFilter=Bt}else X.isPointLight?(B.map=new Co(s.x),B.map.depthTexture=new jc(s.x,wn)):(B.map=new En(s.x,s.y),B.map.depthTexture=new Fi(s.x,s.y,wn)),B.map.depthTexture.name=X.name+".shadowMap",B.map.depthTexture.format=jn,this.type===er?(B.map.depthTexture.compareFunction=q?Gc:zc,B.map.depthTexture.minFilter=Jt,B.map.depthTexture.magFilter=Jt):(B.map.depthTexture.compareFunction=null,B.map.depthTexture.minFilter=Bt,B.map.depthTexture.magFilter=Bt);B.camera.updateProjectionMatrix()}B.map.isWebGLCubeRenderTarget!==!0&&(B.map.width!==s.x||B.map.height!==s.y)&&B.map.setSize(s.x,s.y);const ee=B.map.isWebGLCubeRenderTarget?6:B.getViewportCount();X.isPointLight!==!0&&B.updateMatrices(X,y);const se=(B.camera.layers.mask&4294967294)!==0?B.camera.layers:y.layers;for(let Te=0;Te<ee;Te++){const Fe=B.getCamera(Te);if(X.isPointLight){const K=B.camera,ge=B.matrix,Ae=X.distance||K.far;Ae!==K.far&&(K.far=Ae,K.updateProjectionMatrix()),Yi.setFromMatrixPosition(X.matrixWorld),K.position.copy(Yi),ra.copy(K.position),ra.add(qg[Te]),K.up.copy(Yg[Te]),K.lookAt(ra),K.updateMatrixWorld(),ge.makeTranslation(-Yi.x,-Yi.y,-Yi.z),nc.multiplyMatrices(K.projectionMatrix,K.matrixWorldInverse),B._frustum.setFromProjectionMatrix(nc,K.coordinateSystem,K.reversedDepth)}if(B.map.isWebGLCubeRenderTarget)i.setRenderTarget(B.map,Te),i.clear();else{Te===0&&(i.setRenderTarget(B.map),i.clear());const K=B.getViewport(Te);a.set(r.x*K.x,r.y*K.y,r.x*K.z,r.y*K.w),F.viewport(a)}n=B.getFrustum(Te),M(v,y,Fe,X,se,this.type)}B.isPointLightShadow!==!0&&this.type===Ji&&x(B,y),B.needsUpdate=!1}g=this.type,m.needsUpdate=!1,i.setRenderTarget(C,R,P)};function x(T,v){const y=e.update(_);d.defines.VSM_SAMPLES!==T.blurSamples&&(d.defines.VSM_SAMPLES=T.blurSamples,h.defines.VSM_SAMPLES=T.blurSamples,d.needsUpdate=!0,h.needsUpdate=!0),T.mapPass===null?T.mapPass=new En(s.x,s.y,{format:ui,type:Tn}):(T.mapPass.width!==T.map.width||T.mapPass.height!==T.map.height)&&T.mapPass.setSize(T.map.width,T.map.height),d.uniforms.shadow_pass.value=T.map.depthTexture,d.uniforms.resolution.value.set(T.map.width,T.map.height),d.uniforms.radius.value=T.radius,i.setRenderTarget(T.mapPass),i.clear(),i.renderBufferDirect(v,null,y,d,_,null),h.uniforms.shadow_pass.value=T.mapPass.texture,h.uniforms.resolution.value.set(T.map.width,T.map.height),h.uniforms.radius.value=T.radius,i.setRenderTarget(T.map),i.clear(),i.renderBufferDirect(v,null,y,h,_,null)}function S(T,v,y,C){let R=null;const P=y.isPointLight===!0?T.customDistanceMaterial:T.customDepthMaterial;if(P!==void 0)R=P;else if(R=y.isPointLight===!0?l:o,i.localClippingEnabled&&v.clipShadows===!0&&Array.isArray(v.clippingPlanes)&&v.clippingPlanes.length!==0||v.displacementMap&&v.displacementScale!==0||v.alphaMap&&v.alphaTest>0||v.map&&v.alphaTest>0||v.alphaToCoverage===!0){const F=R.uuid,z=v.uuid;let L=c[F];L===void 0&&(L={},c[F]=L);let G=L[z];G===void 0&&(G=R.clone(),L[z]=G,v.addEventListener("dispose",w)),R=G}if(R.visible=v.visible,R.wireframe=v.wireframe,C===Ji?R.side=v.shadowSide!==null?v.shadowSide:v.side:R.side=v.shadowSide!==null?v.shadowSide:p[v.side],R.alphaMap=v.alphaMap,R.alphaTest=v.alphaToCoverage===!0?.5:v.alphaTest,R.map=v.map,R.clipShadows=v.clipShadows,R.clippingPlanes=v.clippingPlanes,R.clipIntersection=v.clipIntersection,R.displacementMap=v.displacementMap,R.displacementScale=v.displacementScale,R.displacementBias=v.displacementBias,R.wireframeLinewidth=v.wireframeLinewidth,R.linewidth=v.linewidth,y.isPointLight===!0&&R.isMeshDistanceMaterial===!0){const F=i.properties.get(R);F.light=y}return R}function M(T,v,y,C,R,P){if(T.visible===!1)return;if(T.layers.test(R)&&(T.isMesh||T.isLine||T.isPoints)&&(T.castShadow||T.receiveShadow&&P===Ji)&&(!T.frustumCulled||T.intersectsFrustum(n))){T.modelViewMatrix.multiplyMatrices(y.matrixWorldInverse,T.matrixWorld);const L=e.update(T),G=T.material;if(Array.isArray(G)){const X=L.groups;for(let B=0,ne=X.length;B<ne;B++){const q=X[B],ee=G[q.materialIndex];if(ee&&ee.visible){const se=S(T,ee,C,P);T.onBeforeShadow(i,T,v,y,L,se,q),i.renderBufferDirect(y,null,L,se,T,q),T.onAfterShadow(i,T,v,y,L,se,q)}}}else if(G.visible){const X=S(T,G,C,P);T.onBeforeShadow(i,T,v,y,L,X,null),i.renderBufferDirect(y,null,L,X,T,null),T.onAfterShadow(i,T,v,y,L,X,null)}}const z=T.children;for(let L=0,G=z.length;L<G;L++)M(z[L],v,y,C,R,P)}function w(T){T.target.removeEventListener("dispose",w);for(const y in c){const C=c[y],R=T.target.uuid;R in C&&(C[R].dispose(),delete C[R])}}}function Kg(i,e){function t(){let N=!1;const j=new Et;let Z=null;const pe=new Et(0,0,0,0);return{setMask:function(ce){Z!==ce&&!N&&(i.colorMask(ce,ce,ce,ce),Z=ce)},setLocked:function(ce){N=ce},setClear:function(ce,de,Ie,Qe,le){le===!0&&(ce*=Qe,de*=Qe,Ie*=Qe),j.set(ce,de,Ie,Qe),pe.equals(j)===!1&&(i.clearColor(ce,de,Ie,Qe),pe.copy(j))},reset:function(){N=!1,Z=null,pe.set(-1,0,0,0)}}}function n(){let N=!1,j=!1,Z=null,pe=null,ce=null;return{setReversed:function(de){if(j!==de){const Ie=e.get("EXT_clip_control");de?Ie.clipControlEXT(Ie.LOWER_LEFT_EXT,Ie.ZERO_TO_ONE_EXT):Ie.clipControlEXT(Ie.LOWER_LEFT_EXT,Ie.NEGATIVE_ONE_TO_ONE_EXT),j=de;const Qe=ce;ce=null,this.setClear(Qe)}},getReversed:function(){return j},setTest:function(de){de?Me(i.DEPTH_TEST):Oe(i.DEPTH_TEST)},setMask:function(de){Z!==de&&!N&&(i.depthMask(de),Z=de)},setFunc:function(de){if(j&&(de=Uu[de]),pe!==de){switch(de){case ma:i.depthFunc(i.NEVER);break;case ga:i.depthFunc(i.ALWAYS);break;case _a:i.depthFunc(i.LESS);break;case cs:i.depthFunc(i.LEQUAL);break;case va:i.depthFunc(i.EQUAL);break;case xa:i.depthFunc(i.GEQUAL);break;case Ma:i.depthFunc(i.GREATER);break;case Sa:i.depthFunc(i.NOTEQUAL);break;default:i.depthFunc(i.LEQUAL)}pe=de}},setLocked:function(de){N=de},setClear:function(de){ce!==de&&(ce=de,j&&(de=1-de),i.clearDepth(de))},reset:function(){N=!1,Z=null,pe=null,ce=null,j=!1}}}function s(){let N=!1,j=null,Z=null,pe=null,ce=null,de=null,Ie=null,Qe=null,le=null;return{setTest:function(ke){N||(ke?Me(i.STENCIL_TEST):Oe(i.STENCIL_TEST))},setMask:function(ke){j!==ke&&!N&&(i.stencilMask(ke),j=ke)},setFunc:function(ke,Ze,ye){(Z!==ke||pe!==Ze||ce!==ye)&&(i.stencilFunc(ke,Ze,ye),Z=ke,pe=Ze,ce=ye)},setOp:function(ke,Ze,ye){(de!==ke||Ie!==Ze||Qe!==ye)&&(i.stencilOp(ke,Ze,ye),de=ke,Ie=Ze,Qe=ye)},setLocked:function(ke){N=ke},setClear:function(ke){le!==ke&&(i.clearStencil(ke),le=ke)},reset:function(){N=!1,j=null,Z=null,pe=null,ce=null,de=null,Ie=null,Qe=null,le=null}}}const r=new t,a=new n,o=new s;let l={};const c=new WeakMap;let u={},p={},d={},h=new WeakMap,f=[],_=null,m=!1,g=null,x=null,S=null,M=null,w=null,T=null,v=null,y=new Ve(0,0,0),C=0,R=!1,P=null,F=null,z=null,L=null,G=null;const X=i.getParameter(i.MAX_COMBINED_TEXTURE_IMAGE_UNITS);let B=!1,ne=0;const q=i.getParameter(i.VERSION);q.indexOf("WebGL")!==-1?(ne=parseFloat(/^WebGL (\d)/.exec(q)[1]),B=ne>=1):q.indexOf("OpenGL ES")!==-1&&(ne=parseFloat(/^OpenGL ES (\d)/.exec(q)[1]),B=ne>=2);let ee=null,se={};const Te=i.getParameter(i.SCISSOR_BOX),Fe=i.getParameter(i.VIEWPORT),K=new Et().fromArray(Te),ge=new Et().fromArray(Fe);function Ae(N,j,Z,pe){const ce=new Uint8Array(4),de=i.createTexture();i.bindTexture(N,de),i.texParameteri(N,i.TEXTURE_MIN_FILTER,i.NEAREST),i.texParameteri(N,i.TEXTURE_MAG_FILTER,i.NEAREST);for(let Ie=0;Ie<Z;Ie++)N===i.TEXTURE_3D||N===i.TEXTURE_2D_ARRAY?i.texImage3D(j,0,i.RGBA,1,1,pe,0,i.RGBA,i.UNSIGNED_BYTE,ce):i.texImage2D(j+Ie,0,i.RGBA,1,1,0,i.RGBA,i.UNSIGNED_BYTE,ce);return de}const Ue={};Ue[i.TEXTURE_2D]=Ae(i.TEXTURE_2D,i.TEXTURE_2D,1),Ue[i.TEXTURE_CUBE_MAP]=Ae(i.TEXTURE_CUBE_MAP,i.TEXTURE_CUBE_MAP_POSITIVE_X,6),Ue[i.TEXTURE_2D_ARRAY]=Ae(i.TEXTURE_2D_ARRAY,i.TEXTURE_2D_ARRAY,1,1),Ue[i.TEXTURE_3D]=Ae(i.TEXTURE_3D,i.TEXTURE_3D,1,1),r.setClear(0,0,0,1),a.setClear(1),o.setClear(0),Me(i.DEPTH_TEST),a.setFunc(cs),ae(!1),re(tl),Me(i.CULL_FACE),he(Li);function Me(N){u[N]!==!0&&(i.enable(N),u[N]=!0)}function Oe(N){u[N]!==!1&&(i.disable(N),u[N]=!1)}function pt(N,j){return d[N]!==j?(i.bindFramebuffer(N,j),d[N]=j,N===i.DRAW_FRAMEBUFFER&&(d[i.FRAMEBUFFER]=j),N===i.FRAMEBUFFER&&(d[i.DRAW_FRAMEBUFFER]=j),!0):!1}function ze(N,j){let Z=f,pe=!1;if(N){Z=h.get(j),Z===void 0&&(Z=[],h.set(j,Z));const ce=N.textures;if(Z.length!==ce.length||Z[0]!==i.COLOR_ATTACHMENT0){for(let de=0,Ie=ce.length;de<Ie;de++)Z[de]=i.COLOR_ATTACHMENT0+de;Z.length=ce.length,pe=!0}}else Z[0]!==i.BACK&&(Z[0]=i.BACK,pe=!0);pe&&i.drawBuffers(Z)}function Ye(N){return _!==N?(i.useProgram(N),_=N,!0):!1}const Ke={[Ri]:i.FUNC_ADD,[iu]:i.FUNC_SUBTRACT,[su]:i.FUNC_REVERSE_SUBTRACT};Ke[ru]=i.MIN,Ke[au]=i.MAX;const te={[ou]:i.ZERO,[lu]:i.ONE,[cu]:i.SRC_COLOR,[bc]:i.SRC_ALPHA,[mu]:i.SRC_ALPHA_SATURATE,[fu]:i.DST_COLOR,[uu]:i.DST_ALPHA,[hu]:i.ONE_MINUS_SRC_COLOR,[Ec]:i.ONE_MINUS_SRC_ALPHA,[pu]:i.ONE_MINUS_DST_COLOR,[du]:i.ONE_MINUS_DST_ALPHA,[gu]:i.CONSTANT_COLOR,[_u]:i.ONE_MINUS_CONSTANT_COLOR,[vu]:i.CONSTANT_ALPHA,[xu]:i.ONE_MINUS_CONSTANT_ALPHA};function he(N,j,Z,pe,ce,de,Ie,Qe,le,ke){if(N===Li){m===!0&&(Oe(i.BLEND),m=!1);return}if(m===!1&&(Me(i.BLEND),m=!0),N!==nu){if(N!==g||ke!==R){if((x!==Ri||w!==Ri)&&(i.blendEquation(i.FUNC_ADD),x=Ri,w=Ri),ke)switch(N){case ns:i.blendFuncSeparate(i.ONE,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case nl:i.blendFunc(i.ONE,i.ONE);break;case il:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case sl:i.blendFuncSeparate(i.DST_COLOR,i.ONE_MINUS_SRC_ALPHA,i.ZERO,i.ONE);break;default:lt("WebGLState: Invalid blending: ",N);break}else switch(N){case ns:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case nl:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE,i.ONE,i.ONE);break;case il:lt("WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case sl:lt("WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:lt("WebGLState: Invalid blending: ",N);break}S=null,M=null,T=null,v=null,y.set(0,0,0),C=0,g=N,R=ke}return}ce=ce||j,de=de||Z,Ie=Ie||pe,(j!==x||ce!==w)&&(i.blendEquationSeparate(Ke[j],Ke[ce]),x=j,w=ce),(Z!==S||pe!==M||de!==T||Ie!==v)&&(i.blendFuncSeparate(te[Z],te[pe],te[de],te[Ie]),S=Z,M=pe,T=de,v=Ie),(Qe.equals(y)===!1||le!==C)&&(i.blendColor(Qe.r,Qe.g,Qe.b,le),y.copy(Qe),C=le),g=N,R=!1}function Y(N,j){N.side===Sn?Oe(i.CULL_FACE):Me(i.CULL_FACE);let Z=N.side===Qt;j&&(Z=!Z),ae(Z),N.blending===ns&&N.transparent===!1?he(Li):he(N.blending,N.blendEquation,N.blendSrc,N.blendDst,N.blendEquationAlpha,N.blendSrcAlpha,N.blendDstAlpha,N.blendColor,N.blendAlpha,N.premultipliedAlpha),a.setFunc(N.depthFunc),a.setTest(N.depthTest),a.setMask(N.depthWrite),r.setMask(N.colorWrite);const pe=N.stencilWrite;o.setTest(pe),pe&&(o.setMask(N.stencilWriteMask),o.setFunc(N.stencilFunc,N.stencilRef,N.stencilFuncMask),o.setOp(N.stencilFail,N.stencilZFail,N.stencilZPass)),Re(N.polygonOffset,N.polygonOffsetFactor,N.polygonOffsetUnits),N.alphaToCoverage===!0?Me(i.SAMPLE_ALPHA_TO_COVERAGE):Oe(i.SAMPLE_ALPHA_TO_COVERAGE)}function ae(N){P!==N&&(N?i.frontFace(i.CW):i.frontFace(i.CCW),P=N)}function re(N){N!==jh?(Me(i.CULL_FACE),N!==F&&(N===tl?i.cullFace(i.BACK):N===eu?i.cullFace(i.FRONT):i.cullFace(i.FRONT_AND_BACK))):Oe(i.CULL_FACE),F=N}function Be(N){N!==z&&(B&&i.lineWidth(N),z=N)}function Re(N,j,Z){N?(Me(i.POLYGON_OFFSET_FILL),(L!==j||G!==Z)&&(L=j,G=Z,a.getReversed()&&(j=-j,Z=-Z),i.polygonOffset(j,Z))):Oe(i.POLYGON_OFFSET_FILL)}function $e(N){N?Me(i.SCISSOR_TEST):Oe(i.SCISSOR_TEST)}function Je(N){N===void 0&&(N=i.TEXTURE0+X-1),ee!==N&&(i.activeTexture(N),ee=N)}function et(N,j,Z){Z===void 0&&(ee===null?Z=i.TEXTURE0+X-1:Z=ee);let pe=se[Z];pe===void 0&&(pe={type:void 0,texture:void 0},se[Z]=pe),(pe.type!==N||pe.texture!==j)&&(ee!==Z&&(i.activeTexture(Z),ee=Z),i.bindTexture(N,j||Ue[N]),pe.type=N,pe.texture=j)}function U(){const N=se[ee];N!==void 0&&N.type!==void 0&&(i.bindTexture(N.type,null),N.type=void 0,N.texture=void 0)}function yt(){try{i.compressedTexImage2D(...arguments)}catch(N){lt("WebGLState:",N)}}function tt(){try{i.compressedTexImage3D(...arguments)}catch(N){lt("WebGLState:",N)}}function mt(){try{i.texSubImage2D(...arguments)}catch(N){lt("WebGLState:",N)}}function _e(){try{i.texSubImage3D(...arguments)}catch(N){lt("WebGLState:",N)}}function At(){try{i.compressedTexSubImage2D(...arguments)}catch(N){lt("WebGLState:",N)}}function Ge(){try{i.compressedTexSubImage3D(...arguments)}catch(N){lt("WebGLState:",N)}}function We(){try{i.texStorage2D(...arguments)}catch(N){lt("WebGLState:",N)}}function A(){try{i.texStorage3D(...arguments)}catch(N){lt("WebGLState:",N)}}function b(){try{i.texImage2D(...arguments)}catch(N){lt("WebGLState:",N)}}function V(){try{i.texImage3D(...arguments)}catch(N){lt("WebGLState:",N)}}function oe(N){return p[N]!==void 0?p[N]:i.getParameter(N)}function ie(N,j){p[N]!==j&&(i.pixelStorei(N,j),p[N]=j)}function ue(N){K.equals(N)===!1&&(i.scissor(N.x,N.y,N.z,N.w),K.copy(N))}function ve(N){ge.equals(N)===!1&&(i.viewport(N.x,N.y,N.z,N.w),ge.copy(N))}function J(N,j){let Z=c.get(j);Z===void 0&&(Z=new WeakMap,c.set(j,Z));let pe=Z.get(N);pe===void 0&&(pe=i.getUniformBlockIndex(j,N.name),i.uniformBlockBinding(j,pe,pe),Z.set(N,pe))}function Q(N,j,Z){const ce=c.get(j).get(N);l[ce]!==Z&&(i.bindBufferBase(i.UNIFORM_BUFFER,ce,Z),l[ce]=Z)}function fe(){i.disable(i.BLEND),i.disable(i.CULL_FACE),i.disable(i.DEPTH_TEST),i.disable(i.POLYGON_OFFSET_FILL),i.disable(i.SCISSOR_TEST),i.disable(i.STENCIL_TEST),i.disable(i.SAMPLE_ALPHA_TO_COVERAGE),i.blendEquation(i.FUNC_ADD),i.blendFunc(i.ONE,i.ZERO),i.blendFuncSeparate(i.ONE,i.ZERO,i.ONE,i.ZERO),i.blendColor(0,0,0,0),i.colorMask(!0,!0,!0,!0),i.clearColor(0,0,0,0),i.depthMask(!0),i.depthFunc(i.LESS),a.setReversed(!1),i.clearDepth(1),i.stencilMask(4294967295),i.stencilFunc(i.ALWAYS,0,4294967295),i.stencilOp(i.KEEP,i.KEEP,i.KEEP),i.clearStencil(0),i.cullFace(i.BACK),i.frontFace(i.CCW),i.polygonOffset(0,0),i.activeTexture(i.TEXTURE0),i.bindFramebuffer(i.FRAMEBUFFER,null),i.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),i.bindFramebuffer(i.READ_FRAMEBUFFER,null),i.useProgram(null),i.lineWidth(1),i.scissor(0,0,i.canvas.width,i.canvas.height),i.viewport(0,0,i.canvas.width,i.canvas.height),i.pixelStorei(i.PACK_ALIGNMENT,4),i.pixelStorei(i.UNPACK_ALIGNMENT,4),i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,!1),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,i.BROWSER_DEFAULT_WEBGL),i.pixelStorei(i.PACK_ROW_LENGTH,0),i.pixelStorei(i.PACK_SKIP_PIXELS,0),i.pixelStorei(i.PACK_SKIP_ROWS,0),i.pixelStorei(i.UNPACK_ROW_LENGTH,0),i.pixelStorei(i.UNPACK_IMAGE_HEIGHT,0),i.pixelStorei(i.UNPACK_SKIP_PIXELS,0),i.pixelStorei(i.UNPACK_SKIP_ROWS,0),i.pixelStorei(i.UNPACK_SKIP_IMAGES,0),u={},p={},ee=null,se={},d={},l={},h=new WeakMap,f=[],_=null,m=!1,g=null,x=null,S=null,M=null,w=null,T=null,v=null,y=new Ve(0,0,0),C=0,R=!1,P=null,F=null,z=null,L=null,G=null,K.set(0,0,i.canvas.width,i.canvas.height),ge.set(0,0,i.canvas.width,i.canvas.height),r.reset(),a.reset(),o.reset()}return{buffers:{color:r,depth:a,stencil:o},enable:Me,disable:Oe,bindFramebuffer:pt,drawBuffers:ze,useProgram:Ye,setBlending:he,setMaterial:Y,setFlipSided:ae,setCullFace:re,setLineWidth:Be,setPolygonOffset:Re,setScissorTest:$e,activeTexture:Je,bindTexture:et,unbindTexture:U,compressedTexImage2D:yt,compressedTexImage3D:tt,texImage2D:b,texImage3D:V,pixelStorei:ie,getParameter:oe,updateUBOMapping:J,uniformBlockBinding:Q,texStorage2D:We,texStorage3D:A,texSubImage2D:mt,texSubImage3D:_e,compressedTexSubImage2D:At,compressedTexSubImage3D:Ge,scissor:ue,viewport:ve,reset:fe}}function Zg(i,e,t,n,s,r,a){const o=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),c=new Se,u=new WeakMap,p=new Set;let d;const h=new WeakMap,f=new Set,_=new FinalizationRegistry(A=>f.delete(A));let m=!1;try{m=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function g(A,b){return m?new OffscreenCanvas(A,b):fr("canvas")}function x(A,b,V){let oe=1;const ie=We(A);if((ie.width>V||ie.height>V)&&(oe=V/Math.max(ie.width,ie.height)),oe<1)if(typeof HTMLImageElement<"u"&&A instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&A instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&A instanceof ImageBitmap||typeof VideoFrame<"u"&&A instanceof VideoFrame){const ue=Math.floor(oe*ie.width),ve=Math.floor(oe*ie.height);d===void 0&&(d=g(ue,ve));const J=b?g(ue,ve):d;return J.width=ue,J.height=ve,J.getContext("2d").drawImage(A,0,0,ue,ve),He("WebGLRenderer: Texture has been resized from ("+ie.width+"x"+ie.height+") to ("+ue+"x"+ve+")."),J}else return"data"in A&&He("WebGLRenderer: Image in DataTexture is too big ("+ie.width+"x"+ie.height+")."),A;return A}function S(A){return A.generateMipmaps}function M(A){i.generateMipmap(A)}function w(A){return A.isWebGLCubeRenderTarget?i.TEXTURE_CUBE_MAP:A.isWebGL3DRenderTarget?i.TEXTURE_3D:A.isWebGLArrayRenderTarget||A.isCompressedArrayTexture?i.TEXTURE_2D_ARRAY:i.TEXTURE_2D}function T(A,b,V,oe,ie,ue=!1){if(A!==null){if(i[A]!==void 0)return i[A];He("WebGLRenderer: Attempt to use non-existing WebGL internal format '"+A+"'")}let ve;oe&&(ve=e.get("EXT_texture_norm16"),ve||He("WebGLRenderer: Unable to use normalized textures without EXT_texture_norm16 extension"));let J=b;if(b===i.RED&&(V===i.FLOAT&&(J=i.R32F),V===i.HALF_FLOAT&&(J=i.R16F),V===i.UNSIGNED_BYTE&&(J=i.R8),V===i.UNSIGNED_SHORT&&ve&&(J=ve.R16_EXT),V===i.SHORT&&ve&&(J=ve.R16_SNORM_EXT)),b===i.RED_INTEGER&&(V===i.UNSIGNED_BYTE&&(J=i.R8UI),V===i.UNSIGNED_SHORT&&(J=i.R16UI),V===i.UNSIGNED_INT&&(J=i.R32UI),V===i.BYTE&&(J=i.R8I),V===i.SHORT&&(J=i.R16I),V===i.INT&&(J=i.R32I)),b===i.RG&&(V===i.FLOAT&&(J=i.RG32F),V===i.HALF_FLOAT&&(J=i.RG16F),V===i.UNSIGNED_BYTE&&(J=i.RG8),V===i.UNSIGNED_SHORT&&ve&&(J=ve.RG16_EXT),V===i.SHORT&&ve&&(J=ve.RG16_SNORM_EXT)),b===i.RG_INTEGER&&(V===i.UNSIGNED_BYTE&&(J=i.RG8UI),V===i.UNSIGNED_SHORT&&(J=i.RG16UI),V===i.UNSIGNED_INT&&(J=i.RG32UI),V===i.BYTE&&(J=i.RG8I),V===i.SHORT&&(J=i.RG16I),V===i.INT&&(J=i.RG32I)),b===i.RGB_INTEGER&&(V===i.UNSIGNED_BYTE&&(J=i.RGB8UI),V===i.UNSIGNED_SHORT&&(J=i.RGB16UI),V===i.UNSIGNED_INT&&(J=i.RGB32UI),V===i.BYTE&&(J=i.RGB8I),V===i.SHORT&&(J=i.RGB16I),V===i.INT&&(J=i.RGB32I)),b===i.RGBA_INTEGER&&(V===i.UNSIGNED_BYTE&&(J=i.RGBA8UI),V===i.UNSIGNED_SHORT&&(J=i.RGBA16UI),V===i.UNSIGNED_INT&&(J=i.RGBA32UI),V===i.BYTE&&(J=i.RGBA8I),V===i.SHORT&&(J=i.RGBA16I),V===i.INT&&(J=i.RGBA32I)),b===i.RGB&&(V===i.UNSIGNED_SHORT&&ve&&(J=ve.RGB16_EXT),V===i.SHORT&&ve&&(J=ve.RGB16_SNORM_EXT),V===i.UNSIGNED_INT_5_9_9_9_REV&&(J=i.RGB9_E5),V===i.UNSIGNED_INT_10F_11F_11F_REV&&(J=i.R11F_G11F_B10F)),b===i.RGBA){const Q=ue?dr:at.getTransfer(ie);V===i.FLOAT&&(J=i.RGBA32F),V===i.HALF_FLOAT&&(J=i.RGBA16F),V===i.UNSIGNED_BYTE&&(J=Q===dt?i.SRGB8_ALPHA8:i.RGBA8),V===i.UNSIGNED_SHORT&&ve&&(J=ve.RGBA16_EXT),V===i.SHORT&&ve&&(J=ve.RGBA16_SNORM_EXT),V===i.UNSIGNED_SHORT_4_4_4_4&&(J=i.RGBA4),V===i.UNSIGNED_SHORT_5_5_5_1&&(J=i.RGB5_A1)}return(J===i.R16F||J===i.R32F||J===i.RG16F||J===i.RG32F||J===i.RGBA16F||J===i.RGBA32F)&&e.get("EXT_color_buffer_float"),J}function v(A,b){let V;return A?b===null||b===wn||b===Ui?V=i.DEPTH24_STENCIL8:b===yn?V=i.DEPTH32F_STENCIL8:b===us&&(V=i.DEPTH24_STENCIL8,He("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):b===null||b===wn||b===Ui?V=i.DEPTH_COMPONENT24:b===yn?V=i.DEPTH_COMPONENT32F:b===us&&(V=i.DEPTH_COMPONENT16),V}function y(A,b){return S(A)===!0||A.isFramebufferTexture&&A.minFilter!==Bt&&A.minFilter!==Jt?Math.log2(Math.max(b.width,b.height))+1:A.mipmaps.length>0?A.mipmaps.length:A.isCompressedTexture&&Array.isArray(A.image)?b.mipmaps.length:1}function C(A){const b=new WeakRef(A);n.get(A).__ref=b,f.add(b),_.register(A,b,b)}function R(A){const b=n.get(A).__ref;b!==void 0&&(f.delete(b),_.unregister(b))}function P(A){z(A.target)}function F(A){L(A.target)}function z(A){A.removeEventListener("dispose",P),R(A),X(A),A.isVideoTexture&&u.delete(A),A.isHTMLTexture&&p.delete(A)}function L(A){A.removeEventListener("dispose",F),R(A),ne(A)}function G(){for(const A of f){const b=A.deref();b!==void 0&&(b.isRenderTarget===!0?L(b):z(b))}f.clear(),p.clear()}function X(A){const b=n.get(A);if(b.__webglInit===void 0)return;const V=A.source,oe=h.get(V);if(oe){const ie=oe[b.__cacheKey];ie.usedTimes--,ie.usedTimes===0&&B(A),Object.keys(oe).length===0&&h.delete(V)}n.remove(A)}function B(A){const b=n.get(A);i.deleteTexture(b.__webglTexture);const V=A.source,oe=h.get(V);delete oe[b.__cacheKey],a.memory.textures--}function ne(A){const b=n.get(A);b.__depthDisposeCallback&&b.__depthDisposeCallback();const V=A.depthTexture;if(V&&V.renderTarget===A&&z(V),A.isWebGLCubeRenderTarget)for(let ie=0;ie<6;ie++){if(Array.isArray(b.__webglFramebuffer[ie]))for(let ue=0;ue<b.__webglFramebuffer[ie].length;ue++)i.deleteFramebuffer(b.__webglFramebuffer[ie][ue]);else i.deleteFramebuffer(b.__webglFramebuffer[ie]);b.__webglDepthbuffer&&i.deleteRenderbuffer(b.__webglDepthbuffer[ie])}else{if(Array.isArray(b.__webglFramebuffer))for(let ie=0;ie<b.__webglFramebuffer.length;ie++)i.deleteFramebuffer(b.__webglFramebuffer[ie]);else i.deleteFramebuffer(b.__webglFramebuffer);if(b.__webglDepthbuffer&&i.deleteRenderbuffer(b.__webglDepthbuffer),b.__webglMultisampledFramebuffer&&i.deleteFramebuffer(b.__webglMultisampledFramebuffer),b.__webglColorRenderbuffer)for(let ie=0;ie<b.__webglColorRenderbuffer.length;ie++)b.__webglColorRenderbuffer[ie]&&i.deleteRenderbuffer(b.__webglColorRenderbuffer[ie]);b.__webglDepthRenderbuffer&&i.deleteRenderbuffer(b.__webglDepthRenderbuffer)}const oe=A.textures;for(let ie=0,ue=oe.length;ie<ue;ie++){const ve=n.get(oe[ie]);ve.__webglTexture&&(i.deleteTexture(ve.__webglTexture),a.memory.textures--),n.remove(oe[ie])}n.remove(A)}let q=0;function ee(){q=0}function se(){return q}function Te(A){q=A}function Fe(){const A=q;return A>=s.maxTextures&&He("WebGLTextures: Trying to use "+(A+1)+" texture units while this GPU supports only "+s.maxTextures),q+=1,A}function K(A){const b=[];return b.push(A.wrapS),b.push(A.wrapT),b.push(A.wrapR||0),b.push(A.magFilter),b.push(A.minFilter),b.push(A.anisotropy),b.push(A.internalFormat),b.push(A.format),b.push(A.type),b.push(A.generateMipmaps),b.push(A.mipmapsAutoUpdate),b.push(A.premultiplyAlpha),b.push(A.flipY),b.push(A.unpackAlignment),b.push(A.colorSpace),b.join()}function ge(A,b){const V=n.get(A);if(A.isVideoTexture&&At(A),A.isRenderTargetTexture===!1&&A.isExternalTexture!==!0&&A.version>0&&V.__version!==A.version){const oe=A.image;if(oe===null)He("WebGLRenderer: Texture marked for update but no image data found.");else if(oe.complete===!1)He("WebGLRenderer: Texture marked for update but image is incomplete");else{Y(V,A,b);return}}else A.isExternalTexture&&(V.__webglTexture=A.sourceTexture?A.sourceTexture:null);t.bindTexture(i.TEXTURE_2D,V.__webglTexture,i.TEXTURE0+b)}function Ae(A,b){const V=n.get(A);if(A.isRenderTargetTexture===!1&&A.version>0&&V.__version!==A.version){Y(V,A,b);return}else A.isExternalTexture&&(V.__webglTexture=A.sourceTexture?A.sourceTexture:null);t.bindTexture(i.TEXTURE_2D_ARRAY,V.__webglTexture,i.TEXTURE0+b)}function Ue(A,b){const V=n.get(A);if(A.isRenderTargetTexture===!1&&A.version>0&&V.__version!==A.version){Y(V,A,b);return}t.bindTexture(i.TEXTURE_3D,V.__webglTexture,i.TEXTURE0+b)}function Me(A,b){const V=n.get(A);if(A.version>0&&V.__version!==A.version){ae(V,A,b);return}t.bindTexture(i.TEXTURE_CUBE_MAP,V.__webglTexture,i.TEXTURE0+b)}const Oe={[ya]:i.REPEAT,[Un]:i.CLAMP_TO_EDGE,[ba]:i.MIRRORED_REPEAT},pt={[Bt]:i.NEAREST,[yu]:i.NEAREST_MIPMAP_NEAREST,[As]:i.NEAREST_MIPMAP_LINEAR,[Jt]:i.LINEAR,[Dr]:i.LINEAR_MIPMAP_NEAREST,[Zn]:i.LINEAR_MIPMAP_LINEAR},ze={[Tu]:i.NEVER,[Hc]:i.ALWAYS,[Au]:i.LESS,[zc]:i.LEQUAL,[Ru]:i.EQUAL,[Gc]:i.GEQUAL,[Cu]:i.GREATER,[Pu]:i.NOTEQUAL};function Ye(A,b){if(b.type===yn&&e.has("OES_texture_float_linear")===!1&&(b.magFilter===Jt||b.magFilter===Dr||b.magFilter===As||b.magFilter===Zn||b.minFilter===Jt||b.minFilter===Dr||b.minFilter===As||b.minFilter===Zn)&&He("WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),i.texParameteri(A,i.TEXTURE_WRAP_S,Oe[b.wrapS]),i.texParameteri(A,i.TEXTURE_WRAP_T,Oe[b.wrapT]),(A===i.TEXTURE_3D||A===i.TEXTURE_2D_ARRAY)&&i.texParameteri(A,i.TEXTURE_WRAP_R,Oe[b.wrapR]),i.texParameteri(A,i.TEXTURE_MAG_FILTER,pt[b.magFilter]),i.texParameteri(A,i.TEXTURE_MIN_FILTER,pt[b.minFilter]),b.compareFunction&&(i.texParameteri(A,i.TEXTURE_COMPARE_MODE,i.COMPARE_REF_TO_TEXTURE),i.texParameteri(A,i.TEXTURE_COMPARE_FUNC,ze[b.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(b.magFilter===Bt||b.minFilter!==As&&b.minFilter!==Zn||b.type===yn&&e.has("OES_texture_float_linear")===!1)return;if(b.anisotropy>1||n.get(b).__currentAnisotropy){const V=e.get("EXT_texture_filter_anisotropic");i.texParameterf(A,V.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(b.anisotropy,s.getMaxAnisotropy())),n.get(b).__currentAnisotropy=b.anisotropy}}}function Ke(A,b){let V=!1;A.__webglInit===void 0&&(A.__webglInit=!0,b.addEventListener("dispose",P),C(b));const oe=b.source;let ie=h.get(oe);ie===void 0&&(ie={},h.set(oe,ie));const ue=K(b);if(ue!==A.__cacheKey){ie[ue]===void 0&&(ie[ue]={texture:i.createTexture(),usedTimes:0},a.memory.textures++,V=!0),ie[ue].usedTimes++;const ve=ie[A.__cacheKey];ve!==void 0&&(ie[A.__cacheKey].usedTimes--,ve.usedTimes===0&&B(b)),A.__cacheKey=ue,A.__webglTexture=ie[ue].texture}return V}function te(A,b,V){return Math.floor(Math.floor(A/V)/b)}function he(A,b,V,oe){const ue=A.updateRanges;if(ue.length===0)t.texSubImage2D(i.TEXTURE_2D,0,0,0,b.width,b.height,V,oe,b.data);else{ue.sort((N,j)=>N.start-j.start);let ve=0;for(let N=1;N<ue.length;N++){const j=ue[ve],Z=ue[N],pe=j.start+j.count,ce=te(Z.start,b.width,4),de=te(j.start,b.width,4);Z.start<=pe+1&&ce===de&&te(Z.start+Z.count-1,b.width,4)===ce?j.count=Math.max(j.count,Z.start+Z.count-j.start):(++ve,ue[ve]=Z)}ue.length=ve+1;const J=t.getParameter(i.UNPACK_ROW_LENGTH),Q=t.getParameter(i.UNPACK_SKIP_PIXELS),fe=t.getParameter(i.UNPACK_SKIP_ROWS);t.pixelStorei(i.UNPACK_ROW_LENGTH,b.width);for(let N=0,j=ue.length;N<j;N++){const Z=ue[N],pe=Math.floor(Z.start/4),ce=Math.ceil(Z.count/4),de=pe%b.width,Ie=Math.floor(pe/b.width),Qe=ce,le=1;t.pixelStorei(i.UNPACK_SKIP_PIXELS,de),t.pixelStorei(i.UNPACK_SKIP_ROWS,Ie),t.texSubImage2D(i.TEXTURE_2D,0,de,Ie,Qe,le,V,oe,b.data)}A.clearUpdateRanges(),t.pixelStorei(i.UNPACK_ROW_LENGTH,J),t.pixelStorei(i.UNPACK_SKIP_PIXELS,Q),t.pixelStorei(i.UNPACK_SKIP_ROWS,fe)}}function Y(A,b,V){let oe=i.TEXTURE_2D;(b.isDataArrayTexture||b.isCompressedArrayTexture)&&(oe=i.TEXTURE_2D_ARRAY),b.isData3DTexture&&(oe=i.TEXTURE_3D);const ie=Ke(A,b),ue=b.source;t.bindTexture(oe,A.__webglTexture,i.TEXTURE0+V);const ve=n.get(ue);if(ue.version!==ve.__version||ie===!0){if(t.activeTexture(i.TEXTURE0+V),(typeof ImageBitmap<"u"&&b.image instanceof ImageBitmap)===!1){const le=at.getPrimaries(at.workingColorSpace),ke=b.colorSpace===Kn?null:at.getPrimaries(b.colorSpace),Ze=b.colorSpace===Kn||le===ke?i.NONE:i.BROWSER_DEFAULT_WEBGL;t.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,b.flipY),t.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,b.premultiplyAlpha),t.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,Ze)}t.pixelStorei(i.UNPACK_ALIGNMENT,b.unpackAlignment);let Q=x(b.image,!1,s.maxTextureSize);Q=Ge(b,Q);const fe=r.convert(b.format,b.colorSpace),N=r.convert(b.type);let j=T(b.internalFormat,fe,N,b.normalized,b.colorSpace,b.isVideoTexture);Ye(oe,b);let Z;const pe=b.mipmaps,ce=b.isVideoTexture!==!0,de=ve.__version===void 0||ie===!0,Ie=ue.dataReady,Qe=y(b,Q);if(b.isDepthTexture)j=v(b.format===Jn,b.type),de&&(ce?t.texStorage2D(i.TEXTURE_2D,1,j,Q.width,Q.height):t.texImage2D(i.TEXTURE_2D,0,j,Q.width,Q.height,0,fe,N,null));else if(b.isDataTexture)if(pe.length>0){ce&&de&&t.texStorage2D(i.TEXTURE_2D,Qe,j,pe[0].width,pe[0].height);for(let le=0,ke=pe.length;le<ke;le++)Z=pe[le],ce?Ie&&t.texSubImage2D(i.TEXTURE_2D,le,0,0,Z.width,Z.height,fe,N,Z.data):t.texImage2D(i.TEXTURE_2D,le,j,Z.width,Z.height,0,fe,N,Z.data);b.generateMipmaps=!1}else ce?(de&&t.texStorage2D(i.TEXTURE_2D,Qe,j,Q.width,Q.height),Ie&&he(b,Q,fe,N)):t.texImage2D(i.TEXTURE_2D,0,j,Q.width,Q.height,0,fe,N,Q.data);else if(b.isCompressedTexture)if(b.isCompressedArrayTexture){ce&&de&&t.texStorage3D(i.TEXTURE_2D_ARRAY,Qe,j,pe[0].width,pe[0].height,Q.depth);for(let le=0,ke=pe.length;le<ke;le++)if(Z=pe[le],b.format!==bn)if(fe!==null)if(ce){if(Ie)if(b.layerUpdates.size>0){const Ze=Ul(Z.width,Z.height,b.format,b.type);for(const ye of b.layerUpdates){const ut=Z.data.subarray(ye*Ze/Z.data.BYTES_PER_ELEMENT,(ye+1)*Ze/Z.data.BYTES_PER_ELEMENT);t.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,le,0,0,ye,Z.width,Z.height,1,fe,ut)}}else t.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,le,0,0,0,Z.width,Z.height,Q.depth,fe,Z.data)}else t.compressedTexImage3D(i.TEXTURE_2D_ARRAY,le,j,Z.width,Z.height,Q.depth,0,Z.data,0,0);else He("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else ce?Ie&&t.texSubImage3D(i.TEXTURE_2D_ARRAY,le,0,0,0,Z.width,Z.height,Q.depth,fe,N,Z.data):t.texImage3D(i.TEXTURE_2D_ARRAY,le,j,Z.width,Z.height,Q.depth,0,fe,N,Z.data);b.layerUpdates.size>0&&b.clearLayerUpdates()}else{ce&&de&&t.texStorage2D(i.TEXTURE_2D,Qe,j,pe[0].width,pe[0].height);for(let le=0,ke=pe.length;le<ke;le++)Z=pe[le],b.format!==bn?fe!==null?ce?Ie&&t.compressedTexSubImage2D(i.TEXTURE_2D,le,0,0,Z.width,Z.height,fe,Z.data):t.compressedTexImage2D(i.TEXTURE_2D,le,j,Z.width,Z.height,0,Z.data):He("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):ce?Ie&&t.texSubImage2D(i.TEXTURE_2D,le,0,0,Z.width,Z.height,fe,N,Z.data):t.texImage2D(i.TEXTURE_2D,le,j,Z.width,Z.height,0,fe,N,Z.data)}else if(b.isDataArrayTexture)if(ce){if(de&&t.texStorage3D(i.TEXTURE_2D_ARRAY,Qe,j,Q.width,Q.height,Q.depth),Ie)if(b.layerUpdates.size>0){const le=Ul(Q.width,Q.height,b.format,b.type);for(const ke of b.layerUpdates){const Ze=Q.data.subarray(ke*le/Q.data.BYTES_PER_ELEMENT,(ke+1)*le/Q.data.BYTES_PER_ELEMENT);t.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,ke,Q.width,Q.height,1,fe,N,Ze)}b.clearLayerUpdates()}else t.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,0,Q.width,Q.height,Q.depth,fe,N,Q.data)}else t.texImage3D(i.TEXTURE_2D_ARRAY,0,j,Q.width,Q.height,Q.depth,0,fe,N,Q.data);else if(b.isData3DTexture)ce?(de&&t.texStorage3D(i.TEXTURE_3D,Qe,j,Q.width,Q.height,Q.depth),Ie&&t.texSubImage3D(i.TEXTURE_3D,0,0,0,0,Q.width,Q.height,Q.depth,fe,N,Q.data)):t.texImage3D(i.TEXTURE_3D,0,j,Q.width,Q.height,Q.depth,0,fe,N,Q.data);else if(b.isFramebufferTexture){if(de)if(ce)t.texStorage2D(i.TEXTURE_2D,Qe,j,Q.width,Q.height);else{let le=Q.width,ke=Q.height;for(let Ze=0;Ze<Qe;Ze++)t.texImage2D(i.TEXTURE_2D,Ze,j,le,ke,0,fe,N,null),le>>=1,ke>>=1}}else if(b.isHTMLTexture){if("texElementImage2D"in i){const le=i.canvas;if(le.hasAttribute("layoutsubtree")||le.setAttribute("layoutsubtree","true"),Q.parentNode!==le){le.appendChild(Q),p.add(b),le.onpaint=ke=>{const Ze=ke.changedElements;for(const ye of p)Ze.includes(ye.image)&&(ye.needsUpdate=!0)},le.requestPaint();return}if(i.texElementImage2D.length===3)i.texElementImage2D(i.TEXTURE_2D,i.RGBA8,Q);else{const Ze=i.RGBA,ye=i.RGBA,ut=i.UNSIGNED_BYTE;i.texElementImage2D(i.TEXTURE_2D,0,Ze,ye,ut,Q)}i.texParameteri(i.TEXTURE_2D,i.TEXTURE_MIN_FILTER,i.LINEAR),i.texParameteri(i.TEXTURE_2D,i.TEXTURE_WRAP_S,i.CLAMP_TO_EDGE),i.texParameteri(i.TEXTURE_2D,i.TEXTURE_WRAP_T,i.CLAMP_TO_EDGE)}}else if(pe.length>0){if(ce&&de){const le=We(pe[0]);t.texStorage2D(i.TEXTURE_2D,Qe,j,le.width,le.height)}for(let le=0,ke=pe.length;le<ke;le++)Z=pe[le],ce?Ie&&t.texSubImage2D(i.TEXTURE_2D,le,0,0,fe,N,Z):t.texImage2D(i.TEXTURE_2D,le,j,fe,N,Z);b.generateMipmaps=!1}else if(ce){if(de){const le=We(Q);t.texStorage2D(i.TEXTURE_2D,Qe,j,le.width,le.height)}Ie&&t.texSubImage2D(i.TEXTURE_2D,0,0,0,fe,N,Q)}else t.texImage2D(i.TEXTURE_2D,0,j,fe,N,Q);S(b)&&b.mipmapsAutoUpdate===!0&&M(oe),ve.__version=ue.version,b.onUpdate&&b.onUpdate(b)}A.__version=b.version}function ae(A,b,V){if(b.image.length!==6)return;const oe=Ke(A,b),ie=b.source;t.bindTexture(i.TEXTURE_CUBE_MAP,A.__webglTexture,i.TEXTURE0+V);const ue=n.get(ie);if(ie.version!==ue.__version||oe===!0){t.activeTexture(i.TEXTURE0+V);const ve=at.getPrimaries(at.workingColorSpace),J=b.colorSpace===Kn?null:at.getPrimaries(b.colorSpace),Q=b.colorSpace===Kn||ve===J?i.NONE:i.BROWSER_DEFAULT_WEBGL;t.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,b.flipY),t.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,b.premultiplyAlpha),t.pixelStorei(i.UNPACK_ALIGNMENT,b.unpackAlignment),t.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,Q);const fe=b.isCompressedTexture||b.image[0].isCompressedTexture,N=b.image[0]&&b.image[0].isDataTexture,j=[];for(let ye=0;ye<6;ye++)!fe&&!N?j[ye]=x(b.image[ye],!0,s.maxCubemapSize):j[ye]=N?b.image[ye].image:b.image[ye],j[ye]=Ge(b,j[ye]);const Z=j[0],pe=r.convert(b.format,b.colorSpace),ce=r.convert(b.type);let de=T(b.internalFormat,pe,ce,b.normalized,b.colorSpace);const Ie=b.isVideoTexture!==!0,Qe=ue.__version===void 0||oe===!0,le=ie.dataReady;let ke=y(b,Z);Ye(i.TEXTURE_CUBE_MAP,b);let Ze;if(b.isDepthTexture){if(de=v(b.format===Jn,b.type),Qe)if(Ie)t.texStorage2D(i.TEXTURE_CUBE_MAP,1,de,Z.width,Z.height);else for(let ye=0;ye<6;ye++)t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ye,0,de,Z.width,Z.height,0,pe,ce,null)}else if(fe){Ie&&Qe&&t.texStorage2D(i.TEXTURE_CUBE_MAP,ke,de,Z.width,Z.height);for(let ye=0;ye<6;ye++){Ze=j[ye].mipmaps;for(let ut=0;ut<Ze.length;ut++){const Nt=Ze[ut];b.format!==bn?pe!==null?Ie?le&&t.compressedTexSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ye,ut,0,0,Nt.width,Nt.height,pe,Nt.data):t.compressedTexImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ye,ut,de,Nt.width,Nt.height,0,Nt.data):He("WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):Ie?le&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ye,ut,0,0,Nt.width,Nt.height,pe,ce,Nt.data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ye,ut,de,Nt.width,Nt.height,0,pe,ce,Nt.data)}}}else{if(Ze=b.mipmaps,Ie&&Qe){Ze.length>0&&ke++;const ye=We(j[0]);t.texStorage2D(i.TEXTURE_CUBE_MAP,ke,de,ye.width,ye.height)}for(let ye=0;ye<6;ye++)if(N){Ie?le&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ye,0,0,0,j[ye].width,j[ye].height,pe,ce,j[ye].data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ye,0,de,j[ye].width,j[ye].height,0,pe,ce,j[ye].data);for(let ut=0;ut<Ze.length;ut++){const Gn=Ze[ut].image[ye].image;Ie?le&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ye,ut+1,0,0,Gn.width,Gn.height,pe,ce,Gn.data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ye,ut+1,de,Gn.width,Gn.height,0,pe,ce,Gn.data)}}else{Ie?le&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ye,0,0,0,pe,ce,j[ye]):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ye,0,de,pe,ce,j[ye]);for(let ut=0;ut<Ze.length;ut++){const Nt=Ze[ut];Ie?le&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ye,ut+1,0,0,pe,ce,Nt.image[ye]):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ye,ut+1,de,pe,ce,Nt.image[ye])}}}S(b)&&b.mipmapsAutoUpdate===!0&&M(i.TEXTURE_CUBE_MAP),ue.__version=ie.version,b.onUpdate&&b.onUpdate(b)}A.__version=b.version}function re(A,b,V,oe,ie,ue){const ve=r.convert(V.format,V.colorSpace),J=r.convert(V.type),Q=T(V.internalFormat,ve,J,V.normalized,V.colorSpace),fe=n.get(b),N=n.get(V);if(N.__renderTarget=b,!fe.__hasExternalTextures){const j=Math.max(1,b.width>>ue),Z=Math.max(1,b.height>>ue);ie===i.TEXTURE_3D||ie===i.TEXTURE_2D_ARRAY?t.texImage3D(ie,ue,Q,j,Z,b.depth,0,ve,J,null):t.texImage2D(ie,ue,Q,j,Z,0,ve,J,null)}t.bindFramebuffer(i.FRAMEBUFFER,A),_e(b)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,oe,ie,N.__webglTexture,0,mt(b)):(ie===i.TEXTURE_2D||ie>=i.TEXTURE_CUBE_MAP_POSITIVE_X&&ie<=i.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&i.framebufferTexture2D(i.FRAMEBUFFER,oe,ie,N.__webglTexture,ue),t.bindFramebuffer(i.FRAMEBUFFER,null)}function Be(A,b,V){if(i.bindRenderbuffer(i.RENDERBUFFER,A),b.depthBuffer){const oe=b.depthTexture,ie=oe&&oe.isDepthTexture?oe.type:null,ue=v(b.stencilBuffer,ie),ve=b.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;_e(b)?o.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,mt(b),ue,b.width,b.height):V?i.renderbufferStorageMultisample(i.RENDERBUFFER,mt(b),ue,b.width,b.height):i.renderbufferStorage(i.RENDERBUFFER,ue,b.width,b.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,ve,i.RENDERBUFFER,A)}else{const oe=b.textures;for(let ie=0;ie<oe.length;ie++){const ue=oe[ie],ve=r.convert(ue.format,ue.colorSpace),J=r.convert(ue.type),Q=T(ue.internalFormat,ve,J,ue.normalized,ue.colorSpace);_e(b)?o.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,mt(b),Q,b.width,b.height):V?i.renderbufferStorageMultisample(i.RENDERBUFFER,mt(b),Q,b.width,b.height):i.renderbufferStorage(i.RENDERBUFFER,Q,b.width,b.height)}}i.bindRenderbuffer(i.RENDERBUFFER,null)}function Re(A,b,V){const oe=b.isWebGLCubeRenderTarget===!0;if(t.bindFramebuffer(i.FRAMEBUFFER,A),!(b.depthTexture&&b.depthTexture.isDepthTexture))throw new Error("THREE.WebGLTextures: renderTarget.depthTexture must be an instance of THREE.DepthTexture.");const ie=n.get(b.depthTexture);ie.__renderTarget=b;const ue=oe?b.depthTexture.image[0]:b.depthTexture.image;(!ie.__webglTexture||ue.width!==b.width||ue.height!==b.height)&&(ue.width=b.width,ue.height=b.height,b.depthTexture.needsUpdate=!0),oe?Me(b.depthTexture,0):ge(b.depthTexture,0);const ve=ie.__webglTexture,J=mt(b),Q=oe?i.TEXTURE_CUBE_MAP_POSITIVE_X+V:i.TEXTURE_2D,fe=b.depthTexture.format===Jn?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;if(b.depthTexture.format===jn)_e(b)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,fe,Q,ve,0,J):i.framebufferTexture2D(i.FRAMEBUFFER,fe,Q,ve,0);else if(b.depthTexture.format===Jn)_e(b)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,fe,Q,ve,0,J):i.framebufferTexture2D(i.FRAMEBUFFER,fe,Q,ve,0);else throw new Error("THREE.WebGLTextures: Unknown depthTexture format.")}function $e(A){const b=n.get(A),V=A.isWebGLCubeRenderTarget===!0;if(b.__boundDepthTexture!==A.depthTexture){const oe=A.depthTexture;if(b.__depthDisposeCallback&&b.__depthDisposeCallback(),oe){const ie=()=>{delete b.__boundDepthTexture,delete b.__depthDisposeCallback,oe.removeEventListener("dispose",ie)};oe.addEventListener("dispose",ie),b.__depthDisposeCallback=ie}b.__boundDepthTexture=oe}if(A.depthTexture&&!b.__autoAllocateDepthBuffer)if(V)for(let oe=0;oe<6;oe++)Re(b.__webglFramebuffer[oe],A,oe);else A.texture.mipmaps.length>0?Re(b.__webglFramebuffer[0],A,0):Re(b.__webglFramebuffer,A,0);else if(V){b.__webglDepthbuffer=[];for(let oe=0;oe<6;oe++)if(t.bindFramebuffer(i.FRAMEBUFFER,b.__webglFramebuffer[oe]),b.__webglDepthbuffer[oe]===void 0)b.__webglDepthbuffer[oe]=i.createRenderbuffer(),Be(b.__webglDepthbuffer[oe],A,!1);else{const ie=A.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,ue=b.__webglDepthbuffer[oe];i.bindRenderbuffer(i.RENDERBUFFER,ue),i.framebufferRenderbuffer(i.FRAMEBUFFER,ie,i.RENDERBUFFER,ue)}}else if(A.texture.mipmaps.length>0?t.bindFramebuffer(i.FRAMEBUFFER,b.__webglFramebuffer[0]):t.bindFramebuffer(i.FRAMEBUFFER,b.__webglFramebuffer),b.__webglDepthbuffer===void 0)b.__webglDepthbuffer=i.createRenderbuffer(),Be(b.__webglDepthbuffer,A,!1);else{const ie=A.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,ue=b.__webglDepthbuffer;i.bindRenderbuffer(i.RENDERBUFFER,ue),i.framebufferRenderbuffer(i.FRAMEBUFFER,ie,i.RENDERBUFFER,ue)}t.bindFramebuffer(i.FRAMEBUFFER,null)}function Je(A,b,V){const oe=n.get(A);b!==void 0&&re(oe.__webglFramebuffer,A,A.texture,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,0),V!==void 0&&$e(A)}function et(A){const b=A.texture,V=n.get(A),oe=n.get(b);A.addEventListener("dispose",F),C(A);const ie=A.textures,ue=A.isWebGLCubeRenderTarget===!0,ve=ie.length>1;if(ve||(oe.__webglTexture===void 0&&(oe.__webglTexture=i.createTexture()),oe.__version=b.version,a.memory.textures++),ue){V.__webglFramebuffer=[];for(let J=0;J<6;J++)if(b.mipmaps.length>0){V.__webglFramebuffer[J]=[];for(let Q=0;Q<b.mipmaps.length;Q++)V.__webglFramebuffer[J][Q]=i.createFramebuffer()}else V.__webglFramebuffer[J]=i.createFramebuffer()}else{if(b.mipmaps.length>0){V.__webglFramebuffer=[];for(let J=0;J<b.mipmaps.length;J++)V.__webglFramebuffer[J]=i.createFramebuffer()}else V.__webglFramebuffer=i.createFramebuffer();if(ve)for(let J=0,Q=ie.length;J<Q;J++){const fe=n.get(ie[J]);fe.__webglTexture===void 0&&(fe.__webglTexture=i.createTexture(),a.memory.textures++)}if(A.samples>0&&_e(A)===!1){V.__webglMultisampledFramebuffer=i.createFramebuffer(),V.__webglColorRenderbuffer=[],t.bindFramebuffer(i.FRAMEBUFFER,V.__webglMultisampledFramebuffer);for(let J=0;J<ie.length;J++){const Q=ie[J];V.__webglColorRenderbuffer[J]=i.createRenderbuffer(),i.bindRenderbuffer(i.RENDERBUFFER,V.__webglColorRenderbuffer[J]);const fe=r.convert(Q.format,Q.colorSpace),N=r.convert(Q.type),j=T(Q.internalFormat,fe,N,Q.normalized,Q.colorSpace,A.isXRRenderTarget===!0),Z=mt(A);i.renderbufferStorageMultisample(i.RENDERBUFFER,Z,j,A.width,A.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+J,i.RENDERBUFFER,V.__webglColorRenderbuffer[J])}i.bindRenderbuffer(i.RENDERBUFFER,null),A.depthBuffer&&(V.__webglDepthRenderbuffer=i.createRenderbuffer(),Be(V.__webglDepthRenderbuffer,A,!0)),t.bindFramebuffer(i.FRAMEBUFFER,null)}}if(ue){t.bindTexture(i.TEXTURE_CUBE_MAP,oe.__webglTexture),Ye(i.TEXTURE_CUBE_MAP,b);for(let J=0;J<6;J++)if(b.mipmaps.length>0)for(let Q=0;Q<b.mipmaps.length;Q++)re(V.__webglFramebuffer[J][Q],A,b,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+J,Q);else re(V.__webglFramebuffer[J],A,b,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+J,0);S(b)?M(i.TEXTURE_CUBE_MAP):b.mipmaps.length>0&&i.texParameteri(i.TEXTURE_CUBE_MAP,i.TEXTURE_MAX_LEVEL,b.mipmaps.length-1),t.unbindTexture()}else if(ve){for(let J=0,Q=ie.length;J<Q;J++){const fe=ie[J],N=n.get(fe);let j=i.TEXTURE_2D;(A.isWebGL3DRenderTarget||A.isWebGLArrayRenderTarget)&&(j=A.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),t.bindTexture(j,N.__webglTexture),Ye(j,fe),re(V.__webglFramebuffer,A,fe,i.COLOR_ATTACHMENT0+J,j,0),S(fe)&&M(j)}t.unbindTexture()}else{let J=i.TEXTURE_2D;if((A.isWebGL3DRenderTarget||A.isWebGLArrayRenderTarget)&&(J=A.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),t.bindTexture(J,oe.__webglTexture),Ye(J,b),b.mipmaps.length>0)for(let Q=0;Q<b.mipmaps.length;Q++)re(V.__webglFramebuffer[Q],A,b,i.COLOR_ATTACHMENT0,J,Q);else re(V.__webglFramebuffer,A,b,i.COLOR_ATTACHMENT0,J,0);S(b)?M(J):b.mipmaps.length>0&&i.texParameteri(J,i.TEXTURE_MAX_LEVEL,b.mipmaps.length-1),t.unbindTexture()}A.depthBuffer&&$e(A)}function U(A){const b=A.textures;for(let V=0,oe=b.length;V<oe;V++){const ie=b[V];if(S(ie)&&ie.mipmapsAutoUpdate===!0){const ue=w(A),ve=n.get(ie).__webglTexture;t.bindTexture(ue,ve),M(ue),t.unbindTexture()}}}const yt=[];function tt(A){if(A.samples>0){if(_e(A)===!1){const b=A.textures,V=A.width,oe=A.height;let ie=i.COLOR_BUFFER_BIT;const ue=A.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,ve=n.get(A),J=b.length>1;if(J)for(let fe=0;fe<b.length;fe++)t.bindFramebuffer(i.FRAMEBUFFER,ve.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+fe,i.RENDERBUFFER,null),t.bindFramebuffer(i.FRAMEBUFFER,ve.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+fe,i.TEXTURE_2D,null,0);t.bindFramebuffer(i.READ_FRAMEBUFFER,ve.__webglMultisampledFramebuffer),A.texture.mipmaps.length>0?t.bindFramebuffer(i.DRAW_FRAMEBUFFER,ve.__webglFramebuffer[0]):t.bindFramebuffer(i.DRAW_FRAMEBUFFER,ve.__webglFramebuffer);for(let fe=0;fe<b.length;fe++){if(A.resolveDepthBuffer&&(A.depthBuffer&&(ie|=i.DEPTH_BUFFER_BIT),A.stencilBuffer&&A.resolveStencilBuffer&&(ie|=i.STENCIL_BUFFER_BIT)),J){i.framebufferRenderbuffer(i.READ_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.RENDERBUFFER,ve.__webglColorRenderbuffer[fe]);const N=n.get(b[fe]).__webglTexture;i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,N,0)}i.blitFramebuffer(0,0,V,oe,0,0,V,oe,ie,i.NEAREST),l===!0&&(yt.length=0,yt.push(i.COLOR_ATTACHMENT0+fe),A.depthBuffer&&A.storeMultisampledDepthBuffer===!1&&yt.push(ue),i.invalidateFramebuffer(i.READ_FRAMEBUFFER,yt))}if(t.bindFramebuffer(i.READ_FRAMEBUFFER,null),t.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),J)for(let fe=0;fe<b.length;fe++){t.bindFramebuffer(i.FRAMEBUFFER,ve.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+fe,i.RENDERBUFFER,ve.__webglColorRenderbuffer[fe]);const N=n.get(b[fe]).__webglTexture;t.bindFramebuffer(i.FRAMEBUFFER,ve.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+fe,i.TEXTURE_2D,N,0)}t.bindFramebuffer(i.DRAW_FRAMEBUFFER,ve.__webglMultisampledFramebuffer)}else if(A.depthBuffer&&A.storeMultisampledDepthBuffer===!1&&l){const b=A.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,[b])}}}function mt(A){return Math.min(s.maxSamples,A.samples)}function _e(A){const b=n.get(A);return A.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&b.__useRenderToTexture!==!1}function At(A){const b=a.render.frame;u.get(A)!==b&&(u.set(A,b),A.update())}function Ge(A,b){const V=A.colorSpace,oe=A.format,ie=A.type;return A.isCompressedTexture===!0||A.isVideoTexture===!0||V!==ur&&V!==Kn&&(at.getTransfer(V)===dt?(oe!==bn||ie!==sn)&&He("WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):lt("WebGLTextures: Unsupported texture color space:",V)),b}function We(A){return typeof HTMLImageElement<"u"&&A instanceof HTMLImageElement?(c.width=A.naturalWidth||A.width,c.height=A.naturalHeight||A.height):typeof VideoFrame<"u"&&A instanceof VideoFrame?(c.width=A.displayWidth,c.height=A.displayHeight):(c.width=A.width,c.height=A.height),c}this.allocateTextureUnit=Fe,this.resetTextureUnits=ee,this.getTextureUnits=se,this.setTextureUnits=Te,this.setTexture2D=ge,this.setTexture2DArray=Ae,this.setTexture3D=Ue,this.setTextureCube=Me,this.rebindTextures=Je,this.setupRenderTarget=et,this.updateRenderTargetMipmap=U,this.updateMultisampleRenderTarget=tt,this.setupDepthRenderbuffer=$e,this.setupFrameBufferTexture=re,this.useMultisampledRTT=_e,this.dispose=G}function Jg(i,e){function t(n,s=Kn){let r;const a=at.getTransfer(s);if(n===sn)return i.UNSIGNED_BYTE;if(n===uo)return i.UNSIGNED_SHORT_4_4_4_4;if(n===fo)return i.UNSIGNED_SHORT_5_5_5_1;if(n===Uc)return i.UNSIGNED_INT_5_9_9_9_REV;if(n===Fc)return i.UNSIGNED_INT_10F_11F_11F_REV;if(n===Nc)return i.BYTE;if(n===Ic)return i.SHORT;if(n===us)return i.UNSIGNED_SHORT;if(n===ho)return i.INT;if(n===wn)return i.UNSIGNED_INT;if(n===yn)return i.FLOAT;if(n===Tn)return i.HALF_FLOAT;if(n===Oc)return i.ALPHA;if(n===Bc)return i.RGB;if(n===bn)return i.RGBA;if(n===jn)return i.DEPTH_COMPONENT;if(n===Jn)return i.DEPTH_STENCIL;if(n===kc)return i.RED;if(n===po)return i.RED_INTEGER;if(n===ui)return i.RG;if(n===mo)return i.RG_INTEGER;if(n===go)return i.RGBA_INTEGER;if(n===tr||n===nr||n===ir||n===sr)if(a===dt)if(r=e.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(n===tr)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===nr)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===ir)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===sr)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=e.get("WEBGL_compressed_texture_s3tc"),r!==null){if(n===tr)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===nr)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===ir)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===sr)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(n===Ea||n===wa||n===Ta||n===Aa)if(r=e.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(n===Ea)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===wa)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===Ta)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===Aa)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(n===Ra||n===Ca||n===Pa||n===La||n===Da||n===cr||n===Na)if(r=e.get("WEBGL_compressed_texture_etc"),r!==null){if(n===Ra||n===Ca)return a===dt?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(n===Pa)return a===dt?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC;if(n===La)return r.COMPRESSED_R11_EAC;if(n===Da)return r.COMPRESSED_SIGNED_R11_EAC;if(n===cr)return r.COMPRESSED_RG11_EAC;if(n===Na)return r.COMPRESSED_SIGNED_RG11_EAC}else return null;if(n===Ia||n===Ua||n===Fa||n===Oa||n===Ba||n===ka||n===za||n===Ga||n===Ha||n===Va||n===Wa||n===Xa||n===qa||n===Ya)if(r=e.get("WEBGL_compressed_texture_astc"),r!==null){if(n===Ia)return a===dt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===Ua)return a===dt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===Fa)return a===dt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===Oa)return a===dt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===Ba)return a===dt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===ka)return a===dt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===za)return a===dt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===Ga)return a===dt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===Ha)return a===dt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===Va)return a===dt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===Wa)return a===dt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===Xa)return a===dt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===qa)return a===dt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===Ya)return a===dt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(n===$a||n===Ka||n===Za)if(r=e.get("EXT_texture_compression_bptc"),r!==null){if(n===$a)return a===dt?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===Ka)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===Za)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(n===Ja||n===Qa||n===hr||n===ja)if(r=e.get("EXT_texture_compression_rgtc"),r!==null){if(n===Ja)return r.COMPRESSED_RED_RGTC1_EXT;if(n===Qa)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===hr)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===ja)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return n===Ui?i.UNSIGNED_INT_24_8:i[n]!==void 0?i[n]:null}return{convert:t}}const Qg=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,jg=`
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

}`;class e_{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t){if(this.texture===null){const n=new eh(e.texture);(e.depthNear!==t.depthNear||e.depthFar!==t.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=n}}getMesh(e){if(this.texture!==null&&this.mesh===null){const t=e.cameras[0].viewport,n=new fi({vertexShader:Qg,fragmentShader:jg,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new zt(new br(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}}class t_ extends pi{constructor(e,t){super();const n=this;let s=null,r=1,a=null,o="local-floor",l=1,c=null,u=null,p=null,d=null,h=null,f=null;const _=typeof XRWebGLBinding<"u",m=new e_,g={},x=t.getContextAttributes();let S=null,M=null;const w=[],T=[],v=new Se;let y=null,C=null;const R=new dn;R.viewport=new Et;const P=new dn;P.viewport=new Et;const F=[R,P],z=new ff;let L=null,G=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(K){let ge=w[K];return ge===void 0&&(ge=new kr,w[K]=ge),ge.getTargetRaySpace()},this.getControllerGrip=function(K){let ge=w[K];return ge===void 0&&(ge=new kr,w[K]=ge),ge.getGripSpace()},this.getHand=function(K){let ge=w[K];return ge===void 0&&(ge=new kr,w[K]=ge),ge.getHandSpace()};function X(K){const ge=T.indexOf(K.inputSource);if(ge===-1)return;const Ae=w[ge];Ae!==void 0&&(Ae.update(K.inputSource,K.frame,c||a),Ae.dispatchEvent({type:K.type,data:K.inputSource}))}function B(){s.removeEventListener("select",X),s.removeEventListener("selectstart",X),s.removeEventListener("selectend",X),s.removeEventListener("squeeze",X),s.removeEventListener("squeezestart",X),s.removeEventListener("squeezeend",X),s.removeEventListener("end",B),s.removeEventListener("inputsourceschange",ne);for(let K=0;K<w.length;K++){const ge=T[K];ge!==null&&(T[K]=null,w[K].disconnect(ge))}L=null,G=null,m.reset();for(const K in g)delete g[K];if(e.setRenderTarget(S),h=null,d=null,p=null,s=null,M=null,Fe.stop(),n.isPresenting=!1,e.setPixelRatio(y),e.setSize(v.width,v.height,!1),C!==null){const K=C.camera;K.fov=C.fov,K.zoom=C.zoom,K.updateProjectionMatrix(),C=null}n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(K){r=K,n.isPresenting===!0&&He("WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(K){o=K,n.isPresenting===!0&&He("WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||a},this.setReferenceSpace=function(K){c=K},this.getBaseLayer=function(){return d!==null?d:h},this.getBinding=function(){return p===null&&_&&(p=new XRWebGLBinding(s,t)),p},this.getFrame=function(){return f},this.getSession=function(){return s},this.setSession=async function(K){if(s=K,s!==null){if(S=e.getRenderTarget(),s.addEventListener("select",X),s.addEventListener("selectstart",X),s.addEventListener("selectend",X),s.addEventListener("squeeze",X),s.addEventListener("squeezestart",X),s.addEventListener("squeezeend",X),s.addEventListener("end",B),s.addEventListener("inputsourceschange",ne),x.xrCompatible!==!0&&await t.makeXRCompatible(),y=e.getPixelRatio(),e.getSize(v),_&&"createProjectionLayer"in XRWebGLBinding.prototype){let Ae=null,Ue=null,Me=null;x.depth&&(Me=x.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,Ae=x.stencil?Jn:jn,Ue=x.stencil?Ui:wn);const Oe={colorFormat:t.RGBA8,depthFormat:Me,scaleFactor:r};p=this.getBinding(),d=p.createProjectionLayer(Oe),s.updateRenderState({layers:[d]}),e.setPixelRatio(1),e.setSize(d.textureWidth,d.textureHeight,!1),M=new En(d.textureWidth,d.textureHeight,{format:bn,type:sn,depthTexture:new Fi(d.textureWidth,d.textureHeight,Ue,void 0,void 0,void 0,void 0,void 0,void 0,Ae),stencilBuffer:x.stencil,colorSpace:e.outputColorSpace,samples:x.antialias?4:0,resolveDepthBuffer:d.ignoreDepthValues===!1,resolveStencilBuffer:d.ignoreDepthValues===!1,storeMultisampledDepthBuffer:d.ignoreDepthValues===!1,storeMultisampledStencilBuffer:d.ignoreDepthValues===!1})}else{const Ae={antialias:x.antialias,alpha:!0,depth:x.depth,stencil:x.stencil,framebufferScaleFactor:r};h=new XRWebGLLayer(s,t,Ae),s.updateRenderState({baseLayer:h}),e.setPixelRatio(1),e.setSize(h.framebufferWidth,h.framebufferHeight,!1),M=new En(h.framebufferWidth,h.framebufferHeight,{format:bn,type:sn,colorSpace:e.outputColorSpace,stencilBuffer:x.stencil,resolveDepthBuffer:h.ignoreDepthValues===!1,resolveStencilBuffer:h.ignoreDepthValues===!1,storeMultisampledDepthBuffer:h.ignoreDepthValues===!1,storeMultisampledStencilBuffer:h.ignoreDepthValues===!1})}M.isXRRenderTarget=!0,this.setFoveation(l),c=null,a=await s.requestReferenceSpace(o),Fe.setContext(s),Fe.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(s!==null)return s.environmentBlendMode},this.getDepthTexture=function(){return m.getDepthTexture()};function ne(K){for(let ge=0;ge<K.removed.length;ge++){const Ae=K.removed[ge],Ue=T.indexOf(Ae);Ue>=0&&(T[Ue]=null,w[Ue].disconnect(Ae))}for(let ge=0;ge<K.added.length;ge++){const Ae=K.added[ge];let Ue=T.indexOf(Ae);if(Ue===-1){for(let Oe=0;Oe<w.length;Oe++)if(Oe>=T.length){T.push(Ae),Ue=Oe;break}else if(T[Oe]===null){T[Oe]=Ae,Ue=Oe;break}if(Ue===-1)break}const Me=w[Ue];Me&&Me.connect(Ae)}}function q(K,ge){ge===null?K.matrixWorld.copy(K.matrix):K.matrixWorld.multiplyMatrices(ge.matrixWorld,K.matrix),K.matrixWorldInverse.copy(K.matrixWorld).invert()}this.updateCamera=function(K){if(s===null)return;let ge=K.near,Ae=K.far;m.texture!==null&&(m.depthNear>0&&(ge=m.depthNear),m.depthFar>0&&(Ae=m.depthFar)),z.near=P.near=R.near=ge,z.far=P.far=R.far=Ae,(L!==z.near||G!==z.far)&&(s.updateRenderState({depthNear:z.near,depthFar:z.far}),L=z.near,G=z.far),z.layers.mask=K.layers.mask|6,R.layers.mask=z.layers.mask&-5,P.layers.mask=z.layers.mask&-3;const Ue=K.parent,Me=z.cameras;q(z,Ue);for(let Oe=0;Oe<Me.length;Oe++)q(Me[Oe],Ue);z.projectionMatrix.copy(R.projectionMatrix),z.projectionMatrixInverse.copy(R.projectionMatrixInverse),C===null&&K.isPerspectiveCamera&&(C={camera:K,fov:K.fov,zoom:K.zoom}),ee(K,z,Ue)};function ee(K,ge,Ae){Ae===null?K.matrix.copy(ge.matrixWorld):(K.matrix.copy(Ae.matrixWorld),K.matrix.invert(),K.matrix.multiply(ge.matrixWorld)),K.matrix.decompose(K.position,K.quaternion,K.scale),K.updateMatrixWorld(!0),K.projectionMatrix.copy(ge.projectionMatrix),K.projectionMatrixInverse.copy(ge.projectionMatrixInverse),K.isPerspectiveCamera&&(K.fov=fs*2*Math.atan(1/K.projectionMatrix.elements[5]),K.zoom=1)}this.getCamera=function(){return z},this.getFoveation=function(){if(!(d===null&&h===null))return l},this.setFoveation=function(K){l=K,d!==null&&(d.fixedFoveation=K),h!==null&&h.fixedFoveation!==void 0&&(h.fixedFoveation=K)},this.hasDepthSensing=function(){return m.texture!==null},this.getDepthSensingMesh=function(){return m.getMesh(z)},this.getCameraTexture=function(K){return g[K]};let se=null;function Te(K,ge){if(u=ge.getViewerPose(c||a),f=ge,u!==null){const Ae=u.views;h!==null&&(e.setRenderTargetFramebuffer(M,h.framebuffer),e.setRenderTarget(M));let Ue=!1;Ae.length!==z.cameras.length&&(z.cameras.length=0,Ue=!0);for(let ze=0;ze<Ae.length;ze++){const Ye=Ae[ze];let Ke=null;if(h!==null)Ke=h.getViewport(Ye);else{const he=p.getViewSubImage(d,Ye);Ke=he.viewport,ze===0&&(e.setRenderTargetTextures(M,he.colorTexture,he.depthStencilTexture),e.setRenderTarget(M))}let te=F[ze];te===void 0&&(te=new dn,te.layers.enable(ze),te.viewport=new Et,F[ze]=te),te.matrix.fromArray(Ye.transform.matrix),te.matrix.decompose(te.position,te.quaternion,te.scale),te.projectionMatrix.fromArray(Ye.projectionMatrix),te.projectionMatrixInverse.copy(te.projectionMatrix).invert(),te.viewport.set(Ke.x,Ke.y,Ke.width,Ke.height),ze===0&&(z.matrix.copy(te.matrix),z.matrix.decompose(z.position,z.quaternion,z.scale)),Ue===!0&&z.cameras.push(te)}const Me=s.enabledFeatures;if(Me&&Me.includes("depth-sensing")&&s.depthUsage=="gpu-optimized"&&_){p=n.getBinding();const ze=p.getDepthInformation(Ae[0]);ze&&ze.isValid&&ze.texture&&m.init(ze,s.renderState)}if(Me&&Me.includes("camera-access")&&_){e.state.unbindTexture(),p=n.getBinding();for(let ze=0;ze<Ae.length;ze++){const Ye=Ae[ze].camera;if(Ye){let Ke=g[Ye];Ke||(Ke=new eh,g[Ye]=Ke);const te=p.getCameraImage(Ye);Ke.sourceTexture=te}}}}for(let Ae=0;Ae<w.length;Ae++){const Ue=T[Ae],Me=w[Ae];Ue!==null&&Me!==void 0&&Me.update(Ue,ge,c||a)}se&&se(K,ge),ge.detectedPlanes&&n.dispatchEvent({type:"planesdetected",data:ge}),f=null}const Fe=new fh;Fe.setAnimationLoop(Te),this.setAnimationLoop=function(K){se=K},this.dispose=function(){}}}const n_=new xt,bh=new Xe;bh.set(-1,0,0,0,1,0,0,0,1);function i_(i,e){function t(m,g){m.matrixAutoUpdate===!0&&m.updateMatrix(),g.value.copy(m.matrix)}function n(m,g){g.color.getRGB(m.fogColor.value,ch(i)),g.isFog?(m.fogNear.value=g.near,m.fogFar.value=g.far):g.isFogExp2&&(m.fogDensity.value=g.density)}function s(m,g,x,S,M){g.isNodeMaterial?g.uniformsNeedUpdate=!1:g.isMeshBasicMaterial?r(m,g):g.isMeshLambertMaterial?(r(m,g),g.envMap&&(m.envMapIntensity.value=g.envMapIntensity)):g.isMeshToonMaterial?(r(m,g),p(m,g)):g.isMeshPhongMaterial?(r(m,g),u(m,g),g.envMap&&(m.envMapIntensity.value=g.envMapIntensity)):g.isMeshStandardMaterial?(r(m,g),d(m,g),g.isMeshPhysicalMaterial&&h(m,g,M)):g.isMeshMatcapMaterial?(r(m,g),f(m,g)):g.isMeshDepthMaterial?r(m,g):g.isMeshDistanceMaterial?(r(m,g),_(m,g)):g.isMeshNormalMaterial?r(m,g):g.isLineBasicMaterial?(a(m,g),g.isLineDashedMaterial&&o(m,g)):g.isPointsMaterial?l(m,g,x,S):g.isSpriteMaterial?c(m,g):g.isShadowMaterial?(m.color.value.copy(g.color),m.opacity.value=g.opacity):g.isShaderMaterial&&(g.uniformsNeedUpdate=!1)}function r(m,g){m.opacity.value=g.opacity,g.color&&m.diffuse.value.copy(g.color),g.emissive&&m.emissive.value.copy(g.emissive).multiplyScalar(g.emissiveIntensity),g.map&&(m.map.value=g.map,t(g.map,m.mapTransform)),g.alphaMap&&(m.alphaMap.value=g.alphaMap,t(g.alphaMap,m.alphaMapTransform)),g.bumpMap&&(m.bumpMap.value=g.bumpMap,t(g.bumpMap,m.bumpMapTransform),m.bumpScale.value=g.bumpScale,g.side===Qt&&(m.bumpScale.value*=-1)),g.normalMap&&(m.normalMap.value=g.normalMap,t(g.normalMap,m.normalMapTransform),m.normalScale.value.copy(g.normalScale),g.side===Qt&&m.normalScale.value.negate()),g.displacementMap&&(m.displacementMap.value=g.displacementMap,t(g.displacementMap,m.displacementMapTransform),m.displacementScale.value=g.displacementScale,m.displacementBias.value=g.displacementBias),g.emissiveMap&&(m.emissiveMap.value=g.emissiveMap,t(g.emissiveMap,m.emissiveMapTransform)),g.specularMap&&(m.specularMap.value=g.specularMap,t(g.specularMap,m.specularMapTransform)),g.alphaTest>0&&(m.alphaTest.value=g.alphaTest);const x=e.get(g),S=x.envMap,M=x.envMapRotation;S&&(m.envMap.value=S,m.envMapRotation.value.setFromMatrix4(n_.makeRotationFromEuler(M)).transpose(),S.isCubeTexture&&S.isRenderTargetTexture===!1&&m.envMapRotation.value.premultiply(bh),m.reflectivity.value=g.reflectivity,m.ior.value=g.ior,m.refractionRatio.value=g.refractionRatio),g.lightMap&&(m.lightMap.value=g.lightMap,m.lightMapIntensity.value=g.lightMapIntensity,t(g.lightMap,m.lightMapTransform)),g.aoMap&&(m.aoMap.value=g.aoMap,m.aoMapIntensity.value=g.aoMapIntensity,t(g.aoMap,m.aoMapTransform))}function a(m,g){m.diffuse.value.copy(g.color),m.opacity.value=g.opacity,g.map&&(m.map.value=g.map,t(g.map,m.mapTransform))}function o(m,g){m.dashSize.value=g.dashSize,m.totalSize.value=g.dashSize+g.gapSize,m.scale.value=g.scale}function l(m,g,x,S){m.diffuse.value.copy(g.color),m.opacity.value=g.opacity,m.size.value=g.size*x,m.scale.value=S*.5,g.map&&(m.map.value=g.map,t(g.map,m.uvTransform)),g.alphaMap&&(m.alphaMap.value=g.alphaMap,t(g.alphaMap,m.alphaMapTransform)),g.alphaTest>0&&(m.alphaTest.value=g.alphaTest)}function c(m,g){m.diffuse.value.copy(g.color),m.opacity.value=g.opacity,m.rotation.value=g.rotation,g.map&&(m.map.value=g.map,t(g.map,m.mapTransform)),g.alphaMap&&(m.alphaMap.value=g.alphaMap,t(g.alphaMap,m.alphaMapTransform)),g.alphaTest>0&&(m.alphaTest.value=g.alphaTest)}function u(m,g){m.specular.value.copy(g.specular),m.shininess.value=Math.max(g.shininess,1e-4)}function p(m,g){g.gradientMap&&(m.gradientMap.value=g.gradientMap)}function d(m,g){m.metalness.value=g.metalness,g.metalnessMap&&(m.metalnessMap.value=g.metalnessMap,t(g.metalnessMap,m.metalnessMapTransform)),m.roughness.value=g.roughness,g.roughnessMap&&(m.roughnessMap.value=g.roughnessMap,t(g.roughnessMap,m.roughnessMapTransform)),g.envMap&&(m.envMapIntensity.value=g.envMapIntensity)}function h(m,g,x){m.ior.value=g.ior,g.diffuseRoughness>0&&(m.diffuseRoughness.value=g.diffuseRoughness,g.diffuseRoughnessMap&&(m.diffuseRoughnessMap.value=g.diffuseRoughnessMap,t(g.diffuseRoughnessMap,m.diffuseRoughnessMapTransform))),g.sheen>0&&(m.sheenColor.value.copy(g.sheenColor).multiplyScalar(g.sheen),m.sheenRoughness.value=g.sheenRoughness,g.sheenColorMap&&(m.sheenColorMap.value=g.sheenColorMap,t(g.sheenColorMap,m.sheenColorMapTransform)),g.sheenRoughnessMap&&(m.sheenRoughnessMap.value=g.sheenRoughnessMap,t(g.sheenRoughnessMap,m.sheenRoughnessMapTransform))),g.clearcoat>0&&(m.clearcoat.value=g.clearcoat,m.clearcoatRoughness.value=g.clearcoatRoughness,g.clearcoatMap&&(m.clearcoatMap.value=g.clearcoatMap,t(g.clearcoatMap,m.clearcoatMapTransform)),g.clearcoatRoughnessMap&&(m.clearcoatRoughnessMap.value=g.clearcoatRoughnessMap,t(g.clearcoatRoughnessMap,m.clearcoatRoughnessMapTransform)),g.clearcoatNormalMap&&(m.clearcoatNormalMap.value=g.clearcoatNormalMap,t(g.clearcoatNormalMap,m.clearcoatNormalMapTransform),m.clearcoatNormalScale.value.copy(g.clearcoatNormalScale),g.side===Qt&&m.clearcoatNormalScale.value.negate())),g.dispersion>0&&(m.dispersion.value=g.dispersion),g.retroreflectivity>0&&(m.retroreflectivity.value=g.retroreflectivity),g.iridescence>0&&(m.iridescence.value=g.iridescence,m.iridescenceIOR.value=g.iridescenceIOR,m.iridescenceThicknessMinimum.value=g.iridescenceThicknessMinimum,m.iridescenceThicknessMaximum.value=g.iridescenceThicknessMaximum,g.iridescenceMap&&(m.iridescenceMap.value=g.iridescenceMap,t(g.iridescenceMap,m.iridescenceMapTransform)),g.iridescenceThicknessMap&&(m.iridescenceThicknessMap.value=g.iridescenceThicknessMap,t(g.iridescenceThicknessMap,m.iridescenceThicknessMapTransform))),g.transmission>0&&(m.transmission.value=g.transmission,m.transmissionSamplerMap.value=x.texture,m.transmissionSamplerSize.value.set(x.width,x.height),g.transmissionMap&&(m.transmissionMap.value=g.transmissionMap,t(g.transmissionMap,m.transmissionMapTransform)),m.thickness.value=g.thickness,g.thicknessMap&&(m.thicknessMap.value=g.thicknessMap,t(g.thicknessMap,m.thicknessMapTransform)),m.attenuationDistance.value=g.attenuationDistance,m.attenuationColor.value.copy(g.attenuationColor)),g.anisotropy>0&&(m.anisotropyVector.value.set(g.anisotropy*Math.cos(g.anisotropyRotation),g.anisotropy*Math.sin(g.anisotropyRotation)),g.anisotropyMap&&(m.anisotropyMap.value=g.anisotropyMap,t(g.anisotropyMap,m.anisotropyMapTransform))),m.specularIntensity.value=g.specularIntensity,m.specularColor.value.copy(g.specularColor),g.specularColorMap&&(m.specularColorMap.value=g.specularColorMap,t(g.specularColorMap,m.specularColorMapTransform)),g.specularIntensityMap&&(m.specularIntensityMap.value=g.specularIntensityMap,t(g.specularIntensityMap,m.specularIntensityMapTransform))}function f(m,g){g.matcap&&(m.matcap.value=g.matcap)}function _(m,g){const x=e.get(g).light;m.referencePosition.value.setFromMatrixPosition(x.matrixWorld),m.nearDistance.value=x.shadow.camera.near,m.farDistance.value=x.shadow.camera.far}return{refreshFogUniforms:n,refreshMaterialUniforms:s}}function s_(i,e,t,n){let s={},r={};function a(x,S){const M=S.program;n.uniformBlockBinding(x,M,s[x.id])}function o(x,S){let M=s[x.id];M===void 0&&(f(x),M=l(x),s[x.id]=M,x.addEventListener("dispose",m));const w=S.program;n.updateUBOMapping(x,w);const T=e.render.frame;r[x.id]!==T&&(c(x),r[x.id]=T)}function l(x){const S=i.createBuffer(),M=x.__size,w=x.usage;return i.bindBuffer(i.UNIFORM_BUFFER,S),i.bufferData(i.UNIFORM_BUFFER,M,w),i.bindBuffer(i.UNIFORM_BUFFER,null),S}function c(x){const S=s[x.id],M=x.uniforms,w=x.__cache;i.bindBuffer(i.UNIFORM_BUFFER,S);for(let T=0,v=M.length;T<v;T++){const y=M[T];if(Array.isArray(y))for(let C=0,R=y.length;C<R;C++)u(y[C],T,C,w);else u(y,T,0,w)}i.bindBuffer(i.UNIFORM_BUFFER,null)}function u(x,S,M,w){if(d(x,S,M,w)===!0){const T=x.__offset,v=x.value;if(Array.isArray(v)){let y=0;for(let C=0;C<v.length;C++){const R=v[C],P=_(R,!0);p(R,x.__data,y),y+=P.storage/Float32Array.BYTES_PER_ELEMENT}}else p(v,x.__data,0);i.bufferSubData(i.UNIFORM_BUFFER,T,x.__data)}}function p(x,S,M){typeof x=="number"||typeof x=="boolean"?S[M]=x:x.isMatrix3?(S[M]=x.elements[0],S[M+1]=x.elements[1],S[M+2]=x.elements[2],S[M+3]=0,S[M+4]=x.elements[3],S[M+5]=x.elements[4],S[M+6]=x.elements[5],S[M+7]=0,S[M+8]=x.elements[6],S[M+9]=x.elements[7],S[M+10]=x.elements[8],S[M+11]=0):ArrayBuffer.isView(x)?S.set(x.subarray(0,S.length-M),M):x.toArray(S,M)}function d(x,S,M,w){const T=x.value,v=S+"_"+M;if(Array.isArray(T)){w[v]===void 0&&(w[v]=[]);const y=w[v];let C=!1;for(let R=0;R<T.length;R++)h(T[R],y,R)===!0&&(C=!0);return C}return h(T,w,v)}function h(x,S,M){if(S[M]===void 0)return typeof x=="number"||typeof x=="boolean"?S[M]=x:ArrayBuffer.isView(x)?S[M]=x.slice():S[M]=x.clone(),!0;{const w=S[M];if(typeof x=="number"||typeof x=="boolean"){if(w!==x)return S[M]=x,!0}else{if(ArrayBuffer.isView(x))return!0;if(w.equals(x)===!1)return w.copy(x),!0}}return!1}function f(x){const S=x.uniforms;let M=0;const w=16;for(let v=0,y=S.length;v<y;v++){const C=Array.isArray(S[v])?S[v]:[S[v]];for(let R=0,P=C.length;R<P;R++){const F=C[R],z=Array.isArray(F.value)?F.value:[F.value],L=Array.isArray(S[v])||Array.isArray(F.value);let G=M;for(let B=0,ne=z.length;B<ne;B++){const q=z[B],ee=_(q,L),se=M%w,Te=se%ee.boundary,Fe=se+Te;M+=Te,Fe!==0&&w-Fe<ee.storage&&(M+=w-Fe),B===0&&(G=M),M+=ee.storage}const X=F.type==="int"?Int32Array:F.type==="uint"?Uint32Array:Float32Array;F.__data=new X((M-G)/Float32Array.BYTES_PER_ELEMENT),F.__offset=G}}const T=M%w;return T>0&&(M+=w-T),x.__size=M,x.__cache={},this}function _(x,S){const M={boundary:0,storage:0};return typeof x=="number"||typeof x=="boolean"?(M.boundary=4,M.storage=4):x.isVector2?(M.boundary=8,M.storage=8):x.isVector3||x.isColor?(M.boundary=16,M.storage=12):x.isVector4?(M.boundary=16,M.storage=16):x.isMatrix3?(M.boundary=16,M.storage=48):x.isMatrix4?(M.boundary=16,M.storage=64):x.isTexture?He("WebGLRenderer: Texture samplers can not be part of an uniforms group."):ArrayBuffer.isView(x)?(M.boundary=16,M.storage=x.byteLength):He("WebGLRenderer: Unsupported uniform value type.",x),S===!0&&(M.boundary=16,M.storage=Math.ceil(M.storage/16)*16),M}function m(x){const S=x.target;S.removeEventListener("dispose",m),i.deleteBuffer(s[S.id]),delete s[S.id],delete r[S.id]}function g(){for(const x in s)i.deleteBuffer(s[x]);s={},r={}}return{bind:a,update:o,dispose:g}}const r_=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]);let xn=null;function a_(){return xn===null&&(xn=new Md(r_,16,16,ui,Tn),xn.name="DFG_LUT",xn.minFilter=Jt,xn.magFilter=Jt,xn.wrapS=Un,xn.wrapT=Un,xn.generateMipmaps=!1,xn.needsUpdate=!0),xn}class o_{constructor(e={}){const{canvas:t=Nu(),context:n=null,depth:s=!0,stencil:r=!1,alpha:a=!1,antialias:o=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:u="default",failIfMajorPerformanceCaveat:p=!1,reversedDepthBuffer:d=!1,outputBufferType:h=sn}=e;this.isWebGLRenderer=!0;let f;if(n!==null){if(typeof WebGLRenderingContext<"u"&&n instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");f=n.getContextAttributes().alpha}else f=a;const _=h,m=new Set([go,mo,po]),g=new Set([sn,wn,us,Ui,uo,fo]),x=new Uint32Array(4),S=new Int32Array(4),M={textures:[],min:[],max:[],resolution:[]};let w=null,T=null;const v=[],y=[];let C=null;this.domElement=t,this.debug={checkShaderErrors:!0,diagnostics:{keywords:!1},onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=On,this.toneMappingExposure=1,this.transmissionResolutionScale=1;const R=this;let P=!1,F=null,z=null,L=null,G=null;this._outputColorSpace=an;let X=0,B=0,ne=null,q=-1,ee=null;const se=new Et,Te=new Et;let Fe=null;const K=new Ve(0);let ge=0,Ae=t.width,Ue=t.height,Me=1,Oe=null,pt=null;const ze=new Et(0,0,Ae,Ue),Ye=new Et(0,0,Ae,Ue);let Ke=!1;const te=new ps,he=new bo;let Y=!1,ae=!1;const re=new xt,Be=new O,Re=new Et,$e={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};let Je=!1;function et(){return ne===null?Me:1}let U=n;function yt(E,I){return t.getContext(E,I)}let tt,mt,_e,At,Ge,We,A,b,V,oe,ie,ue,ve,J,Q,fe,N,j,Z,pe,ce,de,Ie;try{const E={alpha:!0,depth:s,stencil:r,antialias:o,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:u,failIfMajorPerformanceCaveat:p};if("setAttribute"in t&&t.setAttribute("data-engine",`three.js r${lo}`),t.addEventListener("webglcontextlost",ke,!1),t.addEventListener("webglcontextrestored",Ze,!1),t.addEventListener("webglcontextcreationerror",ye,!1),U===null){const I="webgl2";if(U=yt(I,E),U===null)throw yt(I)?new Error("THREE.WebGLRenderer: Error creating WebGL context with your selected attributes."):new Error("THREE.WebGLRenderer: Error creating WebGL context.")}Qe()}catch(E){throw t.removeEventListener("webglcontextlost",ke,!1),t.removeEventListener("webglcontextrestored",Ze,!1),t.removeEventListener("webglcontextcreationerror",ye,!1),lt("WebGLRenderer: "+E.message),E}function Qe(){tt=new h0(U),tt.init(),ce=new Jg(U,tt),mt=new jm(U,tt,e,ce),_e=new Kg(U,tt),mt.reversedDepthBuffer&&d&&_e.buffers.depth.setReversed(!0),z=U.createFramebuffer(),L=U.createFramebuffer(),G=U.createFramebuffer(),At=new f0(U),Ge=new Ug,We=new Zg(U,tt,_e,Ge,mt,ce,At),A=new c0(R),b=new mf(U),de=new Jm(U,b),V=new u0(U,b,At,de),oe=new m0(U,V,b,de,At),j=new p0(U,mt,We),Q=new e0(Ge),ie=new Ig(R,A,tt,mt,de,Q),ue=new i_(R,Ge),ve=new Og,J=new Vg(tt),N=new Zm(R,A,_e,oe,f,l),fe=new $g(R,oe,mt),Ie=new s_(U,At,mt,_e),Z=new Qm(U,tt,At),pe=new d0(U,tt,At),At.programs=ie.programs,R.capabilities=mt,R.extensions=tt,R.properties=Ge,R.renderLists=ve,R.shadowMap=fe,R.state=_e,R.info=At}_!==sn&&(C=new _0(_,t.width,t.height,o,s,r));const le=new t_(R,U);this.xr=le,this.getContext=function(){return U},this.getContextAttributes=function(){return U.getContextAttributes()},this.forceContextLoss=function(){const E=tt.get("WEBGL_lose_context");E&&E.loseContext()},this.forceContextRestore=function(){const E=tt.get("WEBGL_lose_context");E&&E.restoreContext()},this.getPixelRatio=function(){return Me},this.setPixelRatio=function(E){E!==void 0&&(Me=E,this.setSize(Ae,Ue,!1))},this.getSize=function(E){return E.set(Ae,Ue)},this.setSize=function(E,I,$=!0){if(le.isPresenting){He("WebGLRenderer: Can't change size while VR device is presenting.");return}Ae=E,Ue=I,t.width=Math.floor(E*Me),t.height=Math.floor(I*Me),$===!0&&(t.style.width=E+"px",t.style.height=I+"px"),C!==null&&C.setSize(t.width,t.height),this.setViewport(0,0,E,I)},this.getDrawingBufferSize=function(E){return E.set(Ae*Me,Ue*Me).floor()},this.setDrawingBufferSize=function(E,I,$){Ae=E,Ue=I,Me=$,t.width=Math.floor(E*$),t.height=Math.floor(I*$),this.setViewport(0,0,E,I)},this.setEffects=function(E){if(_===sn){lt("WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.");return}if(E){for(let I=0;I<E.length;I++)if(E[I].isOutputPass===!0){He("WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.");break}}C.setEffects(E||[])},this.getCurrentViewport=function(E){return E.copy(se)},this.getViewport=function(E){return E.copy(ze)},this.setViewport=function(E,I,$,H){E.isVector4?ze.set(E.x,E.y,E.z,E.w):ze.set(E,I,$,H),_e.viewport(se.copy(ze).multiplyScalar(et()).round())},this.getScissor=function(E){return E.copy(Ye)},this.setScissor=function(E,I,$,H){E.isVector4?Ye.set(E.x,E.y,E.z,E.w):Ye.set(E,I,$,H),_e.scissor(Te.copy(Ye).multiplyScalar(et()).round())},this.getScissorTest=function(){return Ke},this.setScissorTest=function(E){_e.setScissorTest(Ke=E)},this.setOpaqueSort=function(E){Oe=E},this.setTransparentSort=function(E){pt=E},this.getClearColor=function(E){return E.copy(N.getClearColor())},this.setClearColor=function(){N.setClearColor(...arguments)},this.getClearAlpha=function(){return N.getClearAlpha()},this.setClearAlpha=function(){N.setClearAlpha(...arguments)},this.clear=function(E=!0,I=!0,$=!0){let H=0;if(E){let W=!1;if(ne!==null){const xe=ne.texture.format;W=m.has(xe)}if(W){const xe=ne.texture.type,Ce=g.has(xe),me=N.getClearColor(),Ee=N.getClearAlpha(),De=me.r,qe=me.g,st=me.b;Ce?(x[0]=De,x[1]=qe,x[2]=st,x[3]=Ee,U.clearBufferuiv(U.COLOR,0,x)):(S[0]=De,S[1]=qe,S[2]=st,S[3]=Ee,U.clearBufferiv(U.COLOR,0,S))}else H|=U.COLOR_BUFFER_BIT}I&&(H|=U.DEPTH_BUFFER_BIT,this.state.buffers.depth.setMask(!0)),$&&(H|=U.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),H!==0&&U.clear(H)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.setNodesHandler=function(E){E.setRenderer(this),F=E},this.dispose=function(){t.removeEventListener("webglcontextlost",ke,!1),t.removeEventListener("webglcontextrestored",Ze,!1),t.removeEventListener("webglcontextcreationerror",ye,!1),N.dispose(),ve.dispose(),J.dispose(),We.dispose(),Ge.dispose(),A.dispose(),oe.dispose(),V.dispose(),de.dispose(),Ie.dispose(),ie.dispose(),le.dispose(),le.removeEventListener("sessionstart",Vo),le.removeEventListener("sessionend",Wo),ni.stop()};function ke(E){E.preventDefault(),ol("WebGLRenderer: Context Lost."),P=!0}function Ze(){ol("WebGLRenderer: Context Restored."),P=!1;const E=At.autoReset,I=fe.enabled,$=fe.autoUpdate,H=fe.needsUpdate,W=fe.type;Qe(),At.autoReset=E,fe.enabled=I,fe.autoUpdate=$,fe.needsUpdate=H,fe.type=W}function ye(E){lt("WebGLRenderer: A WebGL context could not be created. Reason: ",E.statusMessage)}function ut(E){const I=E.target;I.removeEventListener("dispose",ut),Nt(I)}function Nt(E){Gn(E),Ge.remove(E)}function Gn(E){const I=Ge.get(E).programs;I!==void 0&&(I.forEach(function($){ie.releaseProgram($)}),E.isShaderMaterial&&ie.releaseShaderCache(E))}this.renderBufferDirect=function(E,I,$,H,W,xe){I===null&&(I=$e);const Ce=W.isMesh&&W.matrixWorld.determinantAffine()<0,me=zh(E,I,$,H,W);_e.setMaterial(H,Ce);let Ee=$.index,De=1;if(H.wireframe===!0){if(Ee=V.getWireframeAttribute($),Ee===void 0)return;De=2}const qe=$.drawRange,st=$.attributes.position;let Pe=qe.start*De,rt=(qe.start+qe.count)*De;xe!==null&&(Pe=Math.max(Pe,xe.start*De),rt=Math.min(rt,(xe.start+xe.count)*De)),Ee!==null?(Pe=Math.max(Pe,0),rt=Math.min(rt,Ee.count)):st!=null&&(Pe=Math.max(Pe,0),rt=Math.min(rt,st.count));const Ct=rt-Pe;if(Ct<0||Ct===1/0)return;de.setup(W,H,me,$,Ee);let Mt,gt=Z;if(Ee!==null&&(Mt=b.get(Ee),gt=pe,gt.setIndex(Mt)),W.isMesh)H.wireframe===!0?(_e.setLineWidth(H.wireframeLinewidth*et()),gt.setMode(U.LINES)):gt.setMode(U.TRIANGLES);else if(W.isLine){let Gt=H.linewidth;Gt===void 0&&(Gt=1),_e.setLineWidth(Gt*et()),W.isLineSegments?gt.setMode(U.LINES):W.isLineLoop?gt.setMode(U.LINE_LOOP):gt.setMode(U.LINE_STRIP)}else W.isPoints?gt.setMode(U.POINTS):W.isSprite&&gt.setMode(U.TRIANGLES);if(W.isBatchedMesh)if(tt.get("WEBGL_multi_draw"))gt.renderMultiDraw(W._multiDrawStarts,W._multiDrawCounts,W._multiDrawCount);else{const Gt=W._multiDrawStarts,Le=W._multiDrawCounts,qt=W._multiDrawCount,ct=Ee?b.get(Ee).bytesPerElement:1,ii=Ge.get(H).currentProgram.getUniforms();for(let Ht=0;Ht<qt;Ht++)ii.setValue(U,"_gl_DrawID",Ht),gt.render(Gt[Ht]/ct,Le[Ht])}else if(W.isInstancedMesh)gt.renderInstances(Pe,Ct,W.count);else if($.isInstancedBufferGeometry){const Gt=$._maxInstanceCount!==void 0?$._maxInstanceCount:1/0,Le=Math.min($.instanceCount,Gt);gt.renderInstances(Pe,Ct,Le)}else gt.render(Pe,Ct)};function Ho(E,I,$,H){F!==null&&E.isNodeMaterial&&F.setObject(H,E),Y===!0&&Q.setState(E,$,!1),E.transparent===!0&&E.side===Sn&&E.forceSinglePass===!1?(E.side=Qt,E.needsUpdate=!0,Hi(E,I,H),E.side=hi,E.needsUpdate=!0,Hi(E,I,H),E.side=Sn):Hi(E,I,H)}this.compile=function(E,I,$=null){$===null&&($=E),F!==null&&F.renderStart(E,I,$),T=J.get($),T.init(I),y.push(T),$.traverseVisible(function(W){W.isLight&&W.layers.test(I.layers)&&(T.pushLight(W),W.castShadow&&T.pushShadow(W))}),E!==$&&E.traverseVisible(function(W){W.isLight&&W.layers.test(I.layers)&&(T.pushLight(W),W.castShadow&&T.pushShadow(W))}),T.setupLights(),F!==null&&F.updateLights(T.state.lightsArray),ae=this.localClippingEnabled,Y=Q.init(this.clippingPlanes,ae),Y===!0&&Q.setGlobalState(this.clippingPlanes,I),F!==null&&fe.render(T.state.shadowsArray,$,I);const H=new Set;return E.traverse(function(W){if(!(W.isMesh||W.isPoints||W.isLine||W.isSprite))return;const xe=W.material;if(xe)if(Array.isArray(xe))for(let Ce=0;Ce<xe.length;Ce++){const me=xe[Ce];Ho(me,$,I,W),H.add(me)}else Ho(xe,$,I,W),H.add(xe)}),T=y.pop(),F!==null&&F.renderEnd(),H},this.compileAsync=function(E,I,$=null){const H=this.compile(E,I,$);return new Promise(W=>{function xe(){if(H.forEach(function(Ce){const Ee=Ge.get(Ce).currentProgram;(Ee===void 0||Ee.isReady())&&H.delete(Ce)}),H.size===0){W(E);return}setTimeout(xe,10)}tt.get("KHR_parallel_shader_compile")!==null?xe():setTimeout(xe,10)})};let Ar=null;function Bh(E){Ar&&Ar(E)}function Vo(){ni.stop()}function Wo(){ni.start()}const ni=new fh;ni.setAnimationLoop(Bh),typeof self<"u"&&ni.setContext(self),this.setAnimationLoop=function(E){Ar=E,le.setAnimationLoop(E),E===null?ni.stop():ni.start()},le.addEventListener("sessionstart",Vo),le.addEventListener("sessionend",Wo),this.render=function(E,I){if(I!==void 0&&I.isCamera!==!0){lt("WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(P===!0)return;F!==null&&F.renderStart(E,I);const $=le.enabled===!0&&le.isPresenting===!0,H=C!==null&&(ne===null||$)&&C.begin(R,ne);if(E.matrixWorldAutoUpdate===!0&&E.updateMatrixWorld(),I.parent===null&&I.matrixWorldAutoUpdate===!0&&I.updateMatrixWorld(),le.enabled===!0&&le.isPresenting===!0&&(C===null||C.isCompositing()===!1)&&(le.cameraAutoUpdate===!0&&le.updateCamera(I),I=le.getCamera()),E.isScene===!0&&E.onBeforeRender(R,E,I,ne),T=J.get(E,y.length),T.init(I),T.state.textureUnits=We.getTextureUnits(),y.push(T),re.multiplyMatrices(I.projectionMatrix,I.matrixWorldInverse),I.isArrayCamera?he.setFromArrayCamera(I):te.setFromProjectionMatrix(re,mn,I.reversedDepth),ae=this.localClippingEnabled,Y=Q.init(this.clippingPlanes,ae),w=ve.get(E,v.length),w.init(),v.push(w),this.info.render.frame++,le.enabled===!0&&le.isPresenting===!0){const Ce=R.xr.getDepthSensingMesh();Ce!==null&&Rr(Ce,I,-1/0,R.sortObjects)}Rr(E,I,0,R.sortObjects),w.finish(),F!==null&&F.updateLights(T.state.lightsArray),R.sortObjects===!0&&w.sort(Oe,pt),Je=le.enabled===!1||le.isPresenting===!1||le.hasDepthSensing()===!1,Je&&N.addToRenderList(w,E),this.info.autoReset===!0&&this.info.reset(),Y===!0&&Q.beginShadows();const W=T.state.shadowsArray;if(fe.render(W,E,I),Y===!0&&Q.endShadows(),(H&&C.hasRenderPass())===!1){const Ce=w.opaque,me=w.transmissive;if(T.setupLights(),I.isArrayCamera){const Ee=I.cameras;if(me.length>0)for(let De=0,qe=Ee.length;De<qe;De++){const st=Ee[De];qo(Ce,me,E,st)}Je&&N.render(E);for(let De=0,qe=Ee.length;De<qe;De++){const st=Ee[De];Xo(w,E,st,st.viewport)}}else me.length>0&&qo(Ce,me,E,I),Je&&N.render(E),Xo(w,E,I)}ne!==null&&B===0&&(We.updateMultisampleRenderTarget(ne),We.updateRenderTargetMipmap(ne)),H&&C.end(R),E.isScene===!0&&E.onAfterRender(R,E,I),de.resetDefaultState(),q=-1,ee=null,y.pop(),y.length>0?(T=y[y.length-1],We.setTextureUnits(T.state.textureUnits),Y===!0&&Q.setGlobalState(R.clippingPlanes,T.state.camera)):T=null,v.pop(),v.length>0?w=v[v.length-1]:w=null,F!==null&&F.renderEnd()};function Rr(E,I,$,H){if(E.visible===!1)return;if(E.layers.test(I.layers)){if(E.isGroup)$=E.renderOrder;else if(E.isLOD)E.autoUpdate===!0&&E.update(I);else if(E.isLight)T.pushLight(E),E.castShadow&&T.pushShadow(E);else if(E.isSprite){const Ce=I.isArrayCamera?he:te;if(!E.frustumCulled||E.intersectsFrustum(Ce)){H&&Re.setFromMatrixPosition(E.matrixWorld).applyMatrix4(re);const me=oe.update(E),Ee=E.material;Ee.visible&&w.push(E,me,Ee,$,Re.z,null,I)}}else if(E.isMesh||E.isLine||E.isPoints){const Ce=I.isArrayCamera?he:te;if(!E.frustumCulled||E.intersectsFrustum(Ce)){const me=oe.update(E),Ee=E.material;if(H&&(E.boundingSphere!==void 0?(E.boundingSphere===null&&E.computeBoundingSphere(),Re.copy(E.boundingSphere.center)):(me.boundingSphere===null&&me.computeBoundingSphere(),Re.copy(me.boundingSphere.center)),Re.applyMatrix4(E.matrixWorld).applyMatrix4(re)),Array.isArray(Ee)){const De=me.groups;for(let qe=0,st=De.length;qe<st;qe++){const Pe=De[qe],rt=Ee[Pe.materialIndex];rt&&rt.visible&&w.push(E,me,rt,$,Re.z,Pe,I)}}else Ee.visible&&w.push(E,me,Ee,$,Re.z,null,I)}}}const xe=E.children;for(let Ce=0,me=xe.length;Ce<me;Ce++)Rr(xe[Ce],I,$,H)}function Xo(E,I,$,H){const{opaque:W,transmissive:xe,transparent:Ce}=E;T.setupLightsView($),Y===!0&&Q.setGlobalState(R.clippingPlanes,$),H&&_e.viewport(se.copy(H)),W.length>0&&Es(W,I,$),xe.length>0&&Es(xe,I,$),Ce.length>0&&Es(Ce,I,$),_e.buffers.depth.setTest(!0),_e.buffers.depth.setMask(!0),_e.buffers.color.setMask(!0),_e.setPolygonOffset(!1)}function qo(E,I,$,H){if(($.isScene===!0?$.overrideMaterial:null)!==null)return;if(T.state.transmissionRenderTarget[H.id]===void 0){const Pe=tt.has("EXT_color_buffer_half_float")||tt.has("EXT_color_buffer_float");T.state.transmissionRenderTarget[H.id]=new En(1,1,{generateMipmaps:!0,type:Pe?Tn:sn,minFilter:Zn,samples:Math.max(4,mt.samples),stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,colorSpace:at.workingColorSpace})}const xe=T.state.transmissionRenderTarget[H.id],Ce=H.viewport||se;xe.setSize(Ce.z*R.transmissionResolutionScale,Ce.w*R.transmissionResolutionScale);const me=R.getRenderTarget(),Ee=R.getActiveCubeFace(),De=R.getActiveMipmapLevel();R.setRenderTarget(xe),R.getClearColor(K),ge=R.getClearAlpha(),ge<1&&R.setClearColor(16777215,.5),R.clear(),Je&&N.render($);const qe=R.toneMapping;R.toneMapping=On;const st=H.viewport;if(H.viewport!==void 0&&(H.viewport=void 0),T.setupLightsView(H),Y===!0&&Q.setGlobalState(R.clippingPlanes,H),Es(E,$,H),We.updateMultisampleRenderTarget(xe),We.updateRenderTargetMipmap(xe),tt.has("WEBGL_multisampled_render_to_texture")===!1){let Pe=!1;for(let rt=0,Ct=I.length;rt<Ct;rt++){const Mt=I[rt],{object:gt,geometry:Gt,material:Le,group:qt}=Mt;if(Le.side===Sn&&gt.layers.test(H.layers)){const ct=Le.side;Le.side=Qt,Le.needsUpdate=!0,Yo(gt,$,H,Gt,Le,qt),Le.side=ct,Le.needsUpdate=!0,Pe=!0}}Pe===!0&&(We.updateMultisampleRenderTarget(xe),We.updateRenderTargetMipmap(xe))}R.setRenderTarget(me,Ee,De),R.setClearColor(K,ge),st!==void 0&&(H.viewport=st),R.toneMapping=qe}function Es(E,I,$){const H=I.isScene===!0?I.overrideMaterial:null;for(let W=0,xe=E.length;W<xe;W++){const Ce=E[W],{object:me,geometry:Ee,group:De}=Ce;let qe=Ce.material;qe.allowOverride===!0&&H!==null&&(qe=H),me.layers.test($.layers)&&Yo(me,I,$,Ee,qe,De)}}function Yo(E,I,$,H,W,xe){F!==null&&W.isNodeMaterial&&F.setObject(E,W),E.onBeforeRender(R,I,$,H,W,xe),E.modelViewMatrix.multiplyMatrices($.matrixWorldInverse,E.matrixWorld),E.normalMatrix.getNormalMatrix(E.modelViewMatrix),W.onBeforeRender(R,I,$,H,E,xe),W.transparent===!0&&W.side===Sn&&W.forceSinglePass===!1?(W.side=Qt,W.needsUpdate=!0,R.renderBufferDirect($,I,H,W,E,xe),W.side=hi,W.needsUpdate=!0,R.renderBufferDirect($,I,H,W,E,xe),W.side=Sn):R.renderBufferDirect($,I,H,W,E,xe),E.onAfterRender(R,I,$,H,W,xe)}function $o(E){let I=0;for(const $ of E)$.texture!==null&&I++;return I}function Hi(E,I,$){I.isScene!==!0&&(I=$e);const H=Ge.get(E),W=T.state.lights,xe=T.state.shadowsArray,Ce=W.state.version,me=ie.getParameters(E,W.state,xe,I,$,T.state.lightProbeGridArray),Ee=ie.getProgramCacheKey(me);let De=H.programs;H.environment=E.isMeshStandardMaterial||E.isMeshLambertMaterial||E.isMeshPhongMaterial?I.environment:null,H.fog=I.fog;const qe=E.isMeshStandardMaterial||E.isMeshLambertMaterial&&!E.envMap||E.isMeshPhongMaterial&&!E.envMap;H.envMap=A.get(E.envMap||H.environment,qe),H.envMapRotation=H.environment!==null&&E.envMap===null?I.environmentRotation:E.envMapRotation,De===void 0&&(E.addEventListener("dispose",ut),De=new Map,H.programs=De,H.programVariants=new Map);let st=De.get(Ee);if(st!==void 0){if(H.currentProgram===st&&H.lightsStateVersion===Ce)return Zo(E,me),st}else me.uniforms=ie.getUniforms(E),F!==null&&E.isNodeMaterial&&F.build(E,$,me),E.onBeforeCompile(me,R),st=ie.acquireProgram(me,Ee),De.set(Ee,st),H.uniforms=me.uniforms;const Pe=H.uniforms;return(!E.isShaderMaterial&&!E.isRawShaderMaterial||E.clipping===!0)&&(Pe.clippingPlanes=Q.uniform),Zo(E,me),H.needsLights=Hh(E),H.lightsStateVersion=Ce,H.needsLights&&(Pe.ambientLightColor.value=W.state.ambient,Pe.lightProbe.value=W.state.probe,Pe.sunLights.value=W.state.sun,Pe.sunLightShadows.value=W.state.sunShadow,Pe.directionalLights.value=W.state.directional,Pe.directionalLightShadows.value=W.state.directionalShadow,Pe.spotLights.value=W.state.spot,Pe.spotLightShadows.value=W.state.spotShadow,Pe.rectAreaLights.value=W.state.rectArea,Pe.ltc_1.value=W.state.rectAreaLTC1,Pe.ltc_2.value=W.state.rectAreaLTC2,Pe.pointLights.value=W.state.point,Pe.pointLightShadows.value=W.state.pointShadow,Pe.hemisphereLights.value=W.state.hemi,Pe.sunShadowMatrix.value=W.state.sunShadowMatrix,Pe.sunShadowCascade.value=W.state.sunShadowCascade,Pe.directionalShadowMatrix.value=W.state.directionalShadowMatrix,Pe.spotLightMatrix.value=W.state.spotLightMatrix,Pe.spotLightMap.value=W.state.spotLightMap,Pe.pointShadowMatrix.value=W.state.pointShadowMatrix),H.numLightProbeGrids=$o(T.state.lightProbeGridArray),H.currentProgram=st,H.uniformsList=null,st}function kh(E,I,$,H,W){const xe=Ge.get(E),Ce=xe.currentProgram.id+","+H+","+W;let me=xe.programVariants.get(Ce);return me===void 0?(me=Hi(E,I,$),xe.programVariants.set(Ce,me)):(xe.currentProgram=me,xe.uniformsList=null,xe.outputColorSpace=H,xe.toneMapping=W),me}function Ko(E){if(E.uniformsList===null){const I=E.currentProgram.getUniforms();E.uniformsList=ar.seqWithValue(I.seq,E.uniforms)}return E.uniformsList}function Zo(E,I){const $=Ge.get(E);$.outputColorSpace=I.outputColorSpace,$.batching=I.batching,$.batchingColor=I.batchingColor,$.instancing=I.instancing,$.instancingColor=I.instancingColor,$.instancingMorph=I.instancingMorph,$.skinning=I.skinning,$.morphTargets=I.morphTargets,$.morphNormals=I.morphNormals,$.morphColors=I.morphColors,$.morphTargetsCount=I.morphTargetsCount,$.numClippingPlanes=I.numClippingPlanes,$.numIntersection=I.numClipIntersection,$.vertexAlphas=I.vertexAlphas,$.vertexTangents=I.vertexTangents,$.toneMapping=I.toneMapping}function zh(E,I,$,H,W){I.isScene!==!0&&(I=$e),We.resetTextureUnits();const xe=I.fog,Ce=H.isMeshStandardMaterial||H.isMeshLambertMaterial||H.isMeshPhongMaterial?I.environment:null,me=ne===null?R.outputColorSpace:ne.isXRRenderTarget===!0?ne.texture.colorSpace:at.workingColorSpace,Ee=H.isMeshStandardMaterial||H.isMeshLambertMaterial&&!H.envMap||H.isMeshPhongMaterial&&!H.envMap,De=A.get(H.envMap||Ce,Ee),qe=H.vertexColors===!0&&!!$.attributes.color&&$.attributes.color.itemSize===4,st=!!$.attributes.tangent&&(!!H.normalMap||H.anisotropy>0),Pe=!!$.morphAttributes.position,rt=!!$.morphAttributes.normal,Ct=!!$.morphAttributes.color;let Mt=On;H.toneMapped&&(ne===null||ne.isXRRenderTarget===!0)&&(Mt=R.toneMapping);const gt=$.morphAttributes.position||$.morphAttributes.normal||$.morphAttributes.color,Gt=gt!==void 0?gt.length:0,Le=Ge.get(H),qt=T.state.lights;if(Y===!0&&(ae===!0||E!==ee)){const bt=E===ee&&H.id===q;Q.setState(H,E,bt)}let ct=!1,ii=!1;H.version===Le.__version?Le.needsLights&&Le.lightsStateVersion!==qt.state.version||W.isBatchedMesh&&Le.batching===!1||!W.isBatchedMesh&&Le.batching===!0||W.isBatchedMesh&&Le.batchingColor===!0&&W._colorsTexture===null||W.isBatchedMesh&&Le.batchingColor===!1&&W._colorsTexture!==null||W.isInstancedMesh&&Le.instancing===!1||!W.isInstancedMesh&&Le.instancing===!0||W.isSkinnedMesh&&Le.skinning===!1||!W.isSkinnedMesh&&Le.skinning===!0||W.isInstancedMesh&&Le.instancingColor===!0&&W.instanceColor===null||W.isInstancedMesh&&Le.instancingColor===!1&&W.instanceColor!==null||W.isInstancedMesh&&Le.instancingMorph===!0&&W.morphTexture===null||W.isInstancedMesh&&Le.instancingMorph===!1&&W.morphTexture!==null||Le.envMap!==De||H.fog===!0&&Le.fog!==xe||Le.numClippingPlanes!==void 0&&(Le.numClippingPlanes!==Q.numPlanes||Le.numIntersection!==Q.numIntersection)||Le.vertexAlphas!==qe||Le.vertexTangents!==st||Le.morphTargets!==Pe||Le.morphNormals!==rt||Le.morphColors!==Ct||Le.morphTargetsCount!==Gt||Le.numLightProbeGrids!==$o(T.state.lightProbeGridArray)?ct=!0:(Le.outputColorSpace!==me||Le.toneMapping!==Mt)&&(ii=!0):(ct=!0,Le.__version=H.version);let Ht=Le.currentProgram;(ct===!0||ii===!0)&&(Ht=ii===!0?kh(H,I,W,me,Mt):Hi(H,I,W),F&&H.isNodeMaterial&&F.onUpdateProgram(H,Ht,Le));let ws=!1,Hn=!1,si=!1;const ot=Ht.getUniforms(),Ot=Le.uniforms;if(_e.useProgram(Ht.program)&&(ws=!0,Hn=!0,si=!0),H.id!==q&&(q=H.id,Hn=!0),ws||ee!==E){_e.buffers.depth.getReversed()&&E.reversedDepth!==!0&&(E._reversedDepth=!0,E.updateProjectionMatrix()),ot.setValue(U,"projectionMatrix",E.projectionMatrix),ot.setValue(U,"viewMatrix",E.matrixWorldInverse);const It=ot.map.cameraPosition;It!==void 0&&It.setValue(U,Be.setFromMatrixPosition(E.matrixWorld)),mt.logarithmicDepthBuffer&&ot.setValue(U,"logDepthBufFC",2/(Math.log(E.far+1)/Math.LN2)),(H.isMeshPhongMaterial||H.isMeshToonMaterial||H.isMeshLambertMaterial||H.isMeshBasicMaterial||H.isMeshStandardMaterial||H.isShaderMaterial)&&ot.setValue(U,"isOrthographic",E.isOrthographicCamera===!0),ee!==E&&(ee=E,Hn=!0,si=!0)}if(Le.needsLights&&(qt.state.sunShadowMap.length>0&&ot.setValue(U,"sunShadowMap",qt.state.sunShadowMap,We),qt.state.directionalShadowMap.length>0&&ot.setValue(U,"directionalShadowMap",qt.state.directionalShadowMap,We),qt.state.spotShadowMap.length>0&&ot.setValue(U,"spotShadowMap",qt.state.spotShadowMap,We),qt.state.pointShadowMap.length>0&&ot.setValue(U,"pointShadowMap",qt.state.pointShadowMap,We)),W.isSkinnedMesh){ot.setOptional(U,W,"bindMatrix"),ot.setOptional(U,W,"bindMatrixInverse");const bt=W.skeleton;bt&&(bt.boneTexture===null&&bt.computeBoneTexture(),ot.setValue(U,"boneTexture",bt.boneTexture,We))}W.isBatchedMesh&&(ot.setOptional(U,W,"batchingTexture"),ot.setValue(U,"batchingTexture",W._matricesTexture,We),ot.setOptional(U,W,"batchingIdTexture"),ot.setValue(U,"batchingIdTexture",W._indirectTexture,We),ot.setOptional(U,W,"batchingColorTexture"),W._colorsTexture!==null&&ot.setValue(U,"batchingColorTexture",W._colorsTexture,We));const ln=$.morphAttributes;if((ln.position!==void 0||ln.normal!==void 0||ln.color!==void 0)&&j.update(W,$,Ht),(Hn||Le.receiveShadow!==W.receiveShadow)&&(Le.receiveShadow=W.receiveShadow,ot.setValue(U,"receiveShadow",W.receiveShadow)),(H.isMeshStandardMaterial||H.isMeshLambertMaterial||H.isMeshPhongMaterial)&&H.envMap===null&&I.environment!==null&&(Ot.envMapIntensity.value=I.environmentIntensity),Ot.dfgLUT!==void 0&&(Ot.dfgLUT.value=a_()),Hn){if(ot.setValue(U,"toneMappingExposure",R.toneMappingExposure),Le.needsLights&&Gh(Ot,si),xe&&H.fog===!0&&ue.refreshFogUniforms(Ot,xe),ue.refreshMaterialUniforms(Ot,H,Me,Ue,T.state.transmissionRenderTarget[E.id]),Le.needsLights&&Le.numLightProbeGrids>0){const bt=M;let It=0;for(const Rn of T.state.lightProbeGridArray)Rn.texture!==null&&(bt.textures[It]=Rn.texture,bt.min[It]=Rn.boundingBox.min,bt.max[It]=Rn.boundingBox.max,bt.resolution[It]=Rn.resolution,It++);for(const Rn in bt)bt[Rn].length=It;Ot.probesSH.value=bt.textures,Ot.probesMin.value=bt.min,Ot.probesMax.value=bt.max,Ot.probesResolution.value=bt.resolution}ar.upload(U,Ko(Le),Ot,We)}if(H.isShaderMaterial&&H.uniformsNeedUpdate===!0&&(ar.upload(U,Ko(Le),Ot,We),H.uniformsNeedUpdate=!1),H.isSpriteMaterial&&ot.setValue(U,"center",W.center),ot.setValue(U,"modelViewMatrix",W.modelViewMatrix),ot.setValue(U,"normalMatrix",W.normalMatrix),ot.setValue(U,"modelMatrix",W.matrixWorld),H.uniformsGroups!==void 0){const bt=H.uniformsGroups;for(let It=0,Rn=bt.length;It<Rn;It++){const Qo=bt[It];Ie.update(Qo,Ht),Ie.bind(Qo,Ht)}}return Ht}function Gh(E,I){E.ambientLightColor.needsUpdate=I,E.lightProbe.needsUpdate=I,E.sunLights.needsUpdate=I,E.sunLightShadows.needsUpdate=I,E.directionalLights.needsUpdate=I,E.directionalLightShadows.needsUpdate=I,E.pointLights.needsUpdate=I,E.pointLightShadows.needsUpdate=I,E.spotLights.needsUpdate=I,E.spotLightShadows.needsUpdate=I,E.rectAreaLights.needsUpdate=I,E.hemisphereLights.needsUpdate=I}function Hh(E){return E.isMeshLambertMaterial||E.isMeshToonMaterial||E.isMeshPhongMaterial||E.isMeshStandardMaterial||E.isShadowMaterial||E.isShaderMaterial&&E.lights===!0}this.getActiveCubeFace=function(){return X},this.getActiveMipmapLevel=function(){return B},this.getRenderTarget=function(){return ne},this.setRenderTargetTextures=function(E,I,$){const H=Ge.get(E);H.__autoAllocateDepthBuffer=E.resolveDepthBuffer===!1,H.__autoAllocateDepthBuffer===!1&&(H.__useRenderToTexture=!1),Ge.get(E.texture).__webglTexture=I,Ge.get(E.depthTexture).__webglTexture=H.__autoAllocateDepthBuffer?void 0:$,H.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(E,I){const $=Ge.get(E);$.__webglFramebuffer=I,$.__useDefaultFramebuffer=I===void 0},this.setRenderTarget=function(E,I=0,$=0){ne=E,X=I,B=$;let H=null,W=!1,xe=!1;if(E){const me=Ge.get(E);if(me.__useDefaultFramebuffer!==void 0){_e.bindFramebuffer(U.FRAMEBUFFER,me.__webglFramebuffer),se.copy(E.viewport),Te.copy(E.scissor),Fe=E.scissorTest,_e.viewport(se),_e.scissor(Te),_e.setScissorTest(Fe),q=-1;return}else if(me.__webglFramebuffer===void 0)We.setupRenderTarget(E);else if(me.__hasExternalTextures)We.rebindTextures(E,Ge.get(E.texture).__webglTexture,Ge.get(E.depthTexture).__webglTexture);else if(E.depthBuffer){const qe=E.depthTexture;if(me.__boundDepthTexture!==qe){if(qe!==null&&Ge.has(qe)&&(E.width!==qe.image.width||E.height!==qe.image.height))throw new Error("THREE.WebGLRenderer: Attached DepthTexture is initialized to the incorrect size.");We.setupDepthRenderbuffer(E)}}const Ee=E.texture;(Ee.isData3DTexture||Ee.isDataArrayTexture||Ee.isCompressedArrayTexture)&&(xe=!0);const De=Ge.get(E).__webglFramebuffer;E.isWebGLCubeRenderTarget?(Array.isArray(De[I])?H=De[I][$]:H=De[I],W=!0):E.samples>0&&We.useMultisampledRTT(E)===!1?H=Ge.get(E).__webglMultisampledFramebuffer:Array.isArray(De)?H=De[$]:H=De,se.copy(E.viewport),Te.copy(E.scissor),Fe=E.scissorTest}else se.copy(ze).multiplyScalar(Me).floor(),Te.copy(Ye).multiplyScalar(Me).floor(),Fe=Ke;if($!==0&&(H=z),_e.bindFramebuffer(U.FRAMEBUFFER,H)&&_e.drawBuffers(E,H),_e.viewport(se),_e.scissor(Te),_e.setScissorTest(Fe),W){const me=Ge.get(E.texture);U.framebufferTexture2D(U.FRAMEBUFFER,U.COLOR_ATTACHMENT0,U.TEXTURE_CUBE_MAP_POSITIVE_X+I,me.__webglTexture,$)}else if(xe){const me=I;for(let Ee=0;Ee<E.textures.length;Ee++){const De=Ge.get(E.textures[Ee]);U.framebufferTextureLayer(U.FRAMEBUFFER,U.COLOR_ATTACHMENT0+Ee,De.__webglTexture,$,me)}}else if(E!==null&&$!==0){const me=Ge.get(E.texture);U.framebufferTexture2D(U.FRAMEBUFFER,U.COLOR_ATTACHMENT0,U.TEXTURE_2D,me.__webglTexture,$)}q=-1};function Jo(E){const I=Ge.get(E);return(I.__readFormat!==E.format||I.__readType!==E.type)&&(I.__readFormat=E.format,I.__readType=E.type,I.__formatReadable=mt.textureFormatReadable(E.format),I.__typeReadable=mt.textureTypeReadable(E.type)),I}this.readRenderTargetPixels=function(E,I,$,H,W,xe,Ce,me=0){if(!(E&&E.isWebGLRenderTarget)){lt("WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let Ee=Ge.get(E).__webglFramebuffer;if(E.isWebGLCubeRenderTarget&&Ce!==void 0&&(Ee=Ee[Ce],Array.isArray(Ee)&&(Ee=Ee[0])),Ee){_e.bindFramebuffer(U.FRAMEBUFFER,Ee);try{const De=E.textures[me],qe=De.format,st=De.type;E.textures.length>1&&U.readBuffer(U.COLOR_ATTACHMENT0+me);const Pe=Jo(De);if(Pe.__formatReadable===!1){lt("WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(Pe.__typeReadable===!1){lt("WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}I>=0&&I<=E.width-H&&$>=0&&$<=E.height-W&&U.readPixels(I,$,H,W,ce.convert(qe),ce.convert(st),xe)}finally{const De=ne!==null?Ge.get(ne).__webglFramebuffer:null;_e.bindFramebuffer(U.FRAMEBUFFER,De)}}},this.readRenderTargetPixelsAsync=async function(E,I,$,H,W,xe,Ce,me=0){if(!(E&&E.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let Ee=Ge.get(E).__webglFramebuffer;if(E.isWebGLCubeRenderTarget&&Ce!==void 0&&(Ee=Ee[Ce],Array.isArray(Ee)&&(Ee=Ee[0])),Ee)if(I>=0&&I<=E.width-H&&$>=0&&$<=E.height-W){_e.bindFramebuffer(U.FRAMEBUFFER,Ee);const De=E.textures[me],qe=De.format,st=De.type;E.textures.length>1&&U.readBuffer(U.COLOR_ATTACHMENT0+me);const Pe=Jo(De);if(Pe.__formatReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(Pe.__typeReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");const rt=U.createBuffer();U.bindBuffer(U.PIXEL_PACK_BUFFER,rt),U.bufferData(U.PIXEL_PACK_BUFFER,xe.byteLength,U.STREAM_READ),U.readPixels(I,$,H,W,ce.convert(qe),ce.convert(st),0),U.bindBuffer(U.PIXEL_PACK_BUFFER,null);const Ct=ne!==null?Ge.get(ne).__webglFramebuffer:null;_e.bindFramebuffer(U.FRAMEBUFFER,Ct);const Mt=U.fenceSync(U.SYNC_GPU_COMMANDS_COMPLETE,0);return U.flush(),await Iu(U,Mt,4),U.bindBuffer(U.PIXEL_PACK_BUFFER,rt),U.getBufferSubData(U.PIXEL_PACK_BUFFER,0,xe),U.bindBuffer(U.PIXEL_PACK_BUFFER,null),U.deleteBuffer(rt),U.deleteSync(Mt),xe}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(E,I=null,$=0){const H=Math.pow(2,-$),W=Math.floor(E.image.width*H),xe=Math.floor(E.image.height*H),Ce=I!==null?I.x:0,me=I!==null?I.y:0;We.setTexture2D(E,0),U.copyTexSubImage2D(U.TEXTURE_2D,$,0,0,Ce,me,W,xe),_e.unbindTexture()},this.copyTextureToTexture=function(E,I,$=null,H=null,W=0,xe=0){let Ce,me,Ee,De,qe,st,Pe,rt,Ct;const Mt=E.isCompressedTexture?E.mipmaps[xe]:E.image;if($!==null)Ce=$.max.x-$.min.x,me=$.max.y-$.min.y,Ee=$.isBox3?$.max.z-$.min.z:1,De=$.min.x,qe=$.min.y,st=$.isBox3?$.min.z:0;else{const ot=Math.pow(2,-W);Ce=Math.floor(Mt.width*ot),me=Math.floor(Mt.height*ot),E.isDataArrayTexture?Ee=Mt.depth:E.isData3DTexture?Ee=Math.floor(Mt.depth*ot):Ee=1,De=0,qe=0,st=0}H!==null?(Pe=H.x,rt=H.y,Ct=H.z):(Pe=0,rt=0,Ct=0);const gt=ce.convert(I.format),Gt=ce.convert(I.type);let Le;I.isData3DTexture?(We.setTexture3D(I,0),Le=U.TEXTURE_3D):I.isDataArrayTexture||I.isCompressedArrayTexture?(We.setTexture2DArray(I,0),Le=U.TEXTURE_2D_ARRAY):(We.setTexture2D(I,0),Le=U.TEXTURE_2D),_e.activeTexture(U.TEXTURE0),_e.pixelStorei(U.UNPACK_FLIP_Y_WEBGL,I.flipY),_e.pixelStorei(U.UNPACK_PREMULTIPLY_ALPHA_WEBGL,I.premultiplyAlpha),_e.pixelStorei(U.UNPACK_ALIGNMENT,I.unpackAlignment);const qt=_e.getParameter(U.UNPACK_ROW_LENGTH),ct=_e.getParameter(U.UNPACK_IMAGE_HEIGHT),ii=_e.getParameter(U.UNPACK_SKIP_PIXELS),Ht=_e.getParameter(U.UNPACK_SKIP_ROWS),ws=_e.getParameter(U.UNPACK_SKIP_IMAGES);_e.pixelStorei(U.UNPACK_ROW_LENGTH,Mt.width),_e.pixelStorei(U.UNPACK_IMAGE_HEIGHT,Mt.height),_e.pixelStorei(U.UNPACK_SKIP_PIXELS,De),_e.pixelStorei(U.UNPACK_SKIP_ROWS,qe),_e.pixelStorei(U.UNPACK_SKIP_IMAGES,st);const Hn=E.isDataArrayTexture||E.isData3DTexture,si=I.isDataArrayTexture||I.isData3DTexture;if(E.isDepthTexture){const ot=Ge.get(E),Ot=Ge.get(I),ln=Ge.get(ot.__renderTarget),bt=Ge.get(Ot.__renderTarget);_e.bindFramebuffer(U.READ_FRAMEBUFFER,ln.__webglFramebuffer),_e.bindFramebuffer(U.DRAW_FRAMEBUFFER,bt.__webglFramebuffer);for(let It=0;It<Ee;It++)Hn&&(U.framebufferTextureLayer(U.READ_FRAMEBUFFER,U.COLOR_ATTACHMENT0,Ge.get(E).__webglTexture,W,st+It),U.framebufferTextureLayer(U.DRAW_FRAMEBUFFER,U.COLOR_ATTACHMENT0,Ge.get(I).__webglTexture,xe,Ct+It)),U.blitFramebuffer(De,qe,De+Ce,qe+me,Pe,rt,Pe+Ce,rt+me,U.DEPTH_BUFFER_BIT,U.NEAREST);_e.bindFramebuffer(U.READ_FRAMEBUFFER,null),_e.bindFramebuffer(U.DRAW_FRAMEBUFFER,null)}else if(W!==0||E.isRenderTargetTexture||Ge.has(E)){const ot=Ge.get(E),Ot=Ge.get(I);_e.bindFramebuffer(U.READ_FRAMEBUFFER,L),_e.bindFramebuffer(U.DRAW_FRAMEBUFFER,G);for(let ln=0;ln<Ee;ln++)Hn?U.framebufferTextureLayer(U.READ_FRAMEBUFFER,U.COLOR_ATTACHMENT0,ot.__webglTexture,W,st+ln):U.framebufferTexture2D(U.READ_FRAMEBUFFER,U.COLOR_ATTACHMENT0,U.TEXTURE_2D,ot.__webglTexture,W),si?U.framebufferTextureLayer(U.DRAW_FRAMEBUFFER,U.COLOR_ATTACHMENT0,Ot.__webglTexture,xe,Ct+ln):U.framebufferTexture2D(U.DRAW_FRAMEBUFFER,U.COLOR_ATTACHMENT0,U.TEXTURE_2D,Ot.__webglTexture,xe),W!==0?U.blitFramebuffer(De,qe,De+Ce,qe+me,Pe,rt,Pe+Ce,rt+me,U.COLOR_BUFFER_BIT,U.NEAREST):si?U.copyTexSubImage3D(Le,xe,Pe,rt,Ct+ln,De,qe,Ce,me):U.copyTexSubImage2D(Le,xe,Pe,rt,De,qe,Ce,me);_e.bindFramebuffer(U.READ_FRAMEBUFFER,null),_e.bindFramebuffer(U.DRAW_FRAMEBUFFER,null)}else si?E.isDataTexture||E.isData3DTexture?U.texSubImage3D(Le,xe,Pe,rt,Ct,Ce,me,Ee,gt,Gt,Mt.data):I.isCompressedArrayTexture?U.compressedTexSubImage3D(Le,xe,Pe,rt,Ct,Ce,me,Ee,gt,Mt.data):U.texSubImage3D(Le,xe,Pe,rt,Ct,Ce,me,Ee,gt,Gt,Mt):E.isDataTexture?U.texSubImage2D(U.TEXTURE_2D,xe,Pe,rt,Ce,me,gt,Gt,Mt.data):E.isCompressedTexture?U.compressedTexSubImage2D(U.TEXTURE_2D,xe,Pe,rt,Mt.width,Mt.height,gt,Mt.data):U.texSubImage2D(U.TEXTURE_2D,xe,Pe,rt,Ce,me,gt,Gt,Mt);_e.pixelStorei(U.UNPACK_ROW_LENGTH,qt),_e.pixelStorei(U.UNPACK_IMAGE_HEIGHT,ct),_e.pixelStorei(U.UNPACK_SKIP_PIXELS,ii),_e.pixelStorei(U.UNPACK_SKIP_ROWS,Ht),_e.pixelStorei(U.UNPACK_SKIP_IMAGES,ws),xe===0&&I.generateMipmaps===!0&&I.mipmapsAutoUpdate===!0&&U.generateMipmap(Le),_e.unbindTexture()},this.initRenderTarget=function(E){Ge.get(E).__webglFramebuffer===void 0&&We.setupRenderTarget(E)},this.initTexture=function(E){E.isCubeTexture?We.setTextureCube(E,0):E.isData3DTexture?We.setTexture3D(E,0):E.isDataArrayTexture||E.isCompressedArrayTexture?We.setTexture2DArray(E,0):We.setTexture2D(E,0),_e.unbindTexture()},this.resetState=function(){X=0,B=0,ne=null,_e.reset(),de.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return mn}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;const t=this.getContext();t.drawingBufferColorSpace=at._getDrawingBufferColorSpace(e),t.unpackColorSpace=at._getUnpackColorSpace()}}class l_{positions=[];normals=[];colors=[];indices=[];add(e){e.updateMatrixWorld(!0),e.traverse(t=>{if(!t.isMesh)return;const n=t,s=n.geometry,r=s.getAttribute("position"),a=s.getAttribute("normal");if(!r)return;const o=new Xe().getNormalMatrix(n.matrixWorld),c=(Array.isArray(n.material)?n.material[0]:n.material).color||new Ve(16777215),u=this.positions.length/3,p=new O,d=new O;for(let h=0;h<r.count;h++){p.fromBufferAttribute(r,h).applyMatrix4(n.matrixWorld),this.positions.push(p.x,p.y,p.z),a?d.fromBufferAttribute(a,h).applyMatrix3(o).normalize():d.set(0,1,0),this.normals.push(d.x,d.y,d.z);const f=s.getAttribute("color");this.colors.push(c.r*(f?f.getX(h):1),c.g*(f?f.getY(h):1),c.b*(f?f.getZ(h):1))}if(s.index)for(let h=0;h<s.index.count;h++)this.indices.push(u+s.index.getX(h));else for(let h=0;h<r.count;h++)this.indices.push(u+h)})}triangle(e,t,n,s){const r=this.positions.length/3,a=new O(t[0]-e[0],t[1]-e[1],t[2]-e[2]),o=new O(n[0]-e[0],n[1]-e[1],n[2]-e[2]),l=a.cross(o).normalize();for(const c of[e,t,n])this.positions.push(...c),this.normals.push(l.x,l.y,l.z),this.colors.push(s.r,s.g,s.b);this.indices.push(r,r+1,r+2)}packet(){return{position:new Float32Array(this.positions),normal:new Float32Array(this.normals),color:new Float32Array(this.colors),index:new Uint32Array(this.indices)}}}function Eh(i){const e=new Xt;return e.setAttribute("position",new gn(i.position,3)),e.setAttribute("normal",new gn(i.normal,3)),e.setAttribute("color",new gn(i.color,3)),e.setIndex(new gn(i.index,1)),e.computeBoundingSphere(),e}const Po=1.435,Lo=.075,Qn=(Po+Lo)/2,aa=(i,e)=>Math.hypot(i[0]-e[0],i[2]-e[2]),ic=(i,e)=>{const t=Math.hypot(e[0]-i[0],e[2]-i[2])||1;return[(e[0]-i[0])/t,0,(e[2]-i[2])/t]},Js=(i,e)=>i[0]*e[0]+i[2]*e[2],sc=(i,e)=>i.from===e?i.points:i.points.slice().reverse(),rc=i=>{const e=it(i,0,1);return e*e*(3-2*e)},Do=i=>{const e=Math.hypot(...i)||1;return i.map(t=>t/e)},oa=(i,e)=>({gaugeRight:Ni(i).map(t=>t*e),unitUp:Sc(i)}),wh=(i,e)=>{const t=i.reduce((n,s,r)=>n+s*e[r],0);return Do(i.map((n,s)=>n-t*e[s]))};function No(i,e,t){const n=i.segment(it(t,0,i.length)),s=it((t-i.lengths[n])/(i.lengths[n+1]-i.lengths[n]||1),0,1),r=e[n],a=e[n+1],o=Do(r.gaugeRight.map((l,c)=>ft(l,a.gaugeRight[c],s)));return{gaugeRight:o,unitUp:wh(r.unitUp.map((l,c)=>ft(l,a.unitUp[c],s)),o)}}function Fn(i,e,t,n,s=0){const r=i.sample(t),a=No(i,e,t);return r.position.map((o,l)=>o+a.gaugeRight[l]*n-a.unitUp[l]*s)}function c_(i){const e=new ht(i.normalPath),t=new ht(i.branchPath),n=e.lengths[i.toeIndex];return e.points.map((s,r)=>{const a=e.lengths[r],o=e.sample(a),l=t.sample(Math.max(0,a-n)),c=No(e,i.normalFrames,a),u=l.position.reduce((h,f,_)=>h+(f-o.position[_])*c.gaugeRight[_],0),p=Math.min(0,u)-1.63,d=Math.max(0,u)+1.63;return{topLeft:Fn(e,i.normalFrames,a,p,.29),topRight:Fn(e,i.normalFrames,a,d,.29),bottomLeft:Fn(e,i.normalFrames,a,p-.35,.64),bottomRight:Fn(e,i.normalFrames,a,d+.35,.64)}})}function h_(i){const e=i.data.network;if(!e?.nodes||!e.edges)return{switches:[],gaps:["No source-node rail graph was supplied."]};const t=new Map(e.edges.map(o=>[o.id,o])),n=new Map(e.nodes.map(o=>[o.id,o])),s=[],r=[],a=e.nodes.filter(o=>o.edges.length===3).sort((o,l)=>o.id.localeCompare(l.id));for(const o of a){const l=o.edges.map(Y=>t.get(Y)).filter(Y=>!!Y&&Y.points.length>=2);if(l.length!==3)continue;const c=i.project(o.position[0],o.position[2],100);if(!Number.isFinite(c.s)||c.distance>30)continue;let u=0,p=c.s,d=c.distance;if(i.opposingPath){const Y=i.opposingPath.nearest(o.position[0],o.position[2]);Y.distance<d&&(u=4.2,p=i.travel(0,Y.s,4.2),d=Y.distance)}if(d>1.8){r.push(`${o.id}: mapped junction is ${d.toFixed(2)} m from the modelled running paths; retained as source graph, not an invented operating switch.`);continue}const h=l.map(Y=>sc(Y,o.id)),f=h.map(Y=>{const ae=new ht(Y);return ic(Y[0],ae.sample(Math.min(8,ae.length)).position)});let _=[0,1],m=-1/0;for(const Y of[[0,1],[0,2],[1,2]]){const ae=Js(f[Y[0]],f[Y[1]]);ae>m&&(m=ae,_=Y)}const g=[0,1,2].find(Y=>!_.includes(Y));if(m<.65||_.some(Y=>Js(f[Y],f[g])>-.65)){r.push(`${o.id}: graph branch is not a supported simple turnout geometry.`);continue}const x=i.lanePose(p,u),S=Js(f[_[0]],x.tangent)>0?1:-1,M=Y=>{const ae=new ht(h[Y]);let re=0;for(const Be of[6,12,20]){const Re=ae.sample(Math.min(Be,ae.length)).position,$e=i.travel(p,S*Math.min(Be,ae.length),u);re+=aa(Re,i.lanePose($e,u).position)}return re},w=M(_[0])<=M(_[1])?_[0]:_[1],T=_.find(Y=>Y!==w);if(M(w)>9){r.push(`${o.id}: neither outgoing edge continues the modelled running line closely enough for a proved normal route.`);continue}const v=[l[T]];let y=h[T].map(Y=>[...Y]),C=l[T].from===o.id?l[T].to:l[T].from,R=new ht(y).length;const P=new Set([l[T].id]);for(;R<42;){const Y=n.get(C);if(!Y||Y.edges.length!==2)break;const ae=Y.edges.find(Re=>!P.has(Re)),re=ae&&t.get(ae);if(!re)break;P.add(re.id);const Be=sc(re,C);if(aa(y.at(-1),Be[0])>.1)break;y.push(...Be.slice(1)),v.push(re),C=re.from===C?re.to:re.from,R=new ht(y).length}if(R<18){r.push(`${o.id}: reverse edge ends at another unresolved junction before a complete switch can fit.`);continue}const F=new ht(y),z=Math.min(52,F.length),L=F.sample(z).position,G=i.lanePose(p,u).position,X=G.map((Y,ae)=>Y-y[0][ae]),B=[];for(let Y=0;Y<z;Y+=1){const ae=F.sample(Y).position,re=1-rc(Y/Math.min(20,z));B.push(ae.map((Be,Re)=>Be+X[Re]*re))}B.push(L);const ne=i.lanePose(i.travel(p,S*z,u),u).position;if(Js(ic(G,ne),x.tangent)*S<.5)continue;const ee=L.map((Y,ae)=>Y-ne[ae]),se=ee[0]*x.right[0]+ee[2]*x.right[2];if(Math.abs(se)<Qn*2){r.push(`${o.id}: mapped routes do not separate enough to build a complete frog before their next junction.`);continue}const Te=se*S>0?1:-1,Fe=14,K=[],ge=[],Ae=[];for(let Y=-Fe;Y<=z;Y+=1){const ae=i.lanePose(i.travel(p,S*Y,u),u);K.push(ae.position),ge.push(oa(ae,S)),Y<0&&Ae.push(ae.position)}aa(K.at(-1),ne)>.01&&(K.push(ne),ge.push(oa(i.lanePose(i.travel(p,S*z,u),u),S)));const Ue=new ht(B),Me=oa(x,S),Oe=B.map((Y,ae)=>{const re=Math.min(ae,z),Be=re>=20?F.sample(re):Ue.sample(Ue.lengths[ae]),Re=rc(re/20),$e=Ni(Be),Je=Sc(Be),et=Do(Me.gaugeRight.map((U,yt)=>ft(U,$e[yt],Re)));return{gaugeRight:et,unitUp:wh(Me.unitUp.map((U,yt)=>ft(U,Je[yt],Re)),et)}}),pt=[...Ae,...B],ze=Ae.length;let Ye=-1;for(let Y=1;Y<B.length;Y++){const ae=i.lanePose(i.travel(p,S*Math.min(Y,z),u),u),re=Ni(ae),Re=B[Y].reduce(($e,Je,et)=>$e+(Je-ae.position[et])*re[et],0);if(Math.abs(Re)>=Qn*2){Ye=Y;break}}if(Ye<5){r.push(`${o.id}: unresolved or excessively tight crossing geometry; reverse route is not fabricated.`);continue}const Ke=i.travel(p,-S*Fe,u),te=i.travel(p,S*z,u);if(s.some(Y=>Y.lane===u&&Math.max(Y.startS,Math.min(Ke,te))<Math.min(Y.endS,Math.max(Ke,te)))){r.push(`${o.id}: overlaps a neighbouring simple-switch envelope; compound trackwork requires authoring.`);continue}const he={id:`SW-${o.id}`,s:p,lane:u,sourceNode:o.id,direction:S,normalEdgeIds:[l[g].id,l[w].id],reverseEdgeIds:[l[g].id,l[T].id],branchEdgeIds:v.map(Y=>Y.id),sourceWayIds:[...new Set([...l,...v].flatMap(Y=>Y.sourceWayIds||[]))],normalPath:K,normalFrames:ge,reversePath:pt,branchPath:B,branchFrames:Oe,formationSections:[],startS:Math.min(Ke,te),endS:Math.max(Ke,te),toeIndex:ze,hand:Te,frogIndex:Ye,sourcePosition:o.position,position:G,sourceFitAdjustment:Math.hypot(...X),sourceEndpoint:L,supportPaths:[K,B],gauge:Po,replaceRunningRailWithinSpan:!0,source:"Retained source-node graph in the supplied rail SVG; normal path shares the runtime rail alignment; reverse rejoins its actual mapped edge.",confidence:"Source connectivity retained; blade, frog, bearer dimensions and exact operational permissions are simulator authoring, not surveyed switch/interlocking proof."};he.formationSections=c_(he),s.push(he)}return s.sort((o,l)=>o.s-l.s||o.lane-l.lane),s.length&&s[0].s>i.length*.5&&r.unshift("The retained node graph supplies eastern junctions only. Western switch topology is not replaced by fictional station-anchor points."),s.length||r.push("No source junction satisfied all simple-turnout connectivity and runtime alignment checks."),{switches:s,gaps:r}}const Th=new _n({color:10726053,roughness:.55,metalness:.35,flatShading:!0}),u_=new _n({color:6643024,roughness:1,flatShading:!0}),d_=new _n({color:9144444,roughness:1,flatShading:!0}),f_=new _n({color:6846060,roughness:.9,flatShading:!0}),ac=new kn(1,1,1),oc=i=>new O(...i);function la(i,e,t,n,s,r,a,o,l=0){const c=[];for(const d of[n,s])for(const h of[l,l+o])for(const f of[-1,1])c.push(...Fn(e,t,d,r+f*a/2,h));const u=new Xt;u.setAttribute("position",new Tt(c,3)),u.setIndex([0,5,4,0,1,5,2,7,3,2,6,7,0,6,2,0,4,6,1,7,5,1,3,7,0,3,1,0,2,3,4,7,6,4,5,7]),u.computeVertexNormals();const p=new zt(u,Th);return p.castShadow=!0,p.receiveShadow=!0,i.add(p),p}function or(i,e,t,n,s,r){la(i,e,t,n,s,r,Lo,.045),la(i,e,t,n,s,r,.025,.07,.045),la(i,e,t,n,s,r,.14,.025,.115)}function p_(i,e){const t=[],n=[];for(let a=1;a<e.length;a++){const o=e[a-1],l=e[a],c=t.length/3;for(const u of[o.topLeft,o.topRight,o.bottomLeft,o.bottomRight,l.topLeft,l.topRight,l.bottomLeft,l.bottomRight])t.push(...u);n.push(...[0,5,4,0,1,5,2,7,3,2,6,7,0,6,2,0,4,6,1,7,5,1,3,7,0,3,1,0,2,3,4,7,6,4,5,7].map(u=>u+c))}const s=new Xt;s.setAttribute("position",new Tt(t,3)),s.setIndex(n),s.computeVertexNormals();const r=new zt(s,d_);r.receiveShadow=!0,i.add(r)}function lc(i,e,t,n={}){const s=new ht(e);for(const r of[-1,1])for(let a=0;a<s.length;a+=1){let o=[[a,Math.min(a+1,s.length)]];for(const l of n.gaps??[])if(l.side===r){const{start:c,end:u}=l;o=o.flatMap(([p,d])=>d<=c||p>=u?[[p,d]]:[[p,Math.min(d,c)],[Math.max(p,u),d]].filter(([h,f])=>f-h>.001))}for(const[l,c]of o)or(i,s,t,l,c,r*Qn)}}function cc(i,e,t,n){const s=[],r=[],a=[],o=[];for(let u=0;u<=8;u++){const p=u/8,d=t+.1+p*7,h=ft(.008,.04,p),f=Fn(i,e,d,0),_=Fn(i,e,d,1),m=_.map((g,x)=>g-f[x]);for(const[g,x]of[[-h/2,0],[h/2,0],[-h/2,.14],[h/2,.14]]){const S=n*Qn+g,M=Fn(i,e,d,S,x);s.push(...M),r.push(...m),a.push(1-p)}}for(let u=0;u<8;u++){const p=u*4,d=p+4;o.push(p,p+1,d+1,p,d+1,d,p+2,d+2,d+3,p+2,d+3,p+3,p,d,d+2,p,d+2,p+2,p+1,p+3,d+3,p+1,d+3,d+1)}o.push(0,2,3,0,3,1,32,33,35,32,35,34);const l=new Xt;l.setAttribute("position",new Tt(s,3)),l.setIndex(o),l.computeVertexNormals();const c=new zt(l,Th);return c.userData.basePositions=new Float32Array(s),c.userData.rights=new Float32Array(r),c.userData.weights=new Float32Array(a),c.userData.side=n,c.castShadow=!0,c}function m_(i,e={}){const t=new St;t.name=i.id;const n=new ht(i.normalPath),s=new ht(i.branchPath),r=n.lengths[Math.min(i.toeIndex,n.points.length-1)],a=s.lengths[Math.min(i.frogIndex,s.points.length-1)],o=s.sample(a),l=n.nearest(o.position[0],o.position[2]),c=l.s;e.includeBallast!==!1&&p_(t,i.formationSections),lc(t,i.normalPath,i.normalFrames,{gaps:[{start:r,end:r+7.1,side:i.hand},{start:c-.35,end:c+.35,side:i.hand}]}),lc(t,i.branchPath,i.branchFrames,{gaps:[{start:0,end:7.1,side:-i.hand},{start:a-.35,end:a+.35,side:-i.hand}]});for(let S=-12;S<s.length;S+=.72){const M=n.sample(r+S),w=s.sample(Math.max(0,S)),T=Math.min(0,(w.position[0]-M.position[0])*M.right[0]+(w.position[2]-M.position[2])*M.right[2])-.98,v=Math.max(0,(w.position[0]-M.position[0])*M.right[0]+(w.position[2]-M.position[2])*M.right[2])+.98,y=No(n,i.normalFrames,r+S),C=oc(y.gaugeRight),R=oc(y.unitUp),P=R.clone().cross(C).normalize(),F=new zt(ac,u_);F.position.fromArray(Fn(n,i.normalFrames,r+S,(T+v)/2,.215)),F.scale.set(.24,.15,v-T),F.quaternion.setFromRotationMatrix(new xt().makeBasis(P,R,C)),F.castShadow=!0,F.receiveShadow=!0,t.add(F)}const u=cc(n,i.normalFrames,r,i.hand),p=cc(s,i.branchFrames,0,-i.hand);u.userData.closesFor="normal",p.userData.closesFor="reverse";for(const S of[u,p])S.name=`${i.id}:blade:${S.userData.closesFor}`,S.userData.id=S.name;const d=[u,p];or(t,n,i.normalFrames,c-.65,c+.9,i.hand*Qn),or(t,n,i.normalFrames,c-1.6,c+1.6,-i.hand*(Qn-.16)),or(t,s,i.branchFrames,Math.max(0,a-1.7),Math.min(s.length,a+1.7),-i.hand*Qn);const h=n.sample(r+4,-i.hand*1.75),f=new zt(ac,f_);f.position.fromArray(h.position),f.position.y-=.1,f.scale.set(.65,.32,.9),f.rotation.y=h.yaw,t.add(f);const _=new l_;_.add(t);const m=Eh(_.packet());t.clear();const g=new zt(m,new _n({vertexColors:!0,roughness:.8,metalness:.2,flatShading:!0}));g.name=`${i.id}:fixed`,g.userData.id=g.name,g.castShadow=!0,g.receiveShadow=!0,t.add(g,...d),Object.assign(t.userData,{id:i.id,family:"source-connected-turnout",sourceNode:i.sourceNode,normalEdgeIds:i.normalEdgeIds,reverseEdgeIds:i.reverseEdgeIds,source:i.source,confidence:i.confidence,gauge:Po,railHeadWidth:Lo,railCentreSpacing:Qn*2,blades:d,hand:i.hand,definition:i,supportPaths:i.supportPaths,replaceRunningRailWithinSpan:!0}),t.updateMatrixWorld(!0);const x=new ti().setFromObject(t);return t.userData.bounds={min:x.min.toArray(),max:x.max.toArray()},Ah(t,0),t}function Ah(i,e){const t=it(e,0,1),n=i.userData.blades;if(n){for(const s of n){const r=s.userData.side,a=s.userData.closesFor==="normal"?1-t:t,o=s.userData.basePositions,l=s.userData.rights,c=s.userData.weights,u=s.geometry.getAttribute("position");for(let p=0;p<u.count;p++){const d=-r*(.044+(1-a)*.18)*c[p];u.setXYZ(p,o[p*3]+l[p*3]*d,o[p*3+1]+l[p*3+1]*d,o[p*3+2]+l[p*3+2]*d)}u.needsUpdate=!0,s.geometry.computeVertexNormals(),s.geometry.computeBoundingSphere()}i.userData.blend=t,i.userData.proved=t===0?"normal":t===1?"reverse":"moving",i.userData.selectedSourceEdges=t===0?i.userData.normalEdgeIds:t===1?i.userData.reverseEdgeIds:null}}class g_{route;player;ai=[];signals=[];points=[];crossings=[];events=[];calls=[];clock=8*3600+720;elapsed=0;paused=!0;timeScale=1;aws={pending:!1,deadline:0,indicator:!1,brake:!1,lastSignal:"",acknowledged:0};tpws={active:!1,reason:"",stoppedAt:-1,ossEntries:{},tssEntries:{}};stats={spads:0,aiSpads:0,collisions:0,stops:0,awsMissed:0,tpwsInterventions:0,distance:0};sound;onEvent;roadTraffic=new Qh;roadAccumulator=0;roadCrossingClear=e=>this.roadTraffic.crossingClear(e);signalGroups=new Map;signalIndex=new Map;trackwork;constructor(e){this.route=e,this.trackwork=h_(e),e.data.trackwork=this.trackwork.switches;for(const t of e.stations)for(const n of[1,-1])for(const[s,r]of[-t.length/2-170,t.length/2+85].entries()){const a=t.s+n*r;a>10&&a<e.length-10&&this.signals.push({id:`SH-${t.id}-${n===1?"U":"D"}${s+1}`,s:a,direction:n,lane:n===1?4.2:0,aspects:s===0?4:3,source:"Designed simulator block; exact signal plan unavailable"})}this.signals.sort((t,n)=>t.s-n.s);for(const t of[1,-1]){const n=this.signals.filter(s=>s.direction===t);for(let s=1;s<n.length;s++){const r=n[s].s-n[s-1].s;if(r<1900)continue;const a=Math.floor(r/1400);for(let o=1;o<=a;o++){const l=n[s-1].s+r*o/(a+1);this.signals.push({id:`SH-SEC-${t}-${s}-${o}`,s:l,direction:t,lane:t===1?4.2:0,aspects:4,source:"Designed intermediate simulator block"})}}}this.signals.sort((t,n)=>t.s-n.s);for(const t of[1,-1]){const n=this.signals.filter(s=>s.direction===t).sort((s,r)=>(s.s-r.s)*t);this.signalGroups.set(t,n),n.forEach((s,r)=>this.signalIndex.set(s.id,r))}this.points=this.trackwork.switches.map(t=>({id:t.id,s:t.s,lane:t.lane,state:"normal",target:"normal",blend:0,lockedBy:null}));for(const t of e.data.crossings||[])this.crossings.push({id:t.id,s:e.sourceS(t.s),state:"open",blend:0,timer:0,held:!1});this.start(1,0)}configureRoadNetwork(e,t){const s=e.filter(r=>pa({id:r.id,kind:String(r.kind||"residential"),width:Number(r.width)||5.6,points:r.points||[]})).map(r=>Zh(r,this.route,t)).filter(r=>!!r);this.roadTraffic.configure(s),this.roadAccumulator=0}advanceRoadTraffic(e){for(this.roadAccumulator+=e;this.roadAccumulator+1e-9>=.05;)this.roadAccumulator=Math.max(0,this.roadAccumulator-.05),this.roadTraffic.update(.05,this.clock-this.roadAccumulator,this.crossings)}log(e,t){const n={time:this.clock,type:e,message:t};this.events.push(n),this.events.length>200&&this.events.shift(),this.onEvent?.(n)}start(e,t=e===1?0:this.route.stations.length-1){this.clock=8*3600+720,this.roadAccumulator=0,this.roadTraffic.reset();const n=this.route.stations[t];this.player={id:"player",s:it(n.s+e*34,4,this.route.length-4),speed:0,direction:e,lane:e===1?4.2:0,length:70.3,cars:3,kind:"172",nextStop:t+e,dwell:0,doors:!1,controller:-1,arrived:!1},this.calls=[],this.aws={pending:!1,deadline:0,indicator:!1,brake:!1,lastSignal:"",acknowledged:0},this.tpws={active:!1,reason:"",stoppedAt:-1,ossEntries:{},tssEntries:{}},this.ai=[],this.elapsed=0,this.events=[],this.stats={spads:0,aiSpads:0,collisions:0,stops:0,awsMissed:0,tpwsInterventions:0,distance:0};for(const s of[1,-1])for(let r=0;r<8;r++){let a=1100+r*(this.route.length-2200)/7+(s===-1?850:0);a=it(a,200,this.route.length-200),s===e&&Math.abs(a-this.player.s)<1200&&(a=it(a+e*1700,150,this.route.length-150));const o=this.route.stations.findIndex(c=>c.s>a),l=s===1?r===0:r===7;this.ai.push({id:`AI-${s}-${r}`,s:a,speed:Ts(32),direction:s,lane:s===1?4.2:0,length:l?93.95:70.3,cars:l?4:3,kind:l?"168":"172",nextStop:s===1?o<0?this.route.stations.length:o:o<0?this.route.stations.length-1:o-1,dwell:0,doors:!1,controller:.5,arrived:!1})}for(const s of this.points)s.state="normal",s.target="normal",s.blend=0,s.lockedBy=null;for(const s of this.crossings)s.state="open",s.blend=0,s.timer=0,s.held=!1;this.paused=!0,this.log("journey",`Ready at ${n.name}. Hold A to release the brake.`)}allTrains(){return[this.player,...this.ai.filter(e=>e.portalWaitUntil===void 0)]}interval(e,t=0){const n=this.route.travel(e.s,-e.direction*e.length,e.lane);return[this.route.travel(Math.min(e.s,n),-t,e.lane),this.route.travel(Math.max(e.s,n),t,e.lane)]}occupied(e,t,n,s){const r=Math.min(e,t),a=Math.max(e,t);return this.allTrains().some(o=>{if(o.id===s||Math.abs(o.lane-n)>1)return!1;const[l,c]=this.interval(o);return c>=r&&l<=a})}pointOccupied(e){return this.allTrains().some(t=>{const[n,s]=this.interval(t,18);return e.s>=n&&e.s<=s})}requestPoint(e,t){const n=this.points.find(r=>r.id===e);if(!n)return!1;const s=this.allTrains().some(r=>Math.abs(r.s-n.s)<Math.max(100,r.speed*r.speed/1.2+60));return n.lockedBy||this.pointOccupied(n)||s?(this.log("points",`${e} is locked by an occupied or approaching route.`),!1):(n.target=t,n.state="moving",this.log("points",`${e} requested ${t}.`),!0)}nextSignal(e=this.player){const t=this.signalGroups.get(e.direction)||[];let n=0,s=t.length;for(;n<s;){const a=n+s>>1;(t[a].s-e.s)*e.direction>=-.1?s=a:n=a+1}const r=t[n];return r&&Math.abs(r.lane-e.lane)<1?r:void 0}aspect(e,t="player"){const n=this.signalGroups.get(e.direction)||[],s=this.signalIndex.get(e.id)??-1;if(s<0)return"red";for(let r=0;r<3;r++){const a=n[s+r],o=n[s+r+1];if(!a)break;const l=o?.s??(e.direction===1?this.route.length+100:-100),c=this.points.some(p=>(p.lane===void 0||p.lane===e.lane)&&(p.s-a.s)*e.direction>=0&&(l-p.s)*e.direction>=0&&(p.state==="moving"||p.state==="reverse")),u=this.crossings.some(p=>(p.s-a.s)*e.direction>=0&&(l-p.s)*e.direction>=0&&p.blend<.99);if(this.occupied(a.s+e.direction*3,l+e.direction*90,e.lane,t)||c||u)return r===0?"red":r===1?"yellow":e.aspects===4?"double-yellow":"green"}return"green"}acknowledge(){this.aws.pending&&(this.aws.pending=!1,this.aws.acknowledged++,this.sound?.("ack"),this.log("aws","AWS warning acknowledged.")),this.aws.brake&&this.player.speed<.05&&(this.aws.brake=!1,this.log("aws","AWS brake released at standstill."))}resetTPWS(){return this.tpws.active?this.player.speed>.05||this.tpws.stoppedAt<0||this.clock-this.tpws.stoppedAt<5?(this.log("tpws","Stop the train and wait five seconds before resetting TPWS."),!1):(this.tpws.active=!1,this.tpws.reason="",this.player.controller=-1,this.log("tpws","TPWS reset. Service brake remains applied."),!0):!0}setDirection(e){const t=this.player;if(e===t.direction)return!0;if(t.speed>.05||t.controller>0||t.doors)return this.log("direction","Stop, close doors and select idle/brake before changing direction."),!1;const n=this.route.stations.find(o=>(o.id==="KID"||o.id==="DDG")&&Math.abs(o.s-t.s)<180);if(!n)return this.log("direction","No reverse movement authority at this location."),!1;const s=this.route.travel(t.s,-t.direction*t.length,t.lane),r=this.route.travel(s,e*300,t.lane);if(this.occupied(s,r,t.lane,t.id))return this.log("direction","Reverse route occupied."),!1;t.s=s,t.direction=e;const a=e===1?4.2:0;return t.reverseAuthority=t.lane===a?void 0:{min:n.s-150,max:n.s+150},t.nextStop=this.route.stations.findIndex(o=>o.s>t.s),e===-1&&(t.nextStop=(t.nextStop<0?this.route.stations.length:t.nextStop)-1),t.arrived=!1,this.log("direction",t.reverseAuthority?"Station reversal authorised, maximum 10 mph. Physical consist unchanged.":e===1?"Forward selected.":"Reverse selected."),!0}targetStation(e=this.player){return this.route.stations[e.nextStop]}stopPosition(e,t){return it(e.s+t*Math.min(40,e.length/2-8),3,this.route.length-3)}distanceToStop(e=this.player){const t=this.targetStation(e);return t?this.route.laneDistance(e.s,this.stopPosition(t,e.direction),e.lane)*e.direction:0}triggerTPWS(e){this.tpws.active||(this.tpws={active:!0,reason:e,stoppedAt:-1,ossEntries:{},tssEntries:{}},this.stats.tpwsInterventions++,this.sound?.("tpws"),this.log("tpws",e))}update(e,t){if(this.paused)return;this.clock+=e,this.elapsed+=e;const n=this.player;t.a!==t.d&&(n.controller=it(n.controller+(t.a?.45:-.45)*e,-1,1));for(const f of this.points){const _=this.allTrains().find(m=>(f.s-m.s)*m.direction>-m.length-30&&(f.s-m.s)*m.direction<Math.max(100,m.speed*12));f.lockedBy=_?.id??null,f.state==="moving"&&!this.pointOccupied(f)&&(f.blend=it(f.blend+(f.target==="reverse"?1:-1)*e/2.5,0,1),(f.blend===0||f.blend===1)&&(f.state=f.target))}for(const f of this.crossings){const _=this.allTrains().some(m=>{const g=(f.s-m.s)*m.direction;return g>-m.length-35&&g<Math.max(1e3,m.speed*45)});f.held=_,_&&(f.state==="open"||f.state==="opening")&&(f.state="warning",f.timer=0),f.state==="warning"&&(f.timer+=e)>3&&(this.roadCrossingClear?.(f.s)??!0)&&(f.state="closing"),f.state==="closing"&&(f.blend=it(f.blend+e/3,0,1),f.blend===1&&(f.state="closed")),!_&&f.state==="closed"?(f.timer+=e,f.timer>5&&(f.state="opening")):_&&f.state==="closed"&&(f.timer=0),f.state==="opening"&&(f.blend=it(f.blend-e/3,0,1),f.blend===0&&(f.state="open"))}this.advanceRoadTraffic(e);const s=n.s;n.doors&&(n.dwell-=e,n.dwell<=0&&(n.doors=!1,this.sound?.("doors"),this.log("station","Doors closed. Ready to depart."))),this.aws.pending&&this.clock>this.aws.deadline&&(this.aws.pending=!1,this.aws.brake=!0,this.stats.awsMissed++,this.sound?.("tpws"),this.log("aws","AWS missed. Brake demand. Stop and acknowledge."));const r=n.controller>0?Math.min(.95,6.7/Math.max(5,n.speed))*n.controller:0,a=n.reverseAuthority?this.route.laneDistance(n.s,n.direction===1?n.reverseAuthority.max:n.reverseAuthority.min,n.lane)*n.direction:1/0,o=Math.min(Ts(10),Math.sqrt(Math.max(0,2*.65*(a-7))));n.authorityBrake=!!n.reverseAuthority&&(a<=7||n.speed>o);const l=n.controller<0?-.95*n.controller:0,c=this.aws.brake||this.tpws.active?1.25:n.authorityBrake?1.05:0,u=this.route.lanePose(n.s,n.lane),p=.012+2e-4*n.speed*n.speed,d=(n.doors||this.aws.brake||this.tpws.active||n.authorityBrake?0:r)-Math.max(l,c)-p-u.grade*9.81*n.direction;if(n.speed=Math.max(0,n.speed+d*e),n.doors&&(n.speed=0),n.s=this.route.travel(n.s,n.direction*n.speed*e,n.lane),this.stats.distance+=Math.abs(this.route.laneDistance(s,n.s,n.lane)),n.s<0||n.s>this.route.length+2){n.speed=0,n.controller=-1,this.paused=!0,this.log("boundary","You have passed the modelled route boundary. Restart or load a saved journey.");return}for(const f of this.signals){if(f.direction!==n.direction||Math.abs(f.lane-n.lane)>1)continue;const _=this.route.laneDistance(s,f.s,n.lane)*n.direction,m=this.route.laneDistance(n.s,f.s,n.lane)*n.direction,g=this.aspect(f);_>200&&m<=200&&(this.aws.lastSignal=f.id,this.aws.indicator=g!=="green",g==="green"?this.sound?.("clear"):(this.aws.pending=!0,this.aws.deadline=this.clock+2.7,this.sound?.("aws"),this.log("aws",`AWS: ${f.id}, ${g}. Acknowledge with Q.`)));const x=this.tpws.ossEntries??(this.tpws.ossEntries={}),S=w=>this.clock-e+e*it((_-w)/(_-m||1),0,1);if(_>74&&m<=74&&g==="red"&&(x[f.id]={time:S(74),direction:n.direction,lane:n.lane}),_>70&&m<=70){const w=x[f.id];w&&w.direction===n.direction&&w.lane===n.lane&&g==="red"&&S(70)-w.time<4/Math.sqrt(2*.8*55)&&this.triggerTPWS(`TPWS overspeed intervention at ${f.id}.`),delete x[f.id]}const M=this.tpws.tssEntries??(this.tpws.tssEntries={});if(_>1.2&&m<=1.2&&g==="red"&&(M[f.id]={time:S(1.2),direction:n.direction,lane:n.lane}),_>0&&m<=0){if(g==="red"){this.stats.spads++;const w=M[f.id];w&&w.direction===n.direction&&w.lane===n.lane&&S(0)-w.time<1.1&&this.triggerTPWS(`TPWS train-stop intervention at ${f.id}.`)}delete M[f.id]}}const h=this.targetStation();if(h){const f=this.distanceToStop();Math.abs(f)<20&&n.speed<.25&&!this.calls.includes(h.id)?(n.speed=0,n.controller=-1,n.doors=!0,n.dwell=18,this.calls.push(h.id),this.stats.stops++,this.sound?.("doors"),this.log("station",`${h.name}. Doors released; 18 second dwell.`),n.nextStop+=n.direction,(n.nextStop<0||n.nextStop>=this.route.stations.length)&&(n.arrived=!0,this.log("complete","Journey complete."))):f<-100&&!this.calls.includes(h.id)&&(this.log("station",`${h.name} passed.`),n.nextStop+=n.direction)}this.tpws.active&&n.speed<.05&&this.tpws.stoppedAt<0&&(this.tpws.stoppedAt=this.clock);for(const f of this.ai)this.driveAI(f,e);this.checkCollisions()}driveAI(e,t){if(e.portalWaitUntil!==void 0){if(this.clock<e.portalWaitUntil)return;const l=e.direction===1?-220:this.route.length+220;if(Math.abs(l-this.player.s)<1400||this.occupied(l-e.direction*e.length,l+e.direction*100,e.lane,e.id))return;e.portalWaitUntil=void 0,e.s=l,e.speed=0,e.nextStop=e.direction===1?0:this.route.stations.length-1}if(e.dwell>0){e.dwell-=t,e.speed=0,e.doors=!0,e.dwell<=0&&(e.doors=!1,e.nextStop+=e.direction);return}if(e.kind==="168")for(;this.targetStation(e)&&!["KID","SBJ","SGB","BSW","BMO","SOL","DDG"].includes(this.targetStation(e).id);)e.nextStop+=e.direction;const n=this.nextSignal(e),s=n?this.aspect(n,e.id):"green";let r=Ts(this.route.limit(e.s)-(e.kind==="168"?0:5));if(n&&s==="red"){const l=this.route.laneDistance(e.s,n.s,e.lane)*e.direction-10;r=Math.min(r,Math.sqrt(Math.max(0,2*.68*l)))}n&&s==="yellow"&&(r=Math.min(r,Ts(35)));const a=this.targetStation(e);if(a){const l=this.distanceToStop(e);if(l>-20){if(r=Math.min(r,Math.sqrt(Math.max(0,2*.68*(l-1)))),l<2&&e.speed<.4){e.speed=0,e.dwell=18+In(e.id+a.id)%12,e.doors=!0;return}}else e.nextStop+=e.direction}for(const l of this.allTrains()){if(l.id===e.id||Math.abs(l.lane-e.lane)>1)continue;const[c,u]=this.interval(l),p=e.direction===1?c-e.s:e.s-u;p>0&&(r=Math.min(r,Math.sqrt(Math.max(0,2*.7*(p-40)))))}const o=e.s;e.speed=Math.max(0,e.speed+it(r-e.speed,-.9*t,.65*t)),e.s=this.route.travel(e.s,e.direction*e.speed*t,e.lane),n&&(n.s-o)*e.direction>0&&(n.s-e.s)*e.direction<=0&&s==="red"&&this.stats.aiSpads++,(e.s>this.route.length+200||e.s<-200)&&(e.portalWaitUntil=this.clock+45,e.speed=0)}checkCollisions(){const e=this.allTrains();for(let t=0;t<e.length;t++)for(let n=t+1;n<e.length;n++){const s=e[t],r=e[n];if(Math.abs(s.lane-r.lane)>1)continue;const[a,o]=this.interval(s),[l,c]=this.interval(r);if(Math.min(o,c)-Math.max(a,l)>2){s.speed=0,r.speed=0,this.stats.collisions++,this.paused=!0,this.log("collision",`Movement stopped: conflicting occupation ${s.id}/${r.id}.`);return}}}snapshot(){return JSON.parse(JSON.stringify({version:2,worldHash:String(this.route.data.worldHash||this.route.fingerprint),routeFingerprint:this.route.fingerprint,routeLength:this.route.length,clock:this.clock,player:this.player,ai:this.ai,points:this.points,crossings:this.crossings,aws:this.aws,tpws:this.tpws,calls:this.calls,stats:this.stats,timeScale:this.timeScale,roadTraffic:this.roadTraffic.snapshotState(),roadAccumulator:this.roadAccumulator}))}restore(e){if(e.version!==2||e.worldHash!==String(this.route.data.worldHash||this.route.fingerprint)||e.routeFingerprint!==this.route.fingerprint||Math.abs(e.routeLength-this.route.length)>1)throw new Error("This save belongs to another route version. Start a new journey.");if(e.roadTraffic)this.roadTraffic.restoreState(e.roadTraffic);else if(this.roadTraffic.roads.size)throw new Error("This save has no compatible road traffic state. Start a new journey.");this.clock=e.clock,this.player=e.player,this.ai=e.ai,this.points=e.points,this.crossings=e.crossings,this.aws=e.aws,this.tpws=e.tpws,this.calls=e.calls,this.stats=e.stats,this.timeScale=e.timeScale,this.roadAccumulator=Number.isFinite(e.roadAccumulator)?Math.max(0,Math.min(.05,e.roadAccumulator)):0,this.paused=!0,this.log("save","Journey restored, paused.")}clockText(){return new Date(this.clock*1e3).toISOString().slice(11,19)}get speedMph(){return Vh(this.player.speed)}}const D={steel:6712169,dark:2370862,rail:10265505,sleeper:6708303,brick:10312773,brown:7885897,cream:15260865,stone:11774624,roof:5396053,white:15329500,glass:3954272,purple:6510454,yellow:15387468,orange:12876853,green:3892818,leaf:6651211,red:12865091,ballast:9144444,concrete:11052698,black:1515811},Rh=new kn(1,1,1),Ci=new yr(1,1,1,8),__=new Eo(1,1,6),Qs=new Ro(1,0),pn=.915,hc=new Map;function Ch(i,e=!1){const t=`${i}/${e}`;let n=hc.get(t);return n||(n=new _n({color:i,roughness:.86,metalness:.04,flatShading:!0,emissive:e?i:0,emissiveIntensity:e?.9:0}),hc.set(t,n)),n}function Ft(i,e,t,n,s,r,a=1,o=1,l=1,c=!1){const u=new zt(i,Ch(e,c));return u.position.set(n,s,r),u.scale.set(a,o,l),u.castShadow=!0,u.receiveShadow=!0,t.add(u),u}function k(i,e,t,n,s,r,a,o,l=!1){return Ft(Rh,e,i,t,n,s,r,a,o,l)}function _t(i,e,t,n,s,r,a){return Ft(Ci,e,i,t,n,s,r,a,r)}function on(i,e,t,n,s,r=s){const a=n.clone().sub(t),o=k(i,e,(t.x+n.x)/2,(t.y+n.y)/2,(t.z+n.z)/2,s,a.length(),r);return o.quaternion.setFromUnitVectors(new O(0,1,0),a.normalize()),o}const vt=(i,e,t)=>new O(i,e,t);function uc(i){let e=i|0;return()=>(e=Math.imul(e^e>>>15,1|e),e^=e+Math.imul(e^e>>>7,61|e),((e^e>>>14)>>>0)/4294967296)}function nn(i,e,t,n=[[0,0,0]]){i.updateMatrixWorld(!0);const s=new ti().setFromObject(i),r=String(t.id??`${e}/prototype/${t.seed??1}`);let a=0;return i.traverse(o=>{o!==i&&(o.userData.componentId=`${r}/component/${a++}`,o.userData.instanceRootId=r)}),Object.assign(i.userData,{family:e,generator:"procedural-assets-v1",id:r,requiresWorldInstanceId:t.id===void 0,seed:t.seed??1,source:t.source??"parameterised approximation; see route manifest",confidence:t.confidence??"inferred form",bounds:{min:s.min.toArray(),max:s.max.toArray()},supportAnchors:n,collision:"compound bounds; route clearance is authoritative",textureCount:0}),i}const Ph=(()=>{const i=new mr;i.moveTo(-.5,0),i.lineTo(.5,0),i.lineTo(0,1),i.closePath();const e=new vs(i,{depth:1,bevelEnabled:!1,steps:1});return e.translate(0,0,-.5),e})(),v_=(()=>{const i=new Xt;i.setAttribute("position",new Tt([-.5,0,-.5,.5,0,-.5,-.5,0,.5,.5,0,.5,-.5,1,-.5,.5,1,-.5],3)),i.setIndex([0,1,5,0,5,4,0,2,3,0,3,1,4,5,3,4,3,2,0,4,2,1,3,5]);const e=i.toNonIndexed();return e.computeVertexNormals(),i.dispose(),e})(),x_={A:["01110","10001","10001","11111","10001","10001","10001"],B:["11110","10001","10001","11110","10001","10001","11110"],C:["01111","10000","10000","10000","10000","10000","01111"],D:["11110","10001","10001","10001","10001","10001","11110"],E:["11111","10000","10000","11110","10000","10000","11111"],F:["11111","10000","10000","11110","10000","10000","10000"],G:["01111","10000","10000","10111","10001","10001","01111"],H:["10001","10001","10001","11111","10001","10001","10001"],I:["11111","00100","00100","00100","00100","00100","11111"],J:["00111","00010","00010","00010","10010","10010","01100"],K:["10001","10010","10100","11000","10100","10010","10001"],L:["10000","10000","10000","10000","10000","10000","11111"],M:["10001","11011","10101","10101","10001","10001","10001"],N:["10001","11001","10101","10011","10001","10001","10001"],O:["01110","10001","10001","10001","10001","10001","01110"],P:["11110","10001","10001","11110","10000","10000","10000"],Q:["01110","10001","10001","10001","10101","10010","01101"],R:["11110","10001","10001","11110","10100","10010","10001"],S:["01111","10000","10000","01110","00001","00001","11110"],T:["11111","00100","00100","00100","00100","00100","00100"],U:["10001","10001","10001","10001","10001","10001","01110"],V:["10001","10001","10001","10001","10001","01010","00100"],W:["10001","10001","10001","10101","10101","10101","01010"],X:["10001","10001","01010","00100","01010","10001","10001"],Y:["10001","10001","01010","00100","00100","00100","00100"],Z:["11111","00001","00010","00100","01000","10000","11111"],0:["01110","10011","10101","10101","10101","11001","01110"],1:["00100","01100","00100","00100","00100","00100","01110"],2:["01110","10001","00001","00010","00100","01000","11111"],3:["11110","00001","00001","01110","00001","00001","11110"],4:["00010","00110","01010","10010","11111","00010","00010"],5:["11111","10000","10000","11110","00001","00001","11110"],6:["01110","10000","10000","11110","10001","10001","01110"],7:["11111","00001","00010","00100","01000","01000","01000"],8:["01110","10001","10001","01110","10001","10001","01110"],9:["01110","10001","10001","01111","00001","00001","01110"],"-":["00000","00000","00000","11111","00000","00000","00000"],".":["00000","00000","00000","00000","00000","00100","00100"]};function $i(i,e=.25,t=D.white){const n=[],s=[],r=e/7,a=i.toUpperCase(),o=-a.length*6*r/2;for(let u=0;u<a.length;u++){const p=x_[a[u]];if(p){for(let d=0;d<7;d++)for(let h=0;h<5;h++)if(p[d][h]==="1"){const f=o+(u*6+h)*r,_=(6-d)*r,m=r*.92;n.push(f,_,0,f+m,_,0,f+m,_+m,0,f,_,0,f+m,_+m,0,f,_+m,0);for(let g=0;g<6;g++)s.push(0,0,1)}}}const l=new Xt;l.setAttribute("position",new Tt(n,3)),l.setAttribute("normal",new Tt(s,3));const c=new zt(l,Ch(t));return c.userData.geometricLettering=!0,c}function dc(i,e,t=D.rail){for(let n=1;n<e.length;n++){const s=e[n-1],r=e[n],a=r.clone().sub(s).normalize(),o=new O(a.z,0,-a.x).normalize(),l=a.clone().cross(o).normalize(),c=new xt().makeBasis(o,l,a),u=s.clone().add(r).multiplyScalar(.5);for(const[p,d,h,f]of[["head",.075,0,.045],["web",.025,-.045,.07],["foot",.14,-.115,.025]]){const _=u.clone().addScaledVector(l,h-f/2),m=k(i,t,_.x,_.y,_.z,d,f,s.distanceTo(r));m.quaternion.setFromRotationMatrix(c),m.userData.railProfile=p}}}function ca(i,e,t,n,s=!1){const r=new St;r.userData.trackPlatform={x:e,width:t,length:n,heritage:s},i.add(r),i=r,k(i,s?D.brick:D.concrete,e,.375,0,t,1.03,n),k(i,6448996,e,.9,0,t,.03,n);const a=e>0?e-t/2:e+t/2;k(i,D.cream,a,.908,0,.34,.035,n),k(i,D.yellow,a+(e>0?.46:-.46),.922,0,.1,.012,n-3),k(i,12104090,a+(e>0?.7:-.7),.92,0,.24,.025,n-3);for(const o of[-1,1]){const l=Ft(v_,s?D.brick:D.concrete,i,e,0,o*(n/2+2.3),t,pn,4.6);o<0&&(l.rotation.y=Math.PI)}}function fc(i,e,t,n,s,r){const o=(c,u,p,d,h)=>{const f=k(i,c,u,p,t,d,h,s);f.userData.followPlatform=!0};o(D.roof,e,4+.12,n,.24),o(r?D.cream:11975088,e,4-.06,n,.1);for(const c of[-1,1])o(r?D.cream:D.steel,e+c*(n/2-.08),4-.15,.13,.35);const l=Math.max(2,Math.floor(s/7));for(let c=0;c<=l;c++){const u=t-s/2+c*s/l;_t(i,r?D.purple:D.steel,e,(4+pn)/2,u,.065,4-pn),on(i,r?D.purple:D.steel,vt(e,3.1,u),vt(e-n*.38,3.86,u),.065),on(i,r?D.purple:D.steel,vt(e,3.1,u),vt(e+n*.38,3.86,u),.065),k(i,D.cream,e,4-.22,u,n-.1,.16,.16)}for(const c of[-1,1])o(D.dark,e+c*n/2,4-.02,.11,.14),_t(i,D.dark,e+c*n/2,2.35,t-s/2+.15,.045,3.15)}function M_(i,e,t,n=16){const a=n/2-.7;k(i,t?D.purple:D.steel,0,6.2,e,n,.35,2.2);for(const o of[-1,1])if(t?(k(i,D.purple,0,6.2+.17,e+o*2.2/2,n,.13,.12),k(i,D.purple,0,6.2+1.18,e+o*2.2/2,n,.13,.12)):k(i,D.steel,0,6.2+.65,e+o*2.2/2,n,1.25,.12),t)for(let l=0;l<Math.ceil(n/.75);l++){const c=-n/2+l*.75;on(i,D.cream,vt(c,6.2+.17,e+o*2.2/2),vt(c+.72,6.2+1.14,e+o*2.2/2),.045),on(i,D.cream,vt(c,6.2+1.14,e+o*2.2/2),vt(c+.72,6.2+.17,e+o*2.2/2),.045)}for(const o of[-a,a]){for(const p of[e-.85,e+.85])k(i,t?D.purple:D.steel,o,3.45,p,.24,5.3,.24);const l=8.2,c=22,u=e+1.1;for(let p=0;p<c;p++){const d=pn+(p+1)*(6.2-pn)/c;k(i,t?D.purple:D.concrete,o,d/2,u+l-p*l/c,1.7,d,l/c+.01)}for(const p of[-.86,.86]){on(i,t?D.cream:D.steel,vt(o+p,1.8,u+l),vt(o+p,6.2+.95,u),.065);for(let d=0;d<=5;d++){const h=d/5;k(i,t?D.cream:D.steel,o+p,1.34+h*(6.2-pn),u+l*(1-h),.06,.95,.06)}}}t&&Ft(Ph,D.roof,i,0,6.2+1.6,e,n+.5,.65,2.2+.5)}class S_{station(e){const t=new St;t.name=`station-${e.id??"unknown"}`;const n=String(e.id??"").toUpperCase(),s=String(e.name??n),r=Math.max(70,e.length??165),a=/HAG|HAGLEY|BMO|MOOR|DDG|DORRIDGE/.test(n+" "+s.toUpperCase()),o=/BSW|SNOW/.test(n+" "+s.toUpperCase()),l=/SGB|GALTON/.test(n+" "+s.toUpperCase()),c=o?5:4.1,u=e.trackSpacing??4.2,p=u/2+1.7,d=p+c/2;ca(t,-d,c,r,a),ca(t,d,c,r,a);const h=Number(e.canopyLength)||Math.min(r*.56,a?80:65),f=Number(e.canopyCentre??-10);for(const _ of[-1,1]){fc(t,_*(d+.15),f,c+.5,o?r:h,a);const m=this.building({width:3.5,depth:a?16:10,height:a?3.2:2.8,style:a?"historic":"station",seed:13});m.position.set(_*(p+c+1.6),pn,-15),t.add(m);for(let S=-r/2+15;S<r/2;S+=24){const M=this.furniture("lamp");M.position.set(_*(p+c-.65),pn,S),t.add(M);const w=this.furniture("bench");w.position.set(_*(d+.6),pn,S+3),w.rotation.y=_>0?Math.PI/2:-Math.PI/2,t.add(w)}const g=Math.min(6.8,Math.max(2.9,s.length*.15)),x=new St;x.position.set(_*d,0,r*.28),x.rotation.y=Math.PI/2,x.userData.role="platform-nameboard",t.add(x),k(x,a?D.purple:D.green,0,2.3,0,g,.62,.12);for(const S of[-g*.4,g*.4])k(x,D.steel,S,1.57,0,.06,1.45,.06);for(const S of[-1,1]){const M=$i(s,Math.min(.25,g/(Math.max(s.length,1)*.9)),D.white);M.position.set(0,2.16,S*.065),S<0&&(M.rotation.y=Math.PI),x.add(M)}}if(e.footbridge!==!1&&!/BKD|BLAKEDOWN/.test(n+" "+s.toUpperCase())&&M_(t,-Math.min(48,r*.24),/HAG|HAGLEY/.test(n+" "+s.toUpperCase()),2*(d+1)),(/SBJ|STOURBRIDGE/.test(n+" "+s.toUpperCase())||e.platformCount>=3)&&(ca(t,-d-5.9,2.5,85,a),k(t,D.concrete,-d-4.35,.22,38,1.1,.5,1.3)),o){k(t,D.concrete,0,8.4,0,2*(d+c),1.25,r*.86);for(const _ of[-d-1,d+1])for(let m=-r*.43;m<r*.43;m+=12)k(t,D.concrete,_,4.8,m,.7,8,.7);for(const _ of[-d-5,d+5])k(t,7502974,_,13,-25,7,10,28)}if(l){k(t,D.concrete,0,7.5,-30,29,.85,8.5);for(const _ of[-12,12])k(t,D.concrete,_,4,-30,1.2,7.8,7);for(const _ of[-1,1])k(t,9349794,_*8,5,-48,2.3,8,3.5)}if(/DDG|DORRIDGE/.test(n+" "+s.toUpperCase())){const _=this.building({width:8,depth:22,height:5.1,style:"historic",seed:21});_.position.set(d+6,pn,-38),t.add(_)}if(/KID|KIDDERMINSTER/.test(n+" "+s.toUpperCase())){const _=this.building({width:9,depth:35,height:4.2,style:"historic",seed:11});_.position.set(-d-15,0,-8),t.add(_),fc(t,-d-12,-5,7,42,!0)}return t.userData.platformEdges=[-p,p],t.userData.platformLength=r,t.userData.platformHeight=pn,nn(t,"station",e,[[-d,0,-r/2],[d,0,r/2]])}building(e){const t=new St,n=Math.max(1,e.width??7),s=Math.max(1,e.depth??9),r=Math.max(1.2,e.height??6),a=uc(e.seed??1),o=/industrial|warehouse|shed/.test(e.style??""),l=/historic|terrace|brick/.test(e.style??""),c=[D.brick,D.brown,10976347,11770747,12891803][Math.floor(a()*5)];k(t,D.concrete,0,.1,0,n+.15,.2,s+.15),k(t,o?10264986:c,0,r/2+.15,0,n,r,s),o||e.roof==="flat"?(k(t,D.roof,0,r+.25,0,n+.3,.22,s+.3),k(t,D.steel,0,r+.4,0,n*.25,.15,s*.5)):(Ft(Ph,l?6904662:D.roof,t,0,r+.15,0,n+.42,Math.min(n*.38,2.7),s+.4),k(t,c,n*.26,r+Math.min(n*.38,2.7)+.15,-s*.25,.55,1.05,.7),k(t,D.cream,n*.26,r+Math.min(n*.38,2.7)+.73,-s*.25,.65,.14,.8));const u=Math.min(5,Math.max(1,Math.floor(r/2.9))),p=Math.min(8,Math.max(1,Math.floor(n/2.5)));for(const h of[-1,1]){for(let _=0;_<u;_++)for(let m=0;m<p;m++){const g=-n/2+(m+.5)*n/p,x=1.6+_*Math.min(3.05,r/u);k(t,D.cream,g,x,h*(s/2+.012),Math.min(1.12,n/p*.58),1.2,.065),k(t,D.glass,g,x,h*(s/2+.052),Math.min(.94,n/p*.46),1.04,.035)}const f=h*(s/2+.04);k(t,l?D.green:D.dark,-n*.26,1.16,f,.9,2,.09),k(t,D.concrete,-n*.26,.14,f+h*.22,1.15,.26,.55)}const d=Math.min(7,Math.max(1,Math.floor(s/3)));for(const h of[-1,1])for(let f=0;f<d;f++)for(let _=0;_<u;_++)k(t,D.glass,h*(n/2+.024),1.6+_*Math.min(3.05,r/u),-s/2+(f+.5)*s/d,.05,1.03,1);for(const h of[-1,1])k(t,D.dark,h*(n/2+.12),r+.08,0,.12,.12,s+.35),_t(t,D.dark,h*(n/2+.12),r/2,s/2-.12,.045,r);return nn(t,"building",e,[[-n/2,0,-s/2],[n/2,0,-s/2],[-n/2,0,s/2],[n/2,0,s/2]])}tree(e={}){const t=new St,n=e.height??6+(e.seed??1)%6,s=uc(e.seed??7);if(_t(t,6443333,0,n*.36,0,n*.037,n*.72),e.type==="conifer")for(let r=0;r<3;r++)Ft(__,4349770,t,0,n*(.48+r*.17),0,n*(.26-r*.045),n*.55,n*(.26-r*.045));else{Ft(Qs,[D.leaf,7963211,10263388,5729865][(e.seed??1)%4],t,0,n*.7,0,n*.31,n*.34,n*.29);for(let r=0;r<2;r++)Ft(Qs,r?7570254:5467208,t,(s()-.5)*n*.33,n*(.56+s()*.22),(s()-.5)*n*.3,n*.24,n*.26,n*.23)}return nn(t,"vegetation",e,[[0,0,0]])}signal(e={}){const t=new St,n=e.height??4.6;if(e.gantry){for(const l of[-1,1])k(t,D.steel,l*6.5,n*.6,0,.28,n*1.2,.28);k(t,D.steel,0,n*1.2,0,13.4,.32,.5);for(let l=-6;l<6;l+=1.3)on(t,D.steel,vt(l,n*1.2-.3,0),vt(l+1.3,n*1.2+.3,0),.08)}else{_t(t,D.steel,0,n/2-.35,0,.075,n-.7),k(t,D.concrete,0,-.08,0,.55,.25,.55);for(let l=.35;l<n-.8;l+=.38)k(t,D.steel,.21,l,-.12,.3,.032,.06);for(const l of[.07,.36])k(t,D.steel,l,(n-.7)/2,-.12,.035,n-.7,.035)}const s=n-.35;k(t,D.black,0,s,0,.58,1.3,.23);const r={red:[],yellow:[],green:[],doubleYellow:[]},a=[["red",s-.42,15746098],["yellow",s-.08,16761641],["green",s+.26,5036939]];(e.aspects===4||e.fourAspect)&&a.push(["doubleYellow",s+.6,16761641]);for(const[l,c,u]of a){const p=Ft(Ci,u,t,0,c,.145,.105,.055,.105,!0);p.rotation.x=Math.PI/2,p.material=new _n({color:1516834,emissive:u,emissiveIntensity:0,roughness:.4}),r[l].push(p),k(t,D.black,0,c+.115,.18,.29,.045,.3)}k(t,D.white,0,n-1.54,.12,.48,.28,.03);const o=$i(String(e.id??"S").slice(-5),.115,D.black);if(o.position.set(0,n-1.6,.14),t.add(o),e.indicator){k(t,D.black,.35,n+.65,0,.9,.25,.2);for(let l=0;l<5;l++)Ft(Ci,D.white,t,-.01+l*.15,n+.65+l*.09,.15,.035,.035,.035,!0).rotation.x=Math.PI/2}return t.userData.lenses=r,Lh(t,e.aspect??"red"),nn(t,"signal",e)}turnout(e={}){const t=new St,n=e.length??32,s=e.hand==="left"?-1:typeof e.hand=="number"?e.hand:1,r=1.435,a=.075,o=(r+a)/2;for(let p=0;p<=Math.ceil(n/.64);p++){const d=Math.min(n,p*.64),h=d/n,f=s*3.8*h*h;k(t,D.ballast,f/2,-.465,-d,3.65+Math.abs(f),.35,.88),k(t,D.sleeper,f/2,-.215,-d,2.65+Math.abs(f),.15,.24)}for(const p of[-1,1])dc(t,[vt(p*o,0,0),vt(p*o,0,-n)]);for(const p of[-1,1]){const d=[];for(let h=5;h<=32;h++){const f=h/32,_=s*7.6*f,m=Math.hypot(n,_);d.push(vt(s*3.8*f*f+p*o*n/m,0,-n*f+p*o*_/m))}dc(t,d)}const l=[];for(const p of[-1,1]){const d=p*(r/2-.0225),h=k(t,D.rail,d,-.06,-5,.045,.12,9.6);h.userData.side=p,h.userData.baseX=d,h.userData.stockCentreX=p*o,l.push(h)}const c=Math.sqrt((r+a)/3.8),u=k(t,D.rail,s*o,-.07,-n*c,.1,.14,1.9);u.rotation.y=-s*Math.atan(7.6*c/n);for(const p of[-.65,.65])k(t,D.rail,p,-.06,-n*c,.055,.12,3.7);return k(t,D.dark,s*1.8,-.02,-3,.7,.3,.45),k(t,D.steel,s*.5,-.06,-3,2.4,.055,.06),t.userData.blades=l,t.userData.gauge=r,t.userData.railHeadWidth=a,t.userData.stockRailCentres=[-o,o],t.userData.hand=s,t.userData.routeEnds={normal:[0,0,-n],reverse:[s*3.8,0,-n]},y_(t,e.state==="reverse"?1:0),nn(t,"turnout",e)}masonryArch(e){const t=new St,n=Number(e.opening)||9.2,s=n/2,r=Number(e.height)||6.8,a=Number(e.depth)||7.5,o=Number(e.shear)||0,l=s+2,c=Number(e.spring)||2.9,u=Number(e.rise)||3.2,p=new mr;p.moveTo(-l,-1),p.lineTo(l,-1),p.lineTo(l,r),p.lineTo(-l,r),p.closePath();const d=new pr;d.moveTo(-s,-.8),d.lineTo(s,-.8),d.lineTo(s,c),d.absellipse(0,c,s,u,0,Math.PI,!1,0),d.lineTo(-s,-.8),d.closePath(),p.holes.push(d);const h=new vs(p,{depth:a,steps:1,bevelEnabled:!1,curveSegments:14});h.translate(0,0,-a/2);const f=h.getAttribute("position");for(let S=0;S<f.count;S++)f.setZ(S,f.getZ(S)+f.getX(S)*o);h.computeVertexNormals(),Ft(h,D.brick,t,0,0,0);const _=l*2,m=_*o,g=Math.hypot(_,m),x=Math.atan2(-_,-m);for(const S of[-1,1]){const M=k(t,D.brick,0,r+.5,S*(a/2-.1),.38,1,g);M.rotation.y=x;const w=k(t,D.stone,0,r+1.05,S*(a/2-.1),.49,.14,g+.3);w.rotation.y=x}return t.userData.opening={width:n,spring:c,rise:u,depth:a,shear:o},t.userData.deckHeight=r,nn(t,"masonry-arch",e,[[-s-1,-1,-a/2],[-s-1,-1,a/2],[s+1,-1,-a/2],[s+1,-1,a/2]].map(([S,M,w])=>[S,M,w+S*o]))}bridge(e={}){const t=new St,n=e.width??9,s=e.length??18,r=e.height??6,a=String(e.type??"road");k(t,a==="masonry"?D.brick:D.concrete,0,r-.42,0,n,.84,s),k(t,a==="rail"?D.ballast:6843239,0,r+.01,0,n-.45,.1,s);for(const o of[-1,1]){k(t,a==="masonry"?D.brick:D.steel,o*(n/2-.13),r+.55,0,.28,1.2,s),k(t,D.stone,o*(n/2-.13),r+1.18,0,.35,.13,s);const l=k(t,a==="masonry"?D.brick:D.concrete,0,(r-.84)/2,o*(s/2-.65),n+1,r-.84,1.3);Object.assign(l.userData,{bridgeSupport:"abutment",bridgeEnd:o});for(const c of[-n/2,n/2]){const u=k(t,D.concrete,c,(r-.84)/2,o*(s/2+.8),.7,r-.84,2.6);Object.assign(u.userData,{bridgeSupport:"pier",bridgeEnd:o})}}if(a==="rail"||a==="girder")for(const o of[-n/2+.5,n/2-.5]){k(t,D.steel,o,r-.9,0,.28,.9,s-2);for(let l=0;l<s-2;l+=2)on(t,D.steel,vt(o,r-1.3,-s/2+1+l),vt(o,r-.5,-s/2+3+l),.07)}return t.userData.deckHeight=r,t.userData.opening={width:n-1,height:r-.84,length:s-2.6},nn(t,"bridge",e,[[0,0,-s/2],[0,0,s/2]])}tunnel(e={}){const t=new St,n=e.width??8.6,s=e.height??6.5,r=e.length??60,a=.5,o=(l,c,u,p)=>{const d=l/2,h=c-d,f=new mr;f.moveTo(-d-u,-.7),f.lineTo(d+u,-.7),f.lineTo(d+u,h),f.absarc(0,h,d+u,0,Math.PI,!1),f.closePath();const _=new pr;_.moveTo(-d,-.45),_.lineTo(-d,h),_.absarc(0,h,d,Math.PI,0,!0),_.lineTo(d,-.45),_.closePath(),f.holes.push(_);const m=new vs(f,{depth:p,steps:1,bevelEnabled:!1,curveSegments:10});return m.translate(0,0,-p/2),m};Ft(o(n,s,a,r),7104607,t,0,0,0);for(const l of[-1,1]){Ft(o(n,s,1.4,1.2),D.brick,t,0,0,l*r/2),k(t,D.stone,0,s+1.18,l*r/2,n+3.2,.22,1.55);for(const c of[-n/2-1.3,n/2+1.3])k(t,D.brick,c,2.7,l*r/2,1.5,6.8,1.5)}for(const l of[-1,1])k(t,7829100,l*(n/2-.3),-.28,0,.34,.25,r);return t.userData.clearOpening={width:n,height:s,length:r},nn(t,"tunnel",e,[[-n/2,0,0],[n/2,0,0]])}roadVehicle(e={}){const t=new St,n=String(e.kind??"car").toLowerCase(),s=/bus|coach/.test(n),r=/lorry|truck|hgv/.test(n),a=n==="van";if(r){const h=e.color??13815999;k(t,D.dark,0,.59,0,2.05,.32,9.8),k(t,h,0,1.72,-3.64,2.42,2.02,2.72),k(t,D.roof,0,2.82,-3.64,2.44,.2,2.74),k(t,13027518,0,2.11,1.2,2.45,2.7,7.4),k(t,D.steel,0,.76,1.2,2.5,.16,7.5),k(t,D.glass,0,2.2,-5.018,2.08,.9,.045),k(t,D.dark,0,1.21,-5.025,1.6,.34,.06);for(const m of[-1,1])k(t,D.glass,m*1.225,2.18,-3.7,.035,.87,1.9),k(t,D.dark,m*1.43,2.12,-4.75,.15,.28,.14),k(t,15525576,m*.87,1.03,-5.04,.34,.22,.045,!0),k(t,12864323,m*.94,.92,4.94,.28,.18,.04,!0),k(t,D.steel,m*.59,2.08,4.915,1.14,2.42,.025),k(t,D.dark,m*.1,1.9,4.94,.045,.75,.035);for(const m of[-3.6,2.85,4.02])for(const g of[-1.1,1.1]){const x=_t(t,D.black,g,.48,m,.48,.28);x.rotation.z=Math.PI/2;const S=_t(t,D.steel,g*1.02,.48,m,.24,.29);S.rotation.z=Math.PI/2}k(t,D.steel,0,.63,-5.05,2.46,.24,.22),k(t,D.yellow,0,.94,4.94,.45,.14,.035);const f=nn(t,"road-vehicle",{...e}),_=f.userData.bounds;return f.userData.vehicleDimensions={length:_.max[2]-_.min[2],width:_.max[0]-_.min[0],height:_.max[1]},f}const o=s?10.8:r?10:a?5.4:4.5,l=s||r?2.45:1.8,c=s?3.05:r?3.5:a?2.5:1.55,u=e.color??[10770504,6783115,11909033,15657436,4279121][(e.seed??1)%5];k(t,D.dark,0,.45,0,l*.86,.25,o*.85),k(t,u,0,c*.48+.17,0,l,c*.55,o),k(t,u,0,c*.8,r?1.5:.15,l*.92,c*.4,o*.7),r&&k(t,13158329,0,2.25,1.2,2.42,2.6,6.9);const p=r?1.5:.15;k(t,D.glass,0,c*.82,p-o*.35-.025,l*.85,c*.29,.05),k(t,D.glass,0,c*.82,p+o*.35+.025,l*.85,c*.25,.05);for(const h of[-1,1])for(let f=0;f<(s?6:r?1:2);f++)k(t,D.glass,h*(l*.46+.012),c*.8,-o*.29+f*o*(s?.12:.31),.035,c*.29,o*(s?.09:.23));const d=s||r?.43:.32;for(const h of[-l*.46,l*.46])for(const f of[-o*.32,o*.32]){const _=_t(t,D.black,h,d,f,d,.22);_.rotation.z=Math.PI/2;const m=_t(t,D.steel,h*1.02,d,f,d*.5,.24);m.rotation.z=Math.PI/2}for(const h of[-1,1])k(t,16116944,h*l*.31,.7,-o/2-.015,.3,.17,.035,!0),k(t,13191743,h*l*.31,.7,o/2+.015,.26,.17,.035,!0);if(n==="taxi"){k(t,15129e3,0,c+.12,.05,.6,.2,.28);const h=$i("TAXI",.12,D.black);h.position.set(0,c+.055,-.097),h.rotation.y=Math.PI,t.add(h)}return t.userData.vehicleDimensions={length:o,width:l,height:c},nn(t,"road-vehicle",e,[[-l*.46,0,-o*.32],[l*.46,0,o*.32]])}train(e={kind:"172"}){const t=new St,n=String(e.kind??"172"),s=n==="139",r=n==="metro",a=n==="emu",o=n==="heritage",l=Math.max(1,e.cars??(s?1:r?3:a?4:3)),c=s?9.6:r?10.5:a?20.4:23,u=r?2.65:2.75,p=n==="168"?13224125:s?15130567:r?12962245:a?13225680:o?8081729:14209724,d=[],h=[],f=[],_=[];for(let m=0;m<l;m++){const g=new St;g.position.z=m*(c+.65)+c/2,t.add(g),d.push(g),k(g,D.dark,0,.77,0,u*.75,.65,c*.91),k(g,p,0,2.28,0,u,2.45,c-.35),k(g,o?D.brown:D.purple,0,1.14,0,u+.02,.35,c-.3),k(g,n==="172"?D.orange:r?10241915:a?3496314:o?D.cream:3690860,0,1.5,0,u+.025,.23,c-.35),k(g,D.roof,0,3.61,0,u*.92,.27,c-.7);for(const x of[-c*.29,c*.29]){k(g,D.dark,0,.64,x,1.85,.38,2.5);for(const S of[-1.05,1.05])for(const M of[-.755,.755]){const w=_t(g,D.dark,M,.4,x+S,.4,.16);w.rotation.z=Math.PI/2}}for(const x of[-1,1]){for(let S=0;S<(s?4:8);S++)k(g,D.glass,x*(u/2+.012),2.65,-c*.36+S*c*(s?.23:.105),.04,.88,s?1.15:1.55);for(const S of[-c*.33,c*.33]){const M=k(g,n==="172"?D.purple:D.steel,x*(u/2+.035),2.16,S,.045,2.05,1.15);h.push(M),k(g,D.glass,x*(u/2+.065),2.68,S,.035,.75,.8)}}for(const x of[-1,1]){const S=m===0&&x===-1||m===l-1&&x===1;k(g,D.steel,0,.73,x*(c/2-(S?.25:0)),.35,.22,S?.5:.65)}for(const x of[-1,1]){const S=m===0&&x===-1||m===l-1&&x===1;if(k(g,S?r?12962245:D.yellow:D.dark,0,2.1,x*(c/2-.1),u*.91,2.52,.16),k(g,D.glass,0,2.95,x*(c/2-.026),u*.8,.77,.045),S)for(const M of[-.88,.88]){const w=k(g,x===-1?16183241:15293259,M,1.75,x*(c/2-.031),.22,.22,.05,!0);(x===-1?f:_).push(w)}}if(k(g,D.steel,0,3.86,0,u*.54,.26,2.3),(r||a)&&m===Math.min(1,l-1)){k(g,D.dark,0,4.03,0,1.2,.15,1.75);for(const x of[-.4,.4])on(g,D.dark,vt(x,4.1,-.7),vt(x,4.75,.65),.045),on(g,D.dark,vt(x,4.75,.65),vt(x,5.43,0),.045),on(g,D.dark,vt(x,4.1,.7),vt(x,4.75,-.65),.045),on(g,D.dark,vt(x,4.75,-.65),vt(x,5.43,0),.045);k(g,D.dark,0,5.46,0,1.35,.08,.12)}}return t.userData.cars=d,t.userData.doors=h,t.userData.frontLights=f,t.userData.rearLights=_,t.userData.totalLength=l*c+(l-1)*.65,t.userData.carLength=c,t.userData.couplerGap=.65,t.userData.firstCarCentreDistance=c/2,t.userData.noseOffset=0,t.userData.carCentreDistances=Array.from({length:l},(m,g)=>c/2+g*(c+.65)),t.userData.originConvention="front nose at z=0, consist extends in +Z",nn(t,"rolling-stock",e)}crossing(e={}){const t=new St,n=e.width??7,s=e.tracks??2,r=e.trackSpacing??4.2,a=xo.clamp(Number(e.roadShear)||0,-1.5,1.5),o=Math.atan(a),l=[];for(let d=0;d<s;d++){const h=(d-(s-1)/2)*r;l.push(h-.755,h+.755)}const c=[-s*r/2-1,...l.flatMap(d=>[d-.1,d+.1]),s*r/2+1];for(let d=0;d<c.length-1;d+=2){const h=(c[d]+c[d+1])/2,f=c[d+1]-c[d],_=k(t,7501677,h,-.09,a*h,f,.17,n);if(a){_.geometry=Rh.clone();const m=_.geometry.getAttribute("position");for(let g=0;g<m.count;g++)m.setZ(g,m.getZ(g)+a*m.getX(g)*f/n);_.geometry.computeVertexNormals()}}const u=[],p=[];for(const d of[-1,1]){const h=d*(s*r/2+1.4),f=d*(n/2+.8)+a*h;k(t,D.concrete,h,-.12,f,.9,.25,.9),k(t,D.white,h,.7,f,.5,1.4,.5);const _=new St;_.position.set(h,1.2,f),_.rotation.y=d*Math.PI/2-o,t.add(_);const m=n/2+.35;for(let x=0;x<Math.ceil(m/.55);x++)k(_,x%2?D.red:D.white,.275+x*.55,0,0,.55,.2,.14);k(_,D.dark,-.28,0,0,.65,.38,.46),u.push({pivot:_,upSign:1});const g=new St;g.position.set(h,0,f+d*.8),g.rotation.y=d*Math.PI/2-o,t.add(g),k(g,D.black,0,2,0,.85,.65,.18),_t(g,D.steel,0,.95,0,.065,1.9);for(const x of[-.22,.22]){const S=Ft(Ci,D.red,g,x,2.12,.11,.13,.05,.13,!0);S.rotation.x=Math.PI/2,S.material=new _n({color:3153181,emissive:16726059,emissiveIntensity:0}),p.push(S)}k(g,D.yellow,0,1.86,.11,.2,.16,.04)}return t.userData.barriers=u,t.userData.warningLights=p,Dh(t,e.closed?1:0,0),nn(t,"level-crossing",e)}furniture(e,t={}){const n=new St;e=e.toLowerCase().replace(/[-_ ]/g,"");const s=(r,a,o,l,c=.1,u=D.white)=>{const p=$i(r,c,u);return p.position.set(a,o,l),n.add(p),p};if(e==="bench"){k(n,D.brown,0,.48,0,1.8,.12,.52),k(n,D.brown,0,.85,.22,1.8,.63,.08);for(const r of[-.65,.65])k(n,D.steel,r,.23,0,.08,.46,.45),k(n,D.steel,r,.62,0,.09,.1,.63)}else if(e==="lamp")_t(n,D.steel,0,2.5,0,.065,5),k(n,D.concrete,0,-.08,0,.38,.17,.38),k(n,D.dark,0,5,0,.55,.13,.8),k(n,D.white,0,4.91,0,.48,.035,.72,!0);else if(e==="ticketmachine"){k(n,D.concrete,0,.06,0,.85,.12,.65),k(n,4352866,0,.99,0,.65,1.86,.46),k(n,D.dark,0,1.36,.245,.45,.4,.035),k(n,10202784,0,1.36,.267,.35,.29,.025),k(n,D.black,0,.94,.245,.23,.025,.035),k(n,D.dark,0,.7,.27,.3,.08,.1);for(const r of[-.12,0,.12])k(n,D.steel,r,1.05,.255,.065,.065,.025);s("TICKETS",0,1.73,.245,.085),n.userData.facility="ticket-machine"}else if(e==="helppoint"){k(n,D.concrete,0,.045,0,.45,.09,.45),_t(n,D.steel,0,1.1,0,.055,2.2),k(n,4683621,0,1.36,.03,.37,.78,.23),k(n,D.dark,0,1.57,.157,.22,.11,.025);const r=Ft(Ci,13874760,n,0,1.26,.165,.075,.025,.075);r.rotation.x=Math.PI/2,s("HELP",0,1.69,.158,.07),n.userData.facility="help-point"}else if(e==="cctv")_t(n,D.steel,0,2.5,0,.06,5),k(n,D.concrete,0,.04,0,.36,.08,.36),k(n,D.steel,.22,4.72,0,.45,.09,.1),k(n,13225153,.46,4.72,-.12,.22,.2,.5),k(n,D.black,.46,4.72,-.378,.14,.13,.025),k(n,D.steel,.46,4.86,-.13,.3,.055,.58),k(n,12237998,0,3.9,.05,.36,.24,.035),s("CCTV",0,3.84,.075,.065,D.dark),n.userData.facility="cctv";else if(e==="clock"){_t(n,D.steel,0,1.45,0,.06,2.9);const r=_t(n,D.dark,0,2.95,0,.38,.13);r.rotation.x=Math.PI/2;const a=_t(n,D.cream,0,2.95,.076,.335,.025);a.rotation.x=Math.PI/2;for(let c=0;c<12;c++){const u=c*Math.PI/6,p=k(n,D.dark,Math.sin(u)*.28,2.95+Math.cos(u)*.28,.097,.018,.055,.014);p.rotation.z=-u}const o=new St;o.position.set(0,2.95,.111),o.rotation.z=-(Number(t.hour??10)%12+Number(t.minute??10)/60)*Math.PI/6,k(o,D.dark,0,.085,0,.025,.17,.016),n.add(o);const l=new St;l.position.set(0,2.95,.118),l.rotation.z=-Number(t.minute??10)*Math.PI/30,k(l,D.dark,0,.12,0,.016,.24,.014),n.add(l),n.userData.hands={hour:o,minute:l}}else if(e==="cyclerack")for(const r of[-.65,0,.65]){for(const a of[-.3,.3])_t(n,D.steel,r,.4,a,.035,.8);k(n,D.steel,r,.8,0,.07,.07,.6);for(const a of[-.3,.3])k(n,D.steel,r,.018,a,.2,.035,.15)}else if(e==="planter"){k(n,D.brick,0,.23,0,1.4,.46,.62),k(n,5852988,0,.465,0,1.22,.035,.45);for(let r=0;r<5;r++){const a=-.48+r*.24;_t(n,D.green,a,.56,0,.018,.18),Ft(Qs,r%2?12480901:12888932,n,a,.7,0,.12,.1,.11)}}else if(e==="departureboard"){for(const r of[-.68,.68])_t(n,D.steel,r,1.15,0,.045,2.3),k(n,D.concrete,r,.03,0,.22,.06,.22);k(n,D.black,0,2.38,0,1.8,.65,.16),s("DEPARTURES",0,2.52,.09,.115,14136940),t.text&&s(String(t.text).slice(0,19),0,2.24,.09,.09,14136940),n.userData.display={text:t.text??"",binding:"station departures"}}else if(e==="busstop")_t(n,D.steel,0,1.35,0,.045,2.7),k(n,D.concrete,0,.025,0,.24,.05,.24),k(n,D.white,0,2.45,0,.46,.61,.08),k(n,D.red,0,2.61,.049,.4,.2,.025),s("BUS",0,2.55,.065,.085),k(n,D.dark,0,1.38,.04,.29,.65,.08),k(n,D.cream,0,1.38,.089,.25,.59,.018),s("TIMES",0,1.56,.101,.045,D.dark);else if(e==="trafficlight"){_t(n,D.steel,0,1.35,0,.055,2.7),k(n,D.concrete,0,.035,0,.3,.07,.3),k(n,D.black,0,2.86,0,.38,1.08,.2);const r={red:[],yellow:[],green:[]};for(const[a,o,l]of[["red",3.16,15156277],["yellow",2.86,15318339],["green",2.56,5094014]]){const c=Ft(Ci,l,n,0,o,.12,.1,.04,.1);c.rotation.x=Math.PI/2,c.material=new _n({color:1516834,emissive:l,emissiveIntensity:a===(t.aspect??"red")?1.1:0}),r[a].push(c),k(n,D.black,0,o+.11,.15,.28,.035,.22)}n.userData.lenses=r,n.userData.aspect=t.aspect??"red"}else if(e==="roadsign"){_t(n,D.steel,0,1,0,.045,2);const r=_t(n,D.red,0,1.95,0,.34,.075);r.rotation.x=Math.PI/2;const a=_t(n,D.white,0,1.95,.045,.28,.025);a.rotation.x=Math.PI/2,s(String(t.text??"30"),0,1.82,.065,.25,D.dark)}else if(e==="gate"){const r=t.width??3;for(const o of[-r/2,r/2])k(n,D.steel,o,.85,0,.12,1.7,.12),k(n,D.concrete,o,.02,0,.3,.04,.3);const a=new St;a.position.set(-r/2,0,0),n.add(a);for(const o of[.3,1.45])k(a,D.steel,r/2,o,0,r-.16,.08,.08);for(let o=.16;o<r-.1;o+=.2)k(a,D.steel,o,.87,0,.035,1.2,.035);n.userData.hinge=a}else if(e==="fence"){const r=t.length??3,a=t.height??1.6;for(const o of[-r/2,r/2])k(n,D.steel,0,a/2,o,.07,a,.07);for(const o of[.3,a-.2])k(n,D.steel,0,o,0,.045,.05,r);for(let o=-r/2;o<=r/2;o+=.2)k(n,D.steel,0,a/2,o,.035,a,.035)}else if(e==="aws"){k(n,D.yellow,0,.07,0,.47,.15,.58),k(n,D.dark,0,.16,0,.37,.05,.44);for(const r of[-.31,.31])k(n,D.steel,r,-.02,0,.17,.1,.65)}else if(e==="tpws"){for(const r of[-.5,.5])k(n,D.yellow,r,.04,0,.045,.08,1);for(const r of[-.5,.5])k(n,D.yellow,0,.04,r,1,.08,.045)}else if(e==="buffer"){for(const r of[-.755,.755])on(n,D.steel,vt(r,0,.9),vt(r,.9,0),.16),k(n,D.steel,r,.9,0,.18,.22,.5);k(n,D.red,0,.95,-.1,2.5,.4,.3)}else if(e==="person"||e==="staff"){for(const r of[-.13,.13])k(n,3161675,r,.425,0,.18,.85,.22);if(k(n,t.color??(e==="staff"?D.orange:D.purple),0,1.1,0,.48,.62,.28),Ft(Qs,13148805,n,0,1.61,0,.18,.23,.18),e==="staff")for(const r of[1,1.22])k(n,D.yellow,0,r,.15,.48,.055,.025);for(const r of[-.32,.32])k(n,t.color??D.orange,r,1.08,0,.13,.6,.16)}else if(e==="sign"){_t(n,D.steel,0,.95,0,.045,1.9),k(n,D.white,0,1.8,0,.62,.55,.06);const r=$i(String(t.text??"75"),.28,D.black);r.position.set(0,1.65,.04),n.add(r)}else if(e==="drainage")k(n,D.concrete,0,-.12,0,.48,.2,t.length??3),k(n,D.dark,0,-.01,0,.25,.025,t.length??3);else if(e==="bin")_t(n,D.dark,0,.48,0,.25,.95),k(n,D.steel,0,.94,0,.52,.08,.5),k(n,D.black,0,.8,.255,.23,.075,.025);else if(e==="stairs")for(let r=0;r<10;r++)k(n,D.concrete,0,(r+1)*.09,-r*.3,1.8,(r+1)*.18,.3);else k(n,D.concrete,0,.05,0,.85,.1,.65),k(n,e==="cabinet"?10990756:D.steel,0,.7,0,.68,1.3,.45),k(n,D.dark,.2,.75,.235,.035,.23,.035);return nn(n,e,t)}}function Lh(i,e){const t=i.userData.lenses;if(!t)return;const n=e==="doubleYellow"?["yellow","doubleYellow"]:[e];for(const[s,r]of Object.entries(t))for(const a of r){const o=a.material,l=n.includes(s);o.color.setHex(l?s==="red"?15746098:s==="green"?5036939:16761641:1516834),o.emissiveIntensity=l?1.3:0}i.userData.aspect=e}function y_(i,e){const t=xo.clamp(e,0,1),n=i.userData.blades;if(n)for(const s of n){const r=s.userData.side,a=r<0?1-t:t;s.position.x=s.userData.baseX-r*(1-a)*.17,s.rotation.y=r*(1-a)*.012}i.userData.blend=t,i.userData.proved=t===0?"normal":t===1?"reverse":"moving"}function Dh(i,e,t=0,n=e>.01){const s=xo.clamp(e,0,1),r=i.userData.barriers;if(r)for(const o of r)o.pivot.rotation.z=(1-s)*Math.PI/2;const a=i.userData.warningLights;a&&a.forEach((o,l)=>{const c=o.material;c.emissiveIntensity=n&&Math.floor(t*2.8+l)%2===0?1.5:0}),i.userData.closedBlend=s}const ha=i=>{const e=Math.hypot(...i)||1;return i.map(t=>t/e)},pc=(i,e)=>[i[1]*e[2]-i[2]*e[1],i[2]*e[0]-i[0]*e[2],i[0]*e[1]-i[1]*e[0]];function ci(i,e=1,t){const n=ha(t??i.tangent.map(o=>o*e)),s=Ni(i).map(o=>o*e),r=ha(pc(s,n));return{right:ha(pc(n,r)),up:r,forward:n}}function b_(i,e,t){return ci({tangent:[-Math.sin(i)*Math.cos(e),Math.sin(e),-Math.cos(i)*Math.cos(e)],right:[Math.cos(i),0,-Math.sin(i)],bank:t})}function os(i,e){const t=i.replace(/^\/+/,""),n=t.split("/");if(n.length<2||n[0]!=="data"||n.some(s=>!/^[A-Za-z0-9_-][A-Za-z0-9._-]*$/.test(s)))throw new Error(`Invalid local route data path: ${i}`);return new URL(t,e).href}class E_{container;renderer;camera;maximumDimension;observer;frame=0;scale=.5;last="";disposed=!1;schedule=()=>{!this.disposed&&!this.frame&&(this.frame=requestAnimationFrame(()=>{this.frame=0,this.resize()}))};constructor(e,t,n,s=8192){this.container=e,this.renderer=t,this.camera=n,this.maximumDimension=s,window.addEventListener("resize",this.schedule),typeof ResizeObserver<"u"&&(this.observer=new ResizeObserver(this.schedule),this.observer.observe(e)),this.resize()}setScale(e){this.scale=Number.isFinite(e)?Math.max(.25,Math.min(1,e)):.5,this.resize()}resize(){if(this.disposed)return;const e=Math.floor(this.container.clientWidth),t=Math.floor(this.container.clientHeight);if(!Number.isFinite(e)||!Number.isFinite(t)||e<1||t<1)return;const n=Math.min(this.scale,this.maximumDimension/e,this.maximumDimension/t,Math.sqrt(16777216/(e*t))),s=`${e}/${t}/${n}`;s!==this.last&&(this.renderer.setDrawingBufferSize(e,t,n),this.camera.aspect=e/t,this.camera.updateProjectionMatrix(),this.last=s)}dispose(){this.disposed=!0,this.observer?.disconnect(),window.removeEventListener("resize",this.schedule),this.frame&&cancelAnimationFrame(this.frame),this.frame=0}}function w_(i,e){const t=e[0]*i.right[0]+e[2]*i.right[2];return Math.abs(t)<.3?0:Math.max(-1.5,Math.min(1.5,-(e[0]*i.tangent[0]+e[2]*i.tangent[2])/t))}class T_{container;data;route;sim;scene=new hd;camera=new dn(62,1,.2,2400);factory=new S_;get roadTraffic(){return this.sim.roadTraffic}loopFootGeometry=new kn(.18,.25,.18);loopFootMaterial=new _n({color:5397332,roughness:.95});renderer;viewport;worker;ready=!1;loaded=new Map;requested=new Set;tileRetries=new Map;requestTokens=new Map;requestTimers=new Map;requestAborts=new Map;nextRequestToken=0;terrainSource;workerFailures=0;disposed=!1;adjacent=[];walkers=new Map;signalModels=new Map;pointModels=new Map;crossingModels=new Map;trainModels=new Map;carModels=new Map;fog=new So(13489868,450,1700);sun=new df(16772559,3);ambient=new cf(14083564,7964251,2.7);gpuInfo="WebGL 2";tileCount=0;triangles=0;placements=0;failures=[];frameTimes=[];onProgress;onError;tileSource;contextLost=e=>{if(e.preventDefault(),this.disposed)return;const t=new Error("Graphics context lost. Reload to reconnect graphics.");this.failures.push(t.message),this.sim.paused=!0,this.onError?.(t)};quality="balanced";lastS=-1/0;previousCamera=new O;firstFrame=!0;warmFrames=0;constructor(e,t,n,s){this.container=e,this.data=t,this.route=n,this.sim=s;const r=document.createElement("canvas");let a=null;try{a=r.getContext("webgl2",{antialias:!0,alpha:!1,powerPreference:"high-performance"})}catch{}if(!a)throw new Error("WebGL 2 is unavailable. Enable hardware acceleration or use a current browser with WebGL 2 support.");this.renderer=new o_({canvas:r,context:a,antialias:!0,alpha:!1,powerPreference:"high-performance"}),r.addEventListener("webglcontextlost",this.contextLost),this.gpuInfo=String(a.getParameter(a.RENDERER)||"WebGL 2"),this.renderer.setPixelRatio(.5),this.renderer.setClearColor(13489868),this.renderer.toneMapping=co,this.renderer.toneMappingExposure=1,this.renderer.shadowMap.enabled=!0,this.scene.background=new Ve(13489868),this.scene.fog=this.fog,this.scene.add(this.ambient,this.sun),this.sun.position.set(-140,250,-80),this.sun.castShadow=!0,this.sun.shadow.mapSize.set(1024,1024),Object.assign(this.sun.shadow.camera,{left:-95,right:95,top:95,bottom:-95,near:1,far:650}),this.sun.shadow.bias=-5e-4,this.sun.shadow.normalBias=.12,this.sun.shadow.camera.updateProjectionMatrix(),this.scene.add(this.sun.target),this.container.appendChild(this.renderer.domElement),this.renderer.domElement.setAttribute("aria-label","View from the front of the train"),this.worker=this.createWorker(),this.viewport=new E_(this.container,this.renderer,this.camera,Number(a.getParameter(a.MAX_RENDERBUFFER_SIZE))||8192)}async init(e){if(this.renderer.getContext().isContextLost())throw new Error("The WebGL 2 context was lost. Reload to reconnect graphics.");let t=this.data.adjacentServices;if(!t){const n=await fetch(os("data/adjacent-services.json",document.baseURI));n.ok&&(t=(await n.json()).services)}this.data.adjacentServices=t||[];for(const n of t||[]){if(n.metadata?.sceneryOnly)continue;const s=n.kind==="shuttle"?"139":n.kind==="tram"?"metro":n.kind==="heritage"?"heritage":"emu",r=this.factory.train({id:n.id,kind:s,cars:n.cars});this.scene.add(r),this.adjacent.push({data:n,path:new fa(n.points),model:r})}this.terrainSource=e,this.initialiseWorker(),this.makeInfrastructure()}createWorker(){const e=new Worker(new URL(""+new URL("world.worker-DMyAMAdJ.js",import.meta.url).href,import.meta.url),{type:"module"});return e.onmessage=t=>{e===this.worker&&!this.disposed&&this.onWorker(t.data)},e.onerror=t=>{t.preventDefault(),e===this.worker&&!this.disposed&&this.restartWorker(t.message||"World worker failed")},e}initialiseWorker(){if(!this.terrainSource)return;const e=this.terrainSource.slice(0);this.worker.postMessage({type:"init",route:this.data,terrain:e},[e])}restartWorker(e){this.ready=!1,this.worker.terminate();for(const t of[...this.requested])this.tileFailed(t,e);if(++this.workerFailures>=4||!this.terrainSource){const t=`Scenery worker could not recover: ${e}. Reload and try again.`;this.failures.push(t),this.onError?.(new Error(t));return}this.worker=this.createWorker(),this.initialiseWorker()}clearRequest(e){const t=this.requestTimers.get(e);t!==void 0&&window.clearTimeout(t),this.requestTimers.delete(e),this.requestAborts.get(e)?.abort(),this.requestAborts.delete(e),this.requestTokens.delete(e),this.requested.delete(e)}onWorker(e){if(e.type==="ready"){this.ready=!0,this.updateTiles(!0);return}if(e.type==="tile"&&typeof e.id!="string"||e.id&&(!this.requestTokens.has(e.id)||e.token!==this.requestTokens.get(e.id)))return;if(e.type==="error"){const a=e.error||e.message||"World generation failed.";e.id?this.tileFailed(e.id,a):this.restartWorker(a);return}if(e.type!=="tile")return;const t=e.mesh||e.result?.mesh;if(!t){e.id&&this.tileFailed(e.id,"Worker returned no geometry");return}if(!(t.position instanceof Float32Array)||!(t.normal instanceof Float32Array)||!(t.color instanceof Float32Array)||!(t.index instanceof Uint32Array)||!t.position.length||t.position.length%3!==0||t.normal.length!==t.position.length||t.color.length!==t.position.length||!t.index.length||t.index.length%3!==0){e.id&&this.tileFailed(e.id,"Worker returned malformed geometry");return}let n;try{n=Eh(t)}catch(a){e.id&&this.tileFailed(e.id,`Invalid geometry: ${a instanceof Error?a.message:String(a)}`);return}this.clearRequest(e.id),this.workerFailures=0,this.tileRetries.delete(e.id);const s=new _n({vertexColors:!0,roughness:.94,metalness:0,side:Sn,flatShading:!0}),r=new zt(n,s);r.receiveShadow=!0,r.castShadow=!0,r.name=`tile:${e.id}`,this.scene.add(r),this.loaded.set(e.id,{mesh:r,used:performance.now()}),this.tileCount=this.loaded.size,this.triangles+=t.index.length/3,this.placements+=(e.placements||[]).length;for(const a of e.pedestrianPaths||[]){if(this.walkers.has(a.id))continue;const o=this.factory.furniture("person",{id:a.id,color:a.role==="staff"?13673292:6386570});this.scene.add(o),this.walkers.set(a.id,{path:new ht(a.points),model:o,speed:a.speed||.7,phase:ua(a.id)%20})}this.evictInactiveTiles(),this.onProgress?.(),this.updateTiles(!0)}tileFailed(e,t){this.clearRequest(e);const n=(this.tileRetries.get(e)?.attempts??0)+1,s=performance.now()+Math.min(4e3,250*2**(n-1));if(this.tileRetries.set(e,{attempts:n,next:s,reason:t}),n>=4){const r=`Scenery tile ${e} failed after ${n} attempts: ${t}`;this.failures.push(r),this.onError?.(new Error(r));return}window.setTimeout(()=>{this.disposed||this.updateTiles(!0)},Math.max(1,Math.ceil(s-performance.now())+1)),this.updateTiles(!0)}setQuality(e){this.quality=e,this.renderer.shadowMap.enabled=e!=="low",this.updateTiles(!0)}setRenderScale(e){this.viewport.setScale(e)}resetTraffic(){for(const e of this.carModels.values())this.scene.remove(e);this.carModels.clear()}preparationProgress(){const e=this.route.lanePose(this.sim.player.s,this.sim.player.lane).position,t=this.data.tiles.filter(n=>Math.hypot(Math.max(n.bounds[0]-e[0],0,e[0]-n.bounds[2]),Math.max(n.bounds[1]-e[2],0,e[2]-n.bounds[3]))<250).map(n=>n.id);return{loaded:t.filter(n=>this.loaded.has(n)).length,total:t.length,failed:t.find(n=>!this.loaded.has(n)&&(this.tileRetries.get(n)?.attempts??0)>=4)}}async preparePosition(e){this.updateTiles(!0),await new Promise((t,n)=>{const s=performance.now(),r=()=>{const a=this.preparationProgress();e?.(a.loaded,a.total),a.total>0&&a.loaded===a.total?t():a.failed?n(new Error(`Scenery tile ${a.failed} failed: ${this.tileRetries.get(a.failed)?.reason||"world generation failed"}`)):performance.now()-s>9e4?n(new Error("The departure scenery could not be prepared. Reload and try again.")):setTimeout(r,150)};r()})}place(e,t,n=0,s=!1){const r=this.route.sample(t,n);e.position.fromArray(r.position),e.rotation.set(r.pitch,r.yaw+(s?Math.PI:0),-r.bank),this.scene.add(e)}placeOnLane(e,t,n,s=0,r=0,a=!1){const o=this.route.lanePose(t,n);e.position.set(o.position[0]+o.right[0]*s,o.position[1]+r,o.position[2]+o.right[2]*s),e.rotation.y=o.yaw+(a?Math.PI:0),this.scene.add(e)}placeRailDevice(e,t,n,s,r){const a=this.route.lanePose(t,n),o=ci(a,r);e.position.set(...a.position).addScaledVector(new O(...o.up),s),Ki(e,o),this.scene.add(e)}makeInfrastructure(){for(const e of this.sim.signals){const t=this.factory.signal({id:e.id,aspect:"red",aspects:e.aspects});this.placeOnLane(t,e.s,e.lane,-e.direction*2.1,-.4,e.direction===-1),this.signalModels.set(e.id,t);for(const n of[200,74,70,1.2,0]){const s=this.factory.furniture(n===200?"aws":"tpws",{id:`${e.id}/${n===200?"aws":"tpws-"+n}`,source:e.source});if(n!==200){const a=[];for(const l of[-.5,.5])for(const c of[-.42,.42]){const u=new zt(this.loopFootGeometry,this.loopFootMaterial);u.position.set(l,-.12,c),u.userData.componentId=`${s.userData.id}/bed-mount/${l}/${c}`,u.castShadow=!0,u.receiveShadow=!0,s.add(u),a.push([l,-.245,c])}s.userData.supportAnchors=a,s.userData.parentSupport="rail-bed",s.userData.intentionalIntersections="Footings extend 45 mm into nominal ballast, allowing for local grade.",s.updateMatrixWorld(!0);const o=new ti().setFromObject(s);s.userData.bounds={min:o.min.toArray(),max:o.max.toArray()}}const r=this.route.travel(e.s,-e.direction*n,e.lane);this.placeRailDevice(s,r,e.lane,n===200?-.22:-.09,e.direction)}}for(const e of this.sim.trackwork.switches){const t=m_(e);this.scene.add(t),this.pointModels.set(e.id,t)}for(const e of this.sim.crossings){const t=Math.abs(this.route.laneOffset(e.s,4.2)),n=this.route.sample(e.s),s=[...this.sim.roadTraffic.roads.values()].filter(o=>o.mode==="crossing"&&o.routeS!==void 0&&o.crossingS!==void 0&&Math.abs(o.routeS-e.s)<60).sort((o,l)=>Math.abs(o.routeS-e.s)-Math.abs(l.routeS-e.s))[0],r=s?.path.sample(s.crossingS),a=this.factory.crossing({id:e.id,width:s?.width??7,tracks:2,trackSpacing:t,roadShear:r?w_(n,r.tangent):0});this.place(a,e.s,this.route.laneOffset(e.s,4.2)/2),this.crossingModels.set(e.id,a)}}async updateTiles(e=!1){if(!this.ready)return;const t=this.sim.player.s;if(!e&&Math.abs(t-this.lastS)<100)return;this.lastS=t;const n=this.route.sample(t).position,s=this.quality==="high"?1750:this.quality==="low"?900:1300,r=performance.now(),a=this.data.tiles.map(l=>{const c=l.bounds,u=Math.hypot(Math.max(c[0]-n[0],0,n[0]-c[2]),Math.max(c[1]-n[2],0,n[2]-c[3]));return{tile:l,d:u}}).filter(l=>l.d<s).sort((l,c)=>l.d-c.d),o=new Set(a.map(l=>l.tile.id));for(const{tile:l}of a){const c=this.loaded.get(l.id);if(c){c.used=r;continue}if(this.requested.size)break;const u=this.tileRetries.get(l.id);if(u&&(u.attempts>=4||r<u.next))continue;const p=++this.nextRequestToken,d=new AbortController;this.requested.add(l.id),this.requestTokens.set(l.id,p),this.requestAborts.set(l.id,d);const h=window.setTimeout(()=>d.abort(),3e4);try{let f;if(this.tileSource)f=await this.tileSource(l.id);else{const m=await fetch(os(l.url,document.baseURI),{signal:d.signal});if(!m.ok)throw new Error(`Could not load route tile ${l.id} (HTTP ${m.status})`);f=await m.json()}if(this.requestTokens.get(l.id)!==p)return;this.requestAborts.delete(l.id);const _=window.setTimeout(()=>{this.requestTokens.get(l.id)===p&&this.restartWorker(`Tile ${l.id} generation timed out`)},9e4);this.requestTimers.set(l.id,_),this.worker.postMessage({type:"build",tile:f,token:p})}catch(f){this.requestTokens.get(l.id)===p&&this.tileFailed(l.id,f instanceof Error?f.message:String(f))}finally{window.clearTimeout(h)}break}this.evictInactiveTiles(o)}evictInactiveTiles(e){const t=this.quality==="low"?12:this.quality==="high"?25:18,n=t-3;if(this.loaded.size>t){if(!e){const s=this.route.lanePose(this.sim.player.s,this.sim.player.lane).position,r=this.quality==="high"?1750:this.quality==="low"?900:1300;e=new Set(this.data.tiles.filter(a=>Math.hypot(Math.max(a.bounds[0]-s[0],0,s[0]-a.bounds[2]),Math.max(a.bounds[1]-s[2],0,s[2]-a.bounds[3]))<r).map(a=>a.id))}for(const[s,r]of[...this.loaded].sort((a,o)=>a[1].used-o[1].used)){if(this.loaded.size<=n)break;e.has(s)||(this.triangles-=r.mesh.geometry.index.count/3,this.scene.remove(r.mesh),r.mesh.geometry.dispose(),r.mesh.material.dispose(),this.loaded.delete(s),this.requested.delete(s))}}this.tileCount=this.loaded.size}draw(e){const t=performance.now();this.updateTiles();const n=this.sim.player,s=this.route.lanePose(n.s,n.lane),r=n.direction,a=ci(s,r),o=new O(...s.position).addScaledVector(new O(...a.up),2.45),l=this.route.lanePose(this.route.travel(n.s,r*38,n.lane),n.lane),c=new O(...l.position);c.addScaledVector(new O(...ci(l,r).up),2.25),this.firstFrame||this.previousCamera.distanceTo(o)>30?(this.camera.position.copy(o),this.firstFrame=!1):this.camera.position.lerp(o,1-Math.exp(-e*18)),this.previousCamera.copy(o),this.camera.up.fromArray(a.up),this.camera.lookAt(c);const u=this.route.tunnelAt(n.s),p=u?.78:1.1;this.renderer.toneMappingExposure+=(p-this.renderer.toneMappingExposure)*Math.min(1,e*2),this.ambient.intensity=u?1.1:2.7,this.sun.position.copy(o).add(new O(-140,250,-80)),this.sun.target.position.copy(o),this.sun.target.updateMatrixWorld();for(const h of this.sim.signals){const f=this.signalModels.get(h.id);f.visible=Math.abs(h.s-n.s)<1900,f.visible&&Lh(f,this.sim.aspect(h).replace("double-yellow","doubleYellow"))}for(const h of this.sim.points){const f=this.pointModels.get(h.id);f&&(f.visible=Math.abs(h.s-n.s)<1500,f.visible&&f.userData.blend!==h.blend&&Ah(f,h.blend))}for(const h of this.sim.crossings){const f=this.crossingModels.get(h.id);f.visible=Math.abs(h.s-n.s)<1500,f.visible&&Dh(f,h.blend,this.sim.clock,h.state!=="open")}for(const h of this.sim.ai){let f=this.trainModels.get(h.id);const[_,m]=this.sim.interval(h);if(h.portalWaitUntil!==void 0||m<0||_>this.route.length||Math.abs(h.s-n.s)>1800){f&&(f.visible=!1);continue}f||(f=this.factory.train({id:h.id,kind:h.kind,cars:h.cars}),this.trainModels.set(h.id,f),this.scene.add(f)),f.visible=!0;const g=f.userData.cars;if(g){f.position.set(0,0,0),f.rotation.set(0,0,0);const x=Number(f.userData.carLength)||23,S=Number(f.userData.couplerGap)||.65;g.forEach((M,w)=>{const T=this.route.travel(h.s,-h.direction*(x/2+w*(x+S)),h.lane),v=this.route.lanePose(this.route.travel(T,h.direction*x*.29,h.lane),h.lane),y=this.route.lanePose(this.route.travel(T,-h.direction*x*.29,h.lane),h.lane),C=v.position.map((R,P)=>R-y.position[P]);M.position.set((v.position[0]+y.position[0])/2,(v.position[1]+y.position[1])/2,(v.position[2]+y.position[2])/2),Ki(M,ci(this.route.lanePose(T,h.lane),h.direction,C))})}else{const x=this.route.lanePose(h.s,h.lane);f.position.fromArray(x.position),Ki(f,ci(x,h.direction))}}for(const h of this.adjacent){const{data:f,path:_,model:m}=h,g=Number(m.userData.totalLength)||70,x=Number(f.cycleSeconds)||240,S=this.sim.clock%x/x,M=f.metadata?.static?!0:S<.5,w=it((M?S:1-S)*2*1.2-.1,0,1),T=f.metadata?.static?_.length*.55:A_(g/2,_.length-g/2,w),v=T,y=_.sample(v).position;if(m.visible=Math.hypot(y[0]-o.x,y[2]-o.z)<1600,!m.visible)continue;L_(m,M?1:-1,!!f.metadata?.static),m.userData.cars?.forEach((P,F)=>{const z=_.sample(T+g/2-(Number(m.userData.firstCarCentreDistance)+F*(Number(m.userData.carLength)+.65)));P.position.fromArray(z.position),Ki(P,ci(z,1))})}for(const h of this.walkers.values()){const f=(this.sim.clock+h.phase)*h.speed%(h.path.length*2),_=f<=h.path.length,m=_?f:h.path.length*2-f,g=h.path.sample(m);h.model.visible=Math.hypot(g.position[0]-o.x,g.position[2]-o.z)<350,h.model.visible&&(h.model.position.fromArray(g.position),h.model.rotation.y=g.yaw+(_?0:Math.PI))}for(const h of this.roadTraffic.cars.values()){let f=this.carModels.get(h.id);if(Math.hypot(h.position[0]-o.x,h.position[2]-o.z)>950){f&&(f.visible=!1);continue}f||(f=this.factory.roadVehicle({kind:h.kind,id:h.id,seed:ua(h.id),color:[15328469,5466997,10183246,5594452][ua(h.id)%4]}),this.carModels.set(h.id,f),this.scene.add(f)),f.visible=!0,f.position.fromArray(h.position),Ki(f,b_(h.yaw,h.pitch||0,h.bank||0))}this.renderer.render(this.scene,this.camera);const d=performance.now()-t;this.warmFrames++>60&&(this.frameTimes.push(d),this.frameTimes.length>600&&this.frameTimes.shift())}async finishFrame(){this.renderer.getContext().finish()}stats(){return{backend:this.renderer.getContext().isContextLost()?"unavailable":"WebGL2",adapter:this.gpuInfo,tiles:this.tileCount,triangles:this.triangles,placements:this.placements,gpuErrors:this.failures,drawCalls:this.renderer.info.render.calls,memory:this.renderer.info.memory}}dispose(){this.disposed=!0,this.viewport.dispose();for(const e of[...this.requested])this.clearRequest(e);this.renderer.domElement.removeEventListener("webglcontextlost",this.contextLost),this.worker.terminate(),this.renderer.dispose()}}function A_(i,e,t){return i+(e-i)*t}function ua(i){let e=0;for(const t of i)e=Math.imul(e,31)+t.charCodeAt(0);return e>>>0}const mc=new xt,R_=new O,C_=new O,P_=new O;function Ki(i,e){mc.makeBasis(R_.fromArray(e.right),C_.fromArray(e.up),P_.fromArray(e.forward).negate()),i.quaternion.setFromRotationMatrix(mc)}function L_(i,e,t=!1){if(!(i.userData.lightDirection===e&&i.userData.parkedLights===t)){for(const[n,s]of[[1,i.userData.frontLights],[-1,i.userData.rearLights]])for(const r of s||[]){r.userData.ownLampMaterial||(r.material=r.material.clone(),r.userData.ownLampMaterial=!0),r.visible=!t;const a=r.material,o=n===e?16183241:15293259;a.color.setHex(o),a.emissive.setHex(o)}i.userData.lightDirection=e,i.userData.parkedLights=t}}class D_{context;master;traction;tractionGain;horn;warning;rolling;brake;ambience;crossing;reverb;volume=.35;async init(){if(this.context){await this.context.resume();return}const e=new AudioContext;this.context=e,this.master=e.createGain(),this.master.gain.value=this.volume,this.master.connect(e.destination);const t=e.createBuffer(2,e.sampleRate*1.2,e.sampleRate);let n=172;const s=()=>(n=Math.imul(n,1664525)+1013904223|0,(n>>>0)/2147483648-1);for(let d=0;d<2;d++){const h=t.getChannelData(d);for(let f=0;f<h.length;f++)h[f]=s()*(1-f/h.length)**2*.28}const r=e.createConvolver();r.buffer=t,this.reverb=e.createGain(),this.reverb.gain.value=0,this.master.connect(r),r.connect(this.reverb),this.reverb.connect(e.destination),this.tractionGain=e.createGain(),this.tractionGain.gain.value=0;const a=e.createBiquadFilter();a.type="lowpass",a.frequency.value=250,this.tractionGain.connect(a),a.connect(this.master),this.traction=e.createOscillator(),this.traction.type="sawtooth",this.traction.frequency.value=38,this.traction.connect(this.tractionGain),this.traction.start();const o=e.createBuffer(1,e.sampleRate*2,e.sampleRate),l=o.getChannelData(0);for(let d=0;d<l.length;d++)l[d]=s();const c=(d,h)=>{const f=e.createBufferSource();f.buffer=o,f.loop=!0;const _=e.createBiquadFilter();_.type="bandpass",_.frequency.value=d,_.Q.value=h;const m=e.createGain();return m.gain.value=0,f.connect(_),_.connect(m),m.connect(this.master),f.start(),m};this.rolling=c(580,.65),this.brake=c(1900,3),this.ambience=c(370,.4),this.horn=e.createGain(),this.horn.gain.value=0,this.horn.connect(this.master);for(const d of[370,440]){const h=e.createOscillator();h.type="triangle",h.frequency.value=d,h.connect(this.horn),h.start()}this.warning=e.createGain(),this.warning.gain.value=0,this.warning.connect(this.master);const u=e.createOscillator();u.type="sine",u.frequency.value=880,u.connect(this.warning),u.start(),this.crossing=e.createGain(),this.crossing.gain.value=0,this.crossing.connect(this.master);const p=e.createOscillator();p.type="sine",p.frequency.value=1020,p.connect(this.crossing),p.start(),await e.resume()}setVolume(e){this.volume=e,this.master&&this.master.gain.setTargetAtTime(e,this.context.currentTime,.05)}event(e){const t=this.context;if(!t||!this.master)return;const n=e==="clear"?[940,1254]:e==="doors"?[660,880]:e==="tpws"?[220,440]:e==="ack"?[520]:[];for(const[s,r]of n.entries()){const a=t.createOscillator(),o=t.createGain();a.type=e==="tpws"?"square":"sine",a.frequency.value=r,o.gain.setValueAtTime(.05,t.currentTime+s*.09),o.gain.exponentialRampToValueAtTime(.001,t.currentTime+.7+s*.09),a.connect(o),o.connect(this.master),a.start(t.currentTime+s*.09),a.stop(t.currentTime+1+s*.09)}}update(e,t){if(!this.context)return;const n=this.context.currentTime,s=e.paused,r=e.player.speed,a=!!e.route.tunnelAt(e.player.s);this.traction?.frequency.setTargetAtTime(34+r*2.1+Math.max(0,e.player.controller)*35,n,.15),this.tractionGain?.gain.setTargetAtTime(s?0:.012+Math.max(0,e.player.controller)*.025+r*4e-4,n,.12),this.rolling?.gain.setTargetAtTime(s?0:Math.min(.13,r*.004),n,.12),this.brake?.gain.setTargetAtTime(!s&&r>1?Math.max(0,-e.player.controller)*.025:0,n,.1),this.ambience?.gain.setTargetAtTime(s?0:a?.002:.008,n,.3),this.reverb?.gain.setTargetAtTime(!s&&a?this.volume*.38:0,n,.25),this.horn?.gain.setTargetAtTime(!s&&t?.09:0,n,.025),this.warning?.gain.setTargetAtTime(!s&&(e.aws.pending||e.tpws.active)&&Math.floor(n*5)%2===0?.07:0,n,.015);const o=e.crossings.find(c=>c.state!=="open"&&Math.abs(c.s-e.player.s)<240),l=o?Math.abs(o.s-e.player.s):240;this.crossing?.gain.setTargetAtTime(!s&&o&&Math.floor(e.clock*4)%2===0?.025*(1-l/240):0,n,.015)}}class N_{name;legacyKey;database;constructor(e="snow-hill-lines",t="snow-hill-lines-save-v1"){this.name=e,this.legacyKey=t}open(){return this.database??=new Promise((e,t)=>{const n=indexedDB.open(this.name,2);n.onupgradeneeded=()=>{for(const s of["journeys","worlds"])n.result.objectStoreNames.contains(s)||n.result.createObjectStore(s)},n.onsuccess=()=>e(n.result),n.onerror=()=>{this.database=void 0,t(n.error||new Error("Journey storage could not be opened."))},n.onblocked=()=>{this.database=void 0,t(new Error("Close other older Snow Hill Lines tabs, then save again."))}})}async put(e,t){const n=await this.open();await new Promise((s,r)=>{const a=n.transaction(t?["journeys","worlds"]:["journeys"],"readwrite");a.oncomplete=()=>s(),a.onerror=()=>r(a.error||new Error("Journey storage failed.")),a.onabort=()=>r(a.error||new Error("Journey storage was interrupted."));const o=l=>{try{a.abort()}catch{}r(l)};try{const l=a.objectStore("journeys"),c=l.get("active");c.onsuccess=()=>{try{const u=c.result;u&&u.worldHash!==e.worldHash&&l.put(u,`backup/${typeof u.worldHash=="string"&&u.worldHash?u.worldHash:"unknown"}`),l.put(e,"active")}catch(u){o(u)}},t&&a.objectStore("worlds").put(t,e.worldHash)}catch(l){o(l)}})}async getWorld(e){const t=await this.open();return new Promise((n,s)=>{const r=t.transaction("worlds","readonly").objectStore("worlds").get(e);r.onsuccess=()=>n(r.result),r.onerror=()=>s(r.error)})}async getBackups(){const e=await this.open();return new Promise((t,n)=>{const s=[],r=e.transaction("journeys","readonly").objectStore("journeys").openCursor();r.onsuccess=()=>{const a=r.result;if(!a){t(s);return}typeof a.key=="string"&&a.key.startsWith("backup/")&&s.push({key:a.key,snapshot:a.value}),a.continue()},r.onerror=()=>n(r.error)})}async get(){const e=await this.open(),t=await new Promise((r,a)=>{const o=e.transaction("journeys","readonly").objectStore("journeys").get("active");o.onsuccess=()=>r(o.result),o.onerror=()=>a(o.error)});if(t)return t;const n=localStorage.getItem(this.legacyKey);if(!n)return;const s=JSON.parse(n);return await this.put(s),localStorage.removeItem(this.legacyKey),s}}const I_=yc.access;new Set(I_.flatMap(i=>[i.deck,...i.stairs]));const U_=["rotunda","selfridges","turntable","exchange-signal","gwr-signal-box","gwr-frontage","snow-hill","tyseley-depot","tyseley-works","carriage-works"],F_=[{id:"regional/buffer-stop",generator:"furniture",kind:"buffer"},...["rail-bed","sleepers","rails","road-surface"].map(i=>({id:`existing/${i}`,generator:"world-mesh",kind:i})),...U_.map(i=>({id:`landmark/${i}`,generator:"landmark",family:i}))];Object.freeze(Object.fromEntries(F_.map(i=>[i.id,Object.freeze(i)])));new Ve(8294246),new Ve(9207909),new Ve(9144444),new Ve(10660517),new Ve(6511181),new Ve(6843496),new Ve(11908005),new Ve(14539984),new Ve(10316629),new Ve(7828331),new Ve(7179925);new kn(1,1,1);function O_(i,e,t,n){const s=n[0]-t[0],r=n[2]-t[2],a=it(((i-t[0])*s+(e-t[2])*r)/(s*s+r*r||1),0,1);return{distance:Math.hypot(i-t[0]-a*s,e-t[2]-a*r),t:a}}const gc=new WeakMap;function B_(i){const e=gc.get(i);if(e)return e;const t=[],n=new Map,s=a=>`${a[0].toFixed(2)},${a[2].toFixed(2)}`;for(const a of i.data.tracks)for(let o=1;o<(a.points?.length||0);o++){const l={a:a.points[o-1],b:a.points[o],id:a.id,index:o};t.push(l);for(const c of[l.a,l.b]){const u=s(c),p=n.get(u)||[];p.push(l),n.set(u,p)}}const r=[];for(const a of[!1,!0])for(const o of[0,4.2]){const l=a?1:-1,c=i.lanePose(a?i.length:0,o),u=c.tangent.map(C=>C*l);let p;for(const C of t){const R=O_(c.position[0],c.position[2],C.a,C.b);if(R.distance>4.5)continue;const P=C.b[0]-C.a[0],F=C.b[2]-C.a[2],z=Math.hypot(P,F),L=(P*u[0]+F*u[2])/(z||1),G=L>0?1:-1;if(Math.abs(L)<.82||(G>0?1-R.t:R.t)*z<.05)continue;const X=R.distance+(1-Math.abs(L))*2;(!p||X<p.score)&&(p={segment:C,t:R.t,direction:G,score:X})}if(!p)continue;let d=p.segment,h=p.direction;const f=d.a.map((C,R)=>C+(d.b[R]-C)*p.t),_=[f,h>0?d.b:d.a],m=new Set([d]),g=new Set([d.id]);let x=Math.hypot(_[1][0]-_[0][0],_[1][2]-_[0][2]);for(;x<180;){const C=_.at(-1),R=_.at(-2),P=C[0]-R[0],F=C[2]-R[2],z=Math.hypot(P,F)||1,L=/^way\/\d+/.exec(d.id)?.[0],G=(n.get(s(C))||[]).filter(B=>!m.has(B)).map(B=>{const ne=s(B.a)===s(C)?B.b:B.a,q=ne[0]-C[0],ee=ne[2]-C[2],se=Math.hypot(q,ee),Te=(q*P+ee*F)/(se*z||1);return{segment:B,target:ne,d:se,dot:Te,same:L!==void 0&&B.id.startsWith(`${L}/`)}}).filter(B=>B.d>.05&&B.dot>.75).sort((B,ne)=>Number(ne.same)-Number(B.same)||ne.dot-B.dot||B.segment.id.localeCompare(ne.segment.id));if(!G.length)break;const X=G[0];if(G[1]&&!X.same&&X.dot-G[1].dot<.02)break;_.push(X.target),x+=X.d,d=X.segment,m.add(d),g.add(d.id)}if(x<20)continue;const S=new ht(_),M=Math.min(180,S.length),w=Math.min(25,M),T=S.sample(w),v=[],y=C=>{const R=S.sample(C).position,P=it(C/w,0,1),F=2*P*P*P-3*P*P+1,z=P*P*P-2*P*P+P,L=-2*P*P*P+3*P*P,G=P*P*P-P*P,X=C<w?F*c.position[0]+z*w*u[0]+L*T.position[0]+G*w*T.tangent[0]:R[0],B=C<w?F*c.position[2]+z*w*u[2]+L*T.position[2]+G*w*T.tangent[2]:R[2];v.push([X,c.position[1]+c.grade*l*C,B])};for(let C=0;C<M;C+=2)y(C);y(M),r.push({id:`context/${a?"DDG":"KID"}/${o}`,points:v,path:new ht(v),overhead:!1,source:"Connected mapped source rail segments; engineered endpoint grade continued",metadata:{contextOnly:!0,playable:!1,lane:o,atEnd:a,extent:M,sourceIds:[...g],sourceFitDistance:p.score,endpointRight:c.right.map(C=>C*l),endpointBank:c.bank*l}})}return gc.set(i,r),r}const Nh=Object.freeze({cellSize:16,subdivisions:1600,heightStep:1/32,version:1}),k_=i=>[i[0]/100,i[1]*Nh.heightStep,i[2]/100];function _r(i){if(Array.isArray(i))return i.map(e=>_r(e));if(i&&typeof i=="object"){if("$grid"in i){if(!Array.isArray(i.$grid)||i.$grid.length!==3||!i.$grid.every(Number.isSafeInteger))throw new Error("GRID-01: invalid anchor");return k_(i.$grid)}if("$plan"in i){if(!Array.isArray(i.$plan)||i.$plan.length!==2||!i.$plan.every(Number.isSafeInteger))throw new Error("GRID-01: invalid plan anchor");return i.$plan.map(e=>e/100)}return Object.fromEntries(Object.entries(i).map(([e,t])=>[e,_r(t)]))}return i}async function _c(i){return Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256",i)),e=>e.toString(16).padStart(2,"0")).join("")}async function vc(i,e,t){const n=Number(i.headers.get("content-length")),s=i.headers.get("content-encoding"),r=Number.isFinite(n)&&n>0&&(!s||s==="identity")?n:void 0;if(!i.body||!t){const p=await i.arrayBuffer();return t?.({stage:e,loaded:p.byteLength,total:r}),p}const a=i.body.getReader(),o=[];let l=0;for(t({stage:e,loaded:l,total:r});;){const p=await a.read();if(p.done)break;o.push(p.value),l+=p.value.byteLength,t({stage:e,loaded:l,total:r})}const c=new Uint8Array(l);let u=0;for(const p of o)c.set(p,u),u+=p.byteLength;return c.buffer}class vr{document;terrain;baseURI;route;tiles=new Map;pending=new Map;constructor(e,t,n,s){if(this.document=e,this.terrain=t,this.baseURI=n,e.schema!==1||JSON.stringify(e.grid)!==JSON.stringify(Nh))throw new Error("Unsupported grid world format.");if(this.route=_r(e.route),this.route.gridRevision=e.revision,s)for(const[r,a]of Object.entries(s.tiles))this.tiles.set(r,a)}static async load(e,t,n){if(t)return n?.({stage:"saved",loaded:1,total:1}),new vr(t.document,t.terrain,e,t);const s=await fetch(os("data/grid/world.json",e));if(!s.ok)throw new Error("The railway grid world could not be loaded.");const r=JSON.parse(new TextDecoder().decode(await vc(s,"world",n))),a=await fetch(os(r.route.terrain.url,e));if(!a.ok)throw new Error("The world height grid could not be loaded.");const o=await vc(a,"terrain",n);if(await _c(o)!==r.terrainSHA256)throw new Error("The world height grid belongs to another revision.");return new vr(r,o,e)}async encodedTile(e){if(this.tiles.has(e))return this.tiles.get(e);const t=this.pending.get(e);if(t)return t;const n=(async()=>{const s=this.document.tiles.find(l=>l.id===e);if(!s)throw new Error(`Unknown world tile ${e}`);const r=await fetch(os(s.url,this.baseURI),{signal:AbortSignal.timeout(3e4)});if(!r.ok)throw new Error(`World tile ${e}: HTTP ${r.status}`);const a=await r.arrayBuffer();if(await _c(a)!==s.sha256)throw new Error(`World tile ${e} belongs to another revision`);const o=new TextDecoder().decode(a);if(JSON.parse(o).id!==e)throw new Error(`World tile ${e} has an invalid owner`);return this.tiles.set(e,o),o})();this.pending.set(e,n);try{return await n}finally{this.pending.delete(e)}}async tile(e){const t=await this.encodedTile(e);return _r(typeof t=="string"?JSON.parse(t):t)}async snapshot(){const e=[...this.document.tiles];return await Promise.all(Array.from({length:4},async()=>{for(;e.length;)await this.encodedTile(e.pop().id)})),{document:this.document,tiles:Object.fromEntries(this.tiles),terrain:this.terrain}}}const z_='<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M4 12 12 4M5 4h7v7" stroke="currentColor" stroke-width="1.3"/></svg>',G_='<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M9 7v10M15 7v10" stroke="currentColor" stroke-width="2"/></svg>',js='<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 12h15m-6-6 6 6-6 6" stroke="currentColor" stroke-width="1.5"/></svg>',H_=document.querySelector("#app");H_.innerHTML=`<main class="simulator">
  <div id="viewport" role="img" aria-label="Front view of the Kidderminster to Dorridge railway"></div>
  <div class="vignette" aria-hidden="true"></div>
  <section id="loading" class="loading-screen" role="status" aria-live="polite"><div class="loading-card"><span class="eyebrow">RAILWAY DEMO</span><h1>Preparing your railway</h1><p id="loading-stage">Loading world…</p><progress id="loading-progress" max="100" aria-label="Loading progress"></progress><span id="loading-value"></span></div></section>
  <div class="drive-actions"><span class="clock" id="clock">08:12:00</span><button id="pause" class="icon-button" aria-label="Pause journey">${G_}</button></div>
  <section id="menu" class="menu" aria-label="Journey setup"><div class="menu-panel">
    <h1>Railway demo</h1>
    <p class="intro">Choose a direction and departure station.</p>
    <div class="form-row"><label>Direction<select id="direction"><option value="1">Kidderminster → Dorridge</option><option value="-1">Dorridge → Kidderminster</option></select></label></div>
    <div class="form-row"><label>Depart from<select id="start-station" aria-label="Departure station"><option>Loading stations…</option></select></label></div>
    <button id="begin" class="primary" disabled><span id="begin-label">Loading…</span>${js}</button>
    <button id="resume-save" class="secondary" hidden>Continue saved journey ${js}</button>
    <div class="menu-bottom"><span class="gpu-badge" id="gpu-state"><i></i> LOADING</span><button id="settings-open" class="text-button">Settings</button></div>
  </div></section>
  <section id="hud" class="hud" hidden aria-label="Driving instruments">
    <div class="notice" id="notice" role="status">Hold A to release the brake.</div>
    <div class="dashboard"><div class="instrument speed"><span class="instrument-label">SPEED</span><div><strong id="speed">0</strong><span>mph</span></div><small>LIMIT <b id="limit">65</b></small></div>
    <div class="instrument next-stop"><span class="instrument-label">NEXT STATION</span><strong id="next-stop">Blakedown</strong><div><span id="distance">5.1 km</span><span id="doors">Doors secured</span></div><div class="distance-line"><i id="stop-progress"></i></div></div>
    <div class="instrument controller"><span class="instrument-label">POWER / BRAKE</span><strong id="controller-state">Full service brake</strong><div class="control-track"><span class="brake-zone"></span><i id="controller-pointer"></i></div><small><span>BRAKE</span><span id="reverser">FORWARD</span><span>POWER</span></small></div>
    <button class="instrument aws" id="aws" aria-label="AWS acknowledge"><span class="instrument-label">AWS</span><span class="aws-lamp" id="aws-lamp"><i></i></span><span id="aws-state">Clear</span><kbd>Q</kbd></button></div>
    <div class="controls-strip"><span><kbd>A</kbd> Power / release</span><span><kbd>D</kbd> Brake</span><span><kbd>Q</kbd> Acknowledge</span><span><kbd>SPACE</kbd> Horn</span><span><kbd>W</kbd><kbd>S</kbd> Direction</span><button id="stops-open" class="text-button">Route & stops ${z_}</button><button id="save" class="text-button">Save</button></div>
    <button id="tpws-reset" class="tpws-reset" hidden>TPWS brake demand · stop, then reset</button>
    <div class="touch-controls"><button data-drive="d" aria-label="Apply brakes">D · Brake</button><button data-drive="a" aria-label="Release brake and add power">A · Power</button><button data-drive="horn" aria-label="Horn">Horn</button></div>
  </section>
  <section id="pause-panel" class="dialog" hidden><div class="dialog-card"><h2>Paused</h2><p id="pause-detail">Your train and traffic are paused.</p><button id="continue" class="primary">Continue ${js}</button><button id="save-paused" class="secondary">Save journey</button><button id="settings-paused" class="secondary">Settings</button><button id="new-journey" class="text-button">Choose a new journey</button></div></section>
  <section id="settings" class="dialog" hidden><div class="dialog-card"><button class="dialog-close" data-close="settings" aria-label="Close settings">×</button><h2>Settings</h2><label for="render-scale">Render resolution <output id="render-scale-value" for="render-scale">50%</output></label><input id="render-scale" type="range" min="25" max="100" step="5" value="50" aria-describedby="resolution-note" /><p id="resolution-note" class="resolution-note">Lower resolution can improve performance. The controls stay sharp.</p><label>Scenery quality<select id="quality"><option value="low">Light — fewer distant tiles, no shadows</option><option value="balanced" selected>Balanced</option><option value="high">Detailed — more distant scenery</option></select></label><label>Sound level<input id="volume" type="range" min="0" max="1" step=".01" value=".35" /></label><p class="setting-note">A / D: power and brake · Q: AWS · Space: horn · W / S: direction · T: unassigned</p></div></section>
  <section id="stops" class="stops-panel" hidden><button class="dialog-close" data-close="stops" aria-label="Close route">×</button><span class="eyebrow">YOUR JOURNEY</span><h2>The line ahead.</h2><div id="stop-list"></div><small>Representative all-stations service</small></section>
  <section id="error" class="dialog" hidden><div class="dialog-card"><h2 id="error-title">Unable to start</h2><p id="error-text"></p><button id="reload" class="primary">Reload ${js}</button></div></section>
  <footer class="credit">© OpenStreetMap contributors · Environment Agency ground data</footer>
</main>`;const we=i=>document.getElementById(i),jt={a:!1,d:!1,horn:!1},ki=new D_;let Ne,$t,Kt,zn=!1,xr=!1,es=0,ao=performance.now(),xc=0,Mc=0,Ih=0;const Mr=new N_;let da=!1,ts,oo=!1,Zi;const Uh="railway-demo-preferences-v1";function V_(){try{const i=JSON.parse(localStorage.getItem(Uh)||"null"),e=Number(i?.renderScale);Number.isFinite(e)&&e>=.25&&e<=1&&(we("render-scale").value=String(Math.round(e*20)*5)),["low","balanced","high"].includes(i?.quality)&&(we("quality").value=i.quality),typeof i?.volume=="number"&&Number.isFinite(i.volume)&&(we("volume").value=String(it(i.volume,0,1)))}catch{}we("render-scale-value").textContent=`${we("render-scale").value}%`,ki.setVolume(Number(we("volume").value))}function Io(){try{localStorage.setItem(Uh,JSON.stringify({renderScale:String(Number(we("render-scale").value)/100),quality:we("quality").value,volume:Number(we("volume").value)}))}catch{}}V_();function Rt(i,e){we(i).hidden=!e}function xs(i,e){Rt("loading",!0),we("loading-stage").textContent=i;const t=we("loading-progress");if(e===void 0||!Number.isFinite(e))t.removeAttribute("value"),we("loading-value").textContent="";else{const n=Math.round(it(e,0,1)*100);t.value=n,we("loading-value").textContent=`${n}%`}}function Uo(i,e,t=0){xs(`Preparing scenery ${i} of ${e}`,e?t+(1-t)*i/e:void 0)}function Ms(i,e=!1){we("notice").textContent=i,we("notice").classList.toggle("important",e),Ih=performance.now()+(e?1e4:6500)}function Fh(){jt.a=!1,jt.d=!1,jt.horn=!1}function Tr(){!zn||!Ne||(Ne.paused=!0,Fh(),Rt("pause-panel",!0),ki.update(Ne,!1),bs(!1))}function Fo(){!xr||!Ne||(Ne.paused=!1,Rt("pause-panel",!1),ki.init(),ao=performance.now(),es=0)}async function bs(i=!0){if(!Ne||!zn)return!1;if(Zi)return Zi;Zi=(async()=>{try{const e=Ne.snapshot(),t=oo?void 0:await ts.snapshot();return await Mr.put(e,t),oo=!0,da=!1,i&&Ms(`Journey and world saved at ${Ne.clockText()}.`),!0}catch{return(i||!da)&&Ms("This browser could not store the journey and world."),da=!0,!1}})();try{return await Zi}finally{Zi=void 0}}function ls(i){we("error").hidden&&(console.error(i),Rt("loading",!1),Ne&&(Ne.paused=!0),we("error-text").textContent=i.message,Rt("error",!0),Fh(),zn&&bs(!1).then(e=>{we("error-text").textContent=i.message+(e?" Your paused journey was saved. Reload, then choose Continue saved journey.":" Saving failed. Reloading may lose unsaved progress.")}))}function Oh(i){const e=we("start-station"),t=i===1?Kt.stations:[...Kt.stations].reverse();e.innerHTML=t.map(n=>{const s=n.id===(i===1?Kt.stations.at(-1).id:Kt.stations[0].id);return`<option value="${n.id}" ${s?"disabled":""}>${n.name}${s?" · end of route":""}</option>`}).join("")}function Oo(){const i=we("stop-list");i.innerHTML=(Ne.player.direction===1?Kt.stations:[...Kt.stations].reverse()).map(e=>`<div class="stop-item ${Ne.calls.includes(e.id)?"visited":""} ${Ne.targetStation()?.id===e.id?"next":""}"><i></i><span>${e.name}</span><small>${Ne.calls.includes(e.id)?"✓":e.id}</small></div>`).join("")}async function W_(){if(!xr)return;const i=Number(we("direction").value),e=Kt.stations.findIndex(t=>t.id===we("start-station").value);if(e<0||e+i<0||e+i>=Kt.stations.length){we("begin-label").textContent="Choose a departure with a station ahead";return}Ne.start(i,e),$t.resetTraffic(),we("begin").disabled=!0,xs("Preparing departure…");try{await $t.preparePosition(Uo),zn=!0,Rt("menu",!1),Rt("hud",!0),Rt("loading",!1),Fo(),Oo(),Ms("Hold A to release the service brake, then add power.")}catch(t){ls(t)}finally{we("begin").disabled=!1,we("begin-label").textContent="Begin journey"}}function X_(i){if(!Ne||(we("clock").textContent=Ne.clockText(),!zn))return;we("speed").textContent=Math.round(Ne.speedMph).toString(),we("limit").textContent=String(Kt.limit(Ne.player.s)),we("speed").classList.toggle("overspeed",Ne.speedMph>Kt.limit(Ne.player.s)+2);const e=Ne.targetStation(),t=Math.max(0,Ne.distanceToStop());we("next-stop").textContent=e?.name||(Ne.player.arrived?"Journey complete":"End of line"),we("distance").textContent=t>=1e3?`${(t/1e3).toFixed(1)} km`:`${Math.round(t)} m`,we("doors").textContent=Ne.player.doors?`Doors open · ${Math.ceil(Ne.player.dwell)}s`:"Doors secured",we("doors").classList.toggle("open",Ne.player.doors);const n=Ne.player.controller;we("controller-state").textContent=Ne.aws.brake||Ne.tpws.active||Ne.player.authorityBrake?"Safety brake demand":n<-.02?`${Math.round(-n*100)}% service brake`:n>.02?`${Math.round(n*100)}% power`:"Coasting",we("controller-pointer").style.left=`${(n+1)*50}%`,we("reverser").textContent=Ne.player.reverseAuthority?"REVERSAL · 10 MPH":Ne.player.direction===1?"FORWARD":"REVERSE",we("aws-lamp").classList.toggle("warning",Ne.aws.indicator),we("aws").classList.toggle("pending",Ne.aws.pending),we("aws-state").textContent=Ne.aws.pending?"Acknowledge":Ne.aws.brake?"Brake demand":Ne.aws.indicator?"Acknowledged":"Clear",Rt("tpws-reset",Ne.tpws.active),we("tpws-reset").textContent=Ne.tpws.active?`${Ne.tpws.reason} · Reset when stopped`:"",we("stop-progress").style.width=`${it(1-t/5e3,0,1)*100}%`,i>Ih&&!Ne.aws.pending&&!Ne.tpws.active?we("notice").classList.add("quiet"):we("notice").classList.remove("quiet")}we("begin").addEventListener("click",W_);we("pause").addEventListener("click",Tr);we("continue").addEventListener("click",Fo);we("aws").addEventListener("click",()=>Ne?.acknowledge());we("tpws-reset").addEventListener("click",()=>Ne?.resetTPWS());we("save").addEventListener("click",()=>bs());we("save-paused").addEventListener("click",()=>bs());we("reload").addEventListener("click",()=>location.reload());we("new-journey").addEventListener("click",()=>{Ne.paused=!0,zn=!1,Rt("pause-panel",!1),Rt("hud",!1),Rt("menu",!0)});we("settings-open").addEventListener("click",()=>Rt("settings",!0));we("settings-paused").addEventListener("click",()=>Rt("settings",!0));we("stops-open").addEventListener("click",()=>{Oo(),Rt("stops",!0)});document.querySelectorAll("[data-close]").forEach(i=>i.addEventListener("click",()=>Rt(i.dataset.close,!1)));we("direction").addEventListener("change",()=>Oh(Number(we("direction").value)));we("quality").addEventListener("change",()=>{$t?.setQuality(we("quality").value),Io()});we("render-scale").addEventListener("input",()=>{const i=Number(we("render-scale").value);we("render-scale-value").textContent=`${i}%`,$t?.setRenderScale(i/100),Io()});we("volume").addEventListener("input",()=>{ki.setVolume(Number(we("volume").value)),Io()});we("resume-save").addEventListener("click",async()=>{try{xs("Restoring journey…");const i=await Mr.get();if(!i)throw new Error("No saved journey was found.");Ne.restore(i),$t.resetTraffic(),await $t.preparePosition(Uo),zn=!0,Rt("menu",!1),Rt("hud",!0),Rt("loading",!1),Oo(),Fo(),Ms("Saved journey restored.")}catch(i){ls(i)}});document.querySelectorAll("[data-drive]").forEach(i=>{const e=i.dataset.drive;i.addEventListener("pointerdown",t=>{jt[e]=!0,i.setPointerCapture(t.pointerId)}),i.addEventListener("pointerup",()=>jt[e]=!1),i.addEventListener("pointercancel",()=>jt[e]=!1)});window.addEventListener("keydown",i=>{if(!zn||Ne.paused||["SELECT","INPUT","TEXTAREA"].includes(i.target?.tagName))return;const e=i.code;["KeyA","KeyD","KeyQ","KeyW","KeyS","Space"].includes(e)&&i.preventDefault(),e==="KeyA"&&(jt.a=!0),e==="KeyD"&&(jt.d=!0),e==="Space"&&(jt.horn=!0),i.repeat||(e==="KeyQ"&&Ne.acknowledge(),e==="KeyW"&&Ne.setDirection(1),e==="KeyS"&&Ne.setDirection(-1),e==="Escape"&&Tr())});window.addEventListener("keyup",i=>{i.code==="KeyA"&&(jt.a=!1),i.code==="KeyD"&&(jt.d=!1),i.code==="Space"&&(jt.horn=!1)});window.addEventListener("blur",Tr);document.addEventListener("visibilitychange",()=>{document.hidden&&Tr()});async function q_(){try{let i=function(r){try{const a=Math.min(1,(r-ao)/1e3);if(ao=r,es+=a,Ne.paused)es=0;else for(;es>=.016666666666666666;)Ne.update(.016666666666666666,jt),es-=.016666666666666666;ki.update(Ne,jt.horn),$t.draw(a),r-xc>100&&(X_(r),xc=r),zn&&!Ne.paused&&r-Mc>1e4&&(bs(!1),Mc=r),s=requestAnimationFrame(i)}catch(a){ls(a)}};const e=await Mr.getWorld("75d16f9946ad6043c5ec6828e460c6db9f589513f7da46f6ad9d4396806fcc30").catch(()=>{});oo=!!e,ts=await vr.load(document.baseURI,e,r=>{const a=r.stage==="world"?0:r.stage==="terrain"?.48:.7,o=r.stage==="world"?.48:r.stage==="terrain"?.22:0;xs(r.stage==="world"?"Loading world…":r.stage==="terrain"?"Loading terrain…":"Restoring saved world…",r.total?a+o*r.loaded/r.total:void 0)});const t=ts.route;t.worldHash="75d16f9946ad6043c5ec6828e460c6db9f589513f7da46f6ad9d4396806fcc30",Kt=new Wh(t),Kt.setEndpointContext(B_(Kt)),Ne=new g_(Kt),Ne.sound=r=>ki.event(r),Ne.onEvent=r=>{(r.type==="aws"||r.type==="tpws"||r.type==="station"||r.type==="direction"||r.type==="complete")&&Ms(r.message,r.type==="tpws"||r.type==="aws")},Oh(1);const n=ts.terrain;xs("Preparing the road network…",.7),await new Promise(r=>requestAnimationFrame(()=>r())),Ne.configureRoadNetwork(t.surfaceRoads,new $h(t.terrain,new Uint16Array(n))),$t=new T_(we("viewport"),t,Kt,Ne),$t.tileSource=r=>ts.tile(r),$t.setRenderScale(Number(we("render-scale").value)/100),$t.setQuality(we("quality").value),$t.onError=ls,$t.onProgress=()=>{if(!xr){const r=$t.preparationProgress();Uo(r.loaded,r.total,.7),r.total>0&&r.loaded===r.total&&(xr=!0,Rt("loading",!1),we("begin").disabled=!1,we("begin-label").textContent="Begin journey",we("gpu-state").innerHTML="<i></i> WEBGL 2 READY",Mr.get().then(a=>Rt("resume-save",!!a)).catch(()=>Rt("resume-save",!1)))}},await $t.init(n);let s=0;s=requestAnimationFrame(i)}catch(i){ls(i)}}q_();
