import revisions from './news-reviewed-copy.json';
import type { NewsApiItem } from '@/types/news';

type ReviewedCopy = {
  slug: string;
  sourceFingerprint: string;
  reviewedAt: string;
  contentZh: string;
  summaryZh: string;
  seoDescriptionZh: string;
  titleZh?: string;
};

// Apply only to the reviewed, still-published source version. A later CMS edit
// wins automatically; failed/offline API responses never become local articles.
export async function applyReviewedNewsCopy(item: NewsApiItem): Promise<NewsApiItem> {
  const revision = (revisions as Record<string, ReviewedCopy>)[String(item.id)];
  if (
    !revision ||
    item.slug !== revision.slug ||
    item.status !== 'published' ||
    item.isPublished === false
  )
    return item;

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
  if (fingerprint !== revision.sourceFingerprint) return item;

  return {
    ...item,
    ...(revision.titleZh ? { titleZh: revision.titleZh, seoTitleZh: revision.titleZh } : {}),
    contentZh: revision.contentZh,
    summaryZh: revision.summaryZh,
    seoDescriptionZh: revision.seoDescriptionZh,
    contentUpdatedAt: revision.reviewedAt,
  };
}
