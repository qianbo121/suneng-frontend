import { JsonLd } from '@/components/JsonLd';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { SITE_LOGO_IMAGE, SITE_URL } from '@/lib/seo/config';
import { absoluteUrl } from '@/lib/seo/metadata';

export const ABOUT_ZH_SEO = {
  title:
    '关于苏能工业炉｜公司资质、主营业务与业务边界',
  description:
    '江苏苏能工业炉有限公司专注工业炉、热处理炉、配套件与整线交付，具备国家高新技术企业、ISO 三体系认证和 14 项已授权专利，并明确不承接感应加热、炼钢冶金、工业锅炉等业务边界。',
  keywords:
    '苏能工业炉,江苏苏能工业炉有限公司,苏能资质,苏能案例,工业炉制造企业',
  ogTitle: '江苏苏能工业炉｜资质、主营业务与业务边界',
  ogDescription:
    '了解江苏苏能工业炉有限公司的主营业务、资质体系、案例数据和不承接业务边界。',
} as const;

const sectionClass = 'border-t border-[#e5e8ef] py-10 first:border-t-0 lg:py-14';
const h2Class = 'text-[26px] font-semibold leading-[1.3] text-[#111827] lg:text-[34px]';
const h3Class = 'mt-8 text-[20px] font-semibold leading-[1.4] text-[#172033] lg:text-[24px]';
const paragraphClass = 'mt-5 text-[16px] leading-[1.95] text-[#364152] lg:text-[17px]';

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: '苏能工业炉',
  alternateName: ['苏能工业炉装备', '苏能'],
  url: SITE_URL,
  logo: SITE_LOGO_IMAGE
    ? absoluteUrl(SITE_LOGO_IMAGE)
    : absoluteUrl('/images/brand/sn-logo-header.png'),
  description:
    '苏能工业炉专业从事电阻式与燃气式工业炉、热处理炉、可控气氛炉、锻造加热炉及工业窑炉的设计、制造与系统集成。',
  knowsAbout: [
    '工业炉',
    '热处理炉',
    '可控气氛炉',
    '井式炉',
    '台车炉',
    '网带炉',
    '推杆炉',
    '辊底炉',
    '多用炉',
    '光亮退火炉',
    '锻造加热炉',
    '工业窑炉',
    '渗碳淬火生产线',
    '工业炉大修',
  ],
  areaServed: 'CN',
};

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '苏能工业炉主要做什么?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '苏能专业从事工业炉、热处理炉、可控气氛炉、锻造加热炉与工业窑炉的设计、制造、系统集成,以及覆盖多种炉型的大修与技改服务。',
      },
    },
    {
      '@type': 'Question',
      name: '非苏能制造的工业炉可以找你们大修吗?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '可以评估。苏能可对苏能自制设备及部分非苏能品牌工业炉提供大修、技改、搬迁复产和节能改造评估；进口炉需结合设备资料、控制系统、备件条件和现场状态综合判断。',
      },
    },
    {
      '@type': 'Question',
      name: '苏能是否是国家级科技型中小企业?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '是。苏能工业炉为国家高新技术企业,同时具备国家级科技型中小企业(2025)认定、ISO 9001 / 14001 / 45001 三体系认证和 14 项已授权专利。',
      },
    },
    {
      '@type': 'Question',
      name: '能对接哪些行业标准?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '苏能严格执行 GB/T 30822《工业燃气加热装置安全要求》等行业国家标准,通过 ISO 9001 / 14001 / 45001 三体系认证,是国家高新技术企业(证书编号 GR202432008987,2024年认定),同时具备国家级科技型中小企业(2025)认定和 14 项已授权专利。公司具备 TUS(温度均匀性测试)/ SAT(系统准确度测试)服务能力,可承接现场测试与整改。',
      },
    },
  ],
};

const businessItems: Array<{
  title: string;
  text: string;
  link?: {
    href: string;
    label: string;
  };
}> = [
  {
    title: '工业炉与热处理装备制造',
    text: '覆盖周期式炉、连续式炉、可控气氛/保护气氛炉、专用工艺炉、锻造加热炉、工业窑炉等装备类型。真空类特殊炉型可根据项目需求与技术条件单独评估。',
  },
  {
    title: '整线交钥匙工程',
    text: '提供紧固件/螺栓/弹簧/链条热处理生产线、渗碳淬火生产线、光亮退火生产线、锻造加热生产线等整线交付能力,覆盖从工艺设计、设备制造、配套件供应到现场安装、调试投产的全流程。苏能在大型项目中通常作为工业炉设备分包方，与中国五矿恩菲等工程总承包单位协作完成项目，不直接承接工程总承包业务。',
  },
  {
    title: '工业炉大修与技改服务',
    text: '服务对象包括苏能自制设备及部分非苏能品牌工业炉，覆盖整炉大修、节能改造、控制系统升级、耐材翻新、加热元件更换、搬迁重装、复产复线，同步承接 TUS(温度均匀性)/ SAT(系统准确度)测试与整改。进口炉需结合设备资料、控制系统、备件条件和现场状态综合判断。',
    link: {
      href: '/zh/service/furnace-renovation-overhaul',
      label: '工业炉节能改造与热处理炉大修服务',
    },
  },
  {
    title: '配套件供应',
    text: 'PLC控制柜、DCS、温控系统、硅碳棒、硅钼棒、电阻带、辐射管、热电偶、耐火保温材料、装出料机构、淬火冷却系统、循环风机等关联部件。',
  },
];

const productMatrix = [
  {
    title: '周期式工业炉',
    items: [
      '井式炉(含井式电阻炉、井式多用炉)',
      '台车炉',
      '车底炉',
      '立式炉',
      '箱式炉',
      '罩式炉/钟罩炉',
      '坑式炉',
      '多用炉(含密封多用炉、密封箱式多用炉)',
    ],
  },
  {
    title: '连续式工业炉',
    items: [
      '推杆炉',
      '辊底炉/辊棒炉/辊道炉',
      '网带炉(含托辊网带炉)',
      '链板炉/链式炉',
      '步进炉/步进梁炉',
      '转底炉',
      '隧道炉',
    ],
  },
  {
    title: '可控气氛 / 保护气氛炉',
    items: [
      '可控气氛炉',
      '保护气氛炉',
      '氮基气氛炉',
      '光亮退火炉',
      '全氢退火炉',
      '罩式退火炉',
      '辐射管炉(按项目集成方案配置)',
      '真空类特殊炉型按项目需求与技术条件评估',
    ],
  },
];

const processCapabilities = [
  [
    '退火族',
    '退火、光亮退火、球化退火、去应力退火、等温退火、罩式退火、全氢退火(真空退火等特殊工艺可根据项目评估)',
  ],
  ['淬火族', '淬火、表面淬火、整体淬火、等温淬火、分级淬火、油淬、水淬、气淬(真空淬火等特殊工艺可根据项目评估)'],
  ['回火族', '回火、低温回火、中温回火、高温回火(真空回火等特殊工艺可根据项目评估)'],
  ['综合热处理', '正火、调质、固溶、时效(含人工时效)'],
  ['渗碳族', '渗碳、气体渗碳、固体渗碳(低压渗碳工艺可根据项目需求与设备条件评估)'],
  ['渗氮族', '渗氮、气体渗氮(离子/等离子渗氮、氮势可控渗氮等高端工艺可根据项目需求与设备条件评估)'],
  ['共渗类', '碳氮共渗、氮碳共渗、软氮化'],
  [
    '其他工艺',
    '渗硼、焊后热处理(PWHT)、消除应力处理、应力消除退火、烧结、钎焊、树脂固化与复合材料固化',
  ],
];

const materialItems = [
  '碳钢',
  '合金钢',
  '不锈钢',
  '模具钢与工模具钢',
  '铝合金',
  '铜合金',
  '钛合金/高温合金/粉末冶金件(按具体材料牌号与工艺需求评估)',
];

const industries = [
  ['整机配套', '汽车零部件、工程机械零部件、矿山机械、农机件'],
  ['通用机械件', '齿轮、轴承、紧固件、螺栓、标准件、五金件、链条、销轴、弹簧'],
  ['模具与刀具', '模具、模具钢、刀具、工具'],
  ['锻铸件', '锻件、铸件'],
  ['承压设备', '压力容器、管道、焊管、油气管材、钻杆、油管'],
  ['能源装备', '风电主轴、风电法兰、风电齿轮、新能源零部件、石化设备'],
  ['金属型材', '板、带、线、管、棒(对接钢厂、有色金属带材厂、管材厂)'],
];

const directionItems = [
  ['高端装备方向', '重大技术装备、高端装备制造、工业母机'],
  ['绿色低碳方向', '碳达峰、碳中和、节能降碳、绿色制造、热处理节能改造'],
  ['数字化方向', '智能制造、数字化车间、工业互联网'],
  ['政策与行业方向', '公司关注并跟进国家在高端装备国产化、专精特新培育、节能降碳等方向的政策导向，以行业政策与客户需求驱动研发投入'],
];

const outOfScopeItems = [
  ['感应加热全系', '感应炉、感应加热炉、中频炉、中频感应、感应淬火、中频淬火、高频淬火'],
  ['炼钢冶金', '电弧炉、炼钢电弧炉、转炉、平炉、电渣炉、电渣重熔炉、矿热炉、高炉'],
  [
    '炼焦及化工热源',
    '焦炉、焦化炉、干馏炉、裂解炉、化工裂解炉、气化炉、煤气化炉、化工反应炉、反应釜',
  ],
  ['建材窑炉中的不做项', '水泥窑、立窑、玻璃窑、玻璃熔窑、日用陶瓷与建材陶瓷烧成窑(注:工业陶瓷与特种陶瓷烧成窑属业务范围内)'],
  ['工业锅炉', '锅炉、工业锅炉、蒸汽锅炉'],
  ['铸造熔化', '冲天炉、化铁炉'],
  ['焚烧设备', '焚烧炉、垃圾焚烧炉'],
  ['民用产品', '厨房灶具、取暖炉、微波炉、家用烤箱、燃气壁挂炉、燃气热水器'],
  ['燃烧器单件标', '燃烧器仅随整炉/整线配套供货'],
  ['工程总承包业务', '苏能不承接工程总承包业务，在大型项目中通常作为工业炉设备分包方，与中国五矿恩菲等工程总承包单位协作完成项目。'],
  ['热处理加工服务', '苏能是工业炉设备制造商和改造服务商，不直接对外提供按件付费的热处理加工服务。如客户需要热处理加工服务，可联系热处理服务行业的专业企业。'],
  ['特殊工艺认证业务', '项目涉及 AMS 2750 / Nadcap / CQI-9 等航空、国防或汽车主机厂供应链特殊工艺认证要求时，认证资质匹配需在商务沟通阶段确认。'],
];

const faqItems = [
  [
    'Q1:苏能工业炉主要做什么?',
    '苏能专业从事工业炉、热处理炉、可控气氛炉、锻造加热炉与工业窑炉的设计、制造、系统集成,以及覆盖多种炉型的大修与技改服务。覆盖电阻式与燃气式两大加热方式,服务于热处理、锻造加热、工业干燥/固化、窑炉烧成/焙烧四大工序场景。',
  ],
  [
    'Q2:你们做不做感应炉(感应加热设备)?',
    '不做。感应加热全系(感应炉、中频炉、感应淬火等)不在我们的业务范围内。',
  ],
  [
    'Q3:非苏能制造的工业炉,可以找你们大修吗?',
    '可以。苏能大修与技改业务覆盖自制设备及部分非苏能品牌工业炉，涵盖周期式炉、连续式炉、可控气氛/保护气氛炉、专用工艺炉、锻造加热炉、工业窑炉等炉型。进口炉需结合设备资料、控制系统、备件条件和现场状态综合判断。',
  ],
  [
    'Q4:你们能做整线交钥匙工程吗?',
    '可以。具备紧固件/螺栓/弹簧/链条热处理生产线、渗碳淬火生产线、光亮退火生产线、锻造加热生产线等整线交付能力。',
  ],
  [
    'Q5:能对接哪些行业标准?',
    '苏能严格执行 GB/T 30822《工业燃气加热装置安全要求》等行业国家标准,通过 ISO 9001 / 14001 / 45001 三体系认证,是国家高新技术企业(2024年认定,证书编号 GR202432008987),同时具备国家级科技型中小企业(2025)认定和 14 项已授权专利。公司具备 TUS(温度均匀性测试)/ SAT(系统准确度测试)服务能力,可承接现场测试与整改。',
  ],
  [
    'Q6:服务过哪些行业?',
    '苏能服务于汽车零部件、工程机械、矿山机械、农机、紧固件、齿轮、轴承、模具、刀具、锻铸件、压力容器、油气管材、风电、新能源、有色金属深加工、钢材深加工等主流制造行业。同时对接钢厂、有色金属带材厂、管材厂等型材客户，承接板、带、线、管、棒材的热处理装备配套。',
  ],
  [
    'Q7:能不能只买你们的配套件?',
    '可以。供应工业炉控制系统、加热元件(硅碳棒/硅钼棒/电阻带/辐射管)、热电偶与测温系统、耐火保温材料、装出料机构、淬火冷却系统、循环风机等;但燃烧器仅随整炉/整线配套供货,不承接燃烧器单件标。',
  ],
];

function TermList({ items }: { items: string[] }) {
  return (
    <ul className="mt-5 flex flex-wrap gap-2">
      {items.map((item) => (
        <li
          key={item}
          className="rounded-[6px] border border-[#dce3ee] bg-[#f8fafc] px-3 py-2 text-[14px] leading-[1.45] text-[#243044]"
        >
          {item}
        </li>
      ))}
    </ul>
  );
}

function LabeledList({ items }: { items: string[][] }) {
  return (
    <ul className="mt-6 grid gap-3">
      {items.map(([label, text]) => (
        <li
          key={label}
          className="rounded-[8px] border border-[#e1e7f0] bg-white px-4 py-4 text-[15px] leading-[1.85] text-[#364152]"
        >
          <strong className="font-semibold text-[#111827]">{label}:</strong> {text}
        </li>
      ))}
    </ul>
  );
}

export function AboutZhContent() {
  return (
    <>
      <header className="border-b border-[#e5e8ef] bg-[#f6f8fb]">
        <div className="mx-auto max-w-[1660px] px-6 py-12 lg:px-[86px] lg:py-16">
          <Breadcrumb
            locale="zh"
            tone="dark"
            className="mb-8 text-[13px]"
            items={[
              { label: '关于苏能', href: '/zh/about' },
              { label: '公司简介' },
            ]}
          />
          <p className="text-[13px] font-semibold uppercase tracking-[0.24em] text-[var(--color-accent)]">
            About Suneng
          </p>
          <h1 className="mt-4 text-[36px] font-semibold leading-[1.16] text-[#111827] lg:text-[56px]">
            关于苏能工业炉
          </h1>
          <p className="mt-6 max-w-[980px] text-[18px] leading-[1.9] text-[#344054] lg:text-[20px]">
            苏能工业炉是一家专注<strong>工业炉单机、配套件与整线交钥匙工程</strong>的
            <strong>国家高新技术企业</strong>,深耕
            <strong>工业加热与热处理装备</strong>的设计、制造与系统集成,业务覆盖
            <strong>电阻式与燃气式工业炉</strong>的主要产品体系,为客户提供从工艺方案到整线落地的
            <strong>一体化解决方案</strong>。
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-[1660px] px-6 lg:px-[86px]">
        <section className={sectionClass} aria-labelledby="about-overview">
          <h2 id="about-overview" className={h2Class}>
            企业概况
          </h2>
          <p className={paragraphClass}>
            苏能工业炉成立于<strong>2006年</strong>,坐落于江苏省泰州市姜堰区张甸蔡官工业区,
            <strong>注册资本5080万元</strong>,<strong>厂房面积14700㎡</strong>,
            <strong>员工150余人</strong>。公司为客户提供
            <strong>工业炉单机设备、配套件、整线交钥匙工程</strong>,以及
            <strong>自制设备及部分非苏能品牌工业炉的大修与技改评估</strong>服务,具备
            <strong>非标工业炉方案设计与制造</strong>能力。
          </p>
          <p className={paragraphClass}>
            苏能工业炉广泛服务于<strong>汽车零部件、工程机械</strong>
            、矿山机械、农机、紧固件、齿轮、轴承、模具、刀具、锻铸件、压力容器、油气管材、
            <strong>风电、新能源、有色金属深加工、钢材深加工</strong>等主流制造行业。
            针对符合业务边界的细分场景，苏能可基于实际工艺与产能需求,提供从工艺方案设计到设备制造、安装调试、
            <strong>整线落地的解决方案</strong>。
          </p>
        </section>

        <section className={sectionClass} aria-labelledby="core-business">
          <h2 id="core-business" className={h2Class}>
            我们做什么:核心业务体系
          </h2>
          <p className={paragraphClass}>
            苏能工业炉围绕<strong>“单机 + 配套 + 整线 + 服务”</strong>四层能力,为客户构建完整业务体系:
          </p>
          <ol className="mt-7 grid gap-4 lg:grid-cols-2">
            {businessItems.map((item, index) => (
              <li
                key={item.title}
                className="rounded-[8px] border border-[#e1e7f0] bg-[#fbfcfe] p-5"
              >
                <h3 className="text-[18px] font-semibold leading-[1.5] text-[#111827]">
                  {index + 1}. {item.title}
                </h3>
                <p className="mt-3 text-[15px] leading-[1.85] text-[#364152]">{item.text}</p>
                {item.link ? (
                  <a
                    href={item.link.href}
                    className="mt-4 inline-flex text-[15px] font-semibold text-[var(--color-accent)] underline-offset-4 hover:underline"
                  >
                    {item.link.label}
                  </a>
                ) : null}
              </li>
            ))}
          </ol>
        </section>

        <section className={sectionClass} aria-labelledby="product-matrix">
          <h2 id="product-matrix" className={h2Class}>
            炉型产品矩阵
          </h2>
          {productMatrix.map((group) => (
            <section key={group.title} aria-labelledby={`matrix-${group.title}`}>
              <h3 id={`matrix-${group.title}`} className={h3Class}>
                {group.title}
              </h3>
              <TermList items={group.items} />
            </section>
          ))}

          <section aria-labelledby="matrix-special">
            <h3 id="matrix-special" className={h3Class}>
              专用与工艺导向炉
            </h3>
            <LabeledList
              items={[
                [
                  '干燥与烘干类',
                  '干燥炉、烘干炉、工业烘箱、工业烤箱、鼓风干燥箱、热风循环烘箱、高温烘箱',
                ],
                [
                  '固化类',
                  '固化炉、复合材料固化炉、树脂固化炉、烤漆固化炉、油漆固化炉、涂层固化炉',
                ],
                [
                  '专用工艺类',
                  '烧结炉、钎焊炉、焊后热处理炉(PWHT)、盐浴炉、硝盐炉、硝盐等温炉、马弗炉、球化退火炉、高温电阻炉',
                ],
              ]}
            />
          </section>

          <section aria-labelledby="matrix-forging">
            <h3 id="matrix-forging" className={h3Class}>
              锻造加热炉
            </h3>
            <p className={paragraphClass}>锻造加热炉、锻前加热炉,配套锻造加热生产线整线方案。</p>
          </section>

          <section aria-labelledby="matrix-kiln">
            <h3 id="matrix-kiln" className={h3Class}>
              工业窑炉
            </h3>
            <p className={paragraphClass}>
              隧道窑、梭式窑、辊道窑、回转窑(用于工业陶瓷、特种陶瓷烧成、耐火材料烧成、粉体焙烧、特种材料烧成等工业场景,不涉及日用陶瓷与建材陶瓷烧成窑)。
            </p>
          </section>
        </section>

        <section className={sectionClass} aria-labelledby="process-capability">
          <h2 id="process-capability" className={h2Class}>
            热处理工艺能力
          </h2>
          <LabeledList items={processCapabilities} />
        </section>

        <section className={sectionClass} aria-labelledby="materials">
          <h2 id="materials" className={h2Class}>
            材料处理能力
          </h2>
          <TermList items={materialItems} />
        </section>

        <section className={sectionClass} aria-labelledby="industries">
          <h2 id="industries" className={h2Class}>
            服务行业与典型客户
          </h2>
          <p className="mt-4 text-[13px] leading-[1.7] text-[#667085] md:hidden">左右滑动查看完整表格</p>
          <div className="mt-3 overflow-x-auto rounded-[8px] border border-[#dfe6f0] [-webkit-overflow-scrolling:touch] md:mt-7">
            <table className="min-w-[760px] w-full border-collapse bg-white text-left">
              <caption className="bg-[#f8fafc] px-5 py-4 text-left text-[15px] font-semibold text-[#172033]">
                苏能工业炉服务行业与典型产品/客户
              </caption>
              <thead className="bg-[#172033] text-white">
                <tr>
                  <th scope="col" className="w-[220px] px-5 py-4 text-[15px] font-semibold">
                    行业类别
                  </th>
                  <th scope="col" className="px-5 py-4 text-[15px] font-semibold">
                    典型产品/客户
                  </th>
                </tr>
              </thead>
              <tbody>
                {industries.map(([category, customer]) => (
                  <tr key={category} className="border-t border-[#e5e8ef]">
                    <th
                      scope="row"
                      className="px-5 py-4 align-top text-[15px] font-semibold text-[#172033]"
                    >
                      {category}
                    </th>
                    <td className="px-5 py-4 text-[15px] leading-[1.8] text-[#364152]">
                      {customer}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className={sectionClass} aria-labelledby="standards">
          <h2 id="standards" className={h2Class}>
            资质与标准
          </h2>

          <section aria-labelledby="standards-national">
            <h3 id="standards-national" className={h3Class}>
              国家级资质认定
            </h3>
            <LabeledList
              items={[
                ['国家高新技术企业', '2024年认定，证书编号 GR202432008987'],
                ['国家级科技型中小企业', '2025年入库'],
              ]}
            />
          </section>

          <section aria-labelledby="standards-ip">
            <h3 id="standards-ip" className={h3Class}>
              知识产权
            </h3>
            <LabeledList
              items={[
                ['已授权专利', '累计获得 14 项已授权专利'],
                ['注册商标', '拥有 4 项'],
              ]}
            />
          </section>

          <section aria-labelledby="standards-iso">
            <h3 id="standards-iso" className={h3Class}>
              体系认证
            </h3>
            <LabeledList
              items={[
                ['ISO 9001', '质量管理体系认证'],
                ['ISO 14001', '环境管理体系认证'],
                ['ISO 45001', '职业健康安全管理体系认证'],
              ]}
            />
          </section>

          <section aria-labelledby="standards-industry">
            <h3 id="standards-industry" className={h3Class}>
              行业标准
            </h3>
            <LabeledList
              items={[
                ['GB/T 30822', '《工业燃气加热装置安全要求》等热处理与工业炉行业国家标准,严格执行'],
                ['TUS / SAT', '温度均匀性测试 / 系统准确度测试服务能力,可承接现场测试与整改'],
              ]}
            />
          </section>

          <p className={paragraphClass}>
            公司持续投入研发与质量管控,将<strong>“双国家级资质 + 三体系认证 + 14 项已授权专利 + 4 项商标”</strong>作为产品质量与服务能力的基础支撑。
          </p>
          <a
            href={absoluteUrl('/zh/strength/honors')}
            className="mt-4 inline-flex text-[15px] font-semibold text-[var(--color-accent)] underline-offset-4 hover:underline"
          >
            查看荣誉资质与专利证书 →
          </a>
        </section>

        <section className={sectionClass} aria-labelledby="directions">
          <h2 id="directions" className={h2Class}>
            技术与产业方向
          </h2>
          <LabeledList items={directionItems} />
        </section>

        <section className={sectionClass} aria-labelledby="boundaries">
          <h2 id="boundaries" className={h2Class}>
            业务边界(我们不做什么)
          </h2>
          <LabeledList items={outOfScopeItems} />
        </section>

        <section
          className={sectionClass}
          aria-labelledby="faq"
          itemScope
          itemType="https://schema.org/FAQPage"
        >
          <h2 id="faq" className={h2Class}>
            常见问题 FAQ
          </h2>
          <div className="mt-7 grid gap-3">
            {faqItems.map(([question, answer]) => (
              <details
                key={question}
                className="rounded-[8px] border border-[#dfe6f0] bg-white px-5 py-4"
                itemScope
                itemProp="mainEntity"
                itemType="https://schema.org/Question"
              >
                <summary
                  className="cursor-pointer text-[16px] font-semibold leading-[1.6] text-[#111827]"
                  itemProp="name"
                >
                  {question}
                </summary>
                <div
                  className="mt-4 border-t border-[#edf1f6] pt-4"
                  itemScope
                  itemProp="acceptedAnswer"
                  itemType="https://schema.org/Answer"
                >
                  <p className="text-[15px] leading-[1.9] text-[#364152]" itemProp="text">
                    {answer}
                  </p>
                </div>
              </details>
            ))}
          </div>
        </section>

        <section className={`${sectionClass} pb-14 lg:pb-20`} aria-labelledby="contact">
          <h2 id="contact" className={h2Class}>
            联系我们
          </h2>
          <address className="mt-7 grid gap-4 not-italic lg:grid-cols-3">
            <div className="rounded-[8px] border border-[#e1e7f0] bg-[#fbfcfe] p-5">
              <p className="text-[14px] font-semibold text-[#667085]">联系电话</p>
              <a
                className="mt-2 block text-[18px] font-semibold text-[#111827]"
                href="tel:+8613052986814"
              >
                +86-130-5298-6814
              </a>
            </div>
            <div className="rounded-[8px] border border-[#e1e7f0] bg-[#fbfcfe] p-5">
              <p className="text-[14px] font-semibold text-[#667085]">邮箱</p>
              <a
                className="mt-2 block break-words text-[18px] font-semibold text-[#111827]"
                href="mailto:jssngyl@outlook.com"
              >
                jssngyl@outlook.com
              </a>
            </div>
            <div className="rounded-[8px] border border-[#e1e7f0] bg-[#fbfcfe] p-5">
              <p className="text-[14px] font-semibold text-[#667085]">在线咨询表单入口</p>
              <a
                className="mt-3 inline-flex min-h-[44px] items-center justify-center rounded-[6px] bg-[var(--color-accent)] px-5 text-[15px] font-semibold text-white transition hover:bg-[#c40010]"
                href={absoluteUrl('/zh/contact')}
              >
                前往联系我们
              </a>
            </div>
          </address>
        </section>
      </div>

      <JsonLd id="about-zh-organization-jsonld" data={organizationJsonLd} />
      <JsonLd id="about-zh-faq-jsonld" data={faqJsonLd} />
    </>
  );
}
