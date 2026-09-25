'use client';

import { useLocale } from 'next-intl';
import { LoadingFeedback } from '@/components/common/LoadingFeedback';

export default function NewsLoading() {
  // Read the parent locale without suspending or rendering a second page heading.
  const locale = useLocale();
  return <LoadingFeedback locale={locale === 'en' ? 'en' : 'zh'} resource />;
}
