/** The one update function of the site: pure, and the same state when nothing changes. */

import {test} from 'node:test';
import assert from 'node:assert/strict';
import {initialState, moving, update} from '../src/app/update.ts';

test('a route message parses the hash, and the same route keeps the state', () => {
  const s1 = update(initialState(), {type: 'route', hash: '#/ru/recovery/weights', preferred: []});
  assert.deepEqual(s1.route, {lang: 'ru', page: 'recovery', section: 'weights'});
  assert.equal(update(s1, {type: 'route', hash: '#/ru/recovery/weights', preferred: ['en']}), s1);
  assert.equal(update(s1, {type: 'route', hash: '#/ru/nowhere', preferred: []}).route.page, 'missing');
});

test('a quiz is checked only after a choice, and a new choice clears the check', () => {
  const q = 'recovery/q1';
  let s = initialState();
  assert.equal(update(s, {type: 'quiz/check', q}), s);
  s = update(s, {type: 'quiz/choose', q, k: 2});
  s = update(s, {type: 'quiz/check', q});
  assert.deepEqual(s.quiz[q], {choice: 2, checked: true, hint: false});
  assert.equal(update(s, {type: 'quiz/check', q}), s);
  s = update(s, {type: 'quiz/choose', q, k: 1});
  assert.deepEqual(s.quiz[q], {choice: 1, checked: false, hint: false});
  s = update(s, {type: 'quiz/hint', q});
  assert.equal(s.quiz[q]?.hint, true);
});

test('hover and status messages change only their own key', () => {
  const s0 = initialState();
  const s1 = update(s0, {type: 'hover', key: 'hall:witness', x: 0.3});
  assert.equal(s1.hover['hall:witness'], 0.3);
  assert.equal(update(s1, {type: 'hover', key: 'hall:witness', x: 0.3}), s1);
  const s2 = update(s1, {type: 'status/select', key: 'recovery:e'});
  assert.equal(s2.status, 'recovery:e');
  assert.equal(s2.hover, s1.hover);
});

test('a lab is built once and kept across later inits', () => {
  const s1 = update(initialState(), {type: 'lab/init', id: 'rigid'});
  assert.equal(s1.recovery.labs.rigid?.N, 4);
  assert.equal(update(s1, {type: 'lab/init', id: 'rigid'}), s1);
  const s2 = update(s1, {type: 'lab/toggle', id: 'rigid', i: 0, j: 0});
  assert.equal(s2.recovery.labs.rigid?.preset, null);
  assert.equal(update(s2, {type: 'lab/toggle', id: 'rigid', i: 9, j: 0}), s2);
  assert.equal(update(s2, {type: 'lab/toggle', id: 'hall', i: 0, j: 0}), s2);
});

test('the clock runs while M runs and stops when it is done', () => {
  let s = update(initialState(), {type: 'lab/init', id: 'puzzle'});
  assert.ok(moving(s));
  let ticks = 0;
  for (; ticks < 200 && moving(s); ticks++) s = update(s, {type: 'tick'});
  assert.ok(!moving(s), `still running after ${ticks} ticks`);
  const solver = s.recovery.labs.puzzle?.solver;
  assert.ok(solver?.done && solver.err !== null && solver.err < 1e-6);
  assert.equal(update(s, {type: 'tick'}), s);
});

test('the weight of a bar stays in its range and a drag needs a grab', () => {
  let s = update(initialState(), {type: 'lab/init', id: 'weights'});
  assert.equal(update(s, {type: 'lab/drag', id: 'weights', x: 0, y: 0}), s);
  s = update(s, {type: 'lab/weight', id: 'weights', side: 'a', k: 0, value: 99});
  assert.equal(s.recovery.labs.weights?.a[0], 3);
  s = update(s, {type: 'lab/weight', id: 'weights', side: 'b', k: 2, value: -5});
  assert.equal(s.recovery.labs.weights?.b[2], 0.25);
});
