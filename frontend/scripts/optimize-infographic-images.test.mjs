import assert from 'node:assert/strict';
import { mkdtemp, readFile, readdir, rm, stat, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { optimizeInfographicImages } from './optimize-infographic-images.mjs';

test('a newly added original automatically gets both optimized display widths', async (t) => {
  const directory = await mkdtemp(join(tmpdir(), 'infographic-images-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const original = await readFile(new URL(
    '../public/images/infographics/mesh-belt-u-bolt-rated-capacity.png',
    import.meta.url,
  ));
  const originalPath = join(directory, 'new-infographic.png');
  await writeFile(originalPath, original);

  assert.equal(await optimizeInfographicImages(directory), 1);
  const outputs = ['new-infographic-768w.webp', 'new-infographic-1086w.webp'];
  assert.deepEqual((await readdir(directory)).sort(), [...outputs, 'new-infographic.png'].sort());
  for (const name of outputs) {
    const image = await readFile(join(directory, name));
    assert.equal(image.toString('ascii', 0, 4), 'RIFF');
    assert.equal(image.toString('ascii', 8, 12), 'WEBP');
    assert(image.length < original.length / 4, `${name} must be smaller than the original`);
  }
  assert.deepEqual(await readFile(originalPath), original);

  const firstOutput = join(directory, outputs[0]);
  const before = await stat(firstOutput);
  await optimizeInfographicImages(directory);
  assert.equal((await stat(firstOutput)).mtimeMs, before.mtimeMs);
});
