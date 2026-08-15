import { validate } from 'class-validator';

import { CreateLegacyCustomRequirementDto } from '@/modules/custom-requirement/dto/create-legacy-custom-requirement.dto';

describe('CreateLegacyCustomRequirementDto', () => {
  it('keeps the V1 minimum payload compatible with already-opened pages', async () => {
    const dto = Object.assign(new CreateLegacyCustomRequirementDto(), {
      phone: '13000000000',
    });

    await expect(validate(dto)).resolves.toHaveLength(0);
  });

  it('still requires the legacy phone field', async () => {
    const dto = new CreateLegacyCustomRequirementDto();

    expect((await validate(dto)).some((error) => error.property === 'phone')).toBe(true);
  });
});
