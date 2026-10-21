import { describe, expect, it } from 'vitest';

import { getNewsContentModifiedTime } from '@/lib/news-dates';

describe('news lastmod governance', () => {
  it('uses the dedicated editorial date and ignores generic row updates', () => {
    expect(
      getNewsContentModifiedTime({
        publishDate: '2026-06-01T00:00:00.000Z',
        contentUpdatedAt: '2026-10-20T00:00:00.000Z',
      }),
    ).toBe('2026-10-20T00:00:00.000Z');
  });

  it('falls back to publishDate for new articles without a later editorial update', () => {
    expect(
      getNewsContentModifiedTime({
        publishDate: '2026-10-20T00:00:00.000Z',
        contentUpdatedAt: null,
      }),
    ).toBe('2026-10-20T00:00:00.000Z');
  });
});
