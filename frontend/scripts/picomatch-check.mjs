import { createHash } from 'node:crypto';
import { execFile } from 'node:child_process';
import { createRequire } from 'node:module';
import { readdir, readFile, realpath } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const defaultRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const runFile = promisify(execFile);
const digest = bytes => createHash('sha256').update(bytes).digest('hex');
const versions = ['2.3.2', '4.0.4', '4.0.5'];
const runtimeFiles = ['index.js', 'package.json', 'lib/constants.js', 'lib/parse.js',
  'lib/picomatch.js', 'lib/scan.js', 'lib/utils.js'];

export async function verifyPicomatchPatch({ root = defaultRoot } = {}) {
  const result = { passed: false, advisory: 'GHSA-fc5q-39xc-vjpf', instances: [], consumers: [], errors: [] };
  try {
    const manifest = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'));
    const metadata = JSON.parse(await readFile(path.join(root, 'frontend/patches/picomatch-integrity.json'), 'utf8'));
    const lock = await readFile(path.join(root, 'pnpm-lock.yaml'), 'utf8');
    const registration = lock.match(/(?:^|\n)patchedDependencies:\s*\n([\s\S]*?)(?=\n\S|$)/)?.[1];
    if (metadata.advisory !== result.advisory
        || Object.keys(metadata.versions).sort().join() !== versions.join()) {
      throw new Error('Unexpected picomatch patch identity');
    }
    const hashes = new Map();
    for (const version of versions) {
      const spec = metadata.versions[version];
      const patchPath = `frontend/patches/picomatch@${version}.patch`;
      if (manifest.pnpm?.patchedDependencies?.[`picomatch@${version}`] !== patchPath
          || spec.patchPath !== patchPath
          || digest(await readFile(path.join(root, patchPath))) !== spec.patchSha256) {
        throw new Error('Picomatch patch registration or digest mismatch');
      }
      const escapedVersion = version.replaceAll('.', '\\.');
      const entry = registration?.match(new RegExp(`(?:^|\\n)  picomatch@${escapedVersion}:\\n    hash: (\\S+)\\n    path: (\\S+)`));
      if (!entry || entry[2] !== patchPath) throw new Error('Picomatch lockfile patch registration missing');
      hashes.set(version, entry[1]);
      if (Object.keys(spec.runtimeSha256).sort().join() !== [...runtimeFiles].sort().join()) {
        throw new Error('Incomplete picomatch runtime integrity manifest');
      }
    }
    const store = path.join(root, 'node_modules/.pnpm');
    const instances = new Map();
    for (const entry of await readdir(store, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      let packageJson;
      try {
        packageJson = await realpath(path.join(store, entry.name, 'node_modules/picomatch/package.json'));
      } catch (error) {
        if (error.code === 'ENOENT') continue;
        throw error;
      }
      const data = JSON.parse(await readFile(packageJson, 'utf8'));
      const packageRoot = path.dirname(packageJson);
      if (data.name !== 'picomatch' || !hashes.has(data.version)
          || !packageRoot.includes(`/picomatch@${data.version}_patch_hash=${hashes.get(data.version)}/`)) {
        throw new Error('Unpatched or unexpected picomatch instance');
      }
      const fromConsumer = createRequire(path.join(store, entry.name, 'node_modules/__verification__.cjs'));
      if (await realpath(fromConsumer.resolve('picomatch')) !== path.join(packageRoot, 'index.js')) {
        throw new Error('Consumer resolution bypasses verified picomatch');
      }
      instances.set(packageRoot, { packageJson, version: data.version });
      result.consumers.push({ storeEntry: entry.name, loadedEntry: path.join(packageRoot, 'index.js') });
    }
    if ([...new Set([...instances.values()].map(item => item.version))].sort().join() !== versions.join()) {
      throw new Error('Expected picomatch installed versions missing');
    }
    const micromatch = result.consumers.find(item => /^micromatch@4\.0\.8(?:_|$)/.test(item.storeEntry));
    if (!micromatch) throw new Error('Expected micromatch downstream consumer missing');
    const consumerManifest = path.join(store, micromatch.storeEntry, 'node_modules/micromatch/package.json');
    for (const [packageRoot, instance] of instances) {
      for (const file of runtimeFiles) {
        if (digest(await readFile(path.join(packageRoot, file))) !== metadata.versions[instance.version].runtimeSha256[file]) {
          throw new Error(`Installed picomatch runtime digest mismatch: ${file}`);
        }
      }
      const worker = fileURLToPath(new URL('./picomatch-regression-worker.mjs', import.meta.url));
      const { stdout, stderr } = await runFile(process.execPath,
        ['--max-old-space-size=128', worker, instance.packageJson, consumerManifest],
        { timeout: 5000, maxBuffer: 128 * 1024 });
      const regression = JSON.parse(stdout);
      if (stderr.trim() || regression.passed !== true || regression.checks !== 146) {
        throw new Error('Picomatch security/compatibility regressions failed');
      }
      result.instances.push({ ...instance, packageRoot, regression });
    }
    result.passed = true;
  } catch (error) {
    result.errors.push(error.message);
  }
  return result;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const result = await verifyPicomatchPatch();
  console.log(JSON.stringify(result));
  process.exitCode = result.passed ? 0 : 1;
}
