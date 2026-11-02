import {test} from 'node:test';import assert from 'node:assert/strict';import {gzipSync} from 'node:zlib';import {createHash} from 'node:crypto';
import {decodeAuthoredBytes} from '../src/world/authored-codec.js';
test('authored caches decode identically with and without HTTP content decoding and reject corruption',async()=>{
 const plain=Buffer.from(JSON.stringify({id:'a',schema:2})),gzip=gzipSync(plain),hash=createHash('sha256').update(plain).digest('hex'),bytes=b=>b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength);
 assert.deepEqual(await decodeAuthoredBytes(bytes(gzip),hash),await decodeAuthoredBytes(bytes(plain),hash));await assert.rejects(decodeAuthoredBytes(bytes(gzip),'0'.repeat(64)),/hash|revision|integrity/i);await assert.rejects(decodeAuthoredBytes(bytes(gzip.subarray(0,10)),hash));
});
