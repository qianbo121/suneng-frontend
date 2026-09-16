import 'server-only';

import { cache } from 'react';
import { unstable_cache } from 'next/cache';
import { getAllNewsForDecisionCenter } from '@/lib/api/news';
import { mapNewsCard } from '@/lib/news';
import { applyNewsListCopy } from '@/lib/news-list-copy';
import { filterCanonicalNewsItems, hasPublishableEnglishNews } from '@/lib/news-routing';
import type { Locale } from '@/types/site';

// Cache the complete, prepared collection once, independently of the current
// search/filter/page. Detail reads keep their existing real-time checks.
const getCachedCards = unstable_cache(
  async (locale: Locale) => {
    const { data, error } = await getAllNewsForDecisionCenter();
    if (error || !data) throw new Error(error || '资料暂时无法加载');

    return filterCanonicalNewsItems(data)
      .filter((item) => locale === 'zh' || hasPublishableEnglishNews(item))
      .map((item) => {
        const card = applyNewsListCopy(mapNewsCard(locale, item));
        // The list already has its search text, summaries and view count. Do not
        // duplicate the full source bodies in the persistent cache or page data.
        delete card.source;
        return card;
      });
  },
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

export async function getNewsDecisionCenterData(locale: Locale) {
  try {
    return { data: await getCachedCards(locale), error: null };
  } catch {
    // Failed/partial loads throw inside the cache, so a later request can retry.
    return { data: null, error: '资料暂时无法加载' };
  }
}
