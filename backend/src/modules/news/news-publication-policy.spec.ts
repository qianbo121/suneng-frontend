import { ConflictException } from '@nestjs/common';

import {
  assertNewsPublicationPolicy,
  findNewsPublicationPolicyViolations,
} from '@/modules/news/news-publication-policy';

describe('news publication fact policy', () => {
  it('allows the verified ISO 9001 fact and explicit business boundaries', () => {
    const violations = findNewsPublicationPolicyViolations({
      contentZh:
        '<p>通过 ISO 9001 质量管理体系认证（证书编号 03824Q60289R3S，有效至 2027 年 1 月 11 日）。</p><p>不持有 AMS 2750、Nadcap、CQI-9、军工产品或航空航天特殊工艺认证；未获得 AAA 信用等级；不直接承接 EPC；不直接对外提供按件收费的热处理加工服务；合同金额和未授权结果不公开。</p>',
      contentEn:
        '<p>It does not hold Nadcap or CQI-9 certification, is not an EPC contractor, and does not provide toll heat treatment.</p>',
    });

    expect(violations).toEqual([]);
  });

  it('allows the verified 150+ project count without treating it as an employee count', () => {
    expect(
      findNewsPublicationPolicyViolations({
        contentZh: '累计参与 150+ 工业炉新建与改造项目。',
      }),
    ).toEqual([]);
  });

  it.each([
    '操作员工培训 2 天即可上岗',
    '客户员工 3 人参与现场验收',
    '员工可在 5 分钟内完成装料',
    '非 AAA 信用企业',
    'The company is not an AAA credit enterprise.',
  ])('allows non-company-count or explicitly negated statement %s', (statement) => {
    expect(findNewsPublicationPolicyViolations({ contentZh: statement })).toEqual([]);
  });

  it.each([
    ['ISO 14001', 'unverified_iso_14001'],
    ['ISO 45001', 'unverified_iso_45001'],
    ['通过三体系认证', 'unverified_three_system_certification'],
    ['在职人数 150 人', 'unverified_employee_count'],
    ['拥有 3 项发明专利', 'unverified_invention_patent_classification'],
    ['合同金额 1080 万元', 'unverified_contract_amount'],
    ['热效率 35-40%', 'unverified_heat_efficiency_range'],
    ['通过安全生产标准化认定', 'unverified_work_safety_standardization'],
    ['AAA 信用企业', 'unverified_aaa_credit'],
    ['公司现有员工 150 人', 'unverified_employee_count'],
    ['苏能拥有150+员工', 'unverified_employee_count'],
    ['150 余名员工', 'unverified_employee_count'],
    ['获得合同履约信用AAA等级', 'unverified_aaa_credit'],
    ['AAA 级信用企业', 'unverified_aaa_credit'],
    ['累计承接项目合同额超过2.5亿', 'unverified_contract_amount'],
    ['已通过 AMS 2750 认证', 'unverified_special_process_certification'],
    ['获得 Nadcap 认证', 'unverified_special_process_certification'],
    ['持有 CQI-9 认证', 'unverified_special_process_certification'],
    ['具备军工产品资质', 'unverified_special_process_certification'],
    ['通过航空航天特殊工艺认证', 'unverified_special_process_certification'],
    ['承接 EPC 总承包项目', 'unverified_epc_scope'],
    ['作为工程总承包商提供服务', 'unverified_epc_scope'],
    ['承接来料加工业务', 'unverified_heat_treatment_processing_scope'],
    ['提供按件收费的热处理加工服务', 'unverified_heat_treatment_processing_scope'],
    ['Suneng is Nadcap accredited.', 'unverified_special_process_certification'],
    ['Suneng acts as an EPC contractor.', 'unverified_epc_scope'],
    ['Suneng provides toll heat treatment.', 'unverified_heat_treatment_processing_scope'],
    ['苏能是 AMS 2750 认证企业', 'unverified_special_process_certification'],
    ['本公司为 Nadcap 认证供应商', 'unverified_special_process_certification'],
    ['我司拥有军工产品资质', 'unverified_special_process_certification'],
    ['公司系 EPC 总承包单位', 'unverified_epc_scope'],
    ['热处理加工服务按件收费，欢迎咨询', 'unverified_heat_treatment_processing_scope'],
    ['The company has 150 employees.', 'unverified_employee_count'],
    ['Suneng employs over 150 staff.', 'unverified_employee_count'],
    ['We hold an AAA credit rating.', 'unverified_aaa_credit'],
  ])('blocks unverified claim %s', (claim, code) => {
    expect(findNewsPublicationPolicyViolations({ contentZh: `<p>${claim}</p>` })).toContain(code);
    expect(() => assertNewsPublicationPolicy({ contentZh: claim })).toThrow(ConflictException);
  });
});
