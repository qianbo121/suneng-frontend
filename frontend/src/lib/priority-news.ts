import type { NewsListCardItem } from '@/types/news';

// Previously deep links; only recommend records present in the current public locale list.
export const PRIORITY_NEWS_SLUGS = [
  'dian-jia-re-tai-che-lu-he-ran-qi-tai-che-lu-zen-me-xuan-xian-bi-jiao-7-xiang-tiao-jian',
  'shuju-news-16',
  'shuju-news-21',
  'shuju-news-17',
  'shuju-news-34',
  'heat-treatment-line-batch-traceability',
  'heat-treatment-line-capacity-bottleneck-troubleshooting',
] as const;

export function getPriorityNews(items: NewsListCardItem[]) {
  return PRIORITY_NEWS_SLUGS.flatMap((slug) => {
    const item = items.find((candidate) => candidate.slug === slug);
    return item ? [item] : [];
  });
}
