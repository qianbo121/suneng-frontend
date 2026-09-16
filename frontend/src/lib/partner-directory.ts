import partners from '@/constants/partners.json';

export type PartnerEntry = {
  id: string;
  name: string;
  shortName: string;
  logo?: string;
  description?: string;
  businessLabel?: string;
  website?: string;
  source: string;
  sourceRecordIds: number[];
  assetRecordIds?: number[];
  businessSource?: string;
  reviewNote?: string;
  industry?: string;
  industrySource?: string;
  provinceCode?: string;
  provinceName?: string;
  provinceVerified?: boolean;
  provinceSource?: string;
  verifiedAddress?: string;
  verifiedAt?: string;
};
export const PARTNERS: PartnerEntry[] = partners;
export const PARTNER_PAGE_SIZE = 8;
export function partnerPageHref(page: number, query = '') {
  const params = new URLSearchParams();
  if (query) params.set('q', query);
  if (page > 1) params.set('page', String(page));
  return `/zh/partner${params.size ? `?${params}` : ''}`;
}
export function getPartnerPage(rawQuery?: string | string[], rawPage?: string | string[]) {
  const query = (Array.isArray(rawQuery) ? rawQuery[0] : rawQuery || '').trim().slice(0, 120);
  const normalizedQuery = query.toLocaleLowerCase('zh-CN');
  const filtered = PARTNERS.filter((item) =>
    [item.name, item.shortName, item.description || '']
      .join(' ')
      .toLocaleLowerCase('zh-CN')
      .includes(normalizedQuery),
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PARTNER_PAGE_SIZE));
  const parsedPage = Number(Array.isArray(rawPage) ? rawPage[0] : rawPage || 1);
  const page = Math.min(totalPages, Math.max(1, Number.isSafeInteger(parsedPage) ? parsedPage : 1));
  return {
    query,
    page,
    totalPages,
    total: filtered.length,
    items: filtered.slice((page - 1) * PARTNER_PAGE_SIZE, page * PARTNER_PAGE_SIZE),
    href: partnerPageHref(page, query),
  };
}
