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
