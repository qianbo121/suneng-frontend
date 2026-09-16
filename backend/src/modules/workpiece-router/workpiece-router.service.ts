import { Injectable } from '@nestjs/common';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { type ResolveWorkpieceRouterDto } from '@/modules/workpiece-router/dto/resolve-workpiece-router.dto';
import {
  resolveServerIndustryDirection,
  type CandidateEquipmentCapability,
  type RawEngineeringInput,
  type ServerDirectionResolution,
  type ServerIndustryRule,
} from '@/modules/workpiece-router/engineering-resolver';

export type WorkpieceRouterDisplayState =
  | 'insufficient_conditions'
  | 'single_direction'
  | 'multiple_directions'
  | 'completed_pending_engineering'
  | 'engineering_review'
  | 'no_match'
  | 'invalid_input'
  | 'special_process_boundary';

export type PublicConditionField = {
  id: string;
  label: string;
  type: 'text' | 'number' | 'choice' | 'boolean_choice';
  required: boolean;
  unit?: string;
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
};

export type PublicConditionGroup = {
  id: string;
  label: string;
  summary: string;
  completed: boolean;
  fields: PublicConditionField[];
};

export type PublicDirection = {
  name: string;
  resolutionStage: 'conditional_preview' | 'matched_direction';
  publicStatement: string;
  matchingBasis: string[];
  stillNeedConfirm: string[];
  qualifyingConditions?: string[];
};

export type WorkpieceRouterPublicResponse = {
  displayState: WorkpieceRouterDisplayState;
  conditionGroups: PublicConditionGroup[];
  completedGroups: number;
  totalGroups: number;
  missingInputs: string[];
  nextQuestion: { groupId: string; fieldId: string; prompt: string } | null;
  publicDirections: PublicDirection[];
  customerNote: string;
};

export type PublicDirectionExample = {
  condition: string;
  direction: string;
};

export type WorkpieceDirectionExamplesResponse = {
  workpieceId: string;
  displayWorkpieceName?: string;
  examples: PublicDirectionExample[];
  customerNote: string;
};

type ProcessVariant = { id: string; label?: string; processPurposeId?: string | null };
type ProcessRoute = {
  id: string;
  workpieceIds: string[];
  logicUnitId?: string;
  processVariants: ProcessVariant[];
  processBoundary?: string;
  moduleDisposition?: string;
  customerNote?: string;
  requiredInputs?: string[];
};

type DirectionRule = ServerIndustryRule & {
  equipmentFamilyId?: string;
  publicLabelDerivationKey?: string;
  equipmentOutput: ServerIndustryRule['equipmentOutput'] & {
    furnaceArchitecture?: string;
  };
  pairEvidence?: Record<
    string,
    {
      taxonomyRefs?: string[];
      applicationMappingRefs?: string[];
    }
  >;
};

type PublicEvidence = {
  evidenceId: string;
  evidenceType: string;
  status: string;
  accessLevel: string;
  verificationStatus: string;
};

type PublicSnapshot = {
  publicBaselineVersion: string | null;
  rules: DirectionRule[];
  evidence: PublicEvidence[];
  labels: {
    architectureLabels?: Record<string, string>;
    combinationOverrides?: Record<string, string>;
  };
};

type BaselineData = {
  publicBaselineVersion: string | null;
  versions: Array<{
    baselineVersion: string;
    publicationStatus?: string;
    locked?: boolean;
    lockedAt?: string | null;
    approvedBy?: string | null;
    approvedRole?: string | null;
    approvedByRole?: string | null;
    approvedAt?: string | null;
    approvedRuleIds?: string[];
    approvedPairKeys?: string[];
    resolverVersion?: string;
    ruleSetHash?: string;
    evidenceSnapshotHash?: string;
    publicLabelMappingHash?: string;
    publicClaimTemplateHash?: string;
    rulePriorityHash?: string;
    approvedScopeHash?: string;
  }>;
};

type ResolverConfig = {
  resolverVersion: string;
  canonicalHashAlgorithm: string;
  snapshot: {
    ruleSetHash: string;
    evidenceSnapshotHash: string;
    publicLabelMappingHash: string;
    publicClaimTemplateHash: string;
    rulePriorityHash: string;
    approvedScopeHash: string;
  };
};

type WorkpieceCatalog = {
  categories: Array<{
    id: string;
    label: string;
    name: string;
    cards: Array<{ id: string; name: string }>;
  }>;
};

function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, canonicalize((value as Record<string, unknown>)[key])]),
    );
  }
  return value;
}

export function computeApprovedScopeHash(ruleIds: string[], pairKeys: string[]) {
  const scope = {
    approvedRuleIds: [...ruleIds].sort(),
    approvedPairKeys: [...pairKeys].sort(),
  };
  return `sha256:${createHash('sha256')
    .update(JSON.stringify(canonicalize(scope)))
    .digest('hex')}`;
}

type CapabilityRecord = Partial<CandidateEquipmentCapability> & {
  id?: string;
  equipmentFamilyId?: string;
  engineeringProfile?: Partial<CandidateEquipmentCapability>;
};

export type WorkpieceRouterResolveData = {
  routes: ProcessRoute[];
  rules: DirectionRule[];
  catalog: WorkpieceCatalog;
  publicSnapshot: PublicSnapshot;
  baselines: BaselineData;
  resolverConfig: ResolverConfig;
  capabilities: CapabilityRecord[];
  publicPairLabels?: Record<string, string>;
  publicWorkpieceLabels?: Record<string, string>;
  finalDirectionsByWorkpiece?: Record<
    string,
    {
      displayWorkpieceName: string;
      examples: Array<{
        position?: number;
        condition: string;
        direction: string;
        adoption?: '采用' | '有条件采用';
        boundary?: string;
      }>;
    }
  >;
};

type FieldDefinition = PublicConditionField & {
  groupId: 'dimensions' | 'handling' | 'production' | 'process';
};

const choice = (value: string, label: string) => ({ value, label });
const yesNoUnknown = [
  choice('true', '是'),
  choice('false', '否'),
  choice('unknown', '不清楚/待确认'),
];

const FIELDS: Record<string, FieldDefinition> = {
  materialFamily: {
    id: 'materialFamily',
    label: '材质',
    type: 'text',
    required: true,
    placeholder: '例如：碳钢、不锈钢',
    groupId: 'process',
  },
  materialGrade: {
    id: 'materialGrade',
    label: '牌号',
    type: 'text',
    required: true,
    placeholder: '例如：Q355B',
    groupId: 'process',
  },
  applicableStandard: {
    id: 'applicableStandard',
    label: '执行标准',
    type: 'text',
    required: true,
    placeholder: '例如：GB/T或图纸要求',
    groupId: 'process',
  },
  drawingRequirement: {
    id: 'drawingRequirement',
    label: '图纸工艺要求',
    type: 'text',
    required: true,
    groupId: 'process',
  },
  weldingProcedure: {
    id: 'weldingProcedure',
    label: '焊接工艺信息',
    type: 'text',
    required: true,
    groupId: 'process',
  },
  processRequirement: {
    id: 'processRequirement',
    label: '其他工艺要求',
    type: 'text',
    required: true,
    placeholder: '例如：硬度、金相、表面或验收要求',
    groupId: 'process',
  },
  maximumThickness: {
    id: 'maximumThickness',
    label: '最大厚度',
    type: 'number',
    required: true,
    unit: 'mm',
    groupId: 'dimensions',
  },
  dimensionLength: {
    id: 'dimensionLength',
    label: '工件长度',
    type: 'number',
    required: true,
    groupId: 'dimensions',
  },
  dimensionWidth: {
    id: 'dimensionWidth',
    label: '工件宽度',
    type: 'number',
    required: true,
    groupId: 'dimensions',
  },
  dimensionHeight: {
    id: 'dimensionHeight',
    label: '工件高度',
    type: 'number',
    required: true,
    groupId: 'dimensions',
  },
  dimensionDiameter: {
    id: 'dimensionDiameter',
    label: '工件直径',
    type: 'number',
    required: true,
    groupId: 'dimensions',
  },
  dimensionUnit: {
    id: 'dimensionUnit',
    label: '尺寸单位',
    type: 'choice',
    required: true,
    options: [
      choice('mm', '毫米'),
      choice('cm', '厘米'),
      choice('m', '米'),
      choice('unknown', '不清楚'),
    ],
    groupId: 'dimensions',
  },
  singlePieceWeightKg: {
    id: 'singlePieceWeightKg',
    label: '单件重量',
    type: 'number',
    required: true,
    unit: 'kg',
    groupId: 'dimensions',
  },
  fixtureWeightKg: {
    id: 'fixtureWeightKg',
    label: '工装重量',
    type: 'number',
    required: true,
    unit: 'kg',
    groupId: 'dimensions',
  },
  batchLoadWeightKg: {
    id: 'batchLoadWeightKg',
    label: '批次装载总重',
    type: 'number',
    required: true,
    unit: 'kg',
    groupId: 'dimensions',
  },
  centerOfGravityX: {
    id: 'centerOfGravityX',
    label: '重心X偏移',
    type: 'number',
    required: true,
    unit: 'mm',
    groupId: 'dimensions',
  },
  centerOfGravityY: {
    id: 'centerOfGravityY',
    label: '重心Y偏移',
    type: 'number',
    required: true,
    unit: 'mm',
    groupId: 'dimensions',
  },
  centerOfGravityZ: {
    id: 'centerOfGravityZ',
    label: '重心高度',
    type: 'number',
    required: true,
    unit: 'mm',
    groupId: 'dimensions',
  },
  supportSpanMm: {
    id: 'supportSpanMm',
    label: '工件支撑跨距',
    type: 'number',
    required: true,
    unit: 'mm',
    groupId: 'dimensions',
  },
  shaftEquivalentSectionMm: {
    id: 'shaftEquivalentSectionMm',
    label: '轴类等效直径或截面',
    type: 'number',
    required: true,
    unit: 'mm',
    groupId: 'dimensions',
  },
  shaftSlendernessRatio: {
    id: 'shaftSlendernessRatio',
    label: '长细比（辅助项）',
    type: 'number',
    required: false,
    groupId: 'dimensions',
  },
  allowableDeflectionMm: {
    id: 'allowableDeflectionMm',
    label: '允许挠度',
    type: 'number',
    required: true,
    unit: 'mm',
    groupId: 'dimensions',
  },
  horizontalLoadingAllowed: {
    id: 'horizontalLoadingAllowed',
    label: '是否允许卧式装炉',
    type: 'boolean_choice',
    required: true,
    options: yesNoUnknown,
    groupId: 'handling',
  },
  supportPointCount: {
    id: 'supportPointCount',
    label: '支撑点数量',
    type: 'number',
    required: true,
    groupId: 'handling',
  },
  supportPointLayout: {
    id: 'supportPointLayout',
    label: '支撑点位置与接触形式',
    type: 'text',
    required: true,
    placeholder: '说明位置、跨距和接触形式',
    groupId: 'handling',
  },
  partForm: {
    id: 'partForm',
    label: '工件形态',
    type: 'choice',
    required: true,
    options: [
      choice('discrete_part', '单件'),
      choice('plate', '板材'),
      choice('long_product', '长材'),
      choice('coil', '卷材'),
      choice('strip', '带材'),
      choice('irregular_assembly', '不规则组件'),
      choice('unknown', '不清楚'),
    ],
    groupId: 'handling',
  },
  loadingOrientation: {
    id: 'loadingOrientation',
    label: '装料姿态',
    type: 'choice',
    required: true,
    options: [
      choice('horizontal', '卧式'),
      choice('vertical', '立式'),
      choice('flat', '平放'),
      choice('suspended', '悬挂'),
      choice('unknown', '不清楚'),
    ],
    groupId: 'handling',
  },
  presentationState: {
    id: 'presentationState',
    label: '装料形态',
    type: 'choice',
    required: true,
    options: [
      choice('coiled', '成卷'),
      choice('uncoiled', '展开'),
      choice('stacked', '堆叠'),
      choice('single_piece', '单件'),
      choice('bulk_loaded', '散装'),
      choice('unknown', '不清楚'),
    ],
    groupId: 'handling',
  },
  loadMovement: {
    id: 'loadMovement',
    label: '加热过程中是否移动',
    type: 'choice',
    required: true,
    options: [
      choice('stationary', '保持不动'),
      choice('through_process', '持续通过'),
      choice('either', '均可'),
      choice('unknown', '不清楚'),
    ],
    groupId: 'handling',
  },
  loadingAccess: {
    id: 'loadingAccess',
    label: '上下料方式',
    type: 'choice',
    required: true,
    options: [
      choice('crane_or_forklift', '行车或叉车'),
      choice('conveyor_feed', '输送线'),
      choice('manual_or_basket', '人工或料筐'),
      choice('unknown', '不清楚'),
    ],
    groupId: 'handling',
  },
  baseSupportCondition: {
    id: 'baseSupportCondition',
    label: '工件与支撑的接触形式',
    type: 'choice',
    required: true,
    options: [
      choice('broad_base', '大面积底部支撑'),
      choice('line_contact', '线接触'),
      choice('distributed_small_parts', '分散小件'),
      choice('fixture_required', '需要专用工装'),
      choice('no_base_support', '无底部支撑'),
      choice('unknown', '不清楚'),
    ],
    groupId: 'handling',
  },
  continuousContactAllowed: {
    id: 'continuousContactAllowed',
    label: '是否允许连续接触支撑',
    type: 'boolean_choice',
    required: true,
    options: yesNoUnknown,
    groupId: 'handling',
  },
  floorLoadingRequired: {
    id: 'floorLoadingRequired',
    label: '是否需要落地装料',
    type: 'boolean_choice',
    required: true,
    options: yesNoUnknown,
    groupId: 'handling',
  },
  suspensionAllowed: {
    id: 'suspensionAllowed',
    label: '是否允许悬挂加热',
    type: 'boolean_choice',
    required: true,
    options: yesNoUnknown,
    groupId: 'handling',
  },
  stackingAllowed: {
    id: 'stackingAllowed',
    label: '是否允许堆叠装料',
    type: 'boolean_choice',
    required: true,
    options: yesNoUnknown,
    groupId: 'handling',
  },
  bulkLoadingSuitable: {
    id: 'bulkLoadingSuitable',
    label: '是否适合散装或料筐',
    type: 'boolean_choice',
    required: true,
    options: yesNoUnknown,
    groupId: 'handling',
  },
  batchSize: {
    id: 'batchSize',
    label: '批量大小',
    type: 'choice',
    required: true,
    options: [
      choice('small', '小批'),
      choice('medium', '中批'),
      choice('large', '大批'),
      choice('unknown', '不清楚'),
    ],
    groupId: 'production',
  },
  targetThroughput: {
    id: 'targetThroughput',
    label: '目标产能',
    type: 'choice',
    required: true,
    options: [
      choice('low', '低'),
      choice('medium', '中'),
      choice('high', '高'),
      choice('unknown', '不清楚'),
    ],
    groupId: 'production',
  },
  productMix: {
    id: 'productMix',
    label: '品种稳定性',
    type: 'choice',
    required: true,
    options: [
      choice('stable', '稳定单一'),
      choice('few_variants', '少量变型'),
      choice('high_mix', '多品种'),
      choice('unknown', '不清楚'),
    ],
    groupId: 'production',
  },
  changeoverFrequency: {
    id: 'changeoverFrequency',
    label: '换型频率',
    type: 'choice',
    required: true,
    options: [
      choice('rare', '很少'),
      choice('periodic', '定期'),
      choice('frequent', '频繁'),
      choice('unknown', '不清楚'),
    ],
    groupId: 'production',
  },
  cycleTimeExpectation: {
    id: 'cycleTimeExpectation',
    label: '生产节拍',
    type: 'choice',
    required: true,
    options: [
      choice('flexible', '可灵活安排'),
      choice('regular', '固定节拍'),
      choice('tight', '紧凑节拍'),
      choice('unknown', '不清楚'),
    ],
    groupId: 'production',
  },
  loadingContinuity: {
    id: 'loadingContinuity',
    label: '装料连续性',
    type: 'choice',
    required: true,
    options: [
      choice('discrete', '分批装料'),
      choice('intermittent', '间歇装料'),
      choice('continuous', '连续装料'),
      choice('unknown', '不清楚'),
    ],
    groupId: 'production',
  },
  operationPreference: {
    id: 'operationPreference',
    label: '运行方式偏好',
    type: 'choice',
    required: false,
    options: [
      choice('batch', '周期生产'),
      choice('continuous', '连续生产'),
      choice('no_preference', '无偏好'),
      choice('unknown', '不清楚'),
    ],
    groupId: 'production',
  },
  atmosphereType: {
    id: 'atmosphereType',
    label: '工艺气氛',
    type: 'choice',
    required: true,
    options: [
      choice('air', '空气'),
      choice('inert', '惰性气氛'),
      choice('reducing', '还原性气氛'),
      choice('protective', '保护气氛'),
      choice('controlled_carbon_potential', '可控碳势'),
      choice('controlled_carbon_nitrogen_potential', '可控碳氮势'),
      choice('unknown', '不清楚'),
    ],
    groupId: 'process',
  },
  surfaceObjective: {
    id: 'surfaceObjective',
    label: '表面目标',
    type: 'choice',
    required: true,
    options: [
      choice('normal', '常规'),
      choice('low_oxidation', '低氧化'),
      choice('bright', '光亮'),
      choice('scale_controlled', '控制氧化皮'),
      choice('unknown', '不清楚'),
    ],
    groupId: 'process',
  },
  treatmentScope: {
    id: 'treatmentScope',
    label: '处理范围',
    type: 'choice',
    required: true,
    options: [
      choice('whole_component', '整体处理'),
      choice('local', '局部处理'),
      choice('field', '现场处理'),
      choice('unknown', '不清楚'),
    ],
    groupId: 'process',
  },
  distortionConstraint: {
    id: 'distortionConstraint',
    label: '变形控制要求',
    type: 'choice',
    required: true,
    options: [
      choice('strict', '严格'),
      choice('controlled', '需控制'),
      choice('standard', '常规'),
      choice('unknown', '不清楚'),
    ],
    groupId: 'process',
  },
  priorHeatTreatmentState: {
    id: 'priorHeatTreatmentState',
    label: '前序热处理状态',
    type: 'choice',
    required: true,
    options: [
      choice('after_quench', '淬火后'),
      choice('after_normalizing', '正火后'),
      choice('other_defined', '其他已明确状态'),
      choice('none', '无明确前序状态'),
      choice('unknown', '不清楚'),
    ],
    groupId: 'process',
  },
  temperingPurpose: {
    id: 'temperingPurpose',
    label: '单独回火目的',
    type: 'text',
    required: true,
    placeholder: '填写图纸或工艺卡规定的回火目的',
    groupId: 'process',
  },
  drawingOrProcessCardConfirmed: {
    id: 'drawingOrProcessCardConfirmed',
    label: '图纸或工艺卡是否已明确',
    type: 'boolean_choice',
    required: true,
    options: yesNoUnknown,
    groupId: 'process',
  },
  treatmentChainMode: {
    id: 'treatmentChainMode',
    label: '本次工艺链范围',
    type: 'choice',
    required: true,
    options: [
      choice('standalone_tempering', '单独回火'),
      choice('quench_temper_full_chain', '完整调质链'),
      choice('unknown', '不清楚'),
    ],
    groupId: 'process',
  },
  pipeTreatmentScope: {
    id: 'pipeTreatmentScope',
    label: '钢管处理范围',
    type: 'choice',
    required: true,
    options: [
      choice('whole_pipe', '整管处理'),
      choice('online_weld_seam', '在线焊缝处理'),
      choice('local_induction', '局部感应处理'),
      choice('unknown', '不清楚'),
    ],
    groupId: 'process',
  },
  coilProcessingForm: {
    id: 'coilProcessingForm',
    label: '带卷处理形态',
    type: 'choice',
    required: true,
    options: [
      choice('coiled_batch', '成卷批次处理'),
      choice('uncoiled_continuous', '开卷连续处理'),
      choice('unknown', '不清楚'),
    ],
    groupId: 'process',
  },
  coatingState: {
    id: 'coatingState',
    label: '涂镀或覆层状态',
    type: 'choice',
    required: true,
    options: [
      choice('uncoated', '无涂镀或覆层'),
      choice('coated', '涂镀'),
      choice('clad', '覆层或复合'),
      choice('unknown', '不清楚'),
    ],
    groupId: 'process',
  },
  wearPlateConstruction: {
    id: 'wearPlateConstruction',
    label: '耐磨板结构',
    type: 'choice',
    required: true,
    options: [
      choice('homogeneous', '均质钢板'),
      choice('composite', '复合耐磨板'),
      choice('overlay', '堆焊耐磨板'),
      choice('coated', '覆层耐磨板'),
      choice('unknown', '不清楚'),
    ],
    groupId: 'process',
  },
  fastenerMaterialClass: {
    id: 'fastenerMaterialClass',
    label: '紧固件材料类别',
    type: 'choice',
    required: true,
    options: [
      choice('carbon_or_alloy_steel', '碳钢或合金钢'),
      choice('stainless_steel', '不锈钢'),
      choice('nonferrous', '有色金属'),
      choice('unknown', '不清楚'),
    ],
    groupId: 'process',
  },
  nutConstruction: {
    id: 'nutConstruction',
    label: '螺母结构',
    type: 'choice',
    required: true,
    options: [
      choice('plain_hex', '普通钢制六角螺母'),
      choice('insert', '带嵌件'),
      choice('self_locking', '自锁结构'),
      choice('welded_assembly', '焊接总成'),
      choice('other', '其他结构'),
      choice('unknown', '不清楚'),
    ],
    groupId: 'process',
  },
  wholeComponentQuenchTemper: {
    id: 'wholeComponentQuenchTemper',
    label: '是否为整体调质',
    type: 'boolean_choice',
    required: true,
    options: yesNoUnknown,
    groupId: 'process',
  },
  quenchRequired: {
    id: 'quenchRequired',
    label: '是否需要淬火',
    type: 'boolean_choice',
    required: true,
    options: yesNoUnknown,
    groupId: 'process',
  },
  quenchMedium: {
    id: 'quenchMedium',
    label: '淬火介质',
    type: 'text',
    required: true,
    placeholder: '例如：水、油、聚合物',
    groupId: 'process',
  },
  transferConstraint: {
    id: 'transferConstraint',
    label: '转移要求',
    type: 'choice',
    required: true,
    options: [
      choice('rapid', '需快速转移'),
      choice('bounded', '有时间边界'),
      choice('no_special_constraint', '无特殊限制'),
      choice('unknown', '不清楚'),
    ],
    groupId: 'process',
  },
  coolingRateRequirement: {
    id: 'coolingRateRequirement',
    label: '冷却速率要求',
    type: 'choice',
    required: true,
    options: [
      choice('rapid', '快速'),
      choice('controlled', '受控'),
      choice('standard', '常规'),
      choice('unknown', '不清楚'),
    ],
    groupId: 'process',
  },
  agitationOrFlowRequirement: {
    id: 'agitationOrFlowRequirement',
    label: '介质循环或搅拌',
    type: 'choice',
    required: true,
    options: [
      choice('required', '需要'),
      choice('not_required', '不需要'),
      choice('unknown', '不清楚'),
    ],
    groupId: 'process',
  },
};

for (const [id, label] of Object.entries({
  austenitizing: '奥氏体化加热',
  transfer: '转移',
  quench: '淬火',
  tempering: '回火',
  final_cooling: '最终冷却',
  solution_heating: '固溶加热',
  rapid_transfer: '快速转移',
  rapid_cooling: '快速冷却',
})) {
  FIELDS[id] = {
    id,
    label,
    type: 'boolean_choice',
    required: true,
    options: yesNoUnknown,
    groupId: 'process',
  };
}

const GROUP_LABELS = {
  dimensions: '尺寸与装载',
  handling: '装炉与支撑',
  production: '生产方式',
  process: '材质与工艺边界',
} as const;
const GROUP_ORDER = ['dimensions', 'handling', 'production', 'process'] as const;

const ENGINEERING_RAW_INPUTS: Record<string, string[]> = {
  loadEnvelopeCompatible: ['dimensionLength', 'dimensionWidth', 'dimensionHeight', 'dimensionUnit'],
  loadCapacityCompatible: ['batchLoadWeightKg'],
  centerOfGravityCompatible: ['centerOfGravityX', 'centerOfGravityY', 'centerOfGravityZ'],
  supportSpanCompatible: ['supportSpanMm'],
  supportCompatible: ['loadMovement', 'loadingAccess', 'baseSupportCondition'],
  handlingPathCompatible: ['loadingAccess', 'loadMovement'],
  geometryCompatible: ['partForm', 'loadingOrientation'],
  straightnessOrDistortionCompatible: ['distortionConstraint'],
  quenchTransferCompatible: ['quenchRequired', 'transferConstraint'],
  processChainCompatible: [],
  largeOrHeavy: [
    'dimensionLength',
    'dimensionWidth',
    'dimensionHeight',
    'dimensionUnit',
    'batchLoadWeightKg',
  ],
};

const OPERATION_SIGNALS = [
  'batchSize',
  'targetThroughput',
  'productMix',
  'changeoverFrequency',
  'cycleTimeExpectation',
  'loadingContinuity',
];
const OBSERVABLE_LOADING_SIGNALS = ['loadMovement', 'loadingAccess', 'baseSupportCondition'];

export const ROUTE_REQUIRED_INPUT_FIELD_MAP: Record<string, string[]> = {
  accumulationPermission: ['stackingAllowed'],
  adhesionRisk: ['surfaceObjective', 'processRequirement'],
  allowedDeformation: ['distortionConstraint'],
  atmosphereRequirement: ['atmosphereType'],
  batchOrContinuous: OPERATION_SIGNALS,
  batchQuantity: ['batchSize'],
  caseDepthRequirement: ['processRequirement'],
  coilDiameter: ['dimensionDiameter', 'dimensionUnit'],
  coilWeight: ['batchLoadWeightKg'],
  coilWidth: ['dimensionWidth', 'dimensionUnit'],
  coolingRequirement: ['coolingRateRequirement'],
  criticalSection: ['maximumThickness'],
  cylinderDimensions: ['dimensionLength', 'dimensionDiameter', 'dimensionUnit'],
  dimensions: ['dimensionLength', 'dimensionWidth', 'dimensionHeight', 'dimensionUnit'],
  effectiveHardenedDepth: ['processRequirement'],
  flatnessRequirement: ['distortionConstraint'],
  formingMethod: ['processRequirement'],
  length: ['dimensionLength', 'dimensionUnit'],
  lengthDiameterRatio: ['dimensionLength', 'dimensionDiameter', 'dimensionUnit'],
  loadingMethod: OBSERVABLE_LOADING_SIGNALS,
  loadingSupport: [...OBSERVABLE_LOADING_SIGNALS, 'supportSpanMm'],
  localTreatmentMethod: ['treatmentScope', 'processRequirement'],
  maximumSection: ['maximumThickness'],
  microstructureType: ['processRequirement'],
  partDimensions: ['dimensionLength', 'dimensionWidth', 'dimensionHeight', 'dimensionUnit'],
  partShape: ['partForm'],
  plateDimensions: ['dimensionLength', 'dimensionWidth', 'dimensionHeight', 'dimensionUnit'],
  processPurposeId: [],
  processSpecification: ['processRequirement'],
  productionRhythm: OPERATION_SIGNALS,
  section: ['maximumThickness'],
  serviceRequirement: ['processRequirement'],
  springDimensions: ['dimensionLength', 'dimensionDiameter', 'dimensionUnit'],
  stackingPermission: ['stackingAllowed'],
  strengthGrade: ['materialGrade'],
  supplyCondition: ['processRequirement'],
  surfaceCarbonRequirement: ['processRequirement'],
  surfaceRequirement: ['surfaceObjective', 'processRequirement'],
  targetHardness: ['processRequirement'],
  targetMechanicalProperties: ['processRequirement'],
  transferRequirement: ['transferConstraint'],
  treatmentArea: ['treatmentScope'],
  weight: ['batchLoadWeightKg'],
  wireDiameter: ['dimensionDiameter', 'dimensionUnit'],
};

const ALLOWED_RAW_KEYS = new Set(Object.keys(FIELDS));
let cachedResolveData: WorkpieceRouterResolveData | null = null;

function dataDirectory() {
  const candidates = [
    process.env.WORKPIECE_ROUTER_DATA_DIR,
    resolve(process.cwd(), 'data/workpiece-router'),
    resolve(process.cwd(), '../data/workpiece-router'),
  ].filter((candidate): candidate is string => Boolean(candidate));
  for (const candidate of candidates) {
    try {
      readFileSync(resolve(candidate, 'process-routes.json'));
      return candidate;
    } catch {
      // Try the next local or deployed workspace location.
    }
  }
  throw new Error('Workpiece router data directory is unavailable');
}

function readJson<T>(directory: string, name: string): T {
  return JSON.parse(readFileSync(resolve(directory, name), 'utf8')) as T;
}

export function loadWorkpieceRouterResolveData(): WorkpieceRouterResolveData {
  if (cachedResolveData) return cachedResolveData;
  const directory = dataDirectory();
  const publicCandidate = readJson<{
    candidateRules?: Array<{
      selectedPairs?: Array<{
        pairKey: string;
        workpieceId?: string;
        publicWorkpieceName?: string;
        publicProcessPurposeName?: string;
      }>;
    }>;
  }>(directory, 'industry-public-baseline-candidate-batch2.5-candidate-v2.json');
  const finalDirections = readJson<{
    directions: NonNullable<WorkpieceRouterResolveData['finalDirectionsByWorkpiece']>;
  }>(directory, 'industry-final-directions.json');
  cachedResolveData = {
    routes: readJson<{ routes: ProcessRoute[] }>(directory, 'process-routes.json').routes,
    rules: readJson<{ rules: DirectionRule[] }>(directory, 'industry-direction-rules.json').rules,
    catalog: readJson<WorkpieceCatalog>(directory, 'workpiece-card-manifest.json'),
    publicSnapshot: readJson<PublicSnapshot>(directory, 'industry-public-direction-snapshot.json'),
    baselines: readJson<BaselineData>(directory, 'industry-baseline-versions.json'),
    resolverConfig: readJson<ResolverConfig>(directory, 'industry-resolver-config.json'),
    capabilities: readJson<{ capabilities: CapabilityRecord[] }>(
      directory,
      'furnace-capability-whitelist.json',
    ).capabilities,
    publicPairLabels: Object.fromEntries(
      (publicCandidate.candidateRules ?? []).flatMap((rule) =>
        (rule.selectedPairs ?? []).flatMap((pair) =>
          pair.publicProcessPurposeName
            ? [[pair.pairKey, pair.publicProcessPurposeName] as const]
            : [],
        ),
      ),
    ),
    publicWorkpieceLabels: Object.fromEntries(
      (publicCandidate.candidateRules ?? []).flatMap((rule) =>
        (rule.selectedPairs ?? []).flatMap((pair) =>
          pair.workpieceId && pair.publicWorkpieceName
            ? [[pair.workpieceId, pair.publicWorkpieceName] as const]
            : [],
        ),
      ),
    ),
    finalDirectionsByWorkpiece: finalDirections.directions,
  };
  return cachedResolveData;
}

export type SanitizedRawConditionValue = string | number | boolean | null;

export function sanitizeRawConditions(
  raw: Record<string, unknown> | undefined,
): Record<string, SanitizedRawConditionValue> {
  const sanitized: Record<string, SanitizedRawConditionValue> = {};
  for (const [key, value] of Object.entries(raw ?? {})) {
    if (!ALLOWED_RAW_KEYS.has(key)) continue;
    if (value === null || typeof value === 'boolean') {
      sanitized[key] = value;
      continue;
    }
    if (typeof value === 'number') {
      if (Number.isFinite(value)) sanitized[key] = value;
      continue;
    }
    if (typeof value !== 'string') continue;
    const normalized = value.trim();
    if (normalized) sanitized[key] = normalized;
  }
  return sanitized;
}

function isAnswered(value: unknown) {
  return value !== undefined && value !== null && value !== '';
}

function isKnown(value: unknown) {
  return isAnswered(value) && value !== 'unknown';
}

function unitMultiplier(unit: unknown) {
  return unit === 'm' ? 1000 : unit === 'cm' ? 10 : unit === 'mm' ? 1 : null;
}

function scaledDimension(value: unknown, multiplier: number | null) {
  return typeof value === 'number' && multiplier !== null
    ? value * multiplier
    : value === 'unknown'
      ? 'unknown'
      : null;
}

function buildEngineeringInput(
  workpieceId: string,
  processPurposeId: string,
  routeId: string,
  raw: Record<string, unknown>,
): RawEngineeringInput {
  const multiplier = unitMultiplier(raw.dimensionUnit);
  const diameter = scaledDimension(raw.dimensionDiameter, multiplier);
  const batchWeight = typeof raw.batchLoadWeightKg === 'number' ? raw.batchLoadWeightKg : null;
  return {
    workpieceId,
    processPurposeId,
    routeId,
    ...raw,
    dimensionsMm: {
      length: scaledDimension(raw.dimensionLength, multiplier) as number | null,
      width: (scaledDimension(raw.dimensionWidth, multiplier) ?? diameter) as number | null,
      height: (scaledDimension(raw.dimensionHeight, multiplier) ?? diameter) as number | null,
    },
    weightKg: batchWeight,
    centerOfGravityMm: {
      x: raw.centerOfGravityX as number | null,
      y: raw.centerOfGravityY as number | null,
      z: raw.centerOfGravityZ as number | null,
    },
  } as RawEngineeringInput;
}

function capabilityFor(
  rule: DirectionRule,
  data: WorkpieceRouterResolveData,
): CandidateEquipmentCapability {
  const record = data.capabilities.find(
    (item) =>
      item.equipmentFamilyId === rule.equipmentFamilyId || item.id === rule.equipmentFamilyId,
  );
  const source = record?.engineeringProfile ?? record ?? {};
  return {
    capabilityId: String(source.capabilityId ?? record?.id ?? 'unavailable'),
    loadEnvelopeMm: source.loadEnvelopeMm ?? null,
    maximumLoadKg: source.maximumLoadKg ?? null,
    centerOfGravityLimitsMm: source.centerOfGravityLimitsMm ?? null,
    maximumSupportSpanMm: source.maximumSupportSpanMm ?? null,
    supportedPartForms: source.supportedPartForms,
    supportedLoadingOrientations: source.supportedLoadingOrientations,
    supportedSupportMethods: source.supportedSupportMethods,
    acceptedLoadingAccess: source.acceptedLoadingAccess,
    straightnessOrDistortionControl: source.straightnessOrDistortionControl ?? null,
    rapidTransferCapability: source.rapidTransferCapability ?? null,
    supportedProcessStages: source.supportedProcessStages,
    largeOrHeavyThreshold: source.largeOrHeavyThreshold ?? null,
  };
}

function pairKey(workpieceId: string, routeId: string, purposeId: string) {
  return `${workpieceId}|${routeId}|${purposeId}`;
}

function variantMatches(variant: ProcessVariant, purposeId: string) {
  return variant.id === purposeId || variant.processPurposeId === purposeId;
}

function isSpecialRoute(route: ProcessRoute) {
  return (
    route.moduleDisposition === 'outside_furnace_module' ||
    ['local_treatment', 'field_treatment'].includes(route.processBoundary ?? '')
  );
}

export function findUnmappedRouteRequiredInputs(data: WorkpieceRouterResolveData) {
  return [
    ...new Set(
      data.routes
        .flatMap((route) => route.requiredInputs ?? [])
        .filter((input) => {
          if (FIELDS[input]) return false;
          if (!Object.prototype.hasOwnProperty.call(ROUTE_REQUIRED_INPUT_FIELD_MAP, input))
            return true;
          const mapped = ROUTE_REQUIRED_INPUT_FIELD_MAP[input];
          return (
            mapped.some((field) => !FIELDS[field]) ||
            (mapped.length === 0 && input !== 'processPurposeId')
          );
        }),
    ),
  ].sort();
}

function collectRequiredFields(
  rules: DirectionRule[],
  routes: ProcessRoute[],
  workpieceId: string,
  processPurposeId: string,
) {
  const ids = new Set<string>();
  for (const route of routes) {
    for (const input of route.requiredInputs ?? []) {
      for (const mapped of ROUTE_REQUIRED_INPUT_FIELD_MAP[input] ?? [input])
        if (FIELDS[mapped]) ids.add(mapped);
    }
  }
  for (const rule of rules) {
    const routeIds = new Set(routes.map((route) => route.id));
    const pairDirectionGates = Object.entries(rule.pairDirectionGates ?? {})
      .filter(([key]) => {
        const [pairWorkpieceId, routeId, pairPurposeId] = key.split('|');
        return (
          pairWorkpieceId === workpieceId &&
          pairPurposeId === processPurposeId &&
          routeIds.has(routeId)
        );
      })
      .map(([, gate]) => gate);
    for (const criterion of [
      ...rule.matchCriteria,
      ...pairDirectionGates.flatMap((gate) => gate.matchCriteria ?? []),
    ])
      if (FIELDS[criterion.field]) ids.add(criterion.field);
    for (const input of [
      ...rule.requiredInputs,
      ...rule.handlingInference.requiredSignals,
      ...rule.operationInference.requiredSignals,
      ...rule.requiredProcessStages,
      ...pairDirectionGates.flatMap((gate) => gate.requiredInputs ?? []),
      ...pairDirectionGates.flatMap((gate) => gate.requiredProcessStages ?? []),
    ]) {
      for (const mapped of ENGINEERING_RAW_INPUTS[input] ??
        ROUTE_REQUIRED_INPUT_FIELD_MAP[input] ?? [input])
        if (FIELDS[mapped]) ids.add(mapped);
    }
    for (const predicate of rule.requiredEngineeringPredicates) {
      for (const mapped of ENGINEERING_RAW_INPUTS[predicate] ?? [])
        if (FIELDS[mapped]) ids.add(mapped);
    }
    for (const predicate of pairDirectionGates.flatMap(
      (gate) => gate.requiredEngineeringPredicates ?? [],
    )) {
      for (const mapped of ENGINEERING_RAW_INPUTS[predicate] ?? [])
        if (FIELDS[mapped]) ids.add(mapped);
    }
  }
  return ids;
}

function prioritizedQuestionIds(rules: DirectionRule[], required: Set<string>) {
  const scores = new Map<string, number>();
  const add = (id: string, score: number) => {
    if (required.has(id)) scores.set(id, Math.max(scores.get(id) ?? 0, score));
  };
  const criteriaByField = new Map<string, Set<string>>();
  for (const rule of rules) {
    for (const criterion of rule.matchCriteria) {
      if (!criteriaByField.has(criterion.field)) criteriaByField.set(criterion.field, new Set());
      criteriaByField.get(criterion.field)!.add([...criterion.allowedValues].sort().join('|'));
    }
  }
  for (const [field, variants] of criteriaByField) add(field, 100 + variants.size);
  if (new Set(rules.map((rule) => rule.handlingInference.expectedSupportMethod)).size > 1) {
    for (const rule of rules)
      for (const field of rule.handlingInference.requiredSignals) add(field, 80);
  }
  if (new Set(rules.map((rule) => rule.operationInference.mode)).size > 1) {
    for (const rule of rules)
      for (const field of rule.operationInference.requiredSignals) add(field, 70);
  }
  return [...required].sort((left, right) => (scores.get(right) ?? 0) - (scores.get(left) ?? 0));
}

function buildGroups(required: Set<string>, raw: Record<string, unknown>) {
  const makeGroup = (
    groupId: (typeof GROUP_ORDER)[number],
    label: string,
    fields: FieldDefinition[],
  ) => {
    const answered = fields.filter((field) => isAnswered(raw[field.id])).length;
    return {
      id: groupId,
      label,
      summary:
        answered === 0
          ? '待补充'
          : answered === fields.length
            ? `已完成 ${answered}项`
            : `已完成 ${answered}/${fields.length}`,
      completed: fields.length > 0 && answered === fields.length,
      fields: fields.map((field) => ({
        id: field.id,
        label: field.label,
        type: field.type,
        required: field.required,
        ...(field.unit ? { unit: field.unit } : {}),
        ...(field.placeholder ? { placeholder: field.placeholder } : {}),
        ...(field.options ? { options: field.options } : {}),
      })),
    } satisfies PublicConditionGroup;
  };
  const fieldGroups = new Map(
    GROUP_ORDER.map((groupId) => [
      groupId,
      Object.values(FIELDS).filter((field) => field.groupId === groupId && required.has(field.id)),
    ]),
  );
  const nonEmptyGroupIds = GROUP_ORDER.filter((groupId) => fieldGroups.get(groupId)!.length > 0);
  if (nonEmptyGroupIds.length === 4) {
    const dimensionsAndProcess = [
      ...fieldGroups.get('dimensions')!,
      ...fieldGroups.get('process')!,
    ];
    const all = [
      makeGroup('dimensions', '尺寸、材质与工艺边界', dimensionsAndProcess),
      makeGroup('handling', GROUP_LABELS.handling, fieldGroups.get('handling')!),
      makeGroup('production', GROUP_LABELS.production, fieldGroups.get('production')!),
    ];
    return { all, visible: all };
  }
  const all = nonEmptyGroupIds.map((groupId) =>
    makeGroup(groupId, GROUP_LABELS[groupId], fieldGroups.get(groupId)!),
  );
  return { all, visible: all };
}

function hasSemanticConflict(raw: Record<string, unknown>) {
  if (raw.quenchRequired === false && raw.quench === true) return true;
  if (
    raw.presentationState === 'coiled' &&
    isKnown(raw.partForm) &&
    !['coil', 'strip'].includes(String(raw.partForm))
  )
    return true;
  return false;
}

function hasInvalidZeroMeasurement(raw: Record<string, unknown>) {
  const positiveFields = [
    'maximumThickness',
    'dimensionLength',
    'dimensionWidth',
    'dimensionHeight',
    'dimensionDiameter',
    'singlePieceWeightKg',
    'batchLoadWeightKg',
    'supportSpanMm',
  ];
  return positiveFields.some((field) => typeof raw[field] === 'number' && raw[field] <= 0);
}

function safePublicLabel(
  rule: DirectionRule,
  data: WorkpieceRouterResolveData,
  routeId: string,
  workpieceId: string,
  purposeId: string,
) {
  if (
    rule.publicationEligibility !== 'conditional_public' ||
    rule.internalExecutionStatus !== 'eligible'
  )
    return null;
  const version = data.baselines.publicBaselineVersion;
  if (!version || data.publicSnapshot.publicBaselineVersion !== version) return null;
  const approved = data.baselines.versions.find((item) => item.baselineVersion === version);
  if (
    !approved ||
    approved.publicationStatus !== 'approved' ||
    approved.locked !== true ||
    !approved.approvedBy ||
    !(approved.approvedRole ?? approved.approvedByRole) ||
    !approved.approvedAt ||
    !approved.lockedAt
  )
    return null;
  if (approved.resolverVersion !== data.resolverConfig.resolverVersion) return null;
  if (data.resolverConfig.canonicalHashAlgorithm !== 'sha256-stable-json-v1') return null;
  for (const field of [
    'ruleSetHash',
    'evidenceSnapshotHash',
    'publicLabelMappingHash',
    'publicClaimTemplateHash',
    'rulePriorityHash',
    'approvedScopeHash',
  ] as const) {
    if (approved[field] !== data.resolverConfig.snapshot[field]) return null;
  }
  if (
    approved.approvedScopeHash !==
    computeApprovedScopeHash(approved.approvedRuleIds ?? [], approved.approvedPairKeys ?? [])
  )
    return null;
  const key = pairKey(workpieceId, routeId, purposeId);
  if (!approved.approvedRuleIds?.includes(rule.ruleId) || !approved.approvedPairKeys?.includes(key))
    return null;
  const publicRule = data.publicSnapshot.rules.find(
    (item) =>
      item.ruleId === rule.ruleId &&
      item.allowedPairs.some(
        (pair) => pairKey(pair.workpieceId, pair.routeId, pair.processVariantId) === key,
      ),
  );
  if (
    !publicRule ||
    publicRule.publicationEligibility !== 'conditional_public' ||
    publicRule.internalExecutionStatus !== 'eligible'
  )
    return null;
  const pairEvidence = publicRule.pairEvidence?.[key];
  const validEvidence = (id: string, type: string) => {
    const evidence = data.publicSnapshot.evidence.find((item) => item.evidenceId === id);
    return Boolean(
      evidence &&
      evidence.evidenceType === type &&
      evidence.status === 'current' &&
      evidence.accessLevel !== 'metadata_only' &&
      ['full_text_verified', 'clause_verified'].includes(evidence.verificationStatus),
    );
  };
  if (
    !pairEvidence?.taxonomyRefs?.some((id) => validEvidence(id, 'taxonomy_reference')) ||
    !pairEvidence.applicationMappingRefs?.some((id) => validEvidence(id, 'application_mapping'))
  )
    return null;
  const override = publicRule.publicLabelDerivationKey
    ? data.publicSnapshot.labels.combinationOverrides?.[publicRule.publicLabelDerivationKey]
    : null;
  const architecture = publicRule.equipmentOutput.furnaceArchitecture
    ? data.publicSnapshot.labels.architectureLabels?.[
        publicRule.equipmentOutput.furnaceArchitecture
      ]
    : null;
  return override ?? architecture ?? null;
}

export function listPublicDirectionExamples(
  workpieceId: string,
  data: WorkpieceRouterResolveData,
): WorkpieceDirectionExamplesResponse {
  const workpieceExists = data.catalog.categories.some((category) =>
    category.cards.some((card) => card.id === workpieceId),
  );
  if (!workpieceExists) {
    return {
      workpieceId,
      examples: [],
      customerNote: '未找到对应工件，请提交资料由工程师判断。',
    };
  }

  const examplesByDirection = new Map<string, string[]>();
  for (const rule of data.rules) {
    for (const pair of rule.allowedPairs.filter((item) => item.workpieceId === workpieceId)) {
      const direction = safePublicLabel(
        rule,
        data,
        pair.routeId,
        pair.workpieceId,
        pair.processVariantId,
      );
      if (!direction) continue;
      const route = data.routes.find((item) => item.id === pair.routeId);
      const variant = route?.processVariants.find((item) =>
        variantMatches(item, pair.processVariantId),
      );
      const condition =
        data.publicPairLabels?.[
          pairKey(pair.workpieceId, pair.routeId, pair.processVariantId)
        ]?.trim() ?? variant?.label?.trim();
      if (!condition) continue;
      const conditions = examplesByDirection.get(direction) ?? [];
      if (!conditions.includes(condition)) conditions.push(condition);
      examplesByDirection.set(direction, conditions);
    }
  }

  const examples = [...examplesByDirection.entries()]
    .slice(0, 3)
    .map(([direction, conditions]) => ({
      condition: conditions.join('、'),
      direction,
    }));

  return {
    workpieceId,
    displayWorkpieceName: examples.length ? data.publicWorkpieceLabels?.[workpieceId] : undefined,
    examples,
    customerNote: examples.length
      ? '以上为已批准的行业常见设备方向，最终以图纸和工程确认为准。'
      : '该工件当前没有已公开的具体炉型方向，请提交图纸和工况由工程师判断。',
  };
}

function matchingBasis(raw: Record<string, unknown>) {
  return Object.values(FIELDS)
    .filter((field) => isKnown(raw[field.id]))
    .slice(0, 3)
    .map((field) => `${field.label}已补充`);
}

const PUBLIC_SUPPORT_METHOD_LABELS: Record<string, string> = {
  mobile_hearth: '移动承载',
  fixed_fixture: '固定工装',
  roller: '滚动承载',
  mesh_belt: '网带承载',
  tray_or_basket: '料盘或料筐',
  suspended: '悬挂承载',
  coil_stack: '卷材堆垛',
};

const PUBLIC_ENGINEERING_PREDICATE_LABELS: Record<string, string> = {
  loadEnvelopeCompatible: '装载外形',
  loadCapacityCompatible: '装载重量',
  centerOfGravityCompatible: '重心位置',
  supportSpanCompatible: '支撑跨距',
  supportCompatible: '支撑方式',
  handlingPathCompatible: '上下料路径',
  geometryCompatible: '工件形态',
  straightnessOrDistortionCompatible: '直线度或变形控制',
  quenchTransferCompatible: '淬火转移',
  processChainCompatible: '完整工艺链',
  largeOrHeavy: '大型或重载条件',
};

function publicFieldValue(fieldId: string, raw: Record<string, unknown>) {
  const value = raw[fieldId];
  const field = FIELDS[fieldId];
  const option = field?.options?.find((item) => String(item.value) === String(value));
  if (option) return option.label;
  if (typeof value === 'boolean') return value ? '是' : '否';
  if (typeof value === 'string' && value.trim()) return value.trim();
  if (typeof value === 'number' && Number.isFinite(value)) {
    return `${value}${field?.unit ?? ''}`;
  }
  return null;
}

function qualifyingConditionsFor(
  candidate: { rule: DirectionRule; resolution: ServerDirectionResolution },
  raw: Record<string, unknown>,
) {
  const criteria = candidate.rule.matchCriteria
    .filter((criterion) => criterion.requiredForMatch && isKnown(raw[criterion.field]))
    .map((criterion) => {
      const value = publicFieldValue(criterion.field, raw);
      return value && FIELDS[criterion.field] ? `${FIELDS[criterion.field].label}：${value}` : null;
    })
    .filter((item): item is string => Boolean(item));
  const operation = ['batch', 'continuous'].includes(candidate.resolution.operationDecision.state)
    ? `生产方式：${candidate.resolution.operationDecision.state === 'batch' ? '周期生产' : '连续生产'}`
    : null;
  const supportMethod = candidate.resolution.materialHandling.supportMethod;
  const handling =
    candidate.resolution.materialHandling.state === 'true' && supportMethod
      ? `装炉支撑：${PUBLIC_SUPPORT_METHOD_LABELS[supportMethod] ?? '已确认'}`
      : null;
  const compatible = candidate.rule.requiredEngineeringPredicates
    .filter((predicate) => candidate.resolution.engineeringPredicates[predicate] === 'true')
    .map((predicate) => PUBLIC_ENGINEERING_PREDICATE_LABELS[predicate])
    .filter((label): label is string => Boolean(label));
  const compatibility = compatible.length
    ? `${compatible.slice(0, 2).join('、')}已由服务端核对为兼容`
    : null;

  return [...new Set([...criteria, compatibility, operation, handling].filter(Boolean))].slice(
    0,
    3,
  ) as string[];
}

function publicDirectionFor(
  candidate: { rule: DirectionRule; routeId: string; resolution: ServerDirectionResolution },
  data: WorkpieceRouterResolveData,
  workpieceId: string,
  purposeId: string,
  raw: Record<string, unknown>,
): PublicDirection | null {
  if (candidate.resolution.resolutionStage === 'engineering_review') return null;
  const name = safePublicLabel(candidate.rule, data, candidate.routeId, workpieceId, purposeId);
  if (!name) return null;
  const isMatched = candidate.resolution.resolutionStage === 'matched_direction';
  const stillNeedConfirmIds = isMatched
    ? candidate.resolution.finalSizingInputs
    : candidate.resolution.directionGate.missingInputs;
  const stillNeedConfirm = stillNeedConfirmIds
    .map((id) => FIELDS[id]?.label ?? PUBLIC_ENGINEERING_PREDICATE_LABELS[id])
    .filter((label): label is string => Boolean(label));
  const publicStatement = isMatched
    ? `根据当前填写并经服务端规则校验的工况，可优先评估的行业常见设备方向之一为“${name}”。仍须结合图纸、执行标准、材质牌号、最终装载设计、完整工艺链和产能节拍完成工程确认。本结果不构成最终选型、工艺参数或苏能供货与能力承诺。`
    : `如果尚待确认的方向门禁满足，可条件性评估的行业常见设备方向之一为“${name}”。仍须结合图纸、执行标准、材质牌号、最终装载设计、完整工艺链和产能节拍完成工程确认。本结果不构成最终选型、工艺参数或苏能供货与能力承诺。`;
  return {
    name,
    resolutionStage: candidate.resolution.resolutionStage,
    publicStatement,
    matchingBasis: matchingBasis(raw),
    qualifyingConditions: qualifyingConditionsFor(candidate, raw),
    stillNeedConfirm: [...new Set(stillNeedConfirm)].slice(0, 6),
  };
}

function baseResponse(
  overrides: Partial<WorkpieceRouterPublicResponse>,
): WorkpieceRouterPublicResponse {
  return {
    displayState: 'invalid_input',
    conditionGroups: [],
    completedGroups: 0,
    totalGroups: 0,
    missingInputs: [],
    nextQuestion: null,
    publicDirections: [],
    customerNote: '请核对工件和处理目的后重试。',
    ...overrides,
  };
}

export function resolveWorkpieceRouterRequest(
  dto: ResolveWorkpieceRouterDto,
  data: WorkpieceRouterResolveData,
): WorkpieceRouterPublicResponse {
  const raw = sanitizeRawConditions(dto.rawConditions as Record<string, unknown>);
  const routes = data.routes.filter(
    (route) =>
      route.workpieceIds.includes(dto.workpieceId) &&
      route.processVariants.some((variant) => variantMatches(variant, dto.processPurposeId)),
  );
  if (routes.length === 0) return baseResponse({ displayState: 'invalid_input' });
  if (hasSemanticConflict(raw) || hasInvalidZeroMeasurement(raw)) {
    return baseResponse({
      displayState: 'invalid_input',
      customerNote: '已填工况存在相互矛盾，请核对后重试。',
    });
  }

  if (
    raw.treatmentScope === 'local' ||
    raw.treatmentScope === 'field' ||
    routes.every(isSpecialRoute)
  ) {
    return baseResponse({
      displayState: 'special_process_boundary',
      customerNote: '该工况属于局部或现场专项处理，不按普通整体炉型给出方向。',
    });
  }

  const normalRoutes = routes.filter((route) => !isSpecialRoute(route));
  const routeIds = new Set(normalRoutes.map((route) => route.id));
  const candidateRules = data.rules.filter(
    (rule) =>
      rule.publicationEligibility !== 'blocked' &&
      rule.internalExecutionStatus === 'eligible' &&
      rule.allowedPairs.some(
        (pair) =>
          pair.workpieceId === dto.workpieceId &&
          routeIds.has(pair.routeId) &&
          pair.processVariantId === dto.processPurposeId,
      ),
  );
  const resolutions = candidateRules.flatMap((rule) =>
    rule.allowedPairs
      .filter(
        (pair) =>
          pair.workpieceId === dto.workpieceId &&
          routeIds.has(pair.routeId) &&
          pair.processVariantId === dto.processPurposeId,
      )
      .flatMap((pair) => {
        const result = resolveServerIndustryDirection(
          rule,
          buildEngineeringInput(dto.workpieceId, dto.processPurposeId, pair.routeId, raw),
          capabilityFor(rule, data),
        );
        if (!result) return [];
        return [{ rule, routeId: pair.routeId, resolution: result }];
      }),
  );

  const required = collectRequiredFields(
    candidateRules,
    normalRoutes,
    dto.workpieceId,
    dto.processPurposeId,
  );
  const questionOrder = prioritizedQuestionIds(candidateRules, required);
  const groups = buildGroups(required, raw);
  const missingInputs = [...required].filter((id) => !isKnown(raw[id]));
  const unanswered = [...required].filter((id) => !isAnswered(raw[id]));
  const completedGroups = groups.all.filter((group) => group.completed).length;
  const fieldsById = new Map(
    groups.all.flatMap((group) =>
      group.fields.map((field) => [field.id, { group, field }] as const),
    ),
  );
  const nextField = questionOrder
    .map((id) => fieldsById.get(id))
    .find((item) => item && unanswered.includes(item.field.id));
  const common = {
    conditionGroups: groups.visible,
    completedGroups,
    totalGroups: groups.all.length,
    missingInputs,
    nextQuestion: nextField
      ? {
          groupId: nextField.group.id,
          fieldId: nextField.field.id,
          prompt: `请补充${nextField.field.label}`,
        }
      : null,
  };

  if (unanswered.length > 0) {
    return baseResponse({
      ...common,
      displayState: 'insufficient_conditions',
      customerNote: '还需要补充关键工况，系统将根据新条件重新判断。',
    });
  }

  if (candidateRules.length > 0 && resolutions.length === 0) {
    return baseResponse({
      ...common,
      displayState: 'no_match',
      customerNote: '现有条件暂时无法收敛到明确设备方向，提交工况后由工程师进一步判断。',
    });
  }

  const publicDirections = resolutions
    .map((candidate) =>
      publicDirectionFor(candidate, data, dto.workpieceId, dto.processPurposeId, raw),
    )
    .filter((direction): direction is PublicDirection => Boolean(direction))
    .filter(
      (direction, index, all) => all.findIndex((item) => item.name === direction.name) === index,
    )
    .slice(0, 3);
  if (publicDirections.length === 1)
    return baseResponse({
      ...common,
      displayState: 'single_direction',
      publicDirections,
      customerNote: '当前更可能的行业设备方向已生成，仍需工程确认。',
    });
  if (publicDirections.length > 1)
    return baseResponse({
      ...common,
      displayState: 'multiple_directions',
      publicDirections,
      customerNote: '当前存在多个可能方向，需结合成立条件继续确认。',
    });

  if (resolutions.some((item) => item.resolution.resolutionStage === 'engineering_review')) {
    return baseResponse({
      ...common,
      displayState: 'engineering_review',
      customerNote: '现有条件已进入工程复核，还不能形成设备方向结论。',
    });
  }
  return baseResponse({
    ...common,
    displayState: 'completed_pending_engineering',
    customerNote: '已完成初步条件判断。现有信息已记录，设备方向还需结合完整工况进一步确认。',
  });
}

export type WorkpieceInquiryContextInput = {
  categoryId: string;
  workpieceId?: string | null;
  searchTerm?: string | null;
  processPurposeId?: string | null;
  rawConditions?: object | null;
};

export type ResolvedWorkpieceInquiryContext = {
  sessionId?: string;
  categoryId: string;
  workpieceId?: string;
  searchTerm?: string;
  processPurposeId?: string;
  logicUnitId?: string;
  rawConditionsJson: Record<string, SanitizedRawConditionValue>;
  displayState: WorkpieceRouterDisplayState | 'purpose_unselected' | 'search_no_match';
  missingInputsJson: string[];
  publicDirectionIdsJson: string[];
  ruleVersion: string;
  baselineVersion?: string;
  pagePath?: string;
};

export type StoredWorkpieceSelectionSnapshot = {
  categoryId: string;
  workpieceId?: string | null;
  searchTerm?: string | null;
  processPurposeId?: string | null;
  rawConditionsJson: unknown;
  displayState: string;
  missingInputsJson: unknown;
  publicDirectionIdsJson: unknown;
  ruleVersion: string;
  baselineVersion?: string | null;
  createdAt: Date;
};

export type AdminWorkpieceContextDescription = {
  categoryId: string;
  categoryName: string;
  workpieceId: string | null;
  workpieceName: string | null;
  searchTerm: string | null;
  processPurposeId: string | null;
  processPurposeName: string | null;
  rawConditions: Array<{ label: string; value: string }>;
  missingConditions: string[];
  displayState: string;
  publicDirections: string[];
  ruleVersion: string;
  baselineVersion: string | null;
  createdAt: Date;
};

function publicDirectionId(name: string) {
  return `public-direction:${createHash('sha256').update(name).digest('hex').slice(0, 24)}`;
}

function stringArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string')
    : [];
}

function plainObject(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return value as Record<string, unknown>;
}

function formatCustomerCondition(fieldId: string, value: unknown) {
  const field = FIELDS[fieldId];
  if (!field) return null;
  if (value === 'unknown') return { label: field.label, value: '不清楚/待确认' };
  if (typeof value === 'boolean') return { label: field.label, value: value ? '是' : '否' };
  if (typeof value === 'number' && Number.isFinite(value)) {
    return { label: field.label, value: `${value}${field.unit ?? ''}` };
  }
  if (typeof value === 'string') {
    const option = field.options?.find((item) => item.value === value);
    return { label: field.label, value: option?.label ?? value };
  }
  return null;
}

function inquiryContextIdentity(
  input: WorkpieceInquiryContextInput,
  data: WorkpieceRouterResolveData,
) {
  const category = data.catalog.categories.find((item) => item.id === input.categoryId);
  if (!category) throw new Error('Invalid workpiece category');

  const workpieceId = input.workpieceId?.trim() || undefined;
  const searchTerm = input.searchTerm?.trim() || undefined;
  const processPurposeId = input.processPurposeId?.trim() || undefined;
  const workpiece = workpieceId
    ? data.catalog.categories.flatMap((item) => item.cards).find((item) => item.id === workpieceId)
    : undefined;

  if (workpieceId && (!workpiece || !category.cards.some((item) => item.id === workpieceId))) {
    throw new Error('Workpiece does not belong to the selected category');
  }
  if (!workpieceId && !searchTerm) throw new Error('Workpiece or search term is required');
  if (!workpieceId && processPurposeId) {
    throw new Error('Process purpose requires a known workpiece');
  }

  const routes = workpieceId
    ? data.routes.filter(
        (route) =>
          route.workpieceIds.includes(workpieceId) &&
          (!processPurposeId ||
            route.processVariants.some((variant) => variantMatches(variant, processPurposeId))),
      )
    : [];
  if (workpieceId && processPurposeId && routes.length === 0) {
    throw new Error('Invalid workpiece and process purpose combination');
  }
  const logicUnitIds = [...new Set(routes.map((route) => route.logicUnitId).filter(Boolean))];
  const purpose = processPurposeId
    ? routes
        .flatMap((route) => route.processVariants)
        .find((variant) => variantMatches(variant, processPurposeId))
    : undefined;

  return {
    category,
    workpiece,
    workpieceId,
    searchTerm,
    processPurposeId,
    processPurposeName: purpose?.label ?? null,
    logicUnitId: logicUnitIds.length === 1 ? logicUnitIds[0] : undefined,
  };
}

function resolveInquiryContext(
  input: WorkpieceInquiryContextInput,
  data: WorkpieceRouterResolveData,
  source: { sessionId?: string; pagePath?: string } = {},
): ResolvedWorkpieceInquiryContext {
  const identity = inquiryContextIdentity(input, data);
  const rawConditions = sanitizeRawConditions(
    input.rawConditions ? (input.rawConditions as Record<string, unknown>) : undefined,
  );
  let displayState: ResolvedWorkpieceInquiryContext['displayState'];
  let missingInputs: string[] = [];
  let publicDirectionIds: string[] = [];

  if (!identity.workpieceId) {
    if (Object.keys(rawConditions).length > 0) {
      throw new Error('Raw conditions require a known workpiece');
    }
    displayState = 'search_no_match';
  } else if (!identity.processPurposeId) {
    displayState = 'purpose_unselected';
  } else {
    const response = resolveWorkpieceRouterRequest(
      {
        workpieceId: identity.workpieceId,
        processPurposeId: identity.processPurposeId,
        rawConditions,
      },
      data,
    );
    if (response.displayState === 'invalid_input') {
      throw new Error('Invalid workpiece conditions');
    }
    displayState = response.displayState;
    missingInputs = response.missingInputs;
    publicDirectionIds = response.publicDirections.map((item) => publicDirectionId(item.name));
  }

  return {
    sessionId: source.sessionId,
    categoryId: input.categoryId,
    workpieceId: identity.workpieceId,
    searchTerm: identity.searchTerm,
    processPurposeId: identity.processPurposeId,
    logicUnitId: identity.logicUnitId,
    rawConditionsJson: rawConditions,
    displayState,
    missingInputsJson: missingInputs,
    publicDirectionIdsJson: publicDirectionIds,
    ruleVersion: data.resolverConfig.resolverVersion,
    baselineVersion: data.publicSnapshot.publicBaselineVersion ?? undefined,
    pagePath: source.pagePath,
  };
}

@Injectable()
export class WorkpieceRouterService {
  examples(workpieceId: string) {
    return listPublicDirectionExamples(workpieceId, loadWorkpieceRouterResolveData());
  }

  resolve(dto: ResolveWorkpieceRouterDto) {
    return resolveWorkpieceRouterRequest(dto, loadWorkpieceRouterResolveData());
  }

  resolveInquiryContext(
    input: WorkpieceInquiryContextInput,
    source: { sessionId?: string; pagePath?: string } = {},
  ) {
    return resolveInquiryContext(input, loadWorkpieceRouterResolveData(), source);
  }

  describeStoredSelection(
    selection: StoredWorkpieceSelectionSnapshot,
  ): AdminWorkpieceContextDescription {
    const data = loadWorkpieceRouterResolveData();
    const identity = inquiryContextIdentity(
      {
        categoryId: selection.categoryId,
        workpieceId: selection.workpieceId,
        searchTerm: selection.searchTerm,
        processPurposeId: selection.processPurposeId,
      },
      data,
    );
    const raw = sanitizeRawConditions(plainObject(selection.rawConditionsJson));
    const storedDirectionIds = new Set(stringArray(selection.publicDirectionIdsJson));
    let publicDirections: string[] = [];

    if (identity.workpieceId && identity.processPurposeId && storedDirectionIds.size > 0) {
      const response = resolveWorkpieceRouterRequest(
        {
          workpieceId: identity.workpieceId,
          processPurposeId: identity.processPurposeId,
          rawConditions: raw,
        },
        data,
      );
      publicDirections = response.publicDirections
        .filter((item) => storedDirectionIds.has(publicDirectionId(item.name)))
        .map((item) => item.name);
    }

    return {
      categoryId: selection.categoryId,
      categoryName: identity.category.label,
      workpieceId: identity.workpieceId ?? null,
      workpieceName: identity.workpiece?.name ?? null,
      searchTerm: identity.searchTerm ?? null,
      processPurposeId: identity.processPurposeId ?? null,
      processPurposeName: identity.processPurposeName,
      rawConditions: Object.entries(raw)
        .map(([fieldId, value]) => formatCustomerCondition(fieldId, value))
        .filter((item): item is { label: string; value: string } => Boolean(item)),
      missingConditions: stringArray(selection.missingInputsJson)
        .map((fieldId) => FIELDS[fieldId]?.label)
        .filter((label): label is string => Boolean(label)),
      displayState: selection.displayState,
      publicDirections,
      ruleVersion: selection.ruleVersion,
      baselineVersion: selection.baselineVersion ?? null,
      createdAt: selection.createdAt,
    };
  }
}
