import { apiPost } from '@/lib/api/client';

export type LeadEventType =
  | 'phone_click'
  | 'wechat_click'
  | 'wechat_qr_view'
  | 'wechat_copy'
  | 'quote_cta_click'
  | 'email_click'
  | 'douyin_click'
  | 'form_submit';

type LeadEventPayload = {
  eventType: LeadEventType;
  pageTitle?: string;
  pagePath?: string;
  pageType?: string;
  productTag?: string;
  sourceType?: string;
  searchKeyword?: string;
  deviceType?: string;
  landingPage?: string;
  previousPage?: string;
  sessionId?: string;
  visitorId?: string;
};

function getStoredId(key: string) {
  try {
    const current = window.localStorage.getItem(key);
    if (current) return current;
    const next =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    window.localStorage.setItem(key, next);
    return next;
  } catch {
    return undefined;
  }
}

function getLandingPage(path: string) {
  try {
    const current = window.sessionStorage.getItem('suneng_landing_page');
    if (current) return current;
    window.sessionStorage.setItem('suneng_landing_page', path);
    return path;
  } catch {
    return path;
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

function currentPayload(eventType: LeadEventType, extra: Partial<LeadEventPayload> = {}) {
  const path = `${window.location.pathname}${window.location.search}`;
  const title = document.title || undefined;
  return {
    eventType,
    pageTitle: title,
    pagePath: path,
    pageType: pageType(path),
    productTag: productTag(path, title || ''),
    sourceType: document.referrer ? '外部链接' : '直接访问',
    deviceType: window.matchMedia('(max-width: 767px)').matches ? '移动端' : 'PC',
    landingPage: getLandingPage(path),
    previousPage: document.referrer || undefined,
    sessionId: getStoredId('suneng_session_id'),
    visitorId: getStoredId('suneng_visitor_id'),
    ...extra,
  };
}

export function trackLeadEvent(eventType: LeadEventType, extra?: Partial<LeadEventPayload>) {
  if (typeof window === 'undefined') return;
  void apiPost<unknown, LeadEventPayload>('/v1/lead-events', {
    body: currentPayload(eventType, extra),
    cache: 'no-store',
  }).catch(() => undefined);
}
