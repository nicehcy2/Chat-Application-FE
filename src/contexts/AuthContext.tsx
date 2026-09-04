import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { configureAuth } from "../api/client";
import { userApi } from "../api/userApi";
import type { AuthSession } from "../api/types";

export interface AuthState {
  accessToken: string | null;
  sessionId: string | null;
  userId: number | null;
}

interface AuthContextValue {
  auth: AuthState;
  setAuth: (next: AuthState) => void;
  refresh: () => Promise<AuthSession | null>;
  logout: () => Promise<void>;
}

const EMPTY_AUTH: AuthState = { accessToken: null, sessionId: null, userId: null };

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [auth, setAuthState] = useState<AuthState>(EMPTY_AUTH);
  const [loading, setLoading] = useState(true); // refresh가 끝나기 전에 ProtectedRoute가 /auth로 보내는 것을 막는다
  const authRef = useRef<AuthState>(EMPTY_AUTH); // api/client가 렌더 사이클과 무관하게 최신 토큰을 읽기 위한 사본

  const setAuth = useCallback((next: AuthState) => {
    authRef.current = next;
    setAuthState(next);
  }, []);

  const refresh = useCallback(async (): Promise<AuthSession | null> => {
    try {
      const next = await userApi.refresh();
      setAuth(next);
      return next;
    } catch {
      setAuth(EMPTY_AUTH);
      return null;
    }
  }, [setAuth]);

  const logout = useCallback(async () => {
    // 서버 호출이 실패해도 클라이언트 상태는 비운다. 쿠키는 다음 refresh 실패로 자연히 정리된다.
    await userApi.logout().catch(() => {});
    setAuth(EMPTY_AUTH);
  }, [setAuth]);

  useEffect(() => {
    configureAuth({
      getAccessToken: () => authRef.current.accessToken,
      refresh,
    });
    userApi
      .refresh()
      .then((next) => setAuth(next))
      .catch(() => setAuth(EMPTY_AUTH))
      .finally(() => setLoading(false));
  }, [refresh, setAuth]);

  if (loading) return null;

  return (
    <AuthContext.Provider value={{ auth, setAuth, refresh, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
