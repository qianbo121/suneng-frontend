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
    title: '台车式热处理炉｜大型工件退火回火正火淬火设备',
    description:
      '台车式热处理炉适用于大型铸件、锻件、模具、轴类及结构件的退火、回火、正火、淬火等热处理工艺，可根据炉膛尺寸、承重、温度范围和工艺要求非标定制。',
    keywords: ['台车式热处理炉', '台车炉', '大型台车炉', '台车式电阻炉', '退火炉', '回火炉', '正火炉', '淬火炉'],
    alternateName: ['台车炉', '台车式电阻炉', '大型台车炉', 'Trolley Type Heat Treatment Furnace'],
  },
  'box-furnace': {
    title: '箱式热处理炉｜中小型金属零件热处理设备',
    description: '箱式热处理炉适用于中小型金属零件、模具、工装件等的退火、回火、正火、淬火及预热工艺，适合多品种、小批量热处理生产。',
    keywords: ['箱式热处理炉', '箱式炉', '箱式电阻炉', '中小型热处理炉', '模具热处理炉'],
    alternateName: ['箱式炉', '箱式电阻炉', 'Box Furnace', 'Chamber Furnace'],
  },
  'pit-furnace': {
    title: '井式热处理炉｜轴类杆类工件立式热处理设备',
    description: '井式热处理炉适用于轴类、杆类、长筒类及竖直装炉工件的退火、回火、正火、淬火等热处理工艺，可根据工件长度和工艺要求定制。',
    keywords: ['井式热处理炉', '井式炉', '井式电阻炉', '轴类热处理炉', '立式热处理炉'],
    alternateName: ['井式炉', '井式电阻炉', 'Pit Furnace'],
  },
  'bell-furnace': {
    title: '罩式热处理炉｜卷材线材退火与气氛保护热处理设备',
    description: '罩式热处理炉适用于卷材、线材、盘卷及金属构件的退火、保温和气氛保护热处理，可根据装炉方式、炉罩结构和工艺要求配置。',
    keywords: ['罩式热处理炉', '罩式炉', '罩式退火炉', '气氛保护炉', '卷材退火炉'],
    alternateName: ['罩式炉', '罩式退火炉', 'Bell Furnace'],
  },
  'mesh-belt-furnace': {
    title: '网带式热处理炉｜小型零件连续式热处理生产线',
    description: '网带式热处理炉适用于标准件、五金件、冲压件和小型机械零件的连续式淬火、回火、退火、正火等热处理生产。',
    keywords: ['网带式热处理炉', '网带炉', '网带式连续炉', '标准件热处理炉', '五金件热处理炉'],
    alternateName: ['网带炉', '网带式连续热处理炉', 'Mesh Belt Furnace'],
  },
  'roller-hearth-furnace': {
    title: '辊底式热处理炉｜板材棒材管材连续热处理设备',
    description: '辊底式热处理炉适用于板材、棒材、管材、锻件及较重工件的连续式热处理，可根据输送方式、工艺节拍和温度要求定制。',
    keywords: ['辊底式热处理炉', '辊底炉', '辊底式连续炉', '板材热处理炉', '管材热处理炉'],
    alternateName: ['辊底炉', '辊底式连续炉', 'Roller Hearth Furnace'],
  },
  'pusher-furnace': {
    title: '推杆式热处理炉｜托盘料筐连续式热处理设备',
    description: '推杆式热处理炉适用于托盘或料筐承载工件的连续式退火、正火、淬火加热、回火等热处理工艺，适合稳定节拍的批量生产。',
    keywords: ['推杆式热处理炉', '推杆炉', '推杆式连续炉', '连续式热处理炉', '批量热处理设备'],
    alternateName: ['推杆炉', '推杆式连续炉', 'Pusher Furnace'],
  },
  'rotary-hearth-furnace': {
    title: '转底式热处理炉｜环形炉底连续加热与热处理设备',
    description: '转底式热处理炉通过炉底旋转实现工件连续加热，适用于锻造加热、热处理加热及节拍式生产场景，可根据工件规格和装出料方式定制。',
    keywords: ['转底式热处理炉', '转底炉', '环形转底炉', '旋转炉底炉', '锻造加热炉'],
    alternateName: ['转底炉', '环形转底炉', 'Rotary Hearth Furnace'],
  },
  'roller-mesh-belt-line': {
    title: '托辊型网带式电阻炉生产线｜连续退火回火正火设备',
    description:
      '托辊型网带式电阻炉生产线适用于中小型工件连续退火、回火、正火、固溶、预热及烘干等工艺，支持按网带宽度、炉膛长度、托辊结构和产能节拍非标定制。',
    keywords: ['托辊型网带式电阻炉生产线', '网带式热处理生产线', '连续热处理生产线', '网带炉生产线', '电阻炉生产线'],
    alternateName: ['网带式热处理生产线', '托辊网带炉生产线', 'Roller Mesh Belt Heat Treatment Line'],
  },
  'copper-wire-annealing-line': {
    title: '铜丝自动化退火生产线｜铜线材连续退火设备',
    description:
      '铜丝自动化退火生产线适用于铜丝、铜合金丝、铜线材及相关金属线材的连续式退火、软化退火、光亮退火和去应力处理工艺。',
    keywords: ['铜丝自动化退火生产线', '铜丝退火生产线', '铜线退火设备', '线材连续退火炉', '自动化退火生产线'],
    alternateName: ['铜丝退火生产线', '铜线退火生产线', 'Copper Wire Automatic Annealing Line'],
  },
  'annealing-solution-line': {
    title: '退火固溶生产线｜金属带材连续热处理设备',
    description:
      '退火固溶生产线适用于不锈钢带材、不锈钢卷材、奥氏体不锈钢、合金钢带材及相关金属材料的连续式退火、固溶处理和光亮退火工艺。',
    keywords: ['退火固溶生产线', '连续退火生产线', '固溶处理生产线', '金属带材热处理线', '不锈钢退火固溶线'],
    alternateName: ['连续式热处理生产线', '退火固溶线', 'Annealing and Solution Treatment Line'],
  },
};

export const ABOUT_SEO = {
  title: '关于苏能工业炉｜公司资质、业务边界与案例',
  description: '了解江苏苏能工业炉有限公司的主营业务、资质体系、工业炉与热处理设备制造能力，以及明确的不承接业务边界。',
  keywords: ['苏能工业炉', '江苏苏能工业炉有限公司', '苏能资质', '苏能案例', '工业炉制造企业'],
};

export const SUNENG_PROFILE_SEO = {
  title: '江苏苏能工业炉有限公司介绍：主营产品、资质专利、案例与服务范围_苏能工业炉',
  description:
    '江苏苏能工业炉有限公司成立于 2006 年，是国家高新技术企业。专注热处理工业炉研发制造，提供工业炉装备、节能改造和大修服务。累计交付 150+ 项目，覆盖钢铁、汽车零部件、能源装备等行业。',
  keywords: [
    '苏能工业炉',
    '江苏苏能工业炉有限公司',
    '苏能工业炉介绍',
    '苏能工业炉资质',
    '苏能工业炉案例',
  ],
  ogTitle: '江苏苏能工业炉有限公司：成立于 2006 年的国家高新技术企业',
  ogDescription:
    '苏能工业炉成立于 2006 年，注册资本 5,080 万元，14,700 ㎡ 生产基地。国家高新技术企业 + 国家级科技型中小企业 + ISO 三体系认证 + 14 项已授权专利。',
  ogImage: '/images/about/about_img_hero_factory_01.png',
  ogType: 'website',
  canonicalUrl: 'https://www.jssngyl.cn/zh/about/suneng-profile',
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
  title: '新闻中心｜工业炉与热处理设备行业资讯',
  description: '苏能工业炉新闻中心提供工业炉、热处理炉、热处理工艺、设备选型和企业动态等相关内容。',
  keywords: ['工业炉资讯', '热处理炉资讯', '热处理工艺', '苏能工业炉新闻'],
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
  title: '工业炉节能改造与热处理炉大修服务_苏能工业炉',
  description:
    '苏能工业炉提供工业炉节能改造、热处理炉大修、控制系统升级、炉衬翻新和烟气余热回收服务，可对自制设备及部分非苏能品牌工业炉提供评估改造。',
  keywords: [
    '工业炉节能改造',
    '热处理炉大修',
    '炉衬翻新',
    '控制系统升级',
    '烟气余热回收',
  ],
  ogTitle: '工业炉节能改造与热处理炉大修服务_苏能工业炉',
  ogDescription:
    '苏能工业炉提供节能改造、整炉大修、控制系统升级、炉衬翻新等服务，可对自制设备及部分非苏能品牌工业炉提供评估改造。',
  ogImage: '/images/service/renovation-overhaul-cover.jpg',
  ogType: 'website',
  canonicalUrl: 'https://www.jssngyl.cn/zh/service/furnace-renovation-overhaul',
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
