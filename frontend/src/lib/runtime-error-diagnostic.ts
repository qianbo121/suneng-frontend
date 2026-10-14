export const RUNTIME_ERROR_DIAGNOSTIC_PREFIX = '[suneng-runtime-error] ';

const DIAGNOSTIC_VERSION = 'equipment-init-v1';
const REGISTRATION_KEY = Symbol.for('suneng.runtime-error-diagnostic.equipment-init-v1');
const MAX_RECORDS = 3;
const MAX_LOCATIONS = 8;
const MAX_STACK_LENGTH = 16_384;

export const RUNTIME_ERROR_DIAGNOSTIC_PATHS = [
  '/zh/news/bolts-nuts-shared-heat-treatment-line-loading-transfer',
  '/zh/news/da-xing-chi-lun-tiao-zhi-yong-shen-me-lu-xian-kan-zhi-jing-dan-chong-he-zhuan-yun',
  '/zh/news/titanium-alloy-thick-plate-roller-hearth-furnace-selection',
  '/zh/products/detail/fastener-quench-temper-line',
  '/zh/products/detail/mesh-belt-furnace',
  '/zh/products/detail/trolley-furnace',
  '/zh/products/detail/pit-furnace',
  '/zh/products/detail/roller-hearth-furnace',
] as const;

const allowedPaths = new Set<string>(RUNTIME_ERROR_DIAGNOSTIC_PATHS);
const chunkPath = /^\/_next\/static\/chunks\/(?:[A-Za-z0-9_.~\/\[\]-]|%5[bBdD])+\.js$/;

type PublicLocation = { path: string; line: number; column: number };
type DiagnosticWindow = Window & Pick<typeof globalThis, 'console'>;
type RegisteredWindow = DiagnosticWindow & { [REGISTRATION_KEY]?: boolean };

function publicLocations(stack: string, origin: string): PublicLocation[] {
  const locations: PublicLocation[] = [];
  const seen = new Set<string>();
  const frameUrl = /(https?:\/\/[^\s()]+):(\d+):(\d+)(?=\)?(?:\s|$))/g;
  for (const match of stack.slice(0, MAX_STACK_LENGTH).matchAll(frameUrl)) {
    const url = new URL(match[1]);
    const line = Number(match[2]);
    const column = Number(match[3]);
    if (
      url.origin !== origin || url.search || url.hash || url.username || url.password ||
      !chunkPath.test(url.pathname) || url.pathname.includes('//') ||
      !Number.isSafeInteger(line) || !Number.isSafeInteger(column) || line < 1 || column < 1
    ) continue;
    const key = `${url.pathname}:${line}:${column}`;
    if (seen.has(key)) continue;
    seen.add(key);
    locations.push({ path: url.pathname, line, column });
    if (locations.length === MAX_LOCATIONS) break;
  }
  return locations;
}

/** Observe narrowly scoped public errors without changing their propagation. */
export function installRuntimeErrorDiagnostic(
  browserWindow: DiagnosticWindow | undefined = typeof window === 'undefined' ? undefined : window,
): void {
  if (!browserWindow) return;
  try {
    const registeredWindow = browserWindow as RegisteredWindow;
    if (registeredWindow[REGISTRATION_KEY]) return;
    Object.defineProperty(registeredWindow, REGISTRATION_KEY, { value: true });
    const seen = new Set<string>();
    browserWindow.addEventListener('error', (event: ErrorEvent) => {
      try {
        if (seen.size >= MAX_RECORDS) return;
        const pathname = browserWindow.location.pathname;
        if (!allowedPaths.has(pathname)) return;
        if (typeof event.message !== 'string' || !/\bMinified React error #418(?:[;:.\s]|$)/.test(event.message)) return;
        const key = `${pathname}:418`;
        if (seen.has(key)) return;
        const error: unknown = event.error;
        if (!error || (typeof error !== 'object' && typeof error !== 'function')) return;
        const stack: unknown = (error as { stack?: unknown }).stack;
        if (typeof stack !== 'string') return;
        const locations = publicLocations(stack, browserWindow.location.origin);
        const info = browserWindow.console.info;
        if (typeof info !== 'function') return;
        const record = {
          code: 418,
          observedAt: new Date().toISOString(),
          pathname,
          locations,
          diagnosticVersion: DIAGNOSTIC_VERSION,
        };
        seen.add(key);
        info.call(browserWindow.console, RUNTIME_ERROR_DIAGNOSTIC_PREFIX + JSON.stringify(record));
      } catch {
        // Accessors, unsupported consoles, or malformed stacks must not add errors.
      }
    });
  } catch {
    // A restricted browser environment may decline the observer entirely.
  }
}
