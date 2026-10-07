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

/** Run after reviewed Chinese and fingerprint-checked English copy overlays. */
export function applyNewsReferenceCleanup(item: NewsApiItem): NewsApiItem {
  if (
    !APPROVED_ARTICLES[item.id] ||
    item.slug !== APPROVED_ARTICLES[item.id] ||
    item.status !== 'published' ||
    item.isPublished !== true ||
    !item.contentZh
  ) return item;

  const reference = item.id === 20
    ? `<p>完整案例可参考：</p><p>${WITHDRAWN_CASE_URL}</p>`
    : `<p>某不锈钢企业 1250mm 三线节能改造案例：${WITHDRAWN_CASE_URL}</p>`;
  // Match only the approved literal block; never rewrite a later CMS paragraph
  // with changed structure, wording, links or other editorial content.
  let contentZh = item.contentZh.replace(reference, '');
  // Only article 26's approved literal sentence points to the removed case.
  if (item.id === 26) contentZh = contentZh.replace(WITHDRAWN_CASE_GUIDANCE, '');
  return contentZh === item.contentZh ? item : { ...item, contentZh };
}
