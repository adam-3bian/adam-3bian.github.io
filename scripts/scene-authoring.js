/** Offline-only conversion of a resolved source scene into editable prefab assemblies.
 * The normal renderer never invokes this recorder or the old placement algorithm. */
import * as THREE from 'three';
import {createHash} from 'node:crypto';
import {Batch} from '../src/render/batch.js';
import {anchor,position,GRID} from '../src/world/grid.js';

const digest=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex').slice(0,20);
const clean=n=>Math.abs(n)<1e-10?0:Number(n.toFixed(7));
const kindFor=(family,fallback)=>/cat/.test(family)?'CHARACTER_SPAWN':/vegetation|tree/.test(family)?'TREE':/building/.test(family)?'BUILDING':/station/.test(family)?'STATION':/bridge|arch/.test(family)?'BRIDGE':/tunnel/.test(family)?'TUNNEL':/buffer|bench|bin|lamp|cabinet|sign|clock|cctv|help|ticket|planter|rack|departure/.test(family)?'RAILWAY_FURNITURE':fallback||'LEGACY_UNKNOWN';
export class SceneRecorder {
    constructor(tile){this.tile=tile;this.geometries={};this.prefabs={};this.instances=[];this.characters=[];this.surfaces=new Map();this.ids=new Map();this.degenerate=0;}
    geometry(g){
        const p=g.getAttribute('position'),n=g.getAttribute('normal'),c=g.getAttribute('color');if(!p)throw Error('Cannot author geometry without positions');
        g.computeBoundingBox();const centre=g.boundingBox.getCenter(new THREE.Vector3()),positions=[],colours=[],indices=[],vertices=new Map(),remap=[];
        for(let i=0;i<p.count;i++){
            const xyz=[Math.round((p.getX(i)-centre.x)*1000),Math.round((p.getY(i)-centre.y)*1000),Math.round((p.getZ(i)-centre.z)*1000)],rgb=c?[c.getX(i),c.getY(i),c.getZ(i)].map(v=>Math.round(v*255)):null,key=xyz.join(',')+'/'+(rgb?.join(',')||'');
            if(!vertices.has(key)){vertices.set(key,positions.length/3);positions.push(...xyz);if(rgb)colours.push(...rgb);}remap.push(vertices.get(key));
        }
        for(let i=0;i<(g.index?.count??p.count);i+=3){const tri=[0,1,2].map(k=>remap[g.index?g.index.getX(i+k):i+k]),a=new THREE.Vector3().fromArray(positions,tri[0]*3),b=new THREE.Vector3().fromArray(positions,tri[1]*3),d=new THREE.Vector3().fromArray(positions,tri[2]*3);if(b.sub(a).cross(d.sub(a)).lengthSq()<1e-12){this.degenerate++;continue;}indices.push(...tri);}
        const value={position:positions,positionScale:.001,index:indices,...colours.length?{color:colours,colorScale:1/255}:{}};const id=`geometry/${digest(value)}`;this.geometries[id]??=value;return {id,centre};
    }
    character(object){
        object.updateMatrixWorld(true);const p=new THREE.Vector3(),q=new THREE.Quaternion(),scale=new THREE.Vector3();object.matrixWorld.decompose(p,q,scale);
        const id=object.userData.id||`cat/${this.tile.id}/${this.characters.length}`;
        if(!this.characters.some(c=>c.id===id))this.characters.push({id,prefabId:'character/anthropomorphic-cat',anchor:anchor(p.toArray()),position:p.toArray().map(clean),yaw:new THREE.Euler().setFromQuaternion(q).y,role:object.userData.role||'COMMUTER',seed:object.userData.seed,state:'WAIT',support:'PLATFORM_SURFACE',source:{confidence:'ENGINEERED_INFERENCE',note:'Existing supported platform attachment; recorded offline'}});
    }
    add(object,source={id:'source',kind:'LEGACY_UNKNOWN'}){
        object.updateMatrixWorld(true);const detached=[];
        object.traverse(n=>{if(n.userData.character)detached.push(n);});
        for(const c of detached)this.character(c);
        const catSet=new Set(detached),isCat=n=>{for(let p=n;p;p=p.parent)if(catSet.has(p))return true;return false;};
        const parts=[],root=object.matrixWorld.clone(),inverse=root.clone().invert();
        object.traverse(n=>{
            if(!n.isMesh||isCat(n))return;const geo=this.geometry(n.geometry),m=inverse.clone().multiply(n.matrixWorld).multiply(new THREE.Matrix4().makeTranslation(...geo.centre.toArray())),mat=Array.isArray(n.material)?n.material[0]:n.material;
            parts.push({geometry:geo.id,matrix:m.elements.map(clean),color:(mat.color||new THREE.Color(0xffffff)).toArray().map(clean)});
        });
        if(!parts.length)return;
        const family=object.userData.family||source.family||source.kind,kind=kindFor(family,source.kind),definition={kind,family,parts},prefabId=`prefab/${String(family).toLowerCase().replace(/[^a-z0-9-]/g,'-')}/${digest(definition)}`;
        if(!this.prefabs[prefabId]){
            const bbox=new THREE.Box3().setFromObject(object),size=bbox.getSize(new THREE.Vector3());
            this.prefabs[prefabId]={...definition,dimensions:size.toArray().map(clean),orientations:['SOURCE_TRANSFORM'],placementRule:['BUILDING','INDUSTRIAL_BUILDING','STATION'].includes(kind)?'LEVEL_FOUNDATION_REQUIRED':kind==='TREE'?'FOLLOWS_GROUND':kind==='TERRAIN'?'ENGINEERED_STRUCTURE':'LEVEL_COMPONENT_REQUIRED',supportRequirements:object.userData.supportAnchors||[],clearance:{type:'SOURCE_ASSEMBLY_BOUNDS'},ports:[],lod:{policy:'CHUNK_BATCH'},implementationStatus:'IMPLEMENTED'};
        }
        const p=new THREE.Vector3().setFromMatrixPosition(root),gridAnchor=anchor(p.toArray()),base=position(gridAnchor);root.elements[12]-=base[0];root.elements[13]-=base[1];root.elements[14]-=base[2];
        const originalId=object.userData.id||source.id||`${this.tile.id}/legacy-unknown`,seq=this.ids.get(originalId)||0;this.ids.set(originalId,seq+1);const id=seq?`${originalId}/component/${seq}`:originalId;
        const bbox=new THREE.Box3().setFromObject(object),bounds=[bbox.min.x,bbox.min.y,bbox.min.z,bbox.max.x,bbox.max.y,bbox.max.z].map(clean);
        this.instances.push({id,prefabId,anchor:gridAnchor,transform:root.elements.map(clean),bounds,owner:this.tile.id,sourceId:source.id,source:{confidence:object.userData.confidence||'ENGINEERED_INFERENCE',reference:object.userData.source||source.source||'legacy source scene'},supportAnchors:object.userData.supportAnchors||[]});
    }
    triangle(a,b,c,color,source={id:'source',kind:'LEGACY_UNKNOWN'}){
        const u=new THREE.Vector3(...b).sub(new THREE.Vector3(...a)),v=new THREE.Vector3(...c).sub(new THREE.Vector3(...a));if(u.cross(v).lengthSq()<1e-16){this.degenerate++;return;}
        const key=`${source.kind}/${source.id}`,entry=this.surfaces.get(key)||{source,triangles:[],colors:[]};entry.triangles.push(...a,...b,...c);entry.colors.push(color.r,color.g,color.b);this.surfaces.set(key,entry);
    }
    finish(result){
        for(const {source,triangles,colors} of this.surfaces.values()){
            const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(triangles,3));g.computeVertexNormals();
            const vertexColours=[];for(let i=0;i<colors.length;i+=3)for(let j=0;j<3;j++)vertexColours.push(...colors.slice(i,i+3));g.setAttribute('color',new THREE.Float32BufferAttribute(vertexColours,3));
            const object=new THREE.Mesh(g,new THREE.MeshStandardMaterial({color:0xffffff}));object.userData={id:`${source.id}/surface`,family:source.kind};this.add(object,source);g.dispose();object.material.dispose();
        }
        for(const path of result.pedestrianPaths||[]){const navigation={...path,role:path.role==='staff'?'PLATFORM_DISPATCHER':'COMMUTER'},c=this.characters.find(c=>c.id===path.id);if(c)c.navigation=navigation;else this.characters.push({id:path.id,prefabId:'character/anthropomorphic-cat',anchor:anchor(path.points[0]),position:path.points[0],yaw:0,role:navigation.role,seed:parseInt(digest(path.id).slice(0,7),16),state:'WALK',support:'PLATFORM_SURFACE',navigation});}
        const cells=new Map();
        for(const i of this.instances){const [x,y,z,X,Y,Z]=i.bounds;i.occupancy=[];for(let cx=Math.floor(x/GRID.cellSize);cx<=Math.floor(X/GRID.cellSize);cx++)for(let cz=Math.floor(z/GRID.cellSize);cz<=Math.floor(Z/GRID.cellSize);cz++){const key=`${cx},${cz}`;i.occupancy.push(key);const list=cells.get(key)||[];list.push(i.id);cells.set(key,list);}i.heightBand=[Math.floor(y/GRID.heightStep),Math.ceil(Y/GRID.heightStep)];}
        const represented=new Set([...this.instances.map(i=>i.sourceId),...result.placements.filter(p=>!/rejected|unsupported/.test(p.family)).map(p=>p.sourceId||p.id)]),exceptions=result.placements.filter(p=>/rejected|unsupported/.test(p.family));
        for(const collection of ['buildings','roads','land','platforms'])for(const record of this.tile[collection]||[])if(!represented.has(record.id)&&!exceptions.some(e=>e.id===record.id))exceptions.push({id:record.id,collection,reason:'SOURCE_RETAINED_WITHOUT_SEPARATE_RENDER_ASSEMBLY',sourceRecord:record});
        return {schema:2,composition:'AUTHORED_PREFABS',id:this.tile.id,bounds:this.tile.bounds,geometries:this.geometries,prefabs:this.prefabs,instances:this.instances,constructionTiles:[...cells].map(([cell,instances])=>({cell:cell.split(',').map(Number),instances})),characters:this.characters,roads:result.roads,placements:result.placements,exceptions,checks:{...result.checks,degenerateTrianglesRemoved:this.degenerate},source:{method:'offline scene authoring; explicit placements and shared component geometries',sourceTile:this.tile.id,originalRecords:this.tile}};
    }
}

export function recordScene(tile,build){
    const recorder=new SceneRecorder(tile),add=Batch.prototype.add,triangle=Batch.prototype.triangle;
    Batch.prototype.add=function(object){
        recorder.add(object,this.source);if(object.userData.character)return;
        const detached=[];object.traverse(n=>{if(n.userData.character)detached.push([n,n.parent]);});
        for(const [n,p] of detached)p.remove(n);
        try{return add.call(this,object);}finally{for(const [n,p] of detached)p.add(n);}
    };
    Batch.prototype.triangle=function(a,b,c,color){recorder.triangle(a,b,c,color,this.source);return triangle.call(this,a,b,c,color);};
    try {const result=build();return {document:recorder.finish(result),original:result};}
    finally{Batch.prototype.add=add;Batch.prototype.triangle=triangle;}
}
