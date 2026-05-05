import { STATIC_PRODUCTS } from '@/constants/static-products';
import {
  ALTERNATE_NAMES,
  BAIDU_APP_ID,
  COMPANY_NAME,
  COMPANY_PHONE,
  DEFAULT_DESCRIPTION,
  SHORT_NAME,
  SITE_LOGO_IMAGE,
  SITE_NAME,
  SITE_URL,
} from '@/lib/seo/config';
import { absoluteUrl } from '@/lib/seo/metadata';

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
};

export type ArticleJsonLdInput = {
  slug: string;
  path?: string;
  headline: string;
  description: string;
  image?: string;
  datePublished: string;
  dateModified?: string;
};

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

const PRODUCT_SCHEMA_ORDER = [
  'trolley-furnace',
  'box-furnace',
  'pit-furnace',
  'bell-furnace',
  'mesh-belt-furnace',
  'roller-hearth-furnace',
  'pusher-furnace',
  'rotary-hearth-furnace',
];

const productBySlug = new Map(STATIC_PRODUCTS.map((product) => [product.slug, product]));

function productUrl(slug: string, path?: string) {
  return absoluteUrl(path || `/products/detail/${slug}`);
}

function productId(slug: string, path?: string) {
  return `${productUrl(slug, path)}#product`;
}

function webpageId(url: string) {
  return `${url}#webpage`;
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

export function getOrganizationJsonLd() {
  return cleanObject({
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: COMPANY_NAME,
    legalName: COMPANY_NAME,
    alternateName: ALTERNATE_NAMES,
    url: `${SITE_URL}/`,
    logo: SITE_LOGO_IMAGE ? absoluteUrl(SITE_LOGO_IMAGE) : undefined,
    telephone: COMPANY_PHONE,
    description: DEFAULT_DESCRIPTION,
    knowsAbout: [
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
      '退火（Annealing）',
      '回火（Tempering）',
      '正火（Normalizing）',
      '淬火（Quenching）',
      '非标工业炉定制',
      '非标热处理设备',
    ],
  });
}

export function getWebsiteJsonLd() {
  return cleanObject({
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    url: `${SITE_URL}/`,
    name: SITE_NAME,
    alternateName: `${SHORT_NAME}官网`,
    inLanguage: 'zh-CN',
    publisher: { '@id': `${SITE_URL}/#organization` },
  });
}

export function getHomePageJsonLd(path = '/') {
  const pageUrl = absoluteUrl(path);

  return cleanObject({
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': webpageId(pageUrl),
    url: pageUrl,
    name: '江苏苏能工业炉有限公司｜工业炉与热处理设备厂家',
    description: DEFAULT_DESCRIPTION,
    isPartOf: { '@id': `${SITE_URL}/#website` },
    about: { '@id': `${SITE_URL}/#organization` },
    mainEntity: { '@id': `${SITE_URL}/#organization` },
    inLanguage: 'zh-CN',
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

export function getProductCollectionJsonLd(path = '/products') {
  const pageUrl = absoluteUrl(path);
  const products = PRODUCT_SCHEMA_ORDER.map((slug) => productBySlug.get(slug)).filter(Boolean);
  const itemListId = `${pageUrl}#itemlist`;

  return cleanObject([
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      '@id': webpageId(pageUrl),
      url: pageUrl,
      name: '产品中心｜工业热处理设备与非标工业炉定制',
      description:
        '苏能工业炉产品中心展示台车式热处理炉、箱式炉、井式炉、罩式炉、网带炉、辊底炉、推杆炉、转底炉等工业热处理设备，支持按工艺需求非标定制。',
      isPartOf: { '@id': `${SITE_URL}/#website` },
      about: { '@id': `${SITE_URL}/#organization` },
      mainEntity: { '@id': itemListId },
      inLanguage: 'zh-CN',
    },
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      '@id': itemListId,
      itemListElement: products.map((product, index) => {
        const url = productUrl(product!.slug, `${path.replace(/\/+$/, '')}/detail/${product!.slug}`);

        return {
          '@type': 'ListItem',
          position: index + 1,
          name: product!.name.zh,
          url,
          item: {
            '@type': 'ProductModel',
            name: product!.name.zh,
            url,
          },
        };
      }),
    },
    getBreadcrumbJsonLd([
      { name: '首页', url: '/' },
      { name: '产品中心', url: path },
    ]),
  ]);
}

export function getProductDetailJsonLd(product: ProductDetailJsonLdInput) {
  const pageUrl = productUrl(product.slug, product.path);
  const productSchemaId = productId(product.slug, product.path);
  const images = absoluteImages(product.image);
  const additionalProperty = product.additionalProperties?.map((property) => ({
    '@type': 'PropertyValue',
    name: property.name,
    value: property.value,
    unitText: property.unitText,
  }));

  return cleanObject([
    {
      '@context': 'https://schema.org',
      '@type': 'ProductModel',
      '@id': productSchemaId,
      name: product.name,
      alternateName: product.alternateName,
      url: pageUrl,
      image: images,
      description: product.description,
      category: '工业热处理设备',
      brand: { '@id': `${SITE_URL}/#organization` },
      manufacturer: { '@id': `${SITE_URL}/#organization` },
      keywords: product.keywords,
      additionalProperty,
      offers: {
        '@type': 'Offer',
        url: pageUrl,
        availability: 'https://schema.org/InStock',
        priceCurrency: 'CNY',
        businessFunction: 'https://schema.org/Sell',
        priceSpecification: {
          '@type': 'PriceSpecification',
          description: '非标定制设备，价格根据炉膛尺寸、温度范围、承重、加热方式、控温系统及工艺要求核算',
        },
        seller: { '@id': `${SITE_URL}/#organization` },
      },
      mainEntityOfPage: { '@id': webpageId(pageUrl) },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      '@id': webpageId(pageUrl),
      url: pageUrl,
      name: product.name,
      description: product.description,
      isPartOf: { '@id': `${SITE_URL}/#website` },
      about: { '@id': productSchemaId },
      mainEntity: { '@id': productSchemaId },
      inLanguage: 'zh-CN',
    },
    getBreadcrumbJsonLd([
      { name: '首页', url: '/' },
      { name: '产品中心', url: product.path?.split('/detail/')[0] || '/products' },
      { name: product.name, url: product.path || `/products/detail/${product.slug}` },
    ]),
  ]);
}

export function getArticleJsonLd(article: ArticleJsonLdInput) {
  const pageUrl = absoluteUrl(article.path || `/news/${article.slug}`);
  const dateModified = article.dateModified || article.datePublished;

  return cleanObject({
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.headline,
    description: article.description,
    image: article.image ? absoluteUrl(article.image) : undefined,
    datePublished: article.datePublished,
    dateModified,
    author: { '@id': `${SITE_URL}/#organization` },
    publisher: { '@id': `${SITE_URL}/#organization` },
    mainEntityOfPage: pageUrl,
    inLanguage: 'zh-CN',
  });
}

export function getContactPageJsonLd(path = '/contact') {
  const pageUrl = absoluteUrl(path);

  return cleanObject([
    {
      '@context': 'https://schema.org',
      '@type': 'ContactPage',
      '@id': webpageId(pageUrl),
      url: pageUrl,
      name: '联系我们｜工业炉与热处理设备方案咨询',
      description:
        '联系江苏苏能工业炉有限公司，咨询台车炉、箱式炉、井式炉、罩式炉、网带炉、辊底炉、推杆炉、转底炉等工业热处理设备定制方案。',
      isPartOf: { '@id': `${SITE_URL}/#website` },
      about: { '@id': `${SITE_URL}/#organization` },
      mainEntity: { '@id': `${SITE_URL}/#organization` },
      inLanguage: 'zh-CN',
    },
    getBreadcrumbJsonLd([
      { name: '首页', url: '/' },
      { name: '联系我们', url: path },
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
