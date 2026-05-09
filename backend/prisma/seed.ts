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

async function seedProductCategoriesAndProducts() {
  const categories = [
    {
      slug: 'charging-truck-series',
      nameZh: '装药车系列',
      nameEn: 'Charging Truck Series',
      descriptionZh: '用于矿山及地下工程场景的装药车系列产品。',
      descriptionEn: 'Charging truck products for mining and underground engineering.',
      coverImage: 'https://placehold.co/800x600',
      iconImage: 'https://placehold.co/120x120',
      sortOrder: 10,
    },
    {
      slug: 'scaling-vehicle-series',
      nameZh: '撬毛车系列',
      nameEn: 'Scaling Vehicle Series',
      descriptionZh: '适用于井下巷道和矿山作业的撬毛车产品。',
      descriptionEn: 'Scaling vehicles for tunnel and mining operations.',
      coverImage: 'https://placehold.co/800x600',
      iconImage: 'https://placehold.co/120x120',
      sortOrder: 20,
    },
    {
      slug: 'crusher-series',
      nameZh: '破碎车系列',
      nameEn: 'Crusher Series',
      descriptionZh: '移动式破碎车系列，占位分类文案。',
      descriptionEn: 'Mobile crusher vehicle series.',
      coverImage: 'https://placehold.co/800x600',
      iconImage: 'https://placehold.co/120x120',
      sortOrder: 30,
    },
    {
      slug: 'mobile-crane',
      nameZh: '移动吊车',
      nameEn: 'Mobile Crane',
      descriptionZh: '移动吊装设备产品分类。',
      descriptionEn: 'Mobile lifting equipment category.',
      coverImage: 'https://placehold.co/800x600',
      iconImage: 'https://placehold.co/120x120',
      sortOrder: 40,
    },
    {
      slug: '4t-chassis-series',
      nameZh: '4T底盘系列',
      nameEn: '4T Chassis Series',
      descriptionZh: '4T 底盘产品系列占位分类。',
      descriptionEn: '4T chassis product series.',
      coverImage: 'https://placehold.co/800x600',
      iconImage: 'https://placehold.co/120x120',
      sortOrder: 50,
    },
    {
      slug: '8t-chassis-series',
      nameZh: '8T底盘系列',
      nameEn: '8T Chassis Series',
      descriptionZh: '8T 底盘产品系列占位分类。',
      descriptionEn: '8T chassis product series.',
      coverImage: 'https://placehold.co/800x600',
      iconImage: 'https://placehold.co/120x120',
      sortOrder: 60,
    },
    {
      slug: 'integrated-chassis-series',
      nameZh: '一体化底盘系列',
      nameEn: 'Integrated Chassis Series',
      descriptionZh: '一体化底盘产品系列占位分类。',
      descriptionEn: 'Integrated chassis product series.',
      coverImage: 'https://placehold.co/800x600',
      iconImage: 'https://placehold.co/120x120',
      sortOrder: 70,
    },
    {
      slug: 'concrete-mixer-transport-series',
      nameZh: '混凝土搅拌运输车系列',
      nameEn: 'Concrete Mixer Transport Series',
      descriptionZh: '混凝土搅拌运输车系列占位分类。',
      descriptionEn: 'Concrete mixer transport series.',
      coverImage: 'https://placehold.co/800x600',
      iconImage: 'https://placehold.co/120x120',
      sortOrder: 80,
    },
    {
      slug: 'underground-shotcrete-series',
      nameZh: '井下湿喷车系列',
      nameEn: 'Underground Shotcrete Series',
      descriptionZh: '井下湿喷车产品分类。',
      descriptionEn: 'Underground shotcrete vehicle category.',
      coverImage: 'https://placehold.co/800x600',
      iconImage: 'https://placehold.co/120x120',
      sortOrder: 90,
    },
    {
      slug: 'underground-masonry-multi-function-series',
      nameZh: '井下砌筑多功能车',
      nameEn: 'Underground Masonry Multi-function Series',
      descriptionZh: '井下砌筑多功能车产品分类。',
      descriptionEn: 'Underground masonry multi-function vehicle category.',
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
    slug: `${category.slug}-sample-${index + 1}`,
    nameZh: `${category.nameZh}示例产品`,
    nameEn: `${category.nameEn} Sample Product`,
    model: `MODEL-${index + 1}`,
    summaryZh: `${category.nameZh}示例产品摘要，用于前端和后台联调。`,
    summaryEn: `Summary for ${category.nameEn} sample product.`,
    descriptionZh: `${category.nameZh}示例产品详情，占位内容，可在后续阶段替换为正式资料。`,
    descriptionEn: `Detailed placeholder content for ${category.nameEn}.`,
    specsJson: {
      length: '6200mm',
      width: '1800mm',
      height: '2200mm',
      power: '75kW',
    },
    featuresJson: [
      '结构紧凑',
      '适配矿山场景',
      '预留多语言内容',
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
      titleZh: '示例行业新闻：矿山设备行业动态观察',
      titleEn: 'Sample Industry News: Mining Equipment Update',
      summaryZh: '用于初始化的行业新闻摘要。',
      summaryEn: 'Sample summary for industry news.',
      contentZh: '行业新闻示例内容，用于占位与新闻列表联调。',
      contentEn: 'Seeded industry news placeholder content.',
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
        titleZh: '专注地下工程装备制造与解决方案',
        titleEn: 'Focused on Underground Equipment and Turnkey Solutions',
        subtitleZh: '以稳定的产品、可靠的交付与持续的技术迭代服务矿山与工程客户。',
        subtitleEn: 'Serving mining and engineering customers with reliable equipment and dependable delivery.',
        imageUrl: 'https://placehold.co/1920x1080/004B97/ffffff',
        mobileImageUrl: 'https://placehold.co/900x1400/004B97/ffffff',
        linkUrl: '/products',
        isActive: true,
        sortOrder: 10,
        status: PublishStatus.published,
      },
      {
        sectionKey: 'home-hero',
        titleZh: '制造业质感的矿山机械设备品牌官网',
        titleEn: 'A Manufacturing-grade Website for Mining Machinery Brands',
        subtitleZh: '围绕产品、实力、服务与交付案例构建可持续运营的企业官网系统。',
        subtitleEn: 'A scalable corporate website built around products, capability, service and delivery cases.',
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
    { key: 'site_phone', valueZh: '+86 000-00000000', valueEn: '+86 000-00000000' },
    { key: 'site_address', valueZh: '湖北省某市某区某产业园 66 号', valueEn: 'No. 66, Example Industrial Park, Hubei, China' },
    { key: 'site_email', valueZh: 'contact@example.com', valueEn: 'contact@example.com' },
    { key: 'site_fax', valueZh: '+86 000-00000001', valueEn: '+86 000-00000001' },
    { key: 'salesPhone', valueZh: '+86 400-800-9000', valueEn: '+86 400-800-9000' },
    { key: 'topPhone', valueZh: '+86 400-800-9000', valueEn: '+86 400-800-9000' },
    { key: 'hotline', valueZh: '+86 400-800-9000', valueEn: '+86 400-800-9000' },
    { key: 'companyAddress', valueZh: '湖北省某市某区某产业园 66 号', valueEn: 'No. 66, Example Industrial Park, Hubei, China' },
    { key: 'foundedYear', valueZh: '2011', valueEn: '2011' },
    { key: 'registeredCapital', valueZh: '2736', valueEn: '2736' },
    { key: 'patentCount', valueZh: '90', valueEn: '90' },
    { key: 'employeeCount', valueZh: '100', valueEn: '100' },
    { key: 'wechatQr', valueZh: 'https://placehold.co/220x220/004B97/ffffff', valueEn: 'https://placehold.co/220x220/004B97/ffffff' },
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
        '苏能工业炉致力于地下工程装备、矿山施工装备与专用底盘产品的研发、制造与服务，围绕客户项目场景提供成套化产品方案。公司持续建设制造体系、技术体系与服务体系，以稳定交付和长期维护能力支撑工程客户。',
      contentEn:
        'Suneng Industrial Furnace focuses on the R&D, manufacturing and service of underground engineering equipment, mining machinery and special chassis products, delivering integrated equipment solutions for project-based scenarios.',
      imageUrl: 'https://placehold.co/1200x800/004B97/ffffff',
      sortOrder: 10,
      status: PublishStatus.published,
    },
    create: {
      sectionKey: 'profile',
      titleZh: '公司简介',
      titleEn: 'Company Profile',
      contentZh:
        '苏能工业炉致力于地下工程装备、矿山施工装备与专用底盘产品的研发、制造与服务，围绕客户项目场景提供成套化产品方案。公司持续建设制造体系、技术体系与服务体系，以稳定交付和长期维护能力支撑工程客户。',
      contentEn:
        'Suneng Industrial Furnace focuses on the R&D, manufacturing and service of underground engineering equipment, mining machinery and special chassis products, delivering integrated equipment solutions for project-based scenarios.',
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
        '我们坚持以产品质量和客户交付为核心，围绕工程机械应用场景持续打磨产品。企业的长期价值，来自稳定制造、技术积累和可信服务。',
      contentEn:
        'We remain focused on product quality and customer delivery, continuously refining our equipment around real engineering scenarios. Long-term value comes from reliable manufacturing, technical accumulation and trustworthy service.',
      imageUrl: 'https://placehold.co/720x900/004B97/ffffff',
      status: PublishStatus.published,
    },
    create: {
      singletonKey: 'default',
      titleZh: '董事长致辞',
      titleEn: 'Message from the Chairman',
      contentZh:
        '我们坚持以产品质量和客户交付为核心，围绕工程机械应用场景持续打磨产品。企业的长期价值，来自稳定制造、技术积累和可信服务。',
      contentEn:
        'We remain focused on product quality and customer delivery, continuously refining our equipment around real engineering scenarios. Long-term value comes from reliable manufacturing, technical accumulation and trustworthy service.',
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
        contentZh: '以稳定装备与专业服务支撑地下工程建设效率提升。',
        contentEn: 'Support underground engineering with reliable equipment and professional service.',
        icon: 'https://placehold.co/120x120/004B97/ffffff',
        sortOrder: 10,
        status: PublishStatus.published,
      },
      {
        type: CultureValueType.vision,
        titleZh: '企业愿景',
        titleEn: 'Vision',
        contentZh: '成为工程装备细分领域值得长期信赖的制造品牌。',
        contentEn: 'To become a long-term trusted manufacturing brand in specialized engineering equipment.',
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
        year: 2011,
        titleZh: '公司成立',
        titleEn: 'Company Founded',
        contentZh: '苏能工业炉在湖北正式成立，进入地下工程装备领域。',
        contentEn: 'Suneng Industrial Furnace was founded in Hubei and entered the underground equipment sector.',
        sortOrder: 10,
        status: PublishStatus.published,
      },
      {
        year: 2016,
        titleZh: '产品体系扩展',
        titleEn: 'Product Portfolio Expanded',
        contentZh: '完成多类型矿山施工装备产品布局，提升成套化交付能力。',
        contentEn: 'Expanded the equipment portfolio and improved integrated delivery capability.',
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
        summaryZh: '覆盖结构、液压、电控与整机集成。',
        summaryEn: 'Covering structure, hydraulics, control systems and whole-vehicle integration.',
        contentZh: '技术团队长期围绕矿山与地下工程装备的工况需求，持续优化设备可靠性与维护便利性。',
        contentEn: 'The engineering team continuously improves reliability and maintainability for mining scenarios.',
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
        regionZh: '华中',
        regionEn: 'Central China',
        cityZh: '武汉',
        cityEn: 'Wuhan',
        addressZh: '湖北省武汉市示例路 88 号',
        addressEn: 'No. 88 Example Road, Wuhan, Hubei',
        phone: '+86 027-00000001',
        lat: 30.5928,
        lng: 114.3055,
        sortOrder: 10,
        status: PublishStatus.published,
      },
      {
        regionZh: '华东',
        regionEn: 'East China',
        cityZh: '南京',
        cityEn: 'Nanjing',
        addressZh: '江苏省南京市示例大道 18 号',
        addressEn: 'No. 18 Example Avenue, Nanjing, Jiangsu',
        phone: '+86 025-00000002',
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
        addressZh: '四川省成都市示例街 66 号',
        addressEn: 'No. 66 Example Street, Chengdu, Sichuan',
        phone: '+86 028-00000003',
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
      titleZh: '制造业企业官网示例',
      titleEn: 'Manufacturing Corporate Website Demo',
      descriptionZh: '用于联调和展示的制造业企业官网示例首页 SEO 配置。',
      descriptionEn: 'SEO settings for the manufacturing corporate website demo homepage.',
      keywordsZh: '制造业,企业官网,矿山设备',
      keywordsEn: 'manufacturing,corporate website,mining equipment',
      ogImage: 'https://placehold.co/1200x630/004B97/ffffff',
    },
    {
      pageKey: 'products',
      titleZh: '产品中心',
      titleEn: 'Product Center',
      descriptionZh: '查看产品分类、热销产品与详细参数信息。',
      descriptionEn: 'Browse product categories, hot products and technical details.',
      keywordsZh: '产品中心,设备产品',
      keywordsEn: 'products,equipment',
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
