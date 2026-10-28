/** The one function that changes the site's state. Every other module only reads it. */

import {HOME, parseHash, sameRoute} from '../router.ts';
import {initialRecovery, isMoving, tickRecovery, updateRecovery} from '../recovery/model.ts';
import {updateQuiz} from '../widgets/quiz.ts';
import {PAGE_IDS} from '../pages/registry.ts';
import type {AppMessage, AppState} from './state.ts';

export function initialState(): AppState {
  return {route: {lang: 'en', page: HOME, section: null}, quiz: {}, status: '', hover: {}, recovery: initialRecovery()};
}

/** Whether anything still computes, so that the clock should keep ticking. */
export function moving(state: AppState): boolean {
  return isMoving(state.recovery);
}

export function update(state: AppState, message: AppMessage): AppState {
  switch (message.type) {
    case 'route': {
      const route = parseHash(message.hash, message.preferred, PAGE_IDS);
      return sameRoute(route, state.route) ? state : {...state, route};
    }
    case 'tick': {
      const recovery = tickRecovery(state.recovery);
      return recovery === state.recovery ? state : {...state, recovery};
    }
    case 'hover':
      return state.hover[message.key] === message.x ? state : {...state, hover: {...state.hover, [message.key]: message.x}};
    case 'status/select':
      return state.status === message.key ? state : {...state, status: message.key};
    case 'quiz/choose':
    case 'quiz/check':
    case 'quiz/hint': {
      const quiz = updateQuiz(state.quiz, message);
      return quiz === state.quiz ? state : {...state, quiz};
    }
    default: {
      const recovery = updateRecovery(state.recovery, message);
      return recovery === state.recovery ? state : {...state, recovery};
    }
  }
}
