import * as THREE from 'three';
import type {Feature,V3} from '../core/types';
import {RouteGeometry,Polyline,CurvePath,clamp} from '../core/geometry';

export type P2=[number,number];
export interface PlatformBoundary {a:P2;b:P2;railEdge:boolean;inward:P2;}
export interface MappedPlatform {
  id:string;station?:string;rawStation?:string;footprint:P2[];triangles:P2[][];
  boundaries:PlatformBoundary[];centre:P2;axis:P2;bounds:number[];railSource:string;
  clearanceAdjustmentArea:number;
  top:(x:number,z:number)=>number;
}
const cache=new WeakMap<RouteGeometry,MappedPlatform[]>();
const cross=(a:P2,b:P2,c:P2)=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);
const area=(p:P2[])=>p.reduce((v,a,i)=>{const b=p[(i+1)%p.length];return v+a[0]*b[1]-b[0]*a[1];},0)/2;
const bounds=(p:P2[])=>[Math.min(...p.map(v=>v[0])),Math.min(...p.map(v=>v[1])),Math.max(...p.map(v=>v[0])),Math.max(...p.map(v=>v[1]))];
const overlap=(a:number[],b:number[])=>a[0]<b[2]-1e-7&&a[2]>b[0]+1e-7&&a[1]<b[3]-1e-7&&a[3]>b[1]+1e-7;
export function insidePlatform(x:number,z:number,fp:P2[]){
  let yes=false;for(let i=0,j=fp.length-1;i<fp.length;j=i++){const a=fp[i],b=fp[j];if(((a[1]>z)!==(b[1]>z))&&x<(b[0]-a[0])*(z-a[1])/(b[1]-a[1])+a[0])yes=!yes;}return yes;
}
export function platformEdgeDistance(x:number,z:number,fp:P2[]){let best=Infinity;for(let i=0;i<fp.length;i++){const a=fp[i],b=fp[(i+1)%fp.length],dx=b[0]-a[0],dz=b[1]-a[1],t=clamp(((x-a[0])*dx+(z-a[1])*dz)/(dx*dx+dz*dz||1),0,1);best=Math.min(best,Math.hypot(x-a[0]-dx*t,z-a[1]-dz*t));}return best;}
function halfPlane(subject:P2[],a:P2,b:P2,inside:boolean):P2[]{
  const result:P2[]=[];for(let i=0;i<subject.length;i++){
    const p=subject[i],q=subject[(i+1)%subject.length],dp=cross(a,b,p),dq=cross(a,b,q),pin=inside?dp>=-1e-8:dp<=1e-8,qin=inside?dq>=-1e-8:dq<=1e-8;
    if(pin)result.push(p);if(pin!==qin){const t=dp/(dp-dq);result.push([p[0]+(q[0]-p[0])*t,p[1]+(q[1]-p[1])*t]);}
  }
  return result.filter((p,i)=>i===0||Math.hypot(p[0]-result[i-1][0],p[1]-result[i-1][1])>1e-6);
}
/** Remove a convex triangle from another convex piece, preserving its outside. */
function subtract(subject:P2[],clip:P2[]):P2[][]{
  if(!overlap(bounds(subject),bounds(clip)))return[subject];
  const c=area(clip)>0?clip:[...clip].reverse();
  if(c.some((a,i)=>subject.every(p=>cross(a,c[(i+1)%c.length],p)<=1e-8)))return[subject];
  const out:P2[][]=[];let remaining=subject;
  for(let i=0;i<c.length&&remaining.length>=3;i++){
    const a=c[i],b=c[(i+1)%c.length],outside=halfPlane(remaining,a,b,false);
    if(outside.length>=3&&Math.abs(area(outside))>1e-5)out.push(outside);
    remaining=halfPlane(remaining,a,b,true);
  }
  return out;
}
function triangulate(fp:P2[]):P2[][]{
  const cleaned=fp.filter((p,i)=>i===0||Math.hypot(p[0]-fp[i-1][0],p[1]-fp[i-1][1])>1e-5);
  return THREE.ShapeUtils.triangulateShape(cleaned.map(p=>new THREE.Vector2(...p)),[]).map(ids=>ids.map(i=>cleaned[i]));
}
export function platformContains(platform:MappedPlatform,x:number,z:number){
  const p:P2=[x,z];return platform.triangles.some(t=>{const c=[cross(t[0],t[1],p),cross(t[1],t[2],p),cross(t[2],t[0],p)];return c.every(v=>v>=-1e-7)||c.every(v=>v<=1e-7);});
}
export function derivedPlatformEdgeDistance(platform:MappedPlatform,x:number,z:number){return Math.min(...platform.boundaries.map(e=>platformEdgeDistance(x,z,[e.a,e.b])));}
function axisOf(fp:P2[],centre:P2):P2{
  let xx=0,xz=0,zz=0;for(const p of fp){const x=p[0]-centre[0],z=p[1]-centre[1];xx+=x*x;xz+=x*z;zz+=z*z;}
  const a=Math.atan2(2*xz,xx-zz)/2;return[Math.cos(a),Math.sin(a)];
}
function intersections(a:P2,b:P2,c:P2,d:P2):number[]{
  const ux=b[0]-a[0],uz=b[1]-a[1],vx=d[0]-c[0],vz=d[1]-c[1],den=ux*vz-uz*vx;
  if(Math.abs(den)<1e-8){
    if(Math.abs(cross(a,b,c))>.005)return[];
    const len=ux*ux+uz*uz;return[c,d].map(p=>((p[0]-a[0])*ux+(p[1]-a[1])*uz)/(len||1)).filter(t=>t>1e-6&&t<1-1e-6);
  }
  const t=((c[0]-a[0])*vz-(c[1]-a[1])*vx)/den,u=((c[0]-a[0])*uz-(c[1]-a[1])*ux)/den;
  return t>1e-6&&t<1-1e-6&&u>=-1e-6&&u<=1+1e-6?[t]:[];
}

/** Source plan outlines are immutable. Their rendered heights are rail-relative. */
export function mappedPlatforms(route:RouteGeometry):MappedPlatform[]{
  const cached=cache.get(route);if(cached)return cached;
  const services=(((route.data.adjacentServices as any[])||[]).filter(s=>s.points?.length>1)).map(s=>({id:s.id as string,path:new CurvePath(s.points as V3[]),kind:s.kind as string}));
  const raw=((route.data.platforms as Feature[])||[]).filter(p=>p.footprint&&p.footprint.length>=3);
  const platforms:MappedPlatform[]=[];
  for(const feature of raw){
    const fp=feature.footprint!.map(p=>[p[0],p[1]] as P2),centre:P2=[fp.reduce((s,p)=>s+p[0],0)/fp.length,fp.reduce((s,p)=>s+p[1],0)/fp.length],axis=axisOf(fp,centre),bb=bounds(fp);
    const near=route.project(...centre,300),station=[...route.stations,...((route.data.extraStations as RouteGeometry['stations'])||[])].find(s=>s.id===feature.station),member=station&&Math.hypot(station.position[0]-centre[0],station.position[2]-centre[1])<Math.max(250,station.length*1.4)?station.id:undefined;
    let source='mainline rail-relative',binding:Polyline|undefined,score=Infinity;
    if(Number.isFinite(near.distance)){
      const q=route.sample(near.s),align=Math.abs(axis[0]*q.tangent[0]+axis[1]*q.tangent[2]);
      if(align>.55&&near.distance<(member?65:26))score=near.distance/(align+.15);
    }
    for(const service of services){
      const n=service.path.nearest(...centre);if(n.distance>30)continue;const q=service.path.sample(n.s),align=Math.abs(axis[0]*q.tangent[0]+axis[1]*q.tangent[2]),s=n.distance/(align+.15);
      if(align>.6&&s<score){score=s;binding=service.path;source=`adjacent:${service.id}`;}
    }
    if(!Number.isFinite(score)){
      for(const track of route.data.tracks){
        if(!track.points||track.points.length<2)continue;
        if(!track.points.some(p=>p[0]>=bb[0]-25&&p[0]<=bb[2]+25&&p[2]>=bb[1]-25&&p[2]<=bb[3]+25))continue;
        const path=new Polyline(track.points),n=path.nearest(...centre),q=path.sample(n.s),align=Math.abs(axis[0]*q.tangent[0]+axis[1]*q.tangent[2]),s=n.distance/(align+.15)+5;
        if(align>.6&&s<score){score=s;binding=path;source=`mapped-track:${track.id}`;}
      }
    }
    const top=(x:number,z:number)=>{
      if(binding){const n=binding.nearest(x,z);return binding.sample(n.s).position[1]+Number(feature.platformHeight??.915);}
      const n=route.project(x,z,350);if(Number.isFinite(n.distance))return route.sample(n.s).position[1]+Number(feature.platformHeight??.915);
      return Number(feature.y)||Number(feature.height)||100;
    };
    if(feature.binding){binding=feature.binding==='mainline'?undefined:services.find(s=>s.id===feature.binding)?.path;source=feature.binding==='mainline'?'mainline rail-relative':`adjacent:${feature.binding}`;if(feature.binding!=='mainline'&&!binding)throw new Error(`${feature.id}: missing explicit platform track ${feature.binding}`);}
    platforms.push({id:feature.id,station:member,rawStation:String(feature.station??''),footprint:fp,triangles:triangulate(fp),boundaries:[],centre,axis,bounds:bb,railSource:source,clearanceAdjustmentArea:0,top});
  }
  // Explicit engineered coping corrections only: the raw OSM polygons remain
  // untouched. Trim derived surfaces to the two ACTUAL running lane envelopes.
  for(const platform of platforms){
    const projected=platform.footprint.map(p=>route.project(...p,350)).filter(p=>Number.isFinite(p.distance));if(!projected.length)continue;
    const minS=Math.max(0,Math.min(...projected.map(p=>p.s))-10),maxS=Math.min(route.length,Math.max(...projected.map(p=>p.s))+10),originalArea=platform.triangles.reduce((s,t)=>s+Math.abs(area(t)),0);
    for(let s=minS;s<maxS;s+=8)for(const lane of [0,4.2]){
      const end=Math.min(maxS,s+8),middle=route.lanePose((s+end)/2,lane);
      if(Math.abs(platform.top(middle.position[0],middle.position[2])-(middle.position[1]+.915))>1.8)continue;
      // Extra25mm absorbs chord approximation on curved source paths while the
      // acceptance envelope remains1.55m from the actual running centreline.
      const vertices=[route.railPosition(s,lane,-1.575),route.railPosition(s,lane,1.575),route.railPosition(end,lane,1.575),route.railPosition(end,lane,-1.575)],mask=vertices.map(p=>[p[0],p[2]] as P2);
      if(!overlap(platform.bounds,bounds(mask)))continue;
      platform.triangles=platform.triangles.flatMap(t=>subtract(t,mask).flatMap(part=>part.slice(1,-1).map((_,i)=>[part[0],part[i+1],part[i+2]])));
    }
    platform.clearanceAdjustmentArea=Math.max(0,originalArea-platform.triangles.reduce((s,t)=>s+Math.abs(area(t)),0));
  }
  // Remove overlapping top areas in a deterministic source order, while leaving
  // vertically separated platform levels independent (e.g. Galton Bridge).
  const occupied:{triangle:P2[];height:number;bounds:number[]}[]=[];
  for(const platform of platforms.sort((a,b)=>a.id.localeCompare(b.id))){
    const originals=platform.triangles,height=platform.top(...platform.centre),pieces:P2[][]=[];
    for(const triangle of originals){
      let remaining=[triangle];for(const other of occupied){if(Math.abs(height-other.height)>1.1||!overlap(bounds(triangle),other.bounds))continue;remaining=remaining.flatMap(p=>subtract(p,other.triangle));if(!remaining.length)break;}
      for(const part of remaining)for(let i=1;i<part.length-1;i++)pieces.push([part[0],part[i],part[i+1]]);
    }
    platform.triangles=pieces;for(const triangle of originals)occupied.push({triangle,height,bounds:bounds(triangle)});
  }
  for(const platform of platforms){
    const peers=platforms.filter(p=>p!==platform&&Math.abs(p.top(...p.centre)-platform.top(...platform.centre))<1.1&&overlap([platform.bounds[0]-.1,platform.bounds[1]-.1,platform.bounds[2]+.1,platform.bounds[3]+.1],p.bounds));
    const edges=platform.triangles.flatMap(t=>t.map((a,i)=>({a,b:t[(i+1)%3]}))),otherEdges=[platform,...peers].flatMap(p=>p.triangles.flatMap(t=>t.map((a,i)=>({a,b:t[(i+1)%3]}))));const seen=new Set<string>();
    for(const edge of edges){
      const {a,b}=edge,cuts=[0,1];
      for(const other of otherEdges)cuts.push(...intersections(a,b,other.a,other.b));
      cuts.sort((a,b)=>a-b);
      for(let k=1;k<cuts.length;k++){
        const t0=cuts[k-1],t1=cuts[k];if(t1-t0<1e-6)continue;
        const u:P2=[a[0]+(b[0]-a[0])*t0,a[1]+(b[1]-a[1])*t0],v:P2=[a[0]+(b[0]-a[0])*t1,a[1]+(b[1]-a[1])*t1];
        const cx=(u[0]+v[0])/2,cz=(u[1]+v[1])/2,dx=v[0]-u[0],dz=v[1]-u[1],len=Math.hypot(dx,dz);if(len<.05)continue;
        const nx=-dz/len*.05,nz=dx/len*.05;
        const onPlus=[platform,...peers].some(p=>platformContains(p,cx+nx,cz+nz)),onMinus=[platform,...peers].some(p=>platformContains(p,cx-nx,cz-nz));
        if(onPlus===onMinus)continue;
        const key=[u,v].map(p=>`${p[0].toFixed(4)},${p[1].toFixed(4)}`).sort().join('/');if(seen.has(key))continue;seen.add(key);
        const near=route.project(cx,cz,100),q=route.sample(near.s),align=Math.abs((dx*q.tangent[0]+dz*q.tangent[2])/len);
        let railEdge=near.distance<18&&align>.6;
        if(!railEdge)for(const service of services){const n=service.path.nearest(cx,cz);if(n.distance<3.8){const p=service.path.sample(n.s);if(Math.abs((dx*p.tangent[0]+dz*p.tangent[2])/len)>.6){railEdge=true;break;}}}
        platform.boundaries.push({a:u,b:v,railEdge,inward:onPlus?[-dz/len,dx/len]:[dz/len,-dx/len]});
      }
    }
  }
  cache.set(route,platforms);return platforms;
}

export function refinePlatformTriangle(triangle:P2[],emit:(a:P2,b:P2,c:P2)=>void,maxEdge=8,depth=0){
  const lens=triangle.map((p,i)=>Math.hypot(p[0]-triangle[(i+1)%3][0],p[1]-triangle[(i+1)%3][1]));
  const edge=lens.indexOf(Math.max(...lens));if(lens[edge]<=maxEdge||depth>12){emit(triangle[0],triangle[1],triangle[2]);return;}
  const a=triangle[edge],b=triangle[(edge+1)%3],c=triangle[(edge+2)%3],mid:P2=[(a[0]+b[0])/2,(a[1]+b[1])/2];
  refinePlatformTriangle([a,mid,c],emit,maxEdge,depth+1);refinePlatformTriangle([mid,b,c],emit,maxEdge,depth+1);
}

const renderedSurfaces=new WeakMap<MappedPlatform,V3[][]>();
/** Contact datum is the actual float32 refined surface, rather than a second
 * evaluation of its nonlinear rail-relative engineering profile. */
export function platformSurfaceY(platform:MappedPlatform,x:number,z:number){
  let triangles=renderedSurfaces.get(platform);
  if(!triangles){triangles=[];for(const tri of platform.triangles)refinePlatformTriangle(tri,(a,b,c)=>triangles!.push([a,b,c].map(q=>[Math.fround(q[0]),Math.fround(platform.top(...q)),Math.fround(q[1])])));renderedSurfaces.set(platform,triangles);}
  for(const[a,b,c]of triangles){
    const den=(b[2]-c[2])*(a[0]-c[0])+(c[0]-b[0])*(a[2]-c[2]);if(Math.abs(den)<1e-9)continue;
    const u=((b[2]-c[2])*(x-c[0])+(c[0]-b[0])*(z-c[2]))/den,v=((c[2]-a[2])*(x-c[0])+(a[0]-c[0])*(z-c[2]))/den,w=1-u-v;
    if(u>=-1e-6&&v>=-1e-6&&w>=-1e-6)return u*a[1]+v*b[1]+w*c[1];
  }
  return platform.top(x,z);
}

/** Find an interior, edge-cleared anchor, preserving the complete source outline. */
export function platformAnchor(platform:MappedPlatform,desired:P2,radius=.3):P2|undefined{
  const valid=(p:P2)=>platformContains(platform,...p)&&derivedPlatformEdgeDistance(platform,...p)>=radius;
  if(valid(desired))return desired;
  let best:P2|undefined,distance=Infinity;
  for(const tri of platform.triangles){
    const c:P2=[(tri[0][0]+tri[1][0]+tri[2][0])/3,(tri[0][1]+tri[1][1]+tri[2][1])/3];
    if(valid(c)){const d=Math.hypot(c[0]-desired[0],c[1]-desired[1]);if(d<distance){best=c;distance=d;}}
  }
  return best;
}
