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
test('other moderate findings retain the original high audit threshold', () => {
  const data = report(); data.advisories[2] = { severity: 'moderate' };
  data.metadata.vulnerabilities.moderate = 1;
  assert.equal(assessAudit(data, options).passed, true);
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
