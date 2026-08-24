import { describe, expect, it } from 'vitest';

import {
  buildHomepageRequirementPayload,
  type HomepageRequirementValues,
  validateHomepageRequirement,
} from '@/lib/api/homepage-requirements';

const completeValues = (overrides: Partial<HomepageRequirementValues> = {}) => ({
  direction: '现有设备改造或维修',
  problem: '现有炉温度不均，想先判断改造还是换新',
  identity: '示例制造公司 / 王工',
  contact: 'wechat_name-2026',
  ...overrides,
});

describe('homepage four-field requirement', () => {
  it.each(['direction', 'problem', 'identity', 'contact'] as const)(
    'requires the visible %s field',
    (field) => {
      expect(validateHomepageRequirement(completeValues({ [field]: '   ' }))).toBe(field);
    },
  );

  it('accepts phone, WeChat or email without requiring hidden fields', () => {
    for (const contact of ['13800138000', 'wechat_name-2026', 'buyer@example.com']) {
      expect(validateHomepageRequirement(completeValues({ contact }))).toBeNull();
    }
  });

  it('builds only the approved four business fields plus the source evidence', () => {
    const payload = buildHomepageRequirementPayload(
      completeValues(),
      {
        pagePath: '/zh?utm_source=baidu',
        pageTitle: '苏能工业炉',
        pageType: '首页',
        deviceType: 'PC',
      },
      '8dd53c3c-701d-4c3c-baf8-f7224aef8fae',
    );

    expect(payload).toMatchObject({
      formVariant: 'homepage_minimal',
      projectType: '现有设备改造或维修',
      requirement: '现有炉温度不均，想先判断改造还是换新',
      identity: '示例制造公司 / 王工',
      contact: 'wechat_name-2026',
      locale: 'zh',
      pagePath: '/zh?utm_source=baidu',
    });
    expect(payload).not.toHaveProperty('projectLocation');
    expect(payload).not.toHaveProperty('company');
    expect(payload).not.toHaveProperty('furnaceType');
  });
});
