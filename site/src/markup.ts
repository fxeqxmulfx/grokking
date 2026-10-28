/** Small HTML builders shared by the views. They return strings and change nothing. */

import {messageAttr} from './kernel.ts';
import type {AppMessage} from './app/state.ts';

export type IconKind = 'good' | 'bad' | 'tight' | 'open' | 'run';

export const esc = (text: string): string =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

/** The attribute that makes a control send `message` when clicked; the type checks the message. */
export const sendAttr = (message: AppMessage): string => `data-send='${messageAttr(message)}'`;

export const icon = (kind: IconKind, mark: string): string => `<span class="icon ${kind}" aria-hidden="true">${mark}</span>`;

export const tag = (kind: IconKind, mark: string, text: string): string => `<span class="tag">${icon(kind, mark)}${text}</span>`;

export const line = (kind: IconKind, mark: string, html: string): string =>
  `<div class="line">${icon(kind, mark)}<span>${html}</span></div>`;

/** The point of an SVG's own coordinates under a pointer event. */
export function svgPoint(svg: SVGSVGElement, event: PointerEvent): {x: number; y: number} {
  const matrix = svg.getScreenCTM();
  if (!matrix) return {x: 0, y: 0};
  const point = new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix.inverse());
  return {x: point.x, y: point.y};
}

/** The element of `root` marked `data-part="name"`; a missing part is a bug of the view. */
export function part(root: Element, name: string): HTMLElement {
  const found = root.querySelector<HTMLElement>(`[data-part="${name}"]`);
  if (!found) throw new Error(`missing part ${name}`);
  return found;
}
