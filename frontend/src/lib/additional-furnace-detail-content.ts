// Selection copy grounded in the source notes listed in docs/four-furnace-content-20260910/.
// Project-specific dimensions, cycle times and acceptance limits are deliberately not catalog ratings.
type Copy = { zh: string; en: string };
const c = (zh: string, en: string): Copy => ({ zh, en });
type Pair = [Copy, Copy];
type DetailContent = {
  title: Copy;
  description: Copy;
  tags: Copy[];
  heroInfo: Pair[];
  workpieces: { title: Copy; text: Copy; caution?: boolean }[];
  options: { title: Copy; items: Copy[] }[];
  boundaries: Pair[];
  systems: Pair[];
  faqs: { question: Copy; answer: Copy }[];
  related: string[];
};

export const additionalFurnaceDetailContent: Record<string, DetailContent> = {
  'shovel-furnace': {
    title: c(
      '叉车炉｜铸锻件加热与转运',
      'Fork-Handling Furnace | Batch Heating and Load Transfer',
    ),
    description: c(
      '面向可由铲齿稳定承托的铸锻件和批次热处理任务，先核对工件底部空间、重心与出炉路线，再确定加热炉、取料机及后续工位的配合方式。',
      'For castings, forgings and batch loads that can be supported by forks. Confirm clearance beneath the load, centre of gravity and the unloading route before coordinating the chamber, handler and downstream stations.',
    ),
    tags: [
      c('铸锻件', 'Castings and forgings'),
      c('铲齿承托', 'Fork-supported loads'),
      c('周期式加热', 'Batch heating'),
      c('转运需工况校核', 'Transfer assessment'),
    ],
    heroInfo: [
      [
        c('工件条件', 'Workpiece'),
        c('尺寸、重量与重心', 'Dimensions, weight and centre of gravity'),
      ],
      [
        c('承托条件', 'Support'),
        c('底部净空与支承间距', 'Underside clearance and support spacing'),
      ],
      [c('工作温度', 'Temperature'), c('按材料与工艺确定', 'Defined by material and process')],
      [c('转运条件', 'Transfer'), c('炉门、行程与后续工位', 'Door, travel and downstream station')],
    ],
    workpieces: [
      {
        title: c('底部可稳定承托的铸锻件', 'Castings and forgings with stable support'),
        text: c(
          '工件需具备铲齿进入和托起的空间，热态支承、重心和接触位置应能共同确认。',
          'The forks need room to enter and lift. Check support, centre of gravity and contact points in the hot condition.',
        ),
      },
      {
        title: c('需要协调出炉转移的批次工件', 'Batch loads requiring coordinated transfer'),
        text: c(
          '适合把炉门开启、铲齿取料与后续冷却工位作为一条工艺路线评估的项目。',
          'Evaluate door opening, fork pickup and downstream cooling as a coordinated process route.',
        ),
      },
      {
        title: c('薄小散件或支承不稳定工件', 'Small loose parts or unstable loads'),
        text: c(
          '先评估料具与承托方案；无法稳定托取时，应比较其他装炉和输送方式。',
          'Assess fixtures and support first. Compare other loading or transport methods when the load cannot be picked up stably.',
        ),
        caution: true,
      },
    ],
    options: [
      {
        title: c('承托方式', 'Support'),
        items: [
          c('炉内支承', 'Furnace supports'),
          c('专用工装', 'Dedicated fixtures'),
          c('热态间隙校核', 'Hot-clearance check'),
        ],
      },
      {
        title: c('取料机构', 'Handler'),
        items: [
          c('铲齿长度与间距', 'Fork length and spacing'),
          c('起升与行走行程', 'Lift and travel'),
          c('载荷与重心', 'Load and centre of gravity'),
        ],
      },
      {
        title: c('转运路线', 'Transfer route'),
        items: [
          c('出炉后转运', 'Unloading transfer'),
          c('衔接冷却工位', 'Cooling-station interface'),
          c('淬火需另定条件', 'Separate quench specification'),
        ],
      },
      {
        title: c('动作配合', 'Coordination'),
        items: [
          c('炉门位置确认', 'Door-position confirmation'),
          c('取料机联锁', 'Handler interlocks'),
          c('人员与设备隔离', 'Personnel separation'),
        ],
      },
    ],
    boundaries: [
      [
        c('装料包络', 'Load envelope'),
        c(
          '工件、料具和必要间隙共同决定工作空间，不能只按单件外形确定炉膛。',
          'Parts, fixtures and required clearances determine the working space; part dimensions alone are insufficient.',
        ),
      ],
      [
        c('承载与重心', 'Load and centre of gravity'),
        c(
          '核对铲齿、工装及工件形成的载荷状态，额定起升能力不能替代稳定性校核。',
          'Check the combined load condition of forks, fixtures and parts; lifting capacity alone does not establish stability.',
        ),
      ],
      [
        c('转移时间', 'Transfer time'),
        c(
          '按出炉、托取、行走和进入后续工位的起止事件约定，不把行走速度直接写成工艺转移时间。',
          'Define start and end events across unloading, pickup, travel and downstream entry. Travel speed is not process transfer time.',
        ),
      ],
      [
        c('冷却与质量', 'Cooling and quality'),
        c(
          '介质、冷却设备和产品检验另行确认，配置铲齿机构不等于已经包含完整淬火系统。',
          'Specify the medium, cooling equipment and part inspection separately; fork handling does not imply a complete quench system.',
        ),
      ],
    ],
    systems: [
      [
        c('炉体与炉内支承', 'Chamber and supports'),
        c(
          '围绕装料包络布置炉衬、加热与承托，保留铲齿进入及热态变形所需空间。',
          'Arrange lining, heating and supports around the load envelope, including fork access and hot deformation.',
        ),
      ],
      [
        c('炉门与净开口', 'Door and clear opening'),
        c(
          '核对炉门提升位置、炉口净空、门框密封及取料机进入条件。',
          'Check the lifted door position, clear opening, frame sealing and handler access.',
        ),
      ],
      [
        c('铲齿与轨道取料机', 'Forks and rail handler'),
        c(
          '按工件重心和支点核对铲齿、起升机构、行走轨道及定位。',
          'Assess forks, lift, rails and positioning against the load centre of gravity and support points.',
        ),
      ],
      [
        c('控制与安全联锁', 'Controls and interlocks'),
        c(
          '把炉门、取料、后续工位和异常停机处置纳入同一动作配合范围。',
          'Coordinate the door, pickup, downstream readiness and safe response to an abnormal stop.',
        ),
      ],
    ],
    faqs: [
      {
        question: c('叉车炉和台车炉怎么区分？', 'How does it differ from a trolley furnace?'),
        answer: c(
          '本页叉车炉由独立取料机托起工件并进出固定炉膛；台车炉由承料台车带着工件进出。选择时重点比较工件支承、装卸路线和工艺转移要求。',
          'Here, a separate handler lifts the load into and out of a fixed chamber. A trolley furnace carries the load on its moving hearth. Compare support, loading routes and transfer requirements.',
        ),
      },
      {
        question: c('是否默认包含淬火槽？', 'Is a quench tank included as standard?'),
        answer: c(
          '需要按材料和工艺确认。加热炉、取料机、冷却或淬火设备的供货范围分别列清，不能从叉车炉名称推定整套设备已经包含。',
          'That depends on the material and process. Specify the chamber, handler and cooling or quench equipment separately.',
        ),
      },
      {
        question: c('能否仅按工件重量选型？', 'Can the furnace be sized by part weight alone?'),
        answer: c(
          '还需提供尺寸、重心、支点、底部进入空间和料具信息。同样重量的工件，所需铲齿和支承布置可能不同。',
          'Dimensions, centre of gravity, supports, underside access and fixtures are also required. Equal-weight parts can need different handling arrangements.',
        ),
      },
      {
        question: c('报价前最少准备哪些资料？', 'What is needed for a quotation?'),
        answer: c(
          '准备工件图或尺寸重量、材料与工艺曲线、支承与取料空间、出炉后的转运要求，并说明炉前轨道和后续工位布置。',
          'Provide a drawing or dimensions and weight, material and cycle, support and fork access, transfer requirements and the rail and downstream layout.',
        ),
      },
    ],
    related: ['box-furnace', 'trolley-furnace'],
  },
  'walking-beam-furnace': {
    title: c(
      '步进炉｜坯料与杆件连续加热',
      'Walking Beam Furnace | Indexed Continuous Heating',
    ),
    description: c(
      '面向可在梁上稳定支承、规格与生产节奏相对稳定的工件，先核对支承间距、步距和装出料条件，再匹配温区、停留时间与步进周期。',
      'For loads that rest stably on beams and have a relatively consistent production rhythm. Match support spacing, pitch and handling to the heating zones, residence time and step cycle.',
    ),
    tags: [
      c('坯料与杆件', 'Billets and bars'),
      c('梁式支承', 'Beam support'),
      c('节拍式输送', 'Indexed movement'),
      c('连续生产组织', 'Continuous production'),
    ],
    heroInfo: [
      [c('工件条件', 'Workpiece'), c('长度、截面与单件重量', 'Length, section and piece weight')],
      [c('承托条件', 'Support'), c('梁间距与接触位置', 'Beam spacing and contact points')],
      [c('节拍条件', 'Cadence'), c('步距、周期与停留时间', 'Pitch, cycle and residence time')],
      [c('现场条件', 'Site'), c('装出料与驱动检修空间', 'Handling and drive access')],
    ],
    workpieces: [
      {
        title: c('可跨梁稳定支承的坯料、杆件', 'Billets and bars supported across beams'),
        text: c(
          '先核对长度、截面、重量、接触位置和允许的支承痕迹，再确定梁间距。',
          'Confirm length, section, weight, contact locations and acceptable support marks before setting beam spacing.',
        ),
      },
      {
        title: c('规格与产量相对稳定的批量工件', 'Production loads with consistent geometry'),
        text: c(
          '适合将装出料、步进和加热作为连续生产系统协调评估的项目。',
          'Assess loading, indexed movement and heating together as a continuous production system.',
        ),
      },
      {
        title: c('薄小散件或频繁大幅换型', 'Small loose parts or major frequent changeovers'),
        text: c(
          '支承不稳定、工件易卡滞或批次变化明显时，先比较其他承托和输送方式。',
          'Compare other support and transport arrangements where loads are unstable, prone to jamming or change substantially.',
        ),
        caution: true,
      },
    ],
    options: [
      {
        title: c('支承方式', 'Support'),
        items: [
          c('固定梁与活动梁', 'Fixed and moving beams'),
          c('梁间距与接触面', 'Spacing and contact surface'),
          c('热态变形校核', 'Hot-deformation check'),
        ],
      },
      {
        title: c('步进条件', 'Movement'),
        items: [
          c('步距与抬升高度', 'Pitch and lift'),
          c('前移与返回周期', 'Advance and return cycle'),
          c('同步与定位', 'Synchronization and positioning'),
        ],
      },
      {
        title: c('加热条件', 'Heating'),
        items: [
          c('材料与截面', 'Material and section'),
          c('温区与装载排布', 'Zones and loading layout'),
          c('停留时间', 'Residence time'),
        ],
      },
      {
        title: c('装出料衔接', 'Handling interfaces'),
        items: [
          c('进料定位', 'Entry positioning'),
          c('出料节拍', 'Discharge cadence'),
          c('停机后工件处置', 'Load handling after a stop'),
        ],
      },
    ],
    boundaries: [
      [
        c('步频与产能', 'Step rate and output'),
        c(
          '机械步频只是动作条件；合格产能还取决于材料、截面、装载间距、加热时间与换型。',
          'Mechanical step rate is only one input. Conforming output also depends on material, section, spacing, heating time and changeovers.',
        ),
      ],
      [
        c('工作区与炉长', 'Working zone and furnace length'),
        c(
          '工件在各温区内的排布与停留时间共同决定有效加热条件，不能只按设备总长换算。',
          'Load positions and residence time in each zone determine heating conditions; overall length alone is insufficient.',
        ),
      ],
      [
        c('支承与表面', 'Support and surface'),
        c(
          '梁接触、热态挠曲和工件表面要求需共同核对，不把梁式输送等同于无接触处理。',
          'Assess beam contact, hot deflection and surface requirements together; beam transport is not contact-free treatment.',
        ),
      ],
      [
        c('冷却与配套', 'Cooling and auxiliaries'),
        c(
          '出料后的冷却方式、输送和公用工程分别列入范围；选用水冷部件时另定水质、流量与保护条件。',
          'Specify downstream cooling, handling and utilities separately. Water-cooled components require agreed water conditions and protection.',
        ),
      ],
    ],
    systems: [
      [
        c('固定梁与活动梁', 'Fixed and moving beams'),
        c(
          '两组支承交替承载工件，位置、间距和热态水平需结合实际工件确认。',
          'The two support sets carry the load alternately; confirm spacing, position and hot alignment for the actual parts.',
        ),
      ],
      [
        c('步进驱动与导向', 'Drive and guides'),
        c(
          '完成抬升、前移、下降、返回动作，核对同步、行程、到位信号和异常停机保护。',
          'Provide lift, advance, lower and return movements, with synchronization, travel limits, position signals and stop protection.',
        ),
      ],
      [
        c('炉体与温区', 'Chamber and heating zones'),
        c(
          '围绕材料、截面和停留时间配置炉衬、加热及测温，兼顾装出料处热损失。',
          'Arrange lining, heating and measurement for the material, section and residence time, including entry and exit heat losses.',
        ),
      ],
      [
        c('装出料与过程记录', 'Handling and records'),
        c(
          '把进料定位、炉内排布、出料节拍及过程记录纳入整线配合。',
          'Coordinate entry positioning, in-furnace spacing, discharge cadence and process records.',
        ),
      ],
    ],
    faqs: [
      {
        question: c('步进炉为什么属于连续式炉？', 'Why is a walking beam furnace continuous?'),
        answer: c(
          '工件按节拍依次进入、通过和离开炉膛，生产组织是连续的，但单次输送包含停留与步进，并非始终匀速运动。',
          'Loads enter, pass through and leave in sequence. Production is continuous, while individual movements include dwell and indexed steps.',
        ),
      },
      {
        question: c(
          '与推杆炉、辊底炉的区别是什么？',
          'How does it differ from pusher and roller hearth furnaces?',
        ),
        answer: c(
          '步进梁交替托起并搬移工件；推杆靠推动形成前移，辊底靠辊道输送。应根据支承、表面要求、规格变化和节拍选择。',
          'Walking beams alternately lift and move the load; pushers advance it by pushing, and roller hearths use rollers. Select according to support, surface requirements, geometry and cadence.',
        ),
      },
      {
        question: c(
          '机械步进更快，产量就更高吗？',
          'Does a faster step rate always increase output?',
        ),
        answer: c(
          '需同时满足工件加热与质量要求。步进周期缩短会改变停留时间，不能只按机械速度承诺合格产能。',
          'Heating and quality requirements still apply. A shorter step cycle changes residence time, so mechanical speed alone cannot establish conforming output.',
        ),
      },
      {
        question: c('选型前要确认哪些现场条件？', 'Which site conditions must be checked?'),
        answer: c(
          '核对装出料布置、驱动和检修空间、基础、公用工程及异常停机后的工件处置；水冷结构按实际方案单独确认。',
          'Check handling layout, drive and maintenance access, foundations, utilities and load handling after an abnormal stop. Assess water cooling only where included in the design.',
        ),
      },
    ],
    related: ['pusher-furnace', 'roller-hearth-furnace'],
  },
  'elevator-hearth-furnace': {
    title: c(
      '升降式炉｜炉底升降装料',
      'Elevator Hearth Furnace | Bottom Loading and Batch Treatment',
    ),
    description: c(
      '面向适合在炉台上稳定放置的工件、料框与工装，先核对装料包络、总载荷及厂房净高，再确定炉底升降、炉口密封与加热条件。',
      'For parts, baskets and fixtures that can rest stably on a hearth. Confirm the load envelope, total supported weight and building clearance before defining lift travel, opening seals and heating conditions.',
    ),
    tags: [
      c('炉台承载', 'Hearth-supported loads'),
      c('炉底升降', 'Elevating hearth'),
      c('炉外装卸', 'External loading'),
      c('周期式处理', 'Batch treatment'),
    ],
    heroInfo: [
      [c('装料包络', 'Load envelope'), c('工件、料框与工装', 'Parts, baskets and fixtures')],
      [
        c('升降载荷', 'Lift load'),
        c('按总载荷与重心校核', 'Total supported load and centre of gravity'),
      ],
      [
        c('行程与净高', 'Travel and clearance'),
        c('装卸、升降与检修空间', 'Loading, lift and maintenance space'),
      ],
      [
        c('工作条件', 'Process conditions'),
        c('温度、气氛与冷却方式', 'Temperature, atmosphere and cooling'),
      ],
    ],
    workpieces: [
      {
        title: c('可在炉台稳定放置的工件', 'Parts stable on the hearth'),
        text: c(
          '装料后的重心、支点和外形应明确，并满足升起时通过炉口的净空要求。',
          'Define the loaded centre of gravity, supports and envelope, including clearance through the chamber opening.',
        ),
      },
      {
        title: c('采用料框或专用工装的批次件', 'Batch loads in baskets or dedicated fixtures'),
        text: c(
          '将料框和工装重量一并纳入载荷，校核装卸便利性与热态稳定性。',
          'Include baskets and fixtures in the supported weight and assess access and hot stability.',
        ),
      },
      {
        title: c('超出净高或要求快速转移的项目', 'Limited-clearance or rapid-transfer projects'),
        text: c(
          '先比较厂房空间和转移路线；有快速淬火要求时，另行评估结构与配套设备。',
          'Compare building clearance and transfer routes first. Rapid quenching requires separate assessment of structure and equipment.',
        ),
        caution: true,
      },
    ],
    options: [
      {
        title: c('承载与装料', 'Load and loading'),
        items: [
          c('工件直接承放', 'Direct support'),
          c('料框或专用工装', 'Baskets or fixtures'),
          c('重心与热态稳定', 'Centre of gravity and hot stability'),
        ],
      },
      {
        title: c('升降机构', 'Lift'),
        items: [
          c('行程与导向', 'Travel and guides'),
          c('同步与定位', 'Synchronization and position'),
          c('机械支承与防坠', 'Mechanical support and fall protection'),
        ],
      },
      {
        title: c('加热与密封', 'Heating and seals'),
        items: [
          c('有效工作区', 'Working zone'),
          c('炉口配合', 'Opening interface'),
          c('气氛按工艺确认', 'Process-specific atmosphere'),
        ],
      },
      {
        title: c('出料条件', 'Unloading'),
        items: [
          c('降台前温度状态', 'Temperature before lowering'),
          c('冷却或转运', 'Cooling or transfer'),
          c('装卸与人员防护', 'Handling and personnel protection'),
        ],
      },
    ],
    boundaries: [
      [
        c('炉底升降与炉体升降', 'Hearth lift and chamber lift'),
        c(
          '本页为上炉体固定、底部炉台升降的结构；炉体升降方案的运动部件和配套条件不同。',
          'This design has a fixed upper chamber and a moving bottom hearth. A lifting chamber has different moving parts and interfaces.',
        ),
      ],
      [
        c('净装载与总载荷', 'Net load and total supported load'),
        c(
          '工件、料框、工装及升降承载部件需分别核对，不能只把工件重量作为机构选型依据。',
          'Assess parts, baskets, fixtures and moving support components separately; part weight alone does not size the lift.',
        ),
      ],
      [
        c('炉膛与现场空间', 'Chamber and site space'),
        c(
          '除装料包络外，还需留出升降行程、炉口净空、吊装、检修和可靠支承所需空间。',
          'Allow for lift travel, opening clearance, lifting access, maintenance and reliable support in addition to the load envelope.',
        ),
      ],
      [
        c('外观与气密性', 'Appearance and gas-tightness'),
        c(
          '气氛工况应明确密封、置换、监测与验收，不能由外观或炉底闭合状态推定。',
          'Atmosphere duty needs specified seals, purging, monitoring and acceptance; appearance or hearth closure does not prove gas-tightness.',
        ),
      ],
    ],
    systems: [
      [
        c('固定上炉体', 'Fixed upper chamber'),
        c(
          '炉体与支架共同形成加热空间和固定支承，配置按工艺与装载确定。',
          'The chamber and supporting frame define the heated enclosure and fixed support, configured for the process and load.',
        ),
      ],
      [
        c('承料炉台与炉口', 'Loading hearth and opening'),
        c(
          '核对承料面、热态间隙、炉口配合及随炉料具的使用条件。',
          'Check the loading surface, hot clearances, opening interface and fixture service conditions.',
        ),
      ],
      [
        c('升降驱动与导向', 'Lift drive and guides'),
        c(
          '围绕总载荷与重心校核行程、同步、导向和到位检测。',
          'Assess travel, synchronization, guides and position sensing for the total load and centre of gravity.',
        ),
      ],
      [
        c('支承、防坠与联锁', 'Support, fall protection and interlocks'),
        c(
          '运行防护、断电安全状态与维修时可靠支承分别确认，不以控制信号替代机械保护。',
          'Specify operational guarding, a safe power-loss state and maintenance supports separately; control signals do not replace mechanical protection.',
        ),
      ],
    ],
    faqs: [
      {
        question: c('升降式炉是炉体升降还是炉底升降？', 'Does the chamber or the hearth move?'),
        answer: c(
          '升降式炉包含不同结构。本页展示炉底升降型，上炉体固定，承料炉台升入加热空间；选型与报价时需要先明确这一点。',
          'Elevating furnaces have different arrangements. This page shows a moving bottom hearth entering a fixed upper chamber; establish that distinction before specification.',
        ),
      },
      {
        question: c('升降载荷是否只计算工件重量？', 'Does lift load mean part weight only?'),
        answer: c(
          '还需核对料框、工装和升降承载部件，并考虑重心、偏载及热态条件，具体口径写入技术方案。',
          'Include baskets, fixtures and moving support components, with centre of gravity, uneven loading and hot conditions defined in the specification.',
        ),
      },
      {
        question: c('能否直接用于快速淬火？', 'Can it be used directly for rapid quenching?'),
        answer: c(
          '需要另外确认材料、允许转移时间、炉台动作和冷却设备位置。普通炉底升降结构不能自动视为已具备快速淬火能力。',
          'Assess the material, permitted transfer time, hearth movement and cooling-equipment position separately. A bottom-loading design alone does not establish rapid-quench capability.',
        ),
      },
      {
        question: c('现场尺寸先量哪些位置？', 'Which site dimensions should be checked first?'),
        answer: c(
          '先量厂房净高、炉台装卸区域、吊装路线和基础条件，再把升降行程、检修及维修支承空间一并核对。',
          'Measure building height, hearth loading area, lifting route and foundations, then account for travel, maintenance and support space.',
        ),
      },
    ],
    related: ['box-furnace', 'bell-furnace'],
  },
  'gas-nitriding-furnace': {
    title: c('氮化炉｜钢件表面处理与气氛控制', 'Gas Nitriding Furnace | Steel Surface Treatment'),
    description: c(
      '面向适合气体氮化的轴、齿轮、模具及其他钢件，先确认材料、前序状态、处理部位和氮化层要求，再确定装炉、温控、气氛与尾气处理方案。',
      'For shafts, gears, dies and other steels suitable for gas nitriding. Confirm material, prior condition, treatment areas and case requirements before defining loading, temperature control, atmosphere and exhaust treatment.',
    ),
    tags: [
      c('适用钢件', 'Suitable steel parts'),
      c('气体氮化', 'Gas nitriding'),
      c('密封炉罐', 'Sealed retort'),
      c('质量按工艺验收', 'Process-based acceptance'),
    ],
    heroInfo: [
      [
        c('材料与前序', 'Material and prior condition'),
        c('钢种、热处理与表面状态', 'Steel grade, heat treatment and surface'),
      ],
      [c('装炉条件', 'Loading'), c('料具、间距与气流通道', 'Fixtures, spacing and gas-flow paths')],
      [
        c('质量目标', 'Quality targets'),
        c('层深、硬度与尺寸要求', 'Case depth, hardness and dimensions'),
      ],
      [c('现场条件', 'Site'), c('气源、通风与尾气处理', 'Gas supply, ventilation and exhaust')],
    ],
    workpieces: [
      {
        title: c('材料与前序状态明确的轴、齿轮', 'Shafts and gears with defined prior condition'),
        text: c(
          '先确认钢种、前序热处理、加工余量和需要处理的表面，再评估气体氮化路线。',
          'Confirm grade, prior heat treatment, machining allowance and treatment surfaces before assessing gas nitriding.',
        ),
      },
      {
        title: c(
          '有表面硬度与层深要求的模具、零件',
          'Dies and parts with defined case requirements',
        ),
        text: c(
          '把处理部位、层深定义、检测位置、组织及尺寸要求写清，再确定装炉与工艺。',
          'Define treatment areas, case-depth criteria, test locations, microstructure and dimensional requirements before setting loading and process conditions.',
        ),
      },
      {
        title: c('特殊材料或表面状态尚未确认', 'Unverified materials or surface conditions'),
        text: c(
          '先验证工艺适用性，不能仅凭炉型名称推定所有钢种或表面状态都适合处理。',
          'Validate process suitability first; a furnace name does not establish compatibility with every grade or surface condition.',
        ),
        caution: true,
      },
    ],
    options: [
      {
        title: c('材料与质量', 'Material and quality'),
        items: [
          c('钢种与前序热处理', 'Grade and prior heat treatment'),
          c('处理部位与层深', 'Treatment areas and case depth'),
          c('硬度与尺寸要求', 'Hardness and dimensions'),
        ],
      },
      {
        title: c('装载与循环', 'Loading and circulation'),
        items: [
          c('料框与专用料具', 'Baskets and fixtures'),
          c('间距与气流通道', 'Spacing and gas-flow paths'),
          c('代表装载验证', 'Representative-load validation'),
        ],
      },
      {
        title: c('气氛与记录', 'Atmosphere and records'),
        items: [
          c('供气与置换', 'Gas supply and purge'),
          c('监测方式', 'Monitoring method'),
          c('氮势控制按需求配置', 'Nitriding-potential control as specified'),
        ],
      },
      {
        title: c('气路与现场', 'Gas system and site'),
        items: [
          c('密封与检测', 'Seals and detection'),
          c('尾气与通风', 'Exhaust and ventilation'),
          c('异常状态处置', 'Abnormal-state response'),
        ],
      },
    ],
    boundaries: [
      [
        c('气体氮化与保护加热', 'Nitriding and protective heating'),
        c(
          '气体氮化以表面处理为目标，不等同于通氮气保护加热，也不等同于渗碳或等离子氮化。',
          'Gas nitriding is a surface-treatment process, distinct from nitrogen-protected heating, carburizing and plasma nitriding.',
        ),
      ],
      [
        c('设备配置与处理结果', 'Equipment and treatment result'),
        c(
          '层深、硬度和组织由材料、前序状态、气氛与时间共同决定，配置说明不能替代工件检验。',
          'Case depth, hardness and microstructure depend on material, prior condition, atmosphere and time; configuration does not replace part inspection.',
        ),
      ],
      [
        c('有效空间与装炉量', 'Working space and batch load'),
        c(
          '料具、工件间距及循环通道共同影响装载，不能把炉罐容积直接换算成通用装炉重量。',
          'Fixtures, spacing and circulation paths determine loading; retort volume cannot be converted into a universal batch weight.',
        ),
      ],
      [
        c('尺寸与变形', 'Dimensions and distortion'),
        c(
          '有尺寸要求时，事先约定测量基准、位置和允许变化，不能笼统承诺处理后零变形。',
          'Where dimensions matter, agree datums, measurement locations and allowable change in advance; zero distortion is not a general guarantee.',
        ),
      ],
    ],
    systems: [
      [
        c('炉体、炉罐与加热', 'Chamber, retort and heating'),
        c(
          '围绕有效工作区和装载配置炉罐、炉衬与加热，明确密封与检验范围。',
          'Configure retort, lining and heating around the working zone and loading, with sealing and inspection scope defined.',
        ),
      ],
      [
        c('炉盖与循环', 'Lid and circulation'),
        c(
          '核对炉盖密封、锁紧、循环和装卸净空；开盖条件按确认的工艺与安全要求执行。',
          'Check lid seals, clamping, circulation and loading clearance; opening conditions follow the agreed process and safety requirements.',
        ),
      ],
      [
        c('供气、监测与尾气', 'Gas supply, monitoring and exhaust'),
        c(
          '供气、置换、测量、排放和检测保护组成完整气路范围，按现场专业设计确认。',
          'Specify supply, purging, measurement, exhaust and detection as a complete gas-system scope, subject to specialist site design.',
        ),
      ],
      [
        c('温控、记录与联锁', 'Temperature, records and interlocks'),
        c(
          '明确温度、气氛和批次记录，分别确认气源异常、泄漏和停电时的安全处置。',
          'Define temperature, atmosphere and batch records, with separate safe responses to supply loss, leakage and power failure.',
        ),
      ],
    ],
    faqs: [
      {
        question: c(
          '气体氮化与通氮气保护加热相同吗？',
          'Is gas nitriding the same as nitrogen-protected heating?',
        ),
        answer: c(
          '两者目的和工艺条件不同。气体氮化关注表层处理结果，保护加热主要围绕加热时的表面保护，不能仅凭气体名称互相替代。',
          'They have different objectives and process conditions. Gas nitriding targets the surface layer; protective heating addresses surface protection during heating.',
        ),
      },
      {
        question: c(
          '可以直接承诺统一的层深和硬度吗？',
          'Can one case depth or hardness be guaranteed for all parts?',
        ),
        answer: c(
          '应先确认材料、前序状态、处理部位、层深定义和检验方法，再按工件约定工艺与验收条件。',
          'First establish material, prior condition, treatment areas, the case-depth definition and test method, then agree process and acceptance conditions for the parts.',
        ),
      },
      {
        question: c(
          '氮化后能否保证没有尺寸变化？',
          'Can nitriding guarantee no dimensional change?',
        ),
        answer: c(
          '不能作通用保证。有尺寸或变形要求时，需要在处理前约定测量基准、位置及允许变化，并结合代表工件验证。',
          'Not as a general guarantee. Define measurement datums, locations and allowable change before processing, then verify representative parts.',
        ),
      },
      {
        question: c('气源和尾气处理由谁负责？', 'Who provides gas supply and exhaust treatment?'),
        answer: c(
          '设备供货、现场储供气、通风、尾气处理及检测保护应逐项划分责任；具体配置结合现场专业设计和适用要求确定。',
          'Allocate responsibility for equipment, site gas supply, ventilation, exhaust treatment and detection item by item, based on specialist design and applicable requirements.',
        ),
      },
    ],
    related: ['pit-furnace', 'box-furnace'],
  },
};
