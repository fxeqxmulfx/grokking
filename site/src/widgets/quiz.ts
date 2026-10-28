/** A quiz after an idea: options, a check, a hint. Its words come from the page's language. */

import type {Kernel} from '../kernel.ts';
import type {Lang, Localized} from '../i18n.ts';
import {esc, icon, sendAttr} from '../markup.ts';
import type {AppMessage, AppState} from '../app/state.ts';

export interface Quiz {
  readonly question: string;
  readonly options: readonly string[];
  readonly answer: number;
  readonly hint: string;
  readonly why: string;
}

export interface QuizState {
  readonly choice: number | null;
  readonly checked: boolean;
  readonly hint: boolean;
}

export type QuizMessage =
  | {readonly type: 'quiz/choose'; readonly q: string; readonly k: number}
  | {readonly type: 'quiz/check'; readonly q: string}
  | {readonly type: 'quiz/hint'; readonly q: string};

const FRESH: QuizState = {choice: null, checked: false, hint: false};

export function updateQuiz(all: Readonly<Record<string, QuizState>>, message: QuizMessage): Readonly<Record<string, QuizState>> {
  const quiz = all[message.q] ?? FRESH;
  switch (message.type) {
    case 'quiz/choose':
      return quiz.choice === message.k && !quiz.checked ? all : {...all, [message.q]: {...quiz, choice: message.k, checked: false}};
    case 'quiz/check':
      return quiz.choice === null || quiz.checked ? all : {...all, [message.q]: {...quiz, checked: true}};
    case 'quiz/hint':
      return {...all, [message.q]: {...quiz, hint: !quiz.hint}};
  }
}

const WORDS: Localized<{quiz: string; right: string; wrong: string; check: string; hint: string; hide: string}> = {
  en: {quiz: 'Quiz.', right: 'Right.', wrong: 'Not quite.', check: 'Check', hint: 'Hint', hide: 'Hide the hint'},
  fr: {quiz: 'Quiz.', right: 'Exact.', wrong: 'Pas tout à fait.', check: 'Vérifier', hint: 'Indice', hide: 'Masquer l’indice'},
  ru: {quiz: 'Вопрос.', right: 'Верно.', wrong: 'Не совсем.', check: 'Проверить', hint: 'Подсказка', hide: 'Скрыть подсказку'},
};

export function mountQuiz(kernel: Kernel<AppState, AppMessage>, el: HTMLElement, q: string, quiz: Quiz, lang: Lang): () => void {
  const w = WORDS[lang];
  let shown: QuizState | undefined | null = null;
  return kernel.subscribe(state => {
    const st = state.quiz[q];
    if (st === shown) return;
    shown = st;
    const now = st ?? FRESH;
    const options = quiz.options
      .map((o, k) => `<button class="opt" ${sendAttr({type: 'quiz/choose', q, k})} aria-pressed="${now.choice === k}">${o}</button>`)
      .join('');
    let feedback = '';
    if (now.checked)
      feedback = `<div class="feedback" role="status">${now.choice === quiz.answer ? `${icon('good', '✓')} <strong>${w.right}</strong> ` : `${icon('bad', '✗')} <strong>${w.wrong}</strong> `}${quiz.why}</div>`;
    else if (now.hint) feedback = `<div class="feedback">${icon('open', '?')} ${quiz.hint}</div>`;
    el.innerHTML =
      `<p class="q"><strong>${esc(w.quiz)}</strong> ${quiz.question}</p><div class="opts">${options}</div>` +
      `<div class="actions"><button ${sendAttr({type: 'quiz/check', q})}>${esc(w.check)}</button>` +
      `<button ${sendAttr({type: 'quiz/hint', q})}>${esc(now.hint ? w.hide : w.hint)}</button></div>${feedback}`;
  });
}
