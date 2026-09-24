'use client';

import { useEffect } from 'react';
import { isLocalPreviewHostname } from '@/lib/analytics/local-preview';
import { isPublicNewsView, registerNewsSessionView } from '@/lib/news-view-session';

export function NewsViewPing({ newsId }: { newsId?: number }) {
  useEffect(() => {
    if (typeof newsId !== 'number' || isLocalPreviewHostname(location.hostname)) return;
    const record = () => {
      if (
        !isPublicNewsView(
          location.pathname,
          location.search,
          document.visibilityState === 'visible',
          Boolean((document as Document & { prerendering?: boolean }).prerendering),
        )
      )
        return;
      let storage: Storage | undefined;
      try {
        storage = sessionStorage;
      } catch {
        /* private browsing */
      }
      void registerNewsSessionView(newsId, storage, async () => {
        const response = await fetch(`/api/news/${newsId}/view`, {
          method: 'POST',
          credentials: 'same-origin',
        });
        return response.ok;
      });
    };
    record();
    document.addEventListener('visibilitychange', record);
    document.addEventListener('prerenderingchange', record);
    return () => {
      document.removeEventListener('visibilitychange', record);
      document.removeEventListener('prerenderingchange', record);
    };
  }, [newsId]);
  return null;
}
