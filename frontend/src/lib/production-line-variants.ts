import type { LineVariant } from './production-line-types';

// Variants describe reading structure; engineering routes remain page-specific.
export const productionLineVariants: Record<
  LineVariant,
  {
    label: string;
    workpieceTitle: string;
    processTitle: string;
    configurationTitle: string;
  }
> = {
  mesh: {
    label: '网带连续处理',
    workpieceTitle: '先看工件与铺料，再匹配处理路线',
    processTitle: '按来料与目标，分别看清工艺路线',
    configurationTitle: '从铺料、停留时间到冷却，逐项确定配置',
  },
  'wire-strip': {
    label: '线材与带材',
    workpieceTitle: '从材料规格到收放料，确认连续运行条件',
    processTitle: '把热处理段与前后机组衔接起来',
    configurationTitle: '把材料、速度和张力，落实到设备配置',
  },
  handling: {
    label: '工件转运与设备协同',
    workpieceTitle: '先看工件与装夹，再安排转运与节拍',
    processTitle: '把工序与转运关系放在一起看',
    configurationTitle: '围绕共享节拍，明确设备与动作接口',
  },
  aluminum: {
    label: '铝合金处理',
    workpieceTitle: '从合金、状态与装载，确定温度和转运条件',
    processTitle: '从装料到后工序，看清设备衔接',
    configurationTitle: '把温度窗口与生产节拍，落实到设备配置',
  },
  curing: {
    label: '复合材料固化',
    workpieceTitle: '先确认瓶体与树脂，再确定支承与固化制度',
    processTitle: '从缠绕交接到固化，衔接瓶体输送与温度曲线',
    configurationTitle: '围绕瓶体温度、支承和排风确定配置',
  },
};
