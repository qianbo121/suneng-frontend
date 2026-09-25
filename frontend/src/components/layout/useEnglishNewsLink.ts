'use client';

import { useEffect, useState } from 'react';

export function resolveEnglishNewsLink(pathname: string, alternateUrls: string[]) {
  if (!/^\/zh\/news\/[^/]+\/?$/.test(pathname)) return null;
  const expected = pathname.replace(/^\/zh\//, '/en/').replace(/\/$/, '');
  // Only the current article's server-declared counterpart is eligible. Never
  // reuse a previous article's link while client navigation is still loading.
  return alternateUrls.some(href => {
    try {
      return new URL(href, 'https://www.jssngyl.cn').pathname.replace(/\/$/, '') === expected;
    } catch {
      return false;
    }
  }) ? expected : '/en/news';
}

export function useEnglishNewsLink(pathname: string) {
  const [resolved, setResolved] = useState<{ pathname: string; href: string } | null>(null);
  const fallback = resolveEnglishNewsLink(pathname, []);

  useEffect(() => {
    if (!fallback) return;
    const update = () => {
      const href = resolveEnglishNewsLink(pathname, Array.from(
        document.querySelectorAll<HTMLLinkElement>('link[rel="alternate"][hreflang="en"], link[rel="alternate"][hreflang^="en-"]'),
        link => link.href,
      ))!;
      setResolved(previous => previous?.pathname === pathname && previous.href === href ? previous : { pathname, href });
    };
    // Next may stream alternates into the body, not just the head. Until they arrive, the resource
    // list is a safe, usable destination, including before hydration.
    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, {
      childList: true, subtree: true, attributes: true, attributeFilter: ['href', 'hreflang'],
    });
    update();
    return () => observer.disconnect();
  }, [pathname, fallback]);

  return fallback ? resolved?.pathname === pathname ? resolved.href : fallback : null;
}
