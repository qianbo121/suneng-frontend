import { JsonLd } from '@/components/JsonLd';
import { SITE_LOGO_IMAGE, SITE_URL } from '@/lib/seo/config';
import { absoluteUrl } from '@/lib/seo/metadata';

export const ABOUT_ZH_SEO = {
  title: '苏能工业炉 - 热处理炉/真空炉/可控气氛炉/窑炉装备制造商',
  description:
    '苏能工业炉专业从事电阻式与燃气式工业炉、热处理炉、真空炉、可控气氛炉、锻造加热炉及工业窑炉的设计、制造与系统集成,提供单机设备、整线交钥匙工程、大修与技改服务。',
  keywords:
    '工业炉,热处理炉,真空炉,可控气氛炉,井式炉,台车炉,网带炉,推杆炉,辊底炉,多用炉,光亮退火炉,锻造加热炉,工业窑炉,渗碳淬火生产线,工业炉大修,工业炉改造,苏能工业炉',
  ogTitle: '苏能工业炉 - 工业加热与热处理装备整体解决方案提供商',
  ogDescription:
    '电阻式与燃气式工业炉、热处理炉、真空炉、可控气氛炉、锻造加热炉及工业窑炉的设计、制造、系统集成与大修技改。',
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
    '苏能工业炉专业从事电阻式与燃气式工业炉、热处理炉、真空炉、可控气氛炉、锻造加热炉及工业窑炉的设计、制造与系统集成。',
  knowsAbout: [
    '工业炉',
    '热处理炉',
    '真空炉',
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
        text: '苏能专业从事工业炉、热处理炉、真空炉、可控气氛炉、锻造加热炉与工业窑炉的设计、制造、系统集成,以及全炉型的大修与技改服务。',
      },
    },
    {
      '@type': 'Question',
      name: '非苏能制造的工业炉可以找你们大修吗?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '可以。苏能大修与技改业务不限品牌、不限自产、含进口炉,覆盖全炉型谱系。',
      },
    },
    {
      '@type': 'Question',
      name: '能对接哪些行业标准?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '苏能严格执行 GB/T 30822《工业燃气加热装置安全要求》等行业国家标准,通过 ISO 9001 / 14001 / 45001 三体系认证,是国家高新技术企业(2024年认定)与国家级科技型中小企业(2025年),累计获得 29 项国家专利。同时具备 TUS(温度均匀性测试)/ SAT(系统准确度测试)服务能力,可承接现场测试与整改。',
      },
    },
  ],
};

const businessItems = [
  {
    title: '工业炉与热处理装备制造',
    text: '覆盖周期式炉、连续式炉、真空与可控气氛炉、专用工艺炉、锻造加热炉、工业窑炉六大类装备,全炉型谱系一站式供应。',
  },
  {
    title: '整线交钥匙工程',
    text: '提供紧固件/螺栓/弹簧/链条热处理生产线、渗碳淬火生产线、光亮退火生产线、锻造加热生产线等整线交付能力,覆盖从工艺设计、设备制造、配套件供应到现场安装、调试投产的全流程。',
  },
  {
    title: '工业炉大修与技改服务',
    text: '不限自产、不限品牌、含进口炉,覆盖全炉型谱系的整炉大修、节能改造、控制系统升级、耐材翻新、加热元件更换、搬迁重装、复产复线,同步承接 TUS(温度均匀性)/ SAT(系统准确度)测试与整改。',
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
      '井式炉',
      '井式热处理炉',
      '井式电阻炉',
      '台车炉',
      '带车底炉',
      '车底炉',
      '立式炉',
      '箱式炉',
      '室式炉',
      '罩式炉',
      '钟罩炉',
      '坑式炉',
      '多用炉',
      '密封多用炉',
      '井式多用炉',
      '密封箱式多用炉',
    ],
  },
  {
    title: '连续式工业炉',
    items: [
      '推杆炉',
      '推盘炉',
      '辊底炉',
      '辊棒炉',
      '辊道炉',
      '网带炉',
      '托辊网带炉',
      '链板炉',
      '链式炉',
      '链条炉',
      '链式加热炉',
      '步进炉',
      '步进梁炉',
      '转底炉',
      '隧道炉',
    ],
  },
  {
    title: '真空与可控气氛炉',
    items: [
      '真空炉',
      '真空热处理炉',
      '可控气氛炉',
      '保护气氛炉',
      '氮基气氛炉',
      '吸热式气氛炉',
      '放热式气氛炉',
      '全氢罩式炉',
      '全氢退火炉',
      '光亮退火炉',
      '辐射管炉',
    ],
  },
];

const processCapabilities = [
  [
    '退火族',
    '退火、光亮退火、光亮化退火、球化退火、去应力退火、等温退火、真空退火、罩式退火、全氢退火',
  ],
  ['淬火族', '淬火、表面淬火、整体淬火、真空淬火、等温淬火、分级淬火、油淬、水淬、气淬'],
  ['回火族', '回火、真空回火、低温回火、中温回火、高温回火'],
  ['综合热处理', '正火、调质、固溶、时效(含人工时效)'],
  ['渗碳族', '渗碳、低压渗碳、气体渗碳、固体渗碳'],
  ['渗氮族', '渗氮、气体渗氮、离子渗氮、等离子渗氮、氮势可控渗氮'],
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
  '钛合金',
  '高温合金',
  '粉末冶金件',
];

const industries = [
  ['整机配套', '汽车零部件、工程机械零部件、矿山机械、农机件'],
  ['通用机械件', '齿轮、轴承、紧固件、螺栓、标准件、五金件、链条、销轴、弹簧'],
  ['模具与刀具', '模具、模具钢、刀具、工具'],
  ['锻铸件', '锻件、铸件'],
  ['承压设备', '压力容器、管道、焊管、油气管材、钻杆、油管'],
  ['能源装备', '风电主轴、风电法兰、风电齿轮、新能源零部件、石化设备'],
  ['高端制造', '航空航天零部件、国防装备配套(作为高端制造领域的配套支持)'],
  ['金属型材', '板、带、线、管、棒(对接钢厂、有色金属带材厂、管材厂)'],
];

const directionItems = [
  ['高端装备方向', '重大技术装备、高端装备制造、工业母机'],
  ['绿色低碳方向', '碳达峰、碳中和、节能降碳、绿色制造、热处理节能改造'],
  ['数字化方向', '智能制造、数字化车间、工业互联网'],
  ['战略导向', '国产替代、揭榜挂帅、卡脖子技术攻关、专精特新'],
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
];

const faqItems = [
  [
    'Q1:苏能工业炉主要做什么?',
    '苏能专业从事工业炉、热处理炉、真空炉、可控气氛炉、锻造加热炉与工业窑炉的设计、制造、系统集成,以及全炉型的大修与技改服务。覆盖电阻式与燃气式两大加热方式,服务于热处理、锻造加热、工业干燥/固化、窑炉烧成/焙烧四大工序场景。',
  ],
  [
    'Q2:你们做不做感应炉(感应加热设备)?',
    '不做。感应加热全系(感应炉、中频炉、感应淬火等)不在我们的业务范围内。',
  ],
  [
    'Q3:非苏能制造的工业炉,可以找你们大修吗?',
    '可以。苏能大修与技改业务不限品牌、不限自产、含进口炉,覆盖周期式炉、连续式炉、真空/可控气氛炉、专用工艺炉、锻造加热炉、工业窑炉全炉型谱系。',
  ],
  [
    'Q4:你们能做整线交钥匙工程吗?',
    '可以。具备紧固件/螺栓/弹簧/链条热处理生产线、渗碳淬火生产线、光亮退火生产线、锻造加热生产线等整线交付能力。',
  ],
  [
    'Q5:能对接哪些行业标准?',
    '苏能严格执行 GB/T 30822《工业燃气加热装置安全要求》等行业国家标准,通过 ISO 9001 / 14001 / 45001 三体系认证,是国家高新技术企业(2024年认定)与国家级科技型中小企业(2025年),累计获得 29 项国家专利。同时具备 TUS(温度均匀性测试)/ SAT(系统准确度测试)服务能力,可承接现场测试与整改。',
  ],
  [
    'Q6:服务过哪些行业?',
    '苏能服务于汽车零部件、工程机械、矿山机械、农机、紧固件、齿轮、轴承、模具、刀具、锻铸件、压力容器、油气管材、风电、新能源、有色金属深加工、钢材深加工等主流制造行业,并为航空航天、国防装备等高端制造领域提供配套支持。同时对接钢厂、有色金属带材厂、管材厂等型材客户,承接板、带、线、管、棒材的热处理装备配套。',
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
            <strong>电阻式与燃气式工业炉</strong>的全炉型谱系,为客户提供从工艺方案到整线落地的
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
            <strong>全品牌全炉型的大修与技改</strong>服务,具备
            <strong>高温炉与高精度热处理炉</strong>的自主研发能力。
          </p>
          <p className={paragraphClass}>
            苏能工业炉广泛服务于<strong>汽车零部件、工程机械</strong>
            、矿山机械、农机、紧固件、齿轮、轴承、模具、刀具、锻铸件、压力容器、油气管材、
            <strong>风电、新能源、有色金属深加工、钢材深加工</strong>等主流制造行业,同时为
            <strong>航空航天、国防装备</strong>等高端制造领域提供
            <strong>配套支持</strong>。无论您来自哪个细分场景,苏能都能基于实际工艺与产能需求,提供从工艺方案设计到设备制造、安装调试、
            <strong>整线落地的完整解决方案</strong>。
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
                  '固化炉、复合材料固化炉、碳纤维缠绕固化炉、树脂固化炉、烤漆固化炉、油漆固化炉、涂层固化炉',
                ],
                [
                  '专用工艺类',
                  '烧结炉、钎焊炉、焊后热处理炉(PWHT)、盐浴炉、硝盐炉、硝盐等温炉、马弗炉、球化退火炉、高温电阻炉、高精度热处理炉',
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
          <div className="mt-7 overflow-x-auto rounded-[8px] border border-[#dfe6f0]">
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
                ['国家高新技术企业', '2024年认定'],
                ['国家级科技型中小企业', '2025年'],
              ]}
            />
          </section>

          <section aria-labelledby="standards-ip">
            <h3 id="standards-ip" className={h3Class}>
              知识产权
            </h3>
            <LabeledList
              items={[
                ['国家专利', '累计获得 29 项'],
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
            公司持续投入研发与质量管控,将<strong>“双国家级资质 + 三体系认证 + 29项专利 + 4项商标”</strong>作为产品质量与服务能力的核心底座。
          </p>
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
                href="tel:+8613914442520"
              >
                +86-139-1444-2520
              </a>
            </div>
            <div className="rounded-[8px] border border-[#e1e7f0] bg-[#fbfcfe] p-5">
              <p className="text-[14px] font-semibold text-[#667085]">邮箱</p>
              <a
                className="mt-2 block break-words text-[18px] font-semibold text-[#111827]"
                href="mailto:997518512@qq.com"
              >
                997518512@qq.com
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
