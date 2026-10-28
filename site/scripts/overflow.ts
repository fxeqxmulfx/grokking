/**
 * Lists every formula and tag that leaves its column when the pages are shown at a phone's
 * width. Run it while `npm start` serves the build:
 *
 *   npm run overflow -- [width = 360] [hash …]
 *
 * Without hashes it loads the home page and every written page in every language. It drives
 * headless Chrome (`CHROME`, default `google-chrome`) through the DevTools protocol, with the
 * width set by device emulation, since a desktop window cannot be made that narrow. It exits
 * with 1 when something sticks out or the page grows wider than the screen.
 */

import {spawn} from 'node:child_process';
import {mkdtempSync, readFileSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {setTimeout as sleep} from 'node:timers/promises';
import {LANGS} from '../src/i18n.ts';
import {PAGE_IDS} from '../src/pages/registry.ts';

const SITE = process.env.SITE ?? 'http://127.0.0.1:8090/';
const [widthArg, ...given] = process.argv.slice(2);
const width = Number(widthArg ?? 360);
const hashes = given.length > 0 ? given : LANGS.flatMap(lang => ['home', ...PAGE_IDS].map(page => `#/${lang}/${page}`));

/** Runs in the page: what sticks out of its column, and how wide the page has become. */
const PROBE = `(() => {
  const out = [];
  for (const el of document.querySelectorAll('.m, .tag')) {
    let block = el.parentElement;
    while (block && getComputedStyle(block).display.startsWith('inline')) block = block.parentElement;
    if (!block) continue;
    const right = block.getBoundingClientRect().right - (parseFloat(getComputedStyle(block).paddingRight) || 0);
    const over = el.getBoundingClientRect().right - right;
    if (over > 1) out.push(Math.round(over) + ' px  ' + el.textContent.trim().slice(0, 80));
  }
  return {page: document.documentElement.scrollWidth, view: document.documentElement.clientWidth, out};
})()`;

interface Probe {readonly page: number; readonly view: number; readonly out: readonly string[]}
interface Reply {
  readonly id?: number;
  readonly result?: {readonly result?: {readonly value?: unknown}};
  readonly error?: {readonly message: string};
}

/** The port that Chrome chose, once it has written it into its profile. */
async function devtoolsPort(profile: string): Promise<string> {
  for (let k = 0; k < 100; k++) {
    try {
      const port = readFileSync(path.join(profile, 'DevToolsActivePort'), 'utf8').split('\n')[0];
      if (port) return port;
    } catch { /* not written yet */ }
    await sleep(100);
  }
  throw new Error('Chrome did not open its DevTools port');
}

const profile = mkdtempSync(path.join(tmpdir(), 'overflow-'));
const chrome = spawn(process.env.CHROME ?? 'google-chrome',
  ['--headless=new', '--disable-gpu', '--remote-debugging-port=0', `--user-data-dir=${profile}`, 'about:blank'], {stdio: 'ignore'});
try {
  const port = await devtoolsPort(profile);
  const targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json() as {type: string; webSocketDebuggerUrl: string}[];
  const target = targets.find(t => t.type === 'page');
  if (!target) throw new Error('Chrome has no page');
  const socket = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise<void>((resolve, reject) => {
    socket.addEventListener('open', () => resolve());
    socket.addEventListener('error', () => reject(new Error('the DevTools socket failed')));
  });
  let next = 0;
  const pending = new Map<number, (reply: Reply) => void>();
  socket.addEventListener('message', event => {
    const reply = JSON.parse(String(event.data)) as Reply;
    if (reply.id !== undefined) pending.get(reply.id)?.(reply);
  });
  const send = (method: string, params: object = {}): Promise<Reply> => new Promise(resolve => {
    const id = ++next;
    pending.set(id, resolve);
    socket.send(JSON.stringify({id, method, params}));
  });

  await send('Emulation.setDeviceMetricsOverride', {width, height: 900, deviceScaleFactor: 1, mobile: true});
  let failed = 0;
  for (const hash of hashes) {
    await send('Page.navigate', {url: new URL(hash, SITE).href});
    await sleep(800);
    const reply = await send('Runtime.evaluate', {expression: PROBE, returnByValue: true});
    if (reply.error) throw new Error(reply.error.message);
    const probe = reply.result?.result?.value as Probe;
    const wide = probe.page > probe.view;
    if (wide || probe.out.length > 0) failed++;
    const verdict = wide ? `the page is ${probe.page} px wide on a ${probe.view} px screen` : 'fits';
    console.log(`${hash}: ${verdict}${probe.out.length > 0 ? `, ${probe.out.length} sticking out` : ''}`);
    for (const line of probe.out) console.log(`    ${line}`);
  }
  socket.close();
  process.exitCode = failed > 0 ? 1 : 0;
} finally {
  chrome.kill();
  rmSync(profile, {recursive: true, force: true});
}
