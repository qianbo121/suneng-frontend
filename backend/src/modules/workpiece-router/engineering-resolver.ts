export type EngineeringTriState = 'true' | 'false' | 'unknown';

export type SupportMethod =
  | 'mobile_hearth'
  | 'fixed_fixture'
  | 'roller'
  | 'mesh_belt'
  | 'tray_or_basket'
  | 'suspended'
  | 'coil_stack';

export type ObservableHandlingInput = {
  loadMovement?: 'stationary' | 'through_process' | 'either' | 'unknown' | null;
  loadingAccess?: 'crane_or_forklift' | 'conveyor_feed' | 'manual_or_basket' | 'unknown' | null;
  baseSupportCondition?:
    | 'broad_base'
    | 'line_contact'
    | 'distributed_small_parts'
    | 'fixture_required'
    | 'no_base_support'
    | 'unknown'
    | null;
  continuousContactAllowed?: boolean | 'unknown' | null;
  floorLoadingRequired?: boolean | 'unknown' | null;
  suspensionAllowed?: boolean | 'unknown' | null;
  stackingAllowed?: boolean | 'unknown' | null;
  bulkLoadingSuitable?: boolean | 'unknown' | null;
};

export type OperationModeInput = {
  batchSize?: 'small' | 'medium' | 'large' | 'unknown' | null;
  targetThroughput?: 'low' | 'medium' | 'high' | 'unknown' | null;
  productMix?: 'stable' | 'few_variants' | 'high_mix' | 'unknown' | null;
  changeoverFrequency?: 'rare' | 'periodic' | 'frequent' | 'unknown' | null;
  cycleTimeExpectation?: 'flexible' | 'regular' | 'tight' | 'unknown' | null;
  loadingContinuity?: 'discrete' | 'intermittent' | 'continuous' | 'unknown' | null;
  operationPreference?: 'batch' | 'continuous' | 'no_preference' | 'unknown' | null;
};

export type RawEngineeringInput = ObservableHandlingInput &
  OperationModeInput & {
    workpieceId: string;
    routeId: string;
    processPurposeId: string;
    dimensionsMm?: {
      length?: number | null;
      width?: number | null;
      height?: number | null;
    } | null;
    weightKg?: number | null;
    centerOfGravityMm?: {
      x?: number | null;
      y?: number | null;
      z?: number | null;
    } | null;
    supportSpanMm?: number | null;
    shaftEquivalentSectionMm?: number | null;
    shaftSlendernessRatio?: number | null;
    allowableDeflectionMm?: number | null;
    horizontalLoadingAllowed?: boolean | 'unknown' | null;
    supportPointCount?: number | null;
    supportPointLayout?: string | null;
    partForm?: string | null;
    loadingOrientation?: string | null;
    presentationState?: string | null;
    atmosphereType?: string | null;
    surfaceObjective?: string | null;
    treatmentScope?: 'whole_component' | 'local' | 'field' | null;
    distortionConstraint?: 'strict' | 'controlled' | 'standard' | 'unknown' | null;
    quenchRequired?: boolean | 'unknown' | null;
    transferConstraint?: 'rapid' | 'bounded' | 'no_special_constraint' | 'unknown' | null;
    [key: string]: unknown;
  };

export type CandidateEquipmentCapability = {
  capabilityId: string;
  loadEnvelopeMm?: { length: number; width: number; height: number } | null;
  maximumLoadKg?: number | null;
  centerOfGravityLimitsMm?: {
    maximumAbsoluteX: number;
    maximumAbsoluteY: number;
    maximumZ: number;
  } | null;
  maximumSupportSpanMm?: number | null;
  supportedPartForms?: string[];
  supportedLoadingOrientations?: string[];
  supportedSupportMethods?: SupportMethod[];
  acceptedLoadingAccess?: Array<NonNullable<ObservableHandlingInput['loadingAccess']>>;
  straightnessOrDistortionControl?: boolean | null;
  rapidTransferCapability?: boolean | null;
  supportedProcessStages?: string[];
  largeOrHeavyThreshold?: {
    weightKg?: number | null;
    lengthMm?: number | null;
    widthMm?: number | null;
    heightMm?: number | null;
  } | null;
};

export type EngineeringCompatibility = {
  loadEnvelopeCompatible: EngineeringTriState;
  loadCapacityCompatible: EngineeringTriState;
  centerOfGravityCompatible: EngineeringTriState;
  supportSpanCompatible: EngineeringTriState;
  supportCompatible: EngineeringTriState;
  handlingPathCompatible: EngineeringTriState;
  geometryCompatible: EngineeringTriState;
  straightnessOrDistortionCompatible: EngineeringTriState;
  quenchTransferCompatible: EngineeringTriState;
  processChainCompatible: EngineeringTriState;
  largeOrHeavy: EngineeringTriState;
};

export type MaterialHandlingInference = {
  state: EngineeringTriState;
  supportMethod: SupportMethod | null;
  reason: string;
};

export type OperationModeDecision = {
  state: 'batch' | 'continuous' | 'engineering_review' | 'unknown';
  decisionTableVersion: 'operation-mode-table-2.3.0';
  reason: string;
};

type RulePair = {
  workpieceId: string;
  routeId: string;
  processVariantId: string;
};

export type ServerIndustryRule = {
  ruleId: string;
  publicationEligibility: 'conditional_public' | 'internal_only' | 'blocked';
  internalExecutionStatus: 'eligible' | 'pending_blocked' | 'blocked';
  allowedPairs: RulePair[];
  matchCriteria: Array<{
    field: string;
    allowedValues: string[];
    requiredForMatch: boolean;
  }>;
  handlingInference: {
    expectedSupportMethod: SupportMethod;
    requiredSignals: string[];
    directAnswerAccepted: false;
  };
  operationInference: {
    mode: string;
    requiredSignals: string[];
    preferenceCanDecide: false;
  };
  requiredEngineeringPredicates: Array<keyof EngineeringCompatibility>;
  requiredProcessStages: string[];
  requiredInputs: string[];
  finalSizingInputs?: string[];
  pairDirectionGates?: Record<
    string,
    {
      matchCriteria?: Array<{
        field: string;
        allowedValues: string[];
        requiredForMatch: boolean;
      }>;
      requiredInputs?: string[];
      requiredEngineeringPredicates?: Array<keyof EngineeringCompatibility>;
      requiredProcessStages?: string[];
    }
  >;
  nonMatchableAssumptions: string[];
  equipmentOutput: {
    processChain: string[];
  };
};

export type ServerDirectionResolution = {
  ruleId: string;
  resolutionStage: 'conditional_preview' | 'matched_direction' | 'engineering_review';
  operationDecision: OperationModeDecision;
  materialHandling: MaterialHandlingInference;
  engineeringPredicates: EngineeringCompatibility;
  missingInputs: string[];
  reviewInputs: string[];
  directionGate: {
    state: EngineeringTriState;
    missingInputs: string[];
    failedInputs: string[];
  };
  finalSizingInputs: string[];
};

const isConcrete = (value: unknown) =>
  value !== null && value !== undefined && value !== '' && value !== 'unknown';

const triBoolean = (value: unknown): EngineeringTriState => {
  if (value === true) return 'true';
  if (value === false) return 'false';
  return 'unknown';
};

function numericState(
  actual: unknown,
  limit: unknown,
  compare: (actualValue: number, limitValue: number) => boolean,
): EngineeringTriState {
  if (
    typeof actual !== 'number' ||
    !Number.isFinite(actual) ||
    typeof limit !== 'number' ||
    !Number.isFinite(limit)
  ) {
    return 'unknown';
  }
  if (actual < 0 || limit < 0) return 'false';
  return compare(actual, limit) ? 'true' : 'false';
}

function aggregate(states: EngineeringTriState[]): EngineeringTriState {
  if (states.includes('false')) return 'false';
  return states.every((state) => state === 'true') ? 'true' : 'unknown';
}

function exactValueState(value: unknown, allowed: readonly string[] | undefined) {
  if (!isConcrete(value) || !allowed?.length) return 'unknown';
  return allowed.includes(String(value)) ? 'true' : 'false';
}

function methodState(
  input: ObservableHandlingInput & {
    loadingOrientation?: string | null;
    presentationState?: string | null;
  },
  method: SupportMethod,
): EngineeringTriState {
  switch (method) {
    case 'mobile_hearth':
      return aggregate([
        exactValueState(input.loadMovement, ['stationary', 'either']),
        exactValueState(input.loadingAccess, ['crane_or_forklift']),
        exactValueState(input.baseSupportCondition, ['broad_base']),
        triBoolean(input.floorLoadingRequired),
      ]);
    case 'fixed_fixture':
      return aggregate([
        exactValueState(input.loadMovement, ['stationary', 'either']),
        exactValueState(input.baseSupportCondition, ['fixture_required']),
      ]);
    case 'roller':
      return aggregate([
        exactValueState(input.loadMovement, ['through_process']),
        exactValueState(input.loadingAccess, ['conveyor_feed']),
        exactValueState(input.baseSupportCondition, ['line_contact']),
        triBoolean(input.continuousContactAllowed),
      ]);
    case 'mesh_belt':
      return aggregate([
        exactValueState(input.loadMovement, ['through_process']),
        exactValueState(input.loadingAccess, ['conveyor_feed']),
        exactValueState(input.baseSupportCondition, ['distributed_small_parts']),
        triBoolean(input.bulkLoadingSuitable),
      ]);
    case 'tray_or_basket':
      return aggregate([
        exactValueState(input.loadMovement, ['stationary', 'either']),
        exactValueState(input.loadingAccess, ['manual_or_basket']),
        exactValueState(input.baseSupportCondition, ['distributed_small_parts']),
        triBoolean(input.bulkLoadingSuitable),
      ]);
    case 'suspended':
      return aggregate([
        exactValueState(input.loadMovement, ['stationary', 'either']),
        exactValueState(input.loadingAccess, ['crane_or_forklift']),
        exactValueState(input.baseSupportCondition, ['no_base_support']),
        triBoolean(input.suspensionAllowed),
        exactValueState(input.loadingOrientation, ['vertical', 'suspended']),
      ]);
    case 'coil_stack':
      return aggregate([
        exactValueState(input.loadMovement, ['stationary', 'either']),
        exactValueState(input.loadingAccess, ['crane_or_forklift']),
        exactValueState(input.baseSupportCondition, ['broad_base']),
        triBoolean(input.stackingAllowed),
        exactValueState(input.presentationState, ['coiled', 'stacked']),
      ]);
  }
}

export function inferMaterialHandling(
  input: ObservableHandlingInput & {
    loadingOrientation?: string | null;
    presentationState?: string | null;
  },
): MaterialHandlingInference {
  const states = (
    [
      'mobile_hearth',
      'fixed_fixture',
      'roller',
      'mesh_belt',
      'tray_or_basket',
      'suspended',
      'coil_stack',
    ] as const
  ).map((supportMethod) => ({ supportMethod, state: methodState(input, supportMethod) }));
  const matches = states.filter((item) => item.state === 'true');
  if (matches.length === 1) {
    return {
      state: 'true',
      supportMethod: matches[0].supportMethod,
      reason: '由客户可观察的移动、装料、接触与支撑条件唯一推导。',
    };
  }
  if (matches.length > 1) {
    return {
      state: 'false',
      supportMethod: null,
      reason: '可观察条件同时命中多种支撑方式，需工程复核。',
    };
  }
  if (states.some((item) => item.state === 'unknown')) {
    return {
      state: 'unknown',
      supportMethod: null,
      reason: '客户可观察的支撑或输送条件不完整。',
    };
  }
  return {
    state: 'false',
    supportMethod: null,
    reason: '已填条件不符合现有物料支撑决策表。',
  };
}

export function inferOperationMode(input: OperationModeInput): OperationModeDecision {
  const required = [
    input.batchSize,
    input.targetThroughput,
    input.productMix,
    input.changeoverFrequency,
    input.cycleTimeExpectation,
    input.loadingContinuity,
  ];
  if (required.some((value) => !isConcrete(value))) {
    return {
      state: 'unknown',
      decisionTableVersion: 'operation-mode-table-2.3.0',
      reason: '批量、产能、品种、换型、节拍或连续装料条件不完整。',
    };
  }

  const continuous =
    ['medium', 'large'].includes(input.batchSize!) &&
    input.targetThroughput === 'high' &&
    ['stable', 'few_variants'].includes(input.productMix!) &&
    ['rare', 'periodic'].includes(input.changeoverFrequency!) &&
    ['regular', 'tight'].includes(input.cycleTimeExpectation!) &&
    input.loadingContinuity === 'continuous';
  if (continuous) {
    return {
      state: 'continuous',
      decisionTableVersion: 'operation-mode-table-2.3.0',
      reason: '稳定或少品种、较高产能且连续装料，命中连续运行行。',
    };
  }

  const batchSignal =
    input.targetThroughput === 'low' ||
    input.productMix === 'high_mix' ||
    input.changeoverFrequency === 'frequent' ||
    input.cycleTimeExpectation === 'flexible' ||
    input.loadingContinuity === 'discrete';
  if (batchSignal && ['discrete', 'intermittent'].includes(input.loadingContinuity!)) {
    return {
      state: 'batch',
      decisionTableVersion: 'operation-mode-table-2.3.0',
      reason: '低产能、多品种、频繁换型或非连续装料，命中批次运行行。',
    };
  }

  return {
    state: 'engineering_review',
    decisionTableVersion: 'operation-mode-table-2.3.0',
    reason: '六项信号已齐全，但组合不符合唯一的批次或连续行。',
  };
}

export function computeEngineeringCompatibility(
  input: RawEngineeringInput,
  capability: CandidateEquipmentCapability,
  requirements: { requiredProcessStages: string[] },
): EngineeringCompatibility {
  const dimensions = input.dimensionsMm;
  const envelope = capability.loadEnvelopeMm;
  const loadEnvelopeCompatible = aggregate([
    numericState(dimensions?.length, envelope?.length, (actual, limit) => actual <= limit),
    numericState(dimensions?.width, envelope?.width, (actual, limit) => actual <= limit),
    numericState(dimensions?.height, envelope?.height, (actual, limit) => actual <= limit),
  ]);
  const loadCapacityCompatible = numericState(
    input.weightKg,
    capability.maximumLoadKg,
    (actual, limit) => actual <= limit,
  );
  const center = input.centerOfGravityMm;
  const centerLimits = capability.centerOfGravityLimitsMm;
  const centerOfGravityCompatible = aggregate([
    numericState(
      Math.abs(center?.x ?? Number.NaN),
      centerLimits?.maximumAbsoluteX,
      (a, b) => a <= b,
    ),
    numericState(
      Math.abs(center?.y ?? Number.NaN),
      centerLimits?.maximumAbsoluteY,
      (a, b) => a <= b,
    ),
    numericState(center?.z, centerLimits?.maximumZ, (a, b) => a <= b),
  ]);
  const supportSpanCompatible = numericState(
    input.supportSpanMm,
    capability.maximumSupportSpanMm,
    (actual, limit) => actual <= limit,
  );
  const materialHandling = inferMaterialHandling(input);
  const supportCompatible =
    materialHandling.state !== 'true'
      ? materialHandling.state
      : exactValueState(materialHandling.supportMethod, capability.supportedSupportMethods);
  const handlingPathCompatible = exactValueState(
    input.loadingAccess,
    capability.acceptedLoadingAccess,
  );
  const geometryCompatible = aggregate([
    exactValueState(input.partForm, capability.supportedPartForms),
    exactValueState(input.loadingOrientation, capability.supportedLoadingOrientations),
  ]);
  const straightnessOrDistortionCompatible = !isConcrete(input.distortionConstraint)
    ? 'unknown'
    : input.distortionConstraint === 'standard'
      ? 'true'
      : triBoolean(capability.straightnessOrDistortionControl);
  const quenchTransferCompatible =
    input.quenchRequired === false
      ? 'true'
      : input.quenchRequired !== true || !isConcrete(input.transferConstraint)
        ? 'unknown'
        : input.transferConstraint === 'rapid'
          ? triBoolean(capability.rapidTransferCapability)
          : 'true';
  const processChainCompatible = !capability.supportedProcessStages?.length
    ? 'unknown'
    : requirements.requiredProcessStages.every((stage) =>
          capability.supportedProcessStages!.includes(stage),
        )
      ? 'true'
      : 'false';
  const thresholds = capability.largeOrHeavyThreshold;
  const thresholdChecks = [
    [input.weightKg, thresholds?.weightKg],
    [dimensions?.length, thresholds?.lengthMm],
    [dimensions?.width, thresholds?.widthMm],
    [dimensions?.height, thresholds?.heightMm],
  ].filter(([, threshold]) => typeof threshold === 'number') as Array<[unknown, number]>;
  const largeOrHeavy =
    thresholdChecks.length === 0 ||
    thresholdChecks.some(([actual]) => typeof actual !== 'number' || !Number.isFinite(actual))
      ? 'unknown'
      : thresholdChecks.some(([actual, threshold]) => (actual as number) >= threshold)
        ? 'true'
        : 'false';

  return {
    loadEnvelopeCompatible,
    loadCapacityCompatible,
    centerOfGravityCompatible,
    supportSpanCompatible,
    supportCompatible,
    handlingPathCompatible,
    geometryCompatible,
    straightnessOrDistortionCompatible,
    quenchTransferCompatible,
    processChainCompatible,
    largeOrHeavy,
  };
}

function processState(input: RawEngineeringInput, field: string): EngineeringTriState {
  const value = input[field];
  if (typeof value === 'boolean' || value === 'unknown' || value == null) {
    return triBoolean(value);
  }
  return isConcrete(value) ? 'true' : 'unknown';
}

export function resolveServerIndustryDirection(
  rule: ServerIndustryRule,
  input: RawEngineeringInput,
  capability: CandidateEquipmentCapability,
): ServerDirectionResolution | null {
  if (rule.publicationEligibility === 'blocked' || rule.internalExecutionStatus !== 'eligible') {
    return null;
  }
  if (
    !rule.allowedPairs.some(
      (pair) =>
        pair.workpieceId === input.workpieceId &&
        pair.routeId === input.routeId &&
        pair.processVariantId === input.processPurposeId,
    )
  ) {
    return null;
  }

  const key = `${input.workpieceId}|${input.routeId}|${input.processPurposeId}`;
  const pairDirectionGate = rule.pairDirectionGates?.[key];
  const matchCriteria = [...rule.matchCriteria, ...(pairDirectionGate?.matchCriteria ?? [])];
  const criteria = matchCriteria.map((criterion) => ({
    field: criterion.field,
    state: exactValueState(input[criterion.field], criterion.allowedValues),
  }));

  const materialHandling = inferMaterialHandling(input);
  const materialHandlingState: EngineeringTriState =
    materialHandling.state === 'true' &&
    materialHandling.supportMethod !== rule.handlingInference.expectedSupportMethod
      ? 'false'
      : materialHandling.state;
  const operationDecision = inferOperationMode(input);
  const operationState: EngineeringTriState = ['local', 'field'].includes(
    rule.operationInference.mode,
  )
    ? !input.treatmentScope
      ? 'unknown'
      : input.treatmentScope === rule.operationInference.mode
        ? 'true'
        : 'false'
    : operationDecision.state === 'unknown'
      ? 'unknown'
      : operationDecision.state === 'engineering_review'
        ? 'false'
        : operationDecision.state === rule.operationInference.mode
          ? 'true'
          : 'false';
  const engineeringPredicates = computeEngineeringCompatibility(input, capability, {
    requiredProcessStages: rule.equipmentOutput.processChain,
  });
  const requiredEngineeringPredicates = [
    ...new Set([
      ...rule.requiredEngineeringPredicates,
      ...(pairDirectionGate?.requiredEngineeringPredicates ?? []),
    ]),
  ];
  const engineering = requiredEngineeringPredicates.map((field) => ({
    field,
    state: engineeringPredicates[field],
  }));
  const requiredProcessStages = [
    ...new Set([
      ...rule.requiredProcessStages,
      ...(pairDirectionGate?.requiredProcessStages ?? []),
    ]),
  ];
  const process = requiredProcessStages.map((field) => ({
    field,
    state: processState(input, field),
  }));
  const pairInputs = (pairDirectionGate?.requiredInputs ?? []).map((field) => ({
    field,
    state: processState(input, field),
  }));
  const evaluations = [
    ...criteria,
    { field: 'materialHandlingInference', state: materialHandlingState },
    { field: 'operationInference', state: operationState },
    ...engineering,
    ...process,
    ...pairInputs,
  ];
  const missingInputs = evaluations
    .filter((item) => item.state === 'unknown')
    .map((item) => String(item.field));
  const reviewInputs = evaluations
    .filter((item) => item.state === 'false')
    .map((item) => String(item.field));
  const resolutionStage =
    reviewInputs.length > 0 || rule.nonMatchableAssumptions.length > 0
      ? 'engineering_review'
      : missingInputs.length > 0
        ? 'conditional_preview'
        : 'matched_direction';
  const directionGateState: EngineeringTriState =
    reviewInputs.length > 0 || rule.nonMatchableAssumptions.length > 0
      ? 'false'
      : missingInputs.length > 0
        ? 'unknown'
        : 'true';

  return {
    ruleId: rule.ruleId,
    resolutionStage,
    operationDecision,
    materialHandling,
    engineeringPredicates,
    missingInputs,
    reviewInputs,
    directionGate: {
      state: directionGateState,
      missingInputs,
      failedInputs: reviewInputs,
    },
    finalSizingInputs: rule.finalSizingInputs ?? [],
  };
}
