/**
 * The course: its parts, its pages in reading order, and the pages still being written. Only
 * written pages are routes; the home page shows the whole outline.
 */

import type {Localized} from '../i18n.ts';
import type {Page, PartId} from './types.ts';
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
    en: {title: 'The question', summary: 'A function on ℤ/p × ℤ/p as a table, why ab mod p is discontinuous everywhere, and what it means to learn it from half of the table.'},
    fr: {title: 'La question', summary: 'Une fonction sur ℤ/p × ℤ/p vue comme une table, pourquoi ab mod p est partout discontinue, et ce que veut dire l’apprendre à partir de la moitié de la table.'},
    ru: {title: 'Вопрос', summary: 'Функция на ℤ/p × ℤ/p как таблица, почему ab mod p разрывна всюду и что значит выучить её по половине таблицы.'},
  }},
  {id: 'fourier', part: 'foundations', text: {
    en: {title: 'Characters: Fourier series on ℤ/p', summary: 'From e<sup>inθ</sup> on the circle to ψ(x) = e<sup>2πix/p</sup> and the multiplicative characters; Gauss sums of modulus √p.'},
    fr: {title: 'Les caractères : séries de Fourier sur ℤ/p', summary: 'De e<sup>inθ</sup> sur le cercle à ψ(x) = e<sup>2πix/p</sup> et aux caractères multiplicatifs ; les sommes de Gauss de module √p.'},
    ru: {title: 'Характеры: ряды Фурье на ℤ/p', summary: 'От e<sup>inθ</sup> на окружности к ψ(x) = e<sup>2πix/p</sup> и мультипликативным характерам; суммы Гаусса модуля √p.'},
  }},
  {id: 'spectrum', part: 'foundations', text: {
    en: {title: 'The spectrum of a table', summary: 'Singular values, the nuclear norm and the effective rank; a + b has rank one, a³ + ab is flat (Proposition 2).'},
    fr: {title: 'Le spectre d’une table', summary: 'Valeurs singulières, norme nucléaire et rang effectif ; a + b est de rang un, a³ + ab est plat (proposition 2).'},
    ru: {title: 'Спектр таблицы', summary: 'Сингулярные числа, ядерная норма и эффективный ранг; у a + b ранг один, a³ + ab плоская (предложение 2).'},
  }},
  {id: 'model', part: 'model', text: {
    en: {title: 'The network', summary: 'Embedding, the 90° rotation, Peri-LN with RMSNorm, SwiGLU and Schedule-Free AdamW, and why weight decay leads to the nuclear norm.'},
    fr: {title: 'Le réseau', summary: 'Plongement, rotation de 90°, Peri-LN avec RMSNorm, SwiGLU et Schedule-Free AdamW, et pourquoi la pénalité sur les poids mène à la norme nucléaire.'},
    ru: {title: 'Сеть', summary: 'Эмбеддинг, поворот на 90°, Peri-LN с RMSNorm, SwiGLU и Schedule-Free AdamW, и почему штраф на веса ведёт к ядерной норме.'},
  }},
  {id: 'flat', part: 'obstacles', text: {
    en: {title: 'A flat table cannot be filled', summary: 'Theorem A: when the least nuclear norm keeps a full-rank table; one missing entry of a³ + ab is filled wrongly; Theorem B: the product ab is invisible.'},
    fr: {title: 'Une table plate ne se complète pas', summary: 'Théorème A : quand la plus petite norme nucléaire garde une table de rang plein ; une entrée manquante de a³ + ab est mal remplie ; théorème B : le produit ab est invisible.'},
    ru: {title: 'Плоскую таблицу не заполнить', summary: 'Теорема A: когда наименьшая ядерная норма сохраняет таблицу полного ранга; пропущенная клетка a³ + ab заполняется неверно; теорема B: произведение ab невидимо.'},
  }},
  {id: 'readout', part: 'obstacles', text: {
    en: {title: 'Every readout fails', summary: 'Theorem C: for P(a) + ab with deg P ≥ 2 no readout of the answer has a strong direction; the dichotomy at deg P ≤ 1; the peak κ.'},
    fr: {title: 'Toute lecture échoue', summary: 'Théorème C : pour P(a) + ab avec deg P ≥ 2, aucune lecture de la réponse n’a de direction forte ; la dichotomie en deg P ≤ 1 ; le pic κ.'},
    ru: {title: 'Любое считывание бессильно', summary: 'Теорема C: для P(a) + ab при deg P ≥ 2 ни одно считывание ответа не даёт сильного направления; дихотомия при deg P ≤ 1; пик κ.'},
  }},
  {id: 'weil', part: 'obstacles', text: {
    en: {title: 'Weil’s bound', summary: 'Why character sums of polynomials are of size √p, how this enters Theorem B, and the elliptic curves behind one-hot readouts.'},
    fr: {title: 'La borne de Weil', summary: 'Pourquoi les sommes de caractères de polynômes sont de taille √p, comment cela entre dans le théorème B, et les courbes elliptiques derrière les lectures one-hot.'},
    ru: {title: 'Оценка Вейля', summary: 'Почему суммы характеров от многочленов имеют размер √p, как это входит в теорему B и какие эллиптические кривые стоят за one-hot-считываниями.'},
  }},
  {id: 'train', part: 'frontier', text: {
    en: {title: 'Train it yourself', summary: 'The network of this course trains in your browser on any table; compare the outcome with the prediction of the spectrum.'},
    fr: {title: 'Entraînez-le vous-même', summary: 'Le réseau de ce cours s’entraîne dans votre navigateur sur n’importe quelle table ; comparez le résultat à la prédiction du spectre.'},
    ru: {title: 'Обучите сами', summary: 'Сеть этого курса обучается в вашем браузере на любой таблице; сравните результат с предсказанием спектра.'},
  }},
  {id: 'frontier', part: 'frontier', text: {
    en: {title: 'The hardest and the simplest', summary: 'The hardest function the network learns and the simplest it cannot, with the status of every claim between them.'},
    fr: {title: 'La plus difficile et la plus simple', summary: 'La fonction la plus difficile que le réseau apprend et la plus simple qu’il n’apprend pas, avec le statut de chaque énoncé entre les deux.'},
    ru: {title: 'Самая трудная и самая простая', summary: 'Самая трудная функция, которую сеть выучивает, и самая простая, которую она выучить не может, со статусом каждого утверждения между ними.'},
  }},
  {id: 'status', part: 'frontier', text: {
    en: {title: 'What is proved', summary: 'Every claim of the course on one board: proved in Lean, by hand, measured, or open.'},
    fr: {title: 'Ce qui est démontré', summary: 'Chaque énoncé du cours sur un même tableau : démontré en Lean, à la main, mesuré ou ouvert.'},
    ru: {title: 'Что доказано', summary: 'Все утверждения курса на одной доске: доказано в Lean, вручную, измерено или открыто.'},
  }},
];

/** The reading order of every page, written or planned. */
export const OUTLINE: readonly string[] = ['start', 'fourier', 'spectrum', 'model', 'recovery', 'flat', 'readout', 'weil', 'train', 'frontier', 'status'];
