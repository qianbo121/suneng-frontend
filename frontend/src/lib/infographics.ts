import type { NewsListCardItem } from '@/types/news';
import { forkFurnaceInfographics } from './fork-furnace-infographics';
import type { Locale } from '@/types/site';
import { newsUiText } from './news-ui';
import { bucketTeethInfographicEn } from './bucket-teeth-infographic.en';
import imageVariants from './infographic-image-variants.json';
import {
  NEWS_DECISION_TOPICS,
  type NewsDecisionTopicId,
  type NewsFurnaceFilterId,
} from '@/lib/news-decision-center';

export type InfographicResource = {
  id: number;
  slug: string;
  title: string;
  summary: string;
  topic: NewsDecisionTopicId;
  equipmentLabel: string;
  furnaces: NewsFurnaceFilterId[];
  image: string;
  imageAlt: string;
  imageSize?: { width: number; height: number };
  additionalPages?: { image: string; imageAlt: string; width: number; height: number }[];
  caption: string;
  paragraphs: string[];
  sourceNote: string;
  sourceUrl?: string;
  tags?: string[];
  rows: { label: string; value: string; condition: string }[];
  flows: { title: string; text: string }[];
  conditions: string[];
};

// Supplied ten-poster package. Keep explicit IDs and the first resource URL;
// transcribe the supplied content without inventing dates or English editions.
export const infographicResources: InfographicResource[] = [
  ...forkFurnaceInfographics,
  {
    slug: 'mesh-belt-500-screws',
    topic: 'quality',
    equipmentLabel: '网带炉',
    furnaces: ['mesh-belt'],
    summary:
      '同一台500毫米网带炉，协议淬火300公斤/小时、渗碳150公斤/小时。渗层深度未注明，其他工件需重新核算。',
    rows: [
      {
        label: '有效带宽',
        value: '500 毫米',
        condition: '同一台设备的配置',
      },
      {
        label: '加热段长度',
        value: '4700 毫米',
        condition: '同一台设备的配置',
      },
      {
        label: '协议淬火处理量',
        value: '300 公斤／小时',
        condition: '本项目协议值',
      },
      {
        label: '协议渗碳处理量',
        value: '150 公斤／小时',
        condition: '未注明对应渗层深度',
      },
    ],
    flows: [
      {
        title: '图示淬火流程',
        text: '上料（螺丝钉）— 加热（网带炉）— 淬火（按项目工艺）— 下料（后续按需求）。',
      },
      {
        title: '图示渗碳流程',
        text: '上料（螺丝钉）— 渗碳加热（按工艺要求）— 淬火（后续处理）— 下料（后续按需求）。',
      },
    ],
    conditions: [
      '协议值不代表其他工件或工艺的通用产能。',
      '渗碳渗层深度未注明，无法据此评估工艺强度或换算产能。',
      '询价时将淬火、渗碳分两行，分别提供工件图纸、年需求量、工艺要求和渗层深度。',
    ],
    id: -1000,
    title: '螺丝钉用同一台网带炉，做淬火和做渗碳，每小时的产量差多少？',
    image: '/images/infographics/mesh-belt-500-screws-20261118.png',
    imageAlt: '螺丝钉用同一台网带炉，做淬火和做渗碳，每小时的产量差多少？：设备示意与图文要点',
    caption: '设备画面为AI生成示意，非项目实拍；参数及适用范围以本篇图文说明为准。',
    paragraphs: [
      '同一台网带炉，处理螺丝钉时，淬火和渗碳的小时产量并不一定相同。江苏苏能工业炉有限公司的一份紧固件网带炉协议分别约定：淬火300公斤/小时、渗碳150公斤/小时，相差150公斤/小时。',
      '这台设备的有效网带宽度为500毫米，加热段长4700毫米。设备尺寸没变，但工艺变了，渗碳工件需要在炉内停留更久，处理量就可能下降。',
      '需要特别注意：协议没有注明150公斤/小时对应的渗层深度。换了螺丝钉规格、渗层要求或装料方式，不能把该数值直接套用。',
      '如果同时采购淬火和渗碳能力，建议在询价单里分两行写清工件、年需求量、工艺和渗层深度，请厂家分别回复处理量和计算条件，方便后续排产。',
    ],
    sourceNote: '本文根据江苏苏能工业炉技术资料整理',
  },
  {
    slug: 'mesh-belt-cooling-water-supply',
    topic: 'procurement',
    equipmentLabel: '网带炉',
    furnaces: ['mesh-belt', 'line'],
    summary:
      '冷却塔和循环水泵可由厂家配套，也可在核实条件后沿用现有系统。比价应同时核对供货范围、接管边界和安装费用。',
    rows: [
      {
        label: '用水位置',
        value: '油槽、循环风机、托辊轴承座',
        condition: '按设备实际冷却配置核对',
      },
      {
        label: '方案A：厂家供货',
        value: '闭式冷却塔、循环水泵、304不锈钢储水箱',
        condition: '水泵1用1备',
      },
      {
        label: '方案A：买方承担',
        value: '补水管、阀门及约定外部管道安装',
        condition: '从预埋接口到设备的接管范围需明确',
      },
      {
        label: '方案B：沿用设备',
        value: '原有冷却水池与循环水泵',
        condition: '水泵1用1备；需核对现有系统适用条件',
      },
    ],
    flows: [],
    conditions: [
      '冷却塔、运行泵、备用泵和储水箱是否包含在总价里，应逐项写明。',
      '在管道图中标明厂家接到哪里、买方还需施工哪一段。',
      '将买方另付的配管、阀门及安装费用计入完整投入。',
    ],
    id: -999,
    title: '买网带炉油淬回火线，冷却塔和水泵厂家给配吗，还是得我们自己买？',
    image: '/images/infographics/mesh-belt-cooling-water-supply.png',
    imageAlt: '买网带炉油淬回火线，冷却塔和水泵厂家给配吗，还是得我们自己买？：设备示意与图文要点',
    caption: '设备画面为AI生成示意，非项目实拍；参数及适用范围以本篇图文说明为准。',
    paragraphs: [
      '购买网带炉油淬回火线，冷却塔和循环水泵可以由炉厂配套，也可以在核实条件后沿用厂区原有系统，关键是把供货清单和工程接口写明白。',
      '为什么用了淬火油还要冷却水？因为淬火油槽要散热，循环风机和托辊轴承座等位置也可能需要冷却，不能只准备淬火介质。',
      '江苏苏能工业炉有限公司的一份协议将室外闭式冷却塔、循环水泵和304不锈钢储水箱列入厂家供货，水泵一用一备；厂房侧补水管、阀门和部分外部接管则由买方承担。另一份协议采用现有冷却水池与循环水泵，同样设置一用一备。',
      '比价时不要只比较设备总价。应让厂家列明哪些塔、泵和储水箱已包含、接到哪个接口，以及剩余管路和安装由谁负责，再核算完整投入。',
    ],
    sourceNote: '本文根据江苏苏能工业炉技术资料整理',
  },
  {
    slug: 'mesh-belt-500-salt-isothermal-capacity',
    topic: 'quality',
    equipmentLabel: '网带炉',
    furnaces: ['mesh-belt', 'line'],
    summary:
      '500毫米主炉网带的硝盐等温淬火线，本项目整线约定处理量约300公斤/小时；盐液中3～15分钟不是整线总处理时间。',
    rows: [
      {
        label: '主炉网带宽',
        value: '500 毫米',
        condition: '本项目设备配置',
      },
      {
        label: '整线约定处理量',
        value: '约 300 公斤／小时',
        condition: '对应本项目中小型金属零部件',
      },
      {
        label: '盐液中运行时间',
        value: '3～15 分钟',
        condition: '工件随网带在盐液中运行的时间',
      },
      {
        label: '副槽用途',
        value: '置换盐液',
        condition: '硝盐槽旁配置',
      },
    ],
    flows: [
      {
        title: '图示工序',
        text: '保护气氛加热 — 进入硝盐槽 — 提升出槽 — 清洗。',
      },
    ],
    conditions: [
      '主炉带宽相同，不等于可以直接套用小时处理量。',
      '核对工件材料与规格、铺料方式、主炉停留时间和盐槽停留时间。',
      '明确处理量统计截止到哪一道工序，再比较报价。',
    ],
    id: -998,
    title: '500 毫米宽的网带炉做硝盐等温淬火，一小时能做多少公斤？',
    image: '/images/infographics/mesh-belt-500-salt-isothermal-capacity.png',
    imageAlt: '500 毫米宽的网带炉做硝盐等温淬火，一小时能做多少公斤？：设备示意与图文要点',
    caption: '设备画面为AI生成示意，非项目实拍；参数及适用范围以本篇图文说明为准。',
    paragraphs: [
      '主炉网带宽500毫米的硝盐等温淬火线，一小时能处理多少公斤？江苏苏能工业炉有限公司的一份项目协议中，主炉网带宽500毫米，中小型金属零部件的整线约定处理量约300公斤/小时。这是该项目的协议数值，不是所有500毫米网带炉的通用产能。',
      '工件先在保护气氛下加热，再进入硝盐槽，随后经提升输送进入清洗工序。协议中的3～15分钟，指工件随网带在盐液中运行的时间，不是整条线的总处理时间。硝盐槽旁还有用于置换盐液的副槽。',
      '换工件或比较两家报价时，要一起核对材料与规格、铺料方式、主炉停留时间、盐槽停留时间，以及产量统计截止到哪一道工序。只看主炉带宽相同，不能直接承诺同样的小时出料量。',
    ],
    sourceNote: '本文根据江苏苏能工业炉技术资料整理',
  },
  {
    slug: 'mesh-belt-quench-temper-capacity-boundary',
    topic: 'engineering',
    equipmentLabel: '网带炉',
    furnaces: ['mesh-belt', 'line'],
    summary:
      '同一批工件先淬火、再回火，两段处理量不能相加。本项目终验收约150公斤/小时，需按最终工序和约定条件核算。',
    rows: [
      {
        label: '淬火炉产量',
        value: '按协议列示',
        condition: '前段设备能力',
      },
      {
        label: '回火炉产量',
        value: '按协议列示',
        condition: '后段设备能力',
      },
      {
        label: '终验收产量',
        value: '约 150 公斤／小时',
        condition: '受工件形状尺寸、单重、堆料和工艺要求影响',
      },
      {
        label: '订单计重位置',
        value: '完成回火后的约定位置',
        condition: '按买家要求的最后一道工序核算',
      },
    ],
    flows: [
      {
        title: '图示计重路径',
        text: '上料（订单工件）— 淬火（前段处理）— 回火（后段处理）— 计重位置（完成回火后）。',
      },
    ],
    conditions: [
      '淬火与回火处理的是同一批工件，重量相加会重复计算。',
      '保留两台炉的原始参数，另列整线验收条件。',
      '与厂家约定代表工件、装料方式、计重位置及合格品要求。',
    ],
    id: -997,
    title: '网带调质线的淬火炉和回火炉各报了一个产量，整线产量能把这两个数加起来吗？',
    image: '/images/infographics/mesh-belt-quench-temper-capacity-boundary.png',
    imageAlt:
      '网带调质线的淬火炉和回火炉各报了一个产量，整线产量能把这两个数加起来吗？：设备示意与图文要点',
    caption: '设备画面为AI生成示意，非项目实拍；参数及适用范围以本篇图文说明为准。',
    paragraphs: [
      '网带调质线的淬火炉和回火炉各报一个处理量，整线产量能相加吗？不能。同一批工件先淬火、再回火，把两段重量相加，相当于把同一批工件算了两次。',
      '江苏苏能工业炉有限公司的一份托辊网带调质线协议分别列出了淬火炉、回火炉和最终验收的产量口径。其中终验收条款写有“约150公斤/小时”，并注明实际产量会受工件形状尺寸、单件重量、堆料方式和工艺要求影响。',
      '采购方真正要确认的是：完成所要求的全部工序后，每小时能交付多少合格工件。建议在比价表里分别保留两台炉的原始参数、整线验收条件，并约定代表工件、装料方式以及回火完成后的计重位置。',
      '分段设备能力可以分别核算，但不能当作订单的完成量相加。',
    ],
    sourceNote: '本文根据江苏苏能工业炉技术资料整理',
  },
  {
    slug: 'mesh-belt-oil-quench-temper-300-capacity',
    topic: 'engineering',
    equipmentLabel: '网带炉',
    furnaces: ['mesh-belt', 'line'],
    summary:
      '本项目约300公斤/小时对应完整油淬回火线，包含回火后冷却；设备连续运行24小时不等于24小时始终满载出合格品。',
    rows: [
      {
        label: '整线约定处理量',
        value: '约 300 公斤／小时',
        condition: '对应本项目中小金属零部件走完整线',
      },
      {
        label: '主炉网带宽',
        value: '500 毫米',
        condition: '描述前段淬火炉',
      },
      {
        label: '加热段长度',
        value: '4700 毫米',
        condition: '描述前段淬火炉',
      },
      {
        label: '现场验收要求',
        value: '设备无故障连续运转24小时',
        condition: '不等于24小时始终满载产出合格品',
      },
    ],
    flows: [
      {
        title: '图示整线工序',
        text: '上料 — 保护气氛淬火炉加热 — 油槽淬火 — 脱油 — 清洗 — 回火 — 回火后冷却。',
      },
    ],
    conditions: [
      '核对产量写在哪一栏，是否覆盖设备清单中的最后一道工序。',
      '不能用前炉尺寸代替整线处理范围。',
      '验收时同时核对实际带料时长、计重位置和合格品判定条件。',
    ],
    id: -996,
    title: '网带油淬回火线报每小时约 300 公斤，是指淬火炉还是整条线？',
    image: '/images/infographics/mesh-belt-oil-quench-temper-300-capacity.png',
    imageAlt: '网带油淬回火线报每小时约 300 公斤，是指淬火炉还是整条线？：设备示意与图文要点',
    caption: '设备画面为AI生成示意，非项目实拍；参数及适用范围以本篇图文说明为准。',
    paragraphs: [
      '网带油淬回火线标注约300公斤/小时，到底是淬火炉还是整线？江苏苏能工业炉有限公司的一份保护气氛油淬回火线协议中，这一数值对应中小金属零部件走完整条生产线的约定处理量，包含后段回火和回火后冷却。',
      '该项目从上料开始，经保护气氛淬火炉加热、油槽淬火、脱油、清洗、回火，再到回火后冷却。主炉网带宽500毫米、加热段长4700毫米，只描述前段淬火炉，不能代替全部整线范围。',
      '协议还提出设备无故障连续运转24小时的现场验收要求。注意：连续运行24小时，不等于24小时始终满载产出合格品。',
      '看报价时，要同时核对产量数字所在栏目、设备清单的最后一道工序、实际带料时间、计重位置和合格品判定条件，才能正确比较整线交付能力。',
    ],
    sourceNote: '本文根据江苏苏能工业炉技术资料整理',
  },
  {
    slug: 'mesh-belt-u-bolt-rated-capacity',
    topic: 'selection',
    equipmentLabel: '网带炉',
    furnaces: ['mesh-belt', 'line'],
    summary:
      '规格表最大约1500公斤/小时是设备上限。U型螺栓的持续处理量需结合图纸、材质、摆放方式和热处理要求重新核算。',
    rows: [
      {
        label: '淬火调质规格上限',
        value: '最大约 1500 公斤／小时',
        condition: '不能直接作为某款U型螺栓的持续处理量',
      },
      {
        label: '主炉网带宽',
        value: '1000 毫米',
        condition: '设备规格参数',
      },
      {
        label: '加热区长度',
        value: '12000 毫米',
        condition: '设备规格参数',
      },
      {
        label: '主炉燃气加热功率',
        value: '约 400 千瓦',
        condition: '不能单独证明特定工件产能',
      },
      {
        label: '电加热功率',
        value: '约 310 千瓦',
        condition: '不能单独证明特定工件产能',
      },
    ],
    flows: [],
    conditions: [
      '提供U型螺栓图纸、尺寸、单重、材质与热处理要求。',
      '明确网带上的摆放方向、间距和每排数量。',
      '合同中分别写设备规格上限与代表工件核算处理量，并约定考核条件。',
    ],
    id: -995,
    title: '网带炉规格表上写的最大产量，换成我这款 U 型螺栓做调质，也能做到吗？',
    image: '/images/infographics/mesh-belt-u-bolt-rated-capacity.png',
    imageAlt:
      '网带炉规格表上写的最大产量，换成我这款 U 型螺栓做调质，也能做到吗？：设备示意与图文要点',
    caption: '设备画面为AI生成示意，非项目实拍；参数及适用范围以本篇图文说明为准。',
    paragraphs: [
      '网带炉规格表写“最大约1500公斤/小时”，换成自己的U型螺栓做调质，也能达到吗？不能直接保证。这个数字是设备规格上限，实际处理量还取决于工件尺寸、材料、热处理要求和在网带上的摆放间距。',
      '江苏苏能工业炉有限公司的一份标准件网带调质线协议列出：主炉网带宽1000毫米、加热区长12000毫米；主炉燃气加热功率约400千瓦、电加热功率约310千瓦。这些参数能帮助比较炉子规格，但不能单独证明某款U型螺栓的持续处理量。',
      '建议拿一款常做的螺栓和一款最难排布的螺栓，分别提供图纸、单重、材质、装料方式及热处理要求，让厂家重新核算小时处理量。',
      '报价和合同最好分开写“设备规格上限”与“按代表工件核算的处理量”，并附上对应的考核条件。',
    ],
    sourceNote: '本文根据江苏苏能工业炉技术资料整理',
  },
  {
    slug: 'crankshaft-annual-count-hourly-capacity',
    topic: 'selection',
    equipmentLabel: '网带炉',
    furnaces: ['mesh-belt', 'line'],
    summary:
      '年产件数需要结合各型号单重和订单可用的年有效生产时间，才能换算所需平均小时处理量；不能直接当作设备能力。',
    rows: [
      {
        label: '淬火调质规格上限',
        value: '最大约 100 万件／年',
        condition: '不能直接换算成订单的公斤／小时',
      },
      {
        label: '主炉网带宽',
        value: '1200 毫米',
        condition: '设备规格参数',
      },
      {
        label: '加热区长度',
        value: '13800 毫米',
        condition: '设备规格参数',
      },
      {
        label: '年有效生产时间',
        value: '分配给这些订单的生产小时数',
        condition: '扣除计划停机和已排给其他订单的时段',
      },
    ],
    flows: [
      {
        title: '各型号年处理重量',
        text: '计划年件数 × 对应单件重量。',
      },
      {
        title: '订单所需平均小时处理量',
        text: '各型号年处理重量之和 ÷ 这些订单的年有效生产小时数。',
      },
    ],
    conditions: [
      '重件和轻件分别填写，不能把最重型号的单重用于全年所有产品。',
      '计算结果是订单需求，应与厂家在相同工件及工艺条件下核算的设备能力比较。',
      '设备带宽和加热区长度不能补足单件重量及有效生产时间。',
    ],
    id: -994,
    title: '曲轴网带调质线只给了年产件数，能直接换算成每小时多少公斤吗？',
    image: '/images/infographics/crankshaft-annual-count-hourly-capacity.png',
    imageAlt: '曲轴网带调质线只给了年产件数，能直接换算成每小时多少公斤吗？：设备示意与图文要点',
    caption: '设备画面为AI生成示意，非项目实拍；参数及适用范围以本篇图文说明为准。',
    paragraphs: [
      '曲轴网带调质线只写了年产件数，能直接换算成每小时多少公斤吗？不能。轻曲轴和重曲轴都算一件，仅有“件数”，还缺单件重量和能够分配给订单的有效生产时间。',
      '江苏苏能工业炉有限公司的一份曲轴网带调质线协议列出的规格上限为淬火调质最大约100万件/年，主炉网带宽1200毫米、加热区长13800毫米。它们能说明设备的部分规格，但推不出你的订单每小时要处理多少公斤。',
      '正确的询价计算是：先按型号把计划年件数乘以对应单件重量，得到各型号年处理重量；再把重量合计除以这些订单的年有效生产小时数，得到订单所需平均小时处理量。',
      '有效时间要扣除计划停机和已排给其他订单的时段。最后将计算结果与厂家按同样工件和工艺条件核算的设备能力进行比较。',
    ],
    sourceNote: '本文根据江苏苏能工业炉技术资料整理',
  },
  {
    slug: 'bright-quench-mesh-belt-selection-inputs',
    topic: 'selection',
    equipmentLabel: '网带炉',
    furnaces: ['mesh-belt', 'line'],
    summary:
      '每小时1吨光亮淬火的选型，先提供代表工件规格、单重、铺料厚度、材质和工艺文件；方案约1000公斤/小时仅为设计参考值。',
    rows: [
      {
        label: '代表工件资料',
        value: '品种规格、单重、铺料厚度、材质、工艺曲线或文件',
        condition: '每种代表工件单独填写',
      },
      {
        label: '方案设计参考处理量',
        value: '约 1000 公斤／小时',
        condition: '需买方书面确认产量和代表工件资料',
      },
      {
        label: '主炉网带宽',
        value: '1000 毫米',
        condition: '本方案配置',
      },
      {
        label: '加热段长度',
        value: '10000 毫米',
        condition: '本方案配置',
      },
      {
        label: '主炉电加热功率',
        value: '约 500 千瓦',
        condition: '不能单独判断另一种工件的处理量',
      },
    ],
    flows: [],
    conditions: [
      '一小时1吨是订单目标，不是自动适用的设备结论。',
      '请厂家将装料厚度、工艺时间和设计参考处理量回复在同一型号下。',
      '工件同重，铺料位置、料层厚度和所需加热时间仍可能不同。',
    ],
    id: -993,
    title: '我们的小零件要做光亮淬火，一小时要做一吨，得给厂家哪些资料才能选网带炉？',
    image: '/images/infographics/bright-quench-mesh-belt-selection-inputs.png',
    imageAlt:
      '我们的小零件要做光亮淬火，一小时要做一吨，得给厂家哪些资料才能选网带炉？：设备示意与图文要点',
    caption: '设备画面为AI生成示意，非项目实拍；参数及适用范围以本篇图文说明为准。',
    paragraphs: [
      '小零件计划每小时做1吨光亮淬火，选网带炉前需要准备什么？先选一种常加工的代表工件，提供品种规格、单件重量、网带上的铺料厚度、材质，以及工艺曲线或加热时间与温度要求。',
      '江苏苏能工业炉有限公司的一份保护气氛光亮淬火线设计方案，以约1000公斤/小时作为设计参考值，并要求买方书面确认代表工件和产量。该方案的主炉网带宽1000毫米、加热段长10000毫米、电加热功率约500千瓦。',
      '这些是方案参考条件，不代表任何小零件都能稳定达到每小时1吨。即使两个零件同样重，铺料方式、料层厚度和加热停留时间不同，处理量也会改变。',
      '给厂家询价时，最好每种代表工件单列一行，让厂家把采用的装料厚度、工艺时间和相应设计处理量回复在同一行，便于后续换产品时重新核算。',
    ],
    sourceNote: '本文根据江苏苏能工业炉技术资料整理',
  },
  {
    slug: 'steering-arm-normalizing-quenching-shared-furnace',
    topic: 'selection',
    equipmentLabel: '网带炉',
    furnaces: ['mesh-belt', 'line'],
    summary:
      '技术文本将正火加热与调质中的淬火加热安排在同一前炉，但仍须分别核对出炉冷却路线、后段配置和工艺切换方式。',
    rows: [
      {
        label: '共用前炉范围',
        value: '正火加热与调质工艺中的淬火加热',
        condition: '本技术文本安排在同一台托辊网带炉',
      },
      {
        label: '有效宽度',
        value: '850 毫米',
        condition: '用于核对装料空间',
      },
      {
        label: '额定温度',
        value: '950℃',
        condition: '不是各类锻件的实际工艺温度',
      },
      {
        label: '控温分区',
        value: '4区',
        condition: '用于比较前炉配置',
      },
    ],
    flows: [
      {
        title: '正火件路线',
        text: '出料位置和冷却位置均待厂家在设备布置图中标明。',
      },
      {
        title: '调质件路线',
        text: '淬火 — 回火 — 冷却；与正火件交替生产时需明确切换安排。',
      },
    ],
    conditions: [
      '先把两批锻件各自的加热温度和保温时间交给厂家核对。',
      '让厂家在同一张布置图中画出两条路线，明确共用与分别配置的设备。',
      '设备表上有兼用前炉，不代表已配置专门的切换机构。',
    ],
    id: -992,
    title: '转向臂锻件一批做正火，一批做调质，前面加热能共用一台网带炉吗？',
    image: '/images/infographics/steering-arm-normalizing-quenching-shared-furnace.png',
    imageAlt: '转向臂锻件一批做正火，一批做调质，前面加热能共用一台网带炉吗？：设备示意与图文要点',
    caption: '设备画面为AI生成示意，非项目实拍；参数及适用范围以本篇图文说明为准。',
    paragraphs: [
      '转向臂锻件一批做正火、一批做调质，前面加热可以共用网带炉吗？江苏苏能工业炉有限公司的一份转向臂类锻件技术文本，确实把正火加热与调质工艺中的淬火加热安排在同一台托辊网带炉中。',
      '但“共用前炉”不等于两条后续工艺路线都已配置齐全。技术文本对调质件的淬火、回火及冷却路线有说明；正火件的出料点和冷却安排，还需要厂家在设备布置图中明确。两类工件交替生产时，也要核对如何切换，以及是否需要专门的切换机构。',
      '这台前炉的有效宽度为850毫米、额定温度950℃、4区控温。这些只能用于比较设备配置，不能代替各类锻件的实际加热温度和保温时间。',
      '询价时应让厂家画出两条路线，并在供货清单中逐项注明共用和分别配置的设备。',
    ],
    sourceNote: '本文根据江苏苏能工业炉技术资料整理',
  },
  {
    slug: 'aluminum-liner-solution-furnace-basket-load',
    topic: 'selection',
    equipmentLabel: '固溶炉',
    furnaces: [],
    summary:
      '本项目每炉额定装载量不超过1600公斤，不含料框；转运平台和小车须核算整框总重量，装框支数还需对应同一行工件规格。',
    rows: [
      {
        label: '每炉额定装载量',
        value: '不超过 1600 公斤',
        condition: '不包含料框重量',
      },
      {
        label: '装框数量',
        value: '16支／框、9支／框',
        condition: '分别与协议同一行的内胆直径和长度对应',
      },
      {
        label: '炉内核算重量',
        value: '该炉次全部工件净重',
        condition: '按确认的装框安排核对',
      },
      {
        label: '转运承重核算',
        value: '该框工件重量 + 料框自重',
        condition: '料框外形与重量以双方确认图纸为准',
      },
    ],
    flows: [],
    conditions: [
      '最大规格、最大支数和额定装载量是不同限制，不能随意组合。',
      '不能将炉内净装载量直接当作转运平台和小车的承重需求。',
      '比较小时出料量时，需补充每框支数、每炉装框安排和完整处理一炉的时间。',
    ],
    id: -991,
    title: '气瓶铝内胆做固溶，厂家说一炉能装多少公斤，料框的重量也算进去吗？',
    image: '/images/infographics/aluminum-liner-solution-furnace-basket-load.png',
    imageAlt:
      '气瓶铝内胆做固溶，厂家说一炉能装多少公斤，料框的重量也算进去吗？：设备示意与图文要点',
    caption: '设备画面为AI生成示意，非项目实拍；参数及适用范围以本篇图文说明为准。',
    paragraphs: [
      '气瓶铝内胆固溶炉说每炉能装1600公斤，包含料框重量吗？在江苏苏能工业炉有限公司的一份铝内胆固溶炉协议中，每炉额定装载量不超过1600公斤，明确不含料框重量。',
      '但核算转运平台和小车承重时，需要把装好内胆的整框重量算进去，也就是该框内胆净重加料框自重，不能直接照搬炉内净装载量。',
      '协议还出现16支/框和9支/框两种装框数量。支数必须与同一行的内胆直径、长度一起核对；最大规格、最大支数和额定装载量是不同限制，不能把它们随意拼成一种装法。',
      '询价时建议分两栏填写：固溶炉核工件规格、数量及总净重；转运设备核每框工件重量和料框自重。若还要比较小时出料量，必须补充每炉装框安排及完整处理一炉所需时间。',
    ],
    sourceNote: '本文根据江苏苏能工业炉技术资料整理',
  },
];

export function getInfographic(slug: string, locale: Locale = 'zh') {
  if (locale === 'en') return slug === bucketTeethInfographicEn.slug ? bucketTeethInfographicEn : undefined;
  return infographicResources.find((item) => item.slug === slug);
}

export function getInfographicPages(resource: InfographicResource) {
  return [
    {
      image: resource.image,
      imageAlt: resource.imageAlt,
      ...(resource.imageSize ?? { width: 1086, height: 1448 }),
    },
    ...(resource.additionalPages ?? []),
  ];
}

export function getInfographicImageSrcSet(image: InfographicResource['image']) {
  // Ship the two display sizes beside the original so no resizing is needed on first view.
  const base = image.replace(/\.png$/, '');
  return imageVariants.map(({ width }) => `${base}-${width}w.webp ${width}w`).join(', ');
}

export function getInfographicTopicLabel(resource: InfographicResource, locale: Locale = 'zh') {
  return newsUiText(locale, NEWS_DECISION_TOPICS.find((topic) => topic.id === resource.topic)?.label ?? '技术资料');
}

export function getInfographicCards(locale: Locale = 'zh'): NewsListCardItem[] {
  const resources = locale === 'en' ? [bucketTeethInfographicEn] : infographicResources;
  return resources.map((item) => ({
    id: item.id,
    slug: item.slug,
    href: `/${locale}/infographics/${item.slug}`,
    contentType: 'infographic',
    title: { zh: '', en: '', [locale]: item.title },
    summary: { zh: '', en: '', [locale]: item.summary },
    category: { zh: '', en: '', [locale]: getInfographicTopicLabel(item, locale) },
    image: item.image,
    date: '',
    listTopic: item.topic,
    listFurnaces: item.furnaces,
    listEquipmentLabel: locale === 'en' || item.equipmentLabel === '叉车炉' ? item.equipmentLabel : undefined,
    searchText: [
      item.title,
      item.summary,
      item.equipmentLabel,
      ...item.paragraphs,
      ...item.rows.map((row) => `${row.label} ${row.value} ${row.condition}`),
      ...item.flows.map((flow) => flow.text),
      ...item.conditions,
    ].join(' '),
  }));
}
