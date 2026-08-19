'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

import { installVisitorNatureTracking, startDwellTracking, trackPageView } from '@/lib/api/lead-events';

export function WebsiteReadingTracker() {
  const pathname = usePathname();

  useEffect(() => {
    installVisitorNatureTracking();
  }, []);

  useEffect(() => {
    trackPageView();
    // 计时器跨页面重启，但秒数存在 sessionStorage 里接着走——口径是「在官网待了多久」。
    return startDwellTracking();
  }, [pathname]);

  return null;
}
