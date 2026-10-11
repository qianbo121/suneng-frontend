'use client';

import { useLocale } from 'next-intl';
import { LoadingFeedback } from '@/components/common/LoadingFeedback';

// List loading feedback must not stream the sibling article detail route.
export default function NewsListLoading() {
  const locale = useLocale();
  return <LoadingFeedback locale={locale === 'en' ? 'en' : 'zh'} resource />;
}
