/** Builders for the HTML of pages: sections, theorem tags, widget placeholders, links. */

import type {Lang, Localized} from '../i18n.ts';
import {hrefOf} from '../router.ts';

const BY_HAND: Localized<string> = {en: 'by hand', fr: 'à la main', ru: 'вручную'};
const NUMERICAL: Localized<string> = {en: 'numerical', fr: 'numérique', ru: 'численно'};
const OPEN: Localized<string> = {en: 'to prove', fr: 'à démontrer', ru: 'не доказано'};
const HEURISTIC: Localized<string> = {en: 'heuristic', fr: 'heuristique', ru: 'эвристика'};

const mark = (kind: string, symbol: string, text: string): string =>
  `<span class="tag"><span class="icon ${kind}" aria-hidden="true">${symbol}</span>${text}</span>`;

/** A claim proved in Lean. */
export const lean = (label: string): string => mark('good', '✓', `${label} · Lean`);
/** A claim proved by hand, not yet in Lean. */
export const hand = (label: string, lang: Lang): string => mark('tight', '~', `${label} · ${BY_HAND[lang]}`);
/** A measured fact. */
export const numerical = (label: string, lang: Lang): string => mark('run', '≈', `${label} · ${NUMERICAL[lang]}`);
/** A claim not proved yet. */
export const open = (label: string, lang: Lang): string => mark('open', '○', `${label} · ${OPEN[lang]}`);
/** A modeling step that is not a theorem. */
export const heuristic = (label: string, lang: Lang): string => mark('open', '·', `${label} · ${HEURISTIC[lang]}`);

export const widget = (kind: string, id?: string): string =>
  `<div class="widget" data-widget="${kind}"${id ? ` data-id="${id}"` : ''}></div>`;

export const section = (id: string, n: number, title: string, html: string): string =>
  `<section id="${id}"><h2><span class="num">${n}</span>${title}</h2>${html}</section>`;

/** A displayed formula. */
export const eq = (html: string): string => `<div class="eq">${html}</div>`;

/** A statement set apart: a theorem, a definition. */
export const box = (html: string): string => `<div class="theorem">${html}</div>`;

export const link = (lang: Lang, page: string, text: string, sectionId?: string): string =>
  `<a href="${hrefOf({lang, page, section: sectionId ?? null})}">${text}</a>`;

/** Inline mathematics. */
export const m = (html: string): string => `<span class="m">${html}</span>`;

/** A table of numbers: a header row, then rows of cells, all HTML. */
export function numbers(head: readonly string[], rows: readonly (readonly string[])[]): string {
  const th = head.map(h => `<th>${h}</th>`).join('');
  const body = rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('');
  return `<div class="table-wrap"><table class="numbers"><thead><tr>${th}</tr></thead><tbody>${body}</tbody></table></div>`;
}

/** The subscript S1 of the nuclear norm. */
export const S1 = '<sub>S1</sub>';
