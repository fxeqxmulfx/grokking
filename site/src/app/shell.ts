/**
 * The frame of the site: the header, the page outlet and the footer. It renders from the
 * route in the state, mounts the widgets of the page it shows and unmounts them when the
 * page changes. Links are plain `#/<lang>/<page>` anchors: the browser changes the hash and
 * `main.ts` sends it to the kernel.
 */

import type {Kernel} from '../kernel.ts';
import {LANGS, LANG_NAMES, type Lang, type Localized} from '../i18n.ts';
import {esc, part} from '../markup.ts';
import {HOME, MISSING, hrefOf, type Route} from '../router.ts';
import {HOME_NAV, HOME_TITLE, MISSING_TITLE, homeHTML, missingHTML} from '../pages/home/index.ts';
import {PAGES, PART_NAMES, pageById} from '../pages/registry.ts';
import type {Page} from '../pages/types.ts';
import {isLabId} from '../recovery/model.ts';
import {mountLab, mountSprings} from '../recovery/views.ts';
import {mountQuiz} from '../widgets/quiz.ts';
import {mountStatus} from '../widgets/status.ts';
import type {AppMessage, AppState} from './state.ts';

type AppKernel = Kernel<AppState, AppMessage>;
type Unmount = () => void;
type Mount = (kernel: AppKernel, el: HTMLElement, page: Page | undefined, lang: Lang) => Unmount | null;

/** How each `data-widget` placeholder of a page comes alive. */
const WIDGETS: Readonly<Record<string, Mount>> = {
  lab: (kernel, el, _page, lang) => {
    const id = el.dataset.id ?? '';
    return isLabId(id) ? mountLab(kernel, el, id, lang) : null;
  },
  springs: (kernel, el, _page, lang) => mountSprings(kernel, el, lang),
  quiz: (kernel, el, page, lang) => {
    const id = el.dataset.id ?? '', quiz = page?.text[lang].quizzes[id];
    if (!page || !quiz) return null;
    el.classList.add('quiz');
    return mountQuiz(kernel, el, `${page.id}/${id}`, quiz, lang);
  },
  status: (kernel, el, page, lang) => (page?.status ? mountStatus(kernel, el, page.status[lang], lang) : null),
};

const WORDS: Localized<{readonly site: string; readonly nav: string; readonly langs: string; readonly foot: string}> = {
  en: {site: 'Grokking', nav: 'Pages', langs: 'Language', foot: 'Every claim carries its status. The Lean proofs are in the transformer repository, <code>Transformer.Grokking.FlatSpectrum</code> and <code>Transformer.Weil</code>; everything on these pages runs in your browser.'},
  fr: {site: 'Grokking', nav: 'Pages', langs: 'Langue', foot: 'Chaque énoncé porte son statut. Les preuves Lean sont dans le dépôt transformer, <code>Transformer.Grokking.FlatSpectrum</code> et <code>Transformer.Weil</code> ; tout ce qui est sur ces pages tourne dans votre navigateur.'},
  ru: {site: 'Grokking', nav: 'Страницы', langs: 'Язык', foot: 'У каждого утверждения указан его статус. Доказательства на Lean лежат в репозитории transformer, <code>Transformer.Grokking.FlatSpectrum</code> и <code>Transformer.Weil</code>; всё на этих страницах работает в вашем браузере.'},
};

const current = (yes: boolean, value = 'page'): string => (yes ? ` aria-current="${value}"` : '');

function headerHTML(route: Route): string {
  const lang = route.lang, w = WORDS[lang];
  const links = [`<a href="${hrefOf({lang, page: HOME})}"${current(route.page === HOME)}>${esc(HOME_NAV[lang])}</a>`]
    .concat(PAGES.map(p => `<a href="${hrefOf({lang, page: p.id})}"${current(route.page === p.id)}>${esc(p.text[lang].nav)}</a>`));
  const langs = LANGS.map(l => `<a href="${hrefOf({...route, lang: l})}" hreflang="${l}" lang="${l}" title="${esc(LANG_NAMES[l])}"${current(l === lang, 'true')}>${l.toUpperCase()}</a>`);
  return `<a class="brand" href="${hrefOf({lang, page: HOME})}">${esc(w.site)}</a>` +
    `<nav aria-label="${esc(w.nav)}">${links.join('')}</nav>` +
    `<div class="langs" role="group" aria-label="${esc(w.langs)}">${langs.join('')}</div>`;
}

function pageHTML(page: Page, lang: Lang): string {
  const t = page.text[lang];
  return `<article class="page"><header class="page-head"><div class="kicker">${esc(PART_NAMES[lang][page.part])}</div>` +
    `<h1>${t.title}</h1></header>${t.body}</article>`;
}

/** The text of some HTML, for the document title. */
function plain(html: string): string {
  const box = document.createElement('div');
  box.innerHTML = html;
  return box.textContent ?? '';
}

function scrollToSection(section: string | null): void {
  const target = section ? document.getElementById(section) : null;
  if (target) target.scrollIntoView({block: 'start'});
  else window.scrollTo(0, 0);
}

export function mountShell(kernel: AppKernel, root: HTMLElement): Unmount {
  root.innerHTML = '<header class="top" data-part="top"></header><main data-part="page"></main><footer class="foot" data-part="foot"></footer>';
  const top = part(root, 'top'), outlet = part(root, 'page'), foot = part(root, 'foot');
  let shown: Route | null = null, unmounts: Unmount[] = [];
  const unsubscribe = kernel.subscribe(state => {
    const route = state.route;
    if (shown === route) return;
    const samePage = shown !== null && shown.lang === route.lang && shown.page === route.page;
    shown = route;
    if (samePage) {
      scrollToSection(route.section);
      return;
    }
    for (const unmount of unmounts) unmount();
    unmounts = [];
    const lang = route.lang, page = pageById(route.page);
    document.documentElement.lang = lang;
    top.innerHTML = headerHTML(route);
    foot.innerHTML = `<p>${WORDS[lang].foot}</p>`;
    outlet.innerHTML = page ? pageHTML(page, lang) : route.page === HOME ? homeHTML(lang) : missingHTML(lang);
    const title = page ? page.text[lang].title : route.page === MISSING ? MISSING_TITLE[lang] : HOME_TITLE[lang];
    document.title = `${plain(title)} · ${WORDS[lang].site}`;
    if (route.page !== MISSING) history.replaceState(null, '', hrefOf(route));
    for (const el of outlet.querySelectorAll<HTMLElement>('[data-widget]')) {
      const unmount = WIDGETS[el.dataset.widget ?? '']?.(kernel, el, page, lang);
      if (unmount) unmounts.push(unmount);
    }
    scrollToSection(route.section);
  });
  return () => {
    unsubscribe();
    for (const unmount of unmounts) unmount();
  };
}
