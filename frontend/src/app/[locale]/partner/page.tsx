import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { AboutSubpageJsonLd } from '@/components/about-subpages/AboutSubpageJsonLd';
import PartnerMap, { type Province } from '@/components/partner/map-kit/PartnerMap';
import provinces from '@/components/partner/map-kit/provinces.json';
import { getPartnerMapData } from '@/lib/partner-map-data';
import { siteSettings } from '@/mock/siteSettings';
import { buildMetadata } from '@/lib/seo/metadata';
import { PartnerIndustryDirectory } from '@/components/partner/PartnerIndustryDirectory';
import styles from '@/components/partner/PartnerPage.module.css';

// Preserve the six public industry descriptions captured on 2026-09-09.
const industryFields = [
  {
    title: '不锈钢与有色金属热处理',
    description:
      '涵盖不锈钢连续退火、固溶、光亮退火，以及铜、铝等有色金属的退火处理，应用于不锈钢深加工、有色金属带材、线材等场景。',
    furnaceTypes: '退火固溶生产线、光亮退火炉、网带炉',
    links: [
      {
        label: '退火固溶生产线',
        href: '/zh/products/detail/annealing-solution-line',
      },
      {
        label: '网带炉',
        href: '/zh/products/detail/mesh-belt-furnace',
      },
    ],
  },
  {
    title: '重工机械与装备制造',
    description:
      '覆盖船舶制造、轨道交通、工程机械、重工装备等行业的大型零部件热处理装备需求，常用于大型铸件、锻件、结构件的退火、回火、正火、去应力处理。',
    furnaceTypes: '台车炉、井式炉、辊底炉',
    links: [
      {
        label: '台车炉',
        href: '/zh/products/detail/trolley-furnace',
      },
      {
        label: '井式炉',
        href: '/zh/products/detail/pit-furnace',
      },
      {
        label: '辊底炉',
        href: '/zh/products/detail/roller-hearth-furnace',
      },
    ],
  },
  {
    title: '汽车零部件',
    description:
      '服务汽车零部件企业的热处理需求，涵盖齿轮、轴承、紧固件、高强钢零件的退火、回火、淬火、渗碳等工艺。',
    furnaceTypes: '网带炉、推杆炉、箱式炉',
    links: [
      {
        label: '网带炉',
        href: '/zh/products/detail/mesh-belt-furnace',
      },
      {
        label: '推杆炉',
        href: '/zh/products/detail/pusher-furnace',
      },
      {
        label: '箱式炉',
        href: '/zh/products/detail/box-furnace',
      },
    ],
  },
  {
    title: '能源装备与相关制造场景',
    description:
      '服务石化设备、压力容器、油气管材、风电零部件等能源装备及相关制造场景的热处理装备需求。',
    furnaceTypes: '台车炉、辊底炉、网带炉',
    links: [
      {
        label: '台车炉',
        href: '/zh/products/detail/trolley-furnace',
      },
      {
        label: '辊底炉',
        href: '/zh/products/detail/roller-hearth-furnace',
      },
    ],
  },
  {
    title: '管阀部件与流体装备',
    description: '应用于阀门、管件、法兰等流体设备零部件的热处理，常见去应力、退火、调质等工艺。',
    furnaceTypes: '台车炉、井式炉、箱式炉',
    links: [
      {
        label: '台车炉',
        href: '/zh/products/detail/trolley-furnace',
      },
      {
        label: '井式炉',
        href: '/zh/products/detail/pit-furnace',
      },
    ],
  },
  {
    title: '铸造、热处理与金属加工',
    description: '服务铸造、热处理加工及金属精密加工企业，涵盖多种材质和工艺的热处理装备需求。',
    furnaceTypes: '箱式炉、罩式炉、台车炉',
    links: [
      {
        label: '箱式炉',
        href: '/zh/products/detail/box-furnace',
      },
      {
        label: '罩式炉',
        href: '/zh/products/detail/bell-furnace',
      },
    ],
  },
];

type PartnerPageProps = { params: Promise<{ locale: string }> };
const description =
  '展示苏能工业炉部分历年合作客户，按省份和行业查看合作单位，了解工业炉设备配套与合作范围。';
export async function generateMetadata({ params }: PartnerPageProps) {
  const { locale } = await params;
  if (locale !== 'zh') notFound();
  return {
    ...buildMetadata({
      title: '合作客户',
      description,
      path: '/zh/partner',
      alternateLocales: { 'zh-CN': '/zh/partner', 'x-default': '/zh/partner' },
    }),
    robots: { index: locale === 'zh', follow: locale === 'zh' },
  };
}
export default async function PartnerPage({ params }: PartnerPageProps) {
  if ((await params).locale !== 'zh') notFound();
  const partners = getPartnerMapData();
  return (
    <div className={styles.page} data-about-subpage="partners">
      <AboutSubpageJsonLd
        title="合作客户"
        description={description}
        path="/zh/partner"
        type="CollectionPage"
      />
      <div className={styles.container}>
        <Breadcrumb
          locale="zh"
          tone="dark"
          currentLabel="合作客户"
          items={[{ label: '关于苏能', href: '/zh/about' }, { label: '合作客户' }]}
          className={styles.breadcrumb}
        />
        <header className={styles.hero}>
          <div>
            <h1>合作客户</h1>
            <p>从客户分布到行业应用，了解苏能的历年合作网络。</p>
          </div>
          <a className={styles.heroLink} href="#partner-industries">
            按行业找客户
            <svg
              viewBox="0 0 20 20"
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              aria-hidden="true"
            >
              <path d="M10 3v14m-5-5 5 5 5-5" />
            </svg>
          </a>
        </header>
        <div className={styles.map}>
          <PartnerMap
            headingLevel={2}
            title="历年合作客户分布"
            assetBasePath="/partner-map"
            partners={partners}
            provinces={provinces.map(
              (province): Province => ({
                ...province,
                anchor: [province.anchor[0], province.anchor[1]],
                label: [province.label[0], province.label[1]],
              }),
            )}
          />
        </div>
        <PartnerIndustryDirectory partners={partners} />
        <details className={styles.applications} data-partner-industries>
          <summary>
            行业应用与设备方向
            <svg
              viewBox="0 0 20 20"
              width="20"
              height="20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              aria-hidden="true"
            >
              <path d="m5 7.5 5 5 5-5" />
            </svg>
          </summary>
          <p className={styles.note}>
            下列场景用于说明通用工业热处理装备的应用方向，不代表名单中每家企业的具体采购内容。涉及特殊工艺认证的项目，须另行核对相应资质和项目要求。
          </p>
          <div className={styles.applicationsGrid}>
            {industryFields.map((field) => (
              <article key={field.title}>
                <h3>{field.title}</h3>
                <p>{field.description}</p>
                <p>参考炉型：{field.furnaceTypes}</p>
                <div>
                  {field.links.map((link) => (
                    <Link key={link.href} href={link.href}>
                      {link.label}
                    </Link>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </details>
        <section className={styles.contact} aria-labelledby="partner-contact-title">
          <div>
            <h2 id="partner-contact-title">沟通您的设备需求</h2>
            <p>带上工件与工艺要求，一起讨论设备配置与供货范围。</p>
          </div>
          <div className={styles.contactActions}>
            <Link className={styles.contactPrimary} href="/zh/contact">
              沟通设备需求
              <svg
                viewBox="0 0 20 20"
                width="18"
                height="18"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                aria-hidden="true"
              >
                <path d="M3 10h14m-5-5 5 5-5 5" />
              </svg>
            </Link>
            <a className={styles.phone} href={`tel:${siteSettings.salesPhone}`}>
              130-5298-6814
            </a>
          </div>
        </section>
        <p className={styles.note}>
          苏能通常作为工业炉设备供应商或设备分包方参与项目，不承接工程总承包业务。合作形式包括设备应用、设备配套、工程协作或相关业务往来，具体以项目资料和可披露信息为准。
        </p>
      </div>
    </div>
  );
}
