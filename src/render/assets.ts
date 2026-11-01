import * as THREE from 'three';

/** All dimensions are metres. Forward is local -Z; ground/railhead is local Y=0. */
export type Aspect = 'red' | 'yellow' | 'doubleYellow' | 'green' | 'dark';
type Config = Record<string, any>;
const C = {
  steel: 0x666b69, dark: 0x242d2e, rail: 0x9ca3a1, sleeper: 0x665c4f,
  brick: 0x9d5c45, brown: 0x785449, cream: 0xe8dcc1, stone: 0xb3aaa0,
  roof: 0x525655, white: 0xe9e8dc, glass: 0x3c5660, purple: 0x635776,
  yellow: 0xeacb4c, orange: 0xc47c35, green: 0x3b6652, leaf: 0x657d4b,
  red: 0xc44e43, ballast: 0x8b887c, concrete: 0xa8a69a, black: 0x172123,
};
const BOX = new THREE.BoxGeometry(1, 1, 1);
const CYLINDER = new THREE.CylinderGeometry(1, 1, 1, 8);
const CONE = new THREE.ConeGeometry(1, 1, 6);
const LEAF = new THREE.IcosahedronGeometry(1, 0);
const PLATFORM_HEIGHT = .915;
const materialCache = new Map<string, THREE.MeshStandardMaterial>();

function mat(color: number, emissive = false): THREE.MeshStandardMaterial {
  const key = `${color}/${emissive}`;
  let value = materialCache.get(key);
  if (!value) {
    value = new THREE.MeshStandardMaterial({ color, roughness: .86, metalness: .04,
      flatShading: true, emissive: emissive ? color : 0, emissiveIntensity: emissive ? .9 : 0 });
    materialCache.set(key, value);
  }
  return value;
}
function mesh(geometry: THREE.BufferGeometry, color: number, parent: THREE.Object3D,
  x: number, y: number, z: number, sx = 1, sy = 1, sz = 1, emissive = false): THREE.Mesh {
  const result = new THREE.Mesh(geometry, mat(color, emissive));
  result.position.set(x, y, z); result.scale.set(sx, sy, sz);
  result.castShadow = true; result.receiveShadow = true; parent.add(result); return result;
}
function box(parent: THREE.Object3D, color: number, x: number, y: number, z: number,
  w: number, h: number, d: number, emissive = false): THREE.Mesh {
  return mesh(BOX, color, parent, x, y, z, w, h, d, emissive);
}
function cylinder(parent: THREE.Object3D, color: number, x: number, y: number, z: number,
  radius: number, height: number): THREE.Mesh {
  return mesh(CYLINDER, color, parent, x, y, z, radius, height, radius);
}
function beam(parent: THREE.Object3D, color: number, a: THREE.Vector3, b: THREE.Vector3,
  width: number, depth = width): THREE.Mesh {
  const delta = b.clone().sub(a); const result = box(parent, color,
    (a.x + b.x) / 2, (a.y + b.y) / 2, (a.z + b.z) / 2, width, delta.length(), depth);
  result.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), delta.normalize());
  return result;
}
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
function seedRandom(seed: number) {
  let n = seed | 0; return () => { n = Math.imul(n ^ n >>> 15, 1 | n); n ^= n + Math.imul(n ^ n >>> 7, 61 | n); return ((n ^ n >>> 14) >>> 0) / 4294967296; };
}
function finish(group: THREE.Group, family: string, config: Config, supports: number[][] = [[0, 0, 0]]) {
  group.updateMatrixWorld(true);
  const bounds = new THREE.Box3().setFromObject(group);
  const rootId=String(config.id??`${family}/prototype/${config.seed??1}`);let component=0;
  group.traverse(node=>{if(node===group)return;node.userData.componentId=`${rootId}/component/${component++}`;node.userData.instanceRootId=rootId;});
  Object.assign(group.userData, { family, generator: 'procedural-assets-v1', id: rootId, requiresWorldInstanceId:config.id===undefined,
    seed: config.seed ?? 1, source: config.source ?? 'parameterised approximation; see route manifest',
    confidence: config.confidence ?? 'inferred form', bounds: { min: bounds.min.toArray(), max: bounds.max.toArray() },
    supportAnchors: supports, collision: 'compound bounds; route clearance is authoritative', textureCount: 0 });
  return group;
}

const roofGeometry = (() => {
  const shape = new THREE.Shape(); shape.moveTo(-.5, 0); shape.lineTo(.5, 0); shape.lineTo(0, 1); shape.closePath();
  const geo = new THREE.ExtrudeGeometry(shape, { depth: 1, bevelEnabled: false, steps: 1 });
  geo.translate(0, 0, -.5); return geo;
})();
const rampGeometry = (() => {
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute([
    -.5,0,-.5, .5,0,-.5, -.5,0,.5, .5,0,.5, -.5,1,-.5, .5,1,-.5,
  ],3));
  geo.setIndex([0,1,5,0,5,4,0,2,3,0,3,1,4,5,3,4,3,2,0,4,2,1,3,5]);
  const flat=geo.toNonIndexed();flat.computeVertexNormals();geo.dispose();return flat;
})();

// Five-by-seven block glyphs become one solid-colour geometry, never a texture atlas.
const GLYPHS: Record<string, string[]> = {
  A:['01110','10001','10001','11111','10001','10001','10001'],B:['11110','10001','10001','11110','10001','10001','11110'],
  C:['01111','10000','10000','10000','10000','10000','01111'],D:['11110','10001','10001','10001','10001','10001','11110'],
  E:['11111','10000','10000','11110','10000','10000','11111'],F:['11111','10000','10000','11110','10000','10000','10000'],
  G:['01111','10000','10000','10111','10001','10001','01111'],H:['10001','10001','10001','11111','10001','10001','10001'],
  I:['11111','00100','00100','00100','00100','00100','11111'],J:['00111','00010','00010','00010','10010','10010','01100'],
  K:['10001','10010','10100','11000','10100','10010','10001'],L:['10000','10000','10000','10000','10000','10000','11111'],
  M:['10001','11011','10101','10101','10001','10001','10001'],N:['10001','11001','10101','10011','10001','10001','10001'],
  O:['01110','10001','10001','10001','10001','10001','01110'],P:['11110','10001','10001','11110','10000','10000','10000'],
  Q:['01110','10001','10001','10001','10101','10010','01101'],R:['11110','10001','10001','11110','10100','10010','10001'],
  S:['01111','10000','10000','01110','00001','00001','11110'],T:['11111','00100','00100','00100','00100','00100','00100'],
  U:['10001','10001','10001','10001','10001','10001','01110'],V:['10001','10001','10001','10001','10001','01010','00100'],
  W:['10001','10001','10001','10101','10101','10101','01010'],X:['10001','10001','01010','00100','01010','10001','10001'],
  Y:['10001','10001','01010','00100','00100','00100','00100'],Z:['11111','00001','00010','00100','01000','10000','11111'],
  '0':['01110','10011','10101','10101','10101','11001','01110'],'1':['00100','01100','00100','00100','00100','00100','01110'],
  '2':['01110','10001','00001','00010','00100','01000','11111'],'3':['11110','00001','00001','01110','00001','00001','11110'],
  '4':['00010','00110','01010','10010','11111','00010','00010'],'5':['11111','10000','10000','11110','00001','00001','11110'],
  '6':['01110','10000','10000','11110','10001','10001','01110'],'7':['11111','00001','00010','00100','01000','01000','01000'],
  '8':['01110','10001','10001','01110','10001','10001','01110'],'9':['01110','10001','10001','01111','00001','00001','01110'],
  '-':['00000','00000','00000','11111','00000','00000','00000'],'.':['00000','00000','00000','00000','00000','00100','00100'],
};
export function geometricText(text: string, height = .25, color = C.white): THREE.Mesh {
  const positions: number[] = []; const normal: number[] = []; const unit = height / 7;
  const s = text.toUpperCase(); const offset = -s.length * 6 * unit / 2;
  for (let i = 0; i < s.length; i++) {
    const glyph = GLYPHS[s[i]]; if (!glyph) continue;
    for (let row = 0; row < 7; row++) for (let col = 0; col < 5; col++) if (glyph[row][col] === '1') {
      const x = offset + (i * 6 + col) * unit, y = (6 - row) * unit, w = unit * .92;
      positions.push(x,y,0, x+w,y,0, x+w,y+w,0, x,y,0, x+w,y+w,0, x,y+w,0);
      for (let k=0;k<6;k++) normal.push(0,0,1);
    }
  }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('normal', new THREE.Float32BufferAttribute(normal, 3));
  const result = new THREE.Mesh(geo, mat(color)); result.userData.geometricLettering = true; return result;
}

function railPath(parent: THREE.Object3D, points: THREE.Vector3[], color = C.rail) {
  for(let i=1;i<points.length;i++){
    const a=points[i-1],b=points[i],tangent=b.clone().sub(a).normalize(),right=new THREE.Vector3(tangent.z,0,-tangent.x).normalize(),up=tangent.clone().cross(right).normalize(),basis=new THREE.Matrix4().makeBasis(right,up,tangent),centre=a.clone().add(b).multiplyScalar(.5);
    for(const[part,width,top,depth]of[['head',.075,0,.045],['web',.025,-.045,.07],['foot',.14,-.115,.025]] as [string,number,number,number][]){
      const q=centre.clone().addScaledVector(up,top-depth/2),m=box(parent,color,q.x,q.y,q.z,width,depth,a.distanceTo(b));m.quaternion.setFromRotationMatrix(basis);m.userData.railProfile=part;
    }
  }
}
function platform(parent: THREE.Object3D, x: number, width: number, length: number, heritage = false) {
  const platformGroup=new THREE.Group();platformGroup.userData.trackPlatform={x,width,length,heritage};parent.add(platformGroup);parent=platformGroup;
  box(parent, heritage ? C.brick : C.concrete,x,.375,0,width,1.03,length);
  box(parent,0x626764,x,.90,0,width,.03,length);
  const edge = x > 0 ? x-width/2 : x+width/2;
  box(parent,C.cream,edge,.908,0,.34,.035,length);
  box(parent,C.yellow,edge+(x>0?.46:-.46),.922,0,.1,.012,length-3);
  box(parent,0xb8b19a,edge+(x>0?.7:-.7),.920,0,.24,.025,length-3);
  // Closed structural ramps connect to the platform end; no unsupported surface strip.
  for (const end of [-1,1]) {
    const wedge = mesh(rampGeometry,heritage?C.brick:C.concrete,parent,x,0,end*(length/2+2.3),width,PLATFORM_HEIGHT,4.6);
    if(end<0)wedge.rotation.y=Math.PI;
  }
}
function canopy(parent: THREE.Object3D, x: number, z: number, width: number, length: number, heritage: boolean) {
  const y = 4.0;
  box(parent,C.roof,x,y+.12,z,width,.24,length);
  box(parent,heritage?C.cream:0xb6b9b0,x,y-.06,z,width,.10,length);
  for (const side of [-1,1]) box(parent,heritage?C.cream:C.steel,x+side*(width/2-.08),y-.15,z,.13,.35,length);
  const n=Math.max(2,Math.floor(length/7));
  for(let i=0;i<=n;i++) {
    const zz=z-length/2+i*length/n;
    cylinder(parent,heritage?C.purple:C.steel,x,(y+PLATFORM_HEIGHT)/2,zz,.065,y-PLATFORM_HEIGHT);
    beam(parent,heritage?C.purple:C.steel,V(x,3.1,zz),V(x-width*.38,3.86,zz),.065);
    beam(parent,heritage?C.purple:C.steel,V(x,3.1,zz),V(x+width*.38,3.86,zz),.065);
    box(parent,C.cream,x,y-.22,zz,width-.1,.16,.16);
  }
  for (const side of [-1,1]) {
    box(parent,C.dark,x+side*width/2,y-.02,z,.11,.14,length);
    cylinder(parent,C.dark,x+side*width/2,2.35,z-length/2+.15,.045,3.15);
  }
}
function footbridge(parent: THREE.Object3D, z: number, historic: boolean, width = 16) {
  const y=6.2, d=2.2, end=width/2-.7;
  box(parent,historic?C.purple:C.steel,0,y,z,width,.35,d);
  for (const side of [-1,1]) {
    if(historic) {
      box(parent,C.purple,0,y+.17,z+side*d/2,width,.13,.12);
      box(parent,C.purple,0,y+1.18,z+side*d/2,width,.13,.12);
    } else box(parent,C.steel,0,y+.65,z+side*d/2,width,1.25,.12);
    if(historic) {
      for(let i=0;i<Math.ceil(width/.75);i++) {
        const xx=-width/2+i*.75;
        beam(parent,C.cream,V(xx,y+.17,z+side*d/2),V(xx+.72,y+1.14,z+side*d/2),.045);
        beam(parent,C.cream,V(xx,y+1.14,z+side*d/2),V(xx+.72,y+.17,z+side*d/2),.045);
      }
    }
  }
  for(const x of [-end,end]) {
    for(const zz of [z-.85,z+.85]) box(parent,historic?C.purple:C.steel,x,3.45,zz,.24,5.3,.24);
    const direction=x>0?1:-1, run=8.2, steps=22;
    const startZ=z+1.1;
    for(let i=0;i<steps;i++) {
      const top=PLATFORM_HEIGHT+(i+1)*(y-PLATFORM_HEIGHT)/steps;
      box(parent,historic?C.purple:C.concrete,x,top/2,startZ+run-i*run/steps,1.7,top,run/steps+.01);
    }
    for(const dx of [-.86,.86]) {
      beam(parent,historic?C.cream:C.steel,V(x+dx,1.8,startZ+run),V(x+dx,y+.95,startZ),.065);
      for(let i=0;i<=5;i++) {
        const t=i/5;box(parent,historic?C.cream:C.steel,x+dx,1.34+t*(y-PLATFORM_HEIGHT),startZ+run*(1-t),.06,.95,.06);
      }
    }
    void direction;
  }
  if(historic) mesh(roofGeometry,C.roof,parent,0,y+1.6,z,width+.5,.65,d+.5);
}

export class AssetFactory {
  station(config: Config): THREE.Group {
    const g=new THREE.Group();g.name=`station-${config.id ?? 'unknown'}`;
    const id=String(config.id??'').toUpperCase(), name=String(config.name??id);
    const length=Math.max(70,config.length??165), heritage=/HAG|HAGLEY|BMO|MOOR|DDG|DORRIDGE/.test(id+' '+name.toUpperCase());
    const snow=/BSW|SNOW/.test(id+' '+name.toUpperCase()), galton=/SGB|GALTON/.test(id+' '+name.toUpperCase());
    const platformWidth=snow?5:4.1, trackSpacing=config.trackSpacing??4.2, inner=trackSpacing/2+1.7;
    const centre=inner+platformWidth/2;
    platform(g,-centre,platformWidth,length,heritage); platform(g,centre,platformWidth,length,heritage);
    const canopyLength=Math.min(length*.56,heritage?80:65);
    for(const side of [-1,1]) {
      canopy(g,side*(centre+.15),-10,platformWidth+.5,snow?length:canopyLength,heritage);
      const b=this.building({width:3.5,depth:heritage?16:10,height:heritage?3.2:2.8,style:heritage?'historic':'station',seed:13});
      b.position.set(side*(inner+platformWidth+1.6),PLATFORM_HEIGHT,-15);g.add(b);
      for(let zz=-length/2+15;zz<length/2;zz+=24) {
        const lamp=this.furniture('lamp');lamp.position.set(side*(inner+platformWidth-.65),PLATFORM_HEIGHT,zz);g.add(lamp);
        const bench=this.furniture('bench');bench.position.set(side*(centre+.6),PLATFORM_HEIGHT,zz+3);bench.rotation.y=side>0?-Math.PI/2:Math.PI/2;g.add(bench);
      }
      const boardWidth=Math.min(6.8,Math.max(2.9,name.length*.15));
      box(g,heritage?C.purple:C.green,side*centre,2.3,length*.28,boardWidth,.62,.12);
      for(const xx of [-boardWidth*.4,boardWidth*.4]) box(g,C.steel,side*centre+xx,1.57,length*.28,.06,1.45,.06);
      for(const direction of [-1,1]) {
        const text=geometricText(name,Math.min(.25,boardWidth/(Math.max(name.length,1)*.9)),C.white);
        text.position.set(side*centre,2.16,length*.28+direction*.065); if(direction<0)text.rotation.y=Math.PI;g.add(text);
      }
    }
    if(config.footbridge!==false&&!/BKD|BLAKEDOWN/.test(id+' '+name.toUpperCase())) footbridge(g,-Math.min(48,length*.24),/HAG|HAGLEY/.test(id+' '+name.toUpperCase()),2*(centre+1));
    if(/SBJ|STOURBRIDGE/.test(id+' '+name.toUpperCase()) || config.platformCount>=3) {
      platform(g,-centre-5.9,2.5,85,heritage);
      box(g,C.concrete,-centre-4.35,.22,38,1.1,.5,1.3);
    }
    if(snow) {
      box(g,C.concrete,0,8.4,0,2*(centre+platformWidth),1.25,length*.86);
      for(const x of [-centre-1,centre+1])for(let z=-length*.43;z<length*.43;z+=12) box(g,C.concrete,x,4.8,z,.7,8.0,.7);
      for(const x of [-centre-5,centre+5])box(g,0x727c7e,x,13,-25,7,10,28);
    }
    if(galton) {
      box(g,C.concrete,0,7.5,-30,29,.85,8.5);
      for(const x of [-12,12])box(g,C.concrete,x,4,-30,1.2,7.8,7);
      for(const side of [-1,1])box(g,0x8eaaa2,side*8,5,-48,2.3,8,3.5);
    }
    if(/DDG|DORRIDGE/.test(id+' '+name.toUpperCase())) {
      const b=this.building({width:8,depth:22,height:5.1,style:'historic',seed:21});b.position.set(centre+6,PLATFORM_HEIGHT,-38);g.add(b);
    }
    if(/KID|KIDDERMINSTER/.test(id+' '+name.toUpperCase())) {
      const b=this.building({width:9,depth:35,height:4.2,style:'historic',seed:11});b.position.set(-centre-15,.0,-8);g.add(b);
      canopy(g,-centre-12,-5,7,42,true);
    }
    g.userData.platformEdges=[-inner,inner];g.userData.platformLength=length;g.userData.platformHeight=PLATFORM_HEIGHT;
    return finish(g,'station',config,[[-centre,0,-length/2],[centre,0,length/2]]);
  }

  building(config: Config): THREE.Group {
    const g=new THREE.Group(), w=Math.max(1,config.width??7),d=Math.max(1,config.depth??9),h=Math.max(1.2,config.height??6);
    const r=seedRandom(config.seed??1), industrial=/industrial|warehouse|shed/.test(config.style??''), historic=/historic|terrace|brick/.test(config.style??'');
    const brick=[C.brick,C.brown,0xa77c5b,0xb39b7b,0xc4b69b][Math.floor(r()*5)];
    box(g,C.concrete,0,.10,0,w+.15,.2,d+.15);box(g,industrial?0x9ca19a:brick,0,h/2+.15,0,w,h,d);
    if(industrial || config.roof==='flat') {
      box(g,C.roof,0,h+.25,0,w+.3,.22,d+.3);
      box(g,C.steel,0,h+.4,0,w*.25,.15,d*.5);
    } else {
      mesh(roofGeometry,historic?0x695b56:C.roof,g,0,h+.15,0,w+.42,Math.min(w*.38,2.7),d+.4);
      box(g,brick,w*.26,h+Math.min(w*.38,2.7)+.15,-d*.25,.55,1.05,.7);
      box(g,C.cream,w*.26,h+Math.min(w*.38,2.7)+.73,-d*.25,.65,.14,.8);
    }
    const floors=Math.min(5,Math.max(1,Math.floor(h/2.9))), cols=Math.min(8,Math.max(1,Math.floor(w/2.5)));
    for(const side of [-1,1]) {
      for(let f=0;f<floors;f++)for(let i=0;i<cols;i++) {
        const x=-w/2+(i+.5)*w/cols,y=1.6+f*Math.min(3.05,h/floors);
        box(g,C.cream,x,y,side*(d/2+.012),Math.min(1.12,w/cols*.58),1.20,.065);
        box(g,C.glass,x,y,side*(d/2+.052),Math.min(.94,w/cols*.46),1.04,.035);
      }
      const z=side*(d/2+.04);box(g,historic?C.green:C.dark,-w*.26,1.16,z,.9,2.0,.09);
      box(g,C.concrete,-w*.26,.14,z+side*.22,1.15,.26,.55);
    }
    const sideCols=Math.min(7,Math.max(1,Math.floor(d/3)));
    for(const side of [-1,1])for(let i=0;i<sideCols;i++)for(let f=0;f<floors;f++)
      box(g,C.glass,side*(w/2+.024),1.6+f*Math.min(3.05,h/floors),-d/2+(i+.5)*d/sideCols,.05,1.03,1.0);
    for(const side of [-1,1]) {
      box(g,C.dark,side*(w/2+.12),h+.08,0,.12,.12,d+.35);
      cylinder(g,C.dark,side*(w/2+.12),h/2,d/2-.12,.045,h);
    }
    return finish(g,'building',config,[[-w/2,0,-d/2],[w/2,0,-d/2],[-w/2,0,d/2],[w/2,0,d/2]]);
  }

  tree(config: Config = {}): THREE.Group {
    const g=new THREE.Group(),h=config.height??(6+(config.seed??1)%6),r=seedRandom(config.seed??7);
    cylinder(g,0x625145,0,h*.36,0,h*.037,h*.72);
    if(config.type==='conifer') {
      for(let i=0;i<3;i++)mesh(CONE,0x425f4a,g,0,h*(.48+i*.17),0,h*(.26-i*.045),h*.55,h*(.26-i*.045));
    } else {
      mesh(LEAF,[C.leaf,0x79824b,0x9c9b5c,0x576e49][(config.seed??1)%4],g,0,h*.7,0,h*.31,h*.34,h*.29);
      for(let i=0;i<2;i++)mesh(LEAF,i?0x73834e:0x536c48,g,(r()-.5)*h*.33,h*(.56+r()*.22),(r()-.5)*h*.3,h*.24,h*.26,h*.23);
    }
    return finish(g,'vegetation',config,[[0,0,0]]);
  }

  signal(config: Config = {}): THREE.Group {
    const g=new THREE.Group(),height=config.height??4.6;
    if(config.gantry) {
      for(const side of [-1,1])box(g,C.steel,side*6.5,height*.6,0,.28,height*1.2,.28);
      box(g,C.steel,0,height*1.2,0,13.4,.32,.5);
      for(let i=-6;i<6;i+=1.3)beam(g,C.steel,V(i,height*1.2-.3,0),V(i+1.3,height*1.2+.3,0),.08);
    } else {
      cylinder(g,C.steel,0,height/2-.35,0,.075,height-.7);
      box(g,C.concrete,0,-.08,0,.55,.25,.55);
      for(let y=.35;y<height-.8;y+=.38)box(g,C.steel,.21,y,-.12,.30,.032,.06);
      for(const x of [.07,.36])box(g,C.steel,x,(height-.7)/2,-.12,.035,height-.7,.035);
    }
    const headY=height-.35;
    box(g,C.black,0,headY,0,.58,1.3,.23);
    const lenses:Record<string,THREE.Mesh[]>={red:[],yellow:[],green:[],doubleYellow:[]};
    const values:[string,number,number][]=[['red',headY-.42,0xf04432],['yellow',headY-.08,0xffc329],['green',headY+.26,0x4cdb8b]];
    if(config.aspects===4 || config.fourAspect)values.push(['doubleYellow',headY+.60,0xffc329]);
    for(const [key,y,color] of values) {
      const lens=mesh(CYLINDER,color,g,0,y,.145,.105,.055,.105,true);lens.rotation.x=Math.PI/2;
      lens.material=new THREE.MeshStandardMaterial({color:0x172522,emissive:color,emissiveIntensity:0,roughness:.4});
      lenses[key].push(lens);box(g,C.black,0,y+.115,.18,.29,.045,.3);
    }
    box(g,C.white,0,height-1.54,.12,.48,.28,.03);
    const text=geometricText(String(config.id??'S').slice(-5),.115,C.black);text.position.set(0,height-1.60,.14);g.add(text);
    if(config.indicator) {
      box(g,C.black,.35,height+.65,0,.9,.25,.2);
      for(let i=0;i<5;i++)mesh(CYLINDER,C.white,g,-.01+i*.15,height+.65+i*.09,.15,.035,.035,.035,true).rotation.x=Math.PI/2;
    }
    g.userData.lenses=lenses;setSignalAspect(g,config.aspect??'red');return finish(g,'signal',config);
  }

  turnout(config: Config = {}): THREE.Group {
    const g=new THREE.Group(),length=config.length??32,hand=config.hand==='left'?-1:typeof config.hand==='number'?config.hand:1,gauge=1.435,railHeadWidth=.075,railCentre=(gauge+railHeadWidth)/2;
    for(let i=0;i<=Math.ceil(length/.64);i++) {
      const s=Math.min(length,i*.64),t=s/length,offset=hand*3.8*t*t;
      box(g,C.ballast,offset/2,-.465,-s,3.65+Math.abs(offset),.35,.88);
      box(g,C.sleeper,offset/2,-.215,-s,2.65+Math.abs(offset),.15,.24);
    }
    for(const side of [-1,1])railPath(g,[V(side*railCentre,0,0),V(side*railCentre,0,-length)]);
    for(const side of [-1,1]) {
      const pts=[];for(let i=5;i<=32;i++){const t=i/32,dx=hand*7.6*t,n=Math.hypot(length,dx);pts.push(V(hand*3.8*t*t+side*railCentre*length/n,0,-length*t+side*railCentre*dx/n));}
      railPath(g,pts);
    }
    const blades:THREE.Mesh[]=[];
    for(const side of [-1,1]) {
      const closedCentre=side*(gauge/2-.045/2),blade=box(g,C.rail,closedCentre,-.06,-5,.045,.12,9.6);blade.userData.side=side;blade.userData.baseX=closedCentre;blade.userData.stockCentreX=side*railCentre;blades.push(blade);
    }
    // Frog nose and guard rails are distinct solid rail pieces, not painted markings.
    const frogT=Math.sqrt((gauge+railHeadWidth)/3.8),frog=box(g,C.rail,hand*railCentre,-.07,-length*frogT,.10,.14,1.9);frog.rotation.y=-hand*Math.atan(7.6*frogT/length);
    for(const x of [-.65,.65])box(g,C.rail,x,-.06,-length*frogT,.055,.12,3.7);
    box(g,C.dark,hand*1.8,-.02,-3.0,.7,.3,.45);box(g,C.steel,hand*.5,-.06,-3.0,2.4,.055,.06);
    g.userData.blades=blades;g.userData.gauge=gauge;g.userData.railHeadWidth=railHeadWidth;g.userData.stockRailCentres=[-railCentre,railCentre];g.userData.hand=hand;g.userData.routeEnds={normal:[0,0,-length],reverse:[hand*3.8,0,-length]};
    setTurnoutState(g,config.state==='reverse'?1:0);return finish(g,'turnout',config);
  }

  bridge(config: Config = {}): THREE.Group {
    const g=new THREE.Group(),width=config.width??9,length=config.length??18,height=config.height??6,type=String(config.type??'road');
    box(g,type==='masonry'?C.brick:C.concrete,0,height-.42,0,width,.84,length);
    box(g,type==='rail'?C.ballast:0x686b67,0,height+.01,0,width-.45,.10,length);
    for(const side of [-1,1]) {
      box(g,type==='masonry'?C.brick:C.steel,side*(width/2-.13),height+.55,0,.28,1.2,length);
      box(g,C.stone,side*(width/2-.13),height+1.18,0,.35,.13,length);
      box(g,type==='masonry'?C.brick:C.concrete,0,(height-.84)/2,side*(length/2-.65),width+1,height-.84,1.3);
      for(const x of [-width/2,width/2])box(g,C.concrete,x,(height-.84)/2,side*(length/2+.8),.7,height-.84,2.6);
    }
    if(type==='rail' || type==='girder')for(const x of [-width/2+.5,width/2-.5]) {
      box(g,C.steel,x,height-.9,0,.28,.9,length-2);
      for(let i=0;i<length-2;i+=2)beam(g,C.steel,V(x,height-1.3,-length/2+1+i),V(x,height-.5,-length/2+3+i),.07);
    }
    g.userData.deckHeight=height;g.userData.opening={width:width-1,height:height-.84,length:length-2.6};
    return finish(g,'bridge',config,[[0,0,-length/2],[0,0,length/2]]);
  }

  tunnel(config: Config = {}): THREE.Group {
    const g=new THREE.Group(),w=config.width??8.6,h=config.height??6.5,length=config.length??60,thickness=.5;
    const ring=(width:number,height:number,wall:number,depth:number)=> {
      const r=width/2,cy=height-r,shape=new THREE.Shape();
      shape.moveTo(-r-wall,-.7);shape.lineTo(r+wall,-.7);shape.lineTo(r+wall,cy);shape.absarc(0,cy,r+wall,0,Math.PI,false);shape.closePath();
      const hole=new THREE.Path();hole.moveTo(-r,-.45);hole.lineTo(-r,cy);hole.absarc(0,cy,r,Math.PI,0,true);hole.lineTo(r,-.45);hole.closePath();shape.holes.push(hole);
      const geo=new THREE.ExtrudeGeometry(shape,{depth,steps:1,bevelEnabled:false,curveSegments:10});geo.translate(0,0,-depth/2);return geo;
    };
    mesh(ring(w,h,thickness,length),0x6c685f,g,0,0,0);
    for(const side of [-1,1]) {
      mesh(ring(w,h,1.4,1.2),C.brick,g,0,0,side*length/2);
      box(g,C.stone,0,h+1.18,side*length/2,w+3.2,.22,1.55);
      for(const x of [-w/2-1.3,w/2+1.3])box(g,C.brick,x,2.7,side*length/2,1.5,6.8,1.5);
    }
    for(const side of [-1,1])box(g,0x77766c,side*(w/2-.3),-.28,0,.34,.25,length);
    g.userData.clearOpening={width:w,height:h,length};return finish(g,'tunnel',config,[[-w/2,0,0],[w/2,0,0]]);
  }

  roadVehicle(config: Config = {}): THREE.Group {
    const g=new THREE.Group(),kind=String(config.kind??'car').toLowerCase(),bus=/bus|coach/.test(kind),lorry=/lorry|truck|hgv/.test(kind),van=kind==='van';
    if(lorry){
      const color=config.color??0xd2d0bf;
      box(g,C.dark,0,.59,0,2.05,.32,9.8);box(g,color,0,1.72,-3.64,2.42,2.02,2.72);box(g,C.roof,0,2.82,-3.64,2.44,.20,2.74);
      box(g,0xc6c8be,0,2.11,1.2,2.45,2.7,7.4);box(g,C.steel,0,.76,1.2,2.5,.16,7.5);
      box(g,C.glass,0,2.20,-5.018,2.08,.90,.045);box(g,C.dark,0,1.21,-5.025,1.6,.34,.06);
      for(const side of [-1,1]){
        box(g,C.glass,side*1.225,2.18,-3.7,.035,.87,1.9);box(g,C.dark,side*1.43,2.12,-4.75,.15,.28,.14);
        box(g,0xece6c8,side*.87,1.03,-5.04,.34,.22,.045,true);box(g,0xc44b43,side*.94,.92,4.94,.28,.18,.04,true);
        box(g,C.steel,side*.59,2.08,4.915,1.14,2.42,.025);box(g,C.dark,side*.10,1.9,4.94,.045,.75,.035);
      }
      for(const z of [-3.60,2.85,4.02])for(const x of [-1.10,1.10]){const wheel=cylinder(g,C.black,x,.48,z,.48,.28);wheel.rotation.z=Math.PI/2;const hub=cylinder(g,C.steel,x*1.02,.48,z,.24,.29);hub.rotation.z=Math.PI/2;}
      box(g,C.steel,0,.63,-5.05,2.46,.24,.22);box(g,C.yellow,0,.94,4.94,.45,.14,.035);
      const result=finish(g,'road-vehicle',{...config,kind:'rigid-lorry'});const b=result.userData.bounds;result.userData.vehicleDimensions={length:b.max[2]-b.min[2],width:b.max[0]-b.min[0],height:b.max[1]};return result;
    }
    const length=bus?10.8:lorry?10:van?5.4:4.5,width=bus||lorry?2.45:1.8,height=bus?3.05:lorry?3.5:van?2.5:1.55;
    const color=config.color??[0xa45848,0x67808b,0xb5b7a9,0xeee9dc,0x414b51][(config.seed??1)%5];
    box(g,C.dark,0,.45,0,width*.86,.25,length*.85);
    box(g,color,0,height*.48+.17,0,width,height*.55,length);
    box(g,color,0,height*.8,lorry?1.5:.15,width*.92,height*.4,length*(lorry?.7:.7));
    if(lorry)box(g,0xc8c7b9,0,2.25,1.2,2.42,2.6,6.9);
    const upperZ=lorry?1.5:.15;
    box(g,C.glass,0,height*.82,upperZ-length*.35-.025,width*.85,height*.29,.05);
    box(g,C.glass,0,height*.82,upperZ+length*.35+.025,width*.85,height*.25,.05);
    for(const side of [-1,1])for(let i=0;i<(bus?6:lorry?1:2);i++)box(g,C.glass,side*(width*.46+.012),height*.8,-length*.29+i*length*(bus?.12:.31),.035,height*.29,length*(bus?.09:.23));
    const radius=bus||lorry?.43:.32;
    for(const x of [-width*.46,width*.46])for(const z of [-length*.32,length*.32]) {
      const wheel=cylinder(g,C.black,x,radius,z,radius,.22);wheel.rotation.z=Math.PI/2;
      const hub=cylinder(g,C.steel,x*1.02,radius,z,radius*.5,.24);hub.rotation.z=Math.PI/2;
    }
    for(const side of [-1,1]) {
      box(g,0xf5ecd0,side*width*.31,.70,-length/2-.015,.30,.17,.035,true);
      box(g,0xc94a3f,side*width*.31,.70,length/2+.015,.26,.17,.035,true);
    }
    if(kind==='taxi'){
      box(g,0xe6d9a8,0,height+.12,.05,.60,.20,.28);
      const text=geometricText('TAXI',.12,C.black);text.position.set(0,height+.055,-.097);text.rotation.y=Math.PI;g.add(text);
    }
    g.userData.vehicleDimensions={length,width,height};return finish(g,'road-vehicle',config,[[-width*.46,0,-length*.32],[width*.46,0,length*.32]]);
  }

  train(config: Config = {kind:'172'}): THREE.Group {
    const g=new THREE.Group(),kind=String(config.kind??'172'),shuttle=kind==='139',tram=kind==='metro',emu=kind==='emu',heritage=kind==='heritage';
    const count=Math.max(1,config.cars??(shuttle?1:tram?3:emu?4:3)),length=shuttle?9.6:tram?10.5:emu?20.4:23,width=tram?2.65:2.75,height=shuttle?3.25:3.78;
    const color=kind==='168'?0xc9c8bd:shuttle?0xe6dfc7:tram?0xc5c9c5:emu?0xc9ced0:heritage?0x7b5141:0xd8d2bc;
    const cars:THREE.Group[]=[],doors:THREE.Object3D[]=[],frontLights:THREE.Object3D[]=[],rearLights:THREE.Object3D[]=[];
    for(let car=0;car<count;car++) {
      const c=new THREE.Group();c.position.z=car*(length+.65)+length/2;g.add(c);cars.push(c);
      box(c,C.dark,0,.77,0,width*.75,.65,length*.91);box(c,color,0,2.28,0,width,2.45,length-.35);
      box(c,heritage?C.brown:C.purple,0,1.14,0,width+.02,.35,length-.3);
      box(c,kind==='172'?C.orange:tram?0x9c477b:emu?0x35597a:heritage?C.cream:0x38516c,0,1.50,0,width+.025,.23,length-.35);
      box(c,C.roof,0,3.61,0,width*.92,.27,length-.7);
      for(const z of [-length*.29,length*.29]) {
        box(c,C.dark,0,.64,z,1.85,.38,2.5);
        for(const zz of [-1.05,1.05])for(const x of [-.755,.755]) {
          const wheel=cylinder(c,C.dark,x,.40,z+zz,.40,.16);wheel.rotation.z=Math.PI/2;
        }
      }
      for(const side of [-1,1]) {
        for(let i=0;i<(shuttle?4:8);i++)box(c,C.glass,side*(width/2+.012),2.65,-length*.36+i*length*(shuttle?.23:.105),.04,.88,shuttle?1.15:1.55);
        for(const z of [-length*.33,length*.33]) {
          const door=box(c,kind==='172'?C.purple:C.steel,side*(width/2+.035),2.16,z,.045,2.05,1.15);doors.push(door);
          box(c,C.glass,side*(width/2+.065),2.68,z,.035,.75,.80);
        }
      }
      for(const side of [-1,1]){
        const external=(car===0&&side===-1)||(car===count-1&&side===1);
        box(c,C.steel,0,.73,side*(length/2-(external?.25:0)),.35,.22,external?.5:.65);
      }
      for(const side of [-1,1]) {
        const isCab=(car===0&&side===-1)||(car===count-1&&side===1);
        box(c,isCab?(tram?0xc5c9c5:C.yellow):C.dark,0,2.10,side*(length/2-.1),width*.91,2.52,.16);
        box(c,C.glass,0,2.95,side*(length/2-.026),width*.80,.77,.045);
        if(isCab)for(const x of [-.88,.88]) {
          const light=box(c,side===-1?0xf6efc9:0xe95b4b,x,1.75,side*(length/2-.031),.22,.22,.05,true);
          (side===-1?frontLights:rearLights).push(light);
        }
      }
      box(c,C.steel,0,3.86,0,width*.54,.26,2.3);
      if((tram||emu)&&car===Math.min(1,count-1)){
        box(c,C.dark,0,4.03,0,1.2,.15,1.75);
        for(const x of [-.4,.4]){
          beam(c,C.dark,V(x,4.10,-.7),V(x,4.75,.65),.045);
          beam(c,C.dark,V(x,4.75,.65),V(x,5.43,0),.045);
          beam(c,C.dark,V(x,4.10,.7),V(x,4.75,-.65),.045);
          beam(c,C.dark,V(x,4.75,-.65),V(x,5.43,0),.045);
        }
        box(c,C.dark,0,5.46,0,1.35,.08,.12);
      }
    }
    g.userData.cars=cars;g.userData.doors=doors;g.userData.frontLights=frontLights;g.userData.rearLights=rearLights;
    g.userData.totalLength=count*length+(count-1)*.65;g.userData.carLength=length;
    g.userData.couplerGap=.65;g.userData.firstCarCentreDistance=length/2;g.userData.noseOffset=0;
    g.userData.carCentreDistances=Array.from({length:count},(_,i)=>length/2+i*(length+.65));
    g.userData.originConvention='front nose at z=0, consist extends in +Z';
    return finish(g,'rolling-stock',config);
  }

  crossing(config: Config = {}): THREE.Group {
    const g=new THREE.Group(),width=config.width??7,tracks=config.tracks??2,spacing=config.trackSpacing??4.2;
    const rails:number[]=[];for(let i=0;i<tracks;i++) {const c=(i-(tracks-1)/2)*spacing;rails.push(c-.755,c+.755);}
    const cuts=[-tracks*spacing/2-1,...rails.flatMap(x=>[x-.1,x+.1]),tracks*spacing/2+1];
    for(let i=0;i<cuts.length-1;i+=2)box(g,0x72776d,(cuts[i]+cuts[i+1])/2,-.09,0,cuts[i+1]-cuts[i],.17,width);
    const barriers:Config[]=[],warningLights:THREE.Mesh[]=[];
    for(const side of [-1,1]) {
      const x=side*(tracks*spacing/2+1.4),z=side*(width/2+.8);
      box(g,C.concrete,x,-.12,z,.9,.25,.9);box(g,C.white,x,.7,z,.5,1.4,.5);
      const pivot=new THREE.Group();pivot.position.set(x,1.2,z);pivot.rotation.y=side>0?Math.PI:0;g.add(pivot);
      const armLength=tracks*spacing/2+2;
      for(let i=0;i<Math.ceil(armLength/.55);i++)box(pivot,i%2?C.red:C.white,.275+i*.55,0,0,.55,.20,.14);
      box(pivot,C.dark,-.28,0,0,.65,.38,.46);barriers.push({pivot,upSign:1});
      const lampZ=z+side*1.1;box(g,C.black,x,2.0,lampZ,.85,.65,.18);cylinder(g,C.steel,x,.95,lampZ,.065,1.9);
      for(const xx of [-.22,.22]) {
        const lens=mesh(CYLINDER,C.red,g,x+xx,2.12,lampZ+side*.11,.13,.05,.13,true);lens.rotation.x=Math.PI/2;
        lens.material=new THREE.MeshStandardMaterial({color:0x301d1d,emissive:0xff382b,emissiveIntensity:0});warningLights.push(lens);
      }
      box(g,C.yellow,x,1.86,lampZ+side*.11,.20,.16,.04);
    }
    g.userData.barriers=barriers;g.userData.warningLights=warningLights;setCrossingState(g,config.closed?1:0,0);
    return finish(g,'level-crossing',config);
  }

  furniture(kind: string, config: Config = {}): THREE.Group {
    const g=new THREE.Group();kind=kind.toLowerCase().replace(/[-_ ]/g,'');
    const label=(text:string,x:number,y:number,z:number,height=.10,color=C.white)=>{const t=geometricText(text,height,color);t.position.set(x,y,z);g.add(t);return t;};
    if(kind==='bench') {
      box(g,C.brown,0,.48,0,1.8,.12,.52);box(g,C.brown,0,.85,.22,1.8,.63,.08);
      for(const x of [-.65,.65]) {box(g,C.steel,x,.23,0,.08,.46,.45);box(g,C.steel,x,.62,0,.09,.1,.63);}
    } else if(kind==='lamp') {
      cylinder(g,C.steel,0,2.5,0,.065,5);box(g,C.concrete,0,-.08,0,.38,.17,.38);
      box(g,C.dark,0,5.0,0,.55,.13,.8);box(g,C.white,0,4.91,0,.48,.035,.72,true);
    } else if(kind==='ticketmachine'){
      box(g,C.concrete,0,.06,0,.85,.12,.65);box(g,0x426b62,0,.99,0,.65,1.86,.46);
      box(g,C.dark,0,1.36,.245,.45,.40,.035);box(g,0x9baea0,0,1.36,.267,.35,.29,.025);
      box(g,C.black,0,.94,.245,.23,.025,.035);box(g,C.dark,0,.70,.27,.30,.08,.10);
      for(const x of [-.12,.0,.12])box(g,C.steel,x,1.05,.255,.065,.065,.025);
      label('TICKETS',0,1.73,.245,.085);g.userData.facility='ticket-machine';
    } else if(kind==='helppoint'){
      box(g,C.concrete,0,.045,0,.45,.09,.45);cylinder(g,C.steel,0,1.1,0,.055,2.2);
      box(g,0x477765,0,1.36,.03,.37,.78,.23);box(g,C.dark,0,1.57,.157,.22,.11,.025);
      const button=mesh(CYLINDER,0xd3b648,g,0,1.26,.165,.075,.025,.075);button.rotation.x=Math.PI/2;
      label('HELP',0,1.69,.158,.07);g.userData.facility='help-point';
    } else if(kind==='cctv'){
      cylinder(g,C.steel,0,2.5,0,.06,5);box(g,C.concrete,0,.04,0,.36,.08,.36);
      box(g,C.steel,.22,4.72,0,.45,.09,.10);box(g,0xc9ccc1,.46,4.72,-.12,.22,.20,.50);
      box(g,C.black,.46,4.72,-.378,.14,.13,.025);box(g,C.steel,.46,4.86,-.13,.30,.055,.58);
      box(g,0xbabcae,0,3.9,.05,.36,.24,.035);label('CCTV',0,3.84,.075,.065,C.dark);g.userData.facility='cctv';
    } else if(kind==='clock'){
      cylinder(g,C.steel,0,1.45,0,.06,2.9);const rim=cylinder(g,C.dark,0,2.95,0,.38,.13);rim.rotation.x=Math.PI/2;
      const face=cylinder(g,C.cream,0,2.95,.076,.335,.025);face.rotation.x=Math.PI/2;
      for(let i=0;i<12;i++){const a=i*Math.PI/6;const tick=box(g,C.dark,Math.sin(a)*.28,2.95+Math.cos(a)*.28,.097,.018,.055,.014);tick.rotation.z=-a;}
      const hour=new THREE.Group();hour.position.set(0,2.95,.111);hour.rotation.z=-(Number(config.hour??10)%12+Number(config.minute??10)/60)*Math.PI/6;box(hour,C.dark,0,.085,0,.025,.17,.016);g.add(hour);
      const minute=new THREE.Group();minute.position.set(0,2.95,.118);minute.rotation.z=-Number(config.minute??10)*Math.PI/30;box(minute,C.dark,0,.12,0,.016,.24,.014);g.add(minute);g.userData.hands={hour,minute};
    } else if(kind==='cyclerack'){
      for(const x of [-.65,0,.65]){for(const z of [-.30,.30])cylinder(g,C.steel,x,.40,z,.035,.8);box(g,C.steel,x,.80,0,.07,.07,.60);for(const z of [-.3,.3])box(g,C.steel,x,.018,z,.20,.035,.15);}
    } else if(kind==='planter'){
      box(g,C.brick,0,.23,0,1.4,.46,.62);box(g,0x594f3c,0,.465,0,1.22,.035,.45);
      for(let i=0;i<5;i++){const x=-.48+i*.24;cylinder(g,C.green,x,.56,0,.018,.18);mesh(LEAF,i%2?0xbe7185:0xc4ab64,g,x,.70,0,.12,.10,.11);}
    } else if(kind==='departureboard'){
      for(const x of [-.68,.68]){cylinder(g,C.steel,x,1.15,0,.045,2.3);box(g,C.concrete,x,.03,0,.22,.06,.22);}
      box(g,C.black,0,2.38,0,1.8,.65,.16);label('DEPARTURES',0,2.52,.09,.115,0xd7b66c);
      if(config.text)label(String(config.text).slice(0,19),0,2.24,.09,.09,0xd7b66c);
      g.userData.display={text:config.text??'',binding:'station departures'};
    } else if(kind==='busstop'){
      cylinder(g,C.steel,0,1.35,0,.045,2.7);box(g,C.concrete,0,.025,0,.24,.05,.24);
      box(g,C.white,0,2.45,0,.46,.61,.08);box(g,C.red,0,2.61,.049,.40,.20,.025);label('BUS',0,2.55,.065,.085);
      box(g,C.dark,0,1.38,.04,.29,.65,.08);box(g,C.cream,0,1.38,.089,.25,.59,.018);label('TIMES',0,1.56,.101,.045,C.dark);
    } else if(kind==='trafficlight'){
      cylinder(g,C.steel,0,1.35,0,.055,2.7);box(g,C.concrete,0,.035,0,.30,.07,.30);box(g,C.black,0,2.86,0,.38,1.08,.20);
      const lenses:Record<string,THREE.Mesh[]>={red:[],yellow:[],green:[]};
      for(const [key,y,color] of [['red',3.16,0xe74435],['yellow',2.86,0xe9bd43],['green',2.56,0x4dba7e]] as [string,number,number][]){
        const lens=mesh(CYLINDER,color,g,0,y,.12,.10,.04,.10);lens.rotation.x=Math.PI/2;lens.material=new THREE.MeshStandardMaterial({color:0x172522,emissive:color,emissiveIntensity:key===(config.aspect??'red')?1.1:0});lenses[key].push(lens);box(g,C.black,0,y+.11,.15,.28,.035,.22);
      }
      g.userData.lenses=lenses;g.userData.aspect=config.aspect??'red';
    } else if(kind==='roadsign'){
      cylinder(g,C.steel,0,1.0,0,.045,2.0);const rim=cylinder(g,C.red,0,1.95,0,.34,.075);rim.rotation.x=Math.PI/2;const face=cylinder(g,C.white,0,1.95,.045,.28,.025);face.rotation.x=Math.PI/2;
      label(String(config.text??'30'),0,1.82,.065,.25,C.dark);
    } else if(kind==='gate'){
      const width=config.width??3;
      for(const x of [-width/2,width/2]){box(g,C.steel,x,.85,0,.12,1.7,.12);box(g,C.concrete,x,.02,0,.30,.04,.30);}
      const hinge=new THREE.Group();hinge.position.set(-width/2,0,0);g.add(hinge);
      for(const y of [.3,1.45])box(hinge,C.steel,width/2,y,0,width-.16,.08,.08);
      for(let x=.16;x<width-.1;x+=.2)box(hinge,C.steel,x,.87,0,.035,1.2,.035);g.userData.hinge=hinge;
    } else if(kind==='fence') {
      const length=config.length??3.0,height=config.height??1.6;
      for(const z of [-length/2,length/2])box(g,C.steel,0,height/2,z,.07,height,.07);
      for(const y of [.3,height-.2])box(g,C.steel,0,y,0,.045,.05,length);
      for(let z=-length/2;z<=length/2;z+=.2)box(g,C.steel,0,height/2,z,.035,height,.035);
    } else if(kind==='aws') {
      box(g,C.yellow,0,.07,0,.47,.15,.58);box(g,C.dark,0,.16,0,.37,.05,.44);
      for(const x of [-.31,.31])box(g,C.steel,x,-.02,0,.17,.10,.65);
    } else if(kind==='tpws') {
      for(const x of [-.5,.5])box(g,C.yellow,x,.04,0,.045,.08,1.0);
      for(const z of [-.5,.5])box(g,C.yellow,0,.04,z,1.0,.08,.045);
    } else if(kind==='buffer') {
      for(const x of [-.755,.755]) {beam(g,C.steel,V(x,0,.9),V(x,.9,0),.16);box(g,C.steel,x,.9,0,.18,.22,.5);}
      box(g,C.red,0,.95,-.10,2.5,.40,.3);
    } else if(kind==='person'||kind==='staff') {
      for(const x of [-.13,.13])box(g,0x303e4b,x,.425,0,.18,.85,.22);
      box(g,config.color??(kind==='staff'?C.orange:C.purple),0,1.10,0,.48,.62,.28);mesh(LEAF,0xc8a285,g,0,1.61,0,.18,.23,.18);
      if(kind==='staff')for(const y of [1.0,1.22])box(g,C.yellow,0,y,.15,.48,.055,.025);
      for(const x of [-.32,.32])box(g,config.color??C.orange,x,1.08,0,.13,.6,.16);
    } else if(kind==='sign') {
      cylinder(g,C.steel,0,.95,0,.045,1.9);box(g,C.white,0,1.8,0,.62,.55,.06);
      const text=geometricText(String(config.text??'75'),.28,C.black);text.position.set(0,1.65,.04);g.add(text);
    } else if(kind==='drainage') {
      box(g,C.concrete,0,-.12,0,.48,.2,config.length??3);box(g,C.dark,0,-.01,0,.25,.025,config.length??3);
    } else if(kind==='bin') {
      cylinder(g,C.dark,0,.48,0,.25,.95);box(g,C.steel,0,.94,0,.52,.08,.5);box(g,C.black,0,.80,.255,.23,.075,.025);
    } else if(kind==='stairs') {
      for(let i=0;i<10;i++)box(g,C.concrete,0,(i+1)*.09,-i*.3,1.8,(i+1)*.18,.3);
    } else {
      box(g,C.concrete,0,.05,0,.85,.10,.65);box(g,kind==='cabinet'?0xa7b4a4:C.steel,0,.7,0,.68,1.3,.45);
      box(g,C.dark,.20,.75,.235,.035,.23,.035);
    }
    return finish(g,kind,config);
  }
}

export function setSignalAspect(group: THREE.Group, aspect: Aspect | string) {
  const lenses=group.userData.lenses as Record<string,THREE.Mesh[]> | undefined;if(!lenses)return;
  const active=aspect==='doubleYellow'?['yellow','doubleYellow']:[aspect];
  for(const [key,meshes] of Object.entries(lenses))for(const lens of meshes) {
    const m=lens.material as THREE.MeshStandardMaterial;const on=active.includes(key);
    m.color.setHex(on?(key==='red'?0xf04432:key==='green'?0x4cdb8b:0xffc329):0x172522);m.emissiveIntensity=on?1.3:0;
  }
  group.userData.aspect=aspect;
}
export function setTurnoutState(group: THREE.Group, blend: number) {
  const t=THREE.MathUtils.clamp(blend,0,1),blades=group.userData.blades as THREE.Mesh[]|undefined;
  if(blades)for(const blade of blades) {
    const side=blade.userData.side as number;const close=side<0?1-t:t;
    blade.position.x=blade.userData.baseX-side*(1-close)*.17;blade.rotation.y=side*(1-close)*.012;
  }
  group.userData.blend=t;group.userData.proved=t===0?'normal':t===1?'reverse':'moving';
}
export function setCrossingState(group: THREE.Group, closedBlend: number, time = 0, warning = closedBlend > .01) {
  const t=THREE.MathUtils.clamp(closedBlend,0,1),barriers=group.userData.barriers as Config[]|undefined;
  if(barriers)for(const b of barriers)b.pivot.rotation.z=(1-t)*Math.PI/2;
  const lamps=group.userData.warningLights as THREE.Mesh[]|undefined;
  if(lamps)lamps.forEach((lamp,i)=>{const m=lamp.material as THREE.MeshStandardMaterial;m.emissiveIntensity=warning&&Math.floor(time*2.8+i)%2===0?1.5:0;});
  group.userData.closedBlend=t;
}

export const ASSET_PALETTE = C;
