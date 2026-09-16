import Image from 'next/image';
import Link from 'next/link';

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
    '江苏苏能工业炉有限公司专业从事电阻式与燃气式工业加热及热处理装备的研发、设计与制造，业务覆盖单机设备、配套件及整线设备供货。公司聚焦热处理、锻造加热与工业干燥/固化三大工序，服务于装备制造、能源等制造领域客户；航空航天或国防军工相关表述仅指热处理装备或工业炉设备配套场景，不代表苏能持有军品资质、国军标认证、AMS 2750、Nadcap 或 CQI-9 等特殊行业认证。',
    '公司拥有完整的炉型产品体系。周期式产品涵盖井式炉、台车炉、车底炉、立式炉、箱式炉、罩式炉、坑式炉、钟罩炉，以及多用炉、密封多用炉、密封箱式多用炉等高端机型；连续式产品涵盖推杆炉、辊底炉、网带炉、链板炉、链式加热炉、步进炉、转底炉、隧道炉等多种传送形式；真空与可控气氛系列涵盖真空热处理炉、保护气氛炉、氮基/吸热式/放热式气氛炉、全氢罩式炉、光亮退火炉、辐射管炉；专用工艺炉则涵盖固化炉（复合材料、碳纤维缠绕、烤漆/油漆/涂层固化）、烧结炉、钎焊炉、焊后热处理炉（PWHT）、盐浴炉、硝盐等温炉、马弗炉、球化退火炉、高温电阻炉等。',
    '在工艺能力上，公司构建了完整的热处理工艺谱系，包括退火（光亮退火、球化退火、真空退火、全氢退火等）、淬火（真空淬火、等温淬火、油/水/气淬等）、回火（真空回火、低/中/高温回火）、正火、调质、固溶、时效、渗碳（含低压渗碳）、渗氮（含离子渗氮、氮势可控渗氮）、碳氮/氮碳共渗、渗硼、焊后热处理（PWHT）、烧结、钎焊及树脂与复合材料固化。可处理碳钢、合金钢、不锈钢、模具钢、铝合金、铜合金、钛合金、高温合金及粉末冶金件等多种材料体系。',
    '围绕主机产品，公司同步提供全套配套件：工业炉控制系统（电控柜、PLC、DCS、温控系统）、加热元件（硅碳棒、硅钼棒、电阻带、辐射管）、热电偶与测温系统、耐火保温材料、装出料机构与料筐料盘、淬火冷却系统、燃烧器（随整炉/整线配套）、循环风机、蓄热体、炉门炉盖等关联部件；并具备紧固件、螺栓、弹簧、链条等专用热处理生产线，以及渗碳淬火、光亮退火、锻造加热等整线设备的设计、制造与集成能力。',
    '公司产品广泛服务于装备制造、汽车零部件、工程机械、重工机械、能源装备、金属热处理加工等工业制造场景，覆盖齿轮、轴承、紧固件、弹簧、模具、刀具、锻件铸件、压力容器、油气管材、风电零部件、石化设备、矿山机械、农机件等零部件热处理装备需求；同时对接钢厂、有色金属带材厂、管材厂等型材客户，承接板、带、线、管、棒材的热处理装备配套。',
    '公司具备 GB/T 30822 等行业标准的对接与执行能力，紧密契合重大技术装备、高端装备、工业母机等国家战略方向，积极响应“双碳”目标、节能降碳、绿色制造与智能制造转型，致力于以高品质装备与国产替代能力，与客户共同推动工业热处理行业的高质量发展。',
  ],
  en: [
    "Jiangsu Suneng Industrial Furnace Co., Ltd. was established in 2006 and operates a manufacturing site in Taizhou, Jiangsu. Suneng designs and manufactures custom industrial furnaces and heat-treatment lines, and evaluates overhaul and retrofit projects for its own equipment and selected third-party furnaces.",
    "The equipment range includes batch and continuous furnaces such as bogie-hearth, box, pit, bell-type, mesh-belt, roller-hearth, pusher and rotary-hearth furnaces. Production-line proposals coordinate heating, conveying, quenching or other cooling, loading and unloading, and electrical controls around the workpiece and process requirements. Supporting systems may include heating elements, combustion equipment, measurement, refractory insulation and circulation equipment, as defined for each project.",
    "The delivery process covers requirements and proposal confirmation, furnace fabrication and assembly, line integration, pre-delivery checks, and installation, commissioning and acceptance support. Capacity, temperature performance, energy use and product-quality acceptance must be tied to an agreed material, load, operating condition and test method; design figures are not measured production results.",
    "Suneng is an equipment manufacturer and retrofit service provider, not a per-piece heat-treatment processor or a general engineering contractor. It does not supply induction-heating systems, steelmaking furnaces, coke or chemical reaction furnaces, cement or glass kilns, building-material ceramic kilns, industrial boilers, cupolas, waste incinerators or domestic heating and cooking products. Burners are supplied as part of furnace or line projects, rather than as standalone burner supply contracts.",
    "For imported equipment, retrofit feasibility depends on drawings, controls, spare parts and site condition. Special aerospace, defense or automotive process certifications must be confirmed separately; a proposed furnace configuration is not evidence of certification. The company qualification page provides the business license, National High-Tech Enterprise certificate, ISO 9001 certificate and 14 patent certificates, with original documents for inspection.",

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
    label: { zh: '注册资本', en: 'Registered Capital' },
    value: { zh: '5080', en: '50.8' },
    unit: { zh: '万元', en: 'million CNY' },
    icon: '/images/about/profile-icons-stat-source/stat-capital.png',
  },
  {
    key: 'projects',
    label: { zh: '工业炉新建与改造项目', en: 'Industrial Furnace New-build & Retrofit Projects' },
    value: { zh: '1000+', en: '1000+' },
    unit: { zh: '项', en: 'Projects' },
    icon: '/images/about/profile-icons-stat-source/stat-employees.png',
  },
  {
    key: 'area',
    label: { zh: '生产基地占地（公司自报）', en: 'Production Site (Company-reported)' },
    value: { zh: '约14700', en: 'Approx. 14,700' },
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
    text: { zh: '公司自报生产基地占地面积约14700㎡，用于工业炉方案设计、制造、装配与交付。', en: 'The company reports an approximately 14,700 m² production site for industrial-furnace design, manufacturing, assembly and delivery.' },
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
  const displayParagraphs = locale === 'en'
    ? [...profileFallbackParagraphs.en]
    : paragraphs.length ? paragraphs : [...profileFallbackParagraphs.zh];

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
          {locale === 'zh' && <p data-delivery-boundary>整线交付指合同约定的工业炉及配套设备设计、制造、集成与调试配合，不包含土建、环保总包或工程总承包；涉及专项资质的工作，由具备相应资质的单位承担。</p>}
          {locale === 'en' && <p><Link href="/en/strength/honors" className="font-semibold text-primary underline underline-offset-4">View qualification and patent originals</Link></p>}

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
                  <p className="mt-3 text-[15px] leading-[1.9] text-[#667085]">{item.text[locale]}</p>
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
                      <p className="mt-4 text-[14px] leading-[1.7] text-[#667085]">{item.text[locale]}</p>
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
