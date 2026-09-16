import { describe, expect, it } from 'vitest';
import { buildFastenerInquiryPayload, hasConfirmedSubmission } from './fastener-line-inquiry';

describe('fastener inquiry and the existing minimal-form contract', () => {
  it.each(['workshop_wechat_01', 'engineer@example.com', '+86 130 0000 0000'])(
    'allows contact-only inquiries: %s',
    (contact) => {
      const payload = buildFastenerInquiryPayload(
        {
          workpiece_material: '',
          target_performance: '',
          target_output: '',
          contact_method: contact,
        },
        {
          pagePath: '/zh/products/detail/fastener-quench-temper-line',
          productTag: '紧固件调质生产线',
        },
        'test-key',
      );
      expect(payload).toMatchObject({
        formVariant: 'homepage_minimal',
        contact,
        idempotencyKey: 'test-key',
        projectType: '紧固件调质生产线',
        locale: 'zh',
      });
      expect(payload.identity).toBe('未提供姓名或公司');
      expect(payload.requirement).toContain('工件与材料：未提供');
      expect(payload.pagePath).toBe('/zh/products/detail/fastener-quench-temper-line');
    },
  );

  it('keeps each supplied engineering condition and source attribution', () => {
    const payload = buildFastenerInquiryPayload(
      {
        workpiece_material: ' 螺栓，材料待确认 ',
        target_performance: '按约定产品要求',
        target_output: '两班，目标产量待核算',
        contact_method: ' wx_contact ',
      },
      { sourceType: '直接访问', pageType: '产品页' },
      'stable-key',
    );
    expect(payload.requirement).toContain('工件与材料：螺栓，材料待确认');
    expect(payload.requirement).toContain('目标性能：按约定产品要求');
    expect(payload.requirement).toContain('目标产量：两班，目标产量待核算');
    expect(payload.contact).toBe('wx_contact');
    expect(payload.sourceType).toBe('直接访问');
  });

  it.each([
    undefined,
    null,
    {},
    { success: true },
    { submissionId: '' },
    { submissionId: 0 },
    { submissionId: {} },
  ])('does not claim success for an unconfirmed response: %j', (result) => {
    expect(hasConfirmedSubmission(result)).toBe(false);
  });
  it('recognizes actual submission identifiers', () => {
    expect(hasConfirmedSubmission({ submissionId: 'REQ-123' })).toBe(true);
    expect(hasConfirmedSubmission({ submissionId: 123 })).toBe(true);
  });
});
