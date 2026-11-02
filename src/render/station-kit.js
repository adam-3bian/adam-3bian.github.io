import * as THREE from 'three';
const boxGeometry=new THREE.BoxGeometry(1,1,1),materials=new Map();
const mat=c=>{if(!materials.has(c))materials.set(c,new THREE.MeshStandardMaterial({color:c,roughness:.88}));return materials.get(c);};
function box(parent,c,x,y,z,w,h,d){const mesh=new THREE.Mesh(boxGeometry,mat(c));mesh.position.set(x,y,z);mesh.scale.set(w,h,d);parent.add(mesh);return mesh;}
function beam(parent,c,a,b,width){const u=new THREE.Vector3(...a),v=new THREE.Vector3(...b),m=box(parent,c,0,0,0,width,u.distanceTo(v),width);m.position.copy(u).add(v).multiplyScalar(.5);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.sub(u).normalize());return m;}
/** Reusable architectural sections. Position and variant are authored in JSON. */
export function makeStationCanopy({id,form='FLAT',width=3,length=8,height=3.3,frame=0x64776c,roof=0x66736d,trim=0xc3c1ad,postBases=[0,0,0,0],glazing=false,valance=false}){
 const g=new THREE.Group(),supports=[];let n=0;
 for(const x of [-width/2+.35,width/2-.35])for(const z of [-length/2+.5,length/2-.5]){const y=postBases[n++]||0;box(g,frame,x,(y+height-.1)/2,z,.12,height-.1-y,.12);supports.push([x,y,z]);beam(g,frame,[x,height-.85,z],[0,height-.16,z],.075);}
 if(form==='GABLE'||form==='BUTTERFLY'||form==='CANTILEVER'){
  const slope=form==='BUTTERFLY'?-.15:form==='CANTILEVER'?.07:.22;
  for(const side of [-1,1]){const panel=box(g,roof,side*width/4,height+Math.abs(slope)*width/4,0,width/2+.08,.15,length);panel.rotation.z=-side*slope;}
  box(g,trim,0,height+Math.abs(slope)*width/2,0,.1,.12,length);
 }else box(g,roof,0,height,0,width,.18,length);
 for(const x of [-width/2,width/2]){box(g,trim,x,height-.12,0,.1,.25,length);if(valance)for(let z=-length/2+.13;z<length/2;z+=.26){const m=box(g,trim,x,height-.29,z,.07,.22,.20);m.rotation.x=Math.PI/4;}}
 if(glazing){const x=width/2-.35;box(g,0x8ea9aa,x,1.22,0,.035,1.85,length-1.2);for(let z=-length/2+.6;z<=length/2-.5;z+=1.5)box(g,frame,x,1.25,z,.075,2.05,.075);box(g,frame,x,.30,0,.08,.1,length-1.2);}
 if(form==='CONCRETE'){for(const z of [-length/2+.5,length/2-.5])box(g,0xa3a7a0,0,1.2,z,width-.7,2.4,.16);}
 g.userData={id,family:'station-canopy',supportAnchors:supports,confidence:'VISUAL_APPROXIMATION',source:'world-source/stations.json'};return g;
}
