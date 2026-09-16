import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { CreateCustomRequirementDto } from '@/modules/custom-requirement/dto/create-custom-requirement.dto';

function dto(overrides: Partial<CreateCustomRequirementDto> = {}) {
  return Object.assign(new CreateCustomRequirementDto(), {
    projectType: '台车式热处理炉',
    projectLocation: '江苏常州',
    name: '张经理',
    company: '苏能客户公司',
    requirement: '处理大型焊接件',
    locale: 'zh' as const,
    phone: '13000000000',
    ...overrides,
  });
}

describe('CreateCustomRequirementDto', () => {
  it('accepts either a phone or an email', async () => {
    await expect(validate(dto())).resolves.toHaveLength(0);
    await expect(
      validate(dto({ phone: undefined, email: 'sales@example.com' })),
    ).resolves.toHaveLength(0);
  });

  it('rejects a submission without both contact methods', async () => {
    const errors = await validate(dto({ phone: undefined, email: undefined }));

    expect(errors.map((error) => error.property)).toEqual(
      expect.arrayContaining(['phone', 'email']),
    );
  });

  it('requires email for an English inquiry even when phone is present', async () => {
    const errors = await validate(dto({ locale: 'en', email: undefined }));

    expect(errors.some((error) => error.property === 'email')).toBe(true);
  });

  it.each(['+86 (0519) 8888-6666', 'wechat_name-2026'])(
    'accepts practical international phone or WeChat contact text: %s',
    async (phone) => {
      await expect(validate(dto({ phone }))).resolves.toHaveLength(0);
    },
  );

  it('rejects unsafe phone or WeChat punctuation without imposing a country format', async () => {
    const errors = await validate(dto({ phone: '<script>' }));

    expect(errors.some((error) => error.property === 'phone')).toBe(true);
  });

  it('validates a supplied reusable idempotency key', async () => {
    await expect(
      validate(dto({ idempotencyKey: 'd44c8f4f-4e88-4a8c-b109-c7c75ac676b2' })),
    ).resolves.toHaveLength(0);
    const errors = await validate(dto({ idempotencyKey: 'short' }));
    expect(errors.some((error) => error.property === 'idempotencyKey')).toBe(true);
  });

  it.each(['projectType', 'projectLocation', 'name', 'company', 'requirement'] as const)(
    'rejects a blank required %s',
    async (field) => {
      const errors = await validate(dto({ [field]: '   ' }));

      expect(errors.some((error) => error.property === field)).toBe(true);
    },
  );

  it('accepts the approved four-field homepage payload without hidden required fields', async () => {
    const minimal = plainToInstance(CreateCustomRequirementDto, {
      formVariant: 'homepage_minimal',
      projectType: '现有设备改造或维修',
      requirement: '现有炉温度不均，想先判断改造还是换新',
      identity: '示例制造公司 / 王工',
      contact: 'wechat_name-2026',
      locale: 'zh',
    });

    await expect(validate(minimal)).resolves.toHaveLength(0);
    expect(minimal.projectLocation).toBeUndefined();
    expect(minimal.company).toBeUndefined();
  });

  it('requires all four visible homepage fields and accepts email as the single contact', async () => {
    const minimal = (overrides: Record<string, unknown> = {}) =>
      plainToInstance(CreateCustomRequirementDto, {
        formVariant: 'homepage_minimal',
        projectType: '单体工业炉新建',
        requirement: '需要先确认设备方向',
        identity: '王工',
        contact: 'buyer@example.com',
        locale: 'zh',
        ...overrides,
      });

    await expect(validate(minimal())).resolves.toHaveLength(0);
    for (const field of ['projectType', 'requirement', 'identity', 'contact'] as const) {
      const errors = await validate(minimal({ [field]: '   ' }));
      expect(errors.some((error) => error.property === field)).toBe(true);
    }
  });

  it('accepts and validates an optional project location for a minimal inquiry', async () => {
    const minimal = (projectLocation: unknown) =>
      plainToInstance(CreateCustomRequirementDto, {
        formVariant: 'homepage_minimal',
        projectType: '金属带材连续退火 / 固溶生产线',
        requirement: '需要先做选型初判',
        identity: '王工',
        contact: 'wechat_name-2026',
        projectLocation,
        locale: 'zh',
      });

    await expect(validate(minimal('江苏泰州 / 越南'))).resolves.toHaveLength(0);
    expect(
      (await validate(minimal('甲'.repeat(181)))).some(
        (error) => error.property === 'projectLocation',
      ),
    ).toBe(true);
  });

  it('accepts one optional structured workpiece context', async () => {
    const minimal = plainToInstance(CreateCustomRequirementDto, {
      formVariant: 'homepage_minimal',
      projectType: '单体工业炉新建',
      requirement: '需要先确认设备方向',
      identity: '王工',
      contact: 'buyer@example.com',
      locale: 'zh',
      workpieceContext: {
        categoryId: 'welded-structures',
        workpieceId: 'large-welded-machine-frame',
        processPurposeId: 'stress-relief',
        rawConditions: {
          dimensionLength: 4200,
          dimensionUnit: 'mm',
          batchLoadWeightKg: 8000,
        },
      },
    });

    await expect(validate(minimal, { whitelist: true })).resolves.toHaveLength(0);
  });

  it('rejects invalid raw condition enums, units, ranges, non-finite numbers and markup', async () => {
    for (const rawConditions of [
      { loadingOrientation: 'roller_supported' },
      { dimensionUnit: 'inch' },
      { batchLoadWeightKg: -1 },
      { dimensionLength: Number.NaN },
      { dimensionWidth: Number.POSITIVE_INFINITY },
      { materialGrade: '<script>alert(1)</script>' },
    ]) {
      const minimal = plainToInstance(CreateCustomRequirementDto, {
        formVariant: 'homepage_minimal',
        projectType: '单体工业炉新建',
        requirement: '需要先确认设备方向',
        identity: '王工',
        contact: 'buyer@example.com',
        locale: 'zh',
        workpieceContext: {
          categoryId: 'welded-structures',
          workpieceId: 'large-welded-machine-frame',
          processPurposeId: 'stress-relief',
          rawConditions,
        },
      });

      expect(await validate(minimal, { whitelist: true })).not.toHaveLength(0);
    }
  });

  it('strips arbitrary JSON, forged furnace output and contact fields before persistence', async () => {
    const minimal = plainToInstance(CreateCustomRequirementDto, {
      formVariant: 'homepage_minimal',
      projectType: '单体工业炉新建',
      requirement: '需要先确认设备方向',
      identity: '王工',
      contact: 'buyer@example.com',
      locale: 'zh',
      workpieceContext: {
        categoryId: 'welded-structures',
        workpieceId: 'large-welded-machine-frame',
        processPurposeId: 'stress-relief',
        ruleId: 'forged-rule',
        furnaceName: '伪造炉型',
        rawConditions: {
          dimensionLength: 4200,
          loadEnvelopeCompatible: true,
          serverEngineeringPredicates: { loadCapacityCompatible: true },
          phone: '13000000000',
          email: 'buyer@example.com',
          arbitraryObject: { keep: false },
        },
      },
    });

    await expect(validate(minimal, { whitelist: true })).resolves.toHaveLength(0);
    expect(minimal.workpieceContext).not.toHaveProperty('ruleId');
    expect(minimal.workpieceContext).not.toHaveProperty('furnaceName');
    expect(minimal.workpieceContext?.rawConditions).toEqual({ dimensionLength: 4200 });
  });

  it('trims overlong optional source fields before validation instead of rejecting the inquiry', async () => {
    const transformed = plainToInstance(CreateCustomRequirementDto, {
      ...dto(),
      pagePath: `  ${'p'.repeat(600)}  `,
      utmCampaign: 'u'.repeat(400),
      sessionId: `legacy-storage-${'s'.repeat(300)}`,
      visitorId: `legacy-visitor-${'v'.repeat(300)}`,
      sourceDetail: { staleStorageShape: true },
    });

    await expect(validate(transformed)).resolves.toHaveLength(0);
    expect(transformed.pagePath).toHaveLength(500);
    expect(transformed.utmCampaign).toHaveLength(255);
    expect(transformed.sessionId).toHaveLength(120);
    expect(transformed.visitorId).toHaveLength(120);
    expect(transformed.sourceDetail).toBeUndefined();
  });
});
