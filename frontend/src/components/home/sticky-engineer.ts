import { siteSettings } from '@/mock/siteSettings';

export const STICKY_ENGINEER_SESSION_CLOSED_KEY = 'suneng_sticky_engineer_closed';
export const STICKY_ENGINEER_CONVERTED_KEY = 'suneng_sticky_engineer_converted';
export const STICKY_ENGINEER_CONVERTED_EVENT = 'suneng:sticky-engineer-converted';

export const stickyEngineerSettings = {
  portraitSrc: '/images/contact/engineer-portrait-sn.webp',
  wechatQrSrc: siteSettings.wechatQrCode,
  phone: siteSettings.salesPhone,
  email: siteSettings.email,
} as const;

export function markStickyEngineerConverted() {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.setItem(STICKY_ENGINEER_CONVERTED_KEY, '1');
  } catch {
    // Storage restrictions must not interrupt a successful inquiry submission.
  }

  window.dispatchEvent(new Event(STICKY_ENGINEER_CONVERTED_EVENT));
}
