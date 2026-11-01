import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import * as THREE from 'three/webgpu';
import {AssetFactory,setSignalAspect,setCrossingState,setTurnoutState} from '../src/render/assets';
import {RouteGeometry,Polyline} from '../src/core/geometry';
import type {RouteData,WorldTile} from '../src/core/types';
import {Terrain} from '../src/world/surfaces';
import {buildTile,endpointContext} from '../src/world/build';
import {mappedPlatforms,platformContains,derivedPlatformEdgeDistance} from '../src/world/platforms';
import {Batch} from '../src/render/batch';

test('procedural family geometry is finite, bounded and texture-free',()=>{
  const f=new AssetFactory(),groups=[f.station({id:'HAG',name:'Hagley',length:150,platformCount:2}),
    f.station({id:'BSW',name:'Birmingham Snow Hill',length:200,platformCount:3}),f.turnout({}),
    f.tunnel({}),f.bridge({}),f.building({width:8,depth:12,height:7}),f.tree({seed:5}),
    f.train({kind:'172',cars:3}),f.train({kind:'139',cars:1}),f.train({kind:'emu',cars:4}),f.train({kind:'metro',cars:3}),f.roadVehicle({kind:'bus'}),f.roadVehicle({kind:'taxi'}),f.roadVehicle({kind:'lorry'}),f.crossing({}),
    ...['ticketMachine','helpPoint','CCTV','clock','bin','cycleRack','planter','departureBoard','busStop','trafficLight','roadSign','gate'].map(kind=>f.furniture(kind,{id:`fixture/${kind}`}))];
  for(const group of groups){
    const bounds=new THREE.Box3().setFromObject(group);assert.ok(!bounds.isEmpty());
    group.traverse(node=>{
      if(!(node as THREE.Mesh).isMesh)return;const mesh=node as THREE.Mesh;
      for(const value of mesh.geometry.getAttribute('position').array)assert.ok(Number.isFinite(value));
      for(const material of (Array.isArray(mesh.material)?mesh.material:[mesh.material]))
        for(const value of Object.values(material))assert.ok(!(value as THREE.Texture)?.isTexture,'asset material contains a texture');
    });
  }
});

test('component identities are deterministic per world root and independent of unrelated allocations',()=>{
  const f=new AssetFactory(),collect=(g:THREE.Group)=>{const ids:string[]=[];g.traverse(o=>{if(o!==g)ids.push(o.userData.componentId);});return ids;};
  const a=collect(f.furniture('ticketMachine',{id:'SOL/platform-1/tickets'}));
  f.tree({id:'unrelated-tree',seed:500});const b=collect(f.furniture('ticketMachine',{id:'SOL/platform-1/tickets'}));
  assert.deepEqual(a,b);assert.equal(new Set(a).size,a.length);assert.ok(a.length>5);assert.ok(a.every(id=>id.startsWith('SOL/platform-1/tickets/component/')));
  const c=collect(f.furniture('ticketMachine',{id:'SOL/platform-2/tickets'}));assert.ok(c.every(id=>!a.includes(id)));
  assert.ok(f.furniture('gate').userData.hinge);assert.ok(f.furniture('clock').userData.hands);assert.ok(f.furniture('departureBoard').userData.display);
});

test('signal and crossing state never leaks through a shared material cache',()=>{
  const f=new AssetFactory(),a=f.signal({fourAspect:true}),b=f.signal({fourAspect:true});
  setSignalAspect(a,'green');assert.equal(b.userData.aspect,'red');
  assert.equal(b.userData.lenses.green[0].material.emissiveIntensity,0);
  assert.ok(a.userData.lenses.green[0].material.emissiveIntensity>0);
  setSignalAspect(a,'doubleYellow');
  assert.ok(a.userData.lenses.yellow[0].material.emissiveIntensity>0);
  assert.ok(a.userData.lenses.doubleYellow[0].material.emissiveIntensity>0);
  const c=f.crossing({}),d=f.crossing({});setCrossingState(c,1,0);
  assert.equal(d.userData.warningLights[0].material.emissiveIntensity,0);
  assert.notEqual(c.userData.warningLights[0].material,d.userData.warningLights[0].material);
});

test('turnout blade gaps swap physical sides and moving geometry is unproved',()=>{
  const t=new AssetFactory().turnout({}),gap=()=>t.userData.blades.map((b:THREE.Mesh)=>Math.abs(b.position.x-b.userData.baseX));
  const normal=gap();assert.ok(normal[0]<normal[1]-.1);
  setTurnoutState(t,1);const reverse=gap();assert.ok(reverse[1]<reverse[0]-.1);
  setTurnoutState(t,.5);assert.equal(t.userData.proved,'moving');
});

test('tunnel has a clear driver line of sight and no solid portal plate',()=>{
  const tunnel=new AssetFactory().tunnel({width:9,height:5.8,length:30});tunnel.updateMatrixWorld(true);
  const ray=new THREE.Raycaster(new THREE.Vector3(-2.1,2.7,0),new THREE.Vector3(0,0,-1),0,40);
  assert.equal(ray.intersectObject(tunnel,true).length,0);
  const upward=new THREE.Raycaster(new THREE.Vector3(-3.475,3.8,0),new THREE.Vector3(0,1,0),0,10);
  const hit=upward.intersectObject(tunnel,true)[0];assert.ok(hit&&hit.distance>.15,'upper body must fit inside the bore');
});

test('road wheels contact their datum and full consist bounds match its physical length',()=>{
  const f=new AssetFactory();for(const kind of ['car','van','bus','lorry']){
    const vehicle=f.roadVehicle({kind});const bounds=new THREE.Box3().setFromObject(vehicle);assert.ok(Math.abs(bounds.min.y)<.001);
  }
  const train=f.train({kind:'172',cars:3}),bounds=new THREE.Box3().setFromObject(train);
  assert.ok(Math.abs(bounds.min.z)<.001);assert.ok(Math.abs(bounds.max.z-train.userData.totalLength)<.001);
});

const fixture=()=>{
  const points:[number,number,number][]=[];for(let z=100;z>=-500;z-=8)points.push([.25,50,z]);
  const data:RouteData={origin:[400000,280000],points,stations:[],tracks:[],structures:[],tiles:[],
    terrain:{url:'',width:41,height:41,origin:[-800,-800],step:40,offset:26,scale:.01,nodata:0},
    tunnels:[]};
  return{data,terrain:new Terrain(data.terrain,new Uint16Array(41*41).fill(2401))};
};
function terrainGeometry(result:ReturnType<typeof buildTile>){
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(result.mesh.position.slice(0,result.checks.terrainTriangles*9),3));return g;
}

test('separate tiles share identical formation seam heights and have upward terrain normals',()=>{
  const {data,terrain}=fixture(),route=new RouteGeometry(data);
  const tile=(id:string,bounds:number[]):WorldTile=>({id,bounds,roads:[],buildings:[]});
  const left=buildTile(tile('left',[-200,-400,0,0]),route,terrain),right=buildTile(tile('right',[0,-400,200,0]),route,terrain);
  const seam=(result:typeof left)=>{
    const map=new Map<string,number>();for(let i=0;i<result.checks.terrainTriangles*9;i+=3)
      if(Math.abs(result.mesh.position[i])<1e-5)map.set(result.mesh.position[i+2].toFixed(3),result.mesh.position[i+1]);return map;
  };
  const a=seam(left),b=seam(right);let matches=0;
  for(const [z,y] of a)if(b.has(z)){assert.ok(Math.abs(y-b.get(z)!)<.001);matches++;}
  assert.ok(matches>10);
  for(const r of [left,right])for(let i=1;i<r.checks.terrainTriangles*9;i+=3)assert.ok(r.mesh.normal[i]>0);
  const ray=new THREE.Raycaster(new THREE.Vector3(2.1,100,-200),new THREE.Vector3(0,-1,0),0,100);
  const hits=ray.intersectObject(new THREE.Mesh(terrainGeometry(right),new THREE.MeshBasicMaterial()));
  assert.ok(hits.length>0);assert.ok(hits[0].point.y<=49.45,'ground must stay below ballast, not protrude through formation');
});

test('engineered tunnel cover remains above the bore when source ground is too low',()=>{
  const {data,terrain}=fixture();data.tunnels=[{id:'fixture-bore',type:'tunnel',start:180,end:340,width:9,clearHeight:5.8}];
  const route=new RouteGeometry(data),tile:WorldTile={id:'cover',bounds:[-200,-400,200,0],roads:[],buildings:[]};
  const result=buildTile(tile,route,terrain),ray=new THREE.Raycaster(new THREE.Vector3(2.1,100,-160),new THREE.Vector3(0,-1,0),0,100);
  const hits=ray.intersectObject(new THREE.Mesh(terrainGeometry(result),new THREE.MeshBasicMaterial()));
  assert.ok(hits.length>0);assert.ok(hits[0].point.y>=56.5,'engineered cover should seal above the arch, not cross inside it');
});

test('road top surfaces face upward and mapped footbridges leave the driver envelope clear',()=>{
  const {data,terrain}=fixture();data.structures=[{id:'footbridge/fixture',type:'footbridge',position:[.25,56,-200],
    points:[[-15,56,-200],[15,56,-200]],length:30,width:2.2,sourceWayIds:['fixture']}];
  const route=new RouteGeometry(data),tile:WorldTile={id:'civil',bounds:[-200,-400,200,0],buildings:[],
    roads:[{id:'road-fixture',kind:'residential',width:6,points:[[-100,44,-100],[.25,44,-100],[100,44,-100]]}]};
  const result=buildTile(tile,route,terrain),asphalt=new THREE.Color(0x686c68);let roadFaces=0;
  for(let i=0;i<result.mesh.index.length;i+=3){
    const v=result.mesh.index[i],n=v*3;
    if(Math.abs(result.mesh.color[n]-asphalt.r)<1e-6&&Math.abs(result.mesh.color[n+1]-asphalt.g)<1e-6&&Math.abs(result.mesh.color[n+2]-asphalt.b)<1e-6){
      assert.ok(result.mesh.normal[n+1]>.7,'a road surface must not be downward-facing');roadFaces++;
    }
  }
  assert.ok(roadFaces>0);assert.ok(result.placements.some(p=>p.id==='footbridge/fixture'));
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(result.mesh.position,3));g.setIndex(new THREE.BufferAttribute(result.mesh.index,1));
  const ray=new THREE.Raycaster(new THREE.Vector3(.25,52.7,-180),new THREE.Vector3(0,0,-1),0,40);
  assert.equal(ray.intersectObject(new THREE.Mesh(g,new THREE.MeshBasicMaterial())).length,0,'bridge deck/supports obstruct the driver clearance');
});

test('mapped island outlines replace generic sides and furniture sits inside the final supported surface',()=>{
  const {data,terrain}=fixture();data.opposingOffsets=data.points.map(()=>-13);
  data.stations=[{id:'SOL',name:'Solihull',s:300,position:[.25,50,-200],length:200,platformCount:2}];
  data.platforms=[
    {id:'source-island-a',station:'SOL',footprint:[[-11.3,-100],[-6.5,-100],[-6.5,-300],[-11.3,-300]],y:50.915},
    {id:'source-island-b',station:'SOL',footprint:[[-6.5,-100],[-1.7,-100],[-1.7,-300],[-6.5,-300]],y:50.915},
  ];
  const raw=JSON.stringify(data.platforms),route=new RouteGeometry(data),platforms=mappedPlatforms(route);
  assert.equal(JSON.stringify(data.platforms),raw,'source footprint must remain unchanged');
  assert.equal(platforms.length,2);
  assert.ok(platforms.every(p=>!p.boundaries.some(e=>Math.abs(e.a[0]+6.5)<1e-5&&Math.abs(e.b[0]+6.5)<1e-5)),'shared island seam must not acquire a wall/coping');
  const result=buildTile({id:'island',bounds:[-200,-400,200,0],roads:[],buildings:[]},route,terrain);
  assert.equal(result.checks.mappedPlatforms,2);
  const furniture=result.placements.filter(p=>p.family.startsWith('platform-'));assert.ok(furniture.length>0);
  for(const placement of furniture){
    const platform=platforms.find(p=>p.id===placement.platformId)!;assert.ok(platform);
    assert.ok(platformContains(platform,placement.position[0],placement.position[2]));
    assert.ok(derivedPlatformEdgeDistance(platform,placement.position[0],placement.position[2])>=(Number(placement.clearanceRadius)||0)-.01);
    assert.ok(Math.abs(placement.position[1]-platform.top(placement.position[0],placement.position[2]))<.001);
    const n=route.project(placement.position[0],placement.position[2]);for(const lane of [0,4.2]){const q=route.lanePose(n.s,lane).position;assert.ok(Math.hypot(q[0]-placement.position[0],q[2]-placement.position[2])>1.55);}
  }
  assert.ok(result.pedestrianPaths&&result.pedestrianPaths.length>0);
  for(const path of result.pedestrianPaths){const platform=platforms.find(p=>p.id===path.platformId)!;for(const point of path.points){assert.ok(platformContains(platform,point[0],point[2]));assert.ok(derivedPlatformEdgeDistance(platform,point[0],point[2])>=.35-.001);assert.ok(Math.abs(point[1]-platform.top(point[0],point[2]))<.001);}}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(result.mesh.position,3));g.setIndex(new THREE.BufferAttribute(result.mesh.index,1));const mesh=new THREE.Mesh(g,new THREE.MeshBasicMaterial());
  const top=new THREE.Raycaster(new THREE.Vector3(-4.2,50.97,-217.1),new THREE.Vector3(0,-1,0),0,3).intersectObject(mesh)[0];
  assert.ok(top&&Math.abs(top.point.y-50.915)<.01,'mapped platform top must support its footprint');
  const end=new THREE.Raycaster(new THREE.Vector3(-4.2,50.5,-90),new THREE.Vector3(0,0,-1),0,20).intersectObject(mesh)[0];
  assert.ok(end&&Math.abs(end.point.z+100)<.01,'mapped platform needs a closed structural end face');
});

test('adjacent lower railway has its own supported formation and clears the upper bridge',()=>{
  const {data,terrain}=fixture();data.adjacentServices=[{id:'lower-line',kind:'emu',overhead:true,points:[[-100,43,-200],[0,43,-200],[100,43,-200]],
    metadata:{requiresOwnTrack:true,crossingUnderMain:true,mainlineS:300,mainlineClearanceMetres:7}}];
  const route=new RouteGeometry(data),result=buildTile({id:'stacked',bounds:[-200,-400,200,0],roads:[],buildings:[]},route,terrain);
  assert.ok(result.placements.some(p=>p.family==='adjacent-network-bridge'));
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(result.mesh.position,3));g.setIndex(new THREE.BufferAttribute(result.mesh.index,1));
  const ray=new THREE.Raycaster(new THREE.Vector3(-20,45.7,-200),new THREE.Vector3(1,0,0),0,40);
  assert.equal(ray.intersectObject(new THREE.Mesh(g,new THREE.MeshBasicMaterial())).length,0,'upper bridge must not obstruct the lower driver envelope');
  const groundMesh=new THREE.Mesh(terrainGeometry(result),new THREE.MeshBasicMaterial()),down=new THREE.Raycaster(new THREE.Vector3(-20,100,-200),new THREE.Vector3(0,-1,0),0,100);
  const support=down.intersectObject(groundMesh)[0];assert.ok(support);assert.ok(support.point.y<42.5&&support.point.y>42.3);
});

test('source switches replace only their lane span and receive rooted branch formation',()=>{
  const {data,terrain}=fixture();data.trackwork=[{id:'source-switch',lane:0,startS:201.25,endS:234.75,supportPaths:[[[.25,50,-101.25],[.25,50,-134.75]],[[.25,50,-101.25],[8,50,-110],[20,50,-134.75]]]}];
  const result=buildTile({id:'switch-span',bounds:[-40,-160,60,-80],roads:[],buildings:[]},new RouteGeometry(data),terrain),rail=new THREE.Color(0xa2aaa5);
  let remainingOtherLane=0,headsAtStart=0,headsAtEnd=0;
  for(let i=0;i<result.mesh.index.length;i+=3){
    const ids=[result.mesh.index[i],result.mesh.index[i+1],result.mesh.index[i+2]],v=ids[0]*3;
    if(Math.abs(result.mesh.color[v]-rail.r)>1e-6||Math.abs(result.mesh.color[v+1]-rail.g)>1e-6||Math.abs(result.mesh.color[v+2]-rail.b)>1e-6||result.mesh.normal[v+1]<.9)continue;
    const x=ids.reduce((n,j)=>n+result.mesh.position[j*3],0)/3,z=ids.reduce((n,j)=>n+result.mesh.position[j*3+2],0)/3;
    if(Math.abs(x-.25)<1.1){assert.ok(z>=-101.25-.0001||z<=-134.75+.0001,'base running head crosses a replaced source-switch span');for(const j of ids){const zz=result.mesh.position[j*3+2];if(Math.abs(zz+101.25)<.0001)headsAtStart++;if(Math.abs(zz+134.75)<.0001)headsAtEnd++;}}
    else if(z< -101.25&&z> -134.75)remainingOtherLane++;
  }
  assert.ok(headsAtStart>0&&headsAtEnd>0,'base rail must split at exact switch joins');assert.ok(remainingOtherLane>0,'opposite lane must remain intact');assert.ok(result.checks.switchSleepersSuppressed>0);
  const soil=new THREE.Mesh(terrainGeometry(result),new THREE.MeshBasicMaterial()),root=new THREE.Raycaster(new THREE.Vector3(18,100,-130),new THREE.Vector3(0,-1,0),0,100).intersectObject(soil)[0];
  assert.ok(root&&root.point.y>49.35&&root.point.y<49.6,'source-connected branch needs supported formation rather than raw soil');
});

test('remote props and complete building plinths contact the actual cooked terrain',()=>{
  const {data}=fixture(),pixels=new Uint16Array(41*41);
  for(let z=0;z<41;z++)for(let x=0;x<41;x++)pixels[z*41+x]=4300+Math.round(140*Math.sin(x*.7)*Math.cos(z*.6));
  const terrain=new Terrain(data.terrain,pixels),route=new RouteGeometry(data),trees:THREE.Group[]=[],original=AssetFactory.prototype.tree;
  AssetFactory.prototype.tree=function(c){const tree=original.call(this,c);trees.push(tree);return tree;};
  let result:ReturnType<typeof buildTile>;
  try{result=buildTile({id:'remote-soil',bounds:[220,-300,380,-140],roads:[],buildings:[{id:'remote-house',footprint:[[235,-170],[290,-170],[290,-230],[235,-230]],height:6}]},route,terrain);}finally{AssetFactory.prototype.tree=original;}
  const soil=new THREE.Mesh(terrainGeometry(result),new THREE.MeshBasicMaterial()),height=(x:number,z:number)=>new THREE.Raycaster(new THREE.Vector3(x,100,z),new THREE.Vector3(0,-1,0),0,100).intersectObject(soil)[0]?.point.y;
  assert.ok(trees.length>0);
  for(const tree of trees){const y=height(tree.position.x,tree.position.z);assert.ok(y!==undefined&&y>65,'remote soil must retain its own elevation when no route buckets are nearby');assert.ok(Math.abs(tree.position.y-y)<.003,'tree must use the rendered soil plane, including within-cell interpolation');}
  assert.ok(result.placements.some(p=>p.id==='remote-house'));
  const bodyColors=[0x9c6b56,0xa27d61,0xbaa58a,0x877465,0xb5ada0].map(c=>new THREE.Color(c)),plinthColor=new THREE.Color(0x8e887c);let bodyMin=Infinity,footMin=Infinity;
  for(let i=0;i<result.mesh.position.length;i+=3){const color=[result.mesh.color[i],result.mesh.color[i+1],result.mesh.color[i+2]],same=(c:THREE.Color)=>Math.abs(color[0]-c.r)<1e-6&&Math.abs(color[1]-c.g)<1e-6&&Math.abs(color[2]-c.b)<1e-6;if(bodyColors.some(same))bodyMin=Math.min(bodyMin,result.mesh.position[i+1]);if(same(plinthColor))footMin=Math.min(footMin,result.mesh.position[i+1]);}
  assert.ok(Number.isFinite(footMin));for(let x=236;x<=289;x+=5)for(let z=-229;z<=-171;z+=5){const y=height(x,z)!;assert.ok(bodyMin>=y-.003,'terrain crosses an engineered building floor');assert.ok(footMin<y,'a complete foundation must reach soil throughout the footprint');}
});

test('mapped physical context continues both running lines beyond both playable endpoints',()=>{
  const data=JSON.parse(readFileSync('public/data/route.json','utf8')) as RouteData,route=new RouteGeometry(data),before=JSON.stringify(data.points),length=route.length,contexts=endpointContext(route);
  assert.equal(contexts.length,4);
  for(const context of contexts){const meta=context.metadata!,pose=route.lanePose(meta.atEnd?length:0,meta.lane);assert.ok(context.path.length>=160);assert.equal(meta.playable,false);assert.ok(Math.hypot(...context.points[0].map((v,i)=>v-pose.position[i]))<.001);
    const sources=data.tracks.filter(t=>meta.sourceIds.includes(t.id)&&t.points?.length).map(t=>new Polyline(t.points!));
    for(const s of [30,80,150]){const q=context.path.sample(s).position;assert.ok(Math.min(...sources.map(p=>p.nearest(q[0],q[2]).distance))<.02,'context must follow actual connected source segments after the endpoint fit');}
  }
  assert.equal(route.length,length);assert.equal(JSON.stringify(data.points),before);
});

test('a road owned by one tile carves the same shared surface in its neighbour',()=>{
  const {data,terrain}=fixture(),road={id:'one-owner-road',kind:'residential',width:6,bounds:[-160,-200,160,-200],points:[[-160,44,-200],[.25,44,-200],[160,44,-200]] as [number,number,number][]};
  data.surfaceRoads=[road];const route=new RouteGeometry(data),left=buildTile({id:'road-owner',bounds:[-200,-400,0,0],roads:[road],buildings:[]},route,terrain),right=buildTile({id:'road-neighbour',bounds:[0,-400,200,0],roads:[],buildings:[]},route,terrain);
  assert.equal(left.roads.length,1);assert.equal(right.roads.length,0,'support-only neighbour must not claim road mesh ownership');
  const seam=(result:typeof left)=>{const values=new Map<number,number>();for(let i=0;i<result.checks.terrainTriangles*9;i+=3)if(Math.abs(result.mesh.position[i])<.0001)values.set(result.mesh.position[i+2],result.mesh.position[i+1]);return values;},a=seam(left),b=seam(right);
  assert.equal(a.size,b.size);for(const[z,y]of a){assert.ok(b.has(z));assert.ok(Math.abs(y-b.get(z)!)<.001,'global engineering must give both owners the same seam profile');}
  assert.ok(a.get(-200)!<44,'the neighbouring road must produce an actual terrain cut');
});

test('a water body cuts both sides of a tile boundary with one surface owner',()=>{
  const {data,terrain}=fixture();data.points=data.points.map(q=>[250,q[1],q[2]]);
  const water={id:'source-pond',kind:'water',y:48,bounds:[-30,-260,30,-180],footprint:[[-30,-180],[30,-180],[30,-260],[-30,-260]]};data.surfaceWater=[water];
  const route=new RouteGeometry(data),left=buildTile({id:'water-owner',bounds:[-200,-400,0,0],roads:[],land:[water],buildings:[]},route,terrain),right=buildTile({id:'water-neighbour',bounds:[0,-400,200,0],roads:[],land:[],buildings:[]},route,terrain);
  const heights=(r:typeof left)=>{const values=new Map<number,number>();for(let i=0;i<r.checks.terrainTriangles*9;i+=3)if(Math.abs(r.mesh.position[i])<.0001)values.set(r.mesh.position[i+2],r.mesh.position[i+1]);return values;},a=heights(left),b=heights(right);
  for(const[z,y]of a)assert.ok(Math.abs(y-b.get(z)!)<.001,'global water cuts must share the same edge elevation');assert.ok(Math.abs(a.get(-220)!-47.35)<.001);
});

test('the tunnel roof ends at the portal plane without clipping the exiting formation',()=>{
  const {data}=fixture();data.tunnels=[{id:'offset-portal',type:'tunnel',start:180,end:341.3,width:9,clearHeight:5.8}];
  const terrain=new Terrain(data.terrain,new Uint16Array(41*41).fill(4201)),route=new RouteGeometry(data),result=buildTile({id:'exit',bounds:[-80,-320,80,-100],roads:[{id:'portal-side-footway',kind:'footway',width:1.6,points:[[-10,52.5,-235],[-10,52.5,-250]]}],buildings:[]},route,terrain),soil=new THREE.Mesh(terrainGeometry(result),new THREE.MeshBasicMaterial());
  for(const s of[342,342.6,344,348]){const q=route.lanePose(s,0).position,hit=new THREE.Raycaster(new THREE.Vector3(q[0],100,q[2]),new THREE.Vector3(0,-1,0),0,100).intersectObject(soil)[0];assert.ok(hit&&hit.point.y<=q[1]-.30,'a roof triangle extends beyond the portal into the open track');}
  const driver=new THREE.Raycaster(new THREE.Vector3(.25,52.7,-236),new THREE.Vector3(0,0,-1),0,20);assert.equal(driver.intersectObject(soil).length,0,'portal cut must leave a continuous clear driver envelope');
  const footway=new THREE.Raycaster(new THREE.Vector3(-10,100,-240.5),new THREE.Vector3(0,-1,0),0,100).intersectObject(soil)[0];assert.ok(footway&&footway.point.y<52.5,'portal cover must not bury a lower footway outside the physical bore');
});

test('platform furniture follows cooked triangles across changes in the rail gradient',()=>{
  const {data,terrain}=fixture();data.points=data.points.map(q=>[q[0],50+Math.abs(q[2]+197.3)*.03,q[2]]);data.opposingOffsets=data.points.map(()=>-13);data.stations=[{id:'SOL',name:'Solihull',s:300,position:[.25,50,-200],length:200,platformCount:2}];
  data.platforms=[{id:'graded-island',station:'SOL',footprint:[[-11.3,-100],[-1.7,-100],[-1.7,-300],[-11.3,-300]],y:50.915}];
  const result=buildTile({id:'graded',bounds:[-100,-400,100,0],roads:[],buildings:[]},new RouteGeometry(data),terrain),color=new THREE.Color(0x666c67),positions:number[]=[];
  for(let i=0;i<result.mesh.index.length;i+=3){const ids=[result.mesh.index[i],result.mesh.index[i+1],result.mesh.index[i+2]],v=ids[0]*3;if(Math.abs(result.mesh.color[v]-color.r)<1e-6&&Math.abs(result.mesh.color[v+1]-color.g)<1e-6&&Math.abs(result.mesh.color[v+2]-color.b)<1e-6&&result.mesh.normal[v+1]>.65)for(const id of ids)positions.push(...result.mesh.position.slice(id*3,id*3+3));}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));const floor=new THREE.Mesh(g,new THREE.MeshBasicMaterial()),furniture=result.placements.filter(p=>p.platformId);assert.ok(furniture.length>0);
  for(const p of furniture){const hit=new THREE.Raycaster(new THREE.Vector3(p.position[0],p.position[1]+.15,p.position[2]),new THREE.Vector3(0,-1,0),0,1).intersectObject(floor)[0];assert.ok(hit);assert.ok(Math.abs(p.position[1]-hit.point.y)<.003,'anchor re-evaluates the analytic profile instead of the actual rendered surface');}
});

test('road surfaces preserve every source profile break between regular mesh cuts',()=>{
  const {data,terrain}=fixture(),road={id:'graded-footway',kind:'footway',width:1.6,points:[[-50,44,-200],[-3,44,-200],[5,47,-200],[50,47,-200]] as [number,number,number][]},result=buildTile({id:'road-breaks',bounds:[-100,-300,100,-100],roads:[road],buildings:[]},new RouteGeometry(data),terrain),path=new Polyline(result.roads[0].points),g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.BufferAttribute(result.mesh.position,3));g.setIndex(new THREE.BufferAttribute(result.mesh.index,1));const mesh=new THREE.Mesh(g,new THREE.MeshBasicMaterial());
  for(const s of[46.7,47,47.4,54.8,55.54,56]){const q=path.sample(s).position,hit=new THREE.Raycaster(new THREE.Vector3(q[0],q[1]+.15,q[2]),new THREE.Vector3(0,-1,0),0,.3).intersectObject(mesh)[0];assert.ok(hit);assert.ok(Math.abs(hit.point.y-q[1]-.035)<.003,'mesh chord shortcuts an authoritative source grade break');}
});

test('surface roads above all four real bores leave both train body envelopes clear',()=>{
  const data=JSON.parse(readFileSync('public/data/route.json','utf8')) as RouteData;data.surfaceRoads=JSON.parse(readFileSync('public/data/road-surfaces.json','utf8')).roads;data.surfaceWater=JSON.parse(readFileSync('public/data/land-surfaces.json','utf8')).water;
  const route=new RouteGeometry(data),bytes=readFileSync('public/data/terrain.bin'),terrain=new Terrain(data.terrain,new Uint16Array(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength))),structuralColors=[0xa8a69a,0x77736b,0x6c685f].map(c=>new THREE.Color(c));
  const trainBounds=new THREE.Box3().setFromObject(new AssetFactory().train({kind:'172',cars:1})),halfBody=Math.max(Math.abs(trainBounds.min.x),Math.abs(trainBounds.max.x))+.03,bodyTop=trainBounds.max.y+.03;
  for(const tunnel of data.tunnels as {id:string;start:number;end:number}[]){
    const mid=route.sourceS((tunnel.start+tunnel.end)/2),pose=route.sample(mid),bounds=[pose.position[0]-65,pose.position[2]-65,pose.position[0]+65,pose.position[2]+65],roads=(data.surfaceRoads as WorldTile['roads']).filter(f=>{const b=f.bounds as number[];return b[0]<bounds[2]&&b[2]>bounds[0]&&b[1]<bounds[3]&&b[3]>bounds[1];});
    const result=buildTile({id:`${tunnel.id}/volume`,bounds,roads,buildings:[]},route,terrain),positions:number[]=[];
    for(let i=0;i<result.mesh.index.length;i+=3){const ids=[result.mesh.index[i],result.mesh.index[i+1],result.mesh.index[i+2]],v=ids[0]*3;if(structuralColors.some(c=>Math.abs(result.mesh.color[v]-c.r)<1e-6&&Math.abs(result.mesh.color[v+1]-c.g)<1e-6&&Math.abs(result.mesh.color[v+2]-c.b)<1e-6))for(const id of ids)positions.push(...result.mesh.position.slice(id*3,id*3+3));}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));const supports=new THREE.Mesh(g,new THREE.MeshBasicMaterial({side:THREE.DoubleSide}));
    const samples=Array.from({length:30},(_,i)=>mid-45+i*3);if(tunnel.id==='old-hill-tunnel')samples.push(mid-10.6416);
    for(const s of samples)for(const lane of[0,4.2]){
      const q=route.lanePose(s,lane);
      for(const lateral of[-halfBody,0,halfBody]){const x=q.position[0]+q.right[0]*lateral,z=q.position[2]+q.right[2]*lateral,body=new THREE.Raycaster(new THREE.Vector3(x,q.position[1]+.2,z),new THREE.Vector3(0,1,0),0,bodyTop-.2);assert.equal(body.intersectObject(supports).length,0,`${tunnel.id}: a bridge pier enters the actual train body envelope`);}
      const eye=new THREE.Raycaster(new THREE.Vector3(q.position[0],q.position[1]+2.7,q.position[2]),new THREE.Vector3(q.tangent[0],q.grade,q.tangent[2]).normalize(),0,3.2);assert.equal(eye.intersectObject(supports).length,0,`${tunnel.id}: concrete blocks the actual driver envelope`);
    }
  }
});

test('cross-boundary building plinths use the neighbour’s actual valley mesh',()=>{
  const {data}=fixture();data.points=data.points.map(q=>[250,q[1],q[2]]);const terrain=new Terrain(data.terrain,new Uint16Array(41*41).fill(3401)),road={id:'neighbour-valley',kind:'residential',width:4,bounds:[12,-215,12,-185],points:[[12,56.7,-185],[12,56.7,-215]] as [number,number,number][]};data.surfaceRoads=[road];
  const route=new RouteGeometry(data),owner=buildTile({id:'left',bounds:[-200,-400,0,0],roads:[],buildings:[{id:'crossing-house',height:5,footprint:[[-35,-170],[15,-170],[15,-230],[-35,-230]]}]},route,terrain),neighbour=buildTile({id:'right',bounds:[0,-400,200,0],roads:[road],buildings:[]},route,terrain);
  assert.ok(owner.placements.some(p=>p.id==='crossing-house'),'the supported source building must remain present');assert.ok(owner.checks.supportHaloTriangles>0);assert.equal(owner.checks.uncoveredBuildingSupports,0);
  for(let i=0;i<owner.checks.terrainTriangles*9;i+=3)assert.ok(owner.mesh.position[i]<=.0001,'support-only halo must not be emitted as owner terrain');
  const foundation=new THREE.Color(0x8e887c),bodyColors=[0x9c6b56,0xa27d61,0xbaa58a,0x877465,0xb5ada0].map(c=>new THREE.Color(c));let bottom=Infinity,floor=Infinity;
  for(let i=0;i<owner.mesh.position.length;i+=3){const same=(c:THREE.Color)=>Math.abs(owner.mesh.color[i]-c.r)<1e-6&&Math.abs(owner.mesh.color[i+1]-c.g)<1e-6&&Math.abs(owner.mesh.color[i+2]-c.b)<1e-6;if(same(foundation))bottom=Math.min(bottom,owner.mesh.position[i+1]);if(bodyColors.some(same))floor=Math.min(floor,owner.mesh.position[i+1]);}
  const soil=new THREE.Mesh(terrainGeometry(neighbour),new THREE.MeshBasicMaterial());let sampledValley=false;
  for(let x=1;x<=14;x+=3)for(let z=-229;z<=-171;z+=3){const hit=new THREE.Raycaster(new THREE.Vector3(x,100,z),new THREE.Vector3(0,-1,0),0,100).intersectObject(soil)[0];assert.ok(hit);assert.ok(bottom<=hit.point.y+.003,'foundation floats above the actual neighbour valley');assert.ok(floor>=hit.point.y-.003,'the neighbouring soil crosses the floor');if(hit.point.y<57)sampledValley=true;}assert.ok(sampledValley);
});

test('the mapped steep service-road hairpin clears its actual terrain triangles',()=>{
  const data=JSON.parse(readFileSync('public/data/route.json','utf8')) as RouteData;data.surfaceRoads=JSON.parse(readFileSync('public/data/road-surfaces.json','utf8')).roads;data.surfaceWater=JSON.parse(readFileSync('public/data/land-surfaces.json','utf8')).water;
  const route=new RouteGeometry(data),bytes=readFileSync('public/data/terrain.bin'),terrain=new Terrain(data.terrain,new Uint16Array(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength))),sourceTile=data.tiles.find(t=>t.id==='-2_-8')!,tile=JSON.parse(readFileSync('public/'+sourceTile.url,'utf8')) as WorldTile,result=buildTile(tile,route,terrain),road=result.roads.find(r=>r.id==='way/208451840/0')!,q=new Polyline(road.points).sample(20),x=q.position[0]-q.right[0]*road.width*.45,z=q.position[2]-q.right[2]*road.width*.45,asphalt=new THREE.Color(0x686c68),positions:number[]=[];
  for(let i=0;i<result.mesh.index.length;i+=3){const ids=[result.mesh.index[i],result.mesh.index[i+1],result.mesh.index[i+2]],v=ids[0]*3;if(Math.abs(result.mesh.color[v]-asphalt.r)<1e-6&&Math.abs(result.mesh.color[v+1]-asphalt.g)<1e-6&&Math.abs(result.mesh.color[v+2]-asphalt.b)<1e-6&&result.mesh.normal[v+1]>.65)for(const id of ids)positions.push(...result.mesh.position.slice(id*3,id*3+3));}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));const ray=new THREE.Raycaster(new THREE.Vector3(x,q.position[1]+.15,z),new THREE.Vector3(0,-1,0),0,2),top=ray.intersectObject(new THREE.Mesh(g,new THREE.MeshBasicMaterial()))[0],ground=ray.intersectObject(new THREE.Mesh(terrainGeometry(result),new THREE.MeshBasicMaterial()))[0];assert.ok(top&&ground);assert.ok(ground.point.y<=top.point.y+.005,'the steep grade valley is bridged by a terrain chord above its road surface');
});

test('retaining basements have explicit height and burial limits and preserve access conflicts',()=>{
  const {data}=fixture();data.points=data.points.map(q=>[250,q[1],q[2]]);const pixels=new Uint16Array(41*41).fill(3401);pixels[15*41+20]=2701;const terrain=new Terrain(data.terrain,pixels),footprint=[[-35,-170],[15,-170],[15,-230],[-35,-230]],tile=(id:string,height:number):WorldTile=>({id,bounds:[-200,-400,0,0],roads:[],buildings:[{id:'slope-building',height,footprint}]});
  const supported=buildTile(tile('retaining',8),new RouteGeometry(data),terrain),building=supported.placements.find(p=>p.id==='slope-building'&&p.family==='building');assert.ok(building);assert.equal(building.foundationStyle,'bounded retaining basement');assert.ok(Number(building.foundationRelief)>5);assert.ok(Number(building.foundationRelief)<=Number(building.maximumSupportHeight));assert.ok(Number(building.buriedWallFraction)>=.5);
  const limited=buildTile(tile('height-limited',3),new RouteGeometry(data),terrain),rejected=limited.placements.find(p=>p.id==='slope-building'&&p.family==='rejected-building');assert.ok(rejected);assert.ok(String(rejected.reason).includes('bounded height'));assert.ok(!limited.placements.some(p=>p.id==='slope-building'&&p.family==='building'),'a small house must not turn into an unbounded foundation tower');
  data.surfaceRoads=[{id:'mapped-building-access',kind:'service',width:3.4,bounds:[10,-220,10,-180],points:[[10,54,-180],[10,54,-220]]}];
  const access=buildTile(tile('access-conflict',8),new RouteGeometry(data),terrain),conflict=access.placements.find(p=>p.id==='slope-building'&&p.family==='rejected-building');assert.ok(conflict);assert.ok(String(conflict.reason).includes('mapped access'));assert.ok((conflict.blockedRoads as {id:string}[]).some(r=>r.id==='mapped-building-access'),'an unresolved road passage must remain explicit instead of becoming a solid plinth');
});

test('emitted rail heads measure1.435m inside gauge on a canted section and have a full profile',()=>{
  const {data,terrain}=fixture(),route=new RouteGeometry(data),bank=.075,original=route.lanePose.bind(route);route.lanePose=(s,lane)=>({...original(s,lane),bank});
  const result=buildTile({id:'physical-gauge',bounds:[-40,-160,40,-80],roads:[],buildings:[]},route,terrain),color=new THREE.Color(0xa2aaa5),heads:[number,number,number][]=[],profileYs=new Set<number>();
  for(let i=0;i<result.mesh.position.length;i+=3){const x=result.mesh.position[i]-.25,y=result.mesh.position[i+1]-50,z=result.mesh.position[i+2];if(Math.abs(z+100)>.0001||Math.abs(x)>1.1||Math.abs(result.mesh.color[i]-color.r)>1e-6||Math.abs(result.mesh.color[i+1]-color.g)>1e-6||Math.abs(result.mesh.color[i+2]-color.b)>1e-6)continue;
    profileYs.add(Math.round((y*Math.cos(bank)-x*Math.sin(bank))*1000));if(Math.abs(y*Math.cos(bank)-x*Math.sin(bank))<1e-5)heads.push([x,y,z]);}
  const lateral=(p:[number,number,number])=>p[0]*Math.cos(bank)+p[1]*Math.sin(bank),left=heads.filter(p=>lateral(p)<0).sort((a,b)=>lateral(b)-lateral(a))[0],right=heads.filter(p=>lateral(p)>0).sort((a,b)=>lateral(a)-lateral(b))[0];assert.ok(left&&right);assert.ok(Math.abs(Math.hypot(...left.map((x,i)=>right[i]-x))-1.435)<.0002,'gauge is measured between head inner faces, not head centres');assert.ok(profileYs.size>=4,'head,web andfoot must expose distinct height levels');
  const turnout=new AssetFactory().turnout({id:'physical-prototype'}),stock:THREE.Box3[]=[];turnout.updateMatrixWorld(true);turnout.traverse(node=>{if(node.userData.railProfile==='head'){const bounds=new THREE.Box3().setFromObject(node);if(bounds.min.z<-.5&&bounds.max.z>-.5)stock.push(bounds);}});assert.equal(stock.length,2);stock.sort((a,b)=>a.min.x-b.min.x);assert.ok(Math.abs(stock[1].min.x-stock[0].max.x-1.435)<.0002);
});

test('actual sleeper bottom corners contact canted ballast for both banks, grades and directions',()=>{
  const verify=(data:RouteData,route:RouteGeometry,terrain:Terrain,bounds:number[])=>{
    const sleepers:THREE.Mesh[]=[],original=Batch.prototype.add;Batch.prototype.add=function(object){if(object.userData.family==='running-sleeper')sleepers.push(object as THREE.Mesh);return original.call(this,object);};
    let result:ReturnType<typeof buildTile>;try{result=buildTile({id:'sleeper-contact',bounds,roads:[],buildings:[]},route,terrain);}finally{Batch.prototype.add=original;}
    const ballast=new THREE.Color(0x8b887c),positions:number[]=[];for(let i=0;i<result.mesh.index.length;i+=3){const ids=[result.mesh.index[i],result.mesh.index[i+1],result.mesh.index[i+2]],v=ids[0]*3;if(Math.abs(result.mesh.color[v]-ballast.r)<1e-6&&Math.abs(result.mesh.color[v+1]-ballast.g)<1e-6&&Math.abs(result.mesh.color[v+2]-ballast.b)<1e-6)for(const id of ids)positions.push(...result.mesh.position.slice(id*3,id*3+3));}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));const bed=new THREE.Mesh(g,new THREE.MeshBasicMaterial({side:THREE.DoubleSide}));let checked=0;
    // Longitudinal8m bed segments are owned by their midpoint; this fixture
    // queries the fully emitted interior rather than an unloaded neighbour.
    for(const sleeper of sleepers){if(sleeper.position.x<bounds[0]+8||sleeper.position.x>bounds[2]-8||sleeper.position.z<bounds[1]+8||sleeper.position.z>bounds[3]-8)continue;sleeper.updateMatrixWorld(true);const up=new THREE.Vector3().setFromMatrixColumn(sleeper.matrixWorld,1).normalize();
      for(const x of[-.5,.5])for(const z of[-.5,.5]){const corner=new THREE.Vector3(x,-.5,z).applyMatrix4(sleeper.matrixWorld),ray=new THREE.Raycaster(corner.clone().addScaledVector(up,.02),up.clone().negate(),0,.05),hit=ray.intersectObject(bed)[0];assert.ok(hit,`${sleeper.userData.id}: no emitted ballast below an actual bottom corner`);assert.ok(Math.abs(hit.distance-.02)<.01,`${sleeper.userData.id}: actual sleeper↔ballast gap exceeds10mm`);checked++;}
    }assert.ok(checked>40,'contact check must exercise real geometry on multiple sleepers');
  };
  for(const bank of[-.075,.075])for(const grade of[-.035,.035])for(const direction of[-1,1]){
    const {data,terrain}=fixture();data.points=data.points.map(q=>[q[0],50+grade*(100-q[2]),q[2]]);if(direction<0)data.points.reverse();data.opposingOffsets=data.points.map(()=>-3.3);const route=new RouteGeometry(data),sample=route.lanePose.bind(route);route.lanePose=(s,lane)=>({...sample(s,lane),bank});verify(data,route,terrain,[-20,-160,20,-80]);
  }
  {const{data,terrain}=fixture();data.points=data.points.map(q=>[.25+4*Math.sin(q[2]/24),50+.025*q[2],q[2]]);data.opposingOffsets=data.points.map(()=>-3.3);verify(data,new RouteGeometry(data),terrain,[-20,-160,20,-80]);}
  for(const bank of[-.075,.075])for(const grade of[-.04,.04]){
    const {data,terrain}=fixture();data.points=data.points.map(q=>[250,q[1],q[2]]);data.adjacentServices=[{id:'canted-context',points:[[-80,50-grade*80,-200],[80,50+grade*80,-200]],metadata:{contextOnly:true,endpointBank:bank,endpointRight:[0,0,1]}}];verify(data,new RouteGeometry(data),terrain,[-80,-220,-40,-180]);
  }
});

test('source switch tops own coplanar bed overlaps while lower source beds stay hidden',()=>{
  const run=(top:number)=>{const{data,terrain}=fixture();data.opposingOffsets=data.points.map(()=>-3.3);data.trackwork=[{id:'source-bed-owner',lane:0,startS:200,endS:232,supportPaths:[[[.25,50,-100],[.25,50,-132]]],formationSections:[{topLeft:[-4.6,top,-100],topRight:[1.9,top,-100],bottomLeft:[-4.95,49.36,-100],bottomRight:[2.25,49.36,-100]},{topLeft:[-4.6,top,-132],topRight:[1.9,top,-132],bottomLeft:[-4.95,49.36,-132],bottomRight:[2.25,49.36,-132]}]}];
    const result=buildTile({id:'ownership',bounds:[-20,-160,20,-80],roads:[],buildings:[]},new RouteGeometry(data),terrain),color=new THREE.Color(0x8b887c),positions:number[]=[];
    for(let i=0;i<result.mesh.index.length;i+=3){const ids=[result.mesh.index[i],result.mesh.index[i+1],result.mesh.index[i+2]],v=ids[0]*3;if(Math.abs(result.mesh.color[v]-color.r)<1e-6&&Math.abs(result.mesh.color[v+1]-color.g)<1e-6&&Math.abs(result.mesh.color[v+2]-color.b)<1e-6&&result.mesh.normal[v+1]>.8)for(const id of ids)positions.push(...result.mesh.position.slice(id*3,id*3+3));}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));return{result,mesh:new THREE.Mesh(g,new THREE.MeshBasicMaterial({side:THREE.DoubleSide}))};
  };
  const tie=run(49.71);assert.ok(tie.result.checks.sourceBedTopTrianglesClipped>0);let samples=0;
  for(let x=-4.2;x<=-1.9;x+=.23)for(let z=-129;z<=-103;z+=.47){const ray=new THREE.Raycaster(new THREE.Vector3(x,49.73,z),new THREE.Vector3(0,-1,0),0,.04);assert.equal(ray.intersectObject(tie.mesh).length,0,'ordinary/source coplanar top remains in the actual emitted mesh');samples++;}assert.ok(samples>400);
  const outside=new THREE.Raycaster(new THREE.Vector3(-3.05,49.74,-95),new THREE.Vector3(0,-1,0),0,.06).intersectObject(tie.mesh)[0];assert.ok(outside,'ordinary bed outside the source footprint must remain');
  const lower=run(49.69),retained=new THREE.Raycaster(new THREE.Vector3(-3.05,49.74,-116),new THREE.Vector3(0,-1,0),0,.06).intersectObject(lower.mesh)[0];assert.ok(retained&&Math.abs(retained.point.y-49.71)<.001,'a source bed below the ordinary top must not remove its support');
  const embedded=run(49.75);assert.ok(embedded.result.checks.sourceBedSleeperCornersCovered>0);assert.ok(Math.abs(embedded.result.checks.sourceBedMaximumSleeperEmbed-.04)<.002);assert.equal(embedded.result.checks.sourceBedSleeperEmbedFailures,0);
  assert.ok(run(49.80).result.checks.sourceBedSleeperEmbedFailures>0,'embedding beyond half the actual sleeper thickness must be reported');
});

test('actual cable-trough undersides follow a3% cooked slope and reject an unowned underpass',()=>{
  const {data,terrain}=fixture();data.points=data.points.map(q=>[q[0],50+.03*(100-q[2]),q[2]]);const route=new RouteGeometry(data),bounds=[-20,-320,20,-120],result=buildTile({id:'graded-trough',bounds,roads:[],buildings:[]},route,terrain),troughs=result.placements.filter(p=>p.family==='cable-trough');assert.ok(troughs.length>2);assert.ok(troughs.every(p=>p.supportKind==='ground'&&(p.supportOwners as string[]).every(id=>id.startsWith('ground/'))));
  const soil=new THREE.Mesh(terrainGeometry(result),new THREE.MeshBasicMaterial()),colors=[0x96998f,0x9e9f92].map(c=>new THREE.Color(c)),points=new Map<string,THREE.Vector3>();let lidFaces=0;
  for(let i=0;i<result.mesh.index.length;i+=3){const ids=[result.mesh.index[i],result.mesh.index[i+1],result.mesh.index[i+2]],v=ids[0]*3;if(result.mesh.normal[v+1]<-.5&&colors.some(c=>Math.abs(result.mesh.color[v]-c.r)<1e-6&&Math.abs(result.mesh.color[v+1]-c.g)<1e-6&&Math.abs(result.mesh.color[v+2]-c.b)<1e-6)){
      const vertices=ids.map(id=>new THREE.Vector3(...result.mesh.position.slice(id*3,id*3+3)));for(const p of[...vertices,vertices[0].clone().add(vertices[1]).add(vertices[2]).multiplyScalar(1/3)])if(p.z>bounds[1]+10&&p.z<bounds[3]-10)points.set(`${p.x.toFixed(4)},${p.z.toFixed(4)}`,p);
    }const lid=new THREE.Color(0xb9bcb1);if(Math.abs(result.mesh.color[v]-lid.r)<1e-6&&Math.abs(result.mesh.color[v+1]-lid.g)<1e-6&&Math.abs(result.mesh.color[v+2]-lid.b)<1e-6)lidFaces++;
  }
  assert.ok(points.size>40&&lidFaces>0,'the fixture must contain complete body bottoms and lids');for(const p of points.values()){const hit=new THREE.Raycaster(p.clone().add(new THREE.Vector3(0,.05,0)),new THREE.Vector3(0,-1,0),0,.10).intersectObject(soil)[0];assert.ok(hit);assert.ok(Math.abs(hit.point.y-p.y)<.01,'a trough end or midspan floats above the actual cooked slope');}
  const flat=fixture(),blocked=buildTile({id:'unowned-trough',bounds:[-40,-260,40,-140],roads:[{id:'lower-road',kind:'residential',width:6,points:[[-40,44,-200],[.25,44,-200],[40,44,-200]]}],buildings:[]},new RouteGeometry(flat.data),flat.terrain);
  assert.ok(blocked.placements.some(p=>p.family==='unsupported-source-attachment'&&p.assetFamily==='cable-trough'&&String(p.rule).includes('opening')),'an unconfirmed underpass attachment must be rejected and recorded');
});
