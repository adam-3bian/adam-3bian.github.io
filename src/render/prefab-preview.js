import * as THREE from 'three';
import {GridWorld,sha256} from '../world/grid-world.js';
import {packetGeometry} from './batch.js';
import {resolveComposition} from '../world/prefab-composition.js';

const viewport=document.getElementById('viewport'),status=document.getElementById('status'),error=document.getElementById('error');
const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));viewport.append(renderer.domElement);
const scene=new THREE.Scene();scene.background=new THREE.Color(0xd6e0e4);
scene.add(new THREE.HemisphereLight(0xf3f5ec,0x66745e,2.4));const sun=new THREE.DirectionalLight(0xfff2d5,2.5);sun.position.set(-60,160,-100);scene.add(sun);
const camera=new THREE.PerspectiveCamera(55,1,.1,2500),material=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.94,side:THREE.DoubleSide,flatShading:true});
let world,chunks,model,group,worker,token=0,driving=false,distance=0,last=performance.now(),pending=new Map();
const fail=e=>{error.hidden=false;error.textContent=String(e?.message||e);status.textContent='Required scene data could not be composed.';};
const resize=()=>{renderer.setSize(viewport.clientWidth,viewport.clientHeight);camera.aspect=viewport.clientWidth/viewport.clientHeight;camera.updateProjectionMatrix();};new ResizeObserver(resize).observe(viewport);
function context(){driving=false;const [x,y,z]=world.document.origin;camera.position.set(x-60,y+150,z+210);camera.lookAt(x+72,y+1,z+40);}
function startWorker(){
    worker?.terminate();for(const p of pending.values()){clearTimeout(p.timer);p.reject(new Error('Scene reload superseded pending composition'));}pending.clear();
    worker=new Worker(new URL('../world/world.worker.js',import.meta.url),{type:'module'});
    worker.onmessage=({data:m})=>{const p=pending.get(m.token);if(!p)return;if(m.type==='progress'){status.textContent=`Composing ${m.id}: ${Math.round(m.fraction*100)}%`;return;}pending.delete(m.token);clearTimeout(p.timer);m.type==='error'?p.reject(new Error(m.message)):p.resolve(m);};
    worker.onerror=e=>{for(const p of pending.values()){clearTimeout(p.timer);p.reject(new Error(e.message||'Prefab worker failed'));}pending.clear();};
}
async function apply(next){
    error.hidden=true;model=resolveComposition(next,world.catalogue,world.enums);
    const nextGroup=new THREE.Group(),packets=[];
    try {
        for(const chunk of next){
            const request=++token;
            const message=await new Promise((resolve,reject)=>{const timer=setTimeout(()=>{pending.delete(request);reject(new Error(`Composition timed out for ${chunk.id}`));},30000);pending.set(request,{resolve,reject,timer});worker.postMessage({type:'build',token:request,tile:{...chunk,compositionSchema:1,catalogue:world.catalogue,enums:world.enums,context:next}});});
            const mesh=new THREE.Mesh(packetGeometry(message.mesh),material);mesh.position.fromArray(message.origin);nextGroup.add(mesh);packets.push(message);
        }
    } catch(e){nextGroup.traverse(n=>n.geometry?.dispose());throw e;}
    if(group){scene.remove(group);group.traverse(n=>n.geometry?.dispose());}group=nextGroup;chunks=next;scene.add(group);
    renderer.render(scene,camera);renderer.getContext().finish();
    const summary={instances:packets.flatMap(p=>p.placements).length,triangles:packets.reduce((n,p)=>n+p.checks.triangleCount,0),chunks:packets.length,drawCalls:renderer.info.render.calls};
    status.textContent=`${summary.instances} placed objects · ${summary.chunks} chunks · ${summary.triangles.toLocaleString()} triangles · ${summary.drawCalls} draw calls`;
    return summary;
}
async function load(saved){
    startWorker();world=await GridWorld.loadComposition(document.baseURI,saved);
    const tiles=await Promise.all(world.document.tiles.map(t=>world.tile(t.id)));context();
    const summary=await apply(tiles.map(({compositionSchema,catalogue,enums,context,...chunk})=>chunk));
    return summary;
}
document.getElementById('context').onclick=context;
document.getElementById('drive').onclick=()=>{distance=0;driving=true;};
document.getElementById('reload').onclick=()=>load().catch(fail);
function animate(now){
    const dt=Math.min((now-last)/1000,.05);last=now;
    if(driving&&model){
        const route=['rail-0','rail-1','rail-2','rail-3','rail-curve','rail-exit'].map(id=>model.paths.get(id));
        distance+=dt*8;let s=distance;for(const path of route){if(s<=path.length){const q=path.sample(s);camera.position.fromArray(q.position).y+=2.6;camera.lookAt(q.position[0]+q.tangent[0]*20,q.position[1]+2.6+q.tangent[1]*20,q.position[2]+q.tangent[2]*20);break;}s-=path.length;}
        if(distance>route.reduce((n,p)=>n+p.length,0))distance=0;
    }
    renderer.render(scene,camera);requestAnimationFrame(animate);
}
resize();requestAnimationFrame(animate);
window.__prefab={apply,load,get chunks(){return chunks;},get model(){return model;},get world(){return world;},get camera(){return camera;},get renderer(){return renderer;},get scene(){return scene;},context,
    snapshot:async()=>{const snapshot=structuredClone(await world.snapshot());for(const chunk of chunks){const text=JSON.stringify(chunk);snapshot.tiles[chunk.id]=text;snapshot.document.tiles.find(t=>t.id===chunk.id).sha256=await sha256(new TextEncoder().encode(text));}snapshot.document.revision=await sha256(new TextEncoder().encode(JSON.stringify(snapshot.document.tiles)));return snapshot;}};
load().then(summary=>{window.__prefab.ready=summary;}).catch(fail);
