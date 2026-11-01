import test from 'node:test';
import assert from 'node:assert/strict';
import { regularizeHeights } from '../src/world/terrain-grid.js';
test('terrain corner grid removes isolated cliffs while keeping broad gradients', () => {
    const source = new Float32Array([0, 1, 2, 3, 4, 0, 1, 32, 3, 4, 0, 1, 2, 3, 4]);
    const result = regularizeHeights(source, 5, 3, 2);
    for (let z = 0; z < 3; z++)
        for (let x = 0; x < 5; x++) {
            const n = z * 5 + x;
            if (x)
                assert.ok(Math.abs(result[n] - result[n - 1]) <= 2.0001);
            if (z)
                assert.ok(Math.abs(result[n] - result[n - 5]) <= 2.0001);
        }
    assert.ok(result[7] < 20 && result[7] > 2);
    assert.ok(result[4] > result[0]);
    const gentle = new Float32Array([1, 2, 3, 2, 3, 4, 3, 4, 5]);
    assert.deepEqual(regularizeHeights(gentle, 3, 3, 2), gentle);
});
