import { describe, expect, it } from 'vitest';

import { ENGLISH_STATIC_PAGE_METADATA } from '@/lib/seo/static-page-metadata-en';

describe('English static page metadata', () => {
  it('keeps every title and description within search-result limits', () => {
    for (const metadata of Object.values(ENGLISH_STATIC_PAGE_METADATA)) {
      expect(metadata.title.length).toBeLessThanOrEqual(60);
      expect(metadata.description.length).toBeLessThanOrEqual(160);
    }
  });
});
