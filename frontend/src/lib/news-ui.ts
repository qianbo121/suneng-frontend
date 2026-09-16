import type { Locale } from '@/types/site';

export const ENGLISH_NEWS_UI: Record<string, string> = {
  面包屑: 'Breadcrumb',
  首页: 'Home',
  技术资料: 'Resources',
  工业炉选型与采购资料: 'Industrial Furnace Selection & Purchasing Resources',
  '了解设备选型、报价参数、工艺质量、工程验收与维修改造。':
    'Explore equipment selection, quotation inputs, process quality, acceptance and furnace maintenance.',
  内容分类: 'Resource topics',
  设备类型筛选: 'Filter by equipment',
  设备类型: 'Equipment',
  全部资料: 'All Resources',
  设备选型: 'Equipment Selection',
  报价采购: 'Purchasing',
  工艺质量: 'Process & Quality',
  工程验收: 'Engineering & Acceptance',
  维修改造: 'Maintenance & Retrofit',
  全部设备: 'All Equipment',
  热处理生产线: 'Heat Treatment Lines',
  台车炉: 'Trolley Furnaces',
  井式炉: 'Pit Furnaces',
  箱式炉: 'Box Furnaces',
  网带炉: 'Mesh Belt Furnaces',
  辊底炉: 'Roller Hearth Furnaces',
  资料列表: 'Resources',
  文章排序: 'Sort articles',
  推荐阅读: 'Recommended',
  最近更新: 'Recently Updated',
  '正在加载技术资料…': 'Loading resources…',
  资料暂时无法加载: 'Resources are temporarily unavailable',
  '请稍后重试，或联系苏能工程师。': 'Please try again later or contact Suneng.',
  重新加载: 'Try Again',
  资料工具与常见问题: 'Checklists and questions',
  常用清单: 'Useful Checklists',
  '先预览内容，再按项目需要使用。': 'Review the content and adapt it to your project.',
  预览清单: 'View Checklist',
  网带炉报价边界清单: 'Mesh Belt Line Quotation Checklist',
  工业炉报价参数清单: 'Furnace Quotation Inputs',
  生产线交付核验清单: 'Production Line Delivery Checks',
  '9项内容': '9 items',
  常见问题: 'Common Questions',
  '参数还没整理齐？': 'Still Gathering the Details?',
  '可先发工件、产能或现有设备照片。':
    'Start with workpiece details, output requirements or photographs of existing equipment.',
  联系苏能工程师: 'Contact Suneng',
  '把项目情况发过来，先做一次工况初判': 'Share Your Project for an Initial Assessment',
  '提供工件、产量或现有设备情况，工程师协助核准关键参数。':
    'Share workpiece, output or existing-equipment information so the engineering team can clarify the key requirements.',
  提交项目参数: 'Send Project Requirements',
  提交工业炉项目参数: 'Industrial Furnace Project Requirements',
  '提供工件、产量、现有设备和场地信息，工程师会协助整理缺失参数。':
    'Provide workpiece, output, equipment and site details. The engineering team can help identify missing information.',
  '工业炉报价前需要准备哪些参数？': 'What information is needed for a furnace quotation?',
  '先统一工件、材质、工艺、产能、装卸、公用工程和供货边界，再比较不同厂家的方案。':
    'Agree the workpiece, material, process, output, handling, utilities and supply scope before comparing proposals.',
  '连续式热处理线和周期炉怎么选？':
    'How do I choose between a continuous line and a batch furnace?',
  '核心取决于产品稳定性、批量、换型频率、工艺节拍和上下游衔接条件。':
    'Compare product consistency, batch size, changeover frequency, process cycle and upstream and downstream interfaces.',
  '怎样判断厂家能否对整线负责？':
    'How do I assess a supplier’s responsibility for the complete line?',
  '核对其是否承担节拍、接口、安全、联调、验收和售后，而不只是提供单台炉子。':
    'Check responsibility for the cycle, interfaces, safety, integrated commissioning, acceptance and service, in addition to individual equipment supply.',
  '老旧工业炉应该大修还是更换？': 'Should an old furnace be overhauled or replaced?',
  '需要同时比较结构状态、温控能力、能耗、停产窗口、改造成本和剩余寿命。':
    'Compare structural condition, temperature control, energy use, the shutdown window, retrofit cost and remaining service life.',
};

export function newsUiText(locale: Locale, text: string) {
  return locale === 'en' ? (ENGLISH_NEWS_UI[text] ?? text) : text;
}
