import { createContext, useContext, useEffect, useRef, useState } from "react";
import { configureAuth } from "../api/client";
import { userApi } from "../api/userApi";

const EMPTY_AUTH = { accessToken: null, sessionId: null, userId: null };

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuthState] = useState(EMPTY_AUTH);
  const [loading, setLoading] = useState(true); // refresh가 끝나기 전에 ProtectedRoute가 /auth로 보내는 것을 막는다
  const authRef = useRef(EMPTY_AUTH); // api/client가 렌더 사이클과 무관하게 최신 토큰을 읽기 위한 사본

  const setAuth = (next) => {
    authRef.current = next;
    setAuthState(next);
  };

  const refresh = async () => {
    try {
      const next = await userApi.refresh();
      setAuth(next);
      return next;
    } catch {
      setAuth(EMPTY_AUTH);
      return null;
    }
  };

  useEffect(() => {
    configureAuth({
      getAccessToken: () => authRef.current.accessToken,
      refresh,
    });
    refresh().finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) return null;

  return (
    <AuthContext.Provider value={{ auth, setAuth, refresh }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
