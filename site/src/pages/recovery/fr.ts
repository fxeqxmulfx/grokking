/** The recovery page in French. Source: review/flat_spectrum.md, Theorems D, E, F and G and the failure margin. */

import {box, eq, heuristic, lean, m, numbers, numerical, section, widget, S1} from '../markup.ts';
import type {RecoveryText} from './spec.ts';

const L = 'fr';
const sub = (x: string, i: string): string => `${x}<sub>${i}</sub>`;
const ai = sub('a', 'i'), bj = sub('b', 'j'), ui = sub('u', 'i'), vj = sub('v', 'j'), xi = sub('x', 'i'), yj = sub('y', 'j');
const abT = 'a b<sup>T</sup>';

const body = [
  `<p class="lead">Une table de rang un est la table la plus simple qui soit. Cachez-en la plus grande partie et demandez à une
  machine de compléter le reste. Cette page cherche quels motifs de cases gardées suffisent : d’abord en jouant, puis en
  nommant ce que vous avez vu, enfin par la preuve.</p>`,

  section('holes', 1, 'Une table trouée', `
  <p>Prenez la table d’addition de ${m('ℤ/p')} et dessinez chaque entrée ${m('a + b')} comme la flèche
  ${m('ψ(a + b) = e<sup>2πi(a+b)/p</sup>')}. La flèche tourne d’un cran à chaque pas le long d’une ligne ou d’une colonne, et
  toute la table est un produit, ${m('ψ(a + b) = ψ(a) ψ(b)')} : elle est de rang un.</p>
  <p>Gardez maintenant seulement les cases d’un motif ${m('Ω')}, les carrés clairs ci-dessous, et laissez une machine
  <strong>M</strong> remplir les cases sombres. Cliquez sur les cases pour changer ${m('Ω')} ; M recomplète la table à chaque
  fois. Une flèche verte est d’accord avec la table, une flèche rouge ne l’est pas.</p>
  ${widget('lab', 'puzzle')}
  <p>Deux diagonales : chaque flèche tombe juste. Une diagonale : le remplissage reste vide. La ligne 0 avec la colonne 0
  détermine une table de rang un, et pourtant M se trompe. La réponse dépend donc du motif, pas seulement du nombre de cases
  gardées.</p>
  ${widget('quiz', 'q1')}`),

  section('machine', 2, 'La machine', `
  <p><strong>M</strong> renvoie, parmi les matrices qui coïncident avec la table sur ${m('Ω')}, une matrice de plus petite
  <em>norme nucléaire</em> ${m(`‖X‖${S1}`)}, la somme des valeurs singulières.</p>
  <p>Les valeurs singulières d’une matrice sont les demi-axes de l’ellipsoïde sur lequel elle envoie la boule unité. Une table
  de rang un écrase la boule sur un segment et n’a qu’une valeur singulière non nulle ; une table à nombreuses directions
  indépendantes en a beaucoup. La norme nucléaire compte donc les directions dont une table a besoin, pondérées par leur
  taille.</p>
  <p>Pourquoi cette machine ? Écrivez ${m('X = U V<sup>ᴴ</sup>')}, de sorte que ${m(`${sub('X', 'ij')} = ⟨${ui}, ${vj}⟩`)}, avec
  un vecteur ${m(ui)} par ligne et un vecteur ${m(vj)} par colonne. C’est une couche bilinéaire, et la pénalité sur les poids
  (<em>weight decay</em>) lui coûte ${m('½(‖U‖² + ‖V‖²)')}. La factorisation la moins chère de ${m('X')} coûte exactement
  ${m(`‖X‖${S1}`)} ${lean('Lemme 1')}. M est donc la pénalité sur les poids à son optimum. Que l’entraînement atteigne cet
  optimum est la seule étape ici qui ne soit pas un théorème ${heuristic('entraînement ≈ M', L)}.</p>
  <p>Une table de rang un ${m(`K = ${abT}`)} coûte ${m(`‖K‖${S1} = ‖a‖ ‖b‖`)}. M <strong>retrouve</strong> ${m('K')} à partir
  de ${m('Ω')} quand ${m('K')} est la seule matrice la moins chère qui coïncide avec elle sur ${m('Ω')}. Deux choses peuvent
  l’empêcher.</p>`),

  section('rigid', 3, 'Les cases doivent tenir ensemble', `
  <p>Dessinez un point doré pour chaque ligne, un point bleu pour chaque colonne et un trait pour chaque case gardée.
  Supposons que le dessin se brise en morceaux. Changez le signe d’un morceau : de ses lignes et de ses colonnes. Une case à
  l’intérieur du morceau change deux fois de signe et garde sa valeur ; une case entre deux morceaux n’en change qu’une fois.
  La table retournée coïncide avec ${m('Ω')} et coûte autant : M ne peut pas la distinguer de la vraie.</p>
  ${widget('lab', 'rigid')}
  <p>Disons que ${m('Ω')} est <strong>rigide</strong> quand le dessin est connexe. La rigidité est nécessaire ${lean('D.7')}
  pour des entrées de module un, et le même retournement marche pour des entrées de toutes tailles ${lean('F.3')}.
  M retrouve ${m('ψ(a + b)')} à partir des deux diagonales de décalages ${m('s₁, s₂')} exactement quand ${m('s₂ − s₁')} est
  inversible modulo ${m('p')}, c’est-à-dire quand elles forment un motif rigide ${lean('D.8')}.</p>
  ${widget('quiz', 'q2')}`),

  section('partner', 4, 'Chaque ligne a besoin d’un partenaire', `
  <p>Rigide ne suffit pas. La croix, ligne 0 et colonne 0, est connexe ; pourtant les lignes 1, 2, … partagent toutes la
  seule colonne 0, et M répond par une matrice moins chère : la plus petite norme vaut ${m('2√(N − 1)')}, moins que ${m('N')}
  pour ${m('N ≥ 3')} ${lean('D.9')}.</p>
  ${box(`<strong>Théorème E</strong> ${lean('E')}. Supposons toutes les entrées de module un, ${m(`|${ai}| = |${bj}| = 1`)}.
  M retrouve ${m(abT)} à partir de ${m('Ω')} exactement quand ${m('Ω')} est rigide et contient une <em>permutation</em> :
  une case gardée dans chaque ligne, toutes dans des colonnes différentes.`)}
  <p>Pourquoi une permutation ? Prenez ${m('J')}, la table de uns ; toute table d’entrées de module un se comporte de même.
  Si ${m('Ω')} contient les cases ${m('(i, σ(i))')} d’une permutation ${m('σ')}, reprenez la factorisation la moins chère
  ${m('X = U V<sup>ᴴ</sup>')}. Alors ${m(`Σ<sub>i</sub> ‖${ui} − v<sub>σ(i)</sub>‖² = 2 (‖X‖${S1} − N)`)} : aucun ${m('X')} ne
  fait mieux que ${m('N')}. En un minimum, tous ces vecteurs coïncident, et la rigidité étend l’égalité à toutes les cases.</p>
  <p>Quand aucune permutation n’existe, le théorème de Hall désigne le coupable : des lignes ${m('R')} qui voient ensemble
  moins de ${m('|R|')} colonnes. Alors ${m('Ω')} manque le bloc ${m('R × C')}, où ${m('C')} réunit les colonnes qu’elles ne
  voient pas, et ${m('k + l > N')} pour ${m('k = |R|')} et ${m('l = |C|')}. Abaisser ce bloc donne
  ${m('X(s) = J − s² 1<sub>R</sub> 1<sub>C</sub><sup>T</sup>')}, qui coïncide toujours avec ${m('Ω')}. Ses facteurs de E.3
  coûtent au plus ${m('N − ½ s² (k + l − N − k s²)')}, moins que ${m('N')} pour ${m('s > 0')} petit ${lean('E.3')}. Lean
  calcule aussi le coût exactement : avec ${m('g = √(k l (N − k)(N − l))')},</p>
  ${eq(`<span class="nobr">‖X(s)‖²${S1} = N² − 2s² (k l − g)</span> <span class="nobr">+ s⁴ k l,</span>`)}
  <p>minimal en ${m('s² = 1 − g/(k l)')}, où ${m(`‖X(s)‖${S1} = √(k (N − l)) + √(l (N − k))`)}. Pour tout bloc ${m('R × C')},
  il existe un réel ${m('t')} avec ${m(`‖J − t 1<sub>R</sub> 1<sub>C</sub><sup>T</sup>‖${S1} < N`)} si et seulement si
  ${m('k + l > N')} ${lean('E.3, exact')}. Pour la croix, ${m('k = l = N − 1')}, le minimum est le ${m('2√(N − 1)')} de D.9.
  Faites glisser ${m('s')} ci-dessous : la courbe foncée est le coût, la grise la borne tirée des facteurs, et la ligne du
  bas la valeur minimale de Lean.</p>
  ${widget('lab', 'hall')}
  <p>De combien la réponse peut-elle être moins chère ? La ligne du bas ci-dessus est le coût minimal de toutes les matrices
  qui coïncident avec ${m('J')} hors de ${m('R × C')}, pas seulement des blocs abaissés ${lean('marge d’échec')} : la matrice
  égale à ${m('1/√(k (N − l))')} sur ${m('R × Cᶜ')}, à ${m('1/√(l (N − k))')} sur ${m('Rᶜ × C')} et nulle ailleurs est une
  contraction, son produit scalaire avec toute matrice égale à 1 sur ces deux bandes vaut
  ${m('√(k (N − l)) + √(l (N − k))')}, et un produit scalaire avec une contraction ne dépasse jamais la norme nucléaire. On
  peut prendre les lignes de Hall avec ${m('k + l = N + 1')}, et Cauchy–Schwarz borne alors ce coût par ${m('√(N² − 1)')}.
  À ${m('k + l')} fixé, il croît avec ${m('k l')}, qui est maximal quand ${m('k')} et ${m('l')} diffèrent d’au plus un.
  Multiplier les lignes et les colonnes par des nombres de module un ne change aucun coût.</p>
  ${box(`<strong>La marge d’échec</strong> ${lean('marge d’échec')}. Supposons que ${m('Ω')} ne contienne aucune
  permutation, et soit ${m('K')} la table ${m('J')} ou toute autre table de rang un d’entrées de module un, de sorte que
  ${m(`‖K‖${S1} = N`)}. Alors une certaine matrice qui coïncide avec ${m('K')} sur ${m('Ω')} coûte au plus
  ${m('√(N² − 1) < N − 1/(2N)')}. Pour ${m('N ≥ 1')}, soit ${m('k + l = N + 1')} avec ${m('k ≤ l ≤ k + 1')}. Tout tel
  ${m('Ω')} en a une qui coûte au plus ${m('√(k (k − 1)) + √(l (l − 1))')}, et pour l’un d’eux c’est le coût minimal :
  ${m('√(N² − 1)')} pour ${m('N')} impair, ${m('√2 + √6 ≈ 3,864')} pour ${m('N = 4')}.`)}
  ${widget('quiz', 'q3')}`),

  section('weights', 5, 'Des poids : du sable et des trous', `
  <p>Donnons maintenant des tailles aux entrées : ${m(`K = ${abT}`)} sans entrée nulle. Donnez à la ligne ${m('i')} un tas de
  sable ${m(`α<sub>i</sub> = |${ai}|²/‖a‖²`)} et à la colonne ${m('j')} un trou ${m(`β<sub>j</sub> = |${bj}|²/‖b‖²`)}. Le sable
  ne passe que par les cases gardées. Un <strong>plan de transport</strong> déplace tout le sable et remplit exactement chaque
  trou.</p>
  ${box(`<strong>Théorème F</strong>. Soit ${m(`K = ${abT}`)} sans entrée nulle. M retrouve ${m('K')} exactement quand
  ${m('Ω')} est rigide et porte un plan ${lean('F')}. Si ${m('Ω')} est rigide et porte un plan, M retrouve ${m('K')}
  ${lean('F.1–F.2')}. Si ${m('Ω')} n’est pas rigide, ou si des lignes ${m('R')} portent plus de sable que les colonnes
  ${m('N(R)')} qu’elles voient ne peuvent en prendre, M échoue ${lean('F.3')}.`)}
  <p>Les obstacles sont ceux que vous avez rencontrés : le retournement d’un morceau, et la matrice moins chère
  ${m(`${abT} − s² a<sub>R</sub> b<sub>C</sub><sup>T</sup>`)}. Un plan existe exactement quand chaque ensemble de lignes tient
  dans les colonnes qu’il voit, ${m('Σ<sub>i∈R</sub> α<sub>i</sub> ≤ Σ<sub>j∈N(R)</sub> β<sub>j</sub>')}
  ${lean('Gale 1957')}. À poids égaux, une permutation contenue dans ${m('Ω')}, divisée par ${m('N')}, est un plan ; la
  condition de Gale devient celle de Hall, ${m('|R| ≤ |N(R)|')}, et le théorème F devient le théorème E.</p>
  <p>Faites glisser les barres dorées et bleues pour changer les poids. La croix, sans espoir à poids égaux, fonctionne dès
  que sa ligne et sa colonne sont assez lourdes : exactement quand ${m('α<sub>i₀</sub> + β<sub>j₀</sub> ≥ 1')}
  ${lean('F.4')}.</p>
  ${widget('lab', 'weights')}
  ${widget('quiz', 'q4')}
  <p>Un poids peut aussi être nul. Une ligne ou une colonne de zéros n’a besoin d’aucune case, et les cases ne doivent tenir
  ensemble que là où les poids ne sont pas nuls.</p>
  ${box(`<strong>Théorème G</strong>. Soient ${m('a ≠ 0')} et ${m('b ≠ 0')}, entrées nulles permises. M retrouve
  ${m(abT)} exactement quand les cases de ${m('Ω')} avec ${m(`${ai} ≠ 0`)} et ${m(`${bj} ≠ 0`)} relient ces lignes à ces
  colonnes, et ${m('Σ<sub>i∈R</sub> α<sub>i</sub> ≤ Σ<sub>j∈N(R)</sub> β<sub>j</sub>')} pour tout ensemble de lignes
  ${m('R')} ${lean('G')}.`)}
  <p>Ainsi, à partir de sa seule entrée 1, M complète la ligne ${m('(1, ?)')} en ${m('(1, 0)')}, jamais en ${m('(1, 1)')}.</p>`),

  section('springs', 6, 'Pourquoi un plan force la réponse : des ressorts', `
  <p>Normalisez la table pour que ${m('‖a‖ = ‖b‖ = 1')} ; cela ne change rien à la reconstruction. Prenez la factorisation la
  moins chère ${m('X = U V<sup>ᴴ</sup>')} d’une matrice qui coïncide avec ${m('Ω')}, divisez chaque vecteur de ligne par son
  poids, ${m(`${xi} = ${ui}/${ai}`)}, et chaque vecteur de colonne de même,
  ${m(`${yj} = ${vj}/<span class="ov">b</span><sub>j</sub>`)}. Sur une case gardée, ${m(`⟨${xi}, ${yj}⟩ = 1`)}. Accrochez un
  ressort de raideur ${m(sub('T', 'ij'))} entre ${m(xi)} et ${m(yj)}, où ${m('T')} est un plan. En développant les carrés,</p>
  ${eq(`Σ<sub>ij</sub> T<sub>ij</sub> ‖${xi} − ${yj}‖² = ‖U‖² + ‖V‖² − 2 = 2 (‖X‖${S1} − ‖a‖ ‖b‖).`)}
  <p>Le membre de gauche est positif ou nul, donc rien ne bat ${m(abT)}. En un ${m('X')} le moins cher, chaque ressort chargé
  est détendu. Chaque ligne et chaque colonne porte du sable, donc chaque point est de longueur un ; deux vecteurs unitaires
  avec ${m('⟨x, y⟩ = 1')} sont égaux, donc ${m(`${xi} = ${yj}`)} sur chaque case gardée. La connexité colle tous les points en
  un seul, et cela dit ${m(`X = ${abT}`)} ${lean('F.2')}.</p>
  <p>Ci-dessous, une couche bilinéaire à vecteurs de dimension deux s’entraîne par descente de gradient, avec pénalité sur
  les poids, sur les cases gardées. Les points dorés sont les ${m(xi)}, les bleus les ${m(yj)}, et le cercle est le cercle
  unité.</p>
  ${widget('springs')}`),

  section('numbers', 7, 'Les nombres', `
  <p>Tous les motifs d’une table ${m('3 × 3')} sauf le motif plein, et à poids aléatoires tous les motifs non vides, résolus
  par ADMM par lots dans torch ${numerical('2026-10-28', L)}. L’écart est ${m(`‖X‖${S1} − ‖a‖ ‖b‖`)} ; l’erreur est
  ${m('‖X − K‖ / ‖K‖')}, les deux normes prises hors de ${m('Ω')}. Les poids aléatoires ont ${m(`|${ai}|`)} et
  ${m(`|${bj}|`)} uniformes dans ${m('[0,3 ; 2]')} et des phases aléatoires.</p>
  ${numbers(['Poids égaux (J), 3 × 3', 'motifs', 'écart', 'erreur', 'théorème'], [
    ['rigide, permutation', '195', 'à 5·10<sup>−15</sup> près de 0', '≤ 4,8·10<sup>−14</sup>', 'E.2'],
    ['rigide, sans permutation', '9', '−0,172', '0,5', 'E.3'],
    ['non rigide, permutation', '51', 'à 9·10<sup>−16</sup> près de 0', '0,89–1,00', 'E.1, D.7'],
    ['non rigide, sans permutation', '256', '−3,00 à −0,172', '0,77–1,00', 'E.3'],
  ])}
  ${numbers(['Poids aléatoires, 3 × 3, 3 tirages', 'motifs par tirage', 'écart', 'erreur', 'théorème'], [
    ['rigide, plan', '90', 'à 7·10<sup>−15</sup> près de 0', '≤ 1,8·10<sup>−15</sup>', 'F.2'],
    ['rigide, sans plan', '114', '−1,63 à −3·10<sup>−6</sup>', '1,7·10<sup>−3</sup> à 0,88', 'F.3'],
    ['non rigide, sans plan', '306', '−6,16 à −3·10<sup>−6</sup>', '0,44 à 1,00', 'F.3'],
  ])}
  <p class="sub">Les neuf motifs rigides sans permutation sont les croix, et −0,172 = 2√2 − 3, le pire cas démontré de la section 4 pour N = 3. Dans les trois tirages, aucun
  motif ne porte de plan sans être rigide. Avec les modules ${m('(√2, 1, 1)')} pour ${m('a')} comme pour ${m('b')}, de sorte
  que ${m('α = β = (½, ¼, ¼)')} et qu’un ensemble propre de lignes peut remplir exactement les colonnes qu’il voit, les motifs
  rigides avec plan convergent lentement : leur plus grande erreur vaut 2,4·10<sup>−4</sup>, 5,0·10<sup>−5</sup> et
  1,0·10<sup>−5</sup> après 6000, 30 000 et 150 000 pas.</p>
  <p>Tous les motifs d’une table ${m('4 × 4')} sauf le motif plein, à poids égaux, 20 000 pas
  ${numerical('2026-10-28', L)}.</p>
  ${numbers(['Poids égaux (J), 4 × 4', 'motifs', 'écart', 'erreur', 'théorème'], [
    ['rigide, permutation', '33 852', 'à 7·10<sup>−7</sup> près de 0', '≤ 8,5·10<sup>−5</sup>', 'E.2'],
    ['rigide, sans permutation', '2464', '−0,536 à −0,136', '0,345–0,667', 'E.3'],
    ['non rigide, permutation', '3970', 'à 2·10<sup>−14</sup> près de 0', '0,775–1,00', 'E.1, D.7'],
    ['non rigide, sans permutation', '25 249', '−4,00 à −0,136', '0,632–1,00', 'E.3'],
  ])}
  <p class="sub">Les bornes −0,536 et −0,136 de la deuxième ligne sont, à trois décimales, 2√3 − 4, la croix de D.9, et √2 + √6 − 4, le pire cas démontré pour N = 4, que la dernière ligne atteint aussi. Le théorème E prouve que M retrouve J à partir de tout motif rigide avec une permutation : l’erreur jusqu’à 8,5·10<sup>−5</sup> de la première ligne du tableau est donc la lenteur d’ADMM. Elle vient des 27 068 de ces motifs où un ensemble propre de lignes voit exactement autant de colonnes qu’il a de lignes ; sur les 6784 autres, l’erreur est sous 10<sup>−13</sup>, une erreur d’arrondi. Après 20 000 pas, 4464 des 27 068 ont encore une erreur au-dessus de 10<sup>−6</sup>. Prolongés, ils continuent de converger : leur erreur reste sous 3,5·10<sup>−5</sup>, 1,8·10<sup>−5</sup>, 8,9·10<sup>−6</sup> et 4,5·10<sup>−6</sup> après 50 000, 100 000, 200 000 et 400 000 pas, environ deux fois plus petite à chaque doublement du nombre de pas, et à la fin leur écart est positif et sous 7,9·10<sup>−9</sup> ${numerical('2026-10-29', L)}.</p>
  <p>La marge d’échec sur des tables de uns ${m('N × N')}, ${m('N')} de 3 à 7, 20 000 pas ${numerical('2026-10-29', L)}.
  Hors de chaque bloc de ${m('k')} lignes et ${m('l')} colonnes avec ${m('k + l > N')}, ADMM atteint le coût minimal
  ${m('√(k (N − l)) + √(l (N − k))')} à 5·10<sup>−15</sup> près, une erreur d’arrondi. Puis 2000 motifs aléatoires de chaque
  taille sans permutation, chacun gardant chaque case avec sa propre probabilité, tirée uniformément dans
  ${m('[0,3 ; 0,9]')} :</p>
  ${numbers(['Marge d’échec', 'rigides / non rigides', 'plus grand écart, rigides', 'plus grand écart, non rigides', 'pire cas démontré'], [
    ['3 × 3', '65 / 1935', '−0,172', '−0,172', '√8 − 3 = −0,172'],
    ['4 × 4', '117 / 1883', '−0,136', '−0,136', '√2 + √6 − 4 = −0,136'],
    ['5 × 5', '178 / 1822', '−0,101', '−0,101', '√24 − 5 = −0,101'],
    ['6 × 6', '242 / 1758', '−0,0864', '−0,0864', '√6 + √12 − 6 = −0,0864'],
    ['7 × 7', '268 / 1732', '−0,0718', '−0,0784', '√48 − 7 = −0,0718'],
  ])}
  <p class="sub">Les plus grands écarts coïncident avec le pire cas démontré à six décimales, dans les deux classes pour
  ${m('N')} de 3 à 6 et dans la classe rigide pour ${m('N = 7')} ; là, les motifs non rigides n’atteignent que le bloc
  ${m('3 × 5')}, √6 + √20 − 7 = −0,0784. ADMM ne finit jamais plus de 7,7·10<sup>−7</sup> au-dessus du coût du bloc manqué
  le moins cher.</p>
  <p>Tables à entrées nulles : tous les motifs sauf le motif plein de 13 tables de tailles ${m('2 × 3')}, ${m('3 × 2')},
  ${m('3 × 3')}, ${m('2 × 4')} et ${m('3 × 4')}, toutes sauf une avec des zéros à des places fixées, phases aléatoires,
  30 000 pas ${numerical('2026-10-28', L)}. Rigide veut dire ici que les cases avec ${m(`${ai} ≠ 0`)} et ${m(`${bj} ≠ 0`)}
  relient ces lignes à ces colonnes ; la condition est celle du théorème G. Comme ${m('K')} peut s’annuler hors de
  ${m('Ω')}, l’erreur est ici ${m('‖X − K‖')} hors de ${m('Ω')} divisée par ${m('‖K‖')}.</p>
  ${numbers(['Entrées nulles', 'motifs', 'écart', 'erreur', 'théorème'], [
    ['rigide, condition', '2010', 'à 4·10<sup>−15</sup> près de 0', '≤ 7,1·10<sup>−16</sup>', 'G'],
    ['non rigide, condition', '224', 'à 2·10<sup>−15</sup> près de 0', '0,57–0,71', 'G'],
    ['rigide, sans condition', '1582', '−2,86 à −3,5·10<sup>−4</sup>', '0,017–0,90', 'G'],
    ['non rigide, sans condition', '8395', '−5,11 à −3,5·10<sup>−4</sup>', '0,15–1,00', 'G'],
  ])}
  <p class="sub">Neuf tables tirent les modules uniformément dans ${m('[0,3 ; 2]')} ; quatre les fixent :
  ${m('|a| = (1, 1, 0)')} avec ${m('|b| = (1, 1, 0)')} ou ${m('(1, 1, 1)')}, ${m('|a| = (2, 1, 0)')} avec
  ${m('|b| = (1, 1, √3, 0)')}, et ${m('|a| = (1, √2, 0)')} avec ${m('|b| = (1, 0, √2)')}. Seules ces quatre donnent des
  motifs qui satisfont la condition sans rigidité ; sur eux, ADMM trouve une seconde matrice de norme nucléaire
  ${m('‖a‖ ‖b‖')} qui coïncide avec ${m(abT)} sur ${m('Ω')}.</p>`),

  section('status', 8, 'Ce qui est démontré, ce qui reste', `
  <p>Chaque énoncé de cette page, rangé selon la façon dont il est connu. Cliquez sur une carte pour voir ses noms Lean.</p>
  ${widget('status')}
  <p class="sub">Source : <code>review/flat_spectrum.md</code> du dépôt transformer, section « Exact recovery of a rank-one
  kernel », théorèmes D, E, F et G et la marge d’échec. Lean : <code>Transformer.Grokking.FlatSpectrum</code>. Les solveurs de cette page tournent
  dans votre navigateur : ADMM pour M, descente de gradient pour les ressorts.</p>`),
].join('\n');

export const fr: RecoveryText = {
  title: 'Quelles cases déterminent une table ?',
  nav: 'Reconstruction',
  summary: 'Compléter une table de rang un à partir de quelques cases : quand la plus petite norme nucléaire la retrouve, et pourquoi elle échoue parfois.',
  body,
  quizzes: {
    q1: {
      question: `${m('p = 8')}, et ${m('Ω')} est formé des deux diagonales ${m('b = a')} et ${m('b = a + 2')}. Est-ce que M retrouve ${m('ψ(a + b)')} ?`,
      options: ['Oui : deux diagonales suffisent toujours.', 'Non : 2 n’est pas inversible modulo 8.', 'Seulement si les diagonales sont voisines.'],
      hint: 'Choisissez p = 8 et le motif « Décalages 0 et 2 » ci-dessus. Quelles cases des pas de 2 atteignent-ils depuis la case (0, 0) ?',
      why: 'Des pas de 2 ne quittent jamais les cases paires, ni les impaires : le motif se brise en deux morceaux, et le retournement d’un morceau coïncide avec Ω. Deux diagonales retrouvent ψ(a + b) exactement quand s₂ − s₁ est inversible (D.8, Lean).',
    },
    q2: {
      question: `Une ligne de ${m('Ω')} n’a aucune case gardée. Est-ce que M peut retrouver la table ?`,
      options: ['Oui, si toutes les autres lignes sont pleines.', 'Non, jamais.'],
      hint: 'Dessinez la ligne comme un point. À quoi est-il relié ?',
      why: 'La ligne vide est un morceau à elle seule ; la retourner inverse toute cette ligne et coïncide avec Ω au même coût (D.7, Lean).',
    },
    q3: {
      question: `${m('N = 4')}, et ${m('Ω')} est la ligne 0 avec la colonne 0. ${m('Ω')} est-il rigide, et est-ce que M retrouve ${m('J')} ?`,
      options: ['Rigide, et M retrouve J.', 'Rigide, mais M ne retrouve pas J.', 'Pas rigide.'],
      hint: 'Chaque case touche la ligne 0 ou la colonne 0. Cherchez maintenant une permutation : quelle colonne la ligne 1 peut-elle prendre, et la ligne 2 ?',
      why: 'Les lignes 1, 2 et 3 partagent la seule colonne 0, donc aucune permutation ne tient. La plus petite norme vaut 2√3 ≈ 3,46 < 4 (D.9, E.3, Lean).',
    },
    q4: {
      question: `${m('N = 3')}, ${m('Ω')} est la croix de la ligne 0 et de la colonne 1, le sable est ${m('α = (3/5, 1/5, 1/5)')} et les trous ${m('β = (1/5, 2/5, 2/5)')}. Est-ce que M retrouve la table ?`,
      options: ['Oui.', 'Non : la croix ne marche jamais pour N ≥ 3.'],
      hint: 'Les lignes 1 et 2 ne peuvent envoyer leur sable que vers la colonne 1. Combien en portent-elles, et quelle est la taille de ce trou ?',
      why: 'Les lignes 1 et 2 portent 2/5 et le trou de la colonne 1 vaut 2/5 : un plan existe, α₀ + β₁ = 1 suffit tout juste. La croix est rigide, donc F.2 (Lean) s’applique. C’est le motif « Croix, à la limite », où M converge lentement.',
    },
  },
  status: {
    lemma1: {title: `Lemme 1 : ‖X‖${S1} = min ½(‖U‖² + ‖V‖²)`, detail: 'La norme nucléaire est le plus petit coût, en pénalité sur les poids, d’une factorisation X = UVᴴ, sur toutes les dimensions internes. Ainsi les produits des factorisations les moins chères qui coïncident avec Ω sont exactement les solutions de M, et la pénalité sur les poids à son optimum retrouve K exactement quand M le retrouve. Sur main depuis le commit 1aed20a5.'},
    d7: {title: 'D.7 : non rigide ⇒ un retournement', detail: 'Si les cases gardées se brisent en morceaux, retourner un morceau donne une seconde table d’entrées de module un qui coïncide sur Ω.'},
    d8: {title: 'D.8 : deux diagonales ⇔ s₂ − s₁ inversible', detail: 'M retrouve ψ(a + b) à partir exactement des diagonales de décalages s₁ et s₂ si et seulement si s₂ − s₁ est inversible dans ℤ/p.'},
    d9: {title: 'D.9 : la croix échoue pour N ≥ 3', detail: 'La croix est rigide et fixe toute complétion de rang un, mais sa plus petite norme nucléaire vaut 2√(N − 1) < N.'},
    e: {title: 'Théorème E : rigide et une permutation', detail: `Pour des entrées de module un : une permutation dans Ω donne ‖X‖${S1} ≥ N (E.1) ; avec la rigidité, M retrouve la table (E.2) ; sans permutation, un témoin moins cher existe (E.3) ; ensemble, une équivalence (E.4).`},
    e3w: {title: 'E.3, exact : le coût du bloc abaissé', detail: `Pour k = |R|, l = |C| et g = √(k l (N − k)(N − l)) : les facteurs de J − s² 1_R 1_Cᵀ coûtent au plus N − ½ s² (k + l − N − k s²) ; sa norme nucléaire vaut exactement √(N² − 2s² (k l − g) + s⁴ k l), minimale en s² = 1 − g/(k l), où elle vaut √(k (N − l)) + √(l (N − k)) ; il existe un réel t avec ‖J − t 1_R 1_Cᵀ‖${S1} < N si et seulement si k + l > N. Lean démontre la norme exacte pour tout bloc m × n et tout réel t. Pour la croix, le minimum est 2√(N − 1). Sur main depuis les commits 4943eec7 et a9e36f03.`},
    margin: {title: 'La marge d’échec : sous N − 1/(2N)', detail: 'Toute matrice égale à J hors d’un bloc de k lignes et l colonnes avec k + l > N coûte au moins √(k (N − l)) + √(l (N − k)) : une contraction, constante sur chacune des deux bandes qui bordent le bloc et nulle ailleurs, le certifie, et le bloc abaissé l’atteint. Sans permutation, le bloc de Hall a k + l = N + 1, et Cauchy–Schwarz borne son coût par √(N² − 1) < N − 1/(2N). Pour N ≥ 1 et k + l = N + 1 avec k ≤ l ≤ k + 1, le plus grand coût minimal sans permutation est √(k (k − 1)) + √(l (l − 1)) : √(N² − 1) pour N impair, √2 + √6 pour N = 4. Une remise à l’échelle porte les deux bornes à toute table de rang un d’entrées de module un. Sur main depuis les commits f192a4aa, da5f79ce et 58f6f140.'},
    f12: {title: 'F.1–F.2 : un plan ⇒ reconstruction', detail: `Un plan de transport de α vers β sur Ω donne ‖X‖${S1} ≥ ‖a‖ ‖b‖ ; avec la rigidité, M retrouve a bᵀ. Sur main depuis le commit 7f7423c9.`},
    f3a: {title: 'F.3 : non rigide ⇒ un retournement, toutes tailles', detail: `Les phases u_i v_j = 1 sur Ω, avec u_i₀ v_j₀ = −1, donnent une seconde table de mêmes modules. Comme ‖a bᵀ‖${S1} = ‖a‖ ‖b‖, elle coûte autant. Sur main depuis le commit b6577f53.`},
    f3b: {title: 'F.3 : des lignes trop chargées ⇒ un témoin moins cher', detail: 'Si des lignes R portent plus de sable que leurs colonnes N(R) n’en prennent, Ω évite R × N(R)ᶜ, et U = p diag(a) U₀, V = p⁻¹ diag(b̄) V₀ tirés de E.3, avec p² = ‖b‖/‖a‖, coûtent moins que ‖a‖ ‖b‖. Sur main depuis le commit b6577f53.'},
    cross: {title: 'F.4 : la croix : reconstruction ⇔ α<sub>i₀</sub> + β<sub>j₀</sub> ≥ 1', detail: 'Dans un sens : un plan explicite sur la croix et F.2. Dans l’autre : le témoin de F.3 sur le bloc hors de la ligne i₀ et de la colonne j₀. Gale n’y est pas nécessaire. Sur main depuis le commit b6577f53.'},
    gale: {title: 'Gale : un plan ⇔ Σ<sub>R</sub> α ≤ Σ<sub>N(R)</sub> β', detail: 'Le théorème de l’offre et de la demande (Gale, 1957), pour toutes masses positives de même total. Récurrence sur les cases : pousser du sable le long d’une case jusqu’à vider sa ligne ou sa colonne, ou jusqu’à ce qu’un ensemble de lignes R soit serré, puis couper là. Sur main depuis le commit ab75b4fa.'},
    fiff: {title: 'Le théorème F comme équivalence', detail: 'M retrouve a bᵀ ⇔ Ω est rigide et porte un plan ⇔ Ω est rigide et ‖b‖² Σ_R |a_i|² ≤ ‖a‖² Σ_N(R) |b_j|² pour tout ensemble R. Exemple : le triangle {(0, 0), (0, 1), (1, 1)} retrouve (2, 1)(1, 2)ᵀ mais pas (1, 2)(2, 1)ᵀ. Sur main depuis le commit ab75b4fa.'},
    g: {title: 'Théorème G : entrées nulles permises', detail: 'Pour a ≠ 0 et b ≠ 0, zéros permis : M retrouve a bᵀ ⇔ les cases de Ω avec a_i ≠ 0 et b_j ≠ 0 relient ces lignes à ces colonnes, et Σ_R α_i ≤ Σ_N(R) β_j pour tout ensemble de lignes R. Une ligne ou une colonne de zéros n’a besoin d’aucune case. Exemple : dans une table 1 × 2, la case (0, 0) retrouve (1)(1, 0)ᵀ mais pas (1)(1, 1)ᵀ. Sur main depuis les commits 1c4bed77 et 6574a220.'},
    n3: {title: 'Tous les motifs 3 × 3', detail: 'Les 511 motifs sauf le plein à poids égaux et, dans chacun des trois tirages de poids aléatoires, les 510 non vides, résolus par ADMM par lots : chaque classe se comporte comme le disent les théorèmes (section 7).'},
    n4: {title: 'Tous les motifs 4 × 4', detail: 'Les 65 535 motifs sauf le plein, à poids égaux, résolus par ADMM par lots : chaque classe se comporte comme le dit le théorème E. Les 4464 motifs rigides avec une permutation dont l’erreur dépasse encore 10⁻⁶ après 20 000 pas continuent de converger quand on prolonge le calcul (section 7).'},
    nmargin: {title: 'La marge d’échec, de 3 × 3 à 7 × 7', detail: 'Hors de chaque bloc avec k + l > N, ADMM atteint le coût minimal démontré à une erreur d’arrondi près. Sur 2000 motifs aléatoires de chaque taille sans permutation, les plus grands écarts coïncident avec le pire cas démontré à six décimales, sauf pour les motifs non rigides à N = 7 (section 7).'},
    zeros: {title: 'Tables à entrées nulles', detail: 'Les 12 211 motifs, sauf les pleins, de 13 tables, toutes sauf une avec des zéros à des places fixées, résolus par ADMM par lots : chaque classe se comporte comme le dit le théorème G (section 7).'},
    train: {title: 'L’entraînement atteint M', detail: 'La pénalité sur les poids à son optimum est M (lemme 1). Que l’entraînement atteigne cet optimum est une étape de modélisation, pas un théorème.'},
  },
};
