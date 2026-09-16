import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dataDir = join(root, 'data/workpiece-router');
const mode = process.argv.find((value) => value.startsWith('--mode='))?.split('=')[1] ?? 'build';
if (!['schema', 'build', 'publication'].includes(mode)) throw new Error(`未知校验模式：${mode}`);

const read = (filename) => JSON.parse(readFileSync(join(dataDir, filename), 'utf8'));
const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};
const nonemptyStrings = (value, label) => {
  assert(Array.isArray(value), `${label}必须为数组`);
  assert(
    value.every((item) => typeof item === 'string' && item.length > 0),
    `${label}含空值`,
  );
};
const unique = (values, label) => {
  const result = new Set(values);
  assert(result.size === values.length, `${label}存在重复值`);
  return result;
};
const canonicalize = (value) => {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, canonicalize(value[key])]),
    );
  }
  return value;
};
const canonicalHash = (value) =>
  `sha256:${createHash('sha256')
    .update(JSON.stringify(canonicalize(value)))
    .digest('hex')}`;
const pairKey = (pair) => `${pair.workpieceId}|${pair.routeId}|${pair.processVariantId}`;

const manifest = read('workpiece-card-manifest.json');
const routeData = read('process-routes.json');
const whitelist = read('furnace-capability-whitelist.json');
const evidenceData = read('industry-evidence-registry.json');
const baselineData = read('industry-baseline-versions.json');
const ruleData = read('industry-direction-rules.json');
const labelData = read('industry-public-label-mapping.json');
const templateData = read('industry-public-claim-templates.json');
const ontology = read('industry-input-ontology.json');
const publicSnapshot = read('industry-public-direction-snapshot.json');
const resolver = read('industry-resolver-config.json');

const expectedAxes = {
  partForm: ['discrete_part', 'plate', 'long_product', 'coil', 'strip', 'irregular_assembly'],
  loadingOrientation: ['horizontal', 'vertical', 'flat', 'suspended'],
  presentationState: ['coiled', 'uncoiled', 'stacked', 'single_piece', 'bulk_loaded'],
  atmosphereType: [
    'air',
    'inert',
    'reducing',
    'protective',
    'controlled_carbon_potential',
    'controlled_carbon_nitrogen_potential',
  ],
  surfaceObjective: ['normal', 'low_oxidation', 'bright', 'scale_controlled'],
};
const operationSignals = [
  'batchSize',
  'targetThroughput',
  'productMix',
  'changeoverFrequency',
  'cycleTimeExpectation',
  'loadingContinuity',
];
const engineeringPredicates = new Set([
  'loadEnvelopeCompatible',
  'loadCapacityCompatible',
  'supportCompatible',
  'handlingPathCompatible',
  'geometryCompatible',
  'straightnessOrDistortionCompatible',
  'quenchTransferCompatible',
  'processChainCompatible',
  'largeOrHeavy',
  'centerOfGravityCompatible',
  'supportSpanCompatible',
]);
const highRiskExpected = [
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
];

function schemaValidation() {
  assert(manifest.categories.length === 8, '工件分类必须保持8个');
  const cards = manifest.categories.flatMap((category) => category.cards);
  assert(cards.length === 45, `工件图片应为45张，当前${cards.length}`);
  assert(routeData.routes.length === 37, `路线应为37条，当前${routeData.routes.length}`);
  assert(
    routeData.routes.flatMap((route) => route.processVariants).length === 52,
    '处理目的应为52项',
  );
  assert(routeData.baselineVersion === baselineData.currentDraftVersion, '路线未绑定当前草稿');

  assert(
    JSON.stringify(ontology.triStateValues) === JSON.stringify([true, false, 'unknown']),
    '三值本体错误',
  );
  for (const [axis, values] of Object.entries(expectedAxes)) {
    assert(
      JSON.stringify(ontology.independentAxes[axis]) === JSON.stringify(values),
      `输入轴错误：${axis}`,
    );
  }
  assert(!('supportMethod' in ontology.independentAxes), '设备支撑答案不得继续作为客户输入轴');
  assert(
    ontology.serverDerivedMaterialHandling.directCustomerInputAllowed === false,
    '支撑方式必须由服务端推导',
  );
  assert(
    ontology.forbiddenClientInputs.includes('serverEngineeringPredicates'),
    '未禁止前端注入服务器工程结果',
  );
  for (const forbidden of [
    'coil',
    'strip',
    'roller_supported',
    'fixture_supported',
    'bright',
    'controlled_process_atmosphere',
    'quench_system_integrated',
    'rapid_cooling_integrated',
  ])
    assert(ontology.forbiddenLegacyValues.includes(forbidden), `未登记禁用旧值：${forbidden}`);
  assert(
    JSON.stringify(ontology.processStageInputs.quench_temper) ===
      JSON.stringify([
        'austenitizing',
        'transfer',
        'quench',
        'cleaning_if_required',
        'tempering',
        'final_cooling',
      ]),
    '调质工艺链输入不完整',
  );
  assert(
    JSON.stringify(ontology.processStageInputs.solution_quench) ===
      JSON.stringify(['solution_heating', 'rapid_transfer', 'rapid_cooling']),
    '固溶淬火工艺链输入不完整',
  );
  assert(
    ontology.quenchAndCoolingInputs.integrationPreference.evidenceRole === 'preference_only',
    '集成偏好不得充当工艺证据',
  );
  assert(
    ontology.operationInferenceInputs.operationPreference.evidenceRole === 'preference_only',
    '运行偏好不得直接决定炉型',
  );

  assert(ruleData.migration.originalRuleCount === 53, '原规则数量必须为53');
  assert(ruleData.migration.originalRuleStatuses.length === 53, '缺少53条原规则状态');
  assert(
    ruleData.migration.resultingRuleCount === 56 && ruleData.rules.length === 56,
    '第2.2批执行规则应为56条',
  );
  unique(
    ruleData.rules.map((rule) => rule.ruleId),
    '规则ID',
  );
  assert(
    ruleData.rules.filter((rule) => rule.publicationEligibility === 'conditional_public').length ===
      0,
    '当前公开资格必须为0',
  );
  assert(
    ruleData.rules.filter((rule) => rule.publicationEligibility === 'internal_only').length === 38,
    '内部规则数量应为38',
  );
  assert(
    ruleData.rules.filter((rule) => rule.publicationEligibility === 'blocked').length === 18,
    '阻断规则数量应为18',
  );
  assert(
    ruleData.rules.filter((rule) => rule.internalExecutionStatus === 'eligible').length === 21,
    '可执行内部候选应为21条',
  );
  assert(
    ruleData.rules.filter((rule) => rule.internalExecutionStatus === 'pending_blocked').length ===
      17,
    'pending_blocked应为17条',
  );
  assert(
    ruleData.rules.filter((rule) => rule.internalExecutionStatus === 'blocked').length === 18,
    '完全阻断执行规则应为18条',
  );
  assert(
    ruleData.engineeringMigration.rulePairAssociationRecordCount === 307,
    '规则-pair关联记录应为307条',
  );
  assert(
    ruleData.engineeringMigration.uniqueBusinessPairKeyCount === 120,
    '唯一业务pairKey应为120个',
  );
  const pairEvidenceStatusCounts = ruleData.rules.reduce((counts, rule) => {
    counts[rule.baselineEvidenceStatus] =
      (counts[rule.baselineEvidenceStatus] ?? 0) + rule.allowedPairs.length;
    return counts;
  }, {});
  assert(pairEvidenceStatusCounts.unverified === 155, 'unverified规则-pair关联记录应为155条');
  assert(
    pairEvidenceStatusCounts.partially_verified === 152,
    'partially_verified规则-pair关联记录应为152条',
  );
  assert(
    (pairEvidenceStatusCounts.verified ?? 0) === 0,
    'fully_verified规则-pair关联记录必须为0条',
  );
  assert(ruleData.priorityCandidateRuleIds.length === 7, '首批候选必须为7条');
  assert(
    JSON.stringify([...ruleData.highRiskBlockedRuleIds].sort()) ===
      JSON.stringify([...highRiskExpected].sort()),
    '高风险阻断清单不完整',
  );

  const routeById = new Map(routeData.routes.map((route) => [route.id, route]));
  const evidenceById = new Map(evidenceData.evidence.map((item) => [item.evidenceId, item]));
  const allowedCriterionFields = new Set([...Object.keys(expectedAxes), 'treatmentScope']);
  for (const rule of ruleData.rules) {
    assert(
      rule.baselineVersion === baselineData.currentDraftVersion,
      `规则基线失配：${rule.ruleId}`,
    );
    assert(
      !('routeIds' in rule) && !('processPurposeIds' in rule),
      `仍含隐式笛卡尔数组：${rule.ruleId}`,
    );
    assert(
      !('publicLabel' in rule) && !('publicLabelKey' in rule),
      `规则含独立手写公开名称：${rule.ruleId}`,
    );
    assert(
      ['internal_only', 'blocked'].includes(rule.publicationEligibility),
      `规则取得了未授权公开资格：${rule.ruleId}`,
    );
    assert(Number.isInteger(rule.priority), `优先级无效：${rule.ruleId}`);
    assert(rule.allowedPairs.length > 0, `allowedPairs为空：${rule.ruleId}`);
    unique(rule.allowedPairs.map(pairKey), `规则pair：${rule.ruleId}`);
    for (const pair of rule.allowedPairs) {
      const route = routeById.get(pair.routeId);
      assert(route, `路线不存在：${rule.ruleId}/${pair.routeId}`);
      assert(
        route.workpieceIds.includes(pair.workpieceId),
        `工件不属于路线：${rule.ruleId}/${pairKey(pair)}`,
      );
      assert(
        route.processVariants.some((item) => item.id === pair.processVariantId),
        `处理目的不属于路线：${rule.ruleId}/${pairKey(pair)}`,
      );
      assert(rule.pairEvidence[pairKey(pair)], `缺少逐pair证据：${rule.ruleId}/${pairKey(pair)}`);
      assert(
        rule.pairEvidence[pairKey(pair)].taxonomyRefs.includes(
          'tech-us-doe-process-heating-sourcebook3-2015',
        ),
        `pair缺少分类证据：${rule.ruleId}/${pairKey(pair)}`,
      );
    }
    for (const criterion of rule.matchCriteria) {
      assert(criterion.field !== 'supportMethod', `规则仍直接使用支撑答案：${rule.ruleId}`);
      assert(
        allowedCriterionFields.has(criterion.field),
        `跨轴或旧条件字段：${rule.ruleId}/${criterion.field}`,
      );
      assert(
        criterion.operator === 'in' && criterion.requiredForMatch === true,
        `条件不是明确三值匹配：${rule.ruleId}/${criterion.field}`,
      );
      assert(
        criterion.allowedValues.every(
          (item) =>
            expectedAxes[criterion.field]?.includes(item) ??
            ['whole_component', 'local', 'field'].includes(item),
        ),
        `条件值跨轴：${rule.ruleId}/${criterion.field}`,
      );
    }
    assert(
      !rule.requiredInputs.includes('supportMethod'),
      `requiredInputs仍含支撑答案：${rule.ruleId}`,
    );
    assert(
      rule.handlingInference?.directAnswerAccepted === false,
      `规则允许支撑方式直接命中：${rule.ruleId}`,
    );
    assert(
      rule.handlingInference?.source === 'customer_observable_conditions',
      `物料支撑未由可观察条件推导：${rule.ruleId}`,
    );
    assert(
      rule.operationInference.preferenceCanDecide === false,
      `偏好可决定运行方式：${rule.ruleId}`,
    );
    if (['batch', 'continuous'].includes(rule.operationInference.mode)) {
      assert(
        JSON.stringify(rule.operationInference.requiredSignals) ===
          JSON.stringify(operationSignals),
        `运行方式信号不完整：${rule.ruleId}`,
      );
    }
    nonemptyStrings(rule.requiredEngineeringPredicates, `工程谓词 ${rule.ruleId}`);
    assert(
      rule.requiredEngineeringPredicates.every((item) => engineeringPredicates.has(item)),
      `存在未定义工程谓词：${rule.ruleId}`,
    );
    assert(
      rule.assumptionPolicies.length === rule.assumptions.length,
      `关键假设未逐项治理：${rule.ruleId}`,
    );
    for (const policy of rule.assumptionPolicies) {
      if (policy.disposition === 'required_engineering_predicates') {
        assert(
          policy.predicateIds.length > 0 &&
            policy.predicateIds.every((item) => rule.requiredEngineeringPredicates.includes(item)),
          `假设未转为谓词：${rule.ruleId}`,
        );
      } else {
        assert(
          rule.nonMatchableAssumptions.includes(policy.text),
          `非匹配假设未设置永久门禁：${rule.ruleId}`,
        );
      }
    }
    const output = rule.equipmentOutput;
    assert(
      ['batch', 'continuous', 'local', 'field'].includes(output.operationMode),
      `运行方式含复合枚举：${rule.ruleId}`,
    );
    assert(!output.furnaceArchitecture.includes('_or_'), `炉体结构含复合枚举：${rule.ruleId}`);
    assert(
      output.materialHandling && output.atmosphereCapability,
      `设备结构字段不完整：${rule.ruleId}`,
    );
    assert(
      rule.publicLabelDerivationKey ===
        `${output.operationMode}|${output.furnaceArchitecture}|${output.processChainProfile}`,
      `名称不是由结构生成：${rule.ruleId}`,
    );
    assert(
      labelData.combinationOverrides[rule.publicLabelDerivationKey],
      `结构名称映射缺失：${rule.ruleId}`,
    );
    if (output.furnaceArchitecture === 'roller_hearth')
      assert(
        output.materialHandling.supportMethod === 'roller',
        `辊底式结构未配辊道支撑：${rule.ruleId}`,
      );
    if (output.furnaceArchitecture === 'car_bottom')
      assert(
        output.materialHandling.supportMethod === 'mobile_hearth',
        `台车式结构未配活动炉底：${rule.ruleId}`,
      );
    if (output.processChainProfile === 'quench_temper') {
      assert(
        JSON.stringify(output.processChain) ===
          JSON.stringify([
            'austenitizing',
            'transfer',
            'quench',
            'cleaning_if_required',
            'tempering',
            'final_cooling',
          ]),
        `调质链不完整：${rule.ruleId}`,
      );
    }
    if (output.processChainProfile === 'solution_quench') {
      assert(
        JSON.stringify(output.processChain) ===
          JSON.stringify(['solution_heating', 'rapid_transfer', 'rapid_cooling']),
        `固溶淬火链不完整：${rule.ruleId}`,
      );
    }
    nonemptyStrings(rule.derivedFrom, `derivedFrom ${rule.ruleId}`);
    nonemptyStrings(rule.assumptions, `assumptions ${rule.ruleId}`);
    nonemptyStrings(rule.requiredInputs, `requiredInputs ${rule.ruleId}`);
    nonemptyStrings(rule.evidenceRefs, `evidenceRefs ${rule.ruleId}`);
    assert(
      rule.evidenceRefs.every((id) => evidenceById.has(id)),
      `规则引用不存在证据：${rule.ruleId}`,
    );
    assert(
      !JSON.stringify(rule).includes('quench_system_integrated'),
      `规则仍以淬火系统答案作为输入：${rule.ruleId}`,
    );
    assert(
      !JSON.stringify(rule).includes('rapid_cooling_integrated'),
      `规则仍以冷却系统答案作为输入：${rule.ruleId}`,
    );
  }

  for (const ruleId of highRiskExpected)
    assert(
      ruleData.rules.find((rule) => rule.ruleId === ruleId)?.publicationEligibility === 'blocked',
      `高风险规则未阻断：${ruleId}`,
    );
  for (const ruleId of ruleData.priorityCandidateRuleIds)
    assert(
      ruleData.rules.find((rule) => rule.ruleId === ruleId)?.publicationEligibility ===
        'internal_only',
      `首批候选不得提前公开：${ruleId}`,
    );
  for (const ruleId of ruleData.priorityCandidateRuleIds)
    assert(
      ruleData.rules.find((rule) => rule.ruleId === ruleId)?.internalExecutionStatus === 'eligible',
      `首批候选未进入可执行内部候选：${ruleId}`,
    );
  for (const ruleId of ruleData.engineeringMigration.pendingBlockedRuleIds)
    assert(
      ruleData.rules.find((rule) => rule.ruleId === ruleId)?.internalExecutionStatus ===
        'pending_blocked',
      `pending_blocked状态未锁定：${ruleId}`,
    );
  assert(
    ruleData.rules.find((rule) => rule.ruleId === 'eqdir-heavy-car-bottom-v1')
      ?.publicationEligibility === 'internal_only',
    '大型台车规则未降级',
  );
  const ductile = ruleData.rules.find(
    (rule) => rule.ruleId === 'eqdir-heavy-ductile-iron-car-bottom-v2',
  );
  assert(
    ductile?.requiredEngineeringPredicates.includes('largeOrHeavy'),
    '球铁路线缺少largeOrHeavy=true门禁',
  );

  const allowed = new Set(ruleData.rules.flatMap((rule) => rule.allowedPairs.map(pairKey)));
  for (const invalid of [
    'aluminum-alloy-plate|plate-batch-anneal-normalize|normalizing',
    'medium-heavy-steel-plate|aluminum-plate-anneal-aging|artificial-aging',
    'wear-resistant-steel-plate|aluminum-plate-solution-quench-review|solution-quench',
  ])
    assert(!allowed.has(invalid), `非法材料/目的组合进入规则：${invalid}`);

  assert(
    evidenceData.evidence.find(
      (item) => item.evidenceId === 'tech-us-doe-process-heating-sourcebook3-2015',
    )?.evidenceType === 'taxonomy_reference',
    'DOE第三版只能是taxonomy_reference',
  );
  const appMappings = evidenceData.evidence.filter(
    (item) => item.evidenceType === 'application_mapping',
  );
  assert(appMappings.length >= 14, '第2.5.1批应保留原证据并登记新增原厂应用对应证据');
  const verifiedApplicationIds = new Set([
    'candidate-appmap-heavy-car-bottom',
    'candidate-appmap-wear-plate-quench-temper',
    'candidate-appmap-carbon-steel-coil-bell',
    'candidate-appmap-long-products-roller-thermal',
    'candidate-appmap-wire-coil-bell',
    'candidate-appmap-fastener-mesh-quench-temper',
    'candidate-appmap-can-eng-car-bottom',
    'candidate-appmap-nutec-car-bottom',
    'candidate-appmap-nutec-forging',
    'candidate-appmap-can-eng-tube-bar-annealing',
    'candidate-appmap-can-eng-plate-quench-temper',
    'candidate-appmap-can-eng-fastener-industry',
    'candidate-appmap-can-eng-mesh-belt-quench-temper',
  ]);
  for (const item of appMappings.filter((record) => verifiedApplicationIds.has(record.evidenceId))) {
    assert(
      item.status === 'current' && item.verificationStatus === 'full_text_verified',
      `首版候选应用资料未完成全文核实：${item.evidenceId}`,
    );
    assert(
      typeof item.officialUrl === 'string' &&
        item.officialUrl.startsWith('https://') &&
        item.accessLevel === 'full_text' &&
        item.supportedClaimLevels.includes('equipment_direction'),
      `首版候选应用资料缺官方全文或支持边界：${item.evidenceId}`,
    );
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
      assert(item[field] != null, `首版候选证据缺冻结字段：${item.evidenceId}.${field}`);
    }
  }
  const unverifiedApplication = appMappings.find(
    (item) => item.evidenceId === 'candidate-appmap-long-products-roller-quench-temper',
  );
  assert(
    unverifiedApplication?.status === 'unverified' &&
      unverifiedApplication.verificationStatus === 'unverified' &&
      unverifiedApplication.officialUrl === null,
    '长材连续调质尚无充分应用对应证据，必须继续保持未核实',
  );

  const draft = baselineData.versions.find(
    (item) => item.baselineVersion === baselineData.currentDraftVersion,
  );
  assert(draft && draft.publicationStatus === 'draft', '当前基线必须是草稿');
  for (const field of ['approvedRuleIds', 'approvedPairKeys'])
    assert(Array.isArray(draft[field]) && draft[field].length === 0, `不得预填${field}`);
  for (const field of ['approvedBy', 'approvedRole', 'approvedAt', 'lockedAt'])
    assert(draft[field] === null, `不得预填${field}`);
  assert(
    draft.locked === false && baselineData.publicBaselineVersion === null,
    '不得锁定或签署基线',
  );
  return { cards, draft };
}

function buildValidation({ cards, draft }) {
  for (const card of cards) {
    assert(card.image.startsWith('/images/workpieces/'), `图片路径无效：${card.id}`);
    assert(existsSync(join(root, 'frontend/public', card.image)), `图片不存在：${card.image}`);
  }
  const priorities = ruleData.rules
    .map(({ ruleId, priority, priorityDetail }) => ({ ruleId, priority, priorityDetail }))
    .sort((a, b) => a.ruleId.localeCompare(b.ruleId));
  const expectedSnapshot = {
    ruleSetHash: canonicalHash(ruleData),
    evidenceSnapshotHash: canonicalHash(evidenceData),
    publicLabelMappingHash: canonicalHash(labelData),
    publicClaimTemplateHash: canonicalHash(templateData),
    rulePriorityHash: canonicalHash(priorities),
    approvedScopeHash: canonicalHash({
      approvedRuleIds: [...draft.approvedRuleIds].sort(),
      approvedPairKeys: [...draft.approvedPairKeys].sort(),
    }),
  };
  assert(resolver.canonicalHashAlgorithm === 'sha256-stable-json-v1', '规范化哈希算法未锁定');
  for (const [field, value] of Object.entries(expectedSnapshot)) {
    assert(resolver.snapshot[field] === value, `判断器快照失效：${field}`);
    assert(draft[field] === value, `草稿快照失效：${field}`);
  }
  assert(draft.resolverVersion === resolver.resolverVersion, '判断器版本失效');
  assert(
    Object.keys(templateData.templates).sort().join(',') ===
      'conditional_preview,engineering_review,matched_direction',
    '三种完整公开文案未冻结',
  );
  for (const text of Object.values(templateData.templates))
    assert(typeof text === 'string' && text.length > 20, '公开文案模板为空');

  assert(
    Array.isArray(whitelist.capabilities) && Array.isArray(whitelist.directionApprovals),
    '苏能能力白名单结构错误',
  );
  if (baselineData.publicBaselineVersion === null) {
    assert(publicSnapshot.publicBaselineVersion === null, '空公开基线却生成公开快照');
    assert(
      publicSnapshot.rules.length === 0 && publicSnapshot.evidence.length === 0,
      '公开JSON泄漏内部规则或证据',
    );
    assert(
      Object.keys(publicSnapshot.labels).length === 0 &&
        Object.keys(publicSnapshot.claimTemplates).length === 0,
      '公开JSON泄漏内部名称或文案',
    );
  }
  const runtimeSource = readFileSync(join(root, 'frontend/src/lib/workpiece-router.ts'), 'utf8');
  assert(
    !runtimeSource.includes('industry-direction-rules.json'),
    '公共运行时代码直接导入内部规则',
  );
  assert(
    !runtimeSource.includes('industry-evidence-registry.json'),
    '公共运行时代码直接导入内部证据',
  );
  assert(
    !runtimeSource.includes('industry-public-label-mapping.json'),
    '公共运行时代码直接导入未批准名称',
  );
  assert(
    !runtimeSource.includes('serverEngineeringPredicates'),
    '前端仍可注入或覆盖服务器工程谓词',
  );

  const publicRoots = [
    join(root, 'frontend/src/app'),
    join(root, 'frontend/src/components'),
  ].filter(existsSync);
  const walk = (dir) =>
    readdirSync(dir).flatMap((name) => {
      const path = join(dir, name);
      return statSync(path).isDirectory() ? walk(path) : [path];
    });
  const publicText = publicRoots
    .flatMap(walk)
    .filter((path) => /\.(ts|tsx|js|jsx|json)$/.test(path))
    .map((path) => readFileSync(path, 'utf8'))
    .join('\n');
  assert(
    !publicText.includes('candidate-appmap-') && !publicText.includes('eqdir-'),
    '公共HTML或SEO源码泄漏内部规则',
  );
}

function verifiedEvidence(id, type) {
  const item = evidenceData.evidence.find((record) => record.evidenceId === id);
  return (
    item &&
    item.evidenceType === type &&
    item.status === 'current' &&
    item.accessLevel !== 'metadata_only' &&
    ['full_text_verified', 'clause_verified'].includes(item.verificationStatus)
  );
}

function publicationValidation() {
  assert(baselineData.publicBaselineVersion, '发布校验阻断：尚未指定负责人已批准的公开基线');
  const approved = baselineData.versions.find(
    (item) => item.baselineVersion === baselineData.publicBaselineVersion,
  );
  assert(
    approved?.publicationStatus === 'approved' && approved.locked === true,
    '发布校验阻断：基线未批准并锁定',
  );
  for (const field of ['approvedBy', 'approvedRole', 'approvedAt', 'lockedAt'])
    assert(typeof approved[field] === 'string' && approved[field], `发布校验阻断：缺少${field}`);
  for (const field of ['resolverVersion', ...Object.keys(resolver.snapshot)]) {
    const current =
      field === 'resolverVersion' ? resolver.resolverVersion : resolver.snapshot[field];
    assert(approved[field] === current, `发布校验阻断：${field}已变化`);
  }
  const approvedRuleIds = new Set(approved.approvedRuleIds);
  const approvedPairKeys = new Set(approved.approvedPairKeys);
  for (const rule of publicSnapshot.rules) {
    assert(
      rule.publicationEligibility === 'conditional_public',
      `内部或阻断规则进入公开快照：${rule.ruleId}`,
    );
    assert(
      rule.internalExecutionStatus === 'eligible',
      `pending_blocked或blocked规则进入公开快照：${rule.ruleId}`,
    );
    assert(approvedRuleIds.has(rule.ruleId), `规则不在批准范围：${rule.ruleId}`);
    for (const pair of rule.allowedPairs) {
      const key = pairKey(pair);
      assert(approvedPairKeys.has(key), `pair不在批准范围：${rule.ruleId}/${key}`);
      const refs = rule.pairEvidence[key];
      assert(
        refs.taxonomyRefs.some((id) => verifiedEvidence(id, 'taxonomy_reference')),
        `pair缺少有效分类证据：${key}`,
      );
      assert(
        refs.applicationMappingRefs.some((id) => verifiedEvidence(id, 'application_mapping')),
        `pair缺少有效应用对应证据：${key}`,
      );
    }
  }
}

const state = schemaValidation();
if (mode === 'build' || mode === 'publication') buildValidation(state);
if (mode === 'publication') publicationValidation();
console.log(
  `OK [${mode}]: 8类、45张图、37条路线、52个处理目的；56条执行规则共307条规则-pair关联记录、120个唯一业务pairKey（21条可执行内部候选、17条pending_blocked、18条blocked、0条公开）；第2.5批6条应用对应资料已全文核实、1条仍未核实；源规则证据等级和公开状态未自动修改，基线未签署。`,
);
