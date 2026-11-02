export async function contentHash(bytes){return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),v=>v.toString(16).padStart(2,'0')).join('');}
export async function decodeAuthoredBytes(bytes,expectedHash){
    if(!(bytes instanceof ArrayBuffer))throw Error('Authored data must be checked bytes');
    const header=new Uint8Array(bytes,0,Math.min(2,bytes.byteLength));
    const decoded=header[0]===31&&header[1]===139?await new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer():bytes;
    if(await contentHash(decoded)!==expectedHash)throw Error('Authored JSON content hash mismatch');
    return JSON.parse(new TextDecoder().decode(decoded));
}
