/**
 * The entry point. It creates the kernel and wires the browser to it: control clicks and
 * inputs, hash changes and the animation clock only send messages; the shell and the widgets
 * render from the state.
 */

import {connectControls, createKernel} from '../kernel.ts';
import {initialState, moving, update} from './update.ts';
import {mountShell} from './shell.ts';
import type {AppMessage} from './state.ts';

const routeMessage = (): AppMessage => ({type: 'route', hash: location.hash, preferred: navigator.languages});

const kernel = createKernel(update, update(initialState(), routeMessage()));
const send = (message: AppMessage): void => kernel.send(message);

connectControls(send, document);
window.addEventListener('hashchange', () => send(routeMessage()));

const root = document.getElementById('app');
if (root) mountShell(kernel, root);

let frame = 0;
kernel.subscribe(state => {
  if (moving(state) && frame === 0)
    frame = requestAnimationFrame(() => {
      frame = 0;
      send({type: 'tick'});
    });
});
