import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { authApi, tokenStore, userStore } from "./api";

export interface AuthUser {
  name?: string;
  email: string;
  [k: string]: any;
}

interface AuthCtx {
  user: AuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  refresh: () => Promise<void>;
}

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = tokenStore.get();
    const cached = userStore.get();
    if (cached) setUser(cached);
    if (!t) {
      setLoading(false);
      return;
    }
    authApi
      .profile()
      .then((res) => {
        if (res?.success && res.user) {
          setUser(res.user);
          userStore.set(res.user);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    const res = await authApi.login({ email, password });
    if (!res?.success) throw new Error(res?.message || "Login failed");
    tokenStore.set(res.token);
    const u = res.user || { email };
    userStore.set(u);
    setUser(u);
  };

  const signup = async (name: string, email: string, password: string) => {
    const res = await authApi.signup({ name, email, password });
    if (!res?.success) throw new Error(res?.message || "Signup failed");
    if (res.token) {
      tokenStore.set(res.token);
      const u = res.user || { name, email };
      userStore.set(u);
      setUser(u);
    }
  };

  const logout = () => {
    tokenStore.clear();
    setUser(null);
    if (typeof window !== "undefined") window.location.href = "/login";
  };

  const refresh = async () => {
    const res = await authApi.profile();
    if (res?.success && res.user) {
      setUser(res.user);
      userStore.set(res.user);
    }
  };

  return (
    <Ctx.Provider value={{ user, loading, isAuthenticated: !!user, login, signup, logout, refresh }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth must be used inside AuthProvider");
  return v;
}