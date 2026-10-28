/**
 * Hash routes: `#/<lang>/<page>` and `#/<lang>/<page>/<section>`. Parsing is a pure function
 * of the hash, the reader's languages and the known pages, so the kernel can apply it.
 */

import {chooseLang, isLang, type Lang} from './i18n.ts';

export interface Route {
  readonly lang: Lang;
  /** A known page, `home`, or `missing` for an unknown one. */
  readonly page: string;
  readonly section: string | null;
}

export const HOME = 'home';
export const MISSING = 'missing';

const SEGMENT = /^[a-z0-9][a-z0-9-]*$/;

export function parseHash(hash: string, preferred: readonly string[], pages: readonly string[]): Route {
  const parts = hash.replace(/^#\/?/, '').split('/').filter(part => part !== '');
  const head = parts[0] ?? '';
  const lang = isLang(head) ? head : chooseLang(preferred);
  const rest = isLang(head) ? parts.slice(1) : parts;
  const [page = HOME, section] = rest;
  if (page === HOME || rest.length === 0) return {lang, page: HOME, section: null};
  if (!pages.includes(page)) return {lang, page: MISSING, section: null};
  return {lang, page, section: section !== undefined && SEGMENT.test(section) ? section : null};
}

export function hrefOf(route: {readonly lang: Lang; readonly page: string; readonly section?: string | null}): string {
  const page = route.page === HOME || route.page === MISSING ? '' : `/${route.page}`;
  const section = page && route.section ? `/${route.section}` : '';
  return `#/${route.lang}${page}${section}`;
}

export function sameRoute(a: Route, b: Route): boolean {
  return a.lang === b.lang && a.page === b.page && a.section === b.section;
}
