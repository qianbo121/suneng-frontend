import { describe, expect, it } from 'vitest';

import { siteSettings } from '@/mock/siteSettings';

describe('public contact settings', () => {
  it('keeps the WhatsApp toolbar entry aligned with the sales number', () => {
    const whatsapp = siteSettings.toolbarItems.find((item) => item.key === 'whatsapp');

    expect(whatsapp).toMatchObject({
      value: '+86 130 5298 6814',
      href: 'https://wa.me/8613052986814',
    });
    expect(siteSettings.salesPhone.replace(/\D/g, '')).toBe('8613052986814');
  });
});
