/**
 * What the three languages of the home page share: the shape of its text, the Lean names of its
 * claims and the legend of the tags. The Lean names are declarations of the transformer
 * repository (see its `INDEX.md`), in `Transformer.Grokking.FlatSpectrum`.
 */

/** A titled piece of the page: a theorem or a conclusion. */
export interface Item {
  readonly title: string;
  /** HTML. */
  readonly body: string;
}

/** The Lean declarations behind the terms: weight decay at its optimum is M. */
export const TERMS_LEAN = 'IsOptimalFit, setOf_isOptimalFit_eq, forall_isMinOn_iff_iff_isOptimalFit';

/** The two theorems, in the order of the page, and their Lean declarations. */
export const THEOREM_LEAN = {
  flat: 'not_exists_isOptimalFit_of_singularValues_eq, not_isMinOn_of_singularValues_eq, singularValues_cubicKernel',
  rankOne: 'isOptimalFit_vecMulVec_iff_connected, forall_isMinOn_vecMulVec_iff_connected_of_entries',
} as const;
export type TheoremId = keyof typeof THEOREM_LEAN;

/** The conclusions, in the order of the page, and their Lean declarations; `null` when measured. */
export const CONCLUSION_LEAN = {
  fewest: 'forall_isMinOn_vecMulVec_staircase, two_mul_card_le_ncard_add_one_of_forall_isMinOn',
  product: 'forall_isMinOn_taskKernel_mul_mulChar_iff_connected, forall_isMinOn_taskKernel_mul_mulChar_productCells, two_mul_sub_three_le_ncard_of_forall_isMinOn, exists_injective_mulChar, eq_of_taskKernel_eq',
  readout: 'singularValues_taskKernel_mul, not_isMinOn_taskKernel_mul',
  hidden: 'isMinOn_flat_fill_iff, isMinOn_decode_cubic_fill_iff, not_isMinOn_decode_cubic_fill, isMinOn_decode_add_fill_iff',
  data: null,
  network: null,
} as const satisfies Readonly<Record<string, string | null>>;
export type ConclusionId = keyof typeof CONCLUSION_LEAN;

/** The Lean declarations behind the four boxed theorems of the full statement and its other Lean claims. */
export const FULL_LEAN = {
  g: 'forall_isMinOn_vecMulVec_iff_support, rigid_support_iff_connected, exists_isTransportPlan_iff',
  a: 'isMinOn_nuclearNorm_iff',
  c: 'sum_norm_sq_sum_poly_add_mul_le_sub_one, sum_norm_sq_sum_affine_add_mul_eq, sum_norm_sq_sum_poly_add_mul_le, exists_sum_norm_sq_eq_iff_natDegree_le_one, norm_sq_sum_poly_add_mul_div_le',
  b: 'sum_star_stdAddChar_mul, norm_gaussSum_mulShift, meanSq_condMean_cube_add_mul_le, norm_mean_star_mul_cube_add_mul_le, meanSq_condMean_poly_add_mul_stdAddChar_le',
  diagonals: 'isMinOn_addKernel_iff_of_ne, exists_ne_isMinOn_addKernel_of_diagonal',
  cross: 'rigid_cross, vecMulVec_eq_of_cross, isLeast_nuclearNorm_addKernel_cross',
  characters: 'forall_isMinOn_taskKernel_mul_mulChar_iff_connected, forall_isMinOn_taskKernel_add_mul_mulChar_iff_connected',
  weil: 'norm_sum_addChar_eval_le, norm_le_sqrt_of_mem_roots',
  oneHot: 'eq_zero_of_isMinOn_classKernel_cube_add_mul',
  real: 'det_cosKernel, det_sinKernel',
} as const;

export interface HomeText {
  readonly nav: string;
  readonly title: string;
  readonly kicker: string;
  /** The thesis in one sentence. */
  readonly statement: string;
  /** HTML: every term of the statement, made exact. */
  readonly terms: string;
  readonly theoremsTitle: string;
  readonly theorems: Readonly<Record<TheoremId, Item>>;
  readonly conclusionsTitle: string;
  readonly conclusions: Readonly<Record<ConclusionId, Item>>;
  /** The heading of the detailed statement. */
  readonly fullTitle: string;
  /** HTML: the detailed statement, as `<section id>`s with `<h3>` headings. */
  readonly full: string;
  readonly audienceTitle: string;
  readonly audience: string;
  readonly legend: string;
  readonly pagesTitle: string;
  readonly writing: string;
}

/** `x` with the subscript `i`. */
export const sub = (x: string, i: string): string => `${x}<sub>${i}</sub>`;

/** The fractional part, set as an operator. */
export const frac = '<span class="op">frac</span>';

/** The letters of Theorem G and Theorem C, the same in every language. */
export const ri = sub('r', 'i'), sj = sub('s', 'j'), ui = sub('u', 'i'), vj = sub('v', 'j'), Kr = sub('K', 'ρ');

/** The square root in Theorem C's bound, for `m = deg P`. */
export const root = '√((m − 1)(2p − 1))';

/** The marks of the tags, in the order of every legend. */
const MARKS = [['good', '✓'], ['tight', '~'], ['run', '≈'], ['open', '○'], ['open', '·']] as const;

/** The five tags, each a pair of its word and its meaning. */
export function legendOf(entries: readonly (readonly [string, string])[]): string {
  return entries.map(([word, meaning], k) => {
    const [kind, mark] = MARKS[k] ?? MARKS[3];
    return `<span class="tag"><span class="icon ${kind}" aria-hidden="true">${mark}</span>${word}</span> ${meaning}`;
  }).join(', ') + '.';
}
