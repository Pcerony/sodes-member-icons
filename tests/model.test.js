import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';

test('download model exists', () => {
  assert.ok(existsSync(new URL('../model.js', import.meta.url)), 'Download model not implemented');
});

test('validates colors and makes safe recolored standalone SVG downloads', async () => {
  if (!existsSync(new URL('../model.js', import.meta.url))) return;
  const { normalizeColor, recolorSvg, downloadName } = await import('../model.js');
  assert.equal(normalizeColor('#ff0066'), '#FF0066');
  assert.equal(normalizeColor('123abc'), '#123ABC');
  assert.equal(normalizeColor('bad'), null);
  assert.equal(normalizeColor('red" onload="alert(1)'), null);
  const source = '<svg color="#A6D62F" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" d="M1 2"/></svg>';
  assert.match(recolorSvg(source, '#0066ff'), /color="#0066FF"/);
  assert.match(recolorSvg(source, '#0066ff'), /fill="currentColor"/);
  assert.doesNotMatch(recolorSvg(source, '#0066ff'), /<image|data:image|<rect/);
  assert.throws(() => recolorSvg(source, 'bad'));
  assert.equal(downloadName('zoe', 'svg', '#0066ff'), 'zoe-0066ff.svg');
  assert.equal(downloadName('zoe', 'png', '#0066ff'), 'zoe-0066ff.png');
});
