/**
 * The three languages of the site. Every text a reader sees exists in each of them: a
 * dictionary for one language has the type of the English one, so a missing entry does not
 * compile.
 */

export const LANGS = ['en', 'fr', 'ru'] as const;
export type Lang = (typeof LANGS)[number];

export const LANG_NAMES: Readonly<Record<Lang, string>> = {en: 'English', fr: 'Français', ru: 'Русский'};

export type Localized<T> = Readonly<Record<Lang, T>>;

/** The value `make(lang)` for each language. */
export function localize<T>(make: (lang: Lang) => T): Localized<T> {
  return {en: make('en'), fr: make('fr'), ru: make('ru')};
}

export function isLang(value: string): value is Lang {
  return (LANGS as readonly string[]).includes(value);
}

/** The first of the reader's languages that the site has, else English. */
export function chooseLang(preferred: readonly string[]): Lang {
  for (const tag of preferred) {
    const base = tag.toLowerCase().split(/[-_]/)[0];
    if (isLang(base)) return base;
  }
  return 'en';
}

const formats = new Map<string, Intl.NumberFormat>();

/** A number with `digits` decimals in the reader's language, or a dash for a missing value. */
export function num(lang: Lang, x: number | null | undefined, digits = 3): string {
  if (x == null || !Number.isFinite(x)) return '—';
  const key = `${lang}:${digits}`;
  let format = formats.get(key);
  if (!format) {
    format = new Intl.NumberFormat(lang, {minimumFractionDigits: digits, maximumFractionDigits: digits, useGrouping: false});
    formats.set(key, format);
  }
  return format.format(x).replace('-', '−');
}

/** A small number in scientific notation when it is below 10⁻³, else with three decimals. */
export function small(lang: Lang, x: number | null | undefined): string {
  if (x == null || !Number.isFinite(x)) return '—';
  if (x !== 0 && Math.abs(x) < 1e-3) {
    const [mantissa, exponent] = x.toExponential(1).split('e');
    return `${num(lang, Number(mantissa), 1)}·10<sup>${Number(exponent).toString().replace('-', '−')}</sup>`;
  }
  return num(lang, x, 3);
}
