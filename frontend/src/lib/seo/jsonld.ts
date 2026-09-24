import { translateLineValue } from '@/lib/production-line-content-en';
import { homeSingleFurnaces } from '@/lib/home-product-types';
import { continuousFurnaceCards, periodicFurnaceCards, productCenterProductionLines } from '@/lib/products-landing-data';
import {
  ALTERNATE_NAMES,
  BAIDU_APP_ID,
  COMPANY_NAME,
  DEFAULT_DESCRIPTION,
  SHORT_NAME,
  SITE_LOGO_IMAGE,
  SITE_NAME,
  SITE_URL,
} from '@/lib/seo/config';
import { absoluteUrl } from '@/lib/seo/metadata';
import { siteSettings } from '@/mock/siteSettings';
import type { Locale } from '@/types/site';

export type ProductDetailJsonLdInput = {
  slug: string;
  name: string;
  path?: string;
  alternateName?: string[];
  description: string;
  image?: string | string[];
  keywords?: string[];
  additionalProperties?: Array<{
    name: string;
    value: string;
    unitText?: string;
  }>;
  dateModified?: string;
  reviewedByTechnicalEngineer?: boolean;
};

export type ArticleJsonLdInput = {
  slug: string;
  path?: string;
  headline: string;
  description: string;
  image?: string;
  datePublished: string;
  dateModified?: string;
  reviewedByTechnicalEngineer?: boolean;
  reviewerName?: TechnicalReviewerName;
};

export type TechnicalReviewerName = '唐工' | '王工';

export type FaqJsonLdItem = {
  question: string;
  answer: string;
};

export type BaiduCambrianInput = {
  url: string;
  title: string;
  description: string;
  images?: string[];
  pubDate?: string;
};

const LOCAL_BUSINESS_URL = 'https://www.jssngyl.cn/';
const LOCAL_BUSINESS_ID = `${LOCAL_BUSINESS_URL}#organization`;
const TECHNICAL_REVIEWER_IDS: Record<TechnicalReviewerName, string> = {
  唐工: `${LOCAL_BUSINESS_URL}#technical-reviewer-tang`,
  王工: `${LOCAL_BUSINESS_URL}#technical-reviewer-wang`,
};
const HOME_PAGE_EN_DESCRIPTION =
  'Jiangsu Suneng Industrial Furnace (founded 2006, Taizhou, Jiangsu) custom-engineers heat-treatment furnaces — box, bogie-hearth, pit, mesh-belt, roller-hearth and pusher furnaces, continuous heat-treatment lines, plus furnace energy-saving retrofit and overhaul.';
const PRODUCT_COLLECTION_EN_DESCRIPTION =
  "Browse Suneng's heat-treatment furnaces and custom industrial furnaces: box, bogie-hearth, pit, bell-type, mesh-belt, roller-hearth, pusher and rotary-hearth furnaces, plus continuous heat-treatment lines.";

function productUrl(slug: string, path?: string) {
  return absoluteUrl(path || `/products/detail/${slug}`);
}

function webpageId(url: string) {
  return `${url}#webpage`;
}

function isEnglishLocale(locale: Locale) {
  return locale === 'en';
}

function schemaLanguage(locale: Locale) {
  return isEnglishLocale(locale) ? 'en-US' : 'zh-CN';
}

export function getTechnicalReviewerJsonLd(name: TechnicalReviewerName = '唐工') {
  return {
    '@type': 'Person',
    '@id': TECHNICAL_REVIEWER_IDS[name],
    name,
    worksFor: { '@id': LOCAL_BUSINESS_ID },
  };
}

export function cleanObject<T>(value: T): T {
  if (Array.isArray(value)) {
    return value
      .map((item) => cleanObject(item))
      .filter((item) => {
        if (item == null) return false;
        if (typeof item === 'string') return item.trim().length > 0;
        if (Array.isArray(item)) return item.length > 0;
        if (typeof item === 'object') return Object.keys(item).length > 0;
        return true;
      }) as T;
  }

  if (value && typeof value === 'object') {
    const result: Record<string, unknown> = {};

    for (const [key, item] of Object.entries(value)) {
      if (item == null) continue;
      if (typeof item === 'string' && item.trim().length === 0) continue;

      const cleaned = cleanObject(item);

      if (Array.isArray(cleaned) && cleaned.length === 0) continue;
      if (cleaned && typeof cleaned === 'object' && !Array.isArray(cleaned) && Object.keys(cleaned).length === 0) {
        continue;
      }

      result[key] = cleaned;
    }

    return result as T;
  }

  return value;
}

function absoluteImages(image?: string | string[]) {
  if (!image) return undefined;
  const images = Array.isArray(image) ? image : [image];
  const resolved = images.filter(Boolean).map((item) => absoluteUrl(item));
  return resolved.length ? resolved : undefined;
}

export function getOrganizationJsonLd(locale: Locale = 'zh') {
  const isEnglish = isEnglishLocale(locale);
  const englishCompanyName = 'Jiangsu Suneng Industrial Furnace Co., Ltd.';

  return cleanObject({
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': LOCAL_BUSINESS_ID,
    name: isEnglish ? englishCompanyName : COMPANY_NAME,
    legalName: isEnglish ? englishCompanyName : COMPANY_NAME,
    alternateName: isEnglish ? [COMPANY_NAME, ...ALTERNATE_NAMES] : [englishCompanyName, ...ALTERNATE_NAMES],
    url: LOCAL_BUSINESS_URL,
    logo: SITE_LOGO_IMAGE ? absoluteUrl(SITE_LOGO_IMAGE) : undefined,
    telephone: siteSettings.salesPhone,
    email: siteSettings.email,
    foundingDate: '2006-12-22',
    identifier: {
      '@type': 'PropertyValue',
      propertyID: isEnglish ? 'Unified Social Credit Code' : '统一社会信用代码',
      value: '91321204796529654Q',
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: isEnglish ? 'Cai Guan Industrial Zone, Zhangdian, Jiangyan District' : '张甸蔡官工业区',
      addressLocality: isEnglish ? 'Taizhou' : '姜堰区',
      addressRegion: isEnglish ? 'Jiangsu' : '江苏省泰州市',
      addressCountry: 'CN',
    },
    areaServed: [
      {
        '@type': 'Place',
        name: 'Worldwide',
      },
      ...(isEnglish
        ? []
        : [
            {
              '@type': 'Place',
              name: '全球',
            },
          ]),
    ],
    description: isEnglish
      ? 'Jiangsu Suneng Industrial Furnace, founded on December 22, 2006 in Taizhou, Jiangsu, is a National High-Tech Enterprise specializing in custom heat-treatment furnace design and manufacturing.'
      : DEFAULT_DESCRIPTION,
    hasCredential: [
      {
        '@type': 'EducationalOccupationalCredential',
        name: isEnglish ? 'National High-Tech Enterprise' : '国家高新技术企业',
        identifier: 'GR202432008987',
      },
      {
        '@type': 'EducationalOccupationalCredential',
        name: isEnglish ? 'ISO 9001 Quality Management System certification' : 'ISO 9001 质量管理体系认证',
        identifier: '03824Q60289R3S',
      },
    ],
    knowsAbout: isEnglish
      ? [
          'industrial furnace',
          'heat treatment furnace',
          'industrial electric furnace',
          'heat-treatment equipment',
          'bogie-hearth furnace',
          'box furnace',
          'pit furnace',
          'bell furnace',
          'mesh-belt furnace',
          'roller-hearth furnace',
          'pusher furnace',
          'rotary-hearth furnace',
          'heat-treatment line',
          'annealing line',
          'continuous heat-treatment line',
          'annealing',
          'tempering',
          'normalizing',
          'quenching',
          'custom industrial furnace',
          'custom heat-treatment equipment',
        ]
      : [
          '工业炉',
          '热处理炉',
          '工业电炉',
          '热处理设备',
          '台车炉',
          '箱式炉',
          '井式炉',
          '罩式炉',
          '网带炉',
          '辊底炉',
          '推杆炉',
          '转底炉',
          '热处理生产线',
          '退火生产线',
          '连续式热处理生产线',
          '退火（Annealing）',
          '回火（Tempering）',
          '正火（Normalizing）',
          '淬火（Quenching）',
          '非标工业炉定制',
          '非标热处理设备',
        ],
  });
}

export function getWebsiteJsonLd(locale: Locale = 'zh') {
  const isEnglish = isEnglishLocale(locale);

  return cleanObject({
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    url: `${SITE_URL}/`,
    name: isEnglish ? 'Jiangsu Suneng Industrial Furnace Co., Ltd.' : SITE_NAME,
    alternateName: isEnglish ? 'Suneng Industrial Furnace' : `${SHORT_NAME}官网`,
    inLanguage: schemaLanguage(locale),
    publisher: { '@id': LOCAL_BUSINESS_ID },
  });
}

export function getHomePageJsonLd(path = '/', locale: Locale = 'zh') {
  const isEnglish = isEnglishLocale(locale);
  const pageUrl = absoluteUrl(path);

  return cleanObject({
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': webpageId(pageUrl),
    url: pageUrl,
    name: isEnglish
      ? 'Jiangsu Suneng Industrial Furnace Co., Ltd. | Industrial Furnace & Heat-Treatment Equipment Manufacturer'
      : '江苏苏能工业炉有限公司｜工业炉与热处理设备厂家',
    description: isEnglish ? HOME_PAGE_EN_DESCRIPTION : DEFAULT_DESCRIPTION,
    isPartOf: { '@id': `${SITE_URL}/#website` },
    about: { '@id': LOCAL_BUSINESS_ID },
    mainEntity: { '@id': LOCAL_BUSINESS_ID },
    inLanguage: schemaLanguage(locale),
  });
}

export function getWebPageJsonLd({
  path,
  name,
  description,
  locale = 'zh',
  mainEntityId,
  dateModified,
  reviewedByTechnicalEngineer = false,
}: {
  path: string;
  name: string;
  description?: string;
  locale?: Locale;
  mainEntityId?: string;
  dateModified?: string;
  reviewedByTechnicalEngineer?: boolean;
}) {
  const pageUrl = absoluteUrl(path);

  return cleanObject({
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': webpageId(pageUrl),
    url: pageUrl,
    name,
    description,
    isPartOf: { '@id': `${SITE_URL}/#website` },
    about: { '@id': LOCAL_BUSINESS_ID },
    mainEntity: mainEntityId ? { '@id': mainEntityId } : undefined,
    dateModified,
    reviewedBy: reviewedByTechnicalEngineer ? getTechnicalReviewerJsonLd() : undefined,
    inLanguage: schemaLanguage(locale),
  });
}

export function getBreadcrumbJsonLd(items: Array<{ name: string; url: string }>) {
  return cleanObject({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.url),
    })),
  });
}

export function getProductCollectionJsonLd(path = '/products', locale: Locale = 'zh') {
  const isEnglish = isEnglishLocale(locale);
  const pageUrl = absoluteUrl(path);
  const products = [
    ...productCenterProductionLines.map((product) => ({
      slug: product.id,
      name: isEnglish ? translateLineValue(product.name) : product.name,
    })),
    ...[...periodicFurnaceCards, ...continuousFurnaceCards].map((product) => ({
      slug: product.id,
      name: isEnglish
        ? homeSingleFurnaces.find((furnace) => furnace.id === product.id)!.nameEn
        : product.name,
    })),
  ];
  const itemListId = `${pageUrl}#itemlist`;

  return cleanObject([
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      '@id': webpageId(pageUrl),
      url: pageUrl,
      name: isEnglish
        ? 'Product Center | Heat-Treatment Equipment & Custom Industrial Furnaces'
        : '产品中心｜工业热处理设备与非标工业炉定制',
      description: isEnglish
        ? PRODUCT_COLLECTION_EN_DESCRIPTION
        : '苏能工业炉产品中心展示周期式、连续式热处理炉及热处理生产线等工业热处理设备，支持按工艺需求非标定制。',
      isPartOf: { '@id': `${SITE_URL}/#website` },
      about: { '@id': LOCAL_BUSINESS_ID },
      mainEntity: { '@id': itemListId },
      inLanguage: schemaLanguage(locale),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      '@id': itemListId,
      itemListElement: products.map((product, index) => {
        const url = productUrl(product.slug, `${path.replace(/\/+$/, '')}/detail/${product.slug}`);

        return {
          '@type': 'ListItem',
          position: index + 1,
          name: product.name,
          url,
          item: {
            '@type': 'ProductModel',
            name: product.name,
            url,
          },
        };
      }),
    },
    getBreadcrumbJsonLd([
      { name: isEnglish ? 'Home' : '首页', url: isEnglish ? '/en' : '/zh' },
      { name: isEnglish ? 'Product Center' : '产品中心', url: path },
    ]),
  ]);
}

export function getProductDetailJsonLd(product: ProductDetailJsonLdInput, locale: Locale = 'zh') {
  const isEnglish = isEnglishLocale(locale);
  const pageUrl = productUrl(product.slug, product.path);
  const productId = `${pageUrl}#product`;
  const images = absoluteImages(product.image);
  const description = product.description;

  return cleanObject([
    {
      '@context': 'https://schema.org',
      '@type': 'Product',
      '@id': productId,
      name: !isEnglish && product.slug === 'trolley-furnace' ? '台车式热处理炉' : product.name,
      alternateName: product.alternateName,
      description,
      keywords: product.keywords,
      brand: {
        '@type': 'Brand',
        name: isEnglish ? 'Suneng Industrial Furnace' : SHORT_NAME,
      },
      manufacturer: { '@id': LOCAL_BUSINESS_ID },
      category: isEnglish ? 'Industrial Furnace / Heat-Treatment Furnace' : '工业炉 / 热处理炉',
      url: pageUrl,
      image: images,
      additionalProperty: product.additionalProperties?.map((item) => ({
        '@type': 'PropertyValue',
        name: item.name,
        value: item.value,
        unitText: item.unitText,
      })),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      '@id': webpageId(pageUrl),
      url: pageUrl,
      name: product.name,
      description: product.description,
      isPartOf: { '@id': `${SITE_URL}/#website` },
      about: { '@id': LOCAL_BUSINESS_ID },
      mainEntity: { '@id': productId },
      dateModified: product.dateModified,
      reviewedBy: product.reviewedByTechnicalEngineer ? getTechnicalReviewerJsonLd() : undefined,
      inLanguage: schemaLanguage(locale),
    },
    getBreadcrumbJsonLd([
      { name: isEnglish ? 'Home' : '首页', url: isEnglish ? '/en' : '/zh' },
      { name: isEnglish ? 'Product Center' : '产品中心', url: product.path?.split('/detail/')[0] || '/products' },
      { name: product.name, url: product.path || `/products/detail/${product.slug}` },
    ]),
  ]);
}

export function getArticleJsonLd(article: ArticleJsonLdInput, locale: Locale = 'zh') {
  const pageUrl = absoluteUrl(article.path || `/news/${article.slug}`);
  const dateModified = article.dateModified || article.datePublished;

  return cleanObject({
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': `${pageUrl}#article`,
    url: pageUrl,
    headline: article.headline,
    description: article.description,
    image: article.image ? absoluteUrl(article.image) : undefined,
    datePublished: article.datePublished,
    dateModified,
    author: { '@id': LOCAL_BUSINESS_ID },
    reviewedBy: article.reviewerName
      ? getTechnicalReviewerJsonLd(article.reviewerName)
      : article.reviewedByTechnicalEngineer
        ? getTechnicalReviewerJsonLd()
        : undefined,
    publisher: { '@id': LOCAL_BUSINESS_ID },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': webpageId(pageUrl),
      url: pageUrl,
      isPartOf: { '@id': `${SITE_URL}/#website` },
      about: { '@id': LOCAL_BUSINESS_ID },
      mainEntity: { '@id': `${pageUrl}#article` },
    },
    inLanguage: schemaLanguage(locale),
  });
}

export function getContactPageJsonLd(path = '/contact', locale: 'zh' | 'en' = 'zh') {
  const pageUrl = absoluteUrl(path);
  const isEnglish = locale === 'en';

  return cleanObject([
    {
      '@context': 'https://schema.org',
      '@type': 'ContactPage',
      '@id': webpageId(pageUrl),
      url: pageUrl,
      name: isEnglish
        ? 'Contact Us | Jiangsu Suneng Industrial Furnace Co., Ltd.'
        : '联系我们｜江苏苏能工业炉联系方式',
      description: isEnglish
        ? 'Contact Jiangsu Suneng Industrial Furnace Co., Ltd. for industrial furnace equipment, heat treatment furnaces, energy-saving retrofit and overhaul services. Address: Cai Guan Industrial Zone, Zhangdian, Jiangyan District, Taizhou, Jiangsu. Phone / WeChat: +86-130-5298-6814.'
        : '联系江苏苏能工业炉有限公司，咨询工业炉设备、热处理炉、节能改造与大修服务。地址：江苏省泰州市姜堰区张甸蔡官工业区，电话/微信：+86-130-5298-6814。',
      isPartOf: { '@id': `${SITE_URL}/#website` },
      about: { '@id': LOCAL_BUSINESS_ID },
      mainEntity: { '@id': LOCAL_BUSINESS_ID },
      inLanguage: isEnglish ? 'en-US' : 'zh-CN',
    },
    getBreadcrumbJsonLd([
      { name: isEnglish ? 'Home' : '首页', url: isEnglish ? '/en' : '/zh' },
      { name: isEnglish ? 'Contact Us' : '联系我们', url: path },
    ]),
  ]);
}

export function getFaqJsonLd(items: FaqJsonLdItem[]) {
  return cleanObject({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  });
}

export function getBaiduCambrianJsonLd(page: BaiduCambrianInput) {
  if (!BAIDU_APP_ID) return undefined;

  return cleanObject({
    '@context': 'https://ziyuan.baidu.com/contexts/cambrian.jsonld',
    '@id': absoluteUrl(page.url),
    appid: BAIDU_APP_ID,
    title: page.title,
    images: page.images?.map((image) => absoluteUrl(image)),
    description: page.description,
    pubDate: page.pubDate,
  });
}
