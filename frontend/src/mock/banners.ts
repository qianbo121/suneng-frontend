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
      zh: '工业加热与热处理装备制造专家',
      en: 'Industrial Heating and Heat Treatment Equipment Specialist',
    },
    subtitle: {
      zh: '专注电阻式与燃气式工业炉研发制造，为客户提供单机设备、配套件与整线交钥匙工程。',
      en: 'Focused on electric-resistance and gas-fired industrial furnaces, supporting stand-alone equipment, components and turnkey lines.',
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
      zh: '覆盖热处理、锻造加热与工业固化',
      en: 'Covering Heat Treatment, Forging Heating and Industrial Curing',
    },
    subtitle: {
      zh: '构建周期式、连续式、真空与可控气氛、专用工艺炉等完整产品体系。',
      en: 'A complete portfolio across batch, continuous, vacuum, controlled-atmosphere and dedicated process furnaces.',
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
      zh: '从工艺方案、设计制造到安装调试和售后维护，提供全流程工业炉技术支持。',
      en: 'Providing full-process furnace support from process planning, design and manufacturing to commissioning and after-sales service.',
    },
    ctaLabel: {
      zh: '立即联系我们',
      en: 'Contact Us',
    },
    ctaHref: '/contact',
    image: HERO_BG_SOFT,
  },
];
