import { describe, expect, it, vi } from 'vitest';

vi.mock('next/cache', () => ({ unstable_cache: (fn: unknown) => fn }));
vi.mock('server-only', () => ({}));
vi.mock('react', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react')>()),
  cache: <T extends (...args: never[]) => unknown>(fn: T) => fn,
}));
vi.mock('@/lib/api/news', () => ({
  getAllNewsForDecisionCenter: vi.fn(async () => ({ data: [], error: null })),
}));

import buildSitemap from '@/app/sitemap';
import { approvedProcurementPages } from './approved-procurement-pages';

describe('equipment procurement sitemap revision', () => {
  it('follows the public revision source without dating parts or creating an English page', async () => {
    const page = approvedProcurementPages.equipment as unknown as {
      publishedModifiedAt: string;
    };
    const originalRevision = page.publishedModifiedAt;
    const historicalRevision = '2026-01-02T03:04:05+08:00';
    const site = 'https://www.jssngyl.cn';

    try {
      // Changing the source detects a duplicated or build-time sitemap date.
      page.publishedModifiedAt = historicalRevision;
      const entries = new Map((await buildSitemap()).map((entry) => [entry.url, entry]));
      expect(entries.get(site + approvedProcurementPages.equipment.path)?.lastModified).toEqual(
        new Date(historicalRevision),
      );
      expect(entries.get(site + approvedProcurementPages.parts.path)?.lastModified).toBeUndefined();
      expect(entries.has(site + approvedProcurementPages.equipment.path.replace('/zh/', '/en/'))).toBe(false);
    } finally {
      page.publishedModifiedAt = originalRevision;
    }
  });
});
