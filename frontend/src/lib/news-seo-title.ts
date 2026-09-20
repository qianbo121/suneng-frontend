import revisions from './news-seo-titles-en.json';
import type { NewsApiItem } from '@/types/news';
import type { Locale } from '@/types/site';

type TitleRevision = { id: number; sourceFingerprint: string; title: string };

// Search copy is separate from the visible article heading. Only the exact
// reviewed English source receives a local title; later CMS edits win.
export async function getNewsSeoTitle(locale: Locale, item: NewsApiItem) {
  if (locale === 'zh') return item.titleZh;
  const title = item.seoTitleEn?.trim() || item.titleEn || item.titleZh;
  const revision = (revisions as Record<string, TitleRevision>)[item.slug];
  if (!revision || revision.id !== item.id || item.status !== 'published' || item.isPublished !== true) {
    return title;
  }
  const source = JSON.stringify([
    item.titleEn ?? null,
    item.summaryEn ?? null,
    item.contentEn ?? null,
    item.seoTitleEn ?? null,
    item.seoDescriptionEn ?? null,
  ]);
  const digest = await globalThis.crypto.subtle.digest('SHA-256', new TextEncoder().encode(source));
  const fingerprint = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
  return fingerprint === revision.sourceFingerprint ? revision.title : title;
}
