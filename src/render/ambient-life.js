import * as THREE from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';

const TYPES=new Set(['PIGEON','CROW','MAGPIE','STARLING','GULL','CLOUD','PASSENGER_AIRCRAFT','LIGHT_AIRCRAFT']);
function random(seed){return()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};}
export function validateAmbientZones(zones){const ids=new Set();for(const z of zones){if(!z.id||ids.has(z.id)||!z.types?.length||z.types.some(t=>!TYPES.has(t))||!Number.isSafeInteger(z.seed)||!Number.isInteger(z.populationCap)||z.populationCap<0||z.populationCap>24||z.bounds?.length!==4||z.bounds.some(v=>!Number.isFinite(v))||z.bounds[0]>=z.bounds[2]||z.bounds[1]>=z.bounds[3]||z.heightRange?.length!==2||z.heightRange.some(v=>!Number.isFinite(v))||z.heightRange[0]<0||z.heightRange[0]>z.heightRange[1]||!(z.updateHz>0&&z.updateHz<=30)||!(z.visibilityDistance>0&&z.visibilityDistance<=5000))throw Error(`Invalid ambient zone ${z.id}`);ids.add(z.id);}return zones;}
export function ambientPopulation(zones,time,camera,quality='balanced'){
 const budget=quality==='low'?{bird:12,cloud:5,plane:1}:quality==='high'?{bird:36,cloud:14,plane:2}:{bird:24,cloud:9,plane:1},result=[];
 for(const zone of zones){const [x,z,X,Z]=zone.bounds,nearest=Math.hypot(Math.max(x-camera[0],0,camera[0]-X),Math.max(z-camera[2],0,camera[2]-Z));if(nearest>zone.visibilityDistance)continue;const rng=random(zone.seed),t=Math.floor(time*zone.updateHz)/zone.updateHz;
  for(let i=0;i<zone.populationCap;i++){const type=zone.types[Math.floor(rng()*zone.types.length)],family=type==='CLOUD'?'cloud':type.includes('AIRCRAFT')?'plane':'bird',a=rng(),b=rng(),c=rng(),phase=rng()*Math.PI*2,speed=family==='plane'?type==='LIGHT_AIRCRAFT'?38:95:family==='cloud'?.8:5+a*6;
   if(!budget[family])continue;
   if(family==='plane'&&(t+zone.seed%240)%300>45)continue;
   let px=x+a*(X-x),pz=z+b*(Z-z),yaw=phase,py=zone.heightRange[0]+c*(zone.heightRange[1]-zone.heightRange[0]);
   if(family==='bird'){const r=12+a*35,angle=phase+t*speed/r;px+=Math.cos(angle)*r;pz+=Math.sin(angle)*r;py+=Math.sin(t*.6+phase)*2;yaw=-angle;}
   else{px=x+((a*(X-x)+t*speed)%(X-x));pz+=Math.sin(phase)*10;yaw=Math.PI/2;}
   if(Math.hypot(px-camera[0],py-camera[1],pz-camera[2])>zone.visibilityDistance)continue;
   budget[family]--;result.push({id:`${zone.id}/${i}`,zone:zone.id,type,family,position:[px,py,pz],yaw,phase,t});
  }
 }
 return result;
}
function solid(geometry,scale,position){geometry.scale(...scale);geometry.translate(...position);return geometry;}
export class AmbientLife{
 constructor(scene,zones=[]){this.zones=validateAmbientZones(zones);this.scene=scene;this.last=-Infinity;this.objects={};this.matrix=new THREE.Object3D();
  const bird=mergeGeometries([solid(new THREE.SphereGeometry(1,6,4),[.13,.12,.32],[0,0,0]),solid(new THREE.ConeGeometry(.09,.18,4),[1,1,1],[0,.01,-.34])]),wing=new THREE.BoxGeometry(.46,.025,.20),cloud=mergeGeometries([[-12,0,0,22,8,11],[9,2,0,20,10,13],[0,6,0,18,12,12]].map(([x,y,z,X,Y,Z])=>solid(new THREE.IcosahedronGeometry(1,1),[X,Y,Z],[x,y,z]))),plane=mergeGeometries([solid(new THREE.SphereGeometry(1,8,5),[1.2,1.25,15],[0,0,0]),solid(new THREE.BoxGeometry(1,1,1),[29,.35,4.5],[0,0,1]),solid(new THREE.BoxGeometry(1,1,1),[9,.25,2.5],[0,.8,12]),solid(new THREE.BoxGeometry(1,1,1),[.3,4.5,3],[0,2,12])]);
  for(const [key,g,capacity,color] of [['bird',bird,36,0x56605e],['wing',wing,72,0x5a6460],['cloud',cloud,14,0xe0e4df],['plane',plane,2,0xb8bfbb]]){const m=new THREE.InstancedMesh(g,new THREE.MeshStandardMaterial({color,roughness:1}),capacity);m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);m.count=0;m.frustumCulled=false;m.name=`ambient/${key}`;scene.add(m);this.objects[key]=m;}
 }
 update(time,camera,quality){if(time>=this.last&&time-this.last<1/15)return;this.last=time;const population=ambientPopulation(this.zones,time,camera,quality),counts={bird:0,wing:0,cloud:0,plane:0},q=this.matrix;
  for(const p of population){q.position.fromArray(p.position);q.rotation.set(0,p.yaw,0);const scale=p.family==='cloud'?1+(p.phase%1):p.type==='LIGHT_AIRCRAFT'?.32:p.type==='GULL'?1.4:p.family==='bird'?.8:1;q.scale.setScalar(scale);q.updateMatrix();this.objects[p.family].setMatrixAt(counts[p.family]++,q.matrix);
   if(p.family==='bird')for(const side of [-1,1]){q.position.fromArray(p.position).add(new THREE.Vector3(side*.24,0,0).applyAxisAngle(new THREE.Vector3(0,1,0),p.yaw));q.rotation.set(0,p.yaw,side*Math.sin(p.t*(5+p.phase)+p.phase)*.7);q.updateMatrix();this.objects.wing.setMatrixAt(counts.wing++,q.matrix);}
  }
  for(const [key,m] of Object.entries(this.objects)){m.count=counts[key];m.instanceMatrix.needsUpdate=true;}this.population=population;
 }
 dispose(){for(const m of Object.values(this.objects)){this.scene.remove(m);m.geometry.dispose();m.material.dispose();}}
}
