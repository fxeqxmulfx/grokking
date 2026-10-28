/** Every word the recovery widgets show, in the three languages of the site. */

import type {Localized} from '../i18n.ts';
import type {LabId} from './model.ts';

/** Russian plural: the form for 1, for 2–4 and for 5–20 (21 takes the first again). */
export function ruPlural(n: number, one: string, few: string, many: string): string {
  const d = Math.abs(n) % 10, h = Math.abs(n) % 100;
  return d === 1 && h !== 11 ? one : d >= 2 && d <= 4 && (h < 12 || h > 14) ? few : many;
}

type Fits = 'perm' | 'plan';

export interface RecoveryStrings {
  readonly presets: Readonly<Record<LabId | 'springs', Readonly<Record<string, string>>>>;
  readonly pattern: string;
  readonly runAgain: string;
  readonly tableAria: (N: number, kept: number) => string;
  readonly cellTitle: (i: number, j: number, seen: boolean) => string;
  readonly dragTitle: (name: string, value: string) => string;
  readonly rigid: string;
  readonly notRigid: (pieces: number) => string;
  readonly fits: (kind: Fits, tight: boolean) => string;
  readonly noPlan: (R: string, alphaR: string, NR: string, betaNR: string) => string;
  readonly noPerm: (R: string, NR: string) => string;
  readonly theorem: (recovered: boolean, tag: string) => string;
  readonly byHand: string;
  readonly solverLine: (iter: number, running: boolean, err: string, gap: string) => string;
  readonly slow: string;
  readonly graphTitle: string;
  readonly graphAria: (pieces: number) => string;
  readonly rowName: (i: number) => string;
  readonly colName: (j: number) => string;
  readonly piece: (c: number, rows: string, cols: string) => string;
  readonly otherPieces: string;
  readonly flipNone: string;
  readonly flipShow: string;
  readonly flipDo: string;
  readonly flipDone: (changed: number, N: number) => string;
  readonly flipHint: string;
  readonly flowTitle: string;
  readonly flowAria: string;
  readonly flowRows: string;
  readonly flowCols: string;
  readonly flowLeft: (amount: string) => string;
  readonly witnessTitle: string;
  readonly witnessLead: (form: string) => string;
  readonly witnessNow: (s: string, actual: string, bound: string, N: number) => string;
  readonly witnessChart: string;
  readonly witnessBound: string;
  readonly witnessBoundShort: string;
  readonly witnessActual: string;
  readonly witnessLegendActual: string;
  readonly witnessLegendBound: string;
  readonly convTitle: string;
  readonly convAria: string;
  readonly step: string;
  readonly stepAt: (n: number) => string;
  readonly errorOff: string;
  readonly legendKept: string;
  readonly legendGood: string;
  readonly legendBad: string;
  readonly legendHidden: string;
  readonly legendPlan: (weights: boolean) => string;
  readonly legendBlock: string;
  readonly legendA: string;
  readonly legendB: string;
  readonly legendFlip: string;
  readonly springsAria: string;
  readonly springsRows: string;
  readonly springsCols: string;
  readonly springsSpring: string;
  readonly springsCircle: string;
  readonly start: string;
  readonly starts: Readonly<Record<'small' | 'large', string>>;
  readonly play: string;
  readonly pause: string;
  readonly newStart: string;
  readonly springsRigid: string;
  readonly springsNotRigid: (pieces: number) => string;
  readonly springsPlan: string;
  readonly springsNoPlan: string;
  readonly springsEnergy: string;
  readonly storyRecovered: string;
  readonly storyPieces: string;
  readonly storyNoPlan: string;
  readonly storyTrap: string;
}

const S1 = '<sub>S1</sub>';

const en: RecoveryStrings = {
  presets: {
    puzzle: {two: 'Two diagonals', one: 'One diagonal', cross: 'Row 0 + column 0', offset2: 'Offsets 0 and 2', half: 'Random half', twop: 'Random 2p cells'},
    rigid: {two: 'Two diagonals', blocks: 'Two blocks', emptyRow: 'An empty row', one: 'One diagonal'},
    hall: {cross: 'The cross', squeeze: 'Rows crowded into N − 2 columns', two: 'Two diagonals', oneCell: 'A row with one cell'},
    weights: {heavy: 'Cross, heavy row', equal: 'Cross, equal weights', edge: 'Cross, on the edge', light: 'Cross, row too light', heavyDiag: 'Two diagonals, heavy row'},
    springs: {rec: 'Rigid, with a plan', pieces: 'Two pieces', cross: 'The cross'},
  },
  pattern: 'Pattern',
  runAgain: 'Run M again',
  tableAria: (N, kept) => `A ${N} by ${N} table with ${kept} kept cells. Click a cell to keep or hide it.`,
  cellTitle: (i, j, seen) => `Cell (${i}, ${j}): ${seen ? 'kept' : 'hidden'}. Click to ${seen ? 'hide' : 'keep'} it.`,
  dragTitle: (name, value) => `Drag: ${name} = ${value}`,
  rigid: '<strong>Rigid</strong>: the kept cells hold the table together.',
  notRigid: n => `<strong>Not rigid</strong>: ${n} pieces.`,
  fits: (kind, tight) => `<strong>A ${kind === 'perm' ? 'permutation' : 'plan'} fits</strong>${tight ? ', with no room to spare' : ''}.`,
  noPlan: (R, alphaR, NR, betaNR) => `<strong>No plan</strong>: the rows R = ${R} hold ${alphaR} of sand, their columns N(R) = ${NR} offer ${betaNR}.`,
  noPerm: (R, NR) => `<strong>No permutation</strong>: the rows R = ${R} see only the columns ${NR}.`,
  theorem: (recovered, t) => `The theorem: <strong>${recovered ? 'M recovers the table' : 'M does not recover it'}</strong> ${t}`,
  byHand: 'by hand',
  solverLine: (iter, running, err, gap) =>
    `M after ${iter} steps${running ? ', running' : ''}: error off Ω <span class="readout">${err}</span>, ‖X‖${S1} − ‖K‖${S1} = <span class="readout">${gap}</span>.`,
  slow: 'With no room to spare M converges slowly; its limit is still the table.',
  graphTitle: 'Rows, columns and kept cells',
  graphAria: n => `Rows and columns joined by the kept cells: ${n} piece${n > 1 ? 's' : ''}.`,
  rowName: i => `row ${i}`,
  colName: j => `col ${j}`,
  piece: (c, rows, cols) => `piece ${c}: rows ${rows}, columns ${cols}`,
  otherPieces: 'the other pieces',
  flipNone: 'One piece: flipping its rows and its columns flips every cell twice, so the table does not change. No second table arises this way.',
  flipShow: 'Show the table',
  flipDo: 'Flip piece 1',
  flipDone: (changed, N) => `Every kept cell is unchanged, ${changed} hidden cells point the other way (orange), and the cost is still ‖K‖${S1} = ${N}.`,
  flipHint: 'Reverse the rows and the columns of piece 1, then compare the hidden cells.',
  flowTitle: 'The transport plan',
  flowAria: 'Sand moving from rows to columns through kept cells.',
  flowRows: 'rows: sand α',
  flowCols: 'columns: holes β',
  flowLeft: amount => `Red outline: sand with nowhere to go, ${amount} in all.`,
  witnessTitle: 'The cheaper witness',
  witnessLead: form => `Lower the missed block R × C: <span class="m">X(s) = ${form}</span> still agrees with the table on Ω.`,
  witnessNow: (s, actual, bound, N) =>
    `At s = ${s} it costs <span class="readout">${actual}</span>, under its bound <span class="readout">${bound}</span>; for small s &gt; 0 both lie below ‖K‖${S1} = ${N}.`,
  witnessChart: 'The cost of the lowered table against s',
  witnessBound: 'bound ½(‖U‖² + ‖V‖²)',
  witnessBoundShort: 'bound',
  witnessActual: '‖X(s)‖, computed',
  witnessLegendActual: `‖X(s)‖${S1}, computed`,
  witnessLegendBound: 'the bound from its factors',
  convTitle: 'M’s error off Ω',
  convAria: 'The error of M off Ω against the step',
  step: 'step',
  stepAt: n => `step ${n}`,
  errorOff: 'error off Ω',
  legendKept: 'kept cell, white arrow: the table',
  legendGood: 'M’s fill agrees',
  legendBad: 'M’s fill is wrong ✗',
  legendHidden: 'hidden cell: the table’s value',
  legendPlan: weights => (weights ? 'the plan T, dot size' : 'a permutation, or plan'),
  legendBlock: 'missed block R × C',
  legendA: '|a<sub>i</sub>|, drag',
  legendB: '|b<sub>j</sub>|, drag',
  legendFlip: 'a flipped hidden cell',
  springsAria: 'The row points x_i and the column points y_j during training',
  springsRows: 'x<sub>i</sub> = u<sub>i</sub>/a<sub>i</sub>, rows',
  springsCols: 'y<sub>j</sub> = v<sub>j</sub>/b<sub>j</sub>, columns',
  springsSpring: 'a spring per kept cell, width T<sub>ij</sub>',
  springsCircle: 'circle: radius 1',
  start: 'start',
  starts: {small: 'small', large: 'large'},
  play: 'Play',
  pause: 'Pause',
  newStart: 'New start',
  springsRigid: 'Rigid',
  springsNotRigid: n => `Not rigid: ${n} pieces`,
  springsPlan: 'A plan T fits',
  springsNoPlan: 'No plan: every kept cell gets a spring of width 1',
  springsEnergy: 'spring energy Σ T‖x − y‖²',
  storyRecovered: 'Every spring goes slack and all the points meet at one point of the circle: X = a bᵀ, up to the slight shrinkage of weight decay.',
  storyPieces: 'Each piece collapses to its own point. The pieces may sit anywhere on the circle, so the cells between them come out wrong.',
  storyNoPlan: 'With no plan the points cannot all meet: the layer settles on a matrix cheaper than the table.',
  storyTrap: ' From a large start the points can also wind once around the circle and stay there: a trap of the two-dimensional layer, not of M.',
};

const fr: RecoveryStrings = {
  presets: {
    puzzle: {two: 'Deux diagonales', one: 'Une diagonale', cross: 'Ligne 0 + colonne 0', offset2: 'Décalages 0 et 2', half: 'Moitié au hasard', twop: '2p cases au hasard'},
    rigid: {two: 'Deux diagonales', blocks: 'Deux blocs', emptyRow: 'Une ligne vide', one: 'Une diagonale'},
    hall: {cross: 'La croix', squeeze: 'Lignes serrées dans N − 2 colonnes', two: 'Deux diagonales', oneCell: 'Une ligne à une seule case'},
    weights: {heavy: 'Croix, ligne lourde', equal: 'Croix, poids égaux', edge: 'Croix, à la limite', light: 'Croix, ligne trop légère', heavyDiag: 'Deux diagonales, ligne lourde'},
    springs: {rec: 'Rigide, avec un plan', pieces: 'Deux morceaux', cross: 'La croix'},
  },
  pattern: 'Motif',
  runAgain: 'Relancer M',
  tableAria: (N, kept) => `Une table ${N} × ${N} avec ${kept} cases gardées. Cliquez sur une case pour la garder ou la cacher.`,
  cellTitle: (i, j, seen) => `Case (${i}, ${j}) : ${seen ? 'gardée' : 'cachée'}. Cliquez pour la ${seen ? 'cacher' : 'garder'}.`,
  dragTitle: (name, value) => `Faites glisser : ${name} = ${value}`,
  rigid: '<strong>Rigide</strong> : les cases gardées tiennent la table ensemble.',
  notRigid: n => `<strong>Pas rigide</strong> : ${n} morceaux.`,
  fits: (kind, tight) => `<strong>${kind === 'perm' ? 'Une permutation tient' : 'Un plan existe'}</strong>${tight ? ', sans aucune marge' : ''}.`,
  noPlan: (R, alphaR, NR, betaNR) => `<strong>Aucun plan</strong> : les lignes R = ${R} portent ${alphaR} de sable, leurs colonnes N(R) = ${NR} n’en reçoivent que ${betaNR}.`,
  noPerm: (R, NR) => `<strong>Aucune permutation</strong> : les lignes R = ${R} ne voient que les colonnes ${NR}.`,
  theorem: (recovered, t) => `Le théorème : <strong>${recovered ? 'M retrouve la table' : 'M ne la retrouve pas'}</strong> ${t}`,
  byHand: 'à la main',
  solverLine: (iter, running, err, gap) =>
    `M après ${iter} pas${running ? ', en cours' : ''} : erreur hors de Ω <span class="readout">${err}</span>, ‖X‖${S1} − ‖K‖${S1} = <span class="readout">${gap}</span>.`,
  slow: 'Sans marge, M converge lentement ; sa limite reste la table.',
  graphTitle: 'Lignes, colonnes et cases gardées',
  graphAria: n => `Lignes et colonnes reliées par les cases gardées : ${n} morceau${n > 1 ? 'x' : ''}.`,
  rowName: i => `ligne ${i}`,
  colName: j => `col. ${j}`,
  piece: (c, rows, cols) => `morceau ${c} : lignes ${rows}, colonnes ${cols}`,
  otherPieces: 'les autres morceaux',
  flipNone: 'Un seul morceau : retourner ses lignes et ses colonnes retourne chaque case deux fois, la table ne change pas. Aucune seconde table n’apparaît ainsi.',
  flipShow: 'Montrer la table',
  flipDo: 'Retourner le morceau 1',
  flipDone: (changed, N) => `Chaque case gardée est inchangée, ${changed} cases cachées pointent dans l’autre sens (orange), et le coût reste ‖K‖${S1} = ${N}.`,
  flipHint: 'Inversez les lignes et les colonnes du morceau 1, puis comparez les cases cachées.',
  flowTitle: 'Le plan de transport',
  flowAria: 'Le sable va des lignes aux colonnes par les cases gardées.',
  flowRows: 'lignes : sable α',
  flowCols: 'colonnes : trous β',
  flowLeft: amount => `Contour rouge : du sable sans destination, ${amount} en tout.`,
  witnessTitle: 'Le témoin moins cher',
  witnessLead: form => `Abaissez le bloc manqué R × C : <span class="m">X(s) = ${form}</span> coïncide toujours avec la table sur Ω.`,
  witnessNow: (s, actual, bound, N) =>
    `À s = ${s} il coûte <span class="readout">${actual}</span>, sous sa borne <span class="readout">${bound}</span> ; pour s &gt; 0 petit, les deux sont sous ‖K‖${S1} = ${N}.`,
  witnessChart: 'Le coût de la table abaissée en fonction de s',
  witnessBound: 'borne ½(‖U‖² + ‖V‖²)',
  witnessBoundShort: 'borne',
  witnessActual: '‖X(s)‖, calculée',
  witnessLegendActual: `‖X(s)‖${S1}, calculée`,
  witnessLegendBound: 'la borne tirée de ses facteurs',
  convTitle: 'L’erreur de M hors de Ω',
  convAria: 'L’erreur de M hors de Ω en fonction du pas',
  step: 'pas',
  stepAt: n => `pas ${n}`,
  errorOff: 'erreur hors de Ω',
  legendKept: 'case gardée, flèche blanche : la table',
  legendGood: 'le remplissage de M est juste',
  legendBad: 'le remplissage de M est faux ✗',
  legendHidden: 'case cachée : la valeur de la table',
  legendPlan: weights => (weights ? 'le plan T, taille du point' : 'une permutation, ou un plan'),
  legendBlock: 'bloc manqué R × C',
  legendA: '|a<sub>i</sub>|, à faire glisser',
  legendB: '|b<sub>j</sub>|, à faire glisser',
  legendFlip: 'une case cachée retournée',
  springsAria: 'Les points des lignes x_i et des colonnes y_j pendant l’entraînement',
  springsRows: 'x<sub>i</sub> = u<sub>i</sub>/a<sub>i</sub>, lignes',
  springsCols: 'y<sub>j</sub> = v<sub>j</sub>/b<sub>j</sub>, colonnes',
  springsSpring: 'un ressort par case gardée, épaisseur T<sub>ij</sub>',
  springsCircle: 'cercle : rayon 1',
  start: 'départ',
  starts: {small: 'petit', large: 'grand'},
  play: 'Lancer',
  pause: 'Pause',
  newStart: 'Nouveau départ',
  springsRigid: 'Rigide',
  springsNotRigid: n => `Pas rigide : ${n} morceaux`,
  springsPlan: 'Un plan T existe',
  springsNoPlan: 'Aucun plan : chaque case gardée reçoit un ressort d’épaisseur 1',
  springsEnergy: 'énergie des ressorts Σ T‖x − y‖²',
  storyRecovered: 'Tous les ressorts se détendent et tous les points se rejoignent en un point du cercle : X = a bᵀ, au léger rétrécissement près que cause la pénalité sur les poids.',
  storyPieces: 'Chaque morceau se contracte en son propre point. Les morceaux peuvent se placer n’importe où sur le cercle, si bien que les cases entre eux sortent fausses.',
  storyNoPlan: 'Sans plan, les points ne peuvent pas tous se rejoindre : la couche s’arrête sur une matrice moins chère que la table.',
  storyTrap: ' Depuis un grand départ, les points peuvent aussi faire un tour du cercle et y rester : un piège de la couche à deux dimensions, pas de M.',
};

const ru: RecoveryStrings = {
  presets: {
    puzzle: {two: 'Две диагонали', one: 'Одна диагональ', cross: 'Строка 0 + столбец 0', offset2: 'Сдвиги 0 и 2', half: 'Случайная половина', twop: '2p случайных клеток'},
    rigid: {two: 'Две диагонали', blocks: 'Два блока', emptyRow: 'Пустая строка', one: 'Одна диагональ'},
    hall: {cross: 'Крест', squeeze: 'Строки теснятся в N − 2 столбцах', two: 'Две диагонали', oneCell: 'Строка с одной клеткой'},
    weights: {heavy: 'Крест, тяжёлая строка', equal: 'Крест, равные веса', edge: 'Крест, на грани', light: 'Крест, строка слишком лёгкая', heavyDiag: 'Две диагонали, тяжёлая строка'},
    springs: {rec: 'Жёсткий, с планом', pieces: 'Два куска', cross: 'Крест'},
  },
  pattern: 'Шаблон',
  runAgain: 'Запустить M заново',
  tableAria: (N, kept) => `Таблица ${N} × ${N}, сохранено клеток: ${kept}. Щёлкните по клетке, чтобы сохранить или скрыть её.`,
  cellTitle: (i, j, seen) => `Клетка (${i}, ${j}): ${seen ? 'сохранена' : 'скрыта'}. Щёлкните, чтобы ${seen ? 'скрыть' : 'сохранить'} её.`,
  dragTitle: (name, value) => `Тяните: ${name} = ${value}`,
  rigid: '<strong>Жёсткий</strong>: сохранённые клетки скрепляют таблицу.',
  notRigid: n => `<strong>Не жёсткий</strong>: ${n} ${ruPlural(n, 'кусок', 'куска', 'кусков')}.`,
  fits: (kind, tight) => `<strong>${kind === 'perm' ? 'Перестановка есть' : 'План есть'}</strong>${tight ? ', без всякого запаса' : ''}.`,
  noPlan: (R, alphaR, NR, betaNR) => `<strong>Плана нет</strong>: в строках R = ${R} песка ${alphaR}, а их столбцы N(R) = ${NR} вмещают только ${betaNR}.`,
  noPerm: (R, NR) => `<strong>Перестановки нет</strong>: строки R = ${R} видят только столбцы ${NR}.`,
  theorem: (recovered, t) => `Теорема: <strong>${recovered ? 'M восстанавливает таблицу' : 'M её не восстанавливает'}</strong> ${t}`,
  byHand: 'вручную',
  solverLine: (iter, running, err, gap) =>
    `M после ${iter} ${ruPlural(iter, 'шага', 'шагов', 'шагов')}${running ? ', считает' : ''}: ошибка вне Ω <span class="readout">${err}</span>, ‖X‖${S1} − ‖K‖${S1} = <span class="readout">${gap}</span>.`,
  slow: 'Без запаса M сходится медленно; её предел всё равно таблица.',
  graphTitle: 'Строки, столбцы и сохранённые клетки',
  graphAria: n => `Строки и столбцы, связанные сохранёнными клетками: ${n} ${ruPlural(n, 'кусок', 'куска', 'кусков')}.`,
  rowName: i => `стр. ${i}`,
  colName: j => `столб. ${j}`,
  piece: (c, rows, cols) => `кусок ${c}: строки ${rows}, столбцы ${cols}`,
  otherPieces: 'остальные куски',
  flipNone: 'Один кусок: если перевернуть его строки и столбцы, каждая клетка перевернётся дважды, и таблица не изменится. Второй таблицы так не получить.',
  flipShow: 'Показать таблицу',
  flipDo: 'Перевернуть кусок 1',
  flipDone: (changed, N) => `Сохранённые клетки не изменились; скрытых клеток, повёрнутых в другую сторону (оранжевые): ${changed}; стоимость по-прежнему ‖K‖${S1} = ${N}.`,
  flipHint: 'Переверните строки и столбцы куска 1 и сравните скрытые клетки.',
  flowTitle: 'План перевозки',
  flowAria: 'Песок идёт из строк в столбцы через сохранённые клетки.',
  flowRows: 'строки: песок α',
  flowCols: 'столбцы: ямы β',
  flowLeft: amount => `Красный контур: песку некуда деться, всего ${amount}.`,
  witnessTitle: 'Более дешёвый свидетель',
  witnessLead: form => `Опустите пропущенный блок R × C: <span class="m">X(s) = ${form}</span> по-прежнему совпадает с таблицей на Ω.`,
  witnessNow: (s, actual, bound, N) =>
    `При s = ${s} он стоит <span class="readout">${actual}</span>, не больше своей оценки <span class="readout">${bound}</span>; при малых s &gt; 0 обе величины меньше ‖K‖${S1} = ${N}.`,
  witnessChart: 'Стоимость опущенной таблицы в зависимости от s',
  witnessBound: 'оценка ½(‖U‖² + ‖V‖²)',
  witnessBoundShort: 'оценка',
  witnessActual: '‖X(s)‖, вычислено',
  witnessLegendActual: `‖X(s)‖${S1}, вычислено`,
  witnessLegendBound: 'оценка через множители',
  convTitle: 'Ошибка M вне Ω',
  convAria: 'Ошибка M вне Ω в зависимости от шага',
  step: 'шаг',
  stepAt: n => `шаг ${n}`,
  errorOff: 'ошибка вне Ω',
  legendKept: 'сохранённая клетка, белая стрелка: таблица',
  legendGood: 'M заполнила верно',
  legendBad: 'M заполнила неверно ✗',
  legendHidden: 'скрытая клетка: значение таблицы',
  legendPlan: weights => (weights ? 'план T, размер точки' : 'перестановка, или план'),
  legendBlock: 'пропущенный блок R × C',
  legendA: '|a<sub>i</sub>|, тяните',
  legendB: '|b<sub>j</sub>|, тяните',
  legendFlip: 'перевёрнутая скрытая клетка',
  springsAria: 'Точки строк x_i и столбцов y_j во время обучения',
  springsRows: 'x<sub>i</sub> = u<sub>i</sub>/a<sub>i</sub>, строки',
  springsCols: 'y<sub>j</sub> = v<sub>j</sub>/b<sub>j</sub>, столбцы',
  springsSpring: 'пружина на каждую сохранённую клетку, толщина T<sub>ij</sub>',
  springsCircle: 'окружность радиуса 1',
  start: 'старт',
  starts: {small: 'малый', large: 'большой'},
  play: 'Пуск',
  pause: 'Пауза',
  newStart: 'Новый старт',
  springsRigid: 'Жёсткий',
  springsNotRigid: n => `Не жёсткий: ${n} ${ruPlural(n, 'кусок', 'куска', 'кусков')}`,
  springsPlan: 'План T есть',
  springsNoPlan: 'Плана нет: каждая сохранённая клетка получает пружину толщины 1',
  springsEnergy: 'энергия пружин Σ T‖x − y‖²',
  storyRecovered: 'Все пружины ослабевают, и все точки сходятся в одну точку окружности: X = a bᵀ, с точностью до лёгкого сжатия от штрафа на веса.',
  storyPieces: 'Каждый кусок стягивается в свою точку. Куски могут встать где угодно на окружности, поэтому клетки между ними выходят неверными.',
  storyNoPlan: 'Без плана точки не могут сойтись все вместе: слой останавливается на матрице дешевле таблицы.',
  storyTrap: ' С большого старта точки могут ещё и обернуться один раз вокруг окружности и там остаться: это ловушка двумерного слоя, а не M.',
};

export const RECOVERY_STRINGS: Localized<RecoveryStrings> = {en, fr, ru};
