import React, { useRef, useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useAuthFetch } from "../hooks/useAuthFetch";

import SendButtonImage from "../assets/images/chat-send-button.png";
import BackButtonImage from "../assets/images/back-button.png";
import ChatRankButtonImage from "../assets/images/chat-rank.png";
import ChatOptionImage from "../assets/images/chat-option.png";

const GATEWAY_SERVER_URL = "http://localhost:8072";
const CHAT_APISERVER_URL = "/chat-api-service";

export default function Chat() {
  const bottomRef = useRef(null);
  const navigate = useNavigate();
  const { auth, subscribe, publish } = useAuth(); // { accessToken, userId }
  const authFetch = useAuthFetch(); // 요청 할 때 401 뜨면 refresh

  const [messages, setMessages] = useState([]); // 메시지 저장 상태
  const [inputValue, setInputValue] = useState(""); // 사용자 입력 상태
  const { chatRoomId } = useParams(); // 채팅방 ID
  const [chatRoomTitle, setChatRoomTitle] = useState("");
  const [participationCount, setParticipationCount] = useState("");

  // 메시지 전송
  const sendMessage = () => {
    if (inputValue && publish(`/pub/chat.message.${chatRoomId}`, {
      messageType: "MESSAGE",
      content: inputValue,
      chatRoomId: chatRoomId,
      senderId: auth.userId,
    })) {
      setInputValue("");
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await authFetch(
        `${GATEWAY_SERVER_URL}${CHAT_APISERVER_URL}/api/chats/${chatRoomId}/messages/test`,
        {
          headers: {
            Authorization: `Bearer ${auth.accessToken}`,
            Accept: "application/json",
          },
        },
      );
      if (response.ok) {
        const data = await response.json();
        setMessages(data); // 기존 메시지 설정
        console.log("fetch successed.");
      } else {
        console.error("Failed to fetch messages:", response.status);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  // React 컴포넌트가 렌더링될 때 WebSocket 연결
  useEffect(() => {
    const subscription = subscribe(`/sub/chatroom${chatRoomId}`, (message) => {
      const newMessage = JSON.parse(message.body);
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    });
    fetchMessages(); // 기존 메시지 가져오기
    return () => subscription?.unsubscribe(); // 컴포넌트가 언마운트될 때 연결 해제
  }, [chatRoomId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView();
  }, [messages.length]);

  return (
    <div className="flex flex-col h-full tracking-tight">
      <div className="flex flex-row justify-between h-[56px] items-center">
        <div className="flex flex-row h-full items-center gap-1 p-4">
          <img
            src={BackButtonImage}
            alt="뒤로가기 버튼"
            className="w-5 h-5"
            onClick={() => navigate(-1)}
          ></img>
          <span className="text-xl font-bold px-2">
            {chatRoomTitle}무지출이 대세다
          </span>
          <span className="text-sm font-bold text-[#3C19B0]">
            {participationCount}35
          </span>
        </div>
        <div className="flex flex-row gap-3 h-full items-center p-4">
          <img
            src={ChatRankButtonImage}
            alt="채팅 랭크 이미지"
            className="w-4 h-6"
          ></img>
          <img
            src={ChatOptionImage}
            alt="채팅 옵션 이미지"
            className="w-5 h-4"
          ></img>
        </div>
      </div>
      {/* 메시지 영역 */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-3">
          {messages.map((msg, index) => {
            const isMyMessage = msg.senderId === auth.userId;
            const showProfile =
              !isMyMessage &&
              (index === 0 || messages[index - 1].senderId !== msg.senderId);

            const timestamp = (
              <div className="flex flex-col justify-end">
                {/* TODO: msg 타입에 따라서 형식 다르게 하기 */}
                {/* TODO: 날짜 텍스트 만들기(날짜 변경 후 첫번째 채팅이 오면 그 위에 적용) */}
                <div className="text-[#5B3FE7] text-[9px] leading-none">
                  {msg.unreadCount}
                </div>
                <div className="text-[9px]">
                  {new Date(msg.timestamp).toLocaleTimeString("ko-KR", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  })}
                </div>
              </div>
            );

            return (
              <div
                key={msg.id}
                className={`flex gap-2 ${showProfile && index !== 0 ? "mt-3" : "mt-1"} ${isMyMessage ? "justify-end" : ""}`}
              >
                {/* Profile Image - 내 메시지면 숨김 */}
                {!isMyMessage &&
                  (showProfile ? (
                    <div className="w-12 h-12 border rounded-2xl bg-red-400 shrink-0"></div>
                  ) : (
                    <div className="w-12 shrink-0"></div>
                  ))}

                <div className="flex flex-col gap-1 text-sm">
                  {/* User Name - 내 메시지면 숨김 */}
                  {showProfile && (
                    <div>
                      <strong>{msg.senderId}</strong>
                    </div>
                  )}

                  <div className="flex flex-row gap-2">
                    {/* 내 메시지면 timestamp가 버블 왼쪽 */}
                    {isMyMessage && timestamp}
                    {/* Message Content */}
                    <div
                      className={`px-3 py-2 border rounded-xl max-w-[300px] text-[16px] ${isMyMessage ? "bg-[#5B3FE7] text-white" : "bg-gray-50"}`}
                    >
                      {msg.content}
                    </div>
                    {/* 상대 메시지면 timestamp가 버블 오른쪽 */}
                    {!isMyMessage && timestamp}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div ref={bottomRef} />
      </div>

      {/* 입력 영역 */}
      <div className="flex flex-row justify-end py-2 px-4 gap-1">
        <input
          type="text"
          value={inputValue}
          className="w-[264px] h-[32px] border rounded-full px-3 py-4"
          placeholder="메시지를 입력하세요"
          onChange={(e) => setInputValue(e.target.value)}
        />
        <button onClick={sendMessage}>
          <img src={SendButtonImage} alt="전송"></img>
        </button>
      </div>
    </div>
  );
}
