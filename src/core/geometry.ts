import type {RouteData, Station, V3} from './types';

export const clamp = (n: number, a: number, b: number) => Math.max(a, Math.min(b, n));
export const mix = (a: number, b: number, t: number) => a + (b - a) * t;
export const smooth = (t: number) => { const x = clamp(t, 0, 1); return x*x*(3-2*x); };
export const mph = (v: number) => v * 2.2369362921;
export const mps = (v: number) => v / 2.2369362921;
export const distance2 = (a: V3, b: V3) => Math.hypot(a[0]-b[0], a[2]-b[2]);
export function hash(s: string | number) {
  let h = 2166136261; for (const c of String(s)) {h ^= c.charCodeAt(0);h=Math.imul(h,16777619);} return h>>>0;
}
export function random(seed: number) { let t=seed>>>0; return () => { t+=0x6d2b79f5; let r=Math.imul(t^(t>>>15),t|1);r^=r+Math.imul(r^(r>>>7),r|61);return ((r^(r>>>14))>>>0)/4294967296; }; }
export interface Pose {position: V3; tangent: V3; right: V3; grade: number; yaw: number; pitch: number; bank: number; s: number}
/** Unit lateral offset in the canted track section; dimensions are measured in its plane. */
export function gaugeRight(pose:Pick<Pose,'tangent'|'right'|'bank'>):V3 {
  const r=pose.right,t=pose.tangent,up:V3=[r[1]*t[2]-r[2]*t[1],r[2]*t[0]-r[0]*t[2],r[0]*t[1]-r[1]*t[0]],n=Math.hypot(...up)||1,c=Math.cos(pose.bank),s=Math.sin(pose.bank);
  return [r[0]*c+up[0]/n*s,r[1]*c+up[1]/n*s,r[2]*c+up[2]/n*s];
}
export function sectionUp(pose:Pick<Pose,'tangent'|'right'|'bank'>):V3 {const r=gaugeRight(pose),t=pose.tangent,u:V3=[r[1]*t[2]-r[2]*t[1],r[2]*t[0]-r[0]*t[2],r[0]*t[1]-r[1]*t[0]],n=Math.hypot(...u)||1;return u.map(x=>x/n) as V3;}

export class Polyline {
  readonly lengths: Float64Array; readonly length: number;private readonly frames:Float64Array;
  constructor(readonly points: V3[]) {
    if(points.length<2) throw new Error('A path needs at least two points');
    this.lengths=new Float64Array(points.length);
    for(let i=1;i<points.length;i++) this.lengths[i]=this.lengths[i-1]+Math.hypot(...points[i].map((v,j)=>v-points[i-1][j]));
    this.length=this.lengths[this.lengths.length-1];
    this.frames=new Float64Array(points.length*4);
    for(let i=0;i<points.length-1;i++){
      const a=points[i],b=points[i+1],pa=points[Math.max(0,i-1)],pb=points[Math.min(points.length-1,i+2)],dx=pb[0]-pa[0],dy=pb[1]-pa[1],dz=pb[2]-pa[2],horizontal=Math.hypot(dx,dz)||1;
      const aa=points[Math.max(0,i-3)],bb=points[Math.min(points.length-1,i+4)],ux=a[0]-aa[0],uz=a[2]-aa[2],wx=bb[0]-b[0],wz=bb[2]-b[2],den=Math.hypot(ux,uz)*Math.hypot(wx,wz);
      this.frames.set([dx/horizontal,dy/horizontal,dz/horizontal,den>1?clamp(-(ux*wz-uz*wx)/den*.12,-.075,.075):0],i*4);
    }
    this.frames.set(this.frames.subarray((points.length-2)*4,(points.length-1)*4),(points.length-1)*4);
  }
  segment(s:number) {let lo=0,hi=this.points.length-2;while(lo<hi){const mid=(lo+hi+1)>>1;if(this.lengths[mid]<=s)lo=mid;else hi=mid-1;}return lo;}
  sample(s:number,offset=0):Pose {
    const v=clamp(s,0,this.length),i=this.segment(v),a=this.points[i],b=this.points[i+1];
    const len=this.lengths[i+1]-this.lengths[i];const t=len?(v-this.lengths[i])/len:0;
    // Interpolate the same endpoint frames used by the rail and bed ribbons.
    const dx=mix(this.frames[i*4],this.frames[(i+1)*4],t),dy=mix(this.frames[i*4+1],this.frames[(i+1)*4+1],t),dz=mix(this.frames[i*4+2],this.frames[(i+1)*4+2],t),horizontal=Math.hypot(dx,dz)||1;
    const tangent:V3=[dx/horizontal,dy/horizontal,dz/horizontal],right:V3=[-tangent[2],0,tangent[0]];
    const bank=mix(this.frames[i*4+3],this.frames[(i+1)*4+3],t);
    const extra=s-v;
    return {position:[mix(a[0],b[0],t)+right[0]*offset+tangent[0]*extra,mix(a[1],b[1],t)+tangent[1]*extra,mix(a[2],b[2],t)+right[2]*offset+tangent[2]*extra],tangent,right,grade:dy/horizontal,yaw:Math.atan2(-tangent[0],-tangent[2]),pitch:Math.atan2(dy,horizontal),bank,s};
  }
  nearest(x:number,z:number,approxS?:number):{s:number;distance:number;side:number} {
    let start=0,end=this.points.length-1;
    if(approxS!==undefined){start=this.segment(Math.max(0,approxS-150));end=Math.min(end,this.segment(approxS+150)+2);}
    let distance=Infinity,s=0,side=0;
    for(let i=start;i<end;i++) {const a=this.points[i],b=this.points[i+1],dx=b[0]-a[0],dz=b[2]-a[2];const t=clamp(((x-a[0])*dx+(z-a[2])*dz)/(dx*dx+dz*dz||1),0,1);const px=a[0]+t*dx,pz=a[2]+t*dz;const d=Math.hypot(x-px,z-pz);if(d<distance){distance=d;s=mix(this.lengths[i],this.lengths[i+1],t);side=((x-px)*-dz+(z-pz)*dx)/Math.hypot(dx,dz);}}
    return {s,distance,side};
  }
}
/** Cubic Hermite pieces pass through grid anchors with shared entry/exit
 * tangents. Monotone vertical derivatives prevent humps on shallow gradients. */
export class CurvePath extends Polyline {
  private derivatives:V3[];
  constructor(points:V3[]){super(points);this.derivatives=points.map((p,i)=>{
    const a=Math.max(0,i-1),b=Math.min(points.length-1,i+1),span=this.lengths[b]-this.lengths[a]||1;
    const d=p.map((_,k)=>(points[b][k]-points[a][k])/span) as V3;
    if(i>0&&i<points.length-1){const l=(p[1]-points[i-1][1])/(this.lengths[i]-this.lengths[i-1]||1),r=(points[i+1][1]-p[1])/(this.lengths[i+1]-this.lengths[i]||1);d[1]=l*r<=0?0:2*l*r/(l+r);}
    return d;
  });}
  override sample(s:number,offset=0):Pose {
    const v=clamp(s,0,this.length),i=this.segment(v),a=this.points[i],b=this.points[i+1],span=this.lengths[i+1]-this.lengths[i]||1,t=(v-this.lengths[i])/span,t2=t*t,t3=t2*t;
    const u=this.derivatives[i],w=this.derivatives[i+1];
    const point=a.map((n,k)=>(2*t3-3*t2+1)*n+(t3-2*t2+t)*span*u[k]+(-2*t3+3*t2)*b[k]+(t3-t2)*span*w[k]) as V3;
    const d=a.map((n,k)=>((6*t2-6*t)*n+(3*t2-4*t+1)*span*u[k]+(-6*t2+6*t)*b[k]+(3*t2-2*t)*span*w[k])/span) as V3;
    const h=Math.hypot(d[0],d[2])||1,tangent=d.map(n=>n/h) as V3,right:V3=[-tangent[2],0,tangent[0]],base=super.sample(v);
    return {...base,position:point.map((n,k)=>n+right[k]*offset+tangent[k]*(s-v)) as V3,tangent,right,grade:d[1]/h,pitch:Math.atan2(d[1],h),yaw:Math.atan2(-d[0],-d[2]),s};
  }
}
export class RouteGeometry extends CurvePath {
  readonly stations: Station[];
  readonly fingerprint:string;
  readonly opposingPath?:Polyline;
  private endpointPaths=new Map<string,{path:Polyline;right?:V3;bank:number}>();
  readonly buckets=new Map<string,number[]>();
  constructor(readonly data:RouteData) {
    super(data.points);
    this.fingerprint=hash(JSON.stringify({simulation:'2026-v3',points:data.points,opposing:data.opposingOffsets||null,stations:data.stations.map(s=>[s.id,s.s]),network:data.network,crossings:data.crossings,structures:data.structures})).toString(16);
    const opposite=(data.opposingTrack as {points?:V3[]}|undefined)?.points;if(opposite?.length===data.points.length)this.opposingPath=new CurvePath(opposite);
    this.stations=data.stations.map(s=>({...s,s:Number.isFinite(s.s)?this.sourceS(s.s):this.nearest(s.position[0],s.position[2]).s,length:s.length||150,platformCount:s.platformCount||2})).sort((a,b)=>a.s-b.s);
    for(let i=0;i<this.points.length-1;i++) {const p=this.points[i],key=`${Math.floor(p[0]/100)},${Math.floor(p[2]/100)}`;const entries=this.buckets.get(key)||[];entries.push(i);this.buckets.set(key,entries);}
  }
  sourceS(s:number) {const cs=this.data.chainages as number[]|undefined;if(!cs)return s;let lo=0,hi=cs.length-2;while(lo<hi){const m=(lo+hi+1)>>1;if(cs[m]<=s)lo=m;else hi=m-1;}return mix(this.lengths[lo],this.lengths[lo+1],clamp((s-cs[lo])/(cs[lo+1]-cs[lo]||1),0,1));}
  laneOffset(s:number,lane:number) {if(lane===0)return 0;const offsets=this.data.opposingOffsets as number[]|undefined;if(!offsets||offsets.length!==this.points.length)return lane;const i=this.segment(clamp(s,0,this.length)),t=clamp((s-this.lengths[i])/(this.lengths[i+1]-this.lengths[i]||1),0,1);return mix(offsets[i],offsets[i+1],t);}
  setEndpointContext(contexts:{points:V3[];path?:Polyline;metadata?:Record<string,any>}[]) {for(const c of contexts){const m=c.metadata;if(!m?.contextOnly)continue;this.endpointPaths.set(`${m.lane}/${m.atEnd}`,{path:c.path||new Polyline(c.points),right:m.endpointRight,bank:Number(m.endpointBank)||0});}}
  laneArc(s:number,lane:number) {if(lane===0||!this.opposingPath)return s;if(s<0)return s;if(s>this.length)return this.opposingPath.length+s-this.length;const i=this.segment(s),t=(s-this.lengths[i])/(this.lengths[i+1]-this.lengths[i]||1);return mix(this.opposingPath.lengths[i],this.opposingPath.lengths[i+1],t);}
  travel(s:number,metres:number,lane:number) {if(lane===0||!this.opposingPath)return s+metres;const target=this.laneArc(s,lane)+metres;if(target<0)return target;if(target>this.opposingPath.length)return this.length+target-this.opposingPath.length;const i=this.opposingPath.segment(target);const t=(target-this.opposingPath.lengths[i])/(this.opposingPath.lengths[i+1]-this.opposingPath.lengths[i]||1);return mix(this.lengths[i],this.lengths[i+1],t);}
  laneDistance(a:number,b:number,lane:number){return this.laneArc(b,lane)-this.laneArc(a,lane);}
  lanePose(s:number,lane:number):Pose {
    if(s<0||s>this.length){const atEnd=s>this.length,context=this.endpointPaths.get(`${lane}/${atEnd}`);if(context){const distance=atEnd?s-this.length:-s,p=context.path.sample(distance),t=clamp(distance/25,0,1),sign=atEnd?1:-1;if(context.right){const rx=mix(context.right[0],p.right[0],t),rz=mix(context.right[2],p.right[2],t),len=Math.hypot(rx,rz)||1;p.right=[rx/len,0,rz/len];p.bank=mix(context.bank,p.bank,t);}p.tangent=p.tangent.map(x=>x*sign) as V3;p.right=p.right.map(x=>x*sign) as V3;p.bank*=sign;p.grade*=sign;p.yaw=Math.atan2(-p.tangent[0],-p.tangent[2]);p.pitch=Math.atan2(p.grade,1);p.s=s;return p;}}
    if(lane!==0&&this.opposingPath){const p=this.opposingPath.sample(this.laneArc(s,lane));p.s=s;return p;}return this.sample(s,lane===0?0:this.laneOffset(s,lane));
  }
  railPosition(s:number,lane:number,railOffset:number):V3 {const pose=this.lanePose(s,lane),right=gaugeRight(pose);return pose.position.map((x,i)=>x+right[i]*railOffset) as V3;}
  project(x:number,z:number,radius=150) {
    const bx=Math.floor(x/100),bz=Math.floor(z/100);let distance=Infinity,s=0,side=0;
    const n=Math.ceil(radius/100);for(let a=-n;a<=n;a++)for(let b=-n;b<=n;b++)for(const i of this.buckets.get(`${bx+a},${bz+b}`)||[]) {
      const p=this.points[i],q=this.points[i+1],dx=q[0]-p[0],dz=q[2]-p[2];const t=clamp(((x-p[0])*dx+(z-p[2])*dz)/(dx*dx+dz*dz||1),0,1);const ex=x-p[0]-dx*t,ez=z-p[2]-dz*t,d=Math.hypot(ex,ez);
      if(d<distance){distance=d;s=mix(this.lengths[i],this.lengths[i+1],t);side=(ex*-dz+ez*dx)/(Math.hypot(dx,dz)||1);}
    }
    return {s,distance,side};
  }
  limit(s:number) {
    const station=this.stations.find(x=>Math.abs(x.s-s)<400);
    if(station?.id==='BSW'||station?.id==='BMO')return 25;
    const snow=this.stations.find(x=>x.id==='BSW')?.s||this.length*.6;
    const stour=this.stations.find(x=>x.id==='SBJ')?.s||10000;
    if(Math.abs(s-snow)<1400)return 30;
    return s<stour?65:s<snow?55:70;
  }
  tunnelAt(s:number) {return ((this.data.tunnels as (import('./types').Structure & {start:number;end:number})[])||[]).find(x=>s>this.sourceS(x.start)&&s<this.sourceS(x.end));}
  bridgeAt(s:number) {return ((this.data.bridges as {id:string;start:number;end:number}[])||[]).find(x=>s>this.sourceS(x.start)&&s<this.sourceS(x.end));}
}
