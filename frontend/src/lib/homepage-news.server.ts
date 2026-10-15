import 'server-only';

import { getNewsDecisionCenterData } from '@/lib/news-decision-center.server';
import type { Locale } from '@/types/site';

type NewsResult = Awaited<ReturnType<typeof getNewsDecisionCenterData>>;

const HOMEPAGE_NEWS_WAIT_MS = 1000;
const unavailable: NewsResult = { data: null, error: '资料暂时无法加载' };

// Limit only the homepage's wait. The shared read must remain free to finish
// and populate its existing cache; do not cancel it or shorten its timeouts.
export async function getHomepageNewsData(locale: Locale): Promise<NewsResult> {
  let timeout: ReturnType<typeof setTimeout> | undefined;
  let result: NewsResult;
  try {
    result = await Promise.race([
      Promise.resolve().then(() => getNewsDecisionCenterData(locale)).catch(() => unavailable),
      new Promise<NewsResult>((resolve) => {
        timeout = setTimeout(() => resolve(unavailable), HOMEPAGE_NEWS_WAIT_MS);
      }),
    ]);
  } finally {
    clearTimeout(timeout);
  }

  return result;
}
