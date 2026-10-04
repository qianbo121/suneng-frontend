import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const runFile = promisify(execFile);
const worker = fileURLToPath(new URL('./braces-regression-worker.mjs', import.meta.url));

export async function runBracesRegressions({ packageJson, micromatchPackageJson, casesPath = new URL('./braces-regression-cases.json', import.meta.url) }) {
  const fixtures = JSON.parse(await readFile(casesPath, 'utf8'));
  const results = [];
  let cursor = 0;
  async function runNext() {
    while (cursor < fixtures.cases.length) {
      const spec = fixtures.cases[cursor++];
      let actual;
      try {
        const { stdout, stderr } = await runFile(process.execPath, ['--max-old-space-size=128', worker, packageJson, JSON.stringify(spec), micromatchPackageJson || ''], { timeout: 1500, maxBuffer: 128 * 1024 });
        if (stderr.trim()) throw new Error('Unexpected regression worker stderr');
        actual = JSON.parse(stdout);
      } catch (error) {
        actual = { outcome: 'process-error', errorCode: error.code || 'INVALID_WORKER_RESULT' };
      }
      const passed = spec.kind === 'security'
        ? actual.outcome === 'threw' && actual.errorName === spec.expected.errorName && actual.errorMessage.includes(spec.expected.messageContains)
        : JSON.stringify(actual) === JSON.stringify(spec.expected);
      results.push({ name: spec.name, kind: spec.kind, passed, actual });
    }
  }
  await Promise.all(Array.from({ length: 4 }, runNext));
  results.sort((a, b) => a.name.localeCompare(b.name));
  return { passed: results.every(result => result.passed), total: results.length, security: results.filter(result => result.kind === 'security').length, compatibility: results.filter(result => result.kind === 'compatibility').length, results };
}
