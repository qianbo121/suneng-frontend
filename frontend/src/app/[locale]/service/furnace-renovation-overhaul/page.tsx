import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import {
  HiInformationCircle,
  HiOutlineCog6Tooth,
  HiOutlineDocumentText,
  HiOutlineShieldCheck,
  HiOutlineWrenchScrewdriver,
} from 'react-icons/hi2';
import { JsonLd } from '@/components/JsonLd';
import {
  AnchorNav,
  FaqSection,
  Hero,
  InfoCards,
  InfoColumns,
  Resources,
  Section,
} from '@/components/engineering/EngineeringPage';
import { renovationFaqs, repairSystems } from '@/components/engineering/engineering-content';
import styles from '@/components/engineering/EngineeringPage.module.css';
import { HomepageLeadForm } from '@/components/home/HomepageLeadForm';
import { getBreadcrumbJsonLd, getFaqJsonLd, getWebPageJsonLd } from '@/lib/seo/jsonld';
import { buildMetadata } from '@/lib/seo/metadata';

const pagePath = '/zh/service/furnace-renovation-overhaul';
const description =
  '苏能根据旧炉现状、工艺要求和停产安排，评估工业炉维修、大修、局部改造或换新，介绍炉衬、燃烧、电控等系统及不锈钢连续退洗线改造项目。可先发设备照片、铭牌和当前问题咨询。';
export const dynamicParams = false;
type PageProps = { params: Promise<{ locale: string }> };
export function generateStaticParams() {
  return [{ locale: 'zh' }];
}
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  if ((await params).locale !== 'zh') notFound();
  const metadata = buildMetadata({
    title: '工业炉维修、改造与大修服务',
    description,
    path: pagePath,
    image: '/images/services/furnace-renovation/hero-mechanical-repair-20260911.jpg',
    alternateLocales: { 'zh-CN': pagePath, 'x-default': pagePath },
  });
  if (process.env.NODE_ENV === 'development' || process.env.SITE_NOINDEX === 'true') {
    metadata.robots = { index: false, follow: false };
  }
  return metadata;
}
export default async function FurnaceRenovationPage({ params }: PageProps) {
  if ((await params).locale !== 'zh') notFound();
  return (
    <div className={styles.page} data-engineering-page="renovation">
      <AnchorNav
        items={[
          ['fit', '设备问题'],
          ['scope', '可改系统'],
          ['process', '服务流程'],
          ['faq', '常见问题'],
          ['inquiry', '提交需求'],
        ]}
      />
      <Hero
        eyebrow="苏能工业炉 · 维修与改造"
        title="工业炉维修、改造与大修服务"
        text="苏能根据旧炉现状、工艺要求和停产安排，初步判断适合维修、大修、局部改造，还是换新。"
        note="先发设备照片和目前的问题，沟通处理方式。"
        image="/images/services/furnace-renovation/hero-mechanical-repair-20260911.jpg"
        alt="工业炉维修场景示意：技术人员使用工具检修停机炉的炉门机械机构"
        tags={['热处理炉大修', '节能改造', '控制系统升级']}
      />
      <Section id="fit" title="旧炉出问题，先判断怎么处理">
        <InfoColumns
          items={[
            {
              title: '维修或大修',
              text: '工艺需求未变，设备磨损、故障或保温性能下降。',
              icon: HiOutlineWrenchScrewdriver,
            },
            {
              title: '局部改造',
              text: '需要改善控温、产能、能耗或自动化，先检查现有设备条件。',
              icon: HiOutlineCog6Tooth,
            },
            {
              title: '评估换新',
              text: '现有结构难以适应新工艺，或改造成本与停产影响较大。',
              icon: HiOutlineDocumentText,
            },
          ]}
        />
        <p className={styles.notice}>
          <HiInformationCircle aria-hidden="true" />
          同一种现象可能有不同原因，需检查后确定处理方式。
        </p>
      </Section>
      <Section id="scope" title="工业炉常见问题与改造方式">
        <div className={styles.systemGrid}>
          {repairSystems.map((item) => (
            <article className={styles.systemCard} key={item.title}>
              <div className={styles.systemImage}>
                <Image
                  src={`/images/services/furnace-renovation/${item.image}.webp`}
                  alt={item.alt}
                  fill
                  sizes="(max-width: 767px) 100vw, 400px"
                />
              </div>
              <div className={styles.systemCopy}>
                <h3>{item.title}</h3>
                <dl>
                  <div>
                    <dt>现象</dt>
                    <dd>{item.symptom}</dd>
                  </div>
                  <div>
                    <dt>检查</dt>
                    <dd>{item.check}</dd>
                  </div>
                  <div>
                    <dt>可能处理</dt>
                    <dd>{item.treatment}</dd>
                  </div>
                </dl>
              </div>
            </article>
          ))}
        </div>
      </Section>
      <Section id="control-selection" title="控制系统怎么选，先看实际控制任务">
        <p className={styles.note}>
          按 I/O 数量、控制对象、联锁复杂度、数据接口和维护能力选择 PLC、DCS 或其他架构，不把某个控制器型号当作所有旧炉的统一改造方案。
        </p>
      </Section>
      <Section
        id="process"
        title="从提交资料到改造验收，共6步"
        intro="先发设备照片、铭牌、当前问题与停产安排；现场检查按项目需要安排。"
        soft
      >
        <ol className={styles.steps}>
          {['提交资料', '初步评估', '现场检查', '确定方案', '施工调试', '验收交付'].map(
            (step, index) => (
              <li key={step}>
                <span className={styles.number}>{String(index + 1).padStart(2, '0')}</span>
                {step}
              </li>
            ),
          )}
        </ol>
      </Section>
      <Section id="acceptance" title="改造范围、验收与保修">
        <InfoCards
          items={[
            {
              title: '改哪些，谁配套',
              text: '列明更换、修复与保留部件，明确现场配套和双方分工。',
              icon: HiOutlineWrenchScrewdriver,
            },
            {
              title: '改好后，怎么验收',
              text: '按实际改造内容约定温度、运行及安全检查；涉及产能或能耗时，明确测试条件与计量范围。',
              icon: HiOutlineDocumentText,
            },
            {
              title: '哪些部分保修',
              text: '分别写明改造部分、保留旧件及易损件的保修范围和期限。',
              icon: HiOutlineShieldCheck,
            },
          ]}
        />
        <p className="mt-5 text-sm leading-7 text-[#526277]" data-acceptance-boundary>改造验收应覆盖安全联锁、升温与温度控制、有效加热区温度均匀性、产能与生产节拍、机械与连续运行、能耗或排放六类指标。温度、产能和能耗结论须同时记录负载、工件、装炉方式、测点、保温时间、仪器校准、统计周期与异常工况，不能脱离测试条件复用。</p>
        <p className="mt-3 text-sm leading-7 text-[#526277]">苏能不承接工程总承包业务，通常作为工业炉设备供应商或设备分包方参与项目；涉及压力容器、特种设备或专项认证的部分，由具备相应资质的单位承担或配合实施。</p>
      </Section>
      <FaqSection title="工业炉维修与改造常见问题" faqs={renovationFaqs} />
      <Resources
        title="改造前，可以先看这些资料"
        items={[
          {
            title: '炉衬损坏，局部修补还是整体翻新？',
            description: '核对损伤、保温和炉体结构，明确翻新与验收边界。',
            href: '/zh/solutions/rechuli-lu-luchen-fanxin',
            label: '查看判断与检查方法',
          },
          {
            title: '电改燃与余热回收，怎样判断适用性？',
            description: '结合能源条件、烟气工况和安全隔离评估。',
            href: '/zh/solutions/rechuli-lu-dian-gai-ran-yure-huishou',
            label: '查看判断与检查方法',
          },
          {
            title: '控制系统升级，需要核对哪些条件？',
            description: '按控制对象、联锁和数据接口确定升级范围。',
            href: '/zh/solutions/rechuli-lu-kongzhi-xitong-shengji',
            label: '查看判断与检查方法',
          },
          {
            title: '改造有哪些风险，停产窗口怎么安排？',
            description: '按实施范围、备件和现场条件逐项确认。',
            href: '/zh/solutions/rechuli-lu-gaizao-fengxian-zhouqi',
            label: '查看判断与检查方法',
          },
          {
            title: '停产或搬迁后，恢复生产前查什么？',
            description: '分冷态、空载和负载验证，整理复产记录。',
            href: '/zh/solutions/rechuli-lu-tingchan-chongqi-banqian-fuchan',
            label: '查看判断与检查方法',
          },
          {
            title: '温度不均，应该先查哪里？',
            description: '区分测温、循环、装载与加热系统的问题。',
            href: '/zh/solutions/rechuli-lu-wendu-bujun-zhenggai',
            label: '查看判断与检查方法',
          },
          {
            title: '旧炉维修还是换新',
            description: '结合设备现状、工艺变化和投入范围，判断后续方向。',
            href: '/zh/articles/laojiu-rechuli-lu-daxiu-haishi-maixin',
            label: '阅读维修或换新判断',
          },
          {
            title: '节能效果如何比较',
            description: '统一改造前后工况，比较单位产品能耗与连续运行数据。',
            href: '/zh/news/gong-ye-lu-gai-zao-yan-shou-kan-na-xie-zhi-biao-cong-wen-du-jun-yun-xing-neng-hao-dao-kong-zhi-xi-tong-wen-ding-xing',
            label: '阅读能耗对比与验收方法',
          },
          {
            title: '改造费用受哪些因素影响',
            description: '按设备现状、改造范围、施工条件和停产安排拆分预算。',
            href: '/zh/news/re-chu-li-lu-jie-neng-gai-zao-duo-shao-qian-fei-yong-gou-cheng-yu-suan-ying-xiang-yin-su-he-xun-jia-qian-zhun-bei',
            label: '阅读改造费用构成',
          },
        ]}
      />
      <HomepageLeadForm
        sectionId="inquiry"
        pageType="工业炉维修改造服务页"
        productTag="旧炉维修／改造"
        successProductTag="工业炉维修改造项目情况"
        sourceModule="furnace_renovation_overhaul_form"
      />
      <JsonLd
        id="renovation-page-jsonld"
        data={getWebPageJsonLd({ path: pagePath, name: '工业炉维修、改造与大修服务', description })}
      />
      <JsonLd
        id="renovation-breadcrumb-jsonld"
        data={getBreadcrumbJsonLd([
          { name: '首页', url: '/zh' },
          { name: '改造与服务', url: '/zh/service' },
          { name: '工业炉维修、改造与大修服务', url: pagePath },
        ])}
      />
      <JsonLd id="renovation-faq-jsonld" data={getFaqJsonLd(renovationFaqs)} />
    </div>
  );
}
