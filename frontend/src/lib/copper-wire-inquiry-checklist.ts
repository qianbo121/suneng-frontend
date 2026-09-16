export const copperWireDetailPath = '/zh/products/detail/copper-wire-annealing-line';
export const copperWireChecklistPath = `${copperWireDetailPath}/inquiry-checklist`;
export const copperWireChecklistDownload =
  '/downloads/heat-treatment-lines/copper-wire-annealing-line.txt';
export const copperWireChecklistTitle = '铜丝连续退火生产线｜询价资料准备清单';
export const copperWireChecklistIntro = '把已有资料整理清楚，方便工程师判断工艺与设备方向。';
export const copperWireChecklistNote =
  '已知信息先提供，不确定的内容可以暂留空白。填写参数不代表设备兼容；勾选仅表示“资料已准备”，不表示技术条件已满足。';
export const copperWireChecklistBoundary =
  '本清单用于收集初步需求，不作为设备选型、报价或验收依据。加热方式、工艺制度、气氛与安全配置，由双方根据材料、目标性能及现场条件进一步确认。';

export const copperWireChecklistGroups = [
  {
    title: '材料与目标',
    description: '先说明是什么线材，以及希望达到什么结果。',
    items: [
      {
        id: 'material',
        title: '材料与来料状态',
        description: '铜牌号、含氧状态、来料冷作状态；注明裸铜、镀层或漆包状态。',
        note: '镀层及漆膜线材须另行评估，不默认适用裸铜退火工艺。',
      },
      {
        id: 'specification',
        title: '线径与丝数',
        description:
          '最小、最大及常用线径，注明单位；单丝或并行丝数。不同规格分别列出，并与第 4 项的线速、产量一一对应。',
      },
      {
        id: 'performance',
        title: '目标性能与表面要求',
        description:
          '抗拉强度、延伸率、电阻率、软化与表面要求。已有资料请提供目标值、单位、采用规范及版本；尚未确定的要求可先描述用途。',
      },
    ],
  },
  {
    title: '生产与设备',
    description: '把规格、生产节拍和设备衔接放在一起说明。',
    items: [
      {
        id: 'production',
        title: '线速、产量与生产节拍',
        description:
          '按同一规格对应提供：线径、丝数、目标稳定线速（米/分钟）及总产量（公斤/小时）。不同线径或线速分别列出，注明单丝或整机总和口径。',
        note: '同时说明班次、正常生产、启停、换规格、换盘及断线停机情况；已有线速或产量其中一项，也可先提供。',
      },
      {
        id: 'scope',
        title: '项目范围与加热方式',
        description:
          '说明是新建整线、衔接现有拉丝或收线设备，还是改造现有退火段，并列出拟保留设备和希望供货的范围。',
        note: '加热方式可注明管式炉间接加热、直接通电退火，或“尚未确定，由工程师协助判断”。',
      },
      {
        id: 'handling',
        title: '收放线与盘具',
        description:
          '盘具尺寸、满盘质量、放线／牵引／收线形式与允许张力；已有设备可提供照片、型号或布置图。',
      },
    ],
  },
  {
    title: '现场与验证',
    description: '已有条件如实提供，所需能力与安全配置由工程师核定。',
    items: [
      {
        id: 'atmosphere',
        title: '气氛与冷却条件',
        description:
          '表面目标、现有气源及已知供气条件、冷却方式、出口温度与残液限制。不确定的条件可留空，不需要自行选择保护气配方。',
        note: '工程提醒：含氧铜与高温含氢气氛存在材料损伤风险，不能因现场有氢气就默认采用含氢保护气，须结合材料和工艺评估。',
      },
      {
        id: 'site',
        title: '现场条件与接口',
        description:
          '可用场地、现有电源、冷却水、气源、排风条件，以及盘具搬运和上下游接口；有厂房或设备布置图可一并准备。',
        note: '客户提供已有条件，所需供给能力、安全措施及双方接口责任由工程师进一步核定。',
      },
      {
        id: 'verification',
        title: '样线与检验资料',
        description:
          '代表牌号及最小、最大、常用线径的样线信息；已有检验报告、抽样方法和批次追溯要求可一并提供。试验与验收条件在项目沟通中另行确认。',
      },
    ],
  },
] as const;

export function getCopperWireChecklistText() {
  let number = 0;
  const groups = copperWireChecklistGroups.map((group, index) =>
    [
      `${String(index + 1).padStart(2, '0')} ${group.title}`,
      group.description,
      ...group.items.map((item) => {
        number += 1;
        return `[ ] ${number}. ${item.title}（资料已准备）\n${item.description}${'note' in item ? `\n${item.note}` : ''}`;
      }),
    ].join('\n\n'),
  );

  return (
    [
      copperWireChecklistTitle,
      copperWireChecklistIntro,
      copperWireChecklistNote,
      ...groups,
      `使用边界\n${copperWireChecklistBoundary}`,
      '资料不全，也可以先沟通。请通过铜丝连续退火生产线详情页的咨询入口提交已有资料。',
    ].join('\n\n') + '\n'
  );
}
