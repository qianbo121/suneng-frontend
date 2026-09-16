import type { ProductionLineContent } from './production-line-types';

export type ProcessZone = {
  id: string;
  label: string;
  /** Percentages in the uncropped, source image: x, y, width, height. */
  box: [number, number, number, number];
};
type StepBinding = { zone?: string; description: string; locationNote?: string };
export type ProcessMap = {
  imageFile: string;
  zones: ProcessZone[];
  steps: StepBinding[];
  initial: number;
  movement?: string;
};
const zone = (id: string, label: string, ...box: ProcessZone['box']): ProcessZone => ({
  id,
  label,
  box,
});
const step = (
  zone: string | undefined,
  description: string,
  locationNote?: string,
): StepBinding => ({ zone, description, locationNote });

// These are functional areas in reviewed representative illustrations, not CAD
// coordinates. Several operations can share one area. Unpictured operations are
// deliberately unbound. A changed source image disables its old annotations.
export const productionLineProcessMaps: Record<string, ProcessMap> = {
  'fastener-quench-temper-line': {
    imageFile: 'process-whole-line-d3dae29a6cb7.png',
    initial: 2,
    zones: [
      zone('entry', '上料输送', 1, 40, 13, 43),
      zone('heat', '加热炉段', 14, 28, 25, 55),
      zone('quench', '淬火段', 39, 36, 16, 53),
      zone('wash', '清洗干燥', 56, 30, 13, 54),
      zone('temper', '回火炉段', 70, 29, 22, 55),
      zone('exit', '出料端', 92, 51, 7, 34),
    ],
    steps: [
      step('entry', '工件均匀铺料后进入输送段，控制铺料厚度与进料节拍。'),
      step('heat', '按材料与工艺要求加热、保温，核对温度和实际处理时间。'),
      step('quench', '加热后的工件进入淬火段，介质和冷却条件按材料及目标性能确定。'),
      step('temper', '淬火后的工件进入高温回火段，按目标性能确定回火制度。'),
      step(
        'exit',
        '按工艺冷却后下料，衔接收料与后续检验。',
        '高亮出料端；后续检验设备未在图中单独展开。',
      ),
    ],
  },
  'forging-waste-heat-qt-line': {
    imageFile: '02-whole-line-0a7acf13f6be.png',
    initial: 3,
    zones: [
      zone('entry', '测温进料', 2, 43, 23, 41),
      zone('equalize', '均温段', 24, 16, 13, 70),
      zone('quench', '转运淬火', 37, 23, 15, 63),
      zone('wash', '清洗衔接', 52, 39, 8, 47),
      zone('temper', '独立回火', 61, 33, 23, 54),
      zone('exit', '出料端', 84, 55, 14, 31),
    ],
    steps: [
      step('entry', '核对锻后温度、组织状态和允许转移时间，再决定放行或隔离。'),
      step(
        'equalize',
        '仅在已验证的工艺窗口内，按需保温或均温；不能靠简单补温默认恢复余热淬火条件。',
      ),
      step(
        'quench',
        '将获准放行的锻件转入淬火工位，按约定起止事件记录转移时间。',
        '高亮转运与淬火共用区域；不表示炉内或槽内的具体运动轨迹。',
      ),
      step('quench', '工件进入淬火段，按材料、有效截面与目标组织匹配介质和冷却条件。'),
      step('wash', '按淬火介质残留与后续回火要求，安排清洗或沥液。'),
      step('temper', '工件进入独立回火炉，核对淬后等待时间、装载与回火制度。'),
      step(
        'exit',
        '按工艺完成终冷，按约定状态检验尺寸与性能。',
        '高亮出料衔接端；检验不等于由图中辊道完成。',
      ),
    ],
  },
  'track-shoe-press-quench-line': {
    imageFile: '02-whole-line-3bc64747eec8.png',
    initial: 4,
    zones: [
      zone('entry', '上料端', 2, 65, 13, 25),
      zone('heat', '加热炉', 15, 34, 21, 55),
      zone('transfer', '出炉转移', 36, 55, 8, 34),
      zone('press', '压淬工位', 44, 10, 15, 81),
      zone('temper', '回火炉', 66, 37, 25, 48),
      zone('exit', '出料端', 91, 61, 8, 23),
    ],
    steps: [
      step('entry', '按履带板型号识别来料，核对装载方式与对应模具。'),
      step('heat', '按材料与产品要求进行奥氏体化加热，确认出炉条件。'),
      step('transfer', '从加热炉转运至压淬工位，记录出炉至起淬的约定时间。'),
      step('press', '工件在模具内定位、合模，建立约定的几何约束。'),
      step('press', '在模具约束下受控冷却，协调压力或位移与介质供给。'),
      step('press', '达到约定条件后卸压、开模并转出，继续后续处理。'),
      step(
        undefined,
        '按所用淬火介质与回火要求配置清洗、干燥及相应衔接。',
        '按需工序；本图未单独展示清洗、干燥设备。',
      ),
      step(
        'temper',
        '按材料与产品要求完成回火及后续冷却。',
        '高亮回火炉；终冷方式按具体工艺确定。',
      ),
      step(
        undefined,
        '在约定回火与冷却状态下检验尺寸及性能，不把压淬等同于零变形。',
        '后续检验工序，检验设备未在图中展示。',
      ),
    ],
  },
  'roller-mesh-belt-line': {
    imageFile: '02-whole-line-0b3b093bb4b7.png',
    initial: 2,
    zones: [
      zone('entry', '上料布料', 1, 36, 23, 50),
      zone('heat', '加热保温', 24, 22, 38, 63),
      zone('cool', '冷却段', 63, 38, 26, 47),
      zone('exit', '下料端', 89, 63, 10, 24),
    ],
    steps: [
      step(
        undefined,
        '确认材料、原始组织、来料清洁度与处理目的，再确定退火路线。',
        '来料确认在上料前进行，不是一台独立炉段。',
      ),
      step('entry', '工件按确认装载方式均匀布料，控制连续进料节拍。'),
      step('heat', '按所需退火类型加热工件，匹配炉温制度与装载。'),
      step('heat', '按工件透热情况和采用规范确定保温起点，不能用炉内停留时间直接替代。'),
      step('cool', '按材料及退火要求控制冷却过程，核对段长与节拍是否适合。'),
      step('exit', '下料后按约定项目检验，并衔接后续生产。', '高亮下料端；质量检验另行安排。'),
    ],
  },
  'mesh-belt-carbonitriding-line': {
    imageFile: '02-whole-line-3089af0cf685.png',
    initial: 3,
    zones: [
      zone('entry', '进料端', 1, 62, 10, 26),
      zone('prewash', '前处理', 11, 36, 14, 51),
      zone('heat', '渗碳炉段', 25, 13, 34, 75),
      zone('quench', '封闭淬火', 59, 51, 11, 37),
      zone('wash', '后清洗', 70, 47, 8, 40),
      zone('temper', '回火炉段', 78, 50, 12, 37),
      zone('exit', '出料端', 90, 66, 9, 22),
    ],
    steps: [
      step('entry', '按工件材料、表面状态和装载要求分选、铺料。'),
      step('prewash', '根据来料表面状态，按需清洗、干燥后再进入热处理段。'),
      step('heat', '核对密封与气氛条件，按工艺完成预热和进炉衔接。'),
      step('heat', '按材料与目标硬化层进行渗碳和扩散；两者可在同一炉体内分区完成。'),
      step('quench', '本图为封闭油淬与提升出料的代表配置；实际介质与转移方式按工件要求确定。'),
      step('wash', '清理淬火后的残留介质并按需要干燥，衔接后续回火。'),
      step('temper', '按工件要求进行低温回火，核对制度与淬后衔接。'),
      step('exit', '按工艺终冷出料，再转入检验与后续工序。'),
      step(
        undefined,
        '按采用规范验证有效硬化层、表面与芯部硬度、组织和变形。',
        '质量验证工序；检验设备未在本图展示。',
      ),
    ],
  },
  'copper-wire-annealing-line': {
    imageFile: '02-whole-line-fcaa714e3cb6.png',
    initial: 2,
    zones: [
      zone('entry', '放线导向', 1, 35, 17, 52),
      zone('tension', '入口衔接', 19, 50, 8, 37),
      zone('heat', '管式炉段', 27, 46, 37, 40),
      zone('cool', '保护冷却', 65, 47, 14, 39),
      zone('exit', '牵引收线', 80, 41, 19, 48),
    ],
    steps: [
      step('entry', '放线并导向，使线材沿确认路径连续进入设备。'),
      step(
        'tension',
        '协调放线、牵引与张力，保持稳定通线。',
        '高亮入口衔接；张力控制并非仅由这一处完成。',
      ),
      step('heat', '线材连续通过受保护的工作通道，由炉体间接加热，不把线材作为发热电阻。'),
      step('cool', '在确认的保护条件下冷却，气氛与铜材牌号须适配。'),
      step(
        undefined,
        '出口是否需要清洗、去液或干燥，按实际冷却方式确定。',
        '按需后处理；本图未明确单独展示这些设备。',
      ),
      step('exit', '协调牵引、线速与收线，保持出口衔接。'),
    ],
  },
  'annealing-solution-line': {
    imageFile: '02-whole-line-d8482593d9ae.png',
    initial: 2,
    zones: [
      zone('entry', '入口输送', 1, 44, 24, 43),
      zone('heat', '热处理炉段', 25, 24, 37, 63),
      zone('cool', '冷却段', 62, 42, 23, 45),
      zone('exit', '出口衔接', 86, 57, 13, 30),
    ],
    steps: [
      step('entry', '核对入口输送与张力，衔接带材连续运行。'),
      step('heat', '按材料及处理目标完成预热、加热。'),
      step('heat', '按所选退火或固溶工艺完成均热处理，两种处理不作为必经的连续两道工序。'),
      step('cool', '按材料、板形与后续工序要求选择分段冷却组合。'),
      step(
        undefined,
        '按前段冷却和表面要求配置挤干或烘干。',
        '按需后处理；具体装置未在图中单独明确。',
      ),
      step(
        'exit',
        '衔接后续表面处理与出口组织，酸洗等设备是否供货单独列项。',
        '高亮出口衔接端；不能据图确认酸洗等供货范围。',
      ),
    ],
  },
  'aluminum-solution-aging-line': {
    imageFile: '02-whole-line-824a22701c2d.png',
    initial: 4,
    movement: '工序按下方顺序进行；固溶炉向下转移入槽，再衔接相邻时效炉。',
    zones: [
      zone('entry', '装料交接', 3, 57, 24, 34),
      zone('solution', '固溶炉', 29, 13, 32, 39),
      zone('quench', '炉下淬火槽', 28, 53, 34, 36),
      zone('aging', '独立时效炉', 65, 38, 33, 51),
    ],
    steps: [
      step('entry', '核对批次与装载方式，准备固溶处理。'),
      step('solution', '按合金与采用规范进行固溶加热。'),
      step('solution', '达到规范约定的保温条件后计时，不能仅凭炉温到达设定值判定。'),
      step(
        'quench',
        '图示落底式固溶炉向下转移入槽，淬火延迟按规范约定起止条件计时。',
        '高亮炉下转移与淬火区域，不画成水平连续穿炉。',
      ),
      step('quench', '按合金与规范控制淬火介质、状态和过程。'),
      step(
        undefined,
        '排液后按合金和规范安排淬后衔接，记录进入人工时效的允许间隔。',
        '淬后交接环节；停放及转运位置按实际布置确定。',
      ),
      step('aging', '工件转入相邻独立时效炉，按采用制度完成人工时效。'),
      step(
        undefined,
        '按工艺冷却，并按约定项目检验；自然时效不等同于人工时效。',
        '出炉后工序；冷却与检验设施未在图中单独展示。',
      ),
    ],
  },
  'aluminum-forging-heating-line': {
    imageFile: '02-whole-line-9dbc1446f8d2.png',
    initial: 3,
    zones: [
      zone('entry', '上料端', 1, 55, 23, 34),
      zone('heat', '对流加热炉', 25, 17, 53, 74),
      zone('exit', '测温交接', 79, 57, 11, 34),
    ],
    steps: [
      step('entry', '识别铝合金坯料批次，按确认装载方式上料。'),
      step('heat', '坯料在炉内按工艺分区升温，不用外部风机数量推定实际温区数量。'),
      step('heat', '按代表坯料温度验证均热条件，核对工件温度而非只看炉温。'),
      step('exit', '出炉后测温、识别，按已确认的判定条件放行或分流。'),
      step('exit', '合格坯料按允许时间转运交接，分别核对出炉温度与入模温度。'),
      step(
        undefined,
        '坯料交至下游锻压工序，锻压设备与接口供货分工单独确认。',
        '下游锻压设备未在图中展示。',
      ),
    ],
  },
  'cylinder-curing-line': {
    imageFile: '02-whole-line-090ec472d41e.png',
    initial: 4,
    zones: [
      zone('entry', '支承上料', 1, 51, 33, 42),
      zone('heat', '热风固化炉', 34, 9, 56, 80),
      zone('exit', '出料交接', 90, 49, 9, 33),
    ],
    steps: [
      step(
        undefined,
        '从缠绕工序接收产品，核对树脂制度、产品批次与固化要求。',
        '前道交接环节；缠绕设备未在图中展示。',
      ),
      step('entry', '通过端部支承上料，分别协调托架输送与瓶体旋转。'),
      step('heat', '是否设置预热或排挥，按树脂制度确定，不作为全部产品的必经工序。'),
      step('heat', '按工件曲线协调分区升温、输送速度与炉段长度。'),
      step('heat', '按树脂制度保温固化，以瓶体温度验证，不以空气设定温度替代。'),
      step(
        undefined,
        '按树脂与产品要求受控冷却，停止加热后仍需考虑树脂继续放热。',
        '冷却区域及独立设备按确认方案设置，不能由封闭外壳划定。',
      ),
      step('exit', '完成约定处理后下料，衔接后工序。'),
      step(
        undefined,
        '关联产品批次与固化过程记录，保留可核查的过程资料。',
        '贯穿全流程的记录工作，不对应一台末端设备。',
      ),
    ],
  },
  'multi-furnace-quench-cell': {
    imageFile: '02-whole-line-040a63f867a3.png',
    initial: 5,
    movement: '各炉并列作业，操作机沿公共轨道往返；工件不依次通过每台炉。',
    zones: [
      zone('quench', '共用淬火槽', 1, 37, 21, 38),
      zone('furnaces', '并列加热炉组', 25, 12, 70, 63),
      zone('handler', '轨道操作机', 31, 64, 64, 30),
    ],
    steps: [
      step(
        undefined,
        '核对批次任务、炉位及所需工艺，明确本批次使用的加热炉。',
        '调度确认环节，不代表依次经过三台炉。',
      ),
      step('handler', '操作机完成料盘取放与装炉，服务已选定的炉位。'),
      step('furnaces', '所选炉位独立完成加热保温；其他炉位可以并列作业。'),
      step(
        undefined,
        '出料前确认操作机可用、槽位就绪并预留相关资源。',
        '共享资源调度，不是一台独立设备。',
      ),
      step('handler', '按任务开门取料、收叉并沿轨道转移，核对约定计时条件。'),
      step('quench', '工件转入共用淬火槽，按材料和工艺执行受控淬火。'),
      step(
        undefined,
        '出槽后交接下游，需回火的工件另核回火设备与允许间隔。',
        '下游交接与回火设备未在本图展开。',
      ),
      step(
        undefined,
        '保存批次记录并释放共享工位，供后续任务按调度使用。',
        '过程记录与调度环节，不对应末端物理工位。',
      ),
    ],
  },
};

export function getLineProcessSteps(content: ProductionLineContent) {
  const process = content.sections.process;
  const map = productionLineProcessMaps[content.pageId];
  const source =
    process.mode === 'linear'
      ? process.stages
      : (process.routes?.[0]?.steps ?? []).map((title, index) => ({
          id: `step-${index}`,
          title,
          description: '',
        }));
  const steps = source.map((stage, index) => ({
    ...stage,
    ...map?.steps[index],
    optional: /按需|按来料|必要的/.test(stage.title),
  }));
  // The existing fastener note explicitly allows post-quench washing/drying,
  // and its reviewed image shows that module. Expose it between quench/temper.
  if (content.pageId === 'fastener-quench-temper-line') {
    steps.splice(3, 0, {
      id: 'post-quench-cleaning',
      title: '淬后清洗与干燥（按需）',
      zone: 'wash',
      description: '按介质残留与回火要求清洗、干燥；前清洗是否需要另按来料状态确定。',
      optional: true,
    });
  }
  return steps;
}
