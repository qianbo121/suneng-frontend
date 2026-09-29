import { afterEach, describe, expect, it, vi } from 'vitest';

import { getBrowserStorage } from './browser-storage';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('browser storage access', () => {
  it.each(['sessionStorage', 'localStorage'] as const)(
    'returns the original %s when access is allowed',
    (name) => {
      const storage = { getItem: vi.fn() };
      vi.stubGlobal('window', { [name]: storage });
      expect(getBrowserStorage(name)).toBe(storage);
    },
  );

  it.each(['sessionStorage', 'localStorage'] as const)(
    'returns undefined when the %s property getter throws',
    (name) => {
      vi.stubGlobal('window', Object.defineProperty({}, name, {
        get() {
          throw new DOMException('Storage access denied', 'SecurityError');
        },
      }));
      expect(getBrowserStorage(name)).toBeUndefined();
    },
  );

  it('is safe outside the browser', () => {
    vi.stubGlobal('window', undefined);
    expect(getBrowserStorage('sessionStorage')).toBeUndefined();
  });
});
