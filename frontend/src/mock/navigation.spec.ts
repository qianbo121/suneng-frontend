import { describe, expect, it } from 'vitest';

import { getLocalizedNavigation } from '@/mock/navigation';

describe('localized primary navigation', () => {
  it('uses the approved six-system Chinese navigation plus one action', () => {
    expect(getLocalizedNavigation('zh').map((item) => item.key)).toEqual([
      'products',
      'selection',
      'engineering',
      'cases',
      'resources',
      'about',
      'contact',
    ]);
    expect(getLocalizedNavigation('zh').find((item) => item.key === 'contact')).toMatchObject({
      href: '/#homepage-lead-form',
      labelText: '提交工况',
    });
  });

  it('keeps the existing English navigation without Chinese-only resources', () => {
    expect(getLocalizedNavigation('en').map((item) => item.key)).not.toContain('resources');
    expect(getLocalizedNavigation('zh').map((item) => item.key)).toContain('resources');
  });
});
