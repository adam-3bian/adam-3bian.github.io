import { Polyline, RouteGeometry, smooth, clamp } from '../core/geometry.js';
import definitions from './site-definitions.json' with { type: "json" };
export const roadSiteDefinitions = definitions.roadBridges;
const cache = new WeakMap();
/** Source-connected deck and approaches form one profile before terrain is cut.
 * Dimensions are explicit engineering inferences, never bare-earth deck heights. */
export function referenceRoadProfile(feature, route) {
    if (!roadSiteDefinitions.some(d => [d.span, ...d.approaches].includes(feature.id)))
        return null;
    let solved = cache.get(route);
    if (!solved) {
        solved = new Map();
        cache.set(route, solved);
        const sources = new Map((route.data.surfaceRoads || []).map(f => [f.id, f]));
        for (const d of roadSiteDefinitions) {
            const pieces = [d.approaches[0], d.span, d.approaches[1]].map(id => sources.get(id));
            if (pieces.some(p => !p?.points?.length))
                continue;
            const all = [];
            for (const p of pieces) {
                const points = p.points;
                if (all.length && Math.hypot(all.at(-1)[0] - points[0][0], all.at(-1)[2] - points[0][2]) > .01)
                    throw new Error(`${d.id}: JOIN-01 road approach endpoints do not match`);
                all.push(...(all.length ? points.slice(1) : points));
            }
            const path = new Polyline(all), span = new Polyline(pieces[1].points), mid = span.sample(span.length / 2).position, hit = path.nearest(mid[0], mid[2]), rail = route.project(mid[0], mid[2], 100), deck = route.sample(rail.s).position[1] + d.deckAboveRail;
            for (const p of pieces) {
                const pts = p.points.map(v => { const near = path.nearest(v[0], v[2]), distance = Math.abs(near.s - hit.s), blend = 1 - smooth(clamp((distance - span.length / 2) / d.transitionLength, 0, 1)); return [v[0], v[1] + (deck - v[1]) * blend, v[2]]; }), pp = new Polyline(pts), isSpan = p.id === d.span;
                solved.set(p.id, { id: p.id, kind: String(p.kind), width: Number(p.width) || 5.5, points: pts, path: pp, mode: isSpan ? 'over' : 'ground', sourceStructure: d.id, inferred: true, ...(isSpan ? { crossingS: pp.nearest(mid[0], mid[2]).s, routeS: rail.s, spanHalfLength: pp.length / 2 } : {}) });
            }
        }
    }
    return solved.get(feature.id) || null;
}
