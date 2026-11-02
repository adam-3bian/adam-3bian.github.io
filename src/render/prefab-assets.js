import * as THREE from 'three';
import { Batch } from './batch.js';
import { AssetFactory } from './assets.js';
import { GRID, position } from '../world/grid.js';
import { resolveComposition, transform } from '../world/prefab-composition.js';

const geometry = new THREE.BoxGeometry(1,1,1), materials = new Map(), factory = new AssetFactory();
function box(parent, p, size, colour) {
    if (!materials.has(colour)) materials.set(colour, new THREE.MeshStandardMaterial({color:colour}));
    const mesh = new THREE.Mesh(geometry, materials.get(colour)); mesh.position.fromArray(p); mesh.scale.fromArray(size); parent.add(mesh); return mesh;
}
function quad(batch, a,b,c,d,colour) { const col=new THREE.Color(colour); batch.triangle(a,b,c,col); batch.triangle(a,c,d,col); }
function solid(batch, corners, low, high, colour) {
    const lower=corners.map((p,i)=>[p[0],typeof low==='function'?low(p,i):low,p[2]]), upper=corners.map((p,i)=>[p[0],typeof high==='function'?high(p,i):high,p[2]]);
    quad(batch,upper[0],upper[3],upper[2],upper[1],colour);
    quad(batch,lower[0],lower[1],lower[2],lower[3],colour);
    for(let i=0;i<4;i++){const j=(i+1)%4;quad(batch,lower[i],upper[i],upper[j],lower[j],colour);}
}

/** Static packets share the simulator's Batch/AssetFactory and worker protocol.
 * Coordinates are local to the owner chunk; logical IDs survive batching. */
export function composePrefabChunk(chunk, catalogue, enums, context=[chunk], progress) {
    const world=resolveComposition(context,catalogue,enums), batch=new Batch(), placements=[], origin=[chunk.bounds[0],0,chunk.bounds[1]];
    const local=p=>[p[0]-origin[0],p[1],p[2]-origin[2]];
    for(const c of chunk.terrain) for(const t of world.terrain.triangles(c)) batch.triangle(...t.map(local),new THREE.Color(c.material==='GRAVEL'?0x8b887c:0x7e8f66));
    let done=0;
    for(const instance of [...chunk.instances].sort((a,b)=>a.id.localeCompare(b.id))) {
        const {definition:d,path,footprint}=world.instances.get(instance.id), type=d.geometry.type, p=position(instance.anchor), group=new THREE.Group();
        if(type==='transport' || type==='platform') {
            const rail=type==='transport' && d.geometry.mode==='rail', route=path || world.paths.get(instance.track), stepCount=Math.ceil(route.length/.75);
            const point=(s,side,up)=>{const q=route.sample(s);return local(q.position.map((v,k)=>v+q.right[k]*side+(k===1?up:0)));};
            for(let n=0;n<stepCount;n++) {
                const a=route.length*n/stepCount,b=route.length*(n+1)/stepCount;
                if(type==='platform') {
                    const offset=d.geometry.trackOffset,width=d.dimensions[2],top=d.geometry.boardingHeight;
                    const corners=[point(a,offset-width/2,top),point(b,offset-width/2,top),point(b,offset+width/2,top),point(a,offset+width/2,top)];
                    solid(batch,corners,q=>world.terrain.raw(q[0]+origin[0],q[2]+origin[2]),q=>q[1],0x8c796c);
                    const edge=offset-width/2;quad(batch,point(a,edge,top+.006),point(a,edge+.35,top+.006),point(b,edge+.35,top+.006),point(b,edge,top+.006),0xe8dcc1);
                } else {
                    const w=rail?2:d.dimensions[2]/2, top=rail?-.17:0;
                    const corners=[point(a,-w,top),point(b,-w,top),point(b,w,top),point(a,w,top)];
                    solid(batch,corners,q=>instance.support?q[1]-.08:world.terrain.raw(q[0]+origin[0],q[2]+origin[2])+.005,q=>q[1],rail?0x8b887c:0x686c68);
                    if(rail) for(const side of [-1,1]) {
                        const left=side*.755-.0375,right=side*.755+.0375,c=[point(a,left,0),point(b,left,0),point(b,right,0),point(a,right,0)];
                        solid(batch,c,q=>q[1]-.14,q=>q[1],0xa2aaa5);
                    }
                }
            }
            if(rail) for(let s=.3;s<route.length;s+=.65) {
                const q=route.sample(s), sleeper=box(group,local(q.position).map((v,k)=>v-(k===1?.18:0)),[.24,.16,2.5],0x635a4d);
                sleeper.rotation.y=-Math.atan2(q.tangent[2],q.tangent[0]);
                sleeper.rotation.z=Math.atan(q.grade);
            }
            // These meshes are already in chunk coordinates.
            batch.add(group);
        } else {
            if(type==='building') {
                const body=factory.building({id:instance.id,...d.geometry.config,seed:instance.variant.seed}); group.add(body);
                const bottom=instance.foundation.bottomTicks*GRID.heightStep-p[1];box(group,[0,bottom/2,0],[d.dimensions[0],-bottom,d.dimensions[2]],0x8e887c);
            } else if(type==='warehouse') {
                const [w,h,depth]=d.dimensions,bottom=instance.foundation.bottomTicks*GRID.heightStep-p[1];
                box(group,[0,bottom/2,0],[w,-bottom,depth],0x8e887c);
                box(group,[0,h/2,0],[w,h,depth],0x969e99);
                // Portal-frame bays, shallow pitched roof, industrial doors and clerestory glazing.
                for(const side of [-1,1]) {
                    const roof=box(group,[side*w/4,h+.7,0],[Math.hypot(w/2,1.4),.18,depth+.4],0x596365);roof.rotation.z=-side*Math.atan2(1.4,w/2);
                    for(let z=-depth/2+2;z<depth/2;z+=4) box(group,[side*(w/2+.03),h/2,z],[.14,h,.16],0x657272);
                }
                for(const x of [-w*.28,w*.28]) {box(group,[x,2,depth/2+.04],[4,4,.12],0x4c595a);for(let y=.3;y<4;y+=.32)box(group,[x,y,depth/2+.12],[4,.045,.03],0x8d9693);box(group,[x,h-.8,depth/2+.06],[4,.6,.08],0x3c5660);}
            } else if(type==='tree') group.add(factory.tree({id:instance.id,...d.geometry.config,seed:instance.variant.seed}));
            else if(type==='fence') {
                for(let x=0;x<=d.dimensions[0];x+=2) {const q=transform(instance,[x,0,0]),h=world.terrain.raw(q[0],q[2])-p[1];box(group,[x,h+.6,0],[.12,1.2,.12],0x785449);}
                for(let x=0;x<d.dimensions[0];x+=2) {const a=transform(instance,[x,0,0]),b=transform(instance,[x+2,0,0]),ya=world.terrain.raw(a[0],a[2])-p[1],yb=world.terrain.raw(b[0],b[2])-p[1];for(const y of [.4,.9]){const beam=box(group,[x+1,(ya+yb)/2+y,0],[Math.hypot(2,yb-ya),.12,.1],0x785449);beam.rotation.z=Math.atan2(yb-ya,2);}}
            } else if(type==='bridge') {
                const [length,,width]=d.dimensions,depth=d.geometry.deckDepth;
                box(group,[length/2,-depth/2,0],[length,depth,width],0x727c78);
                for(const side of [-1,1])box(group,[length/2,.45,side*(width/2-.15)],[length,1.25,.3],0x5f7067);
                d.geometry.bearings.forEach((b,n)=>{const low=instance.supports[n].bottomTicks*GRID.heightStep-p[1];box(group,[b[0],(low-depth)/2,b[2]],[1.5,-depth-low,width],0x9b8874);});
            } else if(type==='junction') {
                box(group,[0,-.05,0],[16,.1,6],0x686c68);box(group,[0,-.05,5.5],[6,.1,5],0x686c68);
            } else throw new Error(`Missing prefab renderer ${type}`);
            group.position.fromArray(local(p));group.rotation.y=-instance.rotation*Math.PI/2;batch.add(group);
        }
        placements.push({id:instance.id,prefabId:instance.prefabId,owner:chunk.id,position:p,cells:world.instances.get(instance.id).cells});
        progress?.(++done/chunk.instances.length);
    }
    const mesh=batch.packet();
    return {mesh,origin,placements,roads:[],pedestrianPaths:[],checks:{instances:placements.length,terrainCells:chunk.terrain.length,triangleCount:mesh.index.length/3}};
}
