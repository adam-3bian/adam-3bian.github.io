/** Produce one shared, slope-limited height field for ground-level construction.
 * The two distance envelopes preserve broad elevations without turning a single
 * raster spike into a vertical cliff. Slopes are visual model controls, not a survey. */
export function regularizeHeights(source, width, height, maxStep) {
    if (source.length !== width * height || maxStep <= 0)
        throw new Error('Invalid terrain grid');
    const upper = source.slice(), lower = source.slice();
    const relax = (i, j) => { upper[i] = Math.min(upper[i], upper[j] + maxStep); lower[i] = Math.max(lower[i], lower[j] - maxStep); };
    for (let z = 0; z < height; z++)
        for (let x = 0; x < width; x++) {
            const i = z * width + x;
            if (x)
                relax(i, i - 1);
            if (z)
                relax(i, i - width);
        }
    for (let z = height - 1; z >= 0; z--)
        for (let x = width - 1; x >= 0; x--) {
            const i = z * width + x;
            if (x + 1 < width)
                relax(i, i + 1);
            if (z + 1 < height)
                relax(i, i + width);
        }
    const result = new Float32Array(source.length);
    for (let i = 0; i < result.length; i++)
        result[i] = (upper[i] + lower[i]) / 2;
    return result;
}

import { GRID } from './grid.js';

// NW, NE, SE, SW. Both rendering and contact queries use the NW–SE diagonal.
export class ConstructionTerrain {
    constructor(cells) {
        this.cells = new Map();
        this.corners = new Map();
        for (const c of cells) {
            const key = `${c.x},${c.z}`;
            if (this.cells.has(key)) throw new Error(`TERRAIN duplicate cell ${key}`);
            if (!Array.isArray(c.cornerTicks) || c.cornerTicks.length !== 4) throw new Error(`TERRAIN four corner heights required ${key}`);
            if (![c.x, c.z, c.baseHeightTicks, ...c.cornerTicks].every(Number.isSafeInteger) || c.cornerTicks.length !== 4)
                throw new Error(`TERRAIN invalid heights ${key}`);
            if (c.cornerTicks.some(n => n < 0) || Math.min(...c.cornerTicks) !== 0)
                throw new Error(`TERRAIN base must be the lowest corner ${key}`);
            this.cells.set(key, c);
            this.vertices(c).forEach((p, i) => {
                const k = `${p[0]},${p[2]}`, ticks = c.baseHeightTicks + c.cornerTicks[i];
                if (this.corners.has(k) && this.corners.get(k) !== ticks)
                    throw new Error(`TERRAIN shared corner mismatch ${k}`);
                this.corners.set(k, ticks);
            });
        }
    }
    vertices(c) {
        return [[0, 0], [1, 0], [1, 1], [0, 1]].map(([x, z], i) =>
            [(c.x + x) * GRID.cellSize, (c.baseHeightTicks + c.cornerTicks[i]) * GRID.heightStep, (c.z + z) * GRID.cellSize]);
    }
    triangles(c) { const [a, b, d, e] = this.vertices(c); return [[a, d, b], [a, e, d]]; }
    raw(x, z) {
        const gx = x / GRID.cellSize, gz = z / GRID.cellSize, ix = Math.floor(gx), iz = Math.floor(gz);
        // At outer edges use the adjacent closed cell, without extrapolating missing terrain.
        const c = this.cells.get(`${ix},${iz}`) || (gx === ix && this.cells.get(`${ix - 1},${iz}`)) ||
            (gz === iz && this.cells.get(`${ix},${iz - 1}`)) || (gx === ix && gz === iz && this.cells.get(`${ix - 1},${iz - 1}`));
        if (!c) throw new Error(`TERRAIN missing support cell at ${x},${z}`);
        const u = gx - c.x, v = gz - c.z, [nw, ne, se, sw] = c.cornerTicks;
        const h = v <= u ? nw + u * (ne - nw) + v * (se - ne) : nw + u * (se - sw) + v * (sw - nw);
        return (c.baseHeightTicks + h) * GRID.heightStep;
    }
}
