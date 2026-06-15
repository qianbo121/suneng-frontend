import { safeApiGet } from '@/lib/api/client';
import { NewsApiItem, NewsCategoryApiItem, NewsPrevNextApiData, PaginatedNewsApiData } from '@/types/news';

type GetNewsListOptions = {
  categoryId?: number;
  page?: number;
  pageSize?: number;
  timeoutMs?: number;
};

// Read paths use ISR (next.revalidate) instead of cache:'no-store' so the Next
// Data Cache is not defeated. View counting is decoupled (see NewsViewPing), so
// caching the detail read no longer suppresses view counts.

export function getNewsCategories() {
  return safeApiGet<NewsCategoryApiItem[]>('/v1/news/categories', {
    revalidate: 3600,
  });
}

export function getNewsList(options: GetNewsListOptions = {}) {
  return safeApiGet<PaginatedNewsApiData>('/v1/news', {
    revalidate: 300,
    searchParams: {
      categoryId: options.categoryId,
      page: options.page ?? 1,
      pageSize: options.pageSize ?? 10,
    },
    timeoutMs: options.timeoutMs,
  });
}

export function getLatestNews() {
  return getNewsList({
    page: 1,
    pageSize: 5,
  });
}

export function getNewsDetail(slug: string) {
  return safeApiGet<NewsApiItem>(`/v1/news/${slug}`, {
    revalidate: 600,
  });
}

export function getNewsPrevNext(id: number) {
  return safeApiGet<NewsPrevNextApiData>(`/v1/news/${id}/prev-next`, {
    revalidate: 600,
  });
}
