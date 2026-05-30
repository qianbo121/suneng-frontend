import { safeApiGet } from '@/lib/api/client';
import { NewsApiItem, NewsCategoryApiItem, NewsPrevNextApiData, PaginatedNewsApiData } from '@/types/news';

type GetNewsListOptions = {
  categoryId?: number;
  page?: number;
  pageSize?: number;
  timeoutMs?: number;
};

export function getNewsCategories() {
  return safeApiGet<NewsCategoryApiItem[]>('/v1/news/categories', {
    cache: 'no-store',
  });
}

export function getNewsList(options: GetNewsListOptions = {}) {
  return safeApiGet<PaginatedNewsApiData>('/v1/news', {
    cache: 'no-store',
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
    cache: 'no-store',
  });
}

export function getNewsPrevNext(id: number) {
  return safeApiGet<NewsPrevNextApiData>(`/v1/news/${id}/prev-next`, {
    cache: 'no-store',
  });
}
