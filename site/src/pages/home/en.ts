/** The home page in English. */

import {box, eq, hand, heuristic, lean, m, numerical, open, S1} from '../markup.ts';
import {frac, Kr, legendOf, ri, root, sj, sub, ui, vj, type HomeText} from './spec.ts';

const L = 'en';

/** The statement in full: every term, what is proved for M, what is measured, what is not proved. */
const full = [
  `<p>This part states the claim with every term fixed, the theorems that sharpen it, and the status of each piece. In
  short: for the convex model of weight decay, “a good spectrum” becomes “some readout makes the table rank one”, and then
  two conditions on the observed cells decide recovery exactly; a perfectly flat table, such as ${m('ψ(a³ + ab)')}, is
  recovered from no proper part of itself. The step from that model to the trained network is measured, not proved. The
  later pages derive each piece slowly.</p>`,

  `<section id="terms"><h3>The terms</h3><ol class="terms">
  <li><strong>Tables.</strong> ${m('p')} is a prime. A task is a map ${m('f : ℤ/p × ℤ/p → ℤ/p')}, read as the
  ${m('p × p')} table of its values. The course follows ${m('a + b')}, ${m('ab')}, ${m('π(a + b)')} for a random
  permutation ${m('π')} of ${m('ℤ/p')}, and the family ${m('P(a) + ab')} with ${m('P')} a polynomial.</li>
  <li><strong>Discontinuities of the second kind.</strong> Put the table on the unit square:
  ${m(`${sub('F', 'p')}(x, y) = f(a, b)/p`)} at ${m('x = a/p')} and ${m('y = b/p')}. For ${m('f = ab')} this is
  ${m(`${sub('F', 'p')}(x, y) = ${frac}(pxy)`)}, a sawtooth that jumps on the ${m('p − 1')} hyperbolas
  ${m('pxy = 1, …, p − 1')}. As ${m('p')} runs through the primes, ${m(`${frac}(pxy)`)} converges exactly where
  ${m('2xy')} is an integer: for irrational ${m('xy')} its values are equidistributed (Vinogradov), and for rational
  ${m('xy')} whose denominator in lowest terms is at least 3 they take at least two values infinitely often (Dirichlet)
  ${hand('Dirichlet, Vinogradov', L)}. So the limit exists only on the axes and on the hyperbola ${m('xy = ½')}, a null
  set. Everywhere else ${m(`${frac}(pxy)`)}, as a function of ${m('1/p')}, behaves near 0 as ${m('sin(1/t)')} does near
  ${m('t = 0')}, the textbook discontinuity of the second kind: no limit, not even a jump. For ${m('f = a + b')}, by
  contrast, ${m(`${sub('F', 'p')}(x, y) = ${frac}(x + y)`)} for every ${m('p')}, with one jump of the first kind. Each
  table is finite; the phrase describes the family as ${m('p')} grows, and it says that no smoothness is left for a
  learner to use.</li>
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
  every weight. The training numbers quoted below were measured with AdamW: learning rate ${m('10<sup>−3</sup>')} after a
  linear warmup of 10 steps, betas 0.9 and 0.98, weight decay 1, batch 512, at most 10 000 steps. The source note reports
  the same failure on ${m('a³ + ab')} under both optimizers, and no theorem below depends on the optimizer.</li>
  <li><strong>Readouts and the spectrum.</strong> The network answers by choosing one of ${m('p')} residues, so its table
  can be read through any readout ${m('φ : ℤ/p → ℂ')}, as the kernel ${m(`${sub('K', 'φ')} = [φ(f(a, b))]`)}. The
  spectrum of ${m('f')} under ${m('φ')} is the list of singular values of ${m(sub('K', 'φ'))}. <em>Good</em>: some readout
  concentrates it, at best into rank one. <em>Flat</em>: every readout spreads it out; the peak ${m('κ')} below measures
  how much. With ${m('ψ(x) = e<sup>2πix/p</sup>')}, the table ${m('ψ(a + b) = ψ(a) ψ(b)')} has rank one and nuclear
  norm ${m('p')}, while ${m('ψ(a³ + ab)')} has all ${m('p')} singular values equal to ${m('√p')} and nuclear norm
  ${m('p<sup>3/2</sup>')}: the two extremes for a ${m('p × p')} table with entries of modulus one
  ${lean('Proposition 2')}. The readout matters. Under ${m('ψ')} the product ${m('ab')} is just as flat, every singular
  value ${m('√p')}, yet a faithful multiplicative character ${m('χ')}, extended by ${m('χ(0) = 0')}, turns it into
  ${m('χ(a) χ(b)')}, of rank one ${lean('rank one')}. Likewise ${m('ψ ∘ π<sup>−1</sup>')} turns ${m('π(a + b)')} into
  ${m('ψ(a + b)')}.</li>
  <li><strong>The model M.</strong> A bilinear layer computes ${m('X = U V<sup>ᴴ</sup>')}: row ${m('a')} of the table
  carries the row ${m(sub('U', 'a'))} of ${m('U')}, column ${m('b')} the row ${m(sub('V', 'b'))} of ${m('V')}, and
  ${m(`${sub('X', 'ab')} = ⟨${sub('U', 'a')}, ${sub('V', 'b')}⟩`)}. Weight decay charges ${m('½(‖U‖² + ‖V‖²)')}, and the
  cheapest factorization of ${m('X')} costs exactly ${m(`‖X‖${S1}`)}, the sum of its singular values ${lean('Lemma 1')}.
  M is weight decay at its optimum: given the values of ${m(sub('K', 'φ'))} on ${m('Ω')}, it returns a matrix of least
  nuclear norm among those that agree with them. M <em>recovers</em> ${m('K')} from ${m('Ω')} when ${m('K')} is the only
  one. That training finds M's answer is a modeling step, not a theorem ${heuristic('training ≈ M', L)}.</li>
  </ol></section>`,

  `<section id="proved"><h3>What is proved, for M</h3>
  <p>Each statement of this part is proved in Lean unless its tag says otherwise. First the positive half.</p>
  ${box(`<p><strong>Theorem G</strong> ${lean('G')}. Let ${m('K = u v<sup>T</sup>')}, with ${m('u')} and ${m('v')}
  complex vectors of any lengths, zero entries allowed. M recovers ${m('K')} from ${m('Ω')} if and only if</p><ol>
  <li>${m('Ω')} is rigid on the supports: for all complex ${m(ri)} and ${m(sj)}, if ${m(`${ri} + ${sj} = 0`)} on every
  cell of ${m('Ω')} with ${m(`${ui} ${vj} ≠ 0`)}, then ${m(`${ri} + ${sj} = 0`)} on every cell with
  ${m(`${ui} ${vj} ≠ 0`)}; and</li>
  <li>every set ${m('R')} of rows fits into the set ${m('N(R)')} of columns that it meets in ${m('Ω')}:
  ${m(`‖v‖² Σ<sub>i∈R</sub> |${ui}|²`)} ${m(`≤ ‖u‖² Σ<sub>j∈N(R)</sub> |${vj}|²`)}.</li></ol>
  <p>By the supply–demand theorem (Gale, 1957), also proved in Lean, the second condition says that ${m('Ω')} carries a
  transport plan from the masses ${m(`‖v‖² |${ui}|²`)} to the masses ${m(`‖u‖² |${vj}|²`)}.</p>`)}
  <p>Rigidity is connectivity: the cells of ${m('Ω')} with ${m(`${ui} ${vj} ≠ 0`)}, as edges between rows and columns,
  connect all the nonzero rows and columns ${hand('graphs', L)}. Without it M cannot single ${m('K')} out: multiplying the
  rows of one connected piece by a phase and its columns by the opposite phase gives a second matrix with the same values
  on ${m('Ω')} and the same nuclear norm. The second condition fails exactly when some rows hold more mass than their
  columns can take; then the block that they miss can be lowered at a profit. Neither condition mentions continuity: they
  see only which cells are kept and the moduli ${m(`|${ui}|`)} and ${m(`|${vj}|`)}. For a square table with entries of
  modulus one the second condition is Hall's, and says that ${m('Ω')} contains the graph of a permutation (Theorem E).
  Hence:</p><ul>
  <li>two diagonals ${m('b − a ∈ {c₁, c₂}')} with ${m('c₁ ≠ c₂')}, ${m('2p')} of the ${m('p²')} cells, recover
  ${m('ψ(a + b)')}, and one diagonal does not ${lean('D.5, D.6, D.8')};</li>
  <li>the cross, row 0 with column 0, is rigid and determines ${m('ψ(a + b)')} among the tables of rank one, yet for
  ${m('p ≥ 3')} M returns a table of nuclear norm ${m('2√(p − 1) < p')} ${lean('D.9')};</li>
  <li>for ${m('χ(ab)')} the zero row and the zero column need no observed cell: M recovers it exactly when the cells of
  ${m('Ω')} with ${m('a, b ≠ 0')} connect the nonzero rows and columns and contain a permutation of them
  ${hand('G and Hall', L)}.</li></ul>
  <p>Then the negative half.</p>
  ${box(`<p><strong>Theorem A</strong> ${lean('A')}. Let ${m('K')} be invertible, with polar factor
  ${m('W = K (K<sup>ᴴ</sup>K)<sup>−1/2</sup>')}. Then ${m('K')} has the least nuclear norm among the matrices equal to
  ${m('K')} on ${m('Ω')} if and only if ${m('W')} vanishes off ${m('Ω')}.</p>`)}
  <p>For ${m('ψ(a³ + ab)')}, ${m('W = K/√p')} has no zero entry, so M recovers it from no proper ${m('Ω')}. With a single
  cell hidden, M fills in ${m(`−${sub('K', 'ab')}`)}, which decodes to ${m('f + (p ± 1)/2')} and never to ${m('f')}; for
  ${m('ψ(a + b)')} it fills in ${m(sub('K', 'ab'))} ${lean('Corollary')}.</p>
  ${box(`<p><strong>Theorem C</strong> ${lean('C')}. Let ${m('f = P(a) + ab')}, with ${m('P')} a polynomial of degree
  ${m('m')} over ${m('ℤ/p')}; let ${m('ρ : ℤ/p → ℂ')} be any readout, ${m(`(${Kr} h)(a) = Σ<sub>b</sub> ρ(f(a, b)) h(b)`)},
  and let ${m('h')} be centered, ${m('Σ<sub>b</sub> h(b) = 0')}. Then ${m(`‖${Kr} h‖² ≤ (p − 1) ‖ρ‖² ‖h‖²`)}, and some
  ${m('ρ')} and ${m('h')} reach equality when ${m('m ≤ 1')}. When ${m('m ≥ 2')},
  ${m(`‖${Kr} h‖² ≤ λ ‖ρ‖² ‖h‖²`)} with ${m(`λ = 1 + ${root}`)}, which is smaller as soon as ${m('λ < p − 1')}.</p>`)}
  <p>So the normalized peak ${m(`‖${Kr} h‖² / ((p − 1) ‖ρ‖² ‖h‖²)`)} reaches 1 when ${m('deg P ≤ 1')} and is at most
  ${m('λ/(p − 1) ≈ √(2(m − 1)/p)')} when ${m('deg P ≥ 2')}, whatever the readout: 0.215 for
  ${m('a³ + ab')} at ${m('p = 97')}. For readouts of modulus one, the share of the whole table that one centered mode
  carries, the peak ${m('κ')} measured below, is at most ${m('λ/p')}: 0.213 for ${m('a³ + ab')} at
  ${m('p = 97')} ${lean('C.5')}. The polynomials ${m('a + ab')} and ${m('a² + ab')}, both of total degree two, fall on
  opposite sides.</p>
  ${box(`<p><strong>Theorem B</strong> ${lean('B')}. Write ${m('a³ + ab')} as two steps, ${m('z = ab')} and then
  ${m('f = a³ + z')}. Each step has rank one in its own characters: ${m('χ(ab) = χ(a) χ(b)')} for a multiplicative
  ${m('χ')}, and ${m(`${sub('ψ', 'r')}(a³ + z) = ${sub('ψ', 'r')}(a³) ${sub('ψ', 'r')}(z)`)} with
  ${m(`${sub('ψ', 'r')}(x) = ψ(rx)`)}. The two families of characters are nearly unbiased: for nontrivial ${m('χ')} and
  ${m('r ≠ 0')} their inner products are Gauss sums, of modulus ${m('√p')}. And the labels hide the first step: for
  ${m('r ≠ 0')} and ${m('(a, b)')} uniform, ${m(`‖E[${sub('ψ', 'r')}(ab) | f]‖² ≤ 9/(2p) + 8/p<sup>3/2</sup>`)}, so no
  function of the label of norm one correlates with ${m(`${sub('ψ', 'r')}(ab)`)} by more than
  ${m('O(p<sup>−1/2</sup>)')}.</p>`)}
  <p>The same holds for every ${m('P(a) + ab')} with ${m('1 ≤ deg P < p')}, with ${m('O(m²/p)')} in place of
  ${m('O(1/p)')} ${lean('B for every P')}. The proof needs Weil's bound ${m('|Σ<sub>x</sub> ψ(rP(x))| ≤ (m − 1)√p')}
  for ${m('r ≠ 0')}, and its analogues for multiplicative characters. Lean proves them by Stepanov's method: every
  reciprocal root ${m('ω')} of the numerator of the zeta function of the curve ${m('y<sup>p</sup> − y = rP(x)')}, or of
  ${m('y<sup>d</sup> = c − P(x)')}, has ${m('|ω| ≤ √p')}. With the functional equation this is the Riemann hypothesis
  for these curves, which Weil proved for every curve over a finite field (1948); Lean has only the cases that Theorem B
  uses ${lean('Weil')}.</p></section>`,

  `<section id="refined"><h3>The statement, refined</h3>
  ${box(`<p>For M, the convex model of weight decay, the statement becomes a theorem with two halves.</p><ol>
  <li><strong>Rank one under some readout: the cells decide.</strong> If some readout turns the table of ${m('f')} into
  ${m('u v<sup>T</sup>')}, M recovers it from ${m('Ω')} exactly when ${m('Ω')} is rigid on the supports and every set of
  rows fits into the columns it meets (Theorem G). Discontinuity plays no role; only the readout table and the cells do.
  Two diagonals recover ${m('ψ(a + b)')}, and with it ${m('π(a + b)')} read through ${m('ψ ∘ π<sup>−1</sup>')}; the
  network's own training halves recover ${m('ψ(a + b)')}, ${m('χ(ab)')} and ${m('χ(a + ab)')}, their two conditions
  checked by computer.</li>
  <li><strong>Flat: no part is enough.</strong> A table with no zero entry and all singular values equal, such as
  ${m('ψ(a³ + ab)')}, is recovered from no proper ${m('Ω')} (Theorem A). In the family ${m('P(a) + ab')}, one mode of a
  readout table carries everything when ${m('deg P ≤ 1')}; when ${m('deg P ≥ 2')}, under every readout, no centered mode
  carries more than ${m('λ/(p − 1) ≈ √(2(m − 1)/p)')} of that, where ${m(`λ = 1 + ${root}`)}; the share tends to 0 as
  ${m('p')} grows (Theorem C). And the intermediate step that would split ${m('a³ + ab')} into two steps of rank one is invisible in the
  labels (Theorem B).</li></ol>
  <p>For the network both halves are measured, not proved: it learns from a random half the tasks whose table some
  readout concentrates, and fails on those that no readout concentrates. A strong mode that carries only part of the
  answer teaches only that part (below).</p>`)}</section>`,

  `<section id="measured"><h3>What is measured</h3><ul>
  <li><strong>M on the network's own data.</strong> At ${m('p = 31, 61, 97')} the training halves of seeds 7 and 11
  meet both conditions of Theorem G for ${m('ψ(a + b)')}, ${m('χ(ab)')} and ${m('χ(a + ab) = χ(a) χ(1 + b)')}. ADMM
  recovers all three from them with relative error below ${m('10<sup>−10</sup>')}, the zero row and column of the
  ${m('χ')} tables included, and decodes every unseen cell. On the same halves ${m('ψ(a³ + ab)')} fails, with relative
  error 1.29 to 1.30 ${numerical('ADMM', L)}.</li>
  <li><strong>Every small pattern.</strong> All 511 proper patterns of a ${m('3 × 3')} table with equal weights, 510 with
  random weights, and about 12 000 patterns of tables up to ${m('3 × 4')} with zero entries: every class behaves as
  Theorems E, F and G say ${numerical('ADMM', L)}.</li>
  <li><strong>The network.</strong> The peak of a task is the largest share of its table that one centered interaction
  mode carries under a readout of modulus one:
  ${eq('κ = max |Σ<sub>a,b</sub> ρ(f(a, b)) g(a) h(b)|² / p²')}
  over ${m('|ρ| = 1')} and unit vectors ${m('g, h')} with sum zero. It is found by alternating maximization from 320
  starts, so each value is the best one found. Over 22 tasks at ${m('p = 97')}, it lies between 0.28 and 1 for the seven
  tasks below that learn, and does not fall as ${m('p')} grows; for the flat tasks it is at most 0.106, near the 0.069 of
  a random table, and falls roughly like ${m('1/p')}: 0.142, 0.106 and 0.057 for ${m('a³ + ab')} at
  ${m('p = 47, 97, 199')}, under Theorem C's ceiling of 0.213 at ${m('p = 97')}. Ten trainings were predicted from
  ${m('κ')} before they ran, and all ten came out as predicted: ${m('a² + ab')}, ${m('a² + ab + b² + a')} and
  ${m('a³ + ab² + b')} stay at 1 to 2% on the unseen half, as do the controls ${m('a³ + ab')} and ${m('a² + ab + b²')},
  while ${m('ab')}, ${m('a²b')}, ${m('a + ab')}, ${m('(a + b)²')}, ${m('π(a + b)')}, ${m('a³ + b')} and
  ${m('(a + b)³')} reach 99% within 1000 to 3000 steps, with both seeds ${numerical('training', L)}.</li></ul></section>`,

  `<section id="unproved"><h3>What is not proved</h3><ul>
  <li><strong>That training finds M's answer.</strong> It is the one step between the theorems about M and the network
  ${heuristic('training ≈ M', L)}.</li>
  <li><strong>That a strong mode suffices for the network.</strong> It does not, in this form. For
  ${m('2⌊(a³ + ab)/2⌋ + (a + b <span class="op">mod</span> 2)')} the peak ${m('κ = 0.98')} comes from the parity of the
  answer alone; without that mode it is 0.094. The network predicts the parity on 79 to 80% of the unseen half and the
  answer itself on 2.3 to 2.7%, about the ${m('2/p')} of guessing the rest: it learns what the peak carries and nothing of
  the flat remainder ${numerical('training', L)}.</li>
  <li><strong>Rank above one.</strong> For a table whose best readout has rank ${m('r ≥ 2')}, no criterion like
  Theorem G is proved ${open('rank r', L)}.</li>
  <li><strong>Flat tasks outside the family.</strong> For ${m('a² + ab + b²')}, ${m('a² + ab + b² + a')} and
  ${m('a³ + ab² + b')} the peak is small only numerically; no ceiling like Theorem C's is proved
  ${open('ceiling on κ', L)}. The effective rank ${m(`(‖K‖${S1}/‖K‖<sub>S2</sub>)²`)} is no substitute for the peak:
  its least value over readouts of ${m('a³ + ab')} comes from the indicator of the answer 0, and M completes that table
  from no fraction of its cells up to 99% ${numerical('ADMM', L)}.</li>
  <li><strong>Real readouts of a flat table.</strong> The real kernels ${m('cos(2πrf/p)')} and ${m('sin(2πrf/p)')} of
  ${m('f = a³ + ab')} are singular, so Theorem A says nothing about them. Numerically M decodes the hidden cells whose
  mirror ${m('(−a, b)')} is seen, about half of them, through the symmetry ${m('f(−a, b) = −f(a, b)')}
  ${numerical('ADMM', L)}.</li></ul>
  <p class="sub">Source: <code>review/flat_spectrum.md</code> in the transformer repository. Lean:
  <code>Transformer.Grokking.FlatSpectrum</code> and <code>Transformer.Weil</code>.</p></section>`,
].join('\n');

export const en: HomeText = {
  nav: 'Course',
  title: 'What can a network learn from half a table?',
  kicker: 'A course on spectra and learning',
  lead: `Take a function of two numbers modulo a prime ${m('p')}, say ${m('ab <span class="op">mod</span> p')}. Put it on the unit square,
    ${m('x = a/p')} and ${m('y = b/p')}: it becomes ${m(`${frac}(pxy)`)}, which, as ${m('p')} grows, has a limit only on a
    null set: a discontinuity of the second kind almost everywhere. A network sees half of the ${m('p²')} values and must
    give the rest. The course works toward one statement:`,
  statement: 'A neural network can learn a function with discontinuities of the second kind from an incomplete set of observations, if the function has a good spectrum.',
  precise: `<p>Every word of it is made precise on the way:</p><ul>
    <li><strong>the function</strong>: ${m('f(a, b)')} on ${m('ℤ/p × ℤ/p')}, read as a ${m('p × p')} table;</li>
    <li><strong>the observations</strong>: a random half of the table;</li>
    <li><strong>the network</strong>: one embedding shared by both operands and the readout, a 90° rotation of the second
    operand, Peri-LN with RMSNorm and a SwiGLU block, trained by Schedule-Free AdamW;</li>
    <li><strong>a good spectrum</strong>: some readout of the answer turns the table into one with a strong singular
    direction. A flat spectrum has none, under any readout.</li></ul>`,
  fullTitle: 'The statement in full',
  full,
  endsTitle: 'The two ends',
  ends: [
    {title: 'The hardest it learns', body: `A random permutation of ${m('a + b')}, or the product ${m('ab')}: each table looks
      like noise, yet one readout turns it into a rank-one table, ${m('ψ(a) ψ(b)')} for the first and ${m('χ(a) χ(b)')}
      for the second, with ${m('χ')} a multiplicative character ${lean('rank one')}. The network reaches 99% on the unseen
      half ${numerical('training', 'en')}.`},
    {title: 'The simplest it cannot', body: `${m('a² + ab')}, a polynomial of degree two. Under every readout its table is
      flat ${lean('Theorem C')}, and on the unseen half the network stays at the level of guessing
      ${numerical('training', 'en')}.`},
    {title: 'The boundary', body: `In the family ${m('P(a) + ab')} the line falls exactly between degree one and degree two:
      ${m('a + ab')} learns, ${m('a² + ab')} does not. The spectral side is proved ${lean('C.4')}. The step from the spectrum
      to training is not a theorem; ten predictions made from the spectrum before training all held
      ${heuristic('spectrum → training', 'en')}.`},
  ],
  audienceTitle: 'Who this is for',
  audience: `Students who know analysis up to complex analysis: limits and continuity, Fourier series, ${m('e<sup>iθ</sup>')},
    matrices and eigenvalues. No group theory and no machine learning are assumed; the pages introduce both as they go.`,
  legend: legendOf([['Lean', 'proved in Lean'], ['by hand', 'proved on paper only'], ['numerical', 'measured'], ['to prove', 'open'], ['heuristic', 'a modeling step, not a theorem']]),
  pagesTitle: 'The pages',
  writing: 'being written',
};
