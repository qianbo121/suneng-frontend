import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  installRuntimeErrorDiagnostic,
  RUNTIME_ERROR_DIAGNOSTIC_PATHS,
  RUNTIME_ERROR_DIAGNOSTIC_PREFIX,
} from './runtime-error-diagnostic';

const ORIGIN = 'https://public.example';
const CHUNK = '/_next/static/chunks/app/%5Blocale%5D/page-abc.js';
const PRIVATE = 'private-input-person-session-browser-IP-referrer-storage';

function browser(pathname: string = RUNTIME_ERROR_DIAGNOSTIC_PATHS[0]) {
  const target = new EventTarget();
  const info = vi.fn();
  const location = { pathname, origin: ORIGIN };
  const fake = Object.assign(target, { location, console: { info } }) as unknown as Window & Pick<typeof globalThis, 'console'>;
  return { target, fake, info, location };
}

function emit(target: EventTarget, message = 'Uncaught Error: Minified React error #418; visit a private URL', stack: unknown = `Error: ${PRIVATE}\n at run (${ORIGIN}${CHUNK}:1:42)`) {
  const event = new Event('error', { cancelable: true });
  Object.defineProperties(event, { message: { value: message }, error: { value: { stack } } });
  target.dispatchEvent(event);
  return event;
}

function record(info: ReturnType<typeof vi.fn>, index = 0) {
  const text = info.mock.calls[index][0] as string;
  expect(text.startsWith(RUNTIME_ERROR_DIAGNOSTIC_PREFIX)).toBe(true);
  return JSON.parse(text.slice(RUNTIME_ERROR_DIAGNOSTIC_PREFIX.length));
}

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('early public runtime error diagnostic', () => {
  it.each(RUNTIME_ERROR_DIAGNOSTIC_PATHS)('records only the exact approved path: %s', (path) => {
    const test = browser(path);
    installRuntimeErrorDiagnostic(test.fake);
    emit(test.target);
    expect(test.info).toHaveBeenCalledOnce();
    expect(record(test.info).pathname).toBe(path);
  });

  it.each([
    '/zh/news/another-article',
    '/zh/products/detail/another-product',
    RUNTIME_ERROR_DIAGNOSTIC_PATHS[0] + '/',
    RUNTIME_ERROR_DIAGNOSTIC_PATHS[0] + '/extra',
    RUNTIME_ERROR_DIAGNOSTIC_PATHS[0].replace('/zh/', '/en/'),
    '/zh/contact',
  ])('leaves an unapproved or near-match path silent: %s', (path) => {
    const test = browser(path);
    installRuntimeErrorDiagnostic(test.fake);
    emit(test.target);
    expect(test.info).not.toHaveBeenCalled();
  });

  it.each(['ordinary error', 'Minified React error #419;', 'Minified React error #4180;', 'Minified React error #418private'])('ignores unrelated messages: %s', (message) => {
    const test = browser();
    installRuntimeErrorDiagnostic(test.fake);
    emit(test.target, message);
    expect(test.info).not.toHaveBeenCalled();
  });

  it('records UTC and only public chunk locations without private text, queries, or external origins', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-14T15:00:00.000Z'));
    const test = browser();
    installRuntimeErrorDiagnostic(test.fake);
    emit(test.target, `Minified React error #418; ${PRIVATE}`, [
      PRIVATE,
      `at run (${ORIGIN}${CHUNK}:1:42)`,
      `at query (${ORIGIN}/_next/static/chunks/query.js?secret=${PRIVATE}:2:8)`,
      `at fragment (${ORIGIN}/_next/static/chunks/fragment.js#${PRIVATE}:3:9)`,
      `at foreign (https://outside.example/_next/static/chunks/foreign.js:4:10)`,
      `at input (${ORIGIN}/private/${PRIVATE}.js:5:11)`,
      `at auth (https://identity:${PRIVATE}@public.example/_next/static/chunks/auth.js:6:12)`,
      `at run (${ORIGIN}${CHUNK}:1:42)`,
    ].join('\n'));
    expect(record(test.info)).toEqual({
      code: 418,
      observedAt: '2026-10-14T15:00:00.000Z',
      pathname: RUNTIME_ERROR_DIAGNOSTIC_PATHS[0],
      locations: [{ path: CHUNK, line: 1, column: 42 }],
      diagnosticVersion: 'equipment-init-v1',
    });
    expect(test.info.mock.calls[0][0]).not.toContain(PRIVATE);
    expect(test.info.mock.calls[0][0]).not.toContain('https://');
  });

  it('bounds locations at eight and rejects invalid source coordinates', () => {
    const test = browser();
    installRuntimeErrorDiagnostic(test.fake);
    const stack = [
      `${ORIGIN}/_next/static/chunks/zero.js:0:1`,
      `${ORIGIN}/_next/static/chunks/unsafe.js:9007199254740992:1`,
      ...Array.from({ length: 12 }, (_, i) => `${ORIGIN}/_next/static/chunks/chunk-${i}.js:${i + 1}:7`),
    ].join('\n');
    emit(test.target, 'Minified React error #418;', stack);
    expect(record(test.info).locations).toHaveLength(8);
    expect(record(test.info).locations[7].path).toBe('/_next/static/chunks/chunk-7.js');
  });

  it('registers once, records each pathname once, and stops after three records for the document', () => {
    const test = browser();
    installRuntimeErrorDiagnostic(test.fake);
    installRuntimeErrorDiagnostic(test.fake);
    emit(test.target);
    emit(test.target);
    for (const path of RUNTIME_ERROR_DIAGNOSTIC_PATHS.slice(1, 5)) {
      test.location.pathname = path;
      emit(test.target);
    }
    expect(test.info).toHaveBeenCalledTimes(3);
  });

  it('leaves the original error event uncancelled and visible to later listeners', () => {
    const test = browser();
    installRuntimeErrorDiagnostic(test.fake);
    const later = vi.fn();
    test.target.addEventListener('error', later);
    const event = emit(test.target);
    expect(event.defaultPrevented).toBe(false);
    expect(later).toHaveBeenCalledOnce();
  });

  it('safely skips missing or dangerous stack accessors', () => {
    const test = browser();
    installRuntimeErrorDiagnostic(test.fake);
    const missingStack = new Event('error');
    Object.defineProperties(missingStack, { message: { value: 'Minified React error #418;' }, error: { value: {} } });
    test.target.dispatchEvent(missingStack);
    emit(test.target, 'Minified React error #418;', null);
    const error = Object.defineProperty({}, 'stack', { get() { throw new Error(PRIVATE); } });
    const event = new Event('error');
    Object.defineProperties(event, { message: { value: 'Minified React error #418;' }, error: { value: error } });
    expect(() => test.target.dispatchEvent(event)).not.toThrow();
    expect(test.info).not.toHaveBeenCalled();
  });

  it('keeps normal visits silent and safely skips a console without info', () => {
    const test = browser();
    installRuntimeErrorDiagnostic(test.fake);
    expect(test.info).not.toHaveBeenCalled();
    Object.defineProperty(test.fake, 'console', { value: { error: vi.fn() } });
    expect(() => emit(test.target)).not.toThrow();
    expect(test.info).not.toHaveBeenCalled();
  });

  it('does nothing outside a browser', () => {
    vi.stubGlobal('window', undefined);
    expect(() => installRuntimeErrorDiagnostic()).not.toThrow();
  });
});
