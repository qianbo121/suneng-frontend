'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { createToutiaoArticleSubmitter } from '@/lib/seo/toutiao-submit';

// Public site identifier from this site's Toutiao webmaster auto-submit snippet.
const TOUTIAO_SITE_TOKEN = "400e8ee878cdb61e27f516b577d722b3d493d235ca89d804470ebc37f7dc63bbfd9a9dcb5ced4d7780eb6f3bbd089073c2a6d54440560d63862bbf4ec01bba3a";
const submitArticle = createToutiaoArticleSubmitter(TOUTIAO_SITE_TOKEN, () => new Image());

export function ToutiaoAutoSubmit({ canonicalUrl }: { canonicalUrl: string }) {
  const pathname = usePathname();
  useEffect(() => {
    const report = () => {
      if (
        document.visibilityState !== 'visible' ||
        (document as Document & { prerendering?: boolean }).prerendering ||
        document.querySelector('meta[name="robots"]')?.getAttribute('content')?.includes('noindex')
      ) return;
      submitArticle(window.location.href, canonicalUrl);
    };
    report();
    document.addEventListener('visibilitychange', report);
    document.addEventListener('prerenderingchange', report);
    return () => {
      document.removeEventListener('visibilitychange', report);
      document.removeEventListener('prerenderingchange', report);
    };
  }, [canonicalUrl, pathname]);
  return null;
}
