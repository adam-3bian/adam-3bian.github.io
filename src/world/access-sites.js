import { Polyline, RouteGeometry } from '../core/geometry.js';
import definitions from './site-definitions.json' with { type: "json" };
export const ACCESS_RULES = Object.freeze({ version: 1, joinTolerance: .01, deckAboveRail: 5.25, deckThickness: .30, maximumRiser: .19, minimumGoing: .25, handrailHeight: 1.05, foundationDepth: .12 });
export const accessDefinitions = definitions.access;
export const accessSourceIds = new Set(accessDefinitions.flatMap(d => [d.deck, ...d.stairs]));
/** One complete declared access assembly replaces its source path/steps, with all
 * original identities retained. Unknown crossings are never auto-elevated. */
export function solveAccessSites(route, features, support) {
    const byId = new Map(features.map(f => [f.id, f]));
    const result = [];
    for (const d of accessDefinitions) {
        const f = byId.get(d.deck);
        if (!f?.points?.length)
            continue;
        if (d.stairs.some(id => !byId.get(id)?.points?.length))
            throw new Error(`${d.id}: JOIN-01 missing source stairs`);
        const source = new Polyline(f.points), height = Math.max(...f.points.map(p => route.sample(route.project(p[0], p[2], 100).s).position[1])) + ACCESS_RULES.deckAboveRail;
        const deck = f.points.map(p => [p[0], height, p[2]]), stairs = [];
        for (const id of d.stairs) {
            const sf = byId.get(id), points = sf.points, first = points[0], last = points.at(-1);
            const start = source.nearest(first[0], first[2]), end = source.nearest(last[0], last[2]);
            const [topRaw, bottomRaw, join] = start.distance < end.distance ? [first, last, start] : [last, first, end];
            if (join.distance > ACCESS_RULES.joinTolerance)
                throw new Error(`${d.id}/${id}: JOIN-01 source stair does not meet deck`);
            const top = [topRaw[0], height, topRaw[2]], bottomY = support(bottomRaw, d.station), rise = height - bottomY;
            if (!Number.isFinite(bottomY) || rise <= 0)
                throw new Error(`${d.id}/${id}: SUPPORT-01 invalid stair landing`);
            const steps = Math.ceil(rise / ACCESS_RULES.maximumRiser), run = Math.max(Math.hypot(bottomRaw[0] - top[0], bottomRaw[2] - top[2]), steps * ACCESS_RULES.minimumGoing);
            const dx = bottomRaw[0] - top[0], dz = bottomRaw[2] - top[2], length = Math.hypot(dx, dz);
            if (length < .1)
                throw new Error(`${d.id}/${id}: JOIN-01 zero stair direction`);
            const bottom = [top[0] + dx / length * run, 0, top[2] + dz / length * run];
            bottom[1] = support(bottom, d.station);
            stairs.push({ id, top, bottom, width: Math.min(1.8, Number(sf.width) || 1.6), steps, going: run / steps, riser: (height - bottom[1]) / steps });
        }
        const all = [...deck, ...stairs.flatMap(s => [s.top, s.bottom])];
        result.push({ id: d.id, station: d.station, sourceIds: [d.deck, ...d.stairs], deck, width: Math.min(2.2, Number(f.width) || 1.6), stairs, covered: d.covered, confidence: d.confidence, reference: d.reference, bounds: [Math.min(...all.map(p => p[0])) - 3, Math.min(...all.map(p => p[2])) - 3, Math.max(...all.map(p => p[0])) + 3, Math.max(...all.map(p => p[2])) + 3] });
    }
    return result;
}
