import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dataDir = join(root, 'data/workpiece-router');
const baselineVersion = 'industry-baseline-2026-08-batch2.2-draft';
const resolverVersion = 'workpiece-router-resolver-2.2.0';
const taxonomyEvidenceId = 'tech-us-doe-process-heating-sourcebook3-2015';

const readJson = (name) => JSON.parse(readFileSync(join(dataDir, name), 'utf8'));
const writeJson = (name, value) =>
  writeFileSync(join(dataDir, name), `${JSON.stringify(value, null, 2)}\n`);

function canonicalize(value) {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, canonicalize(value[key])]),
    );
  }
  return value;
}

function canonicalHash(value) {
  return `sha256:${createHash('sha256')
    .update(JSON.stringify(canonicalize(value)))
    .digest('hex')}`;
}

const ontology = {
  schemaVersion: '2.2.0',
  triStateValues: [true, false, 'unknown'],
  identityInputs: ['workpieceId', 'routeId', 'processPurposeId'],
  independentAxes: {
    partForm: ['discrete_part', 'plate', 'long_product', 'coil', 'strip', 'irregular_assembly'],
    loadingOrientation: ['horizontal', 'vertical', 'flat', 'suspended'],
    supportMethod: ['mobile_hearth', 'fixed_fixture', 'roller', 'mesh_belt', 'tray_or_basket', 'suspended', 'coil_stack'],
    presentationState: ['coiled', 'uncoiled', 'stacked', 'single_piece', 'bulk_loaded'],
    atmosphereType: ['air', 'inert', 'reducing', 'protective', 'controlled_carbon_potential', 'controlled_carbon_nitrogen_potential'],
    surfaceObjective: ['normal', 'low_oxidation', 'bright', 'scale_controlled'],
  },
  quenchAndCoolingInputs: {
    quenchRequired: { type: 'tri_state' },
    quenchMedium: { values: ['water', 'oil', 'polymer', 'gas', 'air', 'other', 'unknown'] },
    transferConstraint: { values: ['rapid', 'bounded', 'no_special_constraint', 'unknown'] },
    coolingRateRequirement: { values: ['rapid', 'controlled', 'slow', 'process_defined', 'unknown'] },
    agitationOrFlowRequirement: { values: ['required', 'not_required', 'process_defined', 'unknown'] },
    distortionConstraint: { values: ['strict', 'controlled', 'standard', 'unknown'] },
    integrationPreference: {
      values: ['integrated', 'separate', 'no_preference', 'unknown'],
      evidenceRole: 'preference_only',
    },
  },
  processStageInputs: {
    quench_temper: ['austenitizing', 'transfer', 'quench', 'cleaning_if_required', 'tempering', 'final_cooling'],
    quench_temper_requiredForMatch: ['austenitizing', 'transfer', 'quench', 'tempering', 'final_cooling'],
    solution_quench: ['solution_heating', 'rapid_transfer', 'rapid_cooling'],
    solution_quench_requiredForMatch: ['solution_heating', 'rapid_transfer', 'rapid_cooling'],
  },
  operationInferenceInputs: {
    batchSize: ['small', 'medium', 'large', 'unknown'],
    targetThroughput: ['low', 'medium', 'high', 'unknown'],
    productMix: ['stable', 'few_variants', 'high_mix', 'unknown'],
    changeoverFrequency: ['rare', 'periodic', 'frequent', 'unknown'],
    cycleTimeExpectation: ['flexible', 'regular', 'tight', 'unknown'],
    loadingContinuity: ['discrete', 'intermittent', 'continuous', 'unknown'],
    operationPreference: {
      values: ['batch', 'continuous', 'no_preference', 'unknown'],
      evidenceRole: 'preference_only',
    },
  },
  serverDerivedEngineeringPredicates: [
    'loadEnvelopeCompatible',
    'loadCapacityCompatible',
    'supportCompatible',
    'handlingPathCompatible',
    'geometryCompatible',
    'straightnessOrDistortionCompatible',
    'quenchTransferCompatible',
    'processChainCompatible',
    'largeOrHeavy',
  ],
  forbiddenLegacyValues: [
    'coil',
    'strip',
    'roller_supported',
    'fixture_supported',
    'bright',
    'controlled_process_atmosphere',
    'quench_system_integrated',
    'rapid_cooling_integrated',
  ],
};

const publicClaimTemplates = {
  schemaVersion: '1.0.0',
  templateVersion: 'workpiece-router-public-claims-2.2.0',
  templates: {
    conditional_preview:
      '如果符合以下工况，行业常见设备方向可考虑“{equipmentLabel}”：{conditionSummary}。仍需工程复核，不构成最终选型或苏能供货承诺。',
    matched_direction:
      '根据已确认的工件、工艺和工程兼容性条件，行业常见设备方向为“{equipmentLabel}”。仍需结合项目参数完成最终选型，不代表苏能已确认可提供。',
    engineering_review:
      '当前输入存在不兼容项或仍有关键工程条件待复核，暂不形成设备方向。请补充或复核：{reviewSummary}。',
  },
};

const publicLabelMapping = {
  schemaVersion: '2.2.0',
  mappingVersion: 'workpiece-router-public-labels-2.2.0',
  architectureLabels: {
    car_bottom: '台车式',
    vertical_pit: '立式或井式',
    fixed_hearth_chamber: '固定炉底室式',
    local_heating_arrangement: '局部焊后热处理',
    field_heating_arrangement: '现场焊后热处理',
    continuous_line: '连续式热处理',
    generic_quench_temper_line: '连续式调质热处理',
    controlled_atmosphere_continuous: '可控工艺气氛连续式',
    controlled_atmosphere_batch: '可控工艺气氛周期式',
    roller_hearth: '辊底式',
    solution_quench_system: '固溶淬火',
    batch_solution_system: '周期式固溶处理',
    protective_atmosphere_batch: '保护气氛周期式',
    continuous_solution_line: '连续式固溶处理',
    bell: '罩式',
    continuous_strip_line: '带材连续处理',
    mesh_belt: '网带式',
    conveyor: '输送式',
  },
  combinationOverrides: {
    'batch|car_bottom|thermal': '台车式周期炉',
    'batch|car_bottom|stress_relief': '台车式去应力处理炉',
    'batch|car_bottom|pwht': '台车式整件焊后热处理炉',
    'batch|car_bottom|quench_temper': '台车式调质热处理系统',
    'batch|car_bottom|hydrogen_relief': '台车式去氢处理炉',
    'batch|car_bottom|ductile_iron_thermal': '台车式大型球铁件退火或正火炉',
    'batch|car_bottom|normalize_temper': '台车式正火加回火热处理系统',
    'batch|vertical_pit|thermal': '立式或井式周期炉',
    'batch|vertical_pit|stress_relief': '立式或井式去应力处理炉',
    'batch|vertical_pit|pwht': '立式或井式整件焊后热处理炉',
    'batch|vertical_pit|quench_temper': '立式或井式调质热处理系统',
    'batch|fixed_hearth_chamber|thermal': '固定炉底室式周期炉',
    'continuous|continuous_line|thermal': '连续式热处理线',
    'continuous|roller_hearth|thermal': '辊底式连续热处理炉/线',
    'continuous|roller_hearth|quench_temper': '辊底式连续调质热处理线',
    'continuous|mesh_belt|quench_temper': '网带式调质热处理线',
    'batch|bell|thermal': '罩式周期炉',
    'continuous|continuous_strip_line|thermal': '带材连续处理线',
    'continuous|controlled_atmosphere_continuous|carburizing': '可控工艺气氛连续式炉/线',
    'batch|controlled_atmosphere_batch|carburizing': '可控工艺气氛周期式炉',
    'batch|solution_quench_system|solution_quench': '固溶淬火系统',
    'batch|batch_solution_system|solution_quench': '周期式固溶淬火系统',
    'continuous|continuous_solution_line|solution_quench': '连续式固溶淬火线',
    'batch|protective_atmosphere_batch|solution_quench': '保护气氛周期式固溶处理系统',
    'continuous|conveyor|stress_relief': '输送式去应力处理炉/线',
    'batch|fixed_hearth_chamber|stress_relief': '固定炉底室式去应力处理炉',
    'continuous|conveyor|quench_temper': '输送式调质热处理线',
    'batch|fixed_hearth_chamber|quench_temper': '周期式调质热处理系统',
    'continuous|generic_quench_temper_line|quench_temper': '连续式调质热处理线',
    'local|local_heating_arrangement|pwht': '局部焊后热处理系统',
    'field|field_heating_arrangement|pwht': '现场焊后热处理系统',
  },
};

const priorityCandidates = new Set([
  'eqdir-heavy-car-bottom-v1',
  'eqdir-wear-plate-quench-temper-line-v2',
  'eqdir-carbon-steel-coil-bell-batch-v2',
  'eqdir-long-products-roller-thermal-v2',
  'eqdir-long-products-roller-quench-temper-v2',
  'eqdir-wire-coil-bell-v1',
  'eqdir-fastener-mesh-quench-temper-v2',
]);
const highRiskBlocked = new Set([
  'eqdir-welded-vertical-v1',
  'eqdir-welded-pwht-whole-vertical-v2',
  'eqdir-heavy-vertical-v1',
  'eqdir-shaft-quench-temper-line-v2',
  'eqdir-large-gear-continuous-thermal-v2',
  'eqdir-large-gear-quench-temper-line-v2',
  'eqdir-undercarriage-car-bottom-thermal-v2',
  'eqdir-undercarriage-continuous-quench-temper-v2',
  'eqdir-undercarriage-car-bottom-quench-temper-v2',
  'eqdir-steel-plate-batch-thermal-v2',
  'eqdir-aluminum-plate-solution-quench-v2',
  'eqdir-stainless-protective-batch-v1',
  'eqdir-aluminum-coil-bell-batch-v2',
  'eqdir-long-products-vertical-thermal-v2',
  'eqdir-long-products-vertical-quench-temper-v2',
  'eqdir-wire-coil-vertical-v1',
  'eqdir-small-spring-quench-temper-continuous-v2',
]);
const candidateEvidenceByRule = {
  'eqdir-heavy-car-bottom-v1': 'candidate-appmap-heavy-car-bottom',
  'eqdir-wear-plate-quench-temper-line-v2': 'candidate-appmap-wear-plate-quench-temper',
  'eqdir-carbon-steel-coil-bell-batch-v2': 'candidate-appmap-carbon-steel-coil-bell',
  'eqdir-long-products-roller-thermal-v2': 'candidate-appmap-long-products-roller-thermal',
  'eqdir-long-products-roller-quench-temper-v2': 'candidate-appmap-long-products-roller-quench-temper',
  'eqdir-wire-coil-bell-v1': 'candidate-appmap-wire-coil-bell',
  'eqdir-fastener-mesh-quench-temper-v2': 'candidate-appmap-fastener-mesh-quench-temper',
};

function pairKey(pair) {
  return `${pair.workpieceId}|${pair.routeId}|${pair.processVariantId}`;
}

function criterion(field, allowedValues) {
  return { field, operator: 'in', allowedValues, requiredForMatch: true };
}

function processChainProfile(chain) {
  if (chain.includes('solution_heating')) return 'solution_quench';
  if (chain.includes('austenitizing') && chain.includes('quench')) return 'quench_temper';
  if (chain.includes('controlled_atmosphere_heating')) return 'carburizing';
  if (chain.some((item) => item.includes('pwht'))) return 'pwht';
  if (chain.includes('stress_relief')) return 'stress_relief';
  return 'thermal';
}

function sanitizeArchitecture(value) {
  const mapping = {
    vertical_or_pit: 'vertical_pit',
    car_bottom_or_fixed_hearth_chamber: 'car_bottom',
    fixed_hearth_or_car_bottom_chamber: 'fixed_hearth_chamber',
    quench_temper_line: 'generic_quench_temper_line',
    controlled_atmosphere_continuous_line: 'controlled_atmosphere_continuous',
    roller_hearth_quench_temper_line: 'roller_hearth',
    roller_hearth_continuous: 'roller_hearth',
    batch_chamber_quench_temper_system: 'fixed_hearth_chamber',
    fixed_hearth_batch_chamber: 'fixed_hearth_chamber',
    conveyor_continuous: 'conveyor',
    conveyor_quench_temper_line: 'conveyor',
    mesh_belt_quench_temper_line: 'mesh_belt',
  };
  return mapping[value] ?? value;
}

function partFormFor(rule) {
  if (rule.logicUnitId === 'welded_batch') return 'irregular_assembly';
  if (rule.logicUnitId === 'plate_batch' || rule.logicUnitId === 'stainless_plate_solution') return 'plate';
  if (rule.logicUnitId === 'strip_coil_professional') {
    return rule.ruleId.includes('strip') ? 'strip' : 'coil';
  }
  if (rule.logicUnitId === 'coiled_wire') return 'coil';
  if (rule.logicUnitId === 'long_products' || rule.ruleId.includes('shaft')) return 'long_product';
  return 'discrete_part';
}

function axesFor(rule, architecture) {
  const criteria = [criterion('partForm', [partFormFor(rule)])];
  if (architecture === 'car_bottom') criteria.push(criterion('supportMethod', ['mobile_hearth']));
  else if (architecture === 'roller_hearth') {
    criteria.push(criterion('loadingOrientation', ['horizontal', 'flat']));
    criteria.push(criterion('supportMethod', ['roller']));
  } else if (architecture === 'mesh_belt' || architecture === 'conveyor') {
    criteria.push(criterion('supportMethod', ['mesh_belt']));
  } else if (architecture === 'bell') {
    criteria.push(criterion('loadingOrientation', ['vertical']));
    criteria.push(criterion('supportMethod', ['coil_stack']));
  } else if (architecture === 'vertical_pit') {
    criteria.push(criterion('loadingOrientation', ['vertical', 'suspended']));
    criteria.push(criterion('supportMethod', ['suspended']));
  } else if (['fixed_hearth_chamber', 'batch_solution_system', 'protective_atmosphere_batch'].includes(architecture)) {
    criteria.push(criterion('supportMethod', rule.logicUnitId === 'fastener_continuous' ? ['tray_or_basket'] : ['fixed_fixture']));
  }

  const form = partFormFor(rule);
  if (form === 'coil') criteria.push(criterion('presentationState', ['coiled', 'stacked']));
  else if (form === 'strip') criteria.push(criterion('presentationState', ['uncoiled']));
  else if (['fastener_continuous', 'small_spring_continuous'].includes(rule.logicUnitId)) {
    criteria.push(criterion('presentationState', ['bulk_loaded']));
  } else criteria.push(criterion('presentationState', ['single_piece']));

  const oldScope = rule.matchCriteria.find((item) => item.field === 'treatmentScope');
  if (oldScope) criteria.push(criterion('treatmentScope', oldScope.allowedValues));

  if (rule.logicUnitId === 'carburizing_controlled_atmosphere') {
    criteria.push(
      criterion('atmosphereType', [
        'controlled_carbon_potential',
        'controlled_carbon_nitrogen_potential',
      ]),
    );
    criteria.push(criterion('surfaceObjective', ['normal', 'scale_controlled']));
  } else if (architecture === 'bell' || architecture === 'protective_atmosphere_batch') {
    criteria.push(criterion('atmosphereType', ['inert', 'reducing', 'protective']));
    criteria.push(criterion('surfaceObjective', ['normal', 'low_oxidation', 'bright']));
  }
  return criteria;
}

function operationInference(operationMode) {
  if (!['batch', 'continuous'].includes(operationMode)) {
    return { mode: operationMode, requiredSignals: [], preferenceInput: 'operationPreference', preferenceCanDecide: false };
  }
  return {
    mode: operationMode,
    requiredSignals: [
      'batchSize',
      'targetThroughput',
      'productMix',
      'changeoverFrequency',
      'cycleTimeExpectation',
      'loadingContinuity',
    ],
    preferenceInput: 'operationPreference',
    preferenceCanDecide: false,
  };
}

function engineeringPredicatesFor(rule, architecture, profile) {
  const predicates = [
    'loadEnvelopeCompatible',
    'loadCapacityCompatible',
    'supportCompatible',
    'handlingPathCompatible',
    'geometryCompatible',
    'processChainCompatible',
  ];
  if (
    ['plate', 'long_product'].includes(partFormFor(rule)) ||
    architecture === 'vertical_pit' ||
    architecture === 'roller_hearth'
  ) predicates.push('straightnessOrDistortionCompatible');
  if (['quench_temper', 'solution_quench'].includes(profile)) {
    predicates.push('quenchTransferCompatible');
  }
  return [...new Set(predicates)];
}

function normalizeProcessChain(chain) {
  if (chain.includes('austenitizing')) {
    return ['austenitizing', 'transfer', 'quench', 'cleaning_if_required', 'tempering', 'final_cooling'];
  }
  if (chain.includes('solution_heating')) {
    return ['solution_heating', 'rapid_transfer', 'rapid_cooling'];
  }
  if (chain.includes('controlled_process_atmosphere_heating')) {
    return ['controlled_atmosphere_heating', 'diffusion', 'transfer', 'quench', 'tempering_if_required', 'final_cooling'];
  }
  return [...chain];
}

function processStageRequirements(profile) {
  if (profile === 'quench_temper') {
    return ['austenitizing', 'transfer', 'quench', 'tempering', 'final_cooling'];
  }
  if (profile === 'solution_quench') {
    return ['solution_heating', 'rapid_transfer', 'rapid_cooling'];
  }
  return [];
}

function publicLabelKey(output) {
  return `${output.operationMode}|${output.furnaceArchitecture}|${output.processChainProfile}`;
}

const existingRulesData = readJson('industry-direction-rules.json');
const derivedHeavyRuleIds = new Set([
  'eqdir-heavy-hydrogen-relief-car-bottom-v2',
  'eqdir-heavy-ductile-iron-car-bottom-v2',
  'eqdir-heavy-normalize-temper-car-bottom-v2',
]);
const uniqueExistingRules = [...new Map(
  existingRulesData.rules
    .sort((left, right) => left.allowedPairs.length - right.allowedPairs.length)
    .map((rule) => [rule.ruleId, rule]),
).values()];
let sourceRules = uniqueExistingRules;
let sourceBaselineVersion = existingRulesData.baselineVersion;
if (existingRulesData.schemaVersion === '2.2.0') {
  const heavyParts = uniqueExistingRules.filter((rule) =>
    rule.ruleId === 'eqdir-heavy-car-bottom-v1' || derivedHeavyRuleIds.has(rule.ruleId),
  );
  const heavySource = structuredClone(
    uniqueExistingRules.find((rule) => rule.ruleId === 'eqdir-heavy-car-bottom-v1'),
  );
  heavySource.allowedPairs = [...new Map(
    heavyParts.flatMap((rule) => rule.allowedPairs).map((pair) => [pairKey(pair), pair]),
  ).values()];
  heavySource.sourceRuleIds = ['eqdir-heavy-car-bottom-v1'];
  sourceRules = uniqueExistingRules
    .filter((rule) => !derivedHeavyRuleIds.has(rule.ruleId))
    .map((rule) => rule.ruleId === heavySource.ruleId ? heavySource : rule);
  sourceBaselineVersion = existingRulesData.migration?.sourceBaselineVersion ?? 'industry-baseline-2026-08-batch2.1-draft';
  if (sourceBaselineVersion === baselineVersion) {
    sourceBaselineVersion = 'industry-baseline-2026-08-batch2.1-draft';
  }
}
const originalRuleIds = sourceRules.map((rule) => rule.ruleId);

function transformRule(source) {
  const rule = structuredClone(source);
  rule.baselineVersion = baselineVersion;
  rule.sourceRuleIds = [source.ruleId];
  rule.publicationEligibility = highRiskBlocked.has(rule.ruleId)
    ? 'blocked'
    : 'internal_only';

  const operationMode =
    source.equipmentOutput.operationMode === 'batch_or_continuous'
      ? 'batch'
      : source.equipmentOutput.operationMode;
  const architecture = sanitizeArchitecture(source.equipmentOutput.furnaceArchitecture);
  const processChain = normalizeProcessChain(source.equipmentOutput.processChain);
  const profile = processChainProfile(processChain);
  rule.equipmentOutput = {
    operationMode,
    furnaceArchitecture: architecture,
    materialHandling: {
      supportMethod: axesFor(rule, architecture).find((item) => item.field === 'supportMethod')?.allowedValues[0] ?? 'fixed_fixture',
      loadingOrientation: axesFor(rule, architecture).find((item) => item.field === 'loadingOrientation')?.allowedValues[0] ?? null,
      presentationState: axesFor(rule, architecture).find((item) => item.field === 'presentationState')?.allowedValues[0] ?? 'single_piece',
    },
    atmosphereCapability: {
      atmosphereTypes:
        rule.logicUnitId === 'carburizing_controlled_atmosphere'
          ? ['controlled_carbon_potential', 'controlled_carbon_nitrogen_potential']
          : architecture === 'bell' || architecture === 'protective_atmosphere_batch'
            ? ['inert', 'reducing', 'protective']
            : ['air'],
      surfaceObjectives:
        architecture === 'bell' || architecture === 'protective_atmosphere_batch'
          ? ['normal', 'low_oxidation', 'bright']
          : ['normal'],
    },
    processChainProfile: profile,
    processChain,
    coolingIntegration:
      profile === 'quench_temper'
        ? 'quench_process_required'
        : profile === 'solution_quench'
          ? 'rapid_cooling_process_required'
          : 'process_defined',
  };
  rule.matchCriteria = axesFor(rule, architecture);
  rule.operationInference = operationInference(operationMode);
  rule.requiredProcessStages = processStageRequirements(profile);
  rule.requiredEngineeringPredicates = engineeringPredicatesFor(rule, architecture, profile);
  rule.assumptionPolicies = rule.assumptions.map((text) => ({
    text,
    disposition: 'required_engineering_predicates',
    predicateIds: [...rule.requiredEngineeringPredicates],
  }));
  rule.nonMatchableAssumptions = [];
  rule.requiredInputs = [
    ...rule.matchCriteria.map((item) => item.field),
    ...rule.operationInference.requiredSignals,
    ...rule.requiredEngineeringPredicates,
    ...rule.requiredProcessStages,
  ];
  if (profile === 'quench_temper') {
    rule.requiredInputs.push(
      'quenchRequired',
      'quenchMedium',
      'transferConstraint',
      'coolingRateRequirement',
      'agitationOrFlowRequirement',
      'distortionConstraint',
    );
  }
  if (profile === 'solution_quench') {
    rule.requiredInputs.push(
      'quenchRequired',
      'transferConstraint',
      'coolingRateRequirement',
      'distortionConstraint',
    );
  }
  rule.requiredInputs = [...new Set(rule.requiredInputs)];
  rule.conditions = [
    ...rule.matchCriteria.map((item) => `${item.field}必须属于：${item.allowedValues.join('、')}`),
    ...(rule.operationInference.requiredSignals.length > 0
      ? [`${rule.operationInference.requiredSignals.join('、')}必须共同推导为${operationMode}`]
      : [`treatmentScope必须为${operationMode}`]),
    ...rule.requiredEngineeringPredicates.map((item) => `${item}必须明确为true`),
    ...rule.requiredProcessStages.map((item) => `${item}必须明确为true`),
    ...(profile === 'quench_temper'
      ? ['quenchRequired必须为true，淬火介质、转移、冷却速率、流动和变形约束必须明确']
      : profile === 'solution_quench'
        ? ['quenchRequired必须为true，快速转移、快速冷却和变形约束必须明确']
        : []),
  ];
  delete rule.publicLabelKey;
  rule.publicLabelDerivationKey = publicLabelKey(rule.equipmentOutput);
  const candidateEvidenceId = candidateEvidenceByRule[rule.ruleId];
  rule.candidateEvidenceRefs = candidateEvidenceId ? [candidateEvidenceId] : [];
  rule.pairEvidence = Object.fromEntries(
    rule.allowedPairs.map((pair) => [
      pairKey(pair),
      {
        taxonomyRefs: [taxonomyEvidenceId],
        applicationMappingRefs: candidateEvidenceId ? [candidateEvidenceId] : [],
        processBoundaryRefs: [],
        normativeStandardRefs: [],
        companyCapabilityRefs: [],
      },
    ]),
  );
  rule.priorityDetail = {
    logicUnitId: rule.logicUnitId,
    priority: rule.priority,
    tieBreaker: rule.ruleId,
    rationale: priorityCandidates.has(rule.ruleId)
      ? '第2.2批首批工程语义候选，仍保持internal_only等待负责人复核'
      : highRiskBlocked.has(rule.ruleId)
        ? '第2.2批指定高风险规则，完成重写前保持blocked'
        : '沿用第2.1批稳定顺序，未取得公开资格',
  };
  rule.derivedFrom = [
    ...rule.allowedPairs.map((pair) => `pair:${pairKey(pair)}`),
    ...rule.matchCriteria.map((item) => `axis:${item.field}:${item.allowedValues.join('|')}`),
    ...rule.requiredEngineeringPredicates.map((item) => `engineering:${item}`),
    `operation-inference:${operationMode}`,
    `evidence:${taxonomyEvidenceId}`,
  ];
  return rule;
}

let rules = sourceRules.map(transformRule);
const heavyIndex = rules.findIndex((rule) => rule.ruleId === 'eqdir-heavy-car-bottom-v1');
const heavySource = rules[heavyIndex];
const steelConventional = heavySource.allowedPairs.filter(
  (pair) =>
    pair.routeId === 'heavy-steel-normalize-temper-anneal' &&
    ['annealing', 'normalizing', 'tempering'].includes(pair.processVariantId),
);
const normalizeTemper = heavySource.allowedPairs.filter(
  (pair) => pair.processVariantId === 'normalize-temper',
);
const hydrogenRelief = heavySource.allowedPairs.filter(
  (pair) => pair.routeId === 'heavy-forging-hydrogen-relief',
);
const ductileIron = heavySource.allowedPairs.filter(
  (pair) => pair.routeId === 'ductile-iron-anneal-normalize',
);

function splitHeavy(ruleId, allowedPairs, profile, priority, blocked = false) {
  const rule = structuredClone(heavySource);
  rule.ruleId = ruleId;
  rule.allowedPairs = allowedPairs;
  rule.priority = priority;
  rule.equipmentOutput.processChainProfile = profile;
  rule.equipmentOutput.processChain = [profile];
  rule.publicationEligibility = blocked ? 'blocked' : 'internal_only';
  rule.publicLabelDerivationKey = publicLabelKey(rule.equipmentOutput);
  rule.priorityDetail.priority = priority;
  rule.priorityDetail.tieBreaker = ruleId;
  rule.priorityDetail.rationale = blocked
    ? '复合工艺链尚未完成专项重写，保持blocked'
    : '大型重载台车式候选已按材料和处理目的拆分，等待负责人复核';
  rule.requiredEngineeringPredicates = engineeringPredicatesFor(
    rule,
    rule.equipmentOutput.furnaceArchitecture,
    profile,
  );
  if (ruleId.includes('ductile')) {
    rule.requiredEngineeringPredicates.push('largeOrHeavy');
  }
  rule.requiredEngineeringPredicates = [...new Set(rule.requiredEngineeringPredicates)];
  rule.assumptionPolicies = rule.assumptions.map((text) => ({
    text,
    disposition: 'required_engineering_predicates',
    predicateIds: [...rule.requiredEngineeringPredicates],
  }));
  rule.requiredInputs = [
    ...rule.matchCriteria.map((item) => item.field),
    ...rule.operationInference.requiredSignals,
    ...rule.requiredEngineeringPredicates,
  ];
  rule.conditions = [
    ...rule.matchCriteria.map((item) => `${item.field}必须属于：${item.allowedValues.join('、')}`),
    `${rule.operationInference.requiredSignals.join('、')}必须共同推导为batch`,
    ...rule.requiredEngineeringPredicates.map((item) => `${item}必须明确为true`),
  ];
  const appEvidence = candidateEvidenceByRule['eqdir-heavy-car-bottom-v1'];
  rule.candidateEvidenceRefs = [appEvidence];
  rule.pairEvidence = Object.fromEntries(
    allowedPairs.map((pair) => [
      pairKey(pair),
      {
        taxonomyRefs: [taxonomyEvidenceId],
        applicationMappingRefs: [appEvidence],
        processBoundaryRefs: [],
        normativeStandardRefs: [],
        companyCapabilityRefs: [],
      },
    ]),
  );
  rule.derivedFrom = [
    ...allowedPairs.map((pair) => `pair:${pairKey(pair)}`),
    ...rule.matchCriteria.map((item) => `axis:${item.field}:${item.allowedValues.join('|')}`),
    ...rule.requiredEngineeringPredicates.map((item) => `engineering:${item}`),
    'operation-inference:batch',
    `evidence:${taxonomyEvidenceId}`,
  ];
  return rule;
}

rules.splice(
  heavyIndex,
  1,
  splitHeavy('eqdir-heavy-car-bottom-v1', steelConventional, 'thermal', 10),
  splitHeavy('eqdir-heavy-hydrogen-relief-car-bottom-v2', hydrogenRelief, 'hydrogen_relief', 11),
  splitHeavy('eqdir-heavy-ductile-iron-car-bottom-v2', ductileIron, 'ductile_iron_thermal', 12),
  splitHeavy('eqdir-heavy-normalize-temper-car-bottom-v2', normalizeTemper, 'normalize_temper', 13, true),
);

const originalRuleStatuses = originalRuleIds.map((sourceRuleId) => ({
  sourceRuleId,
  resultingRuleIds: rules
    .filter((rule) => rule.sourceRuleIds.includes(sourceRuleId))
    .map((rule) => rule.ruleId),
  publicationEligibility:
    sourceRuleId === 'eqdir-heavy-car-bottom-v1'
      ? 'internal_only'
      : rules.find((rule) => rule.ruleId === sourceRuleId)?.publicationEligibility ?? 'blocked',
}));

const rulesData = {
  schemaVersion: '2.2.0',
  baselineVersion,
  resolverVersion,
  migration: {
    sourceBaselineVersion,
    originalRuleCount: originalRuleIds.length,
    resultingRuleCount: rules.length,
    originalRuleStatuses,
  },
  policy: {
    claimLevel: 'equipment_direction',
    maxPublicDirections: 3,
    deterministic: true,
    triStateConditions: true,
    unknownCannotMatch: true,
    providedDoesNotMeanCompatible: true,
    customerPreferenceCannotProveOperationMode: true,
    metadataOnlyCannotQualify: true,
    taxonomyReferenceCannotProveApplicationMapping: true,
    partiallyVerifiedCannotAutoQualify: true,
    numericParametersAllowed: false,
    companyCapabilityIndependent: true,
    publicEligibilityCount: 0,
  },
  excludedRouteIds: existingRulesData.excludedRouteIds,
  priorityCandidateRuleIds: [...priorityCandidates],
  highRiskBlockedRuleIds: [...highRiskBlocked],
  rules,
};

const evidenceData = readJson('industry-evidence-registry.json');
for (const evidence of evidenceData.evidence) {
  evidence.evidenceType =
    evidence.evidenceId.startsWith('tech-us-doe')
      ? 'taxonomy_reference'
      : 'normative_standard';
}
const candidateEvidence = [
  ['candidate-appmap-heavy-car-bottom', '大型钢锻件、铸钢件及大型球铁件与台车式设备应用对应资料'],
  ['candidate-appmap-wear-plate-quench-temper', '耐磨板辊底式调质线应用对应资料'],
  ['candidate-appmap-carbon-steel-coil-bell', '碳钢卷罩式退火应用对应资料'],
  ['candidate-appmap-long-products-roller-thermal', '钢管、棒材及型材辊底式热处理应用对应资料'],
  ['candidate-appmap-long-products-roller-quench-temper', '长材辊底式调质线应用对应资料'],
  ['candidate-appmap-wire-coil-bell', '盘条或钢丝卷罩式退火应用对应资料'],
  ['candidate-appmap-fastener-mesh-quench-temper', '紧固件网带式调质线应用对应资料'],
].map(([evidenceId, standardTitle]) => ({
  evidenceId,
  standardNumber: '待核实OEM一手资料',
  standardTitle,
  issuingBody: '待确定',
  versionOrYear: '待确定',
  status: 'unverified',
  evidenceRole: 'candidate_application_mapping',
  evidenceType: 'application_mapping',
  publishDate: null,
  effectiveDate: null,
  replacedDate: null,
  transitionEndDate: null,
  successorEvidenceId: null,
  officialUrl: null,
  accessLevel: 'metadata_only',
  verificationStatus: 'unverified',
  clauseRefs: [],
  pageRefs: [],
  supportedClaimLevels: [],
  supportScope: '仅计划用于核实工件类别与设备应用对应关系；不得支撑温度、时间、转移秒数、其他数值参数或苏能制造能力。',
  notes: '第2.2批只登记证据缺口，不把未核实候选资料作为公开资格。',
}));
evidenceData.schemaVersion = '2.2.0';
evidenceData.policy.evidenceTypes = {
  taxonomy_reference: '只支持通用设备分类。',
  application_mapping: '支持工件或应用与设备类别的对应关系，不支持具体工艺数值或企业能力。',
  process_boundary: '支持定性工艺边界和必需工艺阶段。',
  normative_standard: '按访问和核验等级支持标准规定范围。',
  company_capability: '只支持经授权的苏能能力主张。',
};
evidenceData.evidence = [
  ...evidenceData.evidence.filter(
    (item) => !item.evidenceId.startsWith('candidate-appmap-'),
  ),
  ...candidateEvidence,
];

writeJson('industry-input-ontology.json', ontology);
writeJson('industry-public-claim-templates.json', publicClaimTemplates);
writeJson('industry-public-label-mapping.json', publicLabelMapping);
writeJson('industry-direction-rules.json', rulesData);
writeJson('industry-evidence-registry.json', evidenceData);
writeJson('industry-public-direction-snapshot.json', {
  schemaVersion: '2.2.0',
  publicBaselineVersion: null,
  rules: [],
  evidence: [],
  labels: {},
  claimTemplates: {},
});

const routesData = readJson('process-routes.json');
routesData.baselineVersion = baselineVersion;
writeJson('process-routes.json', routesData);

const approvedRuleIds = [];
const approvedPairKeys = [];
const approvedScopeHash = canonicalHash({
  approvedRuleIds: [...approvedRuleIds].sort(),
  approvedPairKeys: [...approvedPairKeys].sort(),
});
const rulePriorityData = rules
  .map(({ ruleId, priority, priorityDetail }) => ({ ruleId, priority, priorityDetail }))
  .sort((a, b) => a.ruleId.localeCompare(b.ruleId));
const snapshot = {
  ruleSetHash: canonicalHash(rulesData),
  evidenceSnapshotHash: canonicalHash(evidenceData),
  publicLabelMappingHash: canonicalHash(publicLabelMapping),
  publicClaimTemplateHash: canonicalHash(publicClaimTemplates),
  rulePriorityHash: canonicalHash(rulePriorityData),
  approvedScopeHash,
};
const resolverConfig = {
  schemaVersion: '2.2.0',
  resolverVersion,
  ruleSchemaVersion: rulesData.schemaVersion,
  publicLabelMappingVersion: publicLabelMapping.mappingVersion,
  publicClaimTemplateVersion: publicClaimTemplates.templateVersion,
  canonicalHashAlgorithm: 'sha256-stable-json-v1',
  snapshot,
};
writeJson('industry-resolver-config.json', resolverConfig);

const baselineData = readJson('industry-baseline-versions.json');
baselineData.schemaVersion = '2.2.0';
baselineData.currentDraftVersion = baselineVersion;
baselineData.publicBaselineVersion = null;
baselineData.versions = [
  ...baselineData.versions.filter((item) => item.baselineVersion !== baselineVersion),
  {
    baselineVersion,
    publicationStatus: 'draft',
    approvedRuleIds,
    approvedPairKeys,
    approvedScopeHash,
    publicClaimTemplateHash: snapshot.publicClaimTemplateHash,
    publicLabelMappingHash: snapshot.publicLabelMappingHash,
    rulePriorityHash: snapshot.rulePriorityHash,
    ruleSetHash: snapshot.ruleSetHash,
    evidenceSnapshotHash: snapshot.evidenceSnapshotHash,
    resolverVersion,
    approvedBy: null,
    approvedRole: null,
    approvedAt: null,
    lockedAt: null,
    approvalScope: null,
    changeSummary:
      '第2.2批工程语义修补：公开资格归零；拆分输入轴、服务器兼容性谓词、运行方式推导、工艺阶段、证据类型和逐pair批准范围；原53条规则全部完成状态迁移，大型台车规则拆为4条，形成56条待复核规则。',
    createdAt: '2026-08-27T16:00:00+08:00',
    supersedesBaselineVersion: 'industry-baseline-2026-08-batch2.1-draft',
    locked: false,
  },
];
writeJson('industry-baseline-versions.json', baselineData);

console.log(
  `generated batch2.2: ${originalRuleIds.length} source rules -> ${rules.length} rules, 0 public, ${candidateEvidence.length} application-mapping gaps`,
);
