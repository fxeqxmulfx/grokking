import {test} from 'node:test';
import assert from 'node:assert/strict';
import {HOME, MISSING, hrefOf, parseHash, sameRoute} from '../src/router.ts';
import {chooseLang, num, small} from '../src/i18n.ts';

const pages = ['recovery'];

test('a full hash names the language, the page and the section', () => {
  assert.deepEqual(parseHash('#/fr/recovery/rigid', ['en'], pages), {lang: 'fr', page: 'recovery', section: 'rigid'});
});

test('without a language the first language of the reader that the site has is taken', () => {
  assert.deepEqual(parseHash('#/recovery', ['de-DE', 'ru-RU', 'en'], pages), {lang: 'ru', page: 'recovery', section: null});
  assert.deepEqual(parseHash('', ['de'], pages), {lang: 'en', page: HOME, section: null});
  assert.deepEqual(parseHash('#/', ['fr-CA'], pages), {lang: 'fr', page: HOME, section: null});
  assert.equal(chooseLang(['pt_BR', 'FR']), 'fr');
});

test('an unknown page is missing, and a malformed section is dropped', () => {
  assert.equal(parseHash('#/en/nowhere', [], pages).page, MISSING);
  assert.equal(parseHash('#/en/recovery/Bad Section', [], pages).section, null);
  assert.equal(parseHash('#/en/home/anything', [], pages).page, HOME);
});

test('hrefOf inverts parseHash on canonical hashes', () => {
  for (const hash of ['#/en', '#/fr/recovery', '#/ru/recovery/weights']) assert.equal(hrefOf(parseHash(hash, [], pages)), hash);
  assert.equal(hrefOf({lang: 'ru', page: MISSING, section: 'x'}), '#/ru');
  assert.ok(sameRoute(parseHash('#/en/recovery', [], pages), parseHash('#/en/recovery/', [], pages)));
});

test('numbers follow the language and use a true minus sign', () => {
  assert.equal(num('en', -0.172, 3), '−0.172');
  assert.equal(num('fr', -0.172, 3), '−0,172');
  assert.equal(num('ru', 2.5, 1), '2,5');
  assert.equal(num('en', 12345.5, 1), '12345.5');
  assert.equal(num('en', null), '—');
  assert.equal(num('en', Number.NaN), '—');
  assert.equal(small('en', 2e-14), '2.0·10<sup>−14</sup>');
  assert.equal(small('fr', 0.5), '0,500');
});
