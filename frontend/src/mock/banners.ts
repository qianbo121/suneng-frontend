import { HeroBannerItem } from '@/types/home';

const HERO_BG_DEEP =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1920 1080'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%230A1628'/%3E%3Cstop offset='100%25' stop-color='%23050F1D'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='1920' height='1080' fill='url(%23g)'/%3E%3C/svg%3E";
const HERO_BG_MID =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1920 1080'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%230B172B'/%3E%3Cstop offset='100%25' stop-color='%23081628'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='1920' height='1080' fill='url(%23g)'/%3E%3C/svg%3E";
const HERO_BG_SOFT =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1920 1080'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%230E1B31'/%3E%3Cstop offset='100%25' stop-color='%23091826'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='1920' height='1080' fill='url(%23g)'/%3E%3C/svg%3E";

export const homeBanners: HeroBannerItem[] = [
  {
    id: 1,
    eyebrow: 'SUNENG',
    title: {
      zh: '地下矿山成套装备制造专家',
      en: 'Integrated Underground Mining Equipment Expert',
    },
    subtitle: {
      zh: '以稳健制造、持续研发和工程化交付能力，为矿山客户提供可靠装备解决方案。',
      en: 'Delivering reliable solutions for mining customers through stable manufacturing and engineering execution.',
    },
    ctaLabel: {
      zh: '查看产品中心',
      en: 'View Products',
    },
    ctaHref: '/products',
    image: HERO_BG_DEEP,
  },
  {
    id: 2,
    eyebrow: 'SUNENG',
    title: {
      zh: '聚焦机械装备与现场工况适配',
      en: 'Focused on Heavy Machinery and Site Adaptation',
    },
    subtitle: {
      zh: '围绕矿山施工场景，构建装药、撬毛、破碎与湿喷等多系列产品矩阵。',
      en: 'Building a multi-series portfolio for charging, scaling, crushing and wet spraying scenarios.',
    },
    ctaLabel: {
      zh: '了解企业实力',
      en: 'Explore Strength',
    },
    ctaHref: '/strength',
    image: HERO_BG_MID,
  },
  {
    id: 3,
    eyebrow: 'SUNENG',
    title: {
      zh: '以专业服务支撑客户长期运营',
      en: 'Professional Service for Long-Term Operations',
    },
    subtitle: {
      zh: '从方案咨询到交付保障，建立覆盖售前、售中、售后的全流程支持体系。',
      en: 'Providing end-to-end support from consultation to delivery and after-sales operations.',
    },
    ctaLabel: {
      zh: '立即联系我们',
      en: 'Contact Us',
    },
    ctaHref: '/contact',
    image: HERO_BG_SOFT,
  },
];
