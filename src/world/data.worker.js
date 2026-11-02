import {decodeAuthoredBytes} from './authored-codec.js';
globalThis.onmessage=async({data})=>{try{globalThis.postMessage({value:await decodeAuthoredBytes(data.bytes,data.hash)});}catch(error){globalThis.postMessage({error:String(error.message||error)});}};
