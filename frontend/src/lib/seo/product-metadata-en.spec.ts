import { describe, expect, it } from 'vitest';

import { ENGLISH_PRODUCT_METADATA } from '@/lib/seo/product-metadata-en';

describe('English product metadata', () => {
  it('keeps every product title and description within search-result working limits', () => {
    expect(Object.keys(ENGLISH_PRODUCT_METADATA)).toHaveLength(11);

    for (const [slug, metadata] of Object.entries(ENGLISH_PRODUCT_METADATA)) {
      expect(metadata.title.length, `${slug} title`).toBeLessThanOrEqual(60);
      expect(metadata.description.length, `${slug} description`).toBeLessThanOrEqual(160);
      expect(metadata.title, `${slug} brand`).toMatch(/Suneng/i);
    }
  });
});
