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
type Candidate = {
  baselineVersion: string;
  status: string;
  productionPublicRuleCount: number;
  candidateRuleIds: string[];
  pairScope: string[];
  technicalSnapshotHash: string;
  approvalBundleHash: string | null;
  approvalRecord: Record<string, string | null>;
  frozenFiles: Array<{ path: string; sha256: string }>;
  evidenceSnapshot: Array<Record<string, unknown>>;
  candidateRules: Array<{
    ruleId: string;
    sourcePublicationEligibility: string;
    proposedPublicationEligibility: string;
    directionGate: Record<string, unknown>;
    finalSizingInputs: string[];
    selectedPairs: Array<{
      pairKey: string;
      publicWorkpieceName: string;
      publicProcessPurposeName: string;
      directApplicationEvidenceRefs: string[];
      directionGate: {
        matchCriteria?: Array<{ field: string; allowedValues: string[] }>;
        requiredInputs?: string[];
        requiredEngineeringPredicates?: string[];
      };
    }>;
    publicCopy: Record<string, string>;
  }>;
  allRuleSelectionStatus: Array<{ ruleId: string }>;
};

type ApprovalBundleManifest = {
  baselineVersion: string;
  technicalSnapshotHash: string;
  approvalBundleHash: string;
  hashAlgorithm: {
    approvalBundleHashPayload: unknown;
  };
  technicalSnapshotCoverage: {
    files: Array<{ sourcePath: string; sha256: string }>;
  };
};

type ApprovalRecord = {
  status: string;
  binding: {
    baselineVersion: string;
    technicalSnapshotHash: string;
    approvalBundleHash: string;
  };
};

const candidate = readJson<Candidate>(
  'data/workpiece-router/industry-public-baseline-candidate-batch2.5-candidate-v2.json',
);

describe('batch 2.5.1 pre-approval closure candidate v2', () => {
  it('B251-CANDIDATE-001 preserves v1 as returned and keeps v2 unsigned with production at zero', () => {
    const lineage = readJson<{
      versions: Array<{ baselineVersion: string; status: string; immutableArtifacts: unknown[] }>;
    }>('data/workpiece-router/industry-public-baseline-candidate-batch2.5-lineage.json');
    const v1 = lineage.versions.find((item) => item.baselineVersion.endsWith('candidate-v1'));
    expect(v1).toMatchObject({ status: 'returned_for_revision' });
    expect(v1?.immutableArtifacts).toHaveLength(7);
    expect(candidate).toMatchObject({
      baselineVersion: 'industry-public-baseline-2026-08-batch2.5-candidate-v2',
      status: 'awaiting_responsible_owner_approval',
      productionPublicRuleCount: 0,
      candidateRuleIds: expect.arrayContaining([
        'eqdir-heavy-car-bottom-v1',
        'eqdir-wear-plate-quench-temper-line-v2',
      ]),
      approvalBundleHash: null,
    });
    expect(candidate.candidateRuleIds).toHaveLength(6);
    expect(candidate.pairScope).toHaveLength(23);
    expect(new Set(candidate.pairScope).size).toBe(23);
    expect(Object.values(candidate.approvalRecord).every((value) => value === null)).toBe(true);
  });

  it('B251-CANDIDATE-002 freezes direction gates separately from final sizing inputs', () => {
    for (const rule of candidate.candidateRules) {
      expect(rule.directionGate).toBeTruthy();
      expect(rule.finalSizingInputs.length).toBeGreaterThan(0);
      expect(rule.sourcePublicationEligibility).toBe('internal_only');
      expect(rule.proposedPublicationEligibility).toBe('conditional_public');
    }
  });

  it('B251-CANDIDATE-003 narrows every requested public workpiece and process label', () => {
    const pairs = candidate.candidateRules.flatMap((rule) => rule.selectedPairs);
    expect(
      pairs.find((pair) => pair.pairKey.startsWith('large-forged-flange|'))?.publicWorkpieceName,
    ).toBe('大型锻制法兰');
    expect(pairs.find((pair) => pair.pairKey.startsWith('hex-nuts|'))?.publicWorkpieceName).toBe(
      '钢制六角螺母（整体调质）',
    );
    expect(
      pairs.find((pair) => pair.pairKey.startsWith('carbon-steel-coil|'))?.publicWorkpieceName,
    ).toBe('碳钢带卷（成卷批次退火）');
    expect(
      pairs.find((pair) => pair.pairKey.startsWith('wear-resistant-steel-plate|'))
        ?.publicWorkpieceName,
    ).toBe('均质耐磨钢板（整体调质）');
    for (const pair of pairs.filter((item) => item.pairKey.includes('|tempering'))) {
      expect(pair.publicProcessPurposeName).toBe('单独回火');
    }
    for (const pair of pairs.filter((item) => item.pairKey.startsWith('welded-steel-pipe|'))) {
      expect(pair.publicProcessPurposeName).toMatch(/^整管(退火|正火)$/);
    }
  });

  it('B251-CANDIDATE-004 freezes all required evidence fields and downgrades Surface Combustion', () => {
    const surface = candidate.evidenceSnapshot.find(
      (item) => item.evidenceId === 'candidate-appmap-heavy-car-bottom',
    );
    expect(surface).toMatchObject({
      evidenceRole: 'equipment_capability_reference',
      directPairSupport: false,
    });
    for (const evidence of candidate.evidenceSnapshot) {
      for (const field of [
        'issuer',
        'title',
        'url',
        'accessedAt',
        'supportedClaims',
        'paragraphRefs',
        'contentHash',
        'unsupportedBoundaries',
      ]) {
        expect(evidence[field]).toBeTruthy();
      }
      expect(String(evidence.contentHash)).toMatch(/^sha256:[a-f0-9]{64}$/);
    }
    for (const rule of candidate.candidateRules) {
      for (const pair of rule.selectedPairs) {
        expect(pair.directApplicationEvidenceRefs.length).toBeGreaterThan(0);
        expect(pair.directApplicationEvidenceRefs).not.toContain(
          'candidate-appmap-heavy-car-bottom',
        );
      }
    }
  });

  it('B251-CANDIDATE-005 freezes shaft, welded pipe, wear plate and hex-nut negative gates', () => {
    const pairs = candidate.candidateRules.flatMap((rule) => rule.selectedPairs);
    const shaft = pairs.find((pair) => pair.pairKey.startsWith('large-forged-shaft|'))!;
    expect(shaft.directionGate.requiredInputs).toEqual(
      expect.arrayContaining([
        'dimensionLength',
        'shaftEquivalentSectionMm',
        'allowableDeflectionMm',
        'supportPointCount',
        'supportPointLayout',
        'supportSpanMm',
        'singlePieceWeightKg',
        'fixtureWeightKg',
        'batchLoadWeightKg',
      ]),
    );
    expect(shaft.directionGate.matchCriteria).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: 'horizontalLoadingAllowed', allowedValues: ['true'] }),
        expect.objectContaining({ field: 'loadingOrientation', allowedValues: ['horizontal'] }),
      ]),
    );
    const welded = pairs.find((pair) => pair.pairKey.startsWith('welded-steel-pipe|'))!;
    expect(welded.directionGate.matchCriteria).toContainEqual(
      expect.objectContaining({ field: 'pipeTreatmentScope', allowedValues: ['whole_pipe'] }),
    );
    const wear = pairs.find((pair) => pair.pairKey.startsWith('wear-resistant-steel-plate|'))!;
    expect(wear.directionGate.matchCriteria).toContainEqual(
      expect.objectContaining({ field: 'wearPlateConstruction', allowedValues: ['homogeneous'] }),
    );
    const nut = pairs.find((pair) => pair.pairKey.startsWith('hex-nuts|'))!;
    expect(nut.directionGate.matchCriteria).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: 'nutConstruction', allowedValues: ['plain_hex'] }),
        expect.objectContaining({
          field: 'fastenerMaterialClass',
          allowedValues: ['carbon_or_alloy_steel'],
        }),
      ]),
    );
  });

  it('B251-CANDIDATE-006 freezes the mandated matched copy and never exposes product links', () => {
    for (const rule of candidate.candidateRules) {
      expect(rule.publicCopy.matched_direction).toBe(
        `根据当前填写并经服务端规则校验的工况，可优先评估的行业常见设备方向之一为“${
          rule.publicCopy.matched_direction.match(/“([^”]+)”/)?.[1]
        }”。仍须结合图纸、执行标准、材质牌号、最终装载设计、完整工艺链和产能节拍完成工程确认。本结果不构成最终选型、工艺参数或苏能供货与能力承诺。`,
      );
      expect(rule.publicCopy.engineering_review).not.toMatch(
        /台车式|辊底式|罩式|网带式|产品页|https?:\/\//,
      );
      expect(JSON.stringify(rule.publicCopy)).not.toMatch(/唯一|必须采用|苏能推荐|苏能可提供/);
    }
  });

  it('B251-CANDIDATE-007 verifies the archived approval snapshot and accounts for all 56 rules', () => {
    const manifest = readJson<ApprovalBundleManifest>(
      'docs/independent-site-v2/workpiece-router-batch2.5.1-approval-bundle-manifest-r2.json',
    );
    const approval = readJson<ApprovalRecord>(
      'docs/independent-site-v2/approvals/WR-B251-V2-APPROVAL-20260828T083605902-0800.json',
    );

    expect(
      manifest.technicalSnapshotCoverage.files.map((file) => ({
        path: file.sourcePath,
        sha256: file.sha256,
      })),
    ).toEqual(candidate.frozenFiles);
    expect(
      hashValue({ baselineVersion: candidate.baselineVersion, frozenFiles: candidate.frozenFiles }),
    ).toBe(candidate.technicalSnapshotHash);
    expect(manifest).toMatchObject({
      baselineVersion: candidate.baselineVersion,
      technicalSnapshotHash: candidate.technicalSnapshotHash,
    });
    expect(hashValue(manifest.hashAlgorithm.approvalBundleHashPayload)).toBe(
      manifest.approvalBundleHash,
    );
    expect(approval).toMatchObject({
      status: 'approved_not_released',
      binding: {
        baselineVersion: candidate.baselineVersion,
        technicalSnapshotHash: candidate.technicalSnapshotHash,
        approvalBundleHash: manifest.approvalBundleHash,
      },
    });
    expect(candidate.allRuleSelectionStatus).toHaveLength(56);
    expect(new Set(candidate.allRuleSelectionStatus.map((item) => item.ruleId)).size).toBe(56);
  });
});
