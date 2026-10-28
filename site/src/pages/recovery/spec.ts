/**
 * What the three languages of the recovery page share: the quiz answers, the kind of every
 * claim and its Lean names. A language supplies the words; a missing key does not compile.
 */

import type {Quiz} from '../../widgets/quiz.ts';
import type {StatusKind} from '../../widgets/status.ts';

/** The index of the right option of each quiz, the same in every language. */
export const QUIZ_ANSWERS = {q1: 1, q2: 1, q3: 1, q4: 0} as const;
export type QuizId = keyof typeof QUIZ_ANSWERS;
export type QuizText = Omit<Quiz, 'answer'>;

export interface StatusBase {
  readonly kind: StatusKind;
  /** Declarations of `Transformer.Grokking.FlatSpectrum` in the transformer repository. */
  readonly lean?: string;
}

export const STATUS_BASE = {
  lemma1: {kind: 'lean', lean: 'nuclearNorm_isLeast, nuclearNorm_le_of_eq_mul'},
  d7: {kind: 'lean', lean: 'exists_vecMulVec_ne_of_not_rigid, not_forall_isMinOn_iff_of_not_rigid'},
  d8: {kind: 'lean', lean: 'forall_isMinOn_addKernel_iff_isUnit'},
  d9: {kind: 'lean', lean: 'rigid_cross, isLeast_nuclearNorm_vecMulVec_cross, vecMulVec_cross_determined_not_isMinOn'},
  e: {kind: 'lean', lean: 'card_le_nuclearNorm_of_perm, isMinOn_vecMulVec_iff_of_perm, exists_nuclearNorm_lt_of_not_perm, not_isMinOn_onesMatrix_of_not_perm, forall_isMinOn_vecMulVec_iff, forall_isMinOn_addKernel_iff'},
  f12: {kind: 'lean', lean: 'sum_norm_sq_le_nuclearNorm_of_transport, isMinOn_vecMulVec_iff_of_transport'},
  f3a: {kind: 'hand'},
  f3b: {kind: 'hand'},
  cross: {kind: 'todo'},
  gale: {kind: 'todo'},
  fiff: {kind: 'todo'},
  n3: {kind: 'numerical'},
  n4: {kind: 'running'},
  train: {kind: 'heuristic'},
} as const satisfies Readonly<Record<string, StatusBase>>;

export type StatusKey = keyof typeof STATUS_BASE;

export interface StatusText {
  readonly title: string;
  readonly detail: string;
}

export interface RecoveryText {
  readonly title: string;
  readonly nav: string;
  readonly summary: string;
  readonly body: string;
  readonly quizzes: Readonly<Record<QuizId, QuizText>>;
  readonly status: Readonly<Record<StatusKey, StatusText>>;
}
