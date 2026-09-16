import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dataDir = join(root, 'data/workpiece-router');
const docsDir = join(root, 'docs/independent-site-v2');
const baselineVersion = 'industry-public-baseline-2026-08-batch2.5-candidate-v2';
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
    .update(Buffer.isBuffer(value) ? value : JSON.stringify(canonicalize(value)))
    .digest('hex')}`;
const fileHash = (path) => sha256(readFileSync(join(root, path)));
const pairKey = (pair) => `${pair.workpieceId}|${pair.routeId}|${pair.processVariantId}`;
const cleanCell = (value) => String(value ?? '').replaceAll('|', '｜').replaceAll('\n', '<br>');
const accessedAt = '2026-08-28T00:35:00+08:00';

const evidencePath = join(dataDir, 'industry-evidence-registry.json');
const rulePath = join(dataDir, 'industry-direction-rules.json');
const routePath = join(dataDir, 'process-routes.json');
const taxonomyPath = join(dataDir, 'process-taxonomy.json');
const catalogPath = join(dataDir, 'workpiece-card-manifest.json');
const labelPath = join(dataDir, 'industry-public-label-mapping.json');
const templatePath = join(dataDir, 'industry-public-claim-templates.json');
const baselinePath = join(dataDir, 'industry-baseline-versions.json');
const resolverPath = join(dataDir, 'industry-resolver-config.json');
const genericCandidatePath = join(
  dataDir,
  'industry-public-baseline-candidate-batch2.5.json',
);
const versionedCandidatePath = join(
  dataDir,
  'industry-public-baseline-candidate-batch2.5-candidate-v2.json',
);
const genericCandidateDocPath = join(
  docsDir,
  'workpiece-router-batch2.5-public-baseline-candidate.md',
);
const versionedCandidateDocPath = join(
  docsDir,
  'workpiece-router-batch2.5-candidate-v2-public-baseline-candidate.md',
);
const technicalSnapshotPath = join(
  docsDir,
  'workpiece-router-batch2.5.1-technical-snapshot.json',
);

const evidenceData = readJson(evidencePath);
const evidenceRecords = [
  {
    evidenceId: 'candidate-appmap-can-eng-car-bottom',
    standardNumber: '原厂应用资料',
    standardTitle: 'Car Bottom Furnace Systems',
    issuingBody: 'CAN-ENG Furnaces International Limited',
    versionOrYear: '官网当前页面（2026-08-28核验）',
    status: 'current',
    evidenceRole: 'verified_application_mapping',
    evidenceType: 'application_mapping',
    officialUrl:
      'https://www.can-eng.com/industrial-furnaces/custom-steel-plant-furnace-systems/details/car-bottom',
    accessLevel: 'full_text',
    verificationStatus: 'full_text_verified',
    supportedClaimLevels: ['equipment_direction'],
    clauseRefs: ['Car Bottom Furnace Systems', 'Processes', 'Applications', 'Types'],
    pageRefs: ['页面第18-85行对应段落'],
    supportScope: [
      '台车式设备属于批次炉',
      '退火、正火等工艺与锻件、长件应用',
      '台车承载适合侧向或上方装载以及长件',
    ],
    applicability:
      '只支持台车式批次炉的一般应用边界；不单独证明每个具体工件pair，不支持装载上限、温度或苏能制造能力。',
    notes: '与NUTEC Bickley应用资料及服务端工况门禁组合使用。',
    issuer: 'CAN-ENG Furnaces International Limited',
    title: 'Car Bottom Furnace Systems',
    url:
      'https://www.can-eng.com/industrial-furnaces/custom-steel-plant-furnace-systems/details/car-bottom',
    accessedAt,
    supportedClaims: [
      'Car bottom is a batch type furnace.',
      'Applications include forgings and long length products; processes include annealing and normalizing.',
    ],
    paragraphRefs: ['Overview', 'The Benefits', 'Processes', 'Applications', 'Types'],
    contentHash: 'sha256:3053f5e338f4d4479100b24fa04f96100f137f53125c4d5cefa7df23b15a5a99',
    contentHashAlgorithm: 'sha256-source-bytes-v1',
    unsupportedBoundaries: [
      '不直接证明大型锻制法兰、大型轴类锻件或大型铸钢件的每个处理目的pair',
      '不证明任何数值参数、最终规格或苏能能力',
    ],
  },
  {
    evidenceId: 'candidate-appmap-nutec-car-bottom',
    standardNumber: '原厂应用资料',
    standardTitle: 'Car Bottom Furnaces',
    issuingBody: 'NUTEC Bickley',
    versionOrYear: '官网当前页面（2026-08-28核验）',
    status: 'current',
    evidenceRole: 'verified_application_mapping',
    evidenceType: 'application_mapping',
    officialUrl:
      'https://www.nutecbickley.com/what-we-do/furnaces-for-metals/car-bottom-furnaces',
    accessLevel: 'full_text',
    verificationStatus: 'full_text_verified',
    supportedClaimLevels: ['equipment_direction'],
    clauseRefs: ['Large and heavy loads', 'Applications of car bottom furnaces'],
    pageRefs: ['页面“CAR BOTTOM FURNACES”“Applications”段落'],
    supportScope: [
      '大型或重载、异形工件的批次移动炉床承载',
      '退火、正火、应力消除和回火应用',
      '锻造与铸造行业应用范围',
    ],
    applicability:
      '用于大型或重载钢件与台车式批次炉的应用映射；具体卧式支撑、装载外形和变形条件必须由服务端验证。',
    notes: '不引用页面中的通用最大能力数值作为本候选或苏能能力。',
    issuer: 'NUTEC Bickley',
    title: 'Car Bottom Furnaces',
    url: 'https://www.nutecbickley.com/what-we-do/furnaces-for-metals/car-bottom-furnaces',
    accessedAt,
    supportedClaims: [
      'Car bottom furnaces are used for large and heavy unusual parts and batch handling.',
      'Applications include annealing, normalizing and tempering of large workpieces.',
    ],
    paragraphRefs: [
      'CAR BOTTOM FURNACES',
      'Advantages of car bottom furnaces',
      'Applications of car bottom furnaces',
    ],
    contentHash: 'sha256:94980769b3d05b7af1fc4805042b2ec281397a4e859e7aeea3d08c31cc594d77',
    contentHashAlgorithm: 'sha256-source-bytes-v1',
    unsupportedBoundaries: [
      '不直接确定具体装载规格、支撑方案或变形控制',
      '不证明苏能供货范围或最终选型',
    ],
  },
  {
    evidenceId: 'candidate-appmap-nutec-forging',
    standardNumber: '原厂行业应用资料',
    standardTitle: 'Forging Furnaces Solutions',
    issuingBody: 'NUTEC Bickley',
    versionOrYear: '官网当前页面（2026-08-28核验）',
    status: 'current',
    evidenceRole: 'verified_application_mapping',
    evidenceType: 'application_mapping',
    officialUrl: 'https://www.nutecbickley.com/industries/forging',
    accessLevel: 'full_text',
    verificationStatus: 'full_text_verified',
    supportedClaimLevels: ['equipment_direction'],
    clauseRefs: ['Car Bottom Furnaces: used for heavy or oversized forgings', 'Common applications'],
    pageRefs: ['页面“Forging Industry”“Common applications”段落'],
    supportScope: [
      '大型或超尺寸锻件使用台车式批次炉的应用映射',
      '锻造行业应用示例包括法兰和轴类零件',
    ],
    applicability:
      '只用于大型锻制法兰和大型轴类锻件的条件性应用对应；卧式支撑和变形门禁仍须逐项满足。',
    notes: '不把行业示例解释成任何工件必然采用台车炉。',
    issuer: 'NUTEC Bickley',
    title: 'Forging Furnaces Solutions',
    url: 'https://www.nutecbickley.com/industries/forging',
    accessedAt,
    supportedClaims: [
      'Car bottom furnaces are used for heavy or oversized forgings.',
      'Forging applications include flanges and axles.',
    ],
    paragraphRefs: ['Car Bottom Furnaces', 'Common applications'],
    contentHash: 'sha256:f5e0621eb5e5dff2bd7cf1125597148016bea376c0a0b86955f5fb2a4944ec7c',
    contentHashAlgorithm: 'sha256-source-bytes-v1',
    unsupportedBoundaries: [
      '不证明任意法兰或轴类都适用',
      '不提供通用长细比阈值或支撑跨距阈值',
    ],
  },
  {
    evidenceId: 'candidate-appmap-can-eng-tube-bar-annealing',
    standardNumber: '原厂应用资料',
    standardTitle: 'Tube and Bar Annealing Furnace Systems',
    issuingBody: 'CAN-ENG Furnaces International Limited',
    versionOrYear: '官网当前页面（2026-08-28核验）',
    status: 'current',
    evidenceRole: 'verified_application_mapping',
    evidenceType: 'application_mapping',
    officialUrl:
      'https://www.can-eng.com/industrial-furnaces/custom-steel-plant-furnace-systems/details/tube-and-bar-annealing',
    accessLevel: 'full_text',
    verificationStatus: 'full_text_verified',
    supportedClaimLevels: ['equipment_direction'],
    clauseRefs: ['Anneal or Normalize', 'Applications: Round Bars, Tubes/Bars', 'Continuous Type'],
    pageRefs: ['页面第18-71行对应段落'],
    supportScope: [
      '钢管和圆钢棒的连续式退火或正火应用',
      '辊底式钢管/棒材退火系统的设备方向',
    ],
    applicability:
      '焊接钢管只适用于整管退火或整管正火；在线焊缝和局部感应处理不在此范围。',
    notes: '不使用页面产能、长度或温度数字作为公开参数。',
    issuer: 'CAN-ENG Furnaces International Limited',
    title: 'Tube and Bar Annealing Furnace Systems',
    url:
      'https://www.can-eng.com/industrial-furnaces/custom-steel-plant-furnace-systems/details/tube-and-bar-annealing',
    accessedAt,
    supportedClaims: [
      'Continuous systems support annealing or normalizing of steel tubes and bars.',
      'Applications include rods, round bars and tubes/bars.',
    ],
    paragraphRefs: ['The Benefits', 'Processes', 'Applications', 'Types'],
    contentHash: 'sha256:43a119443bd871bcd6073b1148ee77ec72801c4d9c238ee63f4dab4473bd978a',
    contentHashAlgorithm: 'sha256-source-bytes-v1',
    unsupportedBoundaries: [
      '不支持在线焊缝或局部感应热处理',
      '不承诺具体产能、长度、温度或苏能制造能力',
    ],
  },
  {
    evidenceId: 'candidate-appmap-can-eng-plate-quench-temper',
    standardNumber: '原厂应用资料',
    standardTitle: 'Plate Quench and Temper Furnace Systems',
    issuingBody: 'CAN-ENG Furnaces International Limited',
    versionOrYear: '官网当前页面（2026-08-28核验）',
    status: 'current',
    evidenceRole: 'verified_application_mapping',
    evidenceType: 'application_mapping',
    officialUrl:
      'https://www.can-eng.com/industrial-furnaces/custom-steel-plant-furnace-systems/details/plate-quench-and-temper',
    accessLevel: 'full_text',
    verificationStatus: 'full_text_verified',
    supportedClaimLevels: ['equipment_direction'],
    clauseRefs: ['Plate Quench and Temper Furnace Systems', 'Fully integrated process chain'],
    pageRefs: ['页面第18-65行对应段落'],
    supportScope: [
      '钢板辊底式调质设备结构',
      '装载、奥氏体化、淬火、回火和卸载完整工艺链',
    ],
    applicability:
      '与Tenova耐磨钢板资料组合用于均质耐磨钢板整体调质；复合、堆焊和覆层耐磨板不在范围。',
    notes: '不使用页面设备规格数字作为公开参数。',
    issuer: 'CAN-ENG Furnaces International Limited',
    title: 'Plate Quench and Temper Furnace Systems',
    url:
      'https://www.can-eng.com/industrial-furnaces/custom-steel-plant-furnace-systems/details/plate-quench-and-temper',
    accessedAt,
    supportedClaims: [
      'Roller hearth furnaces are used for plate quench and temper applications.',
      'The integrated line includes loading, austenitizing, quenching, tempering and unloading.',
    ],
    paragraphRefs: ['Overview', 'The Benefits', 'Processes', 'Applications', 'Types'],
    contentHash: 'sha256:088d754710c1ebeb1cb87b68d37a56acf9815f7fbc8f6b416a81f0d7eccd2b82',
    contentHashAlgorithm: 'sha256-source-bytes-v1',
    unsupportedBoundaries: [
      '不直接证明复合、堆焊或覆层耐磨板适用',
      '不证明具体板尺、温度、产能或苏能能力',
    ],
  },
  {
    evidenceId: 'candidate-appmap-can-eng-fastener-industry',
    standardNumber: '原厂行业应用资料',
    standardTitle: 'Fastener Heat Treatment Solutions',
    issuingBody: 'CAN-ENG Furnaces International Limited',
    versionOrYear: '官网当前页面（2026-08-28核验）',
    status: 'current',
    evidenceRole: 'verified_application_mapping',
    evidenceType: 'application_mapping',
    officialUrl: 'https://www.can-eng.com/industries-served/fastener',
    accessLevel: 'full_text',
    verificationStatus: 'full_text_verified',
    supportedClaimLevels: ['equipment_direction'],
    clauseRefs: ['Continuous Mesh Belt Atmosphere Heat Treatment Systems for fasteners'],
    pageRefs: ['页面第16-40行对应段落'],
    supportScope: ['紧固件高产量连续网带式气氛热处理应用'],
    applicability:
      '只适用于材料、结构、装料方式和完整调质链均满足的钢制紧固件；不能扩展到所有螺母或异种材料。',
    notes: '与CAN-ENG网带整线页面组合使用。',
    issuer: 'CAN-ENG Furnaces International Limited',
    title: 'Fastener Heat Treatment Solutions',
    url: 'https://www.can-eng.com/industries-served/fastener',
    accessedAt,
    supportedClaims: [
      'Fastener manufacturers use continuous mesh belt atmosphere heat treatment systems for high-capacity processing.',
    ],
    paragraphRefs: ['Fastener', 'Heat Treatment Solutions', 'Furnaces used in the Fastener Industry'],
    contentHash: 'sha256:fe160f537f95ded059aef3188d4976b818b5b240c28a0fbad702439df3cd1854',
    contentHashAlgorithm: 'sha256-source-bytes-v1',
    unsupportedBoundaries: [
      '不证明不锈钢、有色、嵌件、自锁或焊接总成螺母的整体调质适用性',
      '不证明具体产能数值或苏能能力',
    ],
  },
  {
    evidenceId: 'candidate-appmap-can-eng-mesh-belt-quench-temper',
    standardNumber: '原厂设备应用资料',
    standardTitle: 'Mesh Belt Atmosphere Furnace Systems',
    issuingBody: 'CAN-ENG Furnaces International Limited',
    versionOrYear: '官网当前页面（2026-08-28核验）',
    status: 'current',
    evidenceRole: 'verified_application_mapping',
    evidenceType: 'application_mapping',
    officialUrl:
      'https://www.can-eng.com/industrial-furnaces/continuous-mesh-belt-furnace-systems/details/mesh-belt-atmosphere',
    accessLevel: 'full_text',
    verificationStatus: 'full_text_verified',
    supportedClaimLevels: ['equipment_direction'],
    clauseRefs: ['Automated loading, hardening, quench, wash and temper line', 'Applications: Fasteners'],
    pageRefs: ['页面第18-97行对应段落'],
    supportScope: ['紧固件网带式加热、淬火、清洗和回火连续整线'],
    applicability:
      '只支持形状、装料密度、材料和完整工艺链均满足的钢制紧固件调质方向。',
    notes: '不把“紧固件”宽泛扩展到所有小件。',
    issuer: 'CAN-ENG Furnaces International Limited',
    title: 'Mesh Belt Atmosphere Furnace Systems',
    url:
      'https://www.can-eng.com/industrial-furnaces/continuous-mesh-belt-furnace-systems/details/mesh-belt-atmosphere',
    accessedAt,
    supportedClaims: [
      'Automated mesh-belt lines include loading, hardening, quenching, washing and tempering.',
      'Applications include fasteners.',
    ],
    paragraphRefs: ['Overview', 'The Benefits', 'Processes', 'Applications', 'Types'],
    contentHash: 'sha256:c9165d02a35e85abe6850fb3b267078815fa2adefeecf998f730fcc6a7e81dd0',
    contentHashAlgorithm: 'sha256-source-bytes-v1',
    unsupportedBoundaries: [
      '不直接证明任何特定螺栓或螺母必然适用',
      '不证明具体温度、速度、产能或苏能能力',
    ],
  },
];

for (const incoming of evidenceRecords) {
  const index = evidenceData.evidence.findIndex((item) => item.evidenceId === incoming.evidenceId);
  if (index >= 0) evidenceData.evidence[index] = { ...evidenceData.evidence[index], ...incoming };
  else evidenceData.evidence.push(incoming);
}

const freezeUpdates = {
  'tech-us-doe-process-heating-sourcebook3-2015': {
    issuer: 'U.S. Department of Energy',
    title: 'Improving Process Heating System Performance: A Sourcebook for Industry, Third Edition',
    url:
      'https://www.energy.gov/sites/prod/files/2016/04/f30/Improving%20Process%20Heating%20System%20Performance%20A%20Sourcebook%20for%20Industry%20Third%20Edition_0.pdf',
    accessedAt,
    supportedClaims: ['General batch/continuous, material handling and furnace taxonomy only.'],
    paragraphRefs: ['Section 2, pages 14-16'],
    contentHash: 'sha256:14a1541f606c59989cfc549962ab632afac4c6be34bc03e792d721123ba43325',
    contentHashAlgorithm: 'sha256-source-bytes-v1',
    unsupportedBoundaries: ['不单独证明任何具体工件对应具体炉型。'],
  },
  'candidate-appmap-heavy-car-bottom': {
    evidenceRole: 'equipment_capability_reference',
    directPairSupport: false,
    issuer: 'Surface Combustion',
    title: 'Lift Cover, Tilt Top & Carbottom Furnaces',
    url: 'https://www.surfacecombustion.com/product/lift-cover-tilt-top-carbottom-furnaces/',
    accessedAt,
    supportedClaims: ['Car-bottom equipment structures can support batch thermal processing.'],
    paragraphRefs: ['Product overview and application lists'],
    contentHash: 'sha256:87ef9f5c9fa6306f3acdeabb7e60bc50cbddae068461fc557988998137e27956',
    contentHashAlgorithm: 'sha256-source-bytes-v1',
    unsupportedBoundaries: [
      '不作为9个pair的逐项直接证据',
      '不支持数值参数、苏能能力或最终选型',
    ],
    supportScope: ['台车式设备的一般结构与能力参考'],
    applicability: '只能作为设备能力资料和条件性工程推导的补充，不单独使任何pair取得公开资格。',
    notes: '第2.5.1批降级；不再表述为9个pair的逐项直接应用证据。',
  },
  'candidate-appmap-wear-plate-quench-temper': {
    issuer: 'Tenova LOI Thermprocess',
    title: 'LOI Thermprocess Image Brochure - Plate Heat Treatment',
    url:
      'https://loi.tenova.com/sites/default/files/files/files_to_zip/2024/LOI_Image_Brochure_EN.pdf',
    accessedAt,
    supportedClaims: ['Abrasion-resistant heavy plate quench and temper line application.'],
    paragraphRefs: ['Page 7, heavy plate heat treatment'],
    contentHash: 'sha256:3e2bff9158680199ea7972725626208af0e54db4ef81cb221c2aa49cfe0eeccf',
    contentHashAlgorithm: 'sha256-source-bytes-v1',
    unsupportedBoundaries: ['不支持复合、堆焊、覆层耐磨板或具体工艺参数。'],
  },
  'candidate-appmap-carbon-steel-coil-bell': {
    issuer: 'EBNER Industrieofenbau',
    title: 'Bell annealer for steel strip coils',
    url: 'https://www.ebner.cc/en/bell-annealer-steel-strip-en',
    accessedAt,
    supportedClaims: ['Carbon steel strip coils can be batch annealed in bell annealers.'],
    paragraphRefs: ['Bell annealer for steel strip coils', 'Carbon steel applications'],
    contentHash: 'sha256:b01025142e28d3be21b30bc574968f106c0e2a572a68e130d544a5708dfd4453',
    contentHashAlgorithm: 'sha256-source-bytes-v1',
    unsupportedBoundaries: ['不支持涂镀、覆层或开卷连续处理。'],
  },
  'candidate-appmap-long-products-roller-thermal': {
    issuer: 'Tenova LOI Thermprocess',
    title: 'Roller Hearth Furnace for Pipe & Tube',
    url: 'https://tenova.com/technologies/roller-hearth-furnace-pipe-tube',
    accessedAt,
    supportedClaims: ['Continuous roller-hearth treatment for whole tubes and bars.'],
    paragraphRefs: ['Technology overview', 'Applications and processes'],
    contentHash: 'sha256:254b7fd03dcaf74e0e11b1f058a9021f2d455c4ee407639e1bca5ba4400c0367',
    contentHashAlgorithm: 'sha256-source-bytes-v1',
    unsupportedBoundaries: ['不支持在线焊缝或局部感应处理。'],
  },
  'candidate-appmap-wire-coil-bell': {
    issuer: 'EBNER Industrieofenbau',
    title: 'Bell annealer for steel wire coils',
    url: 'https://www.ebner.cc/en/bell-annealer-for-steel-wire-en',
    accessedAt,
    supportedClaims: ['Steel wire coils can use bell annealing for spheroidizing or recrystallizing.'],
    paragraphRefs: ['Bell annealer for steel wire coils', 'Processes'],
    contentHash: 'sha256:66677f568e1a9eac3d13711bacdb5c2f881a97d5561e816c141e93709c855e07',
    contentHashAlgorithm: 'sha256-source-bytes-v1',
    unsupportedBoundaries: ['不支持未核实的去应力pair或具体气氛参数。'],
  },
  'candidate-appmap-fastener-mesh-quench-temper': {
    issuer: 'AFC-Holcroft',
    title: 'Mesh Belt Continuous Furnace',
    url: 'https://www.afc-holcroft.com/systems-and-components/mesh-belt-continuous-furnace/',
    accessedAt,
    supportedClaims: ['Fastener mesh-belt lines can include heating, quenching, washing and tempering.'],
    paragraphRefs: ['Typical applications', 'System process chain'],
    contentHash: 'sha256:bdd9a56f107796017c627d2c3ae94ea00257887edc895f1d7c52700966b696fc',
    contentHashAlgorithm: 'sha256-source-bytes-v1',
    unsupportedBoundaries: ['不证明所有螺母结构、材料或装载方式适用。'],
  },
};
for (const record of evidenceData.evidence) {
  if (freezeUpdates[record.evidenceId]) Object.assign(record, freezeUpdates[record.evidenceId]);
}
writeJson(evidencePath, evidenceData);

const rulesData = readJson(rulePath);
const routesData = readJson(routePath);
const taxonomyData = readJson(taxonomyPath);
const catalogData = readJson(catalogPath);
const labelData = readJson(labelPath);
const templateData = readJson(templatePath);
const baselineData = readJson(baselinePath);
const resolverData = readJson(resolverPath);
const ruleById = new Map(rulesData.rules.map((rule) => [rule.ruleId, rule]));

const wholeComponentCriterion = {
  field: 'treatmentScope',
  operator: 'in',
  allowedValues: ['whole_component'],
  requiredForMatch: true,
};
const pairGate = (matchCriteria = [], requiredInputs = [], requiredEngineeringPredicates = []) => ({
  matchCriteria: [wholeComponentCriterion, ...matchCriteria],
  requiredInputs,
  requiredEngineeringPredicates,
  requiredProcessStages: [],
});
const applyRuleClosure = (ruleId, finalSizingInputs, gates, applicationMappingRefs) => {
  const rule = ruleById.get(ruleId);
  if (!rule) throw new Error(`Missing rule ${ruleId}`);
  rule.finalSizingInputs = finalSizingInputs;
  rule.pairDirectionGates = gates;
  for (const [key, refs] of Object.entries(applicationMappingRefs)) {
    if (!rule.pairEvidence?.[key]) throw new Error(`Missing pair evidence ${ruleId}: ${key}`);
    rule.pairEvidence[key].applicationMappingRefs = refs;
  }
};

const heavyRule = ruleById.get('eqdir-heavy-car-bottom-v1');
const heavyGates = {};
for (const pair of heavyRule.allowedPairs) {
  if (pair.workpieceId === 'large-die-block-forging') continue;
  const criteria = [];
  const inputs = [];
  const predicates = ['largeOrHeavy'];
  if (pair.processVariantId === 'tempering') {
    criteria.push(
      {
        field: 'treatmentChainMode',
        operator: 'in',
        allowedValues: ['standalone_tempering'],
        requiredForMatch: true,
      },
      {
        field: 'priorHeatTreatmentState',
        operator: 'in',
        allowedValues: ['after_quench', 'after_normalizing', 'other_defined'],
        requiredForMatch: true,
      },
      {
        field: 'drawingOrProcessCardConfirmed',
        operator: 'in',
        allowedValues: ['true'],
        requiredForMatch: true,
      },
    );
    inputs.push('temperingPurpose');
  }
  if (pair.workpieceId === 'large-forged-shaft') {
    criteria.push(
      {
        field: 'loadingOrientation',
        operator: 'in',
        allowedValues: ['horizontal'],
        requiredForMatch: true,
      },
      {
        field: 'horizontalLoadingAllowed',
        operator: 'in',
        allowedValues: ['true'],
        requiredForMatch: true,
      },
    );
    inputs.push(
      'dimensionLength',
      'shaftEquivalentSectionMm',
      'distortionConstraint',
      'allowableDeflectionMm',
      'supportPointCount',
      'supportPointLayout',
      'supportSpanMm',
      'singlePieceWeightKg',
      'fixtureWeightKg',
      'batchLoadWeightKg',
      'centerOfGravityX',
      'centerOfGravityY',
      'centerOfGravityZ',
    );
    predicates.push(
      'straightnessOrDistortionCompatible',
      'supportCompatible',
      'supportSpanCompatible',
      'centerOfGravityCompatible',
      'handlingPathCompatible',
      'loadCapacityCompatible',
      'loadEnvelopeCompatible',
    );
  }
  heavyGates[pairKey(pair)] = pairGate(criteria, [...new Set(inputs)], [...new Set(predicates)]);
}
const heavyEvidence = {};
for (const key of Object.keys(heavyGates)) {
  const isForging = /large-forged-(flange|shaft)/.test(key);
  heavyEvidence[key] = [
    'candidate-appmap-can-eng-car-bottom',
    'candidate-appmap-nutec-car-bottom',
    ...(isForging ? ['candidate-appmap-nutec-forging'] : []),
    'candidate-appmap-heavy-car-bottom',
  ];
}
applyRuleClosure(
  'eqdir-heavy-car-bottom-v1',
  ['drawingRequirement', 'applicableStandard', 'materialFamily', 'materialGrade', 'processRequirement'],
  heavyGates,
  heavyEvidence,
);

const wearKey = 'wear-resistant-steel-plate|wear-plate-quench-review|quench-temper';
applyRuleClosure(
  'eqdir-wear-plate-quench-temper-line-v2',
  ['drawingRequirement', 'applicableStandard', 'materialFamily', 'materialGrade', 'processRequirement'],
  {
    [wearKey]: pairGate([
      {
        field: 'wearPlateConstruction',
        operator: 'in',
        allowedValues: ['homogeneous'],
        requiredForMatch: true,
      },
      {
        field: 'wholeComponentQuenchTemper',
        operator: 'in',
        allowedValues: ['true'],
        requiredForMatch: true,
      },
    ]),
  },
  {
    [wearKey]: [
      'candidate-appmap-wear-plate-quench-temper',
      'candidate-appmap-can-eng-plate-quench-temper',
    ],
  },
);

const coilKey = 'carbon-steel-coil|coil-professional-line-review|coil-annealing';
applyRuleClosure(
  'eqdir-carbon-steel-coil-bell-batch-v2',
  ['drawingRequirement', 'applicableStandard', 'materialFamily', 'materialGrade', 'processRequirement'],
  {
    [coilKey]: pairGate([
      {
        field: 'coilProcessingForm',
        operator: 'in',
        allowedValues: ['coiled_batch'],
        requiredForMatch: true,
      },
      {
        field: 'coatingState',
        operator: 'in',
        allowedValues: ['uncoated'],
        requiredForMatch: true,
      },
    ]),
  },
  { [coilKey]: ['candidate-appmap-carbon-steel-coil-bell'] },
);

const longRule = ruleById.get('eqdir-long-products-roller-thermal-v2');
const longGates = {};
const longEvidence = {};
for (const pair of longRule.allowedPairs) {
  if (pair.workpieceId === 'structural-section-steel') continue;
  const criteria = [];
  if (pair.workpieceId === 'welded-steel-pipe') {
    criteria.push({
      field: 'pipeTreatmentScope',
      operator: 'in',
      allowedValues: ['whole_pipe'],
      requiredForMatch: true,
    });
  }
  const key = pairKey(pair);
  longGates[key] = pairGate(criteria);
  longEvidence[key] = [
    'candidate-appmap-long-products-roller-thermal',
    'candidate-appmap-can-eng-tube-bar-annealing',
  ];
}
applyRuleClosure(
  'eqdir-long-products-roller-thermal-v2',
  ['drawingRequirement', 'applicableStandard', 'materialFamily', 'materialGrade', 'processRequirement'],
  longGates,
  longEvidence,
);

const wireRule = ruleById.get('eqdir-wire-coil-bell-v1');
const wireGates = {};
const wireEvidence = {};
for (const pair of wireRule.allowedPairs) {
  if (pair.processVariantId === 'stress-relief') continue;
  const key = pairKey(pair);
  wireGates[key] = pairGate();
  wireEvidence[key] = ['candidate-appmap-wire-coil-bell'];
}
applyRuleClosure(
  'eqdir-wire-coil-bell-v1',
  ['drawingRequirement', 'applicableStandard', 'materialFamily', 'materialGrade', 'processRequirement'],
  wireGates,
  wireEvidence,
);

const fastenerRule = ruleById.get('eqdir-fastener-mesh-quench-temper-v2');
const fastenerGates = {};
const fastenerEvidence = {};
for (const pair of fastenerRule.allowedPairs) {
  if (!['high-strength-bolts', 'hex-nuts'].includes(pair.workpieceId)) continue;
  const criteria = [
    {
      field: 'fastenerMaterialClass',
      operator: 'in',
      allowedValues: ['carbon_or_alloy_steel'],
      requiredForMatch: true,
    },
    {
      field: 'wholeComponentQuenchTemper',
      operator: 'in',
      allowedValues: ['true'],
      requiredForMatch: true,
    },
  ];
  if (pair.workpieceId === 'hex-nuts') {
    criteria.push({
      field: 'nutConstruction',
      operator: 'in',
      allowedValues: ['plain_hex'],
      requiredForMatch: true,
    });
  }
  const key = pairKey(pair);
  fastenerGates[key] = pairGate(criteria);
  fastenerEvidence[key] = [
    'candidate-appmap-fastener-mesh-quench-temper',
    'candidate-appmap-can-eng-fastener-industry',
    'candidate-appmap-can-eng-mesh-belt-quench-temper',
  ];
}
applyRuleClosure(
  'eqdir-fastener-mesh-quench-temper-v2',
  ['drawingRequirement', 'applicableStandard', 'materialFamily', 'materialGrade', 'processRequirement'],
  fastenerGates,
  fastenerEvidence,
);

writeJson(rulePath, rulesData);

const priorities = rulesData.rules
  .map(({ ruleId, priority, priorityDetail }) => ({ ruleId, priority, priorityDetail }))
  .sort((left, right) => left.ruleId.localeCompare(right.ruleId));
resolverData.snapshot.ruleSetHash = sha256(rulesData);
resolverData.snapshot.evidenceSnapshotHash = sha256(evidenceData);
resolverData.snapshot.publicLabelMappingHash = sha256(labelData);
resolverData.snapshot.publicClaimTemplateHash = sha256(templateData);
resolverData.snapshot.rulePriorityHash = sha256(priorities);
const currentDraft = baselineData.versions.find(
  (version) => version.baselineVersion === baselineData.currentDraftVersion,
);
if (!currentDraft) throw new Error('Current draft baseline is missing');
Object.assign(currentDraft, resolverData.snapshot);
writeJson(resolverPath, resolverData);
writeJson(baselinePath, baselineData);

const cards = catalogData.categories.flatMap((category) =>
  category.cards.map((card) => ({ ...card, categoryId: category.id, categoryName: category.label })),
);
const cardById = new Map(cards.map((card) => [card.id, card]));
const routeById = new Map(routesData.routes.map((route) => [route.id, route]));
const publicWorkpieceNames = {
  'large-forged-flange': '大型锻制法兰',
  'hex-nuts': '钢制六角螺母（整体调质）',
  'welded-steel-pipe': '焊接钢管（整管处理）',
  'carbon-steel-coil': '碳钢带卷（成卷批次退火）',
  'wear-resistant-steel-plate': '均质耐磨钢板（整体调质）',
};
const definitions = [
  {
    ruleId: 'eqdir-heavy-car-bottom-v1',
    select: (pair) => pair.workpieceId !== 'large-die-block-forging',
    equipmentDirection: '台车式周期炉',
    directSupport:
      'CAN-ENG与NUTEC Bickley原厂资料直接支持大型/重载锻件、铸造行业工件与台车式批次炉的一般应用，以及退火、正火和回火工艺范围；Surface Combustion仅作设备能力补充。',
    engineeringDerivation:
      '具体法兰、轴类锻件和铸钢件方向仍由工件形态、整体处理、批次决策、移动炉床承载及服务端兼容性共同推导。',
    exclusionBoundary:
      '轴类卧式支撑或变形条件不兼容时不得输出；未知时仅显示条件候选。大型模块锻件继续排除。',
    riskLevel: '中高',
  },
  {
    ruleId: 'eqdir-wear-plate-quench-temper-line-v2',
    select: () => true,
    equipmentDirection: '辊底式连续调质热处理线',
    directSupport:
      'CAN-ENG原厂资料直接支持钢板辊底式调质整线及完整工艺链，Tenova资料补充耐磨钢板应用。',
    engineeringDerivation:
      '仅对均质耐磨钢板整体调质，在连续生产、板形支撑、淬火转移和完整工艺链均满足时形成方向。',
    exclusionBoundary: '复合、堆焊和覆层耐磨板全部排除。',
    riskLevel: '中高',
  },
  {
    ruleId: 'eqdir-carbon-steel-coil-bell-batch-v2',
    select: () => true,
    equipmentDirection: '罩式周期炉',
    directSupport: 'EBNER原厂资料直接支持碳钢带卷的罩式成卷批次退火应用。',
    engineeringDerivation:
      '结合成卷批次处理、无涂镀/覆层、卷材堆垛、气氛和服务端兼容性形成方向。',
    exclusionBoundary: '涂镀、覆层或开卷连续处理必须另行判断。',
    riskLevel: '中',
  },
  {
    ruleId: 'eqdir-long-products-roller-thermal-v2',
    select: (pair) => pair.workpieceId !== 'structural-section-steel',
    equipmentDirection: '辊底式连续热处理炉/线',
    directSupport:
      'CAN-ENG与Tenova原厂资料直接支持钢管、圆钢棒的连续式辊底退火或正火应用。',
    engineeringDerivation:
      '整管/整棒、连续生产决策、辊道支撑、直线度和装载兼容性共同形成方向。',
    exclusionBoundary: '焊接钢管只允许整管退火/整管正火；在线焊缝和局部感应处理全部排除。',
    riskLevel: '中',
  },
  {
    ruleId: 'eqdir-wire-coil-bell-v1',
    select: (pair) => pair.processVariantId !== 'stress-relief',
    equipmentDirection: '罩式周期炉',
    directSupport: 'EBNER原厂资料直接支持钢丝卷球化或再结晶罩式退火。',
    engineeringDerivation:
      '成卷工件、批次决策、卷材堆垛、气氛与循环边界共同形成方向。',
    exclusionBoundary: '未被直接资料覆盖的去应力pair继续排除。',
    riskLevel: '中',
  },
  {
    ruleId: 'eqdir-fastener-mesh-quench-temper-v2',
    select: (pair) => ['high-strength-bolts', 'hex-nuts'].includes(pair.workpieceId),
    equipmentDirection: '网带式调质热处理线',
    directSupport:
      'CAN-ENG与AFC-Holcroft原厂资料直接支持紧固件高产量网带式加热、淬火、清洗和回火整线应用。',
    engineeringDerivation:
      '只对材料、结构、散装承载、完整调质链和连续生产条件均满足的钢制紧固件形成方向。',
    exclusionBoundary:
      '钢制六角螺母排除不锈钢、有色、嵌件、自锁、焊接总成和非整体调质；钢销继续排除。',
    riskLevel: '中高',
  },
];

const evidenceById = new Map(evidenceData.evidence.map((record) => [record.evidenceId, record]));
const selectedRuleRows = definitions.map((definition) => {
  const rule = ruleById.get(definition.ruleId);
  const selectedPairs = rule.allowedPairs.filter(definition.select).map((pair) => {
    const key = pairKey(pair);
    const route = routeById.get(pair.routeId);
    const purpose = route?.processVariants.find(
      (variant) =>
        variant.id === pair.processVariantId || variant.processPurposeId === pair.processVariantId,
    );
    const card = cardById.get(pair.workpieceId);
    const applicationRefs = rule.pairEvidence[key].applicationMappingRefs;
    const directApplicationRefs = applicationRefs.filter(
      (id) => evidenceById.get(id)?.directPairSupport !== false,
    );
    if (!directApplicationRefs.length) throw new Error(`No direct application evidence: ${key}`);
    const purposeName =
      pair.processVariantId === 'tempering'
        ? '单独回火'
        : pair.workpieceId === 'welded-steel-pipe'
          ? pair.processVariantId === 'annealing'
            ? '整管退火'
            : '整管正火'
          : purpose?.label ?? pair.processVariantId;
    return {
      pairKey: key,
      workpieceId: pair.workpieceId,
      workpieceName: card?.name ?? pair.workpieceId,
      publicWorkpieceName: publicWorkpieceNames[pair.workpieceId] ?? card?.name ?? pair.workpieceId,
      categoryId: card?.categoryId ?? null,
      categoryName: card?.categoryName ?? null,
      routeId: pair.routeId,
      processPurposeId: pair.processVariantId,
      processPurposeName: purpose?.label ?? pair.processVariantId,
      publicProcessPurposeName: purposeName,
      evidenceStatus: 'application_mapping_verified_with_explicit_boundaries',
      evidenceRefs: [
        'tech-us-doe-process-heating-sourcebook3-2015',
        ...applicationRefs,
      ],
      directApplicationEvidenceRefs: directApplicationRefs,
      directionGate: rule.pairDirectionGates[key],
    };
  });
  const selectedKeys = new Set(selectedPairs.map((pair) => pair.pairKey));
  const excludedPairs = rule.allowedPairs
    .filter((pair) => !selectedKeys.has(pairKey(pair)))
    .map((pair) => ({ pairKey: pairKey(pair), reason: definition.exclusionBoundary }));
  const matchedCopy = `根据当前填写并经服务端规则校验的工况，可优先评估的行业常见设备方向之一为“${definition.equipmentDirection}”。仍须结合图纸、执行标准、材质牌号、最终装载设计、完整工艺链和产能节拍完成工程确认。本结果不构成最终选型、工艺参数或苏能供货与能力承诺。`;
  return {
    ruleId: rule.ruleId,
    sourcePublicationEligibility: rule.publicationEligibility,
    proposedPublicationEligibility: 'conditional_public',
    internalExecutionStatus: rule.internalExecutionStatus,
    publicClaimScope: rule.publicClaimScope,
    equipmentDirection: definition.equipmentDirection,
    evidenceStatus: 'taxonomy_and_application_mapping_verified_with_engineering_boundaries',
    directionGate: {
      ruleMatchCriteria: rule.matchCriteria,
      handlingSignals: rule.handlingInference.requiredSignals,
      operationSignals: rule.operationInference.requiredSignals,
      engineeringPredicates: rule.requiredEngineeringPredicates,
      processStages: rule.requiredProcessStages,
      pairOverrides: rule.pairDirectionGates,
    },
    finalSizingInputs: rule.finalSizingInputs,
    directSupport: definition.directSupport,
    engineeringDerivation: definition.engineeringDerivation,
    unsupportedBoundary: definition.exclusionBoundary,
    unverifiedCriticalAssumptions: [],
    customerNote:
      '最终规格仍须结合图纸、执行标准、材质牌号、最终装载设计、完整工艺链和产能节拍确认。',
    riskLevel: definition.riskLevel,
    recommendation: '建议进入负责人一次性签署候选包，签署前保持0条公开',
    selectedPairs,
    excludedPairs,
    publicCopy: {
      conditional_preview: `如果尚待确认的方向门禁满足，可条件性评估的行业常见设备方向之一为“${definition.equipmentDirection}”。仍须结合图纸、执行标准、材质牌号、最终装载设计、完整工艺链和产能节拍完成工程确认。本结果不构成最终选型、工艺参数或苏能供货与能力承诺。`,
      matched_direction: matchedCopy,
      engineering_review:
        '当前工况存在与候选方向不兼容的关键条件，暂不显示具体炉型，进入工程复核。请提交图纸、执行标准和完整工况，由工程师进一步判断。',
    },
  };
});

const candidateRuleIds = selectedRuleRows.map((row) => row.ruleId);
const candidatePairKeys = selectedRuleRows.flatMap((row) =>
  row.selectedPairs.map((pair) => pair.pairKey),
);
if (candidateRuleIds.length !== 6 || candidatePairKeys.length !== 23) {
  throw new Error(
    `Evidence-backed candidate scope changed: ${candidateRuleIds.length} rules / ${candidatePairKeys.length} pairs`,
  );
}

const allRuleSelectionStatus = rulesData.rules.map((rule) => {
  const selected = selectedRuleRows.find((row) => row.ruleId === rule.ruleId);
  const count = selected?.selectedPairs.length ?? 0;
  return {
    ruleId: rule.ruleId,
    internalExecutionStatus: rule.internalExecutionStatus,
    publicationEligibility: rule.publicationEligibility,
    allowedPairCount: rule.allowedPairs.length,
    selectedPairCount: count,
    excludedPairCount: rule.allowedPairs.length - count,
    selectionStatus: selected ? (count === rule.allowedPairs.length ? 'full_candidate' : 'partial_candidate') : 'not_selected',
    reason: selected
      ? selected.excludedPairs.length
        ? selected.excludedPairs[0].reason
        : '全部允许pair已进入v2候选。'
      : ['blocked', 'pending_blocked'].includes(rule.internalExecutionStatus)
        ? `${rule.internalExecutionStatus}：不参与候选或公开。`
        : '本批未取得足够的具体应用证据或属于明确排除范围，继续保持内部。',
  };
});

const evidenceIds = new Set(
  selectedRuleRows.flatMap((row) => row.selectedPairs.flatMap((pair) => pair.evidenceRefs)),
);
const evidenceSnapshot = evidenceData.evidence.filter((record) => evidenceIds.has(record.evidenceId));
for (const record of evidenceSnapshot) {
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
    if (record[field] == null) throw new Error(`Evidence freeze field missing: ${record.evidenceId}.${field}`);
  }
}

const frozenPaths = [
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
  'backend/src/modules/workpiece-router/dto/resolve-workpiece-router.dto.ts',
  'backend/src/modules/workpiece-router/engineering-resolver.spec.ts',
  'backend/src/modules/workpiece-router/batch2.5-candidate.spec.ts',
  'backend/src/modules/workpiece-router/batch2.5.1-candidate.spec.ts',
  'backend/src/modules/workpiece-router/workpiece-router.service.spec.ts',
  'frontend/src/components/home/WorkpieceRouter.tsx',
  'frontend/src/lib/api/workpiece-router.ts',
  'frontend/src/lib/workpiece-router-2.4a.spec.ts',
  'frontend/tests/visual/workpiece-router-batch2.4a.spec.ts',
  'scripts/validate-workpiece-router.mjs',
  'scripts/generate-workpiece-router-batch2.5.1.mjs',
].sort();
for (const path of frozenPaths) if (!existsSync(join(root, path))) throw new Error(`Missing frozen file ${path}`);
const frozenFiles = frozenPaths.map((path) => ({ path, sha256: fileHash(path) }));
const publicCopySnapshot = selectedRuleRows.map((row) => ({
  ruleId: row.ruleId,
  equipmentDirection: row.equipmentDirection,
  publicCopy: row.publicCopy,
}));
const approvalScope = {
  candidateRuleIds,
  candidatePairKeys: [...candidatePairKeys].sort(),
  claimLabel: '行业常见设备方向',
  excludesCompanyCapabilityCommitment: true,
  excludesProductLinks: true,
  excludesUnverifiedNumericParameters: true,
};
const technicalSnapshotHash = sha256({ baselineVersion, frozenFiles });
const evidenceSnapshotHash = sha256(evidenceSnapshot);
const publicCopySnapshotHash = sha256(publicCopySnapshot);
const codeAndDataSnapshotHash = sha256(frozenFiles);
const approvalScopeHash = sha256(approvalScope);
const snapshotHash = sha256({
  baselineVersion,
  technicalSnapshotHash,
  approvalScopeHash,
  evidenceSnapshotHash,
  publicCopySnapshotHash,
  codeAndDataSnapshotHash,
});
const previousV2 = existsSync(versionedCandidatePath) ? readJson(versionedCandidatePath) : null;
const createdAt = previousV2?.createdAt ?? new Date().toISOString();
const candidate = {
  schemaVersion: '2.5.1',
  batch: '2.5.1',
  baselineVersion,
  status: 'awaiting_responsible_owner_approval',
  createdAt,
  supersedesBaselineVersion: 'industry-public-baseline-2026-08-batch2.5-candidate-v1',
  supersededCandidateStatus: 'returned_for_revision',
  sourceDraftVersion: baselineData.currentDraftVersion,
  productionPublicBaselineVersion: baselineData.publicBaselineVersion,
  productionPublicRuleCount: 0,
  candidateRuleIds,
  pairScope: candidatePairKeys,
  candidateRuleCount: candidateRuleIds.length,
  candidatePairCount: candidatePairKeys.length,
  directionStateSemantics: {
    directionGateAllTrue: 'matched_direction',
    directionGateUnknownWithoutFalse: 'conditional_preview',
    anyDirectionGateFalse: 'engineering_review_without_incompatible_direction',
    finalSizingInputsDoNotBlockDirection: true,
  },
  evidenceSnapshotHash,
  publicCopySnapshotHash,
  codeAndDataSnapshotHash,
  approvalScopeHash,
  technicalSnapshotHash,
  snapshotHash,
  approvalBundleHash: null,
  approvalScope,
  approvalRecord: {
    approvedBy: null,
    approverRole: null,
    approvedAt: null,
    baselineVersion: null,
    technicalSnapshotHash: null,
    approvalBundleHash: null,
    lockedAt: null,
  },
  candidateRules: selectedRuleRows,
  evidenceSnapshot,
  publicCopySnapshot,
  frozenFiles,
  allRuleSelectionStatus,
  exclusions: [
    '9条气瓶路线',
    '铝瓶固溶淬火转移',
    'ADI等温淬火',
    '局部感应、在线焊缝和现场局部处理',
    '模具新增分类',
    '真空、盐浴及无法确认苏能范围的特殊设备',
  ],
};
writeJson(genericCandidatePath, candidate);
writeJson(versionedCandidatePath, candidate);

const technicalSnapshot = {
  schemaVersion: '1.0.0',
  baselineVersion,
  algorithm: 'sha256 over UTF-8 file bytes; paths sorted lexicographically; manifest canonicalized with recursively sorted object keys',
  recomputeCommand:
    'PATH=/private/tmp/suneng-node-22.23.1/node-v22.23.1-darwin-arm64/bin:$PATH node scripts/generate-workpiece-router-batch2.5.1.mjs',
  technicalSnapshotHash,
  frozenFiles,
};
writeJson(technicalSnapshotPath, technicalSnapshot);

const candidateRows = selectedRuleRows
  .flatMap((row) =>
    row.selectedPairs.map(
      (pair) =>
        `| ${cleanCell(row.ruleId)} | ${cleanCell(pair.publicWorkpieceName)} | ${cleanCell(pair.publicProcessPurposeName)} | ${cleanCell(row.equipmentDirection)} | ${cleanCell(row.riskLevel)} |`,
    ),
  )
  .join('\n');
const copySections = selectedRuleRows
  .map(
    (row, index) =>
      `### ${index + 1}. ${row.equipmentDirection}\n\n- 规则：\`${row.ruleId}\`\n- 入选pair：${row.selectedPairs.length}个\n- 证据直接支持：${row.directSupport}\n- 工程推导：${row.engineeringDerivation}\n- 不支持边界：${row.unsupportedBoundary}\n- 条件候选文案：${row.publicCopy.conditional_preview}\n- 明确命中文案：${row.publicCopy.matched_direction}\n- 工程复核文案：${row.publicCopy.engineering_review}`,
  )
  .join('\n\n');
const exclusionRows = allRuleSelectionStatus
  .map(
    (row) =>
      `| ${cleanCell(row.ruleId)} | ${cleanCell(row.internalExecutionStatus)} | ${cleanCell(row.selectionStatus)} | ${row.selectedPairCount}/${row.allowedPairCount} | ${cleanCell(row.reason)} |`,
  )
  .join('\n');
const md = `# 工件路由第2.5.1批首版公开基线候选包 v2\n\n生成时间：${createdAt}\n\n## 一句话结论\n\n已形成 ${candidateRuleIds.length} 条规则、${candidatePairKeys.length} 个pair的 candidate-v2；证据和工程门禁已收窄，但当前生产仍为0条公开，尚未签署。\n\n## 版本关系\n\n- v1：\`returned_for_revision\`，已按原始字节归档，不覆盖。\n- v2：\`${baselineVersion}\`，等待负责人一次性签署。\n- 负责人签署对象必须同时包含 \`baselineVersion\`、\`technicalSnapshotHash\` 与最终 \`approvalBundleHash\`。\n\n## 状态语义\n\n- 方向门禁全部为true：\`matched_direction\`。\n- 存在unknown且没有false：\`conditional_preview\`，最多显示3个条件候选。\n- 任一方向门禁为false：\`engineering_review\`，不得显示不兼容炉型。\n- 正式规格资料属于 \`finalSizingInputs\`，不会倒退为方向门禁，也不会在明确命中时重复写成同一待确认条件。\n\n## 候选范围\n\n| ruleId | 公开工件名称 | 公开处理目的 | 行业常见设备方向 | 风险 |\n|---|---|---|---|---|\n${candidateRows}\n\n## 客户实际会看到的完整文案\n\n${copySections}\n\n## 证据处理结论\n\n- Surface Combustion已降为设备能力参考与条件性工程推导，不再作为9个pair的逐项直接证据。\n- 台车炉由CAN-ENG与NUTEC Bickley原厂应用资料补强。\n- 圆钢/棒材、钢板调质整线、紧固件网带调质分别由CAN-ENG原厂资料补强。\n- 每条入选证据均冻结issuer、title、url、accessedAt、支持主张、段落位置、内容哈希及不支持边界。\n\n## 所有56条执行规则去向\n\n| ruleId | 内部状态 | 候选状态 | 入选/允许pair | 原因 |\n|---|---|---|---|---|\n${exclusionRows}\n\n## 冻结哈希\n\n- technicalSnapshotHash：\`${technicalSnapshotHash}\`\n- evidenceSnapshotHash：\`${evidenceSnapshotHash}\`\n- publicCopySnapshotHash：\`${publicCopySnapshotHash}\`\n- codeAndDataSnapshotHash：\`${codeAndDataSnapshotHash}\`\n- approvalScopeHash：\`${approvalScopeHash}\`\n- snapshotHash：\`${snapshotHash}\`\n\n\`approvalBundleHash\`将在有效矩阵、报告、测试清单与3张截图全部生成后计算；当前批准记录全部为空。\n`;
writeFileSync(genericCandidateDocPath, md);
writeFileSync(versionedCandidateDocPath, md);

const lineagePath = join(dataDir, 'industry-public-baseline-candidate-batch2.5-lineage.json');
const lineage = readJson(lineagePath);
const v2 = lineage.versions.find((version) => version.baselineVersion === baselineVersion);
v2.status = 'awaiting_responsible_owner_approval';
v2.immutableArtifacts = [
  { path: 'data/workpiece-router/industry-public-baseline-candidate-batch2.5-candidate-v2.json', sha256: fileHash('data/workpiece-router/industry-public-baseline-candidate-batch2.5-candidate-v2.json') },
  { path: 'docs/independent-site-v2/workpiece-router-batch2.5-candidate-v2-public-baseline-candidate.md', sha256: fileHash('docs/independent-site-v2/workpiece-router-batch2.5-candidate-v2-public-baseline-candidate.md') },
  { path: 'docs/independent-site-v2/workpiece-router-batch2.5.1-technical-snapshot.json', sha256: fileHash('docs/independent-site-v2/workpiece-router-batch2.5.1-technical-snapshot.json') },
];
writeJson(lineagePath, lineage);

console.log(
  `OK ${baselineVersion}: ${candidateRuleIds.length} rules, ${candidatePairKeys.length} pairs, technical ${technicalSnapshotHash}`,
);
