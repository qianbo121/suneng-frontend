import type { NewsApiItem } from '@/types/news';
import { FASTENER_CASE_PATH, fastenerCaseVisible } from './cases/fastener-case-entry';

const sourceDigest = 'd4ab145fab7dc4353341fcfb61aa7bee6574a6ad18212bea74f2a594f4ae9863';
const insertionPoint = '<h2>先把两道约束放在一起</h2>';
export function canLinkFastenerCase(item: Partial<Pick<NewsApiItem, 'slug' | 'status' | 'isPublished'>>) {
  return item.slug === 'mesh-belt-carburizing-throughput-process-limits'
    && item.status === 'published' && item.isPublished !== false && fastenerCaseVisible();
}

export async function addFastenerCaseLink(item: NewsApiItem): Promise<NewsApiItem> {
  if (!canLinkFastenerCase(item) || !item.contentZh) return item;
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(item.contentZh));
  const hex = Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, '0')).join('');
  if (hex !== sourceDigest || !item.contentZh.includes(insertionPoint)) return item;
  const paragraph = `<p>同一台炉，工艺不同，约定产量也不同：苏能 RCWT-160/105-9/6 网带炉的技术协议分别约定淬火300 kg/h、渗碳150 kg/h；实际产量随工件、装料和工艺条件变化，协议未注明150 kg/h对应的渗层深度，详见<a href="${FASTENER_CASE_PATH}">紧固件网带炉项目：淬火与渗碳各约定多少产量？</a>。</p>\n`;
  return { ...item, contentZh: item.contentZh.replace(insertionPoint, paragraph + insertionPoint) };
}
