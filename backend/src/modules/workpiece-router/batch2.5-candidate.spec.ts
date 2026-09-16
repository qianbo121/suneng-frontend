import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

type JsonObject = Record<string, unknown>;

const root = resolve(process.cwd(), '..');
const readJson = <T>(path: string) => JSON.parse(readFileSync(resolve(root, path), 'utf8')) as T;
const canonicalize = (value: unknown): unknown => {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.keys(value as JsonObject)
        .sort()
        .map((key) => [key, canonicalize((value as JsonObject)[key])]),
    );
  }
  return value;
};
const hashValue = (value: unknown) =>
  `sha256:${createHash('sha256')
    .update(JSON.stringify(canonicalize(value)))
    .digest('hex')}`;
const hashFile = (path: string) =>
  `sha256:${createHash('sha256')
    .update(readFileSync(resolve(root, path)))
    .digest('hex')}`;

const candidate = readJson<{
  baselineVersion: string;
  status: string;
  productionPublicRuleCount: number;
  candidateRuleIds: string[];
  pairScope: string[];
  evidenceSnapshotHash: string;
  publicCopySnapshotHash: string;
  codeAndDataSnapshotHash: string;
  approvalScopeHash: string;
  snapshotHash: string;
  approvalScope: JsonObject;
  approvalRecord: Record<string, string | null>;
  candidateRules: Array<{
    ruleId: string;
    sourcePublicationEligibility: string;
    proposedPublicationEligibility: string;
    internalExecutionStatus: string;
    unverifiedCriticalAssumptions: unknown[];
    selectedPairs: Array<{ pairKey: string; evidenceRefs: string[] }>;
    publicCopy: Record<string, string>;
  }>;
  evidenceSnapshot: Array<{
    evidenceId: string;
    evidenceType: string;
    status: string;
    accessLevel: string;
    verificationStatus: string;
    officialUrl: string;
  }>;
  publicCopySnapshot: unknown[];
  frozenFiles: Array<{ path: string; sha256: string }>;
  allRuleSelectionStatus: Array<{ ruleId: string }>;
}>('data/workpiece-router/industry-public-baseline-candidate-batch2.5-candidate-v1.json');

describe('batch 2.5 frozen public baseline candidate', () => {
  it('B25-CANDIDATE-001 keeps production at zero and leaves the approval record empty', () => {
    const production = readJson<{ publicBaselineVersion: string | null; rules: unknown[] }>(
      'data/workpiece-router/industry-public-direction-snapshot.json',
    );
    const baselines = readJson<{ publicBaselineVersion: string | null }>(
      'data/workpiece-router/industry-baseline-versions.json',
    );

    expect(candidate.status).toBe('awaiting_responsible_owner_approval');
    expect(candidate.productionPublicRuleCount).toBe(0);
    expect(candidate.candidateRuleIds).toHaveLength(6);
    expect(candidate.pairScope).toHaveLength(23);
    expect(new Set(candidate.pairScope).size).toBe(23);
    expect(Object.values(candidate.approvalRecord)).toEqual([null, null, null, null, null, null]);
    expect(production).toMatchObject({ publicBaselineVersion: null, rules: [] });
    expect(baselines.publicBaselineVersion).toBeNull();
  });

  it('B25-CANDIDATE-002 freezes only eligible source rules without changing them to public', () => {
    const rules = readJson<{
      rules: Array<{
        ruleId: string;
        internalExecutionStatus: string;
        publicationEligibility: string;
      }>;
    }>('data/workpiece-router/industry-direction-rules.json').rules;

    for (const row of candidate.candidateRules) {
      const source = rules.find((rule) => rule.ruleId === row.ruleId);
      expect(source).toMatchObject({
        internalExecutionStatus: 'eligible',
        publicationEligibility: 'internal_only',
      });
      expect(row).toMatchObject({
        sourcePublicationEligibility: 'internal_only',
        proposedPublicationEligibility: 'conditional_public',
        internalExecutionStatus: 'eligible',
        unverifiedCriticalAssumptions: [],
      });
    }
  });

  it('B25-CANDIDATE-003 requires one verified taxonomy and application mapping for every selected pair', () => {
    const evidence = new Map(candidate.evidenceSnapshot.map((item) => [item.evidenceId, item]));
    for (const rule of candidate.candidateRules) {
      for (const pair of rule.selectedPairs) {
        const records = pair.evidenceRefs.map((id) => evidence.get(id));
        expect(
          records.some(
            (record) =>
              record?.evidenceType === 'taxonomy_reference' &&
              record.status === 'current' &&
              record.accessLevel !== 'metadata_only' &&
              ['full_text_verified', 'clause_verified'].includes(record.verificationStatus),
          ),
        ).toBe(true);
        expect(
          records.some(
            (record) =>
              record?.evidenceType === 'application_mapping' &&
              record.status === 'current' &&
              record.accessLevel === 'full_text' &&
              record.verificationStatus === 'full_text_verified' &&
              record.officialUrl.startsWith('https://'),
          ),
        ).toBe(true);
      }
    }
  });

  it('B25-CANDIDATE-004 accounts for all 56 rules and excludes special scopes', () => {
    expect(candidate.allRuleSelectionStatus).toHaveLength(56);
    expect(new Set(candidate.allRuleSelectionStatus.map((item) => item.ruleId)).size).toBe(56);
    expect(candidate.pairScope.join(' ')).not.toMatch(
      /gas-cylinder|aluminum-cylinder|austemper|local|field|induction|die-block|mold|vacuum|salt/i,
    );
  });

  it('B25-CANDIDATE-005 verifies every frozen source hash and the approval snapshot hash', () => {
    const lineage = readJson<{
      versions: Array<{
        baselineVersion: string;
        immutableArtifacts: Array<{ path: string; sha256: string }>;
      }>;
    }>('data/workpiece-router/industry-public-baseline-candidate-batch2.5-lineage.json');
    const archived = lineage.versions.find(
      (item) => item.baselineVersion === candidate.baselineVersion,
    )!;
    for (const file of archived.immutableArtifacts) expect(hashFile(file.path)).toBe(file.sha256);
    expect(hashValue(candidate.frozenFiles)).toBe(candidate.codeAndDataSnapshotHash);
    expect(hashValue(candidate.evidenceSnapshot)).toBe(candidate.evidenceSnapshotHash);
    expect(hashValue(candidate.publicCopySnapshot)).toBe(candidate.publicCopySnapshotHash);
    expect(hashValue(candidate.approvalScope)).toBe(candidate.approvalScopeHash);
    expect(
      hashValue({
        baselineVersion: candidate.baselineVersion,
        approvalScopeHash: candidate.approvalScopeHash,
        evidenceSnapshotHash: candidate.evidenceSnapshotHash,
        publicCopySnapshotHash: candidate.publicCopySnapshotHash,
        codeAndDataSnapshotHash: candidate.codeAndDataSnapshotHash,
      }),
    ).toBe(candidate.snapshotHash);
  });

  it('B25-CANDIDATE-006 freezes three complete customer-facing states without product links', () => {
    for (const rule of candidate.candidateRules) {
      expect(Object.keys(rule.publicCopy).sort()).toEqual([
        'conditional_preview',
        'engineering_review',
        'matched_direction',
      ]);
      for (const [state, copy] of Object.entries(rule.publicCopy)) {
        expect(copy.length).toBeGreaterThan(30);
        if (state !== 'engineering_review') expect(copy).toContain('行业常见设备方向');
        expect(copy).not.toMatch(/https?:\/\/|\/zh\/products|productId|eqdir-|candidate-appmap-/i);
      }
    }
  });
});
