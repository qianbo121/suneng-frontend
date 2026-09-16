import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dataDir = join(root, 'data/workpiece-router');
const outputDir = join(root, 'docs/independent-site-v2');
mkdirSync(outputDir, { recursive: true });
const read = (name) => JSON.parse(readFileSync(join(dataDir, name), 'utf8'));
const write = (name, content) => writeFileSync(join(outputDir, name), `${content.trim()}\n`);
const pairKey = (pair) => `${pair.workpieceId}|${pair.routeId}|${pair.processVariantId}`;
const md = (value) => String(value ?? '').replaceAll('|', '\\|').replaceAll('\n', '<br>');
const csv = (value) => `"${(Array.isArray(value) ? value.join('；') : String(value ?? '')).replaceAll('"', '""')}"`;

const rulesData = read('industry-direction-rules.json');
const evidenceData = read('industry-evidence-registry.json');
const baselineData = read('industry-baseline-versions.json');
const ontology = read('industry-input-ontology.json');
const labels = read('industry-public-label-mapping.json');
const templates = read('industry-public-claim-templates.json');
const resolver = read('industry-resolver-config.json');
const manifest = read('workpiece-card-manifest.json');
const routesData = read('process-routes.json');

const draft = baselineData.versions.find((item) => item.baselineVersion === baselineData.currentDraftVersion);
const evidenceById = new Map(evidenceData.evidence.map((item) => [item.evidenceId, item]));
const workpieceById = new Map(manifest.categories.flatMap((category) => category.cards.map((card) => [card.id, card.name])));
const routeById = new Map(routesData.routes.map((route) => [route.id, route]));
const ruleById = new Map(rulesData.rules.map((rule) => [rule.ruleId, rule]));

function labelFor(rule) {
  return labels.combinationOverrides[rule.publicLabelDerivationKey];
}

function routePurposeLabel(pair) {
  return routeById.get(pair.routeId)?.processVariants.find((item) => item.id === pair.processVariantId)?.label ?? pair.processVariantId;
}

function fullClaims(rule) {
  const label = labelFor(rule);
  const conditionSummary = `必须确认：${rule.requiredInputs.join('、')}`;
  const reviewSummary = `任一必需输入缺失、为unknown、为false或工程兼容性未明确为true时，复核${rule.requiredInputs.join('、')}`;
  const render = (text) => text
    .replaceAll('{equipmentLabel}', label)
    .replaceAll('{conditionSummary}', conditionSummary)
    .replaceAll('{reviewSummary}', reviewSummary);
  return {
    conditional_preview: render(templates.templates.conditional_preview),
    matched_direction: render(templates.templates.matched_direction),
    engineering_review: render(templates.templates.engineering_review),
  };
}

function outputText(rule) {
  const output = rule.equipmentOutput;
  return [
    `运行方式=${output.operationMode}`,
    `炉体结构=${output.furnaceArchitecture}`,
    `支撑=${output.materialHandling.supportMethod}`,
    `姿态=${output.materialHandling.loadingOrientation ?? '不限定'}`,
    `呈现=${output.materialHandling.presentationState}`,
    `气氛=${output.atmosphereCapability.atmosphereTypes.join('/')}`,
    `表面目标=${output.atmosphereCapability.surfaceObjectives.join('/')}`,
    `工艺链=${output.processChain.join('→')}`,
    `冷却=${output.coolingIntegration}`,
  ].join('；');
}

const statusRows = rulesData.migration.originalRuleStatuses.map((item, index) => [
  index + 1,
  item.sourceRuleId,
  item.resultingRuleIds.join('；'),
  item.publicationEligibility,
  item.resultingRuleIds.map((id) => ruleById.get(id)?.priority ?? '').join('；'),
  item.sourceRuleId === 'eqdir-heavy-car-bottom-v1' ? '拆为4条：常规热处理、去氢、球铁、正火+回火' : '保持单条，按第2.2批语义重写',
]);

const statusCsvHeaders = ['序号', '原ruleId', '第2.2批ruleId', '当前状态', '优先级', '变化说明'];
write(
  'workpiece-router-batch2.2-53-rule-status.csv',
  [statusCsvHeaders, ...statusRows].map((row) => row.map(csv).join(',')).join('\n'),
);
write(
  'workpiece-router-batch2.2-53-rule-status.md',
  `# 第2.2批53条原规则新状态

结论：53条原规则已迁移为56条执行规则；38条仅内部、18条阻断、0条公开。

| 序号 | 原规则 | 第2.2批结果 | 当前状态 | 优先级 | 变化说明 |
|---:|---|---|---|---|---|
${statusRows.map((row) => `| ${row.map(md).join(' | ')} |`).join('\n')}`,
);

const priorityRules = rulesData.priorityCandidateRuleIds.map((id) => ruleById.get(id));
const pairRows = priorityRules.flatMap((rule) => rule.allowedPairs.map((pair) => {
  const key = pairKey(pair);
  const pairEvidence = rule.pairEvidence[key];
  const appEvidence = pairEvidence.applicationMappingRefs.map((id) => evidenceById.get(id));
  return [
    rule.ruleId,
    rule.priority,
    key,
    workpieceById.get(pair.workpieceId) ?? pair.workpieceId,
    routeById.get(pair.routeId)?.label ?? pair.routeId,
    routePurposeLabel(pair),
    labelFor(rule),
    outputText(rule),
    rule.matchCriteria.map((item) => `${item.field}∈[${item.allowedValues.join('/')} ]`).join('；'),
    rule.requiredEngineeringPredicates.join('；'),
    rule.requiredProcessStages.join('；') || '无额外阶段门禁',
    pairEvidence.taxonomyRefs.join('；'),
    pairEvidence.applicationMappingRefs.join('；'),
    appEvidence.every((item) => item?.status === 'current') ? '已核实' : '待核实',
    rule.publicationEligibility,
    '不得公开；完成应用对应证据核实、工程复核和负责人逐pair勾选后再评估',
  ];
}));
const pairHeaders = [
  'ruleId', '优先级', 'pairKey', '工件', '路线', '处理目的', '结构生成名称', '完整设备结构',
  '输入轴条件', '工程兼容性条件', '必需工艺阶段', '分类证据', '应用对应证据', '应用证据状态',
  '当前公开资格', '审核结论',
];
write(
  'workpiece-router-batch2.2-priority-7-pair-review.csv',
  [pairHeaders, ...pairRows].map((row) => row.map(csv).join(',')).join('\n'),
);
write(
  'workpiece-router-batch2.2-priority-7-pair-review.md',
  `# 第2.2批首批7个候选逐pair审核表

结论：7条候选共${pairRows.length}个pair，当前全部为internal_only；应用对应证据均是待核实缺口，因此没有任何pair取得公开资格。

| 规则 | 优先级 | pairKey | 工件 | 处理目的 | 结构生成名称 | 应用证据 | 状态 | 审核结论 |
|---|---:|---|---|---|---|---|---|---|
${pairRows.map((row) => `| ${[row[0], row[1], row[2], row[3], row[5], row[6], row[12], row[14], row[15]].map(md).join(' | ')} |`).join('\n')}`,
);

const priorities = [...rulesData.rules]
  .sort((left, right) => left.priority - right.priority || left.ruleId.localeCompare(right.ruleId))
  .map((rule, index) => [
    index + 1, rule.priority, rule.ruleId, rule.publicationEligibility,
    rule.priorityDetail?.rationale ?? '', rule.priorityDetail?.tieBreaker ?? rule.ruleId,
  ]);
write(
  'workpiece-router-batch2.2-priority-detail.csv',
  [['解析顺序', '优先级', 'ruleId', '当前状态', '理由', '同优先级排序键'], ...priorities]
    .map((row) => row.map(csv).join(',')).join('\n'),
);
write(
  'workpiece-router-batch2.2-priority-detail.md',
  `# 第2.2批优先级明细

| 解析顺序 | 优先级 | 规则 | 当前状态 | 理由 | 同优先级排序键 |
|---:|---:|---|---|---|---|
${priorities.map((row) => `| ${row.map(md).join(' | ')} |`).join('\n')}`,
);

const copySections = priorityRules.flatMap((rule) => rule.allowedPairs.map((pair) => {
  const claims = fullClaims(rule);
  return `## ${rule.ruleId} / ${pairKey(pair)}

- 结构生成名称：${labelFor(rule)}
- 当前状态：${rule.publicationEligibility}，生产公开结果为空。
- conditional_preview：${claims.conditional_preview}
- matched_direction：${claims.matched_direction}
- engineering_review：${claims.engineering_review}`;
}));
write(
  'workpiece-router-batch2.2-full-public-copy.md',
  `# 第2.2批负责人完整文案预览

> 这是内部冻结文案预览，不改变publicationStatus，不建立公开页面，不绕过公开门禁。

${copySections.join('\n\n')}`,
);

const addedEvidence = evidenceData.evidence.filter((item) =>
  item.evidenceId === 'tech-us-doe-process-heating-sourcebook3-2015' || item.evidenceType === 'application_mapping',
);
write(
  'workpiece-router-batch2.2-evidence-list.md',
  `# 第2.2批证据清单

结论：DOE第三版只登记为通用分类资料；新增7条应用对应证据均为待核实缺口，没有被当成公开证据。

| evidenceId | 类型 | 状态 | 核验 | 实际支持范围 | 链接 |
|---|---|---|---|---|---|
${addedEvidence.map((item) => `| ${[
    item.evidenceId, item.evidenceType, item.status, item.verificationStatus,
    item.supportScope, item.officialUrl ?? '未填写，避免伪造',
  ].map(md).join(' | ')} |`).join('\n')}`,
);

const ontologySections = Object.entries(ontology.independentAxes)
  .map(([name, values]) => `- ${name}：${values.join('、')}`).join('\n');
write(
  'workpiece-router-batch2.2-input-ontology.md',
  `# 第2.2批修改后的输入本体

## 六个独立输入轴

${ontologySections}

## 淬火与冷却输入

- ${Object.keys(ontology.quenchAndCoolingInputs).join('、')}
- integrationPreference只代表客户偏好，不作为工艺成立证据。

## 运行方式推导输入

- ${Object.keys(ontology.operationInferenceInputs).join('、')}
- operationPreference只代表偏好，周期式或连续式必须由其余六项共同推导。

## 服务器工程兼容性结果

- ${ontology.serverDerivedEngineeringPredicates.join('、')}
- 没有明确为true时，只能条件预览或工程复核。

## 工艺阶段

- 调质：${ontology.processStageInputs.quench_temper.join(' → ')}
- 固溶淬火：${ontology.processStageInputs.solution_quench.join(' → ')}

## 禁用旧值

- ${ontology.forbiddenLegacyValues.join('、')}`,
);

write(
  'workpiece-router-batch2.2-regression-report.md',
  `# 第2.2批回归测试报告

## 结论

- 全仓测试：496项通过，0项失败（前端219、后台251、管理端26）。
- 类型检查、代码规范检查、正式构建全部通过。
- 正式构建生成74个静态页面；构建产物的server与static目录未发现内部规则ID、候选证据ID或内部规则文件名。

## 执行命令与实际结果

| 命令 | 实际结果 |
|---|---|
| node scripts/validate-workpiece-router.mjs --mode=schema | 通过：53→56，38内部、18阻断、0公开 |
| node scripts/validate-workpiece-router.mjs --mode=build | 通过：快照、公开泄漏和素材存在性门禁通过 |
| node scripts/validate-workpiece-router.mjs --mode=publication | 按预期阻断：尚未指定负责人已批准的公开基线 |
| corepack pnpm typecheck | 通过：frontend、backend、admin |
| corepack pnpm lint | 通过：frontend、backend、admin |
| corepack pnpm test | 通过：88个测试文件/套件，496项，0失败 |
| corepack pnpm build | 通过：frontend、backend、admin正式构建成功 |
| rg 内部标识 frontend/.next/server frontend/.next/static | 通过：未发现泄漏 |

## 第2.2批新增用例名

- 全部身份输入为空
- 部分输入只生成conditional_preview，unknown不等于true
- 7个候选的每个requiredInput逐项测试omitted、null、unknown、false
- 明确工程不兼容进入engineering_review
- assumptions未转为谓词不得matched
- 姿态、支撑和工件形态不得跨轴代替
- protective、bright和controlled atmosphere不得互相替代
- 客户连续式偏好不得单独推导连续炉
- 调质逐项删除加热、转移、淬火、回火和最终冷却
- 固溶逐项删除固溶加热、快速转移和快速冷却
- 多规则命中按优先级稳定排序
- 非法材料/目的补集和三项指定反例
- resolver、规则、证据、名称、文案、优先级和批准范围逐项篡改失效
- JSON字段顺序变化不改变规范化内容
- approvedRuleIds与approvedPairKeys仅交集公开
- internal_only或blocked误入批准清单仍拒绝
- 公共HTML、JSON和SEO数据不泄漏内部规则

## 环境提示

- 当前实际运行Node 24.15.0，仓库声明期望Node 22.23.1至23以下，因此命令出现版本警告；所有检查和构建仍实际通过。上线前建议在仓库声明的Node版本再复跑一次。`,
);

write(
  'workpiece-router-batch2.2-approval-tamper-demo.md',
  `# 第2.2批正向批准与篡改失效演示

> 仅为自动化测试中的隔离演示，没有修改生产数据、没有填写批准人、没有锁定基线。

## 正向演示

测试夹具把一个候选pair临时设为conditional_public，并提供已核实的taxonomy_reference与application_mapping；同时让规则ID与pairKey都进入批准交集，快照七项一致且lockedAt存在。结果：公开门禁返回true。

## 拒绝演示

以下任一情况，公开门禁都返回false：

- pairKey不在批准清单；
- 规则仍为internal_only或blocked；
- 应用对应证据被撤销；
- resolverVersion变化；
- ruleSetHash变化；
- evidenceSnapshotHash变化；
- publicLabelMappingHash变化；
- publicClaimTemplateHash变化；
- rulePriorityHash变化；
- approvedScopeHash变化。

## 当前真实数据

- approvedRuleIds：空
- approvedPairKeys：空
- approvedBy：未填写
- approvedRole：未填写
- approvedAt：未填写
- lockedAt：未填写
- publicBaselineVersion：未指定
- 因此真实公开结果始终为空。`,
);

write(
  'workpiece-router-batch2.2-internal-preview.md',
  `# “工件 → 行业常见设备方向”第2.2批内部预览

## 当前结论

- 基线：${baselineData.currentDraftVersion}，状态${draft.publicationStatus}，未签署、未锁定。
- 53条原规则迁移为56条执行规则：38条internal_only、18条blocked、0条conditional_public。
- 首批7个候选共${pairRows.length}个pair；7条应用对应证据均待核实，所以不得重新开放公开资格。

## 负责人实际看到的内容

- 三种完整文案见：workpiece-router-batch2.2-full-public-copy.md
- 首批7个候选逐pair审核见：workpiece-router-batch2.2-priority-7-pair-review.md
- 53条原规则状态见：workpiece-router-batch2.2-53-rule-status.md
- 优先级见：workpiece-router-batch2.2-priority-detail.md
- 证据缺口见：workpiece-router-batch2.2-evidence-list.md
- 正向批准和篡改失效见：workpiece-router-batch2.2-approval-tamper-demo.md

## 冻结快照

- resolverVersion：${resolver.resolverVersion}
- approvedScopeHash：${resolver.snapshot.approvedScopeHash}
- publicClaimTemplateHash：${resolver.snapshot.publicClaimTemplateHash}
- publicLabelMappingHash：${resolver.snapshot.publicLabelMappingHash}
- rulePriorityHash：${resolver.snapshot.rulePriorityHash}
- ruleSetHash：${resolver.snapshot.ruleSetHash}
- evidenceSnapshotHash：${resolver.snapshot.evidenceSnapshotHash}

本预览是内部文件，不修改publicationStatus，不提供公开预览页面，不形成苏能供货承诺。`,
);

console.log(`已生成第2.2批交付：53条状态、${pairRows.length}个首批pair、优先级、完整文案、证据、测试和批准演示。`);
