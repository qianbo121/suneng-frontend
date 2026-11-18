'use client';

import Link from 'next/link';
import { useEffect, type ReactNode } from 'react';
import {
  resourceDetailHref,
  safeResourceListHref,
  saveResourceListPosition,
  takeResourceListRestore,
} from '@/lib/news-list-navigation';

export function ResourceDetailLink({
  href,
  returnTo,
  className,
  children,
}: {
  href: string;
  returnTo: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={resourceDetailHref(href, returnTo)}
      className={className}
      onClick={() => saveResourceListPosition(returnTo)}
      onAuxClick={() => saveResourceListPosition(returnTo)}
    >
      {children}
    </Link>
  );
}

// Mounted with the actual results, after search data and list filters resolve.
export function ResourceListRestore({ href }: { href: string }) {
  useEffect(() => {
    let frame = 0;
    let observer: ResizeObserver | undefined;
    let deadline: ReturnType<typeof setTimeout> | undefined;
    let stopped = false;
    const stop = () => {
      stopped = true;
      cancelAnimationFrame(frame);
      observer?.disconnect();
      clearTimeout(deadline);
    };
    const restore = () => {
      stop();
      stopped = false;
      const position = takeResourceListRestore(href);
      if (!position) return;
      const apply = () => {
        const locale = href.startsWith('/en/') ? 'en' : 'zh';
        if (
          stopped ||
          safeResourceListHref(`${location.pathname}${location.search}`, locale) !== href
        )
          return;
        window.scrollTo({ top: position.y, behavior: 'instant' });
      };
      // Two frames allow Next's own navigation scroll and restored filters to
      // settle. Observe later content sizing briefly without fighting the user.
      frame = requestAnimationFrame(() => {
        frame = requestAnimationFrame(apply);
      });
      observer = new ResizeObserver(apply);
      observer.observe(document.body);
      deadline = setTimeout(stop, 1800);
    };
    restore();
    window.addEventListener('pageshow', restore);
    window.addEventListener('popstate', restore);
    window.addEventListener('wheel', stop, { passive: true });
    window.addEventListener('touchstart', stop, { passive: true });
    window.addEventListener('keydown', stop);
    window.addEventListener('pointerdown', stop, { passive: true });
    return () => {
      stop();
      window.removeEventListener('pageshow', restore);
      window.removeEventListener('popstate', restore);
      window.removeEventListener('wheel', stop);
      window.removeEventListener('touchstart', stop);
      window.removeEventListener('keydown', stop);
      window.removeEventListener('pointerdown', stop);
    };
  }, [href]);
  return null;
}
