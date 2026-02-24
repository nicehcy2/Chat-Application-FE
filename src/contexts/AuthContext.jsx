import { createContext, useContext, useEffect, useRef, useState } from "react";
import { Stomp } from "@stomp/stompjs";

const AuthContext = createContext(); // 전역으로 공유할 수 있는 파이프를 만드는 함수

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    accessToken: null,
    sessionId: null,
    userId: null,
  });
  const [loading, setLoading] = useState(true); // loading으로 refresh가 호출되기 전에 auth로 넘어가는 것을 막음.
  const stompClient = useRef(null);

  const WEBSOCKET_URL = "ws://localhost:80/ws";
  const GATEWAY_SERVER_URL = "http://localhost:8072";
  const REFRESH_URL = "/user-service/refresh";

  const connectWebSocket = (accessToken) => {
    if (stompClient.current?.connected) return; // 이미 연결되어 있으면 스킵
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
    fetch(`${GATEWAY_SERVER_URL}${REFRESH_URL}`, {
      method: "POST",
      credentials: "include",
    })
      .then((res) => res.json())
      .then(({ accessToken, sessionId, userId }) => {
        setAuth({ accessToken, sessionId, userId });
        connectWebSocket(accessToken);
      })
      .catch(() => {})
      .finally(() => setLoading(false)); // loading 값이 바뀌면서 재렌더링.
  }, []);

  if (loading) return null;

  return (
    <AuthContext.Provider
      value={{
        auth,
        setAuth,
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
