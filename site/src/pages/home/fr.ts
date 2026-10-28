/** The home page in French. */

import {box, eq, hand, heuristic, lean, m, numerical, open, S1} from '../markup.ts';
import {frac, Kr, legendOf, ri, root, sj, sub, ui, vj, type HomeText} from './spec.ts';

const L = 'fr';

/** The statement in full: every term, what is proved for M, what is measured, what is not proved. */
const full = [
  `<p>Cette partie énonce la thèse avec chaque terme fixé, les théorèmes qui la précisent et le statut de chaque morceau.
  En bref : pour le modèle convexe de la pénalité sur les poids, « un bon spectre » devient « une lecture rend la table de
  rang un », et deux conditions sur les cases observées décident alors exactement si elle est retrouvée ; une table
  parfaitement plate, comme ${m('ψ(a³ + ab)')}, n’est retrouvée à partir d’aucune partie propre d’elle-même. Le passage de
  ce modèle au réseau entraîné est mesuré, non démontré. Les pages suivantes établissent chaque morceau pas à pas.</p>`,

  `<section id="terms"><h3>Les termes</h3><ol class="terms">
  <li><strong>Tables.</strong> ${m('p')} est un nombre premier. Une tâche est une application
  ${m('f : ℤ/p × ℤ/p → ℤ/p')}, lue comme la table ${m('p × p')} de ses valeurs. Le cours suit ${m('a + b')}, ${m('ab')},
  ${m('π(a + b)')} pour une permutation aléatoire ${m('π')} de ${m('ℤ/p')}, et la famille ${m('P(a) + ab')} où ${m('P')}
  est un polynôme.</li>
  <li><strong>Discontinuités de seconde espèce.</strong> Placez la table sur le carré unité :
  ${m(`${sub('F', 'p')}(x, y) = f(a, b)/p`)} en ${m('x = a/p')} et ${m('y = b/p')}. Pour ${m('f = ab')}, c’est
  ${m(`${sub('F', 'p')}(x, y) = ${frac}(pxy)`)}, une dent de scie qui saute sur les ${m('p − 1')} hyperboles
  ${m('pxy = 1, …, p − 1')}. Quand ${m('p')} parcourt les nombres premiers, ${m(`${frac}(pxy)`)} converge exactement là où
  ${m('2xy')} est entier : pour ${m('xy')} irrationnel ses valeurs sont équiréparties (Vinogradov), et pour ${m('xy')}
  rationnel de dénominateur réduit au moins 3 elles prennent au moins deux valeurs une infinité de fois (Dirichlet)
  ${hand('Dirichlet, Vinogradov', L)}. La limite n’existe donc que sur les axes et sur l’hyperbole ${m('xy = ½')}, un
  ensemble de mesure nulle. Partout ailleurs, ${m(`${frac}(pxy)`)}, vue comme fonction de ${m('1/p')}, se comporte près de
  0 comme ${m('sin(1/t)')} près de ${m('t = 0')}, l’exemple classique de discontinuité de seconde espèce : pas de limite,
  pas même un saut. Pour ${m('f = a + b')}, au contraire, ${m(`${sub('F', 'p')}(x, y) = ${frac}(x + y)`)} pour tout
  ${m('p')}, avec un seul saut, de première espèce. Chaque table est finie ; l’expression décrit la famille quand ${m('p')}
  grandit, et dit qu’il ne reste aucune régularité dont un apprenant puisse se servir.</li>
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
  pénalité sur tous les poids. Les chiffres d’entraînement cités plus bas ont été mesurés avec AdamW : taux
  d’apprentissage ${m('10<sup>−3</sup>')} après un échauffement linéaire de 10 pas, bêtas 0,9 et 0,98, pénalité 1, lots de
  512, au plus 10 000 pas. La note source rapporte le même échec sur ${m('a³ + ab')} avec les deux optimiseurs, et aucun
  théorème ci-dessous ne dépend de l’optimiseur.</li>
  <li><strong>Lectures et spectre.</strong> Le réseau répond en choisissant un des ${m('p')} résidus ; sa table peut donc se
  lire à travers n’importe quelle lecture ${m('φ : ℤ/p → ℂ')}, comme le noyau ${m(`${sub('K', 'φ')} = [φ(f(a, b))]`)}. Le
  spectre de ${m('f')} pour ${m('φ')} est la liste des valeurs singulières de ${m(sub('K', 'φ'))}. <em>Bon</em> : une
  lecture le concentre, au mieux en rang un. <em>Plat</em> : toute lecture l’étale ; le pic ${m('κ')} ci-dessous mesure à
  quel point. Avec ${m('ψ(x) = e<sup>2πix/p</sup>')}, la table ${m('ψ(a + b) = ψ(a) ψ(b)')} est de rang un et de norme
  nucléaire ${m('p')}, tandis que ${m('ψ(a³ + ab)')} a ses ${m('p')} valeurs singulières égales à ${m('√p')} et une norme
  nucléaire ${m('p<sup>3/2</sup>')} : les deux extrêmes pour une table ${m('p × p')} à coefficients de module un
  ${lean('proposition 2')}. La lecture compte. Pour ${m('ψ')}, le produit ${m('ab')} est tout aussi plat, chaque valeur
  singulière vaut ${m('√p')}, mais un caractère multiplicatif fidèle ${m('χ')}, prolongé par ${m('χ(0) = 0')}, le change en
  ${m('χ(a) χ(b)')}, de rang un ${lean('rang un')}. De même, ${m('ψ ∘ π<sup>−1</sup>')} change ${m('π(a + b)')} en
  ${m('ψ(a + b)')}.</li>
  <li><strong>Le modèle M.</strong> Une couche bilinéaire calcule ${m('X = U V<sup>ᴴ</sup>')} : la ligne ${m('a')} de la
  table porte la ligne ${m(sub('U', 'a'))} de ${m('U')}, la colonne ${m('b')} la ligne ${m(sub('V', 'b'))} de ${m('V')},
  et ${m(`${sub('X', 'ab')} = ⟨${sub('U', 'a')}, ${sub('V', 'b')}⟩`)}. La pénalité sur les poids coûte
  ${m('½(‖U‖² + ‖V‖²)')}, et la factorisation la moins chère de ${m('X')} coûte exactement ${m(`‖X‖${S1}`)}, la somme de
  ses valeurs singulières ${lean('lemme 1')}. M est la pénalité sur les poids à son optimum : connaissant les valeurs de
  ${m(sub('K', 'φ'))} sur ${m('Ω')}, il rend une matrice de norme nucléaire minimale parmi celles qui les prennent. M
  <em>retrouve</em> ${m('K')} à partir de ${m('Ω')} quand ${m('K')} est la seule. Que l’entraînement trouve la réponse de
  M est une étape de modélisation, pas un théorème ${heuristic('entraînement ≈ M', L)}.</li>
  </ol></section>`,

  `<section id="proved"><h3>Ce qui est démontré, pour M</h3>
  <p>Chaque énoncé de cette partie est démontré en Lean, sauf si son étiquette dit autre chose. D’abord la moitié
  positive.</p>
  ${box(`<p><strong>Théorème G</strong> ${lean('G')}. Soit ${m('K = u v<sup>T</sup>')}, où ${m('u')} et ${m('v')} sont des
  vecteurs complexes de longueurs quelconques, coefficients nuls permis. M retrouve ${m('K')} à partir de ${m('Ω')} si et
  seulement si</p><ol>
  <li>${m('Ω')} est rigide sur les supports : pour tous ${m(ri)} et ${m(sj)} complexes, si ${m(`${ri} + ${sj} = 0`)} sur
  chaque case de ${m('Ω')} où ${m(`${ui} ${vj} ≠ 0`)}, alors ${m(`${ri} + ${sj} = 0`)} sur chaque case où
  ${m(`${ui} ${vj} ≠ 0`)} ; et</li>
  <li>tout ensemble ${m('R')} de lignes tient dans l’ensemble ${m('N(R)')} des colonnes qu’il rencontre dans ${m('Ω')} :
  ${m(`‖v‖² Σ<sub>i∈R</sub> |${ui}|²`)} ${m(`≤ ‖u‖² Σ<sub>j∈N(R)</sub> |${vj}|²`)}.</li></ol>
  <p>Par le théorème de l’offre et de la demande (Gale, 1957), démontré lui aussi en Lean, la seconde condition dit que
  ${m('Ω')} porte un plan de transport des masses ${m(`‖v‖² |${ui}|²`)} vers les masses ${m(`‖u‖² |${vj}|²`)}.</p>`)}
  <p>La rigidité est la connexité : les cases de ${m('Ω')} où ${m(`${ui} ${vj} ≠ 0`)}, vues comme des arêtes entre lignes
  et colonnes, relient toutes les lignes et colonnes non nulles ${hand('graphes', L)}. Sans elle, M ne peut pas isoler
  ${m('K')} : multiplier les lignes d’une composante connexe par une phase et ses colonnes par la phase opposée donne une
  seconde matrice, de mêmes valeurs sur ${m('Ω')} et de même norme nucléaire. La seconde condition échoue exactement quand
  des lignes portent plus de masse que leurs colonnes n’en peuvent prendre ; alors le bloc qu’elles manquent peut être
  abaissé avec profit. Aucune des deux conditions ne parle de continuité : elles ne voient que les cases gardées et les
  modules ${m(`|${ui}|`)} et ${m(`|${vj}|`)}. Pour une table carrée à coefficients de module un, la seconde condition est
  celle de Hall, et dit que ${m('Ω')} contient le graphe d’une permutation (théorème E). D’où :</p><ul>
  <li>deux diagonales ${m('b − a ∈ {c₁, c₂}')} avec ${m('c₁ ≠ c₂')}, ${m('2p')} des ${m('p²')} cases, retrouvent
  ${m('ψ(a + b)')}, et une seule diagonale ne suffit pas ${lean('D.5, D.6, D.8')} ;</li>
  <li>la croix, ligne 0 et colonne 0, est rigide et détermine ${m('ψ(a + b)')} parmi les tables de rang un, et pourtant,
  pour ${m('p ≥ 3')}, M rend une table de norme nucléaire ${m('2√(p − 1) < p')} ${lean('D.9')} ;</li>
  <li>pour ${m('χ(ab)')}, la ligne nulle et la colonne nulle n’ont besoin d’aucune case observée : M la retrouve exactement
  quand les cases de ${m('Ω')} où ${m('a, b ≠ 0')} relient les lignes et colonnes non nulles et contiennent une
  permutation de celles-ci, et de même pour ${m('χ(a + ab) = χ(a) χ(1 + b)')}, avec la colonne ${m('−1')} à la place de
  la colonne ${m('0')} ${lean('G et Hall')}.</li></ul>
  <p>Puis la moitié négative.</p>
  ${box(`<p><strong>Théorème A</strong> ${lean('A')}. Soit ${m('K')} inversible, de facteur polaire
  ${m('W = K (K<sup>ᴴ</sup>K)<sup>−1/2</sup>')}. Alors ${m('K')} a la plus petite norme nucléaire parmi les matrices égales
  à ${m('K')} sur ${m('Ω')} si et seulement si ${m('W')} s’annule hors de ${m('Ω')}.</p>`)}
  <p>Pour ${m('ψ(a³ + ab)')}, ${m('W = K/√p')} n’a aucun coefficient nul : M ne la retrouve à partir d’aucun ${m('Ω')}
  propre. Si une seule case est cachée, M y met ${m(`−${sub('K', 'ab')}`)}, qui se décode en ${m('f + (p ± 1)/2')} et
  jamais en ${m('f')} ; pour ${m('ψ(a + b)')}, il y met ${m(sub('K', 'ab'))} ${lean('corollaire')}.</p>
  ${box(`<p><strong>Théorème C</strong> ${lean('C')}. Soit ${m('f = P(a) + ab')}, où ${m('P')} est un polynôme de degré
  ${m('m')} sur ${m('ℤ/p')} ; soit ${m('ρ : ℤ/p → ℂ')} une lecture quelconque,
  ${m(`(${Kr} h)(a) = Σ<sub>b</sub> ρ(f(a, b)) h(b)`)}, et soit ${m('h')} centrée, ${m('Σ<sub>b</sub> h(b) = 0')}. Alors
  ${m(`‖${Kr} h‖² ≤ (p − 1) ‖ρ‖² ‖h‖²`)}, et certains ${m('ρ')} et ${m('h')} atteignent l’égalité quand ${m('m ≤ 1')}.
  Quand ${m('m ≥ 2')}, ${m(`‖${Kr} h‖² ≤ λ ‖ρ‖² ‖h‖²`)} avec ${m(`λ = 1 + ${root}`)}, ce qui est plus petit dès que
  ${m('λ < p − 1')}.</p>`)}
  <p>Le pic normalisé ${m(`‖${Kr} h‖² / ((p − 1) ‖ρ‖² ‖h‖²)`)} atteint donc 1 quand ${m('deg P ≤ 1')} et vaut au plus
  ${m('λ/(p − 1) ≈ √(2(m − 1)/p)')} quand ${m('deg P ≥ 2')}, quelle que soit la lecture : 0,215 pour
  ${m('a³ + ab')} à ${m('p = 97')}. Pour les lectures de module un, la part de la table entière que porte un mode centré,
  le pic ${m('κ')} mesuré plus bas, vaut au plus ${m('λ/p')} : 0,213 pour ${m('a³ + ab')} à ${m('p = 97')}
  ${lean('C.5')}. Les polynômes ${m('a + ab')} et ${m('a² + ab')}, tous deux de degré total deux, tombent de part et
  d’autre.</p>
  ${box(`<p><strong>Théorème B</strong> ${lean('B')}. Écrivez ${m('a³ + ab')} en deux étapes, ${m('z = ab')} puis
  ${m('f = a³ + z')}. Chaque étape est de rang un dans ses propres caractères : ${m('χ(ab) = χ(a) χ(b)')} pour un
  ${m('χ')} multiplicatif, et ${m(`${sub('ψ', 'r')}(a³ + z) = ${sub('ψ', 'r')}(a³) ${sub('ψ', 'r')}(z)`)} avec
  ${m(`${sub('ψ', 'r')}(x) = ψ(rx)`)}. Les deux familles de caractères sont presque mutuellement non biaisées : pour
  ${m('χ')} non trivial et ${m('r ≠ 0')}, leurs produits scalaires sont des sommes de Gauss, de module ${m('√p')}. Et les
  étiquettes cachent la première étape : pour ${m('r ≠ 0')} et ${m('(a, b)')} uniforme,
  ${m(`‖E[${sub('ψ', 'r')}(ab) | f]‖² ≤ 9/(2p) + 8/p<sup>3/2</sup>`)}, donc aucune fonction de l’étiquette de norme un
  n’est corrélée à ${m(`${sub('ψ', 'r')}(ab)`)} à plus de ${m('O(p<sup>−1/2</sup>)')}.</p>`)}
  <p>Il en va de même pour tout ${m('P(a) + ab')} avec ${m('1 ≤ deg P < p')}, avec ${m('O(m²/p)')} au lieu de
  ${m('O(1/p)')} ${lean('B pour tout P')}. La preuve demande la borne de Weil
  ${m('|Σ<sub>x</sub> ψ(rP(x))| ≤ (m − 1)√p')} pour ${m('r ≠ 0')}, et ses analogues pour les caractères multiplicatifs.
  Lean les démontre par la méthode de Stepanov : toute racine inverse ${m('ω')} du numérateur de la fonction zêta de la
  courbe ${m('y<sup>p</sup> − y = rP(x)')}, ou de ${m('y<sup>d</sup> = c − P(x)')}, vérifie ${m('|ω| ≤ √p')}. Avec
  l’équation fonctionnelle, c’est l’hypothèse de Riemann pour ces courbes, que Weil a démontrée pour toute courbe sur un
  corps fini (1948) ; Lean n’en a que les cas dont le théorème B se sert ${lean('Weil')}.</p></section>`,

  `<section id="refined"><h3>L’énoncé, précisé</h3>
  ${box(`<p>Pour M, le modèle convexe de la pénalité sur les poids, l’énoncé devient un théorème en deux moitiés.</p><ol>
  <li><strong>Rang un pour une lecture : les cases décident.</strong> Si une lecture change la table de ${m('f')} en
  ${m('u v<sup>T</sup>')}, M la retrouve à partir de ${m('Ω')} exactement quand ${m('Ω')} est rigide sur les supports et
  que tout ensemble de lignes tient dans les colonnes qu’il rencontre (théorème G). La discontinuité ne joue aucun rôle ;
  seules comptent la table lue et les cases. Deux diagonales retrouvent ${m('ψ(a + b)')}, et avec elle ${m('π(a + b)')}
  lue par ${m('ψ ∘ π<sup>−1</sup>')} ; les moitiés d’entraînement du réseau lui-même retrouvent ${m('ψ(a + b)')},
  ${m('χ(ab)')} et ${m('χ(a + ab)')}, leurs deux conditions vérifiées par ordinateur.</li>
  <li><strong>Plat : aucune partie ne suffit.</strong> Une table sans coefficient nul dont toutes les valeurs singulières
  sont égales, comme ${m('ψ(a³ + ab)')}, n’est retrouvée à partir d’aucun ${m('Ω')} propre (théorème A). Dans la famille
  ${m('P(a) + ab')}, un mode d’une table lue porte tout quand ${m('deg P ≤ 1')} ; quand ${m('deg P ≥ 2')}, pour toute
  lecture, aucun mode centré n’en porte plus de ${m('λ/(p − 1) ≈ √(2(m − 1)/p)')}, où ${m(`λ = 1 + ${root}`)}, une part qui tend
  vers 0 quand ${m('p')} grandit (théorème C). Et l’étape intermédiaire qui couperait ${m('a³ + ab')} en deux étapes de rang un
  est invisible dans les étiquettes (théorème B).</li></ol>
  <p>Pour le réseau, les deux moitiés sont mesurées, non démontrées : il apprend à partir d’une moitié aléatoire les tâches
  dont une lecture concentre la table, et échoue sur celles qu’aucune lecture ne concentre. Un mode fort qui ne porte
  qu’une partie de la réponse n’enseigne que cette partie (plus bas).</p>`)}</section>`,

  `<section id="measured"><h3>Ce qui est mesuré</h3><ul>
  <li><strong>M sur les données du réseau.</strong> Pour ${m('p = 31, 61, 97')}, les moitiés d’entraînement des graines 7
  et 11 remplissent les deux conditions du théorème G pour ${m('ψ(a + b)')}, ${m('χ(ab)')} et
  ${m('χ(a + ab) = χ(a) χ(1 + b)')}. ADMM retrouve les trois à partir d’elles avec une erreur relative inférieure à
  ${m('10<sup>−10</sup>')}, ligne et colonne nulles des tables de ${m('χ')} comprises, et décode chaque case non vue. Sur
  les mêmes moitiés, ${m('ψ(a³ + ab)')} échoue, avec une erreur relative de 1,29 à 1,30 ${numerical('ADMM', L)}.</li>
  <li><strong>Tous les petits motifs.</strong> Les 511 motifs propres d’une table ${m('3 × 3')} à poids égaux, 510 à poids
  aléatoires, et environ 12 000 motifs de tables jusqu’à ${m('3 × 4')} avec des coefficients nuls : chaque classe se
  comporte comme le disent les théorèmes E, F et G ${numerical('ADMM', L)}.</li>
  <li><strong>Le réseau.</strong> Le pic d’une tâche est la plus grande part de sa table que porte un mode d’interaction
  centré, pour une lecture de module un :
  ${eq('κ = max |Σ<sub>a,b</sub> ρ(f(a, b)) g(a) h(b)|² / p²')}
  sur ${m('|ρ| = 1')} et les vecteurs unitaires ${m('g, h')} de somme nulle. Il est trouvé par maximisation alternée à
  partir de 320 départs, chaque valeur est donc la meilleure trouvée. Sur 22 tâches à ${m('p = 97')}, il est compris entre
  0,28 et 1 pour les sept tâches ci-dessous qui s’apprennent, et ne baisse pas quand ${m('p')} grandit ; pour les tâches
  plates il vaut au plus 0,106, près du 0,069 d’une table aléatoire, et décroît à peu près comme ${m('1/p')} : 0,142, 0,106
  et 0,057 pour ${m('a³ + ab')} à ${m('p = 47, 97, 199')}, sous le plafond de 0,213 du théorème C à ${m('p = 97')}. Dix
  entraînements ont été prédits à partir de ${m('κ')} avant d’être lancés, et les dix ont donné ce qui était prédit :
  ${m('a² + ab')}, ${m('a² + ab + b² + a')} et ${m('a³ + ab² + b')} restent à 1 à 2 % sur la moitié non vue, comme les
  témoins ${m('a³ + ab')} et ${m('a² + ab + b²')}, tandis que ${m('ab')}, ${m('a²b')}, ${m('a + ab')}, ${m('(a + b)²')},
  ${m('π(a + b)')}, ${m('a³ + b')} et ${m('(a + b)³')} atteignent 99 % en 1000 à 3000 pas, avec les deux graines
  ${numerical('entraînement', L)}.</li></ul></section>`,

  `<section id="unproved"><h3>Ce qui n’est pas démontré</h3><ul>
  <li><strong>Que l’entraînement trouve la réponse de M.</strong> C’est la seule étape entre les théorèmes sur M et le
  réseau ${heuristic('entraînement ≈ M', L)}.</li>
  <li><strong>Qu’un mode fort suffise au réseau.</strong> Ce n’est pas le cas, sous cette forme. Pour
  ${m('2⌊(a³ + ab)/2⌋ + (a + b <span class="op">mod</span> 2)')}, le pic ${m('κ = 0,98')} vient de la seule parité de la
  réponse ; sans ce mode il vaut 0,094. Le réseau prédit la parité sur 79 à 80 % de la moitié non vue et la réponse
  elle-même sur 2,3 à 2,7 %, à peu près les ${m('2/p')} du hasard sur le reste : il apprend ce que porte le pic et rien du
  reste plat ${numerical('entraînement', L)}.</li>
  <li><strong>Le rang au-dessus de un.</strong> Pour une table dont la meilleure lecture est de rang ${m('r ≥ 2')}, aucun
  critère comme le théorème G n’est démontré ${open('rang r', L)}.</li>
  <li><strong>Les tâches plates hors de la famille.</strong> Pour ${m('a² + ab + b²')}, ${m('a² + ab + b² + a')} et
  ${m('a³ + ab² + b')}, le pic n’est petit que numériquement ; aucun plafond comme celui du théorème C n’est démontré
  ${open('plafond de κ', L)}. Le rang effectif ${m(`(‖K‖${S1}/‖K‖<sub>S2</sub>)²`)} ne remplace pas le pic : sa plus
  petite valeur sur les lectures de ${m('a³ + ab')} vient de l’indicatrice de la réponse 0, et M ne complète cette table à
  partir d’aucune fraction de ses cases jusqu’à 99 % ${numerical('ADMM', L)}.</li>
  <li><strong>Les lectures réelles d’une table plate.</strong> Les noyaux réels ${m('cos(2πrf/p)')} et
  ${m('sin(2πrf/p)')} de ${m('f = a³ + ab')} sont singuliers, et le théorème A ne dit rien d’eux. Numériquement, M décode
  les cases cachées dont le miroir ${m('(−a, b)')} est vu, à peu près la moitié, grâce à la symétrie
  ${m('f(−a, b) = −f(a, b)')} ${numerical('ADMM', L)}.</li></ul>
  <p class="sub">Source : <code>review/flat_spectrum.md</code> dans le dépôt transformer. Lean :
  <code>Transformer.Grokking.FlatSpectrum</code> et <code>Transformer.Weil</code>.</p></section>`,
].join('\n');

export const fr: HomeText = {
  nav: 'Cours',
  title: 'Que peut apprendre un réseau à partir de la moitié d’une table ?',
  kicker: 'Un cours sur les spectres et l’apprentissage',
  lead: `Prenez une fonction de deux nombres modulo un nombre premier ${m('p')}, par exemple ${m('ab <span class="op">mod</span> p')}. Placez-la sur
    le carré unité, ${m('x = a/p')} et ${m('y = b/p')} : elle devient ${m(`${frac}(pxy)`)}, qui, quand ${m('p')} grandit,
    n’a de limite que sur un ensemble de mesure nulle — une discontinuité de seconde espèce presque partout. Un réseau voit
    la moitié des ${m('p²')} valeurs et doit donner le reste. Le cours mène à un seul énoncé :`,
  statement: 'Un réseau de neurones peut apprendre une fonction à discontinuités de seconde espèce à partir d’un ensemble incomplet d’observations, si la fonction a un bon spectre.',
  precise: `<p>Chacun de ses mots est précisé en chemin :</p><ul>
    <li><strong>la fonction</strong> : ${m('f(a, b)')} sur ${m('ℤ/p × ℤ/p')}, lue comme une table ${m('p × p')} ;</li>
    <li><strong>les observations</strong> : une moitié de la table tirée au hasard ;</li>
    <li><strong>le réseau</strong> : un plongement partagé par les deux opérandes et la lecture, une rotation de 90° du
    second opérande, Peri-LN avec RMSNorm et un bloc SwiGLU, entraîné par Schedule-Free AdamW ;</li>
    <li><strong>un bon spectre</strong> : une lecture de la réponse change la table en une table à forte direction
    singulière. Un spectre plat n’en a aucune, quelle que soit la lecture.</li></ul>`,
  fullTitle: 'L’énoncé complet',
  full,
  endsTitle: 'Les deux bouts',
  ends: [
    {title: 'La plus difficile qu’il apprend', body: `Une permutation aléatoire de ${m('a + b')}, ou le produit ${m('ab')} :
      chaque table ressemble à du bruit, mais une lecture la change en une table de rang un, ${m('ψ(a) ψ(b)')} pour la
      première et ${m('χ(a) χ(b)')} pour la seconde, où ${m('χ')} est un caractère multiplicatif ${lean('rang un')}. Le
      réseau atteint 99 % sur la moitié non vue ${numerical('entraînement', 'fr')}.`},
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
