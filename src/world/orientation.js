/** Horizontal directions use [east, south]; Three.js local -Z is the front of a bench. */
export function platformYaw(axis) { return Math.atan2(-axis[1], axis[0]); }
export function benchYaw(axis, at, rail) {
    const yaw = platformYaw(axis), toward = [rail[0] - at[0], rail[1] - at[1]];
    return (-Math.sin(yaw) * toward[0] - Math.cos(yaw) * toward[1]) >= 0 ? yaw : yaw + Math.PI;
}
/** Road skew relative to the railway: local X is across the tracks, local Z along them. */
export function crossingShear(track, road) {
    const across = road[0] * track.right[0] + road[2] * track.right[2];
    if (Math.abs(across) < .3)
        return 0;
    return Math.max(-1.5, Math.min(1.5, -(road[0] * track.tangent[0] + road[2] * track.tangent[2]) / across));
}
