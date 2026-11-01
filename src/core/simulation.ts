import {RouteGeometry,clamp,mps,mph,hash} from './geometry';
import type {Aspect,Direction,Station} from './types';
import {deriveTrackwork,type SwitchAssetDefinition} from '../render/trackwork';

export interface InputState {a:boolean;d:boolean;horn:boolean}
export interface Train {
  id:string;s:number;speed:number;direction:Direction;lane:number;length:number;cars:number;
  kind:'172'|'168'|'139';nextStop:number;dwell:number;doors:boolean;controller:number;arrived:boolean;portalWaitUntil?:number;reverseAuthority?:{min:number;max:number};authorityBrake?:boolean;
}
export interface Signal {id:string;s:number;direction:Direction;lane:number;aspects:3|4;source:string}
export interface Point {id:string;s:number;lane?:number;state:'normal'|'reverse'|'moving';target:'normal'|'reverse';blend:number;lockedBy:string|null}
export interface Crossing {id:string;s:number;state:'open'|'warning'|'closing'|'closed'|'opening';blend:number;timer:number;held:boolean}
export interface Event {time:number;type:string;message:string}
export interface Snapshot {version:2;worldHash:string;routeFingerprint:string;routeLength:number;clock:number;player:Train;ai:Train[];points:Point[];crossings:Crossing[];aws:AWS;tpws:TPWS;calls:string[];stats:Stats;timeScale:number;roadTraffic?:unknown}
interface AWS {pending:boolean;deadline:number;indicator:boolean;brake:boolean;lastSignal:string;acknowledged:number}
interface TPWS {active:boolean;reason:string;stoppedAt:number;ossEntries?:Record<string,{time:number;direction:Direction;lane:number}>;tssEntries?:Record<string,{time:number;direction:Direction;lane:number}>}
interface Stats {spads:number;aiSpads:number;collisions:number;stops:number;awsMissed:number;tpwsInterventions:number;distance:number}

export class RailwaySimulation {
  player!:Train;ai:Train[]=[];signals:Signal[]=[];points:Point[]=[];crossings:Crossing[]=[];
  events:Event[]=[];calls:string[]=[];clock=8*3600+12*60;elapsed=0;paused=true;timeScale=1;
  aws:AWS={pending:false,deadline:0,indicator:false,brake:false,lastSignal:'',acknowledged:0};
  tpws:TPWS={active:false,reason:'',stoppedAt:-1,ossEntries:{},tssEntries:{}};
  stats:Stats={spads:0,aiSpads:0,collisions:0,stops:0,awsMissed:0,tpwsInterventions:0,distance:0};
  sound?: (name:string)=>void;onEvent?: (event:Event)=>void;
  roadCrossingClear?: (s:number)=>boolean;
  private signalGroups = new Map<Direction,Signal[]>();
  private signalIndex = new Map<string,number>();
  readonly trackwork:{switches:SwitchAssetDefinition[];gaps:string[]};
  constructor(readonly route:RouteGeometry) {
    this.trackwork=deriveTrackwork(route);route.data.trackwork=this.trackwork.switches;
    for(const station of route.stations) for(const dir of [1,-1] as Direction[]){
      for(const [i,offset] of [-station.length/2-170,station.length/2+85].entries()) {
        const s=station.s+dir*offset;if(s>10&&s<route.length-10)this.signals.push({id:`SH-${station.id}-${dir===1?'U':'D'}${i+1}`,s,direction:dir,lane:dir===1?4.2:0,aspects:i===0?4:3,source:'Designed simulator block; exact signal plan unavailable'});
      }
    }
    this.signals.sort((a,b)=>a.s-b.s);
    // Split long sections at nonuniform, reproducible distances. These are labelled simulator infrastructure.
    for(const dir of [1,-1] as Direction[]) {
      const ss=this.signals.filter(x=>x.direction===dir);for(let i=1;i<ss.length;i++){
        const gap=ss[i].s-ss[i-1].s;if(gap<1900)continue;const n=Math.floor(gap/1400);
        for(let j=1;j<=n;j++){const s=ss[i-1].s+gap*j/(n+1);this.signals.push({id:`SH-SEC-${dir}-${i}-${j}`,s,direction:dir,lane:dir===1?4.2:0,aspects:4,source:'Designed intermediate simulator block'});}
      }
    }
    this.signals.sort((a,b)=>a.s-b.s);
    for(const dir of [1,-1] as Direction[]){const group=this.signals.filter(x=>x.direction===dir).sort((a,b)=>(a.s-b.s)*dir);this.signalGroups.set(dir,group);group.forEach((signal,index)=>this.signalIndex.set(signal.id,index));}
    this.points=this.trackwork.switches.map(point=>({id:point.id,s:point.s,lane:point.lane,state:'normal',target:'normal',blend:0,lockedBy:null}));
    for(const c of (route.data.crossings as {id:string;s:number}[])||[])this.crossings.push({id:c.id,s:route.sourceS(c.s),state:'open',blend:0,timer:0,held:false});
    this.start(1,0);
  }
  log(type:string,message:string) {const event={time:this.clock,type,message};this.events.push(event);if(this.events.length>200)this.events.shift();this.onEvent?.(event);}
  start(direction:Direction,index=direction===1?0:this.route.stations.length-1) {
    this.clock=8*3600+12*60;
    const station=this.route.stations[index];this.player={id:'player',s:clamp(station.s+direction*34,4,this.route.length-4),speed:0,direction,lane:direction===1?4.2:0,length:70.3,cars:3,kind:'172',nextStop:index+direction,dwell:0,doors:false,controller:-1,arrived:false};
    this.calls=[];this.aws={pending:false,deadline:0,indicator:false,brake:false,lastSignal:'',acknowledged:0};this.tpws={active:false,reason:'',stoppedAt:-1,ossEntries:{},tssEntries:{}};this.ai=[];this.elapsed=0;this.events=[];
    this.stats={spads:0,aiSpads:0,collisions:0,stops:0,awsMissed:0,tpwsInterventions:0,distance:0};
    for(const dir of [1,-1] as Direction[])for(let i=0;i<8;i++){
      let s=1100+i*(this.route.length-2200)/7+(dir===-1?850:0);s=clamp(s,200,this.route.length-200);
      if(dir===direction&&Math.abs(s-this.player.s)<1200)s=clamp(s+direction*1700,150,this.route.length-150);
      const next=this.route.stations.findIndex(st=>st.s>s);
      const chiltern=dir===1?i===0:i===7;
      this.ai.push({id:`AI-${dir}-${i}`,s,speed:mps(32),direction:dir,lane:dir===1?4.2:0,length:chiltern?93.95:70.3,cars:chiltern?4:3,kind:chiltern?'168':'172',nextStop:dir===1?(next<0?this.route.stations.length:next):(next<0?this.route.stations.length-1:next-1),dwell:0,doors:false,controller:.5,arrived:false});
    }
    for(const p of this.points){p.state='normal';p.target='normal';p.blend=0;p.lockedBy=null;}
    for(const c of this.crossings){c.state='open';c.blend=0;c.timer=0;c.held=false;}
    this.paused=true;this.log('journey',`Ready at ${station.name}. Hold A to release the brake.`);
  }
  allTrains() {return [this.player,...this.ai.filter(t=>t.portalWaitUntil===undefined)];}
  interval(t:Train,padding=0):[number,number] {const rear=this.route.travel(t.s,-t.direction*t.length,t.lane);return [this.route.travel(Math.min(t.s,rear),-padding,t.lane),this.route.travel(Math.max(t.s,rear),padding,t.lane)];}
  occupied(a:number,b:number,lane:number,ignore:string) {const lo=Math.min(a,b),hi=Math.max(a,b);return this.allTrains().some(t=>{if(t.id===ignore||Math.abs(t.lane-lane)>1)return false;const [x,y]=this.interval(t);return y>=lo&&x<=hi;});}
  pointOccupied(p:Point) {return this.allTrains().some(t=>{const [a,b]=this.interval(t,18);return p.s>=a&&p.s<=b;});}
  requestPoint(id:string,target:'normal'|'reverse') {
    const p=this.points.find(x=>x.id===id);if(!p)return false;
    const approaching=this.allTrains().some(t=>Math.abs(t.s-p.s)<Math.max(100,t.speed*t.speed/1.2+60));
    if(p.lockedBy||this.pointOccupied(p)||approaching){this.log('points',`${id} is locked by an occupied or approaching route.`);return false;}
    p.target=target;p.state='moving';this.log('points',`${id} requested ${target}.`);return true;
  }
  nextSignal(t=this.player):Signal|undefined {const group=this.signalGroups.get(t.direction)||[];let lo=0,hi=group.length;while(lo<hi){const m=(lo+hi)>>1;if((group[m].s-t.s)*t.direction>=-.1)hi=m;else lo=m+1;}const signal=group[lo];return signal&&Math.abs(signal.lane-t.lane)<1?signal:undefined;}
  aspect(signal:Signal,ignore='player'):Aspect {
    const ss=this.signalGroups.get(signal.direction)||[];const index=this.signalIndex.get(signal.id)??-1;if(index<0)return 'red';
    for(let step=0;step<3;step++){
      const a=ss[index+step],b=ss[index+step+1];if(!a)break;
      const target=b?.s??(signal.direction===1?this.route.length+100:-100);
      const badPoint=this.points.some(p=>(p.lane===undefined||p.lane===signal.lane)&&(p.s-a.s)*signal.direction>=0&&(target-p.s)*signal.direction>=0&&(p.state==='moving'||p.state==='reverse'));
      const badCrossing=this.crossings.some(c=>(c.s-a.s)*signal.direction>=0&&(target-c.s)*signal.direction>=0&&c.blend<.99);
      if(this.occupied(a.s+signal.direction*3,target+signal.direction*90,signal.lane,ignore)||badPoint||badCrossing)return step===0?'red':step===1?'yellow':signal.aspects===4?'double-yellow':'green';
    }
    return 'green';
  }
  acknowledge() {if(this.aws.pending){this.aws.pending=false;this.aws.acknowledged++;this.sound?.('ack');this.log('aws','AWS warning acknowledged.');}if(this.aws.brake&&this.player.speed<.05){this.aws.brake=false;this.log('aws','AWS brake released at standstill.');}}
  resetTPWS() {if(!this.tpws.active)return true;if(this.player.speed>.05||this.tpws.stoppedAt<0||this.clock-this.tpws.stoppedAt<5){this.log('tpws','Stop the train and wait five seconds before resetting TPWS.');return false;}this.tpws.active=false;this.tpws.reason='';this.player.controller=-1;this.log('tpws','TPWS reset. Service brake remains applied.');return true;}
  setDirection(direction:Direction) {
    const p=this.player;if(direction===p.direction)return true;
    if(p.speed>.05||p.controller>0||p.doors){this.log('direction','Stop, close doors and select idle/brake before changing direction.');return false;}
    // Only the modelled terminal turnback zones permit a reverse authority. The physical lane never changes here.
    const terminal=this.route.stations.find(s=>(s.id==='KID'||s.id==='DDG')&&Math.abs(s.s-p.s)<180);
    if(!terminal){this.log('direction','No reverse movement authority at this location.');return false;}
    const newFront=this.route.travel(p.s,-p.direction*p.length,p.lane);
    const authorityEnd=this.route.travel(newFront,direction*300,p.lane);
    if(this.occupied(newFront,authorityEnd,p.lane,p.id)){this.log('direction','Reverse route occupied.');return false;}
    p.s=newFront;p.direction=direction;
    const normalLane=direction===1?4.2:0;p.reverseAuthority=p.lane===normalLane?undefined:{min:terminal.s-150,max:terminal.s+150};
    p.nextStop=this.route.stations.findIndex(s=>s.s>p.s);if(direction===-1)p.nextStop=(p.nextStop<0?this.route.stations.length:p.nextStop)-1;
    p.arrived=false;this.log('direction',p.reverseAuthority?'Station reversal authorised, maximum 10 mph. Physical consist unchanged.':direction===1?'Forward selected.':'Reverse selected.');return true;
  }
  targetStation(t=this.player):Station|undefined {return this.route.stations[t.nextStop];}
  stopPosition(station:Station,direction:Direction) {return clamp(station.s+direction*Math.min(40,station.length/2-8),3,this.route.length-3);}
  distanceToStop(t=this.player) {const st=this.targetStation(t);return st?this.route.laneDistance(t.s,this.stopPosition(st,t.direction),t.lane)*t.direction:0;}
  triggerTPWS(reason:string) {if(this.tpws.active)return;this.tpws={active:true,reason,stoppedAt:-1,ossEntries:{},tssEntries:{}};this.stats.tpwsInterventions++;this.sound?.('tpws');this.log('tpws',reason);}
  update(dt:number,input:InputState) {
    if(this.paused)return;this.clock+=dt;this.elapsed+=dt;const p=this.player;
    if(input.a!==input.d)p.controller=clamp(p.controller+(input.a?.45:-.45)*dt,-1,1);
    for(const point of this.points){
      const approaching=this.allTrains().find(t=>(point.s-t.s)*t.direction>-t.length-30&&(point.s-t.s)*t.direction<Math.max(100,t.speed*12));
      point.lockedBy=approaching?.id??null;
      if(point.state==='moving'&&!this.pointOccupied(point)){point.blend=clamp(point.blend+(point.target==='reverse'?1:-1)*dt/2.5,0,1);if(point.blend===0||point.blend===1)point.state=point.target;}
    }
    for(const c of this.crossings){
      const held=this.allTrains().some(t=>{const d=(c.s-t.s)*t.direction;return d>-t.length-35&&d<Math.max(1000,t.speed*45);});c.held=held;
      if(held&&(c.state==='open'||c.state==='opening')){c.state='warning';c.timer=0;}
      if(c.state==='warning'&&(c.timer+=dt)>3&&(this.roadCrossingClear?.(c.s)??true))c.state='closing';
      if(c.state==='closing'){c.blend=clamp(c.blend+dt/3,0,1);if(c.blend===1)c.state='closed';}
      if(!held&&c.state==='closed'){c.timer+=dt;if(c.timer>5)c.state='opening';}else if(held&&c.state==='closed')c.timer=0;
      if(c.state==='opening'){c.blend=clamp(c.blend-dt/3,0,1);if(c.blend===0)c.state='open';}
    }
    const old=p.s;
    if(p.doors){p.dwell-=dt;if(p.dwell<=0){p.doors=false;this.sound?.('doors');this.log('station','Doors closed. Ready to depart.');}}
    if(this.aws.pending&&this.clock>this.aws.deadline){this.aws.pending=false;this.aws.brake=true;this.stats.awsMissed++;this.sound?.('tpws');this.log('aws','AWS missed. Brake demand. Stop and acknowledge.');}
    const force=p.controller>0?Math.min(.95,6.7/Math.max(5,p.speed))*p.controller:0;
    const authorityDistance=p.reverseAuthority?this.route.laneDistance(p.s,p.direction===1?p.reverseAuthority.max:p.reverseAuthority.min,p.lane)*p.direction:Infinity;
    const authoritySpeed=Math.min(mps(10),Math.sqrt(Math.max(0,2*.65*(authorityDistance-7))));p.authorityBrake=!!p.reverseAuthority&&(authorityDistance<=7||p.speed>authoritySpeed);
    const service=p.controller<0?-.95*p.controller:0, safety=this.aws.brake||this.tpws.active?1.25:p.authorityBrake?1.05:0;
    const pose=this.route.lanePose(p.s,p.lane);const resistance=.012+.0002*p.speed*p.speed;
    const acceleration=(p.doors||this.aws.brake||this.tpws.active||p.authorityBrake?0:force)-Math.max(service,safety)-resistance-pose.grade*9.81*p.direction;
    p.speed=Math.max(0,p.speed+acceleration*dt);if(p.doors)p.speed=0;
    p.s=this.route.travel(p.s,p.direction*p.speed*dt,p.lane);this.stats.distance+=Math.abs(this.route.laneDistance(old,p.s,p.lane));
    if(p.s<0||p.s>this.route.length+2){p.speed=0;p.controller=-1;this.paused=true;this.log('boundary','You have passed the modelled route boundary. Restart or load a saved journey.');return;}
    for(const sig of this.signals){if(sig.direction!==p.direction||Math.abs(sig.lane-p.lane)>1)continue;
      const before=this.route.laneDistance(old,sig.s,p.lane)*p.direction,after=this.route.laneDistance(p.s,sig.s,p.lane)*p.direction;const aspect=this.aspect(sig);
      if(before>200&&after<=200){this.aws.lastSignal=sig.id;this.aws.indicator=aspect!=='green';if(aspect==='green'){this.sound?.('clear');}else{this.aws.pending=true;this.aws.deadline=this.clock+2.7;this.sound?.('aws');this.log('aws',`AWS: ${sig.id}, ${aspect}. Acknowledge with Q.`);}}
      const entries=this.tpws.ossEntries??(this.tpws.ossEntries={});
      const passageTime=(offset:number)=>this.clock-dt+dt*clamp((before-offset)/(before-after||1),0,1);
      if(before>74&&after<=74&&aspect==='red')entries[sig.id]={time:passageTime(74),direction:p.direction,lane:p.lane};
      if(before>70&&after<=70){const entry=entries[sig.id];if(entry&&entry.direction===p.direction&&entry.lane===p.lane&&aspect==='red'&&passageTime(70)-entry.time<4/Math.sqrt(2*.8*55))this.triggerTPWS(`TPWS overspeed intervention at ${sig.id}.`);delete entries[sig.id];}
      const tss=this.tpws.tssEntries??(this.tpws.tssEntries={});
      if(before>1.2&&after<=1.2&&aspect==='red')tss[sig.id]={time:passageTime(1.2),direction:p.direction,lane:p.lane};
      if(before>0&&after<=0){if(aspect==='red'){this.stats.spads++;const entry=tss[sig.id];if(entry&&entry.direction===p.direction&&entry.lane===p.lane&&passageTime(0)-entry.time<1.1)this.triggerTPWS(`TPWS train-stop intervention at ${sig.id}.`);}delete tss[sig.id];}
    }
    const stop=this.targetStation();if(stop){const dist=this.distanceToStop();if(Math.abs(dist)<20&&p.speed<.25&&!this.calls.includes(stop.id)){
      p.speed=0;p.controller=-1;p.doors=true;p.dwell=18;this.calls.push(stop.id);this.stats.stops++;this.sound?.('doors');this.log('station',`${stop.name}. Doors released; 18 second dwell.`);p.nextStop+=p.direction;
      if(p.nextStop<0||p.nextStop>=this.route.stations.length){p.arrived=true;this.log('complete','Journey complete.');}
    }else if(dist < -100&&!this.calls.includes(stop.id)){this.log('station',`${stop.name} passed.`);p.nextStop+=p.direction;}}
    if(this.tpws.active&&p.speed<.05&&this.tpws.stoppedAt<0)this.tpws.stoppedAt=this.clock;
    for(const t of this.ai)this.driveAI(t,dt);
    this.checkCollisions();
  }
  driveAI(t:Train,dt:number) {
    if(t.portalWaitUntil!==undefined){
      if(this.clock<t.portalWaitUntil)return;
      const entry=t.direction===1?-220:this.route.length+220;
      if(Math.abs(entry-this.player.s)<1400||this.occupied(entry-t.direction*t.length,entry+t.direction*100,t.lane,t.id))return;
      t.portalWaitUntil=undefined;t.s=entry;t.speed=0;t.nextStop=t.direction===1?0:this.route.stations.length-1;
    }
    if(t.dwell>0){t.dwell-=dt;t.speed=0;t.doors=true;if(t.dwell<=0){t.doors=false;t.nextStop+=t.direction;}return;}
    if(t.kind==='168')while(this.targetStation(t)&&!['KID','SBJ','SGB','BSW','BMO','SOL','DDG'].includes(this.targetStation(t)!.id))t.nextStop+=t.direction;
    const sig=this.nextSignal(t),aspect=sig?this.aspect(sig,t.id):'green';let speed=mps(this.route.limit(t.s)-(t.kind==='168'?0:5));
    if(sig&&aspect==='red'){const d=this.route.laneDistance(t.s,sig.s,t.lane)*t.direction-10;speed=Math.min(speed,Math.sqrt(Math.max(0,2*.68*d)));}
    if(sig&&aspect==='yellow')speed=Math.min(speed,mps(35));
    const stop=this.targetStation(t);if(stop){const d=this.distanceToStop(t);if(d>-20){speed=Math.min(speed,Math.sqrt(Math.max(0,2*.68*(d-1))));if(d<2&&t.speed<.4){t.speed=0;t.dwell=18+hash(t.id+stop.id)%12;t.doors=true;return;}}else t.nextStop+=t.direction;}
    // Full consist separation provides a second, physical check independent of signal sighting.
    for(const other of this.allTrains()){if(other.id===t.id||Math.abs(other.lane-t.lane)>1)continue;const [a,b]=this.interval(other);const d=t.direction===1?a-t.s:t.s-b;if(d>0)speed=Math.min(speed,Math.sqrt(Math.max(0,2*.7*(d-40))));}
    const old=t.s;t.speed=Math.max(0,t.speed+clamp(speed-t.speed,-.9*dt,.65*dt));t.s=this.route.travel(t.s,t.direction*t.speed*dt,t.lane);
    if(sig&&(sig.s-old)*t.direction>0&&(sig.s-t.s)*t.direction<=0&&aspect==='red')this.stats.aiSpads++;
    if(t.s>this.route.length+200||t.s< -200){t.portalWaitUntil=this.clock+45;t.speed=0;}
  }
  checkCollisions() {const all=this.allTrains();for(let i=0;i<all.length;i++)for(let j=i+1;j<all.length;j++){const a=all[i],b=all[j];if(Math.abs(a.lane-b.lane)>1)continue;const [a0,a1]=this.interval(a),[b0,b1]=this.interval(b);if(Math.min(a1,b1)-Math.max(a0,b0)>2){a.speed=0;b.speed=0;this.stats.collisions++;this.paused=true;this.log('collision',`Movement stopped: conflicting occupation ${a.id}/${b.id}.`);return;}}}
  snapshot():Snapshot {return JSON.parse(JSON.stringify({version:2,worldHash:String(this.route.data.worldHash||this.route.fingerprint),routeFingerprint:this.route.fingerprint,routeLength:this.route.length,clock:this.clock,player:this.player,ai:this.ai,points:this.points,crossings:this.crossings,aws:this.aws,tpws:this.tpws,calls:this.calls,stats:this.stats,timeScale:this.timeScale}));}
  restore(s:Snapshot) {if(s.version!==2||s.worldHash!==String(this.route.data.worldHash||this.route.fingerprint)||s.routeFingerprint!==this.route.fingerprint||Math.abs(s.routeLength-this.route.length)>1)throw new Error('This save belongs to another route version. Start a new journey.');this.clock=s.clock;this.player=s.player;this.ai=s.ai;this.points=s.points;this.crossings=s.crossings;this.aws=s.aws;this.tpws=s.tpws;this.calls=s.calls;this.stats=s.stats;this.timeScale=s.timeScale;this.paused=true;this.log('save','Journey restored, paused.');}
  clockText() {return new Date(this.clock*1000).toISOString().slice(11,19);}
  get speedMph(){return mph(this.player.speed);}
}
