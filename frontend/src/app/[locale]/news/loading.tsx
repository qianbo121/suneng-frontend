import { getLocale } from 'next-intl/server';
import { NewsDecisionCenter } from '@/components/news/NewsDecisionCenter';
import { NEWS_PAGE_SIZE } from '@/constants/news';
import { DEFAULT_NEWS_SORT } from '@/lib/news-decision-center';

export default async function NewsLoading() {
  const locale = await getLocale();
  return (
    <NewsDecisionCenter
      locale={locale === 'en' ? 'en' : 'zh'}
      items={[]}
      sourceItems={[]}
      page={1}
      total={0}
      pageSize={NEWS_PAGE_SIZE}
      query=""
      topic="all"
      furnace="all"
      sort={DEFAULT_NEWS_SORT}
      loading
    />
  );
}
