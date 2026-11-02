import {test} from 'node:test';import assert from 'node:assert/strict';
import {RAIL_PIECES,ROAD_PIECES,instantiatePiece,constructionPath,constructionPlan} from '../src/world/piece-registry.js';
import {verticalProfile} from '../src/world/prefab-composition.js';
test('all 44 rail and 10 road IDs have smooth rotations; only full-length sections carry grade',()=>{
 for(const [mode,definitions]of [['rail',RAIL_PIECES],['road',ROAD_PIECES]])for(const def of definitions)for(let rotation=0;rotation<4;rotation++){
  const plan=constructionPlan(mode,def.id),riseTicks=plan.length>=16?2:0,grade=riseTicks/32/plan.length,profile={origin:[1200,3200,-400],rotation,riseTicks,startGrade:grade,endGrade:grade,state:riseTicks?'FULL_TILE_UPHILL':'LEVEL'},item=instantiatePiece({id:`${mode}/${def.id}/${rotation}`,mode,referenceId:def.id,origin:[12,100,-4],rotation,grade:0});item.constructionProfile=profile;
  if(!riseTicks)assert.throws(()=>verticalProfile({...profile,riseTicks:1,state:'FULL_TILE_UPHILL'},plan.length,{maximum:.025,transitionPerTile:1},item.id),/complete construction section/);
  verticalProfile(profile,plan.length,{maximum:mode==='rail'?.025:.08,transitionPerTile:.005},item.id);const path=constructionPath(item);assert.ok(Math.abs(path.sample(path.length).position[1]-path.sample(0).position[1]-riseTicks/32)<1e-9,item.id);
  let previous;for(let s=0;s<=path.length;s+=Math.min(.5,path.length/30)){const q=path.sample(s);assert.ok([...q.position,...q.tangent].every(Number.isFinite),item.id);assert.ok(Math.abs(q.grade-grade)<1e-10,item.id);if(previous){const distance=Math.hypot(...q.position.map((v,i)=>v-previous.position[i]));assert.ok(distance<.502,`${item.id} ${distance}`);}previous=q;}
 }
});
