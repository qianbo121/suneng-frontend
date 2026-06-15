import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  clearAuthSession,
  emitUnauthorizedEvent,
  getStoredUser,
  setStoredUser,
  subscribeUnauthorizedEvent,
} from '@/services/storage';
import { AdminUser } from '@/types/auth';

function createWindowMock() {
  const storage = new Map<string, string>();
  const listeners = new Map<string, Set<EventListener>>();

  return {
    localStorage: {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => storage.set(key, value),
      removeItem: (key: string) => storage.delete(key),
      clear: () => storage.clear(),
    },
    addEventListener: (event: string, listener: EventListener) => {
      const eventListeners = listeners.get(event) ?? new Set<EventListener>();
      eventListeners.add(listener);
      listeners.set(event, eventListeners);
    },
    removeEventListener: (event: string, listener: EventListener) => {
      listeners.get(event)?.delete(listener);
    },
    dispatchEvent: (event: Event) => {
      listeners.get(event.type)?.forEach((listener) => listener(event));
      return true;
    },
  } as unknown as Window;
}

const adminUser: AdminUser = {
  id: 1,
  username: 'editor',
  role: 'editor',
  isActive: true,
};

describe('admin auth storage', () => {
  beforeEach(() => {
    vi.stubGlobal('window', createWindowMock());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('stores and clears the admin user and removes legacy tokens', () => {
    window.localStorage.setItem('corp_admin_token', 'legacy-token');
    setStoredUser(adminUser);

    expect(getStoredUser()).toEqual(adminUser);

    clearAuthSession();

    expect(window.localStorage.getItem('corp_admin_token')).toBeNull();
    expect(getStoredUser()).toBeNull();
  });

  it('ignores corrupted stored user payloads', () => {
    window.localStorage.setItem('corp_admin_user', '{bad json');

    expect(getStoredUser()).toBeNull();
  });

  it('subscribes and unsubscribes unauthorized events', () => {
    const handler = vi.fn();
    const unsubscribe = subscribeUnauthorizedEvent(handler);

    emitUnauthorizedEvent();
    expect(handler).toHaveBeenCalledTimes(1);

    unsubscribe();
    emitUnauthorizedEvent();
    expect(handler).toHaveBeenCalledTimes(1);
  });
});
