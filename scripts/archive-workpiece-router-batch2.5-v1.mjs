import { createHash } from 'node:crypto';
import { copyFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const sha256 = (path) =>
  createHash('sha256')
    .update(readFileSync(resolve(root, path)))
    .digest('hex');

const files = [
  {
    source: 'data/workpiece-router/industry-public-baseline-candidate-batch2.5.json',
    target:
      'data/workpiece-router/industry-public-baseline-candidate-batch2.5-candidate-v1.json',
    expected: '501f1737e7dce0c954bfa511567e3f33f781c5ed3788bb90fa0ad24c8695714f',
  },
  {
    source: 'docs/independent-site-v2/workpiece-router-batch2.5-public-baseline-candidate.md',
    target:
      'docs/independent-site-v2/workpiece-router-batch2.5-candidate-v1-public-baseline-candidate.md',
    expected: 'ec89a964df62c69188b36eb3226ce8b108eba06fb49d2772411e7eb214e34595',
  },
  {
    source: 'docs/independent-site-v2/workpiece-router-batch2.5-public-rule-matrix.xlsx',
    target: 'docs/independent-site-v2/workpiece-router-batch2.5-candidate-v1-public-rule-matrix.xlsx',
    expected: 'ab19e367ce08648b29e51ff00fefe47928da439dd14ccb905abc1055f4d9c6da',
  },
  {
    source: 'docs/independent-site-v2/workpiece-router-batch2.5-snapshot-hashes.json',
    target: 'docs/independent-site-v2/workpiece-router-batch2.5-candidate-v1-snapshot-hashes.json',
    expected: '6b149b84f254135653a9e723c8d39932722bb3b4f99f7a31232bb388a0aac29b',
  },
  {
    source: 'docs/independent-site-v2/workpiece-router-batch2.5-regression-report.md',
    target: 'docs/independent-site-v2/workpiece-router-batch2.5-candidate-v1-regression-report.md',
    expected: 'f93e482eccbcf817cb5d2307a8959525e125245f64acde6d3bd400c070f76d0a',
  },
  {
    source: 'docs/independent-site-v2/workpiece-router-batch2.5-test-manifest.json',
    target: 'docs/independent-site-v2/workpiece-router-batch2.5-candidate-v1-test-manifest.json',
    expected: 'b7c73fe0063492a7b97f6a83d849725e73981d8a5ea21aa2e7af3b2b8c0e759b',
  },
  {
    source:
      'docs/independent-site-v2/screenshots/workpiece-router-batch2.5-production-zero-public-1440.png',
    target:
      'docs/independent-site-v2/screenshots/workpiece-router-batch2.5-candidate-v1-production-zero-public-1440.png',
    expected: 'c16d00c027adf6e40790c6fdc3895c07cbefec0e151d609959e6a932a56fbdd4',
  },
];

for (const file of files) {
  const actual = sha256(file.source);
  if (actual !== file.expected) {
    throw new Error(`Refuse to archive changed v1 source: ${file.source} (${actual})`);
  }
  if (existsSync(resolve(root, file.target))) {
    if (sha256(file.target) !== file.expected) {
      throw new Error(`Refuse to overwrite mismatched v1 archive: ${file.target}`);
    }
    continue;
  }
  copyFileSync(resolve(root, file.source), resolve(root, file.target));
}

const lineage = {
  schemaVersion: '1.0.0',
  currentCandidateVersion: 'industry-public-baseline-2026-08-batch2.5-candidate-v2',
  versions: [
    {
      baselineVersion: 'industry-public-baseline-2026-08-batch2.5-candidate-v1',
      status: 'returned_for_revision',
      immutableArtifacts: files.map((file) => ({ path: file.target, sha256: `sha256:${file.expected}` })),
      approvalRecord: null,
    },
    {
      baselineVersion: 'industry-public-baseline-2026-08-batch2.5-candidate-v2',
      status: 'pre_approval_closure_in_progress',
      immutableArtifacts: [],
      approvalRecord: null,
    },
  ],
};
writeFileSync(
  resolve(root, 'data/workpiece-router/industry-public-baseline-candidate-batch2.5-lineage.json'),
  `${JSON.stringify(lineage, null, 2)}\n`,
);

console.log(`OK archived ${files.length} candidate-v1 artifacts without changing their bytes.`);
