import { createHash } from 'node:crypto';
import { readdir, readFile, realpath } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { runBracesRegressions } from './braces-regression.mjs';

const defaultRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const hash = bytes => createHash('sha256').update(bytes).digest('hex');

export async function verifyBracesPatch({ root = defaultRoot } = {}) {
  const result = { passed: false, advisory: 'GHSA-vfj7-8cjw-p6xm', root: path.resolve(root), errors: [], instances: [], consumers: [], regression: null };
  try {
    const metadata = JSON.parse(await readFile(path.join(root, 'frontend/patches/braces-3.0.3-integrity.json'), 'utf8'));
    const manifest = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'));
    const registered = manifest.pnpm?.patchedDependencies?.['braces@3.0.3'];
    if (registered !== 'frontend/patches/braces@3.0.3.patch') throw new Error('Exact root patch registration missing');
    if (metadata.packageName !== 'braces' || metadata.packageVersion !== '3.0.3' || metadata.advisory !== result.advisory) throw new Error('Invalid patch identity metadata');
    result.patchSha256 = hash(await readFile(path.join(root, registered)));
    if (result.patchSha256 !== metadata.patchSha256) throw new Error('Patch digest does not match the reviewed artifact');
    const lock = await readFile(path.join(root, 'pnpm-lock.yaml'), 'utf8');
    const registration = lock.match(/(?:^|\n)patchedDependencies:\s*\n([\s\S]*?)(?=\n\S|$)/)?.[1];
    const lockPatch = registration?.match(/(?:^|\n)\s{2}braces@3\.0\.3:\s*\n\s{4}hash:\s*['"]?([^\s'"]+)['"]?\s*\n\s{4}path:\s*['"]?([^\s'"]+)['"]?/);
    if (!lockPatch || lockPatch[2] !== registered) throw new Error('Exact lockfile patch registration missing');
    result.pnpmPatchHash = lockPatch[1];
    const store = path.join(root, 'node_modules/.pnpm');
    const entries = await readdir(store, { withFileTypes: true });
    const instancePaths = new Map();
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const packageJson = path.join(store, entry.name, 'node_modules/braces/package.json');
      let resolved;
      try { resolved = await realpath(packageJson); } catch (error) { if (error.code === 'ENOENT') continue; throw error; }
      const data = JSON.parse(await readFile(resolved, 'utf8'));
      if (data.name !== 'braces' || data.version !== '3.0.3') throw new Error('Unexpected braces identity or version in the dependency graph');
      const packageRoot = path.dirname(resolved);
      if (!packageRoot.includes(`braces@3.0.3_patch_hash=${result.pnpmPatchHash}`)) throw new Error('Installed braces is not bound to the exact lockfile patch hash');
      const parentName = entry.name.startsWith('@')
        ? entry.name.slice(0, entry.name.indexOf('@', 1)).replace('+', '/')
        : entry.name.slice(0, entry.name.indexOf('@'));
      const consumerManifest = path.join(store, entry.name, 'node_modules', parentName, 'package.json');
      const require = createRequire(consumerManifest);
      const loadedPackageJson = await realpath(require.resolve('braces/package.json'));
      const loadedEntry = await realpath(require.resolve('braces'));
      if (loadedPackageJson !== resolved || loadedEntry !== path.join(packageRoot, 'index.js')) throw new Error('Consumer resolution bypasses the verified braces instance');
      instancePaths.set(packageRoot, resolved);
      result.consumers.push({ storeEntry: entry.name, consumerManifest, packageJson: resolved, loadedEntry, resolutionPassed: true });
    }
    if (instancePaths.size === 0) throw new Error('No installed braces instances found');
    const runtimeFiles = ['index.js', 'package.json', 'lib/constants.js', 'lib/parse.js', 'lib/compile.js', 'lib/expand.js', 'lib/stringify.js', 'lib/utils.js'];
    if (Object.keys(metadata.runtimeSha256).sort().join('\n') !== runtimeFiles.sort().join('\n')) throw new Error('Incomplete runtime integrity manifest');
    for (const [packageRoot, packageJson] of instancePaths) {
      for (const file of runtimeFiles) {
        if (hash(await readFile(path.join(packageRoot, file))) !== metadata.runtimeSha256[file]) throw new Error(`Installed braces runtime digest mismatch: ${file}`);
      }
      result.instances.push({ packageRoot, packageJson, name: 'braces', version: '3.0.3', integrityPassed: true });
    }
    const micromatch = result.consumers.find(consumer => /^micromatch@4\.0\.8(?:_|$)/.test(consumer.storeEntry));
    if (!micromatch) throw new Error('Expected downstream micromatch 4.0.8 consumer missing');
    const micromatchPackageJson = path.join(store, micromatch.storeEntry, 'node_modules/micromatch/package.json');
    const runs = [];
    for (const instance of result.instances) runs.push(await runBracesRegressions({ packageJson: instance.packageJson, micromatchPackageJson }));
    result.regression = { passed: runs.every(run => run.passed), total: runs.reduce((sum, run) => sum + run.total, 0), runs };
    if (!result.regression.passed) throw new Error('Braces security or compatibility regression failed');
    result.passed = true;
  } catch (error) {
    result.errors.push(error.message);
  }
  return result;
}

async function main() {
  const args = process.argv.slice(2);
  let root = defaultRoot;
  let json = false;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--json') json = true;
    else if (args[i] === '--root' && args[i + 1]) root = path.resolve(args[++i]);
    else throw new Error('Usage: node frontend/scripts/braces-check.mjs [--root directory] [--json]');
  }
  const result = await verifyBracesPatch({ root });
  console.log(json ? JSON.stringify(result) : `Braces patch check ${result.passed ? 'passed' : 'failed'}: ${result.instances.length} instance(s), ${result.regression?.total || 0} regression case(s)${result.errors.length ? '; ' + result.errors.join('; ') : ''}`);
  process.exitCode = result.passed ? 0 : 1;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(error => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
