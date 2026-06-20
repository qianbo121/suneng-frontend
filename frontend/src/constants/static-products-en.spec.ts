import { describe, expect, it } from 'vitest';

import {
  STATIC_PRODUCTS,
  getStaticProductBySlug,
  type StaticProductDetail,
} from '@/constants/static-products';
import { productDetailEn } from '@/constants/static-products-en';

const ALLOW = ['leadForm'] as const satisfies readonly (keyof StaticProductDetail)[];
const allowedMissingFields = new Set<string>(ALLOW);

const productCases = STATIC_PRODUCTS
  .map((product) => {
    const detail = getStaticProductBySlug(product.slug)?.detail;

    return detail ? { slug: product.slug, detail } : null;
  })
  .filter((item): item is { slug: string; detail: StaticProductDetail } => item !== null);

describe('productDetailEn coverage', () => {
  it('covers the expected product detail set', () => {
    expect(productCases).toHaveLength(11);
  });

  describe.each(productCases)('$slug', ({ slug, detail }) => {
    it('has an English whole-field override for every Chinese detail field', () => {
      const englishDetail = productDetailEn[slug] ?? {};
      const missingFields = Object.keys(detail).filter(
        (field) => !allowedMissingFields.has(field) && !Object.prototype.hasOwnProperty.call(englishDetail, field),
      );

      expect(missingFields, `${slug} -> ${missingFields.join(', ')}`).toEqual([]);
    });
  });
});
