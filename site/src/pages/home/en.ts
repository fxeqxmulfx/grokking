/** The home page in English. */

import {box, eq, hand, heuristic, lean, leanNames, m, numerical, open, S1} from '../markup.ts';
import {FULL_LEAN, frac, Kr, legendOf, ri, root, sj, sub, ui, vj, type HomeText} from './spec.ts';

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
  `<p>This part gives every definition in full, the theorems for tables of rank 1 with entries of any moduli, the
  theorems on families of tasks, what is measured, and what is not proved. The later pages derive each piece slowly.</p>`,

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
  converges exactly where ${m('2xy')} is an integer. For irrational ${m('xy')} its values are equidistributed in
  ${m('[0, 1)')} (Vinogradov). For rational ${m('xy')} whose denominator in lowest terms is ${m('q ≥ 3')}, they take each
  of the values ${m('k/q')} with ${m('0 < k < q')} and ${m('k')} prime to ${m('q')}, at least two of them, infinitely often
  (Dirichlet) ${hand('Dirichlet, Vinogradov', L)}. So the limit exists only on the axes and on the hyperbola
  ${m('xy = ½')}, a null set, and everywhere else ${m(`t ↦ ${frac}(xy/t)`)}, on the points ${m('t = 1/p')}, has no limit
  at ${m('t = 0')}: a discontinuity of the second kind. For ${m('f = a + b')}, by contrast,
  ${m(`${sub('F', 'p')}(x, y) = ${frac}(x + y)`)} for every ${m('p')}, with one jump, of the first kind, along
  ${m('x + y = 1')}. Each table is finite; the phrase describes the family as ${m('p')} grows.</li>
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
  every weight. The training numbers quoted here were measured with AdamW: learning rate ${m('10<sup>−3</sup>')} after a
  linear warmup of 10 steps, betas 0.9 and 0.98, weight decay 1, batch 512, at most 10 000 steps. The source note reports
  the same failure on ${m('a³ + ab')} under both optimizers, and no theorem here depends on the optimizer.</li>
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
  <li><strong>The network.</strong> The peak of a task is the largest share of its table that one centered interaction
  mode carries under a readout of modulus 1:
  ${eq('κ = max |Σ<sub>a,b</sub> ρ(f(a, b)) g(a) h(b)|² / p²')}
  over ${m('|ρ| = 1')} and unit vectors ${m('g, h')} with sum zero. It is found by alternating maximization from 320
  starts, so each value is the best one found. Over 22 tasks at ${m('p = 97')}, it lies between 0.28 and 1 for the seven
  tasks below that learn, and does not fall as ${m('p')} grows; for the tasks that do not learn it is at most 0.106, near
  the 0.069 of a random table, and falls roughly like ${m('1/p')}: 0.142, 0.106 and 0.057 for ${m('a³ + ab')} at
  ${m('p = 47, 97, 199')}, under Theorem C's ceiling of 0.213 at ${m('p = 97')}. Ten trainings were predicted from
  ${m('κ')} before they ran, and all ten came out as predicted: ${m('a² + ab')}, ${m('a² + ab + b² + a')} and
  ${m('a³ + ab² + b')} stay at 1 to 2% on the unseen half, as do the controls ${m('a³ + ab')} and ${m('a² + ab + b²')},
  while ${m('ab')}, ${m('a²b')}, ${m('a + ab')}, ${m('(a + b)²')}, ${m('π(a + b)')}, ${m('a³ + b')} and
  ${m('(a + b)³')} reach 99% within 1000 to 3000 steps, with both seeds ${numerical('training', L)}.</li></ul></section>`,

  `<section id="unproved"><h3>What is not proved</h3><ul>
  <li><strong>That training reaches the optimum of weight decay.</strong> It is the one step between the theorems about M
  and the network ${heuristic('training ≈ M', L)}.</li>
  <li><strong>That a strong mode suffices for the network.</strong> It does not, in this form. For
  ${m('2⌊(a³ + ab)/2⌋ + (a + b <span class="op">mod</span> 2)')} the peak ${m('κ = 0.98')} comes from the parity of the
  answer alone; without that mode it is 0.094. The network predicts the parity on 79 to 80% of the unseen half and the
  answer itself on 2.3 to 2.7%, about the ${m('2/p')} of guessing the rest: it learns what the peak carries and nothing of
  the remainder ${numerical('training', L)}.</li>
  <li><strong>Rank above 1.</strong> For tables of rank ${m('r ≥ 2')}, no criterion like Theorem G is proved
  ${open('rank r', L)}.</li>
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
      ${m('2xy')} is an integer, a set of area 0 ${hand('Dirichlet, Vinogradov', L)}. So at almost every ${m('(x, y)')}
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
    network: {title: 'The network', body: `At ${m('p = 97')}, the network of the course, trained with AdamW on such a
      half, reaches at least 99% accuracy on the other half for ${m('ab')}, ${m('a²b')}, ${m('a + ab')},
      ${m('(a + b)²')}, ${m('π(a + b)')}, ${m('a³ + b')} and ${m('(a + b)³')}, and stays at 1 to 2% for
      ${m('a³ + ab')}, ${m('a² + ab')}, ${m('a² + ab + b²')}, ${m('a² + ab + b² + a')} and ${m('a³ + ab² + b')}, with both
      seeds ${numerical('training', L)}. That training reaches the optimum of weight decay is not proved
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
