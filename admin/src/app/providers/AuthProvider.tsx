import { createContext, PropsWithChildren, useCallback, useEffect, useMemo, useState } from 'react';

import { fetchAdminProfile, loginWithPassword } from '@/services/auth';
import {
  clearAuthSession,
  getStoredToken,
  getStoredUser,
  setStoredToken,
  setStoredUser,
  subscribeUnauthorizedEvent,
} from '@/services/storage';
import { AuthContextValue, AdminUser, LoginPayload } from '@/types/auth';

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [token, setToken] = useState<string | null>(() => getStoredToken());
  const [user, setUser] = useState<AdminUser | null>(() => getStoredUser());
  const [isInitializing, setIsInitializing] = useState(true);

  const logout = useCallback(() => {
    clearAuthSession();
    setToken(null);
    setUser(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    const currentToken = getStoredToken();

    if (!currentToken) {
      logout();
      return null;
    }

    try {
      const profile = await fetchAdminProfile();
      setUser(profile);
      setStoredUser(profile);
      return profile;
    } catch {
      logout();
      return null;
    }
  }, [logout]);

  const login = useCallback(async (payload: LoginPayload) => {
    const result = await loginWithPassword(payload);

    setStoredToken(result.token);
    setStoredUser(result.user);
    setToken(result.token);
    setUser(result.user);

    return result;
  }, []);

  useEffect(() => {
    const currentToken = getStoredToken();

    if (!currentToken) {
      setIsInitializing(false);
      return;
    }

    setToken(currentToken);

    const bootstrap = async () => {
      await refreshProfile();
      setIsInitializing(false);
    };

    void bootstrap();
  }, [refreshProfile]);

  useEffect(() => {
    const unsubscribe = subscribeUnauthorizedEvent(() => {
      logout();
      window.location.replace('/login');
    });

    return unsubscribe;
  }, [logout]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token && user),
      isInitializing,
      login,
      logout,
      refreshProfile,
    }),
    [isInitializing, login, logout, refreshProfile, token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
