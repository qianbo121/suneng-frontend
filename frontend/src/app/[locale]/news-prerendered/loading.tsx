'use client';

import { useLocale } from 'next-intl';
import { LoadingFeedback } from '@/components/common/LoadingFeedback';

// The cached list must not read request headers while rendering its fallback.
// Its locale is already available from the parent layout's client provider.
export default function PrerenderedNewsLoading() {
  const locale = useLocale();
  return <LoadingFeedback locale={locale === 'en' ? 'en' : 'zh'} resource />;
}
