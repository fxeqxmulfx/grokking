/**
 * The status board: every claim of the course, sorted by how it is known. A card's Lean
 * names are declarations of the transformer repository (see its `INDEX.md`).
 */

import type {Kernel} from '../kernel.ts';
import type {Lang, Localized} from '../i18n.ts';
import {esc, icon, sendAttr, type IconKind} from '../markup.ts';
import type {AppMessage, AppState} from '../app/state.ts';

export type StatusKind = 'lean' | 'hand' | 'todo' | 'numerical' | 'running' | 'heuristic';

export interface StatusCard {
  readonly key: string;
  readonly kind: StatusKind;
  readonly title: string;
  readonly detail: string;
  /** Lean declarations, the same in every language. */
  readonly lean?: string;
}

export const STATUS_ICON: Readonly<Record<StatusKind, readonly [IconKind, string]>> = {
  lean: ['good', '✓'], hand: ['tight', '~'], todo: ['open', '○'], numerical: ['run', '≈'], running: ['run', '⟳'], heuristic: ['open', '·'],
};

export const STATUS_KINDS: readonly StatusKind[] = ['lean', 'hand', 'todo', 'numerical', 'running', 'heuristic'];

export const KIND_NAMES: Localized<Readonly<Record<StatusKind, string>>> = {
  en: {lean: 'Proved in Lean', hand: 'By hand, Lean next', todo: 'To prove', numerical: 'Numerical', running: 'Running', heuristic: 'Heuristic'},
  fr: {lean: 'Démontré en Lean', hand: 'À la main, Lean ensuite', todo: 'À démontrer', numerical: 'Numérique', running: 'En cours', heuristic: 'Heuristique'},
  ru: {lean: 'Доказано в Lean', hand: 'Вручную, затем Lean', todo: 'Предстоит доказать', numerical: 'Численно', running: 'Считается', heuristic: 'Эвристика'},
};

const LEAN_WORD: Localized<string> = {en: 'Lean', fr: 'Lean', ru: 'Lean'};

export function mountStatus(kernel: Kernel<AppState, AppMessage>, el: HTMLElement, cards: readonly StatusCard[], lang: Lang): () => void {
  let shown: string | null = null;
  return kernel.subscribe(state => {
    const selected = cards.some(c => c.key === state.status) ? state.status : (cards[0]?.key ?? '');
    if (selected === shown) return;
    shown = selected;
    const columns = STATUS_KINDS.map(kind => {
      const inKind = cards.filter(c => c.kind === kind);
      if (!inKind.length) return '';
      const [cls, mark] = STATUS_ICON[kind];
      return `<div class="status-col"><div class="panel-title">${icon(cls, mark)} ${esc(KIND_NAMES[lang][kind])}</div>` +
        inKind.map(c => `<button class="card" ${sendAttr({type: 'status/select', key: c.key})} aria-pressed="${c.key === selected}">${c.title}</button>`).join('') +
        '</div>';
    }).join('');
    const card = cards.find(c => c.key === selected);
    if (!card) {
      el.innerHTML = '';
      return;
    }
    const [cls, mark] = STATUS_ICON[card.kind];
    const lean = card.lean ? `<div class="lean-names"><span class="label">${LEAN_WORD[lang]}</span> <code>${esc(card.lean)}</code></div>` : '';
    el.innerHTML = `<div class="status-grid">${columns}</div>` +
      `<div class="detail" role="status">${icon(cls, mark)} <strong>${card.title}</strong> · ${esc(KIND_NAMES[lang][card.kind])}<br>${card.detail}${lean}</div>`;
  });
}
