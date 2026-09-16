import { safeApiGet } from '@/lib/api/client';
import { applyReviewedNewsCopy } from '@/lib/news-reviewed-copy';
import { applyEnglishNewsCopy } from '@/lib/english-news';
import {
  NewsApiItem,
  NewsCategoryApiItem,
  NewsPrevNextApiData,
  PaginatedNewsApiData,
} from '@/types/news';

type GetNewsListOptions = {
  categoryId?: number;
  page?: number;
  pageSize?: number;
  timeoutMs?: number;
  fresh?: boolean;
};

// Lists may use ISR, but detail and prev/next reads must reflect an offline
// operation immediately.  Caching a detail response after the backend marks a
// news item offline leaves the public article reachable for the cache window.

export function getNewsCategories() {
  return safeApiGet<NewsCategoryApiItem[]>('/v1/news/categories', {
    revalidate: 3600,
  });
}

export async function getNewsList(options: GetNewsListOptions = {}) {
  const result = await safeApiGet<PaginatedNewsApiData>('/v1/news', {
    ...(options.fresh ? { cache: 'no-store' as const } : { revalidate: 300 }),
    searchParams: {
      categoryId: options.categoryId,
      page: options.page ?? 1,
      pageSize: options.pageSize ?? 10,
    },
    timeoutMs: options.timeoutMs,
  });
  if (!result.data) return result;
  return {
    ...result,
    data: {
      ...result.data,
      items: await Promise.all(
        result.data.items.map(async (item) =>
          applyEnglishNewsCopy(await applyReviewedNewsCopy(item)),
        ),
      ),
    },
  };
}

export function getLatestNews() {
  return getNewsList({
    page: 1,
    pageSize: 5,
  });
}

export async function getNewsDetail(slug: string) {
  const result = await safeApiGet<NewsApiItem>(`/v1/news/${slug}`, {
    cache: 'no-store',
  });
  return result.data
    ? { ...result, data: await applyEnglishNewsCopy(await applyReviewedNewsCopy(result.data)) }
    : result;
}

export function getNewsPrevNext(id: number) {
  return safeApiGet<NewsPrevNextApiData>(`/v1/news/${id}/prev-next`, {
    cache: 'no-store',
  });
}

// Exhaust all server pages before filtering/sorting. Do not silently return a partial list.
export async function getAllNewsForDecisionCenter() {
  const items: NewsApiItem[] = [];
  for (let page = 1; ; page += 1) {
    const result = await getNewsList({ page, pageSize: 100, fresh: true, timeoutMs: 15000 });
    if (!result.data || result.error)
      return { data: null, error: result.error || '资料暂时无法加载' };
    items.push(...result.data.items);
    if (items.length >= result.data.total) return { data: items, error: null };
    if (!result.data.items.length) return { data: null, error: '资料列表不完整，请稍后重试' };
  }
}
