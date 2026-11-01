import type {Feature,RouteData,TerrainMeta,V3} from '../core/types';
import {RouteGeometry,Polyline,clamp,mix,smooth} from '../core/geometry';
import {referenceRoadProfile} from './road-sites';

export interface RoadSurface {id:string;kind:string;width:number;points:V3[];path:Polyline;crossingS?:number;routeS?:number;mode:'ground'|'over'|'under'|'crossing';inferred:boolean;spanHalfLength?:number;sourceStructure?:string;}
export class Terrain {
  constructor(readonly meta:TerrainMeta,readonly pixels:Uint16Array) {if(pixels.length!==meta.width*meta.height)throw new Error('Heightmap dimensions do not match data.');}
  raw(x:number,z:number) {
    const {origin,step,width,height,offset,scale}=this.meta;const u=clamp((x-origin[0])/step,0,width-1.001),v=clamp((z-origin[1])/step,0,height-1.001);const i=Math.floor(u),j=Math.floor(v),a=u-i,b=v-j;
    const ids=[j*width+i,j*width+i+1,(j+1)*width+i,(j+1)*width+i+1];const values=ids.map(n=>this.pixels[n]===0?NaN:offset+(this.pixels[n]-1)*scale);
    const fallback=values.find(Number.isFinite)??100;const ys=values.map(n=>Number.isFinite(n)?n:fallback);
    return mix(mix(ys[0],ys[1],a),mix(ys[2],ys[3],a),b);
  }
}

export function engineerRoad(feature:Feature,route:RouteGeometry):RoadSurface|null {
  if(!feature.points||feature.points.length<2)return null;
  const authored=referenceRoadProfile(feature,route);if(authored)return authored;
  const points=feature.points.map(p=>[...p] as V3);const initial=new Polyline(points);const road:RoadSurface={id:feature.id,kind:String(feature.kind||'residential'),width:Number(feature.width)||5.6,points,path:initial,mode:'ground',inferred:false};
  const foot=['footway','path','steps','cycleway','pedestrian'].includes(road.kind);if(foot)road.width=Math.min(2.2,road.width);
  const relations=(feature.gradeRelations||[]) as {structure:string;relation:'on'|'under';y:number}[];
  const relation=relations.find(r=>r.relation==='on'&&route.data.structures.some(s=>s.id===r.structure&&(s.type==='footbridge'||s.type==='roadBridge')))||relations.find(r=>r.relation==='under'&&route.data.structures.some(s=>s.id===r.structure&&s.type==='railBridge'));
  if(relation){
    const structure=route.data.structures.find(s=>s.id===relation.structure)!;let nearest=0,min=Infinity;
    points.forEach((p,i)=>{const d=Math.hypot(p[0]-structure.position[0],p[2]-structure.position[2]);if(d<min){min=d;nearest=i;}});
    if(min<Math.max(30,Number(structure.length)||30)){
      road.mode=relation.relation==='on'?'over':'under';road.sourceStructure=structure.id;road.inferred=true;road.crossingS=initial.lengths[nearest];road.spanHalfLength=Math.max(4,(Number(structure.length)||25)/2+2);
      const near=route.project(structure.position[0],structure.position[2]);road.routeS=near.s;const rail=route.sample(near.s).position[1];
      let target=relation.y;if(near.distance<12)target=road.mode==='over'?Math.max(target,rail+(foot?5.8:6.3)):Math.min(target,rail-5.8);
      const radius=Math.max(road.spanHalfLength+35,Math.abs(target-points[nearest][1])*(foot?12:22));
      for(let i=0;i<points.length;i++){const d=Math.abs(initial.lengths[i]-road.crossingS),weight=1-smooth((d-road.spanHalfLength)/radius);points[i][1]=mix(points[i][1],target,weight);}
      road.path=new Polyline(points);return road;
    }
  }
  if(foot)return road;
  let best:{index:number;d:number;s:number;side:number}|null=null;
  for(let i=0;i<points.length;i++) {const p=points[i],near=route.project(p[0],p[2]);if(near.distance<7&&(!best||near.distance<best.d)){const r=route.sample(near.s),a=points[Math.max(0,i-1)],b=points[Math.min(points.length-1,i+1)],dx=b[0]-a[0],dz=b[2]-a[2];const cross=Math.abs(dx*r.tangent[2]-dz*r.tangent[0])/(Math.hypot(dx,dz)||1);if(cross>.35)best={index:i,d:near.distance,s:near.s,side:near.side};}}
  if(!best)return road;
  const near=route.sample(best.s),sourceY=points[best.index][1];let target=sourceY;const delta=sourceY-near.position[1];
  // A surface street above a confirmed railway bore remains supported by the
  // hill. Treating this plan intersection as a bridge grows piers through the
  // tunnel and into the running envelope. Explicit source civil relations were
  // handled above and retain their own support level.
  if(route.tunnelAt(best.s)&&delta>5.8)return road;
  const stationCross=route.stations.some(st=>['BKD','CRA','LGG'].includes(st.id)&&Math.abs(st.s-best!.s)<200)||Math.abs((route.stations.find(st=>st.id==='DDG')?.s??0)-900-best.s)<130;
  if(stationCross){road.mode='crossing';target=near.position[1];}else if(delta>3){road.mode='over';target=Math.max(sourceY,near.position[1]+6.3);}else {road.mode='under';target=Math.min(sourceY,near.position[1]-5.8);}
  road.inferred=true;road.routeS=best.s;road.crossingS=initial.lengths[best.index];
  const radius=road.mode==='crossing'?35:Math.max(100,Math.abs(target-sourceY)*20);
  for(let i=0;i<points.length;i++){const d=Math.abs(initial.lengths[i]-road.crossingS);const t=1-smooth((d-road.width)/(radius-road.width));points[i][1]=mix(points[i][1],target,t);}
  road.path=new Polyline(points);return road;
}


/** The same engineered road profile is used by world meshes and road traffic.
 * Source-way civil relations override the generic crossing inference. */
export function engineerSurfaceRoad(feature:Feature,route:RouteGeometry,terrain:Terrain):RoadSurface|null {
  const road=engineerRoad(feature,route);if(!road||road.sourceStructure)return road;
  const way=/way\/(\d+)/.exec(road.id)?.[1];
  const civil=route.data.structures.find(s=>way&&((s.sourceWayIds as string[]|undefined)||[]).includes(way)&&['roadBridge','footbridge'].includes(s.type));
  if(!civil)return road;
  const hit=road.path.nearest(civil.position[0],civil.position[2]);if(hit.distance>20)return road;
  const near=route.project(civil.position[0],civil.position[2],100),rail=route.sample(near.s).position[1];
  const target=Math.max(civil.position[1],near.distance<25?rail+6.3:terrain.raw(civil.position[0],civil.position[2])+2.0),radius=Math.max(65,civil.length??20);
  road.mode='over';road.crossingS=hit.s;road.routeS=near.s;road.inferred=true;
  const before=road.path;
  road.points=road.points.map((q,i)=>{const d=Math.abs(before.lengths[i]-hit.s),blend=1-clamp((d-(civil.length??20)/2)/radius,0,1);return[q[0],q[1]+Math.max(0,target-q[1])*blend,q[2]] as V3;});road.path=new Polyline(road.points);
  return road;
}

export class SurfaceField {
  readonly roadBuckets=new Map<string,{road:RoadSurface;i:number}[]>();
  constructor(readonly route:RouteGeometry,readonly terrain:Terrain,readonly roads:RoadSurface[]) {
    for(const road of roads)for(let i=0;i<road.points.length-1;i++){
      const a=road.points[i],b=road.points[i+1];const minX=Math.floor((Math.min(a[0],b[0])-road.width)/25),maxX=Math.floor((Math.max(a[0],b[0])+road.width)/25),minZ=Math.floor((Math.min(a[2],b[2])-road.width)/25),maxZ=Math.floor((Math.max(a[2],b[2])+road.width)/25);
      for(let x=minX;x<=maxX;x++)for(let z=minZ;z<=maxZ;z++){const k=`${x},${z}`,entries=this.roadBuckets.get(k)||[];entries.push({road,i});this.roadBuckets.set(k,entries);}
    }
  }
  ground(x:number,z:number) {
    let y=this.terrain.raw(x,z);const near=this.route.project(x,z,100),tunnel=this.route.tunnelAt(near.s);
    const opposite=this.route.laneOffset(near.s,4.2);const distanceFromCorridor=Math.max(Math.min(0,opposite)-near.side,near.side-Math.max(0,opposite),0);
    if(near.distance<Math.abs(opposite)+27&&!tunnel){const rail=this.route.sample(near.s).position[1];const formation=rail-.54;const weight=1-smooth((distanceFromCorridor-6)/16);y=mix(y,formation,weight);}
    for(const {road,i} of this.roadBuckets.get(`${Math.floor(x/25)},${Math.floor(z/25)}`)||[]){
      const a=road.points[i],b=road.points[i+1],dx=b[0]-a[0],dz=b[2]-a[2],t=clamp(((x-a[0])*dx+(z-a[2])*dz)/(dx*dx+dz*dz||1),0,1),d=Math.hypot(x-a[0]-t*dx,z-a[2]-t*dz);
      if(d>road.width/2+4)continue;
      const roadS=mix(road.path.lengths[i],road.path.lengths[i+1],t);
      if(road.mode==='over'&&Math.abs(roadS-(road.crossingS??-999))<(road.spanHalfLength??18))continue;
      const target=mix(a[1],b[1],t)-.2,weight=1-smooth((d-road.width/2)/4);y=mix(y,target,weight);
    }
    return y;
  }
  buildingFoundation(footprint:number[][]) {return Math.max(...footprint.map(p=>this.ground(p[0],p[1])));}
}
