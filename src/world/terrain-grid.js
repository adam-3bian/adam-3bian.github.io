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
