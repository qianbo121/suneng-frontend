import { SiteSettings } from '@/types/site';

export const siteSettings: SiteSettings = {
  siteName: {
    zh: '苏能工业炉',
    en: 'Suneng Industrial Furnace',
  },
  companyName: {
    zh: '江苏苏能工业炉有限公司',
    en: 'Jiangsu Suneng Industrial Furnace Co., Ltd.',
  },
  topPhone: '+86-130-5298-6814',
  topEmail: 'jssngyl@outlook.com',
  salesPhone: '+86-130-5298-6814',
  afterSalesPhone: '+86-130-5298-6814',
  whatsapp: '+86-130-5298-6814',
  email: 'jssngyl@outlook.com',
  address: {
    zh: '江苏省泰州市姜堰区张甸蔡官工业区',
    en: 'Caiguan Industrial Park, Zhangdian Town, Jiangyan District, Taizhou, Jiangsu Province, China',
  },
  icp: '苏ICP备20020318号-1',
  copyright: {
    zh: 'Copyright © 2026 江苏苏能工业炉有限公司 版权所有',
    en: 'Copyright © 2026 Jiangsu Suneng Industrial Furnace Co., Ltd. All rights reserved.',
  },
  qrCodeAlt: {
    zh: '江苏苏能工业炉官方二维码',
    en: 'Suneng Industrial Furnace official QR code',
  },
  footerProductCategories: [
    { zh: '台车炉系列', en: 'Trolley Furnace Series' },
    { zh: '箱式炉系列', en: 'Box Furnace Series' },
    { zh: '井式炉系列', en: 'Pit Furnace Series' },
    { zh: '网带炉系列', en: 'Mesh Belt Furnace Series' },
    { zh: '热处理生产线', en: 'Heat Treatment Lines' },
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
      value: 'jssngyl@outlook.com',
      href: 'mailto:jssngyl@outlook.com',
    },
    {
      key: 'afterSales',
      label: { zh: '售后电话', en: 'After-sales' },
      value: '+86-130-5298-6814',
      href: 'tel:+8613052986814',
    },
    {
      key: 'sales',
      label: { zh: '销售电话', en: 'Sales' },
      value: '+86-130-5298-6814',
      href: 'tel:+8613052986814',
    },
  ],
};
