"use client";

import type { ReactNode } from "react";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { api, fetchMe, loginRequest, persistToken, readStoredToken, registerRequest, setAuthToken } from "@/lib/api";
import type { AuthPayload, User } from "@/lib/types";

type AuthContextValue = {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (payload: Parameters<typeof registerRequest>[0]) => Promise<User>;
  logout: () => void;
  refresh: () => Promise<void>;
};

const Ctx = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const applySession = useCallback((payload: AuthPayload) => {
    setToken(payload.access_token);
    setUser(payload.user);
    setAuthToken(payload.access_token);
    persistToken(payload.access_token);
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    setAuthToken(null);
    persistToken(null);
  }, []);

  const refresh = useCallback(async () => {
    const t = readStoredToken();
    if (!t) {
      setLoading(false);
      return;
    }
    setAuthToken(t);
    setToken(t);
    try {
      const me = await fetchMe();
      setUser(me);
    } catch {
      logout();
    } finally {
      setLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const login = useCallback(
    async (email: string, password: string) => {
      const data = await loginRequest(email, password);
      applySession(data);
      return data.user;
    },
    [applySession]
  );

  const register = useCallback(
    async (payload: Parameters<typeof registerRequest>[0]) => {
      const data = await registerRequest(payload);
      applySession(data);
      return data.user;
    },
    [applySession]
  );

  useEffect(() => {
    const id = api.interceptors.response.use(
      (r) => r,
      (err) => {
        if (err?.response?.status === 401) logout();
        return Promise.reject(err);
      }
    );
    return () => api.interceptors.response.eject(id);
  }, [logout]);

  const value = useMemo(
    () => ({ user, token, loading, login, register, logout, refresh }),
    [user, token, loading, login, register, logout, refresh]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth must be used inside AuthProvider");
  return v;
}
