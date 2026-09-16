import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dataDir = join(root, 'data/workpiece-router');
const baselineVersion = 'industry-baseline-2026-08-batch2.3-draft';
const resolverVersion = 'workpiece-router-resolver-2.3.0';

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

const pendingBlockedRuleIds = new Set([
  'eqdir-stainless-solution-batch-v1',
  'eqdir-stainless-continuous-v1',
  'eqdir-chain-component-mesh-quench-temper-v2',
  'eqdir-chain-component-batch-quench-temper-v2',
  'eqdir-small-spring-stress-relief-batch-v2',
  'eqdir-small-spring-quench-temper-batch-v2',
  'eqdir-fastener-batch-quench-temper-v2',
  'eqdir-long-products-fixed-hearth-quench-temper-v2',
  'eqdir-welded-batch-chamber-v1',
  'eqdir-large-gear-fixed-hearth-thermal-v2',
  'eqdir-undercarriage-fixed-hearth-quench-temper-v2',
  'eqdir-shaft-fixed-hearth-thermal-v2',
  'eqdir-long-products-fixed-hearth-thermal-v2',
  'eqdir-undercarriage-fixed-hearth-thermal-v2',
  'eqdir-carburizing-continuous-v1',
  'eqdir-carburizing-batch-v1',
  'eqdir-heavy-batch-chamber-v1',
]);

const handlingSignalsBySupport = {
  mobile_hearth: ['loadMovement', 'loadingAccess', 'baseSupportCondition', 'floorLoadingRequired'],
  fixed_fixture: ['loadMovement', 'baseSupportCondition'],
  roller: ['loadMovement', 'loadingAccess', 'baseSupportCondition', 'continuousContactAllowed'],
  mesh_belt: ['loadMovement', 'loadingAccess', 'baseSupportCondition', 'bulkLoadingSuitable'],
  tray_or_basket: ['loadMovement', 'loadingAccess', 'baseSupportCondition', 'bulkLoadingSuitable'],
  suspended: [
    'loadMovement',
    'loadingAccess',
    'baseSupportCondition',
    'suspensionAllowed',
    'loadingOrientation',
  ],
  coil_stack: [
    'loadMovement',
    'loadingAccess',
    'baseSupportCondition',
    'stackingAllowed',
    'presentationState',
  ],
};

const ontology = readJson('industry-input-ontology.json');
ontology.schemaVersion = '2.3.0';
delete ontology.independentAxes.supportMethod;
ontology.observableHandlingInputs = {
  loadMovement: ['stationary', 'through_process', 'either', 'unknown'],
  loadingAccess: ['crane_or_forklift', 'conveyor_feed', 'manual_or_basket', 'unknown'],
  baseSupportCondition: [
    'broad_base',
    'line_contact',
    'distributed_small_parts',
    'fixture_required',
    'no_base_support',
    'unknown',
  ],
  continuousContactAllowed: { type: 'tri_state' },
  floorLoadingRequired: { type: 'tri_state' },
  suspensionAllowed: { type: 'tri_state' },
  stackingAllowed: { type: 'tri_state' },
  bulkLoadingSuitable: { type: 'tri_state' },
  evidenceRole: 'customer_observable_conditions_only',
};
ontology.serverDerivedMaterialHandling = {
  outputField: 'supportMethod',
  values: Object.keys(handlingSignalsBySupport),
  directCustomerInputAllowed: false,
};
ontology.rawEngineeringInputs = {
  dimensionsMm: ['length', 'width', 'height'],
  weightKg: 'positive_number',
  centerOfGravityMm: ['x', 'y', 'z'],
  supportSpanMm: 'non_negative_number',
};
ontology.operationDecisionTable = {
  decisionTableVersion: 'operation-mode-table-2.3.0',
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
  rows: [
    {
      decision: 'continuous',
      when: {
        batchSize: ['medium', 'large'],
        targetThroughput: ['high'],
        productMix: ['stable', 'few_variants'],
        changeoverFrequency: ['rare', 'periodic'],
        cycleTimeExpectation: ['regular', 'tight'],
        loadingContinuity: ['continuous'],
      },
    },
    {
      decision: 'batch',
      whenAny: {
        targetThroughput: ['low'],
        productMix: ['high_mix'],
        changeoverFrequency: ['frequent'],
        cycleTimeExpectation: ['flexible'],
        loadingContinuity: ['discrete'],
      },
      requiresLoadingContinuity: ['discrete', 'intermittent'],
    },
    {
      decision: 'engineering_review',
      when: 'complete_but_no_consistent_row',
    },
  ],
};
ontology.serverDerivedEngineeringPredicates = [
  ...new Set([
    ...ontology.serverDerivedEngineeringPredicates,
    'centerOfGravityCompatible',
    'supportSpanCompatible',
  ]),
];
ontology.forbiddenClientInputs = [
  'supportMethod',
  'serverEngineeringPredicates',
  ...ontology.serverDerivedEngineeringPredicates,
];

const ruleData = readJson('industry-direction-rules.json');
ruleData.schemaVersion = '2.3.0';
ruleData.baselineVersion = baselineVersion;
ruleData.resolverVersion = resolverVersion;
ruleData.engineeringMigration = {
  sourceBaselineVersion: 'industry-baseline-2026-08-batch2.2-draft',
  ruleCount: ruleData.rules.length,
  rulePairAssociationRecordCount: ruleData.rules.reduce(
    (total, rule) => total + rule.allowedPairs.length,
    0,
  ),
  uniqueBusinessPairKeyCount: new Set(
    ruleData.rules.flatMap((rule) =>
      rule.allowedPairs.map(
        (pair) => `${pair.workpieceId}|${pair.routeId}|${pair.processVariantId}`,
      ),
    ),
  ).size,
  pendingBlockedRuleIds: [...pendingBlockedRuleIds],
  pendingBlockedPolicy: '缺少证据或决策记录，不参与内部候选、不进入公开快照、不显示设备方向。',
};
ruleData.policy.publicEligibilityCount = 0;
ruleData.policy.pendingBlockedCannotResolve = true;
ruleData.policy.directSupportMethodInputForbidden = true;
ruleData.policy.serverEngineeringPredicatesCannotBeClientSupplied = true;

for (const rule of ruleData.rules) {
  rule.baselineVersion = baselineVersion;
  rule.internalExecutionStatus =
    rule.publicationEligibility === 'blocked'
      ? 'blocked'
      : pendingBlockedRuleIds.has(rule.ruleId)
        ? 'pending_blocked'
        : 'eligible';

  const supportMethod = rule.equipmentOutput.materialHandling.supportMethod;
  const requiredSignals = handlingSignalsBySupport[supportMethod];
  if (!requiredSignals) throw new Error(`Unsupported material handling output: ${supportMethod}`);
  rule.handlingInference = {
    decisionTableVersion: 'material-handling-table-2.3.0',
    expectedSupportMethod: supportMethod,
    requiredSignals,
    directAnswerAccepted: false,
    source: 'customer_observable_conditions',
  };

  rule.matchCriteria = rule.matchCriteria.filter((item) => item.field !== 'supportMethod');
  rule.requiredEngineeringPredicates = [
    ...new Set([
      ...rule.requiredEngineeringPredicates,
      'centerOfGravityCompatible',
      'supportSpanCompatible',
    ]),
  ];
  rule.requiredInputs = [
    ...new Set([
      ...rule.requiredInputs.filter((item) => item !== 'supportMethod'),
      ...requiredSignals,
      ...rule.requiredEngineeringPredicates,
    ]),
  ];
  rule.conditions = [
    ...rule.conditions.filter(
      (item) =>
        !item.startsWith('supportMethod必须属于：') &&
        !item.includes('推导物料支撑方式，不接受客户直接填写'),
    ),
    `根据${requiredSignals.join('、')}推导物料支撑方式，不接受客户直接填写${supportMethod}作为命中依据`,
  ];
  rule.derivedFrom = [
    ...rule.derivedFrom.filter(
      (item) =>
        !item.startsWith('axis:supportMethod:') &&
        !item.startsWith('handling-inference:') &&
        !item.startsWith('operation-decision-table:'),
    ),
    `handling-inference:${supportMethod}`,
    'operation-decision-table:operation-mode-table-2.3.0',
  ];
  rule.operationInference.decisionTableVersion = 'operation-mode-table-2.3.0';
  rule.assumptionPolicies = rule.assumptionPolicies.map((policy) =>
    policy.disposition === 'required_engineering_predicates'
      ? { ...policy, predicateIds: [...rule.requiredEngineeringPredicates] }
      : policy,
  );
  if (rule.internalExecutionStatus === 'pending_blocked') {
    rule.priorityDetail.rationale =
      '第2.2批由blocked变为internal_only但缺少证据和决策记录；第2.3批按pending_blocked处理，不参与内部候选。';
  }
}

const routeData = readJson('process-routes.json');
routeData.schemaVersion = '2.3.0';
routeData.baselineVersion = baselineVersion;

const evidenceData = readJson('industry-evidence-registry.json');
const labelData = readJson('industry-public-label-mapping.json');
const templateData = readJson('industry-public-claim-templates.json');
const priorities = ruleData.rules
  .map(({ ruleId, priority, priorityDetail }) => ({ ruleId, priority, priorityDetail }))
  .sort((left, right) => left.ruleId.localeCompare(right.ruleId));
const approvedRuleIds = [];
const approvedPairKeys = [];
const snapshot = {
  ruleSetHash: canonicalHash(ruleData),
  evidenceSnapshotHash: canonicalHash(evidenceData),
  publicLabelMappingHash: canonicalHash(labelData),
  publicClaimTemplateHash: canonicalHash(templateData),
  rulePriorityHash: canonicalHash(priorities),
  approvedScopeHash: canonicalHash({ approvedRuleIds, approvedPairKeys }),
};

const resolver = {
  schemaVersion: '2.3.0',
  resolverVersion,
  ruleSchemaVersion: '2.3.0',
  publicLabelMappingVersion: labelData.mappingVersion,
  publicClaimTemplateVersion: templateData.templateVersion,
  canonicalHashAlgorithm: 'sha256-stable-json-v1',
  operationDecisionTableVersion: 'operation-mode-table-2.3.0',
  materialHandlingDecisionTableVersion: 'material-handling-table-2.3.0',
  snapshot,
};

const baselineData = readJson('industry-baseline-versions.json');
baselineData.schemaVersion = '2.3.0';
baselineData.currentDraftVersion = baselineVersion;
baselineData.publicBaselineVersion = null;
baselineData.policy =
  '负责人只在某批规则准备进入conditional_public时，一次性批准规则版本、pair范围、证据快照和公开文案；不审批普通内部状态变化。批准不代表客户最终选型、苏能企业能力或承接承诺，Codex不得代填批准人。';
const draft = {
  baselineVersion,
  publicationStatus: 'draft',
  approvedRuleIds,
  approvedPairKeys,
  ...snapshot,
  resolverVersion,
  approvedBy: null,
  approvedRole: null,
  approvedAt: null,
  lockedAt: null,
  approvalScope: null,
  changeSummary:
    '第2.3批工程推理实质化：17条无决策记录规则收口为pending_blocked；客户可观察条件推导支撑和输送方式；服务端根据原始工件和候选设备能力计算兼容性；建立批次/连续决策表。仍为0条公开。',
  createdAt: '2026-08-27T20:00:00+08:00',
  supersedesBaselineVersion: 'industry-baseline-2026-08-batch2.2-draft',
  locked: false,
};
const existingDraftIndex = baselineData.versions.findIndex(
  (item) => item.baselineVersion === baselineVersion,
);
if (existingDraftIndex >= 0) baselineData.versions[existingDraftIndex] = draft;
else baselineData.versions.push(draft);

writeJson('industry-input-ontology.json', ontology);
writeJson('industry-direction-rules.json', ruleData);
writeJson('process-routes.json', routeData);
writeJson('industry-resolver-config.json', resolver);
writeJson('industry-baseline-versions.json', baselineData);
writeJson('industry-public-direction-snapshot.json', {
  schemaVersion: '2.3.0',
  publicBaselineVersion: null,
  rules: [],
  evidence: [],
  labels: {},
  claimTemplates: {},
});

console.log(
  `Generated Batch 2.3: ${ruleData.rules.length} rules, ` +
    `${ruleData.engineeringMigration.rulePairAssociationRecordCount} rule-pair association records, ` +
    `${ruleData.engineeringMigration.uniqueBusinessPairKeyCount} unique pairKeys, ` +
    `${pendingBlockedRuleIds.size} pending_blocked, 0 public.`,
);
