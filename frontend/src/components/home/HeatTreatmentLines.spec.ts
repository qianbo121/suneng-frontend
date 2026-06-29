import { describe, expect, it } from 'vitest';

import { buildProductCenterCards } from '@/components/home/HeatTreatmentLines';

describe('buildProductCenterCards', () => {
  it('merges CMS product categories into existing product center cards by slug', () => {
    const cards = buildProductCenterCards([
      {
        id: 88,
        slug: 'box-furnace',
        name: { zh: 'CMS 箱式炉', en: 'CMS Box Furnace' },
        image: '/uploads/box-category.png',
      },
    ]);

    expect(cards[0]).toMatchObject({
      id: 88,
      slug: 'box-furnace',
      zh: 'CMS 箱式炉',
      en: 'CMS Box Furnace',
      image: '/uploads/box-category.png',
    });
  });

  it('keeps the curated product center layout and ignores CMS-only categories', () => {
    const cards = buildProductCenterCards([
      {
        id: 99,
        slug: 'custom-furnace',
        name: { zh: '定制炉型', en: 'Custom Furnace' },
        image: '/uploads/custom.png',
      },
    ]);

    expect(cards.some((item) => item.slug === 'box-furnace')).toBe(true);
    expect(cards.some((item) => item.slug === 'custom-furnace')).toBe(false);
  });
});
