import { LuFileText, LuHeater } from 'react-icons/lu';
import type { IconType } from 'react-icons';
import { isWithdrawnTechnicalPath } from '@/lib/publication-scope';
import { CaseContact } from './CaseContact';
import styles from './AnnealingCaseResources.module.css';

// Keep the original section anchor so existing links into this case still work.
export const ANNEALING_RESOURCES_ID = '六-继续查看相关能力';
export const CASE_RESOURCES_ID = 'case-resources';

export type CaseResource = {
  category: string;
  title: string;
  titleLines?: string[];
  description: string;
  href: string;
  action: string;
  Icon?: IconType;
};

export function caseLinkResource({ title, href }: { title: string; href: string }): CaseResource {
  if (href.startsWith('/zh/products')) {
    return {
      title,
      href,
      category: '设备产品',
      description: '查看适用工件、工艺条件与设备配置。',
      action: '查看设备',
      Icon: LuHeater,
    };
  }
  if (href.startsWith('/zh/service') || href.startsWith('/zh/solutions')) {
    return {
      title,
      href,
      category: '方案与服务',
      description: '结合现有工况，了解方案方向与服务范围。',
      action: '了解方案',
      Icon: ProductionLineIcon,
    };
  }
  return {
    title,
    href,
    category: '选型资料',
    description: '继续查阅相关资料，准备项目沟通条件。',
    action: '查看资料',
    Icon: LuFileText,
  };
}

function ProductionLineIcon() {
  return (
    <svg
      viewBox="0 0 48 36"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M6 4h8v10H6zM20 4h8v10h-8zM34 4h8v10h-8zM10 4v3m14-3v3m14-3v3" />
      <rect x="3" y="19" width="42" height="12" rx="6" />
      <circle cx="10" cy="25" r="2" />
      <circle cx="24" cy="25" r="2" />
      <circle cx="38" cy="25" r="2" />
    </svg>
  );
}

const resources: CaseResource[] = [
  {
    category: '设备产品',
    title: '连续退火固溶生产线',
    titleLines: ['连续退火固溶', '生产线'],
    description: '查看适用材料、温度路径与设备配置方向。',
    href: '/zh/products/detail/annealing-solution-line',
    action: '查看设备',
    Icon: LuHeater,
  },
  {
    category: '整体方案',
    title: '连续热处理生产线方案',
    titleLines: ['连续热处理', '生产线方案'],
    description: '了解加热、冷却、输送与控制的整体规划。',
    href: '/zh/solutions/continuous-heat-treatment-line',
    action: '了解方案',
    Icon: ProductionLineIcon,
  },
  {
    category: '询价准备',
    title: '工业炉报价参数清单',
    titleLines: ['工业炉报价', '参数清单'],
    description: '准备材料、规格、产能与现场接口条件。',
    href: '/zh/articles/gongye-lu-baojia-canshu',
    action: '查看清单',
    Icon: LuFileText,
  },
];

// Keep at least two live cards when withdrawn destinations are filtered out.
const fallbackResources: CaseResource[] = [
  {
    category: '设备产品',
    title: '工业炉与热处理生产线',
    titleLines: ['工业炉与', '热处理生产线'],
    description: '查看炉型、生产线与设备配置方向。',
    href: '/zh/products',
    action: '查看设备',
    Icon: LuHeater,
  },
  {
    category: '询价准备',
    title: '提交项目情况',
    titleLines: ['提交', '项目情况'],
    description: '说明工件、产量与现场条件，先判断方向。',
    href: '/zh/inquiry',
    action: '提交需求',
    Icon: LuFileText,
  },
];

const supportRollerResources: CaseResource[] = [
  resources[1],
  {
    category: '厂家能力',
    title: '热处理炉厂家能力',
    titleLines: ['热处理炉', '厂家能力'],
    description: '了解制造基地、炉型范围与非标设备交付能力。',
    href: '/zh/solutions/rechuli-lu-changjia',
    action: '了解能力',
    Icon: LuHeater,
  },
  resources[2],
];

export function AnnealingCaseResources({
  backHref,
  caseId,
  sourceSummary,
  variant = 'annealing',
  items: customItems,
  context,
  sectionId = ANNEALING_RESOURCES_ID,
  sourceDate,
  compact = false,
}: {
  backHref: string;
  caseId: string;
  sourceSummary: string;
  variant?: 'annealing' | 'support-roller';
  items?: CaseResource[];
  context?: string;
  sectionId?: string;
  sourceDate?: string;
  compact?: boolean;
}) {
  const isSupportRoller = variant === 'support-roller';
  const available = (customItems ?? (isSupportRoller ? supportRollerResources : resources)).filter(
    (item) => !isWithdrawnTechnicalPath(item.href),
  );
  const items = [...available];
  for (const extra of fallbackResources) {
    if (items.length >= 2) break;
    if (!items.some((item) => item.href === extra.href)) items.push(extra);
  }
  return (
    <section
      className={`${styles.section}${compact ? ` ${styles.compact}` : ''}`}
      id={sectionId}
      aria-labelledby="case-resources-title"
    >
      {!compact && (
        <div className={styles.context}>
          <p>
            {context ??
              `${isSupportRoller ? '济宁五创支重轮热处理生产线' : '河南金誉邦连续退洗线'} · 项目经验`}
          </p>
          <a href={backHref}>
            返回项目案例 <span aria-hidden="true">&gt;&gt;</span>
          </a>
        </div>
      )}
      <div className={styles.heading}>
        {!compact && <p className={styles.eyebrow}>相关能力</p>}
        <h2 id="case-resources-title">{compact ? '继续了解' : '下一步，了解你的设备方案'}</h2>
        {!compact && <p className={styles.intro}>设备选型、产线规划与报价准备，按需求继续查看。</p>}
      </div>
      <div className={styles.cards} data-count={items.length}>
        {items.map(
          ({ category, title, titleLines, description, href, action, Icon = LuFileText }) => (
            <a className={styles.card} href={href} key={href}>
              {!compact && (
                <div className={styles.cardTop}>
                  <Icon aria-hidden="true" />
                  <span>{category}</span>
                </div>
              )}
              <div className={styles.cardBody}>
                <h3 aria-label={title}>
                  {(titleLines ?? [title]).map((line) => (
                    <span className={styles.titleLine} key={line}>
                      {line}
                    </span>
                  ))}
                </h3>
                {!compact && <p>{description}</p>}
                <span className={styles.cardAction}>
                  {action} <span aria-hidden="true">&gt;&gt;</span>
                </span>
              </div>
            </a>
          ),
        )}
      </div>
      {!compact && (
        <div className={styles.source}>
          <p>资料来源：{sourceSummary}</p>
          {sourceDate && (
            <p>
              数据口径日期：
              <time dateTime={sourceDate}>{sourceDate.slice(0, 10).replaceAll('-', '.')}</time>
            </p>
          )}
        </div>
      )}
      <section className={styles.contact} aria-labelledby="case-consultation-title">
        <div>
          <h2 id="case-consultation-title">有相似工况，先把需求聊清楚。</h2>
          <p>工件、装载、温度或已有方案，都可以作为沟通起点。</p>
        </div>
        <div className={styles.contactActions}>
          <CaseContact position="bottom" caseId={caseId} />
          <p>资料不齐，也可以先沟通。</p>
        </div>
      </section>
    </section>
  );
}
