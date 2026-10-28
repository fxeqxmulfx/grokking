/** The recovery page in English. Source: review/flat_spectrum.md, Theorems D, E, F and G and the failure margin. */

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
  ${m('k + l > N')} for ${m('k = |R|')} and ${m('l = |C|')}. Lowering that block gives
  ${m('X(s) = J − s² 1<sub>R</sub> 1<sub>C</sub><sup>T</sup>')}, which still agrees with ${m('Ω')}. Its factors from E.3 cost
  at most ${m('N − ½ s² (k + l − N − k s²)')}, less than ${m('N')} for small ${m('s > 0')} ${lean('E.3')}. Lean also computes
  the cost exactly: with ${m('g = √(k l (N − k)(N − l))')},</p>
  ${eq(`<span class="nobr">‖X(s)‖²${S1} = N² − 2s² (k l − g)</span> <span class="nobr">+ s⁴ k l,</span>`)}
  <p>least at ${m('s² = 1 − g/(k l)')}, where ${m(`‖X(s)‖${S1} = √(k (N − l)) + √(l (N − k))`)}. For any block ${m('R × C')},
  some real ${m('t')} gives ${m(`‖J − t 1<sub>R</sub> 1<sub>C</sub><sup>T</sup>‖${S1} < N`)} exactly when ${m('k + l > N')}
  ${lean('E.3, exact')}. For the cross, ${m('k = l = N − 1')}, the least is the ${m('2√(N − 1)')} of D.9. Slide ${m('s')}
  below: the dark curve is the cost, the grey one the bound from the factors, and the lower line Lean's least value.</p>
  ${widget('lab', 'hall')}
  <p>How much cheaper can the answer be? The lower line above is the least cost of every matrix that agrees with ${m('J')}
  off ${m('R × C')}, not only of the lowered blocks ${lean('failure margin')}: the matrix equal to ${m('1/√(k (N − l))')} on
  ${m('R × Cᶜ')}, to ${m('1/√(l (N − k))')} on ${m('Rᶜ × C')} and zero elsewhere is a contraction, its inner product with
  any matrix equal to 1 on these two strips is ${m('√(k (N − l)) + √(l (N − k))')}, and an inner product with a contraction
  never exceeds the nuclear norm. Hall's rows can be taken with ${m('k + l = N + 1')}, and then Cauchy–Schwarz bounds this
  cost by ${m('√(N² − 1)')}. With ${m('k + l')} fixed, it grows with ${m('k l')}, which is largest when ${m('k')} and
  ${m('l')} differ by at most one. Multiplying rows and columns by numbers of modulus one changes no cost.</p>
  ${box(`<strong>The failure margin</strong> ${lean('failure margin')}. Let ${m('Ω')} contain no permutation, and let
  ${m('K')} be ${m('J')} or any other table of rank one with entries of modulus one, so that ${m(`‖K‖${S1} = N`)}. Then
  some matrix that agrees with ${m('K')} on ${m('Ω')} costs at most ${m('√(N² − 1) < N − 1/(2N)')}. For ${m('N ≥ 1')}, let
  ${m('k + l = N + 1')} with ${m('k ≤ l ≤ k + 1')}. Every such ${m('Ω')} has one that costs at most
  ${m('√(k (k − 1)) + √(l (l − 1))')}, and for some such ${m('Ω')} that is the least cost: ${m('√(N² − 1)')} for odd
  ${m('N')}, ${m('√2 + √6 ≈ 3.864')} for ${m('N = 4')}.`)}
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
  ${widget('quiz', 'q4')}
  <p>A weight may also be zero. A row or a column of zeros needs no cell, and the cells must hold together only where the
  weights are not zero.</p>
  ${box(`<strong>Theorem G</strong>. Let ${m('a ≠ 0')} and ${m('b ≠ 0')}, zero entries allowed. M recovers ${m(abT)}
  exactly when the cells of ${m('Ω')} with ${m(`${ai} ≠ 0`)} and ${m(`${bj} ≠ 0`)} connect these rows to these columns, and
  ${m('Σ<sub>i∈R</sub> α<sub>i</sub> ≤ Σ<sub>j∈N(R)</sub> β<sub>j</sub>')} for every set of rows ${m('R')} ${lean('G')}.`)}
  <p>So from its entry 1 alone, M completes the row ${m('(1, ?)')} to ${m('(1, 0)')}, never to ${m('(1, 1)')}.</p>`),

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
  <p>Every pattern of a ${m('3 × 3')} table but the full one, and with random weights every nonempty one, solved by batched
  ADMM in torch ${numerical('2026-10-28', L)}. The gap is ${m(`‖X‖${S1} − ‖a‖ ‖b‖`)}; the error is ${m('‖X − K‖ / ‖K‖')},
  both norms taken off ${m('Ω')}. Random weights have ${m(`|${ai}|`)} and ${m(`|${bj}|`)} uniform in ${m('[0.3, 2]')} and
  random phases.</p>
  ${numbers(['Equal weights (J), 3 × 3', 'patterns', 'gap', 'error', 'theorem'], [
    ['rigid, permutation', '195', 'within 5·10<sup>−15</sup> of 0', '≤ 4.8·10<sup>−14</sup>', 'E.2'],
    ['rigid, no permutation', '9', '−0.172', '0.5', 'E.3'],
    ['not rigid, permutation', '51', 'within 9·10<sup>−16</sup> of 0', '0.89–1.00', 'E.1, D.7'],
    ['not rigid, no permutation', '256', '−3.00 to −0.172', '0.77–1.00', 'E.3'],
  ])}
  ${numbers(['Random weights, 3 × 3, 3 draws', 'patterns per draw', 'gap', 'error', 'theorem'], [
    ['rigid, plan', '90', 'within 7·10<sup>−15</sup> of 0', '≤ 1.8·10<sup>−15</sup>', 'F.2'],
    ['rigid, no plan', '114', '−1.63 to −3·10<sup>−6</sup>', '1.7·10<sup>−3</sup> to 0.88', 'F.3'],
    ['not rigid, no plan', '306', '−6.16 to −3·10<sup>−6</sup>', '0.44 to 1.00', 'F.3'],
  ])}
  <p class="sub">The nine rigid patterns without a permutation are the crosses, and −0.172 = 2√2 − 3, the proved worst case of section 4 for N = 3. In the three draws no
  pattern carries a plan without being rigid. With moduli ${m('(√2, 1, 1)')} for both ${m('a')} and ${m('b')}, so that
  ${m('α = β = (½, ¼, ¼)')} and a proper set of rows can fill the columns it sees exactly, the rigid patterns with a plan
  converge slowly: their largest error is 2.4·10<sup>−4</sup>, 5.0·10<sup>−5</sup> and 1.0·10<sup>−5</sup> after 6000,
  30 000 and 150 000 steps.</p>
  <p>Every pattern of a ${m('4 × 4')} table but the full one, equal weights, 20 000 steps ${numerical('2026-10-28', L)}.</p>
  ${numbers(['Equal weights (J), 4 × 4', 'patterns', 'gap', 'error', 'theorem'], [
    ['rigid, permutation', '33 852', 'within 7·10<sup>−7</sup> of 0', '≤ 8.5·10<sup>−5</sup>', 'E.2'],
    ['rigid, no permutation', '2464', '−0.536 to −0.136', '0.345–0.667', 'E.3'],
    ['not rigid, permutation', '3970', 'within 2·10<sup>−14</sup> of 0', '0.775–1.00', 'E.1, D.7'],
    ['not rigid, no permutation', '25 249', '−4.00 to −0.136', '0.632–1.00', 'E.3'],
  ])}
  <p class="sub">The ends −0.536 and −0.136 of the second row are, to three decimals, 2√3 − 4, the cross of D.9, and √2 + √6 − 4, the proved worst case for N = 4, which the last row reaches too. Theorem E proves that M recovers J from every rigid pattern with a permutation, so the error up to 8.5·10<sup>−5</sup> in the first row is ADMM’s slowness. It comes from the 27 068 of these patterns in which a proper set of rows sees exactly as many columns as it has rows; on the other 6784 the error is below 10<sup>−13</sup>, a rounding error. After 20 000 steps, 4464 of the 27 068 still have an error above 10<sup>−6</sup>. Run on, they keep converging: their error stays below 3.5·10<sup>−5</sup>, 1.8·10<sup>−5</sup>, 8.9·10<sup>−6</sup> and 4.5·10<sup>−6</sup> after 50 000, 100 000, 200 000 and 400 000 steps, about half as large each time the steps double, and at the end their gap is positive and below 7.9·10<sup>−9</sup> ${numerical('2026-10-29', L)}.</p>
  <p>The failure margin on ${m('N × N')} tables of ones, ${m('N')} from 3 to 7, 20 000 steps ${numerical('2026-10-29', L)}.
  Off every block of ${m('k')} rows and ${m('l')} columns with ${m('k + l > N')}, ADMM meets the least cost
  ${m('√(k (N − l)) + √(l (N − k))')} to within 5·10<sup>−15</sup>, a rounding error. Then 2000 random patterns of each size
  without a permutation, each keeping every cell with its own probability, drawn uniformly from ${m('[0.3, 0.9]')}:</p>
  ${numbers(['Failure margin', 'rigid / not rigid', 'largest gap, rigid', 'largest gap, not rigid', 'proved worst case'], [
    ['3 × 3', '65 / 1935', '−0.172', '−0.172', '√8 − 3 = −0.172'],
    ['4 × 4', '117 / 1883', '−0.136', '−0.136', '√2 + √6 − 4 = −0.136'],
    ['5 × 5', '178 / 1822', '−0.101', '−0.101', '√24 − 5 = −0.101'],
    ['6 × 6', '242 / 1758', '−0.0864', '−0.0864', '√6 + √12 − 6 = −0.0864'],
    ['7 × 7', '268 / 1732', '−0.0718', '−0.0784', '√48 − 7 = −0.0718'],
  ])}
  <p class="sub">The largest gaps agree with the proved worst case to six decimals, in both classes for ${m('N')} from 3 to 6
  and in the rigid one for ${m('N = 7')}; there the patterns that are not rigid reach only the ${m('3 × 5')} block,
  √6 + √20 − 7 = −0.0784. ADMM never ends more than 7.7·10<sup>−7</sup> above the cost of the cheapest block a pattern
  misses.</p>
  <p>Tables with zero entries: every pattern but the full one of 13 tables of sizes ${m('2 × 3')}, ${m('3 × 2')},
  ${m('3 × 3')}, ${m('2 × 4')} and ${m('3 × 4')}, all but one with zeros at fixed places, random phases, 30 000 steps
  ${numerical('2026-10-28', L)}. Rigid means here that the cells with ${m(`${ai} ≠ 0`)} and ${m(`${bj} ≠ 0`)} connect these
  rows to these columns; the condition is that of Theorem G. Since ${m('K')} may vanish off ${m('Ω')}, the error here is
  ${m('‖X − K‖')} off ${m('Ω')} over ${m('‖K‖')}.</p>
  ${numbers(['Zero entries', 'patterns', 'gap', 'error', 'theorem'], [
    ['rigid, condition', '2010', 'within 4·10<sup>−15</sup> of 0', '≤ 7.1·10<sup>−16</sup>', 'G'],
    ['not rigid, condition', '224', 'within 2·10<sup>−15</sup> of 0', '0.57–0.71', 'G'],
    ['rigid, no condition', '1582', '−2.86 to −3.5·10<sup>−4</sup>', '0.017–0.90', 'G'],
    ['not rigid, no condition', '8395', '−5.11 to −3.5·10<sup>−4</sup>', '0.15–1.00', 'G'],
  ])}
  <p class="sub">Nine tables draw the moduli uniformly from ${m('[0.3, 2]')}; four fix them: ${m('|a| = (1, 1, 0)')} with
  ${m('|b| = (1, 1, 0)')} or ${m('(1, 1, 1)')}, ${m('|a| = (2, 1, 0)')} with ${m('|b| = (1, 1, √3, 0)')}, and
  ${m('|a| = (1, √2, 0)')} with ${m('|b| = (1, 0, √2)')}. Only these four give patterns that meet the condition without
  rigidity; on them ADMM finds a second matrix of nuclear norm ${m('‖a‖ ‖b‖')} that agrees with ${m(abT)} on ${m('Ω')}.</p>`),

  section('status', 8, 'What is proved, what is left', `
  <p>Every claim of this page, sorted by how it is known. Click a card for its Lean names.</p>
  ${widget('status')}
  <p class="sub">Source: <code>review/flat_spectrum.md</code> in the transformer repository, the section “Exact recovery of a
  rank-one kernel”, Theorems D, E, F and G and the failure margin. Lean: <code>Transformer.Grokking.FlatSpectrum</code>. The solvers on this page run in
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
    lemma1: {title: `Lemma 1: ‖X‖${S1} = least ½(‖U‖² + ‖V‖²)`, detail: 'The nuclear norm is the least weight-decay cost of a factorization X = UVᴴ, over every inner dimension. So the products of the cheapest factorizations that agree with Ω are exactly the solutions of M, and weight decay at its optimum recovers K exactly when M does. On main since commit 1aed20a5.'},
    d7: {title: 'D.7: not rigid ⇒ a flip', detail: 'If the kept cells fall into pieces, flipping one piece gives a second table with entries of modulus one that agrees on Ω.'},
    d8: {title: 'D.8: two diagonals ⇔ s₂ − s₁ a unit', detail: 'M recovers ψ(a + b) from exactly the diagonals of offsets s₁ and s₂ if and only if s₂ − s₁ is a unit of ℤ/p.'},
    d9: {title: 'D.9: the cross fails for N ≥ 3', detail: 'The cross is rigid and fixes every rank-one completion, yet its least nuclear norm is 2√(N − 1) < N.'},
    e: {title: 'Theorem E: rigid and a permutation', detail: `For entries of modulus one: a permutation in Ω gives ‖X‖${S1} ≥ N (E.1); with rigidity M recovers the table (E.2); without a permutation a cheaper witness exists (E.3); together, an equivalence (E.4).`},
    e3w: {title: 'E.3, exact: the cost of the lowered block', detail: `For k = |R|, l = |C| and g = √(k l (N − k)(N − l)): the factors of J − s² 1_R 1_Cᵀ cost at most N − ½ s² (k + l − N − k s²); its nuclear norm is exactly √(N² − 2s² (k l − g) + s⁴ k l), least at s² = 1 − g/(k l), where it is √(k (N − l)) + √(l (N − k)); some real t gives ‖J − t 1_R 1_Cᵀ‖${S1} < N exactly when k + l > N. Lean proves the exact norm for every m × n block and every real t. For the cross the least is 2√(N − 1). On main since commits 4943eec7 and a9e36f03.`},
    margin: {title: 'The failure margin: below N − 1/(2N)', detail: 'Every matrix equal to J off a block of k rows and l columns with k + l > N costs at least √(k (N − l)) + √(l (N − k)): a contraction, constant on each of the two strips beside the block and zero elsewhere, certifies it, and the lowered block reaches it. Without a permutation, Hall’s block has k + l = N + 1, and Cauchy–Schwarz bounds its cost by √(N² − 1) < N − 1/(2N). For N ≥ 1 and k + l = N + 1 with k ≤ l ≤ k + 1, the largest least cost without a permutation is √(k (k − 1)) + √(l (l − 1)): √(N² − 1) for odd N, √2 + √6 for N = 4. Rescaling carries both bounds to every rank-one table with entries of modulus one. On main since commits f192a4aa, da5f79ce and 58f6f140.'},
    f12: {title: 'F.1–F.2: a plan ⇒ recovered', detail: `A transport plan from α to β on Ω gives ‖X‖${S1} ≥ ‖a‖ ‖b‖; with rigidity M recovers a bᵀ. On main since commit 7f7423c9.`},
    f3a: {title: 'F.3: not rigid ⇒ a flip, any sizes', detail: `The phases u_i v_j = 1 on Ω, with u_i₀ v_j₀ = −1, give a second table with the same moduli. Since ‖a bᵀ‖${S1} = ‖a‖ ‖b‖, it costs the same. On main since commit b6577f53.`},
    f3b: {title: 'F.3: overfull rows ⇒ a cheaper witness', detail: 'If rows R hold more sand than their columns N(R) take, Ω misses R × N(R)ᶜ, and U = p diag(a) U₀, V = p⁻¹ diag(b̄) V₀ from E.3, with p² = ‖b‖/‖a‖, cost less than ‖a‖ ‖b‖. On main since commit b6577f53.'},
    cross: {title: 'F.4: the cross: recovered ⇔ α<sub>i₀</sub> + β<sub>j₀</sub> ≥ 1', detail: 'One way: an explicit plan on the cross and F.2. The other: the witness of F.3 on the block off row i₀ and column j₀. No Gale needed. On main since commit b6577f53.'},
    gale: {title: 'Gale: a plan ⇔ Σ<sub>R</sub> α ≤ Σ<sub>N(R)</sub> β', detail: 'The supply–demand theorem (Gale, 1957), for any nonnegative masses with equal totals. Induction on the cells: ship sand along one cell until its row or column is empty, or until a set of rows R becomes tight, then split there. On main since commit ab75b4fa.'},
    fiff: {title: 'Theorem F as an equivalence', detail: 'M recovers a bᵀ ⇔ Ω is rigid and carries a plan ⇔ Ω is rigid and ‖b‖² Σ_R |a_i|² ≤ ‖a‖² Σ_N(R) |b_j|² for every set R. Example: the triangle {(0, 0), (0, 1), (1, 1)} recovers (2, 1)(1, 2)ᵀ but not (1, 2)(2, 1)ᵀ. On main since commit ab75b4fa.'},
    g: {title: 'Theorem G: zero entries allowed', detail: 'For a ≠ 0 and b ≠ 0, zeros allowed: M recovers a bᵀ ⇔ the cells of Ω with a_i ≠ 0 and b_j ≠ 0 connect these rows to these columns, and Σ_R α_i ≤ Σ_N(R) β_j for every set of rows R. A row or a column of zeros needs no cell. Example: in a 1 × 2 table the cell (0, 0) recovers (1)(1, 0)ᵀ but not (1)(1, 1)ᵀ. On main since commits 1c4bed77 and 6574a220.'},
    n3: {title: 'Every 3 × 3 pattern', detail: 'All 511 patterns but the full one with equal weights and, in each of three draws of random weights, the 510 nonempty ones, solved by batched ADMM: each class behaves as the theorems say (section 7).'},
    n4: {title: 'Every 4 × 4 pattern', detail: 'All 65 535 patterns but the full one, with equal weights, solved by batched ADMM: each class behaves as Theorem E says. The 4464 rigid patterns with a permutation whose error is still above 10⁻⁶ after 20 000 steps keep converging when run on (section 7).'},
    nmargin: {title: 'The failure margin, 3 × 3 to 7 × 7', detail: 'Off every block with k + l > N, ADMM meets the proved least cost to within a rounding error. On 2000 random patterns of each size without a permutation, the largest gaps agree with the proved worst case to six decimals, except for the patterns that are not rigid at N = 7 (section 7).'},
    zeros: {title: 'Tables with zero entries', detail: 'All 12 211 patterns but the full ones of 13 tables, all but one with zeros at fixed places, solved by batched ADMM: each class behaves as Theorem G says (section 7).'},
    train: {title: 'Training reaches M', detail: 'Weight decay at its optimum is M (Lemma 1). That training reaches this optimum is a modeling step, not a theorem.'},
  },
};
