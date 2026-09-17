import 'server-only';

import { cache } from 'react';
import { unstable_cache } from 'next/cache';
import { getAllNewsForDecisionCenter } from '@/lib/api/news';
import { mapNewsCard } from '@/lib/news';
import { applyNewsListCopy } from '@/lib/news-list-copy';
import { filterCanonicalNewsItems, hasPublishableEnglishNews } from '@/lib/news-routing';
import type { Locale } from '@/types/site';
import type { NewsListCardItem } from '@/types/news';

// Merge simultaneous cold loads/revalidations within this server process. Keep
// only pending work here; freshness and completed results belong to Next's cache.
const pendingCards = new Map<Locale, Promise<NewsListCardItem[]>>();

function prepareCards(locale: Locale): Promise<NewsListCardItem[]> {
  const pending = pendingCards.get(locale);
  if (pending) return pending;

  const request = (async () => {
    const { data, error } = await getAllNewsForDecisionCenter();
    if (error || !data) throw new Error(error || '资料暂时无法加载');

    return filterCanonicalNewsItems(data)
      .filter((item) => locale === 'zh' || hasPublishableEnglishNews(item))
      .map((item) => {
        const card = applyNewsListCopy(mapNewsCard(locale, item));
        // Retain search text, summaries and counts without duplicating full bodies.
        delete card.source;
        return card;
      });
  })().finally(() => pendingCards.delete(locale));

  pendingCards.set(locale, request);
  return request;
}

// Cache the complete, prepared collection once, independently of the current
// search/filter/page. Detail reads keep their existing real-time checks.
const getCachedCards = unstable_cache(
  prepareCards,
  [
    'news-decision-center-cards-bilingual-v6-content-review-20260912',
    process.env.API_BASE_URL_INTERNAL || process.env.NEXT_PUBLIC_API_URL || '',
  ],
  { revalidate: 300 },
);

// For prerendered list pages: a failed read must throw so a first generation
// fails instead of caching an error page, and a failed background refresh
// keeps serving the previous page.
export const getNewsDecisionCenterCards = cache((locale: Locale) => getCachedCards(locale));

// Metadata and page rendering share one read in the same request as well.
export const getNewsDecisionCenterData = cache(async (locale: Locale) => {
  try {
    return { data: await getCachedCards(locale), error: null };
  } catch {
    // Failed/partial loads throw inside the cache, so a later request can retry.
    return { data: null, error: '资料暂时无法加载' };
  }
});
