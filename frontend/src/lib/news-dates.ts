import type { NewsApiItem } from '@/types/news';

// Bilingual byline revision e2b105a3b (2026-10-19), backfilled at the owner's request.
// This is a fixed editorial revision, never the build, request or deployment time.
const ATTRIBUTION_MODIFIED_AT = '2026-10-19T13:53:16Z';

export function getNewsContentModifiedTime(
  item?: Pick<NewsApiItem, 'contentUpdatedAt' | 'publishDate' | 'englishContentUpdatedAt'> | null,
  locale: 'zh' | 'en' = 'zh',
) {
  if (!item) return undefined;

  const candidate =
    (locale === 'en' && item.englishContentUpdatedAt) || item.contentUpdatedAt || item.publishDate;
  const date = new Date(candidate);

  const now = new Date();
  if (Number.isNaN(date.getTime()) || date > now) return undefined;

  const attributionDate = new Date(ATTRIBUTION_MODIFIED_AT);
  const publishedDate = new Date(item.publishDate);
  if (publishedDate < attributionDate && date < attributionDate && attributionDate <= now) {
    return ATTRIBUTION_MODIFIED_AT;
  }
  return candidate;
}
