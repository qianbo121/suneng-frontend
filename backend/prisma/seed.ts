import {
  AdminRole,
  CertificateCategory,
  CultureValueType,
  PrismaClient,
  PublishStatus,
} from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function seedAdminUser() {
  const passwordHash = await hash('admin123456', 10);

  await prisma.adminUser.upsert({
    where: { username: 'admin' },
    update: {
      passwordHash,
      role: AdminRole.super_admin,
      isActive: true,
    },
    create: {
      username: 'admin',
      passwordHash,
      role: AdminRole.super_admin,
      isActive: true,
    },
  });
}

async function disableLegacySeedContent() {
  // 旧站测试数据，不得作为苏能官网生产内容、GEO/RAG 资料源。
  const legacyCategorySlugs = [
    'charging-truck-series',
    'scaling-vehicle-series',
    'crusher-series',
    'mobile-crane',
    '4t-chassis-series',
    '8t-chassis-series',
    'integrated-chassis-series',
    'concrete-mixer-transport-series',
    'underground-shotcrete-series',
    'underground-masonry-multi-function-series',
  ];
  const legacyProductSlugs = legacyCategorySlugs.map((slug, index) => `${slug}-sample-${index + 1}`);
  const legacyNewsSlugs = ['industry-mining-equipment-update'];

  await prisma.product.updateMany({
    where: { slug: { in: legacyProductSlugs } },
    data: {
      isHot: false,
      status: PublishStatus.offline,
    },
  });

  await prisma.productCategory.updateMany({
    where: { slug: { in: legacyCategorySlugs } },
    data: { status: PublishStatus.offline },
  });

  await prisma.news.updateMany({
    where: { slug: { in: legacyNewsSlugs } },
    data: {
      isPublished: false,
      status: PublishStatus.offline,
    },
  });
}

async function seedProductCategoriesAndProducts() {
  const categories = [
    {
      slug: 'roller-mesh-belt-line',
      nameZh: '托辊型网带式电阻炉生产线',
      nameEn: 'Roller Mesh Belt Heat Treatment Line',
      descriptionZh: '适用于中小型工件连续退火、回火、正火等热处理工艺。',
      descriptionEn: 'Continuous roller-supported mesh belt line for heat treatment of small and medium workpieces.',
      coverImage: 'https://placehold.co/800x600',
      iconImage: 'https://placehold.co/120x120',
      sortOrder: 10,
    },
    {
      slug: 'copper-wire-annealing-line',
      nameZh: '铜丝自动化退火生产线',
      nameEn: 'Copper Wire Automatic Annealing Line',
      descriptionZh: '面向铜丝、铜合金线材连续退火与收放线配套场景。',
      descriptionEn: 'Automatic line for continuous annealing of copper wire and copper alloy wire.',
      coverImage: 'https://placehold.co/800x600',
      iconImage: 'https://placehold.co/120x120',
      sortOrder: 20,
    },
    {
      slug: 'annealing-solution-line',
      nameZh: '退火固溶生产线',
      nameEn: 'Annealing and Solution Treatment Line',
      descriptionZh: '适用于不锈钢带材、合金带材等连续退火与固溶处理。',
      descriptionEn: 'Continuous line for annealing and solution treatment of metal strip.',
      coverImage: 'https://placehold.co/800x600',
      iconImage: 'https://placehold.co/120x120',
      sortOrder: 30,
    },
    {
      slug: 'trolley-furnace',
      nameZh: '台车式热处理炉',
      nameEn: 'Trolley Heat Treatment Furnace',
      descriptionZh: '适用于大型铸件、锻件、模具及结构件热处理。',
      descriptionEn: 'Trolley furnace for large castings, forgings, molds and structural parts.',
      coverImage: 'https://placehold.co/800x600',
      iconImage: 'https://placehold.co/120x120',
      sortOrder: 40,
    },
    {
      slug: 'box-furnace',
      nameZh: '箱式热处理炉',
      nameEn: 'Box Heat Treatment Furnace',
      descriptionZh: '适用于中小型金属件、模具和工装件热处理。',
      descriptionEn: 'Box furnace for small and medium metal parts, molds and fixtures.',
      coverImage: 'https://placehold.co/800x600',
      iconImage: 'https://placehold.co/120x120',
      sortOrder: 50,
    },
    {
      slug: 'pit-furnace',
      nameZh: '井式热处理炉',
      nameEn: 'Pit Heat Treatment Furnace',
      descriptionZh: '适用于轴类、杆类和长筒类工件立式装炉热处理。',
      descriptionEn: 'Pit furnace for shaft, rod and vertical-loading workpieces.',
      coverImage: 'https://placehold.co/800x600',
      iconImage: 'https://placehold.co/120x120',
      sortOrder: 60,
    },
    {
      slug: 'bell-furnace',
      nameZh: '罩式热处理炉',
      nameEn: 'Bell Heat Treatment Furnace',
      descriptionZh: '适用于卷材、线材、盘卷及气氛保护热处理。',
      descriptionEn: 'Bell furnace for coils, wire and protective-atmosphere heat treatment.',
      coverImage: 'https://placehold.co/800x600',
      iconImage: 'https://placehold.co/120x120',
      sortOrder: 70,
    },
    {
      slug: 'mesh-belt-furnace',
      nameZh: '网带式热处理炉',
      nameEn: 'Mesh Belt Heat Treatment Furnace',
      descriptionZh: '适用于标准件、五金件和小型零件连续热处理。',
      descriptionEn: 'Mesh belt furnace for continuous heat treatment of standard and small parts.',
      coverImage: 'https://placehold.co/800x600',
      iconImage: 'https://placehold.co/120x120',
      sortOrder: 80,
    },
    {
      slug: 'roller-hearth-furnace',
      nameZh: '辊底式热处理炉',
      nameEn: 'Roller Hearth Heat Treatment Furnace',
      descriptionZh: '适用于板材、棒材、管材和较重工件连续热处理。',
      descriptionEn: 'Roller hearth furnace for plates, bars, tubes and heavier workpieces.',
      coverImage: 'https://placehold.co/800x600',
      iconImage: 'https://placehold.co/120x120',
      sortOrder: 90,
    },
    {
      slug: 'rotary-hearth-furnace',
      nameZh: '转底式热处理炉',
      nameEn: 'Rotary Hearth Heat Treatment Furnace',
      descriptionZh: '适用于盘类、环形工件、锻件和节拍式加热场景。',
      descriptionEn: 'Rotary hearth furnace for disc, ring and rhythmic heating applications.',
      coverImage: 'https://placehold.co/800x600',
      iconImage: 'https://placehold.co/120x120',
      sortOrder: 100,
    },
  ];

  const categoryIdBySlug = new Map<string, number>();

  for (const category of categories) {
    const saved = await prisma.productCategory.upsert({
      where: { slug: category.slug },
      update: {
        ...category,
        status: PublishStatus.published,
      },
      create: {
        ...category,
        status: PublishStatus.published,
      },
    });

    categoryIdBySlug.set(category.slug, saved.id);
  }

  const products = categories.map((category, index) => ({
    categorySlug: category.slug,
    slug: category.slug,
    nameZh: category.nameZh,
    nameEn: category.nameEn,
    model: `SN-${String(index + 1).padStart(2, '0')}`,
    summaryZh: category.descriptionZh,
    summaryEn: category.descriptionEn,
    descriptionZh: `${category.nameZh}可根据工件尺寸、工艺温度、产能节拍、加热方式和现场条件进行非标方案配置，具体参数以技术协议为准。`,
    descriptionEn: `${category.nameEn} can be configured according to workpiece size, process temperature, capacity rhythm, heating method and site conditions.`,
    specsJson: {
      temperature: '按工艺要求配置',
      heatingMethod: '电阻加热 / 燃气加热 / 热风循环',
      controlSystem: 'PLC 控制 / 多区控温',
      customization: '支持非标定制',
    },
    featuresJson: [
      '非标定制',
      '多区控温',
      '热工系统匹配',
      '售后服务支持',
    ],
    imagesJson: [
      'https://placehold.co/1200x900',
      'https://placehold.co/1200x900',
    ],
    isHot: index < 4,
    sortOrder: (index + 1) * 10,
  }));

  for (const product of products) {
    const categoryId = categoryIdBySlug.get(product.categorySlug);

    if (!categoryId) {
      throw new Error(`Missing product category for slug: ${product.categorySlug}`);
    }

    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {
        categoryId,
        nameZh: product.nameZh,
        nameEn: product.nameEn,
        model: product.model,
        summaryZh: product.summaryZh,
        summaryEn: product.summaryEn,
        descriptionZh: product.descriptionZh,
        descriptionEn: product.descriptionEn,
        specsJson: product.specsJson,
        featuresJson: product.featuresJson,
        imagesJson: product.imagesJson,
        isHot: product.isHot,
        sortOrder: product.sortOrder,
        status: PublishStatus.published,
      },
      create: {
        categoryId,
        nameZh: product.nameZh,
        nameEn: product.nameEn,
        model: product.model,
        summaryZh: product.summaryZh,
        summaryEn: product.summaryEn,
        descriptionZh: product.descriptionZh,
        descriptionEn: product.descriptionEn,
        specsJson: product.specsJson,
        featuresJson: product.featuresJson,
        imagesJson: product.imagesJson,
        isHot: product.isHot,
        slug: product.slug,
        sortOrder: product.sortOrder,
        status: PublishStatus.published,
      },
    });
  }
}

async function seedNewsCategoriesAndNews() {
  const categories = [
    {
      slug: 'company-news',
      nameZh: '公司新闻',
      nameEn: 'Company News',
      sortOrder: 10,
    },
    {
      slug: 'industry-news',
      nameZh: '行业新闻',
      nameEn: 'Industry News',
      sortOrder: 20,
    },
  ];

  const categoryIdBySlug = new Map<string, number>();

  for (const category of categories) {
    const saved = await prisma.newsCategory.upsert({
      where: { slug: category.slug },
      update: {
        ...category,
        status: PublishStatus.published,
      },
      create: {
        ...category,
        status: PublishStatus.published,
      },
    });

    categoryIdBySlug.set(category.slug, saved.id);
  }

  const newsItems = [
    {
      slug: 'company-delivery-batch-1',
      categorySlug: 'company-news',
      titleZh: '示例公司新闻：设备批量交付完成',
      titleEn: 'Sample Company News: Batch Delivery Completed',
      summaryZh: '这是用于初始化的示例公司新闻摘要。',
      summaryEn: 'Sample summary for seeded company news.',
      contentZh: '示例公司新闻正文，用于前后端联调和后台内容管理验证。',
      contentEn: 'Seeded company news content for integration and admin testing.',
      publishDate: new Date('2026-01-08T08:00:00.000Z'),
      sortOrder: 10,
    },
    {
      slug: 'company-visit-delegation',
      categorySlug: 'company-news',
      titleZh: '示例公司新闻：来访考察与交流合作',
      titleEn: 'Sample Company News: Delegation Visit and Exchange',
      summaryZh: '用于初始化的第二条公司新闻。',
      summaryEn: 'Second seeded company news item.',
      contentZh: '示例正文内容，后续可替换为正式新闻稿件。',
      contentEn: 'Placeholder body content to be replaced later.',
      publishDate: new Date('2025-12-18T08:00:00.000Z'),
      sortOrder: 20,
    },
    {
      slug: 'industry-mining-equipment-update',
      categorySlug: 'industry-news',
      titleZh: '工业炉行业资讯：热处理设备节能改造趋势',
      titleEn: 'Industry News: Energy-saving Renovation Trends for Heat Treatment Equipment',
      summaryZh: '围绕工业炉节能改造、控制系统升级与烟气余热回收等方向，整理热处理设备行业关注点。',
      summaryEn: 'A seeded industry note about energy-saving renovation, control-system upgrades and waste-heat recovery for heat treatment equipment.',
      contentZh: '工业炉节能改造通常需要结合炉型结构、燃料类型、保温状态、控制系统和现场工况进行评估，具体方案以现场诊断和技术协议为准。',
      contentEn: 'Industrial furnace renovation should be evaluated according to furnace structure, fuel type, insulation condition, control system and site conditions.',
      publishDate: new Date('2025-11-05T08:00:00.000Z'),
      sortOrder: 30,
    },
  ];

  for (const item of newsItems) {
    const categoryId = categoryIdBySlug.get(item.categorySlug);

    if (!categoryId) {
      throw new Error(`Missing news category for slug: ${item.categorySlug}`);
    }

    await prisma.news.upsert({
      where: { slug: item.slug },
      update: {
        categoryId,
        titleZh: item.titleZh,
        titleEn: item.titleEn,
        summaryZh: item.summaryZh,
        summaryEn: item.summaryEn,
        contentZh: item.contentZh,
        contentEn: item.contentEn,
        coverImage: 'https://placehold.co/1200x800',
        publishDate: item.publishDate,
        isPublished: true,
        sortOrder: item.sortOrder,
        status: PublishStatus.published,
      },
      create: {
        categoryId,
        titleZh: item.titleZh,
        titleEn: item.titleEn,
        summaryZh: item.summaryZh,
        summaryEn: item.summaryEn,
        contentZh: item.contentZh,
        contentEn: item.contentEn,
        coverImage: 'https://placehold.co/1200x800',
        publishDate: item.publishDate,
        slug: item.slug,
        isPublished: true,
        sortOrder: item.sortOrder,
        status: PublishStatus.published,
      },
    });
  }
}

async function seedStrengthCategories() {
  const categories = [
    { slug: 'technical-team', nameZh: '技术团队', nameEn: 'Technical Team', sortOrder: 10 },
    { slug: 'honors', nameZh: '荣誉资质', nameEn: 'Honors', sortOrder: 20 },
    { slug: 'certificates', nameZh: '资质证书', nameEn: 'Certificates', sortOrder: 30 },
    { slug: 'equipment', nameZh: '生产设备', nameEn: 'Production Equipment', sortOrder: 40 },
  ];

  for (const category of categories) {
    await prisma.strengthCategory.upsert({
      where: { slug: category.slug },
      update: {
        ...category,
        status: PublishStatus.published,
      },
      create: {
        ...category,
        status: PublishStatus.published,
      },
    });
  }
}

async function seedBanners() {
  await prisma.banner.deleteMany({
    where: {
      sectionKey: 'home-hero',
    },
  });

  await prisma.banner.createMany({
    data: [
      {
        sectionKey: 'home-hero',
        titleZh: '专注工业炉与热处理装备制造',
        titleEn: 'Focused on Industrial Furnace and Heat Treatment Equipment',
        subtitleZh: '围绕电阻式与燃气式工业炉，提供单机设备、配套件与整线方案支持。',
        subtitleEn: 'Supporting electric-resistance and gas-fired industrial furnaces, components and production-line projects.',
        imageUrl: 'https://placehold.co/1920x1080/004B97/ffffff',
        mobileImageUrl: 'https://placehold.co/900x1400/004B97/ffffff',
        linkUrl: '/products',
        isActive: true,
        sortOrder: 10,
        status: PublishStatus.published,
      },
      {
        sectionKey: 'home-hero',
        titleZh: '覆盖多类热处理炉型与生产线',
        titleEn: 'Covering Furnace Types and Heat Treatment Lines',
        subtitleZh: '展示台车炉、箱式炉、井式炉、网带炉、辊底炉、转底炉及热处理生产线。',
        subtitleEn: 'Presenting trolley, box, pit, mesh belt, roller hearth, rotary hearth furnaces and heat treatment lines.',
        imageUrl: 'https://placehold.co/1920x1080/0B3768/ffffff',
        mobileImageUrl: 'https://placehold.co/900x1400/0B3768/ffffff',
        linkUrl: '/about',
        isActive: true,
        sortOrder: 20,
        status: PublishStatus.published,
      },
      {
        sectionKey: 'home-hero',
        titleZh: '技术驱动交付，服务覆盖全国',
        titleEn: 'Technology-driven Delivery with Nationwide Service',
        subtitleZh: '从项目咨询、产品配置到售后响应，建立标准化服务链路。',
        subtitleEn: 'From consultation and configuration to after-sales response, the service chain is standardized end to end.',
        imageUrl: 'https://placehold.co/1920x1080/123F74/ffffff',
        mobileImageUrl: 'https://placehold.co/900x1400/123F74/ffffff',
        linkUrl: '/service',
        isActive: true,
        sortOrder: 30,
        status: PublishStatus.published,
      },
    ],
  });
}

async function seedCompanyInfo() {
  const entries = [
    { key: 'site_phone', valueZh: '+86-130-5298-6814', valueEn: '+86-130-5298-6814' },
    { key: 'site_address', valueZh: '江苏省泰州市姜堰区张甸蔡官工业区', valueEn: 'Caiguan Industrial Park, Zhangdian Town, Jiangyan District, Taizhou, Jiangsu, China' },
    { key: 'site_email', valueZh: 'jssngyl@outlook.com', valueEn: 'jssngyl@outlook.com' },
    { key: 'site_fax', valueZh: '', valueEn: '' },
    { key: 'salesPhone', valueZh: '+86-130-5298-6814', valueEn: '+86-130-5298-6814' },
    { key: 'topPhone', valueZh: '+86-130-5298-6814', valueEn: '+86-130-5298-6814' },
    { key: 'hotline', valueZh: '+86-130-5298-6814', valueEn: '+86-130-5298-6814' },
    { key: 'companyAddress', valueZh: '江苏省泰州市姜堰区张甸蔡官工业区', valueEn: 'Caiguan Industrial Park, Zhangdian Town, Jiangyan District, Taizhou, Jiangsu, China' },
    { key: 'foundedYear', valueZh: '2006', valueEn: '2006' },
    { key: 'registeredCapital', valueZh: '5080', valueEn: '5080' },
    { key: 'patentCount', valueZh: '29', valueEn: '29' },
    { key: 'employeeCount', valueZh: '150', valueEn: '150' },
    { key: 'wechatQr', valueZh: '/images/footer/wechat-qr.png', valueEn: '/images/footer/wechat-qr.png' },
  ];

  for (const entry of entries) {
    await prisma.companyInfo.upsert({
      where: { key: entry.key },
      update: entry,
      create: entry,
    });
  }
}

async function seedAboutContent() {
  await prisma.aboutSection.upsert({
    where: { sectionKey: 'profile' },
    update: {
      titleZh: '公司简介',
      titleEn: 'Company Profile',
      contentZh:
        '江苏苏能工业炉有限公司专注工业炉、热处理炉及非标热处理设备的研发、设计、制造与服务，围绕热处理、锻造加热、工业干燥与固化等场景提供设备和工艺方案支持。',
      contentEn:
        'Jiangsu Suneng Industrial Furnace focuses on R&D, design, manufacturing and service of industrial furnaces, heat treatment furnaces and customized thermal-processing equipment.',
      imageUrl: 'https://placehold.co/1200x800/004B97/ffffff',
      sortOrder: 10,
      status: PublishStatus.published,
    },
    create: {
      sectionKey: 'profile',
      titleZh: '公司简介',
      titleEn: 'Company Profile',
      contentZh:
        '江苏苏能工业炉有限公司专注工业炉、热处理炉及非标热处理设备的研发、设计、制造与服务，围绕热处理、锻造加热、工业干燥与固化等场景提供设备和工艺方案支持。',
      contentEn:
        'Jiangsu Suneng Industrial Furnace focuses on R&D, design, manufacturing and service of industrial furnaces, heat treatment furnaces and customized thermal-processing equipment.',
      imageUrl: 'https://placehold.co/1200x800/004B97/ffffff',
      sortOrder: 10,
      status: PublishStatus.published,
    },
  });

  await prisma.chairmanMessage.upsert({
    where: { singletonKey: 'default' },
    update: {
      titleZh: '董事长致辞',
      titleEn: 'Message from the Chairman',
      contentZh:
        '我们坚持以产品质量和客户交付为核心，围绕工业炉装备制造与热处理工艺需求持续打磨产品。企业的长期价值，来自稳定制造、技术积累和可信服务。',
      contentEn:
        'We remain focused on product quality and delivery, continuously refining industrial furnace equipment around real heat-treatment requirements.',
      imageUrl: 'https://placehold.co/720x900/004B97/ffffff',
      status: PublishStatus.published,
    },
    create: {
      singletonKey: 'default',
      titleZh: '董事长致辞',
      titleEn: 'Message from the Chairman',
      contentZh:
        '我们坚持以产品质量和客户交付为核心，围绕工业炉装备制造与热处理工艺需求持续打磨产品。企业的长期价值，来自稳定制造、技术积累和可信服务。',
      contentEn:
        'We remain focused on product quality and delivery, continuously refining industrial furnace equipment around real heat-treatment requirements.',
      imageUrl: 'https://placehold.co/720x900/004B97/ffffff',
      status: PublishStatus.published,
    },
  });

  await prisma.cultureValue.deleteMany();
  await prisma.cultureValue.createMany({
    data: [
      {
        type: CultureValueType.mission,
        titleZh: '企业使命',
        titleEn: 'Mission',
        contentZh: '以稳定工业炉装备与专业服务支撑客户热处理生产。',
        contentEn: 'Support customers with reliable industrial furnace equipment and professional service.',
        icon: 'https://placehold.co/120x120/004B97/ffffff',
        sortOrder: 10,
        status: PublishStatus.published,
      },
      {
        type: CultureValueType.vision,
        titleZh: '企业愿景',
        titleEn: 'Vision',
        contentZh: '成为工业炉与热处理装备领域值得长期信赖的制造企业。',
        contentEn: 'To become a trusted manufacturer in industrial furnace and heat treatment equipment.',
        icon: 'https://placehold.co/120x120/0B3768/ffffff',
        sortOrder: 20,
        status: PublishStatus.published,
      },
      {
        type: CultureValueType.value,
        titleZh: '核心价值观',
        titleEn: 'Core Values',
        contentZh: '务实、协同、品质、长期主义。',
        contentEn: 'Pragmatism, collaboration, quality and long-termism.',
        icon: 'https://placehold.co/120x120/E60012/ffffff',
        sortOrder: 30,
        status: PublishStatus.published,
      },
    ],
  });

  await prisma.timelineEvent.deleteMany();
  await prisma.timelineEvent.createMany({
    data: [
      {
        year: 2006,
        titleZh: '公司成立',
        titleEn: 'Company Founded',
        contentZh: '江苏苏能工业炉有限公司成立，持续深耕工业炉与热处理装备制造。',
        contentEn: 'Jiangsu Suneng Industrial Furnace was founded and began focusing on industrial furnace and heat treatment equipment.',
        sortOrder: 10,
        status: PublishStatus.published,
      },
      {
        year: 2016,
        titleZh: '产品体系扩展',
        titleEn: 'Product Portfolio Expanded',
        contentZh: '持续完善台车炉、箱式炉、井式炉、网带炉等炉型产品体系。',
        contentEn: 'Expanded the furnace portfolio including trolley, box, pit and mesh belt furnaces.',
        sortOrder: 20,
        status: PublishStatus.published,
      },
      {
        year: 2021,
        titleZh: '制造与服务升级',
        titleEn: 'Manufacturing and Service Upgrade',
        contentZh: '制造体系与售后网络同步升级，进一步覆盖核心区域客户。',
        contentEn: 'Manufacturing and after-sales systems were upgraded to cover more key regions.',
        sortOrder: 30,
        status: PublishStatus.published,
      },
    ],
  });
}

async function seedStrengthContent() {
  const categories = await prisma.strengthCategory.findMany();
  const categoryMap = new Map(categories.map((item) => [item.slug, item.id]));

  await prisma.strengthItem.deleteMany();
  await prisma.strengthItem.createMany({
    data: [
      {
        categoryId: categoryMap.get('technical-team')!,
        titleZh: '核心研发技术团队',
        titleEn: 'Core Engineering Team',
        summaryZh: '覆盖炉体结构、热工系统、电控与工艺方案。',
        summaryEn: 'Covering furnace structure, thermal systems, electrical control and process solutions.',
        contentZh: '技术团队长期围绕工业炉装备与热处理工艺需求，持续优化炉体结构、控温系统和设备维护便利性。',
        contentEn: 'The engineering team continuously improves furnace structure, temperature control and maintainability for heat-treatment applications.',
        imageUrl: 'https://placehold.co/900x700/004B97/ffffff',
        imagesJson: ['https://placehold.co/1200x900/004B97/ffffff', 'https://placehold.co/1200x900/0B3768/ffffff'],
        sortOrder: 10,
        status: PublishStatus.published,
      },
      {
        categoryId: categoryMap.get('equipment')!,
        titleZh: '现代化生产设备',
        titleEn: 'Modern Production Equipment',
        summaryZh: '覆盖焊接、装配、检测等关键制造环节。',
        summaryEn: 'Covering key manufacturing processes including welding, assembly and inspection.',
        contentZh: '生产设备配置围绕稳定交付和品质控制展开，支撑多类型产品制造。',
        contentEn: 'Production equipment is configured around stable delivery and quality control.',
        imageUrl: 'https://placehold.co/900x700/123F74/ffffff',
        imagesJson: ['https://placehold.co/1200x900/123F74/ffffff', 'https://placehold.co/1200x900/0D2D57/ffffff'],
        sortOrder: 20,
        status: PublishStatus.published,
      },
    ],
  });

  await prisma.certificate.deleteMany();
  await prisma.certificate.createMany({
    data: [
      {
        strengthCategoryId: categoryMap.get('honors') || null,
        nameZh: '企业荣誉示例',
        nameEn: 'Honor Sample',
        imageUrl: 'https://placehold.co/900x1200/004B97/ffffff',
        category: CertificateCategory.honor,
        sortOrder: 10,
        status: PublishStatus.published,
      },
      {
        strengthCategoryId: categoryMap.get('certificates') || null,
        nameZh: '资质证书示例',
        nameEn: 'Qualification Sample',
        imageUrl: 'https://placehold.co/900x1200/0B3768/ffffff',
        category: CertificateCategory.qualification,
        sortOrder: 20,
        status: PublishStatus.published,
      },
      {
        strengthCategoryId: categoryMap.get('certificates') || null,
        nameZh: '专利证书示例',
        nameEn: 'Patent Sample',
        imageUrl: 'https://placehold.co/900x1200/E60012/ffffff',
        category: CertificateCategory.patent,
        sortOrder: 30,
        status: PublishStatus.published,
      },
    ],
  });
}

async function seedPartnersAndDeliveries() {
  await prisma.partner.deleteMany();
  await prisma.partner.createMany({
    data: Array.from({ length: 8 }).map((_, index) => ({
      name: `合作伙伴 ${index + 1}`,
      logoUrl: `https://placehold.co/220x96/${index % 2 === 0 ? '004B97' : '0B3768'}/ffffff`,
      website: `https://example-${index + 1}.com`,
      sortOrder: (index + 1) * 10,
      status: PublishStatus.published,
    })),
  });

  const deliveries = [
    {
      slug: 'delivery-case-1',
      titleZh: '交车现场示例一',
      titleEn: 'Delivery Case One',
      descriptionZh: '用于前台合作伙伴页面与后台交车现场管理联调。',
      descriptionEn: 'Seeded delivery case for the partner page and admin testing.',
      deliveryDate: new Date('2026-02-12T09:00:00.000Z'),
      sortOrder: 10,
    },
    {
      slug: 'delivery-case-2',
      titleZh: '交车现场示例二',
      titleEn: 'Delivery Case Two',
      descriptionZh: '用于展示多图交付案例模块。',
      descriptionEn: 'Used to display multi-image delivery cases.',
      deliveryDate: new Date('2026-01-16T09:00:00.000Z'),
      sortOrder: 20,
    },
  ];

  for (const item of deliveries) {
    await prisma.delivery.upsert({
      where: { slug: item.slug },
      update: {
        ...item,
        imagesJson: [
          'https://placehold.co/1200x900/004B97/ffffff',
          'https://placehold.co/1200x900/0B3768/ffffff',
          'https://placehold.co/1200x900/123F74/ffffff',
        ],
        status: PublishStatus.published,
      },
      create: {
        ...item,
        imagesJson: [
          'https://placehold.co/1200x900/004B97/ffffff',
          'https://placehold.co/1200x900/0B3768/ffffff',
          'https://placehold.co/1200x900/123F74/ffffff',
        ],
        status: PublishStatus.published,
      },
    });
  }
}

async function seedServiceSupport() {
  await prisma.serviceSection.deleteMany();
  await prisma.serviceSection.createMany({
    data: [
      {
        sectionKey: 'after-sales',
        titleZh: '售后服务',
        titleEn: 'After-sales Service',
        contentZh: '建立标准化售后响应流程，覆盖安装指导、巡检保养与故障处理。',
        contentEn: 'Standardized after-sales response covering installation guidance, inspection and troubleshooting.',
        imageUrl: 'https://placehold.co/1200x800/004B97/ffffff',
        sortOrder: 10,
        status: PublishStatus.published,
      },
      {
        sectionKey: 'advantages',
        titleZh: '服务优势',
        titleEn: 'Service Advantages',
        contentZh: '依托区域网点与服务机制，缩短响应链路，提升项目保障能力。',
        contentEn: 'Regional outlets and service processes reduce response time and improve project assurance.',
        imageUrl: 'https://placehold.co/1200x800/0B3768/ffffff',
        sortOrder: 20,
        status: PublishStatus.published,
      },
      {
        sectionKey: 'consultation',
        titleZh: '在线咨询',
        titleEn: 'Online Consultation',
        contentZh: '提供产品选型、项目配置与商务咨询的快速入口。',
        contentEn: 'A quick channel for product selection, project configuration and commercial consultation.',
        imageUrl: 'https://placehold.co/1200x800/123F74/ffffff',
        sortOrder: 30,
        status: PublishStatus.published,
      },
    ],
  });

  await prisma.salesOutlet.deleteMany();
  await prisma.salesOutlet.createMany({
    data: [
      {
        regionZh: '华东',
        regionEn: 'East China',
        cityZh: '泰州',
        cityEn: 'Taizhou',
        addressZh: '江苏省泰州市姜堰区张甸蔡官工业区',
        addressEn: 'Caiguan Industrial Park, Zhangdian Town, Jiangyan District, Taizhou, Jiangsu',
        phone: '+86-130-5298-6814',
        lat: 32.44,
        lng: 120.03,
        sortOrder: 10,
        status: PublishStatus.published,
      },
      {
        regionZh: '华东',
        regionEn: 'East China',
        cityZh: '江苏',
        cityEn: 'Jiangsu',
        addressZh: '江苏地区售后服务按项目和合同约定安排',
        addressEn: 'Service in Jiangsu is arranged according to project and contract terms.',
        phone: '+86-130-5298-6814',
        lat: 32.0603,
        lng: 118.7969,
        sortOrder: 20,
        status: PublishStatus.published,
      },
      {
        regionZh: '西南',
        regionEn: 'Southwest China',
        cityZh: '成都',
        cityEn: 'Chengdu',
        addressZh: '西南地区服务按项目和合同约定安排',
        addressEn: 'Service in Southwest China is arranged according to project and contract terms.',
        phone: '+86-130-5298-6814',
        lat: 30.5728,
        lng: 104.0668,
        sortOrder: 30,
        status: PublishStatus.published,
      },
    ],
  });
}

async function seedSeoMeta() {
  const entries = [
    {
      pageKey: 'home',
      titleZh: '江苏苏能工业炉有限公司｜工业炉与热处理设备厂家',
      titleEn: 'Jiangsu Suneng Industrial Furnace | Industrial Furnace Manufacturer',
      descriptionZh: '江苏苏能工业炉有限公司专注工业炉、热处理炉及非标热处理设备制造，提供设备定制、节能改造与售后服务支持。',
      descriptionEn: 'Jiangsu Suneng Industrial Furnace manufactures industrial furnaces, heat treatment furnaces and customized thermal-processing equipment.',
      keywordsZh: '江苏苏能工业炉,工业炉,热处理炉,工业炉厂家,热处理设备',
      keywordsEn: 'Suneng Industrial Furnace,industrial furnace,heat treatment furnace,furnace manufacturer',
      ogImage: 'https://placehold.co/1200x630/004B97/ffffff',
    },
    {
      pageKey: 'products',
      titleZh: '产品中心',
      titleEn: 'Product Center',
      descriptionZh: '查看苏能工业炉主要炉型、热处理生产线及非标定制参数信息。',
      descriptionEn: 'Browse Suneng furnace types, heat treatment lines and customization information.',
      keywordsZh: '工业炉产品,热处理炉,热处理生产线,非标工业炉',
      keywordsEn: 'industrial furnace products,heat treatment furnace,heat treatment line',
      ogImage: 'https://placehold.co/1200x630/0B3768/ffffff',
    },
    {
      pageKey: 'news',
      titleZh: '新闻中心',
      titleEn: 'News Center',
      descriptionZh: '查看公司新闻与行业新闻。',
      descriptionEn: 'Read company and industry news.',
      keywordsZh: '新闻中心,公司新闻,行业新闻',
      keywordsEn: 'news,company news,industry news',
      ogImage: 'https://placehold.co/1200x630/123F74/ffffff',
    },
  ];

  for (const entry of entries) {
    await prisma.seoMeta.upsert({
      where: { pageKey: entry.pageKey },
      update: entry,
      create: entry,
    });
  }
}

async function main() {
  await seedAdminUser();
  await disableLegacySeedContent();
  await seedBanners();
  await seedProductCategoriesAndProducts();
  await seedNewsCategoriesAndNews();
  await seedStrengthCategories();
  await seedCompanyInfo();
  await seedAboutContent();
  await seedStrengthContent();
  await seedPartnersAndDeliveries();
  await seedServiceSupport();
  await seedSeoMeta();

  console.warn(
    '[seed] Default admin account created/updated: admin / admin123456. Please change this password immediately after first login.',
  );
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error('Seed failed:', error);
    await prisma.$disconnect();
    process.exit(1);
  });
