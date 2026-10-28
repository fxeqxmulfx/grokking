/**
 * The widgets of the recovery lesson. Each subscribes to the kernel and renders from the
 * state it receives; every control in them only sends a message (`data-send`,
 * `data-send-value`, or a pointer position for drags and chart hovers). A mount returns the
 * function that unsubscribes it.
 */

import {messageAttr, type Kernel} from '../kernel.ts';
import {num, small, type Lang} from '../i18n.ts';
import {esc, icon, line, part, sendAttr, svgPoint, tag} from '../markup.ts';
import {hoverAt, hoverKey, lineChart, niceCeil, niceTicks} from '../widgets/charts.ts';
import type {AppMessage, AppState} from '../app/state.ts';
import * as Core from './core.ts';
import {LABS, SPRINGS, WEIGHT_RANGE, geometry, type Lab, type LabId, type SpringsLab} from './model.ts';
import {RECOVERY_STRINGS, type RecoveryStrings} from './strings.ts';

type AppKernel = Kernel<AppState, AppMessage>;

const setText = (values: readonly number[]): string => `{${values.join(', ')}}`;

/* ---------- the table ---------- */

function arrow(cx: number, cy: number, length: number, angle: number, color: string, width = 2): string {
  if (length < 1) return `<circle cx="${cx}" cy="${cy}" r="1.6" fill="${color}"/>`;
  const dx = Math.cos(angle), dy = -Math.sin(angle), head = Math.min(7, length * 0.45);
  const tx = cx + length * dx, ty = cy + length * dy, bx = tx - head * dx, by = ty - head * dy, nx = -dy, ny = dx;
  const p = (x: number): string => x.toFixed(1);
  return (
    `<line x1="${cx}" y1="${cy}" x2="${p(bx)}" y2="${p(by)}" stroke="${color}" stroke-width="${width}" stroke-linecap="round"/>` +
    `<polygon points="${p(tx)},${p(ty)} ${p(bx + 0.55 * head * nx)},${p(by + 0.55 * head * ny)} ${p(bx - 0.55 * head * nx)},${p(by - 0.55 * head * ny)}" fill="${color}"/>`
  );
}

/** The signs that flip the piece of row 0: u_i = −1 on its rows, v_j = −1 on its columns. */
function flipSigns(lab: Lab): {u: number[]; v: number[]} {
  const comps = lab.info.comps, piece = comps.row[0];
  return {u: comps.row.map(c => (c === piece ? -1 : 1)), v: comps.col.map(c => (c === piece ? -1 : 1))};
}

function tableSVG(lab: Lab, t: RecoveryStrings, lang: Lang): string {
  const config = LABS[lab.id], info = lab.info, g = geometry(lab.N, config), {N, cell, left, top} = g;
  const w = Core.balanced(N, lab.a, lab.b);
  let largest = 0;
  for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) largest = Math.max(largest, w.a[i] * w.b[j]);
  const scale = (cell / 2 - 7) / largest;
  const theta = (i: number, j: number): number => (config.phases ? (2 * Math.PI * (i + j)) / N : 0);
  const kept = lab.mask.flat().filter(Boolean).length;
  const out = [`<svg viewBox="0 0 ${g.width} ${g.height}" role="img" aria-label="${esc(t.tableAria(N, kept))}">`];
  const v = config.violation ? info.violation : null, R = new Set(v?.R ?? []), C = new Set(v?.C ?? []);
  for (let j = 0; j < N; j++)
    out.push(`<text x="${left + j * cell + cell / 2}" y="${top - 9}" text-anchor="middle" class="lbl col${C.has(j) ? ' bad' : ''}">${C.has(j) ? 'C·' : ''}${j}</text>`);
  for (let i = 0; i < N; i++)
    out.push(`<text x="${left - 9}" y="${top + i * cell + cell / 2 + 4}" text-anchor="end" class="lbl row${R.has(i) ? ' bad' : ''}">${R.has(i) ? 'R·' : ''}${i}</text>`);
  if (config.weights) {
    const end = (length: number): number => (length / WEIGHT_RANGE.max) * g.bar;
    for (let i = 0; i < N; i++) {
      const y = top + i * cell + cell / 2, x0 = left - g.gap;
      out.push(`<rect x="${x0 - g.bar}" y="${y - 13}" width="${g.bar}" height="26" fill="transparent" class="handle" data-drag='${messageAttr({side: 'a', k: i})}'><title>${esc(t.dragTitle(`|a${i}|`, num(lang, lab.a[i], 2)))}</title></rect>`);
      out.push(`<rect x="${x0 - end(lab.a[i])}" y="${y - 5}" width="${end(lab.a[i])}" height="10" rx="4" class="bar row" pointer-events="none"/>`);
      out.push(`<text x="${x0 - g.bar}" y="${y - 10}" class="lbl" pointer-events="none">α ${num(lang, info.alpha[i], 2)}</text>`);
    }
    for (let j = 0; j < N; j++) {
      const x = left + j * cell + cell / 2, y0 = top - g.gap;
      out.push(`<rect x="${x - 13}" y="${y0 - g.bar}" width="26" height="${g.bar}" fill="transparent" class="handle" data-drag='${messageAttr({side: 'b', k: j})}'><title>${esc(t.dragTitle(`|b${j}|`, num(lang, lab.b[j], 2)))}</title></rect>`);
      out.push(`<rect x="${x - 5}" y="${y0 - end(lab.b[j])}" width="10" height="${end(lab.b[j])}" rx="4" class="bar col" pointer-events="none"/>`);
      out.push(`<text x="${x + 9}" y="${y0 - g.bar + 9}" class="lbl" pointer-events="none">β ${num(lang, info.beta[j], 2)}</text>`);
    }
  }
  const flip = lab.flipped && !info.rigid ? flipSigns(lab) : null;
  const sol = lab.solver, T = config.plan && info.feasible ? info.flow.T : null;
  let tmax = 0;
  if (T) for (const row of T) for (const x of row) tmax = Math.max(tmax, x);
  for (let i = 0; i < N; i++)
    for (let j = 0; j < N; j++) {
      const x = left + j * cell, y = top + i * cell, cx = x + cell / 2, cy = y + cell / 2, seen = lab.mask[i][j];
      const kij = w.a[i] * w.b[j], marks: string[] = [];
      out.push(`<rect class="cell ${seen ? 'seen' : 'hidden'}" x="${x + 2}" y="${y + 2}" width="${cell - 4}" height="${cell - 4}" rx="7" ${sendAttr({type: 'lab/toggle', id: lab.id, i, j})}><title>${esc(t.cellTitle(i, j, seen))}</title></rect>`);
      if (R.has(i) && C.has(j)) marks.push(`<rect x="${x + 4}" y="${y + 4}" width="${cell - 8}" height="${cell - 8}" rx="5" class="missed"/>`);
      if (seen) marks.push(arrow(cx, cy, kij * scale, theta(i, j), 'var(--ink)', 2.2));
      else if (flip) {
        const sign = flip.u[i] * flip.v[j];
        marks.push(arrow(cx, cy, kij * scale, theta(i, j) + (sign < 0 ? Math.PI : 0), sign < 0 ? 'var(--piece-1)' : 'var(--ink-3)', 2));
        if (sign < 0) marks.push(`<rect x="${x + 4}" y="${y + 4}" width="${cell - 8}" height="${cell - 8}" rx="5" class="flipped"/>`);
      } else if (sol) {
        const z = sol.Z[i][j], ok = Math.abs(z - sol.K[i][j]) <= 0.02 * largest;
        marks.push(arrow(cx, cy, Math.abs(z) * scale, theta(i, j) + (z < 0 ? Math.PI : 0), ok ? 'var(--good)' : 'var(--bad)', 2));
        if (!ok && sol.done) marks.push(`<text x="${x + cell - 9}" y="${y + 16}" text-anchor="end" class="wrong">✗</text>`);
      } else marks.push(arrow(cx, cy, kij * scale, theta(i, j), 'var(--ink-3)', 1.5));
      if (T && T[i][j] > 1e-9) marks.push(`<circle cx="${x + cell - 11}" cy="${y + 11}" r="${(2.5 + 4.5 * Math.sqrt(T[i][j] / tmax)).toFixed(1)}" class="plan"/>`);
      out.push(`<g pointer-events="none">${marks.join('')}</g>`);
    }
  out.push('</svg>');
  return out.join('');
}

/* ---------- the side panels ---------- */

function verdictHTML(lab: Lab, t: RecoveryStrings, lang: Lang): string {
  const info = lab.info, config = LABS[lab.id], out: string[] = [];
  out.push(info.rigid ? line('good', '✓', t.rigid) : line('bad', '✗', t.notRigid(info.comps.count)));
  const kind = info.uniform && !config.weights ? 'perm' : 'plan';
  if (info.feasible) out.push(line(info.tight ? 'tight' : 'good', info.tight ? '≈' : '✓', t.fits(kind, info.tight)));
  else if (info.violation) {
    const v = info.violation, R = setText(v.R), NR = v.NR.length ? setText(v.NR) : '∅';
    out.push(line('bad', '✗', config.weights ? t.noPlan(R, num(lang, v.alphaR), NR, num(lang, v.betaNR)) : t.noPerm(R, NR)));
  }
  let theorem: string;
  if (info.recovered) theorem = tag('good', '✓', info.uniform ? 'E.2 · Lean' : 'F.2 · Lean');
  else if (info.uniform) theorem = tag('good', '✓', info.rigid ? 'E.3 · Lean' : 'D.7 · Lean');
  else theorem = tag('tight', '~', `F.3 · ${t.byHand}`);
  out.push(line(info.recovered ? 'good' : 'bad', info.recovered ? '✓' : '✗', t.theorem(info.recovered, theorem)));
  const sol = lab.solver;
  if (sol) {
    const ok = sol.err !== null && sol.err < 1e-4;
    out.push(line(ok ? 'good' : sol.err === null ? 'open' : 'bad', ok ? '✓' : sol.err === null ? '·' : '✗', t.solverLine(sol.iter, !sol.done, small(lang, sol.err), small(lang, sol.gap))));
    if (sol.done && info.recovered && !ok) out.push(line('tight', '≈', t.slow));
  }
  return out.join('');
}

const pieceColor = (c: number): string => (c < 3 ? `var(--piece-${c + 1})` : 'var(--piece-other)');

function graphHTML(lab: Lab, t: RecoveryStrings): string {
  const N = lab.N, comps = lab.info.comps, height = N * 44 + 24, width = 270, y = (k: number): number => 32 + k * 44;
  const out = [`<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${esc(t.graphAria(comps.count))}">`];
  for (let i = 0; i < N; i++)
    for (let j = 0; j < N; j++)
      if (lab.mask[i][j]) out.push(`<line x1="70" y1="${y(i)}" x2="200" y2="${y(j)}" stroke="${pieceColor(comps.row[i])}" stroke-width="2" opacity="0.85"/>`);
  for (let i = 0; i < N; i++)
    out.push(`<circle cx="70" cy="${y(i)}" r="9" fill="var(--row)" stroke="${pieceColor(comps.row[i])}" stroke-width="3"/><text x="52" y="${y(i) + 4}" text-anchor="end" class="lbl">${esc(t.rowName(i))}</text>`);
  for (let j = 0; j < N; j++)
    out.push(`<circle cx="200" cy="${y(j)}" r="9" fill="var(--col)" stroke="${pieceColor(comps.col[j])}" stroke-width="3"/><text x="218" y="${y(j) + 4}" class="lbl">${esc(t.colName(j))}</text>`);
  out.push('</svg>');
  const legend: string[] = [];
  for (let c = 0; c < Math.min(comps.count, 4); c++) {
    const rows = comps.row.flatMap((x, i) => (x === c ? [i] : [])), cols = comps.col.flatMap((x, j) => (x === c ? [j] : []));
    const swatch = `<span class="sw" style="background:${pieceColor(c)}"></span>`;
    legend.push(c < 3 ? `<span>${swatch}${esc(t.piece(c + 1, `{${rows.join(', ')}}`, `{${cols.join(', ')}}`))}</span>` : `<span>${swatch}${esc(t.otherPieces)}</span>`);
  }
  return `<div class="panel-title">${esc(t.graphTitle)}</div>${out.join('')}<div class="legend">${legend.join('')}</div>`;
}

function flipHTML(lab: Lab, t: RecoveryStrings): string {
  if (lab.info.rigid) return `<p class="sub">${t.flipNone}</p>`;
  const f = flipSigns(lab);
  let changed = 0;
  for (let i = 0; i < lab.N; i++) for (let j = 0; j < lab.N; j++) if (f.u[i] * f.v[j] < 0) changed++;
  return `<button ${sendAttr({type: 'lab/flip', id: lab.id})} aria-pressed="${lab.flipped}">${esc(lab.flipped ? t.flipShow : t.flipDo)}</button>` +
    `<p class="sub">${lab.flipped ? t.flipDone(changed, lab.N) : t.flipHint}</p>`;
}

function flowSVG(lab: Lab, t: RecoveryStrings, lang: Lang): string {
  const N = lab.N, info = lab.info, T = info.flow.T, width = 300, height = 214, top = 14, span = 170, gap = 6;
  const out = [`<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${esc(t.flowAria)}">`,
    '<defs><linearGradient id="sand" x1="0" x2="1"><stop offset="0" stop-color="var(--row)"/><stop offset="1" stop-color="var(--col)"/></linearGradient></defs>'];
  const room = span - gap * (N - 1), rowY: number[] = [], colY: number[] = [];
  for (let i = 0, y = top; i < N; i++) {
    rowY.push(y);
    y += info.alpha[i] * room + gap;
  }
  for (let j = 0, y = top; j < N; j++) {
    colY.push(y);
    y += info.beta[j] * room + gap;
  }
  const sent = new Array<number>(N).fill(0), received = new Array<number>(N).fill(0), x0 = 40, x1 = 260, xm = (x0 + x1) / 2;
  for (let i = 0; i < N; i++)
    for (let j = 0; j < N; j++) {
      if (T[i][j] <= 1e-9) continue;
      const h = T[i][j] * room, ya = rowY[i] + sent[i], yb = colY[j] + received[j];
      sent[i] += h;
      received[j] += h;
      out.push(`<path d="M${x0},${ya} C${xm},${ya} ${xm},${yb} ${x1},${yb} L${x1},${yb + h} C${xm},${yb + h} ${xm},${ya + h} ${x0},${ya + h} Z" fill="url(#sand)" opacity="0.6"/>`);
    }
  const v = info.violation, R = new Set(v?.R ?? []), NR = new Set(v?.NR ?? []);
  for (let i = 0; i < N; i++) {
    const h = info.alpha[i] * room;
    out.push(`<rect x="${x0 - 12}" y="${rowY[i]}" width="12" height="${Math.max(h, 1)}" rx="3" fill="var(--row)"/>`);
    if (sent[i] < h - 0.5) out.push(`<rect x="${x0 - 12}" y="${rowY[i] + sent[i]}" width="12" height="${h - sent[i]}" rx="2" fill="none" stroke="var(--bad)" stroke-width="1.5"/>`);
    out.push(`<text x="${x0 - 16}" y="${rowY[i] + h / 2 + 4}" text-anchor="end" class="lbl${R.has(i) ? ' bad' : ''}">${R.has(i) ? 'R·' : ''}${i}</text>`);
  }
  for (let j = 0; j < N; j++) {
    const h = info.beta[j] * room;
    out.push(`<rect x="${x1}" y="${colY[j]}" width="12" height="${Math.max(h, 1)}" rx="3" fill="var(--col)" opacity="${received[j] >= h - 0.5 ? 1 : 0.45}"/>`);
    out.push(`<text x="${x1 + 16}" y="${colY[j] + h / 2 + 4}" class="lbl${NR.has(j) ? ' bad' : ''}">${NR.has(j) ? 'N(R)·' : ''}${j}</text>`);
  }
  out.push(`<text x="${x0 - 12}" y="${height - 6}" class="axis-t">${esc(t.flowRows)}</text><text x="${x1 + 12}" y="${height - 6}" text-anchor="end" class="axis-t">${esc(t.flowCols)}</text></svg>`);
  const left = info.feasible ? '' : `<p class="sub">${icon('bad', '✗')} ${t.flowLeft(num(lang, 1 - info.flow.value))}</p>`;
  return `<div class="panel-title">${esc(t.flowTitle)}</div>${out.join('')}${left}`;
}

/* ---------- charts ---------- */

function witnessText(lab: Lab, t: RecoveryStrings, lang: Lang): string {
  const v = lab.info.violation;
  if (!v) return '';
  const now = Core.witnessAt(lab.N, lab.a, lab.b, v, lab.s);
  return t.witnessNow(num(lang, lab.s, 2), num(lang, now.actual, 4), num(lang, now.bound, 4), lab.N);
}

function witnessChart(lab: Lab, hoverX: number | null | undefined, t: RecoveryStrings, lang: Lang): string {
  const v = lab.info.violation, curve = lab.curve;
  if (!v || !curve) return '';
  const now = Core.witnessAt(lab.N, lab.a, lab.b, v, lab.s);
  const ys = curve.flatMap(p => [p.actual, p.bound]), lo = Math.min(...ys, lab.N), hi = lab.N * 1.02, pad = (hi - lo) * 0.08;
  return lineChart({
    key: `${lab.id}:witness`, label: t.witnessChart, width: 560, height: 200,
    xDomain: [0, 1], yDomain: [lo - pad, hi], xTicks: [0, 0.25, 0.5, 0.75, 1], yTicks: niceTicks(lo - pad, hi, 4),
    fmtX: x => `s = ${num(lang, x, 2)}`, fmtY: y => num(lang, y, 2), fmtTip: y => num(lang, y, 4),
    refs: [{y: lab.N, label: `‖K‖ = ${lab.N}`}],
    series: [
      {name: t.witnessBound, label: t.witnessBoundShort, color: 'var(--ink-3)', points: curve.map(p => [p.s, p.bound] as const)},
      {name: t.witnessActual, label: '‖X(s)‖', color: 'var(--ink)', points: curve.map(p => [p.s, p.actual] as const)},
    ],
    markers: [[now.s, now.actual]], hoverX,
  });
}

function witnessSkeleton(lab: Lab, t: RecoveryStrings): string {
  const form = lab.info.uniform ? 'J − s² 1<sub>R</sub> 1<sub>C</sub><sup>T</sup>' : 'a b<sup>T</sup> − s² a<sub>R</sub> b<sub>C</sub><sup>T</sup>';
  return `<div class="panel-title">${esc(t.witnessTitle)}</div>` +
    `<p class="sub">${t.witnessLead(form)} <span data-w="text"></span></p>` +
    `<div class="slider-row"><span>s</span><input type="range" min="0" max="1" step="0.01" aria-label="s" data-send-value='${messageAttr({type: 'lab/witness', id: lab.id})}'><span class="readout" data-w="s"></span></div>` +
    '<div class="chart" data-w="chart"></div>' +
    `<div class="legend"><span><span class="sq" style="background:var(--ink)"></span>${t.witnessLegendActual}</span><span><span class="sq" style="background:var(--ink-3)"></span>${esc(t.witnessLegendBound)}</span></div>`;
}

function convergenceChart(lab: Lab, hoverX: number | null | undefined, t: RecoveryStrings, lang: Lang): string {
  const sol = lab.solver;
  if (!sol) return '';
  const points = sol.errs.filter(p => p[1] > 0).map(p => [p[0], Math.log10(p[1])] as const);
  // The axis ends at the run's last step, so a run that stops early still fills the picture.
  const end = Math.min(LABS[lab.id].maxIter, niceCeil(Math.max(100, sol.iter)));
  const power = (y: number, digits: number, sup: (e: string) => string): string => `10${sup(num(lang, y, digits))}`;
  return `<div class="panel-title">${esc(t.convTitle)}</div><div class="chart">${lineChart({
    key: `${lab.id}:conv`, label: t.convAria, width: 300, height: 150,
    xDomain: [0, end], yDomain: [-14, 0.5], xTicks: [0, end / 2, end], yTicks: [-12, -8, -4, 0],
    fmtX: x => t.stepAt(Math.round(x)),
    fmtY: y => power(y, 0, e => `<tspan dy="-5" font-size="0.8em">${e}</tspan>`),
    fmtTip: y => power(y, 1, e => `<sup>${e}</sup>`),
    series: [{name: t.errorOff, color: 'var(--ink)', points}], hoverX,
  })}</div>`;
}

function controlsHTML(lab: Lab, t: RecoveryStrings): string {
  const config = LABS[lab.id], names = t.presets[lab.id];
  const presets = config.presets.map(p => `<button ${sendAttr({type: 'lab/preset', id: lab.id, key: p.key})} aria-pressed="${p.key === lab.preset}">${esc(names[p.key] ?? p.key)}</button>`).join('');
  const sizes = config.sizes.length
    ? `<span class="label">${config.sizeName} =</span>` + config.sizes.map(n => `<button ${sendAttr({type: 'lab/size', id: lab.id, N: n})} aria-pressed="${n === lab.N}">${n}</button>`).join('')
    : '';
  const run = config.solver ? `<span class="label"></span><button ${sendAttr({type: 'lab/run', id: lab.id})}>${esc(t.runAgain)}</button>` : '';
  return `<span class="label">${esc(t.pattern)}</span>${presets}${sizes}${run}`;
}

function legendHTML(lab: Lab, t: RecoveryStrings): string {
  const config = LABS[lab.id], items = [`<span><span class="sq" style="background:var(--cell-seen)"></span>${esc(t.legendKept)}</span>`];
  if (config.solver) items.push(`<span><span class="sw" style="background:var(--good)"></span>${esc(t.legendGood)}</span><span><span class="sw" style="background:var(--bad)"></span>${esc(t.legendBad)}</span>`);
  else items.push(`<span><span class="sw" style="background:var(--ink-3)"></span>${esc(t.legendHidden)}</span>`);
  if (config.plan) items.push(`<span><span class="sw" style="background:var(--ink)"></span>${esc(t.legendPlan(config.weights))}</span>`);
  if (config.violation) items.push(`<span><span class="sq" style="background:var(--bad-soft)"></span>${esc(t.legendBlock)}</span>`);
  if (config.weights) items.push(`<span><span class="sq" style="background:var(--row)"></span>${t.legendA}</span><span><span class="sq" style="background:var(--col)"></span>${t.legendB}</span>`);
  if (config.flip) items.push(`<span><span class="sq" style="background:var(--piece-1)"></span>${esc(t.legendFlip)}</span>`);
  return items.join('');
}

/* ---------- mounting ---------- */

export function mountLab(kernel: AppKernel, el: HTMLElement, id: LabId, lang: Lang): () => void {
  const config = LABS[id], t = RECOVERY_STRINGS[lang];
  el.innerHTML = `<div class="controls" data-part="controls"></div>
    <div class="lab-body"><div class="lab-grid" data-part="grid"></div>
    <div class="side"><div class="verdict" data-part="verdict" aria-live="polite"></div>
    ${config.graph ? '<div data-part="graph"></div>' : ''}${config.flip ? '<div data-part="flip"></div>' : ''}
    ${config.flow ? '<div data-part="flow"></div>' : ''}${config.convergence ? '<div data-part="conv"></div>' : ''}</div></div>
    <div class="legend" data-part="legend"></div>
    ${config.witness ? '<div class="witness" data-part="witness"></div>' : ''}`;
  const tableSvg = (): SVGSVGElement | null => part(el, 'grid').querySelector('svg');
  el.addEventListener('pointerdown', event => {
    const handle = (event.target as Element).closest('[data-drag]'), svg = tableSvg();
    if (!handle || !svg) return;
    const {side, k} = JSON.parse(handle.getAttribute('data-drag') ?? '{}') as {side: 'a' | 'b'; k: number};
    el.setPointerCapture(event.pointerId);
    event.preventDefault();
    kernel.send({type: 'lab/grab', id, side, k, ...svgPoint(svg, event)});
  });
  el.addEventListener('pointermove', event => {
    const svg = tableSvg();
    if (event.buttons & 1 && svg && el.hasPointerCapture(event.pointerId)) kernel.send({type: 'lab/drag', id, ...svgPoint(svg, event)});
    const hover = hoverAt(event.target, event);
    if (hover) kernel.send({type: 'hover', key: hover.key, x: hover.x});
  });
  el.addEventListener('pointerout', event => {
    const key = hoverKey(event.target);
    if (key) kernel.send({type: 'hover', key, x: null});
  });
  for (const type of ['pointerup', 'pointercancel'] as const) el.addEventListener(type, () => kernel.send({type: 'lab/release', id}));

  let shown: Lab | null = null, hoverW: number | null | undefined, hoverC: number | null | undefined;
  const unsubscribe = kernel.subscribe(state => {
    const lab = state.recovery.labs[id];
    const hw = state.hover[`${id}:witness`], hc = state.hover[`${id}:conv`];
    if (!lab || (lab === shown && hw === hoverW && hc === hoverC)) return;
    const was = shown;
    const changed = (...keys: (keyof Lab)[]): boolean => !was || keys.some(key => was[key] !== lab[key]);
    if (changed('preset', 'N')) part(el, 'controls').innerHTML = controlsHTML(lab, t);
    if (changed('mask', 'a', 'b', 'solver', 'flipped', 'info')) part(el, 'grid').innerHTML = tableSVG(lab, t, lang);
    if (changed('info', 'solver')) part(el, 'verdict').innerHTML = verdictHTML(lab, t, lang);
    if (config.graph && changed('info', 'mask')) part(el, 'graph').innerHTML = graphHTML(lab, t);
    if (config.flip && changed('info', 'flipped')) part(el, 'flip').innerHTML = flipHTML(lab, t);
    if (config.flow && changed('info')) part(el, 'flow').innerHTML = flowSVG(lab, t, lang);
    if (config.convergence && (changed('solver') || hc !== hoverC)) part(el, 'conv').innerHTML = convergenceChart(lab, hc, t, lang);
    if (!was) part(el, 'legend').innerHTML = legendHTML(lab, t);
    if (config.witness) {
      const box = part(el, 'witness');
      if (changed('curve')) box.innerHTML = lab.curve ? witnessSkeleton(lab, t) : '';
      if (lab.curve && (changed('curve', 's') || hw !== hoverW)) {
        const slider = box.querySelector('input'), text = box.querySelector('[data-w="text"]');
        const value = box.querySelector('[data-w="s"]'), chart = box.querySelector('[data-w="chart"]');
        if (slider && document.activeElement !== slider) slider.value = String(lab.s);
        if (text) text.innerHTML = witnessText(lab, t, lang);
        if (value) value.textContent = num(lang, lab.s, 2);
        if (chart) chart.innerHTML = witnessChart(lab, hw, t, lang);
      }
    }
    shown = lab;
    hoverW = hw;
    hoverC = hc;
  });
  kernel.send({type: 'lab/init', id});
  return unsubscribe;
}

function drawSprings(context: CanvasRenderingContext2D, s: SpringsLab, rowColor: string, colColor: string): void {
  const canvas = context.canvas, W = canvas.width, H = canvas.height, cx = W / 2, cy = H / 2, radius = 190, sp = s.sp, N = sp.N;
  context.clearRect(0, 0, W, H);
  context.strokeStyle = '#2c2c32';
  context.lineWidth = 1.5;
  context.beginPath();
  context.moveTo(cx - 290, cy);
  context.lineTo(cx + 290, cy);
  context.moveTo(cx, cy - 290);
  context.lineTo(cx, cy + 290);
  context.stroke();
  context.strokeStyle = '#55555c';
  context.lineWidth = 2;
  context.beginPath();
  context.arc(cx, cy, radius, 0, 2 * Math.PI);
  context.stroke();
  const at = (p: Core.Point): Core.Point => [cx + radius * p[0], cy - radius * p[1]];
  const points = sp.trails.map(trail => trail[trail.length - 1]);
  let tmax = 0;
  if (s.T) for (const row of s.T) for (const x of row) tmax = Math.max(tmax, x);
  for (let i = 0; i < N; i++)
    for (let j = 0; j < N; j++) {
      if (!sp.mask[i][j]) continue;
      const [ax, ay] = at(points[i]), [bx, by] = at(points[N + j]);
      context.strokeStyle = 'rgba(200,200,205,0.42)';
      context.lineWidth = s.T ? (s.T[i][j] > 1e-9 ? 1.5 + (5 * s.T[i][j]) / tmax : 0.8) : 1.4;
      context.beginPath();
      context.moveTo(ax, ay);
      context.lineTo(bx, by);
      context.stroke();
    }
  sp.trails.forEach((trail, k) => {
    context.strokeStyle = k < N ? rowColor : colColor;
    context.lineWidth = 2.5;
    for (let m = 1; m < trail.length; m++) {
      const [ax, ay] = at(trail[m - 1]), [bx, by] = at(trail[m]);
      context.globalAlpha = 0.5 * (m / trail.length);
      context.beginPath();
      context.moveTo(ax, ay);
      context.lineTo(bx, by);
      context.stroke();
    }
    context.globalAlpha = 1;
  });
  points.forEach((p, k) => {
    const [x, y] = at(p);
    context.fillStyle = k < N ? rowColor : colColor;
    context.strokeStyle = '#121216';
    context.lineWidth = 3;
    context.beginPath();
    context.arc(x, y, k < N ? 11 : 8, 0, 2 * Math.PI);
    context.fill();
    context.stroke();
  });
}

function springsRead(s: SpringsLab, t: RecoveryStrings, lang: Lang): string {
  const info = s.info, sp = s.sp, out: string[] = [];
  out.push(line(info.rigid ? 'good' : 'bad', info.rigid ? '✓' : '✗', esc(info.rigid ? t.springsRigid : t.springsNotRigid(info.comps.count))));
  out.push(line(info.feasible ? 'good' : 'bad', info.feasible ? '✓' : '✗', esc(info.feasible ? t.springsPlan : t.springsNoPlan)));
  out.push(line('open', '·', `${esc(t.step)} <span class="readout">${sp.step}</span>`));
  if (sp.energy !== null) out.push(line(sp.energy < 1e-3 ? 'good' : 'open', sp.energy < 1e-3 ? '✓' : '·', `${esc(t.springsEnergy)} = <span class="readout">${small(lang, sp.energy)}</span>`));
  out.push(line(sp.off < 0.03 ? 'good' : 'open', sp.off < 0.03 ? '✓' : '·', `${esc(t.errorOff)} <span class="readout">${small(lang, sp.off)}</span>`));
  const story = info.recovered ? t.storyRecovered : !info.rigid ? t.storyPieces : t.storyNoPlan;
  out.push(`<p class="sub">${esc(story)}${s.start === 'large' ? esc(t.storyTrap) : ''}</p>`);
  return out.join('');
}

export function mountSprings(kernel: AppKernel, el: HTMLElement, lang: Lang): () => void {
  const t = RECOVERY_STRINGS[lang];
  el.innerHTML = `<div class="controls" data-part="controls"></div>
    <div class="lab-body"><div><canvas width="880" height="620" aria-label="${esc(t.springsAria)}"></canvas></div>
    <div class="side"><div class="verdict" data-part="read"></div></div></div>
    <div class="legend"><span><span class="sw" style="background:var(--row)"></span>${t.springsRows}</span>
    <span><span class="sw" style="background:var(--col)"></span>${t.springsCols}</span>
    <span><span class="sq" style="background:#77777d"></span>${t.springsSpring}</span><span>${esc(t.springsCircle)}</span></div>`;
  const canvas = el.querySelector('canvas'), context = canvas?.getContext('2d');
  const controls = part(el, 'controls'), read = part(el, 'read');
  if (!canvas || !context) return () => undefined;
  const css = getComputedStyle(document.documentElement);
  const rowColor = css.getPropertyValue('--row').trim(), colColor = css.getPropertyValue('--col').trim();
  let shown: SpringsLab | null = null, controlsKey = '';
  const unsubscribe = kernel.subscribe(state => {
    const s = state.recovery.springs;
    if (!s || s === shown) return;
    shown = s;
    const key = `${s.preset}|${s.start}|${s.playing}`;
    if (key !== controlsKey) {
      controlsKey = key;
      controls.innerHTML = `<span class="label">${esc(t.pattern)}</span>` +
        SPRINGS.presets.map(p => `<button ${sendAttr({type: 'springs/preset', key: p.key})} aria-pressed="${p.key === s.preset}">${esc(t.presets.springs[p.key] ?? p.key)}</button>`).join('') +
        `<span class="label">${esc(t.start)}</span>` +
        (['small', 'large'] as const).map(start => `<button ${sendAttr({type: 'springs/start', start})} aria-pressed="${start === s.start}">${esc(t.starts[start])}</button>`).join('') +
        `<span class="label"></span><button ${sendAttr({type: 'springs/play'})}>${esc(s.playing ? t.pause : t.play)}</button><button ${sendAttr({type: 'springs/reset'})}>${esc(t.newStart)}</button>`;
    }
    drawSprings(context, s, rowColor, colColor);
    read.innerHTML = springsRead(s, t, lang);
  });
  kernel.send({type: 'springs/init'});
  return unsubscribe;
}
