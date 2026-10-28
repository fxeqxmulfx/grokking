/**
 * The recovery lesson's slice of the state and the function that changes it, `updateRecovery`.
 * The app's `update` hands it the messages below; views read the slice; controls send them.
 */

import * as Core from './core.ts';
import type {Analysis, Mask, Matrix, PatternSpec, Solver, Springs, WitnessPoint} from './core.ts';

export type LabId = 'puzzle' | 'rigid' | 'hall' | 'weights';

export const isLabId = (id: string): id is LabId => id === 'puzzle' || id === 'rigid' || id === 'hall' || id === 'weights';

export interface Preset {
  readonly key: string;
  readonly spec: PatternSpec;
  /** A preset with its own size and weights; otherwise it keeps the lab's size, equal weights. */
  readonly N?: number;
  readonly a?: readonly number[];
  readonly b?: readonly number[];
}

export interface LabConfig {
  readonly N: number;
  /** The sizes offered, named `sizeName`; empty when each preset fixes its size. */
  readonly sizes: readonly number[];
  readonly sizeName: string;
  /** Draw entry (i, j) as the arrow ψ(i + j); otherwise every arrow points right. */
  readonly phases: boolean;
  readonly solver: boolean;
  readonly plan: boolean;
  readonly graph: boolean;
  readonly flip: boolean;
  readonly violation: boolean;
  readonly witness: boolean;
  readonly weights: boolean;
  readonly flow: boolean;
  readonly convergence: boolean;
  readonly maxIter: number;
  readonly stepsPerTick: number;
  readonly presets: readonly Preset[];
}

const S2 = Math.SQRT2, S3 = Math.sqrt(3);

function labConfig(config: Partial<LabConfig> & Pick<LabConfig, 'N' | 'presets'>): LabConfig {
  return {
    sizes: [], sizeName: 'N', phases: true, solver: false, plan: false, graph: false, flip: false, violation: false,
    witness: false, weights: false, flow: false, convergence: false, maxIter: 3000, stepsPerTick: 50, ...config,
  };
}

export const LABS: Readonly<Record<LabId, LabConfig>> = {
  puzzle: labConfig({
    N: 7, sizes: [7, 8], sizeName: 'p', solver: true,
    presets: [
      {key: 'two', spec: {kind: 'diag', offsets: [0, 1]}},
      {key: 'one', spec: {kind: 'diag', offsets: [0]}},
      {key: 'cross', spec: {kind: 'cross', i0: 0, j0: 0}},
      {key: 'offset2', spec: {kind: 'diag', offsets: [0, 2]}},
      {key: 'half', spec: {kind: 'random', fraction: 0.5}},
      {key: 'twop', spec: {kind: 'randomPerRow', perRow: 2}},
    ],
  }),
  rigid: labConfig({
    N: 4, sizes: [3, 4, 5], graph: true, flip: true,
    presets: [
      {key: 'two', spec: {kind: 'diag', offsets: [0, 1]}},
      {key: 'blocks', spec: {kind: 'blocks'}},
      {key: 'emptyRow', spec: {kind: 'emptyRow'}},
      {key: 'one', spec: {kind: 'diag', offsets: [0]}},
    ],
  }),
  hall: labConfig({
    N: 4, sizes: [3, 4, 5], solver: true, plan: true, violation: true, witness: true, maxIter: 6000, stepsPerTick: 80,
    presets: [
      {key: 'cross', spec: {kind: 'cross', i0: 0, j0: 0}},
      {key: 'squeeze', spec: {kind: 'squeeze'}},
      {key: 'two', spec: {kind: 'diag', offsets: [0, 1]}},
      {key: 'oneCell', spec: {kind: 'oneCell'}},
    ],
  }),
  weights: labConfig({
    N: 3, phases: false, solver: true, plan: true, violation: true, witness: true, weights: true, flow: true,
    convergence: true, maxIter: 6000, stepsPerTick: 80,
    presets: [
      {key: 'heavy', spec: {kind: 'cross', i0: 0, j0: 1}, N: 3, a: [2, 1, 1], b: [1, S2, S2]},
      {key: 'equal', spec: {kind: 'cross', i0: 0, j0: 1}, N: 3, a: [1, 1, 1], b: [1, 1, 1]},
      {key: 'edge', spec: {kind: 'cross', i0: 0, j0: 1}, N: 3, a: [S3, 1, 1], b: [1, S2, S2]},
      {key: 'light', spec: {kind: 'cross', i0: 0, j0: 1}, N: 3, a: [1.4, 1, 1], b: [1, S2, S2]},
      {key: 'heavyDiag', spec: {kind: 'diag', offsets: [0, 1]}, N: 4, a: [2, 1, 1, 1], b: [1, 1, 1, 1]},
    ],
  }),
};

export interface SpringsPreset {
  readonly key: string;
  readonly spec: PatternSpec;
}

export const SPRINGS = {
  N: 4,
  presets: [
    {key: 'rec', spec: {kind: 'diag', offsets: [0, 1]}},
    {key: 'pieces', spec: {kind: 'blocks'}},
    {key: 'cross', spec: {kind: 'cross', i0: 0, j0: 0}},
  ] as readonly SpringsPreset[],
  starts: {small: 0.05, large: 0.7},
  stepsPerTick: 12,
  maxSteps: 6000,
} as const;

export type SpringsStart = keyof typeof SPRINGS.starts;

export interface Lab {
  readonly id: LabId;
  readonly N: number;
  readonly mask: Mask;
  readonly a: readonly number[];
  readonly b: readonly number[];
  /** The preset shown, or null once a cell or a weight was changed by hand. */
  readonly preset: string | null;
  readonly seed: number;
  readonly info: Analysis;
  readonly solver: Solver | null;
  readonly running: boolean;
  /** One piece of a non-rigid pattern is shown with its signs flipped. */
  readonly flipped: boolean;
  /** The witness parameter and the witness's cost along s. */
  readonly s: number;
  readonly curve: readonly WitnessPoint[] | null;
  /** The weight bar held by the pointer. */
  readonly grab: {readonly side: 'a' | 'b'; readonly k: number} | null;
}

export interface SpringsLab {
  readonly preset: string;
  readonly start: SpringsStart;
  readonly seed: number;
  readonly info: Analysis;
  readonly T: Matrix | null;
  readonly sp: Springs;
  readonly playing: boolean;
}

export interface RecoveryState {
  readonly labs: Readonly<Partial<Record<LabId, Lab>>>;
  readonly springs: SpringsLab | null;
}

export type RecoveryMessage =
  | {readonly type: 'lab/init'; readonly id: LabId}
  | {readonly type: 'lab/preset'; readonly id: LabId; readonly key: string}
  | {readonly type: 'lab/toggle'; readonly id: LabId; readonly i: number; readonly j: number}
  | {readonly type: 'lab/size'; readonly id: LabId; readonly N: number}
  | {readonly type: 'lab/weight'; readonly id: LabId; readonly side: 'a' | 'b'; readonly k: number; readonly value: number}
  | {readonly type: 'lab/grab'; readonly id: LabId; readonly side: 'a' | 'b'; readonly k: number; readonly x: number; readonly y: number}
  | {readonly type: 'lab/drag'; readonly id: LabId; readonly x: number; readonly y: number}
  | {readonly type: 'lab/release'; readonly id: LabId}
  | {readonly type: 'lab/run'; readonly id: LabId}
  | {readonly type: 'lab/flip'; readonly id: LabId}
  | {readonly type: 'lab/witness'; readonly id: LabId; readonly value: number}
  | {readonly type: 'springs/init'}
  | {readonly type: 'springs/preset'; readonly key: string}
  | {readonly type: 'springs/start'; readonly start: SpringsStart}
  | {readonly type: 'springs/reset'}
  | {readonly type: 'springs/play'};

export const WEIGHT_RANGE = {min: 0.25, max: 3} as const;

/** The layout of a lab's table, in SVG units: cells of size `cell` from (`left`, `top`), and
    weight bars of length `bar` that end `gap` before the table. */
export interface Geometry {
  readonly N: number;
  readonly cell: number;
  readonly left: number;
  readonly top: number;
  readonly width: number;
  readonly height: number;
  readonly bar: number;
  readonly gap: number;
}

export function geometry(N: number, config: LabConfig): Geometry {
  const cell = N <= 3 ? 76 : N <= 4 ? 66 : N <= 5 ? 58 : 50;
  const left = config.weights ? 104 : 34, top = config.weights ? 104 : 30;
  return {N, cell, left, top, width: left + N * cell + 12, height: top + N * cell + 12, bar: 70, gap: 30};
}

/** The weight a held bar shows when the pointer is at (x, y). */
function weightAt(lab: Lab, side: 'a' | 'b', x: number, y: number): number {
  const g = geometry(lab.N, LABS[lab.id]);
  const length = side === 'a' ? g.left - g.gap - x : g.top - g.gap - y;
  return (length / g.bar) * WEIGHT_RANGE.max;
}

export function initialRecovery(): RecoveryState {
  return {labs: {}, springs: null};
}

/** Whether a solver or the springs still move, so that the clock should tick. */
export function isMoving(state: RecoveryState): boolean {
  return Object.values(state.labs).some(lab => lab?.running) || !!state.springs?.playing;
}

/** Recompute everything that follows from the cells and the weights, and restart M. */
function refresh(
  lab: Omit<Lab, 'info' | 'solver' | 'running' | 'flipped' | 's' | 'curve' | 'grab'> & {readonly grab?: Lab['grab']},
  keep?: Pick<Lab, 'flipped' | 's'>,
): Lab {
  const config = LABS[lab.id];
  const info = Core.analyze(lab.N, lab.mask, lab.a, lab.b);
  const v = info.violation;
  const solver = config.solver ? Core.solverInit(lab.N, lab.mask, lab.a, lab.b) : null;
  return {
    ...lab, info, solver, running: solver !== null,
    flipped: keep?.flipped ?? false,
    s: keep?.s ?? (v ? Core.witnessBest(v) : 0.5),
    curve: v && config.witness ? Core.witnessCurve(lab.N, lab.a, lab.b, v) : null,
    grab: lab.grab ?? null,
  };
}

function setWeight(lab: Lab, side: 'a' | 'b', k: number, value: number): Lab {
  if (!LABS[lab.id].weights || k < 0 || k >= lab.N || !Number.isFinite(value)) return lab;
  const weights = (side === 'a' ? lab.a : lab.b).slice();
  weights[k] = Math.min(WEIGHT_RANGE.max, Math.max(WEIGHT_RANGE.min, value));
  if (weights[k] === (side === 'a' ? lab.a : lab.b)[k]) return lab;
  return refresh({...lab, [side]: weights, preset: null});
}

function applyPreset(id: LabId, seed: number, N: number, preset: Preset): Lab {
  const size = preset.N ?? N, ones = new Array<number>(size).fill(1);
  return refresh({
    id, N: size, seed: seed + 1, preset: preset.key,
    mask: Core.pattern(size, preset.spec, seed),
    a: preset.a ? preset.a.slice() : ones, b: preset.b ? preset.b.slice() : ones.slice(),
  });
}

function changeLab(state: RecoveryState, id: LabId, change: (lab: Lab) => Lab): RecoveryState {
  const lab = state.labs[id];
  if (!lab) return state;
  const next = change(lab);
  return next === lab ? state : {...state, labs: {...state.labs, [id]: next}};
}

function buildSprings(preset: string, start: SpringsStart, seed: number): SpringsLab {
  const p = SPRINGS.presets.find(q => q.key === preset) ?? SPRINGS.presets[0];
  const N = SPRINGS.N, ones = new Array<number>(N).fill(1), mask = Core.pattern(N, p.spec);
  const info = Core.analyze(N, mask, ones, ones);
  const T = info.feasible ? info.flow.T : null;
  const sp = Core.springsInit(N, mask, ones, ones, seed, SPRINGS.starts[start], T);
  return {preset: p.key, start, seed, info, T, sp, playing: true};
}

/** Advance every running solver and the springs by one frame's steps. */
export function tickRecovery(state: RecoveryState): RecoveryState {
  let labs = state.labs, springs = state.springs, changed = false;
  for (const id of Object.keys(labs) as LabId[]) {
    const lab = labs[id];
    if (!lab?.running || !lab.solver) continue;
    const config = LABS[id];
    const solver = Core.solverRun(lab.solver, config.stepsPerTick, config.maxIter);
    labs = {...labs, [id]: {...lab, solver, running: !solver.done}};
    changed = true;
  }
  if (springs?.playing) {
    const sp = Core.springsRun(springs.sp, SPRINGS.stepsPerTick, springs.T);
    springs = {...springs, sp, playing: sp.step < SPRINGS.maxSteps};
    changed = true;
  }
  return changed ? {...state, labs, springs} : state;
}

export function updateRecovery(state: RecoveryState, message: RecoveryMessage): RecoveryState {
  switch (message.type) {
    case 'lab/init': {
      if (state.labs[message.id]) return state;
      const config = LABS[message.id];
      return {...state, labs: {...state.labs, [message.id]: applyPreset(message.id, 7, config.N, config.presets[0])}};
    }
    case 'lab/preset':
      return changeLab(state, message.id, lab => {
        const preset = LABS[lab.id].presets.find(p => p.key === message.key);
        return preset ? applyPreset(lab.id, lab.seed, lab.N, preset) : lab;
      });
    case 'lab/toggle':
      return changeLab(state, message.id, lab => {
        if (message.i >= lab.N || message.j >= lab.N) return lab;
        const mask = lab.mask.map(row => row.slice());
        mask[message.i][message.j] = !mask[message.i][message.j];
        return refresh({...lab, mask, preset: null});
      });
    case 'lab/size':
      return changeLab(state, message.id, lab => {
        const config = LABS[lab.id];
        if (!config.sizes.includes(message.N) || message.N === lab.N) return lab;
        const presets = config.presets.filter(p => p.N === undefined);
        const preset = presets.find(p => p.key === lab.preset) ?? presets[0];
        return preset ? applyPreset(lab.id, lab.seed, message.N, preset) : lab;
      });
    case 'lab/weight':
      return changeLab(state, message.id, lab => setWeight(lab, message.side, message.k, message.value));
    case 'lab/grab':
      return changeLab(state, message.id, lab => {
        if (!LABS[lab.id].weights || message.k < 0 || message.k >= lab.N) return lab;
        const held = {...lab, grab: {side: message.side, k: message.k}};
        return setWeight(held, message.side, message.k, weightAt(held, message.side, message.x, message.y));
      });
    case 'lab/drag':
      return changeLab(state, message.id, lab =>
        lab.grab ? setWeight(lab, lab.grab.side, lab.grab.k, weightAt(lab, lab.grab.side, message.x, message.y)) : lab,
      );
    case 'lab/release':
      return changeLab(state, message.id, lab => (lab.grab ? {...lab, grab: null} : lab));
    case 'lab/run':
      return changeLab(state, message.id, lab => refresh(lab, {flipped: lab.flipped, s: lab.s}));
    case 'lab/flip':
      return changeLab(state, message.id, lab => (lab.info.rigid ? lab : {...lab, flipped: !lab.flipped}));
    case 'lab/witness':
      return changeLab(state, message.id, lab =>
        Number.isFinite(message.value) ? {...lab, s: Math.min(1, Math.max(0, message.value))} : lab,
      );
    case 'springs/init':
      return state.springs ? state : {...state, springs: buildSprings(SPRINGS.presets[0].key, 'small', 3)};
    case 'springs/preset':
      return state.springs ? {...state, springs: buildSprings(message.key, state.springs.start, state.springs.seed)} : state;
    case 'springs/start':
      return state.springs ? {...state, springs: buildSprings(state.springs.preset, message.start, state.springs.seed)} : state;
    case 'springs/reset':
      return state.springs ? {...state, springs: buildSprings(state.springs.preset, state.springs.start, state.springs.seed + 1)} : state;
    case 'springs/play': {
      const springs = state.springs;
      if (!springs) return state;
      if (springs.sp.step >= SPRINGS.maxSteps) return {...state, springs: buildSprings(springs.preset, springs.start, springs.seed + 1)};
      return {...state, springs: {...springs, playing: !springs.playing}};
    }
  }
}
