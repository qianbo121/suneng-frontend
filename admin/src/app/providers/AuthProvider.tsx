import { createContext, PropsWithChildren, useCallback, useEffect, useMemo, useState } from 'react';

import { fetchAdminProfile, loginWithPassword, logoutFromServer } from '@/services/auth';
import {
  clearAuthSession,
  getStoredUser,
  setStoredUser,
  subscribeUnauthorizedEvent,
} from '@/services/storage';
import { AuthContextValue, AdminUser, LoginPayload } from '@/types/auth';

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<AdminUser | null>(() => getStoredUser());
  const [isInitializing, setIsInitializing] = useState(true);

  const clearLocalAuth = useCallback(() => {
    clearAuthSession();
    setUser(null);
  }, []);

  const logout = useCallback(() => {
    void logoutFromServer().catch(() => undefined);
    clearLocalAuth();
  }, [clearLocalAuth]);

  const refreshProfile = useCallback(async () => {
    try {
      const profile = await fetchAdminProfile();
      setUser(profile);
      setStoredUser(profile);
      return profile;
    } catch {
      clearLocalAuth();
      return null;
    }
  }, [clearLocalAuth]);

  const login = useCallback(async (payload: LoginPayload) => {
    const result = await loginWithPassword(payload);

    setStoredUser(result.user);
    setUser(result.user);

    return result;
  }, []);

  useEffect(() => {
    const bootstrap = async () => {
      await refreshProfile();
      setIsInitializing(false);
    };

    void bootstrap();
  }, [refreshProfile]);

  useEffect(() => {
    const unsubscribe = subscribeUnauthorizedEvent(() => {
      clearLocalAuth();
      window.location.replace('/login');
    });

    return unsubscribe;
  }, [clearLocalAuth]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isInitializing,
      login,
      logout,
      refreshProfile,
    }),
    [isInitializing, login, logout, refreshProfile, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
