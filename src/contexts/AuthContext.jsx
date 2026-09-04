import { createContext, useContext, useEffect, useRef, useState } from "react";
import { Stomp } from "@stomp/stompjs";
import { requestFcmToken } from "../firebase";
import { WEBSOCKET_URL } from "../config";
import { configureAuth } from "../api/client";
import { userApi } from "../api/userApi";

const EMPTY_AUTH = { accessToken: null, sessionId: null, userId: null };

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuthState] = useState(EMPTY_AUTH);
  const [loading, setLoading] = useState(true); // refresh가 끝나기 전에 ProtectedRoute가 /auth로 보내는 것을 막는다
  const authRef = useRef(EMPTY_AUTH); // api/client가 렌더 사이클과 무관하게 최신 토큰을 읽기 위한 사본
  const stompClient = useRef(null);

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

  const registerFcmToken = async (userId) => {
    const token = await requestFcmToken();
    if (!token) return;
    userApi.registerFcmToken({ fcmToken: token, deviceType: "DESKTOP", userId }).catch(() => {});
  };

  const connectWebSocket = (accessToken) => {
    if (stompClient.current?.connected) return;
    const socket = new WebSocket(WEBSOCKET_URL);
    stompClient.current = Stomp.over(socket);
    stompClient.current.connect(
      { Authorization: `Bearer ${accessToken}` },
      () => console.log("WebSocket connected"),
    );
  };

  const disconnectWebSocket = () => {
    if (stompClient.current) {
      stompClient.current.disconnect(() =>
        console.log("WebSocket disconnected"),
      );
      stompClient.current = null;
    }
  };

  const subscribe = (destination, callback) => {
    if (!stompClient.current?.connected) {
      console.log("세션이 연결되지 않았습니다.");
      return null;
    }
    return stompClient.current.subscribe(destination, callback);
  };

  const publish = (destination, body) => {
    if (!stompClient.current?.connected) {
      console.log("세션이 연결되지 않았습니다.");
      return false;
    }
    stompClient.current.send(destination, {}, JSON.stringify(body));
    return true;
  };

  useEffect(() => {
    configureAuth({
      getAccessToken: () => authRef.current.accessToken,
      refresh,
    });

    refresh()
      .then((next) => {
        if (!next) return;
        connectWebSocket(next.accessToken);
        registerFcmToken(next.userId);
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) return null;

  return (
    <AuthContext.Provider
      value={{
        auth,
        setAuth,
        refresh,
        connectWebSocket,
        disconnectWebSocket,
        subscribe,
        publish,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
