import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { createHash } from 'node:crypto';

test('eleven assets map to selected originals without publishing photographs', async () => {
  const root = new URL('../', import.meta.url);
  const members = JSON.parse(await fs.readFile(new URL('members.json', root)));
  assert.equal(members.length, 11);
  assert.equal(new Set(members.map(member => member.id)).size, 11);
  const integrity = JSON.parse(await fs.readFile(new URL('asset-integrity.json', root)));
  assert.equal(integrity.zoe.selected, 'zoe-B');
  assert.equal(integrity.feixue.selected, 'feixue-v2');
  for (const member of members) {
    assert.ok(integrity[member.id], member.id);
    const svg = await fs.readFile(new URL(member.svg, root), 'utf8');
    assert.match(svg, /fill="currentColor"/);
    assert.doesNotMatch(svg, /<image|<rect|data:image/);
    const published = await fs.readFile(new URL(member.original, root));
    const hash = bytes => createHash('sha256').update(bytes).digest('hex');
    assert.equal(hash(published), integrity[member.id].sha256, `${member.id}: original PNG must be unchanged`);
  }
});
