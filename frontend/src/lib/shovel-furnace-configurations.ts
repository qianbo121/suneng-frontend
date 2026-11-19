export const copperCoilFurnace = {
  chambers: 4, handlers: 1, powerPerChamberKw: 200, zonesPerChamber: 1,
  diameterMm: 1700, heightMm: 1600, ratedC: 700, minC: 550, maxC: 700, holdingToleranceC: 5,
  loadWithRackT: 5.5,
};
const coil = copperCoilFurnace;
export const copperCoilLoadArea = `Φ${coil.diameterMm}×${coil.heightMm} mm`;
export const copperCoilSharing = `${coil.chambers} 个炉室共用 ${coil.handlers} 台叉料车`;
export const copperCoilHeating = `每室 ${coil.powerPerChamberKw} 千瓦、${coil.zonesPerChamber} 个温区`;
export const copperCoilWorkingRange = `${coil.minC}–${coil.maxC}℃`;
export const shovelPagePath = '/zh/products/detail/shovel-furnace';
export const shovelDiagram = '/images/products/shovel-furnace/fork-quench-layout.png';
export const shovelHeroImage = '/images/products/shovel-furnace/fork-quench-series/01-overview.webp';
export const shovelLoadingImage = '/images/products/shovel-furnace/fork-quench-series/02-loading.webp';
export const shovelSearchSummary = '苏能叉车炉的长棒料淬火、管件与法兰固溶和铜合金线材卷退火配置，列明每炉装载、出炉入水计时和炉前配套分工。';

// All loads and transfer limits refer to an individual agreement configuration.
const barsTonnes = 5;
const fittingsTonnes = 7;
export const barLoad = `${barsTonnes} 吨工件`;
export const fittingLoad = `工件和料筐合计 ${fittingsTonnes} 吨`;
const quenchSupply = '水槽和耐热钢料筐由买方自备。';

const barQuench = {
  anchor: 'bar-quench',
  model: 'RX4-850-12',
  process: '长棒料淬火',
  size: '1300 × 6000 × 600',
  power: '850',
  zones: '4',
  temperature: '1200（最高使用）',
  load: `${barsTonnes}（仅工件）`,
  transfer: '≤30 秒',
  conditions: '工作尺寸按长 × 宽 × 高列出，6000 毫米为工作宽度。装载只计工件，不含工装垫块。保温时炉温均匀性为 ±8℃。',
  timing: `按 ${barLoad}核定。炉门开到位后，从工件开始出炉计到整批工件全部浸没。`,
  supply: quenchSupply,
};

const fittingSolution = {
  anchor: 'fitting-solution',
  model: 'RX4-420-11',
  process: '不锈钢管件、法兰固溶',
  size: '1800 × 1800 × 1200',
  power: '420',
  zones: '2',
  temperature: '1150（最高使用）',
  load: `${fittingsTonnes}（工件＋料筐）`,
  transfer: '≤50 秒',
  conditions: '工作尺寸按长 × 宽 × 高列出。装载含料筐，不含工装垫铁。保温时炉温均匀性为 ±10℃。',
  timing: `按${fittingLoad}核定。从工件开始由炉内向外移动，计到整批工件全部浸没。`,
  supply: quenchSupply,
};

const copperCoil = {
  anchor: 'shared-car',
  model: `铜线退火 ${coil.chambers} 室配置`,
  process: '铜合金线材卷退火',
  size: `Φ${coil.diameterMm} × ${coil.heightMm}`,
  power: `${coil.powerPerChamberKw} / 室`,
  zones: `${coil.zonesPerChamber} / 室`,
  temperature: `${coil.ratedC}（额定）`,
  load: `${coil.loadWithRackT}（线卷＋料架）`,
  transfer: '',
  conditions: `尺寸为有效装料直径 × 高度，装载含料架。额定温度 ${coil.ratedC}℃，使用温度 ${copperCoilWorkingRange}，保温期间温差在 ±${coil.holdingToleranceC}℃ 内。`,
  timing: '',
  supply: '随料进炉的料架由买方提供。',
};

export const shovelConfigurations = [barQuench, fittingSolution, copperCoil];
export const shovelTransferLimits = { bars: barQuench.transfer, fittings: fittingSolution.transfer };

export const shovelTableColumns = [
  { key: 'process', label: '工艺' },
  { key: 'size', label: '工作尺寸（毫米）' },
  { key: 'power', label: '加热功率（千瓦）' },
  { key: 'zones', label: '温区数' },
  { key: 'temperature', label: '协议温度（℃）' },
  { key: 'load', label: '每炉装载（吨）' },
  { key: 'transfer', label: '协议约定的出炉至入水时间' },
] as const;

export const shovelSupplyNotes = [
  { label: `${barQuench.model}、${fittingSolution.model}`, text: quenchSupply },
  { label: copperCoil.model, text: copperCoil.supply },
];

export const shovelEquipmentFeatures = [
  {
    title: `以 ${barQuench.model} 的协议配置为例`,
    items: [
      { name: '铲车取料', text: '电机驱动铲车沿轨道行走，速度为 6–20 米/分钟，可变频无级调速。液压油缸带动 6 根铲齿升降。炉内每排有 7 个垫块位置，铲齿从垫块之间伸入，托料退出后整批下降入水。' },
      { name: '加热联锁', text: '炉门打开即自动切断加热电源。只有炉门落到位并锁紧、铲齿完全退出，才允许加热。' },
      { name: '炉门升降与防坠', text: '电动环链葫芦以 5–6 米/分钟升降炉门，关门时由斜楔自动压紧。上限位开关限制上升行程，升到位后由气动安全销自动锁住炉门，防止下坠。' },
      { name: '加热与控温', text: `采用高温电热合金扁带，表面负荷为 1.6 瓦/平方厘米。炉膛左右共 ${barQuench.zones} 个温区，每区一只程序温控仪。4 通道无纸记录仪同步记录各区炉温。超温或热电偶断线时发出声光报警，超温时自动切断加热电源。` },
      { name: '炉前操作', text: '炉前按钮站配有急停按钮，可用遥控器操作炉门升降、铲车进退和铲齿升降。' },
    ],
  },
  {
    title: copperCoil.model,
    items: [
      { name: '炉内循环与密封', text: '炉顶循环风机配导流罩，引导热风在炉内循环。炉门四角各有一只气缸，关门时共同压紧炉门。' },
      { name: '装卸与温度记录', text: `${copperCoilSharing}，装料台、卸料台各 1 台。触摸屏可查看实时和历史温度曲线，历史记录至少保存 7 天。` },
    ],
  },
];
