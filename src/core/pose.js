import { gaugeRight } from './geometry.js';
const unit = (v) => { const n = Math.hypot(...v) || 1; return v.map(x => x / n); };
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
/** Local +X/right, +Y/up and -Z/forward remain tied to the physical track plane. */
export function trackBasis(pose, direction = 1, forwardOverride) {
    const forward = unit(forwardOverride ?? pose.tangent.map(x => x * direction));
    const lateral = gaugeRight(pose).map(x => x * direction);
    const up = unit(cross(lateral, forward)), right = unit(cross(forward, up));
    return { right, up, forward };
}
export function roadBasis(yaw, pitch, bank) { return trackBasis({ tangent: [-Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), -Math.cos(yaw) * Math.cos(pitch)], right: [Math.cos(yaw), 0, -Math.sin(yaw)], bank }); }
