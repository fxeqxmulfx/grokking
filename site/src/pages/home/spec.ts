/** What the three languages of the home page share: the shape of its text and the legend of the tags. */

export interface HomeText {
  readonly nav: string;
  readonly title: string;
  readonly kicker: string;
  readonly lead: string;
  readonly statement: string;
  readonly precise: string;
  /** The heading of the detailed statement. */
  readonly fullTitle: string;
  /** HTML: the detailed statement, as `<section id>`s with `<h3>` headings. */
  readonly full: string;
  readonly endsTitle: string;
  readonly ends: readonly {readonly title: string; readonly body: string}[];
  readonly audienceTitle: string;
  readonly audience: string;
  readonly legend: string;
  readonly pagesTitle: string;
  readonly writing: string;
}

/** `x` with the subscript `i`. */
export const sub = (x: string, i: string): string => `${x}<sub>${i}</sub>`;

/** The fractional part, set as an operator. */
export const frac = '<span class="op">frac</span>';

/** The letters of Theorem G and Theorem C, the same in every language. */
export const ri = sub('r', 'i'), sj = sub('s', 'j'), ui = sub('u', 'i'), vj = sub('v', 'j'), Kr = sub('K', 'ρ');

/** The square root in Theorem C's bound, for `m = deg P`. */
export const root = '√((m − 1)(2p − 1))';

/** The marks of the tags, in the order of every legend. */
const MARKS = [['good', '✓'], ['tight', '~'], ['run', '≈'], ['open', '○'], ['open', '·']] as const;

/** The five tags, each a pair of its word and its meaning. */
export function legendOf(entries: readonly (readonly [string, string])[]): string {
  return entries.map(([word, meaning], k) => {
    const [kind, mark] = MARKS[k] ?? MARKS[3];
    return `<span class="tag"><span class="icon ${kind}" aria-hidden="true">${mark}</span>${word}</span> ${meaning}`;
  }).join(', ') + '.';
}
