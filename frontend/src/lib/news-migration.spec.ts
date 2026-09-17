import { describe, expect, it } from 'vitest';
import sources from '../../tests/fixtures/news-migration-public-sources-20260910.json';
import revisions from './news-reviewed-copy.json';
import { applyReviewedNewsCopy } from './news-reviewed-copy';
import { getPublicNewsRedirectSlug, isLegacyDuplicateNewsSlug } from './news-routing';
import type { NewsApiItem } from '@/types/news';

// Read-only public API snapshots from 2026-09-10, captured before deployment.
const published = sources.filter((source) => !isLegacyDuplicateNewsSlug(source.slug));
describe('existing published migration copies', () => {
  it('covers nine canonical revised articles plus the recorded duplicate alias', () => {
    expect(published).toHaveLength(9);
    expect(sources).toHaveLength(10);
  });
  it.each(published)('preserves identity and applies the reviewed source for $id', async (source) => {
    const item = source as NewsApiItem;
    const result = await applyReviewedNewsCopy(item);
    const revision = revisions[String(source.id) as keyof typeof revisions];
    expect(result.contentZh).toBe(revision.contentZh);
    expect(result.summaryZh).toBe(revision.summaryZh);
    expect(result.slug).toBe(source.slug);
    expect(result.id).toBe(source.id);
    expect(getPublicNewsRedirectSlug(source.slug, result)).toBeNull();
    expect(getPublicNewsRedirectSlug(String(source.id), result)).toBe(source.slug);
    for (const change of [{ contentZh: 'Later CMS revision' }, { status: 'offline' as const }, { isPublished: false }]) {
      const changed = { ...item, ...change };
      expect(await applyReviewedNewsCopy(changed)).toBe(changed);
    }
  });
});
