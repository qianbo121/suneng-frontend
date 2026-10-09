import { describe, expect, it } from 'vitest';
import { rollerHearthFurnacePageConfig } from '@/components/products/industry-furnace-data/roller-hearth-furnace';
import { productDetailEn } from '@/constants/static-products-en';
import { localizeCoreValue } from './core-page-localization';
import englishNews from './english-news-copy.json';
import englishNewsIndex from './english-news-index.json';
import { isWithdrawnTechnicalPath } from './publication-scope';
import { getTrolleyProcurementResources } from './trolley-procurement-resources';

describe('Approved trolley resources and roller speed boundaries', () => {
  it('shows the three existing English resources only on the English trolley page', () => {
    const resources = getTrolleyProcurementResources('en', 'trolley-furnace');
    expect(resources).toHaveLength(3);
    expect(new Set(resources.map(([, href]) => href)).size).toBe(3);
    for (const [, href] of resources) {
      const slug = href.replace('/en/news/', '');
      const entry = Object.entries(englishNews).find(([, item]) => item.slug === slug);
      expect(entry, href).toBeDefined();
      const [id, copy] = entry!;
      expect(copy.titleEn.trim()).not.toBe('');
      expect(copy.contentEn.replace(/<[^>]+>/g, '').trim()).not.toBe('');
      expect((englishNewsIndex as Record<string, { slug: string }>)[id]?.slug).toBe(slug);
      expect(isWithdrawnTechnicalPath(href)).toBe(false);
    }
    expect(getTrolleyProcurementResources('zh', 'trolley-furnace')).toEqual([]);
    expect(getTrolleyProcurementResources('en', 'roller-hearth-furnace')).toEqual([]);
  });

  it.each(['zh', 'en'] as const)('keeps the visible and structured roller examples consistent in %s', (locale) => {
    const config = localizeCoreValue(rollerHearthFurnacePageConfig, locale);
    expect(config.productProperties).toEqual(config.heroInfo.map(([name, value]) => ({ name, value })));
    expect(config.heroInfo.map(([, value]) => value)).toContain('950 ℃');
    expect(JSON.stringify([config.heroInfo, config.productProperties, config.heroNotice])).not.toContain('5–20');
    expect(config.heroNotice).toContain(locale === 'zh' ? '未经核实的速度不能用于计算加热时间或产能' : 'Do not use unverified speed to calculate heating time or capacity');
    if (locale === 'en') expect(config.heroNotice).not.toMatch(/[\u3400-\u9fff]/);
  });

  it('preserves the same conveying-speed boundary in the English product data', () => {
    const speed = productDetailEn['roller-hearth-furnace']?.customSpecs?.find((item) => item.key === 'Conveying Speed');
    expect(speed?.value).toContain('entry/exit, reciprocating and steady process operation');
    expect(speed?.value).toContain('Do not use unverified speed to calculate heating time or capacity');
  });
});
