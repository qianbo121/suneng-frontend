import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dataDir = join(root, 'data/workpiece-router');
const baselineVersion = 'industry-baseline-2026-08-batch2.1-draft';
const resolverVersion = 'workpiece-router-resolver-2.1.0';
const evidenceId = 'tech-us-doe-process-heating-sourcebook3-2015';

const labels = {
  car_bottom_batch: '台车式周期炉',
  vertical_batch: '立式或井式周期炉',
  fixed_hearth_batch: '固定炉底室式周期炉',
  continuous_heat_treatment_line: '连续式热处理线',
  controlled_atmosphere_continuous: '可控工艺气氛连续式炉/线',
  controlled_atmosphere_batch: '可控工艺气氛周期式炉',
  roller_hearth_continuous: '辊底式连续热处理炉/线',
  roller_hearth_quench_temper_line: '辊底式连续调质热处理线',
  batch_solution_system: '周期式固溶处理系统',
  protective_atmosphere_batch: '保护气氛周期式炉',
  continuous_solution_line: '连续式固溶处理线',
  bell_batch: '罩式周期炉',
  strip_continuous_line: '带材连续处理线',
  mesh_belt_quench_temper_line: '网带式调质热处理线',
  conveyor_stress_relief: '输送式去应力处理炉/线',
  conveyor_quench_temper: '输送式调质热处理线',
  batch_stress_relief: '周期式去应力处理炉',
  batch_quench_temper: '周期式调质热处理系统',
  wear_plate_quench_temper_line: '耐磨板辊底式调质热处理线',
  aluminum_solution_quench_system: '铝板固溶淬火系统',
  aluminum_plate_batch: '铝板周期式热处理炉',
  local_pwht_system: '局部焊后热处理系统',
  field_pwht_system: '现场焊后热处理系统',
};

const evidenceTemplates = {
  car_bottom: {
    direct: 'DOE第三版第14-16页直接说明台车式设备以可移动支撑承载工件，可用于金属加热或热处理。',
    scope: '直接证据只覆盖台车承载、金属热处理和批次式通用分类；具体工件适用性仍由尺寸、重量、支撑和装卸条件推导。',
    status: 'partially_verified',
  },
  vertical: {
    direct: 'DOE第三版第14-16页直接列出立式物料输送，并说明其常用于长件、井式或立式周期设备。',
    scope: '直接证据只覆盖立式装料与周期设备通用分类；具体工件能否立装仍由几何、变形、重心和吊装条件推导。',
    status: 'partially_verified',
  },
  continuous: {
    direct: 'DOE第三版第14-16页直接说明连续式设备可用于金属加热和热处理，并给出连续运行的通用分类。',
    scope: '直接证据只覆盖连续运行和连续热处理通用分类；具体工件、工艺链及冷却衔接仍由工程条件推导。',
    status: 'partially_verified',
  },
  roller: {
    direct: 'DOE第三版第14-16页直接列出辊道输送结构，并说明其可用于连续金属加热和热处理。',
    scope: '直接证据只覆盖辊道输送及连续热处理通用分类；板形、直线度、淬火和回火衔接仍需项目核实。',
    status: 'partially_verified',
  },
  belt: {
    direct: 'DOE第三版第14-16页直接列出输送带等连续输送结构，可用于连续金属加热和热处理。',
    scope: '直接证据只覆盖输送结构及连续运行分类；零件适用性、装料密度、淬火和回火系统仍属工程推导。',
    status: 'partially_verified',
  },
  bell: {
    direct: 'DOE第三版第14-16页在物料输送结构中保留bell top，并直接定义批次式运行。',
    scope: '直接证据只支持罩式结构和批次式通用分类；卷材种类、堆叠、循环、气氛与冷却要求仍需工程核实。',
    status: 'partially_verified',
  },
  strip: {
    direct: 'DOE第三版第14-16页直接列出带材连续炉，并说明板带可连续通过设备。',
    scope: '直接证据只覆盖带材连续输送的通用结构；材料、退火制度、气氛及冷却配置仍需专项核实。',
    status: 'partially_verified',
  },
  batch: {
    direct: 'DOE第三版第14-16页只直接支持批次式运行的通用分类，没有直接规定本工件与固定炉底室式设备的对应关系。',
    scope: '直接证据只覆盖批次式运行；固定炉底室式结构及具体工件适用性均需工程核实。',
    status: 'unverified',
  },
  process_system: {
    direct: 'DOE第三版仅支持批次、连续和物料输送等通用分类，不直接规定该专项工艺系统。',
    scope: '来源不直接证明该工件路线；工艺气氛、转移、淬火、清洗、回火与冷却衔接均需权威工艺资料和项目输入核实。',
    status: 'unverified',
  },
};

function pair(routeId, workpieceId, processVariantId) {
  return { routeId, workpieceId, processVariantId };
}

function pairs(routeId, values) {
  return values.map((value) => {
    const [workpieceId, processVariantId] = value.split(':');
    return pair(routeId, workpieceId, processVariantId);
  });
}

const criterion = (field, allowedValues, operator = 'in') => ({
  field,
  operator,
  allowedValues,
  requiredForMatch: true,
});

const rhythmBatch = criterion('productionRhythm', ['batch', 'mixed']);
const rhythmContinuous = criterion('productionRhythm', ['continuous']);
const dimensions = criterion('dimensions', [], 'provided');
const weight = criterion('weight', [], 'provided');
const horizontal = criterion('loadingOrientation', ['horizontal', 'flat', 'fixture_supported', 'roller_supported']);
const vertical = criterion('loadingOrientation', ['vertical', 'suspended']);
const controlledAtmosphere = criterion('atmosphereRequirement', ['controlled_process_atmosphere']);
const quenchSystem = criterion('coolingRequirement', ['quench_system_integrated']);
const rapidCooling = criterion('coolingRequirement', ['rapid_cooling_integrated']);

const output = (operationMode, furnaceArchitecture, materialHandling, atmosphereCapability, processChain, coolingIntegration) => ({
  operationMode,
  furnaceArchitecture,
  materialHandling,
  atmosphereCapability,
  processChain,
  coolingIntegration,
});

function makeRule({
  ruleId,
  logicUnitId,
  allowedPairs,
  publicLabelKey,
  equipmentFamilyId,
  evidence = 'batch',
  matchCriteria,
  equipmentOutput,
  publicationEligibility = 'internal_only',
  publicClaimScope = 'conditional_engineering_direction',
  assumptions,
  priority,
  supersedesRuleIds = [],
}) {
  const template = evidenceTemplates[evidence];
  const requiredInputs = [...new Set(matchCriteria.filter((item) => item.requiredForMatch).map((item) => item.field))];
  return {
    ruleId,
    baselineVersion,
    logicUnitId,
    allowedPairs,
    publicLabelKey,
    equipmentFamilyId,
    publicationEligibility,
    publicClaimScope,
    conditions: [
      '仅在工件、路线与处理目的明确命中allowedPairs时进入判断',
      ...matchCriteria.map((item) => item.operator === 'provided'
        ? `${item.field}必须已提供`
        : `${item.field}必须属于：${item.allowedValues.join('、')}`),
    ],
    matchCriteria,
    equipmentOutput,
    derivedFrom: [
      ...allowedPairs.map((item) => `pair:${item.workpieceId}|${item.routeId}|${item.processVariantId}`),
      ...matchCriteria.map((item) => `condition:${item.field}:${item.operator}:${item.allowedValues.join('|')}`),
      `evidence:${evidenceId}`,
    ],
    assumptions,
    requiredInputs,
    evidenceRefs: [evidenceId],
    sourceDirectSupport: [template.direct],
    engineeringDerivation: [`将通用设备分类、明确工件路线和三值条件组合，推导为“${labels[publicLabelKey]}”条件候选；来源未直接规定该具体路线。`],
    unverifiedEngineeringAssumptions: assumptions,
    evidenceSupportScope: template.scope,
    baselineEvidenceStatus: template.status,
    claimLevel: 'equipment_direction',
    confidence: 'conditional',
    priority,
    supersedesRuleIds,
  };
}

const weldedWorkpieces = ['large-welded-machine-frame', 'pressure-vessel-shell', 'structural-steel-component', 'welded-assembly', 'large-cylinder-shell', 'welded-pipe-spool'];
const weldedStress = pairs('welded-stress-relief', weldedWorkpieces.map((id) => `${id}:stress-relief`));
const weldedPwht = pairs('welded-stress-relief', weldedWorkpieces.map((id) => `${id}:post-weld-heat-treatment`));
const heavyPairs = [
  ...pairs('heavy-steel-normalize-temper-anneal', ['large-forged-flange:normalizing', 'large-forged-flange:tempering', 'large-forged-flange:annealing', 'large-forged-flange:normalize-temper', 'large-forged-shaft:normalizing', 'large-forged-shaft:tempering', 'large-forged-shaft:annealing', 'large-forged-shaft:normalize-temper', 'large-steel-casting:normalizing', 'large-steel-casting:tempering', 'large-steel-casting:annealing', 'large-steel-casting:normalize-temper', 'large-die-block-forging:normalizing', 'large-die-block-forging:tempering', 'large-die-block-forging:annealing', 'large-die-block-forging:normalize-temper']),
  ...pairs('heavy-forging-hydrogen-relief', ['large-forged-shaft:hydrogen-relief', 'large-die-block-forging:hydrogen-relief']),
  ...pairs('ductile-iron-anneal-normalize', ['ductile-iron-casting:ferritizing-annealing', 'ductile-iron-casting:normalizing']),
];
const shaftSimple = pairs('shaft-gear-whole-normalize-qt', ['long-shaft:normalizing', 'long-shaft:annealing', 'gear-shaft:normalizing', 'gear-shaft:annealing', 'spline-shaft:normalizing', 'spline-shaft:annealing', 'crankshaft:normalizing', 'crankshaft:annealing']);
const shaftQt = pairs('shaft-gear-whole-normalize-qt', ['long-shaft:quench-temper', 'gear-shaft:quench-temper', 'spline-shaft:quench-temper', 'crankshaft:quench-temper']);
const gearSimple = [
  ...pairs('shaft-gear-whole-normalize-qt', ['large-gear:normalizing', 'large-gear:annealing', 'large-ring-gear:normalizing', 'large-ring-gear:annealing']),
  ...pairs('gear-blank-preliminary-treatment', ['large-gear-blank:normalizing', 'large-gear-blank:annealing']),
];
const gearQt = pairs('shaft-gear-whole-normalize-qt', ['large-gear:quench-temper', 'large-ring-gear:quench-temper']);
const carburizingPairs = [
  ...pairs('shaft-gear-carburizing-review', ['gear-shaft:carburizing', 'gear-shaft:carbonitriding', 'spline-shaft:carburizing', 'spline-shaft:carbonitriding', 'large-gear:carburizing', 'large-gear:carbonitriding']),
  ...pairs('track-link-carburizing-review', ['track-link:carburizing']),
  ...pairs('small-parts-carburize-carbonitride-review', ['self-drilling-screws:carburizing', 'self-drilling-screws:carbonitriding', 'steel-pins:carburizing', 'steel-pins:carbonitriding', 'chain-components:carburizing', 'chain-components:carbonitriding']),
];
const underSimple = pairs('undercarriage-whole-normalize-qt', ['track-roller:normalizing', 'track-roller:tempering', 'carrier-roller:normalizing', 'carrier-roller:tempering', 'idler-wheel:normalizing', 'idler-wheel:tempering', 'drive-sprocket:normalizing', 'drive-sprocket:tempering', 'track-link:normalizing', 'track-link:tempering', 'engineering-wheel-hub:normalizing', 'engineering-wheel-hub:tempering']);
const underQt = [
  ...pairs('undercarriage-whole-normalize-qt', ['track-roller:quench-temper', 'carrier-roller:quench-temper', 'idler-wheel:quench-temper', 'drive-sprocket:quench-temper', 'track-link:quench-temper', 'engineering-wheel-hub:quench-temper']),
  ...pairs('track-pin-engineering-review', ['steel-pins:quench-temper']),
];
const steelPlate = pairs('plate-batch-anneal-normalize', ['medium-heavy-steel-plate:annealing', 'medium-heavy-steel-plate:normalizing', 'medium-heavy-steel-plate:stress-relief']);
const wearPlate = pairs('wear-plate-quench-review', ['wear-resistant-steel-plate:quench-temper']);
const aluminumPlateThermal = pairs('aluminum-plate-anneal-aging', ['aluminum-alloy-plate:annealing', 'aluminum-alloy-plate:artificial-aging']);
const aluminumPlateSolution = pairs('aluminum-plate-solution-quench-review', ['aluminum-alloy-plate:solution-quench']);
const stainlessSolution = pairs('stainless-plate-solution-review', ['stainless-steel-plate:solution-treatment']);
const longSimple = pairs('long-products-whole-furnace-treatment', ['seamless-steel-pipe:normalizing', 'seamless-steel-pipe:annealing', 'welded-steel-pipe:normalizing', 'welded-steel-pipe:annealing', 'round-steel-bar:normalizing', 'round-steel-bar:annealing', 'structural-section-steel:normalizing', 'structural-section-steel:annealing']);
const longQt = pairs('long-products-whole-furnace-treatment', ['seamless-steel-pipe:quench-temper', 'welded-steel-pipe:quench-temper', 'round-steel-bar:quench-temper', 'structural-section-steel:quench-temper']);
const wirePairs = pairs('coiled-wire-protective-anneal-review', ['wire-rod-coil:spheroidizing-annealing', 'wire-rod-coil:recrystallization-annealing', 'wire-rod-coil:stress-relief', 'steel-wire-coil:spheroidizing-annealing', 'steel-wire-coil:recrystallization-annealing', 'steel-wire-coil:stress-relief']);
const fastenerPairs = pairs('fastener-quench-temper', ['high-strength-bolts:quench-temper', 'hex-nuts:quench-temper', 'steel-pins:quench-temper']);
const chainQtPairs = pairs('fastener-quench-temper', ['chain-components:quench-temper']);
const springStress = pairs('small-cold-coil-spring-stress-relief', ['small-coil-springs:stress-relief']);
const springQt = pairs('small-spring-quench-temper-review', ['small-coil-springs:quench-temper']);

const thermalChain = ['selected_process_purpose'];
const qtChain = ['austenitizing', 'transfer_and_quench', 'cleaning_if_required', 'tempering', 'final_cooling'];
const solutionChain = ['solution_heating', 'rapid_transfer', 'rapid_cooling'];
const carburizingChain = ['controlled_process_atmosphere_heating', 'diffusion', 'transfer_and_quench', 'tempering_if_required', 'final_cooling'];
const rules = [];
const add = (rule) => rules.push(makeRule(rule));

add({ ruleId: 'eqdir-welded-car-bottom-v1', logicUnitId: 'welded_batch', allowedPairs: weldedStress, publicLabelKey: 'car_bottom_batch', equipmentFamilyId: 'car-bottom-batch-furnace', evidence: 'car_bottom', matchCriteria: [rhythmBatch, dimensions, weight], equipmentOutput: output('batch', 'car_bottom', 'mobile_hearth_support', 'air_or_process_defined', ['stress_relief'], 'controlled_furnace_cooling'), assumptions: ['活动承载台的有效尺寸、承载和装卸条件满足工件要求'], priority: 10, supersedesRuleIds: ['eqdir-welded-car-bottom-v1'] });
add({ ruleId: 'eqdir-welded-pwht-whole-car-bottom-v2', logicUnitId: 'welded_batch', allowedPairs: weldedPwht, publicLabelKey: 'car_bottom_batch', equipmentFamilyId: 'car-bottom-batch-furnace', evidence: 'car_bottom', matchCriteria: [criterion('treatmentScope', ['whole_component']), rhythmBatch, dimensions, weight], equipmentOutput: output('batch', 'car_bottom', 'mobile_hearth_support', 'air_or_process_defined', ['whole_component_pwht'], 'controlled_furnace_cooling'), assumptions: ['焊后热处理范围为整体工件且炉内均温能够满足工艺文件'], priority: 11, supersedesRuleIds: ['eqdir-welded-car-bottom-v1'] });
add({ ruleId: 'eqdir-welded-vertical-v1', logicUnitId: 'welded_batch', allowedPairs: weldedStress, publicLabelKey: 'vertical_batch', equipmentFamilyId: 'vertical-batch-furnace', evidence: 'vertical', matchCriteria: [vertical, rhythmBatch, dimensions, weight], equipmentOutput: output('batch', 'vertical_or_pit', 'vertical_or_suspended_loading', 'air_or_process_defined', ['stress_relief'], 'controlled_furnace_cooling'), assumptions: ['立式或悬挂装炉不会造成不允许的变形'], priority: 20, supersedesRuleIds: ['eqdir-welded-vertical-v1'] });
add({ ruleId: 'eqdir-welded-pwht-whole-vertical-v2', logicUnitId: 'welded_batch', allowedPairs: weldedPwht, publicLabelKey: 'vertical_batch', equipmentFamilyId: 'vertical-batch-furnace', evidence: 'vertical', matchCriteria: [criterion('treatmentScope', ['whole_component']), vertical, rhythmBatch, dimensions, weight], equipmentOutput: output('batch', 'vertical_or_pit', 'vertical_or_suspended_loading', 'air_or_process_defined', ['whole_component_pwht'], 'controlled_furnace_cooling'), assumptions: ['整体焊后热处理允许立式装炉且吊装与变形风险可控'], priority: 21, supersedesRuleIds: ['eqdir-welded-vertical-v1'] });
add({ ruleId: 'eqdir-welded-batch-chamber-v1', logicUnitId: 'welded_batch', allowedPairs: weldedStress, publicLabelKey: 'fixed_hearth_batch', equipmentFamilyId: 'fixed-hearth-batch-chamber-furnace', matchCriteria: [rhythmBatch, dimensions, weight], equipmentOutput: output('batch', 'fixed_hearth_chamber', 'fixture_supported', 'air_or_process_defined', ['stress_relief'], 'controlled_furnace_cooling'), publicationEligibility: 'blocked', assumptions: ['固定炉底室式装卸、有效空间和支撑满足工件条件'], priority: 30, supersedesRuleIds: ['eqdir-welded-batch-chamber-v1'] });
add({ ruleId: 'eqdir-welded-pwht-local-v2', logicUnitId: 'welded_batch', allowedPairs: weldedPwht, publicLabelKey: 'local_pwht_system', equipmentFamilyId: 'local-pwht-system', evidence: 'process_system', matchCriteria: [criterion('treatmentScope', ['local'])], equipmentOutput: output('local', 'local_heating_arrangement', 'in_place_component_support', 'not_applicable', ['local_pwht'], 'local_controlled_cooling'), publicationEligibility: 'internal_only', publicClaimScope: 'process_system_direction', assumptions: ['局部加热带、测温点和保温范围需按工艺文件设计'], priority: 40 });
add({ ruleId: 'eqdir-welded-pwht-field-v2', logicUnitId: 'welded_batch', allowedPairs: weldedPwht, publicLabelKey: 'field_pwht_system', equipmentFamilyId: 'field-pwht-system', evidence: 'process_system', matchCriteria: [criterion('treatmentScope', ['field'])], equipmentOutput: output('field', 'field_heating_arrangement', 'in_place_component_support', 'not_applicable', ['field_pwht'], 'field_controlled_cooling'), publicationEligibility: 'internal_only', publicClaimScope: 'process_system_direction', assumptions: ['现场电源、保温、测温、环境和安全条件均需项目核实'], priority: 41 });

add({ ruleId: 'eqdir-heavy-car-bottom-v1', logicUnitId: 'heavy_cast_forged', allowedPairs: heavyPairs, publicLabelKey: 'car_bottom_batch', equipmentFamilyId: 'car-bottom-batch-furnace', evidence: 'car_bottom', matchCriteria: [rhythmBatch, dimensions, weight], equipmentOutput: output('batch', 'car_bottom', 'mobile_hearth_heavy_load_support', 'process_defined', thermalChain, 'process_defined'), publicationEligibility: 'conditional_public', assumptions: ['承载结构、有效空间、重心和装卸路径满足重载工件要求'], priority: 10, supersedesRuleIds: ['eqdir-heavy-car-bottom-v1'] });
add({ ruleId: 'eqdir-heavy-vertical-v1', logicUnitId: 'heavy_cast_forged', allowedPairs: heavyPairs, publicLabelKey: 'vertical_batch', equipmentFamilyId: 'vertical-batch-furnace', evidence: 'vertical', matchCriteria: [vertical, rhythmBatch, dimensions, weight], equipmentOutput: output('batch', 'vertical_or_pit', 'vertical_or_suspended_heavy_load', 'process_defined', thermalChain, 'process_defined'), assumptions: ['重心、吊具和变形风险允许立式装炉'], priority: 20, supersedesRuleIds: ['eqdir-heavy-vertical-v1'] });
add({ ruleId: 'eqdir-heavy-batch-chamber-v1', logicUnitId: 'heavy_cast_forged', allowedPairs: heavyPairs, publicLabelKey: 'fixed_hearth_batch', equipmentFamilyId: 'fixed-hearth-batch-chamber-furnace', matchCriteria: [rhythmBatch, dimensions, weight], equipmentOutput: output('batch', 'fixed_hearth_chamber', 'fixture_supported_heavy_load', 'process_defined', thermalChain, 'process_defined'), publicationEligibility: 'blocked', assumptions: ['室式装卸和固定炉底承载满足重载工件要求'], priority: 30, supersedesRuleIds: ['eqdir-heavy-batch-chamber-v1'] });

for (const [group, simplePairs, qtPairs] of [['shaft', shaftSimple, shaftQt], ['large-gear-ring', gearSimple, gearQt]]) {
  const groupLabel = group === 'shaft' ? 'shaft' : 'large-gear';
  add({ ruleId: `eqdir-${groupLabel}-vertical-thermal-v2`, logicUnitId: 'shaft_gear_preheat', allowedPairs: simplePairs, publicLabelKey: 'vertical_batch', equipmentFamilyId: 'vertical-batch-furnace', evidence: 'vertical', matchCriteria: [vertical, rhythmBatch, dimensions, weight], equipmentOutput: output('batch', 'vertical_or_pit', 'vertical_or_suspended_loading', 'process_defined', thermalChain, 'process_defined'), assumptions: ['立式装炉的变形、重心和吊装风险可接受'], priority: 10, supersedesRuleIds: ['eqdir-shaft-vertical-v1'] });
  add({ ruleId: `eqdir-${groupLabel}-fixed-hearth-thermal-v2`, logicUnitId: 'shaft_gear_preheat', allowedPairs: simplePairs, publicLabelKey: 'fixed_hearth_batch', equipmentFamilyId: 'fixed-hearth-batch-chamber-furnace', matchCriteria: [horizontal, rhythmBatch, dimensions, weight], equipmentOutput: output('batch', 'fixed_hearth_chamber', 'horizontal_fixture_support', 'process_defined', thermalChain, 'process_defined'), publicationEligibility: 'blocked', assumptions: ['水平支撑点和工装布置经变形校核'], priority: 20, supersedesRuleIds: ['eqdir-shaft-horizontal-batch-v1'] });
  add({ ruleId: `eqdir-${groupLabel}-continuous-thermal-v2`, logicUnitId: 'shaft_gear_preheat', allowedPairs: simplePairs, publicLabelKey: 'continuous_heat_treatment_line', equipmentFamilyId: 'continuous-heat-treatment-line', evidence: 'continuous', matchCriteria: [rhythmContinuous, dimensions], equipmentOutput: output('continuous', 'continuous_line', 'purpose_defined_conveyance', 'process_defined', thermalChain, 'process_defined'), assumptions: ['连续输送姿态不会造成不可接受的变形'], priority: 30, supersedesRuleIds: ['eqdir-shaft-continuous-v1'] });
  add({ ruleId: `eqdir-${groupLabel}-quench-temper-line-v2`, logicUnitId: 'shaft_gear_preheat', allowedPairs: qtPairs, publicLabelKey: 'roller_hearth_quench_temper_line', equipmentFamilyId: 'quench-temper-line', evidence: 'process_system', matchCriteria: [rhythmContinuous, dimensions, quenchSystem], equipmentOutput: output('continuous', 'quench_temper_line', 'purpose_defined_conveyance', 'process_defined', qtChain, 'integrated_quench_and_final_cooling'), publicationEligibility: 'internal_only', publicClaimScope: 'process_system_direction', assumptions: ['淬火转移、清洗需求、回火和终冷配置由材料与工艺文件确认'], priority: 31, supersedesRuleIds: ['eqdir-shaft-continuous-v1'] });
}

add({ ruleId: 'eqdir-carburizing-continuous-v1', logicUnitId: 'carburizing_controlled_atmosphere', allowedPairs: carburizingPairs, publicLabelKey: 'controlled_atmosphere_continuous', equipmentFamilyId: 'controlled-atmosphere-continuous-furnace', evidence: 'process_system', matchCriteria: [rhythmContinuous, controlledAtmosphere, quenchSystem], equipmentOutput: output('continuous', 'controlled_atmosphere_continuous_line', 'purpose_defined_conveyance', 'controlled_process_atmosphere', carburizingChain, 'integrated_quench_and_final_cooling'), publicationEligibility: 'blocked', publicClaimScope: 'process_system_direction', assumptions: ['气氛组成、碳势或氮势、层深和淬火衔接由工艺文件确定'], priority: 10, supersedesRuleIds: ['eqdir-carburizing-continuous-v1'] });
add({ ruleId: 'eqdir-carburizing-batch-v1', logicUnitId: 'carburizing_controlled_atmosphere', allowedPairs: carburizingPairs, publicLabelKey: 'controlled_atmosphere_batch', equipmentFamilyId: 'controlled-atmosphere-batch-furnace', evidence: 'process_system', matchCriteria: [rhythmBatch, controlledAtmosphere, quenchSystem], equipmentOutput: output('batch', 'controlled_atmosphere_batch', 'basket_or_fixture_loading', 'controlled_process_atmosphere', carburizingChain, 'integrated_quench_and_final_cooling'), publicationEligibility: 'blocked', publicClaimScope: 'process_system_direction', assumptions: ['装料密度、气氛循环、层深和淬火衔接由工艺文件确定'], priority: 20, supersedesRuleIds: ['eqdir-carburizing-batch-v1'] });

for (const [suffix, pairSet, chain, cooling, scope] of [['thermal', underSimple, thermalChain, 'process_defined', 'conditional_engineering_direction'], ['quench-temper', underQt, qtChain, 'integrated_quench_and_final_cooling', 'process_system_direction']]) {
  const criteriaContinuous = suffix === 'quench-temper' ? [rhythmContinuous, dimensions, quenchSystem] : [rhythmContinuous, dimensions];
  const criteriaBatch = suffix === 'quench-temper' ? [rhythmBatch, dimensions, weight, quenchSystem] : [rhythmBatch, dimensions, weight];
  add({ ruleId: `eqdir-undercarriage-continuous-${suffix}-v2`, logicUnitId: 'engineering_undercarriage_bulk', allowedPairs: pairSet, publicLabelKey: suffix === 'quench-temper' ? 'roller_hearth_quench_temper_line' : 'continuous_heat_treatment_line', equipmentFamilyId: suffix === 'quench-temper' ? 'quench-temper-line' : 'continuous-heat-treatment-line', evidence: suffix === 'quench-temper' ? 'process_system' : 'continuous', matchCriteria: criteriaContinuous, equipmentOutput: output('continuous', suffix === 'quench-temper' ? 'quench_temper_line' : 'continuous_line', 'purpose_defined_conveyance', 'process_defined', chain, cooling), publicClaimScope: scope, assumptions: ['输送姿态、装料密度和工艺衔接满足零件要求'], priority: suffix === 'quench-temper' ? 11 : 10, supersedesRuleIds: ['eqdir-undercarriage-continuous-v1'] });
  add({ ruleId: `eqdir-undercarriage-fixed-hearth-${suffix}-v2`, logicUnitId: 'engineering_undercarriage_bulk', allowedPairs: pairSet, publicLabelKey: suffix === 'quench-temper' ? 'batch_quench_temper' : 'fixed_hearth_batch', equipmentFamilyId: suffix === 'quench-temper' ? 'batch-quench-temper-system' : 'fixed-hearth-batch-chamber-furnace', evidence: suffix === 'quench-temper' ? 'process_system' : 'batch', matchCriteria: criteriaBatch, equipmentOutput: output('batch', 'fixed_hearth_chamber', 'basket_or_fixture_loading', 'process_defined', chain, cooling), publicationEligibility: 'blocked', publicClaimScope: scope, assumptions: ['批次装料、间距和工艺衔接满足均匀性要求'], priority: suffix === 'quench-temper' ? 21 : 20, supersedesRuleIds: ['eqdir-undercarriage-batch-v1'] });
  add({ ruleId: `eqdir-undercarriage-car-bottom-${suffix}-v2`, logicUnitId: 'engineering_undercarriage_bulk', allowedPairs: pairSet, publicLabelKey: suffix === 'quench-temper' ? 'batch_quench_temper' : 'car_bottom_batch', equipmentFamilyId: suffix === 'quench-temper' ? 'car-bottom-quench-temper-system' : 'car-bottom-batch-furnace', evidence: suffix === 'quench-temper' ? 'process_system' : 'car_bottom', matchCriteria: criteriaBatch, equipmentOutput: output('batch', 'car_bottom', 'mobile_hearth_or_fixture_loading', 'process_defined', chain, cooling), publicClaimScope: scope, assumptions: ['台车承载、装炉空间及工艺衔接满足工件要求'], priority: suffix === 'quench-temper' ? 31 : 30, supersedesRuleIds: ['eqdir-undercarriage-car-bottom-v1'] });
}

add({ ruleId: 'eqdir-steel-plate-batch-thermal-v2', logicUnitId: 'plate_batch', allowedPairs: steelPlate, publicLabelKey: 'car_bottom_batch', equipmentFamilyId: 'plate-batch-furnace', evidence: 'car_bottom', matchCriteria: [rhythmBatch, horizontal, dimensions, weight], equipmentOutput: output('batch', 'car_bottom_or_fixed_hearth_chamber', 'flat_horizontal_support', 'process_defined', thermalChain, 'process_defined'), assumptions: ['板形控制、支撑方式、间距和装卸条件经工程确认'], priority: 10, supersedesRuleIds: ['eqdir-plate-car-bottom-v1', 'eqdir-plate-batch-chamber-v1', 'eqdir-plate-roller-continuous-v1'] });
add({ ruleId: 'eqdir-wear-plate-quench-temper-line-v2', logicUnitId: 'plate_batch', allowedPairs: wearPlate, publicLabelKey: 'wear_plate_quench_temper_line', equipmentFamilyId: 'wear-plate-quench-temper-line', evidence: 'process_system', matchCriteria: [rhythmContinuous, horizontal, dimensions, quenchSystem], equipmentOutput: output('continuous', 'roller_hearth_quench_temper_line', 'flat_roller_support', 'process_defined', qtChain, 'integrated_quench_and_final_cooling'), publicClaimScope: 'process_system_direction', assumptions: ['板形、辊道支撑、淬火均匀性、清洗需求和回火衔接均经工程确认'], priority: 20, supersedesRuleIds: ['eqdir-plate-car-bottom-v1', 'eqdir-plate-batch-chamber-v1', 'eqdir-plate-roller-continuous-v1'] });
add({ ruleId: 'eqdir-aluminum-plate-anneal-aging-v2', logicUnitId: 'plate_batch', allowedPairs: aluminumPlateThermal, publicLabelKey: 'aluminum_plate_batch', equipmentFamilyId: 'aluminum-plate-batch-furnace', evidence: 'batch', matchCriteria: [rhythmBatch, horizontal, dimensions], equipmentOutput: output('batch', 'fixed_hearth_or_car_bottom_chamber', 'flat_horizontal_support', 'process_defined', thermalChain, 'process_defined'), assumptions: ['合金牌号、板形、表面和温度均匀性要求需项目核实'], priority: 30, supersedesRuleIds: ['eqdir-plate-car-bottom-v1', 'eqdir-plate-batch-chamber-v1', 'eqdir-plate-roller-continuous-v1'] });
add({ ruleId: 'eqdir-aluminum-plate-solution-quench-v2', logicUnitId: 'plate_batch', allowedPairs: aluminumPlateSolution, publicLabelKey: 'aluminum_solution_quench_system', equipmentFamilyId: 'aluminum-plate-solution-quench-system', evidence: 'process_system', matchCriteria: [horizontal, dimensions, rapidCooling], equipmentOutput: output('batch_or_continuous', 'solution_quench_system', 'flat_support_with_rapid_transfer', 'process_defined', solutionChain, 'integrated_rapid_cooling'), publicationEligibility: 'internal_only', publicClaimScope: 'process_system_direction', assumptions: ['合金牌号、快速转移和快速冷却能力必须按工艺文件核实，不填写专项数值'], priority: 40, supersedesRuleIds: ['eqdir-plate-car-bottom-v1', 'eqdir-plate-batch-chamber-v1', 'eqdir-plate-roller-continuous-v1'] });

add({ ruleId: 'eqdir-stainless-solution-batch-v1', logicUnitId: 'stainless_plate_solution', allowedPairs: stainlessSolution, publicLabelKey: 'batch_solution_system', equipmentFamilyId: 'batch-solution-treatment-system', evidence: 'process_system', matchCriteria: [rhythmBatch, dimensions, rapidCooling], equipmentOutput: output('batch', 'batch_solution_system', 'flat_or_fixture_loading_with_rapid_transfer', 'process_defined', solutionChain, 'integrated_rapid_cooling'), publicationEligibility: 'blocked', publicClaimScope: 'process_system_direction', assumptions: ['牌号、表面、快速转移和快速冷却能力由工艺文件确认'], priority: 10, supersedesRuleIds: ['eqdir-stainless-solution-batch-v1'] });
add({ ruleId: 'eqdir-stainless-protective-batch-v1', logicUnitId: 'stainless_plate_solution', allowedPairs: stainlessSolution, publicLabelKey: 'protective_atmosphere_batch', equipmentFamilyId: 'protective-atmosphere-batch-furnace', evidence: 'process_system', matchCriteria: [rhythmBatch, criterion('atmosphereRequirement', ['protective', 'bright']), dimensions], equipmentOutput: output('batch', 'protective_atmosphere_batch', 'flat_or_fixture_loading', 'protective_or_bright_atmosphere', ['solution_heating'], 'separate_rapid_cooling_required'), publicationEligibility: 'blocked', publicClaimScope: 'process_system_direction', assumptions: ['气氛等级、露点、表面与外接快速冷却衔接由工艺文件确认'], priority: 20, supersedesRuleIds: ['eqdir-stainless-protective-batch-v1'] });
add({ ruleId: 'eqdir-stainless-continuous-v1', logicUnitId: 'stainless_plate_solution', allowedPairs: stainlessSolution, publicLabelKey: 'continuous_solution_line', equipmentFamilyId: 'continuous-solution-treatment-line', evidence: 'process_system', matchCriteria: [rhythmContinuous, dimensions, rapidCooling], equipmentOutput: output('continuous', 'continuous_solution_line', 'continuous_flat_conveyance', 'process_defined', solutionChain, 'integrated_rapid_cooling'), publicationEligibility: 'blocked', publicClaimScope: 'process_system_direction', assumptions: ['牌号、表面、连续输送、快速转移和快速冷却能力由工艺文件确认'], priority: 30, supersedesRuleIds: ['eqdir-stainless-continuous-v1'] });

for (const [material, workpieceId] of [['aluminum', 'aluminum-coil'], ['carbon-steel', 'carbon-steel-coil']]) {
  add({ ruleId: `eqdir-${material}-coil-bell-batch-v2`, logicUnitId: 'strip_coil_professional', allowedPairs: pairs('coil-professional-line-review', [`${workpieceId}:coil-annealing`]), publicLabelKey: 'bell_batch', equipmentFamilyId: `${material}-coil-bell-batch-furnace`, evidence: 'bell', matchCriteria: [rhythmBatch, criterion('loadingOrientation', ['coil', 'vertical']), criterion('atmosphereRequirement', ['protective', 'bright', 'controlled_process_atmosphere'])], equipmentOutput: output('batch', 'bell', 'vertical_coil_stack', 'process_defined', ['coil_annealing'], 'controlled_furnace_cooling'), assumptions: ['卷材堆叠、循环路径、表面和气氛要求已确认'], priority: 10, supersedesRuleIds: ['eqdir-coil-bell-batch-v1'] });
  add({ ruleId: `eqdir-${material}-strip-continuous-v2`, logicUnitId: 'strip_coil_professional', allowedPairs: pairs('coil-professional-line-review', [`${workpieceId}:continuous-annealing`]), publicLabelKey: 'strip_continuous_line', equipmentFamilyId: `${material}-strip-continuous-line`, evidence: 'strip', matchCriteria: [rhythmContinuous, criterion('loadingOrientation', ['strip', 'uncoiled']), dimensions], equipmentOutput: output('continuous', 'continuous_strip_line', 'uncoiled_strip_conveyance', 'process_defined', ['continuous_annealing'], 'process_defined'), assumptions: ['开卷、带材张力、表面、气氛和冷却要求已确认'], priority: 20, supersedesRuleIds: ['eqdir-strip-continuous-v1'] });
}

for (const [suffix, pairSet, chain, cooling, scope] of [['thermal', longSimple, thermalChain, 'process_defined', 'conditional_engineering_direction'], ['quench-temper', longQt, qtChain, 'integrated_quench_and_final_cooling', 'process_system_direction']]) {
  const q = suffix === 'quench-temper';
  add({ ruleId: `eqdir-long-products-roller-${suffix}-v2`, logicUnitId: 'long_products', allowedPairs: pairSet, publicLabelKey: q ? 'roller_hearth_quench_temper_line' : 'roller_hearth_continuous', equipmentFamilyId: q ? 'long-product-quench-temper-line' : 'roller-hearth-continuous-furnace', evidence: q ? 'process_system' : 'roller', matchCriteria: q ? [rhythmContinuous, horizontal, dimensions, quenchSystem] : [rhythmContinuous, horizontal, dimensions], equipmentOutput: output('continuous', q ? 'roller_hearth_quench_temper_line' : 'roller_hearth_continuous', 'horizontal_roller_support', 'process_defined', chain, cooling), publicClaimScope: scope, assumptions: ['辊道支撑与直线度、节拍及工艺衔接相容'], priority: q ? 11 : 10, supersedesRuleIds: ['eqdir-long-products-roller-v1'] });
  add({ ruleId: `eqdir-long-products-fixed-hearth-${suffix}-v2`, logicUnitId: 'long_products', allowedPairs: pairSet, publicLabelKey: q ? 'batch_quench_temper' : 'fixed_hearth_batch', equipmentFamilyId: q ? 'long-product-batch-quench-temper-system' : 'fixed-hearth-batch-chamber-furnace', evidence: q ? 'process_system' : 'batch', matchCriteria: q ? [rhythmBatch, horizontal, dimensions, quenchSystem] : [rhythmBatch, horizontal, dimensions], equipmentOutput: output('batch', 'fixed_hearth_chamber', 'horizontal_fixture_support', 'process_defined', chain, cooling), publicationEligibility: 'blocked', publicClaimScope: scope, assumptions: ['水平支撑点、热变形、装卸和工艺衔接经工程确认'], priority: q ? 21 : 20, supersedesRuleIds: ['eqdir-long-products-batch-v1'] });
  add({ ruleId: `eqdir-long-products-vertical-${suffix}-v2`, logicUnitId: 'long_products', allowedPairs: pairSet, publicLabelKey: q ? 'batch_quench_temper' : 'vertical_batch', equipmentFamilyId: q ? 'vertical-batch-quench-temper-system' : 'vertical-batch-furnace', evidence: q ? 'process_system' : 'vertical', matchCriteria: q ? [rhythmBatch, vertical, dimensions, quenchSystem] : [rhythmBatch, vertical, dimensions], equipmentOutput: output('batch', 'vertical_or_pit', 'vertical_or_suspended_loading', 'process_defined', chain, cooling), publicClaimScope: scope, assumptions: ['立式支撑、吊装、热变形和工艺衔接经工程确认'], priority: q ? 31 : 30, supersedesRuleIds: ['eqdir-long-products-vertical-v1'] });
}

add({ ruleId: 'eqdir-wire-coil-vertical-v1', logicUnitId: 'coiled_wire', allowedPairs: wirePairs, publicLabelKey: 'vertical_batch', equipmentFamilyId: 'vertical-batch-furnace', evidence: 'vertical', matchCriteria: [rhythmBatch, criterion('loadingOrientation', ['coil', 'vertical']), dimensions, weight], equipmentOutput: output('batch', 'vertical_or_pit', 'vertical_coil_stack', 'process_defined', thermalChain, 'process_defined'), publicationEligibility: 'blocked', assumptions: ['卷间循环、堆叠和支撑方式经工程确认'], priority: 10, supersedesRuleIds: ['eqdir-wire-coil-vertical-v1'] });
add({ ruleId: 'eqdir-wire-coil-bell-v1', logicUnitId: 'coiled_wire', allowedPairs: wirePairs, publicLabelKey: 'bell_batch', equipmentFamilyId: 'bell-batch-furnace', evidence: 'bell', matchCriteria: [rhythmBatch, criterion('atmosphereRequirement', ['protective', 'bright', 'controlled_process_atmosphere']), dimensions, weight], equipmentOutput: output('batch', 'bell', 'vertical_coil_stack', 'process_defined', thermalChain, 'controlled_furnace_cooling'), assumptions: ['卷内外循环、堆叠、气氛和冷却要求经工程确认'], priority: 20, supersedesRuleIds: ['eqdir-wire-coil-bell-v1'] });

for (const [kind, pairSet, blocked] of [['fastener', fastenerPairs, false], ['chain-component', chainQtPairs, true]]) {
  add({ ruleId: `eqdir-${kind}-mesh-quench-temper-v2`, logicUnitId: 'fastener_continuous', allowedPairs: pairSet, publicLabelKey: 'mesh_belt_quench_temper_line', equipmentFamilyId: `${kind}-mesh-belt-quench-temper-line`, evidence: 'process_system', matchCriteria: [rhythmContinuous, dimensions, quenchSystem], equipmentOutput: output('continuous', 'mesh_belt_quench_temper_line', 'mesh_belt_small_parts_conveyance', 'process_defined', qtChain, 'integrated_quench_and_final_cooling'), publicationEligibility: blocked ? 'blocked' : 'internal_only', publicClaimScope: 'process_system_direction', assumptions: [kind === 'fastener' ? '紧固件形状、装料密度、粘连风险和完整调质链经工程确认' : '链条零件类型尚未明确，形状、装料和完整调质链必须先确认'], priority: 10, supersedesRuleIds: ['eqdir-fastener-mesh-continuous-v1'] });
  add({ ruleId: `eqdir-${kind}-batch-quench-temper-v2`, logicUnitId: 'fastener_continuous', allowedPairs: pairSet, publicLabelKey: 'batch_quench_temper', equipmentFamilyId: `${kind}-batch-quench-temper-system`, evidence: 'process_system', matchCriteria: [rhythmBatch, dimensions, quenchSystem], equipmentOutput: output('batch', 'batch_chamber_quench_temper_system', 'basket_or_fixture_loading', 'process_defined', qtChain, 'integrated_quench_and_final_cooling'), publicationEligibility: 'blocked', publicClaimScope: 'process_system_direction', assumptions: [kind === 'fastener' ? '批次装料密度、粘连风险和完整调质链经工程确认' : '链条零件类型尚未明确，批次装料和完整调质链必须先确认'], priority: 20, supersedesRuleIds: ['eqdir-fastener-batch-v1'] });
}

add({ ruleId: 'eqdir-small-spring-stress-relief-continuous-v2', logicUnitId: 'small_spring_continuous', allowedPairs: springStress, publicLabelKey: 'conveyor_stress_relief', equipmentFamilyId: 'spring-stress-relief-continuous-furnace', evidence: 'continuous', matchCriteria: [rhythmContinuous, dimensions], equipmentOutput: output('continuous', 'conveyor_continuous', 'anti_tangle_conveyance', 'process_defined', ['stress_relief'], 'controlled_furnace_cooling'), assumptions: ['弹簧形状、装料和防缠绕输送条件经工程确认'], priority: 10, supersedesRuleIds: ['eqdir-small-spring-continuous-v1'] });
add({ ruleId: 'eqdir-small-spring-stress-relief-batch-v2', logicUnitId: 'small_spring_continuous', allowedPairs: springStress, publicLabelKey: 'batch_stress_relief', equipmentFamilyId: 'spring-stress-relief-batch-furnace', matchCriteria: [rhythmBatch, dimensions], equipmentOutput: output('batch', 'fixed_hearth_batch_chamber', 'basket_or_fixture_anti_tangle_loading', 'process_defined', ['stress_relief'], 'controlled_furnace_cooling'), publicationEligibility: 'blocked', assumptions: ['批次装料不会造成缠绕、变形或均匀性问题'], priority: 20, supersedesRuleIds: ['eqdir-small-spring-batch-v1'] });
add({ ruleId: 'eqdir-small-spring-quench-temper-continuous-v2', logicUnitId: 'small_spring_continuous', allowedPairs: springQt, publicLabelKey: 'conveyor_quench_temper', equipmentFamilyId: 'spring-quench-temper-continuous-line', evidence: 'process_system', matchCriteria: [rhythmContinuous, dimensions, quenchSystem], equipmentOutput: output('continuous', 'conveyor_quench_temper_line', 'anti_tangle_conveyance', 'process_defined', qtChain, 'integrated_quench_and_final_cooling'), publicClaimScope: 'process_system_direction', assumptions: ['防缠绕装料、淬火转移、清洗、回火和终冷配置经工程确认'], priority: 30, supersedesRuleIds: ['eqdir-small-spring-continuous-v1'] });
add({ ruleId: 'eqdir-small-spring-quench-temper-batch-v2', logicUnitId: 'small_spring_continuous', allowedPairs: springQt, publicLabelKey: 'batch_quench_temper', equipmentFamilyId: 'spring-quench-temper-batch-system', evidence: 'process_system', matchCriteria: [rhythmBatch, dimensions, quenchSystem], equipmentOutput: output('batch', 'batch_chamber_quench_temper_system', 'basket_or_fixture_anti_tangle_loading', 'process_defined', qtChain, 'integrated_quench_and_final_cooling'), publicationEligibility: 'blocked', publicClaimScope: 'process_system_direction', assumptions: ['批次防缠绕装料、淬火转移、清洗、回火和终冷配置经工程确认'], priority: 40, supersedesRuleIds: ['eqdir-small-spring-batch-v1'] });

const rulesData = {
  schemaVersion: '2.1.0',
  baselineVersion,
  resolverVersion,
  policy: {
    claimLevel: 'equipment_direction',
    maxPublicDirections: 3,
    deterministic: true,
    triStateConditions: true,
    unknownCannotMatch: true,
    metadataOnlyCannotQualify: true,
    partiallyVerifiedCannotAutoQualify: true,
    numericParametersAllowed: false,
    companyCapabilityIndependent: true,
  },
  excludedRouteIds: [
    'aluminum-cylinder-solution-quench', 'aluminum-cylinder-artificial-aging',
    'seamless-steel-cylinder-quench-temper', 'seamless-steel-cylinder-normalizing',
    'seamless-stainless-steel-cylinder-confirmation', 'seamless-steel-cylinder-other-material',
    'welded-lpg-cylinder-normalizing', 'welded-steel-cylinder-general-standard',
    'welded-steel-cylinder-other-standard', 'ductile-iron-austempering-review',
    'shaft-gear-local-hardening-external', 'undercarriage-local-hardening-external',
    'welded-pipe-local-seam-treatment-external', 'steel-pin-local-hardening-external',
  ],
  rules,
};

const mappingData = {
  schemaVersion: '1.0.0',
  mappingVersion: 'workpiece-router-public-labels-2.1.0',
  labels,
};

const rulesPath = join(dataDir, 'industry-direction-rules.json');
const mappingPath = join(dataDir, 'industry-public-label-mapping.json');
writeFileSync(rulesPath, `${JSON.stringify(rulesData, null, 2)}\n`);
writeFileSync(mappingPath, `${JSON.stringify(mappingData, null, 2)}\n`);

const fileHash = (path) => createHash('sha256').update(readFileSync(path)).digest('hex');
const rulePriorityHash = createHash('sha256')
  .update(JSON.stringify(rules.map(({ ruleId, priority }) => ({ ruleId, priority })).sort((a, b) => a.ruleId.localeCompare(b.ruleId))))
  .digest('hex');
const ruleSetHash = `sha256:${fileHash(rulesPath)}`;
const evidenceSnapshotHash = `sha256:${fileHash(join(dataDir, 'industry-evidence-registry.json'))}`;
const publicLabelMappingHash = `sha256:${fileHash(mappingPath)}`;

const resolverConfig = {
  schemaVersion: '1.0.0',
  resolverVersion,
  ruleSchemaVersion: rulesData.schemaVersion,
  publicLabelMappingVersion: mappingData.mappingVersion,
  snapshot: { ruleSetHash, evidenceSnapshotHash, publicLabelMappingHash, rulePriorityHash: `sha256:${rulePriorityHash}` },
};
writeFileSync(join(dataDir, 'industry-resolver-config.json'), `${JSON.stringify(resolverConfig, null, 2)}\n`);

const baselineData = JSON.parse(readFileSync(join(dataDir, 'industry-baseline-versions.json'), 'utf8'));
const previousVersions = baselineData.versions.filter((item) => item.baselineVersion !== baselineVersion);
const nextBaseline = {
  ...baselineData,
  schemaVersion: '2.1.0',
  currentDraftVersion: baselineVersion,
  publicBaselineVersion: null,
  versions: [
    ...previousVersions,
    {
      baselineVersion,
      publicationStatus: 'draft',
      approvedBy: null,
      approvedByRole: null,
      approvedAt: null,
      approvalScope: null,
      resolverVersion,
      publicLabelMappingHash,
      rulePriorityHash: `sha256:${rulePriorityHash}`,
      ruleSetHash,
      evidenceSnapshotHash,
      changeSummary: `第2.1批逻辑收口：以${rules.length}条显式allowedPairs规则替代31条隐式组合规则；所有条件改为true/false/unknown三值判断；拆分工艺链、设备输出、规则公开资格和快照锁定字段。当前仍为待负责人审核的草稿。`,
      createdAt: '2026-08-27T14:00:00+08:00',
      supersedesBaselineVersion: 'industry-baseline-2026-08-batch2-draft',
      locked: false,
    },
  ],
};
writeFileSync(join(dataDir, 'industry-baseline-versions.json'), `${JSON.stringify(nextBaseline, null, 2)}\n`);

console.log(`generated ${rules.length} explicit rules for ${baselineVersion}`);
