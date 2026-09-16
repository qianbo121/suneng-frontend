import {
  buildHomepageRequirementPayload,
  type HomepageRequirementPayload,
} from '@/lib/api/homepage-requirements';
import type { LeadSourceSnapshot } from '@/lib/api/lead-events';

export const ANNEALING_LINE_PRODUCT_NAME = '金属带材连续退火与固溶热处理生产线';

export const ANNEALING_LINE_STEP_ONE_FIELDS = [
  {
    name: 'materialStandardCondition',
    label: '材料牌号与来料状态',
    placeholder: '例如：304，热轧酸洗来料；未知项可填写“待评估”',
    kind: 'input',
    required: true,
  },
  {
    name: 'specCoilRepresentative',
    label: '带宽 × 厚度范围',
    placeholder: '例如：480–750 mm × 1.6–4.0 mm',
    kind: 'input',
    required: true,
  },
  {
    name: 'targetProcessQuality',
    label: '目标工艺 / 产品标准',
    placeholder: '例如：固溶处理，按约定产品标准验收',
    kind: 'input',
    required: true,
  },
  {
    name: 'capacitySpeedOperation',
    label: '目标产能或线速度',
    placeholder: '例如：目标线速度、小时产能或年有效运行时间',
    kind: 'input',
    required: true,
  },
  {
    name: 'coolingSurfaceAtmosphere',
    label: '冷却、表面与气氛要求',
    placeholder: '例如：快速冷却、允许水接触、保护气氛或表面目标',
    kind: 'textarea',
    required: false,
  },
  {
    name: 'companyName',
    label: '公司名称',
    placeholder: '请填写公司或项目单位名称',
    kind: 'input',
    required: true,
  },
  {
    name: 'contactName',
    label: '联系人',
    placeholder: '姓名或称呼',
    kind: 'input',
    required: true,
  },
  {
    name: 'contactMethod',
    label: '电话 / 微信',
    placeholder: '与邮箱至少填写一项',
    kind: 'input',
    required: false,
  },
  {
    name: 'contactEmail',
    label: '邮箱',
    placeholder: '与电话 / 微信至少填写一项',
    kind: 'input',
    required: false,
  },
] as const;

export type AnnealingLineStepOneField = (typeof ANNEALING_LINE_STEP_ONE_FIELDS)[number]['name'];

export const ANNEALING_LINE_STEP_TWO_FIELDS = [
  {
    name: 'projectLocation',
    label: '项目地点 / 交付国家',
    placeholder: '例如：江苏泰州 / 越南',
    kind: 'input',
    required: false,
  },
  {
    name: 'siteConditionsAdditional',
    label: '现场条件与补充说明',
    placeholder: '请补充能源、公辅、上下游接口、卷重、实施时间或期望供货范围',
    kind: 'textarea',
    required: false,
  },
] as const;

export type AnnealingLineStepTwoField = (typeof ANNEALING_LINE_STEP_TWO_FIELDS)[number]['name'];

export type AnnealingLineInquiryField = AnnealingLineStepOneField | AnnealingLineStepTwoField;

export type AnnealingLineInquiryValues = Record<AnnealingLineInquiryField, string>;

export type AnnealingLineInquiryErrors = Partial<Record<AnnealingLineInquiryField, string>>;

export const ANNEALING_LINE_FAQS = [
  {
    question: '哪些金属带材适合采用连续式退火或固溶？',
    answer:
      '规格与节拍相对稳定、能够连续输送，并且材料牌号、目标性能和前后道接口可以明确的卷带类材料更适合进入连续线评估。多规格或现场条件复杂时，需要结合换产和接口进一步核算。',
  },
  {
    question: '连续退火与连续固溶有什么区别？',
    answer:
      '连续退火可用于恢复、再结晶、软化或去应力；连续固溶更关注目标固溶温度、有效保温、敏感温区通过速度和快速冷却。两者不能只按设备最高温度或表面效果混同。',
  },
  {
    question: '生产线速度如何确定，能否直接按最高速度选型？',
    answer:
      '不能。线速度需要同时满足代表规格的加热、有效保温、冷却、张力控制和上下游节拍；机械最高速度不等于工艺可用速度，也不能直接换算为年合格产能。',
  },
  {
    question: '什么时候需要保护气氛或光亮处理路线？',
    answer:
      '当产品对氧化、色差或表面状态有更高要求时，可以评估保护气氛路线。是否能够达到光亮结果仍取决于材料、来料清洁度、气氛组成、露点或氧含量、密封与冷却制度。',
  },
  {
    question: '整线通常包含哪些设备，苏能供货到哪里？',
    answer:
      '整线可能涉及收放卷、焊接、活套、加热炉段、冷却、清洗、控制和公辅接口，但苏能供货范围需要逐项目冻结。“生产线”名称不代表默认承担酸洗、废水、公辅、土建或整线总包。',
  },
  {
    question: '年产能、温度均匀性和产品结果如何验收？',
    answer:
      '年产能需绑定代表材料、规格、工艺与有效运行时间；温度指标需写明测试温度、工况、测点和方法；产品结果则按约定试料、产品标准、取样与责任边界验证。',
  },
] as const;

const FIELD_VALUE_MAX_LENGTH = 500;
const CONTACT_NAME_MAX_LENGTH = 120;
const CONTACT_MAX_LENGTH = 254;

const clean = (value: string) => value.trim();

export function emptyAnnealingLineInquiryValues(): AnnealingLineInquiryValues {
  return Object.fromEntries(
    [...ANNEALING_LINE_STEP_ONE_FIELDS, ...ANNEALING_LINE_STEP_TWO_FIELDS].map(({ name }) => [
      name,
      '',
    ]),
  ) as AnnealingLineInquiryValues;
}

export function validateAnnealingLineInquiry(
  values: AnnealingLineInquiryValues,
): AnnealingLineInquiryErrors {
  const errors: AnnealingLineInquiryErrors = {};

  for (const field of [...ANNEALING_LINE_STEP_ONE_FIELDS, ...ANNEALING_LINE_STEP_TWO_FIELDS]) {
    const value = clean(values[field.name]);
    if (field.required && !value) {
      errors[field.name] = `请填写${field.label}`;
      continue;
    }
    const maxLength =
      field.name === 'contactMethod' || field.name === 'contactEmail'
        ? CONTACT_MAX_LENGTH
        : field.name === 'contactName'
          ? CONTACT_NAME_MAX_LENGTH
          : FIELD_VALUE_MAX_LENGTH;
    if (value.length > maxLength) {
      errors[field.name] = `请将内容精简至 ${maxLength} 个字符以内`;
    }
  }

  const contact = clean(values.contactMethod);
  const email = clean(values.contactEmail);
  if (!contact && !email) {
    errors.contactMethod = '请填写电话 / 微信或邮箱，至少一项';
    errors.contactEmail = '请填写电话 / 微信或邮箱，至少一项';
  }
  if (contact && !/^[\p{L}\p{N}+][\p{L}\p{N}\s@()+\-._/#*]{2,253}$/u.test(contact)) {
    errors.contactMethod = '请填写有效的电话或微信号';
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.contactEmail = '请填写有效的邮箱地址';
  }

  return errors;
}

export const validateAnnealingLineStepOne = validateAnnealingLineInquiry;

export function composeAnnealingLineRequirement(values: AnnealingLineInquiryValues) {
  const lines = [
    '提交目标：连续式适用性初判、典型工艺段组合方向、待补充参数与接口清单（非最终技术方案或正式报价）',
    ...[...ANNEALING_LINE_STEP_ONE_FIELDS, ...ANNEALING_LINE_STEP_TWO_FIELDS].map(
      ({ name, label }) => `${label}：${clean(values[name]) || '未提供 / 待评估'}`,
    ),
    '资料附件：本表单不提供公开上传入口，需要时由工程师后续联系收取。',
  ];
  return lines.join('\n');
}

export function buildAnnealingLineInquiryPayload(
  values: AnnealingLineInquiryValues,
  source: LeadSourceSnapshot,
  idempotencyKey: string,
): HomepageRequirementPayload {
  const contact = clean(values.contactMethod) || clean(values.contactEmail);
  const payload = buildHomepageRequirementPayload(
    {
      direction: ANNEALING_LINE_PRODUCT_NAME,
      problem: composeAnnealingLineRequirement(values),
      identity: `${clean(values.companyName)}｜${clean(values.contactName)}`,
      contact,
    },
    source,
    idempotencyKey,
  );
  const projectLocation = clean(values.projectLocation);
  return projectLocation ? { ...payload, projectLocation } : payload;
}
