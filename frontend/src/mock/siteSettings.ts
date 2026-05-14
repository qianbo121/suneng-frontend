import { SiteSettings } from '@/types/site';

export const siteSettings: SiteSettings = {
  siteName: {
    zh: '苏能工业炉',
    en: 'HB Suneng Heavy Industry',
  },
  companyName: {
    zh: '制造业企业官网高保真样板',
    en: 'Manufacturing Corporate Website Demo',
  },
  topPhone: '+86 0719-888-8888',
  topEmail: 'info@example-manufacturing.com',
  salesPhone: '+86 138 0000 8888',
  afterSalesPhone: '+86 139 0000 6666',
  whatsapp: '+86 186 8888 0000',
  email: 'service@example-manufacturing.com',
  address: {
    zh: '湖北省十堰市某某工业园装备制造基地 88 号',
    en: 'No. 88, Equipment Manufacturing Base, Industrial Park, Shiyan, Hubei',
  },
  icp: '苏ICP备20020318号-1',
  copyright: {
    zh: 'Copyright © 2026 制造业企业官网样板 保留所有权利',
    en: 'Copyright © 2026 Manufacturing Corporate Website Demo. All rights reserved.',
  },
  qrCodeAlt: {
    zh: '官方二维码占位',
    en: 'Official QR placeholder',
  },
  footerProductCategories: [
    { zh: '装药车系列', en: 'Charging Series' },
    { zh: '撬毛车系列', en: 'Scaling Series' },
    { zh: '破碎车系列', en: 'Crusher Series' },
    { zh: '移动吊车', en: 'Mobile Crane' },
    { zh: '井下湿喷车系列', en: 'Wet Spraying Series' },
  ],
  toolbarItems: [
    {
      key: 'whatsapp',
      label: { zh: 'WhatsApp', en: 'WhatsApp' },
      value: '+86 186 8888 0000',
      href: 'https://wa.me/8618688880000',
    },
    {
      key: 'email',
      label: { zh: '企业邮箱', en: 'Email' },
      value: 'service@example-manufacturing.com',
      href: 'mailto:service@example-manufacturing.com',
    },
    {
      key: 'afterSales',
      label: { zh: '售后电话', en: 'After-sales' },
      value: '+86 139 0000 6666',
      href: 'tel:+8613900006666',
    },
    {
      key: 'sales',
      label: { zh: '销售电话', en: 'Sales' },
      value: '+86 138 0000 8888',
      href: 'tel:+8613800008888',
    },
  ],
};
