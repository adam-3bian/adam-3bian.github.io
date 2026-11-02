import {position} from './grid.js';
import * as THREE from 'three';
import {AuthoredGround} from './authored-ground.js';

/** Compose stored reusable models; no geography or permanent placements are invented. */
export function composeAuthoredChunk(chunk,progress){
    if(chunk.schema!==2||chunk.composition!=='AUTHORED_PREFABS'||!chunk.id||!Array.isArray(chunk.instances))throw new Error('Unsupported authored chunk');
    const definitions=chunk.prefabs,geometries=chunk.geometries,seen=new Set(),origin=[chunk.bounds[0],0,chunk.bounds[1]];
    const ground=new AuthoredGround(chunk);
    let vertexCount=0,indexCount=0;const validated=new Set(),normals=new Map();
    for(const i of chunk.instances){
        if(seen.has(i.id)||i.owner!==chunk.id)throw new Error(`Duplicate/wrong prefab owner ${i.id}`);seen.add(i.id);
        if(!Array.isArray(i.anchor)||i.anchor.length!==3||!i.anchor.every(Number.isSafeInteger)||!Array.isArray(i.transform)||i.transform.length!==16||!i.transform.every(Number.isFinite))throw new Error(`Invalid prefab transform ${i.id}`);
        const d=definitions[i.prefabId];if(!d?.parts?.length)throw new Error(`Missing prefab ${i.prefabId} in ${chunk.id}`);
        for(const part of d.parts){if(!Array.isArray(part.matrix)||part.matrix.length!==16||!part.matrix.every(Number.isFinite)||part.color?.length!==3||!part.color.every(Number.isFinite))throw Error(`Invalid prefab component ${i.prefabId}`);const g=geometries[part.geometry];if(!validated.has(part.geometry)){
            if(!g||g.position.length%3||g.index.length%3||!g.position.every(Number.isFinite)||!g.index.every(n=>Number.isInteger(n)&&n>=0&&n<g.position.length/3)||!Number.isFinite(g.positionScale)||g.positionScale<=0||g.color&&(g.color.length!==g.position.length||!g.color.every(Number.isFinite)||!Number.isFinite(g.colorScale)||g.colorScale<=0))throw new Error(`Invalid geometry ${part.geometry}`);
            const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(g.position.map(n=>n*g.positionScale),3));geometry.setIndex(g.index);geometry.computeVertexNormals();normals.set(part.geometry,geometry.getAttribute('normal').array);geometry.dispose();validated.add(part.geometry);
        }vertexCount+=g.position.length/3;indexCount+=g.index.length;}
    }
    const mesh={position:new Float32Array(vertexCount*3),normal:new Float32Array(vertexCount*3),color:new Float32Array(vertexCount*3),index:new Uint32Array(indexCount)};
    let vertex=0,index=0,done=0;const distant=[],parent=new THREE.Matrix4(),local=new THREE.Matrix4(),matrix=new THREE.Matrix4(),normal=new THREE.Matrix3(),v=new THREE.Vector3(),n=new THREE.Vector3();
    for(const i of chunk.instances){
        const p=position(i.anchor);parent.fromArray(i.transform);parent.elements[12]+=p[0]-origin[0];parent.elements[13]+=p[1];parent.elements[14]+=p[2]-origin[2];
        let partIndex=0;const definition=definitions[i.prefabId],smallFacade=definition.kind==='BUILDING'&&i.bounds[4]-i.bounds[1]<2&&Math.min(i.bounds[3]-i.bounds[0],i.bounds[5]-i.bounds[2])<.25;
        for(const part of definition.parts){
            const g=geometries[part.geometry];matrix.copy(parent).multiply(local.fromArray(part.matrix));normal.getNormalMatrix(matrix);const base=vertex;
            for(let k=0;k<g.position.length;k+=3){v.fromArray(g.position,k).multiplyScalar(g.positionScale).applyMatrix4(matrix);if(definitions[i.prefabId].kind==='TERRAIN')v.y=ground.vertexHeight(v.x+origin[0],v.y,v.z+origin[2]);n.fromArray(normals.get(part.geometry),k).applyMatrix3(normal).normalize();mesh.position[vertex*3]=v.x;mesh.position[vertex*3+1]=v.y;mesh.position[vertex*3+2]=v.z;mesh.normal[vertex*3]=n.x;mesh.normal[vertex*3+1]=n.y;mesh.normal[vertex*3+2]=n.z;for(let c=0;c<3;c++)mesh.color[vertex*3+c]=part.color[c]*(g.color?g.color[k+c]*g.colorScale:1);vertex++;}
            const detail=definition.kind==='FENCE'||definition.kind==='RAILWAY_FURNITURE'||smallFacade||definition.kind==='TREE'&&partIndex>1;
            for(const k of g.index){mesh.index[index++]=base+k;if(!detail)distant.push(base+k);}partIndex++;
        }
        if((++done&127)===0)progress?.(done/chunk.instances.length);
    }
    if(!mesh.position.every(Number.isFinite)||!mesh.normal.every(Number.isFinite)||!mesh.color.every(Number.isFinite))throw new Error(`Non-finite composed chunk ${chunk.id}`);
    return {mesh,lodIndex:Uint32Array.from(distant),origin,placements:chunk.placements,roads:chunk.roads,pedestrianPaths:(chunk.characters||[]).map(c=>({...c,...c.navigation,points:c.navigation?.points||[c.position,c.position],speed:c.navigation?.speed||0})),checks:{...chunk.checks,triangleCount:indexCount/3,distantTriangles:distant.length/3,authoredInstances:chunk.instances.length},authored:true};
}
