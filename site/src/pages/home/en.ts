/** The home page in English. */

import {heuristic, lean, m, numerical} from '../markup.ts';
import {legendOf, type HomeText} from './spec.ts';

export const en: HomeText = {
  nav: 'Course',
  title: 'What can a network learn from half a table?',
  kicker: 'A course on spectra and learning',
  lead: `Take a function of two numbers modulo a prime ${m('p')}, say ${m('ab <span class="op">mod</span> p')}. Put it on the unit square,
    ${m('x = a/p')} and ${m('y = b/p')}: it becomes ${m('<span class="op">frac</span>(pxy)')}, which has no limit at any point as ${m('p')} grows,
    a discontinuity of the second kind everywhere. A network sees half of the ${m('p²')} values and must give the rest.
    The course works toward one statement:`,
  statement: 'A neural network can learn a function with discontinuities of the second kind from an incomplete set of observations, if the function has a good spectrum.',
  precise: `<p>Every word of it is made precise on the way:</p><ul>
    <li><strong>the function</strong>: ${m('f(a, b)')} on ${m('ℤ/p × ℤ/p')}, read as a ${m('p × p')} table;</li>
    <li><strong>the observations</strong>: a random half of the table;</li>
    <li><strong>the network</strong>: an embedding, a 90° rotation, Peri-LN with RMSNorm and a SwiGLU block, trained by
    Schedule-Free AdamW;</li>
    <li><strong>a good spectrum</strong>: some readout of the answer turns the table into one with a strong singular
    direction. A flat spectrum has none, under any readout.</li></ul>`,
  endsTitle: 'The two ends',
  ends: [
    {title: 'The hardest it learns', body: `A random permutation of ${m('a + b')}, or the product ${m('ab')}: each table looks
      like noise and is discontinuous everywhere, yet one readout turns it into a rank-one table, ${m('ψ(a) ψ(b)')} for the
      first and ${m('χ(a) χ(b)')} for the second, with ${m('χ')} a multiplicative character ${lean('rank one')}. The network
      reaches 99% on the unseen half ${numerical('training', 'en')}.`},
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
