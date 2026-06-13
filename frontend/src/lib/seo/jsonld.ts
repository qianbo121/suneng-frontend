import { STATIC_PRODUCTS } from '@/constants/static-products';
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
  'roller-mesh-belt-line',
  'copper-wire-annealing-line',
  'annealing-solution-line',
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
const LOCAL_BUSINESS_URL = 'https://www.jssngyl.cn/';
const LOCAL_BUSINESS_ID = `${LOCAL_BUSINESS_URL}#organization`;
const PRODUCT_JSON_LD_DESCRIPTIONS: Partial<Record<string, string>> = {
  'roller-mesh-belt-line':
    '托辊型网带式电阻炉生产线适用于小型零件、紧固件、标准件和批量连续热处理件的淬火、回火、正火、退火等工艺，网带宽度、运行速度、加热区长度和冷却方式等参数以最终技术方案为准。',
  'copper-wire-annealing-line':
    '铜丝自动化退火生产线适用于铜丝、铜线和有色金属线材的连续退火、软化处理及按项目评估的光亮退火，线径范围、运行速度、温区长度和气氛保护等参数以最终技术方案为准。',
  'annealing-solution-line':
    '退火固溶生产线适用于不锈钢带材、有色金属带材和连续退火或固溶材料的退火、固溶及连续热处理，带宽、厚度、运行速度、冷却段和张力控制等参数以最终技术方案为准。',
  'trolley-furnace':
    '台车炉适用于大型工件、铸件、焊接件、模具、结构件等周期式热处理场景，可用于退火、回火、正火、淬火加热、时效和去应力处理等工艺，炉膛尺寸、台车承重、加热方式和控制系统需按项目参数确认。',
  'box-furnace':
    '箱式炉适用于中小型零件、模具件、试制件和小批量工件的退火、回火、正火、淬火前加热、时效及去应力处理，炉膛尺寸、装炉量、最高温度和加热方式等参数以最终技术方案为准。',
  'pit-furnace':
    '井式炉适用于轴类、杆类、套筒类、长轴件和竖向装炉工件的淬火、回火、退火、时效及去应力处理，井深、直径、吊装方式、装炉重量和温度均匀性等参数以最终技术方案为准。',
  'bell-furnace':
    '罩式炉适用于卷材、小型零件、批量装框零件和需要罩式加热的工件的退火、回火及按项目评估的保护气氛热处理，炉罩尺寸、密封结构、气氛条件和冷却方式等参数以最终技术方案为准。',
  'pusher-furnace':
    '推杆炉适用于批量连续热处理工件、棒材、坯料和结构件的连续加热、正火、退火及淬火前加热，推料机构、料盘料框、节拍、温区数量和出料方式等参数以最终技术方案为准。',
  'mesh-belt-furnace':
    '网带炉适用于紧固件、小型零件、冲压件、标准件和批量连续热处理件的淬火、回火、退火及正火，网带宽度、运行速度、加热区、冷却方式和气氛需求等参数以最终技术方案为准。',
  'roller-hearth-furnace':
    '辊底炉适用于板材、管材、棒材和中大型连续热处理工件的退火、正火、回火及按项目评估的固溶处理，辊道材质、工件重量、运行速度、温区控制和炉膛密封等参数以最终技术方案为准。',
  'rotary-hearth-furnace':
    '转底炉适用于环形布料、模具、锻件和小中型批量工件的加热、退火、正火、回火及时效处理，炉底直径、旋转机构、装料方式、工件重量和进出料节拍等参数以最终技术方案为准。',
};

function productUrl(slug: string, path?: string) {
  return absoluteUrl(path || `/products/detail/${slug}`);
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
    '@type': 'LocalBusiness',
    '@id': LOCAL_BUSINESS_ID,
    name: COMPANY_NAME,
    legalName: COMPANY_NAME,
    alternateName: ['Jiangsu Suneng Industrial Furnace Co., Ltd.', ...ALTERNATE_NAMES],
    url: LOCAL_BUSINESS_URL,
    logo: SITE_LOGO_IMAGE ? absoluteUrl(SITE_LOGO_IMAGE) : undefined,
    telephone: '+86-130-5298-6814',
    email: 'jssngyl@outlook.com',
    foundingDate: '2006',
    numberOfEmployees: {
      '@type': 'QuantitativeValue',
      minValue: 150,
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: '张甸蔡官工业区',
      addressLocality: '姜堰区',
      addressRegion: '江苏省泰州市',
      addressCountry: 'CN',
      postalCode: '225500',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 32.44,
      longitude: 120.03,
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        opens: '07:30',
        closes: '18:00',
      },
    ],
    areaServed: [
      {
        '@type': 'Place',
        name: 'Worldwide',
      },
      {
        '@type': 'Place',
        name: '全球',
      },
    ],
    description: DEFAULT_DESCRIPTION,
    hasCredential: [
      {
        '@type': 'EducationalOccupationalCredential',
        name: '国家高新技术企业',
        identifier: 'GR202432008987',
      },
      {
        '@type': 'EducationalOccupationalCredential',
        name: 'ISO 9001 质量管理体系认证',
      },
      {
        '@type': 'EducationalOccupationalCredential',
        name: 'ISO 14001 环境管理体系认证',
      },
      {
        '@type': 'EducationalOccupationalCredential',
        name: 'ISO 45001 职业健康安全管理体系认证',
      },
    ],
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

export function getWebsiteJsonLd() {
  return cleanObject({
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    url: `${SITE_URL}/`,
    name: SITE_NAME,
    alternateName: `${SHORT_NAME}官网`,
    inLanguage: 'zh-CN',
    publisher: { '@id': LOCAL_BUSINESS_ID },
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
    about: { '@id': LOCAL_BUSINESS_ID },
    mainEntity: { '@id': LOCAL_BUSINESS_ID },
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
        '苏能工业炉产品中心展示周期式、连续式热处理炉及热处理生产线等工业热处理设备，支持按工艺需求非标定制。',
      isPartOf: { '@id': `${SITE_URL}/#website` },
      about: { '@id': LOCAL_BUSINESS_ID },
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
  const images = absoluteImages(product.image);
  const description = PRODUCT_JSON_LD_DESCRIPTIONS[product.slug] || product.description;

  return cleanObject([
    {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.slug === 'trolley-furnace' ? '台车式热处理炉' : product.name,
      description,
      brand: {
        '@type': 'Brand',
        name: SHORT_NAME,
      },
      manufacturer: {
        '@type': 'Organization',
        name: COMPANY_NAME,
        url: LOCAL_BUSINESS_URL,
      },
      category: '工业炉 / 热处理炉',
      url: pageUrl,
      image: images,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      '@id': webpageId(pageUrl),
      url: pageUrl,
      name: product.name,
      description: product.description,
      isPartOf: { '@id': `${SITE_URL}/#website` },
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
    author: { '@id': LOCAL_BUSINESS_ID },
    publisher: { '@id': LOCAL_BUSINESS_ID },
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
      name: '联系我们｜江苏苏能工业炉联系方式',
      description:
        '联系江苏苏能工业炉有限公司，咨询工业炉设备、热处理炉、节能改造与大修服务。地址：江苏省泰州市姜堰区张甸蔡官工业区，电话/微信：+86-130-5298-6814。',
      isPartOf: { '@id': `${SITE_URL}/#website` },
      about: { '@id': LOCAL_BUSINESS_ID },
      mainEntity: { '@id': LOCAL_BUSINESS_ID },
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
