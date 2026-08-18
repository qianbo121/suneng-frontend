import { apiPost } from '@/lib/api/client';
import { classifyTrafficSource } from '@/lib/analytics/traffic-source';

export type LeadEventType =
  | 'page_view'
  | 'engaged_session'
  | 'phone_click'
  | 'wechat_click'
  | 'wechat_qr_view'
  | 'wechat_copy'
  | 'quote_cta_click'
  | 'email_click'
  | 'douyin_click'
  | 'form_start'
  | 'form_step_complete'
  | 'form_submit'
  | 'human_signal'
  | 'automation_signal';

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

const HIGH_INTENT_EVENTS = new Set<LeadEventType>([
  'phone_click',
  'wechat_click',
  'wechat_qr_view',
  'wechat_copy',
  'quote_cta_click',
  'email_click',
  'douyin_click',
]);

const ENGAGED_SESSION_KEY = 'suneng_engaged_session_recorded';
const SESSION_PAGE_PATHS_KEY = 'suneng_session_page_paths';
const SESSION_ID_KEY = 'suneng_session_id';
const SESSION_LAST_SEEN_KEY = 'suneng_session_last_seen';
const SESSION_TIMEOUT_MS = 30 * 60 * 1000;
// 访客性质信号：每个会话恰好发一条 human_signal 或 automation_signal。
// 背景（2026-08-18 实测）：伪装成正常浏览器的自动化流量会执行 JS，UA 过滤抓不到；
// 但它们要么带着 navigator.webdriver 标记，要么从不产生真实交互。这两个信号
// 让新数据从采集起就可判定，不再事后猜。只采集，不改变任何现有事件的语义。
const VISITOR_NATURE_KEY = 'suneng_visitor_nature_recorded';

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

function newAnonymousId() {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function getSessionId(storage: Storage) {
  try {
    const now = Date.now();
    const current = storage.getItem(SESSION_ID_KEY);
    const lastSeen = Number(storage.getItem(SESSION_LAST_SEEN_KEY));
    const expired =
      Number.isFinite(lastSeen) && lastSeen > 0 && now - lastSeen > SESSION_TIMEOUT_MS;
    if (!current || expired) {
      const next = newAnonymousId();
      storage.setItem(SESSION_ID_KEY, next);
      storage.removeItem(ENGAGED_SESSION_KEY);
      storage.removeItem(VISITOR_NATURE_KEY);
      storage.removeItem(SESSION_PAGE_PATHS_KEY);
      storage.removeItem('suneng_landing_page');
    }
    storage.setItem(SESSION_LAST_SEEN_KEY, String(now));
    return storage.getItem(SESSION_ID_KEY) || undefined;
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
    const limit =
      key === 'utm_campaign' ? LEAD_SOURCE_LIMITS.utmCampaign : LEAD_SOURCE_LIMITS.utmSource;
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
  if (/\/(?:zh|en)\/products\/detail\//.test(path)) return '产品页';
  if (/\/(?:zh|en)\/(?:solutions|service)\//.test(path)) return '解决方案页';
  if (/\/(?:zh|en)\/(?:articles|news)\//.test(path)) return '文章页';
  if (/\/(?:zh|en)\/case\//.test(path)) return '案例页';
  if (/\/(?:zh|en)\/contact/.test(path)) return '联系页';
  if (/\/(?:zh|en)\/about/.test(path)) return '关于页';
  if (/\/(?:zh|en)\/?$/.test(path)) return '首页';
  return '其他页';
}

function productTag(path: string, title: string) {
  const text = `${path} ${title}`.toLowerCase();
  const rules: Array<[string, string[]]> = [
    [
      '连续热处理生产线',
      ['continuous', 'heat-treatment-line', '生产线', '连续', '退火线', '热处理线'],
    ],
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
  return (
    rules.find(([, keywords]) => keywords.some((keyword) => text.includes(keyword)))?.[0] ?? '其他'
  );
}

export function buildLeadSourceSnapshot(
  extra: Partial<LeadSourceSnapshot> = {},
): LeadSourceSnapshot {
  const path = `${window.location.pathname}${window.location.search}`;
  const title = document.title || undefined;
  const sessionId = getSessionId(window.sessionStorage);
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
    sessionId,
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

function postLeadEvent(eventType: LeadEventType, extra?: Partial<LeadSourceSnapshot>) {
  void apiPost<unknown, LeadEventPayload>('/v1/lead-events', {
    body: currentPayload(eventType, extra),
    cache: 'no-store',
  }).catch(() => undefined);
}

export function markEngagedSession(extra?: Partial<LeadSourceSnapshot>) {
  if (typeof window === 'undefined') return;
  try {
    if (window.sessionStorage.getItem(ENGAGED_SESSION_KEY) === '1') return;
    window.sessionStorage.setItem(ENGAGED_SESSION_KEY, '1');
  } catch {
    return;
  }
  postLeadEvent('engaged_session', extra);
}

const NATURE_INTERACTION_EVENTS = ['pointermove', 'scroll', 'touchstart', 'keydown'] as const;

export function installVisitorNatureTracking() {
  if (typeof window === 'undefined') return;
  try {
    // 必须先立会话再设标记：postLeadEvent 内部会触发会话初始化/轮换，
    // 轮换会清掉 VISITOR_NATURE_KEY——顺序反了信号就退化成"每次刷新一条"。
    getSessionId(window.sessionStorage);
    if (window.sessionStorage.getItem(VISITOR_NATURE_KEY) === '1') return;
  } catch {
    return;
  }
  // 自动化工具（Puppeteer/Selenium/无头浏览器）默认带 webdriver 标记，伪装 UA 藏不住它。
  if (typeof navigator !== 'undefined' && navigator.webdriver === true) {
    try {
      window.sessionStorage.setItem(VISITOR_NATURE_KEY, '1');
    } catch {
      return;
    }
    postLeadEvent('automation_signal');
    return;
  }
  const onFirstInteraction = (event: Event) => {
    // 页面脚本合成的事件 isTrusted=false，不算人。
    if (!event.isTrusted) return;
    for (const name of NATURE_INTERACTION_EVENTS) {
      window.removeEventListener(name, onFirstInteraction, true);
    }
    try {
      getSessionId(window.sessionStorage);
      if (window.sessionStorage.getItem(VISITOR_NATURE_KEY) === '1') return;
      window.sessionStorage.setItem(VISITOR_NATURE_KEY, '1');
    } catch {
      return;
    }
    postLeadEvent('human_signal');
  };
  for (const name of NATURE_INTERACTION_EVENTS) {
    window.addEventListener(name, onFirstInteraction, { capture: true, passive: true });
  }
}

export function trackPageView() {
  if (typeof window === 'undefined') return;
  const safePath = sanitizeLeadPagePath(`${window.location.pathname}${window.location.search}`);
  postLeadEvent('page_view');
  try {
    const stored = JSON.parse(window.sessionStorage.getItem(SESSION_PAGE_PATHS_KEY) || '[]');
    const paths = Array.isArray(stored)
      ? stored.filter((value): value is string => typeof value === 'string').slice(-20)
      : [];
    if (!paths.includes(safePath)) paths.push(safePath);
    window.sessionStorage.setItem(SESSION_PAGE_PATHS_KEY, JSON.stringify(paths));
    if (paths.length >= 2) markEngagedSession();
  } catch {
    // Page-view recording must never interrupt website use when storage is unavailable.
  }
}

export function trackLeadEvent(eventType: LeadEventType, extra?: Partial<LeadSourceSnapshot>) {
  if (typeof window === 'undefined') return;
  postLeadEvent(eventType, extra);
  if (HIGH_INTENT_EVENTS.has(eventType)) markEngagedSession(extra);
}
