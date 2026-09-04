import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Client, type IMessage, type StompSubscription } from "@stomp/stompjs";
import { WEBSOCKET_URL } from "../config";
import { useAuth } from "./AuthContext";

type MessageCallback = (frame: IMessage) => void;

export interface SubscriptionHandle {
  unsubscribe: () => void;
}

interface StompContextValue {
  connected: boolean;
  subscribe: (destination: string, callback: MessageCallback) => SubscriptionHandle;
  publish: (destination: string, body: unknown) => boolean;
}

interface SubscriptionEntry {
  destination: string;
  callback: MessageCallback;
  stompSub: StompSubscription | null;
}

const StompContext = createContext<StompContextValue | null>(null);

export function StompProvider({ children }: { children: ReactNode }) {
  const { auth } = useAuth();
  const [connected, setConnected] = useState(false);
  const clientRef = useRef<Client | null>(null);
  const tokenRef = useRef<string | null>(null);
  // 살아 있는 구독 목록. 연결 전에 요청된 구독과 재연결 후 다시 붙여야 하는 구독을 함께 다룬다.
  const subscriptionsRef = useRef(new Set<SubscriptionEntry>());

  tokenRef.current = auth.accessToken;
  const userId = auth.userId;

  useEffect(() => {
    if (userId === null) return;

    const attachAll = (client: Client) => {
      subscriptionsRef.current.forEach((entry) => {
        entry.stompSub = client.subscribe(entry.destination, entry.callback);
      });
    };

    const client = new Client({
      brokerURL: WEBSOCKET_URL,
      reconnectDelay: 5000,
      // 재연결마다 호출되므로 refresh로 토큰이 바뀌어도 최신 토큰으로 붙는다.
      beforeConnect: () => {
        client.connectHeaders = { Authorization: `Bearer ${tokenRef.current}` };
      },
      onConnect: () => {
        attachAll(client);
        setConnected(true);
      },
      onWebSocketClose: () => setConnected(false),
      onStompError: (frame) => console.error("STOMP error:", frame.headers.message),
    });

    client.activate();
    clientRef.current = client;

    return () => {
      void client.deactivate();
      clientRef.current = null;
      setConnected(false);
    };
  }, [userId]);

  const subscribe = useCallback((destination: string, callback: MessageCallback): SubscriptionHandle => {
    const entry: SubscriptionEntry = { destination, callback, stompSub: null };
    subscriptionsRef.current.add(entry);

    if (clientRef.current?.connected) {
      entry.stompSub = clientRef.current.subscribe(destination, callback);
    }

    return {
      unsubscribe: () => {
        subscriptionsRef.current.delete(entry);
        entry.stompSub?.unsubscribe();
      },
    };
  }, []);

  const publish = useCallback((destination: string, body: unknown): boolean => {
    if (!clientRef.current?.connected) return false;
    clientRef.current.publish({ destination, body: JSON.stringify(body) });
    return true;
  }, []);

  return (
    <StompContext.Provider value={{ connected, subscribe, publish }}>
      {children}
    </StompContext.Provider>
  );
}

export function useStomp(): StompContextValue {
  const ctx = useContext(StompContext);
  if (!ctx) throw new Error("useStomp must be used within StompProvider");
  return ctx;
}
