import { describe, expect, it } from 'vitest';

import { getLocalizedNavigation } from '@/mock/navigation';

describe('localized primary navigation', () => {
  it('does not expose the untranslated resources route in English', () => {
    expect(getLocalizedNavigation('en').map((item) => item.key)).not.toContain('resources');
    expect(getLocalizedNavigation('zh').map((item) => item.key)).toContain('resources');
  });
});
