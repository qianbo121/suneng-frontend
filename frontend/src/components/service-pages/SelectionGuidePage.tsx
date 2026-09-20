import Image from 'next/image';
import Link from 'next/link';
import { HiInformationCircle, HiOutlineDocumentText, HiPhone } from 'react-icons/hi2';
import { WechatContactButton } from '@/components/lead/WechatContactButton';
import { isWithdrawnTechnicalPath } from '@/lib/publication-scope';
import { ServiceAnchorNav } from './ServiceAnchorNav';
import { serviceContact } from './ServicePageShared';
import { serviceRoutes } from './service-content';
import shared from './ServicePages.module.css';
import styles from './SelectionGuidePage.module.css';

const navigation = [
  ['guide-start', '问题入口'],
  ['guide-topics', '专题资料'],
  ['guide-services', '服务对接'],
  ['guide-contact', '提交需求'],
] as const;

const entries = [
  {
    title: '新建项目，先找设备方向',
    description: '从工件、工艺和产量出发，了解工业炉与热处理生产线。',
    label: '查看设备与生产线',
    href: serviceRoutes.products,
  },
  {
    title: '旧炉该修、改，还是换新？',
    description: '结合设备现状、工艺变化、投入与停产影响，了解判断方法。',
    label: '查看修、改、换判断',
    href: serviceRoutes.decision,
    fallback: { href: serviceRoutes.repair, label: '查看维修与改造' },
  },
  {
    title: '问题明确，查处理方法',
    description: '温度不均、炉衬损坏或控制系统老化，先看对应检查与处理资料。',
    label: '查看问题处理资料',
    href: '#guide-topics',
  },
  {
    title: '准备咨询，整理报价资料',
    description: '了解需要提供的参数，以及供货与报价范围如何核对。',
    label: '查看报价参数清单',
    href: serviceRoutes.quote,
    fallback: { href: '/zh/inquiry', label: '整理并提交项目情况' },
  },
];

const topics = [
  ['温度不均整改', '先核对测温、装炉与加热条件', '/zh/solutions/rechuli-lu-wendu-bujun-zhenggai', '温度不均'],
  ['炉衬损坏与翻新', '了解检查项目和修复边界', '/zh/solutions/rechuli-lu-luchen-fanxin', '炉衬'],
  [
    '能源切换与余热利用',
    '核对能源条件和改造范围',
    '/zh/solutions/rechuli-lu-dian-gai-ran-yure-huishou',
    '余热',
  ],
  ['控制系统升级', '明确控制任务与系统接口', '/zh/solutions/rechuli-lu-kongzhi-xitong-shengji', '控制系统'],
  ['停产与搬迁复产', '了解恢复生产前的检查', serviceRoutes.relocationGuide, '搬迁'],
  [
    '改造风险与停产安排',
    '区分项目周期与停产窗口',
    '/zh/solutions/rechuli-lu-gaizao-fengxian-zhouqi',
    '改造',
  ],
] as const;

const newProjectGuides = [
  ['连续生产线规划', '/zh/solutions/continuous-heat-treatment-line'],
  ['厂家能力核对', '/zh/solutions/rechuli-lu-changjia'],
  ['江苏及华东项目配套', '/zh/solutions/jiangsu-gongye-lu-changjia'],
] as const;

const services = [
  ['维修与改造', '设备维修、大修与局部改造', serviceRoutes.repair],
  ['搬迁与复产', '搬迁重装、停产检查与复产验证', serviceRoutes.relocation],
  ['安装调试与售后', '安装交付、设备报修与维护支持', serviceRoutes.installation],
] as const;

export function SelectionGuidePage({ heroImage }: { heroImage: string }) {
  const availableProjectGuides = newProjectGuides.filter(([, href]) => !isWithdrawnTechnicalPath(href));
  return (
    <div className={`${shared.page} ${styles.page}`} data-selection-guide>
      <section className={`${shared.hero} ${styles.hero}`} aria-labelledby="guide-title">
        <div className={`${shared.heroMedia} ${styles.heroMedia}`}>
          <Image
            src={heroImage}
            alt="工业炉技术人员核对工件与图纸的场景示意"
            fill
            priority
            sizes="(max-width: 767px) 100vw, 70vw"
            className={`${shared.heroImage} ${styles.heroImage}`}
          />
        </div>
        <div className={`${shared.container} ${shared.heroInner} ${styles.heroInner}`}>
          <div className={`${shared.heroCopy} ${styles.heroCopy}`}>
            <p className={styles.eyebrow}>苏能工业炉 · 选型与改造指南</p>
            <h1 id="guide-title">
              工业炉选型
              <br />
              与改造指南
            </h1>
            <p>从项目问题出发，找到设备方向、判断方法和准备资料。</p>
            <p className={shared.heroNote}>先了解适用条件，再结合工况确定下一步。</p>
            <div className={shared.actions}>
              <a href="#guide-start" className={`${shared.button} ${shared.primary}`}>
                按问题找资料
              </a>
              <Link href="/zh/inquiry" className={`${shared.button} ${shared.light}`}>
                提交项目情况
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className={shared.pathbar}>
        <div className={`${shared.container} ${shared.pathInner}`}>
          <nav className={shared.breadcrumb} aria-label="面包屑">
            <ol>
              <li>
                <Link href="/zh">首页</Link>
              </li>
              <li>
                <Link href={serviceRoutes.overview}>改造与服务</Link>
              </li>
              <li aria-current="page">选型与改造指南</li>
            </ol>
          </nav>
          <ServiceAnchorNav items={navigation} />
        </div>
      </div>

      <section id="guide-start" className={shared.section} aria-labelledby="guide-start-heading">
        <div className={shared.container}>
          <header className={shared.heading}>
            <h2 id="guide-start-heading">您目前需要解决什么问题？</h2>
            <p>选一个最接近当前情况的方向。</p>
          </header>
          <ol className={styles.entries}>
            {entries.map((entry, index) => (
              <li key={entry.href} className={styles.entry}>
                <span className={styles.number} aria-hidden="true">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <h3>{entry.title}</h3>
                <p>{entry.description}</p>
                <Link
                  href={isWithdrawnTechnicalPath(entry.href) && entry.fallback ? entry.fallback.href : entry.href}
                  className={styles.textLink}
                >
                  {isWithdrawnTechnicalPath(entry.href) && entry.fallback ? entry.fallback.label : entry.label}
                </Link>
              </li>
            ))}
          </ol>
          {availableProjectGuides.length > 0 && <nav className={styles.related} aria-label="新建项目延伸阅读">
            <span>新建项目参考：</span>
            {availableProjectGuides.map(([title, href]) => (
              <Link key={href} href={href} className={styles.textLink}>
                {title}
              </Link>
            ))}
          </nav>}
        </div>
      </section>

      <section
        id="guide-topics"
        className={`${shared.section} ${styles.soft}`}
        aria-labelledby="guide-topics-heading"
      >
        <div className={shared.container}>
          <header className={shared.heading}>
            <h2 id="guide-topics-heading">按具体问题，深入了解</h2>
            <p>先看检查思路与适用条件，再沟通具体处理方式。</p>
          </header>
          <div className={styles.topics}>
            {topics.map(([title, description, href, searchTerm]) => (
              <article className={styles.topic} key={href}>
                <span className={styles.documentIcon}>
                  <HiOutlineDocumentText aria-hidden="true" />
                </span>
                <div className={styles.topicCopy}>
                  <h3>{title}</h3>
                  <p>{description}</p>
                </div>
                <Link
                  href={isWithdrawnTechnicalPath(href) ? `/zh/news?q=${encodeURIComponent(searchTerm)}` : href}
                  className={styles.topicButton}
                  aria-label={`查看相关资料：${title}`}
                >
                  查看相关资料
                </Link>
              </article>
            ))}
          </div>
          <p className={styles.notice}>
            <HiInformationCircle aria-hidden="true" />
            <span>资料用于初步了解，具体处理方式需结合设备与现场条件确认。</span>
          </p>
        </div>
      </section>

      <section
        id="guide-services"
        className={shared.section}
        aria-labelledby="guide-services-heading"
      >
        <div className={shared.container}>
          <header className={`${shared.heading} ${styles.serviceHeading}`}>
            <div>
              <h2 id="guide-services-heading">已经明确需要哪类服务？</h2>
              <p>查看服务范围，沟通设备情况与实施安排。</p>
            </div>
            <Link href={serviceRoutes.overview} className={styles.textLink}>
              返回改造与服务
            </Link>
          </header>
          <div className={styles.services}>
            {services.map(([title, description, href], index) => (
              <article className={styles.service} key={href}>
                <span className={styles.number} aria-hidden="true">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <div>
                  <h3>{title}</h3>
                  <p>{description}</p>
                  <Link className={styles.textLink} href={href} aria-label={`查看服务：${title}`}>
                    查看服务
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        id="guide-contact"
        className={`${shared.section} ${styles.soft}`}
        aria-labelledby="guide-contact-heading"
      >
        <div className={`${shared.container} ${styles.contact}`}>
          <div>
            <h2 id="guide-contact-heading">仍不确定从哪里开始？</h2>
            <p>说明项目方向和当前主要问题，先沟通下一步。</p>
          </div>
          <div className={styles.contactActions}>
            <Link href="/zh/inquiry" className={`${shared.button} ${shared.primary}`}>
              提交项目情况
            </Link>
            <WechatContactButton
              label="加微信，工况初判"
              className={`${shared.button} ${shared.outline}`}
            />
            <a className={shared.contactPhone} href={serviceContact.phoneHref}>
              <HiPhone aria-hidden="true" />
              {serviceContact.displayPhone}
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
