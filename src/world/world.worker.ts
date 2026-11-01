import {RouteGeometry} from '../core/geometry';
import type {RouteData,WorldTile} from '../core/types';
import {Terrain} from './surfaces';
import {buildTile} from './build';

let route:RouteGeometry|undefined,terrain:Terrain|undefined;
const scope=globalThis as unknown as {onmessage:(event:MessageEvent)=>void;postMessage:(message:unknown,transfer?:Transferable[])=>void};
scope.onmessage=(event:MessageEvent)=>{
  const message=event.data;
  try{
    if(message.type==='init'){
      const data=message.route as RouteData;route=new RouteGeometry(data);
      const buffer=message.terrain as ArrayBuffer;terrain=new Terrain(data.terrain,new Uint16Array(buffer));
      scope.postMessage({type:'ready'});return;
    }
    if(message.type==='build'){
      if(!route||!terrain)throw new Error('World worker has not been initialised.');
      const tile=message.tile as WorldTile,result=buildTile(tile,route,terrain);
      scope.postMessage({type:'tile',id:tile.id,token:message.token,...result},[result.mesh.position.buffer,result.mesh.normal.buffer,result.mesh.color.buffer,result.mesh.index.buffer] as ArrayBuffer[]);
    }
  }catch(error){scope.postMessage({type:'error',id:message.tile?.id,token:message.token,message:error instanceof Error?error.message:String(error)});}
};
