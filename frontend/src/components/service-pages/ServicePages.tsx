import { localizeServiceContent, serviceHref, serviceText } from '@/components/service-pages/service-localization';
import type { Locale } from '@/types/site';
import { isWithdrawnTechnicalPath } from '@/lib/publication-scope';
import Link from 'next/link';
import {
  HiOutlineCamera,
  HiOutlineChatBubbleLeftRight,
  HiOutlineCog6Tooth,
  HiOutlineDocumentText,
  HiOutlineShieldCheck,
  HiOutlineWrenchScrewdriver,
  HiPhone,
} from 'react-icons/hi2';
import { JsonLd } from '@/components/JsonLd';
import {
  ServiceContact,
  ServiceContactButton,
  ServiceFaq,
  ServiceHero,
  ServiceInfoCards,
  ServiceSection,
  ServiceSteps,
  ServiceTable,
  serviceContact,
} from './ServicePageShared';
import {
  acceptanceRows,
  afterSalesSteps,
  consultationItems,
  deliveryItems,
  equipmentChecks,
  installationRows,
  overviewSteps,
  relocationCostItems,
  relocationScopeRows,
  relocationWork,
  serviceEntries,
  servicePages,
  serviceRoutes,
  verificationStages,
  warrantyItems,
  type ServicePageKind,
} from './service-content';
import { getServiceJsonLd } from './service-metadata';
import styles from './ServicePages.module.css';
import { OverseasDeliverySection } from './OverseasDeliverySection';

function OverviewContent({ locale = 'zh' }: { locale?: Locale }) {
  const en = locale === 'en';
  const entries = localizeServiceContent(serviceEntries, locale);
  return (
    <>
      <ServiceSection id="service-options" title={en ? "Which furnace service do you need?" : "您需要哪类工业炉服务？"}>
        <div className={styles.entries}>
          {entries.filter((entry) => !isWithdrawnTechnicalPath(entry.href)).map((entry, i) => (
            <article
              key={entry.title}
              id={i === 2 ? 'after-sales-service' : undefined}
              className={styles.entry}
            >
              <span className={styles.entryNumber} aria-hidden="true">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div>
                <h3>{entry.title}</h3>
                <p>{entry.text}</p>
              </div>
              <div className={styles.entryScope}>{entry.scope}</div>
              <Link href={entry.href} className={`${styles.button} ${styles.outline}`}>
                {entry.action}
              </Link>
            </article>
          ))}
        </div>
        <aside className={styles.auxiliary}>
          <div>
            <HiOutlineCog6Tooth className={styles.icon} aria-hidden="true" />
            <strong>{en ? "Planning a new heat-treatment line?" : "准备新建热处理生产线？"}</strong>
          </div>
          <Link href={en ? '/en/products' : serviceRoutes.products} className={styles.textLink}>
            {en ? 'View furnaces & production lines' : '查看设备与生产线'}
          </Link>
        </aside>
      </ServiceSection>
      <ServiceSection id="service-process" title={en ? 'From equipment assessment to implementation and handover' : '从设备现状，到实施与交付'} soft>
        <ServiceSteps items={localizeServiceContent(overviewSteps, locale)} />
        <p className={styles.note}>{en ? 'Equipment eligibility and work scope depend on documentation, configuration and site conditions.' : '服务对象与实施范围，需结合设备资料、配置和现场条件评估。'}</p>
      </ServiceSection>
      <ServiceSection id="consultation-materials" title={en ? 'Not sure where to start? Send these three items' : '暂时不知道选哪项？先发这三项'}>
        <ServiceInfoCards
          items={localizeServiceContent(consultationItems, locale)}
          strip
          icons={[HiOutlineCamera, HiOutlineDocumentText, HiOutlineChatBubbleLeftRight]}
        />
        <div className={styles.noteRow}>
          <p className={styles.note}>{en ? 'You can start without a complete drawing set. Historical records and drawings can follow.' : '没有完整图纸也可以先咨询；历史记录和图纸可后续补充。'}</p>
        </div>
      </ServiceSection>
    </>
  );
}
function RelocationContent({ locale }: { locale: Locale }) {
  const t = (text: string) => serviceText(text, locale);
  return (
    <>
      <ServiceSection
        id="relocation-work"
        title={t("搬迁前，先明确这四项工作")}
        intro={t("原地重启先查设备现状；涉及搬迁时，先评估可搬迁性与拆分方案。")}
      >
        <ol className={styles.workList}>
          {localizeServiceContent(relocationWork, locale).map((item, i) => (
            <li key={item.title}>
              <span className={styles.number} aria-hidden="true">
                {String(i + 1).padStart(2, '0')}
              </span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </li>
          ))}
        </ol>
        <p className={styles.note}>{t("苏能、客户及相关施工方的工作范围，在实施前明确。")}</p>
      </ServiceSection>
      <ServiceSection
        id="project-scope"
        title={t("谁负责什么，费用由哪些工作组成？")}
        intro={t("搬迁时可一并评估炉衬、加热、电控及机械系统的维修或改造。先列清保留、维修、更换和新增项目，再确定人员与工期。")}
      >
        <ServiceTable
          headers={[t("工作范围"), t("技术与实施安排"), t("客户及配套方准备")]}
          rows={localizeServiceContent(relocationScopeRows, locale)}
          label={t("工业炉搬迁的工作分工")}
        />
        <p className={styles.note}>
          {t("初步沟通先发设备全景、铭牌、停机原因或搬迁目标；再补新旧现场条件、设备尺寸重量和可用停产窗口。")}</p>
        <div className={styles.heading}>
          <h3 className={styles.scopeSubheading}>{t("报价前，分开核对这三类费用")}</h3>
        </div>
        <ServiceInfoCards items={localizeServiceContent(relocationCostItems, locale)} />
        <p className={styles.note}>
          {t("检查发现新增损坏、缺件或现场条件变化时，先确认调整范围与费用，再安排对应工作。")}</p>
      </ServiceSection>
      <ServiceSection
        id="equipment-checks"
        title={t("恢复生产前，先检查这六项")}
        intro={t("能启动不代表能安全生产。未经检查确认，不应自行恢复生产运行。")}
        soft
      >
        <div className={styles.checkGrid}>
          {localizeServiceContent(equipmentChecks, locale).map((item, i) => (
            <article key={item.title} className={styles.checkCard}>
              <span className={styles.number} aria-hidden="true">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </div>
            </article>
          ))}
        </div>
        <p className={styles.note}>
          {t("电阻炉、燃气炉和保护气氛炉的专项检查不同，按实际配置确定。涉及炉衬受潮、修补或重砌时，还需核对干燥、养护和烘炉条件。")}</p>
      </ServiceSection>
      <ServiceSection
        id="verification"
        title={t("三阶段验证，每一步都有记录")}
        intro={t("检查与整改完成后逐步验证，每阶段确认通过后进入下一阶段。")}
      >
        <div className={styles.checkGrid}>
          {localizeServiceContent(verificationStages, locale).map((item, i) => (
            <article className={`${styles.checkCard} ${styles.stage}`} key={item.title}>
              <div className={styles.stageHead}>
                <span className={styles.number} aria-hidden="true">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </div>
              </div>
              <p className={styles.record}>{t("形成：")}{item.record}</p>
            </article>
          ))}
        </div>
        <aside className={styles.handover} aria-labelledby="handover-title">
          <HiOutlineDocumentText className={styles.icon} aria-hidden="true" />
          <div className={styles.handoverCopy}>
            <h3 id="handover-title">{t("资料交付")}</h3>
            <p>{t("按实施范围移交以下资料：")}</p>
          </div>
          <ul>
            {[t("检查与整改记录"), t("试运行及验收记录"), t("涉及变更的图纸"), t("操作维护资料")].map(
              (item) => (
                <li key={item}>{item}</li>
              ),
            )}
          </ul>
          <p className={styles.note}>{t("控制程序与参数备份，按设备配置提供。")}</p>
        </aside>
      </ServiceSection>
      <ServiceSection id="acceptance" title={t("验收项目与判定依据提前明确")}>
        <ServiceTable
          headers={[t("核验项目"), t("判定依据"), t("形成记录")]}
          rows={localizeServiceContent(acceptanceRows, locale)}
          label={t("复产验收项目与判定依据")}
        />
        <p className={styles.note}>{t("具体项目按设备与工艺确定；空载结果不能替代负载验证。")}</p>
        <div className={styles.related}>
          <strong>{t("相关服务与准备：")}</strong>
          <Link href={serviceHref(serviceRoutes.repair, locale)} className={styles.textLink}>
            {t("工业炉维修与改造")}</Link>
          <Link href={serviceHref(serviceRoutes.installation, locale)} className={styles.textLink}>
            {t("安装调试与售后")}</Link>
        </div>
      </ServiceSection>
    </>
  );
}
function InstallationContent({ locale }: { locale: Locale }) {
  const t = (text: string) => serviceText(text, locale);
  return (
    <>
      <ServiceSection id="after-sales" title={t("设备出现问题，按这四步联系售后")}>
        <ServiceSteps items={localizeServiceContent(afterSalesSteps, locale)} />
        <p className={styles.note}>
          {t("说明故障发生的时间、工况及已采取的措施；照片在安全位置拍摄，不为取证拆开带电柜体或恢复故障设备运行。")}</p>
        <aside className={styles.hotline}>
          <div>
            <span>{t("售后服务电话")}</span>
            <a
              className={`${styles.contactPhone} ${styles.hotlineNumber}`}
              href={serviceContact.phoneHref}
            >
              <HiPhone aria-hidden="true" />
              {locale === 'en' ? '+86-' + serviceContact.displayPhone : serviceContact.displayPhone}
            </a>
          </div>
          <p>
            {t("先核对故障与资料，再沟通远程支持、备件或现场服务。技术反馈、到场及恢复生产的时间分别确认。")}</p>
          <ServiceContactButton afterSales locale={locale} />
        </aside>
      </ServiceSection>
      <ServiceSection
        id="installation-preparation"
        title={t("安装与调试，需要双方准备什么？")}
        intro={t("先核对现场条件与工作范围，再安排进场、调试和交付。")}
      >
        <ServiceTable
          headers={[t("环节"), t("服务内容"), t("客户配合")]}
          rows={localizeServiceContent(installationRows, locale)}
          label={t("安装调试的服务内容与客户配合")}
          numbered
        />
        <p className={styles.note}>{t("吊装、基础施工、能源接入及第三方检测的承担方，在进场前明确。")}</p>
      </ServiceSection>
      <ServiceSection id="delivery-documents" title={t("交付时，资料与设备一起移交")} soft>
        <ServiceInfoCards items={localizeServiceContent(deliveryItems, locale)} />
        <p className={styles.note}>{t("程序备份及其他资料，按设备配置与实际供货范围提供。")}</p>
      </ServiceSection>
      <OverseasDeliverySection locale={locale} />
      <ServiceSection id="warranty" title={t("质保与后续服务")}>
        <ServiceInfoCards
          items={localizeServiceContent(warrantyItems, locale)}
          two
          icons={[HiOutlineShieldCheck, HiOutlineWrenchScrewdriver]}
        />
        <p className={styles.note}>
          {t("咨询质保时可提供合同或设备交付信息，核对适用范围、起算日期、期限及费用承担。维修、更换与现场服务的范围分别确认。")}</p>
      </ServiceSection>
    </>
  );
}
export function ServicePageView({ kind, locale = 'zh' }: { kind: ServicePageKind; locale?: Locale }) {
  const page = localizeServiceContent(servicePages[kind], locale);
  return (
    <div className={styles.page} lang={locale} data-service-page={kind}>
      <JsonLd id={`service-${kind}-jsonld`} data={getServiceJsonLd(kind, locale)} />
      <ServiceHero kind={kind} locale={locale} />
      {kind === 'overview' ? (
        <OverviewContent locale={locale} />
      ) : kind === 'relocation' ? (
        <RelocationContent locale={locale} />
      ) : (
        <InstallationContent locale={locale} />
      )}
      <ServiceFaq title={page.faqTitle} items={page.faqs} soft={kind === 'overview'} />
      <ServiceContact kind={kind} locale={locale} />
    </div>
  );
}
