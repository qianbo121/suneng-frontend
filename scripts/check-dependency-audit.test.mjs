import assert from 'node:assert/strict';
import { test } from 'node:test';
import { assessAudit, LOCAL_FIX } from './check-dependency-audit.mjs';

const now = new Date('2026-10-04T08:00:00.000Z');
const options = { now, auditExitCode: 1, patchVerified: true };
function report() {
  return { advisories: { 1: { module_name: 'braces', severity: 'high', url: LOCAL_FIX.url,
    findings: [{ version: '3.0.3', paths: ['frontend>micromatch@4.0.8>braces@3.0.3'] }] } },
    metadata: { vulnerabilities: { info: 0, low: 0, moderate: 0, high: 1, critical: 0 } } };
}

test('handles only the exact fixed advisory after installed patch verification', () => {
  const result = assessAudit(report(), options);
  assert.equal(result.auditReportedHighOrCritical, true);
  assert.equal(result.locallyFixedFindings[0].officialPatchedRelease, false);
  assert.equal(result.locallyFixedFindings[0].advisory, LOCAL_FIX.advisory);
});
test('accepts a clean completed audit while still requiring installed patch verification', () => {
  const data = report(); data.advisories = {}; data.metadata.vulnerabilities.high = 0;
  assert.equal(assessAudit(data, { ...options, auditExitCode: 0 }).passed, true);
  assert.throws(() => assessAudit(data, { ...options, auditExitCode: 0, patchVerified: false }));
});
function nonblockingReport(severities) {
  const data = report();
  data.advisories = {};
  data.metadata.vulnerabilities.high = 0;
  for (const [index, severity] of severities.entries()) {
    data.advisories[index] = { module_name: 'fixture', severity,
      findings: [{ version: '1.0.0', paths: ['fixture@1.0.0'] }] };
    data.metadata.vulnerabilities[severity] += 1;
  }
  return data;
}

test('accepts pnpm 9 JSON exit 1 only with verified low/moderate findings', () => {
  for (const severities of [['low'], ['moderate'], ['low', 'moderate']]) {
    const result = assessAudit(nonblockingReport(severities), options);
    assert.equal(result.passed, true);
    assert.equal(result.auditReportedHighOrCritical, false);
    assert.deepEqual(result.locallyFixedFindings, []);
  }
});
test('still accepts a successful audit with nonblocking findings', () => {
  assert.equal(assessAudit(nonblockingReport(['moderate']), { ...options, auditExitCode: 0 }).passed, true);
});
test('rejects failed audits without only low/moderate findings', () => {
  for (const severities of [[], ['info'], ['info', 'low']]) {
    assert.throws(() => assessAudit(nonblockingReport(severities), options));
  }
});
test('requires exact affected-version and metadata counts for every severity', () => {
  for (const level of ['info', 'low', 'moderate', 'high', 'critical']) {
    const hiddenCount = nonblockingReport(['moderate']);
    hiddenCount.metadata.vulnerabilities[level] += 1;
    assert.throws(() => assessAudit(hiddenCount, options));
    const hiddenAdvisory = nonblockingReport(['moderate']);
    hiddenAdvisory.advisories[1] = { severity: level };
    assert.throws(() => assessAudit(hiddenAdvisory, options));
  }
});
test('nonblocking reports still reject process errors, malformed reports and unverified patches', () => {
  const data = nonblockingReport(['moderate']);
  for (const auditExitCode of [2, null, undefined]) {
    assert.throws(() => assessAudit(data, { ...options, auditExitCode }));
  }
  assert.throws(() => assessAudit(data, { ...options, patchVerified: false }));
  assert.throws(() => assessAudit({ ...data, error: { code: 'registry-failure' } }, options));
  assert.throws(() => assessAudit({ ...data, advisories: null }, options));
  assert.throws(() => assessAudit({ ...data, advisories: { 0: { severity: 'unknown' } } }, options));
});
test('other moderate findings retain the original high audit threshold', () => {
  const data = report(); data.advisories[2] = { severity: 'moderate',
    findings: [{ version: '1.0.0', paths: ['fixture@1.0.0'] }] };
  data.metadata.vulnerabilities.moderate = 1;
  assert.equal(assessAudit(data, options).passed, true);
});
test('counts each affected version once and does not count dependency paths', () => {
  const data = nonblockingReport(['moderate']);
  data.advisories[0].findings.push({ version: '2.0.0', paths: ['a>fixture@2.0.0', 'b>fixture@2.0.0'] });
  data.metadata.vulnerabilities.moderate = 2;
  assert.equal(assessAudit(data, options).passed, true);
  for (const wrongCount of [1, 3]) {
    data.metadata.vulnerabilities.moderate = wrongCount;
    assert.throws(() => assessAudit(data, options), /totals disagree/);
  }
});
test('rejects missing, malformed and duplicate version findings even at lower severity', () => {
  for (const findings of [undefined, [], [{}], [{ version: '1', paths: [] }],
    [{ version: '1', paths: [''] }], [{ version: '', paths: ['fixture@1'] }],
    [{ version: '1', paths: ['fixture@1'] }, { version: '1', paths: ['other>fixture@1'] }]]) {
    const data = nonblockingReport(['moderate']);
    data.advisories[0].findings = findings;
    assert.throws(() => assessAudit(data, options), /Invalid dependency audit findings/);
  }
});
test('multiple affected versions cannot hide an additional high finding', () => {
  const data = nonblockingReport(['high']);
  data.advisories[0].findings.push({ version: '2.0.0', paths: ['fixture@2.0.0'] });
  data.metadata.vulnerabilities.high = 2;
  assert.throws(() => assessAudit(data, options), /Additional high\/critical/);
});
for (const [label, modify] of [
  ['different advisory', (d) => { d.advisories[1].url = 'https://github.com/advisories/GHSA-other'; }],
  ['conflicting advisory identity', (d) => { d.advisories[1].github_advisory_id = 'GHSA-other'; }],
  ['different package', (d) => { d.advisories[1].module_name = 'other'; }],
  ['different affected version', (d) => { d.advisories[1].findings[0].version = '3.0.2'; }],
  ['mixed unpatched version', (d) => { d.advisories[1].findings.push({ version: '3.0.2', paths: ['braces@3.0.2'] }); }],
  ['different dependency path', (d) => { d.advisories[1].findings[0].paths.push('frontend>other@3.0.3'); }],
  ['missing paths', (d) => { d.advisories[1].findings[0].paths = []; }],
  ['missing findings', (d) => { d.advisories[1].findings = []; }],
  ['another high advisory', (d) => { d.advisories[2] = { severity: 'high' }; d.metadata.vulnerabilities.high = 2; }],
  ['critical finding', (d) => { d.advisories[1].severity = 'critical'; d.metadata.vulnerabilities.high = 0; d.metadata.vulnerabilities.critical = 1; }],
  ['hidden blocking metadata', (d) => { d.advisories = {}; }],
  ['hidden blocking advisory', (d) => { d.metadata.vulnerabilities.high = 0; }],
  ['invalid metadata', (d) => { d.metadata.vulnerabilities.high = '1'; }],
  ['unsupported report format', (d) => { delete d.advisories; }],
  ['network/registry error', (d) => { d.error = { code: 'registry-failure' }; }],
  ['unknown severity', (d) => { d.advisories[1].severity = 'unknown'; }],
]) {
  test(`rejects ${label}`, () => { const data = report(); modify(data); assert.throws(() => assessAudit(data, options)); });
}
test('rejects an unverified or expired local patch', () => {
  assert.throws(() => assessAudit(report(), { ...options, patchVerified: false }));
  assert.throws(() => assessAudit(report(), { ...options, now: new Date(LOCAL_FIX.expiresAt) }));
  assert.throws(() => assessAudit(report(), { ...options, now: new Date('invalid') }));
});
test('rejects unexpected audit process outcomes', () => {
  for (const auditExitCode of [0, 2, null]) assert.throws(() => assessAudit(report(), { ...options, auditExitCode }));
});
