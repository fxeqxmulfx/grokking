/**
 * Line charts as SVG strings, with a hover layer. The layer carries what turns a pointer
 * position into a data x; the view that owns the chart sends that x to the kernel as a
 * `hover` message, and the chart is redrawn with the crosshair from the state.
 */

import {messageAttr} from '../kernel.ts';
import {esc} from '../markup.ts';

export interface Series {
  readonly name: string;
  readonly label?: string;
  readonly color: string;
  readonly points: readonly (readonly [number, number])[];
  readonly dashed?: boolean;
}

export interface ChartSpec {
  readonly key: string;
  readonly label: string;
  readonly width: number;
  readonly height: number;
  readonly xDomain: readonly [number, number];
  readonly yDomain: readonly [number, number];
  readonly xTicks: readonly number[];
  readonly yTicks: readonly number[];
  readonly fmtX: (x: number) => string;
  readonly fmtY: (y: number) => string;
  readonly fmtTip: (y: number) => string;
  readonly series: readonly Series[];
  /** Horizontal reference lines, labelled at the right end unless `start` puts the label at the left. */
  readonly refs?: readonly {readonly y: number; readonly label: string; readonly start?: boolean}[];
  readonly markers?: readonly (readonly [number, number])[];
  readonly hoverX: number | null | undefined;
}

export interface HoverLayer {
  readonly key: string;
  readonly x0: number;
  readonly x1: number;
  readonly left: number;
  readonly plot: number;
}

export function lineChart(o: ChartSpec): string {
  const ml = 52, mr = 14, mt = 12, mb = 30, [x0, x1] = o.xDomain, [y0, y1] = o.yDomain;
  const right = o.width - mr, bottom = o.height - mb, inside = (y: number): boolean => y >= y0 && y <= y1;
  const X = (x: number): number => ml + ((x - x0) / (x1 - x0)) * (right - ml);
  // Lines may leave the y range: the clip cuts them at the frame instead of flattening them onto it.
  const Y = (y: number): number => mt + (1 - (y - y0) / (y1 - y0)) * (bottom - mt);
  const clip = `clip-${o.key.replace(/[^A-Za-z0-9_-]/g, '-')}`;
  const out = [`<svg viewBox="0 0 ${o.width} ${o.height}" role="img" aria-label="${esc(o.label)}">`,
    `<clipPath id="${clip}"><rect x="${ml}" y="${mt}" width="${right - ml}" height="${bottom - mt}"/></clipPath>`];
  for (const t of o.yTicks) out.push(`<line x1="${ml}" x2="${right}" y1="${Y(t)}" y2="${Y(t)}" class="gridline"/><text x="${ml - 6}" y="${Y(t) + 4}" text-anchor="end" class="axis-t">${o.fmtY(t)}</text>`);
  for (const t of o.xTicks) {
    // The tick at the right end is read leftwards, so that it stays inside the picture.
    const anchor = X(t) > right - 1 ? 'end' : 'middle';
    out.push(`<text x="${X(t)}" y="${bottom + 16}" text-anchor="${anchor}" class="axis-t">${o.fmtX(t)}</text>`);
  }
  out.push(`<line x1="${ml}" x2="${right}" y1="${bottom}" y2="${bottom}" class="axis"/>`);
  for (const r of o.refs ?? []) {
    const [x, anchor] = r.start ? [ml + 4, 'start'] : [right, 'end'];
    out.push(`<line x1="${ml}" x2="${right}" y1="${Y(r.y)}" y2="${Y(r.y)}" class="ref"/><text x="${x}" y="${Y(r.y) - 5}" text-anchor="${anchor}" class="axis-t">${esc(r.label)}</text>`);
  }
  for (const s of o.series) {
    if (s.points.length < 2) continue;
    const d = s.points.map((p, k) => `${k ? 'L' : 'M'}${X(p[0]).toFixed(1)},${Y(p[1]).toFixed(1)}`).join('');
    out.push(`<path d="${d}" fill="none" stroke="${s.color}" stroke-width="2" stroke-linejoin="round" clip-path="url(#${clip})"${s.dashed ? ' stroke-dasharray="5 4"' : ''}/>`);
    // The label sits at the last point the frame shows.
    const last = s.points.findLast(p => inside(p[1]));
    if (s.label && last) out.push(`<text x="${X(last[0]) - 4}" y="${Math.max(mt + 12, Y(last[1]) - 7)}" text-anchor="end" class="axis-t">${esc(s.label)}</text>`);
  }
  for (const m of o.markers ?? []) if (inside(m[1])) out.push(`<circle cx="${X(m[0])}" cy="${Y(m[1])}" r="5" class="marker"/>`);
  let tip = '';
  if (o.hoverX != null) {
    const hx = Math.min(x1, Math.max(x0, o.hoverX));
    out.push(`<line x1="${X(hx)}" x2="${X(hx)}" y1="${mt}" y2="${bottom}" class="crosshair"/>`);
    const rows: string[] = [];
    for (const s of o.series) {
      if (!s.points.length) continue;
      let best = s.points[0];
      for (const p of s.points) if (Math.abs(p[0] - hx) < Math.abs(best[0] - hx)) best = p;
      if (inside(best[1])) out.push(`<circle cx="${X(best[0])}" cy="${Y(best[1])}" r="4" fill="${s.color}" class="hover-dot"/>`);
      rows.push(`${esc(s.name)}: ${o.fmtTip(best[1])}`);
    }
    tip = `<div class="tip" style="left:${Math.min((X(hx) / o.width) * 100, 60)}%">${esc(o.fmtX(hx))}<br>${rows.join('<br>')}</div>`;
  }
  const layer: HoverLayer = {key: o.key, x0, x1, left: ml, plot: right - ml};
  out.push(`<rect x="${ml}" y="${mt}" width="${right - ml}" height="${bottom - mt}" fill="transparent" data-hover='${messageAttr(layer)}'/></svg>`);
  // The picture is drawn at most at its own size, so its words keep their size; on a narrow
  // screen it shrinks to 85% of it and then scrolls sideways.
  return `<div class="plot" style="max-width:${o.width}px;min-width:${Math.round(o.width * 0.85)}px">${out.join('')}${tip}</div>`;
}

export function niceTicks(lo: number, hi: number, count: number): number[] {
  const raw = (hi - lo) / count, step10 = Math.pow(10, Math.floor(Math.log10(raw))), ratio = raw / step10;
  const step = step10 * (ratio >= 5 ? 5 : ratio >= 2 ? 2 : 1), out: number[] = [];
  for (let t = Math.ceil(lo / step) * step; t <= hi + 1e-9; t += step) out.push(Number(t.toFixed(10)));
  return out;
}

/** The least of 1, 2 and 5 times a power of ten that is at least `x > 0`. */
export function niceCeil(x: number): number {
  const p = Math.pow(10, Math.floor(Math.log10(x)));
  return [1, 2, 5, 10].map(m => m * p).find(y => y >= x * (1 - 1e-12)) ?? 10 * p;
}

/** The data x of a pointer over a chart's hover layer, or null when it is not over one. */
export function hoverAt(target: EventTarget | null, event: PointerEvent): {key: string; x: number} | null {
  const layer = target instanceof Element ? target.closest('[data-hover]') : null;
  if (!(layer instanceof SVGGraphicsElement) || !layer.ownerSVGElement) return null;
  const h = JSON.parse(layer.getAttribute('data-hover') ?? '{}') as HoverLayer;
  const matrix = layer.ownerSVGElement.getScreenCTM();
  if (!matrix) return null;
  const p = new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix.inverse());
  return {key: h.key, x: h.x0 + ((p.x - h.left) / h.plot) * (h.x1 - h.x0)};
}

/** The key of the hover layer a pointer leaves, or null. */
export function hoverKey(target: EventTarget | null): string | null {
  const layer = target instanceof Element ? target.closest('[data-hover]') : null;
  return layer ? (JSON.parse(layer.getAttribute('data-hover') ?? '{}') as HoverLayer).key : null;
}
