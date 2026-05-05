import { AdminUser } from '@/types/auth';

const TOKEN_KEY = 'corp_admin_token';
const USER_KEY = 'corp_admin_user';
const UNAUTHORIZED_EVENT = 'admin:unauthorized';

function isBrowser() {
  return typeof window !== 'undefined';
}

export function getStoredToken() {
  if (!isBrowser()) return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string) {
  if (!isBrowser()) return;
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function getStoredUser() {
  if (!isBrowser()) return null;

  const raw = window.localStorage.getItem(USER_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as AdminUser;
  } catch {
    return null;
  }
}

export function setStoredUser(user: AdminUser) {
  if (!isBrowser()) return;
  window.localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearAuthSession() {
  if (!isBrowser()) return;
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(USER_KEY);
}

export function emitUnauthorizedEvent() {
  if (!isBrowser()) return;
  window.dispatchEvent(new CustomEvent(UNAUTHORIZED_EVENT));
}

export function subscribeUnauthorizedEvent(handler: () => void) {
  if (!isBrowser()) {
    return () => undefined;
  }

  const listener = () => handler();
  window.addEventListener(UNAUTHORIZED_EVENT, listener);

  return () => {
    window.removeEventListener(UNAUTHORIZED_EVENT, listener);
  };
}
