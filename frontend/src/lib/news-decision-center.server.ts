import 'server-only';

import { setImmediate as yieldToEventLoop, setTimeout as pauseForResponse } from 'node:timers/promises';

import { cache } from 'react';
import { unstable_cache } from 'next/cache';
import { getAllNewsForDecisionCenter } from '@/lib/api/news';
import { mapNewsCard } from '@/lib/news';
import { applyNewsListCopy } from '@/lib/news-list-copy';
import { includeStandaloneNewsResources } from '@/lib/news-list-resources';
import { filterCanonicalNewsItems, hasPublishableEnglishNews } from '@/lib/news-routing';
import type { Locale } from '@/types/site';
import type { NewsListCardItem } from '@/types/news';

// Merge simultaneous cold loads/revalidations within this server process. Keep
// only pending work here; freshness and completed results belong to Next's cache.
const pendingCards = new Map<Locale, Promise<NewsListCardItem[]>>();
const homepageReaders = new Map<Locale, number>();

function prepareCards(locale: Locale): Promise<NewsListCardItem[]> {
  const pending = pendingCards.get(locale);
  if (pending) return pending;

  const request = (async () => {
    const { data, error } = await getAllNewsForDecisionCenter();
    if (error || !data) throw new Error(error || '资料暂时无法加载');

    const items = filterCanonicalNewsItems(data)
      .filter((item) => locale === 'zh' || hasPublishableEnglishNews(item));
    const cards: NewsListCardItem[] = [];
    for (const item of items) {
      const card = applyNewsListCopy(mapNewsCard(locale, item));
      // Retain search text, summaries and counts without duplicating full bodies.
      delete card.source;
      cards.push(card);
      // Rich-text parsing is synchronous. Let request deadlines and other I/O
      // run between cards while this shared load continues to fill the cache.
      // An immediate yield lets the deadline run, but repeated rich-text work
      // can still starve response streaming. Give homepage-triggered cold loads
      // a short I/O window. Ordinary list loads keep their existing scheduling.
      if (homepageReaders.has(locale)) await pauseForResponse(20);
      else await yieldToEventLoop();
    }
    return cards;
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

// All list pages share this complete collection. A failed refresh throws inside
// the data cache, retaining the last successful collection instead of partial data.
export const getNewsDecisionCenterCards = cache(async (locale: Locale) =>
  includeStandaloneNewsResources(await getCachedCards(locale), locale),
);

// Metadata and page rendering share one read in the same request as well.
export const getNewsDecisionCenterData = cache(async (locale: Locale, forHomepage = false) => {
  if (forHomepage) homepageReaders.set(locale, (homepageReaders.get(locale) ?? 0) + 1);
  try {
    return { data: await getNewsDecisionCenterCards(locale), error: null };
  } catch {
    // Failed/partial loads throw inside the cache, so a later request can retry.
    return { data: null, error: '资料暂时无法加载' };
  } finally {
    // Keep the I/O windows until shared background preparation finishes, even
    // when the homepage's shorter wait has already returned its fallback.
    if (forHomepage) {
      const remaining = (homepageReaders.get(locale) ?? 1) - 1;
      if (remaining) homepageReaders.set(locale, remaining);
      else homepageReaders.delete(locale);
    }
  }
});
