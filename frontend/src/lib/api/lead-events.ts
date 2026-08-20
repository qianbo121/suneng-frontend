import { apiPost } from '@/lib/api/client';
import { classifyTrafficSource } from '@/lib/analytics/traffic-source';

export type LeadEventType =
  | 'page_view'
  | 'engaged_session'
  | 'dwell_5s'
  | 'dwell_20s'
  | 'dwell_60s'
  | 'dwell_180s'
  | 'phone_click'
  | 'wechat_click'
  | 'wechat_qr_view'
  | 'quote_cta_click'
  | 'email_click'
  | 'form_start'
  | 'form_step_complete'
  | 'human_signal'
  | 'effective_interaction'
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
  'quote_cta_click',
  'email_click',
]);

const ENGAGED_SESSION_KEY = 'suneng_engaged_session_recorded';
const SESSION_PAGE_PATHS_KEY = 'suneng_session_page_paths';
const SESSION_ID_KEY = 'suneng_session_id';
const SESSION_LAST_SEEN_KEY = 'suneng_session_last_seen';
const SESSION_TIMEOUT_MS = 30 * 60 * 1000;
const DWELL_SECONDS_KEY = 'suneng_dwell_seconds';
const DWELL_MILESTONE_KEY = 'suneng_dwell_milestone';
let dwellMilestoneInFlight = false;
let dwellRequestGeneration = 0;
let engagedSessionInFlight = false;
// 有效交互信号：只记录真实滑动或点击。最终的“有效访问”还需要
// 同一次访问累计前台停留 20 秒，由服务端合并两个事实判定。
// 使用新键，避免旧版的 pointermove 信号被误当成新口径。
const EFFECTIVE_INTERACTION_KEY = 'suneng_effective_interaction_recorded_v1';
const AUTOMATION_SIGNAL_KEY = 'suneng_automation_signal_recorded_v1';
let effectiveInteractionInFlight = false;
let automationSignalInFlight = false;

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
      storage.removeItem(EFFECTIVE_INTERACTION_KEY);
      storage.removeItem(AUTOMATION_SIGNAL_KEY);
      storage.removeItem(SESSION_PAGE_PATHS_KEY);
      storage.removeItem('suneng_landing_page');
      storage.removeItem(DWELL_SECONDS_KEY);
      storage.removeItem(DWELL_MILESTONE_KEY);
      // 旧会话尚未返回的埋点不得在新会话里确认里程碑。
      dwellRequestGeneration += 1;
      dwellMilestoneInFlight = false;
      engagedSessionInFlight = false;
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
  return apiPost<unknown, LeadEventPayload>('/v1/lead-events', {
    body: currentPayload(eventType, extra),
    cache: 'no-store',
  }).then(
    () => true,
    () => false,
  );
}

export function markEngagedSession(extra?: Partial<LeadSourceSnapshot>) {
  if (typeof window === 'undefined') return;
  try {
    if (window.sessionStorage.getItem(ENGAGED_SESSION_KEY) === '1' || engagedSessionInFlight)
      return;
  } catch {
    return;
  }
  engagedSessionInFlight = true;
  const generation = dwellRequestGeneration;
  void postLeadEvent('engaged_session', extra).then((accepted) => {
    if (generation !== dwellRequestGeneration) return;
    engagedSessionInFlight = false;
    if (!accepted) return;
    try {
      window.sessionStorage.setItem(ENGAGED_SESSION_KEY, '1');
    } catch {
      // 写标记失败只会导致以后再上报一次，宁可重复去重，也不能把失败冒充成已采集。
    }
  });
}

// ===== 停留时长 =====
// 计时从「进入官网」开始，跨页面累计，不是每进一个页面重新计。
// 累计专注满这么多秒就算「有实际阅读」。
const ENGAGED_SECONDS = 20;

// 里程碑写进事件名，不必给事件表加数字字段，还能直接吃 (eventType, createdAt) 索引。
const DWELL_MILESTONES = [
  { seconds: 5, event: 'dwell_5s' },
  { seconds: 20, event: 'dwell_20s' },
  { seconds: 60, event: 'dwell_60s' },
  { seconds: 180, event: 'dwell_180s' },
] as const satisfies ReadonlyArray<{ seconds: number; event: LeadEventType }>;

function readDwellCounter(key: string) {
  try {
    const value = Number(window.sessionStorage.getItem(key));
    return Number.isFinite(value) && value > 0 ? value : 0;
  } catch {
    return 0;
  }
}

function writeDwellCounter(key: string, value: number) {
  try {
    window.sessionStorage.setItem(key, String(value));
  } catch {
    // sessionStorage 不可用时退化成「本次页面内计时」，不影响页面本身。
  }
}

/** 每满一秒调一次。导出仅为可测，页面代码请用 startDwellTracking。 */
export function tickDwell() {
  // 只累计「页面可见且窗口有焦点」的秒数：无头浏览器默认拿不到焦点，
  // 停留时长因此成为少数几个伪装成本很高的信号。
  if (document.visibilityState !== 'visible' || !document.hasFocus()) return;

  // 先建立/轮换会话再加秒数。否则第一个里程碑组装请求时才建会话，
  // 会把刚累计的停留数误当成上一个会话清掉。
  getSessionId(window.sessionStorage);

  const activeSeconds = readDwellCounter(DWELL_SECONDS_KEY) + 1;
  writeDwellCounter(DWELL_SECONDS_KEY, activeSeconds);

  flushDwellMilestones();

  if (activeSeconds >= ENGAGED_SECONDS) markEngagedSession();
}

function flushDwellMilestones() {
  if (dwellMilestoneInFlight) return;
  const nextMilestone = readDwellCounter(DWELL_MILESTONE_KEY);
  const milestone = DWELL_MILESTONES[nextMilestone];
  if (!milestone || readDwellCounter(DWELL_SECONDS_KEY) < milestone.seconds) return;

  dwellMilestoneInFlight = true;
  const generation = dwellRequestGeneration;
  void postLeadEvent(milestone.event).then((accepted) => {
    // 请求期间如果已经换了会话，旧响应不能污染新会话。
    if (generation !== dwellRequestGeneration) return;
    dwellMilestoneInFlight = false;
    if (!accepted) return; // 下一秒继续重试，不把上报失败冒充成已采集。
    writeDwellCounter(DWELL_MILESTONE_KEY, nextMilestone + 1);
    // 页面卡顿后可能一次跨过多个刻度，成功后顺序补齐，保证数学上单调。
    flushDwellMilestones();
  });
}

/** 开始计时，返回停表函数。跨页面接着上次的秒数走。 */
export function startDwellTracking() {
  if (typeof window === 'undefined') return () => undefined;
  const timer = window.setInterval(tickDwell, 1000);
  return () => window.clearInterval(timer);
}

const EFFECTIVE_INTERACTION_EVENTS = ['scroll', 'click'] as const;

export function installVisitorNatureTracking() {
  if (typeof window === 'undefined') return;
  try {
    // 必须先立会话再读标记：postLeadEvent 内部会触发会话初始化/轮换。
    getSessionId(window.sessionStorage);
  } catch {
    return;
  }
  // 默认自动化浏览器单独标记，不安装有效交互监听。
  if (typeof navigator !== 'undefined' && navigator.webdriver === true) {
    try {
      if (
        window.sessionStorage.getItem(AUTOMATION_SIGNAL_KEY) === '1' ||
        automationSignalInFlight
      ) {
        return;
      }
    } catch {
      return;
    }
    automationSignalInFlight = true;
    const generation = dwellRequestGeneration;
    void postLeadEvent('automation_signal').then((accepted) => {
      automationSignalInFlight = false;
      if (generation !== dwellRequestGeneration) return;
      if (!accepted) return;
      try {
        window.sessionStorage.setItem(AUTOMATION_SIGNAL_KEY, '1');
      } catch {
        // 写标记失败可能多上报一次，服务端依然按会话去重。
      }
    });
    return;
  }
  const onFirstInteraction = (event: Event) => {
    // 页面脚本合成的事件 isTrusted=false，不算有效交互。
    if (!event.isTrusted || effectiveInteractionInFlight) return;
    try {
      getSessionId(window.sessionStorage);
      if (window.sessionStorage.getItem(EFFECTIVE_INTERACTION_KEY) === '1') return;
    } catch {
      return;
    }
    effectiveInteractionInFlight = true;
    const generation = dwellRequestGeneration;
    void postLeadEvent('effective_interaction').then((accepted) => {
      effectiveInteractionInFlight = false;
      if (generation !== dwellRequestGeneration) return;
      if (!accepted) return; // 保留监听，下一次真实滑动/点击继续重试。
      try {
        window.sessionStorage.setItem(EFFECTIVE_INTERACTION_KEY, '1');
      } catch {
        // 写标记失败时不假装成已记录。
        return;
      }
      for (const name of EFFECTIVE_INTERACTION_EVENTS) {
        window.removeEventListener(name, onFirstInteraction, true);
      }
    });
  };
  try {
    if (window.sessionStorage.getItem(EFFECTIVE_INTERACTION_KEY) === '1') return;
  } catch {
    return;
  }
  for (const name of EFFECTIVE_INTERACTION_EVENTS) {
    window.addEventListener(name, onFirstInteraction, { capture: true, passive: true });
  }
}

export function trackPageView() {
  if (typeof window === 'undefined') return;
  const safePath = sanitizeLeadPagePath(`${window.location.pathname}${window.location.search}`);
  void postLeadEvent('page_view');
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
  void postLeadEvent(eventType, extra);
  if (HIGH_INTENT_EVENTS.has(eventType)) markEngagedSession(extra);
}
