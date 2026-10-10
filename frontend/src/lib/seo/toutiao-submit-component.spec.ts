import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const hooks = vi.hoisted(() => ({
  pathname: '',
  effects: [] as Array<() => void | (() => void)>,
}));
vi.mock('react', () => ({ useEffect: (effect: () => void | (() => void)) => hooks.effects.push(effect) }));
vi.mock('next/navigation', () => ({ usePathname: () => hooks.pathname }));
import { ToutiaoAutoSubmit } from '@/components/seo/ToutiaoAutoSubmit';

let currentHref: string;
let visibility: string;
let prerendering: boolean;
let noindex: boolean;
let sent: string[];
let listeners: Map<string, Set<() => void>>;

function render(canonicalUrl: string) {
  hooks.pathname = new URL(currentHref).pathname;
  expect(ToutiaoAutoSubmit({ canonicalUrl })).toBe(null);
  const cleanup = hooks.effects.pop()?.();
  return typeof cleanup === 'function' ? cleanup : () => {};
}

beforeEach(() => {
  sent = [];
  listeners = new Map();
  visibility = 'visible';
  prerendering = false;
  noindex = false;
  hooks.effects = [];
  vi.stubGlobal('window', { location: { get href() { return currentHref; } } });
  vi.stubGlobal('document', {
    get visibilityState() { return visibility; },
    get prerendering() { return prerendering; },
    querySelector: () => noindex ? { getAttribute: () => 'noindex, nofollow' } : null,
    addEventListener: (name: string, listener: () => void) => {
      if (!listeners.has(name)) listeners.set(name, new Set());
      listeners.get(name)?.add(listener);
    },
    removeEventListener: (name: string, listener: () => void) => listeners.get(name)?.delete(listener),
  });
  vi.stubGlobal('Image', class {
    onload = null;
    onerror = null;
    set src(value: string) { sent.push(value); }
  });
});
afterEach(() => vi.unstubAllGlobals());

describe('rendered article auto-submit mount', () => {
  it('sends once across a StrictMode effect replay and sends a new article after SPA navigation', () => {
    const a = 'https://www.jssngyl.cn/zh/news/component-strict-a';
    const b = 'https://www.jssngyl.cn/zh/news/component-strict-b';
    currentHref = a;
    render(a)();
    const cleanupA = render(a);
    currentHref = b;
    listeners.get('visibilitychange')?.forEach((listener) => listener());
    expect(sent).toHaveLength(1);
    cleanupA();
    render(b)();
    expect(sent.map((url) => new URL(url).searchParams.get('url'))).toEqual([a, b]);
  });
  it('waits for a hidden/prerendered article to become visible and never reports a later contact page', () => {
    const a = 'https://www.jssngyl.cn/zh/news/component-hidden-a';
    currentHref = a;
    visibility = 'hidden';
    prerendering = true;
    const cleanup = render(a);
    expect(sent).toHaveLength(0);
    visibility = 'visible';
    listeners.get('visibilitychange')?.forEach((listener) => listener());
    expect(sent).toHaveLength(0);
    currentHref = 'https://www.jssngyl.cn/zh/contact';
    prerendering = false;
    listeners.get('prerenderingchange')?.forEach((listener) => listener());
    expect(sent).toHaveLength(0);
    cleanup();
    expect([...listeners.values()].every((items) => items.size === 0)).toBe(true);
  });
  it('reports a prerendered article only when activated on the matching article URL', () => {
    const a = 'https://www.jssngyl.cn/en/news/component-activation-a';
    currentHref = a;
    prerendering = true;
    const cleanup = render(a);
    expect(sent).toHaveLength(0);
    prerendering = false;
    listeners.get('prerenderingchange')?.forEach((listener) => listener());
    expect(sent.map((url) => new URL(url).searchParams.get('url'))).toEqual([a]);
    cleanup();
  });
  it('does not report noindex pages', () => {
    const a = 'https://www.jssngyl.cn/zh/news/component-noindex-a';
    currentHref = a;
    noindex = true;
    render(a)();
    expect(sent).toHaveLength(0);
  });
});
