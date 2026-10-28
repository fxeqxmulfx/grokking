/** The home page in French. */

import {heuristic, lean, m, numerical} from '../markup.ts';
import {legendOf, type HomeText} from './spec.ts';

export const fr: HomeText = {
  nav: 'Cours',
  title: 'Que peut apprendre un réseau à partir de la moitié d’une table ?',
  kicker: 'Un cours sur les spectres et l’apprentissage',
  lead: `Prenez une fonction de deux nombres modulo un nombre premier ${m('p')}, par exemple ${m('ab <span class="op">mod</span> p')}. Placez-la sur
    le carré unité, ${m('x = a/p')} et ${m('y = b/p')} : elle devient ${m('<span class="op">frac</span>(pxy)')}, qui n’a de limite en aucun point
    quand ${m('p')} grandit, une discontinuité de seconde espèce partout. Un réseau voit la moitié des ${m('p²')} valeurs et
    doit donner le reste. Le cours mène à un seul énoncé :`,
  statement: 'Un réseau de neurones peut apprendre une fonction à discontinuités de seconde espèce à partir d’un ensemble incomplet d’observations, si la fonction a un bon spectre.',
  precise: `<p>Chacun de ses mots est précisé en chemin :</p><ul>
    <li><strong>la fonction</strong> : ${m('f(a, b)')} sur ${m('ℤ/p × ℤ/p')}, lue comme une table ${m('p × p')} ;</li>
    <li><strong>les observations</strong> : une moitié de la table tirée au hasard ;</li>
    <li><strong>le réseau</strong> : un plongement, une rotation de 90°, Peri-LN avec RMSNorm et un bloc SwiGLU, entraîné
    par Schedule-Free AdamW ;</li>
    <li><strong>un bon spectre</strong> : une lecture de la réponse change la table en une table à forte direction
    singulière. Un spectre plat n’en a aucune, quelle que soit la lecture.</li></ul>`,
  endsTitle: 'Les deux bouts',
  ends: [
    {title: 'La plus difficile qu’il apprend', body: `Une permutation aléatoire de ${m('a + b')}, ou le produit ${m('ab')} :
      chaque table ressemble à du bruit et est partout discontinue, mais une lecture la change en une table de rang un,
      ${m('ψ(a) ψ(b)')} pour la première et ${m('χ(a) χ(b)')} pour la seconde, où ${m('χ')} est un caractère multiplicatif
      ${lean('rang un')}. Le réseau atteint 99 % sur la moitié non vue ${numerical('entraînement', 'fr')}.`},
    {title: 'La plus simple qu’il n’apprend pas', body: `${m('a² + ab')}, un polynôme de degré deux. Pour toute lecture, sa
      table est plate ${lean('théorème C')}, et sur la moitié non vue le réseau reste au niveau du hasard
      ${numerical('entraînement', 'fr')}.`},
    {title: 'La frontière', body: `Dans la famille ${m('P(a) + ab')}, la limite passe exactement entre le degré un et le
      degré deux : ${m('a + ab')} s’apprend, ${m('a² + ab')} non. Le côté spectral est démontré ${lean('C.4')}. Le passage du
      spectre à l’entraînement n’est pas un théorème ; dix prédictions faites à partir du spectre avant l’entraînement se
      sont toutes vérifiées ${heuristic('spectre → entraînement', 'fr')}.`},
  ],
  audienceTitle: 'Pour qui',
  audience: `Pour les étudiants qui connaissent l’analyse jusqu’à l’analyse complexe : limites et continuité, séries de
    Fourier, ${m('e<sup>iθ</sup>')}, matrices et valeurs propres. Ni la théorie des groupes ni l’apprentissage automatique ne
    sont supposés : les pages introduisent l’une et l’autre en chemin.`,
  legend: legendOf([['Lean', 'démontré en Lean'], ['à la main', 'démontré sur papier seulement'], ['numérique', 'mesuré'], ['à démontrer', 'ouvert'], ['heuristique', 'une étape de modélisation, pas un théorème']]),
  pagesTitle: 'Les pages',
  writing: 'en cours d’écriture',
};
