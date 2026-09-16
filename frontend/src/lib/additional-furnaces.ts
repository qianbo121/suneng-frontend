// Representative structures for selection; illustrations are not delivery photographs.
export const additionalFurnaces = [
  {
    id: 'shovel-furnace',
    categoryId: 12,
    animationKind: 'shovel',
    englishName: 'FORK-HANDLING FURNACE',
    nameEn: 'Fork-Handling Furnace',
    name: '叉车炉',
    description: '铲齿取件 · 快速转运',
    descriptionEn: 'Batch heating with fork handling and coordinated transfer.',
    image: '/images/home/product-center/additional-20260909/shovel-furnace.webp',
    imageAlt: '箱式加热炉与独立轨道铲齿取料机结构示意',
    href: '/zh/products/detail/shovel-furnace',
    group: 'periodic',
    workpiece: '适合铲齿承托的铸锻件',
    handling: '铲齿取件 · 炉外转运',
    summary:
      '箱式加热炉配合铲齿取料机，完成工件的托取、出炉与转运；用于需要协调出炉节拍的批次热处理。',
    summaryEn:
      'A batch chamber furnace paired with a fork-handling machine for supported pickup, unloading and coordinated transfer.',
    principle:
      '工件在炉内支承上加热。炉门开启并确认净空后，铲齿伸入工件下方，托起工件、退出炉膛，再按工艺要求转运。',
    principleEn:
      'The workpiece rests on furnace supports during heating. With the door open and clearance verified, forks enter below the load, lift it, withdraw and transfer it as required by the process.',
    boundary:
      '铲齿是取料机构，不是散热器切削加工设备。是否配置淬火槽、采用何种介质及允许转移时间，均按材料和工艺确认。',
    boundaryEn:
      'The forks handle loads; this is not a fin-skiving machine. Quench equipment, medium and permitted transfer time must be specified for the material and process.',
    steps: ['炉内加热', '开门确认净空', '铲齿托取', '退出并转运'],
    stepsEn: ['Batch heating', 'Open and check clearance', 'Fork pickup', 'Withdraw and transfer'],
    inputs: [
      '工件尺寸、重量与重心',
      '底部支承与铲齿进入空间',
      '材料、加热工艺与转运要求',
      '炉前轨道、行程与配套设备布置',
    ],
    inputsEn: [
      'Dimensions, weight and centre of gravity',
      'Support points and fork clearance',
      'Material, heating and transfer requirements',
      'Rail travel and equipment layout',
    ],
  },
  {
    id: 'walking-beam-furnace',
    categoryId: 13,
    animationKind: 'walking',
    englishName: 'WALKING BEAM FURNACE',
    nameEn: 'Walking Beam Furnace',
    name: '步进炉',
    description: '梁式步进 · 节拍加热',
    descriptionEn: 'Indexed heating with alternating fixed and moving beams.',
    image: '/images/home/product-center/additional-20260909/walking-beam-furnace.webp',
    imageAlt: '固定梁与活动梁交替承载的步进梁炉结构示意',
    href: '/zh/products/detail/walking-beam-furnace',
    group: 'continuous',
    workpiece: '适合梁式支承的坯料、杆件',
    handling: '抬升前移 · 落下返回',
    summary:
      '固定梁与活动梁交替承载工件，使工件按设定步距和节拍通过炉膛，适合规格与生产节奏相对稳定的加热工序。',
    summaryEn:
      'Fixed and moving beams alternately support the load, advancing it through the furnace at a defined pitch and cadence.',
    principle:
      '活动梁依次完成抬升、前移、下降、返回。工件随活动梁前移，落到固定梁后停留，活动梁从下方返回起点。',
    principleEn:
      'Moving beams lift, advance, lower and return. The workpieces advance with the beams, then rest on the fixed beams while the moving beams return underneath.',
    boundary:
      '本页示意为步进梁式。支承形式、步距、温区与出料节拍按工件确认；不能把步进梁输送等同于推杆滑移或辊道输送。',
    boundaryEn:
      'This illustration shows a walking-beam arrangement. Supports, pitch, heating zones and discharge cadence depend on the load; beam transport differs from pushing or roller conveying.',
    steps: ['固定梁承载', '活动梁抬升前移', '下降交接', '活动梁返回'],
    stepsEn: [
      'Rest on fixed beams',
      'Lift and advance',
      'Lower and hand over',
      'Return moving beams',
    ],
    inputs: [
      '工件材质、长度与截面',
      '单件重量与支承间距',
      '产量、步距与停留时间',
      '温区、装出料与驱动布置',
    ],
    inputsEn: [
      'Material, length and section',
      'Weight and support spacing',
      'Throughput, pitch and dwell time',
      'Heating zones, handling and drive layout',
    ],
  },
  {
    id: 'elevator-hearth-furnace',
    categoryId: 14,
    animationKind: 'elevator',
    englishName: 'ELEVATOR HEARTH FURNACE',
    nameEn: 'Elevator Hearth Furnace',
    name: '升降式炉',
    description: '炉底升降 · 周期式处理',
    descriptionEn: 'Batch heat treatment with an elevating loading hearth.',
    image: '/images/home/product-center/additional-20260909/elevator-hearth-furnace.webp',
    imageAlt: '固定上炉体与底部升降炉台的底升式炉结构示意',
    href: '/zh/products/detail/elevator-hearth-furnace',
    group: 'periodic',
    workpiece: '适合炉台承载的工件、料框',
    handling: '炉底升降 · 炉外装卸',
    summary:
      '本页展示炉底升降型结构：工件在下方炉台装卸，炉台升入固定上炉体，完成密封后进行批次加热。',
    summaryEn:
      'The illustrated lift-bottom arrangement loads at the lower hearth, which rises into a fixed upper chamber and seals for batch heating.',
    principle:
      '降下炉台并装料，确认工件与炉口的间隙后将炉台升起；到位密封后加热，按工艺完成冷却或转运准备，再降下炉台出料。',
    principleEn:
      'Lower the hearth to load, verify chamber clearance, then raise and seal it for heating. Complete the specified cooling or transfer preparation before lowering it to unload.',
    boundary:
      '升降式炉可有不同结构，本页采用炉底升降型结构。升降载荷、行程、密封及安全联锁需按项目校核。',
    boundaryEn:
      'Elevating furnaces have multiple configurations. This page describes a lift-bottom arrangement. Load, stroke, sealing and safety interlocks require project assessment.',
    steps: ['炉台降下装料', '升起并密封', '按工艺加热', '准备完成后下降出料'],
    stepsEn: ['Lower and load', 'Raise and seal', 'Process heating', 'Prepare and lower to unload'],
    inputs: [
      '工件与料框尺寸、总重量',
      '升降行程、厂房高度与基础',
      '温度、气氛与冷却要求',
      '装卸方式、密封与防坠要求',
    ],
    inputsEn: [
      'Workpiece and basket dimensions and total weight',
      'Lift travel, building height and foundations',
      'Temperature, atmosphere and cooling',
      'Handling, sealing and fall protection',
    ],
  },
  {
    id: 'gas-nitriding-furnace',
    categoryId: 15,
    animationKind: 'nitriding',
    englishName: 'GAS NITRIDING FURNACE',
    nameEn: 'Gas Nitriding Furnace',
    name: '氮化炉',
    description: '钢件表面氮化 · 周期式处理',
    descriptionEn: 'Batch gas nitriding for suitable steel components.',
    image: '/images/home/product-center/additional-20260909/gas-nitriding-furnace.webp',
    imageAlt: '带锁紧密封盖、循环风机和气路的井式气体氮化炉结构示意',
    href: '/zh/products/detail/gas-nitriding-furnace',
    group: 'periodic',
    workpiece: '适合氮化的轴、齿轮、模具',
    handling: '密封装炉 · 气氛控制',
    summary:
      '本页展示井式气体氮化炉，在密封炉罐内控制温度、气氛和时间，对适合氮化的钢件进行表面处理。',
    summaryEn:
      'This pit-type gas nitriding furnace controls temperature, atmosphere and time in a sealed retort for surface treatment of suitable steels.',
    principle:
      '装料并锁紧炉盖，确认密封、置换与气路条件后按工艺氮化；处理结束后完成规定的降温和气氛置换，再确认可安全开盖出料。',
    principleEn:
      'Load and lock the lid, verify sealing, purging and gas conditions, then run the nitriding cycle. Complete the specified cooling and purge before safe opening and unloading.',
    boundary:
      '氮化不是单纯的氮气保护加热，也不同于渗碳淬火或等离子氮化。氮化层深度、硬度和变形按材料、前道热处理与工艺验收；气源及尾气处理按项目配置。',
    boundaryEn:
      'Gas nitriding differs from nitrogen-protected heating, carburizing and quenching, and plasma nitriding. Case depth, hardness and distortion depend on the material, prior treatment and process. Gas supply and exhaust treatment are project-specific.',
    steps: ['装料并密封', '确认置换与气路', '受控气氛氮化', '降温置换后出料'],
    stepsEn: [
      'Load and seal',
      'Verify purge and gas system',
      'Controlled-atmosphere nitriding',
      'Cool, purge and unload',
    ],
    inputs: [
      '钢种、前道热处理与工件尺寸',
      '装炉量与装料方式',
      '氮化层深度、硬度与变形要求',
      '气源、尾气处理与检测条件',
    ],
    inputsEn: [
      'Steel grade, prior heat treatment and dimensions',
      'Batch load and loading method',
      'Case depth, hardness and distortion requirements',
      'Gas supply, exhaust treatment and testing',
    ],
  },
] as const;

export function getAdditionalFurnace(slug: string) {
  return additionalFurnaces.find((furnace) => furnace.id === slug);
}
