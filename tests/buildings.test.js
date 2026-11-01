import test from 'node:test';
import assert from 'node:assert/strict';
import {classifyBuilding} from '../src/world/buildings.js';
test('mapped British homes default to two storeys while explicit types and heights are retained',()=>{
 for(const buildingType of ['house','residential','semidetached_house','terrace']){const b=classifyBuilding({buildingType});assert.equal(b.levels,2);assert.equal(b.pitched,true);assert.ok(b.wallHeight+b.roofRise<8);}
 assert.equal(classifyBuilding({buildingType:'bungalow'}).levels,1);
 assert.equal(classifyBuilding({buildingType:'industrial'}).form,'industrial');
 assert.equal(classifyBuilding({buildingType:'apartments',buildingLevels:'6'}).levels,6);
 assert.equal(classifyBuilding({buildingType:'house',sourceHeight:'12'}).wallHeight+1.8,12);
 assert.equal(classifyBuilding({buildingType:'residential',footprint:[[0,0],[8,0],[8,10],[0,10]]}).form,'house');
 assert.equal(classifyBuilding({buildingType:'residential',footprint:[[0,0],[32,0],[32,8],[0,8]]}).form,'terrace');
 assert.equal(classifyBuilding({buildingType:'yes',buildingUse:'school'}).form,'institutional');
});
