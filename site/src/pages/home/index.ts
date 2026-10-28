/** The home page: the statement the course works toward, its two ends, and the outline. */

import type {Lang, Localized} from '../../i18n.ts';
import {hrefOf} from '../../router.ts';
import {box} from '../markup.ts';
import {OUTLINE, PARTS, PART_NAMES, PLANNED, pageById} from '../registry.ts';
import type {HomeText} from './spec.ts';
import {en} from './en.ts';
import {fr} from './fr.ts';
import {ru} from './ru.ts';

const TEXT: Localized<HomeText> = {en, fr, ru};

export const HOME_NAV: Localized<string> = {en: TEXT.en.nav, fr: TEXT.fr.nav, ru: TEXT.ru.nav};
export const HOME_TITLE: Localized<string> = {en: TEXT.en.title, fr: TEXT.fr.title, ru: TEXT.ru.title};

function outlineHTML(lang: Lang, writing: string): string {
  return PARTS.map(part => {
    const items = OUTLINE.flatMap(id => {
      const page = pageById(id);
      if (page) {
        if (page.part !== part) return [];
        const t = page.text[lang];
        return [`<li><a href="${hrefOf({lang, page: id})}">${t.title}</a><span class="summary">${t.summary}</span></li>`];
      }
      const planned = PLANNED.find(p => p.id === id);
      if (!planned || planned.part !== part) return [];
      const t = planned.text[lang];
      return [`<li class="planned"><span class="title">${t.title}</span> <span class="soon">${writing}</span><span class="summary">${t.summary}</span></li>`];
    });
    return `<div class="part"><div class="panel-title">${PART_NAMES[lang][part]}</div><ol>${items.join('')}</ol></div>`;
  }).join('');
}

export function homeHTML(lang: Lang): string {
  const t = TEXT[lang];
  const ends = t.ends.map(e => `<div class="end"><div class="panel-title">${e.title}</div><p>${e.body}</p></div>`).join('');
  return `<article class="page home">
    <header class="page-head"><div class="kicker">${t.kicker}</div><h1>${t.title}</h1></header>
    <p class="lead">${t.lead}</p>
    ${box(`<p class="statement">${t.statement}</p>`)}
    ${t.precise}
    <section id="ends"><h2>${t.endsTitle}</h2><div class="ends">${ends}</div></section>
    <section id="audience"><h2>${t.audienceTitle}</h2><p>${t.audience}</p><p class="sub">${t.legend}</p></section>
    <section id="pages"><h2>${t.pagesTitle}</h2><div class="outline">${outlineHTML(lang, t.writing)}</div></section>
  </article>`;
}

const MISSING: Localized<{readonly title: string; readonly body: (home: string) => string}> = {
  en: {title: 'No such page', body: home => `This address names no page of the course. Go to the <a href="${home}">first page</a>.`},
  fr: {title: 'Cette page n’existe pas', body: home => `Cette adresse ne désigne aucune page du cours. Allez à la <a href="${home}">première page</a>.`},
  ru: {title: 'Такой страницы нет', body: home => `По этому адресу нет страницы курса. Перейдите на <a href="${home}">главную</a>.`},
};

export const MISSING_TITLE: Localized<string> = {en: MISSING.en.title, fr: MISSING.fr.title, ru: MISSING.ru.title};

export function missingHTML(lang: Lang): string {
  const t = MISSING[lang];
  return `<article class="page"><header class="page-head"><h1>${t.title}</h1></header><p>${t.body(hrefOf({lang, page: 'home'}))}</p></article>`;
}
