'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

import { installVisitorNatureTracking, markEngagedSession, trackPageView } from '@/lib/api/lead-events';

const READING_SECONDS = 60;

function isPriorityPage(pathname: string) {
  return /\/(?:zh|en)\/(?:products\/detail|solutions|service\/furnace-renovation-overhaul|case|articles)\//.test(
    `${pathname}/`,
  );
}

export function WebsiteReadingTracker() {
  const pathname = usePathname();

  useEffect(() => {
    installVisitorNatureTracking();
  }, []);

  useEffect(() => {
    trackPageView();
    if (!isPriorityPage(pathname)) return;
    let activeSeconds = 0;
    const timer = window.setInterval(() => {
      if (document.visibilityState !== 'visible' || !document.hasFocus()) return;
      activeSeconds += 1;
      if (activeSeconds >= READING_SECONDS) {
        markEngagedSession();
        window.clearInterval(timer);
      }
    }, 1000);
    return () => window.clearInterval(timer);
  }, [pathname]);

  return null;
}
