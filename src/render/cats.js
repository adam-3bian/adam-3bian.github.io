import * as THREE from 'three';
import {batchRigidParts} from './rigid-batch.js';

const boxGeometry=new THREE.BoxGeometry(1,1,1),headGeometry=new THREE.IcosahedronGeometry(1,1),earGeometry=new THREE.ConeGeometry(1,1,3),cylinderGeometry=new THREE.CylinderGeometry(1,1,1,6),materials=new Map();
const material=colour=>{if(!materials.has(colour))materials.set(colour,new THREE.MeshStandardMaterial({color:colour,roughness:.9,flatShading:true}));return materials.get(colour);};
const hash=s=>{let n=2166136261;for(const c of String(s)){n^=c.charCodeAt(0);n=Math.imul(n,16777619);}return n>>>0;};
function part(parent,name,geometry,colour,position,scale){const m=new THREE.Mesh(geometry,material(colour));m.name=name;m.position.fromArray(position);m.scale.fromArray(scale);parent.add(m);return m;}
function limb(parent,name,colour,x,y,z,length,width){const pivot=new THREE.Group();pivot.name=name;pivot.position.set(x,y,z);parent.add(pivot);part(pivot,`${name}/cloth`,boxGeometry,colour,[0,-length/2,0],[width,length,width]);return pivot;}
function leg(parent,name,colour,x){const thigh=limb(parent,name,colour,x,.76,0,.28,.17),knee=limb(thigh,`${name}-knee`,colour,0,-.28,0,.36,.16);part(knee,'shoe',boxGeometry,0x303735,[0,-.42,-.065],[.20,.12,.32]);return{thigh,knee};}
export const CAT_COATS=Object.freeze(['SOLID','TABBY','TUXEDO','TORTOISESHELL','CALICO','BICOLOUR','POINTED','GINGER','GREY','BLACK','WHITE']);
export const CAT_CLOTHING=Object.freeze(['CASUAL','COAT','JACKET','BUSINESS_WEAR','RAILWAY_UNIFORM','HIGH_VIS_VEST','MAINTENANCE_OVERALLS','HERITAGE_UNIFORM','SCARF','BACKPACK','SHOULDER_BAG','LUGGAGE']);

/** Upright, clothed feline model. Geometry/materials are shared across crowds. */
export function makeCat(config={}){
    const id=config.id||'cat/prototype',seed=config.seed??hash(id),role=config.role||'COMMUTER',staff=/STAFF|ATTENDANT|DISPATCHER|WORKER/.test(role),g=new THREE.Group();
    const clothing=config.clothing||(role==='MAINTENANCE_WORKER'?'MAINTENANCE_OVERALLS':role==='HERITAGE_RAILWAY_STAFF'?'HERITAGE_UNIFORM':staff?'RAILWAY_UNIFORM':role==='COMMUTER'?'BUSINESS_WEAR':'JACKET');if(!CAT_CLOTHING.includes(clothing))throw Error(`Unknown cat clothing ${clothing}`);
    const pattern=config.coatPattern||CAT_COATS[seed%CAT_COATS.length];if(!CAT_COATS.includes(pattern))throw Error(`Unknown cat coat ${pattern}`);
    const coats={SOLID:0x9c745b,TABBY:0x9f8b75,TUXEDO:0x30363c,TORTOISESHELL:0x48413d,CALICO:0xe4dac7,BICOLOUR:0x707981,POINTED:0xd5c9a9,GINGER:0xd19555,GREY:0x727c81,BLACK:0x2b3035,WHITE:0xece7d8},coat=coats[pattern],clothes=config.color??(role==='MAINTENANCE_WORKER'?0xe08f31:staff?0x4f665d:[0x61738a,0x7a5c72,0x586d5c,0x665d55][(seed>>>3)%4]),trousers=0x343c48;
    const body=new THREE.Group();body.name='body';g.add(body);
    const left=leg(body,'left-leg',trousers,-.12),right=leg(body,'right-leg',trousers,.12),leftLeg=left.thigh,rightLeg=right.thigh,leftKnee=left.knee,rightKnee=right.knee;
    part(body,'jacket',boxGeometry,clothes,[0,1.03,0],[.46,.56,.29]);
    part(body,'shirt',boxGeometry,0xe9dfc9,[0,1.18,-.151],[.12,.24,.025]);
    const leftArm=limb(body,'left-arm',clothes,-.29,1.28,0,.48,.13),rightArm=limb(body,'right-arm',clothes,.29,1.28,0,.48,.13);
    for(const arm of [leftArm,rightArm])part(arm,'paw',headGeometry,coat,[0,-.51,0],[.09,.1,.085]);
    const head=new THREE.Group();head.name='head';head.position.y=1.49;body.add(head);
    part(head,'feline-head',headGeometry,coat,[0,0,0],[.225,.23,.19]);
    for(const side of [-1,1]){
        const ear=part(head,'ear',earGeometry,coat,[side*.15,.23,.015],[.11,.22,.10]);ear.rotation.z=-side*.18;
        part(head,'inner-ear',earGeometry,0xc48d8b,[side*.15,.235,-.055],[.065,.13,.025]);
        part(head,'muzzle',headGeometry,0xe6d8b7,[side*.068,-.075,-.176],[.09,.065,.065]);
        part(head,'eye',headGeometry,0xc9ce8a,[side*.09,.035,-.169],[.048,.052,.025]);
        part(head,'pupil',boxGeometry,0x1c2925,[side*.09,.038,-.192],[.014,.065,.008]);
        for(let n=0;n<3;n++){const whisker=part(head,'whisker',boxGeometry,0xece9d9,[side*.19,-.075+n*.024,-.19],[.17,.009,.009]);whisker.rotation.z=side*(n-1)*.17;}
        if(['TABBY','GINGER'].includes(pattern))for(let n=0;n<2;n++){const stripe=part(head,'tabby-stripe',boxGeometry,0x574735,[side*.165,-.015+n*.085,-.11],[.065,.025,.08]);stripe.rotation.z=side*.25;}
    }
    part(head,'nose',headGeometry,0x65504c,[0,-.045,-.23],[.035,.025,.026]);
    const tail=new THREE.Group();tail.name='tail';tail.position.set(0,.79,.13);body.add(tail);
    const lower=part(tail,'tail-base',cylinderGeometry,coat,[0,-.13,.19],[.055,.47,.055]);lower.rotation.x=-.8;
    const tip=part(tail,'tail-tip',cylinderGeometry,coat,[0,-.04,.41],[.05,.30,.05]);tip.rotation.x=.5;
    if(staff){for(const y of [.94,1.16])part(body,'reflective-band',boxGeometry,0xece7a0,[0,y,-.155],[.46,.045,.025]);part(head,'uniform-cap',boxGeometry,0x4b5b5d,[0,.17,-.07],[.39,.055,.28]);}
    if(role==='PASSENGER_WITH_LUGGAGE'||clothing==='LUGGAGE'||seed%4===0){const bag=part(rightArm,'luggage',boxGeometry,0x69594e,[.07,-.70,-.03],[.28,.36,.22]);bag.userData.luggage=true;}
    if(role==='LEISURE_TRAVELLER'||clothing==='BACKPACK')part(body,'backpack',boxGeometry,0x9d7552,[0,1.05,.21],[.30,.4,.18]);
    if(clothing==='COAT')part(body,'coat-skirt',boxGeometry,clothes,[0,.74,0],[.50,.35,.32]);
    if(clothing==='CASUAL')part(body,'jumper-stripe',boxGeometry,0xd5bd91,[0,1.04,-.16],[.44,.075,.025]);
    if(clothing==='SCARF'){part(body,'scarf-collar',boxGeometry,0xa95643,[0,1.33,0],[.29,.12,.32]);part(body,'scarf-end',boxGeometry,0xa95643,[-.10,1.15,-.19],[.09,.32,.04]);}
    if(clothing==='SHOULDER_BAG'){const strap=part(body,'bag-strap',boxGeometry,0x987b59,[0,1.03,-.18],[.055,.61,.035]);strap.rotation.z=.55;part(body,'shoulder-bag',boxGeometry,0x987b59,[.27,.75,0],[.25,.3,.16]);}
    if(clothing==='HIGH_VIS_VEST'){part(body,'high-vis-front',boxGeometry,0xe8da42,[0,1.03,-.165],[.46,.52,.025]);for(const x of [-.15,.15])part(body,'reflective-strap',boxGeometry,0xecead6,[x,1.1,-.183],[.045,.35,.025]);}
    if(clothing==='MAINTENANCE_OVERALLS'){part(body,'overall-bib',boxGeometry,0x48677c,[0,1.02,-.17],[.33,.42,.035]);for(const x of [-.16,.16])part(body,'overall-strap',boxGeometry,0x48677c,[x,1.24,-.17],[.065,.18,.035]);}
    if(clothing==='HERITAGE_UNIFORM'){part(body,'waistcoat',boxGeometry,0x5d4e40,[0,1.03,-.17],[.37,.45,.035]);for(const y of [.91,1.04,1.17])part(body,'waistcoat-button',headGeometry,0xcbb276,[0,y,-.198],[.018,.018,.012]);}
    if(clothing==='RAILWAY_UNIFORM')for(const x of [-.16,.16])part(body,'epaulette',boxGeometry,0xd6d1b1,[x,1.31,0],[.13,.035,.25]);
    const rig={body,head,leftLeg,rightLeg,leftKnee,rightKnee,leftArm,rightArm,tail};
    if(['TUXEDO','BICOLOUR','CALICO'].includes(pattern)){part(head,'white-blaze',headGeometry,0xeee7d9,[0,-.02,-.185],[.045,.12,.027]);part(tail,'white-tail-tip',headGeometry,0xeee7d9,[0,.09,.48],[.055,.08,.055]);}
    if(['CALICO','TORTOISESHELL'].includes(pattern)){part(head,'ginger-patch',headGeometry,0xb47f4e,[-.13,.07,-.085],[.105,.15,.13]);part(head,'dark-patch',headGeometry,0x40423e,[.14,-.03,-.09],[.09,.09,.11]);}
    if(pattern==='POINTED')part(head,'pointed-mask',headGeometry,0x776356,[0,-.025,-.14],[.17,.13,.065]);
    if(clothing==='BUSINESS_WEAR')part(body,'tie',boxGeometry,0x485469,[0,1.1,-.171],[.045,.25,.025]);
    if(role==='MAINTENANCE_WORKER')part(head,'hard-hat',headGeometry,0xe9be4d,[0,.17,0],[.245,.13,.22]);
    if(role==='CHILD_PASSENGER')g.scale.setScalar(.78);
    Object.assign(g.userData,{id,family:'anthropomorphic-cat',species:'ANTHROPOMORPHIC_CAT',role,coatPattern:pattern,clothing,seed,character:true,supportAnchors:[[0,0,0]],rig,animationState:'WAIT'});
    if(config.batch!==false)for(const [name,group] of Object.entries(rig))batchRigidParts(group,`cat/${pattern}/${clothes}/${role}/${clothing}/${role==='PASSENGER_WITH_LUGGAGE'||seed%4===0}/${name}`);
    animateCat(g,0,'WAIT');return g;
}

export const CAT_ANIMATIONS=Object.freeze(['IDLE','WALK','TURN','SIT','STAND_UP','WAIT','LOOK_AROUND','CARRY_LUGGAGE','GESTURE','STAFF_SIGNAL','BOARDING','ALIGHTING']);
export function animateCat(cat,time,state='WAIT',speed=0){
    const rig=cat.userData.rig;if(!rig)return;
    if(!CAT_ANIMATIONS.includes(state))throw new Error(`Unknown cat animation ${state}`);
    const phase=(cat.userData.seed%997)/997*Math.PI*2,t=time+phase,walking=['WALK','CARRY_LUGGAGE','BOARDING','ALIGHTING'].includes(state),stride=walking?Math.sin(t*(5+Math.min(2,speed)))*.42:0;
    rig.body.position.y=walking?Math.abs(Math.sin(t*6))*.022:Math.sin(t*1.7)*.006;
    if(cat.userData.animationState!==state)cat.userData.animationStarted=time;
    rig.body.rotation.set(0,0,0);rig.leftLeg.rotation.x=stride;rig.rightLeg.rotation.x=-stride;rig.leftArm.rotation.x=-stride*.7;rig.rightArm.rotation.x=state==='CARRY_LUGGAGE'?.12:stride*.7;rig.leftKnee.rotation.x=rig.rightKnee.rotation.x=0;rig.leftKnee.scale.y=rig.rightKnee.scale.y=1;
    rig.head.rotation.y=Math.sin(t*.65)*(['LOOK_AROUND','TURN'].includes(state)?.65:.13);rig.head.rotation.x=Math.sin(t*.9)*.04;rig.tail.rotation.z=Math.sin(t*1.3)*.22;
    if(state==='TURN'){const u=Math.max(0,Math.min(1,(time-(cat.userData.animationStarted??time))/.8));rig.body.rotation.y=Math.PI*u*u*(3-2*u);}
    if(state==='SIT'||state==='STAND_UP'){const blend=state==='SIT'?1:1-Math.min(1,(time-(cat.userData.animationStarted||0))/.8);rig.body.position.y=-.22*blend;rig.leftLeg.rotation.x=rig.rightLeg.rotation.x=Math.PI/2*blend;rig.leftKnee.rotation.x=rig.rightKnee.rotation.x=-Math.PI/2*blend;rig.leftKnee.scale.y=rig.rightKnee.scale.y=1+blend/7;}
    if(state==='GESTURE'||state==='STAFF_SIGNAL')rig.rightArm.rotation.x=-1.7+Math.sin(t*2)*.25;
    cat.userData.animationState=state;
}
