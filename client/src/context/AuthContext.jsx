import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authApi } from '../api/index.js';
import { tokenStore, UNAUTHORIZED_EVENT } from '../api/client.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!tokenStore.get()) {
      setReady(true);
      return;
    }
    authApi
      .me()
      .then((r) => setAdmin(r.admin))
      .catch(() => tokenStore.clear())
      .finally(() => setReady(true));
  }, []);

  useEffect(() => {
    const onUnauthorized = () => setAdmin(null);
    window.addEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
  }, []);

  const login = useCallback(async (credentials) => {
    const r = await authApi.login(credentials);
    tokenStore.set(r.token);
    setAdmin(r.admin);
  }, []);

  const logout = useCallback(() => {
    tokenStore.clear();
    setAdmin(null);
  }, []);

  const value = useMemo(() => ({ admin, ready, login, logout }), [admin, ready, login, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
