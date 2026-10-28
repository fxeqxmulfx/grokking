import {test} from 'node:test';
import assert from 'node:assert/strict';
import {lineChart, niceCeil, niceTicks, type ChartSpec} from '../src/widgets/charts.ts';

const spec = (points: readonly (readonly [number, number])[]): ChartSpec => ({
  key: 'lab:test', label: 'test', width: 400, height: 200, xDomain: [0, 1], yDomain: [0, 1],
  xTicks: [0, 0.5, 1], yTicks: [0, 1], fmtX: x => `x${x}`, fmtY: y => `y${y}`, fmtTip: y => `${y}`,
  series: [{name: 'f', label: 'f', color: 'red', points}], markers: [[1, 2]], hoverX: null,
});

test('a chart axis ends at the next 1, 2 or 5 times a power of ten', () => {
  assert.deepEqual([75, 100, 101, 480, 3000, 6000, 0.03].map(niceCeil), [100, 100, 200, 500, 5000, 10000, 0.05]);
  assert.deepEqual(niceTicks(3.4, 4.08, 4), [3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 4]);
});

test('a line that leaves the y range is cut by the frame, not flattened onto it', () => {
  const svg = lineChart(spec([[0, 0.5], [1, 3]]));
  // Plot from y = 12 (value 1) to y = 170 (value 0): the value 3 lies 316 units above the bottom.
  assert.match(svg, /d="M52\.0,91\.0L386\.0,-304\.0"/);
  assert.match(svg, /clip-path="url\(#clip-lab-test\)"/);
  // The label sits at the last point inside the frame; the marker outside the frame is left out.
  assert.match(svg, /<text x="48" y="84" text-anchor="end" class="axis-t">f<\/text>/);
  assert.doesNotMatch(svg, /class="marker"/);
});

test('the last x tick reads leftwards and stays inside the picture', () => {
  const svg = lineChart(spec([[0, 0], [1, 1]]));
  assert.match(svg, /<text x="386" y="186" text-anchor="end" class="axis-t">x1<\/text>/);
  assert.match(svg, /<text x="219" y="186" text-anchor="middle" class="axis-t">x0\.5<\/text>/);
});
