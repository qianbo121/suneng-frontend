/** Buyer decisions inferred from complete public case bodies; no search-demand or performance claim. */
export type BuyerSelectionGuide = {
  id: string;
  path: string;
  title: string;
  answer: string;
  options: { name: string; when: string; confirm: string }[];
  points: { title: string; text: string; cases: { slug: string; label: string; returnText: string }[] }[];
  next: string[];
  limits: string;
  related: { href: string; label: string }[];
};

export const buyerSelectionGuides: Record<string, BuyerSelectionGuide> = {
  'bearing-wire': {
    id: 'buyer-selection',
    path: '/zh/products/detail/trolley-furnace',
    title: '轴承钢丝球化退火用什么炉？',
    answer: '轴承钢丝球化退火可先把台车式、井式带内胆和罩式方案放在一起比较。选择先看钢种与前道状态、盘卷尺寸和单炉净重、表面与气氛要求，再看装卸、冷却和厂房条件。适合整批在台车上装卸，可评估台车炉；需要内胆保护气氛，应继续比较井式与罩式的密封、吊装和轮换条件。现有资料支持这些比较方向，不能直接替某一牌号定炉型或工艺曲线。',
    options: [
      { name: '台车式装卸', when: '盘卷能够在台面稳定摆放，车间具备台车进出、轨道及吊装空间。', confirm: '净工件和工装分别计重；核对支点、底部传热、装卷数量及测温位置。需要控制表面状态时另核气氛系统。' },
      { name: '井式带内胆', when: '盘卷与内胆、导流结构相容，顶部吊装可达，并能落实密封冷却和气源条件。', confirm: '有效区与内胆尺寸分开；上下密封、冷却水、供气排气和热态转运分别核对。' },
      { name: '罩式与多炉台轮换', when: '工件可在固定炉台堆放，行车能够移罩；需要比较加热与冷却占用。', confirm: '加热罩、炉台、内胆及冷却罩数量要配合整批周期；不能按炉台数量直接乘产量。' },
    ],
    points: [
      {
        title: '台车炉先核实这一批盘卷怎么装',
        text: '案例068的2017年方案列约φ1.3m、高1.7m盘卷，30t装载不含工装。这说明选型要同时提交卷形和工装重量，不能只报“30吨炉”。原件有球化退火参数，但封面2017-04-23、编号2017-04-21、落款2016-08-26并存，且概述用途另有表述；正式选型必须先统一版本与工艺用途，不能只凭温区推定球化工艺。',
        cases: [{ slug: 'bearing-wire-trolley-annealing-proposal', label: '查看案例068：盘卷装载、支承与版本边界', returnText: '如果正在确定轴承钢丝球化退火炉型，可把本案的台车装卷条件与井式内胆、罩式轮换放在一起比较。' }],
      },
      {
        title: '保护气氛方案要连同密封和冷却水比较',
        text: '案例056明确讨论钢丝球化退火，采用无底内胆，下部水冷油封与上口密封分开；按2.1t×8卷约16.8t，不能把16–20t的范围直接写成20t净装载。它说明气氛选型会连带装卷、密封和水气配套。原件落款2020-05-15与封面2026-05-18不一致，保留这一版本待确认事项；这些结构不是全部井式炉的标准配置。',
        cases: [{ slug: 'wire-coil-bottomless-retort-bottom-oil-top-cover-seal-proposal', label: '查看案例056：无底内胆的上下密封与配套', returnText: '本案的上下密封和冷却配套，可用于比较轴承钢丝退火采用井式内胆、台车或罩式方案时各自需要的条件。' }],
      },
      {
        title: '多炉台的价值，要由完整轮换时间验证',
        text: '案例054列一只加热罩、两个炉台及内胆、一只冷却罩，方案按单卷2t、10卷讨论20t装载，并列24h/炉，但未统一该周期包含的阶段。因此不能推成40t/日。它能支持“把装料、加罩、加热、冷却、移罩和行车等待逐项排程”的判断；不能证明罩式比台车或井式产量更高。该件落款2020-04-27、封面2026-05-18，采用关系待确认。',
        cases: [{ slug: 'bearing-wire-coil-bell-furnace-shared-heating-cooling-hood-scheduling-proposal', label: '查看案例054：共用加热罩与冷却罩怎样排程', returnText: '需要决定轴承钢丝退火采用哪种装卸方式时，可将本案的罩体轮换条件与台车、井式方案一起核对。' }],
      },
    ],
    next: ['提供钢种、前道加工状态、球化组织或硬度及表面要求，附已确认的工艺曲线；资料不足先列待验证项。', '提供盘卷内外径、高度、卷重、装卷与工装图，并说明行车、轨道、气源和冷却水现状。', '按同一代表装载比较三种路径的完整周期、供货分界和工件检验安排，再形成配置与报价。'],
    limits: '上述三例是历史方案资料，日期或版本差异尚待技术负责人确认；未提供可比的实际产能、能耗、球化组织和验收报告。不能据此确定通用温度曲线、承诺满载产量，或断言某一种炉型效果最好。',
    related: [{ href: '/zh/products/detail/pit-furnace', label: '井式炉：装料、有效区与气氛条件' }, { href: '/zh/products/detail/bell-furnace', label: '罩式炉：炉台、吊装与冷却组织' }],
  },
  'trolley-renovation': {
    id: 'buyer-selection',
    path: '/zh/solutions/rechuli-lu-gaizao-fengxian-zhouqi',
    title: '旧台车炉改造需要先确认什么？',
    answer: '先确认要解决的问题、原炉真实状态、准备保留的部件和新旧接口，再确定停产窗口与验收方法。加长炉膛、换燃料、修炉衬或升级控制会牵动不同系统，不能只按“改一台旧炉”报价。图纸与现场不符、承载或公辅条件不清时，先安排测绘与检查；据检查结果再比较局部修复、系统改造和整炉替换。',
    options: [
      { name: '局部修复', when: '问题位置明确，原炉主体和保留系统经检查仍适用，目标工艺与装载没有实质改变。', confirm: '列明损伤、拆检未知项、修复界面和复测范围；现有资料不能保证局修必然够用。' },
      { name: '系统改造', when: '准备加长、换燃料、改变分区或控制，需要旧设备与新增部分共同工作。', confirm: '逐项冻结利旧、替换、新增和买方配套；核对轨道基础、风烟气路、供电、信号与整炉测试。' },
      { name: '整炉替换比较', when: '检查发现原结构、接口或工艺适配条件难以保留，或改造风险与停产安排无法接受。', confirm: '在相同工件、目标和供货范围下比较新炉方案；没有现场诊断，不能承诺哪一种更省钱或更快。' },
    ],
    points: [
      {
        title: '加长会同时改变热负荷、分区和运行机构',
        text: '2019-06-23的案例067把有效长度由7m加到10m，加热由750kW增加300kW，控温由6区增加2区，还增加轮组和轨道并要求整炉复测。这些相互关联的改动支持先核对供电、承载、台车行程和新旧温区，再定工程量；原六区记录不能代替改后八区的整炉验收。',
        cases: [{ slug: 'trolley-furnace-three-meter-extension-whole-furnace-retest-proposal', label: '查看案例067：加长三米与整炉复测的关系', returnText: '本案说明加长不仅增加炉膛空间。拟改旧台车炉时，可继续核对供电、轨道、新旧分区和验收准备。' }],
      },
      {
        title: '保留风机和烟道，也要重新确认可用条件',
        text: '2018-11-13的案例013保留燃油系统，新增16套天然气烧嘴，两种模式共用原助燃与排烟系统，同时增做空气支管和换向装置。因此“利旧”仍涉及风量、压力、支路隔离、模式切换和故障保护的核对。原件未确认两种燃料同时混烧，16个炉温区也不等于另列选配的24点工件记录。',
        cases: [{ slug: 'large-trolley-dual-fuel-existing-air-flue-proposal', label: '查看案例013：旧风烟系统与新增燃烧系统的接口', returnText: '如果准备保留旧风机、烟道或控制，可先用旧台车炉改造入口梳理利旧条件、模式切换和供货分工。' }],
      },
      {
        title: '换燃料前，把检测、选配和买方配套分开',
        text: '2018-02-26的案例069讨论冷煤气改天然气，保留8烧嘴、4区的配置数量；燃料管道拟更新，部分风烟设备利旧。2套氧分析为选配，2套一氧化碳报警由买方配置，两者用途不同。它能支持逐项核对气源、管道、阀组、检测与保护范围，不能证明已经实现氧反馈自动调节、节能或表面质量改善。',
        cases: [{ slug: 'bearing-wire-gas-conversion-oxygen-analysis-co-alarm-proposal', label: '查看案例069：换气源、氧分析与报警供货边界', returnText: '本案的换燃料清单可作为旧台车炉改造输入之一；继续查看如何把气源、利旧系统、停产和验收放在同一范围内确认。' }],
      },
    ],
    next: ['提供旧炉与轨道照片、原图和历次改造记录、故障表现、当前装载与温度记录，标出未检查位置。', '说明新工件与工艺目标、供电或燃气条件、允许停产窗口，列出保留、替换、新增和现场自备项。', '由设备与现场负责人确认旧新接口、施工阶段、异常回退和改后整炉测试大纲，再形成可执行的工期与报价。'],
    limits: '三个案例均为方案，未证明工程已经实施或通过验收；旧设备现状和现场可用条件尚未核查。现有资料不能给出固定停产天数、统一改造价格、节能比例或利旧寿命。燃烧保护与承载等最终设计仍需技术负责人确认。',
    related: [{ href: '/zh/service/furnace-renovation-overhaul', label: '工业炉改造服务：诊断与供货范围' }, { href: '/zh/articles/laojiu-rechuli-lu-daxiu-haishi-maixin', label: '老炉大修还是换新：按相同条件比较' }],
  },
  'box-transfer': {
    id: 'buyer-selection',
    path: '/zh/products/detail/box-furnace',
    title: '箱式炉快速出料与入水方案怎样选择？',
    answer: '先说清工艺要求工件多快进入什么冷却介质，再比较整段装卸路径。只需将料盘送到炉外接料位，可评估推拉送盘；需要连工装取出、移动并下降入水，可评估铲齿转运；若用台车整体出炉，还要另行落实从台车到冷却工位的动作。炉门开启速度或料盘送出时间，都不能直接当作工件完全入水时间。',
    options: [
      { name: '推拉送盘至炉外', when: '批量和料盘适合托辊支承，炉外已有明确的接料人员或机构。', confirm: '核对推出高度与距离、料框尺寸及接料动作；若需入水，补上后续取料、移动和浸入时间。' },
      { name: '铲齿取料并转移入水', when: '工件或料筐有稳定叉取面，重心和热态载荷可核，水槽与轨道路径能够配合。', confirm: '同一装载图核对垫块、叉齿、料筐、炉口、水面和下降行程，并统一全部入水的计时终点。' },
      { name: '台车整体出炉后接续转运', when: '需要台车承载装卸，且后续冷却路径能够另行安排并满足工艺要求。', confirm: '出炉后谁取料、转到哪里、是否等待均需明确；台车吨位不能证明快速入水能力。' },
    ],
    points: [
      {
        title: '比较的第一步是终点相同，而不是秒数更小',
        text: '2023-07-24的案例038将“不大于5–7秒”限定为开门至料盘送出到位，最终阈值仍需统一，后续入水未定义。2023-02-12的案例006则列“工件出炉至入水≤30s”，起止事件未展开，同组台车方案没有相同指标。两例支持先画完整时序，再比较配置；不能认定5–7秒方案比30秒方案入水更快，也不能认定两台炉能替换。',
        cases: [
          { slug: 'small-sheet-solution-furnace-tray-transfer-interfaces-proposal', label: '查看案例038：送盘到位与后续接料的边界', returnText: '本案的5–7秒只涉及送盘到位；需要比较完整出炉入水方案时，请继续核对推拉送盘、铲齿转运与台车出炉的路径。' },
          { slug: 'high-temperature-shovel-transfer-trolley-comparison-proposal', label: '查看案例006：铲齿与台车两种装卸路径', returnText: '本案两种炉的装卸路径与计时条件不同；可回到箱式炉入口，按同一终点比较出料和入水方案。' },
        ],
      },
      {
        title: '炉内装得下，还要确认带筐转得走',
        text: '2016-12-17的案例077把炉内装载列为5–8t/炉、不含工装垫铁，而铲车写不少于8t、均匀装载且含工装。它支持把净工件、料筐和随行工装分别计重，再核对热态支承、重心及行程。这里的“不少于8t”不是最终能力仅有8t，也不能直接证明可转运8t净工件。',
        cases: [{ slug: 'stainless-solution-furnace-fork-load-with-tooling-proposal', label: '查看案例077：炉内净装载与铲车含工装载荷', returnText: '确定了本案的计重口径后，可继续用箱式炉入口检查料筐、炉口、叉取面与水槽组成的完整转运路径。' }],
      },
      {
        title: '自备料筐和水槽，要参加同一轮接口确认',
        text: '案例032（落款2024-03-20，封面3月19日）把料筐、水槽列为用户自备，并写出炉至入水约45s。有效工作尺寸按原方向列1.2×6×0.6m，不能自行交换长宽。它说明自备件的重量、垫块位置、叉齿净空、槽位和水面都会影响方案能否接通；自动补水并不代表水温和冷却能力已验证，约45s也不能改成开门至全浸没的保证值。',
        cases: [{ slug: 'fork-furnace-buyer-basket-support-water-tank-proposal', label: '查看案例032：自备料筐、水槽与转运接口', returnText: '自备件范围确认后，可回到快速出料与入水入口，把料筐、水槽和炉子按同一装载、同一计时规则核对。' }],
      },
    ],
    next: ['提供材质、工件及装盘图、净工件和工装重量、目标工艺，以及允许转移时间的起点与终点。', '在车间图上标明炉门、接料位、轨道或行走区、水槽、水面及现场已有设备，逐项确认设计、供货和安装责任。', '按实际代表装载核对门位、叉取、转运、浸入和下一批接料，再分别检查冷却条件与工件结果。'],
    limits: '这些资料均未提供实际完整入水测试或工件验收结果。不能按1200℃等设备温度反推工艺，不能用单段秒数排序性能，也不能把某一项目的水槽、叉齿或承载配置推广为所有箱式炉标准。',
    related: [{ href: '/zh/products/detail/shovel-furnace', label: '铲式炉：热态承托、取料和联锁条件' }, { href: '/zh/products/detail/trolley-furnace', label: '台车炉：整体装卸与承载条件' }],
  },
};

export const productBuyerGuide: Partial<Record<string, string>> = {
  'trolley-furnace': 'bearing-wire',
  'box-furnace': 'box-transfer',
};

export function getCaseBuyerLinks(slug: string) {
  return Object.values(buyerSelectionGuides).flatMap((guide) =>
    guide.points.flatMap((point) => point.cases.filter((item) => item.slug === slug).map((item) => ({
      href: `${guide.path}#${guide.id}`, label: guide.title, text: item.returnText,
    }))),
  );
}
