import { runInNewContext } from 'node:vm';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { GET } from './route';

// Fixtures below exercise loading behavior, not the real factory location or Baidu service.
afterEach(() => vi.unstubAllEnvs());

function configure() {
  vi.stubEnv('BAIDU_MAP_BROWSER_KEY', 'test-only');
  vi.stubEnv('BAIDU_FACTORY_BD09_POINT', '120.04,32.44');
}

async function loadFrame() {
  configure();
  const html = await GET().text();
  const elements: Record<string, { hidden: boolean; href?: string }> = {
    status: { hidden: false }, fallback: { hidden: true }, 'open-map': { hidden: false },
  };
  const scripts: Array<{ src: string; async: boolean; onerror: () => void }> = [];
  const events: Record<string, () => void> = {};
  const timers: Array<() => void> = [];
  const centerAndZoom = vi.fn();
  const addOverlay = vi.fn();
  const clearTimeout = vi.fn();
  const body = { dataset: {} as Record<string, string> };
  const window = { initSunengFactoryMap: () => {}, addEventListener: vi.fn() };
  class Point { constructor(public lng: number, public lat: number) {} }
  class Marker { constructor(public point: Point) {} }
  runInNewContext(html.match(/<script>([\s\S]*?)<\/script>/)![1], {
    window,
    document: {
      body, getElementById: (id: string) => elements[id], createElement: () => ({}),
      head: { appendChild: (script: typeof scripts[number]) => scripts.push(script) },
    },
    setTimeout: (callback: () => void) => { timers.push(callback); return timers.length; },
    clearTimeout,
    BMAP_ANCHOR_BOTTOM_RIGHT: 3,
    BMap: {
      Point, Marker,
      Map: class {
        centerAndZoom = centerAndZoom;
        addOverlay = addOverlay;
        addEventListener(event: string, listener: () => void) { events[event] = listener; }
        disableScrollWheelZoom() {}
        addControl() {}
      },
      Label: class { setStyle() {} }, Size: class {}, ZoomControl: class {}, ScaleControl: class {},
    },
  });
  return { window, scripts, events, timers, elements, body, centerAndZoom, addOverlay, clearTimeout };
}

describe('Baidu factory map frame', () => {
  it('does not serve a map when the key or Taizhou point is missing or invalid', async () => {
    configure();
    vi.stubEnv('BAIDU_MAP_BROWSER_KEY', ' ');
    expect(GET().status).toBe(503);
    configure();
    vi.stubEnv('BAIDU_FACTORY_BD09_POINT', '32.44,120.04');
    const response = GET();
    expect(response.status).toBe(503);
    expect(await response.text()).not.toContain('api.map.baidu.com/api');
  });

  it('serves fresh configuration in a non-indexed same-origin frame', () => {
    configure();
    const response = GET();
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(response.headers.get('x-robots-tag')).toBe('noindex, nofollow');
    expect(response.headers.get('x-frame-options')).toBe('SAMEORIGIN');
  });

  it('starts loading without a click and places the marker at the configured map center', async () => {
    const frame = await loadFrame();
    expect(frame.scripts).toHaveLength(1);
    const sdk = new URL(frame.scripts[0].src);
    expect(sdk.origin).toBe('https://api.map.baidu.com');
    expect(sdk.searchParams.get('v')).toBe('4.0');
    expect(sdk.searchParams.get('ak')).toBe('test-only');
    frame.window.initSunengFactoryMap();
    expect(frame.centerAndZoom).toHaveBeenCalledWith({ lng: 120.04, lat: 32.44 }, 17);
    expect(frame.addOverlay.mock.calls[0][0].point).toEqual({ lng: 120.04, lat: 32.44 });
    expect(new URL(frame.elements['open-map'].href!).searchParams.get('location')).toBe('32.44,120.04');
    frame.events.tilesloaded();
    expect(frame.body.dataset.mapState).toBe('ready');
    expect(frame.elements.status.hidden).toBe(true);
    expect(frame.elements.fallback.hidden).toBe(true);
  });

  it('keeps a navigation fallback for script errors and timeouts', async () => {
    const frame = await loadFrame();
    frame.scripts[0].onerror();
    expect(frame.elements.fallback.hidden).toBe(false);
    expect(frame.body.dataset.mapState).toBe('error');
    const timeoutFrame = await loadFrame();
    timeoutFrame.timers[0]();
    expect(timeoutFrame.elements.fallback.hidden).toBe(false);
    const tileFrame = await loadFrame();
    tileFrame.window.initSunengFactoryMap();
    tileFrame.timers[1]();
    expect(tileFrame.elements.fallback.hidden).toBe(false);
    tileFrame.events.tilesloaded();
    expect(tileFrame.elements.fallback.hidden).toBe(true);
  });
});
