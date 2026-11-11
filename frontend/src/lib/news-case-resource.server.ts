import 'server-only';

import { getEnglishCase } from '@/lib/cases/english';
import { getCaseArticle } from '@/lib/cases/server';
import type { NewsListCardItem } from '@/types/news';
import type { Locale } from '@/types/site';

export function getNewsCaseResource(locale: Locale): NewsListCardItem | undefined {
  const slug = 'henan-annealing-solution-line';
  const item = locale === 'en' ? getEnglishCase(slug) : getCaseArticle(slug);
  if (!item?.cover) return;

  const en = locale === 'en';
  const label = en ? 'Project Case' : '项目案例';
  return {
    id: -2,
    slug: item.slug,
    href: `/${locale}/case/${item.slug}`,
    title: { zh: en ? '' : item.title, en: en ? item.title : '' },
    summary: { zh: en ? '' : item.summary, en: en ? item.summary : '' },
    image: item.cover.src,
    date: item.datePublished ?? '',
    category: { zh: '项目案例', en: 'Project Case' },
    listTopic: 'engineering',
    listFurnaces: ['line'],
    searchText: `${item.title} ${item.summary} ${label} ${en ? 'heat treatment line' : '热处理生产线 850mm'}`,
  };
}
