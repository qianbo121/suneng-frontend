import { FALLBACK_NEWS_ITEMS } from '@/constants/news';
import { NewsItem } from '@/types/home';

export const homeNews: NewsItem[] = FALLBACK_NEWS_ITEMS.map((item) => ({
  id: item.id,
  title: item.title,
  summary: item.summary,
  coverImage: item.image,
  publishDate: item.date,
  href: `/news/${item.slug}`,
}));
