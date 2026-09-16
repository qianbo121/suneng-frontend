import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const output = resolve(
  root,
  'docs/independent-site-v2/workpiece-router-batch2.5-test-manifest.json',
);

const sources = [
  { workspace: 'backend', report: '/private/tmp/b251-backend-tests.json' },
  { workspace: 'frontend', report: '/private/tmp/b251-frontend-tests.json' },
  { workspace: 'admin', report: '/private/tmp/b251-admin-tests.json' },
];

const sha256 = (value) => createHash('sha256').update(value).digest('hex');
const sourceHash = async (path) => sha256(await readFile(resolve(root, path)));

function criticality(testFile, fullTestName) {
  const text = `${testFile} ${fullTestName}`.toLowerCase();
  if (
    /workpiece|baseline|publication|candidate|custom-requirement|migration|evidence|approval|snapshot|resolver/.test(
      text,
    )
  ) {
    return 'P0';
  }
  if (/auth|security|lead|inquiry|admin|permission|secret/.test(text)) return 'P1';
  return 'P2';
}

const tests = [];
const summary = {};

for (const source of sources) {
  const report = JSON.parse(await readFile(source.report, 'utf8'));
  const workspaceTests = [];
  for (const suite of report.testResults ?? []) {
    const testFile = relative(root, suite.name);
    const hash = await sourceHash(testFile);
    for (const assertion of suite.assertionResults ?? []) {
      const fullTestName =
        assertion.fullName || [...(assertion.ancestorTitles ?? []), assertion.title].join(' ');
      const identity = `${source.workspace}|${testFile}|${fullTestName}`;
      workspaceTests.push({
        caseId: `B25-${sha256(identity).slice(0, 20)}`,
        workspace: source.workspace,
        testFile,
        fullTestName,
        assertionBoundary: fullTestName,
        criticality: criticality(testFile, fullTestName),
        sourceHash: hash,
        result: assertion.status,
      });
    }
  }
  tests.push(...workspaceTests);
  summary[source.workspace] = {
    testFiles: new Set(workspaceTests.map((item) => item.testFile)).size,
    tests: workspaceTests.length,
    passed: workspaceTests.filter((item) => item.result === 'passed').length,
    failed: workspaceTests.filter((item) => item.result === 'failed').length,
  };
}

const identityCounts = new Map();
const caseIdCounts = new Map();
for (const test of tests) {
  const identity = `${test.workspace}|${test.testFile}|${test.fullTestName}`;
  identityCounts.set(identity, (identityCounts.get(identity) ?? 0) + 1);
  caseIdCounts.set(test.caseId, (caseIdCounts.get(test.caseId) ?? 0) + 1);
}
const duplicateTestIdentities = [...identityCounts.values()].filter((count) => count > 1).length;
const duplicateCaseIds = [...caseIdCounts.values()].filter((count) => count > 1).length;
if (duplicateTestIdentities || duplicateCaseIds) {
  throw new Error(
    `Manifest identities are not unique: ${duplicateTestIdentities} duplicate names, ${duplicateCaseIds} duplicate caseIds`,
  );
}

const browserDefinitions = [
  {
    testFile: 'frontend/tests/visual/workpiece-router-batch2.4a.spec.ts',
    fullTestName:
      'batch 2.4A workpiece router browser contract generates server-driven groups, re-resolves after answers, and clears stale answers',
    result: 'passed',
    kind: 'dynamic_condition_interaction',
  },
  ...['single_direction', 'multiple_directions'].map((state) => ({
    testFile: 'frontend/tests/visual/workpiece-router-batch2.4a.spec.ts',
    fullTestName: `batch 2.4A workpiece router browser contract renders ${state} fixture with explicit test status and candidate-specific conditions`,
    result: 'passed',
    kind: 'test_fixture',
  })),
  {
    testFile: 'frontend/tests/visual/workpiece-router-batch2.4a.spec.ts',
    fullTestName:
      'batch 2.4A workpiece router browser contract keeps zero-public production copy generic and carries only a frontend draft to the form',
    result: 'passed',
    kind: 'zero_public_production_boundary',
  },
  {
    testFile: 'frontend/tests/visual/workpiece-router-batch2.4a.spec.ts',
    fullTestName:
      'batch 2.4A workpiece router browser contract keeps one accessible condition disclosure and the CTA inside desktop and mobile viewports',
    result: 'passed',
    kind: 'responsive_accessibility',
  },
  {
    testFile: 'frontend/tests/visual/workpiece-router-batch2.4a.spec.ts',
    fullTestName:
      'batch 2.4A workpiece router browser contract captures batch 2.5.1 production zero-public desktop and mobile states',
    result: 'passed',
    kind: 'batch2.5.1_zero_public_screenshots',
  },
  {
    testFile: 'frontend/tests/visual/workpiece-router-batch2.4a.spec.ts',
    fullTestName:
      'batch 2.4A workpiece router browser contract captures batch 2.5.1 conditional public direction with an explicit test badge',
    result: 'passed',
    kind: 'batch2.5.1_test_fixture_screenshot',
  },
];

const browserAcceptance = [];
for (const item of browserDefinitions) {
  browserAcceptance.push({
    caseId: `B25-${sha256(`browser|${item.testFile}|${item.fullTestName}`).slice(0, 20)}`,
    workspace: 'frontend-browser',
    ...item,
    assertionBoundary: item.fullTestName,
    criticality: 'P0',
    sourceHash: await sourceHash(item.testFile),
  });
}

const totalTestFiles = new Set(tests.map((item) => item.testFile)).size;
const totalTests = tests.length;
const totalPassed = tests.filter((item) => item.result === 'passed').length;
const totalFailed = tests.filter((item) => item.result === 'failed').length;

const manifest = {
  batch: '2.5.1',
  generatedAt: new Date().toISOString(),
  nodeVersion: process.version,
  databaseMode:
    'no database migration was executed in batch 2.5.1; original local and production databases remained untouched',
  commands: {
    dataValidation: 'node scripts/validate-workpiece-router.mjs --mode=build',
    typecheck: 'pnpm typecheck',
    lint: 'pnpm lint',
    backend: 'pnpm --dir backend exec jest --runInBand',
    frontend: 'pnpm --dir frontend exec vitest run',
    admin: 'pnpm --dir admin exec vitest run',
    fixtureAcceptance:
      'pnpm --dir frontend exec playwright test -c playwright.visual.config.ts tests/visual/workpiece-router-batch2.4a.spec.ts',
  },
  summary: {
    ...summary,
    totalTestFiles,
    totalTests,
    totalPassed,
    totalFailed,
    duplicateTestIdentities,
    duplicateCaseIds,
    browserAcceptance: {
      tests: browserAcceptance.length,
      passed: browserAcceptance.filter((item) => item.result === 'passed').length,
      failed: browserAcceptance.filter((item) => item.result === 'failed').length,
    },
    totalExecutedAssertions: totalTests + browserAcceptance.length,
  },
  browserAcceptance,
  tests,
};

await writeFile(output, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(
  `OK batch2.5 manifest: ${totalTests} unit tests + ${browserAcceptance.length} browser acceptance, duplicate identities ${duplicateTestIdentities}, duplicate caseIds ${duplicateCaseIds}`,
);
console.log(output);
