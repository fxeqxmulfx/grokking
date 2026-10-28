/** The home page: the statement the course works toward, its two ends, and the outline. */

import type {Lang, Localized} from '../i18n.ts';
import {hrefOf} from '../router.ts';
import {box, heuristic, lean, m, numerical} from './markup.ts';
import {OUTLINE, PARTS, PART_NAMES, PLANNED, pageById} from './registry.ts';

interface HomeText {
  readonly nav: string;
  readonly title: string;
  readonly kicker: string;
  readonly lead: string;
  readonly statement: string;
  readonly precise: string;
  readonly endsTitle: string;
  readonly ends: readonly {readonly title: string; readonly body: string}[];
  readonly audienceTitle: string;
  readonly audience: string;
  readonly legend: string;
  readonly pagesTitle: string;
  readonly writing: string;
}

/** The marks of the tags, in the order of every legend. */
const MARKS = [['good', '✓'], ['tight', '~'], ['run', '≈'], ['open', '○'], ['open', '·']] as const;

/** The five tags, each a pair of its word and its meaning. */
function legendOf(entries: readonly (readonly [string, string])[]): string {
  return entries.map(([word, meaning], k) => {
    const [kind, mark] = MARKS[k] ?? MARKS[3];
    return `<span class="tag"><span class="icon ${kind}" aria-hidden="true">${mark}</span>${word}</span> ${meaning}`;
  }).join(', ') + '.';
}

const TEXT: Localized<HomeText> = {
  en: {
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
  },
  fr: {
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
  },
  ru: {
    nav: 'Курс',
    title: 'Что сеть может выучить по половине таблицы?',
    kicker: 'Курс о спектрах и обучении',
    lead: `Возьмите функцию двух чисел по модулю простого ${m('p')}, например ${m('ab <span class="op">mod</span> p')}. Перенесите её на единичный
      квадрат, ${m('x = a/p')} и ${m('y = b/p')}: она превращается в ${m('<span class="op">frac</span>(pxy)')}, у которой с ростом ${m('p')} нет
      предела ни в одной точке, — разрыв второго рода всюду. Сеть видит половину из ${m('p²')} значений и должна назвать
      остальные. Курс ведёт к одному утверждению:`,
    statement: 'Нейросеть способна изучить функцию с разрывами второго рода по неполному набору наблюдений, если у функции хороший спектр.',
    precise: `<p>Каждое слово в нём уточняется по дороге:</p><ul>
      <li><strong>функция</strong>: ${m('f(a, b)')} на ${m('ℤ/p × ℤ/p')}, записанная как таблица ${m('p × p')};</li>
      <li><strong>наблюдения</strong>: случайная половина таблицы;</li>
      <li><strong>сеть</strong>: эмбеддинг, поворот на 90°, Peri-LN с RMSNorm и блок SwiGLU, обученные Schedule-Free
      AdamW;</li>
      <li><strong>хороший спектр</strong>: какое-то считывание ответа превращает таблицу в таблицу с сильным сингулярным
      направлением. У плоского спектра такого нет ни при каком считывании.</li></ul>`,
    endsTitle: 'Два края',
    ends: [
      {title: 'Самое трудное, что она выучивает', body: `Случайная перестановка ${m('a + b')} или само произведение ${m('ab')}:
        обе таблицы похожи на шум и разрывны всюду, но подходящее считывание превращает каждую в таблицу ранга один —
        ${m('ψ(a) ψ(b)')} для первой и ${m('χ(a) χ(b)')} для второй, где ${m('χ')} — мультипликативный характер
        ${lean('ранг один')}. На невиденной половине сеть достигает 99 % ${numerical('обучение', 'ru')}.`},
      {title: 'Самое простое, чего она не может', body: `${m('a² + ab')} — многочлен второй степени. При любом считывании его
        таблица плоская ${lean('теорема C')}, и на невиденной половине сеть остаётся на уровне угадывания
        ${numerical('обучение', 'ru')}.`},
      {title: 'Граница', body: `В семействе ${m('P(a) + ab')} граница проходит ровно между первой и второй степенью:
        ${m('a + ab')} выучивается, ${m('a² + ab')} — нет. Спектральная сторона доказана ${lean('C.4')}. Переход от спектра к
        обучению — не теорема; десять предсказаний, сделанных по спектру до обучения, все подтвердились
        ${heuristic('спектр → обучение', 'ru')}.`},
    ],
    audienceTitle: 'Для кого',
    audience: `Для студентов, знающих анализ вплоть до комплексного: пределы и непрерывность, ряды Фурье, ${m('e<sup>iθ</sup>')},
      матрицы и собственные числа. Теория групп и машинное обучение не предполагаются: страницы вводят и то и другое по
      ходу дела.`,
    legend: legendOf([['Lean', 'доказано в Lean'], ['вручную', 'доказано только на бумаге'], ['численно', 'измерено'], ['не доказано', 'открыто'], ['эвристика', 'шаг моделирования, а не теорема']]),
    pagesTitle: 'Страницы',
    writing: 'пишется',
  },
};

export const HOME_NAV: Localized<string> = {en: TEXT.en.nav, fr: TEXT.fr.nav, ru: TEXT.ru.nav};
export const HOME_TITLE: Localized<string> = {en: TEXT.en.title, fr: TEXT.fr.title, ru: TEXT.ru.title};

function outlineHTML(lang: Lang, writing: string): string {
  return PARTS.map(part => {
    const items = OUTLINE.flatMap(id => {
      const page = pageById(id);
      if (page) {
        if (page.part !== part) return [];
        const t = page.text[lang];
        return [`<li><a href="${hrefOf({lang, page: id})}">${t.title}</a><span class="summary">${t.summary}</span></li>`];
      }
      const planned = PLANNED.find(p => p.id === id);
      if (!planned || planned.part !== part) return [];
      const t = planned.text[lang];
      return [`<li class="planned"><span class="title">${t.title}</span> <span class="soon">${writing}</span><span class="summary">${t.summary}</span></li>`];
    });
    return `<div class="part"><div class="panel-title">${PART_NAMES[lang][part]}</div><ol>${items.join('')}</ol></div>`;
  }).join('');
}

export function homeHTML(lang: Lang): string {
  const t = TEXT[lang];
  const ends = t.ends.map(e => `<div class="end"><div class="panel-title">${e.title}</div><p>${e.body}</p></div>`).join('');
  return `<article class="page home">
    <header class="page-head"><div class="kicker">${t.kicker}</div><h1>${t.title}</h1></header>
    <p class="lead">${t.lead}</p>
    ${box(`<p class="statement">${t.statement}</p>`)}
    ${t.precise}
    <section id="ends"><h2>${t.endsTitle}</h2><div class="ends">${ends}</div></section>
    <section id="audience"><h2>${t.audienceTitle}</h2><p>${t.audience}</p><p class="sub">${t.legend}</p></section>
    <section id="pages"><h2>${t.pagesTitle}</h2><div class="outline">${outlineHTML(lang, t.writing)}</div></section>
  </article>`;
}

const MISSING: Localized<{readonly title: string; readonly body: (home: string) => string}> = {
  en: {title: 'No such page', body: home => `This address names no page of the course. Go to the <a href="${home}">first page</a>.`},
  fr: {title: 'Cette page n’existe pas', body: home => `Cette adresse ne désigne aucune page du cours. Allez à la <a href="${home}">première page</a>.`},
  ru: {title: 'Такой страницы нет', body: home => `По этому адресу нет страницы курса. Перейдите на <a href="${home}">главную</a>.`},
};

export const MISSING_TITLE: Localized<string> = {en: MISSING.en.title, fr: MISSING.fr.title, ru: MISSING.ru.title};

export function missingHTML(lang: Lang): string {
  const t = MISSING[lang];
  return `<article class="page"><header class="page-head"><h1>${t.title}</h1></header><p>${t.body(hrefOf({lang, page: 'home'}))}</p></article>`;
}
