import { siteSettings } from '@/mock/siteSettings';

export const SUNENG_CONTACT = {
  company: siteSettings.companyName.zh,
  phone: siteSettings.salesPhone.replace(/^\+86-/, ''),
  phoneHref: `tel:${siteSettings.salesPhone.replace(/[^+\d]/g, '')}`,
  email: siteSettings.email,
  address: siteSettings.address.zh,
  wechatQr: siteSettings.wechatQrCode,
  // No verified coordinates are stored; use an explicit address search.
  mapHref: `https://www.amap.com/search?query=${encodeURIComponent(`${siteSettings.companyName.zh} ${siteSettings.address.zh}`)}`,
};
