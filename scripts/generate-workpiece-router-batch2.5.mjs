import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dataDir = join(root, 'data/workpiece-router');
const docsDir = join(root, 'docs/independent-site-v2');
const candidatePath = join(dataDir, 'industry-public-baseline-candidate-batch2.5.json');
const candidateDocPath = join(docsDir, 'workpiece-router-batch2.5-public-baseline-candidate.md');

const readJson = (path) => JSON.parse(readFileSync(path, 'utf8'));
const writeJson = (path, value) => writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
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
const sha256 = (value) =>
  `sha256:${createHash('sha256')
    .update(
      Buffer.isBuffer(value)
        ? value
        : typeof value === 'string'
          ? value
          : JSON.stringify(canonicalize(value)),
    )
    .digest('hex')}`;
const fileHash = (path) => sha256(readFileSync(path));
const pairKey = (pair) => `${pair.workpieceId}|${pair.routeId}|${pair.processVariantId}`;
const cleanCell = (value) =>
  String(value ?? '')
    .replaceAll('|', '｜')
    .replaceAll('\n', '<br>');

const evidencePath = join(dataDir, 'industry-evidence-registry.json');
const evidenceData = readJson(evidencePath);
const verifiedAt = '2026-08-27';
const evidenceUpdates = {
  'candidate-appmap-heavy-car-bottom': {
    standardNumber: '官网产品技术资料',
    standardTitle: 'Lift Cover, Tilt Top & Carbottom Furnaces',
    issuingBody: 'Surface Combustion',
    versionOrYear: '官网当前页面（2026-08-27核验）',
    status: 'current',
    evidenceRole: 'verified_application_mapping',
    evidenceType: 'application_mapping',
    publishDate: null,
    effectiveDate: null,
    replacedDate: null,
    transitionEndDate: null,
    successorEvidenceId: null,
    officialUrl:
      'https://www.surfacecombustion.com/product/lift-cover-tilt-top-carbottom-furnaces/',
    accessLevel: 'full_text',
    verificationStatus: 'full_text_verified',
    verifiedAt,
    verificationMethod:
      '逐段核对官方产品页的批次式台车承载结构、退火/正火/回火工艺和铸件/锻件/轴类应用范围',
    clauseRefs: [
      'Carbottom furnace design and batch operation',
      'Processes: Annealing, Normalizing, Tempering',
      'Parts: Castings, Forgings, Shafts',
    ],
    pageRefs: [],
    supportedClaimLevels: ['equipment_direction'],
    supportScope: [
      '台车式批次设备对大型、重载工件的移动炉床承载分类',
      '铸件、锻件和轴类的退火、正火、单独回火应用映射',
    ],
    applicability:
      '仅用于大型钢铸件和锻件在批次、移动炉床承载工况下的行业应用映射；不支持苏能制造能力、装载上限、炉温或时间数值。',
    notes: '公开方向仍必须以装载外形、重量、重心、支撑和上下料路径由服务端明确核对为true为前提。',
  },
  'candidate-appmap-wear-plate-quench-temper': {
    standardNumber: '官网技术手册',
    standardTitle: 'LOI Thermprocess Image Brochure - Plate Heat Treatment',
    issuingBody: 'Tenova LOI Thermprocess',
    versionOrYear: '2024',
    status: 'current',
    evidenceRole: 'verified_application_mapping',
    evidenceType: 'application_mapping',
    publishDate: null,
    effectiveDate: null,
    replacedDate: null,
    transitionEndDate: null,
    successorEvidenceId: null,
    officialUrl:
      'https://loi.tenova.com/sites/default/files/files/files_to_zip/2024/LOI_Image_Brochure_EN.pdf',
    accessLevel: 'full_text',
    verificationStatus: 'full_text_verified',
    verifiedAt,
    verificationMethod: '核对官方PDF中厚板调质线的奥氏体化、淬火、回火工艺链和耐磨钢应用描述',
    clauseRefs: ['Quenching and tempering lines for heavy plates', 'Abrasion-resistant steel'],
    pageRefs: ['7'],
    supportedClaimLevels: ['equipment_direction'],
    supportScope: [
      '耐磨钢厚板与连续调质热处理线的应用映射',
      '奥氏体化、淬火和回火的完整工艺链边界',
    ],
    applicability:
      '仅用于耐磨钢厚板的连续调质系统方向；不支持淬火介质、冷却速率、温度、节拍或苏能能力数值。',
    notes: '板形、辊道支撑、淬火转移和完整调质工艺链必须由服务端逐项核对。',
  },
  'candidate-appmap-carbon-steel-coil-bell': {
    standardNumber: '官网应用技术资料',
    standardTitle: 'Bell annealer for steel strip coils',
    issuingBody: 'EBNER Industrieofenbau',
    versionOrYear: '官网当前页面（2026-08-27核验）',
    status: 'current',
    evidenceRole: 'verified_application_mapping',
    evidenceType: 'application_mapping',
    publishDate: null,
    effectiveDate: null,
    replacedDate: null,
    transitionEndDate: null,
    successorEvidenceId: null,
    officialUrl: 'https://www.ebner.cc/en/bell-annealer-steel-strip-en',
    accessLevel: 'full_text',
    verificationStatus: 'full_text_verified',
    verifiedAt,
    verificationMethod: '核对官方页面对钢带卷、碳钢和罩式退火的直接应用描述',
    clauseRefs: ['Bell annealer for steel strip coils', 'Carbon steel applications'],
    pageRefs: [],
    supportedClaimLevels: ['equipment_direction'],
    supportScope: ['碳钢带卷成卷批次退火与罩式退火设备的应用映射'],
    applicability:
      '仅用于碳钢带卷成卷退火；不自动延伸到铝卷、展开连续处理、特定气氛数值或苏能能力。',
    notes: '卷重、堆叠、循环路径、表面目标和气氛要求仍需工程确认。',
  },
  'candidate-appmap-long-products-roller-thermal': {
    standardNumber: '官网应用技术资料',
    standardTitle: 'Roller Hearth Furnace for Pipe & Tube',
    issuingBody: 'Tenova LOI Thermprocess',
    versionOrYear: '官网当前页面（2026-08-27核验）',
    status: 'current',
    evidenceRole: 'verified_application_mapping',
    evidenceType: 'application_mapping',
    publishDate: null,
    effectiveDate: null,
    replacedDate: null,
    transitionEndDate: null,
    successorEvidenceId: null,
    officialUrl: 'https://tenova.com/technologies/roller-hearth-furnace-pipe-tube',
    accessLevel: 'full_text',
    verificationStatus: 'full_text_verified',
    verifiedAt,
    verificationMethod: '核对官方页面对钢管、棒材的连续辊底式处理和退火/正火工艺描述',
    clauseRefs: ['Continuous roller hearth plants for tubes and bars', 'Normalizing and annealing'],
    pageRefs: [],
    supportedClaimLevels: ['equipment_direction'],
    supportScope: ['无缝钢管、焊接钢管和圆钢棒的连续辊底式退火或正火应用映射'],
    applicability:
      '仅用于整管或整棒的连续退火/正火；不自动延伸到型钢、调质整线、线速度或苏能能力。',
    notes: '辊道支撑、直线度、装载外形、节拍和换型条件必须明确。',
  },
  'candidate-appmap-wire-coil-bell': {
    standardNumber: '官网应用技术资料',
    standardTitle: 'Bell annealer for steel wire coils',
    issuingBody: 'EBNER Industrieofenbau',
    versionOrYear: '官网当前页面（2026-08-27核验）',
    status: 'current',
    evidenceRole: 'verified_application_mapping',
    evidenceType: 'application_mapping',
    publishDate: null,
    effectiveDate: null,
    replacedDate: null,
    transitionEndDate: null,
    successorEvidenceId: null,
    officialUrl: 'https://www.ebner.cc/en/bell-annealer-for-steel-wire-en',
    accessLevel: 'full_text',
    verificationStatus: 'full_text_verified',
    verifiedAt,
    verificationMethod: '核对官方页面对钢丝卷、罩式退火、球化和再结晶退火的直接描述',
    clauseRefs: ['Bell annealer for steel wire coils', 'Spheroidizing and recrystallizing'],
    pageRefs: [],
    supportedClaimLevels: ['equipment_direction'],
    supportScope: ['盘条卷或钢丝卷的罩式球化退火和再结晶退火应用映射'],
    applicability:
      '仅用于成卷钢丝或盘条的球化/再结晶退火；不包括该规则中尚无直接资料支持的去应力退火pair。',
    notes: '卷重、堆叠、卷内外循环、气氛和冷却边界仍须工程确认。',
  },
  'candidate-appmap-fastener-mesh-quench-temper': {
    standardNumber: '官网产品技术资料',
    standardTitle: 'Mesh Belt Continuous Furnace',
    issuingBody: 'AFC-Holcroft',
    versionOrYear: '官网当前页面（2026-08-27核验）',
    status: 'current',
    evidenceRole: 'verified_application_mapping',
    evidenceType: 'application_mapping',
    publishDate: null,
    effectiveDate: null,
    replacedDate: null,
    transitionEndDate: null,
    successorEvidenceId: null,
    officialUrl:
      'https://www.afc-holcroft.com/systems-and-components/mesh-belt-continuous-furnace/',
    accessLevel: 'full_text',
    verificationStatus: 'full_text_verified',
    verifiedAt,
    verificationMethod: '核对官方页面对紧固件、连续网带输送、淬火、清洗和回火整线的直接描述',
    clauseRefs: ['Typical applications: fasteners', 'Heating, quenching, washing and tempering'],
    pageRefs: [],
    supportedClaimLevels: ['equipment_direction'],
    supportScope: ['高强螺栓和六角螺母等紧固件的连续网带式调质整线应用映射'],
    applicability:
      '仅用于形状和装料适合网带连续处理的螺栓和螺母调质；不自动延伸到未明确类型的销件或链条零件。',
    notes: '黏连风险、堆积密度、气氛、淬火转移和完整调质工艺链必须明确。',
  },
};

for (const record of evidenceData.evidence) {
  const update = evidenceUpdates[record.evidenceId];
  if (update) Object.assign(record, update);
}
writeJson(evidencePath, evidenceData);

const rulePath = join(dataDir, 'industry-direction-rules.json');
const routePath = join(dataDir, 'process-routes.json');
const taxonomyPath = join(dataDir, 'process-taxonomy.json');
const catalogPath = join(dataDir, 'workpiece-card-manifest.json');
const labelPath = join(dataDir, 'industry-public-label-mapping.json');
const templatePath = join(dataDir, 'industry-public-claim-templates.json');
const baselinePath = join(dataDir, 'industry-baseline-versions.json');
const resolverPath = join(dataDir, 'industry-resolver-config.json');
const rulesData = readJson(rulePath);
const routesData = readJson(routePath);
const taxonomyData = readJson(taxonomyPath);
const catalogData = readJson(catalogPath);
const labelData = readJson(labelPath);
const templateData = readJson(templatePath);
const baselineData = readJson(baselinePath);
const resolverData = readJson(resolverPath);

const newEvidenceHash = sha256(evidenceData);
resolverData.snapshot.evidenceSnapshotHash = newEvidenceHash;
const currentDraft = baselineData.versions.find(
  (version) => version.baselineVersion === baselineData.currentDraftVersion,
);
if (!currentDraft) throw new Error('Current draft baseline is missing');
currentDraft.evidenceSnapshotHash = newEvidenceHash;
writeJson(resolverPath, resolverData);
writeJson(baselinePath, baselineData);

const cards = catalogData.categories.flatMap((category) =>
  category.cards.map((card) => ({
    ...card,
    categoryId: category.id,
    categoryLabel: category.label,
  })),
);
const cardById = new Map(cards.map((card) => [card.id, card]));
const routeById = new Map(routesData.routes.map((route) => [route.id, route]));
const ruleById = new Map(rulesData.rules.map((rule) => [rule.ruleId, rule]));

const candidateDefinitions = [
  {
    ruleId: 'eqdir-heavy-car-bottom-v1',
    evidenceId: 'candidate-appmap-heavy-car-bottom',
    select: (pair) => pair.workpieceId !== 'large-die-block-forging',
    equipmentDirection: '台车式周期炉',
    requiredConditions:
      '大型钢铸件或锻件；整件退火、正火或单独回火；批次生产；移动炉床承载；装载外形、重量、重心、支撑和上下料路径均经服务端确认兼容',
    directSupport:
      'Surface Combustion官方资料直接支持台车式批次炉、移动炉床承载，以及铸件/锻件/轴类的退火、正火和回火应用。',
    engineeringDerivation:
      '将工件属于大型钢铸锻件、工艺为整件热处理、批次运行和服务端工程兼容性结合，条件推导为台车式周期炉。',
    remainingConfirmation: '材质和牌号、有效装载空间、单件与工装重量、重心、支撑跨距、上下料路径',
    riskLevel: '中',
    excludedPairReason: '大型模块锻件属于本批明确排除的模具专项。',
  },
  {
    ruleId: 'eqdir-wear-plate-quench-temper-line-v2',
    evidenceId: 'candidate-appmap-wear-plate-quench-temper',
    select: () => true,
    equipmentDirection: '辊底式连续调质热处理线',
    requiredConditions:
      '耐磨钢板整板调质；生产条件支持连续处理；奥氏体化、转移、淬火、回火和最终冷却阶段完整；板形、辊道支撑和淬火转移经服务端确认兼容',
    directSupport: 'Tenova LOI官方技术手册直接将耐磨钢厚板与奥氏体化、淬火、回火连续调质线对应。',
    engineeringDerivation:
      '以耐磨板工件、完整调质工艺链、连续生产决策和板形/转移兼容性为条件，推导辊底式连续调质线。',
    remainingConfirmation:
      '钢种与供货状态、板尺与板厚、板形目标、淬火介质与冷却要求、产能和换型频率',
    riskLevel: '中高',
    excludedPairReason: '无；本规则仅1个pair。',
  },
  {
    ruleId: 'eqdir-carbon-steel-coil-bell-batch-v2',
    evidenceId: 'candidate-appmap-carbon-steel-coil-bell',
    select: () => true,
    equipmentDirection: '罩式周期炉',
    requiredConditions:
      '碳钢带卷成卷退火；成卷批次装料；卷材堆叠、炉内循环路径、表面目标和气氛要求经工程确认',
    directSupport: 'EBNER官方资料直接支持碳钢带卷使用罩式退火设备进行成卷退火。',
    engineeringDerivation:
      '将碳钢带卷、成卷退火、批次生产和卷材支撑/循环兼容性结合，推导罩式周期炉。',
    remainingConfirmation: '材料牌号、带宽、卷径、卷重、堆叠方式、表面质量和气氛要求',
    riskLevel: '中',
    excludedPairReason: '无；本规则仅1个pair。',
  },
  {
    ruleId: 'eqdir-long-products-roller-thermal-v2',
    evidenceId: 'candidate-appmap-long-products-roller-thermal',
    select: (pair) => pair.workpieceId !== 'structural-section-steel',
    equipmentDirection: '辊底式连续热处理炉/线',
    requiredConditions:
      '无缝钢管、焊接钢管或圆钢棒整材退火/正火；产能、品种和装料连续性共同支持连续生产；辊道支撑、直线度和装载尺寸经服务端确认兼容',
    directSupport: 'Tenova官方资料直接支持钢管、棒材的连续辊底式热处理，并列出退火和正火工艺。',
    engineeringDerivation:
      '以整管/整棒、退火或正火、连续运行决策、辊道支撑和直线度兼容性为条件，推导辊底式连续热处理炉/线。',
    remainingConfirmation:
      '材质、截面、长度和重量、直线度或变形要求、批量、产能、换型频率和上下料连续性',
    riskLevel: '中',
    excludedPairReason: '型钢pair没有被本次官方应用资料直接覆盖，继续内部使用。',
  },
  {
    ruleId: 'eqdir-wire-coil-bell-v1',
    evidenceId: 'candidate-appmap-wire-coil-bell',
    select: (pair) => pair.processVariantId !== 'stress-relief',
    equipmentDirection: '罩式周期炉',
    requiredConditions:
      '盘条卷或钢丝卷成卷球化/再结晶退火；批次装料；卷材堆叠、炉内循环、气氛和冷却边界经工程确认',
    directSupport: 'EBNER官方资料直接支持钢丝卷的罩式退火，并明确列出球化和再结晶退火。',
    engineeringDerivation:
      '将成卷盘条/钢丝、球化或再结晶退火、批次生产和卷材堆叠/循环兼容性结合，推导罩式周期炉。',
    remainingConfirmation: '材料和线径、卷径与卷重、堆叠方式、表面与气氛要求、卷内外循环和冷却边界',
    riskLevel: '中',
    excludedPairReason: '去应力退火pair未被本次官方应用资料直接覆盖。',
  },
  {
    ruleId: 'eqdir-fastener-mesh-quench-temper-v2',
    evidenceId: 'candidate-appmap-fastener-mesh-quench-temper',
    select: (pair) => ['high-strength-bolts', 'hex-nuts'].includes(pair.workpieceId),
    equipmentDirection: '网带式调质热处理线',
    requiredConditions:
      '高强螺栓或六角螺母整体调质；批量、产能和上料连续性支持连续生产；奥氏体化、转移、淬火、回火和最终冷却完整；形状、装料密度和淬火转移经服务端确认兼容',
    directSupport:
      'AFC-Holcroft官方资料直接将紧固件与连续网带式热处理线对应，并列出加热、淬火、清洗和回火工艺链。',
    engineeringDerivation:
      '以螺栓/螺母、完整调质工艺链、连续生产决策、网带承载和淬火转移兼容性为条件，推导网带式调质线。',
    remainingConfirmation:
      '材料和强度等级、规格与形状、装料密度与黏连风险、气氛、淬火与冷却要求、产能和换型频率',
    riskLevel: '中高',
    excludedPairReason: '钢销不能仅凭名称等同为适合网带处理的紧固件，本批不入选。',
  },
];

const prior = existsSync(candidatePath) ? readJson(candidatePath) : null;
const createdAt =
  prior?.baselineVersion === 'industry-public-baseline-2026-08-batch2.5-candidate-v1'
    ? prior.createdAt
    : new Date().toISOString();

const selectedRuleRows = candidateDefinitions.map((definition) => {
  const rule = ruleById.get(definition.ruleId);
  if (!rule) throw new Error(`Missing candidate rule: ${definition.ruleId}`);
  if (rule.internalExecutionStatus !== 'eligible') {
    throw new Error(`Candidate rule is not eligible: ${definition.ruleId}`);
  }
  const selectedPairs = rule.allowedPairs.filter(definition.select).map((pair) => {
    const route = routeById.get(pair.routeId);
    const purpose = route?.processVariants.find(
      (variant) =>
        variant.id === pair.processVariantId || variant.processPurposeId === pair.processVariantId,
    );
    const workpiece = cardById.get(pair.workpieceId);
    return {
      pairKey: pairKey(pair),
      routeId: pair.routeId,
      workpieceId: pair.workpieceId,
      workpieceName: workpiece?.name ?? pair.workpieceId,
      categoryId: workpiece?.categoryId ?? null,
      categoryName: workpiece?.categoryLabel ?? null,
      processPurposeId: pair.processVariantId,
      processPurposeName: purpose?.label ?? pair.processVariantId,
      evidenceStatus: 'taxonomy_and_application_mapping_verified',
      evidenceRefs: ['tech-us-doe-process-heating-sourcebook3-2015', definition.evidenceId],
    };
  });
  const selectedKeys = new Set(selectedPairs.map((pair) => pair.pairKey));
  const excludedPairs = rule.allowedPairs
    .filter((pair) => !selectedKeys.has(pairKey(pair)))
    .map((pair) => ({ pairKey: pairKey(pair), reason: definition.excludedPairReason }));
  const conditionalPreview = `如果工件和工艺符合本路线，且${definition.requiredConditions}，行业常见设备方向可考虑“${definition.equipmentDirection}”。仍需工程复核，不构成最终选型或苏能供货承诺。`;
  const matchedDirection = `根据已确认的工件、处理目的和工程兼容性条件，行业常见设备方向为“${definition.equipmentDirection}”。仍需确认：${definition.remainingConfirmation}。该结果不代表苏能已确认可提供，也不是最终选型。`;
  const engineeringReview = `当前输入存在不兼容项，或装载、支撑、上下料、工艺链仍有关键条件待复核，暂不形成设备方向。请补充或复核：${definition.remainingConfirmation}。`;
  return {
    ruleId: rule.ruleId,
    sourcePublicationEligibility: rule.publicationEligibility,
    proposedPublicationEligibility: 'conditional_public',
    internalExecutionStatus: rule.internalExecutionStatus,
    publicClaimScope: rule.publicClaimScope,
    equipmentDirection: definition.equipmentDirection,
    evidenceStatus: 'taxonomy_and_application_mapping_verified',
    taxonomyEvidenceRef: 'tech-us-doe-process-heating-sourcebook3-2015',
    applicationMappingEvidenceRef: definition.evidenceId,
    requiredConditions: definition.requiredConditions,
    directSupport: definition.directSupport,
    engineeringDerivation: definition.engineeringDerivation,
    unverifiedCriticalAssumptions: [],
    engineeringGate:
      '规则中的关键假设已转为必须由服务端重新计算且明确为true的工程谓词；任一项为unknown仅显示条件候选，为false进入工程复核。',
    customerNote: `需继续确认：${definition.remainingConfirmation}。`,
    riskLevel: definition.riskLevel,
    recommendation: '建议纳入首版候选包，等待负责人一次性批准',
    selectedPairs,
    excludedPairs,
    publicCopy: {
      conditional_preview: conditionalPreview,
      matched_direction: matchedDirection,
      engineering_review: engineeringReview,
    },
  };
});

const candidateRuleIds = selectedRuleRows.map((row) => row.ruleId);
const candidatePairKeys = selectedRuleRows.flatMap((row) =>
  row.selectedPairs.map((pair) => pair.pairKey),
);
if (candidateRuleIds.length !== 6 || candidatePairKeys.length !== 23) {
  throw new Error(
    `Unexpected candidate scope: ${candidateRuleIds.length} rules / ${candidatePairKeys.length} pairs`,
  );
}

const excludedRuleRows = rulesData.rules.map((rule) => {
  const candidate = selectedRuleRows.find((item) => item.ruleId === rule.ruleId);
  let reason;
  if (candidate) {
    reason = candidate.excludedPairs.length
      ? `部分入选；${candidate.excludedPairs.length}个pair排除：${candidate.excludedPairs[0].reason}`
      : '全部允许pair已进入候选包。';
  } else if (['blocked', 'pending_blocked'].includes(rule.internalExecutionStatus)) {
    reason = `${rule.internalExecutionStatus}：当前不参与候选或公开。`;
  } else {
    const specialPairPattern =
      /gas-cylinder|aluminum-alloy-cylinder|lpg-cylinder|adi|austemper|local|field|induction|large-die-block|mold|vacuum|salt/i;
    const specialPairCount = rule.allowedPairs.filter((pair) =>
      specialPairPattern.test(pairKey(pair)),
    ).length;
    if (specialPairCount === rule.allowedPairs.length) {
      reason = '属于本批明确排除的气瓶、ADI、局部/现场、模具或特殊设备范围。';
    } else if (specialPairCount > 0) {
      reason = `其中${specialPairCount}个pair属本批明确排除范围；其余pair仍缺少能直接覆盖具体工件、处理目的和设备方向的应用级证据。`;
    } else {
      reason = '本批未取得能直接覆盖具体工件、处理目的和设备方向的应用级证据，继续保持内部。';
    }
  }
  return {
    ruleId: rule.ruleId,
    internalExecutionStatus: rule.internalExecutionStatus,
    publicationEligibility: rule.publicationEligibility,
    allowedPairCount: rule.allowedPairs.length,
    selectedPairCount: candidate?.selectedPairs.length ?? 0,
    excludedPairCount: rule.allowedPairs.length - (candidate?.selectedPairs.length ?? 0),
    selectionStatus: candidate
      ? candidate.excludedPairs.length
        ? 'partial_candidate'
        : 'full_candidate'
      : 'not_selected',
    reason,
  };
});

const frozenFiles = [
  'data/workpiece-router/industry-direction-rules.json',
  'data/workpiece-router/process-routes.json',
  'data/workpiece-router/process-taxonomy.json',
  'data/workpiece-router/logic-unit-content-seed.json',
  'data/workpiece-router/industry-evidence-registry.json',
  'data/workpiece-router/industry-public-claim-templates.json',
  'data/workpiece-router/industry-public-label-mapping.json',
  'data/workpiece-router/industry-resolver-config.json',
  'backend/src/modules/workpiece-router/engineering-resolver.ts',
  'backend/src/modules/workpiece-router/workpiece-router.service.ts',
  'backend/src/modules/workpiece-router/workpiece-router.controller.ts',
  'backend/src/modules/workpiece-router/dto/resolve-workpiece-router.dto.ts',
  'backend/src/modules/custom-requirement/custom-requirement.controller.ts',
  'backend/src/modules/custom-requirement/custom-requirement.service.ts',
  'backend/src/modules/custom-requirement/dto/create-custom-requirement.dto.ts',
  'frontend/src/components/home/WorkpieceRouter.tsx',
  'frontend/src/components/home/HomepageLeadForm.tsx',
  'frontend/src/lib/api/workpiece-router.ts',
  'frontend/src/lib/api/homepage-requirements.ts',
  'backend/prisma/schema.prisma',
  'backend/prisma/migrations/20260827103000_workpiece_router_context/migration.sql',
  'backend/src/modules/workpiece-router/engineering-resolver.spec.ts',
  'backend/src/modules/workpiece-router/batch2.5-candidate.spec.ts',
  'backend/src/modules/workpiece-router/workpiece-router.controller.spec.ts',
  'backend/src/modules/workpiece-router/workpiece-router.service.spec.ts',
  'backend/src/modules/custom-requirement/custom-requirement.service.spec.ts',
  'backend/src/modules/custom-requirement/custom-requirement.controller.spec.ts',
  'backend/src/modules/custom-requirement/dto/create-custom-requirement.dto.spec.ts',
  'backend/src/modules/custom-requirement/workpiece-context-migration.spec.ts',
  'frontend/src/lib/workpiece-router-2.4a.spec.ts',
  'frontend/src/lib/workpiece-router-data.spec.ts',
  'frontend/src/lib/api/homepage-requirements.spec.ts',
  'frontend/package.json',
  'frontend/playwright.integration.config.ts',
  'frontend/tests/integration/workpiece-router-inquiry-chain.spec.ts',
  'frontend/tests/visual/workpiece-router-batch2.4a.spec.ts',
  'admin/src/pages/content/CustomRequirementPage.tsx',
  'admin/src/pages/content/CustomRequirementPage.spec.ts',
  'scripts/validate-workpiece-router.mjs',
  'scripts/generate-workpiece-router-batch2.5.mjs',
  'docs/independent-site-v2/database-migration-registry.md',
].map((path) => ({ path, sha256: fileHash(join(root, path)) }));

const evidenceSnapshot = evidenceData.evidence.filter((record) =>
  [
    'tech-us-doe-process-heating-sourcebook3-2015',
    ...candidateDefinitions.map((item) => item.evidenceId),
  ].includes(record.evidenceId),
);
const publicCopySnapshot = selectedRuleRows.map(({ ruleId, equipmentDirection, publicCopy }) => ({
  ruleId,
  equipmentDirection,
  publicCopy,
}));
const codeAndDataSnapshotHash = sha256(frozenFiles);
const publicCopySnapshotHash = sha256(publicCopySnapshot);
const evidenceSnapshotHash = sha256(evidenceSnapshot);
const approvalScope = {
  candidateRuleIds,
  candidatePairKeys: [...candidatePairKeys].sort(),
  claimLabel: '行业常见设备方向',
  excludesCompanyCapabilityCommitment: true,
  excludesProductLinks: true,
  excludesUnverifiedNumericParameters: true,
};
const approvalScopeHash = sha256(approvalScope);
const snapshotHash = sha256({
  baselineVersion: 'industry-public-baseline-2026-08-batch2.5-candidate-v1',
  approvalScopeHash,
  evidenceSnapshotHash,
  publicCopySnapshotHash,
  codeAndDataSnapshotHash,
});

const candidateSnapshot = {
  schemaVersion: '2.5.0',
  baselineVersion: 'industry-public-baseline-2026-08-batch2.5-candidate-v1',
  status: 'awaiting_responsible_owner_approval',
  createdAt,
  sourceDraftVersion: baselineData.currentDraftVersion,
  productionPublicBaselineVersion: baselineData.publicBaselineVersion,
  productionPublicRuleCount: 0,
  candidateRuleIds,
  pairScope: candidatePairKeys,
  candidateRuleCount: candidateRuleIds.length,
  candidatePairCount: candidatePairKeys.length,
  evidenceSnapshotHash,
  publicCopySnapshotHash,
  codeAndDataSnapshotHash,
  approvalScopeHash,
  snapshotHash,
  approvalScope,
  approvalRecord: {
    approvedBy: null,
    approverRole: null,
    approvedAt: null,
    baselineVersion: null,
    snapshotHash: null,
    lockedAt: null,
  },
  candidateRules: selectedRuleRows,
  evidenceSnapshot,
  publicCopySnapshot,
  frozenFiles,
  allRuleSelectionStatus: excludedRuleRows,
  exclusions: [
    '9条气瓶路线',
    '铝瓶固溶淬火转移',
    'ADI等温淬火',
    '局部感应和现场局部处理',
    '模具新增分类',
    '真空、盐浴及无法确认苏能范围的特殊设备',
  ],
};
writeJson(candidatePath, candidateSnapshot);

const candidateTable = selectedRuleRows
  .flatMap((row) =>
    row.selectedPairs.map(
      (pair) =>
        `| ${cleanCell(row.ruleId)} | ${cleanCell(pair.workpieceName)} | ${cleanCell(pair.processPurposeName)} | ${cleanCell(row.equipmentDirection)} | ${cleanCell(row.riskLevel)} |`,
    ),
  )
  .join('\n');
const copySections = selectedRuleRows
  .map(
    (row, index) =>
      `### ${index + 1}. ${row.equipmentDirection}\n\n- 规则：\`${row.ruleId}\`\n- 入选pair：${row.selectedPairs.length}个\n- 证据状态：通用分类证据＋应用级对应证据均已核验\n- 条件预览完整文案：${row.publicCopy.conditional_preview}\n- 明确命中完整文案：${row.publicCopy.matched_direction}\n- 工程复核完整文案：${row.publicCopy.engineering_review}`,
  )
  .join('\n\n');
const exclusionTable = excludedRuleRows
  .map(
    (row) =>
      `| ${cleanCell(row.ruleId)} | ${cleanCell(row.internalExecutionStatus)} | ${cleanCell(row.selectionStatus)} | ${row.selectedPairCount}/${row.allowedPairCount} | ${cleanCell(row.reason)} |`,
  )
  .join('\n');

const md = `# 工件路由第2.5批首版公开基线候选包\n\n生成时间：${createdAt}\n\n## 一句话结论\n\n当前已冻结6条规则、23个工件—处理目的pair作为首版公开候选；尚未填写批准人，生产仍为0条公开。\n\n## 审批摘要\n\n- 候选基线版本：\`${candidateSnapshot.baselineVersion}\`\n- 候选规则：${candidateSnapshot.candidateRuleCount}条\n- 候选pair：${candidateSnapshot.candidatePairCount}个\n- 设备方向：${[...new Set(selectedRuleRows.map((row) => row.equipmentDirection))].join('、')}\n- 公开统一标题：“行业常见设备方向”\n- 批准记录：批准人、职责、时间和锁定时间均为空\n- 冻结哈希：见 \`workpiece-router-batch2.5-snapshot-hashes.json\`；发起批准时必须以其 \`snapshotHash\` 为唯一对象\n\n## 候选pair\n\n| 规则 | 工件 | 处理目的 | 行业常见设备方向 | 风险 |\n| --- | --- | --- | --- | --- |\n${candidateTable}\n\n## 负责人将看到的完整文案\n\n${copySections}\n\n## 证据边界\n\n本批已核对美国能源部第三版通用分类资料，以及Surface Combustion、Tenova LOI Thermprocess、EBNER、AFC-Holcroft官方应用资料。应用资料只支持“具体工件/工艺与设备类型的行业应用对应”，不支持未核实的温度、时间、转移秒数、装载上限，也不代表苏能能力或供货承诺。\n\n## 全部56条规则的入选与排除状态\n\n| 规则 | 内部执行状态 | 首版状态 | 入选pair/总pair | 原因 |\n| --- | --- | --- | ---: | --- |\n${exclusionTable}\n\n## 明确排除范围\n\n${candidateSnapshot.exclusions.map((item) => `- ${item}`).join('\n')}\n\n## 负责人审批检查点\n\n本文档生成后必须停止。负责人批准前，不修改源规则的 \`publicationEligibility\`，不填写批准人或批准时间，不把候选包写入生产公开快照。\n\n负责人应同时查看本文档、规则矩阵和哈希清单，以 \`snapshotHash\` 确认唯一版本。批准后若任一被冻结文件改变，必须生成新基线版本，不能覆盖本候选包。\n`;
writeFileSync(candidateDocPath, md);

console.log(
  `OK batch2.5 candidate: ${candidateRuleIds.length} rules, ${candidatePairKeys.length} pairs, snapshot ${snapshotHash}`,
);
console.log(relative(root, candidatePath));
console.log(relative(root, candidateDocPath));
