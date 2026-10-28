/** The recovery page: Theorems D, E and F of review/flat_spectrum.md, in the three languages. */

import {localize, type Localized} from '../../i18n.ts';
import type {Quiz} from '../../widgets/quiz.ts';
import type {StatusCard} from '../../widgets/status.ts';
import type {Page, PageText} from '../types.ts';
import {QUIZ_ANSWERS, STATUS_BASE, type QuizId, type RecoveryText, type StatusBase, type StatusKey} from './spec.ts';
import {en} from './en.ts';
import {fr} from './fr.ts';
import {ru} from './ru.ts';

export const RECOVERY_TEXT: Localized<RecoveryText> = {en, fr, ru};

const QUIZ_IDS = Object.keys(QUIZ_ANSWERS) as QuizId[];
const STATUS_KEYS = Object.keys(STATUS_BASE) as StatusKey[];

function pageText(t: RecoveryText): PageText {
  const quizzes: Record<string, Quiz> = {};
  for (const id of QUIZ_IDS) quizzes[id] = {...t.quizzes[id], answer: QUIZ_ANSWERS[id]};
  return {title: t.title, nav: t.nav, summary: t.summary, body: t.body, quizzes};
}

function cards(t: RecoveryText): StatusCard[] {
  return STATUS_KEYS.map(key => {
    const base: StatusBase = STATUS_BASE[key];
    return {key: `recovery:${key}`, kind: base.kind, ...t.status[key], ...(base.lean ? {lean: base.lean} : {})};
  });
}

export const RECOVERY: Page = {
  id: 'recovery',
  part: 'model',
  text: localize(lang => pageText(RECOVERY_TEXT[lang])),
  status: localize(lang => cards(RECOVERY_TEXT[lang])),
};
