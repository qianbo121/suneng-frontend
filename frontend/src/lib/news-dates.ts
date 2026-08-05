import type { NewsApiItem } from '@/types/news';

export function getNewsContentModifiedTime(
  item?: Pick<NewsApiItem, 'contentUpdatedAt' | 'publishDate'> | null,
) {
  if (!item) return undefined;

  const candidate = item.contentUpdatedAt || item.publishDate;
  const date = new Date(candidate);

  if (Number.isNaN(date.getTime()) || date > new Date()) return undefined;
  return candidate;
}
