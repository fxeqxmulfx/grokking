/** The recovery page in English. Source: review/flat_spectrum.md, Theorems D, E and F. */

import {box, eq, heuristic, lean, m, numbers, numerical, section, widget, S1} from '../markup.ts';
import type {RecoveryText} from './spec.ts';

const L = 'en';
const sub = (x: string, i: string): string => `${x}<sub>${i}</sub>`;
const ai = sub('a', 'i'), bj = sub('b', 'j'), ui = sub('u', 'i'), vj = sub('v', 'j'), xi = sub('x', 'i'), yj = sub('y', 'j');
const abT = 'a b<sup>T</sup>';

const body = [
  `<p class="lead">A table of rank one is the simplest table there is. Hide most of it and ask a machine to fill in the rest.
  This page finds which patterns of kept cells are enough: first by playing, then by naming what you saw, then by the proof.</p>`,

  section('holes', 1, 'A table with holes', `
  <p>Take the addition table of ${m('ℤ/p')} and draw each entry ${m('a + b')} as the arrow ${m('ψ(a + b) = e<sup>2πi(a+b)/p</sup>')}.
  The arrow turns one notch per step along a row or a column, and the whole table is a product, ${m('ψ(a + b) = ψ(a) ψ(b)')}:
  it has rank one.</p>
  <p>Now keep only the cells of a pattern ${m('Ω')}, the bright squares below, and let a machine <strong>M</strong> fill in the
  dark ones. Click cells to change ${m('Ω')}; M refills the table each time. A green arrow agrees with the table, a red one
  does not.</p>
  ${widget('lab', 'puzzle')}
  <p>Two diagonals: every arrow lands. One diagonal: the fill stays empty. Row 0 with column 0 determines a rank-one table,
  yet M gets it wrong. So the answer depends on the pattern, not only on how many cells it keeps.</p>
  ${widget('quiz', 'q1')}`),

  section('machine', 2, 'The machine', `
  <p><strong>M</strong> returns, among the matrices that agree with the table on ${m('Ω')}, one of least <em>nuclear norm</em>
  ${m(`‖X‖${S1}`)}, the sum of the singular values.</p>
  <p>The singular values of a matrix are the semi-axes of the ellipsoid onto which it maps the unit ball. A rank-one table
  flattens the ball onto a segment and has a single nonzero singular value; a table with many independent directions has
  many. So the nuclear norm counts the directions a table needs, weighted by their size.</p>
  <p>Why this machine? Write ${m('X = U V<sup>ᴴ</sup>')}, so that ${m(`${sub('X', 'ij')} = ⟨${ui}, ${vj}⟩`)} with one vector
  ${m(ui)} per row and one vector ${m(vj)} per column. That is a bilinear layer, and weight decay charges it
  ${m('½(‖U‖² + ‖V‖²)')}. The cheapest factorization of ${m('X')} costs exactly ${m(`‖X‖${S1}`)} ${lean('Lemma 1')}. So M is
  weight decay at its optimum. That training reaches this optimum is the one step here that is not a theorem
  ${heuristic('training ≈ M', L)}.</p>
  <p>A rank-one table ${m(`K = ${abT}`)} costs ${m(`‖K‖${S1} = ‖a‖ ‖b‖`)}. M <strong>recovers</strong> ${m('K')} from ${m('Ω')}
  when ${m('K')} is the only cheapest matrix that agrees with it on ${m('Ω')}. Two things can stop it.</p>`),

  section('rigid', 3, 'The cells must hold together', `
  <p>Draw a gold dot for each row, a blue dot for each column, and a line for each kept cell. Suppose the drawing falls apart
  into pieces. Flip the sign of one piece: of its rows and of its columns. A cell inside the piece is flipped twice and keeps
  its value; a cell between two pieces is flipped once. The flipped table agrees with ${m('Ω')} and costs the same, so M
  cannot tell it from the truth.</p>
  ${widget('lab', 'rigid')}
  <p>Call ${m('Ω')} <strong>rigid</strong> when the drawing is connected. Rigidity is necessary ${lean('D.7')} for entries of
  modulus one, and the same flip works for entries of any size ${lean('F.3')}. M recovers ${m('ψ(a + b)')} from the two
  diagonals of offsets ${m('s₁, s₂')} exactly when ${m('s₂ − s₁')} is a unit mod ${m('p')}, which is when they are rigid
  ${lean('D.8')}.</p>
  ${widget('quiz', 'q2')}`),

  section('partner', 4, 'Every row needs a partner', `
  <p>Rigid is not enough. The cross, row 0 and column 0, is connected, yet rows 1, 2, … all share the one column 0, and M
  answers with a cheaper matrix: the least norm is ${m('2√(N − 1)')}, below ${m('N')} for ${m('N ≥ 3')} ${lean('D.9')}.</p>
  ${box(`<strong>Theorem E</strong> ${lean('E')}. Let every entry have modulus one, ${m(`|${ai}| = |${bj}| = 1`)}. M recovers
  ${m(abT)} from ${m('Ω')} exactly when ${m('Ω')} is rigid and contains a <em>permutation</em>: one kept cell in each row,
  all in different columns.`)}
  <p>Why a permutation? Take ${m('J')}, the table of ones; every table with entries of modulus one behaves the same way.
  If ${m('Ω')} contains the cells ${m('(i, σ(i))')} of a permutation ${m('σ')}, take the cheapest factorization
  ${m('X = U V<sup>ᴴ</sup>')} again. Then ${m(`Σ<sub>i</sub> ‖${ui} − v<sub>σ(i)</sub>‖² = 2 (‖X‖${S1} − N)`)}, so no ${m('X')}
  beats ${m('N')}. At a minimum all these vectors coincide, and rigidity spreads the equality to every cell.</p>
  <p>When no permutation exists, Hall's theorem names the culprit: rows ${m('R')} that together see fewer than ${m('|R|')}
  columns. Then ${m('Ω')} misses the block ${m('R × C')}, where ${m('C')} holds the columns they do not see, and
  ${m('|R| + |C| > N')}. Lowering that block gives ${m('J − s² 1<sub>R</sub> 1<sub>C</sub><sup>T</sup>')}, which still agrees with
  ${m('Ω')} and costs at most ${m('N − ½ s² (|R| + |C| − N − |R| s²)')}, less than ${m('N')} for small ${m('s > 0')}. Slide
  ${m('s')} below and watch the cost drop under the table's.</p>
  ${widget('lab', 'hall')}
  ${widget('quiz', 'q3')}`),

  section('weights', 5, 'Weights: sand and holes', `
  <p>Now let the entries have sizes: ${m(`K = ${abT}`)} with no zero entry. Give row ${m('i')} a pile of sand
  ${m(`α<sub>i</sub> = |${ai}|²/‖a‖²`)} and column ${m('j')} a hole ${m(`β<sub>j</sub> = |${bj}|²/‖b‖²`)}. Sand moves only through
  kept cells. A <strong>transport plan</strong> moves all the sand and fills every hole exactly.</p>
  ${box(`<strong>Theorem F</strong>. Let ${m(`K = ${abT}`)} have no zero entry. M recovers ${m('K')} exactly when ${m('Ω')}
  is rigid and carries a plan ${lean('F')}. If ${m('Ω')} is rigid and carries a plan, M recovers ${m('K')}
  ${lean('F.1–F.2')}. If ${m('Ω')} is not rigid, or some rows ${m('R')} hold more sand than the columns ${m('N(R)')} they
  see can take, it does not ${lean('F.3')}.`)}
  <p>The obstacles are the ones you met: the flip of a piece, and the cheaper
  ${m(`${abT} − s² a<sub>R</sub> b<sub>C</sub><sup>T</sup>`)}. A plan exists exactly when every set of rows fits into the
  columns it sees, ${m('Σ<sub>i∈R</sub> α<sub>i</sub> ≤ Σ<sub>j∈N(R)</sub> β<sub>j</sub>')} ${lean('Gale 1957')}. With
  equal weights, a permutation inside ${m('Ω')} divided by ${m('N')} is a plan, Gale's condition becomes Hall's
  ${m('|R| ≤ |N(R)|')}, and Theorem F becomes Theorem E.</p>
  <p>Drag the gold and blue bars to change the weights. The cross, hopeless with equal weights, works once its row and its
  column are heavy enough: exactly when ${m('α<sub>i₀</sub> + β<sub>j₀</sub> ≥ 1')} ${lean('F.4')}.</p>
  ${widget('lab', 'weights')}
  ${widget('quiz', 'q4')}`),

  section('springs', 6, 'Why a plan forces the answer: springs', `
  <p>Scale the table so that ${m('‖a‖ = ‖b‖ = 1')}; this changes nothing about recovery. Take the cheapest factorization
  ${m('X = U V<sup>ᴴ</sup>')} of a matrix that agrees with ${m('Ω')}, divide each row vector by its weight,
  ${m(`${xi} = ${ui}/${ai}`)}, and each column vector likewise, ${m(`${yj} = ${vj}/<span class="ov">b</span><sub>j</sub>`)}. On a
  kept cell ${m(`⟨${xi}, ${yj}⟩ = 1`)}. Hang a spring of stiffness ${m(sub('T', 'ij'))} between ${m(xi)} and ${m(yj)}, where
  ${m('T')} is a plan. Expanding the squares,</p>
  ${eq(`Σ<sub>ij</sub> T<sub>ij</sub> ‖${xi} − ${yj}‖² = ‖U‖² + ‖V‖² − 2 = 2 (‖X‖${S1} − ‖a‖ ‖b‖).`)}
  <p>The left side is at least zero, so nothing beats ${m(abT)}. At a cheapest ${m('X')} every loaded spring is slack. Every
  row and every column carries sand, so every point has length one; two unit vectors with ${m('⟨x, y⟩ = 1')} are equal, so
  ${m(`${xi} = ${yj}`)} on every kept cell. Connectivity glues all the points into one, and that says ${m(`X = ${abT}`)}
  ${lean('F.2')}.</p>
  <p>Below, a bilinear layer with two-dimensional vectors trains by gradient descent with weight decay on the kept cells.
  Gold dots are the ${m(xi)}, blue dots the ${m(yj)}, and the circle is the unit circle.</p>
  ${widget('springs')}`),

  section('numbers', 7, 'The numbers', `
  <p>Every pattern of a ${m('3 × 3')} table but the full one, solved by batched ADMM in torch
  ${numerical('2026-10-28', L)}. The gap is ${m(`‖X‖${S1} − ‖a‖ ‖b‖`)}; the error is the size of ${m('X − K')} off ${m('Ω')}.</p>
  ${numbers(['Equal weights (J)', 'patterns', 'gap', 'error', 'theorem'], [
    ['rigid, permutation', '195', 'within 4·10<sup>−15</sup> of 0', '≤ 4.7·10<sup>−14</sup>', 'E.2'],
    ['rigid, no permutation', '9', '−0.172', '0.5', 'E.3'],
    ['not rigid, permutation', '51', 'within 9·10<sup>−16</sup> of 0', '0.89–1.00', 'E.1, D.7'],
    ['not rigid, no permutation', '256', '−3.00 to −0.172', '0.78–1.00', 'E.3'],
  ])}
  ${numbers(['Random weights, 3 draws', 'patterns', 'gap', 'error', 'theorem'], [
    ['rigid, plan', '90', 'within 7·10<sup>−15</sup> of 0', '≤ 1.8·10<sup>−15</sup>', 'F.2'],
    ['rigid, no plan', '114', '−1.63 to −3·10<sup>−6</sup>', '1.7·10<sup>−3</sup> to 0.88', 'F.3'],
    ['not rigid, no plan', '306', '−6.16 to −3·10<sup>−6</sup>', '0.44 to 1.00', 'F.3'],
  ])}
  <p class="sub">The nine rigid patterns without a permutation are the crosses, and −0.172 = 2√2 − 3. Random weights never give
  a plan without rigidity. At weights where some set of rows fits with no room to spare, rigid patterns with a plan converge
  slowly (error 2.4·10<sup>−4</sup>, 5.0·10<sup>−5</sup>, 1.0·10<sup>−5</sup> after 6000, 30000 and 150000 steps), like the
  cross on the edge in section 5.</p>`),

  section('status', 8, 'What is proved, what is left', `
  <p>Every claim of this page, sorted by how it is known. Click a card for its Lean names.</p>
  ${widget('status')}
  <p class="sub">Source: <code>review/flat_spectrum.md</code> in the transformer repository, the section “Exact recovery of a
  rank-one kernel”, Theorems D, E and F. Lean: <code>Transformer.Grokking.FlatSpectrum</code>. The solvers on this page run in
  your browser: ADMM for M, gradient descent for the springs.</p>`),
].join('\n');

export const en: RecoveryText = {
  title: 'Which cells pin down a table?',
  nav: 'Recovery',
  summary: 'Fill a rank-one table from some of its cells: when the least nuclear norm finds it, and why it sometimes cannot.',
  body,
  quizzes: {
    q1: {
      question: `${m('p = 8')}, and ${m('Ω')} is the two diagonals ${m('b = a')} and ${m('b = a + 2')}. Does M recover ${m('ψ(a + b)')}?`,
      options: ['Yes: two diagonals always suffice.', 'No: 2 is not a unit mod 8.', 'Only if the diagonals are next to each other.'],
      hint: 'Pick p = 8 and the pattern “Offsets 0 and 2” above. Which cells can steps of 2 reach from cell (0, 0)?',
      why: 'Steps of 2 never leave the even cells or the odd ones, so the pattern falls into two pieces, and the flip of one piece agrees with Ω. Two diagonals recover ψ(a + b) exactly when s₂ − s₁ is a unit (D.8, Lean).',
    },
    q2: {
      question: `One row of ${m('Ω')} has no kept cell. Can M recover the table?`,
      options: ['Yes, if every other row is full.', 'No, never.'],
      hint: 'Draw the row as a dot. What is it joined to?',
      why: 'The empty row is a piece on its own; flipping it reverses that whole row and agrees with Ω at the same cost (D.7, Lean).',
    },
    q3: {
      question: `${m('N = 4')}, and ${m('Ω')} is row 0 with column 0. Is ${m('Ω')} rigid, and does M recover ${m('J')}?`,
      options: ['Rigid, and M recovers J.', 'Rigid, but M does not recover J.', 'Not rigid.'],
      hint: 'Every cell touches row 0 or column 0. Now look for a permutation: which column can row 1 use, and row 2?',
      why: 'Rows 1, 2 and 3 share the one column 0, so no permutation fits. The least norm is 2√3 ≈ 3.46 < 4 (D.9, E.3, Lean).',
    },
    q4: {
      question: `${m('N = 3')}, ${m('Ω')} is the cross of row 0 and column 1, the sand is ${m('α = (3/5, 1/5, 1/5)')} and the holes are ${m('β = (1/5, 2/5, 2/5)')}. Does M recover the table?`,
      options: ['Yes.', 'No: the cross never works for N ≥ 3.'],
      hint: 'Rows 1 and 2 can send sand only to column 1. How much do they hold, and how big is that hole?',
      why: 'Rows 1 and 2 hold 2/5 and the hole of column 1 is 2/5, so a plan exists: α₀ + β₁ = 1 is just enough. The cross is rigid, so F.2 (Lean) applies. It is the pattern “Cross, on the edge”, where M converges slowly.',
    },
  },
  status: {
    lemma1: {title: `Lemma 1: ‖X‖${S1} = least ½(‖U‖² + ‖V‖²)`, detail: 'The nuclear norm is the least weight-decay cost of a factorization X = UVᴴ, over every inner dimension.'},
    d7: {title: 'D.7: not rigid ⇒ a flip', detail: 'If the kept cells fall into pieces, flipping one piece gives a second table with entries of modulus one that agrees on Ω.'},
    d8: {title: 'D.8: two diagonals ⇔ s₂ − s₁ a unit', detail: 'M recovers ψ(a + b) from exactly the diagonals of offsets s₁ and s₂ if and only if s₂ − s₁ is a unit of ℤ/p.'},
    d9: {title: 'D.9: the cross fails for N ≥ 3', detail: 'The cross is rigid and fixes every rank-one completion, yet its least nuclear norm is 2√(N − 1) < N.'},
    e: {title: 'Theorem E: rigid and a permutation', detail: `For entries of modulus one: a permutation in Ω gives ‖X‖${S1} ≥ N (E.1); with rigidity M recovers the table (E.2); without a permutation a cheaper witness exists (E.3); together, an equivalence (E.4).`},
    f12: {title: 'F.1–F.2: a plan ⇒ recovered', detail: `A transport plan from α to β on Ω gives ‖X‖${S1} ≥ ‖a‖ ‖b‖; with rigidity M recovers a bᵀ. On main since commit 7f7423c9.`},
    f3a: {title: 'F.3: not rigid ⇒ a flip, any sizes', detail: `The phases u_i v_j = 1 on Ω, with u_i₀ v_j₀ = −1, give a second table with the same moduli. Since ‖a bᵀ‖${S1} = ‖a‖ ‖b‖, it costs the same. On main since commit b6577f53.`},
    f3b: {title: 'F.3: overfull rows ⇒ a cheaper witness', detail: 'If rows R hold more sand than their columns N(R) take, Ω misses R × N(R)ᶜ, and U = p diag(a) U₀, V = p⁻¹ diag(b̄) V₀ from E.3, with p² = ‖b‖/‖a‖, cost less than ‖a‖ ‖b‖. On main since commit b6577f53.'},
    cross: {title: 'F.4: the cross: recovered ⇔ α<sub>i₀</sub> + β<sub>j₀</sub> ≥ 1', detail: 'One way: an explicit plan on the cross and F.2. The other: the witness of F.3 on the block off row i₀ and column j₀. No Gale needed. On main since commit b6577f53.'},
    gale: {title: 'Gale: a plan ⇔ Σ<sub>R</sub> α ≤ Σ<sub>N(R)</sub> β', detail: 'The supply–demand theorem (Gale, 1957), for any nonnegative masses with equal totals. Induction on the cells: ship sand along one cell until its row or column is empty, or until a set of rows R becomes tight, then split there. On main since commit ab75b4fa.'},
    fiff: {title: 'Theorem F as an equivalence', detail: 'M recovers a bᵀ ⇔ Ω is rigid and carries a plan ⇔ Ω is rigid and ‖b‖² Σ_R |a_i|² ≤ ‖a‖² Σ_N(R) |b_j|² for every set R. Example: the triangle {(0, 0), (0, 1), (1, 1)} recovers (2, 1)(1, 2)ᵀ but not (1, 2)(2, 1)ᵀ. On main since commit ab75b4fa.'},
    n3: {title: 'Every 3 × 3 pattern', detail: 'All 511 patterns but the full one with equal weights, and the 510 nonempty ones with random weights, solved by batched ADMM: each class behaves as the theorems say (section 7).'},
    n4: {title: 'Every 4 × 4 pattern', detail: 'Running: 65 535 patterns. Done so far: the 3970 patterns that are not rigid but contain a permutation reach the gap 0 within 2·10<sup>−14</sup>, with error at least 0.77.'},
    train: {title: 'Training behaves like M', detail: 'The modeling step of Lemma 1: weight decay at its optimum. Not a theorem.'},
  },
};
