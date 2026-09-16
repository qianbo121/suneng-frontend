type SelectionNotes = {
  fit: string;
  configuration: readonly { title: string; text: string }[];
  site: string;
  acceptance: readonly string[];
};

// Procurement questions, not fixed specifications or evidence of delivered projects.
export const additionalFurnaceSelection: Record<string, { zh: SelectionNotes; en: SelectionNotes }> = {
  'shovel-furnace': {
    zh: {
      fit: '先核对工件底部能否稳定承托、重心是否可控，以及炉内支承能否留出铲齿进入空间。需要快速转移的工艺，还应共同确认出炉、取料和后续设备的衔接条件。',
      configuration: [
        { title: '加热炉与承托', text: '按工件包络、总装载和支承方式确定有效工作区、炉内支承与加热配置，并核对热态间隙。' },
        { title: '取料与转运', text: '核对铲齿长度、间距、载荷、行程及工件重心；需要衔接淬火时，另外确认介质、转移起止事件和允许时间。' },
        { title: '动作与联锁', text: '炉门、取料机与后续设备核对位置确认、动作顺序、人员隔离及异常停机后的安全处置。' },
      ],
      site: '现场需提供炉前轨道或行走区域、基础条件、检修空间、吊装路径和公用工程。加热炉、取料机、淬火设备及现场安装分别列明供货责任，不能只按一台炉体比较总价。',
      acceptance: [
        '设备功能：按约定载荷与工装验证托取、行走、定位、炉门配合及安全联锁。',
        '工艺与工件：按代表工件、装载和测量方案核对加热记录；有淬火工序时，另约定转移与产品检验条件。',
        '交付文件：核对设备清单、布置与接口资料、操作维护文件及约定的调试记录。',
      ],
    },
    en: {
      fit: 'Check stable support under the workpiece, its centre of gravity and clearance for the forks. Time-sensitive processes also require coordinated unloading, pickup and transfer to downstream equipment.',
      configuration: [
        { title: 'Heating and support', text: 'Define the working zone, supports and heating arrangement from the load envelope and total supported weight, including clearances when hot.' },
        { title: 'Pickup and transfer', text: 'Check fork dimensions, spacing, load, travel and centre of gravity. For quenching, specify the medium and the start, end and permitted duration of transfer separately.' },
        { title: 'Sequence and interlocks', text: 'Coordinate door and handling positions, downstream readiness, personnel separation and safe recovery after a stop.' },
      ],
      site: 'Provide the travel area, foundations, maintenance access, lifting route and utilities. List responsibility for the furnace, handler, quench equipment and installation separately before comparing prices.',
      acceptance: [
        'Equipment: verify pickup, travel, positioning, door coordination and safety interlocks with the agreed load and fixtures.',
        'Process and parts: check heating records for representative loads. Where quenching is included, agree transfer and product inspection conditions separately.',
        'Documentation: check the equipment list, layout, interfaces, operating and maintenance information and agreed commissioning records.',
      ],
    },
  },
  'walking-beam-furnace': {
    zh: {
      fit: '适用性先看工件能否在固定梁与活动梁上稳定支承，步距和装出料方式能否衔接生产。薄小散件、支承不稳定或品种变化很大的项目，应先比较其他承托与输送方式。',
      configuration: [
        { title: '梁与步进机构', text: '按工件长度、截面、重量和允许接触痕迹核对支承间距、步距、抬升高度及热态变形。' },
        { title: '加热与停留时间', text: '结合温区、工件受热条件、炉内排布和步进周期核算停留时间；不能把机械最大步频直接当成合格产能。' },
        { title: '装出料与控制', text: '核对装出料节拍、工件定位、步进同步、异常停机处置和过程记录；冷却方式与设备分工按方案列清。' },
      ],
      site: '核对炉前后输送、驱动与检修空间、基础及公用工程。梁的支承和冷却结构按炉温与载荷设计；如选用水冷部件，应另列冷却水条件、监测保护与责任边界。',
      acceptance: [
        '设备功能：在约定工件和载荷下核对步进、定位、装出料及异常停机保护。',
        '工艺与产能：按材料、截面、装载和节拍验证温度与产品要求，明确换型、启停及不合格品是否计入统计。',
        '交付文件：核对温区与布置资料、动作说明、检修要求及约定的试运行记录。',
      ],
    },
    en: {
      fit: 'First confirm stable support on the fixed and moving beams and compatibility with loading and discharge. Small loose parts, unstable loads or frequent major changes may require a different support or transport arrangement.',
      configuration: [
        { title: 'Beams and motion', text: 'Check support spacing, pitch, lift and hot deformation against length, section, weight and permitted contact marks.' },
        { title: 'Heating and residence time', text: 'Evaluate residence time with heating zones, load spacing and the step cycle. Maximum mechanical frequency is not guaranteed conforming output.' },
        { title: 'Handling and controls', text: 'Define loading and discharge cadence, positioning, synchronization, stop recovery and records. Specify cooling equipment and responsibilities separately.' },
      ],
      site: 'Check handling interfaces, drives, maintenance access, foundations and utilities. Beam support and cooling depend on temperature and load; water-cooled components require separately agreed water conditions, monitoring and protection.',
      acceptance: [
        'Equipment: verify stepping, positioning, loading, discharge and stop protection with agreed parts and loads.',
        'Process and output: verify temperature and product requirements with defined material, section, loading and cadence; state how changeovers, stops and rejects affect the reported output.',
        'Documentation: check zone and layout information, operating sequences, maintenance requirements and agreed trial records.',
      ],
    },
  },
  'elevator-hearth-furnace': {
    zh: {
      fit: '本页按炉底升降结构讨论。工件、料框及工装需要在炉台上稳定放置，并满足炉口净空、总载荷和装卸条件；需要快速淬火时，应另行评估专用结构与转移路线。',
      configuration: [
        { title: '炉台与升降', text: '按工件、料框和工装的合计重量核对升降载荷、重心、导向与行程，明确机械支承和防坠措施。' },
        { title: '加热与密封', text: '按材料、工艺和装载核对有效工作区、加热方式、炉口密封及所需气氛，不能从外观推定气密性能。' },
        { title: '位置与防护', text: '核对升降到位、炉口与作业区防护、加热允许条件及断电后的安全状态；维护时的可靠支承需单列。' },
      ],
      site: '确认厂房净高、升降行程、炉台装卸区域、基础或地坑需求，以及设备维护与吊装条件。降台出料的温度状态、冷却或转移方式须在方案中确认。',
      acceptance: [
        '设备功能：按规定载荷验证升降、导向、定位、支承及安全联锁，检查异常状态处置。',
        '工艺性能：按代表装载核对加热曲线与约定的温度测量；需要气氛时，另列气氛系统及密封验证条件。',
        '交付文件：核对载荷与使用限制、维护支承说明、接口资料和约定的验收记录。',
      ],
    },
    en: {
      fit: 'This page covers a lift-bottom arrangement. Parts, baskets and fixtures must be stable on the hearth and fit its clearance, total load and handling limits. Rapid quenching requires a separate assessment of structure and transfer route.',
      configuration: [
        { title: 'Hearth and lift', text: 'Include parts, baskets and fixtures in the supported weight. Check centre of gravity, guides, stroke, mechanical support and fall protection.' },
        { title: 'Heating and sealing', text: 'Define the working zone, heating, opening seal and any atmosphere from material, process and loading. Appearance does not establish gas-tightness.' },
        { title: 'Position and protection', text: 'Specify position confirmation, guarding, heating permissives and the safe state after power loss, including reliable support during maintenance.' },
      ],
      site: 'Confirm clear building height, lift travel, loading area, foundation or pit requirements, maintenance access and lifting arrangements. Specify the unloading temperature condition and any cooling or transfer method.',
      acceptance: [
        'Equipment: verify lift motion, guides, positioning, support and interlocks at the specified load, including abnormal-state handling.',
        'Process: verify heating records and agreed temperature measurements for representative loading. Atmosphere and sealing tests require separate agreed conditions where applicable.',
        'Documentation: check load and operating limits, maintenance support instructions, interfaces and agreed acceptance records.',
      ],
    },
  },
  'gas-nitriding-furnace': {
    zh: {
      fit: '先确认钢种、前序热处理、表面状态、需处理部位及氮化层要求。气体氮化、离子氮化和其他表面处理路线不能仅凭炉型名称互相替代；特殊材料或表面状态需先验证工艺适用性。',
      configuration: [
        { title: '装载与温控', text: '根据工件、工装和气流通道确定装载及有效工作区，核对温度控制、循环与记录要求。' },
        { title: '供气与气氛', text: '核对气源、流量、置换和气氛监测方式；需要氮势等过程控制时，应在技术方案中明确测量与控制配置。' },
        { title: '气路与安全', text: '按所用气体核对炉罐、密封、尾气处理、排风及检测报警，明确供气异常、泄漏和停电时的安全处置。' },
      ],
      site: '气源储供、气路、通风、尾气处理和检测保护需结合现场专业设计确认。炉盖开启与工件吊装要有足够净空，公用工程、环保及消防等适用要求与双方分工逐项列明。',
      acceptance: [
        '设备功能：核对温控、循环、供气与置换、记录和安全联锁，按约定方案完成气路及密封检查。',
        '工件质量：按代表材料、前序状态和取样位置核对表面硬度、氮化层深度及约定的组织要求；测量方法和判定条件须事先写清。有尺寸或变形要求时，另约定测量基准、位置和允许变化。',
        '交付文件：核对工艺记录、操作维护与气体安全资料，以及双方约定的验证责任；不把设备配置说明当成所有材料的处理保证。',
      ],
    },
    en: {
      fit: 'Confirm steel grade, prior heat treatment, surface condition, treatment areas and case requirements. Gas nitriding, plasma nitriding and other surface treatments are not interchangeable based on a furnace name; special materials or surface conditions require process validation.',
      configuration: [
        { title: 'Loading and temperature', text: 'Define loading and the working zone from parts, fixtures and gas-flow paths; agree temperature control, circulation and recording requirements.' },
        { title: 'Gas and atmosphere', text: 'Specify gas supply, flow, purging and atmosphere monitoring. Where nitriding-potential control is required, identify the measurement and control configuration in the proposal.' },
        { title: 'Gas-system protection', text: 'Assess the retort, seals, exhaust treatment, ventilation and detection for the selected gases, including loss of gas supply, leakage and power loss.' },
      ],
      site: 'Gas storage and supply, pipework, ventilation, exhaust treatment and detection require site-specific specialist assessment. Provide lid and lifting clearance and agree utilities, applicable environmental and fire requirements and responsibilities.',
      acceptance: [
        'Equipment: verify temperature, circulation, gas supply, purging, recording and interlocks, with agreed gas-system and sealing checks.',
        'Parts: agree representative material, prior condition and sampling positions for surface hardness, nitriding depth and required microstructure, including measurement methods and acceptance criteria. Where dimensions or distortion are specified, also agree measurement datums, positions and allowable changes.',
        'Documentation: agree process records, operating, maintenance and gas-safety information and validation responsibilities. A configuration description is not a treatment guarantee for every material.',
      ],
    },
  },
};
