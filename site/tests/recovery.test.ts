/** The recovery widgets compute what Theorems D, E and F say. */

import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as Core from '../src/recovery/core.ts';

const ones = (N: number): number[] => new Array<number>(N).fill(1);

test('two diagonals of ℤ/7 are rigid and carry a permutation, and M recovers the table (D.5, E.2)', () => {
  const N = 7, mask = Core.pattern(N, {kind: 'diag', offsets: [0, 1]});
  const info = Core.analyze(N, mask, ones(N), ones(N));
  assert.ok(info.rigid && info.feasible && info.recovered);
  const sol = Core.solverRun(Core.solverInit(N, mask, ones(N), ones(N)), 3000, 3000);
  assert.ok(sol.err !== null && sol.err < 1e-6, `error ${sol.err}`);
  assert.ok(Math.abs(sol.gap ?? 1) < 1e-6, `gap ${sol.gap}`);
});

test('offsets 0 and 2 of ℤ/8 fall into the even and the odd piece (D.8)', () => {
  const comps = Core.components(8, Core.pattern(8, {kind: 'diag', offsets: [0, 2]}));
  assert.equal(comps.count, 2);
  for (let i = 0; i < 8; i++) assert.equal(comps.row[i], comps.row[i % 2]);
});

test('the cross is rigid, has no permutation, and its least norm is 2√(N − 1) (D.9)', () => {
  for (const N of [3, 4]) {
    const mask = Core.pattern(N, {kind: 'cross', i0: 0, j0: 0});
    const info = Core.analyze(N, mask, ones(N), ones(N));
    assert.ok(info.rigid && !info.feasible && !info.recovered);
    const sol = Core.solverRun(Core.solverInit(N, mask, ones(N), ones(N)), 6000, 6000);
    assert.ok(Math.abs((sol.gap ?? 0) - (2 * Math.sqrt(N - 1) - N)) < 1e-4, `N = ${N}: gap ${sol.gap}`);
  }
});

test('the witness of a missed block costs less than the table for small s (E.3)', () => {
  const N = 4, mask = Core.pattern(N, {kind: 'cross', i0: 0, j0: 0});
  const v = Core.analyze(N, mask, ones(N), ones(N)).violation;
  assert.ok(v);
  assert.deepEqual([v.R, v.NR], [[1, 2, 3], [0]]);
  for (const s of [0.05, 0.2, Core.witnessBest(v)]) {
    const w = Core.witnessAt(N, ones(N), ones(N), v, s);
    assert.ok(w.actual < N && w.actual <= w.bound + 1e-9, `s = ${s}: ${w.actual}, bound ${w.bound}`);
  }
});

test('the cross of (i₀, j₀) carries a plan exactly when α_i₀ + β_j₀ ≥ 1', () => {
  const random = Core.rng(11);
  const seen = {plan: 0, none: 0};
  for (let draw = 0; draw < 400; draw++) {
    const N = 3 + (draw % 3), i0 = draw % N, j0 = (draw * 7) % N;
    const a = Array.from({length: N}, (_, k) => (k === i0 ? 0.6 + 2 * random() : 0.3 + random()));
    const b = Array.from({length: N}, (_, k) => (k === j0 ? 0.6 + 2 * random() : 0.3 + random()));
    const info = Core.analyze(N, Core.pattern(N, {kind: 'cross', i0, j0}), a, b);
    const margin = info.alpha[i0] + info.beta[j0] - 1;
    if (Math.abs(margin) < 1e-6) continue;
    assert.equal(info.feasible, margin > 0, `draw ${draw}: margin ${margin}`);
    assert.ok(info.rigid);
    seen[info.feasible ? 'plan' : 'none']++;
  }
  // Both sides of the condition are drawn often.
  assert.ok(seen.plan > 100 && seen.none > 100, JSON.stringify(seen));
});

test('the presets of the weights lab sit where the text says (F.2, section 5)', () => {
  const S2 = Math.SQRT2, S3 = Math.sqrt(3), cross = Core.pattern(3, {kind: 'cross', i0: 0, j0: 1});
  const edge = Core.analyze(3, cross, [S3, 1, 1], [1, S2, S2]);
  assert.ok(edge.recovered && edge.tight);
  assert.ok(Math.abs(edge.alpha[0] - 0.6) < 1e-12 && Math.abs(edge.beta[1] - 0.4) < 1e-12);
  assert.ok(Core.analyze(3, cross, [2, 1, 1], [1, S2, S2]).recovered);
  assert.ok(!Core.analyze(3, cross, [1.4, 1, 1], [1, S2, S2]).recovered);
  assert.ok(!Core.analyze(3, cross, [1, 1, 1], [1, 1, 1]).recovered);
});

test('the singular values of a rank-one table: one of them is ‖a‖ ‖b‖', () => {
  const a = [1, 2, 3], b = [4, 5, 6], A = a.map(x => b.map(y => x * y));
  const S = Array.from(Core.svd(A).S).sort((x, y) => y - x);
  assert.ok(Math.abs(S[0] - Math.hypot(...a) * Math.hypot(...b)) < 1e-9);
  assert.ok(S[1] < 1e-9 && S[2] < 1e-9);
});
