import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createKernel, messageAttr} from '../src/kernel.ts';

interface Step {
  readonly type: 'add' | 'same';
}

const count = (state: number, message: Step): number => (message.type === 'add' ? state + 1 : state);

test('a view sees the state when it subscribes and after every change, not after a no-op', () => {
  const kernel = createKernel(count, 0);
  const seen: string[] = [];
  kernel.subscribe((state, message) => seen.push(`${message.type}:${state}`));
  kernel.send({type: 'add'});
  kernel.send({type: 'same'});
  kernel.send({type: 'add'});
  assert.deepEqual(seen, ['subscribe:0', 'add:1', 'add:2']);
});

test('a message sent while views are notified waits until every view has the state', () => {
  const kernel = createKernel(count, 0);
  const order: string[] = [];
  kernel.subscribe((state, message) => {
    order.push(`a${state}`);
    if (message.type === 'add' && state === 1) kernel.send({type: 'add'});
  });
  kernel.subscribe(state => order.push(`b${state}`));
  kernel.send({type: 'add'});
  assert.deepEqual(order, ['a0', 'b0', 'a1', 'b1', 'a2', 'b2']);
});

test('an unsubscribed view is not called, even later in the round that removed it', () => {
  const kernel = createKernel(count, 0);
  const calls: string[] = [];
  let removeB = (): void => undefined;
  kernel.subscribe((state, message) => {
    calls.push(`a${state}`);
    if (message.type === 'add') removeB();
  });
  removeB = kernel.subscribe(state => calls.push(`b${state}`));
  kernel.send({type: 'add'});
  kernel.send({type: 'add'});
  assert.deepEqual(calls, ['a0', 'b0', 'a1', 'a2']);
});

test('a view that throws leaves the kernel able to dispatch', () => {
  const kernel = createKernel(count, 0);
  let fail = true;
  const seen: number[] = [];
  kernel.subscribe((state, message) => {
    if (message.type !== 'subscribe' && fail) throw new Error('view');
    seen.push(state);
  });
  assert.throws(() => kernel.send({type: 'add'}));
  fail = false;
  kernel.send({type: 'add'});
  assert.deepEqual(seen, [0, 2]);
});

test('messageAttr escapes what would end a single-quoted attribute', () => {
  assert.equal(messageAttr({type: "it's <b> & c"}), '{"type":"it&#39;s &lt;b> &amp; c"}');
});
