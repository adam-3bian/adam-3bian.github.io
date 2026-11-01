import type {Snapshot} from './simulation';

/** Full traffic geometry can exceed localStorage's usual 5 MiB quota. */
export class JourneyStore {
  private database?:Promise<IDBDatabase>;
  constructor(private readonly name='snow-hill-lines',private readonly legacyKey='snow-hill-lines-save-v1'){}
  private open(){return this.database??=new Promise<IDBDatabase>((resolve,reject)=>{
    const request=indexedDB.open(this.name,1);
    request.onupgradeneeded=()=>{if(!request.result.objectStoreNames.contains('journeys'))request.result.createObjectStore('journeys');};
    request.onsuccess=()=>resolve(request.result);request.onerror=()=>{this.database=undefined;reject(request.error||new Error('Journey storage could not be opened.'));};
    request.onblocked=()=>{this.database=undefined;reject(new Error('Close other older Snow Hill Lines tabs, then save again.'));};
  });}
  async put(snapshot:Snapshot){const db=await this.open();await new Promise<void>((resolve,reject)=>{
    const tx=db.transaction('journeys','readwrite');tx.objectStore('journeys').put(snapshot,'active');
    tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error||new Error('Journey storage failed.'));tx.onabort=()=>reject(tx.error||new Error('Journey storage was interrupted.'));
  });}
  async get():Promise<Snapshot|undefined>{const db=await this.open();const saved=await new Promise<Snapshot|undefined>((resolve,reject)=>{const request=db.transaction('journeys','readonly').objectStore('journeys').get('active');request.onsuccess=()=>resolve(request.result as Snapshot|undefined);request.onerror=()=>reject(request.error);});
    if(saved)return saved;
    const legacy=localStorage.getItem(this.legacyKey);if(!legacy)return undefined;const imported=JSON.parse(legacy) as Snapshot;await this.put(imported);localStorage.removeItem(this.legacyKey);return imported;
  }
}
