import { DEFAULT_DESCRIPTION, DEFAULT_TITLE } from '@/lib/seo/config';

export const HOME_SEO = {
  title: DEFAULT_TITLE,
  description: DEFAULT_DESCRIPTION,
  keywords: ['江苏苏能工业炉', '工业炉', '热处理炉', '热处理设备', '非标工业炉'],
};

export const PRODUCT_COLLECTION_SEO = {
  title: '产品中心｜工业热处理设备与非标工业炉定制',
  description:
    '苏能工业炉产品中心展示周期式、连续式热处理炉及热处理生产线等工业热处理设备，支持按工艺需求非标定制。',
  keywords: ['工业炉产品', '热处理炉产品', '热处理生产线', '台车炉', '井式炉', '网带炉', '非标工业炉'],
};

export const PRODUCT_DETAIL_SEO: Record<
  string,
  {
    title: string;
    description: string;
    keywords: string[];
    alternateName: string[];
  }
> = {
  'trolley-furnace': {
    title: '台车炉厂家｜台车式热处理炉定制、退火回火正火淬火加热炉',
    description:
      '江苏苏能工业炉提供台车炉、台车式热处理炉、台车式电阻炉等非标工业炉定制服务，适用于大型工件、铸件、焊接件、模具、结构件的退火、回火、正火、淬火加热等热处理工艺。',
    keywords: ['台车炉', '台车式炉', '台车式工业炉', '台车式热处理炉', '台车式电阻炉', '台车炉厂家', '台车炉定制', '台车炉价格'],
    alternateName: ['台车式炉', '台车式工业炉', '台车式热处理炉', '台车式电阻炉', 'Trolley Type Heat Treatment Furnace'],
  },
  'box-furnace': {
    title: '箱式炉厂家｜箱式热处理炉、箱式电阻炉定制',
    description:
      '江苏苏能工业炉提供箱式炉、箱式热处理炉、箱式电阻炉等非标工业炉定制服务，适用于中小型工件、模具、机械零件、试制件、小批量工件的退火、回火、正火、淬火加热、时效等热处理工艺。',
    keywords: ['箱式炉', '箱式工业炉', '箱式热处理炉', '箱式电阻炉', '箱式炉厂家', '箱式炉定制', '箱式炉价格', '箱式退火炉', '箱式回火炉'],
    alternateName: ['箱式工业炉', '箱式热处理炉', '箱式电阻炉', '箱式退火炉', '箱式回火炉', 'Box Furnace', 'Chamber Furnace'],
  },
  'pit-furnace': {
    title: '井式炉厂家｜井式热处理炉、井式电阻炉定制',
    description:
      '江苏苏能工业炉提供井式炉、井式热处理炉、井式电阻炉等非标工业炉定制服务，适用于轴类、杆件、长件、套筒件、竖直装炉工件的回火、退火、淬火加热、时效等热处理工艺。',
    keywords: ['井式炉', '井式热处理炉', '井式电阻炉', '井式炉厂家', '井式炉定制', '井式炉价格', '轴类热处理炉'],
    alternateName: ['井式炉', '井式热处理炉', '井式电阻炉', 'Pit Furnace'],
  },
  'bell-furnace': {
    title: '罩式炉厂家｜罩式热处理炉、气氛保护退火炉定制',
    description:
      '江苏苏能工业炉提供罩式炉、罩式热处理炉、气氛保护罩式炉等非标工业炉定制服务，适用于卷材、线材、盘卷、小型零件、批量装框工件的退火、回火、保温及气氛保护热处理工艺。',
    keywords: ['罩式炉', '罩式热处理炉', '罩式退火炉', '罩式电阻炉', '罩式炉厂家', '罩式炉定制', '罩式炉价格', '气氛保护罩式炉'],
    alternateName: ['罩式热处理炉', '罩式退火炉', '罩式电阻炉', '气氛保护罩式炉', 'Bell Furnace'],
  },
  'mesh-belt-furnace': {
    title: '网带炉厂家｜网带式热处理炉、小件批量热处理设备定制',
    description:
      '江苏苏能工业炉提供网带炉、网带式热处理炉等非标设备定制服务，适用于标准件、小型零件、五金件、紧固件、金属件的批量退火、回火、淬火加热、固溶等热处理工艺。',
    keywords: ['网带炉', '网带式热处理炉', '网带炉厂家', '网带炉定制', '网带炉价格', '网带式退火炉', '网带式回火炉'],
    alternateName: ['网带式热处理炉', '网带式退火炉', '网带式回火炉', 'Mesh Belt Furnace'],
  },
  'roller-hearth-furnace': {
    title: '辊底炉厂家｜辊底式热处理炉、板材棒材热处理设备定制',
    description:
      '江苏苏能工业炉提供辊底炉、辊底式热处理炉等非标工业炉定制服务，适用于板材、棒材、管材、规整工件的退火、回火、固溶、正火等热处理工艺。',
    keywords: ['辊底炉', '辊底式热处理炉', '辊底炉厂家', '辊底炉定制', '辊底炉价格', '辊底式工业炉'],
    alternateName: ['辊底式热处理炉', '辊底式工业炉', 'Roller Hearth Furnace'],
  },
  'pusher-furnace': {
    title: '推杆炉厂家｜推杆式热处理炉、节拍式热处理设备定制',
    description:
      '江苏苏能工业炉提供推杆炉、推杆式热处理炉等非标工业炉定制服务，适用于批量稳定、节拍明确的工件退火、回火、正火、加热等热处理工艺。',
    keywords: ['推杆炉', '推杆式炉', '推杆式热处理炉', '推杆炉厂家', '推杆炉定制', '推杆炉价格', '推杆式工业炉'],
    alternateName: ['推杆式炉', '推杆式热处理炉', '推杆式工业炉', 'Pusher Furnace'],
  },
  'rotary-hearth-furnace': {
    title: '转底炉厂家｜转底式热处理炉、环形炉底连续加热设备定制',
    description:
      '江苏苏能工业炉提供转底炉、转底式热处理炉、环形炉底连续加热设备等非标工业炉定制服务，适用于锻件、盘类工件、环形工件、模具、五金零件及节拍式连续加热、退火、正火、回火等工艺。',
    keywords: ['转底炉', '转底式热处理炉', '转底式工业炉', '转底炉厂家', '转底炉定制', '转底炉价格', '环形炉底连续加热炉'],
    alternateName: ['转底式热处理炉', '转底式工业炉', '环形炉底连续加热炉', 'Rotary Hearth Furnace'],
  },
  'roller-mesh-belt-line': {
    title: '托辊型网带式电阻炉生产线｜连续退火回火正火设备定制',
    description:
      '江苏苏能工业炉提供托辊型网带式电阻炉生产线、网带式热处理生产线等非标设备定制服务，适用于标准件、五金件、轴承零件、冲压件、粉末冶金件和中小型工件的连续退火、回火、正火、固溶、预热及烘干等工艺。',
    keywords: ['托辊型网带式电阻炉生产线', '托辊网带炉', '托辊网带生产线', '网带式电阻炉', '网带式热处理生产线', '连续退火回火正火设备', '网带炉厂家', '网带炉定制'],
    alternateName: ['托辊网带炉', '托辊网带生产线', '网带式电阻炉', '网带式热处理生产线', 'Roller Mesh Belt Heat Treatment Line'],
  },
  'copper-wire-annealing-line': {
    title: '铜丝自动化退火生产线｜铜线材连续退火炉、光亮退火设备定制',
    description:
      '江苏苏能工业炉提供铜丝自动化退火生产线、铜线材连续退火设备、铜合金丝退火炉等非标设备定制服务，可根据线径范围、线材材质、退火温度、运行速度、张力控制、保护气氛和收放线方式配置连续退火、软化退火、光亮退火及去应力处理方案。',
    keywords: ['铜丝自动化退火生产线', '铜丝退火生产线', '铜线退火生产线', '铜丝连续退火炉', '铜线连续退火设备', '铜合金丝退火炉', '光亮退火生产线', '线材连续退火设备'],
    alternateName: ['铜丝退火生产线', '铜线退火生产线', '铜丝连续退火炉', '铜线连续退火设备', '铜合金丝退火炉', 'Copper Wire Automatic Annealing Line'],
  },
  'annealing-solution-line': {
    title: '退火固溶生产线｜不锈钢带材连续退火固溶设备定制',
    description:
      '江苏苏能工业炉提供退火固溶生产线、连续退火生产线、固溶处理生产线、金属带材连续热处理设备等非标设备定制服务，适用于不锈钢带材、合金带材、有色金属带材、卷材的连续退火、固溶处理、光亮退火和去应力处理。',
    keywords: ['退火固溶生产线', '连续退火生产线', '固溶处理生产线', '不锈钢退火固溶生产线', '金属带材连续热处理设备', '卷材连续退火生产线', '不锈钢固溶炉', '不锈钢退火炉'],
    alternateName: ['连续退火生产线', '固溶处理生产线', '不锈钢退火固溶生产线', '金属带材连续热处理设备', '卷材连续退火生产线', 'Annealing and Solution Treatment Line'],
  },
};

export const ABOUT_SEO = {
  title: '关于苏能工业炉｜公司资质、业务边界与案例',
  description: '了解江苏苏能工业炉有限公司的主营业务、资质体系、工业炉与热处理设备制造能力，以及明确的不承接业务边界。',
  keywords: ['苏能工业炉', '江苏苏能工业炉有限公司', '苏能资质', '苏能案例', '工业炉制造企业'],
};

export const CONTACT_SEO = {
  title: '联系我们｜江苏苏能工业炉联系方式',
  description:
    '联系江苏苏能工业炉有限公司，咨询工业炉设备、热处理炉、节能改造与大修服务。地址：江苏省泰州市姜堰区张甸蔡官工业区，电话/微信：+86-130-5298-6814。',
  keywords: ['苏能工业炉联系方式', '苏能工业炉地址', '工业炉厂家电话'],
  ogTitle: '联系江苏苏能工业炉｜电话、地址与咨询入口',
  ogDescription:
    '联系江苏苏能工业炉有限公司，获取工业炉设备、热处理炉、节能改造与大修服务咨询入口。',
};

export const NEWS_SEO = {
  title: '资料中心｜工业炉选型、报价参数与热处理设备技术资料',
  description: '苏能工业炉资料中心提供工业炉选型、报价参数、热处理炉改造大修、热处理工艺和企业动态等相关内容。',
  keywords: ['工业炉资料', '工业炉选型', '工业炉报价参数', '热处理炉资讯', '苏能工业炉资料中心'],
};

export const SERVICE_SEO = {
  title: '售后服务｜工业炉安装调试与热处理设备维护支持',
  description:
    '江苏苏能工业炉提供工业炉售后服务、热处理炉安装调试、设备维修维护、技术培训、定期巡检和全周期服务支持。',
  keywords: ['工业炉售后服务', '热处理炉售后', '工业炉安装调试', '工业炉维修维护', '工业炉技术支持'],
};

export const PARTNER_SEO = {
  title: '合作关系与行业应用｜工业炉应用场景与合作关系说明',
  description:
    '苏能工业炉服务多行业工业炉项目，覆盖不锈钢与有色金属、重工机械、汽车零部件、能源装备、管阀部件和金属热处理加工等应用场景。',
  keywords: ['工业炉合作伙伴', '工业炉合作关系', '热处理设备合作场景', '工业炉应用行业', '苏能工业炉合作'],
};

export const FURNACE_RENOVATION_OVERHAUL_SEO = {
  title: '工业炉节能改造与热处理炉大修服务｜炉衬翻新、燃烧系统升级、控制系统改造',
  description:
    '苏能工业炉提供工业炉节能改造、热处理炉大修、炉衬翻新、燃烧系统升级、控制系统升级、搬迁复产评估等服务，适用于老旧工业炉能耗高、温控不稳、炉衬老化、燃烧效率低等场景。',
  keywords: [
    '工业炉节能改造',
    '热处理炉大修',
    '炉衬翻新',
    '燃烧系统升级',
    '控制系统升级',
    '老旧工业炉改造',
  ],
  ogTitle: '工业炉节能改造与热处理炉大修服务｜炉衬翻新、燃烧系统升级、控制系统改造',
  ogDescription:
    '苏能工业炉提供工业炉节能改造、热处理炉大修、炉衬翻新、燃烧系统升级、控制系统升级、搬迁复产评估等服务。',
  ogImage: '/images/service/after-sales-hero.png',
  ogType: 'website',
  canonicalUrl: 'https://www.jssngyl.cn/zh/service/furnace-renovation-overhaul',
};

export const INDUSTRIAL_FURNACE_QUOTE_PARAMS_SEO = {
  title: '工业炉报价需要哪些参数？炉型、尺寸、温度、装炉量与工艺要求清单',
  description:
    '工业炉报价通常需要提供炉型、炉膛尺寸、最高温度、工件材质、装炉量、工艺曲线、能源类型、控制要求和现场条件等参数。苏能工业炉可根据客户资料初步判断炉型方案与报价范围。',
  keywords: [
    '工业炉报价需要哪些参数',
    '工业炉报价',
    '工业炉价格',
    '热处理炉报价',
    '台车炉报价',
    '退火炉报价',
    '工业炉定制',
    '热处理炉定制',
  ],
  ogTitle: '工业炉报价需要哪些参数？炉型、尺寸、温度、装炉量与工艺要求清单',
  ogDescription:
    '工业炉报价前建议提供炉型、炉膛尺寸、最高温度、工件材质、装炉量、工艺曲线、能源类型、控制要求和现场条件等参数。',
  ogImage: '/images/service/after-sales-hero.png',
  ogType: 'article',
  canonicalUrl: 'https://www.jssngyl.cn/zh/articles/gongye-lu-baojia-canshu',
  publishedTime: '2026-06-12T15:00:00+08:00',
  modifiedTime: '2026-06-12T15:00:00+08:00',
};

export const OLD_HEAT_TREATMENT_FURNACE_REPAIR_OR_REPLACE_SEO = {
  title: '老旧热处理炉是大修还是买新的？判断标准与改造建议',
  description:
    '老旧热处理炉是继续大修、局部改造还是重新采购，需要结合炉体结构、安全状态、炉衬状态、控制系统、加热系统、工艺变化、停产窗口和改造费用综合判断。',
  keywords: [
    '老旧热处理炉是大修还是买新的',
    '老旧热处理炉修还是换',
    '老旧工业炉换新',
    '热处理炉更新评估',
    '大修还是换新',
    '老旧热处理炉决策',
  ],
  ogTitle: '老旧热处理炉是大修还是买新的？判断标准与改造建议',
  ogDescription:
    '老旧热处理炉修还是换，需要结合炉体、炉衬、控制系统、加热系统、安全风险、工艺变化、停产周期和改造费用综合判断。',
  ogImage: '/images/service/after-sales-hero.png',
  ogType: 'article',
  canonicalUrl: 'https://www.jssngyl.cn/zh/articles/laojiu-rechuli-lu-daxiu-haishi-maixin',
  publishedTime: '2026-06-13T10:00:00+08:00',
  modifiedTime: '2026-06-13T10:00:00+08:00',
};

export const HEAT_TREATMENT_FURNACE_MANUFACTURER_SEO = {
  title: '热处理炉厂家｜工业炉定制、非标热处理炉设计制造',
  description:
    '江苏苏能工业炉有限公司成立于 2006 年，专注热处理工业炉研发制造，可提供台车炉、箱式炉、井式炉、网带炉、辊底炉、推杆炉、退火炉、固溶炉、回火炉等非标工业炉定制、制造、安装与售后服务。',
  keywords: [
    '热处理炉厂家',
    '热处理炉生产厂家',
    '工业炉厂家',
    '工业炉定制',
    '热处理炉定制',
    '工业炉生产厂家',
    '非标工业炉厂家',
    '工业炉设备厂家',
  ],
  ogTitle: '热处理炉厂家｜工业炉定制与热处理设备制造',
  ogDescription:
    '苏能工业炉成立于 2006 年，专注热处理工业炉研发制造，支持台车炉、箱式炉、井式炉、网带炉、辊底炉、推杆炉等非标工业炉定制。',
  ogImage: '/images/about/about_img_hero_factory_01.png',
  ogType: 'website',
  canonicalUrl: 'https://www.jssngyl.cn/zh/solutions/rechuli-lu-changjia',
};

export const JIANGSU_INDUSTRIAL_FURNACE_MANUFACTURER_SEO = {
  title: '江苏工业炉厂家｜热处理炉定制、工业炉改造与大修',
  description:
    '江苏苏能工业炉有限公司位于江苏泰州，成立于 2006 年，提供台车炉、箱式炉、井式炉、网带炉、罩式炉、辊底炉、推杆炉、转底炉及热处理生产线定制、工业炉节能改造、热处理炉大修和安装调试服务。',
  keywords: [
    '江苏工业炉厂家',
    '江苏热处理炉厂家',
    '江苏工业炉定制',
    '江苏热处理炉定制',
    '江苏工业炉改造',
    '华东工业炉厂家',
    '泰州工业炉厂家',
  ],
  ogTitle: '江苏工业炉厂家｜热处理炉定制、改造与大修服务',
  ogDescription:
    '苏能工业炉位于江苏泰州，可为江苏及华东区域客户提供工业炉定制、热处理炉制造、老旧工业炉改造、大修、安装调试与售后支持。',
  ogImage: '/images/about/about_img_hero_factory_01.png',
  ogType: 'website',
  canonicalUrl: 'https://www.jssngyl.cn/zh/solutions/jiangsu-gongye-lu-changjia',
};

export const CONTINUOUS_HEAT_TREATMENT_LINE_SEO = {
  title: '连续热处理生产线解决方案｜热处理产线系统规划与设备分包',
  description:
    '江苏苏能工业炉提供连续热处理生产线系统级方案评估，围绕工件材质、产能节拍、温度制度、输送方式、冷却方式、上下料、自动化控制和交付边界，协助判断热处理产线组合方向。',
  keywords: [
    '连续热处理生产线',
    '热处理生产线解决方案',
    '热处理产线系统方案',
    '连续式热处理系统',
    '工业炉生产线方案',
    '热处理设备分包',
    '连续加热与冷却系统',
    '热处理生产线供应商',
  ],
  ogTitle: '连续热处理生产线解决方案',
  ogDescription:
    '苏能可根据工件材质、形态、工艺、产能节拍和现场条件，评估连续退火、固溶、正火、回火、淬火加热等热处理生产线方案。',
  ogImage: '/images/products/annealing-solution-line/gallery/line-01.jpg',
  ogType: 'website',
  canonicalUrl: 'https://www.jssngyl.cn/zh/solutions/continuous-heat-treatment-line',
};

export const TSINGSHAN_1250_CASE_SEO = {
  title: '某青山系不锈钢企业 1250mm 三线连续退洗线节能改造案例_苏能工业炉',
  description:
    '某青山系不锈钢深加工企业 1250mm 三线连续退洗线节能改造案例，年节能效益约 7,644 万元/年；数据仅作同类工程参考，实际效果以现场工况为准。',
  keywords: [
    '热处理炉节能改造案例',
    '1250mm 退洗线改造',
    '不锈钢退火生产线改造',
    '工业炉节能改造案例',
  ],
  ogTitle: '1250mm 不锈钢退洗线节能改造案例：年节能效益约 7,644 万元',
  ogDescription:
    '苏能工业炉 1250mm 不锈钢三线连续退洗线节能改造案例。通过燃料结构升级、三级烟气回收、控温系统优化等技术路径降低吨钢能耗。具体节能效益与现场工况密切相关。',
  ogImage: '/images/case/tsingshan-1250-cover.jpg',
  ogType: 'article',
  canonicalUrl: 'https://www.jssngyl.cn/zh/case/anonymous-tsingshan-1250-renovation',
  publishedTime: '2026-05-27T10:00:00+08:00',
  modifiedTime: '2026-05-27T10:00:00+08:00',
};
