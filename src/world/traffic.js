import { Polyline, clamp, hash, mix } from '../core/geometry.js';
const compareId = (a, b) => a < b ? -1 : a > b ? 1 : 0;
const MOTOR_ROADS = new Set(['motorway', 'motorway_link', 'trunk', 'trunk_link', 'primary', 'primary_link', 'secondary', 'secondary_link', 'tertiary', 'tertiary_link', 'unclassified', 'residential', 'living_street', 'road']);
/** A mapped surface is not automatically a public motor-traffic road. */
export function isMotorRoad(road) { return MOTOR_ROADS.has(road.kind) && road.width >= 4.5 && Array.isArray(road.points) && road.points.length >= 2; }
export class RoadTraffic {
    roads = new Map();
    cars = new Map();
    nodes = new Map();
    reservations = new Map();
    spawnPlan;
    /** Select the same bounded regional population before any tile arrives. */
    setSpawnPlan(roads) { const cells = new Map(); for (const road of roads) {
        if (!isMotorRoad(road) || hash(road.id) % 4 !== 0)
            continue;
        const path = new Polyline(road.points);
        if (path.length < 65)
            continue;
        const p = path.sample(path.length * .5).position, key = `${Math.floor(p[0] / 1000)},${Math.floor(p[2] / 1000)}`, list = cells.get(key) || [];
        list.push({ id: road.id, rank: hash(`population/${road.id}`) });
        cells.set(key, list);
    } this.spawnPlan = new Set([...cells.values()].flatMap(list => list.sort((a, b) => a.rank - b.rank || compareId(a.id, b.id)).slice(0, 8).map(r => r.id))); }
    addRoads(roads) {
        for (const road of roads) {
            if (this.roads.has(road.id) || !isMotorRoad(road))
                continue;
            const path = new Polyline(road.points);
            this.roads.set(road.id, { ...road, path });
            for (const end of [0, 1]) {
                const p = road.points[end === 0 ? 0 : road.points.length - 1], key = this.key(p,road.connectionNodes?.[end]),coord=this.key(p), entry={id:road.id,end},arr = this.nodes.get(key) || [];
                arr.push(entry);this.nodes.set(key, arr);
                if(key!==coord){const aliases=this.nodes.get(coord)||[];aliases.push(entry);this.nodes.set(coord,aliases);}
            }
            if (path.length < 65 || hash(road.id) % 4 !== 0 || (this.spawnPlan ? !this.spawnPlan.has(road.id) : this.cars.size >= 150))
                continue;
            for (const direction of [1, -1]) {
                if(road.oneway&&road.oneway!==direction)continue;
                const id = `car-${road.id}-${direction}`;
                let s = path.length * (.18 + (hash(id) % 60) / 100);
                if (road.mode === 'crossing' && road.crossingS !== undefined && Math.abs(s - road.crossingS) < 40)
                    s = clamp(road.crossingS - direction * (40 + hash(id) % 15), 2, path.length - 2);
                const pose = path.sample(s, -direction * road.width * .23), roll = hash(id) % 24;
                pose.position[1] += (road.mode === 'crossing' ? -.005 : .035) * .54;
                const kind = road.width >= 7 && roll < 2 ? 'lorry' : road.width >= 6.3 && roll < 4 ? 'bus' : road.width >= 5.3 && roll < 7 ? 'van' : roll === 8 ? 'taxi' : 'car';
                this.cars.set(id, { id, road: road.id, s, direction, speed: 0, kind, position: pose.position, yaw: pose.yaw + (direction < 0 ? Math.PI : 0), pitch: pose.pitch * direction, bank: road.mode === 'crossing' ? 0 : .07 / road.width, length: kind === 'bus' ? 10 : kind === 'lorry' ? 12 : kind === 'van' ? 5.5 : 4.5 });
            }
        }
    }
    /** Build the complete simulation graph in stable order, independently of scenery tiles. */
    configure(roads) { this.roads.clear(); this.nodes.clear(); this.cars.clear(); this.reservations.clear(); const ordered = [...roads].sort((a, b) => compareId(a.id, b.id)); this.setSpawnPlan(ordered); this.addRoads(ordered); }
    key(p,node) { return node||`${Math.round(p[0] / 4)},${Math.round(p[1] / 2)},${Math.round(p[2] / 4)}`; }
    snapshot() { return { roads: [...this.roads.values()].map(({ path, ...road }) => road), cars: [...this.cars.values()].map(car => ({ ...car, transition: car.transition ? { ...car.transition, path: car.transition.path.points } : undefined })), reservations: [...this.reservations], spawnPlan: this.spawnPlan ? [...this.spawnPlan].sort() : undefined }; }
    /** Persist dynamic state only; the world-hashed road graph is rebuilt before restore. */
    snapshotState() { return { version: 2, cars: [...this.cars.values()].map(car => ({ ...car, transition: car.transition ? { ...car.transition, path: car.transition.path.points } : undefined })), reservations: [...this.reservations] }; }
    restoreState(saved) {
        if (saved?.version !== 2 || !Array.isArray(saved.cars) || !Array.isArray(saved.reservations))
            throw new Error('This save has an incompatible road traffic state. Start a new journey.');
        const cars = new Map();
        for (const entry of saved.cars) {
            if (!entry || typeof entry.id !== 'string' || cars.has(entry.id) || !this.roads.has(entry.road) || ![1, -1].includes(entry.direction) || !Number.isFinite(entry.s) || !Number.isFinite(entry.speed))
                throw new Error('The saved road traffic does not match the current road network. Start a new journey.');
            const car = { ...entry };
            if (entry.transition) {
                const t = entry.transition;
                if (!this.roads.has(t.next) || !Array.isArray(t.path) || t.path.length < 2 || !Number.isFinite(t.s))
                    throw new Error('The saved road transition is incompatible. Start a new journey.');
                car.transition = { ...t, path: new Polyline(t.path) };
            }
            cars.set(car.id, car);
        }
        const reservations = new Map();
        for (const entry of saved.reservations) {
            if (!Array.isArray(entry) || entry.length !== 2 || typeof entry[0] !== 'string' || !this.nodes.has(entry[0]) || !entry[1] || !cars.has(entry[1].car) || !Number.isFinite(entry[1].until))
                throw new Error('The saved road reservation is incompatible. Start a new journey.');
            reservations.set(entry[0], entry[1]);
        }
        this.cars.clear();
        for (const [id, car] of cars)
            this.cars.set(id, car);
        this.reservations.clear();
        for (const [id, reservation] of reservations)
            this.reservations.set(id, reservation);
    }
    reset() { const roads = [...this.roads.values()].map(({ path, ...road }) => road); this.roads.clear(); this.nodes.clear(); this.cars.clear(); this.reservations.clear(); this.addRoads(roads); }
    restore(saved) { this.roads.clear(); this.nodes.clear(); this.cars.clear(); this.reservations.clear(); if (saved.spawnPlan)
        this.spawnPlan = new Set(saved.spawnPlan); this.addRoads(saved.roads); this.cars.clear(); for (const car of saved.cars) {
        if (car.transition)
            car.transition.path = new Polyline(car.transition.path);
        this.cars.set(car.id, car);
    } for (const [key, value] of saved.reservations)
        this.reservations.set(key, value); }
    crossingClear(routeS) { for (const car of this.cars.values()) {
        const road = this.roads.get(car.road);
        if (road?.mode !== 'crossing' || road.routeS === undefined || road.crossingS === undefined || Math.abs(road.routeS - routeS) > 220)
            continue;
        const d = (road.crossingS - car.s) * car.direction, zone = 16 + car.length / 2;
        if (d > -zone && (d < zone || (d > 0 && d < zone + car.speed * car.speed / 3.6)))
            return false;
    } return true; }
    update(dt, time, crossings, _camera) {
        for (const [node, r] of this.reservations)
            if (r.until < time)
                this.reservations.delete(node);
        const laneCars = new Map(), leaders = new Map();
        for (const car of this.cars.values()) {
            const key = `${car.road}/${car.direction}`, list = laneCars.get(key) || [];
            list.push(car);
            laneCars.set(key, list);
        }
        for (const list of laneCars.values()) {
            list.sort((a, b) => (a.s - b.s) * a.direction);
            for (let i = 0; i < list.length - 1; i++)
                leaders.set(list[i].id, list[i + 1]);
        }
        for (const car of this.cars.values()) {
            if (car.transition) {
                const tr = car.transition;
                car.speed = Math.min(5, car.speed + .7 * dt);
                tr.s += car.speed * dt;
                const p = tr.path.sample(tr.s);
                car.position = p.position;
                car.yaw = p.yaw;
                car.pitch = p.pitch;
                if (tr.s >= tr.path.length) {
                    car.road = tr.next;
                    car.direction = tr.direction;
                    car.s = tr.nextS;
                    car.transition = undefined;
                }
                continue;
            }
            const road = this.roads.get(car.road);
            if (!road)
                continue;
            let target = road.kind === 'primary' || road.kind === 'secondary' ? 12 : 9;
            const endDistance = car.direction === 1 ? road.path.length - car.s : car.s;
            const leader = leaders.get(car.id);
            if (leader) {
                const d = (leader.s - car.s) * car.direction;
                if (d > 0)
                    target = Math.min(target, Math.sqrt(Math.max(0, 2 * 1.8 * (d - (car.length + leader.length) / 2 - 3.5))));
            }
            if (road.mode === 'crossing' && road.routeS !== undefined && road.crossingS !== undefined) {
                const c = crossings.find(x => Math.abs(x.s - road.routeS) < 220);
                const d = (road.crossingS - car.s) * car.direction;
                if (d < -(16 + car.length / 2))
                    car.crossingCommitted = undefined;
                if (c && c.state === 'warning' && d > 0 && d < car.length / 2 + 12 + car.speed * car.speed / 4.6)
                    car.crossingCommitted = c.id;
                const exitBlocked = (laneCars.get(`${car.road}/${car.direction}`) || []).some(other => other.id !== car.id && (other.s - road.crossingS) * car.direction > 0 && (other.s - road.crossingS) * car.direction < 26 + car.length + other.length / 2);
                if (d > 0 && !(c && car.crossingCommitted === c.id) && ((c && c.state !== 'open') || exitBlocked))
                    target = Math.min(target, Math.sqrt(Math.max(0, 2 * 2.3 * (d - car.length / 2 - 18))));
            }
            if (endDistance < 30) {
                const end=car.direction===1?1:0,endpoint = road.points[end ? road.points.length - 1 : 0], explicit=road.connectionNodes?.[end],primary=this.key(endpoint,explicit),coord=this.key(endpoint),matches=[...(this.nodes.get(primary)||[])];
                for(const candidate of this.nodes.get(coord)||[]){const other=this.roads.get(candidate.id)?.connectionNodes?.[candidate.end];if((!explicit||!other)&&!matches.some(n=>n.id===candidate.id&&n.end===candidate.end))matches.push(candidate);}
                const node=matches.some(n=>!this.roads.get(n.id)?.connectionNodes?.[n.end])?coord:primary,nexts=matches.filter(n => n.id !== road.id&&(!this.roads.get(n.id).oneway||this.roads.get(n.id).oneway===(n.end===0?1:-1)));
                nexts.sort((a, b) => compareId(a.id, b.id) || a.end - b.end);
                const next = nexts.length ? nexts[hash(car.id + node) % nexts.length] : undefined;
                const reservation = this.reservations.get(node);
                if (!next || (reservation && reservation.car !== car.id)) {
                    target = Math.min(target, Math.sqrt(Math.max(0, 2 * 1.7 * (endDistance - 8))));
                }
                else {
                    target = Math.min(target, 5);
                    if (endDistance < 12) {
                        const nr = this.roads.get(next.id);
                        const direction = next.end === 0 ? 1 : -1;
                        const lead=Math.min(12,nr.path.length*.5),ns = direction === 1 ? lead : nr.path.length - lead;
                        const dest = nr.path.sample(ns, -direction * nr.width * .23);
                        dest.position[1] += (nr.mode === 'crossing' ? -.005 : .035) * .54;
                        const occupied = (laneCars.get(`${nr.id}/${direction}`) || []).some(o => o.id !== car.id && Math.abs(o.s - ns) < (car.length + o.length) / 2 + 8);
                        if (!occupied) {
                            const start = road.path.sample(car.s, -car.direction * road.width * .23).position;
                            start[1] += (road.mode === 'crossing' ? -.005 : .035) * .54;
                            const control = [endpoint[0], mix(start[1], dest.position[1], .5), endpoint[2]];
                            const points = [];
                            for (let j = 0; j <= 12; j++) {
                                const t = j / 12, u = 1 - t;
                                points.push([u * u * start[0] + 2 * u * t * control[0] + t * t * dest.position[0], mix(start[1], dest.position[1], t), u * u * start[2] + 2 * u * t * control[2] + t * t * dest.position[2]]);
                            }
                            car.transition = { path: new Polyline(points), s: 0, next: nr.id, direction, nextS: ns, node };
                            this.reservations.set(node, { car: car.id, until: time + 8 });
                            continue;
                        }
                        else
                            target = 0;
                    }
                }
            }
            car.speed = Math.max(0, car.speed + clamp(target - car.speed, -2.5 * dt, 1.1 * dt));
            const margin=Math.min(2,road.path.length*.2);car.s = clamp(car.s + car.direction * car.speed * dt, margin, road.path.length - margin);
            const pose = road.path.sample(car.s, -car.direction * road.width * .23);
            car.position = pose.position;
            car.position[1] += (road.mode === 'crossing' ? -.005 : .035) * .54;
            car.yaw = pose.yaw + (car.direction < 0 ? Math.PI : 0);
            car.pitch = pose.pitch * car.direction;
            car.bank = road.mode === 'crossing' ? 0 : .07 / road.width;
        }
    }
}
