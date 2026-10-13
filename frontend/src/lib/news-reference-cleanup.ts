import type { NewsApiItem } from '@/types/news';

// These nine Chinese reference blocks were approved for removal. Article 21
// deliberately stays out: its paragraph also contains a separate valid case.
const APPROVED_ARTICLES: Record<number, string> = {
  20: 'gong-ye-lu-jie-neng-gai-zao-zen-me-zuo-cong-ran-shao-xi-tong-lu-chen-fan-xin-dao-kong-zhi-xi-tong-sheng-ji',
  22: 're-chu-li-lu-da-xiu-chang-jia-zen-me-xuan-cong-lu-ti-jie-gou-kong-wen-xi-tong-dao-shou-hou-neng-li-de-pan-duan-biao-zhun',
  23: 'gong-ye-lu-gai-zao-yan-shou-kan-na-xie-zhi-biao-cong-wen-du-jun-yun-xing-neng-hao-dao-kong-zhi-xi-tong-wen-ding-xing',
  24: 're-chu-li-lu-jie-neng-gai-zao-duo-shao-qian-fei-yong-gou-cheng-yu-suan-ying-xiang-yin-su-he-xun-jia-qian-zhun-bei',
  25: 're-chu-li-lu-gai-zao-qian-xu-yao-zhun-bei-na-xie-zi-liao-yi-fen-gei-chang-jia-gou-tong-de-ping-gu-qing-dan',
  26: 'gong-ye-lu-jie-neng-gai-zao-zen-me-zuo-cong-lu-chen-bao-wen-kong-zhi-xi-tong-dao-yan-qi-yu-re-hui-shou',
  27: 'she-bei-ban-qian-ting-chan-chong-qi-er-shou-lu-zai-zhi-zao-gong-ye-lu-te-shu-chang-jing-gai-zao-zen-me-chu-li',
  29: 'jiang-su-re-chu-li-lu-chang-jia-na-jia-hao-xian-kan-dong-ni-de-gong-yi-zai-xuan-dui-chang-jia',
  30: 'jiang-su-gong-ye-lu-gai-zao-chang-jia-zen-me-xuan-an-gai-zao-lei-xing-dui-ying-kao-cha-bu-tong-neng-li',
};

const WITHDRAWN_CASE_URL = 'https://www.jssngyl.cn/zh/case/anonymous-tsingshan-1250-renovation';
const WITHDRAWN_CASE_GUIDANCE = '历史方案如何划分改造范围，以及能源测算有哪些条件，可参考某不锈钢企业的连续退火/退洗线节能改造案例（见文末）。';
const REVIEW_HANDOFF = '历史方案只能说明拟定改造范围与测算条件，不代表实际改造或验收结果。如需核验相关资料，请通过<a href="/zh/service/furnace-renovation-overhaul">维修与改造服务提交设备现状和工况</a>，联系确认是否有可披露内容及其核验范围；具体资料能否提供需另行确认。';
const CASE_PAGE_PROMISE = '具体项目情况可参考案例页。';
const CASE_PAGE_HANDOFF = '如需核验相关项目资料，可通过<a href="/zh/service/furnace-renovation-overhaul">维修与改造服务联系确认可披露内容和核验范围</a>；具体资料能否提供需另行确认。';
const EXTRA_COPY_ARTICLES: Record<number, string> = {
  37: 'jiang-su-gong-ye-lu-gai-zao-chang-jia-tui-jian-xian-cha-xian-zhuang-zai-tan-fang-an-he-xiao-guo',
  103: 'resistance-heating-element-power-surface-loading-life',
};
const OLD_PUBLIC_RETROFIT = '<p>江苏苏能工业炉有限公司官网公开了某不锈钢加工企业连续处理线节能改造案例。该案例可以用于理解官网公开的项目规格、阶段周期、系统方案、测算边界和验收方法。客户身份保持匿名，合同金额和未授权运行结果不进入本文。</p>';
const PUBLIC_RETROFIT_HANDOFF = '<p>本文提到的某不锈钢加工企业连续处理线改造资料，用于说明项目规格、阶段安排、方案和测算边界应怎样记录，不代表已公开完整项目文件或已完成验收。如需进一步核验，可通过<a href="/zh/service/furnace-renovation-overhaul">维修与改造服务联系苏能</a>，确认是否有可披露内容及其核验范围；具体资料能否提供需另行确认。客户身份保持匿名，合同金额和未授权运行结果不进入本文。</p>';
const OLD_POWER_SUMMARY = '不一定。总功率相同，只说明两套加热系统的额定电功率相同，不能证明电热元件承担的热负担、实际温度和使用寿命相同。';
const OLD_POWER_PARAGRAPH = `${OLD_POWER_SUMMARY}比较电阻炉方案时，还要看元件表面积、材料与规格、安装和散热条件，以及实际运行工况。`;
const POWER_ANSWER = '有关系，但不能只凭总功率判断电阻丝寿命。';
const OLD_POWER_OPENING = `<p>${OLD_POWER_PARAGRAPH}</p>`;

/** Run after reviewed Chinese and fingerprint-checked English copy overlays. */
export function applyNewsReferenceCleanup(item: NewsApiItem): NewsApiItem {
  if (
    !(APPROVED_ARTICLES[item.id] || EXTRA_COPY_ARTICLES[item.id]) ||
    item.slug !== (APPROVED_ARTICLES[item.id] || EXTRA_COPY_ARTICLES[item.id]) ||
    item.status !== 'published' ||
    item.isPublished !== true ||
    !item.contentZh
  ) return item;

  const reference = item.id === 20
    ? `<p>完整案例可参考：</p><p>${WITHDRAWN_CASE_URL}</p>`
    : `<p>某不锈钢企业 1250mm 三线节能改造案例：${WITHDRAWN_CASE_URL}</p>`;
  // Match only the approved literal block; never rewrite a later CMS paragraph
  // with changed structure, wording, links or other editorial content.
  let contentZh = APPROVED_ARTICLES[item.id] ? item.contentZh.replace(reference, '') : item.contentZh;
  // Only article 26's approved literal sentence points to the removed case.
  if (item.id === 26) contentZh = contentZh.replace(WITHDRAWN_CASE_GUIDANCE, '');
  if ([23, 24].includes(item.id)) contentZh = contentZh.replace(WITHDRAWN_CASE_GUIDANCE, REVIEW_HANDOFF);
  if ([29, 30].includes(item.id)) contentZh = contentZh.replace(CASE_PAGE_PROMISE, CASE_PAGE_HANDOFF);
  if (item.id === 37 && contentZh.includes(OLD_PUBLIC_RETROFIT)) {
    contentZh = contentZh
      .replace('<h2>一个公开改造案例能证明什么，不能证明什么？</h2>', '<h2>历史改造资料能说明什么，不能证明什么？</h2>')
      .replace(OLD_PUBLIC_RETROFIT, PUBLIC_RETROFIT_HANDOFF);
  }
  const powerOpeningMatches = item.id === 103 && contentZh.includes(OLD_POWER_OPENING);
  if (powerOpeningMatches) contentZh = contentZh.replace(OLD_POWER_OPENING, OLD_POWER_OPENING.replace('不一定。', POWER_ANSWER));
  const summaryZh = powerOpeningMatches && item.summaryZh
    && [OLD_POWER_SUMMARY, OLD_POWER_PARAGRAPH].includes(item.summaryZh)
    ? item.summaryZh.replace('不一定。', POWER_ANSWER) : item.summaryZh;
  const seoDescriptionZh = powerOpeningMatches && item.seoDescriptionZh
    && [OLD_POWER_SUMMARY, OLD_POWER_PARAGRAPH].includes(item.seoDescriptionZh)
    ? item.seoDescriptionZh.replace('不一定。', POWER_ANSWER) : item.seoDescriptionZh;
  return contentZh === item.contentZh && summaryZh === item.summaryZh && seoDescriptionZh === item.seoDescriptionZh
    ? item : { ...item, contentZh,
      ...(summaryZh !== item.summaryZh ? { summaryZh } : {}),
      ...(seoDescriptionZh !== item.seoDescriptionZh ? { seoDescriptionZh } : {}) };
}
