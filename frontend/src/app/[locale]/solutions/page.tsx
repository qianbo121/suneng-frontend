import { EnglishSolutionsHub, englishSolutionMetadata } from '@/components/engineering/EnglishSolutionsPage';
import { solutionAlternates } from '@/lib/english-solutions';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { TECHNICAL_CONTENT_PUBLISHED } from '@/lib/publication-scope';

import { JsonLd } from '@/components/JsonLd';
import type { NavigationHubSection } from '@/components/layout/NavigationHubPage';
import { SelectionGuidePage } from '@/components/service-pages/SelectionGuidePage';
import { getBreadcrumbJsonLd } from '@/lib/seo/jsonld';
import { absoluteUrl, buildMetadata } from '@/lib/seo/metadata';

type PageProps = {
  params: Promise<{ locale: string }>;
};

const pagePath = '/zh/solutions';
const heroImage = '/images/services/selection-guide/hero-engineers.png';

const sections: NavigationHubSection[] = [
  {
    id: 'temperature-energy',
    title: '温度不均或耗能偏高',
    description: '先核对测温、装炉与加热条件；比较能耗时，同步确认产量、工艺和计量范围。',
    cards: [
      {
        label: '温度均匀性',
        title: '热处理炉温度不均整改',
        description:
          '从测温校准、加热分区、循环风、导流、炉门密封、炉衬和装炉方式建立整改与复测路径。',
        href: '/zh/solutions/rechuli-lu-wendu-bujun-zhenggai',
      },
      {
        label: '能源系统',
        title: '电改燃、燃改电与余热回收',
        description: '在同工况基础上比较能源、公辅、安全、排放、维护和停产条件，不只比较能源单价。',
        href: '/zh/solutions/rechuli-lu-dian-gai-ran-yure-huishou',
      },
    ],
  },
  {
    id: 'lining-controls',
    title: '炉衬损坏或控制系统老化',
    description:
      '炉衬损坏先查损伤范围及原因；控制问题先核对测温回路、执行机构、安全联锁和程序资料。',
    cards: [
      {
        label: '炉体与耐材',
        title: '热处理炉炉衬翻新',
        description: '检查热面、冷面钢板、锚固和密封接口，区分局部修复、扩大拆检与整体翻新。',
        href: '/zh/solutions/rechuli-lu-luchen-fanxin',
      },
      {
        label: '控制与数据',
        title: '热处理炉控制系统升级',
        description:
          '盘点测温回路、执行机构、安全联锁、程序备份与数据接口，再确定局部升级或整体更换。',
        href: '/zh/solutions/rechuli-lu-kongzhi-xitong-shengji',
      },
    ],
  },
  {
    id: 'restart-renovation',
    title: '搬厂复产，或考虑旧炉修换',
    description: '停产重启先核对设备状态；维修、改造和换新放在相同工艺要求与投入范围下比较。',
    cards: [
      {
        label: '恢复生产',
        title: '停产炉重启与搬迁复产',
        description:
          '按设备条件确定冷态、热态与负载验证，区分能启动、具备试运行条件和能稳定生产。',
        href: '/zh/solutions/rechuli-lu-tingchan-chongqi-banqian-fuchan',
      },
      {
        label: '决策判断',
        title: '老旧热处理炉大修还是换新',
        description:
          '结合安全状态、炉体基础、工艺变化、停产窗口和改造费用，判断继续维修、系统改造或重新采购。',
        href: '/zh/articles/laojiu-rechuli-lu-daxiu-haishi-maixin',
      },
      {
        label: '项目计划',
        title: '工业炉改造风险与周期',
        description: '把旧炉状态、隐蔽工程、停产窗口、预制切换和验收口径提前写进项目计划。',
        href: '/zh/solutions/rechuli-lu-gaizao-fengxian-zhouqi',
      },
    ],
  },
  {
    id: 'new-project',
    title: '新建生产线或选择厂家',
    description: '从工件、工艺、产能和现场条件确定设备组合，再核对供应商能力与项目配套。',
    cards: [
      {
        label: '生产线方案',
        title: '连续热处理生产线系统规划',
        description: '围绕加热、冷却或淬火、输送、控制和数据记录，评估整线组合与接口边界。',
        href: '/zh/solutions/continuous-heat-treatment-line',
        image: '/images/products/annealing-solution-line/gallery/line-01.jpg',
        imageAlt: '连续热处理生产线设备参考图',
      },
      {
        label: '供应商能力',
        title: '热处理炉厂家能力怎么判断',
        description: '从非标设计、制造、安装调试和售后边界判断供应商是否适合当前项目。',
        href: '/zh/solutions/rechuli-lu-changjia',
      },
      {
        label: '区域配套',
        title: '江苏及华东工业炉项目配套',
        description: '了解苏能在工业炉定制、改造大修、安装调试和现场配合方面的服务范围。',
        href: '/zh/solutions/jiangsu-gongye-lu-changjia',
      },
    ],
  },
];

export const dynamicParams = false;

export function generateStaticParams() {
  return [{ locale: 'zh' }, { locale: 'en' }];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  // Withdrawn content must not be rendered even if a request slips past middleware.
  if (!TECHNICAL_CONTENT_PUBLISHED) notFound();
  const { locale } = await params;
  if (locale === 'en') return englishSolutionMetadata();
  if (locale !== 'zh') notFound();

  return buildMetadata({
    title: '选型与改造指南｜工业炉选型、故障判断与搬迁复产',
    description:
      '按工件、工艺、产能和现有设备问题查找工业炉解决方案，覆盖连续热处理生产线、温度均匀性整改、炉衬翻新、能源系统与控制系统升级。',
    path: pagePath,
    pageKey: 'service',
    keywords: ['工业炉解决方案', '热处理生产线方案', '热处理炉改造', '工业炉选型'],
    image: heroImage,
    alternateLocales: solutionAlternates(),
  });
}

export default async function SolutionsPage({ params }: PageProps) {
  // Withdrawn content must not be rendered even if a request slips past middleware.
  if (!TECHNICAL_CONTENT_PUBLISHED) notFound();
  const { locale } = await params;
  if (locale === 'en') return <EnglishSolutionsHub />;
  if (locale !== 'zh') notFound();

  return (
    <>
      <JsonLd
        id="solutions-hub-jsonld"
        data={[
          getBreadcrumbJsonLd([
            { name: '首页', url: '/zh' },
            { name: '选型与改造指南', url: pagePath },
          ]),
          {
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: '选型与改造指南',
            url: absoluteUrl(pagePath),
            hasPart: sections.flatMap((section) =>
              section.cards.map((card) => ({
                '@type': 'WebPage',
                name: card.title,
                url: absoluteUrl(card.href),
              })),
            ),
          },
        ]}
      />
      <SelectionGuidePage heroImage={heroImage} />
    </>
  );
}
