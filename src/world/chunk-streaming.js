export const CHUNK_STATES=Object.freeze(['QUEUED','FETCHED','DECODED','COMPOSED','GPU_PREPARING','GPU_READY','FAILED','EVICTED']);
export class ChunkLifecycle{
    records=new Map();
    transition(id,token,state,now=performance.now()){
        if(!CHUNK_STATES.includes(state))throw Error(`Unknown chunk state ${state}`);
        const previous=this.records.get(id);
        if(previous&&token<previous.token)return false;
        if(previous&&token===previous.token&&state!=='FAILED'&&CHUNK_STATES.indexOf(state)<CHUNK_STATES.indexOf(previous.state))return false;
        const record=previous?.token===token?previous:{id,token,started:now,history:[]};record.state=state;record.at=now;record.history.push({state,at:now});if(state==='GPU_READY')record.latencyMs=now-record.started;
        this.records.set(id,record);return true;
    }
}
export function chunkDistance(tile,position){const b=tile.bounds;return Math.hypot(Math.max(b[0]-position[0],0,position[0]-b[2]),Math.max(b[1]-position[2],0,position[2]-b[3]));}
export function streamCandidates(tiles,route,player,quality){
    const current=route.sample(player.s).position,radius=quality==='high'?1750:quality==='low'?900:1300,direction=player.direction||1,look=Math.max(500,Math.min(1800,(player.speed||0)*25+300)),aheadS=Math.max(0,Math.min(route.length??Infinity,player.s+direction*look)),ahead=route.sample(aheadS).position;
    const candidates=tiles.map(tile=>{const d=chunkDistance(tile,current),a=chunkDistance(tile,ahead);return{tile,d,score:d<250?d:a<500?250+a:d+600,a};}).filter(t=>t.d<radius||t.a<650).sort((a,b)=>a.score-b.score||a.tile.id.localeCompare(b.tile.id)),ids=new Set(candidates.map(t=>t.tile.id));
    for(let i=0;i<candidates.length;i++)for(const id of candidates[i].tile.dependencies||[])if(!ids.has(id)){const tile=tiles.find(t=>t.id===id);if(!tile)throw Error(`Missing chunk dependency ${id}`);candidates.push({tile,d:chunkDistance(tile,current),score:candidates[i].score});ids.add(id);}
    return candidates;
}
