import { corePageText, localizeCoreValue } from '@/lib/core-page-localization';
import type { Locale } from '@/types/site';
import Image from 'next/image';
import Link from 'next/link';
import { HiArrowUpRight, HiChevronDoubleRight } from 'react-icons/hi2';

import { JsonLd } from '@/components/JsonLd';
import { AboutCompanyHero } from '@/components/about/AboutCompanyHero';
import {
  AboutAnchorNav,
  AboutBoundaryList,
  AboutCertificateGrid,
  AboutFaq,
} from '@/components/about/AboutPageInteractive';
import { ABOUT_ANCHORS, ABOUT_BOUNDARIES, ABOUT_FAQS } from '@/components/about/about-page-data';
import { WechatContactButton } from '@/components/lead/WechatContactButton';
import { getButtonClass } from '@/components/ui/Button';
import {
  SUNENG_ISO_CERTIFICATES,
  SUNENG_PATENT_CERTIFICATES,
  SUNENG_QUALIFICATION_CERTIFICATES,
} from '@/constants/certificates';
import { getBreadcrumbJsonLd } from '@/lib/seo/jsonld';
import { siteSettings } from '@/mock/siteSettings';

import styles from './AboutZhContent.module.css';
import homeToolStyles from '@/components/home/HeatTreatmentToolCenter.module.css';

export const ABOUT_ZH_SEO = {
  title: '关于苏能工业炉｜公司简介、制造基地与企业资质',
  description:
    '江苏苏能工业炉有限公司成立于2006年，生产基地位于江苏泰州，提供非标工业炉、热处理生产线及工业炉大修与改造服务。查看制造交付流程、企业资质、公开项目与承接范围，支持预约验厂。',
  keywords: '苏能工业炉,江苏苏能工业炉有限公司,非标工业炉,热处理生产线,工业炉改造',
  ogTitle: '关于苏能工业炉｜公司简介、制造基地与企业资质',
  ogDescription:
    '江苏苏能工业炉有限公司成立于2006年，生产基地位于江苏泰州，提供非标工业炉、热处理生产线及工业炉大修与改造服务。查看制造交付流程、企业资质、公开项目与承接范围，支持预约验厂。',
} as const;

const sourceWorkflowItems = [
  {
    number: '01',
    title: '需求与方案确认',
    description: '核对工件、工艺、装料、产能和现场公用条件，把未确定项留在方案阶段处理。',
    material: '需求清单、初步方案、技术协议',
    image: '/images/about/about-requirement-office.jpg',
    alt: '苏能工业炉方案设计与协同办公区',
  },
  {
    number: '02',
    title: '炉体制作与装配',
    description: '按已确认的结构和工艺条件推进炉体、炉衬、机械机构与关键部件制造。',
    material: '制造进度、关键节点记录',
    image: '/images/about/about-furnace-fabrication.jpg',
    alt: '苏能工业炉炉体制作与装配车间',
  },
  {
    number: '03',
    title: '整线集成与联调',
    description: '将炉体、传动、加热、测温、控制和安全联锁纳入同一设备边界。',
    material: '电气图纸、投料配置、联调记录',
    image: '/images/about/about-production-line.jpg',
    alt: '苏能工业炉生产线装配与配套集成现场',
  },
  {
    number: '04',
    title: '试炉检查与出厂',
    description: '围绕制造节点、单机动作、安全联锁和资料齐套性完成出厂前核对。',
    material: '检查记录、试运行记录',
    image: '/images/about/about-process-inspection.jpg',
    alt: '苏能工业炉操作人员进行过程检查与出厂准备',
  },
  {
    number: '05',
    title: '安装调试与验收',
    description: '完成设备拆分、防护与发运，按合同范围配合现场安装、调试和验收。',
    material: '装箱清单、使用文件、验收资料',
    image: '/images/about/about-furnace-delivery.jpg',
    alt: '苏能工业炉设备发运现场',
  },
] as const;

const sourceDeliveryPhotos = [
  {
    caption: '需求与方案协同',
    image: sourceWorkflowItems[0].image,
    alt: sourceWorkflowItems[0].alt,
  },
  {
    caption: '炉体制造现场',
    image: sourceWorkflowItems[1].image,
    alt: sourceWorkflowItems[1].alt,
  },
  {
    caption: '整线装配现场',
    image: sourceWorkflowItems[2].image,
    alt: sourceWorkflowItems[2].alt,
  },
  {
    caption: '设备发运现场',
    image: sourceWorkflowItems[4].image,
    alt: sourceWorkflowItems[4].alt,
  },
] as const;

const sourceCapabilityItems = [
  {
    title: '单机设备',
    text: '台车炉、箱式炉、井式炉、网带炉、辊底炉、推杆炉等周期式或连续式工业炉。',
  },
  {
    title: '设备成套',
    text: '围绕加热、输送、淬火冷却、上下料和节拍联动组织成套设备。',
  },
  {
    title: '配套系统',
    text: '控制柜、加热元件、燃烧系统、测温、耐火保温、循环风机与冷却系统。',
  },
  {
    title: '大修改造',
    text: '面向自制设备及部分非苏能品牌工业炉，评估节能、控制、炉衬、搬迁和复产方案。',
  },
] as const;

const highTechCertificate = SUNENG_QUALIFICATION_CERTIFICATES.find(
  (item) => item.id === 'qualification-high-tech-enterprise',
)!;
const isoCertificate = SUNENG_ISO_CERTIFICATES.find((item) => item.id === 'iso-9001')!;
const patentCertificate = SUNENG_PATENT_CERTIFICATES[0];
const fullCertificateCount =
  SUNENG_QUALIFICATION_CERTIFICATES.length +
  SUNENG_ISO_CERTIFICATES.length +
  SUNENG_PATENT_CERTIFICATES.length;

const sourceCertificateCards = [
  {
    title: '国家高新技术企业',
    summary: highTechCertificate.subtitle!,
    detail: `证书编号：${highTechCertificate.certificateNo}`,
    image: highTechCertificate.image,
    alt: highTechCertificate.alt,
    linkLabel: '查看证书',
  },
  {
    title: 'ISO 9001 质量管理体系',
    summary: '适用于工业电阻炉、燃气炉的设计与制造',
    detail: `证书编号：${isoCertificate.certificateNo}`,
    validUntil: isoCertificate.validUntil,
    image: isoCertificate.image,
    alt: isoCertificate.alt,
    linkLabel: '查看证书',
  },
  {
    title: `${SUNENG_PATENT_CERTIFICATES.length} 项授权专利`,
    summary: '覆盖电阻炉、燃气热处理炉、固溶生产线等设备方向',
    detail: '点击查看专利证书代表图',
    image: patentCertificate.image,
    alt: patentCertificate.alt,
    linkLabel: '查看专利证书',
  },
] as const;



const sourcePartnerLogos = [
  {
    name: '中国恩菲工程技术有限公司',
    src: '/images/partners/homepage/01-enfi.png',
    width: 316,
    height: 160,
  },
  {
    name: '中国联合工程有限公司',
    src: '/images/partners/homepage/03-cuec.png',
    width: 384,
    height: 160,
  },
  {
    name: '中集安瑞环科技股份有限公司',
    src: '/images/partners/homepage/04-cimc-safeway.png',
    width: 536,
    height: 160,
  },
  {
    name: '内蒙古北方重工业集团有限公司',
    src: '/images/partners/homepage/06-nhi.png',
    width: 368,
    height: 160,
  },
  {
    name: '江苏天工科技股份有限公司',
    src: '/images/partners/homepage/07-tiangong-technology.png',
    width: 482,
    height: 160,
  },
  {
    name: '六和轻合金（苏州）有限公司',
    src: '/images/partners/homepage/11-liuhe-light-alloy.png',
    width: 427,
    height: 160,
  },
] as const;

const sourceFaqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: ABOUT_FAQS.map((item) => ({
    '@type': 'Question',
    name: item.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: item.answer,
    },
  })),
};

export function AboutZhContent({ locale = 'zh' }: { locale?: Locale }) {
  const t = (text: string) => corePageText(text, locale);
  const workflowItems = localizeCoreValue(sourceWorkflowItems, locale);
  const deliveryPhotos = localizeCoreValue(sourceDeliveryPhotos, locale);
  const capabilityItems = localizeCoreValue(sourceCapabilityItems, locale);
  const certificateCards = localizeCoreValue(sourceCertificateCards, locale).map((card, index) => locale === 'en' && index === 2 ? { ...card, title: `${SUNENG_PATENT_CERTIFICATES.length} granted patents` } : card);
  const partnerLogos = localizeCoreValue(sourcePartnerLogos, locale);
  const faqJsonLd = localizeCoreValue(sourceFaqJsonLd, locale);

  return (
    <div lang={locale} className={styles.page}>
      <JsonLd
        id={`about-${locale}-page-jsonld`}
        data={[
          getBreadcrumbJsonLd([
            { name: t("首页"), url: t("/zh") },
            { name: t("关于苏能"), url: t("/zh/about") },
          ]),
          faqJsonLd,
        ]}
      />

      <AboutAnchorNav items={localizeCoreValue(ABOUT_ANCHORS, locale)} locale={locale} />

      <AboutCompanyHero locale={locale} className={styles.sectionAnchor} />
      <div className={styles.container}>
        <p className={styles.visitStrip} data-company-facts>
          <span>{t("江苏苏能工业炉有限公司成立于 2006 年，注册资本 5080 万元，累计开展 1000+ 工业炉新建与改造项目；生产基地为公司自报约 14700㎡，位于")}{siteSettings.address[locale]}{t("。具体设备性能按项目工况确认。")}</span>
        </p>
      </div>


      <section
        id="delivery"
        className={`${styles.section} ${styles.sectionAnchor}`}
        aria-labelledby="delivery-title"
      >
        <div className={styles.container}>
          <div className={styles.sectionHeading}>
            <div>
              <h2 id="delivery-title">{t("从需求确认到安装验收的 5 个环节")}</h2>
              <p>{t("项目按已确认的条件和节点资料往前推进，方便客户核对进度、接口和验收范围。")}</p>
            </div>
          </div>

          <div className={styles.workflowGrid} data-about-layout="workflow">
            {workflowItems.map((item) => (
              <article key={item.number} className={styles.workflowCard}>
                <div className={styles.workflowBody}>
                  <div className={styles.stepHeader}>
                    <span className={styles.stepNumber}>{item.number}</span>
                    <span aria-hidden="true" />
                  </div>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                  <div className={styles.nodeMaterial}>
                    <strong>{t("交付资料")}</strong>
                    <span>{item.material}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className={styles.deliveryPhotoGrid} data-about-layout="delivery-photos">
            {deliveryPhotos.map((photo) => (
              <figure key={photo.caption} className={styles.deliveryPhoto}>
                <div>
                  <Image
                    src={photo.image}
                    alt={photo.alt}
                    fill
                    loading="lazy"
                    sizes="(max-width: 767px) calc((100vw - 56px) / 2), 282px"
                  />
                </div>
                <figcaption>{photo.caption}</figcaption>
              </figure>
            ))}
          </div>

          <div className={styles.visitStrip}>
            <span>{t("泰州姜堰生产基地 ·")}{siteSettings.address[locale]}</span>
          </div>
        </div>
      </section>

      <section
        id="scope"
        className={`${styles.sectionMuted} ${styles.sectionAnchor}`}
        aria-labelledby="scope-title"
      >
        <div className={styles.container}>
          <div className={styles.sectionHeading}>
            <div>
              <h2 id="scope-title">{t("我们做什么，也明确不做什么")}</h2>
              <p>{t("先按设备范围判断是否匹配，再结合具体工况确认方案和供货边界。")}</p>
            </div>
          </div>

          <div className={styles.scopeGrid}>
            <div className={styles.capabilityGrid} data-about-layout="capabilities">
              {capabilityItems.map((item, index) => (
                <article key={item.title} className={styles.capabilityCard}>
                  <span className={styles.capabilityNumber}>
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.text}</p>
                  </div>
                </article>
              ))}
            </div>
            <AboutBoundaryList items={ABOUT_BOUNDARIES} locale={locale} />
          </div>
        </div>
      </section>

      <section
        id="qualifications"
        className={`${styles.section} ${styles.sectionAnchor}`}
        aria-labelledby="qualifications-title"
      >
        <div className={styles.container}>
          <div className={styles.sectionHeading}>
            <div>
              <h2 id="qualifications-title">{t("企业资质与授权专利")}</h2>
              <p>{t("集中展示当前可核验的企业资质、体系认证与已授权专利。")}</p>
            </div>
            <Link
              href={t("/zh/strength/honors")}
              className={homeToolStyles.allArticlesLink}
            >
              {t("查看全部")}<HiChevronDoubleRight aria-hidden="true" />
            </Link>
          </div>

          <AboutCertificateGrid locale={locale} cards={[...certificateCards]} />
          <p className={styles.srOnly}>
            {t("完整资料共")}{fullCertificateCount} {t("张，包含企业资质、质量管理体系证书和授权专利。")}</p>
        </div>
      </section>

      <section
        id="projects"
        className={`${styles.sectionMuted} ${styles.sectionAnchor}`}
        aria-labelledby="projects-title"
      >
        <div className={styles.container}>
          <h2 id="projects-title" className={styles.srOnly}>{t("项目合作")}</h2>

          <div className={styles.partnerStrip} aria-label={t("部分合作单位")}>
            <div className={styles.partnerIntro}>
              <strong>{t("部分合作单位")}</strong>
              <span>{t("不同项目的合作形式和供货范围可能不同")}</span>
            </div>
            <ul
              className={styles.partnerLogos}
              data-about-layout="partner-logos"
              aria-label={t("合作单位标志")}
            >
              {partnerLogos.map((partner) => (
                <li key={partner.src} className={styles.partnerLogo}>
                  <Image
                    src={partner.src}
                    alt={partner.name}
                    title={partner.name}
                    width={partner.width}
                    height={partner.height}
                    loading="lazy"
                    sizes="112px"
                  />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section
        id="faq"
        className={`${styles.faqSection} ${styles.sectionAnchor}`}
        aria-labelledby="faq-title"
      >
        <div className={`${styles.container} ${styles.faqLayout}`}>
          <div className={styles.sectionHeading}>
            <div>
              <h2 id="faq-title">{t("您关心的，我们说清楚。")}</h2>
              <p>{t("厂家身份、承接范围与项目对接，从这几个问题开始了解。")}</p>
            </div>
          </div>

          <AboutFaq items={localizeCoreValue(ABOUT_FAQS, locale)} />

          <div className={styles.faqContact}>
            <p>
              {t("还有具体问题？")}<span>{t("提供工况，让技术人员帮您初步核对。")}</span>
            </p>
            <div className={styles.faqContactAction}>
              <WechatContactButton locale={locale} description={locale === 'en' ? 'Send workpieces, process, throughput and site conditions for an initial assessment.' : undefined} label={t("联系业务顾问")} className={styles.faqContactButton} />
              <HiArrowUpRight aria-hidden="true" />
            </div>
          </div>
        </div>
      </section>

      <section className={styles.inquirySection} aria-labelledby="inquiry-title">
        <div className={`${styles.container} ${styles.contactPanel}`}>
          <div>
            <h2 id="inquiry-title">{t("发工况，获取初步方向与报价资料清单")}</h2>
            <p className={styles.contactDescription}>
              {t("提交工件、材质、温度、工艺曲线、装料方式、产能节拍和现场条件，技术人员可先做方向与配置边界判断。")}</p>
          </div>
          <WechatContactButton locale={locale} description={locale === 'en' ? 'Send workpieces, process, throughput and site conditions for an initial assessment.' : undefined}
            label={t("提交工况资料")}
            className={`${getButtonClass('primary', 'lg')} ${styles.primaryButton}`}
          />
        </div>
      </section>
    </div>
  );
}
