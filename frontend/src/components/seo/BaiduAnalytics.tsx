'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import Script from 'next/script';

const DEFAULT_BAIDU_TONGJI_ID = 'aecc3dcdd0269720537a44fc963eddbb';
const BAIDU_TONGJI_ID = process.env.NEXT_PUBLIC_BAIDU_TONGJI_ID || DEFAULT_BAIDU_TONGJI_ID;
const BAIDU_TONGJI_ENABLED = Boolean(BAIDU_TONGJI_ID && BAIDU_TONGJI_ID !== 'disabled');

declare global {
  interface Window {
    _hmt?: unknown[];
  }
}

export function BaiduAnalytics() {
  const pathname = usePathname();
  const lastTrackedPath = useRef<string | null>(null);

  useEffect(() => {
    if (!BAIDU_TONGJI_ENABLED) {
      return;
    }

    if (!pathname) {
      return;
    }

    if (lastTrackedPath.current === null) {
      lastTrackedPath.current = pathname;
      return;
    }

    if (lastTrackedPath.current === pathname) {
      return;
    }

    lastTrackedPath.current = pathname;
    window._hmt = window._hmt || [];
    window._hmt.push(['_trackPageview', pathname]);
  }, [pathname]);

  if (!BAIDU_TONGJI_ENABLED) {
    return null;
  }

  return (
    <Script id="baidu-analytics" strategy="afterInteractive">
      {`
var _hmt = _hmt || [];
(function() {
  var hm = document.createElement("script");
  hm.src = "https://hm.baidu.com/hm.js?${BAIDU_TONGJI_ID}";
  var s = document.getElementsByTagName("script")[0];
  s.parentNode.insertBefore(hm, s);
})();
      `}
    </Script>
  );
}
