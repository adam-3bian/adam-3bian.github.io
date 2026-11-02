import * as THREE from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
const material=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.9,flatShading:true}),cache=new Map();
/** Merge rigid parts in local space while retaining articulated groups and lamps. */
export function batchRigidParts(group,key,exclude=new Set()){
 const parts=group.children.filter(n=>n.isMesh&&!exclude.has(n)&&!n.material.emissive?.getHex());if(!parts.length)return;
 let geometry=cache.get(key);
 if(!geometry){const geometries=parts.map(mesh=>{mesh.updateMatrix();const g=mesh.geometry.index?mesh.geometry.toNonIndexed():mesh.geometry.clone();g.applyMatrix4(mesh.matrix);g.deleteAttribute('uv');const p=g.getAttribute('position'),c=g.getAttribute('color'),rgb=new Float32Array(p.count*3),color=mesh.material.color;for(let i=0;i<p.count;i++)for(let k=0;k<3;k++)rgb[i*3+k]=[color.r,color.g,color.b][k]*(c?c.array[i*3+k]:1);g.setAttribute('color',new THREE.BufferAttribute(rgb,3));return g;});geometry=mergeGeometries(geometries);for(const g of geometries)g.dispose();cache.set(key,geometry);}
 const model=new THREE.Mesh(geometry,material);model.name='rigid-assembly';model.userData.partNames=parts.map(p=>p.name);for(const p of parts)group.remove(p);group.add(model);
}
