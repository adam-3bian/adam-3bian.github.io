/** Full traffic geometry can exceed localStorage's usual 5 MiB quota. */
export class JourneyStore {
    name;
    legacyKey;
    database;
    constructor(name = 'snow-hill-lines', legacyKey = 'snow-hill-lines-save-v1') {
        this.name = name;
        this.legacyKey = legacyKey;
    }
    open() {
        return this.database ??= new Promise((resolve, reject) => {
            const request = indexedDB.open(this.name, 2);
            request.onupgradeneeded = () => { for (const name of ['journeys', 'worlds'])
                if (!request.result.objectStoreNames.contains(name))
                    request.result.createObjectStore(name); };
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => { this.database = undefined; reject(request.error || new Error('Journey storage could not be opened.')); };
            request.onblocked = () => { this.database = undefined; reject(new Error('Close other older Snow Hill Lines tabs, then save again.')); };
        });
    }
    async put(snapshot, world) {
        const db = await this.open();
        await new Promise((resolve, reject) => {
            const tx = db.transaction(world ? ['journeys', 'worlds'] : ['journeys'], 'readwrite');
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error || new Error('Journey storage failed.'));
            tx.onabort = () => reject(tx.error || new Error('Journey storage was interrupted.'));
            const fail=error=>{try{tx.abort();}catch{/* Transaction already closed. */}reject(error);};
            try{
                const journeys=tx.objectStore('journeys'),previous=journeys.get('active');
                previous.onsuccess=()=>{try{
                    const old=previous.result;
                    if(old&&old.worldHash!==snapshot.worldHash)journeys.put(old,`backup/${typeof old.worldHash==='string'&&old.worldHash?old.worldHash:'unknown'}`);
                    journeys.put(snapshot,'active');
                }catch(error){fail(error);}};
                if(world)tx.objectStore('worlds').put(world,snapshot.worldHash);
            }catch(error){fail(error);}
        });
    }
    async getWorld(hash) { const db = await this.open(); return new Promise((resolve, reject) => { const request = db.transaction('worlds', 'readonly').objectStore('worlds').get(hash); request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error); }); }
    async getBackups() { const db=await this.open();return new Promise((resolve,reject)=>{const items=[],request=db.transaction('journeys','readonly').objectStore('journeys').openCursor();request.onsuccess=()=>{const cursor=request.result;if(!cursor){resolve(items);return;}if(typeof cursor.key==='string'&&cursor.key.startsWith('backup/'))items.push({key:cursor.key,snapshot:cursor.value});cursor.continue();};request.onerror=()=>reject(request.error);}); }
    async get() {
        const db = await this.open();
        const saved = await new Promise((resolve, reject) => { const request = db.transaction('journeys', 'readonly').objectStore('journeys').get('active'); request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error); });
        if (saved)
            return saved;
        const legacy = localStorage.getItem(this.legacyKey);
        if (!legacy)
            return undefined;
        const imported = JSON.parse(legacy);
        await this.put(imported);
        localStorage.removeItem(this.legacyKey);
        return imported;
    }
}
