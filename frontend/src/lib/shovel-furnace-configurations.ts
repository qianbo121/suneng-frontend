// Chinese product-page review. Each entry represents one countersigned configuration.
// Transfer limits are agreement values. The engineering review defines the load and timing events.
export const barLoad = '5 吨工件';
export const fittingLoad = '工件和料筐合计 7 吨';
const barQuench = {
  anchor: 'bar-quench',
  process: '长棒料淬火',
  equipment: '电加热 850 千瓦，4 个温区。工作尺寸 1.3 × 6 × 0.6 米，其中 6 米为工作宽度。',
  temperature: '最高使用温度 1200℃，保温时炉温均匀性 ±8℃。',
  load: `每炉 ${barLoad}，不含工装垫块。`,
  transfer: '≤30 秒',
  timing: `按 ${barLoad}核定。炉门开到位后，从工件开始出炉到整批工件全部浸没。`,
  handling: '炉内每排设 7 个垫块位置。6 根铲齿从垫块之间伸入，托料退出后下降入水。水槽和耐热钢料筐由买方自备。',
};

const fittingSolution = {
  anchor: 'fitting-solution',
  process: '不锈钢管件、法兰固溶',
  equipment: '电加热 420 千瓦，2 个温区。工作尺寸 1.8 × 1.8 × 1.2 米。',
  temperature: '最高使用温度 1150℃，保温时炉温均匀性 ±10℃。',
  load: `${fittingLoad}，不含工装垫铁。`,
  transfer: '≤50 秒',
  timing: `按${fittingLoad}核定。从工件开始由炉内向外移动，到工件全部浸入水中。`,
  handling: '工件随筐转移。水槽和耐热钢料筐由买方自备。',
};

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

const copperCoil = {
  anchor: 'shared-car',
  process: '铜合金线材卷退火',
  equipment: `${coil.chambers} 个炉室，${copperCoilHeating}。有效装料直径 ${coil.diameterMm} 毫米，高 ${coil.heightMm} 毫米。`,
  temperature: `使用温度 ${copperCoilWorkingRange}，保温期间温差在 ±${coil.holdingToleranceC}℃内。`,
  load: `每炉最大 ${coil.loadWithRackT} 吨，含料架。`,
  transfer: '',
  timing: '退火后送卸料台。排产时核对各室出料时间和叉料车占用时间。',
  handling: `${copperCoilSharing}，装料台、卸料台各 1 台。随料进炉的料架由买方提供。`,
};

export const shovelConfigurations = [barQuench, fittingSolution, copperCoil];
export const shovelTransferLimits = { bars: barQuench.transfer, fittings: fittingSolution.transfer };
