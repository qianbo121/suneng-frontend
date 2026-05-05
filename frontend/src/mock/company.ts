import { CompanyIntroContent } from '@/types/home';

export const companyIntro: CompanyIntroContent = {
  eyebrow: '',
  title: {
    zh: '江苏苏能工业炉有限公司',
    en: 'Jiangsu Suneng Industrial Furnace Co., Ltd.',
  },
  description: {
    zh: '专注于工业炉装备制造、热工系统集成与工程化交付，围绕方案设计、设备制造、安装调试及项目落地，为客户提供稳定、专业、可靠的工业炉整体解决方案。',
    en: 'Focused on industrial furnace equipment manufacturing, thermal processing system integration and engineering delivery, providing stable and reliable turnkey industrial furnace solutions across design, manufacturing, installation, commissioning and project implementation.',
  },
  buttonLabel: {
    zh: '探索详细',
    en: 'Explore Details',
  },
  buttonHref: '/about',
  stats: [
    { id: 1, value: 2006, suffix: '年', label: { zh: '公司成立', en: 'Founded' } },
    { id: 2, value: 5000, suffix: '万元', label: { zh: '注册资本', en: 'Registered Capital' } },
    { id: 3, value: 50, suffix: '+', label: { zh: '专利数', en: 'Patents' } },
    { id: 4, value: 150, suffix: '+', label: { zh: '公司员工', en: 'Staff' } },
  ],
};
