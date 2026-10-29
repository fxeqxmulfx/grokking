/**
 * The course: its parts, its pages in reading order, and the pages still being written. Only
 * written pages are routes; the home page shows the whole outline.
 */

import type {Localized} from '../i18n.ts';
import type {Page, PartId} from './types.ts';
import {m} from './markup.ts';
import {RECOVERY} from './recovery/index.ts';

export const PAGES: readonly Page[] = [RECOVERY];
export const PAGE_IDS: readonly string[] = PAGES.map(page => page.id);

export function pageById(id: string): Page | undefined {
  return PAGES.find(page => page.id === id);
}

export const PARTS: readonly PartId[] = ['foundations', 'model', 'obstacles', 'frontier'];

export const PART_NAMES: Localized<Readonly<Record<PartId, string>>> = {
  en: {foundations: 'Foundations', model: 'The model and what it computes', obstacles: 'When the spectrum is flat', frontier: 'The frontier'},
  fr: {foundations: 'Fondements', model: 'Le modèle et ce qu’il calcule', obstacles: 'Quand le spectre est plat', frontier: 'La frontière'},
  ru: {foundations: 'Основы', model: 'Модель и что она вычисляет', obstacles: 'Когда спектр плоский', frontier: 'Граница'},
};

export interface PlannedPage {
  readonly id: string;
  readonly part: PartId;
  readonly text: Localized<{readonly title: string; readonly summary: string}>;
}

export const PLANNED: readonly PlannedPage[] = [
  {id: 'start', part: 'foundations', text: {
    en: {title: 'The question', summary: `A function on ${m('ℤ/p × ℤ/p')} as a table, why ${m('ab <span class="op">mod</span> p')}, as ${m('p')} grows, has discontinuities of the second kind almost everywhere, and what it means to learn it from half of the table.`},
    fr: {title: 'La question', summary: `Une fonction sur ${m('ℤ/p × ℤ/p')} vue comme une table, pourquoi ${m('ab <span class="op">mod</span> p')}, quand ${m('p')} grandit, a des discontinuités de seconde espèce presque partout, et ce que veut dire l’apprendre à partir de la moitié de la table.`},
    ru: {title: 'Вопрос', summary: `Функция на ${m('ℤ/p × ℤ/p')} как таблица, почему у ${m('ab <span class="op">mod</span> p')} с ростом ${m('p')} почти всюду разрывы второго рода и что значит выучить её по половине таблицы.`},
  }},
  {id: 'fourier', part: 'foundations', text: {
    en: {title: 'Characters: Fourier series on ℤ/p', summary: `From ${m('e<sup>inθ</sup>')} on the circle to ${m('ψ(x) = e<sup>2πix/p</sup>')} and the multiplicative characters; Gauss sums, of modulus ${m('√p')} for nontrivial characters.`},
    fr: {title: 'Les caractères : séries de Fourier sur ℤ/p', summary: `De ${m('e<sup>inθ</sup>')} sur le cercle à ${m('ψ(x) = e<sup>2πix/p</sup>')} et aux caractères multiplicatifs ; les sommes de Gauss, de module ${m('√p')} pour des caractères non triviaux.`},
    ru: {title: 'Характеры: ряды Фурье на ℤ/p', summary: `От ${m('e<sup>inθ</sup>')} на окружности к ${m('ψ(x) = e<sup>2πix/p</sup>')} и мультипликативным характерам; суммы Гаусса, при нетривиальных характерах с модулем ${m('√p')}.`},
  }},
  {id: 'spectrum', part: 'foundations', text: {
    en: {title: 'The spectrum of a table', summary: `Singular values, the nuclear norm and the effective rank; ${m('ψ(a + b)')} has rank one, ${m('ψ(a³ + ab)')} is flat (Proposition 2).`},
    fr: {title: 'Le spectre d’une table', summary: `Valeurs singulières, norme nucléaire et rang effectif ; la table ${m('ψ(a + b)')} est de rang un, la table ${m('ψ(a³ + ab)')} est plate (proposition 2).`},
    ru: {title: 'Спектр таблицы', summary: `Сингулярные числа, ядерная норма и эффективный ранг; у таблицы ${m('ψ(a + b)')} ранг один, таблица ${m('ψ(a³ + ab)')} плоская (предложение 2).`},
  }},
  {id: 'model', part: 'model', text: {
    en: {title: 'The network', summary: 'Embedding, the 90° rotation, Peri-LN with RMSNorm, SwiGLU and Schedule-Free AdamW, and why the cheapest factorization of a table, under weight decay, costs its nuclear norm.'},
    fr: {title: 'Le réseau', summary: 'Plongement, rotation de 90°, Peri-LN avec RMSNorm, SwiGLU et Schedule-Free AdamW, et pourquoi la factorisation la moins chère d’une table, sous la pénalité sur les poids, coûte sa norme nucléaire.'},
    ru: {title: 'Сеть', summary: 'Эмбеддинг, поворот на 90°, Peri-LN с RMSNorm, SwiGLU и Schedule-Free AdamW, и почему самое дешёвое по штрафу на веса разложение таблицы стоит ровно её ядерную норму.'},
  }},
  {id: 'flat', part: 'obstacles', text: {
    en: {title: 'M does not recover a flat table without zeros', summary: `Theorem A: an invertible table has the least nuclear norm among the matrices equal to it on ${m('Ω')} exactly when its polar factor vanishes off ${m('Ω')}; when one cell of ${m('ψ(a³ + ab)')} is hidden, M fills it with the opposite phase; Theorem B: for ${m('r ≠ 0')}, the mean of ${m('ψ<sub>r</sub>(ab)')} given the label ${m('a³ + ab')} has squared norm ${m('O(1/p)')}.`},
    fr: {title: 'M ne retrouve pas une table plate sans zéros', summary: `Théorème A : une table inversible a la plus petite norme nucléaire parmi les matrices qui lui sont égales sur ${m('Ω')} exactement quand son facteur polaire s’annule hors de ${m('Ω')} ; quand une seule case de ${m('ψ(a³ + ab)')} est cachée, M la remplit par la phase opposée ; théorème B : pour ${m('r ≠ 0')}, la moyenne de ${m('ψ<sub>r</sub>(ab)')} sachant l’étiquette ${m('a³ + ab')} a une norme au carré en ${m('O(1/p)')}.`},
    ru: {title: 'M не восстанавливает плоскую таблицу без нулей', summary: `Теорема A: обратимая таблица имеет наименьшую ядерную норму среди матриц, совпадающих с ней на ${m('Ω')}, тогда и только тогда, когда её полярный множитель обращается в нуль вне ${m('Ω')}; когда скрыта одна клетка ${m('ψ(a³ + ab)')}, M заполняет её противоположной фазой; теорема B: при ${m('r ≠ 0')} условное среднее ${m('ψ<sub>r</sub>(ab)')} при данной метке ${m('a³ + ab')} имеет квадрат нормы ${m('O(1/p)')}.`},
  }},
  {id: 'readout', part: 'obstacles', text: {
    en: {title: 'Every readout has a low peak', summary: `Theorem C: for ${m('P(a) + ab')}, some readout of the answer has normalized peak 1 when ${m('deg P ≤ 1')}, and every readout at most ${m('λ/(p − 1)')}, of order ${m('√(2(deg P − 1)/p)')}, when ${m('deg P ≥ 2')}; the peak ${m('κ')}.`},
    fr: {title: 'Toute lecture a un pic bas', summary: `Théorème C : pour ${m('P(a) + ab')}, une certaine lecture de la réponse a un pic normalisé égal à 1 quand ${m('deg P ≤ 1')}, et toute lecture un pic normalisé d’au plus ${m('λ/(p − 1)')}, de l’ordre de ${m('√(2(deg P − 1)/p)')}, quand ${m('deg P ≥ 2')} ; le pic ${m('κ')}.`},
    ru: {title: 'У любого считывания низкий пик', summary: `Теорема C: для ${m('P(a) + ab')} нормированный пик некоторого считывания ответа равен 1 при ${m('deg P ≤ 1')}, а любого считывания — не больше ${m('λ/(p − 1)')}, порядка ${m('√(2(deg P − 1)/p)')}, при ${m('deg P ≥ 2')}; пик ${m('κ')}.`},
  }},
  {id: 'weil', part: 'obstacles', text: {
    en: {title: 'Weil’s bound', summary: `Why a sum of ${m('ψ(rP(x))')} over ${m('x')}, with ${m('deg P = m')}, ${m('p ∤ m')} and ${m('r ≠ 0')}, has modulus at most ${m('(m − 1)√p')}, how this enters Theorem B, and the elliptic curves behind one-hot readouts.`},
    fr: {title: 'La borne de Weil', summary: `Pourquoi une somme de ${m('ψ(rP(x))')} sur ${m('x')}, avec ${m('deg P = m')}, ${m('p ∤ m')} et ${m('r ≠ 0')}, est de module au plus ${m('(m − 1)√p')}, comment cela entre dans le théorème B, et les courbes elliptiques derrière les lectures one-hot.`},
    ru: {title: 'Оценка Вейля', summary: `Почему сумма ${m('ψ(rP(x))')} по ${m('x')} при ${m('deg P = m')}, ${m('p ∤ m')} и ${m('r ≠ 0')} по модулю не больше ${m('(m − 1)√p')}, как это входит в теорему B и какие эллиптические кривые стоят за one-hot-считываниями.`},
  }},
  {id: 'train', part: 'frontier', text: {
    en: {title: 'Train it yourself', summary: `The network of this course trains in your browser on any table; compare the outcome with the heuristic prediction of the peak ${m('κ')}.`},
    fr: {title: 'Entraînez-le vous-même', summary: `Le réseau de ce cours s’entraîne dans votre navigateur sur n’importe quelle table ; comparez le résultat à la prédiction heuristique du pic ${m('κ')}.`},
    ru: {title: 'Обучите сами', summary: `Сеть этого курса обучается в вашем браузере на любой таблице; сравните результат с эвристическим предсказанием по пику ${m('κ')}.`},
  }},
  {id: 'frontier', part: 'frontier', text: {
    en: {title: 'The hardest and the simplest', summary: 'The hardest function the network learns and the simplest it cannot, with the status of every claim between them.'},
    fr: {title: 'La plus difficile et la plus simple', summary: 'La fonction la plus difficile que le réseau apprend et la plus simple qu’il n’apprend pas, avec le statut de chaque énoncé entre les deux.'},
    ru: {title: 'Самая трудная и самая простая', summary: 'Самая трудная функция, которую сеть выучивает, и самая простая, которую она выучить не может, со статусом каждого утверждения между ними.'},
  }},
  {id: 'status', part: 'frontier', text: {
    en: {title: 'What is proved', summary: 'Every claim in the course on one board: proved in Lean or by hand, measured, heuristic or open.'},
    fr: {title: 'Ce qui est démontré', summary: 'Chaque énoncé du cours sur un même tableau : démontré en Lean ou à la main, mesuré, heuristique ou ouvert.'},
    ru: {title: 'Что доказано', summary: 'Все утверждения курса на одной доске: доказанные в Lean или вручную, измеренные, эвристические или открытые.'},
  }},
];

/** The reading order of every page, written or planned. */
export const OUTLINE: readonly string[] = ['start', 'fourier', 'spectrum', 'model', 'recovery', 'flat', 'readout', 'weil', 'train', 'frontier', 'status'];
