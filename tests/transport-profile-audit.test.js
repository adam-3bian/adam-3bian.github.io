import {test} from 'node:test';import assert from 'node:assert/strict';
import {CurvePath} from '../src/core/geometry.js';
import {polynomialRoots,profileExtrema} from '../scripts/transport-profile-audit.js';
test('polynomial root isolation includes repeated interior extrema',()=>{const roots=polynomialRoots([.04,-.41,1.41,-2,1]);assert.ok(roots.some(x=>Math.abs(x-.5)<1e-7));assert.ok(roots.some(x=>Math.abs(x-.2)<1e-7));assert.ok(roots.some(x=>Math.abs(x-.8)<1e-7));});
test('analytic grade audit finds an interior cap violation hidden by endpoint grades',()=>{const p=new CurvePath([[0,0,0],[16,.32,0]]);p.derivatives=[[1,0,0],[1,0,0]];const a=profileExtrema(p);assert.ok(a.maximum>.0299);assert.ok(a.maximum<.0301);assert.ok(Math.abs(a.at-p.length/2)<1e-5);});
