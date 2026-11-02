import * as THREE from 'three';
import {makeCat,animateCat} from './cats.js';
const boxGeo=new THREE.BoxGeometry(1,1,1),wheelGeo=new THREE.CylinderGeometry(1,1,1,12),materials=new Map();
const mat=c=>{if(!materials.has(c))materials.set(c,new THREE.MeshStandardMaterial({color:c,roughness:.75}));return materials.get(c);};
import profiles from './vehicle-profiles.json' with {type:'json'};
export const ROAD_VEHICLE_PROFILES=Object.freeze(profiles);
const aliases={car:'FAMILY_HATCHBACK',van:'MEDIUM_VAN',bus:'SINGLE_DECKER_BUS',taxi:'TAXI',lorry:'RIGID_LORRY','rigid-lorry':'RIGID_LORRY'};
function box(parent,c,x,y,z,w,h,d){const m=new THREE.Mesh(boxGeo,mat(c));m.position.set(x,y,z);m.scale.set(w,h,d);parent.add(m);return m;}
function wheel(parent,x,z,r,width=.19){const m=new THREE.Mesh(wheelGeo,mat(0x242b2c));m.rotation.z=Math.PI/2;m.position.set(x,r,z);m.scale.set(r,width,r);parent.add(m);const hub=new THREE.Mesh(wheelGeo,mat(0x8c9695));hub.rotation.z=Math.PI/2;hub.position.set(x+Math.sign(x)*.012,r,z);hub.scale.set(r*.48,width+.025,r*.48);parent.add(hub);}
function pane(parent,vertices){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(vertices.flat(),3));g.setIndex([0,1,2,0,2,3]);g.computeVertexNormals();const m=new THREE.Mesh(g,new THREE.MeshStandardMaterial({color:0x415964,roughness:.3,side:THREE.DoubleSide}));parent.add(m);return m;}
export function britishRoadVehicle(config={}){
 const id=config.variant||aliases[config.kind]||config.kind||'FAMILY_HATCHBACK',p=ROAD_VEHICLE_PROFILES[id];if(!p)throw Error(`Unknown British road vehicle ${id}`);
 const g=new THREE.Group(),{length:l,width:w,height:h,body}=p,r=body.includes('bus')||body==='coach'||body==='lorry'||body==='hgv'?.45:body==='bike'?.31:.31,colour=config.color??[0x8b5148,0x73878b,0xaeb4ad,0xe3e1d6,0x36464d][(config.seed??1)%5];
 if(body==='bike'){
  for(const z of [-l*.35,l*.35])wheel(g,0,z,r,id==='BICYCLE'?.055:.14);
  box(g,id==='BICYCLE'?0x606e73:colour,0,.57,0,id==='BICYCLE'?.06:.45,.12,l*.56);const fork=box(g,0x7a8584,0,.58,-l*.34,.07,.57,.07);fork.rotation.x=-.25;box(g,0x333b3c,0,.84,-l*.31,w,.05,.07);box(g,0x343c40,0,.76,.10,.22,.07,.35);
  const cat=makeCat({id:`${config.id||id}/rider`,seed:config.seed||4});cat.scale.setScalar(.67);cat.position.set(0,.4,.05);animateCat(cat,0,'SIT');g.add(cat);
 }else{
  box(g,0x343d40,0,.43,0,w*.83,.24,l*.91);
  if(body==='car'){
   box(g,colour,0,.69,0,w,.65,l);const top=new THREE.BoxGeometry(1,1,1),v=top.getAttribute('position'),cabinLength=l*(id==='ESTATE'?.72:.60),front=-cabinLength/2+.15,rear=cabinLength/2+.15,low=1.01,high=h-.05;
   for(let i=0;i<v.count;i++)if(v.getY(i)>0){v.setX(i,v.getX(i)*.86);v.setZ(i,v.getZ(i)*.71);}top.computeVertexNormals();const cabin=new THREE.Mesh(top,mat(colour));cabin.position.set(0,(low+high)/2,.15);cabin.scale.set(w*.94,high-low,cabinLength);g.add(cabin);
   pane(g,[[-w*.44,low+.03,front-.012],[w*.44,low+.03,front-.012],[w*.385,high-.04,-cabinLength*.355+.15-.012],[-w*.385,high-.04,-cabinLength*.355+.15-.012]]);
   pane(g,[[w*.44,low+.03,rear+.012],[-w*.44,low+.03,rear+.012],[-w*.385,high-.04,cabinLength*.355+.15+.012],[w*.385,high-.04,cabinLength*.355+.15+.012]]);
   for(const side of [-1,1]){pane(g,[[side*w*.473,low+.04,front+.12],[side*w*.473,low+.04,rear-.12],[side*w*.406,high-.04,cabinLength*.355+.08],[side*w*.406,high-.04,-cabinLength*.355+.22]]);box(g,colour,side*w*.45,(low+high)/2,.06,.07,high-low,.10);box(g,0x66716f,side*w*.505,.86,.3,.025,.045,.18);box(g,colour,side*(w/2+.07),1.04,front+.25,.16,.10,.25);}
   if(id==='TAXI')box(g,0xd9cf9b,0,h+.05,.05,.54,.14,.22);
  }else if(body==='lorry'||body==='hgv'){
   const cabZ=-l/2+1.45;box(g,colour,0,1.75,cabZ,w,2.55,2.8);box(g,0x40565e,0,2.3,-l/2-.012,w*.83,1.0,.025);box(g,0x353f42,0,1.1,-l/2-.026,w*.75,.5,.04);
   const loadLength=body==='hgv'?l-4.0:l-3.2,centre=l/2-loadLength/2;box(g,0xb9beb4,0,(h+.95)/2,centre,w-.03,h-.95,loadLength);box(g,0x79817d,0,.95,centre,w,.16,loadLength);for(const side of [-1,1]){box(g,0x34484d,side*(w/2+.005),2.25,cabZ-.25,.025,.85,1.35);box(g,0x313c3e,side*(w/2+.11),2.25,cabZ-1,.18,.4,.15);}
  }else if(body==='van'){
   box(g,colour,0,(h+.55)/2,.3,w,h-.55,l-.6);box(g,colour,0,.90,-l/2+.35,w,.7,.7);pane(g,[[-w*.44,1.18,-l/2+.01],[w*.44,1.18,-l/2+.01],[w*.40,h-.12,-l/2+.62],[-w*.40,h-.12,-l/2+.62]]);for(const side of [-1,1])box(g,0x415964,side*(w/2+.009),h-.62,-l/2+1.0,.025,.82,1.0);box(g,0x6f7975,0,(h+.6)/2,l/2+.015,.045,h-.5,.03);
   if(id==='EMERGENCY_VEHICLE'||id==='MAINTENANCE_VEHICLE'){for(const side of [-1,1])box(g,id==='EMERGENCY_VEHICLE'?0xabb34a:0xe0bd48,side*(w/2+.015),1.1,.4,.035,.32,l*.7);box(g,id==='EMERGENCY_VEHICLE'?0x477aa6:0xe2ad34,0,h+.10,-l*.27,.7,.2,.27);}
  }else{
   box(g,colour,0,(h+.58)/2,0,w,h-.58,l);const levels=body==='double-bus'?[1.8,3.25]:[body==='coach'?2.5:1.9];for(const y of levels){box(g,0x40575e,0,y,-l/2-.012,w*.88,.9,.025);for(const side of [-1,1])for(let i=0;i<7;i++)box(g,0x40575e,side*(w/2+.012),y,-l*.35+i*l*.12,.025,.9,l*.095);}box(g,0x253939,0,h-.20,-l/2-.022,w*.70,.25,.025);for(const z of [-l*.34,l*.06]){box(g,0x273b40,-w/2-.02,1.4,z,.035,2.25,1.05);box(g,0x8d9993,-w/2-.04,1.4,z,.035,2.25,.055);}
  }
  const axles=body==='hgv'?[-l*.40,-l*.17,l*.29,l*.36,l*.43]:body==='lorry'?[-l*.36,l*.26,l*.38]:[-l*.32,l*.32];for(const z of axles)for(const x of [-w*.46,w*.46])wheel(g,x,z,r,body==='car'?.19:.27);
  for(const side of [-1,1]){box(g,0xeae6cc,side*w*.31,.73,-l/2-.025,.28,.15,.05);box(g,0xb94942,side*w*.34,.72,l/2+.025,.23,.15,.05);}box(g,0xe5e5d8,0,.57,-l/2-.04,.46,.11,.025);box(g,0xe0c65c,0,.57,l/2+.04,.46,.11,.025);
 }
 g.userData.vehicleDimensions={length:l,width:w,height:h};g.userData.variant=id;g.userData.source='Project-scale British vehicle profiles; not manufacturer certification';return g;
}
