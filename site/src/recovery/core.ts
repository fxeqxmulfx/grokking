/**
 * The mathematics of the recovery lesson, as pure functions: patterns of kept cells, rigidity,
 * transport plans and Hall violators, the machine M (least nuclear norm, solved by ADMM), the
 * cheaper witness of Theorems E.3 and F.3, and the spring picture of Theorem F's proof.
 *
 * Source: the transformer repository, `review/flat_spectrum.md`, "Exact recovery of a rank-one
 * kernel", Theorems D, E and F. Matrices are real; complex phases enter only the display
 * (Theorem D.4: unit phases change neither the norm nor the answer).
 */

export type Matrix = number[][];
export type Mask = boolean[][];
export type Point = [number, number];

export type PatternSpec =
  | {readonly kind: 'diag'; readonly offsets: readonly number[]}
  | {readonly kind: 'cross'; readonly i0: number; readonly j0: number}
  | {readonly kind: 'blocks' | 'emptyRow' | 'squeeze' | 'oneCell'}
  | {readonly kind: 'cells'; readonly cells: readonly (readonly [number, number])[]}
  | {readonly kind: 'random'; readonly fraction: number}
  | {readonly kind: 'randomPerRow'; readonly perRow: number};

export const sum = (values: readonly number[]): number => values.reduce((s, x) => s + x, 0);
const square = (N: number): Matrix => Array.from({length: N}, () => new Array<number>(N).fill(0));
const emptyMask = (N: number): Mask => Array.from({length: N}, () => new Array<boolean>(N).fill(false));

/** A seeded generator in [0, 1) (mulberry32). */
export function rng(seed: number): () => number {
  let t = seed >>> 0;
  return () => {
    t = (t + 0x6d2b79f5) >>> 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

/** The kept cells of an N × N table described by `spec`. */
export function pattern(N: number, spec: PatternSpec, seed = 1): Mask {
  const mask = emptyMask(N);
  const keep = (i: number, j: number): void => {
    if (i < N && j < N) mask[i][j] = true;
  };
  const keepRandom = (count: number): void => {
    const next = rng(seed), all: [number, number][] = [];
    for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) all.push([i, j]);
    for (let k = all.length - 1; k > 0; k--) {
      const l = Math.floor(next() * (k + 1));
      [all[k], all[l]] = [all[l], all[k]];
    }
    for (const [i, j] of all.slice(0, count)) keep(i, j);
  };
  switch (spec.kind) {
    case 'diag':
      for (const s of spec.offsets) for (let i = 0; i < N; i++) keep(i, (i + s) % N);
      break;
    case 'cross': {
      const i0 = Math.min(spec.i0, N - 1), j0 = Math.min(spec.j0, N - 1);
      for (let k = 0; k < N; k++) {
        keep(i0, k);
        keep(k, j0);
      }
      break;
    }
    case 'blocks': {
      const cut = Math.floor(N / 2);
      for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) if ((i < cut) === (j < cut)) keep(i, j);
      break;
    }
    case 'emptyRow':
      for (let i = 0; i < N - 1; i++) {
        keep(i, i);
        keep(i, (i + 1) % N);
      }
      break;
    case 'squeeze':
      for (let j = 0; j < N; j++) keep(0, j);
      for (let i = 1; i < N; i++) for (let j = 0; j < N - 2; j++) keep(i, j);
      break;
    case 'oneCell':
      keep(0, 0);
      for (let i = 1; i < N; i++) for (let j = 0; j < N; j++) keep(i, j);
      break;
    case 'cells':
      for (const [i, j] of spec.cells) keep(i, j);
      break;
    case 'random':
      keepRandom(Math.round(spec.fraction * N * N));
      break;
    case 'randomPerRow':
      keepRandom(spec.perRow * N);
      break;
  }
  return mask;
}

export interface Components {
  readonly row: number[];
  readonly col: number[];
  readonly count: number;
}

/** Connected pieces of the graph with a node per row and per column and an edge per kept
    cell. Pieces are numbered by first appearance, rows first. */
export function components(N: number, mask: Mask): Components {
  const parent = Array.from({length: 2 * N}, (_, k) => k);
  const find = (k: number): number => {
    while (parent[k] !== k) {
      parent[k] = parent[parent[k]];
      k = parent[k];
    }
    return k;
  };
  for (let i = 0; i < N; i++)
    for (let j = 0; j < N; j++)
      if (mask[i][j]) {
        const r1 = find(i), r2 = find(N + j);
        if (r1 !== r2) parent[r1] = r2;
      }
  const label = new Map<number, number>();
  for (let k = 0; k < 2 * N; k++) {
    const r = find(k);
    if (!label.has(r)) label.set(r, label.size);
  }
  const piece = (k: number): number => label.get(find(k)) ?? 0;
  return {
    row: Array.from({length: N}, (_, i) => piece(i)),
    col: Array.from({length: N}, (_, j) => piece(N + j)),
    count: label.size,
  };
}

export interface Flow {
  /** The flow on each cell: a transport plan when `value` reaches the total. */
  readonly T: Matrix;
  readonly value: number;
  /** The rows reachable in the residual graph, and the columns they reach: N(R). */
  readonly R: number[];
  readonly NR: number[];
}

/**
 * The largest flow from rows (supplies `alpha`) through kept cells to columns (demands
 * `beta`), by Edmonds–Karp. At the end the rows `R` reachable in the residual graph and the
 * columns `NR` they reach satisfy `NR = N(R)` and `sum_R alpha − sum_N(R) beta = total − value`,
 * so a flow short of the total names a Hall violator.
 */
export function maxflow(N: number, mask: Mask, alpha: readonly number[], beta: readonly number[]): Flow {
  const n = 2 * N + 2, s = 0, t = n - 1, INF = 1e18, tol = 1e-13;
  const cap = Array.from({length: n}, () => new Float64Array(n));
  const flow = Array.from({length: n}, () => new Float64Array(n));
  for (let i = 0; i < N; i++) cap[s][1 + i] = alpha[i];
  for (let j = 0; j < N; j++) cap[1 + N + j][t] = beta[j];
  for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) if (mask[i][j]) cap[1 + i][1 + N + j] = INF;
  const residual = (u: number, v: number): number => cap[u][v] - flow[u][v];
  const reach = (): Int32Array => {
    const prev = new Int32Array(n).fill(-1);
    prev[s] = s;
    const queue = [s];
    for (let q = 0; q < queue.length; q++) {
      const u = queue[q];
      for (let v = 0; v < n; v++)
        if (prev[v] < 0 && residual(u, v) > tol) {
          prev[v] = u;
          queue.push(v);
        }
    }
    return prev;
  };
  let value = 0;
  for (;;) {
    const prev = reach();
    if (prev[t] < 0) break;
    let push = INF;
    for (let v = t; v !== s; v = prev[v]) push = Math.min(push, residual(prev[v], v));
    for (let v = t; v !== s; v = prev[v]) {
      flow[prev[v]][v] += push;
      flow[v][prev[v]] -= push;
    }
    value += push;
  }
  const seen = reach();
  const T = Array.from({length: N}, (_, i) => Array.from({length: N}, (_, j) => Math.max(0, flow[1 + i][1 + N + j])));
  const R: number[] = [], NR: number[] = [];
  for (let i = 0; i < N; i++) if (seen[1 + i] >= 0) R.push(i);
  for (let j = 0; j < N; j++) if (seen[1 + N + j] >= 0) NR.push(j);
  return {T, value, R, NR};
}

/** The least slack `sum_N(R) beta − sum_R alpha` over the nonempty proper row sets `R`. */
export function leastSlack(N: number, mask: Mask, alpha: readonly number[], beta: readonly number[]): number {
  let best = Infinity;
  for (let bits = 1; bits < (1 << N) - 1; bits++) {
    let supply = 0, demand = 0;
    const hit = new Array<boolean>(N).fill(false);
    for (let i = 0; i < N; i++)
      if ((bits >> i) & 1) {
        supply += alpha[i];
        for (let j = 0; j < N; j++) if (mask[i][j]) hit[j] = true;
      }
    for (let j = 0; j < N; j++) if (hit[j]) demand += beta[j];
    best = Math.min(best, demand - supply);
  }
  return best;
}

export interface Violation {
  /** Rows whose sand does not fit into their columns N(R); C is the rest of the columns. */
  readonly R: number[];
  readonly NR: number[];
  readonly C: number[];
  readonly alphaR: number;
  readonly betaNR: number;
  /** δ = α_R − β_N(R) > 0, in shares. */
  readonly delta: number;
}

export interface Analysis {
  /** The shares α_i = |a_i|²/‖a‖² and β_j = |b_j|²/‖b‖². */
  readonly alpha: number[];
  readonly beta: number[];
  readonly comps: Components;
  readonly rigid: boolean;
  readonly flow: Flow;
  /** A plan carries all the sand. */
  readonly feasible: boolean;
  readonly uniform: boolean;
  /** Theorem F (E for equal weights): recovery holds exactly when rigid and feasible. */
  readonly recovered: boolean;
  /** Some proper row set fills its columns exactly. */
  readonly tight: boolean;
  readonly violation: Violation | null;
}

/** What the theorems say about the kept cells `mask` and the kernel `a bᵀ`, no zero entries. */
export function analyze(N: number, mask: Mask, a: readonly number[], b: readonly number[]): Analysis {
  const sa = sum(a.map(x => x * x)), sb = sum(b.map(x => x * x));
  const alpha = a.map(x => (x * x) / sa), beta = b.map(x => (x * x) / sb);
  const comps = components(N, mask);
  const rigid = comps.count === 1;
  const flow = maxflow(N, mask, alpha, beta);
  const feasible = flow.value >= 1 - 1e-9;
  const uniform = a.every(x => Math.abs(x - a[0]) < 1e-12) && b.every(x => Math.abs(x - b[0]) < 1e-12);
  let violation: Violation | null = null;
  if (!feasible) {
    const {R, NR} = flow, C: number[] = [];
    for (let j = 0; j < N; j++) if (!NR.includes(j)) C.push(j);
    const alphaR = sum(R.map(i => alpha[i])), betaNR = sum(NR.map(j => beta[j]));
    violation = {R, NR, C, alphaR, betaNR, delta: alphaR - betaNR};
  }
  const tight = feasible && leastSlack(N, mask, alpha, beta) < 1e-9;
  return {alpha, beta, comps, rigid, flow, feasible, uniform, recovered: rigid && feasible, tight, violation};
}

export interface Svd {
  readonly U: Float64Array[];
  readonly S: Float64Array;
  readonly V: Float64Array[];
}

/** One-sided Jacobi SVD of a real square matrix: A = U diag(S) Vᵀ. */
export function svd(A: readonly (readonly number[])[]): Svd {
  const n = A.length;
  const W = A.map(r => Float64Array.from(r));
  const V = Array.from({length: n}, (_, i) => {
    const r = new Float64Array(n);
    r[i] = 1;
    return r;
  });
  for (let sweep = 0; sweep < 60; sweep++) {
    let off = 0;
    for (let p = 0; p < n - 1; p++)
      for (let q = p + 1; q < n; q++) {
        let al = 0, be = 0, ga = 0;
        for (let i = 0; i < n; i++) {
          const wp = W[i][p], wq = W[i][q];
          al += wp * wp;
          be += wq * wq;
          ga += wp * wq;
        }
        if (ga === 0 || Math.abs(ga) <= 1e-15 * Math.sqrt(al * be)) continue;
        off = Math.max(off, Math.abs(ga) / Math.sqrt(al * be));
        const zeta = (be - al) / (2 * ga);
        const tt = (zeta >= 0 ? 1 : -1) / (Math.abs(zeta) + Math.sqrt(1 + zeta * zeta));
        const c = 1 / Math.sqrt(1 + tt * tt), sn = c * tt;
        for (let i = 0; i < n; i++) {
          const wp = W[i][p], wq = W[i][q];
          W[i][p] = c * wp - sn * wq;
          W[i][q] = sn * wp + c * wq;
        }
        for (let i = 0; i < n; i++) {
          const vp = V[i][p], vq = V[i][q];
          V[i][p] = c * vp - sn * vq;
          V[i][q] = sn * vp + c * vq;
        }
      }
    if (off < 1e-15) break;
  }
  const S = new Float64Array(n), U = Array.from({length: n}, () => new Float64Array(n));
  for (let k = 0; k < n; k++) {
    let norm = 0;
    for (let i = 0; i < n; i++) norm += W[i][k] * W[i][k];
    norm = Math.sqrt(norm);
    S[k] = norm;
    for (let i = 0; i < n; i++) U[i][k] = norm > 1e-300 ? W[i][k] / norm : 0;
  }
  return {U, S, V};
}

/** ‖A‖_S1, the sum of the singular values. */
export const nuclear = (A: readonly (readonly number[])[]): number => sum(Array.from(svd(A).S));

/** Singular value thresholding: every singular value shrinks by `tau`. */
export function svt(A: readonly (readonly number[])[], tau: number): Matrix {
  const {U, S, V} = svd(A), n = A.length, X = square(n);
  for (let k = 0; k < n; k++) {
    const sk = S[k] - tau;
    if (sk <= 0) continue;
    for (let i = 0; i < n; i++) {
      const u = U[i][k] * sk;
      if (u === 0) continue;
      for (let j = 0; j < n; j++) X[i][j] += u * V[j][k];
    }
  }
  return X;
}

/** The scaling with sum a'² = sum b'² = N, so that ‖a' b'ᵀ‖_S1 = N. */
export function balanced(N: number, a: readonly number[], b: readonly number[]): {a: number[]; b: number[]} {
  const ca = Math.sqrt(N / sum(a.map(x => x * x))), cb = Math.sqrt(N / sum(b.map(x => x * x)));
  return {a: a.map(x => x * ca), b: b.map(x => x * cb)};
}

export interface Solver {
  readonly N: number;
  readonly mask: Mask;
  /** The balanced kernel a bᵀ, with ‖K‖_S1 = N. */
  readonly K: Matrix;
  /** The feasible iterate: K on the kept cells. */
  readonly Z: Matrix;
  readonly U: Matrix;
  readonly iter: number;
  /** (step, relative error off the kept cells), every 25 steps. */
  readonly errs: readonly (readonly [number, number])[];
  readonly offNorm: number;
  readonly err: number | null;
  /** ‖Z‖_S1 − ‖K‖_S1. */
  readonly gap: number | null;
  readonly done: boolean;
}

export function solverInit(N: number, mask: Mask, a: readonly number[], b: readonly number[]): Solver {
  const w = balanced(N, a, b);
  const K = w.a.map(x => w.b.map(y => x * y));
  const Z = K.map((r, i) => r.map((v, j) => (mask[i][j] ? v : 0)));
  let off = 0;
  for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) if (!mask[i][j]) off += K[i][j] * K[i][j];
  return {N, mask, K, Z, U: square(N), iter: 0, errs: [], offNorm: Math.sqrt(off), err: null, gap: null, done: false};
}

function offError(sol: Solver, Z: Matrix): number {
  if (sol.offNorm === 0) return 0;
  let e = 0;
  for (let i = 0; i < sol.N; i++) for (let j = 0; j < sol.N; j++) if (!sol.mask[i][j]) e += (Z[i][j] - sol.K[i][j]) ** 2;
  return Math.sqrt(e) / sol.offNorm;
}

/**
 * `steps` more ADMM steps for M: least ‖X‖_S1 with X = K on the kept cells, split as X = Z
 * with penalty 1/√N, the iteration of the torch checks.
 */
export function solverRun(sol: Solver, steps: number, maxIter: number): Solver {
  const N = sol.N, tau = Math.sqrt(N);
  const Z = sol.Z.map(r => r.slice()), U = sol.U.map(r => r.slice()), errs = sol.errs.slice();
  let iter = sol.iter;
  for (let k = 0; k < steps && iter < maxIter; k++) {
    const X = svt(Z.map((r, i) => r.map((v, j) => v - U[i][j])), tau);
    for (let i = 0; i < N; i++)
      for (let j = 0; j < N; j++) {
        const z = sol.mask[i][j] ? sol.K[i][j] : X[i][j] + U[i][j];
        U[i][j] += X[i][j] - z;
        Z[i][j] = z;
      }
    iter++;
    if (iter % 25 === 0 || iter === 1) {
      const e = offError(sol, Z);
      errs.push([iter, e]);
      if (e < 1e-13) break;
    }
  }
  const err = offError(sol, Z);
  return {...sol, Z, U, iter, errs, err, gap: nuclear(Z) - N, done: iter >= maxIter || err < 1e-13};
}

export interface WitnessPoint {
  readonly s: number;
  /** ‖X(s)‖_S1, computed. */
  readonly actual: number;
  /** ½(‖U‖² + ‖V‖²) of its factorization: m (1 − ½ s² (δ − s² α_R)) with m = N, in shares. */
  readonly bound: number;
}

/** The witness X(s) = a bᵀ − s² a_R b_Cᵀ of a violator, which agrees with a bᵀ on the kept cells. */
export function witnessAt(N: number, a: readonly number[], b: readonly number[], v: Violation, s: number): WitnessPoint {
  const w = balanced(N, a, b), R = new Set(v.R), C = new Set(v.C);
  const X = w.a.map((x, i) => w.b.map((y, j) => x * y * (R.has(i) && C.has(j) ? 1 - s * s : 1)));
  return {s, actual: nuclear(X), bound: N * (1 - 0.5 * s * s * (v.delta - s * s * v.alphaR))};
}

/** The bound's best s: s² = δ / (2 α_R), at most 1. */
export const witnessBest = (v: Violation): number => Math.min(1, Math.sqrt(v.delta / (2 * Math.max(v.alphaR, 1e-12))));

export function witnessCurve(N: number, a: readonly number[], b: readonly number[], v: Violation, samples = 40): WitnessPoint[] {
  return Array.from({length: samples + 1}, (_, k) => witnessAt(N, a, b, v, k / samples));
}

export interface ExactWitness {
  /** k = |R| and l = |C|, with k + l > N. */
  readonly k: number;
  readonly l: number;
  /** g² = k l (N − k)(N − l), an integer. */
  readonly g2: number;
  /** The best t = s²: 1 − g/(k l). */
  readonly t: number;
  /** The least cost over every real t: √(k (N − l)) + √(l (N − k)). */
  readonly least: number;
}

/**
 * Lean's exact cost of the witness for equal weights, X = J − t 1_R 1_Cᵀ with t = s²:
 * ‖X‖²_S1 = N² − 2t (k l − g) + t² k l for t ≥ 0 (`nuclearNorm_onesSubBlock_sq_of_nonneg`), least
 * at t = 1 − g/(k l), where it is √(k (N − l)) + √(l (N − k)) (`nuclearNorm_onesSubBlock_best`,
 * `isLeast_nuclearNorm_onesSubBlock`). A violator has k, l ≥ 1 and, for equal weights, k + l > N.
 */
export function witnessExact(N: number, v: Violation): ExactWitness {
  const k = v.R.length, l = v.C.length, g2 = k * l * (N - k) * (N - l);
  return {k, l, g2, t: 1 - Math.sqrt(g2) / (k * l), least: Math.sqrt(k * (N - l)) + Math.sqrt(l * (N - k))};
}

/** The exact cost at s, from Lean's formula with t = s². */
export function witnessExactAt(N: number, w: ExactWitness, s: number): number {
  const t = s * s, kl = w.k * w.l;
  return Math.sqrt(N * N - 2 * t * (kl - Math.sqrt(w.g2)) + t * t * kl);
}

/* Springs: gradient descent on a rank-2 bilinear layer X = U Vᵀ with weight decay, fitted on
   the kept cells only. Its points are x_i = u_i / a_i and y_j = v_j / b_j. */
export const SPRING_RATE = 0.08;
export const SPRING_DECAY = 0.04;

export interface Springs {
  readonly N: number;
  readonly mask: Mask;
  readonly a: number[];
  readonly b: number[];
  readonly K: Matrix;
  readonly U: Point[];
  readonly V: Point[];
  readonly step: number;
  /** The last positions of the 2N points, rows first. */
  readonly trails: Point[][];
  /** Relative error off the kept cells, the worst misfit on them, and the spring energy
      sum T_ij ‖x_i − y_j‖² for a plan T (null without one). */
  readonly off: number;
  readonly fit: number;
  readonly energy: number | null;
}

type SpringsBase = Omit<Springs, 'off' | 'fit' | 'energy'>;

function springPoints(sp: Pick<Springs, 'N' | 'a' | 'b' | 'U' | 'V'>): Point[] {
  const points: Point[] = [];
  for (let i = 0; i < sp.N; i++) points.push([sp.U[i][0] / sp.a[i], sp.U[i][1] / sp.a[i]]);
  for (let j = 0; j < sp.N; j++) points.push([sp.V[j][0] / sp.b[j], sp.V[j][1] / sp.b[j]]);
  return points;
}

export function springsMeasure(sp: SpringsBase, T: Matrix | null): Springs {
  const N = sp.N, points = springPoints(sp);
  let off = 0, offK = 0, fit = 0, energy = 0;
  for (let i = 0; i < N; i++)
    for (let j = 0; j < N; j++) {
      const x = sp.U[i][0] * sp.V[j][0] + sp.U[i][1] * sp.V[j][1];
      if (sp.mask[i][j]) fit = Math.max(fit, Math.abs(x - sp.K[i][j]));
      else {
        off += (x - sp.K[i][j]) ** 2;
        offK += sp.K[i][j] ** 2;
      }
      if (T && T[i][j] > 0) {
        const dx = points[i][0] - points[N + j][0], dy = points[i][1] - points[N + j][1];
        energy += T[i][j] * (dx * dx + dy * dy);
      }
    }
  return {...sp, off: offK ? Math.sqrt(off / offK) : 0, fit, energy: T ? energy : null};
}

/** A start of size `scale`: from a small start the points meet; from a large one they can wind
    once around the circle and stay there, a trap of the rank-2 layer, not of M. */
export function springsInit(
  N: number, mask: Mask, a: readonly number[], b: readonly number[], seed: number, scale: number, T: Matrix | null,
): Springs {
  const next = rng(seed), w = balanced(N, a, b);
  const gauss = (): number => Math.sqrt(-2 * Math.log(1 - next())) * Math.cos(2 * Math.PI * next());
  const U = Array.from({length: N}, (): Point => [scale * gauss(), scale * gauss()]);
  const V = Array.from({length: N}, (): Point => [scale * gauss(), scale * gauss()]);
  const K = w.a.map(x => w.b.map(y => x * y));
  const base = {N, mask, a: w.a, b: w.b, K, U, V, step: 0};
  return springsMeasure({...base, trails: springPoints(base).map(p => [p])}, T);
}

export function springsRun(sp: Springs, steps: number, T: Matrix | null): Springs {
  const N = sp.N, U = sp.U.map((u): Point => [u[0], u[1]]), V = sp.V.map((v): Point => [v[0], v[1]]);
  for (let k = 0; k < steps; k++) {
    const gU = U.map((u): Point => [SPRING_DECAY * u[0], SPRING_DECAY * u[1]]);
    const gV = V.map((v): Point => [SPRING_DECAY * v[0], SPRING_DECAY * v[1]]);
    for (let i = 0; i < N; i++)
      for (let j = 0; j < N; j++)
        if (sp.mask[i][j]) {
          const r = U[i][0] * V[j][0] + U[i][1] * V[j][1] - sp.K[i][j];
          gU[i][0] += r * V[j][0];
          gU[i][1] += r * V[j][1];
          gV[j][0] += r * U[i][0];
          gV[j][1] += r * U[i][1];
        }
    for (let i = 0; i < N; i++) {
      U[i][0] -= SPRING_RATE * gU[i][0];
      U[i][1] -= SPRING_RATE * gU[i][1];
    }
    for (let j = 0; j < N; j++) {
      V[j][0] -= SPRING_RATE * gV[j][0];
      V[j][1] -= SPRING_RATE * gV[j][1];
    }
  }
  const moved = {...sp, U, V, step: sp.step + steps};
  const points = springPoints(moved);
  const trails = sp.trails.map((trail, k) => trail.concat([points[k]]).slice(-48));
  return springsMeasure({...moved, trails}, T);
}
