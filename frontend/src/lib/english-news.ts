import translations from './english-news-copy.json';
import type { NewsApiItem } from '@/types/news';

type Translation = {
  slug: string;
  sourceFingerprint: string;
  translatedAt: string;
  titleEn: string;
  summaryEn: string;
  contentEn: string;
  seoKeywordsEn: string;
  sourceDateEn?: NewsApiItem['englishSourceDate'];
  coverImageEn?: string;
};

export async function applyEnglishNewsCopy(item: NewsApiItem): Promise<NewsApiItem> {
  const translation = (translations as Record<string, Translation>)[String(item.id)];
  if (
    !translation ||
    item.slug !== translation.slug ||
    item.status !== 'published' ||
    item.isPublished !== true
  )
    return item;
  // A complete later CMS translation is authoritative over this local supplement.
  if (item.titleEn?.trim() && item.contentEn?.replace(/<[^>]+>/g, '').trim()) return item;
  const source = JSON.stringify([
    item.titleZh ?? null,
    item.summaryZh ?? null,
    item.contentZh ?? null,
    item.seoTitleZh ?? null,
    item.seoDescriptionZh ?? null,
  ]);
  const digest = await globalThis.crypto.subtle.digest('SHA-256', new TextEncoder().encode(source));
  const fingerprint = Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, '0'),
  ).join('');
  if (fingerprint !== translation.sourceFingerprint) return item;
  return {
    ...item,
    titleEn: translation.titleEn,
    summaryEn: translation.summaryEn,
    contentEn: translation.contentEn,
    seoTitleEn: translation.titleEn,
    seoDescriptionEn: translation.summaryEn,
    seoKeywordsEn: translation.seoKeywordsEn,
    englishContentUpdatedAt: translation.translatedAt,
    ...(translation.sourceDateEn ? { englishSourceDate: translation.sourceDateEn } : {}),
    ...(translation.coverImageEn ? { englishCoverImage: translation.coverImageEn } : {}),
  };
}
