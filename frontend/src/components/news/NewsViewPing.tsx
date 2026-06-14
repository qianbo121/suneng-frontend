'use client';

import { useEffect, useRef } from 'react';

type NewsViewPingProps = {
  newsId?: number;
};

/**
 * Fire-and-forget client-side view registration.
 *
 * View counting is intentionally decoupled from the (cacheable) detail render:
 * the server component fetch can be ISR-cached without suppressing counts, and
 * the backend enforces per-viewer/day idempotency via an httpOnly cookie. Only
 * fires for real articles (an API id); fallback content has no id and is
 * skipped. Failures are swallowed — a view ping must never break the page.
 */
export function NewsViewPing({ newsId }: NewsViewPingProps) {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current || typeof newsId !== 'number') {
      return;
    }
    fired.current = true;
    const base = process.env.NEXT_PUBLIC_API_BASE_URL || '/api';
    void fetch(`${base}/v1/news/${newsId}/view`, {
      method: 'POST',
      credentials: 'include',
    }).catch(() => {});
  }, [newsId]);

  return null;
}
