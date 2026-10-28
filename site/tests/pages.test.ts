/** The three languages say the same thing: same sections, widgets, quizzes, answers and claims. */

import {test} from 'node:test';
import assert from 'node:assert/strict';
import {existsSync, readFileSync} from 'node:fs';
import {homedir} from 'node:os';
import {join} from 'node:path';
import {LANGS} from '../src/i18n.ts';
import {en} from '../src/pages/home/en.ts';
import {fr} from '../src/pages/home/fr.ts';
import {homeHTML, missingHTML} from '../src/pages/home/index.ts';
import {ru} from '../src/pages/home/ru.ts';
import {glueTags, hand, heuristic, lean, numerical, open} from '../src/pages/markup.ts';
import {OUTLINE, PAGES, PAGE_IDS, PLANNED} from '../src/pages/registry.ts';
import {STATUS_BASE} from '../src/pages/recovery/spec.ts';
import {LABS, SPRINGS, isLabId} from '../src/recovery/model.ts';
import {RECOVERY_STRINGS} from '../src/recovery/strings.ts';

const widgets = (html: string): string[] =>
  [...html.matchAll(/data-widget="([^"]+)"(?: data-id="([^"]+)")?/g)].map(m => `${m[1]}:${m[2] ?? ''}`);
const sections = (html: string): string[] => [...html.matchAll(/<section id="([^"]+)"/g)].map(m => m[1]);

/** Every opened tag of these kinds is closed, in order. */
function assertBalanced(html: string, where: string): void {
  const stack: string[] = [];
  for (const m of html.matchAll(/<(\/?)(section|article|header|div|p|span|strong|em|sub|sup|ul|ol|li|table|thead|tbody|tr|th|td|a|code|h1|h2|h3)\b[^>]*>/g)) {
    if (!m[1]) stack.push(m[2]);
    else assert.equal(stack.pop(), m[2], `${where}: </${m[2]}> closes the wrong tag`);
  }
  assert.deepEqual(stack, [], `${where}: unclosed tags`);
}

/** The marks of the claim tags, in order: ✓ Lean, ~ by hand, ≈ numerical, ○ open, · heuristic. */
const marks = (html: string): string[] => [...html.matchAll(/class="icon \w+" aria-hidden="true">([^<]+)</g)].map(m => m[1]);

/** The numbers of a text, in order, a decimal comma read as a point. */
const numbers = (html: string): string[] =>
  [...html.replace(/<[^>]+>/g, ' ').matchAll(/\d+(?:[.,]\d+)?/g)].map(m => m[0].replace(',', '.'));

/** The Lean declarations a page names, list by list, in order. */
const leanLists = (html: string): string[] =>
  [...html.matchAll(/<div class="lean-names"><span class="label">Lean<\/span> <code>([^<]+)<\/code><\/div>/g)].map(m => m[1]);

test('the home page makes the same claims, with the same numbers, in every language', () => {
  const text = {en, fr, ru};
  for (const lang of LANGS) {
    const t = text[lang], e = text.en;
    assert.deepEqual(sections(homeHTML(lang)), sections(homeHTML('en')), lang);
    assert.deepEqual(leanLists(homeHTML(lang)), leanLists(homeHTML('en')), `${lang}: Lean names`);
    const pieces: [string, string, string][] = [
      ...(['statement', 'terms', 'full'] as const).map((key): [string, string, string] => [key, t[key], e[key]]),
      ...Object.keys(e.theorems).flatMap(id => {
        const a = t.theorems[id as keyof typeof e.theorems], b = e.theorems[id as keyof typeof e.theorems];
        return [[`theorems/${id}/title`, a.title, b.title], [`theorems/${id}`, a.body, b.body]] as [string, string, string][];
      }),
      ...Object.keys(e.conclusions).flatMap(id => {
        const a = t.conclusions[id as keyof typeof e.conclusions], b = e.conclusions[id as keyof typeof e.conclusions];
        return [[`conclusions/${id}/title`, a.title, b.title], [`conclusions/${id}`, a.body, b.body]] as [string, string, string][];
      }),
    ];
    for (const [where, mine, theirs] of pieces) {
      assert.deepEqual(marks(mine), marks(theirs), `${lang}/${where}: tags`);
      assert.deepEqual(numbers(mine), numbers(theirs), `${lang}/${where}: numbers`);
    }
  }
});

/** The transformer repository's index of declarations, when it is checked out beside this one. */
const INDEX = process.env.TRANSFORMER_INDEX ?? join(homedir(), 'lean_projects/transformer/INDEX.md');

test('every Lean declaration a page names exists in the transformer repository', {skip: !existsSync(INDEX) && `no ${INDEX}`}, () => {
  const declared = new Set([...readFileSync(INDEX, 'utf8').matchAll(/\[`([^`]+)`\]\(src\//g)].map(m => m[1]));
  const lists = [
    ...LANGS.flatMap(lang => leanLists(homeHTML(lang))),
    ...Object.values(STATUS_BASE).flatMap(base => ('lean' in base && base.lean ? [base.lean] : [])),
  ];
  for (const name of new Set(lists.flatMap(list => list.split(', ')))) assert.ok(declared.has(name), name);
});

test('every page has the same sections and widgets in every language', () => {
  for (const page of PAGES) {
    const en = page.text.en;
    assert.ok(sections(en.body).length > 0);
    for (const lang of LANGS) {
      const t = page.text[lang];
      assert.deepEqual(sections(t.body), sections(en.body), `${page.id}/${lang}`);
      assert.deepEqual(widgets(t.body), widgets(en.body), `${page.id}/${lang}`);
    }
  }
});

test('the HTML of every page is balanced', () => {
  for (const lang of LANGS) {
    assertBalanced(homeHTML(lang), `home/${lang}`);
    assertBalanced(missingHTML(lang), `missing/${lang}`);
    for (const page of PAGES) {
      const t = page.text[lang];
      assertBalanced(t.body, `${page.id}/${lang}`);
      assertBalanced(t.title, `${page.id}/${lang} title`);
      for (const [id, q] of Object.entries(t.quizzes))
        for (const html of [q.question, q.hint, q.why, ...q.options]) assertBalanced(html, `${page.id}/${lang}/${id}`);
      for (const card of page.status?.[lang] ?? []) assertBalanced(card.title + card.detail, `${page.id}/${lang}/${card.key}`);
    }
  }
});

test('every quiz exists in every language with the same options count and answer', () => {
  for (const page of PAGES) {
    const ids = widgets(page.text.en.body).filter(w => w.startsWith('quiz:')).map(w => w.slice(5));
    for (const lang of LANGS) {
      const quizzes = page.text[lang].quizzes;
      assert.deepEqual(Object.keys(quizzes).sort(), [...ids].sort(), `${page.id}/${lang}`);
      for (const id of ids) {
        const q = quizzes[id], e = page.text.en.quizzes[id];
        assert.equal(q.options.length, e.options.length, `${page.id}/${lang}/${id}`);
        assert.equal(q.answer, e.answer);
        assert.ok(q.answer >= 0 && q.answer < q.options.length);
      }
    }
  }
});

test('the status cards are the same claims, of the same kinds, in every language', () => {
  for (const page of PAGES) {
    const en = page.status?.en ?? [];
    assert.equal(new Set(en.map(c => c.key)).size, en.length, `${page.id}: duplicate card`);
    for (const lang of LANGS) {
      const cards = page.status?.[lang] ?? [];
      assert.deepEqual(cards.map(c => [c.key, c.kind, c.lean ?? '']), en.map(c => [c.key, c.kind, c.lean ?? '']), `${page.id}/${lang}`);
      for (const card of cards) assert.ok(card.title && card.detail, `${page.id}/${lang}/${card.key}`);
    }
    if (widgets(page.text.en.body).includes('status:')) assert.ok(en.length > 0, `${page.id}: a board without cards`);
  }
});

test('every lab placeholder names a lab, and the widget words cover every preset', () => {
  for (const page of PAGES)
    for (const w of widgets(page.text.en.body).filter(x => x.startsWith('lab:'))) assert.ok(isLabId(w.slice(4)), w);
  for (const lang of LANGS) {
    const t = RECOVERY_STRINGS[lang];
    for (const [id, config] of Object.entries(LABS))
      for (const preset of config.presets) assert.ok(t.presets[id as keyof typeof LABS][preset.key], `${lang}: ${id}/${preset.key}`);
    for (const preset of SPRINGS.presets) assert.ok(t.presets.springs[preset.key], `${lang}: springs/${preset.key}`);
  }
});

test('a pattern a quiz quotes by name is one of the presets of its language', () => {
  for (const page of PAGES)
    for (const lang of LANGS) {
      const names = new Set(Object.values(RECOVERY_STRINGS[lang].presets).flatMap(p => Object.values(p)));
      for (const q of Object.values(page.text[lang].quizzes))
        for (const m of `${q.hint} ${q.why}`.matchAll(/[“«]\s?([^”»]+?)\s?[”»]/g)) assert.ok(names.has(m[1]), `${lang}: “${m[1]}”`);
    }
});

test('the outline holds every written and every planned page exactly once', () => {
  const ids = [...PAGE_IDS, ...PLANNED.map(p => p.id)];
  assert.equal(new Set(ids).size, ids.length);
  assert.deepEqual([...ids].sort(), [...OUTLINE].sort());
  for (const id of PAGE_IDS) assert.ok(homeHTML('en').includes(`href="#/en/${id}"`), id);
});

test('a tag stays on one line with the punctuation after it', () => {
  for (const tag of [lean('A'), hand('B', 'en'), numerical('C', 'fr'), open('D', 'ru'), heuristic('E', 'en')]) {
    assert.equal(glueTags(`x ${tag}. y`), `x <span class="nobr">${tag}.</span> y`);
    assert.equal(glueTags(`x ${tag}; y`), `x <span class="nobr">${tag};</span> y`);
    assert.equal(glueTags(`x ${tag} y`), `x ${tag} y`);
  }
});
