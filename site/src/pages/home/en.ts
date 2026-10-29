/** The home page in English. */

import {box, eq, hand, heuristic, lean, leanNames, m, numerical, open, S1} from '../markup.ts';
import {det, FULL_LEAN, frac, k00, k01, k10, k11, Kr, legendOf, ri, root, sj, sub, threeFill, ui, vj, type HomeText} from './spec.ts';

const L = 'en';

/** The terms of the statement, each made exact. */
const terms = `<ul class="terms">
  <li><strong>Table.</strong> An ${m('N × N')} matrix ${m('K')} of complex numbers, ${m('N ≥ 1')}, with rows
  ${m('a')} and columns ${m('b')} numbered ${m('0, …, N − 1')}; its entry ${m(sub('K', 'ab'))} sits in the cell
  ${m('(a, b)')}. A set ${m('Ω')} of cells is <em>incomplete</em> when it is not all ${m('N²')} of them: at least one
  entry is hidden.</li>
  <li><strong>Weight decay at its optimum.</strong> Write a matrix as ${m('X = U V<sup>ᴴ</sup>')}, with ${m('U')} and
  ${m('V')} of ${m('N')} rows and any number of columns, at the cost ${m('½(‖U‖² + ‖V‖²)')}, where ${m('‖U‖²')} is the sum
  of the squared moduli of the entries of ${m('U')}: the weight decay of a bilinear layer. Among the factorizations, of
  any number of columns, with ${m('X = K')} on ${m('Ω')}, the optimal ones have the least cost. Weight decay at its
  optimum <em>recovers</em> ${m('K')} from ${m('Ω')} when some factorization is optimal and every optimal one has the
  product ${m('K')}. The products of the optimal factorizations are exactly the matrices of least nuclear norm
  ${m(`‖X‖${S1}`)}, the sum of the singular values, among those equal to ${m('K')} on ${m('Ω')} ${lean('Lemma 1')}. So
  recovery means that ${m('K')}, and no other matrix, has the least nuclear norm among them: the model M of the course,
  and the form in which Lean states the theorems below.</li>
  <li><strong>Rank 1, flat.</strong> ${m('K')} has rank 1 when ${m('K = u v<sup>T</sup>')} for nonzero vectors
  ${m('u')} and ${m('v')}. ${m('K')} is flat when its ${m('N')} singular values are all equal.</li>
  <li><strong>Connect, contain a permutation.</strong> Draw the ${m('N')} rows and the ${m('N')} columns as ${m('2N')}
  points, and each cell ${m('(a, b)')} of ${m('Ω')} as an edge from row ${m('a')} to column ${m('b')}. The cells of
  ${m('Ω')} connect the rows with the columns when this graph is connected. They contain a permutation when some bijection
  ${m('σ')} from the rows onto the columns has ${m('(a, σ(a)) ∈ Ω')} for every row ${m('a')}.</li></ul>`;

/** The full statement: every term, what is proved for M, what is measured, what is not proved. */
const full = [
  `<p>This part gives every definition in full, the theorems for tables of rank 1 with entries of any moduli, two
  conditions for tables of any rank, the theorems on families of tasks, what is measured, and what is not proved. The
  later pages derive each piece slowly.</p>`,

  `<section id="setting"><h3>The setting</h3><ol class="terms">
  <li><strong>Tasks and tables.</strong> ${m('p')} is a prime. A task is a map ${m('f : ℤ/p × ℤ/p → ℤ/p')}. A readout is
  a map ${m('φ : ℤ/p → ℂ')}, and the table of ${m('f')} under ${m('φ')} is the ${m('p × p')} matrix
  ${m(`${sub('K', 'φ')} = [φ(f(a, b))]`)}. The readouts used are ${m(`${sub('ψ', 'r')}(x) = e<sup>2πirx/p</sup>`)}, with
  ${m(`ψ = ${sub('ψ', '1')}`)}, and the multiplicative characters ${m('χ')} of ${m('ℤ/p')}, extended by
  ${m('χ(0) = 0')}: ${m('|χ(x)| = 1')} for ${m('x ≠ 0')} and ${m('χ(xy) = χ(x) χ(y)')}. The course follows
  ${m('a + b')}, ${m('ab')}, ${m('π(a + b)')} for a random permutation ${m('π')} of ${m('ℤ/p')}, and the family
  ${m('P(a) + ab')} with ${m('P')} a polynomial.</li>
  <li><strong>Discontinuities of the second kind.</strong> Put the table on the unit square:
  ${m(`${sub('F', 'p')}(x, y) = f(a, b)/p`)} at ${m('x = a/p')} and ${m('y = b/p')}. For ${m('f = ab')} this is
  ${m(`${sub('F', 'p')}(x, y) = ${frac}(pxy)`)}; on the whole square, ${m(`${frac}(pxy)`)} jumps along the
  ${m('p − 1')} hyperbolas ${m('pxy = 1, …, p − 1')}. As ${m('p')} runs through the primes, ${m(`${frac}(pxy)`)}
  converges exactly where ${m('2xy')} is an integer. If ${m('2xy')} is an integer, ${m(`${frac}(pxy) = ${frac}(xy)`)}
  for every odd ${m('p')}. For rational ${m('xy')} whose denominator in lowest terms is ${m('q ≥ 3')},
  ${m(`${frac}(pxy)`)} takes each of the values ${m('k/q')} with ${m('0 < k < q')} and ${m('k')} prime to ${m('q')}, at
  least two of them, infinitely often, by Dirichlet's theorem on primes in arithmetic progressions ${lean('Dirichlet')}.
  For irrational ${m('xy')} its values are equidistributed in ${m('[0, 1)')} (Vinogradov) ${hand('Vinogradov', L)}. So
  the limit exists only on the axes and on the hyperbola ${m('xy = ½')}, a null set ${lean('null set')}, and everywhere
  else ${m(`t ↦ ${frac}(xy/t)`)}, on the points ${m('t = 1/p')}, has no limit at ${m('t = 0')}: a discontinuity of the
  second kind. For ${m('f = a + b')}, by contrast, ${m(`${sub('F', 'p')}(x, y) = ${frac}(x + y)`)} for every ${m('p')},
  with one jump, of the first kind, along ${m('x + y = 1')}. Each table is finite; the phrase describes the family as
  ${m('p')} grows.${leanNames(FULL_LEAN.discontinuity)}</li>
  <li><strong>Observations.</strong> A set ${m('Ω ⊆ ℤ/p × ℤ/p')} of cells whose values are shown. In training ${m('Ω')}
  is a random half: the ${m('p²')} pairs are shuffled (SplitMix64, seeds 7 and 11) and the first ${m('⌊p²/2⌋')} are kept,
  4704 of the 9409 cells at ${m('p = 97')}. The theorems allow any ${m('Ω')}.</li>
  <li><strong>To learn.</strong> To reach at least 99% accuracy on the cells outside ${m('Ω')}, the unseen half. Chance
  is ${m('1/p')}, about 1% at ${m('p = 97')}.</li>
  <li><strong>The network.</strong> One table ${m('E ∈ ℝ<sup>p×128</sup>')} embeds both operands and also reads out the
  answer: the embedding is tied. ${m('J')} turns each pair of channels of ${m(sub('E', 'b'))} by 90°,
  ${m('(x₁, x₂) ↦ (−x₂, x₁)')}, so that the input tells ${m('(a, b)')} from ${m('(b, a)')}. ${m('n')} is RMSNorm without
  parameters; it acts on the input, on both sides of the block (Peri-LN) and before the readout:
  ${eq(`x = n(${sub('E', 'a')} + J ${sub('E', 'b')}), &nbsp; x ← x + n(SwiGLU(n(x))), &nbsp; logits = n(x) E<sup>T</sup>,`)}
  with ${m('SwiGLU(x)')} ${m(`= (SiLU(x ${sub('W', 'g')}) ⊙ x ${sub('W', 'v')}) ${sub('W', 'o')}`)}, 341 hidden units, one block
  and no biases. The loss is the cross-entropy of the answer; the optimizer is Schedule-Free AdamW, with weight decay on
  every weight. The training numbers quoted here were measured with AdamW, learning rate ${m('10<sup>−3</sup>')} after a
  linear warmup of 10 steps, and with Schedule-Free AdamW at learning rates ${m('10<sup>−3</sup>')}, 0.01 and 0.03, also
  with a warmup of 10 steps; both with betas 0.9 and 0.98, weight decay 1, batch 512 and 10 000 steps. No theorem here
  depends on the optimizer.</li>
  <li><strong>The model M.</strong> A bilinear layer computes ${m('X = U V<sup>ᴴ</sup>')}: row ${m('a')} of the table
  carries the row ${m(sub('U', 'a'))} of ${m('U')}, column ${m('b')} the row ${m(sub('V', 'b'))} of ${m('V')}, and
  ${m(`${sub('X', 'ab')} = ⟨${sub('U', 'a')}, ${sub('V', 'b')}⟩`)}. Weight decay charges ${m('½(‖U‖² + ‖V‖²)')}, and the
  cheapest factorization of ${m('X')} costs exactly ${m(`‖X‖${S1}`)} ${lean('Lemma 1')}. So the optimal factorizations
  with ${m('X = K')} on ${m('Ω')} multiply to exactly the matrices of least nuclear norm with ${m('X = K')} on
  ${m('Ω')}, and weight decay at its optimum recovers ${m('K')} exactly when ${m('K')}, and no other matrix, has the least
  nuclear norm among them ${lean('Lemma 1, optimum')}. M returns these matrices. That training reaches them is a
  modeling step, not a theorem ${heuristic('training ≈ M', L)}.</li>
  </ol></section>`,

  `<section id="proved"><h3>What is proved, for M</h3>
  <p>Each statement of this part is proved in Lean unless its tag says otherwise. First, tables of rank 1 with entries of
  any moduli.</p>
  ${box(`<p><strong>Theorem G</strong> ${lean('G')}. Let ${m('K = u v<sup>T</sup>')}, with ${m('u')} and ${m('v')}
  complex vectors of any lengths, zero entries allowed. M recovers ${m('K')} from ${m('Ω')} if and only if</p><ol>
  <li>${m('Ω')} is rigid on the supports: for all complex ${m(ri)} and ${m(sj)}, if ${m(`${ri} + ${sj} = 0`)} on every
  cell of ${m('Ω')} with ${m(`${ui} ${vj} ≠ 0`)}, then ${m(`${ri} + ${sj} = 0`)} on every cell with
  ${m(`${ui} ${vj} ≠ 0`)}; and</li>
  <li>every set ${m('R')} of rows fits into the set ${m('N(R)')} of columns that it meets in ${m('Ω')}:
  ${m(`‖v‖² Σ<sub>i∈R</sub> |${ui}|²`)} ${m(`≤ ‖u‖² Σ<sub>j∈N(R)</sub> |${vj}|²`)}.</li></ol>
  <p>By the supply–demand theorem (Gale, 1957), also proved in Lean, the second condition says that ${m('Ω')} carries a
  transport plan from the masses ${m(`‖v‖² |${ui}|²`)} to the masses ${m(`‖u‖² |${vj}|²`)}.</p>${leanNames(FULL_LEAN.g)}`)}
  <p>When ${m('u ≠ 0')} and ${m('v ≠ 0')}, the first condition says that the cells of ${m('Ω')} with
  ${m(`${ui} ${vj} ≠ 0`)}, as edges between rows and columns, connect the rows with ${m(`${ui} ≠ 0`)} with the columns
  with ${m(`${vj} ≠ 0`)} ${lean('connectivity')}. Without it, multiplying the rows of one connected piece by a phase
  ${m('e<sup>iθ</sup> ≠ 1')} and its columns by ${m('e<sup>−iθ</sup>')} gives a second matrix of rank 1 with the same
  values on ${m('Ω')} and the same nuclear norm. Without the second condition, some matrix equal to ${m('K')} on
  ${m('Ω')} has a smaller nuclear norm than ${m('K')}. Neither condition mentions continuity: they see only which cells are
  kept and the moduli ${m(`|${ui}|`)} and ${m(`|${vj}|`)}. For a square table with entries of modulus 1 the second
  condition is Hall's, and says that ${m('Ω')} contains a permutation: this gives Theorem 2, Theorem E of the source
  note. Hence:</p><ul>
  <li>two diagonals ${m('b − a ∈ {c₁, c₂}')} with ${m('c₁ ≠ c₂')}, ${m('2p')} of the ${m('p²')} cells, recover
  ${m('[ψ(a + b)]')}, and one diagonal does not ${lean('D.5, D.6, D.8')};${leanNames(FULL_LEAN.diagonals)}</li>
  <li>the cross, row 0 with column 0, is rigid and determines ${m('[ψ(a + b)]')} among the tables of rank 1, yet for
  ${m('p ≥ 3')} the least nuclear norm of the matrices equal to it there is ${m('2√(p − 1) < p')} ${lean('D.9')};${leanNames(FULL_LEAN.cross)}</li>
  <li>for ${m('[χ(ab)]')} the row ${m('a = 0')} and the column ${m('b = 0')} need no cell: M recovers it exactly when the
  cells of ${m('Ω')} with ${m('a, b ≠ 0')} connect the nonzero rows with the nonzero columns and contain a permutation of
  the nonzero residues; for ${m('[χ(a + ab)] = [χ(a) χ(1 + b)]')} the same holds with the columns ${m('b ≠ −1')} in
  place of ${m('b ≠ 0')} and a bijection from the rows ${m('a ≠ 0')} onto them in place of the permutation
  ${lean('G and Hall')}.${leanNames(FULL_LEAN.characters)}</li></ul>
  <p>The failure has a margin. Let ${m('K')} be an ${m('N × N')} table of rank 1 whose entries have modulus 1, so that
  ${m(`‖K‖${S1} = N`)}. If ${m('Ω')} contains no permutation, some matrix equal to ${m('K')} on ${m('Ω')} has nuclear
  norm at most ${m('√(N² − 1) < N − 1/(2N)')}. Let ${m('k + l = N + 1')} with ${m('k ≤ l ≤ k + 1')}. For every
  ${m('Ω')} without a permutation, some matrix equal to ${m('K')} on ${m('Ω')} has nuclear norm at most
  ${m('√(k (k − 1)) + √(l (l − 1))')}, and for one of them this is the least nuclear norm of the matrices equal to
  ${m('K')} on ${m('Ω')}: ${m('√(N² − 1)')} for odd ${m('N')}, ${m('√2 + √6')} for ${m('N = 4')}
  ${lean('failure margin')}.</p>${leanNames(FULL_LEAN.margin)}
  <p>Next, tables of any rank. Write ${m('K = U S V<sup>ᴴ</sup>')}, with orthonormal columns in ${m('U')} and in
  ${m('V')} and ${m('S')} diagonal with entries ${m('≥ 0')}. M recovers ${m('K')} from ${m('Ω')} if some ${m('W')}
  with ${m('U<sup>ᴴ</sup>W = 0')} and ${m('WV = 0')}, whose largest singular value is less than 1, makes
  ${m('U V<sup>ᴴ</sup> + W')} vanish off ${m('Ω')}, and no nonzero ${m('U A<sup>ᴴ</sup> + B V<sup>ᴴ</sup>')} vanishes
  on ${m('Ω')}. If M recovers ${m('K')} from ${m('Ω')}, then the cells of ${m('Ω')} with ${m(`${sub('K', 'ab')} ≠ 0`)},
  as edges between rows and columns, connect the row and the column of every nonzero entry; at rank 1 this is the first
  condition of Theorem G ${lean('rank r')}.</p>${leanNames(FULL_LEAN.rank)}
  <p>Whether ${m('K')} is a minimum at all, perhaps one of several, is decided at every rank: exactly when some matrix
  ${m('Y')} vanishing off ${m('Ω')}, whose largest singular value is at most 1, has
  ${m(`tr(Y<sup>ᴴ</sup>K) = ‖K‖${S1}`)}. When the diagonal of ${m('S')} is positive, the matrices ${m('Y')} of largest
  singular value at most 1 with ${m(`tr(Y<sup>ᴴ</sup>K) = ‖K‖${S1}`)} are exactly the ${m('U V<sup>ᴴ</sup> + W')} with ${m('U<sup>ᴴ</sup>W = 0')}, ${m('WV = 0')} and the largest singular value of
  ${m('W')} at most 1. So ${m('K')} is a minimum exactly when the first condition above holds with “at most 1” in place
  of “less than 1”; the second is not needed. When ${m('V')} is square, only ${m('W = 0')} qualifies: ${m('K')} is a
  minimum exactly when ${m('U V<sup>ᴴ</sup>')} vanishes off ${m('Ω')} ${lean('minimum')}. For an invertible ${m('K')},
  ${m('U V<sup>ᴴ</sup>')} is the polar factor, and this is Theorem A below
  ${hand('polar factor', L)}.</p>${leanNames(FULL_LEAN.minimum)}
  <p>The smallest case past rank 1: let ${m('K')} be a ${m('2 × 2')} table, ${m('Ω')} its three cells other than
  ${m('(0, 1)')}, ${m(`β = ${k10}`)} and ${m(`γ = ${k00} ${k11}`)}. M recovers ${m('K')} from ${m('Ω')} exactly
  when</p>
  ${eq(`${k01} = ${threeFill},`)}
  <p>the right side read as 0 when ${m('β = γ = 0')}. When ${m(`${det} K ≠ 0`)} this says
  ${m(`${k01} = <span class="ov">β</span> ${det} K / |${det} K|`)}, and when every entry has modulus 1 it says
  ${m(`${det} K = 0`)}. So the table with rows ${m('(2, 1)')} and ${m('(1, 1)')} is recovered, and the one with rows
  ${m('(2, 1)')} and ${m('(1, −1)')}, with the same moduli, is not: at rank 2 no condition on ${m('Ω')}, the supports and
  the moduli alone decides, as Theorem G does at rank 1. Nor is the sufficient condition necessary: when
  ${m(`${det} K ≠ 0`)}, a nonzero ${m('U A<sup>ᴴ</sup> + B V<sup>ᴴ</sup>')} vanishes on these three cells, yet the first
  of the two tables is recovered ${lean('three cells')}.</p>${leanNames(FULL_LEAN.threeCells)}
  <p>The sufficient condition above has a meaning of its own. Let the diagonal of ${m('S')} be positive. The condition
  holds exactly when the nuclear norm grows linearly away from ${m('K')}: some ${m('c > 0')} has
  ${m(`‖K + H‖${S1} ≥ ‖K‖${S1} + c ‖H‖${S1}`)} for every ${m('H')} that vanishes on ${m('Ω')}. Linear growth makes
  ${m('K')} the only minimum. When ${m('U')} or ${m('V')} is square, as for an invertible ${m('K')}, and a cell is
  hidden, the growth is never linear, so the condition never holds, though M may still recover ${m('K')}. The table
  with rows ${m('(2, 1)')} and ${m('(1, 1)')} is recovered from its three cells, yet
  ${m(`‖K + h E‖${S1} = √(9 + h²)`)} for real ${m('h ≤ 1')}, where ${m('E')} is the matrix whose only nonzero entry
  is a 1 at the hidden cell ${m('(0, 1)')}, and no ${m('c > 0')} makes its growth linear. Linear growth needs at least
  ${m('r (m + n − r)')} cells for an ${m('m × n')} table of rank ${m('r')}; recovery does not: that table of rank 2 is
  recovered from 3 cells, fewer than ${m('2 (2 + 2 − 2) = 4')} ${lean('linear growth')}.</p>${leanNames(FULL_LEAN.growth)}
  <p>Then flat tables.</p>
  ${box(`<p><strong>Theorem A</strong> ${lean('A')}. Let ${m('K')} be invertible, with polar factor
  ${m('W = K (K<sup>ᴴ</sup>K)<sup>−1/2</sup>')}. Then ${m('K')} has the least nuclear norm among the matrices equal to
  ${m('K')} on ${m('Ω')} if and only if ${m('W')} vanishes off ${m('Ω')}.</p>${leanNames(FULL_LEAN.a)}`)}
  <p>If the singular values of a square ${m('K')} all equal ${m('c')} and no entry is zero, then ${m('c > 0')},
  ${m('K')} is invertible and ${m('W = K/c')} vanishes nowhere: this gives Theorem 1 ${lean('Theorem 1')}. With a single
  cell hidden, the fill is the opposite phase, as in the conclusions ${lean('Corollary')}.</p>
  ${box(`<p><strong>Theorem C</strong> ${lean('C')}. Let ${m('f = P(a) + ab')}, with ${m('P')} a polynomial of degree
  ${m('m')} over ${m('ℤ/p')}; let ${m('ρ : ℤ/p → ℂ')} be any readout, ${m(`(${Kr} h)(a) = Σ<sub>b</sub> ρ(f(a, b)) h(b)`)},
  and let ${m('h')} be centered, ${m('Σ<sub>b</sub> h(b) = 0')}; write ${m('‖ρ‖² = Σ<sub>c</sub> |ρ(c)|²')} and
  ${m('‖h‖² = Σ<sub>b</sub> |h(b)|²')}. Then ${m(`‖${Kr} h‖² ≤ (p − 1) ‖ρ‖² ‖h‖²`)}, and when ${m('m ≤ 1')} some
  ${m('ρ')} and ${m('h')} with ${m('‖ρ‖ ‖h‖ > 0')} reach equality. When ${m('m ≥ 2')},
  ${m(`‖${Kr} h‖² ≤ λ ‖ρ‖² ‖h‖²`)} with ${m(`λ = 1 + ${root}`)}, which is smaller than ${m('p − 1')} exactly when
  ${m('(m − 1)(2p − 1) < (p − 2)²')}.</p>${leanNames(FULL_LEAN.c)}`)}
  <p>So the normalized peak ${m(`‖${Kr} h‖² / ((p − 1) ‖ρ‖² ‖h‖²)`)} reaches 1 for some readout when ${m('deg P ≤ 1')},
  and is at most ${m('λ/(p − 1)')} for every readout when ${m('deg P ≥ 2')}: 0.215 for ${m('a³ + ab')} at
  ${m('p = 97')}, and ${m('λ/(p − 1) ~ √(2(m − 1)/p)')} as ${m('p → ∞')}. For readouts of modulus 1, the share of the
  whole table that one centered mode carries, the peak ${m('κ')} measured below, is at most ${m('λ/p')}: 0.213 for
  ${m('a³ + ab')} at ${m('p = 97')} ${lean('C.5')}. The polynomials ${m('a + ab')}, with ${m('deg P = 1')}, and
  ${m('a² + ab')}, with ${m('deg P = 2')}, both of total degree 2, fall on opposite sides.</p>
  ${box(`<p><strong>Theorem B</strong> ${lean('B')}. Write ${m('a³ + ab')} as two steps, ${m('z = ab')} and then
  ${m('f = a³ + z')}. Each step has rank 1 in its own characters: ${m('χ(ab) = χ(a) χ(b)')} for a multiplicative
  ${m('χ')}, and ${m(`${sub('ψ', 'r')}(a³ + z) = ${sub('ψ', 'r')}(a³) ${sub('ψ', 'r')}(z)`)}. For nontrivial ${m('χ')}
  and ${m('r ≠ 0')}, the inner product ${m(`Σ<sub>x</sub> ${sub('ψ', 'r')}(x)<sup>*</sup> χ(x)`)} is a Gauss sum, of
  modulus ${m('√p')}. And the labels hide the first step: for ${m('r ≠ 0')} and ${m('(a, b)')} uniform,
  ${m(`‖E[${sub('ψ', 'r')}(ab) | f]‖²`)} ${m('≤ 9/(2p) + 8/p<sup>3/2</sup>')}, so every ${m('φ : ℤ/p → ℂ')} has
  ${m(`|E[φ(f)<sup>*</sup> ${sub('ψ', 'r')}(ab)]|`)} ${m('≤ ‖φ(f)‖ √(9/(2p) + 8/p<sup>3/2</sup>)')}, with
  ${m('‖φ(f)‖² = E|φ(f)|²')}. For every ${m('P(a) + ab')} with ${m('deg P = m ≥ 1')} and ${m('p ∤ m')}, and
  ${m('r ≠ 0')}, it holds in the form ${m(`‖E[${sub('ψ', 'r')}(ab) | f]‖²`)}
  ${m('≤ (w + 1)²/p²')} ${m('+ (p + w + 1)²/(p²(2p − 1))')}, with ${m('w = (m − 1)√p')}.</p>${leanNames(FULL_LEAN.b)}`)}
  <p>The proof needs Weil's bound ${m('|Σ<sub>x</sub> ψ(rP(x))| ≤ (m − 1)√p')} for ${m('r ≠ 0')} and
  ${m('p ∤ m')}, and its analogues for multiplicative characters. Lean proves them through the L-function
  ${m(`L(T) = (1 − ${sub('ω', '1')}T) ⋯ (1 − ${sub('ω', 'm−1')}T)`)} of the sum: by Stepanov's method every
  ${m(sub('ω', 'i'))} has ${m(`|${sub('ω', 'i')}| ≤ √p`)}, and the sum is ${m(`−(${sub('ω', '1')} + ⋯ + ${sub('ω', 'm−1')})`)}
  ${lean('Weil')}. Weil proved, as part of the Riemann hypothesis for curves over finite fields (1948), that
  ${m(`|${sub('ω', 'i')}| = √p`)} ${hand('Weil 1948', L)}; Lean has only the inequality, and only for the sums that
  Theorem B uses.</p>${leanNames(FULL_LEAN.weil)}</section>`,

  `<section id="measured"><h3>What is measured</h3><ul>
  <li><strong>M on the network's own data.</strong> At ${m('p = 31, 61, 97')} the training halves of seeds 7 and 11
  meet both conditions of Theorem G for ${m('ψ(a + b)')}, ${m('χ(ab)')} and ${m('χ(a + ab) = χ(a) χ(1 + b)')}. ADMM
  recovers all three from them with relative error below ${m('10<sup>−10</sup>')}, the zero rows and columns of the
  ${m('χ')} tables included, and decodes every unseen cell. On the same halves ${m('ψ(a³ + ab)')} fails, with relative
  error 1.29 to 1.30 ${numerical('ADMM', L)}.</li>
  <li><strong>Every small pattern.</strong> All 511 proper patterns of a ${m('3 × 3')} table with equal weights, 510 with
  random weights, and about 12 000 patterns of tables up to ${m('3 × 4')} with zero entries: every class behaves as
  Theorem G says ${numerical('ADMM', L)}.</li>
  <li><strong>Tables of rank 2 and 3.</strong> ADMM on 3600 random sets of cells of ${m('4 × 4')}, ${m('6 × 6')} and
  ${m('8 × 8')} tables of rank 2 and 3 recovers none of the 1446 sets that fail the necessary condition. Of the others,
  it recovers all 468 that meet the sufficient condition, with a ${m('W')} found by search; none of the 649 on which no
  nonzero ${m('U A<sup>ᴴ</sup> + B V<sup>ᴴ</sup>')} vanishes but the search finds no ${m('W')}, and on each of these it
  finds a smaller nuclear norm than that of ${m('K')}; and 117 of the 1037 on which one vanishes, all of them
  block-diagonal tables. On 5000 random ${m('2 × 2')} tables, its fill of ${m('(0, 1)')} from the other three cells is
  the formula above to rounding error. ADMM's dual variable ${m('Y')}, scaled to largest singular value at most 1,
  vanishes off ${m('Ω')}, so no matrix equal to ${m('K')} on ${m('Ω')} has nuclear norm below the real part of
  ${m('tr(Y<sup>ᴴ</sup>K)')}. On 590 of the 3600 sets this bound is at least
  ${m(`(1 − 10<sup>−6</sup>) ‖K‖${S1}`)}, and ADMM recovers 585 of them; on the other 3010, ADMM finds a matrix equal
  to ${m('K')} on ${m('Ω')} of nuclear norm below ${m(`(1 − 10<sup>−6</sup>) ‖K‖${S1}`)} ${numerical('ADMM', L)}.</li>
  <li><strong>Tables of full column rank.</strong> Let ${m('K = Q P')}, with ${m('P')} positive definite and ${m('Q')}
  of orthonormal columns with one nonzero entry in each row, so that ${m('Q')} is the polar factor
  ${m('U V<sup>ᴴ</sup>')}. Such tables were drawn at random, 600 of each shape: invertible ${m('4 × 4')} and
  ${m('8 × 8')}, where ${m('Q')} is diagonal, and ${m('6 × 3')}, ${m('8 × 4')} and ${m('8 × 2')}. Half get a random
  set of cells, the other half a random set with the nonzero cells of ${m('Q')} added. On these 3000 sets the same
  bound shows ${m('K')} a minimum, to within ${m(`10<sup>−6</sup> ‖K‖${S1}`)}, on exactly the 1695 off which
  ${m('U V<sup>ᴴ</sup>')} vanishes, as the criterion above for a square ${m('V')} says, and ADMM finds a smaller
  nuclear norm on the other 1305. ADMM recovers 1100 of the 1695, all without linear growth, since every set hides a
  cell ${numerical('ADMM', L)}.</li>
  <li><strong>The network.</strong> The peak of a task is the largest share of its table that one centered interaction
  mode carries under a readout of modulus 1:
  ${eq('κ = max |Σ<sub>a,b</sub> ρ(f(a, b)) g(a) h(b)|² / p²')}
  over ${m('|ρ| = 1')} and unit vectors ${m('g, h')} with sum zero. It is found by alternating maximization from 456
  starts at ${m('p = 97')}, 356 at ${m('p = 47')} and 660 at ${m('p = 199')}, so each value is the best one found. Of
  the thirteen tasks trained below, the seven that learn have ${m('κ')} between 0.275 and 1, at ${m('p = 97')} and at
  ${m('p = 199')} alike; of the six that do not, the five other than the parity task below have ${m('κ')} at most
  0.106 at ${m('p = 97')}, near the 0.069 of a random table, and at most 0.059 at ${m('p = 199')}: 0.142, 0.106 and
  0.059 for ${m('a³ + ab')} at ${m('p = 47, 97, 199')}, under Theorem C's ceiling of 0.213 at ${m('p = 97')}. For ten
  of them the outcome was predicted from ${m('κ')} before they were first trained, and all ten came out as predicted
  with AdamW at learning rate ${m('10<sup>−3</sup>')} and seeds 7 and 11; accuracy on the unseen half is measured every
  500 steps. ${m('a² + ab')}, ${m('a² + ab + b² + a')} and ${m('a³ + ab² + b')} end below 2%, as do the controls
  ${m('a³ + ab')} and ${m('a² + ab + b²')}, and none passes 2.3%; ${m('ab')}, ${m('a²b')}, ${m('a + ab')},
  ${m('(a + b)²')}, ${m('π(a + b)')}, ${m('a³ + b')} and ${m('(a + b)³')} reach 99% within 1000 to 3000 steps, though
  ${m('(a + b)³')} ends at 97.68% with seed 7. Schedule-Free AdamW, the course's optimizer, splits the twelve alike at
  learning rates ${m('10<sup>−3</sup>')}, 0.01 and 0.03: the five end below 2.2% and none passes 2.3%, and the seven
  reach 99% within 500 to 9500 steps, but for ${m('(a + b)³')} with seed 11 at ${m('10<sup>−3</sup>')}, which ends at
  97.70% ${numerical('training', L)}.</li></ul></section>`,

  `<section id="unproved"><h3>What is not proved</h3><ul>
  <li><strong>That training reaches the optimum of weight decay.</strong> It is the one step between the theorems about M
  and the network ${heuristic('training ≈ M', L)}.</li>
  <li><strong>That a strong mode suffices for the network.</strong> It does not, in this form. For
  ${m('2⌊(a³ + ab)/2⌋ + (a + b <span class="op">mod</span> 2)')} the peak ${m('κ = 0.98')} comes from the parity of the
  answer alone; without the answer's lowest bit the best peak found is 0.087. At the end, with AdamW, the network
  predicts the parity on 78.68 to 79.60% of the unseen half and the answer itself on 2.29 to 2.73%, against
  ${m('2/p ≈ 2.06%')} for guessing the rest from a right parity: it learns what the peak carries and almost nothing of
  the remainder. Schedule-Free AdamW gives 79.10 to 79.20% and 2.01 to 2.26% at learning rate ${m('10<sup>−3</sup>')},
  and raises them to 86.03 to 91.82% and 3.27 to 6.78% at 0.01 and 0.03, still far from the answer
  ${numerical('training', L)}.</li>
  <li><strong>Rank above 1.</strong> For tables of rank ${m('r ≥ 2')}, whether ${m('K')} is a minimum is decided
  above, but whether it is the only one, which is recovery, has no criterion like Theorem G. What remains open is a
  minimum ${m('K')} that meets the necessary condition above but lacks linear growth, that is, the sufficient
  condition; every invertible table with a hidden cell lacks it. This case is decided only for the three cells of a
  ${m('2 × 2')} table and, by Theorem 1, for flat tables without zero entries ${open('rank r', L)}.</li>
  <li><strong>Tasks outside the family.</strong> For ${m('a² + ab + b²')}, ${m('a² + ab + b² + a')} and
  ${m('a³ + ab² + b')} the peak is small only numerically; no ceiling like Theorem C's is proved
  ${open('ceiling on κ', L)}. The effective rank ${m(`(‖K‖${S1}/‖K‖<sub>S2</sub>)²`)}, with ${m('‖K‖<sub>S2</sub>')}
  the root of the sum of the squared singular values, is no substitute for the peak: among the readouts of
  ${m('a³ + ab')} that a search tried, it is least for the indicator ${m('[a³ + ab = 0]')} ${numerical('search', L)},
  yet for every ${m('c')} and every ${m('Ω')}, each matrix of least nuclear norm equal to ${m('[a³ + ab = c]')} on
  ${m('Ω')} is 0 at every hidden 1 in a row ${m('a ≠ 0')} ${lean('one-hot')}.${leanNames(FULL_LEAN.oneHot)}</li>
  <li><strong>Real readouts of a flat table.</strong> For odd ${m('p')} and every ${m('r')}, the real tables
  ${m('[cos(2πrf/p)]')} and ${m('[sin(2πrf/p)]')} of ${m('f = a³ + ab')} are singular, so Theorem A says nothing about
  them ${lean('real tables')}. Numerically M decodes the hidden cells whose mirror ${m('(−a, b)')} is seen, about half of
  them, through the symmetry ${m('f(−a, b) = −f(a, b)')} ${numerical('ADMM', L)}.${leanNames(FULL_LEAN.real)}</li></ul>
  <p class="sub">Source: <code>review/flat_spectrum.md</code> in the transformer repository. Lean:
  <code>Transformer.Grokking.FlatSpectrum</code> and <code>Transformer.Weil</code>.</p></section>`,
].join('\n');

export const en: HomeText = {
  nav: 'Course',
  title: 'What can a network learn from half a table?',
  kicker: 'A course on spectra and learning',
  statement: 'Weight decay at its optimum recovers a table of rank 1 whose entries have modulus 1 from exactly those sets of cells that connect its rows with its columns and contain a permutation, and a flat table without zero entries from no incomplete set.',
  terms,
  theoremsTitle: 'Two theorems',
  theorems: {
    flat: {title: 'Theorem 1: no incomplete set recovers a flat table without zero entries', body: `<p>Let ${m('K')}
      be an ${m('N × N')} table without zero entries whose singular values are all equal. Then for every incomplete set of
      cells ${m('Ω')}, some matrix equal to ${m('K')} on ${m('Ω')} has a smaller nuclear norm than ${m('K')}. So no
      optimal factorization has the product ${m('K')}, and weight decay at its optimum recovers ${m('K')} from no
      incomplete set ${lean('Theorem 1')}.</p>
      <p>For example, with ${m('ψ(x) = e<sup>2πix/p</sup>')}, the ${m('p × p')} table ${m('[ψ(a³ + ab)]')} of
      ${m('a³ + ab <span class="op">mod</span> p')} has no zero entry, and every one of its singular values is
      ${m('√p')}, for every ${m('p ≥ 1')} ${lean('Proposition 2')}.</p>`},
    rankOne: {title: 'Theorem 2: which sets recover a table of rank 1', body: `<p>Let ${m('K')} be an ${m('N × N')}
      table of rank 1 whose entries all have modulus 1. Weight decay at its optimum recovers ${m('K')} from ${m('Ω')} if and
      only if the cells of ${m('Ω')} connect the rows with the columns and contain a permutation ${lean('Theorem 2')}.</p>
      <p>Both conditions concern ${m('Ω')} alone, not the entries of ${m('K')}. For example,
      ${m('[ψ(a + b)] = [ψ(a) ψ(b)]')} is such a table.</p>`},
  },
  conclusionsTitle: 'What follows',
  conclusions: {
    fewest: {title: 'The fewest cells', body: `The ${m('2N − 1')} cells ${m('(a, a)')}, ${m('a = 0, …, N − 1')}, and
      ${m('(a, a + 1)')}, ${m('a = 0, …, N − 2')}, recover every table of Theorem 2, and no set of fewer cells recovers
      any of them ${lean('2N − 1')}. At ${m('N = 97')} that is 193 of the 9409 cells.`},
    product: {title: 'A function with discontinuities of the second kind, from an incomplete set', body: `Let
      ${m('p')} be prime and ${m('f(a, b) = ab <span class="op">mod</span> p')}. At ${m('x = a/p')} and ${m('y = b/p')},
      for ${m('a, b = 0, …, p − 1')}, ${m(`f/p = ${frac}(pxy)`)}, the fractional part of ${m('pxy')}. As ${m('p → ∞')}
      through the primes, ${m(`${frac}(pxy)`)} has a limit exactly at the points ${m('(x, y)')} of ${m('[0, 1)²')} where
      ${m('2xy')} is an integer, a set of area 0 ${lean('area')}: where ${m('xy')} is rational by Dirichlet's theorem
      ${lean('Dirichlet')}, elsewhere by Vinogradov's ${hand('Vinogradov', L)}. So at almost every ${m('(x, y)')}
      the function ${m(`t ↦ ${frac}(xy/t)`)}, on the points ${m('t = 1/p')}, has no limit at ${m('t = 0')}: a
      discontinuity of the second kind. Yet for every multiplicative character ${m('χ')} of ${m('ℤ/p')}, extended by
      ${m('χ(0) = 0')}, the table ${m('[χ(ab)] = [χ(a) χ(b)]')} has rank 1, with entries of modulus 1 off the row
      ${m('a = 0')} and the column ${m('b = 0')}, and weight decay at its optimum recovers it from ${m('Ω')} exactly when
      the cells of ${m('Ω')} with ${m('a, b ≠ 0')} connect the nonzero rows with the nonzero columns and contain a
      permutation of the nonzero residues ${lean('χ(ab)')}. So it recovers ${m('[χ(ab)]')} from the ${m('2p − 3')} cells
      ${m('(a, a)')} and ${m('(1, b)')} with ${m('a, b ≠ 0')}, and from no set of fewer cells ${lean('2p − 3')}: 191 of
      the 9409 cells at ${m('p = 97')}. Some ${m('χ')} is injective, and through an injective ${m('χ')} the table gives
      back ${m('ab')} ${lean('injective χ')}.`},
    readout: {title: 'The readout decides', body: `A task has one table for each readout, and Theorems 1 and 2 speak of
      one table at a time. For prime ${m('p')} and ${m('r ≠ 0')}, the table ${m('[ψ(rab)]')} of ${m('ab')} has no zero
      entry and every singular value ${m('√p')}, so by Theorem 1 weight decay at its optimum recovers it from no
      incomplete set ${lean('ψ(rab)')}. Read through ${m('χ')}, the same task is recovered as above.`},
    hidden: {title: 'One hidden cell', body: `Let ${m('K')} be an ${m('N × N')} table with
      ${m('K<sup>ᴴ</sup>K = N·I')}, ${m('N ≥ 2')}, and hide one cell ${m('(a, b)')}, with
      ${m(`|${sub('K', 'ab')}| = 1`)}. A matrix equal to ${m('K')} off that cell has the least nuclear norm exactly when its
      entry there is ${m(`−${sub('K', 'ab')}`)}: the only optimal fill is the opposite phase. For ${m('[ψ(a³ + ab)]')} with
      ${m('p')} odd and ${m('p ≥ 3')}, the residues ${m('c')} whose ${m('ψ(c)')} is nearest to that fill are exactly
      ${m('f + (p − 1)/2')} and ${m('f + (p + 1)/2')}, where ${m('f = a³ + ab')}: never ${m('f')} itself. For
      ${m('[ψ(a + b)]')} and ${m('p ≥ 2')}, the optimal fill decodes to ${m('a + b')} alone ${lean('Corollary')}.`},
    data: {title: 'The training data', body: `At ${m('p = 31, 61')} and 97, the random halves on which the network is
      trained, with seeds 7 and 11, meet the conditions under which weight decay at its optimum recovers
      ${m('[ψ(a + b)]')}, ${m('[χ(ab)]')} and ${m('[χ(a + ab)]')}: those of Theorem 2, and of its forms with zero
      entries below ${numerical('conditions', L)}.`},
    network: {title: 'The network', body: `At ${m('p = 97')}, the network of the course, trained on such a half with
      AdamW at learning rate ${m('10<sup>−3</sup>')} or with Schedule-Free AdamW at ${m('10<sup>−3</sup>')}, 0.01 and
      0.03, reaches 99% accuracy on the other half for ${m('ab')}, ${m('a²b')}, ${m('a + ab')}, ${m('(a + b)²')},
      ${m('π(a + b)')}, ${m('a³ + b')} and ${m('(a + b)³')}, with both seeds, but for ${m('(a + b)³')} with one seed
      under Schedule-Free AdamW at ${m('10<sup>−3</sup>')}; for ${m('a³ + ab')}, ${m('a² + ab')}, ${m('a² + ab + b²')},
      ${m('a² + ab + b² + a')} and ${m('a³ + ab² + b')} it ends below 2.2% and is at most 2.3% at each check, every 500
      steps ${numerical('training', L)}. That training reaches the optimum of weight decay is not proved
      ${heuristic('training ≈ M', L)}.`},
  },
  fullTitle: 'The statement in full',
  full,
  audienceTitle: 'Who this is for',
  audience: `Students who know analysis up to complex analysis: limits and continuity, Fourier series, ${m('e<sup>iθ</sup>')},
    matrices and eigenvalues. No group theory and no machine learning are assumed; the pages introduce both as they go.`,
  legend: legendOf([['Lean', 'proved in Lean'], ['by hand', 'proved on paper only'], ['numerical', 'measured'], ['to prove', 'open'], ['heuristic', 'a modeling step, not a theorem']]),
  pagesTitle: 'The pages',
  writing: 'being written',
};
