import { apiPost } from '@/lib/api/client';
import { classifyTrafficSource } from '@/lib/analytics/traffic-source';
import { isLocalPreviewHostname } from '@/lib/analytics/local-preview';
import { getBrowserStorage } from '@/lib/browser-storage';
import { createCollectionOutbox } from '@/lib/analytics/collection-outbox';

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
  | 'contact_action'
  | 'form_start'
  | 'form_step_complete'
  | 'form_attempt'
  | 'form_error'
  | 'module_view'
  | 'category_select'
  | 'workpiece_select'
  | 'purpose_select'
  | 'search_match'
  | 'search_nomatch'
  | 'cta_click'
  | 'form_success'
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

export type LeadEventProperties = Record<string, string | number | boolean | null>;
type LeadEventExtra = Partial<LeadSourceSnapshot> & { properties?: LeadEventProperties };

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
  properties?: LeadEventProperties;
};

// These facts contain bounded attribution/evidence, never form contents.
const RECOVERABLE_EVENTS = new Set<LeadEventType>([
  'page_view',
  'dwell_5s',
  'dwell_20s',
  'dwell_60s',
  'dwell_180s',
  'engaged_session',
  'effective_interaction',
  'human_signal',
  'automation_signal',
]);

const HIGH_INTENT_EVENTS = new Set<LeadEventType>([
  'phone_click',
  'wechat_click',
  'wechat_qr_view',
  'quote_cta_click',
  'email_click',
  'cta_click',
]);

const SESSION_FACT_PREFIX = 'suneng_session_fact_v1:';
const ENGAGED_SESSION_KEY = 'suneng_engaged_session_recorded';
const SESSION_PAGE_PATHS_KEY = 'suneng_session_page_paths';
const SESSION_ID_KEY = 'suneng_session_id';
const SESSION_LAST_SEEN_KEY = 'suneng_session_last_seen';
const SESSION_SOURCE_KEY = 'suneng_session_traffic_source';
const SESSION_PAGE_VIEW_KEY = 'suneng_session_page_view_started_v1';
const MANUAL_QA_SESSION_KEY = 'suneng_manual_qa_session_v1';
// Registration is explicit and local to this browser; website/admin login is not evidence.
export const INTERNAL_TRAFFIC_BROWSER_KEY = 'suneng_internal_traffic_browser_v1';
const INTERNAL_TRAFFIC_SESSION_KEY = 'suneng_internal_traffic_session_v1';
// Only booleans and the anonymous session association are retained, never the URL token.
const manualQaByWindow = new WeakMap<object, { active: boolean; lastSeen: number }>();
const manualQaBySnapshot = new WeakMap<LeadSourceSnapshot, boolean>();
const internalTrafficBySnapshot = new WeakMap<LeadSourceSnapshot, boolean>();
const SESSION_TIMEOUT_MS = 30 * 60 * 1000;
const DWELL_SECONDS_KEY = 'suneng_dwell_seconds';
const DWELL_MILESTONE_KEY = 'suneng_dwell_milestone';
let dwellMilestoneInFlight = false;
let dwellRequestGeneration = 0;
let pendingDwellPayload:
  | { generation: number; milestone: number; payload: LeadEventPayload }
  | undefined;
let engagedSessionInFlight = false;
// 保留旧版“滑动或点击”的保护口径供并行比较。可信滚动也可能来自页面代码，
// 新证据把它单列为弱信号；输入动作更强，但同样不能单独证明是真人。
const EFFECTIVE_INTERACTION_KEY = 'suneng_effective_interaction_recorded_v1';
const STRONG_INPUT_KEY = 'suneng_strong_input_recorded_v1';
const AUTOMATION_SIGNAL_KEY = 'suneng_automation_signal_recorded_v1';
let effectiveInteractionInFlight = false;
let strongInputInFlight = false;
let pendingStrongInputPayload: { generation: number; payload: LeadEventPayload } | undefined;
let automationSignalInFlight = false;
let lastTrackedPagePath: string | undefined;

type TrackingStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;
let trackingWindow: Window | undefined;
let collectionOutbox: ReturnType<typeof createCollectionOutbox<LeadEventPayload>> | undefined;
let sessionStorageFallback: TrackingStorage;
let localStorageFallback: TrackingStorage;
let natureTrackingInstalled = false;
let natureTrackingCleanup: (() => void) | undefined;
let dwellTimer: number | undefined;
const PAGE_VIEW_RETRY_DELAYS_MS = [1000, 3000] as const;
const pendingRetriedEvents = new Set<{ timer?: number; owner: Window; cancel: () => void }>();

// 内存保留本页面已读/已写的值。某个键写入失败后，不能再读浏览器里旧的值。
function createTrackingStorage(name: 'sessionStorage' | 'localStorage'): TrackingStorage {
  const values = new Map<string, string | null>();
  const memoryOnlyKeys = new Set<string>();
  return {
    getItem(key) {
      if (memoryOnlyKeys.has(key)) {
        const value = values.get(key) ?? null;
        try {
          const storage = getBrowserStorage(name);
          if (storage) {
            if (value === null) storage.removeItem(key);
            else storage.setItem(key, value);
            memoryOnlyKeys.delete(key);
          }
        } catch {
          // 恢复前继续使用内存；不能把浏览器里尚未清理的旧值读回来。
        }
        return value;
      }
      if (!memoryOnlyKeys.has(key)) {
        try {
          const storage = getBrowserStorage(name);
          if (storage) {
            const value = storage.getItem(key);
            values.set(key, value);
            return value;
          }
        } catch {
          // 读失败时继续使用本页面最后已知的值。
        }
      }
      return values.get(key) ?? null;
    },
    setItem(key, value) {
      values.set(key, value);
      try {
        const storage = getBrowserStorage(name);
        if (!storage) throw new Error('Storage unavailable');
        storage.setItem(key, value);
        memoryOnlyKeys.delete(key);
      } catch {
        memoryOnlyKeys.add(key);
      }
    },
    removeItem(key) {
      values.set(key, null);
      try {
        const storage = getBrowserStorage(name);
        if (!storage) throw new Error('Storage unavailable');
        storage.removeItem(key);
        memoryOnlyKeys.delete(key);
      } catch {
        memoryOnlyKeys.add(key);
      }
    },
  };
}

function cancelEventRetries() {
  for (const request of pendingRetriedEvents) request.cancel();
}

function trackingStorage(name: 'sessionStorage' | 'localStorage') {
  if (trackingWindow !== window) {
    collectionOutbox?.dispose();
    collectionOutbox = undefined;
    trackingWindow = window;
    sessionStorageFallback = createTrackingStorage('sessionStorage');
    localStorageFallback = createTrackingStorage('localStorage');
    dwellRequestGeneration += 1;
    dwellMilestoneInFlight = false;
    pendingDwellPayload = undefined;
    engagedSessionInFlight = false;
    effectiveInteractionInFlight = false;
    strongInputInFlight = false;
    pendingStrongInputPayload = undefined;
    automationSignalInFlight = false;
    lastTrackedPagePath = undefined;
    natureTrackingInstalled = false;
    natureTrackingCleanup = undefined;
    dwellTimer = undefined;
    cancelEventRetries();
  }
  return name === 'sessionStorage' ? sessionStorageFallback : localStorageFallback;
}

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

function getStoredId(key: string, storage: TrackingStorage) {
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

function hasManualQaToken() {
  const tokens = new URLSearchParams(window.location.search).getAll('acquisition_qa');
  return tokens.length === 1 && /^[A-Za-z0-9_-]{1,80}$/.test(tokens[0]);
}

function isRegisteredInternalBrowser() {
  return trackingStorage('localStorage').getItem(INTERNAL_TRAFFIC_BROWSER_KEY) === '1';
}

/** Opt in/out only after confirming this browser is used for internal browsing. */
export function setInternalTrafficBrowser(enabled: boolean) {
  if (typeof window === 'undefined') return false;
  // A denied storage write must not be reported as a persistent registration.
  const storage = getBrowserStorage('localStorage');
  if (!storage) return false;
  try {
    if (enabled) storage.setItem(INTERNAL_TRAFFIC_BROWSER_KEY, '1');
    else storage.removeItem(INTERNAL_TRAFFIC_BROWSER_KEY);
    if ((storage.getItem(INTERNAL_TRAFFIC_BROWSER_KEY) === '1') !== enabled) return false;
    trackingStorage('localStorage').getItem(INTERNAL_TRAFFIC_BROWSER_KEY);
    getSessionId(trackingStorage('sessionStorage'));
    return true;
  } catch {
    return false;
  }
}

function rememberManualQa(active: boolean, now: number) {
  manualQaByWindow.set(window, { active, lastSeen: now });
}

function fallbackSession(now: number, requested: boolean) {
  const previous = manualQaByWindow.get(window);
  const stillActive = previous && now - previous.lastSeen <= SESSION_TIMEOUT_MS;
  rememberManualQa(requested || Boolean(stillActive && previous.active), now);
  // Memory survives client navigation, but cannot survive a full reload when storage is denied.
  return undefined;
}

function resetSessionState(storage: TrackingStorage) {
  for (const type of RECOVERABLE_EVENTS) storage.removeItem(SESSION_FACT_PREFIX + type);
  storage.removeItem(ENGAGED_SESSION_KEY);
  storage.removeItem(EFFECTIVE_INTERACTION_KEY);
  storage.removeItem(STRONG_INPUT_KEY);
  storage.removeItem(SESSION_PAGE_VIEW_KEY);
  storage.removeItem(AUTOMATION_SIGNAL_KEY);
  storage.removeItem(SESSION_PAGE_PATHS_KEY);
  storage.removeItem(SESSION_SOURCE_KEY);
  storage.removeItem(MANUAL_QA_SESSION_KEY);
  storage.removeItem(INTERNAL_TRAFFIC_SESSION_KEY);
  storage.removeItem('suneng_landing_page');
  storage.removeItem(DWELL_SECONDS_KEY);
  storage.removeItem(DWELL_MILESTONE_KEY);
  // In-flight acknowledgements for an old visit cannot confirm a new visit's milestones.
  dwellRequestGeneration += 1;
  dwellMilestoneInFlight = false;
  pendingDwellPayload = undefined;
  engagedSessionInFlight = false;
  effectiveInteractionInFlight = false;
  strongInputInFlight = false;
  pendingStrongInputPayload = undefined;
  automationSignalInFlight = false;
  cancelEventRetries();
}

function getSessionId(storage: TrackingStorage) {
  const now = Date.now();
  const remembered = manualQaByWindow.get(window);
  const requested =
    hasManualQaToken() ||
    Boolean(remembered?.active && now - remembered.lastSeen <= SESSION_TIMEOUT_MS);
  try {
    const current = storage.getItem(SESSION_ID_KEY);
    const lastSeen = Number(storage.getItem(SESSION_LAST_SEEN_KEY));
    const expired =
      Number.isFinite(lastSeen) && lastSeen > 0 && now - lastSeen > SESSION_TIMEOUT_MS;
    const currentQa = Boolean(current && storage.getItem(MANUAL_QA_SESSION_KEY) === current);
    const internal = isRegisteredInternalBrowser();
    const currentInternal = Boolean(
      current && storage.getItem(INTERNAL_TRAFFIC_SESSION_KEY) === current,
    );
    const changingInternal = Boolean(current && !expired && internal !== currentInternal);
    const enteringQa = Boolean(current && !expired && requested && !currentQa);
    const rotated = !current || expired || enteringQa || changingInternal;
    if (rotated) {
      // Changing QA/internal classification splits a visit without changing its entry facts.
      const preserveEntry = enteringQa || changingInternal;
      const previousSource = preserveEntry ? storage.getItem(SESSION_SOURCE_KEY) : null;
      const previousLanding = preserveEntry ? storage.getItem('suneng_landing_page') : null;
      const next = newAnonymousId();
      storage.setItem(SESSION_ID_KEY, next);
      resetSessionState(storage);
      if (previousSource) storage.setItem(SESSION_SOURCE_KEY, previousSource);
      if (previousLanding) storage.setItem('suneng_landing_page', previousLanding);
      if (requested) storage.setItem(MANUAL_QA_SESSION_KEY, next);
      if (internal) storage.setItem(INTERNAL_TRAFFIC_SESSION_KEY, next);
    }
    storage.setItem(SESSION_LAST_SEEN_KEY, String(now));
    const sessionId = storage.getItem(SESSION_ID_KEY) || undefined;
    rememberManualQa(
      Boolean(sessionId && storage.getItem(MANUAL_QA_SESSION_KEY) === sessionId),
      now,
    );
    // 先写新会话和最后访问时刻，再刷新监听，避免程序标记递归触发轮换。
    if (rotated && natureTrackingInstalled) refreshVisitorNatureTracking();
    return sessionId;
  } catch {
    return fallbackSession(now, requested);
  }
}

function getSessionTrafficSource(
  storage: TrackingStorage,
  referrer: string,
  utmSource: string | undefined,
) {
  try {
    const stored = JSON.parse(storage?.getItem(SESSION_SOURCE_KEY) || 'null') as ReturnType<
      typeof classifyTrafficSource
    > | null;
    if (stored && ['直接访问', '自然搜索', '外部链接', 'AI引流'].includes(stored.sourceType)) {
      return stored;
    }
    const source = classifyTrafficSource(referrer, utmSource, window.location.hostname);
    storage?.setItem(SESSION_SOURCE_KEY, JSON.stringify(source));
    return source;
  } catch {
    return classifyTrafficSource(referrer, utmSource, window.location.hostname);
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
    const current = trackingStorage('sessionStorage').getItem('suneng_landing_page');
    if (current) {
      const sanitizedCurrent = sanitizeLeadPagePath(current);
      if (sanitizedCurrent !== current) {
        trackingStorage('sessionStorage').setItem('suneng_landing_page', sanitizedCurrent);
      }
      return sanitizedCurrent;
    }
    trackingStorage('sessionStorage').setItem('suneng_landing_page', safePath);
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
  const sessionStorage = trackingStorage('sessionStorage');
  const sessionId = getSessionId(sessionStorage);
  const landingPage = getLandingPage(path);
  const campaign = campaignParams(landingPage);
  // 来源是一次访问的入口属性，不能每次点击都用 document.referrer
  // 重算；否则用户在官网内跳转后，自家域名会被误算成外部推荐。
  const trafficSource = getSessionTrafficSource(
    sessionStorage,
    document.referrer,
    campaign.utmSource,
  );
  const snapshot = sanitizeLeadSourceSnapshot({
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
    visitorId: getStoredId('suneng_visitor_id', trackingStorage('localStorage')),
    ...extra,
  });
  manualQaBySnapshot.set(snapshot, manualQaByWindow.get(window)?.active === true);
  internalTrafficBySnapshot.set(snapshot, isRegisteredInternalBrowser());
  return snapshot;
}

function sanitizeEventProperties(properties?: LeadEventProperties) {
  if (!properties) return undefined;
  const entries = Object.entries(properties)
    .slice(0, 24)
    .flatMap(([key, value]) => {
      const normalizedKey = key.trim().slice(0, 60);
      if (!normalizedKey) return [];
      const normalizedValue = typeof value === 'string' ? value.trim().slice(0, 255) : value;
      return [[normalizedKey, normalizedValue] as const];
    });
  return entries.length > 0 ? Object.fromEntries(entries) : undefined;
}

// Contact actions capture true AND false before awaiting the clipboard. A later page or
// visit must not change the classification of an action that already began.
export function captureLeadEventProperties(
  properties: LeadEventProperties | undefined,
  snapshot: LeadSourceSnapshot,
): LeadEventProperties {
  const frozen = typeof properties?.manual_qa === 'boolean' ? properties.manual_qa : undefined;
  const manualQa = frozen ?? manualQaBySnapshot.get(snapshot) === true;
  const frozenInternal =
    typeof properties?.internal_traffic === 'boolean' ? properties.internal_traffic : undefined;
  const internalTraffic = frozenInternal ?? internalTrafficBySnapshot.get(snapshot) === true;
  const ordinary = Object.fromEntries(
    Object.entries(properties ?? {}).filter(
      ([key]) => !['manual_qa', 'internal_traffic'].includes(key.trim().slice(0, 60)),
    ),
  );
  // Reserve two of the existing 24 slots so a crowded context cannot drop either marker.
  return sanitizeEventProperties({
    manual_qa: manualQa,
    internal_traffic: internalTraffic,
    ...ordinary,
  })!;
}

function browserVersionDeclaration() {
  if (typeof navigator === 'undefined') return undefined;
  // Read only the browser's already available low-entropy declaration. Never request
  // high-entropy values or combine device characteristics into a fingerprint.
  const data = (
    navigator as Navigator & {
      userAgentData?: { brands?: Array<{ brand?: string; version?: string }> };
    }
  ).userAgentData;
  if (!Array.isArray(data?.brands)) return undefined;
  const brands = data.brands.slice(0, 4).flatMap(({ brand, version }) => {
    if (typeof brand !== 'string' || typeof version !== 'string') return [];
    const safeBrand = brand
      .replace(/[^a-zA-Z0-9 ._-]/g, '')
      .trim()
      .slice(0, 40);
    const major = version.match(/^\d{1,4}(?:\.|$)/)?.[0].replace('.', '');
    return safeBrand && major ? [`${safeBrand}/${major}`] : [];
  });
  return brands.length ? brands.join('; ').slice(0, 255) : undefined;
}

function currentPayload(eventType: LeadEventType, extra: LeadEventExtra = {}) {
  const { properties, ...sourceExtra } = extra;
  const snapshot = buildLeadSourceSnapshot(sourceExtra);
  // 联系方式复制等异步动作保留开始时冻结的 true/false，不能被后来的访问改写。
  const captured = captureLeadEventProperties(properties, snapshot);
  const ordinary = Object.fromEntries(
    Object.entries(captured).filter(
      ([key]) =>
        ![
          'collectionId',
          'collectorVersion',
          'collectorBuild',
          'browserBrands',
          'automationDetected',
          'manual_qa',
          'internal_traffic',
        ].includes(key.trim()),
    ),
  );
  const browserBrands = browserVersionDeclaration();
  return {
    eventType,
    ...snapshot,
    properties: sanitizeEventProperties({
      // 系统属性优先占位，业务属性不能覆盖或挤掉它们。
      // Session milestones describe one fact even if a page disappears between
      // the server acknowledgement and writing the local success marker.
      collectionId:
        eventType !== 'page_view' && RECOVERABLE_EVENTS.has(eventType) && snapshot.sessionId
          ? `${eventType}:${snapshot.sessionId}`.slice(0, 120)
          : newAnonymousId().slice(0, 120),
      collectorVersion: '2',
      collectorBuild: 'outbox-20261020-receipts',
      ...(browserBrands ? { browserBrands } : {}),
      ...(typeof navigator !== 'undefined' && navigator.webdriver === true
        ? { automationDetected: true }
        : {}),
      manual_qa: captured.manual_qa,
      internal_traffic: captured.internal_traffic,
      ...ordinary,
    }),
  };
}

function sendLeadPayload(payload: LeadEventPayload) {
  return apiPost<unknown, LeadEventPayload>('/v1/lead-events', {
    body: payload,
    cache: 'no-store',
    keepalive: true,
  }).then(
    () => true,
    () => false,
  );
}

// Stored records are data, not fresh snapshots. Never reclassify an old QA/internal
// visit, replace its identity, or attach the page/source from the recovery tab.
function isRecoverablePayload(value: unknown): value is LeadEventPayload {
  if (!value || typeof value !== 'object') return false;
  const p = value as LeadEventPayload;
  if (!RECOVERABLE_EVENTS.has(p.eventType) || !p.sessionId || !p.visitorId) return false;
  if (
    Object.entries(p).some(
      ([key, value]) =>
        key !== 'eventType' &&
        key !== 'properties' &&
        (!Object.prototype.hasOwnProperty.call(LEAD_SOURCE_LIMITS, key) ||
          typeof value !== 'string' ||
          value.length > LEAD_SOURCE_LIMITS[key as keyof LeadSourceSnapshot]),
    )
  )
    return false;
  const props = p.properties;
  return Boolean(
    props &&
    typeof props.collectionId === 'string' &&
    /^[A-Za-z0-9:_-]{1,120}$/.test(props.collectionId) &&
    props.collectorVersion === '2' &&
    typeof props.manual_qa === 'boolean' &&
    typeof props.internal_traffic === 'boolean' &&
    Object.entries(props).length <= 24 &&
    Object.entries(props).every(
      ([key, value]) =>
        key.length <= 60 &&
        (value === null ||
          typeof value === 'boolean' ||
          (typeof value === 'number' && Number.isFinite(value)) ||
          (typeof value === 'string' && value.length <= 255)),
    ),
  );
}

function acceptedRecoveredPayload(payload: LeadEventPayload) {
  const storage = trackingStorage('sessionStorage');
  if (storage.getItem(SESSION_ID_KEY) !== payload.sessionId) return;
  const milestone = DWELL_MILESTONES.findIndex((item) => item.event === payload.eventType);
  if (milestone >= 0) {
    writeDwellCounter(
      DWELL_MILESTONE_KEY,
      Math.max(readDwellCounter(DWELL_MILESTONE_KEY), milestone + 1),
    );
  }
  const key = {
    engaged_session: ENGAGED_SESSION_KEY,
    effective_interaction: EFFECTIVE_INTERACTION_KEY,
    human_signal: STRONG_INPUT_KEY,
    automation_signal: AUTOMATION_SIGNAL_KEY,
  }[
    payload.eventType as
      | 'engaged_session'
      | 'effective_interaction'
      | 'human_signal'
      | 'automation_signal'
  ];
  if (key) storage.setItem(key, '1');
}

function getCollectionOutbox() {
  trackingStorage('sessionStorage');
  if (!collectionOutbox) {
    const owner = window;
    collectionOutbox = createCollectionOutbox<LeadEventPayload>({
      owner,
      storage: () => getBrowserStorage('localStorage'),
      valid: isRecoverablePayload,
      id: (payload) => payload.properties!.collectionId as string,
      send: (payload) =>
        sendLeadPayload(payload).then((accepted) => {
          if (accepted && trackingWindow === owner && window === owner)
            acceptedRecoveredPayload(payload);
          return accepted;
        }),
    });
  }
  return collectionOutbox;
}

function postLeadPayload(payload: LeadEventPayload) {
  if (!isRecoverablePayload(payload)) return sendLeadPayload(payload);
  // Keep the first milestone fact for this visit even after its outbox entry has
  // been acknowledged. A document can disappear before its success counter is
  // stored; the next document must not create a replacement page attribution.
  const storage = trackingStorage('sessionStorage');
  if (payload.eventType !== 'page_view' && storage.getItem(SESSION_ID_KEY) === payload.sessionId) {
    const key = SESSION_FACT_PREFIX + payload.eventType;
    try {
      const raw = storage.getItem(key);
      const first: unknown = raw && JSON.parse(raw);
      if (
        isRecoverablePayload(first) &&
        first.sessionId === payload.sessionId &&
        first.eventType === payload.eventType &&
        first.properties?.collectionId === payload.properties?.collectionId
      )
        payload = first;
      else storage.setItem(key, JSON.stringify(payload));
    } catch {
      storage.setItem(key, JSON.stringify(payload));
    }
  }
  return getCollectionOutbox().post(payload);
}

function postLeadEvent(eventType: LeadEventType, extra?: LeadEventExtra) {
  if (!canTrackActivity()) return Promise.resolve(false);
  const payload = currentPayload(eventType, extra);
  // A contact can happen before the next dwell tick after returning to the page.
  // Frozen asynchronous actions still belonging to an old visit do not create views.
  if (payload.sessionId === trackingStorage('sessionStorage').getItem(SESSION_ID_KEY)) {
    ensureResumedPageView();
  }
  return postLeadPayload(payload);
}

function canTrackActivity() {
  return typeof window !== 'undefined' && !isLocalPreviewHostname(window.location.hostname);
}

export function markEngagedSession(extra?: LeadEventExtra) {
  if (!canTrackActivity()) return;
  getSessionId(trackingStorage('sessionStorage'));
  try {
    if (
      trackingStorage('sessionStorage').getItem(ENGAGED_SESSION_KEY) === '1' ||
      engagedSessionInFlight
    )
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
      trackingStorage('sessionStorage').setItem(ENGAGED_SESSION_KEY, '1');
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
    const value = Number(trackingStorage('sessionStorage').getItem(key));
    return Number.isFinite(value) && value > 0 ? value : 0;
  } catch {
    return 0;
  }
}

function writeDwellCounter(key: string, value: number) {
  try {
    trackingStorage('sessionStorage').setItem(key, String(value));
  } catch {
    // 数值已保存在本页面内存里，浏览器写入失败不停止累计。
  }
}

/** 每满一秒调一次。导出仅为可测，页面代码请用 startDwellTracking。 */
export function tickDwell() {
  if (!canTrackActivity()) return;
  // 只累计页面可见且窗口有焦点的秒数。这个状态本身不是“真人”的证明。
  if (document.visibilityState !== 'visible' || !document.hasFocus()) return;

  // 先建立/轮换会话再加秒数。否则第一个里程碑组装请求时才建会话，
  // 会把刚累计的停留数误当成上一个会话清掉。
  getSessionId(trackingStorage('sessionStorage'));
  ensureResumedPageView();

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
  if (
    !pendingDwellPayload ||
    pendingDwellPayload.generation !== generation ||
    pendingDwellPayload.milestone !== nextMilestone
  ) {
    pendingDwellPayload = {
      generation,
      milestone: nextMilestone,
      payload: currentPayload(milestone.event),
    };
  }
  void postLeadPayload(pendingDwellPayload.payload).then((accepted) => {
    // 请求期间如果已经换了会话，旧响应不能污染新会话。
    if (generation !== dwellRequestGeneration) return;
    dwellMilestoneInFlight = false;
    if (!accepted) return; // 下一秒保留原采集号重试，防止响应丢失导致重复写入。
    pendingDwellPayload = undefined;
    writeDwellCounter(
      DWELL_MILESTONE_KEY,
      Math.max(readDwellCounter(DWELL_MILESTONE_KEY), nextMilestone + 1),
    );
    // 页面卡顿后可能一次跨过多个刻度，成功后顺序补齐，保证数学上单调。
    flushDwellMilestones();
  });
}

/** 开始计时，返回停表函数。跨页面接着上次的秒数走。 */
export function startDwellTracking() {
  if (!canTrackActivity()) return () => undefined;
  trackingStorage('sessionStorage');
  if (dwellTimer !== undefined) window.clearInterval(dwellTimer);
  const timer = window.setInterval(tickDwell, 1000);
  dwellTimer = timer;
  return () => {
    window.clearInterval(timer);
    if (dwellTimer === timer) dwellTimer = undefined;
  };
}

const EFFECTIVE_INTERACTION_EVENTS = ['scroll', 'click'] as const;
const STRONG_INPUT_EVENTS = ['click', 'pointerdown', 'touchstart', 'keydown'] as const;

function refreshVisitorNatureTracking() {
  natureTrackingCleanup?.();
  natureTrackingCleanup = undefined;
  const storage = trackingStorage('sessionStorage');
  // Explicit automation remains separately recorded; input evidence never overrides it.
  if (typeof navigator !== 'undefined' && navigator.webdriver === true) {
    if (storage.getItem(AUTOMATION_SIGNAL_KEY) === '1' || automationSignalInFlight) return;
    automationSignalInFlight = true;
    const generation = dwellRequestGeneration;
    void postPayloadWithRetry(currentPayload('automation_signal')).then((accepted) => {
      if (generation !== dwellRequestGeneration) return;
      automationSignalInFlight = false;
      if (accepted) storage.setItem(AUTOMATION_SIGNAL_KEY, '1');
    });
    return;
  }
  const listenerWindow = window;
  const listeners: Array<[string, EventListener]> = [];
  if (storage.getItem(EFFECTIVE_INTERACTION_KEY) !== '1') {
    for (const name of EFFECTIVE_INTERACTION_EVENTS) {
      const listener = (event: Event) => {
        if (!event.isTrusted) return;
        getSessionId(storage);
        ensureResumedPageView();
        if (storage.getItem(EFFECTIVE_INTERACTION_KEY) === '1' || effectiveInteractionInFlight)
          return;
        effectiveInteractionInFlight = true;
        const generation = dwellRequestGeneration;
        void postLeadEvent('effective_interaction', {
          properties: {
            evidenceVersion: 1,
            interactionType: name,
            interactionStrength: name === 'scroll' ? 'weak' : 'strong',
          },
        }).then((accepted) => {
          if (generation !== dwellRequestGeneration) return;
          effectiveInteractionInFlight = false;
          if (!accepted) return;
          storage.setItem(EFFECTIVE_INTERACTION_KEY, '1');
          if (natureTrackingInstalled) refreshVisitorNatureTracking();
        });
      };
      listeners.push([name, listener]);
    }
  }
  if (storage.getItem(STRONG_INPUT_KEY) !== '1') {
    for (const name of STRONG_INPUT_EVENTS) {
      const listener = (event: Event) => {
        if (!event.isTrusted) return;
        getSessionId(storage);
        ensureResumedPageView();
        if (storage.getItem(STRONG_INPUT_KEY) === '1' || strongInputInFlight) return;
        strongInputInFlight = true;
        const generation = dwellRequestGeneration;
        // Only the action kind is retained, never key text, targets or coordinates.
        // A lost response may already be persisted. Keep the first payload even
        // after bounded retries expire, so a later input retries that same fact.
        if (!pendingStrongInputPayload || pendingStrongInputPayload.generation !== generation) {
          pendingStrongInputPayload = {
            generation,
            payload: currentPayload('human_signal', {
              properties: {
                evidenceVersion: 1,
                interactionType: name,
                interactionStrength: 'strong',
              },
            }),
          };
        }
        void postPayloadWithRetry(pendingStrongInputPayload.payload).then((accepted) => {
          if (generation !== dwellRequestGeneration) return;
          strongInputInFlight = false;
          if (!accepted) return;
          pendingStrongInputPayload = undefined;
          storage.setItem(STRONG_INPUT_KEY, '1');
          if (natureTrackingInstalled) refreshVisitorNatureTracking();
        });
      };
      listeners.push([name, listener]);
    }
  }
  for (const [name, listener] of listeners) {
    listenerWindow.addEventListener(name, listener, { capture: true, passive: true });
  }
  natureTrackingCleanup = () => {
    for (const [name, listener] of listeners) {
      listenerWindow.removeEventListener(name, listener, true);
    }
  };
}

export function installVisitorNatureTracking() {
  if (!canTrackActivity()) return () => undefined;
  getSessionId(trackingStorage('sessionStorage'));
  if (!natureTrackingInstalled) {
    natureTrackingInstalled = true;
    refreshVisitorNatureTracking();
  }
  return () => {
    natureTrackingInstalled = false;
    natureTrackingCleanup?.();
    natureTrackingCleanup = undefined;
  };
}

// 当前页面快速补报两次；跨页/断网恢复由持久待发送队列继续，始终沿用原标识。
function postPayloadWithRetry(payload: LeadEventPayload): Promise<boolean> {
  const storage = trackingStorage('sessionStorage');
  const generation = dwellRequestGeneration;
  const owner = window;
  if (pendingRetriedEvents.size >= 20) return postLeadPayload(payload);
  return new Promise((resolve) => {
    const request: { timer?: number; owner: Window; cancel: () => void } = {
      owner,
      cancel: () => finish(false),
    };
    const finish = (accepted: boolean) => {
      if (!pendingRetriedEvents.delete(request)) return;
      if (request.timer !== undefined) owner.clearTimeout(request.timer);
      resolve(accepted);
    };
    pendingRetriedEvents.add(request);
    const send = (attempt: number) => {
      if (
        generation !== dwellRequestGeneration ||
        Date.now() - Number(storage.getItem(SESSION_LAST_SEEN_KEY)) > SESSION_TIMEOUT_MS
      ) {
        finish(false);
        return;
      }
      void postLeadPayload(payload).then((accepted) => {
        if (!pendingRetriedEvents.has(request)) return;
        if (
          accepted ||
          generation !== dwellRequestGeneration ||
          attempt >= PAGE_VIEW_RETRY_DELAYS_MS.length
        ) {
          finish(accepted);
          return;
        }
        request.timer = owner.setTimeout(
          () => send(attempt + 1),
          PAGE_VIEW_RETRY_DELAYS_MS[attempt],
        );
      });
    };
    send(0);
  });
}

function recordPageView(resumed: boolean) {
  const payload = currentPayload(
    'page_view',
    resumed
      ? {
          properties: { pageViewReason: 'session_resume' },
        }
      : undefined,
  );
  const safePath = payload.pagePath!;
  lastTrackedPagePath = safePath;
  // Mark dispatch, not receipt, so dwell/input racing with retries does not create
  // a second logical page view. Every retry carries this same collection ID.
  trackingStorage('sessionStorage').setItem(SESSION_PAGE_VIEW_KEY, payload.sessionId || '');
  void postPayloadWithRetry(payload);
  try {
    const stored = JSON.parse(
      trackingStorage('sessionStorage').getItem(SESSION_PAGE_PATHS_KEY) || '[]',
    );
    const paths = Array.isArray(stored)
      ? stored.filter((value): value is string => typeof value === 'string').slice(-20)
      : [];
    if (!paths.includes(safePath)) paths.push(safePath);
    trackingStorage('sessionStorage').setItem(SESSION_PAGE_PATHS_KEY, JSON.stringify(paths));
    if (paths.length >= 2) markEngagedSession();
  } catch {
    // Page-view recording must never interrupt website use when storage is unavailable.
  }
}

function ensureResumedPageView() {
  const storage = trackingStorage('sessionStorage');
  const sessionId = storage.getItem(SESSION_ID_KEY);
  const currentPath = sanitizeLeadPagePath(`${window.location.pathname}${window.location.search}`);
  // A normal route change owns its own page view through WebsiteReadingTracker.
  // Only fill the previously tracked, still-open page after a session rotation.
  if (
    lastTrackedPagePath !== currentPath ||
    !sessionId ||
    storage.getItem(SESSION_PAGE_VIEW_KEY) === sessionId
  )
    return;
  recordPageView(true);
}

export function trackPageView() {
  if (!canTrackActivity()) return;
  getCollectionOutbox().start();
  recordPageView(false);
}

export function trackLeadEvent(eventType: LeadEventType, extra?: LeadEventExtra) {
  if (!canTrackActivity()) return;
  void postLeadEvent(eventType, extra);
  if (HIGH_INTENT_EVENTS.has(eventType)) markEngagedSession(extra);
}
