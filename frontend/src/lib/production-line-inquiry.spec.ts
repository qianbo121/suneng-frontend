import { describe, expect, it } from 'vitest';
import { productionLinePages } from './production-line-content';
import { buildProductionLineInquiryPayload } from './production-line-inquiry';

describe('production-line inquiry attribution across all line variants', () => {
  it.each(productionLinePages)('$pageId keeps its own title, labels and page source', (page) => {
    const form = page.sections.inquiry.form;
    const payload = buildProductionLineInquiryPayload(
      { pageId: page.pageId, title: page.sections.overview.title, fields: form.fields },
      {
        workpiece_material: '代表来料',
        target_performance: '目标工艺',
        target_output: '',
        contact_method: ' engineer_wechat ',
      },
      { pagePath: `/zh/products/detail/${page.pageId}`, productTag: page.sections.overview.title },
      'test-page-key',
    );
    expect(payload.contact).toBe('engineer_wechat');
    expect(payload.projectType).toBe(page.sections.overview.title);
    expect(payload.requirement).toContain(`产品页面：${page.pageId}`);
    expect(payload.requirement).toContain(`${form.fields[0].label}：代表来料`);
    expect(payload.requirement).toContain(`${form.fields[1].label}：目标工艺`);
    expect(payload.requirement).toContain('目标产量：未提供');
    expect(payload.pagePath).toBe(`/zh/products/detail/${page.pageId}`);
    expect(payload.identity).toBe('未提供姓名或公司');
  });
});
