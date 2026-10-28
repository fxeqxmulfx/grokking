/** The three languages say the same thing: same sections, widgets, quizzes, answers and claims. */

import {test} from 'node:test';
import assert from 'node:assert/strict';
import {LANGS} from '../src/i18n.ts';
import {homeHTML, missingHTML} from '../src/pages/home/index.ts';
import {OUTLINE, PAGES, PAGE_IDS, PLANNED} from '../src/pages/registry.ts';
import {LABS, SPRINGS, isLabId} from '../src/recovery/model.ts';
import {RECOVERY_STRINGS} from '../src/recovery/strings.ts';

const widgets = (html: string): string[] =>
  [...html.matchAll(/data-widget="([^"]+)"(?: data-id="([^"]+)")?/g)].map(m => `${m[1]}:${m[2] ?? ''}`);
const sections = (html: string): string[] => [...html.matchAll(/<section id="([^"]+)"/g)].map(m => m[1]);

/** Every opened tag of these kinds is closed, in order. */
function assertBalanced(html: string, where: string): void {
  const stack: string[] = [];
  for (const m of html.matchAll(/<(\/?)(section|article|header|div|p|span|strong|em|sub|sup|ul|ol|li|table|thead|tbody|tr|th|td|a|code|h1|h2)\b[^>]*>/g)) {
    if (!m[1]) stack.push(m[2]);
    else assert.equal(stack.pop(), m[2], `${where}: </${m[2]}> closes the wrong tag`);
  }
  assert.deepEqual(stack, [], `${where}: unclosed tags`);
}

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
