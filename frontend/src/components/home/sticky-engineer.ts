import { siteSettings } from '@/mock/siteSettings';

export const STICKY_ENGINEER_SESSION_CLOSED_KEY = 'suneng_sticky_engineer_closed';
export const STICKY_ENGINEER_CONVERTED_KEY = 'suneng_sticky_engineer_converted';
export const STICKY_ENGINEER_CONVERTED_EVENT = 'suneng:sticky-engineer-converted';
export const STICKY_ENGINEER_ELIGIBLE_PATHS = ['/zh', '/zh/products'] as const;

export function isStickyEngineerEligiblePath(pathname: string) {
  return STICKY_ENGINEER_ELIGIBLE_PATHS.includes(
    pathname as (typeof STICKY_ENGINEER_ELIGIBLE_PATHS)[number],
  );
}

export function shouldPersistStickyEngineerSuppression(hostname: string) {
  return !['localhost', '127.0.0.1', '::1'].includes(hostname.toLowerCase());
}

export function hasHeroPassedStickyEngineerTrigger({
  isIntersecting,
  targetBottom,
  triggerLine,
}: {
  isIntersecting: boolean;
  targetBottom: number;
  triggerLine: number;
}) {
  return !isIntersecting && targetBottom <= triggerLine;
}

export const stickyEngineerSettings = {
  portraitSrc: '/images/contact/engineer-portrait-sn.webp',
  wechatQrSrc: siteSettings.wechatQrCode,
  phone: siteSettings.salesPhone,
  email: siteSettings.email,
} as const;

export function markStickyEngineerConverted() {
  if (typeof window === 'undefined') return;

  if (shouldPersistStickyEngineerSuppression(window.location.hostname)) {
    try {
      window.localStorage.setItem(STICKY_ENGINEER_CONVERTED_KEY, '1');
    } catch {
      // Storage restrictions must not interrupt a successful inquiry submission.
    }
  }

  window.dispatchEvent(new Event(STICKY_ENGINEER_CONVERTED_EVENT));
}
