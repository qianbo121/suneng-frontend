#!/usr/bin/env node
// Keep the original audit report. A finding can be handled locally only after
// the installed patch and its regressions have been verified in this process.
import { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const LOCAL_FIX = Object.freeze({
  advisory: 'GHSA-vfj7-8cjw-p6xm',
  url: 'https://github.com/advisories/GHSA-vfj7-8cjw-p6xm',
  package: 'braces',
  version: '3.0.3',
  // Reassess the maintained fix instead of creating a permanent audit waiver.
  expiresAt: '2026-11-03T16:00:00.000Z',
});

const isObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const severityLevels = ['info', 'low', 'moderate', 'high', 'critical'];

export function assessAudit(report, { auditExitCode, patchVerified, now = new Date() }) {
  if (!patchVerified) throw new Error('Installed patch identity/regression verification failed');
  if (![0, 1].includes(auditExitCode)) throw new Error('Dependency audit did not complete');
  if (!isObject(report) || report.error || !isObject(report.advisories)
      || !isObject(report.metadata?.vulnerabilities)) {
    throw new Error('Missing or unsupported dependency audit report');
  }
  const counts = report.metadata.vulnerabilities;
  if (severityLevels.some((level) => !Number.isInteger(counts[level]) || counts[level] < 0)) {
    throw new Error('Invalid dependency audit severity counts');
  }
  const entries = Object.values(report.advisories);
  if (entries.some((entry) => !isObject(entry) || !severityLevels.includes(entry.severity))) {
    throw new Error('Invalid dependency audit advisory');
  }
  const blocking = entries.filter((entry) => ['high', 'critical'].includes(entry.severity));
  if ((blocking.length === 0) !== (counts.high + counts.critical === 0)) {
    throw new Error('Audit advisories and severity totals disagree');
  }
  if (blocking.length === 0) {
    if (auditExitCode !== 0) throw new Error('Audit failed without a supported blocking finding');
    return { passed: true, auditReportedHighOrCritical: false, locallyFixedFindings: [] };
  }
  if (auditExitCode !== 1) throw new Error('Audit unexpectedly accepted a blocking finding');
  if (!Number.isFinite(now.getTime()) || now >= new Date(LOCAL_FIX.expiresAt)) {
    throw new Error('Local advisory handling expired; reassess the maintained patch');
  }
  if (blocking.length !== 1 || counts.critical !== 0 || counts.high !== 1) {
    throw new Error('Additional high/critical dependency findings remain');
  }
  const entry = blocking[0];
  if (entry.module_name !== LOCAL_FIX.package || entry.severity !== 'high'
      || entry.url !== LOCAL_FIX.url
      || (entry.github_advisory_id && entry.github_advisory_id !== LOCAL_FIX.advisory)
      || !Array.isArray(entry.findings) || entry.findings.length === 0) {
    throw new Error('Blocking advisory is outside the verified local fix');
  }
  for (const finding of entry.findings) {
    if (!isObject(finding) || finding.version !== LOCAL_FIX.version
        || !Array.isArray(finding.paths) || finding.paths.length === 0
        || finding.paths.some((path) => typeof path !== 'string'
          || !path.endsWith(`braces@${LOCAL_FIX.version}`))) {
      throw new Error('Unverified package version/path in the local advisory');
    }
  }
  return {
    passed: true,
    auditReportedHighOrCritical: true,
    locallyFixedFindings: [{ advisory: LOCAL_FIX.advisory, package: LOCAL_FIX.package,
      version: LOCAL_FIX.version, officialPatchedRelease: false,
      installedPatchAndRegressionsVerified: true, expiresAt: LOCAL_FIX.expiresAt }],
  };
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length !== 2 || args[0] !== '--report') {
    throw new Error('Usage: node scripts/check-dependency-audit.mjs --report <raw-audit.json>');
  }
  const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
  const rawReport = resolve(args[1]);
  const { verifyBracesPatch } = await import(pathToFileURL(resolve(root,
    'frontend/scripts/braces-check.mjs')).href);
  const patch = await verifyBracesPatch({ root });
  if (patch?.passed !== true || !Array.isArray(patch.instances) || patch.instances.length === 0) {
    throw new Error('Installed braces patch verification did not pass: '
      + (patch?.errors?.join('; ') || 'missing verification result'));
  }
  const audit = spawnSync('pnpm', ['audit', '--json', '--audit-level', 'high'], {
    cwd: root, encoding: 'utf8', timeout: 90_000, maxBuffer: 16 * 1024 * 1024,
  });
  mkdirSync(dirname(rawReport), { recursive: true });
  writeFileSync(rawReport, audit.stdout ?? '');
  // A timeout, network failure or malformed report never becomes a pass.
  if (audit.error || audit.signal || audit.status === null) {
    throw new Error('Dependency audit process failed; raw report retained');
  }
  let report;
  try { report = JSON.parse(audit.stdout); }
  catch { throw new Error('Dependency audit JSON is invalid; raw report retained'); }
  const result = assessAudit(report, { auditExitCode: audit.status, patchVerified: true });
  const receipt = { checkedAt: new Date().toISOString(), ...result,
    rawAuditReport: rawReport, patchVerification: patch };
  writeFileSync(`${rawReport}.verification.json`, JSON.stringify(receipt, null, 2) + '\n');
  console.log(JSON.stringify({ passed: true, rawAuditReport: rawReport,
    auditReportedHighOrCritical: result.auditReportedHighOrCritical,
    locallyFixedFindings: result.locallyFixedFindings, patchedInstances: patch.instances.length }));
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => { console.error(error.message); process.exitCode = 1; });
}
