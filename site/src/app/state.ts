/** The state of the whole site and every message its controls send. Types only. */

import type {Route} from '../router.ts';
import type {RecoveryMessage, RecoveryState} from '../recovery/model.ts';
import type {QuizMessage, QuizState} from '../widgets/quiz.ts';

export interface AppState {
  readonly route: Route;
  readonly quiz: Readonly<Record<string, QuizState>>;
  /** The selected card of the status board. */
  readonly status: string;
  /** The pointer's x on each chart, in the chart's own units, or null. */
  readonly hover: Readonly<Record<string, number | null>>;
  readonly recovery: RecoveryState;
}

export type AppMessage =
  | {readonly type: 'route'; readonly hash: string; readonly preferred: readonly string[]}
  | {readonly type: 'tick'}
  | {readonly type: 'hover'; readonly key: string; readonly x: number | null}
  | {readonly type: 'status/select'; readonly key: string}
  | QuizMessage
  | RecoveryMessage;
