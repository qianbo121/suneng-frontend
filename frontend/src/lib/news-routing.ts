import type { NewsApiItem } from '@/types/news';

const LEGACY_DUPLICATE_SLUGS: Record<string, string> = {
  'jiang-su-su-neng-gong-ye-lu-tui-huo-gu-rong-sheng-chan-xian-zhu-li-gang-cai-shen-jia-gong-1':
    'jiang-su-su-neng-gong-ye-lu-tui-huo-gu-rong-sheng-chan-xian-zhu-li-gang-cai-shen-jia-gong',
};

export function getCanonicalNewsSlug(slug: string) {
  // Withdrawn duplicates resolve their own publication state, not another page.
  return slug;
}

export function getPublicNewsRedirectSlug(
  requestedSlug: string,
  article: Pick<NewsApiItem, 'slug'>,
) {
  return article.slug === requestedSlug ? null : article.slug;
}

export function isLegacyDuplicateNewsSlug(slug: string) {
  return Boolean(LEGACY_DUPLICATE_SLUGS[slug]);
}

export function hasPublishableEnglishNews(item: NewsApiItem) {
  const title = item.titleEn?.trim();
  const content = item.contentEn?.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

  return Boolean(title && content);
}

export function filterCanonicalNewsItems(items: NewsApiItem[]) {
  return items.filter((item) => !isLegacyDuplicateNewsSlug(item.slug));
}
