import Image from 'next/image';

import { AboutStatsPanel, AboutStatsPanelItem } from '@/components/about/AboutStatsPanel';
import { EmptyState } from '@/components/ui/EmptyState';
import { buildBrandImageAlt, joinImageAlt } from '@/lib/seo';

type AboutProfileSectionProps = {
  locale: 'zh' | 'en';
  title: string;
  content: string;
};

function splitParagraphs(content: string) {
  return content
    .split(/\n+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

const profileFallbackParagraphs = {
  zh: [
    '江苏苏能工业炉有限公司专业从事电阻式与燃气式工业加热及热处理装备的研发、设计与制造，业务覆盖单机设备、配套件及整线交钥匙工程。公司聚焦热处理、锻造加热与工业干燥/固化三大工序，致力于以高品质装备和完整工艺解决方案，服务于装备制造、能源、航空航天与国防军工等领域客户。',
    '公司拥有完整的炉型产品体系。周期式产品涵盖井式炉、台车炉、车底炉、立式炉、箱式炉、罩式炉、坑式炉、钟罩炉，以及多用炉、密封多用炉、密封箱式多用炉等高端机型；连续式产品涵盖推杆炉、辊底炉、网带炉、链板炉、链式加热炉、步进炉、转底炉、隧道炉等多种传送形式；真空与可控气氛系列涵盖真空热处理炉、保护气氛炉、氮基/吸热式/放热式气氛炉、全氢罩式炉、光亮退火炉、辐射管炉；专用工艺炉则涵盖固化炉（复合材料、碳纤维缠绕、烤漆/油漆/涂层固化）、烧结炉、钎焊炉、焊后热处理炉（PWHT）、盐浴炉、硝盐等温炉、马弗炉、球化退火炉、高温电阻炉等。',
    '在工艺能力上，公司构建了完整的热处理工艺谱系，包括退火（光亮退火、球化退火、真空退火、全氢退火等）、淬火（真空淬火、等温淬火、油/水/气淬等）、回火（真空回火、低/中/高温回火）、正火、调质、固溶、时效、渗碳（含低压渗碳）、渗氮（含离子渗氮、氮势可控渗氮）、碳氮/氮碳共渗、渗硼、焊后热处理（PWHT）、烧结、钎焊及树脂与复合材料固化。可处理碳钢、合金钢、不锈钢、模具钢、铝合金、铜合金、钛合金、高温合金及粉末冶金件等多种材料体系。',
    '围绕主机产品，公司同步提供全套配套件：工业炉控制系统（电控柜、PLC、DCS、温控系统）、加热元件（硅碳棒、硅钼棒、电阻带、辐射管）、热电偶与测温系统、耐火保温材料、装出料机构与料筐料盘、淬火冷却系统、燃烧器（随整炉/整线配套）、循环风机、蓄热体、炉门炉盖等关联部件；并具备紧固件、螺栓、弹簧、链条等专用热处理生产线，以及渗碳淬火、光亮退火、锻造加热等整线交钥匙工程的设计与建造能力。',
    '公司产品广泛服务于汽车与工程机械零部件、齿轮、轴承、紧固件、弹簧、模具、刀具、锻件铸件、压力容器、油气管材、风电（主轴/法兰/齿轮）、核电零部件、石化设备、矿山机械、农机件，以及航空航天、航发零部件与军工兵器装备等高端制造领域；同时对接钢厂、有色金属带材厂、管材厂等型材客户，承接板、带、线、管、棒材的热处理装备配套。',
    '公司具备 AMS 2750、CQI-9、Nadcap、ASME、API、GJB、特种设备制造许可、GB/T 30822 等国内外行业标准的对接与执行能力，紧密契合重大技术装备、高端装备、工业母机等国家战略方向，积极响应“双碳”目标、节能降碳、绿色制造与智能制造转型，致力于以高品质装备与国产替代能力，与客户共同推动工业热处理行业的高质量发展。',
  ],
  en: [
    'Jiangsu Suneng Industrial Furnace Co., Ltd. specializes in the R&D, design and manufacturing of electric-resistance and gas-fired industrial heating and heat treatment equipment. Its business covers stand-alone equipment, supporting components and turnkey production lines. The company focuses on heat treatment, forging heating and industrial drying/curing, serving customers in equipment manufacturing, energy, aerospace and defense industries with high-quality equipment and complete process solutions.',
    'Suneng has built a complete furnace portfolio. Batch-type products include pit furnaces, trolley furnaces, car-bottom furnaces, vertical furnaces, box furnaces, bell furnaces, pit-type furnaces, hood furnaces, multi-purpose furnaces, sealed multi-purpose furnaces and sealed box-type multi-purpose furnaces. Continuous products include pusher furnaces, roller hearth furnaces, mesh belt furnaces, chain plate furnaces, chain heating furnaces, walking beam furnaces, rotary hearth furnaces and tunnel furnaces. Vacuum and controlled-atmosphere products include vacuum heat treatment furnaces, protective-atmosphere furnaces, nitrogen-based, endothermic and exothermic atmosphere furnaces, full-hydrogen bell furnaces, bright annealing furnaces and radiant tube furnaces. Dedicated process furnaces include curing furnaces for composite materials, carbon fiber winding, paint and coating processes, sintering furnaces, brazing furnaces, PWHT furnaces, salt bath furnaces, nitrate isothermal furnaces, muffle furnaces, spheroidizing annealing furnaces and high-temperature resistance furnaces.',
    'In process capability, the company covers a broad heat treatment spectrum, including annealing, bright annealing, spheroidizing annealing, vacuum annealing, full-hydrogen annealing, quenching, vacuum quenching, austempering, oil, water and gas quenching, tempering, vacuum tempering, low, medium and high-temperature tempering, normalizing, quenching and tempering, solution treatment, aging, carburizing including low-pressure carburizing, nitriding including ion nitriding and controllable nitriding potential, carbonitriding, nitrocarburizing, boronizing, PWHT, sintering, brazing and resin or composite curing. The equipment supports carbon steel, alloy steel, stainless steel, die steel, aluminum alloy, copper alloy, titanium alloy, superalloy and powder metallurgy parts.',
    'Around its main furnace products, Suneng also provides complete supporting components, including industrial furnace control systems, electrical cabinets, PLC, DCS, temperature control systems, heating elements, silicon carbide rods, molybdenum disilicide rods, resistance strips, radiant tubes, thermocouples and temperature measurement systems, refractory insulation materials, loading and unloading mechanisms, baskets and trays, quenching cooling systems, burners supplied with furnace or line projects, circulation fans, regenerators, furnace doors and covers. The company also has design and construction capability for dedicated heat treatment lines for fasteners, bolts, springs and chains, as well as turnkey lines for carburizing and quenching, bright annealing and forging heating.',
    'The company serves automotive and construction machinery components, gears, bearings, fasteners, springs, molds, cutting tools, forgings, castings, pressure vessels, oil and gas pipes, wind power parts such as main shafts, flanges and gears, nuclear power components, petrochemical equipment, mining machinery, agricultural machinery, aerospace components, aero-engine parts and defense equipment. It also supports steel mills, non-ferrous strip plants and pipe manufacturers with heat treatment equipment for plates, strips, wires, pipes and bars.',
    'Suneng is capable of aligning with and executing domestic and international standards such as AMS 2750, CQI-9, Nadcap, ASME, API, GJB, special equipment manufacturing licensing requirements and GB/T 30822. The company closely follows national strategic directions such as major technical equipment, high-end equipment and industrial mother machines, responds to carbon peaking and carbon neutrality, energy conservation, green manufacturing and intelligent manufacturing transformation, and works with customers to promote high-quality development in industrial heat treatment.',
  ],
} as const;

const stats: AboutStatsPanelItem[] = [
  {
    key: 'established',
    label: { zh: '成立时间', en: 'Established' },
    value: { zh: '2006', en: '2006' },
    unit: { zh: '年', en: '' },
    icon: '/images/about/profile-icons-stat-source/stat-established.png',
  },
  {
    key: 'capital',
    label: { zh: '注册资本', en: 'Capital' },
    value: { zh: '5080', en: '5080' },
    unit: { zh: '万元', en: 'Wan RMB' },
    icon: '/images/about/profile-icons-stat-source/stat-capital.png',
  },
  {
    key: 'employees',
    label: { zh: '员工人数', en: 'Employees' },
    value: { zh: '150+', en: '150+' },
    unit: { zh: '名员工', en: 'Staff' },
    icon: '/images/about/profile-icons-stat-source/stat-employees.png',
  },
  {
    key: 'area',
    label: { zh: '厂区面积', en: 'Factory Area' },
    value: { zh: '14700', en: '14700' },
    unit: { zh: '㎡', en: 'm²' },
    icon: '/images/about/profile-icons-stat-source/stat-area.png',
  },
];

const advantages = [
  {
    title: { zh: '定制化方案', en: 'Customized Solution' },
    text: { zh: '根据客户工艺、产能与场地条件，提供一对一工业炉整体解决方案。', en: 'Tailored furnace solutions for process, capacity and site requirements.' },
    icon: '/images/about/profile-icons-cutout/adv-custom-cutout.png',
  },
  {
    title: { zh: '节能高效', en: 'Energy Efficient' },
    text: { zh: '优化炉体结构与热工系统设计，兼顾效率、能耗与稳定性。', en: 'Optimized thermal structure for efficiency and stability.' },
    icon: '/images/about/profile-icons-cutout/adv-energy-cutout.png',
  },
  {
    title: { zh: '品质保障', en: 'Quality Assurance' },
    text: { zh: '从设计、制造、装配到调试，建立严格质量控制与交付标准。', en: 'Strict quality control from design to delivery.' },
    icon: '/images/about/profile-icons-cutout/adv-quality-cutout.png',
  },
  {
    title: { zh: '售后服务', en: 'After-sales Service' },
    text: { zh: '提供安装调试、技术培训、维护支持与长期服务保障。', en: 'Installation, training, maintenance and long-term support.' },
    icon: '/images/about/profile-icons-cutout/adv-service-cutout.png',
  },
] as const;

const strengthCards = [
  {
    title: { zh: '现代化厂房', en: 'Modern Factory' },
    text: { zh: '占地14700㎡，拥有标准化厂房与办公楼，生产环境整洁规范，设备先进齐全。', en: 'Standardized workshop and office space with advanced equipment.' },
    image: '/images/about/about_img_company_building_01.png',
    icon: '/images/about/profile-icons-transparent/strength-factory.png',
  },
  {
    title: { zh: '先进生产装备', en: 'Advanced Equipment' },
    text: { zh: '配备数控加工中心、激光切割、焊接机器人等先进设备，保障产品质量稳定。', en: 'Advanced equipment supports reliable manufacturing quality.' },
    image: '/images/about/about_img_strength_equipment_01.png',
    icon: '/images/about/profile-icons-transparent/strength-equipment.png',
  },
  {
    title: { zh: '专业技术团队', en: 'Technical Team' },
    text: { zh: '拥有经验丰富的研发与制造团队，提供从设计、制造到售后一体化专业服务。', en: 'Experienced technical team for integrated service.' },
    image: '/images/about/about_img_strength_team_01.png',
    icon: '/images/about/profile-icons-transparent/strength-team.png',
  },
] as const;

function SourceIcon({
  src,
  alt,
  size,
  className = '',
}: {
  src: string;
  alt: string;
  size: number;
  className?: string;
}) {
  return (
    // 源文件直接引用，只通过固定正方形尺寸等比缩放，不改图形内容。
    <Image
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={`object-contain ${className}`}
      style={{ width: size, height: size }}
    />
  );
}

function SectionHeading({ children }: { children: string }) {
  return (
    <div className="text-center">
      <h2 className="text-[26px] font-normal leading-none text-[var(--color-text-strong)] lg:text-[28px]">{children}</h2>
      <div className="mx-auto mt-4 h-[3px] w-[40px] bg-[var(--color-accent)]" />
    </div>
  );
}

export function AboutProfileSection({
  locale,
  title,
  content,
}: AboutProfileSectionProps) {
  const paragraphs = splitParagraphs(content);
  const displayParagraphs = paragraphs.length ? paragraphs : [...profileFallbackParagraphs[locale]];

  if (!title && !paragraphs.length) {
    return (
      <EmptyState
        title={locale === 'en' ? 'Company profile is not available yet' : '公司简介内容暂未配置'}
        description={
          locale === 'en'
            ? 'The current environment did not return profile content from /api/v1/about.'
            : '当前环境尚未从 /api/v1/about 返回公司简介内容。'
        }
      />
    );
  }

  return (
    <section className="bg-white">
      <div className="px-6 lg:px-0">
        <div className="space-y-[22px] text-[15px] font-normal leading-[2] text-[#333333] lg:text-[16px]">
          {displayParagraphs.map((item, index) => (
            <p key={`${item}-${index}`}>{item}</p>
          ))}
        </div>

        <AboutStatsPanel
          locale={locale}
          items={stats}
          className="mt-12"
          dataAboutStats
          iconSize={30}
          itemClassName="min-h-[113px] py-7"
          separatorInset={30}
          separatorClassName="bg-white/20"
          labelClassName="text-[12px]"
          valueClassName="text-[36px] font-black lg:text-[45px]"
          unitClassName="text-[14px] font-normal"
        />

        <div className="mt-12">
          <SectionHeading>{locale === 'en' ? 'Core Advantages' : '核心优势'}</SectionHeading>
          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {advantages.map((item) => {
              return (
                <div key={item.title.zh} className="min-h-[165px] rounded-lg border border-[#d8d8d8] bg-white px-4 py-7 text-center shadow-[0_4px_20px_rgba(0,0,0,0.06)]">
                  <SourceIcon src={item.icon} alt="" size={88} className="mx-auto" />
                  <h3 className="mt-4 text-[20px] font-medium leading-none text-[var(--color-text-strong)]">{item.title[locale]}</h3>
                  <p className="mt-3 text-[15px] leading-[1.9] text-[var(--color-text-muted)]">{item.text[locale]}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-12">
          <SectionHeading>{locale === 'en' ? 'Manufacturing Strength' : '制造实力'}</SectionHeading>
          <div className="mt-10 grid gap-9 lg:grid-cols-3">
            {strengthCards.map((item) => {
              return (
                <article key={item.title.zh} className="overflow-hidden rounded-lg bg-white shadow-[0_10px_28px_rgba(15,23,42,0.08)]">
                  <div className="relative h-[220px]">
                    <Image
                      src={item.image}
                      alt={joinImageAlt(locale, [item.title[locale], item.text[locale], buildBrandImageAlt(locale, 'short')])}
                      fill
                      className="object-cover"
                      sizes="(min-width: 1024px) 33vw, 100vw"
                    />
                  </div>
                  <div className="px-6 py-7">
                    <div>
                      <h3 className="text-[18px] font-semibold leading-none text-[var(--color-text-strong)]">{item.title[locale]}</h3>
                      <p className="mt-4 text-[14px] leading-[1.7] text-[var(--color-text-muted)]">{item.text[locale]}</p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
