import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const [packageJson, consumerManifest, securityOnly] = process.argv.slice(2);
const require = createRequire(packageJson);
const picomatch = require(packageJson.replace(/package\.json$/, 'index.js'));
const dangerousPatterns = [
  '+(*)z', '+(*a)', '*(*a)', '+(a*)z', '*(a*)z', '+(*?a)',
  '+(*[ab])z', '+(@(*a))z', '+(a/*a)z', 'prefix/+(*a)',
];
let checks = 0;
for (const pattern of dangerousPatterns) {
  for (const options of [{}, { fastpaths: false }, { capture: true }, { dot: true, windows: true }]) {
    const regex = picomatch.makeRe(pattern, options);
    assert.equal(regex.test('a'.repeat(4096) + '!'), false, pattern);
    assert.equal(regex.test('prefix/' + 'a'.repeat(4096) + '!'), false, pattern);
    assert.equal(regex.test(pattern), true, `risk fallback must match its literal: ${pattern}`);
    checks += 3;
  }
}
if (securityOnly !== 'security-only') {
  const examples = [
    ['src/page.ts', '**/*.ts', true], ['src/page.js', '**/*.ts', false],
    ['src/page.tsx', '**/*.{ts,tsx}', true], ['.env', '*', false],
    ['page.js', '*.@(js|ts)', true], ['page.css', '*.@(js|ts)', false],
    ['ab', '+(a|b)', true], ['c', '+(a|b)', false],
    ['aaaa', '+(a)', true], ['b', '+(a)', false],
    ['aaa', '+(?)', false], // Preserve the existing leading-question-mark parsing.
    ['***', '+([*])', true], ['aaa', '+([*])', false],
    ['***', '+(\\*)', true], ['aaa', '+(\\*)', false],
    ['***', '+("*")', true], ['aaa', '+("*")', false],
    ['aaaa', '+(*(a))', true], ['b', '+(*(a))', false],
    ['foo/bar.js', '**/*.js', true], ['foo/bar.ts', '**/!(*.d).ts', true],
    ['foo/bar.d.ts', '**/!(*.d).ts', false],
  ];
  for (const [input, pattern, expected] of examples) {
    assert.equal(picomatch.isMatch(input, pattern), expected, `${input} / ${pattern}`);
    checks++;
  }
  assert.equal(picomatch.isMatch('.env', '*', { dot: true }), true);
  assert.equal(picomatch.isMatch('A.TS', '*.ts', { nocase: true }), true);
  checks += 2;
  if (consumerManifest) {
    const fromConsumer = createRequire(consumerManifest);
    const micromatch = fromConsumer(consumerManifest.replace(/package\.json$/, 'index.js'));
    assert.deepEqual(micromatch(['a.ts', 'b.tsx', 'c.css'], '*.{ts,tsx}'), ['a.ts', 'b.tsx']);
    assert.deepEqual(micromatch(['aa!', '+(*a)'], '+(*a)'), ['+(*a)']);
    checks += 2;
  }
}
console.log(JSON.stringify({ passed: true, checks }));
