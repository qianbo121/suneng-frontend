import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import {
  computeEngineeringCompatibility,
  inferMaterialHandling,
  inferOperationMode,
  resolveServerIndustryDirection,
  type CandidateEquipmentCapability,
  type RawEngineeringInput,
  type ServerIndustryRule,
  type SupportMethod,
} from '@/modules/workpiece-router/engineering-resolver';

const ruleData = JSON.parse(
  readFileSync(
    resolve(__dirname, '../../../../data/workpiece-router/industry-direction-rules.json'),
    'utf8',
  ),
) as {
  priorityCandidateRuleIds: string[];
  engineeringMigration: { pendingBlockedRuleIds: string[] };
  rules: ServerIndustryRule[];
};

const priorityRules = ruleData.rules.filter((rule) =>
  ruleData.priorityCandidateRuleIds.includes(rule.ruleId),
);
const priorityPairs = priorityRules.flatMap((rule) =>
  rule.allowedPairs.map((pair) => ({ rule, pair })),
);

function handlingInput(supportMethod: SupportMethod): Partial<RawEngineeringInput> {
  switch (supportMethod) {
    case 'mobile_hearth':
      return {
        loadMovement: 'stationary',
        loadingAccess: 'crane_or_forklift',
        baseSupportCondition: 'broad_base',
        floorLoadingRequired: true,
      };
    case 'fixed_fixture':
      return {
        loadMovement: 'stationary',
        loadingAccess: 'crane_or_forklift',
        baseSupportCondition: 'fixture_required',
      };
    case 'roller':
      return {
        loadMovement: 'through_process',
        loadingAccess: 'conveyor_feed',
        baseSupportCondition: 'line_contact',
        continuousContactAllowed: true,
        loadingOrientation: 'horizontal',
      };
    case 'mesh_belt':
      return {
        loadMovement: 'through_process',
        loadingAccess: 'conveyor_feed',
        baseSupportCondition: 'distributed_small_parts',
        bulkLoadingSuitable: true,
      };
    case 'tray_or_basket':
      return {
        loadMovement: 'stationary',
        loadingAccess: 'manual_or_basket',
        baseSupportCondition: 'distributed_small_parts',
        bulkLoadingSuitable: true,
      };
    case 'suspended':
      return {
        loadMovement: 'stationary',
        loadingAccess: 'crane_or_forklift',
        baseSupportCondition: 'no_base_support',
        suspensionAllowed: true,
        loadingOrientation: 'vertical',
      };
    case 'coil_stack':
      return {
        loadMovement: 'stationary',
        loadingAccess: 'crane_or_forklift',
        baseSupportCondition: 'broad_base',
        stackingAllowed: true,
        presentationState: 'coiled',
      };
  }
}

function completeInput(rule: ServerIndustryRule, pair = rule.allowedPairs[0]): RawEngineeringInput {
  const input: RawEngineeringInput = {
    workpieceId: pair.workpieceId,
    routeId: pair.routeId,
    processPurposeId: pair.processVariantId,
    dimensionsMm: { length: 2000, width: 800, height: 600 },
    weightKg: 2000,
    centerOfGravityMm: { x: 50, y: 40, z: 300 },
    supportSpanMm: 1000,
    partForm: 'discrete_part',
    loadingOrientation: 'horizontal',
    presentationState: 'single_piece',
    distortionConstraint: 'standard',
    quenchRequired: false,
    transferConstraint: 'no_special_constraint',
    batchSize: 'medium',
    targetThroughput: 'medium',
    productMix: 'high_mix',
    changeoverFrequency: 'frequent',
    cycleTimeExpectation: 'flexible',
    loadingContinuity: 'discrete',
    ...handlingInput(rule.handlingInference.expectedSupportMethod),
  };
  for (const criterion of rule.matchCriteria) {
    input[criterion.field] = criterion.allowedValues[0];
  }
  const key = `${pair.workpieceId}|${pair.routeId}|${pair.processVariantId}`;
  const pairGate = rule.pairDirectionGates?.[key];
  for (const criterion of pairGate?.matchCriteria ?? []) {
    input[criterion.field] =
      criterion.allowedValues[0] === 'true'
        ? true
        : criterion.allowedValues[0] === 'false'
          ? false
          : criterion.allowedValues[0];
  }
  const pairInputDefaults: Record<string, unknown> = {
    dimensionLength: 2000,
    shaftEquivalentSectionMm: 400,
    distortionConstraint: 'controlled',
    allowableDeflectionMm: 2,
    supportPointCount: 3,
    supportPointLayout: '三点等距支撑，跨距1000mm，面接触',
    supportSpanMm: 1000,
    singlePieceWeightKg: 1800,
    fixtureWeightKg: 200,
    batchLoadWeightKg: 2000,
    centerOfGravityX: 50,
    centerOfGravityY: 40,
    centerOfGravityZ: 300,
    temperingPurpose: '按图纸进行单独回火',
  };
  for (const field of pairGate?.requiredInputs ?? []) {
    if (input[field] === undefined) input[field] = pairInputDefaults[field] ?? true;
  }
  if (rule.operationInference.mode === 'continuous') {
    Object.assign(input, {
      batchSize: 'large',
      targetThroughput: 'high',
      productMix: 'stable',
      changeoverFrequency: 'rare',
      cycleTimeExpectation: 'tight',
      loadingContinuity: 'continuous',
    });
  } else if (!['batch', 'continuous'].includes(rule.operationInference.mode)) {
    input.treatmentScope = rule.operationInference.mode as 'local' | 'field';
  }
  if (rule.equipmentOutput.processChain.includes('quench')) {
    input.quenchRequired = true;
    input.transferConstraint = rule.equipmentOutput.processChain.includes('rapid_transfer')
      ? 'rapid'
      : 'bounded';
  }
  for (const stage of rule.requiredProcessStages) input[stage] = true;
  return input;
}

function compatibleCapability(
  rule: ServerIndustryRule,
  input: RawEngineeringInput,
): CandidateEquipmentCapability {
  return {
    capabilityId: `test:${rule.ruleId}`,
    loadEnvelopeMm: { length: 5000, width: 3000, height: 2500 },
    maximumLoadKg: 10000,
    centerOfGravityLimitsMm: {
      maximumAbsoluteX: 500,
      maximumAbsoluteY: 500,
      maximumZ: 1000,
    },
    maximumSupportSpanMm: 3000,
    supportedPartForms: [String(input.partForm)],
    supportedLoadingOrientations: [String(input.loadingOrientation)],
    supportedSupportMethods: [rule.handlingInference.expectedSupportMethod],
    acceptedLoadingAccess: [input.loadingAccess!],
    straightnessOrDistortionControl: true,
    rapidTransferCapability: true,
    supportedProcessStages: [...rule.equipmentOutput.processChain],
    largeOrHeavyThreshold: { weightKg: 1000, lengthMm: 1500 },
  };
}

describe('Batch 2.3 server engineering compatibility', () => {
  const rule = priorityRules[0];
  const input = completeInput(rule);

  it('calculates envelope, load, center of gravity and support span from raw values', () => {
    const result = computeEngineeringCompatibility(input, compatibleCapability(rule, input), {
      requiredProcessStages: rule.equipmentOutput.processChain,
    });
    expect(result).toMatchObject({
      loadEnvelopeCompatible: 'true',
      loadCapacityCompatible: 'true',
      centerOfGravityCompatible: 'true',
      supportSpanCompatible: 'true',
    });
  });

  it('keeps missing raw measurements unknown even if client sends compatibility booleans', () => {
    const untrusted = {
      ...input,
      dimensionsMm: null,
      weightKg: null,
      loadEnvelopeCompatible: true,
      loadCapacityCompatible: true,
      centerOfGravityCompatible: true,
      supportSpanCompatible: true,
    } as RawEngineeringInput;
    const result = computeEngineeringCompatibility(untrusted, compatibleCapability(rule, input), {
      requiredProcessStages: rule.equipmentOutput.processChain,
    });
    expect(result.loadEnvelopeCompatible).toBe('unknown');
    expect(result.loadCapacityCompatible).toBe('unknown');
  });

  it.each([
    ['dimensionsMm', { length: 6000, width: 800, height: 600 }, 'loadEnvelopeCompatible'],
    ['weightKg', 11000, 'loadCapacityCompatible'],
    ['centerOfGravityMm', { x: 900, y: 40, z: 300 }, 'centerOfGravityCompatible'],
    ['supportSpanMm', 3500, 'supportSpanCompatible'],
  ] as const)(
    'returns false when raw %s exceeds the candidate capability',
    (field, value, predicate) => {
      const changed = { ...input, [field]: value };
      const result = computeEngineeringCompatibility(changed, compatibleCapability(rule, input), {
        requiredProcessStages: rule.equipmentOutput.processChain,
      });
      expect(result[predicate]).toBe('false');
    },
  );
});

describe('Batch 2.3 observable material handling inference', () => {
  it('does not accept a direct supportMethod answer without observable conditions', () => {
    expect(inferMaterialHandling({ supportMethod: 'roller' } as never)).toMatchObject({
      state: 'unknown',
      supportMethod: null,
    });
  });

  it.each([
    'mobile_hearth',
    'fixed_fixture',
    'roller',
    'mesh_belt',
    'tray_or_basket',
    'suspended',
    'coil_stack',
  ] as const)(
    'derives %s only from observable movement, access and support conditions',
    (method) => {
      expect(inferMaterialHandling(handlingInput(method))).toMatchObject({
        state: 'true',
        supportMethod: method,
      });
    },
  );
});

describe('Batch 2.3 batch/continuous decision table', () => {
  it('does not let operation preference decide when six observable signals are absent', () => {
    expect(inferOperationMode({ operationPreference: 'continuous' }).state).toBe('unknown');
  });

  it('selects continuous for stable high-throughput continuous loading', () => {
    expect(
      inferOperationMode({
        batchSize: 'large',
        targetThroughput: 'high',
        productMix: 'stable',
        changeoverFrequency: 'rare',
        cycleTimeExpectation: 'tight',
        loadingContinuity: 'continuous',
      }).state,
    ).toBe('continuous');
  });

  it('selects batch for high-mix, frequent-changeover discrete loading', () => {
    expect(
      inferOperationMode({
        batchSize: 'medium',
        targetThroughput: 'medium',
        productMix: 'high_mix',
        changeoverFrequency: 'frequent',
        cycleTimeExpectation: 'flexible',
        loadingContinuity: 'discrete',
      }).state,
    ).toBe('batch');
  });

  it('sends a complete but contradictory signal set to engineering review', () => {
    expect(
      inferOperationMode({
        batchSize: 'large',
        targetThroughput: 'high',
        productMix: 'high_mix',
        changeoverFrequency: 'frequent',
        cycleTimeExpectation: 'tight',
        loadingContinuity: 'continuous',
      }).state,
    ).toBe('engineering_review');
  });
});

describe('Batch 2.3 priority pair positive controls on the server', () => {
  expect(priorityRules).toHaveLength(7);
  expect(priorityPairs).toHaveLength(35);

  for (const { rule, pair } of priorityPairs) {
    it(`${rule.ruleId} ${pair.workpieceId}|${pair.routeId}|${pair.processVariantId} has positive, unknown, false and illegal controls`, () => {
      const input = completeInput(rule, pair);
      const capability = compatibleCapability(rule, input);
      expect(resolveServerIndustryDirection(rule, input, capability)).toMatchObject({
        ruleId: rule.ruleId,
        resolutionStage: 'matched_direction',
      });

      expect(
        resolveServerIndustryDirection(rule, { ...input, dimensionsMm: null }, capability)
          ?.resolutionStage,
      ).toBe('conditional_preview');
      expect(
        resolveServerIndustryDirection(rule, input, {
          ...capability,
          maximumLoadKg: 1,
        })?.resolutionStage,
      ).toBe('engineering_review');
      expect(
        resolveServerIndustryDirection(
          rule,
          { ...input, processPurposeId: `${pair.processVariantId}-illegal` },
          capability,
        ),
      ).toBeNull();
    });
  }
});

describe('Batch 2.5.1 public direction-gate closure', () => {
  const ruleById = (ruleId: string) => ruleData.rules.find((item) => item.ruleId === ruleId)!;

  it('B251-GATE-001 keeps large-shaft horizontal loading unknown conditional and false in engineering review', () => {
    const rule = ruleById('eqdir-heavy-car-bottom-v1');
    const pair = rule.allowedPairs.find(
      (item) => item.workpieceId === 'large-forged-shaft' && item.processVariantId === 'annealing',
    )!;
    const input = completeInput(rule, pair);
    const capability = compatibleCapability(rule, input);
    expect(resolveServerIndustryDirection(rule, input, capability)?.resolutionStage).toBe(
      'matched_direction',
    );
    expect(
      resolveServerIndustryDirection(
        rule,
        { ...input, horizontalLoadingAllowed: 'unknown' },
        capability,
      )?.resolutionStage,
    ).toBe('conditional_preview');
    expect(
      resolveServerIndustryDirection(
        rule,
        { ...input, horizontalLoadingAllowed: false },
        capability,
      )?.resolutionStage,
    ).toBe('engineering_review');
  });

  it('B251-GATE-002 requires shaft geometry, deflection, support layout, total load and center of gravity', () => {
    const rule = ruleById('eqdir-heavy-car-bottom-v1');
    const pair = rule.allowedPairs.find(
      (item) =>
        item.workpieceId === 'large-forged-shaft' && item.processVariantId === 'normalizing',
    )!;
    const input = completeInput(rule, pair);
    const capability = compatibleCapability(rule, input);
    for (const field of [
      'shaftEquivalentSectionMm',
      'allowableDeflectionMm',
      'supportPointCount',
      'supportPointLayout',
      'singlePieceWeightKg',
      'fixtureWeightKg',
    ]) {
      expect(
        resolveServerIndustryDirection(rule, { ...input, [field]: 'unknown' }, capability)
          ?.resolutionStage,
      ).toBe('conditional_preview');
    }
    expect(
      resolveServerIndustryDirection(rule, input, {
        ...capability,
        maximumSupportSpanMm: 10,
      })?.resolutionStage,
    ).toBe('engineering_review');
  });

  it('B251-GATE-003 treats tempering as standalone only and rejects a full quench-temper chain', () => {
    const rule = ruleById('eqdir-heavy-car-bottom-v1');
    const pair = rule.allowedPairs.find(
      (item) => item.workpieceId === 'large-forged-flange' && item.processVariantId === 'tempering',
    )!;
    const input = completeInput(rule, pair);
    const capability = compatibleCapability(rule, input);
    expect(resolveServerIndustryDirection(rule, input, capability)?.resolutionStage).toBe(
      'matched_direction',
    );
    expect(
      resolveServerIndustryDirection(
        rule,
        { ...input, treatmentChainMode: 'quench_temper_full_chain' },
        capability,
      )?.resolutionStage,
    ).toBe('engineering_review');
  });

  it.each(['online_weld_seam', 'local_induction'])(
    'B251-GATE-004 blocks welded-pipe %s from an ordinary whole-pipe furnace direction',
    (pipeTreatmentScope) => {
      const rule = ruleById('eqdir-long-products-roller-thermal-v2');
      const pair = rule.allowedPairs.find(
        (item) => item.workpieceId === 'welded-steel-pipe' && item.processVariantId === 'annealing',
      )!;
      const input = completeInput(rule, pair);
      expect(
        resolveServerIndustryDirection(
          rule,
          { ...input, pipeTreatmentScope },
          compatibleCapability(rule, input),
        )?.resolutionStage,
      ).toBe('engineering_review');
    },
  );

  it.each(['composite', 'overlay', 'coated'])(
    'B251-GATE-005 blocks %s wear plate from the homogeneous plate quench-temper line',
    (wearPlateConstruction) => {
      const rule = ruleById('eqdir-wear-plate-quench-temper-line-v2');
      const pair = rule.allowedPairs[0];
      const input = completeInput(rule, pair);
      expect(
        resolveServerIndustryDirection(
          rule,
          { ...input, wearPlateConstruction },
          compatibleCapability(rule, input),
        )?.resolutionStage,
      ).toBe('engineering_review');
    },
  );

  it.each([
    ['fastenerMaterialClass', 'stainless_steel'],
    ['fastenerMaterialClass', 'nonferrous'],
    ['nutConstruction', 'insert'],
    ['nutConstruction', 'self_locking'],
    ['nutConstruction', 'welded_assembly'],
    ['wholeComponentQuenchTemper', false],
  ] as const)('B251-GATE-006 blocks hex-nut exclusion %s=%s', (field, value) => {
    const rule = ruleById('eqdir-fastener-mesh-quench-temper-v2');
    const pair = rule.allowedPairs.find((item) => item.workpieceId === 'hex-nuts')!;
    const input = completeInput(rule, pair);
    expect(
      resolveServerIndustryDirection(
        rule,
        { ...input, [field]: value },
        compatibleCapability(rule, input),
      )?.resolutionStage,
    ).toBe('engineering_review');
  });
});

describe('Batch 2.3 pending-blocked execution boundary', () => {
  it('keeps all 17 unapproved status changes out of internal candidates', () => {
    expect(ruleData.engineeringMigration.pendingBlockedRuleIds).toHaveLength(17);
    for (const ruleId of ruleData.engineeringMigration.pendingBlockedRuleIds) {
      const rule = ruleData.rules.find((item) => item.ruleId === ruleId)!;
      const input = completeInput(rule);
      expect(rule.internalExecutionStatus).toBe('pending_blocked');
      expect(
        resolveServerIndustryDirection(rule, input, compatibleCapability(rule, input)),
      ).toBeNull();
    }
  });

  it('keeps the normalize-temper car-bottom rule blocked without a new approval step', () => {
    const rule = ruleData.rules.find(
      (item) => item.ruleId === 'eqdir-heavy-normalize-temper-car-bottom-v2',
    )!;
    expect(rule.publicationEligibility).toBe('blocked');
    expect(rule.internalExecutionStatus).toBe('blocked');
  });
});
