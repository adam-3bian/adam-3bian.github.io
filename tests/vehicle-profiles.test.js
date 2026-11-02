import {test} from 'node:test';import assert from 'node:assert/strict';import * as THREE from 'three';
import {AssetFactory} from '../src/render/assets.js';import {ROAD_VEHICLE_PROFILES} from '../src/render/british-vehicles.js';
test('all 21 road vehicle families produce finite grounded models at declared scale',()=>{
 const factory=new AssetFactory(),sizes=new Map();assert.equal(Object.keys(ROAD_VEHICLE_PROFILES).length,21);
 for(const [id,profile]of Object.entries(ROAD_VEHICLE_PROFILES)){const model=factory.roadVehicle({id:`test/${id}`,kind:id,seed:7});model.updateMatrixWorld(true);const bounds=new THREE.Box3().setFromObject(model),size=bounds.getSize(new THREE.Vector3());
  assert.ok(size.toArray().every(Number.isFinite),id);assert.ok(Math.abs(bounds.min.y)<.025,`${id} wheel contact ${bounds.min.y}`);assert.ok(size.z>=profile.length*.9&&size.z<=profile.length*1.15,`${id} length ${size.z}`);assert.ok(size.x<=profile.width*1.5,`${id} width ${size.x}`);
  model.traverse(n=>{if(n.isMesh){assert.ok(n.geometry.getAttribute('position').array.every(Number.isFinite));assert.ok(n.matrixWorld.elements.every(Number.isFinite));}});sizes.set(id,size);
 }
 assert.ok(sizes.get('DOUBLE_DECKER_BUS').y>sizes.get('SINGLE_DECKER_BUS').y+1);assert.ok(sizes.get('ARTICULATED_HGV').z>sizes.get('RIGID_LORRY').z+5);
});
