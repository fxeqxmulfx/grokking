/**
 * The kernel pattern every page of the site follows.
 *
 * - One function, `update(state, message)`, computes the next state. It is the only code that
 *   changes state, and the kernel holds that state.
 * - Views subscribe to the kernel and render only from the state they receive.
 * - Controls (links, buttons, sliders, drags, the animation clock) only send messages to the
 *   kernel. A control carries its message in `data-send`, or in `data-send-value` with its
 *   current value added as `value`; `connectControls` forwards it and does nothing else.
 *
 * A message sent while views are being notified waits until they all have the current state.
 */

export interface Message {
  readonly type: string;
}

export interface Subscribed {
  readonly type: 'subscribe';
}

export type View<S, M extends Message> = (state: S, message: M | Subscribed) => void;

export interface Kernel<S, M extends Message> {
  send(message: M): void;
  /** Call `view` with the current state now and after every change; the result unsubscribes. */
  subscribe(view: View<S, M>): () => void;
}

interface Entry<S, M extends Message> {
  readonly view: View<S, M>;
  active: boolean;
}

export function createKernel<S, M extends Message>(update: (state: S, message: M) => S, initial: S): Kernel<S, M> {
  let state = initial, dispatching = false;
  const entries: Entry<S, M>[] = [], queue: M[] = [];
  return {
    send(message) {
      queue.push(message);
      if (dispatching) return;
      dispatching = true;
      try {
        for (let next = queue.shift(); next !== undefined; next = queue.shift()) {
          const after = update(state, next);
          if (after === state) continue;
          state = after;
          for (const entry of entries.slice()) if (entry.active) entry.view(state, next);
        }
      } finally {
        dispatching = false;
        queue.length = 0;
      }
    },
    subscribe(view) {
      const entry: Entry<S, M> = {view, active: true};
      entries.push(entry);
      view(state, {type: 'subscribe'});
      return () => {
        entry.active = false;
        const k = entries.indexOf(entry);
        if (k >= 0) entries.splice(k, 1);
      };
    },
  };
}

/** Forward the messages that controls carry to `send`. */
export function connectControls<M extends Message>(send: (message: M) => void, root: Document | HTMLElement): void {
  root.addEventListener('click', event => {
    const control = (event.target as Element | null)?.closest('[data-send]');
    if (control) send(JSON.parse(control.getAttribute('data-send') ?? 'null') as M);
  });
  root.addEventListener('input', event => {
    const control = (event.target as Element | null)?.closest('[data-send-value]');
    if (control instanceof HTMLInputElement)
      send({...JSON.parse(control.getAttribute('data-send-value') ?? 'null'), value: Number(control.value)} as M);
  });
}

/** A message as the value of a single-quoted HTML attribute, for `data-send` and `data-send-value`. */
export function messageAttr(message: object): string {
  return JSON.stringify(message).replace(/&/g, '&amp;').replace(/'/g, '&#39;').replace(/</g, '&lt;');
}
