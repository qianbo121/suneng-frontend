import type { Metadata } from 'next';

import { buildSeoMetadata } from '@/lib/seo';
import { AboutApiData, AboutPageKey, AboutSectionApiItem, ChairmanMessageApiItem, CultureValueApiItem } from '@/types/about';
import { Locale, SidebarItem } from '@/types/site';

const ABOUT_PAGE_COPY: Record<
  AboutPageKey,
  {
    title: { zh: string; en: string };
    englishTitle: string;
    subtitle: { zh: string; en: string };
  }
> = {
  profile: {
    title: { zh: '公司简介', en: 'Company Profile' },
    englishTitle: 'Company Profile',
    subtitle: {
      zh: '专注工业炉研发制造与系统集成解决方案',
      en: 'A clear introduction to the company profile, positioning and manufacturing capability.',
    },
  },
  chairman: {
    title: { zh: '董事长致辞', en: 'Chairman Message' },
    englishTitle: 'Chairman Message',
    subtitle: {
      zh: '通过管理层致辞传达企业方向、价值主张与长期发展愿景。',
      en: 'A message from leadership presenting the company direction and long-term vision.',
    },
  },
  culture: {
    title: { zh: '企业文化', en: 'Corporate Culture' },
    englishTitle: 'Corporate Culture',
    subtitle: {
      zh: '以使命、愿景与价值观构建组织共识，形成稳定一致的企业精神表达。',
      en: 'Mission, vision and values presented as a unified expression of corporate culture.',
    },
  },
  timeline: {
    title: { zh: '发展历程', en: 'Development Timeline' },
    englishTitle: 'Development Timeline',
    subtitle: {
      zh: '沿时间轴梳理企业关键节点，展示成长路径与阶段性成果。',
      en: 'A vertical timeline showing milestones, growth path and major company achievements.',
    },
  },
};

const PROFILE_SECTION_KEYS = ['company', 'company_intro', 'company-profile', 'profile', 'intro'];

function localize(locale: Locale, zh?: string | null, en?: string | null, fallback = '') {
  if (locale === 'en') {
    return en || zh || fallback;
  }

  return zh || en || fallback;
}

export function getAboutSidebarItems(locale: Locale): SidebarItem[] {
  return [
    {
      label: locale === 'en' ? 'Company Profile' : '公司简介',
      href: `/${locale}/about`,
    },
  ];
}

export function getAboutPageCopy(pageKey: AboutPageKey, locale: Locale) {
  const pageCopy = ABOUT_PAGE_COPY[pageKey];

  return {
    title: pageCopy.title[locale],
    englishTitle: pageCopy.englishTitle,
    subtitle: pageCopy.subtitle[locale],
  };
}

export function getProfileSection(data: AboutApiData | null) {
  if (!data?.sections?.length) return null;

  return (
    data.sections.find((item) => PROFILE_SECTION_KEYS.includes(item.sectionKey)) ||
    data.sections[0] ||
    null
  );
}

export function getCultureValues(data: AboutApiData | null) {
  return data?.culture ?? [];
}

export function getTimelineItems(data: AboutApiData | null) {
  return data?.timeline ?? [];
}

export function getChairmanMessage(data: AboutApiData | null) {
  return data?.chairman ?? null;
}

export function getAboutBannerImage(pageKey: AboutPageKey, data: AboutApiData | null) {
  void pageKey;
  void data;
  return '/images/about/about_img_hero_factory_01.png';
}

function resolveMetadataSource(pageKey: AboutPageKey, data: AboutApiData | null) {
  if (!data) return null;

  switch (pageKey) {
    case 'profile':
      return getProfileSection(data);
    case 'chairman':
      return getChairmanMessage(data);
    case 'culture':
      return getCultureValues(data)[0] || null;
    case 'timeline':
      return getTimelineItems(data)[0] || null;
    default:
      return null;
  }
}

export async function createAboutPageMetadata(
  pageKey: AboutPageKey,
  locale: Locale,
  pathOverride?: string,
): Promise<Metadata> {
  const source = resolveMetadataSource(pageKey, null);
  const pageCopy = getAboutPageCopy(pageKey, locale);
  const title =
    localize(locale, source?.seoTitleZh, source?.seoTitleEn, pageCopy.title) || pageCopy.title;
  const description =
    localize(
      locale,
      source?.seoDescriptionZh,
      source?.seoDescriptionEn,
      localize(locale, source?.contentZh, source?.contentEn, pageCopy.subtitle),
    ) || pageCopy.subtitle;
  const image = getAboutBannerImage(pageKey, null);
  const pathMap: Record<AboutPageKey, string> = {
    profile: '/about/profile',
    chairman: '/about/chairman',
    culture: '/about/culture',
    timeline: '/about/timeline',
  };
  const seoPageKeyMap: Record<AboutPageKey, string> = {
    profile: 'about-profile',
    chairman: 'about-chairman',
    culture: 'about-culture',
    timeline: 'about-timeline',
  };

  return buildSeoMetadata({
    locale,
    path: pathOverride || pathMap[pageKey],
    pageKey: seoPageKeyMap[pageKey],
    title,
    description,
    image,
  });
}

export async function getAboutPageSource(locale: Locale) {
  return {
    data: null,
    error: null,
    sidebarTitle: locale === 'en' ? 'About Us' : '关于我们',
    sidebarItems: getAboutSidebarItems(locale),
  };
}

export function localizeAboutText(
  locale: Locale,
  item: AboutSectionApiItem | ChairmanMessageApiItem | CultureValueApiItem | null | undefined,
  field: 'title' | 'content',
  fallback = '',
) {
  if (!item) return fallback;

  if (field === 'title') {
    return localize(locale, item.titleZh, item.titleEn, fallback);
  }

  return localize(locale, item.contentZh, item.contentEn, fallback);
}
