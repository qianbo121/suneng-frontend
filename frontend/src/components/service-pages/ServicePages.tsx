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

function OverviewContent() {
  return (
    <>
      <ServiceSection id="service-options" title="您需要哪类工业炉服务？">
        <div className={styles.entries}>
          {serviceEntries.filter((entry) => !isWithdrawnTechnicalPath(entry.href)).map((entry, i) => (
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
            <strong>准备新建热处理生产线？</strong>
          </div>
          <Link href={serviceRoutes.products} className={styles.textLink}>
            查看设备与生产线
          </Link>
        </aside>
      </ServiceSection>
      <ServiceSection id="service-process" title="从设备现状，到实施与交付" soft>
        <ServiceSteps items={overviewSteps} />
        <p className={styles.note}>服务对象与实施范围，需结合设备资料、配置和现场条件评估。</p>
      </ServiceSection>
      <ServiceSection id="consultation-materials" title="暂时不知道选哪项？先发这三项">
        <ServiceInfoCards
          items={consultationItems}
          strip
          icons={[HiOutlineCamera, HiOutlineDocumentText, HiOutlineChatBubbleLeftRight]}
        />
        <div className={styles.noteRow}>
          <p className={styles.note}>没有完整图纸也可以先咨询；历史记录和图纸可后续补充。</p>
        </div>
      </ServiceSection>
    </>
  );
}
function RelocationContent() {
  return (
    <>
      <ServiceSection
        id="relocation-work"
        title="搬迁前，先明确这四项工作"
        intro="原地重启先查设备现状；涉及搬迁时，先评估可搬迁性与拆分方案。"
      >
        <ol className={styles.workList}>
          {relocationWork.map((item, i) => (
            <li key={item.title}>
              <span className={styles.number} aria-hidden="true">
                {String(i + 1).padStart(2, '0')}
              </span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </li>
          ))}
        </ol>
        <p className={styles.note}>苏能、客户及相关施工方的工作范围，在实施前明确。</p>
      </ServiceSection>
      <ServiceSection
        id="project-scope"
        title="谁负责什么，费用由哪些工作组成？"
        intro="搬迁时可一并评估炉衬、加热、电控及机械系统的维修或改造。先列清保留、维修、更换和新增项目，再确定人员与工期。"
      >
        <ServiceTable
          headers={['工作范围', '技术与实施安排', '客户及配套方准备']}
          rows={relocationScopeRows}
          label="工业炉搬迁的工作分工"
        />
        <p className={styles.note}>
          初步沟通先发设备全景、铭牌、停机原因或搬迁目标；再补新旧现场条件、设备尺寸重量和可用停产窗口。
        </p>
        <div className={styles.heading}>
          <h3 className={styles.scopeSubheading}>报价前，分开核对这三类费用</h3>
        </div>
        <ServiceInfoCards items={relocationCostItems} />
        <p className={styles.note}>
          检查发现新增损坏、缺件或现场条件变化时，先确认调整范围与费用，再安排对应工作。
        </p>
      </ServiceSection>
      <ServiceSection
        id="equipment-checks"
        title="恢复生产前，先检查这六项"
        intro="能启动不代表能安全生产。未经检查确认，不应自行恢复生产运行。"
        soft
      >
        <div className={styles.checkGrid}>
          {equipmentChecks.map((item, i) => (
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
          电阻炉、燃气炉和保护气氛炉的专项检查不同，按实际配置确定。涉及炉衬受潮、修补或重砌时，还需核对干燥、养护和烘炉条件。
        </p>
      </ServiceSection>
      <ServiceSection
        id="verification"
        title="三阶段验证，每一步都有记录"
        intro="检查与整改完成后逐步验证，每阶段确认通过后进入下一阶段。"
      >
        <div className={styles.checkGrid}>
          {verificationStages.map((item, i) => (
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
              <p className={styles.record}>形成：{item.record}</p>
            </article>
          ))}
        </div>
        <aside className={styles.handover} aria-labelledby="handover-title">
          <HiOutlineDocumentText className={styles.icon} aria-hidden="true" />
          <div className={styles.handoverCopy}>
            <h3 id="handover-title">资料交付</h3>
            <p>按实施范围移交以下资料：</p>
          </div>
          <ul>
            {['检查与整改记录', '试运行及验收记录', '涉及变更的图纸', '操作维护资料'].map(
              (item) => (
                <li key={item}>{item}</li>
              ),
            )}
          </ul>
          <p className={styles.note}>控制程序与参数备份，按设备配置提供。</p>
        </aside>
      </ServiceSection>
      <ServiceSection id="acceptance" title="验收项目与判定依据提前明确">
        <ServiceTable
          headers={['核验项目', '判定依据', '形成记录']}
          rows={acceptanceRows}
          label="复产验收项目与判定依据"
        />
        <p className={styles.note}>具体项目按设备与工艺确定；空载结果不能替代负载验证。</p>
        <div className={styles.related}>
          <strong>相关服务与准备：</strong>
          <Link href={serviceRoutes.repair} className={styles.textLink}>
            工业炉维修与改造
          </Link>
          <Link href={serviceRoutes.installation} className={styles.textLink}>
            安装调试与售后
          </Link>
        </div>
      </ServiceSection>
    </>
  );
}
function InstallationContent() {
  return (
    <>
      <ServiceSection id="after-sales" title="设备出现问题，按这四步联系售后">
        <ServiceSteps items={afterSalesSteps} />
        <p className={styles.note}>
          说明故障发生的时间、工况及已采取的措施；照片在安全位置拍摄，不为取证拆开带电柜体或恢复故障设备运行。
        </p>
        <aside className={styles.hotline}>
          <div>
            <span>售后服务电话</span>
            <a
              className={`${styles.contactPhone} ${styles.hotlineNumber}`}
              href={serviceContact.phoneHref}
            >
              <HiPhone aria-hidden="true" />
              {serviceContact.displayPhone}
            </a>
          </div>
          <p>
            先核对故障与资料，再沟通远程支持、备件或现场服务。技术反馈、到场及恢复生产的时间分别确认。
          </p>
          <ServiceContactButton afterSales />
        </aside>
      </ServiceSection>
      <ServiceSection
        id="installation-preparation"
        title="安装与调试，需要双方准备什么？"
        intro="先核对现场条件与工作范围，再安排进场、调试和交付。"
      >
        <ServiceTable
          headers={['环节', '服务内容', '客户配合']}
          rows={installationRows}
          label="安装调试的服务内容与客户配合"
          numbered
        />
        <p className={styles.note}>吊装、基础施工、能源接入及第三方检测的承担方，在进场前明确。</p>
      </ServiceSection>
      <ServiceSection id="delivery-documents" title="交付时，资料与设备一起移交" soft>
        <ServiceInfoCards items={deliveryItems} />
        <p className={styles.note}>程序备份及其他资料，按设备配置与实际供货范围提供。</p>
      </ServiceSection>
      <ServiceSection id="warranty" title="质保与后续服务">
        <ServiceInfoCards
          items={warrantyItems}
          two
          icons={[HiOutlineShieldCheck, HiOutlineWrenchScrewdriver]}
        />
        <p className={styles.note}>
          咨询质保时可提供合同或设备交付信息，核对适用范围、起算日期、期限及费用承担。维修、更换与现场服务的范围分别确认。
        </p>
      </ServiceSection>
    </>
  );
}
export function ServicePageView({ kind }: { kind: ServicePageKind }) {
  const page = servicePages[kind];
  return (
    <div className={styles.page} data-service-page={kind}>
      <JsonLd id={`service-${kind}-jsonld`} data={getServiceJsonLd(kind)} />
      <ServiceHero kind={kind} />
      {kind === 'overview' ? (
        <OverviewContent />
      ) : kind === 'relocation' ? (
        <RelocationContent />
      ) : (
        <InstallationContent />
      )}
      <ServiceFaq title={page.faqTitle} items={page.faqs} soft={kind === 'overview'} />
      <ServiceContact kind={kind} />
    </div>
  );
}
