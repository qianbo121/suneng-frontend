'use client';

import { useLocale } from 'next-intl';
import { LoadingFeedback } from '@/components/common/LoadingFeedback';

// Keep article feedback local to the detail route. List navigation waits for
// the completed page without replacing the current content with a loading shell.
export default function NewsDetailLoading() {
  const locale = useLocale();
  return (
    <LoadingFeedback
      locale={locale === 'en' ? 'en' : 'zh'}
      resource
      variant="article-skeleton"
    />
  );
}
