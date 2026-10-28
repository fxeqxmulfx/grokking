/** The home page in French. */

import {box, eq, hand, heuristic, lean, leanNames, m, numerical, open, S1} from '../markup.ts';
import {FULL_LEAN, frac, Kr, legendOf, ri, root, sj, sub, ui, vj, type HomeText} from './spec.ts';

const L = 'fr';

/** The terms of the statement, each made exact. */
const terms = `<ul class="terms">
  <li><strong>Table.</strong> Une matrice ${m('K')} de taille ${m('N × N')} à coefficients complexes, ${m('N ≥ 1')}, dont
  les lignes ${m('a')} et les colonnes ${m('b')} sont numérotées ${m('0, …, N − 1')} ; son coefficient ${m(sub('K', 'ab'))}
  occupe la case ${m('(a, b)')}. Un ensemble ${m('Ω')} de cases est <em>incomplet</em> s’il ne contient pas les
  ${m('N²')} cases : au moins un coefficient est caché.</li>
  <li><strong>La pénalité sur les poids à son optimum.</strong> Écrivez une matrice sous la forme
  ${m('X = U V<sup>ᴴ</sup>')}, où ${m('U')} et ${m('V')} ont ${m('N')} lignes et un nombre quelconque de colonnes, au coût
  ${m('½(‖U‖² + ‖V‖²)')}, où ${m('‖U‖²')} est la somme des carrés des modules des coefficients de ${m('U')} : c’est la
  pénalité sur les poids d’une couche bilinéaire. Parmi les factorisations, d’un nombre quelconque de colonnes, telles que
  ${m('X = K')} sur ${m('Ω')}, les optimales sont celles de moindre coût. La pénalité sur les poids à son optimum
  <em>retrouve</em> ${m('K')} à partir de ${m('Ω')} quand au moins une factorisation est optimale et que toute
  factorisation optimale a pour produit ${m('K')}. Les produits des factorisations optimales sont exactement les matrices
  de plus petite norme nucléaire ${m(`‖X‖${S1}`)}, la somme des valeurs singulières, parmi celles qui égalent ${m('K')} sur
  ${m('Ω')} ${lean('lemme 1')}. Retrouver ${m('K')} veut donc dire que ${m('K')}, et aucune autre matrice, a la plus petite
  norme nucléaire parmi elles : c’est le modèle M du cours, et la forme sous laquelle Lean énonce les théorèmes
  ci-dessous.</li>
  <li><strong>Rang 1, plate.</strong> ${m('K')} est de rang 1 quand ${m('K = u v<sup>T</sup>')} pour des vecteurs
  ${m('u')} et ${m('v')} non nuls. ${m('K')} est plate quand ses ${m('N')} valeurs singulières sont toutes égales.</li>
  <li><strong>Relier, contenir une permutation.</strong> Dessinez les ${m('N')} lignes et les ${m('N')} colonnes comme
  ${m('2N')} points, et chaque case ${m('(a, b)')} de ${m('Ω')} comme une arête de la ligne ${m('a')} à la colonne
  ${m('b')}. Les cases de ${m('Ω')} relient les lignes aux colonnes quand ce graphe est connexe. Elles contiennent une
  permutation quand une bijection ${m('σ')} des lignes sur les colonnes vérifie ${m('(a, σ(a)) ∈ Ω')} pour toute ligne
  ${m('a')}.</li></ul>`;

/** The full statement: every term, what is proved for M, what is measured, what is not proved. */
const full = [
  `<p>Cette partie donne chaque définition en entier, les théorèmes pour les tables de rang 1 à coefficients de modules
  quelconques, les théorèmes sur des familles de tâches, ce qui est mesuré et ce qui n’est pas démontré. Les pages
  suivantes établissent chaque morceau pas à pas.</p>`,

  `<section id="setting"><h3>Le cadre</h3><ol class="terms">
  <li><strong>Tâches et tables.</strong> ${m('p')} est un nombre premier. Une tâche est une application
  ${m('f : ℤ/p × ℤ/p → ℤ/p')}. Une lecture est une application ${m('φ : ℤ/p → ℂ')}, et la table de ${m('f')} pour
  ${m('φ')} est la matrice ${m('p × p')} ${m(`${sub('K', 'φ')} = [φ(f(a, b))]`)}. Les lectures employées sont
  ${m(`${sub('ψ', 'r')}(x) = e<sup>2πirx/p</sup>`)}, avec ${m(`ψ = ${sub('ψ', '1')}`)}, et les caractères multiplicatifs
  ${m('χ')} de ${m('ℤ/p')}, prolongés par ${m('χ(0) = 0')} : ${m('|χ(x)| = 1')} pour ${m('x ≠ 0')} et
  ${m('χ(xy) = χ(x) χ(y)')}. Le cours suit ${m('a + b')}, ${m('ab')}, ${m('π(a + b)')} pour une permutation aléatoire
  ${m('π')} de ${m('ℤ/p')}, et la famille ${m('P(a) + ab')} où ${m('P')} est un polynôme.</li>
  <li><strong>Discontinuités de seconde espèce.</strong> Placez la table sur le carré unité :
  ${m(`${sub('F', 'p')}(x, y) = f(a, b)/p`)} en ${m('x = a/p')} et ${m('y = b/p')}. Pour ${m('f = ab')}, c’est
  ${m(`${sub('F', 'p')}(x, y) = ${frac}(pxy)`)} ; sur tout le carré, ${m(`${frac}(pxy)`)} saute le long des
  ${m('p − 1')} hyperboles ${m('pxy = 1, …, p − 1')}. Quand ${m('p')} parcourt les nombres premiers, ${m(`${frac}(pxy)`)}
  converge exactement là où ${m('2xy')} est entier. Si ${m('2xy')} est entier, ${m(`${frac}(pxy) = ${frac}(xy)`)} pour
  tout ${m('p')} impair. Pour ${m('xy')} rationnel de dénominateur réduit ${m('q ≥ 3')}, ${m(`${frac}(pxy)`)} prend une
  infinité de fois chacune des valeurs ${m('k/q')} avec ${m('0 < k < q')} et ${m('k')} premier avec ${m('q')}, qui sont
  au moins deux, par le théorème de Dirichlet sur les nombres premiers en progression arithmétique
  ${lean('Dirichlet')}. Pour ${m('xy')} irrationnel, ses valeurs sont équiréparties dans ${m('[0, 1)')} (Vinogradov)
  ${hand('Vinogradov', L)}. La limite n’existe donc que sur les axes et sur l’hyperbole ${m('xy = ½')}, un ensemble de
  mesure nulle ${lean('mesure nulle')}, et partout ailleurs ${m(`t ↦ ${frac}(xy/t)`)}, sur les points ${m('t = 1/p')},
  n’a pas de limite en ${m('t = 0')} : une discontinuité de seconde espèce. Pour ${m('f = a + b')}, au contraire,
  ${m(`${sub('F', 'p')}(x, y) = ${frac}(x + y)`)} pour tout ${m('p')}, avec un seul saut, de première espèce, le long de
  ${m('x + y = 1')}. Chaque table est finie ; l’expression décrit la famille quand ${m('p')} grandit.${leanNames(FULL_LEAN.discontinuity)}</li>
  <li><strong>Observations.</strong> Un ensemble ${m('Ω ⊆ ℤ/p × ℤ/p')} de cases dont les valeurs sont montrées. À
  l’entraînement, ${m('Ω')} est une moitié aléatoire : les ${m('p²')} couples sont mélangés (SplitMix64, graines 7 et 11)
  et les ${m('⌊p²/2⌋')} premiers sont gardés, soit 4704 des 9409 cases pour ${m('p = 97')}. Les théorèmes admettent tout
  ${m('Ω')}.</li>
  <li><strong>Apprendre.</strong> Atteindre au moins 99 % de réponses justes sur les cases hors de ${m('Ω')}, la moitié non
  vue. Le hasard donne ${m('1/p')}, environ 1 % pour ${m('p = 97')}.</li>
  <li><strong>Le réseau.</strong> Une seule table ${m('E ∈ ℝ<sup>p×128</sup>')} plonge les deux opérandes et sert aussi à
  lire la réponse : le plongement est partagé. ${m('J')} tourne de 90° chaque paire de canaux de ${m(sub('E', 'b'))},
  ${m('(x₁, x₂) ↦ (−x₂, x₁)')}, pour que l’entrée distingue ${m('(a, b)')} de ${m('(b, a)')}. ${m('n')} est RMSNorm sans
  paramètres ; elle agit sur l’entrée, des deux côtés du bloc (Peri-LN) et avant la lecture :
  ${eq(`x = n(${sub('E', 'a')} + J ${sub('E', 'b')}), &nbsp; x ← x + n(SwiGLU(n(x))), &nbsp; logits = n(x) E<sup>T</sup>,`)}
  avec ${m('SwiGLU(x)')} ${m(`= (SiLU(x ${sub('W', 'g')}) ⊙ x ${sub('W', 'v')}) ${sub('W', 'o')}`)}, 341 unités cachées, un seul
  bloc et aucun biais. La perte est l’entropie croisée de la réponse ; l’optimiseur est Schedule-Free AdamW, avec la
  pénalité sur tous les poids. Les chiffres d’entraînement cités ici ont été mesurés avec AdamW : taux d’apprentissage
  ${m('10<sup>−3</sup>')} après un échauffement linéaire de 10 pas, bêtas 0,9 et 0,98, pénalité 1, lots de 512, au plus
  10 000 pas. La note source rapporte le même échec sur ${m('a³ + ab')} avec les deux optimiseurs, et aucun théorème ici
  ne dépend de l’optimiseur.</li>
  <li><strong>Le modèle M.</strong> Une couche bilinéaire calcule ${m('X = U V<sup>ᴴ</sup>')} : la ligne ${m('a')} de la
  table porte la ligne ${m(sub('U', 'a'))} de ${m('U')}, la colonne ${m('b')} la ligne ${m(sub('V', 'b'))} de ${m('V')},
  et ${m(`${sub('X', 'ab')} = ⟨${sub('U', 'a')}, ${sub('V', 'b')}⟩`)}. La pénalité sur les poids coûte
  ${m('½(‖U‖² + ‖V‖²)')}, et la factorisation la moins chère de ${m('X')} coûte exactement ${m(`‖X‖${S1}`)}
  ${lean('lemme 1')}. Les factorisations optimales telles que ${m('X = K')} sur ${m('Ω')} ont donc pour produits
  exactement les matrices de plus petite norme nucléaire telles que ${m('X = K')} sur ${m('Ω')}, et la pénalité sur les
  poids à son optimum retrouve ${m('K')} exactement quand ${m('K')}, et aucune autre matrice, a la plus petite norme
  nucléaire parmi elles ${lean('lemme 1, optimum')}. M rend ces matrices. Que l’entraînement les atteigne est une étape
  de modélisation, pas un théorème ${heuristic('entraînement ≈ M', L)}.</li>
  </ol></section>`,

  `<section id="proved"><h3>Ce qui est démontré, pour M</h3>
  <p>Chaque énoncé de cette partie est démontré en Lean, sauf si son étiquette dit autre chose. D’abord les tables de
  rang 1 à coefficients de modules quelconques.</p>
  ${box(`<p><strong>Théorème G</strong> ${lean('G')}. Soit ${m('K = u v<sup>T</sup>')}, où ${m('u')} et ${m('v')} sont des
  vecteurs complexes de longueurs quelconques, coefficients nuls permis. M retrouve ${m('K')} à partir de ${m('Ω')} si et
  seulement si</p><ol>
  <li>${m('Ω')} est rigide sur les supports : pour tous ${m(ri)} et ${m(sj)} complexes, si ${m(`${ri} + ${sj} = 0`)} sur
  chaque case de ${m('Ω')} où ${m(`${ui} ${vj} ≠ 0`)}, alors ${m(`${ri} + ${sj} = 0`)} sur chaque case où
  ${m(`${ui} ${vj} ≠ 0`)} ; et</li>
  <li>tout ensemble ${m('R')} de lignes tient dans l’ensemble ${m('N(R)')} des colonnes qu’il rencontre dans ${m('Ω')} :
  ${m(`‖v‖² Σ<sub>i∈R</sub> |${ui}|²`)} ${m(`≤ ‖u‖² Σ<sub>j∈N(R)</sub> |${vj}|²`)}.</li></ol>
  <p>Par le théorème de l’offre et de la demande (Gale, 1957), démontré lui aussi en Lean, la seconde condition dit que
  ${m('Ω')} porte un plan de transport des masses ${m(`‖v‖² |${ui}|²`)} vers les masses
  ${m(`‖u‖² |${vj}|²`)}.</p>${leanNames(FULL_LEAN.g)}`)}
  <p>Quand ${m('u ≠ 0')} et ${m('v ≠ 0')}, la première condition dit que les cases de ${m('Ω')} où
  ${m(`${ui} ${vj} ≠ 0`)}, vues comme des arêtes entre lignes et colonnes, relient les lignes où ${m(`${ui} ≠ 0`)} aux
  colonnes où ${m(`${vj} ≠ 0`)} ${lean('connexité')}. Sans elle, multiplier les lignes d’une composante connexe par une
  phase ${m('e<sup>iθ</sup> ≠ 1')} et ses colonnes par ${m('e<sup>−iθ</sup>')} donne une seconde matrice de rang 1, de
  mêmes valeurs sur ${m('Ω')} et de même norme nucléaire. Sans la seconde condition, une matrice égale à ${m('K')} sur
  ${m('Ω')} a une norme nucléaire plus petite que celle de ${m('K')}. Aucune des deux conditions ne parle de continuité :
  elles ne voient que les cases gardées et les modules ${m(`|${ui}|`)} et ${m(`|${vj}|`)}. Pour une table carrée à
  coefficients de module 1, la seconde condition est celle de Hall, et dit que ${m('Ω')} contient une permutation : cela
  donne le théorème 2, le théorème E de la note source. D’où :</p><ul>
  <li>deux diagonales ${m('b − a ∈ {c₁, c₂}')} avec ${m('c₁ ≠ c₂')}, ${m('2p')} des ${m('p²')} cases, retrouvent
  ${m('[ψ(a + b)]')}, et une seule diagonale ne la retrouve pas ${lean('D.5, D.6, D.8')} ;${leanNames(FULL_LEAN.diagonals)}</li>
  <li>la croix, ligne 0 et colonne 0, est rigide et détermine ${m('[ψ(a + b)]')} parmi les tables de rang 1, et pourtant,
  pour ${m('p ≥ 3')}, la plus petite norme nucléaire des matrices qui lui sont égales sur la croix est
  ${m('2√(p − 1) < p')} ${lean('D.9')} ;${leanNames(FULL_LEAN.cross)}</li>
  <li>pour ${m('[χ(ab)]')}, la ligne ${m('a = 0')} et la colonne ${m('b = 0')} n’ont besoin d’aucune case : M la retrouve
  exactement quand les cases de ${m('Ω')} où ${m('a, b ≠ 0')} relient les lignes non nulles aux colonnes non nulles et
  contiennent une permutation des résidus non nuls ; pour ${m('[χ(a + ab)] = [χ(a) χ(1 + b)]')}, il en va de même avec
  les colonnes ${m('b ≠ −1')} au lieu de ${m('b ≠ 0')}, et une bijection des lignes ${m('a ≠ 0')} sur elles au lieu de la
  permutation ${lean('G et Hall')}.${leanNames(FULL_LEAN.characters)}</li></ul>
  <p>L’échec a une marge. Soit ${m('K')} une table ${m('N × N')} de rang 1 à coefficients de module 1, de sorte que
  ${m(`‖K‖${S1} = N`)}. Si ${m('Ω')} ne contient aucune permutation, une matrice égale à ${m('K')} sur ${m('Ω')} a une
  norme nucléaire d’au plus ${m('√(N² − 1) < N − 1/(2N)')}. Soit ${m('k + l = N + 1')} avec ${m('k ≤ l ≤ k + 1')}.
  Pour chaque ${m('Ω')} sans permutation, une matrice égale à ${m('K')} sur ${m('Ω')} a une norme nucléaire d’au plus
  ${m('√(k (k − 1)) + √(l (l − 1))')}, et pour l’un d’eux c’est la plus petite norme nucléaire des matrices égales à
  ${m('K')} sur ${m('Ω')} : ${m('√(N² − 1)')} pour ${m('N')} impair, ${m('√2 + √6')} pour ${m('N = 4')}
  ${lean('marge d’échec')}.</p>${leanNames(FULL_LEAN.margin)}
  <p>Puis les tables plates.</p>
  ${box(`<p><strong>Théorème A</strong> ${lean('A')}. Soit ${m('K')} inversible, de facteur polaire
  ${m('W = K (K<sup>ᴴ</sup>K)<sup>−1/2</sup>')}. Alors ${m('K')} a la plus petite norme nucléaire parmi les matrices égales
  à ${m('K')} sur ${m('Ω')} si et seulement si ${m('W')} s’annule hors de ${m('Ω')}.</p>${leanNames(FULL_LEAN.a)}`)}
  <p>Si les valeurs singulières d’une matrice carrée ${m('K')} valent toutes ${m('c')} et qu’aucun coefficient n’est nul,
  alors ${m('c > 0')}, ${m('K')} est inversible et ${m('W = K/c')} ne s’annule nulle part : cela donne le théorème 1
  ${lean('théorème 1')}. Si une seule case est cachée, le remplissage est la phase opposée, comme dans les conséquences
  ${lean('corollaire')}.</p>
  ${box(`<p><strong>Théorème C</strong> ${lean('C')}. Soit ${m('f = P(a) + ab')}, où ${m('P')} est un polynôme de degré
  ${m('m')} sur ${m('ℤ/p')} ; soit ${m('ρ : ℤ/p → ℂ')} une lecture quelconque,
  ${m(`(${Kr} h)(a) = Σ<sub>b</sub> ρ(f(a, b)) h(b)`)}, et soit ${m('h')} centrée, ${m('Σ<sub>b</sub> h(b) = 0')} ;
  notons ${m('‖ρ‖² = Σ<sub>c</sub> |ρ(c)|²')} et ${m('‖h‖² = Σ<sub>b</sub> |h(b)|²')}. Alors
  ${m(`‖${Kr} h‖² ≤ (p − 1) ‖ρ‖² ‖h‖²`)}, et quand ${m('m ≤ 1')}, certains ${m('ρ')} et ${m('h')} avec
  ${m('‖ρ‖ ‖h‖ > 0')} atteignent l’égalité. Quand ${m('m ≥ 2')}, ${m(`‖${Kr} h‖² ≤ λ ‖ρ‖² ‖h‖²`)} avec
  ${m(`λ = 1 + ${root}`)}, qui est plus petit que ${m('p − 1')} exactement quand
  ${m('(m − 1)(2p − 1) < (p − 2)²')}.</p>${leanNames(FULL_LEAN.c)}`)}
  <p>Le pic normalisé ${m(`‖${Kr} h‖² / ((p − 1) ‖ρ‖² ‖h‖²)`)} atteint donc 1 pour une certaine lecture quand
  ${m('deg P ≤ 1')}, et vaut au plus ${m('λ/(p − 1)')} pour toute lecture quand ${m('deg P ≥ 2')} : 0,215 pour
  ${m('a³ + ab')} à ${m('p = 97')}, et ${m('λ/(p − 1) ~ √(2(m − 1)/p)')} quand ${m('p → ∞')}. Pour les lectures de
  module 1, la part de la table entière que porte un mode centré, le pic ${m('κ')} mesuré plus bas, vaut au plus
  ${m('λ/p')} : 0,213 pour ${m('a³ + ab')} à ${m('p = 97')} ${lean('C.5')}. Les polynômes ${m('a + ab')}, où
  ${m('deg P = 1')}, et ${m('a² + ab')}, où ${m('deg P = 2')}, tous deux de degré total 2, tombent de part et
  d’autre.</p>
  ${box(`<p><strong>Théorème B</strong> ${lean('B')}. Écrivez ${m('a³ + ab')} en deux étapes, ${m('z = ab')} puis
  ${m('f = a³ + z')}. Chaque étape est de rang 1 dans ses propres caractères : ${m('χ(ab) = χ(a) χ(b)')} pour un
  ${m('χ')} multiplicatif, et ${m(`${sub('ψ', 'r')}(a³ + z) = ${sub('ψ', 'r')}(a³) ${sub('ψ', 'r')}(z)`)}. Pour
  ${m('χ')} non trivial et ${m('r ≠ 0')}, le produit scalaire ${m(`Σ<sub>x</sub> ${sub('ψ', 'r')}(x)<sup>*</sup> χ(x)`)}
  est une somme de Gauss, de module ${m('√p')}. Et les étiquettes cachent la première étape : pour ${m('r ≠ 0')} et
  ${m('(a, b)')} uniforme, ${m(`‖E[${sub('ψ', 'r')}(ab) | f]‖²`)} ${m('≤ 9/(2p) + 8/p<sup>3/2</sup>')}, donc toute
  ${m('φ : ℤ/p → ℂ')} vérifie
  ${m(`|E[φ(f)<sup>*</sup> ${sub('ψ', 'r')}(ab)]|`)} ${m('≤ ‖φ(f)‖ √(9/(2p) + 8/p<sup>3/2</sup>)')}, avec
  ${m('‖φ(f)‖² = E|φ(f)|²')}. Pour tout ${m('P(a) + ab')} avec ${m('deg P = m ≥ 1')} et ${m('p ∤ m')}, et
  ${m('r ≠ 0')}, cela vaut sous la forme ${m(`‖E[${sub('ψ', 'r')}(ab) | f]‖²`)}
  ${m('≤ (w + 1)²/p²')} ${m('+ (p + w + 1)²/(p²(2p − 1))')}, avec ${m('w = (m − 1)√p')}.</p>${leanNames(FULL_LEAN.b)}`)}
  <p>La preuve demande la borne de Weil ${m('|Σ<sub>x</sub> ψ(rP(x))| ≤ (m − 1)√p')} pour ${m('r ≠ 0')} et
  ${m('p ∤ m')}, et ses analogues pour les caractères multiplicatifs. Lean les démontre à travers la fonction L
  ${m(`L(T) = (1 − ${sub('ω', '1')}T) ⋯ (1 − ${sub('ω', 'm−1')}T)`)} de la somme : par la méthode de Stepanov, chaque
  ${m(sub('ω', 'i'))} vérifie ${m(`|${sub('ω', 'i')}| ≤ √p`)}, et la somme vaut
  ${m(`−(${sub('ω', '1')} + ⋯ + ${sub('ω', 'm−1')})`)} ${lean('Weil')}. Weil a démontré, dans l’hypothèse de Riemann pour
  les courbes sur les corps finis (1948), que ${m(`|${sub('ω', 'i')}| = √p`)} ${hand('Weil 1948', L)} ; Lean n’a que
  l’inégalité, et seulement pour les sommes dont le théorème B se sert.</p>${leanNames(FULL_LEAN.weil)}</section>`,

  `<section id="measured"><h3>Ce qui est mesuré</h3><ul>
  <li><strong>M sur les données du réseau.</strong> Pour ${m('p = 31, 61, 97')}, les moitiés d’entraînement des graines 7
  et 11 remplissent les deux conditions du théorème G pour ${m('ψ(a + b)')}, ${m('χ(ab)')} et
  ${m('χ(a + ab) = χ(a) χ(1 + b)')}. ADMM retrouve les trois à partir d’elles avec une erreur relative inférieure à
  ${m('10<sup>−10</sup>')}, lignes et colonnes nulles des tables de ${m('χ')} comprises, et décode chaque case non vue. Sur
  les mêmes moitiés, ${m('ψ(a³ + ab)')} échoue, avec une erreur relative de 1,29 à 1,30 ${numerical('ADMM', L)}.</li>
  <li><strong>Tous les petits motifs.</strong> Les 511 motifs propres d’une table ${m('3 × 3')} à poids égaux, 510 à poids
  aléatoires, et environ 12 000 motifs de tables jusqu’à ${m('3 × 4')} avec des coefficients nuls : chaque classe se
  comporte comme le dit le théorème G ${numerical('ADMM', L)}.</li>
  <li><strong>Le réseau.</strong> Le pic d’une tâche est la plus grande part de sa table que porte un mode d’interaction
  centré, pour une lecture de module 1 :
  ${eq('κ = max |Σ<sub>a,b</sub> ρ(f(a, b)) g(a) h(b)|² / p²')}
  sur ${m('|ρ| = 1')} et les vecteurs unitaires ${m('g, h')} de somme nulle. Il est trouvé par maximisation alternée à
  partir de 320 départs, chaque valeur est donc la meilleure trouvée. Sur 22 tâches à ${m('p = 97')}, il est compris entre
  0,28 et 1 pour les sept tâches ci-dessous qui s’apprennent, et ne baisse pas quand ${m('p')} grandit ; pour les tâches
  qui ne s’apprennent pas, il vaut au plus 0,106, près du 0,069 d’une table aléatoire, et décroît à peu près comme
  ${m('1/p')} : 0,142, 0,106 et 0,057 pour ${m('a³ + ab')} à ${m('p = 47, 97, 199')}, sous le plafond de 0,213 du
  théorème C à ${m('p = 97')}. Dix entraînements ont été prédits à partir de ${m('κ')} avant d’être lancés, et les dix ont
  donné ce qui était prédit : ${m('a² + ab')}, ${m('a² + ab + b² + a')} et ${m('a³ + ab² + b')} restent entre 1 et 2 % sur
  la moitié non vue, comme les témoins ${m('a³ + ab')} et ${m('a² + ab + b²')}, tandis que ${m('ab')}, ${m('a²b')},
  ${m('a + ab')}, ${m('(a + b)²')}, ${m('π(a + b)')}, ${m('a³ + b')} et ${m('(a + b)³')} atteignent 99 % en 1000 à 3000
  pas, avec les deux graines ${numerical('entraînement', L)}.</li></ul></section>`,

  `<section id="unproved"><h3>Ce qui n’est pas démontré</h3><ul>
  <li><strong>Que l’entraînement atteigne l’optimum de la pénalité sur les poids.</strong> C’est la seule étape entre les
  théorèmes sur M et le réseau ${heuristic('entraînement ≈ M', L)}.</li>
  <li><strong>Qu’un mode fort suffise au réseau.</strong> Ce n’est pas le cas, sous cette forme. Pour
  ${m('2⌊(a³ + ab)/2⌋ + (a + b <span class="op">mod</span> 2)')}, le pic ${m('κ = 0,98')} vient de la seule parité de la
  réponse ; sans ce mode il vaut 0,094. Le réseau prédit la parité sur 79 à 80 % de la moitié non vue et la réponse
  elle-même sur 2,3 à 2,7 %, à peu près les ${m('2/p')} du hasard sur le reste : il apprend ce que porte le pic et rien du
  reste ${numerical('entraînement', L)}.</li>
  <li><strong>Le rang au-dessus de 1.</strong> Pour les tables de rang ${m('r ≥ 2')}, aucun critère comme le théorème G
  n’est démontré ${open('rang r', L)}.</li>
  <li><strong>Les tâches hors de la famille.</strong> Pour ${m('a² + ab + b²')}, ${m('a² + ab + b² + a')} et
  ${m('a³ + ab² + b')}, le pic n’est petit que numériquement ; aucun plafond comme celui du théorème C n’est démontré
  ${open('plafond de κ', L)}. Le rang effectif ${m(`(‖K‖${S1}/‖K‖<sub>S2</sub>)²`)}, où ${m('‖K‖<sub>S2</sub>')} est la
  racine de la somme des carrés des valeurs singulières, ne remplace pas le pic : parmi les lectures de ${m('a³ + ab')}
  qu’une recherche a essayées, il est minimal pour l’indicatrice ${m('[a³ + ab = 0]')} ${numerical('recherche', L)}, et
  pourtant, pour tout ${m('c')} et tout ${m('Ω')}, chaque matrice de plus petite norme nucléaire égale à
  ${m('[a³ + ab = c]')} sur ${m('Ω')} vaut 0 en chaque 1 caché d’une ligne ${m('a ≠ 0')}
  ${lean('indicatrice')}.${leanNames(FULL_LEAN.oneHot)}</li>
  <li><strong>Les lectures réelles d’une table plate.</strong> Pour ${m('p')} impair et tout ${m('r')}, les tables réelles
  ${m('[cos(2πrf/p)]')} et ${m('[sin(2πrf/p)]')} de ${m('f = a³ + ab')} sont singulières, et le théorème A ne dit rien
  d’elles ${lean('tables réelles')}. Numériquement, M décode les cases cachées dont le miroir ${m('(−a, b)')} est vu, à
  peu près la moitié, grâce à la symétrie ${m('f(−a, b) = −f(a, b)')}
  ${numerical('ADMM', L)}.${leanNames(FULL_LEAN.real)}</li></ul>
  <p class="sub">Source : <code>review/flat_spectrum.md</code> dans le dépôt transformer. Lean :
  <code>Transformer.Grokking.FlatSpectrum</code> et <code>Transformer.Weil</code>.</p></section>`,
].join('\n');

export const fr: HomeText = {
  nav: 'Cours',
  title: 'Que peut apprendre un réseau à partir de la moitié d’une table ?',
  kicker: 'Un cours sur les spectres et l’apprentissage',
  statement: 'À son optimum, la pénalité sur les poids retrouve une table de rang 1 à coefficients de module 1 à partir des ensembles de cases qui relient ses lignes à ses colonnes et contiennent une permutation, et d’eux seuls, et une table plate sans coefficient nul à partir d’aucun ensemble incomplet.',
  terms,
  theoremsTitle: 'Deux théorèmes',
  theorems: {
    flat: {title: 'Théorème 1 : aucun ensemble incomplet ne retrouve une table plate sans coefficient nul', body: `<p>Soit
      ${m('K')} une table ${m('N × N')} sans coefficient nul dont les valeurs singulières sont toutes égales. Alors, pour
      tout ensemble incomplet de cases ${m('Ω')}, une matrice égale à ${m('K')} sur ${m('Ω')} a une norme nucléaire plus
      petite que celle de ${m('K')}. Aucune factorisation optimale n’a donc pour produit ${m('K')}, et la pénalité sur les
      poids à son optimum ne retrouve ${m('K')} à partir d’aucun ensemble incomplet ${lean('théorème 1')}.</p>
      <p>Par exemple, avec ${m('ψ(x) = e<sup>2πix/p</sup>')}, la table ${m('p × p')} ${m('[ψ(a³ + ab)]')} de
      ${m('a³ + ab <span class="op">mod</span> p')} n’a aucun coefficient nul, et chacune de ses valeurs singulières vaut
      ${m('√p')}, pour tout ${m('p ≥ 1')} ${lean('proposition 2')}.</p>`},
    rankOne: {title: 'Théorème 2 : quels ensembles retrouvent une table de rang 1', body: `<p>Soit ${m('K')} une table
      ${m('N × N')} de rang 1 dont tous les coefficients sont de module 1. La pénalité sur les poids à son optimum retrouve
      ${m('K')} à partir de ${m('Ω')} si et seulement si les cases de ${m('Ω')} relient les lignes aux colonnes et
      contiennent une permutation ${lean('théorème 2')}.</p>
      <p>Les deux conditions ne portent que sur ${m('Ω')}, pas sur les coefficients de ${m('K')}. Par exemple,
      ${m('[ψ(a + b)] = [ψ(a) ψ(b)]')} est une telle table.</p>`},
  },
  conclusionsTitle: 'Ce qui en découle',
  conclusions: {
    fewest: {title: 'Le plus petit nombre de cases', body: `Les ${m('2N − 1')} cases ${m('(a, a)')},
      ${m('a = 0, …, N − 1')}, et ${m('(a, a + 1)')}, ${m('a = 0, …, N − 2')}, retrouvent toutes les tables du
      théorème 2, et aucun ensemble de moins de cases n’en retrouve aucune ${lean('2N − 1')}. Pour ${m('N = 97')}, cela
      fait 193 des 9409 cases.`},
    product: {title: 'Une fonction à discontinuités de seconde espèce, à partir d’un ensemble incomplet', body: `Soit
      ${m('p')} premier et ${m('f(a, b) = ab <span class="op">mod</span> p')}. En ${m('x = a/p')} et ${m('y = b/p')}, pour
      ${m('a, b = 0, …, p − 1')}, ${m(`f/p = ${frac}(pxy)`)}, la partie fractionnaire de ${m('pxy')}. Quand
      ${m('p → ∞')} parmi les nombres premiers, ${m(`${frac}(pxy)`)} a une limite exactement aux points ${m('(x, y)')} de
      ${m('[0, 1)²')} où ${m('2xy')} est entier, un ensemble d’aire 0 ${lean('aire')} : là où ${m('xy')} est rationnel,
      par le théorème de Dirichlet ${lean('Dirichlet')}, ailleurs par celui de Vinogradov ${hand('Vinogradov', L)}. En
      presque tout
      ${m('(x, y)')}, la fonction ${m(`t ↦ ${frac}(xy/t)`)}, sur les points ${m('t = 1/p')}, n’a donc pas de limite en
      ${m('t = 0')} : une discontinuité de seconde espèce. Pourtant, pour tout caractère multiplicatif ${m('χ')} de
      ${m('ℤ/p')}, prolongé par ${m('χ(0) = 0')}, la table ${m('[χ(ab)] = [χ(a) χ(b)]')} est de rang 1, à coefficients de
      module 1 hors de la ligne ${m('a = 0')} et de la colonne ${m('b = 0')}, et la pénalité sur les poids à son optimum la
      retrouve à partir de ${m('Ω')} exactement quand les cases de ${m('Ω')} où ${m('a, b ≠ 0')} relient les lignes non
      nulles aux colonnes non nulles et contiennent une permutation des résidus non nuls ${lean('χ(ab)')}. Elle retrouve
      donc ${m('[χ(ab)]')} à partir des ${m('2p − 3')} cases ${m('(a, a)')} et ${m('(1, b)')} où ${m('a, b ≠ 0')}, et à
      partir d’aucun ensemble de moins de cases ${lean('2p − 3')} : 191 des 9409 cases pour ${m('p = 97')}. Un ${m('χ')} au
      moins est injectif, et à travers un ${m('χ')} injectif la table redonne ${m('ab')} ${lean('χ injectif')}.`},
    readout: {title: 'La lecture décide', body: `Une tâche a une table pour chaque lecture, et les théorèmes 1 et 2 parlent
      d’une table à la fois. Pour ${m('p')} premier et ${m('r ≠ 0')}, la table ${m('[ψ(rab)]')} de ${m('ab')} n’a aucun
      coefficient nul et toutes ses valeurs singulières valent ${m('√p')} ; par le théorème 1, la pénalité sur les poids à
      son optimum ne la retrouve donc à partir d’aucun ensemble incomplet ${lean('ψ(rab)')}. Lue à travers ${m('χ')}, la
      même tâche est retrouvée comme ci-dessus.`},
    hidden: {title: 'Une seule case cachée', body: `Soit ${m('K')} une table ${m('N × N')} telle que
      ${m('K<sup>ᴴ</sup>K = N·I')}, ${m('N ≥ 2')}, dont on cache une case ${m('(a, b)')}, avec
      ${m(`|${sub('K', 'ab')}| = 1`)}. Une matrice égale à ${m('K')} hors de cette case a la plus petite norme nucléaire
      exactement quand son coefficient en cette case est ${m(`−${sub('K', 'ab')}`)} : le seul remplissage optimal est la
      phase opposée. Pour ${m('[ψ(a³ + ab)]')} avec ${m('p')} impair et ${m('p ≥ 3')}, les résidus ${m('c')} dont
      ${m('ψ(c)')} est le plus proche de ce remplissage sont exactement ${m('f + (p − 1)/2')} et ${m('f + (p + 1)/2')}, où
      ${m('f = a³ + ab')} : jamais ${m('f')} lui-même. Pour ${m('[ψ(a + b)]')} et ${m('p ≥ 2')}, le remplissage optimal se
      décode en ${m('a + b')} seul ${lean('corollaire')}.`},
    data: {title: 'Les données d’entraînement', body: `Pour ${m('p = 31, 61')} et 97, les moitiés aléatoires sur lesquelles
      le réseau est entraîné, avec les graines 7 et 11, remplissent les conditions sous lesquelles la pénalité sur les poids
      à son optimum retrouve ${m('[ψ(a + b)]')}, ${m('[χ(ab)]')} et ${m('[χ(a + ab)]')} : celles du théorème 2, et de ses
      formes à coefficients nuls ci-dessous ${numerical('conditions', L)}.`},
    network: {title: 'Le réseau', body: `Pour ${m('p = 97')}, le réseau du cours, entraîné avec AdamW sur une telle moitié,
      atteint au moins 99 % de réponses justes sur l’autre moitié pour ${m('ab')}, ${m('a²b')}, ${m('a + ab')},
      ${m('(a + b)²')}, ${m('π(a + b)')}, ${m('a³ + b')} et ${m('(a + b)³')}, et reste entre 1 et 2 % pour
      ${m('a³ + ab')}, ${m('a² + ab')}, ${m('a² + ab + b²')}, ${m('a² + ab + b² + a')} et ${m('a³ + ab² + b')}, avec les
      deux graines ${numerical('entraînement', L)}. Que l’entraînement atteigne l’optimum de la pénalité sur les poids
      n’est pas démontré ${heuristic('entraînement ≈ M', L)}.`},
  },
  fullTitle: 'L’énoncé complet',
  full,
  audienceTitle: 'Pour qui',
  audience: `Pour les étudiants qui connaissent l’analyse jusqu’à l’analyse complexe : limites et continuité, séries de
    Fourier, ${m('e<sup>iθ</sup>')}, matrices et valeurs propres. Ni la théorie des groupes ni l’apprentissage automatique ne
    sont supposés : les pages introduisent l’une et l’autre en chemin.`,
  legend: legendOf([['Lean', 'démontré en Lean'], ['à la main', 'démontré sur papier seulement'], ['numérique', 'mesuré'], ['à démontrer', 'ouvert'], ['heuristique', 'une étape de modélisation, pas un théorème']]),
  pagesTitle: 'Les pages',
  writing: 'en cours d’écriture',
};
