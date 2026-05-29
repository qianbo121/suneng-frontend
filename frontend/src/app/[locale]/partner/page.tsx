import { JsonLd } from '@/components/JsonLd';
import { PageBanner } from '@/components/layout/PageBanner';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import {
  CooperationFieldItem,
  CorePartnerLogoItem,
  PartnerLogoGrid,
  RelatedPartnerLinkItem,
} from '@/components/partner/PartnerLogoGrid';
import { buildSeoMetadata } from '@/lib/seo';
import { PARTNER_SEO } from '@/lib/seo/page-data';
import { Locale } from '@/types/site';

type PartnerPageProps = {
  params: Promise<{
    locale: string;
  }>;
};

export const revalidate = 3600;

const corePartners: CorePartnerLogoItem[] = [
  {
    id: 1,
    name: '中国恩菲工程技术\n有限公司',
    logoUrl: '/images/partner/logos/enfi.png',
  },
  {
    id: 2,
    name: '中国联合工程\n有限公司',
    logoUrl: '/images/partner/logos/cuec.png',
  },
  {
    id: 3,
    name: '内蒙古北方重工业\n集团有限公司',
    logoUrl: '/images/partner/logos/nhi.png',
  },
  {
    id: 4,
    name: '中集安瑞环科技股份\n有限公司',
    logoUrl: '/images/partner/logos/enric.png',
  },
  {
    id: 5,
    name: '江苏天工工具新材料\n股份有限公司',
    logoUrl: '/images/partner/logos/tg.png',
  },
  {
    id: 6,
    name: '六和轻合金（苏州）\n有限公司',
    logoUrl: '/images/partner/logos/liuhe.png',
  },
  {
    id: 7,
    name: '某青山系不锈钢\n企业',
    logoUrl: '/images/partner/logos/tsingshan.png',
  },
];

const morePartners = [
  '无锡市硕阳不锈钢有限公司',
  '桂林万川电炉输送设备有限公司',
  '河南江河机械有限责任公司',
  '广州菲卓科技有限公司',
  '连云港瑞天富压延有限公司',
  '上海明亨管件机械有限公司',
  '湖北三十五机械有限责任公司',
  '宁波金球机电铸造有限公司',
  '东台市远洋不锈钢制造有限公司',
  '冀阳五二五泵业有限公司',
  '德世博尔（江苏）机器人技术有限公司',
  '东台市远洋船舶配件有限公司',
  '大连华辉液压管件有限公司',
  '无锡市宏翔特种钢管有限公司',
  '泰州市创鑫金属热处理有限公司',
  '安徽弘鑫金属复合材料科技有限公司',
  '镇江建华轴承有限公司',
  '苏州轻装智能制造科技有限公司',
  '山东聚宁机械有限公司',
  '东台中海高温合金科技有限公司',
  '铜陵欣诺科新材料有限公司',
  '南通中集能源装备有限公司',
  '安徽毅霖翔烨科技有限公司',
  '靖江泰通紧固件制造有限公司',
  '南通久鸥贸易有限公司',
  '宝应县新智宇机械有限公司',
  '江苏兴洋管业股份有限公司',
  '仪昌节流装置制造（江苏）有限公司',
  '桂林万川电路输送设备有限公司',
  '扬州华宇管件有限公司',
  '中集安瑞环科技股份有限公司',
  '六和轻合金（苏州）有限公司',
  '中国联合工程有限公司',
  '中国兵器工业集团江山重工研究院有限公司',
  '天津航天长征火箭制造有限公司',
];

const cooperationFields: CooperationFieldItem[] = [
  {
    id: 1,
    title: '不锈钢与有色金属热处理',
    description:
      '涵盖不锈钢连续退火、固溶、光亮退火，以及铜、铝等有色金属的退火处理，应用于不锈钢深加工、有色金属带材、线材等场景。',
    iconUrl: '/images/partner/fields/stainless-smelting.png',
    furnaceTypes: '退火固溶生产线、光亮退火炉、网带炉',
    links: [
      { label: '退火固溶生产线', href: '/zh/products/detail/annealing-solution-line' },
      { label: '网带炉', href: '/zh/products/detail/mesh-belt-furnace' },
      { label: '工业炉节能改造案例参考', href: '/zh/case/anonymous-tsingshan-1250-renovation' },
    ],
  },
  {
    id: 2,
    title: '重工机械与装备制造',
    description:
      '覆盖船舶制造、轨道交通、工程机械、重工装备等行业的大型零部件热处理装备需求，常用于大型铸件、锻件、结构件的退火、回火、正火、去应力处理。',
    iconUrl: '/images/partner/fields/heavy-equipment.png',
    furnaceTypes: '台车炉、井式炉、辊底炉',
    links: [
      { label: '台车炉', href: '/zh/products/detail/trolley-furnace' },
      { label: '井式炉', href: '/zh/products/detail/pit-furnace' },
      { label: '辊底炉', href: '/zh/products/detail/roller-hearth-furnace' },
    ],
  },
  {
    id: 3,
    title: '汽车零部件',
    description:
      '服务汽车零部件企业的热处理需求，涵盖齿轮、轴承、紧固件、高强钢零件的退火、回火、淬火、渗碳等工艺。',
    iconUrl: '/images/partner/fields/auto-parts.png',
    furnaceTypes: '网带炉、推杆炉、箱式炉',
    links: [
      { label: '网带炉', href: '/zh/products/detail/mesh-belt-furnace' },
      { label: '推杆炉', href: '/zh/products/detail/pusher-furnace' },
      { label: '箱式炉', href: '/zh/products/detail/box-furnace' },
    ],
  },
  {
    id: 4,
    title: '能源装备与相关制造场景',
    description:
      '服务石化设备、压力容器、油气管材、风电零部件等能源装备及相关制造场景的热处理装备需求。',
    iconUrl: '/images/partner/fields/new-energy-storage.png',
    furnaceTypes: '台车炉、辊底炉、网带炉',
    links: [
      { label: '台车炉', href: '/zh/products/detail/trolley-furnace' },
      { label: '辊底炉', href: '/zh/products/detail/roller-hearth-furnace' },
    ],
  },
  {
    id: 5,
    title: '管阀部件与流体装备',
    description: '应用于阀门、管件、法兰等流体设备零部件的热处理，常见去应力、退火、调质等工艺。',
    iconUrl: '/images/partner/fields/fluid-equipment.png',
    furnaceTypes: '台车炉、井式炉、箱式炉',
    links: [
      { label: '台车炉', href: '/zh/products/detail/trolley-furnace' },
      { label: '井式炉', href: '/zh/products/detail/pit-furnace' },
    ],
  },
  {
    id: 6,
    title: '铸造、热处理与金属加工',
    description: '服务铸造、热处理加工及金属精密加工企业，涵盖多种材质和工艺的热处理装备需求。',
    iconUrl: '/images/partner/fields/metal-processing.png',
    furnaceTypes: '箱式炉、罩式炉、台车炉',
    links: [
      { label: '箱式炉', href: '/zh/products/detail/box-furnace' },
      { label: '罩式炉', href: '/zh/products/detail/bell-furnace' },
    ],
  },
];

const relatedLinks: RelatedPartnerLinkItem[] = [
  {
    title: '工业炉节能改造与热处理炉大修服务',
    href: '/zh/service/furnace-renovation-overhaul',
    description: '了解在役工业炉节能改造、整炉大修、控制系统升级和耐材翻新服务范围。',
  },
  {
    title: '某青山系不锈钢企业 1250mm 三线节能改造案例',
    href: '/zh/case/anonymous-tsingshan-1250-renovation',
    description: '查看不锈钢连续退洗线节能改造案例，作为同类工业炉改造项目参考。',
  },
  {
    title: '江苏苏能工业炉有限公司介绍',
    href: '/zh/about/suneng-profile',
    description: '了解苏能工业炉的主营产品、资质专利、项目数据与业务边界。',
  },
  {
    title: '荣誉资质',
    href: '/zh/strength/honors',
    description: '查看企业资质、体系认证与 14 项已授权专利证书资料。',
  },
];

const partnerCollectionJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: '合作关系与行业应用 - 苏能工业炉',
  description:
    '苏能工业炉服务的多行业工业炉项目与应用场景，涵盖不锈钢与有色金属、重工机械与装备制造、汽车零部件、能源装备、管阀部件、金属热处理加工等领域。',
  url: 'https://www.jssngyl.cn/zh/partner',
  isPartOf: {
    '@type': 'WebSite',
    name: '江苏苏能工业炉有限公司',
    url: 'https://www.jssngyl.cn',
  },
  about: [
    { '@type': 'Thing', name: '不锈钢与有色金属热处理' },
    { '@type': 'Thing', name: '重工机械与装备制造' },
    { '@type': 'Thing', name: '汽车零部件热处理' },
    { '@type': 'Thing', name: '能源装备制造场景' },
  ],
};

export async function generateMetadata({ params }: PartnerPageProps) {
  const { locale } = await params;
  const currentLocale = (locale === 'en' ? 'en' : 'zh') as Locale;

  return buildSeoMetadata({
    locale: currentLocale,
    path: '/partner',
    pageKey: 'partner',
    title: currentLocale === 'en' ? 'Partners' : PARTNER_SEO.title,
    description:
      currentLocale === 'en'
        ? 'Industrial furnace cooperation and application scenarios across manufacturing sectors.'
        : PARTNER_SEO.description,
    keywords: PARTNER_SEO.keywords,
    image: '/images/partner/partner-hero.png',
  });
}

export default async function PartnerPage({ params }: PartnerPageProps) {
  const { locale } = await params;
  const currentLocale = (locale === 'en' ? 'en' : 'zh') as Locale;
  const title = currentLocale === 'en' ? 'Partners' : '合作关系与行业应用';

  return (
    <div className="bg-white pb-10 lg:pb-0">
      {currentLocale === 'zh' ? (
        <JsonLd id="partner-collection-jsonld" data={partnerCollectionJsonLd} />
      ) : null}
      <PageBanner
        locale={locale}
        title={title}
        englishTitle="Partners"
        subtitle={
          currentLocale === 'en'
            ? 'Industrial furnace cooperation and application scenarios across manufacturing sectors'
            : '服务多行业工业炉项目，覆盖装备制造、不锈钢、有色金属、汽车零部件、能源装备等应用场景。'
        }
        backgroundImage="/images/partner/partner-hero.png"
        variant="about"
      />

      <div className="border-b border-[#e5e5e5] bg-white">
        <div className="mx-auto flex min-h-[54px] max-w-[1660px] items-center px-6 lg:px-[86px]">
          <Breadcrumb locale={locale} currentLabel={title} tone="dark" className="text-[13px]" />
        </div>
      </div>

      <main className="mx-auto max-w-[1660px] px-6 py-10 lg:px-[86px] lg:py-12">
        <PartnerLogoGrid
          locale={currentLocale}
          coreItems={corePartners}
          moreItems={morePartners}
          fieldItems={cooperationFields}
          relatedLinks={relatedLinks}
        />
      </main>
    </div>
  );
}
