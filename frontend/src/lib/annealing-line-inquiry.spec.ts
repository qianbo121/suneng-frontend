import { describe, expect, it } from 'vitest';

import {
  ANNEALING_LINE_FAQS,
  ANNEALING_LINE_PRODUCT_NAME,
  ANNEALING_LINE_STEP_ONE_FIELDS,
  ANNEALING_LINE_STEP_TWO_FIELDS,
  buildAnnealingLineInquiryPayload,
  composeAnnealingLineRequirement,
  emptyAnnealingLineInquiryValues,
  validateAnnealingLineInquiry,
} from '@/lib/annealing-line-inquiry';

function completeValues() {
  const values = emptyAnnealingLineInquiryValues();
  values.materialStandardCondition = '304 / 热轧酸洗来料';
  values.specCoilRepresentative = '1.6–4.0 mm × 480–750 mm';
  values.targetProcessQuality = '固溶处理，产品标准待确认';
  values.capacitySpeedOperation = '代表线速待评估，三班制';
  values.companyName = '示例项目单位';
  values.contactName = '王工';
  values.contactMethod = 'wechat_name-2026';
  return values;
}

describe('annealing line inquiry', () => {
  it('展示 7 类项目信息并保留项目地点和补充说明', () => {
    expect(ANNEALING_LINE_STEP_ONE_FIELDS.map((field) => field.label)).toEqual([
      '材料牌号与来料状态',
      '带宽 × 厚度范围',
      '目标工艺 / 产品标准',
      '目标产能或线速度',
      '冷却、表面与气氛要求',
      '公司名称',
      '联系人',
      '电话 / 微信',
      '邮箱',
    ]);
    expect(ANNEALING_LINE_STEP_TWO_FIELDS.map((field) => field.label)).toEqual([
      '项目地点 / 交付国家',
      '现场条件与补充说明',
    ]);
  });

  it('校验基础工况、公司和联系人', () => {
    expect(validateAnnealingLineInquiry(completeValues())).toEqual({});
    for (const name of [
      'materialStandardCondition',
      'specCoilRepresentative',
      'targetProcessQuality',
      'capacitySpeedOperation',
      'companyName',
      'contactName',
    ] as const) {
      const values = completeValues();
      values[name] = '';
      expect(validateAnnealingLineInquiry(values)[name]).toContain('请填写');
    }
  });

  it('电话或微信与邮箱至少填写一项', () => {
    const emailOnly = completeValues();
    emailOnly.contactMethod = '';
    emailOnly.contactEmail = 'buyer@example.com';
    expect(validateAnnealingLineInquiry(emailOnly)).toEqual({});

    const none = completeValues();
    none.contactMethod = '';
    none.contactEmail = '';
    expect(validateAnnealingLineInquiry(none).contactMethod).toContain('至少一项');

    const invalidEmail = completeValues();
    invalidEmail.contactMethod = '';
    invalidEmail.contactEmail = 'invalid-email';
    expect(validateAnnealingLineInquiry(invalidEmail).contactEmail).toBe('请填写有效的邮箱地址');
  });

  it('结构化写入项目需求且不虚构工程结果', () => {
    const values = completeValues();
    values.coolingSurfaceAtmosphere = '快速冷却，表面要求待确认';
    values.projectLocation = '江苏泰州';
    values.siteConditionsAdditional = '公辅和整线接口待确认';
    const requirement = composeAnnealingLineRequirement(values);
    expect(requirement).toContain('冷却、表面与气氛要求：快速冷却');
    expect(requirement).toContain('项目地点 / 交付国家：江苏泰州');
    expect(requirement).toContain('现场条件与补充说明：公辅和整线接口待确认');
    expect(requirement).toContain('非最终技术方案或正式报价');
    expect(requirement).not.toContain('最终炉长');
  });

  it('沿用真实提交契约、来源和幂等标识', () => {
    const values = completeValues();
    values.projectLocation = '江苏泰州 / 越南';
    const payload = buildAnnealingLineInquiryPayload(
      values,
      {
        pagePath: '/zh/products/detail/annealing-solution-line',
        pageType: '产品页',
        productTag: ANNEALING_LINE_PRODUCT_NAME,
      },
      '8dd53c3c-701d-4c3c-baf8-f7224aef8fae',
    );
    expect(payload).toMatchObject({
      formVariant: 'homepage_minimal',
      idempotencyKey: '8dd53c3c-701d-4c3c-baf8-f7224aef8fae',
      projectType: ANNEALING_LINE_PRODUCT_NAME,
      identity: '示例项目单位｜王工',
      contact: 'wechat_name-2026',
      projectLocation: '江苏泰州 / 越南',
      locale: 'zh',
      pageType: '产品页',
    });
  });

  it('FAQ 使用批准问题且顺序一致', () => {
    expect(ANNEALING_LINE_FAQS.map((item) => item.question)).toEqual([
      '哪些金属带材适合采用连续式退火或固溶？',
      '连续退火与连续固溶有什么区别？',
      '生产线速度如何确定，能否直接按最高速度选型？',
      '什么时候需要保护气氛或光亮处理路线？',
      '整线通常包含哪些设备，苏能供货到哪里？',
      '年产能、温度均匀性和产品结果如何验收？',
    ]);
  });
});
