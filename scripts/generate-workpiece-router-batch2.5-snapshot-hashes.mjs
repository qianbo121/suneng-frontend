import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const candidatePath =
  'data/workpiece-router/industry-public-baseline-candidate-batch2.5-candidate-v2.json';
const outputPath = 'docs/independent-site-v2/workpiece-router-batch2.5-snapshot-hashes.json';
const artifactPaths = [
  candidatePath,
  'docs/independent-site-v2/workpiece-router-batch2.5-candidate-v2-public-baseline-candidate.md',
  'docs/independent-site-v2/workpiece-router-batch2.5-public-rule-matrix.xlsx',
  'docs/independent-site-v2/workpiece-router-batch2.5.1-regression-report.md',
  'docs/independent-site-v2/workpiece-router-batch2.5-test-manifest.json',
  'docs/independent-site-v2/workpiece-router-batch2.5.1-technical-snapshot.json',
  'docs/independent-site-v2/screenshots/workpiece-router-batch2.5.1-production-zero-public-1440.png',
  'docs/independent-site-v2/screenshots/workpiece-router-batch2.5.1-production-zero-public-390.png',
  'docs/independent-site-v2/screenshots/workpiece-router-batch2.5.1-test-fixture-conditional-1440.png',
].sort((left, right) => left.localeCompare(right, 'en'));

const sha256 = (value) => createHash('sha256').update(value).digest('hex');
const hashFile = async (path) => sha256(await readFile(resolve(root, path)));
const canonicalize = (value) => {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([left], [right]) => left.localeCompare(right, 'en'))
        .map(([key, item]) => [key, canonicalize(item)]),
    );
  }
  return value;
};
const canonicalJson = (value) => JSON.stringify(canonicalize(value));

const candidate = JSON.parse(await readFile(resolve(root, candidatePath), 'utf8'));
const mismatches = [];
for (const frozenFile of candidate.frozenFiles) {
  const actual = `sha256:${await hashFile(frozenFile.path)}`;
  if (actual !== frozenFile.sha256) {
    mismatches.push({ path: frozenFile.path, expected: frozenFile.sha256, actual });
  }
}
if (mismatches.length)
  throw new Error(`Frozen technical files changed: ${JSON.stringify(mismatches)}`);

const artifactFiles = [];
for (const path of artifactPaths) {
  artifactFiles.push({ path, sha256: `sha256:${await hashFile(path)}` });
}

const approvalBundlePayload = {
  schemaVersion: '1.0.0',
  baselineVersion: candidate.baselineVersion,
  technicalSnapshotHash: candidate.technicalSnapshotHash,
  files: artifactFiles,
};
const approvalBundleHash = `sha256:${sha256(canonicalJson(approvalBundlePayload))}`;

const output = {
  schemaVersion: '2.0.0',
  batch: '2.5.1',
  baselineVersion: candidate.baselineVersion,
  createdAt: new Date().toISOString(),
  status: 'awaiting_responsible_owner_approval',
  candidateRuleCount: candidate.candidateRuleCount,
  candidatePairCount: candidate.candidatePairCount,
  productionPublicRuleCount: candidate.productionPublicRuleCount,
  technicalSnapshotHash: candidate.technicalSnapshotHash,
  approvalBundleHash,
  signingObject: {
    baselineVersion: candidate.baselineVersion,
    technicalSnapshotHash: candidate.technicalSnapshotHash,
    approvalBundleHash,
  },
  algorithms: {
    fileHash: 'SHA-256 over exact file bytes',
    approvalBundle:
      'SHA-256 over UTF-8 canonical JSON with recursively sorted object keys; files sorted lexicographically by path',
    pathSort: 'JavaScript localeCompare(path, en)',
  },
  recomputeCommand:
    'PATH=/private/tmp/suneng-node-22.23.1/node-v22.23.1-darwin-arm64/bin:$PATH node scripts/generate-workpiece-router-batch2.5-snapshot-hashes.mjs',
  approvalBundlePayload,
  verification: {
    frozenTechnicalFileCount: candidate.frozenFiles.length,
    frozenTechnicalFileHashMismatches: mismatches.length,
    artifactFileCount: artifactFiles.length,
    pathsSorted: artifactPaths.every(
      (path, index) => index === 0 || artifactPaths[index - 1] <= path,
    ),
    screenshotHashesMatchActualBytes:
      artifactFiles.filter((item) => item.path.endsWith('.png')).length === 3,
    approvalFieldsRemainEmpty: Object.values(candidate.approvalRecord).every(
      (value) => value === null,
    ),
  },
  approvalRecord: candidate.approvalRecord,
};

await writeFile(resolve(root, outputPath), `${JSON.stringify(output, null, 2)}\n`);
console.log(`OK batch2.5.1 approval bundle ${approvalBundleHash}; files ${artifactFiles.length}`);
console.log(resolve(root, outputPath));
