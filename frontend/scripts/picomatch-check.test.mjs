import assert from 'node:assert/strict';
import { cp, mkdir, mkdtemp, readFile, rm, symlink, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import { verifyPicomatchPatch } from './picomatch-check.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const baseline = await verifyPicomatchPatch({ root });

test('checks all three installed versions and real downstream calls', () => {
  assert.equal(baseline.passed, true, baseline.errors.join('; '));
  assert.equal(baseline.instances.length, 3);
  assert.equal(baseline.instances.reduce((count, item) => count + item.regression.checks, 0), 438);
});

async function fixture(change, expectedError) {
  assert.equal(baseline.passed, true);
  const temp = await mkdtemp(path.join(os.tmpdir(), 'picomatch-verification-'));
  try {
    await mkdir(path.join(temp, 'frontend/patches'), { recursive: true });
    await cp(path.join(root, 'package.json'), path.join(temp, 'package.json'));
    await cp(path.join(root, 'pnpm-lock.yaml'), path.join(temp, 'pnpm-lock.yaml'));
    for (const name of ['picomatch-integrity.json', ...baseline.instances.map(item => `picomatch@${item.version}.patch`)]) {
      await cp(path.join(root, 'frontend/patches', name), path.join(temp, 'frontend/patches', name));
    }
    const store = path.join(temp, 'node_modules/.pnpm');
    await mkdir(store, { recursive: true });
    for (const item of baseline.instances) {
      const name = path.basename(path.dirname(path.dirname(item.packageRoot)));
      await cp(item.packageRoot, path.join(store, name, 'node_modules/picomatch'), { recursive: true });
    }
    const consumer = baseline.consumers.find(item => item.storeEntry.startsWith('micromatch@'));
    const consumerModules = path.join(store, consumer.storeEntry, 'node_modules');
    await mkdir(consumerModules, { recursive: true });
    await symlink(path.join(root, 'node_modules/.pnpm', consumer.storeEntry, 'node_modules/micromatch'), path.join(consumerModules, 'micromatch'));
    const consumed = baseline.instances.find(item => item.packageRoot === path.dirname(consumer.loadedEntry));
    const consumedName = path.basename(path.dirname(path.dirname(consumed.packageRoot)));
    await symlink(path.join(store, consumedName, 'node_modules/picomatch'), path.join(consumerModules, 'picomatch'));
    await change(temp, store);
    const result = await verifyPicomatchPatch({ root: temp });
    assert.equal(result.passed, false);
    assert.match(result.errors.join('; '), expectedError);
  } finally {
    await rm(temp, { recursive: true, force: true });
  }
}

test('rejects changed patch bytes', async () => {
  await fixture(temp => writeFile(path.join(temp, 'frontend/patches/picomatch@4.0.4.patch'), 'changed'), /digest mismatch/);
});
test('rejects absent lockfile registration', async () => {
  await fixture(async temp => {
    const file = path.join(temp, 'pnpm-lock.yaml');
    await writeFile(file, (await readFile(file, 'utf8')).replace('  picomatch@4.0.4:', '  other@4.0.4:'));
  }, /lockfile patch registration missing/);
});
test('rejects an additional unpatched instance', async () => {
  await fixture(async (temp, store) => {
    const item = baseline.instances[0];
    await cp(item.packageRoot, path.join(store, `picomatch@${item.version}`, 'node_modules/picomatch'), { recursive: true });
  }, /Unpatched or unexpected/);
});
test('rejects changed installed runtime despite a valid patch registration', async () => {
  await fixture(async (temp, store) => {
    const item = baseline.instances[0];
    const name = path.basename(path.dirname(path.dirname(item.packageRoot)));
    const copy = path.join(store, name, 'node_modules/picomatch');
    await writeFile(path.join(copy, 'lib/parse.js'), 'module.exports = () => ({});');
  }, /runtime digest mismatch/);
});
