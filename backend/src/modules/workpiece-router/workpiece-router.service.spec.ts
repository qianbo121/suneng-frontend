import 'reflect-metadata';

import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { ResolveWorkpieceRouterDto } from '@/modules/workpiece-router/dto/resolve-workpiece-router.dto';
import { type ServerIndustryRule } from '@/modules/workpiece-router/engineering-resolver';
import {
  computeApprovedScopeHash,
  findUnmappedRouteRequiredInputs,
  listPublicDirectionExamples,
  loadWorkpieceRouterResolveData,
  ROUTE_REQUIRED_INPUT_FIELD_MAP,
  resolveWorkpieceRouterRequest,
  type WorkpieceRouterResolveData,
} from '@/modules/workpiece-router/workpiece-router.service';

type FixtureRule = ServerIndustryRule & {
  equipmentFamilyId: string;
  publicLabelDerivationKey: string;
  equipmentOutput: ServerIndustryRule['equipmentOutput'] & { furnaceArchitecture: string };
};

const completeRaw = {
  partForm: 'discrete_part',
  loadMovement: 'stationary',
  loadingAccess: 'crane_or_forklift',
  baseSupportCondition: 'broad_base',
  floorLoadingRequired: true,
  batchSize: 'medium',
  targetThroughput: 'low',
  productMix: 'high_mix',
  changeoverFrequency: 'frequent',
  cycleTimeExpectation: 'flexible',
  loadingContinuity: 'discrete',
};

function fixtureRule(
  ruleId: string,
  routeId = 'route-a',
  equipmentFamilyId = 'family-a',
  labelKey = 'batch|chamber',
): FixtureRule {
  return {
    ruleId,
    equipmentFamilyId,
    publicLabelDerivationKey: labelKey,
    publicationEligibility: 'conditional_public',
    internalExecutionStatus: 'eligible',
    allowedPairs: [{ workpieceId: 'fixture-part', routeId, processVariantId: 'anneal' }],
    matchCriteria: [
      { field: 'partForm', allowedValues: ['discrete_part'], requiredForMatch: true },
    ],
    handlingInference: {
      expectedSupportMethod: 'mobile_hearth',
      requiredSignals: [
        'loadMovement',
        'loadingAccess',
        'baseSupportCondition',
        'floorLoadingRequired',
      ],
      directAnswerAccepted: false,
    },
    operationInference: {
      mode: 'batch',
      requiredSignals: [
        'batchSize',
        'targetThroughput',
        'productMix',
        'changeoverFrequency',
        'cycleTimeExpectation',
        'loadingContinuity',
      ],
      preferenceCanDecide: false,
    },
    requiredEngineeringPredicates: [],
    requiredProcessStages: [],
    requiredInputs: [
      'partForm',
      'loadMovement',
      'loadingAccess',
      'baseSupportCondition',
      'floorLoadingRequired',
      'batchSize',
      'targetThroughput',
      'productMix',
      'changeoverFrequency',
      'cycleTimeExpectation',
      'loadingContinuity',
    ],
    nonMatchableAssumptions: [],
    equipmentOutput: { processChain: [], furnaceArchitecture: 'chamber' },
  };
}

function fixtureData(rules = [fixtureRule('public-a')]): WorkpieceRouterResolveData {
  const version = 'fixture-approved-v1';
  const approvedRuleIds = rules.map((rule) => rule.ruleId);
  const approvedPairKeys = rules.flatMap((rule) =>
    rule.allowedPairs.map((pair) => `${pair.workpieceId}|${pair.routeId}|${pair.processVariantId}`),
  );
  const snapshotHashes = {
    ruleSetHash: 'sha256:fixture-rules',
    evidenceSnapshotHash: 'sha256:fixture-evidence',
    publicLabelMappingHash: 'sha256:fixture-labels',
    publicClaimTemplateHash: 'sha256:fixture-copy',
    rulePriorityHash: 'sha256:fixture-priority',
    approvedScopeHash: computeApprovedScopeHash(approvedRuleIds, approvedPairKeys),
  };
  const publicRules = rules.map((rule) => ({
    ...rule,
    pairEvidence: Object.fromEntries(
      rule.allowedPairs.map((pair) => [
        `${pair.workpieceId}|${pair.routeId}|${pair.processVariantId}`,
        {
          taxonomyRefs: ['taxonomy-fixture'],
          applicationMappingRefs: ['application-fixture'],
        },
      ]),
    ),
  }));
  return {
    catalog: {
      categories: [
        {
          id: 'fixture-category',
          label: '测试分类',
          name: '测试分类',
          cards: [{ id: 'fixture-part', name: '测试工件' }],
        },
      ],
    },
    routes: [
      {
        id: 'route-a',
        workpieceIds: ['fixture-part'],
        processVariants: [{ id: 'anneal', processPurposeId: 'anneal' }],
        processBoundary: 'overall_furnace_treatment',
        moduleDisposition: 'in_scope',
        requiredInputs: [],
      },
    ],
    rules,
    publicSnapshot: {
      publicBaselineVersion: version,
      rules: publicRules,
      evidence: [
        {
          evidenceId: 'taxonomy-fixture',
          evidenceType: 'taxonomy_reference',
          status: 'current',
          accessLevel: 'full_text',
          verificationStatus: 'full_text_verified',
        },
        {
          evidenceId: 'application-fixture',
          evidenceType: 'application_mapping',
          status: 'current',
          accessLevel: 'full_text',
          verificationStatus: 'full_text_verified',
        },
      ],
      labels: {
        combinationOverrides: Object.fromEntries(
          rules.map((rule) => [rule.publicLabelDerivationKey, `测试方向-${rule.ruleId}`]),
        ),
      },
    },
    baselines: {
      publicBaselineVersion: version,
      versions: [
        {
          baselineVersion: version,
          publicationStatus: 'approved',
          locked: true,
          lockedAt: '2026-08-27T10:00:00+08:00',
          approvedBy: '测试负责人',
          approvedRole: '技术负责人',
          approvedAt: '2026-08-27T10:00:00+08:00',
          resolverVersion: 'fixture-resolver-v1',
          ...snapshotHashes,
          approvedRuleIds,
          approvedPairKeys,
        },
      ],
    },
    resolverConfig: {
      resolverVersion: 'fixture-resolver-v1',
      canonicalHashAlgorithm: 'sha256-stable-json-v1',
      snapshot: snapshotHashes,
    },
    capabilities: rules.map((rule) => ({
      id: rule.equipmentFamilyId,
      equipmentFamilyId: rule.equipmentFamilyId,
      engineeringProfile: { capabilityId: `fixture:${rule.equipmentFamilyId}` },
    })),
  };
}

function request(rawConditions: Record<string, unknown>) {
  return {
    workpieceId: 'fixture-part',
    processPurposeId: 'anneal',
    rawConditions,
  } as ResolveWorkpieceRouterDto;
}

describe('Batch 2.4A workpiece resolver public contract', () => {
  it('returns rule-specific groups and a next question for incomplete raw conditions', () => {
    const result = resolveWorkpieceRouterRequest(request({}), fixtureData());
    expect(result.displayState).toBe('insufficient_conditions');
    expect(result.conditionGroups.length).toBeLessThanOrEqual(3);
    expect(result.conditionGroups.map((group) => group.id)).toEqual(['handling', 'production']);
    expect(result.nextQuestion).toEqual({
      groupId: 'handling',
      fieldId: 'partForm',
      prompt: '请补充工件形态',
    });
    const throughput = result.conditionGroups
      .flatMap((group) => group.fields)
      .find((field) => field.id === 'targetThroughput');
    expect(throughput?.options?.filter((option) => option.value === 'high')).toHaveLength(1);
  });

  it('merges four logical categories into three visible groups without dropping editable fields', () => {
    const data = fixtureData();
    data.routes[0].requiredInputs = ['dimensions', 'materialGrade'];
    const raw = {
      ...completeRaw,
      dimensionLength: 1200,
      dimensionWidth: 800,
      dimensionHeight: 600,
      dimensionUnit: 'mm',
      materialGrade: 'Q355B',
    };
    const result = resolveWorkpieceRouterRequest(request(raw), data);
    expect(result.totalGroups).toBe(3);
    expect(result.completedGroups).toBe(3);
    expect(result.conditionGroups).toHaveLength(3);
    expect(result.conditionGroups[0].label).toBe('尺寸、材质与工艺边界');
    const returnedFieldIds = result.conditionGroups.flatMap((group) =>
      group.fields.map((field) => field.id),
    );
    expect(returnedFieldIds).toEqual(
      expect.arrayContaining([
        'dimensionLength',
        'dimensionWidth',
        'dimensionHeight',
        'dimensionUnit',
        'materialGrade',
        'partForm',
        'targetThroughput',
      ]),
    );
    expect(result.nextQuestion).toBeNull();
  });

  it('returns one public direction only from a locked approved snapshot', () => {
    const result = resolveWorkpieceRouterRequest(request(completeRaw), fixtureData());
    expect(result.displayState).toBe('single_direction');
    expect(result.publicDirections).toEqual([
      expect.objectContaining({ name: '测试方向-public-a' }),
    ]);
  });

  it('B251-PUBLIC-001 exposes a conditional direction for unknown gates and no direction for false gates', () => {
    const gated = fixtureRule('public-gated');
    gated.pairDirectionGates = {
      'fixture-part|route-a|anneal': {
        matchCriteria: [
          {
            field: 'horizontalLoadingAllowed',
            allowedValues: ['true'],
            requiredForMatch: true,
          },
        ],
        requiredInputs: [],
      },
    };
    const conditional = resolveWorkpieceRouterRequest(
      request({ ...completeRaw, horizontalLoadingAllowed: 'unknown' }),
      fixtureData([gated]),
    );
    expect(conditional).toMatchObject({
      displayState: 'single_direction',
      publicDirections: [
        expect.objectContaining({
          resolutionStage: 'conditional_preview',
          stillNeedConfirm: expect.arrayContaining(['是否允许卧式装炉']),
        }),
      ],
    });

    const incompatible = resolveWorkpieceRouterRequest(
      request({ ...completeRaw, horizontalLoadingAllowed: false }),
      fixtureData([gated]),
    );
    expect(incompatible).toMatchObject({
      displayState: 'engineering_review',
      publicDirections: [],
    });
  });

  it('B251-PUBLIC-002 keeps final sizing separate after a matched direction', () => {
    const gated = fixtureRule('public-matched');
    gated.finalSizingInputs = ['drawingRequirement', 'applicableStandard', 'materialGrade'];
    gated.pairDirectionGates = {
      'fixture-part|route-a|anneal': {
        matchCriteria: [
          {
            field: 'horizontalLoadingAllowed',
            allowedValues: ['true'],
            requiredForMatch: true,
          },
        ],
        requiredInputs: [],
      },
    };
    const result = resolveWorkpieceRouterRequest(
      request({ ...completeRaw, horizontalLoadingAllowed: true }),
      fixtureData([gated]),
    );
    expect(result.publicDirections[0]).toMatchObject({
      resolutionStage: 'matched_direction',
      stillNeedConfirm: ['图纸工艺要求', '执行标准', '牌号'],
    });
    expect(result.publicDirections[0].stillNeedConfirm).not.toContain('是否允许卧式装炉');
    expect(result.publicDirections[0].publicStatement).toBe(
      '根据当前填写并经服务端规则校验的工况，可优先评估的行业常见设备方向之一为“测试方向-public-matched”。仍须结合图纸、执行标准、材质牌号、最终装载设计、完整工艺链和产能节拍完成工程确认。本结果不构成最终选型、工艺参数或苏能供货与能力承诺。',
    );
  });

  it.each([
    'resolverVersion',
    'ruleSetHash',
    'evidenceSnapshotHash',
    'publicLabelMappingHash',
    'publicClaimTemplateHash',
    'rulePriorityHash',
    'approvedScopeHash',
  ])('invalidates public output when approved %s changes', (field) => {
    const data = fixtureData();
    (data.baselines.versions[0] as unknown as Record<string, unknown>)[field] = 'tampered';
    const result = resolveWorkpieceRouterRequest(request(completeRaw), data);
    expect(result.publicDirections).toEqual([]);
    expect(result.displayState).toBe('completed_pending_engineering');
  });

  it.each(['approvedRuleIds', 'approvedPairKeys'] as const)(
    'recomputes approved scope and rejects a changed %s list with the old hash',
    (field) => {
      const data = fixtureData();
      data.baselines.versions[0][field] = [
        ...(data.baselines.versions[0][field] ?? []),
        field === 'approvedRuleIds' ? 'unexpected-rule' : 'fixture-part|unexpected-route|anneal',
      ];
      const result = resolveWorkpieceRouterRequest(request(completeRaw), data);
      expect(result.publicDirections).toEqual([]);
      expect(result.displayState).toBe('completed_pending_engineering');
    },
  );

  it.each(['taxonomy-fixture', 'application-fixture'])(
    'requires approved pair evidence %s to remain in the public snapshot',
    (evidenceId) => {
      const data = fixtureData();
      data.publicSnapshot.evidence = data.publicSnapshot.evidence.filter(
        (item) => item.evidenceId !== evidenceId,
      );
      const result = resolveWorkpieceRouterRequest(request(completeRaw), data);
      expect(result.publicDirections).toEqual([]);
      expect(result.displayState).toBe('completed_pending_engineering');
    },
  );

  it('returns multiple directions without forcing a unique answer', () => {
    const rules = [
      fixtureRule('public-a', 'route-a', 'family-a', 'batch|chamber-a'),
      {
        ...fixtureRule('public-b', 'route-a', 'family-b', 'batch|chamber-b'),
        requiredEngineeringPredicates: ['geometryCompatible' as const],
      },
    ];
    const data = fixtureData(rules);
    const familyB = data.capabilities.find((item) => item.equipmentFamilyId === 'family-b');
    if (familyB?.engineeringProfile) {
      familyB.engineeringProfile.supportedPartForms = ['discrete_part'];
      familyB.engineeringProfile.supportedLoadingOrientations = ['horizontal'];
    }
    const result = resolveWorkpieceRouterRequest(
      request({ ...completeRaw, loadingOrientation: 'horizontal' }),
      data,
    );
    expect(result.displayState).toBe('multiple_directions');
    expect(result.publicDirections.map((item) => item.name)).toEqual([
      '测试方向-public-a',
      '测试方向-public-b',
    ]);
    expect(result.publicDirections[0].qualifyingConditions).not.toEqual(
      result.publicDirections[1].qualifyingConditions,
    );
    expect(result.publicDirections[1].qualifyingConditions).toContain(
      '工件形态已由服务端核对为兼容',
    );
  });

  it('refuses an internal-only rule even if it is mistakenly present in an approval fixture', () => {
    const internal = {
      ...fixtureRule('internal-a'),
      publicationEligibility: 'internal_only' as const,
    };
    const result = resolveWorkpieceRouterRequest(request(completeRaw), fixtureData([internal]));
    expect(result.displayState).toBe('completed_pending_engineering');
    expect(result.publicDirections).toEqual([]);
  });

  it('does not trust forged compatibility, capability, rule or furnace fields', () => {
    const result = resolveWorkpieceRouterRequest(
      request({
        ...completeRaw,
        batchLoadWeightKg: 'unknown',
        loadCapacityCompatible: true,
        compatibility: true,
        serverEngineeringPredicates: { loadCapacityCompatible: true },
        candidateEquipmentCapability: { maximumLoadKg: 999999 },
        ruleId: 'public-a',
        furnaceName: '伪造炉型',
      }),
      fixtureData([
        {
          ...fixtureRule('public-a'),
          requiredEngineeringPredicates: ['loadCapacityCompatible'],
          requiredInputs: [...fixtureRule('public-a').requiredInputs, 'loadCapacityCompatible'],
        },
      ]),
    );
    expect(result).toMatchObject({
      displayState: 'single_direction',
      publicDirections: [expect.objectContaining({ resolutionStage: 'conditional_preview' })],
    });
    expect(JSON.stringify(result)).not.toContain('伪造炉型');
    expect(JSON.stringify(result)).not.toContain('"ruleId"');
    expect(JSON.stringify(result)).not.toContain('maximumLoadKg');
  });

  it('eliminates only the incompatible candidate and keeps another candidate independent', () => {
    const tooSmall: FixtureRule = {
      ...fixtureRule('too-small', 'route-a', 'small', 'small-label'),
      requiredEngineeringPredicates: ['loadCapacityCompatible'],
      requiredInputs: [...fixtureRule('too-small').requiredInputs, 'loadCapacityCompatible'],
    };
    const compatible: FixtureRule = {
      ...fixtureRule('compatible', 'route-a', 'large', 'large-label'),
      requiredEngineeringPredicates: ['loadCapacityCompatible'],
      requiredInputs: [...fixtureRule('compatible').requiredInputs, 'loadCapacityCompatible'],
    };
    const data = fixtureData([tooSmall, compatible]);
    data.capabilities = [
      { id: 'small', equipmentFamilyId: 'small', engineeringProfile: { maximumLoadKg: 5 } },
      { id: 'large', equipmentFamilyId: 'large', engineeringProfile: { maximumLoadKg: 500 } },
    ];
    const result = resolveWorkpieceRouterRequest(
      request({ ...completeRaw, batchLoadWeightKg: 20 }),
      data,
    );
    expect(result.displayState).toBe('single_direction');
    expect(result.publicDirections[0].name).toBe('测试方向-compatible');
  });

  it('keeps questions from a candidate that was eliminated by a known false condition', () => {
    const surviving = fixtureRule('surviving');
    const eliminated = fixtureRule('eliminated', 'route-a', 'family-b', 'eliminated-label');
    eliminated.matchCriteria = [
      { field: 'partForm', allowedValues: ['plate'], requiredForMatch: true },
    ];
    eliminated.requiredInputs = [...eliminated.requiredInputs, 'processRequirement'];
    const result = resolveWorkpieceRouterRequest(
      request(completeRaw),
      fixtureData([surviving, eliminated]),
    );
    expect(result.displayState).toBe('insufficient_conditions');
    expect(result.missingInputs).toContain('processRequirement');
    expect(
      result.conditionGroups.flatMap((group) => group.fields.map((field) => field.id)),
    ).toContain('processRequirement');
  });

  it('does not derive batch load from one piece plus fixture weight without batch quantity', () => {
    const capacityRule: FixtureRule = {
      ...fixtureRule('capacity-rule'),
      requiredEngineeringPredicates: ['loadCapacityCompatible'],
      requiredInputs: [...fixtureRule('capacity-rule').requiredInputs, 'loadCapacityCompatible'],
    };
    const data = fixtureData([capacityRule]);
    data.capabilities = [
      {
        id: capacityRule.equipmentFamilyId,
        equipmentFamilyId: capacityRule.equipmentFamilyId,
        engineeringProfile: { maximumLoadKg: 500 },
      },
    ];
    const result = resolveWorkpieceRouterRequest(
      request({
        ...completeRaw,
        singlePieceWeightKg: 100,
        fixtureWeightKg: 50,
        batchLoadWeightKg: 'unknown',
      }),
      data,
    );
    expect(result.publicDirections).toEqual([
      expect.objectContaining({
        resolutionStage: 'conditional_preview',
        stillNeedConfirm: expect.arrayContaining(['装载重量']),
      }),
    ]);
    expect(result.missingInputs).toContain('batchLoadWeightKg');
  });

  it('handles two steel-pins routes independently instead of selecting one route on the client', () => {
    const first = fixtureRule('pin-a', 'track-pin-engineering-review', 'pin-family-a', 'pin-a');
    const second = fixtureRule('pin-b', 'fastener-quench-temper', 'pin-family-b', 'pin-b');
    first.allowedPairs[0] = {
      workpieceId: 'steel-pins',
      routeId: 'track-pin-engineering-review',
      processVariantId: 'quench-temper',
    };
    second.allowedPairs[0] = {
      workpieceId: 'steel-pins',
      routeId: 'fastener-quench-temper',
      processVariantId: 'quench-temper',
    };
    const data = fixtureData([first, second]);
    data.routes = [
      {
        id: 'track-pin-engineering-review',
        workpieceIds: ['steel-pins'],
        processVariants: [{ id: 'quench-temper' }],
        moduleDisposition: 'in_scope',
        processBoundary: 'overall_furnace_treatment',
      },
      {
        id: 'fastener-quench-temper',
        workpieceIds: ['steel-pins'],
        processVariants: [{ id: 'quench-temper' }],
        moduleDisposition: 'in_scope',
        processBoundary: 'overall_furnace_treatment',
      },
    ];
    data.baselines.versions[0].approvedPairKeys = [
      'steel-pins|track-pin-engineering-review|quench-temper',
      'steel-pins|fastener-quench-temper|quench-temper',
    ];
    const result = resolveWorkpieceRouterRequest(
      {
        workpieceId: 'steel-pins',
        processPurposeId: 'quench-temper',
        rawConditions: completeRaw,
      } as ResolveWorkpieceRouterDto,
      data,
    );
    expect(result.publicDirections).toHaveLength(2);
  });

  it('routes local and field treatment to the special-process boundary with no directions', () => {
    const data = fixtureData();
    data.routes = [
      {
        id: 'local-route',
        workpieceIds: ['fixture-part'],
        processVariants: [{ id: 'anneal' }],
        processBoundary: 'local_treatment',
        moduleDisposition: 'outside_furnace_module',
      },
    ];
    const result = resolveWorkpieceRouterRequest(request({}), data);
    expect(result).toMatchObject({
      displayState: 'special_process_boundary',
      publicDirections: [],
    });
  });

  it('keeps field PWHT outside ordinary furnace directions and internal candidate names', () => {
    const data = fixtureData([]);
    data.routes = [
      {
        id: 'welded-pwht',
        workpieceIds: ['welded-part'],
        processVariants: [{ id: 'post-weld-heat-treatment' }],
        processBoundary: 'overall_furnace_treatment',
        moduleDisposition: 'in_scope',
      },
    ];
    const result = resolveWorkpieceRouterRequest(
      {
        workpieceId: 'welded-part',
        processPurposeId: 'post-weld-heat-treatment',
        rawConditions: { treatmentScope: 'field' },
      } as ResolveWorkpieceRouterDto,
      data,
    );
    expect(result).toMatchObject({
      displayState: 'special_process_boundary',
      publicDirections: [],
    });
    expect(JSON.stringify(result)).not.toMatch(/eqdir-|candidate-appmap-|ruleId|internal/i);
  });

  it.each([
    {
      caseId: 'contradiction-quench-required-false-but-quench-stage-true',
      rawConditions: { ...completeRaw, quenchRequired: false, quench: true },
    },
    {
      caseId: 'contradiction-discrete-part-but-coiled-presentation',
      rawConditions: { ...completeRaw, partForm: 'discrete_part', presentationState: 'coiled' },
    },
  ])(
    'returns invalid_input for semantically contradictory raw conditions [$caseId]',
    ({ rawConditions }) => {
      const result = resolveWorkpieceRouterRequest(request(rawConditions), fixtureData());
      expect(result).toMatchObject({
        displayState: 'invalid_input',
        conditionGroups: [],
        publicDirections: [],
      });
    },
  );

  it.each([
    { caseId: 'zero-dimension-length', rawConditions: { ...completeRaw, dimensionLength: 0 } },
    { caseId: 'zero-maximum-thickness', rawConditions: { ...completeRaw, maximumThickness: 0 } },
    { caseId: 'zero-batch-load-weight', rawConditions: { ...completeRaw, batchLoadWeightKg: 0 } },
  ])(
    'returns invalid_input when a required positive measurement is zero [$caseId]',
    ({ rawConditions }) => {
      expect(
        resolveWorkpieceRouterRequest(request(rawConditions), fixtureData()).displayState,
      ).toBe('invalid_input');
    },
  );

  it('allows a zero center-of-gravity X/Y coordinate', () => {
    expect(
      resolveWorkpieceRouterRequest(
        request({ centerOfGravityX: 0, centerOfGravityY: 0 }),
        fixtureData(),
      ).displayState,
    ).toBe('insufficient_conditions');
  });

  it('allows zero fixture weight to mean that no fixture is used', () => {
    expect(
      resolveWorkpieceRouterRequest(request({ ...completeRaw, fixtureWeightKg: 0 }), fixtureData())
        .displayState,
    ).toBe('single_direction');
  });

  it('keeps current production at zero public directions and leaks no internal identifiers', () => {
    const production = loadWorkpieceRouterResolveData();
    const result = resolveWorkpieceRouterRequest(
      {
        workpieceId: 'large-welded-machine-frame',
        processPurposeId: 'stress-relief',
        rawConditions: {},
      } as ResolveWorkpieceRouterDto,
      production,
    );
    expect(result.publicDirections).toEqual([]);
    const text = JSON.stringify(result);
    expect(text).not.toMatch(/eqdir-|candidate-appmap-|ruleId|internalDirections|statusReason/);
  });

  it('never publishes internal final examples when the approval snapshot is empty', () => {
    const production = loadWorkpieceRouterResolveData();
    const workpieces = production.catalog.categories.flatMap((category) => category.cards);
    expect(workpieces).toHaveLength(45);
    expect(Object.keys(production.finalDirectionsByWorkpiece ?? {})).toHaveLength(45);
    for (const workpiece of workpieces) {
      expect(listPublicDirectionExamples(workpiece.id, production).examples).toEqual([]);
    }
  });

  it('publishes examples only for a fully approved scope and suppresses withdrawn approval or evidence', () => {
    const approved = fixtureData();
    approved.publicPairLabels = { 'fixture-part|route-a|anneal': '测试退火工况' };
    expect(listPublicDirectionExamples('fixture-part', approved).examples).toEqual([
      { condition: '测试退火工况', direction: '测试方向-public-a' },
    ]);
    const missingEvidence = structuredClone(approved);
    missingEvidence.publicSnapshot.evidence = [];
    expect(listPublicDirectionExamples('fixture-part', missingEvidence).examples).toEqual([]);
    const unsigned = structuredClone(approved);
    unsigned.baselines.versions[0].approvedBy = null;
    expect(listPublicDirectionExamples('fixture-part', unsigned).examples).toEqual([]);
    expect(listPublicDirectionExamples('unknown', approved).examples).toEqual([]);
  });

  it('maps every required input in all 37 production routes to a customer-observable field', () => {
    const production = loadWorkpieceRouterResolveData();
    expect(production.routes).toHaveLength(37);
    expect(findUnmappedRouteRequiredInputs(production)).toEqual([]);
    expect(Object.values(ROUTE_REQUIRED_INPUT_FIELD_MAP).flat()).not.toContain('supportMethod');
  });

  it('returns only the documented top-level response fields', () => {
    const result = resolveWorkpieceRouterRequest(request(completeRaw), fixtureData());
    expect(Object.keys(result).sort()).toEqual(
      [
        'displayState',
        'conditionGroups',
        'completedGroups',
        'totalGroups',
        'missingInputs',
        'nextQuestion',
        'publicDirections',
        'customerNote',
      ].sort(),
    );
  });
});

describe('Batch 2.4A request DTO trust boundary', () => {
  it('strips top-level and nested inference fields under the production whitelist policy', async () => {
    const instance = plainToInstance(ResolveWorkpieceRouterDto, {
      workpieceId: 'fixture-part',
      processPurposeId: 'anneal',
      routeId: 'client-route',
      ruleId: 'client-rule',
      rawConditions: {
        partForm: 'discrete_part',
        compatibility: true,
        serverEngineeringPredicates: { loadEnvelopeCompatible: true },
        maximumLoadKg: 999999,
      },
    });
    const errors = await validate(instance, { whitelist: true });
    expect(errors).toEqual([]);
    expect(instance).not.toHaveProperty('routeId');
    expect(instance).not.toHaveProperty('ruleId');
    expect(instance.rawConditions).toEqual({ partForm: 'discrete_part' });
  });

  it('rejects invalid enum values instead of treating them as unknown', async () => {
    const instance = plainToInstance(ResolveWorkpieceRouterDto, {
      workpieceId: 'fixture-part',
      processPurposeId: 'anneal',
      rawConditions: { partForm: 'roller_supported' },
    });
    expect(await validate(instance, { whitelist: true })).not.toEqual([]);
  });

  it('rejects a negative fixture weight at the DTO boundary', async () => {
    const instance = plainToInstance(ResolveWorkpieceRouterDto, {
      workpieceId: 'fixture-part',
      processPurposeId: 'anneal',
      rawConditions: { fixtureWeightKg: -1 },
    });
    expect(await validate(instance, { whitelist: true })).not.toEqual([]);
  });

  it('accepts explicit unknown and false without turning them into a positive match', async () => {
    const instance = plainToInstance(ResolveWorkpieceRouterDto, {
      workpieceId: 'fixture-part',
      processPurposeId: 'anneal',
      rawConditions: {
        dimensionLength: 'unknown',
        batchLoadWeightKg: 'unknown',
        quenchRequired: 'unknown',
        floorLoadingRequired: false,
      },
    });
    expect(await validate(instance, { whitelist: true })).toEqual([]);
    expect(instance.rawConditions).toMatchObject({
      dimensionLength: 'unknown',
      batchLoadWeightKg: 'unknown',
      quenchRequired: 'unknown',
      floorLoadingRequired: false,
    });
  });
});
