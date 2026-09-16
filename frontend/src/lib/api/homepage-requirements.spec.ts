import { describe, expect, it } from 'vitest';

import {
  buildHomepageRequirementPayload,
  buildHomepageWorkpieceContext,
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

  it('passes the assisted-judgment direction through the existing project type field', () => {
    const direction = '还不确定，需要协助判断';
    const values = completeValues({ direction });

    expect(validateHomepageRequirement(values)).toBeNull();
    expect(
      buildHomepageRequirementPayload(
        values,
        { pagePath: '/zh', pageType: '首页' },
        '8dd53c3c-701d-4c3c-baf8-f7224aef8fae',
      ).projectType,
    ).toBe(direction);
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

  it('adds one structured workpiece context without changing the four visible fields', () => {
    const payload = buildHomepageRequirementPayload(
      completeValues(),
      { pagePath: '/zh', pageType: '首页' },
      '8dd53c3c-701d-4c3c-baf8-f7224aef8fae',
      {
        categoryId: 'welded-structures',
        workpieceId: 'large-welded-machine-frame',
        searchTerm: null,
        processPurposeId: 'stress-relief',
        rawConditions: { batchLoadWeightKg: 8000 },
      },
    );

    expect(payload.workpieceContext).toMatchObject({
      workpieceId: 'large-welded-machine-frame',
      rawConditions: { batchLoadWeightKg: 8000 },
    });
    expect(payload.workpieceContext).not.toHaveProperty('routeId');
    expect(payload.workpieceContext).not.toHaveProperty('displayState');
    expect(payload.projectType).toBe(completeValues().direction);
    expect(payload.requirement).toBe(completeValues().problem);
  });

  it('submits only raw customer conditions from the active router draft', () => {
    const context = buildHomepageWorkpieceContext({
      categoryId: 'welded-structures',
      workpieceId: 'large-welded-machine-frame',
      searchTerm: null,
      processPurposeId: 'stress-relief',
      rawConditions: {
        dimensionLength: 4200,
        batchLoadWeightKg: 8000,
        loadCapacityCompatible: true,
        furnaceName: '客户端伪造炉型',
      },
      displayState: 'completed_pending_engineering',
      completedGroups: 3,
      totalGroups: 3,
      capturedAt: '2026-08-27T00:00:00.000Z',
    });

    expect(context).toEqual({
      categoryId: 'welded-structures',
      workpieceId: 'large-welded-machine-frame',
      searchTerm: null,
      processPurposeId: 'stress-relief',
      rawConditions: { dimensionLength: 4200, batchLoadWeightKg: 8000 },
    });
    expect(context).not.toHaveProperty('displayState');
    expect(context).not.toHaveProperty('completedGroups');
  });
});

// English home keeps the same submission contract while preserving its language.
describe('English homepage inquiry', () => {
  it('retains English language, international contact and selected workpiece', () => {
    const values = completeValues({ problem: 'Anneal copper wire', identity: 'Example / Alex', contact: '+44 20 7946 0958' });
    expect(validateHomepageRequirement(values)).toBeNull();
    const payload = buildHomepageRequirementPayload(values, { pagePath: '/en' }, 'english-inquiry-key', {
      categoryId: 'pipe-bar-wire', workpieceId: 'steel-wire-coil', searchTerm: null,
      processPurposeId: null, rawConditions: {},
    }, 'en');
    expect(payload).toMatchObject({ locale: 'en', pagePath: '/en', contact: '+44 20 7946 0958', workpieceContext: { workpieceId: 'steel-wire-coil' } });
  });
});
