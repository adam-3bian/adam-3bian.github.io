import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { AssetFactory, setCrossingState } from '../src/render/assets.js';
import { benchYaw, crossingShear, platformYaw } from '../src/world/orientation.js';
test('platform nameboards run along the track and benches face their own platform edge', () => {
    for (const axis of [[1, 0], [0, 1], [Math.SQRT1_2, Math.SQRT1_2]]) {
        const yaw = platformYaw(axis), long = [Math.cos(yaw), -Math.sin(yaw)];
        assert.ok(Math.abs(long[0] * axis[0] + long[1] * axis[1]) > .999);
        for (const side of [-1, 1]) {
            const rail = [-axis[1] * side * 4, axis[0] * side * 4], angle = benchYaw(axis, [0, 0], rail), front = [-Math.sin(angle), -Math.cos(angle)];
            assert.ok(front[0] * rail[0] + front[1] * rail[1] > 3.99);
        }
    }
    const station = new AssetFactory().station({ id: 'fixture', name: 'Fixture', footbridge: false });
    for (const board of station.children.filter(c => c.userData.role === 'platform-nameboard')) {
        const long = new THREE.Vector3(1, 0, 0).applyQuaternion(board.quaternion);
        assert.ok(Math.abs(long.z) > .999);
    }
    const benches = station.children.filter(c => c.userData.family === 'bench');
    assert.ok(benches.length > 0);
    for (const bench of benches) {
        const front = new THREE.Vector3(0, 0, -1).applyQuaternion(bench.quaternion);
        assert.ok(front.x * bench.position.x < 0);
    }
});
test('lowered gates block the road width and skewed crossing panels keep rail alignment', () => {
    const shear = .5, g = new AssetFactory().crossing({ id: 'test', width: 8, trackSpacing: 4.2, roadShear: shear });
    setCrossingState(g, 1, 0);
    g.updateMatrixWorld(true);
    const road = new THREE.Vector3(1, 0, shear).normalize();
    for (const b of g.userData.barriers) {
        const arm = new THREE.Vector3(1, 0, 0).applyQuaternion(b.pivot.quaternion);
        assert.ok(Math.abs(arm.dot(road)) < 1e-6);
        assert.ok(Math.abs(arm.y) < 1e-6);
    }
    assert.ok(Math.abs(crossingShear({ tangent: [0, 0, -1], right: [1, 0, 0] }, [1, 0, .5]) - .5) < 1e-9);
});
