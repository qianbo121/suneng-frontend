import Image from 'next/image';

import { AboutStatsPanel, AboutStatsPanelItem } from '@/components/about/AboutStatsPanel';
import { EmptyState } from '@/components/ui/EmptyState';

type AboutProfileSectionProps = {
  locale: 'zh' | 'en';
  title: string;
  content: string;
  image: string;
};

function splitParagraphs(content: string) {
  return content
    .split(/\n+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

const profileFallbackParagraphs = {
  zh: [
    '江苏苏能工业炉有限公司成立于2006年，致力于为全球工业客户提供高效、智能、可靠的工业炉设备及系统集成解决方案。',
    '公司专注于各类工业炉及热处理装备的研发与制造，产品涵盖台车炉、推杆炉、辊底炉、网带炉、回火炉等系列，广泛应用于机械制造、汽车零部件、航空航天、新能源、精密加热领域。',
    '依托二十余年的技术积累，苏能工业炉坚持以“专业品质、品质先行、客户至上”的经营理念，持续提升技术研发与制造，建立了完善的管理体系、生产体系、售后服务体系和创新体系。',
    '公司总部位长三角重要的商业制造基地，拥有多台高精度数控挤加设备与智能化装配能源设施与搬运设施，致力于为客户提供高效、可靠、节能的工业炉设备和系统集成解决方案。',
    '面向未来，苏能工业炉将持续以技术创新为核心，不断提升产品与服务价值，携手客户共共赢，助力工业高质量发展新未来。',
  ],
  en: [
    'Jiangsu Suneng Industrial Furnace Co., Ltd. is committed to efficient, intelligent and reliable industrial furnace equipment and system solutions.',
    'The company focuses on R&D and manufacturing of heat treatment equipment, serving machinery, automotive parts, aerospace, new energy and precision manufacturing.',
    'With long-term technical accumulation, Suneng continues to improve R&D, manufacturing and service capabilities.',
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
  image,
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
        <div className="grid items-start gap-12 lg:grid-cols-[1fr_0.98fr] lg:gap-[72px]">
          <div className="space-y-[22px] text-[15px] font-normal leading-[2] text-[#333333] lg:text-[16px]">
            {displayParagraphs.map((item, index) => (
              <p key={`${item}-${index}`}>{item}</p>
            ))}
          </div>
          <div className="relative min-h-[300px] overflow-hidden rounded-md bg-[#e8edf3] lg:min-h-[456px]">
            <Image
              src={image || '/images/about/about_img_company_building_01.png'}
              alt={title || (locale === 'en' ? 'Company profile image' : '公司简介配图')}
              fill
              className="object-cover"
              sizes="(min-width: 1024px) 50vw, 100vw"
            />
          </div>
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
                    <Image src={item.image} alt={item.title[locale]} fill className="object-cover" sizes="(min-width: 1024px) 33vw, 100vw" />
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
