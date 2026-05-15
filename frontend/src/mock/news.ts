import { NewsItem } from '@/types/home';

export const homeNews: NewsItem[] = [
  {
    id: 1,
    title: { zh: '企业官网首页高保真样板进入静态还原阶段', en: 'Homepage mock enters high-fidelity static reconstruction' },
    summary: {
      zh: '本轮先以 mock 数据完成首页模块顺序、节奏、配色和交互结构确认，为后续接入 API 做准备。',
      en: 'This round confirms homepage composition, rhythm, palette and interaction structure using mock data before API integration.',
    },
    coverImage: '/images/home/hero-industrial-furnace-banner-hd.png',
    publishDate: '2026-04-17',
    href: '/news/large-trolley-furnace-delivery',
  },
  {
    id: 2,
    title: { zh: '制造业官网视觉方向确定为稳重专业机械风格', en: 'Manufacturing website direction confirmed as industrial and professional' },
    summary: {
      zh: '整体采用深蓝为主色，辅以红色点缀，强调机械设备行业的稳定与专业属性。',
      en: 'The site uses a deep blue palette with red accents to express a stable and professional industrial image.',
    },
    coverImage: '/images/home/hero-industrial-furnace-test.png',
    publishDate: '2026-04-14',
    href: '/news/industry-technology-exchange',
  },
  {
    id: 3,
    title: { zh: '产品系列模块完成 10 类 mock 分类梳理', en: 'Ten mock product categories are prepared for the homepage' },
    summary: {
      zh: '产品分类卡片将作为首页重点入口，后续接入产品中心列表页和详情页数据。',
      en: 'Product category cards act as major homepage entry points and will later connect to product listing and detail pages.',
    },
    coverImage: '/images/home/product-center/mesh-belt-furnace-real.jpg',
    publishDate: '2026-04-11',
    href: '/news/intelligent-control-system-upgrade',
  },
  {
    id: 4,
    title: { zh: '热销产品轮播交互已纳入首页静态版', en: 'Hot products carousel is included in the static homepage' },
    summary: {
      zh: '该模块用于展示重点产品，后续将支持拖拽、自动轮播和响应式断点切换。',
      en: 'The hot product module is used to highlight key products with drag, autoplay and responsive breakpoints.',
    },
    coverImage: '/images/home/product-center/rotary-hearth-furnace-real.jpg',
    publishDate: '2026-04-08',
    href: '/news/equipment-upgrade-production-stability',
  },
  {
    id: 5,
    title: { zh: '公司介绍区加入数据滚动和合作伙伴滚动带', en: 'Company intro now includes counters and partner marquee' },
    summary: {
      zh: '强化企业可信度表达，形成制造业官网常见的“实力背书”区块。',
      en: 'This improves credibility and creates a standard industrial “strength endorsement” section.',
    },
    coverImage: '/images/home/product-center/pit-furnace-real.jpg',
    publishDate: '2026-04-05',
    href: '/news/international-heat-treatment-expo',
  },
  {
    id: 6,
    title: { zh: '新闻区块将作为后续动态内容接入的重要入口', en: 'News area will later connect to dynamic content APIs' },
    summary: {
      zh: '当前先还原结构和卡片样式，后续通过后台维护新闻内容与发布时间。',
      en: 'The structure and card style are prepared now; content and publishing flow will come from the CMS later.',
    },
    coverImage: '/images/home/product-center/trolley-furnace-real.jpg',
    publishDate: '2026-04-01',
    href: '/news/industrial-furnace-maintenance-sharing',
  },
];
