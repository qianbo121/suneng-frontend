import 'server-only';

import { getNewsList } from '@/lib/api/news';
import { mapNewsToHomeAudienceArticles } from '@/lib/home-article-audiences';
import { SITE_URL } from '@/lib/seo/config';
import type { NewsApiItem, PaginatedNewsApiData } from '@/types/news';

type PublicNewsEnvelope = {
  code: number;
  data: PaginatedNewsApiData;
};

async function getPublicNewsItems(): Promise<NewsApiItem[]> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 6_000);

  try {
    const response = await fetch(`${SITE_URL}/api/v1/news?page=1&pageSize=20`, {
      headers: { Accept: 'application/json' },
      next: { revalidate: 300 },
      signal: controller.signal,
    });

    if (!response.ok) return [];

    const payload = (await response.json()) as PublicNewsEnvelope;
    return payload.code === 0 && Array.isArray(payload.data?.items) ? payload.data.items : [];
  } catch {
    return [];
  } finally {
    clearTimeout(timer);
  }
}

export async function getHomepageAudienceArticles() {
  const result = await getNewsList({ page: 1, pageSize: 50, timeoutMs: 3000 });
  let apiArticles = mapNewsToHomeAudienceArticles((result.data?.items ?? []) as NewsApiItem[]);

  // Local previews may not have an API base URL. In that case, read the same
  // published records from the canonical public site instead of showing the
  // old bundled demo cards. Production still prefers its configured API.
  if (apiArticles.length === 0) {
    apiArticles = mapNewsToHomeAudienceArticles(await getPublicNewsItems()).map((article) => ({
      ...article,
      href: `${SITE_URL}${article.href}`,
    }));
  }

  // Do not render a tab strip with an empty content panel after both sources
  // fail. The homepage already provides a readable error state and news link.
  if (apiArticles.length === 0) throw new Error('Homepage articles are temporarily unavailable');
  return apiArticles;
}
