/** What a page of the course is: words in each language, and the widgets it mounts. */

import type {Localized} from '../i18n.ts';
import type {Quiz} from '../widgets/quiz.ts';
import type {StatusCard} from '../widgets/status.ts';

export type PartId = 'foundations' | 'model' | 'obstacles' | 'frontier';

export interface PageText {
  /** The heading of the page. */
  readonly title: string;
  /** A short name for the navigation. */
  readonly nav: string;
  /** One sentence for the table of contents. */
  readonly summary: string;
  /** HTML: `<section id>`s with widget placeholders `<div data-widget="…" data-id="…">`. */
  readonly body: string;
  readonly quizzes: Readonly<Record<string, Quiz>>;
}

export interface Page {
  readonly id: string;
  readonly part: PartId;
  readonly text: Localized<PageText>;
  /** The claims this page states, for its status board. */
  readonly status?: Localized<readonly StatusCard[]>;
}
