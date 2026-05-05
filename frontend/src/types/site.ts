export type Locale = 'zh' | 'en';

export type LocalizedText = {
  zh: string;
  en: string;
};

export type NavigationChildItem = {
  key: string;
  href: string;
  label: LocalizedText;
};

export type NavigationItem = {
  key: string;
  href: string;
  label: LocalizedText;
  children?: NavigationChildItem[];
};

export type ToolbarItem = {
  key: 'whatsapp' | 'email' | 'afterSales' | 'sales';
  label: LocalizedText;
  value: string;
  href: string;
};

export type SiteSettings = {
  siteName: LocalizedText;
  companyName: LocalizedText;
  topPhone: string;
  topEmail: string;
  salesPhone: string;
  afterSalesPhone: string;
  whatsapp: string;
  email: string;
  address: LocalizedText;
  icp: string;
  copyright: LocalizedText;
  qrCodeAlt: LocalizedText;
  footerProductCategories: LocalizedText[];
  toolbarItems: ToolbarItem[];
};

export type SidebarItem = {
  label: string;
  href: string;
  matchHrefs?: string[];
};
