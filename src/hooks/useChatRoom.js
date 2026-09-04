import { useCallback, useEffect, useRef, useState } from "react";
import { chatApi } from "../api/chatApi";
import { useAuth } from "../contexts/AuthContext";
import { useStomp } from "../contexts/StompContext";

const PAGE_SIZE = 30;
// 서버(ChatStompController)가 이 값을 전제로 설계됨. 연속 수신 시 읽음 발행을 한 번으로 묶는다.
const READ_DEBOUNCE_MS = 300;

// TSID는 2^53을 넘는 문자열이라 Number로 비교하면 정밀도가 깨진다.
const tsid = (message) => BigInt(message.messageTSID);

function mergeByTsid(...lists) {
  const byId = new Map();
  lists.flat().forEach((message) => byId.set(message.messageTSID, message));
  return [...byId.values()].sort((a, b) => (tsid(a) < tsid(b) ? -1 : tsid(a) > tsid(b) ? 1 : 0));
}

export function useChatRoom(roomId) {
  const { auth } = useAuth();
  const { subscribe, publish } = useStomp();
  const myId = Number(auth.userId);

  const [messages, setMessages] = useState([]);
  const [participants, setParticipants] = useState({});
  const [hasMore, setHasMore] = useState(true);
  const [loadingOlder, setLoadingOlder] = useState(false);

  const readTimerRef = useRef(null);
  const lastSentReadRef = useRef(null);

  const markRead = useCallback((messageId) => {
    if (!messageId) return;
    if (lastSentReadRef.current && BigInt(messageId) <= BigInt(lastSentReadRef.current)) return;

    clearTimeout(readTimerRef.current);
    readTimerRef.current = setTimeout(() => {
      if (publish(`/pub/chat.read.${roomId}`, { lastReadMessageId: messageId })) {
        lastSentReadRef.current = messageId;
      }
    }, READ_DEBOUNCE_MS);
  }, [roomId, publish]);

  useEffect(() => {
    let cancelled = false;
    setMessages([]);
    setParticipants({});
    setHasMore(true);
    lastSentReadRef.current = null;

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
        if (initialMessages.length > 0) {
          markRead(initialMessages[initialMessages.length - 1].messageTSID);
        }
      })
      .catch((error) => console.error("채팅방 로드 실패:", error));

    const messageSub = subscribe(`/sub/chatroom${roomId}`, (frame) => {
      const message = JSON.parse(frame.body);
      setMessages((prev) => mergeByTsid(prev, [message]));
      markRead(message.messageTSID);
    });

    const readSub = subscribe(`/sub/chatroom${roomId}.read`, (frame) => {
      const { userId, lastReadMessageId } = JSON.parse(frame.body);
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
      cancelled = true;
      messageSub.unsubscribe();
      readSub.unsubscribe();
      clearTimeout(readTimerRef.current);
    };
  }, [roomId, subscribe, markRead]);

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

  const send = useCallback((content) => {
    const text = content.trim();
    if (!text) return false;
    return publish(`/pub/chat.message.${roomId}`, {
      chatRoomId: Number(roomId),
      correlationId: crypto.randomUUID(),
      messageType: "TEXT",
      content: text,
    });
  }, [roomId, publish]);

  // 본인과 발신자는 당연히 읽은 것으로 보고 제외한다.
  const unreadCountOf = useCallback((message) => {
    const id = tsid(message);
    const senderId = Number(message.senderId);
    let count = 0;
    for (const participant of Object.values(participants)) {
      if (participant.userId === myId || participant.userId === senderId) continue;
      if (!participant.lastReadMessageId || BigInt(participant.lastReadMessageId) < id) count += 1;
    }
    return count;
  }, [participants, myId]);

  return { myId, messages, participants, unreadCountOf, hasMore, loadingOlder, loadOlder, send };
}
