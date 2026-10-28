/** What the three languages of the home page share: the shape of its text and the legend of the tags. */

export interface HomeText {
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
export function legendOf(entries: readonly (readonly [string, string])[]): string {
  return entries.map(([word, meaning], k) => {
    const [kind, mark] = MARKS[k] ?? MARKS[3];
    return `<span class="tag"><span class="icon ${kind}" aria-hidden="true">${mark}</span>${word}</span> ${meaning}`;
  }).join(', ') + '.';
}
