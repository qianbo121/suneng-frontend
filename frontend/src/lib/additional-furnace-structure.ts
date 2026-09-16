import type { FurnaceCutawayLabelPosition } from '@/components/products/FurnaceCutawayDiagram';

type Copy = { zh: string; en: string };
const c = (zh: string, en: string): Copy => ({ zh, en });

type StructurePart = {
  target: string;
  title: Copy;
  description: Copy;
  position: FurnaceCutawayLabelPosition;
  x: number;
  y: number;
};

type FurnaceStructure = {
  sceneImage?: string;
  image?: string;
  caption?: Copy;
  alt: Copy;
  parts: StructurePart[];
  parameters: [Copy, Copy][];
};

const part = (
  target: string,
  title: Copy,
  description: Copy,
  position: FurnaceCutawayLabelPosition,
  x: number,
  y: number,
): StructurePart => ({ target, title, description, position, x, y });

// Coordinates use the shared diagram's 100 × 75 view box. Each point is checked
// against the selected cutaway image, rather than inferred from a product name.
export const additionalFurnaceStructures: Record<string, FurnaceStructure> = {
  'shovel-furnace': {
    sceneImage: '/images/products/shovel-furnace/detail-pit-style-20260910/01-scene.webp',
    image: '/images/products/shovel-furnace/detail-pit-style-v2-20260910/02-cutaway.webp',
    alt: c(
      '叉车炉剖视示意：炉衬层、加热元件、固定支承与独立轨道取料机',
      'Fork-handling furnace cutaway showing lining, heating elements, fixed supports and a separate rail handler',
    ),
    parts: [
      part('lining', c('炉体与炉衬', 'Shell and lining'), c('剖切位置展示外壳、隔热层与热面，材料和厚度按工艺确定。', 'The section shows shell, insulation and hot face; materials and thickness follow the process.'), 'rightTop', 80, 36),
      part('heating', c('电热元件与支架', 'Elements and holders'), c('图示为电加热布置，元件与陶瓷支承按温度、装载和检修条件设计。', 'The illustration shows electric heating; elements and ceramic holders depend on temperature, loading and maintenance.'), 'rightMiddle', 69, 34),
      part('door', c('升降炉门', 'Lifting door'), c('炉门净开口、提升行程与隔热密封需和取料动作配合。', 'Coordinate the clear opening, door travel, insulation and sealing with the handling motion.'), 'leftTop', 49, 14),
      part('supports', c('炉内固定支承', 'Fixed hearth supports'), c('支承承担热态工件载荷，并在支点之间留出铲齿进入空间。', 'Supports carry the hot load while preserving fork access between support points.'), 'rightBottom', 57, 46),
      part('forks', c('铲齿与承托', 'Forks and load support'), c('结合底部净空、重心、铲齿间距和热态变形核对托取条件。', 'Check pickup against underside clearance, centre of gravity, fork spacing and hot deformation.'), 'leftMiddle', 37, 42),
      part('handler', c('轨道取料机', 'Rail-mounted handler'), c('独立取料机负责起升与行走，轨道定位和炉门联锁按项目确认。', 'The separate handler provides lift and travel; rail alignment and door interlocks are project-specific.'), 'leftBottom', 21, 59),
    ],
    parameters: [
      [c('工件与料具包络', 'Load and fixture envelope'), c('提供尺寸、重量、重心和热态支点。', 'Provide dimensions, weight, centre of gravity and hot support points.')],
      [c('铲齿进入条件', 'Fork access'), c('确认底部净空、支承间距及托取接触位置。', 'Confirm underside clearance, support spacing and pickup contact points.')],
      [c('炉门与取料行程', 'Door and handler travel'), c('核对净开口、提升高度与轨道行程。', 'Check clear opening, lift height and rail travel.')],
      [c('加热条件', 'Heating conditions'), c('材料、温度与工艺曲线共同确定加热和炉衬方案。', 'Material, temperature and cycle define heating and lining requirements.')],
      [c('出炉后工位', 'Downstream station'), c('写清转移起止事件，冷却或淬火配套另列范围。', 'Define transfer start/end events and list cooling or quench equipment separately.')],
    ],
  },
  'walking-beam-furnace': {
    sceneImage: '/images/products/walking-beam-furnace/detail-pit-style-v2-20260910/01-scene.webp',
    image: '/images/products/walking-beam-furnace/detail-pit-style-20260910/02-cutaway.webp',
    caption: c('内部结构剖视示意 · 浅灰活动梁通过穿槽支柱连接下方移动架，与深灰固定支承分开；图示电加热配置。', 'Internal cutaway · Light moving beams connect through hearth slots to the carriage below, separately from the dark fixed supports. Electric heating illustrated.'),
    alt: c(
      '步进炉纵向剖视示意：固定梁与活动梁分开支承，活动支柱穿过炉底长槽连接下方滚轮移动架',
      'Walking-beam furnace cutaway showing separate fixed and moving supports, with moving posts passing through hearth slots to the roller carriage below',
    ),
    parts: [
      part('lining', c('炉体与隔热层', 'Shell and insulation'), c('炉墙、炉顶和炉底共同围成加热空间，剖面展示隔热层次。', 'Walls, roof and hearth enclose the heated space; the section reveals the insulation layers.'), 'leftTop', 46, 19),
      part('heating', c('电热元件示例', 'Electric heating example'), c('本图采用电加热示例，热源与温区布置按实际工艺确定。', 'Electric heating is illustrated; the heat source and zone arrangement follow the actual process.'), 'leftMiddle', 35, 31),
      part('fixed-beams', c('固定梁', 'Fixed beams'), c('图中深灰支承为固定梁，在活动梁下降后承接工件，支承间距按工件形态校核。', 'The dark supports are fixed beams that receive the load as the moving beams lower; spacing follows workpiece geometry.'), 'leftBottom', 35, 41),
      part('moving-beams', c('活动梁', 'Moving beams'), c('图中浅灰支承为活动梁，由下方机构带动，依次抬起、前移、下降和返回，与固定梁交替承托。', 'The light supports are moving beams driven from below to lift, advance, lower and return, alternating support with the fixed beams.'), 'rightMiddle', 61, 43),
      part('workpiece', c('工件与支承位置', 'Load and support points'), c('工件需跨梁稳定放置，接触位置和允许支承痕迹应先确认。', 'Loads must rest stably across the beams; agree contact points and permissible support marks.'), 'rightTop', 66, 40),
      part('drive', c('升降与平移机构', 'Lift and traverse mechanism'), c('活动梁经穿槽支柱连接移动架，升降机构与滚轮导轨配合完成抬落和前后移动；固定炉底与活动架之间留有运动间隙。', 'Moving beams connect through hearth slots to the carriage. Lift mechanisms and roller guides provide vertical and longitudinal movement, with clearance from the fixed hearth.'), 'rightBottom', 65, 62),
    ],
    parameters: [
      [c('工件规格与支点', 'Workpiece and supports'), c('提供长度、截面、单件重量和允许的接触位置。', 'Provide length, section, piece weight and permitted contact points.')],
      [c('固定梁与活动梁间距', 'Fixed and moving beam spacing'), c('按稳定承托、热态变形及防卡滞条件校核。', 'Check stable support, hot deformation and clearance against jamming.')],
      [c('步距、周期与停留时间', 'Pitch, cycle and residence time'), c('将步进动作与工艺曲线、生产节奏共同计算。', 'Coordinate indexed movement with the heating cycle and production rhythm.')],
      [c('加热与温区', 'Heating and zones'), c('确认热源、升温保温条件及工件温度要求。', 'Confirm heat source, heating/holding conditions and workpiece temperature requirements.')],
      [c('装出料与检修空间', 'Handling and maintenance access'), c('核对进出料接口、驱动空间、基础与检修路线。', 'Check handling interfaces, drive space, foundations and maintenance routes.')],
    ],
  },
  'elevator-hearth-furnace': {
    sceneImage: '/images/products/elevator-hearth-furnace/detail-pit-style-20260910/01-scene.webp',
    image: '/images/products/elevator-hearth-furnace/detail-pit-style-20260910/02-cutaway.webp',
    caption: c('内部结构剖视示意 · 前侧剖开以展示底部开口，承料炉台由下方升入并闭合；图示电加热配置。', 'Internal cutaway · The front is sectioned to expose the bottom opening; the hearth rises from below to close it. Electric heating illustrated.'),
    alt: c(
      '炉底升降式炉剖视示意：固定上炉体、内部炉衬与电热元件、下降炉台和升降导向',
      'Bottom-loading furnace cutaway showing the fixed upper chamber, internal lining and electric elements, lowered hearth and lift guides',
    ),
    parts: [
      part('chamber', c('固定上炉体', 'Fixed upper chamber'), c('上炉体由立柱固定支承，装料由下方炉台升入加热空间。', 'Columns support the fixed upper chamber; the lower hearth raises the load into the heated space.'), 'leftTop', 30, 22),
      part('lining', c('炉衬与隔热层', 'Lining and insulation'), c('剖面展示热面与背衬，热循环和结构间隙按工艺校核。', 'The section shows hot face and backing; check thermal cycling and structural clearances for the process.'), 'rightTop', 71, 21),
      part('heating', c('炉内电热元件', 'Internal electric elements'), c('元件布置围绕有效加热空间，需避开装料和升降运动范围。', 'Elements surround the working zone and stay clear of the load and hearth movement.'), 'leftMiddle', 46, 23),
      part('hearth', c('升降炉台', 'Lifting hearth'), c('上炉体底部开口，炉台承载工件从下方升入并封闭炉口；图中前侧剖开以展示进入通道。', 'The upper chamber is open below; the loaded hearth rises into it and closes the opening. The front is sectioned to expose the entry path.'), 'rightBottom', 62, 53),
      part('lift', c('升降导向与驱动', 'Lift guides and drive'), c('按总载荷、重心和偏载校核升降行程、导向及到位检测。', 'Check lift travel, guides and position sensing against total load, centre of gravity and uneven loading.'), 'leftBottom', 27, 43),
      part('fixture', c('料框与工装', 'Basket and fixtures'), c('料具计入装料包络和总载荷，工件在热态和升降过程中都需稳定放置。', 'Include fixtures in the envelope and total load; parts must remain stable when hot and during lifting.'), 'rightMiddle', 52, 47),
    ],
    parameters: [
      [c('装料包络与炉口', 'Load envelope and opening'), c('工件、料框、工装与必要间隙一并核对。', 'Check parts, baskets, fixtures and required clearances together.')],
      [c('升降总载荷与重心', 'Total lift load and centre of gravity'), c('包括工件、料具及升降承载部件，明确偏载条件。', 'Include parts, fixtures and moving support components, with uneven loading defined.')],
      [c('行程与厂房净高', 'Travel and building clearance'), c('装卸、升降、吊装和检修空间分别预留。', 'Allow separately for loading, lift travel, lifting access and maintenance.')],
      [c('加热与炉口密封', 'Heating and opening seal'), c('确认温度、工艺曲线、气氛及炉台闭合条件。', 'Confirm temperature, cycle, atmosphere and hearth closure conditions.')],
      [c('支承、防坠与联锁', 'Support, fall protection and interlocks'), c('运行防护、断电状态和维修支承需分别写入方案。', 'Specify operational guarding, the power-loss state and maintenance support separately.')],
    ],
  },
  'gas-nitriding-furnace': {
    sceneImage: '/images/products/gas-nitriding-furnace/detail-pit-style-20260910/01-scene.webp',
    image: '/images/products/gas-nitriding-furnace/detail-pit-style-20260910/02-cutaway.webp',
    caption: c('内部结构剖视示意 · 导流筒下端留出回流空间，外层炉罐底部保持封闭；电热元件位于罐外。', 'Internal cutaway · Clearance below the guide cylinder provides a return path; the outer retort bottom stays closed and the heaters are outside.'),
    alt: c(
      '气体氮化炉剖视示意：密封炉罐、罐外电热元件、罐内风机、透孔料框底托及导流筒下方回流空间',
      'Gas nitriding furnace cutaway showing a sealed retort, external heaters, internal fan, perforated basket support and a return passage below the guide cylinder',
    ),
    parts: [
      part('lining', c('外壳与炉衬', 'Shell and lining'), c('外壳与隔热层形成加热炉体，和内部密封炉罐分别确认材料与检验范围。', 'The shell and insulation form the heating enclosure; specify these separately from the sealed inner retort.'), 'leftMiddle', 36, 36),
      part('heating', c('炉罐外电热元件', 'Heaters outside retort'), c('图示电热元件位于炉罐外侧，通过炉罐向工艺空间传热。', 'The illustrated electric elements heat the process space through the retort from outside.'), 'leftBottom', 37.5, 45),
      part('retort', c('密封炉罐', 'Sealed retort'), c('金属炉罐上口与炉盖相接，侧壁和封闭底部将工艺气氛与罐外加热空间分隔。', 'The metal retort joins the lid at its upper rim; its wall and closed bottom separate the process atmosphere from the external heating space.'), 'rightMiddle', 56, 40),
      part('lid', c('炉盖与密封', 'Lid and seal'), c('炉罐上口与炉盖锁紧密封；风机轴穿过炉盖的位置也需密封，具体结构与检测按工况确认。', 'The lid clamps and seals to the retort rim; the fan shaft penetration also requires a seal, with design and inspection defined for the duty.'), 'leftTop', 39.5, 21),
      part('basket', c('料框与底部回流', 'Basket and lower return path'), c('料框采用透孔底托，导流筒下沿与炉罐底部留出连通空间，使筒内与外侧环隙接通；装载时需保持通道畅通。', 'The basket has a perforated support. Clearance beneath the guide cylinder connects its inner space to the outer annular gap; loading must keep this passage open.'), 'rightBottom', 54, 54),
      part('circulation', c('罐内循环风机', 'Internal circulation fan'), c('上方电机通过炉盖带动罐内叶轮，叶轮与装料空间连通，配合导流筒组织气体循环。', 'The motor above the lid drives an impeller inside the retort, connected to the load space and working with the guide cylinder to circulate gas.'), 'rightTop', 48, 24.5),
    ],
    parameters: [
      [c('材料与前序状态', 'Material and prior condition'), c('提供钢种、前序热处理、表面状态和需要处理的部位。', 'Provide grade, prior heat treatment, surface condition and treatment areas.')],
      [c('炉罐与有效装载', 'Retort and usable load'), c('核对料框、工件间距、气流通道和装卸净空。', 'Check baskets, part spacing, gas-flow paths and loading clearance.')],
      [c('气氛、温度与记录', 'Atmosphere, temperature and records'), c('供气、监测、控温和批次记录按工艺配套确认。', 'Specify gas supply, monitoring, temperature control and batch records for the process.')],
      [c('层深、硬度与尺寸', 'Case depth, hardness and dimensions'), c('约定测量定义、检测位置、方法与代表工件。', 'Agree measurement definitions, locations, methods and representative parts.')],
      [c('气路与现场配合', 'Gas system and site interfaces'), c('明确储供气、通风、尾气处理、检测保护和责任范围。', 'Define gas supply, ventilation, exhaust treatment, detection and responsibilities.')],
    ],
  },
};
