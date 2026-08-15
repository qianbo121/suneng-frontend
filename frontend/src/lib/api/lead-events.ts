import { apiPost } from '@/lib/api/client';
import { classifyTrafficSource } from '@/lib/analytics/traffic-source';

export type LeadEventType =
  | 'phone_click'
  | 'wechat_click'
  | 'wechat_qr_view'
  | 'wechat_copy'
  | 'quote_cta_click'
  | 'email_click'
  | 'douyin_click'
  | 'form_start'
  | 'form_step_complete'
  | 'form_submit';

export type LeadSourceSnapshot = {
  pageTitle?: string;
  pagePath?: string;
  pageType?: string;
  productTag?: string;
  sourceType?: string;
  sourceDetail?: string;
  searchKeyword?: string;
  deviceType?: string;
  landingPage?: string;
  previousPage?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  discoverySource?: string;
  sessionId?: string;
  visitorId?: string;
};

const LEAD_SOURCE_LIMITS: Record<keyof LeadSourceSnapshot, number> = {
  pageTitle: 255,
  pagePath: 500,
  pageType: 80,
  productTag: 120,
  sourceType: 120,
  sourceDetail: 120,
  searchKeyword: 255,
  deviceType: 40,
  landingPage: 500,
  previousPage: 500,
  utmSource: 120,
  utmMedium: 120,
  utmCampaign: 255,
  discoverySource: 120,
  sessionId: 120,
  visitorId: 120,
};

type LeadEventPayload = LeadSourceSnapshot & {
  eventType: LeadEventType;
};

function boundedSourceValue(value: string | undefined, limit: number) {
  const normalized = value?.trim();
  return normalized ? normalized.slice(0, limit) : undefined;
}

export function sanitizeLeadSourceSnapshot(snapshot: LeadSourceSnapshot): LeadSourceSnapshot {
  return Object.fromEntries(
    Object.entries(LEAD_SOURCE_LIMITS).flatMap(([key, limit]) => {
      const value = boundedSourceValue(snapshot[key as keyof LeadSourceSnapshot], limit);
      return value ? [[key, value]] : [];
    }),
  ) as LeadSourceSnapshot;
}

function getStoredId(key: string, storage: Storage) {
  try {
    const current = storage.getItem(key);
    if (current) return current;
    const next =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    storage.setItem(key, next);
    return next;
  } catch {
    return undefined;
  }
}

export function sanitizeLeadPagePath(path: string) {
  const [pathWithoutHash = ''] = path.split('#', 1);
  const [pathname, query = ''] = pathWithoutHash.split('?', 2);
  const source = new URLSearchParams(query);
  const retained = new URLSearchParams();
  for (const key of ['utm_source', 'utm_medium', 'utm_campaign']) {
    const value = source.get(key)?.trim();
    const limit = key === 'utm_campaign' ? LEAD_SOURCE_LIMITS.utmCampaign : LEAD_SOURCE_LIMITS.utmSource;
    if (value) retained.set(key, value.slice(0, limit));
  }
  const retainedQuery = retained.toString();
  return (retainedQuery ? `${pathname}?${retainedQuery}` : pathname).slice(
    0,
    LEAD_SOURCE_LIMITS.pagePath,
  );
}

export function sanitizeLeadReferrer(referrer: string) {
  if (!referrer) return undefined;
  try {
    const url = new URL(referrer);
    return `${url.origin}${url.pathname}`.slice(0, LEAD_SOURCE_LIMITS.previousPage);
  } catch {
    return undefined;
  }
}

function getLandingPage(path: string) {
  const safePath = sanitizeLeadPagePath(path);
  try {
    const current = window.sessionStorage.getItem('suneng_landing_page');
    if (current) {
      const sanitizedCurrent = sanitizeLeadPagePath(current);
      if (sanitizedCurrent !== current) {
        window.sessionStorage.setItem('suneng_landing_page', sanitizedCurrent);
      }
      return sanitizedCurrent;
    }
    window.sessionStorage.setItem('suneng_landing_page', safePath);
    return safePath;
  } catch {
    return safePath;
  }
}

function campaignParams(path: string) {
  try {
    const query = path.includes('?') ? path.slice(path.indexOf('?')) : '';
    const params = new URLSearchParams(query);
    return {
      utmSource: params.get('utm_source')?.trim() || undefined,
      utmMedium: params.get('utm_medium')?.trim() || undefined,
      utmCampaign: params.get('utm_campaign')?.trim() || undefined,
    };
  } catch {
    return {};
  }
}

function pageType(path: string) {
  if (/\/(?:zh|en)\/products\//.test(path)) return '产品页';
  if (/\/(?:zh|en)\/service\//.test(path)) return '服务页';
  if (/\/(?:zh|en)\/articles\//.test(path)) return '资料文章';
  if (/\/(?:zh|en)\/case\//.test(path)) return '案例页';
  if (/\/(?:zh|en)\/contact/.test(path)) return '联系页';
  if (/\/(?:zh|en)\/about/.test(path)) return '关于页';
  if (/\/(?:zh|en)\/?$/.test(path)) return '首页';
  return '其他';
}

function productTag(path: string, title: string) {
  const text = `${path} ${title}`.toLowerCase();
  const rules: Array<[string, string[]]> = [
    ['连续热处理生产线', ['continuous', 'heat-treatment-line', '生产线', '连续', '退火线', '热处理线']],
    ['工业炉改造', ['renovation', 'overhaul', '改造', '大修', '维修', '节能']],
    ['报价参数', ['baojia', 'quote', 'price', 'canshu', '报价', '参数', '价格']],
    ['台车炉', ['trolley', '台车']],
    ['箱式炉', ['box', '箱式']],
    ['井式炉', ['well', '井式']],
    ['罩式炉', ['bell', '罩式']],
    ['网带炉', ['mesh-belt', '网带']],
    ['推杆炉', ['pusher', '推杆']],
    ['辊底炉', ['roller', '辊底']],
    ['转底炉', ['rotary', '转底']],
  ];
  return rules.find(([, keywords]) => keywords.some((keyword) => text.includes(keyword)))?.[0] ?? '其他';
}

export function buildLeadSourceSnapshot(extra: Partial<LeadSourceSnapshot> = {}): LeadSourceSnapshot {
  const path = `${window.location.pathname}${window.location.search}`;
  const title = document.title || undefined;
  const landingPage = getLandingPage(path);
  const campaign = campaignParams(landingPage);
  const trafficSource = classifyTrafficSource(document.referrer, campaign.utmSource);
  return sanitizeLeadSourceSnapshot({
    pageTitle: title,
    pagePath: sanitizeLeadPagePath(path),
    pageType: pageType(path),
    productTag: productTag(path, title || ''),
    sourceType: trafficSource.sourceType,
    sourceDetail: trafficSource.sourceDetail,
    deviceType: window.matchMedia('(max-width: 767px)').matches ? '移动端' : 'PC',
    landingPage,
    previousPage: sanitizeLeadReferrer(document.referrer),
    ...campaign,
    sessionId: getStoredId('suneng_session_id', window.sessionStorage),
    visitorId: getStoredId('suneng_visitor_id', window.localStorage),
    ...extra,
  });
}

function currentPayload(eventType: LeadEventType, extra: Partial<LeadSourceSnapshot> = {}) {
  return {
    eventType,
    ...buildLeadSourceSnapshot(extra),
  };
}

export function trackLeadEvent(eventType: LeadEventType, extra?: Partial<LeadSourceSnapshot>) {
  if (typeof window === 'undefined') return;
  void apiPost<unknown, LeadEventPayload>('/v1/lead-events', {
    body: currentPayload(eventType, extra),
    cache: 'no-store',
  }).catch(() => undefined);
}
