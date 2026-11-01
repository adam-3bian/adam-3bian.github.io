import * as THREE from 'three';
export interface MeshPacket {position:Float32Array;normal:Float32Array;color:Float32Array;index:Uint32Array}
/** Bake static procedural components into one vertex-colour draw per spatial tile. */
export class Batch {
  private positions:number[]=[];private normals:number[]=[];private colors:number[]=[];private indices:number[]=[];
  add(object:THREE.Object3D) {object.updateMatrixWorld(true);object.traverse(node=>{if(!(node as THREE.Mesh).isMesh)return;const mesh=node as THREE.Mesh;const g=mesh.geometry,pa=g.getAttribute('position'),na=g.getAttribute('normal');if(!pa)return;const normalMatrix=new THREE.Matrix3().getNormalMatrix(mesh.matrixWorld);const mat=(Array.isArray(mesh.material)?mesh.material[0]:mesh.material) as THREE.MeshStandardMaterial;const color=mat.color||new THREE.Color(0xffffff);const base=this.positions.length/3,v=new THREE.Vector3(),n=new THREE.Vector3();
    for(let i=0;i<pa.count;i++){v.fromBufferAttribute(pa,i).applyMatrix4(mesh.matrixWorld);this.positions.push(v.x,v.y,v.z);if(na)n.fromBufferAttribute(na,i).applyMatrix3(normalMatrix).normalize();else n.set(0,1,0);this.normals.push(n.x,n.y,n.z);const vc=g.getAttribute('color');this.colors.push(color.r*(vc?vc.getX(i):1),color.g*(vc?vc.getY(i):1),color.b*(vc?vc.getZ(i):1));}
    if(g.index)for(let i=0;i<g.index.count;i++)this.indices.push(base+g.index.getX(i));else for(let i=0;i<pa.count;i++)this.indices.push(base+i);
  });}
  triangle(a:number[],b:number[],c:number[],color:THREE.Color){const base=this.positions.length/3;const ab=new THREE.Vector3(b[0]-a[0],b[1]-a[1],b[2]-a[2]),ac=new THREE.Vector3(c[0]-a[0],c[1]-a[1],c[2]-a[2]),n=ab.cross(ac).normalize();for(const p of [a,b,c]){this.positions.push(...p);this.normals.push(n.x,n.y,n.z);this.colors.push(color.r,color.g,color.b);}this.indices.push(base,base+1,base+2);}
  packet():MeshPacket{return {position:new Float32Array(this.positions),normal:new Float32Array(this.normals),color:new Float32Array(this.colors),index:new Uint32Array(this.indices)};}
}
export function packetGeometry(p:MeshPacket){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(p.position,3));g.setAttribute('normal',new THREE.BufferAttribute(p.normal,3));g.setAttribute('color',new THREE.BufferAttribute(p.color,3));g.setIndex(new THREE.BufferAttribute(p.index,1));g.computeBoundingSphere();return g;}
