import * as THREE from 'three';
import {AssetFactory,geometricText} from './assets';
import {CurvePath} from '../core/geometry';
import type {V3} from '../core/types';

export interface Landmark {id:string;family:string;position:V3;angle?:number;width:number;depth:number;height:number;name?:string;[key:string]:unknown;}
const colors={brick:0x94694f,blueBrick:0x59616a,cream:0xd5c6a1,roof:0x5c635d,green:0x385b48,steel:0x7d8987};
const materials=new Map<number,THREE.MeshStandardMaterial>();
function material(color:number){let m=materials.get(color);if(!m){m=new THREE.MeshStandardMaterial({color,roughness:.88,flatShading:true});materials.set(color,m);}return m;}
function box(g:THREE.Group,x:number,y:number,z:number,w:number,h:number,d:number,c:number){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material(c));m.position.set(x,y,z);g.add(m);return m;}
function cylinder(g:THREE.Group,x:number,y:number,z:number,r:number,h:number,c:number,segments=24){const m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,segments),material(c));m.position.set(x,y,z);g.add(m);return m;}

/** Regional kit, with small dedicated silhouette generators for named landmarks.
 * Dimensions and placements are data, never random substitutions. */
export function makeLandmark(a:Landmark):THREE.Group {
  const g=new THREE.Group(),w=a.width,d=a.depth,h=a.height;
  if(a.family==='rotunda'){
    const r=Math.max(w,d)/2;
    cylinder(g,0,h/2,0,r,h,0x889c9b,48);
    for(let y=3;y<h;y+=3.1)cylinder(g,0,y,0,r+.35,.34,0xc4c8bb,48);
    for(let i=0;i<48;i++){const t=i*Math.PI/24;box(g,Math.sin(t)*(r+.05),h/2,Math.cos(t)*(r+.05),.18,h,.18,0xd0d3c6);}
    cylinder(g,0,h+.8,0,r+1,1.6,0xc9cfc4,48);
  }else if(a.family==='selfridges'){
    const points=Array.from({length:15},(_,i)=>{const t=i/14;return new THREE.Vector2(.67+.33*Math.sin(Math.PI*t*.9),t*h);});
    const shell=new THREE.Mesh(new THREE.LatheGeometry(points,48),material(0x6a7392));shell.scale.set(w/2,1,d/2);g.add(shell);
    const discGeo=new THREE.CylinderGeometry(.58,.58,.13,8);
    for(let row=0;row<17;row++){const y=1+row*(h-2)/16,scale=.67+.33*Math.sin(Math.PI*y/h*.9);for(let i=0;i<72;i++){const angle=(i+row%2*.5)*Math.PI/36,x=Math.sin(angle)*w/2*scale,z=Math.cos(angle)*d/2*scale;
      const disc=new THREE.Mesh(discGeo,material(0xc3c9c6));disc.position.set(x,y,z);disc.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),new THREE.Vector3(Math.sin(angle)/w,.08,Math.cos(angle)/d).normalize());g.add(disc);}}
  }else if(a.family==='turntable'){
    cylinder(g,0,-.3,0,w/2,.5,colors.blueBrick,48);cylinder(g,0,-.02,0,w/2-.7,.12,0x414a44,48);box(g,0,.1,0,2.9,.3,w-1,colors.steel);
    for(const side of[-.755,.755])box(g,side,.29,0,.075,.075,w-1,0xb6bdb2);
  }else if(a.family==='exchange-signal'){
    g.add(new AssetFactory().signal({id:a.id,aspect:'red',aspects:3}));
  }else if(a.family==='gwr-signal-box'){
    box(g,0,1.3,0,w,2.6,d,colors.brick);box(g,0,3.6,0,w+1,2,d+1,colors.cream);
    for(let x=-w/2+.5;x<w/2;x+=1.1)for(const side of[-1,1])box(g,x,3.8,side*(d/2+.51),.8,1.3,.06,0x647f83);
    box(g,0,4.8,0,w+1.5,.5,d+1.5,colors.roof);
  }else if(a.family==='gwr-frontage'){
    if(Array.isArray(a.footprint)){
      const angle=a.angle||0,shape=new THREE.Shape();
      (a.footprint as number[][]).forEach((p,i)=>{const dx=p[0]-a.position[0],dz=p[1]-a.position[2],x=Math.cos(angle)*dx-Math.sin(angle)*dz,z=Math.sin(angle)*dx+Math.cos(angle)*dz;if(i===0)shape.moveTo(x,-z);else shape.lineTo(x,-z);});shape.closePath();
      const wall=new THREE.ExtrudeGeometry(shape,{depth:h*.64,bevelEnabled:false});wall.rotateX(-Math.PI/2);g.add(new THREE.Mesh(wall,material(colors.brick)));
      const roof=new THREE.ExtrudeGeometry(shape,{depth:.45,bevelEnabled:false});roof.rotateX(-Math.PI/2);const cap=new THREE.Mesh(roof,material(colors.roof));cap.position.y=h*.64;g.add(cap);
    }else box(g,0,h*.32,0,w,h*.64,d,colors.brick);
    for(let x=-w/2+2;x<w/2;x+=4){box(g,x,h*.3,d/2+.04,1.4,h*.37,.12,0x526667);box(g,x,h*.51,d/2+.12,1.8,.25,.28,colors.cream);}
    for(let x=-w/2;x<=w/2;x+=w/6)box(g,x,h*.4,d/2+.2,.6,h*.8,.8,colors.brick);
    if(!a.footprint){const roof=new THREE.Mesh(new THREE.CylinderGeometry(d*.63,d*.63,w+1,3),material(colors.roof));roof.rotation.z=Math.PI/2;roof.rotation.x=Math.PI/2;roof.position.y=h*.67;g.add(roof);
      for(const side of[-1,1]){box(g,0,h*.45,side*(d/2+3),w-2,.25,6,colors.cream);for(let x=-w/2+3;x<w/2;x+=5)box(g,x,h*.225,side*(d/2+5.2),.14,h*.45,.14,colors.green);}}
    const title=geometricText(a.name||'SEVERN VALLEY RAILWAY',Math.min(.5,w/((a.name?.length||21)*1.1)),colors.cream);title.position.set(0,h*.58,d/2+.2);g.add(title);
    cylinder(g,0,h*.9,0,1.8,.5,colors.cream,24).rotation.x=Math.PI/2;
  }else if(a.family==='snow-hill'){
    box(g,0,h/2,0,w,h,d,0x8a9290);for(let y=4;y<h;y+=3)for(const side of[-1,1])box(g,side*(w/2+.02),y,0,.1,1.5,d-4,0x566b73);
    for(let z=-d/2+5;z<d/2;z+=10)box(g,0,4,z,w+6,.8,1.2,0xb0b1a3);
  }else{
    // Workshop shell with genuinely open shed roads, roof lights, brick end piers.
    const roads=Math.max(2,Math.round(w/6)),pitch=w/roads;
    for(const side of[-1,1])box(g,side*(w/2-.25),h/2,0,.5,h,d,colors.blueBrick);
    for(let i=0;i<=roads;i++){const x=-w/2+i*pitch;for(const side of[-1,1])box(g,x,h/2,side*d/2,.4,h,.6,colors.brick);}
    box(g,0,h-.5,0,w,.8,d+1,colors.roof);
    for(let z=-d/2+5;z<d/2;z+=12)box(g,0,h-.04,z,w-2,.1,2,0xa1b1ae);
    for(const side of[-1,1]){box(g,0,h-.8,side*(d/2+.04),w,1.3,.4,colors.cream);for(let i=0;i<roads;i++)box(g,-w/2+(i+.5)*pitch,h-1,side*(d/2+.3),pitch-.7,.2,.25,0xd2b14a);}
  }
  g.position.fromArray(a.position);g.rotation.y=a.angle||0;g.userData={family:a.family,id:a.id,generatorVersion:1,source:a.source,confidence:a.confidence};return g;
}

/** Bridge decks, arch bays and bores share exactly the track's curved profile. */
export function makeRailCivil(track:{id:string;points:V3[];metadata:any},ground:(x:number,z:number)=>number):THREE.Group {
  const g=new THREE.Group(),path=new CurvePath(track.points),m=track.metadata;
  if(m.tunnel){
    const radius=m.mode==='tram'?2.3:2.7,cy=2.3;
    for(let s=0;s<path.length;s+=4){const end=Math.min(path.length,s+4),p=path.sample((s+end)/2),vertices:number[]=[];
      const at=(ss:number,theta:number)=>{const q=path.sample(ss,Math.cos(theta)*radius);return [q.position[0],q.position[1]+cy+Math.sin(theta)*radius,q.position[2]];};
      for(let i=0;i<14;i++){const a=i*Math.PI/14,b=(i+1)*Math.PI/14;vertices.push(...at(s,a),...at(end,a),...at(end,b),...at(s,a),...at(end,b),...at(s,b));}
      const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geo.computeVertexNormals();g.add(new THREE.Mesh(geo,new THREE.MeshStandardMaterial({color:0x66635b,side:THREE.DoubleSide,roughness:1})));
      for(const side of[-1,1]){const q=path.sample((s+end)/2,side*radius);const wall=box(g,q.position[0],q.position[1]+cy/2,q.position[2],.4,cy,end-s,colors.blueBrick);wall.rotation.y=p.yaw;}}
    for(const s of[0,path.length]){const p=path.sample(s),portal=new AssetFactory().tunnel({id:track.id+'/portal/'+s,width:radius*2,height:radius+cy,length:1.6});portal.position.fromArray(p.position);portal.rotation.y=p.yaw;g.add(portal);}
  }else if(m.bridge){
    const falling=m.name==='Falling Sands Viaduct',masonry=falling||m.masonry,width=Number(m.width)||5.4,archCount=falling?7:m.clearSpan?1:Math.max(1,Math.round(path.length/(masonry?14:18)));
    for(let s=0;s<path.length;s+=4){const e=Math.min(path.length,s+4),p=path.sample((s+e)/2),deck=box(g,p.position[0],p.position[1]-.85,p.position[2],width,.6,e-s+.04,masonry?colors.brick:colors.steel);deck.rotation.y=p.yaw;
      for(const side of[-1,1]){const q=path.sample((s+e)/2,side*(width/2)),parapet=box(g,q.position[0],q.position[1]+.25,q.position[2],.32,1.3,e-s+.04,masonry?colors.brick:colors.steel);parapet.rotation.y=p.yaw;}}
    for(let i=0;i<=archCount;i++){const p=path.sample(path.length*i/archCount),base=ground(p.position[0],p.position[2]),height=Math.max(.2,p.position[1]-1.15-base),pier=box(g,p.position[0],base+height/2,p.position[2],width+.2,height,masonry?2:1.2,colors.brick);pier.rotation.y=p.yaw;}
    if(masonry)for(let i=0;i<archCount;i++){const span=path.length/archCount-2,p=path.sample(path.length*(i+.5)/archCount);for(let j=0;j<12;j++){const angle=(j+.5)*Math.PI/12,arc=box(g,p.position[0]+Math.sin(p.yaw)*Math.cos(angle)*span/2,p.position[1]-span/2-1+Math.sin(angle)*span/2,p.position[2]+Math.cos(p.yaw)*Math.cos(angle)*span/2,width,.9,span*Math.PI/24+.1,colors.brick);arc.rotation.set(0,p.yaw,0);arc.rotateX(angle-Math.PI/2);}}
  }
  g.userData={id:track.id+'/civil',family:m.tunnel?'tunnel':'rail-bridge'};return g;
}
