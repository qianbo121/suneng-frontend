import {
  containsLegacyAboutContent,
  isPlaceholderPartner,
  LEGACY_PRODUCT_CATEGORY_SLUGS,
  LEGACY_PRODUCT_SLUGS,
  runGovernedContentSeed,
} from '@/common/content-governance/legacy-public-content';

describe('legacy public content governance', () => {
  it('keeps the legacy product and category lists aligned', () => {
    expect(LEGACY_PRODUCT_CATEGORY_SLUGS).toHaveLength(10);
    expect(LEGACY_PRODUCT_SLUGS).toHaveLength(10);
    expect(LEGACY_PRODUCT_SLUGS[0]).toBe('charging-truck-series-sample-1');
    expect(LEGACY_PRODUCT_SLUGS[9]).toBe('underground-masonry-multi-function-series-sample-10');
  });

  it('detects the old company profile in either language', () => {
    expect(containsLegacyAboutContent(['腾腾装备致力于地下工程装备'])).toBe(true);
    expect(containsLegacyAboutContent(['Tianteng Equipment makes mining machinery.'])).toBe(true);
    expect(
      containsLegacyAboutContent([
        'Jiangsu Suneng Industrial Furnace designs industrial furnaces for customers including mining machinery manufacturers.',
      ]),
    ).toBe(false);
  });

  it('requires both the placeholder name and example website', () => {
    expect(isPlaceholderPartner('合作伙伴 1', 'https://example-1.com')).toBe(true);
    expect(isPlaceholderPartner('合作伙伴 8', 'https://example-8.com/')).toBe(true);
    expect(isPlaceholderPartner('合作伙伴 1', 'https://real.example.com')).toBe(false);
    expect(isPlaceholderPartner('真实合作单位', 'https://example-1.com')).toBe(false);
  });

  it('always cleans and verifies after current content is initialized', async () => {
    const order: string[] = [];
    let publicLegacyRecords = 0;

    await runGovernedContentSeed({
      seedCurrentContent: async () => {
        order.push('seed');
        publicLegacyRecords = 10;
      },
      disableLegacyContent: async () => {
        order.push('cleanup');
        publicLegacyRecords = 0;
      },
      assertNoLegacyPublicContent: async () => {
        order.push('verify');
        expect(publicLegacyRecords).toBe(0);
      },
    });

    expect(order).toEqual(['seed', 'cleanup', 'verify']);
  });

  it('still cleans and verifies when initialization fails midway', async () => {
    const order: string[] = [];
    const seedError = new Error('seed failed');

    await expect(
      runGovernedContentSeed({
        seedCurrentContent: async () => {
          order.push('seed');
          throw seedError;
        },
        disableLegacyContent: async () => {
          order.push('cleanup');
        },
        assertNoLegacyPublicContent: async () => {
          order.push('verify');
        },
      }),
    ).rejects.toBe(seedError);

    expect(order).toEqual(['seed', 'cleanup', 'verify']);
  });

  it('fails initialization when cleanup leaves legacy content public', async () => {
    const publicLegacyRecords = 10;

    await expect(
      runGovernedContentSeed({
        seedCurrentContent: async () => undefined,
        disableLegacyContent: async () => undefined,
        assertNoLegacyPublicContent: async () => {
          if (publicLegacyRecords > 0) throw new Error('legacy content remains public');
        },
      }),
    ).rejects.toThrow('legacy content remains public');
  });
});
