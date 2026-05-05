import { PageBanner } from '@/components/layout/PageBanner';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { CooperationFieldItem, CorePartnerLogoItem, PartnerLogoGrid } from '@/components/partner/PartnerLogoGrid';
import { buildSeoMetadata } from '@/lib/seo';
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
    name: '中国兵器工业集团\n江山重工研究院有限公司',
    logoUrl: '/images/partner/logos/cngc.png',
  },
  {
    id: 5,
    name: '中集安瑞环科技股份\n有限公司',
    logoUrl: '/images/partner/logos/enric.png',
  },
  {
    id: 6,
    name: '江苏天工工具新材料\n股份有限公司',
    logoUrl: '/images/partner/logos/tg.png',
  },
  {
    id: 7,
    name: '天津航天长征火箭\n制造有限公司',
    logoUrl: '/images/partner/logos/casc.png',
  },
  {
    id: 8,
    name: '六和轻合金（苏州）\n有限公司',
    logoUrl: '/images/partner/logos/liuhe.png',
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
];

const cooperationFields: CooperationFieldItem[] = [
  {
    id: 1,
    title: '工贸类合金炉领域',
    description: '涵盖有色、黑色金属冶炼、退火、热处理工业炉等',
    iconUrl: '/images/partner/fields/trade-alloy.png',
  },
  {
    id: 2,
    title: '重工机械与装备制造',
    description: '覆盖冶金、船舶制造、轨道交通等工业设备',
    iconUrl: '/images/partner/fields/heavy-equipment.png',
  },
  {
    id: 3,
    title: '不锈钢冶炼与精炼炉',
    description: '涵盖不锈钢冶炼、精炼、镍及合金熔炼等工业炉',
    iconUrl: '/images/partner/fields/stainless-smelting.png',
  },
  {
    id: 4,
    title: '管阀部件与流体装备',
    description: '应用于阀门、管件、法兰等流体设备热处理',
    iconUrl: '/images/partner/fields/fluid-equipment.png',
  },
  {
    id: 5,
    title: '新能源与储能装备',
    description: '服务新能源电池、储能设备及电池材料等企业',
    iconUrl: '/images/partner/fields/new-energy-storage.png',
  },
  {
    id: 6,
    title: '汽车零部件',
    description: '服务汽车零部件企业，涵盖高强钢热处理工艺',
    iconUrl: '/images/partner/fields/auto-parts.png',
  },
  {
    id: 7,
    title: '铸造、热处理与金属加工',
    description: '服务铸造、热处理及金属加工行业精密生产',
    iconUrl: '/images/partner/fields/metal-processing.png',
  },
  {
    id: 8,
    title: '机器人与智能制造',
    description: '服务机器人核心部件及智能制造装备企业',
    iconUrl: '/images/partner/fields/robot-intelligent.png',
  },
];

export async function generateMetadata({ params }: PartnerPageProps) {
  const { locale } = await params;
  const currentLocale = (locale === 'en' ? 'en' : 'zh') as Locale;

  return buildSeoMetadata({
    locale: currentLocale,
    path: '/partner',
    pageKey: 'partner',
    title: currentLocale === 'en' ? 'Partners' : '合作伙伴',
    description:
      currentLocale === 'en'
        ? 'Work with leading industrial partners to build intelligent furnace solutions.'
        : '携手行业领先企业，共筑智能工业炉解决方案。',
    image: '/images/partner/partner-hero.png',
  });
}

export default async function PartnerPage({ params }: PartnerPageProps) {
  const { locale } = await params;
  const currentLocale = (locale === 'en' ? 'en' : 'zh') as Locale;
  const title = currentLocale === 'en' ? 'Partners' : '合作伙伴';

  return (
    <div className="bg-white pb-10 lg:pb-0">
      <PageBanner
        locale={locale}
        title={title}
        englishTitle="Partners"
        subtitle={
          currentLocale === 'en'
            ? 'Work with leading industrial enterprises to build intelligent furnace solutions'
            : '携手行业领先企业，共筑智能工业炉解决方案'
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
        />
      </main>
    </div>
  );
}
