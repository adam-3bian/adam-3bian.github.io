import {Polyline,clamp,hash,mix} from '../core/geometry';
import type {V3} from '../core/types';
import type {Crossing} from '../core/simulation';
export interface TrafficRoad {id:string;kind:string;width:number;points:V3[];mode?:string;crossingS?:number;routeS?:number}
const compareId=(a:string,b:string)=>a<b?-1:a>b?1:0;
const MOTOR_ROADS=new Set(['motorway','motorway_link','trunk','trunk_link','primary','primary_link','secondary','secondary_link','tertiary','tertiary_link','unclassified','residential','living_street','road']);
/** A mapped surface is not automatically a public motor-traffic road. */
export function isMotorRoad(road:TrafficRoad):boolean{return MOTOR_ROADS.has(road.kind)&&road.width>=4.5&&Array.isArray(road.points)&&road.points.length>=2;}
export interface RoadCar {id:string;road:string;s:number;direction:1|-1;speed:number;kind:string;position:V3;yaw:number;pitch?:number;bank?:number;length:number;crossingCommitted?:string;transition?:{path:Polyline;s:number;next:string;direction:1|-1;nextS:number;node:string}}
export class RoadTraffic {
  readonly roads=new Map<string,TrafficRoad & {path:Polyline}>();readonly cars=new Map<string,RoadCar>();
  private nodes=new Map<string,{id:string;end:0|1}[]>();private reservations=new Map<string,{car:string;until:number}>();
  private spawnPlan?:Set<string>;
  /** Select the same bounded regional population before any tile arrives. */
  setSpawnPlan(roads:TrafficRoad[]){const cells=new Map<string,{id:string;rank:number}[]>();for(const road of roads){if(!isMotorRoad(road)||hash(road.id)%4!==0)continue;const path=new Polyline(road.points);if(path.length<65)continue;const p=path.sample(path.length*.5).position,key=`${Math.floor(p[0]/1000)},${Math.floor(p[2]/1000)}`,list=cells.get(key)||[];list.push({id:road.id,rank:hash(`population/${road.id}`)});cells.set(key,list);}this.spawnPlan=new Set([...cells.values()].flatMap(list=>list.sort((a,b)=>a.rank-b.rank||compareId(a.id,b.id)).slice(0,8).map(r=>r.id)));}
  addRoads(roads:TrafficRoad[]){for(const road of roads){if(this.roads.has(road.id)||!isMotorRoad(road))continue;
    const path=new Polyline(road.points);this.roads.set(road.id,{...road,path});for(const end of [0,1] as const){const p=road.points[end===0?0:road.points.length-1],key=this.key(p),arr=this.nodes.get(key)||[];arr.push({id:road.id,end});this.nodes.set(key,arr);}
    if(path.length<65||hash(road.id)%4!==0||(this.spawnPlan?!this.spawnPlan.has(road.id):this.cars.size>=150))continue;
    for(const direction of [1,-1] as const){const id=`car-${road.id}-${direction}`;let s=path.length*(.18+(hash(id)%60)/100);if(road.mode==='crossing'&&road.crossingS!==undefined&&Math.abs(s-road.crossingS)<40)s=clamp(road.crossingS-direction*(40+hash(id)%15),2,path.length-2);const pose=path.sample(s,-direction*road.width*.23),roll=hash(id)%24;pose.position[1]+=(road.mode==='crossing'?-.005:.035)*.54;const kind=road.width>=7&&roll<2?'lorry':road.width>=6.3&&roll<4?'bus':road.width>=5.3&&roll<7?'van':roll===8?'taxi':'car';this.cars.set(id,{id,road:road.id,s,direction,speed:0,kind,position:pose.position,yaw:pose.yaw+(direction<0?Math.PI:0),pitch:pose.pitch*direction,bank:road.mode==='crossing'?0:.07/road.width,length:kind==='bus'?10:kind==='lorry'?12:kind==='van'?5.5:4.5});}
  }}
  /** Build the complete simulation graph in stable order, independently of scenery tiles. */
  configure(roads:TrafficRoad[]){this.roads.clear();this.nodes.clear();this.cars.clear();this.reservations.clear();const ordered=[...roads].sort((a,b)=>compareId(a.id,b.id));this.setSpawnPlan(ordered);this.addRoads(ordered);}
  private key(p:V3){return `${Math.round(p[0]/4)},${Math.round(p[1]/2)},${Math.round(p[2]/4)}`;}
  snapshot(){return {roads:[...this.roads.values()].map(({path,...road})=>road),cars:[...this.cars.values()].map(car=>({...car,transition:car.transition?{...car.transition,path:car.transition.path.points}:undefined})),reservations:[...this.reservations],spawnPlan:this.spawnPlan?[...this.spawnPlan].sort():undefined};}
  /** Persist dynamic state only; the world-hashed road graph is rebuilt before restore. */
  snapshotState(){return {version:2,cars:[...this.cars.values()].map(car=>({...car,transition:car.transition?{...car.transition,path:car.transition.path.points}:undefined})),reservations:[...this.reservations]};}
  restoreState(saved:any){
    if(saved?.version!==2||!Array.isArray(saved.cars)||!Array.isArray(saved.reservations))throw new Error('This save has an incompatible road traffic state. Start a new journey.');
    const cars=new Map<string,RoadCar>();
    for(const entry of saved.cars){
      if(!entry||typeof entry.id!=='string'||cars.has(entry.id)||!this.roads.has(entry.road)||![1,-1].includes(entry.direction)||!Number.isFinite(entry.s)||!Number.isFinite(entry.speed))throw new Error('The saved road traffic does not match the current road network. Start a new journey.');
      const car={...entry} as RoadCar;
      if(entry.transition){const t=entry.transition;if(!this.roads.has(t.next)||!Array.isArray(t.path)||t.path.length<2||!Number.isFinite(t.s))throw new Error('The saved road transition is incompatible. Start a new journey.');car.transition={...t,path:new Polyline(t.path)};}
      cars.set(car.id,car);
    }
    const reservations=new Map<string,{car:string;until:number}>();
    for(const entry of saved.reservations){if(!Array.isArray(entry)||entry.length!==2||typeof entry[0]!=='string'||!this.nodes.has(entry[0])||!entry[1]||!cars.has(entry[1].car)||!Number.isFinite(entry[1].until))throw new Error('The saved road reservation is incompatible. Start a new journey.');reservations.set(entry[0],entry[1]);}
    this.cars.clear();for(const [id,car] of cars)this.cars.set(id,car);
    this.reservations.clear();for(const [id,reservation] of reservations)this.reservations.set(id,reservation);
  }
  reset(){const roads=[...this.roads.values()].map(({path,...road})=>road);this.roads.clear();this.nodes.clear();this.cars.clear();this.reservations.clear();this.addRoads(roads);}
  restore(saved:any){this.roads.clear();this.nodes.clear();this.cars.clear();this.reservations.clear();if(saved.spawnPlan)this.spawnPlan=new Set(saved.spawnPlan);this.addRoads(saved.roads);this.cars.clear();for(const car of saved.cars){if(car.transition)car.transition.path=new Polyline(car.transition.path);this.cars.set(car.id,car);}for(const [key,value] of saved.reservations)this.reservations.set(key,value);}
  crossingClear(routeS:number){for(const car of this.cars.values()){const road=this.roads.get(car.road);if(road?.mode!=='crossing'||road.routeS===undefined||road.crossingS===undefined||Math.abs(road.routeS-routeS)>220)continue;const d=(road.crossingS-car.s)*car.direction,zone=16+car.length/2;if(d>-zone&&(d<zone||(d>0&&d<zone+car.speed*car.speed/3.6)))return false;}return true;}
  update(dt:number,time:number,crossings:Crossing[],_camera?:V3){
    for(const [node,r] of this.reservations)if(r.until<time)this.reservations.delete(node);
    const laneCars=new Map<string,RoadCar[]>(),leaders=new Map<string,RoadCar>();for(const car of this.cars.values()){const key=`${car.road}/${car.direction}`,list=laneCars.get(key)||[];list.push(car);laneCars.set(key,list);}for(const list of laneCars.values()){list.sort((a,b)=>(a.s-b.s)*a.direction);for(let i=0;i<list.length-1;i++)leaders.set(list[i].id,list[i+1]);}
    for(const car of this.cars.values()){
      if(car.transition){const tr=car.transition;car.speed=Math.min(5,car.speed+.7*dt);tr.s+=car.speed*dt;const p=tr.path.sample(tr.s);car.position=p.position;car.yaw=p.yaw;car.pitch=p.pitch;if(tr.s>=tr.path.length){car.road=tr.next;car.direction=tr.direction;car.s=tr.nextS;car.transition=undefined;}continue;}
      const road=this.roads.get(car.road);if(!road)continue;let target=road.kind==='primary'||road.kind==='secondary'?12:9;
      const endDistance=car.direction===1?road.path.length-car.s:car.s;
      const leader=leaders.get(car.id);if(leader){const d=(leader.s-car.s)*car.direction;if(d>0)target=Math.min(target,Math.sqrt(Math.max(0,2*1.8*(d-(car.length+leader.length)/2-3.5))));}
      if(road.mode==='crossing'&&road.routeS!==undefined&&road.crossingS!==undefined){const c=crossings.find(x=>Math.abs(x.s-road.routeS!)<220);const d=(road.crossingS-car.s)*car.direction;
        if(d<-(16+car.length/2))car.crossingCommitted=undefined;
        if(c&&c.state==='warning'&&d>0&&d<car.length/2+12+car.speed*car.speed/4.6)car.crossingCommitted=c.id;
        const exitBlocked=(laneCars.get(`${car.road}/${car.direction}`)||[]).some(other=>other.id!==car.id&&(other.s-road.crossingS!)*car.direction>0&&(other.s-road.crossingS!)*car.direction<26+car.length+other.length/2);
        if(d>0&&!(c&&car.crossingCommitted===c.id)&&((c&&c.state!=='open')||exitBlocked))target=Math.min(target,Math.sqrt(Math.max(0,2*2.3*(d-car.length/2-18))));}
      if(endDistance<30){
        const endpoint=road.points[car.direction===1?road.points.length-1:0],node=this.key(endpoint),nexts=(this.nodes.get(node)||[]).filter(n=>n.id!==road.id);
        nexts.sort((a,b)=>compareId(a.id,b.id)||a.end-b.end);const next=nexts.length?nexts[hash(car.id+node)%nexts.length]:undefined;
        const reservation=this.reservations.get(node);
        if(!next||(reservation&&reservation.car!==car.id)){target=Math.min(target,Math.sqrt(Math.max(0,2*1.7*(endDistance-8))));}
        else{target=Math.min(target,5);if(endDistance<12){
          const nr=this.roads.get(next.id)!;const direction=next.end===0?1:-1;const ns=direction===1?12:nr.path.length-12;const dest=nr.path.sample(ns,-direction*nr.width*.23);dest.position[1]+=(nr.mode==='crossing'?-.005:.035)*.54;
          const occupied=(laneCars.get(`${nr.id}/${direction}`)||[]).some(o=>o.id!==car.id&&Math.abs(o.s-ns)<(car.length+o.length)/2+8);
          if(!occupied){const start=road.path.sample(car.s,-car.direction*road.width*.23).position;start[1]+=(road.mode==='crossing'?-.005:.035)*.54;const control:V3=[endpoint[0],mix(start[1],dest.position[1],.5),endpoint[2]];const points:V3[]=[];
            for(let j=0;j<=12;j++){const t=j/12,u=1-t;points.push([u*u*start[0]+2*u*t*control[0]+t*t*dest.position[0],mix(start[1],dest.position[1],t),u*u*start[2]+2*u*t*control[2]+t*t*dest.position[2]]);}
            car.transition={path:new Polyline(points),s:0,next:nr.id,direction,nextS:ns,node};this.reservations.set(node,{car:car.id,until:time+8});continue;
          }else target=0;
        }}
      }
      car.speed=Math.max(0,car.speed+clamp(target-car.speed,-2.5*dt,1.1*dt));car.s=clamp(car.s+car.direction*car.speed*dt,2,road.path.length-2);
      const pose=road.path.sample(car.s,-car.direction*road.width*.23);car.position=pose.position;car.position[1]+=(road.mode==='crossing'?-.005:.035)*.54;car.yaw=pose.yaw+(car.direction<0?Math.PI:0);car.pitch=pose.pitch*car.direction;car.bank=road.mode==='crossing'?0:.07/road.width;
    }
  }
}
