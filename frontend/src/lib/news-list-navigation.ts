import { getBrowserStorage } from '@/lib/browser-storage';
import { buildNewsDecisionHref } from '@/lib/news-decision-center';
import { normalizeNewsPage } from '@/lib/news-pagination';
import type { Locale } from '@/types/site';

export const RESOURCE_LIST_POSITION = 'resourceListPosition';
const POSITION_KEY = 'suneng:resource-list-position:';
const PENDING_KEY = 'suneng:resource-list-return';

export type ResourceListPosition = { href: string; y: number; savedAt: number };
let pending: ResourceListPosition | undefined;
const positions = new Map<string, ResourceListPosition>();

// Return navigation may only target this language's resource list. Keep the
// same normalization as the list controls; never accept an external redirect.
export function safeResourceListHref(value: string | null | undefined, locale: Locale) {
  if (!value?.startsWith('/') || value.length > 2400) return null;
  try {
    const url = new URL(value, 'https://resource.local');
    if (url.origin !== 'https://resource.local' || url.pathname !== `/${locale}/news`) return null;
    const params = url.searchParams;
    return buildNewsDecisionHref(url.pathname, {
      query: params.get('q') ?? '',
      topic: params.get('topic') ?? '',
      furnace: params.get('furnace') ?? '',
      sort: params.get('sort') ?? '',
      format: params.get('format') ?? '',
      page: normalizeNewsPage(params.get('page') ?? undefined),
    });
  } catch {
    return null;
  }
}

export function resourceDetailHref(href: string, returnTo: string) {
  if (!/^\/(?:zh|en)\/(?:news|infographics)\/[^/?#]+$/.test(href)) return href;
  return `${href}?${new URLSearchParams({ returnTo })}`;
}

function readPosition(value: unknown, href: string): ResourceListPosition | undefined {
  if (!value || typeof value !== 'object') return;
  const position = value as ResourceListPosition;
  if (
    position.href !== href ||
    !Number.isFinite(position.y) ||
    position.y < 0 ||
    !Number.isFinite(position.savedAt) ||
    Date.now() - position.savedAt > 24 * 60 * 60 * 1000
  )
    return;
  return position;
}

export function saveResourceListPosition(href: string) {
  const position = { href, y: window.scrollY, savedAt: Date.now() };
  positions.set(href, position);
  try {
    getBrowserStorage('sessionStorage')?.setItem(POSITION_KEY + href, JSON.stringify(position));
  } catch {
    /* Private browsing can disable storage. */
  }
  // Native Back/Forward restores the correct entry, not the last list visited.
  window.history.replaceState({ ...window.history.state, [RESOURCE_LIST_POSITION]: position }, '');
}

export function requestResourceListRestore(href: string, fromDetail: boolean) {
  let position = fromDetail ? positions.get(href) : undefined;
  try {
    if (fromDetail && !position)
      position = readPosition(
        JSON.parse(getBrowserStorage('sessionStorage')?.getItem(POSITION_KEY + href) || 'null'),
        href,
      );
  } catch {
    /* A missing or invalid snapshot is equivalent to a fresh list. */
  }
  pending = position ?? { href, y: 0, savedAt: Date.now() };
  try {
    getBrowserStorage('sessionStorage')?.setItem(PENDING_KEY, JSON.stringify(pending));
  } catch {
    /* In-memory navigation still works. */
  }
}

export function takeResourceListRestore(href: string): ResourceListPosition | undefined {
  let requested = readPosition(pending, href);
  try {
    requested ??= readPosition(
      JSON.parse(getBrowserStorage('sessionStorage')?.getItem(PENDING_KEY) || 'null'),
      href,
    );
    if (requested) getBrowserStorage('sessionStorage')?.removeItem(PENDING_KEY);
  } catch {
    /* Keep browser history as a fallback. */
  }
  if (requested) {
    pending = undefined;
    window.history.replaceState(
      { ...window.history.state, [RESOURCE_LIST_POSITION]: requested },
      '',
    );
    return requested;
  }
  return readPosition(window.history.state?.[RESOURCE_LIST_POSITION], href);
}
