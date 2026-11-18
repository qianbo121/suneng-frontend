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

export const PICOMATCH_FIX = Object.freeze({
  advisory: 'GHSA-fc5q-39xc-vjpf',
  url: 'https://github.com/advisories/GHSA-fc5q-39xc-vjpf',
  package: 'picomatch',
  versions: ['2.3.2', '4.0.4', '4.0.5'],
  expiresAt: '2026-12-17T16:00:00.000Z',
});

const isObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const severityLevels = ['info', 'low', 'moderate', 'high', 'critical'];

export function assessAudit(report, { auditExitCode, patchVerified, picomatchVerified = false, now = new Date() }) {
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
  // The pinned pnpm 9 report counts affected installed versions, including
  // multiple findings for the same advisory. Dependency paths are not counts.
  if (entries.some((entry) => !Array.isArray(entry.findings) || entry.findings.length === 0
      || entry.findings.some((finding) => !isObject(finding)
        || typeof finding.version !== 'string' || !finding.version.trim()
        || !Array.isArray(finding.paths) || finding.paths.length === 0
        || finding.paths.some((path) => typeof path !== 'string' || !path.trim()))
      || new Set(entry.findings.map((finding) => finding.version)).size !== entry.findings.length)) {
    throw new Error('Invalid dependency audit findings');
  }
  const observedCounts = Object.fromEntries(severityLevels.map((level) => [level, 0]));
  for (const entry of entries) observedCounts[entry.severity] += entry.findings.length;
  if (severityLevels.some((level) => observedCounts[level] !== counts[level])) {
    throw new Error('Audit advisories and severity totals disagree');
  }
  const blocking = entries.filter((entry) => ['high', 'critical'].includes(entry.severity));
  if (blocking.length === 0) {
    // pnpm 9 JSON reports exit 1 before applying --audit-level; accept only
    // complete, consistent reports that actually contain low/moderate findings.
    const onlyLowerSeverityFindings = counts.info === 0 && counts.low + counts.moderate > 0;
    if (auditExitCode === 1 && !onlyLowerSeverityFindings) {
      throw new Error('Audit failed without supported low/moderate findings');
    }
    return { passed: true, auditReportedHighOrCritical: false, locallyFixedFindings: [] };
  }
  if (auditExitCode !== 1) throw new Error('Audit unexpectedly accepted a blocking finding');
  if (counts.critical !== 0) throw new Error('Additional high/critical dependency findings remain');
  const locallyFixedFindings = [];
  for (const entry of blocking) {
    const fix = [LOCAL_FIX, PICOMATCH_FIX].find(candidate =>
      entry.module_name === candidate.package && entry.url === candidate.url
      && (!entry.github_advisory_id || entry.github_advisory_id === candidate.advisory));
    if (!fix) throw new Error('Additional high/critical dependency findings remain');
    if (!Number.isFinite(now.getTime()) || now >= new Date(fix.expiresAt)) {
      throw new Error('Local advisory handling expired; reassess the maintained patch');
    }
    if (fix === PICOMATCH_FIX && !picomatchVerified) {
      throw new Error('Installed picomatch patch verification failed');
    }
    const allowedVersions = fix.versions || [fix.version];
    for (const finding of entry.findings) {
      if (!allowedVersions.includes(finding.version)
          || finding.paths.some(path => !path.endsWith(`${fix.package}@${finding.version}`))) {
        throw new Error('Unverified package version/path in the local advisory');
      }
      locallyFixedFindings.push({ advisory: fix.advisory, package: fix.package,
        version: finding.version, officialPatchedRelease: false,
        installedPatchAndRegressionsVerified: true, expiresAt: fix.expiresAt });
    }
  }
  return { passed: true, auditReportedHighOrCritical: true, locallyFixedFindings };
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
  const { verifyPicomatchPatch } = await import(pathToFileURL(resolve(root,
    'frontend/scripts/picomatch-check.mjs')).href);
  const picomatch = await verifyPicomatchPatch({ root });
  if (picomatch.passed !== true || picomatch.instances.length !== PICOMATCH_FIX.versions.length) {
    throw new Error('Installed picomatch patch verification did not pass: '
      + picomatch.errors.join('; '));
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
  const result = assessAudit(report, { auditExitCode: audit.status, patchVerified: true, picomatchVerified: true });
  const receipt = { checkedAt: new Date().toISOString(), ...result,
    rawAuditReport: rawReport, patchVerification: patch, picomatchPatchVerification: picomatch };
  writeFileSync(`${rawReport}.verification.json`, JSON.stringify(receipt, null, 2) + '\n');
  console.log(JSON.stringify({ passed: true, rawAuditReport: rawReport,
    auditReportedHighOrCritical: result.auditReportedHighOrCritical,
    locallyFixedFindings: result.locallyFixedFindings, patchedInstances: patch.instances.length, picomatchPatchedInstances: picomatch.instances.length }));
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => { console.error(error.message); process.exitCode = 1; });
}
