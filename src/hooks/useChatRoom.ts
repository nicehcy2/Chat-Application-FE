import { useCallback, useEffect, useRef, useState } from "react";
import type { IMessage } from "@stomp/stompjs";
import { chatApi } from "../api/chatApi";
import type {
  ChatRoomParticipantDto,
  MessageDto,
  MessageSendRequest,
  ReadReceiptEvent,
  ReadReceiptRequest,
} from "../api/types";
import { useAuth } from "../contexts/AuthContext";
import { useStomp } from "../contexts/StompContext";

const PAGE_SIZE = 30;
// 서버(ChatStompController)가 이 값을 전제로 설계됨. 연속 수신 시 읽음 발행을 한 번으로 묶는다.
const READ_DEBOUNCE_MS = 300;

export type ChatRoomStatus = "loading" | "ready" | "error";
type ParticipantMap = Record<number, ChatRoomParticipantDto>;

// TSID는 2^53을 넘는 문자열이라 Number로 비교하면 정밀도가 깨진다.
const tsid = (message: MessageDto): bigint => BigInt(message.messageTSID);

function mergeByTsid(...lists: MessageDto[][]): MessageDto[] {
  const byId = new Map<string, MessageDto>();
  lists.flat().forEach((message) => byId.set(message.messageTSID, message));
  return [...byId.values()].sort((a, b) => (tsid(a) < tsid(b) ? -1 : tsid(a) > tsid(b) ? 1 : 0));
}

export interface ChatRoomState {
  myId: number;
  isHost: boolean;
  status: ChatRoomStatus;
  retry: () => void;
  messages: MessageDto[];
  participants: ParticipantMap;
  unreadCountOf: (message: MessageDto) => number;
  hasMore: boolean;
  loadingOlder: boolean;
  loadOlder: () => Promise<void>;
  send: (content: string) => boolean;
}

export function useChatRoom(roomId: string): ChatRoomState {
  const { auth } = useAuth();
  const { subscribe, publish } = useStomp();
  const myId = Number(auth.userId);

  const [status, setStatus] = useState<ChatRoomStatus>("loading");
  const [reloadKey, setReloadKey] = useState(0);
  const [messages, setMessages] = useState<MessageDto[]>([]);
  const [participants, setParticipants] = useState<ParticipantMap>({});
  const [hasMore, setHasMore] = useState(true);
  const [loadingOlder, setLoadingOlder] = useState(false);

  const readTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSentReadRef = useRef<string | null>(null);

  const markRead = useCallback((messageId: string) => {
    if (lastSentReadRef.current && BigInt(messageId) <= BigInt(lastSentReadRef.current)) return;

    if (readTimerRef.current) clearTimeout(readTimerRef.current);
    readTimerRef.current = setTimeout(() => {
      const payload: ReadReceiptRequest = { lastReadMessageId: messageId };
      if (publish(`/pub/chat.read.${roomId}`, payload)) {
        lastSentReadRef.current = messageId;
      }
    }, READ_DEBOUNCE_MS);
  }, [roomId, publish]);

  // 방이 바뀌면 호출부가 key={roomId}로 컴포넌트를 다시 마운트하므로 상태 리셋은 필요 없다.
  useEffect(() => {
    let cancelled = false;
    Promise.all([
      chatApi.getParticipants(roomId),
      chatApi.getMessages(roomId, { limit: PAGE_SIZE }),
    ])
      .then(([participantList, initialMessages]) => {
        if (cancelled) return;
        setParticipants(Object.fromEntries(participantList.map((p) => [p.userId, p])));
        // REST 응답 전에 STOMP로 먼저 도착한 메시지가 있을 수 있어 덮어쓰지 않고 합친다.
        setMessages((prev) => mergeByTsid(initialMessages, prev));
        setHasMore(initialMessages.length === PAGE_SIZE);
        setStatus("ready");
        if (initialMessages.length > 0) {
          markRead(initialMessages[initialMessages.length - 1].messageTSID);
        }
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, [roomId, reloadKey, markRead]);

  useEffect(() => {
    const messageSub = subscribe(`/sub/chatroom${roomId}`, (frame: IMessage) => {
      const message = JSON.parse(frame.body) as MessageDto;
      setMessages((prev) => mergeByTsid(prev, [message]));
      markRead(message.messageTSID);
    });

    const readSub = subscribe(`/sub/chatroom${roomId}.read`, (frame: IMessage) => {
      const { userId, lastReadMessageId } = JSON.parse(frame.body) as ReadReceiptEvent;
      setParticipants((prev) => {
        const participant = prev[userId];
        if (!participant) return prev;
        if (participant.lastReadMessageId && BigInt(participant.lastReadMessageId) >= BigInt(lastReadMessageId)) {
          return prev;
        }
        return { ...prev, [userId]: { ...participant, lastReadMessageId } };
      });
    });

    return () => {
      messageSub.unsubscribe();
      readSub.unsubscribe();
      if (readTimerRef.current) clearTimeout(readTimerRef.current);
    };
  }, [roomId, subscribe, markRead]);

  const retry = useCallback(() => {
    setStatus("loading");
    setReloadKey((k) => k + 1);
  }, []);

  const loadOlder = useCallback(async () => {
    if (!hasMore || loadingOlder || messages.length === 0) return;
    setLoadingOlder(true);
    try {
      const older = await chatApi.getMessages(roomId, {
        before: messages[0].messageTSID,
        limit: PAGE_SIZE,
      });
      setMessages((prev) => mergeByTsid(older, prev));
      setHasMore(older.length === PAGE_SIZE);
    } catch (error) {
      console.error("이전 메시지 로드 실패:", error);
    } finally {
      setLoadingOlder(false);
    }
  }, [roomId, hasMore, loadingOlder, messages]);

  const send = useCallback((content: string): boolean => {
    const text = content.trim();
    if (!text) return false;
    const payload: MessageSendRequest = {
      chatRoomId: Number(roomId),
      correlationId: crypto.randomUUID(),
      messageType: "TEXT",
      content: text,
    };
    return publish(`/pub/chat.message.${roomId}`, payload);
  }, [roomId, publish]);

  // 본인과 발신자는 당연히 읽은 것으로 보고 제외한다.
  const unreadCountOf = useCallback((message: MessageDto): number => {
    const id = tsid(message);
    let count = 0;
    for (const participant of Object.values(participants)) {
      if (participant.userId === myId || participant.userId === message.senderId) continue;
      if (!participant.lastReadMessageId || BigInt(participant.lastReadMessageId) < id) count += 1;
    }
    return count;
  }, [participants, myId]);

  return {
    myId,
    isHost: participants[myId]?.isHost ?? false,
    status,
    retry,
    messages,
    participants,
    unreadCountOf,
    hasMore,
    loadingOlder,
    loadOlder,
    send,
  };
}
