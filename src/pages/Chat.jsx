import { useLayoutEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useChatRoom } from "../hooks/useChatRoom";
import { formatDate, formatTime, isSameDay } from "../utils/date";

import SendButtonImage from "../assets/images/chat-send-button.png";
import BackButtonImage from "../assets/images/back-button.png";
import ChatRankButtonImage from "../assets/images/chat-rank.png";
import ChatOptionImage from "../assets/images/chat-option.png";

const LOAD_OLDER_THRESHOLD_PX = 40;

// 방 ID가 바뀌면 useChatRoom의 상태(메시지·참여자·읽음 커서)를 전부 새로 시작해야 하므로 key로 다시 마운트한다.
export default function Chat() {
  const { chatRoomId } = useParams();
  return <ChatRoom key={chatRoomId} roomId={chatRoomId} />;
}

function ChatRoom({ roomId }) {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { myId, messages, participants, unreadCountOf, hasMore, loadingOlder, loadOlder, send } =
    useChatRoom(roomId);

  const [inputValue, setInputValue] = useState("");
  const listRef = useRef(null);
  const bottomRef = useRef(null);
  const lastTsidRef = useRef(null);
  const scrollHeightBeforePrependRef = useRef(null);

  const title = state?.title ?? "";
  const participantCount = Object.keys(participants).length || state?.participationCount || "";

  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list || messages.length === 0) return;

    if (scrollHeightBeforePrependRef.current !== null) {
      list.scrollTop += list.scrollHeight - scrollHeightBeforePrependRef.current;
      scrollHeightBeforePrependRef.current = null;
      return;
    }

    const lastTsid = messages[messages.length - 1].messageTSID;
    if (lastTsid !== lastTsidRef.current) {
      lastTsidRef.current = lastTsid;
      bottomRef.current?.scrollIntoView();
    }
  }, [messages]);

  const handleScroll = (e) => {
    const list = e.currentTarget;
    if (list.scrollTop > LOAD_OLDER_THRESHOLD_PX || !hasMore || loadingOlder) return;
    scrollHeightBeforePrependRef.current = list.scrollHeight;
    loadOlder();
  };

  const handleSend = () => {
    if (send(inputValue)) setInputValue("");
  };

  const handleKeyDown = (e) => {
    // 한글 입력 중 Enter는 조합 확정이므로 전송하지 않는다.
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-row justify-between h-[56px] items-center">
        <div className="flex flex-row h-full items-center gap-1 p-4">
          <img src={BackButtonImage} alt="뒤로가기" className="w-5 h-5" onClick={() => navigate(-1)} />
          <span className="text-xl font-bold px-2">{title}</span>
          <span className="text-sm font-bold text-primaryDeep">{participantCount}</span>
        </div>
        <div className="flex flex-row gap-3 h-full items-center p-4">
          <img src={ChatRankButtonImage} alt="채팅 랭크" className="w-4 h-6" />
          <img src={ChatOptionImage} alt="채팅 옵션" className="w-5 h-4" />
        </div>
      </div>

      <div ref={listRef} onScroll={handleScroll} className="flex-1 overflow-y-auto">
        <div className="p-3">
          {loadingOlder && <div className="text-center text-xs text-gray-400 py-2">이전 메시지 불러오는 중</div>}

          {messages.map((msg, index) => {
            const prev = messages[index - 1];
            const isMyMessage = Number(msg.senderId) === myId;
            const showDate = !prev || !isSameDay(prev.timestamp, msg.timestamp);
            const showProfile = !isMyMessage && (showDate || Number(prev.senderId) !== Number(msg.senderId));
            const sender = participants[msg.senderId];
            const nickname = msg.nickname ?? sender?.nickname ?? msg.senderId;
            const imageUrl = msg.senderImageUrl ?? sender?.imageUrl;
            const unread = unreadCountOf(msg);

            const meta = (
              <div className="flex flex-col justify-end">
                {unread > 0 && <div className="text-primary text-[9px] leading-none">{unread}</div>}
                <div className="text-[9px]">{formatTime(msg.timestamp)}</div>
              </div>
            );

            return (
              <div key={msg.messageTSID}>
                {showDate && (
                  <div className="text-center text-[11px] text-gray-400 my-3">{formatDate(msg.timestamp)}</div>
                )}
                <div className={`flex gap-2 ${showProfile && !showDate ? "mt-3" : "mt-1"} ${isMyMessage ? "justify-end" : ""}`}>
                  {!isMyMessage &&
                    (showProfile ? (
                      imageUrl ? (
                        <img src={imageUrl} alt="" className="w-12 h-12 rounded-2xl object-cover shrink-0" />
                      ) : (
                        <div className="w-12 h-12 border rounded-2xl bg-gray-200 shrink-0" />
                      )
                    ) : (
                      <div className="w-12 shrink-0" />
                    ))}

                  <div className="flex flex-col gap-1 text-sm">
                    {showProfile && <strong>{nickname}</strong>}
                    <div className="flex flex-row gap-2">
                      {isMyMessage && meta}
                      <div className={`px-3 py-2 border rounded-xl max-w-[300px] text-[16px] ${isMyMessage ? "bg-primary text-white" : "bg-gray-50"}`}>
                        {msg.messageType === "TEXT" ? msg.content : `[${msg.messageType}]`}
                      </div>
                      {!isMyMessage && meta}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div ref={bottomRef} />
      </div>

      <div className="flex flex-row justify-end py-2 px-4 gap-1">
        <input
          type="text"
          value={inputValue}
          className="w-[264px] h-[32px] border rounded-full px-3 py-4"
          placeholder="메시지를 입력하세요"
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button onClick={handleSend}>
          <img src={SendButtonImage} alt="전송" />
        </button>
      </div>
    </div>
  );
}
