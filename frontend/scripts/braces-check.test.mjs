import test from 'node:test';
import assert from 'node:assert/strict';
import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { verifyBracesPatch } from './braces-check.mjs';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

async function fixture(change, expected) {
  const root = await mkdtemp(path.join(os.tmpdir(), 'braces-integrity-'));
  try {
    await mkdir(path.join(root, 'frontend/patches'), { recursive: true });
    for (const file of ['package.json', 'pnpm-lock.yaml', 'frontend/patches/braces@3.0.3.patch', 'frontend/patches/braces-3.0.3-integrity.json']) {
      await cp(path.join(projectRoot, file), path.join(root, file));
    }
    const lock = await readFile(path.join(root, 'pnpm-lock.yaml'), 'utf8');
    const hash = lock.match(/braces@3\.0\.3:\s*\n\s+hash:\s*([^\s]+)/)?.[1];
    assert.ok(hash, 'test needs an actual frozen patched lockfile');
    const installed = path.join(projectRoot, `node_modules/.pnpm/braces@3.0.3_patch_hash=${hash}/node_modules/braces`);
    const instance = path.join(root, `node_modules/.pnpm/braces@3.0.3_patch_hash=${hash}/node_modules/braces`);
    await mkdir(path.dirname(instance), { recursive: true });
    await cp(installed, instance, { recursive: true });
    await change({ root, instance, hash });
    const result = await verifyBracesPatch({ root });
    assert.equal(result.passed, false);
    assert.match(result.errors.join('; '), expected);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}

test('fresh installation verifies every patched runtime and actual downstream regressions', async () => {
  const result = await verifyBracesPatch({ root: projectRoot });
  assert.equal(result.passed, true, JSON.stringify(result.errors));
  assert.ok(result.instances.length >= 1);
  assert.ok(result.consumers.some(consumer => consumer.storeEntry.startsWith('micromatch@4.0.8')));
  assert.ok(result.consumers.some(consumer => consumer.storeEntry.startsWith('chokidar@3.6.0')));
  assert.equal(result.regression.runs[0].security, 63);
  assert.equal(result.regression.runs[0].compatibility, 89);
});

test('changing the reviewed patch fails before compatibility results could excuse it', async () => {
  await fixture(async ({ root }) => {
    await writeFile(path.join(root, 'frontend/patches/braces@3.0.3.patch'), 'different patch\n');
  }, /Patch digest/);
});

test('an undeclared patch does not count as an installed repair', async () => {
  await fixture(async ({ root }) => {
    const file = path.join(root, 'package.json');
    const data = JSON.parse(await readFile(file, 'utf8'));
    delete data.pnpm.patchedDependencies;
    await writeFile(file, JSON.stringify(data));
  }, /root patch registration missing/);
});

test('a stale lockfile cannot authorize the patched installation', async () => {
  await fixture(async ({ root }) => {
    const file = path.join(root, 'pnpm-lock.yaml');
    const text = await readFile(file, 'utf8');
    await writeFile(file, text.replace(/patchedDependencies:\s*\n[\s\S]*?(?=\n\S|$)/, ''));
  }, /lockfile patch registration missing/);
});

test('any changed installed walker rejects the whole identity check', async () => {
  await fixture(async ({ instance }) => {
    await writeFile(path.join(instance, 'lib/compile.js'), "module.exports = () => '';\n");
  }, /runtime digest mismatch/);
});

test('changing package identity cannot conceal the advisory', async () => {
  await fixture(async ({ instance }) => {
    const file = path.join(instance, 'package.json');
    const data = JSON.parse(await readFile(file, 'utf8'));
    data.version = '3.0.4';
    await writeFile(file, JSON.stringify(data));
  }, /Unexpected braces identity or version/);
});

test('one extra unpatched installed instance makes the aggregate fail', async () => {
  await fixture(async ({ root, instance }) => {
    const extra = path.join(root, 'node_modules/.pnpm/braces@3.0.3/node_modules/braces');
    await mkdir(path.dirname(extra), { recursive: true });
    await cp(instance, extra, { recursive: true });
  }, /not bound to the exact lockfile patch hash/);
});

test('an empty install is unavailable evidence and fails', async () => {
  await fixture(async ({ root }) => {
    await rm(path.join(root, 'node_modules/.pnpm'), { recursive: true });
    await mkdir(path.join(root, 'node_modules/.pnpm'), { recursive: true });
  }, /No installed braces instances/);
});

test('leaving a runtime file out of the identity manifest fails', async () => {
  await fixture(async ({ root }) => {
    const file = path.join(root, 'frontend/patches/braces-3.0.3-integrity.json');
    const data = JSON.parse(await readFile(file, 'utf8'));
    delete data.runtimeSha256['lib/utils.js'];
    await writeFile(file, JSON.stringify(data));
  }, /Incomplete runtime integrity manifest/);
});
